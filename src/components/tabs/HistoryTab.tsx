import { useGame } from '@/hooks/GameContext'
import type { HistoryEntry } from '@/types'

const toneColor: Record<string, string> = {
  good: 'border-accent-green/40 bg-accent-green/5',
  bad: 'border-accent-red/40 bg-accent-red/5',
  epic: 'border-accent/50 bg-accent/10 shadow-glow',
  neutral: 'border-white/10 bg-white/[0.02]',
}

export function HistoryTab() {
  const { state } = useGame()
  if (!state) return null

  // Group history by year, newest first.
  const byYear = new Map<number, HistoryEntry[]>()
  for (const h of state.history) {
    if (!byYear.has(h.year)) byYear.set(h.year, [])
    byYear.get(h.year)!.push(h)
  }
  const years = [...byYear.keys()].sort((a, b) => b - a)

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h2 className="text-xl font-bold text-white">Life Timeline</h2>
        <p className="text-sm text-gray-400">{state.history.length} moments that shaped your journey.</p>
      </div>

      <div className="relative pl-6">
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-accent via-accent-cyan to-transparent" />
        {years.map((year) => (
          <div key={year} className="mb-6">
            <div className="flex items-center gap-3 mb-3 -ml-6">
              <div className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-accent to-accent-cyan shadow-glow shrink-0" />
              <div className="text-lg font-extrabold title-gradient">{year}</div>
            </div>
            <div className="space-y-2">
              {byYear.get(year)!.slice().reverse().map((h, i) => (
                <div key={i} className={`rounded-xl border px-4 py-2.5 flex items-center gap-3 animate-fade-in ${toneColor[h.tone]}`}>
                  <span className="text-xl shrink-0">{h.icon}</span>
                  <span className="text-sm text-gray-200">{h.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
