# Report Methodology Canon

## Status

Status: canoniek reporting methodology document.

This file is authoritative for methodology reading layers, non-claims, score-versus-signaal discipline and methodology placement between main report and appendix.

## Korte samenvatting

Dit document legt de rapportspecifieke methodologische leeslaag van Verisight vast. De kernregel is dat methodiek zichtbaar moet blijven om trust, interpretatiegrenzen en scoreduiding te beschermen, maar dat de methodiek het executive verhaal niet mag overnemen. De hoofdlaag draagt compacte leesregels en productspecifieke non-claims. De appendix draagt de technische diepte.

## Doel

Het doel van deze canon is:

- vastleggen welke methodische leeslaag in het hoofdrapport zichtbaar moet blijven
- expliciet maken wat naar appendix moet
- score-uitleg, drempels en interpretatiegrenzen stabiliseren
- de SDT-laag, item- en factorbasis en werkfactorsignaal-logica consistent positioneren
- voorkomen dat methodische nuance verdwijnt of juist het executive verhaal verdringt

## Huidige baseline of canon

De methodologiecanon vertrekt vanuit:

- `docs/reference/METHODOLOGY.md`
- de methodiek- en appendixlagen in de voorbeeldrapporten van ExitScan en RetentieScan
- de guardrails uit de actieve reporting-plannen
- de layer-intent uit `v3 rapport architectuur.txt`

De canon beschrijft dus niet de volledige wetenschappelijke onderbouwing. De canon beschrijft hoe die methodiek rapportmatig gelezen, begrensd en geplaatst moet worden.

## Belangrijkste beslissingen

- Methodiek blijft zichtbaar in het hoofdrapport als leesdiscipline, non-claim en score-uitleg.
- Er geldt één methodologische waarheid met drie expliciete leesniveaus: methodologische kern, management reading layer en technical accountability layer.
- Terminology governance is een bindend onderdeel van de methodologische laag en wordt vastgelegd in `docs/reporting/TERMINOLOGY_GOVERNANCE_CANON.md`.
- Technische diepte blijft in de appendix.
- SDT blijft een onderliggende psychologische laag, niet een concurrerend hoofdscorespoor.
- De item- en factorbasis blijft compact, pragmatisch en managementgericht beschreven; niet als volledige academische schaalclaim.
- Werkfactorsignaal-logica blijft een managementvertaling van samenkomende factoren en niet een bewijs van causaliteit.
- Drempels en interpretatiegrenzen moeten expliciet leesbaar zijn.
- Taal blijft passen bij vertrekduiding, vroegsignalering op behoud, geen diagnose, geen causale claim en geen individuele predictor.

## Structuur / regels

### Drie leesniveaus

Verisight rapporteert vanuit één onderliggende methodologische waarheid met drie expliciete leesniveaus:

1. `Methodologische kern`
   - definities
   - scorelogica
   - banding
   - interpretatiegrenzen
   - privacy- en reportinggrenzen
   - verboden claims
2. `Management reading layer`
   - gewone taal
   - bestuurlijke leesbaarheid
   - wat zie je hier
   - hoe lees je dit
   - waarom is dit belangrijk
   - wat moet management hiermee doen
   - wat mag je hier niet uit concluderen
3. `Technical accountability layer`
   - compacte technische verantwoording
   - thresholds
   - gewichten
   - minimum n-regels
   - methodische nuance
   - appendix- en methodiekgeschikte uitleg

Regel:

- deze drie niveaus zijn geen drie methodieken, maar drie gecontroleerde leeslagen bovenop één canonieke methodologische kern

### Terminology governance

`docs/reporting/TERMINOLOGY_GOVERNANCE_CANON.md` is de bindende termbron voor zichtbare producttaal in report, dashboard, website/product pages, sample output en commerciële messaging.

Regels:

- de canonieke methodeterm blijft inhoudelijk leidend
- per kanaal mogen alleen de goedgekeurde managementterm, UI-variant of commerciële variant uit de termmap worden gebruikt
- code- en datamodeltermen zijn implementatietermen en zijn niet automatisch zichtbare producttaal
- lokale copy, dashboardlabels en commerciële copy mogen geen eigen terminologie introduceren buiten de termmap

### Score versus signaal

Een `score` is een benoemde, afgebakende samenvattende maat met een vaste schaal of vaste numerieke lezing. Een `signaal` is een bestuurlijk leesbare indicatie van aandacht, richting of patroon die altijd context nodig houdt.

Regels:

- gebruik `score` alleen waar een schaalmatige samenvatting echt centraal staat
- gebruik `signaal` waar bestuurlijke aandacht, interpretatie en context belangrijker zijn dan numerieke precisie
- gebruik score en signaal niet als vrije synoniemen voor hetzelfde begrip
- `Frictiescore` blijft in ExitScan een score
- `Retentiesignaal` blijft in RetentieScan een signaal

### Code/datamodeltermen versus zichtbare taal

Code- en datamodeltermen mogen intern technisch blijven bestaan, maar zijn niet automatisch normatief voor zichtbare taal.

