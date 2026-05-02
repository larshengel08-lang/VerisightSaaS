import { describe, expect, it } from 'vitest'
import { FOLLOW_ON_ROUTE_CONTENT, getFollowOnRouteContent } from '@/lib/follow-on-route-content'

describe('follow-on route content', () => {
  it('keeps one shared source of truth for the four bounded routes', () => {
    expect(FOLLOW_ON_ROUTE_CONTENT.map((route) => route.slug)).toEqual([
      'onboarding-30-60-90',
      'leadership-scan',
      'pulse',
      'combinatie',
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
