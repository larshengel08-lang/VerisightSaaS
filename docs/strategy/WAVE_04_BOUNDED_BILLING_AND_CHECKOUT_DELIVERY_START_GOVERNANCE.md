# WAVE_04_BOUNDED_BILLING_AND_CHECKOUT_DELIVERY_START_GOVERNANCE

## Title

Tighten bounded billing and checkout into a clear delivery-start governance layer, so `ExitScan` and `RetentieScan` can move from commercial confirmation into delivery with explicit release rules, without expanding into orders, payments, or workflow orchestration.

## Korte Summary

Deze wave bouwt verder op:

- [WAVE_01_BOUNDED_BILLING_AND_CHECKOUT_FOUNDATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_BOUNDED_BILLING_AND_CHECKOUT_FOUNDATION.md)
- [WAVE_02_BOUNDED_BILLING_AND_CHECKOUT_HANDOFF_AND_OPERATOR_VISIBILITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_02_BOUNDED_BILLING_AND_CHECKOUT_HANDOFF_AND_OPERATOR_VISIBILITY.md)
- [WAVE_03_BOUNDED_BILLING_AND_CHECKOUT_INTERNAL_CONFIRMATION_AND_AUDITABILITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_03_BOUNDED_BILLING_AND_CHECKOUT_INTERNAL_CONFIRMATION_AND_AUDITABILITY.md)

`WAVE_01` opende de foundationlaag. `WAVE_02` maakte die beter leesbaar voor operators. `WAVE_03` voegde interne confirmation en minimale auditability toe. De laatste logische bounded commerce-wave is nu:

- niet bredere commerce
- niet publieke checkout
- niet billing breadth

maar wel:

- scherpere governance op de grens naar deliverystart
- expliciete release rules voor wanneer een lead echt delivery-ready is
- minder impliciete operatorbeslissingen tussen commercieel akkoord en uitvoeringsstart

De kern van `WAVE_04` is daarom:

- bounded commerce state laten uitmonden in een duidelijke delivery-start governancebeslissing
- de handoff naar delivery explicieter en minder ambigu maken
- voorkomen dat `start ready` een losse label blijft zonder duidelijke operationele betekenis

Deze wave blijft bewust bounded. Ze opent nog steeds niet:

- publieke checkout
- payments
- invoices
- subscriptions
- seats
- entitlements
- order orchestration
- fulfillment workflows

Status van deze wave:

- Wave status: implemented_green
- Active source of truth after approval: dit document
- Build permission: completed
- Next allowed step after green completion: bounded billing/checkout track closeout and next-track choice

## Why This Wave Now

De bounded commerce-laag is nu functioneel bruikbaar en intern beter bevestigbaar, maar de laatste scherpe vraag blijft:

- wanneer is een lead niet alleen commercieel bevestigd, maar ook operationeel verantwoord vrijgegeven voor deliverystart

De huidige codebase laat die grens al zien, maar nog niet volledig strak genoeg:

- commercial state leeft op `ContactRequest`
- visibility en auditability zijn aanwezig in [contact-commerce.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-commerce.ts)
- operators werken in [lead-ops-table.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/lead-ops-table.tsx)
- delivery zelf heeft al een eigen canonieke spine via `CampaignDeliveryRecord`

Wat nog ontbreekt, is een bounded antwoord op:

- welke minimale voorwaarden release naar delivery rechtvaardigen
- wanneer een lead nog commercieel staat, maar nog niet operationeel vrij is
- hoe we voorkomen dat `ready` te los of te vroeg gebruikt wordt

Deze wave gebruikt daarom bestaande assisted objecten en vermijdt bewust:

- nieuwe orderentiteiten
- generieke workflow-engines
- brede fulfillmentlogica
- enterprise governance

## Planned User Outcome

Na deze wave moet een Verisight-operator:

- kunnen zien of een bounded commerce lead alleen commercieel klaar is, of ook operationeel vrijgegeven voor start
- scherper kunnen zien welke minimale releasevoorwaarden nog missen
- een explicieter delivery-start signaal hebben dan alleen `commercial_start_readiness_status = ready`

Na deze wave moet een Verisight-beheerder:

- minder afhankelijk zijn van impliciete handoffnotities
- sneller kunnen onderscheiden tussen:
  - commercieel bevestigd
  - intern bevestigd
  - klaar voor delivery-koppeling
  - expliciet vrijgegeven voor deliverystart

Wat deze wave nog niet hoeft te leveren:

- automatische campaign-creatie
- order-to-fulfillment pipelines
- payment-to-start automatie
- multi-step approvals
- uitgebreide ops-automation

## Scope In

- expliciete bounded delivery-start governance rules voor `ExitScan` en `RetentieScan`
- een kleine release/ready-for-delivery-start interpretatielaag
- duidelijkere operatorweergave van delivery release versus algemene readiness
- tests en smoke-validatie voor commercial state -> delivery-start governance
- docs-update van source of truth en bounded commerce contracts

## Scope Out

- publieke checkout of pricing-wijzigingen
- payments, invoices of subscriptions
- automatische deliveryrecord-creatie
- brede order- of fulfillmentmodellen
- follow-on route commerce
- enterprise approvals of governance platforms

