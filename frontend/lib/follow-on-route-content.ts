import type { ContactRouteInterest } from '@/lib/contact-funnel'
import { getMarketingProductBySlug } from '@/lib/marketing-products'

export type FollowOnRouteSlug =
  | 'leadership-scan'
  | 'pulse'
  | 'combinatie'

export interface FollowOnRouteContent {
  slug: FollowOnRouteSlug
  title: string
  rowSummary: string
  positioning: string
  whenLogical: readonly [string, string, string]
  whatYouGet: readonly [string, string, string]
  whyLater: string
  detailHref: string
  routeInterest: ContactRouteInterest
  ctaSource: string
  heroTitle: string
  heroBody: string
  receiveIntro: string
  ctaBody: string
  relatedRouteHref: string
  relatedRouteLabel: string
}

function resolveProduct(slug: FollowOnRouteSlug) {
  const product = getMarketingProductBySlug(slug)
  if (!product) {
    throw new Error(`Marketingproduct voor bounded route "${slug}" ontbreekt.`)
  }
  return product
}

const leadershipProduct = resolveProduct('leadership-scan')
const pulseProduct = resolveProduct('pulse')
const combinationProduct = resolveProduct('combinatie')

export const FOLLOW_ON_ROUTE_CONTENT: readonly FollowOnRouteContent[] = [
  {
    slug: 'leadership-scan',
    title: leadershipProduct.label,
    rowSummary: 'Wanneer signalen vooral vragen oproepen over aansturing of leiding.',
    positioning:
      'Leadership Scan helpt gericht kijken naar aansturing, verwachtingen en leidinggevende context wanneer een eerdere baseline laat zien dat daar de vervolgvraag ligt.',
    whenLogical: [
      'Er ligt al een eerste baseline of managementread.',
      'De vervolgvraag gaat vooral over aansturing, verwachtingen of leidinggevende context.',
      'De scope blijft groepsgericht en wordt geen brede leiderschaps- of cultuurdiagnose.',
    ],
    whatYouGet: [
      'Een begrensde managementread rond leiderschapscontext en wat daarin nu opvalt.',
      'Patroonduiding die helpt verklaren waar managementcontext het bestaande signaal versterkt of dempt.',
      'Eerste gesprekspunten, eigenaar en vervolgrichting voor management en HR.',
    ],
    whyLater:
      'Dit is geen eerste kernroute, maar een gerichte verdieping zodra leiderschapscontext echt centraal komt te staan.',
    detailHref: leadershipProduct.href,
    routeInterest: 'leadership',
    ctaSource: 'products_follow_on_leadership',
    heroTitle: 'Gebruik Leadership Scan wanneer managementcontext zelf de volgende vraag wordt.',
    heroBody:
      'Deze route opent pas nadat een eerste people-read al richting heeft gegeven. Ze helpt om aansturing, leidingomgeving en managementcontext gerichter te duiden zonder brede leiderschapsclaims.',
    receiveIntro:
      'U ontvangt een gerichte managementread die laat zien waar managementcontext nu eerst duiding of gesprek vraagt.',
    ctaBody:
      'Beschrijf kort welk bestaand signaal nu doorloopt naar managementcontext. Dan toetsen we of Leadership Scan de volgende logische route is.',
    relatedRouteHref: '/producten/retentiescan',
    relatedRouteLabel: 'Bekijk RetentieScan',
  },
  {
    slug: 'pulse',
    title: pulseProduct.label,
    rowSummary: 'Voor een compacte hercheck nadat de eerste vraag scherp is.',
    positioning:
      'Pulse is bedoeld om een gekozen aandachtspunt compact te blijven volgen, zonder opnieuw een brede baseline te starten.',
    whenLogical: [
      'Er is al een baseline of managementread.',
      'U wilt één gekozen aandachtspunt volgen.',
      'Een compacte hercheck is logischer dan opnieuw breed meten.',
    ],
    whatYouGet: [
      'Een korte vervolgmeting met compacte managementread.',
      'Snelle terugkoppeling op wat beweegt sinds de vorige read.',
      'Een helder volgend checkmoment, eigenaar en beperkte vervolgstap.',
    ],
    whyLater: 'Pulse is een vervolgroute en geen eerste instap.',
    detailHref: pulseProduct.href,
    routeInterest: 'nog-onzeker',
    ctaSource: 'products_follow_on_pulse',
    heroTitle: 'Gebruik Pulse wanneer een eerste beeld al staat en u compact wilt volgen wat nu verschuift.',
    heroBody:
      'Deze route opent pas nadat een eerste baseline of managementread al taal heeft gegeven. Ze helpt om een korte hercheck te doen zonder opnieuw breed te openen.',
    receiveIntro:
      'U ontvangt een compacte vervolgread die laat zien wat sinds de vorige meting beweegt en waar een volgende hercheck logisch is.',
    ctaBody:
      'Beschrijf kort welk eerste beeld er al ligt en welke hercheck nu nodig lijkt. Dan toetsen we of Pulse de volgende logische route is.',
    relatedRouteHref: '/producten/retentiescan',
    relatedRouteLabel: 'Bekijk RetentieScan',
  },
  {
    slug: 'combinatie',
    title: combinationProduct.label,
    rowSummary: 'Wanneer vertrek en behoud tegelijk aandacht vragen.',
    positioning:
      'Combinatie is alleen logisch wanneer vertrek én behoud tegelijk belangrijk zijn en niet goed in één losse route te vangen zijn.',
    whenLogical: [
      'ExitScan of RetentieScan heeft de eerste vraag al scherp gemaakt.',
      'Vertrek en behoud vragen tegelijk om aandacht.',
      'De vervolgstap vraagt om een gefaseerde combinatie, niet om een bundelverkoop.',
    ],
    whatYouGet: [
      'Een gefaseerde routekeuze over twee samenhangende managementvragen.',
      'Een gedeelde managementlijn voor prioriteiten, bespreking en vervolgstappen.',
      'Een duidelijke volgorde waarin beide kernroutes bestuurlijk samenkomen.',
    ],
    whyLater:
      'Meestal start u scherper met ExitScan of RetentieScan; combinatie wordt pas logisch zodra beide vragen echt tegelijk spelen.',
    detailHref: combinationProduct.href,
    routeInterest: 'combinatie',
    ctaSource: 'products_follow_on_combination',
    heroTitle: 'Gebruik Combinatie wanneer vertrekduiding en behoudsvraag tegelijk bestuurlijk spelen.',
    heroBody:
      'Deze route opent pas nadat minstens een eerste kernroute scherp staat. Ze helpt om ExitScan en RetentieScan bewust in een gedeelde managementlijn te verbinden zonder van combinatie een derde kernproduct te maken.',
    receiveIntro:
      'U ontvangt een gefaseerde portfolioroute die twee samenhangende vragen in een bestuurlijke leeslijn bij elkaar brengt.',
    ctaBody:
      'Beschrijf kort of vertrekduiding en behoudsvraag nu echt tegelijk spelen. Dan toetsen we of Combinatie de volgende logische route is.',
    relatedRouteHref: '/producten/exitscan',
    relatedRouteLabel: 'Bekijk ExitScan',
  },
] as const

const followOnRouteMap = new Map(FOLLOW_ON_ROUTE_CONTENT.map((route) => [route.slug, route]))

export function getFollowOnRouteContent(slug: string) {
  return followOnRouteMap.get(slug as FollowOnRouteSlug) ?? null
}
