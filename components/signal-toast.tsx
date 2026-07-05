'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, X, Zap } from 'lucide-react'

interface Signal {
  index: number
  type: 'buy' | 'sell'
  price: number
}

interface SignalToastProps {
  signals: Signal[]
  isActive: boolean
  symbol: string
}

export default function SignalToast({ signals, isActive, symbol }: SignalToastProps) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (isActive && signals.length > 0) {
      setDismissed(false)
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 8000)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [isActive, signals])

  if (!visible || dismissed) return null

  const buyCount = signals.filter((s) => s.type === 'buy').length
  const sellCount = signals.filter((s) => s.type === 'sell').length
  const dominant = buyCount >= sellCount ? 'buy' : 'sell'

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in-0 duration-400">
      <div className={`rounded-xl border shadow-2xl p-4 max-w-xs backdrop-blur-md ${
        dominant === 'buy'
          ? 'bg-[color:var(--bull)]/10 border-[color:var(--bull)]/40'
          : 'bg-[color:var(--bear)]/10 border-[color:var(--bear)]/40'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            dominant === 'buy' ? 'bg-[color:var(--bull)]/20' : 'bg-[color:var(--bear)]/20'
          }`}>
            <Zap className={`w-4 h-4 ${dominant === 'buy' ? 'text-[color:var(--bull)]' : 'text-[color:var(--bear)]'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-foreground">AI 訊號已生成</span>
              <span className="text-[10px] font-mono text-muted-foreground">{symbol}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                dominant === 'buy' ? 'bg-[color:var(--bull)]/20 text-[color:var(--bull)]' : 'bg-[color:var(--bear)]/20 text-[color:var(--bear)]'
              }`}>
                {dominant === 'buy' ? '做多' : '做空'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {buyCount > 0 && (
                <span className="flex items-center gap-1 text-[color:var(--bull)]">
                  <TrendingUp className="w-3 h-3" />
                  買進 {buyCount} 點
                </span>
              )}
              {sellCount > 0 && (
                <span className="flex items-center gap-1 text-[color:var(--bear)]">
                  <TrendingDown className="w-3 h-3" />
                  賣出 {sellCount} 點
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">訊號已標記於 K 線圖上</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
