# WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md

## 1. Title

Normalize the live suite registry and route hierarchy so the codebase, buyer-facing route model, and regression layer all describe the actual post-parity seven-route suite.

## 2. Korte Summary

Deze wave volgt direct op:

- [POST_PARITY_SUITE_NORMALIZATION_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/POST_PARITY_SUITE_NORMALIZATION_WAVE_STACK_PLAN.md)

De directe mismatch in de codebase is nu:

- buyer-facing pagina's, sitemap en SEO behandelen `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` al als live bounded routes
- de centrale marketingregistratie in [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts) zet die routes nog als `reserved_future`
- regressies hangen daardoor deels nog aan een ouder suitebeeld

Deze wave doet daarom wel:

- live suite-registratie normaliseren naar de actuele seven-route waarheid
- portfolio- en routehiërarchie expliciet maken in de centrale marketingmodellen
- regressies en architecture checks optrekken naar de huidige suite

Deze wave doet niet:

- pricingwijzigingen
- CTA- of funnelverbreding
- trust/proof herschrijven
- nieuwe producten of nieuwe platformlagen

Status:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: completed
- Next allowed wave after green completion: `WAVE_02_SUITE_CTA_PRICING_AND_FUNNEL_NORMALIZATION.md`

Huidige implementatie-uitkomst:

- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts) modelleert nu expliciet de actuele seven-route suite met vier live bounded `follow_on_route` entries.
- Alleen `mto` en `customer-feedback` blijven nog `reserved_future`.
- [frontend/app/producten/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/page.tsx) en [frontend/app/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/page.tsx) noemen `Leadership Scan` nu ook expliciet binnen de live bounded vervolgroutes.
- Regressies zijn meegetrokken in [frontend/lib/marketing-positioning.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-positioning.test.ts) en [tests/test_portfolio_architecture_program.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_portfolio_architecture_program.py).
- Validatie is groen:
  - `cmd /c npm test` -> `98 passed`
  - `.\.venv\Scripts\python.exe -m pytest tests/test_portfolio_architecture_program.py -q` -> `3 passed`
  - `cmd /c npm run build` -> groen
  - `cmd /c npx next typegen` -> groen
  - `cmd /c npx tsc --noEmit` -> groen

---

## 3. Why This Wave Now

Post-parity normalisatie kan niet beginnen zolang de centrale suite-registratie nog een oudere portfolio-realiteit beschrijft dan de publieke site en regressies nu al gebruiken.

Huidige repo-indicatie:

- [frontend/app/producten/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/page.tsx) behandelt meerdere follow-on routes al als live
- [frontend/app/sitemap.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/sitemap.ts) bevat alle vier de follow-on productroutes
- [frontend/lib/seo-conversion.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/seo-conversion.test.ts) verwacht live metadata voor `pulse`, `teamscan`, `onboarding-30-60-90` en `leadership-scan`
- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts) modelleert diezelfde routes nog als `reserved_future`

Zonder deze wave blijven pricing-, CTA- en trustnormalisatie op een instabiele basis rusten.

---

## 4. Planned User Outcome

Na deze wave is de actuele suitehiërarchie centraal en ondubbelzinnig vastgelegd:

- `ExitScan` en `RetentieScan` als kernproducten
- `Combinatie` als portfolioroute
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` als live bounded follow-on routes
- alleen echt toekomstige routes blijven nog gereserveerd

Daarnaast is voor operators en repo-maintainers duidelijk:

- welke route buyer-facing live is
- welke rol die route in het portfolio heeft
- welke regressies de actuele suite en niet een ouder model bewaken

---

## 5. Scope In

- centrale marketingregistratie
- routehiërarchie en portfolio-rollen
- live vs reserved suite-status
- architectuur- en positioning-regressies voor de actuele suite

## 6. Scope Out

- pricing- en CTA-copy
- trust/proof/output-copy
- contactflow-aanpassingen buiten hiërarchie-alignment
- nieuwe routeactivatie
- nieuwe producten

---

## 7. Dependencies

- [POST_PARITY_SUITE_NORMALIZATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/POST_PARITY_SUITE_NORMALIZATION_PLAN.md)
- [POST_PARITY_SUITE_NORMALIZATION_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/POST_PARITY_SUITE_NORMALIZATION_WAVE_STACK_PLAN.md)

---

## 8. Key Changes

- central marketing registry reflects the real seven-route suite
- follow-on routes become first-class live entries, but remain explicitly bounded in portfolio role
- reserved future routes shrink to genuinely non-live candidates
- architecture and marketing-positioning regressions move from pre-parity assumptions to current suite truth

---

## 9. Belangrijke Interfaces / Contracts

### 9.1 Marketing Product Status Contract

Na deze wave beschrijft `status` niet langer een oude binary tussen:

- `live`
- `reserved_future`

voor een suite waarin follow-on routes wel publiek live zijn.

De actuele live suite moet expliciet worden gedragen door de centrale registries.

### 9.2 Portfolio Role Contract

Na deze wave kent de marketingregistratie minimaal deze expliciete portfolio-rollen:

- `core_product`
- `portfolio_route`
- `follow_on_route`
- `future_reserved_route`

Decision boundary:

- follow-on routes zijn live
- follow-on routes zijn geen kernproducten

### 9.3 Reserved Route Contract

Na deze wave blijven alleen routes `reserved_future` die echt niet live buyer-facing staan.

---

## 10. Primary Code Surfaces

- [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts)
- [frontend/lib/marketing-positioning.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-positioning.test.ts)
- [tests/test_portfolio_architecture_program.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_portfolio_architecture_program.py)

---

## 11. Work Breakdown

### Track 1 - Central Suite Registry Normalization

Tasks:

- [x] De centrale marketingregistratie gelijk trekken met de actuele live suite.
- [x] Follow-on routes expliciet als live bounded routes modelleren.
- [x] Reserved routes verkleinen tot alleen echt niet-live candidates.

Definition of done:

- [x] `marketing-products.ts` beschrijft de actuele seven-route suite.
- [x] De portfolio-rollen weerspiegelen de core-first suitehiërarchie.

### Track 2 - Regression And Architecture Alignment

Tasks:

- [x] Positioning-regressies bijwerken naar de actuele suite.
- [x] Architecture-program regressies bijwerken naar de huidige marketing realiteit.
- [x] Bevestigen dat core-first defaults intact blijven.

Definition of done:

- [x] Geen regressie test meer tegen het oude pre-parity marketingmodel.
- [x] Tests coderen expliciet dat follow-on routes live maar bounded zijn.

---

## 12. Testplan

- [x] `cmd /c npm test`
- [x] `cmd /c npm run build`
- [x] `cmd /c npx next typegen`
- [x] `cmd /c npx tsc --noEmit`
- [x] `pytest tests/test_portfolio_architecture_program.py -q`

---

## 13. Assumptions / Defaults

- `ExitScan` blijft default wedge.
- `RetentieScan` blijft de enige situationeel primaire uitzondering.
- `Combinatie` blijft een portfolioroute.
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` blijven bounded follow-on routes.

---

## 14. Acceptance

### Product acceptance
- [x] De centrale suitehiërarchie is nu expliciet en actueel.

### Codebase acceptance
- [x] De registries en regressies beschrijven dezelfde suite.

### Runtime acceptance
- [x] Buyer-facing live routes en centrale registraties spreken dezelfde taal.

### QA acceptance
- [x] Relevante regressies en buildgates zijn groen.

### Documentation acceptance
- [x] Dit document is synchroon bijgewerkt met de feitelijke uitkomst.

---

## 15. Exit Gate

Deze wave is klaar wanneer:

- [x] de live suite centraal correct geregistreerd staat
- [x] follow-on routes live maar bounded zijn gemodelleerd
- [x] reserved routes alleen nog echt toekomstige routes bevatten
- [x] regressies en buildgates groen zijn
