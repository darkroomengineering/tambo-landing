import { useTamboContextHelpers, useTamboThread } from '@tambo-ai/react'
import { useEffect } from 'react'
import { DEMOS } from '~/integrations/tambo/constants'
import { useAssitant } from '../..'
import { seatExampleContext } from '../context'
import { MessageThreadFull } from '../ui-tambo/message-thread-full'

const introMessages = {
  seat: 'You have to select your seat ASAP before the flight starts, do you want me to help you?',
}

const demo = DEMOS.SEAT

export function SeatAssistant() {
  const { selectedDemo } = useAssitant()
  const { addContextHelper, removeContextHelper } = useTamboContextHelpers()
  const { thread, addThreadMessage } = useTamboThread()

  useEffect(() => {
    if (selectedDemo === demo) {
      addContextHelper(
        'assistantBehavior',
        () =>
          `## Role\n${seatExampleContext.objective}\n\n## Instructions\n${seatExampleContext.instructions}`
      )
    }
    return () => removeContextHelper('assistantBehavior')
  }, [selectedDemo, addContextHelper, removeContextHelper])

  useEffect(() => {
    if (selectedDemo !== demo) return

    if (!thread?.messages?.length) {
      addThreadMessage(
        {
          id: 'welcome-message',
          role: 'assistant',
          content: [
            {
              type: 'text',
              text: introMessages.seat,
            },
          ],
          createdAt: new Date().toISOString(),
          threadId: thread.id,
          componentState: {},
        },
        false
      )
    }
  }, [thread?.messages?.length, selectedDemo, thread?.id, addThreadMessage])

  if (selectedDemo !== demo) return null

  return (
    <MessageThreadFull
      className="absolue z-1"
      contextKey={selectedDemo}
      variant="compact"
    />
  )
}