## Dependencies

- [PHASE_NEXT_STEP_29_BOUNDED_BILLING_AND_CHECKOUT_IMPLEMENTATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_29_BOUNDED_BILLING_AND_CHECKOUT_IMPLEMENTATION_PLAN.md)
- [WAVE_01_BOUNDED_BILLING_AND_CHECKOUT_FOUNDATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_BOUNDED_BILLING_AND_CHECKOUT_FOUNDATION.md)
- [WAVE_02_BOUNDED_BILLING_AND_CHECKOUT_HANDOFF_AND_OPERATOR_VISIBILITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_02_BOUNDED_BILLING_AND_CHECKOUT_HANDOFF_AND_OPERATOR_VISIBILITY.md)
- [WAVE_03_BOUNDED_BILLING_AND_CHECKOUT_INTERNAL_CONFIRMATION_AND_AUDITABILITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_03_BOUNDED_BILLING_AND_CHECKOUT_INTERNAL_CONFIRMATION_AND_AUDITABILITY.md)

## Key Changes

- bounded commerce verschuift van commercieel akkoord en confirmation naar expliciete delivery-start governance
- operators krijgen een scherper onderscheid tussen `intern bevestigd` en `echt vrijgegeven voor deliverystart`
- de handoff naar delivery wordt helderder zonder nieuwe workflow- of ordercomplexiteit
- `ExitScan` en `RetentieScan` blijven de enige ondersteunde routes

## Belangrijke Interfaces/Contracts

### 1. Delivery Start Governance Contract

Na deze wave moet bounded commerce explicieter kunnen beantwoorden:

- mag deze lead nu verantwoord naar deliverystart door
- zo nee, ontbreekt er commercieel iets of operationeel iets
- zo ja, is dit alleen klaar voor koppeling of echt vrijgegeven

Decision boundary:

- dit blijft een governance/read- en release-laag
- geen fulfillment engine

### 2. Bounded Release Rule Contract

Deze wave moet een kleine, expliciete set releasevoorwaarden afdwingen of zichtbaar maken:

- commercieel akkoord bevestigd
- prijsmodus aanwezig
- interne agreement confirmation aanwezig
- readiness review aanwezig zodra startstatus vastligt

Decision boundary:

- geen brede intake checklist
- alleen de kleinste set die delivery-start governance verdedigbaar maakt

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

### 4. Delivery Spine Boundary

Na deze wave blijft gelden:

- `CampaignDeliveryRecord` blijft de canonieke deliverylaag
- bounded commerce beslist alleen over de releasegrens vóróór deliverystart

Decision boundary:

- geen vervanging van delivery lifecycle
- geen automation die delivery impliciet start zonder expliciete operatorstap

## Primary Code Surfaces

