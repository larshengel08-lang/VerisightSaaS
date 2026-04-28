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
- operationeel intuitief

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

## 4. Canonieke Action Center Truth

De grootste productsprong in de volgende fase mag niet landen als losse strings in meerdere surfaces. Action Center moet daarom een canoniek routecontract krijgen dat de productwaarheid draagt.

### 4.1 Uitgangspunt in de huidige codebase

Vandaag bestaat Action Center al uit een combinatie van:
- `LiveActionCenterCampaignContext` als broncontext
- `ActionCenterPreviewItem` als geprojecteerde UI-route
- onderliggende waarheid uit `CampaignDeliveryRecord`, `PilotLearningDossier`, `CampaignDeliveryCheckpoint` en `PilotLearningCheckpoint`

De eerste volwasseningsslag moet deze waarheid niet vervangen, maar structureren.

### 4.2 Canoniek routecontract

De canonieke route-entiteit is een `Action Center Route`.

Die route draagt minimaal deze waarheden:

1. `routeIdentity`
- `routeId`
- `campaignId`
- `organizationId`
- `sourceProduct`
- `scopeType`
- `scopeValue`
- `scopeLabel`

2. `signalContext`
- `signalSummary`
- `managementQuestion`
- `sourceEvidenceLevel`
- `signalUpdatedAt`

3. `actionCore`
- `intervention`
- `ownerUserId`
- `ownerLabel`
- `expectedEffect`

4. `reviewPlan`
- `reviewScheduledFor`
- `reviewRhythm`
- `reviewReason`

5. `routeState`
- `routeStatus`
- `reviewOutcome`
- `blockedReason`
- `outcomeSummary`

6. `timestamps`
- `routeOpenedAt`
- `ownerAssignedAt`
- `reviewPlannedAt`
- `reviewCompletedAt`
- `outcomeRecordedAt`
- `closedAt`

7. `audit`
- `latestUpdateSummary`
- `latestUpdateAt`
- `latestUpdateBy`

### 4.3 Verplichte velden per volwassenheidsniveau

Niet elk veld hoeft op dag een al zichtbaar of verplicht te zijn, maar de waarheid moet wel canoniek zijn.

`te-bespreken`
- verplicht:
  - `routeIdentity`
  - `signalContext.signalSummary`
  - `signalContext.managementQuestion`
  - `routeOpenedAt`
- nog niet verplicht:
  - eigenaar
  - expected effect
  - review reason

`in-uitvoering`
- verplicht:
  - `intervention`
  - `ownerUserId` of expliciete `ownerLabel`
  - `expectedEffect`
  - `reviewScheduledFor`
  - `reviewReason`

`geblokkeerd`
- verplicht:
  - alles van `in-uitvoering` of expliciete blokkadeverklaring
  - `blockedReason`

`afgerond` of `gestopt`
- verplicht:
  - `reviewOutcome`
  - `outcomeSummary`
  - `closedAt`

### 4.4 Canonieke status- en outcome-semantiek

`routeStatus` blijft compact:
- `te-bespreken`
- `in-uitvoering`
- `geblokkeerd`
- `afgerond`
- `gestopt`

`reviewOutcome` is een aparte laag en mag niet vermengd worden met `routeStatus`.

Canonieke `reviewOutcome`-waarden:
- `geen-uitkomst`
- `doorgaan`
- `bijstellen`
- `opschalen`
- `afronden`
- `stoppen`

Semantische regel:
- `routeStatus` zegt waar de route staat
- `reviewOutcome` zegt wat de laatste reviewbeslissing was

Voor V1 bestaat er bewust geen apart canoniek veld naast `reviewOutcome` voor een toekomstige reviewbeslissing.
De spec introduceert dus geen `reviewDecisionType` als tweede beslislaag.

Als later een pre-review intentielaag nodig blijkt, moet die expliciet als aparte semantiek worden toegevoegd:
- intentie voor de komende review
- uitkomst van de afgeronde review

