# Phase Next Step 22 - Scale-Up Readiness Gate Plan

## Title

Define the explicit gate Verisight must pass before opening any post-commercialization scale-up work such as billing, checkout, identity hardening, enterprise controls, connectors, or lifecycle analytics.

## Korte Summary

Na [PHASE_NEXT_STEP_21_DELIVERY_OPS_AND_SUPPORT_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_21_DELIVERY_OPS_AND_SUPPORT_HARDENING_PLAN.md) is nu expliciet vastgezet hoe de huidige suite commercieel, qualification-wise en assisted-delivery-wise moet landen.

De volgende logische stap is nu niet:

- direct billing of checkout bouwen
- een account-, entitlement- of subscriptionlaag openen
- SSO of enterprise controls toevoegen
- connectoringestie of lifecycle analytics verbreden

Maar juist:

- vastzetten wanneer Verisight daar pas echt klaar voor is
- beoordelen welke readiness-signalen eerst groen moeten zijn
- voorkomen dat schaalcomponenten eerder openen dan de huidige suite kan dragen

De kernkeuze van deze stap is daarom:

- er komt nu een expliciete `scale-up readiness gate`
- die gate blijft nog gesloten totdat de huidige suite aantoonbaar stabiel, verkoopbaar en operationeel herhaalbaar is
- scale-up work mag pas openen als product, funnel, qualification, delivery, support en suite acceptance gezamenlijk sterk genoeg zijn
- de eerstvolgende mogelijke scale-up track wordt pas na deze gate een aparte readiness/subphase, niet automatisch een buildwave

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

### 1. The repo now has commercialization structure, but not scale-up infrastructure

De huidige codebase draagt nu wel:

- route-aware marketing en contactflow
- assisted qualification via `ContactRequest`
- assisted delivery via `CampaignDeliveryRecord`
- learning follow-through via `PilotLearningDossier`
- een stabiele zeven-route suite met zes runtime-producten

Maar nog niet:

- billing accounts
- subscriptions
- checkout
- identity/SSO
- enterprise policy/audit controls
- connector auth of ingestie
- lifecycle analytics als productlaag

Dat betekent dat een readiness gate nu nodig is om het verschil hard te markeren tussen `suite die werkt` en `suite die schaalcomponenten kan dragen`.

### 2. The main risk has shifted from product expansion to premature operational complexity

Nieuwe productbreedte is nu niet de directe bottleneck. Het grootste risico is juist:

- te vroeg extra infrastructuur openen
- bestaande assisted waarheden ondermijnen
- verwachtingen verhogen zonder dat delivery, support of qualification dat al kunnen dragen

### 3. Scale-up work should be earned by repeatability, not by ambition

De juiste vraag is nu niet:

- “welke SaaS-component kunnen we hierna bouwen?”

Maar:

- “welke schaalcomponent is pas gerechtvaardigd nadat de huidige suite herhaalbaar en bestuurbaar genoeg is?”

### 4. A gate is needed so later scale work stays sequence-aware

Zonder expliciete gate zou de volgende stap makkelijk diffuus worden:

- een beetje billing
- een beetje enterprise
- een beetje analytics
- een beetje connectors

Dat zou haaks staan op het huidige operating model van precies één gecontroleerde stap tegelijk.

## Current Implementation Baseline

### 1. Current commercial and qualification baseline

- [x] de suite is buyer-facing live als zeven-route portfolio
- [x] `ExitScan` blijft de default first route
- [x] `RetentieScan` blijft de enige primaire uitzondering
- [x] `Combinatie` blijft route-only
- [x] follow-on routes blijven bounded
- [x] `ContactRequest` bestaat als centrale qualification spine

### 2. Current delivery and support baseline

- [x] `CampaignDeliveryRecord` bestaat als assisted delivery spine
- [x] delivery checkpoints en exception statuses bestaan expliciet
- [x] `PilotLearningDossier` bestaat als learning closure laag
- [x] first value en first management use zijn bestuurlijk gescheiden

### 3. Current runtime and suite baseline

- [x] zes runtime `scan_type`-producten draaien binnen de bestaande campaign-centered runtime
- [x] zeven buyer-facing routes zijn suitebreed gehard
- [x] follow-on reportgrenzen zijn expliciet bounded
- [x] recente suite hardening heeft regressie-, build- en smoke-baseline opnieuw groen gezet

### 4. Current missing scale-up layers

- [x] er is nog geen billingobject of subscriptionmodel
- [x] er is nog geen checkoutflow
- [x] er is nog geen customer identity- of SSO-laag
- [x] er is nog geen entitlementlaag
- [x] er is nog geen audit logging of enterprise control surface
- [x] er is nog geen connector auth- of ingestielaag
- [x] er is nog geen lifecycle analytics-stack als product- of opslaag

## Decision

