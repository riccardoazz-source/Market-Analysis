'use client'

import { SP500Stats } from '@/lib/types'
import { formatPercent, daysToMonths } from '@/lib/utils'

interface Props {
  stats: SP500Stats
}

interface StatCardProps {
  label: string
  value: string
  sub?: string
  accent?: 'red' | 'orange' | 'blue' | 'green' | 'purple'
}

function StatCard({ label, value, sub, accent = 'blue' }: StatCardProps) {
  const accentClasses = {
    red: 'text-red-400',
    orange: 'text-orange-400',
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    purple: 'text-purple-400',
  }

  return (
    <div className="card p-4 flex flex-col gap-1">
      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-2xl font-bold ${accentClasses[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

export default function StatsPanel({ stats }: Props) {
  return (
    <div className="space-y-4">
      {/* Primary stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Avg. Drawdown"
          value={formatPercent(stats.avgDrawdown)}
          sub={`Median ${formatPercent(stats.medianDrawdown)}`}
          accent="red"
        />
        <StatCard
          label="Avg. Duration"
          value={daysToMonths(Math.round(stats.avgDuration))}
          sub={`Median ${daysToMonths(Math.round(stats.medianDuration))}`}
          accent="orange"
        />
        <StatCard
          label="Avg. Recovery"
          value={daysToMonths(Math.round(stats.avgRecoveryDays))}
          sub="From trough to prior high"
          accent="green"
        />
        <StatCard
          label="Bear Markets"
          value={`${stats.bearMarkets}`}
          sub="Drops > 20%"
          accent="red"
        />
        <StatCard
          label="Corrections"
          value={`${stats.corrections}`}
          sub="Drops 10–20%"
          accent="orange"
        />
      </div>

      {/* Highlight row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 border-red-900/50 bg-red-950/20">
          <p className="text-xs text-red-400 uppercase tracking-wide font-medium mb-1">Worst Crash</p>
          <p className="text-xl font-bold text-white">{stats.worstDrawdown.name}</p>
          <p className="text-red-400 font-semibold">{formatPercent(stats.worstDrawdown.drawdown)}</p>
          <p className="text-xs text-slate-400 mt-1">{daysToMonths(stats.worstDrawdown.durationDays)} decline</p>
        </div>
        <div className="card p-4 border-orange-900/50 bg-orange-950/20">
          <p className="text-xs text-orange-400 uppercase tracking-wide font-medium mb-1">Longest Bear Market</p>
          <p className="text-xl font-bold text-white">{stats.longestDuration.name}</p>
          <p className="text-orange-400 font-semibold">{daysToMonths(stats.longestDuration.durationDays)}</p>
          <p className="text-xs text-slate-400 mt-1">{formatPercent(stats.longestDuration.drawdown)} decline</p>
        </div>
        <div className="card p-4 border-emerald-900/50 bg-emerald-950/20">
          <p className="text-xs text-emerald-400 uppercase tracking-wide font-medium mb-1">Fastest Recovery</p>
          <p className="text-xl font-bold text-white">{stats.quickestRecovery.name}</p>
          <p className="text-emerald-400 font-semibold">
            {stats.quickestRecovery.recoveryDays
              ? daysToMonths(stats.quickestRecovery.recoveryDays)
              : 'N/A'}
          </p>
          <p className="text-xs text-slate-400 mt-1">from trough to new high</p>
        </div>
      </div>
    </div>
  )
}
