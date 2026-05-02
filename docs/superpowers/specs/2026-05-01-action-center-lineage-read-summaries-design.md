# Action Center Lineage Read Summaries Design

## 1. Doel
Deze fase maakt routegeschiedenis sneller leesbaar voor zowel HR als manager, zonder extra workflow toe te voegen.

De kern is:
- een route kan een directe voorganger hebben
- een route kan een directe opvolger hebben
- gebruikers moeten dat snel kunnen zien
- zonder dat ze zelf route-IDs, relationele records of oude detailcontext hoeven te reconstrueren

Dus:
`lineage/read summaries` gaat niet over nieuwe truth, maar over een betere lezing van truth die al bestaat.

## 2. Productgrens
Wel in scope:
- gedeelde lineage-samenvatting voor HR en manager
- maximaal een stap terug
- maximaal een stap vooruit
- compacte relationele context in overview en detail
- onderscheid tussen:
  - `Heropend traject`
  - `Vervolg op eerdere route`
  - `Later opgevolgd`

Niet in scope:
- volledige trajectketens
- meergeneratie-lineage
- extra statussamenvattingen van buurtroutes
- nieuwe workflowknoppen
- dossierachtige tijdlijnen

Dus:
kleine leeslaag, geen nieuwe proceslaag.

## 3. Canonieke Lineage-Lezingen
Deze fase projecteert precies drie relationele lezingen.

### 3.1 Heropend traject
Gebruik je wanneer:
- dit dezelfde route is
- die na eerdere afsluiting opnieuw actief werd

De lezing is dan:
- dit is niet een nieuw traject
- maar een hervatting van een eerdere lijn

### 3.2 Vervolg op eerdere route
Gebruik je wanneer:
- dit een nieuwe route is
- die voortkomt uit een eerder gesloten traject

De lezing is dan:
- dit is een nieuw traject
- maar niet zonder voorgeschiedenis

### 3.3 Later opgevolgd
Gebruik je wanneer:
- dit een historisch gesloten traject is
- dat later een directe opvolger kreeg

De lezing is dan:
- dit traject is historisch gesloten
- en kreeg later een directe opvolger

## 4. Placement in Overview en Detail
### 4.1 Overview blijft klein
In overview verschijnt lineage alleen als compacte contextlaag:
- niet als extra paneel
- niet als tweede beschrijvingsblok
- niet als uitgebreide historie

Maar als een kleine secundaire regel of label bij de route.

### 4.2 Zelfde kern voor HR en manager
De kernlezing is voor beide rollen hetzelfde:
- HR en manager krijgen dezelfde relationele basis
- niet twee verschillende interpretaties van dezelfde route

### 4.3 Detail mag net iets explicieter zijn
Op detail toon je:
- het lineage-label
- plus een korte verwijzing naar de directe buurroute wanneer die er is

Bijvoorbeeld:
- `Vervolg op eerdere route` met link naar de vorige route
- `Later opgevolgd` met link naar de opvolger

### 4.3.1 Route met zowel terug- als vooruitcontext
Een route kan tegelijk:
- `Vervolg op eerdere route` zijn
- en later `Later opgevolgd` krijgen

In dat geval geldt een vaste projectieregel:
- overview toont alleen de teruglezing
- detail toont beide lezingen

Dus:
- overview kiest de lezing die helpt begrijpen wat deze route nu is
- detail mag daarnaast ook laten zien dat deze route later weer een directe opvolger kreeg

De volgorde op detail is:
1. directe voorganger of `Heropend traject`
2. directe opvolger of `Later opgevolgd`

Daarmee blijven overview en detail consistent:
- overview is compacter
- detail is rijker
- maar beide gebruiken dezelfde canonieke prioriteit

### 4.4 Geen losse lineage-sectie
In deze fase komt er geen apart `Lineage` blok onderaan de pagina.

Lineage hoort dicht bij de routekop of summarylaag, omdat het een orientatiesignaal is en geen apart dossieronderdeel.

## 5. Truth en Projectieregels
### 5.1 Geen nieuwe truth
De lineage-samenvatting leest volledig uit bestaande canonieke waarheid:
- route-closeout truth
- route-reopen event truth
- route-relation truth (`follow-up-from`)

Dus:
- geen nieuwe tabellen
- geen nieuwe lineage-state
- geen aparte read cache in V1

