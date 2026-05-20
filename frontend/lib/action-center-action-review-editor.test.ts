import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ActionCenterActionReviewEditor } from '@/components/dashboard/action-center-action-review-editor'

describe('ActionCenterActionReviewEditor', () => {
  it('renders a compact review form with evidence source and conditional guidance', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActionCenterActionReviewEditor, {
        onSave: vi.fn(),
      }),
    )

    expect(html).toContain('Review opslaan')
    expect(html).toContain('Review op deze actie')
    expect(html).toContain('Wat zagen we terug?')
    expect(html).toContain('Uitkomst')
    expect(html).toContain('Bron van observatie')
    expect(html).toContain('Hoe zeker zijn we hiervan?')
    expect(html).toContain('Korte toelichting')
    expect(html).toContain('Beschrijf kort welke verandering je zag en houd het bij waarneembare signalen.')
    expect(html).toContain('Effect zichtbaar')
    expect(html).toContain('Bijsturen nodig')
    expect(html).toContain('Nog te vroeg')
    expect(html).toContain('Stoppen')
    expect(html).toContain('Managerobservatie')
    expect(html).toContain('Teamgesprek')
    expect(html).toContain('Follow-up survey')
    expect(html).toContain('HR check')
    expect(html).toContain('Operationele indicator')
    expect(html).toContain('Andere bounded bron')
    expect(html).toContain('Laag')
    expect(html).toContain('Gemiddeld')
    expect(html).toContain('Hoog')
  })
})
