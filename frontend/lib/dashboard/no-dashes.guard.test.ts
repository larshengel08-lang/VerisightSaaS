import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Spec 2026-09-16 par. 7: geen em- (U+2014) of en-dashes (U+2013) in de copy
 * van de ingelogde omgeving. De guard loopt alle niet-testbronnen af in
 * components/dashboard, app/(dashboard) en app/(auth), ook commentaar: één
 * regel is makkelijker te bewaken dan een uitzondering per regel.
 */
const ROOTS = ['components/dashboard', 'app/(dashboard)', 'app/(auth)']

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) sourceFiles(full, out)
    else if (/\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name)) out.push(full)
  }
  return out
}

describe('geen em- of en-dashes in de ingelogde omgeving (spec 2026-09-16 par. 7)', () => {
  it('vindt geen enkele U+2014 of U+2013 in bronbestanden onder de drie mappen', () => {
    const hits: string[] = []
    let scannedCount = 0
    for (const root of ROOTS) {
      for (const file of sourceFiles(path.join(process.cwd(), root))) {
        scannedCount += 1
        fs.readFileSync(file, 'utf8')
          .split('\n')
          .forEach((line, index) => {
            if (/[—–]/.test(line)) hits.push(`${path.relative(process.cwd(), file)}:${index + 1}`)
          })
      }
    }
    // Sanity: een verkeerde of lege root laat de guard hierboven vals-groen slagen
    // (geen bestanden = geen treffers). Dwing een minimumaantal af zodat een
    // kapotte ROOTS-configuratie hard faalt in plaats van stil te slagen.
    expect(scannedCount, `slechts ${scannedCount} bronbestanden gevonden onder ${ROOTS.join(', ')}`).toBeGreaterThan(50)
    expect(hits, `streepjes gevonden in:\n${hits.join('\n')}`).toEqual([])
  })
})
