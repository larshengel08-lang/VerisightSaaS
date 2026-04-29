# Action Center Decision History Design

Date: 2026-04-29
Scope: Ingelogde Verisight suite, volgende schone verdiepingsslag binnen Action Center na Route Contract, HR Bridge, Core V1 en HR demo hardening
Status: Draft spec based on approved direction in conversation

## 1. Doel

Deze fase maakt Action Center inhoudelijk volwassener op drie plekken tegelijk:
- reviewbeslissingen
- actiekwaliteit
- resultaatlus over tijd

Het doel is niet om de module interactiever te maken, maar om hem besluitvaardiger en geloofwaardiger te maken.

Na deze fase moet een route niet alleen zeggen:
- wat speelt hier
- wat doen we nu

maar ook:
- wat is in review besloten
- waarom juist dat
- wat moet daarna opnieuw blijken
- welke stap loopt nu
- welke stap volgt daarna
- hoe ontwikkelt deze route zich over meerdere beslismomenten

## 2. Productgrens

Deze fase blijft bewust begrensd.

Wel in scope:
- kleine canonieke decision-truth
- sterker actiecontract
- compacte decision history
- rijkere read-only presentatie voor HR en managers

Niet in scope:
- extra managerinput
- nieuwe managerformulieren
- brede reviewworkflow
- veel nieuwe statussen
- zware governance- of case-managementlagen
- uitgebreide eventtimeline voor alles

De kernregel blijft:
- meer besliskwaliteit
- niet meer bedieningslast

## 3. Gewenst Eindbeeld

Na deze fase moet Action Center-detail veel sterker aanvoelen als:
- een plek waar opvolging niet alleen wordt bijgehouden
- maar waar een route echt bestuurlijk te volgen is

Dat betekent concreet:
- reviewmomenten hebben niet alleen een reden, maar ook een expliciete beslissing
- beslissingen dragen een korte reden en een volgende toets
- acties voelen niet meer als één losse stap, maar als een kleine voortgangslijn
- resultaat leeft niet alleen in de laatste update, maar in een compacte beslisgeschiedenis
- routes voelen daardoor minder als kaarten met tekst en meer als kleine managementdossiers

Voor HR:
- meer grip op kwaliteit van opvolging
- sneller zien of een route inhoudelijk sterk of zwak is
- duidelijker wat al besloten is en wat nog moet blijken

Voor managers:
- nog steeds weinig interactielast
- maar wel veel beter te begrijpen waarom de route eruitziet zoals hij eruitziet

## 4. Hoofdaanpak

De juiste aanpak voor deze fase is `decision-first`.

Dus niet:
- alleen presentatie verrijken
- of direct nieuwe workflowinteractie toevoegen

Maar wel:
1. een kleine canonieke decision-truth toevoegen
2. het actiecontract versterken naar een kleine voortgangslijn
3. een compacte decision history uit die waarheid opbouwen
4. daarna pas detail en landing op die gedeelde laag laten spreken

Dit houdt de stap groot genoeg om productmatig echt iets te veranderen, maar klein genoeg om managers niet te belasten en de module niet in workflowsoftware te laten kantelen.

## 5. Kleine Canonieke Decision-Truth

### 5.1 Doel

Per betekenisvol reviewmoment krijgt een route een kleine canonieke decision-truth met drie onderdelen:
- `decision`
- `decisionReason`
- `nextCheck`

### 5.2 Betekenis

`decision`
- wat is hier bestuurlijk besloten

Compacte set waarden in deze fase:
- `doorgaan`
- `bijstellen`
- `afronden`
- `stoppen`

`decisionReason`
- waarom dit besluit op dit reviewmoment logisch is
- kort, compact en expliciet

`nextCheck`
- wat bij de volgende toets duidelijker, zichtbaar of bevestigd moet zijn

### 5.3 Productregel

Deze laag moet klein blijven:
- één decision per betekenisvol reviewmoment
- één compacte reden
- één compacte vervolgtoets

Niet in deze fase:
- meerdere parallelle beslissingen per review
- uitgebreide reviewnotulen
- actor-specifieke subbesluiten
- brede escalatie- of borgtypes

### 5.4 Relatie met bestaande reviewOutcome

`reviewOutcome` verdwijnt niet direct.

De rolverdeling in deze fase wordt:
- `reviewOutcome` = compacte zichtbare route-uitkomsttaal
- `decision` = expliciet reviewbesluit dat de history voedt

Vaak zullen die dicht bij elkaar liggen, maar ze mogen productmatig niet langer alles in één veld proberen te dragen.

### 5.5 Zichtbaarheid

Op route-detail:
- volledig zichtbaar
- inclusief `decision`, `decisionReason` en `nextCheck`

