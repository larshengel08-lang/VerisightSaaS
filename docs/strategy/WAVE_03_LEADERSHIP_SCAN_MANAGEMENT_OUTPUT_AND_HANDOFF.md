# WAVE_03_LEADERSHIP_SCAN_MANAGEMENT_OUTPUT_AND_HANDOFF

## Title

Turn Leadership Scan from a bounded interpretation layer into a customer-worthy management product with explicit owner, first action, and handoff boundaries.

## Korte Summary

`WAVE_01` bewees dat Leadership Scan technisch kan landen binnen de bestaande Verisight-runtime. `WAVE_02` maakte de leadership-read methodisch scherper met expliciete interpretation states, duidelijke boundary-copy en veilige koppeling tussen leadershipsignaal en managementrichtingsvraag. Wat in `WAVE_03` nog ontbreekt is de stap van "scherpe interpretation layer" naar "klantwaardige managementproductvorm": de output zegt nu beter wat het beeld betekent, maar de handoff naar management, de eerste eigenaar, de eerste begrensde stap en de route na de eerste managementsessie zijn nog te veel helper-output en nog niet scherp genoeg als zelfstandig Leadership Scan-aanbod.

Deze wave opent daarom geen nieuwe datalaag, geen named leader model, geen buyer-facing activatie en geen PDF-laag. In plaats daarvan maakt `WAVE_03` de bestaande Leadership-output besluitvaardiger en consistenter:

- de huidige managementstates worden uitgewerkt tot compacte managementhandoff
- de eerste eigenaar en bounded first action worden explicieter en scanbaarder
- Leadership-copy en methodiekframing worden in lijn gebracht met de feitelijke `WAVE_02`-realiteit
- de route na de eerste managementsessie wordt explicieter: bounded vervolgcheck, bredere diagnose, of juist bewust niet opschalen

Status van deze wave:

- Wave status: implemented_green
- Active source of truth after approval: dit document
- Build permission: approved_for_execution
- Dependencies: `WAVE_02_LEADERSHIP_SCAN_INTERPRETATION_AND_BOUNDARIES.md` moet groen blijven
- Next allowed wave after green completion: `WAVE_04_LEADERSHIP_SCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md`

Implementatiesamenvatting:

- Leadership dashboardoutput heeft nu een explicietere managementhandoff met owner-, review- en escalatieblok in [dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/dashboard.ts)
- Leadership definition en assisted lifecycle-guidance zijn gelijkgetrokken met een echte first-handoff read in [definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/definition.ts) en [client-onboarding.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.ts)
- de campaign page toont nu ook een expliciete Leadership post-session route in [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- frontendtests bevestigen nu zowel de dashboardhandoff als de lifecycle-/adoptieguidance voor Leadership in [dashboard.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/dashboard.test.ts) en [client-onboarding.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.test.ts)

Validation snapshot:

- `cmd /c npm test` -> `89 passed`
- `cmd /c npx next typegen` -> groen
- `cmd /c npm run build` -> groen
- `cmd /c npx tsc --noEmit` -> groen in seriele run na build
- `.\.venv\Scripts\python.exe -m pytest tests/test_leadership_scoring.py tests/test_api_flows.py -q` -> `41 passed`
- management smoke is helper-driven afgedekt via stabiel, gemengd en scherp leadershipscenario in de dashboardtests

## Why This Wave Now

Deze wave volgt direct uit wat nu al in de codebase aanwezig is:

- Leadership heeft nu een expliciet dashboardmodel in [dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/dashboard.ts)
- dat model levert nu al `topSummaryCards`, `managementBlocks`, `primaryQuestion`, `nextStep`, `followThroughCards` en `managementBandOverride`
- de campaign page gebruikt nu al leadership-specifieke focusvragen en playbooks in de juiste interpretatieband
- Leadership heeft nu expliciete boundary-copy in [definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/definition.ts)
- wat nog ontbreekt is een echt afgeronde managementhandoff: wie doet nu wat eerst, hoe lees je dit als klant zonder door helperstructuur heen te denken, en wanneer is Leadership Scan "genoeg" versus wanneer vraagt het om andere vervolgroutes

Dat maakt `WAVE_03` de eerstvolgende logische en gecontroleerde stap:

- niet opnieuw de interpretation logic verbreden
- niet nu al publieke routeactivatie openen
- eerst zorgen dat een bestaande Leadership-campaign klantwaardig vertelt: wat is de managementread, waar ligt eigenaarschap, wat is de eerste begrensde actie, en wanneer stop of vervolg je

## Planned User Outcome

Na deze wave moet een Verisight-beheerder of klantgebruiker:

- een Leadership-campaign kunnen lezen als compacte managementhandoff in plaats van alleen als interpretation read
- direct kunnen zien wat nu de kernboodschap, eerste eigenaar, eerste begrensde actie en reviewmoment zijn
- scherper kunnen zien wanneer Leadership Scan genoeg is als managementvervolgstap en wanneer bredere diagnose of andere productvorm logischer is
- expliciet kunnen vertrouwen op de leesgrenzen: geen named leaders, geen 360, geen performanceclaim, geen impliciete causaliteitsclaim

Wat deze wave nog niet hoeft te leveren:

- buyer-facing Leadership Scan-route
- Leadership Scan-PDF of backend reportgenerator
- named leader, `manager_id`, hierarchy of reporting lines
- 360- of coachingtaxonomie
- cross-campaign Leadership trendlogica
- workflow orchestration of taaktoewijzing

## Scope In

- dashboard-native managementhandoff voor Leadership Scan boven op de bestaande interpretation states
- expliciete koppeling van managementstate naar eigenaar, bounded first action en reviewmoment
- aanscherping van Leadership definition, methodology en evidencecopy naar de huidige `WAVE_02`-realiteit
- duidelijkere post-session logica: bounded vervolgcheck, bredere diagnose, of juist expliciet niet opschalen
- tests, docs en smoke-validatie voor klantwaardige Leadership-managementread

## Scope Out

- buyer-facing Leadership-productroute of pricingactivatie
- PDF/report endpoint of downloadbare Leadership-output
- named leader-, hierarchy- of reporting-line support
- 360-, coaching- of traininglogica
- scheduling, taakopslag of workflowjobs
- cross-campaign vergelijking
- MTO-, TeamScan- of Onboarding-werk

## Dependencies

- [PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_12_LEADERSHIP_SCAN_ENTRY_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_13_LEADERSHIP_SCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_13_LEADERSHIP_SCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_14_LEADERSHIP_SCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_14_LEADERSHIP_SCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md)
- [WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_LEADERSHIP_SCAN_FOUNDATION_VERTICAL_SLICE.md)
- [WAVE_02_LEADERSHIP_SCAN_INTERPRETATION_AND_BOUNDARIES.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_02_LEADERSHIP_SCAN_INTERPRETATION_AND_BOUNDARIES.md)

## Current Implementation Baseline

### 1. Interpretation already exists

- Leadership heeft nu expliciete managementstates:
  - `insufficient_management_read`
  - `stable_management_context`
  - `attention_management_context`
  - `high_attention_management_context`
- de managementrichtingsvraag leest nu al mee als bounded contextlaag
- boundary-copy tegen named leader-, 360-, TeamScan- en performanceclaims staat al in de dashboardoutput

### 2. First action logic exists, but is still helper-driven

- dashboardoutput bevat nu expliciete `owner`, `firstAction`, `reviewBoundary` en `escalationBoundary`
- focusvragen en playbooks ondersteunen nu ook `LAAG`, `MIDDEN` en `HOOG`
- de page-integratie gebruikt nu al `managementBandOverride` voor Leadership
- wat nog mist is een echt afgeronde managementhandoff op campaign-niveau: een klantwaardige lijn van samenvatting naar eigenaar naar first action naar route na de eerste sessie

### 3. Product definition is now safer, but not yet fully handoff-native

- Leadership is duidelijk gepositioneerd als group-level managementcontextscan
- Leadership is duidelijk begrensd tegen named leaders, hierarchy en 360
- wat nog aangescherpt moet worden is de assisted first-value taal: van interpretation read naar bruikbare managementroute

### 4. Buyer-facing activation stays closed

- Leadership Scan is nog niet publiek geactiveerd
- marketing, pricing en funnel blijven buiten scope

## Key Changes

- Leadership Scan blijft technisch hetzelfde product, maar krijgt nu een expliciete managementhandoff boven op de huidige interpretation layer.
- De bestaande focusvragen en playbooks worden nadrukkelijker vertaald naar eigenaar, bounded first action en reviewgrens.
- Leadership-copy wordt aangescherpt zodat claims, UX en meetlogica beter aligned zijn met wat het product nu echt levert.
- De route na de eerste managementsessie wordt scherper: bounded vervolgcheck, terug naar bredere diagnose, of juist geen verdere Leadership-opschaling openen.

## Belangrijke Interfaces/Contracts

### 1. Leadership Management Handoff Contract

`WAVE_03` voegt voor Leadership een expliciete managementhandofflaag toe boven op de bestaande dashboardoutput.

De handoff bevat minimaal:

- wat is nu de managementsamenvatting
- wat is het primaire managementspoor
- wie is de eerste eigenaar
- wat is de eerstvolgende begrensde actie
- wanneer is de eerstvolgende review of hercheck logisch

Beslissing:

- deze handoff blijft dashboard-native
- er komt in deze wave geen PDF-contract of nieuw backend artifact
- de handoff is opgebouwd uit bestaande Leadership dashboarddata, interpretation state en playbooks

### 2. Leadership Local Owner Contract

De eerste eigenaar in Leadership blijft in deze wave bounded en rolmatig:

- standaard: `HR lead`
- of `HR lead + MT-sponsor`
- alleen verfijnen als de bestaande playbookcopy daar al helder genoeg voor is

Dit betekent niet:

- dat Leadership nu individuele accountability logt
- dat named leaders beoordeeld worden
- dat eigenaarschap buiten de managementread technisch wordt vastgelegd

Beslissing:

- eigenaar blijft productcopy en handoffframing, geen persistente workflowstatus

### 3. Leadership First Action Contract

De eerstvolgende actie in deze wave moet:

- klein en managementgericht zijn
- passen bij het scherpste leadershipspoor
- expliciet bounded blijven
- niet klinken alsof Leadership Scan de oorzaak of de leider al bewezen heeft

Beslissing:

- `WAVE_03` maakt "wat nu doen?" productmatiger
- het opent geen taakengine, interventieboekhouding of action-plan database

### 4. Leadership Copy Alignment Contract

Na `WAVE_02` worden deze Leadership-copyvelden inhoudelijk synchroon gemaakt met de feitelijke productrealiteit:

- `methodologyText`
- `howToReadText`
- `evidenceStatusText`
- relevante dashboard boundary- en handoffcopy
- routecopy na de eerste managementsessie

Beslissing:

- verwijzingen die Leadership nog te veel als technische interpretation read laten klinken mogen worden aangescherpt
- bounded language rond privacy, groepsniveau en niet-causaliteit blijft expliciet behouden

### 5. Leadership Post-Session Route Contract

Na de eerste Leadership-managementsessie moet de route expliciet drie mogelijke uitkomsten kunnen benoemen:

- bounded vervolgcheck is logisch
- bredere diagnose of ander product is logischer
- verdere Leadership-opschaling is nu niet gerechtvaardigd

Beslissing:

- deze route blijft decision-support copy binnen de dashboardruntime
- er komt geen nieuwe suite-engine, entitlementlogica of workflowlaag in deze wave

## Primary Code Surfaces

### Existing Surfaces To Extend

- [frontend/lib/products/leadership/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/dashboard.ts)
- [frontend/lib/products/leadership/dashboard.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/dashboard.test.ts)
- [frontend/lib/products/leadership/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/definition.ts)
- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx)
- [frontend/lib/client-onboarding.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.ts) if Leadership follow-on guidance needs alignment

