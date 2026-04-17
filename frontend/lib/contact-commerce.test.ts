import { describe, expect, it } from 'vitest'
import {
  buildBoundedCommerceVisibilitySummary,
  getCommerceAgreementStatusLabel,
  getCommercePricingModeLabel,
  getCommerceStartReadinessLabel,
  supportsBoundedCommerceRoute,
} from '@/lib/contact-commerce'

describe('bounded commerce helpers', () => {
  it('only allows bounded commerce for ExitScan and RetentieScan', () => {
    expect(supportsBoundedCommerceRoute('exitscan')).toBe(true)
    expect(supportsBoundedCommerceRoute('retentiescan')).toBe(true)
    expect(supportsBoundedCommerceRoute('combinatie')).toBe(false)
    expect(supportsBoundedCommerceRoute('teamscan')).toBe(false)
    expect(supportsBoundedCommerceRoute('leadership')).toBe(false)
  })

  it('keeps agreement, pricing and readiness labels buyer-safe and operator-readable', () => {
    expect(getCommerceAgreementStatusLabel('not_started')).toBe('Nog niet bevestigd')
    expect(getCommerceAgreementStatusLabel('confirmed')).toBe('Commercieel bevestigd')
    expect(getCommercePricingModeLabel('public_anchor')).toBe('Publiek prijsanker')
    expect(getCommercePricingModeLabel('custom_quote')).toBe('Custom quote')
    expect(getCommerceStartReadinessLabel('not_ready')).toBe('Nog niet startklaar')
    expect(getCommerceStartReadinessLabel('ready')).toBe('Startklaar')
    expect(getCommerceStartReadinessLabel('blocked')).toBe('Start geblokkeerd')
  })

  it('builds a ready-for-delivery summary for confirmed core routes without linked delivery', () => {
    const summary = buildBoundedCommerceVisibilitySummary({
      routeInterest: 'exitscan',
      agreementStatus: 'confirmed',
      pricingMode: 'public_anchor',
      startReadinessStatus: 'ready',
      startBlocker: null,
      agreementConfirmedBy: 'Verisight Ops',
      agreementConfirmedAt: '2026-04-17T09:30:00Z',
      readinessReviewedBy: 'Delivery Lead',
      readinessReviewedAt: '2026-04-17T10:00:00Z',
      linkedDeliveryCount: 0,
      linkedDeliveryLifecycle: null,
    })

    expect(summary.supported).toBe(true)
    expect(summary.headline).toBe('Klaar voor delivery-koppeling')
    expect(summary.tone).toBe('emerald')
    expect(summary.deliveryHint).toContain('handoff')
    expect(summary.agreementAuditLabel).toContain('Verisight Ops')
    expect(summary.readinessAuditLabel).toContain('Delivery Lead')
    expect(summary.deliveryReleaseStatus).toBe('release_ready')
    expect(summary.deliveryReleaseLabel).toContain('Vrijgegeven')
  })

  it('builds a blocked summary when start readiness is blocked', () => {
    const summary = buildBoundedCommerceVisibilitySummary({
      routeInterest: 'retentiescan',
      agreementStatus: 'confirmed',
      pricingMode: 'custom_quote',
      startReadinessStatus: 'blocked',
      startBlocker: 'Intake mist nog definitieve doelgroepbevestiging.',
      agreementConfirmedBy: null,
      agreementConfirmedAt: null,
      readinessReviewedBy: null,
      readinessReviewedAt: null,
      linkedDeliveryCount: 0,
      linkedDeliveryLifecycle: null,
    })

    expect(summary.supported).toBe(true)
    expect(summary.headline).toBe('Start geblokkeerd')
    expect(summary.tone).toBe('red')
    expect(summary.blocker).toContain('doelgroepbevestiging')
    expect(summary.agreementAuditLabel).toContain('ontbreekt')
    expect(summary.readinessAuditLabel).toContain('ontbreekt')
    expect(summary.deliveryReleaseStatus).toBe('release_blocked')
  })

  it('keeps non-core routes outside bounded commerce visibility', () => {
    const summary = buildBoundedCommerceVisibilitySummary({
      routeInterest: 'teamscan',
      agreementStatus: 'confirmed',
      pricingMode: 'custom_quote',
      startReadinessStatus: 'ready',
      startBlocker: null,
      agreementConfirmedBy: 'Verisight Ops',
      agreementConfirmedAt: '2026-04-17T09:30:00Z',
      readinessReviewedBy: 'Delivery Lead',
      readinessReviewedAt: '2026-04-17T10:00:00Z',
      linkedDeliveryCount: 0,
      linkedDeliveryLifecycle: null,
    })

    expect(summary.supported).toBe(false)
    expect(summary.headline).toBe('Bounded commerce niet actief')
    expect(summary.deliveryReleaseStatus).toBe('not_applicable')
  })

  it('keeps confirmed but not internally confirmed states visible for operators', () => {
    const summary = buildBoundedCommerceVisibilitySummary({
      routeInterest: 'exitscan',
      agreementStatus: 'confirmed',
      pricingMode: 'public_anchor',
      startReadinessStatus: 'not_ready',
      startBlocker: null,
      agreementConfirmedBy: null,
      agreementConfirmedAt: null,
      readinessReviewedBy: null,
      readinessReviewedAt: null,
      linkedDeliveryCount: 0,
      linkedDeliveryLifecycle: null,
    })

    expect(summary.headline).toBe('Commercieel bevestigd, nog niet startklaar')
    expect(summary.agreementAuditLabel).toContain('interne bevestiging ontbreekt')
    expect(summary.readinessAuditLabel).toContain('Readiness review volgt pas')
    expect(summary.deliveryReleaseStatus).toBe('awaiting_readiness_review')
  })

  it('shows a governance gap when ready is set without internal confirmation', () => {
    const summary = buildBoundedCommerceVisibilitySummary({
      routeInterest: 'exitscan',
      agreementStatus: 'confirmed',
      pricingMode: 'public_anchor',
      startReadinessStatus: 'ready',
      startBlocker: null,
      agreementConfirmedBy: null,
      agreementConfirmedAt: null,
      readinessReviewedBy: 'Delivery Lead',
      readinessReviewedAt: '2026-04-17T10:00:00Z',
      linkedDeliveryCount: 0,
      linkedDeliveryLifecycle: null,
    })

    expect(summary.deliveryReleaseStatus).toBe('awaiting_internal_confirmation')
    expect(summary.deliveryReleaseLabel).toContain('Nog niet vrijgegeven')
    expect(summary.blocker).toContain('Interne akkoordbevestiging')
  })
})
