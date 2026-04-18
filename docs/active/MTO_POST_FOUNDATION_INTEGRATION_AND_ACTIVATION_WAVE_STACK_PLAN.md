# MTO_POST_FOUNDATION_INTEGRATION_AND_ACTIVATION_WAVE_STACK_PLAN.md

## 1. Title

Lock de gecontroleerde wave stack voor de fase na het MTO-foundation traject, zodat MTO stap voor stap suitegekoppeld, buyer-facing voorbereid en later bestuurlijk richting hoofdmodel kan bewegen zonder het bestaande live proces direct te ontwrichten.

## 2. Korte Summary

Deze stack volgt direct op:

- [MTO_POST_FOUNDATION_INTEGRATION_AND_ACTIVATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/docs/active/MTO_POST_FOUNDATION_INTEGRATION_AND_ACTIVATION_PLAN.md)
- [WAVE_05_MTO_INTERNAL_CLOSEOUT_AND_SUITE_INTEGRATION_GATE.md](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/docs/active/WAVE_05_MTO_INTERNAL_CLOSEOUT_AND_SUITE_INTEGRATION_GATE.md)

De foundationfase sloot MTO als interne productlijn. Daardoor is nu niet langer de hoofdvraag:

- "kan MTO intern werken?"

maar:

- "hoe wordt MTO gecontroleerd gekoppeld, geactiveerd en bestuurlijk voorbereid op een latere hoofdrol?"

Deze stack opent daarom geen onmiddellijke live replacement en geen brede platformverbouwing. Ze opent alleen een gecontroleerde volgorde voor:

- bounded suite integration
- internal intake/commercial readiness
- buyer-facing gated activation
- portfolio- en default-route governance
- formele transition-gate closeout

Status:

- Plan status: completed
- Active source of truth after approval: dit document
- Build permission: wave stack locked; `WAVE_01` mag openen
- Next allowed step: `WAVE_01_MTO_SUITE_INTEGRATION_BASELINE.md`

---

## 3. Why This Stack Now

De huidige codebase laat zien dat MTO wel intern productmatig bestaat, maar nog niet als gekoppelde suiteroute.

Voorbeelden uit de repo:

- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/frontend/lib/marketing-products.ts) houdt MTO nog op `reserved_future`
- [frontend/lib/products/shared/registry.ts](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/frontend/lib/products/shared/registry.ts) kent MTO runtimebreed al wel
- [tests/test_portfolio_architecture_program.py](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/tests/test_portfolio_architecture_program.py) borgt de huidige core-first suite- en reserved-state contracten
- de foundation closeout in [WAVE_05_MTO_INTERNAL_CLOSEOUT_AND_SUITE_INTEGRATION_GATE.md](/C:/Users/larsh/Desktop/Business/Worktrees/Verisight_mto_track_foundation/docs/active/WAVE_05_MTO_INTERNAL_CLOSEOUT_AND_SUITE_INTEGRATION_GATE.md) verbiedt expliciet automatische live vervanging of activatie

Dus:

- MTO is intern klaar genoeg om verder te gaan
- maar de volgende stappen moeten strakker worden geordend dan losse ad-hoc integratiewijzigingen

---

## 4. Current Phase Baseline

Huidige MTO-realiteit:

- runtime product: `mto`
- marketingstatus: nog `reserved_future`
- delivery/action/operator basis: intern groen
- buyer-facing zichtbaarheid: nog niet geopend
- hoofdmodeltransitie: nog niet bestuurlijk geopend

Leidende defaults in deze stack:

- bestaande live routes blijven voorlopig buyer-facing leidend
- MTO mag eerst naast de suite landen voordat governance een latere hoofdrol bespreekt
- geen wave mag tegelijk suitekoppeling, publieke activatie en hoofdmodelmigratie samen openen

---

## 5. Wave Order

### Wave 1

- `WAVE_01_MTO_SUITE_INTEGRATION_BASELINE.md`

