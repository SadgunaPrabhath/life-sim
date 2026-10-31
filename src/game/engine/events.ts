import type { GameEventDef, GameState, HistoryEntry, StatKey } from '@/types'
import { clamp } from '@/utils/random'
import { addSkillXP } from '@/game/engine/skills'
import { CAREER_MAP } from '@/game/data/careers'
import { makeNPC } from '@/game/engine/state'
import { yearForMonth } from '@/utils/format'
import { mulberry32 } from '@/utils/random'

// Apply a resolved event choice to the state. Returns a history entry.
export function applyEventEffect(
  s: GameState,
  event: GameEventDef,
  choiceIndex: number,
): HistoryEntry {
  const choice = event.choices[choiceIndex]
  const eff = choice.effect
  const rng = mulberry32((s.seed ^ (s.monthIndex * 2654435761)) >>> 0)

  // Stats
  if (eff.stats) {
    for (const k of Object.keys(eff.stats) as StatKey[]) {
      s.stats[k] = clamp(s.stats[k] + (eff.stats[k] ?? 0))
    }
  }
  // Cash
  if (eff.cash) s.finance.cash = Math.round(s.finance.cash + eff.cash)
  // Reputation delta (separate convenience field)
  if (eff.reputationDelta) s.stats.reputation = clamp(s.stats.reputation + eff.reputationDelta)
  // Skills
  if (eff.skillGains) {
    for (const g of eff.skillGains) addSkillXP(s, g.skillId, g.amount)
  }

  // Special hooks
  const sp = eff.special
  if (sp) {
    switch (sp.kind) {
      case 'jobOffer': {
        if (sp.levelIndex === -1) {
          // Surprise promotion: bump current career one level.
          if (s.career.careerId) {
            const car = CAREER_MAP[s.career.careerId]
            s.career.levelIndex = Math.min(car.levels.length - 1, s.career.levelIndex + 1)
            s.career.monthsInRole = 0
            s.career.salary = car.levels[s.career.levelIndex].baseSalary
          }
        } else {
          const car = CAREER_MAP[sp.careerId]
          if (car) {
            s.career.careerId = sp.careerId
            s.career.levelIndex = Math.min(sp.levelIndex, car.levels.length - 1)
            s.career.monthsInRole = 0
            s.career.satisfaction = 65
            s.career.performance = 55
            s.career.salary = car.levels[s.career.levelIndex].baseSalary
          }
        }
        break
      }
      case 'startBusiness': {
        if (!s.finance.business) {
          s.finance.business = {
            name: sp.name,
            monthsRunning: 0,
            monthlyRevenue: 10000,
            monthlyCost: 25000,
            valuation: 50000,
            traction: 10,
          }
          s.career.careerId = 'entrepreneur'
          s.career.levelIndex = 0
          s.career.salary = 0
        }
        break
      }
      case 'investReturn': {
        const h = s.finance.investments[sp.on]
        if (h.value > 0) h.value = Math.max(0, Math.round(h.value * (1 + sp.pct / 100)))
        break
      }
      case 'newNpc': {
        const npc = makeNPC(rng, sp.type, s.monthIndex)
        s.npcs.push(npc)
        break
      }
      case 'npcDelta': {
        // Apply to the most recently interacted / closest relationship.
        const target = [...s.npcs].sort((a, b) => b.level - a.level)[0]
        if (target) {
          target.trust = clamp(target.trust + sp.trust)
          target.level = clamp(target.level + sp.level)
          if (sp.trust > 0) target.memory.push(`Grew closer during "${event.title}".`)
          else target.memory.push(`Tension during "${event.title}".`)
        }
        break
      }
      case 'none':
      default:
        break
    }
  }

  // Lifestyle flags from specific events.
  if (event.id === 'travel_opportunity' && choiceIndex === 0) s.flags['traveledAbroad'] = true
  if (event.id === 'sabbatical_offer' && choiceIndex === 0) s.flags['traveledAbroad'] = true
  if (event.id === 'buy_car' && choiceIndex <= 1) s.flags['ownsCar'] = true
  if (event.id === 'buy_house' && choiceIndex === 0) s.flags['ownsHouse'] = true

  s.flags['lastEventId'] = event.id

  const tone: HistoryEntry['tone'] =
    (eff.stats?.happiness ?? 0) + (eff.reputationDelta ?? 0) + (eff.cash ?? 0) / 20000 > 4
      ? 'good'
      : (eff.stats?.happiness ?? 0) < -4 || (eff.cash ?? 0) < -60000
        ? 'bad'
        : 'neutral'

  const entry: HistoryEntry = {
    month: s.monthIndex,
    year: yearForMonth(s.monthIndex),
    icon: event.icon,
    text: `${choice.resultText}`,
    tone: event.id === 'acquisition_offer' || event.id === 'buy_house' ? 'epic' : tone,
  }
  s.history.push(entry)
  return entry
}
