# WAVE_03_ONBOARDING_MANAGEMENT_OUTPUT_AND_HANDOFF

## Title

Turn onboarding from a bounded checkpoint interpretation into a customer-worthy management product with explicit owner, first action, and handoff boundaries.

## Korte Summary

`WAVE_01` bewees dat onboarding technisch kan draaien binnen de bestaande Verisight-runtime. `WAVE_02` maakte de checkpointread methodisch scherper met expliciete states, bounded interpretatie en zichtbare boundary-copy. `WAVE_03` maakt onboarding nu klantwaardiger als assisted managementproduct: niet breder, maar duidelijker in owner, first action, reviewgrens en handoff.

De kern van deze wave:

- onboarding heeft nu een explicietere managementhandoff in de dashboardoutput
- stable, attention en high-attention checkpoints krijgen nu elk een passender owner- en first-actionlaag
- de page-integratie gebruikt voor onboarding nu ook echt de productspecifieke focusvragen en playbooks in de juiste checkpointband
- definition- en lifecycle-copy zijn gelijkgetrokken met wat de output nu werkelijk levert

Status van deze wave:

- Wave status: implemented_green
- Active source of truth after approval: dit document
- Build permission: uitgevoerd
- Dependencies: `WAVE_01` en `WAVE_02` blijven groen
- Next allowed wave after green completion: `WAVE_04_ONBOARDING_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md`

Implementatiesamenvatting:

- onboarding dashboardoutput heeft nu expliciete owner-, first-action- en reviewgrensvelden
- onboarding gebruikt nu `managementBandOverride` zodat focusvragen en playbooks voor stabiele, gemengde en scherpe checkpoints dezelfde producttaal gebruiken
- onboarding heeft nu ook `LAAG` playbooks en focusvragen voor borgscenario's
- onboarding is in de campaign page als volwaardige assisted route opgenomen in de focus- en playbooklaag
- assisted onboarding-language is aangescherpt in definition en client-onboarding guidance

Validatiesnapshot:

- `cmd /c npm test -- lib/products/onboarding/dashboard.test.ts lib/client-onboarding.test.ts` -> groen (`11 passed`)
- `cmd /c npm test` -> groen (`85 passed`)
- `cmd /c npm run build` -> groen
- `cmd /c npx next typegen` -> groen
- `cmd /c npx tsc --noEmit` -> groen
- `.\.venv\Scripts\python.exe -m pytest tests/test_onboarding_scoring.py tests/test_api_flows.py tests/test_portfolio_architecture_program.py -q` -> groen (`40 passed`)
- management smoke is helper-driven afgedekt via stabiel, gemengd en scherp checkpointscenario in de onboarding dashboardtests

## Why This Wave Now

Deze wave volgde logisch uit de huidige codebase en uit de twee afgeronde onboarding-waves:

- [WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE.md) leverde de eerste end-to-end onboarding productline
- [WAVE_02_ONBOARDING_CHECKPOINT_INTERPRETATION_AND_BOUNDARIES.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_02_ONBOARDING_CHECKPOINT_INTERPRETATION_AND_BOUNDARIES.md) leverde expliciete checkpointstates en boundary-copy
- [dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/dashboard.ts) bevat nu een expliciete handofflaag per checkpointstate
- [action-playbooks.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/action-playbooks.ts) en [focus-questions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/focus-questions.ts) ondersteunen nu ook borgscenario's
- [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx) gebruikt onboarding nu ook echt in de playbook- en focuslaag

De huidige gap zat dus niet meer in "kan onboarding draaien?", maar in "voelt onboarding al als een assisted managementproduct met echte first value?". `WAVE_03` sluit precies dat gat.

## Planned User Outcome

Na deze wave kan een klantgebruiker:

- onboarding niet alleen lezen als checkpointsnapshot, maar als eerste managementhandoff
- expliciet zien:
  - wat nu de eerste managementvraag is
  - wie nu de eerste eigenaar is
  - welke begrensde eerste actie nu logisch is
  - wanneer een volgend checkpoint logisch is
  - wanneer onboarding juist niet verder moet worden opgerekt

Wat deze wave nog niet levert:

- publieke onboarding-productroute
- marketingactivatie of pricing
- PDF-rapport
- multi-checkpoint orchestration
- hire-date of cohortlogica
- self-serve activation

