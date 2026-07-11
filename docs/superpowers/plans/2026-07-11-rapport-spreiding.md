# Rapport-spreiding, drempel-duiding en quote-transparantie — implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spreidingsvisuals (stippen-op-zone-as) in de factorverdieping en behoudscontext, drempel-duiding bij de RAG-banden, en transparante quote-weergave zonder trefwoord-thema's — voor alle drie de scans, uitsluitend rapportzijde.

**Architecture:** Nieuwe pure module `backend/report_distribution.py` (aggregatie + SVG-render, unit-testbaar, geen DB). `build_report_data` in `backend/report_html.py` krijgt twee nieuwe keys (`factor_resp_scores`, `intent_resp`) uit al-geladen per-respondent data. De drie factor-detail-renderers en `_behoudscontext` roepen `distribution_block()` aan. Quotes en trust-page worden in `report_html.py` aangepast. Spec: `docs/superpowers/specs/2026-07-11-rapport-spreiding-design.md`.

**Tech Stack:** Python 3.11, pytest, WeasyPrint (validatie via Docker `ghcr.io/weasyprint/weasyprint`), inline SVG (zelfde aanpak als `_mini_bar_svg`). Geen flex-gap, geen CSS-variabelen, geen `inset` (WeasyPrint-beperkingen).

**Referentiefeiten (geverifieerd in code, 2026-07-11):**
- Zone-drempels: `_factor_label` in `backend/report_html.py:222` — `< 5.0` kwetsbaar punt, `< 6.5` aandachtspunt, anders relatief sterk. RAG-kleuren: `RAG_HIGH = "#C0392B"`, `RAG_MID = "#C17C00"`, `RAG_LOW = "#3C8D8A"` (uit `backend/report_css.py`).
- Per-respondent data in `build_report_data` (`report_html.py:886`): `r.org_raw` (dict itemkey→raw 1–5), `r.sdt_raw`; schaling via `_scale_to_10` (`report_html.py:245`). Intent-lijsten `si_sc`/`to_sc`/`eng_sc` worden al berekend (regels ~914–922) maar niet doorgegeven.
- `factor_items_map`: `{factor_key: [(item_key, vraag), ...]}` (`report_html.py:1035`).
- Factor-detail-renderers: exit `_factor_detail` (~1439), retention `_ret_factor_detail` (~1796), onboarding `_ob_factor_detail` (~2178). Allemaal binnenfuncties met toegang tot `data`.
- Quotes: `_themed_quotes` (~825), `MIN_QUOTES_N = 5`, `MAX_QUOTES = 5` (regel 53–54).
- Onboarding-cover: `report_html.py:2068` — `opening_question="Hoe landen uw nieuwe medewerkers?"`.
- Testbaseline backend: 25 failed (pre-existent). Elke taak eindigt op exact die baseline.

---

### Task 1: `score_distribution` — pure aggregatiefunctie

**Files:**
- Create: `backend/report_distribution.py`
- Test: `tests/test_report_distribution.py`

- [ ] **Step 1: Schrijf de falende tests**

```python
# tests/test_report_distribution.py
"""Spreidingsaggregatie (spec: docs/superpowers/specs/2026-07-11-rapport-spreiding-design.md)."""
from backend.report_distribution import score_distribution


def test_zones_volgen_factor_label_drempels():
    # 4.99 = laag (kwetsbaar), 5.0 = midden (aandacht), 6.5 = hoog (sterk)
    d = score_distribution([4.99, 5.0, 6.49, 6.5])
    assert d["zones"] == (1, 2, 1)


def test_polarisatie_beide_buitenzones_25pct_en_samen_60pct():
    # 4 laag + 4 hoog + 2 midden van 10: 40%/40%, samen 80% -> gepolariseerd
    vals = [2.0] * 4 + [8.0] * 4 + [5.5] * 2
    assert score_distribution(vals)["polarized"] is True


def test_geen_polarisatie_bij_eenzijdig_beeld():
    # 8 laag + 2 hoog: hoog < 25% -> niet gepolariseerd
    vals = [2.0] * 8 + [8.0] * 2
    assert score_distribution(vals)["polarized"] is False


def test_geen_polarisatie_bij_breed_midden():
    # buitenzones samen 40% < 60% -> niet gepolariseerd
    vals = [2.0] * 2 + [8.0] * 2 + [5.5] * 6
    assert score_distribution(vals)["polarized"] is False


def test_lege_input():
    d = score_distribution([])
    assert d["zones"] == (0, 0, 0)
    assert d["polarized"] is False
    assert d["mean"] is None


def test_mean_en_dots():
    d = score_distribution([2.0, 8.0])
    assert d["mean"] == 5.0
    assert d["dots"] == [2.0, 8.0]
```

