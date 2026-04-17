# Phase Next Step 3 - TeamScan Master Index and Wave-Stack Plan

## Title

Lock the TeamScan master index structure, active source-of-truth pointer, and the first controlled TeamScan build-wave stack before any TeamScan implementation starts.

## Korte Summary

Deze stap opent `TeamScan` nog niet als build. Het document doet voor `TeamScan` wat eerder ook voor `Pulse` nodig was: vastzetten hoe de productlijn bestuurlijk gevolgd gaat worden, welke volgorde van build waves is toegestaan, welke workstreams expliciet geblokkeerd blijven, en welk artifact vanaf hier de eerstvolgende write-enabled source of truth mag worden.

De vorige twee TeamScan-stappen hebben al scherp gemaakt dat:

- `TeamScan` de logische volgende productlijn is na `Pulse`
- `TeamScan` een lokalisatielaag is, niet een nieuwe brede diagnose
- `TeamScan` in v1 primair op `department` moet leunen
- `TeamScan` binnen de bestaande campaign-centered runtime moet passen
- `TeamScan` niet mag vervallen tot herlabelde `Segment Deep Dive`

De hoofdkeuze van deze stap is daarom:

- `TeamScan` krijgt een eigen master-indexvorm in `docs/strategy`
- `TeamScan` opent niet als brede productlijn, maar via vier begrensde waves
- de eerste toegestane wave is een smalle foundation slice binnen de bestaande campaign-centered runtime
- buyer-facing activatie, brede metadata-uitbreiding en suiteverbreding blijven expliciet laat of geblokkeerd

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen TeamScan-wave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

Na `PHASE_NEXT_STEP_1_TEAMSCAN_ENTRY_BOUNDARIES_PLAN.md` en `PHASE_NEXT_STEP_2_TEAMSCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md` is duidelijk wat `TeamScan` moet zijn en waar het technisch binnen moet passen. Wat nog ontbrak, is de bestuurlijke startconfiguratie voor daadwerkelijke uitvoering:

- welk TeamScan-artifact straks de actieve source of truth wordt
- welke TeamScan-waves precies zijn toegestaan
- welke volgorde verplicht is
- welke code-oppervlakken per wave logisch binnen scope liggen
- welke dingen bewust nog niet mee mogen in TeamScan-v1

Dat is extra belangrijk omdat `TeamScan` sneller dan `Pulse` kan ontsporen in overlap met:

- huidige segmentverdieping op `department` en `role_level`
- bestaande managementvragen in `RetentieScan`
- bestaande follow-on logica vanuit `Pulse`
- privacy- en suppressierisico's op kleine groepen

Deze stap voorkomt dat door nu al vast te zetten hoe `TeamScan` gecontroleerd open mag.

## Current Implementation Baseline

### 1. Productline and runtime reality

- [x] huidige registries kennen nog geen `scan_type = team`
- [x] huidige runtime blijft campaign-centered op `Organization -> Campaign -> Respondent -> SurveyResponse`
- [x] er bestaat nog geen TeamScan-productmodule, TeamScan-dashboardflow of TeamScan-reportpad

### 2. Team boundary reality

- [x] `department` is de primaire v1-boundary
- [x] `role_level` blijft alleen secundaire context
- [x] `team` normaliseert vandaag al naar `department`
- [x] `manager`, `location` en `team_id` bestaan nog niet als ondersteunde v1-boundaries

### 3. Privacy and localization reality

- [x] huidige minimadrempels `5 / 10 / 5` vormen de minimale startgrens
- [x] kleine groepen moeten worden onderdrukt
- [x] lokale ranking zonder veilige groepen is niet toegestaan
- [x] onvoldoende `department`-coverage vereist expliciete fallback

### 4. Governance reality

- [x] de repo werkt nu met one-wave-at-a-time governance
- [x] `Pulse` is afgerond als eerst geopende nieuwe productlijn
- [x] `TeamScan` mag pas nu als volgende gecontroleerde productlijn bestuurlijk worden voorbereid

## Decision

