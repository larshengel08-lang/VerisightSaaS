# Action Center Follow-Up Route Trigger V1 Design

## 1. Doel
Deze fase maakt het mogelijk om na een gesloten route op een heel lichte manier opnieuw opvolging te starten.

Niet door de oude route stilletjes weer open te zetten, maar door:
- een nieuwe vervolgroute te maken
- met dezelfde afdeling of scope
- en een opnieuw gekozen manager

Het doel is:
- bestuurlijk eenvoudig vervolg mogelijk maken
- zonder de betekenis van de gesloten route kapot te maken
- en zonder HR in een zware workflow te trekken

## 2. Productgrens
Wel in scope:
- alleen op gesloten routes
- kleine HR-trigger: `Start vervolgroute`
- HR kiest alleen de manager
- afdeling of scope blijft gelijk aan de gesloten route
- nieuwe route krijgt een expliciete relatie met de oude route
- daarna ligt de volgende stap weer bij de manager

Niet in scope:
- oude route heropenen in deze flow
- afdeling wijzigen
- extra contextvelden
- extra closeout- of herverdeelwizard
- inhoudelijke actiecreatie door HR

Dus:
- HR beslist alleen dat er opnieuw opvolging moet komen
- manager bepaalt daarna weer de inhoudelijke actie

## 3. Lifecycle
### 3.1 Gesloten route bestaat
Een route is al:
- `afgerond`
- of `gestopt`

Die blijft historisch gesloten.

### 3.2 HR start vervolg
HR gebruikt op die gesloten route:
- `Start vervolgroute`

En kiest alleen:
- welke manager de nieuwe route krijgt

### 3.3 Nieuwe vervolgroute ontstaat
Het systeem maakt:
- een nieuwe `routeId`
- met dezelfde afdeling of scope
- gekoppeld aan de gekozen manager
- en canoniek gelinkt aan de oude gesloten route

De oude route blijft dicht.

### 3.4 Manager is weer aan zet
De nieuwe manager ziet daarna de vervolgroute als een open route.

Daarna begint de bekende flow weer:
- manager kiest een thema
- manager maakt een actie
- review volgt later per actie

## 4. Vorm van de Minimale HR-Trigger
### 4.1 Alleen op gesloten routes
`Start vervolgroute` verschijnt alleen wanneer een route al bestuurlijk gesloten is.

Dus alleen bij:
- `afgerond`
- `gestopt`

Niet op:
- open routes
- routes in uitvoering
- reviewbare routes

### 4.2 Trigger is klein
De HR-handeling blijft in deze fase zo klein mogelijk.

Dus:
1. klik `Start vervolgroute`
2. kies `manager`
3. bevestig

Geen extra stappen zoals:
- thema kiezen
- actie ontwerpen
- toelichting invullen
- afdeling aanpassen

### 4.3 Scope blijft gelijk
De nieuwe vervolgroute neemt automatisch over:
- dezelfde afdeling of scope
- dezelfde lokale context

HR kiest in deze fase dus niet opnieuw de afdeling.

### 4.4 Manager is wel opnieuw kiesbaar
Het enige expliciete keuzeveld is:
- `manager`

Dat is belangrijk, want bij vervolg kan het logisch zijn dat:
- dezelfde manager doorgaat
- of juist een andere manager het oppakt

Dus:
- scope blijft vast
- eigenaarschap mag opnieuw gekozen worden

### 4.5 Geen verplichte contextregel
In deze eerste versie is geen extra toelichting nodig.

Dus:
- geen `waarom vervolg?`
- geen verplichte notitie
- geen extra redenveld

De betekenis zit in de handeling zelf:
- gesloten route
- nieuw vervolg
- nieuwe manager

## 5. Truth en Write-Path
### 5.1 Oude route blijft onaangetast
De gesloten route blijft canoniek precies wat hij al was:
- gesloten
- historisch zichtbaar
- met bestaande acties, reviews en closeout

De vervolgtrigger verandert de oude route dus niet.

### 5.2 Nieuwe vervolgroute krijgt eigen route-truth
De trigger maakt een nieuwe route.

Die nieuwe route krijgt canoniek:
- nieuwe `routeId`
- zelfde `campaign`
- zelfde `afdeling/scope`
- nieuw gekozen `manager`
- nieuwe `routeOpenedAt`
- open lifecycle als zelfstandig traject

Dus de vervolgroute is een echt nieuw route-object.

### 5.3 Relationele truth legt de afkomst vast
Naast die nieuwe route-truth komt één kleine relationele waarheid:
- `routeRelationType = 'follow-up-from'`
- `sourceRouteId = oude gesloten route`
- `targetRouteId = nieuwe vervolgroute`
- `recordedAt`
- `recordedByRole = hr`

Dat is genoeg om:
- afkomst te tonen
- detail en overview te verbinden
- latere lineage en rapportage te begrijpen

### 5.4 Write-path blijft HR-only
In deze fase blijft deze handeling expliciet bij HR of Verisight.

