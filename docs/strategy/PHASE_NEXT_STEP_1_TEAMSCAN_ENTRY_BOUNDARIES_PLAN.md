# Phase Next Step 1 - TeamScan Entry and Boundaries Plan

## Title

Lock TeamScan as the next controlled productline by fixing its entry logic, product boundary, and relationship to existing segmentation before any TeamScan architecture or build starts.

## Korte Summary

Deze stap opent `TeamScan` nog niet als build wave. Het document doet eerst wat bij `Pulse` ook nodig was: de productgrens, entryregels en non-entryregels decision-complete vastzetten op basis van de huidige implementatie.

De huidige codebase laat al zien dat team- en leidingcontext inhoudelijk terugkomen, maar nog niet als zelfstandige productlijn:

- `scan_type` ondersteunt nu alleen `exit`, `retention` en `pulse` in [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts) en [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- respondentmetadata bevat nu alleen `department`, `role_level`, `exit_month` en `annual_salary_eur` in [backend/models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- importnormalisatie behandelt `team` vandaag als alias van `department` in [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- huidige segmentverdieping draait alleen op `department` en `role_level` en leeft als add-on / verdieping binnen bestaande lijnen, niet als eigen product in [frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx) en [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- privacygrenzen bestaan al op drie niveaus: `MIN_N_DISPLAY = 5`, `MIN_N_PATTERNS = 10` en `MIN_SEGMENT_N = 5`

De kernbeslissing van deze stap is daarom:

- `TeamScan` wordt de volgende productlijn na `Pulse`
- `TeamScan` wordt behandeld als lokalisatielaag, niet als nieuwe brede diagnose
- `TeamScan` is niet hetzelfde als `Segment Deep Dive`
- de huidige codebase dwingt een smalle startdefinitie af: in v1 betekent `team` primair de bestaande `department`-boundary, niet automatisch `manager` of `location`

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen TeamScan-build gestart
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

Na `WAVE_04_PULSE_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md` is `Pulse` publiek en productmatig voldoende scherp. Maar `TeamScan` is inhoudelijk moeilijker dan `Pulse`, omdat het direct raakt aan:

- bestaande segmentvergelijking
- bestaande playbooks over teams en leidingcontext
- huidige metadata-beperkingen
- privacy- en suppressieregels op kleine groepen

Zonder deze stap zou TeamScan te makkelijk verward kunnen worden met:

- een herlabelde `Segment Deep Dive`
- een extra filterlaag bovenop `RetentieScan`
- een generieke manager- of leiderschapsscan
- een teamtool zonder eerder organisatiebreed signaal

Deze stap voorkomt dat door nu al vast te zetten:

- wanneer TeamScan wel en niet logisch is
- wat TeamScan anders maakt dan huidige segmentverdieping
- welke boundary in de huidige codebase realistisch is
- welke dingen expliciet nog niet beloofd of gebouwd mogen worden

## Current Implementation Baseline

### 1. Runtime and type reality

- [x] `scan_type` kent nu alleen `exit`, `retention` en `pulse`
- [x] er bestaat nog geen `team` registry, productspecifieke module of dashboardflow
- [x] huidige dashboard- en reportlogica zijn campaign-centered en product-centered, niet generiek team-centered

### 2. Current respondent metadata reality

- [x] huidige respondentmetadata: `department`, `role_level`, `exit_month`, `annual_salary_eur`
- [x] er is geen apart `manager`, `location`, `team_id` of `leadership_context` veld
- [x] importmapping normaliseert `team` naar `department`
- [x] `role_level` heeft wel vaste aliasnormalisatie, maar is geen team-identifier

### 3. Current segmentation reality

- [x] `Segment Deep Dive` is een add-on, geen zelfstandige productlijn
- [x] huidige segmentplaybooks zijn alleen zichtbaar voor `retention`
- [x] huidige segmentgroepen bouwen alleen op `department` en `role_level`
- [x] segmentweergave is beschrijvend en gebonden aan minimale n-grenzen

### 4. Current privacy and suppression reality

- [x] detailweergave start pas vanaf `5` responses
- [x] patroonanalyse start pas vanaf `10` responses
- [x] segmentvergelijking gebruikt minimaal `5` responses per groep
- [x] huidige copy is al terughoudend over kleine groepen, teamcontext en managercontext

## Decision

### 1. TeamScan Product Definition

`TeamScan` wordt vastgezet als:

- een toekomstige zelfstandige `productline`
- bedoeld voor lokalisatie van een al eerder zichtbaar signaal
- gericht op team- of leidingcontext waar eerst verdiept, geverifieerd of ingegrepen moet worden

Primary management question:

- `Waar speelt het al zichtbare signaal het eerst of het scherpst, en welke team- of leidingcontext vraagt als eerste verdieping of actie?`

Secondary management question:

- `Welke lokale context moet als eerste worden geverifieerd, ondersteund of gecorrigeerd nadat de bredere organisatieread al duidelijk is?`

Beslissing:

- `TeamScan` is geen eerste brede diagnose
- `TeamScan` is geen generieke teamtool
- `TeamScan` is geen leadership scan
- `TeamScan` is een lokalisatielaag na bredere signalering

### 2. TeamScan Entry Rule

`TeamScan` mag niet als eerste standaardroute worden geopend.

Wel logisch als vervolgstap wanneer:

- een breder organisatiebeeld al bestuurlijk leesbaar is gemaakt via `ExitScan`, `RetentieScan` of `Pulse`
- management al weet welk thema prioriteit heeft
- de volgende vraag vooral lokaal is: waar zit het het scherpst en welke context eerst?
- er voldoende metadata en voldoende n bestaan om lokale uitsplitsing verantwoord te tonen

Niet logisch als eerste route wanneer:

- de organisatie de brede diagnose nog niet heeft
- de buyer vooral een algemene teamtool zoekt
- de buyer vooral een MTO-vervanger of managerbeoordeling zoekt
- er te weinig metadata is om teamcontext veilig te onderscheiden

Beslissing:

- `TeamScan` blijft niet-entry by default
- de default handoff naar TeamScan loopt via `RetentieScan` of `Pulse`
- een latere uitzondering op deze regel wordt in deze stap niet geopend

### 3. TeamScan Boundary vs Existing Products

#### TeamScan versus RetentieScan

- `RetentieScan` zegt waar behoud op groeps- en segmentniveau onder druk staat
- `TeamScan` zegt waar het al zichtbare signaal lokaal het scherpst speelt

Beslissing:

- `RetentieScan` blijft de bredere group-level signalering
- `TeamScan` wordt de lokalisatielaag erna

#### TeamScan versus Pulse

- `Pulse` volgt of een bestaand signaal verschuift na diagnose, baseline of actie
- `TeamScan` lokaliseert waar dat signaal lokaal eerst onderzocht of aangepakt moet worden

Beslissing:

- `Pulse` = monitor
- `TeamScan` = localize

#### TeamScan versus Segment Deep Dive

- `Segment Deep Dive` blijft een add-on binnen bestaande producten
- `TeamScan` wordt een zelfstandige productlijn met eigen survey-, output- en handofflogica

Beslissing:

- `Segment Deep Dive` is descriptieve verdieping binnen `RetentieScan` of `ExitScan`
- `TeamScan` wordt niet gebouwd als herlabelde segmentkaart of extra filter

### 4. Default Boundary Choice For TeamScan v1

Op basis van de huidige codebase wordt de default TeamScan-v1 boundary als volgt vastgezet:

- `primary_team_boundary = department`
- `secondary_context_boundary = role_level`
- `manager` is nog geen ondersteunde primaire boundary
- `location` is nog geen ondersteunde primaire boundary

Rationale:

- `department` bestaat al in runtime, import en rapportage
- `team` normaliseert vandaag al naar `department`
- `role_level` bestaat al als extra contextlaag
- `manager` en `location` bestaan nu niet als respondentmetadata en mogen in deze stap dus niet als v1-default worden beloofd

Beslissing:

- TeamScan v1 plant primair op `department`-niveau
- `role_level` mag later alleen als secundaire context meelezen
- mogelijke metadata-uitbreiding naar `manager` of `location` hoort pas thuis in `PHASE_NEXT_STEP_2_TEAMSCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md`

### 5. TeamScan Privacy Boundary

De huidige suppressielogica wordt de minimale startgrens voor TeamScan-planning:

- `minimum_detail_n = 5`
- `minimum_pattern_n = 10`
- `minimum_local_group_n = 5`

Beslissing:

- TeamScan mag in de planningsfase geen lagere drempels krijgen dan huidige segmentweergave
- TeamScan mag niet impliceren dat kleinere teams standaard veilig leesbaar zijn
- TeamScan moet privacy- en suppressielogica minstens even streng behandelen als huidige `Segment Deep Dive`

### 6. TeamScan Output Boundary

Voor TeamScan wordt alvast vastgezet wat het product later wél en niet moet opleveren.

Wel bedoeld voor:

- lokale prioritering
- teamcontextduiding
- eerste lokale eigenaar
- eerste lokale actie
- expliciete verificatie- of interventievraag

Niet bedoeld voor:

- individuele scorekaarten
- manager ranking
- performance-beoordeling
- causaliteitsclaim op teamniveau
- brede cultuurdiagnose zonder eerdere organisatieread

Beslissing:

- TeamScan-output moet managementwaardig maar terughoudend zijn
- lokale teamcontext mag niet worden verkocht als hard bewijs

## Key Changes

- `TeamScan` is nu scherp vastgezet als volgende productlijn na `Pulse`
- de entryregel is gesloten: TeamScan is geen default eerste route
- de relatie met `RetentieScan`, `Pulse` en `Segment Deep Dive` is inhoudelijk uitgesplitst
- de v1-boundary is gelockt op wat de huidige codebase echt ondersteunt: `department` primair, `role_level` secundair
- privacy- en suppressiegrenzen worden niet losgetrokken van bestaande segmentrealiteit

## Belangrijke Interfaces/Contracts

### TeamScan Fit Contract

- `productline = TeamScan`
- `primary_management_question`
- `secondary_management_question`
- `entry_rule`
- `non_entry_rule`
- `best_follow_on_from`
- `not_for`

Beslissing:

- dit contract is verplicht input voor alle volgende TeamScan-documenten

### Team Boundary Contract

- `primary_team_boundary = department`
- `secondary_context_boundary = role_level`
- `unsupported_v1_boundaries = manager, location`
- `team_alias_behavior = team -> department`

Beslissing:

- Step 2 mag deze boundary technisch uitwerken, maar niet ongemotiveerd verbreden

### Team Privacy Contract

- `minimum_detail_n = 5`
- `minimum_pattern_n = 10`
- `minimum_local_group_n = 5`
- `suppression_required_when_group_too_small = true`

Beslissing:

- toekomstige TeamScan-waves moeten minstens deze ondergrenzen respecteren

### TeamScan Handoff Contract

- `allowed_handoff_from = retention, pulse, exit`
- `preferred_handoff_from = retention, pulse`
- `handoff_trigger = broad signal already readable, next question becomes local`

Beslissing:

- TeamScan hoort niet parallel met de eerste organisatieread te worden verkocht

## Work Breakdown

### Step 1A - Lock the product boundary

- [x] Definieer TeamScan als lokalisatielaag
- [x] Sluit diagnose-, manager-tool- en leadership-scan overlap expliciet uit
- [x] Leg de kernmanagementvraag vast

Definition of Done:

- [x] TeamScan heeft een unieke en niet-overlappende productdefinitie

### Step 1B - Lock entry and non-entry rules

- [x] Leg vast wanneer TeamScan wel logisch wordt
- [x] Leg vast wanneer TeamScan expliciet niet logisch is
- [x] Koppel TeamScan aan een eerdere organisatieread

Definition of Done:

- [x] TeamScan heeft harde entry- en non-entryregels

### Step 1C - Lock the current team boundary

- [x] Benoem welke metadata nu echt beschikbaar is
- [x] Kies de v1-default boundary op basis van huidige implementatie
- [x] Sluit unsupported boundaries expliciet uit voor v1-planning

Definition of Done:

- [x] De v1-boundary is gelockt op repo-realiteit, niet op wensbeeld

### Step 1D - Lock the follow-on step

- [x] Benoem welke technische en datagrenzen de volgende stap moet uitwerken
- [x] Leg vast welke vragen bewust nog niet in deze stap worden opgelost

Definition of Done:

- [x] De overgang naar Step 2 is scherp en beperkt

## Testplan

### Reviewtest

- [x] Gecontroleerd dat `TeamScan` niet samenvalt met huidige `Segment Deep Dive`
- [x] Gecontroleerd dat huidige team-/leidingcontext nu vooral in copy en playbooks zit, niet als eigen product
- [x] Gecontroleerd dat huidige metadata alleen `department` en `role_level` structureel ondersteunt

### Boundary Distinctness Test

- [x] `RetentieScan` blijft broad signal
- [x] `Pulse` blijft monitoringlaag
- [x] `TeamScan` wordt lokalisatielaag
- [x] `Segment Deep Dive` blijft add-on

### Metadata Reality Test

- [x] `team` alias normaliseert nu naar `department`
- [x] `manager` bestaat niet als respondentveld
- [x] `location` bestaat niet als respondentveld
- [x] `role_level` bestaat wel, maar niet als teamidentifier

### Privacy Boundary Test

- [x] huidige suppressiegrenzen zijn expliciet overgenomen als minimale TeamScan-startgrens
- [x] TeamScan plant geen lagere teamgrenzen dan huidige segmentlogica

### Smoke-validatie

#### Scenario 1

Een buyer wil direct een generieke teamtool.

- Resultaat: afwijzen
- Waarom: TeamScan is geen eerste brede teamtool

#### Scenario 2

Een klant heeft RetentieScan gedaan en wil nu weten in welke afdelingen het signaal het scherpst speelt.

- Resultaat: TeamScan logisch
- Waarom: brede signalering is al gebeurd, volgende vraag is lokaal

#### Scenario 3

Een klant heeft alleen `role_level`, maar geen `department`.

- Resultaat: onvoldoende voor TeamScan-v1 als primaire teamroute
- Waarom: `role_level` blijft secundaire context, geen primaire teamboundary

#### Scenario 4

Een klant wil TeamScan op managers draaien.

- Resultaat: nog niet toegestaan als v1-default
- Waarom: `manager` bestaat niet als huidige respondentboundary

#### Scenario 5

Een klant wil TeamScan gebruiken als vervanging van `Segment Deep Dive`.

- Resultaat: afwijzen
- Waarom: TeamScan moet zelfstandige productwaarde hebben, niet alleen descriptieve segmentuitvergroting

## Assumptions/Defaults

- `TeamScan` is de logische volgende productlijn na `Pulse`
- `TeamScan` wordt behandeld als lokalisatielaag, niet als brede diagnose
- `Segment Deep Dive` blijft add-on binnen bestaande lijnen
- buyer-facing TeamScan blijft gesloten
- TeamScan-v1 plant primair op `department`
- uitbreiding naar `manager` of `location` blijft expliciet open vraag voor Step 2 en nog geen commitment

## Product Acceptance

- [x] TeamScan heeft een unieke managementvraag
- [x] TeamScan overlapt niet met `RetentieScan`, `Pulse` of `Segment Deep Dive`
- [x] TeamScan is helder gepositioneerd als follow-on route na bredere signalering

## Codebase Acceptance

- [x] Deze stap blijft volledig documentgedreven
- [x] De boundary volgt huidige schema-, import- en dashboardrealiteit
- [x] Er is nog geen nieuwe TeamScan-runtime of metadata-uitbreiding gebouwd

## Runtime Acceptance

- [x] Geen TeamScan-runtimewijzigingen
- [x] Geen routeactivatie
- [x] Geen pricing- of entitlementwijziging

## QA Acceptance

- [x] De huidige codebase is expliciet beoordeeld op team-, segment- en metadatarealiteit
- [x] Het document bevat concrete smoke-situaties voor latere TeamScan-waves
- [x] De boundary is scherp genoeg om scopelek te voorkomen

## Documentation Acceptance

- [x] Dit document kan dienen als source of truth voor TeamScan entry- en boundarybeslissingen
- [x] Het document eindigt met een duidelijke gate naar de volgende stap

## Not In This Step

- Geen TeamScan-build wave
- Geen `scan_type = team`
- Geen schema-uitbreiding
- Geen marketing- of pricingactivatie
- Geen entitlement- of navigatieverbreding

## Exit Gate

Deze stap is afgerond omdat:

- [x] TeamScan als productgrens is vastgezet
- [x] entry- en non-entryregels zijn vastgezet
- [x] de v1-teamboundary op repo-realiteit is gelockt
- [x] privacy- en suppressiegrenzen expliciet zijn overgenomen
- [x] de volgende stap scherp is afgebakend

## Next Step After Approval

Na goedkeuring van deze stap volgt:

- `PHASE_NEXT_STEP_2_TEAMSCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md`

Verplichte inputs voor die stap:

- TeamScan fit contract
- team boundary contract
- team privacy contract
- handoff contract
- harde regel dat Step 2 alleen systeem- en datagrenzen uitwerkt en nog geen TeamScan build opent
