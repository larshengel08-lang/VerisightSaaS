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
  getDueReminders,
  normalizeSelfSendConfig,
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
