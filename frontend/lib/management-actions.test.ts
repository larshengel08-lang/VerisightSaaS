import { describe, expect, it } from 'vitest'
import {
  buildManagementActionAccessEnvelope,
  buildManagementActionSummary,
  buildManagementActionSeedFromDepartmentRead,
  buildManagementActionTraceabilitySummary,
  canEditManagementAction,
  canViewManagementAction,
  getManagementActionStatusLabel,
  MANAGEMENT_ACTION_STATUS_OPTIONS,
  validateManagementActionCreationDraft,
  type ManagementActionRecord,
} from '@/lib/management-actions'

const baseAction: ManagementActionRecord = {
  id: 'action-1',
  organization_id: 'org-1',
  campaign_id: 'campaign-1',
  source_product: 'mto',
  source_scope_type: 'department',
  source_scope_key: 'department:operations',
  source_scope_label: 'Operations',
  source_read_stage: 'mto_department_intelligence',
  source_factor_key: 'workload',
  source_factor_label: 'Werkbelasting',
  source_signal_value: 7.6,
  source_question_key: null,
  source_question_label: null,
  title: 'Operations: werkbelasting vraagt een eerste brede prioriteitsroute',
  decision_context: 'Gebruik Operations als eerste bounded afdelingstraject.',
  expected_outcome: 'Heldere prioriteit en eerste managementstap.',
  measured_outcome: null,
  blocker_note: null,
  last_review_outcome: null,
  status: 'assigned',
  owner_label: 'Operations manager',
  owner_email: 'manager@verisight.test',
  due_date: '2026-05-03',
  review_date: '2026-05-17',
  created_by: null,
  updated_by: null,
  created_at: '2026-04-19T10:00:00.000Z',
  updated_at: '2026-04-19T10:00:00.000Z',
}

