import { describe, expect, it } from 'vitest'
import { NEW_MEASUREMENT_PRICE_LABEL, buildNewMeasurementMailto, newMeasurementVariant } from './new-measurement-request'

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

describe('newMeasurementVariant: "vervolgmeting" alleen als er al een meting is afgerond', () => {
  it('zonder metingen: neutrale variant', () => {
    expect(newMeasurementVariant([])).toBe('first')
  })

  it('een nieuwe klant met alleen een meting in inrichting of lopend: geen vervolgmeting met prijs', () => {
    expect(newMeasurementVariant([{ is_active: true }])).toBe('first')
    expect(newMeasurementVariant([{ is_active: true }, { is_active: true }])).toBe('first')
  })

  it('zodra één meting gesloten is (met of zonder rapport): vervolgmeting', () => {
    expect(newMeasurementVariant([{ is_active: false }])).toBe('follow_up')
    expect(newMeasurementVariant([{ is_active: true }, { is_active: false }])).toBe('follow_up')
  })
})
