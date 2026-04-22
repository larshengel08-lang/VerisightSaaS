# Report Structure Canon

## Status

Status: canoniek reporting structure document.

This file is the primary source of truth for report grammar, page families, recipe positioning and appendix boundaries.

## Korte samenvatting

Dit document legt de vaste report grammar van Verisight vast. Die grammar beschrijft de verplichte managementleesorde, het onderscheid tussen hoofdrapport en appendix, de paginafamilies en de regels voor verplichte, optionele en appendixlagen. ExitScan is de eerste volledig uitgewerkte recipe binnen deze grammar. RetentieScan is de target recipe binnen dezelfde grammar, maar wordt niet naar een rigide identieke structuur geforceerd.

## Doel

Het doel van deze canon is:

- een gedeelde report grammar vastleggen zonder productspecifieke recipes plat te slaan
- expliciet maken welke lagen in het hoofdrapport horen en welke in de appendix
- borgen dat ExitScan eerst volledig scherp wordt uitgewerkt
- RetentieScan meenemen als gedeelde grammar-target zonder recipe-dwang
- voorkomen dat visual governance of rendererlogica de architectuur vroegtijdig overneemt

## Huidige baseline of canon

De structurele canon vertrekt vanuit:

- de actuele ExitScan-flow in `docs/examples/voorbeeldrapport_verisight.pdf`
- de actuele RetentieScan-flow in `docs/examples/voorbeeldrapport_retentiescan.pdf`
- de target grammar in `v3 rapport architectuur.txt`
- de reporting-plannen in `docs/active`

De vaste canon is dus geen uniforme paginatelling voor alle producten. De vaste canon is wel een uniforme leesgrammatica met herkenbare paginafamilies, laaggrenzen en intent.

## Belangrijkste beslissingen

- Dezelfde gedeelde grammar geldt waar mogelijk voor alle Verisight-rapporten.
- Productspecifieke recipes mogen verschillen waar productlogica of trustlogica dat vraagt.
- Hoofdrapport en appendix blijven structureel gescheiden.
- Executive read blijft leidend voor het hoofdrapport.
- Appendix blijft de expliciete plek voor technische diepte, banddefinities, factorbasis en uitgebreide methodiek.
- ExitScan is de eerste volledig genormaliseerde recipe.
- RetentieScan blijft target recipe binnen dezelfde grammar, maar hoeft niet dezelfde paginering of dezelfde layer-splitsing te krijgen.

## Structuur / regels

### Hoofdrapport versus appendix

Het hoofdrapport draagt altijd:

- managementcontext
- executive handoff
- kernsignalen
- prioriteiten
- eerste route naar actie
- compacte methodische leesdiscipline

De appendix draagt altijd:

- technische verantwoording
- expliciete methodische nuance
- onderliggende model- en factorlogica
- conditionele segmentverdieping als drempels dat toelaten

### Vaste paginafamilies

De gedeelde report grammar bestaat uit deze paginafamilies:

1. `Cover / context`
2. `Read quality / response`
3. `Executive handoff`
4. `Score and signal interpretation`
5. `Signal synthesis`
6. `Drivers and priorities`
7. `Underlying method layer in main report`
8. `Route and action`
9. `Compact method guide`
10. `Technical appendix`

### Section intent per paginafamilie

`Cover / context`
- opent rustig en management-first
- zet product, periode, client en rapportstatus neer
- is geen technische of scorepagina

`Read quality / response`
- toont hoe stevig de leesbasis is
- helpt duiden hoe voorzichtig of stevig het rapport gelezen moet worden
- mag als aparte pagina of als compacte bovenlaag in een executive pagina landen

`Executive handoff`
- vertaalt het rapport naar bestuurlijke taal
- antwoordt op: wat springt eruit, waarom telt het, wat eerst doen, wat niet concluderen

`Score and signal interpretation`
- legt uit hoe een centrale samenvattende score of banding gelezen moet worden
- maakt trustgrenzen en gebruiksgrenzen expliciet
- voorkomt dat een score als zelfstandige waarheid gaat lezen

`Signal synthesis`
- bundelt hoofdredenen, meespelende factoren, surveyvoices en eerdere signalering tot een managementverhaal
- is synthese, geen technische score-uitleg

`Drivers and priorities`
- maakt zichtbaar welke factoren relatief lager worden ervaren en bestuurlijk meer vervolg vragen
- verbindt score, signaal en managementprioriteit

