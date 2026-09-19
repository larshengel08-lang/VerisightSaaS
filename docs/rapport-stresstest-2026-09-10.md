# Rapport-stresstest Loep, 10 september 2026

Twintig rapporten gegenereerd over een vaste matrix van datacondities en elk beoordeeld
langs dezelfde zes vragen. Harnas: `scripts/stresstest_report.py` (QA, niet-productie).
Output: `docs/stresstest/` (niet gecommit).

Verdiepingstriggers (`compute_deepening_offers`) en de richtingfactor
(`compute_direction_factor`) komen uit de echte productielogica. De harness levert
alleen ruwe likert-antwoorden en keuzes uit de echte optiesets. Niets gefaket.

**Rendering.** WeasyPrint-Docker draaide niet op deze machine, dus de PDF's zijn via
Chromium gerenderd. Elke pagineringsbevinding hieronder is daarnaast geverifieerd in de
drie gecommitte WeasyPrint-samples (`docs/examples/voorbeeldrapport_*.pdf`), die exact
hetzelfde patroon tonen. Waar een bevinding alleen uit die samples komt staat dat erbij.

---

## (a) Samenvatting in tien regels

1. De **eerlijkheidslaag is het sterkste deel van het product**: noemer-ketens, staffels,
   de vier richtingstaten en de "vrijwel gelijk aan"-cascade werken precies zoals bedoeld.
2. De **conclusielaag ondergraaft die eerlijkheid**: pagina twee spreekt met stelligheid
   waar de onderliggende data een verschil van 0,03 punt is.
3. Het rapport **zegt nergens dat er niets uitspringt**. Bij een vlak profiel kiest het
   toch een startpunt en verkoopt dat als "het eerste gesprekspunt".
4. Het **prioriteringsraster kan een niet-oplopende scorekolom tonen** (6.2, 6.2, 6.3,
   6.2, 6.3) zonder markering van wat de volgorde flipte. Dat leest als een sorteerfout.
5. Bij Loep Vertrek staat er een **feitelijk onjuiste zin op pagina twee**: de genoemde
   factor "scoort het laagst" terwijl een andere factor lager scoort.
6. Bij n<10 valt het rapport **half uit elkaar**: lege ranglijsttabel, kale gedachtestreep
   op de cover, een letterlijke `&#x2014;` in de kernzin en een methodiekpagina die een
   blok belooft dat nergens staat, terwijl acht mensen die vraag wel beantwoordden.
7. De **segmentconclusie fabriceert een afdelingsstartpunt uit ruis**: in 16 van de 17
   scenario's met segmenten is het verschil met nummer twee 0,00 tot 0,30 punt.
8. De **uitleg van het behoudssignaal staat op de kop**: de pagina legt "onder 5,0 is
   kwetsbaar" uit naast een risicogetal waar laag juist goed is.
9. **Zes tot negen van de vijftien à eenentwintig pagina's zijn minder dan halfvol.**
   Dit reproduceert in de live voorbeeldrapporten.
10. **Loep Start levert de USP niet**: geen verdieping, geen richting, geen raster, en het
    rapport zegt dat nergens.

---

## (b) Matrix: scenario x zes vragen

Legenda: ✓ goed, ~ gedeeltelijk, ✗ probleem. Vraagnummers volgen de opdracht.

| # | Scenario | n | Q1 antwoord p2 | Q2 startpunt | Q3 wat moet gebeuren | Q4 holle pagina's | Q5 tegenspraak | Q6 overclaim |
|---|----------|---|----|----|----|----|----|----|
| 01 | Vlak middelmatig | 45 | ~ | ✗ | ✓ | ✗ | ✗ | ✗ |
| 02 | Eén lage factor | 45 | ✓ | ✓ | ~ | ✗ | ~ | ✗ |
| 03 | Twee near-ties | 45 | ✓ | ~ | ✓ | ✗ | ~ | ✗ |
| 04 | Alles hoog | 45 | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| 05 | Alles laag, crisis | 45 | ~ | ✓ | ✓ | ✗ | ✗ | ✗ |
| 06 | Eén afdeling laag | 45 | ✗ | ✗ | ~ | ✗ | ✗ | ✗ |
| 07 | Vertrek, onder drempel | 8 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| 08 | Vertrek, net boven | 12 | ✗ | ~ | ~ | ✗ | ✗ | ✗ |
| 09 | Gemengde afdelingen | 25 | ~ | ✗ | ~ | ✗ | ~ | ✗ |
| 10 | Twaalf kleine afdelingen | 90 | ✓ | ✓ | ~ | ✗ | ✗ | ✗ |
| 11 | Grote populatie | 180 | ~ | ✓ | ✗ | ✗ | ~ | ~ |
| 12 | 60% overslag verdieping | 45 | ✓ | ✓ | ~ | ✗ | ~ | ✗ |
| 13 | 40% "niets nodig" | 45 | ~ | ✓ | ✗ | ✗ | ✗ | ✗ |
| 14 | 35% "Anders" | 45 | ~ | ✓ | ✗ | ✗ | ~ | ✗ |
| 15 | Richting verdeeld | 45 | ~ | ✓ | ~ | ✗ | ✓ | ~ |
| 16 | Respons 30% | 45 | ✓ | ✓ | ✓ | ✗ | ~ | ✗ |
| 17 | Respons 90% | 45 | ✓ | ✓ | ✓ | ✗ | ~ | ~ |
| 18 | Vlak + n=12 | 12 | ✗ | ✗ | ✗ | ✗ | ~ | ✗ |
| 19 | Vlak + 40% niets nodig | 45 | ~ | ✗ | ~ | ✗ | ✗ | ✗ |
| 20 | Loep Start sanity | 30 | ✓ | ~ | ✗ | ✗ | ✗ | ✗ |

Score: Q1 6✓/9~/5✗ · Q2 9✓/3~/8✗ · Q3 5✓/8~/7✗ · Q4 0✓/0~/20✗ · Q5 1✓/8~/11✗ · Q6 0✓/3~/17✗.

---

## (c) Bevindingen

Gegroepeerd per oorzaak, met de scenario's waarin ze optreden. Samen dekken ze elk ✗ in
de matrix. Voorstellen zijn richtingen, geen implementatie.

### B1. Kernzin Loep Vertrek noemt de verkeerde factor als "laagst"
**Ernst: blokkerend.** Scenario's 08 (en 07 in gedegradeerde vorm).

Scenario 08, pagina twee:

> "Het vertrekbeeld is gemengd. Leiderschap en feedback scoort het laagst (4.9/10);
> Beter aanbod elders is de meest genoemde vertrekreden."

Groeiperspectief scoort 4.50, Leiderschap 4.88. De zin is onwaar, en drie pagina's verder
laat het raster beide getallen zien.

Oorzaak: `report_html.py:2183` bouwt de zin met `_raster_rows[0]`, het raster-startpunt,
maar houdt de tekst "scoort het laagst". Het raster-startpunt is per ontwerp niet altijd
de laagste score: de vertrekreden-weging en de spreidings- of verdiepingsvlag kunnen een
andere factor bovenaan zetten. De commentaarregel erboven documenteert precies die
uitlijning, maar de zin is niet meegegaan.

Voorstel: de zin loskoppelen van de aanname. Iets als "X staat bovenaan" plus de al
bestaande `_raster_attribution`-regel die uitlegt waarom.

### B2. Bij n<10 breekt het rapport zichtbaar
**Ernst: blokkerend.** Scenario 07.

Cover: "Eerste aandachtspunt: —". Kernzin, letterlijk zoals gerenderd:

> "Het vertrekbeeld is gemengd. — scoort het laagst (&#x2014;); Organisatiecultuur is de
> meest genoemde vertrekreden."

Drie defecten in één zin. Ten eerste een kale gedachtestreep waar een factornaam hoort.
Ten tweede de literal `&#x2014;`: `_score_str(None)` geeft een HTML-entiteit terug als
string, die daarna door `_h()` nog een keer wordt geëscaped. Ten derde botst de
gedachtestreep als placeholder met de projectregel dat er geen em-dashes in klantcopy staan.

Op dezelfde pagina: de kop "Waarom bovenaan staat" (zonder onderwerp) en het label
"Gespreksopener" met een lege vraag eronder.

Voorstel: één expliciete degraded-variant van pagina twee voor n<10, met een echte zin
over wat wel en niet kan bij dit aantal, in plaats van dezelfde template met lege gaten.

### B3. Richtingdata verdwijnt zonder melding, terwijl de methodiekpagina hem belooft
**Ernst: blokkerend.** Scenario 07.

Acht respondenten kregen de richtingvraag, zes beantwoordden hem. Het blok "Wat er moet
gebeuren" komt nergens voor, want het hangt aan de raster-rijen en die zijn leeg bij n<10.
De methodiekpagina achterin zegt intussen:

> "De opdrachtvorm in 'Wat er moet gebeuren' geeft de keuze van die respondenten weer,
> geen advies van Loep."

Het rapport belooft een sectie die er niet is en gooit tegelijk verzamelde antwoorden weg.
Dat is precies de stille degradatie die het Fail-Loud-principe verbiedt. De
`direction_active`-gate kijkt naar `direction_agg`, niet naar of er ook echt kaarten
gerenderd worden.

Voorstel: de gate koppelen aan wat werkelijk gerenderd is, en bij n<10 het richtingblok
tonen met de eigen `too_few`-staat in plaats van het weg te laten.

### B4. De uitleg van het behoudssignaal staat op de kop
**Ernst: blokkerend.** Alle retention-scenario's, plus dezelfde constructie bij Loep Start.

`SECTION_INTROS["behoudscontext"]` (report_html.py:411):

> "Het behoudssignaal is een samenvattende groepsscore ... één getal tussen 1 en 10.
> Onder de 5,0 noemen we een score kwetsbaar, tussen 5,0 en 6,5 een aandachtspunt, vanaf
> 6,5 relatief sterk."

Direct daaronder in scenario 04: "Behoudssignaal 3.0/10 · sterk". In scenario 05:
"6.9/10 · vraagt aandacht". Het getal is een risicoscore, waar laag goed is; de uitleg
ernaast is de gezondheidsladder, waar laag slecht is. Dezelfde inversie zit in de
kernzin op pagina twee ("Behoudsklimaat stabiel (behoudssignaal 4.2/10)") en in de
checkpoint-intro van Loep Start ("checkpointscore 4.7/10 · gemengd" naast "onder de 5,0
noemen we een score kwetsbaar").

Een MT-lid dat de uitleg leest en dan het getal ziet, trekt de tegenovergestelde conclusie
van wat het label zegt.

Voorstel: kies één polariteit voor alles wat "/10" toont. Ofwel het behoudssignaal
omdraaien naar de gezondheidsschaal die de rest van het rapport gebruikt, ofwel de
intro-alinea herschrijven met de risico-drempels erin.

### B5. Het raster toont een niet-oplopende scorekolom
**Ernst: belangrijk.** Scenario's 06, 08, 01, 09, 19.

Scenario 06, de scorekolom van boven naar beneden: 6.2, 6.2, 6.3, 6.2, 6.3, 6.5. Rij 1 en
rij 4 tonen exact hetzelfde getal, maar rij 1 heet "Startpunt" en rij 4 heeft geen
agenda-rol. Rij 3 (6.3) staat boven rij 4 (6.2).

De oorzaak is legitiem: spreidingsvlaggen verschuiven de sorteersleutel met 0,3. Maar het
raster claimt in zijn eigen intro:

> "De volgorde is daarmee navolgbaar: je ziet per factor wat meewoog."

De rij die een bump kreeg is nergens gemarkeerd. Bij Loep Vertrek is het erger: daar
verschuift ook de vertrekreden-weging de volgorde, en daar heeft de tabel niet eens een
kolom voor (scenario 08: 4.9 boven 4.5).

Voorstel: markeer de rijen waar een vlag de doorslag gaf, bijvoorbeeld met een tekstje in
de agendakolom in dezelfde stijl als "vrijwel gelijk aan". En geef Loep Vertrek een
kolom voor de vertrekredentelling.

### B6. Het rapport zegt nooit dat er niets uitspringt
**Ernst: belangrijk.** Scenario's 01, 04, 06, 09, 18, 19. Dit is Lars' oorspronkelijke zorg
en hij is terecht.

Scenario 01, zes factoren tussen 5,67 en 6,33. Pagina twee:

> "Groeiperspectief is het eerste gesprekspunt."
> "Gebaseerd op de laagst scorende factor."

Groeiperspectief scoort 5,67, Beloning 5,70. Beide worden getoond als 5.7. Het verschil
dat de startpuntkeuze bepaalt is 0,03 punt, en het staat nergens. Sterker: de enige
zichtbare tie-break-input wijst de ándere kant op. In de spreidingskolom scoren 11 van 45
onder de 5 bij Groeiperspectief en 13 van 45 bij Beloning.

Het dichtste dat het rapport bij eerlijkheid komt is de zin "Geen factor scoort kritisch.
De laagste score zit bij Groeiperspectief" en de "vrijwel gelijk aan"-cascade in de
agendakolom van het raster, op pagina negen van achttien. Pagina twee heeft geen enkele
rem.

Scenario 04 is de scherpste vorm. Alle factoren 7,8 tot 8,1. Pagina twee zegt
"Rolhelderheid en eigenaarschap is het eerste gesprekspunt", en de onderbouwingscel eronder
zegt letterlijk "7.8/10 · relatief sterk". De kop erboven is "Waarom Rolhelderheid en
eigenaarschap bovenaan staat".

**De richtingdata biedt de verdedigbare grond die Lars zoekt, en wordt niet gebruikt.**
`rank_factors` kent alleen score, spreidingsvlag en verdiepingsvlag. In scenario 01 ziet
de richtingverdeling er zo uit:

| Factor | eigen laagste bij | beantwoord | zei "niets nodig" | vroeg om verandering |
|---|---|---|---|---|
| Leiderschap | 12 | 11 | 1 | 10 |
| Groeiperspectief (startpunt) | 11 | 11 | 2 | 9 |
| Werkdruk | 8 | 5 | 1 | 4 |
| Beloning | 7 | 7 | 1 | 6 |
| Cultuur | 6 | 6 | 1 | 5 |
| Rolhelderheid | 1 | 1 | 0 | 1 |

Meer mensen vragen om verandering op Leiderschap (6,17, vierde in het raster) dan op het
gekozen startpunt. Dat is een navolgbaar, uitlegbaar criterium dat nu ongebruikt blijft.

Voorstel: (1) een expliciete vlakke-profiel-zin op pagina twee zodra de spreiding tussen de
hoogste en laagste factor onder een drempel blijft, en (2) de richtingdata als tie-break
opnemen in `rank_factors` wanneer de scores binnen de marge liggen.

### B7. Segmentconclusie maakt een startpunt van ruis
**Ernst: belangrijk.** Scenario's 01 t/m 05, 09 t/m 20. Alle scenario's met segmenten
behalve 06.

Het navy-blok onderaan de segmentpagina heeft het zwaarste visuele gewicht van het hele
rapport. Scenario 01:

> "**Startpunt voor de bespreking.** Sales heeft de laagste score (6.0/10; 8 van de 13
> uitgenodigden vulden in)."

Het verschil met nummer twee, over alle scenario's:

| Delta met nr. 2 | Scenario's |
|---|---|
| 0,00 | 02, 19 |
| 0,01 tot 0,10 | 01, 03, 04, 05, 11, 12, 14, 16, 17, 20 |
| 0,11 tot 0,30 | 09, 10, 13, 15 |
| 2,51 | 06 |

In 16 van de 17 gevallen is de "laagste afdeling" statistisch niet te onderscheiden van de
volgende. In scenario 02 en 19 zijn twee afdelingen exact gelijk en wordt er willekeurig
één aangewezen.

