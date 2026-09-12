# Spec: stresstest ronde 2, de conclusielaag eerlijk maken

**Datum:** 2026-09-11
**Status:** AKKOORD Lars (vijf keuzes bevestigd 2026-09-11), klaar voor plan + bouw
**Aanleiding:** `docs/rapport-stresstest-2026-09-10.md`. Ronde 1 (B1-B4, B10, B11, B15, B16) loopt apart. Deze ronde pakt de bevindingen die een ontwerpkeuze vroegen: B5, B6, B7, B8, B12, B17, B19 en het eerlijk labelen van Loep Start (B18-tussenstap).
**Volgorde:** starten NA de merge van ronde 1 op `main` (zelfde bestanden: `report_html.py`, `report_priority.py`). Eerst rebasen, dan bouwen.
**Acceptatiecriterium ("als een huis"):** `scripts/stresstest_report.py` opnieuw over alle 20 scenario's; op vraag 1, 2, 5 en 6 geen enkel ✗ meer, behalve waar de oorzaak een ronde-3-item is (B9 paginavulling, B13 Anders, B14 brug tussen tellingen, B20 drempelconsistentie). Matrix bijwerken in het bevindingenrapport onder "Na ronde 2".

---

## 0. Vijf besluiten (Lars, 2026-09-11)

| # | Besluit | Uitwerking hieronder |
|---|---|---|
| 1 | Behoudssignaal naar de gezondheidsschaal (hoog = goed), overal | ronde 1 (B4), hier alleen als afhankelijkheid |
| 2 | Vlak profiel expliciet benoemen op p.02 én de richtingvraag als eerste tie-break in de ranglijst; tie-break-rijen markeren | par. 1 en 2 |
| 3 | Afdelingsstartpunt alleen bij verschil >= 0,3 en n >= 10 aan beide kanten; anders "dicht bij elkaar"; restgroep noemen als die lager is; rij-cap eerlijk | par. 3 |
| 4 | Tussenvorm "grootste groep zonder meerderheid" en een aparte regel als "niets nodig" meedingt op een laag scorend onderwerp | par. 4 |
| 5 | Loep Start eerlijk labelen (site + rapport); v1.1-verdiepingsset na deze ronde | par. 7 |

Daarnaast, als ronde-2-items met een concrete regel (Lars: "eens" op de rondeverdeling): B17 (crisis en middelmaat hetzelfde label, par. 5) en B19 (respons heeft gevolgen, par. 6).

Gedeelde regels voor alle copy: gewone taal (copy-toon 2026-09-06), Loep als onderwerp, nooit "ik", geen em-dashes, Fail Loud (nooit een stil weggelaten blok, nooit een kaal veld). Elke nieuwe drempel is een benoemde constante met een toelichting, en wordt in één zin uitgelegd op de plek waar hij werkt.

---

## 1. Ranglijst: richtingvraag als eerste tie-break (B6-b, B5)

### 1.1 Huidig
`rank_factors` in `backend/report_priority.py`: sorteren op score; binnen `PRIORITY_TIE_MARGIN` (strikt < 0,3) kunnen een spreidingsvlag (>= 30% onder 5, alleen bij n >= 10) en een verdiepingsvlag (bestaande verrijkingsstaffel) de volgorde flippen. De richtingdata (`direction_agg`, sinds 2026-09-08 door elke respondent beantwoord) doet niet mee. Rijen die door een vlag omhoog kwamen zijn niet gemarkeerd (scenario 06: 6.2, 6.2, 6.3, 6.2, 6.3, 6.5 zonder uitleg).

### 1.2 Nieuw
Per factor een derde signaal: **vraag om verandering** = het aantal respondenten dat bij die factor (als eigen laagste) de richtingvraag beantwoordde met iets anders dan "Niets, dit zit hier goed". Alleen geldig als het aantal beantwoorders >= `DIRECTION_MIN_N` (3, bestaand).

Sorteerregel, in één zin (staat letterlijk onder de ranglijst):

> "Gesorteerd op score. Liggen scores binnen 0,3 van elkaar, dan telt eerst waar de meeste mensen om verandering vragen; is dat ook gelijk, dan een grote spreiding en een gedeelde toelichting uit de verdieping."

Implementatie: binnen een tie-groep (alle rijen die binnen de marge van de laagste van de groep liggen, bestaande groepslogica hergebruiken) wordt gesorteerd op (1) vraag-om-verandering aflopend, alleen als beide rijen een geldig aantal hebben, (2) spreidingsvlag, (3) verdiepingsvlag, (4) score, (5) factorlabel alfabetisch. Determinisme blijft; de bestaande tests op de vlaggen blijven gelden (ze worden alleen ondergeschikt aan het richtingsignaal binnen de marge).

**Implementatie (2026-09-11, taak 1, herzien na spec-review 2026-09-12):** "alleen als
beide rijen een geldig aantal hebben" is geimplementeerd als een per-rij-regel: een rij
met minder dan DIRECTION_MIN_N beantwoorders telt als 0 vraag-om-verandering. De eerste
versie gebruikte een groepsbrede gate (het signaal uit zodra een rij onder de vloer zat),
maar in scenario 06 zet een factor met 2 beantwoorders het signaal dan uit voor een groep
van vijf: precies het scenario waarvoor het gebouwd is, en de uitlegzin onder de tabel
("de vraag om verandering vanaf 3 beantwoorders per factor") werd er onwaar van. Een rij
onder de vloer heeft hoogstens twee veranderverzoeken, dus 0 is de conservatieve kant.

**Verfijning (spec-review 2026-09-12, derde ronde): richting beslist alleen als het aantal
en het aandeel allebei hoger zijn, en alleen tegenover een rij die zelf een geldig aantal
heeft.** Twee gaten in dezelfde regel: een markeringsregel mag nooit worden tegengesproken
door de getallen die in dezelfde zin staan.

1. *Aandeel.* Scenario 10 gaf "meer mensen om verandering vragen (27 van de 35 tegen 17 van
   de 19)" en bepaalde daarmee het startpunt, terwijl dat in aandeel omgekeerd is (77 tegen
   89 procent) en de gepasseerde factor ook nog lager scoorde. Letterlijk waar, maar de
   lezer leest hem als onwaar. Het aantal blijft leidend (par. 1.2), met als voorwaarde dat
   het aandeel van de winnaar niet lager is dan dat van welke andere geldige rij ook.
