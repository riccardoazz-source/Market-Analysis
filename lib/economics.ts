import { EcoPoint, EcoIndicator } from './types'

// ─── Fed Funds Rate (upper bound of target range) ─────────────────────────────
// Format: [YYYY-MM-DD, rate%]  — forward-filled between entries

const FED_RATE_RAW: [string, number][] = [
  // 1987-1992: tightening then easing
  ['1987-01-01', 6.00], ['1987-04-01', 6.50], ['1987-09-01', 7.25],
  ['1988-03-01', 6.50], ['1988-08-01', 7.75], ['1988-11-01', 8.25],
  ['1989-02-01', 9.75], ['1989-06-01', 9.50], ['1989-10-01', 8.50],
  ['1990-07-01', 8.00], ['1990-10-01', 7.75], ['1991-01-01', 6.50],
  ['1991-04-01', 5.75], ['1991-08-01', 5.50], ['1991-10-01', 5.00],
  ['1991-12-01', 4.00], ['1992-04-01', 3.75], ['1992-07-01', 3.25],
  ['1992-09-01', 3.00],
  // 1994-1995: tightening cycle
  ['1994-02-01', 3.25], ['1994-03-01', 3.50], ['1994-05-01', 4.25],
  ['1994-08-01', 4.75], ['1994-11-01', 5.50], ['1995-02-01', 6.00],
  ['1995-07-01', 5.75], ['1996-01-01', 5.50], ['1996-02-01', 5.25],
  // 1997-2001: dot-com era
  ['1997-03-01', 5.50], ['1998-09-01', 5.25], ['1998-10-01', 5.00],
  ['1998-11-01', 4.75], ['1999-06-01', 5.00], ['1999-08-01', 5.25],
  ['1999-11-01', 5.50], ['2000-02-01', 5.75], ['2000-03-01', 6.00],
  ['2000-05-01', 6.50],
  // 2001-2003: post-dot-com easing
  ['2001-01-01', 6.00], ['2001-03-01', 5.50], ['2001-04-01', 4.50],
  ['2001-06-01', 3.75], ['2001-08-01', 3.50], ['2001-09-01', 3.00],
  ['2001-10-01', 2.50], ['2001-11-01', 2.00], ['2001-12-01', 1.75],
  ['2002-11-01', 1.25], ['2003-06-01', 1.00],
  // 2004-2006: tightening cycle
  ['2004-06-01', 1.25], ['2004-08-01', 1.50], ['2004-09-01', 1.75],
  ['2004-11-01', 2.00], ['2004-12-01', 2.25], ['2005-02-01', 2.50],
  ['2005-03-01', 2.75], ['2005-05-01', 3.00], ['2005-06-01', 3.25],
  ['2005-08-01', 3.50], ['2005-09-01', 3.75], ['2005-11-01', 4.00],
  ['2005-12-01', 4.25], ['2006-01-01', 4.50], ['2006-03-01', 4.75],
  ['2006-05-01', 5.00], ['2006-06-01', 5.25],
  // 2007-2008: GFC easing
  ['2007-09-01', 4.75], ['2007-10-01', 4.50], ['2007-11-01', 4.25],
  ['2007-12-01', 4.25], ['2008-01-01', 3.50], ['2008-01-22', 3.00],
  ['2008-03-01', 2.25], ['2008-04-01', 2.00], ['2008-10-01', 1.50],
  ['2008-10-29', 1.00], ['2008-12-01', 0.25],
  // 2009-2015: zero lower bound
  ['2009-01-01', 0.25], ['2010-01-01', 0.25], ['2011-01-01', 0.25],
  ['2012-01-01', 0.25], ['2013-01-01', 0.25], ['2014-01-01', 0.25],
  ['2015-01-01', 0.25],
  // 2015-2018: gradual tightening
  ['2015-12-01', 0.50], ['2016-12-01', 0.75], ['2017-03-01', 1.00],
  ['2017-06-01', 1.25], ['2017-12-01', 1.50], ['2018-03-01', 1.75],
  ['2018-06-01', 2.00], ['2018-09-01', 2.25], ['2018-12-01', 2.50],
  // 2019: mid-cycle cuts
  ['2019-08-01', 2.25], ['2019-09-01', 2.00], ['2019-10-01', 1.75],
  // 2020: COVID emergency cuts
  ['2020-03-01', 1.00], ['2020-03-15', 0.25],
  // 2021: hold at zero
  ['2021-01-01', 0.25], ['2021-06-01', 0.25], ['2021-12-01', 0.25],
  // 2022: fastest tightening since 1980s
  ['2022-03-01', 0.50], ['2022-05-01', 1.00], ['2022-06-01', 1.75],
  ['2022-07-01', 2.50], ['2022-09-01', 3.25], ['2022-11-01', 4.00],
  ['2022-12-01', 4.50],
  // 2023: continued tightening to peak
  ['2023-02-01', 4.75], ['2023-03-01', 5.00], ['2023-05-01', 5.25],
  ['2023-07-01', 5.50],
  // 2024-2025: easing cycle (user-provided dates)
  ['2024-01-01', 5.50], ['2024-06-01', 5.50],
  ['2024-09-19', 4.75], ['2024-11-08', 4.50], ['2024-12-19', 4.25],
  ['2025-01-01', 4.25], ['2025-06-01', 4.25],
  ['2025-09-18', 4.00], ['2025-10-30', 3.75], ['2025-12-11', 3.50],
  ['2026-01-01', 3.50], ['2026-04-01', 3.50],
]

