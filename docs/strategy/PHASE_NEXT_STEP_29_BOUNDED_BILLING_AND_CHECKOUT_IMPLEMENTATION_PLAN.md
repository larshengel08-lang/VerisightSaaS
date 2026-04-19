# Phase Next Step 29 - Bounded Billing And Checkout Implementation Plan

## Title

Define the first bounded implementation plan for billing and checkout as a small assisted commerce layer for clearly chosen core routes, without turning Verisight into a self-serve SaaS checkout product.

## Korte Summary

Na [PHASE_NEXT_STEP_28_BILLING_AND_CHECKOUT_IMPLEMENTATION_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_28_BILLING_AND_CHECKOUT_IMPLEMENTATION_GATE_PLAN.md) is nu expliciet vastgezet dat:

- billing/checkout alleen als eerste scale-up candidate mag openen
- de eerste scope assisted en bounded moet blijven
- follow-on routes, `Combinatie`, subscriptions, seats en entitlements buiten scope blijven

De volgende logische stap is daarom:

- het eerste implementation-plan voor die begrensde billing/checkout-scope vastzetten

Niet:

- meteen builden
- publieke checkout voor de hele suite openen
- pricing ombouwen naar plans, seats of licenties

De kernkeuze van deze stap is daarom:

- de eerste billing/checkout-implementatie wordt nu gedefinieerd als een kleine assisted commerce laag
- de scope blijft beperkt tot commerciële akkoord- en statusdiscipline voor kernroutes
- checkout betekent hier nog geen open self-serve koopflow, maar een begrensde transactie- en bevestigingslaag
- alles buiten deze smalle scope blijft dicht

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

### 1. The first implementation must be smaller than the word “checkout” suggests

Als we nu een implementatiespoor openen, dan moet dat kleiner zijn dan hoe veel teams “checkout” normaal bedoelen.

De eerste waarde zit hier waarschijnlijk in:

- explicieter commercieel akkoord
- duidelijkere status tussen lead, quote en deliverystart
- strakkere handoff tussen sales/intake en uitvoering

Niet in:

- open webcheckout
- directe productaankoop door onbekende buyers
- portfolio-shopping

### 2. The repo already has the assisted objects this layer can lean on

De huidige codebase heeft al:

- `ContactRequest` als pre-sales spine
- assisted routekeuze en contactflow
- `CampaignDeliveryRecord` als delivery spine
- pricing- en packagingtruth voor de kernroutes

Dat maakt een kleine commerciële transactie- en akkoordlaag logisch als eerste candidate, zolang die niet méér wil zijn dan dit.

### 3. The first implementation should improve clarity, not automate complexity

De winst van deze eerste implementation hoort te zitten in:

- minder losse commerciële status buiten de repo
- betere zichtbaarheid van waar een gekozen traject commercieel staat
- helderder startmoment richting delivery

Niet in:

- geautomatiseerde commerciële ecosystemen
- facturatie- en abonnementslogica
- customer commerce autonomy

## Current Implementation Baseline

### 1. Current pricing baseline

- [x] `ExitScan` en `RetentieScan` hebben publieke prijsankers
- [x] follow-on routes blijven `op aanvraag`
- [x] pricing is assisted en traject-gedreven

### 2. Current commercial flow baseline

- [x] routekeuze en intake lopen via `ContactRequest`
- [x] commerciële handoff is nu vooral assisted en deels impliciet
- [x] er is nog geen expliciete repo-brede commercieel-akkoordstatus

### 3. Current delivery baseline

- [x] `CampaignDeliveryRecord` bestaat voor de uitvoeringsfase
- [x] first value en first management use zijn expliciete milestones
- [x] delivery start pas na praktische handoff en operatoractie

### 4. Current missing transaction baseline

- [x] geen contract voor commercial acceptance / akkoordstatus
- [x] geen bounded checkout object
- [x] geen payment state
- [x] geen invoice state
- [x] geen link tussen commercieel akkoord en delivery start in één expliciete laag

## Decision

### 1. The First Billing/Checkout Track Will Be “Commercial Agreement And Start Readiness”

Beslissing:

- de eerste implementation-scope wordt nu vastgezet als:
  - `commercial agreement and start readiness`

Dit betekent:

- een kleine laag tussen pre-sales/intake en delivery
- bedoeld om zichtbaar te maken dat een gekozen kernroute commercieel akkoord en startklaar is

### 2. The First Scope Is Core-Route Only

Beslissing:

- de eerste implementationscope mag alleen gelden voor:
  - `ExitScan`
  - `RetentieScan`

Niet voor:

- `Combinatie`
- `Pulse`
- `TeamScan`
- `Onboarding 30-60-90`
- `Leadership Scan`

### 3. “Checkout” Means Assisted Confirmation, Not Open Self-Serve Purchase

Beslissing:

- checkout in deze eerste track betekent:
  - begrensde bevestiging van gekozen route, prijs/quote en startstatus

