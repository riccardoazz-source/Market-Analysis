export interface DataPoint {
  date: string
  close: number
  timestamp: number
}

export interface Downturn {
  id: number
  name: string
  startDate: string      // peak date
  endDate: string        // trough date
  recoveryDate: string | null
  peakValue: number
  troughValue: number
  drawdown: number       // e.g. -33.5 (percentage, negative)
  durationDays: number   // peak to trough
  recoveryDays: number | null  // trough to new ATH
  description: string
  cause: string
  type: 'bear_market' | 'correction'  // bear: >20%, correction: 10-20%
  tags: string[]
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
