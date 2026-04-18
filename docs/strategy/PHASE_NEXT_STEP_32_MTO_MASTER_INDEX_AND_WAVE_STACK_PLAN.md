# Phase Next Step 32 - MTO Master Index and Wave-Stack Plan

## Title

Lock the MTO master index structure, active source-of-truth pointer, and the first controlled MTO build-wave stack before any MTO implementation starts.

## Korte Summary

Deze stap opent `MTO` nog niet als build. Het document doet voor MTO wat eerder ook voor `Pulse`, `TeamScan` en `Leadership Scan` nodig was: vastzetten hoe de productlijn bestuurlijk gevolgd gaat worden, welke volgorde van build waves is toegestaan, welke workstreams expliciet geblokkeerd blijven, en welk artifact vanaf hier de eerstvolgende write-enabled source of truth mag worden.

De vorige twee MTO-stappen hebben al scherp gemaakt dat:

- `MTO` een nieuwe, zwaardere productlijn is
- `MTO` een organisatiebrede hoofdmeting is en op termijn het hoofdmodel van Verisight moet kunnen worden
- `MTO` eerst intern / assisted en geisoleerd moet blijven
- MTO in v1 binnen de bestaande campaign-centered runtime moet passen
- action logging later waarschijnlijk expliciet nodig is, maar bounded en productspecifiek moet blijven

De hoofdkeuze van deze stap is daarom:

- `MTO` krijgt een eigen master-indexvorm in `docs/strategy`
- `MTO` opent niet als brede suite-refactor, maar via vijf begrensde waves
- de eerste toegestane wave is een smalle foundation slice binnen de bestaande campaign-centered runtime
- public activation, live suite replacement en brede platformverbreding blijven expliciet laat of geblokkeerd

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen MTO-wave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

Na `PHASE_NEXT_STEP_30_MTO_ENTRY_AND_BOUNDARIES_PLAN.md` en `PHASE_NEXT_STEP_31_MTO_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md` is duidelijk wat MTO moet zijn en waar het technisch binnen moet passen. Wat nog ontbrak, is de bestuurlijke startconfiguratie voor daadwerkelijke uitvoering:

- welk MTO-artifact straks de actieve source of truth wordt
- welke MTO-waves precies zijn toegestaan
- welke volgorde verplicht is
- welke code-oppervlakken per wave logisch binnen scope liggen
- welke dingen bewust nog niet mee mogen in MTO-v1

Dat is extra belangrijk omdat MTO sneller dan eerdere lijnen kan ontsporen in:

- te vroege vervanging van bestaande live scans
- te brede survey- of workflowverbreding
- te vroege publieke activatie
- te veel gelijktijdige verbouwingen aan dashboard, rapport, delivery en opvolging

Deze stap voorkomt dat door nu al vast te zetten hoe MTO gecontroleerd open mag.

## Current Implementation Baseline

### 1. Productline and runtime reality

- [x] huidige registries kennen nog geen `scan_type = mto`
- [x] huidige runtime blijft campaign-centered op `Organization -> Campaign -> Respondent -> SurveyResponse`
- [x] er bestaat nog geen MTO-productmodule, MTO-dashboardflow of MTO-reportpad

### 2. MTO operating reality

- [x] bestaande dashboard-, report-to-action-, delivery- en learning-lagen zijn bruikbaar precedent
- [x] er bestaat nog geen expliciete productspecifieke MTO action-loglaag
- [x] de huidige suite mag niet geraakt worden door deze track

### 3. Governance reality

- [x] de repo werkt nu met one-wave-at-a-time governance
- [x] eerdere productlijnen zijn via aparte step- en wave-docs geopend
- [x] MTO moet nu dezelfde governance volgen, maar in eigen worktree en branch

## Decision

### 1. MTO Master Index Purpose

Voor `MTO` komt er een centrale bestuurlijke index die het hele vervolgtraject van deze productlijn bewaakt.

Doel van de MTO master index:

- actieve source-of-truth aanwijzen
- wavevolgorde bewaken
- completed versus blocked work zichtbaar houden
- afhankelijkheden en gates centraal tonen
- voorkomen dat MTO tegelijk uiteenvalt in survey, dashboard, rapport, actielogging en suite-integratie

Beslissing:

- `MTO` krijgt een eigen master index
- deze index leeft in `docs/strategy`
- deze index is bestuurlijk en niet buyer-facing

### 2. MTO Master Index Structure

