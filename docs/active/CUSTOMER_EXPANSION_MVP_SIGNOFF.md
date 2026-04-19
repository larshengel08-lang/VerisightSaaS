# MVP Implementation

## Titel

Customer Expansion MVP Signoff

## Korte samenvatting

De MVP levert een data-driven, explainable customer expansion suggester op die automatisch op twee bestaande operationele surfaces draait: het campaign-dashboard en de pilot-learning-workbench. De engine blijft bewust beperkt tot buyer-safe vervolgroutes die de huidige routecanon en productmaturity dragen.

## Wat is gebouwd

- `frontend/lib/customer-expansion-suggester.ts`
- `frontend/lib/customer-expansion-suggester.test.ts`
- dashboardintegratie in `frontend/app/(dashboard)/campaigns/[id]/page.tsx`
- workbenchintegratie in `frontend/components/dashboard/pilot-learning-workbench.tsx`

## Belangrijkste bevindingen

- De engine kan zonder databasewijziging bruikbare beslissuggesties geven.
- Dashboard en workbench kunnen dezelfde suggestielogica delen zonder een aparte backend service.
- De bestaande lifecyclevelden zijn genoeg om suppressief en buyer-safe te blijven.

## Belangrijkste risico's

- TeamScan-validatie blijft in de workbench conservatiever dan in het dashboard, omdat daar geen ruwe responsegroepen beschikbaar zijn.
- De engine gebruikt nog geen expliciete persistente decision log; handoff blijft daarom afhankelijk van `next_route` en delivery discipline.
- Een volledige Next.js build vraagt projectenvs voor Supabase-prerendering en kan daarom lokaal blokkeren buiten deze featurecode om.

## Beslissingen / canonvoorstellen

- De MVP toont alleen routes die in v1 echt gedragen zijn:
  - `RetentieScan ritme`
  - `Compacte vervolgmeting`
  - `Pulse`
  - `Segment Deep Dive`
  - `TeamScan`
- Niet-gedragen routes blijven suppressed.
- `Nu niet` blijft een first-class uitkomst.

## Concrete wijzigingen

- Nieuwe engine en testfile toegevoegd.
- Campaign-dashboard uitgebreid met een expliciete `Customer expansion suggester`-kaart.
- Learning-workbench uitgebreid met suggestiekaarten en quick-apply naar `next_route`.
- Campaign-query uitgebreid met `first_action_taken` voor betere follow-upcontext.

## Validatie

- `npm.cmd test -- --run "lib/customer-expansion-suggester.test.ts" "lib/pilot-learning.test.ts" "app/(dashboard)/campaigns/[id]/page-helpers.test.ts" "lib/client-onboarding.test.ts"` -> geslaagd
- `npm.cmd run lint -- "app/(dashboard)/campaigns/[id]/page.tsx" "components/dashboard/pilot-learning-workbench.tsx" "lib/customer-expansion-suggester.ts" "lib/customer-expansion-suggester.test.ts"` -> geslaagd
- `npm.cmd run build` -> code compileert en typecheckt, maar prerender stopt op ontbrekende Supabase env voor `/complete-account`

## Assumptions / defaults

- Dashboard is de primaire operationele surface voor delivery.
- Workbench is de primaire surface voor expliciete handoff en learning capture.
- V1 blijft computed en niet migration-first.

## Next gate

Hardening And Commercial Guardrails: expliciet vastleggen hoe de engine te vroeg, te breed of te commercieel agressief advies voorkomt.
