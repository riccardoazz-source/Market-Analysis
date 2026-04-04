import { Suspense } from 'react'
import { fetchMarketData } from '@/lib/sp500'
import { DOWNTURNS, computeStats, detectOngoingDownturn } from '@/lib/downturns'
import { getEcoDataAsync } from '@/lib/economics'
import Dashboard from '@/components/Dashboard'
import ThemeToggle from '@/components/ThemeToggle'
import { EcoIndicator } from '@/lib/types'

export const revalidate = 3600

export default async function Home() {
  const marketData = await fetchMarketData()

  // Fetch live Fed rate + CAPE first so auto-detection uses real-time macro context
  const [liveFedData, liveCapeData] = await Promise.all([
    getEcoDataAsync('fed_rate'),
    getEcoDataAsync('pe_ratio'),
  ])
  const currentFedRate = liveFedData[liveFedData.length - 1]?.value
  const currentCape    = liveCapeData[liveCapeData.length - 1]?.value

  const ongoingDownturn = detectOngoingDownturn(marketData, currentFedRate, currentCape)
  const allDownturns    = ongoingDownturn ? [...DOWNTURNS, ongoingDownturn] : DOWNTURNS
  const stats           = computeStats(allDownturns)

  // Fetch remaining eco data (reuse already-fetched Fed and CAPE)
  const [inflationData, oilData, gdpData] = await Promise.all([
    getEcoDataAsync('inflation_cpi'),
    getEcoDataAsync('oil_price'),
    getEcoDataAsync('real_gdp'),
  ])
  const ecoData: Record<EcoIndicator, Awaited<ReturnType<typeof getEcoDataAsync>>> = {
    fed_rate:      liveFedData,
    pe_ratio:      liveCapeData,
    inflation_cpi: inflationData,
    oil_price:     oilData,
    real_gdp:      gdpData,
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Header */}
      <header
        className="border-b sticky top-0 z-50 backdrop-blur-sm"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold leading-none" style={{ color: 'var(--text-primary)' }}>
                  S&P 500 Downturn Analyzer
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Bear markets · corrections · multi-asset · Fed rate · CAPE · CPI · Oil
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Every Major S&P 500 Downturn,{' '}
          <span className="text-blue-500">Explained</span>
        </h2>
        <p className="max-w-2xl text-base" style={{ color: 'var(--text-secondary)' }}>
          Interactive analysis of every bear market and correction since 1987 — what caused it,
          how deep, how long, how Gold / Bonds / BTC behaved, and what Fed, CAPE, CPI and Oil looked like.
        </p>
      </section>

      <Suspense fallback={<LoadingPlaceholder />}>
        <Dashboard
          sp500Data={marketData}
          downturns={allDownturns}
          stats={stats}
          ecoData={ecoData}
        />
      </Suspense>

      <footer className="border-t mt-16" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          <p>
            Market data: Yahoo Finance (^GSPC, GC=F, TLT, BTC-USD) · CAPE: Robert Shiller (Yale) ·
            Fed Rate: Federal Reserve · CPI: US Bureau of Labor Statistics · Oil: WTI spot.
            For informational purposes only — not financial advice.
          </p>
          <p className="mt-1">Revalidates hourly on Vercel. Static fallback when Yahoo Finance unavailable.</p>
        </div>
      </footer>
    </main>
  )
}

function LoadingPlaceholder() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }} />
          ))}
        </div>
        <div className="h-[500px] rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
