# Phase Next Step 7 - Onboarding Master Index and Wave-Stack Plan

## Title

Lock the `Onboarding 30-60-90` master index structure, active source-of-truth pointer, and the first controlled onboarding build-wave stack before any onboarding implementation starts.

## Korte Summary

Deze stap opent `Onboarding 30-60-90` nog niet als build. Het document doet voor onboarding wat eerder ook voor `Pulse` en `TeamScan` nodig was: vastzetten hoe de productlijn bestuurlijk gevolgd gaat worden, welke volgorde van build waves is toegestaan, welke workstreams expliciet geblokkeerd blijven, en welk artifact vanaf hier de eerstvolgende write-enabled source of truth mag worden.

De vorige twee onboarding-stappen hebben al scherp gemaakt dat:

- `Onboarding 30-60-90` de logische volgende productline-candidate is na `TeamScan`
- onboarding een vroege lifecycle-scan voor nieuwe medewerkers moet zijn, niet een generieke onboardingtool
- onboarding in v1 binnen de bestaande campaign-centered runtime moet passen
- onboarding v1 later met `single_checkpoint_per_campaign` moet starten
- onboarding niet mag vervallen tot client onboarding, een brede lifecycle-engine of een verbrede `RetentieScan`

De hoofdkeuze van deze stap is daarom:

- `Onboarding 30-60-90` krijgt een eigen master-indexvorm in `docs/strategy`
- onboarding opent niet breed, maar via vier begrensde waves
- de eerste toegestane wave is een smalle foundation slice binnen de bestaande campaign-centered runtime
- buyer-facing activatie, brede metadata-uitbreiding en lifecycle-automation blijven expliciet laat of geblokkeerd

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen onboarding-wave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

Na [PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md) en [PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md) is duidelijk wat onboarding moet zijn en waar het technisch binnen moet passen. Wat nog ontbrak, is de bestuurlijke startconfiguratie voor daadwerkelijke uitvoering:

- welk onboarding-artifact straks de actieve source of truth wordt
- welke onboarding-waves precies zijn toegestaan
- welke volgorde verplicht is
- welke code-oppervlakken per wave logisch binnen scope liggen
- welke dingen bewust nog niet mee mogen in onboarding-v1

Dat is extra belangrijk omdat onboarding sneller dan eerdere lijnen kan ontsporen in overlap met:

- bestaande client onboarding en adoption-copy
- bestaande lifecycle- en expansionlogica
- bestaande retain/monitor/localize-vragen van `RetentieScan`, `Pulse` en `TeamScan`
- te vroege hire-date-, cohort- of schedule-uitbreidingen

Deze stap voorkomt dat door nu al vast te zetten hoe onboarding gecontroleerd open mag.

## Current Implementation Baseline

### 1. Productline and runtime reality

- [x] huidige registries kennen nog geen `scan_type = onboarding`
- [x] huidige runtime blijft campaign-centered op `Organization -> Campaign -> Respondent -> SurveyResponse`
- [x] er bestaat nog geen onboarding-productmodule, onboarding-dashboardflow of onboarding-reportpad

### 2. Data and checkpoint reality

- [x] huidige respondentmetadata kent nog geen `hire_date`, `start_month`, `onboarding_stage` of `cohort_label`
- [x] onboarding v1 moet later daarom starten met `single_checkpoint_per_campaign`
- [x] `department` en `role_level` zijn hoogstens contextvelden, geen lifecycle-engine
- [x] mixed checkpoint-populaties zijn nog niet toegestaan

### 3. Semantic boundary reality

- [x] onboarding betekent vandaag in de repo vooral client onboarding en adoption
- [x] een nieuwe onboarding-productline moet daarvan expliciet onderscheiden blijven
- [x] buyer-facing onboarding bestaat vandaag nog niet als route of pricinglijn

### 4. Governance reality

