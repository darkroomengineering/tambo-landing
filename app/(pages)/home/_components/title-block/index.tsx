import cn from 'clsx'
import type { ComponentProps } from 'react'
import { CTA } from '~/components/button'

function TitleBlockRoot({
  children,
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col items-center h-min', className)}
      {...props}
    >
      {children}
    </div>
  )
}

function TitleBlockLeadIn({
  children,
  className,
  ...props
}: ComponentProps<'p'>) {
  return (
    <p className={cn('typo-surtitle uppercase dr-mb-24', className)} {...props}>
      {children}
    </p>
  )
}

function TitleBlockTitle({
  children,
  className,
  level: Tag = 'h2',
  ...props
}: ComponentProps<'h2'> & { level: 'h2' | 'h3' | 'h4' }) {
  return (
    <Tag className={cn('typo-h1 text-center dr-mb-40', className)} {...props}>
      {children}
    </Tag>
  )
}

function TitleBlockButton({ children, ...props }: ComponentProps<typeof CTA>) {
  return <CTA {...props}>{children}</CTA>
}

export const TitleBlock = TitleBlockRoot as typeof TitleBlockRoot & {
  LeadIn: typeof TitleBlockLeadIn
  Title: typeof TitleBlockTitle
  Button: typeof TitleBlockButton
}
TitleBlock.LeadIn = TitleBlockLeadIn
TitleBlock.Title = TitleBlockTitle
TitleBlock.Button = TitleBlockButton
