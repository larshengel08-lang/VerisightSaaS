# WAVE_02_TEAMSCAN_LOCALIZATION_AND_PRIORITY_LOGIC

## Title

Turn the TeamScan foundation slice into a safe localization layer that shows which departments ask for first verification, without drifting into manager ranking or broad causal claims.

## Korte Summary

`WAVE_01` bewees dat TeamScan als vierde productline technisch en productmatig kan landen binnen de huidige Verisight-runtime: admin setup, surveyflow, submit-validatie, scoring, dashboardread en PDF-boundary werken nu end-to-end. Wat nog ontbreekt is de kern van de TeamScan-belofte: management ziet nu al veilige lokale groepen, maar nog niet scherp genoeg welke afdeling eerst aandacht vraagt, waarom dat zo lijkt, en hoe dat verschilt van alleen "een paar lokale kaartjes onder elkaar".

Deze wave bouwt daarom niet aan nieuwe boundaries, geen managerlaag en geen nieuwe runtime-entiteiten. In plaats daarvan verdiept `WAVE_02` exact boven op de bestaande TeamScan-foundation:

- gebruik de bestaande `department`-first local read uit `WAVE_01`
- voeg suppressie-aware prioritering toe voor veilige groepen
- maak expliciet welke afdeling eerst verificatie verdient en welke alleen monitoringswaarde heeft
- vertaal de huidige lokale signalen naar bounded managementcopy: waar eerst kijken, wat eerst toetsen, wat nog niet claimbaar is

Status van deze wave:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: uitgevoerd en gevalideerd
- Dependencies: `WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE.md` moet groen blijven
- Next allowed wave after green completion: `WAVE_03_TEAMSCAN_MANAGEMENT_OUTPUT_AND_ACTION_HANDOFF.md`

Validation snapshot:

- `cmd /c npm test` -> `16 files passed`, `81 tests passed`
- `cmd /c npm run build` -> groen
- `cmd /c npx tsc --noEmit` -> groen
- `.\.venv\Scripts\python.exe -m pytest tests/test_team_scoring.py tests/test_api_flows.py -q` -> `33 passed`
- TeamScan priority helpertests bewijzen nu expliciet:
  - duidelijke lokale uitschieter -> `first_verify`
  - vlakke verschillen -> `no_hard_order`
  - fallback local read -> `not_available`
- Gescripte TeamScan API-smoke blijft groen: campaign create `201`, import `200`, submits `200`, stats `200`, report bewust `422`
- De auth-protected dashboardroute is niet als browserflow doorlopen; de TeamScan-priorityweergave is afgedekt via helpertests, typecheck en productiebuild

## Why This Wave Now

Deze wave volgt direct uit wat nu al in de codebase aanwezig is:

- TeamScan heeft al een `buildTeamLocalReadState` helper in [dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts)
- die helper bouwt al veilige `department`-groepen met `avgSignal`, `deltaVsOrg`, `topFactorLabel` en fallbackstates
- de campaign page heeft al een aparte `lokaal`-tab voor TeamScan
- TeamScan-focusvragen en playbooks bestaan al, maar worden nog niet gestuurd door een expliciete local priority-volgorde
- de huidige ordering is technisch vooral `avgSignal` en `deltaVsOrg`, maar nog niet productmatig uitgelegd als bounded prioritering

Daarmee is `WAVE_02` de logische vervolgstap:

- niet opnieuw de foundation verbreden
- niet nu al managementhandoff of buyer-facing activatie openen
- eerst bewijzen dat TeamScan echt "waar eerst kijken" kan leveren binnen de huidige privacy- en metadata-grenzen

## Planned User Outcome

Na deze wave moet een Verisight-beheerder of klantgebruiker:

