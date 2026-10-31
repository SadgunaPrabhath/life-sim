import { TABS, type TabKey } from './nav'

interface Props {
  active: TabKey
  onChange: (t: TabKey) => void
}

// Desktop: vertical rail. Mobile: bottom bar. Rendered responsively.
export function NavRail({ active, onChange }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col gap-1 sticky top-20 h-fit w-[188px] shrink-0">
        {TABS.map((t) => {
          const on = active === t.key
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                on
                  ? 'bg-gradient-to-r from-accent/25 to-accent-cyan/10 text-white border border-accent/30 shadow-glow'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={18} className={on ? 'text-accent-cyan' : 'group-hover:text-accent-cyan transition'} />
              {t.label}
            </button>
          )
        })}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass-strong border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-8 gap-0.5 px-1 py-1.5">
          {TABS.map((t) => {
            const on = active === t.key
            const Icon = t.icon
            return (
              <button
                key={t.key}
                onClick={() => onChange(t.key)}
                className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 transition ${on ? 'text-accent-cyan' : 'text-gray-500'}`}
              >
                <Icon size={18} className={on ? 'drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]' : ''} />
                <span className="text-[8px] font-semibold tracking-tight">{t.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
