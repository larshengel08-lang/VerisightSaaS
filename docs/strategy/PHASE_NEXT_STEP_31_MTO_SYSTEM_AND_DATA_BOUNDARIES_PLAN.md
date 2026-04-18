# Phase Next Step 31 - MTO System and Data Boundaries Plan

## Title

Lock the MTO system fit, data boundaries, and minimum technical contract within the current Verisight architecture before any MTO build wave starts.

## Korte Summary

Deze stap werkt de technische en datakant van `MTO` uit, maar opent nog geen build. Het document bepaalt hoe MTO straks binnen de bestaande Verisight-architectuur moet landen, welke bestaande entiteiten en operating layers bruikbaar blijven, welke extra MTO-zwaarte later wel ruimte vraagt, en welke verbredingen expliciet nog niet zijn toegestaan.

De huidige codebase laat zien:

- productrouting blijft `scan_type`-gedreven via backend- en frontendregistries
- de runtime blijft campaign-centered op `Organization`, `Campaign`, `Respondent` en `SurveyResponse`
- dashboard, report-to-action, delivery checkpoints en learning bestaan al als aparte maar koppelbare operating layers
- bestaande respondentmetadata is beperkt tot onder andere `department`, `role_level`, `exit_month`, `annual_salary_eur` en `email`
- er bestaat nog geen generieke survey builder of generieke action workflowlaag

De hoofdkeuze van deze stap is daarom:

- MTO moet in v1 starten binnen de bestaande campaign-kern
- MTO mag zwaarder zijn in survey, output en opvolging, zonder direct een nieuw platformmodel te vereisen
- MTO mag later een bounded productspecifieke action-loglaag openen, maar niet als eerste systeembeslissing
- `department` en `role_level` blijven verrijkingsmetadata, niet de bestaansvoorwaarde voor een brede MTO-org-read

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen MTO-build gestart
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

Na `PHASE_NEXT_STEP_30_MTO_ENTRY_AND_BOUNDARIES_PLAN.md` is inhoudelijk duidelijk wat MTO moet zijn. Wat nog ontbrak, is de technische vertaling:

- past MTO eerst nog in de huidige campaign-centered runtime?
- welke bestaande operating layers kunnen we hergebruiken?
- welke databoundaries zijn nu echt beschikbaar?
- waar ligt de grens tussen zwaardere productwaarde en brede platformverbouwing?

Zonder deze stap zouden we te snel kunnen springen naar:

- een generieke survey engine
- een brede workflow- of tasklaag
- nieuwe tenant-, workspace- of entitlementobjecten
- een onnodig groot datamodel nog voor de eerste MTO-productwaarde bewezen is

Deze stap houdt MTO dus bewust product-first en system-fit-first.

## Current Implementation Baseline

### 1. Runtime and registry fit

- [x] huidige backend- en frontendregistries zijn productspecifiek en `scan_type`-gedreven
- [x] de huidige campaignflow, surveyflow en dashboardflow zijn al end-to-end bruikbaar als basis
- [x] er bestaat nog geen `scan_type = mto`

### 2. Core entity fit

- [x] `Campaign` is de primaire fulfillment- en runtimecontainer
- [x] `Respondent` houdt minimale metadata vast
- [x] `SurveyResponse` is de primaire execution-output
- [x] derived dashboard-, report- en managementlagen leven boven op deze kern

### 3. Operating layer fit

- [x] report-to-action contractlaag bestaat al voor prioriteit, gesprek, eigenaar, eerste actie en reviewmoment
- [x] `CampaignDeliveryRecord` en `CampaignDeliveryCheckpoint` bestaan al als persistente delivery spine
- [x] `PilotLearningDossier` en `PilotLearningCheckpoint` bestaan al als learning- en closurelaag
- [x] er bestaat nog geen expliciete productspecifieke management action log naast deze delivery/learning-spine

### 4. Current data boundary fit

- [x] brede org-reads kunnen nu al draaien zonder verplichte lokale metadata
- [x] `department` en `role_level` bestaan als optionele verrijkingsvelden
- [x] er is nog geen rijk people profile-, org chart- of respondent contextmodel
- [x] open tekst, factor- en scorevelden bestaan al in `SurveyResponse`

## Decision

### 1. MTO Must Stay Campaign-Centered In V1

MTO moet architecturaal starten binnen dezelfde campaign-centered runtime als de rest van Verisight.

Beslissing:

- geen aparte MTO-control plane
- geen nieuwe workspace- of run-entiteit als eerste vereiste
- geen brede cross-product orchestrationlaag
- MTO moet eerst passen binnen `Organization -> Campaign -> Respondent -> SurveyResponse`

Rationale:

- dit sluit aan op de bestaande architectuur
- dit voorkomt dat MTO een dekmantel wordt voor brede platformverbouwing

