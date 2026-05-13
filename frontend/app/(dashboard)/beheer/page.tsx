import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AddRespondentsForm } from '@/components/dashboard/add-respondents-form'
import { ArchiveOrgButton } from '@/components/dashboard/archive-org-button'
import { ClientAccessList } from '@/components/dashboard/client-access-list'
import {
  DashboardChip,
  DashboardHero,
  DashboardPanel,
  DashboardSection,
  DashboardSummaryBar,
} from '@/components/dashboard/dashboard-primitives'
import { DeleteOrgButton } from '@/components/dashboard/delete-org-button'
import { InviteClientUserForm } from '@/components/dashboard/invite-client-user-form'
import { NewCampaignForm } from '@/components/dashboard/new-campaign-form'
import { NewOrgForm } from '@/components/dashboard/new-org-form'
import { OperatorOnboardingBlueprint } from '@/components/dashboard/onboarding-panels'
import { getDeliveryModeLabel } from '@/lib/implementation-readiness'
import { getDeliveryCheckpointTitle, getDeliveryExceptionLabel, getDeliveryLifecycleLabel } from '@/lib/ops-delivery'
import { createClient } from '@/lib/supabase/server'
import { hasCampaignAddOn, REPORT_ADD_ON_LABELS, type Campaign, type CampaignStats, type Organization, type OrgInvite } from '@/lib/types'

