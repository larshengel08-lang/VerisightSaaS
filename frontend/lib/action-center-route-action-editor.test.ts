import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  ActionCenterRouteActionEditor,
  shouldResetActionCenterRouteActionEditorAfterSave,
} from '@/components/dashboard/action-center-route-action-editor'

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

  it('keeps the draft values when the save path resolves without clearing', () => {
    expect(shouldResetActionCenterRouteActionEditorAfterSave(undefined)).toBe(true)
    expect(shouldResetActionCenterRouteActionEditorAfterSave(true)).toBe(true)
    expect(shouldResetActionCenterRouteActionEditorAfterSave(false)).toBe(false)
  })
})
