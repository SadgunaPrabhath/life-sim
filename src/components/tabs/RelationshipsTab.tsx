import { useGame } from '@/hooks/GameContext'
import type { NPC } from '@/types'
import { clamp } from '@/utils/random'

const typeStyle: Record<string, string> = {
  Acquaintance: 'text-gray-400 bg-white/5',
  Friend: 'text-cyan-300 bg-cyan-500/15',
  'Best Friend': 'text-emerald-300 bg-emerald-500/15',
  Mentor: 'text-violet-300 bg-violet-500/15',
  Rival: 'text-red-300 bg-red-500/15',
  Romantic: 'text-pink-300 bg-pink-500/15',
  Partner: 'text-fuchsia-300 bg-fuchsia-500/15',
}

interface Interaction {
  label: string
  icon: string
  trust: number
  level: number
  cash?: number
  happiness?: number
}
const INTERACTIONS: Interaction[] = [
  { label: 'Talk', icon: '💬', trust: 3, level: 3 },
  { label: 'Meet', icon: '🤝', trust: 4, level: 5, happiness: 2 },
  { label: 'Help', icon: '🆘', trust: 7, level: 6 },
  { label: 'Gift', icon: '🎁', trust: 5, level: 7, cash: -5000, happiness: 1 },
  { label: 'Travel', icon: '✈️', trust: 8, level: 12, cash: -20000, happiness: 5 },
  { label: 'Date', icon: '💘', trust: 6, level: 10, cash: -3000, happiness: 4 },
  { label: 'Apologize', icon: '🙏', trust: 6, level: 4 },
]

export function RelationshipsTab() {
  const { state, mutate, pushToast } = useGame()
  if (!state) return null

  const interact = (npc: NPC, act: Interaction) => {
    if (act.cash && state.finance.cash < -act.cash) {
      pushToast({ icon: '💸', title: 'Not enough cash', tone: 'bad' })
      return
    }
    mutate((s) => {
      const t = s.npcs.find((n) => n.id === npc.id)
      if (!t) return
      t.trust = clamp(t.trust + act.trust)
      t.level = clamp(t.level + act.level)
      t.lastInteractionMonth = s.monthIndex
      if (act.cash) s.finance.cash += act.cash
      if (act.happiness) s.stats.happiness = clamp(s.stats.happiness + act.happiness)
      // Evolve type on the spot for satisfying feedback.
      if (t.type === 'Friend' && t.level >= 75 && t.trust >= 70) t.type = 'Best Friend'
      if (t.type === 'Romantic' && t.level >= 80 && t.trust >= 75) t.type = 'Partner'
      if (t.type === 'Acquaintance' && t.level >= 45) t.type = 'Friend'
      t.memory.push(`${act.label} · month ${s.monthIndex}`)
      if (t.memory.length > 6) t.memory.shift()
    })
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h2 className="text-xl font-bold text-white">Relationships</h2>
        <p className="text-sm text-gray-400">{state.npcs.length} connections. Nurture them — neglected bonds fade over time.</p>
      </div>

      {state.npcs.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">No relationships yet. Attend events and meet friends to build your circle.</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {state.npcs.map((npc) => (
            <div key={npc.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-lg font-bold border border-white/15" style={{ background: `linear-gradient(135deg, hsl(${npc.avatarHue},60%,45%), hsl(${(npc.avatarHue + 50) % 360},60%,38%))` }}>
                  {npc.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-white truncate">{npc.name}</div>
                    <span className={`chip text-[10px] py-0.5 ${typeStyle[npc.type]}`}>{npc.type}</span>
                  </div>
                  <div className="text-xs text-gray-500">Age {npc.age} · {npc.personality}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <Bar label="Trust" value={npc.trust} color="from-cyan-500 to-sky-500" />
                <Bar label="Bond" value={npc.level} color="from-pink-500 to-fuchsia-500" />
                <Bar label="Match" value={npc.compatibility} color="from-violet-500 to-purple-500" />
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {INTERACTIONS.map((act) => (
                  <button
                    key={act.label}
                    onClick={() => interact(npc, act)}
                    title={act.cash ? `Cost ₹${Math.abs(act.cash).toLocaleString('en-IN')}` : ''}
                    className="chip bg-white/5 border border-white/10 text-gray-300 hover:bg-accent/20 hover:border-accent/40 hover:text-white transition text-[11px]"
                  >
                    {act.icon} {act.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mt-1">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-[width] duration-500`} style={{ width: `${value}%` }} />
      </div>
      <div className="text-[11px] font-mono text-gray-400 mt-0.5">{Math.round(value)}</div>
    </div>
  )
}
