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
  | 'war'
  | 'oil_shock'
  | 'market_structure'
  | 'political'

export const CATEGORY_META: Record<DownturnCategory, { label: string; color: string; icon: string }> = {
  tech_bubble:      { label: 'Tech Bubble',           color: 'bg-purple-900/70 text-purple-200 border-purple-700/50',  icon: '💻' },
  credit_crisis:    { label: 'Credit Crisis',          color: 'bg-red-900/70 text-red-200 border-red-700/50',          icon: '🏦' },
  pandemic:         { label: 'Pandemic',               color: 'bg-green-900/70 text-green-200 border-green-700/50',    icon: '🦠' },
  inflation_rates:  { label: 'Inflation / Rates',      color: 'bg-orange-900/70 text-orange-200 border-orange-700/50', icon: '📈' },
  geopolitical:     { label: 'Geopolitical',           color: 'bg-blue-900/70 text-blue-200 border-blue-700/50',       icon: '🌍' },
  war:              { label: 'War / Conflict',          color: 'bg-rose-900/70 text-rose-200 border-rose-700/50',       icon: '⚔️' },
  oil_shock:        { label: 'Oil Shock',              color: 'bg-yellow-900/70 text-yellow-200 border-yellow-700/50', icon: '🛢️' },
  market_structure: { label: 'Market Structure',       color: 'bg-slate-700/70 text-slate-200 border-slate-500/50',    icon: '⚙️' },
  political:        { label: 'Political',              color: 'bg-cyan-900/70 text-cyan-200 border-cyan-700/50',       icon: '🏛️' },
}

export interface AssetPerf {
  gold?: number
  bonds?: number
  btc?: number
}

export interface Downturn {
  id: number
  name: string
  startDate: string
  endDate: string
  recoveryDate: string | null
  peakValue: number
  troughValue: number
  drawdown: number
  durationDays: number
  recoveryDays: number | null
  description: string
  cause: string
  type: 'bear_market' | 'correction'  // bear >20%, correction ≥5%
  tags: string[]
  categories: DownturnCategory[]
  assetPerf?: AssetPerf
  isOngoing?: boolean
  isAutoDetected?: boolean
}

export interface SP500Stats {
  totalEvents: number
  bearMarkets: number
  corrections: number    // all non-bear (≥5%)

  // Overall averages
  avgDrawdown: number
  avgDuration: number
  medianDrawdown: number
  medianDuration: number
  avgRecoveryDays: number

  // Bear market averages
  bearAvgDrawdown: number
  bearAvgDuration: number
  bearAvgRecovery: number

  // Correction averages
  corrAvgDrawdown: number
  corrAvgDuration: number
  corrAvgRecovery: number

  avgDaysBetweenAll: number    // avg days between any ≥5% event
  avgDaysBetweenBears: number  // avg days between bear markets

  worstDrawdown: Downturn
  longestDuration: Downturn
  quickestRecovery: Downturn
}

// ─── Economic indicator types ─────────────────────────────────────────────────

export interface EcoPoint {
  date: string
  timestamp: number
  value: number
}

export type EcoIndicator = 'fed_rate' | 'pe_ratio' | 'inflation_cpi' | 'oil_price' | 'real_gdp'

export const ECO_META: Record<EcoIndicator, {
  label: string
  shortLabel: string
  color: string
  unit: string
  description: string
  domain: [number, number]
}> = {
  fed_rate: {
    label: 'Fed Funds Rate',
    shortLabel: 'Fed Rate',
    color: '#a78bfa',
    unit: '%',
    description: 'US Federal Reserve target interest rate (upper bound)',
    domain: [0, 11],
  },
  pe_ratio: {
    label: 'Shiller CAPE P/E',
    shortLabel: 'CAPE P/E',
    color: '#f472b6',
    unit: 'x',
    description: 'Cyclically Adjusted P/E — 10-yr avg inflation-adjusted earnings',
    domain: [5, 50],
  },
  inflation_cpi: {
    label: 'US Inflation (CPI YoY)',
    shortLabel: 'CPI Inflation',
    color: '#fb923c',
    unit: '%',
    description: 'US Consumer Price Index — year-over-year % change',
    domain: [-4, 12],
  },
  oil_price: {
    label: 'WTI Crude Oil',
    shortLabel: 'Oil (WTI)',
    color: '#84cc16',
    unit: '$',
    description: 'WTI Crude Oil spot price in USD per barrel (live from Yahoo Finance)',
    domain: [0, 160],
  },
  real_gdp: {
    label: 'US Real GDP (Inflation-Adjusted)',
    shortLabel: 'Real GDP',
    color: '#34d399',
    unit: 'B',
    description: 'US Real GDP — chained 2017 dollars, billions (FRED GDPC1, quarterly)',
    domain: [7500, 24000],
  },
}
