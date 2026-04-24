# Suite Landing Decision

## Korte samenvatting

De guided execution-laag is schoon genoeg om nu gecontroleerd op de suite-lijn te landen via `codex/execution-package-review` / PR `#17`.

De dashboard-UI-lijn is inhoudelijk reviewklaar en lokaal groen in isolatie via `codex/dashboard-ui-review` / PR `#22`, maar nog niet schoon genoeg om direct na de execution-laag op suite te landen zonder expliciete integratie-resolutie. De blokker zit niet in nieuwe designkeuzes, maar in echte code-overlap op de home-, campaign-detail- en guided-panel-routes.

## Welke branches en PR’s zijn beoordeeld

- Guided execution-laag:
  - `codex/customer-launch-control` / PR `#15`
  - `codex/participant-data-import-safety` / PR `#11`
  - `codex/launch-communications-reminders` / PR `#12`
  - `codex/response-ops-dashboard-activation` / PR `#8`
  - `codex/permissions-audit-customer-safety` / PR `#9`
  - `codex/first-next-step-guided-expansion` / PR `#10`
  - `codex/execution-package-review` / PR `#17`
- Dashboard-UI-lijn:
  - `codex/dashboard-shell-and-presentation-system` / PR `#18`
  - `codex/dashboard-state-aware-composition-pass` / PR `#19`
  - `codex/dashboard-module-visual-mapping` / PR `#20`
  - `codex/dashboard-admin-alignment` / PR `#21`
  - `codex/dashboard-ui-review` / PR `#22`

## Wat nu landingsklaar is voor suite

- `codex/execution-package-review` / PR `#17`
  - Dit is de juiste suite-landingseenheid voor de volledige guided execution-laag.
  - De branch bundelt customer launch control, import safety, launch/reminder controls, response activation, permissions/audit en bounded first-next-step in één canonische reviewdiff.
  - De execution-laag bewaakt canon/bounded taal expliciet:
    - guided phases blijven execution-first en methodologisch begrensd
    - product- en ownershiplabels blijven helder verdeeld tussen `verisight`, `customer` en `shared`
    - dashboardactivatie en first-next-step blijven pas na de juiste thresholds open
  - Test- en verificatiesignalen zijn lokaal schoon op deze reviewbranch:
    - `npx vitest run "app/(dashboard)/dashboard/page.test.ts" "app/(dashboard)/campaigns/[id]/page.test.ts" "app/(dashboard)/campaigns/[id]/page.route-shell.test.ts" "lib/guided-self-serve.test.ts" "lib/response-activation.test.ts"`
    - `npm.cmd run build`
    - `python -m pytest tests/test_api_flows.py -k respondent_import -q`

## Wat nog niet moet landen

- Niet de losse execution-deelbranches apart bovenop suite landen.
  - `#17` vervangt die mergevolgorde functioneel; losse merges vergroten alleen conflict- en reviewoppervlak.
- Niet de dashboard-UI-lijn direct na execution landen via `codex/dashboard-ui-review` / PR `#22`.
  - In isolatie is deze branch schoon.
  - Na execution ontstaat een echte integratieblokker met conflicts in:
    - `backend/main.py`
    - `backend/schemas.py`
    - `frontend/app/(dashboard)/dashboard/page.tsx`
    - `frontend/app/(dashboard)/dashboard/page.test.ts`
    - `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
    - `frontend/app/(dashboard)/campaigns/[id]/page.test.ts`
    - `frontend/components/dashboard/guided-self-serve-panel.tsx`
    - `frontend/tests/e2e/guided-self-serve-acceptance.spec.ts`
- Ook de eerdere dashboard-subbranches landen nog niet schoon na execution:
  - `#18` conflicteert al op `frontend/app/(dashboard)/dashboard/page.tsx`
  - `#19` en `#22` conflicteren op home, campaign detail, guided panel en acceptance/tests
  - `#20` conflicteert op campaign detail
  - `#21` conflicteert op home en campaign detail

## Aanbevolen mergevolgorde

