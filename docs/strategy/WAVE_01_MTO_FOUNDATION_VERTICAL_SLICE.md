# WAVE_01_MTO_FOUNDATION_VERTICAL_SLICE

## Title

Open the first end-to-end MTO vertical slice inside the current Verisight campaign-centered runtime, without report generation, action logging, or buyer-facing activation.

## Korte Summary

Deze wave bouwt de eerste echte `MTO`-slice, maar bewust nog niet de volledige productlijn. Het doel is om MTO als nieuwe, zwaardere hoofdmeting technisch en productmatig te laten landen binnen de bestaande Verisight-architectuur: een admin moet een MTO-campaign kunnen aanmaken, respondenten moeten een eerste MTO-survey kunnen invullen, de backend moet de submissie kunnen verwerken, en het dashboard moet een eerste minimale en veilige organisatiebrede managementread tonen.

Deze wave is expliciet een foundation vertical slice. Dat betekent: wel een volledige end-to-end flow, maar nog zonder formele rapportlaag, action logging, operatorhardening, buyer-facing activatie of suitevervanging. `MTO` moet in deze wave aantonen dat het als aparte productline kan landen zonder te vervallen in "RetentieScan maar langer" en zonder de bestaande ExitScan/RetentieScan/Pulse/TeamScan/Onboarding/Leadership-runtime te destabiliseren.

Status van deze wave:

- Wave status: planned_not_open_for_build_until_this_doc_exists
- Active source of truth after approval: dit document
- Build permission: allowed_now
- Next allowed wave after green completion: `WAVE_02_MTO_MANAGEMENT_READ_AND_DASHBOARD_DEPTH.md`

## Why This Wave Now

Deze wave volgt logisch uit:

- [PHASE_NEXT_STEP_30_MTO_ENTRY_AND_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/docs/strategy/PHASE_NEXT_STEP_30_MTO_ENTRY_AND_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_31_MTO_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/docs/strategy/PHASE_NEXT_STEP_31_MTO_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_32_MTO_MASTER_INDEX_AND_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/docs/strategy/PHASE_NEXT_STEP_32_MTO_MASTER_INDEX_AND_WAVE_STACK_PLAN.md)

Daarin is al vastgezet dat:

- `MTO` een nieuwe, zwaardere productlijn is
- `MTO` een brede organisatiebrede hoofdmeting is
- `MTO` eerst intern / assisted en geisoleerd moet blijven
- `MTO` in v1 binnen de bestaande campaign-centered runtime moet passen
- dashboarddiepte, report-to-action en action logging pas later open mogen

De huidige codebase geeft hiervoor ook een concreet startpunt:

- `scan_type`-routing bestaat al productspecifiek via backend- en frontendregistries
- de runtime draait al op `Organization -> Campaign -> Respondent -> SurveyResponse`
- bestaande productmodules voor `pulse`, `team`, `onboarding` en `leadership` leveren bounded precedenten voor nieuwe scan_types
- de campaign page, dashboard shell en suppressie-aware patternlaag bestaan al

Deze wave gebruikt die basis en vermijdt bewust brede survey-, workflow- of suiteverbouwing.

## Planned User Outcome

Na deze wave moet een Verisight-beheerder:

- een MTO-campaign kunnen aanmaken
- respondenten kunnen importeren en uitnodigen
- een eerste interne MTO-survey kunnen laten invullen
- in het dashboard een eerste brede organisatie-read kunnen openen

Na deze wave moet een klantgebruiker:

- een MTO-campaign in het dashboard kunnen bekijken
- een eerste geaggregeerde MTO-snapshot kunnen lezen
- expliciet kunnen zien dat dit nog geen rapport, geen action log en geen publieke hoofdroute is

Wat deze wave nog niet hoeft te leveren:

- formele rapportgeneratie of PDF
- expliciete action logging
- dashboarddiepte met rijkere managementblokken
- operatorhardening of delivery-checkpoint uitbreiding
- buyer-facing MTO-activatie
- suitevervanging van bestaande scans

## Scope In

