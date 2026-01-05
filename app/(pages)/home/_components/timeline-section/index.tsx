'use client'
import cn from 'clsx'
import gsap from 'gsap'
import { useRect } from 'hamo'
import {
  createContext,
  type RefObject,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react'
import type { messages as messagesType } from '~/app/(pages)/home/_sections/section-4/data'
import { CTA } from '~/components/button'
import { Image } from '~/components/image'
import { Video } from '~/components/video'
import { useScrollTrigger } from '~/hooks/use-scroll-trigger'
import { mapRange } from '~/libs/utils'
import { colors } from '~/styles/colors'
import CursorClickIcon from './cursor-click.svg'
import SealCheckIcon from './seal-check.svg'

export const TimelineSectionContext = createContext<{
  callbacks: RefObject<TimelineCallback[]>
  addCallback: (callback: TimelineCallback) => void
}>({
  callbacks: { current: [] },
  addCallback: () => {
    /* NO OP */
  },
})

const STEPS = 5
type CallbackParams = {
  progress: number
  steps: number[]
  currentStep: number
}
export type TimelineCallback = (params: CallbackParams) => void

export function TimelineSection({
  messages,
  title,
  children,
  ref,
}: {
  messages: typeof messagesType
  title: string
  children?: React.ReactNode
  ref?: React.RefCallback<HTMLElement | null>
}) {
  const [rectRef, rect] = useRect()
  const [messagesVisible, setMessagesVisible] = useState(0)
  const whiteLineRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const callbacks = useRef<TimelineCallback[]>([])
  const addCallback = useCallback((callback: TimelineCallback) => {
    callbacks.current.push(callback)
  }, [])

  useScrollTrigger({
    rect,
    start: 'top top',
    end: 'bottom bottom',
    onProgress: ({ progress, steps }) => {
      const currentStep = Math.max(0, steps.lastIndexOf(1) + 1)
      setMessagesVisible(currentStep)
      const lineProgress =
        (100 / STEPS) * steps[currentStep] + (100 / STEPS) * currentStep
      if (whiteLineRef.current) {
        const mappedLineProgress = mapRange(0, 100, lineProgress, 100, 8)
        whiteLineRef.current.style.translate = `0 -${Math.min(mappedLineProgress, 90)}%`
      }
      if (buttonRef.current) {
        buttonRef.current.style.opacity = `${steps[STEPS - 1] === 1 ? 1 : 0}`
      }
      for (const callback of callbacks.current) {
        callback({ progress, steps, currentStep })
      }
    },
    steps: STEPS,
  })

  return (
    <TimelineSectionContext.Provider value={{ callbacks, addCallback }}>
      <section
        ref={(node) => {
          rectRef(node)
          if (ref) {
            ref?.(node)
          }
        }}
        className="h-[800svh] overflow-x-clip"
      >
        <div className="sticky top-0 dr-layout-grid-inner h-screen">
          <div className="col-span-4 flex flex-col dr-mt-112">
            <h3 className="typo-h2">{title}</h3>
            <div
              className="relative dr-py-40"
              style={{
                maskImage:
                  'linear-gradient(to bottom, transparent 0%, black 5%)',
              }}
            >
              <div className="absolute z-15 dr-w-32 inset-y-0 dr-left-27">
                <div
                  ref={whiteLineRef}
                  className="dr-w-8 h-[110%] bg-white rounded-full shadow-xs mx-auto"
                />
              </div>
              <ul className="flex flex-col dr-gap-4 items-start">
                {messages.map((message, idx) => (
                  <TimelineItem
                    key={message.id}
                    message={message}
                    visible={idx < messagesVisible}
                    idx={idx}
                    last={idx === messages.length - 1}
                  />
                ))}
              </ul>
            </div>
            <CTA
              wrapperRef={buttonRef}
              wrapperClassName="opacity-0 transition-opacity duration-300 ease-gleasing"
              color="black"
            >
              Start building
            </CTA>
          </div>
          <div className="col-start-6 col-end-12 flex items-center justify-center">
            {children}
          </div>
        </div>
      </section>
    </TimelineSectionContext.Provider>
  )
}

function TimelineItem({
  message,
  visible,
  idx,
  last,
}: {
  message: (typeof messagesType)[number]
  visible: boolean
  idx: number
  last: boolean
}) {
  const backgroundRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const iconContentRef = useRef<HTMLDivElement>(null)

  const showItem = useEffectEvent(() => {
    const tl = gsap.timeline()
    tl.to(
      backgroundRef.current,
      {
        clipPath: 'inset(0 0% 0 0)',
        opacity: 1,
        duration: 0.35,
        ease: 'power2.inOut',
      },
      '<'
    )
    tl.to(
      iconRef.current,
      {
        width: '100%',
        height: '100%',
        backgroundColor: last ? colors['ghost-mint'] : colors['light-gray'],
        borderColor: colors['dark-grey'],
        duration: 0.35,
        ease: 'power2.inOut',
      },
      '<'
    )
    tl.to(
      iconContentRef.current,
      {
        opacity: 1,
        duration: 0.35,
        ease: 'power2.inOut',
      },
      '<'
    )
    tl.to(
      textRef.current,
      {
        clipPath: 'inset(0 0% 0 0)',
        opacity: 1,
        duration: 0.35,
        ease: 'power2.inOut',
      },
      '<'
    )

    return () => {
      tl.kill()
    }
  })

  const hideItem = useEffectEvent(() => {
    const tl = gsap.timeline()
    tl.to(
      backgroundRef.current,
      {
        clipPath: 'inset(0 100% 0 0)',
        duration: 0.35,
        ease: 'power2.inOut',
      },
      '<'
    )
    tl.to(
      backgroundRef.current,
      {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.inOut',
      },
      '<'
    )
    tl.to(
      iconRef.current,
      {
        width: '1vw',
        height: '1vw',
        backgroundColor: colors['light-gray'],
        borderColor: '#79B599',
        duration: 0.35,
        ease: 'power2.inOut',
      },
      '<'
    )
    tl.to(
      iconContentRef.current,
      {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.inOut',
      },
      '<'
    )
    tl.to(
      textRef.current,
      {
        clipPath: 'inset(0 100% 0 0)',
        opacity: 0,
        duration: 0.35,
        ease: 'power2.inOut',
      },
      '<'
    )

    return () => {
      tl.kill()
    }
  })

  useEffect(() => (visible ? showItem() : hideItem()), [visible])

  return (
    <li className="relative dr-h-84 dr-p-8 flex dr-gap-4">
      <div
        ref={backgroundRef}
        className={cn(
          'absolute inset-0 border border-dark-grey dr-rounded-20',
          last ? 'bg-white' : 'bg-off-white'
        )}
      />
      <div className="relative z-30 h-full aspect-square grid place-items-center">
        <div
          ref={iconRef}
          className={cn(
            'size-full overflow-hidden dr-rounded-12 border border-dark-grey dr-p-4',
            last ? 'bg-ghost-mint' : 'bg-light-gray'
          )}
        >
          <div
            ref={iconContentRef}
            className="size-full grid place-items-center"
          >
            {idx === 0 && <CursorClickIcon className="dr-size-24" />}
            {idx === 3 && <SealCheckIcon className="dr-size-24" />}
            {idx !== 0 && idx !== 3 && (
              <Video
                autoPlay
                priority
                fallback={
                  <Image
                    src={`/videos/${message.video}.png`}
                    alt={message.video}
                    unoptimized
                    preload
                  />
                }
              >
                <source
                  src={`/videos/${message.video}-compressed.mov`}
                  type='video/mp4; codecs="hvc1"'
                />
                <source
                  src={`/videos/${message.video}-compressed.webm`}
                  type="video/webm"
                />
              </Video>
            )}
          </div>
        </div>
      </div>
      <div ref={textRef} className="relative z-10 dr-p-4">
        <div className="flex justify-between typo-label-s text-black/70 dr-mb-8">
          <p>
            {'<'}
            {message.tag}
            {'>'}
          </p>
          <p>{'< >'}</p>
        </div>
        <p className="typo-p text-black">{message.message}</p>
      </div>
    </li>
  )
}
