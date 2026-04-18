# WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE

## Title

Open the first end-to-end Pulse vertical slice inside the current Verisight campaign-centered runtime, without broad suite expansion.

## Korte Summary

Deze wave bouwt de eerste echte `Pulse`-slice, maar bewust nog niet de volledige productlijn. Het doel is om `Pulse` als nieuwe productline technisch en productmatig te laten landen binnen de bestaande Verisight-architectuur: een admin moet een Pulse-campaign kunnen aanmaken, respondenten moeten een compacte Pulse-survey kunnen invullen, de backend moet de Pulse-submissie kunnen verwerken, en het dashboard moet een eerste minimale managementread voor Pulse kunnen tonen.

Deze wave is expliciet een foundation vertical slice. Dat betekent: wel een volledige end-to-end flow, maar nog zonder trendvergelijking, publieke routeactivatie of volledige reportlaag. `Pulse` moet in deze wave aantonen dat het een eigen productline kan worden zonder te vervallen in "RetentieScan ritme met een andere naam" en zonder de huidige ExitScan/RetentieScan-runtime te destabiliseren.

Status van deze wave:

- Wave status: implemented_green
- Active source of truth after approval: dit document
- Build permission: uitgevoerd
- Next allowed wave after green completion: `WAVE_02_PULSE_REVIEW_LOOP_AND_DELTA_LOGIC.md`

## Why This Wave Now

Deze wave volgt logisch uit de eerdere stappen:

- `Pulse` is in Phase 1 vastgezet als eerstvolgende productline
- de architectuur is in Phase 2 bewust campaign-centered gehouden
- de governance uit Phase 3 laat maar een enkele actieve build wave tegelijk toe
- `Pulse` moet eerst een echte runtime- en productbasis bewijzen voordat trendlogica, buyer-facing activatie of verdere suite-uitbreiding mag openen

De huidige codebase geeft hiervoor een duidelijk startpunt:

- productmodules bestaan al per `scan_type`
- campaigns zijn de huidige fulfillment units
- surveyflow, scoringflow en dashboardflow bestaan al end-to-end
- `enabled_modules` bestaat al als mechanisme om factorselectie per campaign te sturen

Deze wave gebruikt die bestaande basis en vermijdt bewust generieke nieuwe runtime-objecten.

## Planned User Outcome

Na deze wave moet een Verisight-beheerder:

- een Pulse-campaign kunnen aanmaken
- respondenten kunnen importeren en uitnodigen
- een compacte Pulse-survey kunnen laten invullen
- in het dashboard een eerste Pulse-managementread kunnen openen

Na deze wave moet een klantgebruiker:

- een Pulse-campaign in het dashboard kunnen bekijken
- een eerste Pulse-snapshot kunnen lezen als managementsignaal op dit meetmoment

Wat deze wave nog niet hoeft te leveren:

- vergelijking met een vorige Pulse-cyclus
- publieke Pulse-productpagina of pricing
- volwaardig Pulse-PDF-rapport
- teamlokalisatie

## Scope In

- uitbreiding van `scan_type` naar `pulse` in shared types, registries en campagneflow
- nieuwe Pulse productmodule in backend en frontend
- compacte Pulse surveydefinitie en Pulse survey rendering
- product-aware submit- en validatielogica voor Pulse
- eerste Pulse scoring- en interpretation contract
- opslag van Pulse-uitkomsten binnen de bestaande campaign/respondent/response-keten
- minimale Pulse dashboardweergave en campaign-page support
- admin setup voor Pulse-campaigns binnen huidige beheerflow
- tests en smoke-validatie voor volledige Pulse foundation slice
- docs-update van actieve source of truth en relevante contracts

## Scope Out

- trend- en deltavergelijking tussen Pulse-cycli
- generieke time-series infrastructuur
- publieke Pulse routeactivatie in marketing of pricing
- volwaardige Pulse reportgenerator of PDF-output
- nieuwe job-, queue- of workflowlaag
- nieuwe tenant-, workspace- of entitlementlaag
- TeamScan- of Onboarding-gerelateerd werk

