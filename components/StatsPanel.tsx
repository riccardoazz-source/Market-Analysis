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
  accent?: 'red' | 'orange' | 'blue' | 'green' | 'purple' | 'yellow' | 'cyan'
}

function StatCard({ label, value, sub, accent = 'blue' }: StatCardProps) {
  const accentClasses: Record<string, string> = {
    red:    'text-red-400',
    orange: 'text-orange-400',
    blue:   'text-blue-400',
    green:  'text-emerald-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
    cyan:   'text-cyan-400',
  }
  return (
    <div className="card p-4 flex flex-col gap-1">
      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-2xl font-bold ${accentClasses[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

function FrequencyBar({ label, years, color }: { label: string; years: number; color: string }) {
  // Visual bar: max scale is 10 years
  const pct = Math.min((years / 10) * 100, 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-white w-16 text-right flex-shrink-0">
        every ~{years.toFixed(1)}y
      </span>
    </div>
  )
}

export default function StatsPanel({ stats }: Props) {
  const yearsBetweenAll   = stats.avgDaysBetweenAll   / 365.25
  const yearsBetweenBears = stats.avgDaysBetweenBears / 365.25

  return (
    <div className="space-y-4">
      {/* ── Primary stats ───────────────────────────────────────────── */}
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

      {/* ── Frequency + highlight row ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Frequency card */}
        <div className="card p-4 sm:col-span-2">
          <p className="text-xs text-yellow-400 uppercase tracking-wide font-medium mb-3">
            Historical Frequency
          </p>
          <div className="space-y-2.5">
            <FrequencyBar
              label="Any ≥10% drop"
              years={yearsBetweenAll}
              color="#f97316"
            />
            <FrequencyBar
              label="Bear market (>20%)"
              years={yearsBetweenBears}
              color="#ef4444"
            />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Based on {stats.totalEvents} events since 1987. Bar scale = 0–10 years.
          </p>
        </div>

        {/* Worst crash */}
        <div className="card p-4 border-red-900/50 bg-red-950/20">
          <p className="text-xs text-red-400 uppercase tracking-wide font-medium mb-1">Worst Crash</p>
          <p className="text-xl font-bold text-white">{stats.worstDrawdown.name}</p>
          <p className="text-red-400 font-semibold text-lg">{formatPercent(stats.worstDrawdown.drawdown)}</p>
          <p className="text-xs text-slate-400 mt-1">{daysToMonths(stats.worstDrawdown.durationDays)} decline</p>
        </div>

        {/* Fastest recovery */}
        <div className="card p-4 border-emerald-900/50 bg-emerald-950/20">
          <p className="text-xs text-emerald-400 uppercase tracking-wide font-medium mb-1">Fastest Recovery</p>
          <p className="text-xl font-bold text-white">{stats.quickestRecovery.name}</p>
          <p className="text-emerald-400 font-semibold text-lg">
            {stats.quickestRecovery.recoveryDays
              ? daysToMonths(stats.quickestRecovery.recoveryDays)
              : 'N/A'}
          </p>
          <p className="text-xs text-slate-400 mt-1">from trough to new ATH</p>
        </div>
      </div>
    </div>
  )
}
