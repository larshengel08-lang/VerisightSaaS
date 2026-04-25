import { describe, expect, it } from 'vitest'

import {
  buildActionCenterPermissionEnvelope,
  buildActionCenterWorkspaceSummary,
  getFutureActionCenterAdapter,
} from '@/lib/action-center-shared-core'
import {
  buildExitActionCenterWorkspace,
  getExitActionCenterCarrier,
} from '@/lib/action-center-exit'
import {
  buildMtoActionCenterWorkspace,
  describeMtoDesignInput,
  getMtoActionCenterCarrier,
} from '@/lib/action-center-mto'

describe('action center shared core', () => {
  it('keeps the workspace bounded to follow-through signals instead of generic project planning', () => {
    const summary = buildActionCenterWorkspaceSummary({
      dossiers: [
        {
          id: 'dos-1',
          title: 'Pilot learning closure',
          status: 'open',
          ownerId: 'owner-1',
          permissionEnvelope: buildActionCenterPermissionEnvelope({
            role: 'owner',
          }),
        },
      ],
      assignments: [
        {
          id: 'asg-1',
          dossierId: 'dos-1',
          title: 'Bevestig follow-upbesluit',
          state: 'blocked',
          kind: 'follow_up',
          ownerId: 'owner-1',
        },
      ],
      reviewMoments: [
        {
          id: 'rev-1',
          dossierId: 'dos-1',
          scheduledFor: '2026-05-01',
          state: 'due',
        },
      ],
      followUpSignals: [
        {
          id: 'sig-1',
          dossierId: 'dos-1',
          kind: 'decision_due',
          severity: 'critical',
          state: 'open',
        },
      ],
    })

    expect(summary.workspaceKind).toBe('follow_through')
    expect(summary.openDossierCount).toBe(1)
    expect(summary.blockedCount).toBe(1)
    expect(summary.reviewDueCount).toBe(1)
    expect(summary.escalationCount).toBe(1)
    expect(summary.projectPlanCount).toBe(0)
    expect(summary.advisoryCount).toBe(0)
  })

  it('keeps the permission envelope limited to follow-through actions', () => {
    const memberEnvelope = buildActionCenterPermissionEnvelope({ role: 'member' })
    const ownerEnvelope = buildActionCenterPermissionEnvelope({ role: 'owner' })

    expect(memberEnvelope.canViewWorkspace).toBe(true)
    expect(memberEnvelope.canUpdateAssignments).toBe(false)
    expect(memberEnvelope.canManagePermissions).toBe(false)
    expect(memberEnvelope.canOpenProductAdapters).toBe(false)

    expect(ownerEnvelope.canUpdateAssignments).toBe(true)
    expect(ownerEnvelope.canScheduleReviewMoments).toBe(true)
    expect(ownerEnvelope.canCloseDossiers).toBe(true)
    expect(ownerEnvelope.canOpenProductAdapters).toBe(false)
  })

  it('keeps MTO active while future product adapters stay inactive by default', () => {
    const mtoDesignInput = describeMtoDesignInput({
      source: 'mto',
      themes: ['werkdruk', 'rolhelderheid'],
      notes: 'Gebruik alleen als ontwerpinspiratie voor dossiervelden.',
    })
    const carrier = getMtoActionCenterCarrier()
    const retentionAdapter = getFutureActionCenterAdapter('retention')

    expect(carrier.status).toBe('active')
    expect(carrier.workspaceKind).toBe('follow_through')
    expect(carrier.ownerModel).toBe('hr_central')
    expect(carrier.managerScope).toBe('department_only')
    expect(carrier.reviewPressureVisible).toBe(true)
    expect(carrier.dossierFirst).toBe(true)
    expect(carrier.canOpenOtherProductAdapters).toBe(false)
    expect(mtoDesignInput.mode).toBe('active_follow_through')
    expect(mtoDesignInput.canCreateAssignments).toBe(true)
    expect(mtoDesignInput.canOpenCarrier).toBe(true)
    expect(retentionAdapter.status).toBe('inactive')
    expect(retentionAdapter.liveEntryEnabled).toBe(false)
  })

  it('projects MTO dossiers and review pressure onto the shared follow-through core', () => {
    const workspace = buildMtoActionCenterWorkspace({
      role: 'owner',
      dossiers: [
        {
          id: 'dos-1',
          title: 'Werkdruk - Support',
          triageStatus: 'bevestigd',
          departmentLabel: 'Support',
          managerLabel: 'Sanne',
          firstActionTaken: 'Roosterdruk binnen 2 weken herverdelen',
          reviewMoment: 'Herlees over 30 dagen',
          managementActionOutcome: null,
          nextRoute: null,
          stopReason: null,
        },
        {
          id: 'dos-2',
          title: 'Rolhelderheid - Sales',
          triageStatus: 'nieuw',
          departmentLabel: 'Sales',
          managerLabel: null,
          firstActionTaken: null,
          reviewMoment: null,
          managementActionOutcome: null,
          nextRoute: null,
          stopReason: null,
        },
      ],
    })

    expect(workspace.carrier.ownerModel).toBe('hr_central')
    expect(workspace.carrier.managerScope).toBe('department_only')
    expect(workspace.summary.workspaceKind).toBe('follow_through')
    expect(workspace.summary.openDossierCount).toBe(2)
    expect(workspace.summary.blockedCount).toBe(1)
    expect(workspace.summary.reviewDueCount).toBe(2)
    expect(workspace.summary.escalationCount).toBe(1)
    expect(workspace.managerDepartmentLabels).toEqual(['Sales', 'Support'])
    expect(workspace.assignments[0]?.state).toBe('active')
    expect(workspace.assignments[1]?.state).toBe('blocked')
    expect(workspace.followUpSignals.some((signal) => signal.kind === 'owner_missing')).toBe(true)
    expect(workspace.followUpSignals.some((signal) => signal.kind === 'decision_due')).toBe(true)
  })

  it('activates ExitScan as a bounded action center adapter without opening the suite', () => {
    const carrier = getExitActionCenterCarrier()
    const retentionAdapter = getFutureActionCenterAdapter('retention')

    expect(carrier.label).toBe('ExitScan-adapter')
    expect(carrier.status).toBe('active')
    expect(carrier.workspaceKind).toBe('follow_through')
    expect(carrier.routeScope).toBe('exit_only')
    expect(carrier.ownerModel).toBe('explicit_named_owner')
    expect(carrier.reviewDiscipline).toBe('follow_up_review_required')
    expect(carrier.canOpenOtherProductAdapters).toBe(false)
    expect(retentionAdapter.status).toBe('inactive')
    expect(retentionAdapter.liveEntryEnabled).toBe(false)
  })

  it('projects ExitScan dossiers onto the shared core with explicit owner and review guardrails', () => {
    const workspace = buildExitActionCenterWorkspace({
      role: 'owner',
      dossiers: [
        {
          id: 'dos-1',
          title: 'ExitScan - Support closeout',
          triageStatus: 'bevestigd',
          deliveryMode: 'live',
          managementOwnerLabel: 'Sanne',
          reviewOwnerLabel: 'Verisight',
          firstActionTaken: 'Plan exit-closeout met HR en teamlead',
          reviewMoment: 'Herlees over 30 dagen',
          managementActionOutcome: null,
          nextRoute: null,
          stopReason: null,
        },
        {
          id: 'dos-2',
          title: 'ExitScan - Sales learned route',
          triageStatus: 'nieuw',
          deliveryMode: 'baseline',
          managementOwnerLabel: null,
          reviewOwnerLabel: null,
          firstActionTaken: null,
          reviewMoment: null,
          managementActionOutcome: null,
          nextRoute: null,
          stopReason: null,
        },
      ],
    })

    expect(workspace.carrier.routeScope).toBe('exit_only')
    expect(workspace.summary.workspaceKind).toBe('follow_through')
    expect(workspace.summary.openDossierCount).toBe(2)
    expect(workspace.summary.blockedCount).toBe(1)
    expect(workspace.summary.reviewDueCount).toBe(2)
    expect(workspace.summary.escalationCount).toBe(1)
    expect(workspace.activeDeliveryModes).toEqual(['baseline', 'live'])
    expect(workspace.assignments[0]?.state).toBe('active')
    expect(workspace.assignments[1]?.state).toBe('blocked')
    expect(workspace.followUpSignals.some((signal) => signal.kind === 'owner_missing')).toBe(true)
    expect(workspace.followUpSignals.some((signal) => signal.kind === 'decision_due')).toBe(true)
  })
})
