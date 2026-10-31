import type {
  GameState,
  MonthlySummary,
  StatKey,
  SummaryLine,
  HistoryEntry,
} from '@/types'
import { clamp, mulberry32, randInt } from '@/utils/random'
import { addSkillXP, careerSkillScore, learnMultiplier, overallSkill } from '@/game/engine/skills'
import {
  monthlyExpenses,
  monthlyIncome,
  netWorth,
  simulateMarket,
  addInvestment,
} from '@/game/engine/finance'
import { CAREERS, CAREER_MAP } from '@/game/data/careers'
import { ACHIEVEMENTS, ACHIEVEMENT_MAP } from '@/game/data/achievements'
import { AI } from '@/game/engine/ai'
import { yearForMonth, formatMonthYear } from '@/utils/format'
import type { GameEventDef } from '@/types'

// ---------------------------------------------------------------------------
// Apply a single queued player action. Mutates state.
// ---------------------------------------------------------------------------
export function applyAction(s: GameState, actionId: string) {
  const lm = learnMultiplier(s)
  const bump = (k: StatKey, v: number) => (s.stats[k] = clamp(s.stats[k] + v))

  switch (actionId) {
    // EDUCATION
    case 'study':
      bump('intelligence', 3)
      bump('happiness', -1)
      addSkillXP(s, bestStudySkill(s), 4 * lm)
      break
    case 'college':
      bump('intelligence', 2)
      bump('social', 3)
      bump('reputation', 1)
      addSkillXP(s, 'communication', 2 * lm)
      break
    case 'course':
      bump('intelligence', 2)
      addSkillXP(s, focusSkill(s), 7 * lm)
      break
    case 'exam':
      bump('intelligence', 4)
      bump('discipline', 3)
      bump('happiness', -2)
      break

    // CAREER
    case 'apply':
      tryGetJob(s)
      break
    case 'workhard':
      s.career.performance = clamp(s.career.performance + 6)
      bump('reputation', 2)
      bump('happiness', -2)
      addSkillXP(s, careerFocusSkill(s), 3 * lm)
      break
    case 'promotion':
      attemptPromotion(s, true)
      break
    case 'freelance': {
      const earn = Math.round((overallSkill(s) * 400 + randInt(mulberry32(s.seed + s.monthIndex), 2000, 8000)))
      s.finance.cash += earn
      bump('reputation', 1)
      s.flags['lastFreelance'] = earn
      addSkillXP(s, careerFocusSkill(s), 2 * lm)
      break
    }
    case 'network':
      bump('reputation', 3)
      bump('social', 3)
      break

    // HEALTH
    case 'workout':
      bump('health', 4)
      bump('discipline', 2)
      bump('energy', -2)
      addSkillXP(s, 'fitness', 4)
      break
    case 'sleep':
      bump('energy', 22)
      bump('health', 2)
      bump('happiness', 2)
      break
    case 'diet':
      bump('health', 3)
      bump('energy', 4)
      break
    case 'meditate':
      bump('happiness', 5)
      bump('energy', 4)
      addSkillXP(s, 'mindfulness', 4)
      break

    // SOCIAL
    case 'friends':
      bump('happiness', 5)
      bump('social', 3)
      strengthenBonds(s, 4)
      break
    case 'event':
      bump('social', 4)
      bump('reputation', 2)
      bump('happiness', 3)
      break
    case 'travel':
      bump('happiness', 9)
      bump('energy', 3)
      s.finance.cash -= 20000
      break
    case 'date':
      bump('happiness', 6)
      bump('social', 2)
      s.finance.cash -= 3000
      strengthenBonds(s, 5, ['Romantic', 'Partner'])
      break

    // SKILLS
    case 'learn_python':
      addSkillXP(s, 'python', 8 * lm)
      break
    case 'learn_ai':
      addSkillXP(s, 'aiml', 8 * lm)
      break
    case 'learn_web':
      addSkillXP(s, 'webdev', 8 * lm)
      break
    case 'learn_comm':
      addSkillXP(s, 'communication', 8 * lm)
      break
    case 'learn_lead':
      addSkillXP(s, 'leadership', 8 * lm)
      break

    // FINANCE
    case 'save':
      bump('discipline', 3)
      // Move a chunk of idle cash into savings holding.
      {
        const amt = Math.min(s.finance.cash, Math.round(s.finance.cash * 0.4))
        addInvestment(s, 'savings', amt)
      }
      break
    case 'invest_index':
      addInvestment(s, 'index', 20000)
      addSkillXP(s, 'investing', 3)
      break
    case 'invest_stocks':
      addInvestment(s, 'stocks', 20000)
      addSkillXP(s, 'investing', 3)
      break
    case 'invest_crypto':
      addInvestment(s, 'crypto', 15000)
      addSkillXP(s, 'investing', 2)
      break
    case 'start_sip':
      if (!s.finance.sips.some((sip) => sip.kind === 'index')) {
        s.finance.sips.push({ kind: 'index', monthly: 5000 })
      }
      addSkillXP(s, 'investing', 2)
      break
  }
}