- [ ] **Step 2: Run de tests — verwacht FAIL (module bestaat niet)**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_distribution.py -q`
Expected: `ModuleNotFoundError: No module named 'backend.report_distribution'`

- [ ] **Step 3: Implementeer de module**

```python
# backend/report_distribution.py
"""Spreidingsweergave voor rapportscores (spec: 2026-07-11-rapport-spreiding-design.md).

Pure functies, geen DB. Zone-drempels zijn exact de _factor_label-drempels
(kwetsbaar < 5.0, aandacht < 6.5, sterk >= 6.5) - EEN bandensysteem rapportbreed.
"""
from __future__ import annotations

ZONE_LOW = 5.0   # < ZONE_LOW  -> kwetsbaar punt (laagste zone)
ZONE_HIGH = 6.5  # < ZONE_HIGH -> aandachtspunt; >= ZONE_HIGH -> relatief sterk

# Polarisatie: beide buitenzones >= 25% en samen >= 60% van de respondenten.
_POL_EACH = 0.25
_POL_COMBINED = 0.60


def score_distribution(values: list[float]) -> dict:
    """Aggregeer individuele scores (1-10) naar zones + polarisatie-signaal."""
    vals = [v for v in values if v is not None]
    if not vals:
        return {"zones": (0, 0, 0), "dots": [], "mean": None, "polarized": False}
    low = sum(1 for v in vals if v < ZONE_LOW)
    high = sum(1 for v in vals if v >= ZONE_HIGH)
    mid = len(vals) - low - high
    n = len(vals)
    polarized = (low / n >= _POL_EACH and high / n >= _POL_EACH
                 and (low + high) / n >= _POL_COMBINED)
    return {
        "zones": (low, mid, high),
        "dots": sorted(vals),
        "mean": round(sum(vals) / n, 2),
        "polarized": polarized,
    }
```

- [ ] **Step 4: Run de tests — verwacht PASS**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_distribution.py -q`
Expected: `6 passed`

- [ ] **Step 5: Commit**

```bash
git add backend/report_distribution.py tests/test_report_distribution.py
git commit -m "feat(rapport): score_distribution - zones op _factor_label-drempels + polarisatiecriterium"
```

---

### Task 2: `distribution_block` — SVG-render met n≥10-gate en duidingszin

**Files:**
- Modify: `backend/report_distribution.py`
- Test: `tests/test_report_distribution.py`

- [ ] **Step 1: Schrijf de falende tests (toevoegen aan bestaand testbestand)**

```python
# toevoegen aan tests/test_report_distribution.py
from backend.report_distribution import distribution_block


def test_block_leeg_onder_n10():
    assert distribution_block([5.0] * 9) == ""


def test_block_bevat_svg_en_aantallen_vanaf_n10():
    html = distribution_block([2.0] * 5 + [8.0] * 5)
    assert "<svg" in html
    assert "Kwetsbaar 5" in html
    assert "Sterk 5" in html
    assert "GEM 5.0" in html


def test_duidingszin_alleen_bij_polarisatie():
    gepolariseerd = distribution_block([2.0] * 5 + [8.0] * 5)
    assert "Verdeeld beeld" in gepolariseerd
    normaal = distribution_block([5.5] * 10)
    assert "Verdeeld beeld" not in normaal


def test_jitter_deterministisch():
    # Zelfde input -> byte-identieke output (geen random; WeasyPrint-stabiel).
    vals = [2.0, 3.0, 5.5, 7.0, 8.0] * 2
    assert distribution_block(vals) == distribution_block(vals)
```

