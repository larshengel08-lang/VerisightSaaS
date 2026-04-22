# NON_CORE_DASHBOARD_PARITY_MATRIX

Last updated: 2026-04-22  
Status: active  
Source of truth: product language canon, non-core output parity review, onboarding 5-readiness signoff and current dashboard implementations.

## Titel

Non-core Output And Dashboard Parity Hardening - Dashboard matrix

## Korte samenvatting

Deze matrix legt vast hoe de non-core lijnen nu over reportcontent en dashboardlaag heen gelezen moeten worden. De nadruk ligt op bounded handoff, beperkte managementwaarde en expliciete terugschakelgrenzen.

## Wat is geaudit

- [backend/products/team/report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/report_content.py)
- [backend/products/onboarding/report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/onboarding/report_content.py)
- [backend/products/leadership/report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/leadership/report_content.py)
- [frontend/lib/products/team/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/dashboard.ts)
- [frontend/lib/products/onboarding/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/dashboard.ts)
- [frontend/lib/products/pulse/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/pulse/dashboard.ts)
- [frontend/lib/products/leadership/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/dashboard.ts)

## Belangrijkste bevindingen

- Alle vier de non-core lijnen hebben nu een duidelijke bounded managementroute.
- De parity is het sterkst wanneer executive label, first action en fallbackgrens dezelfde taal gebruiken.

## Belangrijkste inconsistenties of risico's

- Dashboard- en reportcontent voor non-core lijnen blijven gevoeliger voor drift dan ExitScan en RetentieScan, omdat hun output compacter en jonger is.

## Beslissingen / canonvoorstellen

| Product | Executive label | Hoofdread | Eerste route | Fallbackgrens |
| --- | --- | --- | --- | --- |
| TeamScan | Lokale handoff | department-first lokalisatie | bounded lokale check | terug naar bredere duiding |
| Onboarding 30-60-90 | Bestuurlijke handoff | single-checkpoint managementread | owner, eerste stap en bounded review | terug naar bredere duiding |
| Pulse | compacte managementhandoff | bounded reviewmoment | kleine correctie en bounded hercheck | geen extra Pulse als eerst bredere duiding nodig is |
| Leadership Scan | Management-handoff | geaggregeerde managementcontext-read | bounded verificatie of correctie | terug naar bredere duiding |

## Concrete wijzigingen

- Matrix aangemaakt: [NON_CORE_DASHBOARD_PARITY_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/NON_CORE_DASHBOARD_PARITY_MATRIX.md)

## Validatie

- De matrix sluit aan op de actuele code en op de bounded productgrenzen uit de canon.

## Assumptions / defaults

- Deze matrix is een parityhulpmiddel en geen productpromotielaag.

## Next gate

Historical canon boundary cleanup.
