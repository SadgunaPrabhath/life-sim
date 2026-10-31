import { useGame } from '@/hooks/GameContext'
import { formatAge, formatMonthYear, formatINR } from '@/utils/format'
import { netWorth } from '@/game/engine/finance'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { CAREER_MAP } from '@/game/data/careers'
import { Save, MapPin, Briefcase } from 'lucide-react'

export function TopBar() {
  const { state, saveNow } = useGame()
  if (!state) return null
  const ageMonths = state.character.startAgeMonths + state.monthIndex
  const occupation = state.career.careerId
    ? CAREER_MAP[state.career.careerId].levels[state.career.levelIndex].title
    : 'Student / Exploring'
  const nw = netWorth(state)

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="font-extrabold text-xl sm:text-2xl tracking-tight shrink-0">
            <span className="title-gradient">LIFE</span>
            <span className="text-accent-cyan">//</span>
            <span className="title-gradient">SIM</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm text-gray-400 min-w-0">
            <span className="flex items-center gap-1.5"><MapPin size={13} className="text-accent-cyan" /> {state.character.city}</span>
            <span className="flex items-center gap-1.5 truncate"><Briefcase size={13} className="text-accent" /> <span className="truncate">{occupation}</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 leading-none">Age</div>
            <div className="text-sm font-semibold text-white leading-tight">{formatAge(ageMonths)}</div>
          </div>
          <div className="text-right hidden xs:block">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 leading-none">{formatMonthYear(state.monthIndex)}</div>
            <div className="text-sm font-bold text-accent-green leading-tight">
              <AnimatedNumber value={nw} format={(n) => formatINR(n, { compact: true })} />
            </div>
          </div>
          <button onClick={saveNow} className="btn-ghost !px-2.5 !py-2" title="Save game">
            <Save size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