Dus:
- alleen HR of Verisight kan `Start vervolgroute` uitvoeren
- managers kunnen dit niet zelf doen

### 5.5 Write-path doet twee dingen
Bij bevestigen moet de write-path atomisch gezien twee waarheden vastleggen:

#### A. Nieuwe route openen
Nieuwe route met:
- zelfde scope
- gekozen manager
- nieuwe open status

#### B. Follow-up relatie opslaan
Relationele koppeling van:
- oude gesloten route
- naar nieuwe vervolgroute

Dus:
- nieuw traject
- plus expliciete afkomst

### 5.6 Geen extra action-truth bij aanmaak
De HR-trigger maakt nog geen manageractie aan.

Dus na creatie:
- er is alleen een nieuwe open route
- manager moet daarna zelf de eerste actie starten

## 6. Overview en Detail
### 6.1 Oude route blijft historisch
De gesloten bronroute blijft in overview en detail leesbaar als:
- gesloten
- historisch traject
- met eventueel een compacte verwijzing dat hier later vervolg op is gekomen

Dus niet:
- half actief
- half hergebruikt
- of visueel verward met de nieuwe route

### 6.2 Nieuwe vervolgroute voelt als nieuw open traject
De nieuwe route moet in overview gewoon lezen als:
- een nieuwe open route
- met een toegewezen manager
- klaar om inhoudelijk te starten

Dus de nadruk ligt op:
- wat loopt nu

### 6.3 Compact lineage-label op de nieuwe route
De nieuwe vervolgroute krijgt een kleine, secundaire contextlaag:
- `Vervolg op eerdere route`

Dat is genoeg om te begrijpen:
- dit is niet het eerste traject
- maar wel een nieuw traject

### 6.4 Compact vervolglabel op de oude route
De oude gesloten route mag een kleine historische indicatie krijgen zoals:
- `Later opgevolgd`

Niet als primaire status, maar als contextsignaal:
- dit traject kreeg later een vervolg

### 6.5 Detail toont tweerichtingscontext
Op detail wil je meer duidelijkheid dan op overview.

Op de nieuwe vervolgroute:
- label `Vervolg op eerdere route`
- link of verwijzing naar de vorige gesloten route

Op de oude gesloten route:
- compacte melding dat hier later een vervolgroute uit ontstond
- link naar die nieuwe route

Dus:
- oude en nieuwe route zijn in beide richtingen verbonden
- zonder zware lineage-UI

## 7. Statusregels en Minimale UX-Flow
### 7.1 Oude route verandert niet van status
Wanneer HR `Start vervolgroute` gebruikt, blijft de oude route exact:
- `afgerond`
- of `gestopt`

Dus:
- geen statusmutatie
- geen impliciete heropening
- geen hybride toestand

### 7.2 Nieuwe vervolgroute start als gewone open route
De nieuwe vervolgroute begint canoniek als:
- open
- toegewezen aan de gekozen manager
- nog zonder manageractie

Dus qua live status valt hij direct terug in de bestaande open-route-semantiek.

### 7.3 Geen extra tussenstatus voor vervolg
In deze fase komen er geen aparte vervolgstatussen zoals:
- `vervolg-open`
- `herstart`
- `opnieuw toegewezen`

De route is gewoon:
- een open route
- met extra lineagecontext

### 7.4 Minimale UX-flow
De flow voor HR is:
1. open een gesloten route
2. klik `Start vervolgroute`
3. kies manager
4. bevestig
5. systeem maakt nieuwe vervolgroute
6. gebruiker komt uit op die nieuwe route of krijgt een directe link ernaartoe

### 7.5 Bevestiging na creatie
Na succesvolle aanmaak moet de UI helder teruggeven:
- vervolgroute aangemaakt
- toegewezen aan manager X

Geen lange succeswizard, alleen een duidelijke bevestiging en door.

### 7.6 Foutgevallen
Alleen de belangrijkste foutgevallen hoeven in V1 goed afgevangen te worden:
- route is niet meer gesloten
- managerkeuze ongeldig
- route bestaat niet meer
- aanmaak mislukt

Dan volgt een compacte foutmelding, zonder complexe herstelstappen.

## 8. Succescriteria
Deze fase is geslaagd als:
- HR op een gesloten route met één kleine handeling een vervolgroute kan starten
- HR daarbij alleen de manager hoeft te kiezen
- de oude route gesloten blijft
- de nieuwe route als zelfstandig open traject ontstaat
- de manager daarna weer aan zet is om inhoudelijk te starten
- overview en detail duidelijk laten zien wat oud traject is en wat nieuwe vervolgroute is

## 9. Ontwerpuitspraak
Deze V1 is bewust klein:
- klein genoeg om rustig te blijven
- sterk genoeg om bestuurlijk netjes vervolg te starten
- zonder nieuwe statusrommel of workflowzwaarte

De rolverdeling blijft zuiver:
- HR start bestuurlijk het vervolg
- manager maakt daarna weer de inhoudelijke actie op basis van een thema
