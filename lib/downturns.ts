import { DataPoint, Downturn, DownturnCategory, SP500Stats } from './types'
// DownturnCategory is used in detectOngoingDownturn for inferred categories
import { formatDateShort } from './utils'

function daysBetween(d1: string, d2: string): number {
  return Math.round((new Date(d2).getTime() - new Date(d1).getTime()) / 86400000)
}

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
      'Portfolio insurance strategies and program trading created a self-reinforcing cascade of sell orders. Rising interest rates and market overvaluation provided the tinder; automated strategies lit the match.',
    description:
      'On October 19, 1987 — "Black Monday" — the S&P 500 lost 20.4% in a single day, the largest one-day percentage drop in history. Computer-driven portfolio insurance programs, designed to protect against losses, instead amplified them by automatically selling as prices fell. The Federal Reserve flooded the system with liquidity and the crash was contained, but full recovery took nearly two years.',
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
    categories: ['war', 'geopolitical', 'oil_shock'],
    cause:
      "Iraq's invasion of Kuwait on August 2, 1990 sent oil prices surging from $21 to $46/barrel. Combined with a pre-existing credit crunch (S&L crisis aftermath), the US economy tipped into recession.",
    description:
      "Iraq's invasion of Kuwait sent oil prices soaring and triggered a sharp US recession. Consumer confidence collapsed as the country prepared for war. The coalition victory in February 1991 was swift and decisive, quickly restoring market confidence. This remains one of the faster recoveries from a near-bear-market.",
    type: 'correction',
    tags: ['geopolitical', 'oil shock', 'recession', '1990s'],
    assetPerf: { gold: +2.8 },
  },
  {
    id: 14,
    name: '1994 Bond Market Massacre',
    startDate: '1994-01-31',
    endDate: '1994-04-04',
    recoveryDate: '1994-11-02',
    peakValue: 481.61,
    troughValue: 438.92,
    drawdown: -8.9,
    durationDays: 63,
    recoveryDays: 212,
    categories: ['inflation_rates'],
    cause:
      'The Federal Reserve raised interest rates seven times in 12 months (1994–1995), shocking bond markets globally. The sudden rate rises caused massive losses in bond portfolios, including Orange County, California, which filed for bankruptcy after losing $1.7 billion in interest-rate derivatives.',
    description:
      "After years of near-zero rates, the Fed's 1994 tightening cycle blindsided markets. Rates rose from 3% to 5.5% in rapid succession. Bond markets suffered their worst year in decades — the 'Great Bond Massacre.' Orange County went bankrupt. The S&P 500 corrected but held up relatively well compared to fixed income, recovering to new highs by November 1994.",
    type: 'correction',
    tags: ['Fed rate hikes', 'bond market', 'Orange County', '1994'],
    assetPerf: { gold: -2.1 },
  },
  {
    id: 15,
    name: '1997 Asian Financial Crisis',
    startDate: '1997-08-06',
    endDate: '1997-10-27',
    recoveryDate: '1997-12-05',
    peakValue: 983.12,
    troughValue: 876.99,
    drawdown: -10.8,
    durationDays: 82,
    recoveryDays: 39,
    categories: ['geopolitical', 'credit_crisis'],
    cause:
      "Thailand's decision to float the baht in July 1997 triggered cascading currency crises across Southeast Asia — Indonesia, Malaysia, South Korea, and the Philippines all saw massive capital flight and currency collapses.",
    description:
      "Thailand's currency devaluation in July 1997 set off a chain reaction of financial crises across Asia. On October 27, 1997 — the 'Mini-Crash' — the Dow fell 554 points (then its largest one-day point drop ever), triggering the first-ever NYSE trading halt under circuit breaker rules. The Fed held rates steady and US markets recovered swiftly, but Asian economies spent years rebuilding.",
    type: 'correction',
    tags: ['Asian crisis', 'currency crisis', 'contagion', '1997'],
    assetPerf: { gold: -3.5 },
  },
  {
    id: 3,
    name: 'Russia Default & LTCM Crisis',
    startDate: '1998-07-17',
    endDate: '1998-10-08',
    recoveryDate: '1998-11-23',
    peakValue: 1190.58,
    troughValue: 923.32,
    drawdown: -22.4,
    durationDays: 83,
    recoveryDays: 46,
    categories: ['credit_crisis', 'geopolitical'],
    cause:
      "Russia's sovereign debt default on August 17, 1998 triggered a global flight to safety. The near-collapse of Long-Term Capital Management (LTCM) — a $125 billion hedge fund — threatened to seize global credit markets, forcing an unprecedented Fed-orchestrated bailout.",
    description:
      "Russia's unexpected default on its ruble-denominated debt sent shockwaves through global markets. The near-collapse of LTCM, a hedge fund staffed by Nobel-prize winning economists, threatened systemic financial failure. The Federal Reserve orchestrated a private-sector rescue of LTCM and cut rates three times in rapid succession, calming markets. The recovery was among the fastest in history at just 46 days.",
    type: 'bear_market',
    tags: ['Russia', 'LTCM', 'hedge fund', 'emerging markets', '1998'],
    assetPerf: { gold: +2.3, bonds: +9.5 },
  },
  {
    id: 4,
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
      'The bursting of the dot-com bubble wiped out trillions in market capitalization. Hundreds of internet companies went bankrupt. Technology stocks led the collapse, with the NASDAQ losing nearly 80%. The bear market was deepened by the September 11, 2001 terrorist attacks and a wave of corporate accounting fraud. Recovery to prior highs took over 7 years.',
    type: 'bear_market',
    tags: ['tech bubble', '9/11', 'corporate fraud', '2000s'],
    assetPerf: { gold: +11.2 },
  },
  {
    id: 5,
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
      'The worst financial crisis since the Great Depression. Years of reckless mortgage lending and complex financial instruments created a systemic bubble. When Lehman Brothers collapsed in September 2008, global credit markets froze. Banks stopped lending, GDP contracted sharply worldwide, and unemployment spiked. The Fed and US Treasury launched unprecedented emergency interventions — TARP, quantitative easing, and near-zero interest rates.',
    type: 'bear_market',
    tags: ['financial crisis', 'housing bubble', 'Lehman Brothers', '2008'],
    assetPerf: { gold: +25.0, bonds: +26.4 },
  },
  {
    id: 6,
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
      "European sovereign debt fears (Greece bailout) and the May 6 'Flash Crash', where the Dow briefly dropped 1,000 points in minutes due to a large algorithmic sell order.",
    description:
      "Concerns over the Greek debt crisis and broader eurozone contagion pressured markets. The 'Flash Crash' of May 6, 2010 briefly erased nearly $1 trillion in market value within minutes. A Greece bailout package from the EU and IMF eventually stabilized sentiment. Recovery was among the fastest on record.",
    type: 'correction',
    tags: ['flash crash', 'eurozone', 'algorithmic trading', '2010'],
    assetPerf: { gold: +3.8, bonds: +4.2 },
  },
  {
    id: 7,
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
      "Political gridlock over raising the US debt ceiling brought the country close to default. S&P stripped the United States of its AAA credit rating for the first time. Eurozone debt crises in Italy and Spain added to the turmoil.",
    description:
      "A high-stakes political standoff in Washington over raising the US debt ceiling paralyzed markets. Despite a last-minute deal, S&P made history by downgrading US government debt from AAA on August 5, 2011. European debt crises in Italy and Spain added further stress. Gold surged to near $1,900/oz as investors sought safety — then one of its all-time highs.",
    type: 'correction',
    tags: ['US debt ceiling', 'credit downgrade', 'eurozone', '2011'],
    assetPerf: { gold: +18.5, bonds: +28.9 },
  },
  {
    id: 8,
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
      "China's economy showed signs of sharp slowdown, triggering currency devaluation and a Shanghai stock market crash. Oil prices collapsed to 12-year lows below $30 per barrel. The Fed's first rate hike since 2006 in December 2015 added further uncertainty. Markets bottomed in February 2016 before resuming their upward trend.",
    type: 'correction',
    tags: ['China', 'oil crash', 'Fed rate hike', '2015', '2016'],
    assetPerf: { gold: +2.8, bonds: +4.1, btc: -28.4 },
  },
  {
    id: 16,
    name: '2018 Volmageddon',
    startDate: '2018-01-26',
    endDate: '2018-02-08',
    recoveryDate: '2018-04-23',
    peakValue: 2872.87,
    troughValue: 2581.00,
    drawdown: -10.2,
    durationDays: 13,
    recoveryDays: 74,
    categories: ['market_structure', 'inflation_rates'],
    cause:
      "Short-volatility ETFs (XIV, SVXY) imploded when the VIX spiked from 11 to 50 on February 5 — 'Volmageddon.' A strong US jobs report on February 2 showed unexpected wage inflation, sparking fears the Fed would tighten faster than expected and triggering the initial selloff.",
    description:
      "After 15 months without a single 5% pullback — the longest such streak in history — a January wage inflation surprise triggered a rapid repricing. On February 5, 2018, the VIX volatility index spiked from ~11 to ~50 intraday, destroying the XIV inverse-VIX ETN (which went to zero overnight) and billions in retail short-volatility positions. The shock was violent but brief; markets recovered their losses within two months.",
    type: 'correction',
    tags: ['VIX', 'volatility', 'Volmageddon', 'XIV', '2018'],
    assetPerf: { gold: +1.5, bonds: +0.8, btc: -55.0 },
  },
  {
    id: 9,
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
      'Aggressive Federal Reserve interest rate hikes (4 raises in 2018), escalating US-China trade war tariffs, and widespread fears of a global economic slowdown.',
    description:
      "The most volatile quarter since 2008. The Federal Reserve raised rates four times in 2018. Trade war with China intensified, and markets began pricing in recession risk. By Christmas Eve 2018, the S&P 500 was down nearly 20%. A dovish Fed pivot in early 2019 — signaling a pause — quickly reversed the selloff.",
    type: 'correction',
    tags: ['Fed rate hikes', 'trade war', 'China', '2018'],
    assetPerf: { gold: +2.3, bonds: +6.2, btc: -51.6 },
  },
  {
    id: 10,
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
      "The fastest bear market in history. The S&P 500 lost a third of its value in just 33 calendar days. The Federal Reserve responded with emergency rate cuts to near zero, unlimited quantitative easing, and a $2.2 trillion CARES Act. Vaccine development announcements and massive policy support fueled one of the fastest recoveries in market history, with new highs reached just 5 months after the trough.",
    type: 'bear_market',
    tags: ['COVID-19', 'pandemic', 'Fed QE', '2020'],
    assetPerf: { gold: -1.5, bonds: +14.3, btc: -25.5 },
  },
  {
    id: 11,
    name: '2022 Rate Hike Bear Market',
    startDate: '2022-01-03',
    endDate: '2022-10-12',
    recoveryDate: '2024-01-19',
    peakValue: 4796.56,
    troughValue: 3577.03,
    drawdown: -25.4,
    durationDays: 282,
    recoveryDays: 464,
    categories: ['inflation_rates', 'geopolitical', 'war'],
    cause:
      "The Federal Reserve's aggressive campaign to fight 40-year-high inflation by raising rates from near 0% to over 5% in 12 months. Russia's invasion of Ukraine added energy price shocks and geopolitical uncertainty.",
    description:
      "Surging post-pandemic inflation — peaking at 9.1% in June 2022 — forced the Fed into the most aggressive tightening cycle since the 1980s. This compressed valuations across both stocks and bonds simultaneously, creating one of the worst years for balanced portfolios in decades. Russia's invasion of Ukraine in February 2022 added energy shocks and geopolitical uncertainty. Tech stocks bore the brunt of multiple compression. Recovery to prior highs took over two years.",
    type: 'bear_market',
    tags: ['inflation', 'Fed rate hikes', 'Ukraine war', '2022'],
    assetPerf: { gold: -8.8, bonds: -36.1, btc: -57.2 },
  },
  {
    id: 12,
    name: '2023 Bond Yield Surge',
    startDate: '2023-07-31',
    endDate: '2023-10-27',
    recoveryDate: '2023-12-15',
    peakValue: 4588.96,
    troughValue: 4117.37,
    drawdown: -10.3,
    durationDays: 88,
    recoveryDays: 49,
    categories: ['inflation_rates'],
    cause:
      'US 10-year Treasury yields surged to 5% for the first time since 2007 as the Federal Reserve maintained a "higher for longer" stance on interest rates. Investor concern about sustained elevated rates triggered a broad repricing of risk assets.',
    description:
      'As the Federal Reserve signaled rates would remain elevated well into 2024, the 10-year US Treasury yield pierced 5% — a 16-year high. This compressed equity valuations, particularly for rate-sensitive growth stocks. The correction was relatively brief; once yields began retreating in November and the Fed signaled potential rate cuts in 2024, markets rebounded sharply into year-end.',
    type: 'correction',
    tags: ['bond yields', 'higher for longer', 'Fed', '2023'],
    assetPerf: { gold: +1.5, bonds: -7.2, btc: -18.0 },
  },
  {
    id: 17,
    name: '2024 April Inflation Scare',
    startDate: '2024-03-28',
    endDate: '2024-04-19',
    recoveryDate: '2024-05-15',
    peakValue: 5264.85,
    troughValue: 4953.56,
    drawdown: -5.9,
    durationDays: 22,
    recoveryDays: 26,
    categories: ['inflation_rates', 'geopolitical'],
    cause:
      'Three consecutive above-forecast CPI prints (January, February, March 2024) pushed back Fed rate-cut expectations from March to September 2024. A direct Iran–Israel military exchange on April 13–14 added a geopolitical risk premium.',
    description:
      'After a strong early-2024 rally driven by rate-cut optimism, persistent inflation data forced markets to price out early Fed cuts. The 10-year Treasury yield climbed above 4.6%. A direct exchange of attacks between Iran and Israel on April 13–14 added geopolitical fears. The brief correction reversed quickly as Q1 2024 corporate earnings proved resilient, and the S&P 500 recovered to new highs by mid-May.',
    type: 'correction',
    tags: ['inflation', 'CPI', 'Iran-Israel', 'rate cuts', '2024'],
    assetPerf: { gold: +4.5, bonds: -3.2, btc: -19.0 },
  },
  {
    id: 18,
    name: '2024 Yen Carry Unwind',
    startDate: '2024-07-16',
    endDate: '2024-08-05',
    recoveryDate: '2024-08-22',
    peakValue: 5667.20,
    troughValue: 5186.33,
    drawdown: -8.5,
    durationDays: 20,
    recoveryDays: 17,
    categories: ['geopolitical', 'market_structure'],
    cause:
      'The Bank of Japan unexpectedly raised rates on July 31, 2024, triggering an unwind of the massive yen carry trade. A weak US non-farm payrolls report on August 2 (114k jobs vs. 175k expected) simultaneously raised US recession fears.',
    description:
      "Japan's surprise rate hike ended the era of zero rates there, forcing an abrupt reversal of the yen carry trade — where investors had borrowed cheaply in yen to buy global risk assets. On August 5, Japan's Nikkei fell 12% — its worst day since 1987 — and the S&P 500 dropped over 3%. The VIX spiked to 65 intraday, its highest since COVID. The panic subsided within days as the BoJ signaled caution, and US economic data remained resilient.",
    type: 'correction',
    tags: ['yen carry trade', 'Bank of Japan', 'VIX spike', 'August 5', '2024'],
    assetPerf: { gold: -0.5, bonds: +3.2, btc: -26.0 },
  },
  {
    id: 13,
    name: '2025 Tariff Shock',
    startDate: '2025-02-19',
    endDate: '2025-04-08',
    recoveryDate: '2025-07-14',
    peakValue: 6144.15,
    troughValue: 4982.77,
    drawdown: -18.9,
    durationDays: 48,
    recoveryDays: 97,
    categories: ['geopolitical', 'political'],
    cause:
      "The Trump administration's sweeping 'Liberation Day' tariff announcement on April 2, 2025 — imposing tariffs of 10–54% on virtually all trading partners — triggered the steepest short-term market reaction since COVID-19.",
    description:
      "On April 2, 2025, the US announced sweeping tariffs on virtually all trading partners, triggering the most severe short-term market shock since COVID-19. Over two days, the S&P 500 fell nearly 10%. A 90-day pause on reciprocal tariffs announced April 9 sparked a single-day rally of over 9.5%. Despite the rapid partial recovery, ongoing trade war uncertainty kept markets volatile. The US-China trade conflict dominated sentiment throughout the episode.",
    type: 'correction',
    tags: ['tariffs', 'trade war', 'Liberation Day', 'Trump', '2025'],
    assetPerf: { gold: +8.5, bonds: +4.2, btc: -12.0 },
  },
]

