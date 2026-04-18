export type MarketingProductStatus = 'live' | 'reserved_future'
export type MarketingProductPortfolioRole =
  | 'core_product'
  | 'portfolio_route'
  | 'follow_on_route'
  | 'future_reserved_route'

export interface MarketingProduct {
  slug: string
  label: string
  shortLabel: string
  tagline: string
  description: string
  seoTitle?: string
  ogAlt?: string
  serviceType?: string
  serviceAudience?: string
  serviceOutput?: string
  status: MarketingProductStatus
  portfolioRole: MarketingProductPortfolioRole
  href: string
}

export const CORE_MARKETING_PRODUCTS: MarketingProduct[] = [
  {
    slug: 'exitscan',
    label: 'ExitScan',
    shortLabel: 'ExitScan',
    tagline: 'Breng vertrekpatronen scherp in beeld',
    description:
      'Vertrekduiding en verloopanalyse op basis van terugkerende werkfactoren, vertrekredenen en signalen van werkfrictie voor HR, MT en directie, met compacte bestuurlijke handoff en expliciete leeswijzers over claims, privacy en interpretatie.',
    seoTitle: 'ExitScan | Verloopanalyse en vertrekduiding voor HR-teams',
    ogAlt: 'ExitScan productpagina van Verisight',
    serviceType: 'Vertrekduiding en managementrapportage',
    serviceAudience: 'HR-teams en directies die uitstroom achteraf willen duiden',
    serviceOutput:
      'Managementsamenvatting, bestuurlijke handoff, eerste managementsessie, vertrekduiding, signalen van werkfrictie, prioritaire werkfactoren en interpretatiekaders',
    status: 'live',
    portfolioRole: 'core_product',
    href: '/producten/exitscan',
  },
  {
    slug: 'retentiescan',
    label: 'RetentieScan',
    shortLabel: 'RetentieScan',
    tagline: 'Zie eerder waar behoud onder druk staat',
    description:
      'Vroegsignalering op medewerkersbehoud op groeps- en segmentniveau, met retentiesignaal, stay-intent, vertrekintentie en beinvloedbare werkfactoren in dezelfde managementlijn, inclusief compacte bestuurlijke handoff en zonder individuele voorspelling.',
    seoTitle: 'RetentieScan | Medewerkersbehoud en vroegsignalering voor HR-teams',
    ogAlt: 'RetentieScan productpagina van Verisight',
    serviceType: 'Vroegsignalering op behoud met retentiesignaal',
    serviceAudience: 'HR-teams en directies die behoud eerder zichtbaar willen maken',
    serviceOutput:
      'Managementsamenvatting, bestuurlijke handoff, eerste managementsessie, retentiesignaal, stay-intent, vertrekintentie, bevlogenheid, topfactoren en groepsgerichte leeswijzers voor verificatie, opvolging en reviewmoment',
    status: 'live',
    portfolioRole: 'core_product',
    href: '/producten/retentiescan',
  },
]

export const PORTFOLIO_ROUTE_MARKETING_PRODUCTS: MarketingProduct[] = [
  {
    slug: 'combinatie',
    label: 'Combinatie',
    shortLabel: 'Combinatie',
    tagline: 'Voeg een tweede route pas toe wanneer beide vragen echt spelen',
    description:
      'Buyer-facing portfolioroute voor organisaties die ExitScan en RetentieScan bewust naast elkaar willen organiseren, zonder daarvan een derde kernproduct, bundel of all-in pakket te maken.',
    seoTitle: 'Combinatie | Portfolioroute tussen ExitScan en RetentieScan',
    ogAlt: 'Combinatiepagina van ExitScan en RetentieScan bij Verisight',
    serviceType: 'Portfolioroute voor vertrekduiding en vroegsignalering',
    serviceAudience: 'HR-teams en directies met zowel uitstroom- als behoudsvragen',
    serviceOutput: 'Twee gerichte routes in een gedeelde managementstructuur',
    status: 'live',
    portfolioRole: 'portfolio_route',
    href: '/producten/combinatie',
  },
]

