'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, BarChart2, DollarSign, Activity, Layers, RefreshCw, AlertCircle } from 'lucide-react'
import { fallbackQuote, type QuoteData } from '@/lib/quote'

interface StatCardsProps {
  symbol: string
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return (vol / 1_000_000_000).toFixed(2) + 'B'
  if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(2) + 'M'
  if (vol >= 1_000) return (vol / 1_000).toFixed(1) + 'K'
  return vol.toLocaleString()
}

function formatMarketCap(cap: number | null): string {
  if (!cap) return '—'
  if (cap >= 1_000_000_000_000) return '$' + (cap / 1_000_000_000_000).toFixed(2) + 'T'
  if (cap >= 1_000_000_000) return '$' + (cap / 1_000_000_000).toFixed(2) + 'B'
  if (cap >= 1_000_000) return '$' + (cap / 1_000_000).toFixed(2) + 'M'
  return '$' + cap.toLocaleString()
}

interface StatItem {
  label: string
  value: string
  change: number
  icon: React.ElementType
  subtitle?: string
}

function StatCard({ stat }: { stat: StatItem }) {
  const isUp = stat.change >= 0
  const Icon = stat.icon
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-primary/30 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{stat.label}</span>
        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center group-hover:bg-neon-dim transition-colors">
          <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-mono font-bold text-foreground tracking-tight">
          {stat.value}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 text-xs font-mono ${isUp ? 'text-[color:var(--bull)]' : 'text-[color:var(--bear)]'}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>
            {isUp ? '+' : ''}
            {stat.change.toFixed(2)}%
          </span>
          <span className="text-muted-foreground ml-1">vs 前收</span>
        </div>
        {stat.subtitle && (
          <span className="text-[10px] font-mono text-muted-foreground">{stat.subtitle}</span>
        )}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 bg-muted rounded w-20" />
        <div className="w-7 h-7 rounded-lg bg-muted" />
      </div>
      <div className="h-7 bg-muted rounded w-32" />
      <div className="h-3 bg-muted rounded w-24" />
    </div>
  )
}

export default function StatCards({ symbol }: StatCardsProps) {
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    setQuote(null)

    fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: QuoteData) => { if (!cancelled) { setQuote(data); setLoading(false) } })
      .catch(() => {
        if (cancelled) return
        // Static deploy (e.g. GitHub Pages) has no API routes — fall back to seed data
        const fb = fallbackQuote(symbol)
        if (fb) setQuote(fb)
        else setError(true)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [symbol])

  // Live price tick every 15s (same as route cache)
  useEffect(() => {
    const id = setInterval(() => {
      fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setQuote(data) })
        .catch(() => {})
    }, 15_000)
    return () => clearInterval(id)
  }, [symbol])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="col-span-2 lg:col-span-4 flex items-center gap-2 bg-card border border-border rounded-xl p-4 text-sm font-mono text-muted-foreground">
          <AlertCircle className="w-4 h-4 text-[color:var(--bear)]" />
          <span>無法取得 {symbol} 報價，請確認代碼是否正確</span>
        </div>
      </div>
    )
  }

  const stats: StatItem[] = [
    {
      label: `${quote.symbol} 現價`,
      value: `$${quote.price.toFixed(2)}`,
      change: quote.changePercent,
      icon: DollarSign,
      subtitle: quote.currency,
    },
    {
      label: '今日區間',
      value: `$${quote.low.toFixed(2)} – $${quote.high.toFixed(2)}`,
      change: quote.changePercent,
      icon: Activity,
      subtitle: quote.exchange,
    },
    {
      label: '成交量',
      value: formatVolume(quote.volume),
      change: quote.changePercent,
      icon: BarChart2,
      subtitle: '股',
    },
    {
      label: '市值',
      value: formatMarketCap(quote.marketCap),
      change: quote.changePercent,
      icon: Layers,
      subtitle: quote.name.length > 20 ? quote.name.slice(0, 20) + '…' : quote.name,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  )
}