## Dependencies

- [PHASE_1_STEP_1_NORTH_STAR_DECISION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_1_STEP_1_NORTH_STAR_DECISION_PLAN.md)
- [PHASE_1_STEP_2_ICP_PACKAGING_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_1_STEP_2_ICP_PACKAGING_BOUNDARIES_PLAN.md)
- [PHASE_2_STEP_1_SYSTEM_LAYERS_DOMAIN_BOUNDARIES_AND_ARTIFACT_LIFECYCLE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_2_STEP_1_SYSTEM_LAYERS_DOMAIN_BOUNDARIES_AND_ARTIFACT_LIFECYCLE_PLAN.md)
- [PHASE_3_STEP_1_PLAN_LIBRARY_NAMING_AND_BUILD_WAVE_GOVERNANCE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_3_STEP_1_PLAN_LIBRARY_NAMING_AND_BUILD_WAVE_GOVERNANCE_PLAN.md)
- [PHASE_3_STEP_2_PULSE_MASTER_INDEX_AND_FIRST_BUILD_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_3_STEP_2_PULSE_MASTER_INDEX_AND_FIRST_BUILD_WAVE_STACK_PLAN.md)

## Key Changes

- `Pulse` wordt toegevoegd als derde productspecifieke module naast `exit` en `retention`.
- De gedeelde `scan_type`- en registrylaag wordt uitgebreid zonder nieuwe generieke runtime-abstractie.
- De survey submit-keten wordt product-aware genoeg gemaakt om een compacte Pulse payload toe te laten zonder ExitScan/RetentieScan te breken.
- De huidige campaign setup-flow wordt uitgebreid met `Pulse`, maar voor deze wave alleen als eerste Pulse-cycle in baseline-vorm.
- Het dashboard krijgt een eerste Pulse-viewmodel dat een actuele managementsnapshot toont zonder trendclaims.
- PDF-download en publieke routeactivatie blijven expliciet buiten scope voor deze wave.

## Belangrijke Interfaces/Contracts

### 1. Scan Type Contract

Na deze wave moet `pulse` ondersteund worden in:

- `frontend/lib/types.ts`
- `frontend/lib/scan-definitions.ts`
- `frontend/lib/products/shared/registry.ts`
- `backend/products/shared/registry.py`
- relevante campaign- en dashboardflows

Contract:

- `scan_type = 'exit' | 'retention' | 'pulse'`

Decision boundary:

- alleen `scan_type` wordt uitgebreid
- geen nieuw generiek producttype- of runmodel

### 2. Pulse Campaign Contract

De eerste Pulse-campaign in deze wave gebruikt bewust de bestaande campaign abstraction.

Contract:

- `scan_type = 'pulse'`
- `delivery_mode = 'baseline'`
- `enabled_modules = geselecteerde of default pulse-factoren binnen huidige modulelogica`

Decision boundary:

- voor `WAVE_01` krijgt Pulse geen aparte cadence- of delivery-mode taxonomy
- `live`, `ritme` of andere Pulse-vormen openen pas in latere waves als dat nodig blijkt

### 3. Pulse Survey Contract

De eerste Pulse-survey moet compacter zijn dan de bestaande diagnoseproducten en tegelijk binnen de bestaande surveyketen passen.

Minimale productregels:

- korter en frequenter dan ExitScan/RetentieScan
- gericht op prioritaire werkfactoren of signaalthema's
- geschikt voor managementreview op dit meetmoment
- geen brede MTO-vorm

Technisch contract voor deze wave:

- nieuwe Pulse surveydefinitie
- Pulse surveytemplate of Pulse partial
- product-aware submit-validatie
- compatibel met huidige tokenized surveyflow

Decision boundary:

- geen generieke dynamic survey builder
- geen brede custom questionnaire engine

### 4. Pulse Submission and Persistence Contract

De submit-keten moet Pulse kunnen verwerken zonder ExitScan/RetentieScan te destabiliseren.

Contract:

- Pulse-validatie gebeurt productspecifiek via nieuwe Pulse module
- Pulse scoring output komt in bestaande `SurveyResponse`-keten terecht
- Pulse mag gebruikmaken van `full_result` voor productspecifieke output
- bestaande responseopslag blijft de system of record

Decision boundary:

- geen nieuwe `Run`-tabel
- geen aparte Pulse-results store

### 5. Pulse Dashboard Contract

De eerste Pulse-dashboardread moet minimaal tonen:

- Pulse signaal op dit meetmoment
- prioritaire factoren of thema's van deze cycle
- eerste managementvraag of reviewrichting
- duidelijke begrenzing dat dit nog geen trendanalyse is

Contract:

- Pulse krijgt een eigen frontend productmodule en dashboard view model
- Pulse landt in de bestaande campaign page
- report download wordt voor Pulse in deze wave verborgen, gedeactiveerd of expliciet nog niet ondersteund

Decision boundary:

- geen PDF-report verplicht in `WAVE_01`
- geen trendkaarten verplicht in `WAVE_01`

## Primary Code Surfaces

### Shared / Platform

- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [frontend/lib/scan-definitions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/scan-definitions.ts)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [frontend/components/dashboard/new-campaign-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/new-campaign-form.tsx)

### New Pulse Module Surfaces

- `backend/products/pulse/__init__.py`
- `backend/products/pulse/definition.py`
- `backend/products/pulse/scoring.py`
- `backend/products/pulse/report_content.py` only if minimally required, otherwise defer
- `frontend/lib/products/pulse/index.ts`
- `frontend/lib/products/pulse/definition.ts`
- `frontend/lib/products/pulse/dashboard.ts`
- `frontend/lib/products/pulse/focus-questions.ts`
- `frontend/lib/products/pulse/action-playbooks.ts`

### Survey Surfaces

- [templates/survey.html](/C:/Users/larsh/Desktop/Business/Verisight/templates/survey.html)
- `templates/survey/pulse-*.html`
- [frontend/app/survey/[token]/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/survey/[token]/route.ts)

### Dashboard Surfaces

- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- relevante `page-helpers.tsx` indien nodig
- [frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx)

## Work Breakdown

### Track 1 - Runtime Registration and Campaign Setup

Tasks:

- [x] Voeg `pulse` toe aan gedeelde type- en registrylagen in backend en frontend.
- [x] Breid campaign setup uit zodat een admin Pulse als product kan kiezen.
- [x] Beperk Pulse in deze wave tot een eerste baseline-vorm binnen de bestaande `delivery_mode`-logica.
- [x] Zorg dat bestaande ExitScan/RetentieScan setupflows intact blijven.

Definition of done:

- [x] Een Pulse-campaign kan in de huidige adminflow technisch worden aangemaakt.
- [x] Productregistratie resolveert Pulse correct in backend en frontend.
- [x] Geen regressie in bestaande exit/retention campaign-creatie.

### Track 2 - Pulse Survey and Submit Flow

Tasks:

- [x] Ontwerp een compacte Pulse surveydefinitie die past bij "kort en frequent" zonder MTO-verbreding.
- [x] Voeg Pulse survey rendering toe in de bestaande tokenized surveyflow.
- [x] Maak de submit-validatie product-aware genoeg voor Pulse.
- [x] Map Pulse-antwoorden naar bestaande persistence zonder nieuwe runtime-entiteiten.

Definition of done:

- [x] Een respondent kan een Pulse-survey laden en succesvol submitten.
- [x] De backend valideert en verwerkt Pulse submissions productspecifiek.
- [x] Exit/retention submitcontracten blijven werken.

### Track 3 - Pulse Scoring and Minimal Interpretation

Tasks:

- [x] Definieer een eerste Pulse scoringcontract voor dit meetmoment.
- [x] Sla Pulse-uitkomsten op in bestaande responsevelden en `full_result`.
- [x] Maak een eerste productspecifieke signaallabeling en managementduiding voor Pulse.
- [x] Begrens de copy expliciet als current-cycle signalering, niet als trend- of diagnoseclaim.