### Existing Runtime Reads To Reuse

- huidige `campaign_stats` read
- huidige `survey_responses` + `respondents` data gebruikt door Leadership dashboardread
- bestaande Leadership focusvragen, playbooks en follow-throughcards uit `WAVE_01` en `WAVE_02`

### Existing Behaviors To Keep

- Leadership report route blijft bewust niet ondersteund
- Leadership blijft campaign-centered
- Leadership blijft group-level only en suppressie-aware

## Work Breakdown

### Track 1 - Management Output Alignment

Tasks:

- [x] Definieer een expliciete Leadership managementhandoff boven op de bestaande interpretation state.
- [x] Maak zichtbaar wat nu de kernsamenvatting, eerste eigenaar, eerstvolgende bounded actie en reviewmoment zijn.
- [x] Houd de Leadership-read compact en scanbaar; voorkom een TeamScan- of rapportachtig gevoel.

Definition of done:

- [x] Een Leadership-campaign voelt als een compacte managementread in plaats van alleen een interpretation stack.
- [x] De handoff kan zonder extra toelichting worden gebruikt in een management- of HR-review.

### Track 2 - Playbooks, Owners, and First Action Activation

Tasks:

- [x] Activeer de bestaande Leadership playbooks productmatiger op de Leadership campaign page.
- [x] Zorg dat focusvragen, managementstate en playbooks inhoudelijk op elkaar aansluiten.
- [x] Maak de eerste eigenaar en bounded first action explicieter zichtbaar.

