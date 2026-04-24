import type { ContactRouteInterest } from '@/lib/contact-funnel'

export type InsightPageSlug =
  | 'waarom-medewerkers-vertrekken'
  | 'welke-signalen-gaan-aan-verloop-vooraf'
  | 'waar-staat-behoud-onder-druk'

export interface InsightPage {
  slug: InsightPageSlug
  title: string
  seoTitle: string
  description: string
  canonical: string
  publishedAt: string
  theme: 'exit' | 'retention'
  primaryRouteInterest: ContactRouteInterest
  primaryProductHref: string
  primaryProductLabel: string
  secondarySolutionHref: string
  secondarySolutionLabel: string
  ctaSource: string
  hero: {
    eyebrow: string
    kicker: string
    body: string
    stats: readonly string[]
  }
  problemFraming: readonly [string, string][]
  managementInsight: {
    title: string
    body: string
    bullets: readonly string[]
  }
  productHandoff: {
    title: string
    body: string
  }
  qualificationIntro: string
  whenThisFits: readonly string[]
  notFor: readonly string[]
  conversationReadiness: readonly string[]
  whatToDoNext: readonly [string, string][]
  trustProofReferences: readonly {
    label: string
    href: string
    body: string
  }[]
  cta: {
    title: string
    body: string
  }
}