Daar komt bij dat de zin twee keer aantoonbaar onjuist is. In scenario 01 staat
"Overige afdelingen" op 5,86 in dezelfde tabel, lager dan de als laagste aangewezen Sales
op 6,02. In scenario 05 idem: pooled 3,84 tegen Customer Success 4,02. `_segment_block`
slaat de pooled-rij bewust over bij het bepalen van "lowest", maar de rij staat wel in de
tabel erboven.

Voorstel: alleen een afdelingsstartpunt benoemen bij een betekenisvol verschil, en anders
expliciet zeggen dat de afdelingen dicht bij elkaar liggen. En de pooled-rij noemen zodra
die lager uitkomt dan de aangewezen afdeling.

### B8. Afdelingen met genoeg respons verdwijnen stilzwijgend in de restgroep
**Ernst: belangrijk.** Scenario 10.

De intro belooft:

> "Afdelingen met minder dan vijf responses worden gebundeld onder 'Overige afdelingen'."

In scenario 10 hebben twaalf afdelingen elk 7 tot 9 responses. Zeven komen in de tabel,
vijf verdwijnen in "Overige afdelingen" (n=31), waaronder Operations met negen responses,
de grootste afdeling van de meting. Oorzaak is de max-8-rijen-cap in
`_department_segment_rows`, die de intro niet noemt. Voor de lezer is de uitleg dus
aantoonbaar onwaar en negen mensen zijn onvindbaar.

Voorstel: de cap benoemen in de copy, of de tabel laten doorlopen bij meer kwalificerende
afdelingen.

### B9. Zes tot negen pagina's per rapport zijn minder dan halfvol
**Ernst: belangrijk.** Alle twintig scenario's, en bevestigd in de live voorbeeldrapporten.

Gemeten als hoogte van de laatste tekstregel ten opzichte van de paginahoogte, footer niet
meegerekend. Terugkerende patronen:

| Pagina | Vulling | Aard |
|---|---|---|
| p3 | 7 tot 17% | Eén verweesde regel: "Beschikbaar: segmentbeeld verderop in dit rapport." of het Datastatus-blok |
| Verdieping, 3 pagina's | 30 tot 53% | Score, spreidingsstrip, tabel met 3 rijen |
| "Verbondenheid" | 23 tot 25% | De derde SDT-dimensie valt alleen op een pagina |
| Werkgeversaanbeveling | 26 tot 41% | Eén getal |
| Segmentconclusie los | 9% | Alleen het navy-blok (scenario 04, 05) |

Dit is geen artefact van Chromium. De gecommitte WeasyPrint-samples tonen hetzelfde:
`voorbeeldrapport_loep.pdf` p3 op 17%, p10 op 25%, p14 op 36%;
`voorbeeldrapport_retentiescan.pdf` p10 op 23%, p11 op 26%;
`voorbeeldrapport_onboarding.pdf` p3 op 12%, p7 op 35%.

Voor een product waarvan de belofte is "het antwoord staat op pagina twee" is een rapport
van achttien pagina's waarvan er acht bijna leeg zijn een tegenstrijdig signaal.

Voorstel: de drie verdiepingspagina's samenvoegen tot één, de SDT-blokken laten
doorlopen in plaats van elk een eigen pagina, en de eNPS-score bij de responsbasis zetten.

### B10. Cover-label loopt buiten de pagina bij lange factornamen
**Ernst: belangrijk.** Bevestigd in de live WeasyPrint-sample, niet reproduceerbaar in
Chromium.

`docs/examples/voorbeeldrapport_onboarding.pdf`, de publieke voorbeeldsample: de derde
coverstat toont "Informatiedichtheid e" met de rest afgesneden aan de rechterrand, en
"werktempo" op de regel eronder. Het tekstblok loopt tot x=597 op een pagina van 595 punt
breed. De retention-labels "Cultuur en psychologische veiligheid" en "Rolhelderheid en
eigenaarschap" zijn even lang.

Voorstel: de coverstat laten afbreken binnen de kolom, of een kortere weergavenaam voor
de cover.

### B11. "Hier hoeft volgens de meeste betrokkenen niets" bij twee van de vier
**Ernst: belangrijk.** Scenario's 02, 04, 13.

Scenario 02, tweede punt:

> "Hier hoeft volgens de meeste betrokkenen niets."
> "2 van de 4 bij wie dit het laagst scoorde kozen 'Niets, dit zit hier goed'."

Twee van vier is niet "de meeste", het is de helft. De `none_needed`-drempel is
`>= 0.5`, dus een gelijkspel valt binnen de staat. Scenario 13 heeft dezelfde constructie
bij 2 van 3.

Voorstel: de kopregel afhankelijk maken van de werkelijke verhouding, of de drempel
strikt boven de helft leggen.

### B12. Bij een groot en verdeeld beeld levert het richtingblok niets
**Ernst: belangrijk.** Scenario's 11, 13, 09, 18, 19.

Scenario 11, n=180, 62 mensen beantwoordden de richtingvraag op het startpunt:

> "Geen eenduidige richting. De 62 bij wie dit het laagst scoorde kozen verschillend."

De werkelijke verdeling van die 62 antwoorden: 27 kozen "Beter zicht op welke
mogelijkheden er voor mij zijn" (44%), 15 kozen "Niets, dit zit hier goed" (24%), 10 een
concreter ontwikkelgesprek (16%), de rest verdeeld. De regel is absoluut: top boven 50%
én voorsprong van minstens 2. Bij 44% met een voorsprong van 12 op nummer twee zegt het
rapport dus "geen richting", terwijl er een duidelijk grootste groep is. De tabel eronder
toont de percentages, maar de kop, de regel op pagina twee en de gespreksopener dragen
geen signaal.

Scenario 13 is de omgekeerde variant: 14 kozen "Niets, dit zit hier goed" en 14 kozen
"Beter zicht op welke mogelijkheden er voor mij zijn", op een factor die 4,5 scoort met
30 van de 45 onder de 5. Dat is inhoudelijk het interessantste resultaat in de hele
matrix, en het rapport zegt er niets over.

Voorstel: bij grotere n een tussenvorm, bijvoorbeeld "de grootste groep kiest X, maar
zonder meerderheid", en een expliciete regel wanneer de niets-optie meedingt om de eerste
plaats op een laag scorende factor.

### B13. "Anders, namelijk" wordt de topkeuze en het rapport zegt er niets over
**Ernst: belangrijk.** Scenario 14.

Richtingtabel op het startpunt: "Anders, namelijk… 30% (9)", de hoogste rij.
Verdiepingstabel op dezelfde factor: "Anders, namelijk… 39% (7)", ook de hoogste.

Negen mensen typten een toelichting. Die tekst staat in de database, komt nergens in het
rapport, en het rapport vermeldt niet dat hij bestaat. De code logt wel een waarschuwing
naar de server, maar de lezer krijgt niets.

Voorstel: een regel bij de tabel zodra de Anders-optie in de top staat, met de telling en
de mededeling dat de toelichtingen niet in dit rapport zijn opgenomen. Eventueel een
geanonimiseerde weergave, langs dezelfde lijn als het open tekstveld.

### B14. Twee verschillende getallen voor hetzelfde thema, zonder brug
**Ernst: belangrijk.** Scenario's 01, 05, 09, 13, 16.

Voor één en dezelfde factor toont het rapport twee noemers die vaak sterk verschillen,
omdat de verdieping op een trigger loopt en de richting op "wiens eigen laagste factor is
dit".

Scenario 01, Groeiperspectief, verdiepingspagina:

> "Van de 2 respondenten met een verdieptrigger op groeiperspectief kregen 2 de
> verdiepingsvraag; 1 beantwoordden die. Te weinig verdiepingsantwoorden om een verdeling
> te tonen."

Zeven pagina's verder, over dezelfde factor:

> "Van de 45 respondenten hadden 11 dit als laagste; 11 beantwoordden de vraag."

Scenario 05 is extremer: Werkdruk heeft 18 verdiepingsantwoorden en 6 richtingantwoorden.
Scenario 16 laat zien wat dat inhoudelijk doet: de gespreksopener komt uit de verdieping
("Wordt er concreet genoeg met medewerkers over ontwikkeling gesproken?") terwijl de
opdrachtvorm uit de richting komt ("Maak zichtbaar welke mogelijkheden er zijn"). Twee
verschillende antwoorden op dezelfde vraag, naast elkaar, zonder toelichting.

Voorstel: één zin die uitlegt waarom de twee tellingen verschillen, op de plek waar de
tweede voor het eerst verschijnt.

### B15. Bandlabel spreekt de getoonde score tegen op de grens
**Ernst: belangrijk.** Scenario's 03, 13, 19, 20. Vier van de negentien, dus geen randgeval.

Scenario 20, werkbelevingspagina, drie regels onder elkaar:

> Autonomie 6.5/10 · Relatief sterk
> Competentie 6.5/10 · Aandachtspunt
> Verbondenheid 6.5/10 · Relatief sterk

De onderliggende waarden zijn 6,55, 6,47 en 6,55. De weergave rondt af naar één decimaal,
het label niet. De methodiekpagina in hetzelfde rapport zegt: "relatief sterk (vanaf 6,5)".
Een lezer ziet drie keer 6,5 met twee verschillende conclusies, tegen een regel die het
rapport zelf afdrukt.

Voorstel: het label op de afgeronde, getoonde waarde baseren, of twee decimalen tonen waar
de afronding de band kruist.

### B16. Enkelvoudsfouten in de verdiepingsketen
**Ernst: cosmetisch, maar zichtbaar.** 7 van de 19 rapporten met verdiepingsdata.

> "Van de 1 respondenten met een verdieptrigger op beloning en eerlijkheid kregen 1 de
> verdiepingsvraag; 1 beantwoordden die."

Drie fouten in één zin. `_direction_chain` heeft wél nette enkelvoudsafhandeling
("1 beantwoordde de vraag", "1 sloeg over"); `_deepening_chain` heeft er geen.

Voorstel: dezelfde enkelvoudslogica overnemen uit `_direction_chain`.

### B17. Crisis en middelmaat krijgen hetzelfde bandlabel
**Ernst: belangrijk.** Scenario's 01 en 05.

Scenario 01: "Behoud vraagt aandacht (behoudssignaal 4.9/10)."
Scenario 05: "Behoud vraagt aandacht (behoudssignaal 6.9/10)."

In scenario 05 scoren alle zes factoren kwetsbaar en scoren 42 van de 45 respondenten onder
de 5 op Leiderschap. Het label is identiek aan een organisatie waar geen enkele factor
kritisch scoort. De MIDDEN-band loopt van 4,5 tot 7,0 en dekt daarmee het hele bruikbare
bereik.

Voorstel: de band opsplitsen, of de kernzin laten meebewegen met het aantal factoren in de
kwetsbare zone in plaats van alleen met het totaalgetal.

### B18. Loep Start levert de USP niet en zegt dat niet
**Ernst: belangrijk.** Scenario 20.

Geen verdiepingsvragen, geen richtingvraag, geen prioriteringsraster. De pagina's heten
wel "Verdieping: X", maar bevatten alleen de score en de drie stellingen. De
gespreksagenda gebruikt nog de oude `_eerste_managementspoor`-route.

Waar Loep Behoud en Loep Vertrek een blok "Wat er moet gebeuren" hebben, heeft Loep Start
niets, en er staat nergens dat dit product die laag mist. De methodiekpagina belooft
gelukkig ook niets, dus dit is geen onwaarheid, wel een gat in het aanbod.