- [ ] **Step 2: Run — verwacht FAIL (`ImportError: distribution_block`)**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_distribution.py -q`
Expected: 4 nieuwe tests falen op import.

- [ ] **Step 3: Implementeer render (toevoegen aan `backend/report_distribution.py`)**

```python
# toevoegen aan backend/report_distribution.py
# RAG-kleuren: zelfde gedempte set als report_css (RAG_HIGH/MID/LOW).
_C_LOW, _C_MID, _C_HIGH = "#C0392B", "#C17C00", "#3C8D8A"
_TRACK_BG = {"low": "rgba(192,57,43,0.10)", "mid": "rgba(193,124,0,0.10)",
             "high": "rgba(60,141,138,0.10)"}

MIN_DISTRIBUTION_N = 10  # zelfde drempel als patroonanalyse


def _zone_color(v: float) -> str:
    if v < ZONE_LOW:
        return _C_LOW
    if v < ZONE_HIGH:
        return _C_MID
    return _C_HIGH


def _x(v: float, width: int) -> float:
    return round((v - 1.0) / 9.0 * width, 1)


def distribution_svg(values: list[float], width: int = 440, height: int = 34) -> str:
    """Stippen-op-zone-as: zone-tinten, stippen, gemiddelde-marker."""
    dist = score_distribution(values)
    if dist["mean"] is None:
        return ""
    x_low, x_high = _x(ZONE_LOW, width), _x(ZONE_HIGH, width)
    band_y, band_h = 6, height - 12
    parts = [
        f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">',
        # zone-achtergronden + 2px onderrand per zone
        f'<rect x="0" y="{band_y}" width="{x_low}" height="{band_h}" fill="{_TRACK_BG["low"]}"/>',
        f'<rect x="{x_low}" y="{band_y}" width="{x_high - x_low}" height="{band_h}" fill="{_TRACK_BG["mid"]}"/>',
        f'<rect x="{x_high}" y="{band_y}" width="{width - x_high}" height="{band_h}" fill="{_TRACK_BG["high"]}"/>',
        f'<rect x="0" y="{band_y + band_h}" width="{x_low}" height="2" fill="{_C_LOW}"/>',
        f'<rect x="{x_low}" y="{band_y + band_h}" width="{x_high - x_low}" height="2" fill="{_C_MID}"/>',
        f'<rect x="{x_high}" y="{band_y + band_h}" width="{width - x_high}" height="2" fill="{_C_HIGH}"/>',
    ]
    # stippen: deterministische verticale jitter op index (geen random)
    for i, v in enumerate(dist["dots"]):
        cy = band_y + 5 + (i * 7) % (band_h - 8)
        parts.append(f'<circle cx="{_x(v, width)}" cy="{cy}" r="3.5" '
                     f'fill="{_zone_color(v)}" fill-opacity="0.9"/>')
    # gemiddelde-marker: navy lijn + mono-label
    mx = _x(dist["mean"], width)
    parts.append(f'<rect x="{mx - 1}" y="0" width="2" height="{height}" fill="#0D1B2A"/>')
    anchor = "end" if mx > width - 40 else "start"
    tx = mx - 4 if anchor == "end" else mx + 4
    parts.append(f'<text x="{tx}" y="5" font-family="JetBrains Mono, monospace" '
                 f'font-size="7" fill="#0D1B2A" text-anchor="{anchor}">GEM {dist["mean"]:.1f}</text>')
    parts.append('</svg>')
    return "".join(parts)


def distribution_block(values: list[float]) -> str:
    """SVG + zone-aantallen + (alleen bij polarisatie) duidingszin. Leeg onder n=10."""
    vals = [v for v in values if v is not None]
    if len(vals) < MIN_DISTRIBUTION_N:
        return ""
    dist = score_distribution(vals)
    low, mid, high = dist["zones"]
    counts = (
        f'<div style="display:flex;justify-content:space-between;margin-top:3px;'
        f"font-family:'JetBrains Mono', monospace;font-size:8px;letter-spacing:0.08em;"
        f'text-transform:uppercase;">'
        f'<span style="color:{_C_LOW};">Kwetsbaar {low}</span>'
        f'<span style="color:{_C_MID};">Aandacht {mid}</span>'
        f'<span style="color:{_C_HIGH};">Sterk {high}</span></div>'
    )
    sentence = ""
    if dist["polarized"]:
        n = len(vals)
        sentence = (
            f'<p style="font-size:10px;color:#0D1B2A;margin:6px 0 0;line-height:1.5;">'
            f'<strong>Verdeeld beeld:</strong> {low} van de {n} respondenten scoren in de '
            f'laagste zone, {high} in de hoogste. Dit gemiddelde beschrijft twee '
            f'verschillende ervaringen.</p>'
        )
    return (f'<div class="no-break" style="margin:10px 0 4px;">'
            f'{distribution_svg(vals)}{counts}{sentence}</div>')
