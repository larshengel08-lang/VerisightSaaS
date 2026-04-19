# WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE

## Title

Open the first end-to-end TeamScan vertical slice inside the current Verisight campaign-centered runtime, without broad boundary expansion.

## Korte Summary

Deze wave bouwt de eerste echte `TeamScan`-slice, maar bewust nog niet de volledige productlijn. Het doel is om `TeamScan` als nieuwe productline technisch en productmatig te laten landen binnen de bestaande Verisight-architectuur: een admin moet een TeamScan-campaign kunnen aanmaken, respondenten moeten een TeamScan-survey kunnen invullen, de backend moet de submissie kunnen verwerken, en het dashboard moet een eerste minimale en veilige lokale managementread tonen.

Deze wave is expliciet een foundation vertical slice. Dat betekent: wel een volledige end-to-end flow, maar nog zonder brede local priority logic, buyer-facing activatie of manager/location-verbreding. `TeamScan` moet in deze wave aantonen dat het een eigen productline kan worden zonder te vervallen in "Segment Deep Dive met een nieuwe naam" en zonder de huidige ExitScan/RetentieScan/Pulse-runtime te destabiliseren.

Status van deze wave:

- Wave status: implemented_green
- Active source of truth after approval: dit document
- Build permission: completed
- Next allowed wave after green completion: `WAVE_02_TEAMSCAN_LOCALIZATION_AND_PRIORITY_LOGIC.md`

## Why This Wave Now

Deze wave volgt logisch uit de eerdere TeamScan-stappen:

- `TeamScan` is vastgezet als de volgende productlijn na `Pulse`
- de productgrens is scherp gemaakt als lokalisatielaag na bredere signalering
- de architectuur is bewust campaign-centered gehouden
- de governance laat maar een enkele actieve build wave tegelijk toe
- `department` is gelockt als primaire TeamScan-v1 boundary en `role_level` als secundaire context

De huidige codebase geeft hiervoor ook een concreet startpunt:

- `scan_type`-routing bestaat al productspecifiek via backend- en frontendregistries
- de runtime draait nu al op `Organization -> Campaign -> Respondent -> SurveyResponse`
- respondentmetadata bevat al `department` en `role_level`
- importmapping behandelt `team` vandaag al als alias van `department`
- bestaande segmentverdieping en rapportcopy bewijzen dat lokale context inhoudelijk relevant is, maar nog niet als zelfstandige productflow

Deze wave gebruikt die bestaande basis en vermijdt bewust generieke nieuwe runtime-objecten.

## Planned User Outcome

Na deze wave moet een Verisight-beheerder:

- een TeamScan-campaign kunnen aanmaken
- respondenten kunnen importeren en uitnodigen
- een TeamScan-survey kunnen laten invullen
- in het dashboard een eerste TeamScan-managementread kunnen openen

Na deze wave moet een klantgebruiker:

- een TeamScan-campaign in het dashboard kunnen bekijken
- een eerste lokale TeamScan-snapshot kunnen lezen op `department`-niveau
- expliciet kunnen zien wanneer lokale output niet veilig of niet voldoende onderbouwd is

Wat deze wave nog niet hoeft te leveren:

- ranking van lokale prioriteiten
- manager- of location-boundaries
- buyer-facing TeamScan productpagina of pricing
- volwaardig TeamScan-PDF-rapport
- brede action handoff of ownership layer

## Scope In

- uitbreiding van `scan_type` naar `team` in shared types, registries en campaignflow
- nieuwe TeamScan productmodule in backend en frontend
- minimale TeamScan surveydefinitie en TeamScan survey rendering
- product-aware submit- en validatielogica voor TeamScan
- eerste TeamScan scoring- en interpretation contract
- opslag van TeamScan-uitkomsten binnen de bestaande campaign/respondent/response-keten
- coverage- en suppressiechecks voor lokale output op basis van `department`
- minimale TeamScan dashboardweergave met `org_level_summary`, `local_group_candidates` en expliciete fallback-state
- admin setup voor TeamScan-campaigns binnen huidige beheerflow
- tests en smoke-validatie voor volledige TeamScan foundation slice
- docs-update van actieve source of truth en relevante contracts

