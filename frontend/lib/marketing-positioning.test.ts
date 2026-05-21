import { describe, expect, it } from 'vitest'
import {
  CORE_MARKETING_PRODUCTS,
  FOLLOW_ON_MARKETING_PRODUCTS,
  SECONDARY_FIRST_BUY_MARKETING_PRODUCTS,
} from '@/lib/marketing-products'
import {
  pricingAddOns,
  pricingCards,
  pricingFollowOnRoutes,
  productFollowOnRouteRows,
  productSecondaryFirstBuyRoute,
  trustHubAnswerCards,
  trustReadingRows,
  trustSupportCards,
  trustVerificationCards,
} from '@/components/marketing/site-content'

describe('spreadsheet-driven product copy', () => {
  it('keeps ExitScan and RetentieScan as the two core product routes', () => {
    expect(CORE_MARKETING_PRODUCTS.map((product) => product.slug)).toEqual(['exitscan', 'retentiescan'])
  })

  it('keeps onboarding visible as the secondary first-buy route with the revised buyer-facing copy', () => {
    expect(SECONDARY_FIRST_BUY_MARKETING_PRODUCTS.map((product) => product.slug)).toEqual(['onboarding-30-60-90'])
    expect(productSecondaryFirstBuyRoute.eyebrow).toBe('Voor vragen rond de eerste 30, 60 en 90 dagen')
    expect(productSecondaryFirstBuyRoute.body).toBe(
      'Voor organisaties die vroeg willen zien of nieuwe medewerkers goed landen — en waar eerste frictie aandacht vraagt voordat die uitgroeit tot uitval, verloop of langdurige onzekerheid.',
    )
    expect(productSecondaryFirstBuyRoute.bullets).toEqual([
      'Voor vragen rond de eerste 30, 60 en 90 dagen',
      'Maakt vroege frictie in rol, team en leiding zichtbaar',
      'Startpunt wanneer onboarding nu de belangrijkste vraag is',
    ])
  })

  it('keeps combinatie out of the product overview rows while leaving later follow-on routes intact', () => {
    expect(FOLLOW_ON_MARKETING_PRODUCTS.map((product) => product.slug)).toEqual([
      'combinatie',
      'pulse',
      'leadership-scan',
    ])
    expect(productFollowOnRouteRows).toEqual([
      ['ExitScan Live Start', 'Voor organisaties die nieuwe exits vanaf nu structureel willen volgen, nadat duidelijk is welke vertrekvraag centraal staat.'],
      ['Reviewcadans', 'Voor organisaties die periodiek willen terugkijken of signalen verschuiven, opvolging werkt en een nieuwe managementkeuze nodig is.'],
      ['Pulse', 'Compacte vervolgronde na een eerste baseline.'],
      ['Leadership Scan', 'Wanneer signalen vooral vragen oproepen over aansturing of leiding.'],
    ])
  })
})

describe('spreadsheet-driven pricing copy', () => {
  it('updates the three baseline cards with the revised descriptions', () => {
    expect(pricingCards.map((card) => card.description)).toEqual([
      'Voor organisaties die beter willen begrijpen welke patronen terugkomen in uitstroom en wat management eerst moet bespreken.',
      'Voor organisaties die eerder willen zien waar behoud onder druk staat, voordat signalen pas zichtbaar worden in exitdata.',
      'Voor organisaties die willen zien of nieuwe medewerkers goed landen in rol, team, leiding en werkcontext.',
    ])
  })

  it('keeps Action Center Start as the only public add-on with the revised bounded copy', () => {
    expect(pricingAddOns).toEqual([
      [
        'Action Center Start',
        'vanaf EUR 1.250',
        'Optionele uitbreiding voor één gekozen vervolgrichting, met beperkte manager- of eigenaartoegang, zichtbare status en één reviewmoment.',
      ],
    ])
  })

  it('uses the revised later-follow-on descriptions', () => {
    expect(pricingFollowOnRoutes.map((route) => [route.title, route.description])).toEqual([
      ['ExitScan Live Start', 'Voor organisaties die nieuwe exits vanaf nu structureel willen volgen.'],
      ['Reviewcadans', 'Voor organisaties die periodiek willen herijken of signalen verschuiven en opvolging werkt.'],
      ['Pulse', 'Voor een compacte hercheck nadat de eerste vraag al scherp is.'],
      ['Leadership Scan', 'Wanneer signalen vooral vragen oproepen over aansturing of leiding.'],
      ['Combinatie', 'Wanneer vertrek en behoud tegelijk aandacht vragen en gefaseerd bekeken moeten worden.'],
    ])
  })
})

