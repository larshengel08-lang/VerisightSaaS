# WAVE_01_TEAMSCAN_METHOD_AND_INTERPRETATION_PARITY.md

## 1. Title

Strengthen TeamScan as a more methodically self-standing localization product by sharpening its measurement identity and interpretation depth, without broadening beyond the current `department`-first, privacy-first boundary.

## 2. Korte Summary

Deze wave is de eerste echte parity-slice voor `TeamScan` binnen het programma uit:

- [PRODUCT_PARITY_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_PARITY_PROGRAM_PLAN.md)
- [TEAMSCAN_PARITY_GAP_ANALYSIS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TEAMSCAN_PARITY_GAP_ANALYSIS_PLAN.md)
- [TEAMSCAN_PARITY_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TEAMSCAN_PARITY_WAVE_STACK_PLAN.md)

De belangrijkste parity-observatie uit de gap analysis is:

- TeamScan is al relatief sterk in rol, trust en bounded positionering
- de grootste objectieve parity-gap zit later in report/output
- maar de eerste noodzakelijke upgrade zit nu in **methodiek en interpretatie**

Deze wave doet daarom nog **niet**:

- report parity
- PDF-openzet
- buyer-facing route-uitbreiding
- nieuwe boundaries zoals manager, location of hierarchy

Deze wave doet wél:

- TeamScan methodisch zelfstandiger laten lezen
- de productspecifieke meetidentiteit aanscherpen
- de vertaalslag van lokale signalen naar bestuurlijke betekenis rijker en rustiger maken
- het onderscheid met `Segment Deep Dive` niet alleen in copy, maar ook in productlogica sterker maken

Status van deze wave:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: completed; next parity wave may open
- Next allowed wave after green completion: `WAVE_02_TEAMSCAN_DASHBOARD_AND_MANAGEMENT_DEPTH_PARITY.md`

---

## 3. Why This Wave Now

TeamScan staat nu al stevig genoeg als bounded follow-on route, maar leest methodisch nog niet volledig als een zelfstandig volwassen product.

De huidige repo laat dat concreet zien:

- [backend/products/team/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/scoring.py) is compact en verdedigbaar, maar nog dun in productspecifieke interpretatie
- [frontend/lib/products/team/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts) geeft al managementrichting, maar de interpretatielaag kan nog rijker en rustiger
- [frontend/lib/products/team/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/definition.ts) positioneert TeamScan al goed, maar die productspecifieke claim wordt nog niet overal even sterk gedragen door meet- en interpretatielogica

De belangrijkste huidige spanning is:

- buyer-facing en strategisch leest TeamScan al als echt product
- methodisch en interpretatief leunt het nog relatief sterk op een compacte local read op bestaande factorstructuren

Daarom is deze eerste parity-wave bewust geen report-wave en geen marketing-wave, maar een inhoudelijke productslice.

---

## 4. Planned User Outcome

Na deze wave moet een Verisight-operator of managementgebruiker:

- beter kunnen begrijpen wat TeamScan precies meet en wat het níet meet
- lokale signalen rijker en productspecifieker kunnen lezen
- beter zien waarom TeamScan een eigen lokalisatieproduct is en niet alleen een segmentverdieping
- een rustigere, scherpere interpretatie krijgen van lokale uitkomsten en eerste verificatierichtingen

Wat deze wave nog niet hoeft te leveren:

- paritywaardige rapportoutput
- nieuwe teamboundaries
- bredere managementworkflow
- buyer-facing routeverandering

---

## 5. Scope In

- aanscherping van de TeamScan-methodische identiteit
- rijkere, productspecifieke interpretatielaag in scoring en dashboardduiding
- sterkere productmatige afbakening tussen TeamScan en `Segment Deep Dive`
- verbeterde taal rond lokalisatie, verificatie en bounded first action
- tests en smoke-validatie voor de nieuwe methodische en interpretatieve laag
- docs-update van actieve source of truth

## 6. Scope Out

- report/PDF parity
- buyer-facing activatiewijzigingen
- nieuwe boundaries zoals manager, location of hierarchy
- nieuwe privacy- of governancearchitectuur
- scopeverbreding naar bredere teamsoftware

---

## 7. Dependencies

- [WAVE_04_TEAMSCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/WAVE_04_TEAMSCAN_ROUTE_ACTIVATION_AND_RELEASE_HARDENING.md)
- [TEAMSCAN_PARITY_GAP_ANALYSIS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TEAMSCAN_PARITY_GAP_ANALYSIS_PLAN.md)
- [TEAMSCAN_PARITY_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/TEAMSCAN_PARITY_WAVE_STACK_PLAN.md)

