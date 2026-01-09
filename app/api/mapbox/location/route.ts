import { NextResponse } from 'next/server'
import { fetchWithTimeout } from '~/libs/fetch-with-timeout'

type MapboxFeature = {
  place_name: string
  center: [number, number]
  bbox?: [number, number, number, number]
  place_type?: string[]
}

type MapboxGeocodingResponse = {
  type: string
  features: MapboxFeature[]
  attribution: string
}

export async function GET(request: Request) {
  const mapboxToken = process.env.MAPBOX_TOKEN

  if (!mapboxToken) {
    return NextResponse.json(
      { error: 'Mapbox token is not configured' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json(
      { error: 'Missing required parameter: query' },
      { status: 400 }
    )
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&limit=5`

  try {
    const response = await fetchWithTimeout(url, {
      timeout: 10000,
      method: 'GET',
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('Mapbox Geocoding error:', text)

      return NextResponse.json(
        { error: 'Failed to search for location', details: text },
        { status: response.status }
      )
    }

    const data: MapboxGeocodingResponse = await response.json()

    if (!data.features || data.features.length === 0) {
      return NextResponse.json({
        found: false,
        message: `No locations found for "${query}"`,
        results: [],
      })
    }

    const results = data.features.map((feature) => ({
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

    return NextResponse.json({
      found: true,
      results,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Mapbox Geocoding request timeout')
      return NextResponse.json(
        {
          error: 'Request timeout',
          details: 'The geocoding service took too long to respond',
        },
        { status: 504 }
      )
    }

    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Failed to search for location',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
