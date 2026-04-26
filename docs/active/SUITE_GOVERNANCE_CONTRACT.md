# SUITE_GOVERNANCE_CONTRACT.md

Last updated: 2026-04-26
Status: active
Source of truth: current `main` runtime, commercial track closeout, assisted SaaS operations contract, product language canon and Action Center canon.

## 1. Summary

Dit contract legt de bestuurlijke suitewaarheid van Verisight vast.

De huidige governancebasis is:

- één people suite
- meerdere bounded productlijnen
- één gedeelde suite-shell
- twee modulefamilies:
  - insights
  - follow-through
- duidelijke grens tussen wat shared is en wat productgebonden blijft

## 2. What the suite is

De suite is nu:

- een gedeelde omgeving voor dashboard, reports en Action Center
- een portfolio met meerdere routekeuzes binnen dezelfde tenantgrens
- een assisted SaaS-model, niet alleen losse projectlevering

De suite is niet:

- een open productmarktplaats
- een verzameling losgekoppelde mini-apps
- een generiek HR operating system

## 3. Governance layers

### Shared suite layer

Shared en suitebreed bestuurd:

- auth
- organization/workspace boundary
- shell navigation
- access model
- dashboard/report/Action Center samenhang
- lifecycle- en handofflogica

### Product route layer

Productspecifiek en bounded:

- scan type
- metrics
- signal grammar
- report emphasis
- route-first onboarding nuances
- routegebonden vervolglogica

### Follow-through layer

Action Center is shared als productlaag, maar bounded in gebruik:

- follow-through grammar is shared
- carrier contracts blijven productspecifiek
- manager-only access blijft module- en scopegebonden

## 4. Decision rules

Gebruik suite governance wanneer een wijziging raakt aan:

- meerdere productlijnen
- shell, auth of access
- gedeelde commercial truth
- packaging of rollout logic
- shared language over dashboard, reports en Action Center

Gebruik alleen productgovernance wanneer iets uitsluitend raakt aan:

- één route
- één metric family
- één report nuance

## 5. Bounded defaults

- ExitScan en RetentieScan blijven de twee kern-first-buy routes
- Onboarding 30-60-90 blijft bounded peer
- Pulse en Leadership blijven compacte vervolg- of reviewroutes
- Combinatie blijft portfolioroute
- Action Center blijft gedeelde follow-through laag en geen derde first-buy product

## 6. Validation

- Sluit aan op gelande live suite-shell en manager hardening.
- Sluit aan op commerciële track 8 en operations track 9.
- Introduceert geen nieuwe productscope of packagefantasie.

## 7. Next step

Gebruik dit contract als basis voor:

- product family model
- shared language contract
- packaging en rollout logic
- release/change governance
