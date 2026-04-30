import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ActionCenterActionReviewEditor } from '@/components/dashboard/action-center-action-review-editor'

describe('ActionCenterActionReviewEditor', () => {
  it('renders the lightweight per-action review fields', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActionCenterActionReviewEditor, {
        onSave: vi.fn(),
      }),
    )

    expect(html).toContain('Review opslaan')
    expect(html).toContain('Review op deze actie')
    expect(html).toContain('Wat zagen we terug?')
    expect(html).toContain('Wat betekent dit?')
    expect(html).toContain('Follow-upnotitie')
    expect(html).toContain('Effect zichtbaar')
    expect(html).toContain('Bijsturen nodig')
    expect(html).toContain('Nog te vroeg')
    expect(html).toContain('Stoppen')
  })
})
