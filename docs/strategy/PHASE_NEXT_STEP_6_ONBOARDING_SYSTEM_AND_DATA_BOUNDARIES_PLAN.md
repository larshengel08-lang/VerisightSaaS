# Phase Next Step 6 - Onboarding System and Data Boundaries Plan

## Title

Lock the system fit, data boundaries, and minimum technical contract for `Onboarding 30-60-90` within the current Verisight architecture before any onboarding build wave starts.

## Korte Summary

Deze stap opent nog geen onboarding-build. Het document werkt alleen de technische en datakant uit van de mogelijke nieuwe productline `Onboarding 30-60-90`.

De huidige codebase laat een harde realiteit zien:

- productrouting is nog steeds volledig `scan_type`-gedreven via de backend- en frontendregistries
- de runtime blijft campaign-centered op `Organization -> Campaign -> Respondent -> SurveyResponse`
- `Respondent` bevat vandaag alleen `department`, `role_level`, `exit_month`, `annual_salary_eur` en `email`
- er bestaat nog geen `hire_date`, `start_date`, `tenure_band`, `cohort_id`, `manager_id` of lifecycle-object voor medewerkers
- onboarding bestaat vandaag alleen als client-onboarding/adoptiebetekenis, niet als employee-onboarding runtime

De hoofdkeuze van deze stap is daarom:

- `Onboarding 30-60-90` moet in v1 binnen de bestaande campaign-kern passen
- v1 mag later wel een nieuw `scan_type` worden, maar niet tegelijk een employee-lifecycle engine of personeelsprofiel-systeem vereisen
- de eerste technische vorm moet campaign-level lifecycle checkpoints gebruiken in plaats van een brede, persistente onboardingstate per medewerker
- nieuwe metadata mag alleen worden geopend als die direct nodig is voor de eerste verticale slice

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen onboarding-build gestart
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

Na `PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md` is inhoudelijk duidelijk wat `Onboarding 30-60-90` moet zijn. Wat nog ontbrak, is de technische vertaling:

- hoe past een first-90-days product in de huidige campaign-centered runtime?
- welke data bestaat vandaag echt voor nieuwe medewerkers?
- waar ligt de grens tussen een onboarding productline en een te vroege lifecycle-engine?
- welke contracts moeten eerst worden gelockt voordat een eerste onboarding-wave mag openen?

Zonder deze stap zouden we te snel kunnen springen naar:

- nieuwe medewerker-profielen met hire dates en lifecycle state
- persistente cohort- of schedule-engines
- brede multi-checkpoint orchestration
- buyer-facing claims die de huidige data nog niet kan dragen

Deze stap houdt de onboardinglijn dus bewust technisch klein en eerlijk.

## Current Implementation Baseline

### 1. Runtime and registry fit

- [x] huidige backendregistry kent alleen `exit`, `retention`, `pulse` en `team`
- [x] huidige frontendregistry kent alleen `exit`, `retention`, `pulse` en `team`
- [x] productrouting is overal `scan_type`-gedreven
- [x] er bestaat nog geen generiek run-, artifact- of lifecyclemodel voor productspecifieke execution

### 2. Core entity fit

- [x] `Campaign` is de primaire runtimecontainer
- [x] `Respondent` is de primaire metadatahouder
- [x] `SurveyResponse` is de primaire execution-output
- [x] dashboard en report-output blijven derived artifacts

### 3. Current respondent data boundary

- [x] huidige respondentmetadata: `department`, `role_level`, `exit_month`, `annual_salary_eur`, `email`
- [x] er bestaat nog geen `hire_date`
- [x] er bestaat nog geen `start_month`
- [x] er bestaat nog geen `onboarding_stage`
- [x] er bestaat nog geen `cohort_label`
- [x] er bestaat nog geen `manager`, `location` of lifecycle ownership-context

### 4. Current survey-response boundary

- [x] huidige surveyresponsestructuur is inhoudelijk gevormd rond exit-, retention-, pulse- en teamsignalen
- [x] bestaande velden zoals `tenure_years`, `exit_reason_code`, `stay_intent_score`, `uwes_score` en `turnover_intention_score` zijn niet automatisch een onboardingcontract
- [x] huidige scoring en reportlogica zijn dus nog niet onboarding-ready

### 5. Existing onboarding meaning boundary

- [x] onboarding betekent vandaag in Verisight vooral client onboarding, setup en adoptie
- [x] die betekenis leeft al in actieve docs en frontend lifecyclecopy
- [x] een nieuwe onboarding-productline moet semantisch en technisch daarvan gescheiden blijven

## Decision

### 1. Onboarding System Fit

`Onboarding 30-60-90` wordt architecturaal vastgezet als:

