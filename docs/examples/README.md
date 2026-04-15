# Voorbeeldrapporten

Deze map bevat de canonieke voorbeeldrapporten voor de buyer-facing showcase-laag van Verisight.

## Buyer-facing active

- `voorbeeldrapport_verisight.pdf`
  - Product: ExitScan
  - Gebruik: primaire prooflaag op productpagina, in sales en als deliverable-preview
  - Framing: illustratief voorbeeld met fictieve data in dezelfde managementstructuur als live output

- `voorbeeldrapport_retentiescan.pdf`
  - Product: RetentieScan
  - Gebruik: buyer-facing prooflaag voor expliciete behoudsvragen op groepsniveau
  - Framing: illustratief voorbeeld met fictieve data in dezelfde managementstructuur als live output

Deze actieve pdf's worden ook gespiegeld naar:

- `frontend/public/examples/voorbeeldrapport_verisight.pdf`
- `frontend/public/examples/voorbeeldrapport_retentiescan.pdf`

Gebruik die publieke kopieen voor website-showcase en buyer-facing links. Gebruik deze docs-versies als repo-normset en archief van de actieve output.

## Internal demo support

- `frontend/public/segment-deep-dive-preview.png`
  - Ondersteunende visual voor preview en demo
  - Niet gebruiken als primaire prooflaag of als standaarddeliverable voor elke buyer

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
- Buyer-facing sample-assets dragen geen vertrouwelijkheidsframing.
- Demo-output mag niet mooier of harder claimen dan het echte product kan dragen.
- Internal sales demo, QA/live-fixtures en validation-sandboxes blijven expliciet gescheiden van deze buyer-facing normset.
- Werk bij wijzigingen in report contracts, preview-copy of buyer-facing routing ook deze normset, de publieke kopieen en de demo-architectuurdocs bij.
