# WAVE_03_PULSE_MANAGEMENT_OUTPUT_AND_REPEAT_MOTION

## Title

Turn Pulse from a technically coherent review loop into a customer-worthy management product with explicit handoff output and a bounded repeat motion.

## Korte Summary

`WAVE_01` maakte Pulse end-to-end uitvoerbaar binnen de huidige Verisight-runtime. `WAVE_02` voegde de eerste echte monitoringwaarde toe door veilige vergelijking met precies één vorige Pulse-cycle mogelijk te maken. Wat in `WAVE_03` nog ontbrak was de stap van "werkende monitoringflow" naar "klantwaardige managementproductvorm": de bestaande dashboardoutput was al bruikbaar, maar de handoff naar management, de productcopy en de repeat motion waren nog niet scherp genoeg als zelfstandig Pulse-aanbod.

Deze wave heeft daarom geen nieuwe productlijn, geen publieke activatie en geen exportlaag geopend. In plaats daarvan maakt `WAVE_03` de bestaande Pulse-output besluitvaardiger en consistenter: de huidige dashboardread is uitgewerkt tot compacte managementhandoff, de bestaande Pulse-playbooks zijn actief gemaakt op de campaign page, product- en methodiekcopy zijn in lijn gebracht met de feitelijke `WAVE_02`-realiteit, en de repeat motion is expliciet begrensd zodat Pulse niet verward raakt met `RetentieScan ritme`.

Status van deze wave:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: uitgevoerd en gevalideerd
- Dependencies: `WAVE_02_PULSE_REVIEW_LOOP_AND_DELTA_LOGIC.md` moest groen blijven en is groen gebleven
- Next allowed wave after green completion: `WAVE_04_PULSE_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md`

Validation snapshot:

- `cmd /c npm test` -> `75 passed`
- `cmd /c npm run build` -> groen
- `cmd /c npx tsc --noEmit` -> groen in seriële run na build
- `.\.venv\Scripts\python.exe -m pytest tests/test_api_flows.py tests/test_pulse_scoring.py -q` -> `29 passed`
- Twee-cycle Pulse smoke -> groen: `Pulse April` (`avg_risk_score 4.75`) naar `Pulse Mei` (`avg_risk_score 2.12`), `10` completes op tweede cycle, Pulse report blijft bewust `422`
- Frontend-handoff en repeat motion zijn afgedekt via Pulse dashboardtests, onboardingtests en page-integratie; de auth-protected campaign route is niet in browser-smoke omzeild

## Why This Wave Now

Deze wave volgde direct uit wat al in de codebase aanwezig was:

- Pulse had al `topSummaryCards`, `managementBlocks`, `primaryQuestion`, `nextStep` en `followThroughCards` in het dashboardviewmodel
- Pulse had al focusvragen en action playbooks in [action-playbooks.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/pulse/action-playbooks.ts) en [focus-questions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/pulse/focus-questions.ts)
- Pulse had al reviewdelta in de campaign page, maar nog geen echt afgeronde managementhandoff als productvorm
- de Pulse-definition copy verwees nog naar wave-1 snapshotgrenzen, terwijl `WAVE_02` al echte bounded vergelijking toevoegde
- de Pulse-route verving de rapportknop wel bewust met een chip, maar had nog geen expliciete klantwaardige handoffpositionering

Dat maakte `WAVE_03` de eerstvolgende logische en gecontroleerde stap:

- niet opnieuw de meetlogica verbreden
- niet nu al publieke routeactivatie doen
- eerst zorgen dat een bestaande Pulse-cycle helder vertelt: wat is de managementread, wat moet er nu gebeuren, wie trekt het, en wanneer is een volgende Pulse logisch

## Planned User Outcome

Na deze wave moet een Verisight-beheerder of klantgebruiker:

- een Pulse-campaign kunnen lezen als compacte managementhandoff in plaats van alleen als reeks dashboardblokken
- direct kunnen zien wat nu de kernboodschap, prioriteit, eerste eigenaar en eerstvolgende recheck is
- Pulse-playbooks daadwerkelijk in de campaign page kunnen gebruiken
- scherper kunnen onderscheiden wanneer een volgende Pulse logisch is en wanneer eerst een diepere diagnose of andere productlijn nodig blijft

Wat deze wave nog niet hoefde te leveren:

- een publieke Pulse-productpagina
- een Pulse-PDF of backend reportgenerator
- automatische scheduling, reminders of workflowjobs
- meer dan één vorige Pulse in de vergelijking
- teamlokalisatie of managerniveau-output

## Scope In

- dashboard-native managementhandoff voor Pulse boven op de bestaande snapshot- en reviewlaag
- activeren van bestaande Pulse action playbooks in de Pulse campaign page
- expliciete repeat motion copy en logica binnen Pulse zelf
- alignment van methodiek-, evidencestatus- en productcopy met de huidige `WAVE_02`-implementatie
- onboarding naar first review value binnen de bestaande dashboardflow
- tests, docs en smoke-validatie voor klantwaardige Pulse-managementread

## Scope Out

- Pulse PDF/report endpoint of downloadbare PDF-output
- publieke pricing- of productrouteactivatie
- nieuwe backend endpoints, jobs of scheduling-infrastructuur
- opgeslagen actieplannen, taken of reminderflows
- brede historische trendengine of vergelijking met meer dan één vorige Pulse
- TeamScan- of Onboarding-werk

## Dependencies

- [PHASE_1_STEP_1_NORTH_STAR_DECISION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_1_STEP_1_NORTH_STAR_DECISION_PLAN.md)
- [PHASE_1_STEP_2_ICP_PACKAGING_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_1_STEP_2_ICP_PACKAGING_BOUNDARIES_PLAN.md)
- [PHASE_2_STEP_1_SYSTEM_LAYERS_DOMAIN_BOUNDARIES_AND_ARTIFACT_LIFECYCLE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_2_STEP_1_SYSTEM_LAYERS_DOMAIN_BOUNDARIES_AND_ARTIFACT_LIFECYCLE_PLAN.md)
- [PHASE_3_STEP_1_PLAN_LIBRARY_NAMING_AND_BUILD_WAVE_GOVERNANCE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_3_STEP_1_PLAN_LIBRARY_NAMING_AND_BUILD_WAVE_GOVERNANCE_PLAN.md)
- [PHASE_3_STEP_2_PULSE_MASTER_INDEX_AND_FIRST_BUILD_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_3_STEP_2_PULSE_MASTER_INDEX_AND_FIRST_BUILD_WAVE_STACK_PLAN.md)
- [WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_PULSE_FOUNDATION_VERTICAL_SLICE.md)
- [WAVE_02_PULSE_REVIEW_LOOP_AND_DELTA_LOGIC.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_02_PULSE_REVIEW_LOOP_AND_DELTA_LOGIC.md)

## Key Changes

- Pulse blijft dashboard-first, maar heeft nu een expliciete managementhandoff in plaats van alleen losse summary-, review- en follow-throughblokken.
- De bestaande Pulse playbooks zijn daadwerkelijk onderdeel van de Pulse campaign page geworden.
- Repeat motion is productmatig scherper gemaakt: Pulse is de korte hercheck na keuze of correctie, niet een herlabelde RetentieScan en ook niet een zelfstandige brede diagnose.
- Pulse methodiek- en trustcopy is geactualiseerd naar de huidige implementatiestatus: compact, bounded, vergelijkbaar met precies één vorige Pulse en eerlijk over wat nog niet ondersteund wordt.

## Belangrijke Interfaces/Contracts

### 1. Pulse Management Handoff Contract

`WAVE_03` voegt voor Pulse een expliciete managementhandofflaag toe boven op de bestaande dashboardoutput.

De handoff bevat minimaal:

- wat is nu de managementsamenvatting
- wat is het primaire werkspoor
- wat moet er nu eerst besloten of getoetst worden
- wie is de eerste eigenaar
- wanneer is de eerstvolgende check logisch

