/**
 * Eén noemerregel voor "X van Y ingevuld" (spec 2026-09-16 par. 6.2), dezelfde
 * als het rapport sinds stresstest ronde 2 (backend build_report_data):
 *
 * 1. de noemer is campaign_delivery_records.invited_count, wat de klant in
 *    stap 1 invulde;
 * 2. alleen als er méér respondentrijen zijn dan dat aantal winnen de rijen
 *    (de klant onderschatte, of het is een oude managed-campagne waar de rijen
 *    vooraf zijn aangemaakt en invited_count leeg is);
 * 3. zonder beide is er geen noemer en dus geen percentage, maar een reden.
 *
 * Nooit een verzonnen noemer. Vóór dit plan las /reports campaign_stats.
 * total_invited (= gestarte respondenten), waardoor "18 van 18" 100% respons
 * suggereerde terwijl er 30 waren uitgenodigd.
 */
export type InvitedDenominator =
  | { known: true; value: number; source: 'invited_count' | 'respondent_rows' }
  | { known: false; reason: string }

export const DENOMINATOR_UNKNOWN_REASON = 'aantal uitgenodigden niet ingevuld'

function positiveInteger(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : 0
}

export function resolveInvitedDenominator(args: {
  invitedCount: number | null | undefined
  respondentRows: number | null | undefined
}): InvitedDenominator {
  const invited = positiveInteger(args.invitedCount)
  const rows = positiveInteger(args.respondentRows)
  if (rows > invited) return { known: true, value: rows, source: 'respondent_rows' }
  if (invited > 0) return { known: true, value: invited, source: 'invited_count' }
  return { known: false, reason: DENOMINATOR_UNKNOWN_REASON }
}

export function completionPct(completed: number, denominator: InvitedDenominator): number | null {
  if (!denominator.known) return null
  return Math.round((completed / denominator.value) * 100)
}

export function formatResponseBasis(completed: number, denominator: InvitedDenominator): string {
  if (!denominator.known) return `${completed} ingevuld, ${denominator.reason}`
  return `${completed} van ${denominator.value} ingevuld (${completionPct(completed, denominator)}%)`
}
