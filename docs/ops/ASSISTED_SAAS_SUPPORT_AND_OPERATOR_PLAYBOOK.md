# Assisted SaaS Support And Operator Playbook

Last updated: 2026-04-26
Status: active

## Purpose

Dit playbook maakt assisted support en operatorwerk herhaalbaar binnen de huidige suite.

Gebruik samen met:

- [CLIENT_ONBOARDING_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_PLAYBOOK.md)
- [CLIENT_OWNERSHIP_AND_FOLLOW_UP_CADENCE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_OWNERSHIP_AND_FOLLOW_UP_CADENCE.md)
- [ACTION_CENTER_OPERATING_MODEL.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/ACTION_CENTER_OPERATING_MODEL.md)
- [ACTION_CENTER_MANAGER_CAPABILITY_CONTRACT_2026-04-26.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/ACTION_CENTER_MANAGER_CAPABILITY_CONTRACT_2026-04-26.md)
- [OPS_DELIVERY_FAILURE_MATRIX.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/OPS_DELIVERY_FAILURE_MATRIX.md)

## Core support rule

Ondersteun altijd eerst de bestaande suite- en lifecyclewaarheid:

- herstel context
- bevestig huidige route en eigenaar
- verifieer toegang
- verifieer lifecyclefase
- pas daarna escaleren of workaround kiezen

## Standard operator loops

### Loop 1 - Provisioning and access

Controleer:

- organization bestaat
- owner bestaat
- org membership klopt
- campaign bestaat
- action center workspace scope klopt

Typische issues:

- verkeerde rol in `org_members`
- manager heeft geen `action_center_workspace_members`
- department scope ontbreekt of matcht niet

### Loop 2 - Activation and first value

Controleer:

- deliveryrecord/checkpoints
- invite- en activationstatus
- klant kan dashboard of Action Center in volgens persona
- first value is daadwerkelijk leesbaar

### Loop 3 - First management use and follow-through

Controleer:

- managementread is gedeeld
- eerste prioriteit is expliciet
- Action Center dossier heeft eigenaar en reviewmoment
- manager-only persona blijft bounded

## Escalation rules

Escaleren naar Verisight admin wanneer:

- organization- of membershiptruth botst
- denied state niet overeenkomt met persona
- campaigncontext ontbreekt
- Action Center scope niet te verklaren is

Escaleren naar klant owner wanneer:

- managerassignment nog geen eigenaar heeft
- department mapping aan klantkant ontbreekt
- first management use nog niet echt heeft plaatsgevonden

## Bounded support promise

Support betekent nu:

- suite toegang herstellen
- activatie en handoff begeleiden
- follow-through bounded maken

Support betekent niet:

- brede HR operations overnemen
- generieke projectcoördinatie doen
- alle managementactie inhoudelijk invullen

## Weekly operator review

Controleer wekelijks:

- open blocked deliveries
- owner-missing dossiers
- denied-state issues
- activation gaps
- overdue reviews

## Output

Elke support- of operatorinterventie moet eindigen met:

- huidige lifecyclefase
- eigenaar
- eerstvolgende stap
- reviewmoment of closeout
