# METRICS_METHOD_CLOSEOUT_GATE

Last updated: 2026-04-18  
Status: active  
Source of truth: metric signoff, method signoff, field semantics hardening plan and current schema/view-model implementation.

## Titel

Final metrics/method closeout gate

## Korte samenvatting

De metric- en methodtranche is nu formeel gesloten voor deze hardeningfase. Hoofdmetrics, claimgrenzen, bounded route-uitleg en survey-naar-signaal-ketens zijn inhoudelijk vastgelegd, terwijl een non-breaking aliaslaag boven gedeelde technische velden voorkomt dat generieke raw namen opnieuw productdrift introduceren.

## Wat is geaudit

- [METHOD_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_SIGNOFF.md)
- [METRIC_HARDENING_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_HARDENING_SIGNOFF.md)
- [FIELD_SEMANTICS_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/FIELD_SEMANTICS_HARDENING_PLAN.md)
- [METHOD_EVIDENCE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_EVIDENCE_REVIEW.md)
- [METHOD_RISK_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_RISK_MATRIX.md)
- [METRIC_INVENTORY_BY_PRODUCT.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_INVENTORY_BY_PRODUCT.md)
- [QUESTION_TO_SIGNAL_MAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/QUESTION_TO_SIGNAL_MAP.md)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)

## Belangrijkste bevindingen

- De metric- en methodcanon zijn onderling consistent genoeg om als actieve truthlaag te dienen.
- Producthoofdcijfers blijven productspecifiek, ook wanneer storage- en runtimevelden generiek zijn.
- De response- en view-model aliases `avg_signal_score`, `signal_score` en `direction_signal_score` geven nu een veilige semantische brug zonder contractbreuk.
- ExitScan-nevenmetrics blijven gedegradeerd; RetentieScan trend- en repeatlagen blijven beschrijvend; compacte lijnen blijven bounded.

## Belangrijkste inconsistenties of risico's

- Een latere schema- of database-rename van gedeelde velden kan nog wenselijk zijn, maar is nu niet nodig voor truth, parity of methodcloseout.
- Historische docs en oude analytics-query's kunnen buiten deze actieve laag nog steeds raw veldnamen dragen.
- `stay_intent_score` blijft technisch een gedeeld veld, ook al is de productbetekenis nu beter begrensd.

## Beslissingen / canonvoorstellen

- Deze closeout gate is `pass with bounded technical debt`.
- Product truth volgt productspecifieke metric- en methodtaal, niet de raw backendveldnaam.
- Response- en view-model aliasing geldt nu als minimale verplichte semantische beschermlaag.
- Diepere schema/db-aliassing mag alleen in een aparte migratiegated thread plaatsvinden.

## Concrete wijzigingen

- Closeout vastgelegd in [METRICS_METHOD_CLOSEOUT_GATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRICS_METHOD_CLOSEOUT_GATE.md)
- Signoff docs bijgewerkt:
  - [METHOD_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_SIGNOFF.md)
  - [METRIC_HARDENING_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_HARDENING_SIGNOFF.md)
- Field semantics plan bijgewerkt:
  - [FIELD_SEMANTICS_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/FIELD_SEMANTICS_HARDENING_PLAN.md)
- Non-breaking aliaslaag toegevoegd in:
  - [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
  - [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
  - [frontend/lib/types.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.ts)

## Validatie

- Backend aliasvalidatie:
  - [tests/test_field_semantics_aliases.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_field_semantics_aliases.py)
- API stats aliasvalidatie:
  - [tests/test_api_flows.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py)
- Frontend helpervalidatie:
  - [frontend/lib/types.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/types.test.ts)

## Assumptions / defaults

- Deze closeout sluit de huidige method/metric tranche inhoudelijk af, maar verbiedt later technisch cleanupwerk niet.
- ExitScan `P1-P10 + Appendix` blijft volledig buiten scope van deze stap.
- Buyer-facing taal blijft productspecifiek, ook wanneer interne payloads generiek blijven.

## Next gate

Alleen nog optioneel vervolgwerk: een aparte `schema/db semantic migration gate` of een volgende execution-thread die deze canon toepast op nieuwe analytics- of exportlagen.
