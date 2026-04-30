# Action Center Route Closeout

## Doel
Deze fase maakt Action Center bestuurlijk completer door boven de actiecards een echte route-afsluitlaag toe te voegen.

De vorige fase maakte mogelijk:
- meerdere acties binnen een afdelingsroute
- review per actie
- route-overzicht op basis van actie-aggregatie

Maar dat is nog niet genoeg voor nette bestuurlijke afronding.

Het doel van deze fase is:
- routes niet alleen uitvoerbaar en reviewbaar maken
- maar ook expliciet afsluitbaar

Dus:
- acties vertellen hoe het traject liep
- route-closeout vertelt wanneer het traject bestuurlijk klaar is

## Productgrens
Wel in scope:
- route-status tijdens lopende opvolging
- expliciete route-closeout boven de actieset
- HR mag een route bestuurlijk afsluiten
- duidelijke prioriteit tussen actie-aggregatie en closeout
- route-overzicht en detail tonen beide dezelfde afsluitwaarheid

Niet in scope:
- complexe heropen-workflows
- meerdere route-closeout-types met governance-lagen
- brede escalatie-workflows
- extra managergovernance buiten de bestaande opvolgrol

Dus:
- een kleine maar harde bestuurlijke sluitlaag
- geen zware workflowmachine

## Kernonderscheid
Deze fase maakt expliciet onderscheid tussen twee lagen:

### 1. Lopende voortgang
Dit blijft afgeleid uit de actieset.

Daarmee bedoelen we:
- lopen er acties
- wachten acties op review
- is er nog actieve follow-through

Dat levert live statussen zoals:
- `open-verzoek`
- `in-uitvoering`
- `reviewbaar`

### 2. Expliciete route-afsluiting
Dit is geen afleiding, maar een bestuurlijk besluit dat de route nu sluit.

Bijvoorbeeld:
- `afgerond`
- `gestopt`

Dat betekent:
- de route hoeft niet eindeloos open te blijven door oude actiehistorie
- HR kan het traject bewust afronden
- de historie blijft bestaan, maar de route krijgt een helder slot

## Vorm van Route-Closeout
De route krijgt een kleine canonieke closeout-laag.

Niet groot, niet workflowachtig, maar expliciet genoeg om een bestuurlijk einde vast te leggen.

Minimaal:
- `routeId`
- `closeoutStatus`
- `closeoutReason`
- `closeoutNote`
- `closedAt`
- `closedByRole`

Dat is genoeg om te weten:
- hoe deze route is geeindigd
- vanuit welke bestuurlijke grond
- waarom ongeveer
- wanneer
- op welk niveau dat besluit viel

### CloseoutStatus
De set blijft bewust klein:
- `afgerond`
- `gestopt`

#### `afgerond`
Gebruik je als:
- dit traject heeft voldoende follow-through gehad
- voor nu is dit bestuurlijk klaar
- verdere actie is nu niet nodig

#### `gestopt`
Gebruik je als:
- we beeindigen dit traject bewust
- niet omdat het succesvol rond is
- maar omdat we hier niet verder op doorgaan

Niet nodig in deze fase:
- `gepauzeerd`
- `uitgesteld`
- `geescaleerd`
- `overgedragen`

### CloseoutReason
Naast de brede eindstatus is een kleine canonieke redenlaag nodig, zodat closeout niet volledig op vrije notitie leunt.

De redenlaag blijft bewust klein.

Bij `afgerond`:
- `voldoende-opgepakt`
- `effect-voldoende-zichtbaar`
- `geen-verdere-opvolging-nodig`

Bij `gestopt`:
- `geen-lokale-vervolgstap-nodig`
- `bewust-niet-voortzetten`
- `elders-opgepakt`

Productregel:
- `closeoutReason` is verplicht
- `closeoutNote` blijft optionele of compacte toelichting

Dus:
- `closeoutReason` draagt de stabiele betekenis
- `closeoutNote` geeft korte nuance

### CloseoutNote
`closeoutNote` blijft compact.

Het is geen notulenlaag, maar een korte bestuurlijke samenvatting:
- waarom sluiten we dit nu af

Bijvoorbeeld:
- voldoende opgepakt in teamritme
- effect voorlopig zichtbaar
- geen verdere lokale follow-through nodig
- bewust niet verder voortgezet

### ClosedAt
`closedAt` legt het bestuurlijke sluitmoment vast.

Dat is belangrijk voor:
- historie
- overzicht
- latere interpretatie van oude routes

### ClosedByRole
De eerste actorlaag blijft klein:
- `hr`
- `manager`

In deze fase moet `hr` in elk geval canoniek zijn, omdat HR expliciet een route mag afsluiten.

## Prioriteit en Aggregatieregels
De route leest uit twee semantische lagen:
- `action aggregation`
- `route closeout`

