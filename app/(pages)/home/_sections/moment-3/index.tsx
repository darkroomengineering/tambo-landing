'use client'
import { useRect } from 'hamo'
import { TimelineSection } from '~/app/(pages)/home/_components/timeline-section'
import { Animation } from './animation'
import { messages } from './data'

export function Moment3() {
  const [setRectRef, rect] = useRect()

  return (
    <TimelineSection
      messages={messages}
      title="Native MCP support, hard wiring done for you."
      zIndex={3}
      id="moment-3"
      proxyChildren={
        <div
          ref={setRectRef}
          className="pointer-events-none dr-w-668 opacity-0 aspect-668/470"
        />
      }
    >
      <Animation />
    </TimelineSection>
  )
}
