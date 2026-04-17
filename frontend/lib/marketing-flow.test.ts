import { describe, expect, it } from 'vitest'
import { REPORT_PREVIEW_COPY } from '@/lib/report-preview-copy'
import {
  buildContactHref,
  CONTACT_ROUTE_OPTIONS,
  getContactQualificationGuidance,
  getContactFirstStepLabel,
  getContactRouteLabel,
} from '@/lib/contact-funnel'
import { getBuyerFacingShowcaseAssets } from '@/lib/sample-showcase-assets'
import {
  approachSteps,
  homepageProductRoutes,
  homepageUtilityLinks,
  included,
  marketingNavLinks,
  marketingPrimaryCta,
  marketingSecondaryCta,
} from '@/components/marketing/site-content'

describe('marketing flow defaults', () => {
  it('keeps the primary and secondary CTA labels aligned with the redesign', () => {
    expect(marketingPrimaryCta).toEqual({
      href: buildContactHref({ routeInterest: 'exitscan', ctaSource: 'global_primary_cta' }),
      label: 'Plan kennismaking',
    })
    expect(marketingSecondaryCta).toEqual({
      href: '/producten',
      label: 'Bekijk de routes',
    })
  })

  it('keeps the top navigation focused on products, process, pricing and trust', () => {
    expect(marketingNavLinks).toEqual([
      { href: '/', label: 'Home' },
      { href: '/producten', label: 'Producten' },
      { href: '/aanpak', label: 'Aanpak' },
      { href: '/tarieven', label: 'Tarieven' },
      { href: '/vertrouwen', label: 'Vertrouwen' },
    ])
  })

  it('keeps ExitScan as the first homepage route and RetentieScan as the complement', () => {
    expect(homepageProductRoutes.map((route) => route.name)).toEqual(['ExitScan', 'RetentieScan', 'Combinatie'])
    expect(homepageProductRoutes[0]?.chip).toBe('Primaire route')
    expect(homepageProductRoutes[1]?.chip).toBe('Complementair')
    expect(homepageProductRoutes[2]?.body.toLowerCase()).toContain('nadat de eerste helder staat')
  })

  it('keeps homepage utility links aligned with buyer flow and due diligence', () => {
    expect(homepageUtilityLinks.map((link) => link.href)).toEqual([
      '/producten',
      '/aanpak',
      '/tarieven',
      '/vertrouwen',
    ])
  })

  it('keeps the approach flow explicit about assisted onboarding and first use', () => {
    expect(included).toContain('Assisted onboarding van akkoord tot eerste managementread')
    expect(approachSteps.find((step) => step.title === '5. Dashboard en rapport')?.body.toLowerCase()).toContain('indicatief')
    expect(approachSteps.find((step) => step.title === '4. Eerste responses')?.body.toLowerCase()).toContain('klantactivatie')
  })

  it('keeps preview copy and buyer-facing showcase assets linked to the same proof paths', () => {
    const assetHrefs = getBuyerFacingShowcaseAssets().map((asset) => asset.publicHref)

    expect(assetHrefs).toContain(REPORT_PREVIEW_COPY.exit.sampleReportHref)
    expect(assetHrefs).toContain(REPORT_PREVIEW_COPY.retention.sampleReportHref)
    expect(REPORT_PREVIEW_COPY.portfolio.sampleReportHref).toBe('/producten')
  })

  it('keeps route labels and first-step defaults aligned with the funnel', () => {
    expect(getContactRouteLabel('exitscan')).toBe('ExitScan')
    expect(getContactRouteLabel('retentiescan')).toBe('RetentieScan')
    expect(getContactFirstStepLabel('combinatie')).toBe('een gefaseerde combinatieroute')
    expect(getContactFirstStepLabel('teamscan')).toContain('na een bestaand signaal')
    expect(getContactFirstStepLabel('leadership')).toContain('na een bestaand signaal')
  })

  it('keeps the contact route ordering core-first before bounded follow-on routes', () => {
    expect(CONTACT_ROUTE_OPTIONS.map((option) => option.value)).toEqual([
      'exitscan',
      'retentiescan',
      'combinatie',
      'teamscan',
      'onboarding',
      'leadership',
      'nog-onzeker',
    ])
    expect(CONTACT_ROUTE_OPTIONS.find((option) => option.value === 'teamscan')?.description.toLowerCase()).toContain(
      'na een breder signaal',
    )
    expect(CONTACT_ROUTE_OPTIONS.find((option) => option.value === 'leadership')?.description.toLowerCase()).toContain(
      'na een bestaand people-signaal',
    )
  })

  it('keeps qualification defaults core-first even when follow-on routes are visible in the funnel', () => {
    const onboardingGuidance = getContactQualificationGuidance({
      routeInterest: 'onboarding',
      desiredTiming: 'orienterend',
      currentQuestion: 'We willen onboarding beter organiseren voor nieuwe medewerkers.',
    })

    expect(onboardingGuidance.status).toBe('follow_on_reframe')
    expect(onboardingGuidance.recommendedCoreRoute).toBe('exitscan')
    expect(onboardingGuidance.followOnCandidateRoute).toBe('onboarding')
  })
})
