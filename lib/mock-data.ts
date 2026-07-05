import { SYMBOL_MAP } from './symbols'

export interface Signal {
  index: number
  type: 'buy' | 'sell'
  price: number
}

export interface Recommendation {
  symbol: string
  name: string
  action: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  reason: string
}

export interface CandleSeries {
  dates: string[]
  /** [open, close, low, high] per candle (ECharts candlestick order) */
  data: [number, number, number, number][]
  volumes: number[]
}

// FNV-1a hash → deterministic seed per symbol
function hashSeed(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// mulberry32 seeded PRNG
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Deterministic mock candlestick series for a symbol.
 * Same symbol always yields the same chart; amplitude scales with the
 * symbol's seed volatility, and the series is rescaled so the final
 * close matches the symbol's seed price.
 */
export function generateCandles(symbol: string, count = 60): CandleSeries {
  const ticker = symbol.includes(':') ? symbol.split(':')[1] : symbol
  const info = SYMBOL_MAP[ticker]
  const rand = mulberry32(hashSeed(ticker))

  const targetClose = info?.price ?? 60 + rand() * 400
  const amp = targetClose * ((info?.volatility ?? 26) / 100) / 16

  const data: [number, number, number, number][] = []
  const dates: string[] = []
  const volumes: number[] = []
  let base = targetClose

  const today = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - (count - 1 - i))
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`)

    const open = base + (rand() - 0.5) * amp
    const close = open + (rand() - 0.5) * amp * 1.8
    const high = Math.max(open, close) + rand() * amp * 0.7
    const low = Math.min(open, close) - rand() * amp * 0.7
    data.push([open, close, low, high])
    volumes.push(Math.floor(rand() * 50_000_000 + 10_000_000))
    base = close
  }

  // Rescale so the last close lands on the symbol's seed price
  const k = targetClose / data[data.length - 1][1]
  for (const c of data) {
    c[0] *= k
    c[1] *= k
    c[2] *= k
    c[3] *= k
  }

  return { dates, data, volumes }
}

/**
 * Derive buy/sell signals from actual candle data: buys at local lows,
 * sells at local highs, so markers sit exactly on real candles.
 */
export function deriveSignals(series: CandleSeries, action: 'BUY' | 'SELL' | 'HOLD'): Signal[] {
  const { data } = series
  const buys: Signal[] = []
  const sells: Signal[] = []
  const W = 3

  for (let i = W; i < data.length - 1; i++) {
    const low = data[i][2]
    const high = data[i][3]
    let isMin = true
    let isMax = true
    for (let j = Math.max(0, i - W); j <= Math.min(data.length - 1, i + W); j++) {
      if (j === i) continue
      if (data[j][2] < low) isMin = false
      if (data[j][3] > high) isMax = false
    }
    if (isMin) buys.push({ index: i, type: 'buy', price: low })
    else if (isMax) sells.push({ index: i, type: 'sell', price: high })
  }

  if (action === 'BUY') return buys.slice(-5)
  if (action === 'SELL') return sells.slice(-5)
  return [...buys.slice(-2), ...sells.slice(-2)].sort((a, b) => a.index - b.index)
}
