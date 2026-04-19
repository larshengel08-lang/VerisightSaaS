# Phase Next Step 25 - Connectors And Lifecycle Analytics Readiness Plan

## Title

Define when Verisight may later open a bounded connectors and lifecycle analytics track without overstating current import, delivery, follow-up, or measurement capabilities.

## Korte Summary

Na [PHASE_NEXT_STEP_24_IDENTITY_AND_ENTERPRISE_CONTROLS_READINESS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_24_IDENTITY_AND_ENTERPRISE_CONTROLS_READINESS_PLAN.md) is nu expliciet vastgezet dat identity, SSO en enterprise controls nog geen buildspoor openen en dat de huidige auth- en governance-realiteit voorlopig voldoende maar beperkt is.

De volgende logische stap is daarom:

- expliciet vastzetten wat `connectors and lifecycle analytics readiness` in de huidige Verisight-realiteit zou betekenen

Niet:

- meteen HRIS-connectors of sync-jobs bouwen
- events en analytics breed gaan loggen zonder scherpe vraag
- lifecycle dashboards openen alsof Verisight al een journey-platform is
- external ingestie toevoegen die de huidige assisted truth voorbijschiet

De kernkeuze van deze stap is daarom:

- connectors en lifecycle analytics blijven voorlopig readiness-onderwerpen en geen implementatiebesluit
- de huidige datarealiteit blijft leidend: handmatige intake, respondentimport, campaign execution, delivery checkpoints en learning closure
- een latere eerste ingestie- of analyticslaag moet kleiner beginnen dan een breed dataplatform
- elke latere uitbreiding moet voortkomen uit een concrete product- of opsvraag, niet uit integratiehonger

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

### 1. The repo already has operational data flow, but not connector infrastructure

De huidige codebase draagt nu al:

- handmatige respondentimport
- campaign execution per `scan_type`
- delivery lifecycle stages
- explicit learning closure
- customer lifecycle copy en follow-through logic

Maar nog niet:

- connector auth
- sync orchestration
- webhooks
- inbound external data contracts
- lifecycle analytics dashboards als productlaag
- historical event streams

Dat betekent dat ook hier eerst een readiness-grens nodig is.

### 2. The current “lifecycle” is assisted and decision-oriented, not event-driven

De repo gebruikt nu lifecycle vooral als:

- assisted customer journey
- delivery progression
- checkpoint- en handofftaal
- productvolgorde en managementmomenten

Niet als:

- doorlopende employee journey engine
- event-based telemetry platform
- behavioural analytics stack

### 3. The biggest connector risk is importing complexity without better product decisions

Te vroege connectors of analytics zouden nu makkelijk leiden tot:

- meer data zonder duidelijkere managementuitkomst
- nieuwe privacy- en trustvragen
- schijn van automatisering terwijl review en duiding nog assisted horen te blijven

### 4. Analytics only matters if it sharpens actions, not if it just increases visibility

Een latere analyticslaag is pas zinvol als die:

- qualification verbetert
- delivery voorspelbaarder maakt
- managementgebruik concreter maakt
- learning closure sterker maakt

Niet alleen als die:

- meer dashboards oplevert

## Current Implementation Baseline

### 1. Current input and execution baseline

- [x] respondentimport bestaat al als handmatige importflow
- [x] campaigns draaien binnen de bestaande campaign-centered runtime
- [x] scanuitvoering blijft route- en surveygedreven
- [x] data-inname is nu bewust gecontroleerd en assisted

### 2. Current lifecycle baseline

- [x] `CampaignDeliveryRecord` modelleert delivery lifecycle stages
- [x] `client-onboarding.ts` modelleert assisted customer lifecycle en decision cards
- [x] learning closure bestaat via `PilotLearningDossier`
- [x] `first_value_reached` en `first_management_use` zijn expliciet gescheiden

### 3. Current observability / control baseline

- [x] er is basisfoutmonitoring via Sentry init in backend
- [x] er zijn regressies, smoke checks en operatorsurfaces
- [x] er is nog geen business event model of lifecycle analytics contract

### 4. Current missing connector / analytics layers

- [x] geen connector catalogus
- [x] geen HRIS auth/sync
- [x] geen webhook ingest contract
- [x] geen scheduled sync engine
- [x] geen analytics event schema
- [x] geen customer-facing lifecycle analytics surface

## Decision

### 1. Connectors And Lifecycle Analytics Stay In Readiness Mode

Beslissing:

- connectors en lifecycle analytics worden nog niet geopend als implementation track
- eerst moet expliciet vaststaan welke concrete product- of opsvraag deze laag rechtvaardigt

### 2. Current Import And Delivery Reality Stays The Truth

Beslissing:

- de huidige datarealiteit blijft voorlopig leidend:
  - handmatige import
  - gecontroleerde campaign setup
  - assisted delivery progression
  - explicit learning follow-through

Niet toegestaan:

- buyer-facing of intern framen alsof Verisight al een geïntegreerd people-data platform is

### 3. A First Connector Layer Must Start With Narrow Ingest, Not Broad Ecosystem Breadth

Beslissing:

- als connectors later openen, moet een eerste scope extreem smal zijn

Bijvoorbeeld:

- één duidelijk gegevenspad
- één beperkte import-/syncvraag
- één klein trust- en privacycontract

Niet:

- connector marketplace
- multi-system sync orchestration
- brede ecosystem positioning

### 4. A First Analytics Layer Must Start With Operational Or Management Usefulness

Beslissing:

- als lifecycle analytics later openen, moeten ze eerst gaan over:
  - betere handoff visibility
  - duidelijkere delivery/status inzichten
  - betere learning closure
  - concretere management follow-through

Niet meteen over:

- algemene telemetry
- behavioural segmentation
- executive analytics breadth
- automated recommendations engine

### 5. Connectors And Analytics May Not Invent A New Product Category

Beslissing:

- een latere ingestie- of analyticslaag mag de huidige suite niet ombuigen tot:
  - HRIS platform
  - engagement analytics suite
  - employee journey operating system

zonder een aparte expliciete product- en strategybeslissing

## Connectors / Analytics Boundaries To Lock

### 1. What The Current Data Layer Already Supports

Te erkennen als huidige waarheid:

- respondentimport
- campaign execution
- stats and reporting per campaign
- assisted lifecycle progression
- learning follow-through

### 2. What The Current Data Layer Does Not Yet Support

Nog niet te claimen:

- live sync
- system integrations
- ingest pipelines
- lifecycle event streams
- analytics-grade product telemetry

### 3. What A Future First Connector Layer May Support

Toegestane eerste scope, als later vrijgegeven:

- kleine, expliciete importverlichting
- één smal external data contract
- duidelijke operatorcontrole op ingestie

### 4. What A Future First Connector Layer May Not Support

Niet toegestane eerste scope:

- autonomous sync ecosystems
- many-to-many integrations
- background orchestration fabric
- connector-driven product expansion

### 5. What A Future First Analytics Layer May Support

Toegestane eerste scope, als later vrijgegeven:

- beperkte operational analytics
- handoff/readiness inzichten
- follow-up completion visibility
- campaign-to-learning continuity

### 6. What A Future First Analytics Layer May Not Support

Niet toegestane eerste scope:

- broad executive BI layer
- self-serve analytics studio
- employee lifecycle telemetry platform
- cross-product recommendation systems

## Key Changes

- connectors en lifecycle analytics zijn nu bestuurlijk begrensd als readiness-vraag
- de huidige assisted data- en importrealiteit is expliciet benoemd als voldoende voor nu
- een latere eerste connector- of analyticslaag moet klein, trust-aware en productgedragen blijven
- brede integratie- of dashboardambitie blijft expliciet geblokkeerd

## Belangrijke Interfaces / Contracts

### 1. Current Data Intake Contract

Blijft leidend:

- handmatige respondentimport
- gecontroleerde campaign setup
- route- en productbewuste uitvoering

### 2. Current Lifecycle Contract

Blijft leidend:

- delivery lifecycle stages
- explicit first value / management use separation
- learning closure als bewuste eindstatus

### 3. Future Connector Candidate Contract

Een latere eerste connectorlaag mag hoogstens modelleren:

- small-scope ingest
- operator-reviewed sync/import
- expliciete external data boundary

Nog niet:

- connector ecosystem
- broad sync jobs
- integration-led product behaviour

### 4. Future Analytics Candidate Contract

Een latere eerste analyticslaag mag hoogstens modelleren:

- operational visibility
- bounded lifecycle insights
- follow-through continuity

Nog niet:

- telemetry platform
- BI suite
- automated insight fabric

## Primary Reference Surfaces

- [PHASE_NEXT_STEP_22_SCALE_UP_READINESS_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_22_SCALE_UP_READINESS_GATE_PLAN.md)
- [PHASE_NEXT_STEP_21_DELIVERY_OPS_AND_SUPPORT_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_21_DELIVERY_OPS_AND_SUPPORT_HARDENING_PLAN.md)
- [PHASE_NEXT_STEP_24_IDENTITY_AND_ENTERPRISE_CONTROLS_READINESS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_24_IDENTITY_AND_ENTERPRISE_CONTROLS_READINESS_PLAN.md)
- [models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [client-onboarding.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.ts)
- [ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
- [beheer/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.tsx)
- [beheer/klantlearnings/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/klantlearnings/page.tsx)

## Testplan

### Product acceptance

- [x] Deze stap verandert geen productaanbod of suitepositionering.
- [x] Connectors en analytics worden niet verward met nieuwe productcategorieën.
- [x] Assisted suite truth blijft intact.

### Commercial acceptance

- [x] Er wordt geen platformclaim geopend die de huidige suite niet draagt.
- [x] Integratie- of analyticsbreedte wordt niet impliciet verkocht.
- [x] Route- en outputlogica blijven belangrijker dan dataverzameling.

### Operational acceptance

- [x] De huidige import-, delivery- en learninglagen blijven de praktische waarheid.
- [x] Deze stap opent nog geen extra privacy-, sync- of opscomplexiteit.
- [x] Latere analytics blijft ondergeschikt aan echte handoff- en managementvragen.

### Codebase acceptance

- [x] Dit document sluit aan op de huidige codebase met importflows, delivery lifecycle en learning dossiers.
- [x] Dit document opent nog geen implementation wave.
- [x] Dit document forceert geen premature connector- of analyticsarchitectuur.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor connectors and lifecycle analytics readiness.
- [x] De grens tussen huidige assisted datarealiteit en latere ingest/analytics is expliciet.
- [x] De volgende toegestane stap is helder begrensd.

## Assumptions / Defaults

- de huidige suite heeft nu meer baat bij betere besluitvorming dan bij meer data-ingest
- een eerste connectorlaag hoort ingestie te versmallen of verlichten, niet productbreedte te openen
- een eerste analyticslaag hoort operationele of managementmatige duidelijkheid te vergroten, niet dashboardvolume
- privacy, trust en interpretatie moeten zwaarder wegen dan integratie-ambitie
- na deze stap hoort eerst een afsluitende scale-up sequence gate te volgen, niet meteen build

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_26_POST_READINESS_SEQUENCE_AND_IMPLEMENTATION_GATE_PLAN.md`

Er is nog geen build permission voor:

- connectors implementation
- lifecycle analytics implementation
- sync jobs
- integration platform work
- telemetry platform work
