import { Home, BarChart3, Briefcase, Brain, Heart, Wallet, ScrollText, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type TabKey =
  | 'life'
  | 'stats'
  | 'career'
  | 'skills'
  | 'relationships'
  | 'finance'
  | 'history'
  | 'achievements'

export interface TabDef {
  key: TabKey
  label: string
  icon: LucideIcon
  emoji: string
}

export const TABS: TabDef[] = [
  { key: 'life', label: 'LIFE', icon: Home, emoji: '🏠' },
  { key: 'stats', label: 'STATS', icon: BarChart3, emoji: '📊' },
  { key: 'career', label: 'CAREER', icon: Briefcase, emoji: '💼' },
  { key: 'skills', label: 'SKILLS', icon: Brain, emoji: '🧠' },
  { key: 'relationships', label: 'BONDS', icon: Heart, emoji: '❤️' },
  { key: 'finance', label: 'FINANCE', icon: Wallet, emoji: '💰' },
  { key: 'history', label: 'HISTORY', icon: ScrollText, emoji: '📜' },
  { key: 'achievements', label: 'AWARDS', icon: Trophy, emoji: '🏆' },
]
