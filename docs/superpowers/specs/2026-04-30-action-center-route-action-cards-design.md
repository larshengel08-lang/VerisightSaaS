## Action Center Route Action Cards

### Doel
De volgende fase maakt Action Center geschikt voor meerdere manageracties binnen een afdelingsroute, zonder dat het product verandert in een takenapp.

De kernflow wordt:
- HR zet een campagne zoals ExitScan uit
- resultaten komen binnen
- HR wijst per relevante afdeling een manager toe
- daarmee ontstaat een afdelingsroute in Action Center
- de manager maakt binnen die route een of meer acties
- elke actie hangt aan een thema uit de resultaten
- elke actie heeft een eigen reviewmoment
- review en vervolg zijn dus primair actiegebonden

Het doel is:
- lokale opvolging rijker maken
- review per interventie veel scherper maken
- de route als bestuurlijke container overeind houden

### Productgrens
Wel in scope:
- een afdelingsroute per manager en opvolgpad
- meerdere vrije manageracties binnen die route
- themakeuze per actie uit vaste productthema's
- een eigen reviewmoment per actie
- compacte route-overzichten die meerdere acties samenvatten

Niet in scope:
- taakborden
- subtaken
- dependencies
- persoonlijke todo-lagen
- uitgebreide projectplanning
- brede workflowstatussen per ministap

De ontwerpregel blijft:
- meer inhoudelijke opvolging
- niet meer productcomplexiteit

### Lifecycle
#### 1. Signaalfase
Dashboard of rapport laat zien waar op afdelingsniveau aandacht nodig is.

#### 2. HR-open
HR opent een afdelingsroute door een manager toe te wijzen.

De route staat dan voor:
- een campagne of signaal
- een afdeling of lokaal opvolgpad
- een manager-eigenaar

#### 3. Open route
De manager ziet direct de afdelingsroute in Action Center.

Zonder acties is dit:
- een geopende opvolgcontainer
- nog geen uitgewerkte lokale interventie

#### 4. Manageracties
De manager maakt binnen die route een of meer acties.

Per actie:
- een thema
- een concrete stap
- een reviewmoment
- een verwacht effect

#### 5. Review per actie
Elke actie krijgt een eigen reviewmoment.

Dus niet een gedeelde reviewlaag voor alle acties samen, maar per actie:
- wat hebben we gedaan
- wat zagen we terug
- wat betekent dit voor vervolg of afsluiting

#### 6. Route-overzicht
De route blijft daarna het hogere niveau houden:
- welke acties lopen hier nu
- welke reviews komen eraan
- waar zit voortgang
- waar zit blokkade
- wat is al afgerond

Actie is de uitvoereenheid, route blijft de bestuurlijke container.

### Route-Container en Lichte Actiecards
De afdelingsroute blijft het bovenliggende object.

Die route zegt:
- dit is het lokale opvolgpad
- deze manager is eigenaar
- deze afdeling hoort bij deze campagne-uitkomst
- binnen deze route lopen een of meer concrete acties

Acties worden compacte cards binnen de route.

Elke actiecard staat voor:
- een concrete interventie
- een reviewcyclus

Dat betekent:
- geen logboekregel
- geen losse notitie
- maar een kleine, volwaardige opvolgeenheid

#### Minimale actie-opbouw
Elke actiecard draagt minimaal:
- `thema`
- `actie`
- `reviewmoment`
- `verwacht effect`
- `status`

Dat is genoeg om een actie:
- concreet
- planbaar
- reviewbaar
- vergelijkbaar

te maken.

#### Thema per actie
Een actie hangt altijd aan precies een productthema.

Dus:
- geen vrije themalabels
- geen multi-thema acties
- geen thema op routeniveau als leidende uitvoerstructuur

Als een manager op twee thema's wil handelen, horen daar twee actiecards bij.

#### Meerdere acties mogen
Binnen een route mogen meerdere acties bestaan.

Maar:
- geen subtaken
- geen afhankelijkheidslijnen
- geen nested structuren
- geen kanbanlogica

De actiecard is de grens.

### Actievelden, Statussen en Reviewkoppeling
Elke actiecard krijgt een klein maar stevig veldenset:
- `themeKey`
- `actionText`
- `reviewScheduledFor`
- `expectedEffect`
- `status`

#### ThemeKey
`themeKey` is verplicht en komt uit vaste productthema's.

Dus:
- geen vrije tekst
- geen gecombineerde thema's in een actie
- precies een thema per actie

#### ActionText
`actionText` is de concrete managementinterventie.

Dit moet:
- klein genoeg zijn om echt uitvoerbaar te voelen
- specifiek genoeg zijn om later op terug te kijken

Dus niet:
- een observatie
- een abstract doel
- een algemene routezin

#### ReviewScheduledFor
Elke actie heeft zijn eigen reviewmoment.

Dat is een harde ontwerpkeuze in deze fase:
- geen review zonder anker
- geen gedeeld reviewmoment voor meerdere acties
- geen onduidelijke routebrede review als primaire vorm

#### ExpectedEffect
`expectedEffect` beschrijft wat de actie zichtbaar moet maken.

Dus niet:
- wat de manager verder nog gaat doen

Maar:
- welk effect
- welk signaal
- of welke verandering deze actie toetsbaar moet maken

#### Actiestatussen
De statusset blijft klein:
- `open`
- `in_review`
- `afgerond`
- `gestopt`

Betekenis:
- `open`: de actie loopt of staat gepland richting review
- `in_review`: de reviewfase is actief of net aan de beurt
- `afgerond`: de actie is voldoende doorlopen en gesloten
- `gestopt`: de actie is bewust beeindigd of niet verder voortgezet

