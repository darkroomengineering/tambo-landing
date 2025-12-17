'use client'

import {
  TamboProvider,
  useTamboContextHelpers,
  useTamboThread,
} from '@tambo-ai/react'
import cn from 'clsx'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { mapExampleContext, seatExampleContext } from './(components)/context'
import { InterctableMap } from './(components)/map'
import { MapProvider, useMap } from './(components)/map/map-context'
import { MapSchema } from './(components)/map/schema'
import { useMapSearch } from './(components)/map/use-map-search'
import { SeatSelector } from './(components)/seat-selector'
import { SeatSelectorSchema } from './(components)/seat-selector/schema'
import { MessageThreadCollapsible } from './(components)/ui-tambo/message-thread-collapsible'
import { MessageThreadFull } from './(components)/ui-tambo/message-thread-full'

const introMessages = {
  travel:
    'You have to select your seat ASAP before the flight starts, do you want me to help you?',
  map: 'While your waiting for your flight, you can search for entrainment options in your destination, do you want me to help you?',
}

const components = [
  {
    name: 'seat-selector',
    description: 'A seat selector component',
    component: SeatSelector,
    propsSchema: SeatSelectorSchema,
  },
  {
    name: 'map',
    description:
      'A map component for selecting an area on a map and analyzing the area for things to do and add pins to the map',
    component: InterctableMap,
    propsSchema: MapSchema,
  },
]

export function TamboIntegration({ children }: { children: React.ReactNode }) {
  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
    >
      <MapProvider>
        <AssistantProvider> {children} </AssistantProvider>
      </MapProvider>
    </TamboProvider>
  )
}

export function AssistantNotifications({ className }: { className: string }) {
  const { finishSeatSelection, choosedSeat } = useAssitant()

  return (
    <ul
      className={cn(
        'flex flex-col dr-gap-8 border border-dark-grey dr-rounded-8 dr-p-16',
        className
      )}
    >
      <div className="typo-surtitle">Travel assistant</div>
      <li>
        <span className="typo-label-m">Hotel: </span>
        <span className="typo-label-s"> Booked</span>
      </li>
      <li>
        <span className="typo-label-m">Flight: </span>
        <span className="typo-label-s"> NYC La Guardia</span>
      </li>
      <li>
        <span className="typo-label-m">Seat selection: </span>
        <span className="typo-label-s">
          {choosedSeat.length > 0 ? choosedSeat.join(', ') : 'None'}
        </span>
        <button
          type="button"
          className="typo-label-s"
          onClick={() => finishSeatSelection('7E')}
        >
          Random seat
        </button>
      </li>
      <li>
        <span className="typo-label-m">Itinerary: </span>
        <span className="typo-label-s">Empty</span>
      </li>
    </ul>
  )
}

export function TravelAssistant() {
  const { selectedDemo } = useAssitant()
  const { addContextHelper, removeContextHelper } = useTamboContextHelpers()
  const { thread, addThreadMessage } = useTamboThread()

  useEffect(() => {
    if (selectedDemo === 'travel') {
      addContextHelper(
        'assistantBehavior',
        () =>
          `## Role\n${seatExampleContext.objective}\n\n## Instructions\n${seatExampleContext.instructions}`
      )
    }
    return () => removeContextHelper('assistantBehavior')
  }, [selectedDemo, addContextHelper, removeContextHelper])

  useEffect(() => {
    if (selectedDemo !== 'travel') return

    if (!thread?.messages?.length) {
      addThreadMessage(
        {
          id: 'welcome-message',
          role: 'assistant',
          content: [
            {
              type: 'text',
              text: introMessages[selectedDemo],
            },
          ],
          createdAt: new Date().toISOString(),
          threadId: thread.id,
          componentState: {},
        },
        false
      ) // false = don't send to server, just add locally
    }
  }, [thread?.messages?.length, selectedDemo, thread?.id, addThreadMessage])

  if (selectedDemo === 'map') return null
  return (
    <MessageThreadFull
      className="absolue z-1"
      contextKey={selectedDemo}
      variant="compact"
    />
  )
}

