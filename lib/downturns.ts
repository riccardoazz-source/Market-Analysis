import { DataPoint, Downturn, DownturnCategory, SP500Stats } from './types'
import { formatDateShort } from './utils'

export const DOWNTURNS: Downturn[] = [
  {
    id: 1,
    name: 'Black Monday',
    startDate: '1987-08-25',
    endDate: '1987-12-04',
    recoveryDate: '1989-07-26',
    peakValue: 336.77,
    troughValue: 223.92,
    drawdown: -33.5,
    durationDays: 101,
    recoveryDays: 430,
    categories: ['market_structure'],
    cause:
      'Program trading, portfolio insurance strategies, and rising interest rates triggered a cascade of automatic sell orders.',
    description:
      'On October 19, 1987 — "Black Monday" — the S&P 500 lost 20.4% in a single day, the largest one-day percentage drop in history. Automatic computer-driven trading programs triggered a sell cascade that spread globally. The Federal Reserve intervened by flooding the system with liquidity.',
    type: 'bear_market',
    tags: ['program trading', '1980s', 'single-day crash'],
    assetPerf: { gold: +6.2 },
  },
  {
    id: 2,
    name: 'Gulf War Recession',
    startDate: '1990-07-16',
    endDate: '1990-10-11',
    recoveryDate: '1991-02-13',
    peakValue: 368.95,
    troughValue: 295.46,
    drawdown: -19.9,
    durationDays: 87,
    recoveryDays: 125,
    categories: ['geopolitical', 'oil_shock'],
    cause:
      "Iraq's invasion of Kuwait on August 2, 1990 sparked an oil price shock. Combined with a pre-existing credit crunch, the US economy tipped into recession.",
    description:
      "Iraq's invasion of Kuwait sent oil prices soaring and triggered a sharp US recession. The S&P 500 fell nearly 20% as consumer confidence collapsed. The Gulf War was brief, and a decisive US-led coalition victory in early 1991 restored confidence quickly.",
    type: 'correction',
    tags: ['geopolitical', 'oil shock', 'recession', '1990s'],
    assetPerf: { gold: +2.8 },
  },
  {
    id: 3,
    name: 'Dot-com Bust',
    startDate: '2000-03-24',
    endDate: '2002-10-09',
    recoveryDate: '2007-05-30',
    peakValue: 1527.46,
    troughValue: 776.76,
    drawdown: -49.1,
    durationDays: 929,
    recoveryDays: 1694,
    categories: ['tech_bubble'],
    cause:
      'The collapse of the internet stock bubble following years of speculative excess. Compounded by the September 11 attacks and major corporate accounting scandals (Enron, WorldCom, Tyco).',
    description:
      'The bursting of the dot-com bubble wiped out trillions in market capitalization. Hundreds of internet companies went bankrupt. Technology stocks led the collapse, with the NASDAQ losing nearly 80%. The bear market was deepened by the September 11, 2001 terrorist attacks and a wave of corporate accounting fraud that destroyed investor trust.',
    type: 'bear_market',
    tags: ['tech bubble', '9/11', 'corporate fraud', '2000s'],
    assetPerf: { gold: +11.2 },
  },
  {
    id: 4,
    name: 'Global Financial Crisis',
    startDate: '2007-10-09',
    endDate: '2009-03-09',
    recoveryDate: '2013-03-28',
    peakValue: 1565.15,
    troughValue: 676.53,
    drawdown: -56.8,
    durationDays: 517,
    recoveryDays: 1480,
    categories: ['credit_crisis'],
    cause:
      'The collapse of the US housing market and subprime mortgage crisis led to the failure of major financial institutions including Lehman Brothers, causing a global credit freeze.',
    description:
      'The worst financial crisis since the Great Depression. Years of reckless mortgage lending and complex financial instruments (CDOs, mortgage-backed securities) created a systemic bubble. When Lehman Brothers collapsed in September 2008, global credit markets froze. The Fed and US Treasury launched unprecedented emergency interventions — TARP, quantitative easing, and near-zero interest rates.',
    type: 'bear_market',
    tags: ['financial crisis', 'housing bubble', 'Lehman Brothers', '2008'],
    assetPerf: { gold: +25.0, bonds: +26.4 },
  },
  {
    id: 5,
    name: 'Flash Crash & Eurozone Crisis',
    startDate: '2010-04-26',
    endDate: '2010-07-02',
    recoveryDate: '2010-08-09',
    peakValue: 1219.8,
    troughValue: 1022.58,
    drawdown: -16.2,
    durationDays: 67,
    recoveryDays: 38,
    categories: ['market_structure', 'geopolitical'],
    cause:
      "European sovereign debt fears (Greece bailout) and the May 6 'Flash Crash', where the Dow briefly dropped 1,000 points in minutes due to algorithmic trading.",
    description:
      "Concerns over the Greek debt crisis and broader eurozone contagion pressured markets. The infamous 'Flash Crash' of May 6, 2010 briefly erased nearly $1 trillion in market value within minutes. A Greece bailout package from the EU and IMF eventually stabilized sentiment.",
    type: 'correction',
    tags: ['flash crash', 'eurozone', 'algorithmic trading', '2010'],
    assetPerf: { gold: +3.8, bonds: +4.2 },
  },
  {
    id: 6,
    name: 'US Debt Ceiling Crisis',
    startDate: '2011-04-29',
    endDate: '2011-10-03',
    recoveryDate: '2011-11-18',
    peakValue: 1363.61,
    troughValue: 1099.23,
    drawdown: -19.4,
    durationDays: 157,
    recoveryDays: 46,
    categories: ['political'],
    cause:
      "Political gridlock over raising the US debt ceiling brought the country close to default. Standard & Poor's downgraded US government debt from AAA for the first time.",
    description:
      "A high-stakes political standoff in Washington over raising the US debt ceiling paralyzed markets. Despite a last-minute deal, S&P made history by stripping the United States of its AAA credit rating on August 5, 2011. European debt crises in Italy and Spain added to the turmoil.",
    type: 'correction',
    tags: ['US debt ceiling', 'credit downgrade', 'eurozone', '2011'],
    assetPerf: { gold: +18.5, bonds: +28.9 },
  },
  {
    id: 7,
    name: 'China Slowdown & Oil Crash',
    startDate: '2015-05-21',
    endDate: '2016-02-11',
    recoveryDate: '2016-07-11',
    peakValue: 2130.82,
    troughValue: 1829.08,
    drawdown: -14.2,
    durationDays: 266,
    recoveryDays: 151,
    categories: ['geopolitical', 'oil_shock'],
    cause:
      'Fears of a hard landing in the Chinese economy, crude oil prices collapsing from $100 to below $30 per barrel, and the Federal Reserve raising interest rates for the first time since 2006.',
    description:
      "A confluence of global growth fears weighed on markets. China's economy showed signs of slowing sharply, triggering currency devaluation and a stock market crash in Shanghai. Oil prices collapsed to 12-year lows below $30 per barrel, battering energy stocks.",
    type: 'correction',
    tags: ['China', 'oil crash', 'Fed rate hike', '2015', '2016'],
    assetPerf: { gold: +2.8, bonds: +4.1, btc: -28.4 },
  },
  {
    id: 8,
    name: 'Q4 2018 Selloff',
    startDate: '2018-09-20',
    endDate: '2018-12-24',
    recoveryDate: '2019-04-23',
    peakValue: 2930.75,
    troughValue: 2351.1,
    drawdown: -19.8,
    durationDays: 95,
    recoveryDays: 120,
    categories: ['inflation_rates', 'geopolitical'],
    cause:
      'Aggressive Federal Reserve interest rate hikes, escalating US-China trade war tariffs, and widespread fears of a global economic slowdown.',
    description:
      "The most volatile quarter since 2008. The Federal Reserve raised rates four times in 2018, and markets began pricing in recession risk. Trump's escalating trade war with China introduced significant uncertainty. By Christmas Eve 2018, the S&P 500 was down nearly 20% from its September peak. A dovish Fed pivot in early 2019 quickly reversed the selloff.",
    type: 'correction',
    tags: ['Fed rate hikes', 'trade war', 'China', '2018'],
    assetPerf: { gold: +2.3, bonds: +6.2, btc: -51.6 },
  },
  {
    id: 9,
    name: 'COVID-19 Crash',
    startDate: '2020-02-19',
    endDate: '2020-03-23',
    recoveryDate: '2020-08-18',
    peakValue: 3386.15,
    troughValue: 2237.4,
    drawdown: -33.9,
    durationDays: 33,
    recoveryDays: 148,
    categories: ['pandemic'],
    cause:
      'The global spread of the COVID-19 pandemic led governments worldwide to shut down economies, creating an unprecedented sudden stop in economic activity.',
    description:
      "The fastest bear market in history. As COVID-19 spread globally, the S&P 500 lost a third of its value in just 33 calendar days. The Federal Reserve responded with emergency rate cuts to near zero and unlimited quantitative easing. The CARES Act ($2.2 trillion fiscal stimulus) and rapid vaccine development fueled one of the fastest recoveries in market history.",
    type: 'bear_market',
    tags: ['COVID-19', 'pandemic', 'Fed QE', '2020'],
    assetPerf: { gold: -1.5, bonds: +14.3, btc: -25.5 },
  },
  {
    id: 10,
    name: '2022 Rate Hike Bear Market',
    startDate: '2022-01-03',
    endDate: '2022-10-12',
    recoveryDate: '2024-01-19',
    peakValue: 4796.56,
    troughValue: 3577.03,
    drawdown: -25.4,
    durationDays: 282,
    recoveryDays: 464,
    categories: ['inflation_rates', 'geopolitical'],
    cause:
      "The Federal Reserve's aggressive campaign to fight 40-year-high inflation by raising rates from near 0% to over 5% in 12 months. Russia's invasion of Ukraine added energy price shocks.",
    description:
      "Surging post-pandemic inflation — peaking at 9.1% in June 2022, a 40-year high — forced the Federal Reserve into the most aggressive tightening cycle since the 1980s. This compressed valuations across both stocks and bonds simultaneously, creating one of the worst years for balanced portfolios in decades. Russia's invasion of Ukraine in February 2022 added energy shocks. Tech stocks bore the brunt of multiple compression.",
    type: 'bear_market',
    tags: ['inflation', 'Fed rate hikes', 'Ukraine war', '2022'],
    assetPerf: { gold: -8.8, bonds: -36.1, btc: -57.2 },
  },
]