Beslissing:

- deze handoff blijft dashboard-native
- er is in deze wave geen PDF-contract of nieuw backend artifact toegevoegd
- de handoff is opgebouwd uit bestaande Pulse dashboarddata en reviewdelta, niet uit nieuwe analytische bronnen

### 2. Pulse Repeat Motion Contract

Pulse repeat motion betekent in deze wave:

- een begrensde hercheck na een eerdere diagnose, baseline of eerdere Pulse
- gericht op een kleine set actuele werksporen en zichtbare opvolging
- bedoeld om te toetsen of een gekozen correctie, review of managementbesluit verschuiving geeft

Pulse repeat motion betekent niet:

- volledige vervanging van `RetentieScan`
- brede herdiagnose van het hele behoudsvraagstuk
- geautomatiseerde cadans, reminders of workflow orchestration

Beslissing:

- repeat motion is nu als productread en managementcopy vastgelegd
- er is geen persisted cadence-model of scheduling state toegevoegd

### 3. Pulse Playbook Activation Contract

De bestaande Pulse playbooks en focusvragen mochten in `WAVE_03` productmatig zichtbaar worden wanneer:

- er voldoende Pulse-data is om managementread veilig te tonen
- de relevante werkfactoren een bruikbaar signaal geven

Beslissing:

- de al aanwezige Pulse playbooks en focusvragen zijn hergebruikt
- er is geen nieuw playbookframework gebouwd
- Pulse heeft niet dezelfde diepte of segmentlaag gekregen als `RetentieScan`

### 4. Pulse Copy Alignment Contract

Na `WAVE_02` zijn deze Pulse-copyvelden inhoudelijk synchroon gemaakt met de feitelijke productrealiteit:

- `methodologyText`
- `howToReadText`
- `evidenceStatusText`
- relevante dashboard boundary- en handoffcopy

Beslissing:

- verwijzingen die Pulse nog als louter wave-1 snapshot positioneerden zijn verwijderd
- expliciete bounded language rond privacy, groepsniveau en beperkte trendclaim is behouden
- de onderscheidende positionering tegenover `RetentieScan` is intact gebleven

### 5. First-Value Management Output Contract

In deze wave geldt als default:

- geen Pulse PDF
- geen export endpoint
- wel een klantwaardige, scanbare managementoutput in de campaign page

Beslissing:

- er is geen compact share- of handoffartifact buiten de dashboardruntime toegevoegd
- backend reportgeneration voor Pulse blijft `422`

## Primary Code Surfaces

### Existing Surfaces To Extend

- [frontend/lib/products/pulse/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/pulse/dashboard.ts)
- [frontend/lib/products/pulse/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/pulse/definition.ts)
- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx)
- [frontend/lib/client-onboarding.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/client-onboarding.ts)

### Existing Runtime Reads To Reuse

- current `campaign_stats` read
- current `survey_responses` + `respondents` data already used for Pulse snapshot and reviewdelta
- existing `previousStats` and Pulse comparison state from `WAVE_02`

### Existing Behaviors To Keep

- Pulse report route blijft bewust niet ondersteund
- Pulse blijft campaign-centered
- vergelijking blijft beperkt tot precies één vorige Pulse

## Work Breakdown

### Track 1 - Management Output Alignment

Tasks:

- [x] Definieer een expliciete Pulse managementhandoff boven op de bestaande summary- en reviewsecties.
- [x] Maak zichtbaar wat nu de kernboodschap, eerste prioriteit, eerste eigenaar en eerstvolgende reviewmoment zijn.
- [x] Houd de huidige Pulse dashboardread compact en scanbaar; voorkom een retentie-achtige overbouw.

Definition of done:

- [x] Een Pulse-campaign voelt als een compacte managementread in plaats van als een verzameling losse signal cards.
- [x] De handoff kan zonder extra toelichting worden gebruikt in een management- of HR-review.

### Track 2 - Playbooks and Follow-Through Activation

Tasks:

- [x] Activeer de bestaande Pulse action playbooks op de Pulse campaign page.
- [x] Zorg dat focusvragen, reviewdelta en playbooks inhoudelijk op elkaar aansluiten.
- [x] Houd de Pulse follow-through bounded: kleine correctie, review, hercheck.

Definition of done:

- [x] Pulse gebruikt de bestaande productassets voor focusvragen en playbooks daadwerkelijk in de UI.
- [x] De campaign page laat een duidelijke route zien van signaal naar besluit naar eerstvolgende check.

### Track 3 - Repeat Motion Sharpening

Tasks:

- [x] Maak expliciet wanneer een volgende Pulse logisch is en wanneer eerst een andere productvorm of diepere diagnose nodig blijft.
- [x] Werk copy en next-step logica uit zodat Pulse niet verward wordt met `RetentieScan ritme`.
- [x] Gebruik alleen afleidbare, huidige state uit dashboard en reviewdelta; geen persistente scheduling toevoegen.

Definition of done:

- [x] Pulse heeft een duidelijke repeat motion als productvorm.
- [x] De route naar "nog een Pulse" versus "eerst andere interventie of diagnose" is inhoudelijk scherper.

### Track 4 - Methodology, Trust, and Product Copy

Tasks:

- [x] Actualiseer Pulse methodology- en evidencecopy naar de huidige `WAVE_02`-realiteit.
- [x] Houd privacy-, groepsniveau- en interpretatiegrenzen expliciet zichtbaar.
- [x] Stem de UI-copy af op wat Pulse echt levert: bounded monitoring, reviewdelta, geen hard effectbewijs.

Definition of done:

- [x] Pulse-copy is intern consistent met de echte implementatie.
- [x] Claims, UX en meetlogica zijn voor Pulse beter aligned dan voor deze wave.

### Track 5 - Tests, Docs, and Smoke Validation

Tasks:

- [x] Voeg tests toe voor de nieuwe Pulse managementhandoff en repeat-motion logica.
- [x] Bevestig dat Pulse report/PDF nog steeds veilig begrensd blijft.
- [x] Werk dit wave-document bij tijdens uitvoering.
- [x] Voer een smoke-flow uit die bewijst dat een tweede Pulse-cycle nu niet alleen delta maar ook klantwaardige managementread ondersteunt.

Definition of done:

- [x] De relevante frontend-, typecheck- en buildgates zijn groen.
- [x] De smoke-flow bewijst een klantwaardige Pulse-managementread binnen de huidige dashboardruntime.
- [x] Documentatie is synchroon met de feitelijke implementatie.

## Testplan

### Automated Tests

- [x] Pulse managementhandoff rendert de kernsamenvatting, prioriteit, eigenaar en reviewmoment correct.
- [x] Pulse repeat-motion copy blijft onderscheidbaar van `RetentieScan`.
- [x] Pulse methodology/evidencecopy verwijst niet meer naar alleen wave-1 snapshot-gedrag.
- [x] Pulse lifecycle-/onboardinglogica benoemt bounded vervolg en eerlijke escalatie naar diepere diagnose.
- [x] Pulse report route blijft `422`.

### Integration Checks

- [x] Een Pulse-campaign zonder vorige Pulse blijft een coherente snapshot- en handoffread tonen.
- [x] Een Pulse-campaign met veilige vorige Pulse toont reviewdelta plus managementhandoff.
- [x] Pulse playbooks sluiten aan op de actieve topfactoren en bounded follow-through.
- [x] Exit en retention campaign pages blijven intact.

### Smoke Path

1. [x] Maak organisatie `X` aan.
2. [x] Maak een eerste Pulse-campaign aan voor organisatie `X` en haal voldoende responses op.
3. [x] Maak een tweede Pulse-campaign aan voor dezelfde organisatie en haal opnieuw voldoende responses op.
4. [x] Valideer de tweede Pulse-campaign data-driven en via frontendtests op managementhandoffgedrag.
5. [x] Controleer dat:
   - reviewdelta nog steeds zichtbaar is
   - de managementhandoff expliciet samenvat wat nu eerst moet gebeuren
   - een eerste eigenaar en reviewmoment zichtbaar zijn
   - Pulse playbooks bruikbaar zichtbaar zijn
   - de repeat motion duidelijk aangeeft wanneer een volgende Pulse logisch is
