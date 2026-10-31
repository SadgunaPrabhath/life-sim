import { GameProvider, useGame } from '@/hooks/GameContext'
import { StartMenu } from '@/pages/StartMenu'
import { CharacterCreation } from '@/pages/CharacterCreation'
import { Game } from '@/pages/Game'
import { EndScreen } from '@/pages/EndScreen'
import { Toasts } from '@/components/ui/Toasts'
import { EventModal } from '@/components/modals/EventModal'
import { SummaryModal } from '@/components/modals/SummaryModal'
import { AchievementPopup } from '@/components/modals/AchievementPopup'
import { WeavingOverlay } from '@/components/modals/WeavingOverlay'
import { DMStatusBar } from '@/components/game/DMStatusBar'

function Shell() {
  const { phase } = useGame()
  return (
    <div className="bg-noise min-h-screen">
      {phase === 'menu' && <StartMenu />}
      {phase === 'creation' && <CharacterCreation />}
      {phase === 'playing' && <Game />}
      {phase === 'ended' && <EndScreen />}

      {/* Global overlays */}
      <WeavingOverlay />
      <EventModal />
      <SummaryModal />
      <AchievementPopup />
      <DMStatusBar />
      <Toasts />
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  )
}
