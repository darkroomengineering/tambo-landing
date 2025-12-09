'use client'

import { useRect } from 'hamo'
import { useContext, useEffect } from 'react'
import { BackgroundContext } from '~/app/(pages)/home/_components/background/context'
// import { useScrollTrigger } from '~/hooks/use-scroll-trigger'

export function Section2() {
  const { getItems } = useContext(BackgroundContext)

  useEffect(() => {
    const items = getItems()
    console.log(items)
  }, [getItems])

  const [setRectRef, rect] = useRect()

  //   useScrollTrigger({
  //     rect,
  //     start: 'top bottom',
  //     end: 'bottom bottom',
  //     onProgress: ({ progress }) => {
  //       console.log('section2', progress)
  //     },
  //   })

  return (
    <section
      ref={setRectRef}
      className="h-screen flex items-center justify-center"
    >
      <div className="aspect-square bg-[red] w-[10%]" />
    </section>
  )
}
