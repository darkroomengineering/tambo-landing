import gsap from 'gsap'
import { useRef } from 'react'
import { useMouseMove } from '~/hooks/use-mouse-move'

export function Kinesis({
  children,
  className,
  index,
}: {
  children: React.ReactNode
  className?: string
  index?: number
}) {
  const elementRef = useRef<HTMLDivElement>(null)

  useMouseMove((x, y) => {
    if (elementRef.current && index) {
      gsap.to(elementRef.current, {
        x: x * index,
        y: y * index,
        duration: 4,
        ease: 'expo.out',
      })
    }
  })

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}
