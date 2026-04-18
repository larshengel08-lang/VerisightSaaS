# RETENTION_PARITY_SIGNOFF

Last updated: 2026-04-18  
Status: active  
Source of truth: RetentieScan report grammar parity review, dashboard/report parity check, retention method/read parity review and product language canon.

## Titel

RetentieScan Technical Parity Hardening - Signoff

## Korte samenvatting

RetentieScan is nu voldoende gehard als gedeelde-grammar kernroute. Report, dashboard, preview en methodiek volgen dezelfde verification-first managementlijn, zonder RetentieScan op hetzelfde architectuurniveau als ExitScan te forceren.

## Wat is geaudit

- [RETENTION_REPORT_GRAMMAR_PARITY_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTION_REPORT_GRAMMAR_PARITY_REVIEW.md)
- [RETENTION_DASHBOARD_REPORT_PARITY_CHECK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTION_DASHBOARD_REPORT_PARITY_CHECK.md)
- [RETENTION_METHOD_READ_PARITY_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTION_METHOD_READ_PARITY_REVIEW.md)
- [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md)
- [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md)
- [backend/products/retention/report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/report_content.py)
- [frontend/lib/products/retention/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/retention/dashboard.ts)
- [frontend/lib/report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts)

## Belangrijkste bevindingen

- RetentieScan volgt nu overal dezelfde managementlijn:
  `cover met executive context -> bestuurlijke handoff -> signaalbeeld en drivers -> eerste actie -> eerste managementsessie`
- De executive laag is inhoudelijk verification-first en blijft begrensd tot groeps- en segmentduiding.
- De grootste resterende debt zat niet meer in grote productclaims, maar in kleine label- en semantiekverschillen tussen runtime en mirrors.

## Belangrijkste inconsistenties of risico's

- RetentieScan blijft gedeelde grammar volgen en heeft dus nog geen ExitScan-achtige architectuurfreeze.
- Gedeelde technische veldnamen kunnen zonder latere aliaslaag opnieuw semantische drift introduceren.
- Longitudinale taal moet beschrijvend blijven totdat echte follow-upuitkomsten meer dragen.

## Beslissingen / canonvoorstellen

- `Bestuurlijke handoff` is de leidende naam voor de executive leeslaag na de cover.
- RetentieScan blijft `shared grammar aligned`, niet `ExitScan architecture aligned`.
- Repeat-, trend- en calibration-taal blijft beschrijvend en verification-first.
- Buyer-facing claims blijven begrensd tot vroegsignalering op behoud, verificatiehulp en prioritering op groepsniveau.

## Concrete wijzigingen

- RetentieScan reportcontent genormaliseerd in [report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/report_content.py)
- Technische parity formeel vastgelegd in [RETENTION_PARITY_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTION_PARITY_SIGNOFF.md)

## Validatie

- Report, preview en dashboard volgen nu dezelfde executive lijn.
- De signoff heropent ExitScan niet en promoveert RetentieScan niet naar een hogere architectuurstatus dan nu gedragen wordt.
- RetentieScan blijft expliciet binnen de method- en claimgrenzen van [METHOD_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_SIGNOFF.md).

## Assumptions / defaults

- `Bestuurlijke handoff` is hier een parity- en executive naam, geen verplichting om RetentieScan exact dezelfde paginering te geven als ExitScan.
- Compacte executive samenvatting op cover of preview blijft toegestaan zolang de managementvolgorde niet verschuift.

## Next gate

Non-core output and dashboard parity hardening.
