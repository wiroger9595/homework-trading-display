'use client'

import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { generateCandles, type ChartRange, type Signal } from '@/lib/mock-data'

interface CandlestickChartProps {
  symbol: string
  range?: ChartRange
  signals?: Signal[]
  aiActive?: boolean
}

export default function CandlestickChart({ symbol, range = '1M', signals = [], aiActive = false }: CandlestickChartProps) {
  const { data, dates, volumes } = useMemo(() => generateCandles(symbol, range), [symbol, range])

  const markPoints = useMemo(() => {
    if (!aiActive || signals.length === 0) return []
    return signals
      .filter((s) => s.index >= 0 && s.index < data.length)
      .map((s) => {
        const isBuy = s.type === 'buy'
        const [, , low, high] = data[s.index]
        return {
          coord: [s.index, isBuy ? low : high],
          value: isBuy ? 'BUY' : 'SELL',
          symbol: 'triangle',
          symbolRotate: isBuy ? 0 : 180,
          symbolSize: 13,
          symbolOffset: [0, isBuy ? 14 : -14],
          itemStyle: {
            color: isBuy ? '#22c55e' : '#ef4444',
            shadowBlur: 10,
            shadowColor: isBuy ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)',
          },
          label: {
            show: true,
            position: isBuy ? 'bottom' : 'top',
            distance: 4,
            formatter: isBuy ? 'BUY' : 'SELL',
            color: isBuy ? '#22c55e' : '#ef4444',
            fontSize: 9,
            fontWeight: 'bold',
            fontFamily: 'JetBrains Mono, monospace',
          },
        }
      })
  }, [signals, aiActive, data])

  const option = useMemo(
    () => ({
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 600,
      grid: [
        { left: '8%', right: '4%', top: '4%', height: '64%' },
        { left: '8%', right: '4%', top: '72%', height: '18%' },
      ],
      xAxis: [
        {
          type: 'category',
          data: dates,
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
          axisTick: { show: false },
          axisLabel: {
            color: 'rgba(255,255,255,0.35)',
            fontSize: 10,
            fontFamily: 'JetBrains Mono, monospace',
            interval: Math.max(1, Math.floor(dates.length / 7)),
          },
          splitLine: { show: false },
        },
        {
          type: 'category',
          gridIndex: 1,
          data: dates,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          scale: true,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: 'rgba(255,255,255,0.35)',
            fontSize: 10,
            fontFamily: 'JetBrains Mono, monospace',
            formatter: (v: number) => `$${v.toFixed(1)}`,
          },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
        },
        {
          scale: true,
          gridIndex: 1,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: 'rgba(255,255,255,0.3)',
            fontSize: 9,
            fontFamily: 'JetBrains Mono, monospace',
            formatter: (v: number) => `${(v / 1e6).toFixed(0)}M`,
          },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)', type: 'dashed' } },
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 40,
          end: 100,
        },
        {
          type: 'slider',
          xAxisIndex: [0, 1],
          start: 40,
          end: 100,
          height: 16,
          bottom: 4,
          borderColor: 'rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(255,255,255,0.02)',
          fillerColor: 'rgba(34, 197, 94, 0.08)',
          handleStyle: { color: '#22c55e', borderColor: '#22c55e' },
          textStyle: { color: 'rgba(255,255,255,0.3)', fontSize: 9 },
          dataBackground: {
            lineStyle: { color: 'rgba(34,197,94,0.3)' },
            areaStyle: { color: 'rgba(34,197,94,0.06)' },
          },
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', lineStyle: { color: 'rgba(34,197,94,0.4)' } },
        backgroundColor: 'rgba(10, 15, 26, 0.95)',
        borderColor: 'rgba(34, 197, 94, 0.3)',
        borderWidth: 1,
        textStyle: { color: '#e2e8f0', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
        formatter: (params: unknown[]) => {
          const p = params as Array<{ seriesName: string; data: number[] | number; axisValue: string; color: string }>
          if (!p || !p[0]) return ''
          const idx = p[0].axisValue
          const kline = p.find((x) => x.seriesName === 'K線')
          if (!kline || !Array.isArray(kline.data)) return ''
          const [o, c, l, h] = kline.data as number[]
          const change = ((c - o) / o) * 100
          const isUp = c >= o
          return `
            <div style="padding:4px 0">
              <div style="color:rgba(255,255,255,0.5);margin-bottom:6px">${idx}</div>
              <div style="display:grid;grid-template-columns:auto auto;gap:2px 12px;font-size:10px">
                <span style="color:rgba(255,255,255,0.4)">開</span><span>$${o.toFixed(2)}</span>
                <span style="color:rgba(255,255,255,0.4)">高</span><span>$${h.toFixed(2)}</span>
                <span style="color:rgba(255,255,255,0.4)">低</span><span>$${l.toFixed(2)}</span>
                <span style="color:rgba(255,255,255,0.4)">收</span><span style="color:${isUp ? '#22c55e' : '#ef4444'}">$${c.toFixed(2)}</span>
                <span style="color:rgba(255,255,255,0.4)">漲跌</span><span style="color:${isUp ? '#22c55e' : '#ef4444'}">${isUp ? '+' : ''}${change.toFixed(2)}%</span>
              </div>
            </div>
          `
        },
      },
      series: [
        {
          name: 'K線',
          type: 'candlestick',
          data: data,
          itemStyle: {
            color: '#22c55e',
            color0: '#ef4444',
            borderColor: '#22c55e',
            borderColor0: '#ef4444',
          },
          markPoint: {
            data: markPoints,
            animation: true,
          },
        },
        {
          name: 'MA20',
          type: 'line',
          data: data.map((d, i) => {
            if (i < 20) return null
            const slice = data.slice(i - 20, i)
            return slice.reduce((sum, c) => sum + (c[1] as number), 0) / 20
          }),
          smooth: true,
          lineStyle: { color: 'rgba(99, 179, 237, 0.7)', width: 1 },
          symbol: 'none',
          z: 3,
        },
        {
          name: 'MA5',
          type: 'line',
          data: data.map((d, i) => {
            if (i < 5) return null
            const slice = data.slice(i - 5, i)
            return slice.reduce((sum, c) => sum + (c[1] as number), 0) / 5
          }),
          smooth: true,
          lineStyle: { color: 'rgba(251, 191, 36, 0.7)', width: 1 },
          symbol: 'none',
          z: 3,
        },
        {
          name: '成交量',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumes.map((v, i) => ({
            value: v,
            itemStyle: {
              color: (data[i][1] as number) >= (data[i][0] as number)
                ? 'rgba(34,197,94,0.5)'
                : 'rgba(239,68,68,0.5)',
            },
          })),
        },
      ],
    }),
    [data, dates, volumes, markPoints]
  )

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      theme="dark"
      opts={{ renderer: 'canvas' }}
    />
  )
}
