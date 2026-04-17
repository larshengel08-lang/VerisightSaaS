# Verisight Rapport Redesign — Design Spec

> **Scope:** Visuele redesign van ExitScan- en RetentieScan-PDF-rapporten. Geen wijzigingen aan berekeningen, scoring, methodiek of productlogica. Alleen `report.py` en `report_design.py` worden aangepast.

---

## Huidige tekortkomingen

1. **Inconsistent met webmerk** — blauw-grijze ReportLab-defaults staan los van `#132033`/`#3C8D8A`-palette
2. **Cover voelt generiek** — geen visueel gewicht; titelblok drijft zonder anker
3. **Kopteksten missen hiërarchie** — H1/H2/H3 onderscheiden zich nauwelijks in gewicht
4. **Grafiekstijl divers** — gauge, radar, bars hebben elk eigen kleurschema zonder gedeelde basis
5. **Witruimte inconsistent** — marges en section-spacing zijn ad hoc
6. **Executive summary box** visueel zwaar maar informatiearm
7. **Cards inline blauw** (`#EFF6FF`, `#BFDBFE`) — buiten palette
8. **Geen duidelijke visuele scheiding** tussen "data-sectie" en "interpretatie-sectie"

---

## Gedeeld design system

### Kleur-tokens (identiek aan web)

| Token | Hex | Gebruik |
|-------|-----|---------|
| `NAVY` | `#132033` | Header-achtergrond, zware accenten |
| `TEAL` | `#3C8D8A` | Primaire actie-kleur, bullets, links |
| `TEAL_LIGHT` | `#DCEFEA` | Lichte achtergrond cards |
| `CREAM` | `#F7F5F1` | Alternerende sectie-achtergrond |
| `BORDER` | `#E5E0D6` | Lijnen, kaders |
| `TEXT_BODY` | `#4A5563` | Doorlopende tekst |
| `TEXT_MUTED` | `#9CA3AF` | Labels, meta-info |
| `WHITE` | `#FFFFFF` | Kaart-achtergrond |
| `RISK_HIGH` | `#B91C1C` | Risicoscores hoog |
| `RISK_MED` | `#C17C00` | Risicoscores midden |
| `RISK_LOW` | `#3C8D8A` | Risicoscores laag/positief |

### Typografie

Font: **IBM Plex Sans** (300 Light, 400 Regular, 500 Medium, 600 SemiBold)

| Stijl | Gewicht | Grootte | Leading | Kleur |
|-------|---------|---------|---------|-------|
| Cover-titel | 300 Light | 28 pt | 36 pt | `#F7F5F1` |
| Cover-subtitel | 400 Regular | 11 pt | 16 pt | `rgba(#F7F5F1, 0.65)` |
| H1 (sectie) | 500 Medium | 16 pt | 22 pt | `#132033` |
| H2 (subsectie) | 500 Medium | 12 pt | 17 pt | `#132033` |
| Eyebrow | 500 Medium | 7 pt, uppercase, ls 0.12em | — | `#3C8D8A` |
| Body | 400 Regular | 9.5 pt | 14.5 pt | `#4A5563` |
| Body Bold | 600 SemiBold | 9.5 pt | 14.5 pt | `#132033` |
| Label/meta | 400 Regular | 8 pt | 12 pt | `#9CA3AF` |
| Tabel-header | 500 Medium | 8 pt, uppercase, ls 0.1em | — | `#9CA3AF` |

### Pagina-layout

- **Marges:** 22 mm links/rechts, 18 mm boven, 16 mm onder
- **Content-breedte:** 166 mm (A4 210 mm − 44 mm marges)
- **Kolom-gutter:** 5 mm
- **Section-spacing:** 10 mm tussen grote secties
- **Card-padding:** 5 mm rondom

### Gedeelde componenten

| Component | Omschrijving |
|-----------|-------------|
| `PageHeader` | Navy balk met logo rechts, product-label links; hoogte 14 mm |
| `PageFooter` | Lijn + paginanummer + "Vertrouwelijk — Verisight" |
| `SectionEyebrow` | Teal uppercase label boven H1/H2 |
| `InfoCard` | Wit kader, `BORDER` rand, 5 mm padding; body + optioneel label |
| `HighlightCard` | `TEAL_LIGHT` achtergrond, teal bullet, body bold |
| `RiskBadge` | Pill met `RISK_HIGH/MED/LOW` achtergrond en tekstkleur |
| `DataTable` | Alternerende rijen `CREAM`/`WHITE`; headers in `TEXT_MUTED` |
| `MetricBand` | Brede balk met grote cijfer links, label + beschrijving rechts |
| `DividerLine` | `BORDER`-kleur, 0.5 pt, volledige content-breedte |
| `EmphasisNote` | `CREAM` achtergrond, teal linkerbalk 3 pt, italic body |
| `CoverBlock` | Navy achtergrond, wit logo, titel, meta-info, product-pill |
| `ChartFrame` | Wit kader rondom grafiek, `BORDER` rand, `Label` erboven |

