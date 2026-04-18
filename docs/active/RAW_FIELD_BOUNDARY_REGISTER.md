# RAW_FIELD_BOUNDARY_REGISTER

Last updated: 2026-04-18  
Status: active  
Source of truth: active field semantics canon, metrics/method closeout gate and explicitly labeled historical plan/reference docs.

## Titel

Historical/raw-field boundary labeling

## Korte samenvatting

Dit register markeert waar oudere actieve of referentiedocumenten nog raw/storage-taal gebruiken die te makkelijk als producttaal gelezen kan worden. De belangrijkste uitkomst is een expliciet onderscheid tussen raw/storage field, runtime field, productlabel en buyer-facing label, plus boundary-notes op de meest risicovolle RetentieScan-validatiedocs.

## Wat is geaudit

- [RETENTIESCAN_V1_1_EVIDENCE_AND_CLAIMS.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTIESCAN_V1_1_EVIDENCE_AND_CLAIMS.md)
- [RETENTIESCAN_V1_1_VALIDATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTIESCAN_V1_1_VALIDATION_PLAN.md)
- [RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md)
- [FIELD_SEMANTICS_HARDENING_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/FIELD_SEMANTICS_HARDENING_PLAN.md)
- [METRICS_METHOD_CLOSEOUT_GATE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRICS_METHOD_CLOSEOUT_GATE.md)
- [METHODOLOGY.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reference/METHODOLOGY.md)

## Belangrijkste bevindingen

- De grootste boundarybehoefte zat in oudere actieve RetentieScan-validatiedocs, niet in de huidige hoofdcanon.
- `RETENTIESCAN_V1_1_EVIDENCE_AND_CLAIMS.md` en `RETENTIESCAN_V1_1_VALIDATION_PLAN.md` noemden raw termen al functioneel, maar zonder expliciete scheidslijn tussen technische en productspecifieke taal.
- De huidige hoofdcanon in `FIELD_SEMANTICS_HARDENING_PLAN.md` en `METRICS_METHOD_CLOSEOUT_GATE.md` is al duidelijker en kan als interpretatiekader dienen voor oudere plannen.

## Belangrijkste inconsistenties of risico's

- Niet elk historisch document is nu individueel herschreven; dit register voorkomt vooral mislezing, niet volledig historisch taalonderhoud.
- `RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md` bevat nog raw-termen in historische context zonder aparte inline boundarynote.
- Externe notities, ad-hoc analyses of niet-geaudeerde scripts buiten deze set kunnen nog dezelfde drift dragen.

## Beslissingen / canonvoorstellen

- Lees vanaf nu elk document met raw termen door deze vier lagen:
  - `raw/storage field`
  - `runtime field`
  - `product label`
  - `buyer-facing label`
- De actieve canon heeft voorrang boven oudere sharpenings- of validatieplannen.
- Waar een document nog raw termen gebruikt zonder expliciete note, geldt dit register als interpretatieboundary.

## Boundary matrix

| Laag | Voorbeeld | Betekenis | Mag buyer-facing leidend zijn |
| --- | --- | --- | --- |
| Raw/storage field | `risk_score`, `avg_risk_score`, `stay_intent_score` | DB-, ORM- of ruwe payloadnaam | nee |
| Runtime field | `risk_score` in scoring/report input, `avg_risk_score` in pattern output | technische werknaam binnen runtime of analytics | nee |
| Product label | `Frictiescore`, `Retentiesignaal`, `Teamsignaal`, `stay-intent` | productspecifieke managementtaal | ja |
| Buyer-facing label | `gem. retentiesignaal`, `groepssignaal`, `aanvullende signaallaag` | vereenvoudigde maar canontrouwe externe taal | ja |

## Documentstatus register

| Document | Status | Boundary |
| --- | --- | --- |
| `RETENTIESCAN_V1_1_EVIDENCE_AND_CLAIMS.md` | active but bounded | inline boundary note toegevoegd |
| `RETENTIESCAN_V1_1_VALIDATION_PLAN.md` | active but bounded | inline boundary note toegevoegd |
| `RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md` | historical-active reference | lees raw termen via dit register en de actieve semantiekcanon |
| `FIELD_SEMANTICS_HARDENING_PLAN.md` | canon-active | leidend voor raw/runtime/product onderscheid |
| `METRICS_METHOD_CLOSEOUT_GATE.md` | canon-active | leidend voor interpretatie van raw-termen in metric/method context |

## Concrete wijzigingen

- Nieuw register toegevoegd: [RAW_FIELD_BOUNDARY_REGISTER.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RAW_FIELD_BOUNDARY_REGISTER.md)
- Boundary-notes toegevoegd in:
  - [RETENTIESCAN_V1_1_EVIDENCE_AND_CLAIMS.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTIESCAN_V1_1_EVIDENCE_AND_CLAIMS.md)
  - [RETENTIESCAN_V1_1_VALIDATION_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTIESCAN_V1_1_VALIDATION_PLAN.md)

## Validatie

- De gelabelde docs verwijzen nu explicieter naar productspecifieke labels boven raw termen.
- Dit register verandert geen productclaim, DB-schema of API-contract.

## Assumptions / defaults

- Niet elk ouder document hoeft inline volledig herschreven te worden zolang de boundarylaag expliciet en terugvindbaar is.
- `RETENTIESCAN_PRODUCT_SHARPENING_PLAN.md` blijft bruikbaar als historische aanscherpingsreferentie, niet als leidende semantiekcanon.

## Next gate

Beoordelen of een apart schema/db semantic migration plan nog echte meerwaarde heeft boven de nu vastgelegde boundarylaag.
