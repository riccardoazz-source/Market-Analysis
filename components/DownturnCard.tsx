'use client'

import { useState } from 'react'
import { Downturn } from '@/lib/types'
import { formatDate, formatDateShort, formatPercent, daysToMonths } from '@/lib/utils'

interface Props {
  downturn: Downturn
  isActive?: boolean
  onClick?: () => void
}

export default function DownturnCard({ downturn, isActive, onClick }: Props) {
  const [expanded, setExpanded] = useState(false)

  const isBear = downturn.type === 'bear_market'
  const borderColor = isBear ? 'border-red-700/60' : 'border-orange-700/60'
  const activeBorder = isBear ? 'border-red-500' : 'border-orange-500'
  const headerBg = isBear ? 'bg-red-950/60' : 'bg-orange-950/60'
  const badgeBg = isBear ? 'bg-red-900/60 text-red-300' : 'bg-orange-900/60 text-orange-300'
  const valueColor = isBear ? 'text-red-400' : 'text-orange-400'

  return (
    <div
      className={`card flex flex-col overflow-hidden cursor-pointer transition-all duration-200
        ${isActive ? `${activeBorder} shadow-lg shadow-blue-900/30 scale-[1.01]` : borderColor}
        hover:border-slate-500`}
      onClick={onClick}
    >
      {/* Card header */}
      <div className={`px-4 py-3 ${headerBg} flex items-start justify-between gap-2`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge ${badgeBg}`}>
              {isBear ? 'Bear Market' : 'Correction'}
            </span>
            <span className="text-xs text-slate-400">
              {formatDateShort(downturn.startDate)} – {formatDateShort(downturn.endDate)}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1 leading-tight">{downturn.name}</h3>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-2xl font-bold ${valueColor}`}>{formatPercent(downturn.drawdown)}</p>
          <p className="text-xs text-slate-400">peak-to-trough</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-slate-700 border-b border-slate-700">
        <div className="px-3 py-2 text-center">
          <p className="text-xs text-slate-400">Duration</p>
          <p className="text-sm font-semibold text-white">{daysToMonths(downturn.durationDays)}</p>
        </div>
        <div className="px-3 py-2 text-center">
          <p className="text-xs text-slate-400">Recovery</p>
          <p className="text-sm font-semibold text-emerald-400">
            {downturn.recoveryDays ? daysToMonths(downturn.recoveryDays) : 'N/A'}
          </p>
        </div>
        <div className="px-3 py-2 text-center">
          <p className="text-xs text-slate-400">Drop</p>
          <p className="text-sm font-semibold text-slate-300">
            {formatPercent((downturn.troughValue / downturn.peakValue - 1) * 100)}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="p-4 flex-1">
        <div className={`text-sm text-slate-300 leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
          {downturn.description}
        </div>

        {/* Cause section — shown when expanded */}
        {expanded && (
          <div className="mt-3 p-3 bg-slate-900/60 rounded-lg border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Root Cause</p>
            <p className="text-sm text-slate-300">{downturn.cause}</p>
          </div>
        )}

        {/* Tags */}
        {expanded && (
          <div className="flex flex-wrap gap-1 mt-3">
            {downturn.tags.map((tag) => (
              <span key={tag} className="badge bg-slate-700/80 text-slate-300">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Peak/trough dates */}
        {expanded && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div>
              <span className="text-slate-500">Peak: </span>
              <span>{formatDate(downturn.startDate)} ({downturn.peakValue.toLocaleString()})</span>
            </div>
            <div>
              <span className="text-slate-500">Trough: </span>
              <span>{formatDate(downturn.endDate)} ({downturn.troughValue.toLocaleString()})</span>
            </div>
            {downturn.recoveryDate && (
              <div className="col-span-2">
                <span className="text-slate-500">Recovery: </span>
                <span className="text-emerald-400">{formatDate(downturn.recoveryDate)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expand/collapse button */}
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
            Show details & cause
          </>
        )}
      </button>
    </div>
  )
}
