import { describe, expect, it } from 'vitest'
import {
  BOUNDED_PEER_MARKETING_PRODUCTS,
  CORE_MARKETING_PRODUCTS,
  FOLLOW_ON_MARKETING_PRODUCTS,
  LIVE_MARKETING_PRODUCTS,
  RESERVED_MARKETING_PRODUCTS,
  SECONDARY_FIRST_BUY_MARKETING_PRODUCTS,
} from '@/lib/marketing-products'
import {
  approachSteps,
  customerLifecycleStages,
  included,
  pricingAddOns,
  pricingCards,
  pricingChoiceGuide,
  pricingFaqs,
  pricingFollowOnRoutes,
  pricingLifecycleLadder,
  productFollowOnRouteRows,
  productPrimaryRouteCards,
  productSecondaryFirstBuyRoute,
} from '@/components/marketing/site-content'

describe('baseline-first commercial model', () => {
  it('keeps ExitScan and RetentieScan as the two core first-buy routes', () => {
    expect(CORE_MARKETING_PRODUCTS.map((product) => product.slug)).toEqual(['exitscan', 'retentiescan'])
    expect(productPrimaryRouteCards.map((route) => route.title)).toEqual(['ExitScan', 'RetentieScan'])
  })

  it('keeps onboarding visible as a smaller secondary first-buy route', () => {
    expect(SECONDARY_FIRST_BUY_MARKETING_PRODUCTS.map((product) => product.slug)).toEqual(['onboarding-30-60-90'])
    expect(BOUNDED_PEER_MARKETING_PRODUCTS.map((product) => product.slug)).toEqual(['onboarding-30-60-90'])
    expect(SECONDARY_FIRST_BUY_MARKETING_PRODUCTS[0]?.portfolioRole).toBe('secondary_first_buy_route')
    expect(productSecondaryFirstBuyRoute.href).toBe('/producten/onboarding-30-60-90')
  })

  it('keeps pulse, leadership and combinatie as later follow-on routes', () => {
    expect(FOLLOW_ON_MARKETING_PRODUCTS.map((product) => product.slug)).toEqual([
      'combinatie',
      'pulse',
      'leadership-scan',
    ])
    expect(productFollowOnRouteRows.map(([title]) => title)).toEqual([
      'ExitScan Live Start',
      'Reviewcadans',
      'Pulse',
      'Leadership Scan',
      'Combinatie',
    ])
  })

  it('keeps the live portfolio limited to two core routes, one secondary first-buy and three later follow-ons', () => {
    expect(LIVE_MARKETING_PRODUCTS).toHaveLength(6)
    expect(RESERVED_MARKETING_PRODUCTS.map((product) => product.slug)).toEqual(['mto', 'customer-feedback'])
  })
})

describe('baseline-first pricing hierarchy', () => {
  it('anchors all first buys as baselines from EUR 4.500', () => {
    expect(pricingCards.map((card) => card.eyebrow)).toEqual([
      'ExitScan Baseline',
      'RetentieScan Baseline',
      'Onboarding 30-60-90 Baseline',
    ])
    expect(pricingCards.every((card) => card.price === 'vanaf EUR 4.500')).toBe(true)
    expect(pricingCards.every((card) => card.bullets.join(' | ') === 'Intake | Scan | Dashboard | Managementrapport')).toBe(true)
  })

  it('keeps Action Center Start as the only public optional expansion', () => {
    expect(pricingAddOns).toEqual([
      [
        'Action Center Start',
        'vanaf EUR 1.250',
        'Optionele uitbreiding voor een gekozen opvolgscope, een of enkele owners, beperkte actieopvolging, zichtbare status en een reviewmoment.',
      ],
    ])
  })

  it('keeps live, review cadence and bounded routes below the main pricing cards', () => {
    expect(pricingFollowOnRoutes.map((route) => route.title)).toEqual([
      'ExitScan Live Start',
      'Reviewcadans',
      'Pulse',
      'Leadership Scan',
      'Combinatie',
    ])
    expect(pricingFollowOnRoutes.every((route) => route.price === 'op aanvraag')).toBe(true)
  })

  it('keeps the pricing guide focused on the three first-buy routes', () => {
    expect(pricingChoiceGuide.map(([title]) => title)).toEqual([
      'ExitScan Baseline',
      'RetentieScan Baseline',
      'Onboarding 30-60-90 Baseline',
    ])
  })
})

describe('baseline-first routeflow copy', () => {
  it('keeps the aanpak flow at route choice, baseline, review and later rhythm', () => {
    expect(approachSteps.map((step) => step.title)).toEqual([
      '1. Juiste route kiezen',
      '2. Baseline uitvoeren',
      '3. Dashboard en managementrapport',
      '4. Review en eerste vervolgrichting',
      '5. Action Center Start optioneel',
      '6. Later ritme of herijking',
    ])
  })

  it('keeps included value compact and baseline-first', () => {
    expect(included).toEqual([
      'Intake en compacte baseline-opzet',
      'Scan en respondentflow waar relevant',
      'Dashboard en managementrapport',
      'Review van wat opvalt en wat eerst telt',
      'Privacy en interpretatie in gewone taal',
      'Optionele opvolging pas als de gekozen scope daarom vraagt',
      'Geen extra toolbeheer voor uw team',
    ])
  })

  it('keeps lifecycle and pricing ladders aligned to baseline first, then action center, then rhythm', () => {
    expect(customerLifecycleStages.map((stage) => stage.title)).toEqual([
      '1. Eerste routekeuze',
      '2. Baseline als vaste eerste stap',
      '3. Review opent de vervolgrichting',
      '4. Action Center Start optioneel',
      '5. Ritme of tweede route later',
    ])
    expect(pricingLifecycleLadder.every((route) => route.nextStep.includes('Action Center Start'))).toBe(true)
  })

  it('keeps pricing FAQ copy aligned to the new add-on and follow-on framing', () => {
    expect(pricingFaqs.some(([question]) => question === 'Is Action Center Start standaard onderdeel van elke baseline?')).toBe(true)
    expect(pricingFaqs.some(([question]) => question === 'Wanneer wordt ExitScan Live Start logisch?')).toBe(true)
    expect(pricingFaqs.some(([question]) => question === 'Waarom staat Reviewcadans niet tussen de hoofdkaarten?')).toBe(true)
  })
})