### 1. Scale-Up Work Stays Blocked Until A Readiness Gate Is Explicitly Passed

Beslissing:

- na commercialization hardening opent nog geen automatisch scale-up buildspoor
- eerst geldt een expliciete readiness gate
- pas als die gate inhoudelijk groen beoordeeld is, mag een volgende scale-up subphase worden geopend

### 2. Readiness Is Defined As Cross-Layer Stability, Not As Technical Curiosity

Beslissing:

- scale-up readiness wordt nu gedefinieerd als een combinatie van:
  - producthelderheid
  - commercial discipline
  - qualification discipline
  - assisted delivery repeatability
  - support and exception control
  - suite acceptance and regression confidence

Niet als:

- “we zouden Stripe kunnen koppelen”
- “we zouden SSO kunnen toevoegen”
- “we zouden analytics kunnen loggen”

### 3. Billing And Checkout Are Not The Default Next Step, But The Default First Candidate

Beslissing:

- als deze gate later groen wordt, is de eerste logische vervolgsubfase:
  - `billing and checkout readiness`

Niet meteen:

- enterprise controls
- connectors
- analytics
- SSO-first uitbreiding

Rationale:

- billing en checkout vormen de kleinste betekenisvolle grens tussen assisted verkoop en meer schaalbare commerciële afhandeling
- maar ook die laag mag alleen openen als de suite eerst operationeel hard genoeg staat

### 4. Identity, Enterprise Controls, Connectors, And Analytics Stay Behind Separate Later Gates

Beslissing:

- zelfs na een latere billing/checkout readiness-subfase blijven apart geblokkeerd:
  - identity hardening / SSO
  - enterprise controls / audit logging
  - connector auth / ingestie
  - lifecycle analytics

Rationale:

- deze lagen hebben andere risico’s, andere contracten en andere productreden
- ze mogen niet meeliften op een billingbesluit

### 5. The Current Assisted Product Truth Must Survive Any Future Scale-Up

Beslissing:

- geen enkele latere scale-up subphase mag de huidige assisted productwaarheid impliciet ontkennen
- als een toekomstige laag die waarheid verandert, moet dat een aparte productbeslissing zijn en geen technische zijroute

## Readiness Criteria To Lock

### 1. Product Readiness

Vast te houden:

- de suite moet buyer-facing helder blijven
- follow-on routes moeten bounded blijven
- er mag geen diffuse catalogus- of planstructuur ontstaan
- claims, output en deliverywaarheid moeten aligned blijven

### 2. Commercial Readiness

Vast te houden:

- pricing, CTA en routekeuze moeten als één decision system blijven werken
- kernroutes moeten makkelijker te kiezen blijven dan follow-on routes
- contactflow en intake moeten routeversmalling ondersteunen, niet route-explosie

### 3. Qualification Readiness

Vast te houden:

- routekeuze moet door qualification verder bevestigd of versmald worden
- `nog-onzeker` mag geen structureel eindstation zijn
- handoff naar delivery moet expliciet, leesbaar en owner-aware blijven

### 4. Delivery And Support Readiness

Vast te houden:

- first value moet operationeel expliciet bevestigd blijven
- first management use moet apart bevestigd blijven
- exceptions moeten zichtbaar en structureel blijven
- learning closure moet bewust en suitebreed herhaalbaar blijven

### 5. QA And Acceptance Readiness

Vast te houden:

- suitekritische regressies moeten stabiel groen zijn
- buyer-facing smoke moet voor live routes herhaalbaar zijn
- runtime smoke moet voor alle actieve `scan_type`-producten herhaalbaar zijn
- reportgrenzen en routegrenzen moeten expliciet bewaakt blijven

## Scale-Up Layers That Stay Blocked At This Gate

### 1. Billing / Checkout

Geblokkeerd totdat:

- pricing- en qualificationgrenzen hard genoeg zijn
- assisted delivery en exception handling bewezen repeatable zijn
- intake en handoff niet meer diffuus zijn

### 2. Identity Hardening / SSO

Geblokkeerd totdat:

- er een echte productreden is voor customer identity breadth
- de huidige organization- en operatorflows onvoldoende blijken
- enterprise identity niet alleen “netjes voor later” is

### 3. Enterprise Controls / Audit Logging

Geblokkeerd totdat:

- enterprise requirements concreet en productgedragen zijn
- governance en accountability in de huidige suite aantoonbaar onvoldoende zijn

### 4. Connector Auth / Real Ingest

Geblokkeerd totdat:

- er een directe productreden is voor externe data-inname
- ingestion niet vooruitloopt op productwaarheid en customer trust

### 5. Lifecycle Analytics

Geblokkeerd totdat:

- commercialization en assisted delivery eerst stabiel genoeg zijn
- analytics voortkomt uit echte management- of opsvragen, niet uit dashboardhonger