### 2. MTO May Be Heavier Without Becoming Generic

MTO mag in v1 zwaarder zijn dan bestaande scans op:

- surveyomvang
- themadiepte
- managementread
- rapportlaag
- actionability

Maar MTO mag niet meteen openen:

- een generieke dynamic survey builder
- een generieke workflow engine
- een generieke task management laag voor alle producten

Beslissing:

- MTO mag productspecifieke zwaarte krijgen
- die zwaarte moet landen in een begrensde MTO-modulelaag, niet in brede platforminfra

### 3. MTO Data Boundary

De minimale MTO-v1 databoundary wordt als volgt vastgezet:

- `required_for_org_read = survey responses with safe group-level aggregation`
- `optional_enrichment = department, role_level`
- `existing_response_store = SurveyResponse`
- `productspecific_detail_allowed = full_result and derived MTO view models`

Niet toegestaan als v1-prerequisite:

- nieuw people masterdata-model
- org chart / reporting line model
- generieke respondent profile service
- brede entitlement- of seatlogica

Beslissing:

- MTO moet een brede org-read kunnen leveren zonder dat lokale metadata een harde voorwaarde wordt
- lokale metadata mag de MTO-read verrijken, maar mag MTO-v1 niet blokkeren

### 4. MTO Privacy and Suppression Contract

MTO moet minstens even streng blijven als de huidige suite op privacy en suppressie.

Minimale contractrichting:

- `minimum_detail_n >= 5`
- `minimum_pattern_n >= 10`
- `segment_output_requires_safe_grouping = true`
- `small_group_suppression_required = true`

Beslissing:

- MTO mag rijker worden in managementread en dashboarddiepte
- MTO mag niet rijker worden via unsafe local detail of te vroege kleine-groep-output

### 5. MTO Derived Read Model Direction

De toekomstige MTO-v1 outputrichting wordt nu alvast gelockt op derived artifacts boven op de bestaande runtimekern:

- `org_level_summary`
- `theme_priorities`
- `management_questions`
- `report_to_action_contract`
- `review_boundaries`
- `optional_segment_enrichment`

Voor latere waves kan daar productspecifiek bijkomen:

- `management_action_log`
- `action_status_overview`
- `follow_up_trace`

Beslissing:

- MTO bouwt eerst een eigen derived readlaag
- er komt nog geen generieke cross-product analytics engine

### 6. MTO Action Logging Boundary

MTO vraagt waarschijnlijk explicietere opvolging dan de bestaande scans. Daarom wordt nu alvast vastgezet:

- een latere MTO-wave mag een bounded productspecifieke action-loglaag openen
- die laag mag niet als generieke workflow- of ticketingengine worden ontworpen
- de bestaande delivery spine en learning spine blijven in v1 de governance- en closure-context

Contractrichting voor later:

- `campaign_id`
- `source_theme`
- `action_title`
- `owner_label`
- `status`
- `review_date`
- `notes`

Beslissing:

- action logging hoort expliciet bij de MTO-wave stack
- het hoort niet als eerste systeemvereiste in de foundation wave

### 7. MTO Dashboard and Report Boundary

MTO moet later rijkere output krijgen dan bestaande bounded scans, maar gefaseerd.

In deze stap wordt daarom vastgezet:

- de eerste MTO-wave hoeft alleen een minimale coherente MTO dashboardread te leveren
- rijkere dashboarddiepte hoort in een aparte vervolgwave
- formele rapportage en action logging horen pas open in een latere MTO-wave

Beslissing:

- MTO-output wordt bewust in lagen opgebouwd
- report, action logging en operator hardening openen niet tegelijk in wave 1

### 8. Explicit Non-Goals For This Step

Deze stap opent expliciet nog niet:

- `scan_type = mto`
- schemawijzigingen
- generieke survey builder
- generieke task/workflow engine
- buyer-facing MTO-activatie
- suitebrede vervanging van bestaande scans

Beslissing:

- deze stap blijft system-fit-first en documentgedreven

## Key Changes

- MTO is nu technisch vastgezet binnen de bestaande campaign-centered architectuur
- brede org-read is losgekoppeld van verplichte lokale metadata
- een latere bounded MTO action-loglaag is bestuurlijk toegestaan, maar nog niet geopend
- MTO-zwaarte wordt geland in productspecifieke modules en derived artifacts, niet in brede platforminfra

## Belangrijke Interfaces/Contracts

### MTO Runtime Fit Contract

- `organization`
- `campaign`
- `respondent`
- `survey_response`
- `scan_type = mto` (later te openen)

Beslissing:

- MTO moet eerst in deze keten passen

### MTO Data Contract

- `required_for_org_read = safe response aggregation`
- `optional_enrichment = department, role_level`
- `unsupported_v1_prerequisites = people_masterdata, org_chart, workflow_engine`

