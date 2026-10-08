import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  downloadErrorMessage,
  purgedDownloadMessage,
  reportFailureMessage,
  summarizeTechnicalDetail,
} from './report-download-error'
import { LOEP_CONTACT_EMAIL } from './loep-contact'

describe('summarizeTechnicalDetail', () => {
  it('geeft null voor een lege of niet-tekst detail (fail loud, geen stille placeholder)', () => {
    expect(summarizeTechnicalDetail(null)).toBeNull()
    expect(summarizeTechnicalDetail(undefined)).toBeNull()
    expect(summarizeTechnicalDetail('')).toBeNull()
    expect(summarizeTechnicalDetail('   ')).toBeNull()
    expect(summarizeTechnicalDetail(404)).toBeNull()
    expect(summarizeTechnicalDetail({ detail: 'x' })).toBeNull()
  })

  it('toont nooit ruwe HTML (Railway 502/504-foutpagina)', () => {
    const html = '<html><head><title>502 Bad Gateway</title></head><body>nginx</body></html>'
    const result = summarizeTechnicalDetail(html)
    expect(result).toBe('Serverfoutpagina ontvangen in plaats van een foutmelding.')
    expect(result).not.toMatch(/</)
  })

  it('herkent HTML ook met voorloopwitruimte', () => {
    const html = '\n  <!DOCTYPE html><html></html>'
    expect(summarizeTechnicalDetail(html)).toBe('Serverfoutpagina ontvangen in plaats van een foutmelding.')
  })

  it('pakt de geneste detail-tekst uit een JSON-body van FastAPI', () => {
    const nested = JSON.stringify({ detail: 'Campagne niet gevonden.' })
    expect(summarizeTechnicalDetail(nested)).toBe('Campagne niet gevonden.')
  })

  it('gebruikt platte tekst zoals die is als het geen JSON is', () => {
    expect(summarizeTechnicalDetail('Internal Server Error')).toBe('Internal Server Error')
  })

  it('gebruikt de tekst zelf als JSON-parse lukt maar er geen tekstueel detail-veld in zit', () => {
    const nested = JSON.stringify({ code: 500 })
    expect(summarizeTechnicalDetail(nested)).toBe(nested)
  })

  it('knipt een lange melding af op 300 tekens met een ellipsis, geen streepjes', () => {
    const long = 'a'.repeat(400)
    const result = summarizeTechnicalDetail(long)
    expect(result).toHaveLength(303)
    expect(result?.endsWith('...')).toBe(true)
    expect(result).not.toMatch(/[—–]/)
  })

  it('laat een melding van 300 tekens of korter ongewijzigd', () => {
    const exact = 'b'.repeat(300)
    expect(summarizeTechnicalDetail(exact)).toBe(exact)
  })
})

describe('downloadErrorMessage', () => {
  it('vraagt bij 401 om opnieuw in te loggen', () => {
    expect(downloadErrorMessage(401)).toBe('Je sessie is verlopen. Log opnieuw in en probeer het nog eens.')
  })

  it('meldt bij 403 en 404 dat dit account geen toegang heeft, met contact', () => {
    expect(downloadErrorMessage(403)).toContain('geen toegang tot dit rapport met dit account')
    expect(downloadErrorMessage(403)).toContain(LOEP_CONTACT_EMAIL)
    expect(downloadErrorMessage(404)).toContain('geen toegang tot dit rapport met dit account')
    expect(downloadErrorMessage(404)).toContain(LOEP_CONTACT_EMAIL)
  })

  it('noemt de statuscode en contact bij overige fouten (5xx en onbekend)', () => {
    expect(downloadErrorMessage(500)).toBe(
      `Het rapport kon niet worden opgehaald (fout 500). Probeer het later opnieuw of mail ${LOEP_CONTACT_EMAIL}.`,
    )
    expect(downloadErrorMessage(502)).toContain('fout 502')
    expect(downloadErrorMessage(418)).toContain('fout 418')
  })

  it('zegt bij 410 dat de gegevens verwijderd zijn en dat opnieuw proberen niet helpt', () => {
    const message = downloadErrorMessage(410)
    expect(message).toBe(
      'De gegevens van deze meting zijn verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is gedownload, blijft geldig.',
    )
    expect(message).not.toContain('Probeer het later opnieuw')
    expect(message).not.toContain('fout 410')
  })

  it('gebruikt nergens een em-dash of en-dash', () => {
    for (const status of [401, 403, 404, 410, 500, 502, 418]) {
      expect(downloadErrorMessage(status)).not.toMatch(/[—–]/)
    }
  })
})

