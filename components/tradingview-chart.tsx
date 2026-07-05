'use client'

import { useEffect, useRef } from 'react'
import { SYMBOL_MAP } from '@/lib/symbols'
import type { ChartRange } from '@/lib/mock-data'

interface TradingViewChartProps {
  symbol: string
  range: ChartRange
}

// Map our range ids to TradingView widget range + candle interval
const RANGE_MAP: Record<ChartRange, { range: string; interval: string }> = {
  '1D': { range: '1D', interval: '1' },
  '5D': { range: '5D', interval: '30' },
  '1M': { range: '1M', interval: '60' },
  '6M': { range: '6M', interval: 'D' },
  '1Y': { range: '12M', interval: 'D' },
  '5Y': { range: '60M', interval: 'W' },
}

export default function TradingViewChart({ symbol, range }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // If symbol already contains exchange prefix (e.g. "NYSE:TSM"), use it directly.
  // Otherwise look up SYMBOL_MAP, then fall back to NASDAQ prefix.
  const tvSymbol = symbol.includes(':')
    ? symbol
    : (SYMBOL_MAP[symbol]?.tvSymbol ?? `NASDAQ:${symbol}`)
  const { range: tvRange, interval } = RANGE_MAP[range] ?? RANGE_MAP['6M']

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear previous widget
    container.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: interval,
      range: tvRange,
      withdateranges: true,
      timezone: 'Asia/Taipei',
      theme: 'dark',
      style: '1',           // Candlestick
      locale: 'zh_TW',
      backgroundColor: 'rgba(10, 11, 15, 0)',
      gridColor: 'rgba(255, 255, 255, 0.04)',
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      studies: [
        'STD;MACD',
        'STD;Volume',
      ],
    })

    const wrapper = document.createElement('div')
    wrapper.className = 'tradingview-widget-container__widget'
    wrapper.style.height = '100%'
    wrapper.style.width = '100%'

    container.appendChild(wrapper)
    container.appendChild(script)

    return () => {
      if (container) container.innerHTML = ''
    }
  }, [tvSymbol, interval, tvRange])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full h-full"
      style={{ minHeight: 360 }}
    />
  )
}