2. *Vergelijkingsrij.* Scenario 09 en 13 gaven "meer mensen om verandering vragen (3 van de
   3); bij X gaven te weinig mensen antwoord om dat te vergelijken": een zin die "meer"
   beweert en in dezelfde adem zegt dat vergelijken onmogelijk is. Richting beslist daarom
   pas als er in de gelijkspel-groep minstens twee rijen met een geldig aantal zitten, en
   de winnaar minstens `TOP_CHOICE_MIN_LEAD` boven de hoogste andere geldige rij uitkomt.
   Rijen zonder geldig aantal doen in geen van beide richtingen mee: ze schakelen het
   signaal niet uit (dat deed de weggehaalde groepsbrede gate wel) en kunnen er ook niet op
   gepasseerd worden. De referentierij van een richtingmarkering komt uitsluitend uit rijen
   met een geldig aantal; de copy-variant "bij X gaven te weinig mensen antwoord om dat te
   vergelijken" is daarmee vervallen.

Beide voorwaarden worden groepsbreed geevalueerd en leveren hoogstens een winnaar op, dus
de sorteersleutel blijft een totale orde: transitief en onafhankelijk van de invoervolgorde.

**Drempelconsolidatie (2026-09-12):** de voorsprong van 2 stond op drie plekken als los
getal (`direction_state` clear, `agenda_enrichment`, de raster-tie-break). Hij is nu een
keer gedefinieerd als `TOP_CHOICE_MIN_LEAD` in `deepening.py` en wordt op alle drie de
plekken gebruikt; de waarde is ongewijzigd, dus geen gedragswijziging.

**Aanvullende regel (spec-review 2026-09-12): de vraag om verandering beslist alleen bij
een voorsprong van minstens `TOP_CHOICE_MIN_LEAD` (2).** Binnen een gelijkspel-groep
wordt alleen de hoogste rij vooruit gezet, en alleen als die er minstens 2 mensen bovenuit
steekt; anders beslist dit signaal niets en valt de groep door naar spreiding en
verdieping. Zonder deze marge zou "2 van de 11 tegen 1 van de 11" de volgorde bepalen, een
stellige uitspraak over ruis. De waarde is geen vierde drempelset: het is exact de
voorsprong die `direction_state` voor de staat `clear` eist en die `agenda_enrichment`
hanteert. Precies een winnaar per groep houdt de sorteersleutel een totale orde, dus
transitief en onafhankelijk van de invoervolgorde; een paarsgewijze margeregel zou dat
niet zijn.

**Implementatie (2026-09-11, taak 1, par. 1.3, herzien na spec-review 2026-09-12):** de
markeringsregel volgt de spec ("lagere of gelijke score") en vergelijkt op de interne
rekenwaarde `base` (inclusief het vertrekredengewicht), niet op de afgeronde score in de
kolom. Twee rijen die allebei als 6,2 tonen krijgen dus een markering zodra een signaal de
volgorde bepaalde: in scenario 06 staan Beloning en Cultuur allebei op base 6,20 en legt
de regel nu uit dat de gedeelde toelichting uit de verdieping de doorslag gaf. De
referentierij wordt per signaal gekozen uit de rijen die het genoemde verschil ook
daadwerkelijk tonen (laagste base eerst, bij gelijke base alfabetisch); bij gelijke
tellingen valt de tekstkeuze door naar spreiding, dan verdieping, en anders naar geen
markering.

**Vervallen copy-variant (2026-09-12, derde ronde):** de zin "... (9 van de 11); bij X
gaven te weinig mensen antwoord om dat te vergelijken" bestond kort, voor het geval dat de
winnaar alleen boven rijen met een telling onder de vloer stond. Hij is verwijderd: zo'n
flip vindt niet meer plaats (voorwaarde 4 in `_direction_winner`), dus de situatie kan niet
ontstaan.

**Structuur (kwaliteitsreview 2026-09-12, vierde ronde): de sorteerder legt vast wat hij
besloot.** `rank_factors` schrijft per rij `decided_by` = `{kind, other}`: het signaal dat
de rij boven een lager of gelijk scorende rij zette, en de rij waartegen dat zichtbaar is.
Dat komt uit de sorteersleutel zelf (de index van het eerste verschil), niet uit een
reconstructie achteraf; de markeringsregel is enkel nog de formulering ervan. Daarmee is
"een flip zonder uitleg" structureel onmogelijk in plaats van per tak dichtgetimmerd, en
kan de uitleg niet afwijken van de volgorde. Twee bevindingen die daarmee verdwenen:

- **K1:** won een rij de groep op richting terwijl de enige gepasseerde rij een telling
  onder de vloer had, dan bleef de markering leeg en viel `_raster_attribution` door naar
  "de gedeelde toelichting uit de verdieping gaf de doorslag" in een rapport zonder
  verdiepingsdata. De flip vindt nu niet meer plaats, en die slotregel eist voortaan
  expliciet een verdiepingsvlag; anders valt hij terug op de generieke regel.
- **K2:** de vertrekreden-tak koos zijn referentierij op laagste score zonder te eisen dat
  die rij ook minder vertrekredenen had, met "(1 keer tegen 1)" als gevolg, en met de
  verkeerde oorzaak erbij. De tak komt nu alleen aan bod als de sorteersleutel niets
  besliste, en kiest alleen uit rijen met minder vermeldingen.

**Ontwerpbeslissing (spec-review 2026-09-12): het raster belooft nooit een signaal dat in
deze meting niet bestond.** Dezelfde regel die ronde 1 toepaste toen `RASTER_INTRO_GATE`
voor de verdiepings-gate werd gemaakt, nu ook voor de richtingvraag. Twee signalen die per
meting aan of uit kunnen (verdieping, richting) maal twee scan-types geeft acht varianten;
die worden samengesteld uit bouwstenen in `raster_intro()`, `raster_uitleg()` en
`raster_gate_note()` in plaats van als losse constanten onderhouden. De sorteerregel blijft
een zin, staat letterlijk onder de tabel, en noemt alleen de drempels van de signalen die
meespeelden: geen verdiepingsdrempel in een meting zonder verdiepingsvragen, geen marge van
2 in een meting zonder richtingdata. De vertrekredenclausule blijft aan Loep Vertrek hangen.

Of de richting actief was, wordt afgeleid uit het richtingblok dat daadwerkelijk gerenderd
wordt (`bool(dir_block)` in `_prioriteringsraster`), niet uit het bestaan van het
aggregaat: hetzelfde patroon als `_trust_page`'s `direction_active` (bevinding B3), en
dezelfde waarde, want de renderers geven dat blok als `direction_block_html` mee. Dit is
bewust geen aparte parameter naast `deepening_active`: een tweede waarheid kan stil
afwijken van wat er op de pagina staat, en dat is precies de fout die B3 was. Wie dat toch
als parameter wil, vervangt de afleiding door een argument en voedt het in beide renderers
uit `_dir_block`.

