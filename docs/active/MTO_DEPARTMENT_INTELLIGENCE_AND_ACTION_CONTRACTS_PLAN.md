# MTO_DEPARTMENT_INTELLIGENCE_AND_ACTION_CONTRACTS_PLAN.md

## Status

- Plan status: completed
- Active source of truth: dit document
- Build permission: closed_after_wave_04_gate
- Dependency: `WAVE_05_MTO_MAINLINE_TRANSITION_GATE_CLOSEOUT.md` blijft de vorige MTO-closeoutbasis
- Next allowed step: expliciete nieuwe track voor suitebrede action-engine of productspecifieke adapters

## Summary

Dit document opent de volgende veilige MTO-fase na de post-foundation closeout.

De kernregel is:

- eerst MTO-specifieke inzichtdiepte
- daarna pas de contracten onder een toekomstige gedeelde actielaag
- pas daarna, en alleen bij bewezen isolatie, een gesloten verbetercyclus
- suitebrede koppeling blijft een aparte gate

Deze hele fase blijft volledig in de aparte bestaande MTO-worktree. Bestaande `ExitScan`, `RetentieScan` en andere routes mogen in deze fase niet geraakt worden in survey-opzet, methodiek, scoring, meetcontract of huidig dashboardgedrag.

## Why This Phase Exists

De huidige MTO-track kan al:

- een brede hoofdmeting openen
- een eerste managementread tonen
- bounded report-to-action taal gebruiken

Maar MTO kan nog niet:

- veilige uitkomsten per afdeling openen
- afdelingsprioriteiten laten landen in een bounded managementroute
- een contract-first basis leggen voor een latere gedeelde dashboardbrede actielaag

Deze fase opent daarom niet meteen een suitebrede action engine. Ze opent eerst:

- een zwaardere MTO department intelligence-laag
- daarna shared action contracts only
- daarna een MTO-first closed improvement loop
- daarna een aparte future suite integration gate

## Scope In

- rijkere MTO-hoofdread met afdelingsuitsplitsing
- veilige suppressie- en privacylogica voor afdeling
- MTO-specifieke managementduiding per afdeling
- contract-first ontwerp en implementatie van een toekomstige gedeelde actielaag
- bounded MTO-first actie-opvolging bovenop die contracten
- expliciete suite integration gate voor latere koppeling van andere producten

## Scope Out

- wijzigingen aan surveyvragen, scoring of methodiek van bestaande scans
- wijzigingen aan bestaande dashboardflow van niet-MTO routes
- volledige shared engine implementeren in fase C
- automatische koppeling van ExitScan of RetentieScan aan de nieuwe actielaag
- default-routeverschuiving of mainline transition

## Phase Sequence

### Fase A

Open strategy, system/data boundaries en wave stack.

### Fase B

Open `WAVE_01_MTO_DEPARTMENT_INTELLIGENCE.md` als sterkste eerste bouwlaag.

### Fase C

Open `WAVE_02_SHARED_ACTION_CONTRACTS.md` voor:

- data boundary
- rechtenmodel
- lifecycle contract
- traceability contract

Nog niet meteen volledige shared engine implementeren.

### Fase D

Open `WAVE_03_MTO_CLOSED_IMPROVEMENT_LOOP.md` alleen als fase C bewezen geïsoleerd is.

### Fase E

Houd `WAVE_04_FUTURE_SUITE_INTEGRATION_GATE.md` als aparte gate.

## Acceptance

- [x] aparte bestaande MTO-worktree blijft de enige uitvoerlocatie
- [x] MTO-specifieke inzichtdiepte is expliciet de eerste bouwlaag
- [x] shared action contracts only is expliciet contract-first en niet engine-first
- [x] closed improvement loop opent pas na bewezen isolatie
- [x] future suite integration gate blijft expliciet apart

## Completion Notes

- Wave 01 is groen: MTO department intelligence staat live binnen de MTO-dashboardroute.
- Wave 02 is groen: de shared action contracts staan als geisoleerde types, schema, policies en APIs.
- Wave 03 is groen: de bounded MTO closed improvement loop hangt nu alleen achter de MTO-afdelingsread.
- Wave 04 is groen: de future suite integration gate blijft expliciet dicht voor ExitScan, RetentieScan en andere routes.

## Next Allowed Step

Na deze fase mag alleen een expliciete nieuwe track openen voor:

- adapterontwerp per productroute richting de gedeelde actielaag
- suitebrede action center UX
- governance over latere productaansluiting
