'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, Settings, Search, X, RefreshCw, Check, TrendingUp, Newspaper } from 'lucide-react'
import { NAVBAR_SYMBOLS, SYMBOL_MAP } from '@/lib/symbols'

interface NavbarProps {
  selectedSymbol: string
  onSymbolChange: (symbol: string) => void
  refreshRate: string
  onRefreshRateChange: (rate: string) => void
}

const REFRESH_OPTIONS = ['即時', '5 秒', '15 秒', '30 秒', '1 分鐘']

// Popular symbols shown as quick-picks in search
const POPULAR_SYMBOLS = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'SPX', 'AAOI', 'AMD', 'INTC', 'NFLX']

export default function Navbar({ selectedSymbol, onSymbolChange, refreshRate, onRefreshRateChange }: NavbarProps) {
  const [time, setTime] = useState('')

  // Dropdown states
  const [searchOpen, setSearchOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ symbol: string; exchange: string; description: string; type: string }[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Refs for click-outside
  const searchRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Clock
  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('zh-TW', { hour12: false }))
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  // Close all on click-outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50)
    if (!searchOpen) { setSearchQuery(''); setSearchResults([]) }
  }, [searchOpen])

  // Debounced TradingView symbol search
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    const q = searchQuery.trim()
    if (!q) { setSearchResults([]); setSearchLoading(false); return }

    setSearchLoading(true)
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/symbol-search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setSearchResults(data)
      } catch {
        // Static deploy has no API routes — fall back to filtering local seed symbols
        const qq = q.toUpperCase()
        setSearchResults(
          Object.values(SYMBOL_MAP)
            .filter((s) => s.ticker.includes(qq) || s.name.toUpperCase().includes(qq))
            .map((s) => ({
              symbol: s.ticker,
              exchange: s.tvSymbol.split(':')[0],
              description: s.name,
              type: 'stock',
            }))
        )
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current) }
  }, [searchQuery])

  const closeAll = () => { setSearchOpen(false); setBellOpen(false); setSettingsOpen(false) }
  const toggleSearch = () => { const next = !searchOpen; closeAll(); setSearchOpen(next) }
  const toggleBell = () => { const next = !bellOpen; closeAll(); setBellOpen(next) }
  const toggleSettings = () => { const next = !settingsOpen; closeAll(); setSettingsOpen(next) }

  // Commit search
  // - When called from a search result row, pass the full "EXCHANGE:SYMBOL" string so
  //   TradingView can resolve the exact listing (e.g. NYSE:TSM instead of NASDAQ:TSM)
  // - When called from the Enter key / hotlist, pass the bare ticker
  const commitSearch = (tvSymbol?: string) => {
    const target = (tvSymbol ?? searchQuery).toUpperCase().trim()
    if (!target) return
    onSymbolChange(target)
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const info = SYMBOL_MAP[selectedSymbol]

  // TradingView news widget symbol
  const tvNewsSymbol = SYMBOL_MAP[selectedSymbol]?.tvSymbol ?? `NASDAQ:${selectedSymbol}`

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center gap-4 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center neon-glow">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M3 17l5-5 4 4 9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" />
            <circle cx="21" cy="7" r="2" fill="currentColor" className="text-primary-foreground" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight text-foreground">QuantEdge</div>
          <div className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase">AI Terminal</div>
        </div>
      </div>

      {/* Symbol tabs */}
      <div className="flex items-center gap-0.5 overflow-x-auto hide-scrollbar flex-1 max-w-lg">
        {NAVBAR_SYMBOLS.map((sym) => (
          <button
            key={sym}
            onClick={() => onSymbolChange(sym)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all duration-150 ${
              selectedSymbol === sym
                ? 'bg-neon-dim text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {sym}
          </button>
        ))}
      </div>

      {/* Selected symbol name */}
      {info && (
        <div className="hidden md:flex flex-col leading-tight flex-shrink-0">
          <span className="text-[11px] font-mono font-semibold text-foreground">{info.name}</span>
          <span className="text-[9px] font-mono text-muted-foreground">{info.sector}</span>
        </div>
      )}

      {/* Right side controls */}
      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        {/* Clock */}
        <span className="hidden lg:block font-mono text-xs text-muted-foreground tabular-nums">{time}</span>

        {/* ── Search ── */}
        <div ref={searchRef} className="relative">
          <button
            onClick={toggleSearch}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
              searchOpen ? 'bg-neon-dim text-primary' : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
            aria-label="搜尋股票"
          >
            <Search className="w-4 h-4" />
          </button>

          {searchOpen && (
            <div className="absolute right-0 top-10 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
              {/* Input row */}
              <div className="flex items-center gap-2 p-3 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) commitSearch()
                  }}
                  placeholder="輸入任意代碼，如 AAOI、PLTR…"
                  className="flex-1 bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none"
                />
                {searchQuery ? (
                  <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>

              {/* Go button (shown when user typed something not in popular list) */}
              {searchQuery.trim() && (
                <div className="px-3 pt-2.5">
                  <button
                    onClick={() => commitSearch()}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-neon-dim border border-primary/30 hover:bg-primary/10 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-mono font-bold text-primary">{searchQuery.toUpperCase()}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                      Enter 前往 ↵
                    </span>
                  </button>
                </div>
              )}

              {/* Results area */}
              <div className="max-h-64 overflow-y-auto">
                {/* Loading */}
                {searchLoading && (
                  <div className="flex items-center gap-2 px-4 py-4 text-xs text-muted-foreground font-mono">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>搜尋中…</span>
                  </div>
                )}

                {/* API results */}
                {!searchLoading && searchResults.length > 0 && (
                  <>
                    <div className="px-3 pt-2 pb-1">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        TradingView 搜尋結果
                      </span>
                    </div>
                    {searchResults.map((r) => {
                      const fullId = `${r.exchange}:${r.symbol}`
                      const isSelected = selectedSymbol === fullId || selectedSymbol === r.symbol
                      return (
                        <button
                          key={fullId}
                          onClick={() => commitSearch(fullId)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors text-left ${
                            isSelected ? 'bg-neon-dim/60' : ''
                          }`}
                        >
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-primary">{r.symbol}</span>
                              <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">{r.exchange}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">{r.type}</span>
                            </div>
                            <span className="text-[11px] text-foreground/80 truncate mt-0.5">{r.description}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </>
                )}

                {/* Empty query — show popular shortcuts */}
                {!searchQuery.trim() && (
                  <>
                    <div className="px-3 pt-2 pb-1">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">熱門標的</span>
                    </div>
                    {POPULAR_SYMBOLS.map(sym => {
                      const s = SYMBOL_MAP[sym]
                      return (
                        <button
                          key={sym}
                          onClick={() => commitSearch(sym)}
                          className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-muted/40 transition-colors text-left ${
                            sym === selectedSymbol ? 'bg-neon-dim/60' : ''
                          }`}
                        >
                          <span className="font-mono text-xs font-bold text-primary w-14 flex-shrink-0">{sym}</span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-foreground truncate">{s?.name ?? sym}</span>
                            <span className="text-[10px] text-muted-foreground">{s?.sector ?? '—'}</span>
                          </div>
                          {sym === selectedSymbol && <Check className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </>
                )}

                {/* Typed something but no results yet (not loading) */}
                {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                  <div className="px-4 py-3 text-xs text-muted-foreground font-mono">
                    未找到相符的標的，按 Enter 直接前往 {searchQuery.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Bell (TradingView News) ── */}
        <div ref={bellRef} className="relative">
          <button
            onClick={toggleBell}
            className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
              bellOpen ? 'bg-neon-dim text-primary' : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
            aria-label="市場新聞"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full pulse-neon" />
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-10 w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <Newspaper className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">市場新聞</span>
                <span className="ml-auto font-mono text-[10px] text-primary bg-neon-dim px-2 py-0.5 rounded border border-primary/30">
                  {selectedSymbol}
                </span>
              </div>
              {/* TradingView Timeline (News) Widget */}
              <div className="h-[420px] overflow-hidden">
                <TradingViewNewsWidget symbol={tvNewsSymbol} />
              </div>
            </div>
          )}
        </div>

        {/* ── Settings ── */}
        <div ref={settingsRef} className="relative">
          <button
            onClick={toggleSettings}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
              settingsOpen ? 'bg-neon-dim text-primary' : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
            aria-label="儀表板設定"
          >
            <Settings className={`w-4 h-4 transition-transform duration-500 ${settingsOpen ? 'rotate-90' : ''}`} />
          </button>

          {settingsOpen && (
            <div className="absolute right-0 top-10 w-60 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">儀表板設定</span>
                <button onClick={() => setSettingsOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">圖表刷新頻率</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {REFRESH_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => { onRefreshRateChange(opt); setSettingsOpen(false) }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all border ${
                        refreshRate === opt
                          ? 'bg-neon-dim text-primary border-primary/30'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      <span>{opt}</span>
                      {refreshRate === opt && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[10px] font-mono text-muted-foreground leading-relaxed">
                  {refreshRate === '即時'
                    ? 'TradingView 圖表已內建即時 Websocket 串流，無需手動刷新。'
                    : `每 ${refreshRate} 重新載入圖表資料。`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// Isolated component so the widget script only re-runs when symbol changes
function TradingViewNewsWidget({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      feedMode: 'symbol',
      symbol: symbol,
      isTransparent: true,
      displayMode: 'regular',
      width: '100%',
      height: '100%',
      colorTheme: 'dark',
      locale: 'zh_TW',
    })

    const wrapper = document.createElement('div')
    wrapper.className = 'tradingview-widget-container__widget'
    wrapper.style.height = '100%'
    wrapper.style.width = '100%'

    container.appendChild(wrapper)
    container.appendChild(script)

    return () => { if (container) container.innerHTML = '' }
  }, [symbol])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full h-full"
    />
  )
}
