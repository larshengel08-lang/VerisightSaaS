import type { ContactRouteInterest } from '@/lib/contact-funnel'
import type { DeliveryLifecycleStage } from '@/lib/ops-delivery'

export type CommerceAgreementStatus = 'not_started' | 'confirmed' | 'blocked'
export type CommercePricingMode = 'public_anchor' | 'custom_quote'
export type CommerceStartReadinessStatus = 'not_ready' | 'ready' | 'blocked'
export type BoundedCommerceVisibilityTone = 'slate' | 'amber' | 'emerald' | 'red'
export type BoundedCommerceDeliveryReleaseStatus =
  | 'not_applicable'
  | 'awaiting_commercial_confirmation'
  | 'awaiting_internal_confirmation'
  | 'awaiting_readiness_review'
  | 'release_blocked'
  | 'release_ready'
  | 'delivery_linked'

export const BOUNDED_COMMERCE_CORE_ROUTES: ContactRouteInterest[] = ['exitscan', 'retentiescan']

type BoundedCommerceVisibilityArgs = {
  routeInterest: ContactRouteInterest | string | null | undefined
  agreementStatus: CommerceAgreementStatus | null | undefined
  pricingMode: CommercePricingMode | null | undefined
  startReadinessStatus: CommerceStartReadinessStatus | null | undefined
  startBlocker: string | null | undefined
  agreementConfirmedBy: string | null | undefined
  agreementConfirmedAt: string | null | undefined
  readinessReviewedBy: string | null | undefined
  readinessReviewedAt: string | null | undefined
  linkedDeliveryCount: number
  linkedDeliveryLifecycle?: DeliveryLifecycleStage | null
}

export type BoundedCommerceVisibilitySummary = {
  supported: boolean
  headline: string
  detail: string
  blocker: string | null
  tone: BoundedCommerceVisibilityTone
  deliveryHint: string
  agreementAuditLabel: string
  readinessAuditLabel: string
  deliveryReleaseStatus: BoundedCommerceDeliveryReleaseStatus
  deliveryReleaseLabel: string
  deliveryReleaseDetail: string
}

export function supportsBoundedCommerceRoute(
  routeInterest: ContactRouteInterest | string | null | undefined,
): routeInterest is 'exitscan' | 'retentiescan' {
  return routeInterest === 'exitscan' || routeInterest === 'retentiescan'
}

export function getCommerceAgreementStatusLabel(value: CommerceAgreementStatus | null | undefined) {
  switch (value) {
    case 'confirmed':
      return 'Commercieel bevestigd'
    case 'blocked':
      return 'Commercieel geblokkeerd'
    case 'not_started':
    default:
      return 'Nog niet bevestigd'
  }
}

export function getCommercePricingModeLabel(value: CommercePricingMode | null | undefined) {
  switch (value) {
    case 'custom_quote':
      return 'Custom quote'
    case 'public_anchor':
      return 'Publiek prijsanker'
    default:
      return 'Nog niet gekozen'
  }
}

export function getCommerceStartReadinessLabel(value: CommerceStartReadinessStatus | null | undefined) {
  switch (value) {
    case 'ready':
      return 'Startklaar'
    case 'blocked':
      return 'Start geblokkeerd'
    case 'not_ready':
    default:
      return 'Nog niet startklaar'
  }
}

