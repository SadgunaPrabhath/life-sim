import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { GameState, MonthlySummary, GameEventDef, RealmId } from '@/types'
import { createNewGame, type CreationInput } from '@/game/engine/state'
import {
  advanceMonth,
  checkAchievements,
  checkLifeEnd,
  retire as retireFn,
} from '@/game/engine/simulation'
import { applyEventEffect } from '@/game/engine/events'
import { saveGame, loadGame, clearSave, hasSave } from '@/utils/storage'
import { ACHIEVEMENT_MAP } from '@/game/data/achievements'
import { detectOllama, generateEvent, type DMStatus } from '@/game/engine/ollama'
import { DEFAULT_REALM } from '@/game/data/realms'

export type Phase = 'menu' | 'creation' | 'playing' | 'ended'

export interface Toast {
  id: number
  icon: string
  title: string
  message?: string
  tone: 'good' | 'bad' | 'neutral' | 'epic'
}

interface GameContextValue {
  state: GameState | null
  phase: Phase
  hasSavedGame: boolean
  // transient UI
  toasts: Toast[]
  pendingSummary: MonthlySummary | null
  pendingEvent: GameEventDef | null
  achievementPopup: string | null
  simulating: boolean
  // AI Dungeon Master
  dm: DMStatus
  weaving: boolean
  realm: RealmId
  refreshDM: () => void
  setRealm: (r: RealmId) => void
  // actions
  goToCreation: () => void
  backToMenu: () => void
  startGame: (input: CreationInput) => void
  continueGame: () => void
  toggleAction: (actionId: string) => void
  liveNextMonth: () => void
  resolveEvent: (choiceIndex: number) => void
  dismissSummary: () => void
  retire: () => void
  newLife: () => void
  saveNow: () => void
  pushToast: (t: Omit<Toast, 'id'>) => void
  mutate: (fn: (s: GameState) => void, toast?: Omit<Toast, 'id'>) => void
}

const GameContext = createContext<GameContextValue | null>(null)

