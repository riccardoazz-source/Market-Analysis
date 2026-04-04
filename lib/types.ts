export interface DataPoint {
  date: string
  timestamp: number
  close: number   // S&P 500
  gold?: number   // Gold USD/oz
  bonds?: number  // TLT ETF price
  btc?: number    // Bitcoin USD
}

export type DownturnCategory =
  | 'tech_bubble'
  | 'credit_crisis'
  | 'pandemic'
  | 'inflation_rates'
  | 'geopolitical'
  | 'oil_shock'
  | 'market_structure'
  | 'political'

export const CATEGORY_META: Record<DownturnCategory, { label: string; color: string; icon: string }> = {
  tech_bubble:      { label: 'Tech Bubble',          color: 'bg-purple-900/70 text-purple-200 border-purple-700/50', icon: '💻' },
  credit_crisis:    { label: 'Credit Crisis',         color: 'bg-red-900/70 text-red-200 border-red-700/50',         icon: '🏦' },
  pandemic:         { label: 'Pandemic',              color: 'bg-green-900/70 text-green-200 border-green-700/50',   icon: '🦠' },
  inflation_rates:  { label: 'Inflation / Rate Hikes',color: 'bg-orange-900/70 text-orange-200 border-orange-700/50',icon: '📈' },
  geopolitical:     { label: 'Geopolitical',          color: 'bg-blue-900/70 text-blue-200 border-blue-700/50',     icon: '🌍' },
  oil_shock:        { label: 'Oil Shock',             color: 'bg-yellow-900/70 text-yellow-200 border-yellow-700/50',icon: '🛢️' },
  market_structure: { label: 'Market Structure',      color: 'bg-slate-700/70 text-slate-200 border-slate-500/50',  icon: '⚙️' },
  political:        { label: 'Political',             color: 'bg-cyan-900/70 text-cyan-200 border-cyan-700/50',     icon: '🏛️' },
}

export interface AssetPerf {
  gold?: number    // % change from peak to trough
  bonds?: number
  btc?: number
}

export interface Downturn {
  id: number
  name: string
  startDate: string      // peak date
  endDate: string        // trough date
  recoveryDate: string | null
  peakValue: number
  troughValue: number
  drawdown: number       // negative percentage
  durationDays: number   // peak to trough
  recoveryDays: number | null
  description: string
  cause: string
  type: 'bear_market' | 'correction'
  tags: string[]
  categories: DownturnCategory[]
  assetPerf?: AssetPerf  // how other assets performed during this downturn
  isOngoing?: boolean
  isAutoDetected?: boolean
}

export interface SP500Stats {
  totalEvents: number
  bearMarkets: number
  corrections: number
  avgDrawdown: number
  avgDuration: number
  medianDrawdown: number
  medianDuration: number
  avgRecoveryDays: number
  worstDrawdown: Downturn
  longestDuration: Downturn
  quickestRecovery: Downturn
}
