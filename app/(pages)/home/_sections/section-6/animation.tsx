import cn from 'clsx'
import gsap from 'gsap'
import Image from 'next/image'
import { use, useEffect, useEffectEvent, useRef } from 'react'
import {
  type TimelineCallback,
  TimelineSectionContext,
} from '~/app/(pages)/home/_components/timeline-section'
import Cursor from '~/assets/svgs/cursor.svg'
import { mapRange } from '~/libs/utils'
import { colors } from '~/styles/colors'
import s from './animation.module.css'
import { LogoCircle, type LogoCircleRef } from './logo-circle'

export function Animation() {
  const { addCallback } = use(TimelineSectionContext)

  const containerRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const logoCircleRef = useRef<LogoCircleRef | null>(null)
  const calendarImageRef = useRef<HTMLImageElement>(null)
  const calendarFreeSpotRef = useRef<HTMLParagraphElement>(null)
  const calendarThinkingRef = useRef<HTMLDivElement>(null)
  const freedomTrailRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const sureUpdateCalendarRef = useRef<HTMLDivElement>(null)
  const confirmingBackgroundRef = useRef<HTMLDivElement>(null)
  const confirmingTextRef = useRef<HTMLParagraphElement>(null)
  const confirmingThinkingRef = useRef<HTMLDivElement>(null)
  const addFreedomTrailRef = useRef<HTMLParagraphElement>(null)

  const scrollAnimation = useEffectEvent<TimelineCallback>(({ steps }) => {
    // console.log('scrollAnimation', steps)
    // Elements
    const container = containerRef.current
    const chat = chatRef.current
    const chatMessages = chatMessagesRef.current
    const logoCircle = logoCircleRef.current
    const calendarImage = calendarImageRef.current
    const calendarThinking = calendarThinkingRef.current
    const calendarFreeSpot = calendarFreeSpotRef.current
    const freedomTrail = freedomTrailRef.current
    const cursor = cursorRef.current
    const sureUpdateCalendar = sureUpdateCalendarRef.current
    const confirmingBackground = confirmingBackgroundRef.current
    const confirmingText = confirmingTextRef.current
    const confirmingThinking = confirmingThinkingRef.current
    const addFreedomTrail = addFreedomTrailRef.current

    if (
      !(
        container &&
        chat &&
        chatMessages &&
        logoCircle &&
        calendarImage &&
        calendarThinking &&
        calendarFreeSpot &&
        freedomTrail &&
        cursor &&
        sureUpdateCalendar &&
        confirmingBackground &&
        confirmingText &&
        confirmingThinking &&
        addFreedomTrail
      )
    )
      return

    const safeZoneProgress = mapRange(0, 0.05, steps[0], 0, 1, true)
    const addToCalendarProgress = mapRange(0.5, 1, steps[0], 0, 1, true)
    const thinkingProgress = mapRange(0, 0.4, steps[1], 0, 1, true)
    const circleFocusProgress = mapRange(0.6, 0.8, steps[1], 0, 1, true)
    const highlightProgress = mapRange(0.8, 1, steps[1], 0, 1, true)
    const chatMessagesProgress = mapRange(0.1, 0.5, steps[2], 0, 1, true)
    const freedomTrailProgress = mapRange(0.55, 0.7, steps[2], 0, 1, true)
    const freedomTrailHighlightProgress = mapRange(
      0.7,
      0.9,
      steps[2],
      0,
      1,
      true
    )
    const sureUpdateCalendarProgress = mapRange(0, 0.3, steps[3], 0, 1, true)
    const confirmUpdateCalendarProgress = mapRange(
      0.3,
      0.6,
      steps[3],
      0,
      1,
      true
    )
    const addingToCalendarProgress = mapRange(0.6, 1, steps[3], 0, 1, true)
    const addedToCalendarProgress = mapRange(0.2, 0.6, steps[4], 0, 1, true)

    if (safeZoneProgress === 1) {
      chatMessages.style.setProperty(
        '--chat-translate-y',
        `${mapRange(0, 1, addToCalendarProgress, 0, 84, true)}`
      )
    }

    if (addToCalendarProgress === 1) {
      chatMessages.style.setProperty(
        '--chat-translate-y',
        `${mapRange(0, 1, thinkingProgress, 84, 164, true)}`
      )
      addFreedomTrail.style.backgroundColor = gsap.utils.interpolate(
        colors['ghost-mint'],
        colors['off-white'],
        thinkingProgress
      )
    }

    if (thinkingProgress === 1) {
      logoCircle.scrollAnimation(circleFocusProgress)
      container.style.setProperty(
        '--highlight-progress',
        `${circleFocusProgress}`
      )
      chat.style.scale = `${1 - circleFocusProgress * 0.2}`
      chat.style.opacity = `${mapRange(0, 1, circleFocusProgress, 1, 0.3)}`
    }

    if (circleFocusProgress === 1) {
      logoCircle.highlightAnimation(highlightProgress)
    }

    if (highlightProgress === 1) {
      logoCircle.chatMessagesAnimation(chatMessagesProgress)
      container.style.setProperty(
        '--highlight-progress',
        `${1 - chatMessagesProgress}`
      )
      chat.style.scale = `${mapRange(0, 1, chatMessagesProgress, 0.8, 1)}`
      chat.style.opacity = `${mapRange(0, 1, chatMessagesProgress, 0.3, 1)}`
      calendarImage.style.opacity = `${mapRange(0.4, 1, chatMessagesProgress, 0, 1)}`
      calendarThinking.style.opacity = `${mapRange(0, 0.6, chatMessagesProgress, 1, 0)}`
      calendarFreeSpot.style.opacity = `${chatMessagesProgress}`
      calendarFreeSpot.style.translate = `${mapRange(0, 1, chatMessagesProgress, -50, 0)}% 0`
    }

    if (chatMessagesProgress === 1) {
      chatMessages.style.setProperty(
        '--chat-translate-y',
        `${mapRange(0, 1, freedomTrailProgress, 164, 238, true)}`
      )
      freedomTrail.style.opacity = `${freedomTrailProgress}`
    }

    if (freedomTrailProgress === 1) {
      cursor.style.opacity = `${freedomTrailHighlightProgress}`
      cursor.style.translate = `${mapRange(0, 1, freedomTrailHighlightProgress, 100, 0)}% ${mapRange(0, 1, freedomTrailHighlightProgress, 200, 0)}%`
    }

    if (freedomTrailHighlightProgress === 1) {
      chatMessages.style.setProperty(
        '--chat-translate-y',
        `${mapRange(0, 1, sureUpdateCalendarProgress, 238, 384, true)}`
      )
      cursor.style.opacity = `${1 - sureUpdateCalendarProgress}`
      cursor.style.translate = `${mapRange(0, 1, sureUpdateCalendarProgress, 0, 300)}% ${mapRange(0, 1, sureUpdateCalendarProgress, 0, -100)}%`
      sureUpdateCalendar.style.opacity = `${sureUpdateCalendarProgress}`
    }

    if (sureUpdateCalendarProgress === 1) {
      cursor.style.opacity = `${confirmUpdateCalendarProgress}`
      cursor.style.translate = `${mapRange(0, 1, confirmUpdateCalendarProgress, 300, 700)}% ${mapRange(0, 1, confirmUpdateCalendarProgress, -100, 650)}%`
    }

    if (confirmUpdateCalendarProgress === 1) {
      chatMessages.style.setProperty(
        '--chat-translate-y',
        `${mapRange(0, 1, addingToCalendarProgress, 384, 508, true)}`
      )
      cursor.style.opacity = `${1 - addingToCalendarProgress}`
      cursor.style.translate = `${mapRange(0, 1, addingToCalendarProgress, 700, 900)}% ${mapRange(0, 1, addingToCalendarProgress, 650, 1000)}%`
    }

    if (addingToCalendarProgress === 1) {
      confirmingBackground.style.setProperty(
        '--added-to-calendar-progress',
        `${addedToCalendarProgress}`
      )
      confirmingText.style.opacity = `${addedToCalendarProgress}`
      confirmingThinking.style.opacity = `${1 - addedToCalendarProgress}`
    }
  })

  useEffect(() => {
    addCallback(scrollAnimation)
  }, [addCallback])

  return (
    <div ref={containerRef} className={cn('w-full', s.container)}>
      <div ref={chatRef} className={cn('relative w-full dr-h-470', s.chat)}>
        <div
          // ref={chatBackgroundRef}
          className="absolute inset-0 bg-white -z-1 dr-rounded-20 shadow-m"
        />
        <div
          // ref={chatBorderRef}
          className="absolute -inset-[6px] bg-white/80 -z-2 dr-rounded-26"
        />
        <div className="size-full overflow-hidden dr-p-16 dashed-border dr-rounded-20">
          <div
            ref={chatMessagesRef}
            className={cn(
              'size-full flex flex-col justify-end ',
              s.chatMessages
            )}
          >
            <p className="self-end typo-p bg-off-white dr-rounded-12 dr-p-24 border border-dark-grey dr-mb-14">
              What can I do here?
            </p>
            <div className="self-start dr-mb-6">
              <div className="dr-w-173 dr-h-32 border border-grey dr-rounded-12 dr-mb-9 font-geist dr-text-10 flex items-center justify-start">
                <div className="relative flex justify-center items-center dr-size-14 dr-mr-6 dr-ml-8">
                  <svg
                    className="absolute left-0 size-full"
                    viewBox="0 0 13 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Checkmark Icon</title>
                    <path
                      d="M0.75 5.25L4.25 8.75L12.25 0.75"
                      stroke="#7FFFC3"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>found some activities for you</span>
              </div>
              <p className="typo-p-sentient bg-light-gray dr-rounded-12 dr-p-24 border border-dark-grey">
                Here are the best-rated activities in that area!
              </p>
            </div>
            <p className="self-start typo-p-sentient bg-light-gray dr-rounded-12 dr-p-24 border border-dark-grey dr-mb-14">
              Great pick for a history buff.
            </p>
            <p
              ref={addFreedomTrailRef}
              className="self-end typo-p bg-ghost-mint dr-rounded-12 dr-p-24 border border-dark-grey dr-mb-14"
            >
              Add the Freedom Trail Tour to my calendar
            </p>
            <div className="self-start dr-mb-6 flex dr-gap-6">
              <div className="bg-ghost-mint dr-rounded-12 h-full aspect-square border border-dark-grey dr-p-10 relative z-10">
                <Image
                  ref={calendarImageRef}
                  src="/assets/logos/g-cal.svg"
                  alt="Google Calendar"
                  width={200}
                  height={200}
                  className="size-full opacity-0"
                />
                <div
                  ref={calendarThinkingRef}
                  className="absolute left-1/2 top-1/2 -translate-1/2 flex dr-gap-4 items-center"
                >
                  <div className="dr-size-4 rounded-full bg-black" />
                  <div className="dr-size-4 rounded-full bg-black" />
                  <div className="dr-size-4 rounded-full bg-black" />
                </div>
              </div>
              <p
                ref={calendarFreeSpotRef}
                className="typo-p-sentient bg-ghost-mint dr-rounded-12 dr-p-24 border border-dark-grey opacity-0 -translate-x-1/2"
              >
                You have a free spot Tuesday 15:00
              </p>
            </div>
            <div
              ref={freedomTrailRef}
              className="self-start bg-ghost-mint dr-rounded-12 dr-h-67 dr-p-4 dr-pl-8 flex items-center aspect-square border border-dark-grey dr-mb-6 opacity-0 relative"
            >
              <div className="h-5/6 dr-mx-4 dr-w-2 bg-dark-teal dr-mr-12" />
              <div className="flex flex-col dr-py-8 dr-gap-8">
                <p className="font-geist dr-text-16 whitespace-nowrap">
                  Freedom Trail Tour
                </p>
                <div className="flex dr-gap-16">
                  <p className="typo-p font-geist dr-text-12 whitespace-nowrap">
                    Tue, Jan 9
                  </p>
                  <p className="typo-p font-geist dr-text-12 whitespace-nowrap">
                    15:00 - 16:00
                  </p>
                </div>
              </div>
              <div className="h-full aspect-4/6 bg-white box-border border-2 border-dark-grey dr-rounded-8 dr-ml-24" />
              <Cursor
                ref={cursorRef}
                className="absolute dr-size-24 right-0 bottom-0 translate-y-[200%] translate-x-full opacity-0"
              />
            </div>
            <div
              ref={sureUpdateCalendarRef}
              className="self-start typo-p-sentient bg-mint dr-rounded-12 dr-py-13 dr-pl-16 dr-pr-24 border border-dark-grey flex dr-gap-16 items-center dr-mb-6 opacity-0"
            >
              <div className="dr-h-40 aspect-square bg-black rounded-full" />
              <span>Are you sure you want to update your calendar?</span>
            </div>

            <div className="self-end flex dr-gap-8 dr-mb-14">
              <p className="typo-button uppercase dr-p-24 dr-rounded-12 border-2 border-dark-grey">
                yes, go ahead!
              </p>
              <p className="typo-button uppercase dr-p-24 dr-rounded-12 border-2 border-dark-grey bg-white">
                no, cancel!
              </p>
            </div>

            <div className="self-start">
              <div
                className={cn(
                  'dr-h-32 dr-w-200 border border-grey dr-rounded-12 dr-mb-9',
                  s.confirmingBubble
                )}
              />
              <p
                ref={confirmingBackgroundRef}
                className={cn(
                  'typo-p-sentient bg-light-gray dr-rounded-12 dr-p-24 border border-dark-grey relative',
                  s.confirmingBackground
                )}
              >
                <span ref={confirmingTextRef} className="whitespace-nowrap">
                  You're all set for Tuesday. Enjoy the tour!
                </span>
                <div
                  ref={confirmingThinkingRef}
                  className="absolute dr-left-40 top-1/2 -translate-1/2 flex dr-gap-4 items-center"
                >
                  <div className="dr-size-4 rounded-full bg-black" />
                  <div className="dr-size-4 rounded-full bg-black" />
                  <div className="dr-size-4 rounded-full bg-black" />
                </div>
              </p>
            </div>
          </div>
        </div>
      </div>
      <LogoCircle ref={logoCircleRef} />
    </div>
  )
}
