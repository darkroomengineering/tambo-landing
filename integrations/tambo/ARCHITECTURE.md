# Tambo Integration Architecture Guide

This document provides a comprehensive overview of how the Tambo AI integration is built, including patterns for tools, components, state management, and communication between layers. Use this as a reference when fixing bugs or adding new functionality.

---

## Table of Contents

1. [How the Assistant Works (Big Picture)](#1-how-the-assistant-works-big-picture)
2. [State Management](#2-state-management)
3. [Tool-to-Component Communication](#3-tool-to-component-communication)
4. [File Organization](#4-file-organization)
5. [Quick Reference](#5-quick-reference)

---

## 1. How the Assistant Works (Big Picture)

The Tambo AI assistant is a context-aware system that combines **global context**, **local context**, **tools**, and **components** to provide intelligent, interactive experiences.

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              TamboProvider                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                         AssistantProvider                              │  │
│  │  ┌───────────────┐  ┌────────────────┐  ┌───────────────────────────┐  │  │
│  │  │ Global Context│  │ Local Context  │  │         Tools             │  │  │
│  │  │ (userTime)    │  │ (per demo)     │  │ (API calls + events)      │  │  │
│  │  └───────────────┘  └────────────────┘  └───────────────────────────┘  │  │
│  │          │                  │                       │                  │  │
│  │          ▼                  ▼                       ▼                  │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │                     AI Assistant Brain                           │  │  │
│  │  │  • Understands current date/time (global)                        │  │  │
│  │  │  • Knows destination, weather, map state (local)                 │  │  │
│  │  │  • Can search locations, get weather, analyze areas (tools)      │  │  │
│  │  │  • Can render seat selector, map components (components)         │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                 │                                      │  │
│  │                                 ▼                                      │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │                   React Components (UI)                          │  │  │
│  │  │  • SeatMap (with useTamboComponentState for bi-directional)      │  │  │
│  │  │  • MapBox (with useMapSearchListener for tool events)            │  │  │
│  │  │  • Chat thread (MessageThreadCollapsible)                        │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Context Layers

The assistant receives context at multiple levels:

| Context Type | Scope | Example | How It's Set |
|--------------|-------|---------|--------------|
| Global | Always available | Current date/time | `contextHelpers` in TamboProvider |
| Local | Per demo/feature | Map bounding box, itinerary | `useTamboContextHelpers` dynamically |
| Component | Per rendered component | Selected seats | `useTamboComponentState` bi-directional |

### Demo Flow: Seat Selection → Map Exploration

This shows how the assistant uses different contexts and tools across the demo:

```
┌───────────────────────────────────────────────────────────────────────────┐
│ SEAT SELECTION DEMO                                                       │
├───────────────────────────────────────────────────────────────────────────┤
│ Context:                                                                  │
│   • Global: userTime (current date)                                       │
│   • Local: seatExampleContext (instructions for seat selection)           │
│                                                                           │
│ Tools:                                                                    │
│   • get-airplane-seats → returns seat data (prices, availability)         │
│                                                                           │
│ Component:                                                                │
│   • SeatMap with useTamboComponentState:                                  │
│     - assistantHighlightedSeats (AI recommends)                           │
│     - userSelectedSeats (user picks)                                      │
│                                                                           │
│ Flow:                                                                     │
│   1. User: "I want a window seat under $50"                               │
│   2. AI calls get-airplane-seats tool                                     │
│   3. AI filters results, renders SeatMap with assistantHighlightedSeats   │
│   4. User clicks a seat → userSelectedSeats updates                       │
│   5. AI can read the selection in next turn                               │
└───────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼ (user confirms seat)
┌───────────────────────────────────────────────────────────────────────────┐
│ MAP EXPLORATION DEMO                                                      │
├───────────────────────────────────────────────────────────────────────────┤
│ Context:                                                                  │
│   • Global: userTime (current date)                                       │
│   • Local (dynamic via useTamboContextHelpers):                           │
│     - assistantBehavior: destination + weather summary                    │
│     - mapState: current bounding box if user drew a rectangle             │
│     - itinerary: list of saved POIs                                       │
│                                                                           │
│ Tools:                                                                    │
│   • search_location → geocoding, flies map to location                    │
│   • get_weather → 7-day forecast for coordinates                          │
│   • analyze_selected_area → search POIs in drawn rectangle                │
│   • add_to_itinerary → save a POI to user's trip                          │
│   • get_area_suggestions → suggest what to search for                     │
│                                                                           │
│ Component:                                                                │
│   • MapBox with event listeners:                                          │
│     - useMapSearchListener (receives analyze_selected_area results)       │
│     - useMapNavigationListener (flies to search_location results)         │
│                                                                           │
│ Flow:                                                                     │
│   1. User: "Take me to Paris"                                             │
│   2. AI calls search_location("Paris")                                    │
│   3. Tool fetches /api/mapbox/location, dispatches navigation event       │
│   4. MapBox listener receives event, calls map.flyTo()                    │
│   5. AI calls get_weather with Paris coordinates                          │
│   6. Weather context updates, AI can reference it naturally               │
│   7. User draws rectangle: "Find coffee shops here"                       │
│   8. AI calls analyze_selected_area("coffee")                             │
│   9. Tool dispatches search event → MapBox listener calls /api/mapbox/area│
│  10. Pins appear on map, AI receives POI list to discuss                  │
└───────────────────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

| Challenge | Solution |
|-----------|----------|
| Tools can't use React hooks | Event dispatch pattern bridges tool → component |
| AI needs current app state | Context helpers inject state into prompts |
| User interactions need to reach AI | `useTamboComponentState` syncs component ↔ AI |
| Different demos need different context | `useTamboContextHelpers` adds/removes context dynamically |
| API keys must stay server-side | Tools call `/api/*` routes, not external APIs directly |

---

## 2. State Management

### Two-Layer State Architecture

| Layer | Hook | Purpose |
|-------|------|---------|
| Tambo Thread | `useTamboThread()` | AI conversation, messages, thread switching |
| App Context | `useAssitant()` | App-specific state (destination, map, itinerary) |

### AssistantContext (Custom)

Defined in [`index.tsx`](./index.tsx), provides app-wide state:

```tsx
const AssistantContext = createContext<{
  // Main state
  destination: Destination
  weather: WeatherResult | null
  selectedDemo: Demo
  threads: Threads
  
  // Setters (dispatch functions)
  setWeather: React.Dispatch<React.SetStateAction<WeatherResult | null>>
  setSelectedDemo: React.Dispatch<React.SetStateAction<Demo>>
  setDestination: React.Dispatch<React.SetStateAction<Destination>>
  
  // Map state
  map: mapboxgl.Map | undefined
  currentBBox: BBox | null
  itinerary: itineraryItem[]
  setMap: React.Dispatch<React.SetStateAction<mapboxgl.Map | undefined>>
  setCurrentBBox: React.Dispatch<React.SetStateAction<BBox | null>>
  addToItinerary: (item: itineraryItem) => void
  
  // Thread functions
  switchToDemoThread: (demo: Demo) => void
  
  // Seat selector
  choosedSeat: string[]
  finishSeatSelection: (seat: string) => void
}>({...})
```

### useTamboComponentState

For bi-directional state between AI and components:

```tsx
// In component
const [selectedSeats, setSelectedSeats] = useTamboComponentState<string[]>(
  'userSelectedSeats',  // key name
  [],                   // default value
  userSelectedSeats     // initial value from AI props
)
```

**How it works:**
- AI can set initial props when rendering the component
- User interactions update the state via `setSelectedSeats`
- AI can read the updated state in subsequent turns

---

## 3. Tool-to-Component Communication

### The Problem

Tools are plain async functions - they **cannot use React hooks or access context directly**. But they often need to:
- Update the map when a location is found
- Add pins based on search results
- Read the current bounding box from component state

### The Solution: Event Dispatch Pattern

The pattern bridges the gap between tools (plain functions) and React components (with hooks and context):

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI/Tool   │────▶│ dispatchMapSearch│────▶│  CustomEvent    │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                      │
                                                      ▼
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Result    │◀────│  resolve(result) │◀────│ useMapListener  │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

### Event Types

Defined in [`(components)/map/mapbox/events.ts`](./(components)/map/mapbox/events.ts):

| Event | Dispatch Function | Listener Hook |
|-------|-------------------|---------------|
| `tambo:map:search` | `dispatchMapSearch()` | `useMapSearchListener()` |
| `tambo:map:navigation` | `dispatchMapNavigation()` | `useMapNavigationListener()` |
| `tambo:itinerary:add` | `dispatchAddToItinerary()` | `useAddToItineraryListener()` |

**Key points:**
- Returns a Promise that the tool can await
- Passes `resolve` and `reject` in the event detail
- The listener component (react component) will call `resolve(result)` when done

### API Routes

| Route | Purpose |
|-------|---------|
| `/api/mapbox/location` | Geocoding (search location by name) |
| `/api/mapbox/area` | Search POIs in a bounding box |
| `/api/weather` | Get weather forecast by coordinates |

---

## 4. File Organization

```
integrations/tambo/
├── index.tsx              # TamboIntegration, AssistantProvider, useAssitant
├── tools.ts               # Tool definitions and async functions
├── constants.ts           # Demo configs, default values
├── ARCHITECTURE.md        # This file
└── (components)/
    ├── map/
    │   ├── index.tsx      # MapAssistant component
    │   ├── schema.ts      # Zod schemas, context helpers
    │   └── mapbox/
    │       ├── index.tsx  # MapBox component
    │       ├── events.ts  # Event dispatch/listeners
    │       └── ...
    ├── seat-selector/
    │   ├── index.tsx      # Entry point
    │   ├── schema.ts      # TamboComponent registration
    │   └── seatmap.tsx    # SeatMap component
    └── ui-tambo/          # Shared UI components for chat
```

---

## 5. Quick Reference

### Custom Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useAssitant()` | `index.tsx` | App-wide state context |
| `useMapSearchListener()` | `events.ts` | Listen for search events |
| `useMapNavigationListener()` | `events.ts` | Listen for navigation events |
| `useAddToItineraryListener()` | `events.ts` | Listen for itinerary events |

---

*Last updated: January 2026*