Bijkomend op dezelfde agendapagina: dezelfde constatering staat twee keer onder elkaar
("Op deze stelling scoort de groep het laagst van het hele beeld" en "Laagst scorende
stelling in het cijferbeeld (5.1/10)"), en de claim "het laagst van het hele beeld" klopt
niet: een stelling bij Rolhelderheid scoort ook 5,1.

Voorstel: de v1.1-verdiepingsset voor Loep Start prioriteren, en tot die tijd één regel in
het rapport die zegt wat dit product wel en niet levert.

### B19. Responspercentage heeft nergens gevolgen
**Ernst: belangrijk.** Scenario's 16 en 17.

Dezelfde populatie, dezelfde scores, 30% respons tegenover 90% respons. De rapporten zijn
structureel identiek. Het getal staat in de responsbasis, en verder nergens: geen zin over
non-responsvertekening, geen aangepaste stelligheid, geen markering.

Bij een uitstroommeting waar 105 van de 150 mensen niets invulden is dat de eerste vraag
die een MT-lid stelt.

Voorstel: een responsafhankelijke regel bij de responsbasis en, onder een drempel, een
zichtbare rem op de stelligheid van pagina twee.

### B20. Bij n=8 verdwijnt het factorprofiel, maar de SDT-items en eNPS blijven staan
**Ernst: belangrijk.** Scenario 07.

Het overzichtsprofiel zegt netjes "Onvoldoende responses (<10) voor een groepsprofiel op
factorniveau". Twee pagina's verder staan twaalf SDT-itemgemiddelden op één decimaal, over
diezelfde acht mensen. En daarna een eNPS van −50, ook over acht mensen.

De drempel geldt dus voor het ene aggregaat en niet voor het andere, zonder uitleg. De
methodiekpagina zegt: "5+ responses indicatief · 10+ voor patroonduiding".

Voorstel: één drempelregel voor alle groepsaggregaten, of expliciet maken waarom SDT en
eNPS een andere drempel hebben.

---

## Waar het rapport het goed doet

Niet repareren wat werkt.

- **De noemer-keten van de richtingvraag.** "Van de 45 respondenten hadden 37 dit als
  laagste; 36 beantwoordden de vraag, 1 sloeg over." Enkelvoud netjes afgehandeld, en de
  keten laat elke stap zien. Dit is de sterkste eerlijkheidsconstructie in het product.
- **De vier richtingstaten werken.** In scenario 04, de gezonde organisatie, komt er
  precies uit wat er uit moet komen: "Hier hoeft volgens de meeste betrokkenen niets.
  Bespreek of dit dan het startpunt moet zijn." Dat is de ontsnappingsklep en hij doet het.
- **De "vrijwel gelijk aan"-cascade** in de agendakolom van het raster is de enige plek in
  het hele rapport die een vlak profiel eerlijk laat zien. De informatie is er, alleen op
  de verkeerde pagina.
- **De staffels kloppen.** Percentages pas vanaf 10, alleen tellingen daaronder, caveat bij
  4 of minder voor richting en 9 of minder voor verdieping, geen verdeling onder 5.
- **De polarisatiezin vuurt precies waar hij moet.** Scenario 06: "Verdeeld beeld: X van
  de 45 respondenten scoren in de laagste zone, Y in de hoogste. Dit gemiddelde beschrijft
  twee verschillende ervaringen." Drie keer, alleen in het scenario met een echte
  tweedeling.
- **De segment-factorlaag met staffel.** Bij 5 tot 9 responses alleen een duidingslabel,
  vanaf 10 het cijfer. In scenario 06 wijst die laag exact aan wat er aan de hand is:
  Operations 4,5 met alle zes de factoren kwetsbaar tegenover 7,0 tot 7,4 elders.
- **De hoofdstuknummering schuift correct mee** met conditionele secties, in alle twintig
  varianten, ook bij zes weggevallen blokken.
- **Anonimiseringslabels** staan consequent bij elk open antwoord.

---

## (d) Top vijf fixes, geprioriteerd

Weging: hoe waarschijnlijk bij een echte klant, maal hoe erg als het gebeurt.

**1. Kernzin en gedegradeerde staat op pagina twee (B1, B2, B3).**
Waarschijnlijkheid hoog, gevolg maximaal. Een Loep Vertrek bij een MKB-klant van 150
medewerkers levert 6 tot 15 responses per jaar. Dat is precies het bereik waarin B1 en B2
vuren. Een aantoonbaar onjuiste zin op pagina twee, of een kale gedachtestreep waar een
factornaam hoort, kost het rapport in één klap zijn geloofwaardigheid. B3 hoort erbij
omdat het dezelfde n-conditie is en het Fail-Loud-principe direct schendt.

**2. Polariteit van het behoudssignaal (B4).**
Waarschijnlijkheid honderd procent, gevolg groot. Elk Loep Behoud-rapport bevat deze
tegenstrijdigheid nu. Het is bovendien de goedkoopste fix van de vijf: één alinea copy of
één omkering. Zolang hij er staat, leest een oplettende lezer het kerngetal precies
verkeerd om.

**3. Vlak profiel eerlijk benoemen en de richtingdata als tie-break gebruiken (B6, B5).**
Waarschijnlijkheid hoog, gevolg groot. Dit is Lars' zorg en de matrix bevestigt hem: 8 van
de 20 scenario's krijgen een startpunt dat op een verschil van hooguit 0,1 punt rust. Het
raster laat de gebruikte signalen wel zien maar niet welk signaal de doorslag gaf, en het
signaal dat het beste discrimineert (waar vragen de meeste mensen om verandering) doet niet
mee. Dit is ook de fix met de meeste inhoudelijke opbrengst: hij maakt het antwoord op
pagina twee bruikbaar in plaats van alleen stellig.

**4. Segmentconclusie alleen bij een echt verschil (B7, B8).**
Waarschijnlijkheid zeer hoog, gevolg groot. In 16 van de 17 scenario's benoemt het
zwaarste visuele element van het rapport een afdeling op grond van 0,00 tot 0,30 punt
verschil, twee keer met een aantoonbaar onjuiste "laagste"-claim. Dit is het soort
bevinding dat een afdelingsmanager in de bespreking direct aanvecht, en dan terecht.

**5. Paginavulling (B9, B10).**
Waarschijnlijkheid honderd procent, gevolg middelgroot. Zichtbaar in elk rapport en in de
live voorbeeldrapporten die prospects nu al downloaden. Het is een positioneringsprobleem
meer dan een correctheidsprobleem, maar bij een prijs van 4.500 euro is een rapport waarvan
acht van de achttien pagina's bijna leeg zijn een verkeerd signaal. B10 hoort erbij omdat
het afgesneden coverlabel op dit moment op de publieke Loep Start-sample staat.

Daarna, in volgorde: B11 en B15 (kleine, goedkope eerlijkheidsfixes), B12 en B13
(inhoudelijk interessant, meer ontwerpwerk), B16 (klein), B17, B19, B14, B20, B18.

---

## Na ronde 1 (11 september 2026)

Branch `fix/rapport-stresstest-ronde-1`. Acht bevindingen waren in scope: **B1, B2, B3,
B4, B10, B11, B15, B16**. De rest was expliciet ronde 2 of 3. Alle twintig scenario's zijn
opnieuw gegenereerd met de gefixte code en langs dezelfde zes vragen gelegd; elke claim is
getoetst aan de `.meta.json` in plaats van aan het rapport zelf. B10 is gemeten in de
WeasyPrint-PDF, want dat defect bestond alleen daar.

### Matrix na ronde 1

| # | Scenario | n | Q1 antwoord p2 | Q2 startpunt | Q3 wat moet gebeuren | Q4 holle pagina's | Q5 tegenspraak | Q6 overclaim |
|---|----------|---|----|----|----|----|----|----|
| 01 | Vlak middelmatig | 45 | ~ | ✗ | ✓ | ✗ | ✗ | ✗ |
| 02 | Eén lage factor | 45 | ✓ | ✓ | ~ | ✗ | ✓ | ✗ |
| 03 | Twee near-ties | 45 | ✓ | ~ | ✓ | ✗ | ✓ | ✗ |
| 04 | Alles hoog | 45 | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| 05 | Alles laag, crisis | 45 | **✓** | ✓ | ✓ | ✗ | ✗ | ✗ |
| 06 | Eén afdeling laag | 45 | ✗ | ✗ | ~ | ✗ | **~** | ✗ |
| 07 | Vertrek, onder drempel | 8 | **~** | **~** | **~** | ✗ | **~** | ✗ |
| 08 | Vertrek, net boven | 12 | **✓** | ~ | ~ | ✗ | **~** | **~** |
| 09 | Gemengde afdelingen | 25 | ~ | ✗ | ~ | ✗ | ~ | ✗ |
| 10 | Twaalf kleine afdelingen | 90 | ✓ | ✓ | ~ | ✗ | ✗ | ✗ |
| 11 | Grote populatie | 180 | ~ | ✓ | ✗ | ✗ | ~ | ~ |
| 12 | 60% overslag verdieping | 45 | ✓ | ✓ | ~ | ✗ | **✓** | ✗ |
| 13 | 40% "niets nodig" | 45 | ~ | ✓ | ✗ | ✗ | **~** | ✗ |
| 14 | 35% "Anders" | 45 | ~ | ✓ | ✗ | ✗ | ~ | ✗ |
| 15 | Richting verdeeld | 45 | ~ | ✓ | ~ | ✗ | ✓ | ~ |
| 16 | Respons 30% | 45 | ✓ | ✓ | ✓ | ✗ | ~ | ✗ |
| 17 | Respons 90% | 45 | ✓ | ✓ | ✓ | ✗ | ~ | ~ |
| 18 | Vlak + n=12 | 12 | ✗ | ✗ | ✗ | ✗ | ~ | ✗ |
| 19 | Vlak + 40% niets nodig | 45 | ~ | ✗ | ~ | ✗ | **~** | ✗ |
| 20 | Loep Start sanity | 30 | ✓ | ~ | ✗ | ✗ | ✗ | ✗ |

Gewijzigde cellen vet. Score: Q1 9✓/8~/3✗ · Q2 10✓/4~/6✗ · Q3 6✓/9~/5✗ ·
Q4 0✓/0~/20✗ · Q5 3✓/13~/4✗ · Q6 0✓/4~/16✗.
Was: Q1 6✓/9~/5✗ · Q2 9✓/3~/8✗ · Q3 5✓/8~/7✗ · Q4 0✓/0~/20✗ · Q5 1✓/8~/11✗ · Q6 0✓/3~/17✗.

Beoordelingsregel: een cel beweegt alleen als de bevindingen die hem droegen tot de acht
gefixte horen én geen openstaande bevinding dezelfde cel zelfstandig op hetzelfde niveau
houdt. Daarom bewegen dertien van de honderdtwintig cellen terwijl acht bevindingen weg
zijn: in de meeste cellen zit ook een bevinding uit ronde 2.

### Wat er per bevinding veranderde

| # | Status | Bewijs |
|---|---|---|
| B1 | **gefixt** | Scenario 08: "Bovenaan staat Leiderschap en feedback (4.9/10)" in plaats van "scoort het laagst", terwijl Groeiperspectief 4,50 scoort. De tekenreeks "scoort het laagst" komt in geen van de twintig rapporten meer voor. Bijvangst: dezelfde onware regel stond in de gedeelde overzichtsprofiel-intro en in de vertrekcontext. |
| B2 | **gefixt** | Scenario 07: cover toont "Nog geen factorprofiel", de kernzin is een echte zin, en een eigen blok noemt het aantal (8) en de drempel (10). Nul treffers op de dubbel geescapete entiteit, op een em-dash en op de onderwerploze kop in alle twintig. |
| B3 | **gefixt** | Scenario 07 toont het blok "Wat er moet gebeuren" met de keten 8 aangeboden, 7 beantwoord, 1 overgeslagen. De methodiekpagina belooft in die staat geen opdrachtvorm meer. De gate hangt nu aan het gerenderde blok, niet aan het bestaan van data. |
| B4 | **gefixt** | Scenario 04: 8.0/10 "sterk" (was 3.0/10 "sterk"). Scenario 05: 4.1/10 "onder druk" (was 6.9/10 "vraagt aandacht"). Scenario 20: checkpointscore 6.3/10 "Gemengd onboardingsbeeld". De omkering gebeurt op één plek; de opslag is niet aangeraakt en het dashboard ging in lockstep mee. |
| B5 | open | Scenario 06 leest 6.2 · 6.2 · 6.3 · 6.2 · 6.3 · 6.5 zonder markering van welke vlag de volgorde flipte. |
| B6 | open | Scenario 01: zes factoren tussen 5,67 en 6,33 en toch een startpunt. Scenario 04: startpunt op 7,8 met het label "relatief sterk". |
| B7 | open | Scenario 01: "Sales heeft de laagste score (6.0/10)" terwijl "Overige afdelingen" op 5,86 staat in dezelfde tabel. |
| B8 | open | Scenario 10: vijf afdelingen met 7 tot 9 responses verdwijnen in de restgroep, tegen een intro die vijf als grens noemt. |
| B9 | open | Onveranderd. Alleen scenario 07 telt minder pagina's, als neveneffect van het onderdrukken van lege secties. |
| B10 | **gefixt** | Gemeten in de WeasyPrint-PDF op de drie langste factornamen: uiterste x 521, 476 en 500 op een pagina van 595 punt, tegen een rechtermarge van 539. Voorheen liep het blok tot 597. |
| B11 | **gefixt** | Scenario 02, tweede punt: "Geen eenduidige richting" bij 2 van de 4. De overgebleven none-staten rusten op echte meerderheden (4 van 7, 5 van 8, 2 van 3). Bijvangst: de clear-tak bleek de niets-optie al uit te sluiten, dus een opdrachtvorm die zegt dat er niets hoeft kan niet ontstaan. |
| B12 | open | Scenario 11: grootste groep 44% met 12 voorsprong heet nog steeds "geen eenduidige richting". |
| B13 | open | Scenario 14: "Anders, namelijk" staat bovenaan zonder dat het rapport meldt dat die toelichtingen bestaan. |
| B14 | open | Scenario 01: verdieping 2 getriggerd tegenover richting 11 van de 45, op dezelfde factor, zonder brugzin. |
| B15 | **gefixt** | Scenario 20: drie regels 6.5/10 met hetzelfde label. Over alle twintig rapporten geen enkele combinatie van getoonde score en bandlabel die elkaar tegenspreekt. |
| B16 | **gefixt** | Nul treffers op de drie meervoudsfouten uit de geciteerde zin. |
| B17 | **vervalt in deze vorm** | Scenario 01 en 05 dragen niet langer hetzelfde label (6.1/10 "vraagt aandacht" tegenover 4.1/10 "onder druk"). Oorzaak is de B4-omkering: de middenband liep op de risicoschaal van 4,5 tot 7,0 en loopt op de gezondheidsschaal van 5,0 tot 6,5. Het voorstel uit de bevinding is niet gebouwd, dus structureel is er niets afgedekt. |
| B18 | open | Scenario 20 heeft geen verdieping, geen richtingvraag en geen raster, en zegt dat nergens. |
| B19 | open | Scenario 16 en 17 zijn structureel identiek. |
| B20 | open | Scenario 07 toont nog twaalf SDT-itemgemiddelden en een eNPS over dezelfde acht mensen. Wel noemt de nieuwe alinea op p.02 die secties nu expliciet, dus onaangekondigd zijn ze niet meer. |

Geen enkele buiten-scope-bevinding is stilzwijgend verdwenen.

### Wat de ronde zelf introduceerde en wat daarmee gebeurde

De herbeoordeling vond één echte regressie. De B4-fix zette in de behoudscontext-intro
"Hoe hoger, hoe beter, net als bij elke andere score in dit rapport", terwijl vier regels
lager vertrekintentie staat, waar een hoge score juist meer vertrekgedachten betekent. Dat
is dezelfde inversie die B4 wegnam, een rij lager, en nu expliciet universeel gemaakt.
Aanwezig in alle zeventien Loep Behoud-rapporten. **Gefixt** in commit `0c7f4992`: de claim
is beperkt tot het signaal zelf en een regel benoemt de omgekeerde rij. In dezelfde commit
zijn twee kleinere beloftes rechtgezet: de opsomming "Wat dit rapport wel laat zien" liet
de werkgeversaanbeveling weg terwijl die sectie in dezelfde staat wel rendert, en de
eNPS-intro verwees naar factoren die er zonder factorprofiel niet zijn. De matrix hierboven
is de stand na die fix.

Twee observaties uit dezelfde herbeoordeling zijn **niet** opgelost en horen bij ronde 2.
De verwijzing "bij de gespreksagenda zie je per factor welke signalen meewogen" klopt voor
de spreidings- en verdiepingsvlag, maar niet voor de vertrekreden-weging: daar heeft het
raster geen kolom voor, en dat is B5. En de spreidingsstrook van vertrekintentie draait de
schaal om, waardoor de rij 3.4 toont en de strook 7.6 voor dezelfde vraag; dat dateert van
juli en stond niet in de oorspronkelijke twintig bevindingen.

### Verificatie van de ronde

Backend-suite 25 gefaald, 736 geslaagd, 5 overgeslagen, met een faalset die byte-identiek
is aan de baseline van voor de branch; er zijn ruim 180 tests bijgekomen. Frontend tsc 133
en vitest 65 gefaald, beide gelijk aan de baseline. De drie voorbeeldrapporten zijn
geregenereerd en door WeasyPrint-Docker gehaald: drie keer exit 0 met nul waarschuwingen,
nul em-dashes in de tekstlaag.


---

## Na ronde 2 (12 september 2026)

Branch `fix/rapport-stresstest-ronde-2`. In scope waren acht bevindingen: **B5, B6, B7,
B8, B12, B17, B18, B19**, plus de bijvangst uit par. 7b van de spec (de spreidingsstrook
van vertrekintentie). B9, B13, B14 en B20 zijn expliciet ronde 3. De matrix telt nu
eenentwintig rijen: scenario **16b (respons 25%, 45 van 180)** is toegevoegd om de
indicatieve drempel van 30% te raken, die scenario 16 met precies 30% net niet haalt.
Alle eenentwintig rapporten zijn opnieuw gegenereerd met de gefixte code en langs dezelfde
zes vragen gelegd; elke claim is getoetst aan de `.meta.json` van het scenario en niet aan
het rapport zelf.

### Matrix na ronde 2

| # | Scenario | n | Q1 antwoord p2 | Q2 startpunt | Q3 wat moet gebeuren | Q4 holle pagina's | Q5 tegenspraak | Q6 overclaim |
|---|----------|---|----|----|----|----|----|----|
| 01 | Vlak middelmatig | 45 | **✓** | **✓** | ✓ | ✗ | ✗ | **✓** |
| 02 | Eén lage factor | 45 | ✓ | ✓ | ~ | ✗ | ✓ | **✓** |
| 03 | Twee near-ties | 45 | ✓ | **✓** | ✓ | ✗ | ✓ | **✓** |
| 04 | Alles hoog | 45 | **✓** | **✓** | ✓ | ✗ | **✓** | **✓** |
| 05 | Alles laag, crisis | 45 | ✓ | ✓ | ✓ | ✗ | ✗ | **✓** |
| 06 | Eén afdeling laag | 45 | **✓** | **✓** | ~ | ✗ | **✓** | **~** |
| 07 | Vertrek, onder drempel | 8 | ~ | ~ | ~ | ✗ | ~ | ✗ |
| 08 | Vertrek, net boven | 12 | ✓ | **✓** | ~ | ✗ | ~ | ~ |
| 09 | Gemengde afdelingen | 25 | **✓** | **✓** | **✓** | ✗ | ~ | **✓** |
| 10 | Twaalf kleine afdelingen | 90 | ✓ | ✓ | ~ | ✗ | **✓** | **✓** |
| 11 | Grote populatie | 180 | **✓** | ✓ | **✓** | ✗ | **✓** | **✓** |
| 12 | 60% overslag verdieping | 45 | ✓ | ✓ | ~ | ✗ | ✓ | **✓** |
| 13 | 40% "niets nodig" | 45 | **✓** | ✓ | **✓** | ✗ | ~ | **✓** |
| 14 | 35% "Anders" | 45 | **✓** | ✓ | ✗ | ✗ | ~ | ✗ |
| 15 | Richting verdeeld | 45 | **✓** | ✓ | ~ | ✗ | ✓ | **✓** |
| 16 | Respons 30% | 45 | ✓ | ✓ | ✓ | ✗ | ~ | **✓** |
| 16b | Respons 25% (nieuw) | 45 | ✓ | ✓ | ✓ | ✗ | ~ | ✓ |
| 17 | Respons 90% | 45 | ✓ | ✓ | ✓ | ✗ | **✓** | **✓** |
| 18 | Vlak + n=12 | 12 | **~** | **~** | **~** | ✗ | **✓** | **~** |
| 19 | Vlak + 40% niets nodig | 45 | **✓** | **✓** | ~ | ✗ | **✓** | **✓** |
| 20 | Loep Start sanity | 30 | ✓ | **✓** | ✗ | ✗ | **✓** | **✓** |

Gewijzigde cellen vet; rij 16b is nieuw en heeft dus geen stand om mee te vergelijken.

Score (21 rijen): Q1 19✓/2~/0✗ · Q2 19✓/2~/0✗ · Q3 10✓/9~/2✗ · Q4 0✓/0~/21✗ · Q5 12✓/7~/2✗ · Q6 16✓/3~/2✗.
Was (20 rijen, na ronde 1): Q1 9✓/8~/3✗ · Q2 10✓/4~/6✗ ·
Q3 6✓/9~/5✗ · Q4 0✓/0~/20✗ · Q5 4✓/11~/5✗ ·
Q6 0✓/4~/16✗.

Let op: de scoreregel onder de ronde-1-matrix noemt voor Q5 "3✓/13~/4✗", terwijl
de cellen in diezelfde tabel optellen tot 4✓/11~/5✗. De regel hierboven telt de
cellen, want die zijn per scenario navolgbaar. Voor de andere vijf vragen komen regel en
tabel wel overeen.

Beoordelingsregel, dezelfde als in ronde 1: een cel beweegt alleen als de bevindingen die
hem droegen tot de gefixte horen én geen openstaande bevinding dezelfde cel
zelfstandig op hetzelfde niveau houdt. 48 van de honderdtwintig vergelijkbare cellen bewegen; rij 16b
telt daar niet in mee, want die had nog geen stand.

### De openingszin van pagina twee, per scenario

Letterlijk, uit het gegenereerde rapport.

- **01** Geen enkel onderwerp springt eruit: alle zes liggen binnen één punt van elkaar (laagste Groeiperspectief 5.7/10, hoogste Rolhelderheid en eigenaarschap 6.3/10). Dat is zelf de bevinding. Als startpunt kiest Loep Groeiperspectief, de laagste score. Het verschil met de volgende is klein, 0,03 punt; weeg dat mee in de bespreking.
- **02** Behoud vraagt aandacht op één onderwerp: Groeiperspectief (4.7/10). Als startpunt kiest Loep Groeiperspectief.
- **03** Behoud vraagt aandacht op één onderwerp: Groeiperspectief (4.8/10). Als startpunt kiest Loep Groeiperspectief, de laagste score. Het verschil met de volgende is klein, 0,23 punt; weeg dat mee in de bespreking.
- **04** Geen enkel onderwerp springt eruit: alle zes liggen binnen één punt van elkaar (laagste Rolhelderheid en eigenaarschap 7.8/10, hoogste Leiderschap en vertrouwen 8.1/10). Dat is zelf de bevinding. Als startpunt kiest Loep Rolhelderheid en eigenaarschap, de laagste score. Het verschil met de volgende is klein, 0,17 punt; weeg dat mee in de bespreking.
- **05** Behoud staat breed onder druk: 6 van de 6 onderwerpen scoren kwetsbaar. Als startpunt kiest Loep Leiderschap en vertrouwen, de laagste score. Het verschil met de volgende is klein, 0,18 punt; weeg dat mee in de bespreking.
- **06** Geen enkel onderwerp springt eruit: alle zes liggen binnen één punt van elkaar (laagste Beloning en eerlijkheid 6.2/10, hoogste Leiderschap en vertrouwen 6.5/10). Dat is zelf de bevinding. Als startpunt kiest Loep Werkdruk en herstelruimte.
- **07** De frictiescore van 5.1/10 wijst op een gemengd vertrekbeeld.
- **08** Het vertrekbeeld wijst naar twee onderwerpen: Groeiperspectief (4.5/10), Leiderschap en feedback (4.9/10). Als startpunt kiest Loep Leiderschap en feedback. Beter aanbod elders is de meest genoemde vertrekreden.
- **09** Geen enkel onderwerp springt eruit: alle zes liggen binnen één punt van elkaar (laagste Groeiperspectief 5.7/10, hoogste Rolhelderheid en eigenaarschap 6.4/10). Dat is zelf de bevinding. Als startpunt kiest Loep Groeiperspectief, de laagste score. Het verschil met de volgende is klein, 0,06 punt; weeg dat mee in de bespreking.
- **10** Geen onderwerp scoort kwetsbaar. Groeiperspectief scoort het laagst en is het eerste gesprekspunt.
- **11** Geen onderwerp scoort kwetsbaar. Groeiperspectief scoort het laagst en is het eerste gesprekspunt.
- **12** Behoud vraagt aandacht op één onderwerp: Groeiperspectief (4.6/10). Als startpunt kiest Loep Groeiperspectief.
- **13** Behoud vraagt aandacht op één onderwerp: Groeiperspectief (4.5/10). Als startpunt kiest Loep Groeiperspectief.
- **14** Behoud vraagt aandacht op één onderwerp: Groeiperspectief (4.5/10). Als startpunt kiest Loep Groeiperspectief.
- **15** Behoud vraagt aandacht op één onderwerp: Groeiperspectief (4.6/10). Als startpunt kiest Loep Groeiperspectief.
- **16** Behoud vraagt aandacht op één onderwerp: Groeiperspectief (4.9/10). Als startpunt kiest Loep Groeiperspectief (op basis van 45 van de 150 genodigden).
- **16b** Indicatief beeld: Geen onderwerp scoort kwetsbaar. Groeiperspectief scoort het laagst en is een mogelijk eerste gesprekspunt (op basis van 45 van de 180 genodigden).
- **17** Behoud vraagt aandacht op één onderwerp: Groeiperspectief (4.9/10). Als startpunt kiest Loep Groeiperspectief.
- **18** Geen onderwerp scoort kwetsbaar. Beloning en eerlijkheid scoort het laagst en is het eerste gesprekspunt.
- **19** Geen enkel onderwerp springt eruit: alle zes liggen binnen één punt van elkaar (laagste Groeiperspectief 5.6/10, hoogste Rolhelderheid en eigenaarschap 6.5/10). Dat is zelf de bevinding. Als startpunt kiest Loep Groeiperspectief. Dat onderwerp deelt de laagste score met het volgende; weeg die gelijkstand mee in de bespreking.
- **20** Geen onderwerp scoort kwetsbaar. Informatiedichtheid en werktempo deelt de laagste score met het volgende onderwerp en is het eerste gesprekspunt.

Vijf vormen zijn te onderscheiden: de vlakke-profiel-zin (01, 04, 06, 09, 19), de zin met
één of twee kwetsbare onderwerpen (02, 03, 08, 12, 13, 14, 15, 16, 17), de
brede-drukzin (05), de zin zonder kwetsbaar onderwerp (10, 11, 16b, 18, 20) en de terugval
zonder factorprofiel (07). Vier van die vijf bestonden voor ronde 2 niet.

### Wat er per bevinding veranderde

| # | Status | Bewijs |
|---|---|---|
| B5 | **gefixt** | Scenario 06 leest nog steeds 6.2, 6.3, 6.2, 6.2, 6.3, 6.5, maar onder elke rij die een bump kreeg staat nu waarom: "Staat hoger dan Beloning en eerlijkheid omdat de antwoorden hier verder uiteenlopen (14 van de 45 onder de 5)." Scenario 08 heeft de kolom "Als vertrekreden genoemd" (4, 1, 1, 0, 0, 0) plus de regel "Staat hoger dan Groeiperspectief omdat dit vaker als vertrekreden is genoemd (4 keer tegen 1)"; die telling komt overeen met de top drie op de vertrekcontextpagina. Scenario 04 markeert een richting-tie-break met beide tellingen: "(4 van de 8 tegen 2 van de 5)", gelijk aan `direction_agg` (leiderschap 3 plus 1 van 8 beantwoorders, werkdruk 2 van 5). |
| B6 | **gefixt** | Scenario 01: "Geen enkel onderwerp springt eruit: alle zes liggen binnen één punt van elkaar." Het verschil van 0,03 punt dat de startpuntkeuze bepaalt staat nu in dezelfde zin. Scenario 04, waar zelfs de laagste factor relatief sterk scoort, heeft een eigen kop boven het why-blok: "Waar Loep zou beginnen, en waarom" in plaats van "Waarom X bovenaan staat". Scenario 06 zet de grond onder de keuze in een aparte bronregel: "De scores lagen vrijwel gelijk; de spreiding tussen respondenten gaf de doorslag." |
| B7 | **gefixt** | Scenario 01: "De twee laagste afdelingen liggen dicht bij elkaar (Sales 6.0/10 en IT 6.1/10). Loep wijst pas een afdeling aan bij een verschil van minstens 0,3 punt met de volgende." Daarachter de restgroepzin die in ronde 1 ontbrak: "De restgroep Overige afdelingen scoort lager (5.9/10), maar is samengesteld uit kleine afdelingen en wordt daarom niet als startpunt genoemd." Scenario 05 krijgt dezelfde zin (restgroep 3.8 tegen 4.0). Bij een exacte gelijkstand staat er "De twee laagste afdelingen komen op dezelfde score uit" (02, 04, 14, 16b, 17, 19, 20). Scenario 10 laat de derde staat zien: verschil gehaald, maar de laagste afdeling heeft 7 responses, dus geen aanwijzing. Nog één van de achttien scenario's met segmenten wijst een afdeling aan, en dat is het enige scenario met een echt verschil: scenario 06, "Operations heeft de laagste score van de afdelingen die apart getoond worden (4.5/10; 14 van de 28 uitgenodigden vulden in)". In ronde 1 kregen alle zeventien er een. |
| B8 | **gefixt** | Scenario 10 toont alle twaalf afdelingen als eigen rij; de rijlimiet is weg en er is geen restgroep meer. Scenario 09 laat de andere helft van de fix zien: "4 responses vallen buiten deze tabel: ze horen elk bij een afdeling met minder dan 5 responses, en dat zijn er te weinig om samen als restgroep te tonen." Dat aantal klopt met de scenariodefinitie (HR 3 plus Marketing 1). |
| B12 | **gefixt** | Scenario 11, precies het geval uit de bevinding: "De grootste groep kiest Beter zicht op welke mogelijkheden er voor mij zijn, zonder meerderheid. 27 van de 62 bij wie groeiperspectief het laagst scoorde kozen die richting; 15 kozen Niets, dit zit hier goed." De tellingen komen uit `direction_agg` (27, 15, 10, 5, 3, 1, 1). Scenario 13 is de tweede nieuwe staat: "Verdeeld: een deel zegt dat hier niets hoeft, een even groot deel vraagt om Beter zicht op welke mogelijkheden er voor mij zijn. 14 kozen Niets, dit zit hier goed; 14 kozen Beter zicht. Op een onderwerp dat laag scoort (4.5/10) is dat verschil van inzicht zelf het gesprek." Scenario 09 laat zien dat de staat ook bij kleine aantallen werkt (4 van de 9). Scenario 15 blijft terecht op "Geen eenduidige richting": de grootste optie haalt 21% met een voorsprong van 1. |
| B17 | **gefixt** | Scenario 01 en 05 dragen niet langer dezelfde openingszin. 01: "Geen enkel onderwerp springt eruit." 05: "Behoud staat breed onder druk: 6 van de 6 onderwerpen scoren kwetsbaar." De zin volgt nu het aantal kwetsbare onderwerpen in plaats van de band van het totaalsignaal; dat totaalsignaal staat als eigen cel in de onderbouwingsrij (01: "Behoudssignaal 6.1/10, Behoud vraagt aandacht"; 05: "4.1/10, Behoud onder druk"). Na ronde 1 was deze bevinding alleen feitelijk vervallen; nu is het voorstel ook echt gebouwd. |
| B18 | **gefixt** | Scenario 20, direct onder de kernzin: "Deze scan bevat nog geen verdiepingsvragen en geen richtingvraag. Het rapport laat zien waar het wringt bij nieuwe medewerkers; wat er volgens hen moet gebeuren volgt in een volgende versie." De pagina's heten niet meer "Verdieping: X" maar dragen de factornaam. De dubbele constatering op de gespreksagenda is weg en de exclusiviteitsclaim ook: "Dat is een van de laagst scorende stellingen in het cijferbeeld." De kernzin benoemt de gelijkstand zelf: "Informatiedichtheid en werktempo deelt de laagste score met het volgende onderwerp." |
| B19 | **gefixt** | Scenario 16 (30%) en 17 (90%) zijn niet langer structureel identiek. 16 krijgt een noemer in de kernzin ("op basis van 45 van de 150 genodigden") en een waarschuwing bij de responsbasis; 17 krijgt geen van beide. Het nieuwe scenario 16b (25%) laat de tweede trede zien: de kernzin begint met "Indicatief beeld:", wijst "een mogelijk eerste gesprekspunt" aan in plaats van een vastgesteld startpunt, en de responsbasis legt uit wat die drempel doet: "Onder de 30% noemt Loep het beeld indicatief: de eerste zin van dit rapport wijst dan een mogelijk startpunt aan, geen vastgesteld startpunt." |
| par. 7b | **gefixt** | Over alle achttien Loep Behoud-rapporten tonen de rij vertrekintentie en de spreidingsstrook eronder hetzelfde getal. Steekproef uit de gegenereerde HTML: 02 rij 5.0 en strook 5.0; 04 rij 3.4 en strook 3.4; 05 rij 7.7 en strook 7.7; 18 rij 5.6 en strook 5.6. In ronde 1 stond daar 3.4 tegenover 7.6 voor dezelfde vraag. De zonenamen van de strook draaien mee ("Weinig vertrekgedachten, Aandacht, Veel vertrekgedachten") en de rij krijgt haar kleur nu van dezelfde ladder. |

### Welke kruisjes blijven staan

| Cel | Wat er staat | Wie draagt hem |
|---|---|---|
| Q4, alle 21 rijen | Onveranderd. Ronde 2 voegde alleen tekst toe (markeringsregels, restgroepzin, responszin) en haalde geen enkele sectie weg of samen. | **B9** (paginavulling, lay-outtraject) |
| 01 Q5 | Verdiepingspagina groeiperspectief: "Van de 2 respondenten met een verdieptrigger op groeiperspectief kregen 2 de verdiepingsvraag; 1 beantwoordde die." Zeven pagina's verder, over dezelfde factor: "Van de 45 respondenten hadden 11 dit als laagste; 11 beantwoordden de vraag." Geen brugzin. | **B14** |
| 05 Q5 | Leiderschap: 30 verdiepingsantwoorden tegenover 15 richtingantwoorden. Werkdruk: 18 tegenover 6. Beide zonder uitleg waarom de noemers verschillen. | **B14** |
| 09, 13, 16, 16b Q5 (~) | Zelfde patroon, kleiner verschil. 16b, nieuw in deze ronde, zit er meteen in: 15 verdiepingsantwoorden tegenover 19 richtingantwoorden op groeiperspectief. | **B14** |
| 07 Q5 (~) en Q6 | Het overzichtsprofiel zegt "Voor deze meting zijn er geen scores per factor berekend", en twee pagina's verder staan twaalf SDT-itemgemiddelden op één decimaal en een eNPS over dezelfde acht mensen. De openingspagina noemt die secties sinds ronde 1 wel expliciet, dus onaangekondigd zijn ze niet meer. | **B20** |
| 14 Q3 en Q6, 14 Q5 (~) | Richtingtabel op het startpunt: "Anders, namelijk 30% (9)", de hoogste rij. Verdiepingstabel op dezelfde factor idem. Negen mensen typten een toelichting die nergens in het rapport staat en waarvan het rapport niet meldt dat hij bestaat. | **B13** |
| 20 Q3 | Loep Start levert de laag "wat er moet gebeuren" nog steeds niet. Nieuw is dat het rapport dat nu zelf zegt; het antwoord op de vraag blijft nee. | **vervolg op B18**, de v1.1-verdiepingsset, buiten scope van deze ronde |

Daarmee is het acceptatiecriterium van deze ronde gehaald: op Q1 en Q2 staat geen enkel kruisje meer, en de kruisjes die op Q5 en Q6 blijven staan worden alle vier gedragen door een bevinding die expliciet naar ronde 3 is geschoven (01 en 05 op Q5 door B14, 07 op Q6 door B20, 14 op Q6 door B13). Q3 en Q4 vielen buiten het criterium; daar blijven 14 en 20 op Q3 staan (B13 en de v1.1-set van Loep Start) en de hele kolom Q4 (B9).

### Wat de beoordeling zelf nog opleverde

**Tijdens de beoordeling gevonden en in dezelfde ronde gefixt.** Loep Start beloofde op
pagina twee een verdieping die dit product niet heeft. Het Datastatus-blok onder de
responsbasis zei: "Niet beschikbaar in deze wave: werkgeversaanbeveling (eNPS). Verdieping
opent zodra voldoende responses beschikbaar zijn", een paar centimeter onder de nieuwe
regel "Deze scan bevat nog geen verdiepingsvragen en geen richtingvraag". Twee dingen
klopten er niet: de verdieping opent niet bij meer responses, want dit product heeft er
geen, en Loep Start meet nooit een eNPS, dus "in deze wave" suggereerde een volgende wave
waarin dat wel gebeurt. Het blok komt uit de gedeelde `_responsbasis` en verscheen bij elk
Loep Start-rapport, want `enps_available` is daar altijd onwaar. De fixronde op taak 8 geeft
Loep Start een eigen vervolgzin ("Deze onderdelen openen zodra er voldoende responses
beschikbaar zijn") en haalt dezelfde verwijzing uit de intro van het overzichtsprofiel.
Daarmee gaat scenario 20 op Q5 en Q6 alsnog vooruit. Het woord "verdieping" staat in dat
rapport nu nog één keer, op de gespreksagenda, in de andere betekenis: "Nog niet besluiten
of een verdieping of kortere vervolgmeting nodig is." Dat is een vervolgtraject en geen
hoofdstuk, en die regel staat in alle drie de producten; hij is dus niet aangeraakt.

**Observatie 1. Twee definities van "deelt de laagste score" in dezelfde functie.**
De tak zonder kwetsbare onderwerpen vergelijkt op de getoonde score en zegt daarom in
scenario 20 "deelt de laagste score met het volgende onderwerp" (5,30 tegenover 5,33). De
vlakke-profiel-zin en de startpuntstaart vergelijken op de ruwe waarde en zeggen bij
hetzelfde soort verschil "de laagste score": scenario 01 (5,67 tegenover 5,70, allebei
getoond als 5.7) en scenario 09 (5,68 tegenover 5,74). Daar noemt de zin het verschil zelf
wel (0,03 en 0,06 punt), dus de lezer kan het narekenen. In scenario 06 kan dat niet: de
vlakke zin noemt "laagste Beloning en eerlijkheid 6.2/10" terwijl drie onderwerpen 6.2
tonen en het startpunt een vierde onderwerp is. Daarom staat 06 op Q6 op ~ en niet op
✓.

**Observatie 2. Loep Vertrek noemt twee verschillende redenen "de meest genoemde".**
Scenario 08, pagina twee: de kernzin eindigt met "Beter aanbod elders is de meest genoemde
vertrekreden", en de onderbouwingscel ernaast zegt over leiderschap "Hoofdreden, 4 keer,
van 12 vertrekkers de meest genoemde reden". Allebei waar, want het is een gelijkspel (4 om
4 op de vertrekcontextpagina), maar het rapport zegt nergens dat het een gelijkspel is. Dat
houdt 08 op Q5 en Q6 op ~. Dateert van voor deze ronde.

**Observatie 3. Scenario 18 valt net buiten beide nieuwe remmen.**
Het profiel loopt van 5,56 tot 6,56: precies één punt, en de vlakke-profiel-zin
eist minder dan één punt. Het verschil tussen nummer één en nummer twee is
0,32, en de staart over een klein verschil eist minder dan 0,30. Pagina twee zegt daardoor
"Beloning en eerlijkheid scoort het laagst en is het eerste gesprekspunt", zonder rem, in
het op één na vlakste profiel van de matrix. Beide drempels zijn bewust gekozen en
staan als constante in de code, dus dit is geen bug; het is wel de reden dat 18 op Q1, Q2
en Q6 op ~ blijft staan in plaats van door te schuiven naar ✓.

**Observatie 4. De ranglijsttabel verliest zijn kolomkoppen zodra hij over een pagina
breekt.** De kop staat in een gewone `<tbody>` en niet in een `<thead>`, dus WeasyPrint
herhaalt hem niet. In de eenentwintig scenario's en in de drie voorbeeldrapporten past de
tabel steeds op één pagina, dus vandaag is dit onzichtbaar. Geforceerd zichtbaar te maken:
met een blok van 560 px boven de tabel in scenario 06 staat de eerste rij met haar
markeringsregel op pagina 15 en beginnen de vijf andere rijen op pagina 16, zonder Factor,
Score, Spreiding, Verdieping of Agenda erboven. Bij 700 px staat de kop alleen op een
pagina en verhuist de hele tabel. Dit wordt echt zodra de tabel groeit: meer
markeringsregels, langere verdiepingstekst, of de extra kolom van Loep Vertrek.

**De paginabescherming op een tabelsectie werkt wel.** In diezelfde proef blijft elke rij
bij haar markeringsregel en wordt geen enkele rij doormidden gesneden: `break-inside:
avoid` op `tbody.r-grp` wordt door WeasyPrint gehonoreerd. Hetzelfde geldt voor
`tbody.seg-grp` in de segmenttabel: scenario 10 zet twaalf afdelingsrijen onder elkaar en
verplaatst het conclusieblok naar de volgende pagina in plaats van een rij te splitsen.

### Verificatie van de ronde

Backend-suite 25 gefaald, 1050 geslaagd, 5 overgeslagen; de faalset is byte-identiek aan
`docs/superpowers/plans/ronde2-baseline-failset.txt`. Frontend tsc 133 fouten en vitest 65
gefaald van 1189, allebei gelijk aan de baseline; het typecheck draait in de worktree over
de echte bronbestanden (de diagnostiek noemt bestaande bestanden en regels, niet nul).

De drie voorbeeldrapporten zijn opnieuw gegenereerd en door WeasyPrint-Docker gehaald:
drie keer exit 0 met lege stdout en stderr, dus nul waarschuwingen. De tekstlaag bevat nul
em-dashes. Loep Vertrek telt 17 pagina's, Loep Behoud 19 en Loep Start 15.

Visueel gecontroleerd in de drie samples: pagina twee (openingszin, responsstaart,
signaalcel), de ranglijst met de markeringsregels en de vertrekredenkolom bij Loep
Vertrek, de segmentpagina en het richtingblok. De vier richtingstaten die in geen enkele
sample voorkomen zijn apart gerenderd uit de stresstest-scenario's: `plurality` in 11,
`split_none` en `none_needed` in 13, `too_few` in 06. Het retentievoorbeeld laat de
B7-fix in zijn scherpste vorm zien: het wijst Operations aan (6.0/10, 17 van de 21) en
zegt er in dezelfde alinea bij dat de restgroep lager staat (5.9/10) en waarom die geen
startpunt is.


---

## Na plan 3a (19 september 2026)

Branch `feature/rapport-3a`. In scope: spec 2026-09-16 onderdelen 1, 2, 6 en 7 (B9, B13,
B14, B20, ronde-2-punten a/b/c, de leesronde-gaten B1, B2, H1 t/m H5, H8 t/m H10, H13
t/m H20, C2, C3, C6 t/m C13) plus de responsnoemer uit spec 11-9 par. 4.6.

**Stand van deze sectie: deel A (HTML, 18-19 september) plus deel B (WeasyPrint-render, 19
september, HEAD `e614482e`).** Deel A beoordeelde alle eenentwintig scenario's en de drie
voorbeelden als HTML, omdat de Docker-engine toen niet draaide. Deel B heeft alle
vierentwintig via WeasyPrint-Docker gerenderd en daarop de kolom Q4, B9, punt (c), de
paginaverwijzingen, de em-dashes in de tekstlaag en de paginatelling gemeten, en de Q5-cellen
van 08 en 20 opnieuw gescoord na de nafixes van `b5792422`. De eis van het plan, zes keer
`check_pdf_report.py` OK, is niet gehaald (zie "Verificatie van de ronde").

De harness zet sinds deze ronde een vaste meetperiode (start 9 maart 2026 uit het delivery
record, sluiting 30 maart 2026 op de campagne) en het aantal uitgenodigden als
`invited_count`. In alle eenentwintig rapporten staat op pagina twee
"Meetperiode 9 maart 2026 tot 30 maart 2026" en nergens meer "niet vastgelegd"; de
voorbeeldrapporten tonen "9 maart 2026 tot 3 april 2026".

### Matrix na plan 3a

| # | Scenario | n | Q1 antwoord p2 | Q2 startpunt | Q3 wat moet gebeuren | Q4 holle pagina's | Q5 tegenspraak | Q6 overclaim |
|---|----------|---|----|----|----|----|----|----|
| 01 | Vlak middelmatig | 45 | ✓ | ✓ | ✓ | **~ p7 36%** | **✓** | ✓ |
| 02 | Eén lage factor | 45 | ✓ | ✓ | ~ | **✓** | ✓ | ✓ |
| 03 | Twee near-ties | 45 | ✓ | ✓ | ✓ | **✓** | ✓ | ✓ |
| 04 | Alles hoog | 45 | ✓ | ✓ | ✓ | **✓** | **~** | ✓ |
| 05 | Alles laag, crisis | 45 | ✓ | ✓ | ✓ | **✓** | **✓** | ✓ |
| 06 | Eén afdeling laag | 45 | ✓ | ✓ | ~ | **✓** | ✓ | ~ |
| 07 | Vertrek, onder drempel | 8 | ~ | ~ | ~ | **✓** | ~ | ✗ |
| 08 | Vertrek, net boven | 12 | ✓ | ✓ | ~ | **✓** | **✓** | **✓** |
| 09 | Gemengde afdelingen | 25 | ✓ | ✓ | ✓ | **✓** | **✓** | ✓ |
| 10 | Twaalf kleine afdelingen | 90 | ✓ | ✓ | ~ | **✓** | ✓ | **~** |
| 11 | Grote populatie | 180 | ✓ | ✓ | ✓ | **✓** | ✓ | ✓ |
| 12 | 60% overslag verdieping | 45 | ✓ | ✓ | ~ | **✓** | ✓ | ✓ |
| 13 | 40% "niets nodig" | 45 | ✓ | ✓ | ✓ | **✓** | **✓** | ✓ |
| 14 | 35% "Anders" | 45 | ✓ | ✓ | **~** | **✓** | **✓** | **✓** |
| 15 | Richting verdeeld | 45 | ✓ | ✓ | ~ | **✓** | ✓ | ✓ |
| 16 | Respons 30% | 45 | ✓ | ✓ | ✓ | **✓** | **✓** | ✓ |
| 16b | Respons 25% | 45 | ✓ | ✓ | ✓ | **✓** | **✓** | ✓ |
| 17 | Respons 90% | 45 | ✓ | ✓ | ✓ | **✓** | ✓ | ✓ |
| 18 | Vlak + n=12 | 12 | ~ | ~ | ~ | **✓** | ✓ | ~ |
| 19 | Vlak + 40% niets nodig | 45 | ✓ | ✓ | ~ | **~ p7 36%** | ✓ | ✓ |
| 20 | Loep Start sanity | 30 | ✓ | ✓ | ✗ | **✓** | ✓ | ✓ |

Gewijzigde cellen ten opzichte van ronde 2 vet (vijftien; twee daarvan gaan omlaag, zie hieronder). In de kolom Q4 staan per scenario de doorlooppagina's onder `MIN_FILL` (40%) met hun vulling, gemeten met `scripts/check_pdf_report.py` op een WeasyPrint-Docker-render van alle eenentwintig (niet de Chromium-benadering uit het plan: die was er niet, en Docker draaide). **Stand: na fixronde 2 (HEAD `69ab9a24`), vet waar de cel ten opzichte van deel B bewoog.**

Score (21 rijen): Q1 19✓/2~/0✗ · Q2 19✓/2~/0✗ · Q3 10✓/10~/1✗ · Q4 19✓/2~/0✗ · Q5 19✓/2~/0✗ · Q6 17✓/3~/1✗.
Na deel B, vóór de fixrondes: Q4 0✓/2~/19✗; na fixronde 1: 12✓/6~/3✗ (zie "Fixronde na de WeasyPrint-render" en "Fixronde 2" hieronder).
Was (na ronde 2): Q1 19✓/2~/0✗ · Q2 19✓/2~/0✗ · Q3 10✓/9~/2✗ · Q4 0✓/0~/21✗ · Q5 12✓/7~/2✗ · Q6 16✓/3~/2✗.

Beoordelingsregel, dezelfde als in ronde 1 en 2: een cel gaat omhoog alleen als de
bevindingen die hem droegen tot de gefixte horen én geen openstaande bevinding dezelfde cel
zelfstandig op hetzelfde niveau houdt. Een cel gaat omlaag als het lezen een probleem
vindt dat eerder niet gescoord was; dat staat per geval hieronder, met de vermelding of het
door plan 3a komt of al bestond.

**Omhoog.** Q5 van 01, 05, 09, 13, 16 en 16b werd gedragen door B14; de tellingen staan nu
in één vaste vorm met hun eigen definitie ("2 = wie hier laag scoorde" tegenover "hadden dit
als eigen laagste onderwerp") en de richtingketen sluit. 14 op Q3, Q5 en Q6 werd gedragen
door B13; het rapport noemt nu dat "Anders" de grootste keuze is en toont de toelichtingen.
08 op Q6 werd gedragen door ronde-2-punt (b); de gelijkstand tussen twee vertrekredenen
staat nu in de kernzin en in de onderbouwingscel. 14 op Q3 gaat naar ~ en niet naar ✓: er is
op het startpunt nog steeds geen eenduidige richting, maar het rapport zegt nu eerlijk
waarom.

**Omlaag, drie cellen, alle drie al van vóór plan 3a.** 04 op Q5: de drie
verdiepingshoofdstukken openen met "Respondenten die laag scoorden op dit onderwerp kregen
automatisch een korte vervolgvraag ... De aantallen hieronder zijn tellingen", en daaronder
staat bij geen van de drie een telling, want niemand kreeg een verdieping. 20 op Q5: pagina
twee zegt "Twee onderwerpen delen de laagste score (5.3/10)", de gespreksagenda noemt
Rolhelderheid en verwachtingen eerste 90 dagen "Tweede laagste score in het
overzichtsprofiel". 10 op Q6: zie observatie 2 hieronder. (20 op Q5 staat inmiddels weer
op ✓, zie deel B hieronder; daarmee gaan per saldo twee cellen omlaag.)

**Blijft staan.** 06 op Q6 blijft ~: punt (a) is op pagina twee gefixt, maar dezelfde vorm
staat nog op het overzichtsprofiel (observatie 1). 07 op Q5 en Q6 blijft door B20 (zie de
bevindingentabel). 08 op Q5 blijft ~, nu om een andere reden dan in ronde 2 (observatie 3).
18 blijft op Q1, Q2, Q3 en Q6 op ~ om observatie 3 uit ronde 2 (profiel van precies één
punt, verschil 0,32; beide remmen bewust net niet geraakt). Q3 bewoog verder niet: plan 3a
bevatte geen onderdeel voor werkvragen per startpunt (spec onderdeel 3), dus de tildes op
02, 06, 07, 08, 10, 12, 15, 18 en 19 staan nog om dezelfde redenen, en 20 blijft ✗ tot de
v1.1-set van Loep Start.

**Deel B, na de WeasyPrint-render (19 september 2026).** Q5 van 08 en 20 zijn opnieuw
gescoord op de render van HEAD `e614482e`, dus met de nafixes uit `b5792422`. 08 gaat naar
✓: de telling die observatie 3 droeg klopt nu overal ("Staat hoger dan Groeiperspectief omdat
dit vaker als hoofdreden van vertrek is genoemd (4 keer tegen 1)", en de vertrekcontext toont
"Beter aanbod elders 4×, Leiderschap / management 4×, Persoonlijke omstandigheid 2×, Gebrek
aan groei 1×, Beloning 1×"). Wat nog staat is observatie 7(a), het enkelvoud "De meest
genoemde hoofdreden" bij een gelijkspel; dat is een formulering, geen tegenstrijdige
telling, en draagt de cel niet. 20 gaat terug naar ✓: de gespreksagenda zegt nu
"Rolhelderheid en verwachtingen eerste 90 dagen (5.3/10) Deelt de laagste score (5.3/10) met
Informatiedichtheid en werktempo." 06 op Q6 blijft ~, maar niet meer om observatie 1 (die is
opgelost): de brugzin "Bij Operations springt Groeiperspectief eruit (4.0/10)" in een
afdeling waar alle zes onderwerpen kwetsbaar scoren (observatie 7d) houdt hem op ~.

Q4 is gescoord met één vaste regel, strenger dan "het lijkt wel mee te vallen": ✓ als
`check_pdf_report.py` geen doorlooppagina (cover en laatste pagina uitgezonderd) onder
`MIN_FILL` (40%) vindt; ~ als er precies één is en die minstens 25% gevuld is; ✗ bij twee of
meer, of bij één pagina onder de 25% (een vrijwel lege pagina). Dezelfde lat als ronde 2,
waar zes tot negen halflege pagina's per rapport ✗ gaven. Uitkomst: 0✓/2~/19✗. Alleen 11
(p17, de gespreksopener-vervolgpagina op 30%) en 18 (p7, verdieping groeiperspectief op
35%) komen boven ✗ uit, en beide steunen deels op de kapotte werkbelevingspagina (observatie
8): een pagina waarvan de rechterkolom van het vel valt, telt de gemeten vulling niet eerlijk.
De ✗'en hebben vier bronnen, alle vier in elk van de drie producten terug te zien: (1) pagina
twee loopt over in tien van de vierentwintig renders, zodat pagina 3 alleen de rij
meetgegevens draagt (9 tot 15%, observatie 9); (2) de segmentconclusie "Waar het per
afdeling begint" valt als los blok op een eigen pagina (7 tot 10%) in vijftien scenario's
(observatie 10); (3) de vervolgpagina van de gespreksagenda (30 tot 32%, in 15 zelfs één
regel op 1%); (4) verdiepingspagina's van 27 tot 37% en, bij Loep Start, twee pagina's rond
30%. In 07 staan overzichtsprofiel en verdieping elk als één zin op een eigen pagina (10 en
12%).

### De kop van pagina twee, per scenario

Letterlijk, uit het gegenereerde rapport (de kernzin inclusief de blijfintentie- en vertrekredenzin).

- **01** Geen enkel onderwerp springt eruit: alle zes liggen binnen één punt van elkaar (laagste score 5.7/10, gedeeld door twee onderwerpen: Groeiperspectief, Beloning en eerlijkheid; hoogste Rolhelderheid en eigenaarschap 6.3/10). Dat is zelf de bevinding. Als startpunt kiest Loep Groeiperspectief. Dat onderwerp deelt de laagste score met Beloning en eerlijkheid; weeg die gelijkstand mee in de bespreking. Wel is de blijfintentie kwetsbaar: 3.6/10, 33 van de 45 zitten onder de 5.
- **02** Behoud vraagt aandacht op één kwetsbaar onderwerp: Groeiperspectief (4.7/10). Daar begint het gesprek. Ook de blijfintentie is kwetsbaar: 4.8/10, 16 van de 45 zitten onder de 5.
- **03** Behoud vraagt aandacht op één kwetsbaar onderwerp: Groeiperspectief (4.8/10). Daarnaast is Werkdruk en herstelruimte (5.0/10) een aandachtspunt. Als startpunt kiest Loep Groeiperspectief, de laagste score. Het verschil met de volgende is klein, 0,2 punt; weeg dat mee in de bespreking. Ook de blijfintentie is kwetsbaar: 4.2/10, 26 van de 45 zitten onder de 5.
- **04** Geen enkel onderwerp springt eruit: alle zes liggen binnen één punt van elkaar (laagste Rolhelderheid en eigenaarschap 7.8/10, hoogste Leiderschap en vertrouwen 8.1/10). Dat is zelf de bevinding. Als startpunt kiest Loep Rolhelderheid en eigenaarschap, de laagste score. Het verschil met de volgende is klein, 0,2 punt; weeg dat mee in de bespreking.
- **05** Behoud staat breed onder druk: 6 van de 6 onderwerpen scoren kwetsbaar. Als startpunt kiest Loep Leiderschap en vertrouwen, de laagste score. Het verschil met de volgende is klein, 0,2 punt; weeg dat mee in de bespreking. Ook de blijfintentie is kwetsbaar: 2.2/10, 43 van de 45 zitten onder de 5.
- **06** Geen enkel onderwerp springt eruit: alle zes liggen binnen één punt van elkaar (laagste score 6.2/10, gedeeld door drie onderwerpen: Beloning en eerlijkheid, Cultuur en psychologische veiligheid, Werkdruk en herstelruimte; hoogste Leiderschap en vertrouwen 6.5/10). Dat is zelf de bevinding. Als startpunt kiest Loep Werkdruk en herstelruimte. Wel is de blijfintentie kwetsbaar: 4.8/10, 20 van de 45 zitten onder de 5.
- **07** De frictiescore van 5.1/10 wijst op een gemengd vertrekbeeld.
- **08** Het vertrekbeeld wijst naar twee kwetsbare onderwerpen: Groeiperspectief (4.5/10), Leiderschap en feedback (4.9/10). Daarnaast zijn Beloning en voorwaarden (5.6/10), Werkdruk en balans (5.7/10) en Cultuur en veiligheid (6.2/10) aandachtspunten. Als startpunt kiest Loep Leiderschap en feedback. Twee redenen zijn even vaak genoemd (4 van de 12 elk): Beter aanbod elders en Leiderschap / management.
- **09** Geen enkel onderwerp springt eruit: alle zes liggen binnen één punt van elkaar (laagste score 5.7/10, gedeeld door twee onderwerpen: Groeiperspectief, Werkdruk en herstelruimte; hoogste Rolhelderheid en eigenaarschap 6.4/10). Dat is zelf de bevinding. Als startpunt kiest Loep Groeiperspectief. Dat onderwerp deelt de laagste score met Werkdruk en herstelruimte; weeg die gelijkstand mee in de bespreking. Wel is de blijfintentie kwetsbaar: 3.8/10, 16 van de 25 zitten onder de 5.
- **10** Geen onderwerp scoort kwetsbaar. Groeiperspectief scoort het laagst en is het eerste gesprekspunt. Wel is de blijfintentie kwetsbaar: 3.7/10, 61 van de 90 zitten onder de 5.
- **11** Geen onderwerp scoort kwetsbaar. Groeiperspectief scoort het laagst en is het eerste gesprekspunt. Wel is de blijfintentie kwetsbaar: 4.0/10, 102 van de 180 zitten onder de 5.
- **12** Behoud vraagt aandacht op één kwetsbaar onderwerp: Groeiperspectief (4.6/10). Daar begint het gesprek. Ook de blijfintentie is kwetsbaar: 4.6/10, 21 van de 45 zitten onder de 5.
- **13** Behoud vraagt aandacht op één kwetsbaar onderwerp: Groeiperspectief (4.5/10). Daar begint het gesprek. Ook de blijfintentie is kwetsbaar: 4.6/10, 19 van de 45 zitten onder de 5.
- **14** Behoud vraagt aandacht op één kwetsbaar onderwerp: Groeiperspectief (4.5/10). Daar begint het gesprek. Ook de blijfintentie is kwetsbaar: 4.3/10, 21 van de 45 zitten onder de 5.
- **15** Behoud vraagt aandacht op één kwetsbaar onderwerp: Groeiperspectief (4.6/10). Daar begint het gesprek. Ook de blijfintentie is kwetsbaar: 4.5/10, 20 van de 45 zitten onder de 5.
- **16** Behoud vraagt aandacht op één kwetsbaar onderwerp: Groeiperspectief (4.9/10). Daarnaast zijn Leiderschap en vertrouwen (5.4/10), Werkdruk en herstelruimte (5.4/10) en Beloning en eerlijkheid (6.3/10) aandachtspunten. Als startpunt kiest Loep Groeiperspectief (op basis van 45 van de 150 genodigden). Ook de blijfintentie is kwetsbaar: 3.9/10, 29 van de 45 zitten onder de 5.
- **16b** Indicatief beeld. Geen onderwerp scoort kwetsbaar. Groeiperspectief scoort het laagst en is een mogelijk eerste gesprekspunt (op basis van 45 van de 180 genodigden). Wel is de blijfintentie kwetsbaar: 4.1/10, 27 van de 45 zitten onder de 5.
- **17** Behoud vraagt aandacht op één kwetsbaar onderwerp: Groeiperspectief (4.9/10). Daarnaast zijn Leiderschap en vertrouwen (5.4/10), Werkdruk en herstelruimte (5.5/10) en Beloning en eerlijkheid (6.3/10) aandachtspunten. Als startpunt kiest Loep Groeiperspectief. Ook de blijfintentie is kwetsbaar: 4.0/10, 27 van de 45 zitten onder de 5.
- **18** Geen onderwerp scoort kwetsbaar. Beloning en eerlijkheid scoort het laagst en is het eerste gesprekspunt. Wel is de blijfintentie kwetsbaar: 4.2/10, 8 van de 12 zitten onder de 5.
- **19** Geen enkel onderwerp springt eruit: alle zes liggen binnen één punt van elkaar (laagste score 5.6/10, gedeeld door twee onderwerpen: Groeiperspectief, Werkdruk en herstelruimte; hoogste Rolhelderheid en eigenaarschap 6.5/10). Dat is zelf de bevinding. Als startpunt kiest Loep Groeiperspectief. Dat onderwerp deelt de laagste score met Werkdruk en herstelruimte; weeg die gelijkstand mee in de bespreking. Wel is de blijfintentie kwetsbaar: 3.9/10, 30 van de 45 zitten onder de 5.
- **20** Geen onderwerp scoort kwetsbaar. Twee onderwerpen delen de laagste score (5.3/10): Informatiedichtheid en werktempo, Rolhelderheid en verwachtingen eerste 90 dagen; als eerste gesprekspunt kiest Loep Informatiedichtheid en werktempo.

Ten opzichte van ronde 2: de vlakke-profiel-zin noemt bij een gedeelde laagste score alle
gelijke onderwerpen (01, 06, 09, 19), de kop benoemt de blijfintentie zodra die kwetsbaar
is (achttien van de achttien Loep Behoud-rapporten, behalve 04 waar hij 6.0 is), de zin
over "één onderwerp" noemt de aandachtspunten erbij (03, 16, 17), en Loep Vertrek meldt een
gelijkspel tussen vertrekredenen (08).

### Wat er per bevinding veranderde

| # | Status | Bewijs |
|---|---|---|
| B9 | **niet gefixt** | WeasyPrint-Docker, `check_pdf_report.py`: NIET OK op alle zes verplichte bestanden en op alle vierentwintig renders. Vulling per pagina: 06 `1:102 2:92 3:9 4:84 5:54 6:47 7:67 8:54 9:50 10:62 11:41 12:93 13:7 14:64 15:84 16:85 17:86 18:49 19:96 20:17`; 11 `... 10:41 ... 17:30 ... 21:17`, één pagina onder de 40%; 18 `... 7:35 ... 14:17`, één pagina onder de 40%; voorbeeld Loep Vertrek p3 11%, p15 36%; Loep Behoud p3 9%, p11 39%; Loep Start p6 34%, p12 32%. Ten opzichte van ronde 2 (zes tot negen pagina's onder de helft) is het aantal holle pagina's gedaald naar één tot vier per rapport, maar geen enkel rapport haalt de regel. Zie de Q4-regel en observaties 8 tot en met 10. |
| B13 | **gefixt** | Scenario 14, verdiepingspagina: "7 van de 18 kozen ‘Anders’ en schreven een eigen toelichting: de vaste opties dekten hun ervaring niet.", met de zeven teksten en het anonimiseringslabel eronder. Op de gespreksagenda hetzelfde voor de richting: "9 van de 30 kozen ‘Anders’ en schreven een eigen toelichting". De drempeltabel noemt de 2 (blok verschijnt) en de 5 (teksten getoond). De harness vult elke Anders-toelichting met dezelfde placeholder, dus de lijst toont zeven keer dezelfde zin; dat is de testdata, niet het rapport. |
| B14 | **gefixt** | Scenario 01, verdieping: "2 van de 45 respondenten kregen de verdiepende vraag over groeiperspectief (2 = wie hier laag scoorde); 1 van de 2 beantwoordde die, 1 sloeg over." Richting, zelfde onderwerp: "11 van de 45 respondenten hadden dit als eigen laagste onderwerp; 11 van de 11 beantwoordden de vraag." De totaalregel sluit: "Van de 45 respondenten kregen 45 de vraag, 41 beantwoordden hem, 4 sloegen over. 11 hadden groeiperspectief als laagste onderwerp, 7 beloning en eerlijkheid; de overige 27 een ander onderwerp (leiderschap en vertrouwen 12, werkdruk en herstelruimte 8, cultuur en psychologische veiligheid 6, rolhelderheid en eigenaarschap 1)." Scenario 05: "38 van de 45 respondenten scoorden hier laag; 35 van de 38 kregen de verdiepende vraag (de andere 3 zaten al aan het maximum van drie verdiepingen); 30 van de 35 beantwoordden die, 5 sloegen over." tegenover "17 van de 45 respondenten hadden dit als eigen laagste onderwerp; 15 van de 17 beantwoordden de vraag, 2 sloegen over." Twee definities, elk ter plekke uitgelegd, en elke persoon is terug te vinden. |
| B20 | **deels** | Scenario 07: de drempeltabel staat op de methodiekpagina (3 richting, 5 afdeling, 5 open toelichtingen, 10 "profiel per onderwerp, spreiding, en een afdeling als startpunt", met "Onder de tien antwoorden bepaalt één persoon te veel het gemiddelde"). Maar twee pagina's eerder staan de drie basisbehoeften met bandlabel (Autonomie 6.1/10 · Aandachtspunt) en twaalf stellinggemiddelden, plus een eNPS van -50, allemaal over dezelfde acht vertrekkers. De tabel noemt werkbeleving en eNPS niet, dus waarom daar geen drempel geldt staat nergens. Houdt 07 op Q5 ~ en Q6 ✗. |
| punt (a) | **gefixt op pagina twee, niet op het overzichtsprofiel** | Scenario 06, kop: "laagste score 6.2/10, gedeeld door drie onderwerpen: Beloning en eerlijkheid, Cultuur en psychologische veiligheid, Werkdruk en herstelruimte". De bronregel: "De scores lagen vrijwel gelijk; de spreiding tussen respondenten gaf de doorslag." Het overzichtsprofiel zegt in hetzelfde rapport nog "Geen onderwerp scoort kritisch. De laagste score zit bij Cultuur en psychologische veiligheid." (observatie 1). |
| punt (b) | **gefixt** | Scenario 08, kop: "Twee redenen zijn even vaak genoemd (4 van de 12 elk): Beter aanbod elders en Leiderschap / management." Cel Vertrekreden: "even vaak genoemd, 4 van de 12 elk"; onderbouwingscel: "Als vertrekreden genoemd · Even vaak · dit onderwerp hangt samen met een van de meest genoemde vertrekredenen". Scenario 07 (2 om 2) idem. |
| punt (c) | **gefixt** | 06 geforceerd (in een kopie van de HTML een `break-before: page` op de derde rijgroep van de ranglijst en van de afdelingstabel), WeasyPrint-Docker exit 0: de kop "Onderwerp Score Spreiding Verdieping Agenda" staat op pagina 15 en 16, "Afdeling Ingevuld / uitgenodigd Score Band ..." op pagina 12 en 13. `check_pdf_report.py --regel tabelkop` geeft OK, maar alleen met de kop in hoofdletters: de tekstlaag draagt de kop zoals `text-transform` hem toont, en de regel vergelijkt hoofdlettergevoelig (observatie 11). Idem voor de drempeltabel op de methodiekpagina, geforceerd bij de derde rij: kop "Vanaf Waar het geldt Waarom" op pagina 19 en 20. |
| H8 | **gefixt** | Alle eenentwintig: "Meetperiode 9 maart 2026 tot 30 maart 2026" op pagina twee, met Uitgenodigd, Ingevuld en Respons ernaast. |

### Wat de beoordeling nog opleverde

Geen van deze punten is in deze taak opgelost; ze zijn input voor de eindbeoordeling.
Na deel A zijn observatie 1, 3 en 4 alsnog opgelost (per punt gemarkeerd, met commit); de
Q5-cellen van 08 en 20 zijn daarop in deel B opnieuw gescoord. Observatie 8 tot en met 12
komen uit de WeasyPrint-render van deel B.

**Observatie 1. Het overzichtsprofiel noemt één laagste onderwerp bij een gelijkstand, en
gebruikt een ander bandwoord.** De samenvattingszin op het overzichtsprofiel rekent nog op
de ruwe score. Scenario 06: "De laagste score zit bij Cultuur en psychologische
veiligheid", terwijl pagina twee drie onderwerpen op 6.2 noemt en een vierde (Werkdruk en
herstelruimte) als startpunt kiest, en de cover "Waar het gesprek begint: Werkdruk en
herstelruimte" zegt. In 01, 09, 19 en 20 noemt dezelfde zin alleen het startpunt en laat de
gelijkstand weg die pagina twee wel noemt. De zin begint in tien rapporten met "Geen
onderwerp scoort kritisch", terwijl het rapport overal elders "kwetsbaar" gebruikt (C8).
Bestond al vóór plan 3a.
**Opgelost in `b5792422`.** De zin gebruikt nu dezelfde bron als de kop van pagina twee
(`_p02_laagste_keys`) en dezelfde vorm. Scenario 06: "Geen onderwerp scoort kwetsbaar. Drie
onderwerpen delen de laagste score (6.2/10): Beloning en eerlijkheid, Cultuur en
psychologische veiligheid, Werkdruk en herstelruimte.", in dezelfde volgorde als de kop
("laagste score 6.2/10, gedeeld door drie onderwerpen: Beloning en eerlijkheid, Cultuur en
psychologische veiligheid, Werkdruk en herstelruimte"). 01, 09 en 19 noemen nu hun twee
gelijke onderwerpen, 20 ook (zie observatie 4); 10, 11, 16b en 18 houden één onderwerp
("Groeiperspectief scoort het laagst."). "kritisch" staat nergens meer en de source-guard
bewaakt het als los woord.

**Observatie 2. De kop zonder kwetsbaar onderwerp heeft geen rem bij een klein verschil.**
De tak "Geen onderwerp scoort kwetsbaar. X scoort het laagst en is het eerste gesprekspunt"
zegt nooit dat het verschil klein is, terwijl de tak met kwetsbare onderwerpen dat bij
hetzelfde verschil wel doet (03: "Het verschil met de volgende is klein, 0,2 punt").
Scenario 10: Groeiperspectief 5,11 tegen Leiderschap en vertrouwen 5,28 (getoond 5.1 en
5.3), en 36 mensen hadden Leiderschap als eigen laagste tegen 23 Groeiperspectief; de
ranglijst markeert die twee ook niet als "vrijwel gelijk". Scenario 16b: 5,00 tegen 5,18,
en daar zegt de ranglijst wél "Werkdruk en herstelruimte staat vrijwel gelijk aan
Groeiperspectief" (in 16b vangt "Indicatief beeld ... mogelijk eerste gesprekspunt" het
deels op, dus daar geen celwijziging). Het voorbeeldrapport van Loep Start: 5.4 tegen 5.5
zonder rem. Houdt 10 op Q6 op ~. Bestond al vóór plan 3a.

**Observatie 3. Loep Vertrek telt "als vertrekreden genoemd" alleen als hoofdreden, naast
een pagina die de meespelende redenen toont.** Het publieke voorbeeldrapport: de
vertrekcontext zegt "Beloning 18×" onder "Speelde ook mee", de ranglijstkolom "Als
vertrekreden genoemd" zegt voor Beloning en voorwaarden 0. Leiderschap is 6 keer hoofdreden
en 19 keer meespelend genoemd, en het verdiepingshoofdstuk zegt "6× genoemd als
vertrekreden". Werkdruk en balans krijgt "5× genoemd als vertrekreden" terwijl Werkdruk in
geen van beide top-drielijsten staat, dus de lezer kan dat getal nergens terugvinden.
Scenario 08: "Organisatiecultuur 3×" onder "Speelde ook mee" tegenover 0 in de kolom bij
Cultuur en veiligheid. Houdt 08 op Q5 op ~. Staat in het voorbeeldrapport dat prospects
downloaden.
**Opgelost in `b5792422`.** Het label zegt nu wat er geteld wordt: kolom "Als hoofdreden
genoemd", kernzin "Gebrek aan groei is de meest genoemde hoofdreden van vertrek (14 van de
35).", cel "Hoofdreden van vertrek", verdiepingskaart "14× als hoofdreden van vertrek
genoemd; die telling staat ook in de vertrekcontext.", markeringsregel (08) "Staat hoger dan
Groeiperspectief omdat dit vaker als hoofdreden van vertrek is genoemd (4 keer tegen 1).", en
de rasterintro "hoe vaak een onderwerp als hoofdreden van vertrek is genoemd". De
vertrekcontext toont beide lijsten nu volledig (tot vijf, zoals `build_report_data` ze
levert) in plaats van een top 3, zodat elke telling terug te vinden is. Voorbeeldrapport:
"Hoofdredenen van vertrek: Gebrek aan groei 14×, Persoonlijke omstandigheid 6×, Leiderschap /
management 6×, Werkdruk / stress 5×, Beter aanbod elders 4×" en "Speelde ook mee:
Leiderschap / management 19×, Beloning 18×, Rolonduidelijkheid 11×, Gebrek aan groei 10×"
(die 10 staat op pagina twee onder "Speelt ook mee" en ontbrak eerst in de lijst). Scenario
08: "Beter aanbod elders 4×, Leiderschap / management 4×, Persoonlijke omstandigheid 2×,
Gebrek aan groei 1×, Beloning 1×". De weging is niet veranderd: de ranglijstvolgorde is in
alle 21 scenario's gelijk gebleven. WeasyPrint: de vertrekcontext blijft in het voorbeeld en
in 08 één pagina, 0 warnings. Niet opgelost: de kaart "Relatie met het overzichtsprofiel"
(observatie 7a).

**Observatie 4. Loep Start noemt een gedeelde laagste "tweede laagste".** Scenario 20,
gespreksagenda: "Rolhelderheid en verwachtingen eerste 90 dagen (5.3/10) Tweede laagste
score in het overzichtsprofiel", terwijl pagina twee zegt dat beide 5.3 delen. Zet 20 op Q5
op ~. Bestond al vóór plan 3a.
**Opgelost in `b5792422`.** Scenario 20, gespreksagenda: "Rolhelderheid en verwachtingen
eerste 90 dagen (5.3/10) Deelt de laagste score (5.3/10) met Informatiedichtheid en
werktempo." Zonder gelijkstand blijft "Tweede laagste score in het overzichtsprofiel.".

**Observatie 5. Verdiepingssubsecties zonder toelichtingsblok, zonder reden.** Een
onderwerp dat via de ranglijst in het verdiepingshoofdstuk komt maar waar niemand een
verdieping kreeg, rendert met score, spreidingsstrook en stellingen en verder niets: 02
(Werkdruk en herstelruimte), 09 (Cultuur en psychologische veiligheid), 13 (Rolhelderheid
en eigenaarschap), 14 en 15 (Leiderschap en vertrouwen), en in 04 alle drie. De reden
("geen verdieping aangeboden: score boven de drempel") staat alleen in de ranglijst, pagina's
verder. In 04 belooft de hoofdstukintro "De aantallen hieronder zijn tellingen van wat
respondenten zelf kozen" boven drie subsecties zonder één telling; dat zet 04 op Q5 op ~.
Stil weggelaten blok, dus een Fail-Loud-punt. Bestond al vóór plan 3a.

**Observatie 6. Pagina twee zwijgt over de richting als het startpunt te weinig antwoorden
heeft.** Scenario 06: de gespreksagenda zegt bij het startpunt "Te weinig antwoorden voor een
richting" (2 van de 3), maar pagina twee heeft voor dat geval geen regel, terwijl de
staten clear, divided, plurality en split_none er wel een krijgen.

**Observatie 7. Kleinere punten.** (a) Het blok "Relatie met het overzichtsprofiel" bij
Loep Vertrek zegt in elk rapport hetzelfde en niets specifieks ("belichten elk een eigen
invalshoek"), en spreekt bij een gelijkspel (08) van "De meest genoemde reden" in het
enkelvoud. (b) Loep Start zegt twee keer "een volgende meting bespreken we los", wat Loep in
de rol van begeleider zet, en de legenda van de landingskwaliteit zegt "goed geland" waar
de rest "relatief sterk" zegt. (c) Het responsoordeel "genoeg voor een betrouwbaar
groepsbeeld" kijkt alleen naar het percentage en staat ook bij 12 antwoorden (08, 18).
(d) De brugzin van 06 zegt "Bij Operations springt Groeiperspectief eruit (4.0/10)" in een
afdeling waar alle zes onderwerpen tussen 4.0 en 4.9 kwetsbaar scoren.

**Observatie 8. De werkbelevingspagina valt rechts van het vel (blokkerend, ook in de
publieke voorbeelden).** Gevonden op de WeasyPrint-render, niet zichtbaar in de HTML. De
twee kolommen van de werkbeleving (`.tcol.wb-cols`, taak 8, `9755eedd`) zijn een
`display: table` zonder vaste tabelopmaak; de overzichtskaart met de drie balken in de
linkerkolom is breder dan de helft, dus de linkercel groeit en duwt de rechterkolom
(Competentie en Verbondenheid) over de paginarand. Die tekst wordt afgesneden: de tekstlaag
van het voorbeeld Loep Behoud eindigt op pagina 10 bij "Competentie 6.4/10 · Aandachtsp" en
"Mate van ervaren bekwaamheid en effect", en pagina 11 is een halve kolom Verbondenheid die
van het vel loopt. Het treft twintig van de eenentwintig scenario's (alle Loep Behoud en
Loep Vertrek; Loep Start rendert deze kolommen niet) en de voorbeelden Loep Vertrek en Loep
Behoud. Dat is stil weggevallen tekst, dus een Fail-Loud-punt, en het maakt de gemeten
vulling van die pagina's onbetrouwbaar. Niet opgelost in deze taak: `table-layout: fixed`
op `.tcol.wb-cols` (geprobeerd op een kopie) houdt de kolommen binnen het vel, maar dan
loopt de balkenkaart met score en bandlabel over de rechterkolom heen. Een echte oplossing
zet de overzichtskaart over de volle breedte boven de twee kolommen; dat is een wijziging in
`_werkbeleving_section` met een nieuwe paginaverdeling, geen kleine CSS-correctie.

**Observatie 9. Pagina twee loopt over in tien van de vierentwintig renders.** 01, 03, 06,
08, 09, 16, 17, 19 en de voorbeelden Loep Vertrek en Loep Behoud: pagina 3 draagt dan alleen
de rij meetgegevens (Uitgenodigd, Ingevuld, Respons, Meetperiode) op 9 tot 15%, en hoofdstuk
02 begint pas op pagina 4. In 08 schuift het hele blok met zijn label mee (ongeveer 110pt
tekort); in de andere negen alleen de rij (ongeveer 65pt). Het zijn de rapporten met een
langere kop (vlak profiel met gelijkstand, aandachtspunten erbij, vertrekredenen) of een
extra afdelingsregel onder de gespreksopener. H16 ("p.02 op één A4") is daarmee op de echte
render niet gehaald, en het publieke voorbeeld Loep Behoud toont een vrijwel lege pagina 3.
Geen kleine CSS-fix: het tekort varieert met de lengte van de kop, dus een oplossing moet
de pagina structureel inkorten of de meetgegevens hoger zetten.

**Observatie 10. De segmentconclusie staat alleen op een pagina.** In vijftien scenario's
(01 tot en met 06, 10, 12 tot en met 17 met 16b, en 19) opent een pagina met "Waar het per
afdeling begint" en houdt daar op: het navy-blok met de conclusie per afdeling (7 tot 10%).
Het blok past niet meer onder de afdelingstabel en gaat als geheel naar het volgende vel.
Dit is hetzelfde patroon als "Segmentconclusie los, 9%" uit B9 in ronde 1, nu in meer
scenario's omdat het blok langer is geworden (reden bij geen aanwijsbare afdeling).

**Observatie 11. `scripts/check_pdf_report.py` meet twee regels hoofdlettergevoelig tegen
een tekstlaag in hoofdletters.** De marker "Meetgegevens" en de kolomkoppen staan in de PDF
zoals `text-transform: uppercase` ze toont ("MEETGEGEVENS", "ONDERWERP SCORE ..."). De regel
`p02-op-een-a4` meldt daardoor op alle vierentwintig renders "pagina 2 bevat de meetgegevens
niet", ook in de veertien waar pagina 3 wel met hoofdstuk 02 begint. Hoofdletterongevoelig
maken lost het niet op: pagina twee bevat altijd "de meetgegevens op deze pagina" (in de
leidraad), dus de markercontrole zou dan altijd slagen. Alleen de tweede helft van de regel
(pagina 3 begint met 02) meet de overloop echt; die is hierboven gebruikt. De regel
`tabelkop` slaagt alleen als `--thead` in hoofdletters wordt meegegeven. Niet aangepast in
deze taak: de opdracht stond alleen een kleine CSS-fix toe.

**Observatie 12. De WeasyPrint-tests, gedraaid tegen Docker.** Lokaal slaan ze over (geen
GTK). Via een tijdelijke shim in de scratchpad die `weasyprint.HTML(...).write_pdf()` naar de
Docker-image stuurt (niet in de repo): 6 geslaagd (de appendix verliest geen rijen bij de
kolomsplitsing, en de vijf PDF-routes in `test_api_flows.py`), 5 gefaald.
`test_de_pdf_vult_de_verwijzingen_met_echte_paginanummers` faalt omdat de fixture
`_min_retention_data()` geen leidraad meer oplevert (acht pagina's, "Zo leid je dit gesprek"
staat niet in de HTML): een verouderde fixture, geen fout in de PDF.
`test_de_echte_pdf_zet_de_meetgegevens_op_pagina_twee` faalt alleen op de marker van
observatie 11. `test_pdf_heeft_geen_pagina_onder_veertig_procent` faalt voor alle drie de
producten: exit pagina 3 op 38% ("02 Wat speelde mee bij vertrek?") en pagina 8 op 30%
(gespreksopener), retention pagina 9 op 30% (gespreksopener), onboarding alleen op de marker.
Deze tests staan niet in de baseline-faalset omdat ze lokaal overslaan; op Railway (met GTK)
zouden ze falen.

### Verificatie van de ronde

Backend 25 failed / 1370 passed / 11 skipped op HEAD `e614482e`, faalset identiek aan
`docs/superpowers/plans/plan3a-baseline-failset.txt` (diff leeg). Python 3.11-guard en
taalguard groen (80 passed). Nul treffers op "verdieptrigger", "Bestuurlijke read",
"interventieprescriptie" en "begeleide managementbespreking" in de drie gegenereerde
voorbeeld-HTML's.

WeasyPrint-Docker (`ghcr.io/weasyprint/weasyprint`, Docker 29.4.0) op alle vierentwintig
renders, dus meer dan de zes die het plan vraagt: vierentwintig keer exit 0, nul warnings.
Tekstlaag: nul em-dashes in alle vierentwintig. Paginaverwijzingen op pagina twee: zes gevuld
in elk rapport met een factorprofiel (minimaal vijf gevraagd), nul in 07 (geen leidraad, zoals
bedoeld); geen enkele leeggelopen verwijzing. Pagina's: Loep Vertrek 17 (voorbeeld), 14 (08),
9 (07); Loep Behoud 19 (voorbeeld), 14 tot 21 over de scenario's; Loep Start 13 (voorbeeld en
20).

