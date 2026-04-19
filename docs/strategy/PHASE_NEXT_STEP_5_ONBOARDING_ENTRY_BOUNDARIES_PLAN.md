# Phase Next Step 5 - Onboarding Entry Boundaries Plan

## Title

Lock what `Onboarding 30-60-90` is, what it is not, and when it can logically exist in the Verisight suite before any architecture or build wave starts.

## Korte Summary

Na `Pulse` en `TeamScan` is `Onboarding 30-60-90` de volgende logische lifecycle-candidate, maar de huidige codebase maakt ook meteen duidelijk waarom hier eerst een boundary-plan nodig is:

- onboarding bestaat vandaag al als klantimplementatie- en adoptielaag in docs, dashboardcopy en lifecycle-ondersteuning
- onboarding bestaat nog niet als aparte productline, `scan_type`, marketingroute of runtime-contract
- zonder scherpe entry boundaries zou `Onboarding 30-60-90` te makkelijk verward raken met client onboarding, implementatiebegeleiding of een brede employee-journey propositie

Deze stap zet daarom alleen de productgrenzen vast:

- welke managementvraag `Onboarding 30-60-90` wel oplost
- wanneer het wel of niet als logische vervolgstap in de suite past
- hoe het zich verhoudt tot `ExitScan`, `RetentieScan`, `Pulse`, `TeamScan` en bestaande client onboarding
- welke buyer- en runtimeverwarring expliciet voorkomen moet worden

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen onboarding-wave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

De huidige repo laat nu twee waarheden tegelijk zien:

### 1. Onboarding bestaat al, maar in een andere betekenis

De codebase en documentatie gebruiken onboarding vandaag vooral voor:

- klantintake en implementatie
- adoptie naar first value
- lifecyclebegeleiding na eerste koop
- dashboard- en deliverycontext rond setup, managementread en opvolging

Dat is zichtbaar in bijvoorbeeld:

- [CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md)
- [CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md)
- [client-onboarding.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.ts)

### 2. Onboarding bestaat nog niet als productline

Tegelijk is er vandaag nog geen:

- `scan_type = onboarding`
- onboarding-productmodule in backend of frontend registry
- buyer-facing route of pricing-entry voor onboarding
- survey-, scoring-, report- of dashboardcontract voor eerste `30`, `60` en `90` dagen

Zonder deze boundary-stap zou de volgende productuitbreiding dus direct riskeren te botsen met al bestaande betekenissen van onboarding in Verisight.

## Current Implementation Baseline

### 1. Runtime baseline

- [x] backend registry ondersteunt alleen `exit`, `retention`, `pulse` en `team`
- [x] frontend registry ondersteunt alleen `exit`, `retention`, `pulse` en `team`
- [x] `ScanType` bevat nog geen onboardingvariant
- [x] huidige runtime blijft campaign-centered

### 2. Marketing baseline

