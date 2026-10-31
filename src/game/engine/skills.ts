import type { GameState } from '@/types'
import { SKILLS, SKILL_MAP, prereqsMet } from '@/game/data/skills'
import { clamp } from '@/utils/random'

// Overall skill index = weighted average biased toward the player's best skills.
export function overallSkill(s: GameState): number {
  const vals = Object.values(s.skills)
  if (!vals.length) return 0
  const sorted = [...vals].sort((a, b) => b - a)
  // Weight top 5 skills more heavily — specialists count.
  let sum = 0
  let wsum = 0
  sorted.forEach((v, i) => {
    const w = i < 5 ? 5 - i * 0.6 : 0.5
    sum += v * w
    wsum += w
  })
  return Math.round(sum / wsum)
}

export function maxSkillLevel(s: GameState): number {
  const vals = Object.values(s.skills)
  return vals.length ? Math.max(...vals) : 0
}

export function careerSkillScore(s: GameState, keySkills: string[]): number {
  if (!keySkills.length) return overallSkill(s)
  const total = keySkills.reduce((a, id) => a + (s.skills[id] ?? 0), 0)
  return Math.round(total / keySkills.length)
}

// Add XP to a skill respecting diminishing returns near 100 and prerequisites.
// Returns the actual amount gained and whether a "milestone" was crossed.
export function addSkillXP(
  s: GameState,
  skillId: string,
  amount: number,
): { gained: number; milestone: number | null } {
  if (!SKILL_MAP[skillId]) return { gained: 0, milestone: null }
  const current = s.skills[skillId] ?? 0
  // If prerequisites unmet, progress is heavily throttled (you can dabble).
  const met = prereqsMet(skillId, s.skills)
  const eff = met ? amount : amount * 0.25
  // Diminishing returns: harder to progress as you approach mastery.
  const dr = current < 50 ? 1 : current < 80 ? 0.7 : 0.45
  const next = clamp(current + eff * dr)
  s.skills[skillId] = next
  const before = Math.floor(current / 10)
  const after = Math.floor(next / 10)
  const milestone = after > before ? after * 10 : null
  return { gained: next - current, milestone }
}

// Passive intelligence contribution: smarter players learn faster.
export function learnMultiplier(s: GameState): number {
  return 0.7 + (s.stats.intelligence / 100) * 0.8 + (s.stats.discipline / 100) * 0.5
}

export function allSkillsSorted(s: GameState) {
  return SKILLS.map((def) => ({
    def,
    level: s.skills[def.id] ?? 0,
    unlocked: prereqsMet(def.id, s.skills),
  }))
}
