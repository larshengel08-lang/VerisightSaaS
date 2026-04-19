# MTO_DEPARTMENT_INTELLIGENCE_AND_ACTION_CONTRACTS_SYSTEM_BOUNDARIES_PLAN.md

## Status

- Plan status: completed
- Active source of truth: dit document
- Build permission: closed_after_wave_04_gate
- Dependency: `MTO_DEPARTMENT_INTELLIGENCE_AND_ACTION_CONTRACTS_PLAN.md` moet groen blijven
- Next allowed step: expliciete nieuwe track met aparte suitekoppel-gate

## Boundary Decisions

- De aparte bestaande MTO-worktree blijft verplicht.
- Department blijft de eerste segmentas.
- De conservatieve suppressiedrempel blijft leidend voor afdelingsread en afdelingsacties.
- Bestaande scans blijven methodisch onaangetast.
- Shared action direction is gewenst, maar fase C mag geen volledige shared engine implementeren.

## MTO Insight Boundary

MTO krijgt in deze fase:

- organisatiebrede read
- veilige department intelligence
- MTO-specifieke managementduiding
- bounded handoff naar actiebehoefte

MTO krijgt in fase B nog niet:

- generieke segment explorer
- suitebrede actie-UX
- wijzigingen aan andere scanproducten

## Shared Action Contract Boundary

Fase C opent alleen de veilige ondergrenzen voor een latere productagnostische actielaag:

- data boundary
- rechtenmodel
- lifecycle contract
- traceability contract

De volgende zaken blijven gesloten:

- volledige shared engine implementeren
- automatische productkoppeling buiten MTO
- brede workflowrefactor
- actiecentrum voor de hele suite

## Rights Boundary

- HR ziet organisatiebreed alle MTO-inzichten en alle MTO-acties.
- Managers mogen alleen hun eigen department of toegewezen scope zien en beheren.
- Het toewijzingsmodel blijft hybride:
  - default department-owner mogelijk
  - HR-override per actie mogelijk

## Non-Impact Rules

Deze track mag geen wijzigingen aanbrengen aan:

- surveyvragen van ExitScan, RetentieScan, Pulse, TeamScan, Onboarding of Leadership
- scoring of meetmethode van bestaande scans
- bestaande dashboardcontracten van andere routes
- bestaande routehiërarchie of live defaults

## Evidence Required Before Phase D

Fase C geldt pas als bewezen geïsoleerd wanneer tests aantonen dat:

- contracts gedeeld kunnen worden
- rechten en traceability stabiel zijn
- bestaande scanmethodiek onaangetast blijft
- MTO de enige actieve drager blijft

## Proven Isolation

Deze fase is alleen groen omdat de volgende grenzen aantoonbaar overeind zijn gebleven:

- MTO is de enige route met nieuwe department intelligence-oppervlakken.
- De nieuwe action-loop hangt alleen achter `scan_type = mto`.
- ExitScan, RetentieScan en andere scans hebben geen wijziging gekregen in survey-opzet, methodiek, scoring of dashboardcontract.
- De shared action-laag is nog contract-first en niet suitebreed geactiveerd.

## Next Allowed Step

Na dit document mag alleen een expliciete nieuwe track openen voor:

- productadapters richting de gedeelde actielaag
- suitebrede action center-oppervlakken
- governancetoetsing voor latere productaansluiting