## Key Changes

- scale-up wordt nu expliciet gated in plaats van impliciet “volgende logische stap”
- readiness wordt cross-layer gedefinieerd en niet tool- of platformgedreven
- billing/checkout wordt benoemd als eerste kandidaat, niet als automatisch gevolg
- identity, enterprise, connectors en analytics blijven apart geblokkeerd
- het operating model van één stap tegelijk blijft ook na commercialization intact

## Belangrijke Interfaces / Contracts

### 1. Readiness Gate Contract

Deze gate beoordeelt pas groen als gezamenlijk sterk genoeg zijn:

- commercial architecture
- lead qualification and intake
- delivery / ops / support discipline
- suite QA and acceptance baseline

### 2. Current Allowed Commercial/Runtime Truth

Blijft leidend:

- zeven buyer-facing routes
- zes runtime `scan_type`-producten
- `Combinatie` route-only
- assisted delivery als uitvoeringswaarheid
- bounded follow-on outputs

### 3. Blocked Scale-Up Contract

Nog niet vrijgegeven:

- billing
- checkout
- subscriptions
- SSO
- entitlements
- audit controls
- connectors
- lifecycle analytics

### 4. Next-Candidate Contract

Als deze gate later groen wordt, dan is de eerstvolgende toegestane readiness-subphase:

- `PHASE_NEXT_STEP_23_BILLING_AND_CHECKOUT_READINESS_PLAN.md`

Niet automatisch:

- build
- implementation wave
- bredere enterprise expansion

## Primary Reference Surfaces

- [PHASE_NEXT_STEP_18_CONTROLLED_COMMERCIALIZATION_AND_SCALE_UP_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_18_CONTROLLED_COMMERCIALIZATION_AND_SCALE_UP_HARDENING_PLAN.md)
- [PHASE_NEXT_STEP_19_COMMERCIAL_ARCHITECTURE_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_19_COMMERCIAL_ARCHITECTURE_HARDENING_PLAN.md)
- [PHASE_NEXT_STEP_20_LEAD_QUALIFICATION_AND_INTAKE_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_20_LEAD_QUALIFICATION_AND_INTAKE_HARDENING_PLAN.md)
- [PHASE_NEXT_STEP_21_DELIVERY_OPS_AND_SUPPORT_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_21_DELIVERY_OPS_AND_SUPPORT_HARDENING_PLAN.md)
- [SEVEN_ROUTE_SUITE_HARDENING_IMPLEMENTATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SEVEN_ROUTE_SUITE_HARDENING_IMPLEMENTATION_PLAN.md)
- [models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- [ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
- [beheer/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.tsx)
- [beheer/contact-aanvragen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx)
- [beheer/klantlearnings/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/klantlearnings/page.tsx)

## Testplan

### Product acceptance

- [x] Deze stap opent nog geen nieuw product of nieuwe productbelofte.
- [x] Assisted truth en bounded follow-on logic blijven intact.
- [x] Scale-up wordt niet verward met meer portfolio-breedte.

### Commercial acceptance

- [x] Billing/checkout is nog niet vrijgegeven.
- [x] Core-first selling blijft leidend.
- [x] Commercial discipline blijft voorwaarde vóór schaalcomponenten.

### Operational acceptance

- [x] Delivery, support en learning blijven randvoorwaarde voor latere schaal.
- [x] Exceptions en handoff blijven eerst operationele waarheid.
- [x] Deze stap introduceert nog geen automation- of platformschuld.

### Codebase acceptance

- [x] Dit document sluit aan op de huidige codebase waarin billing-, identity- en enterprise-lagen nog ontbreken.
- [x] Dit document opent nog geen implementation wave.
- [x] Dit document forceert geen nieuwe infrastructuur zonder productreden.

### Documentation acceptance

- [x] Dit document functioneert als expliciete scale-up gate.
- [x] De blokkerende randvoorwaarden zijn concreet benoemd.
- [x] De volgende toegestane stap is helder begrensd.

## Assumptions / Defaults

- de huidige suite moet eerst commercieel en operationeel herhaalbaar genoeg zijn vóór bredere schaal
- billing/checkout is de kleinste logische eerste scale-up candidate, maar nog niet automatisch gerechtvaardigd
- enterprise, identity, connectors en analytics hebben elk een eigen latere gate nodig
- assisted delivery blijft voorlopig een sterkte, niet een tijdelijk tekort
- scale-up readiness betekent nu vooral `minder frictie en meer bestuurbaarheid`, niet `meer technische lagen`

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_23_BILLING_AND_CHECKOUT_READINESS_PLAN.md`

Er is nog geen build permission voor:

- billing implementation
- checkout implementation
- subscriptions
- SSO
- enterprise controls
- connectors
- lifecycle analytics
- een nieuwe productlijn
