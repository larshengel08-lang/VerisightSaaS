# Phase Next Step 2 - TeamScan System and Data Boundaries Plan

## Title

Lock the TeamScan system fit, data boundaries, and minimum technical contract within the current campaign-centered Verisight architecture before any TeamScan build wave starts.

## Korte Summary

Deze stap werkt de technische en datakant van `TeamScan` uit, maar opent nog geen build. Het document bepaalt hoe `TeamScan` straks binnen de bestaande campaign-centered architectuur moet landen, welke huidige entiteiten en read-models bruikbaar blijven, welke metadata-grenzen nu echt bestaan, en welke uitbreidingen expliciet nog niet zijn toegestaan.

De huidige codebase laat zien:

- productrouting blijft `scan_type`-gedreven via de backend- en frontendregistries in [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py) en [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
- de runtime blijft campaign-centered op `Organization`, `Campaign`, `Respondent` en `SurveyResponse` in [backend/models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- `Respondent` bevat nu alleen minimale segmentmetadata: `department` en `role_level`
- huidige segmentverdieping en segmentplaybooks draaien al op die metadata in [frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx)
- `team` wordt vandaag in import expliciet genormaliseerd naar `department` in [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)

De hoofdkeuze van deze stap is daarom:

- `TeamScan` moet eerst binnen de bestaande campaign-kern passen
- `TeamScan` krijgt in v1 geen nieuw runtime-object naast `Campaign`, `Respondent` en `SurveyResponse`
- `TeamScan` mag in v1 wel een nieuw `scan_type` worden, maar niet tegelijk een nieuw people profile system, manager-domein of generieke team-engine vereisen
- `department` blijft de primaire TeamScan-boundary totdat een latere stap expliciet bewijst dat extra metadata nodig én verantwoord is

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen TeamScan-build gestart
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

Na `PHASE_NEXT_STEP_1_TEAMSCAN_ENTRY_BOUNDARIES_PLAN.md` is inhoudelijk duidelijk wat `TeamScan` moet zijn. Wat nog ontbrak, is de technische vertaling:

- past TeamScan nog in de huidige campaign-centered runtime?
- welke metadata kan TeamScan nu echt gebruiken?
- waar ligt de grens tussen TeamScan en bestaande segmentlogica?
- welke nieuwe contracts moeten later worden ingevoerd voordat een build wave open mag?

Zonder deze stap zouden we te snel kunnen springen naar:

- nieuw metadatafundament voor managers of locaties
- nieuwe entiteiten voor teams, teamleden of teamruns
- generieke lokalisatie- of rankingengines
- te vroege claims over teamniveau die de huidige data nog niet dragen

Deze stap houdt TeamScan dus bewust klein en technisch eerlijk.

## Current Implementation Baseline

### 1. Runtime and registry fit

- [x] huidige backendregistry kent `exit`, `retention`, `pulse`
- [x] huidige frontendregistry kent `exit`, `retention`, `pulse`
- [x] productrouting is overal `scan_type`-gedreven
- [x] er bestaat nog geen generiek artifact- of runmodel voor productspecifieke execution

### 2. Core entity fit

- [x] `Campaign` is de primaire runtimecontainer
- [x] `Respondent` is de primaire metadatahouder voor segmentation / local context
- [x] `SurveyResponse` is de primaire execution-output
- [x] dashboard en report-output blijven derived artifacts

### 3. Current data boundary fit

- [x] huidige respondentmetadata: `department`, `role_level`
- [x] `team` alias -> `department`
- [x] geen native `manager`, `location`, `team_id`, `business_unit`, `tenure_band` of `leadership_context`
- [x] `role_level` is bruikbaar als context, maar niet als lokale groepsidentifier

### 4. Current read-model fit

- [x] huidige campaign detail haalt respondentcontext nu alleen binnen als `department` en `role_level`
- [x] huidige segmentplaybooks berekenen groepen op `department` en `role_level`
- [x] huidige suppressie is al gekoppeld aan minimale n-grenzen
- [x] huidige TeamScan-relevante vragen bestaan nu alleen impliciet in copy, playbooks en focusvragen, niet als eigen product-runtime

## Decision

### 1. TeamScan System Fit

`TeamScan` wordt architecturaal vastgezet als:

- een nieuwe productspecifieke lijn
- binnen dezelfde `Organization -> Campaign -> Respondent -> SurveyResponse` keten
- gerouteerd via een later toe te voegen `scan_type = team`
- zonder nieuw primair runtime-object voor `Team`, `Manager`, `Squad` of `Workgroup`

Beslissing:

- TeamScan v1 moet binnen de bestaande campaign-centered runtime landen
- een TeamScan-build mag pas afwijken van dit model als een latere stap expliciet bewijst dat de campaign-kern niet volstaat

### 2. TeamScan Data Boundary

De minimale TeamScan-v1 databoundary wordt vastgezet als:

- `primary_grouping_field = department`
- `secondary_context_field = role_level`
- `required_localization_metadata = department`
- `optional_context_metadata = role_level`

Niet toegestaan als v1-default:

- `manager`
- `location`
- `team_id`
- `leadership_context`
- samengestelde multi-field localizers zonder expliciet datamodel

Beslissing:

- zonder `department` is TeamScan-v1 niet technisch voldoende onderbouwd
- `role_level` alleen is niet genoeg voor een primaire TeamScan-route

### 3. TeamScan Metadata Sufficiency Rule

Voor toekomstige TeamScan-execution geldt de volgende minimumregel:

- TeamScan kan alleen verantwoord draaien als er bruikbare `department`-metadata is voor een betekenisvol deel van de populatie
- de latere buildstap moet expliciet checken of metadata coverage voldoende is voordat lokale uitsplitsing wordt getoond

In deze stap wordt coverage nog niet hard numeriek geopend, maar wel contractmatig begrensd:

- `coverage_check_required = true`
- `local_output_requires_department = true`
- `fallback_to_org_read_only = true` wanneer lokale metadata onvoldoende blijkt

Beslissing:

- TeamScan mag niet impliciet doen alsof elke campagne lokale teamread kan tonen
- er moet altijd een expliciete fallback bestaan naar “nog geen veilige teamuitsplitsing”

### 4. TeamScan Privacy and Suppression Contract

De huidige suppressielogica wordt de minimale technische ondergrens voor TeamScan:

- `minimum_detail_n = 5`
- `minimum_pattern_n = 10`
- `minimum_local_group_n = 5`

Daarnaast wordt voor TeamScan alvast vastgezet:

- `small_group_suppression_required = true`
- `local_ranking_without_safe_groups = forbidden`
- `team_output_without_required_metadata = forbidden`

Beslissing:

- TeamScan mag geen lokale ranking tonen als groepen onder suppressiegrenzen vallen
- TeamScan mag geen veilige localizer claimen als de data dat niet draagt

### 5. TeamScan Read-Model Direction

TeamScan moet later aansluiten op de bestaande derived output-architectuur:

- survey execution -> `SurveyResponse`
- aggregate/localization compute -> derived TeamScan read-model
- dashboard en report-output blijven derived artifacts

Voor v1 wordt de read-modelrichting vastgezet als:

- `org_level_summary`
- `local_group_candidates`
- `top_local_contexts`
- `first_local_owner`
- `first_local_action`
- `suppressed_groups_summary`

Beslissing:

- TeamScan bouwt later een productspecifieke derived readlaag
- er komt in deze fase nog geen generiek localizer engine of cross-product ranking service

### 6. TeamScan Boundary vs Existing Segment Logic

De huidige segmentlogica blijft bestaan en wordt niet automatisch vervangen.

Huidige segmentlogica:

- beschrijvende verdieping binnen bestaande lijnen
- alleen zichtbaar bij voldoende metadata en voldoende n
- primair bedoeld als controlled deep dive, niet als eigen productflow

TeamScan-logica later:

- eigen surveyflow
- eigen productmodule
- eigen managementhandoff
- lokalisatie als primaire productwaarde

Beslissing:

- TeamScan mag bestaande segmenthelpers hergebruiken waar nuttig
- TeamScan mag niet worden gedefinieerd als “segment deep dive met nieuwe naam”

### 7. TeamScan API and Contract Direction

Voor latere buildstappen worden nu alvast de minimale contractrichtingen gelockt.

#### Future scan type contract

- `scan_type = team`

#### Required metadata contract

- `department` required for local group output
- `role_level` optional as context

#### Team aggregate contract

- `campaign_id`
- `team_boundary = department`
- `group_count`
- `safe_group_count`
- `suppressed_group_count`
- `top_local_contexts`
- `org_signal_reference`
- `local_priority_rows`

#### Team privacy contract

- `minimum_local_group_n`
- `suppressed_groups`
- `suppression_reason`

#### Team handoff contract

- `source_scan_type`
- `source_campaign_id`
- `source_signal_theme`
- `localization_reason`
- `first_local_question`

Beslissing:

- deze contracts zijn verplichte input voor de volgende TeamScan master-index- en wave-stackstap

### 8. Explicit Non-Goals For This Step

Deze stap opent expliciet nog niet:

- een nieuwe `Team`-tabel
- een `Manager`-tabel
- nieuwe respondentvelden in runtime
- buyer-facing TeamScan-routes
- pricing of entitlementlogica
- cross-campaign localizer engines
- multi-boundary support voor `department`, `manager`, `location` tegelijk

Beslissing:

- TeamScan-planning blijft voorlopig system-fit-first en niet platform-expansie-first

## Key Changes

- TeamScan is nu technisch vastgezet binnen de bestaande campaign-centered architectuur
- `department` is expliciet gelockt als primaire TeamScan-v1 grouping boundary
- `role_level` blijft alleen secundaire context
- metadata coverage en suppressie zijn contractueel verplicht voordat TeamScan later lokale output mag tonen
- huidige segmentlogica blijft bestaan maar wordt expliciet onderscheiden van toekomstige TeamScan-productlogica

## Belangrijke Interfaces/Contracts

### TeamScan Runtime Fit Contract

- `organization`
- `campaign`
- `respondent`
- `survey_response`
- `scan_type = team` (later te openen)

Beslissing:

- TeamScan moet eerst in deze keten passen

### TeamScan Metadata Contract

- `required: department`
- `optional: role_level`
- `unsupported_v1: manager, location, team_id, leadership_context`

Beslissing:

- Step 3 en latere build waves mogen hier niet stilzwijgend van afwijken

### Team Localization Read Contract

- `org_level_summary`
- `local_group_candidates`
- `local_priority_rows`
- `suppressed_groups_summary`
- `first_local_owner`
- `first_local_action`

Beslissing:

- dit wordt de minimale derived-outputrichting voor TeamScan

### TeamScan Privacy Contract

- `minimum_detail_n = 5`
- `minimum_pattern_n = 10`
- `minimum_local_group_n = 5`
- `coverage_check_required = true`
- `small_group_suppression_required = true`

Beslissing:

- privacy- en suppressieregels zijn geen optionele polish, maar kerncontract

## Work Breakdown

### Step 2A - Lock system fit

- [x] Leg vast dat TeamScan binnen de bestaande campaign-centered runtime moet landen
- [x] Sluit nieuwe primaire runtime-objecten uit voor v1-planning

Definition of Done:

- [x] TeamScan heeft een duidelijke plaats binnen de huidige systeemlagen

### Step 2B - Lock data boundary

- [x] Benoem welke metadata nu echt beschikbaar is
- [x] Leg vast welke metadata later vereist is voor lokale output
- [x] Sluit unsupported boundaries expliciet uit

Definition of Done:

- [x] De TeamScan-v1 databoundary is decision-complete

### Step 2C - Lock read-model and suppression direction

- [x] Bepaal de minimale derived output-richting
- [x] Koppel suppressie en coverage aan TeamScan-output
- [x] Sluit unsafe local ranking uit

Definition of Done:

- [x] De toekomstige TeamScan-readlaag is inhoudelijk scherp genoeg om een wave-stack op te bouwen

### Step 2D - Lock the follow-on step

- [x] Benoem welke contracts naar de master-index- en wave-stackstap moeten
- [x] Leg vast dat er nog geen TeamScan-build open mag

Definition of Done:

- [x] De overgang naar Step 3 is beperkt en expliciet

## Testplan

### Architecture Fit Review

- [x] Gecontroleerd dat TeamScan kan starten binnen de huidige `Organization -> Campaign -> Respondent -> SurveyResponse` keten
- [x] Gecontroleerd dat huidige registries nog geen TeamScan bevatten maar wel dezelfde routevorm afdwingen

### Metadata Reality Test

- [x] `department` is het enige huidige primaire lokale groepeerveld
- [x] `role_level` bestaat als secundaire context
- [x] `manager` en `location` bestaan niet als respondentmetadata
- [x] `team` blijft nu alias van `department`

### Segment Boundary Test

- [x] Huidige segmenthelpers draaien op `department` en `role_level`
- [x] Huidige segmentdeepdive is add-on en geen zelfstandige productruntime
- [x] TeamScan is dus later alleen geloofwaardig met eigen scan- en handofflogica

### Privacy Boundary Test

- [x] huidige grens `5 / 10 / 5` is overgenomen als minimale TeamScan-startgrens
- [x] lokale ranking zonder veilige groepen is expliciet uitgesloten
- [x] onvoldoende metadata vereist expliciete fallback

### Smoke-validatie

#### Scenario 1

Een campagne heeft `department` voor bijna alle respondenten.

- Resultaat: technisch geschikt als TeamScan-v1 kandidaat
- Waarom: primaire teamboundary is aanwezig

#### Scenario 2

Een campagne heeft alleen `role_level`.

- Resultaat: niet geschikt voor TeamScan-v1 als primaire lokale read
- Waarom: `role_level` blijft context, geen primaire teamgroep

#### Scenario 3

Een campagne heeft veel kleine afdelingen onder de suppressiegrens.

- Resultaat: lokale ranking onderdrukken
- Waarom: privacycontract gaat voor lokaliseerdrang

#### Scenario 4

Een stakeholder wil TeamScan meteen op managers draaien.

- Resultaat: nog niet toegestaan
- Waarom: `manager` is geen huidige respondentboundary en geen v1-default

#### Scenario 5

Een stakeholder wil bestaande segmentplaybooks simpelweg hernoemen naar TeamScan.

- Resultaat: afwijzen
- Waarom: TeamScan vereist eigen productruntime en eigen handoffcontract

## Assumptions/Defaults

- TeamScan blijft de logisch volgende productlijn na `Pulse`
- TeamScan moet eerst binnen de huidige campaign-kern passen
- `department` blijft de primaire TeamScan-v1 boundary
- metadata-uitbreiding blijft voorlopig uit scope
- buyer-facing TeamScan blijft dicht
- de volgende stap ontwerpt alleen master index en wave stack, geen build

## Product Acceptance

- [x] TeamScan blijft technisch klein en inhoudelijk scherp
- [x] TeamScan wordt niet stiekem een herlabelde segmentlaag
- [x] De systeemgrenzen ondersteunen de productdefinitie uit Step 1

## Codebase Acceptance

- [x] Deze stap blijft documentgedreven
- [x] De beslissingen volgen bestaande registries, models, import en dashboardhelpers
- [x] Er is geen nieuwe runtime of schema-uitbreiding geopend

## Runtime Acceptance

- [x] Geen TeamScan-runtimewijzigingen
- [x] Geen nieuwe API-routes
- [x] Geen nieuwe entiteiten of read-services

## QA Acceptance

- [x] De huidige codebase is expliciet getoetst op system fit en metadatarealiteit
- [x] Privacy- en suppressierisico’s zijn expliciet vertaald naar TeamScan-contracten
- [x] Het document bevat concrete smoke-situaties voor latere TeamScan-waves

## Documentation Acceptance

- [x] Dit document kan dienen als source of truth voor TeamScan system- en datagrenzen
- [x] Het document eindigt met een heldere volgende stap

## Not In This Step

- Geen `scan_type = team`
- Geen TeamScan registry-entry
- Geen schemawijziging
- Geen dashboard- of reportimplementatie
- Geen routeactivatie of pricingwerk

## Exit Gate

Deze stap is afgerond omdat:

- [x] TeamScan system fit is vastgezet
- [x] de TeamScan-v1 databoundary is gelockt
- [x] read-modelrichting en suppressiecontract expliciet zijn gemaakt
- [x] unsupported boundaries zijn uitgesloten
- [x] de volgende stap scherp is afgebakend

## Next Step After Approval

Na goedkeuring van deze stap volgt:

- `PHASE_NEXT_STEP_3_TEAMSCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md`

Verplichte inputs voor die stap:

- TeamScan runtime fit contract
- TeamScan metadata contract
- Team localization read contract
- TeamScan privacy contract
- harde regel dat Step 3 alleen governance, wavevolgorde en active source-of-truth vastzet
