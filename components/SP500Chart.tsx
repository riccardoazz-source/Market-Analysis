'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
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
  Legend,
} from 'recharts'
import { DataPoint, Downturn } from '@/lib/types'
import { formatDateShort, formatPercent } from '@/lib/utils'

// ─── Asset config ─────────────────────────────────────────────────────────────

const ASSETS = {
  sp500: { key: 'close',  label: 'S&P 500',     color: '#3b82f6', normKey: 'sp500Norm'  },
  gold:  { key: 'gold',   label: 'Gold',         color: '#eab308', normKey: 'goldNorm'   },
  bonds: { key: 'bonds',  label: 'Bonds (TLT)',  color: '#22c55e', normKey: 'bondsNorm'  },
  btc:   { key: 'btc',    label: 'Bitcoin',      color: '#f97316', normKey: 'btcNorm'    },
} as const

type AssetKey = keyof typeof ASSETS

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function CustomTooltip({
  active, payload, label,
  downturns, activeAssets, isNormalized,
}: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; color: string }>
  label?: number
  downturns: Downturn[]
  activeAssets: Set<AssetKey>
  isNormalized: boolean
}) {
  if (!active || !payload?.length || !label) return null

  const date = new Date(label)
  const dateStr = date.toISOString().split('T')[0]
  const activeDt = downturns.find((d) => d.startDate <= dateStr && d.endDate >= dateStr)

  const payloadMap = new Map(payload.map((p) => [p.dataKey, p]))

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 shadow-xl text-xs min-w-[160px]">
      <p className="text-slate-400 mb-2 font-medium">
        {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
      </p>

      {(Object.entries(ASSETS) as [AssetKey, typeof ASSETS[AssetKey]][])
        .filter(([k]) => activeAssets.has(k))
        .map(([assetKey, cfg]) => {
          const normEntry = payloadMap.get(cfg.normKey)
          const rawEntry  = payloadMap.get(cfg.key)
          const val = isNormalized ? normEntry?.value : rawEntry?.value
          if (val == null) return null
          return (
            <div key={assetKey} className="flex justify-between gap-4 mb-0.5">
              <span style={{ color: cfg.color }}>{cfg.label}</span>
              <span className="font-semibold text-white">
                {isNormalized
                  ? `${val.toFixed(1)}`
                  : assetKey === 'btc'
                    ? `$${(val / 1000).toFixed(1)}k`
                    : val.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          )
        })}

      {isNormalized && (
        <p className="text-slate-500 mt-1 text-[10px]">Base = 100 at left edge</p>
      )}

      {activeDt && (
        <div className="mt-2 pt-2 border-t border-slate-700">
          <p className={`font-semibold text-xs ${activeDt.type === 'bear_market' ? 'text-red-400' : 'text-orange-400'}`}>
            {activeDt.isOngoing ? '🔴 ' : ''}{activeDt.name}
          </p>
          <p className="text-slate-400">{formatPercent(activeDt.drawdown)} peak-to-trough</p>
        </div>
      )}
    </div>
  )
}

// ─── Asset toggle button ──────────────────────────────────────────────────────

function AssetToggle({
  assetKey, active, disabled, onClick,
}: {
  assetKey: AssetKey; active: boolean; disabled?: boolean; onClick: () => void
}) {
  const cfg = ASSETS[assetKey]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all
        ${active
          ? 'text-white border-transparent'
          : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-slate-200 hover:bg-slate-700'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      style={active ? { backgroundColor: cfg.color + '33', borderColor: cfg.color, color: cfg.color } : {}}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: active ? cfg.color : '#475569' }}
      />
      {cfg.label}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  data: DataPoint[]
  downturns: Downturn[]
  activeDownturnId: number | null
  filter: 'all' | 'bear' | 'correction'
  onDownturnClick: (id: number) => void
}

export default function SP500Chart({ data, downturns, activeDownturnId, filter, onDownturnClick }: Props) {
  const [logScale,       setLogScale]       = useState(false)
  const [activeAssets,   setActiveAssets]   = useState<Set<AssetKey>>(new Set<AssetKey>(['sp500']))
  const [isNormalized,   setIsNormalized]   = useState(false)
  const [brushRange,     setBrushRange]     = useState<{ startIndex: number; endIndex: number } | null>(null)
  const dataLen = data.length

  // Merge all asset values into chart-friendly array
  const chartData = useMemo(
    () => data.map((d) => ({
      timestamp: d.timestamp,
      close: d.close,
      gold:  d.gold  ?? null,
      bonds: d.bonds ?? null,
      btc:   d.btc   ?? null,
    })),
    [data]
  )

  // Normalized versions: each asset indexed to 100 at the left brush edge
  const normalizedData = useMemo(() => {
    const startIdx = brushRange?.startIndex ?? 0
    const base = chartData[startIdx]
    if (!base) return chartData.map((d) => ({ ...d, sp500Norm: null, goldNorm: null, bondsNorm: null, btcNorm: null }))

    return chartData.map((d) => ({
      ...d,
      sp500Norm: base.close > 0 ? (d.close  / base.close)  * 100 : null,
      goldNorm:  base.gold  && base.gold  > 0 ? ((d.gold  ?? 0) / base.gold)  * 100 : null,
      bondsNorm: base.bonds && base.bonds > 0 ? ((d.bonds ?? 0) / base.bonds) * 100 : null,
      btcNorm:   base.btc   && base.btc   > 0 ? ((d.btc   ?? 0) / base.btc)   * 100 : null,
    }))
  }, [chartData, brushRange])

  const displayData = isNormalized ? normalizedData : normalizedData // always pass merged

  // Initial brush start: ~1987
  const defaultStartIndex = useMemo(() => {
    const target = new Date('1987-01-01').getTime()
    const idx = chartData.findIndex((d) => d.timestamp >= target)
    return idx > 0 ? idx : 0
  }, [chartData])

  const filteredDownturns = useMemo(() =>
    downturns.filter((d) => {
      if (filter === 'bear') return d.type === 'bear_market'
      if (filter === 'correction') return d.type === 'correction'
      return true
    }),
    [downturns, filter]
  )

  const formatXAxis  = useCallback((ts: number) => new Date(ts).getFullYear().toString(), [])
  const formatYAxis  = useCallback((v: number) => {
    if (isNormalized) return `${v.toFixed(0)}`
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
    return v.toString()
  }, [isNormalized])

  const toggleAsset = (key: AssetKey) => {
    setActiveAssets((prev) => {
      const next = new Set(prev)
      if (key === 'sp500') return next // S&P 500 always on
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Check if an asset has any data
  const hasData = useCallback((key: AssetKey) => {
    if (key === 'sp500') return true
    return chartData.some((d) => d[key as 'gold' | 'bonds' | 'btc'] != null)
  }, [chartData])

  return (
    <div className="card p-4 sm:p-6">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">S&P 500 — Historical Performance</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Shaded areas = downturn periods. Click to highlight. Use brush to zoom.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setIsNormalized(!isNormalized) }}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
              isNormalized
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {isNormalized ? 'Indexed (Base 100)' : 'Index Mode'}
          </button>
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
      </div>

      {/* Asset toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs text-slate-500 self-center mr-1">Overlay:</span>
        {(Object.keys(ASSETS) as AssetKey[]).map((k) => (
          <AssetToggle
            key={k}
            assetKey={k}
            active={activeAssets.has(k)}
            disabled={k === 'sp500' || !hasData(k)}
            onClick={() => toggleAsset(k)}
          />
        ))}
        {isNormalized && activeAssets.size > 1 && (
          <span className="text-xs text-indigo-400 self-center ml-2">
            All assets indexed to 100 at left edge of chart
          </span>
        )}
      </div>

      {/* Downturn legend */}
      <div className="flex items-center gap-4 mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/50 border border-red-500/70" />
          Bear Market (&gt;20%)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-orange-500/50 border border-orange-500/70" />
          Correction (10–20%)
        </div>
        {downturns.some((d) => d.isOngoing) && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-red-400 font-medium">Ongoing event</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={displayData} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
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

          {/* Left Y-axis: absolute S&P 500 OR normalized */}
          <YAxis
            yAxisId="main"
            scale={!isNormalized && logScale ? 'log' : 'auto'}
            domain={!isNormalized && logScale ? ['auto', 'auto'] : isNormalized ? [0, 'auto'] : [0, 'auto']}
            tickFormatter={formatYAxis}
            stroke="#475569"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            width={50}
          />

          {/* Right Y-axis: normalized values when multiple assets are shown */}
          {isNormalized && activeAssets.size > 1 && (
            <YAxis
              yAxisId="norm"
              orientation="right"
              tickFormatter={(v) => `${v.toFixed(0)}`}
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              width={45}
              domain={[0, 'auto']}
            />
          )}

          <Tooltip
            content={
              <CustomTooltip
                downturns={downturns}
                activeAssets={activeAssets}
                isNormalized={isNormalized}
              />
            }
            isAnimationActive={false}
          />

          {/* Downturn shading */}
          {filteredDownturns.map((dt) => {
            const isBear   = dt.type === 'bear_market'
            const isActive = dt.id === activeDownturnId
            const isOngoing = dt.isOngoing
            const fill   = isBear ? '#ef4444' : '#f97316'
            return (
              <ReferenceArea
                key={dt.id}
                yAxisId="main"
                x1={new Date(dt.startDate).getTime()}
                x2={new Date(dt.endDate).getTime()}
                fill={fill}
                fillOpacity={isOngoing ? 0.30 : isActive ? 0.32 : 0.16}
                stroke={fill}
                strokeOpacity={isOngoing ? 1 : isActive ? 0.9 : 0.45}
                strokeWidth={isOngoing ? 2 : isActive ? 1.5 : 1}
                strokeDasharray={isOngoing ? '4 4' : undefined}
                onClick={() => onDownturnClick(dt.id)}
                style={{ cursor: 'pointer' }}
              />
            )
          })}

          {/* S&P 500 line */}
          <Line
            yAxisId="main"
            type="monotone"
            dataKey={isNormalized ? 'sp500Norm' : 'close'}
            stroke={ASSETS.sp500.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 4, fill: ASSETS.sp500.color }}
            connectNulls
            name="S&P 500"
          />

          {/* Gold */}
          {activeAssets.has('gold') && (
            <Line
              yAxisId={isNormalized ? 'main' : 'main'}
              type="monotone"
              dataKey={isNormalized ? 'goldNorm' : 'gold'}
              stroke={ASSETS.gold.color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 3, fill: ASSETS.gold.color }}
              connectNulls={false}
              strokeDasharray={isNormalized ? undefined : '4 2'}
              name="Gold"
            />
          )}

          {/* Bonds TLT */}
          {activeAssets.has('bonds') && (
            <Line
              yAxisId="main"
              type="monotone"
              dataKey={isNormalized ? 'bondsNorm' : 'bonds'}
              stroke={ASSETS.bonds.color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 3, fill: ASSETS.bonds.color }}
              connectNulls={false}
              strokeDasharray={isNormalized ? undefined : '4 2'}
              name="Bonds (TLT)"
            />
          )}

          {/* Bitcoin */}
          {activeAssets.has('btc') && (
            <Line
              yAxisId="main"
              type="monotone"
              dataKey={isNormalized ? 'btcNorm' : 'btc'}
              stroke={ASSETS.btc.color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 3, fill: ASSETS.btc.color }}
              connectNulls={false}
              strokeDasharray={isNormalized ? undefined : '4 2'}
              name="Bitcoin"
            />
          )}

          {/* Brush */}
          <Brush
            dataKey="timestamp"
            height={28}
            stroke="#334155"
            fill="#0f172a"
            travellerWidth={6}
            startIndex={defaultStartIndex}
            tickFormatter={(v) => new Date(v).getFullYear().toString()}
            onChange={(range) => {
              if (range && typeof range.startIndex === 'number') {
                setBrushRange({ startIndex: range.startIndex, endIndex: range.endIndex as number })
              }
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Note about non-normalized multi-asset view */}
      {!isNormalized && activeAssets.size > 1 && (
        <p className="text-xs text-slate-500 mt-2 text-center">
          Tip: Enable <strong className="text-indigo-400">Index Mode</strong> to compare all assets on the same scale (base 100)
        </p>
      )}
    </div>
  )
}
