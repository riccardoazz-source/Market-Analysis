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
  ReferenceLine,
  ResponsiveContainer,
  Brush,
} from 'recharts'
import { DataPoint, Downturn, EcoPoint, EcoIndicator, ECO_META } from '@/lib/types'
import { formatDateShort, formatPercent } from '@/lib/utils'

// ─── Asset config ─────────────────────────────────────────────────────────────

const ASSETS = {
  sp500: { key: 'close',  label: 'S&P 500',    color: '#3b82f6', normKey: 'sp500Norm' },
  gold:  { key: 'gold',   label: 'Gold',        color: '#eab308', normKey: 'goldNorm'  },
  bonds: { key: 'bonds',  label: 'Bonds (TLT)', color: '#22c55e', normKey: 'bondsNorm' },
  btc:   { key: 'btc',    label: 'Bitcoin',     color: '#f97316', normKey: 'btcNorm'   },
} as const

type AssetKey = keyof typeof ASSETS

// CAPE P/E historical reference levels
const CAPE_HIST_AVG   = 15.9   // long-run historical average (Shiller)
const CAPE_MODERN_AVG = 27.2   // post-1990 modern average

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function CustomTooltip({
  active, payload, label, downturns, activeAssets, isNormalized, activeEco,
}: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; color: string }>
  label?: number
  downturns: Downturn[]
  activeAssets: Set<AssetKey>
  isNormalized: boolean
  activeEco: EcoIndicator | null
}) {
  if (!active || !payload?.length || !label) return null

  const date     = new Date(label)
  const dateStr  = date.toISOString().split('T')[0]
  const activeDt = downturns.find((d) => d.startDate <= dateStr && d.endDate >= dateStr)
  const pMap     = new Map(payload.map((p) => [p.dataKey, p]))

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 shadow-xl text-xs min-w-[180px]">
      <p className="text-slate-400 mb-2 font-medium">
        {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
      </p>

      {/* Assets */}
      {(Object.entries(ASSETS) as [AssetKey, typeof ASSETS[AssetKey]][])
        .filter(([k]) => activeAssets.has(k))
        .map(([assetKey, cfg]) => {
          const entry = pMap.get(isNormalized ? cfg.normKey : cfg.key)
          if (!entry?.value) return null
          const v = entry.value
          return (
            <div key={assetKey} className="flex justify-between gap-4 mb-0.5">
              <span style={{ color: cfg.color }}>{cfg.label}</span>
              <span className="font-semibold text-white">
                {isNormalized
                  ? v.toFixed(1)
                  : assetKey === 'btc'
                    ? `$${(v / 1000).toFixed(0)}k`
                    : v.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          )
        })}

      {/* Economic indicator */}
      {activeEco && (() => {
        const meta  = ECO_META[activeEco]
        const entry = pMap.get('eco')
        if (!entry?.value) return null
        return (
          <div className="flex justify-between gap-4 mb-0.5 mt-1 pt-1 border-t border-slate-700">
            <span style={{ color: meta.color }}>{meta.shortLabel}</span>
            <span className="font-semibold text-white">
              {entry.value.toFixed(activeEco === 'fed_rate' ? 2 : 1)}{meta.unit}
            </span>
          </div>
        )
      })()}

      {isNormalized && (
        <p className="text-slate-500 mt-1 text-[10px]">Base = 100 at chart start</p>
      )}

      {activeDt && (
        <div className="mt-2 pt-2 border-t border-slate-700">
          <p className={`font-semibold ${
            activeDt.type === 'bear_market' ? 'text-red-400'
            : activeDt.type === 'correction' ? 'text-orange-400'
            : 'text-yellow-400'
          }`}>
            {activeDt.isOngoing ? '🔴 ' : ''}{activeDt.name}
          </p>
          <p className="text-slate-400">{formatPercent(activeDt.drawdown)} peak-to-trough</p>
        </div>
      )}
    </div>
  )
}

// ─── Toggle button ────────────────────────────────────────────────────────────

function ToggleBtn({
  label, color, active, disabled, onClick,
}: {
  label: string; color?: string; active: boolean; disabled?: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all
        ${active ? 'text-white border-transparent' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      style={active && color ? { backgroundColor: color + '33', borderColor: color, color } : {}}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: active && color ? color : '#475569' }} />
      {label}
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
  ecoData: Record<EcoIndicator, EcoPoint[]>
}

export default function SP500Chart({
  data, downturns, activeDownturnId, filter, onDownturnClick, ecoData,
}: Props) {
  const [logScale,     setLogScale]     = useState(false)
  const [activeAssets, setActiveAssets] = useState<Set<AssetKey>>(new Set<AssetKey>(['sp500']))
  const [isNormalized, setIsNormalized] = useState(false)
  const [activeEco,    setActiveEco]    = useState<EcoIndicator | null>(null)

  // ── Initial brush start index ≈ 1987 ─────────────────────────────
  const defaultStartIndex = useMemo(() => {
    const target = new Date('1987-01-01').getTime()
    const idx    = data.findIndex((d) => d.timestamp >= target)
    return idx > 0 ? idx : 0
  }, [data])

  // ── Base chart data (stable — no brush deps) ──────────────────────
  const chartData = useMemo(
    () => data.map((d) => ({
      timestamp: d.timestamp,
      close:  d.close,
      gold:   d.gold  ?? null,
      bonds:  d.bonds ?? null,
      btc:    d.btc   ?? null,
    })),
    [data]
  )

  // ── Merge eco data by timestamp ───────────────────────────────────
  const ecoMap = useMemo(() => {
    if (!activeEco) return new Map<number, number>()
    const map = new Map<number, number>()
    for (const pt of ecoData[activeEco]) map.set(pt.timestamp, pt.value)
    return map
  }, [activeEco, ecoData])

  // ── Display data: normalized to defaultStartIndex, eco merged ─────
  // NOTE: Does NOT depend on brushRange — this fixes the brush reset bug.
  // The Brush component manages its own viewport state internally.
  const displayData = useMemo(() => {
    const base = chartData[defaultStartIndex]

    return chartData.map((d) => {
      const eco = activeEco ? ecoMap.get(d.timestamp) ?? null : null

      if (!base || !isNormalized) {
        return { ...d, sp500Norm: null, goldNorm: null, bondsNorm: null, btcNorm: null, eco }
      }

      return {
        ...d,
        sp500Norm: base.close > 0                 ? (d.close  / base.close)  * 100 : null,
        goldNorm:  base.gold  && base.gold  > 0   ? ((d.gold  ?? 0) / base.gold)  * 100 : null,
        bondsNorm: base.bonds && base.bonds > 0   ? ((d.bonds ?? 0) / base.bonds) * 100 : null,
        btcNorm:   base.btc   && base.btc   > 0   ? ((d.btc   ?? 0) / base.btc)   * 100 : null,
        eco,
      }
    })
  }, [chartData, defaultStartIndex, isNormalized, activeEco, ecoMap])

  const filteredDownturns = useMemo(
    () => downturns.filter((d) => {
      if (filter === 'bear')       return d.type === 'bear_market'
      if (filter === 'correction') return d.type === 'correction' || d.type === 'minor'
      return true
    }),
    [downturns, filter]
  )

  const formatXAxis = useCallback((ts: number) => new Date(ts).getFullYear().toString(), [])
  const formatMainY = useCallback((v: number) => {
    if (isNormalized) return `${v.toFixed(0)}`
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
    return v.toString()
  }, [isNormalized])

  const formatEcoY = useCallback((v: number) => {
    if (!activeEco) return ''
    return `${v.toFixed(activeEco === 'fed_rate' ? 1 : 0)}${ECO_META[activeEco].unit}`
  }, [activeEco])

  const hasData = useCallback((key: AssetKey) => {
    if (key === 'sp500') return true
    return chartData.some((d) => d[key as 'gold' | 'bonds' | 'btc'] != null)
  }, [chartData])

  const toggleAsset = (key: AssetKey) => {
    if (key === 'sp500') return
    setActiveAssets((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const toggleEco = (ind: EcoIndicator) => {
    setActiveEco((prev) => (prev === ind ? null : ind))
  }

  const ecoDomain = activeEco ? ECO_META[activeEco].domain : [0, 10]

  return (
    <div className="card p-4 sm:p-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">S&P 500 — Historical Performance</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Shaded areas = downturn periods. Click to highlight. Drag bottom brush to zoom.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsNormalized(!isNormalized)}
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

      {/* ── Asset toggles ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs text-slate-500 self-center">Assets:</span>
        {(Object.keys(ASSETS) as AssetKey[]).map((k) => (
          <ToggleBtn
            key={k}
            label={ASSETS[k].label}
            color={ASSETS[k].color}
            active={activeAssets.has(k)}
            disabled={k === 'sp500' || !hasData(k)}
            onClick={() => toggleAsset(k)}
          />
        ))}
        {isNormalized && activeAssets.size > 1 && (
          <span className="text-xs text-indigo-400 self-center ml-1">
            Normalized to 100 at chart start
          </span>
        )}
      </div>

      {/* ── Economic indicator toggles ──────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs text-slate-500 self-center">Indicators:</span>
        {(Object.keys(ECO_META) as EcoIndicator[]).map((ind) => {
          const meta = ECO_META[ind]
          return (
            <ToggleBtn
              key={ind}
              label={meta.shortLabel}
              color={meta.color}
              active={activeEco === ind}
              onClick={() => toggleEco(ind)}
            />
          )
        })}
        {activeEco && (
          <span className="text-xs self-center ml-1" style={{ color: ECO_META[activeEco].color }}>
            → {ECO_META[activeEco].description}
          </span>
        )}
      </div>

      {/* CAPE average legend (only when CAPE is active) */}
      {activeEco === 'pe_ratio' && (
        <div className="flex flex-wrap items-center gap-4 mb-2 text-xs">
          <div className="flex items-center gap-1.5">
            <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
            <span className="text-slate-400">Historical avg ({CAPE_HIST_AVG}x)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
            <span className="text-slate-400">Modern avg ({CAPE_MODERN_AVG}x, post-1990)</span>
          </div>
        </div>
      )}

      {/* ── Legend ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/50 border border-red-500/70" />
          Bear Market (&gt;20%)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-orange-500/50 border border-orange-500/70" />
          Correction (10–20%)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-500/40 border border-yellow-500/60" />
          Minor Decline (5–10%)
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

      {/* ── Chart ───────────────────────────────────────────────────── */}
      <ResponsiveContainer width="100%" height={440}>
        <ComposedChart data={displayData} margin={{ top: 5, right: activeEco ? 55 : 15, left: 5, bottom: 5 }}>
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

          {/* Left axis: S&P 500 or normalized */}
          <YAxis
            yAxisId="main"
            scale={!isNormalized && logScale ? 'log' : 'auto'}
            domain={[0, 'auto']}
            tickFormatter={formatMainY}
            stroke="#475569"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            width={50}
          />

          {/* Right axis: economic indicator */}
          {activeEco && (
            <YAxis
              yAxisId="eco"
              orientation="right"
              domain={ecoDomain}
              tickFormatter={formatEcoY}
              stroke={ECO_META[activeEco].color}
              tick={{ fill: ECO_META[activeEco].color, fontSize: 11 }}
              tickLine={false}
              width={52}
            />
          )}

          <Tooltip
            content={
              <CustomTooltip
                downturns={downturns}
                activeAssets={activeAssets}
                isNormalized={isNormalized}
                activeEco={activeEco}
              />
            }
            isAnimationActive={false}
          />

          {/* Downturn shading */}
          {filteredDownturns.map((dt) => {
            const isBear   = dt.type === 'bear_market'
            const isMinor  = dt.type === 'minor'
            const isActive = dt.id === activeDownturnId
            const fill     = isBear ? '#ef4444' : isMinor ? '#eab308' : '#f97316'
            return (
              <ReferenceArea
                key={dt.id}
                yAxisId="main"
                x1={new Date(dt.startDate).getTime()}
                x2={new Date(dt.endDate).getTime()}
                fill={fill}
                fillOpacity={dt.isOngoing ? 0.28 : isActive ? 0.30 : isMinor ? 0.12 : 0.15}
                stroke={fill}
                strokeOpacity={dt.isOngoing ? 0.9 : isActive ? 0.8 : 0.4}
                strokeWidth={dt.isOngoing ? 2 : isActive ? 1.5 : 1}
                strokeDasharray={dt.isOngoing ? '4 4' : undefined}
                onClick={() => onDownturnClick(dt.id)}
                style={{ cursor: 'pointer' }}
              />
            )
          })}

          {/* CAPE P/E average reference lines */}
          {activeEco === 'pe_ratio' && (
            <>
              <ReferenceLine
                yAxisId="eco"
                y={CAPE_HIST_AVG}
                stroke="#94a3b8"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{ value: `Hist. avg ${CAPE_HIST_AVG}x`, position: 'insideTopRight', fill: '#94a3b8', fontSize: 10 }}
              />
              <ReferenceLine
                yAxisId="eco"
                y={CAPE_MODERN_AVG}
                stroke="#fb923c"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{ value: `Modern avg ${CAPE_MODERN_AVG}x`, position: 'insideTopRight', fill: '#fb923c', fontSize: 10 }}
              />
            </>
          )}

          {/* S&P 500 */}
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
              yAxisId="main"
              type="monotone"
              dataKey={isNormalized ? 'goldNorm' : 'gold'}
              stroke={ASSETS.gold.color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
              strokeDasharray={isNormalized ? undefined : '5 2'}
              name="Gold"
            />
          )}

          {/* Bonds */}
          {activeAssets.has('bonds') && (
            <Line
              yAxisId="main"
              type="monotone"
              dataKey={isNormalized ? 'bondsNorm' : 'bonds'}
              stroke={ASSETS.bonds.color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
              strokeDasharray={isNormalized ? undefined : '5 2'}
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
              connectNulls={false}
              strokeDasharray={isNormalized ? undefined : '5 2'}
              name="Bitcoin"
            />
          )}

          {/* Economic indicator line */}
          {activeEco && (
            <Line
              yAxisId="eco"
              type={activeEco === 'fed_rate' ? 'stepAfter' : 'monotone'}
              dataKey="eco"
              stroke={ECO_META[activeEco].color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              connectNulls
              name={ECO_META[activeEco].shortLabel}
            />
          )}

          {/* Brush — no onChange that modifies displayData deps, fixing the reset bug */}
          <Brush
            dataKey="timestamp"
            height={28}
            stroke="#334155"
            fill="#0f172a"
            travellerWidth={6}
            startIndex={defaultStartIndex}
            tickFormatter={(v) => new Date(v).getFullYear().toString()}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {!isNormalized && activeAssets.size > 1 && (
        <p className="text-xs text-slate-500 mt-2 text-center">
          Tip: enable <strong className="text-indigo-400">Index Mode</strong> to compare all assets on the same scale
        </p>
      )}
    </div>
  )
}
