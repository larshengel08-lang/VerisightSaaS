# PDF Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Herontwerp de WeasyPrint-rapportrenderer (`backend/report_html.py`) naar de "Bold & Statement"-richting — navy/amber/chalk, Inter-typografie, scherpe hoeken, gedeeld skelet + product-specifieke modules — met de gerenderde PDF als enige bron van waarheid (cover-first, in-pipeline).

**Architecture:** Eén gedeelde visuele template (CSS-tokens + @font-face geëmbed als base64) en gedeelde sectie-builders die alle drie producten (ExitScan/RetentieScan/Onboarding) aanroepen. De analytische kern verschilt per product via aparte module-functies. Het CSS-blok wordt naar een eigen module `backend/report_css.py` gehaald; de drie renderers blijven in `report_html.py` maar delen voortaan dezelfde sectie-helpers i.p.v. gedupliceerde inline HTML.

**Tech Stack:** Python, WeasyPrint (productie/Railway) met Playwright+Chromium fallback (lokaal/Windows), Jinja-vrije f-string HTML, inline SVG, pytest + pypdf.

---

## ⚠️ Twee renderengines — lees dit eerst

Lokaal op Windows rendert `generate_voorbeeldrapport.py` via **Playwright/Chromium** (WeasyPrint heeft GTK/Pango dat op Windows ontbreekt). Productie op Railway rendert via **WeasyPrint**. Chromium is mild, WeasyPrint streng. Een PDF die lokaal mooi is, kan in productie breken op exact de constraints uit de spec (geen subgrid, flexbox-`gap`, externe SVG, donkere cover).

**Gevolg voor dit plan:**
- Visuele iteratie gebeurt lokaal via Playwright (snel, zie je direct).
- **Elke fase eindigt met een WeasyPrint-validatie** (Task 14) vóór "klaar". Geen enkele taak is af op alleen de Chromium-render.
- Alle CSS blijft binnen de WeasyPrint-subset: `display:table` i.p.v. flex/grid voor kolommen, inline SVG, geen `gap` op flex, base64-fonts.

Dit is exact de val uit `docs/active/REPORT_HTML_REDESIGN_LOG.md` (2026-06-05): "Alle verbetering zat alleen in de demo's, niet in wat de 'Genereer PDF'-knop levert." Niet herhalen.

---

## Design-tokens (bron: `Loep_homepage_v3/_ds/.../colors_and_type.css`)

Deze waarden zijn leidend (de spec noemde `#1a1a2e`/`#b8873a` bij benadering — het design system wint).

| Token | Waarde | Gebruik |
|-------|--------|---------|
| navy | `#0D1B2A` | cover-achtergrond, ink, header-balk |
| graphite | `#1E2D3D` | tweede donkere vlak, why-block |
| steel | `#4A6070` | muted tekst |
| amber | `#E8A020` | **ExitScan-accent** + huisaccent |
| amber-lo | `#B07A10` | amber op lichte achtergrond (leesbaar) |
| chalk | `#F4F1EA` | paginarand/achtergrond, warm off-white |
| white | `#FFFFFF` | kaartvlak |
| navy-12 | `rgba(13,27,42,0.12)` | hairline borders op licht |

**Per-scan accent** (spec §Kleurcodering — voorlopige hex voor teal/bruin, bevestigen tijdens cover-render in Task 3):

| Scan | accent | accent-lo (op licht) |
|------|--------|----------------------|
| exit | `#E8A020` (amber) | `#B07A10` |
| retention | `#3C8D8A` (teal) | `#2F6F6C` |
| onboarding | `#9A6B3F` (bruin) | `#7A5430` |

**Fonts:** Inter Tight (display/koppen, 600/700/800), Inter (body, 400/500/600/700), JetBrains Mono (eyebrows/labels, 400/500). **Scherpe hoeken: `border-radius: 0` overal** (huidige rapport gebruikt 6–8px — die gaan eruit). Eyebrows = mono, uppercase, `letter-spacing: 0.16–0.20em`.

**Kritiek:** het huidige `_CSS` gebruikt `font-family: Arial` — er is dus nú geen merkfont in de PDF. Inter/Inter Tight/JetBrains Mono moeten als `@font-face` worden ingebed.

---

## File Structure

| Bestand | Verantwoordelijkheid | Actie |
|---------|----------------------|-------|
| `backend/assets/fonts/` | Lokale .ttf font-bestanden | Inter, Inter Tight, JetBrains Mono toevoegen |
| `backend/report_fonts.py` | Leest .ttf → base64 `@font-face` CSS-string | **Nieuw** |
| `backend/report_css.py` | Design-tokens + volledig `_CSS`-blok (nieuwe stijl) | **Nieuw** (verplaatst uit report_html.py) |
| `backend/report_html.py` | Data-builder, gedeelde sectie-builders, 3 product-renderers, dispatcher | **Zwaar gewijzigd** |
| `tests/test_pdf_redesign.py` | Structuur/logica-tests voor nieuwe secties + modules | **Nieuw** |
| `generate_voorbeeldrapport.py` | Lokale sample-render (visuele verificatie) | Ongewijzigd; gebruikt als render-loop |

`src/reporting/*` (TypeScript) is een ander, frontend-systeem en blijft **buiten scope**.

---

## Fasering & MVP-labels

- **Fase 0 — Fundament** (Task 1–3): fonts, tokens/CSS, **cover-first slice**. → MVP, blokkeert alles.
- **Fase 1 — Gedeelde secties** (Task 4–6): bestuurlijke read, responsbasis, overzichtsprofiel. → MVP.
- **Fase 2 — ExitScan-kern** (Task 7–9): vertrekcontext, factordiepte, staartmodules. → MVP (live product).
- **Fase 3 — Retention + Onboarding** (Task 10–12): unieke kernsecties op hetzelfde skelet. → v2 (per spec wel in scope, maar na ExitScan).
- **Fase 4 — Integratie & validatie** (Task 13–15): dispatcher, WeasyPrint-validatie, samples + log. → MVP-afsluiting.

Elke taak commit los. Volgorde respecteren: Fase 0 eerst (cover bewijst de visuele taal), dan de rest erft die taal.

---

## Task 1: Fonts vendoren + base64 @font-face helper

**Files:**
- Create: `backend/assets/fonts/Inter-Regular.ttf`, `Inter-Medium.ttf`, `Inter-SemiBold.ttf`, `Inter-Bold.ttf`, `InterTight-SemiBold.ttf`, `InterTight-Bold.ttf`, `InterTight-ExtraBold.ttf`, `JetBrainsMono-Regular.ttf`, `JetBrainsMono-Medium.ttf`
- Create: `backend/report_fonts.py`
- Test: `tests/test_pdf_redesign.py`

**Waarom base64-embed i.p.v. `url()`-paden:** WeasyPrint en Chromium resolven `url()` verschillend t.o.v. de `base_url`. Base64 data-URI's in de `@font-face src` renderen identiek in beide engines, zonder pad-afhankelijkheid. Dit elimineert de #1 oorzaak van "font werkt lokaal maar niet in productie".

- [ ] **Step 1: Download de statische TTF's naar `backend/assets/fonts/`**

Bronnen (statische .ttf, geen variable fonts):
- Inter & Inter Tight: https://github.com/rsms/inter/releases (map `Inter Desktop/` → `Inter-Regular.ttf` etc.; Inter Tight zit in dezelfde release onder `Inter Tight/`)
- JetBrains Mono: https://github.com/JetBrains/JetBrainsMono/releases (`fonts/ttf/`)

Benodigde gewichten exact zoals de filenamen hierboven. Leg ze in `backend/assets/fonts/`.

Verifieer:
```bash
ls backend/assets/fonts/ | grep -E "Inter|JetBrains"
```
Verwacht: de 9 bestanden hierboven aanwezig.

- [ ] **Step 2: Schrijf de failing test**

```python
# tests/test_pdf_redesign.py
from __future__ import annotations

from backend.report_fonts import font_face_css, FONT_SPECS


def test_font_face_css_embeds_all_families_as_base64():
    css = font_face_css()
    # Elke gedeclareerde font is aanwezig als @font-face met data-uri
    for spec in FONT_SPECS:
        assert f"font-family: '{spec.family}'" in css
    assert "src: url(data:font/ttf;base64," in css
    # Geen verwijzing naar externe CDN of lokaal pad
    assert "fonts.googleapis.com" not in css
    assert ".ttf)" not in css  # geen rauwe padverwijzingen
```

