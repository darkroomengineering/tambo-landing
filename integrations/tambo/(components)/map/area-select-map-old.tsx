'use client'

import { useLenis } from 'lenis/react'
import mapboxgl from 'mapbox-gl'
import {
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useAssitant } from '~/integrations/tambo'
import { useRectangleMapDrawing } from './map-drawing'
import { fetchWithRetry, updateMapPOIs } from './mapbox/api'

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
  center?: [number, number] // [lng, lat]
  initialBBox?: BBox // Initial bounding box to display
  onResult?: (result: AreaAnalyzeResponse) => void
  onBBoxSelected?: (bbox: BBox) => void
  ref?: React.RefObject<AreaSelectMapHandle>
}

const DEFAULT_CENTER: [number, number] = [-74.00594, 40.71278] // NYC [lng, lat]

export function AreaSelectMapOld({
  className,
  height = 520,
  fallbackZoom = 12,
  center = DEFAULT_CENTER,
  onResult,
  onBBoxSelected,
  ref,
}: Props) {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const { map, setMap } = useAssitant()
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  const startRef = useRef<mapboxgl.LngLat | null>(null)
  const drawingRef = useRef(false)

  // Store current bbox
  const currentBBoxRef = useRef<BBox | null>(null)

  const { panModeRef } = useMapPanMode({ map: map ?? null })

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
  }, [fallbackZoom, center])

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
  }, [map, isMapLoaded, center?.[0], center?.[1]])

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
        }}
        style={{ height, width: '100%' }}
      />
    </div>
  )
}

// Drawing interaction helpers

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

// HOOKS
export function useMapPanMode() {
  const [panMode, setPanMode] = useState(false)
  const { map } = useAssitant()

  useEffect(() => {
    function onKeyChange(enabled: boolean) {
      setPanMode(enabled)
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
      if (e.key === 'Meta' || e.key === 'Control') onKeyChange(true)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Control') onKeyChange(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [map])

  return panMode
}
