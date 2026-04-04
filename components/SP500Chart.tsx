'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
  Brush,
  TooltipProps,
} from 'recharts'
import { DataPoint, Downturn } from '@/lib/types'
import { formatDateShort, formatPercent } from '@/lib/utils'

interface Props {
  data: DataPoint[]
  downturns: Downturn[]
  activeDownturnId: number | null
  filter: 'all' | 'bear' | 'correction'
  onDownturnClick: (id: number) => void
}

function CustomTooltip({ active, payload, label, downturns }: TooltipProps<number, string> & { downturns: Downturn[] }) {
  if (!active || !payload?.length) return null

  const value = payload[0]?.value
  const date = label ? new Date(label) : null
  const dateStr = date ? date.toISOString().split('T')[0] : ''

  const activeDt = dateStr
    ? downturns.find((d) => d.startDate <= dateStr && d.endDate >= dateStr)
    : null

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{date?.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>
      <p className="text-blue-400 font-bold text-sm">{Number(value).toLocaleString()}</p>
      {activeDt && (
        <div className="mt-1 pt-1 border-t border-slate-700">
          <p className={`font-semibold ${activeDt.type === 'bear_market' ? 'text-red-400' : 'text-orange-400'}`}>
            {activeDt.name}
          </p>
          <p className="text-slate-400">{formatPercent(activeDt.drawdown)} peak-to-trough</p>
        </div>
      )}
    </div>
  )
}

export default function SP500Chart({ data, downturns, activeDownturnId, filter, onDownturnClick }: Props) {
  const [logScale, setLogScale] = useState(false)

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        timestamp: d.timestamp,
        close: d.close,
      })),
    [data]
  )

  const filteredDownturns = useMemo(() => {
    return downturns.filter((d) => {
      if (filter === 'bear') return d.type === 'bear_market'
      if (filter === 'correction') return d.type === 'correction'
      return true
    })
  }, [downturns, filter])

  const formatXAxis = useCallback((timestamp: number) => {
    return new Date(timestamp).getFullYear().toString()
  }, [])

  const formatYAxis = useCallback((value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
    return value.toString()
  }, [])

  // Brush range starts from 1987 (ts ~540000000000)
  const brushStartIndex = useMemo(() => {
    const target = new Date('1987-01-01').getTime()
    const idx = chartData.findIndex((d) => d.timestamp >= target)
    return idx > 0 ? idx : 0
  }, [chartData])

  return (
    <div className="card p-4 sm:p-6">
      {/* Chart controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">S&P 500 — Historical Performance</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Shaded areas indicate downturn periods. Click to highlight.
          </p>
        </div>
        <button
          onClick={() => setLogScale(!logScale)}
          className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
            logScale
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {logScale ? 'Log Scale' : 'Linear Scale'}
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/50 border border-red-500/70" />
          Bear Market (&gt;20%)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-orange-500/50 border border-orange-500/70" />
          Correction (10–20%)
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={['auto', 'auto']}
            tickFormatter={formatXAxis}
            stroke="#475569"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            scale={logScale ? 'log' : 'auto'}
            domain={logScale ? ['auto', 'auto'] : [0, 'auto']}
            tickFormatter={formatYAxis}
            stroke="#475569"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            width={45}
          />
          <Tooltip
            content={<CustomTooltip downturns={downturns} />}
            isAnimationActive={false}
          />

          {/* Downturn shading */}
          {filteredDownturns.map((dt) => {
            const isBear = dt.type === 'bear_market'
            const isActive = dt.id === activeDownturnId
            return (
              <ReferenceArea
                key={dt.id}
                x1={new Date(dt.startDate).getTime()}
                x2={new Date(dt.endDate).getTime()}
                fill={isBear ? '#ef4444' : '#f97316'}
                fillOpacity={isActive ? 0.35 : 0.18}
                stroke={isBear ? '#ef4444' : '#f97316'}
                strokeOpacity={isActive ? 0.8 : 0.4}
                strokeWidth={isActive ? 2 : 1}
                onClick={() => onDownturnClick(dt.id)}
                style={{ cursor: 'pointer' }}
              />
            )
          })}

          {/* S&P 500 line */}
          <Line
            type="monotone"
            dataKey="close"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 4, fill: '#3b82f6', stroke: '#1d4ed8' }}
          />

          {/* Brush / zoom */}
          <Brush
            dataKey="timestamp"
            height={28}
            stroke="#334155"
            fill="#0f172a"
            travellerWidth={6}
            startIndex={brushStartIndex}
            tickFormatter={(v) => new Date(v).getFullYear().toString()}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
