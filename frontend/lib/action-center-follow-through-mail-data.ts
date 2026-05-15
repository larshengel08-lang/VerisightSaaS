import { getActionCenterPageData } from '@/lib/action-center-page-data'
import { inferActionCenterManagerResponseScopeType } from '@/lib/action-center-manager-responses'
import {
  buildDefaultActionCenterReviewRhythmConfig,
  isActionCenterReviewRhythmSupportedScanType,
  normalizeActionCenterReviewRhythmConfig,
  type ActionCenterReviewRhythmConfig,
} from '@/lib/action-center-review-rhythm'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionCenterPreviewStatus } from '@/lib/action-center-preview-model'
import type { ActionCenterReviewOutcome } from '@/lib/action-center-route-contract'
import type {
  ActionCenterWorkspaceMember,
  SuiteAccessContext,
  SuiteOrgMembership,
} from '@/lib/suite-access'

export interface ActionCenterFollowThroughMailManagerRecipient {
  email: string
  name: string | null
}

export interface ActionCenterFollowThroughMailHrOversightRecipient {
  email: string
  auditRole: 'hr_owner' | 'hr_member'
}

export interface ActionCenterFollowThroughMailRouteSnapshot {
  routeId: string
  routeScopeValue: string
  orgId: string
  campaignId: string
  campaignName: string
  scopeLabel: string
  scanType: 'exit'
  routeStatus: ActionCenterPreviewStatus
  reviewScheduledFor: string | null
  reviewCompletedAt: string | null
  reviewOutcome: ActionCenterReviewOutcome
  ownerAssignedAt: string | null
  hasFollowUpTarget: boolean
  remindersEnabled: boolean
  cadenceDays: ActionCenterReviewRhythmConfig['cadenceDays']
  reminderLeadDays: ActionCenterReviewRhythmConfig['reminderLeadDays']
  escalationLeadDays: ActionCenterReviewRhythmConfig['escalationLeadDays']
  managerRecipient: ActionCenterFollowThroughMailManagerRecipient | null
  hrOversightRecipients: ActionCenterFollowThroughMailHrOversightRecipient[]
}

export type ActionCenterFollowThroughMailSnapshotBuildInput = {
  routeId: string
  routeScopeValue?: string | null
  orgId?: string | null
  campaignId?: string | null
  campaignName?: string | null
  scopeLabel?: string | null
  scanType: string | null | undefined
  routeStatus: ActionCenterPreviewStatus
  reviewScheduledFor?: string | null
  reviewCompletedAt?: string | null
  reviewOutcome?: ActionCenterReviewOutcome | null
  ownerAssignedAt?: string | null
  hasFollowUpTarget?: boolean
  managerRecipient?: ActionCenterFollowThroughMailManagerRecipient | null
  hrRecipients?: Array<{
    email: string | null
    role: string
    canUpdate: boolean
    canScheduleReview: boolean
    scopeType?: 'org' | 'department' | 'item'
    scopeValue?: string | null
  }>
  config?: Partial<ActionCenterReviewRhythmConfig> | null
}

type ReviewRhythmRow = {
  route_id: string | null
  cadence_days: number | null
  reminder_lead_days: number | null
  escalation_lead_days: number | null
  reminders_enabled: boolean | null
}

type WorkspaceMemberRow = Pick<
  ActionCenterWorkspaceMember,
  | 'org_id'
  | 'user_id'
  | 'display_name'
  | 'login_email'
  | 'access_role'
  | 'scope_type'
  | 'scope_value'
  | 'can_view'
  | 'can_update'
  | 'can_schedule_review'
>

type CampaignRow = {
  id: string
  name: string
  organization_id: string
  scan_type: string
}