Op landing:
- alleen compacte samenvatting
- bijvoorbeeld laatste beslissing of eerstvolgende toets

## 6. Sterker Actiecontract

### 6.1 Doel

Reviewbeslissingen moeten gekoppeld worden aan een duidelijkere routevoortgang.

Daarom krijgt elke route in deze fase een compacter maar sterker actiecontract met:
- `currentStep`
- `nextStep`
- `expectedEffect`

### 6.2 Betekenis

`currentStep`
- wat nu feitelijk de actieve werkstap is

`nextStep`
- wat daarna logisch volgt

`expectedEffect`
- wat die stap of stapovergang duidelijker, beter of toetsbaar moet maken

### 6.3 Productregel

Deze laag blijft klein:
- geen tasklists
- geen meerdere parallelle stappen
- geen checklists
- geen projectboard-gedrag

Er is per route steeds:
- één huidige stap
- één volgende stap
- één verwacht effect

### 6.4 Relatie met bestaande waarheid

Deze laag moet voortbouwen op bestaande route- en reviewwaarheid, niet los ernaast ontstaan.

De richting in deze fase is:
- bestaande actievelden blijven input
- `currentStep` en `nextStep` worden nieuwe canonieke route-progressie truth of gedeelde projectie
- `firstStep` uit Core V1 mag opgaan in `currentStep` / `nextStep` en hoeft niet het dominante oppervlak te blijven

## 7. Decision History en Resultaatlus Over Tijd

### 7.1 Doel

Een route moet niet alleen de laatste stand tonen, maar compact laten zien hoe deze zich ontwikkelt.

Niet als volledig logboek, maar als samengevatte reeks van betekenisvolle beslismomenten:
- wat liep
- wat zagen we
- wat besloten we
- wat volgde daarna

### 7.2 Vorm

De juiste vorm in deze fase is een compacte `decision history`, geen brede eventtimeline.

Elke history-entry bevat idealiter:
- `currentStep`
- kernobservatie
- `decision`
- `decisionReason`
- `nextCheck`

### 7.3 Waarom geen ruwe timeline

Een ruwe timeline heeft drie risico's:
- te veel ruis
- te weinig managementbetekenis
- te veel logboekgevoel

Een compacte decision history is beter omdat die:
- samenvat in plaats van ophoopt
- focust op betekenisvolle review- en besluitmomenten
- direct aansluit op HR- en managergebruik

### 7.4 Productgrens

Niet in deze fase:
- onbeperkte event history
- audit log
- uitgebreide notulenlaag
- multi-actor governance feed

Alleen de betekenisvolle beslismomenten worden zichtbaar gemaakt.

## 8. Rollen en Grenzen

### 8.1 Managers blijven read-only

Managers mogen in deze fase:
- rijkere routekwaliteit zien
- beter begrijpen wat is besloten
- beter zien wat nu loopt en wat daarna volgt
- beter zien hoe de route zich ontwikkelt

Managers doen in deze fase nog niet:
- decisions vastleggen
- decision reasons invullen
- next checks vastleggen
- current/next step bewerken
- history aanvullen

### 8.2 HR / Verisight als truth-drager

De nieuwe decision-truth en het sterkere actiecontract mogen in deze fase wel productmatig bestaan, maar worden nog niet manager-gedreven.

De waarheid wordt in deze stap primair:
- intern
- HR-/Verisight-gedragen
- of afgeleid uit bestaande waarheid plus beperkte beheerde invoer

### 8.3 Geen brede reviewworkflow

Niet in deze fase:
- aparte reviewschermen
- reviewwizards
- reviewformulierflows
- multi-step review completion flows

De reviewbeslissing wordt rijker, maar de workflow blijft klein.

## 9. Architectuurprincipe

Deze fase moet opnieuw `semantics-first` zijn.

Dus niet:
- eerst UI-blokken ontwerpen
- daarna kijken hoe ze gevuld worden

Maar:
1. kleine decision-truth
2. sterker actiecontract
3. compacte decision history
4. daarna surface-projectie

De UI mag alleen spreken vanuit die gedeelde laag.

## 10. Canonieke Lagen

De nieuwe productkern bestaat uit drie niveaus:

### 10.1 Review Decision Layer

Per betekenisvol reviewmoment:
- `decision`
- `decisionReason`
- `nextCheck`

### 10.2 Action Progression Layer

Per actieve route:
- `currentStep`
- `nextStep`
- `expectedEffect`

### 10.3 Decision History Layer

Per route:
- compacte reeks van de belangrijkste review-/beslismomenten

Deze drie samen vormen de ruggengraat van deze fase.

## 11. Projectieregels

### 11.1 Gedeelde waarheid

Landing, detail, previewweergave en persona-varianten moeten allemaal projecteren uit dezelfde canonieke lagen.

