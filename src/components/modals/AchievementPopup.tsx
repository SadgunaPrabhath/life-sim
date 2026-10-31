import { useGame } from '@/hooks/GameContext'
import { ACHIEVEMENT_MAP } from '@/game/data/achievements'
import { useEffect } from 'react'

const tierGlow: Record<string, string> = {
  bronze: 'from-amber-700/40 to-amber-500/20 border-amber-500/40',
  silver: 'from-slate-400/40 to-slate-200/20 border-slate-300/40',
  gold: 'from-yellow-500/40 to-amber-400/20 border-yellow-400/50',
  legendary: 'from-fuchsia-600/40 to-violet-500/30 border-fuchsia-400/60',
}

export function AchievementPopup() {
  const { achievementPopup, clearAchievementPopup } = useGame()
  useEffect(() => {
    if (achievementPopup) {
      const t = setTimeout(() => clearAchievementPopup(), 3200)
      return () => clearTimeout(t)
    }
  }, [achievementPopup, clearAchievementPopup])

  if (!achievementPopup) return null
  const a = ACHIEVEMENT_MAP[achievementPopup]
  if (!a) return null

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] pointer-events-none">
      <div
        className={`glass-strong rounded-2xl border bg-gradient-to-br ${tierGlow[a.tier]} px-5 py-3.5 flex items-center gap-4 animate-pop shadow-glow`}
        onClick={clearAchievementPopup}
      >
        <div className="relative">
          <div className="text-4xl animate-pulse-glow rounded-full">{a.icon}</div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-yellow-300">🏆 Achievement Unlocked</div>
          <div className="font-bold text-white text-lg leading-tight">{a.name}</div>
          <div className="text-xs text-gray-300">{a.description}</div>
        </div>
      </div>
    </div>
  )
}
