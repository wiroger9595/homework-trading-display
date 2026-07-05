'use client'

import { useEffect, useRef } from 'react'
import { SYMBOL_MAP } from '@/lib/symbols'

interface TradingViewChartProps {
  symbol: string
  timeframe: string
}

// Map our timeframe labels to TradingView interval values
const TF_MAP: Record<string, string> = {
  '1m':  '1',
  '5m':  '5',
  '15m': '15',
  '1H':  '60',
  '4H':  '240',
  '1D':  'D',
  '1W':  'W',
}

export default function TradingViewChart({ symbol, timeframe }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // If symbol already contains exchange prefix (e.g. "NYSE:TSM"), use it directly.
  // Otherwise look up SYMBOL_MAP, then fall back to NASDAQ prefix.
  const tvSymbol = symbol.includes(':')
    ? symbol
    : (SYMBOL_MAP[symbol]?.tvSymbol ?? `NASDAQ:${symbol}`)
  const interval = TF_MAP[timeframe] ?? 'D'

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
  }, [tvSymbol, interval])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full h-full"
      style={{ minHeight: 360 }}
    />
  )
}
