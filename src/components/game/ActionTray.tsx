import { useState } from 'react'
import { useGame } from '@/hooks/GameContext'
import { ACTIONS } from '@/game/data/actions'
import type { ActionCategory } from '@/types'
import { Zap, Check, ChevronDown } from 'lucide-react'

const CATEGORIES: ActionCategory[] = ['Career', 'Skills', 'Education', 'Health', 'Social', 'Finance']

export function ActionTray() {
  const { state, toggleAction, liveNextMonth, simulating } = useGame()
  const [openCat, setOpenCat] = useState<ActionCategory>('Career')
  if (!state) return null

  const selected = state.pendingActions
  const energy = state.stats.energy
  const plannedEnergy = selected.reduce((a, id) => a + (ACTIONS.find((x) => x.id === id)?.energyCost ?? 0), 0)

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-white">Plan Your Month</h3>
          <p className="text-xs text-gray-500">Pick up to 3 focuses, then live it out.</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-gray-500">Energy</div>
          <div className={`font-mono font-bold ${energy - plannedEnergy < 0 ? 'text-accent-red' : 'text-accent-cyan'}`}>
            <Zap size={12} className="inline mb-0.5" /> {Math.max(0, Math.round(energy - plannedEnergy))}
          </div>
        </div>
      </div>

      {/* selected chips */}
      <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
        {selected.length === 0 && <span className="text-xs text-gray-600 italic">No actions selected — you'll coast this month.</span>}
        {selected.map((id) => {
          const a = ACTIONS.find((x) => x.id === id)!
          return (
            <button key={id} onClick={() => toggleAction(id)} className="chip bg-accent/20 border border-accent/40 text-white hover:bg-accent/30 transition">
              {a.icon} {a.label} ✕
            </button>
          )
        })}
      </div>

      {/* category accordions */}
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 -mr-1">
        {CATEGORIES.map((cat) => {
          const items = ACTIONS.filter((a) => a.category === cat && (a.available ? a.available(state) : true))
          if (!items.length) return null
          const open = openCat === cat
          return (
            <div key={cat} className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
              <button onClick={() => setOpenCat(open ? ('' as any) : cat)} className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/[0.03]">
                {cat}
                <ChevronDown size={16} className={`transition ${open ? 'rotate-180 text-accent-cyan' : 'text-gray-500'}`} />
              </button>
              {open && (
                <div className="grid sm:grid-cols-2 gap-1.5 p-2 pt-0 animate-fade-in">
                  {items.map((a) => {
                    const on = selected.includes(a.id)
                    return (
                      <button
                        key={a.id}
                        onClick={() => toggleAction(a.id)}
                        title={a.description}
                        className={`text-left rounded-lg px-3 py-2 border transition-all ${on ? 'border-accent/60 bg-accent/15' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{a.icon} {a.label}</span>
                          {on ? <Check size={14} className="text-accent-cyan" /> : <span className="text-[10px] text-gray-500 font-mono">⚡{a.energyCost}</span>}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">{a.description}</div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={liveNextMonth}
        disabled={simulating}
        className="btn-primary w-full mt-4 text-base py-3.5 relative overflow-hidden group"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 bg-[length:200%_100%] animate-shimmer" />
        {simulating ? (
          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Living...</span>
        ) : (
          <>▶ LIVE NEXT MONTH</>
        )}
      </button>
    </div>
  )
}