// Pick a skill to grow when "studying" generically — favors career or top skill.
function bestStudySkill(s: GameState): string {
  return careerFocusSkill(s)
}
function focusSkill(s: GameState): string {
  return careerFocusSkill(s)
}
function careerFocusSkill(s: GameState): string {
  if (s.career.careerId) {
    const car = CAREER_MAP[s.career.careerId]
    // Grow the lowest key skill to round out.
    return [...car.keySkills].sort((a, b) => (s.skills[a] ?? 0) - (s.skills[b] ?? 0))[0]
  }
  // No career: grow python by default as a strong foundation.
  return 'python'
}

// ---------------------------------------------------------------------------
// First job / job change
// ---------------------------------------------------------------------------
function tryGetJob(s: GameState) {
  const skill = overallSkill(s)
  // Find best career whose entry level the player qualifies for.
  const options = CAREERS.map((c) => ({
    c,
    fit: careerSkillScore(s, c.keySkills),
  }))
    .filter((o) => o.fit >= c0Min(o.c) || skill >= 10)
    .sort((a, b) => b.fit - a.fit)

  if (!options.length) {
    s.stats.reputation = clamp(s.stats.reputation + 1)
    s.flags['jobSearchFail'] = (Number(s.flags['jobSearchFail']) || 0) + 1
    return
  }
  const chosen = options[0].c
  s.career.careerId = chosen.id
  s.career.levelIndex = 0
  s.career.monthsInRole = 0
  s.career.performance = 50
  s.career.satisfaction = 62
  s.career.salary = chosen.levels[0].baseSalary
  s.flags['gotFirstJob'] = true
  s.history.push({
    month: s.monthIndex,
    year: yearForMonth(s.monthIndex),
    icon: chosen.icon,
    text: `Landed a job as ${chosen.levels[0].title}.`,
    tone: 'good',
  })
}
function c0Min(c: (typeof CAREERS)[number]) {
  return c.levels[0].minSkill
}

function attemptPromotion(s: GameState, manual: boolean): boolean {
  if (!s.career.careerId) return false
  const car = CAREER_MAP[s.career.careerId]
  const next = car.levels[s.career.levelIndex + 1]
  if (!next) return false
  const skill = careerSkillScore(s, car.keySkills)
  const ready =
    skill >= next.minSkill &&
    s.career.performance >= 60 &&
    s.career.monthsInRole >= (manual ? 4 : 6)
  if (ready) {
    s.career.levelIndex += 1
    s.career.monthsInRole = 0
    s.career.salary = next.baseSalary
    s.career.performance = clamp(s.career.performance - 8)
    s.career.satisfaction = clamp(s.career.satisfaction + 8)
    s.stats.reputation = clamp(s.stats.reputation + 5)
    s.stats.happiness = clamp(s.stats.happiness + 6)
    s.history.push({
      month: s.monthIndex,
      year: yearForMonth(s.monthIndex),
      icon: '📈',
      text: `Promoted to ${next.title} (₹${next.baseSalary.toLocaleString('en-IN')}/mo).`,
      tone: 'good',
    })
    return true
  } else if (manual) {
    s.career.satisfaction = clamp(s.career.satisfaction - 3)
  }
  return false
}

function strengthenBonds(s: GameState, amt: number, types?: string[]) {
  const targets = types ? s.npcs.filter((n) => types.includes(n.type)) : s.npcs
  const pool = targets.length ? targets : s.npcs
  pool.slice(0, 3).forEach((n) => {
    n.trust = clamp(n.trust + amt * 0.6)
    n.level = clamp(n.level + amt)
    n.lastInteractionMonth = s.monthIndex
  })
}

// Relationship type evolves as level/trust grow.
function evolveRelationships(s: GameState) {
  s.npcs.forEach((n) => {
    // Natural drift: neglected relationships cool down.
    const gap = s.monthIndex - n.lastInteractionMonth
    if (gap > 3) {
      n.level = clamp(n.level - Math.min(4, gap - 3))
      n.trust = clamp(n.trust - 1)
    }
    // Promotions of type
    if (n.type === 'Friend' && n.level >= 75 && n.trust >= 70) n.type = 'Best Friend'
    if (n.type === 'Romantic' && n.level >= 80 && n.trust >= 75) n.type = 'Partner'
    if (n.type === 'Acquaintance' && n.level >= 45) n.type = 'Friend'
  })
}

