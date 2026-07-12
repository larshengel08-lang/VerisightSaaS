# Rapport-designsprong — ontwerp (fase 2 uit de route A-review)

**Datum:** 2026-07-12
**Status:** goedgekeurd door Lars (brainstorm met visual companion; keuzes A / A+B / A)
**Scope:** `backend/report_html.py`, `backend/report_css.py`, samples. Alle drie WeasyPrint-rapporten (exit, retention, onboarding). Geen datalaag-, scoring- of survey-wijzigingen.

## Doel

Het PDF-rapport van 7/10 naar 8,5/10 "premium consultancy-deliverable" brengen binnen de bekende WeasyPrint-grenzen. De vier ingrepen komen uit de pagina-voor-pagina review van 2026-07-12 (raster-inspectie van alle pagina's op 110–220 dpi). Fase 1 (lege eNPS-pagina, halve SVG-stippen) is al gefixt in `8757b7cb` en valt buiten deze spec.

## Niet-doelen

- Geen nieuwe analyse of interpretatielaag. De agenda-onderbouwing (§3) haalt uitsluitend reeds berekende waarden naar de kaart.
- Geen wijziging aan eerlijkheidsregels: staffels, noemer-ketens, "geen causale ranking"-voetregels en degraded states blijven letterlijk behouden.
- Geen wijziging aan de cover of de legacy ReportLab-renderer (`report.py`).
- Verdeling-strips bij intentievragen blijven geparkeerd (besluit 2026-07-09).

## 1. Openingspagina: bestuurlijke read + responsbasis samengevoegd (keuze A)

Vandaag: de bestuurlijke read stopt op ~50% van p2; de responsbasis vult ~15% van p3. Het why-blok verwijst met "Zie p.03" naar de responsbasis.

Nieuw: één openingspagina per rapport, van boven naar beneden:

1. **Bestuurlijke read** — eyebrow + titel + subtekst + why-blok, ongewijzigd van inhoud.
2. **Responsbasis-band** — direct daaronder op dezelfde pagina:
   - de bestaande vier stats (uitgenodigd / afgerond / respons% / meetperiode) als compacte statregel (bestaande `sg`-tabelstijl);
   - de bestaande regels Populatie en Segmentstatus, compact (geen los kaartblok per regel);
   - het bestaande Datastatus-blok (bijv. eNPS niet gemeten) alleen wanneer van toepassing — bestaande logica van `_responsbasis` blijft.
3. De **"Zie p.03"-cel in het why-blok vervalt.** De vierde why-cel (Responsbasis) wordt vervangen door de eerstvolgende zinvolle bestaande waarde óf weggelaten (drie cellen is acceptabel); geen verwijzing meer naar een paginanummer.

Implementatie: `_responsbasis(...)` krijgt een compacte variant (of parameter `compact=True`) die geen eigen `pb sec`-pagina opent maar een blok teruggeeft dat de bestuurlijke-read-sectie aanvult. De drie renderers roepen de compacte variant aan binnen de openingssectie; de losse responsbasis-pagina vervalt. Rapporten worden 1 pagina korter (na fase 1: 15 → 14; onboarding volgt dezelfde beweging).

Randgeval: als de openingsinhoud + responsbasis-band niet op één A4 past (lange factornamen, datastatus aanwezig), mag de band doorbreken naar de volgende pagina — geen `no-break` op de hele sectie forceren; alleen de statregel zelf blijft `no-break`.

## 2. Navy contrast-ankers (keuzes A + B)

**2a. Gespreksagenda als navy vlak.** De agendapagina ("Eerste managementspoor / Gespreksagenda"): de vier agendakaarten + de gespreksopener worden samen één navy blok (`#0D1B2A`) met amber (`#E8A020`) labels en chalk-tekst. De kaarten krijgen binnen het navy vlak hairline-borders (bijv. `1px solid #2A3D52`); de gespreksopener behoudt zijn amber left-border en wordt visueel onderdeel van hetzelfde vlak (geen tweede los donker blok). Paginakop (eyebrow + "Gespreksagenda" + subtekst) blijft op chalk.

**2b. Segmentconclusie als navy blok.** In `_segment_block`: de bestaande `low_note` ("**X** scoort het laagst (n.n/10) — logisch startpunt voor de bespreking.") wordt een navy conclusieblok onder de tabel met amber label "Startpunt voor de bespreking". De bestaande voorwaarde (alleen als de laagste rij geen pooled rij is) blijft. De trustline-voetregel blijft daaronder op chalk.

Er komen **geen andere** navy vlakken in het binnenwerk bij (cover uitgezonderd) — twee ankers, bewust.

WeasyPrint-kaders (bekende gotcha's): geen CSS custom properties, geen `gap` op flex, geen `inset`-shorthand; kleuren via directe Python-stringinterpolatie.

## 3. Agenda-onderbouwing: "waarom eerst"-regel per datakaart

Probleem (Lars): de agendakaarten zeggen *wat* eerst, maar het *waarom* staat pagina's verderop — de agenda leest als interpretatie.

Nieuw: kaarten met een datagedreven claim krijgen één onderbouwingsregel uit **bestaande** berekeningen:

- **Primair thema:** regel met het laagste item + score en, indien verdiepingsdata aanwezig, de bestaande noemer-keten: `"Laagste item in het cijferbeeld (4.8/10); 6 van de 9 respondenten met verdieping kozen deze toelichting."` Zonder verdiepingsdata alleen het item + score-deel.
- **Tweede aandachtspunt:** regel met de positie in de rangorde: `"Tweede laagste factorscore in het overzichtsprofiel."`
- **Eigenaarschap** en **Opnieuw bespreken**: ongewijzigd (geen dataclaim, dus geen onderbouwingsregel).

De regel is klein (mono of 9px steel-grijs binnen het navy vlak: chalk-gedempt), feitelijk, zonder duiding — dezelfde toon als de bestaande noemer-ketens. De aantallen komen uit de al aan de renderer doorgegeven verdiepings-aggregatie (dezelfde bron als het "Welke toelichting respondenten kozen"-blok); er wordt niets opnieuw of anders berekend.

## 4. Pagina-hiërarchie: genummerde hoofdstukken (keuze A)

**Hoofdstukstart:** amber hoofdstuknummer (JetBrains Mono, groot, bijv. 22–26px, `#E8A020`), daaronder een korte navy rule (~48px, 3px), daaronder het bestaande eyebrow-label + kop. **Vervolgpagina:** bestaande compacte opener, met "— vervolg" achter het eyebrow-label (bijv. "VERDIEPING — VERVOLG").

Ruggengraat (retention, alle secties aanwezig): 01 Overzicht (nieuwe openingspagina) · 02 Context (behoudscontext) · 03 Agenda · 04 Verdieping (eerste factorpagina; volgende factorpagina's = vervolg) · 05 Werkbeleving (SDT) · 06 Segmenten · 07 Stemmen (quotes) · 08 Appendix (eerste pagina; doorloop = vervolg) · 09 Methodiek.

**Nummering is afgeleid, niet hardcoded:** conditionele secties (quotes < drempel, segment degraded → segment-degraded blijft een sectie met nummer; eNPS-beschikbaar voegt een sectie toe) schuiven de nummers op zonder gaten. Implementatie: een kleine teller/helper in de renderer (bijv. `_chapter()` die een oplopend nummer uitdeelt en de opener-HTML bouwt), per renderer aangeroepen op het moment dat een sectie daadwerkelijk wordt geëmit. Exit en onboarding volgen dezelfde systematiek met hun eigen sectievolgorde.

De cover en de nieuwe openingspagina behouden hun eigen karakter; de openingspagina is hoofdstuk 01.

## Testen

- Bestaande design-/pdf-tests in lockstep bijwerken waar ze paginastructuur pinnen (o.a. responsbasis als losse sectie, `low_note`-markup, agendakaart-markup).
- Nieuw: (a) openingspagina bevat bestuurlijke read én responsbasis-stats in één sectie, geen "Zie p.03" meer; (b) agendablok rendert navy-markers + amber labels; (c) "waarom eerst"-regel aanwezig bij primair thema mét verdiepingsdata en afwezig zonder dataclaim-kaarten; (d) segmentconclusie rendert als navy blok, alleen bij niet-pooled laagste rij; (e) hoofdstuknummers oplopend zonder gaten bij weggelaten conditionele secties; (f) "— vervolg" op tweede+ verdiepingspagina.
- Volledige backend-suite op de 25-failed baseline (0 nieuwe regressies).

## Validatie

Samples (exit/retention/onboarding) regenereren; WeasyPrint-Docker render 3× exit 0 / 0 warnings; per gewijzigde pagina raster-inspectie (≥200 dpi op randgevallen); paginatelling en tekstextractie-checks (geen "Zie p.03", wel hoofdstuknummers). PDF's naar `frontend/public/examples/`. Railway-redeploy nodig na push (backend-Python).