Niet nodig in deze fase:
- veel tussenstappen
- waiting-subtask-escalationstatussen
- task-managementachtige detailstatussen

#### Reviewkoppeling
Review hangt primair aan een actie.

Dus per actie:
- een reviewmoment
- een reviewuitkomst
- een vervolgkeuze

Dat betekent niet dat een actie nooit meerdere keren bekeken kan worden, maar de eerste versie blijft klein:
- actiekaart
- review op die actie
- uitkomst daarvan zichtbaar in route en historie

### Overzicht en Detail Zonder Takenapp-Gedrag
#### Routekaart blijft samenvattend
De routekaart op overview of landing schrijft niet alle acties vol uit.

De routekaart laat vooral zien:
- welke manager eigenaar is
- hoeveel acties er lopen
- welke reviewmomenten eraan komen
- of iets vastloopt
- of de route vooral actief, reviewbaar of afgerond voelt

Dus:
- routekaart is bestuurlijk samenvattend
- detail draagt de operationele diepte

#### Compacte actiesamenvatting op routeniveau
Op routeniveau wil je hooguit een korte actiesamenvatting, zoals:
- `3 acties actief`
- `2 reviews deze week`
- `1 afgerond`
- of een compacte preview van de eerstvolgende review

Niet:
- alle actievelden
- alle themateksten
- alle reviewnotities

#### Detailweergave toont actiecards
De detailroute wordt de plek waar manager of HR de actiecards echt ziet.

Per actie moet daar zichtbaar zijn:
- thema
- actie
- reviewmoment
- verwacht effect
- status
- laatste reviewuitkomst of huidige stand

#### Sortering in detail
De detailweergave ordent acties logisch:
1. acties met review binnenkort
2. open acties
3. acties in review
4. afgeronde of gestopte acties onderaan

#### Review zichtbaar per actie
Review zweeft niet los als aparte abstracte laag.

Beter is:
- review wordt zichtbaar op of direct bij de actiecard
- de route-detail toont eventueel een compacte reviewsamenvatting over alle acties

De kern blijft:
- review hoort bij actie
- actie hoort bij route

#### Route-status blijft hoger niveau
De route houdt een bovenliggende status die geen simpele kopie van een actie is.

Mogelijke route-statussen:
- `open verzoek` als er nog geen acties zijn
- `in uitvoering` als er open acties lopen
- `reviewbaar` als een of meer acties op review wachten
- `afgerond` als alle relevante acties netjes gesloten zijn
- `gestopt` als de route bewust zonder verdere follow-through eindigt

### Architectuur, Truth en Samenvattingslogica
De architectuur moet twee expliciete lagen hebben:

#### Route truth
De afdelingsroute als container:
- campagne of signaal
- afdeling of scope
- manager-eigenaar
- route-status
- route-open datum
- routebrede samenvatting

#### Action truth
De manageracties binnen die route:
- thema
- actie
- reviewmoment
- verwacht effect
- actiestatus
- reviewuitkomst per actie

Die scheiding is belangrijk. Anders ga je ofwel alles in de route proppen, ofwel de route reduceren tot een lege map om acties heen.

#### Canonieke actie-truth
Acties zijn geen losse UI-objecten of tijdelijke clientcards.

Per actie moet canoniek bestaan:
- `actionId`
- `routeId`
- `themeKey`
- `actionText`
- `reviewScheduledFor`
- `expectedEffect`
- `status`
- `createdAt`
- `updatedAt`

#### Actiegebonden review-truth
Review moet niet meer vooral routebreed zijn, maar primair aan een actie hangen.

De minimale review-laag per actie draagt:
- `actionReviewId`
- `actionId`
- `reviewedAt`
- `observation`
- `decision`
- `decisionReason`
- `nextStep` of `nextCheck`

Nog steeds klein, maar wel expliciet.

#### Route-status als aggregatie
De route-status wordt niet handmatig los beheerd als dat vermijdbaar is.

Aanbevolen aggregatieregels:
- geen acties -> `open verzoek`
- minstens een open actie -> `in uitvoering`
- acties met reviewdruk -> `reviewbaar`
- alle relevante acties afgerond -> `afgerond`
- route bewust beeindigd -> `gestopt`

Dus:
- de route-status blijft echt
- maar rust op canonieke aggregatieregels

#### Route-overzicht als projectie
Het overzicht toont geen ruwe actie-truth, maar een compacte projectie zoals:
- aantal open acties
- eerstvolgend reviewmoment
- dichtstbijzijnde aandachtspunt
- laatste betekenisvolle actie-uitkomst

#### Detail leest direct uit actie- en reviewlagen
De detailpagina projecteert rijker:
- actiecards uit action truth
- reviewinfo per actie uit review truth
- routecontext uit route truth

Zo blijven:
- overzicht compact
- detail rijk
- en beide consistent

### Grenzen om complexiteit te bewaken
Guardrails voor deze fase:
- geen subtasks
- geen dependency graphs
- geen generieke auditlog voor elke actie-edit
- geen tientallen actiestatussen
- geen brede workflow per actie

Dus:
- canonieke waarheid, ja
- workflow-explosie, nee

### Succescriteria
Deze fase is geslaagd als:
- een route meerdere acties netjes kan dragen
- elke actie zelfstandig reviewbaar is
- de route-status logisch uit die acties volgt
- overzicht en detail uit dezelfde waarheid projecteren
- de UX licht genoeg blijft voor managers

### Ontwerpkeuze
De aanbevolen productvorm voor deze fase is:
- route container
- lichte actiecards
- review per actie
- compacte routebrede samenvatting

Niet:
- full task-board stijl
- themaclusters als primaire uitvoerstructuur

Dat houdt Action Center eenvoudig in gebruik, maar inhoudelijk sterk genoeg voor echte lokale opvolging.
