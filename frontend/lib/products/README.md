# Frontend Product Modules

Deze map scheidt productspecifieke frontendlogica van gedeelde dashboard- en registrylogica.

## Indeling

- `exit/`
  bevat alleen ExitScan-definities en view logic
- `retention/`
  bevat alleen RetentieScan-definities en view logic
- `shared/`
  bevat alleen gedeelde types en productregistry

## Wat hoort in `exit/`

- ExitScan-definities
- exit dashboard adapter
- exit focusvragen
- exit-specifieke labels en duiding

## Wat hoort in `retention/`

- RetentieScan-definities
- retention dashboard adapter
- retention focusvragen
- retention-specifieke labels en duiding

## Wat hoort in `shared/`

- productregistry
- types/interfaces
- generieke helpers zonder productspecifieke copy

## Harde regels

1. Nieuwe productspecifieke dashboardtekst hoort niet in gedeelde page-components.
2. Nieuwe KPI-config voor één product hoort in de betreffende productmap.
3. `shared/` mag geen ExitScan- of RetentieScan-copy bevatten.
4. Gedeelde pages mogen routeren, maar niet de productspecifieke businessduiding bevatten.

## Routering

Frontend productkeuze loopt via:

- [shared/registry.ts](C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\products\shared\registry.ts:1)

De campaign page en andere shared UI kiezen op basis van `scanType` de juiste productmodule.
