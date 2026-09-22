# Review van de 72 vertaalvragen

Datum: 2026-09-21
Status: review, ter beoordeling door Lars. Dit document keurt niets goed; "Status: akkoord" in het conceptdocument zet Lars zelf.
Beoordeeld: `docs/superpowers/specs/2026-09-19-vertaalvragen-concept.md`
Gelezen: beslissingslog 6-9, 11-9 en 19-9; spec `2026-09-16-rapport-onbegeleid-design.md` par. 1, 2, 6, 7; `DIRECTION_SETS` in `backend/products/shared/deepening.py`; `copy-toon-voorkeur.md`; tekstlaag van `docs/examples/voorbeeldrapport_retentiescan.pdf` (pagina 2, 12, 13, 17).

## 1. Oordeel in vijf regels

1. Van de 72 blijven er **13 staan**, krijgen er **54 een scherpere versie** en zijn er **5 onhoudbaar**. Behoud: 13 goed, 22 scherper, 1 onhoudbaar. Vertrek: 0 goed, 32 scherper, 4 onhoudbaar.
2. Het Behoud-concept is degelijk werk met één terugkerende zwakte: "Wat is bij jullie X: wie, hoe vaak, wat" vraagt naar het beleid, en beleid heeft elk MT. Een directeur antwoordt "dat hebben we" en de vraag is op. De herschrijvingen beginnen daarom bij wat een medewerker meemaakt, niet bij wat er geregeld is.
3. Het Vertrek-concept valt als set op het patroon, niet op de losse vragen: "wie had ... moeten" kost twintig van de dertig woorden, levert per definitie een mening op over vroeger, en zoekt een schuldige bij een groep vertrekkers die het MT bij naam kent. Alle 36 zijn omgebouwd naar één nieuwe vorm (sectie 2.1). Wijst Lars die vorm af, dan zijn 10 Vertrek-vragen binnen het spec-patroon houdbaar (gemerkt met ° in de tabellen) en wordt de stand 23 goed, 44 scherper, 5 onhoudbaar.
4. De verdeeld-zinnen werken niet zodra [A] en [B] echte routeteksten zijn: ruim veertig woorden, een ik-vorm in de mond van de HR-manager, en "je mensen" terwijl het om de groep gaat bij wie dit het laagst scoorde. Advies: de routes niet in de zin noemen, ze staan in de tabel er direct boven.
5. Eén route is met geen enkele vraag te redden (`cpd_flex`); dat moet in de volgende versie van de routeset worden opgelost, niet hier.

## 2. De grote keuzes

### 2.1 Het Vertrek-patroon: advies = nu eerst, toen als toets

Vijf vragen in drie vormen. A is het concept (spec-vorm "wie had ... moeten"), B is de zachtere vorm uit twijfel 3 ("hoe had dat geregeld moeten zijn"), C is mijn derde vorm.

| Route | A: wie had moeten (concept) | B: hoe had het geregeld moeten zijn | C: nu eerst, toen als toets |
|---|---|---|---|
| `wld_scope` | Wat had bij jullie wel en niet bij de functie moeten horen, en wie had nee moeten zeggen als er werk bijkwam? Wie zegt dat nu? | Hoe had bij jullie geregeld moeten zijn wat wel en niet bij een functie hoort, en wat er afgaat als er werk bijkomt? Hoe is dat nu geregeld? | Er komt nu werk bij voor een team dat al vol zit. Wie zegt wat er dan afgaat? En toen de vertrekkers er nog werkten? |
| `ldd_feedback` | Wat had bij jullie bruikbare feedback moeten zijn: van wie, hoe vaak, en waarover? Krijgt wie er nu werkt die wel? | Hoe had bruikbare feedback bij jullie geregeld moeten zijn: hoe vaak, en waarover? Hoe is dat nu geregeld? | Een medewerker levert nu werk in dat beter kan. Van wie hoort die wat er anders moet, en hoe snel? En toen de vertrekkers er nog werkten? |
| `cud_involvement` | Bij welk besluit hadden medewerkers bij jullie eerder moeten meepraten, en in welke vorm? Welk besluit komt eraan waarbij dat nog kan? | Hoe had het meepraten over besluiten die een team raken bij jullie geregeld moeten zijn? Hoe is het geregeld bij het besluit dat eraan komt? | Welk besluit dat een team raakt komt eraan? Op welk moment praten medewerkers mee voordat het vaststaat? En hoe ging dat bij het vorige grote besluit? |
| `cpd_review` | Bij welke functies had eerder gekeken moeten worden of de beloning nog paste bij de zwaarte, en door wie? Welke functies zijn nu aan de beurt? | Hoe had bij jullie geregeld moeten zijn dat iemand kijkt of de beloning nog past bij de zwaarte van een functie? Hoe is dat nu geregeld? | Wanneer keken jullie voor het laatst of de beloning nog past bij hoe zwaar een functie is? Welke functies zijn sindsdien veranderd, en wie kijkt daar nu naar? |
| `rcd_expectations` | Waarop werden medewerkers bij jullie aangesproken, en wie had dat vooraf moeten zeggen? Weet wie er nu werkt waarop hij of zij wordt aangesproken? | Hoe had bij jullie geregeld moeten zijn dat een medewerker vooraf weet waarop die wordt aangesproken? Hoe is dat nu geregeld? | Waarop wordt een medewerker nu aangesproken, en wist die dat vooraf? Waar staan die verwachtingen? Stonden ze er al toen de vertrekkers er nog werkten? |

**Winnaar: C.** Drie redenen, in volgorde van gewicht.

1. **De maandagtest.** Een antwoord op "wie had nee moeten zeggen" is een mening over vroeger. Niemand kan er maandag iets mee. Het enige bruikbare deel van de A-vragen is het staartje ("Wie zegt dat nu?"), en dat krijgt vijf woorden. C draait de verhouding om: de vraag gaat over wie er nu werkt, het verleden is de toets.
2. **De methodoloog.** "Had moeten" zegt dat er iets is nagelaten. Dat is geen gemeten feit; de vertrekker koos alleen wat het meest had geholpen. Bij Vertrek weegt dat zwaarder dan bij Behoud, want het gaat om een handvol mensen die het MT bij naam kent. Een vraag die het verleden reconstrueert ("bij welk besluit", "waarop werden ze aangesproken") eindigt binnen twee minuten bij "dat ging over Jan". C vraagt in de toets alleen naar een feit over de organisatie (was dit er toen ook), niet naar een norm en niet naar een geval.
3. **B lost het probleem niet op.** B haalt het "wie" weg maar houdt "had moeten", dus de suggestie van nalatigheid blijft. En "geregeld" is beleidstaal: 36 keer "hoe had dat geregeld moeten zijn" zakt voor de generieke-zin-test, want het frame past onder elke route, en het nodigt uit tot precies het antwoord dat bril B wil voorkomen ("dat zit in de gesprekscyclus").

**Wat de toets doet.** Het MT van een Vertrek-rapport heeft één standaardverweer: "dat was toen". De toets ("En toen de vertrekkers er nog werkten?", "Was dat een jaar geleden anders?") dwingt tot één van twee eerlijke antwoorden. "Toen was het net zo": dan geldt wat de vertrekkers kozen nog steeds voor wie er nu werkt. "Sindsdien hebben we X veranderd": dan is de vraag of een medewerker dat merkt, en die staat ervoor. Beide uitkomsten voeden de besluitvraag.

