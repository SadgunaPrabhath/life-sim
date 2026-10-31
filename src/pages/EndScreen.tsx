import { useGame } from '@/hooks/GameContext'
import { lifeScore, scoreGrade } from '@/game/engine/scoring'
import { netWorth } from '@/game/engine/finance'
import { AI } from '@/game/engine/ai'
import { CAREER_MAP } from '@/game/data/careers'
import { Ring } from '@/components/ui/Ring'
import { formatINR } from '@/utils/format'
import { RotateCcw } from 'lucide-react'

export function EndScreen() {
  const { state, newLife } = useGame()
  if (!state) return null
  const s = state
  const { total, categories } = lifeScore(s)
  const grade = scoreGrade(total)
  const age = Math.floor((s.character.startAgeMonths + s.monthIndex) / 12)
  const nw = netWorth(s)
  const career = s.career.careerId ? CAREER_MAP[s.career.careerId].levels[s.career.levelIndex].title : 'Independent'
  const story = AI.story.generateLifeStory(s)

  const goodEvents = s.history.filter((h) => h.tone === 'good' || h.tone === 'epic')
  const badEvents = s.history.filter((h) => h.tone === 'bad')
  const biggestSuccess = goodEvents[goodEvents.length - 1]?.text ?? 'Simply showing up every day.'
  const biggestFailure = badEvents[badEvents.length - 1]?.text ?? 'Remarkably few regrets.'
  const partner = s.npcs.find((n) => n.type === 'Partner') || s.npcs.find((n) => n.type === 'Best Friend')

  return (
    <div className="min-h-screen bg-grid-glow py-10 px-4 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-accent/15 blur-3xl" />
      <div className="relative z-10 max-w-3xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-xs font-mono tracking-[0.4em] text-accent-cyan uppercase">
            {s.retired ? 'A Life Well Lived' : 'The Final Chapter'}
          </div>
          <h1 className="text-5xl font-extrabold title-gradient mt-2">YOUR LIFE</h1>
          <div className="text-gray-400 mt-1">{s.character.name} · {s.character.city} · Age {age}</div>
        </div>

        {/* score */}
        <div className="card p-6 flex flex-col sm:flex-row items-center gap-6 mb-5">
          <Ring value={total} size={150} stroke={12} color={grade.color}>
            <div className="text-center">
              <div className="text-5xl font-extrabold text-white leading-none">{total}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500">/ 100</div>
            </div>
          </Ring>
          <div className="flex-1 w-full">
            <div className="text-2xl font-bold mb-3" style={{ color: grade.color }}>{grade.label} Life</div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-2">
              {categories.map((c) => (
                <div key={c.key}>
                  <div className="flex justify-between text-xs mb-0.5"><span className="text-gray-400">{c.icon} {c.label}</span><span className="font-mono text-gray-300">{c.value}</span></div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div className="h-full bg-gradient-to-r from-accent to-accent-cyan" style={{ width: `${c.value}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* summary grid */}
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <Fact label="Final Career" value={career} icon="💼" />
          <Fact label="Net Worth" value={formatINR(nw)} icon="💰" />
          <Fact label="Achievements" value={`${s.achievements.length} unlocked`} icon="🏆" />
          <Fact label="Relationships" value={`${s.npcs.length} bonds${partner ? ` · ${partner.name}` : ''}`} icon="❤️" />
          <Fact label="Biggest Success" value={biggestSuccess} icon="🌟" wide />
          <Fact label="Biggest Setback" value={biggestFailure} icon="🌧️" wide />
        </div>

        {/* story */}
        <div className="card p-6 mb-6">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-accent-cyan mb-3">Your Life Story</div>
          <p className="text-gray-200 leading-relaxed text-[15px]">{story}</p>
        </div>

        <button onClick={newLife} className="btn-primary w-full text-base py-3.5">
          <RotateCcw size={18} /> START NEW LIFE
        </button>
      </div>
    </div>
  )
}

function Fact({ label, value, icon, wide }: { label: string; value: string; icon: string; wide?: boolean }) {
  return (
    <div className={`card p-4 ${wide ? 'sm:col-span-2' : ''}`}>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-1.5">{icon} {label}</div>
      <div className="text-white font-semibold mt-1 text-sm">{value}</div>
    </div>
  )
}