`scripts/check_pdf_report.py`: **NIET OK op alle zes verplichte bestanden** (de drie
voorbeelden, 06, 11, 18) en op alle vierentwintig. Zie de Q4-kolom, B9 en observaties 8 tot
en met 11. Daarom zijn de voorbeeld-HTML's en -PDF's in deze taak niet gecommit: het plan
koppelt die commit aan zes keer OK, en de huidige render zou een vrijwel lege pagina 3
(Loep Vertrek, Loep Behoud) en een afgesneden werkbelevingspagina naar de publieke
voorbeelden brengen.

### Fixronde na de WeasyPrint-render (19 september 2026)

Vier punten, elk met een eigen commit, gemeten op WeasyPrint-Docker-renders van alle
eenentwintig scenario's en de drie voorbeelden (niet gecommit):

1. **Werkbeleving binnen het vel** (`4ba987ca`, observatie 8). De balkenkaart staat over de
   volle breedte boven de kolommen, `.wb-cols` heeft een vaste tabelopmaak en compactere
   kaarten. Nieuwe regel `zijmarge` in `scripts/check_pdf_report.py` (woorden buiten de
   16mm-marges); op de oude render vlagt hij de afgesneden tekst ("Aandachtsp" tot x=597pt),
   op de nieuwe is hij OK in alle 24. De sectie is weer één pagina.
