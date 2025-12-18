'use client'

import mapboxgl from 'mapbox-gl'
import {
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { fetchWithRetry, updateMapPOIs } from './api'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

export type BBox = { west: number; south: number; east: number; north: number }
export type POI = {
  id: number
  type: string
  name: string | null
  lat: number
  lon: number
  tags: Record<string, unknown>
}
export type AreaSelectMapHandle = {
  search: (query: string) => Promise<void>
  getCurrentBBox: () => BBox | null
}
type AreaAnalyzeResponse = {
  area: { bbox: BBox }
  points_of_interest: { items: POI[] }
}
type Props = {
  className?: string
  height?: number | string
  pinSvgPath?: string
  fallbackZoom?: number
  initialCenter?: [number, number] // [lng, lat]
  initialBBox?: BBox // Initial bounding box to display
  onResult?: (result: AreaAnalyzeResponse) => void
  onBBoxSelected?: (bbox: BBox) => void
  ref?: React.RefObject<AreaSelectMapHandle>
}

const DEFAULT_CENTER: [number, number] = [-74.00594, 40.71278] // NYC [lng, lat]

export function AreaSelectMap({
  className,
  height = 520,
  fallbackZoom = 12,
  initialCenter,
  onResult,
  onBBoxSelected,
  ref,
}: Props) {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  const startRef = useRef<mapboxgl.LngLat | null>(null)
  const drawingRef = useRef(false)

  // Store current bbox
  const currentBBoxRef = useRef<BBox | null>(null)

  const { containerRef: freezeContainerRef } = useFreezeScroll()
  const { panModeRef } = useMapPanMode({ map })

  // Drawing interaction handlers (stable references via useEffectEvent)
  const handleDrawStart = useEffectEvent((e: mapboxgl.MapMouseEvent) => {
    if (!map || e.originalEvent.button !== 0) return
    if (isClickOnPOI(map, e.point)) return

    if (isPanModeActive(e, panModeRef)) {
      map.dragPan.enable()
      return
    }

    drawingRef.current = true
    startRef.current = e.lngLat

    clearGeoJSONSource(map, 'selection')
    clearGeoJSONSource(map, 'pois')

    map.dragPan.disable()
    map.getCanvas().style.cursor = 'crosshair'
    e.preventDefault()
  })

  const handleDrawMove = useEffectEvent((e: mapboxgl.MapMouseEvent) => {
    if (!(map && drawingRef.current && startRef.current)) return

    const bbox = bboxFromLngLats(startRef.current, e.lngLat)
    const poly = bboxToPolygonFeature(bbox)
    getGeoJSONSource(map, 'selection')?.setData({
      type: 'FeatureCollection',
      features: [poly],
    })
  })

  const handleDrawEnd = useEffectEvent((e: mapboxgl.MapMouseEvent) => {
    if (!(map && drawingRef.current && startRef.current)) return

    drawingRef.current = false
    const bbox = bboxFromLngLats(startRef.current, e.lngLat)
    startRef.current = null

    map.getCanvas().style.cursor = ''
    currentBBoxRef.current = bbox

    logBBoxSelection(bbox)
    onBBoxSelected?.(bbox)

    if (!isPanModeActive(e, panModeRef)) {
      map.dragPan.disable()
    }
  })

  const handleSearch = useEffectEvent(async (query: string) => {
    const bbox = currentBBoxRef.current
    if (!bbox) {
      console.warn('No area selected. Please draw a rectangle first.')
      return
    }

    const result = await fetchWithRetry<AreaAnalyzeResponse>(
      '/api/area/analyze',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bbox, query }),
      }
    )

    if (!result.ok) {
      console.error('Search failed:', result.error)
      return
    }

    const pois = result.data.points_of_interest?.items ?? []
    console.log(`🗺️ Updating map with ${pois.length} POIs for query: "${query}"`)

    updateMapPOIs(map, pois, getGeoJSONSource, poisToFeatureCollection)
    onResult?.(result.data)
  })

  // Map Initialization
  useEffect(() => {
    if (mapRef.current) return
    if (!containerRef.current) return
    if (containerRef.current.querySelector('.mapboxgl-map')) return

    const center: [number, number] = initialCenter ?? DEFAULT_CENTER
    const zoom = fallbackZoom

    console.log('📍 Using location:', { lng: center[0], lat: center[1] })

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom,
    })

    mapRef.current = map
    setMap(map)

    map.on('load', () => {
      setIsMapLoaded(true)
    })

    return () => {
      setIsMapLoaded(false)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [fallbackZoom, initialCenter?.[0], initialCenter?.[1]])

  // Map Sources and Layers Setup
  useEffect(() => {
    if (!(map && isMapLoaded)) return

    // Default: draw mode (no pan until Cmd/Ctrl)
    map.dragPan.disable()

    // Prevent double click zoom
    map.doubleClickZoom.disable()

    // Attribution can't be removed; compact is allowed
    map.addControl(new mapboxgl.AttributionControl({ compact: true }))

    // Marker for initial center
    const center: [number, number] = initialCenter ?? DEFAULT_CENTER
    new mapboxgl.Marker().setLngLat(center).addTo(map)

    // Add GeoJSON sources
    map.addSource('selection', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    })

    map.addSource('pois', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    })

    map.addLayer({
      id: 'pois-points',
      type: 'circle',
      source: 'pois',
      paint: {
        'circle-radius': 8,
        'circle-color': '#ef4444',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })

    map.addLayer({
      id: 'pois-labels',
      type: 'symbol',
      source: 'pois',
      layout: {
        'text-field': ['get', 'name'],
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
        'text-size': 12,
      },
      paint: {
        'text-color': '#1f2937',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1,
      },
    })

    // Selection layers (visible rectangle)
    map.addLayer({
      id: 'selection-fill',
      type: 'fill',
      source: 'selection',
      paint: {
        'fill-color': '#22c55e',
        'fill-opacity': 0.25,
      },
    })

    map.addLayer({
      id: 'selection-line',
      type: 'line',
      source: 'selection',
      paint: {
        'line-color': '#16a34a',
        'line-width': 3,
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
    })
  }, [map, isMapLoaded, initialCenter?.[0], initialCenter?.[1]])

  // Drawing interaction event listeners
  useEffect(() => {
    if (!(map && isMapLoaded)) return

    map.on('mousedown', handleDrawStart)
    map.on('mousemove', handleDrawMove)
    map.on('mouseup', handleDrawEnd)

    return () => {
      map.off('mousedown', handleDrawStart)
      map.off('mousemove', handleDrawMove)
      map.off('mouseup', handleDrawEnd)
    }
  }, [map, isMapLoaded])

  useImperativeHandle(ref, () => ({
    search: handleSearch,
    getCurrentBBox: () => currentBBoxRef.current,
  }))

  return (
    <div className={className} style={{ width: '100%' }}>
      <div
        ref={(el: HTMLDivElement | null) => {
          containerRef.current = el
          freezeContainerRef.current = el
        }}
        style={{ height, width: '100%' }}
      />
    </div>
  )
}

