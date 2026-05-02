# Action Center Pilot Playbook

Last updated: 2026-05-02  
Status: active

## Purpose

Dit playbook beschrijft hoe Verisight Action Center inzet in een echte pilotcontext.

Gebruik dit document wanneer:

- een scanroute klaar is voor expliciete follow-through
- HR en managers moeten worden meegenomen in de bounded routeflow
- support of product wil toetsen of een pilot veilig kan starten

Action Center blijft hierbij:

> de bounded follow-throughlaag na een scan

Niet:

- de eerste commerciële propositie
- een generieke takenapp
- een brede projectsturinglaag

## Positioning in the customer journey

De route is:

1. scan of campaign levert een signaal
2. HR opent een route en wijst een manager toe
3. manager voert de eerstvolgende bounded stap uit
4. review, closeout, reopen of follow-up maken het vervolg bestuurlijk leesbaar

Dus:

- scans leveren de aanleiding
- Action Center levert eigenaarschap, follow-through en terugleesbaarheid

## Lightweight HR onboarding

HR moet voor een pilot minimaal begrijpen:

- wanneer een route hoort te worden geopend
- dat Action Center alleen na scantruth start
- hoe manager-toewijzing werkt
- hoe closeout en follow-up semantisch verschillen
- hoe een gesloten route historisch leesbaar blijft

HR hoeft in deze fase niet te leren:

- brede workflowconfiguratie
- projectboard-achtig taakbeheer
- complexe rapportagebomen

## Lightweight manager explanation

Een manager moet voor een pilot minimaal begrijpen:

- waarom de route bij hem of haar ligt
- dat de route uit scanfollow-through komt
- wat de eerstvolgende bounded stap is
- hoe review werkt in de huidige route
- hoe gesloten, heropende en vervolgde routes gelezen worden

De manageruitleg moet klein blijven:

- geen theorie over het hele model
- wel duidelijkheid over de volgende stap en de bounded betekenis van de route

## Critical pilot support path

De pilotkritieke flow is:

1. HR opent de route
2. manager ziet de open route
3. manager slaat de bedoelde eerste stap of actie op
4. opgeslagen state overleeft reload
5. HR kan later closeout vastleggen
6. HR kan desgewenst vervolg starten
7. lineage blijft leesbaar voor HR en manager

Support moet deze flow kunnen:

- herhalen
- controleren
- uitleggen
- en bij storing stap voor stap nalopen

## Internal ownership

Voor een eerste pilot is minimaal nodig:

- product/engineering bewaakt route- en write-truth
- operations bewaakt rollout, verificatie en health evidence
- pilotowner bewaakt HR-context, manageruitleg en escalaties

## Before-pilot check

Voer voor een echte pilot minimaal uit:

- health review openen
- kritieke Action Center telemetry checken
- pilot readiness checklist nalopen
- HR-routeflow browsermatig nalopen
- manager-read/action flow browsermatig nalopen
- bevestigen dat support het recoverypad kent

## During-pilot cadence

Toets minimaal wekelijks:

- open routes zonder duidelijke voortgang
- reviewdruk
- closeouts
- vervolg- of reopengebruik
- eventuele authority- of rolloutissues

Gebruik hiervoor:

- de Action Center health surface
- de bounded readback in Action Center zelf
- de pilot readiness checklist als vaste referentie
