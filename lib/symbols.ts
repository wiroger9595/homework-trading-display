export interface SymbolInfo {
  ticker: string          // display ticker, e.g. "NVDA"
  tvSymbol: string        // TradingView symbol, e.g. "NASDAQ:NVDA"
  name: string            // full company name
  sector: string
  price: number           // seed price for mock data
  change: number          // seed change %
  marketCap: string
  volume: string
  volatility: number
}

export const SYMBOL_MAP: Record<string, SymbolInfo> = {
  AAPL: {
    ticker: 'AAPL',
    tvSymbol: 'NASDAQ:AAPL',
    name: 'Apple Inc.',
    sector: '科技',
    price: 189.32,
    change: 1.24,
    marketCap: '2.94T',
    volume: '58.2M',
    volatility: 24.3,
  },
  NVDA: {
    ticker: 'NVDA',
    tvSymbol: 'NASDAQ:NVDA',
    name: 'NVIDIA Corporation',
    sector: '半導體',
    price: 876.54,
    change: 3.87,
    marketCap: '2.16T',
    volume: '41.5M',
    volatility: 38.7,
  },
  TSLA: {
    ticker: 'TSLA',
    tvSymbol: 'NASDAQ:TSLA',
    name: 'Tesla, Inc.',
    sector: '電動車',
    price: 248.15,
    change: -2.31,
    marketCap: '792B',
    volume: '89.4M',
    volatility: 52.1,
  },
  MSFT: {
    ticker: 'MSFT',
    tvSymbol: 'NASDAQ:MSFT',
    name: 'Microsoft Corporation',
    sector: '軟體',
    price: 419.72,
    change: 0.85,
    marketCap: '3.12T',
    volume: '22.1M',
    volatility: 19.8,
  },
  AMZN: {
    ticker: 'AMZN',
    tvSymbol: 'NASDAQ:AMZN',
    name: 'Amazon.com, Inc.',
    sector: '電商/雲端',
    price: 195.41,
    change: 1.53,
    marketCap: '2.04T',
    volume: '31.7M',
    volatility: 28.4,
  },
  GOOGL: {
    ticker: 'GOOGL',
    tvSymbol: 'NASDAQ:GOOGL',
    name: 'Alphabet Inc.',
    sector: '網路服務',
    price: 171.23,
    change: -0.42,
    marketCap: '2.14T',
    volume: '18.9M',
    volatility: 22.6,
  },
  META: {
    ticker: 'META',
    tvSymbol: 'NASDAQ:META',
    name: 'Meta Platforms, Inc.',
    sector: '社群媒體',
    price: 525.87,
    change: 2.14,
    marketCap: '1.35T',
    volume: '14.3M',
    volatility: 31.2,
  },
  SPX: {
    ticker: 'SPX',
    tvSymbol: 'SP:SPX',
    name: 'S&P 500 Index',
    sector: '指數',
    price: 5234.18,
    change: 0.63,
    marketCap: '—',
    volume: '—',
    volatility: 14.2,
  },
}

export const NAVBAR_SYMBOLS = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'SPX']

export const TICKER_SYMBOLS = [
  ...NAVBAR_SYMBOLS,
  'BTC/USD',
  'ETH/USD',
  'NDX',
  'DXY',
]

export const TICKER_PRICES: Record<string, { price: number; change: number }> = {
  'AAPL':    { price: 189.32, change: 1.24 },
  'NVDA':    { price: 876.54, change: 3.87 },
  'TSLA':    { price: 248.15, change: -2.31 },
  'MSFT':    { price: 419.72, change: 0.85 },
  'AMZN':    { price: 195.41, change: 1.53 },
  'GOOGL':   { price: 171.23, change: -0.42 },
  'META':    { price: 525.87, change: 2.14 },
  'SPX':     { price: 5234.18, change: 0.63 },
  'BTC/USD': { price: 67420.5, change: 1.92 },
  'ETH/USD': { price: 3521.8, change: -0.78 },
  'NDX':     { price: 18421.33, change: 0.91 },
  'DXY':     { price: 104.21, change: -0.15 },
}
