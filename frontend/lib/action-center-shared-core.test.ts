import { describe, expect, it } from 'vitest'

import {
  buildActionCenterPermissionEnvelope,
  buildActionCenterWorkspaceSummary,
  getFutureActionCenterAdapter,
} from '@/lib/action-center-shared-core'
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

  it('keeps MTO input as design-only and future adapters inactive', () => {
    const mtoDesignInput = describeMtoDesignInput({
      source: 'mto',
      themes: ['werkdruk', 'rolhelderheid'],
      notes: 'Gebruik alleen als ontwerpinspiratie voor dossiervelden.',
    })
    const exitAdapter = getFutureActionCenterAdapter('exit')

    expect(mtoDesignInput.mode).toBe('design_input_only')
    expect(mtoDesignInput.canCreateAssignments).toBe(false)
    expect(mtoDesignInput.canOpenCarrier).toBe(false)
    expect(exitAdapter.status).toBe('inactive')
    expect(exitAdapter.liveEntryEnabled).toBe(false)
  })
})