- uitbreiding van `scan_type` naar `mto` in shared types, registries en campaignflow
- nieuwe MTO-productmodule in backend en frontend
- minimale MTO-surveydefinitie en MTO-survey rendering
- product-aware submit- en validatielogica voor MTO
- eerste MTO scoring- en interpretation contract
- opslag van MTO-uitkomsten binnen de bestaande campaign/respondent/response-keten
- suppressie- en aggregatiechecks voor veilige org-read output
- minimale MTO dashboardweergave met `mto_summary`, `theme_priorities` en expliciete boundary-state
- admin setup voor MTO-campaigns binnen huidige beheerflow
- tests en smoke-validatie voor de volledige MTO foundation slice
- docs-update van actieve source of truth en relevante contracts

## Scope Out

- formele reportgenerator of PDF-output voor MTO
- action logging of status-tracking
- generieke survey builder
- generieke workflow of task engine
- buyer-facing MTO-routeactivatie
- live suite replacement
- brede refactor van bestaande scanproducten
- parallelle `Customer Feedback` / `NPS` implementatie of gecombineerde employee-plus-customer read

## Dependencies

- [PHASE_NEXT_STEP_30_MTO_ENTRY_AND_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/docs/strategy/PHASE_NEXT_STEP_30_MTO_ENTRY_AND_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_31_MTO_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/docs/strategy/PHASE_NEXT_STEP_31_MTO_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_32_MTO_MASTER_INDEX_AND_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/docs/strategy/PHASE_NEXT_STEP_32_MTO_MASTER_INDEX_AND_WAVE_STACK_PLAN.md)

## Key Changes

- `MTO` wordt toegevoegd als nieuwe productspecifieke module naast `exit`, `retention`, `pulse`, `team`, `onboarding` en `leadership`.
- De gedeelde `scan_type`- en registrylaag wordt uitgebreid zonder nieuw generic runtime- of people-model.
- De survey submit-keten wordt product-aware genoeg gemaakt om een MTO payload toe te laten zonder bestaande producten te breken.
- De huidige campaign setup-flow wordt uitgebreid met `MTO`, maar in deze wave alleen als eerste geaggregeerde org-read.
- Het dashboard krijgt een eerste MTO-viewmodel dat organisatiebreed beeld en topprioriteiten toont, met duidelijke boundarycopy dat rapport, action logging en publieke activatie nog niet open zijn.
- Dezelfde basis blijft later herbruikbaar voor `Customer Feedback` / `NPS`, maar deze wave blijft expliciet MTO-first en employee-domain only.

## Belangrijke Interfaces/Contracts

### 1. Scan Type Contract

Na deze wave moet `mto` ondersteund worden in:

- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/frontend/lib/types.ts)
- [frontend/lib/scan-definitions.ts](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/frontend/lib/scan-definitions.ts)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/frontend/lib/products/shared/registry.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/backend/products/shared/registry.py)
- relevante campaign- en dashboardflows

Contract:

- `scan_type = 'exit' | 'retention' | 'pulse' | 'team' | 'onboarding' | 'leadership' | 'mto'`

Decision boundary:

- alleen `scan_type` wordt uitgebreid
- geen nieuw generic producttype-, identity- of runmodel

### 2. MTO Campaign Contract

De eerste MTO-campaign in deze wave gebruikt bewust de bestaande campaign abstraction.

Contract:

- `scan_type = 'mto'`
- `delivery_mode = 'baseline'`
- `group_level_only = true`
- `required_identity_model = none`
- `optional_context = department | role_level`

Decision boundary:

- voor `WAVE_01` krijgt MTO geen nieuwe org-chart-, hierarchy- of action-log keuze
- v1 blijft op bestaande respondentmetadata en productspecifieke survey-items leunen

### 3. MTO Survey Contract

De eerste MTO-survey moet breed genoeg zijn om een zwaardere hoofdmeting te dragen, maar nog compact genoeg om binnen de bestaande surveyketen te passen.

Minimale productregels:

- organisatiebrede hoofdmeting op groepsniveau
- breder dan `Pulse`, `TeamScan` en `Leadership Scan`
- survey combineert volledige SDT-werkbeleving, volledige werkfactorlaag en een managementrichtingsvraag
- geen exit-specifieke context, geen named leader output en geen workflowlaag

