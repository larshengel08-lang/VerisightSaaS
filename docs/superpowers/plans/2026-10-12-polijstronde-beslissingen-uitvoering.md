# Beslisronde na de polijstronde: uitvoeringsverslag

Plan: `docs/superpowers/plans/2026-10-12-polijstronde-beslissingen.md`. Bron: de besluiten van Lars van 12-10 op het beslisoverzicht in `docs/superpowers/plans/2026-10-09-polijstronde-uitvoering.md` (punten 1, 3, 11, 12, 13, 15, 23) en de beslissingslog in `C:\Users\larsh\CLAUDE.md`.

Uitgevoerd op 12 en 13 oktober in worktree `.worktrees/polijst-beslissingen`, branch `feature/polijstronde-beslissingen`, vanaf main `329cbba8`. Werkwijze: per taak één implementer, daarna een spec-review en een codekwaliteitsreview, herreview tot beide akkoord waren. **Alle zes taken zijn gebouwd en door de reviews gekomen. Niet gemerged, niet gepusht.**

A6 vroeg geen code: de site over Loep Start blijft zoals hij is tot Start weer verkocht wordt. De besluiten uit groep B waren al in de polijstronde gebouwd.

## Baselines

De faalsets per testnaam zijn de vastgelegde lijsten uit de polijstronde: `docs/superpowers/plans/polijstronde-backend-baseline-fails.txt` (24 namen) en `polijstronde-vitest-baseline-fails.txt` (50 namen: 47 stabiel plus 3 wisselvallig). Die zijn gemeten op main `6b5d3b7f`; de polijstronde mat op haar eindstand, die als `329cbba8` op main kwam, dezelfde faalset per naam (backend `GEEN_REGRESSIES`, vitest niets nieuw). Het plan van deze ronde neemt ze daarom over als baseline voor `329cbba8`. Ik heb ze niet opnieuw gemeten op `329cbba8`. Voor de richtingstaten heb ik wel een tijdelijke worktree van `329cbba8` gemaakt (zie "Richtingstaten").

| | Baseline (`329cbba8`) | Na (HEAD) |
|---|---|---|
| Backend `pytest tests` | 24 failed | 24 failed / 2489 passed / 11 skipped |
| Backend-faalset | `polijstronde-backend-baseline-fails.txt` | identiek per testnaam (`GEEN_REGRESSIES`); Python 3.11-guard zit in de suite en is groen |
| Frontend `tsc --noEmit` | 131 | 131 |
| Frontend `vitest run` | 47 failed (plus 3 wisselvallig) | 47 failed / 1948 tests |
| Vitest-faalset | `polijstronde-vitest-baseline-fails.txt` | niets nieuw aan de `>`-kant; aan de `<`-kant alleen de drie bekende wisselvallige namen (twee in `app/api/action-center-route-follow-ups/route.test.ts`, één in `app/inzichten/page.test.ts`) |
| Frontend-build | groen | groen (`Compiled successfully`), dummy's alleen in de shell |

## Wat er is gebouwd, per besluit

### A1: werkvraag bij een grote niets-groep goedgekeurd

De werkvraagvariant `none_at_least_top` in `backend/products/shared/deepening.py` heet geen CONCEPT meer. "Beide kan kloppen" is "Beide kunnen kloppen", in deze variant en in de al goedgekeurde `split_none`-variant, voor beide scans. Commit `95069ea3`.

In de renders staat de zin in scenario 13 (p.13) en scenario 21 (p.11), bijvoorbeeld: "Deze vertrekkers waren verdeeld: een deel vroeg om verandering, een even groot deel zei dat het goed zat. Beide kunnen kloppen."

### A7: zin bij een gelijkspel dat de richtingvraag beslist

Wint een onderwerp het gelijkspel omdat daar meer mensen om verandering vragen, terwijl de richtingkaart van datzelfde onderwerp verdeeld staat met een niets-groep die minstens zo groot is als de grootste richting, dan zegt het rapport dat nu ook. Dezelfde poort als de kaart (`direction_none_at_least_top_shown` op de getoonde score), één bouwer (`report_priority.direction_niets_zin`), op pagina twee en in de markeringsregel onder de rij van de ranglijst. Commits `95069ea3`, `6997b475`.