- niet alleen lokale groepen zien, maar ook welke afdeling eerst verificatie vraagt
- kunnen lezen waarom die prioriteit ontstaat: hoger teamsignaal, afwijking versus organisatie, en dominant lokaal spoor
- expliciet kunnen zien welke groepen wel zichtbaar maar nog geen topprioriteit zijn
- kunnen zien wanneer TeamScan juist geen betrouwbare volgorde mag tonen

Wat deze wave nog niet hoeft te leveren:

- manager ranking
- location support
- cross-campaign TeamScan trendlogica
- volwaardige action handoff met definitieve eigenaar per lokaal spoor
- buyer-facing TeamScan activatie
- TeamScan PDF-output

## Scope In

- suppressie-aware local priority logic voor veilige `department`-groepen
- expliciete TeamScan-prioriteitsstatussen zoals `first_verify`, `watch`, `hold_boundary`
- bounded explanation copy voor waarom een afdeling eerst aandacht vraagt
- expliciete boundary-copy wanneer veilige groepen bestaan maar volgorde nog niet hard genoeg is
- TeamScan-specifieke prioritization helpers in frontend
- campaign page-integratie voor een duidelijke local priority-sectie of aangescherpte `lokaal`-tab
- tests voor voldoende metadata, onvoldoende metadata, kleine groepen en zwakke onderlinge verschillen
- docs-update van deze wave en relevante source-of-truth pointers

## Scope Out

- manager-, location- of multi-boundary support
- nieuwe backend endpoints of TeamScan-priority APIs
- generieke cross-product prioritization engine
- ranking van individuele managers of teams buiten `department`
- TeamScan routeactivatie in marketing of pricing
- TeamScan PDF/reporting
- bredere handoff- en ownershippolish uit `WAVE_03`

## Dependencies

- [PHASE_NEXT_STEP_1_TEAMSCAN_ENTRY_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_1_TEAMSCAN_ENTRY_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_2_TEAMSCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_2_TEAMSCAN_SYSTEM_AND_DATA_BOUNDARIES_PLAN.md)
- [PHASE_NEXT_STEP_3_TEAMSCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_3_TEAMSCAN_MASTER_INDEX_AND_WAVE_STACK_PLAN.md)
- [WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_01_TEAMSCAN_FOUNDATION_VERTICAL_SLICE.md)

## Key Changes

- TeamScan blijft `department`-first, maar krijgt nu een echte lokalisatielaag die zegt waar eerst verificatie logisch is.
- Prioritering blijft bewust bounded: alleen veilige groepen, alleen groepsniveau, geen manageroordeel, geen causaliteitsclaim.
- De huidige lokale group cards worden verdiept naar een productmatige priority-read in plaats van alleen een gesorteerde lijst.
- TeamScan-focusvragen en playbooks kunnen in deze wave explicieter gekoppeld worden aan de eerst aangewezen lokale prioriteit, zonder al brede managementhandoff te claimen.

## Belangrijke Interfaces/Contracts

### 1. Team Priority Eligibility Contract

Lokale prioritering mag alleen zichtbaar zijn wanneer:

- de TeamScan-campaign minimaal `MIN_N_PATTERNS` responses heeft
- `department`-coverage voldoende is
- er minimaal 1 veilige lokale groep bestaat met `n >= 5`
- de afdelingsverschillen niet volledig vlak of triviaal zijn

Als wel veilige groepen bestaan maar de verschillen te klein of te ambigu zijn:

- toon de lokale groepen nog wel
- toon geen harde volgorde als "eerst hier ingrijpen"
- toon expliciete boundary-copy dat TeamScan nu vooral lokale verificatiepunten laat zien, geen scherpe eerste prioriteit

Beslissing:

- `WAVE_02` mag alleen prioriteit claimen als de data het lokaal echt dragen
- een zichtbare lijst is niet automatisch hetzelfde als een harde volgorde

### 2. Team Priority State Contract

De nieuwe helperlaag levert per veilige groep minimaal:

- `label`
- `n`
- `avgSignal`
- `deltaVsOrg`
- `topFactorLabel`
- `priorityState`
- `priorityTitle`
- `priorityBody`
- `priorityTone`

