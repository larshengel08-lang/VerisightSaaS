# WAVE_04_TEAMSCAN_TRUST_SUPPRESSION_AND_QA_PARITY.md

## 1. Title

Bring TeamScan trust visibility, suppression clarity, and QA discipline up to parity level, without widening TeamScan beyond its current `department`-first and group-level boundary.

## 2. Korte Summary

Deze wave volgde direct op:

- [WAVE_03_TEAMSCAN_REPORT_AND_FORMAL_OUTPUT_PARITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_03_TEAMSCAN_REPORT_AND_FORMAL_OUTPUT_PARITY.md)
- [TEAMSCAN_PARITY_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TEAMSCAN_PARITY_WAVE_STACK_PLAN.md)

De kern van `WAVE_01` tot en met `WAVE_03` was:

- TeamScan methodisch zelfstandiger maken
- de managementlaag verdiepen
- formele output parity openen

De parity-gap die hier nog openstond was:

- trust en suppressie waren inhoudelijk al redelijk sterk, maar nog niet overal even expliciet zichtbaar
- privacy- en suppressiegedrag moesten gelijker gaan lopen tussen dashboard, report, runtime en tests
- TeamScan had nog een kleinere acceptance-discipline dan `ExitScan` en `RetentieScan`

Deze wave deed niet:

- buyer-facing routewijzigingen
- manager ranking, named leaders, hierarchy of location-scope
- bredere TeamScan-scope
- parity closeout als eindbesluit

Deze wave deed wel:

- TeamScan trust- en suppressiegedrag explicieter maken in output en runtime
- bounded privacytaal strakker gelijktrekken tussen dashboard en report
- acceptance, regressies en smoke versterken rond lokale uitsplitsing en veilige groepsweergave

Status van deze wave:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: completed; next parity wave may open
- Next allowed wave after green completion: `WAVE_05_TEAMSCAN_PARITY_CLOSEOUT.md`

Huidige implementatie-uitkomst:

- TeamScan dashboardstates maken nu explicieter zichtbaar wanneer lokale leesbaarheid nog in opbouw is, wanneer metadata tekortschiet en wanneer kleinere groepen bewust onderdrukt blijven.
- TeamScan report copy noemt nu ook explicieter wanneer terugschakelen naar bredere diagnose verstandiger is dan lokale schijnprecisie.
- Suppressie, veilige groepen en bounded trusttaal zijn nu harder afgedekt in regressies.
- Repo-brede validatie is groen:
  - `npm test -- --run lib/products/team/dashboard.test.ts` -> `8 passed`
  - `pytest tests/test_team_scoring.py -q` -> `5 passed`
  - `pytest tests/test_api_flows.py tests/test_team_scoring.py -q` -> `52 passed`
  - `npm test` -> `98 passed`
  - `npm run build` -> groen
  - `npx next typegen` -> groen
  - `node node_modules\\typescript\\bin\\tsc --noEmit` -> groen

---

## 3. Why This Wave Now

Na `WAVE_03` was TeamScan inhoudelijk en formeel duidelijk volwassener:

- de reportroute werkte bounded correct
- dashboard en formele output vertelden hetzelfde TeamScan-verhaal
- de grootste objectieve parity-gap rond `422` was weg

Daardoor werd het nu belangrijker dat TeamScan ook op trust- en QA-niveau even volwassen zou lezen als de kernproducten.

De codebase liet zien dat daar nog winst zat:

- [frontend/lib/products/team/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts) bevatte al suppressie-aware states zoals `needs_more_responses`, `needs_metadata` en `needs_safe_groups`, maar die boundaries konden zichtbaarder
- [backend/products/team/report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/report_content.py) benoemde veilige groepen en bounded lokale leesbaarheid al, maar nog niet stevig genoeg als parity-contract
- [backend/products/team/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/scoring.py) borgde de bounded productidentiteit, maar nog niet alle trust- en suppressie-uitkomsten waren paritywaardig afgedekt in acceptance

Deze wave ging daarom niet over bredere functionaliteit, maar over het harder en zichtbaarder maken van wat TeamScan al bewust niet claimt.

---

## 4. Planned User Outcome

Na deze wave kan een Verisight-operator of managementgebruiker:

- sneller zien wanneer TeamScan lokaal veilig leesbaar is en wanneer juist niet
- in dashboard en report dezelfde bounded taal terugzien over suppressie, kleine groepen en lokale interpretatiegrenzen
- erop vertrouwen dat TeamScan niet volwassen oogt op marketing of report terwijl privacy- en suppressiegedrag nog impliciet blijft
- weten wanneer de juiste vervolgstap juist `niet verder lokaliseren` maar `terug naar bredere diagnose` is

Wat deze wave bewust nog niet leverde:

- nieuwe TeamScan-features
- buyer-facing herpositionering
- manager- of hierarchy-logica
- parity-closeout van het hele product

---

## 5. Scope In

