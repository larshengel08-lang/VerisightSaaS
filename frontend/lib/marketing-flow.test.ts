import { readFileSync } from 'node:fs'
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
  homepageCoreProductRoutes,
  homepagePortfolioRoute,
  homepageProductRoutes,
  homepageUtilityLinks,
  included,
  marketingNavLinks,
  marketingPrimaryCta,
  marketingSecondaryCta,
} from '@/components/marketing/site-content'

describe('marketing flow defaults', () => {
  it('keeps early public RetentieScan site copy centered on Retentiesignaal instead of stay-intent', () => {
    const siteContentSource = readFileSync(
      new URL('../components/marketing/site-content.ts', import.meta.url),
      'utf8',
    )

    expect(siteContentSource).toContain('Retentiesignaal, aanvullende signalen, bevlogenheid en vertrekintentie op groepsniveau')
    expect(siteContentSource).toContain(
      'Retentiesignaal, aanvullende signalen, bevlogenheid en vertrekintentie in een managementrapport',
    )
    expect(siteContentSource).toContain('Trendbeeld op Retentiesignaal, bevlogenheid en aanvullende signalen')
    expect(siteContentSource).not.toContain('Retentiesignaal, stay-intent, bevlogenheid en vertrekintentie op groepsniveau')
    expect(siteContentSource).not.toContain('Retentiesignaal, stay-intent, bevlogenheid en vertrekintentie in een managementrapport')
    expect(siteContentSource).not.toContain('Trendbeeld op retentiesignaal, bevlogenheid en stay-intent')
  })

  it('keeps deeper public RetentieScan FAQ copy centered on Retentiesignaal with stay-intent only as secondary signal', () => {
    const siteContentSource = readFileSync(
      new URL('../components/marketing/site-content.ts', import.meta.url),
      'utf8',
    )

    expect(siteContentSource).toContain(
      "vroegsignalering op behoud via Retentiesignaal, aanvullende signalen zoals stay-intent en vertrekintentie, en beinvloedbare werkfactoren.",
    )
    expect(siteContentSource).toContain(
      "vroegsignalering op behoud op groeps- en segmentniveau rond Retentiesignaal, aanvullende signalen zoals stay-intent en vertrekintentie, en beinvloedbare werkfactoren.",
    )
    expect(siteContentSource).not.toContain(
      "vroegsignalering op behoud via retentiesignaal, stay-intent, vertrekintentie en beinvloedbare werkfactoren.",
    )
    expect(siteContentSource).not.toContain(
      "vroegsignalering op behoud op groeps- en segmentniveau rond retentiesignaal, stay-intent, vertrekintentie en beinvloedbare werkfactoren.",
    )
  })

  it('keeps deeper public ExitScan copy centered on Frictiescore with werkfrictie only as explanatory layer', () => {
    const siteContentSource = readFileSync(
      new URL('../components/marketing/site-content.ts', import.meta.url),
      'utf8',
    )

    expect(siteContentSource).toContain(
      'De standaard eerste instap voor organisaties die snel een Frictiescore, duidelijke prioriteiten en een professioneel managementrapport over uitstroom willen dat ook in sponsor-, prioriteits- en budgetgesprekken overeind blijft. Werkfrictie blijft daarin de verklarende laag onder het vertrekbeeld.',
    )
    expect(siteContentSource).toContain(
      'Je wilt vertrek achteraf duiden en zoekt meestal het eerste betaalde traject dat Frictiescore en terugkerende werkfrictie bestuurlijk leesbaar maakt.',
    )
    expect(siteContentSource).toContain(
      'ExitScan helpt vertrek achteraf duiden via Frictiescore als eerste managementsamenvatting, met terugkerende werkfactoren, vertrekredenen en werkfrictie als verklarende laag.',
    )
    expect(siteContentSource).toContain(
      'Welke Frictiescore en werkfactoren keren terug in uitstroom?',
    )
    expect(siteContentSource).not.toContain(
      'De standaard eerste instap voor organisaties die snel een betrouwbaar organisatiebeeld, duidelijke prioriteiten en een professioneel managementrapport over uitstroom willen dat ook in sponsor-, prioriteits- en budgetgesprekken overeind blijft.',
    )
    expect(siteContentSource).not.toContain(
      'Je wilt vertrek achteraf duiden en zoekt meestal het eerste betaalde traject dat losse exitinput bestuurlijk leesbaar maakt.',
    )
    expect(siteContentSource).not.toContain(
      'ExitScan helpt vertrek achteraf duiden op basis van terugkerende werkfactoren, vertrekredenen en signalen van werkfrictie.',
    )
    expect(siteContentSource).not.toContain('Welk vertrekbeeld keert terug en welke werkfactoren wegen daarin mee?')
  })

  it('keeps public trust and privacy copy centered on Frictiescore and Retentiesignaal', () => {
    const siteContentSource = readFileSync(
      new URL('../components/marketing/site-content.ts', import.meta.url),
      'utf8',
    )

    expect(siteContentSource).toContain(
      'ExitScan wordt buyer-facing uitgelegd via Frictiescore en RetentieScan via Retentiesignaal, steeds als managementinstrumenten met heldere claimsgrenzen en niet als diagnose of black-box voorspeller.',
    )
    expect(siteContentSource).toContain(
      'Bij ExitScan ziet management Frictiescore, werkfactoren en bestuurlijke handoff op groepsniveau. Bij RetentieScan ziet management Retentiesignaal, aanvullende signalen, topfactoren en prioriteiten op groeps- en segmentniveau.',
    )
    expect(siteContentSource).toContain(
      'Management ziet groeps- en segmentinzichten, geen individuele signalen. ExitScan opent via Frictiescore met werkfrictie als verklarende laag; RetentieScan via Retentiesignaal met aanvullende signalen op groepsniveau. Individuele vertrekintentie en persoonsgerichte actieroutes blijven buiten beeld.',
    )
    expect(siteContentSource).toContain(
      'Lees ExitScan via Frictiescore en RetentieScan via Retentiesignaal. Werkfrictie en aanvullende signalen helpen daarna bij verificatie en prioritering, niet bij causaliteitsclaims of harde diagnoses.',
    )
    expect(siteContentSource).not.toContain(
      'ExitScan en RetentieScan worden buyer-facing uitgelegd als managementinstrumenten met heldere claimsgrenzen, niet als diagnose of black-box voorspeller.',
    )
    expect(siteContentSource).not.toContain(
      'Geaggregeerde bestuurlijke read, bestuurlijke handoff, topfactoren, hypotheses, prioriteiten en opvolgsporen in een vaste executive leeslijn.',
    )
    expect(siteContentSource).not.toContain(
      'Verisight gebruikt signalen, hypotheses en bestuurlijke reads als gespreksinput. De output ondersteunt verificatie en prioritering, niet causaliteitsclaims of harde diagnoses.',
    )
  })

  it('keeps public contractual copy neutral without falling back to secondary product anchors', () => {
    const termsSource = readFileSync(
      new URL('../app/voorwaarden/page.tsx', import.meta.url),
      'utf8',
    )

    expect(termsSource).toContain('ExitScan en RetentieScan')
    expect(termsSource).toContain('RetentieScan mag niet worden gebruikt als individueel beoordelings-, performance- of beslisinstrument op persoonsniveau.')
    expect(termsSource).not.toContain('stay-intent')
    expect(termsSource).not.toContain('werkfrictie')
    expect(termsSource).not.toContain('Vertreksignaal')
    expect(termsSource).not.toContain('vertrekbeeld')
    expect(termsSource).not.toContain('werksignaal')
  })

  it('keeps shared proof and preview copy centered on Frictiescore and Retentiesignaal', () => {
    expect(REPORT_PREVIEW_COPY.portfolio.hypotheses[1]?.question).toContain('Frictiescore')
    expect(REPORT_PREVIEW_COPY.portfolio.hypotheses[1]?.question).toContain('Retentiesignaal')

    expect(REPORT_PREVIEW_COPY.exit.boardroomPoints[1]?.[1]).toContain('Frictiescore')
    expect(REPORT_PREVIEW_COPY.exit.boardroomPoints[1]?.[1]).not.toContain('werksignaal')

    expect(REPORT_PREVIEW_COPY.retention.proofNotes[2]?.[1]).toContain('Retentiesignaal')
    expect(REPORT_PREVIEW_COPY.retention.proofNotes[2]?.[1]).toContain('aanvullende signalen zoals stay-intent')
    expect(REPORT_PREVIEW_COPY.retention.trustPoints[1]?.[1]).toContain('Retentiesignaal')
    expect(REPORT_PREVIEW_COPY.retention.trustPoints[1]?.[1]).toContain('aanvullende signalen zoals stay-intent')
    expect(REPORT_PREVIEW_COPY.retention.trustPoints[1]?.[1]).not.toContain(
      'Retentiesignaal, stay-intent, vertrekintentie, bevlogenheid en topfactoren in een bestuurslaag.',
    )
  })

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

  it('keeps the homepage route choice core-first and treats the combination as a secondary portfolio note', () => {
    expect(homepageProductRoutes.map((route) => route.name)).toEqual(['ExitScan', 'RetentieScan', 'Combinatie'])
    expect(homepageCoreProductRoutes.map((route) => route.name)).toEqual(['ExitScan', 'RetentieScan'])
    expect(homepageCoreProductRoutes[0]?.chip).toBe('Kernroute')
    expect(homepageCoreProductRoutes[1]?.chip).toBe('Kernroute')
    expect(homepagePortfolioRoute.name).toBe('Combinatie')
    expect(homepagePortfolioRoute.label).toBe('Portfolioroute op aanvraag')
    expect(homepagePortfolioRoute.body.toLowerCase()).toContain('nadat de eerste route helder staat')
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
    expect(getContactFirstStepLabel('onboarding')).toContain('peer-route')
    expect(getContactFirstStepLabel('combinatie')).toBe('een gefaseerde combinatieroute')
    expect(getContactFirstStepLabel('leadership')).toContain('na een bestaand signaal')
  })

  it('keeps the contact route ordering heavy first-buy routes first, onboarding as peer exception, and bounded follow-on later', () => {
    expect(CONTACT_ROUTE_OPTIONS.map((option) => option.value)).toEqual([
      'exitscan',
      'retentiescan',
      'onboarding',
      'combinatie',
      'leadership',
      'nog-onzeker',
    ])
    expect(CONTACT_ROUTE_OPTIONS.find((option) => option.value === 'onboarding')?.description.toLowerCase()).toContain(
      'nieuwe medewerkers',
    )
    expect(CONTACT_ROUTE_OPTIONS.find((option) => option.value === 'leadership')?.description.toLowerCase()).toContain(
      'na een bestaand people-signaal',
    )
  })

  it('keeps onboarding visible as a bounded peer exception instead of reframing it to ExitScan', () => {
    const onboardingGuidance = getContactQualificationGuidance({
      routeInterest: 'onboarding',
      desiredTiming: 'orienterend',
      currentQuestion: 'We willen onboarding beter organiseren voor nieuwe medewerkers.',
    })

    expect(onboardingGuidance.status).toBe('onboarding_peer_primary')
    expect(onboardingGuidance.recommendedRoute).toBe('onboarding')
    expect(onboardingGuidance.followOnCandidateRoute).toBeNull()
  })
})
