// ============================================================================
// AI DUNGEON MASTER — local LLM provider (Ollama)
// ----------------------------------------------------------------------------
// Talks to a locally-running Ollama instance (https://ollama.com) — no API key,
// nothing leaves the machine. When Ollama is running the DM *generates* fresh
// events grounded in the player's real state + NPC memory + the chosen realm,
// so no two lives play the same. When it's absent the game silently falls back
// to the deterministic LocalEventEngine (see ai.ts). Nothing breaks either way.
// ============================================================================

import type { GameEventDef, GameState, RealmId, Stats } from '@/types'
import { SKILLS } from '@/game/data/skills'
import { CAREER_MAP } from '@/game/data/careers'
import { getRealm } from '@/game/data/realms'
import { clamp } from '@/utils/random'

const LS_URL = 'lifesim.ollama.url'
const LS_MODEL = 'lifesim.ollama.model'
const DEFAULT_URL = 'http://localhost:11434'

export function ollamaUrl(): string {
  try {
    return localStorage.getItem(LS_URL) || DEFAULT_URL
  } catch {
    return DEFAULT_URL
  }
}

export function setOllamaUrl(url: string) {
  try {
    localStorage.setItem(LS_URL, url.trim().replace(/\/$/, ''))
  } catch {
    /* ignore */
  }
}

function storedModel(): string | null {
  try {
    return localStorage.getItem(LS_MODEL)
  } catch {
    return null
  }
}

export function setPreferredModel(model: string) {
  try {
    localStorage.setItem(LS_MODEL, model)
  } catch {
    /* ignore */
  }
}

export interface DMStatus {
  connected: boolean
  model: string | null
  models: string[]
  error?: string
}

// Prefer a capable, small instruct model if the user hasn't picked one.
const MODEL_PREFERENCE = ['llama3.1', 'llama3.2', 'llama3', 'qwen2.5', 'mistral', 'phi3', 'gemma2']

function chooseModel(models: string[]): string | null {
  if (!models.length) return null
  const saved = storedModel()
  if (saved && models.includes(saved)) return saved
  for (const pref of MODEL_PREFERENCE) {
    const hit = models.find((m) => m.toLowerCase().startsWith(pref))
    if (hit) return hit
  }
  return models[0]
}

/** Ping Ollama and report which models are available. Never throws. */
export async function detectOllama(signal?: AbortSignal): Promise<DMStatus> {
  try {
    const res = await fetch(`${ollamaUrl()}/api/tags`, { signal })
    if (!res.ok) return { connected: false, model: null, models: [], error: `HTTP ${res.status}` }
    const data = (await res.json()) as { models?: { name: string }[] }
    const models = (data.models ?? []).map((m) => m.name)
    return { connected: models.length > 0, model: chooseModel(models), models }
  } catch (e) {
    return { connected: false, model: null, models: [], error: (e as Error).message }
  }
}

// ---------------------------------------------------------------------------
// Prompt construction — a tight, grounded snapshot of the player's real life.
// ---------------------------------------------------------------------------
const VALID_SKILL_IDS = new Set(SKILLS.map((s) => s.id))

function ageYears(s: GameState): number {
  return Math.floor((s.character.startAgeMonths + s.monthIndex) / 12)
}

function topSkills(s: GameState): string {
  const entries = Object.entries(s.skills)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  return entries.length ? entries.map(([id, v]) => `${id} ${Math.round(v)}`).join(', ') : 'none yet'
}

