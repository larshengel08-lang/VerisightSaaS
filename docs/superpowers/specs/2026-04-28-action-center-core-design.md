# Action Center Core Design

Date: 2026-04-28
Scope: Ingelogde Verisight suite, specifiek de volgende semantische verdiepingsslag binnen Action Center
Status: Draft spec based on approved direction in conversation

## 1. Doel

Deze fase maakt Action Center inhoudelijk sterker zonder het product interactief zwaarder te maken.

De focus ligt daarom niet op nieuwe invoer, extra managerbediening of bredere workflowlagen, maar op een veel sterkere route-presentatie voor HR en managers.

De productvolgorde in deze fase is:

1. reviewbetekenis
2. actietaal
3. resultaattaal
4. afsluitlogica

Dat betekent concreet:
- routes moeten beter uitleggen waarom review plaatsvindt
- routes moeten concreter maken wat nu de eerste stap is
- routes moeten compacter laten voelen wat een opvolging heeft opgeleverd
- routes moeten duidelijker eindigen in `afgerond` of `gestopt`

## 2. Productgrens

Deze fase verandert Action Center niet in een zwaarder invoerproduct.

Dus nadrukkelijk niet in scope:
- extra managerformulieren
- nieuwe verplichte velden
- nieuwe review- of actie-invoerflows
- extra statussen buiten de bestaande route-statuslaag
- bredere governance- of case-managementlogica

Deze fase werkt met:
- canonieke projectie
- sterkere samenvatting
- scherpere detailpresentatie
- betere gedeelde taal

De hoofdregel blijft:
- meer betekenis
- niet meer bediening

## 3. Gewenst eindbeeld

Na deze fase moet een route in Action Center veel sneller voelbaar maken:
- waarom deze route aandacht kreeg
- wat nu de concrete eerste stap is
- wie hier eigenaar van is
- wat bij review getoetst wordt
- wat de laatste reviewbeslissing was
- wat er geprobeerd is
- wat dat terugliet zien
- of de route is afgerond of bewust gestopt

Voor HR betekent dit:
- betere managementkwaliteit per route
- minder interpretatie van losse tekstvelden
- sneller zien of een route inhoudelijk sterk genoeg is

Voor managers betekent dit:
- minder abstracte routecopy
- duidelijkere betekenis van review
- serieuzer gevoel zonder extra invoerlast

## 4. Hoofdaanpak

De juiste aanpak voor deze fase is `semantics-first`.

We verbeteren niet alleen copy binnen bestaande velden. We introduceren een kleine canonieke semantische projectielaag die de bestaande routewaarheid vertaalt naar vier productlagen:

1. review semantiek
2. actieframe
3. mini-resultaatlus
4. afsluitsamenvatting

De UI spreekt daarna vanuit die gedeelde projectie, niet vanuit losse veldinterpretatie per surface.

## 5. Kleine Canonieke Review-semantiek

### 5.1 Doel

Review moet in Action Center niet langer vooral als datum voelen, maar als managementmoment.

In deze fase krijgt elke route daarom een kleine canonieke review-semantiek met drie zichtbare onderdelen:
- `reviewReason`
- `reviewQuestion`
- `reviewOutcome`

### 5.2 Betekenis

`reviewReason`
- waarom dit reviewmoment logisch is
- bijvoorbeeld: omdat een eerste gesprek moet zijn gevoerd, omdat een lokale correctie tijd nodig heeft, of omdat het effect pas na een bepaald ritme zichtbaar kan worden

`reviewQuestion`
- wat we bij het reviewmoment toetsen
- bijvoorbeeld: of het eerste gesprek bevestiging gaf, of de frictie lokaal kleiner werd, of vervolg nodig is

`reviewOutcome`
- wat de laatste reviewbeslissing was
- deze gebruikt de canonieke outcome-taal uit het routecontract

### 5.3 Zichtbaarheid

Deze review-semantiek landt:
- volledig op route-detail
- compact samengevat op landing/overzicht

