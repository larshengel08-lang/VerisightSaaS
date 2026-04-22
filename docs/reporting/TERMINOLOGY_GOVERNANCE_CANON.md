# Terminology Governance Canon

## Status

Status: canoniek reporting terminology document.

This file is the binding term source for visible reporting language across report, dashboard, website/product pages, sample output and commercial messaging.

## Korte samenvatting

Dit document legt de bindende terminology governance van Verisight vast voor reporting-uitingen. De termmap is de enige leidende bron voor zichtbare producttaal in report, dashboard, website/product pages, sample output en commerciële messaging. De termmap bepaalt per kernterm welke methodeterm canoniek leidend is, welke zichtbare kanaaltermen zijn toegestaan en welke formuleringen vermeden moeten worden.

## Doel

Het doel van deze canon is:

- één bindende termlaag vastleggen bovenop de bestaande methodologische waarheid
- drift voorkomen tussen report, dashboard, website/product pages, sample output en commerciële messaging
- expliciet onderscheiden tussen methodeterm, code/datamodelterm en zichtbare kanaalterm
- managementtaal vereenvoudigen zonder methodische betekenis, interpretatiegrenzen of claimruimte te verliezen
- voorkomen dat lokale recipe-copy, dashboardcopy of commerciële copy een eigen terminologiewereld introduceert

## Bindende status

Deze termmap is bindende governance binnen de actieve Verisight-repo.

- Deze canon is leidend voor zichtbare producttaal in:
  - `report`
  - `dashboard`
  - `website/product pages`
  - `sample output`
  - `commerciële messaging`
- Afwijkingen zijn alleen toegestaan na expliciete canonwijziging.
- Deze termmap is geen handige bijlage of schrijfhulp, maar een normatief governance-instrument.

## Huidige baseline of canon

Deze canon bouwt op:

- `docs/reporting/REPORT_METHODOLOGY_CANON.md`
- `docs/reporting/REPORT_STRUCTURE_CANON.md`
- de bevroren actieve baselines:
  - `docs/examples/voorbeeldrapport_verisight.pdf`
  - `docs/examples/voorbeeldrapport_retentiescan.pdf`
- de actieve repo-brede guardrails rond consistente producttaal, één source of truth en samenhang tussen rapport, dashboard, website en commerciële messaging

## Belangrijkste beslissingen

- De canonieke methodeterm blijft inhoudelijk leidend.
- De code- of datamodelterm is geen zichtbare producttaal tenzij de termmap dat expliciet toestaat.
- Per kanaal mogen alleen goedgekeurde zichtbare varianten worden gebruikt.
- Methodetermen lekken niet automatisch door naar hoofdflow, dashboard UI of websitecopy.
- Commerciële varianten mogen eenvoudiger zijn dan managementtaal, maar mogen de methodische betekenis of claimruimte niet verbreden.
- `Score` en `signaal` zijn geen uitwisselbare woorden en mogen niet vrij door elkaar lopen.
- Kanaalvoorbeelden zijn richtinggevend voor toon, betekenis en begrenzing; lokale copy mag variëren in formulering, maar niet in betekenis, claimruimte of leesfunctie.

## Structuur / regels

### Verplichte veldvolgorde

Elke term in deze canon gebruikt verplicht exact deze veldvolgorde:

1. `Term`
2. `Familie`
3. `Huidig probleem`
4. `Canonieke methodeterm`
5. `Datamodel/code-term`
6. `Zichtbare managementterm`
7. `UI-kortlabel`
8. `Commerciële variant`
9. `Vermijden`
10. `Report-hoofdflow voorbeeld`
11. `Dashboard/UI voorbeeld`
12. `Website/commercieel voorbeeld`

Regel:

- deze veldvolgorde is verplicht voor alle bestaande en nieuwe termen
- termen mogen inhoudelijk worden aangevuld, maar niet in een andere veldstructuur worden vastgelegd

### Kanaalgedrag

De methodeterm blijft canoniek leidend. Per kanaal mag alleen de goedgekeurde managementterm, UI-variant of commerciële variant worden gebruikt.

Regels:

- methodetermen mogen niet automatisch letterlijk doorlekken naar hoofdflow, dashboard UI, websitecopy of commerciële messaging
- zichtbare taal moet altijd uit deze termmap komen
- kanaalteksten mogen eenvoudiger formuleren, maar niet buiten de canonieke betekenis of claimsgrenzen treden

### Methodeterm versus code/datamodelterm

