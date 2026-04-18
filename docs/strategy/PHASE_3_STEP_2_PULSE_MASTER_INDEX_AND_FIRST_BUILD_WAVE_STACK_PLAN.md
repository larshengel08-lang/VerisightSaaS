# Phase 3 Step 2 - Pulse Master Index and First Build-Wave Stack Plan

## Title

Lock the Pulse master index structure, active source-of-truth pointer, and the first controlled Pulse build-wave stack before any implementation wave starts.

## Korte Summary

Deze stap opent de implementatie nog niet, maar bereidt die wel strak voor. Het document zet vast hoe `Pulse` bestuurlijk gevolgd gaat worden als eerstvolgende productlijn, welke documenten straks het werk aansturen, welke wavevolgorde is toegestaan, welke waves expliciet nog gesloten blijven, en welke concrete Pulse-slices nodig zijn om van bestaande Verisight-basis naar een eerste klantwaardige Pulse-lijn te komen.

De kernbeslissing is dat `Pulse` niet in een keer als volledige productlijn wordt geopend. In plaats daarvan krijgt `Pulse` een begrensde wave stack waarin eerst een end-to-end foundation slice wordt gebouwd binnen de huidige campaign-centered architectuur, daarna pas trend- en reviewlogica, daarna pas managementoutput en pas helemaal aan het einde routeactivatie en hardening. `TeamScan` en alle latere lijnen blijven geblokkeerd zolang deze stack niet volledig groen is.

Status van deze stap:

- Decision status: complete
- Runtime status: geen live productwijzigingen
- Build status: nog geen Pulse-wave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

Na Phase 3 Step 1 is de governance geregeld, maar er ontbreekt nog een concrete startconfiguratie voor de eerste productbouw:

- welk artifact wordt straks de actieve source of truth
- welke Pulse-waves zijn precies toegestaan
- welke code-oppervlakken vallen per wave binnen scope
- welke acceptance gate sluit elke wave af
- welke dingen expliciet nog niet mee mogen in `Pulse`

Dat is nodig omdat `Pulse` dicht tegen bestaande live vormen aanligt:

- marketing kent `Pulse` al als gereserveerde future route
- de huidige runtime kent alleen `exit` en `retention` als `scan_type`
- de huidige delivery ladder kent al `RetentieScan ritme` als repeat motion
- `Pulse` mag pas productwaardig worden wanneer het verder gaat dan "RetentieScan vaker herhalen"

Deze stap zorgt ervoor dat `Pulse` straks niet breed, diffuus of te vroeg wordt gebouwd.

## Decision

### 1. Pulse Master Index Purpose

Voor `Pulse` komt er een centrale bestuurlijke index die het hele vervolgtraject van deze productlijn bewaakt.

Doel van de Pulse master index:

- actieve source-of-truth aanwijzen
- wavevolgorde bewaken
- afgesloten versus geblokkeerde waves zichtbaar houden
- afhankelijkheden en gates centraal tonen
- voorkomen dat `Pulse` tegelijk in meerdere half-afgemaakte sporen uiteenvalt

Beslissing:

- `Pulse` krijgt als eerste nieuwe productlijn een eigen master index
- deze index wordt niet buyer-facing en niet prompt-gebaseerd
- deze index leeft in `docs/strategy`

### 2. Pulse Master Index Structure

De toekomstige Pulse master index moet minimaal de volgende velden bevatten:

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
4. Allowed Pulse Wave Stack
5. Blocked Work
6. Acceptance State
7. Open Risks
8. Next Allowed Wave

Beslissing:

- er komt precies een master index voor `Pulse`
- nieuwe Pulse-wave documenten moeten vanuit die index vindbaar zijn

### 3. Initial Pulse Master Index State

De index moet starten met deze bestuurlijke status:

- `productline`: `Pulse`
- `status`: `planned_not_open`
- `current_source_of_truth`: dit document totdat `WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE.md` expliciet wordt geopend
- `current_active_wave`: `none`
- `last_completed_step`: `PHASE_3_STEP_2_PULSE_MASTER_INDEX_AND_FIRST_BUILD_WAVE_STACK_PLAN.md`
- `last_completed_wave`: `none`
- `next_allowed_wave`: `WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE.md`

Geblokkeerde waves bij start:

- elke `TeamScan`-wave
- elke `Onboarding 30-60-90`-wave
- elke tweede Pulse-wave voordat `WAVE_01` groen is

Beslissing:

- de master index opent nog geen build
- hij wijst alleen de eerstvolgende toegestane build aan

### 4. Pulse Build Stack Principles

De eerste Pulse-stack moet voldoen aan de volgende principes:

- campaign-centered blijven
- geen generieke run- of artifactlaag introduceren
- eerst een end-to-end vertical slice bouwen
- trend en multi-cycle logica pas toevoegen nadat een eerste enkele Pulse-cyclus werkt
- buyer-facing routeactivatie pas doen nadat productoutput klantwaardig is

Beslissing:

- Pulse wordt in kleine, functioneel bruikbare slices opgebouwd
- elke wave moet een echte managementuitkomst hebben en niet alleen een technische foundation leggen

### 5. Allowed Pulse Wave Stack

#### WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE

Doel:

- `Pulse` als nieuwe productline technisch en productmatig laten landen binnen de huidige campaign-centered runtime
- een eerste end-to-end Pulse-cyclus mogelijk maken van campaign setup tot survey submit tot minimale dashboardread

Planned user outcome:

- Verisight kan een eerste Pulse-campaign draaien en een eerste compacte managementsnapshot tonen binnen dezelfde assisted productvorm

Scope in:

- `scan_type` uitbreiding naar `pulse` in registries en gedeelde types
- productspecifieke Pulse module in backend en frontend
- minimale Pulse surveydefinitie en submit-validatie
- Pulse scoring- en interpretation contract
- campaign creation / dashboard routing / reportability basis voor `pulse`
- minimale dashboardweergave voor huidige Pulse-signalen
- docs, tests en smokeflow voor end-to-end Pulse run

Scope out:

- trendvergelijking met vorige cycles
- cross-campaign delta's
- Pulse PDF-report
- buyer-facing pricingactivatie
- publieke productpagina voor Pulse

Dependencies:

- Phase 1 Step 1
- Phase 1 Step 2
- Phase 2 Step 1
- Phase 3 Step 1
- dit document

Primary code surfaces:

- `backend/products/shared/registry.py`
- `frontend/lib/products/shared/registry.ts`
- `frontend/lib/types.ts`
- nieuwe `backend/products/pulse/*`
- nieuwe `frontend/lib/products/pulse/*`
- relevante surveytemplates
- campaign creation en campaign dashboard surfaces

Exit gate:

- een Pulse-campaign kan worden aangemaakt
- een respondent kan een Pulse-survey invullen
- Pulse-output verschijnt in een minimale, coherente dashboardread
- docs, tests en smoke-validatie zijn groen

Next allowed wave:

- `WAVE_02_PULSE_REVIEW_LOOP_AND_DELTA_LOGIC.md`

#### WAVE_02_PULSE_REVIEW_LOOP_AND_DELTA_LOGIC

Doel:

- `Pulse` daadwerkelijk monitoringwaarde geven door review- en delta-logica boven op de foundation slice te zetten

Planned user outcome:

- management ziet niet alleen een huidig Pulse-beeld, maar ook of een eerder signaal verbetert, verslechtert of stabiel blijft

Scope in:

- ankerlogica naar vorige relevante meting
- delta- en trendinterpretatie binnen huidige campaign-centered architectuur
- reviewmomentkaarten en follow-through logica
- calibratie van copy voor "monitoring" versus "nieuwe diagnose"
- tests en smoke voor twee opeenvolgende meetmomenten

Scope out:

- brede historische trendengine
- generiek time-series platform
- teamlokalisatie
- buyer-facing routeactivatie

Dependencies:

- `WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE` groen

