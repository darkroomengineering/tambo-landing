'use client'

import { TamboProvider, useTamboThread } from '@tambo-ai/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { mapTools } from './(components)/map/tools'
import { seatComponent } from './(components)/seat-selector/schema'
import { DEMOS } from './constants'

const components = [...seatComponent]
const tools = [...mapTools]

export function TamboIntegration({ children }: { children: React.ReactNode }) {
  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
    >
      <AssistantProvider> {children} </AssistantProvider>
    </TamboProvider>
  )
}

type Demo = (typeof DEMOS)[keyof typeof DEMOS]
type Threads = [string | null, string | null]
export type BBox = { west: number; south: number; east: number; north: number }

const AssistantContext = createContext<{
  // Main
  selectedDemo: Demo
  threads: Threads
  // Seat
  choosedSeat: string[]
  // Map
  map: mapboxgl.Map | undefined
  currentBBox: BBox | null
  setSelectedDemo: React.Dispatch<React.SetStateAction<Demo>>
  setThreads: React.Dispatch<React.SetStateAction<Threads>>
  setMap: React.Dispatch<React.SetStateAction<mapboxgl.Map | undefined>>
  setCurrentBBox: React.Dispatch<React.SetStateAction<BBox | null>>
  switchToSeatThread: () => void
  switchToMapThread: () => void
  finishSeatSelection: (seat: string) => void
}>({
  selectedDemo: DEMOS.SEAT,
  threads: [null, null],
  choosedSeat: [],
  map: undefined,
  currentBBox: null,
  setSelectedDemo: () => {},
  setThreads: () => {},
  setMap: () => {},
  setCurrentBBox: () => {},
  switchToSeatThread: () => {},
  switchToMapThread: () => {},
  finishSeatSelection: () => {},
})

function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [selectedDemo, setSelectedDemo] = useState<Demo>(DEMOS.SEAT)
  const [threads, setThreads] = useState<Threads>([null, null])
  const { thread, startNewThread, switchCurrentThread } = useTamboThread()
  const [choosedSeat, setChoosedSeat] = useState<string[]>([])
  const [map, setMap] = useState<mapboxgl.Map | undefined>(undefined)
  const [currentBBox, setCurrentBBox] = useState<{
    west: number
    east: number
    south: number
    north: number
  } | null>(null)

  useEffect(() => {
    setThreads((prev: Threads) => {
      // On first render, save the travel thread
      if (prev[0] === null || prev[0] === 'placeholder') {
        return [thread.id, null]
      }

      // If the map thread is created, save it
      if (
        prev[1] === null &&
        thread.id !== prev[0] &&
        thread.id !== 'placeholder'
      ) {
        return [prev[0], thread.id]
      }

      return prev
    })
  }, [thread?.id])

  const switchToSeatThread = useCallback(() => {
    if (threads[0]) {
      switchCurrentThread(threads[0])
    }
  }, [threads, switchCurrentThread])

  const switchToMapThread = useCallback(() => {
    if (threads[1] === null) {
      startNewThread()
    } else {
      switchCurrentThread(threads[1])
    }
  }, [threads, switchCurrentThread, startNewThread])

  const finishSeatSelection = useCallback(
    (seat: string) => {
      setSelectedDemo(DEMOS.MAP)
      switchToMapThread()
      setChoosedSeat([seat])
    },
    [switchToMapThread]
  )

  return (
    <AssistantContext.Provider
      value={{
        selectedDemo,
        threads,
        choosedSeat,
        map,
        currentBBox,
        setSelectedDemo,
        setThreads,
        switchToSeatThread,
        switchToMapThread,
        setMap,
        finishSeatSelection,
        setCurrentBBox,
      }}
    >
      {children}
    </AssistantContext.Provider>
  )
}

export const useAssitant = () => {
  const context = useContext(AssistantContext)
  if (!context) {
    throw new Error('useAssistant must be used within a AssistantProvider')
  }
  return context
}