---

## Paginastructuur (beide producten)

### Pagina 1 — Cover

**Layout:** Volledige navy (`#132033`) achtergrond

**Elementen:**
- Wordmark wit (svg gerenderd via ReportLab of PNG embed), gecentreerd, bovenste 30%
- Product-pill: `TEAL_LIGHT` achtergrond, teal tekst — "ExitScan Retrospectief" of "RetentieScan Momentopname"
- Hoofdtitel: `#F7F5F1`, 28 pt light, max 2 regels
- Subtitel-regel: klantnaam + periode, 11 pt, `rgba(#F7F5F1, 0.65)`
- Onderkant: dunne `rgba(#F7F5F1, 0.1)` scheidingslijn + "Vertrouwelijk" label klein links, datum rechts

**Restyling vs. nu:** Volledig nieuw — huidige cover heeft geen navy achtergrond.

---

### Pagina 2 — Executive Summary

**Layout:** Twee kolommen (100 mm + 60 mm)

**Elementen (linker kolom):**
- `SectionEyebrow` "Samenvatting"
- `H1` "Executive Summary"
- Body: 3-4 zinnen managementduiding (huidige tekst, anders opgemaakt)
- `DividerLine`
- Responsoverzicht als `MetricBand` (N respondenten, responspercentage, periode)

**Elementen (rechter kolom):**
- `HighlightCard` ×3: top-3 risicofactoren met `RiskBadge`
- `HighlightCard` ×2: top-2 sterkste factoren met teal badge

**Restyling vs. nu:** Huidige executive summary is één box; wordt gesplitst in prose + gestructureerde factorkaarten.

---

### Pagina 3 — Factoranalyse (hoofdpagina)

**Layout:** Volledige breedte + 2-koloms grid onderaan

**Elementen:**
- `SectionEyebrow` + `H1`
- Radardiagram (`ChartFrame`, 80 mm × 80 mm) linksboven
- Rechts van radar: scoretabel als `DataTable` (factor, score, benchmark, signaal)
- Onderste helft: `InfoCard` per factor (3-koloms grid, max 6 kaarten zichtbaar op pagina)

**Restyling vs. nu:** Radar blijft, tabel wordt `DataTable`-stijl, factorkaarten krijgen `RiskBadge`.

---

### Pagina 4 — Focusvragen per factor

**Layout:** Lijst van factoren met vragen

**Elementen per factor:**
- `SectionEyebrow` (factornaam)
- `H2` (scoresamenvatting in één zin)
- Vragen als `EmphasisNote` items (max 3 per factor)
- `DividerLine` tussen factoren

**Restyling vs. nu:** Stijl wordt uniforme `EmphasisNote`-blokken; inhoud ongewijzigd.

---

### Pagina 5 — Risico- en preventieanalyse

**Layout:** Twee kolommen

**Elementen (links):**
- Risico-gauge (`ChartFrame`) — kleurschema wordt `RISK_HIGH/MED/LOW`
- `MetricBand` met samengestelde risicoscore

**Elementen (rechts):**
- Preventability-grafiek (`ChartFrame`) — bars in `TEAL` gradient
- `InfoCard` met interpretatie-notitie

**Restyling vs. nu:** Gauge en preventability-chart krijgen nieuw kleurschema.

---

### Pagina 6 — Gespreksagenda / Wat nu?

**Layout:** Sequentieel lijst

**Elementen:**
- `SectionEyebrow` + `H1` "Wat nu?"
- Top-2 risicofactoren als `HighlightCard` met actiepunten
- Genummerde stappen als `MetricBand`-variant (nummer groot links, tekst rechts)
- Afsluitende `EmphasisNote` over rapport-lezing en grenzen

**Restyling vs. nu:** Vervangt huidige aanbevelingenpagina volledig (al besloten in beslissingslog).

---

### Pagina 7 — Methodiek & Verantwoording

**Layout:** Doorlopende tekst met kaders

**Elementen:**
- `SectionEyebrow` + `H1`
- Body-tekst in twee kolommen
- `InfoCard` per methodische notitie (steekproefgrootte, claimsgrenzen, anonimisering)
- `DataTable` met vragenlijst-onderdelen + meting