describe('purgedDownloadMessage (410 na de opschoning)', () => {
  const BACKEND_ZIN =
    'De gegevens van deze meting zijn op 16 juni 2028 verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is gedownload, blijft geldig.'

  it('neemt de backendzin met datum over uit de geneste FastAPI-body', () => {
    expect(purgedDownloadMessage(410, JSON.stringify({ detail: BACKEND_ZIN }))).toBe(BACKEND_ZIN)
  })

  it('neemt ook platte tekst met dezelfde zin over', () => {
    expect(purgedDownloadMessage(410, `  ${BACKEND_ZIN}
`)).toBe(BACKEND_ZIN)
  })

  it('geeft null bij een andere statuscode, ook met dezelfde zin', () => {
    expect(purgedDownloadMessage(500, JSON.stringify({ detail: BACKEND_ZIN }))).toBeNull()
  })

  it('geeft null bij een 410 met een andere of ontbrekende melding: dan geldt de algemene 410-zin', () => {
    expect(purgedDownloadMessage(410, JSON.stringify({ detail: 'Gone' }))).toBeNull()
    expect(purgedDownloadMessage(410, '<html>410</html>')).toBeNull()
    expect(purgedDownloadMessage(410, null)).toBeNull()
    expect(purgedDownloadMessage(410, '')).toBeNull()
  })

  it('geeft null bij een onverwacht lange tekst met hetzelfde begin', () => {
    expect(purgedDownloadMessage(410, BACKEND_ZIN + ' x'.repeat(200))).toBeNull()
  })
})

describe('reportFailureMessage (vaste 500-melding van de backend)', () => {
  const gemeld =
    'Het rapport kon niet worden gemaakt. Loep heeft hier automatisch een melding van gekregen en zoekt uit wat er misging. Je hoeft verder niets te doen. Probeer het later gerust opnieuw.'
  const nietGemeld =
    'Het rapport kon niet worden gemaakt. Probeer het later opnieuw. Lukt het dan nog niet, mail dan naar hallo@getloep.nl.'

  it('neemt de backendzin over uit de geneste FastAPI-body', () => {
    expect(reportFailureMessage(500, JSON.stringify({ detail: gemeld }))).toBe(gemeld)
  })

  it('herkent ook de zin zonder Sentry-melding (geen DSN)', () => {
    expect(reportFailureMessage(500, JSON.stringify({ detail: nietGemeld }))).toBe(nietGemeld)
  })

  it('geeft null bij een andere status, ook met dezelfde zin', () => {
    expect(reportFailureMessage(502, JSON.stringify({ detail: gemeld }))).toBeNull()
  })

  it('geeft null bij de 502 van de proxy zelf: dan blijven hoofdzin en technische regel gelden', () => {
    const onbereikbaar = 'De rapportserver is nu niet bereikbaar. Probeer het later opnieuw.'
    expect(reportFailureMessage(502, onbereikbaar)).toBeNull()
    expect(downloadErrorMessage(502)).toContain('fout 502')
    expect(summarizeTechnicalDetail(onbereikbaar)).toBe(onbereikbaar)
  })

  it('geeft null bij een andere 500-melding: dan blijft de technische regel zichtbaar', () => {
    expect(reportFailureMessage(500, 'Internal Server Error')).toBeNull()
    expect(reportFailureMessage(500, JSON.stringify({ detail: 'Exportgeneratie mislukt: boom' }))).toBeNull()
    expect(reportFailureMessage(500, '<html>500</html>')).toBeNull()
    expect(reportFailureMessage(500, null)).toBeNull()
  })

  it('geeft null bij een onverwacht lange tekst met hetzelfde begin', () => {
    expect(reportFailureMessage(500, `Het rapport kon niet worden gemaakt. ${'x'.repeat(400)}`)).toBeNull()
  })

  it('herkent precies de zinnen die de backend stuurt', () => {
    const backend = readFileSync(new URL('../../backend/observability.py', import.meta.url), 'utf8')
    expect(backend).toContain('REPORT_FAILED_PREFIX = "Het rapport kon niet worden gemaakt."')
    expect(backend).toContain('Loep heeft hier automatisch een melding van gekregen en zoekt uit wat er misging.')
    expect(backend).toContain('Je hoeft verder niets te doen. Probeer het later gerust opnieuw.')
    expect(backend).toContain('Probeer het later opnieuw. Lukt het dan nog niet, mail dan naar hallo@getloep.nl.')
  })

  it('gebruikt nergens een em-dash of en-dash', () => {
    expect(gemeld).not.toMatch(/[–—]/)
    expect(nietGemeld).not.toMatch(/[–—]/)
  })
})

describe('downloadknop gebruikt de vaste melding', () => {
  it('toont reportFailureMessage als hoofdzin zonder technische regel', () => {
    const knop = readFileSync(
      new URL('../app/(dashboard)/campaigns/[id]/pdf-download-button.tsx', import.meta.url),
      'utf8',
    )
    expect(knop).toContain('reportFailureMessage(response.status, rawDetail)')
  })
})
