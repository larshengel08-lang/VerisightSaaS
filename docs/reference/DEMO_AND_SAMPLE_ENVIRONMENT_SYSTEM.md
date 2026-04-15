# Verisight Demo And Sample Environment System

Intern referentiedocument voor de canonieke demo- en sampleomgeving van Verisight.
Laatste update: 2026-04-15

## Doel

Dit document legt vast hoe buyer-facing sample-output, interne sales-demo's, QA/live-fixtures en validation-sandboxes van elkaar gescheiden blijven.

Gebruik het als eerste referentie voor:

- demo-architectuur en laagindeling
- veilige demo-identiteiten
- canonieke scenario's en resetflows
- demo-flow voor sales en onboarding
- claimsgrenzen van demo-assets
- smoke-checks en refresh-governance

## Source-of-truth volgorde

Gebruik bij spanning deze volgorde:

1. `docs/strategy/STRATEGY.md`
2. `docs/active/SAMPLE_OUTPUT_AND_SHOWCASE_PLAN.md`
3. `docs/active/CLIENT_ONBOARDING_AND_ADOPTION_PROGRAM_PLAN.md`
4. `IMPLEMENTATION_READINESS_PROGRAM_PLAN.md`
5. dit document
6. `demo_environment.py`
7. `manage_demo_environment.py`
8. bestaande losse seed-scripts

## Canonieke laagindeling

### 1. Buyer-facing showcase

- Doel: publieke prooflaag voor website, sales en trust
- Canonieke identiteit: `TechBouw B.V.` / `techbouw-demo`
- Actieve assets:
  - `docs/examples/voorbeeldrapport_verisight.pdf`
  - `docs/examples/voorbeeldrapport_retentiescan.pdf`
  - publieke mirrors in `frontend/public/examples`
  - teaser previews op site
- Guardrail:
  - illustratief en fictief
  - geen vertrouwelijkheidsframing
  - geen case-proof
  - niet rijker dan echte productoutput

### 2. Internal sales demo

- Doel: assisted live-demo voor Lars/Verisight tijdens sales, onboarding en vroege klantgesprekken
- Canonieke identiteit: `Verisight Sales Demo` / `verisight-sales-demo`
- Canonieke scenario's:
  - `sales_demo_exit`
  - `sales_demo_retention`
- Guardrail:
  - live dashboard-demo, niet de publieke prooflaag
  - alleen gebruiken na buyer-facing teaser/sample als dat commercieel logischer is
  - ExitScan eerst, RetentieScan alleen bij expliciete behoudsvraag

### 3. QA/live fixture

- Doel: functionele checks op live flow, reminders, archive, tokens en dashboardstates
- Canonieke scenario's:
  - `qa_exit_live_test`
  - `qa_retention_demo`
- Guardrail:
  - fixture voor productcontrole
  - niet standaard inzetten als commerciële demo

### 4. Validation sandbox

- Doel: lokale dummy- en validation-workflows voor RetentieScan-validatie
- Canoniek scenario:
  - `validation_retention_pilot`
- Guardrail:
  - methodische sandbox
  - geen salesdemo
  - geen buyer-facing asset

## Canonieke scenario's

| Scenario | Laag | Org/Pad | Primair gebruik |
| --- | --- | --- | --- |
| `sales_demo_exit` | Internal sales demo | `verisight-sales-demo` | ExitScan live laten zien met empty, early, indicative, decision-ready en closed states |
| `sales_demo_retention` | Internal sales demo | `verisight-sales-demo` | RetentieScan trend en verification-first uitleg laten zien |
| `qa_exit_live_test` | QA/live fixture | `exitscan-live-test` | tokens, access, archive en action-safe checks |
| `qa_retention_demo` | QA/live fixture | `bakker-partners-demo` | RetentieScan demo/trend en metadata checks |
| `validation_retention_pilot` | Validation sandbox | `data/retention_pilot_dummy.db` | lokale dummy validatie en follow-up datasets |

## Verwachte campaign states

### ExitScan internal sales demo

- Empty
- Early signal
- Indicative
- Decision ready
- Closed archive

### RetentieScan internal sales demo

- Indicative
- Trend baseline
- Trend follow-up

### Drempels

- Eerste veilige detailweergave vanaf `5` responses
- Steviger patroonbeeld vanaf `10` responses

Gebruik deze drempels ook in demo-uitleg. Laat geen scenario rijkere patroonclaims of segmentclaims suggereren dan het echte product draagt.

## Seed- en resetcontract

- Gebruik `manage_demo_environment.py` als canonieke orchestrator.
- Buyer-facing sample-output blijft apart via `generate_voorbeeldrapport.py`.
- Internal sales demo reseedt alleen zijn eigen named campaigns binnen `verisight-sales-demo`.
- QA/live-fixtures behouden hun eigen org en resetlogica.
- Validation-sandbox blijft lokaal en bestand-gebaseerd.

## Veilige demo-identiteiten

- Gebruik alleen fictieve organisaties.
- Gebruik alleen veilige demo-maildomeinen zoals `@demo.verisight.local` voor seeded respondents.
- Gebruik geen echte klantnamen, werkmails of half-echte imports.
- Houd buyer-facing sample-identiteit en internal sales demo-identiteit bewust gescheiden.

## Demo-flow

- Start standaard met ExitScan.
- Gebruik buyer-facing sample-output als eerste prooflaag wanneer een buyer nog oriënteert.
- Gebruik internal sales demo wanneer live dashboardcontext of campaignstatus helpt.
- Gebruik RetentieScan pas als de vraag expliciet over behoud op groepsniveau gaat.
- Gebruik QA-fixtures en validation-sandboxes nooit als publieke prooflaag.

## Refresh governance

Werk deze laag bij wanneer:

- report contracts wijzigen
- buyer-facing sample-output wijzigt
- demo-scenario's nieuwe campaign states nodig hebben
- website-showcase of demo-flow wijzigt
- prompt- of checklistsluiting verouderd raakt

## Belangrijke commands

- `python manage_demo_environment.py list`
- `python manage_demo_environment.py run sales_demo_exit`
- `python manage_demo_environment.py run sales_demo_retention`
- `python manage_demo_environment.py run qa_exit_live_test`
- `python manage_demo_environment.py run qa_retention_demo`
- `python manage_demo_environment.py run validation_retention_pilot`
