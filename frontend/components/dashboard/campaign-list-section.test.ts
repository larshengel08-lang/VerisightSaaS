import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./campaign-list-section.tsx', import.meta.url), 'utf8')

describe('lijst "Al je metingen" (spec 2026-09-16 par. 6.1)', () => {
  it('is een servercomponent zonder hooks die naam, scan, status en link per meting toont', () => {
    expect(src).not.toContain("'use client'")
    expect(src).toContain('Al je metingen')
    expect(src).toContain('item.name')
    expect(src).toContain('item.scanLabel')
    expect(src).toContain('item.statusLabel')
    expect(src).toContain('href={item.href}')
  })

  it('markeert de meting die al als hoofdkaart staat', () => {
    expect(src).toContain('item.isMain')
    expect(src).toContain('Staat hierboven')
  })

  it('kleurt de status per sleutel, met "Actie nodig" als enige aandachtskleur', () => {
    expect(src).toContain("action:")
    expect(src).toContain("report_ready:")
  })

  it('bevat geen em- of en-dashes', () => {
    expect(src).not.toMatch(/[—–]/)
  })
})
