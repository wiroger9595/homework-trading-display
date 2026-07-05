import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (!q.trim()) return NextResponse.json([])

  try {
    // Remove type= param — it causes "forbidden_set_type_with_search_type_api" error
    const url = `https://symbol-search.tradingview.com/symbol_search/v3/?text=${encodeURIComponent(q)}&hl=1&exchange=&lang=en&domain=production`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.tradingview.com',
        'Referer': 'https://www.tradingview.com/',
      },
      next: { revalidate: 10 },
    })

    if (!res.ok) return NextResponse.json([])

    const data = await res.json()

    // Strip <em>…</em> highlight tags TradingView injects into symbol/description
    const stripEm = (s: string) => s.replace(/<\/?em>/g, '')

    // Normalise to a flat array, prefer stock/ETF types first
    const raw: Record<string, unknown>[] = data?.symbols ?? data ?? []
    const symbols = raw
      .filter((item) => {
        const t = String(item.type ?? '')
        return ['stock', 'fund', 'dr', 'index', 'futures'].includes(t)
      })
      .slice(0, 10)
      .map((item) => ({
        symbol: stripEm(String(item.symbol ?? '')),
        exchange: String(item.exchange ?? ''),
        description: stripEm(String(item.description ?? '')),
        type: String(item.type ?? ''),
      }))

    return NextResponse.json(symbols)
  } catch {
    return NextResponse.json([])
  }
}
