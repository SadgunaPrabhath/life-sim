import { useGame } from '@/hooks/GameContext'
import { CAREERS, CAREER_MAP } from '@/game/data/careers'
import { careerSkillScore } from '@/game/engine/skills'
import { formatINR } from '@/utils/format'
import { Lock, Check, TrendingUp, Star, Repeat } from 'lucide-react'
import { yearForMonth } from '@/utils/format'

export function CareerTab() {
  const { state, mutate } = useGame()
  if (!state) return null
  const cur = state.career
  const car = cur.careerId ? CAREER_MAP[cur.careerId] : null

  const switchTo = (careerId: string) => {
    const target = CAREER_MAP[careerId]
    const fit = careerSkillScore(state, target.keySkills)
    // Enter at the highest level the player qualifies for (min level 0).
    let lvl = 0
    for (let i = target.levels.length - 1; i >= 0; i--) {
      if (fit >= target.levels[i].minSkill) { lvl = i; break }
    }
    mutate((s) => {
      s.career.careerId = careerId
      s.career.levelIndex = lvl
      s.career.monthsInRole = 0
      s.career.salary = target.levels[lvl].baseSalary
      s.career.performance = 50
      s.career.satisfaction = 65
      s.stats.happiness = Math.min(100, s.stats.happiness + 4)
      s.history.push({ month: s.monthIndex, year: yearForMonth(s.monthIndex), icon: target.icon, text: `Switched career to ${target.levels[lvl].title}.`, tone: 'neutral' })
    }, { icon: target.icon, title: 'Career Changed', message: `You are now a ${target.levels[lvl].title}.`, tone: 'good' })
  }

  return (
    <div className="space-y-4">
      {car ? (
        <div className="card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{car.icon}</div>
              <div>
                <div className="text-xs uppercase tracking-widest text-accent-cyan">{car.field}</div>
                <h2 className="text-2xl font-bold text-white">{car.levels[cur.levelIndex].title}</h2>
                <div className="text-lg font-mono font-semibold text-accent-green mt-0.5">{formatINR(cur.salary)}<span className="text-xs text-gray-500">/mo</span></div>
              </div>
            </div>
            <div className="flex gap-5">
              <Metric label="Performance" value={cur.performance} icon={<TrendingUp size={14} />} />
              <Metric label="Satisfaction" value={cur.satisfaction} icon={<Star size={14} />} />
              <Metric label="Months" value={cur.totalMonthsWorked} icon={<Repeat size={14} />} raw />
            </div>
          </div>

          {/* Ladder */}
          <div className="mt-6 space-y-2">
            <div className="text-sm font-semibold text-gray-300 mb-2">Career Ladder</div>
            {car.levels.map((lv, i) => {
              const done = i < cur.levelIndex
              const current = i === cur.levelIndex
              const fit = careerSkillScore(state, car.keySkills)
              const qualified = fit >= lv.minSkill
              return (
                <div key={i} className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${current ? 'border-accent/50 bg-accent/10 shadow-glow' : done ? 'border-accent-green/25 bg-accent-green/5' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${current ? 'bg-accent text-white' : done ? 'bg-accent-green/80 text-white' : 'bg-white/10 text-gray-500'}`}>
                    {done ? <Check size={14} /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm ${current ? 'text-white' : done ? 'text-gray-300' : 'text-gray-400'}`}>{lv.title}</div>
                    <div className="text-xs text-gray-500">Requires skill fit {lv.minSkill}+ · {formatINR(lv.baseSalary, { compact: true })}/mo</div>
                  </div>
                  {!done && !current && (
                    <span className={`chip text-[10px] ${qualified ? 'bg-accent-green/15 text-accent-green' : 'bg-white/5 text-gray-500'}`}>
                      {qualified ? '✓ Eligible' : `fit ${Math.round(fit)}/${lv.minSkill}`}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-500 mt-3">💡 Promotions happen automatically once you meet the skill fit & performance bar — or use the <b>Ask for Promotion</b> action to push for it early.</p>
        </div>
      ) : (
        <div className="card p-6 text-center">
          <div className="text-4xl mb-2">🎓</div>
          <h2 className="text-xl font-bold text-white">No career yet</h2>
          <p className="text-gray-400 text-sm mt-1">Use the <b>Apply for Jobs</b> action (Career) to land your first role, or pick a path below to jump straight in if you qualify.</p>
        </div>
      )}

      {/* Explore / switch careers */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-200 text-sm mb-3">{car ? 'Switch Career Path' : 'Career Paths'}</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {CAREERS.map((c) => {
            const fit = careerSkillScore(state, c.keySkills)
            const canEntry = fit >= c.levels[0].minSkill
            const isCurrent = c.id === cur.careerId
            return (
              <button
                key={c.id}
                disabled={isCurrent}
                onClick={() => switchTo(c.id)}
                className={`text-left rounded-2xl p-3.5 border transition-all ${isCurrent ? 'border-accent/50 bg-accent/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{c.icon}</span>
                  {isCurrent ? <span className="chip bg-accent/20 text-violet-200 text-[10px]">Current</span> : canEntry ? <span className="chip bg-accent-green/15 text-accent-green text-[10px]">Eligible</span> : <Lock size={13} className="text-gray-600" />}
                </div>
                <div className="font-semibold text-sm text-white mt-1.5">{c.name}</div>
                <div className="text-[11px] text-gray-500 leading-snug mt-0.5">{c.description}</div>
                <div className="text-[10px] text-gray-600 mt-2 font-mono">up to {formatINR(c.levels[c.levels.length - 1].baseSalary, { compact: true })}/mo</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, icon, raw }: { label: string; value: number; icon: React.ReactNode; raw?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-1 justify-center">{icon}{label}</div>
      <div className="font-bold text-white text-lg">{raw ? value : `${Math.round(value)}%`}</div>
    </div>
  )
}
