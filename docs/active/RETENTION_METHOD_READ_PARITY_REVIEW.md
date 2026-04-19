# RetentieScan Method Read Parity Review

## Titel

`RetentieScan method/read parity review follow-up`

## Korte samenvatting

De method/read follow-up bevestigt dat RetentieScan methodisch stevig genoeg blijft als verification-first groepsinstrument, maar dat vervolgtaal rond herhaalmeting en playbook-ijking scherp beschrijvend moet blijven. Die grens is nu explicieter vastgelegd.

## Wat is geaudit

- `docs/reference/METHODOLOGY.md`
- `backend/products/retention/definition.py`
- `backend/products/retention/report_content.py`
- `backend/products/retention/scoring.py`
- `frontend/lib/products/retention/definition.ts`
- `frontend/lib/report-preview-copy.ts`

## Belangrijkste bevindingen

- De kernclaim van RetentieScan blijft proportioneel: vroegsignalering, verificatiehulp en prioritering op groeps- en segmentniveau.
- De grootste resterende method/read-risico zat in vervolgtaal die te dicht tegen effectlogica aanleunde.
- Trend, herhaalmeting en playbook-ijking zijn waardevol, maar alleen als beschrijvende vervolglagen en niet als interventiebewijs.

## Belangrijkste inconsistenties of risico’s

- `daadwerkelijk verbeteren` suggereert te snel dat herhaalmeting al effect kan bevestigen.
- `wat in de praktijk het meeste effect heeft` legt te veel causale lading op playbook-ijking in deze fase.

## Beslissingen / canonvoorstellen

- RetentieScan repeat- en calibration-taal blijft beschrijvend:
  - `verschuiven`
  - `bevestiging of bijstelling`
  - `werkbaar en scherp`
- Effect- of interventiebewijs blijft buiten scope totdat echte follow-updata en methodische onderbouwing dat dragen.

## Concrete wijzigingen

- `backend/products/retention/definition.py`
- `backend/products/retention/report_content.py`
- `docs/reference/METHODOLOGY.md`

## Validatie

- De aangepaste taal is teruggelegd tegen de bestaande methodgrenzen in `METHODOLOGY.md`.
- Geen wijziging aan runtime-architectuur, scoreformule of ExitScan-boundaries.

## Assumptions / defaults

- Beschrijvende trendtaal is hier toegestaan zolang die geen bewezen interventiewerking of causaliteit claimt.
- Deze review scherpt de claimgrens aan, maar verandert de RetentieScan-productbelofte niet.

## Next gate

`metric inventory refresh`
