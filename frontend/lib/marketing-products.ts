export type MarketingProductStatus = 'live' | 'coming_soon'

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
  href: string
}

export const LIVE_MARKETING_PRODUCTS: MarketingProduct[] = [
  {
    slug: 'exitscan',
    label: 'ExitScan',
    shortLabel: 'ExitScan',
    tagline: 'Begrijp waarom mensen zijn vertrokken',
    description:
      'Vertrekduiding op basis van terugkerende werkfactoren, vertrekredenen en managementrapportage.',
    seoTitle: 'ExitScan | Verisight',
    ogAlt: 'ExitScan productpagina van Verisight',
    serviceType: 'Vertrekduiding en managementrapportage',
    serviceAudience: 'HR-teams en directies die uitstroom achteraf willen duiden',
    serviceOutput: 'Frictiescore, vertrekduiding en prioritaire werkfactoren',
    status: 'live',
    href: '/producten/exitscan',
  },
  {
    slug: 'retentiescan',
    label: 'RetentieScan',
    shortLabel: 'RetentieScan',
    tagline: 'Zie eerder waar behoud onder druk staat',
    description:
      'Vroegsignalering op behoud, bevlogenheid, vertrekintentie en beïnvloedbare werkfactoren.',
    seoTitle: 'RetentieScan | Verisight',
    ogAlt: 'RetentieScan productpagina van Verisight',
    serviceType: 'Vroegsignalering op behoud en retentiesignalen',
    serviceAudience: 'HR-teams en directies die behoud eerder zichtbaar willen maken',
    serviceOutput: 'Retentiesignaal, bevlogenheid, vertrekintentie en topfactoren',
    status: 'live',
    href: '/producten/retentiescan',
  },
  {
    slug: 'combinatie',
    label: 'Combinatie',
    shortLabel: 'Combinatie',
    tagline: 'Kijk terug en vooruit in dezelfde managementtaal',
    description:
      'Combineer ExitScan en RetentieScan in één portfolio-aanpak voor terugkijkende duiding en vroegsignalering.',
    seoTitle: 'Combinatie | Verisight',
    ogAlt: 'Combinatiepagina van ExitScan en RetentieScan bij Verisight',
    serviceType: 'Portfolio-aanpak voor vertrekduiding en vroegsignalering',
    serviceAudience: 'HR-teams en directies met zowel uitstroom- als behoudsvragen',
    serviceOutput: 'Twee gerichte scans in één gedeelde managementstructuur',
    status: 'live',
    href: '/producten/combinatie',
  },
]

export const UPCOMING_MARKETING_PRODUCTS: MarketingProduct[] = [
  {
    slug: 'mto',
    label: 'Medewerkerstevredenheidsonderzoek',
    shortLabel: 'MTO',
    tagline: 'Brede tevredenheidsmeting voor je team',
    description:
      'Een bredere tevredenheidsmeting voor organisaties die meer algemeen willen luisteren naar medewerkers.',
    status: 'coming_soon',
    href: '/producten/mto',
  },
  {
    slug: 'pulse',
    label: 'Pulse',
    shortLabel: 'Pulse',
    tagline: 'Korte, frequente peilingen tussen teams',
    description: 'Korte metingen om sneller op ritme te luisteren tussen grotere meetmomenten door.',
    status: 'coming_soon',
    href: '/producten/pulse',
  },
  {
    slug: 'teamscan',
    label: 'Teamscan',
    shortLabel: 'Teamscan',
    tagline: 'Samenwerking en dynamiek per team meten',
    description: 'Gerichte teamscan voor samenwerking, rolverdeling en teamdynamiek.',
    status: 'coming_soon',
    href: '/producten/teamscan',
  },
  {
    slug: 'leadership-scan',
    label: 'Leadership Scan',
    shortLabel: 'Leadership Scan',
    tagline: 'Leiderschapsstijl en -effectiviteit in beeld',
    description: 'Gerichte scan voor leiderschapsgedrag en de impact daarvan op teams.',
    status: 'coming_soon',
    href: '/producten/leadership-scan',
  },
  {
    slug: 'customer-feedback',
    label: 'Customer Feedback',
    shortLabel: 'Customer Feedback',
    tagline: 'Klantfeedback structureel verzamelen',
    description:
      'Een toekomstige uitbreiding voor organisaties die dezelfde productfilosofie ook op klantfeedback willen toepassen.',
    status: 'coming_soon',
    href: '/producten/customer-feedback',
  },
]

export const ALL_MARKETING_PRODUCTS = [...LIVE_MARKETING_PRODUCTS, ...UPCOMING_MARKETING_PRODUCTS]

export function getMarketingProductBySlug(slug: string) {
  return ALL_MARKETING_PRODUCTS.find((product) => product.slug === slug) ?? null
}
