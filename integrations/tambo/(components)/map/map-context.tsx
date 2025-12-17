'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'
import type { AreaSelectMapHandle } from './area-select-map'

type MapContextValue = {
  mapRef: React.RefObject<AreaSelectMapHandle | null>
}

const MapContext = createContext<MapContextValue | null>(null)

export function MapProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<AreaSelectMapHandle | null>(null)

  return (
    <MapContext.Provider value={{ mapRef }}>{children}</MapContext.Provider>
  )
}

export function useMap() {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error('useMap must be used within a MapProvider')
  }
  return context
}