**Ontwerpbeslissing (spec-review 2026-09-12): geen kolom voor de vraag om verandering.**
Par. 1.3 schrijft een extra kolom voor Loep Vertrek voor (vertrekreden) en niet meer.
Zeven kolommen met een spreidings-SVG erin is op A4 een lay-outrisico dat in deze ronde
niet te valideren is, en de navolgbaarheid van de beslissing is al geborgd door de
markeringsregel, die beide tellingen noemt. `RASTER_INTRO`, `RASTER_INTRO_GATE`,
`RASTER_GATE_NOTE` en de docstring-invariant van `_prioriteringsraster` zijn daarom
bijgewerkt: ze noemen vier (respectievelijk drie) signalen, zeggen welke daarvan in de
tabel staan, en beloven voor de vraag om verandering alleen dat die onder de rij wordt
genoemd zodra hij de volgorde bepaalde. De richtingvraag staat los van de
verdiepings-gate: elke respondent beantwoordt hem, dus ook een meting zonder actieve
verdiepingsvragen (scenario 04) kan erop kantelen.

### 1.3 Markering van tie-break-rijen (B5)
Elke rij die door een tie-break boven een rij met lagere of gelijke score staat, krijgt in de agendakolom een regel eronder, in gewone taal, met de telling:

- richting: "Staat hoger dan [factor] omdat hier meer mensen om verandering vragen (10 van de 11 tegen 9 van de 11)."
- spreiding: "Staat hoger dan [factor] omdat de antwoorden hier verder uiteenlopen (13 van de 45 onder de 5)."
- verdieping: "Staat hoger dan [factor] omdat hier een gedeelde toelichting uit de verdieping ligt."

Loep Vertrek: de vertrekreden-weging (`EXIT_REASON_WEIGHT`) verschuift daar ook de volgorde en heeft geen kolom. Toevoegen: kolom "Als vertrekreden genoemd" (telling) in het raster voor exit, en dezelfde markeringsregel ("Staat hoger dan [factor] omdat dit vaker als vertrekreden is genoemd (9 keer tegen 4)."). `_raster_attribution` (p.02-bronregel, 2026-07-20) krijgt een richting-tak: "De scores lagen vrijwel gelijk; het aantal mensen dat om verandering vraagt gaf de doorslag."

### 1.4 Tests
- Tie-groep met gelijke scores, verschillend aantal vraag-om-verandering: richting wint boven spreiding.
- Richting alleen geldig bij >= 3 beantwoorders; onder de drempel valt de tie-break terug op spreiding/verdieping.
- Markeringsregel verschijnt alleen op rijen die daadwerkelijk zijn geflipt, met de juiste tellingen.
- Regressie: scenario 01 (Leiderschap 10/11 vraag om verandering wint van Groeiperspectief 9/11 bij 6,17 vs 5,67? NB: 0,5 verschil, dus GEEN tie; het startpunt blijft Groeiperspectief. Dit is bewust: de marge blijft 0,3. Testen dat de regel niet buiten de marge werkt), scenario 06 (geen niet-oplopende kolom zonder markering meer), scenario 08 (exit-kolom aanwezig).

---

## 2. Vlak profiel op pagina twee (B6-a)

### 2.1 Regel
Het profiel is **vlak** wanneer het verschil tussen de hoogste en laagste van de zes werkfactoren kleiner is dan `FLAT_PROFILE_SPAN = 1.0` (strikt <). Constante in `report_priority.py`, met toelichting: "binnen één punt van elkaar" is in één zin uitlegbaar.

**Implementatie (2026-09-11, taak 2, onderbouwing gecorrigeerd na review):** de telling
van kwetsbare onderwerpen en de span lopen over de getoonde (afgeronde) score, tegen de
bestaande grens `ZONE_LOW`, zodat ze niet kunnen botsen met het bandlabel ernaast (ronde
1, B15) en de lezer de span kan narekenen met de getallen die in de zin staan. De span
wordt afgerond: 8,2 min 7,2 is in binaire drijvende komma 0,99999..., en dat profiel zou
anders "niets springt eruit" heten terwijl het op de pagina een punt spant.

De *volgorde* loopt over de onafgeronde waarde: 5,67 en 5,70 tonen allebei 5,7, en dan
hoort de feitelijk laagste factor het laagst te staan in plaats van de alfabetisch eerste.
Bij exact gelijke waarden beslist de factorsleutel, zodat de uitkomst niet van de
invoervolgorde afhangt. `low_key` is daarmee de laagst scorende factor, en dat is bewust
iets anders dan het startpunt dat `rank_factors` kiest: die sorteert op `base` (bij Loep
Vertrek inclusief `EXIT_REASON_WEIGHT`) en laat binnen een gelijkspelgroep de richting, de
spreiding en de verdieping de volgorde bepalen. Wie het startpunt nodig heeft, leest dat
uit de ranglijst.

De drempel zelf staat niet als getal in de copy: de zin haalt hem uit `FLAT_PROFILE_SPAN`,
zoals `raster_uitleg` dat voor de gelijkspelmarge doet. Een ontbrekend factorlabel laat de
zin hard falen in plaats van de interne factorsleutel in klantcopy te zetten (Fail Loud).

### 2.2 Copy op p.02
Bij een vlak profiel opent de kernzin niet met "[factor] is het eerste gesprekspunt" maar met:

> "Geen enkel onderwerp springt eruit: alle zes liggen binnen één punt van elkaar (laagste [X] [score], hoogste [Y] [score]). Dat is zelf de bevinding."

Daarna de startpuntkeuze, met de grond erbij, afhankelijk van wat de ranglijst besliste:

- richting gaf de doorslag: "Als startpunt kiest Loep [factor]: daar vragen de meeste mensen om verandering ([a] van de [b])."
- alleen score (geen tie binnen 0,3, of richting ongeldig): "Als startpunt kiest Loep [factor], de laagste score. Het verschil met de volgende is klein ([delta]); weeg dat mee in de bespreking."
- iedereen zegt vooral "niets nodig" (state none_needed op het startpunt): "Je mensen vragen nergens dringend om verandering. Bespreek of een startpunt nu nodig is, of dat dit beeld eerst gedeeld wordt."