- een mogelijke nieuwe productspecifieke lijn
- binnen dezelfde `Organization -> Campaign -> Respondent -> SurveyResponse` keten
- later gerouteerd via een nieuw `scan_type = onboarding`
- zonder nieuw primair runtime-object voor `EmployeeProfile`, `LifecycleState`, `CohortRun` of `OnboardingJourney`

Beslissing:

- onboarding v1 moet binnen de bestaande campaign-centered runtime landen
- een onboarding-build mag pas afwijken van dit model als later expliciet bewezen wordt dat de campaign-kern niet volstaat

### 2. Onboarding Checkpoint Direction

Omdat de huidige runtime geen medewerker-lifecycle of hire-date model heeft, wordt de eerste technische richting als volgt gelockt:

- een onboarding-campaign representeert later precies een checkpoint of lifecyclemoment
- v1 mengt dus niet tegelijk `30`, `60` en `90` dagen in een enkele slimme runtimeflow
- checkpointlogica wordt in eerste instantie campaign-level gedacht, niet respondent-level orchestration

Voorlopige richting:

- `checkpoint_scope = single_checkpoint_per_campaign`
- mogelijke latere waarden: `day_30`, `day_60`, `day_90`

Beslissing:

- onboarding v1 moet later starten met een eenvoudige checkpoint-per-campaign vorm
- er komt nog geen automatische multi-step employee journey binnen de runtime

### 3. Onboarding Data Boundary

De minimale onboarding-v1 databoundary wordt vastgezet als:

- `required_population_boundary = invited_new_hires_for_one_checkpoint`
- `optional_context_fields = department, role_level`
- `checkpoint_identity = campaign-level concern`

Niet toegestaan als v1-default:

- persistente hire-date berekeningen over meerdere campaigns
- automatische respondent-routering naar `30/60/90`
- manager- of location-logica
- individuele employee timelines

Beslissing:

- onboarding v1 mag niet leunen op metadata die vandaag nog niet bestaat
- `department` en `role_level` mogen later context geven, maar zijn niet hetzelfde als lifecycle checkpointing

### 4. Metadata Sufficiency Rule

Voor toekomstige onboarding-execution geldt de volgende minimumregel:

- de populatie moet expliciet afgebakend zijn als relevante nieuwe-instroomgroep voor een enkel checkpoint
- zonder duidelijke checkpointafbakening mag onboarding niet doen alsof `30`, `60` of `90` dagen betrouwbaar worden gemeten

In deze stap wordt dat nog niet numeriek geopend, maar wel contractmatig begrensd:

- `checkpoint_definition_required = true`
- `mixed_checkpoint_population_forbidden = true`
- `fallback_if_checkpoint_boundary_unclear = do_not_open_onboarding_output`

Beslissing:

- onboarding mag niet impliciet doen alsof een random nieuwemedewerkerslijst al een valide `30-60-90` meting is
- er moet altijd een expliciete campaign-level checkpointgrens zijn

### 5. Delivery Mode Direction

De huidige producten kennen `baseline` en `live`. Voor onboarding wordt nu alvast begrensd:

- onboarding v1 heeft later alleen een begeleide, discrete executionvorm nodig
- een always-on `live`-variant past nu niet bij de huidige runtime of productlogica

Voorlopige richting:

- `delivery_mode = baseline_only` voor de eerste onboarding-wave

Beslissing:

- onboarding opent later niet meteen als live of ritmeproduct
- repeat of uitbreidingen horen pas thuis na bewezen eerste waarde

### 6. Read-Model Direction

Onboarding moet later aansluiten op de bestaande derived output-architectuur:

- survey execution -> `SurveyResponse`
- aggregate compute -> derived onboarding read-model
- dashboard en report-output blijven derived artifacts

Voor v1 wordt de read-modelrichting vastgezet als:

- `checkpoint_summary`
- `early_success_factors`
- `early_friction_factors`
- `first_manager_questions`
- `first_owner`
- `first_action_boundary`

Beslissing:

- onboarding bouwt later een productspecifieke derived readlaag
- er komt in deze fase nog geen generieke lifecycle analytics service

### 7. Boundary vs Existing Client Onboarding And Lifecycle Support

De bestaande client-onboardinglaag blijft bestaan en wordt niet automatisch hergebruikt als productruntime.

Huidige client-onboardinglaag:

- setup, intake en first value voor klanten
- lifecycleondersteuning na eerste sale
- adoption- en deliverycontext

Toekomstige onboarding-productline:

- inhoudelijke employee-lifecycle surveyroute
- eigen surveyflow
- eigen managementread
- eigen managementhandoff

Beslissing:

- bestaande onboardingcopy of lifecyclehelpers mogen later alleen worden hergebruikt waar dat semantisch veilig is
- de productline mag niet gedefinieerd worden als "client onboarding met surveyvragen"

### 8. API And Contract Direction

Voor latere buildstappen worden nu alvast de minimale contractrichtingen gelockt.

