'use client'

import { useEffect, useState } from 'react'
import { TICKER_PRICES, SYMBOL_MAP } from '@/lib/symbols'

interface TickerItem {
  symbol: string
  price: number
  change: number
}

const INITIAL_TICKERS: TickerItem[] = Object.entries(TICKER_PRICES).map(([symbol, data]) => ({
  symbol,
  price: data.price,
  change: data.change,
}))

interface MarketTickerProps {
  selectedSymbol: string
  onSymbolChange: (symbol: string) => void
}

export default function MarketTicker({ selectedSymbol, onSymbolChange }: MarketTickerProps) {
  const [tickers, setTickers] = useState(INITIAL_TICKERS)

  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) =>
        prev.map((t) => ({
          ...t,
          price: t.price * (1 + (Math.random() - 0.5) * 0.002),
          change: t.change + (Math.random() - 0.5) * 0.05,
        }))
      )
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const doubled = [...tickers, ...tickers]

  return (
    <div className="border-b border-border bg-card/50 overflow-hidden h-9 flex items-center">
      <div className="flex-shrink-0 px-3 border-r border-border text-xs font-mono text-primary font-semibold tracking-widest uppercase h-full flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-neon inline-block" />
        LIVE
      </div>
      <div className="overflow-hidden flex-1 relative">
        <div className="flex whitespace-nowrap ticker-animation">
          {doubled.map((ticker, i) => {
            const isClickable = !!SYMBOL_MAP[ticker.symbol]
            const isSelected = ticker.symbol === selectedSymbol
            return (
              <div
                key={i}
                onClick={() => isClickable && onSymbolChange(ticker.symbol)}
                role={isClickable ? 'button' : undefined}
                aria-label={isClickable ? `切換至 ${ticker.symbol}` : undefined}
                className={`flex items-center gap-2 px-5 border-r border-border/30 h-9 transition-colors ${
                  isClickable ? 'cursor-pointer hover:bg-neon-dim' : ''
                } ${isSelected ? 'bg-neon-dim' : ''}`}
              >
                <span className={`font-mono text-xs font-semibold ${isSelected ? 'text-primary' : 'text-foreground/80'}`}>
                  {ticker.symbol}
                </span>
                <span className="font-mono text-xs font-semibold">
                  ${ticker.price.toFixed(ticker.price > 1000 ? 0 : 2)}
                </span>
                <span
                  className={`font-mono text-xs font-medium ${
                    ticker.change >= 0 ? 'text-[color:var(--bull)]' : 'text-[color:var(--bear)]'
                  }`}
                >
                  {ticker.change >= 0 ? '+' : ''}
                  {ticker.change.toFixed(2)}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