export function MapAssistant() {
  const { selectedDemo } = useAssitant()
  const { addContextHelper, removeContextHelper } = useTamboContextHelpers()
  const { thread, addThreadMessage } = useTamboThread()
  const { mapRef } = useMap()
  const [currentBBox, setCurrentBBox] = useState<{
    west: number
    east: number
    south: number
    north: number
  } | null>(null)

  // Enable map search - pass contextKey to listen to correct thread
  useMapSearch(selectedDemo)

  // Poll for bbox changes to update context helper
  useEffect(() => {
    if (selectedDemo !== 'map' || !mapRef.current) return

    const interval = setInterval(() => {
      const bbox = mapRef.current?.getCurrentBBox()
      if (bbox) {
        setCurrentBBox(bbox)
      } else {
        setCurrentBBox(null)
      }
    }, 500) // Check every 500ms

    return () => clearInterval(interval)
  }, [selectedDemo, mapRef])

  useEffect(() => {
    if (selectedDemo === 'map') {
      addContextHelper(
        'assistantBehavior',
        () =>
          `## Role\n${mapExampleContext.objective}\n\n## Instructions\n${mapExampleContext.instructions}`
      )

      // Add dynamic map context - updates when map state changes
      // This context helper is called by Tambo when generating responses, so it always gets the latest state
      addContextHelper('mapState', () => {
        // Always get fresh bbox when Tambo asks for context (not cached)
        const bbox = mapRef.current?.getCurrentBBox() || currentBBox
        if (!bbox) {
          return `The map is currently showing New York City, NY (default location). 

IMPORTANT: No area has been selected yet. The user needs to draw a rectangle on the map to select an area before you can help them search for things to do or points of interest.

If the user asks about the selected area or what they can do, politely remind them to first draw a rectangle on the map to select an area.`
        }

        // Calculate approximate center of bbox
        const centerLng = (bbox.west + bbox.east) / 2
        const centerLat = (bbox.south + bbox.north) / 2

        return `The user has selected an area on the map. Here are the details:

**Selected Area Coordinates:**
- Western boundary: ${bbox.west.toFixed(4)}° longitude
- Eastern boundary: ${bbox.east.toFixed(4)}° longitude  
- Southern boundary: ${bbox.south.toFixed(4)}° latitude
- Northern boundary: ${bbox.north.toFixed(4)}° latitude
- Approximate center: ${centerLng.toFixed(4)}° longitude, ${centerLat.toFixed(4)}° latitude

**What you can do:**
- When the user asks about things to do, places to visit, restaurants, cafes, or any points of interest in this area, you can help them search
- The map component will automatically search for points of interest when the user asks questions
- You can describe what types of activities or places might be available in this geographic area
- If the user asks "what can I do with this selection?" or similar questions, explain that they can search for entertainment options, restaurants, cafes, attractions, etc. in the selected area`
      })
    }
    return () => {
      removeContextHelper('assistantBehavior')
      removeContextHelper('mapState')
    }
  }, [selectedDemo, addContextHelper, removeContextHelper, mapRef, currentBBox])

  useEffect(() => {
    if (selectedDemo !== 'map') return

    if (!thread?.messages?.length) {
      addThreadMessage(
        {
          id: 'welcome-message',
          role: 'assistant',
          content: [
            {
              type: 'text',
              text: introMessages[selectedDemo],
            },
          ],
          createdAt: new Date().toISOString(),
          threadId: thread.id,
          componentState: {},
        },
        false
      ) // false = don't send to server, just add locally
    }
  }, [thread?.messages?.length, selectedDemo, thread?.id, addThreadMessage])

  if (selectedDemo === 'travel') return null
  return (
    <MessageThreadCollapsible
      contextKey={selectedDemo}
      variant="compact"
      defaultOpen={true}
      className="absolute dr-bottom-6 dr-right-4 dr-mr-8"
    />
  )
}

type Demo = 'travel' | 'map'
type Threads = [string | null, string | null]

const AssistantContext = createContext<{
  selectedDemo: Demo
  threads: Threads
  choosedSeat: string[]
  setSelectedDemo: React.Dispatch<React.SetStateAction<Demo>>
  setThreads: React.Dispatch<React.SetStateAction<Threads>>
  switchToTravelThread: () => void
  switchToMapThread: () => void
  finishSeatSelection: (seat: string) => void
}>({
  selectedDemo: 'travel',
  threads: [null, null],
  choosedSeat: [],
  setSelectedDemo: () => {
    // Default context value
  },
  setThreads: () => {
    // Default context value
  },
  switchToTravelThread: () => {
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
  const [selectedDemo, setSelectedDemo] = useState<Demo>('travel')
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

  const switchToTravelThread = useCallback(() => {
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
      setSelectedDemo('map')
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
        switchToTravelThread,
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
