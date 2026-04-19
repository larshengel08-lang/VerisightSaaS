# WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE

## Title

Open the first end-to-end Leadership Scan vertical slice inside the current Verisight campaign-centered runtime, without identity-heavy leadership expansion.

## Korte Summary

Deze wave bouwt de eerste echte `Leadership Scan`-slice, maar bewust nog niet de volledige productlijn. Het doel is om Leadership Scan als nieuwe productline technisch en productmatig te laten landen binnen de bestaande Verisight-architectuur: een admin moet een Leadership Scan-campaign kunnen aanmaken, respondenten moeten een Leadership Scan-survey kunnen invullen, de backend moet de submissie kunnen verwerken, en het dashboard moet een eerste minimale en veilige geaggregeerde managementread tonen.

Deze wave is expliciet een foundation vertical slice. Dat betekent: wel een volledige end-to-end flow, maar nog zonder named leader output, reporting lines, 360-logica, buyer-facing activatie of volledige reportlaag. `Leadership Scan` moet in deze wave aantonen dat het een eigen productline kan worden zonder te vervallen in "de leadership-factor als los product" en zonder de huidige ExitScan/RetentieScan/Pulse/TeamScan/Onboarding-runtime te destabiliseren.

Status van deze wave:

- Wave status: implemented_green
- Active source of truth after approval: dit document
- Build permission: executed_and_closed_green
- Next allowed wave after green completion: `WAVE_02_LEADERSHIP_SCAN_INTERPRETATION_AND_BOUNDARIES.md`

## Implementation Close-Out

Deze wave is nu daadwerkelijk gebouwd binnen de bestaande Verisight-runtime.

Belangrijkste gerealiseerde surfaces:

- `scan_type = leadership` is toegevoegd in backend en frontend shared contracts, registries en schema-validatie
- nieuwe backendmodule in `backend/products/leadership`
- nieuwe frontendmodule in `frontend/lib/products/leadership`
- admin setup uitgebreid in `frontend/components/dashboard/new-campaign-form.tsx`
- campaign page en helpercopy uitgebreid voor Leadership Scan in `frontend/app/(dashboard)/campaigns/[id]/page.tsx` en `frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx`
- PDF blijft in deze wave bewust niet ondersteund

Green validation bij close-out:

- `.\.venv\Scripts\python.exe -m pytest tests/test_leadership_scoring.py tests/test_api_flows.py tests/test_portfolio_architecture_program.py -q` -> `44 passed`
- `cmd /c npm test` -> `87 passed`
- `cmd /c npx tsc --noEmit` -> groen
- `cmd /c npm run build` -> groen

Belangrijke boundary die overeind bleef:

- Leadership Scan is runtime-live maar nog niet buyer-facing geactiveerd
- output blijft group-level only
- named leader output, hierarchylogica, 360 en PDF blijven buiten scope

## Why This Wave Now

Deze wave volgt logisch uit de eerdere Leadership Scan-stappen:

- `Leadership Scan` is vastgezet als de enige resterende serieuze uitbreidingscandidate
- de productgrens is scherp gemaakt als bounded follow-on route voor management- en leidingcontext na een bestaand people-signaal
- de architectuur is bewust campaign-centered gehouden
- de governance laat maar een enkele actieve build wave tegelijk toe
- manager-identiteit, reporting lines en 360-rollen zijn expliciet buiten v1 geplaatst

De huidige codebase geeft hiervoor ook een concreet startpunt:

- `scan_type`-routing bestaat al productspecifiek via backend- en frontendregistries
- de runtime draait nu al op `Organization -> Campaign -> Respondent -> SurveyResponse`
- respondentmetadata bevat al `department` en `role_level`
- de bestaande factor `leadership` leeft al in `org_raw` en `org_scores`
- managementhandoff, follow-up en dashboardproductmodules bestaan al per productlijn

Deze wave gebruikt die bestaande basis en vermijdt bewust generieke nieuwe identity-, hierarchy- of performance-objecten.

## Planned User Outcome

Na deze wave moet een Verisight-beheerder:

- een Leadership Scan-campaign kunnen aanmaken
- respondenten kunnen importeren en uitnodigen
- een Leadership Scan-survey kunnen laten invullen
- in het dashboard een eerste Leadership Scan-managementread kunnen openen

Na deze wave moet een klantgebruiker:

- een Leadership Scan-campaign in het dashboard kunnen bekijken
- een eerste geaggregeerde Leadership Scan-snapshot kunnen lezen
- expliciet kunnen zien dat dit nog geen named leader view, geen manager ranking en geen performance-instrument is