2. **`check_pdf_report.py` gerepareerd** (`a3d1ecef`, observatie 11 en 12). Het
   meetgegevensblok wordt gemeten aan twee eigen regels (blokkop en celabel "Meetperiode"),
   hoofdletterongevoelig; de leidraadzin "de meetgegevens op deze pagina" laat de regel niet
   meer slagen, en een doorgeschoven rij onder een achtergebleven kop wordt wel gezien.
   `--thead` vergelijkt hoofdletterongevoelig. Op de render van vóór punt 3 meldde de regel
   precies de tien overlopen van observatie 9. De verwijzingstest gebruikt een fixture met
   leidraad. Via een Docker-shim (niet in de repo) na alle vier punten: 12 van de 13
   `requires_weasyprint`-tests groen; `test_pdf_heeft_geen_pagina_onder_veertig_procent[exit]`
   faalt op pagina 3 van die fixture (vertrekcontext, 38%), een pagina buiten deze ronde.
3. **Pagina twee op één vel** (`ebf65f59`, observatie 9). Alle zes blokken blijven; alleen
   maten onder `#p02`. Overloop 10 van 24 werd 0 van 24; krapste restruimte 24pt (08). Kop
   boven 500 tekens krijgt 18px, gemeten met 562 tekens op de pagina van 08.
