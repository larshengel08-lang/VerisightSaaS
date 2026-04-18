# WAVE_04_MTO_DELIVERY_AND_INTERNAL_OPERATOR_HARDENING

## Status

- Wave status: green_completed
- Active source of truth: dit document
- Build permission: executed
- Dependency: `WAVE_03_MTO_REPORT_TO_ACTION_AND_ACTION_LOGGING.md` is groen gebleven
- Next allowed wave after green completion: `WAVE_05_MTO_INTERNAL_CLOSEOUT_AND_SUITE_INTEGRATION_GATE.md`

## Title

Hardening van de interne delivery- en operatorlaag voor MTO, zodat preflight, readiness en governance MTO expliciet als hoofdmeting behandelen in plaats van terug te vallen op Exit/Retentie-taal.

## Korte Summary

`WAVE_03` koppelde MTO aan de bounded report-to-action en action-log spine. Wat daarna nog open stond was de interne operatorlaag: autosignalen, governanceblokkades en preflightlabels vielen voor MTO nog deels terug op Exit- of generieke outputtaal. Deze wave hardent alleen die interne bedieningslaag.

Deze wave blijft bewust beperkt:

- wel MTO-specifieke autosignalering voor first value en report/action-log readiness
- wel MTO-specifieke governance- en preflightlabels
- wel gerichte tests voor die operatorcopy
- geen nieuwe workflowlogica
- geen buyer-facing activatie
- geen suitebrede deliveryrefactor

## Scope In

- MTO-specific delivery auto-signal copy
- MTO-specific governance/preflight labels
- tests voor ops-delivery en preflight-gerelateerde taal
- docs-update van deze wave

## Scope Out

- buyer-facing activatie
- nieuwe workflow-engine
- nieuwe persistentielaag
- suitekoppeling buiten interne hardening

## Validation

Fresh validation run for this wave:

- [x] `cmd /c npm test -- --run lib/ops-delivery.test.ts`
- [x] `cmd /c npx tsc --noEmit`

Observed result:

- delivery governance tests groen
- frontend TypeScript compile groen

## Closeout

Deze wave is groen omdat:

- MTO-first-value copy nu expliciet spreekt over een brede hoofdmeting in plaats van Exit/Retentie-fallback
- MTO-report delivery nu expliciet framed wordt als `MTO-read` plus `action-log` vrijgave
- de governance blocker-copy voor report delivery MTO-specifiek is
- de preflight governance-lane nu MTO als `MTO-read en action log` labelt in plaats van generieke outputtaal

## Definition Of Done

- [x] MTO delivery auto-signalen gebruiken geen Exit/Retentie-fallback meer waar MTO expliciet moet zijn
- [x] report/action-log governancecopy is MTO-specifiek
- [x] preflight governance labels herkennen MTO expliciet
- [x] gerichte tests groen
- [x] dit document bijgewerkt met uitkomst en validatie
