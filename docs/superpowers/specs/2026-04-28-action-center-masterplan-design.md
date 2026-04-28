# Action Center Masterplan

Date: 2026-04-28
Scope: Ingelogde Verisight suite, met nadruk op Action Center als kernproduct
Status: Design approved in conversation, geschreven als masterplan voor vervolg

## 1. Doel

Action Center moet uitgroeien tot de compacte management-cockpit van Verisight: de plek waar signalen uit overview, campaign detail en reports worden vertaald naar concrete opvolging, expliciet eigenaarschap, logisch reviewritme en zichtbare uitkomst.

Het product moet:
- helder zijn voor managers
- serieus genoeg zijn voor HR
- krachtig voelen in resultaat
- niet veranderen in generieke workflowsoftware

De kernbelofte van Action Center wordt:
- wat vraagt aandacht
- wie pakt het op
- wat is de eerstvolgende kleine interventie
- wanneer kijken we opnieuw
- wat heeft het opgeleverd

## 2. Productvisie

### 2.1 Wat Action Center moet zijn

Action Center is de opvolglaag van Verisight.

Dat betekent:
- `overview` blijft de brede HR-stuurlaag
- `campaign detail` en `reports` blijven de interpretatie- en contextlaag
- `Action Center` wordt de laag voor opvolging, eigenaarschap, review en uitkomst

Voor HR is Action Center een rustige stuurlaag over meerdere opvolgroutes.
Voor managers is Action Center een smalle en directe werklaag: wat speelt hier, wat doe ik nu, wanneer bespreken we dit opnieuw.

### 2.2 Wat Action Center nadrukkelijk niet moet worden

Action Center moet niet veranderen in:
- een generieke takenapp
- een breed case management systeem
- een projectmanagementtool
- een tweede dashboardlaag voor analyse
- een bureaucratisch registratiesysteem

De juiste volwassenheid is:
- inhoudelijk zwaar
- UXmatig licht
- bestuurlijk serieus
- operationeel intuïtief

## 3. Productprincipes

Elke productkeuze moet hieraan voldoen:

1. Elke actie is klein, concreet en uitvoerbaar.
2. Elke actie heeft een expliciete eigenaar.
3. Elke actie heeft een verwacht effect.
4. Elk reviewmoment voelt logisch en uitlegbaar.
5. Elke opvolgroute kan eindigen in een duidelijke uitkomst.
6. Managers krijgen minder systeem en meer duidelijkheid.
7. HR krijgt meer grip, niet meer rompslomp.
8. Resultaat moet voelbaar terugkomen in het product.
9. Analyse blijft in dashboard en rapport; opvolging leeft in Action Center.
10. Volwassenheid mag niet leiden tot complexiteitsexplosie.

## 4. Rol van HR Overview

HR overview blijft bestaan als brede stuurlaag buiten Action Center.

De juiste semantische verdeling is:
- `overview = waar aandacht ontstaat`
- `campaign detail / report = wat het betekent`
- `Action Center = wat we ermee doen`

HR hoeft dus niet te landen in Action Center als primaire home.
Managers landen wel logisch in Action Center.

Deze scheiding is essentieel om overlap en productvervuiling te voorkomen.

## 5. Productstructuur en Horizonnen

Action Center groeit niet via losse features, maar via een beperkt aantal kerncapabilities:

1. Signal-to-action
2. Actiekwaliteit
3. Reviewritme
4. Resultaatlus
5. HR control layer
6. Manager execution layer
7. Trust, discipline and evidence

Daaroverheen liggen drie horizonnen:

### 5.1 Korte horizon

Doel:
Action Center veel scherper en bruikbaarder maken in dagelijks gebruik.

Focus:
- betere actiekwaliteit
- duidelijkere reviewbetekenis
- explicietere overgang van signaal naar opvolging
- eerste zichtbare resultaatlus
- laatste copy- en browser-QA

### 5.2 Middellange horizon

Doel:
van bruikbare opvolgmodule naar volwassen management-cockpit.

Focus:
- standaardiseren van type acties
- expliciete reviewuitkomsten
- compactere resultaatlijn
- sterkere HR-control
- verdere vereenvoudiging van managerervaring

### 5.3 Lange horizon

Doel:
Action Center laten uitgroeien tot het formele geheugen van opvolging zonder zwaar systeem te worden.

Focus:
- effectsignalering
- sterkere besluitlijn
- betere closing- en borglogica
- volwassen productdifferentiatie als USP

## 6. Capability-Roadmap

Per capability is hieronder onderscheid gemaakt tussen:
- wat al bestaat
- wat impliciet aanwezig is
- wat nog volwassen moet worden

### 6.1 Signal-to-action

Bestaat al:
- bronkoppeling vanuit campaigns
- Action Center als top-level module
- items met `reason`, `summary`, `nextStep`