**Gevolg voor de spec.** Par. 3 en 6 van de rapport-spec zeggen "verleden-tijd-stem" voor Vertrek. C is tegenwoordige tijd met een verleden-tijd-toets. Dat vraagt een amendement van één regel. De contenttest kan afdwingen dat elke exit-vraag een verleden-tijd-deel bevat. "Vertrekkers" is de term die het rapport zelf al gebruikt (`report_html.py` regel 776 en 3759), dus er komt geen nieuw woord bij.

### 2.2 "En nu?" aan het eind: kracht, mits het de hoofdzin wordt

De vaste wending van toen naar nu is een kracht. De lezer ziet één of twee vragen per rapport en merkt de herhaling niet; de eentonigheid bestaat alleen in het reviewdocument. Bij een vervolgrapport helpt een vaste vorm de HR-manager juist.

Wat niet werkt is de wending als aanhangsel. "Wie zegt dat nu?" en "Waar kan dat nu?" zijn vijf woorden na een lange terugblik, en de constructie "wie er nu werkt" als onderwerp ("Krijgt wie er nu werkt die wel?", "Hoe hoort wie er nu werkt dat?") is hardop niet uit te spreken zonder te haperen. Dat is negen keer bril A.

In de plaats komt vorm C: de nu-vraag is de hoofdzin, de toets het slot. De toets heeft drie vaste vormen, gekozen op inhoud en niet willekeurig:

- "En toen de vertrekkers er nog werkten?" bij een situatie die zich herhaalt (iemand loopt vast, er komt werk bij).
- "Was dat een jaar geleden anders?" of "Wat is daar het afgelopen jaar aan veranderd?" bij iets dat ergens staat of geregeld is (criteria, afspraken, uren).
- Ingebouwd, zonder apart slot, waar de vraag zelf al terugkijkt ("Wanneer keken jullie voor het laatst", "bij de laatste wijziging", "het vorige grote besluit").

### 2.3 De zes leiderschapsroutes als set, met bril B

Het concept zet alle zes op "een leidinggevende bij jullie", derde persoon, terwijl die leidinggevenden de vraag zelf zitten te beantwoorden. Dat maakt het makkelijk om over een ander te praten. Vier van de zes zijn met "dat doen we al" af te doen:

- `ldd_feedback`: "wie geeft die, hoe vaak" krijgt als antwoord "in het jaargesprek en de bila".
- `ldd_escalation`: "bij wie kan een medewerker terecht" krijgt "bij zijn leidinggevende, en we hebben een vertrouwenspersoon".
- `ldd_availability`: "wat mag een medewerker verwachten" krijgt "mijn deur staat altijd open".
- `ldd_mandate`: de tweede helft ("hoe reageert een leidinggevende als het anders uitpakt") vraagt door op iets wat de medewerker niet koos. Die koos "duidelijker wat ik mag beslissen", niet "rugdekking". Dat is een niet gemeten oorzaak (bril C).

Twee blijven staan: `ldd_recognition` ("wat wordt er dan precies genoemd" is niet met ja af te doen) en `ldd_consistency` ("en wat als het daarna weer wijzigt" raakt het MT zelf zonder het te beschuldigen).

De herschrijvingen zetten een situatie neer in plaats van een regeling (werk dat beter kan, iemand die vastloopt) en vragen naar tijd en naar wat de medewerker ervan merkt. Bij `ldd_mandate` wordt de tafel zelf de toets: "Noemt iedere leidinggevende aan deze tafel dezelfde drie?" Als de lijstjes verschillen, is "duidelijker" bewezen zonder dat iemand is aangevallen.

**Advies voor plan 3b:** zet onder dit onderwerp één vaste regel, zoals de regel over de afdelingsmanager op de segmentpagina: "Deze vraag gaat ook over de leidinggevenden aan deze tafel. Beantwoord hem eerst voor je eigen team." Dat voorkomt wijzen naar een ander en blijft weg van de vraag wie wat invulde.

### 2.4 De routes die zich slecht laten vertalen

**`cpd_flex`: de vraag kan het niet oplossen, de route moet worden gesplitst.** Als deze route wint, staat er in "Wat er moet gebeuren": "Geef meer duidelijkheid of ruimte rond rooster, werktijden en flexibiliteit." Een opdracht met "of" erin is geen opdracht. Het MT weet niet of mensen willen weten wat er kan, of willen dat er meer kan, en dat zijn tegengestelde gesprekken (het eerste kost niets, het tweede kost bezetting). De conceptvraag erkent dat eerlijk ("Gaat het om duidelijkheid of om ruimte?") maar laat het MT raden naar iets wat de data niet weet: onhoudbaar. De beste noodvraag brengt in kaart wat er feitelijk kan; is dat weinig, dan komt ruimte vanzelf op tafel, is het veel maar onbekend, dan duidelijkheid. Noodvraag: "Wat kan er bij jullie echt rond rooster en werktijden, voor welke functies, wie beslist over een verzoek, en waar staat dat zodat niemand het hoeft te vragen?" Advies: bij de herweging na twee of drie campagnes splitsen in een duidelijkheid-route en een ruimte-route (versiebump).

**`wld_peaks`: de vraag is te redden, en het concept doet dat al.** De schrijver zegt dat de vraag maar twee van de drie werkwoorden kan dragen, maar hij draagt ze alle drie: zien aankomen (plannen), wie verdeelt (verdelen), "dit kan er nu niet bij" (begrenzen). De drie werkwoorden wijzen ook dezelfde kant op, anders dan bij `cpd_flex`. Blijft staan. Wel heb ik "wie zegt nee" uit `wld_scope` gehaald, zodat die twee niet dezelfde angel hebben.

**`cpd_insight`: te redden, door het "weten we niet" in de vraag op te nemen.** De schrijver vreest dat het gesprek eindigt bij een onderzoeksopdracht. Dat is geen mislukking: als het MT het zelf niet weet, ís uitzoeken de eerste stap, en die is maandag te beginnen, mits de vraag meteen naar eigenaar en volgorde vraagt. De ja-nee-opening ("Weten jullie zelf...") moet wel weg. Herschrijving: "Een medewerker vraagt hoe jullie salaris zich verhoudt tot vergelijkbaar werk elders. Wat krijgt die te zien? En weten jullie het zelf niet: wie zoekt het uit, voor welke functies eerst?"

### 2.5 De verdeeld-zinnen

**Proef met lange ik-teksten.** Vul de spec-zin in met twee echte routes uit `compensation`:

> Je mensen zijn verdeeld tussen 'Beter kijken of beloning past bij de zwaarte en verantwoordelijkheid van mijn werk' en 'Meer duidelijkheid over mogelijke salarisgroei, voorwaarden en timing'. Welke van de twee past bij wat jullie de komende drie maanden kunnen waarmaken?

Dat zijn 42 woorden. De HR-manager zegt "mijn werk" over andermans werk, en bij de komma is het MT de eerste helft kwijt. Aanhalingstekens (afwijking 7 in het concept) lossen de ik-vorm op papier op, niet hardop. Verder:

- **"Je mensen"** zijn niet je mensen maar de groep bij wie dit onderwerp het laagst scoorde en die de vraag beantwoordde (bril C). In het voorbeeldrapport zijn dat er 10 van de 39.
- **"Tussen [A] en [B]"** klopt vaak niet. In het voorbeeldrapport is de verdeling bij werkdruk 3, 2, 2, 2, 1: er is geen B, er zijn er drie, waaronder de niets-optie. De spec zegt niet wat B is bij een gelijke tweede plaats.
- **"Wat jullie kunnen waarmaken"** laat het MT op gemak kiezen en geeft geen reden om iets te laten liggen.
- **"De komende drie maanden"** dubbelt met de besluitvraag eronder ("waaraan zie je over 90 dagen dat het werkt").

**Advies: noem de routes niet in de zin.** Ze staan met tellingen in de tabel er direct boven.

- `divided`, Behoud: "Deze groep koos verschillend; de verdeling staat hierboven. Met welke van de meest gekozen richtingen beginnen jullie, en welke laten jullie bewust liggen?"
- `divided`, Vertrek: "Deze vertrekkers kozen verschillend; de verdeling staat hierboven. Welke van de meest gekozen richtingen pakken jullie op voor wie er nu werkt, en welke laten jullie bewust liggen?"
- `split_none`: het conceptvoorstel ("Waar zit dat verschil: tussen afdelingen, functies of diensten?") wijs ik af. Bij tien beantwoorders is dat een uitnodiging om te raden welke afdeling wat invulde, en het spreekt de vaste regel op de segmentpagina tegen ("het rapport toont die alleen organisatiebreed"). In de plaats: "Deze groep is verdeeld: een deel vraagt om verandering, een even groot deel zegt dat het goed zit. Beide kan kloppen. Waar zouden jullie met de meest gekozen richting beginnen?" Dat vraagt waar het MT begint, niet wie wat vond.
- `plurality`: eens met de schrijver, toon de route-eigen vraag. De noemer staat twee regels hoger.
- `divided` met `*_other` of `*_none` als grootste, en `too_few`: eens, geen vertaalvraag.
- `none_needed`: de voorgestelde zin "Hoe rijmen jullie dat?" nodigt uit tot oorzaken verzinnen en levert een mening op. Advies: vertaalvraag weglaten; de herkenningsvraag dekt het.

## 3. Alle 72 rijen

**Huisregels van de herschrijvingen**, zodat ze één stem hebben:
1. Begin bij een situatie die een medewerker meemaakt of bij een feit dat te controleren is, niet bij een regeling.
2. Na de situatie hoogstens twee tot drie korte deelvragen; geen opening die met ja of nee af te doen is.
3. Het slot hoort alleen bij deze route.
4. "Bij jullie" alleen waar het werk doet; in Vertrek doet "nu" dat werk.
5. "Die" als verwijswoord in plaats van "hij of zij", omdat het hardop loopt.
6. Hoogstens ongeveer dertig woorden; de langste herschrijving telt er 32.

Kolom "Oordeel": goed = ongewijzigd laten. ° = binnen het spec-patroon houdbaar, voor het geval vorm C wordt afgewezen.

### 3.1 Loep Behoud

#### De aansturing (`leadership`)

| Routesleutel | Conceptvraag | Oordeel | Herschrijving | Waarom |
|---|---|---|---|---|
| `ldd_feedback` | Wat is bij jullie bruikbare feedback: wie geeft die, hoe vaak, en wat kan een medewerker er de volgende dag mee? | scherper | Een medewerker levert werk in dat beter kan. Van wie hoort die wat er anders moet en waar het naartoe moet, en hoe snel? Wat kan die er de volgende dag mee? | Bril B: "in het jaargesprek en de bila" sluit hem af; en "richting" uit de route ontbrak (aansluittest). |
| `ldd_mandate` | Welke drie beslissingen mag een medewerker bij jullie nemen zonder het eerst te vragen, en hoe reageert een leidinggevende als zo'n beslissing anders uitpakt? | scherper | Welke drie beslissingen mag een medewerker bij jullie nemen zonder het eerst te vragen? Noemt iedere leidinggevende aan deze tafel dezelfde drie, en van wie hoort de medewerker het? | Bril C: de tweede helft vraagt door op rugdekking, en dat koos de medewerker niet. |
| `ldd_escalation` | Als iets vastloopt of er spanning is: bij wie kan een medewerker terecht, hoe snel komt er antwoord, en wat doet de leidinggevende dan wel en niet? | scherper | Als een medewerker vastloopt in een situatie of een spanning: wat doet de leidinggevende dan, binnen hoeveel dagen, en bij wie kan die medewerker terecht als het daar niet lukt? | Bril B: "bij zijn leidinggevende of de vertrouwenspersoon" sluit hem af; het sterkste deel stond achteraan. |
| `ldd_recognition` | Hoe hoort iemand bij jullie dat zijn of haar werk goed was: van wie, hoe snel erna, en wat wordt er dan precies genoemd? | goed | | Vanuit de ontvanger gesteld, en "wat wordt er dan precies genoemd" is niet met ja af te doen en hoort alleen bij deze route. |
| `ldd_availability` | Wat mag een medewerker bij jullie van een leidinggevende verwachten: hoe vaak zien ze elkaar, hoe snel komt er antwoord, en hoe weet de medewerker dat? | scherper | Hoe snel krijgt een medewerker bij jullie antwoord van de leidinggevende, en hoe vaak zien ze elkaar zonder dat er iets aan de hand is? Weet de medewerker wat die mag verwachten? | Bril B: "mijn deur staat altijd open"; "zonder dat er iets aan de hand is" pakt zichtbaarheid, die in het concept ontbrak. |
| `ldd_consistency` | Als een besluit of verwachting bij jullie verandert: wie legt uit waarom, aan wie, en binnen hoeveel dagen? En wat als het daarna weer wijzigt? | goed | | "Binnen hoeveel dagen" dwingt een norm af en het slot raakt "stabieler" zonder het MT te beschuldigen. |

#### De samenwerking in het team (`culture`)

| Routesleutel | Conceptvraag | Oordeel | Herschrijving | Waarom |
|---|---|---|---|---|
| `cud_safety` | Waar kan iemand bij jullie een fout of twijfel melden zonder dat het tegen hem of haar werkt: in welk overleg, bij wie, en wat gebeurt er daarna mee? | scherper | Een medewerker meldt zelf een fout. Wat gebeurt er daarna: wie reageert, wat zien collega's daarvan, en hoort de melder wat ermee gedaan is? | Bril B: "overal, we hebben een open cultuur"; veiligheid leer je van wat er met de melding van een ander gebeurt. |
| `cud_dissent` | Op welk moment is tegenspraak bij jullie echt welkom: in welk overleg, vóór welk besluit, en wat doen jullie zichtbaar met een kritische vraag? | scherper | Wanneer veranderde een kritische vraag van een medewerker bij jullie voor het laatst een besluit? In welk overleg is daar ruimte voor, en wat hoort iemand wiens bezwaar het niet haalt? | Bril B: "altijd welkom" sluit hem af; een laatste keer noemen kan alleen wie het echt doet. |
| `cud_conflict` | Wanneer is een spanning bij jullie groot genoeg om te bespreken: wie begint erover, hoe snel, en wie helpt als twee collega's er samen niet uitkomen? | goed | | "Groot genoeg" vertaalt precies het woord "eerder" uit de route, en het slot is maandag te regelen. |
| `cud_agreements` | Welke drie afspraken over samenwerken heeft elk team bij jullie nodig, wie spreekt iemand erop aan, en wanneer kijken jullie of ze nog werken? | scherper | Een collega houdt zich niet aan een teamafspraak. Wie zegt daar bij jullie iets van, en hoe snel? En waar staan die afspraken, zodat een nieuw teamlid ze kent? | Maandagtest: drie afspraken bedenken is een brainstorm voor teams, niet voor het MT; de opvolging is het punt. |
| `cud_involvement` | Bij welk soort besluit praten medewerkers bij jullie mee vóórdat het vaststaat: op welk moment, in welke vorm, en wat horen ze terug over hun inbreng? | scherper | Welk besluit dat een team raakt komt er de komende maanden aan? Op welk moment praten medewerkers mee voordat het vaststaat, en wat horen ze terug over hun inbreng? | Maandagtest: "welk soort besluit" levert beleid op, "welk besluit komt eraan" een datum (de Vertrek-versie had dit al). |
| `cud_crossteam` | Tussen welke teams of afdelingen loopt werk bij jullie het vaakst vast? Wie is eigenaar van die overdracht, en wat spreken die teams met elkaar af? | scherper | Twee teams hangen van elkaars werk af. Wat spreken ze bij jullie met elkaar af, wie regelt dat, en wie beslist als het botst? | Bril B: de hoofden van die afdelingen zitten aan tafel en gaan naar elkaar wijzen; de eerste zin is bovendien de herkenningsvraag. |

