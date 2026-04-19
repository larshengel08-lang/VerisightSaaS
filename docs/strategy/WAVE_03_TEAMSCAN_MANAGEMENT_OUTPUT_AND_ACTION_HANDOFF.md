# WAVE_03_TEAMSCAN_MANAGEMENT_OUTPUT_AND_ACTION_HANDOFF

## Title

Turn TeamScan from a technically coherent localization flow into a customer-worthy management product with explicit local handoff output and bounded action framing.

## Korte Summary

`WAVE_01` maakte TeamScan end-to-end uitvoerbaar binnen de huidige Verisight-runtime. `WAVE_02` voegde de eerste echte lokalisatiewaarde toe door veilige `department`-prioritering mogelijk te maken, inclusief expliciete fallback wanneer de verschillen te vlak of onveilig zijn. Wat in `WAVE_03` nog ontbreekt is de stap van "werkende lokalisatieflow" naar "klantwaardige managementproductvorm": de huidige dashboardoutput is al bruikbaar, maar de handoff naar management, lokale eigenaar, eerste actie en interpretatiegrens is nog te helper-driven en nog niet scherp genoeg als zelfstandig TeamScan-aanbod.

Deze wave opent daarom geen nieuwe boundary, geen buyer-facing activatie en geen PDF-laag. In plaats daarvan maakt `WAVE_03` de bestaande TeamScan-output besluitvaardiger en consistenter:

- de huidige local read en priority-read worden uitgewerkt tot compacte managementhandoff
- de eerste lokale eigenaar en bounded first action worden explicieter gemaakt
- TeamScan-copy en methodiekframing worden in lijn gebracht met de feitelijke `WAVE_02`-realiteit
- de route na de eerste managementsessie wordt explicieter: lokale vervolgcheck, bredere diagnose, of juist bewust begrenzen

Status van deze wave:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: uitgevoerd en gevalideerd
- Dependencies: `WAVE_02_TEAMSCAN_LOCALIZATION_AND_PRIORITY_LOGIC.md` moet groen blijven
- Next allowed wave after green completion: `WAVE_04_TEAMSCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md`

Validation snapshot:

- `cmd /c npm test` -> `16 files passed`, `81 tests passed`
- `cmd /c npm run build` -> groen
- `cmd /c npx tsc --noEmit` -> groen
- `.\.venv\Scripts\python.exe -m pytest tests/test_team_scoring.py tests/test_api_flows.py -q` -> `33 passed`
- Gerichte frontendtests bevestigen nu expliciet:
  - TeamScan dashboardmodel bevat managementhuddle/handoff-copy
  - TeamScan lifecycle- en onboardingcopy benoemt begrensde actie en lokaal reviewmoment
- Gescripte TeamScan API-smoke blijft groen: campaign create `201`, import `200`, submits `200`, stats `200`, report bewust `422`
- De auth-protected dashboardroute is niet als browserflow doorlopen; de handofflaag is afgedekt via frontendtests, typecheck en productiebuild

## Why This Wave Now

Deze wave volgt direct uit wat nu al in de codebase aanwezig is:

- TeamScan heeft nu al `topSummaryCards`, `managementBlocks`, `primaryQuestion`, `nextStep` en `followThroughCards` in [dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts)
- TeamScan heeft nu al veilige local read plus bounded first priority in dezelfde helperlaag
- de campaign page koppelt de eerste lokale prioriteit al aan bestaande focusvragen en playbooks
- de TeamScan-definition copy benoemt al department-first, privacy-first en bounded lokalisatie
- wat nog ontbreekt is een echt afgeronde managementhandoff: wie doet nu wat eerst, hoe leest een klant dit zonder door de helperstructuur heen te hoeven kijken, en wanneer is TeamScan "genoeg" versus wanneer vraagt het om een andere vervolgstap

Dat maakt `WAVE_03` de eerstvolgende logische en gecontroleerde stap:

- niet opnieuw de local priority-logica verbreden
- niet nu al marketing of routeactivatie openen
- eerst zorgen dat een bestaande TeamScan-campaign klantwaardig vertelt: wat is de lokale managementread, waar ligt eigenaarschap, wat is de eerste begrensde actie, en wanneer stop of vervolg je

## Planned User Outcome

Na deze wave moet een Verisight-beheerder of klantgebruiker:

- een TeamScan-campaign kunnen lezen als compacte managementhandoff in plaats van alleen als local priority-read
- direct kunnen zien wat nu de kernboodschap, eerste lokale eigenaar en eerstvolgende bounded actie zijn
- scherper kunnen zien wanneer TeamScan genoeg is als lokale vervolgstap en wanneer bredere diagnose of ander product logischer blijft
- expliciet kunnen vertrouwen op de leesgrenzen: geen manager ranking, geen causaliteitsclaim, geen oververkochte lokale zekerheid

Wat deze wave nog niet hoeft te leveren:

- buyer-facing TeamScan routeactivatie
- TeamScan-PDF of backend reportgenerator
- manager- of location-boundaries
- cross-campaign TeamScan trendlogica
- automatische taakopvolging of workflow orchestration

## Scope In

- dashboard-native managementhandoff voor TeamScan boven op de bestaande priority- en local read
- expliciete koppeling van eerste lokale prioriteit naar eigenaar, bounded first action en reviewmoment
- aanscherping van TeamScan definition, methodology en evidencecopy naar de huidige `WAVE_02`-realiteit
- duidelijkere post-session logica: lokale vervolgcheck, bredere diagnose, of juist begrenzen
- tests, docs en smoke-validatie voor klantwaardige TeamScan-managementread

## Scope Out

- buyer-facing TeamScan productroute of pricingactivatie
- PDF/report endpoint of downloadbare TeamScan-output
- manager-, location- of multi-boundary support
- scheduling, taakopslag of workflowjobs
- cross-campaign TeamScan vergelijking
- Onboarding 30-60-90-werk

## Dependencies

- [PHASE_NEXT_STEP_1_TEAMSCAN_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_1_TEAMSCAN_ENTRY_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_2_TEAMSCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_2_TEAMSCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_3_TEAMSCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_3_TEAMSCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md)
- [WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE.md)
- [WAVE_02_TEAMSCAN_LOCALIZATION_AND_PRIORITY_LOGIC.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_02_TEAMSCAN_LOCALIZATION_AND_PRIORITY_LOGIC.md)

## Key Changes

- TeamScan blijft dashboard-first, maar krijgt nu een expliciete managementhandoff in plaats van alleen lokale prioritycards.
- De bestaande TeamScan focusvragen en playbooks worden nadrukkelijker vertaald naar eigenaar, eerste lokale actie en reviewgrens.
- TeamScan-copy wordt aangescherpt zodat claims, UX en meetlogica beter aligned zijn met wat het product nu echt levert.
- De lokale route na de eerste managementsessie wordt scherper: nog een lokale check, terug naar bredere diagnose, of juist geen verdere lokalisatie openen.

## Belangrijke Interfaces/Contracts

### 1. TeamScan Management Handoff Contract

`WAVE_03` voegt voor TeamScan een expliciete managementhandofflaag toe boven op de bestaande dashboardoutput.

De handoff bevat minimaal:

- wat is nu de lokale managementsamenvatting
- welke afdeling of lokale context vraagt eerst bounded verificatie
- wie is de eerste lokale eigenaar
- wat is de eerstvolgende begrensde actie
- wanneer is de eerstvolgende review of hercheck logisch

Beslissing:

- deze handoff blijft dashboard-native
- er komt in deze wave geen PDF-contract of nieuw backend artifact
- de handoff is opgebouwd uit bestaande TeamScan dashboarddata, priority-state en playbooks