// ─── Shiller CAPE P/E Ratio ───────────────────────────────────────────────────

const PE_RATIO_RAW: [string, number][] = [
  // 1987-1999
  ['1987-01-01', 14.7], ['1987-08-01', 18.3], ['1987-10-01', 11.5],
  ['1987-12-01', 14.1], ['1988-12-01', 14.8], ['1989-12-01', 17.7],
  ['1990-07-01', 16.5], ['1990-10-01', 14.8], ['1991-12-01', 19.7],
  ['1992-12-01', 20.2], ['1993-12-01', 21.3], ['1994-12-01', 20.0],
  ['1995-12-01', 26.0], ['1996-12-01', 28.2], ['1997-12-01', 32.9],
  ['1998-07-01', 37.0], ['1998-10-01', 28.6], ['1998-12-01', 36.9],
  ['1999-06-01', 40.6], ['1999-12-01', 43.8],
  // 2000-2009: dot-com and GFC
  ['2000-01-01', 43.0], ['2000-03-01', 44.2], ['2000-12-01', 36.4],
  ['2001-09-01', 27.0], ['2001-12-01', 30.7], ['2002-06-01', 24.5],
  ['2002-10-01', 21.1], ['2002-12-01', 22.7], ['2003-12-01', 25.2],
  ['2004-12-01', 26.4], ['2005-12-01', 26.6], ['2006-12-01', 27.6],
  ['2007-10-01', 27.2], ['2007-12-01', 25.2], ['2008-06-01', 20.2],
  ['2008-10-01', 14.9], ['2008-12-01', 15.2], ['2009-03-01', 13.3],
  ['2009-06-01', 15.6], ['2009-12-01', 20.5],
  // 2010-2019: bull market
  ['2010-04-01', 22.0], ['2010-07-01', 20.4], ['2010-12-01', 22.0],
  ['2011-04-01', 23.4], ['2011-10-01', 19.3], ['2011-12-01', 20.2],
  ['2012-12-01', 21.3], ['2013-12-01', 26.0], ['2014-12-01', 27.2],
  ['2015-05-01', 27.3], ['2015-08-01', 24.4], ['2016-02-01', 24.2],
  ['2016-12-01', 27.9], ['2017-12-01', 33.0], ['2018-01-01', 35.2],
  ['2018-09-01', 33.3], ['2018-12-01', 27.0], ['2019-04-01', 29.5],
  ['2019-12-01', 30.5],
  // 2020-2025
  ['2020-01-01', 31.3], ['2020-02-01', 32.2], ['2020-03-01', 24.8],
  ['2020-06-01', 28.4], ['2020-08-01', 31.8], ['2020-12-01', 33.6],
  ['2021-06-01', 37.4], ['2021-11-01', 39.9], ['2021-12-01', 38.3],
  ['2022-01-01', 39.2], ['2022-04-01', 33.6], ['2022-06-01', 29.0],
  ['2022-10-01', 27.5], ['2022-12-01', 28.0], ['2023-04-01', 29.5],
  ['2023-07-01', 30.8], ['2023-10-01', 28.5], ['2023-12-01', 31.7],
  ['2024-01-01', 32.0], ['2024-03-01', 34.5], ['2024-06-01', 35.4],
  ['2024-09-01', 36.6], ['2024-12-01', 38.4], ['2025-01-01', 38.1],
  ['2025-02-01', 37.8], ['2025-03-01', 35.2], ['2025-04-01', 31.5],
  ['2025-07-01', 33.5], ['2025-11-01', 35.8], ['2025-12-01', 34.9],
  ['2026-01-01', 33.0], ['2026-02-01', 30.5], ['2026-03-01', 28.8],
  ['2026-04-01', 27.5],
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Forward-fills sparse data points to a monthly grid between startDate and endDate.
 */
function forwardFill(raw: [string, number][], allDates: string[]): EcoPoint[] {
  const sorted = [...raw].sort((a, b) => a[0].localeCompare(b[0]))
  const result: EcoPoint[] = []
  let lastValue: number | null = null

  for (const date of allDates) {
    // Apply all raw entries up to and including this date
    for (const [d, v] of sorted) {
      if (d <= date) lastValue = v
    }
    if (lastValue !== null) {
      result.push({ date, timestamp: new Date(date).getTime(), value: lastValue })
    }
  }
  return result
}

/**
 * Linear interpolation for smoother indicators (PE, concentration).
 */
function interpolate(raw: [string, number][], allDates: string[]): EcoPoint[] {
  const sorted = [...raw].sort((a, b) => a[0].localeCompare(b[0]))
  const result: EcoPoint[] = []

  for (const date of allDates) {
    const before = sorted.filter(([d]) => d <= date)
    const after  = sorted.filter(([d]) => d > date)

    if (before.length === 0) continue

    if (after.length === 0) {
      const [, v] = before[before.length - 1]
      result.push({ date, timestamp: new Date(date).getTime(), value: Math.round(v * 10) / 10 })
      continue
    }

    const [d1, v1] = before[before.length - 1]
    const [d2, v2] = after[0]
    const t1 = new Date(d1).getTime()
    const t2 = new Date(d2).getTime()
    const t  = new Date(date).getTime()
    const ratio = (t - t1) / (t2 - t1)
    const v = v1 + (v2 - v1) * ratio
    result.push({ date, timestamp: new Date(date).getTime(), value: Math.round(v * 10) / 10 })
  }
  return result
}

// ─── US Real GDP level (billions of chained 2017 dollars, quarterly, FRED GDPC1) ─

const REAL_GDP_STATIC: [string, number][] = [
  ['1987-01-01', 8086],  ['1987-04-01', 8196],  ['1987-07-01', 8304],  ['1987-10-01', 8408],
  ['1988-01-01', 8472],  ['1988-04-01', 8598],  ['1988-07-01', 8685],  ['1988-10-01', 8773],
  ['1989-01-01', 8847],  ['1989-04-01', 8943],  ['1989-07-01', 9000],  ['1989-10-01', 9053],
  ['1990-01-01', 9082],  ['1990-04-01', 9098],  ['1990-07-01', 9078],  ['1990-10-01', 8970],
  ['1991-01-01', 8948],  ['1991-04-01', 8964],  ['1991-07-01', 9054],  ['1991-10-01', 9147],
  ['1992-01-01', 9246],  ['1992-04-01', 9331],  ['1992-07-01', 9428],  ['1992-10-01', 9565],
  ['1993-01-01', 9521],  ['1993-04-01', 9617],  ['1993-07-01', 9699],  ['1993-10-01', 9844],
  ['1994-01-01', 9895],  ['1994-04-01', 10049], ['1994-07-01', 10177], ['1994-10-01', 10305],
  ['1995-01-01', 10314], ['1995-04-01', 10362], ['1995-07-01', 10506], ['1995-10-01', 10567],
  ['1996-01-01', 10699], ['1996-04-01', 10882], ['1996-07-01', 10992], ['1996-10-01', 11089],
  ['1997-01-01', 11279], ['1997-04-01', 11450], ['1997-07-01', 11559], ['1997-10-01', 11720],
  ['1998-01-01', 11814], ['1998-04-01', 11971], ['1998-07-01', 12097], ['1998-10-01', 12271],
  ['1999-01-01', 12378], ['1999-04-01', 12530], ['1999-07-01', 12680], ['1999-10-01', 12822],
  ['2000-01-01', 12924], ['2000-04-01', 12997], ['2000-07-01', 13033], ['2000-10-01', 12995],
  ['2001-01-01', 13002], ['2001-04-01', 12958], ['2001-07-01', 12948], ['2001-10-01', 12961],
  ['2002-01-01', 13060], ['2002-04-01', 13134], ['2002-07-01', 13205], ['2002-10-01', 13298],
  ['2003-01-01', 13323], ['2003-04-01', 13444], ['2003-07-01', 13629], ['2003-10-01', 13872],
  ['2004-01-01', 13908], ['2004-04-01', 14010], ['2004-07-01', 14093], ['2004-10-01', 14253],
  ['2005-01-01', 14329], ['2005-04-01', 14465], ['2005-07-01', 14567], ['2005-10-01', 14693],
  ['2006-01-01', 14715], ['2006-04-01', 14789], ['2006-07-01', 14863], ['2006-10-01', 14966],
  ['2007-01-01', 15006], ['2007-04-01', 15082], ['2007-07-01', 15129], ['2007-10-01', 15241],
  ['2008-01-01', 14991], ['2008-04-01', 15025], ['2008-07-01', 14855], ['2008-10-01', 14578],
  ['2009-01-01', 14355], ['2009-04-01', 14313], ['2009-07-01', 14443], ['2009-10-01', 14619],
  ['2010-01-01', 14711], ['2010-04-01', 14854], ['2010-07-01', 14941], ['2010-10-01', 15065],
  ['2011-01-01', 15020], ['2011-04-01', 15052], ['2011-07-01', 15176], ['2011-10-01', 15327],
  ['2012-01-01', 15427], ['2012-04-01', 15508], ['2012-07-01', 15597], ['2012-10-01', 15703],
  ['2013-01-01', 15762], ['2013-04-01', 15901], ['2013-07-01', 15981], ['2013-10-01', 16154],
  ['2014-01-01', 15989], ['2014-04-01', 16225], ['2014-07-01', 16369], ['2014-10-01', 16547],
  ['2015-01-01', 16616], ['2015-04-01', 16715], ['2015-07-01', 16795], ['2015-10-01', 16878],
  ['2016-01-01', 16849], ['2016-04-01', 16966], ['2016-07-01', 17084], ['2016-10-01', 17185],
  ['2017-01-01', 17265], ['2017-04-01', 17434], ['2017-07-01', 17617], ['2017-10-01', 17821],
  ['2018-01-01', 17895], ['2018-04-01', 18073], ['2018-07-01', 18323], ['2018-10-01', 18498],
  ['2019-01-01', 18607], ['2019-04-01', 18774], ['2019-07-01', 19024], ['2019-10-01', 19254],
  ['2020-01-01', 18951], ['2020-04-01', 17258], ['2020-07-01', 18596], ['2020-10-01', 18794],
  ['2021-01-01', 19087], ['2021-04-01', 19477], ['2021-07-01', 19744], ['2021-10-01', 20015],
  ['2022-01-01', 19735], ['2022-04-01', 19923], ['2022-07-01', 20189], ['2022-10-01', 20510],
  ['2023-01-01', 20715], ['2023-04-01', 21006], ['2023-07-01', 21364], ['2023-10-01', 21675],
  ['2024-01-01', 21905], ['2024-04-01', 22111], ['2024-07-01', 22465], ['2024-10-01', 22754],
  ['2025-01-01', 22900], ['2025-04-01', 23050], ['2025-07-01', 23200], ['2025-10-01', 23350],
  ['2026-01-01', 23500],
]

// ─── US CPI Inflation (YoY %) ─────────────────────────────────────────────────

const CPI_YOY_RAW: [string, number][] = [
  ['1987-01-01', 1.5],  ['1987-06-01', 3.6],  ['1987-12-01', 4.4],
  ['1988-06-01', 4.0],  ['1988-12-01', 4.4],  ['1989-06-01', 5.1],
  ['1989-12-01', 4.6],  ['1990-06-01', 4.7],  ['1990-12-01', 6.1],
  ['1991-06-01', 4.7],  ['1991-12-01', 3.1],  ['1992-06-01', 3.1],
  ['1992-12-01', 2.9],  ['1993-06-01', 3.0],  ['1993-12-01', 2.7],
  ['1994-06-01', 2.5],  ['1994-12-01', 2.7],  ['1995-06-01', 3.0],
  ['1995-12-01', 2.5],  ['1996-06-01', 2.8],  ['1996-12-01', 3.3],
  ['1997-06-01', 2.3],  ['1997-12-01', 1.7],  ['1998-06-01', 1.7],
  ['1998-12-01', 1.6],  ['1999-06-01', 2.0],  ['1999-12-01', 2.7],
  ['2000-06-01', 3.7],  ['2000-12-01', 3.4],  ['2001-06-01', 2.9],
  ['2001-12-01', 1.6],  ['2002-06-01', 1.1],  ['2002-12-01', 2.4],
  ['2003-06-01', 2.1],  ['2003-12-01', 1.9],  ['2004-06-01', 3.3],
  ['2004-12-01', 3.3],  ['2005-06-01', 2.5],  ['2005-12-01', 3.4],
  ['2006-06-01', 4.3],  ['2006-12-01', 2.5],  ['2007-06-01', 2.7],
  ['2007-12-01', 4.1],  ['2008-03-01', 4.0],  ['2008-07-01', 5.6],
  ['2008-12-01', 0.1],  ['2009-03-01', -0.4], ['2009-06-01', -1.4],
  ['2009-09-01', -1.3], ['2009-12-01', 2.7],  ['2010-06-01', 1.1],
  ['2010-12-01', 1.5],  ['2011-06-01', 3.6],  ['2011-09-01', 3.9],
  ['2011-12-01', 3.0],  ['2012-06-01', 1.7],  ['2012-12-01', 1.7],
  ['2013-06-01', 1.8],  ['2013-12-01', 1.5],  ['2014-06-01', 2.1],
  ['2014-12-01', 0.8],  ['2015-06-01', 0.1],  ['2015-12-01', 0.7],
  ['2016-06-01', 1.0],  ['2016-12-01', 2.1],  ['2017-06-01', 1.6],
  ['2017-12-01', 2.1],  ['2018-06-01', 2.9],  ['2018-09-01', 2.3],
  ['2018-12-01', 1.9],  ['2019-06-01', 1.6],  ['2019-12-01', 2.3],
  ['2020-01-01', 2.5],  ['2020-04-01', 0.3],  ['2020-06-01', 0.6],
  ['2020-12-01', 1.4],  ['2021-01-01', 1.4],  ['2021-03-01', 2.6],
  ['2021-06-01', 5.4],  ['2021-09-01', 5.4],  ['2021-12-01', 7.0],
  ['2022-02-01', 7.9],  ['2022-03-01', 8.5],  ['2022-06-01', 9.1],
  ['2022-08-01', 8.3],  ['2022-09-01', 8.2],  ['2022-10-01', 7.7],
  ['2022-12-01', 6.5],  ['2023-01-01', 6.4],  ['2023-03-01', 5.0],
  ['2023-06-01', 3.0],  ['2023-08-01', 3.7],  ['2023-09-01', 3.7],
  ['2023-12-01', 3.4],  ['2024-01-01', 3.1],  ['2024-03-01', 3.5],
  ['2024-06-01', 3.0],  ['2024-09-01', 2.4],  ['2024-12-01', 2.9],
  ['2025-01-01', 3.0],  ['2025-02-01', 2.8],  ['2025-03-01', 2.4],
  ['2026-04-01', 2.5],
]

// ─── WTI Crude Oil Price (USD/barrel) ─────────────────────────────────────────

const OIL_PRICE_RAW: [string, number][] = [
  ['1987-01-01', 18.0], ['1987-10-01', 20.0], ['1987-12-01', 17.0],
  ['1988-12-01', 16.0], ['1989-12-01', 20.0], ['1990-07-01', 25.0],
  ['1990-10-01', 41.0], ['1990-12-01', 27.0], ['1991-03-01', 20.0],
  ['1991-12-01', 19.5], ['1992-12-01', 19.0], ['1993-12-01', 14.5],
  ['1994-12-01', 17.0], ['1995-12-01', 19.0], ['1996-12-01', 25.0],
  ['1997-12-01', 18.5], ['1998-06-01', 13.0], ['1998-12-01', 11.0],
  ['1999-06-01', 17.0], ['1999-12-01', 26.0], ['2000-06-01', 32.0],
  ['2000-11-01', 35.0], ['2000-12-01', 26.0], ['2001-09-01', 26.0],
  ['2001-12-01', 19.0], ['2002-12-01', 29.0], ['2003-12-01', 32.0],
  ['2004-06-01', 38.0], ['2004-12-01', 43.0], ['2005-06-01', 59.0],
  ['2005-12-01', 61.0], ['2006-06-01', 71.0], ['2006-12-01', 61.0],
  ['2007-06-01', 65.0], ['2007-12-01', 96.0], ['2008-07-01', 145.0],
  ['2008-09-01', 95.0], ['2008-12-01', 41.0], ['2009-03-01', 48.0],
  ['2009-06-01', 70.0], ['2009-12-01', 79.0], ['2010-06-01', 75.0],
  ['2010-12-01', 91.0], ['2011-04-01', 113.0], ['2011-06-01', 102.0],
  ['2011-12-01', 98.0], ['2012-06-01', 84.0],  ['2012-12-01', 91.0],
  ['2013-06-01', 96.0], ['2013-12-01', 97.0],  ['2014-06-01', 107.0],
  ['2014-12-01', 59.0], ['2015-06-01', 61.0],  ['2015-12-01', 37.0],
  ['2016-02-01', 30.0], ['2016-06-01', 48.0],  ['2016-12-01', 54.0],
  ['2017-06-01', 46.0], ['2017-12-01', 60.0],  ['2018-06-01', 65.0],
  ['2018-10-01', 85.0], ['2018-12-01', 46.0],  ['2019-06-01', 57.0],
  ['2019-12-01', 63.0], ['2020-01-01', 63.0],  ['2020-03-01', 20.0],
  ['2020-04-01', 17.0], ['2020-06-01', 40.0],  ['2020-12-01', 49.0],
  ['2021-06-01', 72.0], ['2021-12-01', 74.0],  ['2022-03-01', 107.0],
  ['2022-06-01', 122.0], ['2022-12-01', 80.0], ['2023-06-01', 70.0],
  ['2023-12-01', 71.0], ['2024-04-01', 86.0],  ['2024-09-01', 72.0],
  ['2024-12-01', 70.0], ['2025-03-01', 68.0],  ['2025-04-01', 62.0],
  ['2026-04-01', 65.0],
]

// ─── Public API ───────────────────────────────────────────────────────────────

let _cachedDates: string[] | null = null

/** Generate a monthly date grid from 1987-01 to today */
function getMonthlyDates(): string[] {
  if (_cachedDates) return _cachedDates
  const dates: string[] = []
  const start = new Date('1987-01-01')
  const end   = new Date()
  end.setDate(1)
  const cur = new Date(start)
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0])
    cur.setMonth(cur.getMonth() + 1)
  }
  _cachedDates = dates
  return dates
}

