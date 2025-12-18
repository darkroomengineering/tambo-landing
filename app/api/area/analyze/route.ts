import { NextResponse } from 'next/server'

type BBox = { west: number; south: number; east: number; north: number }

// Extract brand/specific name from query
function extractBrandName(query: string): string | null {
  // Common brand patterns
  const brandPatterns = [
    /(?:only\s+)?(\w+)\s+(?:coffee|cafe|restaurant|store|shop)/i,
    /(?:find|show|search)\s+(?:me\s+)?(?:only\s+)?(\w+)/i,
    /^(\w+)$/, // Single word queries
  ]

  for (const pattern of brandPatterns) {
    const match = query.match(pattern)
    if (match?.[1]) {
      const brand = match[1].toLowerCase()
      // Filter out generic terms
      if (
        !['the', 'a', 'an', 'all', 'any', 'some', 'only', 'just'].includes(
          brand
        )
      ) {
        return match[1]
      }
    }
  }

  return null
}

// Map queries to OpenStreetMap tags
// Since we now have brand filtering, we can be broad here
function getOSMTags(query: string): string[] {
  const q = query.toLowerCase()

  // Just detect the broad category - brand filtering will handle specifics
  if (q.includes('coffee') || q.includes('cafe') || q.includes('café')) {
    return ['amenity=cafe', 'amenity=coffee_shop']
  }

  if (q.includes('restaurant') || q.includes('food') || q.includes('eat')) {
    return ['amenity=restaurant', 'amenity=fast_food']
  }

  if (q.includes('bar') || q.includes('pub') || q.includes('drink')) {
    return ['amenity=bar', 'amenity=pub']
  }

  if (q.includes('shop') || q.includes('store')) {
    return ['shop']
  }

  if (
    q.includes('museum') ||
    q.includes('attraction') ||
    q.includes('tourist')
  ) {
    return ['tourism']
  }

  // Default: search for food & drink (most common use case)
  // Brand filtering will narrow it down
  return ['amenity=cafe', 'amenity=restaurant', 'amenity=fast_food']
}

function buildOverpassQuery(tags: string[], bbox: BBox): string {
  const { west, south, east, north } = bbox

  const queries = tags.map((tag) => {
    if (tag.includes('=')) {
      const [key, value] = tag.split('=')
      return `
  node["${key}"="${value}"](${south},${west},${north},${east});
  way["${key}"="${value}"](${south},${west},${north},${east});
  relation["${key}"="${value}"](${south},${west},${north},${east});`
    }
    // For tags without values (like "shop", "tourism")
    return `
  node["${tag}"](${south},${west},${north},${east});
  way["${tag}"](${south},${west},${north},${east});
  relation["${tag}"](${south},${west},${north},${east});`
  })

  return `
[out:json][timeout:60];
(${queries.join('')}
);
out center tags;
`.trim()
}

export async function POST(req: Request) {
  const body = (await req.json()) as { bbox: BBox; query?: string }
  const { west, south, east, north } = body.bbox
  const query = body.query || ''

  const tags = getOSMTags(query)
  const overpassQuery = buildOverpassQuery(tags, { west, south, east, north })

  // Add timeout to fetch request (70 seconds - slightly longer than Overpass timeout)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 70000)

  try {
    const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!overpassRes.ok) {
      const text = await overpassRes.text()
      console.error('❌ Overpass error:', text)

      // Check if it's a timeout error
      if (text.includes('timeout') || text.includes('too busy')) {
        return NextResponse.json(
          {
            error:
              'The map service is currently busy. Please try again in a moment.',
            details: 'The OpenStreetMap server is temporarily overloaded.',
          },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: 'Map search failed', details: text },
        { status: 502 }
      )
    }

    const overpassData = await overpassRes.json()

    let items = (overpassData.elements ?? []).map(
      (el: {
        id: number
        type: string
        lat?: number
        lon?: number
        center?: { lat: number; lon: number }
        tags?: Record<string, string>
      }) => {
        const lat = el.lat ?? el.center?.lat
        const lon = el.lon ?? el.center?.lon
        return {
          id: el.id,
          type: el.type,
          name: el.tags?.name ?? null,
          lat,
          lon,
          tags: el.tags ?? {},
        }
      }
    )

    // Filter by brand name if a specific brand was requested
    const brandName = extractBrandName(query)
    if (brandName) {
      const brandLower = brandName.toLowerCase()

      // Simple fuzzy matching: allow 1-2 character differences for typos
      items = items.filter((item: { name: string | null }) => {
        if (!item.name) return false
        const nameLower = item.name.toLowerCase()

        // Exact substring match (fast path)
        if (nameLower.includes(brandLower)) return true

        // Fuzzy match: check if the brand is "close enough"
        // Remove common suffixes and check similarity
        const nameWords = nameLower.replace(/[''\s-]/g, '').toLowerCase()
        const brandWords = brandLower.replace(/[''\s-]/g, '').toLowerCase()

        // Check if either contains most of the other (handles typos)
        return (
          nameWords.includes(brandWords.slice(0, -1)) || // missing last char
          nameWords.includes(brandWords.slice(1)) || // missing first char
          brandWords.includes(nameWords.slice(0, -1)) ||
          brandWords.includes(nameWords.slice(1))
        )
      })

      console.log(
        `🔍 Filtered to "${brandName}": ${items.length} matches (from ${(overpassData.elements ?? []).length} total)`
      )
    }

    const result = {
      area: {
        bbox: body.bbox,
      },
      points_of_interest: {
        items,
      },
    }

    // ✅ Console log on server
    console.log(`📍 Found POIs for query "${query}": ${items.length}`)

    return NextResponse.json(result)
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ Overpass request timeout')
      return NextResponse.json(
        {
          error: 'Request timeout. The map service took too long to respond.',
          details: 'Please try a smaller area or try again later.',
        },
        { status: 504 }
      )
    }

    console.error('❌ Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
