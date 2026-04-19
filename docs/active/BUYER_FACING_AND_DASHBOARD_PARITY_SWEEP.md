# BUYER_FACING_AND_DASHBOARD_PARITY_SWEEP.md

Last updated: 2026-04-18
Status: active
Source of truth: deze sweep toetst de zichtbare buyer-facing en dashboardlagen aan [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md), [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md) en de vastgezette ExitScan-boundary.

## Titel

Buyer-Facing And Dashboard Parity Sweep

## Korte samenvatting

De sweep heeft de meest zichtbare drift teruggebracht naar de canon. ExitScan-detailcopy benoemt nu eerst `cover -> respons -> bestuurlijke handoff`, tarieven gebruiken geen `retentierisico`- of `diagnose`-taal meer waar die productmatig te hard of te diffuus was, en dashboard-follow-upteksten sturen nu terug naar `bredere duiding` in plaats van `bredere diagnose`.

## Wat is geaudit

- [page.tsx](</C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx>)
- [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- [page.tsx](</C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx>)
- [report-preview-copy.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.test.ts)

## Belangrijkste bevindingen

- De grootste buyer-facing drift zat nog in de ExitScan-detailpagina, waar de rapportlezing te vroeg bij `managementsamenvatting` begon in plaats van bij `cover` en `respons`.
- In pricingcopy stond `retentierisico` nog als te harde headline-achtige taal voor RetentieScan.
- In dashboard-follow-upteksten stond `bredere diagnose` nog als terugvalroute, terwijl de hardeningcanon juist werkt met `duiding`, `kernroute` en `verificatie`.

## Belangrijkste inconsistenties of risico’s

- Niet alle buyer-facing teksten zijn nu volledig opnieuw geaudit; deze sweep pakt de meest zichtbare drift in product-, pricing- en dashboardlagen.
- RetentieScan-report grammar verdient nog een eigen parity review voordat de openingstaal daar definitief scherper wordt vastgezet.

## Beslissingen / canonvoorstellen

- Voor ExitScan mag buyer-facing copy de hoofdflow alleen nog samenvatten als:
  - cover
  - respons
  - bestuurlijke handoff
  - daarna pas managementvraag, verificatiespoor en actie
- `Retentierisico` blijft te hard als buyer-facing baselinebeschrijving voor RetentieScan; `behoudsdruk` en `vroegsignalering op behoud` zijn hier veiliger canon.
- Dashboardcopy moet bij bounded follow-on routes terugvallen op `bredere duiding` of `bredere kernroute`, niet op `bredere diagnose`.

## Concrete wijzigingen

- ExitScan-detailcopy aangepast in [page.tsx](</C:/Users/larsh/Desktop/Business/Verisight/frontend/app/producten/[slug]/page.tsx>)
- Pricingcopy genormaliseerd in [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/tarieven/page.tsx)
- Dashboard follow-upteksten genormaliseerd in [page.tsx](</C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx>)
- Preview-regressietest geactualiseerd in [report-preview-copy.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.test.ts)

## Validatie

- Frontend previewtests controleren nu de nieuwe `Cover + respons` bewijslaag voor ExitScan-previewcopy.
- Frontend build blijft de uiteindelijke guardrail om te zien dat product-, pricing- en dashboardcopy nog compileert zonder regressie.

## Assumptions / defaults

- Deze sweep verandert geen ontwerpstructuur of navigatie.
- `Diagnose` mag in trust- of grensuitleg nog voorkomen als ontkenning van wat Verisight niet is, maar niet als buyer-facing route- of terugvalbelofte.

## Next gate

De beste volgende stap is `RetentieScan report grammar parity review`, zodat de RetentieScan-opening en gedeelde grammarlaag net zo expliciet kunnen worden gehard als inmiddels voor ExitScan is gebeurd.
