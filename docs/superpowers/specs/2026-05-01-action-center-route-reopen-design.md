# Action Center Route Reopen Design

## 1. Doel
Deze fase maakt Action Center robuust voor het moment waarop een eerder gesloten route later opnieuw relevant wordt.

Dat gebeurt bijvoorbeeld als:
- een thema terugkomt in nieuwe resultaten
- eerdere follow-through toch niet voldoende bleek
- een afdeling later opnieuw aandacht vraagt na een bestuurlijk gesloten traject

Het doel is:
- opnieuw opvolgen mogelijk maken
- zonder dat oude en nieuwe trajecten semantisch door elkaar gaan lopen

## 2. Productgrens
Wel in scope:
- expliciet vervolg na een gesloten route
- heldere relatie tussen oud traject en nieuw traject
- overzichtelijke projectie in route-overzicht en detail
- een kleine canonieke relationele laag tussen trajecten

Niet in scope:
- complexe heropen-workflows
- routebomen of multi-parent lineage
- automatische heropening zonder expliciet besluit
- brede governance- of escalatielagen

## 3. Kernkeuze
Een gesloten route mag niet stilletjes weer open springen.

Er zijn twee expliciete opties:
- `heropen bestaand traject`
- `start vervolgroute`

### Heropen bestaand traject
Gebruik je als:
- hetzelfde lokale opvolgpad echt doorloopt
- het eerdere closeout-besluit feitelijk wordt teruggenomen
- de bestaande route nog steeds het juiste verhaal draagt

### Start vervolgroute
Gebruik je als:
- er opnieuw aandacht nodig is
- maar op basis van een nieuw moment, nieuwe duiding of nieuwe lokale context
- het eerdere traject historisch dicht en bestuurlijk intact moet blijven

Ontwerpdefault:
- `vervolgroute` is de normale optie
- `heropenen` is de expliciete uitzondering

## 4. Operationeel HR-besliskader
Om drift tussen organisaties te voorkomen krijgt HR een klein, vast besliskader.

Gebruik `heropen bestaand traject` alleen als alle drie waar zijn:
- de eerdere closeout was recent en blijkt achteraf te vroeg
- hetzelfde lokale opvolgpad en dezelfde bestuurlijke vraag lopen inhoudelijk door
- de bestaande routehistorie is nog steeds het juiste kader voor nieuwe opvolging

Gebruik in alle andere gevallen `start vervolgroute`.

Dus als een van deze signalen optreedt, kies je canoniek voor vervolgroute:
- er is een nieuw resultaatmoment of nieuwe signaalcontext
- er begint een inhoudelijk nieuw hoofdstuk of nieuwe aanpak
- je wilt een schoon nieuw traject met eigen acties en reviews
- het oude closeout moet bestuurlijk volledig intact blijven als afgerond hoofdstuk

Operationele default:
- bij twijfel `vervolgroute`
- alleen `heropenen` als HR expliciet vaststelt dat het vorige slot wordt teruggedraaid

## 5. Semantiek van Heropenen versus Vervolg
### Heropenen
Betekent:
- dezelfde route opnieuw actief maken
- de eerdere closeout niet wissen maar historisch contextualiseren
- historie als een doorlopende lijn blijven lezen

Heropenen past vooral bij:
- een heel recente closeout
- nieuwe informatie die direct laat zien dat afsluiting te vroeg was
- een bestaande interventielijn die gewoon verder moet

### Vervolgroute
Betekent:
- oude route blijft gesloten
- nieuwe route krijgt eigen identiteit
- nieuwe acties en reviews hangen niet aan de oude route
- er is wel een expliciete link terug naar het vorige traject

Vervolgroute past vooral bij:
- een nieuw hoofdstuk
- nieuwe signalen of nieuwe context
- bestuurlijke behoefte om oud slot betekenisvol te houden

## 6. Canonieke Truth-Keuze
Deze fase kiest expliciet voor twee verschillende canonieke modellen.

### A. Reopen truth is een route-event
Heropening wordt niet als route-relatie gemodelleerd.

Daarvoor komt een kleine canonieke reopen-eventlaag met minimaal:
- `routeId`
- `reopenedAt`
- `reopenedByRole`
- `reopenReason`

Betekenis:
- dezelfde route was gesloten
- hetzelfde traject is daarna expliciet opnieuw actief gemaakt

### B. Follow-up truth is een route-relatie
Vervolgroute blijft wel een relationeel model.

Daarvoor komt een kleine canonieke relationele laag met minimaal:
- `routeRelationType`
- `sourceRouteId`
- `targetRouteId`
- `recordedAt`
- `recordedByRole`

### routeRelationType
In deze fase is de set bewust enkel:
- `follow-up-from`

Dus:
- `reopened-from` bestaat niet meer als relationeel type
- heropenen en vervolgroute hebben ieder hun eigen expliciete truth-model