#### Groeiperspectief (`growth`)

| Routesleutel | Conceptvraag | Oordeel | Herschrijving | Waarom |
|---|---|---|---|---|
| `grd_visibility` | Waar kan een medewerker bij jullie vandaag zien welke functies, opleidingen of projecten er zijn? Wie houdt dat bij, en wie vertelt het? | scherper | Waar ziet een medewerker bij jullie vandaag welke functies, opleidingen of projecten er zijn? En wie wijst een medewerker op wat er voor hem of haar tussen zit? | Aansluittest: de medewerker koos "voor mij"; een lijst op intranet beantwoordt de conceptvraag en mist dat. |
| `grd_conversation` | Wat is bij jullie een concreet ontwikkelgesprek: wie voert het, hoe vaak, en wat moet eruit komen? | scherper | Wat weet een medewerker bij jullie ná een ontwikkelgesprek dat die ervoor niet wist: welke stap, welke opleiding, welk ander werk? Wie voert dat gesprek, en hoe vaak? | Generieke-zin-test: "wie, hoe vaak, wat moet eruit komen" past onder elk gesprek; en "we hebben jaargesprekken" sluit hem af. |
| `grd_followthrough` | Waar staat een ontwikkelafspraak bij jullie na het gesprek, wie kijkt er na drie maanden naar, en hoe ziet de medewerker dat er iets mee gebeurt? | goed | | Volgt de route woord voor woord (vastleggen, opvolgen, zichtbaar) en elk deel is maandag te regelen. |
| `grd_time` | Hoeveel uur per maand mag ontwikkeling bij jullie kosten, wie vangt het werk dan op, en wat gebeurt er als het druk is? | goed | | Dwingt een getal af, en "als het druk is" is precies het moment waarop "inplannen naast het werk" sneuvelt. |
| `grd_criteria` | Wat moet iemand bij jullie laten zien om door te groeien, wie beslist daarover, en waar kan een medewerker dat nalezen voordat hij of zij het vraagt? | goed | | "Nalezen voordat hij of zij het vraagt" maakt van "duidelijkere criteria" iets controleerbaars. |
| `grd_nextstep` | Welke vervolgstappen zijn er bij jullie echt, en welke niet? Wie zegt dat eerlijk tegen een medewerker, en op welk moment in het jaar? | goed | | "En welke niet" vertaalt "realistisch" en is niet met "dat hebben we" af te doen. |

#### Beloning en voorwaarden (`compensation`)

| Routesleutel | Conceptvraag | Oordeel | Herschrijving | Waarom |
|---|---|---|---|---|
| `cpd_insight` | Weten jullie zelf hoe jullie beloning zich verhoudt tot vergelijkbaar werk elders? Wat daarvan kunnen jullie delen, met wie, en wie legt het uit? | scherper | Een medewerker vraagt hoe jullie salaris zich verhoudt tot vergelijkbaar werk elders. Wat krijgt die te zien? En weten jullie het zelf niet: wie zoekt het uit, voor welke functies eerst? | Bril A en B: ja-nee-opening; de vraag moet het "weten we niet" opvangen in plaats van erop stuklopen (zie 2.4). |
| `cpd_explain` | Welke verschillen tussen vergelijkbare functies kunnen jullie goed uitleggen en welke niet? Wie legt ze uit, en wat doen jullie met een verschil dat niemand kan uitleggen? | goed | | Blijft op functies en niet op personen, en het slot is de eerlijkste zin van de hele set. |
| `cpd_review` | Wanneer keken jullie voor het laatst of functies nog passen bij hun zwaarte? Welke functies komen eerst, wie kijkt, en wanneer horen medewerkers de uitkomst? | scherper | Wanneer keken jullie voor het laatst of de beloning nog past bij hoe zwaar een functie is? Welke functies zijn sindsdien veranderd, en wie kijkt daar als eerste naar? | Aansluittest en redacteur: "of functies passen bij hun zwaarte" liet de beloning weg, en daar koos de medewerker voor. |
| `cpd_path` | Wat kan een medewerker bij jullie de komende twee jaar aan salarisgroei verwachten: onder welke voorwaarden, op welk moment, en wie vertelt dat? | goed | | Spiegelt de drie woorden van de route (groei, voorwaarden, timing), en "wie vertelt dat" is de angel. |
| `cpd_clarity` | Kan een leidinggevende bij jullie in twee minuten uitleggen hoe een salaris en een volgende stap worden bepaald? Zo nee, wat ontbreekt er, en wie maakt dat? | scherper | Wie aan deze tafel kan nu in twee minuten uitleggen hoe bij jullie een salaris en een volgende stap worden bepaald? Wat blijft er onduidelijk, en wie zet dat op papier? | Bril B: een MT zegt "ja" en loopt door; de twee minuten zijn goed, maar dan als proef aan tafel. |
| `cpd_flex` | Gaat het bij jullie om duidelijkheid of om ruimte? Wat kan er echt rond rooster en werktijden, voor welke functies, en wie beslist over een verzoek? | onhoudbaar | Wat kan er bij jullie echt rond rooster en werktijden, voor welke functies, wie beslist over een verzoek, en waar staat dat zodat niemand het hoeft te vragen? | Bril C: de opening laat het MT raden naar iets wat niet gemeten is. De herschrijving is een noodvraag; de route moet worden gesplitst (zie 2.4). |

#### Werkbelasting (`workload`)