/**
 * Auto-detects any ongoing or recent downturn not covered by the curated list.
 * Pass currentFedRate and currentCape to enrich the description with macro context.
 */
export function detectOngoingDownturn(
  data: DataPoint[],
  currentFedRate?: number,
  currentCape?: number,
): Downturn | null {
  if (data.length < 6) return null

  const lastCurated = DOWNTURNS[DOWNTURNS.length - 1]
  const cutoffDate  = lastCurated.recoveryDate ?? lastCurated.endDate
  const recent      = data.filter((d) => d.date >= cutoffDate)
  if (recent.length < 3) return null

  // Find the peak since recovery
  let peak = recent[0]
  for (const p of recent) {
    if (p.close > peak.close) peak = p
  }

  // Find the trough after the peak
  const afterPeak = recent.filter((d) => d.date >= peak.date)
  if (afterPeak.length < 2) return null

  let trough = afterPeak[0]
  for (const p of afterPeak) {
    if (p.close < trough.close) trough = p
  }

  const drawdownPct = ((trough.close - peak.close) / peak.close) * 100
  if (drawdownPct > -5) return null

  const latest     = recent[recent.length - 1]
  const currentPct = ((latest.close - peak.close) / peak.close) * 100
  const isOngoing  = latest.date === trough.date || currentPct < -4

  const duration  = daysBetween(peak.date, trough.date)
  const eventType = drawdownPct < -20 ? 'bear_market' : 'correction'
  const typeLabel = drawdownPct < -20 ? 'Bear Market' : 'Correction'
  const name      = isOngoing
    ? `Ongoing ${typeLabel}`
    : `${formatDateShort(peak.date)} Auto-detected ${typeLabel}`

  // Infer likely macro categories from timing and current conditions
  const inferredCategories: DownturnCategory[] = []
  const peakYear = parseInt(peak.date.substring(0, 4))
  if (peakYear >= 2024)                                     inferredCategories.push('geopolitical')
  if (currentFedRate !== undefined && currentFedRate > 3.5) inferredCategories.push('inflation_rates')
  if (peakYear === 2022 || peakYear === 2023)               inferredCategories.push('inflation_rates')
  // de-duplicate
  const seen = new Set<string>()
  const uniqueCats = inferredCategories.filter((c) => {
    if (seen.has(c)) return false
    seen.add(c)
    return true
  }) as DownturnCategory[]

  // Macro context snippet for description
  const macroContext: string[] = []
  if (currentFedRate !== undefined)
    macroContext.push(`Fed rate: ${currentFedRate.toFixed(2)}%`)
  if (currentCape !== undefined)
    macroContext.push(`CAPE P/E: ${currentCape.toFixed(1)}x${currentCape > 30 ? ' (elevated)' : ''}`)

  const macroSuffix = macroContext.length > 0
    ? ` Current macro conditions — ${macroContext.join(' · ')}.`
    : ''

  const description = isOngoing
    ? `The S&P 500 is currently ${Math.abs(drawdownPct).toFixed(1)}% below its recent peak of ${peak.close.toLocaleString()} reached on ${formatDateShort(peak.date)}. The interim trough of ${trough.close.toLocaleString()} was hit on ${formatDateShort(trough.date)}.${macroSuffix} Full root-cause analysis will be added once the event concludes.`
    : `The S&P 500 fell ${Math.abs(drawdownPct).toFixed(1)}% from ${peak.close.toLocaleString()} (${formatDateShort(peak.date)}) to ${trough.close.toLocaleString()} (${formatDateShort(trough.date)}) over ${duration} days. Recovery is underway.${macroSuffix}`

  return {
    id: 99,
    name,
    startDate: peak.date,
    endDate: trough.date,
    recoveryDate: null,
    peakValue: peak.close,
    troughValue: trough.close,
    drawdown: Math.round(drawdownPct * 10) / 10,
    durationDays: duration,
    recoveryDays: null,
    description,
    cause: 'Cause analysis pending — auto-detected from live market data.',
    type: eventType,
    tags: ['auto-detected', isOngoing ? 'ongoing' : 'recent'],
    categories: uniqueCats,
    isOngoing,
    isAutoDetected: true,
  }
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid    = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function avgOf(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

export function computeStats(allDownturns: Downturn[]): SP500Stats {
  const curated     = allDownturns.filter((d) => !d.isAutoDetected)
  const bearMarkets = curated.filter((d) => d.type === 'bear_market')
  const corrections = curated.filter((d) => d.type === 'correction')

  const drawdowns  = curated.map((d) => d.drawdown)
  const durations  = curated.map((d) => d.durationDays)
  const recoveries = curated.filter((d) => d.recoveryDays !== null).map((d) => d.recoveryDays as number)

  // Per-type averages
  const bearRecoveries = bearMarkets.filter((d) => d.recoveryDays !== null).map((d) => d.recoveryDays as number)
  const corrRecoveries = corrections.filter((d) => d.recoveryDays !== null).map((d) => d.recoveryDays as number)

  const worstDrawdown   = [...curated].sort((a, b) => a.drawdown - b.drawdown)[0]
  const longestDuration = [...curated].sort((a, b) => b.durationDays - a.durationDays)[0]
  const quickestRecovery = [...curated]
    .filter((d) => d.recoveryDays !== null)
    .sort((a, b) => (a.recoveryDays as number) - (b.recoveryDays as number))[0]

  // Average time between events (inter-arrival in days)
  const sorted = [...curated].sort((a, b) => a.startDate.localeCompare(b.startDate))
  let gapAllTotal = 0
  for (let i = 1; i < sorted.length; i++) {
    gapAllTotal += daysBetween(sorted[i - 1].startDate, sorted[i].startDate)
  }
  const avgDaysBetweenAll = sorted.length > 1 ? gapAllTotal / (sorted.length - 1) : 0

  const sortedBears = sorted.filter((d) => d.type === 'bear_market')
  let gapBearTotal = 0
  for (let i = 1; i < sortedBears.length; i++) {
    gapBearTotal += daysBetween(sortedBears[i - 1].startDate, sortedBears[i].startDate)
  }
  const avgDaysBetweenBears = sortedBears.length > 1 ? gapBearTotal / (sortedBears.length - 1) : 0

  return {
    totalEvents: curated.length,
    bearMarkets: bearMarkets.length,
    corrections: corrections.length,

    avgDrawdown:    avgOf(drawdowns),
    avgDuration:    avgOf(durations),
    medianDrawdown: median(drawdowns),
    medianDuration: median(durations),
    avgRecoveryDays: avgOf(recoveries),

    bearAvgDrawdown: avgOf(bearMarkets.map((d) => d.drawdown)),
    bearAvgDuration: avgOf(bearMarkets.map((d) => d.durationDays)),
    bearAvgRecovery: avgOf(bearRecoveries),

    corrAvgDrawdown: avgOf(corrections.map((d) => d.drawdown)),
    corrAvgDuration: avgOf(corrections.map((d) => d.durationDays)),
    corrAvgRecovery: avgOf(corrRecoveries),

    avgDaysBetweenAll,
    avgDaysBetweenBears,
    worstDrawdown,
    longestDuration,
    quickestRecovery,
  }
}