Niet toegestaan:
- `decisionReason` per surface anders formuleren
- `nextCheck` op detail anders afleiden dan op landing
- `currentStep` op kaartniveau uit andere bron halen dan op detail
- decision history in de ene component uit losse updates bouwen en in de andere uit review-items

### 11.2 Truth versus projectie

Deze fase moet expliciet kiezen:
- wat canonieke truth is
- wat afgeleide presentatielaag is
- wat tijdelijke fallback is

De richting is:
- `decision`, `decisionReason`, `nextCheck` worden kleine canonieke truth
- `currentStep`, `nextStep`, `expectedEffect` worden canonieke route-progressie truth of gedeelde projectie, afhankelijk van de bestaande waarheidslaag
- decision history wordt canoniek opgebouwd uit review-/decision-truth, niet uit willekeurige updates

### 11.3 Gevolg voor bestaande Core V1-semantiek

De bestaande Core V1-semantiek blijft relevant, maar wordt in deze fase opnieuw geordend:
- review-semantiek blijft de leeslaag
- decision-truth wordt de nieuwe bestuurlijke kern
- `whyNow` blijft nuttig als aanleiding
- `firstStep` mag opgaan in `currentStep`
- de mini-resultaatlus wordt deels opgeslokt door decision history

Dus:
- geen parallelle dubbele semantische lagen laten bestaan als ze hetzelfde proberen te zeggen
- wel een gecontroleerde migratie van Core V1-presentatie naar een rijkere decision-first structuur

## 12. Surface-verdeling

### 12.1 Landing

Landing blijft compact.

Toont vooral:
- huidige stap
- laatste beslissing
- eventueel volgende toets in compacte vorm

### 12.2 Detail

Detail draagt de volledige verdieping:
- reviewbeslissing
- besluitreden
- volgende toets
- `currentStep`
- `nextStep`
- `expectedEffect`
- decision history

### 12.3 Managers

Managers zien dezelfde truth, maar in smallere presentatie.
Geen extra bediening.

### 12.4 HR / Verisight

HR en Verisight zien dezelfde truth, maar met rijkere interpretatie en meer zichtbaarheid van kwaliteit en geschiedenis.

## 13. Succescriteria

Deze fase is geslaagd als:

### 13.1 Reviewkwaliteit
- routes tonen niet alleen reviewuitkomst, maar ook een duidelijke beslisreden en vervolgvraag

### 13.2 Actiekwaliteit
- routes maken zichtbaar wat nu loopt en wat daarna volgt
- acties voelen minder statisch en concreter bestuurlijk bruikbaar

### 13.3 Resultaatlus
- een route laat niet alleen de laatste stand zien, maar ook hoe die daar gekomen is

### 13.4 Rust in gebruik
- managers ervaren meer duidelijkheid zonder extra invoerdruk
- HR ervaart meer grip zonder dat het product bureaucratisch voelt

### 13.5 Architectuurkwaliteit
- de nieuwe lagen zijn canoniek en gedeeld
- niet lokaal per surface opgebouwd

## 14. UX-risico's

De belangrijkste risico's in deze fase zijn:

1. Te veel truth toevoegen zonder duidelijke productvorm
- dan voelt het als interne administratie in plaats van productverdieping

2. Decision history wordt toch logboek
- dan verliezen we bestuurlijke scherpte

3. `currentStep` en `nextStep` gaan dezelfde inhoud dragen
- dan voegen we semantisch niets toe

4. `decisionReason` wordt te vrij en te lang
- dan wordt de laag inconsistent en moeilijk herbruikbaar

5. Managers krijgen indirect toch bedieningsverwachting
- dan sluipt interactielast te vroeg binnen

## 15. Visuele Richting Voor Deze Fase

Dezelfde regel als in de vorige Action Center-fase blijft gelden:

Wel ok:
- detailblokken compacter of helderder maken
- betere typografische hiërarchie
- compactere history-presentatie
- rustigere kaartsamenvattingen op landing

Nog terughoudend mee zijn:
- grote structurele redesign van de hele module
- brede informatie-architectuurvervanging
- interactiepatronen die al vooruitlopen op managerinput

Dus:
- semantische verdieping: ja
- grote structurele visual redesign: nog even niet

## 16. Eerstvolgende Implementatieslag

De eerstvolgende bouwstap na deze spec moet:
1. eerst de decision-truth en historylaag neerzetten
2. daarna het actiecontract migreren naar `currentStep` / `nextStep`
3. daarna route-detail op die waarheid laten landen
4. landing pas als compacte tweede projectie meenemen

Nog niet:
- managerinputflows
- nieuwe route-editing voor managers
- brede reviewmodule
- rijkere escalatie- of afsluittypes
