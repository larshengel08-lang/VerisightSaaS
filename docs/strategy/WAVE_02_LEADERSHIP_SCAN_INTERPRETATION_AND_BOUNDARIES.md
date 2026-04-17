# WAVE_02_LEADERSHIP_SCAN_INTERPRETATION_AND_BOUNDARIES

## Title

Turn the Leadership Scan foundation slice into a sharper and safer management-context read with explicit interpretation boundaries, without drifting into named leader output, 360 logic, or performance framing.

## Korte Summary

`WAVE_01` bewees dat `Leadership Scan` als zesde runtime-product technisch en productmatig kan landen binnen de bestaande Verisight-runtime: admin setup, surveyflow, submit-validatie, scoring, dashboardread en PDF-boundary werken nu end-to-end. Wat nog ontbreekt is de methodische scherpte van de output zelf: management ziet nu al een geaggregeerde managementsnapshot, maar nog niet duidelijk genoeg wat dat beeld precies betekent, hoe `leadership_signal_score` en `leadership_direction_score` samen gelezen moeten worden, en waar de grens ligt tussen "bruikbare managementcontext-read" en "te sterke claim over leidinggevenden of leiderschapskwaliteit".

Deze wave blijft daarom bewust smal:

- geen named leader model
- geen `manager_id`, hierarchy of reporting-line logica
- geen 360- of coachingtaxonomie
- wel een expliciete interpretation layer boven op de bestaande `leadership_summary`
- wel duidelijkere boundary-copy in dashboard, page helpers en productspecifieke taal
- wel scherpere distinction met `TeamScan`, de bestaande factor `leadership` en algemene managementcopy in andere productlijnen

Status van deze wave:

- Wave status: implemented_green
- Active source of truth after approval: dit document
- Build permission: approved_for_execution
- Dependencies: `WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE.md` moet groen blijven
- Next allowed wave after green completion: `WAVE_03_LEADERSHIP_SCAN_MANAGEMENT_OUTPUT_AND_HANDOFF.md`

## Why This Wave Now

Deze wave volgt direct uit wat nu al in de codebase bestaat:

- Leadership Scan heeft al een eerste dashboard view model in [dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/dashboard.ts)
- dat model leest nu al `averageSignal`, `stayIntent`, topfactoren en `hasMinDisplay` / `hasEnoughData`
- de backend levert al `leadership_summary`, `leadership_context_summary` en `signal_patterns` via [scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/leadership/scoring.py)
- de productspecifieke copy zegt al terecht dat Leadership Scan group-level only is, maar de interpretatie is nog te algemeen en te dicht tegen generieke managementtaal aan
- de huidige output is nog te kwetsbaar voor overlap met:
  - `TeamScan` als lokalisatielaag
  - de bestaande factor `leadership`
  - impliciete performance- of quality-claims over leiderschap

Daarmee is `WAVE_02` de logische vervolgstap:

- niet opnieuw de foundation verbreden
- nog niet `WAVE_03` openen
- eerst zorgen dat de huidige Leadership-output semantisch, methodisch en UX-matig klopt

## Planned User Outcome

Na deze wave moet een Verisight-beheerder of klantgebruiker:

- een Leadership Scan-campaign nog steeds als group-level managementread kunnen openen
- expliciet zien hoe dit leadershipbeeld gelezen moet worden
- onderscheid kunnen maken tussen:
  - overwegend stabiele managementcontext
  - actief aandachtspunt in managementcontext
  - scherp managementsignaal dat eerste verificatie of correctie vraagt
- zien hoe de managementrichtingsvraag meeleest zonder named leader of predictorclaim
- expliciet kunnen lezen welke claims buiten scope blijven

Wat deze wave nog niet hoeft te leveren:

- named leader output
- manager- of teamniveau ranking
- reporting-line of org-chart logica
- 360- of multi-rater model
- buyer-facing routeactivatie
- Leadership Scan PDF-output
- volledige owner/action handoff van `WAVE_03`

## Scope In

- expliciete interpretation helperlaag boven op de bestaande Leadership Scan metrics
- begrensde combinatie van huidig leadershipsignaal + managementrichtingsvraag
- leadership-specific interpretation states, bijvoorbeeld:
  - `insufficient_management_read`
  - `stable_management_context`
  - `attention_management_context`
  - `high_attention_management_context`
- expliciete boundary-copy: wat Leadership Scan wel en niet zegt
- aanscherping van Leadership dashboardcopy, labels en decision cards
- duidelijkere distinction tussen geaggregeerde managementcontext en named leaders
- tests voor interpretation states, boundary-copy en methodische guardrails
- docs-update van deze wave en relevante source-of-truth pointers

