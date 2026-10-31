import { useGame } from '@/hooks/GameContext'
import { STAT_META } from '@/game/data/stats'
import { StatBar } from '@/components/ui/StatBar'
import { Ring } from '@/components/ui/Ring'
import { ActionTray } from '@/components/game/ActionTray'
import { lifeScore, scoreGrade } from '@/game/engine/scoring'
import { netWorth, monthlyIncome, monthlyExpenses } from '@/game/engine/finance'
import { formatINR, formatAge } from '@/utils/format'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { CAREER_MAP } from '@/game/data/careers'
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts'

export function LifeTab() {
  const { state } = useGame()
  if (!state) return null
  const c = state.character
  const { total } = lifeScore(state)
  const grade = scoreGrade(total)
  const income = monthlyIncome(state)
  const expenses = monthlyExpenses(state)
  const nw = netWorth(state)
  const occ = state.career.careerId ? CAREER_MAP[state.career.careerId].levels[state.career.levelIndex].title : 'Student'
  const chartData = state.netWorthHistory.slice(-24)

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* LEFT: character + score */}
      <div className="lg:col-span-2 space-y-4">
        {/* hero card */}
        <div className="card p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-30" style={{ background: `hsl(${c.avatarHue},70%,50%)` }} />
          <div className="relative flex items-start gap-4 sm:gap-5">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0 flex items-center justify-center text-4xl font-bold shadow-glow border border-white/20"
              style={{ background: `linear-gradient(135deg, hsl(${c.avatarHue},65%,45%), hsl(${(c.avatarHue + 60) % 360},65%,40%))` }}
            >
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{c.name}</h2>
              <div className="text-sm text-gray-400 mt-0.5">{formatAge(c.startAgeMonths + state.monthIndex)} · {c.personality}</div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="chip bg-accent/15 border border-accent/25 text-violet-200">💼 {occ}</span>
                <span className="chip bg-white/5 text-gray-300">📍 {c.city}</span>
                <span className="chip bg-white/5 text-gray-300">🎓 {c.education}</span>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-center shrink-0">
              <Ring value={total} size={104} stroke={9} color={grade.color}>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-white leading-none"><AnimatedNumber value={total} /></div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-400">/ 100</div>
                </div>
              </Ring>
              <div className="text-xs font-semibold mt-1" style={{ color: grade.color }}>{grade.label}</div>
            </div>
          </div>
        </div>

        {/* money row */}
        <div className="grid grid-cols-3 gap-3">
          <MoneyCard label="Cash" value={state.finance.cash} tone="cyan" />
          <MoneyCard label="Income / mo" value={income} tone="green" />
          <MoneyCard label="Net Worth" value={nw} tone="violet" big />
        </div>

        {/* net worth chart */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-200 text-sm">Net Worth Trajectory</h3>
            <span className="text-xs text-gray-500 font-mono">last {chartData.length} mo</span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#0b1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  labelFormatter={(l) => `Month ${l}`}
                  formatter={(v: any) => [formatINR(v, { compact: true }), 'Net Worth']}
                />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="url(#nwGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* stats grid */}
        <div className="card p-4 sm:p-5">
          <h3 className="font-semibold text-gray-200 text-sm mb-4">Vital Stats</h3>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3.5">
            {STAT_META.map((m) => (
              <StatBar key={m.key} meta={m} value={state.stats[m.key]} />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: action tray */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-20">
          <ActionTray />
        </div>
      </div>
    </div>
  )
}

function MoneyCard({ label, value, tone, big }: { label: string; value: number; tone: string; big?: boolean }) {
  const color = tone === 'green' ? 'text-accent-green' : tone === 'cyan' ? 'text-accent-cyan' : 'text-violet-300'
  return (
    <div className="card p-3.5">
      <div className="text-[10px] uppercase tracking-widest text-gray-500">{label}</div>
      <div className={`font-bold ${big ? 'text-lg' : 'text-base'} ${color} mt-0.5`}>
        <AnimatedNumber value={value} format={(n) => formatINR(n, { compact: true })} />
      </div>
    </div>
  )
}
