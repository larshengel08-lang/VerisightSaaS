import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('rapportenoverzicht (spec 2026-09-11 par. 4.3)', () => {
  it('bouwt de rijen met de rapportvrijgaveregel', () => {
    expect(source).toContain('buildReportOverviewRows')
    expect(source).not.toContain('buildHrReportDownloadRows')
  })

  it('plant hier geen bespreking meer', () => {
    expect(source).not.toContain('CALENDLY')
    expect(source).not.toContain('mailto:')
    expect(source).not.toContain('Plan bespreking')
    expect(source).not.toContain('Managementbespreking plannen')
  })

  it('faalt luid als het overzicht niet geladen kan worden', () => {
    expect(source).toContain('throw new Error')
  })
})

describe('rapportenoverzicht (spec 2026-09-16 par. 6.2, walkthrough 6.1 t/m 6.5)', () => {
  it('laadt de noemer en de status uit het delivery record, in één keer voor alle metingen', () => {
    expect(source).toContain('loadCampaignStatusContext')
    expect(source).toContain('buildReportOverviewRows(campaigns, statusContext)')
  })

  it('maakt elke rij klikbaar naar de meting (walkthrough 6.3)', () => {
    expect(source).toContain('href={`/campaigns/${row.campaignId}`}')
  })

  it('laat de naam in rust al als link zien en geeft een zichtbare focusrand', () => {
    const link = source.slice(source.indexOf('<Link'), source.indexOf('</Link>'))
    expect(link).toMatch(/className="[^"]*(?<![:\w-])underline /)
    expect(link).toContain('focus-visible:outline')
  })

  it('verstopt de lopende metingen niet meer in een dichtgeklapte details (walkthrough 6.4)', () => {
    expect(source).not.toContain('<details')
    expect(source).not.toContain('<summary')
    expect(source).toContain('Nog niet beschikbaar')
  })

  it('gebruikt geldige grid-tracks: underscores, geen komma\'s tussen kolommen (walkthrough 6.5)', () => {
    // Tailwind arbitrary values scheiden tracks met _, niet met een komma:
    // grid-cols-[a,b,c] levert ongeldige CSS op en de kolomkoppen stapelden.
    expect(source).toContain('lg:grid-cols-[minmax(0,1.45fr)_150px_190px_auto]')
    expect(source).not.toContain('1.45fr),150px')
  })

  it('bevat geen em- of en-dashes', () => {
    expect(source).not.toMatch(/[—–]/)
  })
})