Die laag hoort niet in V1 thuis.

Voorbeeld:
- een route kan `in-uitvoering` zijn met laatste `reviewOutcome = bijstellen`
- een route kan `afgerond` zijn met laatste `reviewOutcome = afronden`

### 4.5 Koppeling aan huidige waarheid

In de huidige codebase kunnen deze velden in eerste instantie worden afgeleid uit bestaande waarheid:
- `managementQuestion` uit bestaande `reason`
- `intervention` uit bestaande `nextStep` of onderliggende dossieractie
- `expectedEffect` uit `expected_first_value` of nieuwe expliciete routecopy
- `reviewScheduledFor` uit `review_moment`
- `routeStatus` uit bestaande combinatie van `triage_status`, `lifecycle_stage`, `exception_status`, owner en review
- `outcomeSummary` uit `management_action_outcome` of expliciete reviewuitkomst

De eerste vervolgstap is dus niet een nieuwe datastore ontwerpen, maar de bestaande waarheid canoniek projecteren.

## 5. Rol van HR Overview

HR overview blijft bestaan als brede stuurlaag buiten Action Center.

De juiste semantische verdeling is:
- `overview = waar aandacht ontstaat`
- `campaign detail / report = wat het betekent`
- `Action Center = wat we ermee doen`

HR hoeft dus niet te landen in Action Center als primaire home.
Managers landen wel logisch in Action Center.

Deze scheiding is essentieel om overlap en productvervuiling te voorkomen.

## 6. HR -> Action Center Entry Rule

De grens tussen `aandacht` en `opvolging` moet niet impliciet blijven. Daarom krijgt de suite een expliciete entry rule.

### 6.1 Overzicht van de drie niveaus

`Aandacht`
- het signaal is zichtbaar
- het vraagt orientatie of interpretatie
- er is nog geen expliciete opvolgroute

`Route-kandidaat`
- het signaal is managementwaardig genoeg om opvolging te overwegen
- er is al een voorstelbare scope en eerste interventierichting
- eigenaar of review zijn nog niet expliciet vastgelegd
- er bestaat nog geen canonieke Action Center-route

`Actieve route`
- er is expliciet gekozen om een route te openen in Action Center
- de route heeft een canoniek routecontract
- de route projecteert altijd naar een `routeStatus`

### 6.1.1 Mapping tussen entry-lifecycle en routeStatus

De twee lifecycle-vocabulaires beschrijven verschillende dingen:

- `aandacht -> route-kandidaat -> actieve route` beschrijft toegangsdrempel en zichtbaarheid
- `te-bespreken / in-uitvoering / geblokkeerd / afgerond / gestopt` beschrijft de status van een reeds geopende route

Canonieke mapping:
- `aandacht`
  - buiten Action Center
  - geen routecontract
  - geen `routeStatus`

- `route-kandidaat`
  - buiten de echte routeflow
  - nog geen canonieke Action Center-route
  - nog geen `routeStatus`

- `actieve route`
  - routecontract bestaat
  - altijd zichtbaar als route in Action Center
  - projecteert naar precies een `routeStatus`

Startstatus voor een actieve route:
- `te-bespreken` wanneer de route is geopend, maar eigenaar, interventie of reviewplan nog niet compleet zijn
- `in-uitvoering` wanneer eigenaar, interventie, expected effect en reviewplan compleet zijn

### 6.2 Canonieke entry rule

De overgang heeft twee drempels.

`Drempel 1: route-kandidaat`
Een signaal wordt kandidaat voor opvolging zodra aan alle onderstaande voorwaarden is voldaan:

1. Het signaal is leesbaar genoeg voor managementactie.
De campagne of route zit op een niveau waarop overview, campaign detail of report al een echte eerste managementvraag dragen.

2. De scope is expliciet.
Er is een duidelijk organisatieniveau, team, afdeling of routecontext waarop de opvolging betrekking heeft.

3. De eerste interventie is in een zin te formuleren.
Niet alleen "dit vraagt aandacht", maar "dit is de eerstvolgende kleine stap".

