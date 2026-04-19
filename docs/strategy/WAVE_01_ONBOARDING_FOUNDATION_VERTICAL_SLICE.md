# WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE

## Title

Open the first end-to-end onboarding vertical slice inside the current Verisight campaign-centered runtime, without broad lifecycle expansion.

## Korte Summary

Deze wave bouwt de eerste echte `Onboarding 30-60-90`-slice, maar bewust nog niet de volledige productlijn. Het doel is om onboarding als nieuwe productline technisch en productmatig te laten landen binnen de bestaande Verisight-architectuur: een admin moet een onboarding-campaign kunnen aanmaken, respondenten moeten een onboarding-survey kunnen invullen, de backend moet de submissie kunnen verwerken, en het dashboard moet een eerste minimale checkpoint-read voor onboarding kunnen tonen.

Deze wave is expliciet een foundation vertical slice. Dat betekent: wel een volledige end-to-end flow, maar nog zonder multi-checkpoint orchestration, buyer-facing activatie of volledige reportlaag. `Onboarding 30-60-90` moet in deze wave aantonen dat het een eigen productline kan worden zonder te vervallen in client onboarding met surveyvragen, en zonder de huidige ExitScan/RetentieScan/Pulse/TeamScan-runtime te destabiliseren.

Status van deze wave:

- Wave status: implemented_green
- Active source of truth after approval: dit document
- Build permission: uitgevoerd
- Next allowed wave after green completion: `WAVE_02_ONBOARDING_CHECKPOINT_INTERPRETATION_AND_BOUNDARIES.md`

## Why This Wave Now

Deze wave volgt logisch uit de eerdere onboarding-stappen:

- `Onboarding 30-60-90` is vastgezet als de volgende productline-candidate na `TeamScan`
- de productgrens is scherp gemaakt als vroege lifecycle-scan voor nieuwe medewerkers
- de architectuur is bewust campaign-centered gehouden
- de governance laat maar een enkele actieve build wave tegelijk toe
- `single_checkpoint_per_campaign` is gelockt als de veilige v1-richting

De huidige codebase geeft hiervoor ook een concreet startpunt:

- `scan_type`-routing bestaat al productspecifiek via backend- en frontendregistries
- de runtime draait nu al op `Organization -> Campaign -> Respondent -> SurveyResponse`
- campaign creation, surveyflow, scoringflow en dashboardflow bestaan al end-to-end
- `department` en `role_level` bestaan al als optionele contextvelden
- derived dashboard-output bestaat al per productlijn, zonder nieuw generiek run- of artifactmodel

Deze wave gebruikt die bestaande basis en vermijdt bewust nieuwe lifecycle-objecten.

## Planned User Outcome

Na deze wave moet een Verisight-beheerder:

- een onboarding-campaign kunnen aanmaken
- respondenten kunnen importeren en uitnodigen
- een onboarding-survey kunnen laten invullen
- in het dashboard een eerste onboarding-managementread kunnen openen

Na deze wave moet een klantgebruiker:

- een onboarding-campaign in het dashboard kunnen bekijken
- een eerste onboarding-snapshot kunnen lezen voor precies één checkpoint
- expliciet kunnen zien dat dit nog geen brede `30-60-90` journey-automation of trendlaag is

Wat deze wave nog niet hoeft te leveren:

- meerdere checkpoints in één flow
- hire-date routing
- publieke onboarding-productpagina of pricing
- volwaardig onboarding-PDF-rapport
- cross-checkpoint vergelijking
- teamlokalisatie of bredere managementhandoff

## Scope In

- uitbreiding van `scan_type` naar `onboarding` in shared types, registries en campaignflow
- nieuwe onboarding productmodule in backend en frontend
- minimale onboarding surveydefinitie en onboarding survey rendering
- product-aware submit- en validatielogica voor onboarding
- eerste onboarding scoring- en interpretation contract
- opslag van onboarding-uitkomsten binnen de bestaande campaign/respondent/response-keten
- campaign-level checkpoint contract voor één onboardingmoment
- minimale onboarding dashboardweergave en campaign-page support
- admin setup voor onboarding-campaigns binnen huidige beheerflow
- tests en smoke-validatie voor volledige onboarding foundation slice
- docs-update van actieve source of truth en relevante contracts

## Scope Out

- multi-checkpoint orchestration binnen één productflow
- hire-date, start-date of cohort-engine
- publieke onboarding routeactivatie in marketing of pricing
- volwaardige onboarding reportgenerator of PDF-output
- nieuwe lifecycle-objecten of state machines
- trend- of delta-logica tussen checkpoints
- TeamScan-, Pulse- of andere productuitbreiding

