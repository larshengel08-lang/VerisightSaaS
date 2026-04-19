# WAVE_02_ONBOARDING_CHECKPOINT_INTERPRETATION_AND_BOUNDARIES

## Title

Turn the onboarding foundation slice into a sharper single-checkpoint read with explicit interpretation boundaries, without drifting into journey claims, retention prediction, or broader lifecycle orchestration.

## Korte Summary

`WAVE_01` bewees dat `Onboarding 30-60-90` als vijfde productline technisch en productmatig kan landen binnen de bestaande Verisight-runtime: admin setup, surveyflow, productspecifieke scoring, dashboardread en PDF-boundary werken end-to-end. Wat nog ontbrak was de methodische scherpte van de checkpoint-output zelf: management zag al een bruikbare snapshot, maar nog niet duidelijk genoeg wat dit checkpoint precies betekent, hoe signaal en richtingsvraag samen gelezen moeten worden, en waar de grens ligt tussen "vroege onboardingread" en "retentie- of journeyclaim".

Deze wave bleef daarom bewust smal:

- geen multi-checkpoint logica
- geen hire-date engine
- geen nieuwe lifecycle-objecten
- wel een expliciete interpretation layer boven op de bestaande onboarding-summary
- wel zichtbare boundary-copy in het dashboard zelf

Status van deze wave:

- Wave status: implemented_green
- Active source of truth after approval: dit document
- Build permission: uitgevoerd
- Dependencies: `WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE.md` blijft groen
- Next allowed wave after green completion: `WAVE_03_ONBOARDING_MANAGEMENT_OUTPUT_AND_HANDOFF.md`

Implementatiesamenvatting:

- onboarding heeft nu expliciete checkpoint states voor `insufficient`, `stable`, `attention` en `high_attention`
- de dashboardread laat nu explicieter zien hoe signaal en richtingsvraag samen gelezen moeten worden
- boundary-copy is zichtbaarder gemaakt op managementread-, profiel- en follow-upniveau
- de bestaande onboarding lifecycle guidance is aangescherpt zodat checkpointtaal en productcopy dezelfde begrenzing gebruiken
- repo-brede acceptance blockers in TeamScan- en report-preview-copy zijn mee rechtgetrokken zodat de green gate weer haalbaar werd

Validatiesnapshot:

- `cmd /c npm test` -> groen (`85 passed`)
- `cmd /c npm run build` -> groen
- `cmd /c npx next typegen` -> groen
- `cmd /c npx tsc --noEmit` -> groen
- `.\.venv\Scripts\python.exe -m pytest tests/test_onboarding_scoring.py tests/test_api_flows.py tests/test_portfolio_architecture_program.py -q` -> groen (`40 passed`)
- gerichte onboarding smoke via `lib/products/onboarding/dashboard.test.ts` dekt vier checkpointscenario's: onvoldoende data, stabiel, gemengd en scherp vroegsignaal

## Why This Wave Now

Deze wave volgde direct uit wat al in de codebase bestond:

- onboarding had al een eerste dashboard view model in [dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/dashboard.ts)
- dat model las al `averageSignal`, `stayIntent`, topfactoren en `hasMinDisplay` / `hasEnoughData`
- de UI zei al terecht dat onboarding een single-checkpoint read is, maar de interpretatie was nog te generiek
- de backend leverde al een compacte `onboarding_summary`, maar daarboven ontbrak nog een expliciete checkpoint-interpretatielaag

Daarmee was `WAVE_02` de logische vervolgstap: niet opnieuw foundation verbreden en ook nog niet `WAVE_03` openen, maar eerst zorgen dat de huidige checkpoint-output semantisch, methodisch en UX-matig klopt.

## Planned User Outcome

Na deze wave kan een Verisight-beheerder of klantgebruiker:

- een onboarding-campaign nog steeds als single-checkpoint read openen
- expliciet zien hoe dit checkpoint gelezen moet worden
- onderscheiden tussen:
  - overwegend stabiele instroomervaring
  - gemengd aandachtspunt
  - scherp vroegsignaal
- zien hoe de checkpoint-richtingsvraag meeleest zonder predictorclaim
- expliciet lezen welke claims buiten scope blijven

Wat deze wave nog niet levert:

- vergelijking tussen 30, 60 en 90 dagen
- cohort- of hire-date logica
- trend- of deltalogica tussen checkpoints
- buyer-facing onboardingroute
- onboarding PDF-output
- volledige owner/action handoff van `WAVE_03`