1. Merge `codex/execution-package-review` / PR `#17` naar `codex/suite-hardening-parity-normalization`.
2. Snijd daarna een expliciete integratiebranch voor execution + dashboard-UI, startend vanaf de nieuwe suite-head.
3. Gebruik `codex/dashboard-ui-review` / PR `#22` als inhoudelijke referentie voor die integratiebranch, niet als directe fast-follow merge.
4. Laat `#18`, `#19`, `#20` en `#21` niet meer apart landen als de integratiebranch direct de uiteindelijke UI-combinatie kan dragen.

## Belangrijkste resterende risico’s

- De grootste resterende blokker is geen designrichting maar code-ownership op dezelfde buyer-routes.
  - Execution gebruikt de home-route als execution/gating-oppervlak.
  - Dashboard-shell en review-pass gebruiken diezelfde route als cockpit/presentatie-oppervlak.
  - De botsing zit dus op compositie en prioriteit, niet op copypolish.
- Layoutguardrail is inhoudelijk goed in de dashboardlijn, maar nog niet geïntegreerd met de execution-laag.
  - `dashboard-shell.tsx` houdt een vaste linker rail.
  - De primaire gegevens blijven centraal in de content frame.
  - Deze guardrail kan pas suite-klaar heten zodra hij samenvalt met de execution-secties op home en campaign detail.
- Semantisch kleurgebruik is in de dashboardlijn expliciet bewaakt.
  - Admin-oppervlakken reserveren amber/emerald voor echte status en houden blauw/slate informatief.
  - Dit is afgedekt in `frontend/app/(dashboard)/beheer/color-semantics.test.ts`.
  - Ook dit is nog niet suite-geïntegreerd zolang de conflictlaag op home/detail openstaat.

## Verificatie en regressiecheck

- Uitgevoerd op de reviewbranch met `codex/execution-package-review` gemerged:
  - `npx vitest run "app/(dashboard)/dashboard/page.test.ts" "app/(dashboard)/campaigns/[id]/page.test.ts" "app/(dashboard)/campaigns/[id]/page.route-shell.test.ts" "lib/guided-self-serve.test.ts" "lib/response-activation.test.ts"` -> `5` testfiles, `20` tests, alles groen
  - `npm.cmd run build` -> groen
  - `python -m pytest tests/test_api_flows.py -k respondent_import -q` -> `4` tests groen
- Uitgevoerd in een schone verificatieworktree op `codex/dashboard-ui-review`:
  - `npm.cmd run lint -- "app/(dashboard)/campaigns/[id]/page.tsx" "app/(dashboard)/dashboard/page.tsx" "app/(dashboard)/dashboard/loading.tsx" "components/dashboard/dashboard-shell.tsx" "components/dashboard/dashboard-primitives.tsx" "lib/dashboard/dashboard-shell-config.ts"` -> groen
  - `npm.cmd test -- "app/(dashboard)/campaigns/[id]/page.test.ts" "app/(dashboard)/dashboard/page.test.ts" "lib/dashboard/dashboard-primitives.test.ts" "app/(dashboard)/beheer/page.test.ts" "app/(dashboard)/beheer/contact-aanvragen/page.test.ts" "app/(dashboard)/beheer/klantlearnings/page.test.ts"` -> `6` testfiles, `10` tests, alles groen
  - `npm.cmd run build` -> groen
- Integratieproef op deze reviewbranch:
  - merge van `origin/codex/execution-package-review` -> schoon
  - merge van dashboardbranches daarna -> conflicts, dus geen directe suite-landing

## Oordeel

- `codex/execution-package-review` / PR `#17`: suite-landingsklaar
- Dashboard-UI-lijn `#18` tot en met `#22`: inhoudelijk reviewklaar, maar nog niet suite-landingsklaar na execution
- Totaaloordeel voor deze twee lijnen samen: gedeeltelijk suite-klaar

## Aanbevolen volgende stap

Land nu gecontroleerd PR `#17` op `codex/suite-hardening-parity-normalization` en open daarna een aparte, expliciete integration-only branch voor execution + dashboard-UI. Gebruik daarbij PR `#22` als referentie voor shell/state/module/admin/UI-keuzes, maar open geen nieuwe design- of scopepass.
