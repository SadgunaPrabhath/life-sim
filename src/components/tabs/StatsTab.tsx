import { useGame } from '@/hooks/GameContext'
import { STAT_META } from '@/game/data/stats'
import { StatBar } from '@/components/ui/StatBar'
import { lifeScore, scoreGrade } from '@/game/engine/scoring'
import { Ring } from '@/components/ui/Ring'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts'

export function StatsTab() {
  const { state } = useGame()
  if (!state) return null
  const { total, categories } = lifeScore(state)
  const grade = scoreGrade(total)
  const happy = state.happinessHistory.slice(-30)

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Life Score */}
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">Life Score</div>
          <Ring value={total} size={160} stroke={12} color={grade.color}>
            <div>
              <div className="text-5xl font-extrabold text-white leading-none"><AnimatedNumber value={total} /></div>
              <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">/ 100</div>
            </div>
          </Ring>
          <div className="mt-3 text-lg font-bold" style={{ color: grade.color }}>{grade.label}</div>
        </div>

        {/* Category breakdown */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-200 text-sm mb-4">Life Score Breakdown</h3>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {categories.map((c) => (
              <div key={c.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-300">{c.icon} {c.label}</span>
                  <span className="font-mono text-sm font-semibold">{c.value}</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-cyan transition-[width] duration-700" style={{ width: `${c.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-200 text-sm mb-4">All Attributes</h3>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {STAT_META.map((m) => (
            <StatBar key={m.key} meta={m} value={state.stats[m.key]} />
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-200 text-sm mb-3">Happiness Over Time</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={happy} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#0b1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="#eab308" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
