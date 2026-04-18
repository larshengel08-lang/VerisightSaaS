import type { InternalContactRouteInterest } from '@/lib/contact-funnel'

type ReadinessTone = 'slate' | 'amber' | 'blue' | 'emerald'

type MtoAssistedReadinessArgs = {
  qualificationStatus?: string | null
  qualifiedRoute?: InternalContactRouteInterest | string | null
  qualificationReviewedBy?: string | null
  opsOwner?: string | null
  opsNextStep?: string | null
  opsHandoffNote?: string | null
  linkedDeliveryCount?: number
  linkedLearningDossierCount?: number | null
  learningCloseoutEvidenceCount?: number | null
}

export type MtoAssistedReadinessSummary = {
  applicable: boolean
  tone: ReadinessTone
  headline: string
  detail: string
  releaseLabel: string
  checklistItems: string[]
}

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0)
}

export function buildMtoAssistedReadinessSummary({
  qualificationStatus,
  qualifiedRoute,
  qualificationReviewedBy,
  opsOwner,
  opsNextStep,
  opsHandoffNote,
  linkedDeliveryCount = 0,
  linkedLearningDossierCount = null,
  learningCloseoutEvidenceCount = null,
}: MtoAssistedReadinessArgs): MtoAssistedReadinessSummary {
  if (qualificationStatus !== 'route_confirmed' || qualifiedRoute !== 'mto') {
    return {
      applicable: false,
      tone: 'slate',
      headline: 'MTO assisted readiness nog niet actief',
      detail: 'Deze extra readinesslaag opent pas nadat qualification MTO intern expliciet heeft bevestigd.',
      releaseLabel: 'Niet van toepassing',
      checklistItems: [],
    }
  }

  const missingOwner = !hasText(opsOwner)
  const missingNextStep = !hasText(opsNextStep)
  const missingHandoff = !hasText(opsHandoffNote)
  const hasDeliveryLink = linkedDeliveryCount > 0
  const proofSpineKnown = linkedLearningDossierCount !== null
  const hasProofSpine = (linkedLearningDossierCount ?? 0) > 0
  const proofEvidenceKnown = learningCloseoutEvidenceCount !== null
  const hasProofEvidence = (learningCloseoutEvidenceCount ?? 0) > 0

  const checklistItems: string[] = []
  if (missingOwner) {
    checklistItems.push('Wijs eerst een expliciete assisted intake-owner toe voor deze MTO-route.')
  }
  if (missingNextStep) {
    checklistItems.push('Leg de eerstvolgende assisted intake- of managementstap expliciet vast.')
  }
  if (missingHandoff) {
    checklistItems.push('Voeg een handoffnote toe met surveygrens, deliverable-proof, trustproof en action-logkader.')
  }
  if (!hasDeliveryLink) {
    checklistItems.push('Open een gekoppelde delivery-shell voordat MTO intern als assisted launch route wordt behandeld.')
  }
  if (proofSpineKnown && !hasProofSpine) {
    checklistItems.push('Start een learning- of proofspoor zodat MTO-sample, intakefrictie en managementread intern traceerbaar blijven.')
  } else if (proofSpineKnown && proofEvidenceKnown && !hasProofEvidence) {
    checklistItems.push('Werk het proofspoor bij tot er minstens een expliciete review-, vervolg- of stopuitkomst vastligt.')
  }

  if (checklistItems.length > 0) {
    return {
      applicable: true,
      tone: missingOwner || missingHandoff ? 'amber' : 'blue',
      headline: missingOwner || missingHandoff
        ? 'MTO intern bevestigd, maar nog niet intakeklaar'
        : 'MTO assisted route staat, maar readinessdiscipline is nog niet volledig rond',
      detail: qualificationReviewedBy
        ? `MTO is intern bevestigd door ${qualificationReviewedBy}, maar blijft assisted-only totdat owner, handoff, delivery en proofspoor scherp genoeg zijn.`
        : 'MTO is intern bevestigd, maar blijft assisted-only totdat owner, handoff, delivery en proofspoor scherp genoeg zijn.',
      releaseLabel: 'Nog niet intern assisted vrijgegeven',
      checklistItems,
    }
  }

  return {
    applicable: true,
    tone: 'emerald',
    headline: 'MTO assisted readiness staat',
    detail:
      'De interne MTO-route heeft nu een expliciete owner, handoff, delivery-link en proofspoor, waardoor assisted intake en eerste managementread verdedigbaar kunnen worden voorbereid.',
    releaseLabel: 'Klaar voor intern assisted vervolg',
    checklistItems: [
      'Behoud deliverable-proof en trustproof als eerste bewijslaag; open nog geen publieke case- of CTA-surface.',
      'Gebruik de action-logroute alleen als begeleide managementstap na de eerste brede read.',
    ],
  }
}