### 1. TeamScan Master Index Purpose

Voor `TeamScan` komt er een centrale bestuurlijke index die het hele vervolgtraject van deze productlijn bewaakt.

Doel van de TeamScan master index:

- actieve source-of-truth aanwijzen
- wavevolgorde bewaken
- completed versus blocked work zichtbaar houden
- afhankelijkheden en gates centraal tonen
- voorkomen dat TeamScan tegelijk uiteenvalt in survey, dashboard, copy en marketingwerk

Beslissing:

- `TeamScan` krijgt als tweede nieuwe productlijn een eigen master index
- deze index leeft in `docs/strategy`
- deze index is bestuurlijk en niet buyer-facing

### 2. TeamScan Master Index Structure

De toekomstige TeamScan master index moet minimaal de volgende velden bevatten:

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
4. Allowed TeamScan Wave Stack
5. Blocked Work
6. Acceptance State
7. Open Risks
8. Next Allowed Wave

Beslissing:

- er komt precies een master index voor `TeamScan`
- nieuwe TeamScan-wave documenten moeten vanuit die index vindbaar zijn

### 3. Initial TeamScan Master Index State

De index moet starten met deze bestuurlijke status:

- `productline: TeamScan`
- `status: planned_not_open`
- `current_source_of_truth: dit document totdat WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE.md expliciet wordt geopend`
- `current_active_wave: none`
- `last_completed_step: PHASE_NEXT_STEP_3_TEAMSCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md`
- `last_completed_wave: none`
- `next_allowed_wave: WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE.md`

Geblokkeerde waves bij start:

- elke toekomstige `Onboarding 30-60-90`-wave
- elke extra TeamScan-wave voordat `WAVE_01` groen is
- elke buyer-facing TeamScan-activatie voordat `WAVE_04` expliciet opent

Beslissing:

- de master index opent nog geen build
- hij wijst alleen de eerstvolgende toegestane TeamScan-wave aan

### 4. TeamScan Build-Stack Principles

De eerste TeamScan-stack moet voldoen aan de volgende principes:

- campaign-centered blijven
- eerst lokalisatie binnen bestaande metadata en suppressielogica bewijzen
- geen nieuwe team-, manager- of location-domeinen vooruit bouwen
- eerst een end-to-end TeamScan vertical slice bouwen
- managementoutput pas uitbreiden na bewezen veilige local output
- buyer-facing activatie pas doen nadat TeamScan echt onderscheidend en verantwoord is

Beslissing:

- `TeamScan` wordt in kleine, managementbruikbare slices opgebouwd
- elke wave moet echte lokalisatiewaarde leveren en niet alleen technische voorbereiding

### 5. Allowed TeamScan Wave Stack

#### WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE

Doel:

- `TeamScan` als nieuwe productline technisch en productmatig laten landen binnen de huidige campaign-centered runtime
- een eerste end-to-end TeamScan-cyclus mogelijk maken van campaign setup tot survey submit tot minimale lokale dashboardread

Planned user outcome:

- Verisight kan een eerste TeamScan-campaign draaien die op veilige manier lokale context op `department`-niveau laat zien, met duidelijke fallback wanneer metadata of groepsgrootte onvoldoende is

Scope in:

- `scan_type` uitbreiding naar `team` in registries en gedeelde types
- productspecifieke TeamScan module in backend en frontend
- minimale TeamScan surveydefinitie en submit-validatie
- TeamScan scoring- en interpretation contract
- coverage- en suppressiechecks voor lokale output
- eerste TeamScan dashboardread met `org_level_summary`, `local_group_candidates` en onderdrukte-groepen boundary
- docs, tests en smokeflow voor end-to-end TeamScan run

Scope out:

- lokale prioriteitsranking over meerdere meetmomenten
- manager- of location-boundaries
- brede handoff- of actiecopypolish
- buyer-facing productroute of pricingactivatie
- TeamScan PDF-report

Dependencies:

- `PHASE_NEXT_STEP_1_TEAMSCAN_ENTRY_BOUNDARIES_PLAN.md`
- `PHASE_NEXT_STEP_2_TEAMSCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md`
- dit document

Primary code surfaces:

- `backend/products/shared/registry.py`
- `frontend/lib/products/shared/registry.ts`
- `frontend/lib/types.ts`
- nieuwe `backend/products/team/*`
- nieuwe `frontend/lib/products/team/*`
- relevante surveytemplates
- campaign creation en campaign dashboard surfaces

Exit gate:

- een TeamScan-campaign kan worden aangemaakt
- een respondent kan een TeamScan-survey invullen
- TeamScan-output toont een minimale, coherente en veilige lokale read
- onvoldoende metadata of te kleine groepen geven expliciete fallback in plaats van unsafe output
- docs, tests en smoke-validatie zijn groen

Next allowed wave:

- `WAVE_02_TEAMSCAN_LOCALIZATION_AND_PRIORITY_LOGIC.md`

#### WAVE_02_TEAMSCAN_LOCALIZATION_AND_PRIORITY_LOGIC

Doel:

- `TeamScan` echte lokalisatiewaarde geven door prioriterings- en interpretatielogica boven op de foundation slice te zetten

Planned user outcome:

- management ziet niet alleen lokale groepen, maar ook welke context als eerste verdieping of actie logisch is zonder causaliteit te overclaimen

Scope in:

- local priority rows
- veilige ordering van lokale contexten
- interpretatiecopy voor `waar eerst kijken`
- suppression-aware rankinglogica
- tests en smoke voor voldoende metadata, onvoldoende metadata en kleine groepen

Scope out:

- manager ranking
- location support
- cross-campaign trend- of delta-engine
- buyer-facing activatie

Dependencies:

- `WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE` groen

Primary code surfaces:

- TeamScan dashboard view model
- aggregate and localization helpers
- privacy and prioritization helpers
- tests voor local priority logic

Exit gate:

- TeamScan kan veilige lokale prioriteit tonen
- lokale output blijft terughoudend bij kleine of onvolledige groepen
- managementcopy maakt duidelijk dat dit lokalisatie en geen hard causaliteitsbewijs is
- tests, docs en smoke zijn groen

Next allowed wave:

- `WAVE_03_TEAMSCAN_MANAGEMENT_OUTPUT_AND_ACTION_HANDOFF.md`

#### WAVE_03_TEAMSCAN_MANAGEMENT_OUTPUT_AND_ACTION_HANDOFF

Doel:

- TeamScan van technische lokalisatieflow naar echte managementproductvorm brengen

Planned user outcome:

- management krijgt een klantwaardige TeamScan-output met lokale context, eerste eigenaar, eerste vraag en eerste actie- of verificatiehints

Scope in:

- TeamScan managementcopy en productdefinitie
- dashboardpolish naar first-value niveau
- eerste owner and action handoff
- expliciete boundary-copy rond privacy, suppressie en interpretatie
- eventueel compacte managementoutput, alleen als direct nodig voor productwaarde

Scope out:

- buyer-facing productroute live zetten
- manager- of location-verbreding
- cross-product entitlementverbreding

Dependencies:

- `WAVE_02_TEAMSCAN_LOCALIZATION_AND_PRIORITY_LOGIC` groen

Primary code surfaces:

- TeamScan dashboard adapter
- TeamScan definition and methodology copy surfaces
- eventueel report generation surfaces indien direct nodig
- docs, tests en smoke voor managementgebruik

Exit gate:

- TeamScan heeft een duidelijke first management use flow
- lokale prioriteit, eigenaar en eerste actie zijn managementwaardig maar terughoudend
- product, code, docs, tests en smoke zijn groen op klantwaardige basis

Next allowed wave:

- `WAVE_04_TEAMSCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md`

#### WAVE_04_TEAMSCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING

Doel:

- TeamScan pas na bewezen productwaarde gecontroleerd activeren in routekeuze, packaging en showcase

Planned user outcome:

