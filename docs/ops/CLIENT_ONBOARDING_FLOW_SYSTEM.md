# Client Onboarding Flow System

Last updated: 2026-04-18
Status: active

## Purpose

Dit document is het praktische naslagwerk in flowvorm voor klantonboarding binnen Verisight.

Het sluit direct aan op:

- [COMMERCIAL_ARCHITECTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/COMMERCIAL_ARCHITECTURE_CANON.md)
- [CLIENT_ONBOARDING_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_PLAYBOOK.md)
- [REPORT_STRUCTURE_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_STRUCTURE_CANON.md)
- [REPORT_TO_ACTION_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_TO_ACTION_PROGRAM_PLAN.md)

Gebruik dit document als dagelijkse flowlaag voor:

- routekeuze
- intake
- activatie
- first value
- report-to-action
- eerste review

## Flow 1 - Route Selection

### Trigger

- nieuwe klant, nieuwe lead of nieuw intakegesprek

### Vraag die eerst telt

- welke managementvraag moet nu als eerste geopend worden?

### Beslisregels

Kies `ExitScan` als:

- de vraag terugkijkt op vertrek
- patronen in vertrek en werkfrictie centraal staan
- bestuurlijke prioritering rond vertrek nodig is

Kies `RetentieScan` als:

- de vraag over actieve medewerkers en behoud gaat
- vroegsignalering op behoud centraal staat
- verificatie en eerste interventie in actieve populaties nodig zijn

Niet direct openen als eerste route, tenzij expliciet besloten:

- TeamScan
- Onboarding 30-60-90
- Pulse
- Leadership Scan

Gebruik `Combinatie` alleen als:

- beide managementvragen werkelijk tegelijk aan tafel liggen
- en de eerste route alsnog expliciet gekozen wordt

### Output

- gekozen eerste route
- sponsor / contactpersoon
- eerste managementdoel
- verwachte timing

### Handoff

- routekeuze gaat door naar implementation intake

## Flow 2 - Implementation Intake

### Trigger

- eerste route is gekozen

### Verplichte input

- gekozen route
- scanmodus
- scanperiode
- doelgroep
- metadata
- contactpersoon
- eerste managementdoel

### Beslisregels

- baseline versus ritmeroute expliciet vastleggen
- metadata discipline vooraf toetsen
- geen import of activatie zonder minimale inputkwaliteit

### Output

- intake compleet
- setup-instructie compleet
- risico’s of uitzonderingen zichtbaar

### Handoff

- gaat door naar campaign setup en import QA

## Flow 3 - Launch And First Value

### Trigger

- intake compleet
- campaign klaar
- respondentimport gecontroleerd

### Canonieke volgorde

1. campaign setup
2. respondentimport
3. uitnodigingen
4. klantactivatie
5. eerste dashboardread
6. rapportuitleg

### Beslisregels

- geen first-value claim zonder bruikbare responsbasis
- dashboard en rapport moeten dezelfde leeslijn volgen
- klant moet begrijpen:
  - wat al leesbaar is
  - wat nog indicatief is
  - wat de eerste managementvraag wordt

### Output

- eerste managementwaarde zichtbaar
- klant kan inloggen
- juiste campaign zichtbaar
- rapport/dashboards bruikbaar binnen drempels

### Handoff

- gaat door naar eerste managementgesprek

## Flow 4 - Report To Action

### Trigger

- dashboard en/of rapport zijn bruikbaar

### Canonieke leesvolgorde

1. wat speelt nu
2. waarom telt dit
3. wat eerst doen
4. wie is eerste eigenaar
5. welke eerste stap telt
6. wanneer reviewen we opnieuw

### Beslisregels

- rapport blijft managementinput, geen bewijs van oorzaak
- eerste actie moet klein, toetsbaar en eigenaar-gebonden zijn
- reviewmoment direct vastleggen

### Output

- eerste managementgesprek gehad
- eigenaar expliciet
- eerste actie expliciet
- reviewmoment expliciet

### Handoff

- gaat door naar follow-up of bounded vervolgroute

## Flow 5 - Follow-Up And Next Route

### Trigger

- eerste managementactie gekozen of eerste read afgerond

### Logische vervolgvormen

- vervolgmeting
- ritmeroute
- Pulse als compacte review
- TeamScan als lokale verificatie
- Segment deep dive
- extra managementsessie

### Niet automatisch doen

- nieuwe productroute openen zonder expliciete managementvraag
- bounded support route verkopen als nieuwe hoofdroute
- vervolg starten zonder dat first value en first action echt zijn geland

### Output

- expliciete next step
- bounded vervolg of verdieping
- geen productverwarring

## Acceptance

Deze flowlaag werkt pas echt als:

- sales, onboarding en report-to-action dezelfde routevolgorde gebruiken
- jij hiermee een klantgesprek en onboardingspoor kunt sturen zonder opnieuw het verhaal uit te vinden
- een tweede operator hiermee dezelfde kernstappen kan volgen
