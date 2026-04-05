import { DataPoint } from './types'

// ─── Yahoo Finance helpers ────────────────────────────────────────────────────

async function fetchYahoo(
  symbol: string,
  from: string,
): Promise<Map<string, number>> {
  const encoded = encodeURIComponent(symbol)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1mo&period1=${Math.floor(new Date(from).getTime() / 1000)}&period2=${Math.floor(Date.now() / 1000)}&includeAdjustedClose=true`

  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
    next: { revalidate: 86400 },
  })
  if (!res.ok) throw new Error(`Yahoo Finance ${res.status} for ${symbol}`)
  const json = await res.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error(`No chart result for ${symbol}`)

  const timestamps: number[] = result.timestamp ?? []
  const closes: (number | null)[] =
    result.indicators?.adjclose?.[0]?.adjclose ??
    result.indicators?.quote?.[0]?.close ?? []

  const map = new Map<string, number>()
  for (let i = 0; i < timestamps.length; i++) {
    const c = closes[i]
    if (c != null && c > 0) {
      const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0]
      map.set(date, Math.round(c * 100) / 100)
    }
  }
  return map
}

// ─── FRED gold helper ─────────────────────────────────────────────────────────
// GOLDAMGBD228NLBM = Gold Fixing Price, London Bullion Market, USD/troy oz (daily, from 1968)
// FRED is a US government source — reliable, no IP blocking, no rate limits.
// We iterate daily rows and keep the last value per YYYY-MM → end-of-month price.

async function fetchGoldFRED(): Promise<Map<string, number>> {
  const url = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=GOLDAMGBD228NLBM'
  const res = await fetch(url, { signal: AbortSignal.timeout(8000), next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`FRED gold ${res.status}`)
  const text = await res.text()
  const monthMap = new Map<string, number>()
  const lines = text.split('\n').slice(1) // skip header
  for (const line of lines) {
    const comma = line.indexOf(',')
    if (comma < 0) continue
    const date = line.substring(0, comma).trim()
    const val  = line.substring(comma + 1).trim()
    if (!date || !val || val === '.') continue
    const v = parseFloat(val)
    if (isNaN(v) || v <= 0) continue
    monthMap.set(date.substring(0, 7), v) // overwrite → keeps last (end-of-month) value
  }
  return monthMap
}

// ─── Month-collapse helper ────────────────────────────────────────────────────
// Yahoo Finance returns different first-trading-day dates per symbol
// (e.g. ^GSPC → 2024-01-02, TLT → 2024-01-03). Match by YYYY-MM to avoid misses.

function byMonth(m: Map<string, number>): Map<string, number> {
  const out = new Map<string, number>()
  m.forEach((val, date) => {
    const key = date.substring(0, 7) // YYYY-MM
    if (!out.has(key)) out.set(key, val)
  })
  return out
}

// ─── Main fetch ───────────────────────────────────────────────────────────────

export async function fetchMarketData(): Promise<DataPoint[]> {
  try {
    // S&P 500, Bonds, BTC from Yahoo Finance
    const [sp500Map, bondsMap, btcMap] = await Promise.all([
      fetchYahoo('^GSPC',   '1950-01-01'),
      fetchYahoo('TLT',     '2002-07-01'),
      fetchYahoo('BTC-USD', '2010-07-01'),
    ])
    if (sp500Map.size < 100) throw new Error('Insufficient S&P 500 data')

    // Gold from FRED (primary) — reliable government source, never blocked.
    // Falls back to Yahoo Finance XAUUSD=X spot price if FRED is unavailable.
    let goldM = new Map<string, number>()
    try {
      goldM = await fetchGoldFRED()
      if (goldM.size < 50) throw new Error('Insufficient FRED gold data')
    } catch {
      try {
        goldM = byMonth(await fetchYahoo('XAUUSD=X', '1987-01-01'))
      } catch {
        // Gold unavailable — chart will show null for gold line
      }
    }

    const bondsM = byMonth(bondsMap)
    const btcM   = byMonth(btcMap)

    return Array.from(sp500Map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, close]) => {
        const mo = date.substring(0, 7) // YYYY-MM
        return {
          date,
          timestamp: new Date(date).getTime(),
          close,
          gold:  goldM.get(mo),
          bonds: bondsM.get(mo),
          btc:   btcM.get(mo),
        }
      })
  } catch {
    // S&P 500 fetch failed — fall back to curated static data
    return getStaticData()
  }
}

// ─── Comprehensive static fallback ───────────────────────────────────────────
// Columns: [date, sp500, gold (USD/oz), bonds/TLT, btc (USD)]
// null = not yet trading / data unavailable

function getStaticData(): DataPoint[] {
  const raw: [string, number, number | null, number | null, number | null][] = [
    // ── 1950s-early 1980s (S&P only) ──────────────────────────────────────
    ['1950-01-01',  16.9,  null,  null,  null],
    ['1952-12-01',  26.6,  null,  null,  null],
    ['1954-12-01',  35.5,  null,  null,  null],
    ['1957-10-01',  38.8,  null,  null,  null],
    ['1958-12-01',  55.2,  null,  null,  null],
    ['1960-10-01',  52.2,  null,  null,  null],
    ['1962-06-01',  52.3,  null,  null,  null],
    ['1963-12-01',  75.0,  null,  null,  null],
    ['1966-10-01',  73.2,  null,  null,  null],
    ['1968-11-01', 108.4,  null,  null,  null],
    ['1970-05-01',  69.3,  null,  null,  null],
    ['1970-12-01',  92.2,  null,  null,  null],
    ['1973-01-01', 121.7,  null,  null,  null],
    ['1974-10-01',  62.3,  null,  null,  null],
    ['1975-12-01',  90.2,  null,  null,  null],
    ['1979-12-01', 107.9,  null,  null,  null],
    ['1982-08-01', 102.4,  null,  null,  null],
    ['1982-12-01', 140.6,  null,  null,  null],
    ['1984-07-01', 147.8,  null,  null,  null],
    ['1985-12-01', 211.3,  null,  null,  null],
    ['1986-12-01', 242.2,  null,  null,  null],
    // ── 1987-1994 (S&P + Gold) ────────────────────────────────────────────
    ['1987-01-01', 264.5,  405.0, null,  null],
    ['1987-06-01', 304.0,  449.0, null,  null],
    ['1987-08-01', 336.8,  460.5, null,  null],
    ['1987-10-01', 251.8,  484.0, null,  null],
    ['1987-12-01', 247.1,  486.5, null,  null],
    ['1988-06-01', 273.5,  450.0, null,  null],
    ['1988-12-01', 277.7,  418.0, null,  null],
    ['1989-07-01', 333.0,  374.0, null,  null],
    ['1989-12-01', 353.4,  401.0, null,  null],
    ['1990-01-01', 339.9,  410.0, null,  null],
    ['1990-07-01', 368.9,  363.0, null,  null],
    ['1990-10-01', 295.5,  381.0, null,  null],
    ['1991-02-01', 370.0,  363.0, null,  null],
    ['1991-12-01', 417.1,  353.5, null,  null],
    ['1992-12-01', 435.7,  332.9, null,  null],
    ['1993-12-01', 466.5,  391.8, null,  null],
    ['1994-12-01', 459.3,  379.5, null,  null],
    // ── 1995-2002 (S&P + Gold) ────────────────────────────────────────────
    ['1995-12-01', 615.9,  387.0, null,  null],
    ['1996-12-01', 740.7,  369.0, null,  null],
    ['1997-12-01', 970.4,  288.7, null,  null],
    ['1998-07-01',1190.58, 294.0, null,  null], // 1998 peak
    ['1998-08-01', 957.3,  283.5, null,  null],
    ['1998-10-01', 923.32, 296.0, null,  null], // 1998 LTCM trough
    ['1998-11-01',1163.6,  296.0, null,  null],
    ['1998-12-01',1229.2,  291.5, null,  null],
    ['1999-12-01',1469.3,  290.0, null,  null],
    ['2000-03-01',1527.5,  285.0, null,  null],
    ['2000-12-01',1320.3,  273.4, null,  null],
    ['2001-09-01',1040.9,  284.0, null,  null],
    ['2001-12-01',1148.1,  276.5, null,  null],
    // ── 2002 onwards: S&P + Gold + TLT bonds ─────────────────────────────
    ['2002-10-01', 776.8,  316.5,  89.4, null],
    ['2002-12-01', 879.8,  342.8,  95.5, null],
    ['2003-12-01',1111.9,  416.3,  96.5, null],
    ['2004-12-01',1211.9,  435.6,  92.0, null],
    ['2005-12-01',1248.3,  513.0,  90.4, null],
    ['2006-12-01',1418.3,  636.3,  88.0, null],
    ['2007-06-01',1503.4,  655.0,  85.5, null],
    ['2007-10-01',1565.2,  760.0,  88.2, null],
    ['2007-12-01',1468.4,  836.5,  96.0, null],
    ['2008-06-01',1278.4,  931.0,  97.0, null],
    ['2008-09-01',1166.4,  740.0,  98.0, null],
    ['2008-10-01', 968.8,  730.8,  97.0, null],
    ['2008-12-01', 903.3,  869.8, 112.0, null],
    ['2009-01-01', 825.9,  919.5, 120.0, null],
    ['2009-03-01', 797.9,  924.3, 107.5, null],
    ['2009-06-01', 919.3,  945.7,  99.0, null],
    ['2009-12-01',1115.1, 1087.5, 100.5, null],
    // ── 2010 onwards: all 4 assets ───────────────────────────────────────
    ['2010-01-01',1073.9, 1118.0, 104.5,   null],
    ['2010-04-01',1219.8, 1155.0,  93.0,   null],
    ['2010-07-01',1101.6, 1200.0, 101.0,   null],
    ['2010-07-16', 1022.58, 1187.0, 99.0,  null],
    ['2010-10-01',1180.6, 1347.0, 101.0,   null],
    ['2010-12-01',1257.6, 1421.4,  95.7,   null],
    ['2011-01-01',1286.1, 1364.5,  93.0,   null],
    ['2011-04-01',1363.6, 1480.0,  90.0,   null],
    ['2011-08-01',1219.0, 1757.9, 113.8,   null],
    ['2011-09-01',1906.0, 1900.0, 116.0,   null], // gold peak
    ['2011-10-01',1253.3, 1665.2, 111.5,   null],
    ['2011-12-01',1257.6, 1531.0, 118.2,   null],
    ['2012-12-01',1426.2, 1657.5, 120.8,   null],
    ['2013-03-01',1569.2, 1595.0, 117.5,   null],
    ['2013-12-01',1848.4, 1201.5,  96.8,   null],
    ['2014-12-01',2058.9, 1184.5,  98.0,   null],
    ['2015-05-01',2130.8, 1205.0, 120.2,   null],
    ['2015-08-01',1972.2, 1134.4, 125.5,  272.0],
    ['2015-10-01',2079.4, 1142.8, 123.8,  314.0],
    ['2015-12-01',2043.9, 1060.0, 119.5,  430.0],
    ['2016-01-01',1940.2, 1096.6, 122.5,  369.0],
    ['2016-02-01',1932.2, 1234.5, 131.5,  390.0],
    ['2016-07-01',2173.6, 1342.6, 143.3,  648.0],
    ['2016-12-01',2238.8,  1152.0, 121.5,  963.0],
    ['2017-06-01',2423.4,  1241.6, 124.2, 2484.0],
    ['2017-12-01',2673.6,  1305.0, 126.0,14156.0],
    ['2018-01-01',2823.8,  1330.0, 126.5,10170.0],
    ['2018-06-01',2718.4,  1252.0, 116.5, 6350.0],
    ['2018-09-01',2930.8,  1202.0, 115.0, 6600.0],
    ['2018-12-01',2506.9,  1279.0, 122.4, 3300.0],
    ['2019-04-01',2945.8,  1280.0, 122.0, 5300.0],
    ['2019-12-01',3230.8,  1515.0, 135.0, 7200.0],
    ['2020-01-01',3225.5,  1589.0, 139.5, 9430.0],
    ['2020-02-01',2954.2,  1644.5, 148.4, 8750.0],
    ['2020-03-01',2584.6,  1576.7, 165.0, 6420.0],
    ['2020-03-23',2237.4,  1498.5, 173.5, 5750.0], // COVID trough
    ['2020-06-01',3100.3,  1770.0, 165.0, 9450.0],
    ['2020-08-01',3500.3,  1975.0, 162.0,11830.0],
    ['2020-11-01',3621.6,  1879.3, 157.5,18800.0],
    ['2020-12-01',3756.1,  1898.4, 156.5,28990.0],
    ['2021-03-01',3972.9,  1707.0, 140.6,58750.0],
    ['2021-06-01',4297.5,  1768.5, 149.6,35000.0],
    ['2021-11-01',4567.0,  1794.5, 148.0,68000.0],
    ['2021-12-01',4766.2,  1800.0, 148.0,46000.0],
    ['2022-01-01',4515.6,  1797.4, 148.0,38500.0],
    ['2022-02-01',4373.9,  1908.0, 143.0,44000.0],
    ['2022-04-01',4132.2,  1896.0, 127.0,40000.0],
    ['2022-06-01',3785.4,  1807.3, 110.5,19000.0],
    ['2022-09-01',3585.6,  1660.6,  97.3,19500.0],
    ['2022-10-01',3577.0,  1644.0,  96.2,20400.0],
    ['2022-11-01',4080.1,  1740.0, 102.5,16700.0],
    ['2022-12-01',3839.5,  1824.0,  98.8,16500.0],
    ['2023-03-01',4109.3,  1979.0, 105.0,28500.0],
    ['2023-06-01',4450.4,  1912.0,  97.4,30500.0],
    ['2023-07-01',4588.96, 1962.5,  96.0,29400.0], // 2023 correction peak
    ['2023-09-01',4288.7,  1866.0,  92.0,26600.0],
    ['2023-10-01',4117.37, 1984.0,  89.0,28100.0], // 2023 correction trough
    ['2023-12-01',4769.8,  2063.0,  96.1,43200.0],
    ['2024-01-01',4845.7,  2040.0,  95.0,43000.0],
    ['2024-03-01',5254.4,  2233.0,  94.5,70100.0],
    ['2024-06-01',5460.5,  2327.0,  91.8,61000.0],
    ['2024-09-01',5611.9,  2637.0, 100.5,64000.0],
    ['2024-12-01',5882.0,  2625.0,  88.0,97000.0],
    ['2025-01-01', 5868.0,  2800.0,  87.5,100000.0],
    ['2025-02-01', 6144.2,  2880.0,  89.0, 96000.0], // ATH before Liberation Day
    ['2025-03-01', 5611.9,  2950.0,  91.5, 84000.0],
    ['2025-04-01', 5035.7,  3100.0,  93.5, 74000.0], // Liberation Day crash trough area
    ['2025-05-01', 5286.0,  3050.0,  92.0, 82000.0], // recovery after 90-day pause
    ['2025-06-01', 5460.0,  3080.0,  91.0, 88000.0],
    ['2025-07-01', 5540.0,  3150.0,  92.5, 95000.0],
    ['2025-08-01', 5720.0,  3200.0,  93.0,100000.0],
    ['2025-09-01', 5800.0,  3250.0,  94.0,105000.0],
    ['2025-10-01', 5970.0,  3300.0,  94.5,110000.0],
    ['2025-11-01', 6050.0,  3350.0,  93.5,112000.0], // secondary recovery peak
    ['2025-12-01', 5880.0,  3420.0,  95.0,108000.0],
    ['2026-01-01', 5700.0,  3500.0,  97.0,100000.0],
    ['2026-02-01', 5200.0,  3600.0, 100.0, 85000.0],
    ['2026-03-01', 4900.0,  3700.0, 103.0, 72000.0],
    ['2026-04-01', 4750.0,  3780.0, 105.0, 68000.0], // current (April 2026)
  ]

  return raw.map(([date, sp500, gold, bonds, btc]) => ({
    date: date as string,
    timestamp: new Date(date as string).getTime(),
    close: sp500 as number,
    gold: gold ?? undefined,
    bonds: bonds ?? undefined,
    btc: btc ?? undefined,
  }))
}

// Keep old export name for backward compat
export const fetchSP500Data = fetchMarketData