function contextBlock(s: GameState): string {
  const c = s.character
  const career = s.career.careerId ? CAREER_MAP[s.career.careerId] : null
  const careerTitle = career ? career.levels[s.career.levelIndex].title : 'student / seeking work'
  const recent = s.history.slice(-6).map((h) => `- ${h.text}`).join('\n') || '- (life has just begun)'
  const npcs =
    s.npcs
      .slice(0, 6)
      .map((n) => {
        const mem = n.memory.slice(-2).join('; ')
        return `- ${n.name} (${n.type}, trust ${Math.round(n.trust)}, id=${n.id})${mem ? ` — remembers: ${mem}` : ''}`
      })
      .join('\n') || '- (no close relationships yet)'

  return [
    `PLAYER: ${c.name}, age ${ageYears(s)}, ${c.personality}, in ${c.city}.`,
    `CAREER: ${careerTitle}. Salary ₹${Math.round(s.career.salary)}/mo. Cash ₹${Math.round(s.finance.cash)}.`,
    `STATS (0-100): health ${s.stats.health}, happiness ${s.stats.happiness}, energy ${s.stats.energy}, ` +
      `social ${s.stats.social}, reputation ${s.stats.reputation}, discipline ${s.stats.discipline}, intelligence ${s.stats.intelligence}.`,
    `TOP SKILLS: ${topSkills(s)}.`,
    `RECENT LIFE MOMENTS:\n${recent}`,
    `PEOPLE IN THEIR LIFE:\n${npcs}`,
  ].join('\n')
}

const SYSTEM_PROMPT = `You are the DUNGEON MASTER of a life-simulation RPG. Each turn you invent ONE vivid, believable life event tailored to THIS player's exact situation, then offer 2-3 meaningful choices with real trade-offs.

Rules:
- Ground every event in the player's actual stats, career, money, recent moments and relationships. Reference specific people by name when it fits, and honour what those people "remember".
- Make consequences matter: choices should have clear upside AND cost. No purely good options.
- Stay in the tone of the given REALM, but keep the underlying life-sim believable.
- Never repeat a recent event. Keep prose tight (2-4 sentences of setup, one line per choice result).

Respond with ONLY minified JSON, no markdown, matching exactly:
{"title":string,"icon":string(one emoji),"category":string,"npcId":string|null,"text":string,"choices":[{"label":string,"description":string,"resultText":string,"effect":{"stats":{"health"?:number,"happiness"?:number,"energy"?:number,"social"?:number,"reputation"?:number,"discipline"?:number,"intelligence"?:number,"skills"?:number},"cash"?:number,"reputationDelta"?:number,"skillGains"?:[{"skillId":string,"amount":number}]}}]}
Stat deltas range -20..20. cash is rupees, -200000..500000. skillGains amount 1..15. npcId must be one of the listed person ids or null. Provide 2 or 3 choices.`

// ---------------------------------------------------------------------------
// Sanitisation — never trust raw model output; coerce into a safe event.
// ---------------------------------------------------------------------------
const STAT_KEYS: (keyof Stats)[] = [
  'health',
  'happiness',
  'energy',
  'social',
  'reputation',
  'discipline',
  'intelligence',
  'skills',
]

function sanitizeEffect(raw: any): GameEventDef['choices'][number]['effect'] {
  const eff: any = {}
  if (raw && typeof raw === 'object') {
    if (raw.stats && typeof raw.stats === 'object') {
      const stats: any = {}
      for (const k of STAT_KEYS) {
        const v = Number(raw.stats[k])
        if (Number.isFinite(v) && v !== 0) stats[k] = clampInt(v, -20, 20)
      }
      if (Object.keys(stats).length) eff.stats = stats
    }
    // Small local models sometimes nest cash / reputationDelta *inside* stats.
    // Recover them from either location (top-level wins).
    const rawCash = raw.cash ?? raw.stats?.cash
    const rawRep = raw.reputationDelta ?? raw.stats?.reputationDelta
    if (Number.isFinite(Number(rawCash)) && Number(rawCash) !== 0) {
      eff.cash = clampInt(Number(rawCash), -200000, 500000)
    }
    if (Number.isFinite(Number(rawRep)) && Number(rawRep) !== 0) {
      eff.reputationDelta = clampInt(Number(rawRep), -20, 20)
    }
    if (Array.isArray(raw.skillGains)) {
      const gains = raw.skillGains
        .filter((g: any) => g && VALID_SKILL_IDS.has(String(g.skillId)))
        .map((g: any) => ({ skillId: String(g.skillId), amount: clampInt(Number(g.amount) || 0, 1, 15) }))
        .slice(0, 3)
      if (gains.length) eff.skillGains = gains
    }
  }
  return eff
}

