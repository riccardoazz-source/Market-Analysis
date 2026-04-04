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
      <p className="text-xs text-theme-muted uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-2xl font-bold ${accentClasses[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-theme-muted">{sub}</p>}
    </div>
  )
}

function TypeStatRow({
  label, count, avgDrawdown, avgDuration, avgRecovery, accent, icon,
}: {
  label: string
  count: number
  avgDrawdown: number
  avgDuration: number
  avgRecovery: number
  accent: string
  icon: string
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{icon}</span>
        <p className={`text-sm font-bold ${accent}`}>{label}</p>
        <span className="ml-auto text-xs text-theme-muted">{count} events</span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-theme-muted mb-0.5">Avg Drawdown</p>
          <p className={`text-lg font-bold ${accent}`}>{formatPercent(avgDrawdown)}</p>
        </div>
        <div>
          <p className="text-xs text-theme-muted mb-0.5">Avg Duration</p>
          <p className="text-lg font-bold text-theme-primary">
            {count > 0 ? daysToMonths(Math.round(avgDuration)) : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-xs text-theme-muted mb-0.5">Avg Recovery</p>
          <p className="text-lg font-bold text-emerald-400">
            {count > 0 && avgRecovery > 0 ? daysToMonths(Math.round(avgRecovery)) : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}

function FrequencyBar({ label, years, color }: { label: string; years: number; color: string }) {
  const pct = Math.min((years / 10) * 100, 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-theme-muted w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-theme-muted rounded-full h-2 overflow-hidden opacity-40 relative">
        <div
          className="h-full rounded-full transition-all absolute inset-y-0 left-0"
          style={{ width: `${pct}%`, backgroundColor: color, opacity: 1 }}
        />
      </div>
      <span className="text-xs font-semibold text-theme-primary w-16 text-right flex-shrink-0">
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
      {/* ── Bear Market vs Correction rows ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TypeStatRow
          label="Bear Markets (>20%)"
          count={stats.bearMarkets}
          avgDrawdown={stats.bearAvgDrawdown}
          avgDuration={stats.bearAvgDuration}
          avgRecovery={stats.bearAvgRecovery}
          accent="text-red-400"
          icon="🐻"
        />
        <TypeStatRow
          label="Corrections (≥5%)"
          count={stats.corrections}
          avgDrawdown={stats.corrAvgDrawdown}
          avgDuration={stats.corrAvgDuration}
          avgRecovery={stats.corrAvgRecovery}
          accent="text-orange-400"
          icon="📉"
        />
      </div>

      {/* ── Frequency + highlights ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Frequency card */}
        <div className="card p-4 sm:col-span-2">
          <p className="text-xs text-yellow-400 uppercase tracking-wide font-medium mb-3">
            Historical Frequency
          </p>
          <div className="space-y-2.5">
            <FrequencyBar
              label="Any ≥5% drop"
              years={yearsBetweenAll}
              color="#f97316"
            />
            <FrequencyBar
              label="Bear market (>20%)"
              years={yearsBetweenBears}
              color="#ef4444"
            />
          </div>
          <p className="text-xs text-theme-muted mt-3">
            {stats.totalEvents} events since 1987 ({stats.bearMarkets} bear + {stats.corrections} corrections).
            Bar scale: 0–10 years.
          </p>
        </div>

        {/* Worst crash */}
        <div className="card p-4 border-red-900/50 bg-red-950/20">
          <p className="text-xs text-red-400 uppercase tracking-wide font-medium mb-1">Worst Crash</p>
          <p className="text-xl font-bold text-theme-primary">{stats.worstDrawdown.name}</p>
          <p className="text-red-400 font-semibold text-lg">{formatPercent(stats.worstDrawdown.drawdown)}</p>
          <p className="text-xs text-theme-muted mt-1">{daysToMonths(stats.worstDrawdown.durationDays)} decline</p>
        </div>

        {/* Fastest recovery */}
        <div className="card p-4 border-emerald-900/50 bg-emerald-950/20">
          <p className="text-xs text-emerald-400 uppercase tracking-wide font-medium mb-1">Fastest Recovery</p>
          <p className="text-xl font-bold text-theme-primary">{stats.quickestRecovery.name}</p>
          <p className="text-emerald-400 font-semibold text-lg">
            {stats.quickestRecovery.recoveryDays
              ? daysToMonths(stats.quickestRecovery.recoveryDays)
              : 'N/A'}
          </p>
          <p className="text-xs text-theme-muted mt-1">from trough to new ATH</p>
        </div>
      </div>
    </div>
  )
}
