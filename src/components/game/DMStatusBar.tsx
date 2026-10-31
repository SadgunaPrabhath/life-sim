import { useState } from 'react'
import { useGame } from '@/hooks/GameContext'
import { REALMS, getRealm } from '@/game/data/realms'
import { Sparkles, ChevronDown, RefreshCw } from 'lucide-react'

// A floating pill (bottom-left while playing) showing the AI Dungeon Master's
// connection status and letting the player switch the active realm/world-theme.
export function DMStatusBar() {
  const { phase, dm, realm, setRealm, refreshDM } = useGame()
  const [open, setOpen] = useState(false)
  if (phase !== 'playing') return null
  const r = getRealm(realm)

  return (
    <div className="fixed bottom-4 left-4 z-40 select-none">
      {open && (
        <div className="mb-2 w-64 rounded-2xl border border-white/10 bg-[#12101c]/95 backdrop-blur-md p-2 shadow-2xl">
          <div className="px-2 py-1.5 text-[11px] uppercase tracking-wider text-gray-500">Choose realm</div>
          {REALMS.map((rd) => (
            <button
              key={rd.id}
              onClick={() => {
                setRealm(rd.id)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${
                rd.id === realm ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <span className="text-xl">{rd.icon}</span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white">{rd.name}</span>
                <span className="block text-xs text-gray-400 truncate">{rd.tagline}</span>
              </span>
            </button>
          ))}
          <div className="mt-1 border-t border-white/5 px-2.5 py-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {dm.connected ? (
                <>DM: <span className="text-emerald-400">{dm.model}</span></>
              ) : (
                <>DM offline · <span className="text-gray-500">local events</span></>
              )}
            </span>
            <button
              onClick={() => refreshDM()}
              className="text-gray-400 hover:text-white transition"
              title="Re-check for a local model"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-[#12101c]/90 backdrop-blur-md pl-3 pr-2.5 py-2 shadow-xl hover:border-accent/40 transition"
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            dm.connected ? 'bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]' : 'bg-gray-500'
          }`}
        />
        <Sparkles size={14} className={dm.connected ? 'text-accent-cyan' : 'text-gray-500'} />
        <span className="text-sm">{r.icon}</span>
        <span className="text-sm font-medium text-white">{r.name}</span>
        <ChevronDown size={14} className="text-gray-500" />
      </button>
    </div>
  )
}
