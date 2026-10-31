// ============================================================================
// LIFE//SIM — Core Type Definitions
// The entire game state is described here. Game logic (engine/) operates on
// these types; the UI never mutates state directly.
// ============================================================================

// The four DM world-themes (see game/data/realms.ts).
export type RealmId = 'lastlife' | 'mythos' | 'kingdom' | 'crime'

export type StatKey =
  | 'health'
  | 'intelligence'
  | 'skills'
  | 'discipline'
  | 'happiness'
  | 'energy'
  | 'social'
  | 'reputation'

export type Stats = Record<StatKey, number>

export type Personality =
  | 'Ambitious'
  | 'Genius'
  | 'Risk Taker'
  | 'Social'
  | 'Disciplined'
  | 'Creative'
  | 'Balanced'

export type EducationLevel =
  | 'High School'
  | 'Diploma'
  | 'Undergraduate'
  | 'Postgraduate'
  | 'Self-Taught'

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------
export type SkillCategory =
  | 'TECHNOLOGY'
  | 'CAREER'
  | 'INTELLIGENCE'
  | 'COMMUNICATION'
  | 'CREATIVITY'
  | 'FINANCE'
  | 'LEADERSHIP'
  | 'LIFE'

export interface SkillDef {
  id: string
  name: string
  category: SkillCategory
  icon: string
  description: string
  prerequisites?: { skillId: string; level: number }[]
}

export type SkillLevels = Record<string, number> // skillId -> 0..100

// ---------------------------------------------------------------------------
// Careers
// ---------------------------------------------------------------------------
export interface CareerLevel {
  title: string
  baseSalary: number // monthly ₹
  minSkill: number // required overall skill index to be promotable here
}

export interface CareerDef {
  id: string
  name: string
  icon: string
  field: string
  description: string
  // Which skills matter for this career (weighting used for progression)
  keySkills: string[]
  levels: CareerLevel[]
}

export interface CareerState {
  careerId: string | null // null = student / unemployed
  levelIndex: number
  monthsInRole: number
  totalMonthsWorked: number
  performance: number // 0..100 rolling performance
  satisfaction: number // 0..100
  salary: number // current monthly salary
}

// ---------------------------------------------------------------------------
// Finance
// ---------------------------------------------------------------------------
export type InvestmentKind = 'savings' | 'index' | 'stocks' | 'crypto' | 'business'

export interface InvestmentHolding {
  kind: InvestmentKind
  value: number // current market value ₹
  invested: number // total principal contributed ₹
}

export interface SIP {
  kind: InvestmentKind
  monthly: number
}

export interface Finance {
  cash: number
  debt: number
  monthlyIncomeExtra: number // freelance/business passive per month
  investments: Record<InvestmentKind, InvestmentHolding>
  sips: SIP[]
  business: BusinessState | null
}

export interface BusinessState {
  name: string
  monthsRunning: number
  monthlyRevenue: number
  monthlyCost: number
  valuation: number
  traction: number // 0..100
}

// ---------------------------------------------------------------------------
// Relationships / NPCs
// ---------------------------------------------------------------------------
export type RelationType =
  | 'Acquaintance'
  | 'Friend'
  | 'Best Friend'
  | 'Mentor'
  | 'Rival'
  | 'Romantic'
  | 'Partner'

export interface NPC {
  id: string
  name: string
  age: number
  personality: string
  type: RelationType
  trust: number // 0..100
  compatibility: number // 0..100 (static-ish)
  level: number // relationship level 0..100
  avatarHue: number
  lastInteractionMonth: number
  memory: string[] // short log of notable moments
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
export interface EventEffect {
  stats?: Partial<Stats>
  cash?: number
  reputationDelta?: number
  skillGains?: { skillId: string; amount: number }[]
  // Special hooks the engine understands
  special?:
    | { kind: 'jobOffer'; careerId: string; levelIndex: number }
    | { kind: 'startBusiness'; name: string }
    | { kind: 'investReturn'; pct: number; on: InvestmentKind }
    | { kind: 'newNpc'; type: RelationType }
    | { kind: 'npcDelta'; trust: number; level: number }
    | { kind: 'none' }
}

export interface EventChoice {
  label: string
  description?: string
  effect: EventEffect
  resultText: string
}

export interface GameEventDef {
  id: string
  title: string
  category: string
  icon: string
  text: string
  // Weight & guard used by the context-aware selector
  baseWeight: number
  minAge?: number
  requires?: (s: GameState) => boolean
  choices: EventChoice[]
  // --- AI Dungeon Master metadata (present only on LLM-generated events) ---
  aiGenerated?: boolean
  // NPC this event revolves around; used to write back "memory" after a choice.
  aiNpcId?: string
}

export interface ActiveEvent {
  def: GameEventDef
  resolvedChoice?: number
}

// ---------------------------------------------------------------------------
// Actions (player-selected before advancing the month)
// ---------------------------------------------------------------------------
export type ActionCategory =
  | 'Education'
  | 'Career'
  | 'Health'
  | 'Social'
  | 'Skills'
  | 'Finance'

export interface ActionDef {
  id: string
  label: string
  category: ActionCategory
  icon: string
  energyCost: number
  description: string
  available?: (s: GameState) => boolean
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------
export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'legendary'
  check: (s: GameState) => boolean
}

// ---------------------------------------------------------------------------
// History / Timeline
// ---------------------------------------------------------------------------
export interface HistoryEntry {
  month: number // absolute month index
  year: number
  icon: string
  text: string
  tone: 'good' | 'bad' | 'neutral' | 'epic'
}

// ---------------------------------------------------------------------------
// Monthly summary (cinematic recap)
// ---------------------------------------------------------------------------
export interface SummaryLine {
  icon: string
  label: string
  value: string
  tone: 'good' | 'bad' | 'neutral'
}

export interface MonthlySummary {
  monthLabel: string
  lines: SummaryLine[]
  netWorth: number
  netWorthDelta: number
  levelUps: string[]
}

// ---------------------------------------------------------------------------
// Root game state
// ---------------------------------------------------------------------------
export interface Character {
  name: string
  city: string
  education: EducationLevel
  personality: Personality
  startAgeMonths: number // age in months at start
  avatarHue: number
}

export interface GameState {
  version: number
  character: Character
  stats: Stats
  skills: SkillLevels
  career: CareerState
  finance: Finance
  npcs: NPC[]
  achievements: string[] // unlocked ids
  history: HistoryEntry[]
  monthIndex: number // months elapsed since start (age = startAgeMonths + monthIndex)
  pendingActions: string[] // action ids queued for this month
  lastSummary: MonthlySummary | null
  alive: boolean
  retired: boolean
  netWorthHistory: { month: number; value: number }[]
  happinessHistory: { month: number; value: number }[]
  flags: Record<string, number | boolean | string>
  seed: number
  // The world-theme the AI Dungeon Master narrates in. Optional for back-compat
  // with saves made before realms existed (defaults to 'lastlife').
  realm?: RealmId
}
