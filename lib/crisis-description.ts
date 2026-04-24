import Anthropic from '@anthropic-ai/sdk'
import { unstable_cache } from 'next/cache'
import { Downturn, DownturnCategory, EcoPoint } from './types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function valueAtDate(series: EcoPoint[], date: string): number | undefined {
  let best: EcoPoint | undefined
  for (const pt of series) {
    if (pt.date <= date) best = pt
    else break
  }
  return best?.value
}

function changePct(series: EcoPoint[], from: string, to: string): number | undefined {
  const a = valueAtDate(series, from)
  const b = valueAtDate(series, to)
  if (a == null || b == null || a === 0) return undefined
  return ((b - a) / Math.abs(a)) * 100
}

// ─── Scalar context (only primitives — safe for unstable_cache key hashing) ──

interface CrisisContext {
  peakDate:     string
  troughDate:   string
  recoveryDate: string | null
  peakValue:    number
  troughValue:  number
  drawdownPct:  number
  durationDays: number
  recoveryDays: number | null
  fedAtPeak:    number | undefined
  cpiAtPeak:    number | undefined
  capeAtPeak:   number | undefined
  oilChgPct:    number | undefined
}

// ─── Core generation (called through cache) ───────────────────────────────────

async function _generate(
  _cacheKey: string,
  ctx: CrisisContext,
): Promise<Partial<Downturn>> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return {}

  const lines = [
    `- Peak:   ${ctx.peakDate}  (S&P 500: ${ctx.peakValue.toLocaleString()})`,
    `- Trough: ${ctx.troughDate}  (S&P 500: ${ctx.troughValue.toLocaleString()})`,
    `- Drawdown: ${Math.abs(ctx.drawdownPct).toFixed(1)}%  over ${ctx.durationDays} days`,
    ctx.recoveryDate
      ? `- Recovered: ${ctx.recoveryDate}  (${ctx.recoveryDays} days after trough)`
      : '- Status: not yet recovered',
    ctx.fedAtPeak  != null ? `- Fed funds rate at peak: ${ctx.fedAtPeak.toFixed(2)}%`  : null,
    ctx.cpiAtPeak  != null ? `- CPI inflation at peak: ${ctx.cpiAtPeak.toFixed(1)}%`   : null,
    ctx.capeAtPeak != null ? `- Shiller CAPE at peak: ${ctx.capeAtPeak.toFixed(1)}x`   : null,
    ctx.oilChgPct  != null ? `- Oil change during event: ${ctx.oilChgPct > 0 ? '+' : ''}${ctx.oilChgPct.toFixed(1)}%` : null,
  ].filter(Boolean).join('\n')

  const prompt = `You are writing entries for an S&P 500 historical downturn database.
Using your knowledge of market history and the data below, identify what caused this specific event.

${lines}

Reply with ONLY a raw JSON object (no markdown fences, no extra text):
{
  "name": "Short descriptive name, e.g. '2026 Q1 Correction' or '2024 Rate-Hike Scare'",
  "description": "2-3 sentences: what happened, key drivers, how it resolved (or current status)",
  "cause": "1-2 sentences: root cause of the selloff",
  "categories": ["up to 4 from: inflation_rates, credit_crisis, market_structure, geopolitical, political, war, oil_shock, pandemic, financial_contagion"],
  "tags": ["3-6 lowercase keywords: year, event name, key drivers"]
}`

  try {
    const client = new Anthropic({ apiKey })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    // Strip accidental markdown fences if present
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed  = JSON.parse(jsonStr)

    return {
      name:        typeof parsed.name        === 'string' ? parsed.name.trim()        : undefined,
      description: typeof parsed.description === 'string' ? parsed.description.trim() : undefined,
      cause:       typeof parsed.cause       === 'string' ? parsed.cause.trim()       : undefined,
      categories:  Array.isArray(parsed.categories) ? parsed.categories as DownturnCategory[] : undefined,
      tags:        Array.isArray(parsed.tags) ? parsed.tags as string[] : undefined,
    }
  } catch {
    return {}
  }
}

// Cache 7 days — only scalar CrisisContext is passed, safe for key hashing
const _cached = unstable_cache(_generate, ['crisis-ai-v2'], { revalidate: 86400 * 7 })

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Enriches a completed auto-detected crisis with AI-generated metadata.
 * Extracts only scalar values before caching to avoid unstable_cache
 * serialisation issues with large EcoPoint arrays.
 * No-ops for curated, ongoing, or when ANTHROPIC_API_KEY is absent.
 */
export async function enrichCrisis(
  downturn: Downturn,
  fedData:  EcoPoint[],
  cpiData:  EcoPoint[],
  capeData: EcoPoint[],
  oilData:  EcoPoint[],
): Promise<Downturn> {
  if (!downturn.isAutoDetected)          return downturn
  if (downturn.isOngoing)                return downturn
  if (!process.env.ANTHROPIC_API_KEY)    return downturn

  // Extract scalars here — arrays never enter the cache layer
  const ctx: CrisisContext = {
    peakDate:     downturn.startDate,
    troughDate:   downturn.endDate,
    recoveryDate: downturn.recoveryDate,
    peakValue:    downturn.peakValue,
    troughValue:  downturn.troughValue,
    drawdownPct:  downturn.drawdown,
    durationDays: downturn.durationDays,
    recoveryDays: downturn.recoveryDays,
    fedAtPeak:    valueAtDate(fedData,  downturn.startDate),
    cpiAtPeak:    valueAtDate(cpiData,  downturn.startDate),
    capeAtPeak:   valueAtDate(capeData, downturn.startDate),
    oilChgPct:    changePct(oilData, downturn.startDate, downturn.endDate),
  }

  const cacheKey = `${downturn.startDate}|${downturn.endDate}`
  const patch    = await _cached(cacheKey, ctx)
  return { ...downturn, ...patch }
}