4. **Geen losse segmentconclusie of gespreksopener** (`a6f62c1b`, observatie 10). Het navy
   blok staat direct onder de afdelingstabel, vóór de uitsplitsing; subblokken per afdeling
   twee aan twee naast elkaar; de melding zonder afdelingstabel houdt kop en tekst bij
   elkaar; de invulregels van de gespreksagenda staan naast elkaar en reizen samen met de
   slotregel.

**`check_pdf_report.py` na de fixronde, per bestand** (24 keer exit 0, nul warnings, nul
em-dashes in de tekstlaag):

| Bestand | Uitkomst | Resterende bevinding en oorzaak |
|---|---|---|
| 01 | NIET OK | p7 37%: tweede verdiepingspagina (Werkdruk en herstelruimte) |
| 02 | OK | |
| 03 | NIET OK | p8 37%: derde verdiepingspagina (Beloning en eerlijkheid) |
| 04 | NIET OK | p7 27%: verdiepingspagina zonder toelichtingsblok (observatie 5, niemand kreeg een verdieping) |
| 05 | OK | |
| 06 | OK | |
| 07 | NIET OK | p4 10%, p5 12%: overzichtsprofiel en verdieping zijn onder de tien antwoorden elk één zin op een eigen vel |
| 08 | OK | |
| 09 | NIET OK | p7 27%: verdiepingspagina zonder toelichtingsblok (observatie 5) |
| 10 | OK | |
| 11 | OK | |
| 12 | OK | |
| 13 | OK | |
| 14 | NIET OK | p13 20%: het navy blok van de gespreksagenda past niet meer na een richtingblok met negen Anders-toelichtingen (de harness vult ze met één placeholder) |
| 15 | OK | |
| 16 | OK | |
| 16b | OK | |
| 17 | OK | |
| 18 | NIET OK | p7 35%: verdiepingspagina Groeiperspectief |
| 19 | NIET OK | p7 37%: verdiepingspagina Beloning en eerlijkheid |
| 20 | NIET OK | p6 30%: vervolgpagina van hoofdstuk 04 (subsectie Begeleiding en bereikbaarheid); p12 32%: vervolgpagina van de appendix |
| Voorbeeld Loep Vertrek | NIET OK | p13 36%: appendix-vervolg "Werkbeleving: alle stellingen" |
| Voorbeeld Loep Start | NIET OK | p6 34% en p12 32%: zelfde twee vervolgpagina's als 20 |
| Voorbeeld Loep Behoud | OK | |