### 2. TeamScan Local Owner Contract

De eerste eigenaar in TeamScan is in deze wave nog bounded en rolmatig:

- standaard: `HR + afdelingsleider`
- alleen verfijnen als de bestaande playbookcopy daar al helder genoeg voor is

Dit betekent niet:

- dat TeamScan nu individuele accountability logt
- dat managerperformance beoordeeld wordt
- dat eigenaarschap juridisch of organisatorisch vaststaat buiten de managementread

Beslissing:

- eigenaar blijft productcopy en handoffframing, geen persistente workflowstatus

### 3. TeamScan First Action Contract

De eerstvolgende actie in deze wave moet:

- klein en lokaal zijn
- passen bij het scherpste lokale spoor
- expliciet bounded blijven
- niet klinken alsof TeamScan de oorzaak al bewezen heeft

Beslissing:

- `WAVE_03` maakt "wat nu doen?" productmatiger
- het opent geen taakengine, interventieboekhouding of action-plan database

### 4. TeamScan Copy Alignment Contract

Na `WAVE_02` worden deze TeamScan-copyvelden inhoudelijk synchroon gemaakt met de feitelijke productrealiteit:

- `methodologyText`
- `howToReadText`
- `evidenceStatusText`
- relevante dashboard boundary- en handoffcopy
- lokale routecopy na de eerste managementsessie

Beslissing:

- verwijzingen die TeamScan nog te veel als technische localizer laten klinken mogen worden aangescherpt
- bounded language rond privacy, groepsniveau en niet-causaliteit blijft expliciet behouden

### 5. TeamScan Post-Session Route Contract

Na de eerste TeamScan-managementsessie moet de route expliciet drie mogelijke uitkomsten kunnen benoemen:

- lokale vervolgcheck is logisch
- bredere diagnose of ander product is logischer
- verdere lokalisatie is nu niet gerechtvaardigd

Beslissing:

- deze route blijft decision-support copy binnen de dashboardruntime
- er komt geen nieuwe suite-engine of entitlementlogica in deze wave

## Primary Code Surfaces

### Existing Surfaces To Extend

- [frontend/lib/products/team/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts)
- [frontend/lib/products/team/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/definition.ts)
- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx)
- [frontend/lib/client-onboarding.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.ts) if TeamScan follow-on guidance needs alignment

### Existing Runtime Reads To Reuse

- huidige `campaign_stats` read
- huidige `survey_responses` + `respondents` data gebruikt door TeamScan local read en priority-state
- bestaande TeamScan focusvragen, playbooks en follow-throughcards uit `WAVE_01` en `WAVE_02`

### Existing Behaviors To Keep

- TeamScan report route blijft bewust niet ondersteund
- TeamScan blijft campaign-centered
- TeamScan blijft `department`-first en privacy-first

## Work Breakdown

### Track 1 - Management Output Alignment

Tasks:

- [x] Definieer een expliciete TeamScan managementhandoff boven op de bestaande local priority-read.
- [x] Maak zichtbaar wat nu de kernsamenvatting, eerste lokale eigenaar, eerstvolgende bounded actie en reviewmoment zijn.
- [x] Houd de TeamScan-read compact en scanbaar; voorkom een retentie-achtig rapportgevoel.

Definition of done:

- [x] Een TeamScan-campaign voelt als een compacte managementread in plaats van alleen een verzameling lokale cards.
- [x] De handoff kan zonder extra toelichting worden gebruikt in een management- of HR-review.

### Track 2 - Playbooks, Owners, and First Action Activation

Tasks:

- [x] Activeer de bestaande TeamScan playbooks productmatiger op de TeamScan campaign page.
- [x] Zorg dat focusvragen, prioriteitslaag en playbooks inhoudelijk op elkaar aansluiten.
- [x] Maak de eerste lokale eigenaar en bounded first action explicieter zichtbaar.

Definition of done:

- [x] TeamScan gebruikt de bestaande productassets voor focusvragen en playbooks daadwerkelijk als managementroute.
- [x] De campaign page laat een duidelijke lijn zien van signaal naar eigenaar naar eerste lokale actie.

### Track 3 - Post-Session Route Sharpening

Tasks:

- [x] Maak expliciet wanneer een lokale vervolgcheck logisch is en wanneer eerst bredere diagnose nodig blijft.
- [x] Werk copy en next-step logica uit zodat TeamScan niet verward wordt met segment deep dive of een brede teamdiagnose.
- [x] Gebruik alleen afleidbare huidige state uit dashboard en priority-read; geen persistente workflow toevoegen.

Definition of done:

- [x] TeamScan heeft een duidelijkere post-session route als productvorm.
- [x] De route naar "nog een lokale check" versus "eerst terug naar bredere diagnose" is inhoudelijk scherper.

### Track 4 - Methodology, Trust, and Product Copy

Tasks:

- [x] Actualiseer TeamScan methodology- en evidencecopy naar de huidige `WAVE_02`-realiteit.
- [x] Houd privacy-, groepsniveau- en interpretatiegrenzen expliciet zichtbaar.
- [x] Stem UI-copy af op wat TeamScan echt levert: bounded lokalisatie, priority-read, geen manager ranking, geen hard effectbewijs.

Definition of done:

- [x] TeamScan-copy is intern consistent met de echte implementatie.
- [x] Claims, UX en meetlogica zijn voor TeamScan beter aligned dan voor deze wave.

### Track 5 - Tests, Docs, and Smoke Validation

Tasks:

- [x] Voeg tests toe voor de nieuwe TeamScan managementhandoff en post-session route.
- [x] Bevestig dat TeamScan report/PDF nog steeds veilig begrensd blijft.
- [x] Werk dit wave-document bij tijdens uitvoering.
- [x] Voer een smoke-flow uit die bewijst dat een TeamScan-campaign nu niet alleen prioriteit maar ook klantwaardige managementread ondersteunt.

Definition of done:

- [x] De relevante frontend-, typecheck- en buildgates zijn groen.
- [x] De smoke-flow bewijst een klantwaardige TeamScan-managementread binnen de huidige dashboardruntime.
- [x] Documentatie is synchroon met de feitelijke implementatie.

## Testplan

### Automated Tests

- [x] TeamScan managementhandoff rendert de kernsamenvatting, eigenaar, bounded actie en reviewmoment correct.
- [x] TeamScan post-session route blijft onderscheidbaar van `Segment Deep Dive` en brede diagnose.
- [x] TeamScan methodology/evidencecopy verwijst niet te breed of te technisch naar de huidige productvorm.
- [x] TeamScan lifecycle-/onboardinglogica benoemt bounded vervolg en eerlijke escalatie naar bredere diagnose.
- [x] TeamScan report route blijft `422`.

### Integration Checks

- [x] Een TeamScan-campaign zonder harde first priority blijft een coherente bounded handoffread tonen.
- [x] Een TeamScan-campaign met veilige first priority toont samenvatting, eigenaar en bounded first action.
- [x] TeamScan playbooks sluiten aan op de actieve topfactor en lokale priority-state.
- [x] Exit, RetentieScan en Pulse campaign pages blijven intact.

### Smoke Path

1. Maak organisatie `X` aan.
2. Maak een TeamScan-campaign aan voor organisatie `X` en haal voldoende responses op.
3. Zorg voor een scenario met een duidelijke lokale first priority.
4. Valideer die TeamScan-campaign data-driven en via frontendtests op managementhandoffgedrag.
5. Controleer dat:
   - de managementhandoff expliciet samenvat wat nu eerst moet gebeuren
   - een eerste lokale eigenaar zichtbaar is
   - een bounded first action zichtbaar is
   - de post-session route duidelijk maakt wanneer lokale vervolgcheck logisch blijft