Technisch contract voor deze wave:

- nieuwe MTO surveydefinitie
- MTO surveytemplate binnen de bestaande gedeelde surveyflow
- productspecifieke submit-validatie
- compatibel met huidige tokenized surveyflow

Decision boundary:

- geen generieke survey builder
- geen custom questionnaire engine
- geen report- of actionvelden in de submitlaag

### 4. MTO Submission and Persistence Contract

De submit-keten moet MTO kunnen verwerken zonder de bestaande suite te destabiliseren.

Contract:

- MTO-validatie gebeurt productspecifiek via nieuwe MTO-module
- MTO scoring output komt in bestaande `SurveyResponse`-keten terecht
- MTO mag gebruikmaken van `full_result` voor productspecifieke output
- bestaande responseopslag blijft de system of record

Decision boundary:

- geen nieuwe `Run`-tabel
- geen aparte MTO-results store
- geen apart action-log object in deze wave

### 5. MTO Dashboard Contract

De eerste MTO-dashboardread moet minimaal tonen:

- een geaggregeerde organisatiebrede MTO-summary
- topprioriteiten in thema's wanneer veilig toonbaar
- expliciete boundarycopy dat dit nog geen report- of actionlaag is
- duidelijke begrenzing dat deze wave nog geen publieke hoofdroute of suitevervanging opent

Contract:

- MTO krijgt een eigen frontend productmodule en dashboard view model
- MTO landt in de bestaande campaign page
- report download wordt voor MTO in deze wave verborgen, gedeactiveerd of expliciet nog niet ondersteund

Decision boundary:

- geen PDF-report verplicht in `WAVE_01`
- geen action log verplicht in `WAVE_01`

### 6. MTO Privacy and Aggregation Contract

MTO-output mag alleen verschijnen als de bestaande safety-grenzen gehaald zijn.

Contract:

- `group_level_only = true`
- `minimum_detail_n = 5`
- `minimum_pattern_n = 10`
- `segment_output_requires_safe_grouping = true`
- `small_group_suppression_required = true`

Decision boundary:

- geen output die aanvoelt als individuele beoordeling
- geen lokale segmentread die zonder veilige groepsgrootte verschijnt

## Primary Code Surfaces

### Shared / Platform

- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/frontend/lib/types.ts)
- [frontend/lib/scan-definitions.ts](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/frontend/lib/scan-definitions.ts)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/frontend/lib/products/shared/registry.ts)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/backend/products/shared/registry.py)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/backend/main.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/backend/schemas.py)
- [frontend/components/dashboard/new-campaign-form.tsx](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/frontend/components/dashboard/new-campaign-form.tsx)

### New MTO Module Surfaces

- `backend/products/mto/__init__.py`
- `backend/products/mto/definition.py`
- `backend/products/mto/scoring.py`
- `frontend/lib/products/mto/index.ts`
- `frontend/lib/products/mto/definition.ts`
- `frontend/lib/products/mto/dashboard.ts`
- `frontend/lib/products/mto/focus-questions.ts`
- `frontend/lib/products/mto/action-playbooks.ts`

### Dashboard Surfaces

- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx)

## Work Breakdown

### Track 1 - Runtime Registration and Campaign Setup

Tasks:

- [ ] Voeg `mto` toe aan gedeelde type- en registrylagen in backend en frontend.
- [ ] Breid campaign setup uit zodat een admin MTO als product kan kiezen.
- [ ] Beperk MTO in deze wave tot geaggregeerde v1-basis binnen huidige metadatarealiteit.
- [ ] Zorg dat bestaande setupflows intact blijven.

Definition of done:

- [ ] Een MTO-campaign kan in de huidige adminflow technisch worden aangemaakt.
- [ ] Productregistratie resolveert MTO correct in backend en frontend.
- [ ] Geen regressie in bestaande campaign-creatie voor andere producten.

### Track 2 - MTO Survey and Submit Flow

Tasks:

- [ ] Ontwerp een minimale MTO surveydefinitie die breder is dan de bounded scans maar nog netjes binnen de huidige flow past.
- [ ] Voeg MTO survey rendering toe in de bestaande tokenized surveyflow.
- [ ] Maak de submit-validatie product-aware genoeg voor MTO.
- [ ] Map MTO-antwoorden naar bestaande persistence zonder nieuwe runtime-entiteiten.

Definition of done:

- [ ] Een respondent kan een MTO-survey laden en succesvol submitten.
- [ ] De backend valideert en verwerkt MTO submissions productspecifiek.
- [ ] Bestaande submitcontracten blijven werken.

### Track 3 - MTO Scoring, Aggregation, and Minimal Interpretation

Tasks:

- [ ] Definieer een eerste MTO scoringcontract voor deze hoofdmeting.
- [ ] Voeg suppressie- en aggregatiechecks toe voor veilige org-read output.
- [ ] Sla MTO-uitkomsten op in bestaande responsevelden en `full_result`.
- [ ] Maak een eerste productspecifieke duiding en fallback-copy voor onveilige of te zwakke output.

Definition of done:

- [ ] MTO heeft een minimale maar coherente brede signal-, aggregatie- en interpretationlaag.
- [ ] De output is managementleesbaar zonder report- of actionlogclaim.
- [ ] De producttaal schuift niet weg naar Pulse, TeamScan of RetentieScan.

### Track 4 - MTO Dashboard Vertical Slice

Tasks:

- [ ] Voeg een MTO dashboard view model toe aan de productmodulelaag.
- [ ] Maak campaign page rendering geschikt voor MTO zonder brede page-refactor.
- [ ] Zorg voor een eerste organisatiebrede summary plus expliciete boundary-state.
- [ ] Verberg of begrens reportdownload voor MTO in deze wave.

Definition of done:

- [ ] Een MTO-campaign opent in het dashboard zonder te crashen.
- [ ] De MTO dashboardread toont een bruikbare eerste managementsnapshot.
- [ ] Niet-ondersteunde reportflows zijn veilig afgevangen.

### Track 5 - Tests, Docs, and Smoke Validation

Tasks:

- [ ] Voeg tests toe voor type/registry-uitbreiding, MTO surveyflow, safety gating en dashboard rendering.
- [ ] Voeg regressietests toe waar bestaande producten geraakt kunnen worden.
- [ ] Werk docs bij zodat dit wave-document synchroon blijft met de implementatie.
- [ ] Voer een smoke-flow uit op campaign setup -> invite -> submit -> dashboard.

Definition of done:

- [ ] Alle relevante tests voor deze wave zijn groen.
- [ ] Smoke-validatie bewijst de volledige end-to-end MTO foundation slice.
- [ ] Documentatie is synchroon met de werkelijke implementatie.

## Testplan

### Automated Tests

- [ ] Type- en registrytests voor `scan_type = mto`
- [ ] Backend validatie- en scoringsunit tests voor MTO
- [ ] Survey submit tests voor MTO happy path en invalid payloads
- [ ] Tests voor suppressie- en aggregatiegedrag bij org-read output
- [ ] Dashboard rendering tests voor MTO view model
- [ ] Regressietests voor bestaande producten waar shared lagen veranderen

### Integration Checks

- [ ] MTO-campaign aanmaken via adminflow
- [ ] Respondenten importeren met en zonder contextmetadata
- [ ] Tokenized MTO survey laden via frontend proxy
- [ ] MTO submission opslaan en terugzien in campaign read models
- [ ] MTO-dashboard openen zonder reportcrash
- [ ] Onveilige of te zwakke output laat een expliciete fallback-state zien

### Smoke Path

1. Maak een `MTO` campaign aan in beheer.
2. Importeer een respondentset met bestaande contextmetadata.
3. Verstuur invites.
4. Open een survey-link via `/survey/{token}`.
5. Vul de MTO survey volledig in.
6. Controleer dat submit slaagt en de respondent completed is.
7. Open de MTO-campaign in het dashboard.
8. Controleer dat een eerste geaggregeerde managementsummary zichtbaar is.
9. Controleer dat reportdownload nog niet beschikbaar of expliciet begrensd is.
10. Controleer dat te zwakke output expliciet wordt onderdrukt of als fallback-state verschijnt.

