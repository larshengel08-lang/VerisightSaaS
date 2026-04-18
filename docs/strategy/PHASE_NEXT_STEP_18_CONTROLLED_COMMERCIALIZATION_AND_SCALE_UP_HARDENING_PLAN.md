# Phase Next Step 18 - Controlled Commercialization And Scale-Up Hardening Plan

## Title

Open a controlled commercialization and scale-up hardening track for the current Verisight suite so the now-stable seven-route portfolio can sell, qualify, and scale more cleanly without reopening premature product expansion or platform breadth.

## Korte Summary

Na de uitvoering van de seven-route suite hardening in [SEVEN_ROUTE_SUITE_HARDENING_IMPLEMENTATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SEVEN_ROUTE_SUITE_HARDENING_IMPLEMENTATION_PLAN.md) is de actuele live suite weer contractueel en QA-matig op orde:

- zeven buyer-facing live routes
- zes runtime `scan_type`-producten
- buyer-facing route smoke groen
- regressies, build, typegen en typecheck groen
- contactdrift rond `leadership` opgelost

De eerstvolgende logische stap is nu niet:

- nog een productlijn openen
- een brede SaaS-platformlaag bouwen
- billing, checkout of entitlements vroeg openzetten

Maar juist:

- de suite commerciëler en operationeel scherper maken
- de routekeuze, pricing discipline, lead qualification en delivery handoff verder consolideren
- pas daarna beslissen welke schaalcomponenten echt nodig zijn en in welke volgorde

De kernkeuze van deze stap is daarom:

- Verisight gaat nu een `controlled commercialization and scale-up hardening` fase in
- die fase blijft `core-first`, decision-driven en assisted
- de eerstvolgende winst moet komen uit betere suitebruikbaarheid, niet uit meer breadth
- scale-up betekent voorlopig: scherpere commercial architecture, lead routing, qualification, delivery controls en ops-readiness
- scale-up betekent voorlopig nadrukkelijk niet: self-serve SaaS, checkout-first growth of enterprise breadth zonder directe productreden

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

### 1. The suite is now broad enough that commercial clarity matters more than more product breadth

De actuele buyer-facing suite in [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts) bestaat nu uit:

- twee kernproducten
- één portfolioroute
- vier bounded follow-on routes

Dat is functioneel rijk genoeg om nu eerder commerciële en operationele frictie te veroorzaken dan productschaarste.

### 2. The current pricing and funnel layer is already productized enough to sharpen further

De huidige codebase en actieve docs laten al een duidelijke assisted productvorm zien:

- pricing blijft route-gedreven in [tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- de contactflow is route-aware in [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- de funnel- en handofflaag is al expliciet vastgelegd in [CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md)
- pricing en packaging zijn al bewust niet-SaaS gehouden in [PRICING_AND_PACKAGING_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md)

De eerstvolgende stap is daarom geen net-nieuwe commerciële architectuur verzinnen, maar de bestaande laag gecontroleerd verharden.

### 3. Scale-up risk now comes more from messy operations and diffuse selling than from technical under-building

De grootste risico’s zitten nu waarschijnlijk in:

- te veel follow-on keuze zonder scherpe routekwalificatie
- te losse handoff van kennismaking naar intake en delivery
- te weinig expliciete suitebrede acceptatie voor pricing, CTA, routeadvies en ops-uitzonderingen
- te vroege neiging om billing, plans, entitlements of enterprise controls te openen zonder bewezen directe noodzaak

### 4. The repo still does not justify premature SaaS expansion

De huidige implementatie draagt nog niet:

- self-serve checkout
- subscriptions of seats
- entitlements
- SSO / enterprise identity hardening
- volwaardige billing accounts
- generieke control plane

Dat betekent dat scale-up nu gecontroleerd moet starten bij de lagen die al bestaan:

- commercial architecture
- funnel and qualification
- delivery and support controls
- ops and acceptance

## Current Implementation Baseline

### 1. Current suite reality

- [x] zeven buyer-facing live routes bestaan nu publiek
- [x] zes runtime `scan_type`-producten bestaan nu technisch
- [x] `ExitScan` blijft de primaire wedge
- [x] `RetentieScan` blijft de enige situationeel primaire uitzondering
- [x] `Combinatie` blijft route-only
- [x] follow-on routes blijven bounded en `op aanvraag`

### 2. Current commercial architecture reality

- [x] publieke prijsankers zijn aanwezig voor de kernproducten
- [x] follow-on routes blijven quote-only
- [x] contactflow is route-aware en `ExitScan`-default
- [x] buyer-facing surfaces zijn recent suitebreed gehard

### 3. Current delivery and ops reality

- [x] assisted delivery is nog steeds de verkochte waarheid
- [x] contact requests, campaign delivery records en learning dossiers bestaan al als operationele objecten
- [x] de suite kent nog geen self-serve customer account, billing account of entitlementlaag

### 4. Current scale-up constraints

- [x] er is nog geen checkout, plans- of subscriptionlaag
- [x] er is nog geen enterprise identitylaag
- [x] er is nog geen generieke connectors- of ingestarchitectuur
- [x] er is nog geen harde suitebrede commercialization readiness baseline na de recente suite-uitbreiding

## Decision

### 1. Controlled Commercialization Opens Before Any New Product Expansion

Beslissing:

- de volgende groeifase is nu commercialization en scale-up hardening
- er opent geen nieuwe productlijn voordat deze fase bestuurlijk is doorlopen
- commercialization wordt behandeld als een gecontroleerde suitekwaliteitstrack, niet als losse sales- of growth-experimenten

### 2. Commercialization Starts With Architecture, Not With Billing

Beslissing:

- de commercialization-track begint bij:
  - pricing discipline
  - CTA and funnel discipline
  - route qualification
  - intake and delivery handoff
  - ops and support readiness
- de commercialization-track begint nadrukkelijk niet bij:
  - Stripe
  - checkout
  - subscriptions
  - plans/seats
  - enterprise controls

Rationale:

- de huidige suite heeft eerst een strakkere verkoop- en uitvoeringsmachine nodig
- billing zonder scherp genoeg route- en deliverymodel zou product- en opsschuld verharden

### 3. The Commercialization Sequence Must Stay One-Wave-At-A-Time

Beslissing:

- de track wordt in precies deze volgorde voorbereid:
  1. commercial architecture hardening
  2. lead qualification and intake hardening
  3. delivery / ops / support handoff hardening
  4. pas daarna een scale-up readiness gate

- er mag maar één actieve commercialization wave tegelijk lopen
- geen parallelle uitbouw van billing, SSO of enterprise controls tijdens wave 1 of 2

### 4. Core-First Selling Remains The Commercial Backbone

Beslissing:

- `ExitScan` blijft default first route
- `RetentieScan` blijft de enige expliciete uitzondering
- `Combinatie` blijft tussenroute en geen standaardpackage
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` blijven kleinere, vervolg-gedreven routes

Niet toegestaan:

- de suite als brede people-catalogus verkopen
- follow-on routes publiek als parallelle eerste koop behandelen
- CTA’s of pricingstructuren laten schuiven naar seven-choice shopping

### 5. Controlled Scale-Up Means Operational Repeatability First

Beslissing:

- scale-up readiness wordt voorlopig gedefinieerd als:
  - duidelijkere qualification
  - strakkere routekeuze
  - beter voorspelbare intake
  - heldere owner/handoff/exceptions
  - suitebrede acceptance en smoke voor commerciële en operationele oppervlakken

- scale-up readiness wordt voorlopig niet gedefinieerd als:
  - self-serve onboarding
  - automatische provisioning
  - enterprise procurement-readiness
  - connector marketplace

### 6. Billing, SSO, Enterprise Controls And Connectors Stay Blocked Behind A Later Gate

Beslissing:

- de volgende schaalcomponenten blijven expliciet geblokkeerd totdat een latere gate ze vrijgeeft:
  - billing / checkout
  - identity hardening / SSO
  - connector auth en echte ingest
  - lifecycle analytics
  - audit logging / enterprise controls

Rationale:

- die lagen horen bij een latere fase 7-uitbreiding
- de huidige suite moet eerst commercieel en operationeel strakker landen

## Controlled Commercialization Sequence

### 1. Commercial Architecture Hardening

Doel:

- de bestaande pricing-, CTA-, route- en suitecopylaag verder aanscherpen rond de actuele zeven-route werkelijkheid

Binnen scope:

- pricing discipline
- routekeuze
- CTA hierarchy
- copy consistency tussen home, producten, tarieven, vertrouwen en contact
- follow-on differentiation

Niet binnen scope:

- nieuwe routes
- checkout
- plans
- bundle mechanics

### 2. Lead Qualification And Intake Hardening

Doel:

- zorgen dat een lead niet alleen route-aware binnenkomt, maar ook sneller decision-ready en handoff-ready wordt

Binnen scope:

- qualification states
- ops triage
- handoff notes
- intake readiness
- route-specific next steps

Niet binnen scope:

- CRM migration
- outbound automation platform
- full revops rebuild

### 3. Delivery / Ops / Support Hardening

Doel:

- de bestaande assisted deliverylaag voorspelbaarder maken over alle live routes

Binnen scope:

- delivery checkpoints
- exception handling
- support and operator states
- consistent first-value framing
- suite-wide operational acceptance

Niet binnen scope:

- self-serve provisioning
- enterprise support tooling
- multi-tenant account re-architecture

### 4. Scale-Up Readiness Gate

Doel:

- expliciet beoordelen of Verisight daarna pas klaar is voor:
  - billing
  - checkout
  - identity hardening
  - enterprise controls
  - deeper SaaS operationalization

Beslissing:

- deze readiness gate komt pas ná de eerste drie commercialization tracks

## Key Changes

- commercialization wordt nu formeel de volgende groeifase
- de volgende winst verschuift van product breadth naar suite sellability and repeatability
- scale-up wordt nu smaller en realistischer gedefinieerd
- billing en enterprise-breadth blijven geblokkeerd achter een latere gate
- one-wave-at-a-time governance blijft intact

## Belangrijke Interfaces / Contracts

### 1. Commercial Hierarchy Contract

- `ExitScan = default first route`
- `RetentieScan = explicit primary exception`
- `Combinatie = portfolio route only`
- `Pulse | TeamScan | Onboarding 30-60-90 | Leadership Scan = bounded follow-on routes`

### 2. Contact And Qualification Contract

- route-aware lead capture blijft verplicht
- qualification moet routekeuze verder verfijnen, niet verbreden
- `nog-onzeker` blijft keuzehulp en geen diffuse catch-all salesroute

### 3. Pricing And Packaging Contract

- kernproducten houden de publieke ankers
- follow-on routes blijven `op aanvraag`
- geen plan-, seat- of subscriptiontaal
- geen bundle-discount default

### 4. Delivery Truth Contract

- assisted delivery blijft de verkochte waarheid
- first-value messaging moet blijven aansluiten op bestaande response-, report- en handoffrealiteit
- geen self-serve belofte zonder latere expliciete gate

### 5. Scale-Up Block Contract

Geblokkeerd tot latere gate:

- billing
- checkout
- SSO
- enterprise controls
- connectors
- advanced lifecycle analytics

## Primary Reference Surfaces

- [SEVEN_ROUTE_SUITE_HARDENING_IMPLEMENTATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SEVEN_ROUTE_SUITE_HARDENING_IMPLEMENTATION_PLAN.md)
- [PRICING_AND_PACKAGING_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md)
- [CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CUSTOMER_JOURNEY_AND_FUNNEL_ALIGNMENT_PLAN.md)
- [tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- [marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [schema.sql](/C:/Users/larsh/Desktop/Business/Verisight/supabase/schema.sql)

## Testplan

### Product acceptance

- [x] De suite blijft productmatig `core-first`.
- [x] Controlled commercialization opent geen nieuwe productbreedte.
- [x] Follow-on routes blijven kleiner en vervolg-gedreven.

### Commercial acceptance

- [x] Commercialization start bij route, pricing, funnel en handoff.
- [x] De suite schuift niet naar catalogus-, bundle- of checkout-first gedrag.
- [x] Scale-up wordt kleiner en realistischer gedefinieerd dan “meer SaaS”.

### Operational acceptance

- [x] Assisted delivery blijft de verkochte waarheid.
- [x] Ops en handoff worden erkend als eerste schaalvoorwaarde.
- [x] Er wordt nog geen enterprise- of billinglaag verondersteld die niet bestaat.

### Codebase acceptance

- [x] Dit document sluit aan op de huidige zeven-route suite en bestaande funnel/pricing reality.
- [x] Dit document opent nog geen implementation wave.
- [x] Dit document forceert geen platformarchitectuur die nog niet nodig is.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor de volgende groeifase na suite hardening.
- [x] De sequens van commercialization naar latere scale-up is expliciet.
- [x] De volgende toegestane stap is helder begrensd.

## Assumptions / Defaults

- de grootste winst zit nu in betere suiteverkoop en betere operationele herhaalbaarheid
- de huidige assisted productvorm is een sterkte, niet een tijdelijk gebrek
- routekeuze en qualification zijn nu belangrijker dan extra breadth
- scale-up moet voorlopig gelezen worden als `better repeatability`, niet als `bigger software platform`
- later fase-7-werk blijft mogelijk, maar is nu bewust nog niet vrijgegeven

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_19_COMMERCIAL_ARCHITECTURE_HARDENING_PLAN.md`

Er is nog geen build permission voor:

- billing
- checkout
- SSO
- enterprise controls
- een nieuwe productlijn
