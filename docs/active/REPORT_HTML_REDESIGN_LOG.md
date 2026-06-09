# REPORT_HTML_REDESIGN_LOG.md

Bijhouder van alle inhoudelijke wijzigingen aan `backend/report_html.py` en aanverwante rapport-templates.
Doel: Codex en toekomstige sessies kunnen altijd zien wat er is veranderd, waarom, en wat de visuele/commerciële rationale was.

---

## 2026-06-05 — Grote visuele upgrade + cultuurassessment-port

### Aanleiding
De demo HTML-bestanden (`loep-rapport-preview-v5b.html`, `-retentie.html`, `-onboarding.html`) waren visueel ver voor op de productie-output van `report_html.py`. Alle verbetering zat alleen in de demo's, niet in wat de "Genereer PDF"-knop levert.

### CSS-upgrades (rapport_html.py `_CSS` block)
| Element | Oud | Nieuw | Reden |
|---------|-----|-------|-------|
| `body` font-size | 11px | 12px | Leesbaarheid op scherm en in print |
| `.slabel` | border-bottom tekstlabel | achtergrondstripe + linker dark border | Visueel gewicht, paginaritme |
| `.why` block | wit + lichte border | donker navy (#1E293B) | Ankerpunt op de pagina, commerciële urgentie |
| `.theme-card` | wit | warm (#FFF9F4) | Onderscheidt quote-laag van data-laag |
| `.ig td` | wit | koel blauw (#F4F7FB) | Onderscheidt insight-grid van kaarten |
| `.sc-v` | 20px | 23px | KPI-waarden moeten groter zijn dan de rest |
| `.card` | 18px padding | 20px padding | Meer lucht, minder dicht |
| `.cover` | statisch | flex + cover-signal classes | Maakt ruimte voor het primaire signaalblok |
| `.sec` margin-bottom | 24px | 32px | Secties ademen, minder dicht |

### Functie-upgrades

#### `_cover()` — nieuw signaalblok
**Waarom:** De cover was generiek. Het primaire signaal (laagste factor) wordt nu prominent getoond als groot blok met gouden label, naam en context-ondertitel. Dit is de eerste indruk — die moet direct duidelijk maken wat er in het rapport staat.

#### `_gauge_svg()` — dark_bg parameter
**Waarom:** Gauges op donkere achtergrond hebben andere tekstkleuren nodig (wit i.p.v. donker). De `dark_bg=True` parameter past alle kleuren aan zonder de functie te dupliceren.

#### `_trust_page(scan_type)` — scan-specifieke tekst
**Waarom:** "ExitScan is terugkijkende vertrekduiding" slaat nergens op als je een RetentieScan of OnboardingScan leest. Drie varianten toegevoegd. Taal ook minder defensief: "managementinput, geen diagnose" i.p.v. uitgebreide disclaimerlijst.

#### `_leeswijzer(scan_type)` — nieuw
**Waarom:** Premium rapporten (Mercer/Sirota, McKinsey) beginnen altijd met een leeswijzer/roadmap. Klanten weten dan meteen waar ze zijn en wat er nog komt. Drie varianten: exit (6 stappen), retention (6), onboarding (5).

#### `_relevance_exit()` — nieuw
**Waarom:** De actiematrix heeft een Y-as nodig die niet alleen de factorscore herhaalt. Voor ExitScan wordt vertrekrelevantie berekend vanuit feitelijke exit- en contributing-reason frequenties. Zo zegt de matrix: "dit speelt zowel laag als vaak als reden."

#### `_relevance_inverted()` — nieuw
**Waarom:** Voor RetentieScan en OnboardingScan is er geen exit-reason frequentie. Simpelste correcte proxy: lagere factorscore = hogere behoudsdruk/urgentie. Geeft dezelfde kwadrant-logica.

#### `_actiematrix_svg()` — nieuw
**Waarom:** De Sherwin-Williams/Mercer-rapport had een "Action Priority Grid" — dit was het meest onderscheidende element. Factoren geplotterd op score × urgentie geeft direct prioriteitsadvies dat een staafgrafiek niet geeft. Vier kwadranten: Prioriteit / Bewaken / Minder urgent / Relatief sterk.

### Renderer-upgrades

#### `render_exit_report_html()`
- Cover vult nu automatisch primary_signal_value en primary_signal_sub vanuit laagste factor + exit-context
- Leeswijzer toegevoegd na cover
- Actiematrix toegevoegd na factoranalyse (met vertrekrelevantie als Y-as)
- "Sterkste item" → "Hoogste item binnen deze factor" (een 5.0/10 is niet sterk)
- Hoogste-item-box: groen → neutraal grijs
- Factoranalyse legenda: "gemengd beeld" → "aandachtspunt"
- Sectietitel "Factor detail — itemniveau" → "Verdieping — prioritaire factoren"
- Benchmark-note toegevoegd

#### `render_retention_report_html()`
- Cover met primary_signal (laagste factor als behoudssignaal)
- Leeswijzer (retention-variant)
- Actiematrix met behoudsdruk als Y-as
- Gauge op donkere achtergrond

#### `render_onboarding_report_html()`
- Cover met primary_signal (eerste checkpointspoor)
- Leeswijzer (onboarding-variant, compact 5 stappen)
- Actiematrix met checkpoint-urgentie als Y-as
- Gauge op donkere achtergrond

#### `render_report_html()` dispatcher
- `culture_assessment` route toegevoegd → `render_culture_report_html()`

---

## 2026-06-05 — CultuurAssessment port naar WeasyPrint

### Aanleiding
`voorbeeldrapport_cultuurbeeld.pdf` was gebouwd met ReportLab (`report.py`). Dat rapport:
- Had geen visuele bar charts voor domeinscores (alleen tekstlijst)
- Had geen Culture Index gauge
- Was taal-dominant defensief (80% disclaimers, 20% inzicht)
- Deelde geen visuele taal met de andere rapporten
- Claimde "premium board artifact" maar leverde iets fundamenteel anders

### Wat er is gebouwd: `render_culture_report_html()`
Nieuwe renderer voor `culture_assessment` in `report_html.py`.

Structuur (10 secties):
1. Cover — Culture Index als primary signal
2. Leeswijzer — 6 stappen, cultuur-specifiek
3. Culture Index hero — gauge + domeinprofiel overzicht
4. Board attention points — dark why-block met top 3 aandachtsdomeinen
5. Domeinprofiel — horizontale bar chart, alle 10 domeinen
6. Prioriteitenmatrix — score × structurele druk (inverted score)
7. Patroonlezing — narratief samenhangsspoor
8. Segmentstatus — governance state
9. Vervolgrichting
10. Methodiek

### Kernkeuzes

**Culture Index gauge:** Zelfde visuele taal als ExitScan. Score 1-10, amber/rood bij lagere scores. Kleur op dark background. Board ziet direct het totaalgetal.

**Dark why-block voor board attention:** De drie aandachtsdomeinen in dezelfde donkere ankersectie als ExitScan's "Waarom X bovenaan staat". Dit is het commissieartikel van het rapport — geeft het gewicht dat het verdient.

**Bar chart domeinprofiel:** Alle 10 domeinen als gesorteerde horizontale SVG-bars met RAG-kleuring. Vervangt de tekstlijst volledig.

**Toon-shift:** Board attention points nu met echte scores en labels, niet met generieke verificatietekst. Governance disclaimers alleen op de methodiek-pagina, niet door het hele rapport verspreid.

**`_leeswijzer("culture")` variant toegevoegd.**

**`_trust_page("culture_assessment")` variant toegevoegd.**

### Dispatcher-update
`render_report_html()`: `if st == "culture_assessment": return render_culture_report_html(data)`

---

## 2026-06-05 — Playwright fallback + sample regeneratie

### Aanleiding
WeasyPrint heeft GTK/Pango nodig op Windows — beschikbaar op Railway (Linux productie) maar niet lokaal.

### Oplossing
`generate_campaign_report_html()` probeert eerst WeasyPrint, valt terug op Playwright + Chromium headless als WeasyPrint niet beschikbaar is.

### generate_voorbeeldrapport.py
- Import van `generate_campaign_report_html` toegevoegd
- Alle scan-types draaien nu via HTML renderer (was: ReportLab voor exit/retention, niets voor culture)
- `culture_assessment` had geen `get_management_summary_payload(top_factor_labels=...)` interface → apart afgevangen
- `get_next_steps_payload` ook afgevangen voor culture_assessment
- `low_lbl` definitie vóór cover-blok gezet (was: na cover = UnboundLocalError)

### Sample PDFs geregenereerd
- `docs/examples/voorbeeldrapport_loep.pdf` — ExitScan (273.8 KB)
- `docs/examples/voorbeeldrapport_retentiescan.pdf` — RetentieScan (142.7 KB)
- `docs/examples/voorbeeldrapport_cultuurbeeld.pdf` — CultuurAssessment (135.7 KB)
- Alle drie gebouwd met de nieuwe WeasyPrint/Playwright HTML renderer

---

## 2026-06-05 — Visual polish pass (alle scan-types)

### Aanleiding
Gegenereerde PDFs waren functioneel maar nog niet op premium/boardroom-niveau qua typografie, chart-gewicht en compositie.

### Wijzigingen

| Element | Oud | Nieuw | Reden |
|---------|-----|-------|-------|
| Gauge boogdikte | 16px | 20px | Meer visueel gewicht, zichtbaarder in print |
| Gauge score getal | 30px | 36px | Dominant element moet dominant voelen |
| Gauge label | 11px | 12px | Leesbaar zonder loep |
| Bar chart hoogte | 22px | 28px | Bars verdienen volume, niet dunne lijntjes |
| Bar chart track kleur | #F1F5F9 | #EDE6DA | Past bij warm palette, minder koud |
| Bar score label | 10px | 11px bold | Direct leesbaar naast de bar |
| Cover titel | 44px | 48px | Impact bij eerste indruk |
| Cover signal value | 38px | 46px | Dit is het primaire signaal — moet schreeuwen |
| Why-block waarden | 18px | 22px | Evidence stack moet domineren |
| Why-block titel | 13px | 14px | Meer zeggingskracht |
| Stat grid KPI | 23px | 26px | Kerncijfers moeten direct opvallen |
| Play-block subtitels | 8.5px | 9px | Beter leesbaar |
| Mini bar (item detail) | 6px | 8px | Zichtbaar in PDF |
| Actiematrix dots | r=12/10 | r=14/11 | Prominenter in matrix |

### Rapporten geregenereerd
Alle drie samples opnieuw gegenereerd met de polish-wijzigingen:
- ExitScan: 273.7 KB
- RetentieScan: 134.9 KB
- CultuurAssessment: 135.6 KB

---

## 2026-06-05 — CultuurAssessment: P1/P2/P3 toegevoegd aan productierenderer

### Aanleiding
Het cultuurrapport toonde alleen domein-niveau scores — geen item-detail, geen open toelichtingen, geen appendix. Dat is minder data dan ExitScan, terwijl de vragenlijst (40 items, 10 domeinen) minstens evenveel te bieden heeft.

### Wijzigingen in `render_culture_report_html()`

**P2 — Verdieping laagste 3 domeinen**
- Importeert `DOMAIN_ITEM_IDS` en `QUESTIONNAIRE_ITEMS_BY_ID` uit `culture_assessment.scoring`
- Toont voor elk van de 3 laagste domeinen: laagste item (rood), hoogste item (neutraal grijs), alle 4 vragen met scores + bar
- Zelfde opmaak als ExitScan's "Verdieping — prioritaire factoren"
- Guard: werkt alleen als `org_item_avgs` gevuld is (CA01–CA40 scores)

**P1 — Open toelichtingen**
- Toont quote-cards als >= MIN_QUOTES_N (5) teksten beschikbaar
- Max MAX_QUOTES (5) getoond, geanonimiseerd
- Zelfde quote-card opmaak als ExitScan
- Fallback: empty-state als te weinig responses

**P3 — Appendix**
- Alle 10 domeinen × 4 items = 40 vragen als compacte tabel
- Zelfde `app-tbl` opmaak als ExitScan-appendix
- Intro: "verdieping — niet nodig voor de eerste boardread"
- Guard: werkt alleen als `org_item_avgs` en culture_assessment module beschikbaar zijn

**Methodiek tile bijgewerkt**
- "Open tekst" toelichting aangepast: geanonimiseerd en zichtbaar bij voldoende n (was: "niet als raw quotes")

### Sample PDF geregenereerd
- `docs/examples/voorbeeldrapport_cultuurbeeld.pdf` — 156.0 KB (was 135.7 KB)
- Preview: `loep-rapport-preview-cultuur.html` — 61 KB, 13 secties

---

## Onderhoud
- Wijzig dit bestand bij elke niet-triviale aanpassing aan `report_html.py`
- Noteer altijd: wat, waarom, en welke commerciële/visuele rationale
- Format: datum + sectie per functie of renderer
