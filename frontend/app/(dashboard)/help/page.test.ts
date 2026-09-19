import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('/help (spec 2026-09-16 par. 6.4)', () => {
  it('is een servercomponent die de gedeelde hulpcopy rendert', () => {
    expect(source).not.toContain("'use client'")
    expect(source).toContain('HELP_STEPS')
    expect(source).toContain('HELP_THRESHOLDS')
    expect(source).toContain('HELP_ROLES')
    expect(source).toContain('HELP_CONTACT')
    expect(source).toContain('mailto:${HELP_CONTACT.email}')
  })

  it('stuurt zonder sessie naar /login, zoals de andere app-pagina\'s', () => {
    expect(source).toContain("if (!user) redirect('/login')")
  })

  it('gebruikt een kop voor het contactblok, niet enkel vet lopend platte tekst', () => {
    expect(source).toMatch(/<h2[^>]*>Vragen\?<\/h2>/)
  })

  it('bevat geen em- of en-dashes', () => {
    expect(source).not.toMatch(/[—–]/)
  })
})
