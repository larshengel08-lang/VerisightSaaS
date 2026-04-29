import Link from 'next/link'
import { redirect } from 'next/navigation'
import { buildLiveActionCenterItems } from '@/lib/action-center-live'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  isScopeVisibleToActionCenterContext,
  type ActionCenterWorkspaceMember,
} from '@/lib/suite-access'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { createClient } from '@/lib/supabase/server'
import type { CampaignDeliveryCheckpoint, CampaignDeliveryRecord } from '@/lib/ops-delivery'
import type { PilotLearningCheckpoint, PilotLearningDossier } from '@/lib/pilot-learning'
import type { Campaign, CampaignStats, Organization } from '@/lib/types'

type RespondentDepartmentRow = {
  campaign_id: string
  department: string | null
}

function normalizeDepartmentLabel(value: string | null | undefined) {
  return value?.trim() || null
}

function buildDepartmentScopeValue(orgId: string, departmentLabel: string) {
  return `${orgId}::department::${departmentLabel.toLowerCase()}`
}

function buildCampaignFallbackScopeValue(orgId: string, campaignId: string) {
  return `${orgId}::campaign::${campaignId}`
}

function getManagerAssignment(
  workspaceRows: ActionCenterWorkspaceMember[],
  orgId: string,
  scopeValue: string,
) {
  return (
    workspaceRows.find(
      (row) =>
        row.org_id === orgId &&
        row.access_role === 'manager_assignee' &&
        row.scope_value === scopeValue &&
        row.can_view,
    ) ?? null
  )
}

