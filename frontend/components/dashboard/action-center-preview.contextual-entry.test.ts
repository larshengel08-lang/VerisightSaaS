import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildContextualEntryHref } from './action-center-preview'

describe('action center preview contextual entry sync', () => {
  it('keeps the planned source-contract markers in place', () => {
    const source = readFileSync(new URL('./action-center-preview.tsx', import.meta.url), 'utf8')

    expect(source).toContain('buildActionCenterEntryHref')
    expect(source).toContain('setContextualView')
    expect(source).toContain("url.searchParams.get('source')")
    expect(source).toContain("focusActionRoute(routeId)")
    expect(source).not.toContain("url.searchParams.set('focus', routeId)")
  })

  it('preserves pathname, hash, and a valid source while writing focus and view', () => {
    expect(
      buildContextualEntryHref('https://example.test/dashboard?source=review-moments#preview-pane', {
        focus: 'route-42',
        view: 'reviews',
      }),
    ).toBe('/dashboard?source=review-moments&focus=route-42&view=reviews#preview-pane')
  })

  it('preserves unrelated host-page query params while updating entry params', () => {
    expect(
      buildContextualEntryHref('https://example.test/dashboard?tab=ops&source=review-moments#preview-pane', {
        focus: 'route-42',
        view: 'reviews',
      }),
    ).toBe('/dashboard?tab=ops&source=review-moments&focus=route-42&view=reviews#preview-pane')
  })

  it('drops an invalid source while preserving pathname and hash', () => {
    expect(
      buildContextualEntryHref('https://example.test/dashboard?source=unknown#preview-pane', {
        focus: 'route-42',
        view: 'actions',
      }),
    ).toBe('/dashboard?focus=route-42&view=actions#preview-pane')
  })

  it('omits default overview view from the query while preserving pathname and hash', () => {
    expect(
      buildContextualEntryHref('https://example.test/dashboard?source=action-center#preview-pane', {
        focus: 'route-42',
        view: 'overview',
      }),
    ).toBe('/dashboard?source=action-center&focus=route-42#preview-pane')
  })

  it('keeps the reviews stale-focus fix wired in the component source', () => {
    const source = readFileSync(new URL('./action-center-preview.tsx', import.meta.url), 'utf8')

    expect(source).toContain('buildContextualEntryHref')
    expect(source).toContain("setContextualView('reviews', { focus: item.id })")
    expect(source).toContain("replaceEntryUrl({ focus: itemId, view: 'overview' })")
  })
})