Wat deze wave nog niet hoeft te leveren:

- named leader output
- `manager_id` of reporting line support
- 360- of multi-rater model
- buyer-facing Leadership Scan productpagina of pricing
- volwaardig Leadership Scan-PDF-rapport
- brede action handoff of ownership layer

## Scope In

- uitbreiding van `scan_type` naar `leadership` in shared types, registries en campaignflow
- nieuwe Leadership Scan productmodule in backend en frontend
- minimale Leadership Scan surveydefinitie en Leadership Scan survey rendering
- product-aware submit- en validatielogica voor Leadership Scan
- eerste Leadership Scan scoring- en interpretation contract
- opslag van Leadership Scan-uitkomsten binnen de bestaande campaign/respondent/response-keten
- suppressie- en aggregatiechecks voor veilige managementoutput
- minimale Leadership Scan dashboardweergave met `leadership_context_summary`, `signal_patterns` en expliciete boundary-state
- admin setup voor Leadership Scan-campaigns binnen huidige beheerflow
- tests en smoke-validatie voor volledige Leadership Scan foundation slice
- docs-update van actieve source of truth en relevante contracts

## Scope Out

- named leader ranking of named leader scorecards
- `manager_id`, `manager_name`, `team_id`, `location` of reporting-line support
- 360- of multi-rater model
- generieke hierarchy engine
- buyer-facing Leadership Scan routeactivatie in marketing of pricing
- volwaardige Leadership Scan reportgenerator of PDF-output
- performance-, coaching- of trainingflows
- cross-campaign trend- of delta-logica
- nieuwe productlijn buiten Leadership Scan

## Dependencies

- [PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_13_LEADERSHIP_SCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_13_LEADERSHIP_SCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_14_LEADERSHIP_SCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_14_LEADERSHIP_SCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md)

## Key Changes

- `Leadership Scan` wordt toegevoegd als nieuwe productspecifieke module naast `exit`, `retention`, `pulse`, `team` en `onboarding`.
- De gedeelde `scan_type`- en registrylaag wordt uitgebreid zonder nieuw generiek hierarchy- of identitymodel.
- De survey submit-keten wordt product-aware genoeg gemaakt om een Leadership Scan payload toe te laten zonder bestaande producten te breken.
- De huidige campaign setup-flow wordt uitgebreid met `Leadership Scan`, maar voor deze wave alleen als geaggregeerde, suppressie-aware managementread.
- Het dashboard krijgt een eerste Leadership Scan-viewmodel dat managementcontext toont wanneer veilig, met duidelijke boundarycopy dat dit geen named leader of performance-output is.
- PDF-download en buyer-facing activatie blijven expliciet buiten scope voor deze wave.

## Belangrijke Interfaces/Contracts

### 1. Scan Type Contract

Na deze wave moet `leadership` ondersteund worden in:

- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [frontend/lib/scan-definitions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/scan-definitions.ts)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- relevante campaign- en dashboardflows

Contract:

- `scan_type = 'exit' | 'retention' | 'pulse' | 'team' | 'onboarding' | 'leadership'`

Decision boundary:

- alleen `scan_type` wordt uitgebreid
- geen nieuw generiek producttype-, identity- of runmodel

### 2. Leadership Scan Campaign Contract

De eerste Leadership Scan-campaign in deze wave gebruikt bewust de bestaande campaign abstraction.

Contract:

- `scan_type = 'leadership'`
- `delivery_mode = 'baseline'`
- `group_level_only = true`
- `required_identity_model = none`
- `allowed_context = department | role_level`

Decision boundary:

- voor `WAVE_01` krijgt Leadership Scan geen manager-, hierarchy- of reporting-line keuze
- v1 blijft op bestaande respondentmetadata en productspecifieke survey-items leunen

### 3. Leadership Scan Survey Contract

De eerste Leadership Scan-survey moet passen bij management- en leidingcontext rondom een bestaand people-signaal en tegelijk binnen de bestaande surveyketen passen.

Minimale productregels:

- gericht op managementdynamiek, leidingcontext en ervaren ondersteunende of belemmerende patronen
- bruikbaar als follow-on na bredere signalering
- managementgericht genoeg om gerichte verificatie te starten
- geen individuele managerbeoordeling en geen performance-instrument

Technisch contract voor deze wave:

