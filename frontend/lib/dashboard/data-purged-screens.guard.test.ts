import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Deel C, Taak 20c: na de opschoning geeft campaign_stats 0 antwoorden. Elk
 * scherm dat een meting toont, moet dan de reden tonen en nooit "0 ingevuld",
 * "te weinig antwoorden" of een lege lijst (C.1). Het gedrag van de lader,
 * de status en de rijen staat in de eigen tests; hier de koppeling per scherm.
 */
/**
 * De bron met elke reeks witruimte (ook regeleinden, CRLF of LF) samengevoegd
 * tot één spatie: de patronen hieronder hangen zo niet aan inspringing of
 * regelafbreking, alleen aan de code zelf.
 */
function bron(relatief: string): string {
  return readFileSync(path.join(process.cwd(), relatief), 'utf8').replace(/\s+/g, ' ')
}

describe('een opgeschoonde meting is overal eerlijk (Deel C)', () => {
  it('/dashboard: de hoofdkaart toont de reden, ook voor meelezers, vóór de resolverkaarten', () => {
    const page = bron('app/(dashboard)/dashboard/page.tsx')
    // Eén context voor lijst én hoofdkaart, ook bij één meting (geen tweede query).
    expect(page).toContain('loadCampaignStatusContext(supabase, campaigns.map((c) => c.campaign_id), todayIso())')
    expect(page).toContain('const mainPurgedAt = statusContext.dataPurgedAtByCampaign.get(campaign.campaign_id) ?? null')
    expect(page).not.toContain('loadDataPurgedAt(')
    expect(page).not.toContain('campaigns.length > 1 ? await loadCampaignStatusContext')
    const kaart = page.indexOf('{mainPurgedAt ? (')
    expect(kaart).toBeGreaterThan(-1)
    expect(page.indexOf('<DataPurgedCard', kaart)).toBeGreaterThan(kaart)
    // Eerst de opgeschoonde staat, dan pas de meelezer- en resolverkaarten.
    expect(page.indexOf(': !canManage ? (', kaart)).toBeGreaterThan(kaart)
  })

  it('/reports: opgeschoonde metingen in een eigen blok met de reden, niet bij "Nog niet beschikbaar"', () => {
    const page = bron('app/(dashboard)/reports/page.tsx')
    expect(page).toContain('reportIndex.purgedRows.map((row) =>')
    const blok = page.slice(page.indexOf('reportIndex.purgedRows.length > 0'))
    expect(blok).toContain('Gegevens verwijderd')
    expect(blok).toContain('{row.status}')
    expect(blok).not.toContain('PdfDownloadButton')
  })

  it('/campaigns/[id]/open-antwoorden: dezelfde kaart, en geen service-role-lezing van verwijderde gegevens', () => {
    const page = bron('app/(dashboard)/campaigns/[id]/open-antwoorden/page.tsx')
    const check = page.indexOf('const purgedAt = await loadDataPurgedAt(supabase, id)')
    expect(check).toBeGreaterThan(-1)
    expect(page.indexOf('<DataPurgedCard purgedAt={purgedAt} />')).toBeGreaterThan(check)
    expect(page.indexOf('createAdminClient()')).toBeGreaterThan(check)
  })

  it('/beheer/campagnes: status, respons en rapport noemen de verwijdering, geen "0% (0/N)"', () => {
    const page = bron('app/(dashboard)/beheer/campagnes/page.tsx')
    // Tegelijk met de organisatiequery, niet als extra rondgang erna.
    const samen = page.indexOf('await Promise.all([ orgIds.length ? supabase.from(\'organizations\')')
    expect(samen).toBeGreaterThan(-1)
    expect(page.indexOf('loadDataPurgedAtByCampaign(', samen)).toBeGreaterThan(samen)
    expect(page.indexOf('loadDataPurgedAtByCampaign(', samen)).toBeLessThan(page.indexOf('])', samen))
    expect(page).toContain('const reportReady = !purgedAt && ')
    expect(page).toContain("{purgedAt ? 'Gegevens verwijderd' : row.is_active ? 'Actief' : 'Gesloten'}")
    const respons = page.slice(page.indexOf('{/* Respons */}'), page.indexOf('{/* Sluitdatum */}'))
    expect(respons.indexOf('dataPurgedLabel(purgedAt)')).toBeGreaterThan(-1)
    expect(respons.indexOf('dataPurgedLabel(purgedAt)')).toBeLessThan(respons.indexOf('{pct}%'))
  })

  it('/beheer: het campagne-statusoverzicht vervangt de tellingen door de verwijdering', () => {
    const page = bron('app/(dashboard)/beheer/page.tsx')
    // Uit de al geladen select('*')-rijen, met een luide fout als die query faalt.
    expect(page).toContain('purgedAtFromRows(campaigns')
    expect(page).toContain('if (campaignsError) throw new Error(')
    expect(page).toContain("{purgedAt ? 'Gegevens verwijderd' : stats.is_active ? 'Actief' : 'Gesloten'}")
    const tak = page.indexOf('{purgedAt ? ( <td colSpan={4}')
    expect(tak).toBeGreaterThan(-1)
    expect(page.indexOf('dataPurgedLabel(purgedAt)', tak)).toBeGreaterThan(tak)
    expect(page.indexOf('{stats.total_completed ?? 0}', tak)).toBeGreaterThan(page.indexOf('dataPurgedLabel(purgedAt)', tak))
  })

  it('/campaigns/[id]/beheer: kaart bovenaan, geen "Rapport wacht" of "nog niet beschikbaar"', () => {
    const page = bron('app/(dashboard)/campaigns/[id]/beheer/page.tsx')
    expect(page).toContain('{data.dataPurgedAt ? <DataPurgedCard purgedAt={data.dataPurgedAt} /> : null}')
    const secties = bron('app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.tsx')
    expect(secties).toContain("{data.dataPurgedAt ? `${dataPurgedLabel(data.dataPurgedAt)}.` : 'Rapport nog niet beschikbaar.'}")
    expect(secties).toContain("Rapport {data.dataPurgedAt ? 'verwijderd' : summary.reportReady ? 'klaar' : 'wacht'}")
    expect(secties).toContain("Dashboard {data.dataPurgedAt ? 'verwijderd' : summary.dashboardReady ? 'klaar' : 'wacht'}")
    const data = bron('app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts')
    expect(data).toContain('const reportAvailable = hasMinDisplay && !dataPurgedAt')
  })

  it('het gedeelde component heeft geen em- of en-dash', () => {
    expect(bron('components/dashboard/data-purged-card.tsx')).not.toMatch(/[–—]/)
  })
})