Die mogen niet naast elkaar concurreren. Er moet een vaste prioriteitsregel zijn.

### Hoofdregel
De canonieke volgorde wordt:

1. als er een expliciete `route closeout` is, wint die
2. anders bepaalt `action aggregation` de live route-status

Dus:
- closeout sluit het traject bestuurlijk af
- aggregatie bestuurt alleen open routes

### Aggregatie voor open routes
Zolang er geen closeout is, blijft de route-status afgeleid uit de actieset.

De live route-statussen blijven dan:
- `open-verzoek`
- `in-uitvoering`
- `reviewbaar`

Prioriteit binnen open routes:

1. `reviewbaar`
2. `in-uitvoering`
3. `open-verzoek`

#### `reviewbaar`
Zodra minstens een actie:
- in review staat
- of vandaag of te laat gereviewd moet worden

dan wint `reviewbaar`.

#### `in-uitvoering`
Als er wel acties lopen, maar niets direct reviewbaar is, dan is de route `in-uitvoering`.

#### `open-verzoek`
Als de route wel bestaat, maar nog geen echte acties draagt, dan blijft hij `open-verzoek`.

### Expliciete closeout overschrijft die live status
Zodra `closeoutStatus` bestaat:

- `afgerond` overschrijft de open status
- `gestopt` overschrijft de open status

Dan maakt het niet meer uit dat er:
- nog oude open acties in historie hangen
- of oude reviewdata bestonden

De route is dan bestuurlijk gesloten.

### Historie blijft zichtbaar
Closeout verwijdert de actie- of reviewgeschiedenis niet.

Dus na closeout zie je nog steeds:
- welke acties er liepen
- welke reviews plaatsvonden
- wat de laatste uitkomsten waren

Maar de bovenste routelezing wordt:
- dit traject is nu afgesloten

### Gemengde situaties
Deze fase moet expliciet omgaan met gemengde routes.

#### Voorbeeld 1
- een actie `in_review`
- een actie `open`

Route zonder closeout:
- `reviewbaar`

#### Voorbeeld 2
- een actie `afgerond`
- een actie `gestopt`
- een actie `open`

Route zonder closeout:
- `in-uitvoering`

#### Voorbeeld 3
- alle acties `afgerond`
- geen closeout

Aanbevolen uitkomst:
- nog steeds niet automatisch `afgerond`
- route wordt wel `klaar-voor-closeout`

De route blijft bestuurlijk open tot closeout expliciet gebeurt.

Waarom:
- anders maak je bestuurlijke afsluiting weer impliciet
- terwijl deze fase juist expliciete closeout invoert

#### Voorbeeld 4
- open acties bestaan nog
- HR zet route op `afgerond`

Canonieke uitkomst:
- route toont `afgerond`

Acties blijven historisch zichtbaar, maar route-closeout wint.

### Klaar voor closeout
Om te voorkomen dat routes bestuurlijk open blijven hangen terwijl ze inhoudelijk klaar voelen, krijgt deze fase een lichte attentionregel:
- `klaar-voor-closeout`

Dit is geen extra route-status en ook geen aparte workflowstap.
Het is een routebrede attentiesignalering die alleen zichtbaar wordt op open routes.

Mijn aanbeveling:
- een open route is `klaar-voor-closeout` zodra alle bestaande acties `afgerond` of `gestopt` zijn
- en er geen actie meer `open` of `in_review` is
- en er geen reviewmoment meer vandaag of te laat openstaat

Dus:
- route blijft formeel open
- maar overview en detail mogen duidelijk laten zien dat bestuurlijke afsluiting logisch is

Deze signalering moet licht blijven:
- een badge
- een compacte prompt
- of een samenvattende callout voor HR

Niet:
- een extra wizard
- een verplichte workflowstap
- een escalatielaag

## Overzicht en Detail met Route-Closeout

### Overview blijft compact
De overviewkaart schrijft niet alle afsluitdetails vol uit.

Hij moet vooral duidelijk maken:
- is deze route nog actief
- vraagt hij review
- of is hij bestuurlijk gesloten

Dus op overview wil je vooral:
- live status of closeout-status
- eventueel laatste reviewmoment
- compacte actie- en reviewsamenvatting
- en bij gesloten routes een helder eindlabel

Voor open routes die inhoudelijk klaar zijn maar nog niet gesloten:
- toon een lichte `klaar voor closeout`-aanduiding
- vooral voor HR-view
- zonder dat de kaart al als `afgerond` leest

### Gesloten routes moeten direct anders aanvoelen
Een route met closeout moet visueel en semantisch direct anders lezen dan een open route.

Dus:
- `afgerond` voelt als klaar voor nu
- `gestopt` voelt als bewust beeindigd

Niet alleen als klein statuspilltje, maar als duidelijke bovenliggende routelezing.

### Detail toont traject en slot
Op detail moet je twee dingen tegelijk kunnen zien.

