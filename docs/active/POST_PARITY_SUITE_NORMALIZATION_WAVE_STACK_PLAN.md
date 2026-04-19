# POST_PARITY_SUITE_NORMALIZATION_WAVE_STACK_PLAN.md

## 1. Title

Lock the controlled wave stack for post-parity suite normalization so the current seven-route suite can be sharpened as one coherent core-first system before any further commercialization or expansion work.

## 2. Korte Summary

Deze stack volgt direct op:

- [POST_PARITY_SUITE_NORMALIZATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/POST_PARITY_SUITE_NORMALIZATION_PLAN.md)

De parityfase sloot productvolwassenheid per follow-on route. Daardoor is nu niet langer de hoofdvraag:

- "kan deze productlijn bestaan?"

maar:

- "spreekt de totale suite nu overal hetzelfde, scherpe, core-first productverhaal?"

Deze stack opent daarom geen nieuwe producten, geen nieuwe platformlaag en geen scale-up werk. Ze opent alleen een gecontroleerde normalisatievolgorde voor:

- routehiërarchie
- CTA-, pricing- en funnelnormalisatie
- trust-, proof- en output-alignment
- formele suite closeout

Status:

- Plan status: completed
- Active source of truth after approval: dit document
- Build permission: wave stack locked; `WAVE_01` mag openen
- Next allowed step: `WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md`

---

## 3. Why This Stack Now

De huidige codebase laat zien dat parity op productniveau niet automatisch betekent dat de suite ook al netjes genormaliseerd is.

Voorbeelden uit de repo:

- buyer-facing pagina's en sitemap behandelen `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` al als live follow-on routes
- de centrale marketingregistratie in [frontend/lib/marketing-products.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-products.ts) hangt nog deels in een ouder model waarin die routes als `reserved_future` staan
- regressies als [frontend/lib/marketing-positioning.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-positioning.test.ts) en [tests/test_portfolio_architecture_program.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_portfolio_architecture_program.py) refereren nog aan een oudere suite- of contractrealiteit
- pricing-, CTA- en trustcopy zijn buyer-facing al verder ontwikkeld, maar moeten nog suitebreed expliciet langs dezelfde normalisatielat

Dus:

- productparity sloot volwassenheid per route
- suite normalization moet nu portfoliohelderheid en internal consistency sluiten

---

## 4. Current Suite Baseline

Buyer-facing live routes:

- `ExitScan`
- `RetentieScan`
- `Combinatie`
- `Pulse`
- `TeamScan`
- `Onboarding 30-60-90`
- `Leadership Scan`

Runtime-producten:

- `exit`
- `retention`
- `pulse`
- `team`
- `onboarding`
- `leadership`

Core-first defaults die in deze stack leidend blijven:

- `ExitScan` blijft default wedge
- `RetentieScan` blijft de enige situationeel primaire uitzondering
- `Combinatie` blijft een portfolioroute, geen derde kernproduct
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` blijven volwassen follow-on routes, geen gelijkwaardige eerste instappen

---

## 5. Wave Order

### Wave 1

- [WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md)

Doel:

- de centrale suite-registratie, live routehiërarchie en regressiebasis gelijk trekken met de actuele seven-route suite

### Wave 2

- `WAVE_02_SUITE_CTA_PRICING_AND_FUNNEL_NORMALIZATION.md`

Doel:

- CTA-, pricing- en funnelcontracten suitebreed normaliseren zonder de core-first hiërarchie te verliezen

### Wave 3

- `WAVE_03_SUITE_TRUST_PROOF_AND_OUTPUT_ALIGNMENT.md`

Doel:

- trust-, proof-, rapport- en outputtaal op suiteniveau gelijk trekken zodat buyer-facing claims en productoutput strak aligned blijven

### Wave 4

- `WAVE_04_SUITE_NORMALIZATION_CLOSEOUT.md`

Doel:

- formeel vastleggen dat de suite na parity ook suitebreed genormaliseerd en coherent genoeg is om als nieuwe baseline te gelden

---

## 6. Execution Rules

- er mag precies één normalisatiewave tegelijk actief zijn
- elke wave moet docs, code, tests en validatie synchroon opleveren
- geen nieuwe productlijnen, geen nieuwe runtimeproducten en geen nieuwe platformlagen in deze stack
- `ExitScan` blijft default wedge tenzij een latere wave dit expliciet en beargumenteerd verandert
- follow-on routes mogen scherper worden gepositioneerd, maar niet opschuiven naar gelijkwaardige eerste intake-routes

---

## 7. Acceptance By Wave

### Product acceptance

- [x] Elke wave heeft een expliciet suiteprobleem en een bounded oplossingsrichting.

### Codebase acceptance

- [x] De stack blijft binnen de huidige buyer-facing en runtime suite.

### Runtime acceptance

- [x] Geen normalisatiewave forceert nieuwe runtime-scope buiten de bestaande producten.

### QA acceptance

- [x] Elke wave vereist eigen regressie- en buildcloseout.

### Documentation acceptance

- [x] De stack maakt duidelijk welke wave eerst komt en welke pas daarna open mag.

---

## 8. Defaults Chosen

- `ExitScan` blijft de primaire wedge in alle normalisatiewaves.
- `RetentieScan` blijft complementair, behalve waar de actieve behoudsvraag expliciet primair is.
- `Combinatie` blijft een routekeuze, geen productverbreding.
- `Pulse`, `TeamScan`, `Onboarding 30-60-90` en `Leadership Scan` blijven live, maar bounded follow-on routes.
- De eerste wave start bij centrale registraties en routehiërarchie, niet bij pricing of trustcopy.

---

## 9. Next Allowed Step

Na deze stack mag nu openen:

- [WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/WAVE_01_SUITE_POSITIONING_AND_ROUTE_HIERARCHY_NORMALIZATION.md)
