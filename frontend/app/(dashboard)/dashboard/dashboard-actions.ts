'use server'

/**
 * Server actions voor dashboard-beheer (herinnering bevestigen, campagne sluiten).
 * Draaien server-side met sessie-verificatie via Supabase auth; app-level permission
 * gate, met RLS als backstop voor data-isolatie per tenant.
 */

import { createClient } from '@/lib/supabase/server'
import { insertCampaignAuditEvent } from '@/lib/campaign-audit'
import type { CampaignAuditActorRole } from '@/lib/campaign-audit'
import { getCustomerActionPermission, getPermissionDeniedMessage } from '@/lib/customer-permissions'
import type { MemberRole } from '@/lib/types'
import { sendLoepEmail } from '@/lib/email'
import { rapportGereedHtml } from '@/lib/email-templates/rapport-gereed'
import { isReportReleaseReady } from '@/lib/response-activation'
import { buildReportMailRecipients, countCustomerRecipients } from '@/lib/report-mail-recipients'
import { getOperatorEmail, LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'
import type { ScanType } from '@/lib/types'

export interface DashboardActionResult {
  ok: boolean
  error?: string
  /** De actie slaagde, maar een neveneffect (de mail) niet. Fail Loud in de UI. */
  warning?: string
}

type SupabaseClientType = Awaited<ReturnType<typeof createClient>>

type ActorContext =
  | { ok: false; error: string }
  | {
      ok: true
      supabase: SupabaseClientType
      user: NonNullable<Awaited<ReturnType<SupabaseClientType['auth']['getUser']>>['data']['user']>
      organizationId: string
      isAdmin: boolean
      role: MemberRole | null
      actorRole: CampaignAuditActorRole
    }

async function loadActorContext(campaignId: string): Promise<ActorContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Niet ingelogd.' }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('organization_id')
    .eq('id', campaignId)
    .single()
  if (!campaign) return { ok: false, error: 'Campagne niet gevonden of niet toegankelijk.' }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase.from('org_members').select('role').eq('org_id', campaign.organization_id).eq('user_id', user.id).maybeSingle(),
  ])

  const isAdmin = profile?.is_verisight_admin === true
  const role = (membership?.role ?? null) as MemberRole | null
  const actorRole: CampaignAuditActorRole = isAdmin ? 'verisight_admin' : (role ?? 'unknown')

  return {
    ok: true,
    supabase,
    user,
    organizationId: campaign.organization_id,
    isAdmin,
    role,
    actorRole,
  }
}

/** State 3 reminder confirm: HR sent the reminder manually; record it as handled. No email is sent here. */
export async function confirmReminderSentAction(campaignId: string): Promise<DashboardActionResult> {
  const ctx = await loadActorContext(campaignId)
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const canSend = ctx.isAdmin || getCustomerActionPermission(ctx.role, 'send_reminders')
  if (!canSend) return { ok: false, error: getPermissionDeniedMessage('send_reminders') }

  const { error } = await insertCampaignAuditEvent({
    supabase: ctx.supabase,
    organizationId: ctx.organizationId,
    campaignId,
    actorUserId: ctx.user.id,
    actorRole: ctx.actorRole,
    action: 'send_reminders',
    outcome: 'completed',
    summary: 'HR bevestigde dat de herinnering handmatig is verstuurd.',
    metadata: { channel: 'manual_dashboard_confirm' },
  })
  if (error) return { ok: false, error: `Bevestigen mislukt: ${error.message}` }

  return { ok: true }
}

/**
 * State 3/4 close: archive the campaign.
 * Sets is_active = false and closed_at, then records a delivery_lifecycle_changed audit event.
 * ('archive_campaign' is not a valid CampaignAuditActionKey; delivery_lifecycle_changed is the
 * correct existing key for campaign lifecycle state transitions.)
 */
