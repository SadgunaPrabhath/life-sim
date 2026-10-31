import type {
  Character,
  GameState,
  NPC,
  Personality,
  RealmId,
  RelationType,
  Stats,
} from '@/types'
import { DEFAULT_REALM } from '@/game/data/realms'
import { SKILLS } from '@/game/data/skills'
import { NPC_FIRST_NAMES, NPC_LAST_NAMES, NPC_PERSONALITIES } from '@/game/data/npcs'
import { clamp, pick, randInt } from '@/utils/random'

export interface CreationInput {
  name: string
  ageYears: number
  city: string
  education: Character['education']
  startingMoney: number
  personality: Personality
  realm?: RealmId
}

// Base stats before personality modifiers.
const BASE: Stats = {
  health: 70,
  intelligence: 55,
  skills: 20,
  discipline: 50,
  happiness: 65,
  energy: 100,
  social: 55,
  reputation: 20,
}

// Personality → stat deltas. Designed so every archetype plays differently.
const PERSONALITY_MODS: Record<Personality, Partial<Stats>> = {
  Ambitious: { discipline: 15, reputation: 10, skills: 8, happiness: -5, energy: 5 },
  Genius: { intelligence: 25, skills: 12, social: -10, happiness: -3 },
  'Risk Taker': { reputation: 12, social: 8, discipline: -12, happiness: 8, health: -4 },
  Social: { social: 25, happiness: 12, reputation: 8, intelligence: -6, discipline: -5 },
  Disciplined: { discipline: 25, health: 12, energy: 8, happiness: -4, social: -6 },
  Creative: { skills: 10, happiness: 10, intelligence: 8, social: 6, discipline: -8 },
  Balanced: { health: 5, intelligence: 5, discipline: 5, happiness: 5, social: 5 },
}

export function generateStats(personality: Personality): Stats {
  const mods = PERSONALITY_MODS[personality]
  const out = { ...BASE }
  for (const k of Object.keys(out) as (keyof Stats)[]) {
    out[k] = clamp(out[k] + (mods[k] ?? 0))
  }
  return out
}

export function makeNPC(
  rng: () => number,
  type: RelationType,
  monthIndex: number,
  ageHint?: number,
): NPC {
  const name = `${pick(rng, NPC_FIRST_NAMES)} ${pick(rng, NPC_LAST_NAMES)}`
  const baseTrust = type === 'Rival' ? randInt(rng, 15, 35) : randInt(rng, 40, 65)
  return {
    id: `npc_${monthIndex}_${Math.floor(rng() * 1e6)}`,
    name,
    age: ageHint ?? randInt(rng, 18, 40),
    personality: pick(rng, NPC_PERSONALITIES),
    type,
    trust: baseTrust,
    compatibility: randInt(rng, 45, 95),
    level: type === 'Rival' ? randInt(rng, 20, 40) : randInt(rng, 25, 50),
    avatarHue: randInt(rng, 0, 360),
    lastInteractionMonth: monthIndex,
    memory: [],
  }
}

export function createNewGame(input: CreationInput): GameState {
  const seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0
  const rng = mulberrySeed(seed)
  const stats = generateStats(input.personality)

  // Education gives an intelligence & starting skill bump.
  const eduBonus: Record<Character['education'], number> = {
    'High School': 0,
    Diploma: 4,
    Undergraduate: 8,
    Postgraduate: 14,
    'Self-Taught': 6,
  }
  stats.intelligence = clamp(stats.intelligence + eduBonus[input.education])

  const skills: Record<string, number> = {}
  SKILLS.forEach((s) => (skills[s.id] = 0))
  // Seed a couple of low-level skills so the tree isn't empty.
  skills.communication = randInt(rng, 8, 18)
  skills.fitness = randInt(rng, 5, 15)
  if (input.education === 'Undergraduate' || input.education === 'Postgraduate') {
    skills.python = randInt(rng, 5, 15)
  }
  if (input.personality === 'Genius') skills.python = Math.max(skills.python || 0, randInt(rng, 15, 25))
  if (input.personality === 'Creative') skills.design = randInt(rng, 10, 20)
  if (input.personality === 'Social') skills.communication = clamp((skills.communication || 0) + 12)

  const character: Character = {
    name: input.name.trim() || 'Player',
    city: input.city.trim() || 'Tirupati',
    education: input.education,
    personality: input.personality,
    startAgeMonths: Math.round(input.ageYears * 12),
    avatarHue: randInt(rng, 200, 320),
  }

  // Start with one friend so relationships aren't empty.
  const firstFriend = makeNPC(rng, 'Friend', 0, input.ageYears)

  const state: GameState = {
    version: 1,
    character,
    stats,
    skills,
    career: {
      careerId: null,
      levelIndex: 0,
      monthsInRole: 0,
      totalMonthsWorked: 0,
      performance: 50,
      satisfaction: 60,
      salary: 0,
    },
    finance: {
      cash: Math.max(0, Math.round(input.startingMoney)),
      debt: 0,
      monthlyIncomeExtra: 0,
      investments: {
        savings: { kind: 'savings', value: 0, invested: 0 },
        index: { kind: 'index', value: 0, invested: 0 },
        stocks: { kind: 'stocks', value: 0, invested: 0 },
        crypto: { kind: 'crypto', value: 0, invested: 0 },
        business: { kind: 'business', value: 0, invested: 0 },
      },
      sips: [],
      business: null,
    },
    npcs: [firstFriend],
    achievements: [],
    history: [
      {
        month: 0,
        year: 2026,
        icon: '🎬',
        text: `${character.name} begins their journey in ${character.city} at age ${input.ageYears}.`,
        tone: 'epic',
      },
    ],
    monthIndex: 0,
    pendingActions: [],
    lastSummary: null,
    alive: true,
    retired: false,
    netWorthHistory: [{ month: 0, value: Math.round(input.startingMoney) }],
    happinessHistory: [{ month: 0, value: stats.happiness }],
    flags: {},
    seed,
    realm: input.realm ?? DEFAULT_REALM,
  }
  return state
}

// Local copy of the seeded PRNG to avoid a circular import.
function mulberrySeed(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
