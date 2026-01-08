'use client'

import cn from 'clsx'
import { useRect, useWindowSize } from 'hamo'
import { useContext, useRef } from 'react'
import { useLenisSnap } from '~/app/(pages)/_components/lenis/snap'
import { BackgroundContext } from '~/app/(pages)/home/_components/background/context'
import { HashPattern } from '~/app/(pages)/home/_components/hash-pattern'
import { TitleBlock } from '~/app/(pages)/home/_components/title-block'
import MonitorSVG from '~/assets/svgs/monitor.svg'
import PlaneSVG from '~/assets/svgs/plane.svg'
import { Image } from '~/components/image'
import { useDesktopVW } from '~/hooks/use-device-values'
import { useScrollTrigger } from '~/hooks/use-scroll-trigger'
import { TamboIntegration, useAssitant } from '~/integrations/tambo'
import { IntroAssistant } from '~/integrations/tambo/(components)/intro'
import {
  InterctableMap,
  MapAssistant,
} from '~/integrations/tambo/(components)/map'
import { AssistantNotifications } from '~/integrations/tambo/(components)/notifications'
import { SeatAssistant } from '~/integrations/tambo/(components)/seat-selector/index'
import { DEMOS } from '~/integrations/tambo/constants'
import { fromTo } from '~/libs/utils'
import s from './section-8.module.css'

