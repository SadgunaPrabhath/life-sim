import { useGame } from '@/hooks/GameContext'
import { getRealm } from '@/game/data/realms'

// Shown while the AI Dungeon Master is generating a bespoke event.
export function WeavingOverlay() {
  const { weaving, realm } = useGame()
  if (!weaving) return null
  const r = getRealm(realm)
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5 px-8 text-center">
        <div className="text-6xl animate-pulse">{r.icon}</div>
        <div className="dm-orbit" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div>
          <div className="text-lg font-semibold title-gradient">
            The Dungeon Master is weaving your fate…
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {r.name} · shaping this moment around your life
          </div>
        </div>
      </div>
    </div>
  )
}
