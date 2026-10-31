import { useGame } from '@/hooks/GameContext'

const toneStyle: Record<string, string> = {
  good: 'border-accent-green/40 shadow-[0_0_20px_-6px_rgba(34,197,94,0.5)]',
  bad: 'border-accent-red/40 shadow-[0_0_20px_-6px_rgba(239,68,68,0.5)]',
  epic: 'border-accent/50 shadow-glow',
  neutral: 'border-white/15',
}

export function Toasts() {
  const { toasts } = useGame()
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[min(92vw,360px)] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`glass-strong rounded-2xl border px-4 py-3 flex items-start gap-3 animate-slide-up ${toneStyle[t.tone]}`}
        >
          <span className="text-2xl leading-none">{t.icon}</span>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-white">{t.title}</div>
            {t.message && <div className="text-xs text-gray-300 mt-0.5 line-clamp-2">{t.message}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
