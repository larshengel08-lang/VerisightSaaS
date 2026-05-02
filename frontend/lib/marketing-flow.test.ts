import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
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
      label: 'Plan een kennismaking',
    })
    expect(marketingSecondaryCta).toEqual({
      href: '/#suite',
      label: 'Bekijk de suite',
    })
  })

  it('keeps the contact flow framed as a route-inschatting instead of a generic message send', () => {
    const contactFormSource = fs.readFileSync(path.join(process.cwd(), 'components', 'marketing', 'contact-form.tsx'), 'utf8')
    const solutionSource = fs.readFileSync(path.join(process.cwd(), 'lib', 'seo-solution-pages.ts'), 'utf8')

    expect(contactFormSource).toContain('Plan een eerste route-inschatting')
    expect(contactFormSource).toContain('Route-inschatting wordt verstuurd...')
    expect(contactFormSource).toContain('Route-inschatting aangevraagd.')
    expect(solutionSource).toContain('Plan een suite-demo over verloopanalyse')
    expect(solutionSource).toContain('Plan een suite-demo over medewerkersbehoud analyseren')
  })

  it('keeps the top navigation focused on products, process, pricing and trust', () => {
    expect(marketingNavLinks).toEqual([
      { href: '/producten', label: 'Producten' },
      { href: '/aanpak', label: 'Aanpak' },
      { href: '/tarieven', label: 'Tarieven' },
      { href: '/vertrouwen', label: 'Vertrouwen' },
    ])
  })

  it('keeps ExitScan as the first homepage route and RetentieScan as the complement', () => {
    expect(homepageProductRoutes.map((route) => route.name)).toEqual(['ExitScan', 'RetentieScan'])
    expect(homepageProductRoutes[0]?.chip).toBe('Kernroute')
    expect(homepageProductRoutes[1]?.chip).toBe('Kernroute')
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
    expect(getContactFirstStepLabel('onboarding')).toContain('bounded peer')
    expect(getContactFirstStepLabel('pulse')).toContain('na een eerste baseline')
    expect(getContactFirstStepLabel('leadership')).toContain('na een bestaand signaal')
  })

  it('keeps the contact route ordering core-first with onboarding as bounded peer and pulse plus leadership as follow-up', () => {
    expect(CONTACT_ROUTE_OPTIONS.map((option) => option.value)).toEqual([
      'exitscan',
      'retentiescan',
      'combinatie',
      'onboarding',
      'pulse',
      'leadership',
      'nog-onzeker',
    ])
    expect(CONTACT_ROUTE_OPTIONS.find((option) => option.value === 'onboarding')?.description.toLowerCase()).toContain(
      'nieuwe medewerkers',
    )
    expect(CONTACT_ROUTE_OPTIONS.find((option) => option.value === 'pulse')?.description.toLowerCase()).toContain(
      'na een eerste baseline',
    )
    expect(CONTACT_ROUTE_OPTIONS.find((option) => option.value === 'leadership')?.description.toLowerCase()).toContain(
      'na een bestaand people-signaal',
    )
  })

  it('keeps onboarding qualified as a bounded peer instead of reframing it as a gewone follow-up', () => {
    const onboardingGuidance = getContactQualificationGuidance({
      routeInterest: 'onboarding',
      desiredTiming: 'orienterend',
      currentQuestion: 'We willen onboarding beter organiseren voor nieuwe medewerkers.',
    })

    expect(onboardingGuidance.status).toBe('bounded_peer_review')
    expect(onboardingGuidance.recommendedCoreRoute).toBe('exitscan')
    expect(onboardingGuidance.followOnCandidateRoute).toBe('onboarding')
    expect(onboardingGuidance.headline.toLowerCase()).toContain('bounded peer')
  })
})
