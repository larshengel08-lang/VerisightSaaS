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
    rowSummary: 'Als managementcontext de volgende echte vraag wordt.',
    positioning:
      'Leadership Scan is een gerichte managementroute die pas logisch wordt wanneer bestaande signalen vragen oproepen over aansturing, leiderschap of managementcontext.',
    whenLogical: [
      'Er al een eerste people-read staat en de volgende vraag verschuift naar managementcontext.',
      'Bestaande signalen vragen om duiding rond aansturing, verwachtingen of leidingomgeving.',
      'De volgende stap gaat over managementcontext op groepsniveau, niet om een brede cultuur- of leiderschapsbelofte.',
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
    rowSummary: 'Compacte vervolgroute nadat een eerste baseline of managementread al staat.',
    positioning:
      'Pulse is een compacte herhaalroute die pas logisch wordt nadat al een eerste baseline, managementread of vervolgstap is bepaald.',
    whenLogical: [
      'Er al een eerste baseline of managementread staat die u gericht wilt opvolgen.',
      'Compact volgen belangrijker is dan opnieuw breed duiden.',
      'De volgende vraag gaat over beweging en hercheck, niet over een nieuwe eerste people-read.',
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
    rowSummary: 'Alleen logisch wanneer vertrek en behoud tegelijk bestuurlijk spelen.',
    positioning:
      'Combinatie is een uitzonderlijke vervolgroute die pas logisch wordt wanneer vertrekduiding en behoudsvraag tegelijk bestuurlijk spelen.',
    whenLogical: [
      'ExitScan of RetentieScan al als eerste route scherp staat.',
      'Vertrekduiding en behoudsvraag tegelijk aandacht vragen in dezelfde managementlijn.',
      'De volgende stap gaat over een gefaseerde combinatie van twee samenhangende vragen.',
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
