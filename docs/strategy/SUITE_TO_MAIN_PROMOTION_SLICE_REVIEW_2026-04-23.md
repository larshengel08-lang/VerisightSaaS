# SUITE_TO_MAIN_PROMOTION_SLICE_REVIEW_2026-04-23

Last updated: 2026-04-23  
Status: active  
Source of truth: `origin/main`, `origin/codex/suite-hardening-parity-normalization`, `MAIN_READINESS_RECHECK_2026-04-23`.

## Titel

Suite-to-main promotion slice review na suite-finalisatie

## Korte samenvatting

De suitebranch is nu technisch schoon genoeg en inhoudelijk volwassen genoeg om de vraag te verschuiven van `kan dit al naar main?` naar `welke minimale promotiesnede is nu verantwoord?`

De juiste eerste promotiesnede is **niet** de volledige suitebranch. De suite bevat daarvoor nog te veel tegelijk:

- report-runtime en backendrapportage
- non-core dashboard- en shelllagen
- delivery-control en admin-oppervlakken
- buyer-facing website- en productpositionering
- uitgebreide docs- en audittrail

De aanbevolen eerste promotiesnede is daarom:

**de public commercial and routing slice**

Dus:

- publieke homepage-/aanpak-/tarieven-/vertrouwen-oppervlakken
- oplossingen- en productpagina’s
- marketing copy, productmaps, contactfunnel en routekeuze
- canonical/routing/buildlaag die nu al op suite is gereconcilieerd
- alleen de direct bijbehorende frontend regressies

## Waarom juist deze slice eerst

Deze slice lost drie dingen tegelijk op zonder de hele suite in één stap naar `main` te trekken:

### 1. Ze vervangt de oudere main-homepage-lijn

`main` draagt nog een oudere homepage-/preview- en management-flowlijn. Die is zichtbaar, buyer-facing en inhoudelijk niet meer de werkende canon.

### 2. Ze houdt de promotie nog frontend-first

De slice blijft grotendeels in:

- `frontend/app`
- `frontend/components/marketing`
- `frontend/lib/contact-*`
- `frontend/lib/marketing-*`
- `frontend/middleware.ts`
- `frontend/next.config.ts`
- `frontend/package*.json`

Dus nog geen brede backend/report-runtimepromotie.

### 3. Ze maakt main commercieel en publiek dichter bij de suitecanon

Zonder direct ook:

- delivery ops
- dashboard architectuur
- report engine
- non-core admin/detailgedrag

mee te trekken.

## Wat in slice 1 hoort

### Publieke route- en marketingoppervlakken

- `frontend/app/page.tsx`
- `frontend/app/aanpak/page.tsx`
- `frontend/app/tarieven/page.tsx`
- `frontend/app/vertrouwen/page.tsx`
- `frontend/app/oplossingen/[slug]/page.tsx`
- `frontend/app/producten/page.tsx`
- `frontend/app/producten/[slug]/page.tsx`
- de buyer-facing productcomponenten onder `frontend/app/producten/_components`

### Commerciële logica en routekeuze

- `frontend/components/marketing/site-content.ts`
- `frontend/components/marketing/contact-form.tsx`
- `frontend/lib/contact-funnel.ts`
- `frontend/lib/contact-qualification.ts`
- `frontend/lib/marketing-products.ts`

### Routing- en buildlaag die bij deze slice hoort

- `frontend/middleware.ts`
- `frontend/lib/canonical-host.ts`
- `frontend/next.config.ts`
- `frontend/package.json`
- `frontend/package-lock.json`

### Directe regressies

- `frontend/tests/e2e/approach.spec.ts`
- `frontend/tests/e2e/pricing.spec.ts`
- `frontend/tests/e2e/trust.spec.ts`
- `frontend/tests/e2e/products-overview.spec.ts`
- `frontend/tests/e2e/exitscan.spec.ts`
- `frontend/tests/e2e/retentiescan.spec.ts`
- `frontend/tests/e2e/onboarding.spec.ts`
- `frontend/tests/e2e/combinatie.spec.ts`
- plus de direct geraakte `contact-*`, `marketing-*`, `canonical-host` en `public-route-access` tests

## Wat expliciet nog niet in slice 1 hoort

Deze blijven bewust buiten de eerste promotiesnede:

### Backend report/runtime

- `backend/report.py`
- `backend/report_design.py`
- productspecifieke report-content voor `pulse`, `leadership`, `onboarding`
- de bredere reporting- en PDF-architectuur

### Dashboard/admin/deliverylaag

- `frontend/app/(dashboard)/campaigns/[id]/*`
- `frontend/lib/ops-delivery.ts`
- `frontend/components/dashboard/preflight-checklist.tsx`
- de delivery-control en management-use governance

### Non-core runtime en bounded admin truth

- dashboard-shelling voor non-core routes
- admin- of operatorgerichte bounded vervolglogica
- de bredere non-core control- en reportinglaag

### Grote docs- en audittrail

- closeout-docs
- grammar freeze docs
- portfolio canon docs
- reporting canon docs
- bredere strategie- en audittrail-uitbreidingen

## Waarom deze begrenzing belangrijk is

Als slice 1 ook backend reportlogic, dashboardcontrol en non-core admintruth meeneemt, krijg je opnieuw precies het probleem dat we wilden voorkomen:

- te veel tegelijk
- te veel gekoppelde regressies
- geen duidelijke promotiereden behalve “de suite is de canon”

De eerste promotiesnede moet juist verdedigbaar zijn als:

`we brengen main eerst publiek, commercieel en routingmatig terug naar de werkende suitecanon`

niet als:

`we trekken alvast bijna alles naar main`

## Aanbevolen verificatie voor slice 1

Minimaal:

- `next build`
- `lib/canonical-host.test.ts`
- `lib/public-route-access.test.ts`
- `lib/contact-funnel.test.ts`
- `lib/contact-qualification.test.ts`
- `lib/marketing-flow.test.ts`
- `lib/marketing-positioning.test.ts`
- `lib/seo-conversion.test.ts`
- de geselecteerde publieke e2e-specs of hun snelste bruikbare equivalent

Niet nodig voor slice 1:

- delivery ops tests
- report generation smoke
- backend reporting parity

## Oordeel

De eerste promotiesnede richting `main` moet een **public commercial and routing slice** zijn.

Dat is klein genoeg om bestuurlijk en technisch verdedigbaar te blijven, en groot genoeg om `main` zichtbaar dichter bij de werkende suitecanon te brengen.

De volledige suitebranch in één stap promoten blijft op dit moment te breed.

## Aanbevolen volgende stap

Open een aparte uitvoerbranch:

`codex/main-promotion-slice-public-commercial`

en laat die branch alleen dit doen:

1. de public commercial and routing slice vanuit suite naar een schone `main`-afgeleide branch brengen
2. gerichte verificatie draaien op alleen deze slice
3. daarna pas beoordelen of een PR naar `main` verantwoord is