De toekomstige MTO master index moet minimaal de volgende velden bevatten:

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
4. Allowed MTO Wave Stack
5. Blocked Work
6. Acceptance State
7. Open Risks
8. Next Allowed Wave

Beslissing:

- er komt precies een master index voor `MTO`
- nieuwe MTO-wave documenten moeten vanuit die index vindbaar zijn

### 3. Initial MTO Master Index State

De index moet starten met deze bestuurlijke status:

- `productline: MTO`
- `status: planned_not_open`
- `current_source_of_truth: dit document totdat WAVE_01_MTO_FOUNDATION_VERTICAL_SLICE.md expliciet wordt geopend`
- `current_active_wave: none`
- `last_completed_step: PHASE_NEXT_STEP_32_MTO_MASTER_INDEX_AND_WAVE_STACK_PLAN.md`
- `last_completed_wave: none`
- `next_allowed_wave: WAVE_01_MTO_FOUNDATION_VERTICAL_SLICE.md`

Geblokkeerde waves bij start:

- elke volgende MTO-wave voordat `WAVE_01` groen is
- elke buyer-facing MTO-activatie voordat `WAVE_05` expliciet groen is
- elke live suite replacement of brede positioneringsshift voordat de integratiegate expliciet opent

Beslissing:

- de master index opent nog geen build
- hij wijst alleen de eerstvolgende toegestane MTO-wave aan

### 4. MTO Build-Stack Principles

De eerste MTO-stack moet voldoen aan de volgende principes:

- campaign-centered blijven
- eerst een end-to-end MTO vertical slice bouwen zonder brede suite-refactor
- eerst bewijzen dat MTO een eigen brede hoofdread kan dragen
- dashboarddiepte, rapportage en action logging gefaseerd openen
- delivery- en operator-hardening pas openen nadat productoutput echt staat
- suite-integratie pas doen nadat MTO intern productmatig en operationeel groen is

Beslissing:

- `MTO` wordt in kleine, samenhangende maar begrensde productwaves opgebouwd
- elke wave moet echte management- of operatorwaarde leveren en niet alleen technische voorbereiding

### 5. Allowed MTO Wave Stack

#### WAVE_01_MTO_FOUNDATION_VERTICAL_SLICE

Doel:

- `MTO` als nieuwe productline technisch en productmatig laten landen binnen de huidige campaign-centered runtime
- een eerste end-to-end MTO-cyclus mogelijk maken van campaign setup tot survey submit tot minimale dashboardread

Planned user outcome:

- Verisight kan een eerste interne MTO-campaign draaien en een eerste brede managementsnapshot tonen binnen dezelfde assisted productvorm

Scope in:

- `scan_type` uitbreiding naar `mto` in registries en gedeelde types
- productspecifieke MTO module in backend en frontend
- eerste MTO surveydefinitie en submit-validatie
- MTO scoring- en interpretation contract
- minimale MTO dashboardread voor organisatiebreed beeld
- docs, tests en smokeflow voor end-to-end MTO run

Scope out:

- rijke dashboarddiepte
- formele MTO-rapportage
- expliciete action logging
- buyer-facing activatie
- vervanging van bestaande scans
- parallelle `Customer Feedback` / `NPS` opening of gecombineerde cross-domain read

Dependencies:

- `PHASE_NEXT_STEP_30_MTO_ENTRY_AND_BOUNDARIES_PLAN.md`
- `PHASE_NEXT_STEP_31_MTO_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md`
- dit document

Primary code surfaces:

- `backend/products/shared/registry.py`
- `frontend/lib/products/shared/registry.ts`
- `frontend/lib/types.ts`
- nieuwe `backend/products/mto/*`
- nieuwe `frontend/lib/products/mto/*`
- relevante surveytemplates
- campaign creation en campaign dashboard surfaces

Exit gate:

- een MTO-campaign kan worden aangemaakt
- een respondent kan een MTO-survey invullen
- MTO-output toont een minimale, coherente brede managementread
- docs, tests en smoke-validatie zijn groen

Next allowed wave:

- `WAVE_02_MTO_MANAGEMENT_READ_AND_DASHBOARD_DEPTH.md`

#### WAVE_02_MTO_MANAGEMENT_READ_AND_DASHBOARD_DEPTH

Doel:

- MTO echte productwaarde geven door de brede managementread inhoudelijk rijker en dashboardmatig dieper te maken

Planned user outcome:

- management ziet niet alleen een eerste snapshot, maar ook duidelijke themaprioriteiten, managementvragen en een rustiger, rijker dashboardbeeld

Scope in:

- diepere MTO dashboardlaag
- rijkere themaprioritering
- managementvragen en interpretatiecopy
- expliciete leesgrenzen en bounded segmentverrijking

Scope out:

- formele rapportgeneratie
- action logging
- buyer-facing activatie
- brede suite-refactor

Dependencies:

- `WAVE_01_MTO_FOUNDATION_VERTICAL_SLICE` groen

Primary code surfaces:

- MTO dashboard view model
- aggregate and interpretation helpers
- campaign page helpers
- tests voor dashboarddiepte en leesgrenzen

Exit gate:

- MTO toont een rijkere, managementwaardige dashboardread
- interpretatie blijft bounded en methodisch eerlijk
- tests, docs en smoke zijn groen

Next allowed wave:

- `WAVE_03_MTO_REPORT_TO_ACTION_AND_ACTION_LOGGING.md`

#### WAVE_03_MTO_REPORT_TO_ACTION_AND_ACTION_LOGGING

Doel:

- MTO van dashboardwaardige brede read naar expliciete managementroute met formele output en actievolging brengen

Planned user outcome:

- management krijgt een formele MTO-output met duidelijke prioriteiten, eerste eigenaar, eerste actie, reviewmoment en een bounded action-loglaag

Scope in:

- formele MTO report/outputlaag
- report-to-action contract specifiek voor MTO
- bounded MTO action-loglaag
- eerste status- en reviewtracking op campaignniveau

Scope out:

- generieke workflow engine
- buyer-facing activatie
- brede suite replacement

Dependencies:

- `WAVE_02_MTO_MANAGEMENT_READ_AND_DASHBOARD_DEPTH` groen

Primary code surfaces:

- `backend/report.py` en/of nieuwe MTO report content surfaces
- MTO dashboard / actionability surfaces
- bounded MTO action log surfaces
- tests voor output, action contract en action status

Exit gate:

- MTO heeft formele output en expliciete actieroute
- action logging is productspecifiek, bounded en werkbaar
- docs, tests en smoke zijn groen

Next allowed wave:

- `WAVE_04_MTO_DELIVERY_AND_INTERNAL_OPERATOR_HARDENING.md`

#### WAVE_04_MTO_DELIVERY_AND_INTERNAL_OPERATOR_HARDENING

Doel:

- MTO van productoutput naar intern bedienbare delivery- en operatorflow brengen

Planned user outcome:

- operators kunnen een MTO-campaign consistent begeleiden van setup naar output, first value, management use en follow-through

Scope in:

- delivery/checkpoint alignment voor MTO
- operator visibility
- interne handoff en first value discipline
- learning/follow-up aansluiting op de MTO action route

Scope out:

- publieke activatie
- suitebrede vervanging van bestaande routes
- generieke supportplatformuitbreiding

Dependencies:

- `WAVE_03_MTO_REPORT_TO_ACTION_AND_ACTION_LOGGING` groen

Primary code surfaces:

- `frontend/lib/ops-delivery.ts`
- `frontend/components/dashboard/preflight-checklist.tsx`
- `frontend/components/dashboard/pilot-learning-workbench.tsx`
- MTO-specific operator and follow-up surfaces

Exit gate:

- MTO is intern productmatig en operationeel consistent
- operatorflow, output en follow-through sluiten op elkaar aan
- docs, tests en smoke zijn groen

Next allowed wave:

- `WAVE_05_MTO_INTERNAL_CLOSEOUT_AND_SUITE_INTEGRATION_GATE.md`

#### WAVE_05_MTO_INTERNAL_CLOSEOUT_AND_SUITE_INTEGRATION_GATE

Doel:

- deze eerste MTO-track formeel intern sluiten en de gate openen voor latere suitekoppeling of public activation-besluitvorming

Planned user outcome:

- Verisight heeft een intern groene MTO-productlijn met expliciete beslissing of en hoe MTO later live aan de bredere suite wordt gekoppeld

Scope in:

- formele closeout
- docs, code, tests en validatie volledig groen
- expliciete integratiegate voor latere suitekoppeling
- bevestigen wat MTO nu wel en niet mag overschrijven in de live suite

Scope out:

- directe live replacement van bestaande scans
- publieke activatie in dezelfde wave
- brede portfolioherpositionering zonder vervolgbesluit

