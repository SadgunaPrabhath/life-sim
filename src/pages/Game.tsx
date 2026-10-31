import { useState } from 'react'
import { useGame } from '@/hooks/GameContext'
import { TopBar } from '@/components/game/TopBar'
import { NavRail } from '@/components/game/NavRail'
import type { TabKey } from '@/components/game/nav'
import { LifeTab } from '@/components/tabs/LifeTab'
import { StatsTab } from '@/components/tabs/StatsTab'
import { CareerTab } from '@/components/tabs/CareerTab'
import { SkillsTab } from '@/components/tabs/SkillsTab'
import { RelationshipsTab } from '@/components/tabs/RelationshipsTab'
import { FinanceTab } from '@/components/tabs/FinanceTab'
import { HistoryTab } from '@/components/tabs/HistoryTab'
import { AchievementsTab } from '@/components/tabs/AchievementsTab'
import { Flag } from 'lucide-react'

export function Game() {
  const { state, retire } = useGame()
  const [tab, setTab] = useState<TabKey>('life')
  const [confirmRetire, setConfirmRetire] = useState(false)
  if (!state) return null
  const ageYears = Math.floor((state.character.startAgeMonths + state.monthIndex) / 12)
  const canRetire = ageYears >= 40

  return (
    <div className="min-h-screen bg-noise">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 py-5 flex gap-6">
        <NavRail active={tab} onChange={setTab} />
        <main className="flex-1 min-w-0 pb-24 lg:pb-6">
          <div key={tab} className="animate-fade-in">
            {tab === 'life' && <LifeTab />}
            {tab === 'stats' && <StatsTab />}
            {tab === 'career' && <CareerTab />}
            {tab === 'skills' && <SkillsTab />}
            {tab === 'relationships' && <RelationshipsTab />}
            {tab === 'finance' && <FinanceTab />}
            {tab === 'history' && <HistoryTab />}
            {tab === 'achievements' && <AchievementsTab />}
          </div>

          {canRetire && (
            <div className="mt-6 card p-4 flex items-center justify-between flex-wrap gap-3 border-accent-amber/20">
              <div>
                <div className="font-semibold text-white flex items-center gap-2"><Flag size={16} className="text-accent-amber" /> Ready to retire?</div>
                <div className="text-xs text-gray-500">End your journey at {ageYears} and see your full life story & final score.</div>
              </div>
              {confirmRetire ? (
                <div className="flex gap-2">
                  <button onClick={() => setConfirmRetire(false)} className="btn-ghost">Keep Going</button>
                  <button onClick={retire} className="btn-primary">Confirm Retire</button>
                </div>
              ) : (
                <button onClick={() => setConfirmRetire(true)} className="btn-outline border-accent-amber/40 text-accent-amber">Retire</button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
