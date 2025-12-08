import { Wrapper } from '../_components/wrapper'
import Background from './_components/background'
import { Section1 } from './_sections/section-1'

export default function Home() {
  return (
    <Wrapper theme="light" lenis={{}}>
      <Section1 />
      <div className="h-[300vh]" />
      <Background />
    </Wrapper>
  )
}
