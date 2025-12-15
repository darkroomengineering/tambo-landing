import cn from 'clsx'
import { use, useEffect, useEffectEvent, useRef } from 'react'
import {
  type TimelineCallback,
  TimelineSectionContext,
} from '~/app/(pages)/home/_components/timeline-section'
import { mapRange } from '~/libs/utils'
import s from './animation.module.css'

export function Animation() {
  const { addCallback } = use(TimelineSectionContext)

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const whatCanIDoRef = useRef<HTMLParagraphElement>(null)
  const seatMapRef = useRef<HTMLDivElement>(null)
  const chatBackgroundRef = useRef<HTMLDivElement>(null)
  const chatBorderRef = useRef<HTMLDivElement>(null)

  const scrollAnimation = useEffectEvent<TimelineCallback>(({ steps }) => {
    // Elements
    const container = containerRef.current
    const map = mapRef.current
    const chatMessages = chatMessagesRef.current
    const whatCanIDo = whatCanIDoRef.current
    const seatMap = seatMapRef.current
    const chatBackground = chatBackgroundRef.current
    const chatBorder = chatBorderRef.current

    if (
      !(
        container &&
        map &&
        chatMessages &&
        whatCanIDo &&
        seatMap &&
        chatBackground &&
        chatBorder
      )
    )
      return

    const introProgress = mapRange(0, 0.5, steps[0], 0, 1, true)
    const whatCanIDoProgress = mapRange(0, 0.5, steps[1], 0, 1, true)
    const thinkingProgress = mapRange(0.5, 1, steps[1], 0, 1, true)
    const highlightProgress = mapRange(0, 0.5, steps[2], 0, 1, true)

    if (introProgress < 1) {
      container.style.setProperty('--intro-progress', `${introProgress}`)
      map.style.opacity = `${introProgress}`
      return
    }

    if (whatCanIDoProgress < 1) {
      chatMessages.style.setProperty(
        '--chat-translate-y',
        `${mapRange(0, 1, whatCanIDoProgress, 0, 148, true)}`
      )
      whatCanIDo.style.opacity = `${mapRange(0.5, 1, whatCanIDoProgress, 0, 1)}`
      return
    }

    if (thinkingProgress < 1) {
      chatMessages.style.setProperty(
        '--chat-translate-y',
        `${mapRange(0, 1, thinkingProgress, 148, 268, true)}`
      )
      seatMap.style.transform = `translateY(${mapRange(0, 1, thinkingProgress, 0, -100)}%)`
      seatMap.style.opacity = `${mapRange(0, 1, thinkingProgress, 1, 0)}`
      return
    }

    if (highlightProgress < 1) {
      container.style.setProperty(
        '--highlight-progress',
        `${highlightProgress}`
      )
      map.style.opacity = `${mapRange(0, 1, highlightProgress, 1, 0.3)}`
      whatCanIDo.style.opacity = `${mapRange(0, 1, highlightProgress, 1, 0.3)}`
      chatBackground.style.opacity = `${mapRange(0, 1, highlightProgress, 1, 0.3)}`
      chatBorder.style.opacity = `${mapRange(0, 1, highlightProgress, 1, 0.3)}`
      return
    }
  })

  useEffect(() => {
    addCallback(scrollAnimation)
  }, [addCallback])

  return (
    <div ref={containerRef} className={cn('w-full', s.container)}>
      <div
        ref={mapRef}
        className={cn(
          'relative w-full dr-rounded-20 shadow-m bg-white border border-forest/50 opacity-0 -z-3',
          s.map
        )}
      >
        {/* TODO: Map here */}
      </div>
      <div className={cn('relative w-full', s.chat)}>
        <div
          ref={chatBackgroundRef}
          className="absolute inset-0 bg-white -z-1 dr-rounded-20 shadow-m border border-forest/50"
        />
        <div
          ref={chatBorderRef}
          className="absolute -inset-[6px] bg-white/80 -z-2 dr-rounded-26"
        />
        <div className="size-full overflow-hidden dr-p-14">
          <div
            ref={chatMessagesRef}
            className={cn(
              'size-full flex flex-col justify-end ',
              s.chatMessages
            )}
          >
            <div ref={seatMapRef} className="self-start">
              {/* TODO: Seat map here */}
              <p className="typo-p-sentient bg-light-gray dr-rounded-12 dr-p-24 border border-dark-grey">
                Window seat confirmed. Booking 12F!
              </p>
            </div>
            <p
              ref={whatCanIDoRef}
              className="typo-p bg-ghost-mint dr-rounded-12 dr-p-24 border border-dark-grey self-end dr-mt-78 opacity-0"
            >
              What can I do here?
            </p>
            <div className="self-start dr-mt-14">
              <div className="dr-w-306 dr-h-32 bg-white border border-grey rounded-full dr-mb-9" />
              <div className="dr-rounded-12 bg-ghost-mint border border-dark-grey flex dr-gap-4 dr-w-80 dr-h-67 justify-center items-center">
                <div className="dr-size-4 rounded-full bg-black" />
                <div className="dr-size-4 rounded-full bg-black" />
                <div className="dr-size-4 rounded-full bg-black" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
