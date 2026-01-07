import cn from 'clsx'
import { useAssitant } from '~/integrations/tambo'

/**
Itinerary item schema:
itinerary [
  {
    poi: {
      id: 'dXJuOm1ieHBvaTo1YzlhNmI1OC00ZWQ5LTQxNzItOWJiNS1iYmVkODAyNDBjZDU',
      lat: 48.854256,
      lon: 2.350285,
      name: "Au Vieux Paris d'Arcole",
      type: 'poi'
    },
    selectedDate: '2026-07-01 21:00'
  }
]
 */

export function AssistantNotifications({ className }: { className: string }) {
  const { finishSeatSelection, choosedSeat, itinerary, destination } =
    useAssitant()

  return (
    <div
      className={cn(
        'border border-dark-grey dr-rounded-20 dr-p-8 dr-pb-16 opacity-0 transition-opacity duration-200 ease-in-out dr-w-207',
        destination.name && 'opacity-100',
        className
      )}
    >
      <div className="typo-p-sentient dr-p-16 border border-dark-grey dr-rounded-12 bg-off-white/80 dr-mb-16">
        <p>myTravel Assistant</p>
      </div>
      <ul className="flex flex-col dr-gap-23 dr-p-8">
        <li>
          <span className="block typo-label-s opacity-50">
            {'<'}Destination{'>'}
          </span>
          <span className="typo-label-s">{destination?.name}</span>
        </li>
        <li>
          <span className="block typo-label-s opacity-50">
            {'<'}Flight seats{'>'}
          </span>{' '}
          <span className="typo-label-s">
            {' '}
            {choosedSeat.length > 0 ? choosedSeat.join(', ') : 'None'}
          </span>
        </li>
        <li>
          <span className="block typo-label-s opacity-50">
            {'<'}Planned activities{'>'}
          </span>{' '}
          {/* <span className="typo-label-s">
            {itinerary.length > 0
              ? itinerary
                  .sort(
                    (a, b) =>
                      new Date(a.selectedDate).getTime() -
                      new Date(b.selectedDate).getTime()
                  )
                  .map((item) => item.poi.name)
                  .join(', ')
              : 'None'}
          </span> */}
        </li>
        <li>
          <span className="typo-label-m">Seat selection: </span>
          <span className="typo-label-s">
            {choosedSeat.length > 0 ? choosedSeat.join(', ') : 'None'}
          </span>
          <button
            type="button"
            className="typo-label-s"
            onClick={() => finishSeatSelection('7E')}
          >
            Random seat
          </button>
        </li>
        <li>
          <span className="typo-label-m">Itinerary: </span>
          <span className="typo-label-s">
            {itinerary.length > 0
              ? itinerary
                  .sort(
                    (a, b) =>
                      new Date(a.selectedDate).getTime() -
                      new Date(b.selectedDate).getTime()
                  )
                  .map(
                    (item) =>
                      `${item.poi.name} ${item.selectedDate ? `(Selected date: ${item.selectedDate})` : ''}`
                  )
                  .join(', ')
              : 'Empty'}
          </span>
        </li>
      </ul>
    </div>
  )
}