Toegestane `priorityState`-waarden in deze wave:

- `first_verify`
- `watch_next`
- `monitor_only`
- `no_hard_order`

Beslissing:

- geen numerieke "rank 1 / rank 2 / rank 3" als hoofdtaal
- prioriteit wordt uitgelegd als bounded managementread, niet als leaderboard

### 3. Priority Logic Contract

De volgorde en het prioriteitslabel worden afgeleid uit bestaande TeamScan-signalen:

- `avgSignal`
- `deltaVsOrg`
- dominante lokale factor (`topFactorLabel`)
- groepsgrootte als safety boundary, niet als inhoudelijk bewijs

Beslissing:

- `WAVE_02` introduceert geen nieuwe methodische metric in backend
- prioritering wordt in frontend afgeleid uit bestaande response-data en `WAVE_01`-helperoutput
- als meerdere groepen dicht op elkaar liggen, wint boundary boven overprecisie

### 4. Interpretation Contract

`first_verify` betekent in deze wave alleen:

- deze afdeling lijkt op basis van het huidige teamsignaal de sterkste kandidaat voor eerste lokale verificatie

Het betekent niet:

- dat dit zeker de oorzaak is
- dat andere afdelingen veilig genegeerd kunnen worden
- dat de verantwoordelijke manager de oorzaak is

Beslissing:

- alle TeamScan-prioriteitscopy blijft verificatie- en lokalisatiegericht
- geen claims over bewezen effectiviteit van interventies

### 5. Dashboard Surface Contract

`WAVE_02` voegt voor TeamScan een explicietere local priority-read toe binnen de bestaande campaign page.

De UI toont minimaal:

- of er een harde eerste verificatieprioriteit is of niet
- waarom die prioriteit ontstaat
- welke groepen daarna volgen als `watch` of `monitor`
- wanneer de data expliciet te vlak of te beperkt zijn voor een harde volgorde

Beslissing:

- bouw voort op bestaande TeamScan `lokaal`-tab in plaats van een nieuwe page of route
- geen generieke dashboardcontract-uitbreiding zonder directe TeamScan-reden

## Primary Code Surfaces

### Existing Surfaces To Extend

- [frontend/lib/products/team/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts)
- [frontend/lib/products/team/dashboard.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.test.ts)
- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx)
- [frontend/lib/products/team/focus-questions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/focus-questions.ts)
- [frontend/lib/products/team/action-playbooks.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/action-playbooks.ts)

### Runtime Reads To Reuse

- bestaande `survey_responses` + `respondents` join uit de campaign page
- bestaande TeamScan `buildTeamLocalReadState` foundationhelper
- bestaande `factorAverages`, `averageRiskScore` en TeamScan dashboardcards uit `WAVE_01`

### Test Surfaces

- [frontend/lib/products/team/dashboard.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.test.ts)
- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.test.ts) if TeamScan page helper logic grows
- [tests/test_api_flows.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py) only if an additional smoke path needs fixture coverage

## Work Breakdown

### Track 1 - Safe Local Priority Helper

Tasks:

- [x] Breid de bestaande TeamScan local read helper uit of voeg een nieuwe helper toe voor bounded prioritering.
- [x] Maak onderscheid tussen zichtbare lokale groepen en echte eerste verificatieprioriteit.
- [x] Voeg expliciete fallback toe voor "veilige groepen, maar geen harde volgorde".
- [x] Houd de huidige `needs_more_responses`, `needs_metadata` en `needs_safe_groups` states intact.

Definition of done:

- [x] TeamScan kan een lokale priority-state berekenen zonder nieuwe backend-contracten.
- [x] Harde prioriteit verschijnt alleen als de data dat dragen.
- [x] Foundation fallbackstates uit `WAVE_01` blijven intact.

### Track 2 - TeamScan Priority Copy and UI