#### A. Hoe liep deze route
- welke acties waren er
- welke reviews waren er
- wat kwam daaruit

#### B. Waarom is hij nu dicht
- closeout-status
- closeout-note
- gesloten op datum
- gesloten door rol

De detailroute blijft:
- rijk genoeg om het traject te begrijpen
- compact genoeg om geen dossieradministratie te worden

### Closeout-panel als aparte laag
Toon route-closeout als een aparte samenvattende laag boven of naast de actiecards.

Niet begraven in de actiehistorie.

Bijvoorbeeld als compact paneel:
- `Route afgesloten`
- status
- korte toelichting
- datum
- rol

Dat maakt meteen duidelijk:
- actiehistorie is context
- closeout is het bestuurlijke slot

### Open routes tonen geen leeg closeout-blok
Bij open routes toon je deze laag niet als vol blok.

Hooguit impliciet:
- nog open
- nog reviewbaar
- nog in uitvoering

Uitzondering:
- als de route `klaar-voor-closeout` is, mag een lichte samenvattende prompt zichtbaar zijn
- bijvoorbeeld dat deze route inhoudelijk klaar lijkt voor bestuurlijke afsluiting

Dus:
- geen lege closeoutpanelen
- geen "nog niet afgesloten"-ruis

### Actiecards blijven zichtbaar na closeout
Gesloten route betekent niet dat actiecards verdwijnen.

Ze blijven zichtbaar als historie, maar met andere lezing:
- niet meer `wat moet nu`
- maar `wat is hier gedaan en hoe is dit afgesloten`

## Architectuur, Truth en Write-Path

### Route-closeout wordt een eigen canonieke truth-laag
Deze fase moet closeout niet als losse UI-state of afgeleide badge modelleren.

Er moet een kleine canonieke route-closeout truth komen.

Minimaal:
- `routeId`
- `closeoutStatus`
- `closeoutReason`
- `closeoutNote`
- `closedAt`
- `closedByRole`

Dus:
- niet afgeleid uit een combinatie van actie-eindes
- maar een expliciet vastgelegde bestuurlijke laag

### Route-closeout hoort op routeniveau
Acties mogen:
- open zijn
- in review staan
- afgerond zijn
- gestopt zijn

Maar dat zegt nog niet automatisch:
- de hele route is bestuurlijk klaar

Dus closeout hoort expliciet:
- boven de acties
- op route- of container-niveau

### Write-path
Omdat HR expliciet een route mag afsluiten, moet de write-path in deze fase primair HR-gedragen zijn.

Aanbevolen richting:
- `HR / Verisight` krijgt de eerste write-surface
- manager-closeout hoeft in deze fase nog niet leidend te zijn
- managers blijven vooral op actie- en reviewlaag werken

Dus:
- closeout is eerst een kleine admin- of HR-handeling
- niet meteen brede gedeelde interactie

### Read-path
De read-path wordt simpel:

#### Open route
- geen closeout-record
- status komt uit actie-aggregatie
- aandachtssignalering kan wel `klaar-voor-closeout` tonen

#### Gesloten route
- closeout-record aanwezig
- closeout-status wint van actie-aggregatie

### Projectieregel
De UI mag niet zelf verzinnen of een route dicht voelt.

Projectie moet altijd zijn:
1. check closeout-truth
2. als aanwezig: toon closeout-status
3. anders: toon geaggregeerde open status uit acties
4. toon daarnaast optioneel `klaar-voor-closeout` als attentielaag op open routes

Dat geldt voor:
- overview
- detail
- manager-view
- HR-view

### Historie en closeout blijven gescheiden
Closeout zelf is geen vervanging van actie- en reviewhistorie.

Dus:
- actie- en reviewdata blijven hun eigen truth
- closeout voegt alleen het bestuurlijke einde toe
- `klaar-voor-closeout` blijft afgeleide attentielaag, geen nieuwe canonieke eindstatus

Dat voorkomt dat de closeout-laag opnieuw te veel wil vertellen.

## Succescriteria
Deze fase is geslaagd als:
- een route expliciet kan worden afgesloten
- die afsluiting canoniek en gedeeld is
- de bestuurlijke grond van closeout niet alleen in vrije notitie zit
- overview en detail dezelfde sluitwaarheid tonen
- actiehistorie intact blijft
- open routes nog steeds puur uit actie-aggregatie leven
- inhoudelijk afgeronde open routes zichtbaar `klaar voor closeout` kunnen zijn zonder extra workflowzwaarte

## Niet Nu
Bewust nog niet in deze fase:
- heropen-redenen
- brede manager-closeout flows
- complexere eindstatussen
- escalatie- of overdrachtspaden
- route-closeout gekoppeld aan extra governanceformulieren

De fase moet klein blijven:
- bestuurlijk sterker
- niet procedureel zwaarder
