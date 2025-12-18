import type { POI } from './area-select-map'

// Retry configuration
const RETRY_STATUS_CODES = [503, 504]
const MAX_RETRIES = 3
const MAX_RETRY_DELAY = 5000

function getRetryDelay(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY)
}

function isRetryableStatus(status: number): boolean {
  return RETRY_STATUS_CODES.includes(status)
}

export type FetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit
): Promise<FetchResult<T>> {
  let lastError = 'Unknown error'

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, options)

      if (res.ok) {
        return { ok: true, data: await res.json() }
      }

      const errorData = await res
        .json()
        .catch(() => ({ error: 'Unknown error' }))
      lastError = errorData.error || `HTTP ${res.status}`

      if (isRetryableStatus(res.status) && attempt < MAX_RETRIES - 1) {
        const delay = getRetryDelay(attempt)
        console.warn(
          `Service busy (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying in ${delay}ms...`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      return { ok: false, error: lastError }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)

      if (attempt < MAX_RETRIES - 1) {
        const delay = getRetryDelay(attempt)
        console.warn(
          `Request failed (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying in ${delay}ms...`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  return { ok: false, error: lastError }
}

export function updateMapPOIs(
  map: mapboxgl.Map | null,
  pois: POI[],
  getGeoJSONSource: (
    map: mapboxgl.Map,
    id: string
  ) => mapboxgl.GeoJSONSource | undefined,
  poisToFeatureCollection: (pois: POI[]) => GeoJSON.FeatureCollection
): void {
  if (!map) return

  const poiSrc = getGeoJSONSource(map, 'pois')
  if (!poiSrc) {
    console.error('❌ POI source not found on map')
    return
  }

  const featureCollection = poisToFeatureCollection(pois)
  console.log(`📍 Setting ${featureCollection.features.length} features on map`)
  poiSrc.setData(featureCollection)
}
