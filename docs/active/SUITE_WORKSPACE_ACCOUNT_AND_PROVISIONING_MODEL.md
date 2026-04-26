# SUITE_WORKSPACE_ACCOUNT_AND_PROVISIONING_MODEL.md

Last updated: 2026-04-26
Status: active
Source of truth: current runtime types, Supabase tables, suite access server and assisted ops contract.

## 1. Summary

Dit document legt vast hoe Verisight klanten, gebruikers en suite-toegang nu volwassen moet modelleren.

De huidige volwassen richting is:

- organization = klant/workspace-grens
- account = auth-identiteit
- org membership = insight- en klantrol
- workspace membership = Action Center-follow-through rol
- campaign = productactivatie binnen die organisatie

## 2. Current canonical objects

### Organization

Gebruik `organizations` als:

- primaire tenantgrens
- primaire klant/workspacegrens
- drager van contactemail, naam en suite-eigenaarschap

### Auth account

Een gebruiker krijgt één auth-account.

Dat account kan:

- Verisight admin zijn
- lid zijn van één of meer organisaties via `org_members`
- bounded Action Center-scope krijgen via `action_center_workspace_members`

### Org membership

`org_members` blijft de canonieke insight- en klantrol:

- `owner`
- `member`
- `viewer`

Deze rol bepaalt:

- insighttoegang
- reporttoegang
- klantverantwoordelijkheid binnen assisted uitvoering

### Action Center workspace membership

`action_center_workspace_members` is de aparte capabilitylaag voor bounded follow-through:

- `hr_owner`
- `hr_member`
- `manager_assignee`

Met scope:

- `org`
- `department`
- `item`

Dit model opent géén insighttoegang.

### Campaign

`campaigns` blijft de operational fulfillment unit per productroute:

- draagt `scan_type`
- draagt `delivery_mode`
- kan `enabled_modules` hebben
- is geen subscription of billing object

## 3. Provisioning flow

### Nieuwe klant

1. Verisight kwalificeert de route
2. Verisight maakt organisatie aan
3. Verisight maakt of koppelt owner-account
4. Verisight maakt eerste campaign(s) aan
5. Verisight zet deliveryrecord en checkpoints klaar
6. klant owner krijgt toegang

### Bestaande klant, nieuwe gebruiker

1. bestaand auth-account koppelen of invite versturen
2. `org_members` rol toekennen
3. indien nodig aparte Action Center-scope toekennen

### Manager-only gebruiker

1. HR owner of Verisight wijst manager toe
2. account bestaat al of wordt via invite geactiveerd
3. alleen `action_center_workspace_members` wordt toegekend
4. geen `org_members` insightrol vereist

## 4. Provisioning principles

- provisioning blijft operator- of owner-governed
- routeactivering gebeurt via campaigns, niet via een planmatrix
- manager-only toegang is capability-based en niet via verborgen UI
- één gebruiker kan meerdere toegangslagen hebben, maar elke laag blijft expliciet

## 5. What is not modeled yet

Nog niet als runtimebasis modelleren:

- subscriptions
- paid seats
- invoice accounts
- tenant plans
- usage quotas
- self-serve workspace creation

## 6. Recommended provisioning checks

Bij elke provisioningstap controleren:

- organization bestaat
- owner-account bestaat of invite is verstuurd
- juiste `org_members` rol staat
- juiste `campaigns` bestaan met correcte `scan_type`
- deliveryrecord/checkpoints bestaan
- Action Center workspace scopes zijn expliciet waar nodig

## 7. Validation

- Sluit aan op `types.ts`, `suite-access.ts` en `workspace-members` assignment API.
- Sluit aan op assisted onboarding en customer ops.
- Introduceert geen billing- of seatwaarheid die de runtime nog niet draagt.

## 8. Next step

Gebruik dit model als basis voor:

- `SO-2` entitlements
- `SO-3` lifecycle en handoffdiscipline
