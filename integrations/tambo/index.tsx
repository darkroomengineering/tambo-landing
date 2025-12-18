'use client'

import { TamboProvider, useTamboThread } from '@tambo-ai/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { MapProvider } from './(components)/map/map-context'
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
      <MapProvider>
        <AssistantProvider> {children} </AssistantProvider>
      </MapProvider>
    </TamboProvider>
  )
}

type Demo = (typeof DEMOS)[keyof typeof DEMOS]
type Threads = [string | null, string | null]

const AssistantContext = createContext<{
  selectedDemo: Demo
  threads: Threads
  choosedSeat: string[]
  setSelectedDemo: React.Dispatch<React.SetStateAction<Demo>>
  setThreads: React.Dispatch<React.SetStateAction<Threads>>
  switchToSeatThread: () => void
  switchToMapThread: () => void
  finishSeatSelection: (seat: string) => void
}>({
  selectedDemo: DEMOS.SEAT,
  threads: [null, null],
  choosedSeat: [],
  setSelectedDemo: () => {
    // Default context value
  },
  setThreads: () => {
    // Default context value
  },
  switchToSeatThread: () => {
    // Default context value
  },
  switchToMapThread: () => {
    // Default context value
  },
  finishSeatSelection: () => {
    // Default context value
  },
})

function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [selectedDemo, setSelectedDemo] = useState<Demo>(DEMOS.SEAT)
  const [choosedSeat, setChoosedSeat] = useState<string[]>([])
  const [threads, setThreads] = useState<Threads>([null, null])
  const { thread, startNewThread, switchCurrentThread } = useTamboThread()

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
        setSelectedDemo,
        setThreads,
        switchToSeatThread,
        switchToMapThread,
        finishSeatSelection,
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