- TeamScan kan gecontroleerd zichtbaar worden als echte vervolglijn zonder overlap of verwarring met `RetentieScan`, `Pulse` of bestaande segmentverdieping

Scope in:

- marketing productstatus van reserved naar gecontroleerde routeactivatie, alleen indien gerechtvaardigd
- routekeuze- en packagingcopy
- sales/showcase alignment
- regressietests op productpositionering en suitegrenzen
- release hardening en acceptance-eindcontrole

Scope out:

- nieuwe manager- of location-varianten openen
- brede suite-activatie voor meerdere nieuwe lijnen
- Onboarding 30-60-90 openen

Dependencies:

- `WAVE_03_TEAMSCAN_MANAGEMENT_OUTPUT_AND_ACTION_HANDOFF` groen

Primary code surfaces:

- `frontend/lib/marketing-products.ts`
- `frontend/components/marketing/site-content.ts`
- positioning tests
- eventuele TeamScan product page surfaces

Exit gate:

- TeamScan is commercieel en productmatig coherent geactiveerd
- bestaande live routes blijven scherp
- regressies op suite-positionering zijn groen

Next allowed wave:

- later expliciet te beslissen op basis van TeamScan-releasekwaliteit en suiteprioriteit

### 6. Blocked Work During TeamScan Stack

Het volgende werk blijft expliciet geblokkeerd terwijl de eerste TeamScan-stack loopt:

- elke `Onboarding 30-60-90`-wave
- manager- of location-first TeamScan-varianten
- nieuwe team-, manager- of location-tabellen zonder directe wave-noodzaak
- generieke localizer engines of cross-product ranking services
- brede entitlement-, billing- of governance-uitbreiding voor latere productlijnen
- buyer-facing suiteverbreding buiten expliciete `WAVE_04`

Beslissing:

- geen scopelek vanuit `TeamScan` naar latere productlijnen of bredere platformbouw

### 7. TeamScan Master Index Update Rules

De toekomstige TeamScan master index moet na elke stap of wave minimaal deze updates krijgen:

- `current_source_of_truth` aanpassen
- `current_active_wave` aanpassen
- `last_completed_wave` aanpassen
- acceptance summary updaten
- blocked versus allowed waves herbevestigen

Update rule:

- alleen na expliciete afronding van een stap of wave
- niet tijdens half-afgemaakte uitvoering

Beslissing:

- de TeamScan master index wordt een bestuurlijke state tracker en geen werkklad

### 8. TeamScan Stack Acceptance Rules

Voor elke TeamScan-wave gelden dezelfde vijf acceptance-lagen:

- Product acceptance
- Codebase acceptance
- Runtime acceptance
- QA acceptance
- Documentation acceptance

Extra TeamScan-specifieke gates:

- `TeamScan` mag niet inhoudelijk samenvallen met `Segment Deep Dive`
- lokale prioriteit mag niet als manager ranking of individueel oordeel worden verkocht
- TeamScan-v1 mag geen boundary claimen buiten `department` plus optionele `role_level` context
- elke wave moet huidige live ExitScan, RetentieScan en Pulse-ervaring intact laten

### 9. Current Active Source-of-Truth Pointer

Totdat een TeamScan-wave expliciet wordt geopend, geldt:

- active productline preparation artifact: dit document
- active build wave: none
- next allowed artifact: `WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE.md`

Beslissing:

- er komt pas een echte write-enabled buildartifact zodra `WAVE_01` wordt aangemaakt

## Key Changes

- `TeamScan` heeft nu een bestuurlijke master-indexvorm
- de eerste toegestane TeamScan-wave stack is expliciet vastgezet
- de wavevolgorde voor `TeamScan` is nu gekoppeld aan echte lokalisatie- en managementuitkomsten
- buyer-facing activatie blijft laat en conditioneel
- privacy, suppressie en metadata-realiteit sturen de volgorde expliciet mee

## Belangrijke Interfaces/Contracts

### TeamScan Master Index Contract