Definition of done:

- [x] Pulse heeft een minimale maar coherente signal- en interpretationlaag.
- [x] De output is managementleesbaar voor dit meetmoment.
- [x] De producttaal schuift niet weg naar RetentieScan of generieke pulse-tooling.

### Track 4 - Pulse Dashboard Vertical Slice

Tasks:

- [x] Voeg een Pulse dashboard view model toe aan de productmodulelaag.
- [x] Maak campaign page rendering geschikt voor Pulse zonder brede page-refactor.
- [x] Zorg voor een eerste Pulse hero, top summary en reviewrichting.
- [x] Verberg of begrens PDF-download voor Pulse in deze wave.

Definition of done:

- [x] Een Pulse-campaign opent in het dashboard zonder te crashen.
- [x] De Pulse dashboardread toont een bruikbare eerste managementsnapshot.
- [x] Niet-ondersteunde reportflows zijn veilig afgevangen.

### Track 5 - Tests, Docs, and Smoke Validation

Tasks:

- [x] Voeg tests toe voor type/registry uitbreiding, Pulse surveyflow en Pulse dashboard rendering.
- [x] Voeg regressietests toe waar ExitScan/RetentieScan geraakt kunnen worden.
- [x] Werk docs bij zodat dit wave-document en relevante strategy artifacts synchroon blijven.
- [x] Voer een handmatige of gescripte smoke-flow uit op campaign setup -> invite -> submit -> dashboard.

Definition of done:

- [x] Alle relevante tests voor deze wave zijn groen.
- [x] Smoke-validatie bewijst de volledige end-to-end Pulse foundation slice.
- [x] Documentatie is synchroon met de werkelijke implementatie.

## Testplan

### Automated Tests

- [x] Type- en registrytests voor `scan_type = pulse`
- [x] Backend validatie- en scoringsunit tests voor Pulse
- [x] Survey submit tests voor Pulse happy path en invalid payloads
- [x] Dashboard rendering tests voor Pulse view model
- [x] Regressietests voor ExitScan en RetentieScan campaign setup en submitflow

### Integration Checks

- [x] Pulse-campaign aanmaken via adminflow
- [x] Respondenten importeren en uitnodigingen versturen of bewust overslaan binnen de gescripte smoke-check zonder regressie in de flow
- [x] Tokenized Pulse survey laden via frontend proxy
- [x] Pulse submission opslaan en terugzien in Supabase / campaign read models
- [x] Pulse-dashboard openen zonder reportcrash

### Smoke Path

1. Maak een `Pulse` campaign aan in beheer.
2. Importeer een kleine respondentset.
3. Verstuur invites.
4. Open een survey-link via `/survey/{token}`.
5. Vul de Pulse survey volledig in.
6. Controleer dat submit slaagt en de respondent completed is.
7. Open de Pulse-campaign in het dashboard.
8. Controleer dat een eerste Pulse-signaal en managementread zichtbaar zijn.
9. Controleer dat niet-ondersteunde report- of trendfuncties niet misleidend beschikbaar zijn.

## Current Validation Snapshot

- [x] `.\.venv\Scripts\python.exe -m pytest tests/test_pulse_scoring.py tests/test_api_flows.py -q` geeft `29 passed`.
- [x] `cmd /c npx tsc --noEmit` slaagt zonder typefouten.
- [x] `cmd /c npm test` is groen op reposchaal (`14 passed`, `68 passed`).
- [x] End-to-end smoke-flow via live API is uitgevoerd: org-create -> Pulse campaign -> respondent -> survey load -> submit -> stats -> Pulse report returns expected `422`.
- [x] `cmd /c npm run build` slaagt met standaard Next build nadat Turbopack niet langer de default build-path is.
- [x] `cmd /c npm run dev` geeft met standaard Next dev weer een stabiele homepage (`GET /` -> `200`) op een vrije lokale poort.

## Assumptions/Defaults