6. [x] Controleer dat een Pulse zonder veilige vergelijking nog steeds bounded en coherent leest.
7. [x] Controleer dat het Pulse reportpad nog steeds veilig begrensd blijft.

## Assumptions/Defaults

- De bestaande dashboardruntime was voldoende om Pulse klantwaardiger te maken zonder PDF/reportinfrastructuur toe te voegen.
- De al aanwezige Pulse playbooks en focusvragen waren inhoudelijk voldoende basis voor `WAVE_03`; de hoofdtaak was activatie en alignment, niet nieuwe methodiekbouw.
- Repeat motion blijft in deze wave afleidbare productlogica, geen persisted scheduling.
- Pulse mag klantwaardiger worden zonder buyer-facing activatie.
- Bij spanning tussen "compact houden" en "meer output tonen" kreeg scanbare managementhandoff prioriteit boven extra breedte.

## Product Acceptance

- [x] Pulse voelt nu als een echte managementproductvorm en niet alleen als werkende monitoringflow.
- [x] Een klant of beheerder ziet wat nu moet gebeuren zonder zelf losse dashboardblokken te hoeven vertalen.
- [x] Pulse repeat motion is duidelijker en niet verwarrend ten opzichte van `RetentieScan`.

## Codebase Acceptance

- [x] De wave hergebruikt bestaande Pulse productassets en bouwt geen nieuwe brede export- of schedulinglaag.
- [x] De wijzigingen blijven begrensd tot Pulse dashboard, Pulse copy en Pulse follow-through surfaces.
- [x] Exit- en retentionpaden blijven intact.

## Runtime Acceptance

- [x] Pulse campaign pages tonen een klantwaardige managementhandoff binnen de huidige runtime.
- [x] Pulse reviewdelta blijft werken zoals in `WAVE_02`.
- [x] Pulse report/PDF blijft buiten scope en veilig afgeschermd.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] Een Pulse twee-cycle smoke-flow is succesvol uitgevoerd.
- [x] Pulse-boundaries ten opzichte van RetentieScan blijven inhoudelijk scherp.
- [x] De handoff leest als managementroute, niet als brede rapportmachine.

## Documentation Acceptance

- [x] Dit wave-document blijft synchroon met de feitelijke implementatie.
- [x] `WAVE_02` blijft gesloten en groen.
- [x] Het is na afronding duidelijk dat `WAVE_03` de actieve en daarna afgesloten source of truth was.
- [x] `WAVE_04` opent pas na expliciete green close-out van deze wave.

## Risks To Watch

- Pulse-output wordt alsnog te breed of te rapportachtig, waardoor de kracht van compacte review verloren gaat.
- Repeat motion wordt inhoudelijk te dicht bij `RetentieScan ritme` getrokken.
- Handoffcopy klinkt sterker dan wat de bounded Pulse-meting echt kan dragen.
- De bestaande Pulse playbooks blijken in de UI zwaarder of diffuser dan bedoeld.
- Productcopy en methodiekcopy raken opnieuw uit sync met de feitelijke runtime.

## Not In This Wave

- Geen publieke Pulse-route of pricingactivatie.
- Geen PDF/reportgenerator voor Pulse.
- Geen nieuwe backend endpoints of exportcontracten.
- Geen schedulingengine, reminders of actieplan-opslag.
- Geen TeamScan-werk.
- Geen Onboarding 30-60-90-werk.

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] Pulse een expliciete managementhandoff heeft binnen de campaign page
- [x] Pulse playbooks en repeat motion productmatig coherent zichtbaar zijn
- [x] Pulse-copy en methodiekclaim aligned zijn met de huidige implementatie
- [x] code, docs, tests en smoke-validatie groen zijn

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_04_PULSE_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md`