function bboxFromLngLats(a: mapboxgl.LngLat, b: mapboxgl.LngLat): BBox {
  return {
    west: Math.min(a.lng, b.lng),
    east: Math.max(a.lng, b.lng),
    south: Math.min(a.lat, b.lat),
    north: Math.max(a.lat, b.lat),
  }
}

/** Create a GeoJSON polygon feature from a bounding box */
function bboxToPolygonFeature(bbox: BBox) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [bbox.west, bbox.south],
          [bbox.east, bbox.south],
          [bbox.east, bbox.north],
          [bbox.west, bbox.north],
          [bbox.west, bbox.south],
        ],
      ],
    },
  }
}

/** Log bbox selection details to console */
function logBBoxSelection(bbox: BBox): void {
  const centerLng = (bbox.west + bbox.east) / 2
  const centerLat = (bbox.south + bbox.north) / 2
  const widthKm = (
    (bbox.east - bbox.west) *
    111 *
    Math.cos((centerLat * Math.PI) / 180)
  ).toFixed(2)
  const heightKm = ((bbox.north - bbox.south) * 111).toFixed(2)

  console.log('📍 Area selected:', {
    center: `${centerLat.toFixed(4)}°N, ${centerLng.toFixed(4)}°E`,
    size: `${widthKm} × ${heightKm} km`,
    bounds: {
      north: bbox.north.toFixed(4),
      south: bbox.south.toFixed(4),
      east: bbox.east.toFixed(4),
      west: bbox.west.toFixed(4),
    },
  })
}