| Routesleutel | Conceptvraag | Oordeel | Herschrijving | Waarom |
|---|---|---|---|---|
| `wld_scope` | Wat hoort bij jullie wel en niet bij een functie, en wie zegt nee als er werk bijkomt? Wat gaat er dan af? | scherper | Er komt werk bij voor een team dat al vol zit. Wie zegt bij jullie wat er dan afgaat, en waar staat wat wel en niet bij een functie hoort? | Bril A: "wat hoort wel en niet bij een functie" is aan tafel niet te beantwoorden (welke van de veertig functies?); en "wie zegt nee" dubbelde met `wld_peaks`. |
| `wld_planning` | Hoe ver vooruit weten jullie hoeveel werk er komt, wie zet dat af tegen de bezetting, en wat doen jullie als die twee niet kloppen? | scherper | Hoe ver vooruit zien jullie hoeveel werk er komt, en wie legt dat naast de bezetting? Klopt het niet: mensen erbij, werk eraf, of vangt het team het op? | Maandagtest: "wat doen jullie dan" krijgt "dan schakelen we bij"; de drie uitwegen benoemen dwingt tot kiezen. |
| `wld_peaks` | Welke pieken kunnen jullie zien aankomen, en welke niet? Wie verdeelt het spoedwerk, en wie mag zeggen: dit kan er nu niet bij? | goed | | Draagt alle drie de werkwoorden van de route (plannen, verdelen, begrenzen) en de laatste zin is hardop sterk. |
| `wld_recovery` | Wat gebeurt er bij jullie na een drukke periode: wie ziet dat een team moet bijkomen, wat mag er dan blijven liggen, en wie beslist dat? | scherper | Na een drukke periode: wat mag er bij jullie blijven liggen zodat mensen kunnen bijkomen en werk goed kunnen afmaken? Wie beslist dat, en hoe weet het team dat het mag? | Aansluittest: "werk goed afronden" ontbrak; en "hoe weet het team dat het mag" (uit twijfel 8) is de echte angel. |
| `wld_priorities` | Als alles belangrijk is: wie beslist bij jullie wat eerst gaat en wat mag wachten, en hoe weet een medewerker dat aan het begin van de week? | scherper | Als alles belangrijk is: wie zegt bij jullie hardop wat mag wachten, en hoe weet een medewerker dat op maandag? Wat hebben jullie zelf voor het laatst laten wachten? | Bril B: "dat beslist de teamleider" sluit hem af, terwijl "alles is belangrijk" meestal aan deze tafel begint. |
| `wld_friction` | Welk dubbel werk of systeemgedoe kost bij jullie de meeste tijd? Kies er één: wie lost het op, en vóór welke datum? | scherper | Welk dubbel werk of systeemgedoe kost de meeste tijd, en weten jullie dat of de mensen die het doen? Hoe halen jullie het op, en wie lost het eerste punt op? | Bril A: het MT doet dit werk niet en blijft hangen op de eerste zin; de vraag moet toegeven dat anderen het antwoord hebben. |

#### Duidelijkheid over je rol (`role_clarity`)

| Routesleutel | Conceptvraag | Oordeel | Herschrijving | Waarom |
|---|---|---|---|---|
| `rcd_priorities` | Kan iedere medewerker bij jullie de drie belangrijkste dingen van zijn of haar functie noemen? Wie bespreekt die, hoe vaak, en wanneer veranderen ze? | scherper | Vraag een medewerker en de leidinggevende los van elkaar naar de drie belangrijkste dingen in dat werk. Krijg je bij jullie twee keer hetzelfde lijstje? Wie bespreekt het, en hoe vaak? | Bril B: ja-nee-opening, "ja, dat denk ik wel"; twee lijstjes naast elkaar is niet met een vermoeden af te doen. |
| `rcd_expectations` | Waarop wordt een medewerker bij jullie aangesproken, en wist die dat vooraf? Wie spreekt verwachtingen uit, op welk moment, en waar staan ze? | goed | | "En wist die dat vooraf?" is kort, hardop sterk en raakt precies wat de medewerker koos. |
| `rcd_alignment` | Wat doet een medewerker bij jullie die van twee kanten iets anders te horen krijgt? Wie hakt de knoop door, en hoe snel? | goed | | Een situatie in plaats van een regeling, 23 woorden, en kan onder geen andere route staan. |
| `rcd_scope` | Als een takenpakket bij jullie verandert: wie bespreekt dat, vóór of na de verandering, wat valt er dan af, en waar leggen jullie het vast? | scherper | Als een takenpakket bij jullie verandert: wie bespreekt dat met de medewerker, vóór of na de verandering, en waar leggen jullie vast wat er is afgesproken? | Generieke-zin-test: "wat valt er dan af" is de angel van `wld_scope`; hier gaat het om de afspraak. Vier deelvragen was er ook één te veel. |
| `rcd_mandate` | Neem een functie die bij jullie veel voorkomt. Waarover beslist iemand in die rol zelf, waarover samen en waarover niet, en wie vertelt dat bij de start? | goed | | "Neem een functie" lost het welke-functie-probleem op, en zelf, samen, niet is een indeling die het MT ter plekke kan invullen. |
| `rcd_information` | Welke informatie heeft iemand bij jullie nodig aan het begin van een klus of dienst, wie levert die aan, en hoe gaat het bij een overdracht? | scherper | Iemand begint bij jullie aan een klus of neemt een dienst over. Wat moet die dan weten, wie zorgt dat het er ligt, en wat doet die als het ontbreekt? | Bril A: "hoe gaat het bij een overdracht" is te open om hardop te beantwoorden; "wat doet die als het ontbreekt" is de maandagvraag. |

### 3.2 Loep Vertrek

Alle 36 zijn omgebouwd naar vorm C (sectie 2.1). De kolom "Waarom" noemt wat de conceptvraag velde bovenop het patroon; waar niets extra's staat, is het patroon de enige reden.

#### De aansturing (`leadership`)

| Routesleutel | Conceptvraag | Oordeel | Herschrijving | Waarom |
|---|---|---|---|---|
| `ldd_feedback` | Wat had bij jullie bruikbare feedback moeten zijn: van wie, hoe vaak, en waarover? Krijgt wie er nu werkt die wel? | scherper | Een medewerker levert nu werk in dat beter kan. Van wie hoort die wat er anders moet, en hoe snel? En toen de vertrekkers er nog werkten? | Bril A: "Krijgt wie er nu werkt die wel?" is hardop niet te zeggen; maandagtest: de eerste helft levert een mening op. |
| `ldd_mandate` | Welke beslissingen hadden medewerkers bij jullie zelf mogen nemen, en wie had dat moeten zeggen? Weten de mensen die er nu werken het wel? | scherper | Welke drie beslissingen mag een medewerker nu nemen zonder het eerst te vragen, en van wie heeft die dat gehoord? Was dat een jaar geleden anders? | Bril C: "wie had dat moeten zeggen" zoekt een schuldige. |
| `ldd_escalation` | Bij wie had iemand moeten kunnen aankloppen als iets vastliep of er spanning was, en wat had daar moeten gebeuren? Weet wie er nu werkt waar die deur is? | scherper | Als een medewerker nu vastloopt in een situatie of een spanning: wat doet de leidinggevende dan, en binnen hoeveel dagen? En toen de vertrekkers er nog werkten? | Bril C: nodigt uit om een concreet geval van een vertrekker te reconstrueren; "waar die deur is" is beeldspraak die hardop verwart. |
| `ldd_recognition` | Hoe had iemand bij jullie moeten horen dat zijn of haar werk goed was: van wie, hoe snel, hoe concreet? Hoe hoort wie er nu werkt dat? | scherper | Hoe hoort een medewerker nu dat het werk goed was: van wie, en wat wordt er dan precies genoemd? Wat is daar het afgelopen jaar aan veranderd? | Bril A: "Hoe hoort wie er nu werkt dat?" hapert. |
| `ldd_availability` | Wat hadden medewerkers bij jullie van hun leidinggevende mogen verwachten: hoe vaak contact, hoe snel antwoord? Wat mogen de mensen die er nu werken verwachten? | scherper | Hoe snel krijgt een medewerker nu antwoord van de leidinggevende, en weet die vooraf wat die mag verwachten? En toen de vertrekkers er nog werkten? | Maandagtest: wat iemand vroeger had mogen verwachten is een mening. |
| `ldd_consistency` | Wie had bij jullie moeten uitleggen waarom een besluit of verwachting veranderde, aan wie, en hoe snel? Hoe gaat dat bij het eerstvolgende besluit? | scherper | Er verandert nu een besluit of verwachting. Wie legt uit waarom, en binnen hoeveel dagen? Ging dat het afgelopen jaar ook zo? | Bril B en C: "wie had moeten uitleggen" wijst naar iemand aan tafel. Het slot van het concept was al goed en is de hoofdzin geworden. |

