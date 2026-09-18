import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const shell = readFileSync(new URL('./dashboard-shell.tsx', import.meta.url), 'utf8')
const layout = readFileSync(new URL('../../app/(dashboard)/layout.tsx', import.meta.url), 'utf8')

describe('schil van de ingelogde omgeving (spec 2026-09-16 par. 6.5, walkthrough 1.3, 1.7, 1.8, 1.9, 7.2)', () => {
  it('toont in de kop de organisatienaam uit de database, nooit het maildomein', () => {
    expect(shell).not.toContain("split('@')")
    expect(shell).toContain('accountHeading.label')
    expect(shell).toContain('accountHeading.degraded')
    expect(layout).toContain('loadAccountOrganizations(supabase, user.id)')
    expect(layout).toContain('resolveAccountHeading({')
    expect(layout).toContain('isAdmin: context.isVerisightAdmin')
  })

  it('zet het accountblok en uitloggen ook in het mobiele menu', () => {
    expect(shell).toMatch(/mobileNavOpen \? \([\s\S]*?<LogoutButton[\s\S]*?\) : null\}\s*<\/header>/)
    expect(shell.match(/<LogoutButton/g)?.length).toBe(2)
  })

  it('heeft één "Rapporten"-ingang (de sidebar), geen dubbele knop in de kop', () => {
    expect(shell).not.toContain('showReportsQuickLink')
  })

  it('noemt in de footer geen Action Center meer, wel het contactadres', () => {
    expect(shell).not.toContain('Action Center in één omgeving')
    expect(shell).toContain('LOEP_CONTACT_EMAIL')
  })

  it('toont afgesloten metingen met hun naam en sluitmaand', () => {
    expect(shell).toContain('{item.name}')
    expect(shell).toContain('{item.closedLabel}')
    expect(shell).not.toContain('item.periodLabel')
    expect(layout).toContain("select('campaign_id, campaign_name, scan_type, is_active, created_at, closed_at, total_invited, total_completed')")
  })

  it('bevat geen em- of en-dashes', () => {
    expect(shell).not.toMatch(/[—–]/)
    expect(layout).not.toMatch(/[—–]/)
  })
})
