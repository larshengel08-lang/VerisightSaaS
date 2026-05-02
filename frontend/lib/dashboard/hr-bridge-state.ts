import type { ActionCenterEntryStage } from '@/lib/action-center-route-contract'

export type HrBridgeState = 'attention' | 'candidate' | 'active'
export type HrBridgeSurface = 'overview' | 'reports' | 'campaign-detail'

export interface BridgeAssessmentTruth {
  sourceType: 'campaign' | 'report'
  sourceId: string
  assessmentState: 'attention' | 'candidate'
  signalReadable: boolean
  managementMeaningClear: boolean
  plausibleFollowUpExists: boolean
  assessedAt: string
}

export function buildBridgeAssessmentTruth(args: {
  sourceType: 'campaign' | 'report'
  sourceId: string
  signalReadable: boolean
  managementMeaningClear: boolean
  plausibleFollowUpExists: boolean
  assessedAt: string
}): BridgeAssessmentTruth {
  const assessmentState =
    args.signalReadable && args.managementMeaningClear && args.plausibleFollowUpExists ? 'candidate' : 'attention'

  return {
    sourceType: args.sourceType,
    sourceId: args.sourceId,
    assessmentState,
    signalReadable: args.signalReadable,
    managementMeaningClear: args.managementMeaningClear,
    plausibleFollowUpExists: args.plausibleFollowUpExists,
    assessedAt: args.assessedAt,
  }
}

export function resolveHrBridgeState(args: {
  routeEntryStage: ActionCenterEntryStage | null
  assessment: BridgeAssessmentTruth
}): HrBridgeState {
  if (args.routeEntryStage === 'active') return 'active'
  if (args.assessment.assessmentState === 'candidate') return 'candidate'
  return 'attention'
}

export function getHrBridgePresentation(args: {
  bridgeState: HrBridgeState
  surface: HrBridgeSurface
}) {
  if (args.bridgeState === 'active') {
    return {
      label: 'Actieve opvolging',
      tone: 'emerald' as const,
      body: 'Deze route loopt al in Action Center. Daar blijven eigenaarschap, eerste managerstap en reviewritme expliciet.',
      ctaKind: 'open' as const,
      ctaLabel: 'Open route in Action Center',
    }
  }

  if (args.bridgeState === 'candidate') {
    if (args.surface === 'overview') {
      return {
        label: 'Route-kandidaat',
        tone: 'amber' as const,
        body: 'Dit signaal lijkt klaar voor opvolging, maar is nog niet geopend.',
        ctaKind: 'evaluate' as const,
        ctaLabel: 'Beoordeel opvolging',
      }
    }

    if (args.surface === 'reports') {
      return {
        label: 'Route-kandidaat',
        tone: 'amber' as const,
        body: 'Gebruik campaign detail om te beslissen of je deze opvolging opent.',
        ctaKind: 'view' as const,
        ctaLabel: 'Ga naar campaign detail',
      }
    }

    return {
      label: 'Route-kandidaat',
      tone: 'amber' as const,
      body: 'Deze campaign-read is scherp genoeg om de vervolgroute in Action Center te openen. Daar leg je eigenaarschap, eerste managerstap en reviewritme vast.',
      ctaKind: 'open' as const,
      ctaLabel: 'Open route in Action Center',
    }
  }

  return {
    label: 'Alleen aandacht',
    tone: 'slate' as const,
    body: 'Lees eerst verder voordat je hier opvolging van maakt.',
    ctaKind: 'view' as const,
    ctaLabel: args.surface === 'overview' ? 'Bekijk campagne' : 'Lees campagne',
  }
}
