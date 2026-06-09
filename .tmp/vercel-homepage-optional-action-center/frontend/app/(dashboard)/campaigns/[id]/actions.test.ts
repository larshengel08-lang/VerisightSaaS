import { describe, expect, it } from 'vitest'

import { buildResendResultMessage, formatBackendDetail } from './reminder-feedback'

describe('formatBackendDetail', () => {
  it('returns plain string details unchanged', () => {
    expect(formatBackendDetail('Autorisatie ontbreekt.')).toBe('Autorisatie ontbreekt.')
  })

  it('formats FastAPI validation detail arrays into readable text', () => {
    expect(formatBackendDetail([
      { loc: ['body', 0, 'email'], msg: 'value is not a valid email address' },
      { loc: ['body', 1, 'email'], msg: 'value is not a valid email address' },
    ])).toBe(
      'body.0.email: value is not a valid email address body.1.email: value is not a valid email address',
    )
  })

  it('falls back for unknown payloads', () => {
    expect(formatBackendDetail({ foo: 'bar' })).toBe('Backend error')
  })
})

describe('buildResendResultMessage', () => {
  it('combines sent, failed and skipped counts', () => {
    expect(buildResendResultMessage({ sent: 2, failed: 1, skipped: 3 })).toBe(
      '2 uitnodiging(en) verstuurd. 1 mislukt. 3 overgeslagen.',
    )
  })

  it('does not claim there are no respondents when sends fail', () => {
    expect(buildResendResultMessage({ sent: 0, failed: 2, skipped: 0 })).toBe('2 mislukt.')
  })

  it('uses the empty-state copy only when nothing happened', () => {
    expect(buildResendResultMessage({ sent: 0, failed: 0, skipped: 0 })).toBe(
      'Geen openstaande respondenten met e-mailadres gevonden.',
    )
  })
})
