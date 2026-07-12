import { describe, expect, it } from 'vitest'
import {
  MIN_INVITED_COUNT,
  buildSurveyLink,
  buildInviteTemplate,
  buildReminderTemplate,
  buildSegmentDepartments,
  buildSegmentSurveyLinks,
  computeResponseRatePct,
  createDefaultSelfSendConfig,
  formatDepartmentProgress,
  getDueReminders,
  normalizeSelfSendConfig,
  prepareSegmentDepartmentsUpdate,
  resolveReminderDate,
  validateInvitedCount,
} from './self-send-comms'

describe('self-send-comms', () => {
  it('defaults sender name to empty and has no end date', () => {
    const config = createDefaultSelfSendConfig()
    expect(config.senderName).toBe('')
    expect(config.endDate).toBeNull()
  })

  it('rejects invited counts below the minimum', () => {
    expect(validateInvitedCount(4)).toHaveLength(1)
    expect(validateInvitedCount(MIN_INVITED_COUNT)).toHaveLength(0)
    expect(validateInvitedCount(34)).toHaveLength(0)
  })

  it('computes response rate against the manual denominator and caps at 100', () => {
    expect(computeResponseRatePct(0, 10)).toBe(0)
    expect(computeResponseRatePct(5, 0)).toBeNull()
    expect(computeResponseRatePct(17, 34)).toBe(50)
    expect(computeResponseRatePct(40, 34)).toBe(100)
  })

  it('builds the open survey link from the public token', () => {
    expect(buildSurveyLink('https://verisight.nl', 'tok-123')).toBe(
      'https://verisight.nl/survey/open/tok-123',
    )
    expect(buildSurveyLink('https://verisight.nl/', 'tok-123')).toBe(
      'https://verisight.nl/survey/open/tok-123',
    )
  })

  it('resolves relative reminders against the end date', () => {
    expect(
      resolveReminderDate({ id: 'a', kind: 'relative', daysBeforeEnd: 3, date: null, notifiedAt: null }, '2026-06-20'),
    ).toBe('2026-06-17')
    expect(
      resolveReminderDate({ id: 'b', kind: 'absolute', daysBeforeEnd: null, date: '2026-06-18', notifiedAt: null }, '2026-06-20'),
    ).toBe('2026-06-18')
  })

  it('returns reminders due on or before today that are not yet notified', () => {
    const reminders = [
      { id: 'a', kind: 'relative' as const, daysBeforeEnd: 3, date: null, notifiedAt: null },
      { id: 'b', kind: 'absolute' as const, daysBeforeEnd: null, date: '2026-06-25', notifiedAt: null },
      { id: 'c', kind: 'absolute' as const, daysBeforeEnd: null, date: '2026-06-17', notifiedAt: '2026-06-17T08:00:00Z' },
    ]
    const due = getDueReminders(reminders, '2026-06-20', '2026-06-17')
    expect(due.map((r) => r.id)).toEqual(['a'])
  })

  it('bakes the survey link into the invitation template body', () => {
    const tpl = buildInviteTemplate({
      senderName: 'Sarah de Vries, HR',
      organizationName: 'Acme BV',
      scanLabel: 'Loep Vertrek',
      surveyLink: 'https://verisight.nl/survey/open/tok-123',
    })
    expect(tpl.subject).toContain('Acme BV')
    expect(tpl.body).toContain('https://verisight.nl/survey/open/tok-123')
    expect(tpl.body).toContain('Sarah de Vries, HR')
  })

  it('reminder template references the same link and signals it is a reminder', () => {
    const tpl = buildReminderTemplate({
      senderName: 'Sarah',
      organizationName: 'Acme BV',
      scanLabel: 'Loep Vertrek',
      surveyLink: 'https://verisight.nl/survey/open/tok-123',
    })
    expect(tpl.subject.toLowerCase()).toContain('herinnering')
    expect(tpl.body).toContain('https://verisight.nl/survey/open/tok-123')
  })

  it('normalizes partial stored config without losing edited templates', () => {
    const config = normalizeSelfSendConfig({ senderName: '  HR  ', inviteSubject: 'Custom' })
    expect(config.senderName).toBe('HR')
    expect(config.inviteSubject).toBe('Custom')
    expect(config.reminderSubject).toBe('')
  })
})

