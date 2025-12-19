import { useEffect, useEffectEvent } from 'react'

export const MAP_SEARCH_EVENT = 'tambo:map:search'

type SearchEventDetail = {
  query: string
  resolve: () => void
  reject: (error: Error) => void
}

/**
 * Dispatch a search request to the map component.
 * Returns a promise that resolves when the search completes.
 */
export function dispatchMapSearch(query: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const detail: SearchEventDetail = { query, resolve, reject }
    window.dispatchEvent(new CustomEvent(MAP_SEARCH_EVENT, { detail }))
  })
}

/**
 * Hook to listen for map search events.
 * Calls the handler when a search event is dispatched and resolves/rejects the promise.
 */
export function useMapSearchListener(
  handler: (query: string) => Promise<void>
) {
  const stableHandler = useEffectEvent(async (event: Event) => {
    const { query, resolve, reject } = (event as CustomEvent<SearchEventDetail>)
      .detail

    try {
      await handler(query)
      resolve()
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)))
    }
  })

  useEffect(() => {
    window.addEventListener(MAP_SEARCH_EVENT, stableHandler)
    return () => window.removeEventListener(MAP_SEARCH_EVENT, stableHandler)
  }, [])
}
