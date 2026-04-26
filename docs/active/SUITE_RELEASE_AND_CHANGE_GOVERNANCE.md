# SUITE_RELEASE_AND_CHANGE_GOVERNANCE.md

Last updated: 2026-04-26
Status: active
Source of truth: workbook cadence, live product shell, operations track and commercial track.

## 1. Summary

Dit document legt vast wanneer een wijziging product-, ops-, commercial- of governance-impact heeft en welke discipline daarbij hoort.

## 2. Change categories

### Product-only

Wijziging raakt één route of één bounded runtimepad.

Vereist:

- routegerichte verificatie
- productreview

### Suite-impacting

Wijziging raakt:

- shell
- auth
- access
- reports
- Action Center
- shared language

Vereist:

- suite review
- impact op ops/commercial check

### Commercial-impacting

Wijziging raakt:

- siteclaims
- CTA’s
- pricing/packaging
- propositionele waarheid

Vereist:

- bounded claims review
- aansluiting op operations truth

### Governance-impacting

Wijziging raakt:

- product family hierarchy
- packaging rules
- rollout rules
- release discipline

Vereist:

- expliciete governance-update

## 3. Standard discipline

Blijf werken met:

- eigen worktree/branch
- review artefact
- closeout of landing
- workbook update

Nieuwe module- of routeclaims zonder deze cadence zijn niet governance-compliant.

## 4. Trigger examples

- nieuwe manager role change -> suite-impacting
- nieuwe public pricing claim -> commercial-impacting
- nieuwe productlijn als first-buy route -> governance-impacting
- nieuwe report nuance voor één route -> product-only

## 5. Validation

- Sluit aan op de werkwijze die al voor dashboard, Action Center, pilot, commercie en operations is gebruikt.
- Voorkomt dat losse sporen elkaar weer doorkruisen.

## 6. Next step

Gebruik deze discipline als basis voor governance closeout en final assisted SaaS closeout.