- `productline`
- `status`
- `current_source_of_truth`
- `current_active_wave`
- `last_completed_step`
- `last_completed_wave`
- `next_allowed_wave`
- `blocked_waves`
- `acceptance_summary`
- `open_risks`

Beslissing:

- dit contract wordt verplicht voor het toekomstige TeamScan-indexbestand

### TeamScan Wave Stack Contract

- `wave_id`
- `objective`
- `planned_user_outcome`
- `scope_in`
- `scope_out`
- `dependencies`
- `primary_code_surfaces`
- `exit_gate`
- `next_allowed_wave`

Beslissing:

- elke TeamScan-wave moet precies dit contract volgen

### TeamScan Readiness Contract

- `foundation_ready`
- `localization_ready`
- `management_output_ready`
- `route_activation_ready`

Beslissing:

- `TeamScan` wordt pas als productlijn voldoende volwassen gezien wanneer deze readiness-trap stapsgewijs groen is

### Blocked Work Contract

- `blocked_productlines`
- `blocked_boundary_expansions`
- `blocked_platform_expansions`
- `blocked_go_to_market_expansions`

Beslissing:

- blocked work wordt expliciet benoemd en niet impliciet verondersteld

## Work Breakdown

### Step 3A - Lock the TeamScan master-index shape

- [x] Definieer doel en velden van de toekomstige TeamScan master index
- [x] Leg de initiele bestuurlijke status vast
- [x] Benoem de actieve source-of-truth pointer

Definition of Done:

- [x] Er is een decision-complete master-indexvorm voor TeamScan

### Step 3B - Lock the TeamScan wave stack

- [x] Leg de toegestane TeamScan-wavevolgorde vast
- [x] Geef per wave doel, uitkomst, scope en exit gate
- [x] Beperk buyer-facing activatie tot de laatste wave

Definition of Done:

- [x] De TeamScan-v1 stack is logisch, begrensd en uitvoerbaar

### Step 3C - Lock blocked work and update rules

- [x] Benoem expliciet welke workstreams niet open mogen
- [x] Leg update rules vast voor de toekomstige master index
- [x] Koppel TeamScan-specifieke acceptance-gates aan de stack

Definition of Done:

- [x] Scopelek en parallelle verbreding zijn bestuurlijk geblokkeerd

### Step 3D - Lock the follow-on build entry

- [x] Wijs exact een eerstvolgende toegestane TeamScan-wave aan
- [x] Bevestig dat deze stap nog geen build opent
- [x] Sluit af met een heldere gate naar `WAVE_01`

Definition of Done:

- [x] De volgende actieve TeamScan source of truth is eenduidig aangewezen

## Testplan

### Governance Alignment Review

- [x] Gecontroleerd dat deze stack aansluit op de one-wave-at-a-time governance
- [x] Gecontroleerd dat `TeamScan` pas na `Pulse` wordt voorbereid
- [x] Gecontroleerd dat buyer-facing activatie laat en conditioneel blijft

### Product Boundary Test

- [x] `TeamScan` blijft lokalisatielaag
- [x] `RetentieScan` blijft bredere signalering
- [x] `Pulse` blijft monitoringlaag
- [x] `Segment Deep Dive` blijft add-on en geen eigen productlijn

### Metadata and Privacy Test

- [x] `department` blijft primaire TeamScan-v1 boundary
- [x] `role_level` blijft alleen context
- [x] kleine groepen blijven onder suppressie vallen
- [x] onvoldoende metadata blijft expliciete fallback vereisen

### Wave Sequencing Test

- [x] `WAVE_01` opent eerst foundation en veilige local read
- [x] `WAVE_02` opent pas na groen op `WAVE_01`
- [x] `WAVE_03` opent pas na bewezen lokale prioritering
- [x] `WAVE_04` opent pas na klantwaardige managementoutput

### Scope Leakage Test

- [x] manager- en location-first varianten blijven geblokkeerd
- [x] brede platformuitbreiding blijft geblokkeerd
- [x] buyer-facing activatie buiten `WAVE_04` blijft geblokkeerd

### Smoke-validatie

#### Scenario 1