Definition of done:

- [x] Leadership gebruikt de bestaande productassets voor focusvragen en playbooks daadwerkelijk als managementroute.
- [x] De campaign page laat een duidelijke lijn zien van signaal naar eigenaar naar eerste managementactie.

### Track 3 - Post-Session Route Sharpening

Tasks:

- [x] Maak expliciet wanneer een bounded vervolgcheck logisch is en wanneer eerst bredere diagnose nodig blijft.
- [x] Werk copy en next-step logica uit zodat Leadership niet verward wordt met TeamScan, named leader analyse of 360.
- [x] Gebruik alleen afleidbare huidige state uit dashboard en playbooks; geen persistente workflow toevoegen.

Definition of done:

- [x] Leadership heeft een duidelijkere post-session route als productvorm.
- [x] De route naar "nog een Leadership-check" versus "eerst terug naar bredere diagnose" is inhoudelijk scherper.

### Track 4 - Methodology, Trust, and Product Copy

Tasks:

- [x] Actualiseer Leadership methodology- en evidencecopy naar de huidige `WAVE_02`-realiteit.
- [x] Houd privacy-, groepsniveau- en interpretatiegrenzen expliciet zichtbaar.
- [x] Stem UI-copy af op wat Leadership echt levert: bounded managementduiding, first action, geen named leaders, geen hard effectbewijs.

Definition of done:

- [x] Leadership-copy is intern consistent met de echte implementatie.
- [x] Claims, UX en meetlogica zijn voor Leadership beter aligned dan voor deze wave.

### Track 5 - Tests, Docs, and Smoke Validation

Tasks:

- [x] Voeg tests toe voor de nieuwe Leadership managementhandoff en post-session route.
- [x] Bevestig dat Leadership report/PDF nog steeds veilig begrensd blijft.
- [x] Werk dit wave-document bij tijdens uitvoering.
- [x] Voer een smoke-flow uit die bewijst dat een Leadership-campaign nu niet alleen interpretation maar ook klantwaardige managementread ondersteunt.

Definition of done:

- [x] De relevante frontend-, typecheck- en buildgates zijn groen.
- [x] De smoke-flow bewijst een klantwaardige Leadership-managementread binnen de huidige dashboardruntime.
- [x] Documentatie is synchroon met de feitelijke implementatie.

## Testplan

### Automated Tests

- [x] Leadership managementhandoff rendert de kernsamenvatting, eigenaar, bounded actie en reviewmoment correct.
- [x] Leadership post-session route blijft onderscheidbaar van `TeamScan`, named leader analyse en brede diagnose.
- [x] Leadership methodology/evidencecopy verwijst niet te breed of te technisch naar de huidige productvorm.
- [x] Leadership lifecycle-/onboardinglogica benoemt bounded vervolg en eerlijke escalatie naar bredere diagnose.
- [x] Leadership report route blijft `422`.

### Integration Checks

- [x] Een Leadership-campaign zonder scherp attentiesignaal blijft een coherente bounded handoffread tonen.
- [x] Een Leadership-campaign met veilige high-attention state toont samenvatting, eigenaar en bounded first action.
- [x] Leadership playbooks sluiten aan op de actieve topfactor en managementstate.
- [x] Exit, RetentieScan, Pulse, TeamScan en Onboarding campaign pages blijven intact.

### Smoke Path

