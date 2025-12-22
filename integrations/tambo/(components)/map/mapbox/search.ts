import mapboxgl from 'mapbox-gl'
import { useEffect, useEffectEvent } from 'react'
import { type BBox, useAssitant } from '~/integrations/tambo'
import type { POI } from './'
import { getGeoJSONSource } from './'
import { fetchWithRetry, updateMapPOIs } from './api'
import {
  type SearchParams,
  type SearchResult,
  useMapSearchListener,
} from './events'

type AreaAnalyzeResponse = {
  area: { bbox: BBox }
  points_of_interest: { items: POI[] }
}

export function useMapSearch({
  center,
  onResult,
}: {
  center: [number, number]
  onResult?: (result: AreaAnalyzeResponse) => void
}) {
  const { map, currentBBox } = useAssitant()

  const handleSearch = useEffectEvent(
    async (params: SearchParams): Promise<SearchResult> => {
      if (!map) {
        throw new Error('Map is not initialized. Please wait for it to load.')
      }

      const bbox = currentBBox
      if (!bbox) {
        throw new Error(
          'No area selected. Please draw a rectangle on the map first.'
        )
      }

      const result = await fetchWithRetry<AreaAnalyzeResponse>(
        '/api/area/analyze',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bbox,
            category: params.category,
            brandFilter: params.brandFilter,
          }),
        }
      )

      if (!result.ok) {
        throw new Error(result.error || 'Search failed')
      }

      const pois = result.data.points_of_interest?.items ?? []

      updateMapPOIs(map, pois, getGeoJSONSource, poisToFeatureCollection)
      onResult?.(result.data)

      // Return search results to the tool
      return {
        count: pois.length,
        names: pois
          .slice(0, 5)
          .map((p) => p.name)
          .filter((name): name is string => name !== null),
      }
    }
  )

  // Map Sources and Layers Setup
  useEffect(() => {
    if (!map) return

    map.dragPan.disable()
    map.doubleClickZoom.disable()

    // Attribution can't be removed; compact is allowed
    map.addControl(new mapboxgl.AttributionControl({ compact: true }))
    new mapboxgl.Marker().setLngLat(center).addTo(map)

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
  }, [map, center])

  // Listen for search events from tools
  useMapSearchListener(handleSearch)

  return { handleSearch }
}

function poisToFeatureCollection(pois: POI[]) {
  return {
    type: 'FeatureCollection' as const,
    features: pois
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))
      .map((p) => ({
        type: 'Feature' as const,
        id: p.id,
        properties: { name: p.name ?? 'Point of interest' },
        geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] },
      })),
  }
}