**Deze variant gaat vóór op de richtinggrond (beslissing reviewronde 2026-09-12).** Beide
regels kunnen tegelijk waar zijn: de tie-break kan op de vraag om verandering hebben
beslist (3 van de 7 tegen 0 van de 4) terwijl op elke factor de niets-optie een strikte
meerderheid heeft. Naast elkaar op één pagina leest dat als tegenspraak. Is het profiel
breed "niets nodig", dan is de vraag *of* er een startpunt moet zijn zelf aan de orde, en
dan is een grond vóór dat startpunt misleidend, hoe waar de telling ook is. De grond
vervalt daarom op p.02; de markeringsregel onder de rasterrij legt de volgorde nog steeds
uit met hetzelfde signaal en dezelfde tellingen, dus er verdwijnt geen navolgbaarheid. De
volgorde van de takken in `_p02_startpunt_zin` is dus betekenisdragend en geen toeval;
gepind in `test_niets_nodig_gaat_voor_op_de_richtinggrond` (puur) en
`test_bij_breed_niets_nodig_staat_er_geen_richtinggrond_op_pagina_twee` (gerenderd).

Bij een vlak profiel waarbij alle factoren >= 6,5 (scenario 04): de kop "Waarom [factor] bovenaan staat" wordt "Waar Loep zou beginnen, en waarom", en de bandcel "7,8/10 · relatief sterk" mag niet naast "eerste gesprekspunt" staan zonder de vlak-profiel-zin erboven.

De bestaande onderbouwingscel ("Gemiddelde score", "Laagst scorende stelling", "Relatief sterk") blijft.

**Implementatie (2026-09-12, taak 3).** De kop-variant zit in `_p02_why_title` en gaat via
`_bestuurlijke_read(why_title=...)`. "Alle factoren >= 6,5" wordt niet als los getal
opgeschreven maar als `low_score >= ZONE_HIGH`, dezelfde grens die `_factor_label` gebruikt
voor "relatief sterk": zo kan de kop niet uit de pas lopen met de bandcel eronder. De tweede
eis uit deze paragraaf (geen bandcel naast "eerste gesprekspunt" zonder de vlak-zin erboven)
volgt uit de kernzin zelf: bij een vlak profiel opent p.02 altijd met de vlak-zin.

### 2.3 Niet-vlak profiel
Ongewijzigd: "[factor] is het eerste gesprekspunt." plus `_raster_attribution`.

### 2.4 Tests
Scenario 01, 04, 18, 19 tonen de vlak-profiel-zin; scenario 02, 05, 06 niet. De zin bevat de echte laagste/hoogste met scores. Geen em-dash.

---

## 3. Afdelingsstartpunt alleen bij echt verschil (B7, B8)

### 3.1 Regel
Het navy-blok "Startpunt voor de bespreking" op de segmentpagina noemt een afdeling alleen als:
- verschil tussen de laagste niet-gepoolde afdeling en de op één na laagste >= `SEGMENT_START_MIN_DELTA = 0.3`, én
- ~~beide afdelingen~~ **de aangewezen (laagste) afdeling** n >= `MIN_DISTRIBUTION_N` (10). Zie de resolutie in par. 3.4; deze regel luidde eerst "beide afdelingen" en was toen in tegenspraak met par. 3.3.

Anders: "De afdelingen liggen dicht bij elkaar (laagste [X] [score], hoogste [Y] [score]). Geen afdeling vraagt als eerste aandacht; kijk naar het organisatiebeeld." Bij exact gelijke laagste scores: nooit één aanwijzen.

Als de gepoolde restgroep ("Overige afdelingen") lager uitkomt dan de aangewezen laagste afdeling: extra zin "De restgroep 'Overige afdelingen' scoort lager ([score]), maar is samengesteld uit kleine afdelingen en wordt daarom niet als startpunt genoemd."

Het bestaande laagste-thema-deel van de anchor-zin (2026-07-16) blijft alleen staan als er een afdeling wordt genoemd.

### 3.2 Rij-cap (B8)
De cap van 8 rijen in `_department_segment_rows` vervalt: elke afdeling met n >= MIN_SEGMENT_N (5) krijgt een rij. Bij meer dan 12 rijen mag de tabel over een pagina heen lopen (WeasyPrint: `page-break-inside: auto` op de tabel, header herhalen). De intro-zin "Afdelingen met minder dan vijf responses worden gebundeld" is daarmee weer waar.

### 3.3 Tests
Scenario 01 (Sales 6,02 vs restgroep 5,86: geen aanwijzing, restgroep-zin), 02 en 19 (exacte tie: geen aanwijzing), 06 (Operations 4,5 vs 7+: wél aanwijzing), 10 (12 afdelingen, allemaal in de tabel, Operations n=9 zichtbaar).

### 3.4 Afwijkingen bij de bouw (2026-09-12, taak 6)

De twee regels van par. 3.1 en 3.2 zijn gebouwd zoals voorgeschreven. De copy en
de paginabescherming weken op vijf punten af, steeds omdat de voorgeschreven
vorm kon worden tegengesproken door de getallen of de opmaak eronder.

0. **Resolutie van de tegenspraak tussen par. 3.1 en 3.3 (besluit Lars,
   2026-09-12): de omvangeis geldt voor de aangewezen afdeling, niet voor
   beide.** Par. 3.1 eiste n >= 10 aan beide kanten, par. 3.3 eist dat scenario
   06 wél een afdeling aanwijst (Operations 4,5 met n=14 tegen Customer Success
   7,0 met n=5). Dat kan niet samen. Par. 3.1 is niet genegeerd maar
   herzien, om drie redenen: (a) de conclusie gaat over de genoemde afdeling,
   dus daar hoort de eis die voorkomt dat een handvol antwoorden een conclusie
   draagt; de op één na laagste dient alleen om vast te stellen dát het
   verschil er is, en bij 2,5 punt verschil kan dat ook met vijf antwoorden;
   (b) vijf is in dit product al de ondergrens om een afdeling überhaupt te
   tonen (`MIN_SEGMENT_N`); (c) met de eis aan beide kanten vuurde de regel in
   **nul van de twintig** stresstest-scenario's, en een regel die nooit vuurt
   schakelt het blok uit in plaats van het te bewaken. De ruisbescherming
   blijft volledig staan: de verschilgrens vangt alle zestien gevallen waar B7
   over gaat (scenario 10 zwijgt terecht, want de laagste afdeling heeft daar
   zeven antwoorden). Gepind met twee tests: een grote afdeling met een klein
   verschil wijst niet aan, en een kleine laagste afdeling met een groot
   verschil wijst ook niet aan.