Dependencies:

- `WAVE_04_MTO_DELIVERY_AND_INTERNAL_OPERATOR_HARDENING` groen

Primary code surfaces:

- strategische en actieve source-of-truth docs
- eventuele integration-gate pointers
- regressietests en closeout checks

Exit gate:

- MTO-track is intern groen en bestuurlijk gesloten
- eerstvolgende stap richting suitekoppeling of publieke activatie is expliciet begrensd
- product, code, docs, tests en smoke zijn groen

Next allowed wave:

- later expliciet te beslissen op basis van de integratiegate

### 6. Blocked Work During MTO Stack

Het volgende werk blijft expliciet geblokkeerd terwijl de eerste MTO-stack loopt:

- publieke MTO-hoofdroute openen
- bestaande live scans direct vervangen
- brede suite-refactor rondom MTO
- generieke survey builder
- generieke workflow / ticketing / task engine
- brede entitlement-, billing- of identityverbreding voor MTO
- parallelle `Customer Feedback` / `NPS` productopening of gedeelde dual-domain capabilitylaag

Beslissing:

- geen scopelek vanuit `MTO` naar latere platformverbouwing of live suite-shift

### 7. MTO Master Index Update Rules

De toekomstige MTO master index moet na elke stap of wave minimaal deze updates krijgen:

- `current_source_of_truth` aanpassen
- `current_active_wave` aanpassen
- `last_completed_wave` aanpassen
- acceptance summary updaten
- blocked versus allowed waves herbevestigen

Update rule:

- alleen na expliciete afronding van een stap of wave
- niet tijdens half-afgemaakte uitvoering

Beslissing:

- de MTO master index wordt een bestuurlijke state tracker en geen werkklad

### 8. MTO Stack Acceptance Rules

Voor elke MTO-wave gelden dezelfde vijf acceptance-lagen:

- Product acceptance
- Codebase acceptance
- Runtime acceptance
- QA acceptance
- Documentation acceptance

Extra MTO-specifieke gates:

- `MTO` mag niet inhoudelijk terugvallen naar een te lichte bounded scan
- `MTO` mag niet als generieke workflow- of platformverbouwing worden aangegrepen
- publieke activatie blijft geblokkeerd tot na interne closeout
- bestaande live ExitScan / RetentieScan / overige suiteflows moeten tijdens de track intact blijven

### 9. Current Active Source-of-Truth Pointer

Totdat een MTO-wave expliciet wordt geopend, geldt:

- active productline preparation artifact: dit document
- active build wave: none
- next allowed artifact: `WAVE_01_MTO_FOUNDATION_VERTICAL_SLICE.md`

Beslissing:

- er komt pas een echte write-enabled buildartifact zodra `WAVE_01` wordt aangemaakt

## Key Changes

- `MTO` heeft nu een bestuurlijke master-indexvorm
- de eerste toegestane MTO-wave stack is expliciet vastgezet
- de wavevolgorde voor `MTO` is nu gekoppeld aan echte product-, actie- en operatoruitkomsten
- publieke activatie en suite replacement blijven laat en conditioneel
- action logging is expliciet opgenomen, maar niet te vroeg geopend

## Belangrijke Interfaces/Contracts

### MTO Master Index Contract

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

- dit contract wordt verplicht voor het toekomstige MTO-indexbestand

### MTO Wave Stack Contract

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

- elke MTO-wave moet precies dit contract volgen

### MTO Readiness Contract

- `foundation_ready`
- `dashboard_depth_ready`
- `report_and_action_ready`
- `operator_ready`
- `integration_gate_ready`

Beslissing:

- `MTO` wordt pas als eerste track voldoende volwassen gezien wanneer deze readiness-trap stapsgewijs groen is

### Blocked Work Contract

- `blocked_public_activation`
- `blocked_live_suite_replacement`
- `blocked_platform_expansions`
- `blocked_go_to_market_expansions`

Beslissing:

- blocked work wordt expliciet benoemd en niet impliciet verondersteld

## Testplan

### Governance alignment review

- [x] gecontroleerd dat deze stack aansluit op de one-wave-at-a-time governance
- [x] gecontroleerd dat MTO eerst intern en geisoleerd blijft
- [x] gecontroleerd dat publieke activatie en suite replacement laat en conditioneel blijven

### Product boundary test

