# WAVE_01_MTO_SUITE_INTEGRATION_BASELINE.md

## Status

- Wave status: green_completed
- Active source of truth: dit document
- Build permission: completed
- Dependency: `MTO_POST_FOUNDATION_INTEGRATION_AND_ACTIVATION_WAVE_STACK_PLAN.md` moet groen blijven
- Next allowed wave after green completion: `WAVE_02_MTO_INTERNAL_INTAKE_AND_COMMERCIAL_READINESS.md`

## Title

Koppel MTO bounded aan de bestaande suite-, intake- en portfolio-oppervlakken, maar houd MTO nog uit publieke routekeuze en buyer-facing productactivatie.

## Scope In

- internal-only MTO qualification en routebevestiging
- admin- en learning-spine MTO-ready maken
- schema- en regressiecontracten voor interne MTO suitekoppeling
- docs-update van deze wave

## Scope Out

- publieke MTO-route op contactformulieren of productpagina's
- buyer-facing activatie
- pricing- of CTA-openstelling
- default-route verschuiving

## Uitvoering

- interne MTO routebevestiging geopend via qualification, zonder publieke contactroute-opties of buyer-facing CTA's uit te breiden
- admin-oppervlak bijgewerkt zodat `qualified_route = mto` intern zichtbaar, selecteerbaar en uitlegbaar is
- learning-oppervlakken bijgewerkt zodat MTO als interne route in dossier- en checkpointflows gedragen kan worden
- backend allowlists en schemas verruimd voor interne MTO qualification
- Supabase-contracten bijgewerkt voor `contact_requests.qualified_route` en `pilot_learning_dossiers.route_interest`
- regressietests toegevoegd voor interne MTO routebevestiging en bounded non-commerce gedrag

## Aannames

- WAVE_01 opent MTO alleen als interne assisted qualification- en learningroute
- publieke `route_interest` op de website blijft bewust zonder `mto`
- bounded commerce blijft in deze wave exclusief voor `ExitScan` en `RetentieScan`

## Validatie

- `cmd /c npm test -- --run lib/contact-qualification.test.ts lib/contact-commerce.test.ts`
- `cmd /c npm test -- --run lib/pilot-learning.test.ts`
- `cmd /c npx tsc --noEmit`
- `C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_portfolio_architecture_program.py tests/test_api_flows.py -k "mto or portfolio_contract" -q`
- `C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_api_flows.py -k "contact_request_update" -q`

## Definition Of Done

- interne qualification kan `mto` bevestigen zonder publieke intake-openstelling
- admin- en learning-spines behandelen `MTO` als geldige interne route
- schema- en regressiecontracten bewaken dat MTO wel intern gekoppeld is maar nog niet buyer-facing open staat
