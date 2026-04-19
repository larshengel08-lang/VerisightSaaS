# ANALYTICS_EXPORT_SEMANTICS_REVIEW

Last updated: 2026-04-18  
Status: active  
Source of truth: field semantics hardening plan, current backend analytics helpers, dashboard helper layer and active admin/runtime exports.

## Titel

Analytics/export semantics pass

## Korte samenvatting

Deze review toetst waar generieke raw velden nog konden teruglekken als productwaarheid in analytics-, dashboard-, helper- en exportlagen. De belangrijkste uitkomst is dat de semantische aliaslaag nu verder is doorgetrokken naar pattern-output, dashboardhelpers en report/runtime-inputs, zonder raw contracts te breken.

## Wat is geaudit

- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [backend/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/scoring.py)
- [frontend/app/(dashboard)/campaigns/[id]/page.tsx](</C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx>)
- [frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx](</C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx>)
- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [frontend/lib/pilot-learning.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/pilot-learning.ts)

## Belangrijkste bevindingen

- De grootste praktische drift zat niet meer in buyer-facing copy, maar in helper- en analyticslagen die nog direct op `risk_score` en `stay_intent_score` bleven leunen.
- `detect_patterns` was een belangrijke interne analytics-exportlaag: die gaf nog alleen `avg_risk_score`, `avg_stay_intent_score` en `department_avg_risk` terug.
- Dashboardhelpers gebruikten direct `response.risk_score` en `response.stay_intent_score`, terwijl er inmiddels een veiliger aliaslaag beschikbaar is.
- De admin/dashboard page gebruikte al productspecifieke labels, maar de samenvattende helpernaam kon nog schoner op `signal` worden gelezen.

## Belangrijkste inconsistenties of risico's

- Raw velden blijven technisch aanwezig in storage, Supabase queries en scoringinput; dat is bewust, maar vraagt blijvende boundarydiscipline.
- Interne datasets of notebooks buiten de repo kunnen nog oude raw termen hanteren.
- Report/runtime-inputs gebruiken nog steeds raw sleutels als primaire analysetaal; in deze ronde is daar alleen non-breaking aliasing aan toegevoegd.

## Beslissingen / canonvoorstellen

- Consumer-lagen horen vanaf nu eerst de aliaslaag te lezen:
  - `signal_score` boven `risk_score`
  - `direction_signal_score` boven `stay_intent_score`
  - `avg_signal_score` boven `avg_risk_score`
- Raw keys mogen blijven bestaan als storage/runtime contract, maar niet als impliciete productlabel in helper- of exportlagen.
- `detect_patterns` geldt nu als interne analyticslaag met dubbel spoor:
  - raw/storage compatibiliteit
  - signal/product alias voor veiligere verdere consumptie

## Concrete wijzigingen

- Dashboard helperlaag genormaliseerd in [page-helpers.tsx](</C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.tsx)
- Dashboard page gebruikt nu de semantische helper `computeAverageSignalScore` in [page.tsx](</C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx>)
- Pattern-output uitgebreid in [backend/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/scoring.py):
  - `avg_signal_score`
  - `avg_direction_signal_score`
  - `department_avg_signal`
- Runtime analytics-inputs uitgebreid in:
  - [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
  - [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)

## Validatie

- Nieuwe helper- en analyticssemantiek is afgedekt in:
  - [tests/test_scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_scoring.py)
  - [frontend/app/(dashboard)/campaigns/[id]/page-helpers.test.ts](</C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page-helpers.test.ts>)
- Bestaande alias- en API-tests blijven leidend:
  - [tests/test_field_semantics_aliases.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_field_semantics_aliases.py)
  - [tests/test_api_flows.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py)

## Assumptions / defaults

- Deze stap verandert geen DB-schema, Supabase-viewdefinitie of API-breaking contract.
- De aliaslaag is bedoeld voor veiligere consumptie in helpers, exports en admin-analytics, niet voor het maskeren van storage-realiteit.

## Next gate

Historical/raw-field boundary labeling.