`Underlying method layer in main report`
- toont de methodische onderlaag die voor managementlezing nog relevant moet blijven
- kan bestaan uit SDT, organisatiefactoren of een andere productpassende onderlaag
- blijft compact en leesbaar

`Route and action`
- maakt eerste route, eigenaar, eerste stap en reviewmoment expliciet
- is de enige laag waar eigenaarschap en eerste route expliciet samenkomen

`Compact method guide`
- legt uit wat het product is, wat het niet is, welke drempels gelden en hoe de score gelezen moet worden
- houdt het executive verhaal intact

`Technical appendix`
- bevat technische verantwoording
- ligt buiten het executive verhaal

### Analytische pagina's openen in gewone taal

Analytische pagina's zoals `Score and signal interpretation`, `Signal synthesis`, `Drivers and priorities` en `Underlying method layer in main report` openen verplicht met een korte plain-language orienter.

Verplichte volgorde:

1. `Wat zie je hier`
2. `Hoe lees je dit`
3. `Waarom is dit belangrijk`

Regels:

- een analytische pagina mag niet openen met alleen een score, chart, factoroverzicht of technische kop
- de orienter moet in gewone managementtaal uitleggen wat de pagina toevoegt
- de orienter mag compact zijn, maar mag inhoudelijk niet ontbreken

### Managementleesbaarheid zonder methodologische erosie

Analytische pagina's moeten managementleesbaar zijn zonder methodologische erosie.

Regels:

- gewone taal opent de leesrichting
- methodische precisie blijft inhoudelijk behouden
- technische detailuitleg schuift naar methodiek of appendix zodra die de eerste managementlezing vertraagt
- score-, synthese- en driverpagina's moeten expliciet maken wat je hier wel en niet zelfstandig uit mag afleiden

### Disclaimerdosering in de hoofdflow

Trustgrenzen en non-claims blijven verplicht, maar worden compacter in de hoofdflow en vollediger in methodiek of appendix.

Regels:

- hoofdflow gebruikt korte functionele non-claims dicht bij zichtbare score of signaallaag
- analytische pagina's vermijden defensieve overdosering van nuance in de eerste leesrichting
- technische claimgrenzen, thresholds en verdere methodische beperkingen verschuiven naar `Compact method guide` en `Technical appendix`

### Wat verplicht is

Deze families zijn verplicht in de gedeelde grammar:

- `Cover / context`
- `Executive handoff`
- `Drivers and priorities`
- `Route and action`
- `Compact method guide`
- `Technical appendix`

### Wat conditioneel verplicht is

Deze families zijn verplicht zodra het product of de data daarom vraagt:

- `Read quality / response`
- `Score and signal interpretation`
- `Signal synthesis`
- `Underlying method layer in main report`

Regel:

- als een product een centrale score, banding of responsebasis gebruikt in de managementlezing, moet die laag expliciet leesbaar zijn
- een conditioneel verplichte laag mag worden samengevoegd met een aangrenzende familie, maar mag inhoudelijk niet verdwijnen

### Wat optioneel is

Deze families of uitbreidingen zijn optioneel:

- segment deep dive in appendix
- extra contextblokken zoals eerdere signalering, mits data aanwezig is
- productspecifieke verdieping die de hoofdgrammar niet ondergraaft

### Wat appendix is

Appendix is:

- technische verantwoording
- uitgebreide SDT-uitleg
- item- en factorbasis
- werkfactorsignaal-logica
- banddefinities
- segmentanalyse bij voldoende n

Appendix is niet:

- een alternatief hoofdrapport
- een plek om managementkernbesluiten te verstoppen

## Productspecifieke verschillen

### ExitScan recipe

ExitScan is de eerste volledig uitgewerkte recipe binnen de gedeelde grammar en gebruikt de volgende hoofdflow:

1. `P1 Cover`
2. `P2 Respons`
3. `P3 Bestuurlijke handoff`
4. `P4 Frictiescore & verdeling van het vertrekbeeld`
5. `P5 Signalen in samenhang`
6. `P6 Drivers & prioriteitenbeeld`
7. `P7 SDT Basisbehoeften`
8. `P8 Organisatiefactoren`
9. `P9 Eerste route & actie`
10. `P10 Methodiek / leeswijzer`
11. `Appendix B Technische verantwoording`