```

- [ ] **Step 4: Run — verwacht PASS (10 totaal)**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_distribution.py -q`
Expected: `10 passed`

- [ ] **Step 5: Commit**

```bash
git add backend/report_distribution.py tests/test_report_distribution.py
git commit -m "feat(rapport): distribution_block - stippen-op-zone-as SVG met n>=10-gate en polarisatiezin"
```

---

### Task 3: per-respondent scores in `build_report_data`

**Files:**
- Modify: `backend/report_html.py` (functie `build_report_data`, ~886–1068)
- Test: `tests/test_report_distribution.py`

- [ ] **Step 1: Schrijf de falende test**

De bestaande report-html-tests bouwen `data` dicts met de hand; voor de databuilder gebruiken we een pure hulpfunctie die we uit `build_report_data` factoren, zodat er geen DB-fixture nodig is.

```python
# toevoegen aan tests/test_report_distribution.py
from backend.report_html import _per_respondent_factor_scores


def test_per_respondent_factor_scores():
    factor_items_map = {"workload": [("W1", "vraag 1"), ("W2", "vraag 2")]}
    org_raws = [
        {"W1": 1, "W2": 2},   # gem raw 1.5 -> _scale_to_10 -> 2.13
        {"W1": 5, "W2": 5},   # gem raw 5.0 -> 10.0
        {"W1": 3},            # gem raw 3.0 -> 5.5 (ontbrekend item overslaan)
        {},                   # geen data -> geen bijdrage
    ]
    out = _per_respondent_factor_scores(factor_items_map, org_raws)
    assert [round(v, 2) for v in out["workload"]] == [2.13, 10.0, 5.5]
```

- [ ] **Step 2: Run — verwacht FAIL (`ImportError`)**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_distribution.py::test_per_respondent_factor_scores -q`

- [ ] **Step 3: Implementeer in `backend/report_html.py`**

Nieuwe modulefunctie (plaats direct boven `build_report_data`):

```python
def _per_respondent_factor_scores(
        factor_items_map: dict[str, list], org_raws: list[dict]) -> dict[str, list[float]]:
    """Per factor: de individuele factorscore (gem. van de items, geschaald 1-10)
    per respondent. Basis voor de spreidingsweergave; geen invloed op scoring."""
    out: dict[str, list[float]] = {}
    for fk, items in factor_items_map.items():
        keys = [ik for ik, _q in items]
        scores: list[float] = []
        for raw in org_raws:
            vals = [float(raw[k]) for k in keys if raw.get(k) is not None]
            if vals:
                scores.append(_scale_to_10(sum(vals) / len(vals)))
        out[fk] = scores
    return out
```

In `build_report_data`, na de bouw van `factor_items_map` (regel ~1035), toevoegen:

```python
    factor_resp_scores = _per_respondent_factor_scores(
        factor_items_map, [r.org_raw or {} for r in responses])
```

En in de `return dict(...)` (regel ~1048) twee keys toevoegen:

```python
        factor_resp_scores=factor_resp_scores,
        intent_resp={"stay": si_sc, "turnover": to_sc, "engagement": eng_sc},
```

(`si_sc`, `to_sc`, `eng_sc` bestaan al als lokale lijsten op regels ~914–922.)

- [ ] **Step 4: Run — verwacht PASS + geen regressie in report-tests**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_distribution.py tests/test_report_html_design.py tests/test_pdf_redesign.py -q`
Expected: alles groen (39 bestaande + 11 nieuwe).

- [ ] **Step 5: Commit**

```bash
git add backend/report_html.py tests/test_report_distribution.py
git commit -m "feat(rapport): per-respondent factorscores + intent-lijsten in build_report_data"
```

---

### Task 4: spreidingsblok in factorverdieping (×3 scans) en behoudscontext

