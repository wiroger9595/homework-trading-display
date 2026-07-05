'use client'

import { useEffect, useState } from 'react'
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Zap, Activity, Target } from 'lucide-react'
import { generateCandles, deriveSignals, type ChartRange, type Signal, type Recommendation } from '@/lib/mock-data'
import { SYMBOL_MAP } from '@/lib/symbols'

interface AIStrategyPanelProps {
  symbol: string
  range: ChartRange
  onSignalsGenerated: (signals: Signal[]) => void
  onRecommendations: (recs: Recommendation[]) => void
  onActiveChange: (active: boolean) => void
  isActive: boolean
}

const STRATEGIES = [
  { id: 'macd', name: 'MACD 交叉', desc: '移動平均收斂散度策略' },
  { id: 'rsi', name: 'RSI 超買超賣', desc: '相對強弱指數策略' },
  { id: 'bb', name: '布林帶突破', desc: '波動帶突破進場策略' },
  { id: 'ai', name: 'AI 深度學習', desc: 'Transformer 模型預測' },
]

const SIGNAL_MESSAGES: Record<string, { rating: string; confidence: number; action: string; color: string; rationale: string[] }> = {
  macd: {
    rating: '強力買進',
    confidence: 82,
    action: 'BUY',
    color: 'bull',
    rationale: ['MACD 金叉確認 (+0.42)', '成交量放大 +23%', '短線動能向上突破', 'RSI 58 — 未進入超買區'],
  },
  rsi: {
    rating: '中性觀望',
    confidence: 61,
    action: 'HOLD',
    color: 'neutral',
    rationale: ['RSI 44 — 中性區間', '布林帶中軌壓制', '需等待明確突破訊號', '建議設定追蹤止損'],
  },
  bb: {
    rating: '賣出警示',
    confidence: 74,
    action: 'SELL',
    color: 'bear',
    rationale: ['價格觸及布林上軌', '成交量萎縮 -12%', 'KD 高檔鈍化', '建議降低持倉比例'],
  },
  ai: {
    rating: '強力買進',
    confidence: 91,
    action: 'BUY',
    color: 'bull',
    rationale: ['Transformer 預測上漲 +4.2%', '情緒分析指數 +0.72', '法人資金持續流入', '技術面多空共振確認'],
  },
}

// Per-strategy mock stock picks; the positions table swaps to these when analysis completes
const rec = (symbol: string, action: Recommendation['action'], confidence: number, reason: string): Recommendation => ({
  symbol,
  name: SYMBOL_MAP[symbol]?.name ?? symbol,
  action,
  confidence,
  reason,
})

const STRATEGY_RECOMMENDATIONS: Record<string, Recommendation[]> = {
  macd: [
    rec('NVDA', 'BUY', 88, 'MACD 金叉 + 量能放大'),
    rec('AAPL', 'BUY', 82, '柱狀圖翻正、動能轉強'),
    rec('AMZN', 'BUY', 76, '零軸上方二次金叉'),
    rec('MSFT', 'HOLD', 68, '訊號線糾結、待突破'),
  ],
  rsi: [
    rec('GOOGL', 'HOLD', 64, 'RSI 44 回落中性區'),
    rec('META', 'HOLD', 61, 'RSI 背離未確認'),
    rec('AAPL', 'BUY', 58, 'RSI 自超賣區回升'),
    rec('TSLA', 'SELL', 55, 'RSI 高檔鈍化'),
  ],
  bb: [
    rec('TSLA', 'SELL', 79, '觸及上軌 + 量能萎縮'),
    rec('META', 'SELL', 72, '帶寬收斂、上緣壓力'),
    rec('GOOGL', 'HOLD', 66, '中軌附近整理'),
    rec('SPX', 'SELL', 63, '指數乖離率偏高'),
  ],
  ai: [
    rec('NVDA', 'BUY', 93, '模型預測 5 日 +4.2%'),
    rec('MSFT', 'BUY', 87, '情緒面 + 資金流雙多'),
    rec('AMZN', 'BUY', 84, '財報動能因子領先'),
    rec('META', 'BUY', 80, '多空共振確認'),
  ],
}