- nieuwe Leadership Scan surveydefinitie
- Leadership Scan surveytemplate of Leadership Scan partial
- product-aware submit-validatie
- compatibel met huidige tokenized surveyflow

Decision boundary:

- geen generieke survey builder
- geen custom questionnaire engine
- geen 360-actorrollen

### 4. Leadership Scan Submission and Persistence Contract

De submit-keten moet Leadership Scan kunnen verwerken zonder de bestaande suite te destabiliseren.

Contract:

- Leadership Scan-validatie gebeurt productspecifiek via nieuwe Leadership Scan module
- Leadership Scan scoring output komt in bestaande `SurveyResponse`-keten terecht
- Leadership Scan mag gebruikmaken van `full_result` voor productspecifieke output
- bestaande responseopslag blijft de system of record

Decision boundary:

- geen nieuwe `Run`-tabel
- geen aparte Leadership Scan-results store
- geen aparte manager-profile store

### 5. Leadership Scan Dashboard Contract

De eerste Leadership Scan-dashboardread moet minimaal tonen:

- een geaggregeerde leadership-context summary van het huidige signaal
- geclusterde managementpatronen of signaallijnen wanneer veilig toonbaar
- expliciete boundarycopy dat dit geen named leader, ranking of performance-output is
- duidelijke begrenzing dat dit nog geen uitgebreide handoff, hierarchy read of artifactlaag is

Contract:

- Leadership Scan krijgt een eigen frontend productmodule en dashboard view model
- Leadership Scan landt in de bestaande campaign page
- report download wordt voor Leadership Scan in deze wave verborgen, gedeactiveerd of expliciet nog niet ondersteund

Decision boundary:

- geen PDF-report verplicht in `WAVE_01`
- geen named leader ordering verplicht in `WAVE_01`

### 6. Leadership Scan Privacy and Aggregation Contract

Leadership-output mag alleen verschijnen als de bestaande safety-grenzen gehaald zijn.

Contract:

- `group_level_only = true`
- `minimum_detail_n = 5`
- `minimum_pattern_n = 10`
- `minimum_context_group_n = 5`
- `suppression_required = true`
- `named_leader_output_forbidden = true`

Decision boundary:

- geen output die aanvoelt als individuele managerbeoordeling
- geen Leadership Scan-output die named people impliceert terwijl de data dat niet draagt

## Primary Code Surfaces

### Shared / Platform

- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [frontend/lib/scan-definitions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/scan-definitions.ts)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [frontend/components/dashboard/new-campaign-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/new-campaign-form.tsx)

### New Leadership Scan Module Surfaces

- `backend/products/leadership/__init__.py`
- `backend/products/leadership/definition.py`
- `backend/products/leadership/scoring.py`
- `backend/products/leadership/report_content.py` only if minimally required, otherwise defer
- `frontend/lib/products/leadership/index.ts`
- `frontend/lib/products/leadership/definition.ts`
- `frontend/lib/products/leadership/dashboard.ts`
- `frontend/lib/products/leadership/focus-questions.ts`
- `frontend/lib/products/leadership/action-playbooks.ts`

### Survey Surfaces

- [templates/survey.html](/C:/Users/larsh/Desktop/Business/Verisight/templates/survey.html)
- `templates/survey/leadership-*.html`
- [frontend/app/survey/[token]/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/survey/[token]/route.ts)

### Dashboard Surfaces

- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx)

## Work Breakdown

### Track 1 - Runtime Registration and Campaign Setup

Tasks:

- [x] Voeg `leadership` toe aan gedeelde type- en registrylagen in backend en frontend.
- [x] Breid campaign setup uit zodat een admin Leadership Scan als product kan kiezen.
- [x] Beperk Leadership Scan in deze wave tot geaggregeerde v1-basis binnen huidige metadatarealiteit.
- [x] Zorg dat bestaande ExitScan/RetentieScan/Pulse/TeamScan/Onboarding setupflows intact blijven.

Definition of done:

- [x] Een Leadership Scan-campaign kan in de huidige adminflow technisch worden aangemaakt.
- [x] Productregistratie resolveert Leadership Scan correct in backend en frontend.
- [x] Geen regressie in bestaande campaign-creatie voor andere producten.

### Track 2 - Leadership Scan Survey and Submit Flow

Tasks:

- [x] Ontwerp een minimale Leadership Scan surveydefinitie die past bij managementverificatie en niet bij 360-, coaching- of performance-logic.
- [x] Voeg Leadership Scan survey rendering toe in de bestaande tokenized surveyflow.
- [x] Maak de submit-validatie product-aware genoeg voor Leadership Scan.
- [x] Map Leadership Scan-antwoorden naar bestaande persistence zonder nieuwe runtime-entiteiten.

