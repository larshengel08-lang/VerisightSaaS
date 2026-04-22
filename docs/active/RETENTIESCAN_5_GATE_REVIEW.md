# RETENTIESCAN_5_GATE_REVIEW

Last updated: 2026-04-22  
Status: active  
Source of truth: product language canon, language parity signoff, report structure canon, retention parity signoff and RetentieScan evidence contracts.

## Titel

RetentieScan 5-gate review - Freeze-vorm en evidence-minimum

## Korte samenvatting

Deze review trekt de RetentieScan 5-gate bewust smal. Er worden maar twee besluiten genomen:

- welke freeze-vorm nodig is om RetentieScan architecturaal als expliciet 5 te kunnen behandelen
- welk evidence-minimum nodig is om die 5-markering ook commercieel te kunnen dragen

De uitkomst is duidelijk:

- de huidige compacte parity-lezing is niet hard genoeg als definitieve 5-vorm
- parity, QA en interne consistentie zijn niet genoeg als commercieel 5-bewijs

RetentieScan kan pas expliciet als 5 worden gemarkeerd wanneer zowel de product-specifieke recipe als de echte evidence-minimumset formeel zijn vastgezet.

## Scopegrens

Deze review gaat nadrukkelijk niet over:

- bredere productherpositionering
- route-openingsdebat
- pricing-herbouw
- nieuwe metrics
- extra buyer-facing messaging-werk

## Wat is geaudit

- [PRODUCT_LANGUAGE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PRODUCT_LANGUAGE_CANON.md)
- [LANGUAGE_PARITY_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/LANGUAGE_PARITY_SIGNOFF.md)
- [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/reporting/REPORT_STRUCTURE_CANON.md)
- [RETENTION_PARITY_SIGNOFF.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTION_PARITY_SIGNOFF.md)
- [RETENTION_REPORT_GRAMMAR_PARITY_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTION_REPORT_GRAMMAR_PARITY_REVIEW.md)
- [RETENTIESCAN_V1_1_EVIDENCE_AND_CLAIMS.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTIESCAN_V1_1_EVIDENCE_AND_CLAIMS.md)
- [RETENTIESCAN_V1_1_REAL_DATA_AND_ACCEPTANCE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/RETENTIESCAN_V1_1_REAL_DATA_AND_ACCEPTANCE.md)
- [backend/products/retention/definition.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/definition.py)
- [backend/products/retention/report_content.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/products/retention/report_content.py)
- [frontend/lib/products/retention/dashboard.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/products/retention/dashboard.ts)
- [frontend/lib/report-preview-copy.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/report-preview-copy.ts)

## Belangrijkste bevindingen

- De gedeelde grammar en productspecifieke taal van RetentieScan zijn al voldoende scherp om een formele 5-gate te voeren.
- De echte open vraag zit niet meer in productbetekenis, maar in hardheid:
  - is de definitieve RetentieScan-recipe nu compact-parity of expliciet product-specifiek gefrozen
  - is de evidence-laag sterk genoeg om een expliciete 5-claim te dragen
- De bestaande documenten geven al genoeg richting om die twee besluiten te nemen zonder opnieuw de shared grammar of metriccanon te openen.

## Beslissing 1 - Freeze-vorm

### Oordeel

De freeze-vorm voor een expliciete RetentieScan 5-markering moet de expliciete product-specifieke recipe uit de reporting canon zijn, niet de huidige compactere parity-lezing als eindvorm.

### Waarom dit de juiste freeze-vorm is

- De huidige parity-documenten bewijzen dat RetentieScan inhoudelijk shared-grammar aligned is.
- Diezelfde parity-documenten zeggen ook expliciet dat de compacte huidige runtime-beschrijving geen harde architectuurfreeze is.
- De reporting canon bevat al een RetentieScan target recipe met een vaste hoofdflow. Die is productspecifiek genoeg om RetentieScan niet tot ExitScan-kopie te maken, maar hard genoeg om architecturaal als eindvorm te gelden.

### Definitieve freeze-vorm

RetentieScan wordt voor expliciete 5-markering behandeld als deze vaste recipe:

- `P1 Cover`
- `P2 Respons`
- `P3 Bestuurlijke handoff`
- `P4 Retentiesignaal / groepsduiding`
- `P5 Signalen in samenhang`
- `P6 Drivers & prioriteitenbeeld`
- `P7 Onderliggende laag / explanatory layer`
- `P8 Organisatiefactoren / factor layer`
- `P9 Eerste route & actie`
- `P10 Methodiek / leeswijzer`
- `Appendix B Technische verantwoording`

Conditioneel:

- `Appendix A Segment deep dive`

### Freeze-regel

