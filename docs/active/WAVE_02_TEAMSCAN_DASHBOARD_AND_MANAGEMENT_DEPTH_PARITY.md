# WAVE_02_TEAMSCAN_DASHBOARD_AND_MANAGEMENT_DEPTH_PARITY.md

## 1. Title

Bring TeamScan dashboarding and management guidance closer to ExitScan/RetentieScan maturity by deepening the local-to-management handoff, without widening TeamScan beyond its current `department`-first and privacy-first boundary.

## 2. Korte Summary

Deze wave volgt direct op:

- [WAVE_01_TEAMSCAN_METHOD_AND_INTERPRETATION_PARITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_01_TEAMSCAN_METHOD_AND_INTERPRETATION_PARITY.md)
- [TEAMSCAN_PARITY_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TEAMSCAN_PARITY_WAVE_STACK_PLAN.md)

De kern van `WAVE_01` was:

- sterkere methodische identiteit
- rijkere interpretatie
- scherper onderscheid met `Segment Deep Dive`

De kern van deze tweede parity-wave is:

- TeamScan minder laten voelen als alleen een goede local read
- TeamScan sterker laten landen als managementinstrument
- de stap van lokaal signaal naar bestuurlijke keuze rijker, rustiger en consistenter maken

Deze wave doet daarom nog **niet**:

- report/PDF parity
- buyer-facing routewijzigingen
- uitbreiding naar manager, location, hierarchy of named leader output
- verbreding naar generieke teamsoftware

Deze wave doet wél:

- dashboard-to-management depth verhogen
- prioriteiten, eigenaar, eerste actie en reviewlogica sterker aan elkaar koppelen
- TeamScan-output managementwaardiger maken zonder grotere productscope

Status van deze wave:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: completed; next parity wave may open
- Next allowed wave after green completion: `WAVE_03_TEAMSCAN_REPORT_AND_FORMAL_OUTPUT_PARITY.md`

---

## 3. Why This Wave Now

De gap analysis laat zien dat TeamScan al relatief sterk is in:

- bounded productrol
- trust/privacy posture
- eerste managementhandoff

Maar ook dat de huidige parity-gap nog zichtbaar blijft in:

- dashboard-to-management depth
- elegantie van de handoff van lokaal signaal naar bestuurlijke keuze
- de mate waarin TeamScan-managementoutput al echt op kernproductniveau voelt

De huidige repo-realiteit wijst daar ook op:

- [frontend/lib/products/team/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts) heeft al bounded prioritering, eigenaar en eerste actie
- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx) toont al TeamScan als productmatige read
- maar de brug van `waar speelt het?` naar `wat doet management nu eerst?` kan nog rijker en consistenter

Daarom opent parity na `WAVE_01` niet meteen op reportniveau, maar eerst op de managementlaag.

---

## 4. Planned User Outcome

Na deze wave moet een Verisight-operator of managementgebruiker:

- sneller begrijpen wat TeamScan nu bestuurlijk betekent
- helderder zien welk lokaal signaal nu eerst verificatie, gesprek of begrensde actie vraagt
- beter kunnen lezen wie eerst eigenaar is en waar de reviewgrens ligt
- minder losse cards zien en meer één samenhangende managementread ervaren

Wat deze wave nog niet hoeft te leveren:

- paritywaardige formele reportoutput
- PDF-openzet
- bredere team- of managerstructuren
- nieuwe marketing- of pricingpositionering

---

## 5. Scope In

- verdieping van TeamScan dashboardstructuur
- sterkere managementread rondom prioriteit, eigenaar, eerste stap en review
- rustigere, coherente handoff tussen local read en managementbesluit
- productspecifieke verdieping van focusvragen, playbooks en dashboardblokken waar nodig
- tests, smoke-validatie en docs-update voor de management-depth laag

## 6. Scope Out

- report/PDF parity
- buyer-facing routewijzigingen
- manager ranking
- named leaders
- hierarchy/reporting line logic
- location expansion
- bredere TeamScan-scope

---

## 7. Dependencies

- [WAVE_01_TEAMSCAN_METHOD_AND_INTERPRETATION_PARITY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_01_TEAMSCAN_METHOD_AND_INTERPRETATION_PARITY.md)
- [TEAMSCAN_PARITY_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TEAMSCAN_PARITY_WAVE_STACK_PLAN.md)
- [TEAMSCAN_PARITY_GAP_ANALYSIS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TEAMSCAN_PARITY_GAP_ANALYSIS_PLAN.md)

