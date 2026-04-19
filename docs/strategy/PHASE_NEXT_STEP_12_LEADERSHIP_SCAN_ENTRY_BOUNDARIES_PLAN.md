# Phase Next Step 12 - Leadership Scan Entry Boundaries Plan

## Title

Lock what Leadership Scan may and may not be as the next possible Verisight expansion candidate, before any system design, data model, or build wave is allowed.

## Korte Summary

Na `PHASE_NEXT_STEP_11_NEXT_EXPANSION_CANDIDATE_GATE_PLAN.md` is `Leadership Scan` als enige serieuze volgende uitbreidingskandidaat overgebleven. Deze stap bepaalt daarom nog niet hoe het product gebouwd wordt, maar wel wat de route inhoudelijk mag zijn:

- welke managementvraag Leadership Scan zou moeten beantwoorden
- wanneer Leadership Scan logisch wordt na de huidige suite
- wanneer Leadership Scan expliciet niet de juiste route is
- hoe Leadership Scan zich moet onderscheiden van bestaande leiderschapsfactoren, `TeamScan` en `Segment Deep Dive`
- welke buyer-facing en packaginggrenzen nu al hard moeten blijven

De kernbeslissing van deze stap is:

- Leadership Scan mag alleen onderzocht worden als bounded follow-on route na een bestaand breder signaal
- Leadership Scan mag geen nieuw kernproduct, geen 360-tool, geen performance-instrument en geen generieke leiderschapstraining worden
- de route moet draaien om management- en leidingcontext rondom al zichtbare people-signalen
- de route mag niet simpelweg een herverpakking van de bestaande `leadership`-factor of `TeamScan` worden

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

De huidige codebase laat twee dingen tegelijk zien:

- `Leadership Scan` bestaat vandaag alleen als gereserveerde future route in [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- leiderschap bestaat inhoudelijk nu al wel binnen de suite als factor in bestaande producten, vragen en scoringlogica

Daardoor is de belangrijkste eerstvolgende vraag niet technisch maar productmatig:

- wanneer is een apart leadership-product echt logisch
- wanneer is het juist alleen bestaande factoruitleg in een nieuw jasje
- hoe voorkomen we overlap met `TeamScan`, dat nu al werkt met lokale verificatie en eerste eigenaar
- hoe voorkomen we dat Leadership Scan buyer-facing als brede leiderschapstool gaat voelen

Deze stap voorkomt dat risico door nu eerst de entrygrenzen te locken voordat er systeem- of databesluiten genomen worden.

## Current Implementation Baseline

### 1. Current candidate reality

- [x] `Leadership Scan` staat vandaag op `reserved_future`
- [x] er is nog geen runtime `scan_type = leadership`
- [x] er is nog geen backend productmodule voor leadership
- [x] er is nog geen frontend productmodule voor leadership
- [x] er is nog geen funnelroute, pricingregel of publieke routeactivatie voor leadership

### 2. Current suite reality around leadership

- [x] `leadership` bestaat vandaag al als factor binnen de bestaande factorlaag
- [x] `ExitScan` en `RetentieScan` gebruiken leiderschap al als onderdeel van hun werkfactoruitleg
- [x] `Pulse`, `TeamScan` en `Onboarding 30-60-90` kunnen leiderschap nu al indirect raken via factor- en managementoutput
- [x] `TeamScan` is al live als department-first lokalisatieroute na een breder signaal

### 3. Current boundary reality

- [x] de huidige suite kent nog geen leiderschapspecifieke respondent- of manager-metadata
- [x] de runtime kent vandaag vooral `department`, `role_level` en campaign-centered reads
- [x] er is nog geen 360-, review-, coachings- of performanceflow
- [x] de live suite is nu sterk juist omdat producten begrensd en managementgericht blijven

## Decision

### 1. Leadership Scan Is A Bounded Follow-On Candidate Only

Leadership Scan mag alleen onderzocht worden als bounded vervolgronde.

Beslissing:

- Leadership Scan wordt geen nieuw kernproduct
- Leadership Scan wordt geen standaard eerste koop
- Leadership Scan wordt alleen logisch na een bestaand breder people-signaal of terugkerende managementvraag
- Leadership Scan moet binnen de huidige `core-first suite` als vervolgroute blijven passen

Rationale:

- de huidige suite verkoopt eerst de brede managementvraag en pas daarna verdieping
- een leadership-route als eerste koop zou de huidige portfolioarchitectuur diffuser maken

### 2. Core Management Question

De kernvraag van Leadership Scan wordt nu als volgt vastgezet:

- “welke leidingcontext, leiderschapspatronen of managementdynamieken verdienen als eerste gerichte verificatie omdat ze samenhangen met een al zichtbaar people-signaal?”

Dit betekent:

- de route gaat over gerichte managementverificatie
- de route gaat niet over algemene leiderschapsontwikkeling
- de route gaat niet over individuele beoordeling van managers
- de route moet altijd gekoppeld blijven aan een al bestaand signaal uit de suite

### 3. Leadership Scan Is Explicitly Not These Things

Leadership Scan mag expliciet niet worden opgezet als:

- generieke leiderschapstraining
- coachingprogramma
- 360-feedbacktool
- performance- of beoordelingsinstrument
- losse manager ranking
- brede cultuur- of tevredenheidsmeting
- herlabelde `Segment Deep Dive`
- herlabelde `TeamScan`

Rationale:

- al deze vormen zouden de huidige Verisight-suite te breed of te vaag maken
- ze sluiten niet aan op de huidige management- en campaign-centered productlogica

### 4. Entry Rules

Leadership Scan wordt pas logisch als aan minimaal een van deze entry-omstandigheden is voldaan:

- een breder signaal uit `ExitScan` of `RetentieScan` blijft terugkomen en vraagt gerichte managementverificatie
- `Pulse` laat herhaald zien dat een signaal niet voldoende beweegt na eerste acties
- `TeamScan` lokaliseert waar gesprek nodig is, maar de leidingcontext zelf blijft nog onvoldoende scherp
- de klantvraag is expliciet management- en leidingcontextgebonden en niet primair team-, onboarding- of brede tevredenheidsgericht

### 5. Non-Entry Rules

Leadership Scan is expliciet niet logisch wanneer:

- de organisatie nog geen breder basisbeeld heeft
- de echte vraag vooral lokale lokalisatie is
- de echte vraag vooral onboardingfrictie is
- de echte vraag vooral een brede tevredenheidsmeting is
- de klant eigenlijk een HR-development-, coaching- of performancevraag heeft
- de beschikbare context alleen vraagt om factoruitleg binnen een bestaand product en niet om een aparte route

In die gevallen blijft de eerstvolgende logische route:

- `ExitScan`
- `RetentieScan`
- `Pulse`
- `TeamScan`
- `Onboarding 30-60-90`

afhankelijk van de primaire managementvraag.

### 6. Distinction From TeamScan

Leadership Scan moet expliciet onderscheiden blijven van `TeamScan`.

Beslissing:

- `TeamScan` blijft gaan over waar lokaal eerst verificatie nodig is
- Leadership Scan mag alleen gaan over welke management- of leidingcontext nader onderzocht moet worden
- `TeamScan` blijft department-first lokalisatie
- Leadership Scan mag niet stiekem een tweede teamprioriteringsproduct worden

Praktische grens:

- als de vraag vooral “waar speelt het?” is, blijft `TeamScan` leidend
- als de vraag vooral “welke leidingcontext vraagt gerichte verificatie?” is, kan Leadership Scan later logisch worden

### 7. Distinction From Existing Leadership Factor

Leadership Scan moet ook onderscheiden blijven van de bestaande factor `leadership`.

Beslissing:

- de huidige `leadership`-factor blijft onderdeel van bestaande producten
- een lage of hoge leiderschapsscore op zichzelf rechtvaardigt nog geen apart product
- Leadership Scan mag alleen bestaan als er een eigen managementvraag, eigen handoff en eigen outputvorm ontstaat

Niet toegestaan:

- simpelweg bestaande `leadership`-items bundelen en als nieuw product verkopen
- Leadership Scan als extra factor-tab of factor-uitleg binnen een bestaand dashboard maskeren

### 8. Packaging and Buyer-Facing Boundaries

Leadership Scan blijft voorlopig volledig gesloten aan de buyer-facing kant.

Beslissing:

- geen publieke routeactivatie
- geen pricingregel
- geen funnelroute
- geen positionering als brede “leadership oplossing”

Als Leadership Scan ooit opent, dan alleen als:

- quote-only
- bounded follow-on route
- expliciet kleiner dan de kernproducten
- duidelijk gepositioneerd na een bestaand people-signaal

## Key Changes

- Leadership Scan krijgt nu een harde productgrens voordat er technisch ontworpen wordt
- de route wordt beperkt tot management- en leidingcontext na een bestaand signaal
- overlap met `TeamScan`, `Segment Deep Dive` en de bestaande factorlaag wordt expliciet afgegrendeld
- buyer-facing activatie blijft volledig dicht
- de volgende stap wordt beperkt tot system- en data-boundaries, niet build

## Belangrijke Interfaces/Contracts

### 1. Candidate Position Contract

- `Leadership Scan = follow-on candidate only`
- `Leadership Scan != core product`
- `Leadership Scan != default first route`

### 2. Management Question Contract

- primary question:
  - welke leidingcontext of managementdynamiek vraagt als eerste gerichte verificatie na een bestaand people-signaal

### 3. Non-Identity Contract

- `Leadership Scan != 360 tool`
- `Leadership Scan != performance tool`
- `Leadership Scan != training product`
- `Leadership Scan != TeamScan`
- `Leadership Scan != leadership factor repackaging`

### 4. Packaging Contract

- `status = reserved_future`
- `route_activation = blocked`
- `pricing = blocked`
- `funnel = blocked`

## Primary Reference Surfaces

- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [docs/strategy/PHASE_NEXT_STEP_11_NEXT_EXPANSION_CANDIDATE_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_11_NEXT_EXPANSION_CANDIDATE_GATE_PLAN.md)
- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)