De canonieke methodeterm bepaalt de inhoudelijke betekenis. De code- of datamodelterm is een implementatieterm en is niet automatisch normatief voor zichtbare taal.

Regels:

- taalgovernance verplicht niet dat bestaande interne veldnamen, analytics-termen of codevariabelen direct worden hernoemd
- zodra een interne term zichtbaar wordt in report, dashboard, site of commerciële copy, moet die eerst worden vertaald naar een goedgekeurde zichtbare kanaalterm
- voorbeeld:
  - `stay_intent` mag een code- of datamodelterm blijven
  - zichtbare taal gebruikt standaard niet `stay-intent`, maar de goedgekeurde zichtbare variant per kanaal

### Score versus signaal

Een `score` is een benoemde, afgebakende samenvattende maat met een vaste schaal of vaste numerieke lezing. Een `signaal` is een bestuurlijk leesbare indicatie van aandacht, richting of patroon die altijd context nodig houdt.

Regels:

- `score` wordt alleen gebruikt als een schaalmatige samenvatting echt centraal staat
- `signaal` wordt gebruikt als bestuurlijke aandacht, interpretatie en context belangrijker zijn dan numerieke precisie
- score en signaal mogen niet willekeurig als synoniemen voor hetzelfde begrip worden ingezet

Niet toegestaan:

- `Retentiesignaal` als `retentiescore` framen alsof het een voorspelmodel is
- `Frictiescore` beschrijven als hard bewijs van vertrekoorzaak
- `Signaalsterkte` behandelen als bewijssterkte of risicozekerheid

### Commerciële variant versus managementterm

De commerciële variant mag eenvoudiger, buyer-facing en toegankelijker zijn dan de managementterm.

Regels:

- commerciële vereenvoudiging mag nooit de methodische betekenis verbreden
- commerciële vereenvoudiging mag nooit interpretatiegrenzen verzwakken
- commerciële vereenvoudiging mag nooit claimruimte vergroten
- commerciële vereenvoudiging mag nooit causaliteit suggereren of valse zekerheid oproepen

### Change-control

De actieve repo-canon is leidend. De termmap is bindend voor report, dashboard, website/product pages, sample output en commerciële messaging.

Regels:

- lokale afwijking is niet toegestaan als:
  - de betekenis verschuift
  - de claimruimte groter wordt
  - een niet-goedgekeurde term zichtbaar wordt
  - producttaal afwijkt van de canon
- een wijziging moet via canonwijziging lopen zodra:
  - een nieuwe zichtbare term wordt geïntroduceerd
  - een term van familie verandert zoals `score` naar `signaal` of andersom
  - een commerciële variant meer belooft dan de management- of methodeterm
  - een productspecifieke uitzondering repo-breed effect krijgt
- recipe-copy, dashboardcopy en websitecopy mogen geen eigen terminologie introduceren; ze mogen alleen kiezen uit de goedgekeurde kanaalvarianten in deze termmap

### Status van kanaalvoorbeelden

Kanaalvoorbeelden zijn niet vrijblijvend.

Regels:

- ze zijn richtinggevend voor toon, betekenis en begrenzing
- lokale copy mag variëren in formulering, maar niet in betekenis, claimruimte of leesfunctie
- als lokale copy afwijkt van het voorbeeld, moet de canonieke functie van de term overeind blijven

## Cross-product kerntermen

