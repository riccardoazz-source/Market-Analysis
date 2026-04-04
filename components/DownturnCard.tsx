'use client'

import { useState } from 'react'
import { Downturn, CATEGORY_META } from '@/lib/types'
import { formatDate, formatDateShort, formatPercent, daysToMonths } from '@/lib/utils'

interface Props {
  downturn: Downturn
  isActive?: boolean
  onClick?: () => void
}

function AssetPerfBadge({ label, value, color }: { label: string; value: number; color: string }) {
  const isPos = value >= 0
  return (
    <div className="flex items-center justify-between gap-1 text-xs py-0.5">
      <span className="text-slate-400">{label}</span>
      <span className={`font-semibold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPos ? '+' : ''}{value.toFixed(1)}%
      </span>
    </div>
  )
}

export default function DownturnCard({ downturn, isActive, onClick }: Props) {
  const [expanded, setExpanded] = useState(false)

  const isBear    = downturn.type === 'bear_market'
  const isOngoing = downturn.isOngoing
  const borderColor  = isBear ? 'border-red-700/60'    : 'border-orange-700/60'
  const activeBorder = isBear ? 'border-red-500'        : 'border-orange-500'
  const headerBg     = isOngoing
    ? 'bg-red-900/50'
    : isBear ? 'bg-red-950/60' : 'bg-orange-950/60'
  const badgeBg    = isBear ? 'bg-red-900/60 text-red-300'    : 'bg-orange-900/60 text-orange-300'
  const valueColor = isBear ? 'text-red-400'                   : 'text-orange-400'

  const hasAssetPerf = downturn.assetPerf &&
    (downturn.assetPerf.gold != null || downturn.assetPerf.bonds != null || downturn.assetPerf.btc != null)

  return (
    <div
      className={`card flex flex-col overflow-hidden cursor-pointer transition-all duration-200
        ${isActive ? `${activeBorder} shadow-lg shadow-blue-900/30 scale-[1.01]` : borderColor}
        hover:border-slate-500`}
      onClick={onClick}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className={`px-4 py-3 ${headerBg} flex items-start justify-between gap-2`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Type badge */}
            <span className={`badge ${badgeBg}`}>
              {isBear ? 'Bear Market' : 'Correction'}
            </span>
            {/* Ongoing pulse */}
            {isOngoing && (
              <span className="badge bg-red-600/80 text-white flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                LIVE
              </span>
            )}
            {/* Auto-detected label */}
            {downturn.isAutoDetected && !isOngoing && (
              <span className="badge bg-indigo-900/60 text-indigo-300">Auto-detected</span>
            )}
            {/* Date range */}
            <span className="text-xs text-slate-400">
              {formatDateShort(downturn.startDate)} – {isOngoing ? 'present' : formatDateShort(downturn.endDate)}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1 leading-tight">{downturn.name}</h3>

          {/* Category pills */}
          {downturn.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {downturn.categories.map((cat) => {
                const meta = CATEGORY_META[cat]
                return (
                  <span key={cat} className={`badge border text-[10px] ${meta.color}`}>
                    {meta.icon} {meta.label}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <p className={`text-2xl font-bold ${valueColor}`}>{formatPercent(downturn.drawdown)}</p>
          <p className="text-xs text-slate-400">peak-to-trough</p>
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 divide-x divide-slate-700 border-b border-slate-700">
        <div className="px-3 py-2 text-center">
          <p className="text-xs text-slate-400">Duration</p>
          <p className="text-sm font-semibold text-white">{daysToMonths(downturn.durationDays)}</p>
        </div>
        <div className="px-3 py-2 text-center">
          <p className="text-xs text-slate-400">Recovery</p>
          <p className={`text-sm font-semibold ${downturn.isOngoing ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {downturn.isOngoing ? 'Ongoing...' : downturn.recoveryDays ? daysToMonths(downturn.recoveryDays) : 'N/A'}
          </p>
        </div>
        <div className="px-3 py-2 text-center">
          <p className="text-xs text-slate-400">Peak value</p>
          <p className="text-sm font-semibold text-slate-300">
            {downturn.peakValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* ── Asset performance during this downturn ─────────────────── */}
      {hasAssetPerf && (
        <div className="px-4 pt-3 pb-2 border-b border-slate-700 bg-slate-900/30">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1.5">
            Other assets during this downturn
          </p>
          <div className="grid grid-cols-3 gap-x-4">
            {downturn.assetPerf?.gold  != null && (
              <AssetPerfBadge label="Gold"   value={downturn.assetPerf.gold}  color="#eab308" />
            )}
            {downturn.assetPerf?.bonds != null && (
              <AssetPerfBadge label="Bonds"  value={downturn.assetPerf.bonds} color="#22c55e" />
            )}
            {downturn.assetPerf?.btc   != null && (
              <AssetPerfBadge label="BTC"    value={downturn.assetPerf.btc}   color="#f97316" />
            )}
          </div>
        </div>
      )}

      {/* ── Description ─────────────────────────────────────────────── */}
      <div className="p-4 flex-1">
        <div className={`text-sm text-slate-300 leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
          {downturn.description}
        </div>

        {expanded && (
          <>
            {/* Root cause */}
            {!downturn.isAutoDetected && (
              <div className="mt-3 p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Root Cause</p>
                <p className="text-sm text-slate-300">{downturn.cause}</p>
              </div>
            )}

            {/* Tags */}
            {downturn.tags.filter((t) => t !== 'auto-detected' && t !== 'ongoing' && t !== 'recent').length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {downturn.tags
                  .filter((t) => t !== 'auto-detected' && t !== 'ongoing' && t !== 'recent')
                  .map((tag) => (
                    <span key={tag} className="badge bg-slate-700/80 text-slate-300">{tag}</span>
                  ))}
              </div>
            )}

            {/* Exact dates */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
              <div>
                <span className="text-slate-500">Peak: </span>
                <span>{formatDate(downturn.startDate)}</span>
                <span className="text-slate-500 ml-1">({downturn.peakValue.toLocaleString()})</span>
              </div>
              <div>
                <span className="text-slate-500">Trough: </span>
                <span>{formatDate(downturn.endDate)}</span>
                <span className="text-slate-500 ml-1">({downturn.troughValue.toLocaleString()})</span>
              </div>
              {downturn.recoveryDate && (
                <div className="col-span-2">
                  <span className="text-slate-500">Recovery to ATH: </span>
                  <span className="text-emerald-400">{formatDate(downturn.recoveryDate)}</span>
                  {downturn.recoveryDays && (
                    <span className="text-slate-500 ml-1">({daysToMonths(downturn.recoveryDays)} after trough)</span>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Expand toggle ───────────────────────────────────────────── */}
      <button
        className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 border-t border-slate-700
          flex items-center justify-center gap-1 transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          setExpanded(!expanded)
        }}
      >
        {expanded ? (
          <>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Show less
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Show root cause & details
          </>
        )}
      </button>
    </div>
  )
}
