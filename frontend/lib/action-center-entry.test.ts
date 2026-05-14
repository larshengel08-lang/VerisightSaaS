import { describe, expect, it } from 'vitest'
import {
  ACTION_CENTER_ENTRY_SOURCES,
  ACTION_CENTER_ENTRY_VIEWS,
  buildActionCenterEntryHref,
  resolveActionCenterEntryParams,
} from './action-center-entry'

describe('action center entry contract', () => {
  it('keeps the allowed source and view lists explicit', () => {
    expect(ACTION_CENTER_ENTRY_VIEWS).toEqual(['overview', 'actions', 'reviews', 'managers', 'teams'])
    expect(ACTION_CENTER_ENTRY_SOURCES).toEqual(['campaign-detail', 'review-moments', 'action-center', 'notification'])
  })

  it('parses valid focus, source, and view values from raw params', () => {
    expect(
      resolveActionCenterEntryParams({
        focus: '  route-exit::org-1::department::operations  ',
        view: 'reviews',
        source: 'review-moments',
      }),
    ).toEqual({
      focus: 'route-exit::org-1::department::operations',
      view: 'reviews',
      source: 'review-moments',
    })
  })

  it('falls back to overview and null source for invalid input', () => {
    expect(
      resolveActionCenterEntryParams({
        focus: '   ',
        view: 'workflow',
        source: 'outlook',
      }),
    ).toEqual({
      focus: null,
      view: 'overview',
      source: null,
    })
  })

  it('builds a focused actions URL without leaking empty params', () => {
    expect(
      buildActionCenterEntryHref({
        focus: '  cmp-1  ',
        view: 'actions',
        source: 'campaign-detail',
      }),
    ).toBe('/action-center?focus=cmp-1&view=actions&source=campaign-detail')
  })

  it('omits the default overview view from the canonical URL', () => {
    expect(
      buildActionCenterEntryHref({
        focus: 'route-1',
        view: 'overview',
        source: null,
      }),
    ).toBe('/action-center?focus=route-1')
  })
})