---

## 8. Key Changes

- TeamScan dashboard wordt meer een samenhangende managementread en minder een losse local-read samenvatting
- prioritering krijgt rijkere bestuurlijke duiding zonder zwaardere claims
- eigenaar, eerste actie en reviewmoment worden helderder in één lijn gezet
- TeamScan-focusvragen en playbooks moeten nog directer aansluiten op de dashboardstate

---

## 9. Belangrijke Interfaces / Contracts

### 9.1 TeamScan Management Read Contract

Na deze wave moet TeamScan duidelijker laten zien:

- wat het lokale signaal nu bestuurlijk betekent
- waarom deze prioriteit nu eerst aandacht vraagt of juist niet
- waar verificatie stopt en eerste actie begint
- wanneer management bewust nog niet moet overinterpreteren

Decision boundary:

- geen zwaardere causaliteits- of accountabilityclaim
- wel rijkere managementduiding

### 9.2 Owner / First Action / Review Contract

TeamScan moet sterker koppelen:

- prioriteitstate
- eerste eigenaar
- eerste begrensde actie
- reviewgrens

Decision boundary:

- geen bredere workflow-engine
- wel duidelijkere bestuurlijke samenhang in de read

### 9.3 Focus And Playbook Alignment Contract

Na deze wave moeten focusvragen en playbooks:

- directer aansluiten op de TeamScan-state
- minder generiek lezen
- beter ondersteunen wat management nu eerst bespreekt of verifieert

Decision boundary:

- geen grote nieuwe contentbibliotheek
- wel scherpere productspecifieke alignment

### 9.4 Boundaries That Stay Locked

Blijven expliciet dicht:

- `department`-first only
- geen manager ranking
- geen named leaders
- geen hierarchy/reporting line model
- geen performance framing
- geen verbreding naar brede team-governance software

---

## 10. Primary Code Surfaces

- [frontend/lib/products/team/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts)
- [frontend/lib/products/team/focus-questions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/focus-questions.ts)
- [frontend/lib/products/team/action-playbooks.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/action-playbooks.ts)
- [frontend/lib/products/team/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/definition.ts)
- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx)
- [frontend/lib/products/team/dashboard.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.test.ts)

---

## 11. Work Breakdown

### Track 1 - Dashboard Read Coherence

Tasks:

- [x] Versterk de samenhang tussen TeamScan summary cards, managementblokken en profile cards.
- [x] Maak de overgang van local read naar managementread explicieter.
- [x] Houd de output compact maar minder fragmentarisch.

Definition of done:

- [x] TeamScan leest als samenhangende managementread.
- [x] De dashboardstructuur helpt sneller bij bestuurlijke interpretatie.

### Track 2 - Priority / Owner / Action Depth

Tasks:

- [x] Verrijk de duiding van `first_verify`, `watch_next`, `monitor_only` en eventuele neutral states.
- [x] Koppel elke state sterker aan eerste eigenaar en eerste begrensde actie.
- [x] Maak review- en escalatiegrenzen rustiger en explicieter.

Definition of done:

- [x] TeamScan-prioriteit voelt minder dun en meer managementwaardig.
- [x] Eigenaar en eerste stap zijn duidelijker ingebed in dezelfde read.

### Track 3 - Focus / Playbook Alignment

Tasks:

- [x] Trek de huidige TeamScan focusvragen strakker naar de dashboardstate.
- [x] Trek playbooks mee waar de handoff nu nog te generiek is.
- [x] Houd de bounded productrol intact.

Definition of done:

- [x] Focusvragen en playbooks voelen directer gekoppeld aan TeamScan-managementoutput.
- [x] De TeamScan-read is consistenter van summary tot actiehulp.

### Track 4 - Tests, Docs, And Smoke Validation

Tasks:

- [x] Voeg of update tests voor TeamScan management-depth parity.
- [x] Werk docs en source-of-truth status bij.
- [x] Valideer de nieuwe managementlaag via gerichte smoke-paths.

Definition of done:

- [x] Relevante scoped tests zijn groen.
- [x] De management-depth upgrade is aantoonbaar gevalideerd.
- [x] Documentatie is synchroon met de implementatie.

---

## 12. Testplan

### Automated Tests

- [x] Frontend tests voor TeamScan dashboardstructuur en managementduiding
- [x] Tests voor state-to-owner / state-to-action mapping
- [x] Tests voor alignment tussen dashboardstate, focusvragen en playbooks
- [x] Regressietests voor bounded scope en non-managerial boundaries

