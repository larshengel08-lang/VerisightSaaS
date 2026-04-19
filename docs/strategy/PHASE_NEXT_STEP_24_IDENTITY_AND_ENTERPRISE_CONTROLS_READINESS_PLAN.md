# Phase Next Step 24 - Identity And Enterprise Controls Readiness Plan

## Title

Define when Verisight may later open a bounded identity and enterprise controls track without overstating current auth, admin, governance, or audit capabilities.

## Korte Summary

Na [PHASE_NEXT_STEP_23_BILLING_AND_CHECKOUT_READINESS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_23_BILLING_AND_CHECKOUT_READINESS_PLAN.md) is nu expliciet vastgezet dat billing/checkout nog geen buildspoor opent en dat de huidige assisted suite geen self-serve commerciële laag mag suggereren die nog niet bestaat.

De volgende logische stap is daarom:

- expliciet vastzetten wat `identity and enterprise controls readiness` in de huidige Verisight-realiteit betekent

Niet:

- meteen SSO bouwen
- enterprise audit logging toevoegen “voor later”
- customer role hierarchies openen zonder directe productreden
- admin- en operatorflows herdefiniëren alsof Verisight al een enterprise platform is

De kernkeuze van deze stap is daarom:

- identity en enterprise controls blijven voorlopig readiness-onderwerpen en geen implementatiebesluit
- de huidige auth- en org-realiteit blijft leidend totdat een latere gate echt groen is
- eventuele latere identity-uitbreiding moet klein beginnen en productgedragen zijn
- enterprise controls mogen pas openen als governance-eisen concreet zijn en niet alleen theoretisch wenselijk

Status van deze stap:

- Decision status: complete
- Runtime status: geen live wijziging
- Build status: geen buildwave geopend
- Source of truth voor deze stap: dit document

## Why This Is The Next Step

### 1. The repo already has auth and tenant primitives, but not enterprise identity

De huidige codebase heeft nu al:

- auth-guarding in [middleware.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/middleware.ts)
- organization- en tenantobjecten in [models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- organization secrets en api-key-gebaseerde runtime access
- backend admin token-guarding voor beheereindpunten

Maar nog niet:

- SSO
- customer role matrix
- policy-based access control
- audit logging als first-class control surface
- enterprise-grade governance views

Dat betekent dat de juiste volgende stap nu een readiness-grens is, geen technische uitbreiding.

### 2. The biggest identity risk is pretending the suite is already governed more deeply than it is

De grootste fout zou nu zijn:

- buyer-facing of enterprise-facing suggereren dat Verisight al uitgebreide governance, auditability en identity controls heeft
- customer identitybreedte openen zonder dat delivery, support en org ownership daar al op ingericht zijn

### 3. Enterprise controls need a concrete product reason

Identity en enterprise controls zijn alleen zinvol als ze voortkomen uit echte vragen zoals:

- wie mag wat zien?
- hoe wordt access beheerd over organisaties heen?
- welke handelingen moeten aantoonbaar gelogd worden?
- welke governance-eisen blokkeren verkoop of gebruik?

Niet alleen uit:

- “dit hoort er later vast bij”

### 4. This gate keeps later scale-up sequence clean

Door deze gate nu expliciet te maken, voorkomen we dat:

- billing, identity, audit en enterprise controls door elkaar gaan lopen
- auth- en governancevraagstukken per ongeluk productbeslissingen overschrijven

## Current Implementation Baseline

### 1. Current auth and session baseline

- [x] frontend beschermt dashboard- en authroutes via Supabase-auth in middleware
- [x] login/signup flows bestaan al in de huidige appshell
- [x] sessieverversing loopt via de bestaande middlewarelaag

### 2. Current org and tenant baseline

- [x] `Organization` bestaat als tenantobject
- [x] `OrganizationSecret` bestaat als server-only secretlaag
- [x] runtime access voor campaigns loopt via org secrets / api keys
- [x] org-creatie is nu admin-gedreven en niet self-serve

### 3. Current admin and operator baseline

- [x] backend admin endpoints worden beschermd door `x_admin_token`
- [x] operator ownership bestaat op lead- en deliveryniveau
- [x] beheerflows zijn nu vooral assisted operator surfaces

### 4. Current missing enterprise layers

- [x] geen SSO
- [x] geen expliciet RBAC/ABAC model
- [x] geen audit logging surface
- [x] geen enterprise policy controls
- [x] geen customer-admin governance UI
- [x] geen delegated admin or approval model

## Decision

### 1. Identity And Enterprise Controls Stay In Readiness Mode

Beslissing:

- identity en enterprise controls worden nog niet geopend als implementation track
- eerst moet expliciet vaststaan welke concrete product- en governancebehoefte ze rechtvaardigt

### 2. Current Auth Reality Stays The Truth Until A Later Gate Opens

Beslissing:

- de huidige auth- en orglaag blijft voorlopig leidend:
  - Supabase sessieauth voor de app
  - org secrets voor runtime access
  - admin token voor backend-beheeracties

Niet toegestaan:

- deze setup buyer-facing of enterprise-facing framen alsof dit al een volwaardige enterprise identity stack is

### 3. SSO Is Not The Default Next Step

Beslissing:

- SSO wordt niet automatisch de eerste identity-uitbreiding
- ook een latere identity-subphase moet eerst bewijzen dat:
  - selling of adoption erop vastloopt
  - current auth model niet meer genoeg is
  - de verandering kleiner en veiliger is dan een brede governanceverbouwing

### 4. Enterprise Controls Must Start With Accountability, Not With Checkbox Breadth

Beslissing:

- als enterprise controls later openen, moeten ze eerst gaan over:
  - zichtbaarheid van belangrijke handelingen
  - expliciete ownership
  - beperkte auditability van kritieke acties

Niet meteen over:

- uitgebreide policy engines
- role explosion
- multi-layer approvals
- zware enterprise configuratiepanelen

### 5. Identity Changes May Not Break The Current Assisted Operating Model

Beslissing:

- elke latere identity- of governance-uitbreiding moet de huidige assisted delivery-, support- en operatorwaarheid respecteren
- identity mag niet impliciet self-serve productgedrag introduceren dat bestuurlijk nog niet gekozen is

## Identity / Enterprise Boundaries To Lock

### 1. What The Current Auth Layer Already Supports

Te erkennen als huidige waarheid:

- protected app routes
- authenticated dashboardgebruik
- tenant-scoped org runtime access
- admin-only backend beheeracties

### 2. What The Current Auth Layer Does Not Yet Support

Nog niet te claimen:

- SSO
- role-based enterprise governance
- approval chains
- fine-grained permissioning
- audit-grade traceability

### 3. What A Future First Identity Layer May Support

Toegestane eerste scope, als later vrijgegeven:

- explicietere rol- en ownergrenzen
- beter leesbare admin/operator accountability
- beperkte logging van kritieke beheeracties

### 4. What A Future First Identity Layer May Not Support

Niet toegestane eerste scope:

- brede enterprise IAM
- uitgebreide policy authoring
- external identity provider matrix
- delegated access programmes
- complex multi-role customer admin portals

## Key Changes

- identity en enterprise controls zijn nu bestuurlijk begrensd als readiness-vraag
- huidige auth- en orgrealiteit is expliciet benoemd als voldoende voor nu, maar niet enterprise-breed
- SSO en auditcontrols blijven geblokkeerd zonder concrete productreden
- een latere eerste identitylaag wordt kleiner gehouden dan een volledige governance stack

## Belangrijke Interfaces / Contracts

### 1. Current Auth Contract

Blijft leidend:

- Supabase sessieauth beschermt apptoegang
- `Organization` + `OrganizationSecret` dragen tenant/runtime access
- backend admin acties gebruiken expliciete admin-token bescherming

### 2. Current Governance Contract

Blijft leidend:

- operator ownership en assisted beheer zijn nu belangrijker dan formele enterprise policylaag
- org-creatie en deliverycontrol blijven centraal/assisted

### 3. Future Identity Candidate Contract

Een latere eerste identity/subcontrol-laag mag hoogstens modelleren:

- owner clarity
- beperkte critical-action logging
- small-scope admin accountability

Nog niet:

- SSO build
- enterprise IAM
- broad customer role management
- compliance-heavy control suites

### 4. Enterprise Control Block Contract

Nog expliciet geblokkeerd:

- SSO implementation
- audit platform
- policy engines
- enterprise admin suite
- delegated governance flows

## Primary Reference Surfaces

- [PHASE_NEXT_STEP_22_SCALE_UP_READINESS_GATE_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_22_SCALE_UP_READINESS_GATE_PLAN.md)
- [PHASE_NEXT_STEP_23_BILLING_AND_CHECKOUT_READINESS_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/strategy/PHASE_NEXT_STEP_23_BILLING_AND_CHECKOUT_READINESS_PLAN.md)
- [middleware.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/middleware.ts)
- [models.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/models.py)
- [schemas.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/schemas.py)
- [main.py](/C:/Users/larsh/Desktop/Business/Verisight/backend/main.py)
- [beheer/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/page.tsx)
- [beheer/contact-aanvragen/page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/beheer/contact-aanvragen/page.tsx)

## Testplan

### Product acceptance

- [x] Deze stap verandert geen productaanbod of suitepositionering.
- [x] Identity wordt niet verward met nieuwe productwaarde.
- [x] Assisted operating truth blijft intact.

### Commercial acceptance

- [x] Er wordt geen enterprise claim geopend die de huidige suite niet draagt.
- [x] SSO of governancebreedte wordt niet impliciet verkocht.
- [x] Enterprise readiness blijft afhankelijk van concrete vraag, niet van ambitie.

### Operational acceptance

- [x] Huidige admin/operatorflows blijven de praktische waarheid.
- [x] Deze stap opent nog geen nieuwe beheerlast of governancecomplexiteit.
- [x] Later identitywerk blijft ondergeschikt aan delivery- en supportrealiteit.

### Codebase acceptance

- [x] Dit document sluit aan op de huidige codebase met middleware-auth, org secrets en admin-token guarding.
- [x] Dit document opent nog geen implementation wave.
- [x] Dit document forceert geen premature SSO- of auditarchitectuur.

### Documentation acceptance

- [x] Dit document functioneert als source of truth voor identity and enterprise controls readiness.
- [x] De grens tussen huidige authrealiteit en latere enterprise controls is expliciet.
- [x] De volgende toegestane stap is helder begrensd.

## Assumptions / Defaults

- de huidige auth- en orglaag is voorlopig voldoende voor de assisted suite
- enterprise identity en governance zijn nu pas relevant als concrete verkoop- of operationele eisen daarom vragen
- de eerste zinvolle identity-uitbreiding zou klein en accountability-gericht moeten zijn
- SSO, audit logging en enterprise policy controls verdienen elk later een expliciete rechtvaardiging
- na deze stap hoort niet automatisch een build te volgen, maar eerst de volgende readiness-gate

## Next Allowed Step

De eerstvolgende toegestane stap is:

- `PHASE_NEXT_STEP_25_CONNECTORS_AND_LIFECYCLE_ANALYTICS_READINESS_PLAN.md`

Er is nog geen build permission voor:

- SSO implementation
- audit logging implementation
- enterprise controls implementation
- connectors
- lifecycle analytics
- identity platform refactor
