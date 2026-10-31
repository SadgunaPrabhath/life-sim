// Small seeded PRNG (mulberry32) so runs are reproducible and save/load stable.
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

export function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

export function chance(rng: () => number, pct: number): boolean {
  return rng() * 100 < pct
}

export function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v))
}

// Weighted pick: items with a numeric weight field.
export function weightedPick<T extends { weight: number }>(
  rng: () => number,
  items: T[],
): T | null {
  const total = items.reduce((a, i) => a + Math.max(0, i.weight), 0)
  if (total <= 0) return null
  let r = rng() * total
  for (const it of items) {
    r -= Math.max(0, it.weight)
    if (r <= 0) return it
  }
  return items[items.length - 1]
}
