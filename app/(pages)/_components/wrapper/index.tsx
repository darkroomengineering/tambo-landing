'use client'

import cn from 'clsx'
import type { LenisOptions } from 'lenis'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'
import { TransformProvider } from '~/hooks/use-transform'
import type { ThemeName } from '~/styles/config'
import { Canvas } from '~/webgl/components/canvas'
import { Lenis } from '../lenis'
import { Navigation } from '../navigation'
import { Theme } from '../theme'

interface WrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: ThemeName
  lenis?: boolean | LenisOptions
  webgl?: boolean | Omit<ComponentProps<typeof Canvas>, 'children'>
  githubStars?: string
}

export function Wrapper({
  children,
  theme = 'light',
  className,
  lenis = true,
  webgl,
  githubStars,
  ...props
}: WrapperProps) {
  const pathname = usePathname()

  const content = (
    <>
      {webgl && (
        <Canvas
          key={webgl ? `canvas-${pathname}` : undefined}
          root
          {...(typeof webgl === 'object' && webgl)}
        />
      )}
      <Navigation githubStars={githubStars} />
      <main
        className={cn('relative flex flex-col grow w-full', className)}
        {...props}
      >
        {children}
      </main>
      {lenis && <Lenis root options={typeof lenis === 'object' ? lenis : {}} />}
    </>
  )

  return (
    <Theme theme={theme} global>
      {webgl ? <TransformProvider>{content}</TransformProvider> : content}
    </Theme>
  )
}