Primary code surfaces:

- Pulse dashboard view model
- aggregate/read helpers
- campaign comparison helpers
- tests voor delta- en reviewlogica

Exit gate:

- Pulse kan een vorige relevante meting meenemen
- managementreview toont delta en reviewrichting zonder overclaiming
- tests, docs en smokepad voor twee meetpunten zijn groen

Next allowed wave:

- `WAVE_03_PULSE_MANAGEMENT_OUTPUT_AND_REPEAT_MOTION.md`

#### WAVE_03_PULSE_MANAGEMENT_OUTPUT_AND_REPEAT_MOTION

Doel:

- Pulse van een technische monitoringflow naar een echte managementproductvorm brengen

Planned user outcome:

- management krijgt een klantwaardige Pulse-output met compacte handoff, reviewrichting, volgende stap en duidelijke repeat-logica

Scope in:

- Pulse managementcopy en productdefinitie
- Pulse dashboardpolish naar first-value niveau
- compacte Pulse-report of gelijkwaardige managementoutput, alleen als direct nodig voor productwaarde
- repeat motion logica binnen Pulse zelf
- onboarding naar first review value
- acceptance criteria voor een eerste interne of assisted klantwaardige release

Scope out:

- publieke prijs- en productenpagina live zetten
- complexe multi-tenant entitlements
- teamlokalisatie of onboarding lifecycle-uitbreiding

Dependencies:

- `WAVE_02_PULSE_REVIEW_LOOP_AND_DELTA_LOGIC` groen

Primary code surfaces:

- Pulse dashboard adapter
- productdefinition and methodology copy surfaces
- eventueel report generation surfaces indien nodig
- docs, tests en smoke voor first-value managementgebruik

Exit gate:

- Pulse heeft een duidelijke first management use flow
- repeat motion is productmatig coherent en niet verward met `RetentieScan ritme`
- product, code, docs, tests en smoke zijn groen op klantwaardige basis

Next allowed wave:

- `WAVE_04_PULSE_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md`

#### WAVE_04_PULSE_ROUTE_ACTIVATION_AND_RELEASE_HARDENING

Doel:

- Pulse pas na bewezen productwaarde gecontroleerd activeren in routekeuze, packaging en showcase

Planned user outcome:

- Pulse kan gecontroleerd zichtbaar worden als echte vervolglijn zonder verwarring met bestaande live routes

Scope in:

- marketing productstatus van reserved naar gecontroleerde routeactivatie, alleen indien gerechtvaardigd
- routekeuze- en packagingcopy
- sales/showcase alignment
- regressietests op portfolio- en positioninglogica
- release hardening en acceptance-eindcontrole

Scope out:

- TeamScan openen
- brede suite-navigatie voor meerdere nieuwe lijnen
- lifecycleverbreding buiten Pulse

Dependencies:

- `WAVE_03_PULSE_MANAGEMENT_OUTPUT_AND_REPEAT_MOTION` groen

Primary code surfaces:

- `frontend/lib/marketing-products.ts`
- `frontend/components/marketing/site-content.ts`
- positioning tests
- eventuele sample/showcase surfaces

Exit gate:

- Pulse is commercieel en productmatig coherent geactiveerd
- bestaande live routes blijven scherp
- regressies op portfolio-positionering zijn groen

Next allowed wave:

- later te beslissen op basis van Pulse-releasekwaliteit en suiteprioriteit

### 6. Blocked Work During Pulse Stack

Het volgende werk blijft expliciet geblokkeerd terwijl de eerste Pulse-stack loopt:

- elke `TeamScan`-wave
- elke `Onboarding 30-60-90`-wave
- generieke jobs/queues/workflows
- generiek artifactmodel
- plan- of entitlementuitbreiding voor latere suiteproducten
- brede buyer-facing suite-activatie voor meerdere nieuwe lijnen

Beslissing:

- geen scopelek vanuit `Pulse` naar latere productlijnen

### 7. Pulse Master Index Update Rules

