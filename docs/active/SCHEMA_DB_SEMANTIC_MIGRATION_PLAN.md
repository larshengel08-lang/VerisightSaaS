# SCHEMA_DB_SEMANTIC_MIGRATION_PLAN

Last updated: 2026-04-18  
Status: draft-active  
Source of truth: field semantics hardening plan, analytics/export semantics review and current DB/API compatibility boundaries.

## Titel

Schema/db semantic migration planning

## Korte samenvatting

Een echte schema/db semantic migration kan later zinvol zijn, maar is nu geen blocker meer voor product truth of method/metric closeout. Dit plan documenteert daarom alleen wanneer zo'n migratie wél waarde oplevert, welke consumers geraakt worden en welke no-go zones eerst beschermd moeten blijven.

## Wat is geaudit

- [backend/models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [backend/scoring.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/scoring.py)
- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)
- [ANALYTICS_EXPORT_SEMANTICS_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/ANALYTICS_EXPORT_SEMANTICS_REVIEW.md)

## Belangrijkste bevindingen

- De grootste businesswaarde van een latere migratie zit niet in buyer-facing copy, maar in het verlagen van technische interpretatiefouten in data/analytics- en integratielagen.
- De huidige non-breaking aliaslaag pakt al het grootste truth-risico weg zonder consumers te breken.
- De raw velden worden breed gebruikt in ORM, scoring, report generation, API responses, tests en waarschijnlijk ook Supabase-views of externe analyses.

## Belangrijkste inconsistenties of risico's

- Een te vroege rename raakt mogelijk:
  - databasekolommen
  - Supabase select-statements
  - Pydantic schemas
  - report/scoring helpers
  - frontend typings
  - tests
  - externe notebooks of exports
- `stay_intent_score` is semantisch heterogener dan `risk_score`; een rename kan daar zelfs nieuwe schijnprecisie introduceren als productcontext niet wordt meegemigreerd.

## Beslissingen / canonvoorstellen

- Geen schema/db semantic migration uitvoeren in deze tranche.
- Alleen starten als minimaal één van deze voorwaarden waar is:
  - analyticsconsumers blijven ondanks aliaslaag structureel op raw termen vastlopen
  - nieuwe integraties of BI-lagen productspecifieke labels niet veilig kunnen mappen
  - contractversie of migration-window expliciet gepland en testbaar is
- Eerste kandidaat voor migratie is eerder aliasing-at-source dan directe rename-in-place.

## Voorgestelde migratievolgorde

1. Consumer inventory afronden buiten de app-code:
   - Supabase views
   - exports
   - notebooks
   - internal BI
2. Shadow alias fields of views introduceren:
   - bijvoorbeeld `signal_score` naast `risk_score`
   - bijvoorbeeld `direction_signal_score` naast `stay_intent_score`
3. Consumers migreren naar aliasvelden
4. Pas daarna besluiten of raw velden intern deprecated kunnen worden
5. Pas als laatste: echte rename of schema-opruiming

## No-go zones

- ExitScan report architecture
- actieve survey submit contracten
- lopende report generation paths zonder volledige regressiedekking
- buyer-facing of dashboardlabels als afleiding van technische rename

## Concrete wijzigingen

- Nieuw plandocument toegevoegd: [SCHEMA_DB_SEMANTIC_MIGRATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SCHEMA_DB_SEMANTIC_MIGRATION_PLAN.md)

## Validatie

- Dit plan voert geen migratie, rename of contractwijziging uit.
- Het sluit aan op de bestaande aliaslaag en houdt alle huidige raw contracts intact.

## Assumptions / defaults

- De huidige aliaslaag blijft voorlopig voldoende voor product truth en parity.
- Een latere migratie is alleen zinvol als ze technische schuld echt verlaagt zonder nieuwe productdrift te openen.

## Next gate

Alleen oppakken in een aparte migration-gated thread met expliciete consumer inventory, rollbackplan en volledige regressieverificatie.
