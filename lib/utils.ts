import { format, differenceInDays, parseISO } from 'date-fns'
export { differenceInDays, parseISO }

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy')
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM yyyy')
}

export function formatPercent(value: number, digits = 1): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}%`
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export function daysBetween(start: string, end: string): number {
  return differenceInDays(parseISO(end), parseISO(start))
}

export function daysToMonths(days: number): string {
  const months = days / 30.44
  if (months < 2) return `${days} days`
  if (months < 12) return `${months.toFixed(1)} months`
  const years = months / 12
  return `${years.toFixed(1)} years`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