#### De samenwerking in het team (`culture`)

| Routesleutel | Conceptvraag | Oordeel | Herschrijving | Waarom |
|---|---|---|---|---|
| `cud_safety` | Waar had iemand bij jullie een fout of twijfel veilig moeten kunnen melden, en wat had er dan mee moeten gebeuren? Waar kan dat nu? | scherper ° | Een medewerker meldt nu zelf een fout. Wie reageert, en wat zien collega's daarvan? En toen de vertrekkers er nog werkten? | Alleen het patroon; "Waar kan dat nu?" krijgt wel "overal" als antwoord (bril B). |
| `cud_dissent` | Op welk moment had tegenspraak bij jullie welkom moeten zijn: in welk overleg, vóór welk besluit? Waar is die ruimte er nu wel? | scherper ° | In welk overleg kan een medewerker nu een kritische vraag stellen vóórdat een besluit vaststaat, en wat hoort die terug? Wat is daar het afgelopen jaar aan veranderd? | Alleen het patroon. |
| `cud_conflict` | Wanneer had een spanning bij jullie besproken moeten worden, en wie had daarmee moeten beginnen? Wie doet dat nu, en hoe snel? | scherper | Twee collega's komen er nu samen niet uit. Wie begint erover, hoe snel, en wie helpt? En toen de vertrekkers er nog werkten? | Bril C: "wanneer had een spanning besproken moeten worden" haalt een specifiek conflict van een vertrekker naar boven. |
| `cud_agreements` | Welke afspraken over samenwerken hadden teams bij jullie moeten hebben, en wie had erop moeten letten? Welke daarvan ontbreken vandaag nog? | scherper ° | Een collega houdt zich nu niet aan een teamafspraak. Wie zegt daar iets van, en waar staan die afspraken? Was dat een jaar geleden anders? | Alleen het patroon; het slot van het concept was sterk. |
| `cud_involvement` | Bij welk besluit hadden medewerkers bij jullie eerder moeten meepraten, en in welke vorm? Welk besluit komt eraan waarbij dat nog kan? | scherper | Welk besluit dat een team raakt komt eraan? Op welk moment praten medewerkers mee voordat het vaststaat? En hoe ging dat bij het vorige grote besluit? | Bril C: "bij welk besluit" koppelt het vertrek aan één gebeurtenis, en dat is een oorzaak-claim via een omweg. De tweede helft was de beste zin van de Vertrek-set en staat nu vooraan. |
| `cud_crossteam` | Tussen welke teams of afdelingen had de samenwerking bij jullie anders gemoeten, en wie had dat moeten oppakken? Wie is er vandaag eigenaar van? | scherper | Twee teams hangen nu van elkaars werk af. Wat spreken ze met elkaar af, en wie beslist als het botst? En toen de vertrekkers er nog werkten? | Bril B: afdelingshoofden aan tafel, en de vraag vraagt letterlijk wie het had moeten oppakken. |

#### Groeiperspectief (`growth`)

| Routesleutel | Conceptvraag | Oordeel | Herschrijving | Waarom |
|---|---|---|---|---|
| `grd_visibility` | Waar hadden medewerkers bij jullie moeten kunnen zien welke mogelijkheden er waren, en wie had het moeten vertellen? Waar ziet wie er nu werkt dat? | scherper | Waar ziet een medewerker vandaag welke functies, opleidingen of projecten er zijn, en wie wijst die erop? Stond dat er een jaar geleden ook? | Bril A: "Waar ziet wie er nu werkt dat?" hapert. |
| `grd_conversation` | Wat had bij jullie een concreet ontwikkelgesprek moeten zijn: wie had het gevoerd, hoe vaak, en wat had eruit moeten komen? Krijgt wie er nu werkt dat gesprek? | scherper | Wat weet een medewerker nu ná een ontwikkelgesprek dat die ervoor niet wist, en wie voert dat gesprek? Wat is daar het afgelopen jaar aan veranderd? | Generieke-zin-test (als bij Behoud) en bril A: 30 woorden met vier keer "had". |
| `grd_followthrough` | Waar hadden ontwikkelafspraken bij jullie moeten staan, en wie had moeten nagaan of ze werden nagekomen? Hoeveel afspraken van nu staan zwart op wit? | scherper | Waar staat een ontwikkelafspraak nu na het gesprek, en wie komt erop terug? Hoeveel afspraken van een jaar geleden zijn nagekomen? | Het slot van het concept ("zwart op wit") was goed; de toets is nu ook een telbaar feit. |
| `grd_time` | Hoeveel tijd had ontwikkeling bij jullie mogen kosten naast het werk, en wie had die tijd moeten vrijmaken? Hoeveel tijd is er nu echt? | scherper ° | Hoeveel uur per maand heeft een medewerker nu voor ontwikkeling, en wat gebeurt er als het druk is? Was dat een jaar geleden anders? | Alleen het patroon. |
| `grd_criteria` | Wat had iemand bij jullie moeten laten zien om door te groeien, en wie had dat moeten uitleggen? Kan wie er nu werkt dat ergens nalezen? | scherper | Wat moet een medewerker nu laten zien om door te groeien, en waar kan die dat nalezen? Stond dat er al toen de vertrekkers er nog werkten? | Bril A: "Kan wie er nu werkt dat" hapert; en "wat had iemand moeten laten zien" leest alsof de vertrekker tekortschoot. |
| `grd_nextstep` | Welk eerlijk gesprek over vervolgstappen had bij jullie gevoerd moeten worden: door wie, en op welk moment? Voor welke functies is dat gesprek nu nog niet gevoerd? | scherper | Welke vervolgstappen zijn er nu echt, en welke niet? Wie zegt dat eerlijk tegen een medewerker, en wanneer? Gebeurde dat een jaar geleden ook? | Maandagtest: het MT weet niet voor welke functies het gesprek niet is gevoerd (twijfel 10 klopt), en de vraag blijft daar hangen. |

#### Beloning en voorwaarden (`compensation`)