## Scope In

- expliciete owner-, first-action- en handofflaag in onboarding dashboardoutput
- aanscherping van managementcopy en productdefinition
- duidelijker verschil tussen borgactie, corrigerende actie en verificatieactie
- alignment tussen onboarding dashboard, playbooks, focusvragen en client guidance
- first-value language voor assisted onboardinggebruik
- tests voor managementoutput en handoffgrenzen
- docs-update van deze wave en relevante source-of-truth pointers

## Scope Out

- buyer-facing onboardingroute
- onboarding pricing of contactfunnel-openstelling
- PDF/reportgenerator
- multi-checkpoint vergelijking
- generieke lifecycle workflow-engine
- entitlement- of packaginguitbreiding
- nieuwe productlijn buiten onboarding

## Dependencies

- [PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_5_ONBOARDING_ENTRY_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_6_ONBOARDING_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_7_ONBOARDING_MASTER_INDEX_AND_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_7_ONBOARDING_MASTER_INDEX_AND_WAVE_STACK_PLAN.md)
- [WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_ONBOARDING_FOUNDATION_VERTICAL_SLICE.md)
- [WAVE_02_ONBOARDING_CHECKPOINT_INTERPRETATION_AND_BOUNDARIES.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_02_ONBOARDING_CHECKPOINT_INTERPRETATION_AND_BOUNDARIES.md)

## Current Implementation Baseline

### 1. Checkpoint interpretation already exists

- [x] onboarding heeft expliciete checkpointstates
- [x] de checkpoint-richtingsvraag leest al mee als bounded contextlaag
- [x] boundary-copy tegen journey-, performance- en predictorclaims staat al in het dashboard

### 2. First action logic is now tightened

- [x] dashboardoutput bevat nu expliciete owner-, first-action- en reviewgrensvelden
- [x] playbooks bevatten nu owners, validations en begrensde acties voor `HOOG`, `MIDDEN` en `LAAG`
- [x] focusvragen bestaan nu ook voor borgscenario's
- [x] handoff naar HR, leidinggevende en onboarding-owner is nu explicieter

### 3. Product definition is aligned with first value

- [x] onboarding is duidelijk gepositioneerd als lifecycle-scan op groepsniveau
- [x] onboarding is duidelijk begrensd als single-checkpoint read
- [x] assisted first-value en managementhandoff zitten nu explicieter in definition en lifecycle guidance

### 4. Buyer-facing activation stays closed

- [x] onboarding is nog niet publiek geactiveerd
- [x] marketing, pricing en funnel blijven buiten scope

## Key Changes

- onboarding heeft nu een explicietere handofflaag in de dashboardoutput
- de managementread maakt scherper onderscheid tussen:
  - wat je moet borgen
  - wat je moet corrigeren
  - wat je eerst nog moet verifieren
- first owner, first action en review boundary zijn productmatig consistenter
- onboarding definition en lifecycle guidance gebruiken nu dezelfde assisted first-value taal als het dashboard
- buyer-facing activatie blijft dicht; deze wave richtte zich volledig op de interne klantwaardige productvorm

## Belangrijke Interfaces/Contracts

### 1. Management Handoff Contract

Na deze wave kan onboarding expliciet tonen:

- `primaryManagementQuestion`
- `firstOwner`
- `firstAction`
- `reviewBoundary`
- `escalationBoundary`

Beslissingen:

- [x] geen nieuwe backend output nodig; de handoff wordt veilig afgeleid uit bestaande checkpointstate, factorread en playbooklaag
- [x] handoff blijft onboarding-specifiek en wordt geen generieke cross-product action engine

### 2. Owner Contract

De eerste eigenaar blijft in deze wave beperkt tot bestaande, plausibele assisted rollen:

- `HR`
- `HR + leidinggevende`
- `HR + onboarding-owner`
- `leidinggevende` waar dat nu al expliciet verdedigbaar is

Beslissingen:

- [x] owner is explicieter gemaakt zonder te doen alsof de runtime echte taaktoewijzing kent
- [x] stabiele checkpoints gebruiken nu explicieter `HR + onboarding-owner` als borgowner

### 3. First Action Contract

De eerste actie in onboarding blijft:

- klein
- zichtbaar
- passend bij een checkpoint
- toetsbaar op een volgend checkpoint

Beslissingen:

- [x] first action blijft bounded
- [x] als bredere diagnose eerlijker is, zegt onboarding dat nu explicieter in de reviewgrens

### 4. Review Boundary Contract

Onboarding maakt nu explicieter:

- wanneer een volgend checkpoint logisch is
- wanneer een volgend checkpoint juist niet logisch is
- wanneer bredere diagnose of een andere productvorm eerlijker is

Beslissingen:

- [x] review boundary is zichtbaarder in managementoutput
- [x] review boundary wint boven automatische checkpoint-escalatie

### 5. Assisted First-Value Contract

Onboarding voelt na deze wave assisted-klantwaardig in:

- dashboardoutput
- productdefinition
- client-onboarding guidance

Beslissingen:

- [x] assisted first value blijft een bruikbare managementhuddle, geen publieke productopenstelling
- [x] buyer-facing activatie blijft expliciet uitgesteld naar `WAVE_04`

## Primary Code Surfaces

### Existing Surfaces Extended

- [frontend/lib/products/onboarding/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/dashboard.ts)
- [frontend/lib/products/onboarding/dashboard.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/dashboard.test.ts)
- [frontend/lib/products/onboarding/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/definition.ts)
- [frontend/lib/products/onboarding/action-playbooks.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/action-playbooks.ts)
- [frontend/lib/products/onboarding/focus-questions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/focus-questions.ts)
- [frontend/lib/client-onboarding.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.ts)
- [frontend/lib/client-onboarding.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.test.ts)
- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx)
- [frontend/lib/products/shared/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/shared/types.ts)

## Work Breakdown

### Track 1 - Management Output Tightening

Tasks:

- [x] Maak de onboarding managementread explicieter als handoff in plaats van alleen interpretatie.
- [x] Trek owner, first action en review boundary scherper door in summary cards, next step en follow-through.
- [x] Maak duidelijker onderscheid tussen borgspoor, correctiespoor en verificatiespoor.
- [x] Houd de single-checkpoint boundary overal expliciet.

Definition of done:

- [x] Onboarding voelt als een managementproduct en niet alleen als een uitlegpaneel.
- [x] Owner en first action zijn zichtbaar consistenter in de checkpointoutput.
- [x] De output blijft bounded en producteerlijk.

### Track 2 - Playbook and Focus Alignment

Tasks:

- [x] Zorg dat focusvragen en playbooks beter aansluiten op de huidige checkpointstates.
- [x] Trek owner- en first-action taal gelijk tussen dashboard en playbooks.
- [x] Vermijd brede interventietaal die groter is dan een checkpoint kan dragen.

Definition of done:

- [x] Dashboardread, focusvragen en playbooks vertellen hetzelfde managementverhaal.
- [x] De eerste actie is klein, zichtbaar en toetsbaar.
- [x] Onboarding blijft methodisch smaller dan RetentieScan of TeamScan.

### Track 3 - Definition and Assisted First-Value Alignment

Tasks:

- [x] Werk onboarding definition copy bij waar assisted first value nog te vlak of te generiek is.
- [x] Werk client-onboarding guidance bij zodat first-read en adoption language de nieuwe handofflaag weerspiegelen.
- [x] Zorg dat onboarding duidelijk onderscheid houdt met client onboarding en bredere lifecycle-platformtaal.

Definition of done:

- [x] Productdefinition en dashboardoutput zijn inhoudelijk aligned.
- [x] Assisted onboarding language voelt klantwaardig zonder buyer-facing te worden.
- [x] Semantische overlap met client onboarding blijft beperkt en expliciet.

### Track 4 - Tests, Docs, and Validation

Tasks:

- [x] Voeg tests toe of werk tests bij voor owner-, first-action- en review-boundary output.
- [x] Werk dit wave-document bij tijdens uitvoering.
- [x] Voer een smoke-validatie uit op minimaal:
  - stabiel checkpoint
  - gemengd checkpoint
  - scherp vroegsignaal
- [x] Bevestig dat buyer-facing onboarding nog dicht blijft.

Definition of done:

- [x] Managementoutput is getest op handoff en boundary.
- [x] Docs zijn synchroon met de implementatie.
- [x] Code, tests, build en smoke zijn groen.

## Testplan

### Automated Tests