De toekomstige Pulse master index moet na elke stap of wave minimaal deze updates krijgen:

- `current_source_of_truth` aanpassen
- `current_active_wave` aanpassen
- `last_completed_wave` aanpassen
- acceptance summary updaten
- blocked versus allowed waves herbevestigen

Update rule:

- alleen na expliciete afronding van een stap of wave
- niet tijdens half-afgemaakte uitvoering

Beslissing:

- de Pulse master index wordt een bestuurlijke state tracker, geen werkklad

### 8. Pulse Stack Acceptance Rules

Voor elke Pulse-wave gelden dezelfde vijf acceptance-lagen:

- Product acceptance
- Codebase acceptance
- Runtime acceptance
- QA acceptance
- Documentation acceptance

Extra Pulse-specifieke gates:

- `Pulse` mag niet inhoudelijk samenvallen met `RetentieScan ritme`
- monitoringtaal mag niet als diagnose worden verkocht
- eerste routekeuze van Verisight mag niet verschuiven van `ExitScan` naar `Pulse`
- elke wave moet de huidige live ExitScan/RetentieScan-ervaring intact laten

### 9. Current Active Source-of-Truth Pointer

Totdat een Pulse-wave expliciet wordt geopend, geldt:

- active productline preparation artifact: dit document
- active build wave: none
- next allowed artifact: `WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE.md`

Beslissing:

- er komt pas een echte write-enabled buildartifact zodra `WAVE_01` wordt aangemaakt

## Key Changes

- `Pulse` heeft nu een bestuurlijke master-indexvorm.
- De eerste toegestane Pulse-wave stack is expliciet vastgezet.
- De wavevolgorde voor `Pulse` is nu gekoppeld aan echte managementuitkomsten.
- `Pulse` is expliciet begrensd ten opzichte van `RetentieScan ritme`.
- Buyer-facing routeactivatie is uitgesteld tot na productwaarde.
- Alle latere productlijnen blijven formeel geblokkeerd.

## Belangrijke Interfaces/Contracts

### Pulse Master Index Contract

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

- dit contract wordt verplicht voor het toekomstige Pulse-indexbestand

### Pulse Wave Stack Contract

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

- elke Pulse-wave moet precies dit contract volgen

### Pulse Readiness Contract

- `foundation_ready`
- `review_ready`
- `management_output_ready`
- `route_activation_ready`

Beslissing:

- `Pulse` wordt pas als productlijn volwassen genoeg gezien wanneer deze readiness-trap stapsgewijs groen is

### Blocked Work Contract

- `blocked_productlines`
- `blocked_platform_expansions`
- `blocked_go_to_market_expansions`

Beslissing:

- blocked work wordt expliciet benoemd en niet impliciet verondersteld

## Testplan

### Governance Alignment Review

- [x] Gecontroleerd dat deze stack aansluit op de one-wave-at-a-time governance uit Phase 3 Step 1.
- [x] Gecontroleerd dat `Pulse` in Phase 1 al is vastgezet als eerstvolgende productlijn.

### Productline Boundary Test

- [x] `Pulse` blijft monitoring na diagnose of baseline.
- [x] `Pulse` wordt niet gedefinieerd als eerste wedge.
- [x] `Pulse` wordt niet gelijkgesteld aan `RetentieScan ritme`.

### Wave Sequencing Test

- [x] `WAVE_01` levert een end-to-end vertical slice op.
- [x] `WAVE_02` opent pas na groen op `WAVE_01`.
- [x] `WAVE_03` opent pas na echte review- en deltawaarde.
- [x] `WAVE_04` opent pas na klantwaardige managementoutput.

### Scope Leakage Test

- [x] `TeamScan` en `Onboarding 30-60-90` blijven geblokkeerd.
- [x] Generieke platformverbreding blijft geblokkeerd.
- [x] Buyer-facing activatie blijft uitgesteld tot late stackfase.

### Smoke-validatie

#### Scenario 1

Iemand wil `Pulse` meteen als publieke productpagina activeren.

