import type { StatKey } from '@/types'

export interface StatMeta {
  key: StatKey
  label: string
  icon: string
  color: string
  gradient: string
}

export const STAT_META: StatMeta[] = [
  { key: 'health', label: 'Health', icon: '❤️', color: '#ef4444', gradient: 'from-rose-500 to-red-500' },
  { key: 'intelligence', label: 'Intelligence', icon: '🧠', color: '#8b5cf6', gradient: 'from-violet-500 to-purple-500' },
  { key: 'skills', label: 'Skills', icon: '💻', color: '#06b6d4', gradient: 'from-cyan-500 to-sky-500' },
  { key: 'discipline', label: 'Discipline', icon: '🔥', color: '#f97316', gradient: 'from-orange-500 to-amber-500' },
  { key: 'happiness', label: 'Happiness', icon: '😊', color: '#eab308', gradient: 'from-yellow-400 to-amber-500' },
  { key: 'energy', label: 'Energy', icon: '⚡', color: '#22d3ee', gradient: 'from-teal-400 to-cyan-400' },
  { key: 'social', label: 'Social', icon: '🤝', color: '#ec4899', gradient: 'from-pink-500 to-fuchsia-500' },
  { key: 'reputation', label: 'Reputation', icon: '⭐', color: '#f59e0b', gradient: 'from-amber-400 to-yellow-500' },
]

export const STAT_META_MAP: Record<StatKey, StatMeta> = Object.fromEntries(
  STAT_META.map((m) => [m.key, m]),
) as Record<StatKey, StatMeta>