- [x] stabiel checkpoint toont borgactie in plaats van corrigerende actie
- [x] gemengd checkpoint toont begrensde correctie of verificatie
- [x] hoog aandachtssignaal toont expliciete first action zonder predictorclaim
- [x] owner blijft expliciet maar bounded
- [x] review boundary voorkomt automatische checkpoint-escalatie
- [x] bestaande frontend suite blijft groen

### Integration Checks

- [x] onboarding-campaign met voldoende data toont een expliciete managementhandoff
- [x] onboarding-campaign blijft single-checkpoint en assisted
- [x] onboarding-campaign toont nog steeds geen PDF/report
- [x] onboarding blijft buyer-facing gesloten

### Smoke Path

1. Open of simuleer een onboarding-campaign met stabiel checkpointbeeld.
2. Controleer dat het dashboard een borgactie, eerste eigenaar en begrensd vervolgmoment toont.
3. Herhaal voor een gemengd checkpointbeeld.
4. Herhaal voor een scherp vroegsignaal.
5. Controleer dat in elk scenario:
   - de owner zichtbaar is
   - de eerste actie klein en toetsbaar blijft
   - de review boundary expliciet blijft
   - onboarding geen journey-, retentie- of performanceclaim introduceert

Uitvoering:

- [x] stabiel checkpoint -> borgactie + `HR + onboarding-owner`
- [x] gemengd checkpoint -> begrensde checkpointactie + bounded review
- [x] scherp vroegsignaal -> expliciete correctie + reviewgrens
- [x] buyer-facing onboarding blijft gesloten in deze wave

## Assumptions/Defaults

- `WAVE_03` blijft volledig binnen de bestaande campaign-centered architectuur.
- onboarding blijft `single_checkpoint_per_campaign`.
- de huidige checkpointstates uit `WAVE_02` blijven leidend.
- owner en first action blijven assisted producttaal, geen echte workflow-engine.
- onboarding wordt in deze wave klantwaardiger, maar nog niet publiek geactiveerd.

## Product Acceptance

- [x] onboarding voelt na deze wave als een assisted managementproduct met first value
- [x] management ziet expliciet wie nu trekt, wat nu eerst gebeurt en wanneer opnieuw gekeken wordt
- [x] de productervaring blijft duidelijk anders dan client onboarding, RetentieScan, Pulse en TeamScan

## Codebase Acceptance

- [x] de nieuwe logic blijft begrensd tot onboarding-specifieke helpers, copy en page-integratie
- [x] er wordt geen generieke action orchestration engine vooruit gebouwd
- [x] buyer-facing onboarding blijft dicht

## Runtime Acceptance

- [x] een onboarding-campaign kan een expliciete managementhandoff tonen
- [x] owner, first action en review boundary zijn zichtbaar in de output
- [x] onboarding PDF/report blijft buiten scope en veilig begrensd

## QA Acceptance

- [x] relevante tests zijn groen
- [x] onboarding management smoke-flow is succesvol uitgevoerd
- [x] de output voelt als early lifecycle managementduiding, niet als journey automation of retentiepredictie
- [x] semantische overlap met client onboarding blijft expliciet begrensd

## Documentation Acceptance

- [x] dit wave-document blijft synchroon met de feitelijke implementatie
- [x] `WAVE_02` blijft gesloten en groen
- [x] `WAVE_04` opent pas na expliciete green close-out van deze wave

## Risks To Watch

- onboarding kan alsnog te veel assisted actie suggereren zonder echte onderbouwing
- owner- en first-action copy kan te precies worden voor wat het product werkelijk weet
- onboarding kan te dicht tegen client onboarding language aan blijven hangen
- review boundary kan verzwakken zodra de handofflaag later nog rijker wordt
- de wave kan ongemerkt buyer-facing productpolish gaan doen die pas in `WAVE_04` hoort

## Not In This Wave

- Geen buyer-facing onboardingroute
- Geen onboarding pricing of funnelactivatie
- Geen onboarding PDF-output
- Geen multi-checkpoint vergelijking
- Geen hire-date-, cohort- of schedulerlogica
- Geen generieke workflow- of action-engine

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] onboarding een expliciete managementhandoff kan tonen
- [x] owner, first action en review boundary productmatig aligned zijn
- [x] de output bounded blijft tot een checkpoint en assisted gebruik
- [x] code, docs, tests en smoke-validatie groen zijn

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_04_ONBOARDING_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md`
