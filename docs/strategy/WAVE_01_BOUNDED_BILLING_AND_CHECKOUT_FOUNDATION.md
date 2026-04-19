# WAVE_01_BOUNDED_BILLING_AND_CHECKOUT_FOUNDATION

## Title

Open the first bounded billing and checkout vertical slice as an assisted commercial agreement and start-readiness layer for `ExitScan` and `RetentieScan`, without turning Verisight into a public self-serve commerce product.

## Korte Summary

Deze wave bouwt de eerste echte bounded billing/checkout-slice, maar bewust nog niet een volledige commerce- of finance-laag. Het doel is om binnen de huidige Verisight-suite een kleine, expliciete laag toe te voegen tussen pre-sales/intake en delivery: een gekozen kernroute moet commercieel bevestigd kunnen worden, een prijsanker of quote moet vastgelegd kunnen worden, en de overgang naar delivery moet expliciet `start ready` of nog geblokkeerd leesbaar worden.

Deze wave is expliciet een foundation vertical slice. Dat betekent: wel een volledige end-to-end assisted commerce flow voor beperkte kernroutes, maar nog zonder publieke webcheckout, betalingstechniek, subscriptions, seats, renewals of follow-on commerce. `Checkout` betekent in deze wave nog geen open aankoopervaring, maar een bounded confirmation- en readinesslaag voor trajecten die al assisted gekozen zijn.

Status van deze wave:

- Wave status: implemented_green
- Active source of truth after approval: dit document
- Build permission: completed
- Next allowed wave after green completion: `WAVE_02_BOUNDED_BILLING_AND_CHECKOUT_HANDOFF_AND_OPERATOR_VISIBILITY.md`

## Why This Wave Now

Deze wave volgt logisch uit de eerdere scale-up beslissingen:

- commercialization en scale-up zijn eerst bestuurlijk begrensd
- `billing and checkout` is de enige toegestane eerste implementation candidate
- die candidate is daarna expliciet verkleind tot `commercial agreement and start readiness`
- follow-on routes, `Combinatie`, subscriptions, seats en entitlements zijn bewust buiten scope gehouden

De huidige codebase geeft hiervoor ook een duidelijk startpunt:

- `ContactRequest` bestaat al als assisted pre-sales spine
- pricing en packaging zijn al expliciet vastgezet voor `ExitScan` en `RetentieScan`
- operator- en delivery ownership bestaan al in leads en `CampaignDeliveryRecord`
- de beheerlaag heeft al operator-surfaces voor follow-up, handoff en uitzonderingen

Deze wave gebruikt dus bestaande assisted objecten als basis en vermijdt bewust:

- publieke productcheckout
- payment processing
- subscriptionarchitectuur
- nieuwe product- of entitlementlagen

## Planned User Outcome

Na deze wave moet een Verisight-operator:

- een gekozen `ExitScan`- of `RetentieScan`-route commercieel kunnen bevestigen
- kunnen vastleggen of het traject op prijsanker of expliciete quote loopt
- kunnen zien of een traject `start ready` is of nog commercieel/operationeel geblokkeerd
- een expliciete handoff richting delivery kunnen vastleggen

Na deze wave moet een Verisight-beheerder:

- in de bestaande beheerlaag kunnen zien welke kernroute commercieel bevestigd is
- onderscheid kunnen maken tussen lead, commercieel akkoord en uitvoeringsstart

Wat deze wave nog niet hoeft te leveren:

- publieke checkout op de website
- online betaling of payment provider integratie
- facturen, subscriptions, seats of renewals
- self-serve customer portal
- follow-on route commerce

## Scope In

- een bounded commercieel akkoord- en start-readiness contract voor `ExitScan` en `RetentieScan`
- minimale backend uitbreiding voor commerciële status tussen `ContactRequest` en deliverystart
- expliciete opslag van gekozen route, commerciële akkoordstatus, prijsmodus en start readiness
- duidelijke operatorvelden voor blokkades en handoff richting delivery
- minimale beheerweergave voor deze commerciële statuslaag
- tests en smoke-validatie voor assisted agreement -> readiness -> handoff flow
- docs-update van actieve source of truth en relevante contracts