### Integration Checks

- [x] TeamScan leest meer als managementinstrument en minder als alleen local read
- [x] prioriteit, eigenaar en eerste actie sluiten zichtbaarder op elkaar aan
- [x] review- en boundaryduiding blijft expliciet intact
- [x] het product schuift niet op naar manager-, hierarchy- of performanceframing

### Smoke Path

1. Gebruik een bestaande TeamScan-campaign met veilige afdelingsgroepen.
2. Controleer hoe summary cards en managementblokken nu samen de read vormen.
3. Controleer per state welke eigenaar, eerste stap en reviewgrens zichtbaar zijn.
4. Controleer of focusvragen en playbooks directer aansluiten op de state.
5. Controleer dat TeamScan bounded en `department`-first blijft.

---

## 13. Current Validation Snapshot

- [x] Focused TeamScan dashboard tests: `cmd /c npm test -- --run lib/products/team/dashboard.test.ts` -> `6 passed`
- [x] Repo-brede frontend tests: `cmd /c npm test` -> `97 passed`
- [x] Frontend build: `cmd /c npm run build` -> groen
- [x] Frontend route types: `cmd /c npx next typegen` -> groen
- [x] Frontend typecheck: `cmd /c npx tsc --noEmit` -> groen na verse `next typegen`
- [x] Compacte management-depth smoke is afgedekt via TeamScan dashboardtests plus de campaign page-integratie

---

## 14. Assumptions / Defaults

- TeamScan hoeft nog niet naar report parity om managementwaardig te worden.
- De snelste paritywinst zit nu in de leesbaarheid en bestuurlijke bruikbaarheid van de dashboardlaag.
- `department`-first blijft de primaire TeamScan-boundary.
- Deze wave is geslaagd als TeamScan-managementoutput sterker, coherenter en rustiger leest, niet als er meer features bijkomen.

---

## 15. Acceptance

### Product acceptance
- [x] TeamScan voelt managementwaardiger naast ExitScan en RetentieScan.
- [x] De bounded lokalisatierol blijft intact.
- [x] Geen valse verbreding naar teamsoftware of leiderschapsoordeel.

### Codebase acceptance
- [x] Wijzigingen blijven klein en productgericht.
- [x] Geen generieke platformverbreding zonder directe parityreden.
- [x] Boundaries blijven intact.

### Runtime acceptance
- [x] TeamScan-dashboard vormt een coherente managementread.
- [x] Prioriteit, eigenaar, eerste actie en reviewgrens sluiten duidelijker op elkaar aan.
- [x] TeamScan blijft een bounded follow-on route.

### QA acceptance
- [x] Relevante repo-brede tests zijn groen.
- [x] Scoped TeamScan tests zijn groen.
- [x] Smoke-validatie bevestigt dashboard and management-depth parity winst.
- [x] Er is geen regressie naar bredere of riskantere claims binnen TeamScan scope.

### Documentation acceptance
- [x] Dit wavedocument blijft synchroon met de feitelijke implementatie.
- [x] Het is na afronding duidelijk dat `WAVE_02` de actieve source of truth was.
- [x] `WAVE_03_TEAMSCAN_REPORT_AND_FORMAL_OUTPUT_PARITY.md` kan nu openen na green close-out.

---

## 16. Risks To Watch

- TeamScan-dashboard wordt rijker maar ook drukker
- managementdiepte gaat ten koste van bounded eenvoud
- prioritering krijgt alsnog te zware semantiek
- focusvragen en playbooks blijven te generiek voor de nieuwe read

---

## 17. Not In This Wave

- Geen report/PDF parity
- Geen buyer-facing routewijzigingen
- Geen manager ranking
- Geen hierarchy/reporting line model
- Geen location expansion
- Geen bredere TeamScan-scope

---

## 18. Exit Gate

Deze wave is pas klaar wanneer:

- [x] TeamScan-dashboard als samenhangende managementread voelt
- [x] prioriteit, eigenaar en eerste actie rijker op elkaar aansluiten
- [x] focusvragen en playbooks beter op de dashboardstate aansluiten
- [x] de bounded productgrenzen intact zijn gebleven
- [x] code, docs, tests en smoke-validatie repo-breed groen zijn

---

## 19. Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_03_TEAMSCAN_REPORT_AND_FORMAL_OUTPUT_PARITY.md`
