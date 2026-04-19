# Phase Next Step 14 - Leadership Scan Master Index and Wave-Stack Plan

## Title

Lock the Leadership Scan master index structure, active source-of-truth pointer, and the first controlled Leadership Scan build-wave stack before any Leadership Scan implementation starts.

## Korte Summary

Deze stap opent `Leadership Scan` nog niet als build. Het document doet voor Leadership Scan wat eerder ook voor `Pulse`, `TeamScan` en `Onboarding 30-60-90` nodig was: vastzetten hoe de productlijn bestuurlijk gevolgd gaat worden, welke volgorde van build waves is toegestaan, welke workstreams expliciet geblokkeerd blijven, en welk artifact vanaf hier de eerstvolgende write-enabled source of truth mag worden.

De vorige twee Leadership Scan-stappen hebben al scherp gemaakt dat:

- `Leadership Scan` de enige resterende serieuze uitbreidingscandidate is na de huidige suitefreeze
- Leadership Scan alleen als bounded follow-on route onderzocht mag worden
- Leadership Scan niet mag vervallen tot 360-tool, performance-instrument of generieke leiderschapstraining
- Leadership Scan in v1 binnen de bestaande campaign-centered runtime moet passen
- Leadership Scan niet mag leunen op `manager_id`, reporting lines, org chart of individuele managerreadouts
- Leadership Scan niet mag samenvallen met `TeamScan` of met de bestaande `leadership`-factor

De hoofdkeuze van deze stap is daarom:

- `Leadership Scan` krijgt een eigen master-indexvorm in `docs/strategy`
- Leadership Scan opent niet breed, maar via vier begrensde waves
- de eerste toegestane wave is een smalle foundation slice binnen de bestaande campaign-centered runtime
- buyer-facing activatie, manager-identiteitsmodellen en brede leadership-platformclaims blijven expliciet laat of geblokkeerd

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen Leadership Scan-wave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

Na [PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md) en [PHASE_NEXT_STEP_13_LEADERSHIP_SCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_13_LEADERSHIP_SCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md) is duidelijk wat Leadership Scan moet zijn en waar het technisch binnen moet passen. Wat nog ontbrak, is de bestuurlijke startconfiguratie voor daadwerkelijke uitvoering:

- welk Leadership Scan-artifact straks de actieve source of truth wordt
- welke Leadership Scan-waves precies zijn toegestaan
- welke volgorde verplicht is
- welke code-oppervlakken per wave logisch binnen scope liggen
- welke dingen bewust nog niet mee mogen in Leadership Scan-v1

Dat is extra belangrijk omdat Leadership Scan sneller dan eerdere lijnen kan ontsporen in overlap met:

- de bestaande factor `leadership` in huidige productscores
- bestaande managementhandoff in `ExitScan`, `RetentieScan`, `Pulse`, `TeamScan` en onboarding
- TeamScan als huidige route voor lokalisatie en eerste verificatie
- privacy- en interpretatierisico's zodra leiderschap te dicht bij individuele personen komt

Deze stap voorkomt dat door nu al vast te zetten hoe Leadership Scan gecontroleerd open mag.

## Current Implementation Baseline

### 1. Productline and runtime reality

- [x] huidige registries kennen nog geen `scan_type = leadership`
- [x] huidige runtime blijft campaign-centered op `Organization -> Campaign -> Respondent -> SurveyResponse`
- [x] er bestaat nog geen Leadership Scan-productmodule, Leadership Scan-dashboardflow of Leadership Scan-reportpad

### 2. Data and identity reality

- [x] huidige respondentmetadata kent geen `manager_id`, `manager_name`, `team_id`, `location` of reporting line
- [x] de bestaande `leadership`-factor leeft vandaag binnen `org_raw` en `org_scores`
- [x] de codebase kent nog geen 360-rollen, multi-rater model of named leader readout
- [x] Leadership Scan v1 moet later daarom starten zonder individuele manageridentiteit

### 3. Boundary reality

