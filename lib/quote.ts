import { SYMBOL_MAP } from './symbols'

export interface QuoteData {
  symbol: string
  name: string
  price: number
  prevClose: number
  changePercent: number
  high: number
  low: number
  volume: number
  marketCap: number | null
  currency: string
  exchange: string
}

// Parse abbreviated figures like "58.2M" / "2.94T" back to numbers
function parseAbbrev(s: string): number {
  const m = /^([\d.]+)\s*([KMBT])?$/i.exec(s.trim())
  if (!m) return 0
  const mult = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 }[(m[2] ?? '').toUpperCase() as 'K' | 'M' | 'B' | 'T'] ?? 1
  return parseFloat(m[1]) * mult
}

/**
 * Offline/static-site fallback: build a quote from the local seed data
 * when the /api/quote route is unavailable (e.g. GitHub Pages static export).
 */
export function fallbackQuote(symbol: string): QuoteData | null {
  const ticker = symbol.includes(':') ? symbol.split(':')[1] : symbol
  const info = SYMBOL_MAP[ticker]
  if (!info) return null
  const prevClose = info.price / (1 + info.change / 100)
  const cap = parseAbbrev(info.marketCap)
  return {
    symbol: ticker,
    name: info.name,
    price: info.price,
    prevClose,
    changePercent: info.change,
    high: info.price * 1.012,
    low: info.price * 0.988,
    volume: parseAbbrev(info.volume),
    marketCap: cap > 0 ? cap : null,
    currency: 'USD',
    exchange: '模擬數據',
  }
}
