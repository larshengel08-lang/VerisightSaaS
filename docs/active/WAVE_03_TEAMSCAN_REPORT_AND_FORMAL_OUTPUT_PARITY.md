# WAVE_03_TEAMSCAN_REPORT_AND_FORMAL_OUTPUT_PARITY.md

## 1. Title

Close the largest objective TeamScan parity gap by replacing the old `422` report boundary with bounded, management-grade formal output that matches what TeamScan already promises in dashboard and buyer-facing positioning.

## 2. Korte Summary

Deze wave volgt direct op:

- [WAVE_02_TEAMSCAN_DASHBOARD_AND_MANAGEMENT_DEPTH_PARITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_02_TEAMSCAN_DASHBOARD_AND_MANAGEMENT_DEPTH_PARITY.md)
- [TEAMSCAN_PARITY_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TEAMSCAN_PARITY_WAVE_STACK_PLAN.md)

De kern van `WAVE_01` en `WAVE_02` was:

- TeamScan inhoudelijk zelfstandiger maken
- de lokale read managementwaardiger maken
- prioriteit, eigenaar, eerste bounded check en reviewgrens coherenter maken

De grootste objectieve parity-gap die hier lag was:

- TeamScan had nog geen formele report/output parity
- de backend gaf bewust `422` voor TeamScan-reporting
- de campaign page toonde nog wel een generieke PDF-knop

Deze wave deed daarom niet:

- buyer-facing routewijzigingen
- manager ranking, named leaders, hierarchy of location-scope
- bredere teamsoftware of workflow-orchestratie
- trust/suppressie closeout als aparte hoofdlevering

Deze wave deed wel:

- formele TeamScan-output parity openen
- een productspecifieke TeamScan-reportlaag ontwerpen en bouwen
- dashboard, formele output en reportroute inhoudelijk op een lijn brengen
- de generieke PDF-ervaring voor TeamScan vervangen door bounded, productspecifiek gedrag

Status van deze wave:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: completed; next parity wave may open
- Next allowed wave after green completion: `WAVE_04_TEAMSCAN_TRUST_SUPPRESSION_AND_QA_PARITY.md`

Huidige implementatie-uitkomst:

- TeamScan heeft nu een eigen formele reportlaag en geeft niet langer bewust `422` op de reportroute.
- De formele output gebruikt TeamScan-specifieke managementtaal voor lokale prioriteit, eigenaar, bounded check en reviewgrens.
- De dashboard-PDF-flow is scan-type-aware gemaakt, zodat TeamScan nu ondersteunde output geeft en andere nog-niet-ondersteunde routes geen generieke technische fout meer tonen.
- Repo-brede validatie is groen:
  - `pytest tests/test_api_flows.py tests/test_team_scoring.py -q` -> `51 passed`
  - `npm test -- --run lib/products/team/dashboard.test.ts` -> `6 passed`
  - `npm test` -> `96 passed`
  - `npm run build` -> groen
  - `npx next typegen` -> groen
  - `node node_modules\\typescript\\bin\\tsc --noEmit` -> groen

---

## 3. Why This Wave Now

De parity-gap analysis legde al vast dat TeamScan vooral nog achterliep op:

- reportkwaliteit
- formele managementoutput
- acceptance als volledig product

De repo-realiteit bevestigde dat expliciet:

- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py) blokkeerde `team` eerst nog bewust op `/api/campaigns/{campaign_id}/report`
- [frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx) was nog generiek en wist niets van TeamScan-boundaries
- [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py) had al een brede report-engine, maar de echte productspecifieke reportcontracten werden nog vooral gedragen door `exit` en `retention`
- `backend/products/team` had nog geen eigen report/outputlaag

Na `WAVE_02` was TeamScan inhoudelijk en dashboardmatig sterk genoeg geworden om parity eerst naar report/output te brengen, voor trust/QA closeout.

---

## 4. Planned User Outcome

Na deze wave kan een Verisight-operator of managementgebruiker:

- TeamScan formeel downloaden of delen als bounded managementoutput
- in het report dezelfde TeamScan-logica terugzien als in dashboard en handoff
- lezen:
  - waar het signaal lokaal het scherpst speelt
  - welke lokale verificatie eerst logisch is
  - wie eerste eigenaar is
  - welke bounded eerste stap en reviewgrens horen bij deze read
- geen generieke PDF van Exit/Retentie-logica meer krijgen die TeamScan onbedoeld breder of diffuser maakt

Wat deze wave bewust nog niet leverde:

- volledige trust/suppressie closeout over alle outputlagen heen
- buyer-facing herpositionering
- nieuwe TeamScan-scope buiten `department`-first

---

## 5. Scope In

- TeamScan report/output parity
- productspecifieke formele managementoutput voor TeamScan
- vervanging van de oude `422` reportboundary voor `scan_type = team`
- bounded alignment tussen dashboard, report en routegedrag
- tests, smoke-validatie en docs-update voor TeamScan formal output

## 6. Scope Out

