# Phase Next Step 9 - Suite Consolidation and Commercial Architecture Plan

## Title

Lock how the current six-route Verisight suite should be commercially organized, routed, and defended before any further expansion or scale-up work is allowed.

## Korte Summary

Na `PHASE_NEXT_STEP_8_POST_ONBOARDING_SUITE_SEQUENCE_AND_CONSOLIDATION_GATE_PLAN.md` is expliciet vastgezet dat Verisight niet direct verder uitbreidt. Deze stap bepaalt daarom hoe de huidige live suite commercieel en bestuurlijk als één geheel moet werken:

- welke route de primaire koop blijft
- hoe kernproducten, portfolioroute en follow-on routes zich commercieel tot elkaar verhouden
- welke CTA-, funnel- en pricinglogica leidend blijft
- waar de suite expliciet niet als brede catalogus, bundle of platform verkocht mag worden
- welke copy- en packaginggrenzen voortaan hard bewaakt moeten worden

De kernbeslissing van deze stap is:

- Verisight blijft commercieel een `core-first suite`
- `ExitScan` blijft de primaire wedge
- `RetentieScan` blijft de complementaire kernroute
- `Combinatie` blijft een route tussen twee echte kernvragen
- `Pulse`, `TeamScan` en `Onboarding 30-60-90` blijven kleiner, quote-only en vervolg-gedreven
- de suite mag buyer-facing niet verschuiven van scherpe routekeuze naar brede productcatalogus

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

De huidige codebase en marketinglaag hebben nu voor het eerst een suite die breed genoeg is om commercieel uit de bocht te vliegen:

- [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts) kent nu zes live buyer-facing routes
- [site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts) draagt nu meerdere pricing-, route- en trustverhalen tegelijk
- [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts) ondersteunt nu meerdere `route_interest`-paden
- follow-on routes zijn buyer-facing zichtbaar, maar moeten commercieel kleiner blijven dan de kernroutes

Zonder deze stap zouden de grootste risico's nu snel toenemen:

- te veel routes die als gelijkwaardige producten voelen
- te vroege cross-sell of suiteverkoop zonder duidelijke eerste route
- pricing- en CTA-ruis tussen kernproducten en follow-on routes
- trust- en claimsgrenzen die per product wel kloppen, maar niet meer als suite coherent aanvoelen

Deze stap voorkomt dat door nu de commerciële architectuur vast te zetten voordat runtime-hardening of verdere expansion weer in beeld komt.

## Current Implementation Baseline

### 1. Current live suite structure

- [x] `ExitScan` en `RetentieScan` zijn de twee live `core_product`
- [x] `Combinatie` is live `portfolio_route`
- [x] `Pulse`, `TeamScan` en `Onboarding 30-60-90` zijn live `follow_on_route`
- [x] er is nog geen aparte suite-entitlement-, billing- of planlaag

### 2. Current commercial pattern in code and copy

- [x] homepage blijft buyer-facing draaien rond twee kernproducten en een bewuste portfolioroute
- [x] pricing blijft kernproducten hard ankeren en vervolgvragen als `op aanvraag` positioneren
- [x] trust blijft uitleggen dat follow-on routes bounded managementreads zijn, geen brede suiteclaims
- [x] contactfunnel laat meerdere routes toe, maar gebruikt nog steeds `ExitScan` als default

### 3. Current structural risk

- [x] drie follow-on routes naast twee kernproducten maken routeverwarring sneller mogelijk
- [x] buyer-facing routegroei kan sneller gaan voelen als productcatalogus dan als decision-driven suite
- [x] follow-on routes kunnen commercieel te groot gaan klinken als er geen harde architecturele regels gelden

## Decision

### 1. Core-First Suite Rule

Verisight blijft commercieel een `core-first suite`.

Beslissing:

- de buyer-facing entree blijft draaien rond twee kernproducten
- `ExitScan` blijft de standaard eerste koop
- `RetentieScan` blijft de enige situationeel primaire uitzondering
- alle andere live routes blijven commercieel afhankelijk van een eerdere of smallere managementvraag

Rationale:

- dit sluit aan op de huidige pricing ladder, siteflow en funneldefaults
- dit voorkomt dat zes live routes buyer-facing als zes gelijke keuzes gaan voelen

### 2. Route Hierarchy Contract

De suitehiërarchie wordt commercieel vastgezet als:

- `core_product`
  - `ExitScan`
  - `RetentieScan`
- `portfolio_route`
  - `Combinatie`
- `follow_on_route`
  - `Pulse`
  - `TeamScan`
  - `Onboarding 30-60-90`

Beslissing:

- deze hiërarchie is buyer-facing leidend
- een `follow_on_route` mag geen eerste standaardkeuze, hoofd-CTA of defaultpricingroute worden
- `Combinatie` blijft tussenlaag en wordt niet opgewaardeerd tot kernproduct

### 3. Entry and Routing Contract

De commerciële routekeuze moet nu expliciet deze volgorde beschermen:

- standaard: `ExitScan`
- uitzondering: `RetentieScan` wanneer actieve behoudsvraag aantoonbaar primair is
- daarna pas:
  - `Combinatie` wanneer beide kernvragen echt bestaan
  - `Pulse` wanneer de vraag smaller wordt richting hercheck
  - `TeamScan` wanneer de vraag smaller wordt richting lokalisatie
  - `Onboarding 30-60-90` wanneer de vraag smaller wordt richting vroege instroomlanding

Beslissing:

- de suite verkoopt eerst de eerstvolgende logische route, niet de volledige catalogus
- routekeuze wint altijd boven cross-sell

### 4. Pricing Architecture Contract

Pricing moet de producthiërarchie blijven spiegelen.

