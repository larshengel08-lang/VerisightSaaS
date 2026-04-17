# WAVE_02_BOUNDED_BILLING_AND_CHECKOUT_HANDOFF_AND_OPERATOR_VISIBILITY

## Title

Sharpen bounded billing and checkout into a clearer assisted handoff and operator visibility layer, without expanding into payments, subscriptions, or public checkout.

## Korte Summary

Deze wave bouwt verder op [WAVE_01_BOUNDED_BILLING_AND_CHECKOUT_FOUNDATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_BOUNDED_BILLING_AND_CHECKOUT_FOUNDATION.md). `WAVE_01` heeft nu de minimale bounded commerce foundation geopend: commerciële akkoordstatus, prijsmodus en start readiness voor alleen `ExitScan` en `RetentieScan`.

De kern van `WAVE_02` is nu niet meer “kan de status bestaan?”, maar:

- ziet een operator snel waar commerciële bevestiging stokt
- is de overgang van lead naar uitvoeringsstart duidelijk genoeg
- zijn blokkades, ontbrekende informatie en handoff-risico’s expliciet genoeg

Deze wave blijft bewust bounded. Ze opent nog steeds niet:

- publieke checkout
- payments
- invoices
- subscriptions
- seats
- entitlements
- follow-on commerce

Status van deze wave:

- Wave status: implemented_green
- Active source of truth after approval: dit document
- Build permission: completed
- Next allowed wave after green completion: `WAVE_03_BOUNDED_BILLING_AND_CHECKOUT_INTERNAL_CONFIRMATION_AND_AUDITABILITY.md`

## Why This Wave Now

`WAVE_01` heeft de minimale commerce-statuslaag technisch en functioneel neergezet, maar die eerste slice is nog vooral statusgedreven. De volgende logische verbetering zit nu in de operatorervaring en de handoffkwaliteit:

- een operator moet sneller kunnen zien welke leads commercieel klaar zijn
- een operator moet scherper kunnen zien wat een traject nog blokkeert
- de overgang van commerciële bevestiging naar delivery moet minder impliciet worden

De huidige codebase heeft hiervoor al concrete haakpunten:

- leadtriage en handoff in [lead-ops-table.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/lead-ops-table.tsx)
- delivery lifecycle en labels in [ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
- bounded commerce helperlabels in [contact-commerce.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-commerce.ts)
- de bestaande beheerflows rond leads en delivery

Deze wave gebruikt die bestaande oppervlakken en vermijdt opnieuw een bredere commerce- of finance-laag.

## Planned User Outcome

Na deze wave moet een Verisight-operator:

- sneller kunnen zien welke `ExitScan`- en `RetentieScan`-leads commercieel klaar zijn voor uitvoeringsstart
- kunnen zien welke blokkades eerst opgelost moeten worden
- een duidelijker, compacter handoffbeeld krijgen tussen commerciële bevestiging en deliverystart

Na deze wave moet een Verisight-beheerder:

- in één overzicht verschil kunnen zien tussen:
  - lead nog open
  - commercieel bevestigd
  - start ready
  - start geblokkeerd
  - gekoppelde delivery al actief

Wat deze wave nog niet hoeft te leveren:

- payments
- invoices
- publieke checkout
- subscriptionbeheer
- finance rapportage
- customer billing portal

## Scope In

- scherpere operatorsamenvatting voor bounded commerce status
- explicietere statusweergave en visual hierarchy in leadbeheer
- compactere signalering van blockers, ontbrekende prijsmodus of ontbrekende handoff
- duidelijkere read-model of helperlaag voor `agreement -> start readiness -> delivery` status
- tests en smoke-validatie voor operatorzicht en handoffgedrag
- docs-update van source of truth en bounded commerce contracts

## Scope Out

- publieke checkout of pricing-wijzigingen
- payment providers
- invoices of finance states
- subscriptions, seats, renewals, entitlements
- follow-on route commerce
- brede audit logging of enterprise governance

## Dependencies

- [PHASE_NEXT_STEP_29_BOUNDED_BILLING_AND_CHECKOUT_IMPLEMENTATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_29_BOUNDED_BILLING_AND_CHECKOUT_IMPLEMENTATION_PLAN.md)
- [WAVE_01_BOUNDED_BILLING_AND_CHECKOUT_FOUNDATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_BOUNDED_BILLING_AND_CHECKOUT_FOUNDATION.md)

## Key Changes

- bounded commerce verschuift van alleen statusvastlegging naar duidelijke operatorvisibility
- commerciële blockers en startblokkades worden explicieter en sneller scanbaar
- de handoff naar delivery wordt leesbaarder zonder een nieuw order- of fulfillmentmodel te bouwen
- `ExitScan` en `RetentieScan` blijven de enige ondersteunde routes

## Belangrijke Interfaces/Contracts

### 1. Bounded Commerce Visibility Contract

Na deze wave moet de adminlaag sneller zichtbaar maken:

- commercieel akkoord
- gekozen prijsmodus
- start readiness
- blockerstatus
- gekoppelde deliverystatus

Decision boundary:

- visibility wordt scherper
- het onderliggende commerce-model wordt niet breder

### 2. Delivery Handoff Summary Contract

De wave moet een compacter antwoord kunnen geven op:

- is dit traject klaar om delivery te starten
- zo nee, wat blokkeert dat
- zo ja, is delivery al gekoppeld of nog niet

Decision boundary:

- dit blijft een read- en handofflaag
- geen order orchestration

### 3. Supported Route Contract

Blijft onveranderd:

- `exitscan`
- `retentiescan`

Buiten scope:

- `combinatie`
- `pulse`
- `teamscan`
- `onboarding`
- `leadership`
- `nog-onzeker`

## Primary Code Surfaces

- [frontend/components/dashboard/lead-ops-table.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/lead-ops-table.tsx)
- [frontend/lib/contact-commerce.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-commerce.ts)
- [frontend/lib/contact-requests.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-requests.ts)
- [frontend/lib/ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
- [frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)

## Work Breakdown

### Track 1 - Visibility Model

Tasks:

- [x] Definieer een compacte helperlaag voor bounded commerce visibility.
- [x] Maak expliciet wanneer een lead als `ready`, `blocked`, `awaiting_confirmation` of vergelijkbaar telt.
- [x] Houd dit read-only en afgeleid van bestaande statusvelden.

Definition of done:

- [x] Er is een duidelijke visibility-samenvatting voor bounded commerce leads.
- [x] Die samenvatting introduceert geen nieuw commercieel objectmodel.

### Track 2 - Admin Table / UI Sharpening

Tasks:

- [x] Maak de bounded commerce status in de leadtabel sneller scanbaar.
- [x] Toon blockers en ontbrekende handoff-info compacter en duidelijker.
- [x] Houd de UI compact en operator-first.

Definition of done:

- [x] Een operator kan bounded commerce status sneller lezen dan in `WAVE_01`.
- [x] Blockers zijn duidelijk zichtbaar zonder extra klik- of contextlast.

### Track 3 - Handoff To Delivery Readability

Tasks:

- [x] Maak explicieter wanneer commerciële bevestiging nog niet tot deliverystart leidt.
- [x] Maak explicieter wanneer delivery al gekoppeld is of nog ontbreekt.
- [x] Vermijd brede workflow- of fulfillmentlogica.

Definition of done:

- [x] De overgang van agreement naar delivery is duidelijker in het beheeroppervlak.
- [x] De wave verhoogt duidelijkheid zonder nieuwe procescomplexiteit.

### Track 4 - Tests, Docs, and Smoke Validation

Tasks:

- [x] Voeg helper- en UI-tests toe voor bounded commerce visibility.
- [x] Voeg regressietests toe voor routegrenzen.
- [x] Werk docs en pointers bij.
- [x] Voer een compacte smoke-flow uit op lead -> confirm -> blocked/ready -> linked delivery read.

Definition of done:

- [x] Relevante tests zijn groen.
- [x] Visibility- en handoffgedrag zijn gesmoked.
- [x] Documentatie is synchroon met de implementatie.

## Testplan

### Automated Tests

- [x] Helpertests voor bounded commerce visibility states
- [x] UI-tests of labeltests voor operatorweergave
- [x] Regressietests voor routebegrenzing op alleen kernroutes
- [x] Regressietests voor bestaande lead- en deliveryweergave

### Integration Checks

- [x] `ExitScan` lead toont duidelijk agreement/readiness status
- [x] `RetentieScan` lead toont duidelijk agreement/readiness status
- [x] blocked start toont expliciete blocker
- [x] linked delivery blijft zichtbaar naast bounded commerce state
- [x] buiten-scope routes tonen geen oneigenlijke bounded commerce samenvatting

### Smoke Path

1. Maak of gebruik een `ExitScan` lead met commercieel akkoord.
2. Zet start readiness op `blocked` met blocker.
3. Controleer dat blocker direct zichtbaar is.
4. Zet start readiness op `ready`.
5. Controleer dat delivery-handoffstatus nu duidelijk verandert.
6. Herhaal voor `RetentieScan`.
7. Controleer dat `Combinatie` of een follow-on route buiten de bounded commerce-samenvatting blijft.

## Current Validation Snapshot

- [x] Frontend tests: `cmd /c npm test` -> `19 files passed`, `95 tests passed`
- [x] Frontend build: `cmd /c npm run build` -> groen
- [x] Frontend route types: `cmd /c npx next typegen` -> groen
- [x] Frontend typecheck: `cmd /c npx tsc --noEmit` -> groen
- [x] State-driven bounded commerce smoke is afgedekt via helpertests en de bestaande admin render/build gates

## Assumptions/Defaults

- de eerste winst na `WAVE_01` zit in duidelijkere operatorvisibility, niet in bredere commercefuncties
- de bestaande lead- en deliverymodellen blijven leidend
- een helper/read-model is waarschijnlijk beter dan een nieuw persistent object
- de wave blijft volledig assisted-first

## Product Acceptance

- [x] De wave introduceert geen nieuwe product- of checkoutbelofte.
- [x] De wave maakt bounded commerce duidelijker zonder SaaS-drift.
- [x] De kernroutehiërarchie blijft intact.

## Codebase Acceptance

- [x] Nieuwe code blijft klein en bounded rond visibility en handoff.
- [x] Geen payment-, invoice- of subscriptionlogica wordt toegevoegd.
- [x] Routegrenzen blijven intact.

## Runtime Acceptance

- [x] Een operator ziet bounded commerce states sneller en duidelijker.
- [x] Blockers en deliveryhandeoff zijn explicieter dan in `WAVE_01`.
- [x] Buiten-scope routes blijven buiten het bounded commerce pad.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] Smoke-validatie bevestigt duidelijker operatorvisibility.
- [x] Er is geen regressie in bestaande lead- of deliveryflows.

## Documentation Acceptance

- [x] Dit wave-document blijft synchroon met de feitelijke implementatie.
- [x] Het is na afronding duidelijk dat `WAVE_02` de actieve source of truth was.
- [x] `WAVE_03` kan pas openen na expliciete green close-out van deze wave.

## Risks To Watch

- visibility-copy wordt te zwaar of finance-achtig voor een kleine assisted laag
- de handoffsamenvatting introduceert alsnog impliciete workflowstates
- buiten-scope routes krijgen per ongeluk vergelijkbare UI zonder echte ondersteuning

## Not In This Wave

- Geen publieke checkout
- Geen payments of invoices
- Geen subscriptions of entitlements
- Geen follow-on commerce
- Geen identity-, SSO- of enterprise-controlwerk

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] bounded commerce visibility sneller scanbaar is dan in `WAVE_01`
- [x] blockers en delivery-handoff explicieter zijn
- [x] routegrenzen intact zijn gebleven
- [x] code, docs, tests en smoke-validatie groen zijn

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_03_BOUNDED_BILLING_AND_CHECKOUT_INTERNAL_CONFIRMATION_AND_AUDITABILITY.md`
