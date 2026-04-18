# Phase Next Step 30 - MTO Entry and Boundaries Plan

## Title

Lock MTO as a new, heavier Verisight productline by fixing its entry logic, product boundary, and relationship to the existing scan suite before any MTO architecture or build starts.

## Korte Summary

Deze stap opent `MTO` nog niet als build wave. Dit document zet eerst de productgrens, entryregels, non-entryregels en suitepositie decision-complete vast op basis van de huidige Verisight-repo en de expliciete keuzes voor deze track.

De nu vastgezette MTO-basis is:

- `MTO` wordt een nieuwe productlijn en geen capability-uitbreiding bovenop een bestaande route
- `MTO` is zwaarder en uitgebreider dan de bestaande beperkte survey-scans
- `MTO` is een organisatiebrede hoofdmeting
- `MTO` is bedoeld om op termijn het hoofdmodel van Verisight te worden
- `MTO` blijft in deze eerste track intern / assisted only
- de bestaande live routes blijven voorlopig operationeel leidend totdat MTO productmatig en operationeel groen is

De huidige codebase laat tegelijk zien dat er al een bruikbaar operating model ligt:

- modulaire productlijnen in `backend/products/*` en `frontend/lib/products/*`
- bestaande campaign-centered runtime rond `Organization`, `Campaign`, `Respondent` en `SurveyResponse`
- bestaande dashboard-, report-to-action-, delivery- en learning-spines
- bestaande phase/step/wave-governance in `docs/strategy`

De kernbeslissing van deze stap is daarom:

- `MTO` wordt niet behandeld als lichte follow-up scan
- `MTO` wordt niet behandeld als herlabelde `RetentieScan`
- `MTO` wordt niet meteen buyer-facing of live-leading
- `MTO` wordt eerst als geisoleerde nieuwe hoofdproductlijn opgebouwd binnen dezelfde Verisight-structuur

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen MTO-build gestart
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

Na de huidige suite-uitbreidingen is de repo bestuurlijk en technisch volwassen genoeg om een nieuwe track te openen. Maar MTO is inhoudelijk zwaarder dan de bestaande scans en mag daarom niet impliciet worden ingepast als:

- extra surveyvariant van `RetentieScan`
- bredere `Pulse`
- lokalisatieroute zoals `TeamScan`
- managementcontextroute zoals `Leadership Scan`

Zonder deze stap zouden we te snel kunnen vervallen in:

- te veel overlap met bestaande scanbetekenissen
- onduidelijkheid of MTO al de nieuwe live hoofdroute is
- te vroege platformrefactors
- buyer-facing activatie zonder volwassen productfundament

Deze stap voorkomt dat door nu al vast te zetten:

- wat MTO wel en niet is
- hoe MTO zich verhoudt tot de bestaande routes
- welke live suite-waarheden voorlopig blijven staan
- dat MTO eerst intern / assisted en strikt geisoleerd moet worden opgebouwd

## Current Implementation Baseline

### 1. Current suite reality

- [x] de repo heeft al aparte productmodules voor `exit`, `retention`, `pulse`, `team`, `onboarding` en `leadership`
- [x] de huidige live suite is opgebouwd rond bounded surveyproducten met eigen dashboard- en handofflogica
- [x] de huidige productsuite is methodisch en commercieel genormaliseerd rond kleinere, scherp afgebakende routes

### 2. Current operating model reality

- [x] `docs/strategy` bevat de beslis- en wave-governance voor nieuwe productlijnen
- [x] de repo werkt al met phase/step/wave-documenten en one-wave-at-a-time governance
- [x] dashboard, report-to-action, delivery checkpoints en learning bestaan al als aparte maar koppelbare operating layers

### 3. Current method boundary reality

- [x] de bestaande scans zijn survey-gebaseerd, maar bewust relatief beperkt en bounded
- [x] `Pulse` is korte reviewlaag, niet brede diagnose
- [x] `TeamScan` is lokalisatielaag, niet brede hoofdmeting
- [x] `Leadership Scan` is bounded managementcontextroute, niet organisatiebrede hoofdread

### 4. Current go-to-market reality

- [x] de live suite draait nu zonder MTO als primaire route
- [x] de huidige product- en deliveryprocessen mogen niet geraakt worden door deze nieuwe track
- [x] deze nieuwe track moet eerst intern / assisted en geisoleerd blijven

## Decision

### 1. MTO Product Definition

`MTO` wordt vastgezet als:

- een nieuwe, zelfstandige Verisight-productlijn
- een zwaardere, organisatiebrede hoofdmeting
- een survey- en managementinstrument dat breder en dieper leest dan de bestaande bounded scans
- een route die op termijn het hoofdmodel van Verisight moet kunnen worden

Primary management question:

- `Wat is op dit moment het brede organisatiebeeld van werkbeleving, werkomstandigheden en verbeterprioriteiten, en welke managementroute hoort daar als eerste bij?`

Secondary management question:

- `Welke brede organisatiethema's vragen nu eerst prioriteit, welke vervolgstappen moeten expliciet worden vastgelegd en welke verdere lokalisatie of vervolgmeting is daarna logisch?`

