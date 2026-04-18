# WAVE_02_MTO_MANAGEMENT_READ_AND_DASHBOARD_DEPTH

## Status

- Wave status: green_completed
- Active source of truth: dit document
- Build permission: executed
- Dependency: `WAVE_01_MTO_FOUNDATION_VERTICAL_SLICE.md` is groen gebleven
- Next allowed wave after green completion: `WAVE_03_MTO_REPORT_TO_ACTION_AND_ACTION_LOGGING.md`

## Title

Verdiep de MTO foundation slice tot een scherpere en methodisch duidelijkere managementread, met rijkere dashboarddiepte en expliciete interpretatiegrenzen, zonder rapportlaag of action logging te openen.

## Korte Summary

`WAVE_01` bewees dat MTO technisch en productmatig als nieuwe hoofdmeting kan landen binnen de bestaande Verisight-runtime: setup, surveyflow, submit-validatie, scoring, persistence en eerste dashboardread zijn groen. Wat nog ontbreekt is de semantische en bestuurlijke diepte van die output zelf. MTO toont nu al een brede organisatieread, maar maakt nog niet scherp genoeg onderscheid tussen:

- indicatieve brede read versus stevige patroonread
- stabiele hoofdmeting versus scherp aandachtspunt
- eerste brede managementduiding versus vervolgscope die nog dicht moet blijven

Deze wave blijft daarom bewust bounded:

- wel scherpere interpretation states voor MTO
- wel rijkere managementread en dashboardcopy
- wel duidelijkere guidance voor eerste brede prioritering
- geen rapportlaag
- geen action logging
- geen suitekoppeling
- geen buyer-facing activatie

## Planned User Outcome

Na deze wave moet een beheerder of interne gebruiker:

- MTO kunnen lezen als duidelijke brede hoofdmeting met expliciete interpretatiestatus
- onderscheid zien tussen indicatief, stabiel, aandacht en scherp aandachtspunt
- zien hoe signalsterkte en richtingsvraag samen gelezen moeten worden
- direct kunnen zien welke managementgrens nog dicht blijft
- een rijkere, maar nog bounded dashboardread hebben zonder rapport- of actionlaag

## Scope In

- MTO-specific interpretation states in dashboardmodel
- scherper onderscheid tussen `hasMinDisplay` en `hasEnoughData`
- rijkere top summary cards, management blocks en follow-through guidance
- expliciete dashboardcopy voor wat MTO nu wel en niet draagt
- tests voor interpretation states en dashboarddiepte
- docs-update van deze wave

## Scope Out

- PDF-rapport of formele reportgenerator
- action logging
- operator- of deliveryhardening
- segment output als primaire uitleglaag
- buyer-facing activatie
- suitebrede refactor of koppeling

## Primary Code Surfaces

- `frontend/lib/products/mto/dashboard.ts`
- `frontend/lib/products/mto/dashboard.test.ts`
- eventueel begrensde copy-aanvullingen in `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- eventueel begrensde copy-aanvullingen in `frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx`

## Work Breakdown

### Track 1 - Interpretation states

- [x] Voeg expliciete MTO interpretation states toe voor:
  - `insufficient_broad_read`
  - `indicative_broad_read`
  - `stable_broad_read`
  - `attention_broad_read`
  - `high_attention_broad_read`
- [x] Definieer hoe `averageSignal` en `stayIntent` samen gelezen worden zonder rapport- of predictorclaim.

### Track 2 - Dashboard depth

- [x] Breid MTO summary cards uit met scherpere hoofdmetingstatus en boundary-taal.
- [x] Maak management blocks en next-step guidance rijker voor indicatieve en stevige reads.
- [x] Houd alle vervolgtaal bounded en intern-first.

### Track 3 - Validation and docs

- [x] Schrijf failing tests eerst voor de nieuwe MTO interpretation states.
- [x] Maak de implementatie groen.
- [x] Leg validatie en closeout vast in dit document.

## Validation

Fresh validation run for this wave:

- [x] `cmd /c npm test -- --run lib/products/mto/dashboard.test.ts`
- [x] `cmd /c npx tsc --noEmit`

Observed result:

- MTO dashboard tests groen
- frontend TypeScript compile groen

## Closeout

Deze wave is groen omdat:

- MTO nu expliciete interpretation states heeft
- indicatieve en stevige brede reads niet meer door elkaar lopen
- summary, primary question en next step scherper meebewegen met de sterkte van de hoofdmeting
- de dashboarddiepte rijker is geworden zonder rapport- of action-logscope te openen

## Definition Of Done

- [x] MTO dashboardmodel onderscheidt indicatieve en stevige brede reads
- [x] MTO heeft expliciete interpretation states
- [x] summary, primary question en next step zijn methodisch scherper
- [x] boundary-copy blijft expliciet dicht rond rapport/action log
- [x] tests groen
- [x] dit document bijgewerkt met uitkomst en validatie
