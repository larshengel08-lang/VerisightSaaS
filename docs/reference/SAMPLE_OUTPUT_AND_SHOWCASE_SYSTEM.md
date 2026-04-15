# Verisight Sample Output And Showcase System

Intern referentiedocument voor de canonieke sample-output- en showcase-laag van Verisight.
Laatste update: 2026-04-15

## Doel

Dit document legt vast welke sample-assets buyer-facing actief zijn, welke alleen ondersteunend zijn en welke alleen nog als legacy-archief bestaan.

Gebruik het als eerste referentie voor:

- buyer-facing voorbeeldrapporten
- publieke showcase-links op de website
- preview-versus-pdf parity
- sales- en pricing-prooflagen
- trust- en claimsgrenzen rond voorbeeldoutput
- acceptance en refresh-governance

## Source-of-truth volgorde

Gebruik bij spanning deze volgorde:

1. `docs/strategy/STRATEGY.md`
2. `docs/reference/METHODOLOGY.md`
3. `docs/reference/TRUST_AND_CLAIMS_MATRIX.md`
4. `docs/active/BOARDROOM_READINESS_PLAN.md`
5. `docs/active/REPORT_VISUAL_AND_COMMERCIAL_UPLIFT_PLAN.md`
6. `docs/active/SAMPLE_OUTPUT_AND_SHOWCASE_PLAN.md`
7. dit document
8. `frontend/lib/sample-showcase-assets.ts`

## Canonieke asset stack

### Buyer-facing active

- ExitScan voorbeeldrapport
  - Docs-normset: `docs/examples/voorbeeldrapport_verisight.pdf`
  - Publieke mirror: `frontend/public/examples/voorbeeldrapport_verisight.pdf`
  - Gebruik: primaire showcase op de ExitScan-productpagina, in sales en als deliverable-proof in pricing/trust

- RetentieScan voorbeeldrapport
  - Docs-normset: `docs/examples/voorbeeldrapport_retentiescan.pdf`
  - Publieke mirror: `frontend/public/examples/voorbeeldrapport_retentiescan.pdf`
  - Gebruik: productspecifieke showcase wanneer de buyer-vraag expliciet over behoud op groepsniveau gaat

- Portfolio preview
  - Implementatie: `PreviewSlider` met variant `portfolio`
  - Gebruik: teaser op home en producten-overzicht om routekeuze te versnellen

- Productspecifieke previews
  - Implementatie: `PreviewSlider` met variant `exit` en `retention`
  - Gebruik: teaser op productdetailpagina's die doorleidt naar het volledige voorbeeldrapport

### Internal demo support

- `frontend/public/segment-deep-dive-preview.png`
  - Gebruik: ondersteunende visual voor preview of demo
  - Niet gebruiken als primaire prooflaag

### Legacy archive

- `docs/examples/voorbeeldrapport_exitscan_35_fictief.pdf`
- `docs/examples/voorbeeldrapport_retentiescan_35_fictief.pdf`

Deze assets zijn alleen nog bedoeld als historisch referentiepunt en mogen niet meer leidend zijn in prompts, site, sales, pricing of trust.

## Buyer-facing contract

Elke actieve sample-asset volgt deze regels:

- gebruikt fictieve data
- volgt dezelfde managementstructuur als live output
- draagt geen vertrouwelijkheidsframing
- verkoopt geen diagnose, individuele predictor of bewezen causaliteit
- blijft binnen de claimsgrenzen uit de trust- en methodiekdocs

## Routing

- Home en producten-overzicht gebruiken alleen teaser-preview en routekeuze.
- Productdetailpagina's zijn de primaire showcase-ingang voor volledige voorbeeldrapporten.
- Tarieven en vertrouwen gebruiken sample-output alleen ondersteunend als deliverable-proof en trustproof.
- ExitScan blijft de standaard eerste showcase-route.
- RetentieScan blijft complementair en verification-first.

## Generator and refresh governance

- `generate_voorbeeldrapport.py` is de buyer-facing sample-pipeline.
- De generator schrijft actieve output naar zowel `docs/examples` als `frontend/public/examples`.
- Sample-output gebruikt expliciet `sample_output_mode=True` in `backend/report.py`.
- Demo-identiteit blijft vast op `TechBouw B.V.` met slug `techbouw-demo`.

Werk sample-output en showcase bij wanneer:

- report contracts wijzigen
- buyer-facing preview-copy wijzigt
- productrouting of productcopy wijzigt
- trust- of claimsgrenzen wijzigen
- boardroom/reporting-trajecten de voorbeeldlaag raken

## Guardrails

- ExitScan blijft de primaire buyer-facing showcase-route.
- RetentieScan blijft complementair en verification-first.
- Demo-output mag niet rijker ogen dan het echte product.
- Sample-output is deliverable-proof, geen case-proof.
- Legacy-assets mogen geen normbeeld meer verstoren.