export default async function ActionCenterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const {
    context,
    orgMemberships,
    workspaceMemberships: currentUserWorkspaceMemberships,
  } = await loadSuiteAccessContext(supabase, user.id)

  if (!context.canViewActionCenter) {
    redirect('/dashboard')
  }

  const orgIds = [...new Set([...context.organizationIds, ...context.workspaceOrgIds])]

  if (orgIds.length === 0 && !context.isVerisightAdmin) {
    redirect('/dashboard')
  }

  const dataClient = createAdminClient()

  const [
    { data: organizationsRaw },
    { data: campaignsRaw },
    { data: statsRaw },
    { data: deliveryRecordsRaw },
    { data: dossiersRaw },
    { data: managerWorkspaceRowsRaw },
  ] = await Promise.all([
    orgIds.length > 0
      ? dataClient.from('organizations').select('id, name, slug, contact_email, is_active, created_at').in('id', orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? dataClient.from('campaigns').select('*').in('organization_id', orgIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? dataClient.from('campaign_stats').select('*').in('organization_id', orgIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? dataClient.from('campaign_delivery_records').select('*').in('organization_id', orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? dataClient.from('pilot_learning_dossiers').select('*').in('organization_id', orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? dataClient
          .from('action_center_workspace_members')
          .select(
            'id, org_id, user_id, display_name, login_email, access_role, scope_type, scope_value, can_view, can_update, can_assign, can_schedule_review, created_at, updated_at',
          )
          .in('org_id', orgIds)
      : Promise.resolve({ data: [] }),
  ])

  const organizations = (organizationsRaw ?? []) as Organization[]
  const campaigns = ((campaignsRaw ?? []) as Campaign[]).filter((campaign) =>
    ['exit', 'retention', 'onboarding', 'pulse', 'leadership'].includes(campaign.scan_type),
  )
  const campaignIds = campaigns.map((campaign) => campaign.id)
  const stats = (statsRaw ?? []) as CampaignStats[]
  const deliveryRecords = (deliveryRecordsRaw ?? []) as CampaignDeliveryRecord[]
  const dossiers = ((dossiersRaw ?? []) as PilotLearningDossier[]).filter((dossier) =>
    dossier.campaign_id ? campaignIds.includes(dossier.campaign_id) : false,
  )
  const managerWorkspaceRows = (
    context.canManageActionCenterAssignments ? managerWorkspaceRowsRaw ?? [] : currentUserWorkspaceMemberships
  ) as ActionCenterWorkspaceMember[]

  const { data: respondentsWithDepartmentsRaw } =
    campaignIds.length > 0
      ? await dataClient.from('respondents').select('campaign_id, department').in('campaign_id', campaignIds)
      : { data: [] }

  const respondentsWithDepartments = (respondentsWithDepartmentsRaw ?? []) as RespondentDepartmentRow[]

  const [{ data: deliveryCheckpointsRaw }, { data: learningCheckpointsRaw }] = await Promise.all([
    deliveryRecords.length > 0
      ? dataClient
          .from('campaign_delivery_checkpoints')
          .select('*')
          .in(
            'delivery_record_id',
            deliveryRecords.map((record) => record.id),
          )
      : Promise.resolve({ data: [] }),
    dossiers.length > 0
      ? dataClient
          .from('pilot_learning_checkpoints')
          .select('*')
          .in(
            'dossier_id',
            dossiers.map((dossier) => dossier.id),
          )
      : Promise.resolve({ data: [] }),
  ])

  const deliveryCheckpoints = (deliveryCheckpointsRaw ?? []) as CampaignDeliveryCheckpoint[]
  const learningCheckpoints = (learningCheckpointsRaw ?? []) as PilotLearningCheckpoint[]

  const organizationById = new Map(organizations.map((organization) => [organization.id, organization]))
  const roleByOrgId = orgMemberships.reduce<Record<string, 'owner' | 'member' | 'viewer'>>((acc, membership) => {
    if (!acc[membership.org_id]) {
      acc[membership.org_id] = membership.role
    }
    return acc
  }, {})
  const statsByCampaignId = new Map(stats.map((entry) => [entry.campaign_id, entry]))
  const deliveryRecordByCampaignId = new Map(deliveryRecords.map((record) => [record.campaign_id, record]))
  const deliveryCheckpointMap = deliveryCheckpoints.reduce<Record<string, CampaignDeliveryCheckpoint[]>>((acc, checkpoint) => {
    acc[checkpoint.delivery_record_id] ??= []
    acc[checkpoint.delivery_record_id].push(checkpoint)
    return acc
  }, {})
  const learningDossierByCampaignId = new Map(dossiers.map((dossier) => [dossier.campaign_id ?? dossier.id, dossier]))
  const learningCheckpointMap = learningCheckpoints.reduce<Record<string, PilotLearningCheckpoint[]>>((acc, checkpoint) => {
    acc[checkpoint.dossier_id] ??= []
    acc[checkpoint.dossier_id].push(checkpoint)
    return acc
  }, {})
  const respondentDepartmentsByCampaign = respondentsWithDepartments.reduce<Record<string, string[]>>((acc, row) => {
    const departmentLabel = normalizeDepartmentLabel(row.department)
    if (!departmentLabel) return acc
    acc[row.campaign_id] ??= []
    acc[row.campaign_id].push(departmentLabel)
    return acc
  }, {})

  const liveContexts = campaigns.flatMap((campaign) => {
    const departmentLabels = respondentDepartmentsByCampaign[campaign.id] ?? []
    const departmentCounts = departmentLabels.reduce<Record<string, number>>((acc, label) => {
      acc[label] = (acc[label] ?? 0) + 1
      return acc
    }, {})
    const departmentEntries = Object.entries(departmentCounts)
    const scopes =
      departmentEntries.length > 0
        ? departmentEntries.map(([departmentLabel, peopleCount]) => ({
            scopeType: 'department' as const,
            scopeValue: buildDepartmentScopeValue(campaign.organization_id, departmentLabel),
            scopeLabel: departmentLabel,
            peopleCount,
          }))
        : [
            {
              scopeType: 'item' as const,
              scopeValue: buildCampaignFallbackScopeValue(campaign.organization_id, campaign.id),
              scopeLabel: campaign.name,
              peopleCount: statsByCampaignId.get(campaign.id)?.total_completed ?? statsByCampaignId.get(campaign.id)?.total_invited ?? 0,
            },
          ]

    return scopes
      .filter((scope) => isScopeVisibleToActionCenterContext(context, scope.scopeValue))
      .map((scope) => {
        const deliveryRecord = deliveryRecordByCampaignId.get(campaign.id) ?? null
        const learningDossier = learningDossierByCampaignId.get(campaign.id) ?? null
        const assignment = getManagerAssignment(managerWorkspaceRows, campaign.organization_id, scope.scopeValue)

        return {
          campaign,
          stats: statsByCampaignId.get(campaign.id) ?? null,
          organizationName: organizationById.get(campaign.organization_id)?.name ?? 'Verisight organisatie',
          memberRole: roleByOrgId[campaign.organization_id] ?? null,
          scopeType: scope.scopeType,
          scopeValue: scope.scopeValue,
          scopeLabel: scope.scopeLabel,
          peopleCount: scope.peopleCount,
          assignedManager: assignment
            ? {
                userId: assignment.user_id,
                displayName: assignment.display_name ?? assignment.login_email ?? null,
              }
            : null,
          deliveryRecord,
          deliveryCheckpoints: deliveryRecord ? (deliveryCheckpointMap[deliveryRecord.id] ?? []) : [],
          learningDossier,
          learningCheckpoints: learningDossier ? (learningCheckpointMap[learningDossier.id] ?? []) : [],
        }
      })
  })

  const items = buildLiveActionCenterItems(liveContexts)
  const itemHrefFor = (id: string) => (context.canViewInsights ? `/campaigns/${id}` : '/action-center')
  const openItems = items.filter((item) => item.status !== 'afgerond' && item.status !== 'gestopt')
  const primaryOpenItems = openItems.slice(0, 6)
  const overflowOpenItems = openItems.slice(6)
  const reviewItems = items.filter((item) => item.reviewDate).slice(0, 8)
  const ownerGapItems = items.filter((item) => !item.ownerName || item.status === 'te-bespreken').slice(0, 8)

  if (items.length === 0) {
    return (
      <div className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-6 py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
          Action Center
        </p>
        <h1 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
          Nog geen live opvolging zichtbaar
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--dashboard-text)]">
          Zodra er open acties, reviewmomenten of nog onbevestigde opvolging zichtbaar wordt, opent deze pagina automatisch
          met de eerstvolgende werkvoorraad.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-6 py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
          Action Center
        </p>
        <h1 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
          Open acties nu
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--dashboard-text)]">
          Werk vanuit de open actielijst. Reviewmomenten en items zonder bevestiging staan lager en secundair.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <ActionCenterMetric label="Open acties" value={`${openItems.length}`} />
          <ActionCenterMetric label="Reviewmomenten" value={`${reviewItems.length}`} />
          <ActionCenterMetric label="Zonder eigenaar / bevestiging" value={`${ownerGapItems.length}`} />
        </div>
      </div>

      <section className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
              Werklijst
            </p>
            <h2 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
              Wat nu openstaat
            </h2>
          </div>
          <p className="text-sm text-[color:var(--dashboard-muted)]">
            {primaryOpenItems.length} van {openItems.length} actie{openItems.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="space-y-3">
          {primaryOpenItems.map((item, index) => (
            <ActionCenterListRow
              key={`open-${item.id}-${item.sourceLabel}-${item.teamLabel}-${index}`}
              item={item}
              href={itemHrefFor(item.id)}
            />
          ))}
        </div>
        {overflowOpenItems.length > 0 ? (
          <details className="mt-4 rounded-[20px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-[color:var(--dashboard-ink)]">
              Toon {overflowOpenItems.length} extra open actie{overflowOpenItems.length === 1 ? '' : 's'}
            </summary>
            <div className="mt-4 space-y-3">
              {overflowOpenItems.map((item, index) => (
                <ActionCenterListRow
                  key={`overflow-${item.id}-${item.sourceLabel}-${item.teamLabel}-${index}`}
                  item={item}
                  href={itemHrefFor(item.id)}
                  compact
                />
              ))}
            </div>
          </details>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-5">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
              Reviewmomenten
            </p>
            <h2 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
              Wat terug op tafel komt
            </h2>
          </div>
          <div className="space-y-3">
            {reviewItems.length > 0 ? reviewItems.map((item, index) => (
              <ActionCenterReviewRow
                key={`review-${item.id}-${item.sourceLabel}-${item.teamLabel}-${index}`}
                item={item}
                href={itemHrefFor(item.id)}
              />
            )) : (
              <EmptyListState text="Nog geen reviewmomenten zichtbaar." />
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-5">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
              Wacht op bevestiging
            </p>
            <h2 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
              Waar eigenaarschap nog open is
            </h2>
          </div>
          <div className="space-y-3">
            {ownerGapItems.length > 0 ? ownerGapItems.map((item, index) => (
              <ActionCenterOwnerGapRow
                key={`owner-${item.id}-${item.sourceLabel}-${item.teamLabel}-${index}`}
                item={item}
                href={itemHrefFor(item.id)}
              />
            )) : (
              <EmptyListState text="Geen open eigenaar- of bevestigingsgaten zichtbaar." />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function ActionCenterMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">{label}</p>
      <p className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">{value}</p>
    </div>
  )
}

function ActionCenterListRow({
  item,
  href,
  compact = false,
}: {
  item: ReturnType<typeof buildLiveActionCenterItems>[number]
  href: string
  compact?: boolean
}) {
  return (
    <div
      className={`rounded-[20px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] ${
        compact ? 'px-4 py-3' : 'px-4 py-3.5'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">{item.sourceLabel}</span>
            <span className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--dashboard-muted)]">{item.teamLabel}</span>
          </div>
          <p className={`mt-2 font-semibold text-[color:var(--dashboard-ink)] ${compact ? 'text-sm' : 'text-[0.98rem]'}`}>{item.title}</p>
          <p className={`mt-1 leading-6 text-[color:var(--dashboard-text)] ${compact ? 'text-xs' : 'text-[0.92rem]'}`}>{item.nextStep}</p>
          <p className="mt-2 text-xs text-[color:var(--dashboard-muted)]">
            {item.ownerName ? `Eigenaar: ${item.ownerName}` : 'Nog geen eigenaar bevestigd'} · Status: {item.status.replace(/-/g, ' ')}
          </p>
        </div>
        <Link
          href={href}
          className={`inline-flex shrink-0 rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)] ${
            compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
          }`}
        >
          Open
        </Link>
      </div>
    </div>
  )
}

function ActionCenterReviewRow({ item, href }: { item: ReturnType<typeof buildLiveActionCenterItems>[number]; href: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{item.title}</p>
        <p className="mt-1 text-sm leading-6 text-[color:var(--dashboard-text)]">
          {item.reviewDateLabel} · {item.sourceLabel} · {item.teamLabel}
        </p>
      </div>
      <Link href={href} className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)]">
        Open
      </Link>
    </div>
  )
}

function ActionCenterOwnerGapRow({ item, href }: { item: ReturnType<typeof buildLiveActionCenterItems>[number]; href: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[color:var(--dashboard-ink)]">{item.title}</p>
        <p className="mt-1 text-sm leading-6 text-[color:var(--dashboard-text)]">
          {item.ownerName ? 'Actie wacht nog op bevestiging.' : 'Nog geen eigenaar bevestigd.'} · {item.sourceLabel} · {item.teamLabel}
        </p>
      </div>
      <Link href={href} className="text-sm font-semibold text-[color:var(--dashboard-accent-strong)]">
        Open
      </Link>
    </div>
  )
}

function EmptyListState({ text }: { text: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-5 text-sm leading-7 text-[color:var(--dashboard-text)]">
      {text}
    </div>
  )
}
