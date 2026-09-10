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

## Reproduceren

```bash
.venv/Scripts/python.exe scripts/stresstest_report.py --list
.venv/Scripts/python.exe scripts/stresstest_report.py --pdf
```

Output in `docs/stresstest/` (in `.gitignore`-scope houden of handmatig opruimen). Elk
scenario schrijft ook een `.meta.json` met de bereikte factorgemiddelden, de
verdiepings- en richtingaggregaten en de segmentrijen, zodat elke bevinding hierboven te
herleiden is zonder het rapport te hoeven lezen.
