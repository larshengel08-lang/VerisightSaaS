# Seven-Route Suite Hardening Implementation Plan

## Titel

Seven-route suite hardening implementation for the current Verisight live portfolio.

## Korte Summary

Deze hardening-run heeft de huidige live suite weer strak uitgelijnd zonder nieuwe producten, routes, pricinglogica of platformabstracties toe te voegen.

De implementatie hield bewust de `minimal first`-grens aan:

- live contactcontract drift opgelost tussen frontend funnel en backend ingest
- buyer-facing contactcopy gelijkgetrokken met de actuele routewerkelijkheid
- regressies vernieuwd naar de huidige zeven-route suite
- suitekritische gates opnieuw groen bevestigd

De actuele buyer-facing route set blijft:

- `ExitScan`
- `RetentieScan`
- `Combinatie`
- `Pulse`
- `TeamScan`
- `Onboarding 30-60-90`
- `Leadership Scan`

De actuele runtime `scan_type`-set blijft:

- `exit`
- `retention`
- `pulse`
- `team`
- `onboarding`
- `leadership`

Report boundary blijft bewust asymmetrisch:

- `exit -> PDF`
- `retention -> PDF`
- `pulse -> 422`
- `team -> 422`
- `onboarding -> 422`
- `leadership -> 422`

Status:

- Decision status: implemented
- Runtime status: aligned
- QA status: green baseline confirmed
- Source of truth: this document

## Wave 1 — Live Contact And Route Contract Sync

- [x] backend contact intake accepteert nu `leadership`
- [x] buyer-facing contactform noemt nu de actuele route set:
  - `ExitScan`
  - `RetentieScan`
  - `TeamScan`
  - `Onboarding 30-60-90`
  - `Leadership Scan`
  - `Combinatie`
- [x] notificatiepad kent nu buyer-facing labels voor:
  - `Onboarding 30-60-90`
  - `Leadership Scan`
- [x] API-test toegevoegd voor `route_interest=leadership`
- [x] notificatietest toegevoegd voor buyer-facing `Leadership Scan` label

Definition of done:

- [x] `leadership` kan end-to-end door de contactstroom
- [x] frontend funnelcontract en backend schema zijn gelijkgetrokken
- [x] publieke contactcopy vertelt geen kleinere routeset meer dan live staat

Belangrijkste wijzigingen:

- [backend/schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [backend/email.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/email.py)
- [contact-form.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/marketing/contact-form.tsx)
- [test_api_flows.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_api_flows.py)

## Wave 2 — Seven-Route Regression And Boundary Refresh

- [x] portfolio-architectuurtest ververst naar de actuele zeven-route suite
- [x] regressie checkt nu expliciet:
  - zeven live buyer-facing routes
  - zes runtime `scan_type`-producten
  - `Combinatie` blijft route-only
  - `Leadership Scan` blijft live buyer-facing route
- [x] contact-contract regressie kent nu `leadership`
- [x] marketing-flow regressie bewaakt nu ook de publieke contactform copy
- [x] bestaande SEO- en positioning-regressies bevestigd op de huidige suite-realiteit

Definition of done:

- [x] geen regressie verwacht nog de oude pre-Leadership contactsituatie
- [x] suitegrenzen blijven expliciet in tests gecodeerd
- [x] `Leadership Scan` is aanwezig waar hij live is en begrensd waar dat bewust zo hoort

Belangrijkste wijzigingen:

- [test_portfolio_architecture_program.py](/C:/Users/larsh/Desktop/Business/Verisight/tests/test_portfolio_architecture_program.py)
- [marketing-flow.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/marketing-flow.test.ts)
- [seo-conversion.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/seo-conversion.test.ts)

## Wave 3 — Suite Acceptance Baseline And Smoke Closeout

- [x] backend regressies groen
- [x] frontend regressies groen
- [x] `next typegen` groen
- [x] `tsc --noEmit` groen
- [x] `next build` groen
- [x] buyer-facing route smoke groen op de volledige live routeset
- [x] runtime smokegrenzen bevestigd via API-tests, inclusief `leadership -> report 422`

Definition of done:

- [x] de huidige zeven-route suite heeft weer één expliciete groene baseline
- [x] verdere keuzes kunnen nu starten vanuit bekende suitewaarheid
- [x] er was geen nieuwe expansion-wave nodig om de live suite te stabiliseren

## Acceptance Evidence

Uitgevoerde gates:

- [x] `.\.venv\Scripts\python.exe -m pytest tests/test_api_flows.py tests/test_portfolio_architecture_program.py tests/test_pulse_scoring.py tests/test_team_scoring.py tests/test_onboarding_scoring.py tests/test_leadership_scoring.py -q`
  - resultaat: `55 passed`
- [x] `cmd /c npm test`
  - resultaat: `90 passed`
- [x] `cmd /c npx next typegen`
  - resultaat: groen
- [x] `cmd /c npm run build`
  - resultaat: groen
- [x] `cmd /c npx tsc --noEmit`
  - resultaat: groen na build, omdat `.next/types` eerst gegenereerd moest zijn

Buyer-facing smoke:

- [x] `GET / -> 200`
- [x] `GET /producten -> 200`
- [x] `GET /producten/exitscan -> 200`
- [x] `GET /producten/retentiescan -> 200`
- [x] `GET /producten/combinatie -> 200`
- [x] `GET /producten/pulse -> 200`
- [x] `GET /producten/teamscan -> 200`
- [x] `GET /producten/onboarding-30-60-90 -> 200`
- [x] `GET /producten/leadership-scan -> 200`
- [x] `GET /tarieven -> 200`
- [x] `GET /vertrouwen -> 200`

Runtime smokegrenzen bevestigd via bestaande en vernieuwde API-tests:

- [x] `exit -> report 200`
- [x] `retention -> report 200`
- [x] `pulse -> report 422`
- [x] `team -> report 422`
- [x] `onboarding -> report 422`
- [x] `leadership -> report 422`

## Important Interfaces / Contracts

### Backend contact contract

Van:

- `exitscan | retentiescan | teamscan | onboarding | combinatie | nog-onzeker`

Naar:

- `exitscan | retentiescan | teamscan | onboarding | leadership | combinatie | nog-onzeker`

### Runtime scan type contract

Ongewijzigd:

- `exit | retention | pulse | team | onboarding | leadership`

### Buyer-facing route contract

Ongewijzigd:

- `exitscan`
- `retentiescan`
- `combinatie`
- `pulse`
- `teamscan`
- `onboarding-30-60-90`
- `leadership-scan`

### Report support contract

Ongewijzigd:

- alleen `exit` en `retention` leveren PDF
- `pulse`, `team`, `onboarding` en `leadership` blijven bewust `422`

## Assumptions / Defaults

- deze run hield de `minimal first` scope vast
- `Pulse` is bewust niet toegevoegd als backend `route_interest`
- pricing, packaging, productsemantiek en routehierarchie zijn niet gewijzigd
- de `tsc`-gate blijft afhankelijk van gegenereerde `.next/types`, dus de ondersteunde volgorde blijft:
  - `npx next typegen`
  - `npm run build`
  - `npx tsc --noEmit`

## Niet Gedaan

- geen nieuwe productlijn geopend
- geen route-hiërarchie of CTA-defaults commercieel verschoven
- geen billing-, entitlement- of control-plane-uitbreiding toegevoegd
- geen reportpariteit afgedwongen voor follow-on producten
- geen bredere copy-sweep buiten de suitekritische contactlaag

## Next Allowed Step

De volgende expliciete keuze ligt nu buiten deze hardening-run:

- controlled commercialization / scale-up hardening
- verdere suite-consolidatie op operations of support
- of pas later een nieuwe expansion-candidate gate

Nieuwe productexpansie is in deze run niet geopend.
