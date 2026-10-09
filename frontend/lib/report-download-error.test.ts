import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  downloadErrorMessage,
  notAvailableMessage,
  purgedDownloadMessage,
  reportFailureMessage,
  resolveDownloadError,
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

  it('zegt bij 422 dat het rapport nog niet beschikbaar is, zonder opnieuw proberen', () => {
    const message = downloadErrorMessage(422)
    expect(message).toBe(
      `Dit rapport is nu nog niet beschikbaar. Mail ${LOEP_CONTACT_EMAIL} als je denkt dat dit niet klopt.`,
    )
    expect(message).not.toContain('Probeer het later opnieuw')
    expect(message).not.toContain('fout 422')
  })

  it('gebruikt nergens een em-dash of en-dash', () => {
    for (const status of [401, 403, 404, 410, 422, 500, 502, 418]) {
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

// Opgebouwd uit tekencodes zodat dit bestand zelf geen streepjes bevat.
const DASHES = new RegExp(`[${String.fromCharCode(0x2013, 0x2014)}]`)

const GEMELD =
  'Het rapport kon niet worden gemaakt. Loep heeft hier automatisch een melding van gekregen en zoekt uit wat er misging. Je hoeft verder niets te doen. Probeer het later gerust opnieuw.'
const NIET_GEMELD =
  'Het rapport kon niet worden gemaakt. Probeer het later opnieuw. Lukt het dan nog niet, mail dan naar hallo@getloep.nl.'
const PURGED_ZIN =
  'De gegevens van deze meting zijn op 16 juni 2028 verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is gedownload, blijft geldig.'
// backend/report.py, ReportNotAvailable: de backend geeft deze zin als 422-detail.
const NIET_BESCHIKBAAR =
  'Loep Culture Assessment boardrapport komt pas beschikbaar na formele sluiting van de baseline.'
const PROXY_ONBEREIKBAAR = 'De rapportserver is nu niet bereikbaar. Probeer het later opnieuw.'

/**
 * Leest een stringconstante uit backend/observability.py zoals Python hem
 * samenstelt: letterlijke stukken tussen dubbele aanhalingstekens plus
 * eerder gelezen constanten, aan elkaar geplakt met +.
 */
function pythonConstant(source: string, name: string, known: Record<string, string> = {}): string {
  const marker = `\n${name} = `
  const start = source.indexOf(marker)
  if (start === -1) throw new Error(`${name} niet gevonden in backend/observability.py`)
  const rest = source.slice(start + marker.length)
  const body = rest.startsWith('(') ? rest.slice(1, rest.indexOf('\n)')) : rest.slice(0, rest.indexOf('\n'))
  const parts: string[] = []
  for (const match of body.matchAll(/([A-Z][A-Z0-9_]*)|"([^"\\]*)"/g)) {
    if (match[1] !== undefined) {
      const value = known[match[1]]
      if (value === undefined) throw new Error(`onbekende constante ${match[1]} in ${name}`)
      parts.push(value)
    } else {
      parts.push(match[2])
    }
  }
  if (parts.length === 0) throw new Error(`${name} heeft geen tekst`)
  return parts.join('')
}

describe('reportFailureMessage (vaste 500-melding van de backend)', () => {
  it('neemt de backendzin over uit de geneste FastAPI-body', () => {
    expect(reportFailureMessage(500, JSON.stringify({ detail: GEMELD }))).toBe(GEMELD)
  })

  it('herkent ook de zin zonder Sentry-melding (geen DSN)', () => {
    expect(reportFailureMessage(500, JSON.stringify({ detail: NIET_GEMELD }))).toBe(NIET_GEMELD)
  })

  it('geeft null bij een andere status, ook met dezelfde zin', () => {
    expect(reportFailureMessage(502, JSON.stringify({ detail: GEMELD }))).toBeNull()
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
})

describe('backendzinnen gelijk aan backend/observability.py', () => {
  const backend = readFileSync(new URL('../../backend/observability.py', import.meta.url), 'utf8')
  const prefix = pythonConstant(backend, 'REPORT_FAILED_PREFIX')
  const reported = pythonConstant(backend, 'REPORT_FAILED_REPORTED', { REPORT_FAILED_PREFIX: prefix })
  const unreported = pythonConstant(backend, 'REPORT_FAILED_UNREPORTED', { REPORT_FAILED_PREFIX: prefix })

  it('de gemelde en de niet-gemelde zin zijn exact wat de backend stuurt', () => {
    expect(prefix).toBe('Het rapport kon niet worden gemaakt.')
    expect(reported).toBe(GEMELD)
    expect(unreported).toBe(NIET_GEMELD)
  })

  it('de frontend herkent beide backendzinnen', () => {
    expect(reportFailureMessage(500, JSON.stringify({ detail: reported }))).toBe(reported)
    expect(reportFailureMessage(500, JSON.stringify({ detail: unreported }))).toBe(unreported)
  })

  it('de backendzinnen bevatten geen em-dash of en-dash', () => {
    for (const zin of [prefix, reported, unreported]) {
      expect(zin).not.toMatch(DASHES)
    }
  })
})

describe('notAvailableMessage (422: rapport bestaat nog niet)', () => {
  it('neemt een korte tekstuele detail uit de JSON-body over', () => {
    expect(notAvailableMessage(422, JSON.stringify({ detail: NIET_BESCHIKBAAR }))).toBe(NIET_BESCHIKBAAR)
  })

  it('geeft null bij een andere status', () => {
    expect(notAvailableMessage(400, JSON.stringify({ detail: NIET_BESCHIKBAAR }))).toBeNull()
    expect(notAvailableMessage(500, JSON.stringify({ detail: NIET_BESCHIKBAAR }))).toBeNull()
  })

  it('geeft null als de tekst niet uit een JSON-detail komt', () => {
    expect(notAvailableMessage(422, NIET_BESCHIKBAAR)).toBeNull()
    expect(notAvailableMessage(422, null)).toBeNull()
    expect(notAvailableMessage(422, '')).toBeNull()
  })
})

describe('resolveDownloadError (alle takken van de downloadknop)', () => {
  const lijstDetail = JSON.stringify({
    detail: [{ loc: ['query', 'format'], msg: 'Field required', type: 'missing' }],
  })
  const geneste = JSON.stringify({ detail: JSON.stringify({ detail: 'x' }) })
  const html = '<html><body>422 Unprocessable</body></html>'
  const SERVERPAGINA = 'Serverfoutpagina ontvangen in plaats van een foutmelding.'

  const cases: Array<{ naam: string; status: number; raw: unknown; message: string; technical: string | null }> = [
    { naam: '401 van de proxy', status: 401, raw: 'Niet ingelogd.', message: downloadErrorMessage(401), technical: 'Niet ingelogd.' },
    { naam: '403 geneste FastAPI-body', status: 403, raw: JSON.stringify({ detail: 'Geen toegang.' }), message: downloadErrorMessage(403), technical: 'Geen toegang.' },
    { naam: '404 van de proxy', status: 404, raw: 'Campaign niet gevonden of niet toegankelijk.', message: downloadErrorMessage(404), technical: 'Campaign niet gevonden of niet toegankelijk.' },
    { naam: '410 herkend', status: 410, raw: JSON.stringify({ detail: PURGED_ZIN }), message: PURGED_ZIN, technical: null },
    { naam: '410 niet herkend', status: 410, raw: JSON.stringify({ detail: 'Gone' }), message: downloadErrorMessage(410), technical: 'Gone' },
    { naam: '422 vaste backendzin', status: 422, raw: JSON.stringify({ detail: NIET_BESCHIKBAAR }), message: NIET_BESCHIKBAAR, technical: null },
    { naam: '422 validatielijst van FastAPI', status: 422, raw: lijstDetail, message: downloadErrorMessage(422), technical: lijstDetail },
    { naam: '422 HTML-pagina', status: 422, raw: html, message: downloadErrorMessage(422), technical: SERVERPAGINA },
    { naam: '422 HTML in de detail', status: 422, raw: JSON.stringify({ detail: '<b>x</b>' }), message: downloadErrorMessage(422), technical: SERVERPAGINA },
    { naam: '422 detail met regeleinde', status: 422, raw: JSON.stringify({ detail: 'Regel een.\nRegel twee.' }), message: downloadErrorMessage(422), technical: 'Regel een.\nRegel twee.' },
    { naam: '422 detail te lang', status: 422, raw: JSON.stringify({ detail: 'a'.repeat(301) }), message: downloadErrorMessage(422), technical: `${'a'.repeat(300)}...` },
    { naam: '422 geneste JSON als detail', status: 422, raw: geneste, message: downloadErrorMessage(422), technical: JSON.stringify({ detail: 'x' }) },
    { naam: '422 platte tekst zonder JSON', status: 422, raw: NIET_BESCHIKBAAR, message: downloadErrorMessage(422), technical: NIET_BESCHIKBAAR },
    { naam: '422 zonder detail', status: 422, raw: null, message: downloadErrorMessage(422), technical: null },
    { naam: '500 gemeld', status: 500, raw: JSON.stringify({ detail: GEMELD }), message: GEMELD, technical: null },
    { naam: '500 niet gemeld', status: 500, raw: JSON.stringify({ detail: NIET_GEMELD }), message: NIET_GEMELD, technical: null },
    { naam: '500 andere melding', status: 500, raw: JSON.stringify({ detail: 'Exportgeneratie mislukt: boom' }), message: downloadErrorMessage(500), technical: 'Exportgeneratie mislukt: boom' },
    { naam: '502 van de proxy zelf', status: 502, raw: PROXY_ONBEREIKBAAR, message: downloadErrorMessage(502), technical: PROXY_ONBEREIKBAAR },
    { naam: '502 met de 500-zin', status: 502, raw: JSON.stringify({ detail: GEMELD }), message: downloadErrorMessage(502), technical: GEMELD },
    { naam: '500 zonder detail', status: 500, raw: null, message: downloadErrorMessage(500), technical: null },
  ]

  it.each(cases)('$naam', ({ status, raw, message, technical }) => {
    expect(resolveDownloadError(status, raw)).toEqual({ message, technical })
  })

  it('bevat in geen enkele tak een em-dash of en-dash', () => {
    for (const { status, raw } of cases) {
      expect(resolveDownloadError(status, raw).message).not.toMatch(DASHES)
    }
  })
})