function formatAuditMoment(value: string | null | undefined) {
  if (!value) return null
  try {
    return new Intl.DateTimeFormat('nl-NL', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Amsterdam',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export function buildBoundedCommerceVisibilitySummary({
  routeInterest,
  agreementStatus,
  pricingMode,
  startReadinessStatus,
  startBlocker,
  agreementConfirmedBy,
  agreementConfirmedAt,
  readinessReviewedBy,
  readinessReviewedAt,
  linkedDeliveryCount,
  linkedDeliveryLifecycle,
}: BoundedCommerceVisibilityArgs): BoundedCommerceVisibilitySummary {
  if (!supportsBoundedCommerceRoute(routeInterest)) {
    return {
      supported: false,
      headline: 'Bounded commerce niet actief',
      detail: 'Deze route blijft in deze waves buiten de assisted commerce-laag.',
      blocker: null,
      tone: 'slate',
      deliveryHint: 'Geen bounded commerce handoff voor deze route.',
      agreementAuditLabel: 'Interne akkoordbevestiging niet van toepassing op deze route.',
      readinessAuditLabel: 'Readiness review niet van toepassing op deze route.',
      deliveryReleaseStatus: 'not_applicable',
      deliveryReleaseLabel: 'Geen delivery-releasepad',
      deliveryReleaseDetail: 'Deze route blijft buiten de bounded delivery-start governance.',
    }
  }

  const hasInternalAgreementConfirmation = agreementStatus === 'confirmed' && Boolean(agreementConfirmedBy)
  const hasReadinessReview =
    (startReadinessStatus === 'ready' || startReadinessStatus === 'blocked') && Boolean(readinessReviewedBy)

  const agreementAuditLabel =
    agreementStatus === 'confirmed'
      ? agreementConfirmedBy
        ? `Intern bevestigd door ${agreementConfirmedBy}${
            formatAuditMoment(agreementConfirmedAt) ? ` op ${formatAuditMoment(agreementConfirmedAt)}` : ''
          }.`
        : 'Commercieel akkoord staat, maar interne bevestiging ontbreekt nog.'
      : 'Interne akkoordbevestiging volgt pas na commercieel akkoord.'

  const readinessAuditLabel =
    startReadinessStatus === 'ready' || startReadinessStatus === 'blocked'
      ? readinessReviewedBy
        ? `Readiness laatst herzien door ${readinessReviewedBy}${
            formatAuditMoment(readinessReviewedAt) ? ` op ${formatAuditMoment(readinessReviewedAt)}` : ''
          }.`
        : 'Readiness staat vast, maar review-attributie ontbreekt nog.'
      : 'Readiness review volgt pas zodra startstatus expliciet is vastgesteld.'

  if (agreementStatus === 'blocked') {
    return {
      supported: true,
      headline: 'Commercieel akkoord geblokkeerd',
      detail: 'Los eerst de commerciele blokkade op voordat dit traject naar start readiness of delivery schuift.',
      blocker: startBlocker ?? null,
      tone: 'red',
      deliveryHint: 'Delivery blijft dicht zolang commercieel akkoord geblokkeerd is.',
      agreementAuditLabel,
      readinessAuditLabel,
      deliveryReleaseStatus: 'awaiting_commercial_confirmation',
      deliveryReleaseLabel: 'Niet vrijgegeven voor deliverystart',
      deliveryReleaseDetail: 'Los eerst de commerciële blokkade op voordat deze lead richting delivery kan bewegen.',
    }
  }

  if (agreementStatus !== 'confirmed') {
    return {
      supported: true,
      headline: 'Nog geen commercieel akkoord',
      detail: 'Deze lead heeft nog geen bevestigde route, prijsmodus en handoff om richting delivery te bewegen.',
      blocker: null,
      tone: 'slate',
      deliveryHint: 'Bevestig eerst akkoord en prijsmodus.',
      agreementAuditLabel,
      readinessAuditLabel,
      deliveryReleaseStatus: 'awaiting_commercial_confirmation',
      deliveryReleaseLabel: 'Nog niet delivery-releasebaar',
      deliveryReleaseDetail: 'Commercieel akkoord ontbreekt nog, dus delivery-start blijft bewust dicht.',
    }
  }

  if (!pricingMode) {
    return {
      supported: true,
      headline: 'Akkoord mist prijsmodus',
      detail: 'Het traject is commercieel bevestigd, maar nog niet scherp genoeg vastgelegd voor een veilige start.',
      blocker: 'Prijsmodus ontbreekt nog.',
      tone: 'amber',
      deliveryHint: 'Kies eerst publiek prijsanker of custom quote.',
      agreementAuditLabel,
      readinessAuditLabel,
      deliveryReleaseStatus: 'awaiting_commercial_confirmation',
      deliveryReleaseLabel: 'Nog niet delivery-releasebaar',
      deliveryReleaseDetail: 'Zonder prijsmodus blijft deze lead commercieel te onvolledig voor delivery-start.',
    }
  }

  if (startReadinessStatus === 'blocked') {
    return {
      supported: true,
      headline: 'Start geblokkeerd',
      detail: 'Het traject is commercieel bevestigd, maar mag nog niet naar delivery doorstromen.',
      blocker: startBlocker ?? 'Startblokker nog niet gespecificeerd.',
      tone: 'red',
      deliveryHint: 'Los eerst de startblokkade op voordat delivery wordt gekoppeld.',
      agreementAuditLabel,
      readinessAuditLabel,
      deliveryReleaseStatus: 'release_blocked',
      deliveryReleaseLabel: 'Delivery-start expliciet geblokkeerd',
      deliveryReleaseDetail: hasReadinessReview
        ? 'Er is een expliciete review gedaan, maar de lead blijft bewust tegengehouden voor delivery-start.'
        : 'De lead oogt geblokkeerd, maar de review-attributie voor die releasegrens ontbreekt nog.',
    }
  }

  if (startReadinessStatus === 'ready') {
    if (!hasInternalAgreementConfirmation) {
      return {
        supported: true,
        headline: 'Startklaar, maar interne akkoordbevestiging ontbreekt',
        detail: 'De lead staat op ready, maar mist nog de interne akkoordbevestiging die nodig is voor een verdedigbare vrijgave.',
        blocker: 'Interne akkoordbevestiging ontbreekt nog.',
        tone: 'amber',
        deliveryHint: 'Bevestig eerst expliciet wie commercieel akkoord intern heeft bevestigd.',
        agreementAuditLabel,
        readinessAuditLabel,
        deliveryReleaseStatus: 'awaiting_internal_confirmation',
        deliveryReleaseLabel: 'Nog niet vrijgegeven voor deliverystart',
        deliveryReleaseDetail: 'Ready alleen is nog niet genoeg; eerst moet commerciële bevestiging intern expliciet vastliggen.',
      }
    }

    if (!hasReadinessReview) {
      return {
        supported: true,
        headline: 'Startklaar, maar readiness review ontbreekt',
        detail: 'De lead staat op ready, maar mist nog de review die de delivery-startgrens expliciet maakt.',
        blocker: 'Readiness review ontbreekt nog.',
        tone: 'amber',
        deliveryHint: 'Leg eerst vast wie de readiness review voor delivery-start heeft gedaan.',
        agreementAuditLabel,
        readinessAuditLabel,
        deliveryReleaseStatus: 'awaiting_readiness_review',
        deliveryReleaseLabel: 'Nog niet vrijgegeven voor deliverystart',
        deliveryReleaseDetail: 'De lead kan pas echt worden vrijgegeven nadat de readiness review expliciet is vastgelegd.',
      }
    }

    if (linkedDeliveryCount > 0) {
      return {
        supported: true,
        headline: 'Klaar en gekoppeld aan delivery',
        detail: 'Commercieel akkoord, prijsmodus en start readiness zijn rond; delivery is al zichtbaar gekoppeld.',
        blocker: null,
        tone: 'emerald',
        deliveryHint: linkedDeliveryLifecycle
          ? `Delivery loopt al via lifecycle: ${linkedDeliveryLifecycle}.`
          : 'Deliveryrecord is al gekoppeld.',
        agreementAuditLabel,
        readinessAuditLabel,
        deliveryReleaseStatus: 'delivery_linked',
        deliveryReleaseLabel: 'Vrijgegeven en gekoppeld aan delivery',
        deliveryReleaseDetail: 'De bounded commerce-grens is gepasseerd en de lead is al expliciet aangesloten op de deliveryspine.',
      }
    }

    return {
      supported: true,
      headline: 'Klaar voor delivery-koppeling',
      detail: 'Dit traject kan nu verantwoord naar de uitvoeringslaag worden overgezet.',
      blocker: null,
      tone: 'emerald',
      deliveryHint: 'Maak nu expliciet de handoff naar delivery of campaignstart.',
      agreementAuditLabel,
      readinessAuditLabel,
      deliveryReleaseStatus: 'release_ready',
      deliveryReleaseLabel: 'Vrijgegeven voor deliverystart',
      deliveryReleaseDetail: 'Commercieel akkoord, interne bevestiging en readiness review staan scherp genoeg om delivery verantwoord te starten.',
    }
  }

  return {
    supported: true,
    headline: 'Commercieel bevestigd, nog niet startklaar',
    detail: 'Akkoord en prijsmodus staan, maar de overgang naar delivery is nog niet vrijgegeven.',
    blocker: startBlocker ?? null,
    tone: 'amber',
    deliveryHint: 'Start readiness moet nog expliciet op ready of blocked worden gezet.',
    agreementAuditLabel,
    readinessAuditLabel,
    deliveryReleaseStatus: 'awaiting_readiness_review',
    deliveryReleaseLabel: 'Nog niet vrijgegeven voor deliverystart',
    deliveryReleaseDetail: 'Deze lead is commercieel bevestigd, maar de releasegrens naar delivery is nog niet expliciet vastgesteld.',
  }
}