### 5.1.1 Reopen-bron is al vastgelegd
Deze fase leunt bewust op de eerdere reopen-richting waarin `reopen` canoniek als dedicated route-event is gekozen.

Dus voor deze leeslaag geldt expliciet:
- `reopen` wordt niet gelezen uit een relationeel record
- `reopen` wordt niet afgeleid uit statusmutatie
- `reopen` komt alleen uit de bestaande reopen event truth

Als die reopen event truth op een route niet aanwezig of niet betrouwbaar uitleesbaar is, projecteert deze fase ook geen `Heropend traject` label.

### 5.2 Een stap terug
Voor een gegeven route leest de summary maximaal een directe voorganger.

De prioriteit is:
1. `reopen event` op dezelfde route
2. `follow-up-from` waarbij deze route de `targetRouteId` is

Projectie:
- bij `reopen event`: `Heropend traject`
- bij `follow-up-from`: `Vervolg op eerdere route`

Reopen wint dus van relationele voorgeschiedenis op dezelfde huidige routelezing.

### 5.3 Een stap vooruit
Voor een gegeven route leest de summary maximaal een directe opvolger.

Alleen:
- `follow-up-from` waarbij deze route de `sourceRouteId` is

Projectie:
- `Later opgevolgd`

### 5.4 Single-neighbor-regel
Deze fase rust op de al gekozen begrenzing:
- geen meerdere directe actieve opvolgers tegelijk
- geen multigeneratie-projectie

Daardoor hoeft de UI niet te kiezen uit meerdere buren.

### 5.4.1 Defensieve fallback bij inconsistente data
Als upstream data de single-neighbor-invariant toch schendt, blijft de projector deterministisch.

De fallback is:
- kies de meest recente directe buurroute op basis van canonieke event- of relationele tijd
- onderdruk overige concurrerende buurlezingen
- toon geen extra inconsistentiemelding in V1

Concreet:
- bij meerdere reopen events wint de meest recente `reopenedAt`
- bij meerdere `follow-up-from` voorgangers of opvolgers wint de meest recente `recordedAt`

Dus:
- de UI blijft stabiel leesbaar
- detail en overview blijven dezelfde buurroute kiezen
- en we introduceren in deze fase geen extra error-surface voor datakwaliteit

### 5.5 Geen statusverrijking
De projector leest alleen:
- is er een directe vorige relatie
- is er een directe volgende relatie
- is dit `reopen` of `follow-up`

Niet:
- wat is de status van die buurroute
- wat was de closeoutreden
- hoeveel rondes zijn er totaal geweest

## 6. Tekst en Links
### 6.1 Tekst blijft kort
De canonieke labels zijn:
- `Heropend traject`
- `Vervolg op eerdere route`
- `Later opgevolgd`

Geen langere zinnen als standaardlabel.

### 6.2 Detail mag een directe link tonen
Op detail mag bij het label een directe link of routeverwijzing staan naar de buurroute.

Dus:
- bij `Vervolg op eerdere route` een link naar de vorige route
- bij `Later opgevolgd` een link naar de opvolger
- bij `Heropend traject` alleen contextuele reopen-lezing, geen aparte buurroute nodig als het om dezelfde route gaat

### 6.3 Geen extra bestuurlijke uitleg
Deze fase voegt geen extra bestuurlijke uitleg toe zoals:
- waarom HR dit vervolg startte
- waarom de eerdere route sloot
- wat de bredere governance was

De lineage-samenvatting helpt alleen orienteren.

## 7. Succescriteria
Deze fase is geslaagd als:
- een gebruiker op een route direct kan zien of dit een heropend traject is
- een gebruiker op een nieuwe vervolgroute direct ziet dat er een eerdere route aan voorafging
- een gebruiker op een oude gesloten route direct ziet dat er later een opvolger kwam
- overview en detail dezelfde lineage-lezing tonen
- er geen extra statuslagen of workflowruis bijkomen

## 8. Ontwerpuitspraak
Deze fase is bewust klein:
- klein genoeg om rustig te blijven
- sterk genoeg om oud versus nieuw traject sneller leesbaar te maken
- zonder nieuwe statusrommel of workflowzwaarte

De samenvatting moet alleen helpen begrijpen:
- waar deze route direct vandaan komt
- en of hier direct iets op volgde