- [x] `TeamScan` is al live als department-first lokalisatieroute
- [x] Leadership Scan moet daarvan expliciet onderscheiden blijven
- [x] buyer-facing Leadership Scan bestaat vandaag nog niet als route, pricinglijn of funnelpad
- [x] de suite is nu sterk juist omdat follow-on routes klein en bounded blijven

### 4. Governance reality

- [x] de repo werkt nu met one-wave-at-a-time governance
- [x] `Pulse`, `TeamScan` en `Onboarding 30-60-90` zijn afgerond als eerdere nieuwe productlijnen
- [x] Leadership Scan mag pas nu als volgende gecontroleerde productlijn bestuurlijk worden voorbereid

## Decision

### 1. Leadership Scan Master Index Purpose

Voor `Leadership Scan` komt er een centrale bestuurlijke index die het hele vervolgtraject van deze productlijn bewaakt.

Doel van de Leadership Scan master index:

- actieve source-of-truth aanwijzen
- wavevolgorde bewaken
- completed versus blocked work zichtbaar houden
- afhankelijkheden en gates centraal tonen
- voorkomen dat Leadership Scan tegelijk uiteenvalt in survey, dashboard, copy, privacy en marketingwerk

Beslissing:

- Leadership Scan krijgt als volgende candidate een eigen master index
- deze index leeft in `docs/strategy`
- deze index is bestuurlijk en niet buyer-facing

### 2. Leadership Scan Master Index Structure

De toekomstige Leadership Scan master index moet minimaal de volgende velden bevatten:

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
4. Allowed Leadership Scan Wave Stack
5. Blocked Work
6. Acceptance State
7. Open Risks
8. Next Allowed Wave

Beslissing:

- er komt precies een master index voor Leadership Scan
- nieuwe Leadership Scan-wave documenten moeten vanuit die index vindbaar zijn

### 3. Initial Leadership Scan Master Index State

De index moet starten met deze bestuurlijke status:

- `productline: Leadership Scan`
- `status: planned_not_open`
- `current_source_of_truth: dit document totdat WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE.md expliciet wordt geopend`
- `current_active_wave: none`
- `last_completed_step: PHASE_NEXT_STEP_14_LEADERSHIP_SCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md`
- `last_completed_wave: none`
- `next_allowed_wave: WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE.md`

Geblokkeerde waves bij start:

- elke extra Leadership Scan-wave voordat `WAVE_01` groen is
- elke buyer-facing Leadership Scan-activatie voordat `WAVE_04` expliciet opent
- elke manager-identiteits-, reporting-line- of 360-uitbreiding buiten expliciete wave-scope

Beslissing:

- de master index opent nog geen build
- hij wijst alleen de eerstvolgende toegestane Leadership Scan-wave aan

### 4. Leadership Scan Build-Stack Principles

De eerste Leadership Scan-stack moet voldoen aan de volgende principes:

- campaign-centered blijven
- eerst een end-to-end vertical slice bouwen zonder individuele manageridentiteit
- eerst bewijzen dat er een eigen managementvraag en eigen outputvorm bestaat
- geen 360- of performance-instrument vooruit bouwen
- privacy en suppressie vanaf de eerste wave expliciet bewijzen
- buyer-facing activatie pas doen nadat Leadership Scan echt onderscheidend en verantwoord is

Beslissing:

- Leadership Scan wordt in kleine, managementbruikbare slices opgebouwd
- elke wave moet echte managementverificatie-waarde leveren en niet alleen technische voorbereiding

### 5. Allowed Leadership Scan Wave Stack

#### WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE

Doel:

- `Leadership Scan` als nieuwe productline technisch en productmatig laten landen binnen de huidige campaign-centered runtime
- een eerste end-to-end Leadership Scan-cyclus mogelijk maken van campaign setup tot survey submit tot minimale geaggregeerde managementread

Planned user outcome:

- Verisight kan een eerste Leadership Scan-campaign draaien die op veilige manier een geaggregeerde leadership-context read toont, met duidelijke boundarycopy dat dit geen named leader, ranking of performance-output is

Scope in:

- `scan_type` uitbreiding naar `leadership` in registries en gedeelde types
- productspecifieke Leadership Scan-module in backend en frontend
- minimale Leadership Scan surveydefinitie en submit-validatie
- Leadership Scan scoring- en interpretation contract
- suppressie- en aggregatiechecks voor veilige managementoutput
- eerste Leadership Scan dashboardread met bijvoorbeeld `leadership_context_summary`, `signal_patterns` en expliciete privacygrenzen
- docs, tests en smokeflow voor end-to-end Leadership Scan run

Scope out:

- manager-identiteit
- reporting line
- 360-rollen
- buyer-facing routeactivatie
- Leadership Scan PDF-report
- named leader readout

Dependencies:

- [PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_13_LEADERSHIP_SCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_13_LEADERSHIP_SCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- dit document

Primary code surfaces:

- `backend/products/shared/registry.py`
- `frontend/lib/products/shared/registry.ts`
- `frontend/lib/types.ts`
- nieuwe `backend/products/leadership/*`
- nieuwe `frontend/lib/products/leadership/*`
- relevante surveytemplates
- campaign creation en campaign dashboard surfaces

Exit gate:

- een Leadership Scan-campaign kan worden aangemaakt
- een respondent kan een Leadership Scan-survey invullen
- Leadership Scan-output toont een minimale, coherente en veilige geaggregeerde managementread
- docs, tests en smoke-validatie zijn groen

Next allowed wave:

- `WAVE_02_LEADERSHIP_SCAN_INTERPRETATION_AND_BOUNDARIES.md`

#### WAVE_02_LEADERSHIP_SCAN_INTERPRETATION_AND_BOUNDARIES

Doel:

- Leadership Scan echte productwaarde geven door de managementread inhoudelijk scherper en veiliger te interpreteren

Planned user outcome:

- management ziet niet alleen leadership-contextsignalen, maar begrijpt ook welke managementdynamiek verdere verificatie vraagt en welke claims juist niet gemaakt mogen worden

Scope in:

- interpretation- en boundarycopy
- expliciete distinction tussen managementcontext, teamcontext en factoruitleg
- first management questions
- tests en smoke voor overclaim-preventie en privacygrenzen

Scope out:

- named leader vergelijking
- reporting hierarchy
- buyer-facing activatie
- 360- of coachinglogica

Dependencies:

- `WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE` groen

Primary code surfaces:

- Leadership Scan dashboard view model
- interpretation helpers
- Leadership Scan definition copy
- tests voor managementgrenzen en boundarystates

Exit gate:

- Leadership Scan toont bestuurlijk bruikbare maar terughoudende interpretatie
- het product overclaimt niet richting performance, individuele leiders of causaliteit
- tests, docs en smoke zijn groen

Next allowed wave:

- `WAVE_03_LEADERSHIP_SCAN_MANAGEMENT_OUTPUT_AND_HANDOFF.md`

#### WAVE_03_LEADERSHIP_SCAN_MANAGEMENT_OUTPUT_AND_HANDOFF

Doel:

- Leadership Scan van een technische managementread naar een echte managementproductvorm brengen

Planned user outcome:

- management krijgt een klantwaardige Leadership Scan-output met eerste verificatievraag, eerste eigenaar, begrensde eerste actie en expliciete reviewgrens

Scope in:

- Leadership Scan managementcopy en productdefinitie
- dashboardpolish naar first-value niveau
- first owner / first action / review boundary
- handoff naar bestaand management- of opvolgproces
- acceptancecriteria voor een eerste assisted klantwaardige release

Scope out:

- publieke productroute live zetten
- named leader output
- performance-, review- of coachingflows
- cross-product entitlementlogica

Dependencies:

- `WAVE_02_LEADERSHIP_SCAN_INTERPRETATION_AND_BOUNDARIES` groen

Primary code surfaces:

- Leadership Scan dashboard layer
- Leadership Scan productdefinition
- onboarding/lifecycle copy surfaces waar follow-onlogica geraakt wordt
- tests voor managementoutput

Exit gate:

- Leadership Scan-output is klantwaardig als assisted productvorm
- eerste eigenaar en eerste actie zijn expliciet
- docs, tests en smoke zijn groen

Next allowed wave:

- `WAVE_04_LEADERSHIP_SCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md`

#### WAVE_04_LEADERSHIP_SCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING

Doel:

- Leadership Scan alleen buyer-facing activeren wanneer de productgrens, privacy en suitefit echt scherp genoeg zijn

Planned user outcome:

- buyers kunnen Leadership Scan zien als een aparte managementroute zonder verwarring met `TeamScan`, bestaande factoruitleg of brede leiderschapstooling

Scope in:

- beperkte buyer-facing routeactivatie
- Leadership Scan productpagina en marketingcopy
- pricing-, trust- en funnelalignment
- regressietests en buyer-facing smokevalidatie

Scope out:

- brede leadership-suite reframing
- self-serve checkout
- 360-, coaching- of performanceclaims

Dependencies:

- `WAVE_03_LEADERSHIP_SCAN_MANAGEMENT_OUTPUT_AND_HANDOFF` groen

Primary code surfaces:

- `frontend/lib/marketing-products.ts`
- `frontend/app/producten/[slug]/page.tsx`
- homepage, producten, tarieven, vertrouwen, sitemap en funnelsurfaces
- relevante marketingtests

Exit gate:

- Leadership Scan buyer-facing alleen gecontroleerd en bounded geactiveerd
- claims, pricing en trust sluiten aan op de echte output
- tests en smokevalidatie zijn groen

Next allowed wave:

- later expliciet te beslissen op basis van suitestrategie

## Blocked Work

Expliciet geblokkeerd totdat Leadership Scan-waves dat later openen:

- `manager_id` of named leader identity model
- reporting line of org chart model
- 360- of multi-rater architectuur
- named leader ranking of scorecards
- buyer-facing Leadership Scan voordat `WAVE_04` groen is
- elke volgende productlijn buiten Leadership Scan

## Acceptance State

- [x] De Leadership Scan-lijn heeft nu een bestuurlijke wave-stack.
- [x] De eerstvolgende toegestane stap is expliciet begrensd.
- [x] Er is nog geen build geopend.
- [x] Er is nog geen buyer-facing of runtime-uitbreiding uitgevoerd.

## Open Risks

- Leadership Scan kan alsnog te snel samenvallen met `TeamScan`
- de bestaande `leadership`-factor kan later te makkelijk als pseudo-product worden herverpakt
- gebrek aan manager- of hiërarchiedata kan later een te grote v1-beperking blijken
- buyer-facing Leadership Scan kan te vroeg klinken als bredere leiderschapstool in plaats van bounded managementroute

## Testplan

### Product acceptance

- [x] Leadership Scan opent niet breed maar via een gecontroleerde wave-stack
- [x] de wavevolgorde beschermt de productgrenzen van Leadership Scan
- [x] buyer-facing activatie blijft bewust laat

### Codebase acceptance

- [x] het document sluit aan op de huidige registry- en runtimerealiteit
- [x] er wordt geen niet-bestaande leadershipimplementatie verondersteld
- [x] er wordt geen platformverbreding vooruit gepland zonder productreden

### Runtime acceptance

- [x] geen runtimewijzigingen in deze stap
- [x] geen marketingactivatie in deze stap
- [x] geen Leadership Scan-wave geopend in deze stap

### QA acceptance

- [x] de eerste toegestane buildwave is eenduidig
- [x] blocked work is expliciet
- [x] de Leadership Scan-track volgt dezelfde governance als eerdere productlijnen

### Documentation acceptance

- [x] dit document functioneert als source of truth voor de Leadership Scan wave-stack
- [x] dependencies en gates zijn expliciet
- [x] de vervolgstap is eenduidig vastgezet

## Assumptions/Defaults

- Leadership Scan wordt de volgende gecontroleerde productlijn alleen als bounded managementroute
- Leadership Scan v1 moet eerst een geaggregeerde en suppressie-aware managementread bewijzen
- manager-identiteit, 360-logica en buyer-facing activatie blijven later
- de suite blijft one-wave-at-a-time bestuurd

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE.md`

Er is nog geen build uitgevoerd; alleen de bestuurlijke buildstack is nu geopend.