- [backend/models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [supabase/schema.sql](/C:/Users/larsh/Desktop/Business/Verisight/supabase/schema.sql)
- [frontend/lib/contact-commerce.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-commerce.ts)
- [frontend/components/dashboard/lead-ops-table.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/lead-ops-table.tsx)
- [frontend/lib/ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
- [tests/test_api_flows.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py)

## Work Breakdown

### Track 1 - Delivery Release Interpretation

Tasks:

- [x] Definieer een kleine interpretatielaag tussen readiness en echte delivery-start release.
- [x] Maak expliciet wanneer een lead alleen `klaar voor koppeling` is en wanneer die echt `vrijgegeven` is.
- [x] Houd deze laag afgeleid van bestaande bounded commerce state.

Definition of done:

- [x] De grens tussen readiness en delivery-start governance is duidelijker dan in `WAVE_03`.
- [x] Er is geen nieuw order- of workflowmodel toegevoegd.

### Track 2 - Backend And Contract Rules

Tasks:

- [x] Breid backendcontracten uit met minimale delivery-start governance signalen of afgeleide regels.
- [x] Definieer veilige validatieregels voor bounded release naar delivery.
- [x] Zorg dat buiten-scope routes geen delivery-start governancepad openen.

Definition of done:

- [x] Backend kan bounded delivery-start governance uitleveren voor `ExitScan` en `RetentieScan`.
- [x] De regels blijven compact en operator-verklaarbaar.

### Track 3 - Admin Readability And Handoff Clarity

Tasks:

- [x] Voeg delivery-start governance signalen toe aan de admin lead-ops UI.
- [x] Maak zichtbaar wat nog ontbreekt vóór delivery release.
- [x] Houd de UI compact en assisted-first.

Definition of done:

- [x] Operators kunnen sneller zien of een lead alleen commercieel ready is of echt delivery-releasebaar.
- [x] De UI blijft geen fulfillment dashboard.

### Track 4 - Tests, Docs, and Smoke Validation

Tasks:

- [x] Voeg backend tests toe voor delivery-start governance regels.
- [x] Voeg frontend helper/UI-tests toe voor release visibility.
- [x] Werk docs en pointers bij.
- [x] Voer een compacte smoke-flow uit op agreement -> confirmation -> readiness -> delivery release read.

Definition of done:

- [x] Relevante tests zijn groen.
- [x] Delivery-start governance is gesmoked.
- [x] Documentatie is synchroon met de implementatie.

## Testplan

### Automated Tests

- [x] Backend tests voor bounded delivery-start governance op `ExitScan`
- [x] Backend tests voor bounded delivery-start governance op `RetentieScan`
- [x] Tests voor afwijzen of blokkeren van te vroege release
- [x] Regressietests voor buiten-scope routes
- [x] Frontend tests voor release visibility en handoffduiding
- [x] Regressietests voor bestaande bounded commerce visibility

### Integration Checks

- [x] `ExitScan` lead toont duidelijk verschil tussen commercieel ready en delivery-releasebaar
- [x] `RetentieScan` lead toont duidelijk verschil tussen commercieel ready en delivery-releasebaar
- [x] ontbrekende confirmation/review blokkeert of verzwakt release terecht
- [x] operator kan releasecontext zien zonder extra workflowspoor
- [x] buiten-scope routes openen geen governancepad

### Smoke Path

1. Maak of gebruik een `ExitScan` lead met commercieel akkoord.
2. Bevestig intern agreement en readiness.
3. Controleer of de lead alleen `ready voor koppeling` of ook `vrijgegeven voor deliverystart` leest.
4. Maak één scenario met ontbrekende releasevoorwaarde.
5. Controleer dat de releasegrens expliciet zichtbaar blijft.
6. Herhaal minimaal één keer voor `RetentieScan`.
7. Controleer dat een follow-on route geen delivery-start governance-oppervlak krijgt.

## Current Validation Snapshot

- [x] Scoped backend validation: `.\.venv\Scripts\python.exe -m pytest tests/test_api_flows.py -q -k "contact_request_update or bounded_billing_foundation_smoke_flow"` -> `7 passed`
- [x] Frontend focused helper tests: `cmd /c npm test -- --run contact-commerce.test.ts pilot-learning.test.ts` -> `11 passed`
- [x] Frontend full test suite: `cmd /c npm test` -> `97 passed`
- [x] Frontend route types: `cmd /c npx next typegen` -> groen
- [x] Frontend build: `cmd /c npm run build` -> groen
- [x] Frontend typecheck: `cmd /c npx tsc --noEmit` -> groen in seriele run na build/typegen
- [x] State-driven delivery-start governance smoke is afgedekt via API-regressies en helper/UI-validatie

## Assumptions/Defaults

- de grootste resterende bounded commerce-gap zit nu in de grens naar deliverystart, niet in bredere billinglogica
- een kleine governance/release-laag is waardevoller dan meer commerciële breadth
- bounded commerce blijft assisted-first en operatorgedreven
- delivery blijft een aparte canonieke spine

## Product Acceptance

- [x] De wave introduceert geen nieuwe checkout-, payment- of productbelofte.
- [x] Bounded commerce voelt scherper en betrouwbaarder, niet groter.
- [x] De kernroutehiërarchie blijft intact.

## Codebase Acceptance

- [x] Nieuwe code blijft klein en bounded rond release/governance vóór deliverystart.
- [x] Geen payment-, invoice-, subscription-, order- of fulfillmentlaag wordt toegevoegd.
- [x] Routegrenzen blijven intact.

## Runtime Acceptance

- [x] Een operator ziet of bounded commerce ook echt delivery-releasebaar is.
- [x] Delivery-handoff is explicieter en minder ambigu dan in `WAVE_03`.
- [x] Buiten-scope routes blijven buiten het bounded commerce pad.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] Smoke-validatie bevestigt delivery-start governance.
- [x] Er is geen regressie in bestaande lead-, delivery- of bounded commerceflows.

## Documentation Acceptance

- [x] Dit wave-document blijft synchroon met de feitelijke implementatie.
- [x] Het is na afronding duidelijk dat `WAVE_04` de actieve source of truth was.
- [x] Deze bounded billing/checkout track opent pas daarna weer voor expliciete close-out of volgende keuze.

## Risks To Watch

- delivery-start governance wordt stiekem een halve workflow-engine
- de releasevoorwaarden worden te zwaar voor een kleine assisted laag
- operators krijgen extra velden zonder echte handoffwinst
- bounded commerce en delivery lifecycle gaan door elkaar lopen

## Not In This Wave

- Geen publieke checkout
- Geen payments of invoices
- Geen subscriptions of entitlements
- Geen follow-on commerce
- Geen order orchestration
- Geen fulfillment platform
- Geen identity-, SSO- of governanceplatformwerk

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] bounded commerce een expliciete delivery-start governancegrens heeft voor `ExitScan` en `RetentieScan`
- [x] het verschil tussen readiness en release duidelijker is dan in `WAVE_03`
- [x] routegrenzen intact zijn gebleven
- [x] code, docs, tests en smoke-validatie groen zijn

## Next Allowed Step

Na volledige green close-out van deze wave mag pas openen:

- bounded billing/checkout track close-out
- of een expliciete nieuwe suite-/scale-up keuze, maar niet automatisch een bredere commercewave
