export type MarketingProductStatus = 'core_live' | 'portfolio_live' | 'bounded_live' | 'reserved_future'
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
    tagline: 'Breng vertrekduiding scherp in beeld',
    description:
      'Vertrekduiding en verloopanalyse via Frictiescore, met terugkerende werkfactoren, vertrekredenen en werkfrictie als verklarende laag voor HR, MT en directie, plus compacte bestuurlijke handoff en expliciete leeswijzers over claims, privacy en interpretatie.',
    seoTitle: 'ExitScan | Verloopanalyse en vertrekduiding voor HR-teams',
    ogAlt: 'ExitScan productpagina van Verisight',
    serviceType: 'Vertrekduiding en managementrapportage',
    serviceAudience: 'HR-teams en directies die uitstroom achteraf willen duiden',
    serviceOutput:
      'Cover, responslaag, bestuurlijke handoff, eerste managementsessie, Frictiescore, werkfrictie als verklarende laag, prioritaire werkfactoren en interpretatiekaders',
    status: 'core_live',
    portfolioRole: 'core_product',
    href: '/producten/exitscan',
  },
  {
    slug: 'retentiescan',
    label: 'RetentieScan',
    shortLabel: 'RetentieScan',
    tagline: 'Zie eerder waar behoud onder druk staat',
    description:
      'Vroegsignalering op medewerkersbehoud op groeps- en segmentniveau, met Retentiesignaal, aanvullende signalen zoals stay-intent en vertrekintentie, en beinvloedbare werkfactoren in dezelfde managementlijn, inclusief compacte bestuurlijke handoff en zonder individuele voorspelling.',
    seoTitle: 'RetentieScan | Medewerkersbehoud en vroegsignalering voor HR-teams',
    ogAlt: 'RetentieScan productpagina van Verisight',
    serviceType: 'Vroegsignalering op behoud met Retentiesignaal',
    serviceAudience: 'HR-teams en directies die behoud eerder zichtbaar willen maken',
    serviceOutput:
      'Cover, compacte bestuurlijke read, Retentiesignaal, aanvullende signalen zoals stay-intent en vertrekintentie, bevlogenheid, topfactoren en groepsgerichte leeswijzers voor verificatie, opvolging en reviewmoment',
    status: 'core_live',
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
    status: 'portfolio_live',
    portfolioRole: 'portfolio_route',
    href: '/producten/combinatie',
  },
]

export const FOLLOW_ON_MARKETING_PRODUCTS: MarketingProduct[] = [
  {
    slug: 'pulse',
    label: 'Pulse',
    shortLabel: 'Pulse',
    tagline: 'Compacte reviewmetingen na eerste baseline of managementread',
    description:
      'Bounded vervolgroute voor kortere reviewmetingen nadat een eerste baseline, managementread of eerste actie al staat. Bedoeld voor ritme, effectcheck en managementreview, niet als derde brede instap.',
    seoTitle: 'Pulse | Compacte reviewmetingen na eerste baseline of managementread',
    ogAlt: 'Pulse productpagina van Verisight',
    serviceType: 'Compacte reviewmeting na eerste baseline of managementread',
    serviceAudience: 'HR-teams en directies die na een eerste scan gericht willen blijven volgen',
    serviceOutput:
      'Compacte managementreview, ritmesignaal, begrensde vergelijkingsduiding, bounded vervolgactie en expliciete reviewgrens',
    status: 'bounded_live',
    portfolioRole: 'follow_on_route',
    href: '/producten/pulse',
  },
  {
    slug: 'teamscan',
    label: 'TeamScan',
    shortLabel: 'TeamScan',
    tagline: 'Lokale verificatie na een breder signaal',
    description:
      'Bounded vervolgroute voor department-first lokalisatie nadat een breder signaal al zichtbaar is. Bedoeld voor lokale verificatie en prioriteit, niet voor manager ranking of brede teamsoftware.',
    seoTitle: 'TeamScan | Lokale verificatie na een breder signaal',
    ogAlt: 'TeamScan productpagina van Verisight',
    serviceType: 'Lokale verificatie en bounded teamprioritering',
    serviceAudience: 'HR-teams en directies die na een breder signaal lokale verificatie willen starten',
    serviceOutput:
      'Lokale prioriteitsread, bounded managementhandoff en suppressie-aware lokale duiding',
    status: 'bounded_live',
    portfolioRole: 'follow_on_route',
    href: '/producten/teamscan',
  },
  {
    slug: 'onboarding-30-60-90',
    label: 'Onboarding 30-60-90',
    shortLabel: 'Onboarding 30-60-90',
    tagline: 'Vroege landingsduiding voor nieuwe medewerkers',
    description:
      'Peer-grade onboardingroute voor een bounded single-checkpoint managementread in de eerste 30-60-90 dagen. Bedoeld om vroege landing, eerste frictie, owner, eerste stap en reviewgrens zichtbaar te maken, zonder journey-engine, automation-claim of brede lifecycle-suite.',
    seoTitle: 'Onboarding 30-60-90 | Vroege lifecycle-check voor nieuwe medewerkers',
    ogAlt: 'Onboarding 30-60-90 productpagina van Verisight',
    serviceType: 'Bounded lifecycle-read voor vroege landing en eerste managementinterventie',
    serviceAudience: 'HR-teams en directies die een first-90-days managementvraag expliciet willen openen',
    serviceOutput:
      'Managementsamenvatting, bestuurlijke handoff, Onboardingsignaal, eerste werkspoor, owner, eerste stap en bounded reviewgrens zonder brede journey-claims',
    status: 'bounded_live',
    portfolioRole: 'follow_on_route',
    href: '/producten/onboarding-30-60-90',
  },
  {
    slug: 'leadership-scan',
    label: 'Leadership Scan',
    shortLabel: 'Leadership Scan',
    tagline: 'Begrensde managementread na een bestaand signaal',
    description:
      'Bounded vervolgroute voor een group-level leadershipread nadat een bestaand people-signaal al zichtbaar is. Bedoeld voor managementcontext en eerste verificatie, niet voor named leaders, 360 of performanceframing.',
    seoTitle: 'Leadership Scan | Begrensde managementread na een bestaand signaal',
    ogAlt: 'Leadership Scan productpagina van Verisight',
    serviceType: 'Group-level leadershipread na een bestaand signaal',
    serviceAudience: 'HR-teams en directies die managementcontext bounded willen duiden',
    serviceOutput:
      'Geaggregeerde leadershipread, managementhandoff en bounded first action zonder named leader readouts',
    status: 'bounded_live',
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
    tagline: 'Brede tevredenheidsmeting voor je team',
    description:
      'Bewust nog niet actieve route voor organisaties die later een bredere tevredenheidsmeting willen toetsen zonder de huidige kernportfolio te verbreden.',
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

export function isActiveMarketingProduct(product: MarketingProduct) {
  return product.status !== 'reserved_future'
}

export function isCoreMarketingProduct(product: MarketingProduct) {
  return product.portfolioRole === 'core_product'
}

export function isFollowOnMarketingProduct(product: MarketingProduct) {
  return product.portfolioRole === 'follow_on_route'
}
