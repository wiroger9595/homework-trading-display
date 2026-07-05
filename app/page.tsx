'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/navbar'
import MarketTicker from '@/components/market-ticker'
import StatCards from '@/components/stat-cards'
import AIStrategyPanel from '@/components/ai-strategy-panel'
import PositionsTable from '@/components/positions-table'
import MarketHeatmap from '@/components/market-heatmap'
import SignalToast from '@/components/signal-toast'
import CandlestickChart from '@/components/candlestick-chart'
import { Clock, BarChart3, List, Map, Radio, Sparkles } from 'lucide-react'
import { RANGE_CONFIG, type ChartRange, type Signal, type Recommendation } from '@/lib/mock-data'

const TradingViewChart = dynamic(() => import('@/components/tradingview-chart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 360 }}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1 items-end">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-primary/40 rounded-full animate-pulse"
              style={{ height: 16 + i * 7, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <span className="text-xs font-mono text-muted-foreground tracking-widest">載入圖表中...</span>
      </div>
    </div>
  ),
})

type TabId = 'chart' | 'positions' | 'heatmap'
type ChartMode = 'live' | 'ai'

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'chart', label: 'K 線圖', icon: BarChart3 },
  { id: 'positions', label: '持倉明細', icon: List },
  { id: 'heatmap', label: '熱度圖', icon: Map },
]

// Time ranges from 5 years down to 1-minute candles
const RANGES: { id: ChartRange; label: string }[] = [
  { id: '1D', label: '1日' },
  { id: '5D', label: '5日' },
  { id: '1M', label: '1月' },
  { id: '6M', label: '6月' },
  { id: '1Y', label: '1年' },
  { id: '5Y', label: '5年' },
]

// Map refresh label to milliseconds (0 = manual / TradingView handles live)
const REFRESH_MS: Record<string, number> = {
  '即時': 0,
  '5 秒': 5000,
  '15 秒': 15000,
  '30 秒': 30000,
  '1 分鐘': 60000,
}

