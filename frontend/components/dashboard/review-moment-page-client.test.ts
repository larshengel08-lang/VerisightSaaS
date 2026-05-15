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
    expect(source).toContain('routeScanTypeByRouteId')
    expect(source).toContain('nativeCalendarEligibleRouteIds')
    expect(source).toContain('new Set(inviteDownloadEligibleRouteIds)')
    expect(source).toContain('new Set(nativeCalendarEligibleRouteIds)')
    expect(source).toContain('canDownloadInviteArtifact')
    expect(source).toContain('canScheduleReviewControls')
    expect(source).toContain('canUseNativeCalendarSync')
    expect(source).toContain('ReviewMomentDetailPanel')
    expect(source).toContain('inviteDownloadEligibleRouteIdSet.has(selectedItem.coreSemantics.route.routeId)')
    expect(source).toContain('canDownloadInviteArtifact={canDownloadInviteArtifact}')
    expect(source).toContain('canScheduleReviewControls={canScheduleReviewControls}')
    expect(source).toContain('canUseNativeCalendarSync={canUseNativeCalendarSync}')
    expect(source).toContain('selectedRouteScanType={selectedRouteScanType}')
    expect(source).toContain('const canScheduleReviewControls =')
    expect(source).toContain('canScheduleActionCenterReview && canManageSelectedReviewRhythm')
    expect(source).toContain('nativeCalendarEligibleRouteIdSet.has(selectedItem.coreSemantics.route.routeId)')
    expect(source).toContain('configByRouteId[getReviewMomentRouteId(item)]')
    expect(source).toContain('manageableReviewRhythmRouteIdSet.has(selectedRhythmItem.coreSemantics.route.routeId)')
    expect(source).toContain('[selectedRhythmItem.coreSemantics.route.routeId]: nextConfig')
    expect(source).toContain('selectedRouteId={selectedRhythmItem ? selectedRhythmItem.coreSemantics.route.routeId : null}')
  })

  it('threads the bounded HR rhythm console into the existing reviewmomenten surface', () => {
    const source = readFileSync(new URL('./review-moment-page-client.tsx', import.meta.url), 'utf8')

    expect(source).toContain('ReviewRhythmConsole')
    expect(source).toContain('manageableReviewRhythmRouteIds')
    expect(source).toContain('new Set(manageableReviewRhythmRouteIds)')
    expect(source).toContain('canManageSelectedReviewRhythm')
    expect(source).toContain('rhythmConfigByRouteId')
    expect(source).toContain('buildDefaultActionCenterReviewRhythmConfig')
    expect(source).toContain('getActionCenterEnabledRouteDefaults(routeScanTypeByRouteId[getReviewMomentRouteId(selectedItem)])')
    expect(source).toContain('selectedRouteId={selectedRhythmItem ? selectedRhythmItem.coreSemantics.route.routeId : null}')
    expect(source).toContain('selectedRouteScanType={selectedRouteScanType}')
    expect(source).toContain('computeRhythmSummary(')
    expect(source).toContain('routeScanTypeByRouteId,')
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
