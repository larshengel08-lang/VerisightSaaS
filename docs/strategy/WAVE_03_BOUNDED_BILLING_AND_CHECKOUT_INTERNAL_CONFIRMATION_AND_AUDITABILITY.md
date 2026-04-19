# WAVE_03_BOUNDED_BILLING_AND_CHECKOUT_INTERNAL_CONFIRMATION_AND_AUDITABILITY

## Title

Make bounded billing and checkout internally confirmable and minimally auditable, so `ExitScan` and `RetentieScan` agreements can be trusted operationally without expanding into enterprise audit logging, payments, or public checkout.

## Korte Summary

Deze wave bouwt verder op:

- [WAVE_01_BOUNDED_BILLING_AND_CHECKOUT_FOUNDATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_BOUNDED_BILLING_AND_CHECKOUT_FOUNDATION.md)
- [WAVE_02_BOUNDED_BILLING_AND_CHECKOUT_HANDOFF_AND_OPERATOR_VISIBILITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_02_BOUNDED_BILLING_AND_CHECKOUT_HANDOFF_AND_OPERATOR_VISIBILITY.md)

`WAVE_01` heeft de bounded commerce foundation geopend. `WAVE_02` heeft die laag beter scanbaar gemaakt voor operators. De volgende logische stap is nu niet bredere commerce, maar betrouwbaardere interne bevestiging:

- wie heeft commercieel akkoord intern bevestigd
- wanneer is start readiness expliciet herzien of vrijgegeven
- welke minimale interne context hoort bij die beslissing
- hoe blijft dat zichtbaar zonder brede audit- of governanceplatformlaag

De kern van `WAVE_03` is daarom:

- bounded commerce beslissingen intern beter bevestigbaar maken
- minimale accountability en auditability toevoegen
- operators minder laten leunen op impliciete context of losse notities

Deze wave blijft bewust bounded. Ze opent nog steeds niet:

- publieke checkout
- payments
- invoices
- subscriptions
- seats
- entitlements
- enterprise audit logging
- brede approval workflows

Status van deze wave:

- Wave status: implemented_green
- Active source of truth after approval: dit document
- Build permission: completed
- Next allowed wave after green completion: `WAVE_04_BOUNDED_BILLING_AND_CHECKOUT_DELIVERY_START_GOVERNANCE.md`

## Why This Wave Now

De huidige bounded commerce-laag is nu functioneel bruikbaar, maar nog vrij impliciet als interne bevestigingslaag:

- de kernstatus leeft al op `ContactRequest`
- operators kunnen akkoord, prijsmodus en start readiness vastleggen
- de visibilitylaag laat zien wat klaar, geblokkeerd of nog onvolledig is

Maar er ontbreekt nog een scherp antwoord op:

- is deze commerciële status alleen ingevuld, of ook intern bewust bevestigd
- wie was verantwoordelijk voor de bevestiging
- wanneer is die bevestiging of readiness-review voor het laatst gedaan
- is een startklare lead ook voldoende uitlegbaar richting delivery als er later twijfel ontstaat

De huidige codebase laat die gap ook concreet zien:

- bounded commerce-status leeft op [models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py) en [schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- operatorupdates lopen via [main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- de adminsurface zit in [lead-ops-table.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/lead-ops-table.tsx)
- de huidige zichtbaarheid in [contact-commerce.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-commerce.ts) is goed voor status, maar nog niet sterk genoeg voor interne bevestigingsdiscipline

Deze wave gebruikt dus de bestaande assisted laag, en vermijdt opnieuw:

- brede governance
- multi-step approvals
- finance audit trails
- enterprise policy layers

## Planned User Outcome

Na deze wave moet een Verisight-operator:

- kunnen zien of bounded commerce status alleen bestaat of ook intern bevestigd is
- kunnen zien wie de laatste relevante commerciële bevestiging heeft gedaan
- kunnen zien wanneer agreement/readiness voor het laatst expliciet is herzien
- een bounded lead overtuigender kunnen overdragen aan delivery

Na deze wave moet een Verisight-beheerder:

- minder afhankelijk zijn van losse context in notities
- sneller kunnen onderscheiden tussen:
  - status ingevuld
  - status intern bevestigd
  - status recent herzien
  - status met open reviewtwijfel of blocker

Wat deze wave nog niet hoeft te leveren:

- volledige audit history
- event log per veldwijziging
- 4-eyes approval
- digitale contracten of payments
- brede compliance controls

## Scope In

- een minimale interne confirmation-laag voor bounded commerce
- expliciete attribution voor relevante bounded commerce-beslissingen
- beperkte timestamp/review-signalen voor agreement en start readiness
- compactere operatorweergave van confirmation en reviewstatus
- tests en smoke-validatie voor internal confirmation en auditability
- docs-update van source of truth en bounded commerce contracts

## Scope Out

- publieke checkout of pricing-wijzigingen
- payments, invoices of subscriptions
- brede approval chains of enterprise governance
- immutable audit ledger
- role-based permission redesign
- follow-on route commerce

## Dependencies

- [PHASE_NEXT_STEP_29_BOUNDED_BILLING_AND_CHECKOUT_IMPLEMENTATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_29_BOUNDED_BILLING_AND_CHECKOUT_IMPLEMENTATION_PLAN.md)
- [WAVE_01_BOUNDED_BILLING_AND_CHECKOUT_FOUNDATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_BOUNDED_BILLING_AND_CHECKOUT_FOUNDATION.md)
- [WAVE_02_BOUNDED_BILLING_AND_CHECKOUT_HANDOFF_AND_OPERATOR_VISIBILITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_02_BOUNDED_BILLING_AND_CHECKOUT_HANDOFF_AND_OPERATOR_VISIBILITY.md)

## Key Changes

- bounded commerce verschuift van alleen status en visibility naar interne confirmation discipline
- agreement en start readiness krijgen een minimale accountabilitylaag
- operators krijgen een beter antwoord op `wie bevestigde dit` en `wanneer is dit herzien`
- de wave blijft klein en assisted-first, zonder enterprise audit-ambitie

## Belangrijke Interfaces/Contracts

### 1. Internal Confirmation Contract

Na deze wave moet bounded commerce explicieter kunnen modelleren:

- agreement intern bevestigd of niet
- readiness intern bevestigd of niet
- laatste relevante confirmer of reviewer
- laatste confirmation/reviewmoment

Decision boundary:

- confirmation hoeft geen aparte workflow-engine te worden
- confirmation blijft operatorgedreven
- geen meerstaps approvalmodel

### 2. Minimal Auditability Contract

De wave moet minimaal antwoord geven op:

- wie zette of bevestigde een bounded commerce status
- wanneer is die status voor het laatst expliciet herzien
- is de huidige bounded commerce status voldoende recent en uitlegbaar

Decision boundary:

- geen volledige change history
- geen immutable ledger
- geen compliance platform

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

### 4. Delivery Handoff Trust Contract

Na deze wave moet de deliverykant beter kunnen vertrouwen op bounded commerce state doordat minimaal zichtbaar is:

- intern bevestigd
- recent herzien
- nog open blocker of reviewtwijfel

Decision boundary:

- delivery lifecycle blijft de canonieke uitvoeringslaag
- deze wave bouwt alleen een sterkere pre-delivery trustlaag

## Primary Code Surfaces

- [backend/models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [supabase/schema.sql](/C:/Users/larsh/Desktop/Business/Verisight/supabase/schema.sql)
- [frontend/components/dashboard/lead-ops-table.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/lead-ops-table.tsx)
- [frontend/lib/contact-commerce.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-commerce.ts)
- [frontend/lib/pilot-learning.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/pilot-learning.ts)
- [tests/test_api_flows.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py)

## Work Breakdown

### Track 1 - Confirmation Metadata Contract

Tasks:

- [x] Definieer een minimale confirmation- en reviewmetadata-laag voor bounded commerce.
- [x] Kies de kleinste verdedigbare set velden voor confirmer/reviewer en timestamp.
- [x] Houd de metadata beperkt tot kernroutes en bestaande assisted leadobjecten.

Definition of done:

- [x] Bounded commerce kan intern bevestigd en herzien worden op een expliciete, kleine manier.
- [x] Er is geen nieuw order-, approval- of governanceobject binnengeslopen.

### Track 2 - Backend Validation And Update Rules

Tasks:

- [x] Breid backendcontracten uit voor interne confirmation/auditability.
- [x] Definieer veilige validatieregels tussen agreement, readiness en confirmation.
- [x] Zorg dat buiten-scope routes geen confirmationpad openen.

Definition of done:

- [x] Backend kan bounded confirmation/auditability opslaan en uitleveren voor `ExitScan` en `RetentieScan`.
- [x] De regels blijven begrijpelijker, niet complexer dan nodig.

### Track 3 - Admin Readability And Operator Trust

Tasks:

- [x] Voeg confirmation- en reviewsignals toe aan de lead-ops UI.
- [x] Maak zichtbaar of bounded commerce recent bevestigd, oud of onduidelijk is.
- [x] Houd de UI compact en operator-first.

Definition of done:

- [x] Operators kunnen sneller zien of bounded commerce alleen ingevuld of echt intern bevestigd is.
- [x] Delivery-handoff voelt betrouwbaarder zonder dat de UI een auditdashboard wordt.

### Track 4 - Tests, Docs, and Smoke Validation

Tasks:

- [x] Voeg backend tests toe voor confirmation- en auditabilityregels.
- [x] Voeg frontend helper/UI-tests toe voor confirmation visibility.
- [x] Werk docs en pointers bij.
- [x] Voer een compacte smoke-flow uit op agreement -> confirmation -> readiness review -> readback.

Definition of done:

- [x] Relevante tests zijn groen.
- [x] Internal confirmation en auditability zijn gesmoked.
- [x] Documentatie is synchroon met de implementatie.

## Testplan

### Automated Tests

- [x] Backend tests voor internal confirmation op `ExitScan`
- [x] Backend tests voor internal confirmation op `RetentieScan`
- [x] Tests voor review-/timestamp-attribution op bounded commerce updates
- [x] Regressietests voor buiten-scope routes
- [x] Frontend tests voor confirmation/auditability samenvatting
- [x] Regressietests voor bestaande visibility- en lead-ops flows

### Integration Checks

- [x] `ExitScan` lead kan commercieel bevestigd én intern bevestigd gelezen worden
- [x] `RetentieScan` lead kan commercieel bevestigd én intern bevestigd gelezen worden
- [x] start readiness review toont recente of ontbrekende bevestiging expliciet
- [x] operator kan confirmation-context zien zonder extra workflowspoor
- [x] buiten-scope routes openen geen auditabilitypad

### Smoke Path

1. Maak of gebruik een `ExitScan` lead met commercieel akkoord.
2. Bevestig intern wie akkoord/status heeft gereviewd.
3. Zet start readiness op `ready` of `blocked`.
4. Controleer dat confirmation/review-attribution leesbaar is.
5. Controleer dat de handoff naar delivery nu beter uitlegbaar is.
6. Herhaal minimaal één keer voor `RetentieScan`.
7. Controleer dat een follow-on route geen bounded confirmation/auditability-oppervlak krijgt.

## Current Validation Snapshot

- [x] Scoped backend validation: `.\.venv\Scripts\python.exe -m pytest tests/test_api_flows.py -q -k "contact_request_update or bounded_billing_foundation_smoke_flow"` -> `6 passed`
- [x] Frontend focused helper tests: `cmd /c npm test -- --run contact-commerce.test.ts pilot-learning.test.ts` -> `10 passed`
- [x] Frontend full test suite: `cmd /c npm test` -> `96 passed`
- [x] Frontend route types: `cmd /c npx next typegen` -> groen
- [x] Frontend build: `cmd /c npm run build` -> groen
- [x] Frontend typecheck: `cmd /c npx tsc --noEmit` -> groen in seriele run na build/typegen
- [x] State-driven internal confirmation smoke is afgedekt via API-regressies en helper/UI-validatie

## Assumptions/Defaults

- de grootste resterende bounded commerce-gap zit nu in interne bevestigbaarheid, niet in bredere commercefuncties
- een kleine confirmation- en reviewlaag is waardevoller dan een brede auditgeschiedenis
- attribution mag op bestaande operatorcontext leunen zolang die expliciet genoeg wordt
- de wave blijft volledig assisted-first en core-route-first

## Product Acceptance

- [x] De wave introduceert geen nieuwe checkout- of productbelofte.
- [x] Bounded commerce voelt betrouwbaarder, niet commerciëler of groter.
- [x] De kernroutehiërarchie blijft intact.

## Codebase Acceptance

- [x] Nieuwe code blijft klein en bounded rond confirmation en auditability.
- [x] Geen payment-, invoice-, subscription- of enterprise auditlogica wordt toegevoegd.
- [x] Routegrenzen blijven intact.

## Runtime Acceptance

- [x] Een operator ziet of bounded commerce intern bevestigd en recent herzien is.
- [x] Delivery-handoff is betrouwbaarder uitlegbaar dan in `WAVE_02`.
- [x] Buiten-scope routes blijven buiten het bounded commerce pad.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] Smoke-validatie bevestigt internal confirmation en attribution.
- [x] Er is geen regressie in bestaande lead-, delivery- of visibilityflows.

## Documentation Acceptance

- [x] Dit wave-document blijft synchroon met de feitelijke implementatie.
- [x] Het is na afronding duidelijk dat `WAVE_03` de actieve source of truth was.
- [x] `WAVE_04` kan pas openen na expliciete green close-out van deze wave.

## Risks To Watch

- confirmation-velden worden stiekem een halve approval workflow
- auditability wordt te groot of te enterprise-achtig voor deze bounded track
- operators moeten te veel extra handelingen doen voor een kleine assisted laag
- bestaande leadflow wordt zwaarder zonder echte handoffwinst

## Not In This Wave

- Geen publieke checkout
- Geen payments of invoices
- Geen subscriptions of entitlements
- Geen follow-on commerce
- Geen enterprise audit logging
- Geen identity-, SSO- of governanceplatformwerk

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] bounded commerce intern bevestigbaar is voor `ExitScan` en `RetentieScan`
- [x] minimale attribution en reviewtijd expliciet zichtbaar zijn
- [x] delivery-handoff betrouwbaarder uitlegbaar is dan in `WAVE_02`
- [x] routegrenzen intact zijn gebleven
- [x] code, docs, tests en smoke-validatie groen zijn

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_04_BOUNDED_BILLING_AND_CHECKOUT_DELIVERY_START_GOVERNANCE.md`