## Scope Out

- lokale prioriteitsranking of ordering tussen teams
- manager-, location- of multi-boundary support
- generieke localizer engine
- buyer-facing TeamScan routeactivatie in marketing of pricing
- volwaardige TeamScan reportgenerator of PDF-output
- nieuwe team-, manager- of location-tabellen
- cross-campaign trend- of delta-logica
- Onboarding 30-60-90-gerelateerd werk

## Dependencies

- [PHASE_NEXT_STEP_1_TEAMSCAN_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_1_TEAMSCAN_ENTRY_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_2_TEAMSCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_2_TEAMSCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_3_TEAMSCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_3_TEAMSCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md)

## Key Changes

- `TeamScan` wordt toegevoegd als vierde productspecifieke module naast `exit`, `retention` en `pulse`.
- De gedeelde `scan_type`- en registrylaag wordt uitgebreid zonder nieuw generiek team- of runmodel.
- De survey submit-keten wordt product-aware genoeg gemaakt om een TeamScan payload toe te laten zonder bestaande producten te breken.
- De huidige campaign setup-flow wordt uitgebreid met `TeamScan`, maar voor deze wave alleen op `department`-gedragen v1-basis.
- Het dashboard krijgt een eerste TeamScan-viewmodel dat lokale context toont wanneer veilig, en expliciet terugvalt wanneer coverage of groepsgrootte tekortschiet.
- PDF-download en buyer-facing activatie blijven expliciet buiten scope voor deze wave.

## Belangrijke Interfaces/Contracts

### 1. Scan Type Contract

Na deze wave moet `team` ondersteund worden in:

- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [frontend/lib/scan-definitions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/scan-definitions.ts)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- relevante campaign- en dashboardflows

Contract:

- `scan_type = 'exit' | 'retention' | 'pulse' | 'team'`

Decision boundary:

- alleen `scan_type` wordt uitgebreid
- geen nieuw generiek producttype- of runmodel

### 2. TeamScan Campaign Contract

De eerste TeamScan-campaign in deze wave gebruikt bewust de bestaande campaign abstraction.

Contract:

- `scan_type = 'team'`
- `primary_team_boundary = 'department'`
- `secondary_context_boundary = 'role_level'`
- `required_localization_metadata = department`

Decision boundary:

- voor `WAVE_01` krijgt TeamScan geen boundary-keuze voor manager of location
- v1 blijft op bestaande respondentmetadata leunen

### 3. TeamScan Survey Contract

De eerste TeamScan-survey moet passen bij lokalisatie van een al zichtbaar signaal en tegelijk binnen de bestaande surveyketen passen.

Minimale productregels:

- gericht op lokale team- of contextverschillen, niet op brede cultuurdiagnose
- bruikbaar als follow-on na bredere signalering
- managementgericht genoeg om lokale verificatie te starten
- geen managerbeoordeling en geen individuele beoordeling

Technisch contract voor deze wave:

- nieuwe TeamScan surveydefinitie
- TeamScan surveytemplate of TeamScan partial
- product-aware submit-validatie
- compatibel met huidige tokenized surveyflow

Decision boundary:

- geen generieke survey builder
- geen custom questionnaire engine

### 4. TeamScan Submission and Persistence Contract

De submit-keten moet TeamScan kunnen verwerken zonder ExitScan/RetentieScan/Pulse te destabiliseren.

Contract:

- TeamScan-validatie gebeurt productspecifiek via nieuwe TeamScan module
- TeamScan scoring output komt in bestaande `SurveyResponse`-keten terecht
- TeamScan mag gebruikmaken van `full_result` voor productspecifieke output
- bestaande responseopslag blijft de system of record

Decision boundary:

- geen nieuwe `Run`-tabel
- geen aparte TeamScan-results store

### 5. TeamScan Dashboard Contract

De eerste TeamScan-dashboardread moet minimaal tonen:

- org-level summary van het huidige signaal
- lokale contextgroepen op `department`-niveau wanneer veilig toonbaar
- expliciete aanduiding van onderdrukte of ontbrekende lokale groepen
- duidelijke begrenzing dat dit nog geen priority-ranking of action handoff is

