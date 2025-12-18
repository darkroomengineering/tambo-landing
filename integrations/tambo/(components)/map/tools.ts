import type { TamboTool } from '@tambo-ai/react'
import { z } from 'zod'
import type { AreaSelectMapHandle } from './area-select-map'

// Create a global reference to the map instance
// This will be set by the map component when it mounts
let mapInstanceRef: React.RefObject<AreaSelectMapHandle | null> | null = null

export function setMapRef(ref: React.RefObject<AreaSelectMapHandle | null>) {
  mapInstanceRef = ref
}

export function getMapRef() {
  return mapInstanceRef
}

// Tool 1: Search and display results on the map
const analyzeArea = async (params: { query: string }) => {
  const mapRef = getMapRef()

  if (!mapRef?.current) {
    throw new Error('Map is not initialized yet')
  }

  const bbox = mapRef.current.getCurrentBBox()

  if (!bbox) {
    throw new Error(
      'No area selected. Please draw a rectangle on the map first.'
    )
  }

  try {
    console.log(`🔍 Triggering map search for query: ${params.query}`)

    // Use the map's built-in search which handles displaying pins
    await mapRef.current.search(params.query)

    return {
      success: true,
      message: `Searched for "${params.query}" and displayed results on the map`,
    }
  } catch (error) {
    console.error(`❌ Search failed for query: ${params.query}`, error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to search area'
    )
  }
}

// Tool 2: Get current map state with location info
const getMapState = async () => {
  const mapRef = getMapRef()

  if (!mapRef?.current) {
    throw new Error('Map is not initialized yet')
  }

  const bbox = mapRef.current.getCurrentBBox()

  if (!bbox) {
    return {
      hasSelection: false,
      selectedArea: null,
      message: 'No area is selected. The user needs to draw a rectangle on the map first.',
    }
  }

  // Calculate center point and dimensions
  const centerLng = (bbox.west + bbox.east) / 2
  const centerLat = (bbox.south + bbox.north) / 2
  
  // Calculate approximate size in km
  const latDiff = bbox.north - bbox.south
  const lngDiff = bbox.east - bbox.west
  const heightKm = latDiff * 111 // ~111 km per degree latitude
  const widthKm = lngDiff * 111 * Math.cos(centerLat * Math.PI / 180)

  // Reverse geocode to get location name
  let locationName = 'Unknown location'
  try {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (mapboxToken) {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${centerLng},${centerLat}.json?access_token=${mapboxToken}&limit=1`
      )
      if (res.ok) {
        const data = await res.json()
        if (data.features?.[0]) {
          locationName = data.features[0].place_name
        }
      }
    }
  } catch (error) {
    console.warn('Could not reverse geocode location:', error)
  }

  return {
    hasSelection: true,
    selectedArea: bbox,
    location: {
      name: locationName,
      center: {
        lat: centerLat.toFixed(6),
        lng: centerLng.toFixed(6),
      },
      size: {
        width: `${widthKm.toFixed(2)} km`,
        height: `${heightKm.toFixed(2)} km`,
        area: `${(widthKm * heightKm).toFixed(2)} km²`,
      },
    },
    message: `Selected area in ${locationName}. Size: ${widthKm.toFixed(1)} × ${heightKm.toFixed(1)} km`,
  }
}

// Tool 3: Search for a location by name (geocoding)
const searchLocation = async (params: { location: string }) => {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!mapboxToken) {
    throw new Error('Mapbox token is not configured')
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(params.location)}.json?access_token=${mapboxToken}&limit=5`

    const res = await fetch(url)

    if (!res.ok) {
      throw new Error('Failed to search for location')
    }

    const data = await res.json()

    if (!data.features || data.features.length === 0) {
      return {
        found: false,
        message: `No locations found for "${params.location}"`,
        suggestions: [],
      }
    }

    type MapboxFeature = {
      place_name: string
      center: [number, number]
      bbox?: [number, number, number, number]
      place_type?: string[]
    }

    const results = data.features.map((feature: MapboxFeature) => ({
      name: feature.place_name,
      center: {
        lng: feature.center[0],
        lat: feature.center[1],
      },
      bbox: feature.bbox
        ? {
            west: feature.bbox[0],
            south: feature.bbox[1],
            east: feature.bbox[2],
            north: feature.bbox[3],
          }
        : null,
      placeType: feature.place_type?.[0] || 'place',
    }))

    return {
      found: true,
      message: `Found ${results.length} locations matching "${params.location}"`,
      results,
    }
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to search location'
    )
  }
}

// Tool 4: Get suggestions for what to search in an area
const getAreaSuggestions = async () => {
  const suggestions = [
    {
      category: 'Food & Drink',
      queries: ['coffee', 'restaurants', 'bars', 'cafes'],
    },
    { category: 'Tourism', queries: ['attractions', 'museums', 'sightseeing'] },
    {
      category: 'Entertainment',
      queries: ['entertainment', 'theaters', 'cinemas', 'nightlife'],
    },
    { category: 'Shopping', queries: ['shops', 'stores', 'shopping'] },
  ]

  return {
    message:
      'Here are some suggestions for what you can search for in the selected area',
    suggestions,
  }
}

export const mapTools: TamboTool[] = [
  {
    name: 'analyze_selected_area',
    description:
      'Search for places in the selected map area and display them as pins. Supports specific brands (e.g., "Starbucks", "McDonald\'s") or general categories (e.g., "coffee", "restaurants"). The user must draw a rectangle on the map first.',
    tool: analyzeArea,
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          'What to search for. Can be a specific brand like "Starbucks", "McDonald\'s", or a category like "coffee shops", "restaurants", "museums"'
        ),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  {
    name: 'get_map_state',
    description:
      'Get detailed information about the currently selected map area, including location name, coordinates, and size. Use this to verify the user has selected the correct area.',
    tool: getMapState,
    inputSchema: z.object({}),
    outputSchema: z.object({
      hasSelection: z.boolean(),
      selectedArea: z
        .object({
          west: z.number(),
          east: z.number(),
          south: z.number(),
          north: z.number(),
        })
        .nullable(),
      location: z
        .object({
          name: z.string(),
          center: z.object({
            lat: z.string(),
            lng: z.string(),
          }),
          size: z.object({
            width: z.string(),
            height: z.string(),
            area: z.string(),
          }),
        })
        .optional(),
      message: z.string(),
    }),
  },
  {
    name: 'search_location',
    description:
      'Search for a location by name (e.g., "New York City", "Paris, France", "Central Park") and get coordinates and bounding box',
    tool: searchLocation,
    inputSchema: z.object({
      location: z.string().describe('The location name to search for'),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      message: z.string(),
      results: z
        .array(
          z.object({
            name: z.string(),
            center: z.object({
              lng: z.number(),
              lat: z.number(),
            }),
            bbox: z
              .object({
                west: z.number(),
                south: z.number(),
                east: z.number(),
                north: z.number(),
              })
              .nullable(),
            placeType: z.string(),
          })
        )
        .optional(),
    }),
  },
  {
    name: 'get_area_suggestions',
    description:
      'Get suggestions for what types of places can be searched for in a map area',
    tool: getAreaSuggestions,
    inputSchema: z.object({}),
    outputSchema: z.object({
      message: z.string(),
      suggestions: z.array(
        z.object({
          category: z.string(),
          queries: z.array(z.string()),
        })
      ),
    }),
  },
]