| Routesleutel | Conceptvraag | Oordeel | Herschrijving | Waarom |
|---|---|---|---|---|
| `cpd_insight` | Wat hadden jullie medewerkers kunnen laten zien over hoe jullie beloning zich verhield tot vergelijkbaar werk elders? Weten jullie dat nu zelf, en wat delen jullie ervan? | scherper | Een medewerker vraagt nu hoe jullie salaris zich verhoudt tot vergelijkbaar werk elders. Wat krijgt die te zien, en weten jullie het zelf? Was dat een jaar geleden anders? | Bril A: "Wat hadden jullie medewerkers" leest hardop eerst als "jullie medewerkers". |
| `cpd_explain` | Welke verschillen tussen vergelijkbare functies hadden jullie moeten kunnen uitleggen, en wie had dat moeten doen? Welke kunnen jullie vandaag nog steeds niet uitleggen? | scherper ° | Welke verschillen tussen vergelijkbare functies kunnen jullie nu uitleggen, en welke niet? Wat doen jullie met een verschil dat niemand kan uitleggen? En een jaar geleden? | Alleen het patroon; "nog steeds niet" oordeelt wel vooraf. |
| `cpd_review` | Bij welke functies had eerder gekeken moeten worden of de beloning nog paste bij de zwaarte, en door wie? Welke functies zijn nu aan de beurt? | onhoudbaar | Wanneer keken jullie voor het laatst of de beloning nog past bij hoe zwaar een functie is? Welke functies zijn sindsdien veranderd, en wie kijkt daar nu naar? | Bril C: "had eerder gekeken moeten worden" zegt dat jullie te laat waren; dat draagt de data niet (twijfel 7 klopt). |
| `cpd_path` | Wat hadden medewerkers bij jullie moeten weten over salarisgroei: hoeveel, onder welke voorwaarden, wanneer? Wat weet wie er nu werkt daarover? | scherper | Wat kan een medewerker nu de komende twee jaar aan salarisgroei verwachten, en wie vertelt dat? Kreeg een medewerker dat een jaar geleden ook te horen? | Bril A: "Wat weet wie er nu werkt daarover?" hapert. |
| `cpd_clarity` | Wie had bij jullie moeten kunnen uitleggen hoe salaris en doorgroei werden bepaald, en op welk moment? Kan een leidinggevende dat vandaag in twee minuten? | scherper ° | Wie aan deze tafel kan nu in twee minuten uitleggen hoe een salaris en een volgende stap worden bepaald? Was die uitleg er een jaar geleden ook? | Bril B: het slot is een ja-neevraag (als bij Behoud). |
| `cpd_flex` | Wat had er bij jullie gekund rond rooster, werktijden of flexibiliteit, en wie had daarover duidelijk moeten zijn? Wat kan er nu, en weet iedereen dat? | scherper | Wat kan er nu echt rond rooster en werktijden, voor welke functies, en waar staat dat? Was dat een jaar geleden anders? | De vraag is in orde; het routeprobleem uit 2.4 blijft. |

#### Werkbelasting (`workload`)

| Routesleutel | Conceptvraag | Oordeel | Herschrijving | Waarom |
|---|---|---|---|---|
| `wld_scope` | Wat had bij jullie wel en niet bij de functie moeten horen, en wie had nee moeten zeggen als er werk bijkwam? Wie zegt dat nu? | onhoudbaar | Er komt nu werk bij voor een team dat al vol zit. Wie zegt wat er dan afgaat? En toen de vertrekkers er nog werkten? | Bril B en C: "wie had nee moeten zeggen" wijst een schuldige aan en suggereert dat het vertrek daardoor kwam (twijfel 3 klopt). |
| `wld_planning` | Op welk moment hadden jullie kunnen zien dat bezetting en werk niet meer klopten, en wie had er dan iets aan moeten doen? Wie kijkt daar nu naar? | onhoudbaar | Hoe ver vooruit weten jullie nu hoeveel werk er komt, en wie legt dat naast de bezetting? Keken jullie daar een jaar geleden ook zo naar? | Bril C: de vraag stelt als feit dat bezetting en werk niet klopten. Dat is niet gemeten; de vertrekker koos alleen wat had geholpen. |
| `wld_peaks` | Welke pieken hadden jullie zien aankomen, en wie had het spoedwerk moeten verdelen of begrenzen? Wie mag nu zeggen: dit kan er niet bij? | scherper | Welke pieken zien jullie nu aankomen, en wie mag zeggen: dit kan er niet bij? Wie mocht dat zeggen toen de vertrekkers er nog werkten? | Bril A: "hadden jullie zien aankomen" is dubbelzinnig (zagen jullie ze, of hadden jullie ze moeten zien?). |
| `wld_recovery` | Wat had er bij jullie na een drukke periode mogen blijven liggen, en wie had dat moeten beslissen? Wie beslist dat nu? | scherper | Na een drukke periode: wat mag er nu blijven liggen, en hoe weet het team dat het mag? En toen de vertrekkers er nog werkten? | Aansluittest: herstel en werk afronden ontbraken; "hoe weet het team dat het mag" is de angel. |
| `wld_priorities` | Wie had bij jullie moeten beslissen wat eerst ging en wat kon wachten, en hoe hadden medewerkers dat moeten horen? Hoe horen ze het nu? | scherper ° | Als alles belangrijk is: wie zegt nu hardop wat mag wachten, en hoe weet een medewerker dat op maandag? Was dat een jaar geleden anders? | Alleen het patroon. |
| `wld_friction` | Welk dubbel werk of systeemgedoe had bij jullie al weg moeten zijn, en wie had het moeten oppakken? Wat ervan bestaat vandaag nog? | scherper ° | Welk dubbel werk of systeemgedoe kost nu de meeste tijd, en wie lost het eerste punt op? Wat ervan bestond al toen de vertrekkers er nog werkten? | Alleen het patroon; het slot van het concept was sterk en is behouden als toets. |

#### Duidelijkheid over je rol (`role_clarity`)

| Routesleutel | Conceptvraag | Oordeel | Herschrijving | Waarom |
|---|---|---|---|---|
| `rcd_priorities` | Wat hadden bij jullie de drie belangrijkste dingen van een functie moeten zijn, en wie had dat moeten bespreken? Kan wie er nu werkt ze noemen? | scherper | Vraag een medewerker en de leidinggevende los van elkaar naar de drie belangrijkste dingen in dat werk. Krijg je nu twee keer hetzelfde lijstje? En een jaar geleden? | Bril A: "Kan wie er nu werkt ze noemen?" hapert en is een ja-neevraag. |
| `rcd_expectations` | Waarop werden medewerkers bij jullie aangesproken, en wie had dat vooraf moeten zeggen? Weet wie er nu werkt waarop hij of zij wordt aangesproken? | onhoudbaar | Waarop wordt een medewerker nu aangesproken, en wist die dat vooraf? Waar staan die verwachtingen? Stonden ze er al toen de vertrekkers er nog werkten? | Bril C: "waarop werden medewerkers aangesproken" trekt het gesprek naar de dossiers van vertrekkers die het MT bij naam kent. |
| `rcd_alignment` | Wie had bij jullie de knoop moeten doorhakken als een medewerker van twee kanten iets anders hoorde? Wie doet dat vandaag, en hoe snel? | scherper ° | Een medewerker krijgt nu van twee kanten iets anders te horen. Wie hakt de knoop door, en hoe snel? En toen de vertrekkers er nog werkten? | Alleen het patroon. |
| `rcd_scope` | Wat had er bij jullie afgesproken moeten worden als een takenpakket veranderde: door wie, vooraf of achteraf, wat viel eraf? Hoe gaat dat bij de eerstvolgende wijziging? | scherper | Er verandert nu een takenpakket. Wie bespreekt dat met de medewerker, vóór of na de verandering? Hoe ging dat bij de laatste wijziging? | Bril A: 31 woorden, vier deelvragen en een tijdwissel midden in de zin. |
| `rcd_mandate` | Waarover had iemand in een veelvoorkomende functie bij jullie zelf mogen beslissen, en wie had dat moeten vertellen? Wie vertelt het nu bij de start? | scherper | Neem een functie die veel voorkomt. Waarover beslist iemand in die rol nu zelf, en wie vertelt dat? Was dat een jaar geleden even duidelijk? | Bril A: "iemand in een veelvoorkomende functie" is schrijftaal; de Behoud-opening "Neem een functie" werkt hardop wel. |
| `rcd_information` | Welke informatie of overdracht hadden medewerkers bij jullie nodig om hun werk goed te doen, en wie had die moeten leveren? Wie levert die nu? | scherper ° | Iemand neemt nu een klus of dienst over. Wat moet die weten, en wie zorgt dat het er ligt? En toen de vertrekkers er nog werkten? | Alleen het patroon. |

