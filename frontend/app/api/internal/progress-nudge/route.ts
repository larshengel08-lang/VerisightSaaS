import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendLoepEmail } from '@/lib/email'
import { voortgangHtml } from '@/lib/email-templates/voortgang'
import { insertCampaignAuditEvent } from '@/lib/campaign-audit'
import type { CampaignStats } from '@/lib/types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://verisight.nl'

function buildDashboardUrl(campaignId: string): string {
  return `${APP_URL}/campaigns/${campaignId}`
}

function getResponsePct(stats: Pick<CampaignStats, 'total_completed' | 'total_invited'>): number {
  if (stats.total_invited === 0) return 0
  return Math.round((stats.total_completed / stats.total_invited) * 100)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export async function POST(request: Request) {
  // Admin token auth
  const adminToken = process.env.INTERNAL_ADMIN_TOKEN
  if (!adminToken) {
    return NextResponse.json({ error: 'INTERNAL_ADMIN_TOKEN niet geconfigureerd' }, { status: 500 })
  }
  const provided = request.headers.get('x-admin-token')
  if (provided !== adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // 1. Haal alle actieve campagnes op via campaign_stats view
  const { data: statsRows, error: statsError } = await supabase
    .from('campaign_stats')
    .select('campaign_id, campaign_name, scan_type, organization_id, is_active, total_invited, total_completed, completion_rate_pct')
    .eq('is_active', true)

  if (statsError) {
    throw new Error(`[progress-nudge] Fout bij ophalen campaign_stats: ${statsError.message}`)
  }

  // 2. Filter: total_invited > 0 en response rate 25–75%
  const candidates = (statsRows ?? []).filter((s) => {
    if (s.total_invited === 0) return false
    const pct = getResponsePct(s)
    return pct >= 25 && pct <= 75
  })

  if (candidates.length === 0) {
    return NextResponse.json({ notified: [] })
  }

  const campaignIds = candidates.map((c) => c.campaign_id)
  const today = todayIso()

  // 3. Check welke campagnes vandaag al een progress_nudge_sent audit event hebben
  const { data: existingAuditRows, error: auditCheckError } = await supabase
    .from('campaign_action_audit_events')
    .select('campaign_id, created_at')
    .in('campaign_id', campaignIds)
    .eq('action_key', 'progress_nudge_sent')
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lt('created_at', `${today}T23:59:59.999Z`)

  if (auditCheckError) {
    throw new Error(`[progress-nudge] Fout bij audit dedup check: ${auditCheckError.message}`)
  }

  const alreadyNudgedToday = new Set((existingAuditRows ?? []).map((r) => r.campaign_id))

  // 4. Haal organisatienamen en contact e-mails op
  const orgIds = [...new Set(candidates.map((c) => c.organization_id))]
  const { data: orgRows, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, contact_email')
    .in('id', orgIds)

  if (orgError) {
    throw new Error(`[progress-nudge] Fout bij ophalen organizations: ${orgError.message}`)
  }

  const orgById = new Map(
    (orgRows ?? []).map((o) => [o.id, { name: o.name, contact_email: o.contact_email }]),
  )

  // 5. Stuur mail en log audit event per campagne
  const notified: string[] = []

  for (const stats of candidates) {
    if (alreadyNudgedToday.has(stats.campaign_id)) continue

    const org = orgById.get(stats.organization_id)
    if (!org?.contact_email) {
      console.warn(`[progress-nudge] Geen contact_email voor org ${stats.organization_id}, campagne ${stats.campaign_id} overgeslagen`)
      continue
    }

    const responsePct = getResponsePct(stats)
    const html = voortgangHtml({
      organizationName: org.name,
      campaignName: stats.campaign_name,
      totalCompleted: stats.total_completed,
      totalInvited: stats.total_invited,
      responsePct,
      dashboardUrl: buildDashboardUrl(stats.campaign_id),
    })

    try {
      await sendLoepEmail({
        to: org.contact_email,
        subject: `Voortgangsupdate: ${stats.campaign_name} (${responsePct}% respons)`,
        html,
      })
    } catch (mailErr) {
      console.error(`[progress-nudge] Mail mislukt voor campagne ${stats.campaign_id}:`, mailErr)
      continue
    }

    const { error: auditError } = await insertCampaignAuditEvent({
      supabase,
      organizationId: stats.organization_id,
      campaignId: stats.campaign_id,
      actorUserId: null,
      action: 'progress_nudge_sent',
      outcome: 'completed',
      actorRole: 'verisight_admin',
      summary: `Voortgangsmail verstuurd naar ${org.contact_email} (${responsePct}% respons, ${stats.total_completed}/${stats.total_invited})`,
      metadata: { responsePct, totalCompleted: stats.total_completed, totalInvited: stats.total_invited, to: org.contact_email },
    })

    if (auditError) {
      console.error(`[progress-nudge] Audit log mislukt voor campagne ${stats.campaign_id}:`, auditError.message)
    }

    notified.push(stats.campaign_id)
  }

  return NextResponse.json({ notified })
}