---

## 8. Key Changes

- TeamScan krijgt een sterkere eigen methodische identiteit
- de interpretatie van lokale signalen wordt rijker en productspecifieker
- de productlogica maakt duidelijker verschil tussen:
  - lokalisatie
  - verificatie
  - segmentbeschrijving
- TeamScan blijft bounded, maar voelt minder als “compacte lokale read” en meer als volwassen lokalisatieproduct

---

## 9. Belangrijke Interfaces / Contracts

### 9.1 TeamScan Method Identity Contract

Na deze wave moet TeamScan duidelijker kunnen uitleggen:

- wat het huidige teamsignaal precies representeert
- waarom TeamScan een lokalisatielaag is
- wat de rol van werkbeleving, werkfactoren en lokale richtingsvraag is
- waar interpretatie bewust stopt

Decision boundary:

- geen bredere factor- of boundaryscope
- wel rijkere productspecifieke betekenisgeving

### 9.2 TeamScan Interpretation Contract

De wave moet een betere vertaalslag geven van:

- lokale signalen
- factorpatronen
- prioriteringsstates

naar:

- bestuurlijke betekenis
- eerste verificatievraag
- eerste begrensde actie

Decision boundary:

- geen causale claim
- geen manager ranking
- geen people-level conclusies

### 9.3 Segment Deep Dive Distinction Contract

Na deze wave moet het productmatige verschil sterker zijn tussen:

- `Segment Deep Dive` als beschrijvende verdiepingslaag
- `TeamScan` als eigen lokalisatie- en verificatieroute

Decision boundary:

- dit verschil moet zichtbaar worden in productlogica en interpretatie, niet alleen in marketingcopy

### 9.4 Boundaries That Stay Locked

Blijven expliciet dicht:

- `department`-first only
- geen manager ranking
- geen named leaders
- geen hierarchy/reporting line model
- geen performance framing

---

## 10. Primary Code Surfaces

- [backend/products/team/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/scoring.py)
- [frontend/lib/products/team/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts)
- [frontend/lib/products/team/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/definition.ts)
- [frontend/lib/products/team/focus-questions.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/focus-questions.ts)
- [frontend/lib/products/team/action-playbooks.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/action-playbooks.ts)
- [frontend/lib/products/team/dashboard.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.test.ts)
- [tests/test_team_scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_team_scoring.py)

---

## 11. Work Breakdown

### Track 1 - Method Identity Sharpness

Tasks:

- [x] Definieer scherper wat TeamScan methodisch wel en niet meet.
- [x] Maak productspecifieker hoe werkbeleving, werkfactoren en lokale richtingsvraag samen de local read dragen.
- [x] Houd de methodiek klein maar zelfstandiger leesbaar.

Definition of done:

- [x] TeamScan leest methodisch minder als afgeleide van bestaande factorstructuren.
- [x] De productidentiteit is sterker zonder scopeverbreding.

### Track 2 - Interpretation Depth

Tasks:

- [x] Verrijk de interpretatielaag van lokale signalen en prioritering.
- [x] Maak de vertaalslag naar bestuurlijke betekenis rustiger en explicieter.
- [x] Versterk het verschil tussen beschrijvende lokale context en echte eerste verificatierichting.

Definition of done:

- [x] TeamScan-uitkomsten hebben rijkere en rustigere productspecifieke duiding.
- [x] De interpretatie voelt volwassener naast ExitScan en RetentieScan.

### Track 3 - Product Distinction Versus Segment Deep Dive

Tasks:

- [x] Maak in productlogica explicieter waarom TeamScan geen beschrijvende segmentverdieping is.
- [x] Trek dit door in dashboard-/definition-/question-/playbooklagen waar nodig.
- [x] Houd de bounded suite-rol intact.

Definition of done:

- [x] Het onderscheid met `Segment Deep Dive` is niet alleen copymatig, maar ook inhoudelijk beter verdedigbaar.
- [x] TeamScan blijft duidelijk een eigen productroute.

### Track 4 - Tests, Docs, and Smoke Validation

Tasks:

- [x] Voeg of update tests voor methodische en interpretatieve paritywinst.
- [x] Werk docs en source-of-truth status bij.
- [x] Voer een compacte smoke-validatie uit op TeamScan method/interpretation states.

Definition of done:

- [x] Relevante scoped tests zijn groen.
- [x] Methodiek- en interpretatie-upgrade is aantoonbaar gevalideerd.
- [x] Documentatie is synchroon met de implementatie.