type ManagerResponseScheduleRow = {
  campaign_id: string | null
  route_scope_type: 'department' | 'item' | null
  route_scope_value: string | null
  review_scheduled_for: string | null
  updated_at: string | null
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function normalizeEmail(value: string | null | undefined) {
  return normalizeText(value)?.toLowerCase() ?? null
}

function normalizeConfig(
  config: Partial<ActionCenterReviewRhythmConfig> | null | undefined,
): ActionCenterReviewRhythmConfig {
  const defaults = buildDefaultActionCenterReviewRhythmConfig()

  return {
    cadenceDays:
      config?.cadenceDays === 7 || config?.cadenceDays === 30 ? config.cadenceDays : defaults.cadenceDays,
    reminderLeadDays:
      config?.reminderLeadDays === 1 || config?.reminderLeadDays === 5
        ? config.reminderLeadDays
        : defaults.reminderLeadDays,
    escalationLeadDays:
      config?.escalationLeadDays === 3 || config?.escalationLeadDays === 14
        ? config.escalationLeadDays
        : defaults.escalationLeadDays,
    remindersEnabled: config?.remindersEnabled ?? defaults.remindersEnabled,
  }
}

function getEligibleHrOversightRecipients(args: {
  routeScopeValue: string
  hrRecipients: NonNullable<ActionCenterFollowThroughMailSnapshotBuildInput['hrRecipients']>
}) {
  const eligible = args.hrRecipients.reduce<ActionCenterFollowThroughMailHrOversightRecipient[]>(
    (acc, recipient) => {
      const email = normalizeEmail(recipient.email)
      const auditRole =
        recipient.role === 'hr_owner' || recipient.role === 'hr_member' ? recipient.role : null

      if (!email || !auditRole) return acc
      if (!recipient.canUpdate || !recipient.canScheduleReview) return acc
      const matchesScope =
        recipient.scopeType === 'org' || recipient.scopeValue === args.routeScopeValue

      if (!matchesScope) return acc
      if (acc.some((entry) => entry.email === email)) return acc

      acc.push({ email, auditRole })
      return acc
    },
    [],
  )

  return eligible
}

export function buildActionCenterFollowThroughMailRouteSnapshot(
  input: ActionCenterFollowThroughMailSnapshotBuildInput,
):
  | { ok: false; reason: 'unsupported-route' }
  | { ok: true; value: ActionCenterFollowThroughMailRouteSnapshot } {
  if (!isActionCenterReviewRhythmSupportedScanType(input.scanType)) {
    return {
      ok: false,
      reason: 'unsupported-route',
    }
  }

  const config = normalizeConfig(input.config)
  const routeScopeValue = normalizeText(input.routeScopeValue) ?? 'unknown-scope'

  return {
    ok: true,
    value: {
      routeId: input.routeId,
      routeScopeValue,
      orgId: normalizeText(input.orgId) ?? 'unknown-org',
      campaignId: normalizeText(input.campaignId) ?? input.routeId.split('::')[0] ?? input.routeId,
      campaignName: normalizeText(input.campaignName) ?? 'ExitScan',
      scopeLabel: normalizeText(input.scopeLabel) ?? routeScopeValue,
      scanType: 'exit',
      routeStatus: input.routeStatus,
      reviewScheduledFor: normalizeText(input.reviewScheduledFor),
      reviewCompletedAt: normalizeText(input.reviewCompletedAt),
      reviewOutcome: input.reviewOutcome ?? 'geen-uitkomst',
      ownerAssignedAt: normalizeText(input.ownerAssignedAt),
      hasFollowUpTarget: input.hasFollowUpTarget ?? false,
      remindersEnabled: config.remindersEnabled,
      cadenceDays: config.cadenceDays,
      reminderLeadDays: config.reminderLeadDays,
      escalationLeadDays: config.escalationLeadDays,
      managerRecipient: input.managerRecipient?.email
        ? {
            email: input.managerRecipient.email.trim().toLowerCase(),
            name: input.managerRecipient.name ?? null,
          }
        : null,
      hrOversightRecipients: getEligibleHrOversightRecipients({
        routeScopeValue,
        hrRecipients: input.hrRecipients ?? [],
      }),
    },
  }
}

function buildManagerRecipient(
  rows: WorkspaceMemberRow[],
  orgId: string,
  routeScopeValue: string,
): ActionCenterFollowThroughMailManagerRecipient | null {
  const assignment =
    rows.find(
      (row) =>
        row.org_id === orgId &&
        row.access_role === 'manager_assignee' &&
        row.scope_value === routeScopeValue &&
        row.can_view,
    ) ?? null

  const email = normalizeEmail(assignment?.login_email)
  if (!email) return null

  return {
    email,
    name: normalizeText(assignment?.display_name),
  }
}

function buildHrRecipientInputs(
  rows: WorkspaceMemberRow[],
  orgId: string,
) {
  return rows
    .filter(
      (row) =>
        row.org_id === orgId &&
        (row.access_role === 'hr_owner' || row.access_role === 'hr_member') &&
        row.can_view,
    )
    .map((row) => ({
      email: row.login_email,
      role: row.access_role,
      canUpdate: row.can_update,
      canScheduleReview: row.can_schedule_review,
      scopeType: row.scope_type,
      scopeValue: row.scope_value,
    }))
}

function buildManagerResponseScheduleKey(args: {
  campaignId: string
  routeScopeType: 'department' | 'item'
  routeScopeValue: string
}) {
  return `${args.campaignId}::${args.routeScopeType}::${args.routeScopeValue}`
}

function buildCanonicalReviewScheduleByRoute(
  rows: ManagerResponseScheduleRow[],
) {
  const canonicalRowsByRoute = rows.reduce<
    Map<string, { reviewScheduledFor: string | null; updatedAt: number | null }>
  >((acc, row) => {
    if (!row.campaign_id || !row.route_scope_value) {
      return acc
    }

    let routeScopeType = row.route_scope_type
    if (!routeScopeType) {
      try {
        routeScopeType = inferActionCenterManagerResponseScopeType(row.route_scope_value)
      } catch {
        return acc
      }
    }

    const scheduleKey = buildManagerResponseScheduleKey({
      campaignId: row.campaign_id,
      routeScopeType,
      routeScopeValue: row.route_scope_value,
    })
    const updatedAtValue = normalizeText(row.updated_at)
    const updatedAt =
      updatedAtValue ? new Date(updatedAtValue).getTime() : null
    const nextUpdatedAt = Number.isNaN(updatedAt) ? null : updatedAt
    const current = acc.get(scheduleKey)

    if (!current) {
      acc.set(scheduleKey, {
        reviewScheduledFor: normalizeText(row.review_scheduled_for),
        updatedAt: nextUpdatedAt,
      })
      return acc
    }

    const shouldReplace =
      current.updatedAt === null ||
      (nextUpdatedAt !== null && nextUpdatedAt >= current.updatedAt)

    if (shouldReplace) {
      acc.set(scheduleKey, {
        reviewScheduledFor: normalizeText(row.review_scheduled_for),
        updatedAt: nextUpdatedAt,
      })
    }

    return acc
  }, new Map<string, { reviewScheduledFor: string | null; updatedAt: number | null }>())

  return new Map(
    [...canonicalRowsByRoute.entries()].map(([key, value]) => [key, value.reviewScheduledFor]),
  )
}

export async function getActionCenterFollowThroughMailData(args: {
  context: SuiteAccessContext
  orgMemberships: SuiteOrgMembership[]
  currentUserWorkspaceMemberships: ActionCenterWorkspaceMember[]
}) {
  const pageData = await getActionCenterPageData({
    context: args.context,
    orgMemberships: args.orgMemberships,
    currentUserWorkspaceMemberships: args.currentUserWorkspaceMemberships,
  })

  const eligibleItems = pageData.items.filter((item) => item.sourceLabel === 'ExitScan')
  if (eligibleItems.length === 0) {
    return {
      snapshots: [] as ActionCenterFollowThroughMailRouteSnapshot[],
      routeIds: [] as string[],
    }
  }

  const routeIds = eligibleItems.map((item) => item.id)
  const campaignIds = [...new Set(eligibleItems.map((item) => item.coreSemantics.route.campaignId))]
  const orgIds = [...new Set(eligibleItems.map((item) => item.orgId).filter((value): value is string => Boolean(value)))]
  const admin = createAdminClient()

  const [
    workspaceRowsResult,
    rhythmRowsResult,
    campaignsResult,
    managerResponsesResult,
  ] = await Promise.all([
    admin
      .from('action_center_workspace_members')
      .select(
        'org_id, user_id, display_name, login_email, access_role, scope_type, scope_value, can_view, can_update, can_schedule_review',
      )
      .in('org_id', orgIds),
    admin
      .from('action_center_review_rhythm_configs')
      .select('route_id, cadence_days, reminder_lead_days, escalation_lead_days, reminders_enabled')
      .in('route_id', routeIds),
    admin.from('campaigns').select('id, name, organization_id, scan_type').in('id', campaignIds),
    admin
      .from('action_center_manager_responses')
      .select('campaign_id, route_scope_type, route_scope_value, review_scheduled_for, updated_at')
      .in('campaign_id', campaignIds),
  ])

  if (workspaceRowsResult.error) {
    throw new Error(workspaceRowsResult.error.message ?? 'Action Center workspace members query failed.')
  }
  if (rhythmRowsResult.error) {
    throw new Error(rhythmRowsResult.error.message ?? 'Action Center review rhythm query failed.')
  }
  if (campaignsResult.error) {
    throw new Error(campaignsResult.error.message ?? 'Action Center campaign query failed.')
  }
  if (managerResponsesResult.error) {
    throw new Error(
      managerResponsesResult.error.message ?? 'Action Center manager response query failed.',
    )
  }

  const workspaceRows = (workspaceRowsResult.data ?? []) as WorkspaceMemberRow[]
  const campaignsById = new Map(
    ((campaignsResult.data ?? []) as CampaignRow[]).map((campaign) => [campaign.id, campaign]),
  )
  const canonicalReviewScheduleByRoute = buildCanonicalReviewScheduleByRoute(
    (managerResponsesResult.data ?? []) as ManagerResponseScheduleRow[],
  )
  const rhythmConfigByRouteId = ((rhythmRowsResult.data ?? []) as ReviewRhythmRow[]).reduce<
    Record<string, ActionCenterReviewRhythmConfig>
  >((acc, row) => {
    if (!row.route_id) return acc

    acc[row.route_id] = normalizeActionCenterReviewRhythmConfig({
      cadence_days: row.cadence_days,
      reminder_lead_days: row.reminder_lead_days,
      escalation_lead_days: row.escalation_lead_days,
      reminders_enabled: row.reminders_enabled,
    })
    return acc
  }, {})

  const snapshots = eligibleItems.flatMap((item) => {
    const route = item.coreSemantics.route
    const campaign = campaignsById.get(route.campaignId)
    if (!campaign) return []

    const routeScopeValue = normalizeText(item.teamId)
    let canonicalReviewScheduledFor: string | null = null
    if (routeScopeValue) {
      try {
        const routeScopeType = inferActionCenterManagerResponseScopeType(routeScopeValue)
        const scheduleKey = buildManagerResponseScheduleKey({
          campaignId: campaign.id,
          routeScopeType,
          routeScopeValue,
        })

        if (canonicalReviewScheduleByRoute.has(scheduleKey)) {
          canonicalReviewScheduledFor = canonicalReviewScheduleByRoute.get(scheduleKey) ?? null
        }
      } catch {
        canonicalReviewScheduledFor = null
      }
    }

    const snapshot = buildActionCenterFollowThroughMailRouteSnapshot({
      routeId: item.id,
      routeScopeValue,
      orgId: item.orgId ?? campaign.organization_id,
      campaignId: campaign.id,
      campaignName: campaign.name,
      scopeLabel: item.teamLabel,
      scanType: campaign.scan_type,
      routeStatus: item.status,
      reviewScheduledFor: canonicalReviewScheduledFor,
      reviewCompletedAt: route.reviewCompletedAt,
      reviewOutcome: route.reviewOutcome,
      ownerAssignedAt: route.ownerAssignedAt,
      hasFollowUpTarget: route.hasFollowUpTarget,
      managerRecipient: buildManagerRecipient(workspaceRows, campaign.organization_id, item.teamId),
      hrRecipients: buildHrRecipientInputs(workspaceRows, campaign.organization_id),
      config: rhythmConfigByRouteId[item.id] ?? buildDefaultActionCenterReviewRhythmConfig(),
    })

    return snapshot.ok ? [snapshot.value] : []
  })

  return { snapshots, routeIds }
}

export async function getActionCenterFollowThroughMailDispatchData() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('campaigns')
    .select('organization_id')
    .eq('scan_type', 'exit')

  if (error) {
    throw new Error(error.message ?? 'Action Center dispatch campaign discovery failed.')
  }

  const orgIds = [...new Set((data ?? []).map((row) => row.organization_id).filter(Boolean))]
  const context: SuiteAccessContext = {
    persona: 'verisight_admin',
    isVerisightAdmin: true,
    memberRole: null,
    primaryOrgId: orgIds[0] ?? null,
    organizationIds: orgIds,
    workspaceOrgIds: orgIds,
    managerScopeValues: [],
    canViewInsights: true,
    canViewReports: true,
    canViewActionCenter: true,
    canUpdateActionCenter: true,
    canManageActionCenterAssignments: true,
    canScheduleActionCenterReview: true,
    managerOnly: false,
  }

  return getActionCenterFollowThroughMailData({
    context,
    orgMemberships: [],
    currentUserWorkspaceMemberships: [],
  })
}