Tasks:

- [x] Werk de TeamScan `lokaal`-tab of equivalent uit naar een duidelijk priority-read.
- [x] Toon per veilige groep waarom die afdeling nu `first_verify`, `watch_next` of `monitor_only` is.
- [x] Voeg een samenvattende TeamScan-priority intro toe: wat vraagt eerst verificatie en waarom.
- [x] Houd de taal expliciet bounded: geen manager ranking, geen bewezen causaliteit.

Definition of done:

- [x] Een TeamScan-campaign toont een begrijpelijke local priority-read.
- [x] De UI helpt management kiezen waar eerst te kijken zonder overdreven precisie.
- [x] De page blijft coherent wanneer geen harde volgorde verantwoord is.

### Track 3 - Focus Questions and Playbook Coupling

Tasks:

- [x] Koppel de eerste lokale prioriteit explicieter aan bestaande TeamScan focusvragen.
- [x] Gebruik bestaande TeamScan playbooks om de eerstvolgende lokale verificatieroute te verscherpen.
- [x] Houd deze koppeling bewust smal: eerste verificatiespoor, niet al volledige managementhandoff.

Definition of done:

- [x] TeamScan-prioriteit leidt door naar relevante focusvragen en playbookrichting.
- [x] De productervaring voelt als lokalisatieplus-verificatie, niet alleen als lijst met factoren.

### Track 4 - Tests, Docs, and Smoke Validation

Tasks:

- [x] Voeg helpertests toe voor duidelijke eerste prioriteit, vlakke verschillen en suppressie/fallback.
- [x] Voeg tests toe voor meerdere veilige groepen en ambigue ordering.
- [x] Werk dit wave-document bij tijdens uitvoering.
- [x] Voer een gescripte smoke-flow uit met minimaal:
  - voldoende metadata en duidelijke lokale uitschieter
  - voldoende metadata maar kleine verschillen
  - onvoldoende veilige groepen

Definition of done:

- [x] De local priority logic is getest op sterke en zwakke lokalisatiescenario's.
- [x] De smoke-flow bewijst dat TeamScan niet te hard claimt bij platte of onveilige lokale verschillen.
- [x] Documentatie is synchroon met de feitelijke implementatie.

## Testplan

### Automated Tests

- [x] een TeamScan met duidelijke afwijkende afdeling toont `first_verify`
- [x] een TeamScan met meerdere veilige groepen maar minimale onderlinge verschillen toont `no_hard_order`
- [x] groepen onder `minimum_local_group_n` blijven onderdrukt
- [x] onvoldoende metadata blijft `needs_metadata`
- [x] bestaande TeamScan foundationstates uit `WAVE_01` blijven intact
- [x] ExitScan, RetentieScan en Pulse rendering blijven ongemoeid

### Integration Checks

- [x] TeamScan-campaign met meerdere afdelingen kan prioritering afleiden uit bestaande responses
- [x] TeamScan-campaign met slechts een veilige groep toont wel lokalisatie maar geen misleidende brede ranking
- [x] TeamScan-campaign met vlakke verschillen toont een boundary-notitie in plaats van harde eerste prioriteit
- [x] TeamScan report/PDF pad blijft bewust `422`

### Smoke Path

1. Maak organisatie `X` aan.
2. Maak een TeamScan-campaign aan voor organisatie `X`.
3. Voeg voldoende respondenten toe verdeeld over meerdere afdelingen.
4. Submit responses zodat:
   - afdeling A duidelijk hoger uitkomt dan organisatieniveau
   - afdeling B zichtbaar maar minder scherp is
   - afdeling C onder suppressiedrempel blijft
5. Controleer dat:
   - TeamScan een eerste verificatieprioriteit aanwijst voor afdeling A
   - afdeling B als `watch` of equivalent zichtbaar blijft
   - afdeling C niet unsafe zichtbaar wordt