Contract:

- TeamScan krijgt een eigen frontend productmodule en dashboard view model
- TeamScan landt in de bestaande campaign page
- report download wordt voor TeamScan in deze wave verborgen, gedeactiveerd of expliciet nog niet ondersteund

Decision boundary:

- geen PDF-report verplicht in `WAVE_01`
- geen local priority ordering verplicht in `WAVE_01`

### 6. TeamScan Privacy and Coverage Contract

Lokale output mag alleen verschijnen als de bestaande safety-grenzen gehaald zijn.

Contract:

- `minimum_detail_n = 5`
- `minimum_pattern_n = 10`
- `minimum_local_group_n = 5`
- `coverage_check_required = true`
- `small_group_suppression_required = true`

Decision boundary:

- geen lokale ranking zonder veilige groepen
- geen TeamScan-output die doet alsof coverage voldoende is terwijl `department`-data ontbreekt

## Primary Code Surfaces

### Shared / Platform

- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [frontend/lib/scan-definitions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/scan-definitions.ts)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [frontend/components/dashboard/new-campaign-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/new-campaign-form.tsx)

### New TeamScan Module Surfaces

- `backend/products/team/__init__.py`
- `backend/products/team/definition.py`
- `backend/products/team/scoring.py`
- `backend/products/team/report_content.py` only if minimally required, otherwise defer
- `frontend/lib/products/team/index.ts`
- `frontend/lib/products/team/definition.ts`
- `frontend/lib/products/team/dashboard.ts`
- `frontend/lib/products/team/focus-questions.ts`
- `frontend/lib/products/team/action-playbooks.ts`

### Survey Surfaces

- [templates/survey.html](/C:/Users/larsh/Desktop/Business/Verisight/templates/survey.html)
- `templates/survey/team-*.html`
- [frontend/app/survey/[token]/route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/survey/[token]/route.ts)

### Dashboard Surfaces

- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx)

## Work Breakdown

### Track 1 - Runtime Registration and Campaign Setup

Tasks:

- [x] Voeg `team` toe aan gedeelde type- en registrylagen in backend en frontend.
- [x] Breid campaign setup uit zodat een admin TeamScan als product kan kiezen.
- [x] Beperk TeamScan in deze wave tot `department`-gedragen v1-basis binnen huidige metadatarealiteit.
- [x] Zorg dat bestaande ExitScan/RetentieScan/Pulse setupflows intact blijven.

Definition of done:

- [x] Een TeamScan-campaign kan in de huidige adminflow technisch worden aangemaakt.
- [x] Productregistratie resolveert TeamScan correct in backend en frontend.
- [x] Geen regressie in bestaande campaign-creatie voor andere producten.

### Track 2 - TeamScan Survey and Submit Flow

Tasks:

- [x] Ontwerp een minimale TeamScan surveydefinitie die past bij lokalisatie en niet bij brede diagnose.
- [x] Voeg TeamScan survey rendering toe in de bestaande tokenized surveyflow.
- [x] Maak de submit-validatie product-aware genoeg voor TeamScan.
- [x] Map TeamScan-antwoorden naar bestaande persistence zonder nieuwe runtime-entiteiten.

Definition of done:

- [x] Een respondent kan een TeamScan-survey laden en succesvol submitten.
- [x] De backend valideert en verwerkt TeamScan submissions productspecifiek.
- [x] Exit/retention/pulse submitcontracten blijven werken.

### Track 3 - TeamScan Scoring, Coverage, and Minimal Interpretation

Tasks:

- [x] Definieer een eerste TeamScan scoringcontract voor dit meetmoment.
- [x] Voeg coverage- en suppressiechecks toe voor lokale output op `department`.
- [x] Sla TeamScan-uitkomsten op in bestaande responsevelden en `full_result`.
- [x] Maak een eerste productspecifieke lokale duiding en fallback-copy voor onveilige of onvolledige local reads.

Definition of done:

- [x] TeamScan heeft een minimale maar coherente signal-, coverage- en interpretationlaag.
- [x] De output is managementleesbaar zonder priority- of causaliteitsclaim.
- [x] De producttaal schuift niet weg naar Segment Deep Dive of generieke teamtooling.

