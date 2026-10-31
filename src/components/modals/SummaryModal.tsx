import { useGame } from '@/hooks/GameContext'
import { Modal } from '@/components/ui/Modal'
import { formatINR } from '@/utils/format'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function SummaryModal() {
  const { pendingSummary, dismissSummary, pendingEvent } = useGame()
  // Don't show summary until any event is resolved (event stacks on top).
  if (!pendingSummary || pendingEvent) return null
  const s = pendingSummary
  const up = s.netWorthDelta >= 0
  return (
    <Modal open size="md" dismissable={false}>
      <div className="p-6 sm:p-7">
        <div className="text-center">
          <div className="text-xs font-mono tracking-[0.3em] text-accent-cyan uppercase">Monthly Report</div>
          <h2 className="text-3xl font-extrabold title-gradient mt-1">{s.monthLabel}</h2>
        </div>

        <div className="mt-5 space-y-2">
          {s.lines.map((l, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-3.5 py-2.5 animate-slide-up"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <span className="flex items-center gap-2.5 text-sm text-gray-200">
                <span className="text-lg">{l.icon}</span>
                {l.label}
              </span>
              <span
                className={`font-mono font-semibold text-sm ${
                  l.tone === 'good' ? 'text-accent-green' : l.tone === 'bad' ? 'text-accent-red' : 'text-gray-300'
                }`}
              >
                {l.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-gradient-to-r from-accent/15 to-accent-cyan/15 border border-white/10 p-4 text-center">
          <div className="text-xs uppercase tracking-widest text-gray-400">Net Worth</div>
          <div className="text-3xl font-extrabold text-white mt-1">{formatINR(s.netWorth)}</div>
          <div className={`mt-1 inline-flex items-center gap-1 text-sm font-semibold ${up ? 'text-accent-green' : 'text-accent-red'}`}>
            {up ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            {formatINR(s.netWorthDelta, { sign: true })}
          </div>
        </div>

        <button onClick={dismissSummary} className="btn-primary w-full mt-5">
          Continue →
        </button>
      </div>
    </Modal>
  )
}
