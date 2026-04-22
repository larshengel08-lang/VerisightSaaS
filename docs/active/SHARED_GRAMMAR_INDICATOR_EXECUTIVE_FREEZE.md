# Shared Grammar, Indicator And Executive Freeze

Status: active  
Last updated: 2026-04-22  
Owner-document: dit document is leidend voor portfoliobrede taal-, indicator- en executive freeze zolang er geen expliciete vervanger is.

## Summary

Deze freeze zet een vaste bestuurlijke rail boven de vijf productdraden van Verisight. Doel is niet om alle producten gelijk te trekken, maar om exact te bevriezen wat portfolio-breed identiek moet blijven, wat alleen binnen peer-producten gelijk moet lopen, wat bounded-support routes mogen delen en wat expliciet productspecifiek moet blijven.

Deze freeze gebruikt de hoofdrepo als canonieke bron en trekt geen nieuwe productfamilies open.

## Canonical inputs

Deze freeze bouwt direct voort op:

- `docs/active/PRODUCT_LANGUAGE_CANON.md`
- `docs/active/METRIC_HIERARCHY_CANON.md`
- `docs/active/REPORT_STRUCTURE_CANON.md`
- `docs/active/COMMERCIAL_ARCHITECTURE_CANON.md`
- `docs/active/PRODUCT_LINE_STATUS_BOARD.md`
- `docs/active/PRODUCT_LINE_PARITY_MATRIX.md`
- `docs/ops/SOURCE_OF_TRUTH_CHARTER.md`

## Four canonical layers

### 1. Portfolio-brede shared grammar

Portfolio-breed frozen:

- embedded truth -> shared grammar -> buyer-facing mirror -> interne working labels
- een hoofdmetric per product
- dezelfde executive leesvolgorde: hoofdmetric -> signaallaag -> contextlaag -> eerste managementroute
- dezelfde managementblokken:
  - `managementsamenvatting`
  - `bestuurlijke handoff`
  - `eerste managementvraag`
  - `eerste eigenaar`
  - `eerste stap`
  - `reviewmoment`
- dezelfde report/dashboard-basistaal:
  - `Bestuurlijke handoff`
  - `Kernsignalen in samenhang`
  - `Drivers & prioriteitenbeeld`
  - `Eerste route & managementactie`
  - `Compacte methodiek / leeswijzer`
  - `Technische verantwoording`
- dezelfde trustgrenzen:
  - `groepsniveau`
  - `segmentniveau bij voldoende n`
  - `indicatief`
  - `managementread`
  - `managementsamenvatting`
  - `geen diagnose`
  - `geen predictor`
  - `geen performance-instrument`
  - `geen individuele beoordeling`

### 2. Peer-product shared grammar

Peer-product shared grammar geldt hier primair voor `ExitScan` en `RetentieScan` als kernpeers.

Binnen die kernpeerlaag blijft gelijk:

- volledige executive leeslijn
- formele report-output als paritylat
- dashboard/report-parity
- parallelle executive termen:
  - `hoofdmetric`
  - `kernsignalen`
  - `drivers & prioriteitenbeeld`
  - `eerste route`
  - `eerste eigenaar`
  - `eerste stap`
  - `reviewmoment`

`Onboarding 30-60-90` blijft een peer-context route met eigen lifecycle-vraag. Het product mag dezelfde bestuurlijke discipline houden, maar niet in een core-peer sjabloon worden geduwd.

### 3. Bounded-support shared grammar

`Pulse` en `Leadership Scan` delen alleen bounded-support shared grammar.

Gedeeld binnen deze laag:

- kleinere managementread met eerste eigenaar, eerste stap en bounded reviewmoment
- terugschakelregel naar `bredere duiding` als de vraag te breed wordt
- trusttaal:
  - `bounded`
  - `group-level only`
  - `geen brede diagnose`
  - `geen effectbewijs`
  - `geen route-upgrade via copy`

Niet gedeeld binnen deze laag:

- productidentiteit
- hoofdmetricnaam
- primaire managementvraag
- headline-copy
- formele productzwaarte van de kernroutes

### 4. Productspecifieke indicator- en taallagen