- [ ] **Step 3: Run test om falen te bevestigen**

Run: `.venv/Scripts/python.exe -m pytest tests/test_pdf_redesign.py::test_font_face_css_embeds_all_families_as_base64 -v`
Expected: FAIL met `ModuleNotFoundError: backend.report_fonts`

- [ ] **Step 4: Implementeer `backend/report_fonts.py`**

```python
from __future__ import annotations

import base64
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

FONT_DIR = Path(__file__).resolve().parent / "assets" / "fonts"


@dataclass(frozen=True)
class FontSpec:
    family: str       # CSS font-family naam
    file: str         # bestandsnaam in FONT_DIR
    weight: int       # font-weight
    style: str = "normal"


FONT_SPECS: list[FontSpec] = [
    FontSpec("Inter", "Inter-Regular.ttf", 400),
    FontSpec("Inter", "Inter-Medium.ttf", 500),
    FontSpec("Inter", "Inter-SemiBold.ttf", 600),
    FontSpec("Inter", "Inter-Bold.ttf", 700),
    FontSpec("Inter Tight", "InterTight-SemiBold.ttf", 600),
    FontSpec("Inter Tight", "InterTight-Bold.ttf", 700),
    FontSpec("Inter Tight", "InterTight-ExtraBold.ttf", 800),
    FontSpec("JetBrains Mono", "JetBrainsMono-Regular.ttf", 400),
    FontSpec("JetBrains Mono", "JetBrainsMono-Medium.ttf", 500),
]


@lru_cache(maxsize=1)
def font_face_css() -> str:
    blocks: list[str] = []
    for spec in FONT_SPECS:
        path = FONT_DIR / spec.file
        if not path.exists():
            raise FileNotFoundError(f"Missing report font: {path}")
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        blocks.append(
            "@font-face{"
            f"font-family: '{spec.family}';"
            f"font-weight: {spec.weight};"
            f"font-style: {spec.style};"
            f"src: url(data:font/ttf;base64,{b64}) format('truetype');"
            "}"
        )
    return "\n".join(blocks)
```

- [ ] **Step 5: Run test om te bevestigen dat 'ie slaagt**

Run: `.venv/Scripts/python.exe -m pytest tests/test_pdf_redesign.py::test_font_face_css_embeds_all_families_as_base64 -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/assets/fonts backend/report_fonts.py tests/test_pdf_redesign.py
git commit -m "feat(report): vendor Inter/Inter Tight/JetBrains Mono as base64 @font-face"
```

---

## Task 2: Design-token CSS-laag (`report_css.py`)

**Files:**
- Create: `backend/report_css.py`
- Modify: `backend/report_html.py` (verwijder oud `_CSS` blok regels 326–516; importeer uit `report_css`)
- Test: `tests/test_pdf_redesign.py`

**Doel:** Het volledige stijlblok vervangen door de nieuwe taal: navy/amber/chalk, scherpe hoeken, Inter/mono, per-scan accent via CSS-variabele. Tabel-gebaseerde kolommen behouden (WeasyPrint-veilig).

- [ ] **Step 1: Schrijf de failing test**

```python
# tests/test_pdf_redesign.py  (toevoegen)
from backend.report_css import build_css, ACCENTS


def test_build_css_injects_scan_accent_and_sharp_corners():
    css = build_css("exit")
    assert "#E8A020" in css                      # amber accent voor exit
    assert "border-radius: 0" in css             # scherpe hoeken
    assert "'Inter Tight'" in css                # display font
    assert "@font-face" in css                   # fonts ingebed
    # retention krijgt teal als accent
    assert "#3C8D8A" in build_css("retention")


def test_accents_defined_for_all_products():
    for st in ("exit", "retention", "onboarding"):
        assert st in ACCENTS
        assert ACCENTS[st]["accent"].startswith("#")
        assert ACCENTS[st]["accent_lo"].startswith("#")
```

- [ ] **Step 2: Run om falen te bevestigen**

Run: `.venv/Scripts/python.exe -m pytest tests/test_pdf_redesign.py -k css -v`
Expected: FAIL met `ModuleNotFoundError: backend.report_css`

- [ ] **Step 3: Implementeer `backend/report_css.py`**

