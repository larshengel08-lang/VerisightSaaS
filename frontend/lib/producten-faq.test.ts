import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { faqSchema, faqs } from '@/components/marketing/site-content'

const lees = (relatief: string) => readFileSync(path.join(process.cwd(), relatief), 'utf8')

describe('veelgestelde vragen op /producten (besluit Lars 24-9)', () => {
  it('de homepage draagt de FAQPage-JSON-LD niet meer', () => {
    expect(lees('app/page.tsx')).not.toContain('faqSchema')
  })

  it('/producten draagt de FAQPage-JSON-LD', () => {
    const page = lees('app/producten/page.tsx')
    expect(page).toContain('faqSchema')
    expect(page).toContain('JSON.stringify(faqSchema)')
  })

  it('/producten rendert de vragen zichtbaar uit dezelfde bron', () => {
    const content = lees('components/marketing/producten-content.tsx')
    expect(content).toContain('function FaqSection')
    expect(content).toContain('faqs.map')
    expect(content).toContain('Veelgestelde vragen')
    expect(content).toContain('<FaqSection />')
  })

  it('het schema is geldig: elke vraag heeft een naam en een antwoord', () => {
    expect(faqSchema['@context']).toBe('https://schema.org')
    expect(faqSchema['@type']).toBe('FAQPage')
    expect(faqSchema.mainEntity).toHaveLength(faqs.length)
    for (const vraag of faqSchema.mainEntity) {
      expect(vraag['@type']).toBe('Question')
      expect(vraag.name.length).toBeGreaterThan(5)
      expect(vraag.acceptedAnswer['@type']).toBe('Answer')
      expect(vraag.acceptedAnswer.text.length).toBeGreaterThan(20)
    }
  })

  it('de antwoorden houden zich aan besluit A en de copyregels', () => {
    for (const [vraag, antwoord] of faqs) {
      const tekst = `${vraag} ${antwoord}`
      expect(tekst, vraag).not.toMatch(/[—–]/)
      // Een koppelteken telt niet als woordgrens: "add-ons" in het prijsantwoord
      // is geen wij-vorm (zelfde regel als lib/pricing.test.ts).
      expect(tekst, vraag).not.toMatch(/(?<![\w-])(we|wij|ons|onze)\b/i)
      expect(tekst, vraag).not.toMatch(/retention-scores|SDT-gebaseerd|performance-sturing|\bv1\b/i)
      expect(tekst, vraag).not.toMatch(/begeleid|bespreking/i)
    }
  })

  it('de herschreven antwoorden', () => {
    const antwoord = (vraag: string) => faqs.find(([q]) => q === vraag)?.[1]
    expect(antwoord('Ziet het management scores van losse medewerkers?')).toBe(
      'Nee. Loep Behoud laat groepen en afdelingen zien, nooit één persoon. Het is niet bedoeld om mensen te beoordelen of om te voorspellen wie weggaat.',
    )
    expect(antwoord('Is Loep Behoud een gevalideerde vertrekvoorspeller?')).toBe(
      'Nee. Loep Behoud voorspelt niet wie er vertrekt. Het laat op groepsniveau zien waar behoud onder druk staat en wat je mensen daarover zeggen. De vragen bouwen op onderzoek naar wat mensen aan hun werk bindt, maar de scan is geen wetenschappelijk gevalideerde voorspeller van vertrek.',
    )
    expect(antwoord('Hoe vaak herhaal je Loep Behoud?')).toBe(
      'Begin met één meting. Wil je later zien of het beeld verschuift, dan herhaal je dezelfde meting als vervolgmeting, bijvoorbeeld na een half jaar.',
    )
  })
})