/**
 * Auto-detects any ongoing or recent downturn not covered by the curated list.
 * Runs on whatever S&P 500 data is available (live or static).
 * Returns null if no new event is detected.
 */
export function detectOngoingDownturn(data: DataPoint[]): Downturn | null {
  if (data.length < 6) return null

  // Only look at data after the last curated downturn's recovery
  const lastCurated = DOWNTURNS[DOWNTURNS.length - 1]
  const cutoffDate = lastCurated.recoveryDate ?? lastCurated.endDate
  const recent = data.filter((d) => d.date >= cutoffDate)
  if (recent.length < 3) return null

  // Find the highest peak since recovery
  let peak = recent[0]
  for (const p of recent) {
    if (p.close > peak.close) peak = p
  }

  // Find the lowest trough after the peak
  const afterPeak = recent.filter((d) => d.date >= peak.date)
  if (afterPeak.length < 2) return null

  let trough = afterPeak[0]
  for (const p of afterPeak) {
    if (p.close < trough.close) trough = p
  }

  const drawdownPct = ((trough.close - peak.close) / peak.close) * 100

  // Only report if ≥ 10% drawdown
  if (drawdownPct > -10) return null

  // Check if still ongoing: the last data point is still below the peak by >5%
  const latest = recent[recent.length - 1]
  const currentPct = ((latest.close - peak.close) / peak.close) * 100
  const isOngoing = currentPct < -5 && latest.date === trough.date

  const msPerDay = 86400 * 1000
  const durationDays = Math.round((new Date(trough.date).getTime() - new Date(peak.date).getTime()) / msPerDay)

  const name = isOngoing
    ? `Ongoing ${drawdownPct < -20 ? 'Bear Market' : 'Correction'}`
    : `${formatDateShort(peak.date)} Correction`

  return {
    id: 99,
    name,
    startDate: peak.date,
    endDate: trough.date,
    recoveryDate: null,
    peakValue: peak.close,
    troughValue: trough.close,
    drawdown: Math.round(drawdownPct * 10) / 10,
    durationDays,
    recoveryDays: null,
    description: isOngoing
      ? `The S&P 500 is currently down ${Math.abs(drawdownPct).toFixed(1)}% from its peak of ${peak.close.toLocaleString()} reached on ${formatDateShort(peak.date)}. The index hit a trough of ${trough.close.toLocaleString()} on ${formatDateShort(trough.date)}. Root cause analysis and full context will be added once the event concludes.`
      : `The S&P 500 fell ${Math.abs(drawdownPct).toFixed(1)}% from ${peak.close.toLocaleString()} (${formatDateShort(peak.date)}) to ${trough.close.toLocaleString()} (${formatDateShort(trough.date)}) — a decline of ${durationDays} days. Recovery is underway.`,
    cause: 'Cause analysis pending — this event was auto-detected from live market data.',
    type: drawdownPct < -20 ? 'bear_market' : 'correction',
    tags: ['auto-detected', isOngoing ? 'ongoing' : 'recent'],
    categories: [],
    isOngoing,
    isAutoDetected: true,
  }
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function computeStats(allDownturns: Downturn[]): SP500Stats {
  const curated = allDownturns.filter((d) => !d.isAutoDetected)
  const bearMarkets = curated.filter((d) => d.type === 'bear_market')
  const corrections = curated.filter((d) => d.type === 'correction')

  const drawdowns = curated.map((d) => d.drawdown)
  const durations = curated.map((d) => d.durationDays)
  const recoveries = curated.filter((d) => d.recoveryDays !== null).map((d) => d.recoveryDays as number)

  const avgDrawdown = drawdowns.reduce((a, b) => a + b, 0) / drawdowns.length
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
  const avgRecoveryDays = recoveries.reduce((a, b) => a + b, 0) / recoveries.length

  const worstDrawdown = [...curated].sort((a, b) => a.drawdown - b.drawdown)[0]
  const longestDuration = [...curated].sort((a, b) => b.durationDays - a.durationDays)[0]
  const quickestRecovery = [...curated]
    .filter((d) => d.recoveryDays !== null)
    .sort((a, b) => (a.recoveryDays as number) - (b.recoveryDays as number))[0]

  return {
    totalEvents: curated.length,
    bearMarkets: bearMarkets.length,
    corrections: corrections.length,
    avgDrawdown,
    avgDuration,
    medianDrawdown: median(drawdowns),
    medianDuration: median(durations),
    avgRecoveryDays,
    worstDrawdown,
    longestDuration,
    quickestRecovery,
  }
}
