import { Wrapper } from '../_components/wrapper'

export default function StyleGuide() {
  return (
    <Wrapper theme="light" lenis={{}}>
      <div className="dr-pt-120 px-safe flex flex-col dr-gap-15">
        <h1 className="h1">Heading 1</h1>
        <h2 className="h2">Heading 2</h2>
        <h3 className="h3">Heading 3</h3>
        <h4 className="h4">Heading 4</h4>
        <p className="p">Paragraph</p>
        <p className="p-s">Paragraph Small</p>
        <p className="p-l">Paragraph Large</p>
        <p className="code-snippet">Code Snippet</p>
        <p className="label-m">Label Medium</p>
        <p className="label-s">Label Small</p>
        <p className="button">Button</p>
        <p className="link">Link</p>
        <p className="surtitle">Surtitle</p>
        <div className="dr-h-50 w-full bg-ghost-mint">
          <p className="p">Ghost Mint</p>
        </div>
        <div className="dr-h-50 w-full bg-mint">
          <p className="p">Mint</p>
        </div>
        <div className="dr-h-50 w-full bg-teal">
          <p className="p">Teal</p>
        </div>
        <div className="dr-h-50 w-full bg-dark-teal">
          <p className="p">Dark Teal</p>
        </div>
        <div className="dr-h-50 w-full bg-off-white">
          <p className="p">Off White</p>
        </div>
        <div className="dr-h-50 w-full bg-light-gray">
          <p className="p">Light Gray</p>
        </div>
        <div className="dr-h-50 w-full bg-grey">
          <p className="p">Grey</p>
        </div>
        <div className="dr-h-50 w-full bg-dark-grey">
          <p className="p">Dark Grey</p>
        </div>
        <div className="dr-h-50 w-full bg-white">
          <p className="p">White</p>
        </div>
        <div className="dr-h-50 w-full bg-white-80">
          <p className="p">White 80</p>
        </div>
        <div className="dr-h-50 w-full bg-white-60">
          <p className="p">White 60</p>
        </div>
        <div className="dr-h-50 w-full bg-white-50">
          <p className="p">White 50</p>
        </div>
        <div className="dr-h-50 w-full bg-black">
          <p className="p text-white">Black</p>
        </div>
        <div className="dr-h-50 w-full bg-black-70">
          <p className="p">Black 70</p>
        </div>
        <div className="dr-h-50 w-full bg-black-50">
          <p className="p">Black 50</p>
        </div>
        <div className="dr-h-50 w-full bg-forest">
          <p className="p">Forest</p>
        </div>
        <div className="dr-h-50 w-full bg-forest-50">
          <p className="p">Forest 50</p>
        </div>
        <div className="dr-h-50 w-full bg-forest-30">
          <p className="p">Forest 30</p>
        </div>
        <div className="dr-h-50 w-full bg-forest-20">
          <p className="p">Forest 20</p>
        </div>
        <div className="dr-h-50 w-full bg-forest-10">
          <p className="p">Forest 10</p>
        </div>
      </div>
    </Wrapper>
  )
}