1. **Een derde staat voor "verschil groot genoeg, afdeling te klein".** Par.
   3.1 schrijft één alternatieve zin ("De afdelingen liggen dicht bij elkaar")
   voor beide faalgevallen. Die zin is onwaar zodra alleen de omvanggrens
   blokkeert: bij Operations 4,5 (n=8) tegen Sales 7,0 (n=20) zou er "liggen
   dicht bij elkaar (laagste Operations 4,5, hoogste Sales 7,0)" staan. Er is
   dus een eigen zin: "[X] scoort het laagst ([score]), maar heeft [n]
   responses. Loep wijst een afdeling pas aan vanaf 10 responses, zodat de
   conclusie niet op een handvol antwoorden rust." De verschilgrens wordt in
   die staat niet genoemd (die speelde niet mee), en de omvanggrens niet in de
   "dicht bij elkaar"-staat.
2. **De zin gaat over de twee laagste afdelingen, niet over de hele reeks.**
   Par. 3.1 noemt laagste en hoogste in één zin, maar de grens vergelijkt alleen
   de laagste met de volgende. Bij 5,0 / 5,1 / 8,0 zou "de afdelingen liggen
   dicht bij elkaar (laagste 5,0, hoogste 8,0)" zichzelf tegenspreken. De zin
   noemt daarom de twee laagste, met hun scores.
3. **Eigen zin bij een exact gelijke getoonde score.** "Dicht bij elkaar" met
   twee keer hetzelfde getal in de haakjes leest als een fout: "De twee laagste
   afdelingen komen op dezelfde score uit ([X] en [Y], beide [score])."
4. **De restgroep-zin staat in alle drie de staten**, niet alleen achter een
   aangewezen afdeling. Scenario 01 is precies het geval waarin geen afdeling
   wordt aangewezen én de restgroep lager staat; zonder die zin spreekt de
   tabel de conclusie erboven alsnog tegen.
5. **Vergelijken op de getoonde score** (`_shown`, B15), zowel voor de
   verschilgrens als voor het gelijkspel: 6,04 tegen 6,26 staat in de tabel als
   6,0 en 6,3, dus ziet de lezer 0,3 verschil.

Verder:

- Par. 3.2 schrijft "header herhalen" voor. De segmenttabel heeft geen
  kolomkoppen; de sectie-intro benoemt de kolommen. Er is dus niets te
  herhalen. Wat wel nodig was: de rijen heel houden. `break-inside: avoid` op
  een `<tr>` doet onder `border-collapse: collapse` niets in WeasyPrint, dus
  staat elke afdeling in haar eigen `tbody.seg-grp`, hetzelfde patroon als
  `tbody.r-grp` in het prioriteringsraster. `.navy-anchor` kreeg dezelfde
  bescherming als `.agenda-dark`, die het als enige navy-blok al had.
- De themazin-variant zonder decimaal (spec 2026-07-16, n=5-9) is vervallen:
  een aangewezen afdeling heeft nu altijd n >= 10. De staffel zelf leeft door
  in de themakolom. `test_navy_anchor_zin_zonder_score_bij_n5_9` is in lockstep
  omgezet naar `test_navy_anchor_wijst_geen_afdeling_aan_bij_n5_9`, en
  `test_max_8_rijen_ook_bij_overige_zonder_overflow` naar
  `test_geen_rijlimiet_elke_kwalificerende_afdeling_plus_overige` (die test
  pinde exact de cap die par. 3.2 opheft).
- Bij minder dan twee benoemde afdelingen blijft er geen conclusieblok staan,
  zoals nu. Die staat kan niet uit `_department_segment_rows` komen (onder twee
  kwalificerende afdelingen geeft die een lege lijst) en is gepind door
  `test_report_design_sprong.py`.

**Vervolg (niet in deze ronde):** ook met de omvangeis op alleen de aangewezen
afdeling blijft het blok vaker zwijgen dan spreken, omdat afdelingen van 5 tot
9 responses de regel zijn. Dat is het eerlijke antwoord op B7. Of de
segmentconclusie op termijn iets anders moet doen dan een startpunt aanwijzen
(bijvoorbeeld het factorbeeld per afdeling als hoofdconclusie) is een
ontwerpvraag voor een volgende ronde. De extra pagina die scenario 10 krijgt
doordat de rijlimiet verviel, is paginavulling (B9, ronde 3).

---

## 4. Richtingblok: grootste groep zonder meerderheid, en "niets nodig" op een laag onderwerp (B12)

### 4.1 Huidig
Vier staten: clear (top > 50% en marge >= 2), divided, none_needed (>= 50% niets; ronde 1 maakt dit strikt > 50%), too_few (< 3). Scenario 11: 27 van 62 (44%) met voorsprong 12 → "Geen eenduidige richting", niets over de grootste groep.

### 4.2 Nieuw: staat `plurality` binnen divided
Als er geen meerderheid is maar de grootste veranderoptie >= `DIRECTION_PLURALITY_MIN_SHARE = 0.35` heeft én een voorsprong >= 2 op de volgende optie (niets-nodig telt als optie mee):

- kop: "De grootste groep kiest [X], zonder meerderheid."
- regel: "[a] van de [b] kozen [X]; [c] kozen [Y]." (top twee, met tellingen; percentages alleen bij b >= 10 volgens de bestaande staffel)
- opdrachtvorm van [X] wordt getoond, met de bron "volgens de grootste groep ([a] van de [b])", nooit "volgens de meeste".
- p.02-regel: "Wat er moet gebeuren volgens de grootste groep: [opdrachtvorm] ([a] van de [b], zonder meerderheid)."

### 4.3 Nieuw: staat `split_none` op een laag scorend onderwerp
Als op een factor met score < 5,0 (kwetsbaar) de niets-optie de grootste of gedeeld-grootste keuze is (niets >= top veranderoptie - 1):

- kop: "Verdeeld: een deel zegt dat hier niets hoeft, een even groot deel vraagt om [X]."
- regel: "[n1] kozen 'Niets, dit zit hier goed'; [n2] kozen [X]. Op een onderwerp dat laag scoort ([score]) is dat verschil zelf het gesprek."
- geen opdrachtvorm als "moet"; wel de opdrachtvorm van [X] als "wat de andere helft vraagt".
- p.02-regel: "Wat er moet gebeuren: je mensen zijn hierover verdeeld ([n1] zegt niets nodig, [n2] vraagt om [X])."

Volgorde van evaluatie: too_few → none_needed (strikt > 50%) → clear → split_none (alleen bij score < 5,0) → plurality → divided.