## Scope Out

- publieke website-checkout
- payment processing of providerintegratie
- factuur- of invoice-engine
- subscriptions, seats, renewals of entitlements
- `Combinatie`, `Pulse`, `TeamScan`, `Onboarding 30-60-90` of `Leadership Scan` commerce
- customer self-serve portalen
- brede finance backoffice
- identity-, SSO- of enterprise controlwerk

## Dependencies

- [PHASE_NEXT_STEP_23_BILLING_AND_CHECKOUT_READINESS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_23_BILLING_AND_CHECKOUT_READINESS_PLAN.md)
- [PHASE_NEXT_STEP_27_FIRST_SCALE_UP_IMPLEMENTATION_CHOICE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_27_FIRST_SCALE_UP_IMPLEMENTATION_CHOICE_PLAN.md)
- [PHASE_NEXT_STEP_28_BILLING_AND_CHECKOUT_IMPLEMENTATION_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_28_BILLING_AND_CHECKOUT_IMPLEMENTATION_GATE_PLAN.md)
- [PHASE_NEXT_STEP_29_BOUNDED_BILLING_AND_CHECKOUT_IMPLEMENTATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_29_BOUNDED_BILLING_AND_CHECKOUT_IMPLEMENTATION_PLAN.md)
- [PRICING_AND_PACKAGING_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md)

## Key Changes

- Er komt een expliciete commerciële statuslaag tussen lead en deliverystart.
- Die laag blijft beperkt tot `ExitScan` en `RetentieScan`.
- De bestaande `ContactRequest`- en deliveryketen wordt uitgebreid, niet vervangen.
- Een operator kan straks commercieel akkoord, prijsmodus, start readiness en blokkades expliciet vastleggen.
- De wave levert nog geen betalingen, checkoutpagina of subscriptionlogica op.

## Belangrijke Interfaces/Contracts

### 1. Supported Route Contract

Na deze wave geldt de bounded commerce foundation alleen voor:

- `route_interest = exitscan`
- `route_interest = retentiescan`

Decision boundary:

- `combinatie`, `teamscan`, `onboarding`, `leadership` en `nog-onzeker` vallen buiten deze wave
- `pulse` blijft ook buiten scope als directe commerce route

### 2. Commercial Agreement Contract

De eerste bounded commerce-laag moet minimaal kunnen modelleren:

- gekozen kernroute
- commerciële akkoordstatus
- prijsmodus: `public_anchor` of `custom_quote`
- start readiness
- handoff note richting delivery

Decision boundary:

- nog geen payment state
- nog geen invoice state
- nog geen subscription state

### 3. Start Readiness Contract

Deze wave moet expliciet kunnen uitdrukken:

- commercieel bevestigd en klaar voor start
- commercieel bevestigd maar nog niet startklaar
- nog commercieel open of onbeslist

Decision boundary:

- start readiness vervangt delivery lifecycle niet
- start readiness is alleen de grens vóór deliverystart

### 4. Delivery Handoff Contract

Na deze wave moet commerciële bevestiging kunnen landen in of aansluiten op:

- `ContactRequest`
- operator follow-up
- `CampaignDeliveryRecord`

Decision boundary:

- deze wave bouwt nog geen generieke order- of finance-entiteit
- handoff blijft assisted en operatorgedreven

## Primary Code Surfaces

### Existing Assisted Commerce / Intake Surfaces