## Scope In

- een expliciete onboarding checkpoint interpretation helperlaag
- begrensde combinatie van huidig onboardingsignaal + checkpoint-richtingsvraag
- checkpoint states:
  - `stable_checkpoint`
  - `attention_checkpoint`
  - `high_attention_checkpoint`
  - `insufficient_checkpoint`
- expliciete boundary-copy: wat dit checkpoint wel en niet zegt
- aanscherping van onboarding dashboardcopy, labels en decision cards
- tests voor interpretatiestates, boundary-copy en methodische guardrails
- docs-update van deze wave en relevante source-of-truth pointers

## Scope Out

- multi-checkpoint orchestration
- hire-date, start-date of cohort-engine
- onboarding routeactivatie in marketing of pricing
- PDF/reportgenerator voor onboarding
- generieke lifecycle interpretation engine voor later
- TeamScan-, Pulse- of andere productuitbreiding
- brede managementhandoff en owner-routing buiten de current checkpointread

## Dependencies

- [PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_7_ONBOARDING_MASTER_INDEX_AND_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_7_ONBOARDING_MASTER_INDEX_AND_WAVE_STACK_PLAN.md)
- [WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE.md)

## Key Changes

- onboarding blijft `single_checkpoint_per_campaign`, maar heeft nu een scherpere interpretation layer boven op de huidige snapshot
- de dashboardread benoemt explicieter wat het checkpoint laat zien en welke veilige eerste lezing daarbij hoort
- de combinatie van `onboarding_signal_score` en `checkpoint_direction_score` wordt productmatig uitgelegd zonder nieuwe retentie- of journeyclaim
- boundary-copy is prominenter: onboarding zegt iets over deze fase nu, niet over individueel succes, latere uitstroom of de volledige first-90-days journey

## Belangrijke Interfaces/Contracts

### 1. Checkpoint Interpretation Contract

`WAVE_02` voegt een expliciete interpretation layer toe boven op de bestaande onboarding metrics:

- `onboarding_signal_score`
- `onboarding_signal_band`
- `checkpoint_direction_score`
- topfactoren uit `factorAverages`

De helper levert nu minimaal:

- `checkpointState`
- `managementReadValue`
- `managementReadBody`
- `directionValue`
- `directionBody`
- `boundaryValue`
- `boundaryBody`

Beslissingen:

- [x] geen nieuwe backend metric nodig zolang interpretatie veilig uit bestaande output kan worden afgeleid
- [x] helper blijft onboarding-specifiek; geen generieke cross-product interpretation engine

### 2. Checkpoint State Contract

Toegestane state-waarden in deze wave:

- `insufficient_checkpoint`
- `stable_checkpoint`
- `attention_checkpoint`
- `high_attention_checkpoint`

Beslissingen:

- [x] de state is een managementread, geen diagnostische classificatie
- [x] kleine metricverschillen leiden niet automatisch tot zwaardere taal zonder duidelijke productreden

### 3. Direction Read Contract

De checkpoint-richtingsvraag blijft ondersteunend aan de checkpointread, niet dragend voor een zelfstandige claim.

Beslissingen:

- [x] een lage `checkpoint_direction_score` kan aandacht versterken
- [x] een hogere `checkpoint_direction_score` kan een stabieler checkpoint ondersteunen
- [x] de richtingsvraag overrult de rest van de checkpoint-output niet alsof dit een predictor is

### 4. Interpretation Boundary Contract

De UI blijft expliciet zeggen dat onboarding:

- groepsniveau is
- fasegebonden is
- checkpointgebonden is
- geen performance-instrument is
- geen manageroordeel is
- geen retentievoorspelling is
- geen volledige 30-60-90 journeyread is

Beslissingen:

- [x] boundary-copy zit zichtbaar in de checkpointread zelf
- [x] bij ambiguiteit wint boundary boven schijnprecisie

### 5. Minimal Data Contract

De bestaande thresholds uit de dashboardflow blijven leidend:

- onder minimum display: geen stevige checkpointread
- tussen minimum display en pattern strength: wel een indicatieve checkpointread
- boven pattern strength: stevigere checkpointduiding, nog steeds zonder journeyclaim

Beslissingen:

- [x] `WAVE_02` verandert de thresholds niet
- [x] de wave maakt alleen scherper hoe de UI die thresholds uitlegt

## Primary Code Surfaces

### Existing Surfaces Extended

- [frontend/lib/products/onboarding/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/dashboard.ts)
- [frontend/lib/products/onboarding/dashboard.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/dashboard.test.ts)
- [frontend/lib/client-onboarding.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.ts)

### Existing Runtime Reads Reused

- huidige `campaign_stats` read
- bestaande onboarding `DashboardViewModel` input
- huidige `onboarding_summary` in `full_result`
- bestaande `hasMinDisplay` en `hasEnoughData` thresholds uit de dashboardflow

### Acceptance Repairs Closed In This Wave

- [frontend/lib/products/team/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts)
- [frontend/lib/report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts)

## Work Breakdown

### Track 1 - Checkpoint Interpretation Helper

Tasks:

- [x] Breid het onboarding dashboardmodel uit met expliciete checkpoint interpretation states.
- [x] Definieer hoe `averageSignal` en `stayIntent` samen gelezen worden zonder overclaiming.
- [x] Voeg expliciete fallback toe voor `insufficient_checkpoint`.
- [x] Houd de huidige `WAVE_01` snapshot boundary intact.

Definition of done:

- [x] Het onboarding dashboardmodel levert een reproduceerbare checkpoint interpretation state.
- [x] De helper gebruikt alleen bestaande metrics en thresholds.
- [x] Geen nieuwe backend endpoint of lifecycle object is nodig.

### Track 2 - Dashboard Copy and Boundary Layer

Tasks:

- [x] Werk onboarding titles, summary cards en decision copy bij naar scherpere checkpointtaal.
- [x] Maak expliciet wat stabiel, gemengd of scherp betekent binnen onboarding.
- [x] Voeg zichtbare boundary-copy toe voor wat onboarding niet claimt.
- [x] Houd de single-checkpoint scope overal consistent.

Definition of done:

- [x] Een onboarding-campaign toont een duidelijkere checkpointread.
- [x] De UI maakt helder wat dit checkpoint bestuurlijk betekent.
- [x] De UI voorkomt journey-, retentie- en performanceoverinterpretatie.

### Track 3 - Focus Question Alignment

Tasks:

- [x] Zorg dat onboarding focusvragen en playbookintro beter aansluiten op de nieuwe checkpointstate.
- [x] Maak duidelijk verschil tussen "borgen wat werkt" en "eerste correctie nodig".
- [x] Houd deze laag bewust compact; owner/action handoff blijft voor `WAVE_03`.

Definition of done:

- [x] De productervaring voelt methodisch consistenter tussen checkpointstate, focusvragen en vervolgrichting.
- [x] Onboarding blijft een checkpoint product en geen halve action system.

### Track 4 - Tests, Docs, and Validation

Tasks:

- [x] Voeg tests toe voor alle checkpoint interpretation states.
- [x] Voeg tests toe voor boundary-copy bij lage datasterkte.
- [x] Werk dit wave-document bij tijdens uitvoering.
- [x] Voer een gescripte smoke-validatie uit voor minstens:
  - laag signaal / hoge richting
  - midden signaal / gemengde richting
  - hoog signaal / lage richting
  - onvoldoende data

Definition of done:

- [x] De checkpoint interpretation logic is getest op sterke en zwakke reads.
- [x] Smoke-validatie bewijst dat onboarding niet te hard claimt.
- [x] Documentatie is synchroon met de feitelijke implementatie.

## Testplan

### Automated Tests

- [x] `stable_checkpoint` verschijnt bij overwegend stabiel signaal en veilige data
- [x] `attention_checkpoint` verschijnt bij leesbaar maar gemengd aandachtsspoor
- [x] `high_attention_checkpoint` verschijnt bij scherp vroegsignaal
- [x] `insufficient_checkpoint` verschijnt onder de huidige display-threshold
- [x] de direction read versterkt interpretatie maar verandert onboarding niet in predictorlogica
- [x] bestaande producttests voor exit, retention, pulse en team blijven groen

### Integration Checks

- [x] onboarding-campaign met voldoende data toont een expliciete checkpointread
- [x] onboarding-campaign onder pattern strength blijft begrensd indicatief
- [x] onboarding-campaign toont nog steeds geen PDF/report
- [x] de campaign page blijft coherent zonder nieuwe route of lifecycle objecten

