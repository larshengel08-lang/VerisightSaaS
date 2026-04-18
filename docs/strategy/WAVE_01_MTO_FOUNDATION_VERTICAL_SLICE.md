# WAVE_01_MTO_FOUNDATION_VERTICAL_SLICE

## Status

- Wave status: green_completed
- Active source of truth: dit document
- Build permission: executed
- Next allowed wave after green completion: `WAVE_02_MTO_MANAGEMENT_READ_AND_DASHBOARD_DEPTH.md`

## Title

Open de eerste end-to-end MTO vertical slice binnen de bestaande Verisight campaign-centered runtime, zonder rapportgeneratie, action logging of buyer-facing activatie.

## Boundary

Deze wave opent MTO als nieuwe, zwaardere hoofdmeting in een aparte track en laat MTO bewust landen als:

- `scan_type = mto`
- `delivery_mode = baseline` only
- `group_level_only = true`
- volledige MTO-survey, geen subsetroute
- eerste brede managementread in dashboard
- geen rapportlaag
- geen action log
- geen buyer-facing hoofdroute

Niet geopend in deze wave:

- PDF-rapport voor MTO
- formele report-to-action flow
- action logging
- suitebrede vervanging van bestaande routes
- live/ritme-route voor MTO

## Executed Scope

### Runtime registration and campaign setup

- [x] `mto` toegevoegd aan gedeelde backend- en frontend scan type-contracten
- [x] backend/frontend productregistries uitgebreid met MTO-module
- [x] campaign create-flow laat `scan_type = mto` toe
- [x] MTO is baseline-only afgedwongen in schema, setupcopy en delivery helperlaag
- [x] admin setup-flow toont MTO als nieuwe productkeuze met expliciete wave-1 boundary

### MTO survey and submit flow

- [x] nieuwe backend productmodule geopend in `backend/products/mto/*`
- [x] nieuwe frontend productmodule geopend in `frontend/lib/products/mto/*`
- [x] MTO surveydefinitie aangesloten op bestaande survey runtime
- [x] productspecifieke submit-validatie voor MTO toegevoegd
- [x] MTO-submit slaat output op in bestaande response-keten en `full_result`

### Scoring, aggregation, interpretation

- [x] MTO scoringcontract toegevoegd met brede hoofdmeting-read
- [x] MTO summary, theme priorities en boundary state opgeslagen
- [x] suppressie-/aggregatiegrenzen blijven op bestaande veilige displaydrempels leunen
- [x] fallback-copy toegevoegd voor onvoldoende respons of nog niet veilige read

### Dashboard foundation slice

- [x] minimale MTO dashboardmodule levert top summary, managementblokken en follow-through cards
- [x] campaign detail page toont MTO-specifieke hero-, handoff-, actie- en routecopy
- [x] MTO heeft in wave 1 expliciet geen PDF-downloadroute
- [x] campaign page, methodologylaag en onboarding/readiness copy zijn aangepast zodat MTO niet terugvalt op ExitScan-copy

## Implemented Surfaces

- `backend/products/mto/__init__.py`
- `backend/products/mto/definition.py`
- `backend/products/mto/scoring.py`
- `backend/products/shared/registry.py`
- `backend/scan_definitions.py`
- `backend/schemas.py`
- `frontend/lib/products/mto/index.ts`
- `frontend/lib/products/mto/definition.ts`
- `frontend/lib/products/mto/dashboard.ts`
- `frontend/lib/products/mto/focus-questions.ts`
- `frontend/lib/products/mto/action-playbooks.ts`
- `frontend/lib/products/shared/registry.ts`
- `frontend/lib/types.ts`
- `frontend/lib/implementation-readiness.ts`
- `frontend/lib/client-onboarding.ts`
- `frontend/components/dashboard/new-campaign-form.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- `frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx`
- `templates/survey/retention-signals.html`
- `supabase/schema.sql`

## Validation

Fresh validation run for this wave:

- [x] `C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_mto_scoring.py tests/test_api_flows.py -k "mto" -q`
- [x] `C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_portfolio_architecture_program.py -q`
- [x] `cmd /c npm test -- --run lib/products/mto/dashboard.test.ts`
- [x] `cmd /c npx tsc --noEmit`

Observed result:

- backend MTO scoring and API tests green
- portfolio architecture contract green
- frontend MTO dashboard tests green
- frontend TypeScript compile green

## Closeout

Wave 1 is green omdat:

- een admin nu een MTO-campaign kan openen
- een respondent een MTO-survey kan submitten via de bestaande runtime
- de backend de MTO-submissie productspecifiek valideert en scoort
- het dashboard een eerste brede MTO-read toont
- de wave-1 grenzen expliciet dicht blijven rond rapport, action logging en buyer-facing activatie

Belangrijke bounded keuze die bewust blijft staan:

- MTO gebruikt in wave 1 een volledige survey en geen module-subsets
- MTO toont een interne hoofdmeting-read, geen rapportlaag
- MTO blijft assisted en intern-first

## Next Allowed Step

Open `WAVE_02_MTO_MANAGEMENT_READ_AND_DASHBOARD_DEPTH.md` als nieuwe actieve source of truth en werk daarna alleen de daarin toegestane verdieping uit.
