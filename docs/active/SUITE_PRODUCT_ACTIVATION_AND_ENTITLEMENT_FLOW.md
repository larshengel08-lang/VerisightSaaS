# SUITE_PRODUCT_ACTIVATION_AND_ENTITLEMENT_FLOW.md

Last updated: 2026-04-26
Status: active
Source of truth: current campaign model, suite access runtime, enabled modules and delivery control.

## 1. Summary

Dit document legt vast hoe productactivatie en module-entitlements in de huidige suite werken.

De huidige waarheid is:

- productactivatie gebeurt via campaigns
- moduletoegang gebeurt via rollen en capabilities
- Action Center is een aparte follow-through entitlementlaag

## 2. Activation model

### Productroute activeren

Een productroute wordt actief zodra:

- een campaign bestaat voor de organisatie
- `scan_type` de route vastlegt
- `delivery_mode` het ritme vastlegt
- deliverycontrol klaarstaat
- de klant owner toegang heeft tot de suite

### Enabled modules

`enabled_modules` blijft de bounded uitbreidingslaag op campaignniveau.

Gebruik dit alleen voor:

- routegebonden extra’s
- bounded add-ons

Gebruik dit niet als:

- planstructuur
- entitlement catalogus voor de hele organisatie

## 3. Entitlement layers

### Layer 1 - Insight entitlements

Insighttoegang volgt uit:

- auth-account
- `org_members`
- bestaande route- en campaigncontext

Geeft toegang tot:

- dashboard
- reports
- campaign detail

### Layer 2 - Action Center entitlements

Action Center-toegang volgt uit:

- `org_members` voor HR/klantrollen
- of `action_center_workspace_members` voor manager-only scope

Geeft toegang tot:

- `/action-center`
- bounded follow-through

Geeft niet automatisch toegang tot:

- `/dashboard`
- `/reports`
- `/campaigns/[id]`

## 4. Practical activation flows

### Nieuwe klant, eerste route

- activeer organization
- activeer eerste campaign
- activeer owner insighttoegang
- activeer Action Center via owner shell

### Zelfde klant, tweede route

- voeg nieuwe campaign toe
- houd organization en accounts gelijk
- gebruik bestaande suite-shell
- laat productlijn-specifieke context toevoegen zonder nieuw tenantmodel

### Manager assignment

- activeert geen productroute
- activeert alleen bounded follow-through

## 5. Guardrails

Niet doen:

- productscope openen zonder campaign
- manager scope gebruiken als insight entitlement
- enabled modules misbruiken als pricing- of planengine
- activation verkopen als self-serve capability

## 6. Validation

- Volgt de huidige campaignstructuur en capabilitylaag.
- Sluit aan op dashboard + reports + Action Center in één shell.
- Introduceert geen fictieve commercial planlaag.

## 7. Next step

Gebruik dit als basis voor:

- `SO-3` lifecycle states en handoffdiscipline
