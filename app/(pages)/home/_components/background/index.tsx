import cn from 'clsx'
import s from './background.module.css'

function BoxShadow({
  x = 0,
  y = 0,
  blur = 0,
  opacity = 1,
}: {
  x?: number
  y?: number
  blur?: number
  opacity?: number
}) {
  return (
    <div
      className={cn('absolute inset-0 rounded-[inherit]', s.boxShadow)}
      style={{
        transform: `translate(${x}%, ${y}%)`,
        filter: `blur(${blur}px)`,
        opacity: opacity,
        backgroundColor: `rgba(127, 255, 195, 1)`,
      }}
    />
  )
}

export function BackgroundItem({
  opacity,
  hashed,
  style,
}: {
  opacity?: number
  hashed?: boolean
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn(
        'absolute aspect-[1/1] rounded-full left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%]',
        s.item
      )}
      style={style}
    >
      <div className="absolute inset-0 rounded-[inherit]">
        <BoxShadow y={36} blur={231} opacity={0.02} />
        <BoxShadow y={20} blur={195} opacity={0.07} />
        <BoxShadow y={9} blur={145} opacity={0.12} />
        <BoxShadow y={2} blur={79} opacity={0.14} />
      </div>
      <div
        className={cn(
          'absolute inset-0 rounded-[inherit] bg-[white]',
          s.opacity
        )}
        style={{ opacity: opacity }}
      />
      {hashed && (
        <div className={cn('absolute inset-0 rounded-[inherit]', s.hashed)} />
      )}
      <div
        className={cn(
          'absolute inset-0 rounded-[inherit] border-dashed border-[#00834633] border-1',
          s.border
        )}
      />
    </div>
  )
}

export default function Background() {
  return (
    <div className="fixed inset-0">
      <div className="absolute inset-0">
        <BackgroundItem opacity={0.4} hashed={true} style={{ height: '80%' }} />
        <BackgroundItem opacity={0.6} style={{ height: '70%' }} />
        <BackgroundItem opacity={0.8} hashed={true} style={{ height: '60%' }} />
        <BackgroundItem opacity={1} style={{ height: '50%' }} />

        {/* <BackgroundItem />
        <BackgroundItem />
        <BackgroundItem /> */}
      </div>
    </div>
  )
}
