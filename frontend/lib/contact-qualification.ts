import {
  getContactDesiredTimingLabel,
  getContactQualificationGuidance,
  getContactRouteLabel,
  type ContactDesiredTiming,
  type ContactRouteInterest,
} from '@/lib/contact-funnel'

type QualificationTone = 'slate' | 'blue' | 'amber' | 'emerald'

type ContactQualificationVisibilityInput = {
  routeInterest: ContactRouteInterest | null
  desiredTiming: ContactDesiredTiming | null
  currentQuestion: string
  qualificationStatus?: string | null
  qualifiedRoute?: ContactRouteInterest | null
  qualificationReviewedBy?: string | null
}

export type ContactQualificationVisibilitySummary = {
  tone: QualificationTone
  headline: string
  detail: string
  recommendationLabel: string
  routeReviewLabel: string
  nextAction: string
}

export function buildContactQualificationVisibilitySummary({
  routeInterest,
  desiredTiming,
  currentQuestion,
  qualificationStatus,
  qualifiedRoute,
  qualificationReviewedBy,
}: ContactQualificationVisibilityInput): ContactQualificationVisibilitySummary {
  const guidance = getContactQualificationGuidance({
    routeInterest,
    desiredTiming,
    currentQuestion,
  })
  const selectedRouteLabel = getContactRouteLabel(routeInterest)
  const recommendedRouteLabel = getContactRouteLabel(guidance.recommendedCoreRoute)
  const timingLabel = getContactDesiredTimingLabel(desiredTiming)
  const followOnLabel = guidance.followOnCandidateRoute ? getContactRouteLabel(guidance.followOnCandidateRoute) : null
  const confirmedRouteLabel = qualifiedRoute ? getContactRouteLabel(qualifiedRoute) : null

  if (qualificationStatus === 'route_confirmed' && confirmedRouteLabel && qualificationReviewedBy) {
    return {
      tone: 'emerald',
      headline: `Qualification bevestigd voor ${confirmedRouteLabel}.`,
      detail: `De route is intern bevestigd door ${qualificationReviewedBy}. Gewenste timing: ${timingLabel}.`,
      recommendationLabel: `Bevestigde intake-route: ${confirmedRouteLabel}`,
      routeReviewLabel: `Oorspronkelijke selectie: ${selectedRouteLabel}`,
      nextAction: 'Gebruik deze bevestigde route nu als basis voor handoff, intake-opzet en eventuele bounded commerce of delivery-readiness.',
    }
  }

  if (qualificationStatus === 'needs_route_review') {
    return {
      tone: 'amber',
      headline: 'Deze lead mag nog niet door zonder expliciete route-review.',
      detail: `De qualification staat nog open of is bewust teruggezet naar review. Gewenste timing: ${timingLabel}.`,
      recommendationLabel: `Werkhypothese: ${recommendedRouteLabel}`,
      routeReviewLabel: `Geselecteerd: ${selectedRouteLabel}`,
      nextAction: 'Bevestig eerst de gekwalificeerde route en reviewer voordat deze lead richting implementation intake schuift.',
    }
  }

  switch (guidance.status) {
    case 'retention_primary':
      return {
        tone: 'emerald',
        headline: 'RetentieScan mag hier als eerste route worden getoetst.',
        detail: `${guidance.detail} Gewenste timing: ${timingLabel}.`,
        recommendationLabel: `Aanbevolen eerste route: ${recommendedRouteLabel}`,
        routeReviewLabel: `Geselecteerd: ${selectedRouteLabel}`,
        nextAction: 'Bevestig dat de vraag echt over vroeg behoudssignaal op groepsniveau gaat en niet alsnog primair over vertrekduiding achteraf.',
      }
    case 'combination_candidate':
      return {
        tone: 'amber',
        headline: 'Combinatie alleen bevestigen als beide kernvragen nu echt actief zijn.',
        detail: `${guidance.detail} Gewenste timing: ${timingLabel}.`,
        recommendationLabel: `Aanbevolen eerste route: ${recommendedRouteLabel}`,
        routeReviewLabel: `Geselecteerd: ${selectedRouteLabel}`,
        nextAction: 'Toets expliciet of zowel vertrekduiding als vroeg behoudssignaal direct nodig zijn; zo niet, vernauw eerst naar een enkele kernroute.',
      }
    case 'bounded_peer_review':
      return {
        tone: 'amber',
        headline: 'Onboarding blijft hier een bounded peer, geen gewone vervolgronde.',
        detail: `${guidance.detail} Gewenste timing: ${timingLabel}.`,
        recommendationLabel: `Kernroute-check: ${recommendedRouteLabel}`,
        routeReviewLabel: `Geselecteerd: ${selectedRouteLabel}`,
        nextAction: 'Toets eerst of de onboardingvraag echt smal en checkpoint-gedreven is. Bevestig anders alsnog een kernroute als eerste managementstap.',
      }
    case 'bounded_follow_on_review':
      return {
        tone: 'amber',
        headline: `${followOnLabel ?? 'Follow-on route'} is alleen logisch na bevestiging van een bestaand signaal.`,
        detail: `${guidance.detail} Gewenste timing: ${timingLabel}.`,
        recommendationLabel: `Core-first fallback: ${recommendedRouteLabel}`,
        routeReviewLabel: `Geselecteerd: ${selectedRouteLabel}`,
        nextAction: `Verifieer eerst dat de eerdere baseline, managementread of het bestaande signaal echt staat. Pas daarna mag ${followOnLabel ?? 'de follow-on route'} bevestigd worden.`,
      }
    case 'follow_on_reframe':
      return {
        tone: 'amber',
        headline: `${followOnLabel ?? 'Follow-on route'} is nog te vroeg als eerste intake-route.`,
        detail: `${guidance.detail} Gewenste timing: ${timingLabel}.`,
        recommendationLabel: `Aanbevolen eerste route: ${recommendedRouteLabel}`,
        routeReviewLabel: `Geselecteerd: ${selectedRouteLabel}`,
        nextAction: `Herkader de intake eerst naar ${recommendedRouteLabel} en leg alleen een follow-on vast als daar later expliciete onderbouwing voor komt.`,
      }
    case 'uncertain_core_review':
      return {
        tone: 'slate',
        headline: 'Deze lead vraagt actieve routevernauwing.',
        detail: `${guidance.detail} Gewenste timing: ${timingLabel}.`,
        recommendationLabel: `Werkhypothese: ${recommendedRouteLabel}`,
        routeReviewLabel: `Geselecteerd: ${selectedRouteLabel}`,
        nextAction: `Laat 'nog niet zeker' niet openstaan en werk de intake actief naar ${recommendedRouteLabel} toe.`,
      }
    case 'core_default':
    default:
      return {
        tone: 'blue',
        headline: 'Core-first intake blijft hier de juiste default.',
        detail: `${guidance.detail} Gewenste timing: ${timingLabel}.`,
        recommendationLabel: `Aanbevolen eerste route: ${recommendedRouteLabel}`,
        routeReviewLabel: `Geselecteerd: ${selectedRouteLabel}`,
        nextAction: `Bevestig ${recommendedRouteLabel} als eerste route tenzij de intake alsnog een sterkere uitzondering onderbouwt.`,
      }
  }
}