export const INSIGHT_PAGES: readonly InsightPage[] = [
  {
    slug: 'waarom-medewerkers-vertrekken',
    title: 'Waarom medewerkers vertrekken',
    seoTitle: 'Waarom medewerkers vertrekken | ExitScan-inzicht voor HR en directie',
    description:
      'Voor organisaties die niet alleen willen tellen dat mensen vertrekken, maar bestuurlijk willen begrijpen welk vertrekbeeld terugkomt en waar eerst eigenaarschap nodig is.',
    canonical: '/inzichten/waarom-medewerkers-vertrekken',
    publishedAt: '2026-04-18',
    theme: 'exit',
    primaryRouteInterest: 'exitscan',
    primaryProductHref: '/producten/exitscan',
    primaryProductLabel: 'ExitScan',
    secondarySolutionHref: '/oplossingen/verloop-analyse',
    secondarySolutionLabel: 'Verloopanalyse',
    ctaSource: 'insight_why_people_leave_form',
    hero: {
      eyebrow: 'Inzicht',
      kicker: 'Vertrekduiding op managementniveau',
      body:
        'Deze pagina is bedoeld voor organisaties die niet alleen willen weten dat mensen vertrekken, maar bestuurlijk willen begrijpen welk vertrekbeeld terugkomt en waar management eerst eigenaarschap moet pakken.',
      stats: [
        'Terugkijkende analyse op groepsniveau',
        'Werkfactoren en vertrekpatronen in dezelfde leeslijn',
        'Geen causaliteitsclaim, wel bestuurlijke handoff',
      ],
    },
    problemFraming: [
      [
        'Veel vertrekinput, weinig lijn',
        'Exitgesprekken, spreadsheets en losse observaties leveren vaak meer detail dan richting. Daardoor ontstaat wel urgentie, maar nog geen compact managementbeeld.',
      ],
      [
        'Iedereen leest iets anders',
        'Zonder vaste managementstructuur wegen HR, sponsor en directie dezelfde signalen anders. Dat vertraagt prioritering en maakt eigenaarschap diffuus.',
      ],
      [
        'Actie start te laat',
        'Wanneer vertrek vooral als losse anekdote wordt besproken, blijft de stap naar eerste managementactie vaak hangen in interpretatie in plaats van besluitvorming.',
      ],
    ],
    managementInsight: {
      title: 'Wat management hier eigenlijk moet willen lezen',
      body:
        'Sterke vertrekduiding begint niet met een lange lijst vertrekredenen, maar met een compacte executive read die patronen, werkfrictie en bestuurlijke relevantie aan elkaar koppelt.',
      bullets: [
        'Welke werkfactoren zichtbaar terugkeren in uitstroom',
        'Waar signalen vooral bevestiging vragen en waar direct gesprek logisch wordt',
        'Welke eerste managementvraag intern als eigenaarsthema moet landen',
      ],
    },
    productHandoff: {
      title: 'Als deze vraag nu echt speelt, hoort de vervolgstap meestal niet in extra analysecontent maar in een eerste ExitScan-route.',
      body:
        'Gebruik deze pagina om de managementvraag scherper te krijgen. Gebruik ExitScan als de route die dezelfde vraag ook echt kan dragen in dashboard, rapport en bestuurlijke handoff.',
    },
    qualificationIntro:
      'Deze pagina moet helpen om de juiste gesprekken te openen en de verkeerde sneller af te remmen. Niet iedere vertrekvraag vraagt meteen om een serieus eerste traject.',
    whenThisFits: [
      'Er is een duidelijke managementvraag rond terugkerend vertrek',
      'Het team zoekt een eerste bestuurlijke read, niet meer losse anecdotes',
      'Er is bereidheid om een serieuze eerste route te toetsen',
    ],
    notFor: [
      'Brede people-strategie orientatie zonder duidelijke vertrekvraag',
      'Een algemene MTO- of engagementverkenning',
      'Individuele casusbehandeling of exitcoaching',
    ],
    conversationReadiness: [
      'Er is een concrete managementvraag rond vertrek of behoud',
      'Er is behoefte aan een eerste bestuurlijke read, niet alleen extra informatie',
      'Er is bereidheid om een serieuze eerste route te toetsen',
    ],
    whatToDoNext: [
      [
        'Maak de vraag kleiner',
        'Bepaal eerst of het echt om retrospectieve vertrekduiding gaat. Dan voorkom je dat behoud, engagement en exit in een brede people-vraag door elkaar gaan lopen.',
      ],
      [
        'Koppel patroon aan eigenaar',
        'Een bruikbaar vertrekbeeld eindigt niet bij observatie. Het moet doorvertelbaar zijn richting sponsor, MT of directie met een eerste logische handoff.',
      ],
      [
        'Toets daarna pas vervolg',
        'Gebruik RetentieScan pas aanvullend wanneer dezelfde themas eerder in de actieve populatie zichtbaar moeten worden. Niet als parallel startpunt zonder duidelijke eerste vraag.',
      ],
    ],
    trustProofReferences: [
      {
        label: 'Bekijk ExitScan',
        href: '/producten/exitscan',
        body: 'Zie hoe dashboard, rapport en bestuurlijke handoff op de productroute samenkomen.',
      },
      {
        label: 'Bekijk verloopanalyse',
        href: '/oplossingen/verloop-analyse',
        body: 'Gebruik de compacte oplossingspagina als intent-led ingang voor deze managementvraag.',
      },
      {
        label: 'Bekijk vertrouwen',
        href: '/vertrouwen',
        body: 'Toets publiek hoe claimsgrenzen, privacy en rapportlezing zijn ingericht.',
      },
    ],
    cta: {
      title: 'Toets of ExitScan nu jullie juiste eerste route is',
      body:
        'Beschrijf kort welk vertrekvraagstuk nu speelt, welke signalen al zichtbaar zijn en waarom dit nu bestuurlijke aandacht vraagt. Dan toetsen we of ExitScan Baseline de juiste eerste stap is.',
    },
  },
  {
    slug: 'welke-signalen-gaan-aan-verloop-vooraf',
    title: 'Welke signalen gaan aan verloop vooraf',
    seoTitle: 'Welke signalen gaan aan verloop vooraf | ExitScan-inzicht voor management',
    description:
      'Voor teams die vroege werkfrictie serieuzer willen duiden zonder die vraag meteen uit te smeren tot een breed cultuur- of engagementprogramma.',
    canonical: '/inzichten/welke-signalen-gaan-aan-verloop-vooraf',
    publishedAt: '2026-04-17',
    theme: 'exit',
    primaryRouteInterest: 'exitscan',
    primaryProductHref: '/producten/exitscan',
    primaryProductLabel: 'ExitScan',
    secondarySolutionHref: '/oplossingen/exitgesprekken-analyse',
    secondarySolutionLabel: 'Exitgesprekken analyseren',
    ctaSource: 'insight_early_turnover_signals_form',
    hero: {
      eyebrow: 'Inzicht',
      kicker: 'Eerdere signalen, niet pas de einduitkomst',
      body:
        'Deze pagina is bedoeld voor teams die eerder willen begrijpen welke werkfrictie vaak al zichtbaar is voordat verloop optelt, zonder dat meteen te vertalen naar een breed cultuur- of engagementprogramma.',
      stats: [
        'Vroege frictiesignalen uit exitduiding',
        'Focus op patroonherkenning, niet op losse incidenten',
        'Bruikbaar als eerste managementgesprek, niet als predictorclaim',
      ],
    },
    problemFraming: [
      [
        'Achteraf lijkt alles logisch',
        'Na vertrek voelt het verleidelijk om een rechte lijn te tekenen. In werkelijkheid bestaat het voorstadium vaak uit meerdere kleine signalen die pas in samenhang gewicht krijgen.',
      ],
      [
        'HR ziet nuance, management ziet ruis',
        'Zonder compacte framing komt vroege werkfrictie te snel over als losse sentimenten of individuele casuistiek in plaats van als organisatiepatroon.',
      ],
      [
        'Preventie wordt te breed',
        'Wanneer elk signaal wordt opgeblazen tot compleet veranderprogramma, verdwijnt de eerste managementvraag uit beeld en neemt besluitmoeheid toe.',
      ],
    ],
    managementInsight: {
      title: 'Waar u op moet letten voordat uitstroom optelt',
      body:
        'De signalen die vaak voorafgaan aan verloop zitten meestal niet in een enkele vraag, maar in een combinatie van ervaren werkdruk, beperkte rolhelderheid, haperend leiderschap en afnemend perspectief.',
      bullets: [
        'Werkfrictie die in meerdere groepen terugkomt',
        'Spanningen tussen leiding, belasting en groeiperspectief',
        'Signalen die nog verificatie vragen voordat ze als beleidsclaim worden gelezen',
      ],
    },
    productHandoff: {
      title: 'Als jullie al exitinput hebben en eerdere signalen serieuzer willen duiden, is de logische vervolgstap meestal ExitScan en niet een bredere content- of researchlaag.',
      body:
        'Gebruik deze pagina om de vroege signalen in managementtaal te plaatsen. Gebruik ExitScan zodra dezelfde vraag vergelijkbare output en bestuurlijke duiding moet krijgen.',
    },
    qualificationIntro:
      'Vroege signalen trekken snel nieuwsgierige gesprekken aan. Daarom moet deze pagina expliciet maken wanneer het om een serieuze managementvraag gaat en wanneer niet.',
    whenThisFits: [
      'Vroege signalen zijn al zichtbaar maar interpretatie loopt uiteen',
      'De organisatie wil een managementread in plaats van een open verkenning',
      'Er is een concrete vervolgbehoefte rond vertrekduiding',
    ],
    notFor: [
      'Algemene inspiratie rond cultuur of employer branding',
      'Een brede wellbeing- of engagementaanpak zonder vertrekvraag',
      'Nieuwsgierigheid naar predictors op individueel niveau',
    ],
    conversationReadiness: [
      'Er is een concreet signaal dat bestuurlijk moet worden geduid',
      'Er is behoefte aan een eerste route-inschatting, niet alleen gedachtevorming',
      'Er is bereidheid om van content naar productroute te gaan als de fit klopt',
    ],
    whatToDoNext: [
      [
        'Lees signalen als hypothese',
        'Gebruik deze laag om gerichter te vragen waar frictie oploopt, niet om al vast te stellen wat de oorzaak definitief is.',
      ],
      [
        'Voorkom broad-content denken',
        'Dit onderwerp vraagt geen algemene kennisbank. Het moet doorverwijzen naar een concrete productroute die dezelfde managementvraag echt kan dragen.',
      ],
      [
        'Maak de stap naar vergelijkbare output',
        'Zodra exitinput al beschikbaar is, helpt ExitScan om vroege signalen te bundelen in een managementread die intern beter standhoudt dan losse observaties.',
      ],
    ],
    trustProofReferences: [
      {
        label: 'Bekijk ExitScan',
        href: '/producten/exitscan',
        body: 'Open de kernroute voor vertrekduiding en vergelijkbare managementoutput.',
      },
      {
        label: 'Bekijk exitgesprekken analyseren',
        href: '/oplossingen/exitgesprekken-analyse',
        body: 'Gebruik de intent-led route wanneer exitgesprekken al bestaan maar managementduiding nog ontbreekt.',
      },
      {
        label: 'Bekijk tarieven',
        href: '/tarieven',
        body: 'Toets hoe een eerste baseline en eventuele vervolgvorm commercieel zijn opgebouwd.',
      },
    ],
    cta: {
      title: 'Bespreek of ExitScan deze signalen echt bestuurlijk kan duiden',
      body:
        'Beschrijf kort welke vroege signalen jullie nu zien, waar interpretatie uiteenloopt en waarom een scherper managementbeeld nodig is. Dan toetsen we of ExitScan de juiste route is.',
    },
  },
  {
    slug: 'waar-staat-behoud-onder-druk',
    title: 'Waar staat behoud onder druk',
    seoTitle: 'Waar staat behoud onder druk | RetentieScan-inzicht voor vroegsignalering',
    description:
      'Voor organisaties die een concrete behoudsvraag op groepsniveau willen toetsen zonder te vervallen in een brede MTO of individuele predictorlogica.',
    canonical: '/inzichten/waar-staat-behoud-onder-druk',
    publishedAt: '2026-04-16',
    theme: 'retention',
    primaryRouteInterest: 'retentiescan',
    primaryProductHref: '/producten/retentiescan',
    primaryProductLabel: 'RetentieScan',
    secondarySolutionHref: '/oplossingen/medewerkersbehoud-analyse',
    secondarySolutionLabel: 'Medewerkersbehoud analyseren',
    ctaSource: 'insight_retention_pressure_form',
    hero: {
      eyebrow: 'Inzicht',
      kicker: 'Behoudsdruk vroeg leesbaar maken',
      body:
        'Deze pagina is bedoeld voor organisaties die een concrete behoudsvraag op groepsniveau willen toetsen, zonder te vervallen in een brede MTO of individuele predictorlogica.',
      stats: [
        'Groepsduiding in plaats van individuele signalen',
        'Verification-first managementread',
        'Geen brede MTO of predictorframing',
      ],
    },
    problemFraming: [
      [
        'Behoudsvraag is voelbaar, maar nog vaag',
        'Verzuim, sentiment of vacaturedruk kunnen een signaal zijn, maar zonder gerichte leeslijn blijft onduidelijk waar behoud echt onder spanning staat.',
      ],
      [
        'Brede surveys geven te veel tegelijk terug',
        'Wanneer een organisatie tegelijk cultuur, tevredenheid, leiderschap en behoud probeert te vangen, wordt de eerste managementvraag vaak juist minder scherp.',
      ],
      [
        'Individuele interpretatie is onwenselijk',
        'Bij actieve medewerkers moet de route juist helpen om groepsduiding en prioritering mogelijk te maken, zonder persoonsgericht lezen of handelen.',
      ],
    ],
    managementInsight: {
      title: 'Hoe een sterke retention-read eruitziet',
      body:
        'Een goede managementread laat zien waar behoudsdruk nu zichtbaar wordt, welke werkfactoren daarin meewegen en welk verificatiespoor eerst nodig is voordat acties worden opgeschaald.',
      bullets: [
        'Waar stay-intent en vertrekintentie spanning laten zien op groepsniveau',
        'Welke factoren management nu als eerste moet toetsen',
        'Hoe privacygrenzen en bewijsstatus onderdeel blijven van de interpretatie',
      ],
    },
    productHandoff: {
      title: 'Als de actieve behoudsvraag nu echt op tafel ligt, is de vervolgstap meestal RetentieScan als gerichte managementroute.',
      body:
        'Gebruik deze pagina om de vraag scherper te maken. Gebruik RetentieScan zodra de organisatie een eerste groepsread nodig heeft in plaats van een brede survey of vrijblijvende orientatie.',
    },
    qualificationIntro:
      'Retentiethema\'s trekken snel brede interesse aan. Daarom moet deze pagina expliciet maken wanneer een gesprek zinvol is en wanneer de vraag nog te open staat.',
    whenThisFits: [
      'Er is nu een managementvraag over behoudsdruk op groepsniveau',
      'De organisatie wil een eerste groepsread, niet een brede tevredenheidsmeting',
      'Er is bereidheid om een serieuze retention-route te toetsen',
    ],
    notFor: [
      'Een brede MTO-refresh zonder duidelijke behoudsvraag',
      'Individuele retention-monitoring of persoonsgerichte opvolging',
      'Algemene orientatie zonder concrete vraag naar behoudsdruk',
    ],
    conversationReadiness: [
      'Er is een concrete managementvraag rond behoud of stay-intent',
      'Er is behoefte aan een eerste verificatie-route, niet alleen inspiratie',
      'Er is bereidheid om scope, fit en eerste haalbaarheid serieus te bespreken',
    ],
    whatToDoNext: [
      [
        'Houd de vraag smal',
        'Gebruik behoudsdruk als gerichte managementvraag. Daarmee voorkom je dat RetentieScan opschuift naar brede employee-experience content of een verkapte MTO.',
      ],
      [
        'Werk verification-first',
        'Lees de eerste signalen als input voor prioritering en vervolgvragen. Daarmee blijft de output bruikbaar zonder schijnprecisie of predictorverhaal.',
      ],
      [
        'Maak opvolging onderdeel van de route',
        'De waarde zit niet alleen in de eerste read, maar in het vervolg: welke groep vraagt nu aandacht, wie pakt dat op en wanneer herhaal je bewust.',
      ],
    ],
    trustProofReferences: [
      {
        label: 'Bekijk RetentieScan',
        href: '/producten/retentiescan',
        body: 'Open de kernroute voor vroegsignalering op behoud met managementrapport en trustgrenzen.',
      },
      {
        label: 'Bekijk medewerkersbehoud analyseren',
        href: '/oplossingen/medewerkersbehoud-analyse',
        body: 'Gebruik de compacte oplossingsingang als de actieve behoudsvraag al expliciet op tafel ligt.',
      },
      {
        label: 'Bekijk vertrouwen',
        href: '/vertrouwen',
        body: 'Lees hoe privacy, groepsduiding en claimsgrenzen publiek worden uitgelegd.',
      },
    ],
    cta: {
      title: 'Toets of RetentieScan nu echt de juiste eerste stap is',
      body:
        'Beschrijf kort waar behoud nu onder druk lijkt te staan, waarom die vraag nu speelt en welke groepscontext relevant is. Dan toetsen we of RetentieScan Baseline past en welke eerste scope logisch is.',
    },
  },
] as const

export const INSIGHT_PAGE_SLUGS = INSIGHT_PAGES.map((page) => page.slug)

export function getInsightPageBySlug(slug: string) {
  return INSIGHT_PAGES.find((page) => page.slug === slug) ?? null
}

export const insightPublishedDateFormatter = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatInsightPublishedAt(publishedAt: string) {
  return insightPublishedDateFormatter.format(new Date(`${publishedAt}T00:00:00Z`))
}