Definition of done:

- [x] Een respondent kan een Leadership Scan-survey laden en succesvol submitten.
- [x] De backend valideert en verwerkt Leadership Scan submissions productspecifiek.
- [x] Exit/retention/pulse/team/onboarding submitcontracten blijven werken.

### Track 3 - Leadership Scan Scoring, Aggregation, and Minimal Interpretation

Tasks:

- [x] Definieer een eerste Leadership Scan scoringcontract voor dit meetmoment.
- [x] Voeg suppressie- en aggregatiechecks toe voor veilige managementoutput.
- [x] Sla Leadership Scan-uitkomsten op in bestaande responsevelden en `full_result`.
- [x] Maak een eerste productspecifieke duiding en fallback-copy voor onveilige of te zwakke output.

Definition of done:

- [x] Leadership Scan heeft een minimale maar coherente signal-, aggregatie- en interpretationlaag.
- [x] De output is managementleesbaar zonder named leader, ranking- of causaliteitsclaim.
- [x] De producttaal schuift niet weg naar TeamScan, 360 of leiderschapstraining.

### Track 4 - Leadership Scan Dashboard Vertical Slice

Tasks:

- [x] Voeg een Leadership Scan dashboard view model toe aan de productmodulelaag.
- [x] Maak campaign page rendering geschikt voor Leadership Scan zonder brede page-refactor.
- [x] Zorg voor een eerste geaggregeerde managementsummary plus expliciete boundary-state.
- [x] Verberg of begrens PDF-download voor Leadership Scan in deze wave.

Definition of done:

- [x] Een Leadership Scan-campaign opent in het dashboard zonder te crashen.
- [x] De Leadership Scan dashboardread toont een bruikbare eerste managementsnapshot.
- [x] Niet-ondersteunde reportflows zijn veilig afgevangen.

### Track 5 - Tests, Docs, and Smoke Validation

Tasks:

- [x] Voeg tests toe voor type/registry uitbreiding, Leadership Scan surveyflow, safety gating en dashboard rendering.
- [x] Voeg regressietests toe waar bestaande producten geraakt kunnen worden.
- [x] Werk docs bij zodat dit wave-document en relevante strategy artifacts synchroon blijven.
- [x] Voer een handmatige of gescripte smoke-flow uit op campaign setup -> invite -> submit -> dashboard.

Definition of done:

- [x] Alle relevante tests voor deze wave zijn groen.
- [x] Gescripte smoke-validatie bewijst de volledige end-to-end Leadership Scan foundation slice.
- [x] Documentatie is synchroon met de werkelijke implementatie.

## Testplan

### Automated Tests

- [x] Type- en registrytests voor `scan_type = leadership`
- [x] Backend validatie- en scoringsunit tests voor Leadership Scan
- [x] Survey submit tests voor Leadership Scan happy path en invalid payloads
- [x] Tests voor suppressie- en aggregatiegedrag bij managementoutput
- [x] Dashboard rendering tests voor Leadership Scan view model
- [x] Regressietests voor ExitScan, RetentieScan, Pulse, TeamScan en Onboarding campaign setup en submitflow

### Integration Checks

- [x] Leadership Scan-campaign aanmaken via adminflow
- [x] Respondenten importeren met en zonder bruikbare contextmetadata
- [x] Tokenized Leadership Scan survey laden via frontend proxy
- [x] Leadership Scan submission opslaan en terugzien in campaign read models
- [x] Leadership Scan-dashboard openen zonder reportcrash
- [x] Onveilige of te zwakke output laat een expliciete fallback-state zien

### Smoke Path

1. Maak een `Leadership Scan` campaign aan in beheer.
2. Importeer een respondentset met bestaande contextmetadata.
3. Verstuur invites.
4. Open een survey-link via `/survey/{token}`.
5. Vul de Leadership Scan survey volledig in.
6. Controleer dat submit slaagt en de respondent completed is.
7. Open de Leadership Scan-campaign in het dashboard.
8. Controleer dat een eerste geaggregeerde managementsummary zichtbaar is.
9. Controleer dat named leader output, manager ranking en reportdownload niet misleidend beschikbaar zijn.
10. Controleer dat te zwakke of onveilige output expliciet wordt onderdrukt of als fallback-state verschijnt.