Beslissing:

- `MTO` is geen lichte reviewscan
- `MTO` is geen lokale verdieping
- `MTO` is geen smalle managementcontextroute
- `MTO` is een nieuwe brede hoofdmeting

### 2. MTO Weight and Scope Boundary

MTO wordt expliciet zwaarder vastgezet dan de bestaande suite-scans.

Dat betekent:

- bredere survey dan `Pulse`, `TeamScan`, `Leadership Scan` en de huidige bounded retain/exit-varianten
- rijkere managementread dan alleen eerste signaal of eerste lokalisatie
- explicietere rapportage- en opvolgingslaag
- grotere eisen aan completion, interpretatie, trust en actionability

Beslissing:

- MTO mag niet worden ontworpen als "iets langere bestaande scan"
- MTO mag wel bounded blijven en hoeft geen generieke alles-in-een werknemerssuite te worden

### 3. MTO Entry Rule

MTO wordt in deze track niet behandeld als nieuwe live default, maar wel als toekomstige hoofdroute-in-opbouw.

Wel logisch in deze fase:

- als interne / assisted productlijn in opbouw
- als toekomstige hoofdmeting waarvoor eerst product, dashboard, rapportage en actieroute bewezen moeten worden
- als geisoleerde track die later koppelbaar moet zijn aan de rest van de suite

Niet logisch in deze fase:

- als directe buyer-facing hoofdroute
- als live vervanging van bestaande scans zonder interne green closeout
- als repo-brede refactor van de hele suite

Beslissing:

- MTO is `future-core`, maar nog niet `live-core`
- de eerste track blijft intern / assisted en niet publiek leidend

### 4. MTO Versus Existing Productlines

#### MTO versus ExitScan

- `ExitScan` blijft vertrekdiagnostiek
- `MTO` wordt brede organisatiebrede hoofdmeting

#### MTO versus RetentieScan

- `RetentieScan` blijft bounded behouds- en risicoscan
- `MTO` wordt de zwaardere brede organisatieread

#### MTO versus Pulse

- `Pulse` blijft compacte review- en hermeetlaag
- `MTO` wordt geen frequente check-in, maar de brede basisread

#### MTO versus TeamScan

- `TeamScan` blijft lokalisatielaag na een breder signaal
- `MTO` blijft de brede hoofdmeting voor die lokalisatielaag

#### MTO versus Leadership Scan

- `Leadership Scan` blijft bounded managementcontextroute
- `MTO` blijft organisatiebreed en mag daar niet inhoudelijk mee samenvallen

#### MTO versus Customer Feedback / NPS

- `Customer Feedback` blijft een aparte, nog gesloten future route
- `MTO` blijft in deze track employee- en organisatiebreed gericht
- eventuele NPS- of klantfeedbacklogica mag later wel hetzelfde operating model hergebruiken, maar opent nu niet parallel aan MTO

Beslissing:

- MTO staat niet bovenop bestaande scans als losse capability
- MTO krijgt een eigen productbetekenis naast de bestaande suite

### 5. MTO Initial Operating Boundary

Voor deze eerste track geldt:

- `internal_first = true`
- `buyer_facing_activation = false`
- `existing_live_routes_remain_primary = true`
- `suite_replacement_in_scope = false`

Rationale:

- het huidige proces mag niet worden verstoord
- MTO moet eerst intern productmatig en operationeel groen worden
- koppeling aan bestaande routes hoort pas na expliciete gate

### 6. MTO Reuse Boundary

MTO mag bewust hergebruiken:

- bestaande productmodule-architectuur
- campaign-centered runtime als startpunt
- bestaande dashboard-shell
- bestaande report-to-action contractlaag
- bestaande delivery/checkpoint- en learning-spines als precedent
- dezelfde source-of-truth, wave- en contractdiscipline die later ook voor `Customer Feedback` / `NPS` bruikbaar blijft

MTO mag niet meteen openen:

- brede suite-refactor
- generieke survey builder
- generieke workflow engine
- publieke route- of pricingactivatie
- vervanging van live ExitScan / RetentieScan
- een parallelle `Customer Feedback` / `NPS` buildtrack binnen dezelfde eerste MTO-openingsreeks

Beslissing:

- MTO wordt een nieuwe productmodule op bestaande Verisight-infrastructuur
- MTO wordt niet gebruikt als excuus voor brede platformverbouwing

## Key Changes

- `MTO` is nu expliciet vastgezet als nieuwe productlijn
- `MTO` is expliciet zwaarder en breder dan de huidige beperkte scans
- `MTO` is vastgezet als toekomstige hoofdmeting, maar nog niet live hoofdroute
- de relatie met `ExitScan`, `RetentieScan`, `Pulse`, `TeamScan` en `Leadership Scan` is expliciet gescheiden
- de relatie met de gesloten route `Customer Feedback` is expliciet gescheiden: zelfde operating model later mogelijk, maar geen parallelle opening nu
- internal-first en isolatie van het huidige proces zijn nu harde randvoorwaarden

## Belangrijke Interfaces/Contracts

### MTO Fit Contract

