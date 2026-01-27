'use client'

import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas'
import { useEffect, useRef } from 'react'

interface RiveWrapperProps {
  className?: string
  src: string
}

export function RiveWrapper({ src, className }: RiveWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { RiveComponent, rive } = useRive({
    src,
    autoplay: false,
    stateMachines: 'MainStateMachine',
    autoBind: true,
    layout: new Layout({
      fit: Fit.FitWidth,
      alignment: Alignment.Center,
    }),
  })

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!(wrapper && rive)) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          rive.play()
        } else {
          rive.pause()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(wrapper)

    return () => {
      observer.disconnect()
    }
  }, [rive])

  return (
    <div ref={wrapperRef} className={className}>
      <div className="absolute inset-0">
        <RiveComponent className="size-full" />
      </div>
    </div>
  )
}