function clampInt(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(v)))
}

function str(v: any, fallback = ''): string {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback
}

function coerceEvent(raw: any, s: GameState): GameEventDef | null {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.choices) || raw.choices.length < 2) return null
  const npcId = str(raw.npcId)
  const validNpc = s.npcs.find((n) => n.id === npcId)
  const choices = raw.choices
    .slice(0, 3)
    .map((c: any, i: number) => ({
      label: str(c?.label, `Option ${String.fromCharCode(65 + i)}`),
      description: str(c?.description) || undefined,
      resultText: str(c?.resultText, 'You make your choice and live with it.'),
      effect: sanitizeEffect(c?.effect),
    }))
    .filter((c: any) => c.label)
  if (choices.length < 2) return null

  return {
    id: `dm_${s.monthIndex}_${Math.floor(Math.random() * 1e6)}`,
    title: str(raw.title, 'A Turn of Fate'),
    category: str(raw.category, 'Life'),
    icon: str(raw.icon, '🎲').slice(0, 4),
    text: str(raw.text, 'Something happens that demands a decision.'),
    baseWeight: 1,
    choices,
    aiGenerated: true,
    aiNpcId: validNpc ? validNpc.id : undefined,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export interface GenerateOpts {
  model: string
  realm: RealmId
  signal?: AbortSignal
}

// Ollama structured-output schema. Forcing the shape makes small local models
// (e.g. llama3.2 3B) reliably emit a complete event instead of truncating.
const EVENT_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    icon: { type: 'string' },
    category: { type: 'string' },
    npcId: { type: ['string', 'null'] },
    text: { type: 'string' },
    choices: {
      type: 'array',
      minItems: 2,
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          description: { type: 'string' },
          resultText: { type: 'string' },
          effect: {
            type: 'object',
            properties: {
              stats: { type: 'object' },
              cash: { type: 'number' },
              reputationDelta: { type: 'number' },
              skillGains: { type: 'array' },
            },
          },
        },
        required: ['label', 'resultText', 'effect'],
      },
    },
  },
  required: ['title', 'icon', 'category', 'text', 'choices'],
} as const

/** Ask the DM for a fresh, grounded event. Returns null on any failure. */
export async function generateEvent(s: GameState, opts: GenerateOpts): Promise<GameEventDef | null> {
  const realm = getRealm(opts.realm)
  const user = [
    `REALM: ${realm.name} — ${realm.tagline}.`,
    `WORLD: ${realm.brief}`,
    `MOTIFS to lean on: ${realm.motifs}.`,
    '',
    contextBlock(s),
    '',
    'Invent the next event for this player now. JSON only.',
  ].join('\n')

  try {
    const res = await fetch(`${ollamaUrl()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: opts.signal,
      body: JSON.stringify({
        model: opts.model,
        stream: false,
        format: EVENT_SCHEMA,
        options: { temperature: 0.8, top_p: 0.95, num_predict: 1200 },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: user },
        ],
      }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { message?: { content?: string } }
    const content = data.message?.content
    if (!content) return null
    return coerceEvent(JSON.parse(content), s)
  } catch {
    return null
  }
}

/** Generate a closing life-story narrated in the realm's voice. */
export async function generateStory(s: GameState, opts: GenerateOpts): Promise<string | null> {
  const realm = getRealm(opts.realm)
  try {
    const res = await fetch(`${ollamaUrl()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: opts.signal,
      body: JSON.stringify({
        model: opts.model,
        stream: false,
        options: { temperature: 0.85 },
        messages: [
          {
            role: 'system',
            content: `You are a masterful storyteller. Write a moving 150-220 word life story in the tone of the "${realm.name}" realm (${realm.tagline}), in third person, using ONLY the true events provided. No headings, no lists — flowing prose.`,
          },
          { role: 'user', content: contextBlock(s) + '\n\nWrite their life story.' },
        ],
      }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { message?: { content?: string } }
    return str(data.message?.content) || null
  } catch {
    return null
  }
}

// Re-exported so callers can clamp stat writes consistently if needed.
export { clamp }