#### Future scan type contract

- `scan_type = onboarding`

#### Future campaign checkpoint contract

- `checkpoint_key`
- `checkpoint_label`
- `checkpoint_population_note`

#### Future respondent boundary contract

- `department` optional
- `role_level` optional
- geen verplichte hire-date engine in v1

#### Future onboarding aggregate contract

- `campaign_id`
- `checkpoint_key`
- `population_count`
- `completion_count`
- `early_success_factors`
- `early_friction_factors`
- `first_owner`
- `first_action_boundary`

#### Future onboarding interpretation contract

- `group_level_only = true`
- `individual_prediction = forbidden`
- `manager_performance_claim = forbidden`

Beslissing:

- deze contracts zijn verplichte input voor de volgende onboarding master-index- en wave-stackstap

### 9. Explicit Non-Goals For This Step

Deze stap opent expliciet nog niet:

- een nieuw `Employee`- of `LifecycleProfile`-model
- nieuwe respondentvelden in runtime
- automatische scheduling van `30`, `60` en `90` dagen
- buyer-facing onboardingroutes
- pricing of entitlementlogica
- multi-campaign trend- of cohortengines
- koppelingen naar HRIS of externe datasystemen

Beslissing:

- onboarding-planning blijft voorlopig system-fit-first en niet lifecycle-platform-first

## Key Changes

- onboarding is nu technisch vastgezet binnen de bestaande campaign-centered architectuur
- de eerste technische richting is checkpoint-per-campaign, niet employee-lifecycle orchestration
- de huidige datarealiteit is expliciet gemaakt: nog geen hire-date, cohort of onboardingstage
- de volgende stap wordt nu master-index en wave-stack, niet build

## Belangrijke Interfaces/Contracts

### 1. Runtime Contract

Later toegestaan:

- nieuw `scan_type = onboarding`
- productspecifieke onboardingmodule
- campaign-level checkpointing

Nu nog niet toegestaan:

- nieuw lifecycle-object
- onboarding state machine
- onboarding schedule engine

### 2. Data Contract

Later toegestaan:

- minimale campaign-level checkpointmetadata
- optionele context via `department` en `role_level`

Nu nog niet toegestaan:

- brede medewerkerprofielen
- impliciete hire-date logica zonder expliciet model
- mixed checkpoint interpretation

### 3. Interpretation Contract

Onboarding moet later op groepsniveau blijven:

- geen individuele beoordeling
- geen performance-instrument
- geen voorspelling over individueel succes of vertrek

### 4. Governance Contract

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_7_ONBOARDING_MASTER_INDEX_AND_WAVE_STACK_PLAN.md`

Niet toegestaan:

- `WAVE_01_ONBOARDING_*`
- nieuwe buyer-facing onboardingroute
- nieuwe runtimevelden "voor later" zonder directe wave-reden

## Primary Reference Surfaces

- [backend/models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [supabase/schema.sql](/C:/Users/larsh/Desktop/Business/Verisight/supabase/schema.sql)
- [backend/products/shared/registry.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/shared/registry.py)
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/registry.ts)
- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [frontend/lib/client-onboarding.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.ts)
- [docs/active/CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md)
- [docs/strategy/PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md)

## Testplan

### Product acceptance

- [x] De systeemvorm past bij de beoogde onboardingmanagementvraag.
- [x] De productline wordt niet per ongeluk een brede lifecycle-engine.
- [x] De lijn blijft onderscheiden van client onboarding.

### Codebase acceptance

- [x] Het document erkent de huidige registry- en databeperkingen expliciet.
- [x] Er wordt geen niet-bestaande respondentmetadata verondersteld.
- [x] Er wordt geen platformverbreding vooruit gebouwd.

### Runtime acceptance

- [x] Geen runtimewijzigingen in deze stap.
- [x] Geen nieuwe schema- of routewijzigingen in deze stap.
- [x] Geen onboarding execution geopend in deze stap.

### QA acceptance

- [x] Het grootste technische risico, ontbreken van hire-date/checkpointdata, is expliciet begrensd.
- [x] De volgende stap is smal en logisch.
- [x] De planning voorkomt voortijdige lifecycle-enginebouw.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor onboarding system and data boundaries.
- [x] Het document sluit aan op de huidige codebase-realiteit.
- [x] De vervolgstap is eenduidig vastgezet.

## Assumptions/Defaults

- onboarding v1 moet later binnen de huidige campaign-kern passen
- checkpoint-per-campaign is de veiligste eerste technische vorm
- nieuwe metadata mag pas worden geopend wanneer een eerste onboarding-wave dat direct vereist
- een bredere lifecycle-engine blijft voorlopig buiten scope

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_7_ONBOARDING_MASTER_INDEX_AND_WAVE_STACK_PLAN.md`

Er is nog geen build permission voor een onboarding-wave.
