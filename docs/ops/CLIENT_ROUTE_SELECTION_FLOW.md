# CLIENT_ROUTE_SELECTION_FLOW

Last updated: 2026-04-18  
Status: active  
Source of truth: commercial architecture canon and client onboarding flow system.

## Titel

Commercial Architecture And Onboarding Flow Refinement - Client route selection flow

## Korte samenvatting

Deze flow maakt expliciet hoe Verisight van eerste managementvraag naar de juiste eerste route gaat. De kernbeslissing is dat routekeuze begint bij de managementvraag, niet bij het breedst verkoopbare product.

## Wat is geaudit

- [COMMERCIAL_ARCHITECTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_ARCHITECTURE_CANON.md)
- [PACKAGING_AND_ROUTE_LOGIC.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PACKAGING_AND_ROUTE_LOGIC.md)
- [CLIENT_ONBOARDING_FLOW_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_FLOW_SYSTEM.md)
- [CLIENT_ONBOARDING_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_PLAYBOOK.md)
- [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md)

## Belangrijkste bevindingen

- De eerste beslissende splitsing is stabiel: vertrekvraagstuk opent `ExitScan`, behoudsvraagstuk opent `RetentieScan`.
- De meeste routefouten ontstaan wanneer bounded of parity-build routes te vroeg als eerste instap worden gepresenteerd.
- `Combinatie` is alleen verantwoord als beide managementvragen echt tegelijk spelen en de eerste route alsnog expliciet wordt gekozen.

## Belangrijkste inconsistenties of risico's

- Zonder vaste beslisregel kan een verkoopgesprek te vroeg naar TeamScan, Pulse of Leadership schuiven omdat die kleiner of eenvoudiger lijken.
- Routekeuze op basis van leveringsvorm, tijdsdruk of buyer-preference alleen is te zwak als de managementvraag nog niet scherp is.

## Beslissingen / canonvoorstellen

- Vraag eerst altijd: `welke managementvraag moet nu als eerste geopend worden?`
- Kies `ExitScan` wanneer vertrekduiding, terugkijkend patroonbegrip en bestuurlijke prioritering rond vertrek centraal staan.
- Kies `RetentieScan` wanneer vroegsignalering op behoud, actieve populaties en eerste verificatie/interventie centraal staan.
- Open `TeamScan`, `Onboarding 30-60-90`, `Pulse` en `Leadership Scan` niet als eerste route zonder expliciet uitzonderingsbesluit.
- Gebruik `Combinatie` alleen als portfoliokader boven een al gekozen eerste route.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [CLIENT_ROUTE_SELECTION_FLOW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ROUTE_SELECTION_FLOW.md)

## Flow

1. Bevestig sponsor, contactpersoon en eerste managementcontext.
2. Formuleer de eerste managementvraag in een zin.
3. Bepaal of die vraag primair over vertrek of behoud gaat.
4. Kies de eerste route.
5. Leg vast waarom andere routes nu niet de eerste keuze zijn.
6. Leg timing, scanmodus en verwachte first value vast.
7. Draag over naar implementation intake.

## Acceptance

- De eerste route is expliciet gekozen en gekoppeld aan een echte managementvraag.
- Afgevallen routes zijn bewust afgegrensd en niet impliciet als gelijkwaardige optie blijven hangen.
- De klant begrijpt wat nu eerst gebeurt en wat eventueel later logisch kan volgen.

## Validatie

- De flow volgt dezelfde dual-core first-buy logic als de commercial canon.
- De flow voorkomt dat parity-build of bounded routes ongemerkt naar first-buy status opschuiven.

## Assumptions / defaults

- `ExitScan` blijft de sterkste embedded baseline en standaardreferentie voor vertrekvragen.
- `RetentieScan` is commercieel kernroute, ook al volgt bredere parityarchitectuur nog niet overal exact ExitScan-volwassenheid.
- Een expliciete uitzondering kan bestaan, maar hoort buiten deze standaardflow.

## Next gate

Client first-value flow expliciteren van intake naar eerste managementwaarde.