- `Pulse` landt in `WAVE_01` als aparte productline, niet als herlabelde `RetentieScan ritme`.
- De eerste Pulse-cycle gebruikt de bestaande campaign abstraction en blijft binnen `delivery_mode = baseline`.
- Trend, delta en review-over-time horen expliciet pas in `WAVE_02`.
- PDF-reporting voor Pulse is geen verplicht onderdeel van deze eerste foundation slice.
- Als de huidige generieke `SurveySubmit`-vorm te rigide blijkt, mag deze wave hem productspecifiek refactoren zolang Exit/Retention compatibel blijven.
- Er wordt geen nieuwe generieke runtime-infrastructuur toegevoegd tenzij de wave tijdens uitvoering hard bewijst dat de bestaande campaign-keten onvoldoende is.

## Product Acceptance

- [x] Een Pulse-campaign levert een echte eerste managementsnapshot op.
- [x] Pulse is inhoudelijk herkenbaar als kortere monitoringlaag na diagnose of baseline.
- [x] Pulse voelt niet als een brede MTO of als hernoemde RetentieScan.
- [x] De wave levert first value op zonder trend- of routeoverclaiming.

## Codebase Acceptance

- [x] Pulse is correct geregistreerd in backend en frontend.
- [x] Nieuwe code zit in begrensde Pulse-modules en minimale shared uitbreidingen.
- [x] ExitScan en RetentieScan regressies zijn afgevangen.
- [x] Geen premature run-, artifact- of workflow-abstrahering is toegevoegd.

## Runtime Acceptance

- [x] Een admin kan een Pulse-campaign aanmaken.
- [x] Een respondent kan een Pulse survey invullen.
- [x] De backend kan Pulse submissions verwerken.
- [x] Het dashboard kan een Pulse-campaign renderen.
- [x] Niet-ondersteunde report- of trendpaden falen niet onduidelijk of misleidend.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] Handmatige smoke-flow is succesvol uitgevoerd op runtime-niveau via live API- en surveyrequests.
- [x] Bestaande live ExitScan/RetentieScan-paden zijn niet gebroken.
- [x] Pulse-boundaries ten opzichte van RetentieScan ritme blijven intact.
- [x] Frontend dev/build draait weer op de ondersteunde standaard Next workflow zonder Turbopack als default.

## Documentation Acceptance

- [x] Dit wave-document blijft synchroon met de feitelijke implementatie.
- [x] Relevante strategy docs of pointers zijn bijgewerkt waar nodig.
- [x] Het is na afronding duidelijk dat `WAVE_01` de actieve en daarna afgesloten source of truth was.
- [x] `WAVE_02` kan pas openen na expliciete green close-out van deze wave.

## Risks To Watch

- Pulse wordt technisch te veel een derde variant van de bestaande submit-keten zonder echte productidentiteit.
- De surveycontracten blijken te hard op Exit/Retention vast te zitten, waardoor een nette Pulse-inpassing meer refactor vraagt dan verwacht.
- Dashboardrendering gaat impliciet uit van Exit/Retention-specifieke report- of playbookstructuren.
- PDF-download of campaign-page defaults kunnen Pulse ten onrechte als volledig ondersteund rapportproduct laten lijken.
- Enabled module-logica kan te generiek of te zwak zijn om een echt compacte Pulse-survey goed te dragen.

## Not In This Wave

- Geen trendvergelijking met vorige Pulse-metingen.
- Geen buyer-facing Pulse productpagina of pricing.
- Geen Pulse PDF-reportverplichting.
- Geen TeamScan-werk.
- Geen Onboarding 30-60-90-werk.
- Geen generiek suiteplatform voor latere productlijnen.

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] een Pulse-campaign end-to-end werkt van setup tot dashboard
- [x] Pulse productspecifiek geregistreerd en gerenderd wordt
- [x] een compacte Pulse survey succesvol kan worden ingevuld
- [x] de eerste Pulse managementsnapshot zichtbaar en begrijpelijk is
- [x] code, docs, tests, smoke-validatie en frontend build/runtime checks groen zijn

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_02_PULSE_REVIEW_LOOP_AND_DELTA_LOGIC.md`
