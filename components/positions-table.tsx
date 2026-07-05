'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import type { Recommendation } from '@/lib/mock-data'

interface Position {
  symbol: string
  qty: number
  avgCost: number
  currentPrice: number
  sector: string
}

const POSITIONS: Position[] = [
  { symbol: 'AAPL', qty: 150, avgCost: 175.2,  currentPrice: 189.32, sector: '科技' },
  { symbol: 'NVDA', qty: 60,  avgCost: 820.5,  currentPrice: 876.54, sector: '半導體' },
  { symbol: 'MSFT', qty: 80,  avgCost: 395.0,  currentPrice: 419.72, sector: '軟體' },
  { symbol: 'TSLA', qty: 120, avgCost: 260.0,  currentPrice: 248.15, sector: '電動車' },
  { symbol: 'META', qty: 40,  avgCost: 490.0,  currentPrice: 525.87, sector: '社群媒體' },
]

interface PositionsTableProps {
  selectedSymbol: string
  onSymbolChange: (symbol: string) => void
  recommendations?: Recommendation[]
}

const ACTION_STYLES: Record<Recommendation['action'], { label: string; className: string }> = {
  BUY: { label: '買進', className: 'bg-[color:var(--bull)]/15 text-[color:var(--bull)] border-[color:var(--bull)]/30' },
  SELL: { label: '賣出', className: 'bg-[color:var(--bear)]/15 text-[color:var(--bear)] border-[color:var(--bear)]/30' },
  HOLD: { label: '觀望', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
}

export default function PositionsTable({ selectedSymbol, onSymbolChange, recommendations = [] }: PositionsTableProps) {
  const [positions, setPositions] = useState(POSITIONS)
  const showAI = recommendations.length > 0

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((p) => ({
          ...p,
          currentPrice: p.currentPrice * (1 + (Math.random() - 0.5) * 0.003),
        }))
      )
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        {showAI ? (
          <h3 className="flex items-center gap-1.5 text-xs font-mono font-semibold text-primary uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            AI 推薦標的
          </h3>
        ) : (
          <h3 className="text-xs font-mono font-semibold text-foreground uppercase tracking-widest">持倉明細</h3>
        )}
        <span className="text-[10px] font-mono text-muted-foreground">
          {showAI ? `${recommendations.length} 檔標的` : `${positions.length} 筆持倉`}
        </span>
      </div>
      {showAI ? (
        <div className="overflow-x-auto animate-in fade-in-0 slide-in-from-bottom-1 duration-400">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-2 text-muted-foreground font-normal tracking-wider">代號</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-normal tracking-wider">動作</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-normal tracking-wider">信心度</th>
                <th className="text-left px-4 py-2 text-muted-foreground font-normal tracking-wider hidden sm:table-cell">分析依據</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((r) => {
                const action = ACTION_STYLES[r.action]
                const isSelected = r.symbol === selectedSymbol
                return (
                  <tr
                    key={r.symbol}
                    onClick={() => onSymbolChange(r.symbol)}
                    role="button"
                    aria-pressed={isSelected ? true : undefined}
                    aria-label={`切換至 ${r.symbol}`}
                    className={`border-b border-border/30 transition-colors cursor-pointer ${
                      isSelected ? 'bg-neon-dim border-l-2 border-l-primary' : 'hover:bg-muted/20'
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <div className={`font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{r.symbol}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">{r.name}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-bold ${action.className}`}>
                        {action.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${r.confidence}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-foreground/80">{r.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{r.reason}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left px-4 py-2 text-muted-foreground font-normal tracking-wider">代號</th>
              <th className="text-right px-3 py-2 text-muted-foreground font-normal tracking-wider">數量</th>
              <th className="text-right px-3 py-2 text-muted-foreground font-normal tracking-wider hidden sm:table-cell">均價</th>
              <th className="text-right px-3 py-2 text-muted-foreground font-normal tracking-wider">現價</th>
              <th className="text-right px-4 py-2 text-muted-foreground font-normal tracking-wider">損益</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => {
              const pnl = (p.currentPrice - p.avgCost) * p.qty
              const pnlPct = ((p.currentPrice - p.avgCost) / p.avgCost) * 100
              const isUp = pnl >= 0
              const isSelected = p.symbol === selectedSymbol
              return (
                <tr
                  key={p.symbol}
                  onClick={() => onSymbolChange(p.symbol)}
                  role="button"
                  aria-pressed={isSelected ? true : undefined}
                  aria-label={`切換至 ${p.symbol}`}
                  className={`border-b border-border/30 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-neon-dim border-l-2 border-l-primary'
                      : 'hover:bg-muted/20'
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <div className={`font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {p.symbol}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{p.sector}</div>
                  </td>
                  <td className="text-right px-3 py-2.5 text-foreground/80">{p.qty}</td>
                  <td className="text-right px-3 py-2.5 text-muted-foreground hidden sm:table-cell">
                    ${p.avgCost.toFixed(2)}
                  </td>
                  <td className="text-right px-3 py-2.5 text-foreground font-semibold">
                    ${p.currentPrice.toFixed(2)}
                  </td>
                  <td className="text-right px-4 py-2.5">
                    <div className={`flex items-center justify-end gap-1 ${isUp ? 'text-[color:var(--bull)]' : 'text-[color:var(--bear)]'}`}>
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <div>
                        <div className="font-semibold">{isUp ? '+' : ''}${Math.abs(pnl).toFixed(0)}</div>
                        <div className="text-[10px]">{isUp ? '+' : ''}{pnlPct.toFixed(2)}%</div>
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
