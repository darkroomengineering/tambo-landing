import { useWindowSize } from 'hamo'
import { useEffect, useEffectEvent, useRef } from 'react'

export function useMouseMove(callback: (x: number, y: number) => void) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const { width: windowWidth, height: windowHeight } = useWindowSize()

  const onMouseMove = useEffectEvent((e: MouseEvent) => {
    if (windowWidth === undefined || windowHeight === undefined) return

    callbackRef.current(
      (e.clientX / windowWidth) * 2 - 1,
      (e.clientY / windowHeight) * 2 - 1
    )
  })

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])
}
