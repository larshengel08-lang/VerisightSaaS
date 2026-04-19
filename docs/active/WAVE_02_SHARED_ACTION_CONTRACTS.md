# WAVE_02_SHARED_ACTION_CONTRACTS.md

## Status

- Wave status: completed_green
- Active source of truth after opening: dit document
- Build permission: closed
- Dependency: `WAVE_01_MTO_DEPARTMENT_INTELLIGENCE.md` moet groen zijn
- Next allowed step after green completion: `WAVE_03_MTO_CLOSED_IMPROVEMENT_LOOP.md`

## Goal

Open alleen de veilige contracten voor een latere gedeelde actielaag:

- data boundary
- rechtenmodel
- lifecycle contract
- traceability contract

## Guardrails

- nog geen volledige shared engine implementeren
- nog geen volledige action center UX
- nog geen automatische koppeling van ExitScan of RetentieScan
- nog geen brede workflowrefactor

## Completion Evidence

- Geisoleerde data boundary staat nu in nieuwe management action-tabellen.
- Rights model, lifecycle contract en traceability contract zijn als types, policies en APIs vastgelegd.
- De contractlaag is productagnostisch genoeg voor later hergebruik, maar nog niet suitebreed geactiveerd.
- ExitScan, RetentieScan en andere scanmethodieken zijn onaangetast gebleven.
