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

// ─── Raw generator (called by unstable_cache) ─────────────────────────────────

async function _generate(
  _cacheKey: string,      // included so cache key is unique per crisis
  d: Downturn,
  fedData:  EcoPoint[],
  cpiData:  EcoPoint[],
  capeData: EcoPoint[],
  oilData:  EcoPoint[],
): Promise<Partial<Downturn>> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return {}

  const fedAtPeak  = valueAtDate(fedData,  d.startDate)
  const cpiAtPeak  = valueAtDate(cpiData,  d.startDate)
  const capeAtPeak = valueAtDate(capeData, d.startDate)
  const oilChg     = changePct(oilData, d.startDate, d.endDate)

  const context = [
    `- Peak date: ${d.startDate}  (S&P 500: ${d.peakValue.toLocaleString()})`,
    `- Trough date: ${d.endDate}  (S&P 500: ${d.troughValue.toLocaleString()})`,
    `- Max drawdown: ${Math.abs(d.drawdown).toFixed(1)}%  over ${d.durationDays} days`,
    d.recoveryDate ? `- Recovered: ${d.recoveryDate}  (${d.recoveryDays} days after trough)` : '- Status: not yet recovered',
    fedAtPeak  != null ? `- Fed funds rate at peak: ${fedAtPeak.toFixed(2)}%` : null,
    cpiAtPeak  != null ? `- CPI inflation at peak: ${cpiAtPeak.toFixed(1)}%` : null,
    capeAtPeak != null ? `- Shiller CAPE at peak: ${capeAtPeak.toFixed(1)}x` : null,
    oilChg     != null ? `- Oil price change during event: ${oilChg > 0 ? '+' : ''}${oilChg.toFixed(1)}%` : null,
  ].filter(Boolean).join('\n')

  const prompt = `You are writing analysis for an S&P 500 historical downturn database.
Using your knowledge of market history and the data below, identify what caused this event.

${context}

Reply ONLY with a valid JSON object — no markdown, no explanation outside the JSON:
{
  "name": "Concise event name, e.g. '2026 Q1 Correction' or '2024 Inflation Scare'",
  "description": "2-3 sentences: what happened, key macro/political drivers, and how it resolved (or current status if ongoing)",
  "cause": "1-2 sentences on the root cause",
  "categories": ["up to 4 from: inflation_rates, credit_crisis, market_structure, geopolitical, political, war, oil_shock, pandemic, financial_contagion"],
  "tags": ["3-6 keywords such as year, event names, key actors or sectors"]
}`

  try {
    const client = new Anthropic({ apiKey })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 450,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    const parsed = JSON.parse(raw)
    return {
      name:        typeof parsed.name        === 'string' ? parsed.name        : undefined,
      description: typeof parsed.description === 'string' ? parsed.description : undefined,
      cause:       typeof parsed.cause       === 'string' ? parsed.cause       : undefined,
      categories:  Array.isArray(parsed.categories) ? parsed.categories as DownturnCategory[] : undefined,
      tags:        Array.isArray(parsed.tags)        ? parsed.tags              : undefined,
    }
  } catch {
    return {}
  }
}

// Cache per crisis for 7 days — key = _cacheKey arg (peakDate-troughDate)
const _cached = unstable_cache(_generate, ['crisis-ai-description'], { revalidate: 86400 * 7 })

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Enriches a completed auto-detected crisis with AI-generated name,
 * description, cause, categories and tags.
 * No-ops for curated events, ongoing events, or when ANTHROPIC_API_KEY is absent.
 * Results are cached 7 days per unique peak+trough date pair.
 */
export async function enrichCrisis(
  downturn: Downturn,
  fedData:  EcoPoint[],
  cpiData:  EcoPoint[],
  capeData: EcoPoint[],
  oilData:  EcoPoint[],
): Promise<Downturn> {
  if (!downturn.isAutoDetected) return downturn           // curated: keep as-is
  if (downturn.isOngoing)       return downturn           // changes too fast to cache
  if (!process.env.ANTHROPIC_API_KEY) return downturn     // no key: skip silently

  const key = `${downturn.startDate}|${downturn.endDate}`
  const patch = await _cached(key, downturn, fedData, cpiData, capeData, oilData)
  return { ...downturn, ...patch }
}