- trust/suppressie parity voor TeamScan
- explicietere veilige-groep- en metadata-boundaries in dashboard en report
- sterkere QA- en regressiediscipline rond suppressie en bounded interpretatie
- docs-update en smoke-validatie voor trust/QA parity

## 6. Scope Out

- buyer-facing routewijzigingen
- manager ranking
- named leaders
- hierarchy/reporting line logic
- location expansion
- nieuwe TeamScan-scope
- parity closeout

---

## 7. Dependencies

- [WAVE_03_TEAMSCAN_REPORT_AND_FORMAL_OUTPUT_PARITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_03_TEAMSCAN_REPORT_AND_FORMAL_OUTPUT_PARITY.md)
- [WAVE_02_TEAMSCAN_DASHBOARD_AND_MANAGEMENT_DEPTH_PARITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_02_TEAMSCAN_DASHBOARD_AND_MANAGEMENT_DEPTH_PARITY.md)
- [TEAMSCAN_PARITY_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TEAMSCAN_PARITY_WAVE_STACK_PLAN.md)
- [TEAMSCAN_PARITY_GAP_ANALYSIS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TEAMSCAN_PARITY_GAP_ANALYSIS_PLAN.md)

---

## 8. Key Changes

- TeamScan trusttaal is explicieter en consistenter geworden tussen dashboard, report en runtime
- suppressie- en metadata-uitkomsten zijn harder gecontracteerd en beter getest
- acceptance is verschoven van "bounded genoeg" naar "paritywaardig zichtbaar en aantoonbaar bewaakt"
- TeamScan bleef klein in scope, maar minder impliciet in safety posture

---

## 9. Belangrijke Interfaces / Contracts

### 9.1 Safe Group Visibility Contract

Na deze wave laat TeamScan duidelijker zien:

- wanneer lokale afdelingsread veilig zichtbaar is
- hoeveel groepen onderdrukt blijven
- wanneer metadata onvoldoende is voor eerlijke lokale duiding

Decision boundary:

- geen named of small-group output
- wel expliciete visibility van waarom iets onderdrukt of nog niet leesbaar is

### 9.2 Dashboard / Report Trust Alignment Contract

Na deze wave dragen dashboard en report dezelfde bounded trusttaal over:

- department-first lokalisatie
- kleine groepen
- manager- en named-leader boundaries
- causaliteitsgrenzen

Decision boundary:

- report en dashboard mogen andere vorm hebben
- ze mogen geen verschillende trustboodschap vertellen

### 9.3 TeamScan QA Contract

Na deze wave is TeamScan paritywaardiger getest op:

- onvoldoende responses
- onvoldoende metadata
- geen veilige groepen
- wel veilige groepen
- bounded reporttaal bij suppressiegevoelige situaties

Decision boundary:

- geen generieke testverbreding zonder TeamScan-reden
- wel expliciete regressies voor precies de bounded risico's van TeamScan

### 9.4 Boundaries That Stay Locked

Bleven expliciet dicht:

- `department`-first only
- geen manager ranking
- geen named leaders
- geen hierarchy/reporting line model
- geen performance framing
- geen verbreding naar brede team-governance software

---

## 10. Primary Code Surfaces

