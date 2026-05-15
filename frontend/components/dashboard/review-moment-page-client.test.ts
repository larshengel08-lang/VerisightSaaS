import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('review moment page client source', () => {
  it('keeps the agreed reviewmomenten labels in the visible page shell', () => {
    const source = readFileSync(new URL('./review-moment-page-client.tsx', import.meta.url), 'utf8')
    const counterSource = readFileSync(new URL('./review-moment-counter-row.tsx', import.meta.url), 'utf8')
    const laneSource = readFileSync(new URL('./review-moment-lane.tsx', import.meta.url), 'utf8')
    const cardSource = readFileSync(new URL('./review-moment-card.tsx', import.meta.url), 'utf8')
    const governanceSource = readFileSync(new URL('./review-moment-governance-section.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Reviewmomenten')
    expect(source).toContain('Bewaak geplande opvolgmomenten, gekoppelde scopes en bekende uitkomsten.')
    expect(source).toContain('Deze pagina toont reviewritme. Geen scananalyse, rapportduiding of extra coördinatielaag.')
    expect(source).toContain("join(' · ')")
    expect(counterSource).toContain('Achterstallig')
    expect(counterSource).toContain('Deze week')
    expect(counterSource).toContain('Binnenkort')
    expect(counterSource).toContain('Afgerond')
    expect(laneSource).toContain('Achterstallig')
    expect(cardSource).toContain('min-w-0 flex-1')
    expect(cardSource).toContain('max-w-full break-words')
    expect(governanceSource).toContain('Reviewgovernance')
    expect(source).toContain('Bekijk afgeronde reviews')
    expect(source).toContain('Bekijk gekoppelde opvolging')
    expect(source).toContain("Reviewmomenten tonen ritme en discipline. Acties, dashboardduiding en rapportinhoud staan op aparte pagina's.")
  })

  it('threads review invite permission and server-derived route eligibility only into the detail panel caller path', () => {
    const source = readFileSync(new URL('./review-moment-page-client.tsx', import.meta.url), 'utf8')

    expect(source).toContain('canScheduleActionCenterReview')
    expect(source).toContain('inviteDownloadEligibleRouteIds')
    expect(source).toContain('new Set(inviteDownloadEligibleRouteIds)')
    expect(source).toContain('canDownloadInviteArtifact')
    expect(source).toContain('ReviewMomentDetailPanel')
    expect(source).toContain('inviteDownloadEligibleRouteIdSet.has(selectedItem.id)')
    expect(source).toContain('canDownloadInviteArtifact={canDownloadInviteArtifact}')
  })

  it('threads the bounded HR rhythm console into the existing reviewmomenten surface', () => {
    const source = readFileSync(new URL('./review-moment-page-client.tsx', import.meta.url), 'utf8')

    expect(source).toContain('ReviewRhythmConsole')
    expect(source).toContain('manageableReviewRhythmRouteIds')
    expect(source).toContain('new Set(manageableReviewRhythmRouteIds)')
    expect(source).toContain('canManageSelectedReviewRhythm')
    expect(source).toContain('rhythmConfigByRouteId')
    expect(source).toContain('rhythmSummary')
    expect(source).toContain('buildDefaultActionCenterReviewRhythmConfig')
    expect(source).toContain('const selectedRhythmItem = selectedItem && isExitRouteItem(selectedItem) ? selectedItem : null')
    expect(source).toContain('selectedRouteId={selectedRhythmItem ? selectedRhythmItem.id : null}')
    expect(source).toContain('computeRhythmSummary(visibleItems, clientRhythmConfigByRouteId, referenceNow)')
    expect(source).not.toContain('Graph')
    expect(source).not.toContain('automation builder')
  })

  it('keeps forbidden automation, lifecycle copy and mojibake out of the page shell', () => {
    const source = readFileSync(new URL('./review-moment-page-client.tsx', import.meta.url), 'utf8').toLowerCase()

    for (const forbidden of [
      'automation',
      'recurring',
      'advies',
      'dashboardinterpretatie',
      'generieke planning',
      'planningslaag',
      'planningstool',
      'uitnodiging',
      'activatie',
      'workflow builder',
      'outlook',
      'mail engine',
      'pending',
      'activated',
      'access requested',
      'Ã£',
      'Ã¢',
      'ï¿½',
    ]) {
      expect(source).not.toContain(forbidden)
    }

    expect(source).not.toContain('Ã‚Â·'.toLowerCase())
  })
})
