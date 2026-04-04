import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'S&P 500 Downturn Analyzer',
  description:
    'Interactive historical analysis of every S&P 500 bear market and correction since 1987 — causes, depth, duration, and recovery statistics.',
  keywords: ['S&P 500', 'bear market', 'stock market', 'corrections', 'market analysis'],
  openGraph: {
    title: 'S&P 500 Downturn Analyzer',
    description: 'Interactive analysis of every major S&P 500 downturn since 1987',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // No 'dark' class → light mode by default. ThemeToggle adds 'dark' for dark mode.
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