**Restyling vs. nu:** Huidige methode-pagina is onopgemaakte tekst; wordt gestructureerd met `InfoCard` en `DataTable`.

---

## Gedeeld vs. productspecifiek

| Element | ExitScan | RetentieScan | Gedeeld |
|---------|----------|--------------|---------|
| Cover product-pill tekst | "ExitScan Retrospectief" / "ExitScan Live" | "RetentieScan Momentopname" / "RetentieScan Live" | `CoverBlock` component |
| Factorset (radar/tabel) | Uitstroom-factoren | Retentie-factoren | `ChartFrame` + `DataTable` |
| Risico-gauge | Uitstroomrisico | Retentierisico | Zelfde gauge, andere label |
| Focusvragen | Per uitstroomfactor | Per retentiefactor | `EmphasisNote` component |
| Executive summary prose | Uitstroomduiding | Retentieduiding | `H1` + body stijl |
| Methodiek-tabel | ExitScan vragen | RetentieScan vragen | `DataTable` |

---

## Restyling vs. hercompositie overzicht

| Pagina | Wat er verandert |
|--------|-----------------|
| Cover | **Hercompositie** — volledig nieuwe layout met navy achtergrond |
| Executive Summary | **Hercompositie** — prose + factorkaarten ipv één box |
| Factoranalyse | **Restyling** — radar blijft, tabel en cards krijgen nieuwe stijl |
| Focusvragen | **Restyling** — `EmphasisNote` stijl, inhoud ongewijzigd |
| Risico/preventie | **Restyling** — grafiekkleur update |
| Wat nu? | **Restyling** — nieuwe opmaak bestaande content |
| Methodiek | **Restyling** — structurering bestaande tekst |

---

## Aandachtspunten / risico's

1. **IBM Plex Sans in ReportLab** — TTF-bestanden moeten correct geregistreerd zijn voor alle gewichten; controleer `FONT_FILES` dict en `registerFont()` calls
2. **SVG-logo** — ReportLab ondersteunt geen SVG natively; logo als PNG (2× resolutie) embedden
3. **Kleurruimte** — ReportLab gebruikt RGB; zorg dat alle hex-tokens omgezet zijn via `HexColor()`
4. **`_append_report_cards` blauw** — hardcoded `#EFF6FF` en `#BFDBFE` moeten vervangen worden door `TEAL_LIGHT` en `BORDER`
5. **Bestaande grafiek-functies** — `_risk_gauge_image`, `_radar_image` etc. gebruiken Matplotlib; kleurupdates vereisen aanpassingen in die functies zonder de berekeningen te raken
6. **Paginalengte-variatie** — sommige rapporten hebben weinig respondenten; lege secties moeten graceful degraden (geen lege `InfoCard` rijen)
7. **Testrapport** — `generate_voorbeeldrapport.py` gebruiken om visuele output te valideren na elke stap; niet blind committen

---

## Developer build brief

**Geschatte tijdsinvestering:** ~18–24 uur

**Stappen:**

1. **Tokens centraliseren** — `TOKENS` dict in `report_design.py` uitbreiden met alle nieuwe tokens; `MPL_TOKENS` synchroniseren
2. **Typografie** — `build_report_styles()` bijwerken: alle stijlen conform tabel hierboven
3. **Gedeelde componenten** — 12 helper-functies implementeren (zie componentenlijst); bestaande `_append_*` functies refactoren om ze te gebruiken
4. **Cover hercompositie** — `make_page_callbacks()` cover-sectie volledig vervangen
5. **Executive summary hercompositie** — twee-kolomslayout met factorkaarten
6. **Grafieken restylen** — `_risk_gauge_image`, `_radar_image`, `_factor_bar_image`, `_preventability_image` kleurschema's updaten
7. **Factoranalyse pagina** — `DataTable` + `ChartFrame` wrapping
8. **Focusvragen pagina** — `EmphasisNote` stijl
9. **Wat nu? pagina** — `HighlightCard` + genummerde stappen
10. **Methodiek pagina** — `InfoCard` + `DataTable` structurering
11. **Testrapport genereren** — `generate_voorbeeldrapport.py` uitvoeren, visueel reviewen
12. **Hardcoded blauw verwijderen** — zoeken op `#EFF6FF`, `#BFDBFE`, verwijderen

**Files die worden aangepast:**
- `backend/report_design.py` — tokens, stijlen, componenten
- `backend/report.py` — pagina-compositie, grafiek-functies

**Files die NIET worden aangepast:**
- `backend/scoring.py`
- `backend/survey_logic.py`
- Supabase schema / migrations
- Frontend