// Drawing interaction helpers
const EMPTY_FEATURE_COLLECTION: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
}

function getGeoJSONSource(
  map: mapboxgl.Map,
  id: string
): mapboxgl.GeoJSONSource | undefined {
  return map.getSource(id) as mapboxgl.GeoJSONSource | undefined
}

function clearGeoJSONSource(map: mapboxgl.Map, id: string): void {
  getGeoJSONSource(map, id)?.setData(EMPTY_FEATURE_COLLECTION)
}

function isClickOnPOI(map: mapboxgl.Map, point: mapboxgl.Point): boolean {
  const poiLayers = ['pois-points', 'pois-points-selected', 'pois-labels']
  const existingLayers = poiLayers.filter((id) => map.getLayer(id))
  if (existingLayers.length === 0) return false
  return map.queryRenderedFeatures(point, { layers: existingLayers }).length > 0
}

function isPanModeActive(
  e: mapboxgl.MapMouseEvent,
  panModeRef: React.RefObject<boolean>
): boolean {
  return (
    e.originalEvent.metaKey ||
    e.originalEvent.ctrlKey ||
    panModeRef.current === true
  )
}

function poisToFeatureCollection(pois: POI[]) {
  return {
    type: 'FeatureCollection' as const,
    features: pois
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))
      .map((p) => {
        // Try to get name from various possible fields in tags
        let displayName: string | null = p.name
        if (!displayName && p.tags) {
          // Common OSM name fields - ensure they're strings
          const getStringTag = (key: string): string | null => {
            const value = p.tags[key]
            return typeof value === 'string' ? value : null
          }

          displayName =
            getStringTag('name') ||
            getStringTag('name:en') ||
            getStringTag('name:es') ||
            getStringTag('name:fr') ||
            getStringTag('name:de') ||
            getStringTag('alt_name') ||
            getStringTag('official_name') ||
            // Try to infer from amenity/leisure/shop type
            getStringTag('amenity') ||
            getStringTag('leisure') ||
            getStringTag('shop') ||
            getStringTag('tourism') ||
            null
        }

        return {
          type: 'Feature' as const,
          id: p.id,
          properties: { name: displayName ?? 'Point of interest' },
          geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] },
        }
      }),
  }
}

function useFreezeScroll() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Prevent page scroll when using mouse wheel on map (allow map zoom only)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Check if event is from Mapbox canvas (let it handle zoom)
      const target = e.target as HTMLElement
      const isMapboxCanvas =
        target.tagName === 'CANVAS' &&
        (target.classList.contains('mapboxgl-canvas') ||
          container.querySelector('.mapboxgl-canvas') === target)

      // If it's on the Mapbox canvas, let Mapbox handle it for zoom
      // but still prevent page scroll by preventing default
      if (isMapboxCanvas) {
        e.preventDefault()
        return
      }

      // For other elements in the container, prevent page scroll
      e.preventDefault()
      e.stopPropagation()
    }

    // Use bubble phase so Mapbox can handle canvas events first
    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return { containerRef }
}

function useMapPanMode({ map }: { map: mapboxgl.Map | null }) {
  const panModeRef = useRef(false)

  useEffect(() => {
    const setPanMode = (enabled: boolean) => {
      panModeRef.current = enabled
      if (!map) return

      if (enabled) {
        map.dragPan.enable()
        map.getCanvas().style.cursor = 'grab'
      } else {
        map.dragPan.disable()
        map.getCanvas().style.cursor = ''
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Control') setPanMode(true)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Control') setPanMode(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [map])

  return { panModeRef }
}
