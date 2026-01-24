import { TitleBlock } from "~/app/(pages)/home/_components/title-block";
import HowItWorksSVG from "~/assets/svgs/how-it-works/how-it-works-diagram-desktop.svg";
import { Image } from "~/components/image";
import HowItWorksMobileSVG from "~/assets/svgs/how-it-works/how-it-works-diagram-mobile.svg";

export function HowItWorks() {
  return (
    <section className="bg-white">
      <TitleBlock className="dr-mb-56">
        <TitleBlock.LeadIn>how It Works</TitleBlock.LeadIn>
        <TitleBlock.Title level="h2" className="dt:mb-0! dr-mb-8">
          The missing layer <br className="desktop-only" /> between React and
          LLMs
        </TitleBlock.Title>
      </TitleBlock>
      <div className="dt:dr-px-8 dr-px-8">
        <div className="dt:dr-py-94 dr-py-40 dr-px-16 dr-rounded-20 flex overflow-hidden items-center justify-center relative w-full h-full">
          <Image
            src={"/assets/how-it-works/how-it-works-bg-desktop.png"}
            alt="how it works background"
            fill
          />
          <HowItWorksSVG className="desktop-only dr-w-1044 dr-h-444 relative" />
          <HowItWorksMobileSVG className="mobile-only relative" />
        </div>
      </div>
    </section>
  );
}
