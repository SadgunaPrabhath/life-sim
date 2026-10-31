import type { AchievementDef, GameState } from '@/types'
import { netWorth } from '@/game/engine/finance'
import { overallSkill, maxSkillLevel } from '@/game/engine/skills'

// 30+ achievements. `check` runs against live state each month.
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_job', name: 'First Job', description: 'Land your first paying job.', icon: '💼', tier: 'bronze', check: (s) => !!s.career.careerId && s.career.salary > 0 },
  { id: 'first_lakh', name: 'First ₹1 Lakh', description: 'Reach ₹1,00,000 net worth.', icon: '💵', tier: 'bronze', check: (s) => netWorth(s) >= 100000 },
  { id: 'ten_lakh', name: '₹10 Lakh Club', description: 'Reach ₹10 Lakh net worth.', icon: '💰', tier: 'silver', check: (s) => netWorth(s) >= 1000000 },
  { id: 'fifty_lakh', name: '₹50 Lakh', description: 'Reach ₹50 Lakh net worth.', icon: '🤑', tier: 'gold', check: (s) => netWorth(s) >= 5000000 },
  { id: 'crorepati', name: 'Crorepati', description: 'Reach ₹1 Crore net worth.', icon: '🏆', tier: 'gold', check: (s) => netWorth(s) >= 10000000 },
  { id: 'multi_crore', name: 'Multi-Crore', description: 'Reach ₹5 Crore net worth.', icon: '👑', tier: 'legendary', check: (s) => netWorth(s) >= 50000000 },
  { id: 'graduate', name: 'Graduate', description: 'Reach Intelligence 60+.', icon: '🎓', tier: 'bronze', check: (s) => s.stats.intelligence >= 60 },
  { id: 'scholar', name: 'Scholar', description: 'Reach Intelligence 90+.', icon: '📖', tier: 'gold', check: (s) => s.stats.intelligence >= 90 },
  { id: 'start_company', name: 'Founder', description: 'Start your own business.', icon: '🚀', tier: 'silver', check: (s) => !!s.finance.business },
  { id: 'profitable', name: 'Profitable', description: 'Run a business earning more than it costs.', icon: '📗', tier: 'gold', check: (s) => !!s.finance.business && s.finance.business.monthlyRevenue > s.finance.business.monthlyCost },
  { id: 'ceo', name: 'Become CEO', description: 'Reach the CEO / top tier of a career.', icon: '🏢', tier: 'legendary', check: (s) => s.career.levelIndex >= 3 && !!s.career.careerId },
  { id: 'master_skill', name: 'Master a Skill', description: 'Take any skill to level 100.', icon: '⭐', tier: 'gold', check: (s) => maxSkillLevel(s) >= 100 },
  { id: 'polymath', name: 'Polymath', description: 'Have 5 skills above level 60.', icon: '🧠', tier: 'gold', check: (s) => Object.values(s.skills).filter((v) => v >= 60).length >= 5 },
  { id: 'skilled', name: 'Skilled', description: 'Overall skill index above 70.', icon: '🛠️', tier: 'silver', check: (s) => overallSkill(s) >= 70 },
  { id: 'healthy', name: 'Peak Health', description: 'Reach Health 90+.', icon: '❤️', tier: 'silver', check: (s) => s.stats.health >= 90 },
  { id: 'zen', name: 'Zen Master', description: 'Reach Happiness 90+.', icon: '😌', tier: 'silver', check: (s) => s.stats.happiness >= 90 },
  { id: 'famous', name: 'Famous', description: 'Reach Reputation 85+.', icon: '🌟', tier: 'gold', check: (s) => s.stats.reputation >= 85 },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Have 5+ relationships.', icon: '🦋', tier: 'bronze', check: (s) => s.npcs.length >= 5 },
  { id: 'best_friend', name: 'Ride or Die', description: 'Have a Best Friend.', icon: '🤗', tier: 'bronze', check: (s) => s.npcs.some((n) => n.type === 'Best Friend') },
  { id: 'partner', name: 'Found Love', description: 'Have a life Partner.', icon: '💞', tier: 'silver', check: (s) => s.npcs.some((n) => n.type === 'Partner') },
  { id: 'mentor', name: 'Guided', description: 'Find a Mentor.', icon: '🧙', tier: 'bronze', check: (s) => s.npcs.some((n) => n.type === 'Mentor') },
  { id: 'investor', name: 'Investor', description: 'Hold ₹2 Lakh+ in investments.', icon: '📈', tier: 'silver', check: (s) => Object.values(s.finance.investments).reduce((a, i) => a + i.value, 0) >= 200000 },
  { id: 'diversified', name: 'Diversified', description: 'Hold money in 3+ asset classes.', icon: '🧺', tier: 'silver', check: (s) => Object.values(s.finance.investments).filter((i) => i.value > 0).length >= 3 },
  { id: 'debt_free', name: 'Debt Free', description: 'Clear all debt while net worth is positive.', icon: '🧾', tier: 'bronze', check: (s) => s.finance.debt === 0 && netWorth(s) > 50000 },
  { id: 'six_figure', name: 'Six Figure Salary', description: 'Earn ₹1 Lakh+ per month.', icon: '💸', tier: 'silver', check: (s) => s.career.salary + s.finance.monthlyIncomeExtra >= 100000 },
  { id: 'high_earner', name: 'High Earner', description: 'Earn ₹3 Lakh+ per month.', icon: '💎', tier: 'gold', check: (s) => s.career.salary + s.finance.monthlyIncomeExtra >= 300000 },
  { id: 'globetrotter', name: 'Globetrotter', description: 'Travel abroad at least once.', icon: '🌍', tier: 'bronze', check: (s) => !!s.flags['traveledAbroad'] },
  { id: 'buy_car', name: 'Dream Car', description: 'Buy a car.', icon: '🚗', tier: 'silver', check: (s) => !!s.flags['ownsCar'] },
  { id: 'buy_house', name: 'Homeowner', description: 'Buy a house.', icon: '🏠', tier: 'gold', check: (s) => !!s.flags['ownsHouse'] },
  { id: 'disciplined', name: 'Iron Will', description: 'Reach Discipline 90+.', icon: '🔥', tier: 'silver', check: (s) => s.stats.discipline >= 90 },
  { id: 'balanced_life', name: 'Balanced Life', description: 'All core stats above 70.', icon: '⚖️', tier: 'gold', check: (s) => ['health', 'happiness', 'intelligence', 'social'].every((k) => (s.stats as any)[k] >= 70) },
  { id: 'survivor', name: 'Survivor', description: 'Play for 5 years (60 months).', icon: '⏳', tier: 'bronze', check: (s) => s.monthIndex >= 60 },
  { id: 'veteran', name: 'Life Veteran', description: 'Play for 15 years (180 months).', icon: '🗿', tier: 'gold', check: (s) => s.monthIndex >= 180 },
  { id: 'retire_early', name: 'Retire Early', description: 'Retire before age 50 with ₹1Cr+.', icon: '🌴', tier: 'legendary', check: (s) => s.retired && ageYears(s) < 50 && netWorth(s) >= 10000000 },
]

function ageYears(s: GameState): number {
  return Math.floor((s.character.startAgeMonths + s.monthIndex) / 12)
}

export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
)