### Track 4 - TeamScan Dashboard Vertical Slice

Tasks:

- [x] Voeg een TeamScan dashboard view model toe aan de productmodulelaag.
- [x] Maak campaign page rendering geschikt voor TeamScan zonder brede page-refactor.
- [x] Zorg voor een eerste org-level summary plus veilige lokale groepenweergave of expliciete fallback-state.
- [x] Verberg of begrens PDF-download voor TeamScan in deze wave.

Definition of done:

- [x] Een TeamScan-campaign opent in het dashboard zonder te crashen.
- [x] De TeamScan dashboardread toont een bruikbare eerste lokale managementsnapshot.
- [x] Niet-ondersteunde reportflows zijn veilig afgevangen.

### Track 5 - Tests, Docs, and Smoke Validation

Tasks:

- [x] Voeg tests toe voor type/registry uitbreiding, TeamScan surveyflow, safety gating en TeamScan dashboard rendering.
- [x] Voeg regressietests toe waar bestaande producten geraakt kunnen worden.
- [x] Werk docs bij zodat dit wave-document en relevante strategy artifacts synchroon blijven.
- [x] Voer een handmatige of gescripte smoke-flow uit op campaign setup -> invite -> submit -> dashboard.

Definition of done:

- [x] Alle relevante tests voor deze wave zijn groen.
- [x] Gescripte smoke-validatie bewijst de volledige end-to-end TeamScan foundation slice.
- [x] Documentatie is synchroon met de werkelijke implementatie.

## Testplan

### Automated Tests

- [ ] Type- en registrytests voor `scan_type = team`
- [ ] Backend validatie- en scoringsunit tests voor TeamScan
- [ ] Survey submit tests voor TeamScan happy path en invalid payloads
- [ ] Tests voor coverage- en suppressiegedrag bij lokale output
- [ ] Dashboard rendering tests voor TeamScan view model
- [ ] Regressietests voor ExitScan, RetentieScan en Pulse campaign setup en submitflow

### Integration Checks

- [ ] TeamScan-campaign aanmaken via adminflow
- [ ] Respondenten importeren met en zonder `department`-metadata
- [ ] Tokenized TeamScan survey laden via frontend proxy
- [ ] TeamScan submission opslaan en terugzien in campaign read models
- [ ] TeamScan-dashboard openen zonder reportcrash
- [ ] Onvoldoende coverage of kleine groepen laten een expliciete fallback-state zien

### Smoke Path

1. Maak een `TeamScan` campaign aan in beheer.
2. Importeer een kleine respondentset met `department`-metadata.
3. Verstuur invites.
4. Open een survey-link via `/survey/{token}`.
5. Vul de TeamScan survey volledig in.
6. Controleer dat submit slaagt en de respondent completed is.
7. Open de TeamScan-campaign in het dashboard.
8. Controleer dat een eerste org-level summary en veilige lokale groepen zichtbaar zijn.
9. Controleer dat kleine groepen of ontbrekende `department`-coverage expliciet worden onderdrukt of als fallback-state verschijnen.
10. Controleer dat niet-ondersteunde report- of priorityfuncties niet misleidend beschikbaar zijn.

## Current Validation Snapshot

- [x] Backend: `.\.venv\Scripts\python.exe -m pytest tests/test_team_scoring.py tests/test_api_flows.py -q` -> `33 passed`
- [x] Frontend tests: `cmd /c npm test` -> `16 files passed`, `78 tests passed`
- [x] Frontend build: `cmd /c npm run build` -> groen
- [x] Type/lint gate via Next build is groen; expliciete `npm run build` sluit de TeamScan testfile ook mee.
- [x] Gescripte TeamScan smoke-flow is groen: campaign create `201`, import `200`, submit `200`, stats `200`, report `422` met expliciete boundarycopy
- [x] TeamScan PDF blijft in deze wave bewust begrensd: `TeamScan ondersteunt in deze wave nog geen PDF-rapport.`

## Assumptions/Defaults

