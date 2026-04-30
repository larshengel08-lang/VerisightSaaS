## Action Center Limited Manager Interaction

### Doel
Deze fase introduceert de eerste echte managerinteractie in Action Center, maar houdt die bewust klein.

De kern:
- dashboard of rapport signaleert waar iets bestuurlijk aandacht vraagt
- HR opent een route door een manager toe te wijzen
- de manager ziet die route direct als open verzoek
- de manager activeert de route inhoudelijk door één of meer acties toe te voegen
- review volgt pas nadat er een concrete manageractie bestaat

Dit maakt de HR -> manager-overdracht expliciet, zonder dat Action Center een takenapp wordt.

### Productgrens
Wel:
- HR opent een department-scoped route via manager-toewijzing
- managers zien open verzoeken direct in Action Center
- managers kunnen één of meer routegebonden acties toevoegen
- elke actie gebruikt een klein, verplicht actieframe
- review blijft bestaan, maar toetst nu concrete acties in plaats van alleen routecopy

Niet:
- HR kiest thema of actie-inhoud
- managers openen of stoppen routes zelfstandig
- vrije thema-definitie
- subtaken, checklists, dependencies, actieborden
- brede reviewworkflow of zware governanceformulieren

### Lifecycle
#### 1. Signaalfase
Dashboard of rapport laat zien dat iets bestuurlijk aandacht vraagt.

#### 2. HR-open
HR opent de route door:
- lokale context of afdeling te kiezen
- een manager toe te wijzen

HR bepaalt hier nog niet de eerste actie-inhoud.

#### 3. Open verzoek
De route wordt direct zichtbaar voor de toegewezen manager in Action Center.

Betekenis:
- de overdracht is gedaan
- de route bestaat al
- er is nog geen eerste manageractie

#### 4. Manager activeert
De manager voegt één of meer acties toe binnen de route.

De route voelt inhoudelijk pas echt actief zodra minstens één manageractie bestaat.

#### 5. Review
Review toetst daarna:
- wat is gedaan
- wat zagen we terug
- wat betekent dat voor vervolg of besluit

### Route-First, Actions-Inside
De route blijft de primaire managementeenheid.

Manageracties leven binnen de route:
- geen losse taakfeed buiten routecontext
- geen aparte inboxmodule naast Action Center

Meerdere acties mogen bestaan, maar blijven compact:
- geen subacties
- geen parallelle mini-workflows
- geen route-overstijgende persoonlijke to-do's

### Manageractieframe
Elke manageractie draagt minimaal:
- `themeKey`
- `actionText`
- `reviewScheduledFor`
- `expectedEffect`

#### ThemeKey
- verplichte keuze uit vaste productthema's
- geen vrije tekst
- één actie koppelt aan één thema

#### ActionText
- leest als concrete managementhandeling
- geen observatie, statuslabel of abstract voornemen

#### ReviewScheduledFor
- klein maar expliciet toetsmoment
- genoeg om vervolg en review aan de actie te hangen

#### ExpectedEffect
- beschrijft wat de actie zichtbaar of duidelijker moet maken
- effecttaal, niet taaltaal voor extra werk

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

#### Nieuwe action truth
Er komt een kleine canonieke manager-action-laag bij met minimaal:
- `actionId`
- `routeId`
- `themeKey`
- `actionText`
- `reviewScheduledFor`
- `expectedEffect`
- `createdAt`
- `updatedAt`
- een kleine actieve statuslaag

Deze action truth is routegebonden en vervangt de route niet als hoofdeenheid.

### Activatieregel
Een HR-geopende route mag bestaan zonder actie.

Canonieke regel:
- `HR opent`
- `manager activeert`

Dat betekent:
- de route is zichtbaar vanaf toewijzing
- de route wordt pas `in-uitvoering` zodra minstens één manageractie bestaat

### Thema-keuze
HR kiest geen thema.

De manager kiest het thema pas bij het maken van de actie, uit vaste productthema's.

Dat houdt de verdeling scherp:
- HR bepaalt scope en eigenaarschap
- manager bepaalt de eerste concrete interventie
- product bewaakt canonieke themagroepen

### Review na manageractie
Review hangt in deze fase inhoudelijk aan bestaande manageracties.

Dat betekent:
- geen volwaardig reviewmoment zonder concrete actie
- review kijkt terug op een echte interventie
- decision history en result progression worden daardoor inhoudelijk sterker

### Succescriteria
Geslaagd als:
- HR eenvoudig een route kan overdragen via manager-toewijzing
- managers open verzoeken direct zien in Action Center
- managers een route met een klein actieframe kunnen activeren
- review daarna teruggrijpt op concrete acties
- Action Center rijker voelt zonder takenapp-gedrag
