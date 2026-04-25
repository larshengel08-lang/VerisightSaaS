import { describe, expect, it } from 'vitest'

import {
  buildActionCenterPermissionEnvelope,
  buildActionCenterWorkspaceSummary,
  getFutureActionCenterAdapter,
} from '@/lib/action-center-shared-core'
import {
  buildExitActionCenterWorkspace,
  getExitActionCenterCarrier,
  isExitActionCenterCandidate,
} from '@/lib/action-center-exit'
import { describeMtoDesignInput } from '@/lib/action-center-mto'

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

  it('keeps MTO design-only while future product adapters stay inactive', () => {
    const mtoDesignInput = describeMtoDesignInput({
      source: 'mto',
      themes: ['werkdruk', 'rolhelderheid'],
      notes: 'Gebruik alleen als ontwerpinspiratie voor dossiervelden.',
    })
    const retentionAdapter = getFutureActionCenterAdapter('retention')

    expect(mtoDesignInput.mode).toBe('design_input_only')
    expect(mtoDesignInput.canCreateAssignments).toBe(false)
    expect(mtoDesignInput.canOpenCarrier).toBe(false)
    expect(retentionAdapter.status).toBe('inactive')
    expect(retentionAdapter.liveEntryEnabled).toBe(false)
  })

  it('keeps ExitScan as the only live action center consumer in this slice', () => {
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

  it('keeps route-only intake bounded once another product binding exists', () => {
    const exitCampaignIds = new Set(['camp-exit'])

    expect(
      isExitActionCenterCandidate({
        dossier: {
          scanType: 'exit',
          routeInterest: 'retentiescan',
          campaignId: 'camp-retention',
        },
        exitCampaignIds,
      }),
    ).toBe(true)
    expect(
      isExitActionCenterCandidate({
        dossier: {
          scanType: null,
          routeInterest: 'exitscan',
          campaignId: null,
        },
        exitCampaignIds,
      }),
    ).toBe(true)
    expect(
      isExitActionCenterCandidate({
        dossier: {
          scanType: 'retention',
          routeInterest: 'exitscan',
          campaignId: null,
        },
        exitCampaignIds,
      }),
    ).toBe(false)
    expect(
      isExitActionCenterCandidate({
        dossier: {
          scanType: null,
          routeInterest: 'exitscan',
          campaignId: 'camp-retention',
        },
        exitCampaignIds,
      }),
    ).toBe(false)
  })

  it('keeps the admin surface read-only while explicit dossier owners stay visible', () => {
    const workspace = buildExitActionCenterWorkspace({
      role: 'member',
      dossiers: [
        {
          id: 'dos-1',
          title: 'ExitScan - Support closeout',
          triageStatus: 'bevestigd',
          deliveryMode: 'live',
          managementOwnerLabel: 'Sanne',
          reviewOwnerLabel: 'Verisight',
          firstActionTaken: 'Plan exit-closeout met HR en teamlead',
          reviewMoment: null,
          managementActionOutcome: null,
          nextRoute: null,
          stopReason: null,
        },
      ],
    })

    expect(workspace.dossiers[0]?.ownerId).toBe('manager:sanne')
    expect(workspace.assignments[0]?.ownerId).toBe('manager:sanne')
    expect(workspace.dossiers[0]?.permissionEnvelope.canUpdateAssignments).toBe(false)
    expect(workspace.dossiers[0]?.permissionEnvelope.canManagePermissions).toBe(false)
    expect(workspace.reviewMoments[0]?.scheduledFor).toBe('Exit reviewmoment nog vastleggen')
  })
})