describe('spreadsheet-driven trust copy', () => {
  it('replaces the trust verification cards with the revised buyer-facing language', () => {
    expect(trustVerificationCards).toEqual([
      {
        title: 'Zo weet u vooraf waar u aan toe bent',
        body: 'U kunt vooraf zien hoe Loep omgaat met privacy, rapportage en de eerste stap naar een Baseline.',
      },
      {
        title: 'Waar publieke voorbeeldoutput stopt',
        body: 'Voorbeeldoutput is beschikbaar voor de belangrijkste eerste routes. Andere routes lichten we kort toe, zonder onnodige voorbeeldbibliotheek.',
      },
      {
        title: 'Wat u in rapport en dashboard terugziet',
        body: 'Een groepsbeeld, belangrijkste aandachtspunten, prioriteiten en eerste vervolgrichting.',
      },
      {
        title: 'Wat we bewust niet claimen',
        body: 'Geen individuele voorspellingen, geen persoonsgerichte beoordeling en geen conclusies die verder gaan dan het groepsbeeld toelaat.',
      },
    ])
  })

  it('replaces the trust reading rows and support cards with the spreadsheet wording', () => {
    expect(trustReadingRows).toEqual([
      ['Gebruik', 'Samenvatting, prioriteiten en gesprek op groepsniveau', 'Niet als diagnose, individuele voorspelling of beoordeling van personen'],
      ['Wat u terugziet', 'Dashboard, managementsamenvatting, topfactoren en eerste vervolgrichting.', 'Geen ruwe individuele responses, geen persoonsprofielen en geen verborgen black-box score.'],
      ['Privacygrens', 'Minimale groepsgroottes, onderdrukking van te kleine segmenten en zorgvuldige omgang met open tekst.', 'Niet gebruiken alsof kleine groepen of open tekst altijd volledig veilig of representatief zijn.'],
      ['Wat de uitkomsten wel en niet zeggen', 'Onderbouwde signalen met duidelijke grenzen in wat ze wel en niet zeggen.', 'Niet gebruiken als diagnose, voorspeller of sluitend bewijs.'],
    ])

    expect(trustHubAnswerCards.map((card) => card.body)).toEqual([
      'De primaire database draait in de EU. Subverwerkers voor hosting en e-mail staan in het privacybeleid en de verwerkersovereenkomst.',
      'U ziet groeps- en segmentinzichten. Geen individuele signalen, persoonsprofielen of persoonlijke risicolijsten.',
      'Detailweergave start pas vanaf minimale groepsgroottes. Te kleine segmenten blijven verborgen en open tekst wordt zorgvuldig behandeld.',
      'U vindt publieke pagina’s over trust, privacy, voorwaarden en een standaard verwerkersovereenkomst.',
      'U start met een Baseline: scan, dashboard en managementrapport. Opvolging kan daarna optioneel worden geborgd.',
      'Nee. Voorbeeldoutput is bewust beperkt tot de belangrijkste eerste routes: ExitScan en RetentieScan.',
    ])

    expect(trustSupportCards.map((card) => card.body)).toEqual([
      'Methodiek, privacy en verantwoord gebruik van uitkomsten.',
      'Hoe Loep persoonsgegevens, subverwerkers en AVG-rechten behandelt.',
      'Standaard verwerkersovereenkomst voor klantorganisaties.',
      'Voorwaarden over dienstvorm, beschikbaarheid, facturatie en rollen.',
    ])
  })
})