- [x] `Onboarding 30-60-90` bestaat nog niet in [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [x] er is geen onboarding-productpagina in de huidige live of reserved buyer-facing portfolio
- [x] pricing en funnel kennen nog geen onboardingroute
- [x] de huidige live portfolio bestaat uit twee kernproducten, een portfolio-route en twee bounded follow-on routes

### 3. Existing onboarding meaning baseline

- [x] onboarding bestaat al als client onboarding en adoption-context
- [x] onboarding-copy ondersteunt vandaag implementatie, setup, first value en vervolgbesluiten
- [x] onboarding is dus al semantisch bezet binnen Verisight

### 4. Suite sequence baseline

- [x] `ExitScan` blijft de primaire wedge
- [x] `RetentieScan` blijft de complementaire kernroute
- [x] `Pulse` is live als monitoringlaag
- [x] `TeamScan` is live als lokalisatielaag
- [x] `Onboarding 30-60-90` is bevestigd als volgende productline-candidate, maar nog niet geopend

## Decision

### 1. Core Product Question

`Onboarding 30-60-90` krijgt als primaire managementvraag:

- waar loopt vroege integratie, rolhelderheid, leidingsteun, teaminbedding of werkverwachting in de eerste `30`, `60` en `90` dagen vast, en welke vroege fricties vragen als eerste aanpassing in onboarding, leiding of teamcontext

Secundaire managementvraag:

- welke vroege signalen vragen een gerichte interventie voordat onboardingproblemen later uitgroeien tot behouds- of uitstroomrisico

Beslissing:

- `Onboarding 30-60-90` wordt een vroege lifecycle-scan
- het is geen generieke onboardingchecklist of HR-procesaudit
- het is geen brede cultuur- of tevredenheidsmeting voor nieuwe medewerkers

### 2. Productline Position In The Suite

`Onboarding 30-60-90` wordt gepositioneerd als aparte lifecycle-route, niet als subvariant van een bestaand product.

Beslissing:

- het wordt geen `RetentieScan`-variant voor jonge tenure
- het wordt geen `Pulse` op een nieuwe populatie
- het wordt geen `TeamScan`-variant rond nieuwe instroom
- het wordt een eigen productline-candidate met eigen managementvraag

### 3. Entry Rule

`Onboarding 30-60-90` wordt niet geopend als standaard eerste Verisight-route.

Wel logisch wanneer:

- een organisatie expliciet een vroege lifecycle-vraag heeft rond nieuwe instroom
- de eerste `30`, `60` en `90` dagen bestuurlijk relevant zijn voor succes of retentie
- management vooral vroege frictie wil begrijpen, niet eerst bredere vertrek- of behoudspatronen

Niet logisch wanneer:

- de organisatie in feite een algemene vertrekduiding nodig heeft
- de organisatie in feite een actieve-populatie behoudsvraag heeft
- de buyer eigenlijk teamlokalisatie zoekt na een breder signaal
- de vraag feitelijk gaat over klantimplementatie of interne adoptie van Verisight

Beslissing:

- `Onboarding 30-60-90` is geen nieuwe default wedge
- het kan later wel een situationeel eerste product zijn, maar niet zonder aparte expliciete criteria

### 4. Non-Overlap Contract With Existing Productlines

#### Ten opzichte van ExitScan

- `ExitScan` kijkt retrospectief naar vertrekduiding
- `Onboarding 30-60-90` kijkt vroeg naar integratiefrictie en vroege signalen in de eerste maanden

Beslissing:

- onboarding vervangt geen vertrekduiding
- exit vervangt geen first-90-days signaal

#### Ten opzichte van RetentieScan

- `RetentieScan` kijkt naar actieve-populatie behoudssignalen op groepsniveau
- `Onboarding 30-60-90` kijkt naar een beperkte vroege lifecycle-populatie in de eerste maanden

Beslissing:

- onboarding mag niet worden verkocht als "RetentieScan, maar eerder"
- retentie mag niet worden opgerekt tot onboardingroute

#### Ten opzichte van Pulse

- `Pulse` volgt eerder vastgestelde signalen in kort ritme
- `Onboarding 30-60-90` zou een lifecycle-gebonden meetroute zijn op vaste instroommomenten

Beslissing:

- onboarding is geen generieke monitoringlaag
- pulse blijft de review- en trendlaag na diagnose of baseline

#### Ten opzichte van TeamScan

- `TeamScan` lokaliseert een al zichtbaar breder signaal
- `Onboarding 30-60-90` zou een lifecycle-vraag onderzoeken bij nieuwe instroom

Beslissing:

- onboarding is geen lokalisatieroute
- teamscan is geen onboardingdiagnose

#### Ten opzichte van client onboarding

- client onboarding in Verisight betekent vandaag setup, adoptie en first value voor klanten
- `Onboarding 30-60-90` zou een inhoudelijk HR-product voor eindklanten zijn

Beslissing:

- deze twee betekenissen moeten repo-breed expliciet gescheiden blijven
- `client onboarding` en `employee onboarding` mogen niet dezelfde productterm delen zonder kwalificatie

### 5. Initial Buyer Positioning Contract

Als `Onboarding 30-60-90` later opent, dan alleen als:

- lifecycle-scan voor nieuwe medewerkers
- gericht op vroege integratie, rolduidelijkheid, leidingsteun en teaminbedding
- bounded en bestuurlijk bruikbaar
- zonder brede EX-suiteclaim of volledige employee-journey framing

Niet als:

- brede "people lifecycle platform"-stap
- MTO voor nieuwe medewerkers
- generieke onboardingtool
- vervanger van client onboarding of implementation begeleiding

### 6. Initial Delivery Shape Contract

De eerste productgrens voor `Onboarding 30-60-90` wordt:

- vaste lifecyclemomenten als dragende vorm
- een afgebakende populatie van nieuwe medewerkers
- nadruk op vroege frictie en vroege succesvoorwaarden
- groepsniveau en managementread, niet individuele beoordeling

Wat nog niet wordt besloten in deze stap:

- exacte datamodelkeuze
- exacte artifactvorm
- exacte scanfrequentie
- exacte public activation of packagingrol

Die keuzes horen in de volgende twee onboarding-stappen.

## Key Changes

- onboarding als bestaand client-onboardingbegrip is nu expliciet losgetrokken van de toekomstige productline
- `Onboarding 30-60-90` is vastgezet als lifecycle-scan voor nieuwe medewerkers, niet als generieke onboardingtool
- overlap met `ExitScan`, `RetentieScan`, `Pulse` en `TeamScan` is inhoudelijk begrensd
- de volgende onboardingstap is nu systeem- en databoundaries, niet build

## Belangrijke Interfaces/Contracts

### 1. Naming Contract

Totdat later expliciet anders besloten:

- `client onboarding` blijft de term voor Verisight-klantimplementatie
- `Onboarding 30-60-90` blijft de term voor de mogelijke nieuwe productline

### 2. Entry Contract

Later toegestaan:

- situationele eerste route bij expliciete first-90-days managementvraag

Nu nog niet toegestaan:

- default eerste route
- automatische portfolioopening
- impliciete opname in pricing of funnel

### 3. Interpretation Contract

De toekomstige productline moet op groepsniveau blijven:

- geen individuele beoordeling
- geen performance-instrument
- geen voorspellende claim over individueel slagen of falen

### 4. Governance Contract

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md`

Niet toegestaan:

- `WAVE_01_ONBOARDING_*`
- nieuwe `scan_type`-voorbereiding
- buyer-facing onboardingroute
- brede roadmap-uitbreiding buiten deze ene lijn

## Primary Reference Surfaces

- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [frontend/lib/client-onboarding.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.ts)
- [docs/active/CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md)
- [docs/active/CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md)
- [docs/strategy/PHASE_NEXT_STEP_4_POST_TEAMSCAN_SUITE_SEQUENCE_AND_ONBOARDING_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_4_POST_TEAMSCAN_SUITE_SEQUENCE_AND_ONBOARDING_GATE_PLAN.md)

## Testplan

### Product acceptance

- [x] `Onboarding 30-60-90` heeft een eigen managementvraag.
- [x] De lijn overlapt niet betekenisloos met `ExitScan`, `RetentieScan`, `Pulse` of `TeamScan`.
- [x] De lijn is expliciet onderscheiden van bestaande client onboarding.

### Codebase acceptance

- [x] Het document erkent de huidige runtimebeperking: nog geen onboarding `scan_type` of module.
- [x] Er wordt geen niet-bestaande implementatie verondersteld.
- [x] De stap voegt geen buildscope toe.

### Runtime acceptance

- [x] Geen runtimewijzigingen in deze stap.
- [x] Geen marketing- of routewijzigingen in deze stap.
- [x] Geen nieuwe artifacts of surveycontracts in deze stap.

### QA acceptance

- [x] De grootste semantische verwarring, client onboarding versus employee onboarding, is expliciet benoemd.
- [x] De volgende stap is smal en logisch.
- [x] De suite blijft na TeamScan decision-driven.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor onboarding entry boundaries.
- [x] De documentlogica sluit aan op de huidige live suite.
- [x] De vervolgstap is eenduidig vastgezet.

## Assumptions/Defaults

- `Onboarding 30-60-90` blijft de eerstvolgende productline-candidate na `TeamScan`.
- De lijn is inhoudelijk lifecycle-first en niet monitoring-first of localization-first.
- De term onboarding blijft in de repo dubbelzinnig zolang de productline nog niet publiek bestaat; daarom is expliciete kwalificatie nu verplicht.
- Er komt nog geen buyer-facing of runtimeopening voordat systeem- en databoundaries hard zijn vastgezet.

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md`

Er is nog geen build permission voor een onboarding-wave.