// ---------------------------------------------------------------------------
// Business simulation
// ---------------------------------------------------------------------------
function simulateBusiness(s: GameState, rng: () => number): number {
  const b = s.finance.business
  if (!b) return 0
  b.monthsRunning += 1
  const entSkill = s.skills['entrepreneurship'] ?? 0
  const lead = s.skills['leadership'] ?? 0
  // Traction grows with skills + reputation, with noise.
  const growth = (entSkill + lead) / 20 + s.stats.reputation / 40 + (rng() - 0.4) * 4
  b.traction = clamp(b.traction + growth)
  b.monthlyRevenue = Math.round(5000 + b.traction * b.traction * 60 + s.stats.reputation * 200)
  b.monthlyCost = Math.round(20000 + b.traction * 250)
  const profit = b.monthlyRevenue - b.monthlyCost
  b.valuation = Math.max(0, Math.round(b.monthlyRevenue * 12 * (0.8 + b.traction / 100)))
  return profit
}

// ---------------------------------------------------------------------------
// The main monthly engine. Applies actions, simulates a month, and picks an
// event to present (event effects applied later via applyEventEffect).
// ---------------------------------------------------------------------------
export function advanceMonth(s: GameState): {
  summary: MonthlySummary
  event: GameEventDef | null
} {
  const rng = mulberry32((s.seed ^ ((s.monthIndex + 1) * 0x9e3779b1)) >>> 0)
  const before = {
    netWorth: netWorth(s),
    stats: { ...s.stats },
  }

  // 1) Apply queued actions.
  const actionsThisMonth = [...s.pendingActions]
  actionsThisMonth.forEach((a) => applyAction(s, a))

  // 2) Passive drift (energy regen if rested little; costs of living life).
  const restedEnough = actionsThisMonth.includes('sleep')
  if (!restedEnough) s.stats.energy = clamp(s.stats.energy - 6)
  s.stats.energy = clamp(s.stats.energy + 8) // baseline monthly recovery
  // Health slowly decays if low happiness/energy; happiness decays toward baseline.
  if (s.stats.energy < 30) s.stats.health = clamp(s.stats.health - 3)
  if (s.stats.happiness > 55) s.stats.happiness = clamp(s.stats.happiness - 1)
  if (s.stats.happiness < 45) s.stats.happiness = clamp(s.stats.happiness + 1)
  s.stats.health = clamp(s.stats.health - 0.5)

  // 3) Career passive progression.
  const lines: SummaryLine[] = []
  const levelUps: string[] = []
  let income = 0
  let expenses = 0

  if (s.career.careerId) {
    s.career.monthsInRole += 1
    s.career.totalMonthsWorked += 1
    // Performance drifts toward skill fit.
    const car = CAREER_MAP[s.career.careerId]
    const fit = careerSkillScore(s, car.keySkills)
    const target = clamp(40 + fit * 0.5)
    s.career.performance = clamp(s.career.performance + Math.sign(target - s.career.performance) * 2)
    // Salary creeps with performance (annual-ish raises).
    if (s.career.monthsInRole % 12 === 0) {
      s.career.salary = Math.round(s.career.salary * (1 + s.career.performance / 1000))
    }
    // Satisfaction drifts with happiness & performance.
    s.career.satisfaction = clamp(
      s.career.satisfaction + (s.stats.happiness > 55 ? 1 : -1) + (s.career.performance > 65 ? 1 : -1),
    )
    // Auto promotion when qualified.
    attemptPromotion(s, false)
    income += s.career.salary
  }

  // Business
  if (s.finance.business) {
    const profit = simulateBusiness(s, rng)
    income += Math.max(0, profit)
    if (profit < 0) expenses += -profit
    s.finance.monthlyIncomeExtra = Math.max(0, profit)
  }

  // 4) Finance: income, expenses, SIPs, market.
  const exp = monthlyExpenses(s)
  expenses += exp
  s.finance.cash += income - exp

  // SIPs
  s.finance.sips.forEach((sip) => {
    if (s.finance.cash >= sip.monthly) {
      addInvestmentInline(s, sip.kind, sip.monthly)
    }
  })

  // Market movement
  const market = simulateMarket(s, rng)

  // Debt interest
  if (s.finance.debt > 0) {
    const interest = Math.round(s.finance.debt * 0.01)
    s.finance.debt += interest
  }
  // Auto-borrow if cash goes negative (overdraft becomes debt).
  if (s.finance.cash < 0) {
    s.finance.debt += -s.finance.cash
    s.finance.cash = 0
  }
  // Auto-repay debt if flush with cash.
  if (s.finance.debt > 0 && s.finance.cash > 50000) {
    const repay = Math.min(s.finance.debt, s.finance.cash - 50000)
    s.finance.debt -= repay
    s.finance.cash -= repay
  }

  // 5) Skill milestone: passive tiny growth in career skills from working.
  if (s.career.careerId) {
    const car = CAREER_MAP[s.career.careerId]
    car.keySkills.forEach((sk) => addSkillXP(s, sk, 0.8))
  }

  // 6) Relationships evolve.
  evolveRelationships(s)

  // 7) Advance the clock.
  s.monthIndex += 1

  // 8) Build cinematic summary lines.
  if (income > 0) lines.push({ icon: '💼', label: 'Income', value: fmtSign(income), tone: 'good' })
  lines.push({ icon: '🏠', label: 'Living Expenses', value: fmtSign(-exp), tone: 'bad' })
  if (s.flags['lastFreelance']) {
    lines.push({ icon: '🧑‍💻', label: 'Freelance', value: fmtSign(Number(s.flags['lastFreelance'])), tone: 'good' })
    delete s.flags['lastFreelance']
  }
  if (market.delta !== 0)
    lines.push({
      icon: '📈',
      label: 'Investments',
      value: fmtSign(market.delta),
      tone: market.delta >= 0 ? 'good' : 'bad',
    })
  // Stat deltas that changed meaningfully.
  ;(['health', 'happiness', 'energy', 'intelligence', 'reputation', 'social'] as StatKey[]).forEach((k) => {
    const d = Math.round(s.stats[k] - before.stats[k])
    if (d !== 0) {
      const icon = STAT_ICON[k]
      lines.push({ icon, label: capitalize(k), value: `${d > 0 ? '+' : ''}${d}`, tone: d >= 0 ? 'good' : 'bad' })
    }
  })

  const nwNow = netWorth(s)
  const summary: MonthlySummary = {
    monthLabel: formatMonthYear(s.monthIndex - 1),
    lines,
    netWorth: nwNow,
    netWorthDelta: nwNow - before.netWorth,
    levelUps,
  }
  s.lastSummary = summary
  s.pendingActions = []

  // Track history graphs.
  s.netWorthHistory.push({ month: s.monthIndex, value: nwNow })
  s.happinessHistory.push({ month: s.monthIndex, value: Math.round(s.stats.happiness) })
  if (s.netWorthHistory.length > 400) s.netWorthHistory.shift()

  // 9) Select a context-aware event (~55% of months, higher if pressured).
  const eventChance = 55 + (s.finance.cash < 5000 ? 20 : 0) + (s.stats.happiness < 30 ? 15 : 0)
  let event: GameEventDef | null = null
  if (rng() * 100 < eventChance) {
    event = AI.event.selectEvent(s, rng)
  }

  return { summary, event }
}

