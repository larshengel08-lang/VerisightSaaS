# WAVE_01_ONBOARDING_METHOD_AND_INTERPRETATION_PARITY.md

## 1. Title

Strengthen onboarding method identity and checkpoint interpretation so `Onboarding 30-60-90` reads as a more mature bounded lifecycle product, without widening it into a journey engine or broader onboarding suite.

## 2. Korte Summary

Deze wave volgde direct op:

- [ONBOARDING_PARITY_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/ONBOARDING_PARITY_WAVE_STACK_PLAN.md)
- [ONBOARDING_PARITY_GAP_ANALYSIS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/ONBOARDING_PARITY_GAP_ANALYSIS_PLAN.md)

De kern van deze eerste parity-wave was:

- onboarding methodisch zelfstandiger maken
- de betekenis van het checkpointmodel scherper maken
- de interpretatielaag rijker en rustiger maken

Deze wave deed niet:

- report/PDF parity
- buyer-facing routewijzigingen
- journey-engine, hire-date logica of multi-checkpoint automation
- bredere lifecycle software

Deze wave deed wel:

- checkpointmethodiek en productspecifieke taal aanscherpen
- het verschil tussen onboarding-checkpoint, retentieframing en client onboarding scherper maken
- interpretatiegrenzen en bounded lifecycle-read explicieter verankeren

Status van deze wave:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: completed; next parity wave may open
- Next allowed wave after green completion: `WAVE_02_ONBOARDING_DASHBOARD_AND_MANAGEMENT_DEPTH_PARITY.md`

Huidige implementatie-uitkomst:

- onboarding heeft nu explicietere checkpointmodel- en interpretatiesummaryvelden in de backend scoringlaag
- de frontend productdefinitie en dashboardtaal maken nu helderder dat onboarding een bounded single-checkpoint lifecycle triage is
- regressies borgen nu explicieter het onderscheid met journey, retentievoorspelling en client onboarding
- validatie is groen:
  - `pytest tests/test_onboarding_scoring.py -q` -> `3 passed`
  - `npm test -- --run lib/products/onboarding/dashboard.test.ts` -> `4 passed`
  - `npm test` -> `98 passed`
  - `npm run build` -> groen
  - `npx next typegen` -> groen
  - `node node_modules\\typescript\\bin\\tsc --noEmit` -> groen

---

## 3. Why This Wave Now

De onboarding parity-gapanalyse liet zien:

- buyer-facing route en trust posture zijn al relatief sterk
- de grootste objectieve parity-gap zit later in report/output
- maar de eerste stap hoorde nu naar methodiek en interpretatie te gaan

De codebase bevestigde dat:

- [backend/products/onboarding/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/onboarding/scoring.py) had nog een relatief compacte summary
- [frontend/lib/products/onboarding/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/definition.ts) was inhoudelijk goed, maar kon methodisch nog scherper
- [frontend/lib/products/onboarding/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/dashboard.ts) had al sterke checkpointstates, maar de bounded lifecycle-identiteit kon nog explicieter

Daarom opende parity hier eerst op method and interpretation, niet op report.

---

## 4. Scope In

- methodische checkpointidentiteit
- rijkere onboarding-interpretatie
- explicietere bounded lifecyclegrenzen
- tests, docs en validatie voor method/interpretation parity

## 5. Scope Out

- report/PDF parity
- buyer-facing routewijzigingen
- journey engine
- hire-date orchestration
- multi-checkpoint automation
- bredere lifecycle-suite

---

## 6. Acceptance

### Product acceptance
- [x] onboarding leest minder als smalle snapshot en meer als bounded checkpointproduct
- [x] het verschil met client onboarding, retentievoorspelling en journeylogica is productmatig scherper

### Codebase acceptance
- [x] wijzigingen blijven klein en productgericht
- [x] geen scopeverbreding zonder directe parityreden

### Runtime acceptance
- [x] dashboard en backend summary dragen een duidelijker checkpointmodel
- [x] bounded lifecyclegrenzen blijven intact

### QA acceptance
- [x] relevante onboarding regressies zijn groen

### Documentation acceptance
- [x] dit wavedocument is synchroon met implementatie en gating

---

## 7. Next Allowed Wave

Na green close-out van deze wave mag nu openen:

- `WAVE_02_ONBOARDING_DASHBOARD_AND_MANAGEMENT_DEPTH_PARITY.md`
