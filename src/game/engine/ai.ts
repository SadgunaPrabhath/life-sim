import type { GameEventDef, GameState } from '@/types'
import { EVENTS } from '@/game/data/events'
import { weightedPick } from '@/utils/random'
import { overallSkill, careerSkillScore } from '@/game/engine/skills'
import { netWorth } from '@/game/engine/finance'
import { CAREER_MAP } from '@/game/data/careers'

// ============================================================================
// AI ARCHITECTURE
// ----------------------------------------------------------------------------
// The game is designed so a real LLM (Claude API, etc.) can be plugged in later
// for dynamic event generation, NPC dialogue, and life-story writing.
//
// V1 ships with deterministic *Local* providers that require NO API key.
// To connect an LLM later, implement these same interfaces with fetch() calls
// and swap the provider via `setProviders()`.
// ============================================================================

export interface EventEngineProvider {
  /** Pick the next event given full game context, or null for a quiet month. */
  selectEvent(state: GameState, rng: () => number): GameEventDef | null
}

export interface DecisionEngineProvider {
  /** Optional flavor/advice for a decision. Local returns a heuristic hint. */
  adviseChoice(state: GameState, event: GameEventDef, choiceIndex: number): string
}

export interface StoryEngineProvider {
  /** Generate a narrative life story from the player's actual history. */
  generateLifeStory(state: GameState): string
}

// ---------------------------------------------------------------------------
// Local (deterministic) EventEngine — context-aware weighted selection.
// ---------------------------------------------------------------------------
export const LocalEventEngine: EventEngineProvider = {
  selectEvent(state, rng) {
    const skill = overallSkill(state)
    const nw = netWorth(state)
    const candidates = EVENTS.filter((e) => {
      const ageMonths = state.character.startAgeMonths + state.monthIndex
      if (e.minAge && ageMonths / 12 < e.minAge) return false
      if (e.requires && !e.requires(state)) return false
      return true
    }).map((e) => ({ ...e, weight: contextWeight(e, state, skill, nw) }))

    if (!candidates.length) return null
    return weightedPick(rng, candidates)
  },
}

// The heart of context-awareness: reshape event probabilities from state.
function contextWeight(e: GameEventDef, s: GameState, skill: number, nw: number): number {
  let w = e.baseWeight

  // Financial pressure → more finance events.
  if (s.finance.cash < 5000 && e.category === 'Finance') w *= 2.5
  if (nw < 0 && (e.category === 'Finance' || e.category === 'Career')) w *= 1.8

  // Low happiness → more social/lifestyle events.
  if (s.stats.happiness < 30 && (e.category === 'Social' || e.category === 'Lifestyle' || e.category === 'Romance')) w *= 2.2

  // Low health → health events.
  if (s.stats.health < 40 && e.category === 'Health') w *= 2.5

  // High skill + reputation → elite opportunities.
  if (skill > 70 && s.stats.reputation > 65 && (e.category === 'Career' || e.category === 'Business')) w *= 1.8

  // Entrepreneurs get business events.
  if (s.career.careerId === 'entrepreneur' && e.category === 'Business') w *= 2
  if (s.finance.business && e.category === 'Business') w *= 1.6

  // If in a relationship, more romance/social events.
  if (s.npcs.some((n) => n.type === 'Romantic' || n.type === 'Partner') && e.category === 'Romance') w *= 1.6

  // Avoid repeating the exact same event two months running.
  if (s.flags['lastEventId'] === e.id) w *= 0.15

  return w
}

// ---------------------------------------------------------------------------
// Local DecisionEngine — quick heuristic hints (LLM could personalize later).
// ---------------------------------------------------------------------------
export const LocalDecisionEngine: DecisionEngineProvider = {
  adviseChoice() {
    return ''
  },
}

// ---------------------------------------------------------------------------
// Local StoryEngine — weaves the actual history into a narrative.
// ---------------------------------------------------------------------------
export const LocalStoryEngine: StoryEngineProvider = {
  generateLifeStory(s) {
    const c = s.character
    const years = Math.floor((c.startAgeMonths + s.monthIndex) / 12)
    const nw = netWorth(s)
    const career = s.career.careerId ? CAREER_MAP[s.career.careerId] : null
    const careerTitle = career ? career.levels[s.career.levelIndex].title : 'an independent path'
    const epic = s.history.filter((h) => h.tone === 'epic' || h.tone === 'good').slice(0, 8)
    const lows = s.history.filter((h) => h.tone === 'bad').slice(0, 3)

    const parts: string[] = []
    parts.push(
      `${c.name} was ${Math.floor(c.startAgeMonths / 12)} when the story began in ${c.city}, a ${c.personality.toLowerCase()} soul with more questions than answers.`,
    )
    if (epic.length) {
      parts.push(
        `The years that followed were shaped by moments that mattered: ${epic
          .map((h) => h.text.replace(/\.$/, ''))
          .slice(0, 5)
          .join('; ')}.`,
      )
    }
    if (career) {
      parts.push(
        `Professionally, ${c.name} rose to become ${careerTitle}${
          career ? ` in ${career.field.toLowerCase()}` : ''
        }, driven by a stubborn belief that skill compounds.`,
      )
    }
    if (lows.length) {
      parts.push(
        `It was not all triumph — ${lows
          .map((h) => h.text.replace(/\.$/, '').toLowerCase())
          .join(', and ')} — but every setback sharpened the resolve.`,
      )
    }
    const rel = s.npcs.find((n) => n.type === 'Partner') || s.npcs.find((n) => n.type === 'Best Friend')
    if (rel) {
      parts.push(
        `Through it all, ${rel.name} remained a constant — proof that a life is measured in people, not just numbers.`,
      )
    }
    parts.push(
      `By age ${years}, ${c.name} had built a net worth of ${nw >= 0 ? '' : 'a deficit of '}₹${Math.abs(
        nw,
      ).toLocaleString('en-IN')}, unlocked ${s.achievements.length} achievements, and — more importantly — a story worth telling.`,
    )
    return parts.join(' ')
  },
}

// ---------------------------------------------------------------------------
// Active providers (swap these to connect a real LLM).
// ---------------------------------------------------------------------------
export const AI = {
  event: LocalEventEngine as EventEngineProvider,
  decision: LocalDecisionEngine as DecisionEngineProvider,
  story: LocalStoryEngine as StoryEngineProvider,
}

export function setProviders(p: Partial<typeof AI>) {
  Object.assign(AI, p)
}
