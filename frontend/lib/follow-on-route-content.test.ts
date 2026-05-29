import { describe, expect, it } from 'vitest'
import { FOLLOW_ON_ROUTE_CONTENT, getFollowOnRouteContent } from '@/lib/follow-on-route-content'

describe('follow-on route content', () => {
  it('keeps one shared source of truth for the later bounded routes', () => {
    expect(FOLLOW_ON_ROUTE_CONTENT.map((route) => route.slug)).toEqual([
      'leadership-scan',
      'pulse',
      'combinatie',
    ])
  })

  it('uses the revised spreadsheet copy for leadership, pulse and combinatie overview content', () => {
    expect(FOLLOW_ON_ROUTE_CONTENT.map((route) => route.rowSummary)).toEqual([
      'Wanneer signalen vooral vragen oproepen over aansturing of leiding.',
      'Voor een compacte hercheck nadat de eerste vraag scherp is.',
      'Wanneer vertrek en behoud tegelijk aandacht vragen.',
    ])

    expect(FOLLOW_ON_ROUTE_CONTENT.map((route) => route.positioning)).toEqual([
      'Leadership Scan helpt gericht kijken naar aansturing, verwachtingen en leidinggevende context wanneer een eerdere baseline laat zien dat daar de vervolgvraag ligt.',
      'Pulse is bedoeld om een gekozen aandachtspunt compact te blijven volgen, zonder opnieuw een brede baseline te starten.',
      'Combinatie is alleen logisch wanneer vertrek én behoud tegelijk belangrijk zijn en niet goed in één losse route te vangen zijn.',
    ])
  })

  it('contains the required commercial summary fields and preserves live route urls', () => {
    for (const route of FOLLOW_ON_ROUTE_CONTENT) {
      expect(route.title.length).toBeGreaterThan(0)
      expect(route.rowSummary.length).toBeGreaterThan(0)
      expect(route.positioning.length).toBeGreaterThan(0)
      expect(route.whenLogical).toHaveLength(3)
      expect(route.whatYouGet).toHaveLength(3)
      expect(route.whyLater.length).toBeGreaterThan(0)
      expect(route.detailHref).toBe(`/producten/${route.slug}`)
      expect(route.ctaSource.startsWith('products_follow_on_')).toBe(true)
      expect(getFollowOnRouteContent(route.slug)).toEqual(route)
    }
  })
})
