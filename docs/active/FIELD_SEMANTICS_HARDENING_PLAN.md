# FIELD_SEMANTICS_HARDENING_PLAN

Last updated: 2026-04-18  
Status: active  
Source of truth: active metric/method canon, current ORM/schema contracts, product definitions and runtime report builders.

## Titel

Field Semantics And Code Alias Hardening

## Korte samenvatting

Deze hardeningstap maakt expliciet waar gedeelde technische veldnamen meerdere productbetekenissen dragen. De belangrijkste uitkomst is dat documentalias nu al verplicht is, terwijl echte code-aliasing alleen veilig moet gebeuren waar runtime, API- en datamigratiegrenzen dat toelaten.

## Wat is geaudit

- [backend/models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [backend/report.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/report.py)
- [backend/main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [backend/products/exit/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/exit/definition.py)
- [backend/products/retention/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/definition.py)
- [backend/products/team/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/team/definition.py)
- [backend/products/onboarding/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/onboarding/definition.py)
- [backend/products/pulse/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/pulse/definition.py)
- [backend/products/leadership/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/leadership/definition.py)
- [frontend/lib/products/retention/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/retention/definition.ts)
- [frontend/lib/products/team/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/team/definition.ts)
- [frontend/lib/products/onboarding/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/onboarding/definition.ts)
- [frontend/lib/products/pulse/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/pulse/definition.ts)
- [frontend/lib/products/leadership/definition.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/leadership/definition.ts)

## Belangrijkste bevindingen

- `risk_score` is een technisch opslag- en runtimeveld, maar buyer-facing altijd productspecifiek:
  - ExitScan -> `Frictiescore`
  - RetentieScan -> `Retentiesignaal`
  - TeamScan -> `Teamsignaal`
  - Onboarding 30-60-90 -> `Onboardingsignaal`
  - Pulse -> `Pulsesignaal`
  - Leadership Scan -> `Leadershipsignaal`
- `stay_intent_score` is de scherpste semantische hotspot:
  - RetentieScan: echte stay-intent
  - ExitScan: exitcontext-item voor preventability/context
  - Pulse: bounded reviewsignaal op basis van een richtingsvraag
- `stay_item` is in productdefinitions een gedeelde technische promptstructuur, maar inhoudelijk productspecifiek:
  - Team -> lokale richting
  - Onboarding -> checkpoint-richting
  - Leadership -> managementrichting
- Niet alle semantische drift vraagt codewijziging; op meerdere plekken is documentalias en view-model alias eerst de veiligste stap.

## Belangrijkste inconsistenties of risico's

- ORM- en schema-veldnamen kunnen te snel als productcanon gelezen worden door latere implementers.
- Een te vroege rename van database- of API-velden zou migrations, ingest en rapportgeneratie onnodig riskant maken.
- Zonder view-model aliasing kunnen dashboard- en reportbuilders generieke veldnamen blijven exporteren naar latere lagen.

## Beslissingen / canonvoorstellen

- `risk_score` blijft voorlopig technisch bestaan, maar telt alleen als storage/runtime-naam en nooit als productlabel.
- `stay_intent_score` blijft voorlopig technisch bestaan, maar moet documentair en in view-models expliciet als productspecifiek construct worden vertaald.
- Echte code-aliasing wordt opgesplitst in drie niveaus:
  - niveau 1: doc alias en comments
  - niveau 2: response/view-model alias
  - niveau 3: schema/db alias of rename, alleen met expliciete migratiegates

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [FIELD_SEMANTICS_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/FIELD_SEMANTICS_HARDENING_PLAN.md)

## Aliasmatrix

| Technisch veld | Product / laag | Canonieke lezing | Huidige maatregel | Latere code-alias nodig |
| --- | --- | --- | --- | --- |
| `risk_score` | alle producten | productspecifiek signaallabel | doc alias verplicht | ja, in view-model/exportlaag |
| `stay_intent_score` | RetentieScan | echte stay-intent | doc alias verplicht | mogelijk |
| `stay_intent_score` | ExitScan | exitcontext-item, geen stay-intent | doc alias verplicht | ja, bij latere code cleanup wenselijk |
| `stay_intent_score` | Pulse | bounded richtingssignaal | doc alias verplicht | ja, bij latere code cleanup wenselijk |
| `stay_item` | Team | lokale richtingsvraag | doc alias verplicht | nee, zolang productdefinition leidend blijft |
| `stay_item` | Onboarding | checkpoint-richtingsvraag | doc alias verplicht | nee, zolang productdefinition leidend blijft |
| `stay_item` | Leadership | managementrichtingsvraag | doc alias verplicht | nee, zolang productdefinition leidend blijft |
| `signal_profile` | RetentieScan | bestuurlijke synthese, geen metric | doc alias verplicht | alleen als view/export drift blijft bestaan |

## Hardeningvolgorde

1. Behoud database- en API-contracten voorlopig intact.
2. Maak semantiek expliciet in ORM-, schema- en actieve canoncomments.
3. Voeg waar nodig view-model aliases toe in report/dashboard exportlagen.
4. Overweeg pas daarna schema- of database-aliassen als er echte winst is zonder contractbreuk.

## Validatie

- Het plan verandert geen runtimegedrag.
- Het plan opent de ExitScan-architectuur niet.
- Er is geen pricing-, portfolio- of productstatusbesluit in hardcoded.

## Assumptions / defaults

- Zolang dezelfde payload door meerdere lagen loopt, is documentalias de minimale truth boundary.
- Echte code-aliasing is alleen wenselijk als ze runtime, tests en datamigraties niet onnodig fragiel maakt.

## Next gate

RetentieScan technical parity hardening.
