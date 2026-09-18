import { addDays } from '@/lib/campaign-schedule'

/** Verlengen (spec 2026-09-16 par. 4.3): twee weken per keer, maximaal drie keer per meting. */
export const EXTENSION_DAYS = 14
export const MAX_EXTENSIONS = 3

export function canExtendCampaign(extensionCount: number): boolean {
  return Number.isFinite(extensionCount) && extensionCount < MAX_EXTENSIONS
}

export function extensionsLeft(extensionCount: number): number {
  if (!Number.isFinite(extensionCount)) return 0
  return Math.max(0, MAX_EXTENSIONS - extensionCount)
}

/** closes_at = max(vandaag, closes_at) + EXTENSION_DAYS. Beide als YYYY-MM-DD. */
export function computeExtendedClosesAt(closesAt: string | null, today: string): string {
  const current = closesAt ? closesAt.slice(0, 10) : null
  const base = current && current > today ? current : today
  return addDays(base, EXTENSION_DAYS)
}