**Files:**
- Modify: `backend/report_html.py` — `_factor_detail` (~1439), `_ret_factor_detail` (~1796), `_ob_factor_detail` (~2178), `_behoudscontext` (~921) en de retention-renderer-callsite van `_behoudscontext`
- Test: `tests/test_report_distribution.py`

- [ ] **Step 1: Schrijf de falende render-tests**

```python
# toevoegen aan tests/test_report_distribution.py
from backend.report_html import render_retention_report_html


def _min_retention_data(factor_resp_scores=None, intent_resp=None, n=12):
    """Minimale data-dict voor de retention-renderer (patroon uit test_report_html_design)."""
    fa = {"workload": 5.0}
    return dict(
        campaign_id="c1", scan_type="retention", scan_lbl="Loep Behoud",
        org_name="TestOrg", campaign_name="Wave 1", generated_at="11-07-2026",
        delivery_mode="Baseline", n_invited=n + 3, n_completed=n,
        completion_pct=80.0, avg_risk=5.0, avg_eng=6.0, avg_to=5.0, avg_si=5.0,
        band_counts={"HOOG": 0, "MIDDEN": n, "LAAG": 0}, has_pattern=True,
        factor_avgs=fa, top_risks=[("workload", 5.0)],
        top_fkeys=["workload"], top_flabels=["Werkdruk en herstelruimte"],
        strong_work=None, top_exit_lbl=None, top_cont_lbl=None, sig_vis=None,
        sdt_avgs={}, sdt_item_avgs={}, org_item_avgs={"W1": 5.0},
        exit_r_dist=[], cont_dist=[], prev_dist={}, open_texts=[],
        deepening_agg={}, retention_profile=None, exit_pbs=[], ret_pbs=[],
        msp=None, nsp=None,
        factor_items_map={"workload": [("W1", "Testvraag werkdruk")]},
        sdt_items={}, enps_available=False, enps_score=None,
        factor_resp_scores=factor_resp_scores or {"workload": [2.0] * 6 + [8.0] * 6},
        intent_resp=intent_resp or {"stay": [2.0] * 6 + [8.0] * 6,
                                    "turnover": [5.0] * 12, "engagement": [6.0] * 12},
    )


def test_retention_factorverdieping_toont_spreiding():
    html = render_retention_report_html(_min_retention_data())
    assert html.count("GEM") >= 2  # minstens factor + een intentiescore
    assert "Verdeeld beeld" in html  # fixture is gepolariseerd


def test_geen_spreiding_onder_n10():
    d = _min_retention_data(
        factor_resp_scores={"workload": [5.0] * 6},
        intent_resp={"stay": [5.0] * 6, "turnover": [5.0] * 6, "engagement": [5.0] * 6},
        n=6)
    html = render_retention_report_html(d)
    assert "GEM" not in html
```

Let op: als de bestaande testsuite al een fixture-helper voor renderer-data heeft (check `tests/test_report_html_design.py`), hergebruik die in plaats van `_min_retention_data` — kopieer dan alleen de twee nieuwe keys erin.

- [ ] **Step 2: Run — verwacht FAIL (spreiding wordt nog nergens gerenderd)**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_distribution.py -q -k "verdieping or onder_n10"`

- [ ] **Step 3: Wire de renderers**

Bovenaan `backend/report_html.py` bij de imports:

```python
from backend.report_distribution import distribution_block
```

**Exit — `_factor_detail` (~1439):** de renderer heeft `data` in scope (binnenfunctie). Direct na de `<h2>`-regel van de factorkop in de returnstring het blok invoegen:

```python
        spread = distribution_block(data.get("factor_resp_scores", {}).get(fk, []))
```

en `{spread}` in de HTML-return direct onder de `<h2>…</h2>`-regel plaatsen (vóór de itemtabel).

**Retention — `_ret_factor_detail` (~1796):** identiek patroon: `spread = distribution_block(data.get("factor_resp_scores", {}).get(fk, []))` en `{spread}` onder de factorkop.

**Onboarding — `_ob_factor_detail` (~2178):** identiek patroon.

**Behoudscontext — `_behoudscontext`:** signatuur uitbreiden met `intent_resp: dict | None = None`. Onder de stat-cards-tabel (`stat_grid`) per intentiescore een compacte strip toevoegen:

```python
    strips = ""
    for key, label in (("stay", "Blijfintentie"), ("turnover", "Vertrekintentie"),
                       ("engagement", "Bevlogenheid")):
        blk = distribution_block((intent_resp or {}).get(key, []))
        if blk:
            strips += (f'<div style="margin-top:10px;"><div class="sc-l">'
                       f'{label} &mdash; spreiding</div>{blk}</div>')
