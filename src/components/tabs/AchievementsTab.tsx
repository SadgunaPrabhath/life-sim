import { useGame } from '@/hooks/GameContext'
import { ACHIEVEMENTS } from '@/game/data/achievements'
import { Lock } from 'lucide-react'

const tierStyle: Record<string, string> = {
  bronze: 'from-amber-700/30 to-amber-600/10 border-amber-600/40',
  silver: 'from-slate-400/30 to-slate-300/10 border-slate-300/40',
  gold: 'from-yellow-500/30 to-amber-400/10 border-yellow-400/50',
  legendary: 'from-fuchsia-600/30 to-violet-500/15 border-fuchsia-400/60',
}
const tierLabel: Record<string, string> = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', legendary: 'Legendary' }

export function AchievementsTab() {
  const { state } = useGame()
  if (!state) return null
  const unlocked = new Set(state.achievements)
  const count = unlocked.size

  return (
    <div className="space-y-4">
      <div className="card p-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Achievements</h2>
          <p className="text-sm text-gray-400">{count} of {ACHIEVEMENTS.length} unlocked</p>
        </div>
        <div className="w-40">
          <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-accent to-accent-cyan transition-[width] duration-700" style={{ width: `${(count / ACHIEVEMENTS.length) * 100}%` }} />
          </div>
          <div className="text-right text-xs text-gray-500 mt-1 font-mono">{Math.round((count / ACHIEVEMENTS.length) * 100)}%</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const on = unlocked.has(a.id)
          return (
            <div
              key={a.id}
              className={`rounded-2xl border p-4 flex items-center gap-3 transition-all ${on ? `bg-gradient-to-br ${tierStyle[a.tier]}` : 'border-white/[0.06] bg-white/[0.02] opacity-70'}`}
            >
              <div className={`text-3xl shrink-0 ${on ? '' : 'grayscale opacity-40'}`}>{on ? a.icon : <Lock className="text-gray-600" size={26} />}</div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${on ? 'text-white' : 'text-gray-400'}`}>{a.name}</span>
                  <span className={`chip text-[8px] py-0 ${on ? 'bg-white/10 text-gray-200' : 'bg-white/5 text-gray-600'}`}>{tierLabel[a.tier]}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5 leading-snug">{a.description}</div>
                <div className={`text-[10px] font-mono mt-1 ${on ? 'text-accent-green' : 'text-gray-600'}`}>{on ? '🏆 Unlocked' : '🔒 Locked'}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