export default function AIStrategyPanel({ symbol, range, onSignalsGenerated, onRecommendations, onActiveChange, isActive }: AIStrategyPanelProps) {
  const [selectedStrategy, setSelectedStrategy] = useState('ai')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<(typeof SIGNAL_MESSAGES)[string] | null>(null)
  const [progress, setProgress] = useState(0)

  // Re-derive signal positions when the chart range changes while signals are shown
  useEffect(() => {
    if (!result || loading) return
    onSignalsGenerated(deriveSignals(generateCandles(symbol, range), result.action as 'BUY' | 'SELL' | 'HOLD'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

  const handleAnalyze = async () => {
    if (loading) return
    setLoading(true)
    setResult(null)
    setProgress(0)
    onActiveChange(false)

    // Simulate AI analysis progress
    const steps = [15, 35, 55, 72, 88, 100]
    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 250))
      setProgress(step)
    }

    await new Promise((r) => setTimeout(r, 300))
    const res = SIGNAL_MESSAGES[selectedStrategy]
    setResult(res)
    // Derive signals from the same seeded candle series the chart renders,
    // so markers land exactly on real candles
    const signals = deriveSignals(generateCandles(symbol, range), res.action as 'BUY' | 'SELL' | 'HOLD')
    onSignalsGenerated(signals)
    onRecommendations(STRATEGY_RECOMMENDATIONS[selectedStrategy] ?? [])
    onActiveChange(true)
    setLoading(false)
    setProgress(0)
  }

  const handleClear = () => {
    setResult(null)
    onSignalsGenerated([])
    onRecommendations([])
    onActiveChange(false)
  }

  const ratingColor =
    result?.action === 'BUY'
      ? 'text-[color:var(--bull)]'
      : result?.action === 'SELL'
      ? 'text-[color:var(--bear)]'
      : 'text-yellow-400'

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold tracking-wide text-foreground">AI 策略指標</span>
        <span className="text-[10px] font-mono text-primary bg-neon-dim px-2 py-0.5 rounded border border-primary/30">
          {symbol}
        </span>
        {isActive && (
          <span className="ml-auto text-[10px] font-mono text-primary bg-neon-dim px-2 py-0.5 rounded-full border border-primary/30">
            ACTIVE
          </span>
        )}
      </div>

      {/* Strategy selector */}
      <div className="grid grid-cols-2 gap-1.5">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSelectedStrategy(s.id); setResult(null); onActiveChange(false); onSignalsGenerated([]); onRecommendations([]) }}
            className={`text-left p-2 rounded-lg border text-xs transition-all duration-200 ${
              selectedStrategy === s.id
                ? 'border-primary/50 bg-neon-dim text-primary'
                : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:text-foreground'
            }`}
          >
            <div className="font-semibold truncate">{s.name}</div>
            <div className="text-[10px] opacity-70 truncate mt-0.5">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className={`relative flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 overflow-hidden ${
          loading
            ? 'bg-primary/20 text-primary cursor-wait border border-primary/30'
            : 'bg-primary text-primary-foreground hover:opacity-90 neon-glow active:scale-95'
        }`}
      >
        {loading && (
          <div
            className="absolute inset-0 bg-primary/30 origin-left transition-all duration-300"
            style={{ transform: `scaleX(${progress / 100})` }}
          />
        )}
        <span className="relative flex items-center gap-2">
          {loading ? (
            <>
              <Activity className="w-4 h-4 animate-pulse" />
              分析中... {progress}%
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              執行 AI 策略分析
            </>
          )}
        </span>
      </button>

      {/* Result */}
      {result && !loading && (
        <div className="flex-1 flex flex-col gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-400">
          {/* Signal badge */}
          <div className={`rounded-lg border p-3 ${
            result.action === 'BUY'
              ? 'border-[color:var(--bull)]/30 bg-[color:var(--bull)]/10'
              : result.action === 'SELL'
              ? 'border-[color:var(--bear)]/30 bg-[color:var(--bear)]/10'
              : 'border-yellow-500/30 bg-yellow-500/10'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {result.action === 'BUY' ? (
                <TrendingUp className="w-4 h-4 text-[color:var(--bull)]" />
              ) : result.action === 'SELL' ? (
                <TrendingDown className="w-4 h-4 text-[color:var(--bear)]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              )}
              <span className={`font-bold text-sm ${ratingColor}`}>{result.rating}</span>
            </div>
            {/* Confidence bar */}
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-mono">信心度</span>
              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    result.action === 'BUY' ? 'bg-[color:var(--bull)]' : result.action === 'SELL' ? 'bg-[color:var(--bear)]' : 'bg-yellow-400'
                  }`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
              <span className={`text-xs font-mono font-bold ${ratingColor}`}>{result.confidence}%</span>
            </div>
          </div>

          {/* Rationale */}
          <div className="flex-1 bg-muted/20 rounded-lg border border-border p-3 space-y-2">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">分析依據</p>
            {result.rationale.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                <span className="text-primary mt-0.5 flex-shrink-0">›</span>
                <span>{r}</span>
              </div>
            ))}
          </div>

          {/* Clear */}
          <button
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline text-center"
          >
            清除訊號
          </button>
        </div>
      )}
    </div>
  )
}