Niet:

- anonieme webcheckout
- card-first direct purchase
- publieke productwinkel

### 4. The First Track Must Add Status Clarity, Not Billing Breadth

Beslissing:

- de eerste implementation moet vooral expliciet maken:
  - is de route commercieel bevestigd?
  - is de prijs/quote bevestigd?
  - is de start vrijgegeven?
  - kan delivery verantwoord starten?

Niet:

- hoe meerdere producten tegelijk gekocht worden
- hoe abonnementen verlengd worden
- hoe entitlements automatisch worden uitgedeeld

### 5. All Broader Commerce Concepts Stay Blocked

Beslissing:

- buiten scope blijven expliciet:
  - subscriptions
  - seats
  - renewals
  - entitlements
  - public checkout
  - quote-to-cart conversion voor follow-on routes

## Proposed First Implementation Shape

### 1. Commercial Readiness State

Eerste scope mag later modelleren:

- route gekozen
- prijsanker of quote bevestigd
- commerciële akkoordstatus
- start readiness
- handoff note richting delivery

### 2. Transition To Delivery

Eerste scope mag later explicieter maken:

- wanneer een commercieel gekozen traject operationeel mag starten
- welke minimale informatie delivery nodig heeft
- wanneer delivery nog niet mag starten ondanks commerciële intentie

### 3. Minimal Operator Surface

Eerste scope mag later een kleine operator/adminlaag krijgen voor:

- statusoverzicht
- akkoordbevestiging
- start readiness
- blokkades vóór uitvoeringsstart

Niet voor:

- volwaardige finance backoffice
- customer billing portal
- subscriptionbeheer

## Key Changes

- de eerste billing/checkout-implementatie is nu concreet verkleind tot een assisted agreement/start layer
- de scope is beperkt tot `ExitScan` en `RetentieScan`
- “checkout” is bewust herkadert als bounded confirmation in plaats van public commerce
- bredere billing-, finance- en SaaS-concepten blijven dicht

## Belangrijke Interfaces / Contracts

### 1. Core-Route Commerce Contract

Eerste scope geldt alleen voor:

- `ExitScan`
- `RetentieScan`

### 2. Commercial Agreement Contract

Een latere eerste implementation mag hoogstens modelleren:

- gekozen route
- confirmed commercial scope
- confirmed price or quote
- start readiness

### 3. Delivery Handoff Contract

De eerste implementation moet aansluiten op:

- `ContactRequest`
- bestaande intake/handofflogica
- `CampaignDeliveryRecord`

zonder deze lagen te vervangen

### 4. Commerce Block Contract

Nog expliciet geblokkeerd:

- public suite checkout
- follow-on checkout
- subscriptions
- seats
- entitlements
- finance platform breadth

## Primary Reference Surfaces

- [PHASE_NEXT_STEP_23_BILLING_AND_CHECKOUT_READINESS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_23_BILLING_AND_CHECKOUT_READINESS_PLAN.md)
- [PHASE_NEXT_STEP_28_BILLING_AND_CHECKOUT_IMPLEMENTATION_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_28_BILLING_AND_CHECKOUT_IMPLEMENTATION_GATE_PLAN.md)
- [PRICING_AND_PACKAGING_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md)
- [tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- [contact-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/contact-form.tsx)
- [models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)

## Testplan

### Product acceptance

- [x] Deze stap verandert geen productaanbod.
- [x] De eerste commerce-scope blijft kleiner dan productcommerce.
- [x] Follow-on routes blijven buiten scope.

### Commercial acceptance

- [x] De eerste scope blijft core-route-first.
- [x] Checkout wordt niet als publieke winkel hergedefinieerd.
- [x] Prijs- en routehiërarchie blijven intact.

### Operational acceptance

- [x] Delivery blijft pas starten na expliciete start readiness.
- [x] Qualification en handoff blijven leidend.
- [x] Er opent nog geen finance backoffice of self-serve portal.

### Codebase acceptance

- [x] Dit document opent nog geen buildwave.
- [x] Dit document blijft aansluiten op de huidige repo zonder billingobjecten.
- [x] Dit document houdt de eerste implementation scope klein en technisch haalbaar.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor de eerste bounded billing/checkout implementation.
- [x] De eerste scope is expliciet benoemd.
- [x] De volgende toegestane stap is helder begrensd.

## Assumptions / Defaults

- de eerste waarde van billing/checkout zit in commerciële statusdiscipline, niet in betalingstechniek
- een eerste implementation hoort assisted te blijven
- `ExitScan` en `RetentieScan` zijn de enige verdedigbare eerste scope
- follow-on routes zijn nu nog te contextafhankelijk voor commerce-implementatie

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `WAVE_01_BOUNDED_BILLING_AND_CHECKOUT_FOUNDATION.md`

Er is nog geen build permission voor:

- subscriptions
- seats
- entitlements
- follow-on checkout
- public suite checkout