6. Herhaal met een vlakker scenario waarin veilige groepen wel bestaan maar nauwelijks verschillen.
7. Controleer dat in dat scenario geen te harde volgorde wordt getoond.
8. Controleer dat TeamScan report/PDF bewust nog begrensd blijft.

## Assumptions/Defaults

- `WAVE_02` blijft volledig binnen de bestaande campaign-centered architectuur.
- `department` blijft de enige primaire TeamScan-v1 priority boundary.
- `role_level` blijft hoogstens context in copy en niet de basis van ranking.
- Prioritering wordt uit bestaande TeamScan signalen afgeleid; er komt geen nieuwe backend metric of apart priority-model.
- Wanneer verschillen tussen veilige groepen te klein zijn, kiest de UI voor boundary-copy boven geforceerde volgorde.
- `WAVE_02` maakt TeamScan scherper als lokalisatielaag, maar opent nog niet de volledige managementhandoff van `WAVE_03`.

## Product Acceptance

- [x] TeamScan voelt na deze wave aantoonbaar meer als lokalisatielaag dan als losse local read.
- [x] Management ziet waar eerst verificatie logisch is, zonder dat het product te veel claimt.
- [x] De productervaring blijft duidelijk verschillend van `Segment Deep Dive` en manager ranking.

## Codebase Acceptance

- [x] De prioriteringslogica blijft begrensd binnen TeamScan-specifieke helpers en page-integratie.
- [x] Er wordt geen generieke ranking- of localization engine vooruit gebouwd.
- [x] `WAVE_01`-foundation en andere productlijnen blijven intact.

## Runtime Acceptance

- [x] Een TeamScan-campaign kan veilige lokale prioriteit tonen bij voldoende data.
- [x] Een TeamScan-campaign toont expliciete boundarys bij ambigue of onveilige verschillen.
- [x] TeamScan PDF/report blijft buiten scope en veilig begrensd.

## QA Acceptance

- [x] Relevante tests zijn groen.
- [x] De TeamScan priority smoke-flow is succesvol uitgevoerd.
- [x] Prioritering voelt als lokale verificatiehulp, niet als manageroordeel of causaliteitsclaim.
- [x] Coverage- en suppressiegedrag blijven expliciet intact.

## Documentation Acceptance

- [x] Dit wave-document blijft synchroon met de feitelijke implementatie.
- [x] `WAVE_01` blijft gesloten en groen.
- [x] Het is na afronding duidelijk dat `WAVE_02` de actieve en daarna afgesloten source of truth was.
- [x] `WAVE_03` opent pas na expliciete green close-out van deze wave.

## Risks To Watch

- TeamScan-prioriteit voelt te hard of te precies voor de huidige datadichtheid.
- De UI schuift alsnog richting impliciete manager ranking.
- Groepen met kleine onderlinge verschillen krijgen toch een kunstmatige volgorde.
- De implementatie voegt onnodig generieke rankinginfrastructuur toe "voor later".
- De focus op prioriteit verdringt de privacy- en suppressiegrenzen uit beeld.

## Not In This Wave

- Geen manager- of location-support.
- Geen buyer-facing TeamScan routeactivatie.
- Geen TeamScan PDF-output.
- Geen cross-campaign TeamScan trendengine.
- Geen brede managementhandoff buiten eerste verificatierichting.
- Geen Onboarding 30-60-90-werk.

## Exit Gate

Deze wave is pas klaar wanneer:

- [x] TeamScan veilige lokale prioriteit kan tonen bij voldoende datakwaliteit
- [x] TeamScan expliciet terugvalt naar boundary-copy bij ambigue of onveilige lokale verschillen
- [x] de UI duidelijk maakt waar eerst verificatie logisch is zonder manager ranking of causaliteitsclaim
- [x] code, docs, tests en smoke-validatie groen zijn

## Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_03_TEAMSCAN_MANAGEMENT_OUTPUT_AND_ACTION_HANDOFF.md`