- `TeamScan` landt in `WAVE_01` als aparte productline, niet als herlabelde `Segment Deep Dive`.
- De eerste TeamScan-cycle gebruikt de bestaande campaign abstraction.
- `department` is de enige primaire TeamScan-v1 boundary.
- `role_level` mag als context mee, maar niet als primaire localizer.
- Lokale prioritering, managementhandoff en buyer-facing activatie horen expliciet pas in latere waves.
- Als de huidige generieke `SurveySubmit`-vorm te rigide blijkt, mag deze wave hem productspecifiek refactoren zolang bestaande producten compatibel blijven.
- Er wordt geen nieuwe generieke team- of localizer-infrastructuur toegevoegd tenzij de wave tijdens uitvoering hard bewijst dat de bestaande campaign-keten onvoldoende is.

## Product Acceptance

- [x] Een TeamScan-campaign levert een echte eerste lokale managementsnapshot op.
- [x] TeamScan is inhoudelijk herkenbaar als lokalisatielaag na bredere signalering.
- [x] TeamScan voelt niet als een hernoemde segmentadd-on of managerbeoordeling.
- [x] De wave levert first value op zonder priority- of routeoverclaiming.

## Codebase Acceptance

- [x] TeamScan is correct geregistreerd in backend en frontend.
- [x] Nieuwe code zit in begrensde TeamScan-modules en minimale shared uitbreidingen.
- [x] ExitScan, RetentieScan en Pulse regressies zijn afgevangen.
- [x] Geen premature team-, manager- of workflow-abstrahering is toegevoegd.

## Runtime Acceptance

- [x] Een admin kan een TeamScan-campaign aanmaken.
- [x] Een respondent kan een TeamScan survey invullen.
- [x] De backend kan TeamScan submissions verwerken.
- [x] Het dashboard kan een TeamScan-campaign renderen.
- [x] Niet-ondersteunde report- of prioritypaden falen niet onduidelijk of misleidend.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] Gescripte smoke-flow is succesvol uitgevoerd op runtime-niveau.
- [x] Bestaande live ExitScan/RetentieScan/Pulse-paden zijn niet gebroken.
- [x] TeamScan-boundaries ten opzichte van Segment Deep Dive blijven intact.
- [x] Coverage- en suppressiegedrag zijn expliciet gevalideerd.

## Documentation Acceptance

- [x] Dit wave-document blijft synchroon met de feitelijke implementatie.
- [x] Relevante strategy docs of pointers zijn bijgewerkt waar nodig.
- [x] Het is na afronding duidelijk dat `WAVE_01` de actieve en daarna afgesloten source of truth was.
- [x] `WAVE_02` kan pas openen na expliciete green close-out van deze wave.

## Risks To Watch

- TeamScan wordt technisch te veel een vierde variant van de bestaande submit-keten zonder echte productidentiteit.
- De surveycontracten blijken te hard op de bestaande producten vast te zitten, waardoor een nette TeamScan-inpassing meer refactor vraagt dan verwacht.
- Dashboardrendering gaat impliciet uit van Exit/Retention/Pulse-specifieke outputstructuren.
- Lokale weergave lijkt managementsterker dan de data werkelijk draagt wanneer coverage of groepsgrootte zwak is.
- De eerste TeamScan-survey schuift inhoudelijk te veel richting brede diagnose of leiderschapsbeoordeling.

## Not In This Wave

- Geen lokale prioriteitsranking.
- Geen buyer-facing TeamScan productpagina of pricing.
- Geen TeamScan PDF-reportverplichting.
- Geen manager- of location-support.
- Geen Onboarding 30-60-90-werk.
- Geen generiek suiteplatform voor latere productlijnen.

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] een TeamScan-campaign end-to-end werkt van setup tot dashboard
- [x] TeamScan productspecifiek geregistreerd en gerenderd wordt
- [x] een TeamScan survey succesvol kan worden ingevuld
- [x] de eerste TeamScan managementsnapshot zichtbaar en begrijpelijk is
- [x] coverage- en suppressiegedrag veilig en expliciet werkt
- [x] code, docs, tests en smoke-validatie groen zijn

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_02_TEAMSCAN_LOCALIZATION_AND_PRIORITY_LOGIC.md`
