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
        eyebrow="Interne leadlijst"
        title="Contactaanvragen"
        description="Bekijk nieuwe website-aanvragen direct in de UI, inclusief routecontext, gewenste timing en afleverstatus van de notificatiemail. Gebruik vanaf hier ook meteen de learning-workbench, zodat vroege buyer-signalen niet in losse opvolgnotities verdwijnen."
        tone="blue"
        meta={
          <>
            <DashboardChip label={`${rows.length} recente aanvragen`} tone="blue" />
            <DashboardChip
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
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
            >
              Terug naar setup
            </Link>
            <Link
              href="/beheer/contact-aanvragen"
              className="inline-flex items-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Vernieuwen
            </Link>
            <Link
              href="/beheer/klantlearnings"
              className="inline-flex items-center rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
            >
              Open learning-workbench
            </Link>
          </>
        }
        aside={
          <div className="space-y-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-950">Wat je hier ziet</p>
            <p>
              Elke lead wordt opgeslagen, ook als Resend of de notificatieroute vastloopt. Let vooral op
              <span className="font-semibold"> route</span>, <span className="font-semibold"> timing</span>,
              <span className="font-semibold"> notificatie</span> en{' '}
              <span className="font-semibold">foutreden</span>.
            </p>
            <p className="text-xs text-slate-500">
              Gebruik de actieknop per rij om buyer-vraag, trustfrictie en eerste hypothese meteen in het learningdossier te trekken.
            </p>
          </div>
        }
      />

      {configError ? (
        <DashboardSection
          eyebrow="Config"
          title="Interne leadlijst niet beschikbaar"
          description="De pagina is wel bereikbaar, maar de backend kan de aanvragen nog niet server-side ophalen."
        >
          <DashboardPanel title="Ontbrekende configuratie" body={configError} tone="amber" />
        </DashboardSection>
      ) : null}

      {loadError ? (
        <DashboardSection
          eyebrow="Load"
          title="Aanvragen konden niet worden geladen"
          description="De pagina werkt, maar de backendrespons was niet bruikbaar."
        >
          <DashboardPanel title="Backendfout" body={loadError} tone="amber" />
        </DashboardSection>
      ) : null}

      <DashboardSection
        eyebrow="Leads"
        title="Recente contactaanvragen"
        description="Nieuwe records staan bovenaan. Routecontext en timing helpen om de eerste opvolging meteen productspecifiek te doen, leadtriage expliciet vast te leggen en de handoff naar delivery of learning niet in losse notities te laten verdwijnen."
        aside={<DashboardChip label="Maximaal 50 recente leads" tone="slate" />}
      >
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Er zijn nog geen contactaanvragen zichtbaar, of de lijst kon nog niet worden opgehaald.
          </div>
        ) : (
          <LeadOpsTable rows={rows} linkedCampaignsByLead={linkedCampaignsByLead} />
        )}
      </DashboardSection>
    </div>
  )
}