Expliciet productspecifiek:

- `ExitScan`: `Frictiescore`, `vertrekduiding`, `vertrekbeeld`, `hoofdredenen`, `meespelende factoren`, `eerdere signalering`
- `RetentieScan`: `Retentiesignaal`, `behoudsdruk`, `stay-intent`, `vertrekintentie`, `bevlogenheid`, verification-first
- `Onboarding 30-60-90`: `Onboardingsignaal`, `checkpoint`, `checkpoint-richting`, `checkpoint-handoff`
- `Pulse`: `Pulsesignaal`, `reviewroute`, `bounded vergelijking met de vorige vergelijkbare Pulse`, `repeat motion`
- `Leadership Scan`: `Leadershipsignaal`, `managementcontext`, `managementrichting`, `management-handoff`

Productspecifieke summary labels blijven frozen als:

- `Frictiescore`
- `Retentiesignaal`
- `Checkpoint nu`
- `Momentopname nu`
- `Managementrichting`

## Frozen executive rail

Elk product opent met precies een hoofdmetric in gewone bestuurstaal. Daarna volgen:

1. `Hoofdmetric`
2. `Kernsignalen`
3. `Drivers & prioriteiten`
4. `Eerste route`
5. `Eerste eigenaar`
6. `Eerste stap`
7. `Reviewmoment`
8. `Compacte methodiek / leeswijzer`

Productspecifieke handoffvormen blijven expliciet anders:

- `ExitScan`: bestuurlijke handoff
- `RetentieScan`: verification-first handoff
- `Onboarding 30-60-90`: checkpoint-handoff
- `Pulse`: compacte managementhandoff met bounded hercheck
- `Leadership Scan`: management-handoff

Geen product mag meerdere concurrerende hoofd-KPI's openen of een contextmetric als nieuwe headline gaan lezen.

## Public, internal and method boundaries

Publiek:

- productbetekenis
- hoofdmetric
- managementvraag
- handofftaal
- trustgrenzen in gewone taal

Intern:

- `core_proven`
- `parity_build`
- `bounded_support_route`
- `portfolio_route`

Methodisch:

- thresholds
- suppressie
- gewichten
- factorlogica
- appendix
- evidencestatus

Interne maturitylabels blijven verboden in publieke product-, dashboard- of reportcopy.

## Required thread discipline

De vijf productdraden moeten voortaan elke wijziging labelen als:

- portfolio-breed
- peer-product
- bounded support
- productspecifiek

Geen enkele draad mag productnaam, hoofdmetric, handoffvorm of trustgrens hernoemen zonder expliciete update van deze freeze.

Elke draad moet voor closeout bevestigen:

- shared grammar geraakt of niet
- hoofdmetric intact of niet
- trustgrens intact of niet
- executive bloknamen intact of niet
- producteigen taal verscherpt of juist vervlakt

## Required follow-up deltas

Deze freeze is pas bruikbaar voor uitvoering als de vijf verplichte freeze-delta's worden meegelezen:

- `docs/active/EXITSCAN_SHARED_GRAMMAR_FREEZE_DELTA.md`
- `docs/active/RETENTIESCAN_SHARED_GRAMMAR_FREEZE_DELTA.md`
- `docs/active/ONBOARDING_30_60_90_SHARED_GRAMMAR_FREEZE_DELTA.md`
- `docs/active/PULSE_SHARED_GRAMMAR_FREEZE_DELTA.md`
- `docs/active/LEADERSHIP_SCAN_SHARED_GRAMMAR_FREEZE_DELTA.md`

Deze delta's zijn bewust klein. Ze borgen per product:

- terminologie freeze
- hoofdmetric en signaallaag freeze
- executive blokken en handofftaal freeze

## Acceptance

Deze freeze werkt pas echt als:

- de portfolio-brede shared grammar scherp gescheiden blijft van productspecifieke taal
- bounded-support routes niet impliciet worden geupgraded
- peer-producten niet kunstmatig worden afgevlakt
- report-output parity geen cosmetische statusvervanger krijgt
- de vijf productdraden dezelfde executive rail volgen zonder dezelfde productidentiteit te krijgen
