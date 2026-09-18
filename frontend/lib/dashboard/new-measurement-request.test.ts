import { describe, expect, it } from 'vitest'
import { NEW_MEASUREMENT_PRICE_LABEL, buildNewMeasurementMailto } from './new-measurement-request'

function parse(href: string) {
  const [target, query] = href.split('?')
  const params = new URLSearchParams(query)
  return { target, subject: params.get('subject') ?? '', body: params.get('body') ?? '' }
}

describe('buildNewMeasurementMailto (spec 2026-09-16 par. 6.3)', () => {
  it('mailt naar hallo@getloep.nl met de organisatie in het onderwerp', () => {
    const { target, subject } = parse(buildNewMeasurementMailto('TEST Loep Testklant'))
    expect(target).toBe('mailto:hallo@getloep.nl')
    expect(subject).toBe('Nieuwe meting aanvragen: TEST Loep Testklant')
  })

  it('vult een korte tekst voor met wat Loep moet weten', () => {
    const { body } = parse(buildNewMeasurementMailto('TEST Loep Testklant'))
    expect(body).toContain('TEST Loep Testklant wil een nieuwe meting.')
    expect(body).toContain('Welke scan')
    expect(body).toContain('Gewenste startdatum')
    expect(body).toContain('Aantal deelnemers')
  })

  it('verzint geen organisatienaam: zonder naam staat er zichtbaar dat die niet bekend is', () => {
    for (const name of [null, undefined, '', '   ']) {
      const { subject } = parse(buildNewMeasurementMailto(name))
      expect(subject).toBe('Nieuwe meting aanvragen: organisatie niet bekend')
    }
  })

  it('noemt de prijs van de vervolgmeting zoals op de site (beslissing 2026-07-09)', () => {
    expect(NEW_MEASUREMENT_PRICE_LABEL).toBe('€1.250 excl. btw')
  })

  it('bevat geen em- of en-dashes', () => {
    const { subject, body } = parse(buildNewMeasurementMailto('Acme'))
    expect(subject + body).not.toMatch(/[—–]/)
  })
})