Iemand wil meteen manager-level TeamScan openen.

- Resultaat: geblokkeerd
- Waarom: v1-boundary blijft `department`, managercontext is niet geopend

#### Scenario 2

Iemand wil TeamScan publiek op de website zetten voordat er een klantwaardige managementoutput is.

- Resultaat: geblokkeerd
- Waarom: routeactivatie hoort pas bij `WAVE_04`

#### Scenario 3

Iemand wil TeamScan bouwen door alleen bestaande segmentkaarten te hernoemen.

- Resultaat: afgekeurd
- Waarom: TeamScan vereist eigen scanflow, eigen output en eigen handofflogica

#### Scenario 4

`WAVE_01` is volledig groen inclusief veilige fallback bij onvoldoende metadata.

- Resultaat: `WAVE_02` mag openen
- Waarom: foundation en safety gate zijn gehaald

#### Scenario 5

Iemand wil tijdens open TeamScan-stack alvast Onboarding 30-60-90 marketingcopy voorbereiden.

- Resultaat: geblokkeerd
- Waarom: one-wave-at-a-time en blocked work contract

## Assumptions/Defaults

- `TeamScan` is de logische volgende productlijn na `Pulse`
- `TeamScan` opent eerst als smalle, veilige lokalisatielijn
- `department` blijft de primaire TeamScan-v1 boundary
- `role_level` blijft alleen secundaire context
- buyer-facing TeamScan blijft dicht tot na bewezen productwaarde
- de eerstvolgende toegestane buildartifact is `WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE.md`

## Product Acceptance

- [x] De TeamScan-stack volgt de eerder vastgezette productvolgorde
- [x] Elke TeamScan-wave heeft een duidelijke lokalisatie- of managementuitkomst
- [x] TeamScan blijft onderscheidbaar van `RetentieScan`, `Pulse` en `Segment Deep Dive`
- [x] Routeactivatie gebeurt pas als het product er inhoudelijk klaar voor is

## Codebase Acceptance

- [x] De stack landt op bestaande registries, types, campaign flows en productspecifieke modules
- [x] De stack vereist geen premature nieuwe team- of managerdomeinen
- [x] Elke wave heeft begrensde primaire code surfaces
- [x] Latere productlijnen blijven buiten scope

## Runtime Acceptance

- [x] Er zijn nog geen runtimewijzigingen doorgevoerd
- [x] De stack respecteert de huidige live runtime van ExitScan, RetentieScan en Pulse
- [x] Elke toekomstige TeamScan-wave blijft binnen de bestaande campaign-centered runtime totdat het tegendeel bewezen nodig is

## QA Acceptance

- [x] Wavevolgorde en blockingregels zijn expliciet en toetsbaar
- [x] TeamScan-boundaries zijn duidelijk genoeg om regressie en scope creep tegen te houden
- [x] Privacy- en suppressiegates zijn per wave herhaalbaar

## Documentation Acceptance

- [x] Dit document kan dienen als source of truth voor de voorbereiding van de eerste TeamScan-wave stack
- [x] Het document definieert de master-indexstructuur en de toegestane waves
- [x] Het document eindigt met een duidelijke eerstvolgende toegestane buildartifact

## Not In This Step

- Geen TeamScan-wave uitvoeren
- Geen TeamScan master index bestand aanmaken
- Geen WAVE-document aanmaken
- Geen code wijzigen
- Geen marketing- of pricingactivatie uitvoeren

## Exit Gate

Deze stap is afgerond omdat:

- [x] de TeamScan master indexstructuur is vastgezet
- [x] de initiele TeamScan master indexstatus is vastgezet
- [x] de eerste toegestane TeamScan-wave stack is vastgezet
- [x] blocked work expliciet is benoemd
- [x] de eerstvolgende toegestane buildartifact expliciet is benoemd

## Next Step After Approval

Na goedkeuring van deze stap volgt:

- `WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE.md`

Dat wordt het eerste echte TeamScan-buildartifact en daarmee de eerste actieve source of truth voor TeamScan-productbouw.
