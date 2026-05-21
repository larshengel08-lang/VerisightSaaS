import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  ActionCenterRouteActionEditor,
  serializeActionCenterRouteActionEditorValue,
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

  it('shows saved-not-live correction feedback and blocks unchanged invalid draft resubmission', () => {
    const initialValue = {
      themeKey: 'workload' as const,
      actionText: 'Verbeter overal de cultuur.',
      reviewScheduledFor: '2026-05-20',
      expectedEffect: 'Iedereen voelt snel verschil.',
    }
    const html = renderToStaticMarkup(
      React.createElement(ActionCenterRouteActionEditor, {
        onSave: vi.fn(),
        initialValue,
        submissionState: {
          validationDisposition: 'invalid',
          statusMessage: 'Draft opgeslagen, nog niet live in deze route.',
          validationMessage: 'Pas deze actie aan zodat hij bounded en route-specifiek is.',
          persistedDraftFingerprint: serializeActionCenterRouteActionEditorValue(initialValue),
        },
      }),
    )

    expect(html).toContain('Draft opgeslagen, nog niet live in deze route.')
    expect(html).toContain('Pas deze actie aan zodat hij bounded en route-specifiek is.')
    expect(html).toContain('Wijzig deze opgeslagen draft voordat je hem opnieuw indient.')
    expect(html).toContain('disabled=""')
  })

  it('keeps the submit path open once the draft content differs from the saved hr-review draft', () => {
    const persistedDraftValue = {
      themeKey: 'workload' as const,
      actionText: 'Start een breed HR-project.',
      reviewScheduledFor: '2026-05-20',
      expectedEffect: 'De cultuur verbetert overal.',
    }
    const html = renderToStaticMarkup(
      React.createElement(ActionCenterRouteActionEditor, {
        onSave: vi.fn(),
        initialValue: {
          ...persistedDraftValue,
          actionText: 'Plan twee route-specifieke teamgesprekken over werkdruk.',
        },
        submissionState: {
          validationDisposition: 'needs_hr_review',
          statusMessage: 'Draft opgeslagen, nog niet live in deze route.',
          validationMessage: 'Deze actie vraagt eerst HR-beoordeling.',
          persistedDraftFingerprint: serializeActionCenterRouteActionEditorValue(persistedDraftValue),
        },
      }),
    )

    expect(html).toContain('Draft opgeslagen, nog niet live in deze route.')
    expect(html).toContain('Deze actie vraagt eerst HR-beoordeling.')
    expect(html).not.toContain('Wijzig deze opgeslagen draft voordat je hem opnieuw indient.')
    expect(html).not.toContain('disabled=""')
  })
})
