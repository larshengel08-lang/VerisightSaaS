import { describe, expect, it } from 'vitest'
import { faqSchema, faqs, trustHubAnswerCards, trustItems } from '@/components/marketing/site-content'
import { pricingFaqAnswer } from '@/lib/pricing'

describe('/vertrouwen na besluit A', () => {
  it('zegt in de trustregel wie wat doet', () => {
    expect(trustItems).toContain('Loep zet de meting klaar, jij verstuurt en leidt het gesprek')
    expect(trustItems.join(' ')).not.toMatch(/voert uit|beheert geen/i)
  })

  it('beantwoordt "Wat koop je precies?" met een meting en een rapport', () => {
    const kaart = trustHubAnswerCards.find((card) => card.title === 'Wat koop je precies?')
    expect(kaart?.body).toBe(
      'Een meting en een rapport. Loep zet de meting klaar, jij verstuurt hem, en het rapport zegt waar je begint en leidt je MT-gesprek. Geen licentie, geen platform dat je moet inrichten.',
    )
  })
})

describe('FAQ-JSON-LD na besluit A', () => {
  const antwoord = (vraag: string) => faqs.find(([question]) => question === vraag)?.[1]

  it('beschrijft Loep Start zonder bespreking', () => {
    expect(antwoord('Wanneer is Loep Start de juiste route?')).toBe(
      'Als de vraag gaat over hoe nieuwe medewerkers de eerste 90 dagen landen in rol, leiding en team. Loep zet de meting klaar en levert een rapport op groepsniveau, met een gespreksleidraad voor het gesprek met je MT.',
    )
  })

  it('noemt Loep een meting en een rapport, geen dienst aan tafel', () => {
    expect(antwoord('Is Loep een instrument of een dienst?')).toBe(
      'Een meting en een rapport. Loep zet de meting klaar en levert het rapport; jij verstuurt de uitnodiging, volgt de respons in je eigen omgeving en leidt het gesprek met je MT, met het rapport als leidraad. Geen licentie, geen platform dat je moet inrichten.',
    )
  })

  it('heeft een prijsvraag waarvan het antwoord uit de staffel komt', () => {
    expect(antwoord('Wat kost een scan van Loep?')).toBe(pricingFaqAnswer())
  })

  it('zet de prijsvraag ook in het schema dat /producten rendert', () => {
    const entity = faqSchema.mainEntity.find((item) => item.name === 'Wat kost een scan van Loep?')
    expect(entity?.acceptedAnswer.text).toBe(pricingFaqAnswer())
  })

  it('belooft in geen enkel antwoord nog een bespreking of begeleiding', () => {
    for (const [vraag, tekst] of faqs) {
      expect(tekst, vraag).not.toMatch(/begeleid|bespreking/i)
    }
  })

  /**
   * Loep Combinatie, Pulse en de Leadership-scan zijn in juni uit het portfolio
   * gehaald (beslissingslog 2026-06-14). De FAQ-JSON-LD bood ze daarna nog aan
   * Google aan; deze guard houdt ze eruit.
   */
  it('biedt geen geschrapt product meer aan in de FAQ-JSON-LD', () => {
    expect(antwoord('Wanneer kies je voor de combinatie?')).toBeUndefined()
    for (const [vraag, tekst] of faqs) {
      expect(`${vraag} ${tekst}`, vraag).not.toMatch(/combinatie|pulse|leadership/i)
    }
  })
})
