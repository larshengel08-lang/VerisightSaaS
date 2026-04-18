# METHOD_SIGNOFF

Last updated: 2026-04-18  
Status: active  
Source of truth: question-to-signal map, method evidence review, method risk matrix and survey method fix plan.

## Titel

Method And Survey Evidence Flow - Signoff

## Korte samenvatting

De methodfase is voldoende gehard om door te schuiven naar product line hardening. De survey-naar-signaal-keten is expliciet, de grootste methodrisico's zijn benoemd en er ligt een fixplan voor de plekken waar de huidige databasis nog niet hetzelfde gewicht draagt als de sterkste producttaal.

## Wat is geaudit

- [QUESTION_TO_SIGNAL_MAP.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/QUESTION_TO_SIGNAL_MAP.md)
- [METHOD_EVIDENCE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_EVIDENCE_REVIEW.md)
- [METHOD_RISK_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_RISK_MATRIX.md)
- [SURVEY_METHOD_FIX_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/SURVEY_METHOD_FIX_PLAN.md)

## Belangrijkste bevindingen

- Hoofdmetrics zijn methodisch plausibel en proportioneel voor groepsgerichte managementduiding.
- De hoogste risico's zitten niet in de kernsignalering, maar in nevenafleidingen, semantische dubbelzinnigheid en te vroege verbreding van bounded modellen.

## Belangrijkste inconsistenties of risico's

- Degrade-besluiten rond ExitScan-nevenmetrics moeten in latere parity- of product hardeningstappen nog concreet worden doorvertaald.
- Compacte lijnen blijven kwetsbaar zolang hun bounded surveybasis niet in alle lagen even zichtbaar is.

## Beslissingen / canonvoorstellen

- De method gate is `pass with explicit bounded risks`.
- ExitScan en RetentieScan mogen door naar product line hardening zonder hun hoofdmetric of vaste reportarchitectuur te heropenen.
- Follow-on lijnen mogen door naar product hardening, maar alleen als bounded triagemodellen.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [METHOD_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_SIGNOFF.md)

## Validatie

- Surveybasis, afleidingsketen en methodrisico's zijn nu expliciet repo-gebaseerd vastgelegd.
- De signoff verandert geen pricing, productstatus of commerciële shell.
- De vaste ExitScan-report-architectuur blijft onaangetast.

## Assumptions / defaults

- `Pass with explicit bounded risks` betekent dat vervolgwerk mag starten, maar dat bounded claims en suppressieregels actief bewaakt moeten blijven.

## Next gate

Product Line Hardening Flow - `PRODUCT_LINE_BASELINE_REVIEW.md`, `PRODUCT_LINE_PARITY_MATRIX.md`, `PRODUCT_LINE_HARDENING_BACKLOG.md`, `PRODUCT_LINE_HARDENING_WAVES.md` en `PRODUCT_LINE_STATUS_BOARD.md`.
