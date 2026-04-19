# Phase Next Step 23 - Billing And Checkout Readiness Plan

## Title

Define the conditions under which Verisight may later open a bounded billing and checkout track without collapsing the current assisted pricing, route selection, and delivery truth into premature SaaS mechanics.

## Korte Summary

Na [PHASE_NEXT_STEP_22_SCALE_UP_READINESS_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_22_SCALE_UP_READINESS_GATE_PLAN.md) is nu expliciet vastgezet dat scale-up niet automatisch opent en dat billing/checkout hooguit de eerste logische candidate-subphase is.

De volgende logische stap is daarom:

- expliciet vastzetten wat `billing and checkout readiness` in de huidige Verisight-realiteit zou betekenen

Niet:

- Stripe meteen aansluiten
- self-serve checkout live zetten
- seats, plans of subscriptions introduceren
- quote-only follow-on routes ombouwen tot publieke winkelmand

De kernkeuze van deze stap is daarom:

- billing/checkout blijft voorlopig een readiness-vraag en nog geen buildbesluit
- iedere latere billinglaag moet passen bij de huidige assisted pricing truth
- een eerste commerciële transactieflow mag pas openen als die de huidige route- en handofflogica niet stukmaakt
- een eventuele eerste billing/checkout-implementatie moet kleiner zijn dan een volwaardig SaaS-planmodel

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

### 1. The current suite is priced, but not yet billed as software

De huidige repo heeft al een duidelijke pricing- en packaginglaag:

- publieke prijsankers op [tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- assisted packaging truth in [PRICING_AND_PACKAGING_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md)
- quote-only follow-on routes
- route-aware contact- en intakeflows

Maar de repo heeft nog niet:

- billing accounts
- invoices
- checkout sessions
- subscriptions
- plans
- entitlements

Dat betekent dat readiness nu eerst bestuurlijk scherp moet worden, voordat er technisch iets wordt geopend.

### 2. The biggest billing risk is semantic, not technical

De grootste fout zou nu niet een gemiste Stripe-integratie zijn, maar:

- pricinglogica laten schuiven van `assisted traject` naar `SaaS-plan`
- quote-only routes publiek afprijzen alsof ze parallelle instappen zijn
- delivery en qualification buitenspel zetten door checkout te vroeg centraal te maken

### 3. Billing only makes sense if it respects the current route hierarchy

De huidige commerciële waarheid blijft:

- `ExitScan` default first route
- `RetentieScan` expliciete primaire uitzondering
- `Combinatie` route-only
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` bounded follow-on

Een billing- of checkoutlaag mag die hiërarchie dus niet neutraliseren.

### 4. The first billing step should be smaller than full self-serve commerce

Als Verisight later billing opent, is de eerste logische vorm waarschijnlijk:

- gestructureerdere betaal- en bevestigingsflow voor een al gekozen assisted traject

Niet:

- publieke one-click aankoop voor de hele suite
- seat-based pricing
- usage billing
- subscription management

## Current Implementation Baseline

### 1. Current pricing and package truth

- [x] pricing is nu expliciet assisted en traject-gedreven
- [x] `ExitScan` en `RetentieScan` hebben publieke prijsankers
- [x] follow-on routes blijven `op aanvraag`
- [x] `Combinatie` blijft route-only en geen standaardbundel
- [x] pricing is nu bewust niet gemodelleerd als plan-, seat- of subscriptionstructuur

### 2. Current commercial and intake truth

- [x] routekeuze verloopt via marketing + contactflow + qualification
- [x] `ContactRequest` is de centrale pre-sales spine
- [x] assisted intake en operatorhints bestaan al
- [x] quotevorming en handoff blijven nu nog impliciet onderdeel van assisted verkoop

### 3. Current delivery truth

- [x] `CampaignDeliveryRecord` bestaat als assisted delivery spine
- [x] first value en first management use zijn expliciete milestones
- [x] outputdelivery is route-aware en bounded

### 4. Current missing billing layers

- [x] geen billing objectmodel in backend
- [x] geen checkout endpoint
- [x] geen invoice or payment status contract
- [x] geen subscription of renewal contract
- [x] geen entitlement logic
- [x] geen customer account model voor self-serve commerciële transacties

## Decision

### 1. Billing And Checkout Stay In Readiness Mode Until The Assisted Truth Can Survive Them

Beslissing:

- billing/checkout wordt nog niet geopend als implementation track
- eerst moet expliciet vaststaan dat een eerste commerciële transactielaag de huidige assisted route niet breekt

### 2. The First Billing Candidate Is Assisted Transaction Support, Not Self-Serve Product Commerce

Beslissing:

- een latere eerste billing-subphase mag alleen gaan over een begrensde commerciële afhandelingslaag voor reeds gekozen trajecten

Bijvoorbeeld:

- bevestigde route
- vast prijsanker of duidelijke quote
- begeleide handoff naar uitvoering

Niet:

- vrije productshopping
- dynamische bundels
- publiek planselectiescherm
- buyer-driven samenstelling van follow-on combinaties

### 3. Public Checkout Is Not Allowed For The Full Seven-Route Suite

Beslissing:

- als checkout later opent, dan niet meteen voor:
  - `Combinatie`
  - quote-only follow-on routes
  - complexe vervolgvormen

De eerste denkbare checkout-scope mag hoogstens gelden voor:

- een kleine set duidelijk afgebakende eerste trajecten

Rationale:

- de huidige suite is bewust niet ontworpen als zeven-route self-serve catalogus

### 4. Quote-Only Follow-On Routes Stay Quote-Only Until A Later Separate Decision

Beslissing:

- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` blijven voorlopig buiten elke directe checkoutscope
- ook `Combinatie` blijft buiten directe checkoutscope

Rationale:

- hun huidige waarde ligt in routehulp, duiding en assisted sequencing
- publieke checkout zou hun bounded positionering te snel neutraliseren

### 5. No Billing Design May Imply Seats, Licenses, Or Subscriptions By Default

Beslissing:

- een latere billinglaag mag niet impliciet overschakelen naar:
  - seats
  - plans
  - usage
  - subscriptions
  - always-on account entitlement

tenzij daar later een aparte expliciete product- en architectuurbeslissing voor volgt

### 6. Billing Readiness Must Be Earned By Route Confidence And Delivery Predictability

Beslissing:

- billing/checkout mag pas verder worden voorbereid als:
  - routekeuze klein en duidelijk genoeg is
  - pricingconsistentie stabiel is
  - qualification de eerste route betrouwbaar versmalt
  - delivery en exceptions voldoende voorspelbaar zijn

## Billing/Checkout Boundaries To Lock

### 1. What A Future Billing Layer May Support First

Toegestane eerste scope, als later vrijgegeven:

- assisted transaction capture voor beperkte kernroutes
- expliciete prijs- of quoteconfirmatie
- statusbewaking van commerciële akkoordfase
- handoff van commercieel akkoord naar deliverystart

### 2. What A Future Billing Layer May Not Support First

Niet toegestane eerste scope:

- abonnementen
- seat management
- usage metering
- customer self-serve plan changes
- cross-sell machine voor follow-on routes
- public bundling van meerdere productlijnen

### 3. What A Checkout Surface Must Preserve

Vast te houden:

- `ExitScan` blijft default first route
- `RetentieScan` blijft de expliciete uitzondering
- follow-on routes blijven kleiner en later
- qualification en assisted handoff blijven leidend

### 4. What Must Exist Before A Billing Build Is Justified

Vast te houden:

- expliciet billing-worthy routeframe
- heldere status tussen lead, quote, akkoord en deliverystart
- strakke pricing copy en routecopy
- operatorvriendelijke uitzondering- en herstelpaden

## Key Changes

- billing/checkout is nu bestuurlijk scherp begrensd als readiness-vraag
- een eerste billinglaag wordt expliciet kleiner gehouden dan full self-serve commerce
- follow-on routes en combinatie blijven buiten vroege checkoutscope
- pricingtruth, routehiërarchie en assisted handoff zijn nu harde randvoorwaarden voor elk later billingbesluit

## Belangrijke Interfaces / Contracts

### 1. Current Pricing Contract

Blijft leidend:

- `ExitScan` en `RetentieScan` hebben publieke prijsankers
- follow-on routes blijven `op aanvraag`
- pricing is traject-gedreven en assisted

### 2. Current Qualification Contract

Blijft leidend:

- routekeuze wordt eerst versmald via contact en intake
- `nog-onzeker` is geen checkoutpad
- `Combinatie` is alleen logisch als tweede vraag echt bestaat

### 3. Future Billing Candidate Contract

Een latere eerste billinglaag mag hoogstens modelleren:

- commerciële akkoordstatus
- transaction readiness
- handoff naar deliverystart

Nog niet:

- subscriptions
- entitlements
- renewals
- planbeheer

### 4. Checkout Block Contract

Nog expliciet geblokkeerd:

- publieke checkout voor follow-on routes
- publieke checkout voor combinatie
- self-serve suite catalogus
- seat/subscription framing

## Primary Reference Surfaces

- [PHASE_NEXT_STEP_22_SCALE_UP_READINESS_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_22_SCALE_UP_READINESS_GATE_PLAN.md)
- [PHASE_NEXT_STEP_19_COMMERCIAL_ARCHITECTURE_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_19_COMMERCIAL_ARCHITECTURE_HARDENING_PLAN.md)
- [PHASE_NEXT_STEP_20_LEAD_QUALIFICATION_AND_INTAKE_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_20_LEAD_QUALIFICATION_AND_INTAKE_HARDENING_PLAN.md)
- [PHASE_NEXT_STEP_21_DELIVERY_OPS_AND_SUPPORT_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_21_DELIVERY_OPS_AND_SUPPORT_HARDENING_PLAN.md)
- [PRICING_AND_PACKAGING_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md)
- [tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- [contact-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/contact-form.tsx)
- [models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)

## Testplan

### Product acceptance

- [x] Deze stap verandert geen productaanbod of productbelofte.
- [x] Billing wordt niet verward met een nieuwe productlijn.
- [x] Follow-on routes blijven bounded in commerciële positie.

### Commercial acceptance

- [x] Assisted pricing truth blijft intact.
- [x] Checkout opent niet impliciet voor de volledige suite.
- [x] Core-first selling blijft voorwaarde voor elk later billingbesluit.

### Operational acceptance

- [x] Qualification en delivery blijven randvoorwaarden voor transactie-opschaling.
- [x] Deze stap opent nog geen commerciële automationschuld.
- [x] Quote-only routes blijven buiten vroege self-serve scope.

### Codebase acceptance

- [x] Dit document sluit aan op de huidige codebase waarin billingobjecten en checkoutcontracten ontbreken.
- [x] Dit document opent nog geen implementation wave.
- [x] Dit document forceert geen premature Stripe- of subscriptionarchitectuur.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor billing/checkout readiness.
- [x] De grenzen van een eerste mogelijke billinglaag zijn concreet.
- [x] De volgende toegestane stap is helder begrensd.

## Assumptions / Defaults

- pricing blijft voorlopig traject-gedreven en assisted
- een eventuele eerste billinglaag hoort eerder bij commerciële afhandeling dan bij self-serve productgebruik
- follow-on routes zijn nu commercieel te contextafhankelijk voor directe checkout
- subscriptions, seats en entitlements hebben elk later een aparte rechtvaardiging nodig
- de kleinste logische volgende stap na dit document is nog steeds een nieuwe readiness-gate, niet meteen build

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_24_IDENTITY_AND_ENTERPRISE_CONTROLS_READINESS_PLAN.md`

Er is nog geen build permission voor:

- billing implementation
- checkout implementation
- subscriptions
- entitlements
- SSO
- enterprise controls
- connectors
- lifecycle analytics
