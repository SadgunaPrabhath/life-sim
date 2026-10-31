// Indian-style currency + number formatting.
export function formatINR(n: number, opts: { compact?: boolean; sign?: boolean } = {}): string {
  const neg = n < 0
  const abs = Math.abs(Math.round(n))
  let out: string
  if (opts.compact) {
    if (abs >= 10000000) out = `₹${(abs / 10000000).toFixed(2)} Cr`
    else if (abs >= 100000) out = `₹${(abs / 100000).toFixed(2)} L`
    else if (abs >= 1000) out = `₹${(abs / 1000).toFixed(1)}k`
    else out = `₹${abs}`
  } else {
    out = `₹${abs.toLocaleString('en-IN')}`
  }
  if (opts.sign) return `${neg ? '-' : '+'}${out}`
  return neg ? `-${out}` : out
}

export function formatMonthYear(monthIndex: number, baseYear = 2026, baseMonth = 0): string {
  const total = baseMonth + monthIndex
  const year = baseYear + Math.floor(total / 12)
  const month = ((total % 12) + 12) % 12
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return `${names[month]} ${year}`
}

export function yearForMonth(monthIndex: number, baseYear = 2026): number {
  return baseYear + Math.floor(monthIndex / 12)
}

export function formatAge(ageMonths: number): string {
  const y = Math.floor(ageMonths / 12)
  const m = ageMonths % 12
  return `${y} years, ${m} month${m === 1 ? '' : 's'}`
}

export const GAME_BASE_YEAR = 2026
