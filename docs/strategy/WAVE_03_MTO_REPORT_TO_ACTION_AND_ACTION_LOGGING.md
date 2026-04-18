# WAVE_03_MTO_REPORT_TO_ACTION_AND_ACTION_LOGGING

## Status

- Wave status: green_completed
- Active source of truth: dit document
- Build permission: executed
- Dependency: `WAVE_02_MTO_MANAGEMENT_READ_AND_DASHBOARD_DEPTH.md` is groen gebleven
- Next allowed wave after green completion: `WAVE_04_MTO_DELIVERY_AND_INTERNAL_OPERATOR_HARDENING.md`

## Title

Open voor MTO een bounded report-to-action en action-log route boven op de bestaande learning spine, zonder nieuwe platformentiteit, PDF-rapport of workflow-engine te introduceren.

## Korte Summary

`WAVE_01` opende MTO technisch als nieuwe hoofdmeting. `WAVE_02` maakte de managementread semantisch scherper. Wat nu nog ontbreekt is de eerste expliciete route van managementread naar vastgelegde managementwaarde, eerste actie en reviewmoment. Deze wave opent dat bounded via de bestaande `pilot_learning_dossiers`-spine.

Deze wave blijft bewust beperkt:

- wel MTO toelaten in de bestaande learning/action-log spine
- wel expliciete MTO report-to-action framing in de UI
- wel vastleggen van eerste managementwaarde, eerste actie en reviewmoment
- geen nieuwe workflow-engine
- geen PDF-report
- geen buyer-facing activatie

## Scope In

- `pilot_learning_dossiers` MTO-ready maken
- MTO-campaigns toelaten in de learning dossier create-flow
- MTO-specific objective signal copy voor eerste managementgebruik
- campaign page copy aanscherpen rond report-to-action en action log
- contracttests en frontend lib-tests voor deze bounded koppeling

## Scope Out

- aparte MTO action-log tabel
- workflow automation
- PDF-rapport
- delivery hardening
- publieke suitekoppeling

## Validation

Fresh validation run for this wave:

- [x] `C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_portfolio_architecture_program.py -q`
- [x] `cmd /c npm test -- --run lib/pilot-learning.test.ts`
- [x] `cmd /c npx tsc --noEmit`

Observed result:

- portfolio contract groen
- pilot-learning frontend tests groen
- frontend TypeScript compile groen

## Closeout

Deze wave is groen omdat:

- MTO nu toegestaan is in `pilot_learning_dossiers`
- de learning dossier create-flow MTO-campaigns kan koppelen zonder typebreuk
- de objective signal copy MTO als brede hoofdmeting en action-logroute herkent
- de campaign utilitylaag MTO nu expliciet als bounded report-to-action/action-log spoor framet
- de workbench een MTO-campaign niet meer automatisch als RetentieScan-route framespace geeft

## Definition Of Done

- [x] MTO is toegestaan in `pilot_learning_dossiers`
- [x] learning dossier create-flow accepteert MTO-campaigns
- [x] MTO report-to-action/action-log copy is zichtbaar in de campaign utilitylaag
- [x] objective signal copy voor MTO ondersteunt eerste managementwaarde en vervolgreview
- [x] tests groen
- [x] dit document bijgewerkt met uitkomst en validatie