## Testplan

### Product acceptance

- [x] Leadership Scan heeft een eigen managementvraag en is niet vaag of generiek.
- [x] Leadership Scan wordt expliciet kleiner gehouden dan de kernproducten.
- [x] De route wordt niet verward met `TeamScan` of bestaande factoruitleg.

### Strategy acceptance

- [x] De route sluit aan op de huidige people-insight suite.
- [x] De route voorkomt breadth-first catalogusgroei.
- [x] De entry- en non-entry-rules zijn concreet genoeg voor de volgende stap.

### Codebase acceptance

- [x] Deze stap veronderstelt geen nieuwe metadata of runtimecontracten die nog niet bestaan.
- [x] Deze stap voegt geen `scan_type` toe.
- [x] Deze stap opent geen buyer-facing of technische activatie.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor Leadership Scan entry boundaries.
- [x] Het onderscheid met bestaande producten en factoren is expliciet genoeg.
- [x] De volgende toegestane stap is duidelijk begrensd.

## Assumptions/Defaults

- de huidige suite raakt leiderschap nu al indirect via factoren en managementhandoff
- een apart leadership-product is alleen verdedigbaar als het meer is dan factoruitleg of teamlokalisatie
- leadership moet binnen Verisight managementgericht en bounded blijven, niet evolueren naar HR-developmentsoftware
- buyer-facing activatie blijft voorlopig volledig gesloten

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_13_LEADERSHIP_SCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md`

Er is nog geen build permission voor `Leadership Scan`.