- [x] `MTO` blijft nieuwe hoofdmeting
- [x] `Pulse` blijft reviewlaag
- [x] `TeamScan` blijft lokalisatielaag
- [x] `Leadership Scan` blijft bounded managementcontextroute
- [x] bestaande live routes blijven voorlopig operationeel leidend

### Wave sequencing test

- [x] `WAVE_01` opent eerst foundation en minimale MTO-read
- [x] `WAVE_02` opent pas na groen op `WAVE_01`
- [x] `WAVE_03` opent pas na bewezen dashboarddiepte
- [x] `WAVE_04` opent pas na formele output en action logging
- [x] `WAVE_05` opent pas na operator hardening

### Scope leakage test

- [x] publieke activatie blijft geblokkeerd
- [x] live suite replacement blijft geblokkeerd
- [x] generieke survey- en workflowinfra blijven geblokkeerd

### Smoke-validatie

#### Scenario 1

Iemand wil MTO meteen op de website als nieuwe hoofdroute zetten.

- Resultaat: geblokkeerd
- Waarom: publieke activatie hoort niet in deze eerste interne stack

#### Scenario 2

Iemand wil in wave 1 al een generieke action workflow engine bouwen.

- Resultaat: afgekeurd
- Waarom: action logging opent pas later en blijft productspecifiek bounded

#### Scenario 3

Iemand wil bestaande live scans direct vervangen zodra wave 2 dashboarddiepte heeft.

- Resultaat: geblokkeerd
- Waarom: suite replacement hoort pas na formele integratiegate en is niet in deze stack geopend

#### Scenario 4

`WAVE_03` is volledig groen met formele output en bounded action logging.

- Resultaat: `WAVE_04` mag openen
- Waarom: productoutput en actieroute zijn dan bewezen

## Assumptions/Defaults

- MTO is de nieuwe toekomstige hoofdmeting van Verisight
- MTO opent eerst als interne, geisoleerde productlijn
- MTO foundation, dashboarddiepte, report/action, operator hardening en integratiegate worden bewust gescheiden
- publieke activatie en live suite replacement blijven buiten deze eerste stack
- `Customer Feedback` / `NPS` blijft buiten deze eerste stack en mag pas later met een eigen gate op dezelfde operating rails landen

## Product Acceptance

- [x] De MTO-stack volgt de eerder vastgezette productgrens en internal-first positie
- [x] Elke MTO-wave heeft een duidelijke management- of operatoruitkomst
- [x] MTO blijft onderscheidbaar van de bestaande suite zonder die nu al te vervangen

## Codebase Acceptance

- [x] De stack landt op bestaande registries, types, campaign flows en operating layers
- [x] De stack vereist geen premature platformverbouwing
- [x] Elke wave heeft begrensde primaire code surfaces

## Runtime Acceptance

- [x] Er zijn nog geen runtimewijzigingen doorgevoerd
- [x] De stack respecteert de huidige live runtime van de bestaande suite
- [x] Elke toekomstige MTO-wave blijft binnen de bestaande campaign-centered runtime totdat het tegendeel bewezen nodig is

## QA Acceptance

- [x] Wavevolgorde en blockingregels zijn expliciet en toetsbaar
- [x] MTO-boundaries zijn duidelijk genoeg om regressie en scope creep tegen te houden
- [x] publieke activatie- en replacementgates zijn per wave herhaalbaar

## Documentation Acceptance

- [x] Dit document kan dienen als source of truth voor de voorbereiding van de eerste MTO-wave stack
- [x] Het document definieert de master-indexstructuur en de toegestane waves
- [x] Het document eindigt met een duidelijke eerstvolgende toegestane buildartifact

## Not In This Step

- Geen MTO-wave uitvoeren
- Geen MTO master index bestand aanmaken
- Geen WAVE-document aanmaken
- Geen code wijzigen
- Geen marketing- of pricingactivatie uitvoeren

## Exit Gate

Deze stap is afgerond omdat:

- [x] de MTO master indexstructuur is vastgezet
- [x] de initiële MTO master indexstatus is vastgezet
- [x] de eerste toegestane MTO-wave stack is vastgezet
- [x] blocked work expliciet is benoemd
- [x] de eerstvolgende toegestane buildartifact expliciet is benoemd

## Next Step After Approval

Na goedkeuring van deze stap volgt:

- `WAVE_01_MTO_FOUNDATION_VERTICAL_SLICE.md`

Dat wordt het eerste echte MTO-buildartifact en daarmee de eerste actieve source of truth voor MTO-productbouw.