| Term | Familie | Huidig probleem | Canonieke methodeterm | Datamodel/code-term | Zichtbare managementterm | UI-kortlabel | Commerciële variant | Vermijden | Report-hoofdflow voorbeeld | Dashboard/UI voorbeeld | Website/commercieel voorbeeld |
|---|---|---|---|---|---|---|---|---|---|---|---|
| werkfrictie | cross-product kernterm | te abstract als eerste lezing | werkfrictie | `work_friction` of bestaand intern veld | ervaren spanning of belemmering in werk | werkfrictie | signaal van ervaren spanning in het werk | frictie-index, latente frictiedruk, verborgen werkdrukscore | `De frictiescore vat ervaren spanning in werk, leiding en context samen.` | `Werkfrictie` | `Inzicht in ervaren spanning die rond vertrek zichtbaar wordt.` |
| werksignaal | cross-product kernterm | te intern en vaag | werksignaal | `work_signal` of bestaand intern veld | werkgerelateerd patroon | patroon | terugkerend werkpatroon | multifactorsignaal, samengesteld werksignaal | `Dit patroon komt relatief vaak terug in de exitcontext.` | `Patroon` | `Terugkerende werkpatronen die bestuurlijke aandacht vragen.` |
| managementduiding | cross-product kernterm | intern en abstract | managementduiding | `management_read` of lokaal tekstslot | wat management hier vooral uit moet halen | managementlezing | bestuurlijke hoofdboodschap | duidingslaag, interpretatiekader voor management | `Wat management hier vooral uit moet halen, zit in groeiperspectief en leiderschap.` | `Managementlezing` | `De hoofdboodschap voor management in één oogopslag.` |
| signaalsterkte | cross-product kernterm | kan worden gelezen als bewijssterkte | signaalsterkte | `signal_strength` | hoeveel bestuurlijke aandacht dit vraagt | aandachtssignaal | mate van aandacht | bewijssterkte, ernstscore, impactbewijs | `De signaalsterkte laat zien hoeveel aandacht dit patroon bestuurlijk vraagt.` | `Aandachtssignaal` | `Zie waar nu de meeste aandacht nodig is.` |
| Volgen | cross-product kernterm | klinkt te passief en te veilig | Volgen | `band_follow` of bestaand bandveld | blijven volgen | Volgen | monitoren | veilig, geen actie nodig, laag risico | `Dit patroon vraagt nu geen directe escalatie, maar wel blijvende aandacht.` | `Volgen` | `Blijf dit patroon volgen.` |
| Eerst toetsen | cross-product kernterm | te breed, te dominant, te weinig uitgelegd | Eerst toetsen | `band_review_first` of bestaand bandveld | eerst verifiëren en duiden | Eerst toetsen | gericht toetsen | middenmoot, restcategorie, twijfelzone | `Dit vraagt bestuurlijke aandacht, maar eerst met context en verificatie.` | `Eerst toetsen` | `Eerst gericht toetsen voordat je zwaarder prioriteert.` |
| Direct prioriteren | cross-product kernterm | kan te hard of te causaal lezen | Direct prioriteren | `band_prioritize_now` | nu bestuurlijk voorrang geven | Direct prioriteren | direct aandacht geven | hoog risico, bewezen probleem, direct ingrijpen | `Dit patroon vraagt nu bestuurlijke voorrang.` | `Direct prioriteren` | `Patronen die nu als eerste aandacht verdienen.` |

## Report-flow termen

| Term | Familie | Huidig probleem | Canonieke methodeterm | Datamodel/code-term | Zichtbare managementterm | UI-kortlabel | Commerciële variant | Vermijden | Report-hoofdflow voorbeeld | Dashboard/UI voorbeeld | Website/commercieel voorbeeld |
|---|---|---|---|---|---|---|---|---|---|---|---|
| bestuurlijke handoff | report-flow term | inhoudelijk sterk, maar soms te jargonachtig of te module-achtig | bestuurlijke handoff | `executive_handoff` of bestaand intern slot | wat bestuur of MT nu moet meenemen | handoff | bestuurlijke overdracht | executive handoff als standaardterm, overdrachtsmodule | `De bestuurlijke handoff vat samen wat bestuur of MT nu moet meenemen.` | `Handoff` | `De bestuurlijke hoofdpunten in één overzicht.` |
| prioriteitenbeeld | report-flow term | bruikbaar, maar nog wat intern en soms te technisch | prioriteitenbeeld | `priority_overview` | waar bestuurlijk het meeste vervolg nodig is | prioriteiten | bestuurlijk prioriteitenbeeld | prioriteitenmatrix zonder uitleg, issue ranking | `Het prioriteitenbeeld laat zien waar bestuurlijk het meeste vervolg nodig is.` | `Prioriteiten` | `Zie waar nu de meeste bestuurlijke aandacht nodig is.` |
| route | report-flow term | soms te generiek of te procesmatig | route | `route` of `action_route` | eerste bestuurlijke lijn | route | eerste route | interventiepad, escalatieroute, procesroute | `De route laat zien welke bestuurlijke lijn nu het meest logisch is.` | `Route` | `Een eerste route voor vervolg en besluitvorming.` |
| eerste besluit | report-flow term | nog niet altijd concreet genoeg gemaakt | eerste besluit | `first_decision` | wat management nu als eerste moet besluiten | besluit | eerste bestuurlijke keuze | besluitpunt zonder actor, besluitmoment zonder context | `Het eerste besluit is wat management nu als eerste helder moet maken.` | `Besluit` | `De eerste bestuurlijke keuze die nu nodig is.` |
| eerste stap | report-flow term | soms te sjabloonmatig of te leeg | eerste stap | `first_step` | wat je nu als eerste doet | eerste stap | eerste actie | quick win, interventie zonder context | `De eerste stap maakt concreet wat je nu als eerste doet.` | `Eerste stap` | `De eerste actie om gericht vervolg te geven.` |
| reviewmoment | report-flow term | goed begrip, maar soms te instrumenteel of controlerend | reviewmoment | `review_moment` | wanneer je opnieuw kijkt of de gekozen route klopt | review | opvolgmoment | controlemoment, evaluatieslot | `Het reviewmoment bepaalt wanneer je opnieuw kijkt of de gekozen route nog klopt.` | `Review` | `Een logisch moment om de gekozen route opnieuw te beoordelen.` |