Nog niet volwassen:
- overgang van signaal naar echte opvolgroute is te impliciet
- HR moet nog te veel zelf vertalen van signaal naar actie

Korte horizon:
- expliciete brugtaal tussen overview/report/campaign en Action Center
- duidelijker tonen of iets alleen aandacht vraagt of al in opvolging zit

Middellange horizon:
- vaste opvolgkaart per type signaal
- consistenter moment waarop iets Action Center-waardig wordt

Lange horizon:
- opvolging voelt productmatig als vanzelfsprekende bestemming van ieder echt managementsignaal

### 6.2 Actiekwaliteit

Bestaat al:
- titel
- summary
- next step
- owner
- priority

Impliciet aanwezig:
- ruwe aanleiding
- ruwe vervolgstap

Nog niet volwassen:
- acties zijn nog niet scherp genoeg als kleine managementinterventie
- verwacht effect ontbreekt nog als first-class productlaag

Korte horizon:
- vast actieformat:
  - aanleiding
  - kleine interventie
  - eigenaar
  - verwacht effect
- actiecopy herschrijven naar concrete kleine stappen

Middellange horizon:
- product-specifieke actierichtingen per signaaltype
- sneller kiezen uit geloofwaardige vervolgroutes

Lange horizon:
- Action Center voelt sterk in aanbevolen vervolgstappen
- actie en verwacht effect vormen samen de kern van ieder item

### 6.3 Reviewritme

Bestaat al:
- reviewdatum
- reviewritme
- reviewoverzichten
- reviewbuckets

Nog niet volwassen:
- review zegt vooral wanneer, onvoldoende waarom
- reviewmoment maakt de volgende beslissing nog niet expliciet genoeg

Korte horizon:
- reviewmoment krijgt altijd betekenis:
  - waarom dan
  - wat toetsen we dan
  - welke beslissing volgt daarna

Middellange horizon:
- vaste reviewuitkomsten:
  - doorgaan
  - bijstellen
  - afronden
  - opschalen
  - stoppen

Lange horizon:
- review voelt als echte managementcyclus, niet als losse planning

### 6.4 Resultaatlus

Bestaat al:
- updates
- statussen
- checkpoints
- uitkomsten in onderliggende dossierlogica

Impliciet aanwezig:
- `expected_first_value`
- `management_action_outcome`

Nog niet volwassen:
- resultaat voelt nog te veel als logboek
- uitkomst is nog geen duidelijke productervaring

Korte horizon:
- explicietere update- en uitkomsttaal
- beter tonen wat is geprobeerd, teruggezien en besloten

Middellange horizon:
- compacte resultaatstatus per route
- sneller zicht op welke routes effect hebben of blijven hangen

Lange horizon:
- Action Center wordt ook bewijslaag van wat wel en niet werkte

### 6.5 HR control layer

Bestaat al:
- overview buiten Action Center
- status- en reviewlagen
- team- en managercontext

Nog niet volwassen:
- HR-sturing over meerdere opvolgroutes kan scherper
- nog te weinig expliciete signalen rond eigenaar, reviewgat, stagnatie en uitkomst

Korte horizon:
- betere HR-signalen in overview en Action Center landing

Middellange horizon:
- sterkere compacte portfolio-opvolging over meerdere routes

Lange horizon:
- Action Center voelt voor HR als rustige control tower

### 6.6 Manager execution layer

Bestaat al:
- manager-only toegang
- beperkte scope
- teamfocus
- gerichte landing

Nog niet volwassen:
- aanleiding, interventie, reviewverwachting en uitkomst kunnen compacter en concreter

Korte horizon:
- managercopy compacter maken
- acties directer formuleren

Middellange horizon:
- manager ziet per route een helder mini-model:
  - dit speelt
  - dit doe jij
  - dit bespreken we straks

Lange horizon:
- managerervaring wordt een sterk onderscheidend deel van het product

### 6.7 Trust, discipline and evidence

Bestaat al:
- owners
- reviewdata
- updates
- lifecycle-logica
- checkpoints

Nog niet volwassen:
- discipline is aanwezig, maar nog niet overal zichtbaar als productwaarde
- niet overal is duidelijk wat een status of uitkomst precies betekent

Korte horizon:
- status- en outcomebetekenis aanscherpen

Middellange horizon:
- besluitmomenten explicieter maken
- minder ambiguïteit over wat echt vastligt

Lange horizon:
- Action Center voelt als betrouwbaar geheugen van opvolging zonder governancezwaar te worden

## 7. Persona-Flows

### 7.1 HR-flow

Ideale flow:
1. Oriëntatie op overview
2. Begrijpen via campaign detail of report
3. Overzetten naar Action Center
4. Bewaken in Action Center
5. Leren, bijstellen, afsluiten

Belangrijkste huidige HR-frictie:
- brug van signaal naar opvolging is te impliciet
- actiekwaliteit varieert
- review is nog te veel planning
- resultaat voelt nog te weinig als expliciete uitkomst