Regels:

- taalgovernance verplicht niet dat bestaande interne veldnamen, analytics-termen of codevariabelen direct worden hernoemd
- zodra een interne term zichtbaar wordt in report, dashboard, site of commerciële copy, moet die eerst worden vertaald naar een goedgekeurde zichtbare kanaalterm uit de termmap
- voorbeeld:
  - `stay_intent` mag intern als code- of datamodelterm blijven bestaan
  - zichtbare taal gebruikt standaard niet `stay-intent`, maar de goedgekeurde zichtbare variant per kanaal

### Methodologische leeslaag in het hoofdrapport

Het hoofdrapport moet methodisch zichtbaar maken:

- hoe de score gelezen moet worden
- wat het product wel is
- wat het product niet is
- welke privacy- en rapportagedrempels gelden
- welke interpretatiegrenzen gelden
- welke methodische onderlaag nog relevant is voor managementduiding

Deze zichtbaarheid moet landen via:

- `Hoe lees je dit?`
- `Waarom dit ertoe doet`
- korte trust- of non-claim-zinnen
- een compacte methodiek / leeswijzer

### Wat in het hoofdrapport hoort

In het hoofdrapport hoort:

- score-uitleg in gewone managementtaal
- banding als lees- en prioriteringshulp
- compacte bestuurlijke uitleg van wat een score of signaal samenvat, wat het wel betekent en wat het niet betekent
- drempels voor detail, patroonanalyse en segmentatie
- productscope en niet-scope
- compacte uitleg van relevante onderlagen zoals SDT of organisatiefactoren wanneer dat nodig is om de managementlezing eerlijk te houden
- compacte trust- en non-claim-zinnen waar de zichtbare score, signaallaag of analytische lezing dat vraagt

### Wat in de appendix hoort

In de appendix hoort:

- volledige SDT-plaatsing als onderliggende laag
- item- en factorbasis
- gewichten, bijdragen of andere technische componenten waar relevant
- samengestelde werkfactorsignaal-logica
- banddefinities en technische leesregels
- technische provenance en verdere methodische nuance
- thresholds, gewichten en minimum n-regels die niet nodig zijn voor de eerste managementlezing
- uitgebreidere claimgrenzen en technische beperkingen die de hoofdflow onnodig zouden vertragen

### SDT-laag

SDT blijft de onderliggende psychologische laag van Verisight:

- autonomie
- competentie
- verbondenheid

Rapportregel:

- SDT mag in het hoofdrapport zichtbaar zijn als verklarende onderlaag
- SDT mag niet lezen als los concurrerend product of als zelfstandige diagnose
- waar SDT in het hoofdrapport zichtbaar blijft, moet kort uitgelegd worden hoe die laag gelezen moet worden

### Item- en factorbasis

De item- en factorbasis wordt rapportmatig zo gelezen:

- de vraagblokken zijn compact en pragmatisch aangepast voor managementrapportage
- de factorlagen leunen inhoudelijk op literatuur en praktijklogica
- de factoren zijn geen volledige academische schaalafnames

Rapportregel:

- hoofdrapport: compact uitleggen dat factoren verkorte managementblokken zijn
- appendix: explicieter tonen hoe die factorbasis is opgebouwd

### Samengestelde werkfactorsignaal-logica

De werkfactorsignaal-logica wordt rapportmatig zo gelezen:

- factoren komen samen in een compacte managementsamenvatting
- banding helpt ordenen, prioriteren en bespreken
- de uitkomst is een signaal van aandacht, geen bewijs van oorzaak, effect of individuele uitkomst

Rapportregel:

- hoofdrapport: managementuitleg geven over wat signaal en banding betekenen
- appendix: expliciet maken hoe de logica is opgebouwd

### Middenbanden bestuurlijk uitleggen

Middenbanden, en in het bijzonder `Eerst toetsen`, mogen niet alleen technisch worden benoemd. Ze moeten ook bestuurlijk worden uitgelegd.

Regels:

- leg in het hoofdrapport uit waarom een patroon in een middenband kan landen
- leg in het hoofdrapport uit wat management met die middenband moet doen
- maak expliciet dat `Eerst toetsen` geen restcategorie is, maar een bestuurlijke leesuitkomst die om verificatie, context en duiding vraagt
- verschuif technische banddetails, thresholds en verdere nuance naar methodiek of appendix

### Score-uitleg

ExitScan:

- de `Frictiescore` is een interne managementsamenvatting van ervaren werkfrictie rondom vertrek
- gebruik de score altijd samen met vertrekredenen, topfactoren en werkgerelateerde patronen
- de score is geen causaliteitsclaim, externe benchmark of voorspelling

RetentieScan:

- het `Retentiesignaal` is een samenvattend groepssignaal op een schaal van 1 tot 10
- gebruik het signaal altijd samen met factoren, banding, intentie om te blijven, vertrekintentie en context
- het signaal is geen individuele voorspeller, geen brede MTO en geen bewijs van causaliteit

### Drempels

De volgende drempels moeten rapportmatig zichtbaar blijven:

- detailweergave vanaf minimaal `5` responses
- patroonanalyse vanaf minimaal `10` responses
- segmenten alleen bij voldoende n; anders verbergen

Signaalbanden ExitScan:

- `< 4.5` laag frictiesignaal
- `4.5 - 7.0` gemengd beeld
- `>= 7.0` sterk signaal van ervaren werkfrictie

Signaalbanden RetentieScan:

- `< 4.5` laag aandachtssignaal
- `4.5 - 7.0` verhoogd aandachtssignaal
- `>= 7.0` sterk aandachtssignaal

Regel:

- deze banden zijn lees- en gesprekshulp, geen statistische significantiegrenzen en geen individuele classificaties

### Interpretatiegrenzen

Verplichte interpretatiegrenzen in alle rapporten:

- geen diagnose
- geen causale claim
- geen individuele predictor
- geen sluitend bewijsdocument
- geen externe benchmarkframing tenzij expliciet gevalideerd en toegevoegd aan de canon

Productspecifiek:

- ExitScan leest percepties in exitcontext en blijft gevoelig voor retrospectieve bias
- RetentieScan blijft een vroegsignalerend groepsinstrument en geen bewezen voorspelmodel van vrijwillig vertrek

### Hoe nuance zichtbaar moet zijn zonder het executive verhaal te verstoren

Gebruik hiervoor deze rapportregel:

- executive pagina's dragen korte leesregels en non-claims
- scorepagina's leggen de score compact uit waar de score zelf zichtbaar is
- drivers- en synthese-pagina's dragen een korte `Hoe lees je dit?` en `Waarom dit ertoe doet`
- de compacte methodiekpagina borgt trust, scope en drempels
- de appendix draagt alle technische diepte die niet nodig is voor de eerste managementlezing
- hoofdrapport houdt gewone-taaldefinitie, leesinstructie en bestuurlijke betekenis dicht bij de zichtbare score of signaallaag
- methodiek en appendix dragen thresholds, gewichten, minimum n-regels, technische banddefinities en uitgebreidere claimsgrenzen

## Productspecifieke verschillen

### ExitScan

- Methodiektaal moet passen bij terugkijkende vertrekduiding.
- De methodische grens moet expliciet maken dat vertrekcontext geen diagnose of causale zekerheid oplevert.
- SDT, organisatiefactoren en werkfrictie mogen zichtbaar zijn, maar blijven managementinput en geen diagnostische waarheid.

### RetentieScan

- Methodiektaal moet passen bij vroegsignalering op behoud.
- Het retentiesignaal blijft verification-first en groepsgericht.
- Stay-intent, vertrekintentie, bevlogenheid en topfactoren blijven aanvullende signalen en geen individuele predictoren.

## Guardrails

- Laat methodiek niet verdwijnen uit het hoofdrapport.
- Laat methodiek het executive verhaal ook niet overnemen.
- Behandel appendix als expliciete technische verdieping.
- Houd score-uitleg en trustgrenzen altijd dicht bij de zichtbare score of zichtbare signaallaag.
- Gebruik in zichtbare taal alleen termen die zijn goedgekeurd in `TERMINOLOGY_GOVERNANCE_CANON.md`.
- Gebruik geen taal die diagnose, causaliteit of individuele voorspelling suggereert.
- Gebruik de HTML blueprint niet als methodologische bron.

## Implementatienoot

Implementatievolgorde:

1. methodologische canon hardenen met drie leesniveaus en terminology governance
2. report- en dashboardtermen alignen op de bindende termmap
3. daarna lokale recipe-copy en latere website/product messaging aanpassen

Wat later pas in recipe/copy wordt aangepast:

- lokale introcopy op analytische pagina's
- vervanging van te interne termen in hoofdflow en dashboardlabels
- productspecifieke voorbeeldzinnen en microcopy

Wat nadrukkelijk niet in deze canondelta zit:

- rendererherbouw
- visueel redesign
- nieuwe productspecifieke methodiek

## Acceptance

Deze methodologiecanon is bruikbaar als:

- score-uitleg, drempels en interpretatiegrenzen expliciet zijn vastgelegd
- SDT-laag, item- en factorbasis en werkfactorsignaal-logica duidelijk gescheiden maar verbonden zijn
- hoofdrapport en appendix elk hun eigen methodische rol hebben
- ExitScan- en RetentieScan-taal dezelfde claimsgrenzen delen maar productspecifiek blijven
- methodische nuance zichtbaar blijft zonder het executive verhaal te verstoren

## Assumptions / defaults

- `METHODOLOGY.md` blijft de leidende inhoudelijke referentie voor gedeelde claimsgrenzen en drempels.
- Voor rapportgebruik telt managementleesbaarheid eerst, zolang trust en methodische eerlijkheid behouden blijven.
- Waar detail ontbreekt in het hoofdrapport, moet de appendix die nuance dragen.
- Nieuwe reporting-besluiten moeten deze methodologische leeslaag respecteren voordat visual governance of rendererwerk wordt uitgewerkt.