describe('segment-links', () => {
  it('bouwt per afdeling een link met slug-parameter', () => {
    const links = buildSegmentSurveyLinks('https://www.getloep.nl', 'tok-123', [
      { label: 'Sales', slug: 'sales' },
      { label: 'Customer Success', slug: 'customer-success' },
    ])
    expect(links).toEqual([
      { label: 'Sales', url: 'https://www.getloep.nl/survey/open/tok-123?afd=sales' },
      { label: 'Customer Success', url: 'https://www.getloep.nl/survey/open/tok-123?afd=customer-success' },
    ])
  })

  it('genereert slugs uit labels (zelfde regels als backend)', () => {
    expect(buildSegmentDepartments(['Sales', '  Customer Success '])).toEqual([
      { label: 'Sales', slug: 'sales' },
      { label: 'Customer Success', slug: 'customer-success' },
    ])
  })

  it('weigert duplicaten en lege labels', () => {
    expect(() => buildSegmentDepartments(['Sales', 'sales'])).toThrow()
    expect(() => buildSegmentDepartments(['  '])).toThrow()
  })
})

describe('prepareSegmentDepartmentsUpdate', () => {
  const existing = [
    { label: 'Sales', slug: 'sales', invited_count: 10 },
    { label: 'Operations', slug: 'operations', invited_count: 14 },
  ]

  it('staat toevoegen en aantal-wijziging altijd toe', () => {
    const out = prepareSegmentDepartmentsUpdate(
      existing,
      [
        { label: 'Sales', invited_count: 12 },
        { label: 'Operations', invited_count: 14 },
        { label: 'Kantoor', invited_count: 8 },
      ],
      new Set(['Sales', 'Operations']),
    )
    expect(out.departments.map((d) => d.slug)).toEqual(['sales', 'operations', 'kantoor'])
    expect(out.departments[0].invited_count).toBe(12)
    expect(out.totalInvited).toBe(34)
  })

  it('weigert hernoemen/verwijderen van een vergrendelde afdeling', () => {
    // Sales (vergrendeld) ontbreekt in de nieuwe lijst -> verwijdering -> fout.
    // Tweede afdeling (Kantoor) erbij zodat de min-2-check niet eerder triggert.
    expect(() =>
      prepareSegmentDepartmentsUpdate(existing,
        [{ label: 'Operations', invited_count: 14 }, { label: 'Kantoor', invited_count: 6 }],
        new Set(['Sales'])),
    ).toThrow(/Sales/)
  })

  it('staat hernoemen/verwijderen van een onvergrendelde afdeling toe', () => {
    const out = prepareSegmentDepartmentsUpdate(
      existing,
      [
        { label: 'Sales & Accountmanagement', invited_count: 10 },
        { label: 'Operations', invited_count: 14 },
      ],
      new Set(['Operations']),
    )
    expect(out.departments[0].slug).toBe('sales-accountmanagement')
  })

  it('eist minimaal 2 afdelingen', () => {
    expect(() =>
      prepareSegmentDepartmentsUpdate(existing, [{ label: 'Sales', invited_count: 10 }],
        new Set()),
    ).toThrow(/minimaal 2/)
  })

  it('eist een positief aantal per afdeling', () => {
    expect(() =>
      prepareSegmentDepartmentsUpdate(existing,
        [{ label: 'Sales', invited_count: 0 }, { label: 'Ops', invited_count: 5 }],
        new Set()),
    ).toThrow(/aantal/i)
  })
})

describe('formatDepartmentProgress', () => {
  it('toont X van Y met percentage bij bekende noemer', () => {
    expect(formatDepartmentProgress(11, 14)).toBe('11 van 14 ingevuld (79%)')
  })
  it('degradeert eerlijk zonder noemer', () => {
    expect(formatDepartmentProgress(11, null)).toBe('11 ingevuld')
    expect(formatDepartmentProgress(11, undefined)).toBe('11 ingevuld')
  })
  it('cap op 100%', () => {
    expect(formatDepartmentProgress(16, 14)).toBe('16 van 14 ingevuld (100%)')
  })
})
