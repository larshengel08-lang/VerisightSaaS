import { describe, expect, it } from 'vitest'
import { buildReminderText, type ReminderTextInput } from '@/lib/dashboard/reminder-text'

function input(overrides: Partial<ReminderTextInput> = {}): ReminderTextInput {
  return {
    commsMode: 'self_send',
    scanType: 'retention' as const,
    scanLabel: 'Loep Behoud',
    organizationName: 'Acme BV',
    publicSurveyToken: 'tok-123',
    frontendBaseUrl: 'https://www.getloep.nl',
    segmentDepartments: null,
    deliveryMode: 'baseline' as const,
    launchDate: '2026-06-01',
    participantCommsConfig: null,
    ...overrides,
  }
}

describe('buildReminderText (spec 2026-09-11 par. 6)', () => {
  it('geeft bij self_send de eigen-verzendtekst met surveylink', () => {
    const text = buildReminderText(input())
    expect(text).toContain('https://www.getloep.nl/survey/open/tok-123')
    expect(text).toContain('Herinnering')
    expect(text).not.toContain('Loep verzorgt de uitnodiging')
  })

  it('gebruikt bij afdelingsrapportage de links per afdeling', () => {
    const text = buildReminderText(
      input({
        segmentDepartments: [
          { label: 'Zorg', slug: 'zorg' },
          { label: 'Kantoor', slug: 'kantoor' },
        ],
      }),
    )
    expect(text).toContain('?afd=zorg')
    expect(text).toContain('?afd=kantoor')
  })

  it('houdt de oude managed-tekst voor bestaande managed-campagnes', () => {
    const text = buildReminderText(input({ commsMode: 'managed' }))
    expect(text).toContain('Loep verzorgt de uitnodiging')
  })

  it('valt bij self_send zonder surveylink niet stil terug op de managed-tekst', () => {
    const text = buildReminderText(input({ publicSurveyToken: null }))
    expect(text).not.toContain('Loep verzorgt de uitnodiging')
    expect(text).not.toMatch(/https?:\/\//)
    expect(text).toContain('nog geen surveylink beschikbaar')
  })

  it('valt bij self_send met een lege string als token ook niet terug op de managed-tekst', () => {
    const text = buildReminderText(input({ publicSurveyToken: '' }))
    expect(text).not.toContain('Loep verzorgt de uitnodiging')
    expect(text).not.toMatch(/https?:\/\//)
  })
})