De landingslaag blijft rustig. Daar tonen we alleen een compacte review-read, geen uitgebreide uitlegblokken.

### 5.4 Canonieke waarden

Deze fase gebruikt dezelfde compacte `reviewOutcome`-laag als in het routecontract:
- `geen-uitkomst`
- `doorgaan`
- `bijstellen`
- `afronden`
- `stoppen`

In deze fase wordt `opschalen` nog niet actief zichtbaar gemaakt als afsluit- of route-uitkomst in de UI, ook al kan die latere productlaag bestaan in het masterplan.

## 6. Klein Canoniek Actieframe

### 6.1 Doel

Routes moeten niet alleen logisch voelen, maar ook meteen bruikbaar zijn.

Daarom krijgt elke route in deze fase een klein canoniek actieframe met vier delen:
- `waaromNu`
- `eersteStap`
- `eigenaar`
- `verwachtEffect`

### 6.2 Betekenis

`waaromNu`
- de directe aanleiding voor deze opvolging
- compact, concreet en managementgericht

`eersteStap`
- de eerstvolgende kleine interventie
- niet als abstract thema, maar als uitvoerbare stap

`eigenaar`
- wie deze stap trekt
- geen extra eigenaarschapsmodel, wel scherpere zichtbaarheid

`verwachtEffect`
- wat deze eerste stap idealiter duidelijker of beter maakt bij review

### 6.3 Projectieregel

In deze fase voegen we geen nieuwe invoervelden toe.

De canonieke projectie wordt afgeleid uit bestaande waarheid zoals:
- route title
- summary
- reason
- next step
- owner
- dossier- of route-uitkomstvelden waar relevant

Maar de UI toont die waarheid niet langer als losse platte tekst, alleen nog via dit compacte actieframe.

## 7. Mini-resultaatlus

### 7.1 Doel

Action Center moet voelbaar maken dat opvolging iets oplevert.

In deze fase doen we dat nog klein en compact, via een mini-resultaatlus op route-detail:
- `wat is geprobeerd`
- `wat zagen we terug`
- `wat is besloten`

### 7.2 Productgrens

Dit is nog geen brede effectmeting of historische analyzelaag.

Het doel is:
- de laatste betekenisvolle voortgang zichtbaar maken
- de route minder als logboek en meer als managementverhaal laten voelen

### 7.3 Zichtbaarheid

De mini-resultaatlus verschijnt:
- op route-detail als compacte samenvattingslaag
- niet als groot historieblok op de landing

Landing mag hooguit impliciet samenvatten dat er een recente reviewuitkomst of voortgang is, maar niet de hele lus uitspreiden.

## 8. Kleine Afsluitlogica

### 8.1 Doel

Routes moeten duidelijker kunnen eindigen zonder dat we al een zwaardere governance-laag toevoegen.

In deze fase beperken we de afsluitlogica bewust tot:
- `afgerond`
- `gestopt`

### 8.2 Betekenis

`afgerond`
- deze opvolging heeft zijn doel bereikt of is voldoende afgerond voor nu

`gestopt`
- deze opvolging wordt bewust niet verder doorgezet

### 8.3 Waarom nog klein houden

We nemen in deze fase bewust nog niet mee:
- opgeschaald
- geborgd maar monitoren
- opgesplitste closeout-varianten

Dat hoort pas in een latere verdieping als de kernsemantiek stevig staat.

## 9. Surface-verdeling

### 9.1 Action Center landing

Landing blijft rustig.

Landing toont alleen compacte samenvattingen van:
- reviewstatus
- eigenaar
- eerste stap
- laatste zichtbare route-uitkomst

Maar landing wordt niet de plek voor volledige detailsemantiek.

### 9.2 Route-detail

Route-detail wordt de primaire drager van deze fase.

Hier landen:
- de volledige reviewbetekenis
- het compacte actieframe
- de mini-resultaatlus
- de kleine afsluitlogica