Beslissing:

- latere waves mogen hier niet stilzwijgend van afwijken

### MTO Derived Output Contract

- `org_level_summary`
- `theme_priorities`
- `management_questions`
- `report_to_action_contract`
- `review_boundaries`
- `optional_segment_enrichment`

Beslissing:

- dit wordt de minimale MTO-readrichting voor wave-planning

### MTO Action Log Contract Direction

- `campaign_id`
- `source_theme`
- `action_title`
- `owner_label`
- `status`
- `review_date`
- `notes`

Beslissing:

- dit contract mag pas in een latere MTO-wave worden uitgewerkt

## Testplan

### Architecture fit review

- [x] gecontroleerd dat MTO kan starten binnen de huidige campaign-centered runtime
- [x] gecontroleerd dat de bestaande operating layers al bruikbaar precedent bieden voor zwaardere opvolging
- [x] gecontroleerd dat er nog geen expliciete campaign-level action-loglaag bestaat

### Data boundary test

- [x] brede org-read hoeft niet afhankelijk te zijn van `department` of `role_level`
- [x] `department` en `role_level` kunnen wel als verrijkingslaag dienen
- [x] er is geen bestaand people masterdata-model waarop MTO-v1 veilig kan leunen

### Scope control test

- [x] MTO-zwaarte wordt niet verward met noodzaak voor brede platformbouw
- [x] een latere action-loglaag blijft productspecifiek en bounded
- [x] generieke survey- en workflow-infra blijven geblokkeerd

### Smoke-validatie

#### Scenario 1

Een stakeholder wil MTO meteen alleen laten werken als alle teams en role levels perfect zijn aangeleverd.

- Resultaat: afwijzen
- Waarom: MTO-v1 moet brede org-read kunnen leveren zonder lokale metadata als harde voorwaarde

#### Scenario 2

Een stakeholder wil meteen een generieke task engine bouwen voor MTO-opvolging.

- Resultaat: afwijzen
- Waarom: alleen een bounded productspecifieke action-loglaag mag later open

#### Scenario 3

Een stakeholder wil MTO-wave 1 al laten afhangen van een nieuw people- of org-chartmodel.

- Resultaat: afwijzen
- Waarom: dat past niet binnen de huidige system-fit boundary

## Assumptions/Defaults

- MTO start binnen de bestaande campaign-kern
- MTO-v1 moet brede org-read kunnen leveren zonder lokale metadata als bestaansvoorwaarde
- `department` en `role_level` blijven verrijking, geen harde fundering
- action logging hoort later bij MTO, maar niet in de foundation wave
- de volgende stap ontwerpt alleen master index en wave stack, geen build

## Product Acceptance

- [x] MTO blijft product-first en system-fit-first
- [x] MTO krijgt ruimte voor extra zwaarte zonder direct brede platformverbouwing te openen
- [x] de route naar latere action logging is expliciet, maar bounded

## Codebase Acceptance

- [x] Deze stap blijft documentgedreven
- [x] De beslissingen volgen de bestaande registries, models en operating layers
- [x] Er is geen nieuwe runtime of schema-uitbreiding geopend

## Runtime Acceptance

- [x] Geen MTO-runtimewijzigingen
- [x] Geen nieuwe API-routes
- [x] Geen nieuwe generieke infra-objecten

## QA Acceptance

- [x] De huidige codebase is expliciet getoetst op system fit en operating-layer precedent
- [x] Scopelek naar generieke survey- of workflowinfra is expliciet geblokkeerd
- [x] Het document bevat concrete smoke-situaties voor latere MTO-waves

## Documentation Acceptance

- [x] Dit document kan dienen als source of truth voor MTO system- en datagrenzen
- [x] Het document eindigt met een heldere volgende stap

## Not In This Step

- Geen `scan_type = mto`
- Geen MTO registry-entry
- Geen schemawijziging
- Geen dashboard- of reportimplementatie
- Geen action-logimplementatie

## Exit Gate

Deze stap is afgerond omdat:

- [x] MTO system fit is vastgezet
- [x] de MTO-v1 databoundary is gelockt
- [x] de derived outputrichting expliciet is gemaakt
- [x] bounded action logging bestuurlijk is geplaatst zonder al te openen
- [x] de volgende stap scherp is afgebakend

## Next Step After Approval

Na goedkeuring van deze stap volgt:

- `PHASE_NEXT_STEP_32_MTO_MASTER_INDEX_AND_WAVE_STACK_PLAN.md`

Verplichte inputs voor die stap:

- MTO runtime fit contract
- MTO data contract
- MTO derived output contract
- MTO action log contract direction
- harde regel dat de volgende stap alleen governance, wavevolgorde en active source-of-truth vastzet
