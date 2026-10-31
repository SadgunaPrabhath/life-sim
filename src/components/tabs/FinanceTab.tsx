import { useGame } from '@/hooks/GameContext'
import { netWorth, monthlyIncome, monthlyExpenses, addInvestment } from '@/game/engine/finance'
import type { InvestmentKind } from '@/types'
import { formatINR } from '@/utils/format'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const ASSETS: { kind: InvestmentKind; label: string; icon: string; color: string }[] = [
  { kind: 'savings', label: 'Savings', icon: '🏦', color: '#22c55e' },
  { kind: 'index', label: 'Index Fund', icon: '📊', color: '#06b6d4' },
  { kind: 'stocks', label: 'Stocks', icon: '📈', color: '#8b5cf6' },
  { kind: 'crypto', label: 'Crypto', icon: '🪙', color: '#f59e0b' },
  { kind: 'business', label: 'Business', icon: '🚀', color: '#ec4899' },
]

const QUICK: { kind: InvestmentKind; amount: number; label: string }[] = [
  { kind: 'index', amount: 20000, label: 'Index +₹20k' },
  { kind: 'stocks', amount: 20000, label: 'Stocks +₹20k' },
  { kind: 'crypto', amount: 15000, label: 'Crypto +₹15k' },
  { kind: 'savings', amount: 25000, label: 'Savings +₹25k' },
]

export function FinanceTab() {
  const { state, mutate, pushToast } = useGame()
  if (!state) return null
  const f = state.finance
  const nw = netWorth(state)
  const income = monthlyIncome(state)
  const expenses = monthlyExpenses(state)
  const flow = income - expenses

  const pieData = ASSETS.map((a) => ({ name: a.label, value: a.kind === 'business' ? (f.business?.valuation ?? 0) : f.investments[a.kind].value, color: a.color }))
    .filter((d) => d.value > 0)
  const hasHoldings = pieData.length > 0

  const invest = (kind: InvestmentKind, amount: number) => {
    if (f.cash < amount) { pushToast({ icon: '💸', title: 'Not enough cash', tone: 'bad' }); return }
    mutate((s) => addInvestment(s, kind, amount), { icon: '📈', title: `Invested ${formatINR(amount, { compact: true })}`, message: `into ${kind}`, tone: 'good' })
  }

  return (
    <div className="space-y-4">
      {/* headline cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Head label="Net Worth" value={nw} tone="violet" />
        <Head label="Cash" value={f.cash} tone="cyan" />
        <Head label="Monthly Flow" value={flow} tone={flow >= 0 ? 'green' : 'red'} sign />
        <Head label="Debt" value={f.debt} tone={f.debt > 0 ? 'red' : 'green'} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* allocation */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-200 text-sm mb-3">Portfolio Allocation</h3>
          {hasHoldings ? (
            <div className="flex items-center gap-4">
              <div className="w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={40} outerRadius={68} paddingAngle={2} stroke="none">
                      {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0b1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} formatter={(v: any) => formatINR(v, { compact: true })} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {ASSETS.map((a) => {
                  const val = a.kind === 'business' ? (f.business?.valuation ?? 0) : f.investments[a.kind].value
                  if (val <= 0) return null
                  return (
                    <div key={a.kind} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-300"><span className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} /> {a.icon} {a.label}</span>
                      <span className="font-mono text-gray-200">{formatINR(val, { compact: true })}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-8 text-center">No investments yet. Put idle cash to work below.</div>
          )}
        </div>

        {/* quick invest */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-200 text-sm mb-1">Invest Now</h3>
          <p className="text-xs text-gray-500 mb-3">Move cash into assets instantly. Higher risk = higher swings.</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK.map((q) => (
              <button key={q.label} onClick={() => invest(q.kind, q.amount)} disabled={f.cash < q.amount} className="btn-ghost justify-start text-sm">
                {q.label}
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500 grid grid-cols-2 gap-2">
            <div>💚 Savings ~4% · no risk</div>
            <div>📊 Index ~11% · steady</div>
            <div>📈 Stocks · bumpy</div>
            <div>🪙 Crypto · wild swings</div>
          </div>
        </div>
      </div>

      {/* business */}
      {f.business && (
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-lg">🚀 {f.business.name}</h3>
            <span className="chip bg-accent/15 text-violet-200">{f.business.monthsRunning} mo running</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <Mini label="Revenue/mo" value={formatINR(f.business.monthlyRevenue, { compact: true })} />
            <Mini label="Cost/mo" value={formatINR(f.business.monthlyCost, { compact: true })} />
            <Mini label="Profit/mo" value={formatINR(f.business.monthlyRevenue - f.business.monthlyCost, { compact: true, sign: true })} tone={f.business.monthlyRevenue - f.business.monthlyCost >= 0 ? 'green' : 'red'} />
            <Mini label="Valuation" value={formatINR(f.business.valuation, { compact: true })} tone="violet" />
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Traction</span><span>{Math.round(f.business.traction)}%</span></div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden"><div className="h-full bg-gradient-to-r from-pink-500 to-fuchsia-500" style={{ width: `${f.business.traction}%` }} /></div>
          </div>
        </div>
      )}
    </div>
  )
}

function Head({ label, value, tone, sign }: { label: string; value: number; tone: string; sign?: boolean }) {
  const color = tone === 'green' ? 'text-accent-green' : tone === 'red' ? 'text-accent-red' : tone === 'cyan' ? 'text-accent-cyan' : 'text-violet-300'
  return (
    <div className="card p-4">
      <div className="text-[10px] uppercase tracking-widest text-gray-500">{label}</div>
      <div className={`text-lg font-bold ${color} mt-0.5`}>
        <AnimatedNumber value={value} format={(n) => formatINR(n, { compact: true, sign })} />
      </div>
    </div>
  )
}
function Mini({ label, value, tone }: { label: string; value: string; tone?: string }) {
  const color = tone === 'green' ? 'text-accent-green' : tone === 'red' ? 'text-accent-red' : tone === 'violet' ? 'text-violet-300' : 'text-gray-200'
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
      <div className="text-[10px] uppercase tracking-widest text-gray-500">{label}</div>
      <div className={`font-bold ${color} mt-0.5`}>{value}</div>
    </div>
  )
}