Van de zes verplichte bestanden zijn er drie OK (06, 11, voorbeeld Loep Behoud) en drie
niet (18, voorbeeld Loep Vertrek, voorbeeld Loep Start). Alle resterende bevindingen zijn
paginavulling op pagina's buiten de vier punten van deze ronde: verdiepingspagina's als
losse flow-secties (`.sec.flow`, taak 8), de degraded weergave onder de tien antwoorden
(07), de onboardingfactoren en de appendix. Geen enkele resterende bevinding gaat over
p.02, de zijmarge, de paginaverwijzingen of een losse segmentconclusie. Paginatelling nu:
Loep Behoud 16 tot 18 (voorbeeld 17), Loep Vertrek 8 (07), 12 (08), voorbeeld 15; Loep
Start 13. De voorbeeld-HTML's en -PDF's zijn niet gecommit.

Observatie 8, 9, 10 en 11 zijn hiermee opgelost; observatie 12 op één test na (zie punt 2).

### Fixronde 2 (19 september 2026)

Gericht op de resterende NIET OK's, met de zes verplichte bestanden voorop. Drie commits,
elk met eigen tests en faalset-diff (25 gefaald, identiek aan de baseline):

1. **Verdiepingsonderwerpen stromen allemaal** (`14e3ad02`). Ook het eerste onderwerp opent
   geen eigen vel meer; het hoofdstuk begint onder het overzichtsprofiel als het eerste
   onderwerp daar als geheel past. Opgelost: 03, 04, 09, 18 en de vervolgpagina van hoofdstuk
   04 bij Loep Start. Compactere binnenmaten zijn gemeten en alleen bij Loep Start gebruikt:
   bij Vertrek en Behoud schoof elke compactere variant het probleem naar 08, 12, 13 of 15
   (het tweede onderwerp paste dan wel op de eerste pagina, het derde kwam alleen te staan).
   Geen inhoud geschrapt; de variant "onderwerp zonder verdiepingsdata valt weg" bleek voor de
   vulling niet nodig en is niet gebouwd (observatie 5 staat dus open).