- [frontend/lib/products/team/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts)
- [frontend/lib/products/team/dashboard.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.test.ts)
- [backend/products/team/report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/report_content.py)
- [backend/products/team/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/scoring.py)
- [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [tests/test_team_scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_team_scoring.py)
- [tests/test_api_flows.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py)

---

## 11. Work Breakdown

### Track 1 - Trust Language Alignment

Tasks:

- [x] TeamScan trust- en boundarytaal gelijkgetrokken tussen dashboard en report.
- [x] Suppressie, veilige groepen en metadata-grenzen explicieter zichtbaar gemaakt waar dat nog impliciet bleef.
- [x] Alle trusttaal department-first en non-managerial gehouden.

Definition of done:

- [x] Dashboard en report spreken een expliciet gelijk trustverhaal.
- [x] TeamScan leest veiliger en rustiger zonder breder of defensiever te worden.

### Track 2 - Suppression And Runtime Boundary Hardening

Tasks:

- [x] Gecontroleerd of suppressie-uitkomsten paritywaardig zichtbaar zijn in TeamScan states.
- [x] Runtime- of reportgedrag voor kleine groepen en onvolledige metadata versterkt waar dat nodig was.
- [x] Geborgd dat TeamScan netjes terugschakelt naar bredere diagnose wanneer lokale uitsplitsing nog niet veilig genoeg is.

Definition of done:

- [x] Kleine groepen en onvolledige metadata worden paritywaardig bounded afgehandeld.
- [x] TeamScan claimt niet meer lokale precisie dan de data eerlijk dragen.

### Track 3 - QA And Smoke Parity

Tasks:

- [x] Tests voor suppressie, metadata en veilige groepsgrenzen toegevoegd of bijgewerkt.
- [x] De smoke-route expliciet gemaakt voor onveilige, opbouw- en veilige TeamScan-scenario's.
- [x] Docs en source-of-truth status synchroon bijgewerkt.

Definition of done:

- [x] TeamScan trust- en suppressierisico's zijn expliciet afgedekt in regressies.
- [x] De wave heeft een duidelijke green QA-closeout.

---

## 12. Testplan

### Automated Tests

- [x] Dashboardtests voor `needs_more_responses`, `needs_metadata`, `needs_safe_groups` en `ready`
- [x] Regressies voor expliciete suppressie- en trusttaal in TeamScan output
- [x] Backend tests voor bounded TeamScan reportinhoud bij veilige en onveilige lokale leesbaarheid
- [x] Regressies die bevestigen dat TeamScan geen manager-, named-leader- of hierarchy-framing introduceert

### Integration Checks

- [x] Dashboard en report tonen hetzelfde bounded verhaal over veilige groepen en suppressie
- [x] TeamScan schakelt bij onveilige lokale leesbaarheid terug naar bounded context in plaats van naar schijnprecisie
- [x] Trusttaal blijft expliciet, compact en niet juridisch of defensief

### Smoke Path

1. Gebruik een TeamScan-campaign met te weinig responses voor lokale read.
2. Gebruik een TeamScan-campaign met wel genoeg responses maar onvoldoende department-metadata.
3. Gebruik een TeamScan-campaign met afdelingen onder de veilige groepsgrens.
4. Gebruik een TeamScan-campaign met meerdere veilige afdelingsgroepen.
5. Controleer per scenario dat dashboard, report en tests dezelfde suppressie- en boundarylogica dragen.

Status:

- [x] De smoke-route is helper-, report- en regressiegedreven afgedekt.
- [x] De repo-brede frontend- en TeamScan backend-gates zijn groen.

---

## 13. Assumptions / Defaults

- TeamScan trust parity ging vooral over zichtbaarheid en discipline, niet over nieuwe productomvang.
- De bestaande TeamScan suppressie- en privacyfundamenten waren al redelijk sterk; deze wave maakte ze explicieter en beter bewaakt.
- Dashboard en report moesten hetzelfde bounded verhaal vertellen, ook wanneer lokale leesbaarheid nog in opbouw is.
- `department`-first bleef de primaire TeamScan-boundary.

---

## 14. Acceptance

### Product acceptance
- [x] TeamScan trust posture voelt paritywaardiger naast ExitScan en RetentieScan.
- [x] De bounded lokalisatierol blijft intact.
- [x] Geen verschuiving naar bredere teamsoftware of people-judgment.

### Codebase acceptance
- [x] Wijzigingen bleven klein en productgericht.
- [x] Geen generieke platformverbreding zonder directe parityreden.
- [x] Boundaries bleven intact.

### Runtime acceptance
- [x] TeamScan-output blijft department-first en group-level only.
- [x] Dashboard en report spreken een gelijk trust- en suppressieverhaal.
- [x] Onveilige lokale context wordt bounded en expliciet afgehandeld.

### QA acceptance
- [x] Relevante repo-brede tests zijn groen.
- [x] TeamScan suppressie- en trustregressies zijn groen.
- [x] Smoke-validatie bevestigt paritywinst in trust, suppressie en QA-discipline.

### Documentation acceptance
- [x] Dit wavedocument blijft synchroon met de feitelijke implementatie.
- [x] Het is na afronding duidelijk dat `WAVE_04` de actieve source of truth was.
- [x] `WAVE_05_TEAMSCAN_PARITY_CLOSEOUT.md` mag nu openen.

---

## 15. Risks To Watch

- suppressie blijft inhoudelijk correct maar te impliciet zichtbaar
- report en dashboard gaan verschillende trusttaal gebruiken
- TeamScan wordt te defensief in plaats van helderder
- QA verbreedt te generiek in plaats van precies op TeamScan-risico's

Uitkomst:

- Deze risico's zijn in deze wave begrensd en beter afgedekt geraakt; de resterende stap is nu formele parity-closeout.

---

## 16. Not In This Wave

- Geen buyer-facing routewijzigingen
- Geen manager ranking
- Geen named leaders
- Geen hierarchy/reporting line model
- Geen location expansion
- Geen bredere TeamScan-scope
- Geen parity closeout

---

## 17. Exit Gate

Deze wave is klaar wanneer:

- [x] dashboard en report hetzelfde bounded suppressie- en trustverhaal vertellen
- [x] onveilige of onvolledige lokale context paritywaardig zichtbaar en getest is
- [x] TeamScan geen schijnprecisie toont bij kleine groepen of zwakke metadata
- [x] de bounded productgrenzen intact zijn gebleven
- [x] code, docs, tests en smoke-validatie groen zijn

---

## 18. Next Allowed Wave

Na green close-out van deze wave mag nu openen:

- `WAVE_05_TEAMSCAN_PARITY_CLOSEOUT.md`