```python
from __future__ import annotations

from backend.report_fonts import font_face_css

# Per-scan accent. teal/bruin zijn voorlopig — bevestig visueel in Task 3.
ACCENTS: dict[str, dict[str, str]] = {
    "exit":       {"accent": "#E8A020", "accent_lo": "#B07A10"},
    "retention":  {"accent": "#3C8D8A", "accent_lo": "#2F6F6C"},
    "onboarding": {"accent": "#9A6B3F", "accent_lo": "#7A5430"},
    "culture_assessment": {"accent": "#E8A020", "accent_lo": "#B07A10"},
}

# Gedeelde merkkleuren (design system)
NAVY     = "#0D1B2A"
GRAPHITE = "#1E2D3D"
STEEL    = "#4A6070"
CHALK    = "#F4F1EA"
INK      = "#0D1B2A"
HAIRLINE = "rgba(13,27,42,0.12)"

# RAG-band (drempelkleuren overzichtsprofiel) — warm afgestemd
RAG_HIGH = "#C0392B"   # rood  (laag = risico)
RAG_MID  = "#C17C00"   # oranje
RAG_LOW  = "#3C8D8A"   # teal-groen (relatief sterk)


def build_css(scan_type: str = "exit") -> str:
    acc = ACCENTS.get(scan_type, ACCENTS["exit"])
    accent = acc["accent"]
    accent_lo = acc["accent_lo"]
    return font_face_css() + r"""
@page {
  size: A4;
  margin: 18mm 16mm 20mm 16mm;
  @bottom-left {
    content: "VERTROUWELIJK — LOEP — GROEPSOUTPUT";
    font-family: 'JetBrains Mono', monospace;
    font-size: 7px; letter-spacing: 0.12em; color: """ + STEEL + r""";
  }
  @bottom-right {
    content: counter(page) " / " counter(pages);
    font-family: 'JetBrains Mono', monospace;
    font-size: 7px; letter-spacing: 0.12em; color: """ + STEEL + r""";
  }
}
@page cover-page { margin: 0; }

* { box-sizing: border-box; margin: 0; padding: 0; border-radius: 0; }

:root { --accent: """ + accent + r"""; --accent-lo: """ + accent_lo + r"""; }

body {
  font-family: 'Inter', Arial, sans-serif;
  font-size: 11px; line-height: 1.6; color: #243247;
  background: """ + CHALK + r""";
}

.pb       { break-before: page; }
.no-break { break-inside: avoid; }

/* ── Eyebrow (mono) ── */
.eyebrow {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 500;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-lo);
}
.eyebrow.on-dark { color: var(--accent); }

/* ── Section label ── */
.slabel {
  display: flex; align-items: center; gap: 12px;
  font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 500;
  letter-spacing: 0.16em; text-transform: uppercase; color: """ + STEEL + r""";
  margin-bottom: 18px;
}
.slabel::after { content: ""; flex: 1; height: 1px; background: """ + HAIRLINE + r"""; }

/* ── Headings ── */
h2 { font-family: 'Inter Tight', sans-serif; font-weight: 800;
     letter-spacing: -0.03em; font-size: 22px; color: """ + INK + r"""; line-height: 1.05; }
h3 { font-family: 'Inter Tight', sans-serif; font-weight: 700;
     font-size: 14px; color: """ + INK + r"""; margin-bottom: 5px; }
p  { margin-bottom: 6px; font-size: 11px; }

/* ── Cover ── */
.cover { page: cover-page; background: """ + NAVY + r"""; min-height: 297mm;
  padding: 64px 56px 48px; position: relative; color: #fff; }
.cover-rings { position: absolute; top: -120px; right: -120px; width: 420px; height: 420px;
  border: 1px solid rgba(232,160,32,0.10); border-radius: 9999px; }
.cover-rings::before { content: ""; position: absolute; inset: 60px;
  border: 1px solid rgba(232,160,32,0.07); border-radius: 9999px; }
.cover-rings::after { content: ""; position: absolute; inset: 130px;
  border: 1px solid rgba(232,160,32,0.05); border-radius: 9999px; }
.cover-top { display: flex; justify-content: space-between; align-items: baseline; }
.cwm { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 17px;
  letter-spacing: -0.02em; color: #fff; }
.cwm .dot { color: var(--accent); }
.cconf { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.16em;
  text-transform: uppercase; color: rgba(255,255,255,0.55); }
.ceyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.20em;
  text-transform: uppercase; color: var(--accent); margin-top: 150px; }
.cbar { width: 56px; height: 3px; background: var(--accent); margin: 22px 0 26px; }
.ctitle { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 46px;
  letter-spacing: -0.04em; line-height: 0.98; color: #fff; max-width: 16ch; }
.csub { font-family: 'Inter', sans-serif; font-size: 13px; color: rgba(255,255,255,0.62);
  margin-top: 22px; }
.cmeta { position: absolute; left: 56px; right: 56px; bottom: 56px;
  display: table; width: auto; border-top: 1px solid rgba(255,255,255,0.14); padding-top: 22px; }
.cmc { display: table-cell; width: 33%; padding-right: 18px; }
.cml { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 4px; }
.cmv { font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 22px; color: #fff; }

/* ── Cards (scherp, geen radius) ── */
.card { background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 18px 20px; margin-bottom: 14px; }
.card.accent { border-left: 3px solid var(--accent); }
.card.risk   { border-left: 3px solid """ + RAG_HIGH + r"""; }
.card.strong { border-left: 3px solid """ + RAG_LOW + r"""; }
.card.navy   { border-left: 3px solid """ + NAVY + r"""; }

/* ── Dark anchor block (why / bestuurlijke read) ── */
.why { background: """ + GRAPHITE + r"""; color: #fff; padding: 22px 24px; margin-bottom: 16px; }
.why-title { font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 14px;
  color: #fff; margin-bottom: 16px; line-height: 1.4; }
.why-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 10px 0; margin-bottom: 14px; }
.why-cell { display: table-cell; vertical-align: top; width: 25%;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 12px 13px; }
.why-l { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.12em;
  text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
.why-v { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 22px; line-height: 1.05; }
.why-b { font-size: 9px; color: rgba(255,255,255,0.6); line-height: 1.4; margin-top: 2px; }
.why-quote { font-size: 10px; color: rgba(255,255,255,0.75); font-style: italic; line-height: 1.55;
  border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; }

/* ── Stat grid (table-based) ── */
.sg { display: table; width: 100%; border-collapse: separate; border-spacing: 10px 0; margin-bottom: 14px; }
.sg td { display: table-cell; background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 13px 15px; vertical-align: top; width: 25%; }
.sc-l { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.1em;
  text-transform: uppercase; color: """ + STEEL + r"""; margin-bottom: 4px; }
.sc-v { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 24px; color: """ + INK + r"""; line-height: 1.1; }
.sc-b { font-size: 9px; color: """ + STEEL + r"""; margin-top: 2px; line-height: 1.4; }

/* ── Factor bars (overzichtsprofiel) ── */
.fbar-row { display: table; width: 100%; margin-bottom: 9px; }
.fbar-name { display: table-cell; width: 34%; font-size: 11px; font-weight: 600; color: """ + INK + r"""; vertical-align: middle; padding-right: 10px; }
.fbar-track { display: table-cell; width: 52%; vertical-align: middle; }
.fbar-score { display: table-cell; width: 14%; text-align: right; vertical-align: middle;
  font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 13px; color: """ + INK + r"""; }

/* ── Item table ── */
.item-tbl { width: 100%; border-collapse: collapse; }
.item-tbl td { padding: 7px 8px; vertical-align: middle; font-size: 10px; color: #374151;
  border-bottom: 1px solid """ + HAIRLINE + r"""; }
.item-tbl .iq { width: 56%; }
.item-tbl .is { width: 10%; font-weight: 700; text-align: right; }

/* ── Quote / theme ── */
.theme-card { background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 14px 16px; margin-bottom: 10px; }
.theme-badge { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent-lo); }
.quote-txt { font-size: 11px; color: #374151; font-style: italic; line-height: 1.6;
  margin-top: 8px; padding-left: 12px; border-left: 2px solid var(--accent); }
.quote-anon { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.1em;
  text-transform: uppercase; color: #94A3B8; margin-top: 5px; }

/* ── Steps / managementspoor ── */
.steps { display: table; width: 100%; border-collapse: separate; border-spacing: 10px 0; }
.step { display: table-cell; background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 14px 16px; vertical-align: top; width: 25%; }
.step-no { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--accent-lo); margin-bottom: 4px; }
.step-body { font-size: 10px; color: #374151; line-height: 1.55; }

/* ── Trust / methodiek ── */
.tg { display: table; width: 100%; border-collapse: separate; border-spacing: 10px 0; }
.tc { display: table-cell; background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 14px 15px; vertical-align: top; width: 33%; }
.tt { font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 11px; color: """ + INK + r"""; margin-bottom: 4px; }
.tb { font-size: 9px; color: #374151; line-height: 1.55; }

/* ── Two-col / appendix / misc ── */
.tcol { display: table; width: 100%; border-collapse: separate; border-spacing: 14px 0; }
.tc-l { display: table-cell; vertical-align: top; width: 55%; }
.tc-r { display: table-cell; vertical-align: top; width: 45%; }
.app-tbl { width: 100%; border-collapse: collapse; font-size: 9px; }
.app-tbl th { background: #EFE9DD; color: """ + STEEL + r"""; font-weight: 700; padding: 5px 8px;
  text-align: left; border-bottom: 1px solid """ + HAIRLINE + r"""; }
.app-tbl td { padding: 4px 8px; border-bottom: 1px solid """ + HAIRLINE + r"""; }
.sec { margin-bottom: 30px; }
.empty-state { background: #fff; border: 1px dashed """ + HAIRLINE + r"""; padding: 18px;
  text-align: center; color: #94A3B8; font-size: 10px; }
.trustline { font-size: 9.5px; color: """ + STEEL + r"""; font-style: italic; margin-top: 8px; }
"""
```

- [ ] **Step 4: Vervang in `report_html.py` het oude `_CSS` + `_doc`**

Verwijder het hele `_CSS = r"""..."""` blok (regels 326–516). Bovenaan `report_html.py` toevoegen:
```python
from backend.report_css import build_css
```
Pas `_doc` aan zodat het scan-specifieke CSS injecteert:
```python
def _doc(title: str, body: str, scan_type: str = "exit") -> str:
    return (f'<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8">'
            f'<title>{_h(title)}</title><style>{build_css(scan_type)}</style></head>'
            f'<body>{body}</body></html>')
```
Zoek alle aanroepen van `_doc(...)` in de drie renderers en geef `scan_type` mee (exit/retention/onboarding).

- [ ] **Step 5: Run de css-tests**

Run: `.venv/Scripts/python.exe -m pytest tests/test_pdf_redesign.py -k "css or accent" -v`
Expected: PASS (beide tests)

- [ ] **Step 6: Commit**

```bash
git add backend/report_css.py backend/report_html.py tests/test_pdf_redesign.py
git commit -m "feat(report): nieuwe design-token CSS-laag (navy/amber/chalk, sharp, Inter)"
```

---

## Task 3: Cover-first slice — nieuwe `_cover` + eerste echte PDF

**Files:**
- Modify: `backend/report_html.py` (`_cover`, regels 529–543)
- Test: `tests/test_pdf_redesign.py`

**Dit is de scharniertaak.** Hier wordt de visuele taal bewezen op een gerenderde PDF. Pas door tot 'ie premium voelt vóór je verder bouwt.

Cover-elementen (spec §01): Loep-wordmark linksboven, "VERTROUWELIJK" rechtsboven, scantype-eyebrow in accent, **grote openingsvraag** als h1, amber scheidingslijn, concentrische ringen rechtsboven, onderbalk met 3 **klantwaarde**-stats (respondenten, responspercentage, primair signaal — NIET paginatelling/datum/"gemiddelde score").