## Assumptions/Defaults

- `Leadership Scan` landt in `WAVE_01` als aparte productline, niet als herlabelde `leadership`-factor.
- De eerste Leadership Scan-cycle gebruikt de bestaande campaign abstraction.
- `department` en `role_level` mogen hoogstens als context mee, maar niet als named leader identiteit.
- Named leader output, manager-identiteit, 360-rollen, managementhandoffpolish en buyer-facing activatie horen expliciet pas in latere waves.
- Als de huidige generieke `SurveySubmit`-vorm te rigide blijkt, mag deze wave hem productspecifiek refactoren zolang bestaande producten compatibel blijven.
- Er wordt geen nieuwe generieke hierarchy- of identity-infrastructuur toegevoegd tenzij de wave tijdens uitvoering hard bewijst dat de bestaande campaign-keten onvoldoende is.

## Product Acceptance

- [x] Een Leadership Scan-campaign levert een echte eerste managementsnapshot op.
- [x] Leadership Scan is inhoudelijk herkenbaar als bounded managementverificatieroute na bredere signalering.
- [x] Leadership Scan voelt niet als named leader beoordeling, 360-tool of hernoemde factor-tab.
- [x] De wave levert first value op zonder privacy- of routeoverclaiming.

## Codebase Acceptance

- [x] Leadership Scan is correct geregistreerd in backend en frontend.
- [x] Nieuwe code zit in begrensde Leadership Scan-modules en minimale shared uitbreidingen.
- [x] ExitScan, RetentieScan, Pulse, TeamScan en Onboarding regressies zijn afgevangen.
- [x] Geen premature hierarchy-, manager- of workflow-abstrahering is toegevoegd.

## Runtime Acceptance

- [x] Een admin kan een Leadership Scan-campaign aanmaken.
- [x] Een respondent kan een Leadership Scan survey invullen.
- [x] De backend kan Leadership Scan submissions verwerken.
- [x] Het dashboard kan een Leadership Scan-campaign renderen.
- [x] Niet-ondersteunde report- of identitypaden falen niet onduidelijk of misleidend.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] Gescripte smoke-flow is succesvol uitgevoerd op runtime-niveau.
- [x] Bestaande live ExitScan/RetentieScan/Pulse/TeamScan/Onboarding-paden zijn niet gebroken.
- [x] Leadership Scan-boundaries ten opzichte van TeamScan en de bestaande factorlaag blijven intact.
- [x] Suppressie- en aggregatiegedrag zijn expliciet gevalideerd.

## Documentation Acceptance

- [x] Dit wave-document blijft synchroon met de feitelijke implementatie.
- [x] Relevante strategy docs of pointers zijn bijgewerkt waar nodig.
- [x] Het is na afronding duidelijk dat `WAVE_01` de actieve en daarna afgesloten source of truth was.
- [x] `WAVE_02` kan pas openen na expliciete green close-out van deze wave.

## Risks To Watch

- Leadership Scan wordt technisch te veel een zevende variant van de bestaande submit-keten zonder echte productidentiteit.
- De surveycontracten blijken te hard op de bestaande producten vast te zitten, waardoor een nette Leadership Scan-inpassing meer refactor vraagt dan verwacht.
- Dashboardrendering gaat impliciet uit van bestaande productspecifieke outputstructuren.
- De eerste Leadership Scan-read lijkt managementsterker dan de data werkelijk draagt wanneer suppressie of contextdekking zwak is.
- De eerste Leadership Scan-survey schuift inhoudelijk te veel richting 360, coaching of performancebeoordeling.

## Not In This Wave

- Geen `manager_id` of reporting line support.
- Geen named leader output of ranking.
- Geen buyer-facing Leadership Scan productpagina of pricing.
- Geen Leadership Scan PDF-reportverplichting.
- Geen 360- of multi-rater model.
- Geen nieuwe productlijn buiten Leadership Scan.

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] een Leadership Scan-campaign end-to-end werkt van setup tot dashboard
- [x] Leadership Scan productspecifiek geregistreerd en gerenderd wordt
- [x] een Leadership Scan survey succesvol kan worden ingevuld
- [x] de eerste Leadership Scan managementsnapshot zichtbaar en begrijpelijk is
- [x] suppressie- en aggregatiegedrag veilig en expliciet werkt
- [x] code, docs, tests en smoke-validatie groen zijn

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_02_LEADERSHIP_SCAN_INTERPRETATION_AND_BOUNDARIES.md`
