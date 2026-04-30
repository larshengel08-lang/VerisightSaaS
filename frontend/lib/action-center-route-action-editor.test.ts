import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ActionCenterRouteActionEditor } from '@/components/dashboard/action-center-route-action-editor'

describe('ActionCenterRouteActionEditor', () => {
  it('renders the compact multi-action form fields for one route action card', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActionCenterRouteActionEditor, {
        onSave: vi.fn(),
      }),
    )

    expect(html).toContain('Actie toevoegen')
    expect(html).toContain('Nieuwe actie')
    expect(html).toContain('Thema')
    expect(html).toContain('Wat ga je doen?')
    expect(html).toContain('Wanneer reviewen we dit?')
    expect(html).toContain('Wat moet dit zichtbaar maken?')
  })
})
