# Verisight UI Review Canon

Doel: zichtbare pagina's consistent reviewen en aanscherpen zonder drift tussen schermen.

Dit document is de vaste beoordelingsstandaard voor handmatige review en autonome polish-passes.

## 1. Kernprincipe

We reviewen geen losse pagina's op smaak.

We reviewen elke zichtbare pagina op:
- rol van de pagina
- leesvolgorde
- informatiedichtheid
- visuele hiërarchie
- kleurrol
- kadergewicht

Eerst de canon, daarna pas de pagina.

## 2. Paginatypen

Elke zichtbare pagina hoort in exact één van deze types.

### A. Overview / cockpit

Doel:
- snel zien wat aandacht vraagt
- direct begrijpen waar eerst gekeken moet worden
- routes en status kunnen filteren zonder ruis

Mag zijn:
- overzichtslaag
- cockpit
- managementstartpunt

Mag niet zijn:
- metrics-wall
- tweede action center
- productshowroom

### B. Route-detail / scanread

Doel:
- inhoud begrijpen
- prioriteren
- patroon en bewijs zien

Mag zijn:
- management read
- dashboard-first samenvatting
- bewijslaag

Mag niet zijn:
- pdf in app-kader
- commitmentlaag
- eigenaar/actie/review-pagina

### C. Action / opvolging

Doel:
- acties organiseren
- keuzes vastleggen
- opvolging zichtbaar maken

Mag zijn:
- commitmentlaag
- reviewlaag
- actie- en eigenaarslaag

Mag niet zijn:
- brede analysepagina
- tweede overview

### D. Publieke commerciële pagina

Doel:
- probleem scherp maken
- keuze vergemakkelijken
- eerste bewijs leveren

Mag zijn:
- belofte
- keuzehulp
- beslispagina

Mag niet zijn:
- dashboard-kloon
- productcatalogus zonder hiërarchie

## 3. Vaste review-assen

Elke pagina krijgt review op exact deze 5 assen.

### 1. Volgorde

Vraag:
- klopt de leesvolgorde van boven naar beneden
- staat het belangrijkste echt eerst

Groen:
- boven de vouw is duidelijk
- primaire en secundaire lagen zijn logisch

Rood:
- de gebruiker moet eerst zoeken
- bewijs komt pas na conclusie
- utility komt voor kerninhoud

### 2. Intuïtiviteit

Vraag:
- snap je in 3 tot 5 seconden waar je bent en wat eerst telt

Groen:
- paginatitel is helder
- eerstvolgende stap is logisch
- labels helpen echt

Rood:
- scherm legt te veel uit
- filters of subnavigatie concurreren met de kop
- betekenis van cijfers of blokken is niet direct duidelijk

### 3. Informatiedichtheid

Vraag:
- staat er te veel tegelijk op de pagina

Groen:
- één primaire leeslaag
- bewijs compact en scanbaar
- secundaire context staat echt lager

Rood:
- te veel kaarten tegelijk
- te veel copy boven de vouw
- meerdere blokken voelen even belangrijk

### 4. Kleurrol

Vraag:
- klopt de functie van kleur, of concurreert kleur onnodig

Verisight-standaard:
- navy / inkt = basis voor headlines, body, trust, structuur
- oranje = primair merkaccent, primaire CTA, ExitScan
- teal = RetentieScan en rustige ondersteunende UI
- statuskleuren = lichter en functioneler dan merkaccenten

Groen:
- kleur stuurt
- kleur verduidelijkt producthiërarchie

Rood:
- trust lijkt op RetentieScan
- te veel accenten op headline-niveau
- utility voelt te belangrijk door kleur

### 5. Kadergewicht

Vraag:
- zijn er te veel kaarten, borders of visuele dozen

Groen:
- kaders alleen waar ze structuur of focus geven
- spacing en typografie dragen de hiërarchie

Rood:
- nested cards
- te veel gelijke blokken
- een pagina voelt als card soup

## 4. Vaste UI-regels

Deze regels gelden productbreed tenzij een pagina bewust een andere rol heeft.

### Hiërarchie

- Maximaal 1 echt dominante zone boven de vouw.
- De pagina moet een primaire, secundaire en utilitylaag hebben.
- Als twee blokken even hard voelen, is er een hiërarchieprobleem.

