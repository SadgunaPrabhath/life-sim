import { useGame } from '@/hooks/GameContext'
import { SKILLS, SKILL_CATEGORIES, SKILL_MAP, prereqsMet } from '@/game/data/skills'
import { overallSkill } from '@/game/engine/skills'
import { Lock } from 'lucide-react'

export function SkillsTab() {
  const { state } = useGame()
  if (!state) return null
  const overall = overallSkill(state)

  return (
    <div className="space-y-4">
      <div className="card p-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Skill Tree</h2>
          <p className="text-sm text-gray-400">Level skills 1→100. Advanced skills need prerequisites. Use Skill & Education actions to grow.</p>
        </div>
        <div className="text-center shrink-0">
          <div className="text-[10px] uppercase tracking-widest text-gray-500">Overall</div>
          <div className="text-3xl font-extrabold title-gradient">{overall}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {SKILL_CATEGORIES.map((cat) => {
          const skills = SKILLS.filter((s) => s.category === cat)
          if (!skills.length) return null
          return (
            <div key={cat} className="card p-4">
              <div className="text-xs font-mono uppercase tracking-widest text-accent-cyan mb-3">{cat}</div>
              <div className="space-y-3">
                {skills.map((sk) => {
                  const level = Math.round(state.skills[sk.id] ?? 0)
                  const unlocked = prereqsMet(sk.id, state.skills)
                  return (
                    <div key={sk.id} className={unlocked ? '' : 'opacity-60'}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2 text-sm">
                          <span className="text-base">{sk.icon}</span>
                          <span className="font-medium text-gray-200">{sk.name}</span>
                          {!unlocked && <Lock size={11} className="text-gray-500" />}
                          {level >= 100 && <span className="chip bg-yellow-500/20 text-yellow-300 text-[9px] py-0">MASTER</span>}
                        </span>
                        <span className="font-mono text-sm font-semibold tabular-nums">{level}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-[width] duration-700 ${level >= 100 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-accent to-accent-cyan'}`}
                          style={{ width: `${level}%` }}
                        />
                      </div>
                      {!unlocked && sk.prerequisites && (
                        <div className="text-[10px] text-gray-500 mt-1">
                          Needs {sk.prerequisites.map((p) => `${SKILL_MAP[p.skillId].name} ${p.level}`).join(', ')}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
