import type { ContactRouteInterest } from '@/lib/contact-funnel'

export type SeoSolutionSlug =
  | 'verloop-analyse'
  | 'exitgesprekken-analyse'
  | 'medewerkersbehoud-analyse'

export interface SeoSolutionPage {
  slug: SeoSolutionSlug
  title: string
  seoTitle: string
  description: string
  canonical: string
  routeInterest: ContactRouteInterest
  productHref: string
  productLabel: string
  productTheme: 'exit' | 'retention'
  ctaSource: string
  eyebrow: string
  heroTitle: string
  heroDescription: string
  contextTitle: string
  contextBody: string
  problemCards: readonly [string, string][]
  whyNowTitle: string
  whyNowBody: string
  deliverableTitle: string
  deliverableBody: string
  deliverables: readonly string[]
  routeCards: readonly [string, string][]
  proofTitle: string
  proofBody: string
  contactTitle: string
  contactBody: string
}

export const SEO_SOLUTION_PAGES: readonly SeoSolutionPage[] = [
  {
    slug: 'verloop-analyse',
    title: 'Verloopanalyse',
    seoTitle: 'Verloopanalyse | ExitScan voor vertrekduiding bij HR-teams',
    description:
      'Gebruik ExitScan als compacte verloopanalyse voor HR-teams die vertrekpatronen bestuurlijk leesbaar willen maken met dashboard, managementrapport en bestuurlijke handoff.',
    canonical: '/oplossingen/verloop-analyse',
    routeInterest: 'exitscan',
    productHref: '/producten/exitscan',
    productLabel: 'ExitScan',
    productTheme: 'exit',
    ctaSource: 'solution_turnover_analysis_form',
    eyebrow: 'Oplossing',
    heroTitle: 'Verloopanalyse die verder gaat dan losse exitinput.',
    heroDescription:
      'Voor organisaties die niet alleen willen tellen hoeveel mensen vertrekken, maar bestuurlijk willen begrijpen welke terugkerende werkfactoren en vertrekpatronen aandacht vragen.',
    contextTitle: 'Gebruik deze pagina wanneer de vraag niet is of uitstroom bestaat, maar hoe je die bestuurlijk duidt.',
    contextBody:
      'ExitScan is hier de primaire route: geen generieke survey, maar een eerste traject dat vertrekduiding, proof en managementhulp in dezelfde leeslijn zet.',
    problemCards: [
      [
        'Veel exitinput, weinig lijn',
        'Exitgesprekken, losse notities en spreadsheets geven vaak geen vergelijkbaar organisatiebeeld dat HR, MT en directie samen kunnen lezen.',
      ],
      [
        'Vertrek is zichtbaar, oorzaken blijven diffuus',
        'Het probleem zit vaak niet in gebrek aan signalen, maar in het ontbreken van een compacte managementstructuur om patronen te wegen.',
      ],
      [
        'Besluitvorming blijft achter',
        'Zonder bestuurlijke handoff blijft uitstroom te snel een HR-observatie in plaats van een managementvraag met eigenaarschap.',
      ],
    ],
    whyNowTitle: 'Waarom ExitScan hier de juiste route is',
    whyNowBody:
      'ExitScan maakt vertrekduiding bestuurlijk leesbaar op groepsniveau. Je krijgt een eerste managementbeeld van terugkerende werkfactoren, vertrekredenen en signalen van werkfrictie zonder diagnose-, predictor- of causaliteitsclaim.',
    deliverableTitle: 'Wat je als deliverable terugkrijgt',
    deliverableBody:
      'De route combineert dashboard, managementrapport en bestuurlijke handoff in één professionele leeslijn die direct bruikbaar is voor HR, sponsor, MT en directie.',
    deliverables: [
      'Bestuurlijke read met vertrekbeeld en bestuurlijke relevantie',
      'Topfactoren en signalen van werkfrictie in een compacte managementstructuur',
      'Bestuurlijke handoff met eerste managementvraag en logische vervolgstap',
      'Publiek toetsbare claims-, privacy- en interpretatiegrenzen',
    ],
    routeCards: [
      ['Productroute', 'Start bij ExitScan als primaire wedge voor vertrekduiding en vergelijkbare managementoutput.'],
      ['Kooprust', 'Gebruik tarieven en aanpak om te zien hoe een eerste traject, vervolgvorm en livegang logisch worden opgebouwd.'],
      ['Due diligence', 'Gebruik vertrouwen, privacy en DPA pas als reassurance nadat de productfit en output helder zijn.'],
    ],
    proofTitle: 'Laat eerst de deliverable zien, daarna pas de uitleg.',
    proofBody:
      'De voorbeeldoutput op de ExitScan-productpagina laat zien hoe bestuurlijke read, topfactoren en bestuurlijke handoff werkelijk samenkomen.',
    contactTitle: 'Plan een kennismaking over verloopanalyse',
    contactBody:
      'Beschrijf kort waar jullie verloopvraag nu vastloopt. Dan toetsen we of ExitScan Baseline de juiste eerste stap is en welke databasis nodig is om snel naar een geloofwaardige eerste managementread te komen.',
  },
  {
    slug: 'exitgesprekken-analyse',
    title: 'Exitgesprekken analyseren',
    seoTitle: 'Exitgesprekken analyseren | ExitScan voor HR-teams',
    description:
      'Gebruik ExitScan om exitgesprekken en vertrekinput te vertalen naar een vergelijkbaar managementbeeld met dashboard, rapport en bestuurlijke handoff.',
    canonical: '/oplossingen/exitgesprekken-analyse',
    routeInterest: 'exitscan',
    productHref: '/producten/exitscan',
    productLabel: 'ExitScan',
    productTheme: 'exit',
    ctaSource: 'solution_exit_interviews_form',
    eyebrow: 'Oplossing',
    heroTitle: 'Analyseer exitgesprekken als managementinput, niet als losse verhalen.',
    heroDescription:
      'Voor organisaties die al exitgesprekken voeren maar nog geen compacte, vergelijkbare en bestuurlijk leesbare route hebben om die input te duiden.',
    contextTitle: 'Gebruik deze pagina wanneer exitgesprekken al bestaan, maar het managementbeeld ontbreekt.',
    contextBody:
      'ExitScan vervangt losse interpretatie door een begeleide productroute die patronen, werkfactoren en vervolgvraag in dezelfde managementtaal bundelt.',
    problemCards: [
      [
        'Rijke input, weinig vergelijkbaarheid',
        'Exitgesprekken leveren vaak waardevolle signalen op, maar zonder vaste structuur blijft vergelijking tussen afdelingen, perioden of thema’s lastig.',
      ],
      [
        'Te veel interpretatie per gesprek',
        'Zonder compacte managementlaag weegt iedere lezer de input anders en blijven terugkerende patronen minder scherp zichtbaar.',
      ],
      [
        'Moeilijk doorvertelbaar',
        'Wat HR ziet, landt niet automatisch bruikbaar bij sponsor, MT of directie wanneer er geen duidelijke executive leeslijn is.',
      ],
    ],
    whyNowTitle: 'Waarom ExitScan hier sterker is dan losse gespreksduiding',
    whyNowBody:
      'ExitScan helpt organisaties de stap te maken van losse exitgesprekken naar gegroepeerde vertrekduiding op managementniveau. Dat maakt vervolgvragen, prioritering en eigenaarschap sneller intern bespreekbaar.',
    deliverableTitle: 'Wat de route oplevert',
    deliverableBody:
      'Je koopt geen tool om ruwe notities op te slaan, maar een eerste traject dat exitinput vertaalt naar een compact dashboard- en rapportspoor met bestuurlijke handoff.',
    deliverables: [
      'Vergelijkbaar managementbeeld van vertrekpatronen en topfactoren',
      'Rapportstructuur die losse exitinput omzet naar prioriteiten en hypotheses',
      'Bestuurlijke handoff die intern beter doorvertelbaar is dan losse gesprekssamenvattingen',
      'Methodische en privacygrenzen die overclaiming voorkomen',
    ],
    routeCards: [
      ['Productroute', 'De natuurlijke vervolgstap is ExitScan, niet een bredere knowledge base of losse researchlaag.'],
      ['Kooprust', 'Via tarieven zie je hoe ExitScan Baseline en eventuele vervolgvormen commercieel zijn opgebouwd.'],
      ['Due diligence', 'Via vertrouwen toets je publiek hoe privacy, groepsgrenzen en rapportlezing zijn ingericht.'],
    ],
    proofTitle: 'Voorbeeldrapporten maken de stap van gesprek naar managementbeeld tastbaar.',
    proofBody:
      'De ExitScan showcase laat zien hoe vertrekredenen, signalen van werkfrictie en eerste managementvragen in één executive leeslijn landen.',
    contactTitle: 'Plan een kennismaking over exitgesprekken analyseren',
    contactBody:
      'Beschrijf kort hoe exitgesprekken nu worden verzameld en waar interpretatie of besluitvorming vastloopt. Dan toetsen we of ExitScan Baseline de juiste eerste structuur biedt.',
  },
  {
    slug: 'medewerkersbehoud-analyse',
    title: 'Medewerkersbehoud analyseren',
    seoTitle: 'Medewerkersbehoud analyseren | RetentieScan voor vroegsignalering',
    description:
      'Gebruik RetentieScan om eerder te zien waar medewerkersbehoud op groepsniveau onder druk staat, met verification-first managementoutput voor HR-teams en directie.',
    canonical: '/oplossingen/medewerkersbehoud-analyse',
    routeInterest: 'retentiescan',
    productHref: '/producten/retentiescan',
    productLabel: 'RetentieScan',
    productTheme: 'retention',
    ctaSource: 'solution_retention_analysis_form',
    eyebrow: 'Oplossing',
    heroTitle: 'Medewerkersbehoud analyseren zonder brede MTO of predictorframing.',
    heroDescription:
      'Voor organisaties die eerder willen zien waar behoud op groepsniveau onder druk staat en een gerichte managementroute zoeken in plaats van een brede tevredenheidsmeting.',
    contextTitle: 'Gebruik deze pagina wanneer de actieve behoudsvraag al expliciet op tafel ligt.',
    contextBody:
      'RetentieScan is hier de juiste route: verification-first, groepsgericht en bedoeld om prioritering en vervolggesprek te ondersteunen zonder individuele signalen naar management te sturen.',
    problemCards: [
      [
        'Behoudsdruk is voelbaar, maar niet scherp',
        'Organisaties zien vaak signalen in verzuim, vacatures of sentiment, maar missen een compacte route om behoudsrisico op groepsniveau eerder te bespreken.',
      ],
      [
        'Brede surveys voelen te diffuus',
        'Een algemene MTO of pulse meet vaak te veel tegelijk, waardoor het voor behoudsvraagstukken lastiger wordt om een gerichte eerste managementvraag te kiezen.',
      ],
      [
        'Individuele signalen zijn niet de bedoeling',
        'De behoefte zit meestal in groepsduiding en prioritering, niet in persoonsgerichte voorspelling, performance-oordeel of interventies op individueel niveau.',
      ],
    ],
    whyNowTitle: 'Waarom RetentieScan hier de passende route is',
    whyNowBody:
      'RetentieScan maakt zichtbaar waar behoud op groeps- en segmentniveau onder druk staat via retentiesignaal, stay-intent, bevlogenheid, vertrekintentie en beinvloedbare werkfactoren. Het product blijft expliciet verification-first en niet-predictief.',
    deliverableTitle: 'Wat je als deliverable terugkrijgt',
    deliverableBody:
      'De route levert een managementweergave op die behoudsdruk bespreekbaar maakt voor HR, sponsor, MT en directie, met duidelijke grenzen rond privacy, bewijsstatus en interpretatie.',
    deliverables: [
      'Retentiesignaal, stay-intent, bevlogenheid en vertrekintentie in dezelfde leeslijn',
      'Topfactoren en eerste verificatiesporen op groeps- en segmentniveau',
      'Bestuurlijke handoff voor sponsor, MT of directie zonder individuele predictorframing',
      'Publieke trustlaag die privacy-, claims- en bewijsstatus begrijpelijk maakt',
    ],
    routeCards: [
      ['Productroute', 'De natuurlijke vervolgstap is RetentieScan als gerichte route voor behoudsvraagstukken op groepsniveau.'],
      ['Kooprust', 'Via tarieven zie je hoe RetentieScan Baseline en ritmevormen commercieel zijn opgebouwd.'],
      ['Due diligence', 'Via vertrouwen toets je hoe privacygrenzen, groepsduiding en methodische claims publiek zijn ingericht.'],
    ],
    proofTitle: 'Laat eerst de verification-first output zien.',
    proofBody:
      'De RetentieScan showcase laat zien hoe retentiesignaal, topfactoren en bestuurlijke handoff samenkomen zonder brede MTO- of predictorclaim.',
    contactTitle: 'Plan een kennismaking over medewerkersbehoud analyseren',
    contactBody:
      'Beschrijf kort waar de actieve behoudsvraag nu zit. Dan toetsen we of RetentieScan Baseline de juiste eerste stap is en hoe een geloofwaardige eerste meetroute eruitziet.',
  },
] as const

export const SEO_SOLUTION_SLUGS = SEO_SOLUTION_PAGES.map((page) => page.slug)

export function getSeoSolutionPageBySlug(slug: string) {
  return SEO_SOLUTION_PAGES.find((page) => page.slug === slug) ?? null
}
