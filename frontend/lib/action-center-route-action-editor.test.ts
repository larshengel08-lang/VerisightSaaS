import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ActionCenterRouteActionEditor } from '@/components/dashboard/action-center-route-action-editor'

describe('ActionCenterRouteActionEditor', () => {
  it('renders the compact bounded action fields for one route action card', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActionCenterRouteActionEditor, {
        onSave: vi.fn(),
      }),
    )

    expect(html).toContain('Actie toevoegen')
    expect(html).toContain('Thema')
    expect(html).toContain('Reviewdatum')
    expect(html).toContain('Kernactie')
    expect(html).toContain('Waaraan zien we dit terug?')
    expect(html).toContain('Houd het bij 1 concrete stap en 1 zichtbare observatie.')
  })
})
