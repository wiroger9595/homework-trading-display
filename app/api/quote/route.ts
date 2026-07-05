import { NextResponse } from 'next/server'
import type { QuoteData } from '@/lib/quote'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get('symbol')?.toUpperCase().trim()
  // Strip exchange prefix if present (e.g. "NYSE:TSM" → "TSM")
  const symbol = raw?.includes(':') ? raw.split(':')[1] : raw

  if (!symbol) {
    return NextResponse.json({ error: 'symbol required' }, { status: 400 })
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 15 }, // cache 15s
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'upstream error' }, { status: 502 })
    }

    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    if (!meta) {
      return NextResponse.json({ error: 'symbol not found' }, { status: 404 })
    }

    const price: number = meta.regularMarketPrice ?? 0
    const prevClose: number = meta.chartPreviousClose ?? meta.previousClose ?? price
    const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0

    const quote: QuoteData = {
      symbol,
      name: meta.longName ?? meta.shortName ?? symbol,
      price,
      prevClose,
      changePercent,
      high: meta.regularMarketDayHigh ?? price,
      low: meta.regularMarketDayLow ?? price,
      volume: meta.regularMarketVolume ?? 0,
      marketCap: meta.marketCap ?? null,
      currency: meta.currency ?? 'USD',
      exchange: meta.fullExchangeName ?? meta.exchangeName ?? '',
    }

    return NextResponse.json(quote)
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}
