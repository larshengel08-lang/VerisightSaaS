import { describe, expect, it } from 'vitest'
import { parseAuthLinkError } from './auth-link-error'

describe('parseAuthLinkError', () => {
  it('geeft null bij een lege of afwezige hash', () => {
    expect(parseAuthLinkError('')).toBeNull()
    expect(parseAuthLinkError('#')).toBeNull()
  })

  it('geeft null als de hash geen auth-error bevat (normale navigatie)', () => {
    expect(parseAuthLinkError('#scans')).toBeNull()
  })

  it('geeft een vriendelijke NL-melding bij otp_expired, zonder technisch jargon', () => {
    const result = parseAuthLinkError(
      '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired&sb=',
    )
    expect(result).not.toBeNull()
    expect(result!.message).toMatch(/verlopen of al gebruikt/i)
    expect(result!.message).toMatch(/nieuwe link/i)
    expect(result!.message).not.toMatch(/otp_expired/i)
    expect(result!.message).not.toMatch(/access_denied/i)
  })

  it('valt terug op een generieke melding bij een onbekende error_code', () => {
    const result = parseAuthLinkError('#error=access_denied&error_code=iets_onverwachts&error_description=x')
    expect(result).not.toBeNull()
    expect(result!.message).not.toMatch(/iets_onverwachts/i)
  })

  it('negeert errors die geen access_denied/server_error zijn', () => {
    expect(parseAuthLinkError('#error=invalid_request&error_code=x')).toBeNull()
  })

  it('werkt met of zonder leidende #', () => {
    const withHash = parseAuthLinkError('#error=access_denied&error_code=otp_expired')
    const withoutHash = parseAuthLinkError('error=access_denied&error_code=otp_expired')
    expect(withHash).toEqual(withoutHash)
  })
})