Doel:

- MTO bounded aan de bestaande suite-, intake- en portfolio-oppervlakken koppelen zonder buyer-facing activatie of live routevervanging te openen

Kernscope:

- interne portfolio- en intakecontracten MTO-ready maken
- route- en leadkwalificatieoppervlakken voorbereiden op MTO
- regressiebasis en docs aanpassen zodat MTO niet meer alleen “gereserveerd” leeft in de operating spine

### Wave 2

- `WAVE_02_MTO_INTERNAL_INTAKE_AND_COMMERCIAL_READINESS.md`

Doel:

- de interne sales-, intake-, methodische en deliverylaag zo aanscherpen dat MTO later buyer-facing veilig kan openen

Kernscope:

- internal readiness copy, handoff, operator- en deliveryroutines
- bounded proof-, sample- en intakeondersteuning
- regressies voor interne activatierijpheid

### Wave 3

- `WAVE_03_MTO_BUYER_FACING_GATED_ACTIVATION.md`

Doel:

- MTO buyer-facing openen als begrensde nieuwe route naast de bestaande suite, zonder al live hoofdmodelclaim te maken

Kernscope:

- productenpagina, detailroute, CTA- en trustframing
- bounded SEO/sitemap/open-graph surfaces
- regressies voor publieke positionering

### Wave 4

- `WAVE_04_MTO_PORTFOLIO_HIERARCHY_AND_DEFAULT_ROUTE_GOVERNANCE.md`

Doel:

- bestuurlijk en productmatig vastleggen hoe MTO zich nu verhoudt tot `ExitScan`, `RetentieScan` en de rest van de suite, inclusief de vraag of en wanneer defaults ooit mogen verschuiven

Kernscope:

- portfoliohiërarchie
- default-route rules
- allowed versus blocked migratiepaden
- expliciete governance- en contractdocs

### Wave 5

- `WAVE_05_MTO_MAINLINE_TRANSITION_GATE_CLOSEOUT.md`

Doel:

- formeel sluiten van deze post-foundation fase en expliciet vastleggen of de volgende stap een echte hoofdmodeltransitietrack mag openen

Kernscope:

- closeout docs
- regressie- en acceptancebewijs
- expliciete go/no-go gate naar latere mainline transition

---

## 6. Execution Rules

- er mag precies één MTO-wave tegelijk actief zijn
- elke wave moet docs, code, tests en validatie synchroon opleveren
- geen wave mag bestaande live routes automatisch vervangen
- buyer-facing activatie mag pas openen na groene afronding van wave 2
- default-route of hoofdmodelgovernance mag pas openen na buyer-facing activatie en expliciete regressies
- brede platformuitbreiding blijft buiten scope tenzij een latere expliciete track dat opent

---

## 7. Acceptance By Wave

### Product acceptance

- [x] Elke wave heeft een expliciet MTO-vervolgprobleem en een bounded oplossingsrichting.

### Codebase acceptance

- [x] De stack blijft gekoppeld aan de huidige MTO- en suite-oppervlakken.

### Runtime acceptance

- [x] Geen wave forceert directe live replacement van bestaande routes.

### QA acceptance

- [x] Elke wave vereist eigen regressie- en closeoutevidence.

### Documentation acceptance

- [x] De stack maakt duidelijk welke wave eerst komt en welke pas daarna open mag.

---

## 8. Defaults Chosen

- MTO suitekoppeling komt vóór buyer-facing activatie.
- Buyer-facing activatie komt vóór hoofdmodeltransitie-governance.
- Bestaande live routes blijven default live waarheid totdat governance expliciet iets anders besluit.
- MTO mag in deze fase wel “live naast de suite” worden, maar nog niet automatisch “nieuwe suitekern”.

---

## 9. Next Allowed Step

Na deze stack mag nu openen:

- `WAVE_01_MTO_SUITE_INTEGRATION_BASELINE.md`
