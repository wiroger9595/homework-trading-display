'use client'

import { useEffect, useState } from 'react'
import { SYMBOL_MAP } from '@/lib/symbols'

interface Stock {
  symbol: string
  change: number
  marketCap: number
  clickable: boolean
}

const STOCKS: Stock[] = [
  { symbol: 'AAPL',  change: 1.24,  marketCap: 8, clickable: true },
  { symbol: 'MSFT',  change: 0.85,  marketCap: 7, clickable: true },
  { symbol: 'NVDA',  change: 3.87,  marketCap: 7, clickable: true },
  { symbol: 'GOOGL', change: -0.42, marketCap: 6, clickable: true },
  { symbol: 'AMZN',  change: 1.53,  marketCap: 6, clickable: true },
  { symbol: 'META',  change: 2.14,  marketCap: 5, clickable: true },
  { symbol: 'TSLA',  change: -2.31, marketCap: 4, clickable: true },
  { symbol: 'AVGO',  change: 1.02,  marketCap: 4, clickable: false },
  { symbol: 'JPM',   change: 0.31,  marketCap: 3, clickable: false },
  { symbol: 'V',     change: -0.18, marketCap: 3, clickable: false },
  { symbol: 'LLY',   change: 1.75,  marketCap: 3, clickable: false },
  { symbol: 'UNH',   change: -0.67, marketCap: 3, clickable: false },
]

function getColor(change: number): string {
  const abs = Math.abs(change)
  if (change > 0) {
    if (abs > 3) return 'rgba(34,197,94,0.85)'
    if (abs > 1.5) return 'rgba(34,197,94,0.6)'
    return 'rgba(34,197,94,0.35)'
  } else {
    if (abs > 3) return 'rgba(239,68,68,0.85)'
    if (abs > 1.5) return 'rgba(239,68,68,0.6)'
    return 'rgba(239,68,68,0.35)'
  }
}

interface MarketHeatmapProps {
  selectedSymbol: string
  onSymbolChange: (symbol: string) => void
}

export default function MarketHeatmap({ selectedSymbol, onSymbolChange }: MarketHeatmapProps) {
  const [stocks, setStocks] = useState(STOCKS)

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prev) =>
        prev.map((s) => ({
          ...s,
          change: s.change + (Math.random() - 0.5) * 0.15,
        }))
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-xs font-mono font-semibold text-foreground uppercase tracking-widest">市場熱度圖</h3>
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ background: 'rgba(239,68,68,0.6)' }} />
            跌
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ background: 'rgba(34,197,94,0.6)' }} />
            漲
          </span>
        </div>
      </div>
      <div className="p-3 grid grid-cols-4 gap-1.5">
        {stocks.map((s) => {
          const isSelected = s.symbol === selectedSymbol
          const isInMap = !!SYMBOL_MAP[s.symbol]
          return (
            <div
              key={s.symbol}
              onClick={() => s.clickable && isInMap && onSymbolChange(s.symbol)}
              role={s.clickable && isInMap ? 'button' : undefined}
              aria-pressed={isSelected ? true : undefined}
              aria-label={`切換至 ${s.symbol}`}
              className={`rounded-lg flex flex-col items-center justify-center transition-all duration-500 ${
                s.clickable && isInMap ? 'cursor-pointer hover:opacity-90 hover:scale-[1.03]' : 'cursor-default'
              } ${isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-card scale-[1.04]' : ''}`}
              style={{
                background: getColor(s.change),
                aspectRatio: `${s.marketCap}/${s.marketCap - 1}`,
                minHeight: 52,
              }}
            >
              <span className="text-xs font-mono font-bold text-white drop-shadow-sm">{s.symbol}</span>
              <span className="text-[10px] font-mono font-semibold text-white/90 drop-shadow-sm">
                {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
              </span>
              {s.clickable && isInMap && (
                <span className="text-[8px] font-mono text-white/60 mt-0.5">點擊查看</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
