# Phase Next Step 28 - Billing And Checkout Implementation Gate Plan

## Title

Define the final gate that must be passed before Verisight may open a bounded billing and checkout implementation track for the current assisted suite.

## Korte Summary

Na [PHASE_NEXT_STEP_27_FIRST_SCALE_UP_IMPLEMENTATION_CHOICE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_27_FIRST_SCALE_UP_IMPLEMENTATION_CHOICE_PLAN.md) is nu expliciet vastgezet dat:

- `delay` een geldige uitkomst blijft
- `billing and checkout` de enige toegestane eerste scale-up candidate is
- geen andere scale-up track tegelijk mag openen

De volgende logische stap is daarom:

- expliciet vastzetten wanneer `billing and checkout` van candidate naar echte implementation track mag gaan

Niet:

- meteen builden
- checkout als productgegeven behandelen in plaats van commerciële afhandelingslaag
- subscriptions, seats of entitlements alvast meeliften

De kernkeuze van deze stap is daarom:

- billing/checkout krijgt nu een harde implementation gate
- die gate blijft nog dicht totdat de huidige suite en commerciële afhandeling sterk genoeg zijn
- als deze gate later groen wordt, opent eerst een apart implementation plan en nog niet meteen een buildwave

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

### 1. A first implementation track needs a stricter gate than a candidate decision

De keuze in stap 27 maakt `billing and checkout` hoogstens de eerste logische candidate. Dat is nog niet genoeg om te bouwen. Voor een echt implementatiespoor moeten we nog scherper vastzetten:

- welk probleem dit oplost
- hoe klein de eerste scope blijft
- wat expliciet niet mee mag schuiven

### 2. Billing is commercially adjacent, but product-semantically risky

Billing en checkout lijken op het eerste gezicht “slechts afhandeling”, maar ze kunnen de suite snel semantisch veranderen:

- van assisted trajecten naar productplannen
- van routekeuze naar winkelgedrag
- van guided vervolglogica naar catalogusdenken

Juist daarom is er nu een harde gate nodig.

### 3. The first billing scope must stay narrower than “Verisight can now be bought online”

Een eerste billinglaag mag later hoogstens betekenen:

- beperkte transaction support
- akkoord- en statusdiscipline
- strakkere commerciële handoff

Niet:

- volledige publieke checkout voor het portfolio
- abonnementen of licenties
- automatische entitlementlogica

### 4. This gate protects the suite against pseudo-SaaS drift

Zonder deze gate zou een billingtrack te snel kunnen ontsporen naar:

- subscriptions
- seats
- customer accounts
- bundle checkout
- follow-on self-serve upsell

Dat zou haaks staan op de huidige assisted, routegedreven suite.

## Current Implementation Baseline

### 1. Current commercial baseline

- [x] pricing en packaging zijn assisted en route-gedreven
- [x] `ExitScan` en `RetentieScan` hebben publieke prijsankers
- [x] follow-on routes blijven `op aanvraag`
- [x] `Combinatie` blijft route-only

### 2. Current operational baseline

- [x] qualification loopt via `ContactRequest`
- [x] delivery loopt via assisted handoff en `CampaignDeliveryRecord`
- [x] first value en management use zijn expliciete operationele mijlpalen

### 3. Current missing billing baseline

- [x] er is nog geen billing objectmodel
- [x] er is nog geen checkoutflow
- [x] er is nog geen payment status contract
- [x] er zijn nog geen subscriptions, seats of entitlements

## Decision

### 1. Billing And Checkout May Only Open As A Bounded Assisted Commerce Track

Beslissing:

- als billing/checkout later opent, mag dat alleen als begrensde assisted commerce track

Niet als:

- SaaS commerce layer
- portfolio checkout system
- public product purchasing engine

### 2. The First Billing Scope Must Stay Core-Route First

Beslissing:

- een eerste billing/checkout implementatiespoor mag alleen gericht zijn op duidelijk afgebakende kernroutes
- follow-on routes en `Combinatie` blijven buiten de eerste implementationscope

### 3. No Subscription, Seat, Or Entitlement Logic May Enter The First Track

Beslissing:

- de eerste track mag expliciet niet bevatten:
  - subscriptions
  - seats
  - usage billing
  - renewal engines
  - entitlement enforcement

### 4. The First Track Must Improve Commercial Handoff More Than It Improves Buyer Autonomy

Beslissing:

- als we billing/checkout openen, moet de eerste winst vooral zitten in:
  - helderder commercieel akkoord
  - betere status tussen lead, quote en deliverystart
  - strakkere assisted handoff

En niet in:

- meer self-service
- meer productkeuze
- minder operatorinmenging

### 5. A Separate Implementation Plan Still Comes Before Any Build Wave

Beslissing:

- ook na een groene implementation gate mag niet direct gebouwd worden
- eerst moet er een apart, decision-complete implementation plan komen voor de eerste billing/checkout-scope

## Implementation Gate Criteria To Lock

### 1. Problem Sharpness

Vast te houden:

- er moet een duidelijke commerciële frictie zichtbaar zijn die billing/checkout echt oplost
- “netter voor later” is geen voldoende reden

### 2. Scope Smallness

Vast te houden:

- de eerste billinglaag moet kleiner zijn dan full commerce
- de eerste checkoutlaag moet kleiner zijn dan publieke suiteverkoop

### 3. Route Safety

Vast te houden:

- `ExitScan` blijft default first route
- `RetentieScan` blijft de enige primaire uitzondering
- follow-on routes blijven bewust later en kleiner

### 4. Operational Safety

Vast te houden:

- qualification en delivery mogen niet worden omzeild
- exception handling moet expliciet blijven
- handoff naar uitvoering moet helderder worden, niet diffuser

### 5. Semantic Safety

Vast te houden:

- pricingtaal blijft trajecttaal
- checkout mag geen plan-, licentie- of seatframe introduceren
- Verisight mag niet buyer-facing als self-serve platform gaan aanvoelen

## Key Changes

- billing/checkout krijgt nu een formele implementation gate
- de eerste mogelijke billingtrack wordt nog smaller gemaakt dan de readiness-docs al deden
- subscriptions, seats en entitlements zijn opnieuw expliciet uitgesloten
- ook na een groene gate volgt eerst nog een implementation plan

## Belangrijke Interfaces / Contracts

### 1. Current Commerce Contract

Blijft leidend:

- pricing is assisted
- routes zijn hiërarchisch
- follow-on routes zijn niet direct checkoutbaar

### 2. First Billing Track Contract

Een latere eerste billingtrack mag hoogstens bevatten:

- bounded transaction support
- akkoordstatus
- handoff discipline

Niet:

- portfolio checkout
- SaaS subscriptions
- account entitlements

### 3. Post-Gate Contract

Zelfs na vrijgave opent eerst:

- `PHASE_NEXT_STEP_29_BOUNDED_BILLING_AND_CHECKOUT_IMPLEMENTATION_PLAN.md`

en nog niet:

- build wave
- billing code
- checkout code

## Primary Reference Surfaces

- [PHASE_NEXT_STEP_23_BILLING_AND_CHECKOUT_READINESS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_23_BILLING_AND_CHECKOUT_READINESS_PLAN.md)
- [PHASE_NEXT_STEP_27_FIRST_SCALE_UP_IMPLEMENTATION_CHOICE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_27_FIRST_SCALE_UP_IMPLEMENTATION_CHOICE_PLAN.md)
- [PRICING_AND_PACKAGING_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md)
- [tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- [contact-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/contact-form.tsx)
- [models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)

## Testplan

### Product acceptance

- [x] Deze stap verandert geen productaanbod.
- [x] Billing blijft ondergeschikt aan productwaarheid.
- [x] Follow-on routes blijven buiten vroege commerce scope.

### Commercial acceptance

- [x] De eerste billingtrack blijft assisted en bounded.
- [x] Er opent nog geen publieke suite-checkout.
- [x] Subscriptions, seats en entitlements blijven geblokkeerd.

### Operational acceptance

- [x] Qualification en delivery blijven leidend.
- [x] Handoff discipline blijft belangrijker dan self-service.
- [x] Er opent nog geen implementation wave.

### Codebase acceptance

- [x] Dit document forceert geen codewijziging.
- [x] Dit document sluit aan op de huidige repo zonder billinglaag.
- [x] Dit document opent nog geen build.

### Documentation acceptance

- [x] Dit document functioneert als implementation gate voor billing/checkout.
- [x] De eerstvolgende stap is expliciet begrensd.
- [x] De eerste scope is kleiner gemaakt dan full commerce.

## Assumptions / Defaults

- de suite blijft voorlopig assisted-first
- de eerste commerciële transactielaag moet vooral handoff verbeteren
- een vroege billingtrack is alleen zinvol als die kleiner blijft dan productcommerce
- ook na een groene gate hoort eerst een implementation plan te volgen

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_29_BOUNDED_BILLING_AND_CHECKOUT_IMPLEMENTATION_PLAN.md`

Er is nog geen build permission voor:

- billing build
- checkout build
- subscriptions
- seats
- entitlements
- parallelle scale-up tracks