## Scope Out

- named leader readouts
- `manager_id`, hierarchy of reporting-line support
- 360-, coaching- of traininglogica
- buyer-facing Leadership routeactivatie in marketing of pricing
- Leadership Scan PDF/reportgenerator
- generieke cross-product interpretation engine
- brede owner/action handoff buiten de current managementread

## Dependencies

- [PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_13_LEADERSHIP_SCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_13_LEADERSHIP_SCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_14_LEADERSHIP_SCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_14_LEADERSHIP_SCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md)
- [WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE.md)

## Current Implementation Baseline

### 1. Backend output that already exists

- `leadership_summary` bevat nu:
  - `leadership_signal_score`
  - `leadership_signal_band`
  - `leadership_direction_score`
  - `snapshot_type = current_management_context_cycle`
  - `context_scope = group_level_only`
  - `boundary_state = named_leader_output_forbidden`
- `leadership_context_summary` bevat nu:
  - `management_scope = group_level_only`
  - `allowed_context = ["department", "role_level"]`
  - `named_leader_output = false`
  - `identity_model = none`
- `signal_patterns` bevat nu alleen factorniveau-output, nog zonder scherpere interpretation layer

### 2. Frontend output that already exists

- Leadership heeft al een eerste dashboardmodule in [dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/dashboard.ts)
- die module toont nu al:
  - `Managementread nu`
  - `Boundary`
  - `Primair managementspoor`
  - `Eerste eigenaar`
  - `Richting nu`
  - `Privacygrens`
- de huidige taal is bruikbaar voor `WAVE_01`, maar nog te generiek om Leadership Scan als methodisch scherp product te dragen

### 3. Boundary reality that must stay intact

- Leadership Scan blijft group-level only
- named leader output blijft verboden
- Leadership Scan mag niet samenvallen met:
  - `TeamScan`
  - `segment deep dive`
  - generieke performance- of management quality claims

## Key Changes

- Leadership Scan blijft technisch hetzelfde product, maar krijgt nu een expliciete interpretation layer boven op de huidige snapshot.
- De dashboardread benoemt scherper wat stabiel, gemengd of scherp betekent binnen een geaggregeerde managementcontext.
- De combinatie van `leadership_signal_score` en `leadership_direction_score` wordt productspecifiek uitgelegd zonder named leader, performance- of causaliteitsclaim.
- Boundary-copy wordt prominenter in de Leadership-output zelf, zodat het product minder makkelijk verkeerd gelezen wordt.

## Belangrijke Interfaces/Contracts

### 1. Leadership Interpretation Contract

`WAVE_02` voegt een expliciete interpretation layer toe boven op de bestaande Leadership Scan metrics:

- `leadership_signal_score`
- `leadership_signal_band`
- `leadership_direction_score`
- topfactoren uit `factorAverages`

De helper levert minimaal:

- `managementContextState`
- `managementReadValue`
- `managementReadBody`
- `directionValue`
- `directionBody`
- `boundaryValue`
- `boundaryBody`

Beslissingen:

- geen nieuwe backend metric zolang interpretatie veilig uit bestaande output kan worden afgeleid
- helper blijft Leadership-specifiek; geen generieke cross-product interpretation engine

### 2. Leadership State Contract

Toegestane state-waarden in deze wave:

- `insufficient_management_read`
- `stable_management_context`
- `attention_management_context`
- `high_attention_management_context`

Beslissingen:

- de state is een managementread, geen oordeel over individuele leiders
- kleine metricverschillen leiden niet automatisch tot zwaardere taal zonder duidelijke productreden

### 3. Direction Read Contract

De managementrichtingsvraag blijft ondersteunend aan de Leadership-read, niet dragend voor een zelfstandige claim.

Beslissingen:

- een lage `leadership_direction_score` kan aandacht versterken
- een hogere `leadership_direction_score` kan een stabieler managementbeeld ondersteunen
- de richtingsvraag overrult de rest van de Leadership-output niet alsof dit een predictor is

### 4. Interpretation Boundary Contract

De UI blijft expliciet zeggen dat Leadership Scan:

- groepsniveau is
- managementcontextgebonden is
- geen named leader readout is
- geen 360-instrument is
- geen performance-oordeel is
- geen bewijs van individuele leiderschapskwaliteit is

Beslissingen:

- boundary-copy zit zichtbaar in de leadershipread zelf
- bij ambiguiteit wint boundary boven schijnprecisie

### 5. Data Strength Contract

De bestaande thresholds uit de dashboardflow blijven leidend:

- onder minimum display: geen stevige leadershipread
- tussen minimum display en pattern strength: wel een indicatieve managementread
- boven pattern strength: stevigere managementduiding, nog steeds zonder named leader of hierarchyclaim

Beslissingen:

- `WAVE_02` verandert de thresholds niet
- de wave maakt alleen scherper hoe de UI die thresholds uitlegt

## Primary Code Surfaces

### Existing Surfaces To Extend

- [frontend/lib/products/leadership/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/dashboard.ts)
- [frontend/lib/products/leadership/dashboard.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/dashboard.test.ts)
- [frontend/lib/products/leadership/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/definition.ts)
- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx)

### Existing Runtime Reads To Reuse

- huidige `campaign_stats` read
- bestaande Leadership `DashboardViewModel` input
- huidige `leadership_summary` in `full_result`
- bestaande `hasMinDisplay` en `hasEnoughData` thresholds uit de dashboardflow

### Test Surfaces

- [frontend/lib/products/leadership/dashboard.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/dashboard.test.ts)
- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.test.ts) if helper logic grows
- [tests/test_api_flows.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py) only if smoke fixtures need extra leadership interpretation coverage

## Work Breakdown

### Track 1 - Management Interpretation Helper

Tasks:

- [x] Breid het Leadership dashboardmodel uit met expliciete interpretation states.
- [x] Definieer hoe `averageSignal` en `stayIntent` samen gelezen worden zonder named leader of performance-overclaim.
- [x] Voeg expliciete fallback toe voor `insufficient_management_read`.
- [x] Houd de huidige `WAVE_01` group-level boundary intact.

Definition of done:

- [x] Het Leadership dashboardmodel levert een reproduceerbare interpretation state.
- [x] De helper gebruikt alleen bestaande metrics en thresholds.
- [x] Geen nieuwe backend endpoint of identity object is nodig.

### Track 2 - Dashboard Copy and Boundary Layer

Tasks:

- [x] Werk Leadership titles, summary cards en decision copy bij naar scherpere managementcontexttaal.
- [x] Maak expliciet wat stabiel, gemengd of scherp betekent binnen Leadership Scan.
- [x] Voeg zichtbare boundary-copy toe voor wat Leadership Scan niet claimt.
- [x] Houd de group-level only scope overal consistent.

Definition of done:

- [x] Een Leadership-campaign toont een duidelijkere managementread.
- [x] De UI maakt helder wat dit leadershipbeeld bestuurlijk betekent.
- [x] De UI voorkomt named leader, hierarchy en performance-overinterpretatie.

### Track 3 - Distinction With TeamScan and Factor Language

Tasks:

- [x] Zorg dat Leadership copy duidelijker onderscheid maakt tussen managementcontext en department-first lokalisatie.
- [x] Maak zichtbaar dat de bestaande factor `leadership` niet hetzelfde is als Leadership Scan als productlijn.
- [x] Houd deze laag bewust compact; brede handoff en first owner/action polish blijft voor `WAVE_03`.

Definition of done:

- [x] De productervaring voelt methodisch consistenter tussen leadershipstate, focusvragen en boundaries.
- [x] Leadership Scan schuift niet terug naar een herlabelde factor-tab of naar TeamScan-taal.

### Track 4 - Tests, Docs, and Validation

Tasks:

- [x] Voeg tests toe voor alle leadership interpretation states.
- [x] Voeg tests toe voor boundary-copy bij lage datasterkte.
- [x] Werk dit wave-document bij tijdens uitvoering.
- [x] Voer een gescripte smoke-validatie uit voor minstens:
  - onvoldoende data
  - laag signaal / steunende richting
  - midden signaal / gemengde richting
  - hoog signaal / lage richting

Definition of done:

- [x] De leadership interpretation logic is getest op sterke en zwakke reads.
- [x] Smoke-validatie bewijst dat Leadership Scan niet te hard claimt.
- [x] Documentatie is synchroon met de feitelijke implementatie.

## Testplan

### Automated Tests

- [x] `stable_management_context` verschijnt bij overwegend stabiel signaal en veilige data
- [x] `attention_management_context` verschijnt bij leesbaar maar gemengd managementspoor
- [x] `high_attention_management_context` verschijnt bij scherp managementsignaal
- [x] `insufficient_management_read` verschijnt onder de huidige display-threshold
- [x] de direction read versterkt interpretatie maar verandert Leadership niet in named leader of predictorlogica
- [x] bestaande tests voor exit, retention, pulse, team en onboarding blijven groen

### Integration Checks

- [x] Leadership-campaign met voldoende data toont een expliciete management interpretation state
- [x] Leadership-campaign onder pattern strength blijft begrensd indicatief
- [x] Leadership-campaign toont nog steeds geen PDF/report
- [x] de campaign page blijft coherent zonder named leader of hierarchy-objecten

