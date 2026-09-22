'use server'

/**
 * Het besluit van het MT vastleggen (plan 3b, spec 2026-09-16 par. 7). De enige
 * plek waar de klant na de meting iets in het systeem schrijft. App-level
 * rechten en gate, met RLS op campaign_decisions als achtervang. Fail Loud:
 * elke fout komt als melding terug, nooit een stil succes.
 */

import { loadActorContext } from '@/lib/dashboard/actor-context'
import { getCustomerActionPermission } from '@/lib/customer-permissions'
import { decisionToRow, normalizeDecisionInput, validateDecisionInput } from '@/lib/dashboard/campaign-decision'
import { isReportReleaseReady } from '@/lib/response-activation'
import type { ScanType } from '@/lib/types'

export interface DecisionActionResult {
  ok: boolean
  error?: string
}

const NOT_ALLOWED = 'Alleen de eigenaar van deze Loep-omgeving kan het besluit vastleggen.'
const NOT_READY = 'Een besluit vastleggen kan pas als de meting gesloten is en het rapport klaarstaat.'

export async function saveCampaignDecisionAction(
  campaignId: string,
  rawInput: Record<string, unknown>,
): Promise<DecisionActionResult> {
  const ctx = await loadActorContext(campaignId)
  if (!ctx.ok) return { ok: false, error: ctx.error }

  // Zelfde recht als de andere beheeracties: eigenaar of Loep-operator.
  const canManage = ctx.isAdmin || getCustomerActionPermission(ctx.role, 'review_launch')
  if (!canManage) return { ok: false, error: NOT_ALLOWED }

  // Eerst normaliseren, dan pas valideren, en nooit andersom: een veld met
  // alleen witruimte telt anders als ingevuld. `validateDecisionInput` neemt
  // dit als preconditie aan; het type van `rawInput` maakt de omgekeerde
  // volgorde een compileerfout, en decision-actions.test.ts pint hem op gedrag.
  const input = normalizeDecisionInput(rawInput)
  const invalid = validateDecisionInput(input)
  if (invalid) return { ok: false, error: invalid }

  // Zelfde gate als de downloadknop: gesloten meting met rapport.
  const [{ data: campaignRow, error: campaignError }, { data: statsRow, error: statsError }] = await Promise.all([
    ctx.supabase.from('campaigns').select('is_active').eq('id', campaignId).maybeSingle(),
    ctx.supabase.from('campaign_stats').select('total_completed, scan_type').eq('campaign_id', campaignId).maybeSingle(),
  ])
  if (campaignError || !campaignRow) {
    return { ok: false, error: `Opslaan mislukt: ${campaignError?.message ?? 'meting niet gevonden of geen rechten'}.` }
  }
  if (statsError) {
    return { ok: false, error: `Opslaan mislukt: Loep kon niet vaststellen of het rapport klaarstaat (${statsError.message}).` }
  }
  const isActive = (campaignRow as { is_active: boolean }).is_active
  const totalCompleted = (statsRow as { total_completed?: number } | null)?.total_completed ?? 0
  const scanType = (statsRow as { scan_type?: ScanType } | null)?.scan_type
  if (isActive || !isReportReleaseReady(totalCompleted, { scanType })) {
    return { ok: false, error: NOT_READY }
  }

  // De ids komen van de server (sessie en campagnerij), nooit uit de
  // formulierinvoer; `decisionToRow` neemt alleen de bekende besluitvelden over.
  const { data: rows, error } = await ctx.supabase
    .from('campaign_decisions')
    .upsert(decisionToRow(input, { campaignId, organizationId: ctx.organizationId, userId: ctx.user.id }), {
      onConflict: 'campaign_id',
    })
    .select('campaign_id')
  if (error) return { ok: false, error: `Opslaan mislukt: ${error.message}` }
  if (!rows || rows.length === 0) {
    return { ok: false, error: 'Opslaan mislukt: het besluit is niet opgeslagen (geen rechten op deze meting).' }
  }
  return { ok: true }
}