- `productline = MTO`
- `product_role = future_core_measurement`
- `initial_mode = internal_assisted_only`
- `eventual_suite_role = potential_main_model`

Beslissing:

- dit contract is verplichte input voor alle volgende MTO-documenten

### MTO Weight Contract

- `survey_scope = broader_than_existing_bounded_scans`
- `management_read_depth = richer_than_signal_only`
- `reporting_and_follow_through_required = true`

Beslissing:

- latere MTO-waves mogen niet terugvallen naar een te lichte scanbetekenis

### MTO Suite Boundary Contract

- `does_not_replace_live_routes_now = true`
- `does_not_open_public_activation_now = true`
- `must_remain_koppelbaar_to_existing_suite_later = true`

Beslissing:

- MTO moet eerst naast de bestaande suite kunnen bestaan voordat koppeling of vervanging wordt overwogen

## Testplan

### Product boundary test

- [x] MTO blijft een nieuwe hoofdproductlijn en geen add-on op bestaande scans
- [x] MTO blijft zwaarder dan de huidige bounded surveyproducten
- [x] MTO wordt nog niet live default of buyer-facing hoofdroute

### Suite distinction test

- [x] `ExitScan` blijft vertrekroute
- [x] `RetentieScan` blijft bounded behoudsroute
- [x] `Pulse` blijft reviewlaag
- [x] `TeamScan` blijft lokalisatielaag
- [x] `Leadership Scan` blijft bounded managementcontextroute

### Operating model test

- [x] MTO hergebruikt de bestaande product- en docsstructuur
- [x] MTO opent geen brede repo-refactor
- [x] internal-first isolatie blijft expliciet

### Smoke-validatie

#### Scenario 1

Een stakeholder wil MTO direct als nieuwe publieke hoofdroute lanceren.

- Resultaat: afwijzen
- Waarom: MTO is in deze track internal-first en nog niet live-leading

#### Scenario 2

Een stakeholder wil MTO behandelen als "RetentieScan maar uitgebreider".

- Resultaat: afwijzen
- Waarom: MTO is een eigen productlijn en geen capability-uitbreiding op bestaande scans

#### Scenario 3

Een stakeholder wil MTO meteen de live suite laten vervangen.

- Resultaat: afwijzen
- Waarom: deze track bouwt MTO eerst geisoleerd en intern op

#### Scenario 4

Een stakeholder wil MTO in dezelfde branch en lopende PR-stroom bouwen.

- Resultaat: afwijzen
- Waarom: isolatie van de bestaande flow is een harde randvoorwaarde

## Assumptions/Defaults

- MTO wordt de nieuwe toekomstige hoofdmeting van Verisight
- MTO blijft eerst intern / assisted
- de bestaande live suite blijft voorlopig operationeel leidend
- MTO moet later koppelbaar blijven aan de bestaande suite
- `Customer Feedback` / `NPS` blijft voorlopig een aangrenzende latere capability en geen onderdeel van de eerste MTO-openingsreeks
- de volgende stap werkt de system- en datagrenzen uit, maar opent nog geen build

## Product Acceptance

- [x] MTO heeft een unieke en niet-overlappende productdefinitie
- [x] MTO is expliciet zwaarder dan de bestaande bounded scans
- [x] MTO is als future-core route vastgezet zonder het huidige proces te verstoren

## Codebase Acceptance

- [x] Deze stap blijft documentgedreven
- [x] De beslissingen sluiten aan op de bestaande Verisight-modulaire productstructuur
- [x] Er is nog geen runtime- of productcode gewijzigd

## Runtime Acceptance

- [x] Geen MTO-runtimewijzigingen
- [x] Geen buyer-facing activatie
- [x] Geen verstoring van bestaande scanflows

## QA Acceptance

- [x] De MTO-track is bestuurlijk scherp genoeg afgebakend om scopelek te voorkomen
- [x] De relatie met de bestaande suite is expliciet en toetsbaar
- [x] Isolatie van de bestaande flow is als harde randvoorwaarde vastgelegd

## Documentation Acceptance

- [x] Dit document kan dienen als source of truth voor MTO entry- en boundarybeslissingen
- [x] Het document eindigt met een duidelijke gate naar de volgende stap

## Not In This Step

- Geen MTO-build wave
- Geen `scan_type = mto`
- Geen schema-uitbreiding
- Geen dashboard- of reportimplementatie
- Geen routeactivatie of pricingwerk

## Exit Gate

Deze stap is afgerond omdat:

- [x] MTO als nieuwe productlijn is vastgezet
- [x] MTO als zwaardere hoofdmeting is vastgezet
- [x] internal-first en suite-isolatie expliciet zijn vastgezet
- [x] de relatie met bestaande routes expliciet is begrensd
- [x] de volgende stap scherp is afgebakend

## Next Step After Approval

Na goedkeuring van deze stap volgt:

- `PHASE_NEXT_STEP_31_MTO_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md`

Verplichte inputs voor die stap:

- MTO fit contract
- MTO weight contract
- MTO suite boundary contract
- harde regel dat de volgende stap alleen system- en datagrenzen uitwerkt en nog geen MTO build opent
