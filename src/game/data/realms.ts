import type { RealmId } from '@/types'

// ============================================================================
// THE FOUR REALMS
// ----------------------------------------------------------------------------
// Merged in from the `four-realms` project. Each realm is a *world theme* the
// AI Dungeon Master uses to colour the events it generates. The underlying
// life-simulation (stats, careers, finance, NPCs) is the same in every realm —
// only the DM's voice, setting and stakes change. One engine, four universes.
// ============================================================================

export interface RealmDef {
  id: RealmId
  name: string
  icon: string
  tagline: string
  hue: number // accent hue for UI theming
  // A compact brief the DM is given as world context. Kept tight on purpose —
  // the model grounds events in the *player's* real state, not lore dumps.
  brief: string
  // Flavour verbs/nouns that keep generated titles on-theme.
  motifs: string
}

export const REALMS: RealmDef[] = [
  {
    id: 'lastlife',
    name: 'Last Life',
    icon: '🌆',
    tagline: 'One ordinary life, lived for real',
    hue: 265,
    brief:
      'A grounded, present-day life in urban India. Ambition, money, love, burnout, family expectations, startups and quiet wins. Stakes are human and relatable — no magic, just the weight of real choices.',
    motifs: 'careers, rent, exams, side-hustles, friendships, heartbreak, small joys',
  },
  {
    id: 'mythos',
    name: 'Mythos',
    icon: '⚡',
    tagline: 'A mortal walking among old gods',
    hue: 190,
    brief:
      'A mythic world where the player is a mortal whose everyday choices ripple into the affairs of gods, oracles and ancient bargains. Careers become callings; rivals become nemeses; money becomes tribute and favour.',
    motifs: 'omens, oracles, blessings, curses, trials, relics, fate',
  },
  {
    id: 'kingdom',
    name: 'Kingdom',
    icon: '👑',
    tagline: 'Climb from commoner to crown',
    hue: 45,
    brief:
      'A medieval realm of courts, guilds and intrigue. The player rises through station and reputation; skills are trades, careers are guild ranks, finance is coin and land, and relationships are alliances and betrayals.',
    motifs: 'courts, guilds, alliances, duels, festivals, taxes, titles',
  },
  {
    id: 'crime',
    name: 'Underworld',
    icon: '🎲',
    tagline: 'Rise through a city that bites back',
    hue: 350,
    brief:
      'A neon-noir criminal underworld. Every opportunity carries risk; reputation is respect on the street, money is dirty and hot, allies can flip, and one wrong choice draws heat. High risk, high reward, real consequences.',
    motifs: 'heists, deals, debts, loyalty, heat, hustle, betrayal',
  },
]

export const REALM_MAP: Record<RealmId, RealmDef> = Object.fromEntries(
  REALMS.map((r) => [r.id, r]),
) as Record<RealmId, RealmDef>

export const DEFAULT_REALM: RealmId = 'lastlife'

export function getRealm(id: RealmId | undefined): RealmDef {
  return REALM_MAP[id ?? DEFAULT_REALM] ?? REALM_MAP[DEFAULT_REALM]
}
