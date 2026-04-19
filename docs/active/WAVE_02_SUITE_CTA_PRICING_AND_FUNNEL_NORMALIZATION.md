# WAVE_02_SUITE_CTA_PRICING_AND_FUNNEL_NORMALIZATION.md

## 1. Title

Normalize suite CTA behavior, pricing framing, and intake routing so the current seven-route suite still sells as a core-first system instead of a flat product catalog.

## 2. Korte Summary

Deze wave volgt direct op:

- [WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md)

Na `WAVE_01` staat de live routehiërarchie centraal correct geregistreerd. De volgende suite-normalisatiegap zit nu buyer-facing in:

- CTA-defaults
- pricingframing
- contactintake en routekeuze

De suite is nu breed genoeg dat zonder deze wave het risico groeit dat:

- follow-on routes te makkelijk als eerste koop gaan lezen
- pricing te veel als routecatalogus voelt
- de contactflow te weinig core-first sturing geeft

Deze wave doet daarom wel:

- core-first CTA- en intakeframing scherper maken
- pricing- en vervolgroutetaal normaliseren naar de actuele suite
- explicieter maken wanneer follow-on routes wel en niet buyer-facing logisch zijn

Deze wave doet niet:

- nieuwe routes of nieuwe producten openen
- trust/proof/output-copy herschrijven
- checkout, billing of scale-up logica openen

Status:

- Wave status: completed_green
- Active source of truth after approval: dit document
- Build permission: completed
- Next allowed wave after green completion: `WAVE_03_SUITE_TRUST_PROOF_AND_OUTPUT_ALIGNMENT.md`

Huidige implementatie-uitkomst:

- [frontend/lib/contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts) ordent de intake nu explicieter core-first: kernroutes eerst, `Combinatie` daarna, bounded follow-on routes pas daarna.
- Follow-on descriptions en `firstStepLabel` maken nu explicieter dat `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` volgen op een bestaand signaal of eerdere managementread.
- [frontend/components/marketing/contact-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/contact-form.tsx) zet de intakecopy nu rustiger neer als kernroute-eerst, met follow-on routes als latere bounded keuze.
- [frontend/app/tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx) toont nu ook `Leadership Scan` in dezelfde bounded pricinglaag en scherpt de pricingtaal aan tegen catalogus- of gelijkschakelgedrag.
- Regressies zijn meegetrokken in [frontend/lib/marketing-flow.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-flow.test.ts).
- Validatie is groen:
  - `cmd /c npm test` -> `99 passed`
  - `cmd /c npm run build` -> groen
  - `cmd /c npx next typegen` -> groen
  - `cmd /c npx tsc --noEmit` -> groen

---

## 3. Why This Wave Now

De huidige suitehiërarchie is nu correct geregistreerd, maar de commerciële surface moet nog gelijker gaan spreken.

Huidige repo-indicatie:

- [frontend/lib/contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts) laat follow-on routes al direct als routekeuze zien, maar zonder expliciete core-first onderscheidingslaag
- [frontend/components/marketing/contact-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/contact-form.tsx) noemt de hele suite in één adem, waardoor eerste intake buyer-facing vlakker kan lezen dan bedoeld
- [frontend/app/tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx) benoemt nog niet de volledige follow-on suite in dezelfde bounded pricingtaal
- pricing- en CTA-opbouw moeten explicieter laten zien dat `ExitScan` de default first route blijft en `RetentieScan` de enige situationeel primaire uitzondering

---

## 4. Planned User Outcome

Na deze wave is buyer-facing duidelijker:

- de eerste koop blijft meestal `ExitScan`
- `RetentieScan` is primair alleen wanneer de actieve behoudsvraag echt het startpunt is
- `Combinatie` is geen shortcut maar een bewuste portfoliokeuze
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` blijven zichtbaar, maar lezen commercieel duidelijk als bounded follow-on routes

Daarnaast wordt de intakeflow rustiger:

- follow-on routes vragen duidelijker om bestaand signaal of bestaande eerste route
- `nog-onzeker` blijft een geldige routeingang, maar wordt scherper geduid als routekeuzehulp

---

## 5. Scope In

- CTA-defaults en contact-intake copy
- routekeuze-volgorde in funnelopties
- pricing- en vervolgrouteframing op de tarievenpagina
- regressies voor core-first commerciële logica

## 6. Scope Out

- trust/proof/output-copy
- reportinhoud
- nieuwe billing- of checkoutlaag
- nieuwe routeactivatie of productscope

---

## 7. Dependencies

- [POST_PARITY_SUITE_NORMALIZATION_WAVE_STACK_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/POST_PARITY_SUITE_NORMALIZATION_WAVE_STACK_PLAN.md)
- [WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md)

---

## 8. Key Changes

- contact route options become more explicitly core-first
- contact-form copy reduces the chance that follow-on routes feel like equal first-intake choices
- pricing page names the full live bounded follow-on layer in the same core-first suite language
- marketing regressions encode the intended commercial hierarchy

---

## 9. Belangrijke Interfaces / Contracts

### 9.1 Contact Route Ordering Contract

De contactflow mag meerdere routes ondersteunen, maar de presentatie moet core-first blijven:

- kernproducten eerst
- combinatieroute daarna
- bounded follow-on routes pas daarna
- `nog-onzeker` blijft expliciete routekeuzehulp

### 9.2 Follow-On Intake Contract

Follow-on routes mogen buyer-facing zichtbaar zijn, maar hun beschrijving moet expliciet blijven dat ze volgen op:

- een bestaand signaal
- een eerste baseline
- of een eerdere managementread

### 9.3 Pricing Layer Contract

Pricing mag de bounded follow-on suite tonen, maar moet helder houden:

- geen flat catalogus
- geen gelijkwaardige eerste kooplaag
- geen pricingtheater dat follow-on routes groter maakt dan de kerninstap

---

## 10. Primary Code Surfaces

- [frontend/lib/contact-funnel.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/contact-funnel.ts)
- [frontend/components/marketing/contact-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/contact-form.tsx)
- [frontend/app/tarieven/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [frontend/lib/marketing-flow.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-flow.test.ts)

---

## 11. Work Breakdown

### Track 1 - Contact And CTA Normalization

Tasks:

- [x] Routeopties in de contactflow explicieter core-first ordenen.
- [x] Contactcopy aanscherpen zodat follow-on routes niet als vlakke eerste instap lezen.
- [x] Succes- en eerste-staptaal rustig houden binnen dezelfde suitehiërarchie.

Definition of done:

- [x] De intakeflow stuurt duidelijker op kernroute eerst.
- [x] Follow-on routes blijven zichtbaar maar leesbaar smaller.

### Track 2 - Pricing Layer Normalization

Tasks:

- [x] Tarievenpagina gelijk trekken met de volledige live follow-on suite.
- [x] Leadership Scan opnemen in dezelfde bounded pricinglaag.
- [x] Tekst aanscherpen zodat pricing geen catalogus- of gelijkschakelend effect krijgt.

Definition of done:

- [x] Pricing spreekt hetzelfde core-first verhaal als producten en homepage.
- [x] De bounded follow-on laag is volledig maar niet opgeblazen.

### Track 3 - Regression And Validation Closeout

Tasks:

- [x] Marketingflow-regressies bijwerken.
- [x] Relevante build- en typegates draaien.
- [x] Docs synchroon bijwerken met de feitelijke uitkomst.

Definition of done:

- [x] CTA-, pricing- en funnelnormalisatie is aantoonbaar groen.

---

## 12. Testplan

- [x] `cmd /c npm test`
- [x] `cmd /c npm run build`
- [x] `cmd /c npx next typegen`
- [x] `cmd /c npx tsc --noEmit`

---

## 13. Assumptions / Defaults

- `ExitScan` blijft default wedge.
- `RetentieScan` blijft de enige situationeel primaire uitzondering.
- `Combinatie` blijft een bewuste route tussen twee kernvragen.
- Follow-on routes blijven buyer-facing zichtbaar maar smaller dan de kerninstap.

---

## 14. Acceptance

### Product acceptance
- [x] De suite leest commerciëler als één core-first systeem.

### Codebase acceptance
- [x] CTA-, funnel- en pricinglagen zijn suitebreed beter aligned.

### Runtime acceptance
- [x] Buyer-facing routekeuze stuurt rustiger op de juiste eerste route.

### QA acceptance
- [x] Relevante regressies en buildgates zijn groen.

### Documentation acceptance
- [x] Dit document is synchroon bijgewerkt met de feitelijke uitkomst.

---

## 15. Exit Gate

Deze wave is klaar wanneer:

- [x] de contactflow kernroute-eerst leest
- [x] de prijzen de actuele suite correct maar bounded tonen
- [x] follow-on routes commercieel kleiner blijven dan de kerninstap
- [x] regressies en buildgates groen zijn