## Assumptions/Defaults

- `MTO` landt in `WAVE_01` als aparte productline, niet als herlabelde RetentieScan.
- De eerste MTO-cycle gebruikt de bestaande campaign abstraction.
- `department` en `role_level` mogen als verrijking mee, maar zijn geen harde voorwaarde voor de eerste org-read.
- Report, action logging, operatorhardening en buyer-facing activatie horen expliciet pas in latere waves.
- `Customer Feedback` / `NPS` blijft buiten `WAVE_01`; deze wave opent geen parallelle klantdomeinlogica.
- Als de huidige generieke `SurveySubmit`-vorm te rigide blijkt, mag deze wave hem productspecifiek uitbreiden zolang bestaande producten compatibel blijven.

## Product Acceptance

- [ ] Een MTO-campaign levert een echte eerste brede managementsnapshot op.
- [ ] MTO is inhoudelijk herkenbaar als bredere hoofdmeting en niet als lichte vervolgscan.
- [ ] MTO voelt niet als report-, actionlog- of buyer-facing route.
- [ ] De wave levert first value op zonder privacy- of routeoverclaiming.

## Codebase Acceptance

- [ ] MTO is correct geregistreerd in backend en frontend.
- [ ] Nieuwe code zit in begrensde MTO-modules en minimale shared uitbreidingen.
- [ ] Bestaande producten hebben geen regressie op de gedeelde lagen.
- [ ] Geen premature workflow-, report- of action-abstrahering is toegevoegd.

## Runtime Acceptance

- [ ] Een admin kan een MTO-campaign aanmaken.
- [ ] Een respondent kan een MTO survey invullen.
- [ ] De backend kan MTO submissions verwerken.
- [ ] Het dashboard kan een MTO-campaign renderen.
- [ ] Niet-ondersteunde reportpaden falen niet onduidelijk of misleidend.

## QA Acceptance

- [ ] Relevante tests zijn groen.
- [ ] Smoke-flow is succesvol uitgevoerd op runtime-niveau.
- [ ] Bestaande live paden zijn niet gebroken.
- [ ] MTO-boundaries ten opzichte van RetentieScan, Pulse en TeamScan blijven intact.
- [ ] Suppressie- en aggregatiegedrag zijn expliciet gevalideerd.

## Documentation Acceptance

- [ ] Dit wave-document blijft synchroon met de feitelijke implementatie.
- [ ] Relevante strategy docs of pointers zijn bijgewerkt waar nodig.
- [ ] Het is na afronding duidelijk dat `WAVE_01` de actieve en daarna afgesloten source of truth was.
- [ ] `WAVE_02` kan pas openen na expliciete green close-out van deze wave.

## Risks To Watch

- MTO wordt technisch te veel een nieuwe labelvariant van de bestaande retentionflow zonder eigen productidentiteit.
- De surveycontracten blijken te hard op de bestaande bounded scans vast te zitten.
- Dashboardrendering gaat impliciet uit van bestaande productspecifieke outputstructuren.
- De eerste MTO-read claimt te veel diepte zonder report- of actionlaag.
- De eerste MTO-survey wordt te zwaar voor de bestaande flow of te licht voor een geloofwaardige hoofdmeting.

## Not In This Wave

- Geen reportgenerator of PDF voor MTO.
- Geen action logging.
- Geen operatorhardening.
- Geen buyer-facing MTO-activatie.
- Geen suite replacement.

## Exit Gate

Deze wave is pas klaar wanneer:

- [ ] een MTO-campaign end-to-end werkt van setup tot dashboard
- [ ] MTO productspecifiek geregistreerd en gerenderd wordt
- [ ] een MTO survey succesvol kan worden ingevuld
- [ ] de eerste MTO managementsnapshot zichtbaar en begrijpelijk is
- [ ] suppressie- en aggregatiegedrag veilig en expliciet werkt
- [ ] code, docs, tests en smoke-validatie groen zijn

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_02_MTO_MANAGEMENT_READ_AND_DASHBOARD_DEPTH.md`
