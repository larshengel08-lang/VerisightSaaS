# Client Customer Owner Activation Contract

Last updated: 2026-04-25
Status: active

## Purpose

Dit document maakt expliciet wat de klant owner in de huidige assisted self-service route werkelijk draagt, wat Verisight blijft dragen en wanneer activatie en eerste managementgebruik echt bevestigd tellen.

Gebruik dit document wanneer:

- een nieuwe klantroute live gaat
- een tweede operator een traject overneemt
- er twijfel ontstaat over wie uitnodigingen, reminders, activatie of de eerste vervolgstap aan klantzijde echt bezit

## Kernregel

Verisight blijft eigenaar van setup, importcontrole, launchdiscipline en bounded delivery.

De klant owner is niet de technische operator van het systeem, maar de expliciete klantvertegenwoordiger die deze vier dingen draagt:

1. deelnemersaanlevering namens de klant
2. bewuste vrijgave van uitnodigingen en reminders aan klantzijde
3. bevestiging dat dashboardtoegang en eerste read echt zijn geland
4. expliciete eerste eigenaar of vervolgstap na de eerste managementread

## Wat de klant owner expliciet moet doen

### Voor launch

- bevestigen dat de juiste doelgroep is gekozen
- bevestigen dat de klantaanlevering compleet genoeg is voor de gekozen route
- weten dat owner-only acties bij deze rol liggen:
  - deelnemers aanleveren
  - uitnodigingen starten
  - reminders versturen
  - uitvoerstatus en vervolgstap bevestigen

### Rond activatie

- bevestigen wie het eerste klantaccount gebruikt
- bevestigen dat de activatiemail bij de juiste persoon is aangekomen
- bevestigen dat de eerste gebruiker in de juiste campaign landt
- na activatie niet blijven hangen in "toegang is verstuurd", maar doorpakken naar eerste read

### Bij eerste managementgebruik

- expliciet maken wat de eerste managementvraag is
- expliciet maken wie de eerste eigenaar wordt
- expliciet maken wat de eerste vervolgstap is
- expliciet maken wanneer het reviewmoment volgt

## Wat Verisight expliciet blijft doen

- routekeuze en implementation intake structureren
- campaign en organisatie opzetten
- importpreview en import-QA bewaken
- launchdatum, communicatiepreview en reminderinstellingen begrensd houden
- dashboard- en rapportread begeleiden
- support en recovery oppakken wanneer activatie of delivery vastloopt

## Wat niet impliciet mag blijven

- "de klant weet wel wie de owner is"
- "de activatiemail is gestuurd dus activatie telt"
- "de eerste read is waarschijnlijk al gebeurd"
- "de vervolgstap volgt later wel"

Zodra een van deze aannames optreedt, moet de operator terug naar expliciete bevestiging in de deliverylaag.

## Canonieke bevestigingen

Activatie telt pas echt bevestigd wanneer:

- de juiste klantgebruiker is uitgenodigd
- accounttoegang actief is
- de juiste campaign zichtbaar is
- een eerste dashboard- of rapportmoment concreet ingepland of direct uitgevoerd is

Eerste managementgebruik telt pas echt bevestigd wanneer:

- dashboard of rapport daadwerkelijk is gebruikt in een managementread
- eerste eigenaar expliciet is vastgelegd
- eerste vraag of eerste actie expliciet is vastgelegd
- een reviewmoment expliciet is vastgelegd

## Recovery-signalen

Gebruik extra opvolging zodra een van deze signalen optreedt:

- activatiemail is verstuurd maar blijft pending
- er is wel toegang, maar nog geen eerste read
- er is wel een first-value moment, maar nog geen first-management-use bevestiging
- er is wel een read, maar geen eigenaar of vervolgstap

## Minimale operatorvragen

Stel in ieder actief traject minimaal deze vragen:

- Wie is aan klantzijde de owner voor uitnodigingen en reminders?
- Wie gebruikt als eerste het dashboard of rapport?
- Wanneer bevestigen we dat activatie echt geland is?
- Welke eerste managementvraag openen we?
- Wie wordt de eerste eigenaar?
- Wanneer reviewen we opnieuw?

## Acceptance

Dit contract werkt pas als:

- een tweede operator zonder extra context kan uitleggen wie aan klantzijde echt owner is
- activatie niet meer alleen als mailmoment wordt gelezen, maar als bevestigde toegang plus eerste read
- eerste managementgebruik niet meer impliciet blijft hangen tussen dashboardread en follow-up
