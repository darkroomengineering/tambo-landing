'use client'
import cn from 'clsx'
import gsap from 'gsap'
import {
  type ComponentProps,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react'
import { mapRange } from '~/libs/utils'
import { colors } from '~/styles/colors'

const letters1 = ['A', 'B', 'C']
const letters2 = ['D', 'E', 'F']
const SEAT_AMOUNT = 12

const highlightedSeats1 = [0, 1, 2, 5, 9, 10]
const highlightedSeats2 = [1, 6, 8, 9, 10, 11]
const highlightedSeatIndex = 8

export type SeatMapRef = {
  highlightSeatsAnimation: (progress: number) => void
  highlightSeatAnimation: (progress: number) => void
}

type SeatMapProps = {
  ref?: React.RefObject<SeatMapRef | null>
}

export function SeatMap({ ref }: SeatMapProps) {
  const seatsRef = useRef<(HTMLDivElement | null)[]>([])
  const labelRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const seatRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)

  const highlightSeatsAnimation = useCallback((progress: number) => {
    for (const seat of seatsRef.current) {
      if (seat) {
        seat.style.backgroundColor = gsap.utils.interpolate(
          colors['ghost-mint'],
          colors['light-gray'],
          progress
        )
      }
    }

    for (const label of labelRefs.current) {
      if (label) {
        label.style.opacity = `${progress}`
      }
    }
  }, [])

  const highlightSeatAnimation = useCallback((progress: number) => {
    const seat = seatRef.current
    const label = labelRef.current

    if (!(seat && label)) return

    seat.style.backgroundColor = gsap.utils.interpolate(
      colors['ghost-mint'],
      colors['black'],
      progress
    )
    seat.style.borderColor = gsap.utils.interpolate(
      colors['dark-grey'],
      colors['mint'],
      progress
    )
    seat.style.outlineWidth = `${mapRange(0, 1, progress, 0, 2)}px`
    label.style.backgroundColor = gsap.utils.interpolate(
      colors['white'],
      colors['mint'],
      progress
    )
    label.style.borderColor = gsap.utils.interpolate(
      colors['dark-grey'],
      colors['mint'],
      progress
    )
  }, [])

  useImperativeHandle(ref, () => ({
    highlightSeatsAnimation,
    highlightSeatAnimation,
  }))

  return (
    <div className="size-full dr-p-16 bg-white">
      <div className="grid grid-cols-[auto_desktop-vw(36)_auto]">
        <div className="grid grid-cols-3 items-center justify-items-center gap-x-px dr-gap-y-5">
          {letters1.map((letter) => (
            <p key={letter} className="typo-label-m dr-mb-8">
              {letter}
            </p>
          ))}
          {Array.from({ length: SEAT_AMOUNT }, (_, idx) => (
            <Seat
              key={`col1-${
                // biome-ignore lint/suspicious/noArrayIndexKey: leave me alone
                idx
              }`}
              idx={idx}
              letters={letters1}
              highlighted={highlightedSeats1.includes(idx)}
              ref={(el) => {
                if (!highlightedSeats1.includes(idx)) {
                  seatsRef.current.push(el)
                }
              }}
              labelRef={(el) => {
                if (highlightedSeats1.includes(idx)) {
                  labelRefs.current.push(el)
                }
              }}
            />
          ))}
        </div>
        <div className="col-start-3 grid grid-cols-3 items-center justify-items-center gap-x-px dr-gap-y-5">
          {letters2.map((letter) => (
            <p key={letter} className="typo-label-m dr-mb-8">
              {letter}
            </p>
          ))}
          {Array.from({ length: SEAT_AMOUNT }, (_, idx) => (
            <Seat
              key={`col2-${
                // biome-ignore lint/suspicious/noArrayIndexKey: leave me alone
                idx
              }`}
              idx={idx}
              letters={letters2}
              highlighted={highlightedSeats2.includes(idx)}
              ref={(el) => {
                if (!highlightedSeats2.includes(idx)) {
                  seatsRef.current.push(el)
                }
                if (idx === highlightedSeatIndex) {
                  seatRef.current = el
                }
              }}
              labelRef={(el) => {
                if (highlightedSeats2.includes(idx)) {
                  labelRefs.current.push(el)
                }
                if (idx === highlightedSeatIndex) {
                  labelRef.current = el
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Seat({
  className,
  idx,
  letters,
  highlighted,
  labelRef,
  ...props
}: ComponentProps<'div'> & {
  idx: number
  letters: string[]
  highlighted: boolean
  labelRef?: React.RefCallback<HTMLParagraphElement | null>
}) {
  return (
    <div
      className={cn(
        'w-full aspect-40/60 bg-ghost-mint border border-dark-grey dr-rounded-4 flex flex-col text-dark-grey outline-mint',
        className
      )}
      {...props}
    >
      <div className="flex-1 grid place-items-center">
        {highlighted && (
          <p
            ref={labelRef}
            className="typo-p-s bg-white border border-dark-grey dr-rounded-4 dr-px-3 dr-py-1 opacity-0 text-black"
          >
            {Math.floor(10 + idx / 3)}
            {letters[idx % 3]}
          </p>
        )}
      </div>

      <div className="w-full h-1/4 border-t border-inherit" />
    </div>
  )
}