2. **Zonder profiel stromen overzichtsprofiel en verdieping mee** (`51c86da8`). 07 gaat van 8
   naar 6 pagina's; de twee losse zinspagina's (10 en 12%) staan nu onder de vertrekcontext.
   Bij Loep Start blijft het overzichtsprofiel een eigen vel (hoofdstuk 02 na pagina twee).
3. **De appendix stroomt** (`69ab9a24`). Hij breekt alleen tussen tabellen; kop en eerste
   tabel blijven samen; 9px ongewijzigd. Opgelost: 20 en het voorbeeld Loep Start, en als
   bijvangst 14.

**Scenario 14 met realistische toelichtingen.** De harness vult elke Anders-toelichting met
dezelfde zin van 32 tekens. Een variant met negen gevarieerde toelichtingen van 47 tot 131
tekens gaf vóór punt 3 dezelfde losse gespreksopener (20%): het kwam dus niet alleen door de
placeholders. Na punt 3 zijn zowel de harnessversie als de gevarieerde variant OK, omdat de
appendix die pagina nu vult.

**`check_pdf_report.py` na fixronde 2, per bestand** (24 keer exit 0, nul warnings, nul
em-dashes in de tekstlaag):

| Bestand | Uitkomst | Resterende bevinding en oorzaak |
|---|---|---|
| 01 | NIET OK | p7 36%: derde verdiepingsonderwerp alleen; drie onderwerpen van elk circa een derde vel, en het eerste past niet onder het overzichtsprofiel |
| 02 t/m 18 | OK | (02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 16b, 17, 18) |
| 19 | NIET OK | p7 36%: zelfde oorzaak als 01 |
| 20 | OK | |
| Voorbeeld Loep Vertrek | NIET OK | p13 36%: appendixstaart (werkbeleving, twaalf stellingen plus eNPS-regel) |
| Voorbeeld Loep Start | OK | |
| Voorbeeld Loep Behoud | OK | |

Van de zes verplichte bestanden zijn er vijf OK (06, 11, 18, voorbeeld Loep Start,
voorbeeld Loep Behoud). **Het voorbeeld Loep Vertrek is niet eerlijk op te lossen binnen de
regels:** de appendix is 1,32 vel (96% plus 36%); de eerste tabel past niet onder de
gespreksagenda (70%), dus begint hij op een nieuw vel. Om de regel te halen moet hij onder
1,00 of boven 1,40 vel uitkomen. Op de ondergrens van 8,5px met 3px celpadding wordt het 88%
plus 32% (1,20 vel), nog steeds een staart onder de 40%; in het voorbeeld Loep Behoud maakt
diezelfde maat van een goede staart (49%) een foute (32%). Ter beslissing bij Lars: mag een
appendix-staartpagina een uitzondering op de vullingsregel zijn? `MIN_FILL` is niet verlaagd
en er is geen uitzondering ingevoerd.

01 en 19 zijn bin packing: elke gemeten maat (kopmarge 0, 8, 16 en 28px, compactere cellen en
kaarten) die hun derde onderwerp op de vorige pagina kreeg, liet in 08, 12, 13 of 15 een
onderwerp alleen staan.

Paginatelling nu: Loep Behoud 15 tot 18 (voorbeeld 17), Loep Vertrek 6 (07), 12 (08),
voorbeeld 15; Loep Start 11. De WeasyPrint-tests via de Docker-shim: 12 van 13 groen, zoals na
fixronde 1 (`test_pdf_heeft_geen_pagina_onder_veertig_procent[exit]` faalt op pagina 3 van die
fixture, de vertrekcontext op 38%). De voorbeeld-HTML's en -PDF's zijn niet gecommit.

---

### Fixronde 3: eindreview (19 september 2026)

Na de eindreview van de hele branch (HEAD `7977254a`). Vijf fixes: de verdiepingsketen noemt zijn eigen regel ("duidelijk laag", een andere regel dan "onder de 5"; drempels als constanten in `deepening.py`), het anonimiseringslabel zegt precies wat `anonymize_text` weghaalt (geen "locaties"), de 10-rij in de drempeltabel is gesplitst naar de constante die de gate echt stuurt (`MIN_AGGREGATE_N` voor het profiel, `MIN_DISTRIBUTION_N` voor spreiding en afdelingen), eNPS met echt minteken en overal "critici", en de brugzin zegt niet meer "tweede punt" (botste met de agendakaart).

`check_pdf_report.py` op een WeasyPrint-Docker-render: **alle 21 scenario's OK** (01 en 19 waren na fixronde 2 nog NIET OK), voorbeeld Loep Behoud en Loep Start OK, voorbeeld Loep Vertrek NIET OK op precies één bevinding: de appendixstaart (p.13, 36%). Die is binnen de regels niet eerlijk op te lossen (appendix 1,32 vel; op de ondergrens van 8,5px 1,20 vel, nog steeds een staart onder de 40%) en ligt als besluit bij Lars. Alle renders exit 0, 0 warnings, 0 em-dashes in de tekstlaag.

**Eindscore (21 rijen): Q1 19✓/2~/0✗ · Q2 19✓/2~/0✗ · Q3 10✓/10~/1✗ · Q4 21✓/0~/0✗ · Q5 19✓/2~/0✗ · Q6 17✓/3~/1✗.**
Was (na ronde 2): Q1 19✓/2~/0✗ · Q2 19✓/2~/0✗ · Q3 10✓/9~/2✗ · Q4 0✓/0~/21✗ · Q5 12✓/7~/2✗ · Q6 16✓/3~/2✗.

B9 is daarmee op de scenario's gefixt; de rij "B9 niet gefixt" in "Wat er per bevinding veranderde" beschrijft de stand na deel B, vóór de fixrondes.

## Reproduceren

```bash
.venv/Scripts/python.exe scripts/stresstest_report.py --list
.venv/Scripts/python.exe scripts/stresstest_report.py --pdf
```

Output in `docs/stresstest/` (in `.gitignore`-scope houden of handmatig opruimen). Elk
scenario schrijft ook een `.meta.json` met de bereikte factorgemiddelden, de
verdiepings- en richtingaggregaten en de segmentrijen, zodat elke bevinding hierboven te
herleiden is zonder het rapport te hoeven lezen.