## Productspecifieke termen

| Term | Familie | Huidig probleem | Canonieke methodeterm | Datamodel/code-term | Zichtbare managementterm | UI-kortlabel | Commerciële variant | Vermijden | Report-hoofdflow voorbeeld | Dashboard/UI voorbeeld | Website/commercieel voorbeeld |
|---|---|---|---|---|---|---|---|---|---|---|---|
| frictiescore | productspecifieke term | betekenis onvoldoende uitgelegd | frictiescore | `friction_score` | samenvattende score van ervaren werkfrictie | frictiescore | samenvattend spanningssignaal rond vertrek | vertrekrisicoscore, vertrekvoorspeller | `De frictiescore is een samenvattende score van ervaren werkfrictie in deze exitcontext.` | `Frictiescore` | `Een samenvattend beeld van ervaren spanning rond vertrek.` |
| retentiesignaal | productspecifieke term | kan als voorspeller gelezen worden | retentiesignaal | `retention_signal` | groepssignaal van aandacht rond behoud | retentiesignaal | behoudssignaal | retentiescore als voorspelmodel, uitstroomvoorspeller | `Het retentiesignaal laat zien waar behoud bestuurlijk aandacht vraagt.` | `Retentiesignaal` | `Een groepssignaal voor aandacht rond behoud.` |
| stay-intent | productspecifieke term | Engels en technisch; half-Engelse zichtbare varianten maken taal onrustig | stay-intent | `stay_intent` | intentie om te blijven | blijfintentie | bereidheid om te blijven | stay-intent als zichtbare standaardterm, loyaliteitsscore, retentiezekerheid | `De intentie om te blijven is een aanvullend signaal, geen voorspelling.` | `Blijfintentie` | `Zicht op bereidheid om te blijven.` |
| vertrekintentie | productspecifieke term | kan te individueel of voorspellend lezen | vertrekintentie | `departure_intent` of `exit_intent` | intentie om te vertrekken | vertrekintentie | vertrekneiging | uitstaprisico, voorspelde uitstroom | `Vertrekintentie is een aanvullend groepssignaal en geen individuele voorspeller.` | `Vertrekintentie` | `Inzicht in vertrekneiging binnen de groep.` |

## Implementatienoot

Implementatievolgorde:

1. deze canon vastleggen en refereren vanuit `REPORT_METHODOLOGY_CANON.md`
2. report- en dashboardtermen alignen op deze termmap
3. daarna website/product pages, sample output en commerciële messaging alignen

Wat later pas in recipe/copy wordt aangepast:

- lokale vervanging of uitleg van te interne termen in ExitScan en RetentieScan
- dashboardlabels, tooltips en microcopy
- website/product page copy en sales/sample copy

Wat nadrukkelijk niet in deze canondelta zit:

- rendererherbouw
- visueel redesign
- nieuwe productspecifieke methodiek

## Acceptance

Deze terminology governance canon is geldig als:

- de termmap bindend en repo-breed toepasbaar is gemaakt
- methodeterm, code/datamodelterm en zichtbare kanaalterm expliciet zijn onderscheiden
- score en signaal niet langer vrij door elkaar kunnen lopen
- report, dashboard, website/product pages, sample output en commerciële messaging aan dezelfde termbron kunnen worden getoetst

## Assumptions / defaults

- bestaande code- en datamodeltermen blijven voorlopig staan tenzij een aparte technische wijziging dat vereist
- zichtbare kanaalterm volgt altijd deze termmap, niet de interne veldnaam
- productspecifieke semantiek blijft lokaal waar de canon dat expliciet beschermt
