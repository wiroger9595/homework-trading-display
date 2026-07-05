# AI 投資量化策略儀表板

一個 B2B 科技感的財經股票數據儀表板（Dashboard），資料來源整合 TradingView 即時圖表與模擬量化數據，具備深色模式（Dark Mode）與響應式設計（RWD）。

## 如何跑起來

需求環境：**Node.js 18+**（建議 20 以上）、**pnpm**（沒有安裝可用 `npx pnpm` 代替）。

```bash
# 1. 安裝依賴
pnpm install        # 或 npx pnpm install

# 2. 啟動開發伺服器
pnpm dev            # 或 npx pnpm dev

# 3. 打開瀏覽器
# http://localhost:3000
```

正式版建置：

```bash
pnpm build
pnpm start          # 啟動 production server
```

## 核心功能

### 1. 圖表呈現（TradingView + ECharts 雙模式）
- **即時行情**：嵌入 TradingView Advanced Chart widget，真實 K 線 + MACD + 成交量，支援 1m ~ 1W 時間週期切換。
- **AI 訊號圖**：ECharts 繪製的模擬 K 線（含 MA5 / MA20、成交量、縮放滑桿），K 線資料以股票代號種子化生成 —— 同一支股票每次圖形固定。

### 2. AI 策略指標（互動核心）
右側面板提供 4 種策略：MACD 交叉、RSI 超買超賣、布林帶突破、AI 深度學習。

點擊「**執行 AI 策略分析**」後，在**不重新整理網頁**的前提下：
1. 模擬分析進度條跑完，顯示評級（買進/賣出/觀望）、信心度與分析依據。
2. 圖表自動切換至 AI 訊號圖，K 棒上動態標註**紅綠三角箭頭**（BUY / SELL 訊號，取自真實 K 棒的局部高低點）。
3. 下方「持倉明細」表**即時抽換**成「AI 推薦標的」（動作徽章、信心度條、分析依據）。
4. 右下角跳出買賣訊號 toast 提示。

點「清除訊號」即恢復原狀 —— 全程僅靠 React state 驅動動態渲染。

### 3. RWD + 科技感深色模式
- 深色 fintech 配色（oklch 色彩空間、neon 綠主色、紅綠漲跌色）。
- 桌機為「圖表 + 側欄」雙欄佈局；行動裝置自動改為單欄，持倉表與熱度圖移至圖表下方。

### 其他功能
- 導覽列股票搜尋（Yahoo Finance API 即時報價與代號搜尋）
- 行情跑馬燈（美股 / 指數 / 加密貨幣）
- 統計卡片（現價、漲跌幅、成交量、市值）
- 持倉明細表（模擬即時跳動的現價與損益）
- 市場熱度圖
- 自動刷新頻率選項（即時 / 5 秒 / 15 秒 / 30 秒 / 1 分鐘）

## 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | Next.js 16（App Router）+ React 19 + TypeScript |
| 樣式 | Tailwind CSS 4 + shadcn/ui + tw-animate-css |
| 圖表 | TradingView Embed Widget、ECharts 6（echarts-for-react） |
| 圖示 | lucide-react |
| 資料 | Yahoo Finance API（即時報價）、種子化模擬 K 線數據 |

## 專案結構

```
├── app/
│   ├── page.tsx                  # 主儀表板頁面（狀態管理中樞）
│   ├── layout.tsx                # 根 layout
│   ├── globals.css               # 深色主題、設計 token（oklch）
│   └── api/
│       ├── quote/route.ts        # 即時報價 API（proxy Yahoo Finance）
│       └── symbol-search/route.ts # 股票代號搜尋 API
├── components/
│   ├── navbar.tsx                # 導覽列（股票搜尋、刷新頻率）
│   ├── market-ticker.tsx         # 行情跑馬燈
│   ├── stat-cards.tsx            # 統計卡片列
│   ├── tradingview-chart.tsx     # TradingView 即時圖表嵌入
│   ├── candlestick-chart.tsx     # ECharts 模擬 K 線 + AI 訊號箭頭
│   ├── ai-strategy-panel.tsx     # AI 策略面板（4 種策略、分析按鈕）
│   ├── positions-table.tsx       # 持倉明細 ↔ AI 推薦標的（動態抽換）
│   ├── market-heatmap.tsx        # 市場熱度圖
│   └── signal-toast.tsx          # 買賣訊號 toast 提示
└── lib/
    ├── symbols.ts                # 股票清單與種子資料
    ├── mock-data.ts              # 種子化 K 線生成 + 訊號推導
    └── utils.ts                  # 工具函式
```

## 資料流（AI 策略互動）

```
AIStrategyPanel（點擊分析）
  ├─ deriveSignals(generateCandles(symbol))   ← 從種子化 K 棒推導買賣點
  ├─ onSignalsGenerated(signals) ─→ page.tsx state ─→ CandlestickChart 標註箭頭
  ├─ onRecommendations(recs)     ─→ page.tsx state ─→ PositionsTable 抽換為推薦標的
  └─ onActiveChange(true)        ─→ SignalToast 跳出提示
```

## 備註

- AI 分析結果、K 線（AI 訊號圖模式）、持倉與推薦標的皆為**模擬數據**，僅供展示用途，不構成投資建議。
- TradingView 圖表與 Yahoo Finance 報價需要網路連線。