```

en `{strips}` in de return-HTML direct na `{stat_grid}` (vóór de bestaande legend). Callsite in de retention-renderer: `intent_resp=data.get("intent_resp")` doorgeven.

Let op vertrekintentie: hoog = slecht. De zone-kleuren van `distribution_block` zijn generiek (laag = rood). Voor deze v1 accepteren we dat en zetten we bij de vertrekintentie-strip een mono-suffix in het label: `Vertrekintentie &mdash; spreiding (hoger = meer vertrekgedachten)`. Géén kleur-inversie bouwen (YAGNI; de bespreking duidt).

- [ ] **Step 4: Run — verwacht PASS + regressiecheck**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_distribution.py tests/test_report_html_design.py tests/test_pdf_redesign.py tests/test_deepening_report_html.py tests/test_direction_report_html.py -q`
Expected: alles groen.

- [ ] **Step 5: Commit**

```bash
git add backend/report_html.py tests/test_report_distribution.py
git commit -m "feat(rapport): spreidingsblok in factorverdieping (3 scans) + behoudscontext-intenties"
```

---

### Task 5: drempel-duiding — voetregel overzichtsprofiel + methodiekblok

**Files:**
- Modify: `backend/report_html.py` — overzichtsprofiel-return (~1153) en `_trust_page` (~500)
- Test: `tests/test_report_distribution.py`

- [ ] **Step 1: Schrijf de falende tests**

```python
# toevoegen aan tests/test_report_distribution.py
def test_overzichtsprofiel_heeft_drempelvoetregel():
    html = render_retention_report_html(_min_retention_data())
    assert "vaste schaaldrempels" in html
    assert "rangorde" in html.lower()


def test_methodiek_legt_banden_uit():
    html = render_retention_report_html(_min_retention_data())
    assert "Hoe de banden werken" in html
    assert "5,0" in html or "5.0" in html  # grenswaarden expliciet
```

- [ ] **Step 2: Run — verwacht FAIL**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_distribution.py -q -k "drempel or banden"`

- [ ] **Step 3: Implementeer**

**Voetregel** — in de overzichtsprofiel-return (de `<div class="pb sec"><span class="slabel">Overzichtsprofiel</span>…`-string, ~1153), direct vóór de sluitende `</div>`:

```python
  <p class="trustline">Banden zijn vaste schaaldrempels, geen benchmark.
  De rangorde tussen factoren weegt zwaarder dan de kleur &mdash; zie Methodiek.</p>
```

**Methodiekblok** — in `_trust_page` (~500): elke scan-variant heeft een tuple-lijst met (titel, tekst)-kaarten. Voeg aan alle drie de scan-varianten dezelfde kaart toe:

```python
            ("Hoe de banden werken",
             "Kwetsbaar punt (onder 5,0), aandachtspunt (5,0 tot 6,5) en relatief "
             "sterk (vanaf 6,5) zijn vaste schaaldrempels, geen vergelijking met "
             "andere organisaties. De rangorde tussen de eigen factoren weegt "
             "zwaarder dan de absolute kleur. Doordat de meetlat vast is, zijn "
             "meting en vervolgmeting een-op-een vergelijkbaar."),
```

- [ ] **Step 4: Run — verwacht PASS**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_distribution.py tests/test_report_html_design.py tests/test_pdf_redesign.py -q`

- [ ] **Step 5: Commit**

```bash
git add backend/report_html.py tests/test_report_distribution.py
git commit -m "feat(rapport): drempel-duiding - voetregel overzichtsprofiel + methodiekblok banden"
```

---

### Task 6: quotes — alles tonen t/m 12, thema-indeling eruit; onboarding-cover

**Files:**
- Modify: `backend/report_html.py` — `_themed_quotes` (~825), `MAX_QUOTES` (regel 54), onboarding-cover (regel 2068)
- Test: `tests/test_report_distribution.py`

- [ ] **Step 1: Schrijf de falende tests**