## Dependencies

- [PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_7_ONBOARDING_MASTER_INDEX_AND_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_7_ONBOARDING_MASTER_INDEX_AND_WAVE_STACK_PLAN.md)

## Key Changes

- `Onboarding 30-60-90` wordt toegevoegd als vijfde productspecifieke module naast `exit`, `retention`, `pulse` en `team`.
- De gedeelde `scan_type`- en registrylaag wordt uitgebreid zonder nieuw generiek lifecyclemodel.
- De survey submit-keten wordt product-aware genoeg gemaakt om een onboarding payload toe te laten zonder bestaande producten te breken.
- De huidige campaign setup-flow wordt uitgebreid met onboarding, maar voor deze wave alleen als één checkpoint per campaign.
- Het dashboard krijgt een eerste onboarding-viewmodel dat een actuele checkpoint-snapshot toont zonder journey-, retentie- of performanceclaims.
- PDF-download en buyer-facing activatie blijven expliciet buiten scope voor deze wave.

## Implementation Snapshot

- `scan_type = onboarding` is live in de backend- en frontendregistries, shared types, schemas en campaign setup.
- De backend productmodule staat in [backend/products/onboarding](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/onboarding) met compacte checkpointvalidatie, scoring en `onboarding_summary`.
- De frontend productmodule staat in [frontend/lib/products/onboarding](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding) met definition, focusvragen, playbooks en dashboard view model.
- De campaign adminflow ondersteunt onboarding in [new-campaign-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/new-campaign-form.tsx) en bounded onboarding-copy in de dashboardflows.
- De campaign detailpagina ondersteunt onboarding in [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx) en [page-helpers.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx).
- Onboarding-PDF blijft bewust dicht; de reportroute geeft in deze wave expliciet `422`.

## Validation Snapshot

- Backend tests: `.\.venv\Scripts\python.exe -m pytest tests/test_onboarding_scoring.py tests/test_api_flows.py tests/test_portfolio_architecture_program.py -q` -> `40 passed`
- Frontend tests: `cmd /c npm test` -> `83 passed`
- Typecheck: `cmd /c npx tsc --noEmit` -> groen
- Production build: `cmd /c npm run build` -> groen
- Onboarding smoke: campaign create `201`, respondent import `200`, survey load `200`, submit `200`, stats `200`, report bewust `422`

## Belangrijke Interfaces/Contracts

### 1. Scan Type Contract

Na deze wave moet `onboarding` ondersteund worden in:

- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [frontend/lib/scan-definitions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/scan-definitions.ts)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- relevante campaign- en dashboardflows

Contract:

- `scan_type = 'exit' | 'retention' | 'pulse' | 'team' | 'onboarding'`

Decision boundary:

- alleen `scan_type` wordt uitgebreid
- geen nieuw generiek producttype- of runmodel

### 2. Onboarding Campaign Contract

De eerste onboarding-campaign in deze wave gebruikt bewust de bestaande campaign abstraction.

Contract:

- `scan_type = 'onboarding'`
- `delivery_mode = 'baseline'`
- `checkpoint_scope = 'single_checkpoint_per_campaign'`
- `department` en `role_level` blijven optionele context, geen vereiste lifecycle-engine

Decision boundary:

- voor `WAVE_01` krijgt onboarding geen slimme scheduler voor `30`, `60` of `90` dagen
- een onboarding-campaign staat voor precies één checkpointread

### 3. Onboarding Survey Contract

De eerste onboarding-survey moet passen bij vroege integratie en tegelijk binnen de bestaande surveyketen passen.

Minimale productregels:

- gericht op vroege integratie, rolduidelijkheid, leidingsteun en teaminbedding
- bruikbaar als managementread op een enkel checkpoint
- geen brede cultuurdiagnose
- geen individuele beoordeling of performance-instrument

Technisch contract voor deze wave:

- nieuwe onboarding surveydefinitie
- onboarding surveytemplate of onboarding partial
- product-aware submit-validatie
- compatibel met huidige tokenized surveyflow

Decision boundary:

- geen generieke survey builder
- geen brede custom questionnaire engine

### 4. Onboarding Submission and Persistence Contract

De submit-keten moet onboarding kunnen verwerken zonder bestaande producten te destabiliseren.

Contract:

- onboarding-validatie gebeurt productspecifiek via nieuwe onboarding module
- onboarding scoring output komt in bestaande `SurveyResponse`-keten terecht
- onboarding mag gebruikmaken van `full_result` voor productspecifieke output
- bestaande responseopslag blijft de system of record