export function Section8() {
  const [setRectRef, rect] = useRect()
  // const [setTitleBlockRef, titleBlockRect] = useRect()
  const [setTamboRectRef, tamboRect] = useRect({ ignoreTransform: true })
  const [setTamboSectionRectRef, tamboSectionRect] = useRect({
    ignoreTransform: true,
  })

  const { getItems, getBackground, getElement } = useContext(BackgroundContext)

  const { width: windowWidth = 0 } = useWindowSize()

  const desktopVW = useDesktopVW()

  const setSnapRef = useLenisSnap('end')

  // useScrollTrigger(
  //   {
  //     rect,
  //     start: 'top top',
  //     end: `center center`,
  //     onProgress: ({ progress, isActive }) => {
  //       if (!isActive) return

  //       const background = getBackground()
  //       if (background && progress >= 0) {
  //         background.style.opacity = '1'
  //       }

  //       const items = getItems()
  //       fromTo(
  //         items,
  //         {
  //           borderRadius: desktopVW(20),
  //           width: desktopVW(704, true),
  //           height: desktopVW(497, true),
  //           y: 0,
  //         },
  //         {
  //           borderRadius: desktopVW(20),
  //           width: (index) =>
  //             desktopVW(704, true) -
  //             desktopVW((index - (items.length - 1)) * 105 * 2, true),
  //           height: (index) =>
  //             desktopVW(497, true) -
  //             desktopVW((index - (items.length - 1)) * 74 * 2, true),
  //           y: 0,
  //         },
  //         progress,
  //         {
  //           ease: 'linear',
  //           render: (item, { borderRadius, width, height, y }) => {
  //             // @ts-expect-error
  //             const element = item?.getElement()
  //             // @ts-expect-error
  //             item?.setBorderRadius(`${borderRadius}px`)

  //             if (element instanceof HTMLElement) {
  //               element.style.width = `${width}px`
  //               element.style.height = `${height}px`
  //               element.style.transform = `translateY(${y}px)`
  //             }
  //           },
  //         }
  //       )
  //     },
  //   },
  //   []
  // )

  useScrollTrigger({
    rect: rect,
    start: `center center`,
    end: `top top`,
    onProgress: ({ progress, isActive }) => {
      if (!isActive) return

      const items = getItems()
      fromTo(
        items,

        {
          borderRadius: desktopVW(20),
          width: (index) =>
            desktopVW(704, true) -
            desktopVW((index - (items.length - 1)) * 105 * 2, true),
          height: (index) =>
            desktopVW(497, true) -
            desktopVW((index - (items.length - 1)) * 74 * 2, true),
          y: 0,
          kinesis: 1,
          opacity: 1,
          boxShadowOpacity: 1,
        },
        {
          borderRadius: desktopVW(20),
          width: (index) => {
            if (index === items.length - 1) {
              return tamboRect?.width ?? 0
            }
            return windowWidth
          },
          height: (index) => {
            if (index === items.length - 1) {
              return tamboRect?.height ?? 0
            }
            return windowWidth
          },
          opacity: (index) => {
            if (index === items.length - 1) {
              return 1
            }
            return 0
          },
          boxShadowOpacity: (index) => {
            if (index === items.length - 1) {
              return 1
            }
            return 0
          },
          y: 0,
          kinesis: 0,
        },
        progress,
        {
          ease: 'easeOutSine',
          render: (
            item,
            {
              borderRadius,
              width,
              height,
              y,
              kinesis,
              opacity,
              boxShadowOpacity,
            }
          ) => {
            // @ts-expect-error
            const element = item?.getElement()
            // @ts-expect-error
            const boxShadow = item?.getBoxShadow()
            if (boxShadow) {
              boxShadow.style.opacity = `${boxShadowOpacity}`
            }
            // @ts-expect-error
            item?.setBorderRadius(`${borderRadius}px`)
            // @ts-expect-error
            item?.setKinesis(kinesis)

            if (element instanceof HTMLElement) {
              element.style.width = `${width}px`
              element.style.height = `${height}px`
              element.style.transform = `translateY(${y}px)`
              element.style.opacity = `${opacity}`
            }
          },
        }
      )
    },
  })

  const demoRef = useRef<HTMLDivElement>(null)

  useScrollTrigger({
    rect: tamboSectionRect,
    start: `${rect?.top === undefined ? 'bottom' : rect.top} top`,
    end: `bottom bottom`,
    onProgress: ({ progress, isActive }) => {
      // console.log('progress2', progress)
      // if (!isActive) return

      if (demoRef?.current) {
        demoRef.current.style.opacity = `${progress}`

        demoRef.current.style.pointerEvents = progress === 1 ? 'auto' : 'none'
        // const y = -height * (1 - progress)
        // if (y !== 0) {
        //   tamboRect.element.style.transform = `translateY(${y}px) translateZ(0)`
        // } else {
        //   tamboRect.element.style.removeProperty('transform')
        // }
      }

      if (!isActive) return

      const background = getBackground()

      if (background) {
        background.style.opacity = progress === 1 ? '0' : '1'
      }

      const backgroundElement = getElement()
      if (backgroundElement) {
        backgroundElement.style.backgroundColor = `rgba(255, 255, 255, ${progress})`
      }
    },
  })

  return (
    <>
      <section
        className="flex flex-col items-center justify-end dr-pt-120 dt:dr-pt-0 dr-mb-51 dt:dr-mb-0"
        ref={setRectRef}
      >
        <TitleBlock
        // ref={setTitleBlockRef}
        >
          <TitleBlock.LeadIn>
            {'<'} Live Demo {'>'}
          </TitleBlock.LeadIn>
          <TitleBlock.Title level="h2">
            Enough said.
            <br />
            Just try it yourself.
          </TitleBlock.Title>
        </TitleBlock>
      </section>
      <div className="desktop-only">
        <TamboIntegration>
          <section
            id="demo"
            // className="dr-layout-grid-inner dr-gap-20 items-center justify-center h-screen"
            className="h-screen relative"
            ref={(node) => {
              setSnapRef(node)
              setTamboSectionRectRef(node)
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 h-[150vh]">
              <div className="dr-layout-grid-inner dr-gap-20 items-center justify-center h-screen sticky top-0">
                <AssistantNotifications className="col-span-2" />
                {/* TODO: Dashed border style*/}
                <div
                  ref={(node) => {
                    setTamboRectRef(node)
                    demoRef.current = node
                  }}
                  // ref={demoRef}
                  className="col-start-3 col-end-10 card-outline outline-off-white/80 dr-rounded-20 aspect-898/597 dr-h-597"
                >
                  <div className="relative z-1 size-full dr-rounded-20 shadow-m overflow-clip bg-white ">
                    <InterctableMap
                      height={650}
                      center={{ lng: -74.00594, lat: 40.71278 }}
                      zoom={12}
                    />
                    <BackgroundAssistant />
                    <IntroAssistant />
                    <SeatAssistant />
                    <MapAssistant />
                    <div className="absolute inset-0 rounded-[inherit] dashed-border pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </TamboIntegration>
      </div>
      <section className="mobile-only dr-pb-120 px-safe">
        <div className="relative">
          <div className={s.rim} />
          <div
            className={cn(
              'dr-h-500 relative dr-rounded-20 border border-forest/50 border-dashed shadow-m ',
              s.demoBackground
            )}
          >
            <Image
              src="/assets/mobile-background/demo-background.png"
              alt="Demo"
              fill
            />

            <div className="absolute  dr-top-8 dr-left-28 dr-right-28 dr-h-28 bg-white dr-rounded-20 dr-py-2 dr-pl-2 flex items-center dr-gap-8 outline-2 outline-dark-grey">
              <div className="dr-size-24 bg-black relative rounded-full overflow-hidden grid place-items-center">
                <HashPattern className="absolute inset-0 text-dark-teal/20 " />
                <PlaneSVG className="dr-size-16 text-teal z-1" />
              </div>
              <p className="typo-label-m ">
                {'< '}my goated travel assistant{' >'}
              </p>
            </div>

            <div className="absolute dr-bottom-8 dr-left-8 dr-right-8 dr-h-56  bg-white dr-rounded-20 dr-py-8 dr-pl-8 dr-pr-16 flex items-center dr-gap-16">
              <div className="dr-size-40 grid place-items-center dr-rounded-12 bg-off-white">
                <MonitorSVG className="dr-size-24" />
              </div>
              <p className="typo-p-s dr-w-228">
                To view the live demo, open Tambo on a desktop or larger
                display.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function BackgroundAssistant() {
  const { selectedDemo } = useAssitant()

  if (selectedDemo === DEMOS.MAP) return null

  return (
    <div className="absolute inset-0 w-full h-full">
      <Image src="/images/tmp-demo.png" alt="Intro Background" fill />
    </div>
  )
}