6. Controleer dat een TeamScan zonder harde first priority nog steeds bounded en coherent leest.
7. Controleer dat het TeamScan reportpad nog steeds veilig begrensd blijft.

## Assumptions/Defaults

- De bestaande dashboardruntime is voldoende om TeamScan klantwaardiger te maken zonder PDF/reportinfrastructuur toe te voegen.
- De al aanwezige TeamScan playbooks en focusvragen zijn inhoudelijk voldoende basis voor `WAVE_03`; de hoofdtaak is activatie en alignment, niet nieuwe methodiekbouw.
- Post-session route blijft in deze wave afleidbare productlogica, geen persistente workflowstate.
- TeamScan mag klantwaardiger worden zonder buyer-facing activatie.
- Bij spanning tussen "compact houden" en "meer output tonen" krijgt scanbare managementhandoff prioriteit boven extra breedte.

## Product Acceptance

- [x] TeamScan voelt nu als een echte managementproductvorm en niet alleen als werkende lokalisatieflow.
- [x] Een klant of beheerder ziet wat nu moet gebeuren zonder zelf losse prioritycards te hoeven vertalen.
- [x] TeamScan blijft scherp onderscheiden van `Segment Deep Dive`, manager ranking en brede teamdiagnose.

## Codebase Acceptance

- [x] De wave hergebruikt bestaande TeamScan productassets en bouwt geen nieuwe brede export- of workflowlaag.
- [x] De wijzigingen blijven begrensd tot TeamScan dashboard, TeamScan copy en TeamScan follow-through surfaces.
- [x] Exit-, retentie- en Pulse-paden blijven intact.

## Runtime Acceptance

- [x] TeamScan campaign pages tonen een klantwaardige managementhandoff binnen de huidige runtime.
- [x] TeamScan priority-read blijft werken zoals in `WAVE_02`.
- [x] TeamScan report/PDF blijft buiten scope en veilig afgeschermd.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] Een TeamScan-management smoke-flow is succesvol uitgevoerd.
- [x] TeamScan-boundaries ten opzichte van bredere diagnose blijven inhoudelijk scherp.
- [x] De handoff leest als managementroute, niet als lokale rapportmachine.

## Documentation Acceptance

- [x] Dit wave-document blijft synchroon met de feitelijke implementatie.
- [x] `WAVE_02` blijft gesloten en groen.
- [x] Het is na afronding duidelijk dat `WAVE_03` de actieve en daarna afgesloten source of truth was.
- [x] `WAVE_04` opent pas na expliciete green close-out van deze wave.

## Risks To Watch

- TeamScan-output wordt alsnog te breed of te rapportachtig, waardoor de kracht van bounded lokalisatie verloren gaat.
- Handoffcopy klinkt sterker dan wat de huidige TeamScan-prioritering methodisch kan dragen.
- De bestaande TeamScan playbooks blijken in de UI zwaarder of diffuser dan bedoeld.
- Productcopy en methodiekcopy raken opnieuw uit sync met de feitelijke runtime.
- Post-session route schuift te snel richting impliciete suite-expansion in plaats van heldere begrenzing.

## Not In This Wave

- Geen publieke TeamScan-route of pricingactivatie.
- Geen PDF/reportgenerator voor TeamScan.
- Geen nieuwe backend endpoints of exportcontracten.
- Geen schedulingengine, reminders of actieplan-opslag.
- Geen manager- of location-boundarywerk.
- Geen Onboarding 30-60-90-werk.

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] TeamScan een expliciete managementhandoff heeft binnen de campaign page
- [x] TeamScan playbooks, eigenaar en bounded first action productmatig coherent zichtbaar zijn
- [x] TeamScan-copy en methodiekclaim aligned zijn met de huidige implementatie
- [x] code, docs, tests en smoke-validatie groen zijn

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_04_TEAMSCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md`