```python
# toevoegen aan tests/test_report_distribution.py
from backend.report_html import _themed_quotes


def test_quotes_alles_getoond_tot_12():
    texts = [f"Toelichting nummer {i}" for i in range(8)]
    html = _themed_quotes(texts, "retention")
    for t in texts:
        assert t in html
    assert "Getoond" not in html  # niets weggelaten -> geen weglatingsregel


def test_quotes_cap_12_met_expliciete_regel():
    texts = [f"Toelichting nummer {i}" for i in range(15)]
    html = _themed_quotes(texts, "retention")
    assert "Toelichting nummer 11" in html
    assert "Toelichting nummer 12" not in html
    assert "eerste 12 van 15 in ontvangstvolgorde" in html


def test_quotes_geen_thema_indeling():
    texts = ["Mijn leidinggevende was prima, het zat 'm in de werkdruk"] * 6
    html = _themed_quotes(texts, "retention")
    assert "Thema" not in html
    assert "theme-badge" not in html
    assert "Leiderschap" not in html  # het negatie-voorbeeld mag geen label krijgen


def test_onboarding_cover_zonder_uw():
    import backend.report_html as rh
    import inspect
    src = inspect.getsource(rh)
    assert "Hoe landen uw nieuwe medewerkers" not in src
```

- [ ] **Step 2: Run — verwacht FAIL**

Run: `.venv/Scripts/python.exe -m pytest tests/test_report_distribution.py -q -k quotes`

- [ ] **Step 3: Implementeer**

Regel 54: `MAX_QUOTES = 5` → `MAX_QUOTES = 12`.

Herschrijf `_themed_quotes` (regels ~825–881) volledig:

```python
def _themed_quotes(texts: list[str], scan_type: str = "exit",
                   top_fkeys: list[str] | None = None, n_total: int = 0) -> str:
    """Open toelichtingen: alles tonen t/m MAX_QUOTES, geen thema-indeling.

    Trefwoord-classificatie is bewust verwijderd (besluit 2026-04-09 + spec
    2026-07-11): trefwoorden onderscheiden geen negatie ("met mijn leidinggevende
    was niets mis" kreeg het label Leiderschap). Duiding gebeurt in de
    begeleide managementbespreking, niet geautomatiseerd in het rapport.
    """
    if len(texts) < MIN_QUOTES_N:
        return (f'<div class="empty-state">Open toelichtingen worden getoond bij minimaal '
                f'{MIN_QUOTES_N} antwoorden. Huidig: {len(texts)}.</div>')

    note = ""
    if len(texts) > MAX_QUOTES:
        note = (f'<div class="cbox" style="margin-bottom:12px;font-size:10px;color:#374151;">'
                f'Getoond: de eerste {MAX_QUOTES} van {len(texts)} in ontvangstvolgorde &mdash; '
                f'geen inhoudelijke selectie.</div>')

    seen: set[str] = set()
    cards = ""
    for t in texts[:MAX_QUOTES]:
        if t in seen:
            continue
        seen.add(t)
        cards += (
            f'<div class="theme-card">'
            f'<div class="quote-txt">{_h(t)}'
            f'<div class="quote-anon">Geanonimiseerd &mdash; namen en contactgegevens verwijderd</div>'
            f'</div></div>'
        )
    return f'{note}{cards}'
```

Controleer daarna de callsites van `_themed_quotes` (grep): de parameters `top_fkeys`/`n_total` blijven geaccepteerd (backwards compatible), callsites hoeven niet te wijzigen. Controleer ook of de sectiekop boven het blok ("Open toelichtingen — N medewerkersstemmen") elders wordt gezet en klopt zonder themasamenvatting.

Regel 2068: `opening_question="Hoe landen uw nieuwe medewerkers?"` → `opening_question="Hoe landen nieuwe medewerkers?"`.

Als `THEME_KEYWORDS`/`_ONBOARDING_THEME_KEYWORDS` nu nergens meer gebruikt worden (grep), verwijder de imports/constanten in dezelfde commit — geen dode code achterlaten. Let op: `_ONBOARDING_THEME_KEYWORDS` staat in dit bestand zelf (~192).

- [ ] **Step 4: Run — verwacht PASS + volledige suite op baseline**