Openingsvraag per product (spec §64): exit = "Wat speelde mee bij vertrek?", retention = "Waar staat behoud nu onder druk?", onboarding = "Hoe landen uw nieuwe medewerkers?".

- [ ] **Step 1: Schrijf de failing test**

```python
# tests/test_pdf_redesign.py  (toevoegen)
from backend.report_html import _cover


def test_cover_shows_opening_question_and_value_stats_not_metadata():
    html = _cover(
        scan_label="ExitScan", scan_type="exit", org_name="Acme BV",
        period="Q2 2026", opening_question="Wat speelde mee bij vertrek?",
        stats=[("Respondenten", "34"), ("Respons", "76%"), ("Primair signaal", "Groeiperspectief")],
    )
    assert "Wat speelde mee bij vertrek?" in html
    assert "Groeiperspectief" in html
    assert "ExitScan" in html
    assert "VERTROUWELIJK" in html
    # geen documentmetadata op de cover
    assert "Pagina" not in html
    assert "Gemiddelde score" not in html
```

- [ ] **Step 2: Run om falen te bevestigen**

Run: `.venv/Scripts/python.exe -m pytest tests/test_pdf_redesign.py -k cover -v`
Expected: FAIL (oude `_cover` heeft andere signatuur)

- [ ] **Step 3: Herschrijf `_cover`**

```python
def _cover(*, scan_label: str, scan_type: str, org_name: str, period: str,
           opening_question: str, stats: list[tuple[str, str]]) -> str:
    cells = "".join(
        f'<div class="cmc"><div class="cml">{_h(label)}</div><div class="cmv">{_h(value)}</div></div>'
        for label, value in stats[:3]
    )
    return f"""<div class="cover">
  <div class="cover-rings"></div>
  <div class="cover-top">
    <div class="cwm">Loep<span class="dot">.</span></div>
    <div class="cconf">Vertrouwelijk</div>
  </div>
  <div class="ceyebrow">{_h(scan_label)}</div>
  <div class="cbar"></div>
  <h1 class="ctitle">{_h(opening_question)}</h1>
  <div class="csub">{_h(org_name)} &nbsp;&middot;&nbsp; {_h(period)} &nbsp;&middot;&nbsp; Managementrapport</div>
  <div class="cmeta">{cells}</div>
</div>"""
```

- [ ] **Step 4: Werk de aanroep in `render_exit_report_html` bij**

Vervang het oude `_cover(...)` blok (rond regel 987). Bouw de stats uit echte data:
```python
opening_q = "Wat speelde mee bij vertrek?"
primary_signal = high_lbl or low_lbl or "—"   # relatief sterk signaal als titel-stat
cover_stats = [
    ("Respondenten", str(n)),
    ("Respons", f"{data['completion_pct']}%"),
    ("Primair signaal", primary_signal),
]
s = _cover(scan_label=data["scan_lbl"], scan_type="exit", org_name=data["org_name"],
           period=data["campaign_name"], opening_question=opening_q, stats=cover_stats)
```

- [ ] **Step 5: Run de cover-test**

Run: `.venv/Scripts/python.exe -m pytest tests/test_pdf_redesign.py -k cover -v`
Expected: PASS

- [ ] **Step 6: Render een ECHTE PDF en bekijk 'm**

```bash
.venv/Scripts/python.exe generate_voorbeeldrapport.py exit
```
Open `docs/examples/voorbeeldrapport_loep.pdf`, pagina 1.

**Visuele checklist (cover-first gate):**
- [ ] Inter Tight koppen renderen (geen Arial-fallback)
- [ ] Amber `#E8A020` accent zichtbaar; navy `#0D1B2A` achtergrond diep genoeg
- [ ] Openingsvraag domineert; concentrische ringen subtiel, niet luid
- [ ] 3 klantwaarde-stats onderaan, scherpe hoeken (geen afronding)
- [ ] Bevestig teal/bruin niet nodig hier; bevestig wel of amber-tint op navy goed leest

Itereer op `_cover` + de cover-CSS in `report_css.py` tot premium. Pas hier ook de voorlopige teal/bruin-waarden aan als je ze al wil zien (`generate_voorbeeldrapport.py retention` / `onboarding`).

- [ ] **Step 7: Commit**

```bash
git add backend/report_html.py backend/report_css.py tests/test_pdf_redesign.py
git commit -m "feat(report): cover-first redesign — openingsvraag + klantwaarde-stats"
```

---

## Task 4: Gedeelde sectie — Bestuurlijke read (02)

**Files:**
- Modify: `backend/report_html.py` (nieuwe helper `_bestuurlijke_read`; vervangt de losse "Samenvatting" + "Wat valt op?" blokken in de exit-renderer)
- Test: `tests/test_pdf_redesign.py`

Spec §02: één pagina, geïntegreerde "wat valt op". Bevat: kernzin, totaalbeeld (max 3 zinnen), primaire factor + waarom (compact bewijsblok, donker), relatief sterke factor, responsbasis-verwijzing, eerste managementvraag. De "Wat valt op?"-pagina verdwijnt als aparte sectie.

- [ ] **Step 1: Schrijf de failing test**

```python
# tests/test_pdf_redesign.py (toevoegen)
from backend.report_html import _bestuurlijke_read


def test_bestuurlijke_read_contains_core_blocks():
    html = _bestuurlijke_read(
        kernzin="Het vertrekbeeld is gemengd; groeiperspectief springt eruit.",
        totaalbeeld="Drie factoren scoren laag. Eén factor is relatief sterk.",
        primary_label="Groeiperspectief", primary_score=4.2, primary_color="#C0392B",
        why_cells_html="<div class='why-cell'><div class='why-l'>Score</div><div class='why-v'>4.2</div></div>",
        strong_label="Werksfeer", strong_score=7.1,
        mgmt_q="Welke loopbaanstappen ontbreken voor deze groep?",
    )
    assert "Groeiperspectief" in html
    assert "class=\"why\"" in html            # donker bewijsblok aanwezig
    assert "Werksfeer" in html
    assert "Welke loopbaanstappen" in html
    assert "p.03" in html or "responsbasis" in html.lower()
```

- [ ] **Step 2: Run om falen te bevestigen**

Run: `.venv/Scripts/python.exe -m pytest tests/test_pdf_redesign.py -k bestuurlijke -v`
Expected: FAIL (functie bestaat niet)

- [ ] **Step 3: Implementeer `_bestuurlijke_read`**

```python
def _bestuurlijke_read(*, kernzin: str, totaalbeeld: str,
                       primary_label: str, primary_score: float | None, primary_color: str,
                       why_cells_html: str, strong_label: str, strong_score: float | None,
                       mgmt_q: str) -> str:
    return f"""<div class="pb sec">
  <span class="slabel">Bestuurlijke read</span>
  <h2 style="margin-bottom:14px;">{_h(kernzin)}</h2>
  <p style="font-size:11.5px;color:#374151;max-width:62ch;margin-bottom:18px;">{_h(totaalbeeld)}</p>
  <div class="why">
    <div class="why-title">Waarom {_h(primary_label)} bovenaan staat</div>
    <table class="why-grid"><tr>{why_cells_html}</tr></table>
  </div>
  <table class="sg"><tr>
    <td><div class="sc-l">Primaire factor</div><div class="sc-v" style="color:{primary_color};">{_score_str(primary_score)}</div><div class="sc-b">{_h(primary_label)}</div></td>
    <td><div class="sc-l">Relatief sterk</div><div class="sc-v">{_score_str(strong_score)}</div><div class="sc-b">{_h(strong_label)} — wat wél werkt</div></td>
    <td><div class="sc-l">Responsbasis</div><div class="sc-v">Zie p.03</div><div class="sc-b">reikwijdte &amp; betrouwbaarheid</div></td>
  </tr></table>
  <div class="card accent"><h3>Eerste managementvraag</h3><p style="margin-bottom:0;">{_h(mgmt_q)}</p></div>
</div>"""
```

- [ ] **Step 4: Bouw de oude exit-blokken om naar deze helper**