### Smoke Path

1. Maak of simuleer een Leadership-campaign met onvoldoende data.
2. Simuleer een checkpoint met laag signaal en steunende richting.
3. Simuleer een checkpoint met middensignaal en gemengde richting.
4. Simuleer een checkpoint met hoog signaal en lage richting.
5. Controleer dat de interpretation state, boundary-copy en vervolgrichting per scenario logisch meeschuiven.
6. Controleer dat Leadership PDF/report buiten scope blijft.

## Assumptions/Defaults

- `WAVE_02` blijft volledig binnen de bestaande campaign-centered architectuur.
- Leadership blijft `group_level_only`.
- de huidige thresholds voor display en pattern strength blijven leidend.
- de managementrichtingsvraag blijft een bounded interpretatiespoor, niet een named leader of predictorinstrument.
- als signaal en richtingsvraag niet netjes dezelfde kant op wijzen, wint voorzichtige uitleg boven schijnzekerheid.
- `WAVE_02` maakt Leadership methodisch scherper, maar opent nog niet de bredere managementhandoff van `WAVE_03`.

## Product Acceptance

- [x] Leadership voelt na deze wave aantoonbaar meer als een scherp managementcontextproduct en minder als een generieke snapshot
- [x] management ziet niet alleen de uitkomst, maar ook hoe die veilig gelezen moet worden
- [x] de productervaring blijft duidelijk verschillend van TeamScan, de losse factorlaag en performance-instrumenten

## Codebase Acceptance

- [x] de nieuwe logic blijft begrensd binnen leadership-specifieke helpers en page-integratie
- [x] er wordt geen generieke management interpretation engine vooruit gebouwd
- [x] `WAVE_01`-foundation en andere productlijnen blijven intact

## Runtime Acceptance

- [x] een Leadership-campaign kan een expliciete management interpretation state tonen
- [x] bij lage datasterkte toont de UI een duidelijke boundary in plaats van een te stevige lezing
- [x] Leadership PDF/report blijft buiten scope en veilig begrensd

## QA Acceptance

- [x] relevante tests zijn groen
- [x] de Leadership interpretation smoke-flow is succesvol uitgevoerd
- [x] de interpretatie voelt als managementcontextduiding, niet als named leader, hierarchy- of performanceclaim
- [x] semantische overlap met TeamScan en de bestaande factorlaag blijft expliciet begrensd

## Documentation Acceptance

- [x] dit wave-document blijft synchroon met de feitelijke implementatie
- [x] `WAVE_01` blijft gesloten en groen
- [x] het is na afronding duidelijk dat `WAVE_02` de actieve en daarna afgesloten source of truth was
- [x] `WAVE_03` opent pas na expliciete green close-out van deze wave

## Risks To Watch

- Leadership-read kan alsnog te veel gelezen worden als impliciet oordeel over individuele leidinggevenden
- de combinatie van signaal en richtingsvraag kan te mechanisch of te precies worden uitgelegd
- boundary-copy kan wegzakken zodra latere waves meer managementoutput toevoegen
- de implementatie kan ongemerkt richting hierarchy engine of 360-taxonomie schuiven
- de UX kan te dicht tegen TeamScan- of generieke managementtaal blijven hangen

## Not In This Wave

- Geen named leader output
- Geen `manager_id`, hierarchy of reporting lines
- Geen 360- of coachinglogica
- Geen Leadership PDF-output
- Geen buyer-facing Leadership route
- Geen brede owner/action handoff buiten current management interpretation

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] Leadership een expliciete management interpretation state kan tonen
- [x] de UI duidelijk maakt wat het leadershipbeeld wel en niet zegt
- [x] de combinatie van signaal en richtingsvraag methodisch bounded blijft
- [x] code, docs, tests en smoke-validatie groen zijn

## Validation Snapshot

- `cmd /c npm test` -> `89 passed`
- `cmd /c npx next typegen` -> groen
- `cmd /c npx tsc --noEmit` -> groen
- `cmd /c npm run build` -> groen
- `.\.venv\Scripts\python.exe -m pytest tests/test_leadership_scoring.py tests/test_api_flows.py -q` -> `41 passed`
- leadership smoke is state-driven afgedekt via `dashboard.test.ts` op:
  - onvoldoende data
  - laag signaal + steunende richting
  - middensignaal + gemengde richting
  - hoog signaal + lage richting

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_03_LEADERSHIP_SCAN_MANAGEMENT_OUTPUT_AND_HANDOFF.md`
