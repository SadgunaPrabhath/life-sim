import type { GameState } from '@/types'
import { netWorth } from '@/game/engine/finance'
import { overallSkill } from '@/game/engine/skills'
import { CAREER_MAP } from '@/game/data/careers'
import { ACHIEVEMENTS } from '@/game/data/achievements'

export interface CategoryScore {
  key: string
  label: string
  icon: string
  value: number // 0..100
}

// Compute a 0..100 life score with category breakdown.
export function lifeScore(s: GameState): { total: number; categories: CategoryScore[] } {
  const career = careerScore(s)
  const wealth = wealthScore(s)
  const health = s.stats.health
  const happiness = s.stats.happiness
  const relationships = relationshipScore(s)
  const skills = overallSkill(s)
  const reputation = s.stats.reputation
  const achievements = Math.min(100, (s.achievements.length / ACHIEVEMENTS.length) * 100)

  const categories: CategoryScore[] = [
    { key: 'career', label: 'Career', icon: '💼', value: Math.round(career) },
    { key: 'wealth', label: 'Wealth', icon: '💰', value: Math.round(wealth) },
    { key: 'health', label: 'Health', icon: '❤️', value: Math.round(health) },
    { key: 'happiness', label: 'Happiness', icon: '😊', value: Math.round(happiness) },
    { key: 'relationships', label: 'Relationships', icon: '🤝', value: Math.round(relationships) },
    { key: 'skills', label: 'Skills', icon: '💻', value: Math.round(skills) },
    { key: 'reputation', label: 'Reputation', icon: '⭐', value: Math.round(reputation) },
    { key: 'achievements', label: 'Achievements', icon: '🏆', value: Math.round(achievements) },
  ]

  const weights: Record<string, number> = {
    career: 1.2,
    wealth: 1.3,
    health: 1.1,
    happiness: 1.3,
    relationships: 1.1,
    skills: 1.1,
    reputation: 0.9,
    achievements: 1.0,
  }
  let sum = 0
  let wsum = 0
  categories.forEach((c) => {
    const w = weights[c.key] ?? 1
    sum += c.value * w
    wsum += w
  })
  return { total: Math.round(sum / wsum), categories }
}

function careerScore(s: GameState): number {
  if (!s.career.careerId) return Math.min(40, s.stats.reputation)
  const car = CAREER_MAP[s.career.careerId]
  const levelPart = (s.career.levelIndex / (car.levels.length - 1)) * 60
  const satPart = s.career.satisfaction * 0.2
  const perfPart = s.career.performance * 0.2
  return Math.min(100, levelPart + satPart + perfPart)
}

function wealthScore(s: GameState): number {
  const nw = netWorth(s)
  if (nw <= 0) return Math.max(0, 10 + nw / 20000)
  // Log scale: ₹1L ≈ 35, ₹10L ≈ 60, ₹1Cr ≈ 90, ₹5Cr+ ≈ 100
  const score = 20 + Math.log10(Math.max(1, nw / 10000)) * 22
  return Math.min(100, score)
}

function relationshipScore(s: GameState): number {
  if (!s.npcs.length) return 20
  const avg = s.npcs.reduce((a, n) => a + n.level, 0) / s.npcs.length
  const bonusPartner = s.npcs.some((n) => n.type === 'Partner') ? 15 : 0
  const bonusCount = Math.min(15, s.npcs.length * 3)
  return Math.min(100, avg * 0.7 + bonusPartner + bonusCount)
}

export function scoreGrade(total: number): { label: string; color: string } {
  if (total >= 90) return { label: 'Legendary', color: '#f59e0b' }
  if (total >= 80) return { label: 'Exceptional', color: '#a855f7' }
  if (total >= 70) return { label: 'Great', color: '#22c55e' }
  if (total >= 55) return { label: 'Solid', color: '#06b6d4' }
  if (total >= 40) return { label: 'Average', color: '#94a3b8' }
  return { label: 'Struggling', color: '#ef4444' }
}