- Resultaat: geblokkeerd
- Waarom: routeactivatie hoort pas bij `WAVE_04`

#### Scenario 2

Iemand wil direct trendlogica bouwen zonder dat een eerste Pulse-campaign werkt.

- Resultaat: geblokkeerd
- Waarom: `WAVE_01` moet eerst foundation en end-to-end execution bewijzen

#### Scenario 3

Iemand wil `TeamScan` tegelijk met `Pulse` starten.

- Resultaat: geblokkeerd
- Waarom: one-wave-at-a-time en blocked work contract

#### Scenario 4

Iemand wil `Pulse` realiseren door alleen `RetentieScan ritme` te herlabelen.

- Resultaat: afgekeurd
- Waarom: productline boundary met `RetentieScan ritme` is expliciet anders

#### Scenario 5

`WAVE_01` is volledig groen en acceptance is expliciet afgetekend.

- Resultaat: `WAVE_02` mag openen
- Waarom: governance en wave exit gate zijn gehaald

## Assumptions/Defaults

- De huidige campaign-centered architectuur is voldoende startpunt voor de eerste Pulse-wave.
- `Pulse` wordt eerst intern/productmatig opgebouwd en pas later buyer-facing geactiveerd.
- Een eerste Pulse-slice moet echte managementwaarde opleveren en niet alleen technische registratie.
- `RetentieScan ritme` blijft voorlopig de bestaande repeat motion totdat Pulse aantoonbaar een eigen productwaarde heeft.
- `TeamScan` en alle latere lijnen blijven gesloten tijdens deze stack.

## Product Acceptance

- [x] De Pulse-stack volgt de eerder vastgezette productvolgorde.
- [x] Elke Pulse-wave heeft een duidelijke managementuitkomst.
- [x] Pulse blijft onderscheidbaar van bestaande live producten en repeat motions.
- [x] Routeactivatie gebeurt pas als het product er inhoudelijk klaar voor is.

## Codebase Acceptance

- [x] De stack landt op bestaande registries, types, campaign flows en productspecifieke modules.
- [x] De stack vereist geen premature platformabstracties.
- [x] Elke wave heeft begrensde primaire code surfaces.
- [x] Latere productlijnen blijven buiten scope.

## Runtime Acceptance

- [x] Er zijn nog geen runtimewijzigingen doorgevoerd.
- [x] De stack respecteert de huidige live runtime van ExitScan en RetentieScan.
- [x] Elke toekomstige Pulse-wave blijft binnen de bestaande campaign-centered runtime totdat het tegendeel bewezen nodig is.

## QA Acceptance

- [x] Wavevolgorde en blockingregels zijn expliciet en toetsbaar.
- [x] Pulse-boundaries zijn duidelijk genoeg om regressie en scope creep tegen te houden.
- [x] Acceptance-gates zijn herhaalbaar per wave.

## Documentation Acceptance

- [x] Dit document kan dienen als source of truth voor de voorbereiding van de eerste Pulse-wave stack.
- [x] Het document definieert de master-indexstructuur en de toegestane waves.
- [x] Het document eindigt met een duidelijke eerstvolgende toegestane buildartifact.

## Not In This Step

- Geen Pulse-wave uitvoeren.
- Geen Pulse master index bestand aanmaken.
- Geen WAVE-documenten aanmaken.
- Geen code wijzigen.
- Geen marketing- of pricingactivatie uitvoeren.

## Exit Gate

Deze stap is afgerond omdat:

- [x] de Pulse master indexstructuur is vastgezet
- [x] de initiele Pulse master indexstatus is vastgezet
- [x] de eerste toegestane Pulse-wave stack is vastgezet
- [x] blocked work expliciet is benoemd
- [x] de eerstvolgende toegestane buildartifact expliciet is benoemd

## Next Step After Approval

Na goedkeuring van deze stap volgt:

- `WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE.md`

Dat wordt het eerste echte buildartifact en daarmee de eerste actieve source of truth voor productbouw.
