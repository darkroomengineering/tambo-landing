'use client'
import { TimelineSection } from '~/app/(pages)/home/_components/timeline-section'
import { RiveWrapper } from '~/components/rive'
import { messages } from './data'

export function TamboSteps() {
  return (
    <TimelineSection
      // ref={setTimelineRectRef}
      id="moment-1"
      messages={messages}
      href="https://docs.tambo.co/concepts/components"
      title="Generative UI, powered by your components."
    >
      <RiveWrapper src="/assets/rives/moment-1_loop_1.riv" />
      {/* <Animation /> */}
    </TimelineSection>
  )
}