### 4.4 Tests
Scenario 11 → plurality met 27/62; scenario 13 → split_none (14 niets, 14 verandering, score 4,5); scenario 15 (geen optie boven 35%) → divided ongewijzigd; scenario 04 → none_needed ongewijzigd. Staffel: onder 10 beantwoorders alleen tellingen.

### 4.5 Afwijkingen bij de bouw (2026-09-12, taak 5)

De staten zijn gebouwd zoals hierboven; de copy week op vier punten af, steeds
omdat de voorgeschreven zin kon worden tegengesproken door de getallen die er
zelf in staan.

1. **Kop van `split_none`.** De spec schrijft "een even groot deel vraagt om
   [X]", maar de staat vuurt ook als de niets-groep er een achter ligt (13 tegen
   14) of juist groter is (10 tegen 4). De kop zegt nu "een even groot deel"
   alleen bij een exacte gelijkstand en anders "een ander deel".
2. **"dat verschil zelf het gesprek"** is "dat verschil van inzicht zelf het
   gesprek" geworden: na "14 kozen dit; 14 kozen dat" leest "dat verschil" als
   het verschil tussen de twee tellingen, en dat is nul.
3. **"wat de andere helft vraagt"** is "Wat die andere groep vraagt" geworden.
   Bij 14 / 14 / 3 is geen van beide groepen een helft.
4. **De niets-optie wordt geciteerd uit de optieset**, niet hardgecodeerd:
   Loep Vertrek stelt de vraag in de verleden tijd ("Niets, dit zat hier goed").
   `direction_state` geeft daarvoor `none_key` mee terug.

Verder: de regel op p.02 is grammaticaal anders opgebouwd dan in par. 4.2/4.3
(enkelvoud/meervoud per telling, een noemer zoals de drie andere p.02-takken,
geen dubbele zinsafsluiting achter de opdrachtvorm); de inhoud is gelijk. De
plurality-staat krijgt bewust geen eigen accentkleur in de CSS: die is
voorbehouden aan `clear`, waar wel een meerderheid achter staat.

`factor_score` is verplicht en moet de getoonde (afgeronde) score zijn. Een
optionele score degradeerde stil: een vergeten argument bij de p.02-regel gaf
daar een andere klantzin dan de kaart op de gespreksagenda, zonder fout en
zonder rode test. De enige aanroeper zonder score (`_p02_direction_key`) gaat
via `direction_none_needed_view`, die alleen de score-onafhankelijke staten
teruggeeft. Beide renderers zijn gepind in
`tests/test_direction_renderer_wiring.py`.

**Vervolg (niet in deze ronde):**

- De copy per staat leeft op twee plaatsen, de kaart in het richtingblok en de
  regel op p.02, elk met eigen literals en zonder gedeelde bron. Wie later de
  kaartkop herformuleert laat de p.02-regel stil achter. Eén bron per staat
  maken is een aparte ingreep, ook voor de vier oudere staten.
- Bij een gelijkspel tussen veranderopties noemt `split_none` alfabetisch een
  van de twee, zonder noemer, terwijl een derde optie ook stemmen kan hebben.
- `DIRECTION_OTHER_WARN_N` is meegenomen in de drempelconsolidatie; het blijft
  een log-only reviewvlag zonder klantcopy.

---

## 5. Kernzin p.02 beweegt mee met het aantal kwetsbare onderwerpen (B17)

### 5.1 Huidig
De kernzin volgt alleen de band van het behoudssignaal (na ronde 1: gezondheidsschaal). Scenario 01 (geen factor kwetsbaar) en 05 (alle zes kwetsbaar, 42 van 45 onder de 5 op Leiderschap) krijgen dezelfde zin "Behoud vraagt aandacht".

### 5.2 Nieuw
De eerste zin van p.02 volgt het aantal werkfactoren onder 5,0:

- 0 kwetsbaar en profiel vlak → de vlak-profiel-zin (par. 2).
- 0 kwetsbaar, niet vlak → "Geen onderwerp scoort kwetsbaar. [factor] scoort het laagst en is het eerste gesprekspunt."
- 1 of 2 kwetsbaar → "Behoud vraagt aandacht op [één onderwerp / twee onderwerpen]: [X] ([score])[ en [Y] ([score])]."
- 3 of meer kwetsbaar → "Behoud staat breed onder druk: [k] van de 6 onderwerpen scoren kwetsbaar." gevolgd door het startpunt.

Het behoudssignaal-getal blijft in de cel eronder staan met zijn band; het stuurt de eerste zin niet meer alleen.

**Implementatie (2026-09-12, taak 3).** Eén gedeelde `_p02_opening` in `report_html.py`
bouwt de zin voor alle drie de producten; de productstaart (de meest genoemde
vertrekreden bij Loep Vertrek) blijft in de renderer. Vijf punten wijken af van of
verfijnen de tekst hierboven:

1. **Per product een eigen onderwerpwoord.** Par. 5.2 geeft alleen retention-copy, maar de
   bevinding geldt productbreed. `_P02_DRUKWOORD` houdt per scan een zachte en een brede
   variant ("Het vertrekbeeld wijst naar ..." / "Het vertrekbeeld is breed: ...", "De
   landing van nieuwe medewerkers ..."). Indexeren en geen `.get()`: een onbekend product
   hoort hard te falen in plaats van retention-copy in een ander rapport te zetten.
2. **"De cel eronder" is de onderbouwingsrij onder het why-blok**, niet een cel in de
   why-tabel: die tabel stijlt alleen `.why-cell`, terwijl de rij eronder (`table.sg`, waar
   ook "Relatief sterk" staat) precies de `sc-l`/`sc-v`/`sc-b`-vorm heeft die het getal met
   zijn band draagt. `_bestuurlijke_read` krijgt daarvoor `signal_cell_html`.
3. **Zonder factorprofiel blijft het getal in de kernzin staan.** Die onderbouwingsrij
   rendert niet in de degraded staat (ronde 1, B2), dus daar houden de drie renderers hun
   bestaande zin ("Behoud onder druk (behoudssignaal 4.0/10).", de checkpointscore-variant,
   de frictiescore-variant). Anders zou het getal daar helemaal van p.02 verdwijnen.
4. **Elke startpuntgrond eist zijn eigen voorwaarde.** De vraag om verandering is
   **comparatief**, met beide tellingen, precies zoals de markeringsregel onder de rasterrij
   (`_tie_break_note`). Absoluut geformuleerd ("daar vragen de meeste mensen om verandering")
   presenteert dezelfde tie-break een minderheid als meerderheid: 2 van de 5 wint het van 0
   van de 4, beslist de volgorde terecht, maar is niet "de meeste" (reviewronde 2026-09-12,
   gereproduceerd op echte data). Een meerderheidseis zou de grond laten wegvallen terwijl
   het raster wel op dit signaal besliste, waarna p.02 en het raster elkaar tegenspreken.
   Verder: "de laagste score" alleen als het
   startpunt ook echt de laagste factor is (bij Loep Vertrek tilt `EXIT_REASON_WEIGHT` het
   daar weg, en binnen een gelijkspelgroep doet een tie-break dat ook), en "het verschil met
   de volgende is klein" alleen binnen `PRIORITY_TIE_MARGIN`, de bestaande marge waarop de
   rangorde zelf van gelijkspel spreekt. Haalt geen tak zijn voorwaarde, dan blijft de kale
   keuze over; die is altijd waar. Het tie-breaksignaal komt uit `decided_by` van
   `rank_factors` (taak 1), dus de grond in de kernzin kan niet afwijken van de volgorde in
   het raster.
   **Exacte gelijkstand (reviewronde 2026-09-12).** Scenario 04 van Loep Start zet twee
   factoren op precies 7,85, en dan las de zin "de laagste score. Het verschil met de
   volgende is klein (0,00)": bij een gelijkstand is de laagste score niet van dit onderwerp
   alleen, en 0,00 oogt als een formatteerfout. Die stand krijgt daarom haar eigen zin
   ("Dat onderwerp deelt de laagste score met het volgende; weeg die gelijkstand mee in de
   bespreking"). Gekozen boven een ondergrens op de delta, waarmee de zin terugvalt op de
   kale keuze en de gelijkstand helemaal onzichtbaar wordt: dat is precies de stelligheid
   die deze ronde wegneemt. **Dezelfde stand op een tweede plek** (reviewronde 2026-09-12):
   in de tak zonder kwetsbare onderwerpen stond "X scoort het laagst" terwijl twee factoren
   op dezelfde getoonde score staan en het overzichtsprofiel ze verderop naast elkaar toont.
   `_p02_shared_low` vergelijkt daar de getoonde scores (wat de lezer ziet) en levert dan
   dezelfde formulering: "X deelt de laagste score met het volgende onderwerp".

6. **Notatie van getallen binnen de alinea.** Scores houden hun punt en hun /10 ("4.5/10"),
   een prozagetal over de grootte van een gat krijgt een komma en het woord punt ("0,03
   punt"). Dat volgt `_flat_span_woorden` ("binnen één punt van elkaar") en de sectie-intro's
   ("onder de 5,0"), en houdt de twee soorten getallen uit elkaar in plaats van de ene als
   typefout in de andere te laten lezen.

7. **Scheidingsteken in de opsomming van twee kwetsbare onderwerpen is een komma**, geen
   "en": bijna elk echt factorlabel bevat zelf al "en" ("Rolhelderheid en verwachtingen
   eerste 90 dagen"), en met een voegwoord ertussen staat "en" vier keer in één opsomming.
   Na de dubbele punt leest dit als lijst, niet als nevenschikking.
5. **"Nergens dringend om verandering" is een uitspraak over het hele profiel.**
   `direction_state` werkt per factor, dus `_p02_direction_key` geeft die sleutel alleen af
   als het startpunt in `none_needed` staat én geen enkele andere factor met genoeg
   beantwoorders een andere richting laat zien. De per-factor-nuance staat al in
   `_direction_p02_line`, een paar regels lager op dezelfde pagina.

### 5.3 Tests
Scenario 01, 02, 05 krijgen drie verschillende openingszinnen; tellingen kloppen met `_factor_label`-drempels (afgeronde, getoonde waarde, conform ronde 1 B15).

---

## 6. Respons heeft gevolgen (B19)

### 6.1 Regel
`response_rate = afgerond / uitgenodigd` (alleen als uitgenodigd bekend is; bij self_send is `invited_count` de handmatige noemer).

- < `RESPONSE_CAUTION_RATE = 0.5`: bij de responsbasis op p.02 een zin: "Minder dan de helft heeft ingevuld ([a] van de [b]). Lees de uitkomsten als het beeld van wie meedeed, niet van de hele organisatie." En de kernzin krijgt een staart: "(op basis van [a] van de [b] genodigden)".
- < `RESPONSE_INDICATIVE_RATE = 0.3`: bovendien opent de kernzin met "Indicatief beeld:" en het woord "startpunt" wordt "mogelijk startpunt".
- >= 0,5: ongewijzigd.
- uitgenodigd onbekend: geen uitspraak over respons (geen fake percentage), wel de zin "Het aantal genodigden is niet vastgelegd; het responspercentage is daarom niet bekend."

### 6.2 Tests
Scenario 16 (30%: caution-zin, staart, "Indicatief beeld" want 30% is niet < 0,3 → alleen caution; voeg scenario 16b toe met 25% voor de indicatieve variant) en 17 (90%: ongewijzigd).

### 6.3 Implementatie (2026-09-12, taak 4)

Zeven punten wijken af van of verfijnen de regel hierboven.

1. **De noemer zit in een pure helper (`_respons_noemer`), niet inline in `build_report_data`.**
   Anders is de enige regel die bepaalt of het rapport een percentage toont alleen
   te testen met een database erbij. `camp.delivery_record.invited_count` is
   geverifieerd aanwezig (`models.py`: relatie `uselist=False`, kolom nullable);
   de aanroepplek leest dat expliciet uit, zonder `getattr`-default, want zo'n
   default vangt geen ontbrekend record af maar een hernoeming, en dan verliest
   élk rapport stil zijn responspercentage. De helper kreeg er één regel bij die
   niet in het plan stond: een vastgelegd aantal genodigden dat **kleiner** is dan
   het aantal afgeronde vragenlijsten telt niet mee. Bij self-send is dat aantal
   handmatig ingevoerd en de campagnelink is open, dus 50 genodigden met 55
   ingevulde vragenlijsten is een bereikbare stand, en die zou 110% respons op de
   cover zetten. De keten valt dan door naar de volgende regel.
2. **"Geen noemer" dekt twee werkelijkheden, dus de helper geeft de reden mee.**
   Eén zin voor beide beweerde er één: bij een te laag vastgelegd aantal kreeg
   precies de operator die de invoerfout kan herstellen te lezen dat er niets was
   vastgelegd. De helper levert nu `(noemer, zin)`: bij een te laag aantal noemt
   die zin **beide getallen**, en anders zegt hij alleen wat zeker is, namelijk
   dat Loep het aantal genodigden niet kan vaststellen. Die laatste stand is
   zowel self-send zonder ingevuld aantal als een managed campagne waarin
   iedereen invulde, en die twee zijn in de data niet te onderscheiden. De zin
   reist als `n_invited_note` mee in de rapportdata.
3. **Zonder noemer is `completion_pct` None, niet 0,0, en de cover zegt "Onbekend".**
   De coverstat stond niet in het plan, maar `completion` viel daar terug op 0,0
   en de tegel toonde dus "Respons 0%": een getal dat niemand gemeten heeft, op
   de eerste pagina die een MT-lid ziet. `_cover_respons_stat` is nu de enige
   plek waar die tegel wordt gebouwd (was drie keer dezelfde regel).
4. **`_responsbasis` leidt het percentage zelf af.** Het kreeg het als parameter
   én berekende de waarschuwingszin uit dezelfde twee getallen: twee bronnen voor
   één getal, die uit elkaar konden lopen (een bekend aantal met een leeg
   percentage rendeerde letterlijk "None%").
5. **De staart gaat binnen de laatste zin, niet erachter.** Het plan plakte hem
   achter de kernzin (`exec_line + _staart`), wat een losse haakjeszin achter de
   punt oplevert. `_p02_met_respons` zet hem vóór de slotpunt, en bij Loep Vertrek
   vóór de vertrekredenzin die de renderer er nog achter plakt: de noemer hoort
   bij de claim die hij relativeert (het startpunt), niet bij een redentelling.
   De ene terugval die niet claimt maar doorverwijst ("Zie de vertrekcontext ...
   voor wat dit rapport wel toont") krijgt de responsbasis als eigen mededeling
   ervóór: een haakje relativeert een claim, en die staat er niet.
6. **De indicatieve stand wordt doorgegeven, niet achteraf ingevoegd.** Eerst
   verving `_p02_respons_prefix` de tekenreeks "Als startpunt kiest Loep";
   daarmee bleven de tak zonder kwetsbare onderwerpen ("X scoort het laagst en is
   het eerste gesprekspunt") en de "nergens dringend"-tak even stellig. `indicatief`
   gaat nu als parameter naar `_p02_opening` en `_p02_startpunt_zin`, die elk hun
   eigen voorzichtige vorm kiezen ("een mogelijk eerste gesprekspunt", "In wat is
   ingevuld vraagt niemand dringend om verandering"). Het prefix zet alleen nog
   het label.
7. **De responsgevolgen worden toegepast ná de terugval zonder factorprofiel**
   (bug B2). Juist een rapport zonder factorprofiel staat op een dunne basis, dus
   daar hoort de noemer ook in de kernzin te staan.

De 30%-drempel legt zichzelf uit op de plek waar hij werkt: de waarschuwingszin
bij de responsbasis krijgt er onder die grens één zin bij die zegt wat
"indicatief" met de eerste zin van het rapport doet. De halve drempel legt
zichzelf al uit ("minder dan de helft").

---

## 7. Loep Start eerlijk labelen (B18, tussenstap tot v1.1)

- Site, scankaart Loep Start (`home-page-content.tsx`) en output-regel op /producten: "Wij meten vroeg hoe nieuwe medewerkers landen. Helder groepsbeeld, geen individuele beoordeling. De verdieping (waarom, volgens je mensen) en het blok 'wat er moet gebeuren' komen in een volgende versie."
- Rapport Loep Start, p.02 onder de kernzin: "Deze scan bevat nog geen verdiepingsvragen en geen richtingvraag. Het rapport laat zien waar het wringt bij nieuwe medewerkers; wat er volgens hen moet gebeuren volgt in een volgende versie."
- Paginatitels "Verdieping: [factor]" in het Start-rapport hernoemen naar "[factor]" (er is geen verdieping).
- Gespreksagenda Start: de dubbele constatering ("Op deze stelling scoort de groep het laagst" + "Laagst scorende stelling in het cijferbeeld") ontdubbelen; de claim "het laagst van het hele beeld" alleen bij een strikt laagste, bij gelijkspel "een van de laagst scorende stellingen".
- Contract-tests die Start-copy pinnen in lockstep. Geen wijziging aan de Start-survey.

---

## 7b. Bijvangst uit de ronde-1-herbeoordeling (toegevoegd 2026-09-11, na merge `20769ae7`)

**Spreidingsstrook vertrekintentie draait de schaal om.** In de behoudscontext toont de rij vertrekintentie bijv. 3.4 (laag = weinig vertrekgedachten = goed), maar de spreidingsstrook eronder rendert dezelfde vraag als 7.6: de strook gebruikt de omgekeerde as. Dateert van juli, stond niet in de oorspronkelijke twintig bevindingen, en is in ronde 1 bewust niet gefixt. Regel: rij en strook tonen dezelfde waarde op dezelfde as; als de as van vertrekintentie omgekeerd blijft (hoog = slecht), staat dat er in één zin bij, in gewone taal, en klopt de strook daarmee. Test: retention-scenario waarin rij en strook dezelfde gemiddelde tonen. Ronde 1 heeft de claim "hoe hoger, hoe beter" al beperkt tot het signaal zelf (commit `0c7f4992`); deze fix maakt de strook consistent met die regel.

De tweede observatie uit ronde 1 (het raster heeft geen kolom voor de vertrekreden-weging) is al gedekt door par. 1.3.

## 8. Buiten scope (ronde 3)
B9 paginavulling (lay-outtraject), B13 Anders-toelichtingen in het rapport, B14 brug tussen verdieping- en richtingtelling, B20 één drempelregel voor SDT/eNPS bij n < 10, Loep Start v1.1-verdiepingsset.

## 9. Verificatie (verplicht)
1. Backend-suite tegen de baseline via stash-diff (byte-identieke faalset; verwacht 25 failed pre-existent), nieuwe tests voor elke paragraaf.
2. `scripts/stresstest_report.py` alle 20 (+16b) scenario's; matrix bijwerken onder "Na ronde 2" in `docs/rapport-stresstest-2026-09-10.md`; per scenario citaat van de nieuwe p.02-openingszin.
3. Drie voorbeeldrapporten regenereren (HTML + PDF via WeasyPrint-Docker, 0 warnings, 0 em-dashes); p.02, ranglijst, segmentpagina en richtingblok visueel controleren.
4. Frontend: tsc = baseline, marketing-tests faalset per naam identiek, Start-copy op site.
5. Commit + push; Railway-redeploy als openstaande actie voor Lars; beslissingslog in `C:\Users\larsh\CLAUDE.md`.