Run: `.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | tail -3`
Expected: exact de pre-existente baseline van 25 failed, geen nieuwe fails. Vergelijk de faalset (namen, niet alleen aantal) met een voor-de-branch-run.

- [ ] **Step 5: Commit**

```bash
git add backend/report_html.py tests/test_report_distribution.py
git commit -m "feat(rapport): quotes zonder trefwoord-thema's, alles t/m 12 + expliciete kaap-regel; onboarding-cover zonder 'uw'"
```

---

### Task 7: samples regenereren + WeasyPrint-validatie

**Files:**
- Modify: `docs/examples/voorbeeldrapport_{loep,retentiescan,onboarding}.{html,pdf}`, `frontend/public/examples/` idem

- [ ] **Step 1: Regenereer de drie sample-HTML's**

```bash
cd /c/Users/larsh/Desktop/Business/Verisight
.venv/Scripts/python.exe generate_voorbeeldrapport.py exit
.venv/Scripts/python.exe generate_voorbeeldrapport.py retention
.venv/Scripts/python.exe generate_voorbeeldrapport.py onboarding
```

Expected: 3× "Rapport opgeslagen (HTML)".

- [ ] **Step 2: Render PDF's via WeasyPrint-Docker (PowerShell, niet Git Bash — padvertaling breekt de mount)**

```powershell
$files = @("voorbeeldrapport_loep", "voorbeeldrapport_retentiescan", "voorbeeldrapport_onboarding")
foreach ($f in $files) {
  $out = docker run --rm -v "C:\Users\larsh\Desktop\Business\Verisight\docs\examples:/data" ghcr.io/weasyprint/weasyprint "/data/$f.html" "/data/$f.pdf" 2>&1
  "$f => exit $LASTEXITCODE, warnings: $($out | Measure-Object | Select-Object -ExpandProperty Count)"
}
```

Expected: 3× exit 0, **0 warnings**. Elke warning is een WeasyPrint-incompatibiliteit in de nieuwe SVG/CSS — fixen vóór commit.

- [ ] **Step 3: Pagineringscheck**

```bash
.venv/Scripts/python.exe -c "
from pypdf import PdfReader
for name in ['voorbeeldrapport_loep', 'voorbeeldrapport_retentiescan', 'voorbeeldrapport_onboarding']:
    r = PdfReader(f'docs/examples/{name}.pdf')
    print(name, len(r.pages), 'pag.')
    for i, p in enumerate(r.pages, 1):
        print(f'  p{i:02d}:', p.extract_text().strip().replace(chr(10), ' ')[:80])
"
```

Expected: elke pagina begint op een sectielabel; het spreidingsblok breekt niet over een paginagrens (staat in een `no-break` div). Visuele steekproef: open de retention-HTML in de browser en bekijk factorverdieping + behoudscontext.

- [ ] **Step 4: Kopieer PDF's naar de site en commit**

```bash
cp docs/examples/voorbeeldrapport_{loep,retentiescan,onboarding}.pdf frontend/public/examples/
git add backend/ docs/examples/ frontend/public/examples/ tests/
git commit -m "chore(samples): voorbeeldrapporten geregenereerd met spreidingsvisuals (WeasyPrint-gevalideerd, 0 warnings)"
```

- [ ] **Step 5: Push + Railway-notitie**

```bash
git push
```

Vercel deployt de site-samples automatisch. **Railway handmatig redeployen** (backend-Python gewijzigd) vóór de eerstvolgende echte rapportgeneratie.

---

## Zelfreview-notities (verwerkt)

- Zonegrenzen komen uit `_factor_label` (5.0/6.5); `report_distribution.py` definieert ze als eigen constanten `ZONE_LOW`/`ZONE_HIGH` met een test die de koppeling pint (`test_zones_volgen_factor_label_drempels`). Bij een toekomstige drempelwijziging faalt die test bewust.
- Vertrekintentie-kleuren: bewust generiek gehouden (label-suffix i.p.v. kleur-inversie) — YAGNI, vastgelegd in Task 4.
- `_themed_quotes` behoudt zijn signatuur zodat callsites en bestaande tests (`_should_show_quotes` in `test_pdf_redesign.py:175`) ongemoeid blijven.
- Task 4-fixture: check eerst of `tests/test_report_html_design.py` al een databuilder-helper heeft en hergebruik die.
