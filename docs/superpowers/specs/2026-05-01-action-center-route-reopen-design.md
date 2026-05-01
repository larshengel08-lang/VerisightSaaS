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

Mijn ontwerpdefault:
- `vervolgroute` is de normale optie
- `heropenen` is de expliciete uitzondering

## 4. Semantiek van Heropenen versus Vervolg
### Heropenen
Betekent:
- dezelfde route opnieuw actief maken
- de eerdere closeout niet wissen maar historisch contextualiseren
- historie als één doorlopende lijn blijven lezen

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

## 5. Canonieke Relatie- en Truth-Laag
Gesloten route blijft een echt eindpunt, tenzij er expliciet wordt heropend.

Daarvoor komt een kleine canonieke relationele laag met minimaal:
- `routeRelationType`
- `sourceRouteId`
- `targetRouteId`
- `recordedAt`
- `recordedByRole`

### routeRelationType
Kleine vaste set:
- `reopened-from`
- `follow-up-from`

### sourceRouteId
De eerdere gesloten route.

### targetRouteId
De route die daarna actief wordt.

Bij heropening mag dit dezelfde route-id zijn, maar dan alleen in combinatie met een expliciet reopen-record.

Bij vervolgroute is dit altijd een nieuwe route-id.

### recordedAt
Wanneer deze vervolgstap bestuurlijk is vastgelegd.

### recordedByRole
Minimaal:
- `hr`

Later eventueel `system`, maar nog niet leidend in deze fase.

## 6. Relatiegedrag
### Bij heropenen
- closeout-record wordt niet verwijderd
- er komt een expliciet reopen-event
- de read-path weet daardoor dat het slot is teruggedraaid

### Bij vervolgroute
- nieuwe route krijgt nieuwe identiteit
- oude route blijft dicht
- de relatie vertelt dat deze route voortkomt uit een eerder traject

Belangrijke begrenzing:
- één directe bronrelatie is genoeg
- geen diepe grafstructuren in deze eerste versie

## 7. Overzicht en Detail
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

## 8. Write-Path
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
- een expliciet reopen-event of relationeel record
- waarna de read-path de route weer als actief leest

### Vervolgroute
Write-path schrijft:
- een nieuwe route
- plus een relationele link naar de vorige gesloten route

Niet:
- nieuwe acties aan de oude route hangen
- of de oude route impliciet hergebruiken

## 9. Read-Path en Prioriteit
De read-path bepaalt eerst:
- wat is nu actief
- wat is historisch gesloten
- hoe hangen die twee samen

Prioriteitsregel:
1. actuele route-status bepalen
2. daarna relationele context tonen
3. historische closeout niet wissen, maar contextualiseren

### Bij heropening
- dezelfde route is opnieuw actief
- de oude closeout blijft historisch zichtbaar
- het reopen-event verklaart waarom de route weer loopt

### Bij vervolgroute
- oude route blijft gesloten
- nieuwe route is actief
- de relatie legt de verbinding

Geen automatische heropenlogica:
- nooit stilzwijgend
- altijd expliciet via een write-besluit

## 10. Succescriteria
Deze fase is geslaagd als:
- een gesloten route netjes opnieuw opgepakt kan worden
- heropening en vervolgroute duidelijk van elkaar verschillen
- historie bestuurlijk intact blijft
- overview en detail dezelfde relationele waarheid tonen
- gebruikers niet hoeven te raden of iets oud, heropend of nieuw vervolg is

## 11. Ontwerpuitspraak
De juiste default blijft:
- gesloten blijft echt gesloten
- vervolg vraagt een expliciete keuze
- en `vervolgroute` zal meestal gezonder zijn dan pure `heropening`

Dat houdt closeout betekenisvol, vervolg leesbaar en Action Center vrij van verborgen statusmagie.