Decision boundary:

- geen nieuwe `Run`-tabel
- geen aparte onboarding-results store

### 5. Onboarding Dashboard Contract

De eerste onboarding-dashboardread moet minimaal tonen:

- checkpoint summary van het huidige meetmoment
- vroege succesfactoren en vroege frictiefactoren
- eerste managementvraag op dit checkpoint
- duidelijke begrenzing dat dit nog geen multi-checkpoint journey- of trendanalyse is

Contract:

- onboarding krijgt een eigen frontend productmodule en dashboard view model
- onboarding landt in de bestaande campaign page
- report download wordt voor onboarding in deze wave verborgen, gedeactiveerd of expliciet nog niet ondersteund

Decision boundary:

- geen PDF-report verplicht in `WAVE_01`
- geen vergelijking tussen `30`, `60` en `90` dagen verplicht in `WAVE_01`

### 6. Onboarding Interpretation Contract

De eerste onboarding-output moet expliciet begrensd blijven.

Contract:

- `group_level_only = true`
- `individual_prediction = forbidden`
- `manager_performance_claim = forbidden`
- `mixed_checkpoint_population_forbidden = true`

Decision boundary:

- geen onboarding-output die doet alsof dit al een volledige first-90-days journey-read is
- geen claims over individueel slagen, falen of vertrekkans

## Primary Code Surfaces

### Shared / Platform

- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [frontend/lib/scan-definitions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/scan-definitions.ts)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [frontend/components/dashboard/new-campaign-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/new-campaign-form.tsx)

### New Onboarding Module Surfaces

- `backend/products/onboarding/__init__.py`
- `backend/products/onboarding/definition.py`
- `backend/products/onboarding/scoring.py`
- `backend/products/onboarding/report_content.py` only if minimally required, otherwise defer
- `frontend/lib/products/onboarding/index.ts`
- `frontend/lib/products/onboarding/definition.ts`
- `frontend/lib/products/onboarding/dashboard.ts`
- `frontend/lib/products/onboarding/focus-questions.ts`
- `frontend/lib/products/onboarding/action-playbooks.ts`

### Survey Surfaces

- [templates/survey.html](/C:/Users/larsh/Desktop/Business/Verisight/templates/survey.html)
- `templates/survey/onboarding-*.html`
- [frontend/app/survey/[token]/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/survey/[token]/route.ts)

### Dashboard Surfaces

- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- relevante `page-helpers.tsx` indien nodig
- [frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx)

## Work Breakdown

### Track 1 - Runtime Registration and Campaign Setup

Tasks:

- [x] Voeg `onboarding` toe aan gedeelde type- en registrylagen in backend en frontend.
- [x] Breid campaign setup uit zodat een admin onboarding als product kan kiezen.
- [x] Beperk onboarding in deze wave tot één checkpoint per campaign binnen de bestaande `delivery_mode`-logica.
- [x] Zorg dat bestaande exit/retention/pulse/team setupflows intact blijven.

Definition of done:

- [x] Een onboarding-campaign kan in de huidige adminflow technisch worden aangemaakt.
- [x] Productregistratie resolveert onboarding correct in backend en frontend.
- [x] Geen regressie in bestaande campaign-creatie.

### Track 2 - Onboarding Survey and Submit Flow

Tasks:

- [x] Ontwerp een onboarding surveydefinitie die past bij vroege integratie zonder brede lifecycle- of cultuurverbreding.
- [x] Voeg onboarding survey rendering toe in de bestaande tokenized surveyflow.
- [x] Maak de submit-validatie product-aware genoeg voor onboarding.
- [x] Map onboarding-antwoorden naar bestaande persistence zonder nieuwe runtime-entiteiten.

Definition of done:

- [x] Een respondent kan een onboarding-survey laden en succesvol submitten.
- [x] De backend valideert en verwerkt onboarding submissions productspecifiek.
- [x] Bestaande submitcontracten blijven werken.

### Track 3 - Onboarding Scoring and Dashboard Read

Tasks:

- [x] Voeg een eerste onboarding scoring- en interpretation contract toe in de nieuwe productmodule.
- [x] Bouw een minimale dashboardread voor checkpoint summary, vroege succesfactoren en vroege frictiefactoren.
- [x] Verberg, deactiveer of begrens report/PDF-gedrag voor onboarding in deze wave.
- [x] Maak expliciet in de UI dat dit nog geen multi-checkpoint read of trendlaag is.

Definition of done:

- [x] Het dashboard toont een minimale, coherente onboarding managementsnapshot.
- [x] De read blijft begrensd tot één checkpoint zonder overclaiming.
- [x] Report/PDF-support breekt niet en blijft expliciet buiten scope waar nodig.

### Track 4 - Tests, Smoke, and Documentation

Tasks:

- [x] Voeg tests toe voor scan-type registratie, onboarding survey submit en dashboard rendering.
- [x] Voeg een smoke-pad toe voor campaign create -> respondent import -> survey load -> submit -> stats.
- [x] Werk docs en source-of-truth status bij na uitvoering.
- [x] Controleer dat bestaande producttests groen blijven.

Definition of done:

- [x] Relevante backend- en frontendtests zijn groen.
- [x] Een onboarding foundation smoke-pad is groen.
- [x] Dit wave-document en eventuele gekoppelde governance-docs zijn synchroon met de implementatie.

## Testplan

### Automated Tests

- [x] `onboarding` wordt correct herkend in gedeelde type- en registrylagen.
- [x] Backend- en frontendtests bewaken onboarding submit- en dashboardgedrag.
- [x] Bestaande regressietests voor eerdere productlijnen blijven groen.

### Integration Checks

- [x] Een onboarding-campaign kan worden aangemaakt in de bestaande adminflow.
- [x] Een onboarding respondent kan een survey laden en submitten.
- [x] Het dashboard toont een beperkte onboarding snapshot zonder trendclaims.
- [x] PDF/reportgedrag blijft veilig begrensd.

### Smoke Path

1. Maak een onboarding-campaign aan.
2. Importeer of maak respondenten aan.
3. Open `/survey/{token}` voor onboarding.
4. Submit de onboarding survey.
5. Open de campaign stats/dashboardread.
6. Bevestig dat output een enkel checkpoint laat zien zonder multi-checkpoint of individuele claims.

## Assumptions/Defaults

- onboarding v1 blijft een assisted productvorm, geen self-serve lifecycle tool
- de eerste slice gebruikt één checkpoint per campaign
- `department` en `role_level` blijven optionele context, geen dragende lifecycledata
- buyer-facing activatie en brede lifecycle-automation blijven later

## Product Acceptance

- [x] Onboarding voelt als een echte lifecycle-scan voor nieuwe medewerkers, niet als client onboarding met surveyvragen.
- [x] De eerste slice levert managementwaarde op een enkel checkpoint.
- [x] De output claimt niet meer dan de huidige v1-basis werkelijk draagt.

## Codebase Acceptance

- [x] Publieke onboarding-activatie blijft buiten scope.
- [x] De implementatie blijft begrensd tot bestaande campaign-centered runtime-oppervlakken.
- [x] Er wordt geen lifecycle-engine, hire-date scheduler of nieuw primair runtime-object toegevoegd.

## Runtime Acceptance

- [x] Onboarding werkt end-to-end binnen de bestaande campaign/respondent/response-keten.
- [x] Bestaande producten blijven functioneel intact.
- [x] Onboarding report/PDF blijft buiten scope of expliciet begrensd.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] Het onboarding foundation smoke-pad is uitgevoerd.
- [x] De eerste slice vergroot geen semantische verwarring met client onboarding.

## Documentation Acceptance

- [x] Dit wave-document is synchroon met de feitelijke implementatie.
- [x] De onboarding planning stack blijft gesloten en consistent na uitvoering.
- [x] De volgende toegestane wave is na green close-out eenduidig.

## Risks To Watch

- onboarding kan alsnog te veel op client onboarding gaan lijken in copy of UI
- het ontbreken van hire-date/checkpointmetadata kan de eerste slice inhoudelijk te smal maken
- onboarding kan te snel worden gelezen als vroege retentiepredictie in plaats van checkpoint-read
- semantische overlap met bredere lifecycle- of employee-journey claims blijft een risico

## Not In This Wave

- Geen hire-date- of cohortengine
- Geen multi-checkpoint orchestration
- Geen onboarding PDF/reportopening
- Geen buyer-facing onboardingroute
- Geen pricing, billing of entitlementwerk
- Geen nieuwe productlijn buiten onboarding

## Exit Gate

- [x] onboarding buyer-facing nog niet geactiveerd
- [x] een onboarding-campaign kan end-to-end draaien
- [x] dashboard-output toont een begrensde checkpoint-read
- [x] tests en smoke-validatie zijn groen
- [x] bestaande producten zijn niet geregreerd

## Next Allowed Wave

Na green close-out van deze wave is de volgende toegestane stap:

- `WAVE_02_ONBOARDING_CHECKPOINT_INTERPRETATION_AND_BOUNDARIES.md`
