# WAVE_04_MTO_PORTFOLIO_HIERARCHY_AND_DEFAULT_ROUTE_GOVERNANCE.md

## Status

- Wave status: green_completed
- Active source of truth: dit document
- Build permission: completed
- Dependency: `WAVE_03_MTO_BUYER_FACING_GATED_ACTIVATION.md` moet groen blijven
- Next allowed wave after green completion: `WAVE_05_MTO_MAINLINE_TRANSITION_GATE_CLOSEOUT.md`

## Title

Leg expliciet vast hoe MTO zich nu bestuurlijk verhoudt tot ExitScan, RetentieScan en de rest van de suite, inclusief wat buyer-facing al wél open is en wat rond default-routes of hoofdmodeltransitie nog expliciet dicht blijft.

## Scope In

- portfoliohiërarchie voor de huidige MTO-fase
- allowed versus blocked governance-rules voor buyer-facing MTO
- code- en testcontracten die default-routeverschuiving expliciet blokkeren
- docs-update van deze wave

## Kernregel

- buyer-facing MTO mag open zijn als gated route
- MTO mag nog niet als default-route of nieuwe suitekern worden behandeld
- deze wave moet default-routeverschuiving expliciet blokkeren totdat een latere mainline transition-gate iets anders opent

## Scope Out

- echte default-routewijziging
- deprecatie van bestaande kernproducten
- live hoofdmodelmigratie
- brede marketing- of platformrefactor

## Uitvoering

- expliciete MTO governance-constanten toegevoegd voor activation state, suite role, default state en blocked moves
- actieve wave-documentatie aangevuld met de kernregel dat buyer-facing MTO niet gelijkstaat aan default-openstelling
- regressietests toegevoegd voor governancecontract en docs-koppeling

## Aannames

- buyer-facing `mto` mag nu publiek bestaan zonder dat de kernportfoliohiërarchie meteen wordt herschreven
- default-route- en mainline-transitionbesluiten blijven tot de volgende gate expliciet gesloten
- `ExitScan` en `RetentieScan` blijven operationeel de bestaande kernwaarheid zolang die gate niet opent

## Validatie

- `cmd /c npm test -- --run lib/mto-portfolio-governance.test.ts`
- `cmd /c npx tsc --noEmit`
- `C:\Users\larsh\Desktop\Business\Verisight\.venv\Scripts\python.exe -m pytest tests/test_portfolio_architecture_program.py -k "mto_governance_wave" -q`

## Definition Of Done

- governance maakt expliciet onderscheid tussen buyer-facing gated MTO en default-open MTO
- codecontracten blokkeren premature core replacement
- docs en tests wijzen naar dezelfde bestuurlijke waarheid