Conditioneel:

- `Appendix A Segment deep dive` alleen bij voldoende drempel

ExitScan-regel:

- deze recipe is voor ExitScan leidend en wordt niet teruggeduwd naar een generieke verkorte flow
- ExitScan geldt nu als actieve baseline voor de gedeelde reporting grammar; verdere rendererwijzigingen zijn bugfix-only tenzij de canon zelf verandert

### RetentieScan recipe

RetentieScan wordt vanaf deze stap gemigreerd naar een expliciete product-specifieke recipe binnen dezelfde grammar. Die recipe erft dezelfde master families en leeslaag, maar kopieert ExitScan niet pagina-voor-pagina. De actieve targetflow is:

1. `P1 Cover`
2. `P2 Respons`
3. `P3 Bestuurlijke handoff`
4. `P4 Retentiesignaal / groepsduiding`
5. `P5 Signalen in samenhang`
6. `P6 Drivers & prioriteitenbeeld`
7. `P7 Onderliggende laag / explanatory layer`
8. `P8 Organisatiefactoren / factor layer`
9. `P9 Eerste route & actie`
10. `P10 Methodiek / leeswijzer`
11. `Appendix B Technische verantwoording`

Conditioneel:

- `Appendix A Segment deep dive`
- productspecifieke extra main-report laag alleen als dat trust, vroegsignalering of managementleesbaarheid verbetert zonder de hoofdflow te laten ontsporen

RetentieScan-regel:

- dezelfde grammar geldt waar mogelijk
- RetentieScan bewaart productspecifieke betekenissen zoals retentiesignaal, stay-intent, vertrekintentie, bevlogenheid en vroegsignalering op behoud
- RetentieScan forceert geen ExitScan-termen zoals exitbatch, vertrekbeeld of vertrekduiding waar die inhoudelijk onjuist zijn
- response, bestuurlijke handoff, signaalduiding, synthese, factorlaag, route, leeswijzer en appendix blijven wel als expliciete leeslagen zichtbaar
- RetentieScan geldt nu als actieve baseline naast ExitScan; verdere recipewijzigingen zijn bugfix-only tenzij de canon zelf verandert

## Guardrails

- Behandel de HTML blueprint niet als architectuurbron.
- Gebruik HTML en CSS pas in de latere visual governance layer.
- Maak in deze stap geen renderer- of template-implementatie.
- Gebruik de grammar om recipes te normaliseren, niet om alle producten identiek te maken.
- Laat management-first lezen de volgorde bepalen.
- Laat methodische nuance zichtbaar blijven zonder het executive verhaal te breken.
- Laat appendix expliciet de plek voor technische diepte blijven.
- Open analytische pagina's altijd in gewone taal voordat technische nuance volgt.
- Gebruik geen diagnose, causale claims of individuele predictorframing in structurele sectie-intent.

## Implementatienoot

Implementatievolgorde:

1. structurele regels voor analytische page-openings en disclaimerdosering vastleggen
2. daarna recipe-copy op ExitScan, RetentieScan en dashboardlagen aanpassen aan deze regels

Wat later pas in recipe/copy wordt aangepast:

- concrete orienter-copy per analytische pagina
- productspecifieke voorbeeldzinnen en managementintro's

Wat nadrukkelijk niet in deze canondelta zit:

- rendererherbouw
- visueel redesign
- nieuwe productspecifieke methodiek

## Acceptance

Deze structuurcanon is geldig als:

- hoofdrapport en appendix scherp gescheiden zijn
- verplichte, conditionele en optionele families expliciet zijn benoemd
- ExitScan als eerste volledig uitgewerkte recipe herkenbaar beschermd is
- RetentieScan binnen dezelfde grammar gepositioneerd is zonder recipe-dwang
- de grammar aansluit op de voorbeeldrapporten, de v3 architectuur en de bestaande reporting-plannen

## Assumptions / defaults

- Waar een product een laag compacter combineert, blijft de inhoudelijke functie van die laag verplicht.
- ExitScan houdt voorlopig de meest expliciete recipe-splitsing en fungeert daarom als eerste normalization reference.
- RetentieScan mag voorlopig compacter blijven zolang de gedeelde grammar en methodische grenzen herkenbaar zijn.
- Nieuwe rapportvarianten moeten eerst op deze grammar gemapt worden voordat visual governance of rendererwerk wordt gestart.
