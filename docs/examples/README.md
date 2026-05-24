# Voorbeeldrapporten

Deze map bevat de canonieke voorbeeldrapporten voor de buyer-facing showcase-laag van Loep.

## Buyer-facing active

- `voorbeeldrapport_loep.pdf`
  - Product: ExitScan
  - Gebruik: primaire prooflaag op productpagina, in sales en als deliverable-preview
  - Framing: illustratief voorbeeld met fictieve data in dezelfde managementstructuur als live output

- `voorbeeldrapport_retentiescan.pdf`
  - Product: RetentieScan
  - Gebruik: buyer-facing prooflaag voor expliciete behoudsvragen op groepsniveau
  - Framing: illustratief voorbeeld met fictieve data in dezelfde managementstructuur als live output

Deze actieve pdf's worden ook gespiegeld naar:

- `frontend/public/examples/voorbeeldrapport_loep.pdf`
- `frontend/public/examples/voorbeeldrapport_retentiescan.pdf`

Gebruik die publieke kopieen voor website-showcase en buyer-facing links. Gebruik deze docs-versies als repo-normset en archief van de actieve output.

## Internal demo support

Statuslegend:
- `demo_asset_ready`: toonbaar in begeleide demo of salescontext
- `blueprint_ready`: inhoud en structuur staan vast, maar het artifact is nog geen volledig geautomatiseerde einddeliverable
- `internal_demo_only`: alleen intern of guided gebruiken, niet open buyer-facing
- `guided_sales_demo`: alleen tonen in begeleide sales- of boardcontext

- `frontend/public/segment-deep-dive-preview.png`
  - Ondersteunende visual voor preview en demo
  - Niet gebruiken als primaire prooflaag of als standaarddeliverable voor elke buyer

- `voorbeeldrapport_cultuurbeeld.pdf`
  - Product: Loep Culture Assessment / Loep Cultuurbeeld
  - Gebruik: interne sales-, board- en delivery-demo voor de jaarlijkse baseline
  - Status: `demo_asset_ready` + `guided_sales_demo`
  - Framing: illustratief voorbeeld met fictieve data in dezelfde executive structuur als live output
  - Boundary: blijft internal demo support, docs-side only, niet buyer-facing active of open sample canon; geen benchmarkbewijs en geen manager rankingframing

- `docs/reference/CULTURE_ASSESSMENT_BOARDROOM_DECK.md`
- `docs/reference/CULTURE_ASSESSMENT_EXECUTIVE_ONE_PAGER.md`
- `docs/reference/CULTURE_ASSESSMENT_HR_APPENDIX.md`
- `docs/reference/CULTURE_ASSESSMENT_HR_DEEPENING_HANDOUT.md`
- `docs/reference/CULTURE_ASSESSMENT_MANAGER_CASCADE_HANDOUT.md`
- `docs/reference/CULTURE_ASSESSMENT_BOARD_READ_FACILITATOR_SCRIPT.md`
- `docs/reference/CULTURE_ASSESSMENT_BOARD_READ_AGENDA.md`
- `docs/reference/CULTURE_ASSESSMENT_SAMPLE_INVITE_MAIL.md`
- `docs/reference/CULTURE_ASSESSMENT_WHAT_YOU_RECEIVE.md`
- `docs/reference/CULTURE_ASSESSMENT_DEMO_ENVIRONMENT.md`
  - Samen vormen deze de premium output- en demo-pack voor Loep Cultuurbeeld
  - Alleen voor interne demo, deliveryvoorbereiding en governed salesgebruik
  - De markdown-assets zijn in v1 primair `blueprint_ready` referentie-artefacten; het sample-pdf is het toonbare `demo_asset_ready` hoofdartifact

Interne live-demo's, QA/live-fixtures en validation-sandboxes vallen niet onder deze buyer-facing map. Gebruik daarvoor:

- `docs/reference/DEMO_AND_SAMPLE_ENVIRONMENT_SYSTEM.md`
- `docs/ops/DEMO_ENVIRONMENT_PLAYBOOK.md`
- `manage_demo_environment.py`

## Legacy archive

- `voorbeeldrapport_exitscan_35_fictief.pdf`
- `voorbeeldrapport_retentiescan_35_fictief.pdf`

Gebruik de legacy-bestanden alleen nog als historisch referentiepunt. Ze zijn niet meer leidend voor website, pricing, trust, sales of prompts.

## Governance

- ExitScan blijft de primaire showcase-route.
- RetentieScan blijft complementair en verification-first.
- Loep Cultuurbeeld blijft in deze map internal demo support en is nog geen open buyer-facing sample canon.
- `voorbeeldrapport_cultuurbeeld.pdf` wordt alleen onder `docs/examples/` bewaard en niet gespiegeld naar `frontend/public/examples/`.
- Loep Cultuurbeeld deck-, one-pager- en handout-bestanden zijn in v1 blueprint/demo-artefacten tenzij expliciet anders gelabeld.
- Buyer-facing sample-assets dragen geen vertrouwelijkheidsframing.
- Demo-output mag niet mooier of harder claimen dan het echte product kan dragen.
- Internal sales demo, QA/live-fixtures en validation-sandboxes blijven expliciet gescheiden van deze buyer-facing normset.
- Werk bij wijzigingen in report contracts, preview-copy of buyer-facing routing ook deze normset en de demo-architectuurdocs bij.