- [x] de repo werkt nu met one-wave-at-a-time governance
- [x] `Pulse` en `TeamScan` zijn afgerond als eerste nieuwe productlijnen
- [x] onboarding mag pas nu als volgende gecontroleerde productlijn bestuurlijk worden voorbereid

## Decision

### 1. Onboarding Master Index Purpose

Voor `Onboarding 30-60-90` komt er een centrale bestuurlijke index die het hele vervolgtraject van deze productlijn bewaakt.

Doel van de onboarding master index:

- actieve source-of-truth aanwijzen
- wavevolgorde bewaken
- completed versus blocked work zichtbaar houden
- afhankelijkheden en gates centraal tonen
- voorkomen dat onboarding tegelijk uiteenvalt in survey, dashboard, copy, lifecycle-claims en marketingwerk

Beslissing:

- onboarding krijgt als derde nieuwe productlijn een eigen master index
- deze index leeft in `docs/strategy`
- deze index is bestuurlijk en niet buyer-facing

### 2. Onboarding Master Index Structure

De toekomstige onboarding master index moet minimaal de volgende velden bevatten:

- `productline`
- `status`
- `current_source_of_truth`
- `current_active_wave`
- `last_completed_step`
- `last_completed_wave`
- `next_allowed_wave`
- `blocked_waves`
- `dependency_stack`
- `acceptance_summary`
- `open_risks`
- `update_rule`

Verplichte secties:

1. Summary
2. Current Source of Truth
3. Completed Strategy Steps
4. Allowed Onboarding Wave Stack
5. Blocked Work
6. Acceptance State
7. Open Risks
8. Next Allowed Wave

Beslissing:

- er komt precies een master index voor onboarding
- nieuwe onboarding-wave documenten moeten vanuit die index vindbaar zijn

### 3. Initial Onboarding Master Index State

De index moet starten met deze bestuurlijke status:

- `productline: Onboarding 30-60-90`
- `status: planned_not_open`
- `current_source_of_truth: dit document totdat WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE.md expliciet wordt geopend`
- `current_active_wave: none`
- `last_completed_step: PHASE_NEXT_STEP_7_ONBOARDING_MASTER_INDEX_AND_WAVE_STACK_PLAN.md`
- `last_completed_wave: none`
- `next_allowed_wave: WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE.md`

Geblokkeerde waves bij start:

- elke extra onboarding-wave voordat `WAVE_01` groen is
- elke buyer-facing onboarding-activatie voordat `WAVE_04` expliciet opent
- elke nieuwe productlijn buiten onboarding

Beslissing:

- de master index opent nog geen build
- hij wijst alleen de eerstvolgende toegestane onboarding-wave aan

### 4. Onboarding Build-Stack Principles

De eerste onboarding-stack moet voldoen aan de volgende principes:

- campaign-centered blijven
- eerst een end-to-end vertical slice bouwen voor precies een checkpoint
- geen hire-date engine, cohort scheduler of lifecycle state machine vooruit bouwen
- managementoutput pas uitbreiden na bewezen checkpoint-read
- buyer-facing activatie pas doen nadat onboarding echt onderscheidend en verantwoord is

Beslissing:

- onboarding wordt in kleine, managementbruikbare slices opgebouwd
- elke wave moet echte lifecyclewaarde leveren en niet alleen technische voorbereiding

### 5. Allowed Onboarding Wave Stack

#### WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE

Doel:

- `Onboarding 30-60-90` als nieuwe productline technisch en productmatig laten landen binnen de huidige campaign-centered runtime
- een eerste end-to-end onboarding-cyclus mogelijk maken van campaign setup tot survey submit tot minimale checkpoint-read

Planned user outcome:

- Verisight kan een eerste onboarding-campaign draaien voor een enkel checkpoint en een eerste compacte managementsnapshot tonen zonder brede lifecycle-claims

Scope in:

- `scan_type` uitbreiding naar `onboarding` in registries en gedeelde types
- productspecifieke onboarding module in backend en frontend
- minimale onboarding surveydefinitie en submit-validatie
- checkpoint-per-campaign contract
- onboarding scoring- en interpretation contract
- eerste onboarding dashboardread met `checkpoint_summary`, `early_success_factors` en `early_friction_factors`
- docs, tests en smokeflow voor end-to-end onboarding run

Scope out:

- meerdere checkpoints in een campaign
- hire-date routing
- buyer-facing routeactivatie
- onboarding PDF-report
- teamlokalisatie of trendvergelijking

Dependencies:

- [PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- dit document

Primary code surfaces:

- `backend/products/shared/registry.py`
- `frontend/lib/products/shared/registry.ts`
- `frontend/lib/types.ts`
- nieuwe `backend/products/onboarding/*`
- nieuwe `frontend/lib/products/onboarding/*`
- relevante surveytemplates
- campaign creation en campaign dashboard surfaces

Exit gate:

- een onboarding-campaign kan worden aangemaakt
- een respondent kan een onboarding-survey invullen
- onboarding-output toont een minimale, coherente checkpoint-read
- docs, tests en smoke-validatie zijn groen

Next allowed wave:

- `WAVE_02_ONBOARDING_CHECKPOINT_INTERPRETATION_AND_BOUNDARIES.md`

#### WAVE_02_ONBOARDING_CHECKPOINT_INTERPRETATION_AND_BOUNDARIES

Doel:

- onboarding echte lifecyclewaarde geven door de checkpoint-read inhoudelijk scherper en veiliger te interpreteren

Planned user outcome:

- management ziet niet alleen een checkpointbeeld, maar begrijpt ook welke vroege succes- en frictiesignalen bestuurlijk aandacht vragen en welke claims nog niet gemaakt mogen worden

Scope in:

- checkpointinterpretatie en boundary-copy
- first-manager-questions
- expliciete distinction tussen vroege frictie en latere retentieclaims
- tests en smoke voor heldere checkpointgrenzen

Scope out:

- meerdere checkpoints vergelijken
- generieke lifecycle analytics
- buyer-facing activatie

Dependencies:

- `WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE` groen

Primary code surfaces:

- onboarding dashboard view model
- aggregate/read helpers
- onboarding definition copy
- tests voor checkpointinterpretatie

Exit gate:

- onboarding toont bestuurlijk bruikbare checkpointinterpretatie
- het product overclaimt nog niet op retentie of performance
- tests, docs en smoke zijn groen

Next allowed wave:

- `WAVE_03_ONBOARDING_MANAGEMENT_OUTPUT_AND_HANDOFF.md`

#### WAVE_03_ONBOARDING_MANAGEMENT_OUTPUT_AND_HANDOFF

Doel:

- onboarding van een technische checkpointflow naar een echte managementproductvorm brengen

Planned user outcome:

- management krijgt een klantwaardige onboarding-output met eerste eigenaar, begrensde eerste actie en duidelijke handoff naar leiding, team of onboardingproces waar relevant

Scope in:

- onboarding managementcopy en productdefinitie
- onboarding dashboardpolish naar first-value niveau
- first owner / first action / review boundary
- onboarding naar first management use
- acceptancecriteria voor een eerste assisted klantwaardige release

Scope out:

- publieke productenpagina live zetten
- complexe multi-checkpoint automation
- cross-product entitlementlogica

Dependencies:

- `WAVE_02_ONBOARDING_CHECKPOINT_INTERPRETATION_AND_BOUNDARIES` groen

Primary code surfaces:

- onboarding dashboard layer
- onboarding productdefinition
- onboarding onboarding/lifecycle copy
- tests voor managementoutput

Exit gate:

- onboarding-output is klantwaardig als assisted productvorm
- eerste eigenaar en eerste actie zijn expliciet
- docs, tests en smoke zijn groen

Next allowed wave:

- `WAVE_04_ONBOARDING_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md`

#### WAVE_04_ONBOARDING_ROUTE_ACTIVATION_AND_RELEASE_HARDENING

Doel:

- onboarding alleen buyer-facing activeren wanneer de productgrens, lifecycleclaim en suitefit echt scherp genoeg zijn

Planned user outcome:

- buyers kunnen onboarding zien als een aparte lifecycle-route zonder verwarring met client onboarding, `RetentieScan`, `Pulse` of een brede employee-journey suite

Scope in:

- beperkte buyer-facing routeactivatie
- onboarding productpagina en marketingcopy
- pricing-, trust- en funnelalignment
- regressietests en buyer-facing smokevalidatie

Scope out:

- broad EX suite reframing
- self-serve checkout
- lifecycle platform claims

Dependencies:

- `WAVE_03_ONBOARDING_MANAGEMENT_OUTPUT_AND_HANDOFF` groen

Primary code surfaces:

- `frontend/lib/marketing-products.ts`
- `frontend/app/producten/[slug]/page.tsx`
- homepage, producten, tarieven, vertrouwen, sitemap en funnelsurfaces
- relevante marketingtests

Exit gate:

- onboarding buyer-facing alleen gecontroleerd en bounded geactiveerd
- claims, pricing en trust sluiten aan op de echte output
- tests en smokevalidatie zijn groen

Next allowed wave:

- later expliciet te beslissen op basis van suitestrategie

## Blocked Work

Expliciet geblokkeerd totdat onboardingwaves dat later openen:

- hire-date driven scheduling
- multi-checkpoint orchestration
- cohort analytics over meerdere campaigns
- buyer-facing onboarding voordat `WAVE_04` groen is
- elke volgende productlijn na onboarding

## Acceptance State

- [x] De onboardinglijn heeft nu een bestuurlijke wave-stack.
- [x] De eerstvolgende toegestane stap is expliciet begrensd.
- [x] Er is nog geen build geopend.
- [x] Er is nog geen buyer-facing of runtime-uitbreiding uitgevoerd.

## Open Risks

- onboarding kan alsnog te snel ontsporen naar lifecycle-platformdenken
- semantische overlap met client onboarding blijft een blijvend namingrisico
- het ontbreken van hire-date/checkpointmetadata kan later alsnog een te grote v1-beperking blijken
- buyer-facing onboarding kan te vroeg lijken alsof Verisight een volledige employee journey suite aanbiedt

## Testplan

### Product acceptance

- [x] onboarding opent niet breed maar via een gecontroleerde wave-stack
- [x] de wavevolgorde beschermt de productgrenzen van onboarding
- [x] buyer-facing activatie blijft bewust laat

### Codebase acceptance

- [x] het document sluit aan op de huidige registry- en runtimerealiteit
- [x] er wordt geen niet-bestaande onboardingimplementatie verondersteld
- [x] er wordt geen platformverbreding vooruit gepland zonder productreden

### Runtime acceptance

- [x] geen runtimewijzigingen in deze stap
- [x] geen marketingactivatie in deze stap
- [x] geen onboarding-wave geopend in deze stap

### QA acceptance

- [x] de eerste toegestane buildwave is eenduidig
- [x] blocked work is expliciet
- [x] de onboarding-track volgt dezelfde governance als `Pulse` en `TeamScan`

### Documentation acceptance

- [x] dit document functioneert als source of truth voor de onboarding wave-stack
- [x] dependencies en gates zijn expliciet
- [x] de vervolgstap is eenduidig vastgezet

## Assumptions/Defaults

- onboarding wordt de derde gecontroleerde nieuwe productlijn na `Pulse` en `TeamScan`
- onboarding v1 moet eerst een enkel checkpoint bewijzen
- automation, hire-date logica en buyer-facing activatie blijven later
- de suite blijft one-wave-at-a-time bestuurd

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE.md`

Er is nog geen build uitgevoerd; alleen de bestuurlijke buildstack is nu geopend.