- buyer-facing routewijzigingen
- manager ranking
- named leaders
- hierarchy/reporting line logic
- location expansion
- trust/suppressie closeout als aparte parity-wave
- bredere TeamScan-scope

---

## 7. Dependencies

- [WAVE_02_TEAMSCAN_DASHBOARD_AND_MANAGEMENT_DEPTH_PARITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_02_TEAMSCAN_DASHBOARD_AND_MANAGEMENT_DEPTH_PARITY.md)
- [TEAMSCAN_PARITY_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TEAMSCAN_PARITY_WAVE_STACK_PLAN.md)
- [TEAMSCAN_PARITY_GAP_ANALYSIS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TEAMSCAN_PARITY_GAP_ANALYSIS_PLAN.md)

---

## 8. Key Changes

- TeamScan kreeg een eigen formele outputlaag in plaats van alleen dashboard + `422`
- de reportervaring werd TeamScan-specifiek in plaats van generiek afgeleid van Exit/Retentie
- de PDF-knop en reportroute crashen niet langer op een productgrens, maar tonen bounded correct gedrag
- formele output draagt nu dezelfde managementread als de huidige TeamScan dashboardlaag

---

## 9. Belangrijke Interfaces / Contracts

### 9.1 TeamScan Formal Output Contract

Na deze wave levert TeamScan formeel:

- lokale prioriteit
- eerste eigenaar
- eerste bounded check of actie
- reviewgrens
- expliciete productboundary

Decision boundary:

- geen generieke PDF-parity puur om de vorm
- wel TeamScan-specifieke output parity die inhoudelijk klopt met de productvraag

### 9.2 Report Route Contract

De oude backendreportboundary voor TeamScan was:

- `/api/campaigns/{campaign_id}/report` -> `422`

Na deze wave is dat voor `team` veranderd naar:

- een ondersteunde TeamScan-formele outputroute

Decision boundary:

- de change gold voor `team`
- `pulse`, `onboarding` en `leadership` bleven in deze wave buiten scope

### 9.3 Dashboard / Report Alignment Contract

Na deze wave dragen dashboard en formele output dezelfde lijn:

- zelfde managementbetekenis
- zelfde bounded first action
- zelfde owner/review language
- zelfde expliciete begrenzing

Decision boundary:

- report mag compacter of formeler zijn dan dashboard
- report mag niet een ander productverhaal vertellen dan dashboard

### 9.4 PDF Button Behavior Contract

De campaign UI toonde eerst nog generiek:

- [pdf-download-button.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx)

Na deze wave geeft de TeamScan-ervaring:

- echte ondersteunde download voor TeamScan
- productspecifiek bounded gedrag voor andere nog niet ondersteunde scan-types

Decision boundary:

- geen generieke foutmelding die alleen een technische mislukking suggereert
- wel bewust TeamScan-correct gedrag

### 9.5 Boundaries That Stay Locked

Bleven expliciet dicht:

- `department`-first only
- geen manager ranking
- geen named leaders
- geen hierarchy/reporting line model
- geen performance framing
- geen verbreding naar brede team-governance software

---

## 10. Primary Code Surfaces

- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [backend/products/team/__init__.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/__init__.py)
- [backend/products/team/report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/report_content.py)
- [frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/pdf-download-button.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [frontend/components/marketing/site-content.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/site-content.ts)
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [frontend/app/producten/[slug]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx)
- [tests/test_api_flows.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py)
- [tests/test_team_scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_team_scoring.py)

---

## 11. Work Breakdown

### Track 1 - TeamScan Report Contract

Tasks:

- [x] Vastgelegd welke formele TeamScan-output minimaal paritywaardig moest worden.
- [x] Een TeamScan-specifieke rapportlogica binnen de bestaande report-engine ontworpen.
- [x] De output bounded en department-first gehouden.

Definition of done:

- [x] TeamScan heeft een expliciet formeel outputcontract.
- [x] De formele output vertelt hetzelfde productverhaal als dashboard.

### Track 2 - Report Route And Delivery Behavior

Tasks:

- [x] De oude TeamScan `422` reportboundary vervangen door ondersteund gedrag.
- [x] Backendroute en frontend downloadervaring gelijkgetrokken.
- [x] TeamScan-reportgedrag productspecifiek gemaakt in plaats van generiek foutgedreven.

Definition of done:

- [x] TeamScan-reportdownload of formele output werkt bounded correct.
- [x] UI en backend spreken dezelfde taal over TeamScan-output.

### Track 3 - TeamScan Formal Management Read

Tasks:

- [x] Huidige TeamScan managementread vertaald naar formele output.
- [x] Lokale prioriteit, owner, eerste bounded check en reviewgrens formeel leesbaar gemaakt.
- [x] Onderscheid met `Segment Deep Dive` expliciet gehouden in de reportlaag.

Definition of done:

- [x] TeamScan-formele output is managementwaardig.
- [x] De reportlaag voelt niet meer duidelijk dunner dan dashboard.

### Track 4 - Tests, Docs, And Smoke Validation

Tasks:

- [x] Backend/frontend tests voor TeamScan report parity toegevoegd of bijgewerkt.
- [x] Docs en source-of-truth status bijgewerkt.
- [x] De nieuwe reportroute en output via gerichte smoke-paths gevalideerd.

Definition of done:

- [x] Relevante scoped tests zijn groen.
- [x] De TeamScan report/output-upgrade is aantoonbaar gevalideerd.
- [x] Documentatie is synchroon met de implementatie.

---

## 12. Testplan

### Automated Tests

- [x] Backend tests voor ondersteunde TeamScan reportroute
- [x] Tests die bevestigen dat TeamScan niet langer `422` geeft op report in deze wave
- [x] Tests voor bounded TeamScan reportinhoud
- [x] Regressietests voor dashboard/report alignment
- [x] Regressietests voor non-managerial and non-hierarchy boundaries

### Integration Checks

- [x] TeamScan heeft formele output die inhoudelijk aansluit op de dashboardread
- [x] de reportlaag benoemt lokale prioriteit, eigenaar, eerste bounded check en reviewgrens
- [x] de output schuift niet op naar manager ranking, named leaders of performanceframing
- [x] de generieke PDF-foutervaring is vervangen door correct TeamScan-gedrag

### Smoke Path

1. Maak of gebruik een TeamScan-campaign met voldoende veilige afdelingsgroepen.
2. Vraag de reportroute op voor `scan_type = team`.
3. Controleer dat TeamScan niet langer op `422` blijft hangen.
4. Controleer dat de formele output dezelfde bounded managementread volgt als dashboard.
5. Controleer dat TeamScan report-output geen manager-, hierarchy- of named leader gedrag introduceert.

Status:

- [x] Gerichte API- en backend-smoke liep mee in de testsuite.
- [x] Repo-brede frontend regressies zijn na close-out ook weer groen.

---

## 13. Assumptions / Defaults

- De bestaande report-engine in [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py) bleef de basis; er is geen tweede reportplatform gebouwd.
- TeamScan report parity moest productspecifiek zijn, niet een haastige Exit/Retentie-kopie.
- De grootste winst zat in formele managementoutput, niet in meer visual complexity.
- `department`-first bleef de primaire TeamScan-boundary.

---

## 14. Acceptance

### Product acceptance
- [x] TeamScan heeft formele output die paritywaardiger voelt naast ExitScan en RetentieScan.
- [x] De bounded lokalisatierol blijft intact.
- [x] Geen valse verbreding naar teamsoftware of leiderschapsoordeel.

### Codebase acceptance
- [x] Wijzigingen bleven klein en productgericht.
- [x] Geen generieke platformverbreding zonder directe parityreden.
- [x] Boundaries bleven intact.

### Runtime acceptance
- [x] TeamScan-reportroute werkt bounded correct.
- [x] Dashboard en formele output vertellen een TeamScan-verhaal.
- [x] TeamScan blijft een bounded follow-on route.

### QA acceptance
- [x] Relevante repo-brede tests zijn groen.
- [x] Scoped TeamScan report tests zijn groen.
- [x] Smoke-validatie bevestigt report and formal output parity winst.
- [x] Er is geen regressie naar bredere of riskantere claims binnen TeamScan scope.

### Documentation acceptance
- [x] Dit wavedocument blijft synchroon met de feitelijke implementatie.
- [x] Het is na afronding duidelijk dat `WAVE_03` de actieve source of truth was.
- [x] `WAVE_04_TEAMSCAN_TRUST_SUPPRESSION_AND_QA_PARITY.md` mag nu openen.

---

## 15. Risks To Watch

- TeamScan-report wordt een dunne afgeleide van Exit/Retentie in plaats van een eigen bounded output
- formele output wordt rijker maar ook diffuser of te lang
- dashboard en report gaan uit elkaar lopen
- reportparity trekt onbedoeld manager-, hierarchy- of named leader-verwachtingen mee

Uitkomst:

- Deze risico's zijn in deze wave bounded gebleven; de volgende parity-gap zit nu vooral in trust, suppressie en QA-discipline.

---

## 16. Not In This Wave

- Geen buyer-facing routewijzigingen
- Geen manager ranking
- Geen hierarchy/reporting line model
- Geen location expansion
- Geen trust/suppressie closeout als hoofdlevering
- Geen bredere TeamScan-scope

---

## 17. Exit Gate

Deze wave is klaar wanneer:

- [x] TeamScan niet langer op `422` bleef hangen voor formele output
- [x] dashboard en formele output inhoudelijk op elkaar aansloten
- [x] lokale prioriteit, eigenaar, eerste bounded check en reviewgrens formeel leesbaar zijn
- [x] de bounded productgrenzen intact zijn gebleven
- [x] code, docs, tests en smoke-validatie repo-breed groen zijn

---

## 18. Next Allowed Wave

Na green close-out van deze wave mag nu openen:

- `WAVE_04_TEAMSCAN_TRUST_SUPPRESSION_AND_QA_PARITY.md`