4. Er is een primaire eigenaar te benoemen.
Dat kan HR, manager of een specifieke verantwoordelijke combinatie zijn, maar niet impliciet "iedereen".

5. Er is een logisch reviewmoment te plannen.
Niet alleen een datum, maar een uitlegbaar moment waarop iets opnieuw gelezen of besloten wordt.

`Drempel 2: actieve route`
Een kandidaat wordt pas een echte Action Center-route zodra:
- HR of de verantwoordelijke gebruiker expliciet kiest om de route te openen
- de route een canoniek routecontract krijgt
- de route daarna projecteert naar `te-bespreken` of `in-uitvoering`

### 6.3 Wat blijft nog buiten Action Center

Een signaal blijft in overview / campaign / report als:
- de onderbouwing nog te smal is
- de scope nog niet eerlijk gekozen kan worden
- er nog geen kleine interventie te formuleren is
- er nog geen eigenaar of reviewlogica te benoemen is

Dat betekent:
- aandacht zonder expliciete opvolgkeuze blijft buiten Action Center
- Action Center begint pas bij een expliciet geopende route

### 6.3.1 Waar de kandidaat zichtbaar is

`route-kandidaat` is zichtbaar in:
- HR overview
- campaign detail
- reports

`route-kandidaat` mag optioneel ook op Action Center landing als samenvattend signaal zichtbaar zijn, maar telt dan nog niet als echte route.

Een kandidaat verschijnt pas in:
- actie-overzichten
- routedetail
- reviewflow
- managerflow

wanneer de route daadwerkelijk is geopend en dus een canoniek routecontract heeft.

### 6.4 Korte-termijn productregel

De eerste UX-verbetering hoeft niet meteen volledige automatisering te bieden. In de korte horizon is het genoeg als de suite expliciet kan tonen:
- `alleen aandacht`
- `route-kandidaat`
- `actieve opvolging`

Zo wordt de semantische grens productmatig zichtbaar, ook als niet elke route direct automatisch wordt aangemaakt.

## 7. Productstructuur en Horizonnen

Action Center groeit niet via losse features, maar via een beperkt aantal kerncapabilities:

1. Signal-to-action
2. Actiekwaliteit
3. Reviewritme
4. Resultaatlus
5. HR control layer
6. Manager execution layer
7. Trust, discipline and evidence

Daaroverheen liggen drie horizonnen:

### 7.1 Korte horizon

Doel:
Action Center veel scherper en bruikbaarder maken in dagelijks gebruik.

Focus:
- betere actiekwaliteit
- duidelijkere reviewbetekenis
- explicietere overgang van signaal naar opvolging
- eerste zichtbare resultaatlus
- laatste copy- en browser-QA

### 7.2 Middellange horizon

Doel:
van bruikbare opvolgmodule naar volwassen management-cockpit.

Focus:
- standaardiseren van type acties
- expliciete reviewuitkomsten
- compactere resultaatlijn
- sterkere HR-control
- verdere vereenvoudiging van managerervaring

### 7.3 Lange horizon

Doel:
Action Center laten uitgroeien tot het formele geheugen van opvolging zonder zwaar systeem te worden.

Focus:
- effectsignalering
- sterkere besluitlijn
- betere closing- en borglogica
- volwassen productdifferentiatie als USP

## 8. Capability-Roadmap

Per capability is hieronder onderscheid gemaakt tussen:
- wat al bestaat
- wat impliciet aanwezig is
- wat nog volwassen moet worden

### 8.1 Signal-to-action

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

### 8.2 Actiekwaliteit

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

### 8.3 Reviewritme

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

### 8.4 Resultaatlus

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

### 8.5 HR control layer

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

### 8.6 Manager execution layer

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

### 8.7 Trust, discipline and evidence

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
- minder ambiguiteit over wat echt vastligt

Lange horizon:
- Action Center voelt als betrouwbaar geheugen van opvolging zonder governancezwaar te worden

