'use client'

import { useState, useRef } from 'react'
import { DataPoint, Downturn, SP500Stats } from '@/lib/types'
import StatsPanel from './StatsPanel'
import SP500Chart from './SP500Chart'
import DownturnCard from './DownturnCard'

interface Props {
  sp500Data: DataPoint[]
  downturns: Downturn[]
  stats: SP500Stats
}

type Filter = 'all' | 'bear' | 'correction'
type SortKey = 'date' | 'drawdown' | 'duration'

export default function Dashboard({ sp500Data, downturns, stats }: Props) {
  const [activeDownturnId, setActiveDownturnId] = useState<number | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<SortKey>('date')
  const listRef = useRef<HTMLDivElement>(null)

  const filteredAndSorted = downturns
    .filter((d) => {
      if (filter === 'bear') return d.type === 'bear_market'
      if (filter === 'correction') return d.type === 'correction'
      return true
    })
    .sort((a, b) => {
      if (sort === 'date') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      if (sort === 'drawdown') return a.drawdown - b.drawdown
      if (sort === 'duration') return b.durationDays - a.durationDays
      return 0
    })

  function handleDownturnClick(id: number) {
    setActiveDownturnId((prev) => (prev === id ? null : id))
    // Scroll to the card
    setTimeout(() => {
      const el = document.getElementById(`downturn-card-${id}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      {/* Stats */}
      <section>
        <StatsPanel stats={stats} />
      </section>

      {/* Chart */}
      <section>
        <SP500Chart
          data={sp500Data}
          downturns={downturns}
          activeDownturnId={activeDownturnId}
          filter={filter}
          onDownturnClick={handleDownturnClick}
        />
      </section>

      {/* Downturn list */}
      <section ref={listRef}>
        {/* List header with filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-bold text-white">
            Historical Downturns
            <span className="text-slate-500 text-base font-normal ml-2">({filteredAndSorted.length})</span>
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter */}
            <div className="flex rounded-lg border border-slate-700 overflow-hidden text-sm">
              {(['all', 'bear', 'correction'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 transition-colors ${
                    filter === f
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'bear' ? 'Bear Markets' : 'Corrections'}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 text-xs">Sort:</span>
              <div className="flex rounded-lg border border-slate-700 overflow-hidden">
                {([
                  { key: 'date', label: 'Date' },
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
            No downturns match the selected filter.
          </div>
        )}
      </section>

      {/* Methodology note */}
      <section className="card p-5 bg-slate-900/40">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Methodology</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          This analysis covers the 10 major S&P 500 drawdowns since 1987 where the index declined ≥14% from
          a recent peak. <strong className="text-slate-400">Bear markets</strong> are defined as declines
          exceeding 20%. <strong className="text-slate-400">Corrections</strong> are declines of 10–20%.
          Duration is measured from the confirmed peak to the trough date. Recovery is measured from
          trough to when the S&P 500 closed above its prior peak. S&P 500 index values and dates are
          sourced from Yahoo Finance.
        </p>
      </section>
    </div>
  )
}
