## Action Center Limited Manager Interaction

### Doel
Deze fase introduceert de eerste echte managerinteractie in Action Center, maar houdt die bewust kleiner dan "actie ontwerpen".

De kern:
- dashboard of rapport signaleert waar iets bestuurlijk aandacht vraagt
- HR opent een route door een manager toe te wijzen
- de manager ziet die route direct als open verzoek
- de manager reageert eerst licht op de route
- pas waar nodig concretiseert die reactie tot een primaire manageractie
- review blijft mogelijk, ook wanneer de eerste reactie vooral begrenzend, bevestigend of observerend is

Dit maakt de HR -> manager-overdracht expliciet, zonder dat Action Center een takenapp of mini-interventietool wordt.

### Productgrens
Wel:
- HR opent een department-scoped route via manager-toewijzing
- managers zien open verzoeken direct in Action Center
- managers geven een beperkte eerste route-reactie
- managers kunnen waar nodig een primaire routeactie vastleggen
- review blijft bestaan als bounded follow-through, niet alleen als actie-evaluatie

Niet:
- HR kiest thema of volledige interventie-inhoud
- managers openen of stoppen routes zelfstandig
- vrije thema-definitie
- meerdere parallelle manageracties in deze fase
- subtaken, checklists, dependencies, actieborden
- brede reviewworkflow of zware governanceformulieren

### Lifecycle
#### 1. Signaalfase
Dashboard of rapport laat zien dat iets bestuurlijk aandacht vraagt.

#### 2. HR-open
HR opent de route door:
- lokale context of afdeling te kiezen
- een manager toe te wijzen

HR bepaalt hier nog niet de eerste lokale interventie.

#### 3. Open verzoek
De route wordt direct zichtbaar voor de toegewezen manager in Action Center.

Betekenis:
- de overdracht is gedaan
- de route bestaat al
- er is nog geen primaire managerreactie vastgelegd

#### 4. Eerste managerreactie
De manager start niet met een groot actie-ontwerp, maar met een kleine route-reactie.

Die reactie mag in deze fase zijn:
- `bevestigen`
- `aanscherpen`
- `inplannen`
- `begrenzen`

Concreet betekent dat:
- een voorgestelde vervolgstap bevestigen
- een voorgestelde stap beperkt aanpassen
- een reviewmoment accepteren of verschuiven
- expliciet markeren dat eerst bestaand overleg, observatie of bounded follow-through passend is

#### 5. Primaire manageractie
Alleen als de route een echte lokale interventie vraagt, legt de manager een primaire routeactie vast.

Die actie activeert de route inhoudelijk als uitvoeringsroute.

#### 6. Review
Review blijft daarna mogelijk op:
- een primaire manageractie
- of een lichtere eerste route-reactie

Dus review hangt niet alleen af van expliciete actie-creatie.

### Route-first, reaction-inside
De route blijft de primaire managementeenheid.

De eerste managerhandeling is in deze fase geen losse taak, maar een beperkte reactie binnen de route.

Dat voorkomt twee fouten:
- de manager wordt te snel ontwerper van het hele traject
- Action Center schuift te snel richting takenapp

### Eerste managerreactiemodel
De manager start vanuit een klein route-reactiemodel in plaats van een pure `action create`-handeling.

Het model moet ruimte geven voor:
- bevestigen van een voorgestelde route-invulling
- beperkte aanscherping
- reviewmoment plannen of verschuiven
- bounded no-action / watch state
- eerst bespreken in bestaand overleg

Pas wanneer lokale interventie echt nodig is, groeit die reactie door naar een primaire manageractie.

### Primaire manageractie
Als een expliciete actie nodig is, blijft die in deze fase klein.

Er is maximaal een primaire manageractie per route.

Dat houdt de semantiek helder:
- review weet op welke actie hij primair teruggrijpt
- result progression weet welke actie leidend is
- abandonment, completion en voortgang hoeven niet over meerdere losse actie-objecten verdeeld te worden