---

## 12. Testplan

### Automated Tests

- [x] Backend tests voor TeamScan scoring/interpretatie
- [x] Frontend tests voor TeamScan dashboardduiding
- [x] Regressietests voor bounded scope en non-managerial boundaries
- [x] Tests voor onderscheid tussen lokale read, verificatie en bounded prioritering

### Integration Checks

- [x] TeamScan leest productspecifieker dan vóór deze wave
- [x] lokale signalen hebben rijkere managementduiding
- [x] bounded prioritering blijft intact maar wordt beter uitgelegd
- [x] `Segment Deep Dive`-verwarring neemt af op productlogisch niveau

### Smoke Path

1. Gebruik een bestaande TeamScan-campaign met voldoende veilige afdelingsgroepen.
2. Controleer de interpretatie van lokale signalen en prioriteitstates.
3. Controleer of de eerste verificatievraag rustiger en productspecifieker leest.
4. Controleer dat het bounded `department`-first karakter intact blijft.
5. Controleer dat TeamScan niet opschuift naar manager-, hierarchy- of performanceframing.

---

## 13. Current Validation Snapshot

- [x] Backend TeamScan scoring tests: `.\.venv\Scripts\python.exe -m pytest tests/test_team_scoring.py -q` -> `3 passed`
- [x] Focused frontend TeamScan dashboard tests: `cmd /c npm test -- --run lib/products/team/dashboard.test.ts` -> `6 passed`
- [x] Repo-brede frontend tests: `cmd /c npm test` -> `97 passed`
- [x] Frontend route types: `cmd /c npx next typegen` -> groen
- [x] Frontend build: `cmd /c npm run build` -> groen na schone `.next`
- [x] Frontend typecheck: `cmd /c npx tsc --noEmit` -> groen na verse `next typegen`
- [x] Compacte method/interpretation smoke is afgedekt via dashboard- en scoringtests

---

## 14. Assumptions / Defaults

- TeamScan hoeft niet breder te worden om parity te halen.
- Methodische identiteit komt vóór report parity.
- `department`-first blijft de primaire TeamScan-boundary.
- Deze wave is geslaagd als TeamScan inhoudelijk zelfstandiger en rijker leest, niet als er meer features bijkomen.

---

## 15. Acceptance

### Product acceptance
- [x] TeamScan voelt methodisch zelfstandiger als product.
- [x] De bounded lokalisatierol blijft intact.
- [x] Geen valse verbreding naar teamsoftware of leiderschapsoordeel.

### Codebase acceptance
- [x] Wijzigingen blijven klein en productgericht.
- [x] Geen generieke platformverbreding zonder directe parityreden.
- [x] Boundaries blijven intact.

### Runtime acceptance
- [x] TeamScan-uitkomsten zijn inhoudelijk rijker en rustiger interpreteerbaar.
- [x] Dashboardduiding en productdefinitie spreken dezelfde taal.
- [x] TeamScan blijft een bounded follow-on route.

### QA acceptance
- [x] Relevante repo-brede tests zijn groen.
- [x] Scoped TeamScan tests zijn groen.
- [x] Smoke-validatie bevestigt method and interpretation parity winst.
- [x] Er is geen regressie naar bredere of riskantere claims binnen TeamScan scope.

### Documentation acceptance
- [x] Dit wavedocument blijft synchroon met de feitelijke implementatie.
- [x] Het is na afronding duidelijk dat `WAVE_01` de actieve source of truth was.
- [x] `WAVE_02_TEAMSCAN_DASHBOARD_AND_MANAGEMENT_DEPTH_PARITY.md` kan nu openen na green close-out.

---

## 16. Risks To Watch

- TeamScan wordt inhoudelijk rijker, maar ook diffuser
- interpretatietaal wordt te zwaar of te theoretisch
- paritywerk schuift alsnog richting scopeverbreding
- het productmatige verschil met `Segment Deep Dive` blijft alsnog te dun

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

- [x] TeamScan methodisch zelfstandiger leest
- [x] de interpretatielaag rijker en rustiger is geworden
- [x] het onderscheid met `Segment Deep Dive` inhoudelijk sterker is
- [x] de bounded productgrenzen intact zijn gebleven
- [x] code, docs, tests en smoke-validatie repo-breed groen zijn

---

## 19. Next Allowed Wave

Na volledige green close-out van deze wave mag pas openen:

- `WAVE_02_TEAMSCAN_DASHBOARD_AND_MANAGEMENT_DEPTH_PARITY.md`