Gewenste HR-ervaring:
- rustige control tower
- snel zichtbaar waar eigenaarschap, review of uitkomst ontbreekt
- meer grip zonder extra administratie

### 7.2 Manager-flow

Ideale flow:
1. Directe landing in Action Center
2. Eén heldere focus
3. Concrete interventie
4. Betekenisvolle review
5. Expliciete uitkomst

Belangrijkste huidige manager-frictie:
- acties zijn nog niet altijd concreet genoeg
- review is nog te veel moment en te weinig beslissing
- uitkomst is nog te weinig voelbaar

Gewenste manager-ervaring:
- eenvoudig
- serieus
- niet administratief
- meteen duidelijk wat nu verwacht wordt

### 7.3 Kernverschil HR versus manager

HR:
- meer breedte
- meer portfoliologica
- meer discipline en bewaking

Manager:
- minder breedte
- meer directe actie
- meer eenvoud

Elke capability moet dus altijd twee vragen overleven:
- geeft dit HR meer grip zonder meer ruis?
- maakt dit de managerstap duidelijker zonder meer complexiteit?

## 8. Roadmap en Opbouwvolgorde

De juiste groeivolgorde is:
1. helderheid
2. actie-discipline
3. review-discipline
4. resultaatzicht
5. portfolio- en leereffect

### 8.1 Korte termijn

Prioriteiten:
1. Actiekwaliteit aanscherpen
2. Reviewritme betekenisvoller maken
3. Brug tussen overview/report/campaign en Action Center versterken
4. Resultaattaal verbeteren
5. Laatste browser/screenshot QA op copy en flow

### 8.2 Middellange termijn

Prioriteiten:
1. Acties standaardiseren per signaaltype
2. Reviewuitkomsten expliciet maken
3. Resultaatlus compacter en zichtbaarder maken
4. HR-control verbeteren
5. Managerervaring verder verscherpen

### 8.3 Lange termijn

Prioriteiten:
1. Action Center als formeel geheugen van opvolging
2. Effectpatronen zichtbaar maken zonder analytics-product te worden
3. Sterkere closing- en borglogica
4. USP-volwassenheid: opvolging als duidelijke productbelofte

## 9. Guardrails

Action Center mag niet vervallen in:
- generieke workflowsoftware
- analyse-dubbeling
- statusinflatie
- formulierdruk
- brede HR-last voor managers

Belangrijkste guardrails:
1. Geen tweede dashboardlaag in Action Center
2. Geen wildgroei aan statussen
3. Geen velden vragen die geen besliskracht opleveren
4. Managers krijgen nooit de HR-zwaarte
5. Volwassenheid moet vooral uit betekenis komen, niet uit meer UI

## 10. Succescriteria

### 10.1 Gebruikssucces

Managers:
- begrijpen sneller wat nu nodig is
- hoeven minder te interpreteren
- zien beter waarom review terugkomt

HR:
- ziet sneller waar eigenaar, review of uitkomst ontbreekt
- heeft meer grip op lopende opvolgroutes

### 10.2 Productsucces

Action Center is succesvoller als het aantoonbaar beter wordt in:
- actiekwaliteit
- reviewbetekenis
- uitkomstduidelijkheid
- consistentie
- rust in gebruik

### 10.3 UX-succes

Het product moet tegelijk:
- inhoudelijk zwaarder worden
- gevoelsmatig eenvoudiger blijven

### 10.4 Suite-succes

De suitestructuur blijft helder:
- overview = waar aandacht ontstaat
- campaign/report = wat het betekent
- Action Center = wat we ermee doen

### 10.5 USP-succes

Action Center is pas echt USP-waardig als het product laat voelen:
- Verisight laat niet alleen zien wat speelt
- Verisight helpt ook om signalen serieus, compact en zichtbaar op te volgen
- zonder zwaar systeem en zonder generieke workflowtool te worden

### 10.6 Praktische meetpunten

Later te meten via:
- groter aandeel acties met expliciete eigenaar
- groter aandeel acties met expliciete verwachte uitkomst
- hoger aandeel reviews met duidelijke reviewreden of reviewuitkomst
- minder routes die te lang open blijven zonder besluit
- duidelijkere afgeronde of bewust gestopte routes
- sterkere managerduidelijkheid in browser-QA en gebruikerstests
- sterkere ervaren grip bij HR

## 11. Aanbevolen eerstvolgende stap

Gebruik dit masterplan als basis voor een uitvoerbaar implementatieplan in fasen, te beginnen met de korte horizon:
- actiekwaliteit
- reviewbetekenis
- resultaattaal
- browser/screenshot QA

Dit is bewust geen implementatieplan en geen featurespec per ticket. Het is de richtinggevende productspec voor verdere uitbouw van Action Center als kernproduct van de ingelogde suite.
