import { useGame } from '@/hooks/GameContext'
import { Modal } from '@/components/ui/Modal'
import { ChevronRight, Sparkles } from 'lucide-react'

export function EventModal() {
  const { pendingEvent, resolveEvent } = useGame()
  if (!pendingEvent) return null
  return (
    <Modal open size="md" dismissable={false}>
      <div className="p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-1">
          <span className="chip bg-accent/20 text-violet-200 border border-accent/30">{pendingEvent.category}</span>
          {pendingEvent.aiGenerated ? (
            <span className="chip bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 inline-flex items-center gap-1">
              <Sparkles size={11} /> Dungeon Master
            </span>
          ) : (
            <span className="chip bg-white/5 text-gray-400">Life Event</span>
          )}
        </div>
        <div className="flex items-start gap-4 mt-3">
          <div className="text-5xl animate-pop">{pendingEvent.icon}</div>
          <div>
            <h2 className="text-2xl font-bold title-gradient">{pendingEvent.title}</h2>
            <p className="text-gray-300 mt-2 leading-relaxed">{pendingEvent.text}</p>
          </div>
        </div>
        <div className="mt-6 space-y-2.5">
          {pendingEvent.choices.map((c, i) => (
            <button
              key={i}
              onClick={() => resolveEvent(i)}
              className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-accent/40 transition-all p-4 group active:scale-[0.99]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white group-hover:text-violet-200 transition">
                    <span className="text-accent-cyan font-mono mr-2">{String.fromCharCode(65 + i)})</span>
                    {c.label}
                  </div>
                  {c.description && <div className="text-sm text-gray-400 mt-0.5">{c.description}</div>}
                </div>
                <ChevronRight className="text-gray-500 group-hover:text-accent-cyan group-hover:translate-x-1 transition-all shrink-0" size={20} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}
