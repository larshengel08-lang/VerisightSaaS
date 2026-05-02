export type MarketingProductStatus = 'core_live' | 'portfolio_live' | 'bounded_live' | 'reserved_future'
export type MarketingProductPortfolioRole =
  | 'core_product'
  | 'portfolio_route'
  | 'bounded_peer_route'
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
    tagline: 'Begrijp waarom medewerkers vertrekken en waar actie het eerst telt',
    description:
      'Voor organisaties die vertrek niet alleen willen registreren, maar scherp willen begrijpen waar patronen terugkomen en waar actie het eerst effect heeft.',
    seoTitle: 'ExitScan | Verloopanalyse en vertrekduiding voor HR-teams',
    ogAlt: 'ExitScan productpagina van Verisight',
    serviceType: 'Vertrekduiding en managementrapportage',
    serviceAudience: 'HR-teams en directies die uitstroom achteraf willen duiden',
    serviceOutput:
      'Cover, responslaag, bestuurlijke handoff, eerste managementsessie, vertrekduiding, signalen van werkfrictie, prioritaire werkfactoren en interpretatiekaders',
    status: 'core_live',
    portfolioRole: 'core_product',
    href: '/producten/exitscan',
  },
  {
    slug: 'retentiescan',
    label: 'RetentieScan',
    shortLabel: 'RetentieScan',
    tagline: 'Zie eerder waar behoud onder druk komt te staan en wat nu aandacht vraagt',
    description:
      'Voor organisaties die behoudsdruk eerder willen zien, voordat verloop zichtbaar oploopt en het gesprek te laat begint.',
    seoTitle: 'RetentieScan | Medewerkersbehoud en vroegsignalering voor HR-teams',
    ogAlt: 'RetentieScan productpagina van Verisight',
    serviceType: 'Vroegsignalering op behoud met retentiesignaal',
    serviceAudience: 'HR-teams en directies die behoud eerder zichtbaar willen maken',
    serviceOutput:
      'Cover, compacte bestuurlijke read, retentiesignaal, stay-intent, vertrekintentie, bevlogenheid, topfactoren en groepsgerichte leeswijzers voor verificatie, opvolging en reviewmoment',
    status: 'core_live',
    portfolioRole: 'core_product',
    href: '/producten/retentiescan',
  },
]

export const PORTFOLIO_ROUTE_MARKETING_PRODUCTS: MarketingProduct[] = [
]

export const BOUNDED_PEER_MARKETING_PRODUCTS: MarketingProduct[] = [
  {
    slug: 'onboarding-30-60-90',
    label: 'Onboarding 30-60-90',
    shortLabel: 'Onboarding 30-60-90',
    tagline: 'Vroege lifecycle-check voor nieuwe medewerkers',
    description:
      'Bounded peer-route voor een assisted single-checkpoint onboardingread. Bedoeld om vroege landing en eerste frictie zichtbaar te maken, zonder daarvan een derde hoofdproduct of brede lifecycle-suite te maken.',
    seoTitle: 'Onboarding 30-60-90 | Vroege lifecycle-check voor nieuwe medewerkers',
    ogAlt: 'Onboarding 30-60-90 productpagina van Verisight',
    serviceType: 'Assisted single-checkpoint onboardingread',
    serviceAudience: 'HR-teams en directies die een vroege onboardingcheck buyer-facing willen openen',
    serviceOutput:
      'Checkpointsignaal, owner, eerste actie en bounded managementhandoff zonder brede journey-claims',
    status: 'bounded_live',
    portfolioRole: 'bounded_peer_route',
    href: '/producten/onboarding-30-60-90',
  },
]

export const FOLLOW_ON_MARKETING_PRODUCTS: MarketingProduct[] = [
  {
    slug: 'combinatie',
    label: 'Combinatie',
    shortLabel: 'Combinatie',
    tagline: 'Gedeelde vervolglijn voor vertrekduiding en behoudsvraag',
    description:
      'Bounded vervolgroute voor organisaties waar vertrekduiding en behoudsvraag tegelijk bestuurlijk spelen. Bedoeld als gefaseerde combinatie van ExitScan en RetentieScan, niet als derde eerste instap.',
    seoTitle: 'Combinatie | Gefaseerde vervolglijn voor ExitScan en RetentieScan',
    ogAlt: 'Combinatie productpagina van Verisight',
    serviceType: 'Gefaseerde vervolglijn voor vertrekduiding en behoudsvraag',
    serviceAudience: 'HR-teams en directies die vertrekduiding en behoudsvraag bewust in één lijn willen verbinden',
    serviceOutput:
      'Gefaseerde routekeuze, gedeelde managementlijn en bestuurlijke volgorde voor twee samenhangende kernvragen',
    status: 'bounded_live',
    portfolioRole: 'follow_on_route',
    href: '/producten/combinatie',
  },
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
      'Compacte managementreview, ritmesignaal, begrensde vergelijkingsduiding en een expliciet hercheckmoment',
    status: 'bounded_live',
    portfolioRole: 'follow_on_route',
    href: '/producten/pulse',
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
  ...BOUNDED_PEER_MARKETING_PRODUCTS,
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

export function isBoundedPeerMarketingProduct(product: MarketingProduct) {
  return product.portfolioRole === 'bounded_peer_route'
}