### sourceRouteId
De eerdere gesloten route.

### targetRouteId
De nieuwe vervolgroute.

### recordedAt
Wanneer deze vervolgstap bestuurlijk is vastgelegd.

### recordedByRole
Minimaal:
- `hr`

Later eventueel `system`, maar nog niet leidend in deze fase.

Belangrijke begrenzing:
- een directe bronrelatie is genoeg
- geen diepe grafstructuren in deze eerste versie

## 7. Gedrag van Heropenen en Vervolg
### Bij heropenen
- closeout-record blijft historisch bestaan
- er komt een expliciet reopen-event op dezelfde route
- route-identiteit blijft gelijk
- nieuwe acties en reviews hangen dus aan dezelfde route, maar na het reopen-moment

### Bij vervolgroute
- nieuwe route krijgt nieuwe identiteit
- oude route blijft dicht
- de relationele link vertelt dat de nieuwe route voortkomt uit een eerder traject

## 8. Overzicht en Detail
### Overview
Overview moet vooral richting geven:
- loopt dit traject nu?
- is dit een heropend traject?
- of is dit een vervolg op een eerder gesloten route?

Compacte labels zijn genoeg, zoals:
- `Heropend traject`
- `Vervolg op eerdere route`

Overview moet niet vollopen met relationele details.

### Detail
Detail moet de relatie explicieter tonen in een klein contextblok:
- eerder gesloten op datum
- heropend op datum
- of: vervolg op route X

Daarnaast moeten oude en nieuwe trajecten klikbaar verbonden zijn:
- vanuit de nieuwe route naar de vorige gesloten route
- en vanuit de oude route zichtbaar maken dat er later vervolg ontstond

## 9. Write-Path
Deze fase begint HR-gedragen.

HR of Verisight krijgt de eerste write-path voor:
- `heropen bestaand traject`
- `start vervolgroute`

Managers initiëren dit in deze fase nog niet als primaire actor.

### Heropenen
Write-path mag niet simpelweg:
- closeout verwijderen
- route-status terug open zetten

Maar schrijft:
- een expliciet reopen-event
- waarna de read-path de route weer als actief leest

### Vervolgroute
Write-path schrijft:
- een nieuwe route
- plus een relationele link naar de vorige gesloten route

Niet:
- nieuwe acties aan de oude route hangen
- of de oude route impliciet hergebruiken

## 10. Read-Path en Prioriteit
De read-path krijgt een harde status-derivatie voor routes met closeout- en reopen-historie.

### Canonieke ordering source
Alle statuslezing voor heropende routes wordt bepaald op basis van tijdsvolgorde:
- `closedAt` van het laatst geldige closeout-record
- `reopenedAt` van het laatst geldige reopen-event

In deze fase gaan we uit van:
- hoogstens één actuele closeout-record per route
- nul of meer reopen-events in de historie
- en later eventueel opnieuw een closeout-record dat de route weer sluit

### Canonieke precedence-regel voor dezelfde route
1. als er geen closeout-record is, is de route open en leest de status uit de live actie-aggregatie
2. als er wel een closeout-record is en er is geen later reopen-event, dan is de route gesloten
3. als er wel een closeout-record is en er is een later reopen-event, dan is de route opnieuw actief
4. als er daarna opnieuw een later closeout-record wordt geschreven, dan is de route weer gesloten

Kort gezegd:
- het meest recente bestuurlijke route-event wint
- open of gesloten wordt dus niet door aanwezigheid alleen bepaald, maar door de laatste canonieke tijdsvolgorde

### Projectieregel voor heropende routes
Bij een heropende route:
- actuele status komt uit de live actie-aggregatie
- de vorige closeout blijft zichtbaar als historische context
- het reopen-event toont expliciet dat die eerdere sluiting is teruggedraaid

### Projectieregel voor vervolgroute
Bij een vervolgroute:
- oude route blijft gesloten
- nieuwe route is actief
- de relatie legt de verbinding
- er is geen ambiguïteit over open of gesloten op dezelfde route-id

Geen automatische heropenlogica:
- nooit stilzwijgend
- altijd expliciet via een write-besluit

## 11. Succescriteria
Deze fase is geslaagd als:
- een gesloten route netjes opnieuw opgepakt kan worden
- heropening en vervolgroute duidelijk van elkaar verschillen
- historie bestuurlijk intact blijft
- overview en detail dezelfde relationele waarheid tonen
- gebruikers niet hoeven te raden of iets oud, heropend of nieuw vervolg is

## 12. Ontwerpuitspraak
De juiste default blijft:
- gesloten blijft echt gesloten
- vervolg vraagt een expliciete keuze
- en `vervolgroute` zal meestal gezonder zijn dan pure `heropening`

Dat houdt closeout betekenisvol, vervolg leesbaar en Action Center vrij van verborgen statusmagie.