- [backend/models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [frontend/components/marketing/contact-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/contact-form.tsx)
- [frontend/lib/contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- [frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx)

### Existing Delivery / Ops Surfaces

- [frontend/lib/ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
- [frontend/app/(dashboard)/beheer/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.tsx)

### Pricing / Packaging Reference Surfaces

- [frontend/app/tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)

### Likely New Small-Scope Surfaces

- een kleine uitbreiding van `ContactRequest` of een nauw gekoppelde bounded commerce statuslaag
- beperkte backend read/write endpoints voor commerciële akkoordstatus
- beperkte beheercomponent of form state voor agreement/start readiness

## Work Breakdown

### Track 1 - Commercial Status Model and Backend Contract

Tasks:

- [x] Definieer een minimale bounded commerce statuslaag voor kernroutes.
- [x] Breid backend models/schemas uit met commerciële akkoord- en start-readiness velden of een kleine gekoppelde statusentiteit.
- [x] Zorg dat bestaande leadflows intact blijven voor alle routes buiten scope.
- [x] Vermijd elke payment-, invoice- of subscriptionstructuur.

Definition of done:

- [x] Backend kan commerciële akkoordstatus en start readiness voor `ExitScan` en `RetentieScan` opslaan.
- [x] Buiten-scope routes blijven veilig ongewijzigd.
- [x] Er is geen verborgen finance- of SaaS-model binnengeslopen.

### Track 2 - Admin / Operator Update Flow

Tasks:

- [x] Voeg een beperkte updateflow toe voor commerciële bevestiging in de beheerlaag.
- [x] Maak prijsmodus en handoff note expliciet invulbaar.
- [x] Zorg dat blokkades vóór start zichtbaar blijven.
- [x] Houd de operatorflow kleiner dan een finance dashboard.

Definition of done:

- [x] Een operator kan akkoordstatus, prijsmodus en start readiness vastleggen.
- [x] De beheerlaag maakt onderscheid tussen leadstatus en commercieel bevestigd traject.
- [x] De UI blijft assisted en overzichtelijk.

### Track 3 - Delivery Handoff Integration

Tasks:

- [x] Maak expliciet hoe een commercieel bevestigd traject naar deliverystart overgaat.
- [x] Zorg dat bestaande deliveryspine gebruikt blijft worden.
- [x] Behoud duidelijke blokkades als een traject nog niet mag starten.
- [x] Vermijd brede order- of fulfillmentlogica.

Definition of done:

- [x] Het verschil tussen commercieel akkoord en deliverystart is duidelijk in data en UI.
- [x] Handoff naar delivery voelt scherper en niet diffuser.
- [x] Delivery lifecycle blijft de canonieke uitvoeringslaag.

### Track 4 - Tests, Docs, and Smoke Validation

Tasks:

- [x] Voeg backend tests toe voor bounded commerce status en updatepaden.
- [x] Voeg frontend tests toe voor operatorweergave en statusupdates.
- [x] Werk docs en strategy pointers bij.
- [x] Voer een gescripte of handmatige smoke-flow uit van lead -> agreement -> start readiness.

Definition of done:

- [x] Relevante tests voor deze wave zijn groen.
- [x] Een assisted agreement -> readiness -> handoff path werkt end-to-end.
- [x] Documentatie is synchroon met de implementatie.

## Testplan

### Automated Tests

- [x] Backend tests voor commerciële akkoordstatus op `ExitScan`
- [x] Backend tests voor commerciële akkoordstatus op `RetentieScan`
- [x] Tests voor afwijzen of negeren van buiten-scope routes
- [x] Frontend tests voor operator updateflow via bounded commerce helperlabels en typecontracten
- [x] Regressietests voor bestaande `ContactRequest` flows
- [x] Regressietests voor delivery/admin oppervlakken die geraakt worden

### Integration Checks

- [x] `ExitScan` lead kan commercieel bevestigd worden
- [x] `RetentieScan` lead kan commercieel bevestigd worden
- [x] prijsmodus kan worden vastgelegd als anchor of custom quote
- [x] start readiness kan expliciet aan/uit of geblokkeerd worden gezet
- [x] handoff richting delivery is zichtbaar
- [x] buiten-scope routekeuzes breken niet en openen geen bounded commerce pad

### Smoke Path

1. Maak een lead aan voor `ExitScan`.
2. Open de lead in beheer.
3. Zet commerciële akkoordstatus expliciet vast.
4. Leg prijsmodus en handoff note vast.
5. Markeer traject als `start ready` of laat expliciet zien waarom dat nog niet kan.
6. Controleer dat delivery nog niet impliciet gestart is zonder handoff.
7. Herhaal minimaal één keer voor `RetentieScan`.
8. Controleer dat een buiten-scope route geen bounded commerce updateflow krijgt.

## Current Validation Snapshot

- [x] Backend: `.\.venv\Scripts\python.exe -m pytest tests/test_api_flows.py -q` -> `44 passed`
- [x] Frontend tests: `cmd /c npm test` -> `19 files passed`, `92 tests passed`
- [x] Frontend build: `cmd /c npm run build` -> groen
- [x] Frontend route types: `cmd /c npx next typegen` -> groen
- [x] Frontend typecheck: `cmd /c npx tsc --noEmit` -> groen
- [x] Gescripte bounded commerce smoke-flow is groen via API-tests: lead create -> commercial agreement -> pricing mode -> start readiness -> readback

## Assumptions/Defaults

- de eerste bounded commerce-laag hangt primair aan de huidige `ContactRequest`- en beheerrealiteit
- `ExitScan` en `RetentieScan` zijn de enige verdedigbare eerste implementationscope
- commerciële akkoordstatus is waardevoller dan vroegtijdige betalingstechniek
- checkout blijft in deze wave assisted confirmation, niet public purchase
- als een kleine aparte statusentiteit niet nodig blijkt, mag deze wave op minimale uitbreiding van bestaande leadobjecten leunen

## Product Acceptance

- [x] De wave introduceert geen nieuw productaanbod.
- [x] De wave voelt als assisted commerce discipline, niet als self-serve SaaS.
- [x] `ExitScan` blijft de default kernroute.
- [x] `RetentieScan` blijft de enige expliciete primaire uitzondering.

## Codebase Acceptance

- [x] Nieuwe code blijft klein en bounded rond lead/agreement/handoff.
- [x] Geen finance-, subscription- of entitlementlaag is toegevoegd.
- [x] Bestaande route-, delivery- en opscontracten blijven intact.
- [x] Buiten-scope routes blijven ongewijzigd qua commercegedrag.

## Runtime Acceptance

- [x] Een operator kan commercieel akkoord vastleggen voor `ExitScan` en `RetentieScan`.
- [x] Start readiness is expliciet zichtbaar vóór deliverystart.
- [x] Delivery handoff sluit aan op bestaande uitvoeringsspine.
- [x] Buiten-scope routes openen geen oneigenlijke commerceflow.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] De assisted agreement -> readiness smoke-path werkt.
- [x] Er is geen regressie in bestaande lead- of deliveryflows.
- [x] De wave introduceert geen publieke checkout- of paymentclaim.

## Documentation Acceptance

- [x] Dit wave-document blijft synchroon met de feitelijke implementatie.
- [x] Relevante strategy docs of active docs zijn bijgewerkt waar nodig.
- [x] Het is na afronding duidelijk dat `WAVE_01` de actieve en daarna afgesloten source of truth was.
- [x] `WAVE_02` kan pas openen na expliciete green close-out van deze wave.

## Risks To Watch

- De wave wordt stiekem een halve finance-laag in plaats van een kleine agreement-statuslaag.
- `Checkout`-taal roept intern of extern alsnog te brede verwachtingen op.
- Bestaande lead- en deliveryobjecten blijken te weinig ruimte te hebben voor een nette bounded agreementlaag.
- Buiten-scope routes gaan per ongeluk meeliften in nieuwe backendcontracten.
- De operatorflow wordt te zwaar voor wat eigenlijk een kleine statusdiscipline hoort te zijn.

## Not In This Wave

- Geen publieke website-checkout.
- Geen payments, invoices of payment providers.
- Geen subscriptions, seats, renewals of entitlements.
- Geen `Combinatie` commerce.
- Geen follow-on route commerce.
- Geen customer billing portal.
- Geen identity-, SSO- of enterprise controlwerk.

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] een bounded agreement/statuslaag werkt voor `ExitScan` en `RetentieScan`
- [x] commerciële akkoordstatus en start readiness expliciet vastgelegd kunnen worden
- [x] handoff naar delivery duidelijker is dan vóór deze wave
- [x] buiten-scope routes geen onbedoelde commerceflow openen
- [x] code, docs, tests en smoke-validatie groen zijn

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_02_BOUNDED_BILLING_AND_CHECKOUT_HANDOFF_AND_OPERATOR_VISIBILITY.md`