export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
  const [signals, setSignals] = useState<Signal[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [aiActive, setAiActive] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('chart')
  const [chartMode, setChartMode] = useState<ChartMode>('live')
  const [range, setRange] = useState<ChartRange>('6M')
  const [refreshRate, setRefreshRate] = useState('即時')
  // chartKey increments every refresh cycle to force TradingViewChart remount
  const [chartKey, setChartKey] = useState(0)

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol)
    setSignals([])
    setRecommendations([])
    setAiActive(false)
    setChartMode('live')
  }

  // New signals from the AI panel: mark them on the simulated chart without any page reload.
  // Only auto-switch to the AI chart on a fresh analysis (empty → signals), not on
  // range-change re-derives, so the user can freely compare with the live chart.
  const handleSignalsGenerated = (sigs: Signal[]) => {
    if (sigs.length > 0 && signals.length === 0) {
      setActiveTab('chart')
      setChartMode('ai')
    } else if (sigs.length === 0) {
      setChartMode('live')
    }
    setSignals(sigs)
  }

  // Auto-refresh: only active when refreshRate is not '即時'
  useEffect(() => {
    const ms = REFRESH_MS[refreshRate]
    if (!ms) return
    const id = setInterval(() => {
      setChartKey(k => k + 1)
    }, ms)
    return () => clearInterval(id)
  }, [refreshRate])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        selectedSymbol={selectedSymbol}
        onSymbolChange={handleSymbolChange}
        refreshRate={refreshRate}
        onRefreshRateChange={setRefreshRate}
      />
      <MarketTicker selectedSymbol={selectedSymbol} onSymbolChange={handleSymbolChange} />

      <main className="flex-1 p-3 md:p-4 flex flex-col gap-4 max-w-[1800px] mx-auto w-full">
        {/* Stat cards row */}
        <StatCards symbol={selectedSymbol} />

        {/* Main grid */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          {/* Left: chart area */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <div
              className="bg-card border border-border rounded-xl flex flex-col overflow-hidden"
              style={{ minHeight: 440 }}
            >
              {/* Chart header */}
              <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border">
                {/* Tab switcher */}
                <div className="flex items-center gap-0.5">
                  {TABS.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-150 ${
                          activeTab === tab.id
                            ? 'bg-neon-dim text-primary border border-primary/30'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {/* Chart source toggle: live TradingView vs simulated AI-signal chart */}
                {activeTab === 'chart' && (
                  <div className="flex items-center gap-0.5 border border-border rounded-lg p-0.5">
                    <button
                      onClick={() => setChartMode('live')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all duration-150 ${
                        chartMode === 'live'
                          ? 'bg-neon-dim text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Radio className="w-3 h-3" />
                      即時行情
                    </button>
                    <button
                      onClick={() => setChartMode('ai')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all duration-150 ${
                        chartMode === 'ai'
                          ? 'bg-neon-dim text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      AI 訊號圖
                    </button>
                  </div>
                )}

                {/* Time range selector (both chart modes) */}
                {activeTab === 'chart' && (
                  <div className="flex items-center gap-0.5">
                    {RANGES.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setRange(r.id)}
                        title={`${r.label}（${RANGE_CONFIG[r.id].candleLabel}）`}
                        className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all duration-150 ${
                          range === r.id
                            ? 'bg-neon-dim text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
                {activeTab === 'chart' && chartMode === 'ai' && (
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                    模擬數據 · {RANGE_CONFIG[range].count} 根{RANGE_CONFIG[range].candleLabel}
                    {aiActive && signals.length > 0 ? ` · ${signals.length} 個訊號` : ''}
                  </span>
                )}

                {/* Symbol badge + refresh badge */}
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-primary bg-neon-dim px-2 py-0.5 rounded border border-primary/30">
                    {selectedSymbol}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{refreshRate === '即時' ? '即時更新' : `每 ${refreshRate} 刷新`}</span>
                  </div>
                </div>
              </div>

              {/* Chart body */}
              <div className="flex-1 p-2 md:p-3" style={{ minHeight: 360 }}>
                {activeTab === 'chart' && chartMode === 'live' && (
                  <TradingViewChart
                    key={`${selectedSymbol}-${range}-${chartKey}`}
                    symbol={selectedSymbol}
                    range={range}
                  />
                )}
                {activeTab === 'chart' && chartMode === 'ai' && (
                  <CandlestickChart symbol={selectedSymbol} range={range} signals={signals} aiActive={aiActive} />
                )}
                {activeTab === 'positions' && (
                  <div className="h-full overflow-y-auto">
                    <PositionsTable selectedSymbol={selectedSymbol} onSymbolChange={handleSymbolChange} recommendations={recommendations} />
                  </div>
                )}
                {activeTab === 'heatmap' && (
                  <div className="h-full overflow-y-auto">
                    <MarketHeatmap selectedSymbol={selectedSymbol} onSymbolChange={handleSymbolChange} />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom detail row (visible on large screens) */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              <PositionsTable selectedSymbol={selectedSymbol} onSymbolChange={handleSymbolChange} recommendations={recommendations} />
              <MarketHeatmap selectedSymbol={selectedSymbol} onSymbolChange={handleSymbolChange} />
            </div>
          </div>

          {/* Right: AI Strategy Panel */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <div
              className="bg-card border border-border rounded-xl p-4 h-full flex flex-col"
              style={{ minHeight: 440 }}
            >
              <AIStrategyPanel
                symbol={selectedSymbol}
                range={range}
                onSignalsGenerated={handleSignalsGenerated}
                onRecommendations={setRecommendations}
                onActiveChange={setAiActive}
                isActive={aiActive}
              />
            </div>
          </div>
        </div>

        {/* Mobile: show panels below chart */}
        <div className="lg:hidden flex flex-col gap-3">
          <PositionsTable selectedSymbol={selectedSymbol} onSymbolChange={handleSymbolChange} recommendations={recommendations} />
          <MarketHeatmap selectedSymbol={selectedSymbol} onSymbolChange={handleSymbolChange} />
        </div>
      </main>

      {/* Floating signal notification */}
      <SignalToast signals={signals} isActive={aiActive} symbol={selectedSymbol} />
    </div>
  )
}
