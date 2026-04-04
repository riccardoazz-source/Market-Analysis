import { Suspense } from 'react'
import { fetchSP500Data } from '@/lib/sp500'
import { DOWNTURNS, computeStats } from '@/lib/downturns'
import Dashboard from '@/components/Dashboard'

export const revalidate = 86400

export default async function Home() {
  const sp500Data = await fetchSP500Data()
  const stats = computeStats()

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
              <p className="text-xs text-slate-400 mt-0.5">Historical bear markets & corrections since 1987</p>
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
          An interactive analysis of every bear market and significant correction in the S&P 500 —
          what caused it, how deep the fall was, how long it lasted, and how long recovery took.
        </p>
      </section>

      {/* Dashboard — client component with charts and interactivity */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <Dashboard sp500Data={sp500Data} downturns={DOWNTURNS} stats={stats} />
      </Suspense>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-slate-500">
          <p>Data sourced from Yahoo Finance. For informational purposes only — not financial advice.</p>
          <p className="mt-1">S&P 500 historical data © respective data providers.</p>
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
        <div className="h-96 bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
