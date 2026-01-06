'use client'
import { TimelineSection } from '~/app/(pages)/home/_components/timeline-section'
import { Animation } from './animation'
import { messages } from './data'

export function Moment2() {
  return (
    <TimelineSection
      messages={messages}
      title="Context from any source, fully in your control."
      zIndex={5}
    >
      <Animation />
    </TimelineSection>
  )
}
