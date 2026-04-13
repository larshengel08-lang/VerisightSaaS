# RetentieScan v1.1 Validation Workflow

Deze workflow ondersteunt de v1.1-validatiestap voor RetentieScan.

## Wat er nu in de repo zit

- analysecodeboek in `analysis/retention/codebook.py`
- validatielogica in `analysis/retention/validation.py`
- readiness-check:
  - `assess_retention_validation_readiness.py`
- dataset-export:
  - `export_retention_validation_dataset.py`
- validatierun:
  - `run_retention_validation.py`
- pragmatische validatie:
  - `run_retention_pragmatic_validation.py`
- synthetische demodata:
  - `generate_retention_validation_testdata.py`
- end-to-end dummyrun:
  - `simulate_retention_validation_pilot.py`
- templates:
  - `create_retention_validation_templates.py`
  - `data/templates/retentionscan_respondent_import_template.csv`
  - `data/templates/retentionscan_followup_outcomes_template.csv`

## Doel

Met deze tooling kunnen we:

- RetentieScan-responses exporteren
- betrouwbaarheid toetsen met alpha en omega
- een eerste factorcontrole draaien
- constructvaliditeit beoordelen via correlaties
- segmentaggregaties klaarzetten voor pragmatische validatie

## Snelle demo-run

### 1. Genereer synthetische validatiedata

```powershell
C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe `
  C:\Users\larsh\Desktop\Business\Verisight\generate_retention_validation_testdata.py `
  --db-path data/retention_validation_demo.db `
  --responses 180
```

### 2. Draai de validatiesamenvatting

```powershell
C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe `
  C:\Users\larsh\Desktop\Business\Verisight\run_retention_validation.py `
  --db-path data/retention_validation_demo.db `
  --outdir data/retention_validation_report
```

### 3. Exporteer responses, segmenten en codeboek

```powershell
C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe `
  C:\Users\larsh\Desktop\Business\Verisight\export_retention_validation_dataset.py `
  --db-path data/retention_validation_demo.db `
  --outdir data/retention_validation_export
```

### 4. Check of een echte dataset validatie-klaar is

```powershell
C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe `
  C:\Users\larsh\Desktop\Business\Verisight\assess_retention_validation_readiness.py `
  --db-path data/retention_validation_demo.db `
  --outdir data/retention_validation_readiness
```

### 5. Maak of ververs de pilottemplates

```powershell
C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe `
  C:\Users\larsh\Desktop\Business\Verisight\create_retention_validation_templates.py `
  --outdir data/templates
```

### 6. Draai een volledige dummy-pilot

```powershell
C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe `
  C:\Users\larsh\Desktop\Business\Verisight\simulate_retention_validation_pilot.py `
  --db-path data/retention_pilot_dummy.db `
  --responses 72 `
  --outdir data/retention_pilot_dummy_run
```

## Output

De validatierun schrijft:

- `data/retention_validation_report/retention_validation_summary.json`
- `data/retention_validation_report/retention_validation_report.md`

De export schrijft:

- `data/retention_validation_export/retention_validation_responses.csv`
- `data/retention_validation_export/retention_validation_segments.csv`
- `data/retention_validation_export/retention_validation_codebook.json`

De readiness-check schrijft:

- `data/retention_validation_readiness/retention_validation_readiness.json`
- `data/retention_validation_readiness/retention_validation_readiness.md`

De pragmatische validatie schrijft:

- `data/retention_pragmatic_validation/retention_pragmatic_validation.json`
- `data/retention_pragmatic_validation/retention_pragmatic_validation.md`
- `data/retention_pragmatic_validation/retention_pragmatic_joined.csv`

## Wat nog data-afhankelijk openstaat

Deze workflow implementeert de technische basis voor v1.1, maar de volgende stap blijft afhankelijk van echte velddata:

- betrouwbaarheid interpreteren op echte RetentieScan-cases
- factorcontrole beoordelen op echte steekproeven
- pragmatische validatie koppelen aan uitstroom-, verzuim- of herhaalmeetdata
- methodiekclaims aanscherpen op basis van echte resultaten

## Belangrijke grens

Deze workflow maakt RetentieScan methodisch sterker, maar verandert het product niet in een individuele vertrekvoorspeller.