In `render_exit_report_html`: vervang het "Samenvatting"-blok (regels ~1026–1043) én het "Wat valt op?"-blok door één aanroep van `_bestuurlijke_read(...)`. Hergebruik de bestaande variabelen: `exec_line` → `kernzin`, `low_lbl/low_sc`, `high_lbl/high_sc`, `mgmt_q = _mgmt_q(top_fkeys[0], "exit")`, en de bestaande `why_cells`-opbouw (regels 1066–1077) → `why_cells_html`. Verwijder de oude `_ig`/insight-grid van "Wat valt op?" — die info zit nu in de read.

- [ ] **Step 5: Run test + render**

Run: `.venv/Scripts/python.exe -m pytest tests/test_pdf_redesign.py -k bestuurlijke -v`
Expected: PASS
Daarna: `.venv/Scripts/python.exe generate_voorbeeldrapport.py exit` → controleer pagina 2 (één pagina, donker bewijsblok, geen aparte "wat valt op").

- [ ] **Step 6: Commit**

```bash
git add backend/report_html.py tests/test_pdf_redesign.py
git commit -m "feat(report): bestuurlijke read vervangt samenvatting + wat-valt-op"
```

---

## Task 5: Gedeelde sectie — Responsbasis & reikwijdte (03)

**Files:**
- Modify: `backend/report_html.py` (nieuwe helper `_responsbasis`)
- Test: `tests/test_pdf_redesign.py`

Spec §03: kort. Uitgenodigd/afgerond/responspercentage, meetperiode, populatie, segmentstatus (beschikbaar/niet + reden), één trustregel: "Dit rapport toont groepspatronen. Individuen zijn niet herleidbaar."

- [ ] **Step 1: Failing test**

```python
from backend.report_html import _responsbasis


def test_responsbasis_shows_counts_and_trustline():
    html = _responsbasis(invited=45, completed=34, pct=76, period="apr–mei 2026",
                         population="Alle medewerkers", segment_available=False,
                         segment_reason="te weinig responses per groep")
    assert "45" in html and "34" in html and "76" in html
    assert "Individuen zijn niet herleidbaar" in html
    assert "te weinig responses per groep" in html
```

- [ ] **Step 2: Run → FAIL**

Run: `.venv/Scripts/python.exe -m pytest tests/test_pdf_redesign.py -k responsbasis -v`

- [ ] **Step 3: Implementeer**

```python
def _responsbasis(*, invited: int, completed: int, pct: int, period: str,
                  population: str, segment_available: bool, segment_reason: str = "") -> str:
    seg = ("Beschikbaar — segmentbeeld verderop in dit rapport." if segment_available
           else f"Niet beschikbaar — {_h(segment_reason)}.")
    return f"""<div class="pb sec">
  <span class="slabel">Responsbasis &amp; reikwijdte</span>
  <table class="sg"><tr>
    <td><div class="sc-l">Uitgenodigd</div><div class="sc-v">{invited}</div></td>
    <td><div class="sc-l">Afgerond</div><div class="sc-v">{completed}</div></td>
    <td><div class="sc-l">Respons</div><div class="sc-v">{pct}%</div></td>
    <td><div class="sc-l">Meetperiode</div><div class="sc-v" style="font-size:14px;">{_h(period)}</div></td>
  </tr></table>
  <div class="card"><h3>Populatie</h3><p>{_h(population)}</p>
    <h3 style="margin-top:10px;">Segmentstatus</h3><p style="margin-bottom:0;">{seg}</p></div>
  <p class="trustline">Dit rapport toont groepspatronen. Individuen zijn niet herleidbaar.</p>
</div>"""
```

- [ ] **Step 4: Aanroepen in exit-renderer** — direct na de bestuurlijke read. Data: `data["n_invited"]`, `data["n_completed"]`, `data["completion_pct"]`. Periode/populatie uit `data` indien aanwezig, anders campagnenaam + "Alle medewerkers". Segmentstatus uit dezelfde n-drempel die `_segment_status_block` gebruikt.

- [ ] **Step 5: Run → PASS**, dan render-check pagina 3.

- [ ] **Step 6: Commit**

```bash
git add backend/report_html.py tests/test_pdf_redesign.py
git commit -m "feat(report): responsbasis & reikwijdte sectie (03)"
```

---

## Task 6: Gedeelde sectie — Overzichtsprofiel (04) met factor-bars

**Files:**
- Modify: `backend/report_html.py` (nieuwe helper `_overzichtsprofiel` + `_factor_bar_row`)
- Test: `tests/test_pdf_redesign.py`

Spec §04: alle factoren gescoord, gerangschikt, RAG-kleurband per drempel. Horizontale bars (WeasyPrint-veilig: inline SVG of `display:table` met gekleurde div). Geen micro-bars.

- [ ] **Step 1: Failing test**

```python
from backend.report_html import _overzichtsprofiel


def test_overzichtsprofiel_ranks_all_factors_with_rag():
    factors = [("Groeiperspectief", 4.2), ("Beloning", 5.1), ("Werksfeer", 7.3)]
    html = _overzichtsprofiel(factors)
    assert "Groeiperspectief" in html and "Werksfeer" in html
    # laagste eerst (gerangschikt)
    assert html.index("Groeiperspectief") < html.index("Werksfeer")
    assert "4.2" in html and "7.3" in html
```

- [ ] **Step 2: Run → FAIL**

- [ ] **Step 3: Implementeer (SVG-bar, inline, RAG-kleur)**

```python
from backend.report_css import RAG_HIGH, RAG_MID, RAG_LOW


def _rag_color(score: float | None) -> str:
    if score is None: return "#CBD5E1"
    if score < 5.0:  return RAG_HIGH
    if score < 6.5:  return RAG_MID
    return RAG_LOW


def _factor_bar_row(label: str, score: float | None) -> str:
    pct = int((score or 0) / 10 * 100)
    col = _rag_color(score)
    track = (f'<svg width="100%" height="14" viewBox="0 0 200 14" preserveAspectRatio="none">'
             f'<rect x="0" y="3" width="200" height="8" fill="#EDE6DA"/>'
             f'<rect x="0" y="3" width="{pct*2}" height="8" fill="{col}"/></svg>')
    return (f'<div class="fbar-row"><div class="fbar-name">{_h(label)}</div>'
            f'<div class="fbar-track">{track}</div>'
            f'<div class="fbar-score" style="color:{col};">{_score_str(score)}</div></div>')


def _overzichtsprofiel(factors: list[tuple[str, float | None]]) -> str:
    ranked = sorted(factors, key=lambda x: (x[1] is None, x[1]))
    rows = "".join(_factor_bar_row(lbl, sc) for lbl, sc in ranked)
    legend = (f'<p style="font-size:9px;color:#64748B;margin-top:12px;">'
              f'<span style="color:{RAG_HIGH};">&#9632;</span> aandachtspunt &nbsp; '
              f'<span style="color:{RAG_MID};">&#9632;</span> gemengd &nbsp; '
              f'<span style="color:{RAG_LOW};">&#9632;</span> relatief sterk</p>')
    return f"""<div class="pb sec">
  <span class="slabel">Overzichtsprofiel</span>
  <div class="card">{rows}{legend}</div>
</div>"""
```

- [ ] **Step 4: Aanroepen** — bouw `factors` uit `ORG_FACTOR_KEYS` + `FACTOR_LABELS_NL` + `data["factor_avgs"]`. Plaats direct na responsbasis. Verwijder de oude losse factoranalyse-staafgrafiek/actiematrix als die nu dubbelt (actiematrix staat niet in de nieuwe spec — verwijderen).

- [ ] **Step 5: Run → PASS**, render-check pagina 4 (alle factoren, laagste boven, RAG-kleur).

- [ ] **Step 6: Commit**

```bash
git add backend/report_html.py tests/test_pdf_redesign.py
git commit -m "feat(report): overzichtsprofiel met gerangschikte RAG factor-bars (04)"
```

---

## Task 7: ExitScan-kern — Vertrekcontext (05) — de ontbrekende pagina

**Files:**
- Modify: `backend/report_html.py` (nieuwe helper `_vertrekcontext`)
- Test: `tests/test_pdf_redesign.py`

Spec §132: ExitScan-exclusief, kómt na overzichtsprofiel, vóór factordiepte. Hoofdredenen (top-3 met n), wat speelde mee (cont_dist, onderscheiden van hoofdreden), werkgerelateerd vs gemengd, verschil hoofdreden/meespelend kort uitgelegd, relatie met primaire factor.

