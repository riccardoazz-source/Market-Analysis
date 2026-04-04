import { NextResponse } from 'next/server'
import { fetchSP500Data } from '@/lib/sp500'

export const revalidate = 86400 // cache for 24 hours

export async function GET() {
  try {
    const data = await fetchSP500Data()
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({ error: 'Failed to fetch S&P 500 data' }, { status: 500 })
  }
}
