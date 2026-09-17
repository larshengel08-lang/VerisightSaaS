import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./confirm-dialog.tsx', import.meta.url), 'utf8')

describe('ConfirmDialog (spec 2026-09-16 par. 4.3 en 9: eigen dialoog, geen browser-confirm)', () => {
  it('is een client component met een toegankelijke dialoogrol', () => {
    expect(src).toContain("'use client'")
    expect(src).toContain('role="dialog"')
    expect(src).toContain('aria-modal="true"')
    expect(src).toContain('aria-labelledby')
  })

  it('sluit op Escape en op de achtergrond, zonder actie', () => {
    expect(src).toContain("event.key === 'Escape'")
    expect(src).toContain('onClick={onClose}')
  })

  it('rendert de knoppen in de volgorde die de aanroeper geeft, met een primaire variant', () => {
    expect(src).toContain('actions.map(')
    expect(src).toContain("action.variant === 'primary'")
  })

  it('gebruikt zelf geen browser-confirm en geen em- of en-dashes', () => {
    expect(src).not.toMatch(/(?<![A-Za-z_])confirm\(/)
    expect(src).not.toMatch(/[—–]/)
  })
})