/** Static fallback (sync) */
export function getEcoData(indicator: EcoIndicator): EcoPoint[] {
  const dates = getMonthlyDates()
  switch (indicator) {
    case 'fed_rate':      return forwardFill(FED_RATE_RAW, dates)
    case 'pe_ratio':      return interpolate(PE_RATIO_RAW, dates)
    case 'inflation_cpi': return interpolate(CPI_YOY_RAW, dates)
    case 'oil_price':     return interpolate(OIL_PRICE_RAW, dates)
    case 'real_gdp':      return interpolate(REAL_GDP_STATIC, dates)
  }
}

// ─── Live data fetchers ───────────────────────────────────────────────────────

/**
 * Fetch a FRED CSV series (no API key required for public series).
 * Returns a date→value map.
 */
async function fetchFREDCSV(seriesId: string): Promise<Map<string, number>> {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`
  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; market-analysis-app/1.0)',
      Accept: 'text/csv',
    },
    next: { revalidate: 86400 }, // daily
  })
  if (!res.ok) throw new Error(`FRED ${res.status} for ${seriesId}`)
  const text  = await res.text()
  const lines = text.trim().split('\n').slice(1)
  const map   = new Map<string, number>()
  for (const line of lines) {
    const [date, val] = line.split(',')
    const v = parseFloat(val?.trim() ?? '')
    if (!isNaN(v)) map.set(date.trim(), v)
  }
  return map
}

/** Fetch live Fed Funds Rate from FRED (FEDFUNDS monthly series) */
async function fetchLiveFedRate(): Promise<EcoPoint[]> {
  const raw = await fetchFREDCSV('FEDFUNDS')
  const entries = Array.from(raw.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  return entries.map(([date, value]) => ({
    date,
    timestamp: new Date(date).getTime(),
    value: Math.round(value * 100) / 100,
  }))
}

/** Fetch live CPI from FRED (CPIAUCSL) and compute YoY % */
async function fetchLiveCPI(): Promise<EcoPoint[]> {
  const raw     = await fetchFREDCSV('CPIAUCSL')
  const entries = Array.from(raw.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  const result: EcoPoint[] = []
  for (let i = 12; i < entries.length; i++) {
    const [date, curr] = entries[i]
    const [, prev]     = entries[i - 12]
    const yoy = ((curr / prev) - 1) * 100
    result.push({ date, timestamp: new Date(date).getTime(), value: Math.round(yoy * 10) / 10 })
  }
  return result
}

/** Fetch live Real GDP from FRED (GDPC1 quarterly) — returns raw level in billions of chained 2017 dollars */
async function fetchLiveRealGDP(): Promise<EcoPoint[]> {
  const raw     = await fetchFREDCSV('GDPC1')
  const entries = Array.from(raw.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  return entries.map(([date, value]) => ({
    date,
    timestamp: new Date(date).getTime(),
    value: Math.round(value),
  }))
}

/** Fetch live Shiller CAPE P/E from Yale's public CSV */
async function fetchLiveCAPE(): Promise<EcoPoint[]> {
  const url = 'https://shiller.econ.yale.edu/data/ie_data.csv'
  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; market-analysis-app/1.0)',
      Accept: 'text/csv,text/plain',
    },
    next: { revalidate: 86400 },
  })
  if (!res.ok) throw new Error(`Shiller CSV ${res.status}`)
  const text  = await res.text()
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  // Find header row (first col = "Date") and locate CAPE column
  let headerIdx = -1
  let capeIdx   = -1
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const cols = lines[i].split(',')
    if (/^date$/i.test(cols[0]?.trim() ?? '')) {
      headerIdx = i
      capeIdx   = cols.findIndex((c) => /cape|p\/e10|pe10/i.test(c.trim()))
      break
    }
  }
  // Fallback: column 12 is CAPE in the standard Shiller layout
  if (headerIdx < 0) { headerIdx = 7; capeIdx = 12 }
  if (capeIdx   < 0)   capeIdx = 12

  const result: EcoPoint[] = []
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols    = lines[i].split(',')
    const dateStr = cols[0]?.trim() ?? ''
    const capeStr = cols[capeIdx]?.trim() ?? ''
    if (!dateStr || !capeStr || capeStr === '.') continue

    // Date format: YYYY.MM or YYYY.M
    const m = dateStr.match(/^(\d{4})\.(\d{1,2})/)
    if (!m) continue
    const date = `${m[1]}-${m[2].padStart(2, '0')}-01`
    if (date < '1987-01-01') continue

    const cape = parseFloat(capeStr)
    if (!isNaN(cape) && cape > 0 && cape < 100) {
      result.push({ date, timestamp: new Date(date).getTime(), value: Math.round(cape * 10) / 10 })
    }
  }
  return result.sort((a, b) => a.date.localeCompare(b.date))
}

/** Fetch live WTI Crude Oil from Yahoo Finance (CL=F) */
async function fetchLiveOil(): Promise<EcoPoint[]> {
  const symbol = encodeURIComponent('CL=F')
  const from   = Math.floor(new Date('1987-01-01').getTime() / 1000)
  const to     = Math.floor(Date.now() / 1000)
  const url    = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1mo&period1=${from}&period2=${to}`

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
  if (!res.ok) throw new Error(`Yahoo Finance ${res.status} for CL=F`)
  const json   = await res.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error('No chart result for CL=F')

  const timestamps: number[]          = result.timestamp ?? []
  const closes: (number | null)[]     =
    result.indicators?.adjclose?.[0]?.adjclose ??
    result.indicators?.quote?.[0]?.close ?? []

  return timestamps
    .map((ts, i) => {
      const c = closes[i]
      if (c == null || c <= 0) return null
      const date = new Date(ts * 1000).toISOString().split('T')[0]
      return { date, timestamp: new Date(date).getTime(), value: Math.round(c * 100) / 100 }
    })
    .filter((p): p is EcoPoint => p !== null)
}

/**
 * Async version — tries live FRED/Yahoo first, falls back to static data.
 * Use this in server components (page.tsx).
 */
export async function getEcoDataAsync(indicator: EcoIndicator): Promise<EcoPoint[]> {
  const staticFallback = getEcoData(indicator)
  try {
    switch (indicator) {
      case 'fed_rate':      return await fetchLiveFedRate()
      case 'inflation_cpi': return await fetchLiveCPI()
      case 'real_gdp':      return await fetchLiveRealGDP()
      case 'oil_price':     return await fetchLiveOil()
      case 'pe_ratio':      return await fetchLiveCAPE()
    }
  } catch {
    // Network unavailable, rate-limited, or unexpected format — return static data
    return staticFallback
  }
}
