import type { StatMeta } from '@/game/data/stats'
import { AnimatedNumber } from './AnimatedNumber'

interface Props {
  meta: StatMeta
  value: number
  compact?: boolean
}

export function StatBar({ meta, value, compact }: Props) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
          <span className="text-base leading-none">{meta.icon}</span>
          {!compact && meta.label}
        </span>
        <AnimatedNumber
          value={pct}
          className="font-mono text-sm font-semibold tabular-nums"
        />
      </div>
      <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden relative">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${meta.gradient} transition-[width] duration-700 ease-out relative`}
          style={{ width: `${pct}%`, boxShadow: `0 0 12px -2px ${meta.color}` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