## 9. Persona-Flows

### 9.1 HR-flow

Ideale flow:
1. Orientatie op overview
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

### 9.2 Manager-flow

Ideale flow:
1. Directe landing in Action Center
2. Een heldere focus
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

### 9.3 Kernverschil HR versus manager

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

## 10. Roadmap en Opbouwvolgorde

De juiste groeivolgorde is:
1. helderheid
2. actie-discipline
3. review-discipline
4. resultaatzicht
5. portfolio- en leereffect

### 10.1 Korte termijn

Prioriteiten:
1. Actiekwaliteit aanscherpen
2. Reviewritme betekenisvoller maken
3. Brug tussen overview/report/campaign en Action Center versterken
4. Resultaattaal verbeteren
5. Laatste browser/screenshot QA op copy en flow

### 10.1 Eerste verticale slice

De eerste uitvoerstart mag niet uitlopen op een brede polishgolf. Daarom wordt de korte horizon geopend met één verticale slice:

`Route Contract V1`

Deze slice omvat:
1. één canonieke routeprojectie bovenop bestaande Action Center truth
2. één expliciete entry rule `aandacht -> route-kandidaat -> actieve route`
3. één compact actieformat:
   - aanleiding
   - interventie
   - eigenaar
   - verwacht effect
4. één compact reviewformat:
   - reviewmoment
   - reviewreden
   - reviewuitkomst
5. één eerste resultaatregel:
   - wat is geprobeerd
   - wat zagen we terug
   - wat is besloten

Deze slice is pas geslaagd als hij op één bestaande route end-to-end klopt voor:
- HR overview -> Action Center
- Action Center item detail
- managerleesbaarheid

Pas daarna volgt verbreding naar meer routes, meer templates en meer portfolio-samenvatting.

### 10.2 Middellange termijn

Prioriteiten:
1. Acties standaardiseren per signaaltype
2. Reviewuitkomsten expliciet maken
3. Resultaatlus compacter en zichtbaarder maken
4. HR-control verbeteren
5. Managerervaring verder verscherpen

### 10.3 Lange termijn

Prioriteiten:
1. Action Center als formeel geheugen van opvolging
2. Effectpatronen zichtbaar maken zonder analytics-product te worden
3. Sterkere closing- en borglogica
4. USP-volwassenheid: opvolging als duidelijke productbelofte

## 11. Meetcontract en Evidence

De productvolwassenheid van Action Center mag niet afhankelijk blijven van losse indrukken. Daarom krijgt het masterplan één meetcontract.

### 11.1 Bronnen van waarheid

De voortgang van Action Center wordt bewezen vanuit drie lagen:

1. `route snapshot truth`
- canonieke routevelden en timestamps

2. `suite telemetry`
- bestaande eventlaag in `lib/telemetry/events.ts`

3. `qualitative product QA`
- browser/screenshot QA op copy, flow en managerduidelijkheid

### 11.2 Bestaande telemetry die al aansluit

De codebase heeft vandaag al relevante events:
- `first_value_confirmed`
- `first_management_use_confirmed`
- `action_center_review_scheduled`
- `action_center_closeout_recorded`

Deze events zijn nuttig, maar nog niet voldoende om actiekwaliteit, reviewkwaliteit en route-uitkomst volledig te bewijzen.

### 11.3 Benodigde canonieke meetvelden

De route zelf moet daarom minimaal deze meetbare velden dragen:
- `routeOpenedAt`
- `ownerAssignedAt`
- `reviewPlannedAt`
- `reviewScheduledFor`
- `reviewCompletedAt`
- `outcomeRecordedAt`
- `closedAt`
- `expectedEffect`
- `reviewReason`
- `reviewOutcome`

### 11.4 Kernmetrics

`Action completeness rate`
- aandeel actieve routes met:
  - eigenaar
  - interventie
  - expected effect
  - reviewdatum
  - reviewreden

