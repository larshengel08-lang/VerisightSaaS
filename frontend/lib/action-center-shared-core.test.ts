import { describe, expect, it } from 'vitest'

import {
  buildActionCenterPermissionEnvelope,
  buildActionCenterWorkspaceSummary,
  getFutureActionCenterAdapter,
} from '@/lib/action-center-shared-core'
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

  it('activates MTO as the first action center carrier while future adapters stay inactive', () => {
    const mtoDesignInput = describeMtoDesignInput({
      source: 'mto',
      themes: ['werkdruk', 'rolhelderheid'],
      notes: 'Gebruik alleen als ontwerpinspiratie voor dossiervelden.',
    })
    const carrier = getMtoActionCenterCarrier()
    const exitAdapter = getFutureActionCenterAdapter('exit')

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
    expect(exitAdapter.status).toBe('inactive')
    expect(exitAdapter.liveEntryEnabled).toBe(false)
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
    expect(workspace.summary.reviewDueCount).toBe(1)
    expect(workspace.summary.escalationCount).toBe(1)
    expect(workspace.managerDepartmentLabels).toEqual(['Sales', 'Support'])
    expect(workspace.assignments[0]?.state).toBe('active')
    expect(workspace.assignments[1]?.state).toBe('blocked')
    expect(workspace.reviewMoments[0]?.state).toBe('scheduled')
    expect(workspace.reviewMoments[1]?.state).toBe('due')
    expect(workspace.followUpSignals.some((signal) => signal.kind === 'owner_missing')).toBe(true)
    expect(workspace.followUpSignals.some((signal) => signal.kind === 'decision_due')).toBe(true)
    expect(workspace.followUpSignals.filter((signal) => signal.kind === 'review_due')).toHaveLength(1)
  })
})
