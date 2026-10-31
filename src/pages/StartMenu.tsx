import { useGame } from '@/hooks/GameContext'
import { loadGame } from '@/utils/storage'
import { Play, RotateCcw, Sparkles, Trophy, Brain, HeartPulse } from 'lucide-react'
import { formatAge } from '@/utils/format'

export function StartMenu() {
  const { goToCreation, continueGame, hasSavedGame } = useGame()
  const save = hasSavedGame ? loadGame() : null

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-grid-glow overflow-hidden">
      {/* ambient orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-pulse-glow" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent-cyan/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 chip glass border-white/10 mb-6">
          <Sparkles size={14} className="text-accent-cyan" />
          <span className="text-xs tracking-widest uppercase text-gray-300">AI-Powered Life Simulation RPG</span>
        </div>

        <h1 className="text-7xl sm:text-8xl font-extrabold tracking-tight leading-none">
          <span className="title-gradient text-glow">LIFE</span>
          <span className="text-accent-cyan">//</span>
          <span className="title-gradient text-glow">SIM</span>
        </h1>
        <p className="mt-5 text-gray-400 max-w-lg mx-auto text-lg">
          Start at 18. Build a career, wealth, skills and relationships. Every choice ripples through your entire life.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
          {save && (
            <button onClick={continueGame} className="btn-primary w-full max-w-sm text-base py-3.5">
              <Play size={18} /> Continue — {save.character.name}, {formatAge(save.character.startAgeMonths + save.monthIndex)}
            </button>
          )}
          <button
            onClick={goToCreation}
            className={save ? 'btn-ghost w-full max-w-sm text-base py-3.5' : 'btn-primary w-full max-w-sm text-base py-3.5'}
          >
            {save ? <RotateCcw size={18} /> : <Play size={18} />} {save ? 'Start a New Life' : 'Begin Your Life'}
          </button>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-4 max-w-xl mx-auto">
          {[
            { icon: <Brain className="text-accent" />, t: '50+ Events', d: 'Reactive world' },
            { icon: <Trophy className="text-accent-amber" />, t: '33 Achievements', d: 'Chase greatness' },
            { icon: <HeartPulse className="text-accent-pink" />, t: 'Full Life', d: 'Age 18 → 80' },
          ].map((f, i) => (
            <div key={i} className="card p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex justify-center mb-2">{f.icon}</div>
              <div className="font-semibold text-sm">{f.t}</div>
              <div className="text-xs text-gray-500">{f.d}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-xs text-gray-600 font-mono">v1.0 · deterministic engine · LLM-ready architecture</div>
      </div>
    </div>
  )
}
