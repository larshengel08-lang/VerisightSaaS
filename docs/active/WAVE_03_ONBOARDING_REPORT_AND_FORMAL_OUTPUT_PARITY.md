# WAVE_03_ONBOARDING_REPORT_AND_FORMAL_OUTPUT_PARITY.md

## 1. Title

Close the largest objective onboarding parity gap by replacing the former `422` report boundary with bounded, management-grade formal output that matches the current onboarding dashboard and buyer-facing promise.

## 2. Korte Summary

Deze wave volgde direct op:

- [WAVE_02_ONBOARDING_DASHBOARD_AND_MANAGEMENT_DEPTH_PARITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_02_ONBOARDING_DASHBOARD_AND_MANAGEMENT_DEPTH_PARITY.md)
- [ONBOARDING_PARITY_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/ONBOARDING_PARITY_WAVE_STACK_PLAN.md)

De parity-gap die hier openstond was scherp:

- onboarding had al managementwaardige dashboardoutput
- buyer-facing positionering was al bounded en geloofwaardig
- de formele reportlaag ontbrak nog volledig doordat onboarding bewust `422` gaf op de reportroute

Deze wave deed daarom wel:

- onboarding report/output parity openen
- een bounded onboarding-specifieke reportlaag bouwen
- dashboard, formal output en reportroute inhoudelijk alignen
- de generieke PDF-ervaring voor onboarding echt ondersteund maken

Deze wave deed niet:

- journey engine of multi-checkpoint logica
- buyer-facing scopeverbreding
- trust/QA closeout als aparte hoofdlevering

Status van deze wave:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: completed; next parity wave may open
- Next allowed wave after green completion: `WAVE_04_ONBOARDING_TRUST_BOUNDARY_AND_QA_PARITY.md`

Huidige implementatie-uitkomst:

- Onboarding heeft nu een eigen bounded reportlaag in [report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/onboarding/report_content.py).
- De backend reportroutes ondersteunen onboarding nu naast `exit`, `retention` en `team` in [main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py).
- De gedeelde report-engine verwerkt onboarding nu productspecifiek in [report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py).
- De dashboard-PDF-flow behandelt onboarding nu als ondersteunde reportroute in [pdf-download-button.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx).

Validatie die groen is:

- `pytest tests/test_onboarding_scoring.py -q` -> `4 passed`
- `pytest tests/test_api_flows.py -q -k "onboarding_report_route_returns_pdf or onboarding"` -> `4 passed`
- `npm test` -> `98 passed`
- `npm run build` -> groen
- `npx next typegen` -> groen
- `npx tsc --noEmit` -> groen

## 3. Key Changes

- bounded onboarding-reportpayloads toegevoegd voor managementsamenvatting, methodiek, signaalpagina, hypothesen en vervolgstappen
- `422` reportboundary voor onboarding verwijderd
- onboarding reporttaal expliciet single-checkpoint, non-journey en non-client-onboarding gehouden
- regressies toegevoegd voor reportpayloads en de onboarding PDF-route

## 4. Acceptance

### Product acceptance
- [x] Onboarding heeft nu formele output die niet meer duidelijk achterloopt op het dashboard.
- [x] De bounded single-checkpoint productvorm bleef intact.

### Codebase acceptance
- [x] Wijzigingen bleven productspecifiek.
- [x] Er is geen nieuwe lifecycle-engine of platformlaag mee geopend.

### Runtime acceptance
- [x] Onboarding reportroute levert nu PDF-output in plaats van `422`.
- [x] Dashboard en report vertellen hetzelfde bounded onboardingverhaal.

### QA acceptance
- [x] Onboarding reportpayloads zijn regressiegedekt.
- [x] De onboarding PDF-route is API-matig groen.

### Documentation acceptance
- [x] Dit wavedocument is synchroon met de feitelijke implementatie.

## 5. Exit Gate

Deze wave is klaar wanneer:

- [x] onboarding formele output heeft in plaats van alleen dashboardoutput
- [x] de reportroute productspecifiek en bounded werkt
- [x] code, docs, tests en validatie groen zijn

## 6. Next Allowed Wave

Na green close-out van deze wave mag nu openen:

- `WAVE_04_ONBOARDING_TRUST_BOUNDARY_AND_QA_PARITY.md`