Route-detail moet daardoor aanvoelen als:
- serieuzer
- duidelijker
- managementmatiger

zonder interactief zwaarder te worden.

## 10. Persona-impact

### 10.1 HR

HR moet in deze fase sneller kunnen zien:
- waarom review gepland is
- wat precies de eerste stap is
- of een route inhoudelijk sterk genoeg is geformuleerd
- of de laatste voortgang echt betekenis heeft
- of een route afgerond of gestopt is

### 10.2 Manager

Managers moeten in deze fase sneller begrijpen:
- waarom dit nu speelt
- wat ze concreet geacht worden te doen
- wat bij review centraal staat
- wat de meest recente uitkomst was

Zonder:
- extra klikken
- extra registratie
- extra bedieningscomplexiteit

## 11. Canonieke Projectieregels

Om lokale UI-interpretatie te voorkomen, moet deze fase werken met een gedeelde projectielaag.

Die projectielaag mag:
- bestaande route truth
- bestaande owner truth
- bestaande review truth
- bestaande route updates
- bestaande outcome truth

gebruiken om de vier nieuwe presentatielagen te bouwen:
- review semantiek
- actieframe
- resultaatlus
- afsluitsamenvatting

Wat niet mag:
- per tab of per component losse afleidregels verzinnen
- reviewbetekenis in de landing anders interpreteren dan in detail
- actietaal per surface opnieuw formuleren zonder canonieke projectie

## 12. UX-risicos

De belangrijkste risicos in deze fase zijn:

1. Te veel nieuwe tekst tegelijk
- dan voelt de route zwaarder in plaats van duidelijker

2. Reviewbetekenis wordt alsnog te vaag
- dan krijgen we alleen mooiere copy in plaats van echte managementsemantiek

3. Resultaatlus groeit uit tot logboek
- dan verliezen we rust

4. Afsluitlogica wordt stiekem te rijk
- dan sluipt governancecomplexiteit te vroeg binnen

## 13. Visuele Regel Voor Deze Fase

Je hoeft niet te wachten met alle visuele aanpassingen aan Action Center tot deze hele lijn is afgewerkt.

De juiste regel is:

Wel ok in deze fase:
- spacing-polish
- typografische rust
- alignment
- hitareas
- kleine copy-polish
- compactere en helderdere presentatielagen

Nog even terughoudend mee zijn:
- grote visuele hertekening van route-detail
- structurele redesign van reviewblokken
- grote nieuwe informatie-architectuur binnen Action Center

Reden:
de semantische kern van review, actie, resultaat en afsluiting moet eerst stabiel zijn, anders ontwerpen we dezelfde UI twee keer.

Kort:
- micro-polish: ja
- grotere structurele visual redesign van Action Center core: nog even niet

## 14. Succescriteria

Deze fase is geslaagd als:

1. reviewmomenten managementmatiger voelen
- niet alleen `wanneer`, maar ook `waarom` en `wat toetsen we`

2. routes concreter leesbaar worden
- met een duidelijk eerste stap, eigenaar en verwacht effect

3. detailroutes meer resultaatgevoel geven
- via een compacte mini-resultaatlus

4. routes duidelijker kunnen eindigen
- met een klein maar helder verschil tussen `afgerond` en `gestopt`

5. managers geen extra invoerdruk ervaren

6. HR meer inhoudelijke grip ervaart zonder extra bedieningslast

## 15. Eerstvolgende Implementatieslag

De eerstvolgende bouwstap na deze spec moet een begrensde `Action Center Core V1`-implementatie zijn met:

1. een kleine canonieke reviewprojectie
2. een klein canoniek actieframe
3. een compacte resultaatprojectie
4. een kleine afsluitsamenvatting
5. detail-first UI-integratie
6. alleen compacte landing-samenvatting

Nog niet:
- manager-inputflows
- nieuwe route-editing
- bredere review-workflow
- rijkere afsluittypes
