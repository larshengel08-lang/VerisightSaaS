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

## 2026-06-14 — PDF-redesign "Bold & Statement" (subsysteem 3/5)

Volledige visuele herpositionering + refactor van `report_html.py` naar het Loep
design system (navy `#0D1B2A`, amber `#E8A020`, chalk `#F4F1EA`). Branch
`feature/pdf-redesign`. Plan: `docs/superpowers/plans/2026-06-13-pdf-redesign.md`.

### Nieuwe modules
- **`backend/report_fonts.py`** — embed Inter / Inter Tight / JetBrains Mono als
  base64 `@font-face` (data-URI). Werkt identiek in WeasyPrint én Chromium; geen
  pad/base_url-afhankelijkheid. Static gewichten ge-instanced uit de variable fonts.
- **`backend/report_css.py`** — `build_css(scan_type)` + design-tokens. Scherpe
  hoeken (`border-radius: 0`), Inter Tight koppen, JetBrains Mono eyebrows,
  table-gebaseerde kolommen (WeasyPrint-veilig).

### Kernkeuzes
- **Amber is het enige accent** voor alle scans (homepage-design system: "the
  single accent, use sparingly"). Producten verschillen via eyebrow-tekst, niet
  kleur. (Visuele vergelijking amber/teal/bruin → teal/bruin oogden gedempt.)
- **Gedeeld skelet + product-modules.** Eén set sectie-helpers (`_cover`,
  `_bestuurlijke_read`, `_responsbasis`, `_overzichtsprofiel`, `_factor_bar_row`,
  `_select_priority_factors`, `_eerste_managementspoor`, `_segment_status_block`,
  `_themed_quotes`, `_trust_page`) die alle drie renderers aanroepen. Product-kern
  apart: `_vertrekcontext` (exit), `_behoudscontext` (retention),
  `_checkpointoverzicht`+`_landingskwaliteit` (onboarding).
- **Macrostructuur (spec):** cover → bestuurlijke read → responsbasis →
  overzichtsprofiel → product-kern → factordiepte (≤3, data-gedreven prioriteit:
  score + vertrekreden, niet puur laagste) → Werkbeleving (SDT) → Werkgevers-
  aanbeveling (eNPS) → segment → open toelichtingen → managementspoor
  (gespreksagenda, geen "risico"/"interventie") → appendix (conditioneel) →
  methodiek (laatste).
- **Verwijderd:** "Factoranalyse" (dupliceerde overzichtsprofiel), leeswijzer,
  actiematrix/prioriteitenmatrix. **Behouden + herstijld:** SDT + eNPS.
- **Conditionele modules:** quotes ≥5 open teksten; appendix n>20 én factoren>5.
  Segment toont altijd eerlijke State A/B (nooit nep-visualisatie). Paginatelling
  data-gedreven (8–18; samples 15–16).
- **Onboarding** is `single_checkpoint`: geen nep 30/60/90 — eerlijke degraded
  weergave ("Eén meetmoment — fasevergelijking opent bij herhaalde meting").
- **Behoudscontext** toont blijf-/vertrekintentie als directe groepsscores
  (`avg_si`/`avg_to`, 1-10), niet als uit band-counts afgeleide percentages.

### Cover (`_cover`)
Donker voorblad, openingsvraag per product als h1, mono-eyebrow, amber-lijn,
concentrische ringen, onderbalk met 3 klantwaarde-stats (respondenten, respons%,
primair signaal — géén documentmetadata). WeasyPrint-fix: `.cover height: 297mm`
(definite height) zodat de absoluut-gepositioneerde onderbalk (`bottom`) onderaan
pint i.p.v. tegen de titel.

### WeasyPrint-validatie (productie-engine, via Docker)
Alle 3 renderen foutloos; paginatelling identiek aan Chromium (16/16/15); PDF's
klein (81/80/75 KB — fonts gesubset); nette doorzoekbare tekstlaag. Table-layouts
houden stand. (Lokaal rendert Windows alleen HTML; de 3,4MB HTML-intermediates
worden NIET gecommit — de PDF is het canonieke sample.)

### Tests & samples
- `tests/test_pdf_redesign.py` — 16 tests (fonts, css, cover, secties, prioriteit,
  gating). 0 nieuwe regressies t.o.v. de pré-existerende baseline (5 content-layer
  fails in `test_scoring.py`/parity, los van deze redesign).
- Samples geregenereerd via WeasyPrint: `voorbeeldrapport_loep.pdf` (exit, 81KB),
  `voorbeeldrapport_retentiescan.pdf` (80KB). `voorbeeldrapport_onboarding.pdf`
  + enkele frontend-varianten zijn gitignored (onboarding = toekomstige module).

---

## Onderhoud
- Wijzig dit bestand bij elke niet-triviale aanpassing aan `report_html.py`
- Noteer altijd: wat, waarom, en welke commerciële/visuele rationale
- Format: datum + sectie per functie of renderer