export async function closeCampaignAction(campaignId: string): Promise<DashboardActionResult> {
  const ctx = await loadActorContext(campaignId)
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const canArchive = ctx.isAdmin || getCustomerActionPermission(ctx.role, 'review_launch')
  if (!canArchive) return { ok: false, error: getPermissionDeniedMessage('review_launch') }

  // Fetch campaign name and org name for the notification email
  const { data: campaignMeta } = await ctx.supabase
    .from('campaigns')
    .select('name, organizations(name)')
    .eq('id', campaignId)
    .single()

  const campaignName = (campaignMeta as { name?: string } | null)?.name ?? 'Onbekende campagne'
  const orgName =
    (campaignMeta as { organizations?: { name?: string } | null } | null)?.organizations?.name ??
    'Onbekende organisatie'

  const { data: updatedRows, error } = await ctx.supabase
    .from('campaigns')
    .update({ is_active: false, closed_at: new Date().toISOString() })
    .eq('id', campaignId)
    .select('id')

  if (error) return { ok: false, error: `Sluiten mislukt: ${error.message}` }
  if (!updatedRows || updatedRows.length === 0) {
    return { ok: false, error: 'Sluiten mislukt: campagne niet gevonden of geen rechten.' }
  }

  // Rapport-klaar-mail (spec 2026-09-11 par. 5). Alleen versturen als er echt
  // een rapport is: onder de drempel krijgt de klant geen belofte die niet
  // waargemaakt wordt. Ontvangers komen uit org_invites (rol owner, uitnodiging
  // geaccepteerd) plus het organisatieadres; profiles.email bestaat niet.
  const [{ data: statsRow, error: statsError }, { data: ownerInvites }, { data: orgRow }] = await Promise.all([
    ctx.supabase
      .from('campaign_stats')
      .select('total_completed, scan_type')
      .eq('campaign_id', campaignId)
      .maybeSingle(),
    ctx.supabase
      .from('org_invites')
      .select('email')
      .eq('org_id', ctx.organizationId)
      .eq('role', 'owner')
      .not('accepted_at', 'is', null),
    ctx.supabase
      .from('organizations')
      .select('contact_email')
      .eq('id', ctx.organizationId)
      .maybeSingle(),
  ])

  const totalCompleted = (statsRow as { total_completed?: number } | null)?.total_completed ?? 0
  const scanType = (statsRow as { scan_type?: ScanType } | null)?.scan_type
  // Fail Loud: een mislukte campaign_stats-query mag nooit stilzwijgend als
  // "0 responses" gelezen worden (dat oogt exact als een legitieme sluiting
  // onder de drempel). Bij een query-fout weten we het antwoord niet, dus
  // proberen we ook geen mail te sturen op basis van een geraden 0.
  const reportAvailable = !statsError && isReportReleaseReady(totalCompleted, { scanType })

  let mailSent = 0
  let mailFailed = 0
  let customerRecipientCount = 0
  const operatorEmail = getOperatorEmail()

  if (reportAvailable) {
    const recipients = buildReportMailRecipients({
      ownerInviteEmails: (ownerInvites ?? []).map((row: { email: string | null }) => row.email),
      organizationContactEmail: (orgRow as { contact_email?: string | null } | null)?.contact_email ?? null,
      operatorEmail,
    })
    // Alleen de operator-kopie is geen bericht aan de klant: dat mag niet
    // hetzelfde ogen als "iedereen gemaild". Zie Defect 2.
    customerRecipientCount = countCustomerRecipients(recipients, operatorEmail)
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.getloep.nl'}/campaigns/${campaignId}`

    for (const to of recipients) {
      try {
        await sendLoepEmail({
          to,
          subject: `Je rapport staat klaar: ${campaignName}`,
          html: rapportGereedHtml({ organizationName: orgName, campaignName, dashboardUrl }),
        })
        mailSent += 1
      } catch (err) {
        mailFailed += 1
        console.error('[closeCampaignAction] rapport-gereed mail mislukt:', err)
      }
    }
  }

  const { error: auditError } = await insertCampaignAuditEvent({
    supabase: ctx.supabase,
    organizationId: ctx.organizationId,
    campaignId,
    actorUserId: ctx.user.id,
    actorRole: ctx.actorRole,
    action: 'delivery_lifecycle_changed',
    outcome: 'completed',
    summary: 'Campagne gesloten vanuit het dashboard.',
    metadata: {
      report_mail: {
        available: reportAvailable,
        sent: mailSent,
        failed: mailFailed,
        customer_recipients: customerRecipientCount,
        ...(statsError ? { stats_error: statsError.message } : {}),
      },
    },
  })
  if (auditError) return { ok: false, error: `Sluiten gelukt, maar loggen mislukt: ${auditError.message}` }

  // Precedence voor de zichtbare waarschuwing: er kan er maar één terug, dus
  // van hoog naar laag naar urgentie/onzekerheid in plaats van ze samen te
  // voegen tot een verwarrende zin.
  // 1) De stats-query zelf faalde: we weten helemaal niet of er een rapport
  //    is, dus dat weegt zwaarder dan een individuele mailfout.
  // 2) Er is wel degelijk geprobeerd te mailen, maar dat is (deels) mislukt.
  // 3) Alles technisch gelukt, maar er was niemand klant-gericht om naar te
  //    sturen (Defect 2) — de operator-kopie telt hier niet mee.
  if (statsError) {
    return {
      ok: true,
      warning: `Campagne gesloten. Loep kon niet vaststellen of er genoeg antwoorden zijn voor een rapport, dus er is nog geen bericht verstuurd. Controleer het later in je dashboard of mail ${LOEP_CONTACT_EMAIL}.`,
    }
  }

  if (mailFailed > 0) {
    return {
      ok: true,
      warning: `Campagne gesloten. De e-mail kon niet naar ${mailFailed} van de ${mailSent + mailFailed} adressen worden verstuurd. Het rapport staat wel klaar in je dashboard.`,
    }
  }

  if (reportAvailable && customerRecipientCount === 0) {
    return {
      ok: true,
      warning: `Campagne gesloten en het rapport staat klaar. Er is geen e-mailadres van je organisatie bekend, dus er is geen bericht verstuurd. Mail ${LOEP_CONTACT_EMAIL} om dat in te stellen.`,
    }
  }

  return { ok: true }
}
