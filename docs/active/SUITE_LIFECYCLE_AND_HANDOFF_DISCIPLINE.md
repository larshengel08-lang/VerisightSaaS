# SUITE_LIFECYCLE_AND_HANDOFF_DISCIPLINE.md

Last updated: 2026-04-26
Status: active
Source of truth: delivery records, onboarding flow, ownership cadence, Action Center operating model and live suite shell.

## 1. Summary

Dit document definieert één canonieke lifecycle voor Verisight als assisted suite.

De vaste flow is:

1. lead captured
2. route qualified
3. organization ready
4. campaign setup in progress
5. import cleared
6. invites live
7. client activation pending/confirmed
8. first value
9. first management use
10. Action Center follow-through
11. next route / renewal / closeout

## 2. State model

### Lead captured

- eigenaar: Verisight sales / founder
- output: contactrequest met routevraag en handoffpotentieel

### Route qualified

- eigenaar: Verisight
- output: expliciete first-buy route

### Organization ready

- eigenaar: Verisight
- output: organisatie + owner-account + startinrichting

### Campaign setup in progress

- eigenaar: Verisight operator
- output: campaign, deliveryrecord, checkpoints

### Import cleared

- eigenaar: Verisight operator met klantinput
- output: bruikbaar respondentbestand

### Invites live

- eigenaar: Verisight / assisted launch
- output: survey staat echt open

### Client activation pending / confirmed

- eigenaar: klant owner + Verisight
- output: klant kan de suite in

### First value

- eigenaar: gedeeld
- output: eerste leesbare dashboard- en rapportwaarde

### First management use

- eigenaar: klant owner / management
- output: eerste managementread en eerste prioriteitsbesluit

### Action Center follow-through

- eigenaar: klant owner + eventuele manager assignees
- output: eigenaar, eerste stap, reviewmoment, vervolg of closeout

### Next route / renewal / closeout

- eigenaar: klant owner + Verisight
- output: bounded vervolgroute, verlenging of expliciete afronding

## 3. Handoff discipline

Elke overgang moet expliciet zijn op deze punten:

- huidige eigenaar
- volgende eigenaar
- volgende stap
- reviewmoment
- blocked status of ontbrekende input

Geen stille sprongen tussen:

- rapport en management use
- management use en Action Center
- Action Center en closeout

## 4. Exceptions

Minimaal expliciet markeren:

- awaiting client input
- operator recovery
- blocked delivery
- denied access
- review overdue
- decision pending

## 5. Relationship to modules

- dashboard ondersteunt first value en first management use
- report ondersteunt handoff en managementread
- Action Center ondersteunt follow-through na managementuse

## 6. Validation

- Sluit aan op bestaande checkpoints, ownership docs en Action Center operating model.
- Houdt baseline/live en meerdere productlijnen binnen dezelfde lifecyclelogica.
- Maakt geen nieuwe automationclaims.

## 7. Next step

Gebruik dit als basis voor:

- `SO-4` support- en operator playbooks
- `SO-5` health review