## 4. De tien vragen waar het rapport het meest op leunt

**Hoe ik heb ingeschat: vooral gezond verstand, de generatorgewichten alleen als controle.** `DIRECTION_WEIGHTS` in `generate_voorbeeldrapport.py` is niet empirisch: het commentaar in de code zegt zelf dat de gewichten zijn gekozen om in het voorbeeldrapport bepaalde staten te laten zien (`clear` op groei, `divided` op werkdruk). Ze zeggen wat Lars plausibel vond, niet wat klanten kiezen.

Drie overwegingen bepalen de lijst:

1. **Welk onderwerp wordt startpunt of tweede punt.** De vraag verschijnt alleen daar. In medewerkersonderzoek scoren groei, werkdruk en beloning doorgaans het laagst, en rolduidelijkheid en samenwerking het hoogst. Bij vertrek zijn groei en de leidinggevende de gebruikelijke koplopers.
2. **Welke route wint binnen dat onderwerp.** Breed herkenbare routes winnen van specifieke ("prioriteiten" wint van "systeemgedoe").
3. **Volgorde-effect.** De eerste inhoudelijke optie na de niets-optie krijgt meer keuzes. Het concept noemt dat effect alleen voor de niets-optie, maar het geldt ook voor `wld_scope`, `ldd_feedback`, `grd_visibility`, `cpd_insight`, `cud_safety` en `rcd_priorities`, die in `DIRECTION_SETS` op die plek staan.

| # | Scan | Route | Waarom waarschijnlijk vaak | In de review |
|---|---|---|---|---|
| 1 | Behoud | `grd_conversation` | Groei is het vaakst startpunt; breedste route; gewicht 0,66; wint in het publieke voorbeeldrapport | scherper: van de vlakste vraag naar "wat weet die ná het gesprek dat die ervoor niet wist" |
| 2 | Behoud | `grd_visibility` | Zelfde onderwerp, eerste plek in de lijst; de meest gekozen toelichting in het voorbeeld ("ik zie niet welke mogelijkheden er voor mij zijn") wijst hierheen | scherper: "voor mij" toegevoegd |
| 3 | Behoud | `wld_priorities` | Werkdruk is het vaakst tweede punt; herkenbaar in elke sector | scherper: het MT zelf in de vraag gezet |
| 4 | Behoud | `wld_recovery` | Hoogste gewicht binnen werkdruk (0,30) en grootste groep in het voorbeeldrapport | scherper: route volledig gedekt, angel "hoe weet het team dat het mag" |
| 5 | Behoud | `wld_planning` | Bezetting is in een krappe arbeidsmarkt de eerste verklaring die medewerkers zelf geven | scherper: drie uitwegen benoemd |
| 6 | Behoud | `ldd_feedback` | Eerste plek in de lijst, breedste leiderschapsroute, gewicht 0,65 | scherper: situatie in plaats van regeling |
| 7 | Behoud | `cpd_review` | Gezond verstand tegen het gewicht in: wie beloning laag scoort vindt meestal dat het loon niet past bij het werk, niet dat het inzicht ontbreekt. De generator geeft deze route geen gewicht | scherper: beloning terug in de vraag |
| 8 | Vertrek | `grd_nextstep` | Geen volgende stap is de klassieke vertrekreden; de route noemt het letterlijk | scherper: onbeantwoordbaar slot vervangen |
| 9 | Vertrek | `ldd_feedback` | De leidinggevende is de andere klassieke vertrekreden; eerste plek in de lijst | scherper: haperende slotzin weg |
| 10 | Vertrek | `wld_scope` | Eerste plek in de lijst binnen werkdruk; "er kwam steeds meer bij" is de herkenbaarste vertrekkersklacht | onhoudbaar in het concept, herschreven |

Op plek 11 staat `cpd_insight` (Behoud): eerste plek in de lijst en gewicht 0,55. Als beloning bij een klant startpunt wordt, is de kans reëel dat deze wint in plaats van `cpd_review`.

Geen van de tien bleef ongewijzigd. Dat is geen toeval: de breedste routes kregen in het concept de vlakste vragen, omdat "wie, hoe vaak, wat" daar het makkelijkst op past.

## 5. Wat ik niet kon beoordelen, en waarom

1. **Hoe het blok eruitziet op de pagina.** "Zo maak je er een besluit van" is nog niet gebouwd (plan 3b), dus of een vraag van dertig woorden naast herkennings- en besluitvraag op de gespreksagenda past, heb ik niet kunnen zien. Van het voorbeeldrapport las ik alleen de tekstlaag; de paginabeelden kon ik niet renderen (geen poppler op deze machine). Pagina 13 is al vol.
2. **Hardop.** De voorleestest is gesimuleerd. Laat de top tien uit sectie 4 door twee of drie HR-collega's hardop voorlezen, in dezelfde ronde als de pretest van de routesets die nog openstaat.
3. **Welke routes echt winnen.** Er zijn geen campagnedata. Sectie 4 is een inschatting; na de eerste twee of drie campagnes is de top tien te tellen en moeten de dan meest gekozen vragen opnieuw langs deze lat.
4. **Het Vertrek-voorbeeldrapport** heb ik niet gelezen, alleen Behoud. Ik heb wel gecontroleerd dat "vertrekkers" de term is die de rapportcode gebruikt.
5. **Sectorpassendheid.** "Klus of dienst", "rooster" en "spoedwerk" passen bij operationeel werk. Bij een kantoororganisatie klinken `rcd_information` en `wld_peaks` wat vreemd. Eén vraag per route kan dat niet oplossen.
6. **De positie van de HR-manager.** Twee herschrijvingen maken van de tafel een proef ("iedere leidinggevende aan deze tafel", "wie aan deze tafel kan nu in twee minuten"), en één geeft een opdracht ("Vraag een medewerker en de leidinggevende..."). Dat zijn de scherpste vormen tegen "dat hebben we al", maar of een HR-manager dat durft voor te lezen aan haar eigen directeur weet alleen een HR-manager. De terugvaloptie voor `cpd_clarity` is het alternatief uit twijfel 6 van het concept.
7. **De herkenningsvraag en de besluitvraag** vielen buiten de opdracht. Eén ding raakt de vertaalvraag wel: de besluitvraag vraagt al naar "over 90 dagen", daarom noemt geen enkele herschrijving een termijn.
8. **Botsing met de spec.** Vorm C wijkt af van "verleden-tijd-stem" in de rapport-spec. Dat is een keuze van Lars, geen redactiewerk; zie 2.1.