- De inhoudelijke lagen `respons`, `bestuurlijke handoff` en `retentiesignaal / groepsduiding` mogen in visuele uitvoering compact blijven.
- Die lagen mogen voor een expliciete 5-vorm niet langer architectonisch ambigu blijven.
- De huidige compacte bestuurslaag blijft dus een geldige parity-lezing van de tussenstand, maar niet de definitieve 5-freeze-vorm.

### Wat dit nadrukkelijk niet betekent

- Dit betekent niet dat RetentieScan ExitScan pagina-voor-pagina moet kopieren.
- Dit betekent niet dat shared grammar opnieuw wordt geopend.
- Dit betekent alleen dat de productspecifieke RetentieScan-recipe nu expliciet en hard wordt vastgezet.

## Beslissing 2 - Evidence-minimum

### Oordeel

Het evidence-minimum voor een expliciete RetentieScan 5-markering moet boven parity, QA en interne consistentie uitstijgen en minimaal een gekoppeld `real + real follow-up` pakket bevatten.

### Waarom dit het juiste minimum is

- De bestaande evidence ladder maakt duidelijk dat niveau 1-3 niet genoeg is voor een hardere commerciele status.
- Een expliciete 5-markering is pas geloofwaardig wanneer RetentieScan niet alleen inhoudelijk plausibel en intern consistent is, maar ook eerste pragmatische onderbouwing op groeps- en segmentniveau heeft.
- De bestaande RetentieScan evidence-contracten beschrijven al precies welke echte response- en outcome-lagen daarvoor nodig zijn.

### Evidence-minimum voor expliciete 5-markering

Het minimale pakket bestaat uit twee gekoppelde delen:

- statistische basis op echte data
- pragmatische basis op echte follow-up outcomes

#### 1. Statistische basis

Minimaal nodig:

- provenance expliciet `real`
- minimaal `40` complete RetentieScan-responses
- spreiding over meerdere afdelingen en meerdere role levels
- een geldige statistical validation run op de echte dataset

Mijn lezing uit het bestaande contract is dat de `25`-response vloer voldoende is voor eerste reliability-interpretatie, maar niet hard genoeg als minimale bodem voor een expliciete 5-markering. Voor die markering moet de factorcontrole-vloer van `40` daarom de echte minimumgrens zijn.

#### 2. Pragmatische basis

Minimaal nodig:

- echte response-data
- echte follow-up outcomes
- koppeling via `campaign_id`, `department`, `role_level`, `period_label` en `measurement_date`
- outcomebestand volgens het bestaande follow-up contract
- een geldige pragmatic validation run met `responses-origin real` en `outcomes-origin real`

### Evidence-regel

- `synthetic`, `dummy` en `unknown` tellen niet mee als 5-bewijs
- een groene parity- of acceptatielaag telt niet mee als marktbewijs
- alleen eerste statistische steun zonder echte follow-up outcomes is nog niet genoeg voor expliciete 5-markering

## Gate-oordeel

- Freeze-vorm: `not yet passed as explicit 5`, maar decision-complete genoeg om nu formeel vast te zetten
- Evidence-minimum: `not yet passed as explicit 5`, omdat de vereiste echte pragmatische bewijslaag nog niet aanwezig is
- Einduitkomst: RetentieScan is nog niet expliciet 5-markeerbaar, maar de blokkade is nu scherp teruggebracht tot twee concrete gates:
  - definitieve recipe-freeze
  - echt `real + real follow-up` evidence-pakket

## Beslissingen / canonvoorstellen

- Voor RetentieScan 5-markering geldt de product-specifieke recipe uit de reporting canon als definitieve freeze-vorm.
- De compacte parity-lezing blijft toegestaan als beschrijving van huidige runtime, maar telt niet als finale 5-vorm.
- Voor expliciete 5-markering geldt minimaal:
  - `40` complete real responses
  - meerdere departments en role levels
  - echte follow-up outcomes
  - een geslaagde pragmatic validation run op `real` provenance
- Tot die ondergrens is gehaald, blijft RetentieScan commercieel begrensd tot vroegsignalering, verificatie en prioritering.

## Validatie

- Deze review heropent de shared grammar niet.
- Deze review heropent geen metrics, pricing of route-architectuur buiten de RetentieScan 5-gate.
- De review volgt de bestaande canon- en evidence-documenten en trekt daaruit alleen een expliciet 5-besluit.

## Assumptions / defaults

- De keuze voor `40` complete real responses als minimum voor expliciete 5-markering is een strakkere gating-lezing op basis van het bestaande evidence-contract, niet een nieuw metric- of methodontwerp.
- De keuze voor de expliciete target recipe als freeze-vorm is een governance-besluit, geen implementatiebesluit over visueel ontwerp of rendertechniek.

## Next gate

Formele closeout op twee punten:

- bevestig de expliciete RetentieScan recipe als definitieve freeze-vorm
- bevestig het `real + real follow-up` evidence-pakket als minimale drempel voor een expliciete 5-markering