De plan-tekst ("..., al kiest daar een even grote of grotere groep ...") is vervangen door een losse zin met tellingen, omdat de halve zin direct achter "meer mensen vragen om verandering (5 van de 8 ...)" las als een vergelijking met alle veranderstemmen, terwijl de niets-groep alleen met de grootste enkele richting wordt vergeleken. Nu:
- pagina twee: "Tegelijk kozen bij {startpunt} {n} van de {m} ‘{niets}’, evenveel als de grootste richting." of "..., meer dan de grootste richting ({k})."
- markeringsregel: dezelfde zin met "hier".

In de renders staat de zin één keer, in scenario 04 op de rij Leiderschap en vertrouwen in de ranglijst (geen agendakaart): "Staat hoger dan Werkdruk en herstelruimte omdat hier meer mensen om verandering vragen (4 van de 8 tegen 2 van de 5). Tegelijk kozen hier 4 van de 8 ‘Niets, dit zit hier goed’, meer dan de grootste richting (3)." Op main stond daar alleen de eerste zin. Op pagina twee komt hij in geen enkel scenario of voorbeeld voor; die kant is unit-getest en met een volledige render per scan gepind.

### A3: veertien Vertrek-werkvragen naar het uitstroomanker

De veertien Vertrek-werkvragen die eindigden op "een jaar geleden" dragen nu het anker "in de periode waar deze meting over gaat", met de door Lars goedgekeurde staarten (#3 in de nieuwe vorm, #8 in de formulering van Lars). Het rapport vervangt dat anker door de uitstroomperiode van pagina twee. Het eerste deel van elke vraag is letterlijk gelijk; de zeven vragen met "het afgelopen jaar", een gebeurtenis of "sindsdien" zijn ongewijzigd. Commits `65325881` (teksten), `bb767a8f`, `b187c9df`.

Controles (eis Lars) over alle 29 vragen met het anker: met twee maanden en met één maand blijft elke vraag een lopende zin op "?" zonder dubbele spaties of verdwaalde leestekens; bij een onbekende periode blijft de terugvaltekst staan en eindigt de vraag op "?". Geen Vertrek-vraag noemt nog "een jaar geleden".

### A4: geen cijfer bij kleine afdelingen

In de afdelingstabel toont de scorekolom bij 5 tot 9 antwoorden geen cijfer meer maar "kleine afdeling" in kleine grijze tekst; de kolom Band houdt het label. De restgroep volgt haar eigen aantal (in het Start-voorbeeld heeft "Overige afdelingen" 10 antwoorden en toont dus wel 6.4). Commits `8af8bc0c`, `3ba96fe7`.

Afwijking van de plantekst: de intro zegt "staat in die kolom en in de scorekolom alleen een label", niet "in de score- en themakolom", omdat "thema" op de verboden lijst van de taalcontrole staat.

### A8: frictiescore per afdeling bij Loep Vertrek

Loep Vertrek toont per afdeling de frictiescore zelf (hoger is slechter), kop "Frictiescore", kleur en band uit de frictiebanden, in cel, band, spreidingsstrook, navy conclusie (alle staten en de restgroepzin) en de brugzin op pagina twee. De omrekening gaat vanaf de getoonde score, zodat gelijkstand en 0,3 verschil ook zo op de pagina staan. Welke afdeling wordt aangewezen en de volgorde zijn ongewijzigd. Loep Behoud en Loep Start veranderen niet. Commits `8af8bc0c`, `3ba96fe7`.

Te zien in alle Vertrek-renders met een afdelingstabel, bijvoorbeeld `zz_besluitmax_max_vx_vertrek_afdeling` p.8: "Operations 14/28 · 6.5 · Gemengd frictiebeeld", vier kleine afdelingen met "kleine afdeling" en "Laag frictiebeeld", en in het navy blok "Operations heeft de hoogste frictiescore van de afdelingen die apart getoond worden (6.5/10; 14 van de 28 uitgenodigden vulden in)." Het Vertrek-voorbeeld heeft geen afdelingstabel.

### A5: blijf- en vertrekintentie per afdeling (Loep Behoud)

Commits `ce4328ca`, `4a21b90a`, `3142d7bb`.

- **Data:** per afdeling uit de afdelingstabel met minstens 10 antwoorden en minstens 10 losse scores op beide intenties: aantal, gemiddelde blijfintentie, aantal met veel vertrekgedachten (vertrekintentie vanaf 6,5). Alleen Loep Behoud. Nooit de restgroep, nooit kleinere afdelingen gebundeld, geen uitsplitsing binnen een afdeling.
- **Blok** "Blijf- en vertrekintentie per afdeling" (anker `sec-intenties`) onder de afdelingstabel, in het raster van de uitsplitsing per afdeling. Behoud-voorbeeld p.10: "Operations 17 · 3.5/10 Kwetsbaar punt · 11 van de 17".
- **Pagina twee:** de zin "dit rapport splitst ze niet per afdeling uit" is weg. Met blok: "Per afdeling staan ze bij de afdelingen (pagina 10), voor afdelingen met minstens 10 antwoorden." Zonder: een van vijf redenen, bijvoorbeeld "... die zijn er in deze meting niet." (scenario 10 en 18).
- **Privacy, afgetrokken rest:** pagina twee toont de totalen. Totaal min de getoonde afdelingen is de rest; ligt die rest op een van de maten tussen 1 en 9 personen, dan valt de kleinste getoonde afdeling weg en zegt pagina twee dat ("...; {afdeling} staat er niet in, zodat een kleine groep niet herleidbaar wordt."). Blijft er niets over, dan geen blok. Dat geval komt in geen render voor en is unit-getest en met een volledige render gepind.
- **Methodiekpagina:** de drempelrij van 10 noemt blijf- en vertrekintentie per afdeling als het blok er staat.
- **Paginapassing:** rasterrijen compacter en het bandlabel op één regel, alleen in het raster met het intentieblok. Alle renders hielden hetzelfde aantal pagina's.

Het blok staat in alle Behoud-scenario's met een afdeling van 10 of meer antwoorden (01 tot en met 06, 09, 11 tot en met 17, 19, de drie `zz_besluitmax_*_06` en het Behoud-voorbeeld).

### A2: vaste uitzonderingen in de paginameting

`scripts/check_pdf_report.py` heeft één lijst `VULLING_UITZONDERINGEN`: per uitzondering het bestandsvoorvoegsel, de hele paginakop en een ondergrens gelijk aan de meting van 13-10 (naar beneden op een promille, speling bewust nul):

| Bestand | Pagina | Ondergrens | Soort |
|---|---|---|---|
| 01 | p.7 "Verdieping: Werkdruk en herstelruimte" | 0,355 | verdiepingspagina |
| 01 | p.13 "Zo maak je er een besluit van" | 0,386 | werkvragenpagina |
| 09 | p.7 "Verdieping: Cultuur en psychologische veiligheid" | 0,257 | verdiepingspagina |
| 09 | p.13 "Zo maak je er een besluit van" | 0,386 | werkvragenpagina |
| 14 | p.13 "Zo maak je er een besluit van" | 0,321 | werkvragenpagina |
| 19 | p.7 "Verdieping: Beloning en eerlijkheid" | 0,355 | verdiepingspagina |

Een uitzondering telt niet als bevinding en staat bij naam in de uitvoer ("uitzondering: werkvragenpagina p.13 39%"). Onder de ondergrens, in een ander bestand, op een vervolgpagina of bij een andere regel blijft het een bevinding. Alleen `check_met_uitzonderingen`, de opdrachtregel en `render_in_image.py` passen ze toe, altijd op bestandsnaam; `check()` zonder naam past niets toe. Reden in het commentaar: R23, besluit Lars 12-10. Commits `359250bf`, `be9d8663`, `3385cfb6` (de laatste: de test controleert ook dat elke ondergrens een hele promille is).

## Wat de reviews vonden

- **A7:** de halve zin uit het plan vergeleek in feite met de grootste enkele richting, maar las als een vergelijking met iedereen die om verandering vroeg. Vervangen door een losse zin met tellingen (`6997b475`).
- **A4:** "KLEINE AFDELING" in de mono-hoofdletterletter maakte de scorekolom ongeveer 12 pt breder (WeasyPrint neemt de langste regel; gemeten in het productie-image). Opgelost met een regelbreuk en een gewone letter, zodat de kolom even breed blijft als met een cijfer (`3ba96fe7`).
- **A5, aftrekrisico:** de review vond dat de cijfers per afdeling van de totalen op pagina twee konden worden afgetrokken, waardoor een groep van 1 tot 9 personen herleidbaar werd. Afgevangen: de kleinste getoonde afdeling valt dan weg, en pagina twee zegt dat (`ce4328ca`, `4a21b90a`).
- **A5, telbron:** "Ingevuld" telde alle ingevulde vragenlijsten, de afdelingstabel alleen wie een werkbeeldscore heeft. Nu één bron: dezelfde n als de tabel (`4a21b90a`).
- **A5, overig:** een stille terugval naar "geen tabel" werd een harde fout bij een onmogelijke staat; twee eerlijke redenen erbij ("niet vastgelegd", "te weinig antwoorden op deze vragen"); CSS alleen in het raster met het intentieblok.
- **A2:** de melding onder de ondergrens sprak zichzelf tegen (39% gevuld, terwijl de grens 38,6% was en de pagina 38,5%): nu beide naar beneden op een promille. En `check()` paste de uitzonderingen stilzwijgend toe zonder dat de aanroeper het zag; nu alleen op naam en altijd gemeld (`be9d8663`).
- **A3:** testopruiming (een dubbele test weg, namen rechtgezet, `b187c9df`).
- **Proces:** de implementer van Taak 2 stopte halverwege op een verlopen token; een nieuwe implementer heeft het ongecommitte werk afgemaakt en gecommit.

## Metingen

### Voorbeeldrapporten (stap 1)

HTML opnieuw gegenereerd met `generate_voorbeeldrapport.py`, in `docs/examples/` en `frontend/public/examples/` byte-gelijk. PDF's uit de eindrender in het productie-image (`loep-backend:test`, WeasyPrint 70.0) onder de bestaande namen naar beide mappen gekopieerd. Commit `e52c8045`.

| Voorbeeld | Pagina's | Warnings | Streepjes | `check_pdf_report.py` |
|---|---|---|---|---|
| Loep Vertrek (`voorbeeldrapport_loep`) | 17 | 0 | 0 | OK |
| Loep Behoud (`voorbeeldrapport_retentiescan`) | 19 | 0 | 0 | OK |
| Loep Start (`voorbeeldrapport_onboarding`) | 13 | 0 | 0 | OK |

Geen van de drie raakt een uitzondering. De Vertrek-PDF is byte-gelijk aan de vorige: in de HTML veranderde alleen CSS (de A5-regels voor het intentieraster), en dat voorbeeld heeft geen afdelingstabel of A1/A7-zin.

Zelf bekeken (PyMuPDF naar PNG): Behoud p.2 (intentieregel met "pagina 10", past op één A4), Behoud p.10 (kleine afdelingen met label, intentieblok naast het subblok van Operations, navy blok), Start p.7 (kleine afdelingen met label, restgroep van 10 met cijfer), `zz_besluitmax_max_vx_vertrek_afdeling` p.8 (kolom Frictiescore), scenario 21 p.11 ("Beide kunnen kloppen").

### Hero-afbeelding (stap 2)

`scripts/render_hero_p02.py` opnieuw gedraaid. Pagina twee veranderde door A5 (de intentieregel verwijst nu naar de afdelingen), dus de afbeelding is vervangen: knip y = 40 tot 454,6 pt zonder doorsneden blok (het eerste blok eronder begint op 454,9 pt), 1489 x 1037 px (ongewijzigd, dus `width`/`height` in `home-page-content.tsx` blijven), WebP 126.150 bytes (was 124.860). Zelf bekeken: geen afgesneden regel, de intentieregel staat helemaal in beeld.

### Eindrender (stap 3)

`scripts/render_in_image.py` in het productie-image, na het opnieuw genereren van `docs/stresstest/`, `zz_besluitmax_*` en de voorbeelden, zonder selectie. Uitvoer in `C:/Users/larsh/AppData/Local/Temp/loep-polijst/t6-render.txt`.

**`TOTAAL 34 bestanden, 0 met bevindingen`**, 0 warnings, 0 streepjes. Precies de zes uitzonderingen zijn toegepast, met dezelfde percentages als de vorige eindmeting:
- 01: verdiepingspagina p.7 36%, werkvragenpagina p.13 39%
- 09: verdiepingspagina p.7 26%, werkvragenpagina p.13 39%
- 14: werkvragenpagina p.13 32%
- 19: verdiepingspagina p.7 36%

Paginatallen gelijk aan de eindmeting van de polijstronde: 01 18, 02 18, 03 18, 04 16, 05 19, 06 19, 07 8, 08 14, 09 18, 10 19, 11 20, 12 18, 13 18, 14 18, 15 18, 16 19, 16b 19, 17 19, 18 14, 19 17, 20 13, 21 14, 22 14, de acht `zz_besluitmax_*`-bestanden 19 (de drie varianten van 06), 14 (de twee varianten van 08) en 17 (de drie varianten van vx_vertrek_afdeling), voorbeelden Vertrek 17, Behoud 19, Start 13. Het intentieblok en de nieuwe tabelcellen kosten nergens een pagina.

### Richtingstaten (stap 4)

Methode als in de polijstronde: `scripts/richting_staten.py` (alle kaarten op de gespreksagenda, rol, onderwerp, staat) over `docs/stresstest/` en met `--voorbeelden` over de drie voorbeelden. Baseline in een tijdelijke worktree van `329cbba8` (scenario's, `zz_besluitmax_*` en voorbeelden daar opnieuw gegenereerd), na op HEAD.

**Geen enkele kaart wisselt van staat.** `diff t6-staten-main.txt t6-staten-na.txt` is leeg (65 regels aan beide kanten). Dat klopt met de opzet: A1 en A7 veranderen alleen tekst, A3 alleen werkvragen, A4/A5/A8 alleen de afdelingspagina en pagina twee, en A2 alleen de meting.

## Browsercheck homepage (stap 6)

De hero-afbeelding veranderde, dus de homepage is bekeken op de dev-server van deze worktree (poort 3150, tijdelijke launch-configuratie, daarna byte-gelijk teruggezet).

| Controle | Uitkomst |
|---|---|
| Afbeelding geladen | ja; `/images/voorbeeld-loep-behoud-p02.webp` levert 126.150 bytes (de nieuwe), alt-tekst ongewijzigd |
| Desktop 1440 | afbeelding 478 x 333 px; label "Voorbeeld" rechtsboven binnen de afbeelding (x 1172 tot 1269, afbeelding tot 1269); geen horizontale scroll (`scrollWidth` 1425 = `clientWidth`) |
| 375 px | afbeelding 334 x 232 px in de kolom (x 21 tot 354), label rechtsboven zichtbaar, `scrollWidth` 375, geen element breder dan het scherm; next/image kiest de 828-variant, dus scherp op een scherm met dubbele pixeldichtheid |
| Console | alleen de bekende CSP-melding over het debugscript van Vercel Analytics in dev |

In het verborgen previewpaneel bleef de inschuifanimatie op zijn beginstand staan (opacity 0, 40 px verschoven), het bekende rAF-verschijnsel. Voor de meting heb ik die beginstand in de pagina opgeheven; geen productfout. Screenshots bevatten geen inloggegevens.

## Wat Lars nog moet beslissen of weten

1. **Per afdeling kan "niemand" of "iedereen" zichtbaar worden.** Heeft in een afdeling niemand of juist iedereen veel vertrekgedachten ("0 van de 17" of "17 van de 17"), dan weet het MT daarmee van elk lid van die afdeling hoe het zit. Dat staat al in de renders: scenario 04 toont "Operations 14 ... 0 van de 14", scenario 05 "14 van de 14". Dat botst met de eigen regel van het plan (geen combinatie die een persoon herleidbaar maakt). Advies: bij 0 of n alleen het gemiddelde tonen met een label, zonder telling. Besluit nodig vóór de merge.
2. **Aftrekken van het totaal is alleen voor de intenties afgevangen.** Werkbeeld- en onderwerpscores per afdeling konden al vóór deze ronde worden afgetrokken van het organisatietotaal om iets over de rest te zeggen. Voor blijf- en vertrekintentie vangt deze ronde dat af (de kleinste getoonde afdeling valt weg als de rest 1 tot 9 personen telt); voor de andere scores niet.
3. **Loep Vertrek kleurt per afdeling minder rood.** Afdelingen worden nu beoordeeld op de frictiegrenzen (4,5 / 7,0) in plaats van de grenzen bij de onderwerpen (5,0 / 6,5). Voorbeeld uit `zz_besluitmax_max_vx_vertrek_afdeling`: Operations stond op main als "4.5 Kwetsbaar punt" (rood), nu als "6.5 Gemengd frictiebeeld" (oranje). Dezelfde antwoorden, een andere grens. Dat volgt uit het eerdere besluit om de eigen frictiegrenzen te houden (V13), maar het is nu ook per afdeling zichtbaar. Binnen één kaart leest het als een tegenspraak: de kolom Band gebruikt 4,5 / 7,0, de uitsplitsing per afdeling direct eronder noemt 5,0 / 6,5, en Operations staat als "6.5 Gemengd frictiebeeld" boven zes onderwerpen die allemaal "Kwetsbaar punt" zijn (4.1 tot 4.8). Advies: de uitlegzin bij de scorekolom (`SEGMENT_SCOREKOLOM["exit"]["zin"]`) aanvullen met "De kolom Band gebruikt de grenzen van de frictiescore: laag onder 4,5, sterk vanaf 7,0." Kleine copyfix, vóór de merge.
4. **De intro van het afdelingsblok wijkt af van de plantekst:** "in die kolom en in de scorekolom" in plaats van "in de score- en themakolom", omdat "thema" op de lijst van verboden woorden staat.
5. **Het intentieblok toont niet "x van de n onder de 5"** voor de blijfintentie per afdeling, alleen het gemiddelde met label en het aantal met veel vertrekgedachten. Pagina twee noemt dat aantal wel voor de hele organisatie.
6. **De A7-zin staat ook op rijen van de ranglijst die niet op de gespreksagenda staan** (in de renders alleen scenario 04, Leiderschap en vertrouwen). Daar is geen kaart om tegen te spreken; de zin is waar, maar hij is daar minder nodig.
7. **Pagina twee noemt het aantal niets-stemmen altijd twee keer als de A7-zin daar verschijnt:** in de openingsregel en in de richtingregel eronder, met dezelfde getallen. De extra zin duwt de openingsregel bovendien naar de kleinere letter. Geen scenario raakt deze tak, dus dat pagina twee dan op één A4 blijft is niet in het productie-image gemeten. Advies: de A7-zin op pagina twee weglaten (`_p02_startpunt_zin`); de richtingregel neemt de tegenspraak daar al weg en de regel onder de ranglijstrij houdt A7. Alternatief: houden en een scenario bouwen dat de tak raakt en meten. Besluit nodig vóór de merge.
8. **De navy alinea bij Loep Vertrek gebruikt twee leesrichtingen in één alinea:** "de hoogste frictiescore (6.5/10)" (hoog is slecht) naast "het laagst scorende onderwerp daar is leiderschap en feedback (4.1/10)" (hoog is goed).
9. **Restgroep heet "kleine afdeling".** Een samengevoegde rij met 5 tot 9 antwoorden ("Overige afdelingen (Customer Success, HR, IT, Sales)" in het Behoud-voorbeeld) krijgt het label "kleine afdeling"; "kleine groep" is daar juister.
10. **De afdelingsconclusie rangschikt nog kleine afdelingen** ("De twee laagste afdelingen liggen dicht bij elkaar (Sales en IT)"), terwijl de tabel voor hen sinds A4 geen cijfer meer toont. De lezer kan die bewering op de pagina niet controleren.
11. **Het intentieblok zegt niet dat een restgroep nooit meedoet.** Een restgroep van 10 of meer zou in de tabel een cijfer hebben maar ontbreken in het blok. Komt in geen Behoud-render voor.
12. **Klein, technisch:** `DIRECTION_NONE_TEXT` is een gewone, veranderbare dict; een bevroren vorm voorkomt dat iemand per ongeluk de niets-tekst van een scan overschrijft.

## Opruimen na de merge (groep C)

- De kop "Appendix" wordt "Bijlage".
- De terugkoppelingsregel in het dashboard volgt `segment_departments`, zoals het rapport (nu altijd met het afdelingsdeel).
- De resterende respondentteksten gelijktrekken ("helpt de organisatie gerichter te verbeteren" op de bedankpagina, "Verduidelijking" tegen "Korte verduidelijking", "vertrouwelijk" tegen "anoniem").
- Dode code met de oude naam weghalen (`suiteSignalMetrics` in `home-page-content.tsx`, `hero-motion-dashboard.tsx`), verify-before-delete.
- De `review_when`-teksten in `report_html.py` die nooit renderen.

## Na merge

Geen migratie. Na merge een Railway-redeploy van "Loep main" (backend: rapport, werkvragen, meetscript) en Vercel deployt de frontend (hero-afbeelding en voorbeeldrapporten) automatisch.

## Opruimwerk

- Meetuitvoer in `C:\Users\larsh\AppData\Local\Temp\loep-polijst\` (niet in de repo): o.a. `t6-render.txt`, `t6-staten-main.txt`, `t6-staten-na.txt`, `t6-suite.log`, `t6-na.txt`, de PDF's in `out-t6/`, de hero in `hero-t6/`, `launch.json.t6-orig`, plus de bestanden van de eerdere taken (`a2-*`, `a3-*`, `a5-*`, `a5b-*`).
- De tijdelijke worktree van `329cbba8` in de scratchpad is na de meting verwijderd (`git worktree remove`).
- `docs/stresstest/` is gitignored en bevat de eindmeting.

De branch is klaar voor verificatie door de hoofdsessie.
