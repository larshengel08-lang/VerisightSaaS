# PRODUCT_LINE_HARDENING_BACKLOG

Last updated: 2026-04-18  
Status: active  
Source of truth: baseline review, parity matrix, metric canon and method signoff.

## Titel

Product Line Hardening Flow - Backlog

## Korte samenvatting

Deze backlog vertaalt paritygaps naar uitvoerbare hardeningitems. De hoogste prioriteit ligt niet bij verbreding, maar bij truth, formele output parity, bounded suppressie van te harde claims en het gelijk trekken van report-, dashboard- en buyer-facing lagen.

## Wat is geaudit

- [PRODUCT_LINE_BASELINE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_BASELINE_REVIEW.md)
- [PRODUCT_LINE_PARITY_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_PARITY_MATRIX.md)
- [METHOD_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METHOD_SIGNOFF.md)
- [METRIC_HARDENING_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/METRIC_HARDENING_SIGNOFF.md)

## Belangrijkste bevindingen

- De backlog splitst netjes in truth/safety, parity/management use en release readiness.
- Formele output parity is het terugkerende must-fix thema voor TeamScan, Onboarding, Pulse en Leadership.

## Belangrijkste inconsistenties of risico's

- Zonder suppressie van buyer-facing overreach kunnen bounded routes commerciëler klinken dan hun productrealiteit.
- ExitScan en RetentieScan moeten ook nog een paar hardeningpunten krijgen, vooral rond nevenmetrics en buyer-facing drift.

## Beslissingen / canonvoorstellen

- Must-fixes gaan altijd vóór bredere promotie of extra routeverbreding.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [PRODUCT_LINE_HARDENING_BACKLOG.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LINE_HARDENING_BACKLOG.md)

## Backlog

### Must-fix

- ExitScan: houd `preventability_result` en `replacement_cost_eur` uit primaire managementlezing.
- ExitScan: trek buyer-facing detailcopy terug naar `vertrekduiding` en weg van generieke why/delivery headlines.
- RetentieScan: houd `retentiesignaal` expliciet als hoofdmetric boven aanvullende signalen.
- TeamScan: maak formele report/output parity expliciet of houd buyer-facing outputclaims kleiner.
- Onboarding: maak formele report/output parity expliciet of houd buyer-facing outputclaims kleiner.
- Pulse: bevestig bounded reviewstatus in alle lagen en voorkom trendmachine-associatie.
- Leadership: bevestig bounded group-level only status in alle lagen en voorkom named-leader drift.
- Marketing overview: vervang of begrens `status: 'live'` waar dit volwassener klinkt dan de huidige productrealiteit.

### Should-fix

- ExitScan: documenteer productspecifieke aliasen voor generieke veldnamen.
- RetentieScan: reduceer zichtbare `risk`-naming verder waar nog nodig.
- TeamScan: verdiep methodische identiteit versus segment deep dive.
- Onboarding: verdiep checkpoint-methodiek zonder naar journey-engine te schuiven.
- Pulse: maak bounded vergelijklogica explicieter in rapport- en helpteksten.
- Leadership: verdiep managementcontextduiding zonder nieuwe identitylaag.

### Later

- Echte longitudinaliteit of verdere vergelijklogica voor Pulse en Onboarding.
- Eventuele bredere report families voor bounded lijnen nadat truth and safety groen zijn.
- Meer empirische kalibratie op eigendata.

## Validatie

- Backlogitems zijn direct afgeleid uit parity- en methodgaps.
- Er is geen nieuwe productverbreding of redesign in de backlog gesmokkeld.

## Assumptions / defaults

- Een backlogitem mag documentair of codegericht zijn; de prioriteit hangt af van truth- en trustimpact.

## Next gate

Hardening waves en statusboard.
