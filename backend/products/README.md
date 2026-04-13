# Backend Product Modules

Deze map scheidt productspecifieke backendlogica van gedeelde platforminfrastructuur.

## Indeling

- `exit/`
  bevat alleen ExitScan-logica
- `retention/`
  bevat alleen RetentieScan-logica
- `shared/`
  bevat alleen gedeelde bouwstenen en registry-logica

## Wat hoort in `exit/`

- exit survey-definitie
- exit scoring
- exit rapportinhoud
- exit aanbevelingen en interpretatie

## Wat hoort in `retention/`

- retention survey-definitie
- retention scoring
- retention signal profile
- retention rapportinhoud
- retention aanbevelingen en interpretatie

## Wat hoort in `shared/`

- productregistry
- gedeelde SDT-bouwstenen
- gedeelde organisatiefactor-bouwstenen
- gedeelde types of utilities zonder productspecifieke copy

## Harde regels

1. Nieuwe productmethodiek hoort nooit in `backend/main.py`.
2. Nieuwe productcopy hoort nooit in `shared/`.
3. Nieuwe gedeelde utility mag alleen naar `shared/` als die echt voor beide producten bruikbaar is.
4. Oude compatibiliteitsbestanden zoals `backend/scoring.py` mogen doorverwijzen, maar zijn niet de plek voor nieuwe productlogica.

## Routering

Productkeuze loopt via:

- [shared/registry.py](C:\Users\larsh\Desktop\Business\Verisight\backend\products\shared\registry.py:1)

De orchestrator routeert op `scan_type` en laat inhoudelijke verwerking over aan de productmodule.
