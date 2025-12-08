'use client'

import { useContext, useEffect } from 'react'
import { BackgroundContext } from '~/app/(pages)/home/_components/background/context'

export function Section1() {
  const { getItems } = useContext(BackgroundContext)

  useEffect(() => {
    const items = getItems()
    console.log(items)
  }, [getItems])

  return (
    <section className="flex flex-col items-center justify-center h-screen">
      <div className="dr-w-col-6 flex flex-col dr-gap-8 text-center">
        <h1 className="typo-h1">
          You shouldn&apos;t need a PhD
          <br />
          to add AI to your app
        </h1>
        <p className="typo-p-l">
          Turn any React app into an AI-powered experience in minutes
        </p>
      </div>
      <div className="flex dr-gap-16 dr-mt-40">{/* Add Buttons here */}</div>
    </section>
  )
}