let toastId = 1

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState | null>(null)
  const [phase, setPhase] = useState<Phase>('menu')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [pendingSummary, setPendingSummary] = useState<MonthlySummary | null>(null)
  const [pendingEvent, setPendingEvent] = useState<GameEventDef | null>(null)
  const [achievementPopup, setAchievementPopup] = useState<string | null>(null)
  const [simulating, setSimulating] = useState(false)
  const [hasSavedGame, setHasSavedGame] = useState(false)
  const [dm, setDM] = useState<DMStatus>({ connected: false, model: null, models: [] })
  const [weaving, setWeaving] = useState(false)
  const achievementQueue = useRef<string[]>([])
  // Ref mirror of state so click handlers can read the latest value without
  // performing side-effects inside a setState updater (which StrictMode
  // double-invokes, causing double month advancement).
  const stateRef = useRef<GameState | null>(null)
  useEffect(() => {
    stateRef.current = state
  }, [state])
  const commit = (next: GameState) => {
    stateRef.current = next
    setState(next)
  }

  // Mirror DM status into a ref so the async month loop always reads the latest.
  const dmRef = useRef<DMStatus>(dm)
  useEffect(() => {
    dmRef.current = dm
  }, [dm])

  const refreshDM = useCallback(() => {
    detectOllama().then(setDM)
  }, [])

  useEffect(() => {
    setHasSavedGame(hasSave())
    refreshDM()
  }, [refreshDM])

  // Autosave whenever state changes while playing.
  useEffect(() => {
    if (state && (phase === 'playing' || phase === 'ended')) {
      saveGame(state)
      setHasSavedGame(true)
    }
  }, [state, phase])

  const pushToast = (t: Omit<Toast, 'id'>) => {
    const id = toastId++
    setToasts((prev) => [...prev, { ...t, id }])
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200)
  }

  const flushAchievements = (newly: string[]) => {
    if (!newly.length) return
    achievementQueue.current.push(...newly)
    // Show first as a big popup; rest as toasts.
    const showNext = () => {
      const next = achievementQueue.current.shift()
      if (!next) return
      setAchievementPopup(next)
    }
    if (!achievementPopup) showNext()
  }

  const clearAchievementPopup = () => {
    setAchievementPopup(null)
    setTimeout(() => {
      const next = achievementQueue.current.shift()
      if (next) setAchievementPopup(next)
    }, 250)
  }

  const goToCreation = () => setPhase('creation')
  const backToMenu = () => setPhase('menu')

  const startGame = (input: CreationInput) => {
    const g = createNewGame(input)
    commit(g)
    setPhase('playing')
    saveGame(g)
    setHasSavedGame(true)
    pushToast({ icon: '🎬', title: `Welcome, ${g.character.name}!`, message: 'Your life begins now.', tone: 'epic' })
  }

  const continueGame = () => {
    const g = loadGame()
    if (g) {
      commit(g)
      setPhase(!g.alive || g.retired ? 'ended' : 'playing')
    } else {
      pushToast({ icon: '⚠️', title: 'No save found', tone: 'bad' })
    }
  }

  const toggleAction = (actionId: string) => {
    setState((prev) => {
      if (!prev) return prev
      const next = structuredClone(prev)
      const idx = next.pendingActions.indexOf(actionId)
      if (idx >= 0) next.pendingActions.splice(idx, 1)
      else {
        if (next.pendingActions.length >= 3) {
          // replace oldest
          next.pendingActions.shift()
        }
        next.pendingActions.push(actionId)
      }
      return next
    })
  }

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

  const liveNextMonth = async () => {
    const cur = stateRef.current
    if (!cur || simulating) return
    setSimulating(true)
    const next = structuredClone(cur)
    // The deterministic core runs first: stats, finance, careers, and a
    // fallback event pick (used verbatim when the DM is offline).
    const { summary, event: localEvent } = advanceMonth(next)
    const newly = checkAchievements(next)
    const ended = checkLifeEnd(next)
    commit(next)

    // Short cinematic beat.
    await sleep(650)

    // If this month has an event AND a local model is live, let the Dungeon
    // Master weave a bespoke one grounded in the player's real state + people.
    let event = localEvent
    const status = dmRef.current
    if (localEvent && status.connected && status.model && !ended) {
      setWeaving(true)
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 25000)
      try {
        const ai = await generateEvent(next, {
          model: status.model,
          realm: next.realm ?? DEFAULT_REALM,
          signal: controller.signal,
        })
        if (ai) event = ai
      } catch {
        /* fall back to localEvent */
      } finally {
        clearTimeout(timer)
        setWeaving(false)
      }
    }

    setPendingSummary(summary)
    setPendingEvent(event)
    flushAchievements(newly)
    setSimulating(false)
    if (ended) setPhase('ended')
  }

  const resolveEvent = (choiceIndex: number) => {
    const cur = stateRef.current
    if (!cur || !pendingEvent) return
    const next = structuredClone(cur)
    const entry = applyEventEffect(next, pendingEvent, choiceIndex)
    // NPCs remember: when the DM built this event around a person, record how it
    // went so future events can call back to it.
    if (pendingEvent.aiGenerated && pendingEvent.aiNpcId) {
      const npc = next.npcs.find((n) => n.id === pendingEvent.aiNpcId)
      const chosen = pendingEvent.choices[choiceIndex]
      if (npc && chosen) {
        const age = Math.floor((next.character.startAgeMonths + next.monthIndex) / 12)
        npc.memory.push(`age ${age}: ${chosen.resultText}`)
        if (npc.memory.length > 8) npc.memory.splice(0, npc.memory.length - 8)
        npc.lastInteractionMonth = next.monthIndex
      }
    }
    const newly = checkAchievements(next)
    commit(next)
    flushAchievements(newly)
    pushToast({ icon: pendingEvent.icon, title: pendingEvent.title, message: entry.text, tone: entry.tone })
    setPendingEvent(null)
  }

  const setRealm = (r: RealmId) => {
    const cur = stateRef.current
    if (!cur) return
    const next = structuredClone(cur)
    next.realm = r
    commit(next)
  }

  const dismissSummary = () => setPendingSummary(null)

  // General-purpose immediate mutation (career switch, relationship actions, etc.)
  const mutate = (fn: (s: GameState) => void, toast?: Omit<Toast, 'id'>) => {
    const cur = stateRef.current
    if (!cur) return
    const next = structuredClone(cur)
    fn(next)
    const newly = checkAchievements(next)
    commit(next)
    flushAchievements(newly)
    if (toast) pushToast(toast)
  }

  const retire = () => {
    const cur = stateRef.current
    if (!cur) return
    const next = structuredClone(cur)
    retireFn(next)
    checkAchievements(next)
    commit(next)
    setPhase('ended')
  }

  const newLife = () => {
    clearSave()
    stateRef.current = null
    setState(null)
    setPendingEvent(null)
    setPendingSummary(null)
    setAchievementPopup(null)
    achievementQueue.current = []
    setHasSavedGame(false)
    setPhase('creation')
  }

  const saveNow = () => {
    if (state) {
      saveGame(state)
      setHasSavedGame(true)
      pushToast({ icon: '💾', title: 'Game Saved', tone: 'good' })
    }
  }

  const value: GameContextValue = {
    state,
    phase,
    hasSavedGame,
    toasts,
    pendingSummary,
    pendingEvent,
    achievementPopup,
    simulating,
    dm,
    weaving,
    realm: (state?.realm ?? DEFAULT_REALM) as RealmId,
    refreshDM,
    setRealm,
    goToCreation,
    backToMenu,
    startGame,
    continueGame,
    toggleAction,
    liveNextMonth,
    resolveEvent,
    dismissSummary,
    retire,
    newLife,
    saveNow,
    pushToast,
    mutate,
  }

  // expose clearAchievementPopup through a ref on window-free approach:
  ;(value as any)._clearAchievementPopup = clearAchievementPopup

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue & { clearAchievementPopup: () => void } {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return { ...ctx, clearAchievementPopup: (ctx as any)._clearAchievementPopup }
}

export { ACHIEVEMENT_MAP }
