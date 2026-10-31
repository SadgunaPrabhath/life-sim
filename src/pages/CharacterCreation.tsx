import { useMemo, useState } from 'react'
import { useGame } from '@/hooks/GameContext'
import type { EducationLevel, Personality } from '@/types'
import { generateStats } from '@/game/engine/state'
import { STAT_META } from '@/game/data/stats'
import { StatBar } from '@/components/ui/StatBar'
import { ArrowLeft, ArrowRight, Dice5 } from 'lucide-react'

const PERSONALITIES: { key: Personality; icon: string; blurb: string }[] = [
  { key: 'Ambitious', icon: '🎯', blurb: 'Driven & relentless. +Discipline, +Reputation.' },
  { key: 'Genius', icon: '🧠', blurb: 'Brilliant but solitary. +Intelligence, -Social.' },
  { key: 'Risk Taker', icon: '🎲', blurb: 'Bold & impulsive. +Reputation, -Discipline.' },
  { key: 'Social', icon: '🦋', blurb: 'Magnetic & warm. +Social, +Happiness.' },
  { key: 'Disciplined', icon: '🧘', blurb: 'Steady & tough. +Discipline, +Health.' },
  { key: 'Creative', icon: '🎨', blurb: 'Imaginative & free. +Skills, +Happiness.' },
  { key: 'Balanced', icon: '⚖️', blurb: 'Well-rounded. Small boost to everything.' },
]

const EDUCATIONS: EducationLevel[] = ['High School', 'Diploma', 'Undergraduate', 'Postgraduate', 'Self-Taught']
const CITIES = ['Tirupati', 'Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi', 'Chennai', 'Pune']
const MONEY_PRESETS = [10000, 50000, 100000, 250000]

export function CharacterCreation() {
  const { startGame, backToMenu } = useGame()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [ageYears, setAge] = useState(18)
  const [city, setCity] = useState('Tirupati')
  const [education, setEducation] = useState<EducationLevel>('Undergraduate')
  const [money, setMoney] = useState(50000)
  const [personality, setPersonality] = useState<Personality | null>(null)

  const stats = useMemo(() => (personality ? generateStats(personality) : null), [personality])

  const canNext = step === 0 ? name.trim().length > 0 : step === 1 ? true : !!personality

  const finish = () => {
    if (!personality) return
    startGame({ name, ageYears, city, education, startingMoney: money, personality })
  }

  return (
    <div className="min-h-screen bg-grid-glow p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* progress */}
        <div className="flex items-center gap-2 mb-6">
          {['Identity', 'Resources', 'Personality'].map((label, i) => (
            <div key={i} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all ${i <= step ? 'bg-gradient-to-r from-accent to-accent-cyan' : 'bg-white/10'}`} />
              <div className={`text-[11px] mt-1.5 font-mono uppercase tracking-wider ${i === step ? 'text-accent-cyan' : 'text-gray-600'}`}>{label}</div>
            </div>
          ))}
        </div>

        <div className="card p-6 sm:p-8 animate-scale-in">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold title-gradient">Who are you?</h2>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Age: <span className="text-white font-semibold">{ageYears}</span></label>
                  <input type="range" min={18} max={25} value={ageYears} onChange={(e) => setAge(Number(e.target.value))} className="w-full accent-violet-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">City</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 focus:border-accent/60 focus:outline-none">
                    {CITIES.map((c) => <option key={c} className="bg-bg-soft">{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Education</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EDUCATIONS.map((e) => (
                    <button key={e} onClick={() => setEducation(e)} className={`rounded-xl px-3 py-2.5 text-sm border transition ${education === e ? 'border-accent/60 bg-accent/15 text-white' : 'border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.06]'}`}>{e}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold title-gradient">Starting resources</h2>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Starting Money: <span className="text-white font-semibold font-mono">₹{money.toLocaleString('en-IN')}</span></label>
                <input type="range" min={5000} max={500000} step={5000} value={money} onChange={(e) => setMoney(Number(e.target.value))} className="w-full accent-cyan-400" />
                <div className="flex flex-wrap gap-2 mt-3">
                  {MONEY_PRESETS.map((m) => (
                    <button key={m} onClick={() => setMoney(m)} className={`chip border transition ${money === m ? 'border-accent-cyan/60 bg-accent-cyan/15 text-white' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>₹{m.toLocaleString('en-IN')}</button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-sm text-gray-400">
                💡 More starting money means an easier early game — but a smaller challenge. A leaner start rewards smart play with a higher Life Score.
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold title-gradient">Choose your nature</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PERSONALITIES.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPersonality(p.key)}
                    className={`text-left rounded-2xl p-3.5 border transition-all ${personality === p.key ? 'border-accent/60 bg-accent/15 shadow-glow scale-[1.02]' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}
                  >
                    <div className="text-2xl">{p.icon}</div>
                    <div className="font-semibold text-sm mt-1 text-white">{p.key}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5 leading-snug">{p.blurb}</div>
                  </button>
                ))}
              </div>

              {stats && (
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 animate-fade-in">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-accent-cyan">
                    <Dice5 size={16} /> Generated Starting Stats
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                    {STAT_META.map((m) => (
                      <StatBar key={m.key} meta={m} value={stats[m.key]} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => (step === 0 ? backToMenu() : setStep(step - 1))}
              className="btn-ghost"
            >
              <ArrowLeft size={16} /> {step === 0 ? 'Menu' : 'Back'}
            </button>
            {step < 2 ? (
              <button disabled={!canNext} onClick={() => setStep(step + 1)} className="btn-primary">
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button disabled={!personality} onClick={finish} className="btn-primary animate-pulse-glow">
                Begin Life <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