Beslissing:

- kernproducten houden harde publieke prijsankers
- `Combinatie` blijft op aanvraag en wordt niet als bundle-discount verteld
- `Pulse`, `TeamScan` en `Onboarding 30-60-90` blijven `op aanvraag`
- follow-on routes worden verteld als kleinere, logisch volgende bewegingen en niet als parallelle eerste pakketten

Niet toegestaan:

- follow-on routes publiek als “vanaf”-pakket naast kernproducten zetten
- onboarding, Pulse of TeamScan laten voelen als lichte instapproducten
- combinatie als bundelprijs of suite-abonnement vertellen

### 5. CTA and Funnel Contract

De contact- en CTA-laag moet de suitehiërarchie beschermen.

Beslissing:

- globale primaire CTA blijft naar een kernroute-gesprek wijzen
- route-specifieke CTA's op productpagina's blijven toegestaan, maar moeten de bounded routepositie volgen
- `nog-onzeker` blijft functioneel voor keuzehulp
- de funnel blijft gericht op routekwalificatie en niet op productself-selection zonder kader

Niet toegestaan:

- globale CTA verschuiven naar een follow-on route
- route-interest defaults verbreden naar een catalogus- of planselectie
- follow-on routes behandelen alsof ze vanzelfsprekende starters zijn

### 6. Copy and Positioning Contract

De suitecopy moet voortaan drie dingen tegelijk doen:

- kernproducten scherp houden
- vervolgroutes kleiner en logischer maken
- suiteverwarring actief verminderen

Beslissing:

- elke publieke suite-surface moet de hiërarchie ondersteunen
- follow-on routes moeten expliciet kleiner klinken dan de kernroutes
- copy moet de suite vertellen als:
  - eerst routekeuze
  - dan managementwaarde
  - dan pas vervolgstap

Niet toegestaan:

- Verisight beschrijven als brede people-suite
- follow-on routes beschrijven alsof ze gelijkwaardige hoofdproducten zijn
- Onboarding, TeamScan of Pulse vertellen als “extra modules” zonder managementvraag

### 7. Commercial Expansion Contract

De eerstvolgende commerciële winst moet nu uit beter suitegebruik komen, niet uit meer producten.

Beslissing:

- prioriteit ligt op helderdere doorstroom tussen bestaande routes
- prioriteit ligt op sterkere cross-sell op basis van bewezen managementwaarde
- prioriteit ligt op minder frictie tussen homepage, pricing, trust en contactflow
- pas na consolidatie mag opnieuw bekeken worden of commercialization/scale-up eerder komt dan nieuwe productverbreding

## Key Changes

- de live suite krijgt nu een harde commerciële hiërarchie
- kernproducten, portfolioroute en follow-on routes worden buyer-facing expliciet ongelijk gehouden
- pricing, CTA en routekeuze worden vastgezet als `core-first`
- follow-on routes worden commercieel begrensd als kleinere vervolgstappen
- verdere groei wordt verschoven van productbreedte naar suitekwaliteit

## Belangrijke Interfaces/Contracts

### 1. Suite Commercial Hierarchy Contract

- `core_product`
- `portfolio_route`
- `follow_on_route`

Beslissing:

- elke publieke surface moet deze hiërarchie kunnen reproduceren

### 2. Entry Route Contract

- `default_first_route = ExitScan`
- `exception_first_route = RetentieScan`
- `portfolio_route = Combinatie`
- `follow_on_only = Pulse | TeamScan | Onboarding 30-60-90`

Beslissing:

- geen andere default-first-route is toegestaan zonder nieuwe decision-step

### 3. Pricing Ladder Contract

- `public_anchor = core_product`
- `quote_only = portfolio_route + follow_on_route`
- `no_bundle_discount = true`
- `no_parallel_first_package = true`

Beslissing:

- pricing moet voortaan expliciet de suitehiërarchie blijven bewaken

### 4. CTA/Funnel Contract

- `global_primary_cta -> core-first conversation`
- `route_specific_cta -> allowed, but bounded`
- `contact_form -> route qualification, not product shopping`
- `default_route_interest = exitscan`

Beslissing:

- de funnel blijft keuzehulp, geen cataloguscheckout

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
- [x] Follow-on routes blijven expliciet kleiner dan kernproducten.
- [x] `Combinatie` blijft route en geen derde kernproduct.

### Commercial acceptance

- [x] pricing blijft kernproducten ankeren
- [x] CTA- en funneldefaults blijven routekwalificatie beschermen
- [x] de suite voelt niet als losse productcatalogus

### Codebase acceptance

- [x] het document sluit aan op de huidige live route- en pricingrealiteit
- [x] er wordt geen billing-, entitlement- of checkoutlaag verondersteld die nog niet bestaat
- [x] deze stap opent geen nieuwe build- of copy-implementatie

### Documentation acceptance

- [x] dit document functioneert als source of truth voor suiteconsolidatie aan de commerciële kant
- [x] de hiërarchie en guardrails zijn expliciet genoeg voor de volgende runtime/QA-stap
- [x] de vervolgstap is duidelijk begrensd

## Assumptions/Defaults

- de live suite hoeft nu niet breder te worden om commercieel sterker te worden
- de grootste winst zit nu in duidelijkere routekeuze en sterkere suitecoherentie
- `ExitScan` blijft de primaire wedge totdat expliciete evidence iets anders rechtvaardigt
- follow-on routes blijven op aanvraag totdat latere commercialization-besluiten iets anders vereisen

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_10_SUITE_RUNTIME_HARDENING_AND_QA_GATE_PLAN.md`

Er is nog geen build permission voor een nieuwe productlijn of scale-up-wave.