Databron: `data["exit_r_dist"]` = list `{label, code, count}` (hoofdredenen), `data["cont_dist"]` = meespelende context, `data["band_counts"]`.

- [ ] **Step 1: Failing test**

```python
from backend.report_html import _vertrekcontext


def test_vertrekcontext_separates_hoofdreden_from_meespelend():
    html = _vertrekcontext(
        exit_reasons=[("Groeiperspectief", 12), ("Beloning", 7), ("Leiding", 4)],
        contributing=[("Werkdruk", 9), ("Werksfeer", 5)],
        n=34, primary_factor_label="Groeiperspectief",
    )
    assert "Groeiperspectief" in html and "12" in html
    assert "Werkdruk" in html                       # meespelende context apart
    # uitleg verschil hoofdreden vs meespelend aanwezig
    assert "meespeel" in html.lower() or "hoofdreden" in html.lower()
```

- [ ] **Step 2: Run → FAIL**

- [ ] **Step 3: Implementeer**

```python
def _vertrekcontext(*, exit_reasons: list[tuple[str, int]],
                    contributing: list[tuple[str, int]], n: int,
                    primary_factor_label: str) -> str:
    def _reason_rows(items: list[tuple[str, int]]) -> str:
        return "".join(
            f'<tr><td class="iq">{_h(lbl)}</td>'
            f'<td class="is">{cnt}&times;</td></tr>'
            for lbl, cnt in items[:3]
        ) or '<tr><td class="iq" style="color:#94A3B8;">Geen reden geregistreerd</td><td class="is"></td></tr>'

    rel = ""
    if exit_reasons and primary_factor_label and \
       primary_factor_label.lower() in exit_reasons[0][0].lower():
        rel = (f"<p style='margin-bottom:0;'>{_h(primary_factor_label)} is zowel de meest "
               f"genoemde vertrekreden als de laagste factor in het overzichtsprofiel — "
               f"daarom staat het bovenaan.</p>")
    else:
        rel = (f"<p style='margin-bottom:0;'>De meest genoemde reden en de laagste factor "
               f"versterken elkaar in de factordiepte hierna.</p>")

    return f"""<div class="pb sec">
  <span class="slabel">Vertrekcontext</span>
  <h2 style="margin-bottom:6px;">Wat speelde mee bij vertrek?</h2>
  <p style="font-size:10.5px;color:#64748B;max-width:60ch;margin-bottom:18px;">
    Een <strong>hoofdreden</strong> is de doorslaggevende aanleiding om te vertrekken.
    Een <strong>meespelende factor</strong> droeg bij maar gaf niet de doorslag.
    Beide samen geven het vertrekbeeld.</p>
  <div class="tcol">
    <div class="tc-l"><div class="card accent"><h3>Hoofdredenen van vertrek (top 3)</h3>
      <table class="item-tbl">{_reason_rows(exit_reasons)}</table></div></div>
    <div class="tc-r"><div class="card"><h3>Speelde ook mee</h3>
      <table class="item-tbl">{_reason_rows(contributing)}</table></div></div>
  </div>
  <div class="card navy" style="background:#fff;"><h3>Relatie met het overzichtsprofiel</h3>{rel}</div>
</div>"""
```

- [ ] **Step 4: Aanroepen in exit-renderer** — na overzichtsprofiel. Map data:
```python
exit_reasons = [(r["label"], r["count"]) for r in data["exit_r_dist"]]
contributing = [(r["label"], r["count"]) for r in data["cont_dist"]]
s += _vertrekcontext(exit_reasons=exit_reasons, contributing=contributing,
                     n=n, primary_factor_label=low_lbl)
```

- [ ] **Step 5: Run → PASS**, render-check (nieuwe pagina 5 aanwezig, hoofdreden vs meespelend gescheiden).

- [ ] **Step 6: Commit**

```bash
git add backend/report_html.py tests/test_pdf_redesign.py
git commit -m "feat(report): ExitScan vertrekcontext-pagina (05)"
```

---

## Task 8: ExitScan-kern — Factordiepte (06–08), data-gedreven prioriteit

**Files:**
- Modify: `backend/report_html.py` (`_factor_detail`, regels ~1225–1271 — herstijlen + prioriteitslogica)
- Test: `tests/test_pdf_redesign.py`

Spec §143: 1 pagina per prioriteitsfactor, max 3. Prioriteit = factorscore + relatie vertrekreden + itemniveau + open antwoorden + n — **niet alleen laagste score**. Per pagina: factorscore+label, waarom managementaandacht (koppeling vertrekcontext), laagste item (letterlijke vraag + score), hoogste item, compacte itemset, open thema indien beschikbaar, eerste managementvraag.

- [ ] **Step 1: Failing test voor de prioriteits-selectie**

```python
from backend.report_html import _select_priority_factors


def test_priority_factors_weighs_exit_reason_not_only_score():
    factor_avgs = {"growth": 4.2, "pay": 4.0, "workload": 4.5}
    # pay is laagste, maar growth is meest genoemde vertrekreden → growth eerst
    exit_codes = {"growth": 12, "pay": 2, "workload": 3}
    out = _select_priority_factors(factor_avgs, exit_codes, max_n=3)
    assert out[0] == "growth"
    assert len(out) <= 3
```

- [ ] **Step 2: Run → FAIL**

- [ ] **Step 3: Implementeer de selector + herstijl `_factor_detail`**

```python
def _select_priority_factors(factor_avgs: dict[str, float],
                             exit_reason_counts: dict[str, int],
                             max_n: int = 3) -> list[str]:
    """Prioriteit = lage score + frequentie als vertrekreden. Niet puur laagste."""
    def _priority(fk: str) -> float:
        score = factor_avgs.get(fk, 10.0)
        reason = exit_reason_counts.get(fk, 0)
        # lagere score = hoger gewicht; reason-frequentie telt mee
        return (10.0 - score) * 1.0 + reason * 0.4
    keys = [fk for fk in factor_avgs if factor_avgs.get(fk) is not None]
    return sorted(keys, key=_priority, reverse=True)[:max_n]
```

Herstijl de bestaande `_factor_detail`-output naar de nieuwe componenten: `.card`, `.item-tbl`, `.quote-txt`, kop in Inter Tight, accent op de "waarom managementaandacht"-regel (koppel expliciet aan vertrekcontext via `exit_reason_counts[fk]`). Voeg per pagina `break-before: page` toe (`.pb`).

- [ ] **Step 4: Vervang de prioriteitsbron in de exit-renderer** — gebruik `_select_priority_factors(fa, exit_code_counts, 3)` i.p.v. de huidige `bottom_2`/`top_fkeys`-selectie. Bouw `exit_code_counts` uit `data["exit_r_dist"]` via `FACTOR_EXIT_CODE` (inverse mapping factor→code→count).

- [ ] **Step 5: Run → PASS**, render-check: max 3 factordiepte-pagina's, prioriteit niet puur op laagste score.

- [ ] **Step 6: Commit**

```bash
git add backend/report_html.py tests/test_pdf_redesign.py
git commit -m "feat(report): data-gedreven factordiepte-prioriteit + herstijl (06-08)"
```

---

## Task 9: Gedeelde staartmodules — segment, quotes, managementspoor, methodiek

**Files:**
- Modify: `backend/report_html.py` (`_segment_status_block` ~679, `_themed_quotes` ~713, `_step_cards` ~582, `_trust_page` ~621 — allemaal herstijlen naar nieuwe tokens + spec-copy)
- Test: `tests/test_pdf_redesign.py`

Spec §198–263. Belangrijke copy-shifts: managementspoor = "gespreksagenda", géén "risicofactoren"/"interventies" → "aandachtspunten"/"gespreksopeners". Segment State B = exacte spec-tekst. Methodiek = laatste pagina, altijd.

- [ ] **Step 1: Failing test (toon + states)**