1. Maak of simuleer een Leadership-campaign met voldoende responses.
2. Zorg voor een scenario met stabiele managementcontext.
3. Zorg voor een scenario met gemengd aandachtspunt.
4. Zorg voor een scenario met scherp attention-signaal.
5. Valideer die Leadership-campaigns data-driven en via frontendtests op managementhandoffgedrag.
6. Controleer dat:
   - de managementhandoff expliciet samenvat wat nu eerst moet gebeuren
   - een eerste eigenaar zichtbaar is
   - een bounded first action zichtbaar is
   - de post-session route duidelijk maakt wanneer vervolgcheck logisch blijft
7. Controleer dat een Leadership-campaign zonder sterke state nog steeds bounded en coherent leest.
8. Controleer dat het Leadership reportpad nog steeds veilig begrensd blijft.

## Assumptions/Defaults

- De bestaande dashboardruntime is voldoende om Leadership klantwaardiger te maken zonder PDF/reportinfrastructuur toe te voegen.
- De al aanwezige Leadership playbooks en focusvragen zijn inhoudelijk voldoende basis voor `WAVE_03`; de hoofdtaak is activatie en alignment, niet nieuwe methodiekbouw.
- Post-session route blijft in deze wave afleidbare productlogica, geen persistente workflowstate.
- Leadership mag klantwaardiger worden zonder buyer-facing activatie.
- Bij spanning tussen "compact houden" en "meer output tonen" krijgt scanbare managementhandoff prioriteit boven extra breedte.

## Product Acceptance

- [x] Leadership voelt nu als een echte managementproductvorm en niet alleen als werkende interpretation flow.
- [x] Een klant of beheerder ziet wat nu moet gebeuren zonder zelf losse cards te hoeven vertalen.
- [x] Leadership blijft scherp onderscheiden van `TeamScan`, named leader output en 360/performancetools.

## Codebase Acceptance

- [x] De wave hergebruikt bestaande Leadership productassets en bouwt geen nieuwe brede export- of workflowlaag.
- [x] De wijzigingen blijven begrensd tot Leadership dashboard, Leadership copy en Leadership follow-through surfaces.
- [x] Exit-, retentie-, Pulse-, TeamScan- en Onboardingpaden blijven intact.

## Runtime Acceptance

- [x] Leadership campaign pages tonen een klantwaardige managementhandoff binnen de huidige runtime.
- [x] Leadership interpretation states blijven werken zoals in `WAVE_02`.
- [x] Leadership report/PDF blijft buiten scope en veilig afgeschermd.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] Een Leadership-management smoke-flow is succesvol uitgevoerd.
- [x] Leadership-boundaries ten opzichte van TeamScan, named leader analyse en performancetaal blijven inhoudelijk scherp.
- [x] De handoff leest als managementroute, niet als named leader of rapportmachine.

## Documentation Acceptance

- [x] Dit wave-document blijft synchroon met de feitelijke implementatie.
- [x] `WAVE_02` blijft gesloten en groen.
- [x] Het is na afronding duidelijk dat `WAVE_03` de actieve en daarna afgesloten source of truth was.
- [x] `WAVE_04` opent pas na expliciete green close-out van deze wave.

## Risks To Watch

- Leadership-output wordt alsnog te breed of te rapportachtig, waardoor de kracht van bounded managementduiding verloren gaat.
- Handoffcopy klinkt sterker dan wat de huidige Leadership-states methodisch kunnen dragen.
- De bestaande Leadership playbooks blijken in de UI zwaarder of diffuser dan bedoeld.
- Productcopy en methodiekcopy raken opnieuw uit sync met de feitelijke runtime.
- Post-session route schuift te snel richting impliciete suite-expansion in plaats van heldere begrenzing.

## Not In This Wave

- Geen publieke Leadership-route of pricingactivatie.
- Geen PDF/reportgenerator voor Leadership.
- Geen named leader, hierarchy of reporting-line output.
- Geen nieuwe backend endpoints of exportcontracten.
- Geen schedulingengine, reminders of actieplan-opslag.
- Geen 360-, coaching- of performancewerk.

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] Leadership een expliciete managementhandoff heeft binnen de campaign page
- [x] Leadership playbooks, eigenaar en bounded first action productmatig coherent zichtbaar zijn
- [x] Leadership-copy en methodiekclaim aligned zijn met de huidige implementatie
- [x] code, docs, tests en smoke-validatie groen zijn

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_04_LEADERSHIP_SCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md`