### Manageractieframe
De primaire manageractie draagt minimaal:
- `themeKey`
- `actionText`
- `reviewScheduledFor`
- `expectedEffect`

#### ThemeKey
- verplichte keuze uit vaste productthema's
- geen vrije tekst
- het product blijft eigenaar van de themagroepen

#### ActionText
- leest als concrete managementhandeling
- geen observatie, statuslabel of abstract voornemen

#### ReviewScheduledFor
- klein maar expliciet toetsmoment
- genoeg om bounded follow-through te dragen

#### ExpectedEffect
- beschrijft wat de stap zichtbaar of duidelijker moet maken
- effecttaal, niet extra taaltaal voor werk

### SMART-achtige kwaliteitsregel
Het actieframe gebruikt lichte SMART-discipline waar mogelijk:
- specifiek genoeg om uitvoerbaar te zijn
- tijdgebonden genoeg voor review
- resultaatgericht genoeg om vervolg te toetsen

Niet in scope:
- aparte SMART-score
- verplicht veld per letter
- zwaar formulier

### Canonieke truth
#### Route truth blijft leidend
Een route blijft canoniek dragen:
- scope
- manager-eigenaar
- route-status
- review- en beslislagen

#### Nieuwe manager-response truth
Er komt eerst een kleine canonieke manager-response-laag bij met minimaal:
- `responseId`
- `routeId`
- `responseType`
- `themeKey` optioneel zolang nog geen primaire actie nodig is
- `reviewScheduledFor`
- `note` of beperkte aanscherping
- `createdAt`
- `updatedAt`

`responseType` blijft klein en canoniek, bijvoorbeeld:
- `confirm`
- `sharpen`
- `schedule`
- `watch`

Deze laag beschrijft de eerste bounded reactie van de manager op het open verzoek.

#### Primaire manager-action truth
Alleen waar een echte interventie nodig is, ontstaat daarnaast een primaire manager-action-laag met:
- `actionId`
- `routeId`
- `themeKey`
- `actionText`
- `reviewScheduledFor`
- `expectedEffect`
- `createdAt`
- `updatedAt`
- een kleine actieve statuslaag

### Activatieregel
Een HR-geopende route mag bestaan zonder actie.

Canonieke regel:
- `HR opent`
- `manager reageert`
- alleen waar nodig `manager activeert met primaire actie`

Dat betekent:
- de route is zichtbaar vanaf toewijzing
- de route kan semantisch al in bounded follow-through zitten zonder primaire actie
- de route wordt pas expliciet uitvoeringsgericht zodra een primaire manageractie bestaat

### Thema-keuze
HR kiest geen thema.

De manager kiest een thema pas wanneer hij een primaire manageractie vastlegt, uit vaste productthema's.

Bij een lichte eerste reactie zonder echte actie hoeft thema nog niet verplicht leidend te zijn.

Dat houdt de verdeling scherp:
- HR bepaalt scope en eigenaarschap
- manager reageert licht
- manager kiest pas een thema als een concrete lokale actie echt nodig is

### Review na eerste reactie
Review hangt in deze fase niet exclusief af van een expliciete manageractie.

Review moet ook betekenisvol kunnen zijn bij:
- korte bevestiging
- observatie
- bounded no-action / watch state
- eerst bespreken in bestaand overleg

Dus:
- review kan een primaire manageractie toetsen
- maar kan ook een begrensde eerste route-reactie evalueren

Dat voorkomt dat de productlogica te interventiegedreven wordt.

### Succescriteria
Geslaagd als:
- HR eenvoudig een route kan overdragen via manager-toewijzing
- managers open verzoeken direct zien in Action Center
- managers eerst licht kunnen reageren zonder meteen een volledige interventie te ontwerpen
- maximaal een primaire manageractie de route semantisch activeert waar nodig
- review betekenisvol blijft bij actie en bounded no-action follow-through
- Action Center rijker voelt zonder takenapp-gedrag