### Copy

- Geen em dashes.
- Geen uitlegzin als een label en één zin genoeg zijn.
- Geen managementwoorden zonder concrete betekenis.
- Conclusie nooit zonder zichtbaar bewijs direct ernaast of eronder.

### Kleur

- Oranje niet breed uitrollen buiten merkaccent, primaire CTA en ExitScan.
- Teal niet laten concurreren met trust of generieke statuslagen.
- Utility-elementen altijd stiller dan kernroutes.

### Kaders

- Geen nested cards.
- Geen side-stripe accenten.
- Geen drie gelijke highlightkaarten als hetzelfde ook als lijst kan.
- Als een blok alleen informatie bevat, eerst proberen zonder eigen kader.

### Navigatie

- Linkernavigatie is altijd module- of overzichtsniveau.
- Contentheader noemt het specifieke item.
- Rail mag nooit detailniveau simuleren.

## 5. Canon per paginatype

### Overview / cockpit canon

Boven de vouw hoort:
- paginakop
- korte contextregel
- filterlaag of statuslaag
- eerste duidelijke prioriteitslaag

Niet boven de vouw:
- lange uitleg
- meerdere concurrerende highlightblokken
- mini-action-center

### Route-detail / scanread canon

Boven de vouw hoort:
- page header
- harde leescontext indien relevant
- dominante handoff / kernbeeld

Vroeg op de pagina:
- bewijslaag
- topfactoren / kernsignalen
- synthese in compacte vorm

Later op de pagina:
- verdiepingslagen
- methodiek
- secundaire context

Niet op deze pagina:
- eigenaar
- eerste actie
- reviewmoment
- commitmenttaal

### Action / opvolging canon

Boven de vouw hoort:
- open prioriteiten
- acties
- review- en eigenaarsinformatie

Niet nodig:
- brede duidingslaag die al op overview of routepagina staat

### Publieke commerciële pagina canon

Boven de vouw hoort:
- probleem
- belofte
- duidelijke primaire CTA

Later:
- bewijs
- keuzehulp
- verdiepende secties

Niet doen:
- meerdere concurrerende CTA-logica's
- productcatalogus zonder hoofdroute

## 6. Toegestane review-uitkomsten

Per onderdeel mag de uitkomst alleen zijn:
- `houden`
- `verlagen`
- `verwijderen`
- `verplaatsen`
- `verduidelijken`

Niet als review-uitkomst:
- volledige heruitvinding zonder noodzaak
- nieuwe productlogica
- nieuwe commitmentlaag buiten Action Center

## 7. Vast reviewformat per pagina

Gebruik per pagina exact dit format:

### Pagina
- naam / route
- paginatype
- doel van de pagina

### Bevindingen
- `Volgorde`
- `Intuïtiviteit`
- `Informatiedichtheid`
- `Kleurrol`
- `Kadergewicht`

### Oordeel per onderdeel
- houden
- verlagen
- verwijderen
- verplaatsen
- verduidelijken

### Risico op inconsistentie
- wat raakt dit ook op andere pagina's

### Aanbevolen doorvoering
- de kleinste consistente wijziging

## 8. Sweep-volgorde

Gebruik altijd deze volgorde voor productreviews:

1. globale shell
2. dashboard overview / cockpit
3. route-detailpagina's
4. action center
5. publieke commerciële pagina's

Reden:
- eerst navigatie en shell
- dan overview
- dan onderliggende detailhiërarchie
- dan pas commerciële buitenlaag

## 9. Huidige Verisight focuspunten

Bij toekomstige sweeps extra scherp letten op:
- te veel kaders in dashboard- en routepagina's
- oranje en teal die te vaak samen concurreren
- utilityblokken die te veel hoofdgewicht krijgen
- copy die te snel interpreteert zonder bewijs
- commitmentlogica die teruglekt buiten Action Center

## 10. Praktische beslissingregel

Als twijfel ontstaat:

1. wat is de rol van deze pagina
2. wat moet de gebruiker hier als eerste begrijpen
3. welk blok helpt daar echt bij
4. alles wat daar niet direct aan bijdraagt wordt stiller, later of weg