function addInvestmentInline(s: GameState, kind: import('@/types').InvestmentKind, amount: number) {
  s.finance.cash -= amount
  const h = s.finance.investments[kind]
  h.value += amount
  h.invested += amount
}

// ---------------------------------------------------------------------------
// Achievement checking — returns newly-unlocked ids and logs history.
// ---------------------------------------------------------------------------
export function checkAchievements(s: GameState): string[] {
  const newly: string[] = []
  for (const a of ACHIEVEMENTS) {
    if (!s.achievements.includes(a.id) && a.check(s)) {
      s.achievements.push(a.id)
      newly.push(a.id)
      s.history.push({
        month: s.monthIndex,
        year: yearForMonth(s.monthIndex),
        icon: a.icon,
        text: `Achievement unlocked: ${a.name}.`,
        tone: 'epic',
      })
    }
  }
  return newly
}

// End-of-life detection: player retires or dies of old age.
export function checkLifeEnd(s: GameState): boolean {
  const ageMonths = s.character.startAgeMonths + s.monthIndex
  const ageYears = ageMonths / 12
  // Natural end around 78-82 (with a little variance from health).
  const lifespan = 78 + (s.stats.health - 50) / 12
  if (ageYears >= lifespan) {
    s.alive = false
    return true
  }
  return false
}

export function retire(s: GameState) {
  s.retired = true
  s.history.push({
    month: s.monthIndex,
    year: yearForMonth(s.monthIndex),
    icon: '🌴',
    text: `Retired at age ${Math.floor((s.character.startAgeMonths + s.monthIndex) / 12)}.`,
    tone: 'epic',
  })
}

// helpers
const STAT_ICON: Record<string, string> = {
  health: '❤️',
  happiness: '😊',
  energy: '⚡',
  intelligence: '🧠',
  reputation: '⭐',
  social: '🤝',
  skills: '💻',
  discipline: '🔥',
}
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
function fmtSign(n: number): string {
  const sign = n >= 0 ? '+' : '-'
  return `${sign}₹${Math.abs(Math.round(n)).toLocaleString('en-IN')}`
}

export { ACHIEVEMENT_MAP }
