import { describe, expect, it } from 'vitest'
import { downloadErrorMessage, purgedDownloadMessage, summarizeTechnicalDetail } from './report-download-error'
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
