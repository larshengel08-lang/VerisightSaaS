import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LeadOpsTable } from '@/components/dashboard/lead-ops-table'
import { getContactRequestsForAdmin } from '@/lib/contact-requests'
import type { DeliveryLifecycleStage } from '@/lib/ops-delivery'
import {
  DashboardChip,
  DashboardHero,
  DashboardPanel,
  DashboardSection,
  DashboardSummaryBar,
} from '@/components/dashboard/dashboard-primitives'

export default async function ContactAanvragenPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_verisight_admin !== true) {
    redirect('/dashboard')
  }

  const { data: memberships } = await supabase
    .from('org_members')
    .select('organizations(id)')
    .eq('user_id', user.id)

  const orgIds = (memberships ?? [])
    .flatMap((membership) => {
      const organizations = Array.isArray(membership.organizations)
        ? membership.organizations
        : membership.organizations
          ? [membership.organizations]
          : []
      return organizations.filter((organization): organization is { id: string } => Boolean(organization?.id))
    })
    .map((organization) => organization.id)

  const { rows, configError, loadError } = await getContactRequestsForAdmin(50)
  const pendingCount = rows.filter((row) => !row.notification_sent).length
  const { data: linkedDeliveryRaw } = orgIds.length
    ? await supabase
        .from('campaign_delivery_records')
        .select('contact_request_id, lifecycle_stage, campaign_id, campaigns(name)')
        .in('organization_id', orgIds)
        .not('contact_request_id', 'is', null)
    : { data: [] }
  const linkedDelivery = (linkedDeliveryRaw ?? []) as Array<{
    contact_request_id: string | null
    lifecycle_stage: string
    campaign_id: string
    campaigns: { name: string } | { name: string }[] | null
  }>

  const linkedCampaignsByLead = linkedDelivery.reduce<Record<string, Array<{
    campaignId: string
    campaignName: string
    lifecycleStage: DeliveryLifecycleStage
  }>>>((acc, record) => {
    const leadId = record.contact_request_id
    if (!leadId) return acc
    acc[leadId] ??= []
    acc[leadId].push({
      campaignId: record.campaign_id,
      campaignName: Array.isArray(record.campaigns) ? record.campaigns[0]?.name ?? 'Onbekende campaign' : record.campaigns?.name ?? 'Onbekende campaign',
      lifecycleStage: record.lifecycle_stage as DeliveryLifecycleStage,
    })
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        eyebrow="Adminroute voor website-aanvragen"
        title="Operationele leadtriage"
        description="Werk direct de triage, handoff en learningstatus bij voor nieuwe website-aanvragen. Deze adminroute blijft utilitair: routecontext, gewenste timing, notificatiestatus en vervolgstap staan voorop."
        tone="slate"
        meta={
          <>
            <DashboardChip surface="ops" label={`${rows.length} recente aanvragen`} tone="slate" />
            <DashboardChip
              surface="ops"
              label={
                pendingCount === 0
                  ? 'Geen open mailissues'
                  : `${pendingCount} aanvraag${pendingCount === 1 ? '' : 'en'} zonder notificatiemail`
              }
              tone={pendingCount === 0 ? 'emerald' : 'amber'}
            />
          </>
        }
        actions={
          <>
            <Link
              href="/beheer"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Terug naar setup
            </Link>
            <Link
              href="/beheer/contact-aanvragen"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Vernieuwen
            </Link>
            <Link
              href="/beheer/klantlearnings"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Open learning-workbench
            </Link>
          </>
        }
        aside={
          <div className="space-y-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-950">Wat je hier bijwerkt</p>
            <p>
              Let vooral op <span className="font-semibold">route</span>, <span className="font-semibold">timing</span>,
              <span className="font-semibold"> notificatie</span>, <span className="font-semibold">handoff</span> en
              <span className="font-semibold"> foutreden</span>.
            </p>
            <p className="text-xs text-slate-500">
              Geen buyer-facing dashboardframing hier; gebruik per rij de actieknop om buyer-vraag, trustfrictie en eerste hypothese meteen in het learningdossier te zetten.
            </p>
          </div>
        }
      />

      <DashboardSummaryBar
        surface="ops"
        items={[
          {
            label: 'Aanvragen',
            value: `${rows.length} zichtbaar`,
            tone: rows.length > 0 ? 'slate' : 'amber',
          },
          {
            label: 'Mailissues',
            value:
              pendingCount === 0
                ? 'Geen open issues'
                : `${pendingCount} zonder notificatie`,
            tone: pendingCount === 0 ? 'emerald' : 'amber',
          },
          {
            label: 'Handoff',
            value: `${Object.keys(linkedCampaignsByLead).length} lead${Object.keys(linkedCampaignsByLead).length === 1 ? '' : 's'} gekoppeld`,
            tone: Object.keys(linkedCampaignsByLead).length > 0 ? 'slate' : 'slate',
          },
        ]}
        anchors={[
          { id: 'issues', label: 'Issues' },
          { id: 'leadlijst', label: 'Leadlijst' },
        ]}
      />

      {configError ? (
        <DashboardSection
          id="issues"
          surface="ops"
          eyebrow="Config"
          title="Leadinput niet beschikbaar"
          description="De adminroute is bereikbaar, maar de backend kan de aanvragen nog niet server-side ophalen."
        >
          <DashboardPanel surface="ops" title="Ontbrekende configuratie" body={configError} tone="amber" />
        </DashboardSection>
      ) : null}

      {loadError ? (
        <DashboardSection
          id={configError ? undefined : 'issues'}
          surface="ops"
          eyebrow="Load"
          title="Aanvragen konden niet worden geladen"
          description="De adminroute werkt, maar de backendrespons was niet bruikbaar voor operationele triage."
        >
          <DashboardPanel surface="ops" title="Backendfout" body={loadError} tone="amber" />
        </DashboardSection>
      ) : null}

      <DashboardSection
        id="leadlijst"
        surface="ops"
        eyebrow="Leadlijst"
        title="Leadtriage en handoff"
        description="Nieuwe records staan bovenaan. Routecontext, timing en notificatiestatus helpen om de eerste opvolging compact vast te leggen en door te zetten naar delivery of learning."
        aside={<DashboardChip surface="ops" label="Maximaal 50 recente leads" tone="slate" />}
      >
        {rows.length === 0 ? (
          <DashboardPanel
            surface="ops"
            title="Geen contactaanvragen in beeld"
            body="Er zijn nog geen records zichtbaar, of de lijst kon nog niet worden opgehaald. Zodra nieuwe website-aanvragen binnenkomen verschijnen ze hier direct voor triage."
            tone="slate"
          />
        ) : (
          <LeadOpsTable rows={rows} linkedCampaignsByLead={linkedCampaignsByLead} />
        )}
      </DashboardSection>
    </div>
  )
}
