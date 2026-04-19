# WAVE_01_MTO_DEPARTMENT_INTELLIGENCE.md

## Status

- Wave status: completed_green
- Active source of truth: dit document
- Build permission: closed
- Dependency: `MTO_DEPARTMENT_INTELLIGENCE_AND_ACTION_CONTRACTS_WAVE_STACK_PLAN.md` moet groen blijven
- Next allowed step after green completion: `WAVE_02_SHARED_ACTION_CONTRACTS.md`

## Goal

Open de sterkste eerste bouwlaag zonder shared-platformrisico:

- rijker MTO-hoofdscherm
- veilige afdelingsread
- afdelingsdetail voor HR en manager
- suppressie- en privacylogica
- MTO-specifieke managementduiding per afdeling
- productspecifieke handoff naar actiebehoefte, nog zonder volledige shared engine

## Guardrails

- geen generieke segment explorer
- geen wijziging aan andere producten
- geen suitebrede actie-implementatie
- geen methodische wijziging buiten MTO

## Completion Evidence

- MTO toont nu een rijker hoofdscherm met een veilige afdelingsread.
- Alleen afdelingen boven de suppressiedrempel openen als aparte read.
- HR en managers krijgen bounded MTO-duiding per afdeling, zonder generieke segment explorer.
- Bestaande scans en dashboards buiten MTO zijn niet aangepast.
