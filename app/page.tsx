import { Suspense } from 'react'
import { fetchMarketData } from '@/lib/sp500'
import { DOWNTURNS, computeStats, detectOngoingDownturn } from '@/lib/downturns'
import { getEcoData } from '@/lib/economics'
import Dashboard from '@/components/Dashboard'
import { EcoIndicator } from '@/lib/types'

export const revalidate = 3600

export default async function Home() {
  const marketData = await fetchMarketData()

  const ongoingDownturn = detectOngoingDownturn(marketData)
  const allDownturns    = ongoingDownturn ? [...DOWNTURNS, ongoingDownturn] : DOWNTURNS
  const stats           = computeStats(allDownturns)

  const ecoIndicators: EcoIndicator[] = ['fed_rate', 'pe_ratio', 'sp_concentration']
  const ecoData = Object.fromEntries(
    ecoIndicators.map((ind) => [ind, getEcoData(ind)])
  ) as Record<EcoIndicator, ReturnType<typeof getEcoData>>

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">S&P 500 Downturn Analyzer</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Bear markets · corrections · multi-asset · Fed rate · P/E · concentration
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Every Major S&P 500 Downturn,{' '}
          <span className="text-blue-400">Explained</span>
        </h2>
        <p className="text-slate-400 max-w-2xl text-base">
          Interactive analysis of every bear market and correction since 1987 — what caused it,
          how deep, how long, how Gold/Bonds/BTC behaved, and what the Fed and valuations looked like.
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

      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-slate-500">
          <p>
            Market data: Yahoo Finance (^GSPC, GC=F, TLT, BTC-USD) · Shiller CAPE: Robert Shiller (Yale) ·
            Fed Funds Rate: Federal Reserve. For informational purposes only — not financial advice.
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
            <div key={i} className="h-24 bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="h-[500px] bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