`Review quality rate`
- aandeel geplande reviews dat binnen afgesproken termijn een expliciete reviewuitkomst krijgt

`Time to owned route`
- tijd tussen `routeOpenedAt` en `ownerAssignedAt`

`Time to review plan`
- tijd tussen `routeOpenedAt` en `reviewPlannedAt`

`Time open without decision`
- tijd dat een route open staat zonder eigenaar, review of reviewuitkomst

`Outcome clarity rate`
- aandeel afgeronde of gestopte routes met expliciete `outcomeSummary`

### 11.5 Praktische drempels voor uitvoering

De spec hoeft hier nog geen definitieve KPI-targets op te leggen, maar moet wel operationele definities geven.

Voor de eerste implementatiefase zijn bruikbare drempels:
- `te lang open zonder eigenaar`: meer dan 7 kalenderdagen na `routeOpenedAt`
- `te lang open zonder reviewplan`: meer dan 7 kalenderdagen na `routeOpenedAt`
- `review verlopen zonder uitkomst`: meer dan 5 werkdagen na `reviewScheduledFor`

Deze drempels mogen later worden aangescherpt per producttype, maar moeten in de eerste fase uniform en simpel blijven.

### 11.6 QA als formele gate

Naast data geldt ook:
- elke copy-pass krijgt een browser/screenshot QA
- managerduidelijkheid en HR-grip blijven expliciete kwalitatieve gates

Dus:
Action Center is niet pas beter als metrics beter zijn, maar metrics moeten het uiteindelijke productverhaal wel kunnen dragen.

## 12. Guardrails

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

## 13. Succescriteria

### 13.1 Gebruikssucces

Managers:
- begrijpen sneller wat nu nodig is
- hoeven minder te interpreteren
- zien beter waarom review terugkomt

HR:
- ziet sneller waar eigenaar, review of uitkomst ontbreekt
- heeft meer grip op lopende opvolgroutes

### 13.2 Productsucces

Action Center is succesvoller als het aantoonbaar beter wordt in:
- actiekwaliteit
- reviewbetekenis
- uitkomstduidelijkheid
- consistentie
- rust in gebruik

### 13.3 UX-succes

Het product moet tegelijk:
- inhoudelijk zwaarder worden
- gevoelsmatig eenvoudiger blijven

### 13.4 Suite-succes

De suitestructuur blijft helder:
- overview = waar aandacht ontstaat
- campaign/report = wat het betekent
- Action Center = wat we ermee doen

### 13.5 USP-succes

Action Center is pas echt USP-waardig als het product laat voelen:
- Verisight laat niet alleen zien wat speelt
- Verisight helpt ook om signalen serieus, compact en zichtbaar op te volgen
- zonder zwaar systeem en zonder generieke workflowtool te worden

### 13.6 Praktische meetpunten

Later te meten via:
- groter aandeel acties met expliciete eigenaar
- groter aandeel acties met expliciete verwachte uitkomst
- hoger aandeel reviews met duidelijke reviewreden of reviewuitkomst
- minder routes die te lang open blijven zonder besluit
- duidelijkere afgeronde of bewust gestopte routes
- sterkere managerduidelijkheid in browser-QA en gebruikerstests
- sterkere ervaren grip bij HR

## 14. Aanbevolen eerstvolgende stap

Gebruik dit masterplan als basis voor een uitvoerbaar implementatieplan, te beginnen met één expliciete eerste slice:
- `Route Contract V1`
- entry rule `aandacht -> route-kandidaat -> actieve route`
- actiekwaliteit met `expected effect`
- reviewkwaliteit met `review reason`
- eerste resultaatregel met expliciete reviewuitkomst

Pas na die slice volgen:
- verbreding naar meer routes
- rijkere HR-control
- bredere portfolio- en effectpatronen
- verdere visual polish en QA-rondes

Dit is bewust geen implementatieplan en geen featurespec per ticket. Het is de richtinggevende productspec voor verdere uitbouw van Action Center als kernproduct van de ingelogde suite.