export default async function BeheerPage() {
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
    .select('organizations(*)')
    .eq('user_id', user.id)

  const orgs = (memberships?.flatMap((membership) => membership.organizations).filter(Boolean) ?? []) as Organization[]
  const activeOrgs = orgs.filter((org) => org.is_active)
  const archivedOrgs = orgs.filter((org) => !org.is_active)

  const orgIds = orgs.map((org) => org.id)
  const { data: campaignsRaw } = orgIds.length
    ? await supabase
        .from('campaigns')
        .select('*')
        .in('organization_id', orgIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const campaigns = (campaignsRaw ?? []) as Campaign[]
  const campaignCountByOrg = campaigns.reduce<Record<string, number>>((acc, campaign) => {
    acc[campaign.organization_id] = (acc[campaign.organization_id] ?? 0) + 1
    return acc
  }, {})

  const campaignIds = campaigns.map((campaign) => campaign.id)
  const { count: respondentCount } = campaignIds.length
    ? await supabase
        .from('respondents')
        .select('id', { count: 'exact', head: true })
        .in('campaign_id', campaignIds)
    : { count: 0 }

  const { count: clientAccessCount } = orgIds.length
    ? await supabase
        .from('org_members')
        .select('id', { count: 'exact', head: true })
        .in('org_id', orgIds)
        .neq('user_id', user.id)
    : { count: 0 }

  const { data: campaignStatsRaw } = orgIds.length
    ? await supabase
        .from('campaign_stats')
        .select('*')
        .in('organization_id', orgIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const campaignStats = (campaignStatsRaw ?? []) as CampaignStats[]

  const { data: invitesRaw } = orgIds.length
    ? await supabase
        .from('org_invites')
        .select('id, org_id, email, full_name, role, invited_by, invited_at, accepted_at, organizations(id, name)')
        .in('org_id', orgIds)
        .order('accepted_at', { ascending: true, nullsFirst: true })
        .order('invited_at', { ascending: false })
    : { data: [] }

  const invites = (invitesRaw ?? []).map((invite) => ({
    ...invite,
    organizations: Array.isArray(invite.organizations) ? invite.organizations[0] : invite.organizations,
  })) as OrgInvite[]

  const pendingInviteCount = invites.filter((invite) => !invite.accepted_at).length
  const { data: deliveryRecordsRaw } = campaignIds.length
    ? await supabase
        .from('campaign_delivery_records')
        .select('id, campaign_id, lifecycle_stage, exception_status, next_step, operator_owner, campaigns(id, name, scan_type)')
        .in('campaign_id', campaignIds)
        .order('updated_at', { ascending: false })
    : { data: [] }

  const deliveryRecords = (deliveryRecordsRaw ?? []) as Array<{
    id: string
    campaign_id: string
    lifecycle_stage: string
    exception_status: string
    next_step: string | null
    operator_owner: string | null
    campaigns:
      | { id: string; name: string; scan_type: 'exit' | 'retention' }
      | { id: string; name: string; scan_type: 'exit' | 'retention' }[]
      | null
  }>
  const blockedDeliveries = deliveryRecords.filter((record) => record.exception_status !== 'none')
  const deliveryRecordIds = deliveryRecords.map((record) => record.id)
  const { data: deliveryCheckpointsRaw } = deliveryRecordIds.length
    ? await supabase
        .from('campaign_delivery_checkpoints')
        .select('id, delivery_record_id, checkpoint_key, manual_state, exception_status, last_auto_summary')
        .in('delivery_record_id', deliveryRecordIds)
    : { data: [] }
  const deliveryCheckpoints = (deliveryCheckpointsRaw ?? []) as Array<{
    id: string
    delivery_record_id: string
    checkpoint_key: string
    manual_state: string
    exception_status: string
    last_auto_summary: string | null
  }>

  const firstValueReachedCount = deliveryRecords.filter((record) =>
    ['first_value_reached', 'first_management_use', 'follow_up_decided', 'learning_closed'].includes(record.lifecycle_stage),
  ).length
  const openFollowUpCount = deliveryRecords.filter(
    (record) => !['follow_up_decided', 'learning_closed'].includes(record.lifecycle_stage),
  ).length
  const deliveriesNeedingAttention = deliveryRecords
    .filter(
      (record) =>
        record.exception_status !== 'none' ||
        ['setup_in_progress', 'import_cleared', 'client_activation_pending'].includes(record.lifecycle_stage),
    )
    .slice(0, 4)
  const pendingCheckpointConfirmations = deliveryCheckpoints.filter((checkpoint) => checkpoint.manual_state === 'pending')
  const checkpointExceptions = deliveryCheckpoints.filter((checkpoint) => checkpoint.exception_status !== 'none')
  const deliveryRecordById = Object.fromEntries(deliveryRecords.map((record) => [record.id, record]))
  const reportDeliveryGaps = pendingCheckpointConfirmations.filter((checkpoint) => {
    if (checkpoint.checkpoint_key !== 'report_delivery') return false
    const record = deliveryRecordById[checkpoint.delivery_record_id]
    return Boolean(
      record &&
        ['first_value_reached', 'first_management_use', 'follow_up_decided', 'learning_closed'].includes(record.lifecycle_stage),
    )
  })
  const clientActivationGaps = pendingCheckpointConfirmations.filter((checkpoint) => {
    if (checkpoint.checkpoint_key !== 'client_activation') return false
    const record = deliveryRecordById[checkpoint.delivery_record_id]
    return Boolean(
      record &&
        ['client_activation_pending', 'client_activation_confirmed', 'first_value_reached', 'first_management_use'].includes(
          record.lifecycle_stage,
        ),
    )
  })
  const opsAttentionRows = pendingCheckpointConfirmations
    .map((checkpoint) => {
      const record = deliveryRecordById[checkpoint.delivery_record_id]
      const campaign = record ? (Array.isArray(record.campaigns) ? record.campaigns[0] : record.campaigns) : null
      if (!record || !campaign) return null
      return {
        checkpoint,
        record,
        campaign,
      }
    })
    .filter(Boolean)
    .slice(0, 6) as Array<{
    checkpoint: {
      id: string
      checkpoint_key: string
      manual_state: string
      exception_status: string
      last_auto_summary: string | null
    }
    record: (typeof deliveryRecords)[number]
    campaign: { id: string; name: string; scan_type: 'exit' | 'retention' }
  }>

  const step1Done = activeOrgs.length > 0
  const step2Done = campaigns.some((campaign) => campaign.is_active)
  const step3Done = (respondentCount ?? 0) > 0
  const step4Done = step2Done && (clientAccessCount ?? 0) > 0
  const activeCampaignCount = campaigns.filter((campaign) => campaign.is_active).length
  const liveRespondentCount = respondentCount ?? 0
  const confirmedClientAccessCount = clientAccessCount ?? 0
  const setupProgressCount = [step1Done, step2Done, step3Done, step4Done].filter(Boolean).length

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        tone="slate"
        eyebrow="Adminroute voor setup"
        title="Operationele setup"
        description="Gebruik dit overzicht voor organisatie-setup, campaign-setup, respondentimport en klantactivatie. Buyer-facing dashboards blijven apart; dit scherm houdt Loep-werk, handoff en open operationele acties compact scanbaar."
        meta={
          <>
            <DashboardChip surface="ops" label={`${activeOrgs.length} actieve organisatie${activeOrgs.length === 1 ? '' : 's'}`} />
            <DashboardChip surface="ops" label={`${activeCampaignCount} actieve campaign${activeCampaignCount === 1 ? '' : 's'}`} tone="slate" />
            <DashboardChip
              surface="ops"
              label={
                pendingInviteCount === 0
                  ? 'Geen open activaties'
                  : `${pendingInviteCount} activatie${pendingInviteCount === 1 ? '' : 's'} wacht`
              }
              tone={pendingInviteCount > 0 ? 'amber' : 'emerald'}
            />
          </>
        }
        actions={
          <>
            <Link
              href="/beheer/contact-aanvragen"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Open contactaanvragen
            </Link>
            <Link
              href="/beheer/klantlearnings"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Open klantlearnings
            </Link>
            <Link
              href="/beheer/health"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Open health review
            </Link>
          </>
        }
        aside={
          <div className="space-y-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-950">Werkvolgorde voor Loep</p>
            <p>1. Organisatie, 2. campaign, 3. import en uitnodiging, 4. klanttoegang bevestigen.</p>
            <p className="text-xs leading-5 text-slate-500">
              Gebruik beheer eerst als schakelpagina. De zwaardere werkbanken open je pas wanneer daar echt werk ligt.
            </p>
          </div>
        }
      />

      <DashboardSummaryBar
        surface="ops"
        items={[
          {
            label: 'Setupvoortgang',
            value: `${setupProgressCount}/4 stappen actief`,
            tone: setupProgressCount === 4 ? 'emerald' : 'amber',
          },
          {
            label: 'Respondenten',
            value: `${liveRespondentCount} gekoppeld`,
            tone: liveRespondentCount > 0 ? 'emerald' : 'slate',
          },
          {
            label: 'Klanttoegang',
            value: `${confirmedClientAccessCount} bevestigd`,
            tone: confirmedClientAccessCount > 0 ? 'emerald' : 'slate',
          },
          {
            label: 'Open aandacht',
            value: `${blockedDeliveries.length + pendingCheckpointConfirmations.length} items`,
            tone: blockedDeliveries.length + pendingCheckpointConfirmations.length > 0 ? 'amber' : 'slate',
          },
        ]}
        anchors={[
          { id: 'cadence', label: 'Cadence' },
          { id: 'werkbanken', label: 'Werkbanken' },
          { id: 'setup', label: 'Setup' },
          { id: 'campagnes', label: 'Campagnes' },
        ]}
      />

      <DashboardSection
        id="cadence"
        surface="ops"
        eyebrow="Cadence"
        title="Open delivery- en activatiewerk"
        description="Gebruik deze laag om open exceptions, pending checkpoints en klantactivatie compact te scannen. Dit is operationele besturing, niet de buyer-facing managementlaag."
        aside={
          <DashboardChip
            surface="ops"
            label={
              deliveryRecords.length === 0
                ? 'Nog geen deliveryrecords'
                : `${deliveryRecords.length} deliveryrecord${deliveryRecords.length === 1 ? '' : 's'}`
            }
            tone="slate"
          />
        }
      >
        {deliveryRecords.length === 0 ? (
          <DashboardPanel
            surface="ops"
            title="Nog geen deliveryrecords zichtbaar"
            body="Zodra een campaign deliverytracking gebruikt, verschijnen hier open lifecycle- en checkpointsignalen. Tot die tijd blijft de beheerroute vooral gericht op setup."
            tone="slate"
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-4">
              <DashboardPanel
                surface="ops"
                eyebrow="Delivery"
                title="Actieve deliveryrecords"
                value={`${deliveryRecords.length}`}
                body="Elke campaign bewaart lifecycle en exception-status in dezelfde adminlaag."
                tone="slate"
              />
              <DashboardPanel
                surface="ops"
                eyebrow="Exceptions"
                title="Open exceptions"
                value={`${blockedDeliveries.length}`}
                body="Blocked, recovery en wacht-op-klant blijven zichtbaar zonder losse notities."
                tone={blockedDeliveries.length > 0 ? 'amber' : 'slate'}
              />
              <DashboardPanel
                surface="ops"
                eyebrow="Value"
                title="First value bereikt"
                value={`${firstValueReachedCount}`}
                body="Campaigns die al voorbij setup zijn en managementwaarde hebben bereikt."
                tone={firstValueReachedCount > 0 ? 'emerald' : 'slate'}
              />
              <DashboardPanel
                surface="ops"
                eyebrow="Follow-up"
                title="Open follow-up"
                value={`${openFollowUpCount}`}
                body="Campaigns zonder expliciet gesloten learning- of follow-upbesluit."
                tone={openFollowUpCount > 0 ? 'amber' : 'slate'}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-4">
              <DashboardPanel
                surface="ops"
                eyebrow="Checkpoints"
                title="Pending confirmations"
                value={`${pendingCheckpointConfirmations.length}`}
                body="Handmatige bevestigingen op intake, import, activatie, report of management use."
                tone={pendingCheckpointConfirmations.length > 0 ? 'amber' : 'slate'}
              />
              <DashboardPanel
                surface="ops"
                eyebrow="Checkpoints"
                title="Checkpoint exceptions"
                value={`${checkpointExceptions.length}`}
                body="Exceptions op checkpointniveau die expliciete recovery vragen."
                tone={checkpointExceptions.length > 0 ? 'amber' : 'slate'}
              />
              <DashboardPanel
                surface="ops"
                eyebrow="Activation"
                title="Activation gaps"
                value={`${clientActivationGaps.length}`}
                body="Campaigns waar klantactivatie nog geen bevestigde afronding kent."
                tone={clientActivationGaps.length > 0 ? 'amber' : 'slate'}
              />
              <DashboardPanel
                surface="ops"
                eyebrow="Reports"
                title="Report gaps"
                value={`${reportDeliveryGaps.length}`}
                body="Campagnes die managementwaarde naderen zonder bevestigde report delivery."
                tone={reportDeliveryGaps.length > 0 ? 'amber' : 'slate'}
              />
            </div>

            {deliveriesNeedingAttention.length > 0 ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {deliveriesNeedingAttention.map((record) => {
                  const campaign = Array.isArray(record.campaigns) ? record.campaigns[0] : record.campaigns
                  return (
                    <div key={record.id} className="rounded-[20px] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 shadow-[0_6px_18px_rgba(19,32,51,0.035)]">
                      <div className="flex flex-wrap items-center gap-2">
                        <DashboardChip
                          surface="ops"
                          label={campaign?.scan_type === 'retention' ? 'RetentieScan' : 'ExitScan'}
                          tone="slate"
                        />
                        <DashboardChip
                          surface="ops"
                          label={getDeliveryLifecycleLabel(record.lifecycle_stage as never)}
                          tone="slate"
                        />
                        {record.exception_status !== 'none' ? (
                          <DashboardChip
                            surface="ops"
                            label={getDeliveryExceptionLabel(record.exception_status as never)}
                            tone="amber"
                          />
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-950">{campaign?.name ?? 'Onbekende campaign'}</p>
                      <p className="mt-2 leading-6 text-slate-600">
                        {record.next_step ? `Volgende stap: ${record.next_step}` : 'Nog geen expliciete volgende stap opgeslagen.'}
                      </p>
                      {record.operator_owner ? (
                        <p className="mt-2 text-xs text-slate-500">Eigenaar: {record.operator_owner}</p>
                      ) : null}
                      <a
                        href={`/campaigns/${record.campaign_id}`}
                        className="mt-3 inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                      >
                        Open deliverylaag
                      </a>
                    </div>
                  )
                })}
              </div>
            ) : null}

            {opsAttentionRows.length > 0 ? (
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-1 border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-semibold text-slate-900">Open ops loops</h3>
                  <p className="text-sm leading-6 text-slate-500">
                    Werk direct acceptance, escalatie en follow-through bij vanuit deze compacte lijst.
                  </p>
                </div>
                <div className="mt-3 space-y-3">
                  {opsAttentionRows.map(({ checkpoint, record, campaign }) => (
                    <div key={checkpoint.id} className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      <div className="flex flex-wrap items-center gap-2">
                        <DashboardChip surface="ops" label={campaign.scan_type === 'retention' ? 'RetentieScan' : 'ExitScan'} />
                        <DashboardChip surface="ops" label={getDeliveryLifecycleLabel(record.lifecycle_stage as never)} />
                        <DashboardChip
                          surface="ops"
                          label={getDeliveryCheckpointTitle(checkpoint.checkpoint_key as never)}
                          tone="amber"
                        />
                      </div>
                      <p className="mt-3 font-semibold text-slate-950">{campaign.name}</p>
                      <p className="mt-1 leading-6 text-slate-600">
                        {checkpoint.last_auto_summary ??
                          'Nog geen autosamenvatting opgeslagen; open de deliverylaag om acceptance en recovery expliciet te bevestigen.'}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>Handmatige status: nog bevestigen</span>
                        {record.operator_owner ? <span>Eigenaar: {record.operator_owner}</span> : null}
                      </div>
                      <a
                        href={`/campaigns/${record.campaign_id}`}
                        className="mt-3 inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                      >
                        Open checkpoint
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        id="werkbanken"
        surface="ops"
        eyebrow="Werkbanken"
        title="Werkbanken en standaardlagen"
        description="Gebruik beheer als ingang naar de juiste adminwerkbank. Houd de home rustig; open pas de zwaardere werkvloer wanneer er echt iets te doen is."
        aside={<DashboardChip surface="ops" label={`${setupProgressCount}/4 setupstappen actief`} tone={step4Done ? 'emerald' : 'amber'} />}
      >
        <div className="space-y-5">
          <div className="grid gap-3 lg:grid-cols-3">
            <WorkbenchLinkCard
              href="/beheer/contact-aanvragen"
              eyebrow="Instroom"
              title="Contactaanvragen"
              body="Verwerk nieuwe aanvragen, koppel ze aan echte campagnes en voorkom losse intake-werkstroom."
            />
            <WorkbenchLinkCard
              href="/beheer/klantlearnings"
              eyebrow="Learning"
              title="Klantlearnings"
              body="Leg pilots, vroege klantlessen en implementationfrictie vast in één operatorlaag."
            />
            <WorkbenchLinkCard
              href="/beheer/health"
              eyebrow="Health"
              title="Health review"
              body="Scan bounded activatie-, denied-access- en follow-through signalen zonder brede analyticsstack."
            />
            <WorkbenchLinkCard
              href="/beheer/billing"
              eyebrow="Billing"
              title="Billing registry"
              body="Maak contract, betaalwijze en assisted launch readiness expliciet zonder seat- of checkoutfictie."
            />
            <WorkbenchLinkCard
              href="/beheer/proof"
              eyebrow="Proof"
              title="Case proof registry"
              body="Beweeg cases bewust van lesson_only naar public_usable in plaats van sample-output direct als klantbewijs te gebruiken."
            />
            <DashboardPanel
              surface="ops"
              eyebrow="Acceptatie"
              title="Bevestig echte activatie"
              body="Behandel klanttoegang pas als afgerond wanneer activatie echt bevestigd is. Een invite versturen is start, nog geen oplevering."
              tone="amber"
            />
          </div>

          <details className="rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(19,32,51,0.04)]">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Assisted setupvolgorde</p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-slate-950">Werkvolgorde voor Loep</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StepBadge n={1} label="Organisatie" done={step1Done} />
                  <StepBadge n={2} label="Campaign" done={step2Done} />
                  <StepBadge n={3} label="Import & uitnodigen" done={step3Done} />
                  <StepBadge n={4} label="Klanttoegang" done={step4Done} />
                </div>
              </div>
            </summary>
            <div className="mt-5 space-y-5 border-t border-slate-200 pt-5">
              <OperatorOnboardingBlueprint />
              <div className="grid gap-3 lg:grid-cols-5">
                <DashboardPanel
                  surface="ops"
                  eyebrow="Assets"
                  title="Interne handover-assets"
                  body="Gebruik voor assisted setup de repo-checklists docs/IMPLEMENTATION_OPERATOR_CHECKLIST.md en docs/CLIENT_ONBOARDING_CHECKLIST.md."
                  tone="slate"
                />
                <DashboardPanel
                  surface="ops"
                  eyebrow="Learning"
                  title="Learning default"
                  body="Leg pilots en vroege klantlessen vast in /beheer/klantlearnings, zodat buyer-signalen en implementationfrictie niet in losse notities verdwijnen."
                  tone="slate"
                />
                <DashboardPanel
                  surface="ops"
                  eyebrow="Billing"
                  title="Billing default"
                  body="Maak contract, betaalwijze en assisted launch readiness expliciet in /beheer/billing zonder seat-, plan- of checkoutfictie."
                  tone="slate"
                />
                <DashboardPanel
                  surface="ops"
                  eyebrow="Health"
                  title="Health review default"
                  body="Gebruik /beheer/health voor bounded activation-, denied-access- en follow-through signalen zonder brede analytics-stack."
                  tone="slate"
                />
                <DashboardPanel
                  surface="ops"
                  eyebrow="Proof"
                  title="Proof ladder default"
                  body="Beweeg cases via /beheer/proof bewust van lesson_only naar public_usable in plaats van sample-output direct als klantbewijs te gebruiken."
                  tone="slate"
                />
              </div>
            </div>
          </details>
        </div>
      </DashboardSection>

      <DashboardSection
        id="setup"
        surface="ops"
        eyebrow="Setup"
        title="Organisatie, campaign, import en klanttoegang"
        description="Werk direct de setup af in dezelfde adminlaag. Het ritme is compacter dan het buyer-dashboard: minder framing, meer taakuitvoering."
        aside={<DashboardChip surface="ops" label={`${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'} totaal`} />}
      >
        <details className="rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(19,32,51,0.04)]">
          <summary className="cursor-pointer list-none">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">Open setupwerkvloer</p>
                <p className="mt-1 text-sm text-slate-600">Gebruik alleen wanneer je echt organisaties, campaigns, import of klanttoegang moet bijwerken.</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{setupProgressCount}/4 actief</span>
            </div>
          </summary>
          <div className="mt-5 grid gap-5 border-t border-slate-200 pt-5 lg:grid-cols-2">
          <StepCard done={step1Done} number={1} title="Organisatie aanmaken">
            {orgs.length > 0 ? (
              <div className="space-y-2">
                {orgs.map((org) => (
                  <div key={org.id} className="flex items-start justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={org.is_active ? 'text-emerald-600' : 'text-slate-400'}>{org.is_active ? '✓' : '○'}</span>
                        <span className="font-medium text-slate-900">{org.name}</span>
                        <span className="truncate text-xs text-slate-400">({org.slug})</span>
                        {!org.is_active ? (
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            Gearchiveerd
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{campaignCountByOrg[org.id] ?? 0} campaign(s) gekoppeld</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <ArchiveOrgButton orgId={org.id} orgName={org.name} isActive={org.is_active} />
                      <DeleteOrgButton orgId={org.id} orgName={org.name} campaignCount={campaignCountByOrg[org.id] ?? 0} />
                    </div>
                  </div>
                ))}

                {archivedOrgs.length > 0 ? (
                  <p className="text-xs text-slate-500">
                    Gearchiveerde organisaties blijven beschikbaar voor historie, maar horen niet meer in nieuwe setupstappen.
                  </p>
                ) : null}

                <div className="border-t border-slate-200 pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nieuwe organisatie</p>
                  <NewOrgForm />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <DashboardPanel
                  surface="ops"
                  eyebrow="Start"
                  title="Nog geen organisaties zichtbaar"
                  body="Maak eerst de klantorganisatie aan. Daarna worden campaign- en activatiestappen automatisch bruikbaar."
                  tone="slate"
                />
                <NewOrgForm />
              </div>
            )}
          </StepCard>

          <StepCard done={step2Done} number={2} title="Campaign aanmaken">
            {activeOrgs.length === 0 ? (
              <LockedStep message="Maak eerst een actieve organisatie aan of heractiveer een gearchiveerde organisatie." />
            ) : (
              <NewCampaignForm orgs={activeOrgs} />
            )}
          </StepCard>

          <StepCard done={step3Done} number={3} title="Respondenten importeren en uitnodigen" span="full">
            {campaigns.length === 0 ? (
              <LockedStep message="Maak eerst een campaign aan." />
            ) : (
              <div className="space-y-5">
                <DashboardPanel
                  surface="ops"
                  eyebrow="Input"
                  title="Import blijft assisted"
                  body="Gebruik een klantbestand met e-mailadressen en optionele segmentvelden. Loep doet QA en verzending; de klant blijft verantwoordelijk voor correcte input en respons."
                  tone="slate"
                />

                {campaigns.filter((campaign) => campaign.is_active).length === 0 ? (
                  <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Geen actieve campaigns. Maak eerst een nieuwe campaign aan of gebruik archiefcampagnes alleen voor inzage.
                  </div>
                ) : null}

                <AddRespondentsForm campaigns={campaigns} organizations={orgs} />

                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bestaande campaigns</p>
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex flex-wrap items-center gap-2">
                          <DashboardChip surface="ops" label={campaign.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'} />
                          <DashboardChip surface="ops" label={getDeliveryModeLabel(campaign.delivery_mode, campaign.scan_type)} />
                          <span className={`text-xs font-medium ${campaign.is_active ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {campaign.is_active ? '● Actief' : '○ Gearchiveerd'}
                          </span>
                        </div>
                        <p className="truncate text-sm font-medium text-slate-900">{campaign.name}</p>
                        {hasCampaignAddOn(campaign, 'segment_deep_dive') ? (
                          <p className="mt-1 text-xs font-medium text-slate-700">
                            Add-on actief: {REPORT_ADD_ON_LABELS.segment_deep_dive}
                          </p>
                        ) : null}
                        <p className="text-xs text-slate-500">
                          Aangemaakt{' '}
                          {new Date(campaign.created_at).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <a
                        href={`/campaigns/${campaign.id}`}
                        className="ml-4 flex-shrink-0 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        {campaign.is_active ? 'Open campaign' : 'Bekijk archief'}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </StepCard>

          <StepCard done={step4Done} number={4} title="Klantdashboard activeren" span="full">
            {activeOrgs.length === 0 ? (
              <LockedStep message="Maak eerst een actieve organisatie aan of heractiveer een gearchiveerde organisatie." />
            ) : campaigns.filter((campaign) => campaign.is_active).length === 0 ? (
              <LockedStep message="Maak eerst een actieve campaign aan voordat je klanttoegang activeert." />
            ) : (
              <div className="space-y-5">
                <DashboardPanel
                  surface="ops"
                  eyebrow="Activatie"
                  title="Bevestig dashboardtoegang pas na echte activatie"
                  body="Nieuwe gebruikers ontvangen een activatiemail; bestaande accounts worden direct gekoppeld. Deze stap telt operationeel pas mee zodra toegang echt bevestigd is."
                  tone="slate"
                />
                {pendingInviteCount > 0 && confirmedClientAccessCount === 0 ? (
                  <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Er lopen al klantactivaties, maar er is nog geen bevestigde dashboardtoegang. Laat deze stap open staan tot echte activatie.
                  </div>
                ) : null}
                <InviteClientUserForm orgs={activeOrgs} />
                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Klanttoegang en uitnodigingen</p>
                    {pendingInviteCount > 0 ? (
                      <DashboardChip surface="ops" label={`${pendingInviteCount} wacht op activatie`} tone="amber" />
                    ) : null}
                  </div>
                  <ClientAccessList invites={invites} />
                </div>
              </div>
            )}
          </StepCard>
          </div>
        </details>
      </DashboardSection>

      {campaignStats.length > 0 ? (
        <DashboardSection
          id="campagnes"
          surface="ops"
          eyebrow="Campagnes"
          title="Campagne-statusoverzicht"
          description="Respons, risicosignaal en voortgang per campaign blijven hier compact uitleesbaar voor operators en beheerders."
          aside={<DashboardChip surface="ops" label={`${campaignStats.length} campaignstats`} tone="slate" />}
        >
          <details className="rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(19,32,51,0.04)]">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Toon campagne-statusoverzicht</p>
                  <p className="mt-1 text-sm text-slate-600">Gebruik deze tabel alleen wanneer je een campaign echt op operationele voortgang wilt nalopen.</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{campaignStats.length} campaigns</span>
              </div>
            </summary>
            <div className="mt-5 overflow-x-auto border-t border-slate-200 pt-5">
            <div className="overflow-x-auto rounded-[20px] border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-5 py-3 text-left">Campaign</th>
                  <th className="px-5 py-3 text-left">Organisatie</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Uitgenodigd</th>
                  <th className="px-5 py-3 text-right">Ingevuld</th>
                  <th className="px-5 py-3 text-right">Respons</th>
                  <th className="px-5 py-3 text-right">Gem. risico</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaignStats.map((stats) => {
                  const pct = stats.completion_rate_pct ?? 0
                  const org = orgs.find((item) => item.id === stats.organization_id)
                  return (
                    <tr key={stats.campaign_id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-900">{stats.campaign_name}</div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {stats.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{org?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            stats.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${stats.is_active ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                          {stats.is_active ? 'Actief' : 'Gesloten'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-700">{stats.total_invited ?? 0}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-700">{stats.total_completed ?? 0}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 60 ? 'bg-emerald-500' : pct >= 30 ? 'bg-amber-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="w-9 text-xs font-semibold tabular-nums text-slate-700">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                        {stats.avg_risk_score ? (
                          <span
                            className={`font-semibold ${
                              stats.avg_risk_score >= 7
                                ? 'text-red-600'
                                : stats.avg_risk_score >= 4.5
                                  ? 'text-amber-600'
                                  : 'text-emerald-700'
                            }`}
                          >
                            {stats.avg_risk_score.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/campaigns/${stats.campaign_id}`}
                          className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                        >
                          Open campaign
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
            </div>
          </details>
        </DashboardSection>
      ) : null}
    </div>
  )
}

function WorkbenchLinkCard({
  href,
  eyebrow,
  title,
  body,
}: {
  href: string
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <Link
      href={href}
      className="rounded-[20px] border border-slate-200 bg-white px-5 py-5 shadow-[0_8px_24px_rgba(19,32,51,0.04)] transition hover:border-slate-300 hover:bg-slate-50"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
      <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-slate-950">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </Link>
  )
}

function StepBadge({ n, label, done }: { n: number; label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
        }`}
      >
        {done ? '✓' : n}
      </div>
      <span className={`hidden text-xs font-medium sm:block ${done ? 'text-emerald-700' : 'text-slate-600'}`}>{label}</span>
    </div>
  )
}

function StepCard({
  done,
  number,
  title,
  children,
  span = 'half',
}: {
  done: boolean
  number: number
  title: string
  children: ReactNode
  span?: 'half' | 'full'
}) {
  return (
    <section
      className={`rounded-[22px] border bg-white p-5 shadow-[0_8px_24px_rgba(19,32,51,0.04)] ${
        span === 'full' ? 'lg:col-span-2' : ''
      } ${done ? 'border-emerald-200' : 'border-slate-200'}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <div
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            done ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          {done ? '✓' : number}
        </div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function LockedStep({ message }: { message: string }) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      {message}
    </div>
  )
}
