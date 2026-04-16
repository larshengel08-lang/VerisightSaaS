# Onboarding Acceptance Checklist

Last updated: 2026-04-15
Status: active

Gebruik deze checklist om te beoordelen of een assisted klantstart niet alleen live kan, maar ook echt bruikbaar is voor eerste managementadoptie.

## Intake and handoff

- [ ] Juiste route gekozen
- [ ] Gewenste timing bevestigd
- [ ] Scanmodus en doelgroep bevestigd
- [ ] Scanperiode expliciet vastgelegd als live vanaf start of bewust retrospectief opgezet
- [ ] Contactpersoon en eerste managementdoel vastgelegd
- [ ] Metadata-verwachting expliciet gemaakt

## Setup and import

- [ ] Organisatie correct aangemaakt
- [ ] Campaign correct aangemaakt
- [ ] Campaigntype en eventuele add-ons bewust gekozen
- [ ] Respondentbestand bruikbaar of gecorrigeerd na preview
- [ ] Verplichte kolommen gecontroleerd tegen de klantaanleverspecificatie
- [ ] `role_level` waar nodig naar de vaste waardelijst gemapt
- [ ] `segment_deep_dive` alleen gebruikt wanneer metadata dit ondersteunt
- [ ] Uitnodigingen verstuurd

### Client input spec check

- [ ] `email` aanwezig in invited flow
- [ ] `.xlsx` of `.csv` aanlevering is schoon en enkelvoudig
- [ ] `department` en `role_level` beoordeeld op bruikbaarheid
- [ ] `exit_month` expliciet meegenomen bij ExitScan Baseline of bewust niet beschikbaar
- [ ] Anonieme links alleen gebruikt als dat vooraf is afgesproken

## Activation and first use

- [ ] Klantaccount geactiveerd
- [ ] Eerste dashboardread mogelijk
- [ ] Eerste rapportuitleg geleverd of ingepland
- [ ] Eerste managementgebruik bevestigd

### Managed V1 route check

- [ ] Klant hoefde organisatie en campaign niet zelf te configureren
- [ ] Verisight heeft import, uitnodigingen en eerste activatie begeleid

## First-value guardrails

- [ ] Onder 5 responses geen onveilige detailweergave beloofd
- [ ] Vanaf 5 responses alleen indicatieve duiding gebruikt
- [ ] Vanaf 10 responses pas stevigere patroonduiding gebruikt

## Adoption signals v1

Praktische signalen zonder zware analytics-stack:

- lead naar actieve campaign
- campaign met respondenten
- eerste klantactivatie
- eerste dashboardbezoek
- eerste rapportdownload
- eerste managementgesprek of opvolging

## Learning capture

- [ ] Learningdossier gestart in `/beheer/klantlearnings`
- [ ] Checkpoint `lead en routehypothese` ingevuld
- [ ] Checkpoint `implementation intake` ingevuld
- [ ] Checkpoint `launch en eerste output` ingevuld zodra responses bruikbaar zijn
- [ ] Checkpoint `eerste managementgebruik` ingevuld na walkthrough of managementread
- [ ] Volgende review of stopreden vastgelegd voor 30-90 dagen follow-up

## Governance

- Eerst plan en docs aanpassen
- Daarna UI, flows en tests aanpassen
- Daarna acceptance-run en checklist opnieuw nalopen