export const FOLLOW_ON_MARKETING_PRODUCTS: MarketingProduct[] = [
  {
    slug: 'pulse',
    label: 'Pulse',
    shortLabel: 'Pulse',
    tagline: 'Compacte reviewmetingen na diagnose of baseline',
    description:
      'Live bounded follow-on route voor kortere, frequente reviewmetingen nadat een eerste diagnose of baseline al staat. Bedoeld voor ritme, effectcheck en managementreview, niet als derde brede instap.',
    seoTitle: 'Pulse | Compacte reviewmetingen na diagnose of baseline',
    ogAlt: 'Pulse productpagina van Verisight',
    serviceType: 'Compacte reviewmeting na diagnose of baseline',
    serviceAudience: 'HR-teams en directies die na een eerste scan gericht willen blijven volgen',
    serviceOutput:
      'Compacte managementreview, ritmesignaal, delta-uitleg, bounded vervolgactie en expliciete reviewgrens',
    status: 'live',
    portfolioRole: 'follow_on_route',
    href: '/producten/pulse',
  },
  {
    slug: 'teamscan',
    label: 'TeamScan',
    shortLabel: 'TeamScan',
    tagline: 'Lokale verificatie na een breder signaal',
    description:
      'Live bounded follow-on route voor department-first lokalisatie nadat een breder signaal al zichtbaar is. Bedoeld voor lokale verificatie en prioriteit, niet voor manager ranking of brede teamsoftware.',
    seoTitle: 'TeamScan | Lokale verificatie na een breder signaal',
    ogAlt: 'TeamScan productpagina van Verisight',
    serviceType: 'Lokale verificatie en bounded teamprioritering',
    serviceAudience: 'HR-teams en directies die na een breder signaal lokale verificatie willen starten',
    serviceOutput:
      'Lokale prioriteitsread, bounded managementhandoff, formele reportoutput en suppressie-aware lokale duiding',
    status: 'live',
    portfolioRole: 'follow_on_route',
    href: '/producten/teamscan',
  },
  {
    slug: 'onboarding-30-60-90',
    label: 'Onboarding 30-60-90',
    shortLabel: 'Onboarding 30-60-90',
    tagline: 'Vroege lifecycle-check voor nieuwe medewerkers',
    description:
      'Live bounded follow-on route voor een assisted single-checkpoint onboardingread. Bedoeld om vroege landing en eerste frictie zichtbaar te maken, niet als journey-engine of brede lifecycle-suite.',
    seoTitle: 'Onboarding 30-60-90 | Vroege lifecycle-check voor nieuwe medewerkers',
    ogAlt: 'Onboarding 30-60-90 productpagina van Verisight',
    serviceType: 'Assisted single-checkpoint onboardingread',
    serviceAudience: 'HR-teams en directies die een vroege onboardingcheck buyer-facing willen openen',
    serviceOutput:
      'Checkpointsignaal, owner, eerste actie, managementhandoff en bounded formele output zonder brede journey-claims',
    status: 'live',
    portfolioRole: 'follow_on_route',
    href: '/producten/onboarding-30-60-90',
  },
  {
    slug: 'leadership-scan',
    label: 'Leadership Scan',
    shortLabel: 'Leadership Scan',
    tagline: 'Begrensde managementread na een bestaand signaal',
    description:
      'Live bounded follow-on route voor een group-level leadershipread nadat een bestaand people-signaal al zichtbaar is. Bedoeld voor managementcontext en eerste verificatie, niet voor named leaders, 360 of performanceframing.',
    seoTitle: 'Leadership Scan | Begrensde managementread na een bestaand signaal',
    ogAlt: 'Leadership Scan productpagina van Verisight',
    serviceType: 'Group-level leadershipread na een bestaand signaal',
    serviceAudience: 'HR-teams en directies die managementcontext bounded willen duiden',
    serviceOutput:
      'Geaggregeerde leadershipread, managementhandoff, bounded first action en formele output zonder named leader readouts',
    status: 'live',
    portfolioRole: 'follow_on_route',
    href: '/producten/leadership-scan',
  },
]

export const LIVE_MARKETING_PRODUCTS: MarketingProduct[] = [
  ...CORE_MARKETING_PRODUCTS,
  ...PORTFOLIO_ROUTE_MARKETING_PRODUCTS,
  ...FOLLOW_ON_MARKETING_PRODUCTS,
]

export const RESERVED_MARKETING_PRODUCTS: MarketingProduct[] = [
  {
    slug: 'mto',
    label: 'Medewerkerstevredenheidsonderzoek',
    shortLabel: 'MTO',
    tagline: 'Brede hoofdmeting op aanvraag',
    description:
      'Buyer-facing gated route op aanvraag voor organisaties die een bredere, organisatiebrede hoofdmeting assisted willen openen zonder de huidige kernportfolio direct te verschuiven.',
    status: 'reserved_future',
    portfolioRole: 'future_reserved_route',
    href: '/producten/mto',
  },
  {
    slug: 'customer-feedback',
    label: 'Customer Feedback',
    shortLabel: 'Customer Feedback',
    tagline: 'Klantfeedback structureel verzamelen',
    description:
      'Bewust nog niet actieve route voor klantfeedback, pas logisch nadat de huidige people-insight portfolio-architectuur stabiel genoeg is.',
    status: 'reserved_future',
    portfolioRole: 'future_reserved_route',
    href: '/producten/customer-feedback',
  },
]

export const UPCOMING_MARKETING_PRODUCTS = RESERVED_MARKETING_PRODUCTS
export const ALL_MARKETING_PRODUCTS = [...LIVE_MARKETING_PRODUCTS, ...RESERVED_MARKETING_PRODUCTS]

export function getMarketingProductBySlug(slug: string) {
  return ALL_MARKETING_PRODUCTS.find((product) => product.slug === slug) ?? null
}

export function isCoreMarketingProduct(product: MarketingProduct) {
  return product.portfolioRole === 'core_product'
}

export function isFollowOnMarketingProduct(product: MarketingProduct) {
  return product.portfolioRole === 'follow_on_route'
}