### Smoke Path

1. Maak of simuleer een onboarding-campaign met onvoldoende data.
2. Simuleer een checkpoint met laag signaal en hoge richting.
3. Simuleer een checkpoint met middensignaal en gemengde richting.
4. Simuleer een checkpoint met hoog signaal en lage richting.
5. Controleer dat de checkpointstate, boundary-copy en vervolgrichting per scenario logisch meeschuiven.
6. Controleer dat onboarding PDF/report buiten scope blijft.

Uitvoering:

- [x] onvoldoende data -> `Nog geen veilige checkpointread`
- [x] laag signaal / hoge richting -> `Overwegend stabiel`
- [x] midden signaal / gemengde richting -> `Indicatief aandachtspunt`
- [x] hoog signaal / lage richting -> `Scherp vroegsignaal`
- [x] report/PDF blijft buiten scope via bestaande API-tests

## Assumptions/Defaults

- `WAVE_02` blijft volledig binnen de bestaande campaign-centered architectuur.
- onboarding blijft `single_checkpoint_per_campaign`.
- de huidige thresholds voor display en pattern strength blijven leidend.
- de checkpoint-richtingsvraag blijft een bounded interpretatiespoor, niet een predictor.
- als signaal en richtingsvraag niet netjes dezelfde kant op wijzen, wint voorzichtige uitleg boven schijnzekerheid.
- `WAVE_02` maakt onboarding methodisch scherper, maar opent nog niet de bredere managementhandoff van `WAVE_03`.

## Product Acceptance

- [x] onboarding voelt na deze wave aantoonbaar meer als een scherp checkpointproduct en minder als een losse momentopname
- [x] management ziet niet alleen de uitkomst, maar ook hoe die veilig gelezen moet worden
- [x] de productervaring blijft duidelijk verschillend van RetentieScan, Pulse en client onboarding

## Codebase Acceptance

- [x] de nieuwe logic blijft begrensd binnen onboarding-specifieke helpers en page-integratie
- [x] er wordt geen generieke lifecycle interpretation engine vooruit gebouwd
- [x] `WAVE_01`-foundation en andere productlijnen blijven intact

## Runtime Acceptance

- [x] een onboarding-campaign kan een expliciete checkpoint interpretation state tonen
- [x] bij lage datasterkte toont de UI een duidelijke boundary in plaats van een te stevige lezing
- [x] onboarding PDF/report blijft buiten scope en veilig begrensd

## QA Acceptance

- [x] relevante tests zijn groen
- [x] de onboarding checkpoint smoke-flow is succesvol uitgevoerd
- [x] de interpretatie voelt als vroege lifecycleduiding, niet als journeyclaim of retentiepredictie
- [x] semantische overlap met client onboarding blijft expliciet begrensd

## Documentation Acceptance

- [x] dit wave-document blijft synchroon met de feitelijke implementatie
- [x] `WAVE_01` blijft gesloten en groen
- [x] het is na afronding duidelijk dat `WAVE_02` de actieve en daarna afgesloten source of truth was
- [x] `WAVE_03` opent pas na expliciete green close-out van deze wave

## Risks To Watch

- onboarding-read kan alsnog te veel gelezen worden als vroege retentievoorspelling
- de combinatie van signaal en richtingsvraag kan te mechanisch of te precies worden uitgelegd
- boundary-copy kan wegzakken zodra latere waves meer managementoutput toevoegen
- de implementatie kan ongemerkt richting journey engine of multi-checkpoint taxonomie schuiven
- de onboarding UX kan te dicht bij client-onboarding-taal blijven in plaats van lifecycle managementtaal

## Not In This Wave

- Geen multi-checkpoint vergelijking
- Geen hire-date-, cohort- of schedulerlogica
- Geen onboarding PDF-output
- Geen buyer-facing onboardingroute
- Geen generieke lifecycle engine
- Geen brede owner/action handoff buiten current checkpoint interpretation

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] onboarding een expliciete checkpoint interpretation state kan tonen
- [x] de UI duidelijk maakt wat het checkpoint wel en niet zegt
- [x] de combinatie van signaal en richtingsvraag methodisch bounded blijft
- [x] code, docs, tests en smoke-validatie groen zijn

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_03_ONBOARDING_MANAGEMENT_OUTPUT_AND_HANDOFF.md`
