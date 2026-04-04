'use client'

import { useState, useMemo, useRef } from 'react'
import { DataPoint, Downturn, SP500Stats, DownturnCategory, CATEGORY_META } from '@/lib/types'
import { formatPercent, daysToMonths } from '@/lib/utils'
import StatsPanel from './StatsPanel'
import SP500Chart from './SP500Chart'
import DownturnCard from './DownturnCard'

interface Props {
  sp500Data: DataPoint[]
  downturns: Downturn[]
  stats: SP500Stats
}

type TypeFilter  = 'all' | 'bear' | 'correction'
type SortKey     = 'date' | 'drawdown' | 'duration'

// All unique categories in the dataset
const ALL_CATEGORIES: DownturnCategory[] = [
  'tech_bubble', 'credit_crisis', 'pandemic', 'inflation_rates',
  'geopolitical', 'oil_shock', 'market_structure', 'political',
]

export default function Dashboard({ sp500Data, downturns, stats }: Props) {
  const [activeDownturnId, setActiveDownturnId] = useState<number | null>(null)
  const [typeFilter,       setTypeFilter]       = useState<TypeFilter>('all')
  const [categoryFilter,   setCategoryFilter]   = useState<DownturnCategory | null>(null)
  const [sort,             setSort]             = useState<SortKey>('date')
  const listRef = useRef<HTMLDivElement>(null)

  // Ongoing downturn (id 99) if present
  const ongoingDownturn = downturns.find((d) => d.isOngoing)

  const filteredAndSorted = useMemo(
    () =>
      downturns
        .filter((d) => {
          if (typeFilter === 'bear')       return d.type === 'bear_market'
          if (typeFilter === 'correction') return d.type === 'correction'
          return true
        })
        .filter((d) => {
          if (!categoryFilter) return true
          return d.categories.includes(categoryFilter)
        })
        .sort((a, b) => {
          if (sort === 'date')     return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          if (sort === 'drawdown') return a.drawdown - b.drawdown
          if (sort === 'duration') return b.durationDays - a.durationDays
          return 0
        }),
    [downturns, typeFilter, categoryFilter, sort]
  )

  function handleDownturnClick(id: number) {
    setActiveDownturnId((prev) => (prev === id ? null : id))
    setTimeout(() => {
      const el = document.getElementById(`downturn-card-${id}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">

      {/* ── Ongoing event banner ───────────────────────────────────────── */}
      {ongoingDownturn && (
        <section>
          <div className="rounded-xl border border-red-700/60 bg-red-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <span className="relative flex h-4 w-4 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-red-300 font-bold text-base">{ongoingDownturn.name}</p>
                  <span className="badge bg-red-900/70 text-red-300 border border-red-700/50">LIVE</span>
                </div>
                <p className="text-sm text-slate-300 mt-0.5">
                  S&P 500 is currently{' '}
                  <span className="text-red-400 font-bold">{formatPercent(ongoingDownturn.drawdown)}</span>
                  {' '}from its recent peak of{' '}
                  <span className="text-slate-200 font-medium">
                    {ongoingDownturn.peakValue.toLocaleString()}
                  </span>
                  {' '}—{' '}
                  {ongoingDownturn.type === 'bear_market' ? (
                    <span className="text-red-400">confirmed bear market</span>
                  ) : (
                    <span className="text-orange-400">market correction</span>
                  )}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              <div className="text-center px-4 py-2 bg-red-900/30 rounded-lg">
                <p className="text-xs text-slate-400">Drawdown</p>
                <p className="text-lg font-bold text-red-400">{formatPercent(ongoingDownturn.drawdown)}</p>
              </div>
              <div className="text-center px-4 py-2 bg-red-900/30 rounded-lg">
                <p className="text-xs text-slate-400">Duration</p>
                <p className="text-lg font-bold text-orange-400">{daysToMonths(ongoingDownturn.durationDays)}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <section>
        <StatsPanel stats={stats} />
      </section>

      {/* ── Chart ──────────────────────────────────────────────────────── */}
      <section>
        <SP500Chart
          data={sp500Data}
          downturns={downturns}
          activeDownturnId={activeDownturnId}
          filter={typeFilter}
          onDownturnClick={handleDownturnClick}
        />
      </section>

      {/* ── Downturn list ──────────────────────────────────────────────── */}
      <section ref={listRef}>
        {/* List header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">
              Historical Downturns
              <span className="text-slate-500 text-base font-normal ml-2">
                ({filteredAndSorted.length})
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click a card or chart region to highlight the corresponding event
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Type filter */}
            <div className="flex rounded-lg border border-slate-700 overflow-hidden text-xs">
              {(['all', 'bear', 'correction'] as TypeFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-3 py-1.5 transition-colors ${
                    typeFilter === f
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'bear' ? 'Bear Markets' : 'Corrections'}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex rounded-lg border border-slate-700 overflow-hidden text-xs">
              {([
                { key: 'date',     label: 'Date' },
                { key: 'drawdown', label: 'Worst' },
                { key: 'duration', label: 'Longest' },
              ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`px-3 py-1.5 transition-colors ${
                    sort === key
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Category filter pills ────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              !categoryFilter
                ? 'bg-slate-600 border-slate-500 text-white'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            All Causes
          </button>
          {ALL_CATEGORIES.filter((cat) =>
            downturns.some((d) => d.categories.includes(cat))
          ).map((cat) => {
            const meta = CATEGORY_META[cat]
            const isActive = categoryFilter === cat
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(isActive ? null : cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  isActive
                    ? `${meta.color} border-current`
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {meta.icon} {meta.label}
              </button>
            )
          })}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredAndSorted.map((downturn) => (
            <div key={downturn.id} id={`downturn-card-${downturn.id}`}>
              <DownturnCard
                downturn={downturn}
                isActive={activeDownturnId === downturn.id}
                onClick={() => handleDownturnClick(downturn.id)}
              />
            </div>
          ))}
        </div>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            No downturns match the selected filters.
          </div>
        )}
      </section>

      {/* ── Methodology ────────────────────────────────────────────────── */}
      <section className="card p-5 bg-slate-900/40">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Methodology & Data Sources</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          This analysis covers major S&P 500 drawdowns ≥10% since 1987. <strong className="text-slate-400">Bear
          markets</strong> = declines exceeding 20%. <strong className="text-slate-400">Corrections</strong>
          {' '} = 10–20% declines. Duration is peak-to-trough. Recovery is trough to prior ATH.
          <strong className="text-slate-400"> Auto-detection</strong> identifies any ongoing events not yet in the
          curated list. Multi-asset data: S&P 500 (^GSPC), Gold futures (GC=F), 20+ Year Treasury ETF (TLT),
          Bitcoin (BTC-USD) — all sourced from Yahoo Finance. Data shown normalized to base 100 enables
          direct performance comparison across assets during any selected period.
        </p>
      </section>
    </div>
  )
}