```python
from backend.report_html import _segment_status_block, _eerste_managementspoor


def test_segment_state_b_uses_spec_copy():
    html = _segment_status_block(n=8, has_segment_data=False)
    assert "herleidbaarheid te voorkomen" in html
    assert "zodra voldoende responses" in html


def test_managementspoor_avoids_hard_language():
    html = _eerste_managementspoor(
        primary_theme="Groeiperspectief + vertrekcontext", second_point="Beloning",
        mgmt_q="Welke loopbaanstappen ontbreken?", owner="HR + directie",
        review_when="over 1 kwartaal")
    low = html.lower()
    assert "risicofactor" not in low
    assert "interventie" not in low
    assert "gespreksopener" in low or "aandachtspunt" in low
```

- [ ] **Step 2: Run → FAIL** (`_eerste_managementspoor` bestaat nog niet)

- [ ] **Step 3: Implementeer `_eerste_managementspoor` + herstijl bestaande helpers**

```python
def _eerste_managementspoor(*, primary_theme: str, second_point: str, mgmt_q: str,
                            owner: str, review_when: str) -> str:
    return f"""<div class="pb sec">
  <span class="slabel">Eerste managementspoor</span>
  <h2 style="margin-bottom:6px;">Gespreksagenda</h2>
  <p style="font-size:10.5px;color:#64748B;max-width:60ch;margin-bottom:16px;">
    Geen interventieplan — een agenda voor de begeleide managementbespreking.</p>
  <table class="steps"><tr>
    <td class="step"><div class="step-no">Primair thema</div><div class="step-body">{_h(primary_theme)}</div></td>
    <td class="step"><div class="step-no">Tweede aandachtspunt</div><div class="step-body">{_h(second_point)}</div></td>
    <td class="step"><div class="step-no">Eigenaarschap</div><div class="step-body">{_h(owner)}</div></td>
    <td class="step"><div class="step-no">Opnieuw bespreken</div><div class="step-body">{_h(review_when)}</div></td>
  </tr></table>
  <div class="card accent"><h3>Gespreksopener</h3><p style="margin-bottom:0;">{_h(mgmt_q)}</p></div>
  <p class="trustline">Nog niet besluiten: of een verdieping of kortere vervolgmeting nodig is — dat volgt uit het gesprek.</p>
</div>"""
```

Update `_segment_status_block` State B-tekst naar exact spec §210. Herstijl `_themed_quotes` (theme-card + quote-txt, accent-streep). Update `_trust_page` cards naar `.tg/.tc/.tt/.tb` (al aanwezig) en behoud product-specifieke copy. Vervang in de exit-renderer de oude playbook (`_playbook_card`) door `_eerste_managementspoor` — playbook-taal ("verbeteractie") is niet meer spec-conform.

- [ ] **Step 4: Aanroepvolgorde in exit-renderer vastleggen** (spec-macrostructuur):
cover → bestuurlijke read → responsbasis → overzichtsprofiel → vertrekcontext → factordiepte(×≤3) → segment(conditioneel) → quotes(conditioneel) → managementspoor → appendix(conditioneel) → methodiek(laatste).

- [ ] **Step 5: Run → PASS**, render-check volledige exit-PDF — volgorde + toon.

- [ ] **Step 6: Commit**

```bash
git add backend/report_html.py tests/test_pdf_redesign.py
git commit -m "feat(report): staartmodules herstijld + managementspoor als gespreksagenda"
```

---

## Task 10: RetentieScan-kern — Behoudscontext (05) op het skelet

**Files:**
- Modify: `backend/report_html.py` (`render_retention_report_html` ~1416; nieuwe helper `_behoudscontext`)
- Test: `tests/test_pdf_redesign.py`

Spec §160. RetentieScan deelt het hele skelet (cover/bestuurlijke read/responsbasis/overzichtsprofiel/factordiepte/staart) — die helpers zijn nu gedeeld. Alleen de **kernsectie** verschilt: behoudssignaal, stay-intent, vertrekintentie, bevlogenheid, primaire behoudsfactor. Factordiepte koppelt aan behoudsrelevantie i.p.v. vertrekreden.

- [ ] **Step 1: Failing test**

```python
from backend.report_html import _behoudscontext


def test_behoudscontext_shows_stay_intent_and_signal():
    html = _behoudscontext(retention_score=6.4, stay_pct=72, leave_pct=18,
                           engagement=5.9, primary_factor="Autonomie")
    assert "72" in html and "Autonomie" in html
    assert "behoud" in html.lower()
```

