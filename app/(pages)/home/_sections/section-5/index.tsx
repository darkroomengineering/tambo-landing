'use client'
import { TimelineSection } from '~/app/(pages)/home/_components/timeline-section'
import { Animation } from './animation'
import { messages } from './data'

export function Section5() {
  return (
    <TimelineSection
      messages={messages}
      title="Your app state, as context for your AI assistant."
      zIndex={5}
    >
      <Animation />
    </TimelineSection>
  )
}