describe('management action contracts', () => {
  it('keeps the lifecycle contract stable and human-readable', () => {
    expect(MANAGEMENT_ACTION_STATUS_OPTIONS.map((option) => option.value)).toEqual([
      'open',
      'assigned',
      'in_progress',
      'in_review',
      'closed',
      'follow_up_needed',
    ])
    expect(getManagementActionStatusLabel('in_review')).toBe('In review')
    expect(getManagementActionStatusLabel('follow_up_needed')).toBe('Vervolg nodig')
  })

  it('builds a traceability summary from product, department and factor', () => {
    expect(buildManagementActionTraceabilitySummary(baseAction)).toBe('MTO / Operations / Werkbelasting')
  })

  it('lets HR see everything while viewers stay limited to their own assigned action', () => {
    expect(canViewManagementAction({ orgRole: 'member', userEmail: 'hr@verisight.test', action: baseAction })).toBe(true)
    expect(canEditManagementAction({ orgRole: 'member', userEmail: 'hr@verisight.test', action: baseAction })).toBe(true)

    expect(canViewManagementAction({ orgRole: 'viewer', userEmail: 'manager@verisight.test', action: baseAction })).toBe(true)
    expect(canEditManagementAction({ orgRole: 'viewer', userEmail: 'manager@verisight.test', action: baseAction })).toBe(true)

    expect(canViewManagementAction({ orgRole: 'viewer', userEmail: 'other@verisight.test', action: baseAction })).toBe(false)
    expect(canEditManagementAction({ orgRole: 'viewer', userEmail: 'other@verisight.test', action: baseAction })).toBe(false)
  })

  it('seeds an MTO department action with traceability and owner fallback intact', () => {
    const seeded = buildManagementActionSeedFromDepartmentRead({
      organizationId: 'org-1',
      campaignId: 'campaign-1',
      departmentRead: {
        segmentLabel: 'Operations',
        factorKey: 'workload',
        factorLabel: 'Werkbelasting',
        avgSignal: 7.6,
        decision: 'Beslis of werkbelasting nu het eerste organisatiethema is.',
        handoffBody: 'Bevestig eerst de actiebehoefte, wijs een eigenaar toe en houd het vervolg bounded.',
        owner: 'HR lead + afdelingseigenaar',
      },
      ownerDefault: {
        owner_label: 'Operations manager',
        owner_email: 'manager@verisight.test',
      },
    })

    expect(seeded.source_product).toBe('mto')
    expect(seeded.source_scope_type).toBe('department')
    expect(seeded.source_scope_label).toBe('Operations')
    expect(seeded.source_factor_label).toBe('Werkbelasting')
    expect(seeded.status).toBe('assigned')
    expect(seeded.owner_label).toBe('Operations manager')
    expect(seeded.owner_email).toBe('manager@verisight.test')
    expect(seeded.title.toLowerCase()).toContain('operations')
  })

  it('summarizes open, review and follow-up pressure for the bounded loop', () => {
    const summary = buildManagementActionSummary([
      baseAction,
      {
        ...baseAction,
        id: 'action-2',
        status: 'in_review',
        review_date: '2026-04-20',
      },
      {
        ...baseAction,
        id: 'action-3',
        status: 'follow_up_needed',
        review_date: '2026-04-18',
      },
    ], '2026-04-19')

    expect(summary.openCount).toBe(1)
    expect(summary.reviewCount).toBe(1)
    expect(summary.followUpCount).toBe(1)
    expect(summary.overdueReviewCount).toBe(1)
  })

  it('tracks theme, optional question, blockers, and next review summary', () => {
    const seeded = buildManagementActionSeedFromDepartmentRead({
      organizationId: 'org-1',
      campaignId: 'camp-1',
      departmentRead: {
        segmentLabel: 'Operations',
        factorKey: 'workload',
        factorLabel: 'Werkbelasting',
        avgSignal: 7.2,
        decision: 'Open eerst een bounded werkdruksprint.',
        handoffBody: 'Gebruik dit alleen binnen MTO.',
        owner: 'Manager Operations',
      },
      ownerDefault: {
        owner_label: 'Manager Operations',
        owner_email: 'ops@example.com',
      },
      question: {
        key: 'workload.q1',
        label: 'Welke brede managementvraag over werkbelasting moet nu eerst expliciet worden beantwoord?',
      },
    })

    expect(seeded.source_factor_key).toBe('workload')
    expect(seeded.source_question_key).toBe('workload.q1')
    expect(seeded.source_question_label).toContain('werkbelasting')
    expect(seeded.blocker_note).toBeNull()
  })

  it('requires owner, review date, and expected outcome for guided action creation', () => {
    const errors = validateManagementActionCreationDraft({
      owner_label: '',
      review_date: '',
      expected_outcome: ' ',
    })

    expect(errors.owner_label).toContain('eigenaar')
    expect(errors.review_date).toContain('reviewmoment')
    expect(errors.expected_outcome).toContain('verwachte uitkomst')
  })

  it('applies guided creation fields without losing MTO traceability', () => {
    const seeded = buildManagementActionSeedFromDepartmentRead({
      organizationId: 'org-1',
      campaignId: 'camp-1',
      departmentRead: {
        segmentLabel: 'Operations',
        factorKey: 'workload',
        factorLabel: 'Werkbelasting',
        avgSignal: 7.2,
        decision: 'Open eerst een bounded werkdruksprint.',
        handoffBody: 'Gebruik dit alleen binnen MTO.',
        owner: 'Manager Operations',
      },
      question: {
        key: 'workload.q1',
        label: 'Welke brede managementvraag over werkbelasting moet nu eerst expliciet worden beantwoord?',
      },
      guidedFields: {
        title: 'Operations: herstel werkritme in de piekweken',
        owner_label: 'Manager Operations',
        owner_email: 'ops@example.com',
        review_date: '2026-05-17',
        expected_outcome: 'Binnen een maand een voorspelbaarder teamritme.',
      },
    })

    expect(seeded.source_scope_label).toBe('Operations')
    expect(seeded.source_question_key).toBe('workload.q1')
    expect(seeded.title).toContain('herstel werkritme')
    expect(seeded.owner_email).toBe('ops@example.com')
    expect(seeded.review_date).toBe('2026-05-17')
    expect(seeded.expected_outcome).toContain('voorspelbaarder')
  })

  it('builds a department-bounded access envelope for viewer managers', () => {
    const envelope = buildManagementActionAccessEnvelope({
      orgRole: 'viewer',
      userEmail: 'ops@example.com',
      ownerDefaults: [
        { department: 'Operations', owner_label: 'Ops manager', owner_email: 'ops@example.com' },
        { department: 'People Ops', owner_label: 'People manager', owner_email: 'people@example.com' },
      ],
    })

    expect(envelope.canSeeAll).toBe(false)
    expect(envelope.departmentLabels).toEqual(['Operations'])
  })

  it('lets viewer managers access actions for their mapped department even if action ownership differs', () => {
    expect(
      canViewManagementAction({
        orgRole: 'viewer',
        userEmail: 'ops@example.com',
        ownerDefaults: [
          { department: 'Operations', owner_label: 'Ops manager', owner_email: 'ops@example.com' },
        ],
        action: {
          owner_email: 'hr@verisight.test',
          source_scope_label: 'Operations',
        },
      }),
    ).toBe(true)

    expect(
      canViewManagementAction({
        orgRole: 'viewer',
        userEmail: 'ops@example.com',
        ownerDefaults: [
          { department: 'Operations', owner_label: 'Ops manager', owner_email: 'ops@example.com' },
        ],
        action: {
          owner_email: 'people@verisight.test',
          source_scope_label: 'People Ops',
        },
      }),
    ).toBe(false)
  })
})
