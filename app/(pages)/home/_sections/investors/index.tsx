import { HashPattern } from '~/app/(pages)/home/_components/hash-pattern'
import { investors } from './data'
import PartnershipSVG from './icons/partnership.svg'

export function Investors() {
  return (
    <section className="dt:dr-px-271 dt:dr-pb-200">
      <h2 className="typo-h2 text-center dr-mb-56">
        Backed by top investors and builders{' '}
      </h2>
      <div className="border border-dark-grey dt:dr-rounded-20 w-full dt:dr-p-8 bg-white dt:dr-mb-24">
        <div className="relative overflow-hidden border border-dark-grey dt:dr-rounded-12 flex items-center justify-center">
          <HashPattern className="absolute inset-0 text-dark-grey z-0" />
          <PartnershipSVG className="dr-w-353 relative z-1" />
        </div>
      </div>
      <div className="dt:grid dt:grid-cols-3 dt:dr-gap-24">
        {investors.map((investor) => (
          <div
            key={investor?.name}
            className="flex dr-gap-32 border border-dark-grey dt:dr-rounded-20 dt:dr-p-8 bg-white items-center"
          >
            <div className="dr-size-80 dr-rounded-12 border border-dark-grey grid place-items-center relative overflow-hidden">
              <HashPattern className="absolute inset-0 text-dark-grey z-0" />
              {investor?.icon}
            </div>

            <div className="flex flex-col dr-gap-4">
              <p className="typo-p-bold">{investor.name}</p>
              <span className="typo-label-s dr-px-8 dr-py-4 dr-rounded-16 bg-off-white w-fit">
                {investor?.position}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