- [ ] **Step 2–6:** Zelfde TDD-ritme als Task 7. Implementeer `_behoudscontext` (analoog aan `_vertrekcontext`, andere KPI's via `data["sdt_avgs"]`, stay-intent/turnover uit retention-data). Herbouw `render_retention_report_html` zodat het de gedeelde helpers aanroept (cover met scan_type="retention" → teal accent, openingsvraag "Waar staat behoud nu onder druk?") en alleen `_behoudscontext` als unieke kern invoegt. Factordiepte: roep `_select_priority_factors` aan met behoudsdruk (geïnverteerde score) i.p.v. exit-reason counts. Render-check: `generate_voorbeeldrapport.py retention`. Commit: `"feat(report): RetentieScan op gedeeld skelet + behoudscontext (05)"`.

---

## Task 11: Onboarding-kern — Checkpointoverzicht (05) + Landingskwaliteit (06)

**Files:**
- Modify: `backend/report_html.py` (`render_onboarding_report_html` ~1772; helpers `_checkpointoverzicht`, `_landingskwaliteit`)
- Test: `tests/test_pdf_redesign.py`

Spec §177. Twee unieke secties: checkpoint-scores (30/60/90 naast elkaar, fasevergelijking) en landingskwaliteit per domein (rolhelderheid, begeleiding, info/tools, sociale landing, cultuurbegrip, eerste succes).

- [ ] **Step 1: Failing test**

```python
from backend.report_html import _checkpointoverzicht


def test_checkpointoverzicht_shows_three_phases():
    html = _checkpointoverzicht(checkpoints=[("30 dagen", 6.8), ("60 dagen", 6.1), ("90 dagen", 5.7)])
    assert "30 dagen" in html and "90 dagen" in html
    assert "6.8" in html and "5.7" in html
```

- [ ] **Step 2–6:** Zelfde ritme. Implementeer `_checkpointoverzicht` (3 fasen als `.sg`-tabel of inline SVG-tijdlijn) en `_landingskwaliteit` (domeinscores via `.fbar-row`). Herbouw `render_onboarding_report_html` op de gedeelde helpers (cover scan_type="onboarding" → bruin accent, openingsvraag "Hoe landen uw nieuwe medewerkers?"). Render-check: `generate_voorbeeldrapport.py onboarding`. Commit: `"feat(report): Onboarding op gedeeld skelet + checkpoint/landingskwaliteit"`.

---

## Task 12: Conditionele modules — paginatelling data-gedreven

**Files:**
- Modify: `backend/report_html.py` (conditionele wrapping rond segment/quotes/appendix in alle 3 renderers)
- Test: `tests/test_pdf_redesign.py`

Spec §270: variabel 8–18 pagina's. Geen lege/kunstmatige visualisaties (spec §212). Modules aan/uit op datadrempels: segment alleen ≥ min-n per groep; quotes alleen ≥ MIN_QUOTES_N (5); appendix alleen > 20 respondenten én > 5 factoren.

- [ ] **Step 1: Failing test (conditionele logica)**

```python
from backend.report_html import _should_show_appendix, _should_show_quotes


def test_module_gating():
    assert _should_show_appendix(n=25, n_factors=6) is True
    assert _should_show_appendix(n=15, n_factors=6) is False
    assert _should_show_appendix(n=25, n_factors=4) is False
    assert _should_show_quotes(["a", "b", "c", "d", "e"]) is True
    assert _should_show_quotes(["a", "b"]) is False
```

- [ ] **Step 2: Run → FAIL**

- [ ] **Step 3: Implementeer de gates**

```python
MIN_QUOTES_N = 5

def _should_show_quotes(open_texts: list[str]) -> bool:
    return len([t for t in open_texts if t and t.strip()]) >= MIN_QUOTES_N

def _should_show_appendix(n: int, n_factors: int) -> bool:
    return n > 20 and n_factors > 5
```

- [ ] **Step 4: Wikkel de aanroepen** in alle 3 renderers met deze gates. Segment gebruikt de bestaande min-n logica in `_segment_status_block` (State A vs B — State B blijft altijd zichtbaar als nette empty-state, geen kunstmatige viz).

- [ ] **Step 5: Run → PASS.** Render alle 3 samples; tel pagina's met pypdf:
```bash
.venv/Scripts/python.exe -c "from pypdf import PdfReader; print(len(PdfReader('docs/examples/voorbeeldrapport_loep.pdf').pages))"
```
Expected: binnen 8–18.

- [ ] **Step 6: Commit**

```bash
git add backend/report_html.py tests/test_pdf_redesign.py
git commit -m "feat(report): conditionele modules + data-gedreven paginatelling"
```

---

## Task 13: Dispatcher + bestaande smoke/parity-tests groen

**Files:**
- Modify: `backend/report_html.py` (`render_report_html` ~2045, `_doc` scan_type doorgeven)
- Test: `tests/test_report_generation_smoke.py`, `tests/test_reporting_system_parity.py` (bestaand — moeten blijven slagen)

- [ ] **Step 1: Run de bestaande report-tests**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_generation_smoke.py tests/test_reporting_system_parity.py -v`
Expected: kan FAIL door verwijderde functies/secties (`_playbook_card`, oude sectienamen).

- [ ] **Step 2: Repareer aanroepen, niet de assertions tenzij ze verouderde copy testen.** Als een test op verwijderde merktaal toetst (bv. "Leeswijzer", "Actiematrix"), update de assertion naar de nieuwe sectienaam ("Bestuurlijke read", "Overzichtsprofiel"). Documenteer elke assertion-wijziging in de commit.

- [ ] **Step 3: Volledige report-testsuite**

Run: `.venv/Scripts/python.exe -m pytest tests/ -k "report or pdf or scoring" -v`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add backend/report_html.py tests/
git commit -m "test(report): smoke/parity-tests aangepast aan nieuwe sectiestructuur"
```

---

## Task 14: WeasyPrint-validatie (productie-engine) ⚠️

**Files:** geen code — validatiestap. Dit is de gate die de demo/productie-kloof dicht.

Lokaal render je via Playwright. Deze taak rendert via **WeasyPrint** zoals productie.

- [ ] **Step 1: Render via WeasyPrint in een Linux-omgeving**

Optie A (Docker, aanbevolen):
```bash
docker run --rm -v "$(pwd)":/app -w /app python:3.12-slim bash -c \
  "apt-get update -qq && apt-get install -y -qq libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf-2.0-0 libffi-dev && \
   pip install -q -r requirements.txt && \
   python -c 'from backend.report_html import render_report_html, build_report_data; print(\"weasyprint OK\")'"
```
Optie B: deploy de branch naar een Railway-preview en genereer daar een rapport via de bestaande "Genereer PDF"-route.

- [ ] **Step 2: Vergelijk WeasyPrint-output met de Playwright-render** voor alle 3 scan-types. Let specifiek op:
  - [ ] @font-face base64 laadt (Inter Tight koppen, niet Arial)
  - [ ] `display:table` kolommen breken niet (why-grid, sg, steps, tcol)
  - [ ] Inline SVG bars + concentrische cover-ringen renderen
  - [ ] Donkere cover: navy diep, amber leesbaar, geen kleurbanding
  - [ ] `break-before: page` / `break-inside: avoid` respecteren paginagrenzen
  - [ ] Footer `@bottom-left/right` mono-tekst correct

- [ ] **Step 3: Fix WeasyPrint-specifieke breuken** in `report_css.py` (bv. een flex die toch ergens binnensloop → tabel; SVG `preserveAspectRatio` issue). Re-render tot pariteit.

- [ ] **Step 4: Commit (indien fixes)**

```bash
git add backend/report_css.py backend/report_html.py
git commit -m "fix(report): WeasyPrint-pariteit met Playwright-render"
```

---

## Task 15: Samples regenereren + redesign-log bijwerken

**Files:**
- Modify: `docs/examples/voorbeeldrapport_loep.pdf`, `voorbeeldrapport_retentiescan.pdf`, en onboarding-sample; `frontend/public/examples/*` (kopieën die de site serveert)
- Modify: `docs/active/REPORT_HTML_REDESIGN_LOG.md`

- [ ] **Step 1: Regenereer alle samples**

```bash
.venv/Scripts/python.exe generate_voorbeeldrapport.py exit
.venv/Scripts/python.exe generate_voorbeeldrapport.py retention
.venv/Scripts/python.exe generate_voorbeeldrapport.py onboarding
```
(De generator schrijft naar zowel `docs/examples/` als `frontend/public/examples/` — zie `_write_pdf_outputs`.)

- [ ] **Step 2: Voeg een log-entry toe aan `REPORT_HTML_REDESIGN_LOG.md`** met datum 2026-06-13, kop "PDF-redesign Bold & Statement", en de kernkeuzes: nieuwe tokens (navy/amber/chalk, Inter, scherpe hoeken), base64-fonts, gedeeld skelet + product-modules, vertrekcontext-pagina toegevoegd, actiematrix/leeswijzer verwijderd, managementspoor = gespreksagenda.

- [ ] **Step 3: Werk de beslissingslog in `CLAUDE.md` bij** (Verisight-sectie) met een regel per kernbeslissing.

- [ ] **Step 4: Commit**

```bash
git add docs/examples frontend/public/examples docs/active/REPORT_HTML_REDESIGN_LOG.md CLAUDE.md
git commit -m "docs(report): samples geregenereerd + redesign-log/beslissingslog bijgewerkt"
```

---

## Self-Review

**1. Spec-dekking:**

| Spec-sectie | Taak |
|-------------|------|
| Visuele richting (navy/amber, typografie, kleurcodering) | T1 (fonts), T2 (tokens/CSS), T3 (cover) |
| Gedeeld skelet + modules | T2 + gedeelde helpers T4–T6 + T9; product-kernen T10–T11 |
| 01 Voorblad | T3 |
| 02 Bestuurlijke read | T4 |
| 03 Responsbasis | T5 |
| 04 Overzichtsprofiel | T6 |
| ExitScan 05 Vertrekcontext | T7 |
| ExitScan 06–08 Factordiepte (data-gedreven) | T8 |
| RetentieScan-kern | T10 |
| Onboarding-kern | T11 |
| Segmentbeeld State A/B | T9 + T12 |
| Open thema's & quotes | T9 + T12 |
| Eerste managementspoor (gespreksagenda) | T9 |
| Appendix (conditioneel) | T12 |
| Methodiek (laatste pagina, altijd) | T9 |
| Paginatelling 8–18 data-gedreven | T12 |
| WeasyPrint-constraints | T2 (table-layout, base64) + T14 (validatie) |

Geen ongedekte spec-eisen.

**2. Placeholder-scan:** Alle code-stappen bevatten volledige functies. Teal/bruin accent-hex zijn als concrete waarden opgenomen met expliciete "bevestig visueel in T3"-noot — geen TODO. WeasyPrint-validatie is een echte stap, geen "test later".

**3. Type-consistentie:** `_cover` keyword-signatuur (T3) wordt identiek aangeroepen in T3/T10/T11. `_select_priority_factors(factor_avgs, exit_reason_counts, max_n)` consistent T8/T10. `_rag_color`/`RAG_*` gedeeld uit `report_css`. `build_css(scan_type)` + `_doc(title, body, scan_type)` consistent. `ACCENTS`/`FONT_SPECS` als enige bron.

**Open punt voor de uitvoerder (geen blokker):** de spec wil per-scan accent (amber/teal/bruin), maar het homepage-design system noemt amber "the single accent — use sparingly". Tijdens T3/T10/T11 visueel toetsen of teal/bruin de merkidentiteit niet verwateren; zo nee, terugvallen op amber-overal met alleen de eyebrow-tekst als onderscheid. Beslissing vastleggen in de log (T15).

---

## Execution Handoff

Plan opgeslagen in `docs/superpowers/plans/2026-06-13-pdf-redesign.md`. Twee uitvoeropties:

**1. Subagent-Driven (aanbevolen)** — verse subagent per taak, review tussen taken, snelle iteratie. Past goed bij de cover-first gate (T3) en de WeasyPrint-validatie (T14) als expliciete checkpoints.

**2. Inline Execution** — taken in deze sessie, batch met checkpoints.

Welke aanpak?
