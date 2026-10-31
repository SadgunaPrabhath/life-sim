import type { GameState, InvestmentKind } from '@/types'

// Expected monthly drift & volatility per asset class (fictional, for fun).
const MARKET: Record<InvestmentKind, { drift: number; vol: number }> = {
  savings: { drift: 0.0035, vol: 0.0 }, // ~4.2% p.a., no risk
  index: { drift: 0.009, vol: 0.03 }, // ~11% p.a., moderate
  stocks: { drift: 0.012, vol: 0.07 }, // higher return, bumpy
  crypto: { drift: 0.02, vol: 0.22 }, // wild
  business: { drift: 0.0, vol: 0.0 }, // handled by business logic
}

export function netWorth(s: GameState): number {
  const inv = Object.values(s.finance.investments).reduce((a, i) => a + i.value, 0)
  const biz = s.finance.business ? s.finance.business.valuation : 0
  return Math.round(s.finance.cash + inv + biz - s.finance.debt)
}

export function totalInvested(s: GameState): number {
  return Object.values(s.finance.investments).reduce((a, i) => a + i.value, 0)
}

export function monthlyIncome(s: GameState): number {
  return s.career.salary + s.finance.monthlyIncomeExtra
}

// Living expenses scale with age, city and lifestyle (net worth flexes it a bit).
export function monthlyExpenses(s: GameState): number {
  const ageMonths = s.character.startAgeMonths + s.monthIndex
  const ageYears = ageMonths / 12
  const base = 9000 + Math.max(0, ageYears - 18) * 350
  const lifestyle = Math.min(60000, Math.max(0, netWorth(s)) * 0.004)
  const rent = s.flags['ownsHouse'] ? 0 : 8000
  const carCost = s.flags['ownsCar'] ? 4000 : 0
  return Math.round(base + lifestyle + rent + carCost)
}

// Simulate one month of market movement. Returns total delta across holdings.
export function simulateMarket(
  s: GameState,
  rng: () => number,
): { delta: number; byKind: Partial<Record<InvestmentKind, number>> } {
  let delta = 0
  const byKind: Partial<Record<InvestmentKind, number>> = {}
  ;(Object.keys(s.finance.investments) as InvestmentKind[]).forEach((kind) => {
    const h = s.finance.investments[kind]
    if (h.value <= 0) return
    const m = MARKET[kind]
    // Normal-ish noise via two uniform samples.
    const noise = (rng() + rng() - 1) * m.vol
    const change = h.value * (m.drift + noise)
    h.value = Math.max(0, Math.round(h.value + change))
    byKind[kind] = Math.round(change)
    delta += change
  })
  return { delta: Math.round(delta), byKind }
}

export function addInvestment(s: GameState, kind: InvestmentKind, amount: number): boolean {
  if (s.finance.cash < amount || amount <= 0) return false
  s.finance.cash -= amount
  const h = s.finance.investments[kind]
  h.value += amount
  h.invested += amount
  return true
}
