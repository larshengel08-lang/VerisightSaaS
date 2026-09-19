import { describe, expect, it } from 'vitest'
import { buildReminderText, isReminderTextAvailable, splitReminderText, type ReminderTextInput } from '@/lib/dashboard/reminder-text'

function input(overrides: Partial<ReminderTextInput> = {}): ReminderTextInput {
  return {
    commsMode: 'self_send',
    scanType: 'retention' as const,
    organizationName: 'Acme BV',
    publicSurveyToken: 'tok-123',
    frontendBaseUrl: 'https://www.getloep.nl',
    segmentDepartments: null,
    deliveryMode: 'baseline' as const,
    launchDate: '2026-06-01',
    closesAt: null,
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

  // Een token van alleen spaties is waar in JS en glipte daardoor langs de
  // guard: dat bouwde een link met spaties erin, in een tekst die er verder
  // uitzag als een gewone uitnodiging.
  it('behandelt een token van alleen witruimte als ontbrekend', () => {
    const text = buildReminderText(input({ publicSurveyToken: '   ' }))
    expect(text).not.toContain('Loep verzorgt de uitnodiging')
    expect(text).not.toMatch(/https?:\/\//)
    expect(text).toContain('nog geen surveylink beschikbaar')
  })

  it('geeft de sluitdatum door aan de herinnering (amendement par. 4.3a)', () => {
    expect(buildReminderText(input({ closesAt: '2026-10-08' }))).toContain('Invullen kan tot en met 8 oktober 2026.')
    expect(buildReminderText(input({ closesAt: null }))).not.toContain('tot en met')
  })
})

describe('splitReminderText (spec 2026-09-16 par. 4.4)', () => {
  it('splitst de gebouwde tekst weer in onderwerp en bericht', () => {
    const text = buildReminderText(input())
    const parts = splitReminderText(text)
    expect(parts.subject).toBe('Herinnering: korte vragenlijst - Acme BV')
    expect(parts.body.startsWith('Beste collega,')).toBe(true)
    expect(parts.body).toContain('https://www.getloep.nl/survey/open/tok-123')
    expect(`${parts.subject}\n\n${parts.body}`).toBe(text)
  })

  it('geeft een tekst zonder lege regel volledig als onderwerp terug, met leeg bericht', () => {
    expect(splitReminderText('alleen een regel')).toEqual({ subject: 'alleen een regel', body: '' })
  })
})

describe('isReminderTextAvailable (spec-review 2026-09-17)', () => {
  it('herkent de echte, gedegradeerde fallback-tekst (geen surveylink) als niet beschikbaar', () => {
    const text = buildReminderText(input({ publicSurveyToken: null }))
    expect(isReminderTextAvailable(text)).toBe(false)
  })

  it('herkent de whitespace-only-tokenvariant van de fallback ook als niet beschikbaar', () => {
    const text = buildReminderText(input({ publicSurveyToken: '   ' }))
    expect(isReminderTextAvailable(text)).toBe(false)
  })

  it('herkent een echte, kopieerbare herinnering als beschikbaar', () => {
    const text = buildReminderText(input())
    expect(isReminderTextAvailable(text)).toBe(true)
  })

  it('herkent de managed-tekst ook als beschikbaar', () => {
    const text = buildReminderText(input({ commsMode: 'managed' }))
    expect(isReminderTextAvailable(text)).toBe(true)
  })
})
