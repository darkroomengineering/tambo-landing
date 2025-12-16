import cn from 'clsx'
import gsap from 'gsap'
import { use, useEffect, useEffectEvent, useRef } from 'react'
import {
  type TimelineCallback,
  TimelineSectionContext,
} from '~/app/(pages)/home/_components/timeline-section'
import Cursor from '~/assets/svgs/cursor.svg'
import { Image } from '~/components/image'
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
  const thinkingRef = useRef<HTMLDivElement>(null)
  const mapHighlightRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<SVGSVGElement>(null)
  const mapHighlightImageRef = useRef<HTMLImageElement>(null)
  const mapHighlightBackgroundRef = useRef<HTMLDivElement>(null)
  const whatCanIDoBackgroundRef = useRef<HTMLDivElement>(null)
  const whatCanIDoTextRef = useRef<HTMLParagraphElement>(null)

  const scrollAnimation = useEffectEvent<TimelineCallback>(({ steps }) => {
    // Elements
    const container = containerRef.current
    const map = mapRef.current
    const chatMessages = chatMessagesRef.current
    const whatCanIDo = whatCanIDoRef.current
    const seatMap = seatMapRef.current
    const chatBackground = chatBackgroundRef.current
    const chatBorder = chatBorderRef.current
    const thinking = thinkingRef.current
    const mapHighlight = mapHighlightRef.current
    const cursor = cursorRef.current
    const mapHighlightImage = mapHighlightImageRef.current
    const mapHighlightBackground = mapHighlightBackgroundRef.current
    const whatCanIDoBackground = whatCanIDoBackgroundRef.current
    const whatCanIDoText = whatCanIDoTextRef.current

    if (
      !(
        container &&
        map &&
        chatMessages &&
        whatCanIDo &&
        seatMap &&
        chatBackground &&
        chatBorder &&
        thinking &&
        mapHighlight &&
        cursor &&
        mapHighlightImage &&
        mapHighlightBackground &&
        whatCanIDoBackground &&
        whatCanIDoText
      )
    )
      return

    const transitionProgress = mapRange(0, 0.1, steps[0], 0, 1, true)
    const introProgress = mapRange(0.1, 0.5, steps[0], 0, 1, true)
    const whatCanIDoProgress = mapRange(0, 0.5, steps[1], 0, 1, true)
    const thinkingProgress = mapRange(0.5, 1, steps[1], 0, 1, true)
    const highlightProgress = mapRange(0, 0.5, steps[2], 0, 1, true)
    const mergeProgress = mapRange(0.5, 1, steps[2], 0, 1, true)

    // Transition from section 4
    const section45Trans = document.getElementById('section-4-5-trans')
    if (transitionProgress > 0 && section45Trans) {
      section45Trans.style.opacity = `${1 - transitionProgress}`
      container.style.opacity = `${transitionProgress}`
    }

    // Intro
    if (transitionProgress === 1) {
      container.style.setProperty('--intro-progress', `${introProgress}`)
      map.style.opacity = `${introProgress}`

      const mapHighlightProgress = mapRange(0.5, 1, introProgress, 0, 1, true)

      cursor.style.opacity = `${mapHighlightProgress}`
      cursor.style.left = `${100 * mapHighlightProgress}%`
      cursor.style.top = `${100 * mapHighlightProgress}%`
      mapHighlight.style.opacity = `${mapHighlightProgress}`
      mapHighlight.style.scale = `${mapHighlightProgress}`
    }

    if (introProgress === 1) {
      chatMessages.style.setProperty(
        '--chat-translate-y',
        `${mapRange(0, 1, whatCanIDoProgress, 0, 148, true)}`
      )
      whatCanIDo.style.opacity = `${mapRange(0.5, 1, whatCanIDoProgress, 0, 1)}`
    }

    if (whatCanIDoProgress === 1) {
      chatMessages.style.setProperty(
        '--chat-translate-y',
        `${mapRange(0, 1, thinkingProgress, 148, 268, true)}`
      )
      seatMap.style.transform = `translateY(${mapRange(0, 1, thinkingProgress, 0, -100)}%)`
      seatMap.style.opacity = `${mapRange(0, 1, thinkingProgress, 1, 0)}`
      mapHighlight.style.backgroundColor = gsap.utils.interpolate(
        '#B6FFDD80',
        '#F2F8F680',
        thinkingProgress
      )
      cursor.style.opacity = `${1 - thinkingProgress}`
    }

    if (thinkingProgress === 1) {
      container.style.setProperty(
        '--highlight-progress',
        `${highlightProgress}`
      )
      map.style.opacity = `${mapRange(0, 1, highlightProgress, 1, 0.3)}`
      whatCanIDoBackground.style.opacity = `${mapRange(0, 1, highlightProgress, 1, 0.3)}`
      whatCanIDoText.style.transform = `translate(${mapRange(0, 1, highlightProgress, 0, -10, true)}%, ${mapRange(0, 1, highlightProgress, 0, -30, true)}%)`
      chatBackground.style.opacity = `${mapRange(0, 1, highlightProgress, 1, 0.3)}`
      chatBorder.style.opacity = `${mapRange(0, 1, highlightProgress, 1, 0.3)}`
      thinking.style.backgroundColor = `rgba(214, 255, 236, ${1 - highlightProgress})`
      mapHighlightImage.style.transform = `translate(${mapRange(0, 1, highlightProgress, 0, -10, true)}%, ${mapRange(0, 1, highlightProgress, 0, -10, true)}%)`
      mapHighlightImage.style.opacity = `${highlightProgress}`
      mapHighlightBackground.style.opacity = `${mapRange(0, 1, highlightProgress, 1, 0.3)}`
    }

    if (highlightProgress === 1) {
      mapHighlightImage.style.transform = `translate(${mapRange(0, 1, mergeProgress, -10, -150, true)}%, ${mapRange(0, 1, mergeProgress, -10, 240, true)}%) scale(${1 - mergeProgress})`
      whatCanIDoText.style.transform = `translate(${mapRange(0, 1, mergeProgress, -10, -260, true)}%, ${mapRange(0, 1, mergeProgress, -30, 170, true)}%) scale(${1 - mergeProgress})`
    }
  })

  useEffect(() => {
    addCallback(scrollAnimation)
  }, [addCallback])

  return (
    <>
      <div
        id="section-4-5-trans"
        className={cn(
          'fixed top-1/2 -translate-y-1/2 dr-w-670 dr-h-470 z-50 opacity-0 pointer-events-none',
          s.section45Trans
        )}
      >
        <div className="absolute inset-0 bg-white -z-1 dr-rounded-20 shadow-m border border-forest/50 dr-p-14 flex flex-col items-start justify-end">
          <p className="typo-p-sentient bg-light-gray dr-rounded-12 dr-p-24 border border-dark-grey">
            Window seat confirmed. Booking 12F!
          </p>
        </div>
        <div className="absolute -inset-[6px] bg-white/80 -z-2 dr-rounded-26" />
      </div>
      <div ref={containerRef} className={cn('w-full', s.container)}>
        <div className={cn('relative w-full shadow-m -z-3', s.map)}>
          <div ref={mapRef} className="relative size-full">
            <Image
              src="/images/map.png"
              alt="Map of Boston"
              className="absolute inset-0 object-cover dr-rounded-20 overflow-hidden border border-forest/50 shadow-m"
              fill
            />
            <div className="absolute -inset-[6px] bg-white/80 -z-2 dr-rounded-26" />
          </div>

          <div className="absolute dr-left-320 dr-top-88 dr-w-274 dr-h-190 z-10">
            <div
              ref={mapHighlightRef}
              className="relative size-full origin-top-left z-10"
            >
              <div
                ref={mapHighlightBackgroundRef}
                className="size-full relative bg-[#B6FFDD]/50 border-2 border-forest/50 dr-rounded-12"
              />
              <Image
                ref={mapHighlightImageRef}
                src="/images/map.png"
                alt="Map of Boston"
                objectFit="none"
                fill
                className="object-[82.6%_58.4%] scale-106 opacity-0 dr-rounded-12 border-2 border-forest/50"
              />
            </div>
            <Cursor
              ref={cursorRef}
              className="absolute left-full top-full dr-size-24 -translate-1/3"
            />
          </div>
        </div>
        <div className={cn('relative w-full', s.chat)}>
          <div
            ref={chatBackgroundRef}
            className="absolute inset-0 bg-white -z-1 dr-rounded-20 shadow-m"
          />
          <div
            ref={chatBorderRef}
            className="absolute -inset-[6px] bg-white/80 -z-2 dr-rounded-26"
          />
          <div className="size-full overflow-hidden dr-p-14 border border-forest/50 dr-rounded-20">
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
              <div
                ref={whatCanIDoRef}
                className="relative typo-p self-end dr-mt-78 opacity-0"
              >
                <div
                  ref={whatCanIDoBackgroundRef}
                  className="absolute inset-0 bg-ghost-mint dr-rounded-12 dr-p-24 border border-dark-grey"
                />
                <p
                  ref={whatCanIDoTextRef}
                  className="bg-ghost-mint dr-rounded-12 dr-p-24 border border-dark-grey"
                >
                  What can I do here?
                </p>
              </div>
              <div className="self-start dr-mt-14">
                <div className="dr-w-306 dr-h-32 border border-grey rounded-full dr-mb-9" />
                <div
                  ref={thinkingRef}
                  className="dr-rounded-12 bg-ghost-mint border border-dark-grey flex dr-gap-4 dr-w-80 dr-h-67 justify-center items-center"
                >
                  <div className="dr-size-4 rounded-full bg-black" />
                  <div className="dr-size-4 rounded-full bg-black" />
                  <div className="dr-size-4 rounded-full bg-black" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
