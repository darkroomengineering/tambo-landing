import { TitleBlock } from '~/app/(pages)/home/_components/title-block'
import HowItWorksSVG from '~/assets/svgs/how-it-works.svg'

export function HowItWorks() {
  return (
    <section>
      <TitleBlock className="dr-mb-56">
        <TitleBlock.LeadIn>
          {'<'} How It Works {'>'}
        </TitleBlock.LeadIn>
        <TitleBlock.Title level="h2" className="dt:mb-0! dr-mb-8">
          More than a SDK.
          <br /> A complete platform.
        </TitleBlock.Title>
        <TitleBlock.Subtitle className="typo-p! dt:typo-p-l!">
          SDK + UI components, backed by hosted API and dashboard.
          <br className="desktop-only" />
          Everything you need to add AI to your
          <br className="mobile-only" /> app.
        </TitleBlock.Subtitle>
      </TitleBlock>
      <div className="dr-px-40 dr-pb-40">
        <div className="aspect-[1360/790] bg-grey dr-rounded-20">
          <HowItWorksSVG className="dr-w-full dr-h-full" />
        </div>
      </div>
    </section>
  )
}
