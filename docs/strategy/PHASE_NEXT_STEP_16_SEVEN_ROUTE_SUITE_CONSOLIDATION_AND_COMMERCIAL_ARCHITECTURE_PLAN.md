# Phase Next Step 16 - Seven-Route Suite Consolidation and Commercial Architecture Plan

## Title

Refresh the commercial hierarchy, route logic, and packaging rules for the current seven-route Verisight suite so the live portfolio stays sharp after Leadership Scan activation.

## Korte Summary

De eerdere commerciële consolidatie in [PHASE_NEXT_STEP_9_SUITE_CONSOLIDATION_AND_COMMERCIAL_ARCHITECTURE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_9_SUITE_CONSOLIDATION_AND_COMMERCIAL_ARCHITECTURE_PLAN.md) was correct voor de toenmalige zes-route suite. Sinds [WAVE_04_LEADERSHIP_SCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_04_LEADERSHIP_SCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md) is de live buyer-facing suite breder geworden:

- twee kernproducten: `ExitScan`, `RetentieScan`
- een portfolioroute: `Combinatie`
- vier bounded follow-on routes: `Pulse`, `TeamScan`, `Onboarding 30-60-90`, `Leadership Scan`

De kernvraag van deze stap is daarom niet of de suite nog verder moet groeien, maar hoe de huidige live suite commercieel georganiseerd moet blijven zonder:

- catalogusgevoel
- te vroege cross-sell
- overlap tussen follow-on routes
- verwarring tussen managementread, lokalisatie, lifecycle-check en named leader-expectaties

De hoofdkeuze van deze stap is:

- Verisight blijft commercieel een `core-first suite`
- `ExitScan` blijft de primaire wedge
- `RetentieScan` blijft de enige situationeel primaire uitzondering
- `Combinatie` blijft een route tussen twee kernvragen
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` blijven expliciet kleiner, quote-only en vervolg-gedreven
- de suite mag buyer-facing niet verschuiven van decision-driven routekeuze naar brede people-catalogus

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

### 1. The commercial suite is broader than before

De huidige codebase draagt nu zeven live buyer-facing routes in [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts). Daarmee is de commerciële spanning groter dan in de eerdere consolidatiestap:

- er zijn nu vier follow-on routes in plaats van drie
- `Leadership Scan` voegt een nieuwe semantische laag toe die sneller kan overlappen met `TeamScan` of named leader-verwachtingen
- routekeuze en CTA-architectuur moeten daarom opnieuw expliciet worden bevestigd

### 2. The current risk is now suite blur, not route scarcity

De suite heeft nu genoeg breedte om buyer-facing te gaan vervagen als de guardrails niet opnieuw worden aangescherpt:

- follow-on routes kunnen te groot gaan klinken naast de kernproducten
- de buyer kan sneller een "welke van de zeven producten moet ik kiezen?"-ervaring krijgen
- publieke pricing en funnel kunnen ongemerkt naar een multi-product shopping flow schuiven

### 3. Leadership changes the follow-on layer materially

Leadership Scan is inhoudelijk anders dan de eerdere follow-on routes:

- `Pulse` = review en hercheck
- `TeamScan` = lokalisatie
- `Onboarding 30-60-90` = vroege lifecycle-check
- `Leadership Scan` = bounded managementread na een bestaand people-signaal

Juist daarom moet nu expliciet worden vastgezet:

- hoe de vier follow-on routes zich tot elkaar verhouden
- welke van die vier commercieel het vaakst pas na welke kernvraag logisch worden
- hoe CTA-, pricing- en routecopy de suite klein en decision-driven houden

## Current Implementation Baseline

### 1. Current live route hierarchy in code

- [x] `ExitScan` en `RetentieScan` staan als `core_product`
- [x] `Combinatie` staat als `portfolio_route`
- [x] `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` staan als `follow_on_route`
- [x] de huidige live buyer-facing suite telt zeven routes

### 2. Current contact and CTA reality

- [x] [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts) ondersteunt nu `leadership` naast bestaande route-interests
- [x] `ExitScan` blijft frontend-default voor routekeuze
- [x] route-specifieke CTA's bestaan nu voor alle live follow-on routes

### 3. Current commercial risk

- [x] de suite kan sneller als brede people-catalogus voelen dan bij zes routes
- [x] `Leadership Scan` kan semantisch te groot gaan klinken zonder extra commerciële guardrails
- [x] de eerdere consolidatiestap benoemt nog niet expliciet hoe vier follow-on routes samen klein moeten blijven

## Decision

### 1. Core-First Suite Rule Remains Hard

Beslissing:

- de buyer-facing entree blijft draaien rond twee kernproducten
- `ExitScan` blijft de standaard eerste koop
- `RetentieScan` blijft de enige situationeel primaire uitzondering
- alle overige live routes blijven commercieel afhankelijk van een eerdere of smallere managementvraag

Rationale:

- dit beschermt de suite tegen zeven gelijke keuzes
- dit sluit aan op de bestaande core/follow-on werkelijkheid in de codebase

### 2. Seven-Route Hierarchy Contract

De commerciële hiërarchie wordt nu expliciet vastgezet als:

- `core_product`
  - `ExitScan`
  - `RetentieScan`
- `portfolio_route`
  - `Combinatie`
- `follow_on_route`
  - `Pulse`
  - `TeamScan`
  - `Onboarding 30-60-90`
  - `Leadership Scan`

Beslissing:

- een `follow_on_route` mag geen standaard eerste keuze, globale hoofd-CTA of publieke kernpricing krijgen
- `Combinatie` blijft tussenlaag en wordt niet opgewaardeerd tot derde kernproduct

### 3. Entry and Route Logic Contract

De commerciële routevolgorde moet nu expliciet deze logica beschermen:

- standaard: `ExitScan`
- uitzondering: `RetentieScan` wanneer actieve behoudsvraag aantoonbaar primair is
- daarna pas:
  - `Combinatie` wanneer beide kernvragen echt tegelijk bestaan
  - `Pulse` wanneer de vraag smaller wordt richting review en hercheck
  - `TeamScan` wanneer de vraag smaller wordt richting lokalisatie
  - `Onboarding 30-60-90` wanneer de vraag smaller wordt richting vroege instroomlanding
  - `Leadership Scan` wanneer de vraag smaller wordt richting managementcontext-duiding na een bestaand people-signaal

Beslissing:

- routekeuze wint altijd boven cross-sell
- de suite verkoopt eerst de eerstvolgende logische route en nooit de hele catalogus tegelijk

### 4. Follow-On Differentiation Contract

De follow-on laag moet buyer-facing expliciet ongelijk blijven:

- `Pulse` = compact reviewritme
- `TeamScan` = bounded lokalisatie
- `Onboarding 30-60-90` = assisted single-checkpoint lifecycle-check
- `Leadership Scan` = bounded managementread zonder named leaders

Beslissing:

- follow-on routes moeten niet alleen "kleiner" maar ook onderling onderscheidend blijven
- publieke copy moet de centrale managementvraag per route scherper maken dan de featurelijst

Niet toegestaan:

- `TeamScan` en `Leadership Scan` als varianten van hetzelfde probleem verkopen
- `Leadership Scan` laten klinken als named leader, 360 of performanceproduct
- `Pulse` of onboarding laten voelen als brede entry-producten

### 5. Pricing Architecture Contract

Pricing moet ook in de zeven-route suite de hiërarchie blijven spiegelen.

Beslissing:

- kernproducten houden harde publieke prijsankers
- `Combinatie` blijft op aanvraag en geen bundle-discountverhaal
- alle vier follow-on routes blijven `op aanvraag`
- follow-on routes worden verteld als kleinere logisch volgende bewegingen en niet als parallelle eerste pakketten

Niet toegestaan:

- follow-on routes publiek als lichte instapproducten positioneren
- Leadership Scan of onboarding laten voelen als nieuw kernaanbod
- quote-only routes laten schuiven richting vergelijkbare publieke prijsblokken als de kernproducten

### 6. CTA and Funnel Contract

De CTA- en contactlaag moet de zeven-route hiërarchie beschermen.

Beslissing:

- globale primaire CTA blijft naar een kernroutegesprek wijzen
- route-specifieke CTA's op productpagina's blijven toegestaan, maar moeten bounded blijven
- `nog-onzeker` blijft functioneel voor keuzehulp
- follow-on routes mogen buyer-facing zichtbaar zijn, maar niet als globale startdefault landen

Niet toegestaan:

- globale CTA verschuiven naar een follow-on route
- contactflow laten voelen als productshopping zonder routekader
- follow-on routes behandelen alsof zij de logische standaardstarter zijn

### 7. Copy and Positioning Contract

Suitecopy moet voortaan vier dingen tegelijk doen:

- kernproducten scherp houden
- portfolioroute klein houden
- follow-on routes kleiner én onderscheidend houden
- actieve verwarring reduceren

Beslissing:

- elke publieke suite-surface moet de hiërarchie kunnen reproduceren
- follow-on routes moeten expliciet kleiner klinken dan de kernroutes
- `Leadership Scan` moet extra guardrails krijgen tegen named leader-, 360- en performanceassociaties
- de suite moet verteld blijven worden als:
  - eerst routekeuze
  - dan managementwaarde
  - dan pas vervolgroute

### 8. Commercialization After Leadership Means Better Suite Use, Not More Suite Breadth

Beslissing:

- de eerstvolgende commerciële winst moet nu komen uit:
  - helderdere routekeuze
  - beter onderscheid tussen de vier follow-on routes
  - sterkere CTA- en pricingdiscipline
  - minder frictie tussen homepage, producten, tarieven, vertrouwen en contactflow
- niet uit:
  - nieuwe routeactivatie
  - bredere bundels
  - platform- of catalogusframing

## Key Changes

- de commerciële architectuur wordt vernieuwd voor de actuele zeven-route suite
- `Leadership Scan` wordt nu expliciet opgenomen in de follow-on hiërarchie en guardrails
- follow-on differentiatie wordt een eigen commercieel contract en niet alleen impliciete copykwaliteit
- pricing, CTA en routekeuze blijven `core-first`
- verdere groei verschuift opnieuw van breadth naar suitekwaliteit

## Belangrijke Interfaces/Contracts

### 1. Suite Commercial Hierarchy Contract

- `core_product`
- `portfolio_route`
- `follow_on_route`

Beslissing:

- elke publieke surface moet deze hiërarchie kunnen reproduceren voor de huidige zeven-route suite

### 2. Entry Route Contract

- `default_first_route = ExitScan`
- `exception_first_route = RetentieScan`
- `portfolio_route = Combinatie`
- `follow_on_only = Pulse | TeamScan | Onboarding 30-60-90 | Leadership Scan`

### 3. Pricing Ladder Contract

- `public_anchor = core_product`
- `quote_only = portfolio_route + all follow_on_route`
- `no_bundle_discount = true`
- `no_parallel_first_package = true`

### 4. CTA/Funnel Contract

- `global_primary_cta -> core-first conversation`
- `route_specific_cta -> allowed, but bounded`
- `contact_form -> route qualification, not product shopping`
- `default_route_interest = exitscan`

### 5. Follow-On Distinction Contract

- `pulse != teamscan`
- `teamscan != leadership`
- `onboarding != client onboarding`
- `leadership != named leader or 360`

## Primary Reference Surfaces

- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [frontend/lib/contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- [frontend/app/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/page.tsx)
- [frontend/app/producten/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/page.tsx)
- [frontend/app/tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [frontend/app/vertrouwen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/vertrouwen/page.tsx)
- [frontend/lib/marketing-positioning.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-positioning.test.ts)
- [frontend/lib/marketing-flow.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-flow.test.ts)

## Testplan

### Product acceptance

- [x] De suite blijft buyer-facing `core-first`.
- [x] Alle vier follow-on routes blijven expliciet kleiner dan de kernproducten.
- [x] `Combinatie` blijft route en geen derde kernproduct.
- [x] `Leadership Scan` blijft commercieel bounded en geen named leader- of 360-propositie.

### Commercial acceptance

- [x] Pricing blijft kernproducten ankeren.
- [x] CTA- en funneldefaults blijven routekwalificatie beschermen.
- [x] De follow-on laag blijft onderling onderscheidend.
- [x] De suite voelt niet als losse productcatalogus.

### Codebase acceptance

- [x] Het document sluit aan op de huidige zeven live routes en huidige funnelrealiteit.
- [x] Er wordt geen billing-, entitlement- of checkoutlaag verondersteld die nog niet bestaat.
- [x] Deze stap opent geen nieuwe build- of copy-implementatie.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor commerciële suiteconsolidatie na Leadership.
- [x] De hiërarchie en guardrails zijn expliciet genoeg voor de volgende runtime/QA-refresh.
- [x] De vervolgstap is duidelijk begrensd.

## Assumptions/Defaults

- de live suite hoeft nu niet breder te worden om commercieel sterker te worden
- de grootste winst zit nu in duidelijkere routekeuze en sterkere follow-on differentiatie
- `ExitScan` blijft de primaire wedge totdat expliciete evidence iets anders rechtvaardigt
- alle follow-on routes blijven op aanvraag totdat latere scale-up- of commercialization-besluiten iets anders rechtvaardigen

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_17_SEVEN_ROUTE_SUITE_RUNTIME_HARDENING_AND_QA_GATE_PLAN.md`

Er is nog geen build permission voor een nieuwe productlijn of nieuwe expansion-candidate.
