# WAVE_04_ONBOARDING_TRUST_BOUNDARY_AND_QA_PARITY.md

## 1. Title

Bring onboarding trust visibility, checkpoint boundaries, and QA discipline up to parity level without widening onboarding beyond its single-checkpoint and assisted product role.

## 2. Korte Summary

Deze wave volgde direct op:

- [WAVE_03_ONBOARDING_REPORT_AND_FORMAL_OUTPUT_PARITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_03_ONBOARDING_REPORT_AND_FORMAL_OUTPUT_PARITY.md)
- [ONBOARDING_PARITY_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/ONBOARDING_PARITY_WAVE_STACK_PLAN.md)

De kern van deze wave was:

- trust-, boundary- en thresholdtaal gelijk trekken tussen onboarding-dashboard en report
- regressies verdiepen op precies de bounded claims van onboarding
- acceptance harder maken tegen ongemerkte verschuiving naar client onboarding, journey-engine of retentiepredictie

Status van deze wave:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: completed; next parity wave may open
- Next allowed wave after green completion: `WAVE_05_ONBOARDING_PARITY_CLOSEOUT.md`

Huidige implementatie-uitkomst:

- onboarding-reporttaal noemt nu explicieter de `5 / 10 responses`-drempels en blijft strak single-checkpoint in [report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/onboarding/report_content.py)
- dashboard- en reportregressies bewaken nu explicieter bounded handoff, client-onboarding boundary en non-predictive taal in [dashboard.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/dashboard.test.ts) en [test_onboarding_scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_onboarding_scoring.py)
- onboarding acceptance is nu paritywaardiger zichtbaar in repo-brede tests

Validatie die groen is:

- `pytest tests/test_onboarding_scoring.py -q` -> `5 passed`
- `pytest tests/test_api_flows.py tests/test_onboarding_scoring.py -q` -> `52 passed`
- `npm test -- --run lib/products/onboarding/dashboard.test.ts` -> `4 passed`
- `npm test` -> `98 passed`
- `npm run build` -> groen
- `npx next typegen` -> groen
- `npx tsc --noEmit` -> groen

## 3. Key Changes

- expliciete threshold-note toegevoegd voor onboarding-reporting
- signal-, methodiek- en vervolgstappagina's inhoudelijk gelijkgetrokken rond single-checkpoint, non-journey en non-predictive claims
- dashboardtests uitgebreid met bounded handoff-verwachtingen
- backendtests uitgebreid op threshold- en boundarycontracten van onboarding-reporting

## 4. Acceptance

### Product acceptance
- [x] Onboarding leest nu explicieter als bounded single-checkpoint managementread.
- [x] Het product schuift niet ongemerkt op naar bredere lifecycle- of client-onboardingclaims.

### Codebase acceptance
- [x] Wijzigingen bleven klein en productspecifiek.
- [x] Er is geen nieuwe onboarding-scope mee geopend.

### Runtime acceptance
- [x] Dashboard en report dragen nu hetzelfde trust- en boundaryverhaal.
- [x] Indicatieve versus patroonread-drempels zijn explicieter zichtbaar.

### QA acceptance
- [x] Onboarding trust- en boundaryclaims zijn explicieter regressiegedekt.
- [x] Repo-brede frontend- en backend-gates zijn groen.

### Documentation acceptance
- [x] Dit wavedocument is synchroon met de feitelijke implementatie.

## 5. Exit Gate

Deze wave is klaar wanneer:

- [x] dashboard en report dezelfde bounded onboardingtaal voeren
- [x] threshold- en non-predictive grenzen expliciet bewaakt zijn
- [x] code, docs, tests en validatie groen zijn

## 6. Next Allowed Wave

Na green close-out van deze wave mag nu openen:

- `WAVE_05_ONBOARDING_PARITY_CLOSEOUT.md`
