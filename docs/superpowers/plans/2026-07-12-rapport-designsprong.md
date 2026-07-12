# Rapport-designsprong Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Het WeasyPrint-PDF-rapport (exit/retention/onboarding) van 7/10 naar 8,5/10 premium-consultancy-gevoel: samengevoegde openingspagina, twee navy contrast-ankers, datagedreven agenda-onderbouwing en genummerde hoofdstukken.

**Architecture:** Alle wijzigingen in `backend/report_html.py` (gedeelde sectie-helpers + drie renderers) en `backend/report_css.py` (tokens/classes). Geen datalaag-wijzigingen: de agenda-onderbouwing hergebruikt de al doorgegeven `deepening_agg`. Spec: `docs/superpowers/specs/2026-07-12-rapport-designsprong-design.md`.

**Tech Stack:** Python 3.14, pytest, WeasyPrint (via Docker `ghcr.io/weasyprint/weasyprint`, PowerShell op Windows), PyMuPDF voor raster-inspectie.

**Baselines (na elke task exact zo):** `../../.venv/Scripts/python.exe -m pytest tests/ -q` → **25 failed** (pre-existent, o.a. `test_scoring.py`, `test_team_scoring.py`), passed-telling groeit alleen door nieuwe tests, 5 skipped.

**WeasyPrint-kaders (huisregels, herhaald):** geen CSS custom properties, geen `gap` op flex, geen `inset`-shorthand. Kleuren via directe hex-interpolatie in Python-strings.

---

## Bestandenkaart

- `backend/report_html.py` — `_bestuurlijke_read` (regel ~379), `_responsbasis` (~399), `_eerste_managementspoor` (~519), `_segment_block` (~837), drie renderers: exit (~1420), retention (~1770), onboarding (~2160). Alle regelnummers = stand na commit `eb7fd0d3`.
- `backend/report_css.py` — nieuwe classes `.ch-idx`, `.ch-rule`, `.agenda-dark`, `.agenda-why`.
- `tests/test_report_design_sprong.py` — NIEUW, alle nieuwe asserts.
- `tests/test_report_html_design.py` — lockstep waar bestaande asserts paginastructuur pinnen.

---

### Task 1: Samengevoegde openingspagina (spec §1)

**Files:**
- Modify: `backend/report_html.py` (`_bestuurlijke_read`, `_responsbasis`, drie call-sites)
- Test: `tests/test_report_design_sprong.py` (nieuw)

- [ ] **Step 1: Schrijf de failing tests**

Maak `tests/test_report_design_sprong.py`:

```python
"""Designsprong rapport (spec: 2026-07-12-rapport-designsprong-design.md)."""
from tests.test_report_distribution import _min_retention_data
from backend.report_html import render_retention_report_html


def test_openingspagina_bevat_read_en_responsbasis_in_een_sectie():
    html = render_retention_report_html(_min_retention_data())
    # Responsbasis-stats staan in dezelfde sectie als de bestuurlijke read:
    # tussen "Bestuurlijke read" en de eerstvolgende sectiestart mag geen
    # pagina-einde (class="pb sec") zitten vóór "Uitgenodigd".
    start = html.find("Bestuurlijke read")
    uitgenodigd = html.find("Uitgenodigd", start)
    next_page = html.find('class="pb sec"', start + 1)
    assert start != -1 and uitgenodigd != -1
    assert uitgenodigd < next_page, "responsbasis moet op de openingspagina staan"


def test_geen_zie_p03_meer():
    html = render_retention_report_html(_min_retention_data())
    assert "p.03" not in html


def test_responsbasis_compact_geen_eigen_pagina():
    from backend.report_html import _responsbasis
    band = _responsbasis(
        invited=58, completed=39, pct=67, period="Q2 2026",
        population="Actieve medewerkers",
        segment_available=True, enps_available=True, compact=True)
    assert 'class="pb sec"' not in band
    assert "Uitgenodigd" in band and "Responsbasis" in band
```

- [ ] **Step 2: Run tests, verwacht FAIL**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_report_design_sprong.py -v`
Expected: FAIL (`compact` is geen parameter; "p.03" komt voor).

- [ ] **Step 3: `_responsbasis` compacte variant**

In `backend/report_html.py`, vervang de signature en de return van `_responsbasis` (regel ~399-434):

```python
def _responsbasis(*, invited: int, completed: int, pct: int, period: str,
                  population: str, segment_available: bool, segment_reason: str = "",
                  enps_available: bool = True, compact: bool = False) -> str:
    seg = ("Beschikbaar — segmentbeeld verderop in dit rapport." if segment_available
           else f"Niet beschikbaar — {_h(segment_reason)}.")

    not_available: list[str] = []
    if not segment_available:
        not_available.append("segmentcontrasten")
    if not enps_available:
        not_available.append("werkgeversaanbeveling (eNPS)")

    if not_available:
        items_html = " &middot; ".join(_h(x) for x in not_available)
        datastatus_html = (
            f'<div class="card" style="margin-top:14px;">'
            f'<span class="eyebrow">Datastatus</span>'
            f'<p style="margin-top:4px;margin-bottom:0;">Niet beschikbaar in deze wave: {items_html}. '
            f'Verdieping opent zodra voldoende responses beschikbaar zijn.</p>'
            f'</div>'
        )
    else:
        datastatus_html = ""

    # De statregel blijft als geheel bij elkaar; de band als geheel mag wél
    # doorbreken naar de volgende pagina (spec §1 randgeval).
    body = f"""<span class="slabel">Responsbasis &amp; reikwijdte</span>
  <table class="sg no-break"><tr>
    <td><div class="sc-l">Uitgenodigd</div><div class="sc-v">{invited}</div></td>
    <td><div class="sc-l">Afgerond</div><div class="sc-v">{completed}</div></td>
    <td><div class="sc-l">Respons</div><div class="sc-v">{pct}%</div></td>
    <td><div class="sc-l">Meetperiode</div><div class="sc-v" style="font-size:14px;">{_h(period)}</div></td>
  </tr></table>
  <div class="card"><h3>Populatie</h3><p>{_h(population)}</p>
    <h3 style="margin-top:10px;">Segmentstatus</h3><p style="margin-bottom:0;">{seg}</p></div>
  {datastatus_html}"""

    if compact:
        return f'<div style="margin-top:28px;">{body}</div>'
    return f'<div class="pb sec">\n  {body}\n</div>'
```

- [ ] **Step 4: `_bestuurlijke_read` neemt de band op, "Zie p.03"-cel weg**

Vervang `_bestuurlijke_read` (regel ~379-396):

```python
def _bestuurlijke_read(*, kernzin: str, totaalbeeld: str,
                       primary_label: str, primary_score: float | None, primary_color: str,
                       why_cells_html: str, strong_label: str, strong_score: float | None,
                       mgmt_q: str, responsbasis_html: str = "") -> str:
    return f"""<div class="pb sec">
  <span class="slabel">Bestuurlijke read</span>
  <p class="br-kernzin">{_h(kernzin)}</p>
  <p style="font-size:11px;color:#374151;max-width:62ch;margin-bottom:22px;">{_h(totaalbeeld)}</p>
  <div class="why">
    <div class="why-title">Waarom {_h(primary_label)} bovenaan staat</div>
    <table class="why-grid"><tr>{why_cells_html}</tr></table>
    {("<table class='sg'><tr>"
      f"<td><div class='sc-l'>Relatief sterk</div><div class='sc-v'>{_score_str(strong_score)}</div><div class='sc-b'>{_h(strong_label)} — wat w&eacute;l werkt</div></td>"
      "</tr></table>") if strong_label else ""}
    <div class="mq-line"><span class="mq-label">Eerste managementvraag</span><p>{_h(mgmt_q)}</p></div>
  </div>
  {responsbasis_html}
</div>"""
```

(Let op: de tweede `<td>` met "Zie p.03" is verwijderd; de sg-tabel houdt één cel.)

- [ ] **Step 5: Drie call-sites ombouwen**

Per renderer (exit ~1518-1545, retention ~1853-1880, onboarding ~2240-2268), zelfde patroon. **Exit:**

```python
    # Subtekst herhaalt de titel niet meer: alleen wat NIEUW is — de sterke
    # factor mét score. De responsbasis staat nu onderaan dezelfde pagina.
    totaalbeeld = (
        f"{high_lbl} ({_score_str(high_sc)}) laat zien wat wél werkt. "
        f"Hoe stevig dit beeld is, hangt af van de responsbasis onderaan deze pagina."
    ) if high_lbl and low_lbl != high_lbl else \
        "Reikwijdte en betrouwbaarheid van dit beeld: zie de responsbasis onderaan deze pagina."

    _responsbasis_band = _responsbasis(
        invited=data["n_invited"],
        completed=data["n_completed"],
        pct=int(data["completion_pct"]),
        period=data["campaign_name"],
        population="Alle medewerkers",
        segment_available=bool(data.get("segment_rows")),
        segment_reason="te weinig responses per groep voor herleidbaarheid",
        enps_available=data["enps_available"],
        compact=True,
    )

    s += _bestuurlijke_read(
        kernzin=exec_line,
        totaalbeeld=totaalbeeld,
        primary_label=primary_label,
        primary_score=primary_sc,
        primary_color=primary_col,
        why_cells_html=why_cells,
        strong_label=high_lbl,
        strong_score=high_sc,
        mgmt_q=br_mgmt_q,
        responsbasis_html=_responsbasis_band,
    )
```

En **verwijder** het losse `s += _responsbasis(...)`-blok (met de `# ── Responsbasis & reikwijdte (p.03) ──`-kop) dat direct daarna komt. Retention: identiek maar `population="Actieve medewerkers"` en totaalbeeld-tekst "laat zien wat wél werkt". Onboarding: `population="Nieuwe medewerkers — eerste werkperiode"` en "laat zien wat wél goed landt.".

- [ ] **Step 6: Tests draaien**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_report_design_sprong.py tests/test_report_html_design.py tests/test_pdf_redesign.py -v`
Expected: nieuwe tests PASS. De bestaande `test_responsbasis_*`-tests blijven groen (roepen `_responsbasis` zonder `compact` aan → default `False`, zelfde content-strings). Als een bestaande test op "p.03" of de losse pagina pint: bijwerken in lockstep (alleen het geraakte assert, geen bredere wijziging).

- [ ] **Step 7: Volledige suite + commit**

Run: `../../.venv/Scripts/python.exe -m pytest tests/ -q` → verwacht 25 failed = baseline.

```bash
git add backend/report_html.py tests/test_report_design_sprong.py tests/test_report_html_design.py
git commit -m "feat(rapport): openingspagina voegt bestuurlijke read en responsbasis samen (geen p.03-verwijzing)"
```

---

### Task 2: Navy gespreksagenda + "waarom eerst"-regels (spec §2a + §3)

**Files:**
- Modify: `backend/report_html.py` (`_eerste_managementspoor` + drie call-sites)
- Modify: `backend/report_css.py` (`.agenda-dark`, `.agenda-why`)
- Test: `tests/test_report_design_sprong.py`

- [ ] **Step 1: Failing tests**

Voeg toe aan `tests/test_report_design_sprong.py`:

```python
def test_agenda_is_navy_vlak_met_amber_labels():
    from backend.report_html import _eerste_managementspoor
    html = _eerste_managementspoor(
        primary_theme="Bespreek eerst 'X' (4.8/10)",
        second_point="Werkdruk en herstelruimte (5.5/10)",
        mgmt_q="Waar begint het gesprek?",
        review_when="Plan binnen 45-90 dagen een vervolgmoment.")
    assert 'class="agenda-dark"' in html
    assert "Gespreksopener" in html


def test_agenda_waarom_regels_alleen_bij_dataclaim():
    from backend.report_html import _eerste_managementspoor
    html = _eerste_managementspoor(
        primary_theme="Bespreek eerst 'X' (4.8/10)",
        second_point="Werkdruk en herstelruimte (5.5/10)",
        mgmt_q="Q?", review_when="R.",
        primary_why="Laagste item in het cijferbeeld (4.8/10); 6 van de 9 respondenten met verdieping kozen deze toelichting.",
        second_why="Tweede laagste factorscore in het overzichtsprofiel.")
    assert html.count('class="agenda-why"') == 2
    assert "6 van de 9" in html
    # Zonder why-regels: geen agenda-why spans
    html2 = _eerste_managementspoor(
        primary_theme="X", second_point="Y", mgmt_q="Q?", review_when="R.")
    assert 'class="agenda-why"' not in html2
```

- [ ] **Step 2: Run tests, verwacht FAIL**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_report_design_sprong.py -v` → FAIL (geen `agenda-dark`, geen `primary_why`-parameter).

- [ ] **Step 3: CSS-classes toevoegen**

In `backend/report_css.py`, direct ná het `.step-fill-hint`-blok (regel ~166):

```python
/* ── Navy agenda-anker (designsprong §2a): het hele agendablok als donker vlak ── */
.agenda-dark { background: #0D1B2A; padding: 18px 20px; margin-top: 4px; }
.agenda-dark .step { background: transparent; border: 1px solid #2A3D52; }
.agenda-dark .step-no { color: #E8A020; }
.agenda-dark .step-body { color: #E7E2D6; }
.agenda-dark .step-fill { border-bottom: 1px dashed #5B6B7C; }
.agenda-dark .step-fill-hint { color: #8CA0B3; }
.agenda-why { display: block; font-family: 'JetBrains Mono', monospace; font-size: 8px;
  letter-spacing: 0.04em; color: #9FB0C0; margin-top: 7px; line-height: 1.5; }
.agenda-opener { border-left: 3px solid #E8A020; border-top: 1px solid #2A3D52;
  padding: 14px 0 0 16px; margin-top: 16px; }
```

- [ ] **Step 4: `_eerste_managementspoor` herbouwen**

Vervang de functie (regel ~519-543):

```python
def _eerste_managementspoor(*, primary_theme: str, second_point: str, mgmt_q: str,
                            review_when: str,
                            primary_why: str | None = None,
                            second_why: str | None = None) -> str:
    """Gespreksagenda voor eerste managementbespreking — geen actieplan, agenda.

    Navy anker (designsprong §2a): kaarten + gespreksopener vormen één donker
    vlak. primary_why/second_why (designsprong §3) zijn feitelijke
    onderbouwingsregels uit bestaande berekeningen — geen nieuwe duiding.
    Eigenaarschap blijft bewust een invulbare lege regel.
    """
    def _why(txt: str | None) -> str:
        return f'<span class="agenda-why">{_h(txt)}</span>' if txt else ""

    return f"""<div class="pb sec">
  <span class="slabel">Eerste managementspoor</span>
  <h2 style="margin-bottom:6px;">Gespreksagenda</h2>
  <p style="font-size:10.5px;color:#64748B;max-width:60ch;margin-bottom:16px;">
    Geen kant-en-klaar plan &mdash; een agenda voor de begeleide managementbespreking.</p>
  <div class="agenda-dark">
  <table class="steps"><tr>
    <td class="step"><div class="step-no">Primair thema</div><div class="step-body">{_h(primary_theme)}</div>{_why(primary_why)}</td>
    <td class="step"><div class="step-no">Tweede aandachtspunt</div><div class="step-body">{_h(second_point)}</div>{_why(second_why)}</td>
    <td class="step"><div class="step-no">Eigenaarschap</div><div class="step-fill"></div><div class="step-fill-hint">In te vullen tijdens de bespreking</div></td>
    <td class="step"><div class="step-no">Opnieuw bespreken</div><div class="step-body">{_h(review_when)}</div></td>
  </tr></table>
  <div class="agenda-opener">
    <div style="font-family:'JetBrains Mono', monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#E8A020;margin-bottom:7px;">Gespreksopener</div>
    <p style="margin-bottom:0;font-size:12.5px;line-height:1.6;color:#F4F1EA;">{_h(mgmt_q)}</p>
  </div>
  </div>
  <p class="trustline">Nog niet besluiten: of een verdieping of kortere vervolgmeting nodig is &mdash; dat volgt uit het gesprek.</p>
</div>"""
```

- [ ] **Step 5: Why-regels bouwen op de drie call-sites**

Direct vóór elke `s += _eerste_managementspoor(...)`-aanroep. **Retention** (regel ~1913, variabelen `_primary_fk`, `_primary_low_item`, `deep_agg`, `sorted_f` bestaan daar al):

```python
    _agg_p = deep_agg.get(_primary_fk) or {}
    _answered_p = _agg_p.get("answered", 0)
    _top_p = max((_agg_p.get("primary_counts") or {}).items(),
                 key=lambda kv: (kv[1], kv[0]), default=None)
    _primary_why = None
    if _primary_low_item:
        _primary_why = f"Laagste item in het cijferbeeld ({_primary_low_item[2]:.1f}/10)."
        if _top_p and _answered_p >= 5:
            _primary_why = (f"Laagste item in het cijferbeeld ({_primary_low_item[2]:.1f}/10); "
                            f"{_top_p[1]} van de {_answered_p} respondenten met verdieping "
                            f"kozen de meest gekozen toelichting.")
    _second_why = ("Tweede laagste factorscore in het overzichtsprofiel."
                   if len(sorted_f) > 1 else None)
```

en geef door: `primary_why=_primary_why, second_why=_second_why`. **Exit** identiek met `_ex_primary_low` i.p.v. `_primary_low_item` en `_ex_primary_fk`. **Onboarding**: zelfde met `_ob_primary_low`/`_ob_primary_fk`; onboarding heeft geen verdiepingsdata (`deep_agg` bestaat daar niet als variabele) — gebruik `_agg_p = (data.get("deepening_agg") or {}).get(_ob_primary_fk) or {}`; bij lege agg valt de regel automatisch terug op alleen het item + score-deel.

De `>= 5`-drempel spiegelt de bestaande verdiepingsstaffel (geen aantallen tonen onder n=5).

- [ ] **Step 6: Tests + volledige suite**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_report_design_sprong.py tests/test_report_html_design.py tests/test_pdf_redesign.py tests/test_deepening_report.py -v` → nieuwe tests PASS, bestaande groen (bestaande aanroepen zonder why-params → default None → identieke kaartinhoud). Daarna `pytest tests/ -q` → 25 failed = baseline.

- [ ] **Step 7: Commit**

```bash
git add backend/report_html.py backend/report_css.py tests/test_report_design_sprong.py
git commit -m "feat(rapport): gespreksagenda als navy anker met datagedreven waarom-eerst-regels"
```

---

### Task 3: Navy segmentconclusie (spec §2b)

**Files:**
- Modify: `backend/report_html.py` (`_segment_block`, regel ~879-895)
- Test: `tests/test_report_design_sprong.py`

- [ ] **Step 1: Failing test**

```python
def test_segmentconclusie_navy_blok():
    from backend.report_html import _segment_block
    rows = [
        {"department": "Marketing", "n": 5, "avg": 4.4, "scores": [4.4] * 5, "is_pooled": False},
        {"department": "Sales", "n": 6, "avg": 6.8, "scores": [6.8] * 6, "is_pooled": False},
    ]
    html = _segment_block(rows)
    assert "Startpunt voor de bespreking" in html
    assert "#0D1B2A" in html.split("Startpunt voor de bespreking")[0][-400:]
    # Pooled laagste rij: geen conclusieblok (bestaande voorwaarde blijft)
    rows_pooled = [
        {"department": "Overige afdelingen", "n": 6, "avg": 4.0, "scores": [4.0] * 6, "is_pooled": True},
        {"department": "Sales", "n": 6, "avg": 6.8, "scores": [6.8] * 6, "is_pooled": False},
    ]
    assert "Startpunt voor de bespreking" not in _segment_block(rows_pooled)
```

- [ ] **Step 2: Run test, verwacht FAIL**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_report_design_sprong.py::test_segmentconclusie_navy_blok -v` → FAIL.

- [ ] **Step 3: `low_note` vervangen**

In `_segment_block` (regel ~879-884), vervang:

```python
    lowest = segment_rows[0]
    low_note = ""
    if not lowest.get("is_pooled", False):
        low_note = (
            f'<div style="background:#0D1B2A;border-left:3px solid #E8A020;padding:14px 16px;margin-top:12px;">'
            f'<div style="font-family:\'JetBrains Mono\', monospace;font-size:9px;letter-spacing:0.14em;'
            f'text-transform:uppercase;color:#E8A020;margin-bottom:6px;">Startpunt voor de bespreking</div>'
            f'<p style="margin:0;font-size:11px;line-height:1.55;color:#F4F1EA;">'
            f'<strong>{_h(lowest["department"])}</strong> scoort het laagst '
            f'({lowest["avg"]:.1f}/10). Verschillen zijn gesprekstof, geen oordeel.</p></div>')
```

- [ ] **Step 4: Tests draaien**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_report_design_sprong.py tests/test_segment_report.py -v` → alles PASS. Let op: als een test in `test_segment_report.py` de oude `low_note`-zin ("logisch startpunt") pint, in lockstep bijwerken naar de nieuwe wording.

- [ ] **Step 5: Volledige suite + commit**

Run: `../../.venv/Scripts/python.exe -m pytest tests/ -q` → 25 failed = baseline.

```bash
git add backend/report_html.py tests/test_report_design_sprong.py tests/test_segment_report.py
git commit -m "feat(rapport): segmentconclusie als navy anker (Startpunt voor de bespreking)"
```

---

### Task 4: Genummerde hoofdstukken + vervolg-labels (spec §4)

**Files:**
- Modify: `backend/report_html.py` (nieuwe `_ChapterCounter`, alle sectiestarts in drie renderers)
- Modify: `backend/report_css.py` (`.ch-idx`, `.ch-rule`)
- Test: `tests/test_report_design_sprong.py`

- [ ] **Step 1: Failing tests**

```python
def test_hoofdstuknummers_oplopend_zonder_gaten():
    import re
    html = render_retention_report_html(_min_retention_data())
    nums = [int(m) for m in re.findall(r'class="ch-idx">(\d{2})<', html)]
    assert nums == list(range(1, len(nums) + 1)), f"nummering met gaten: {nums}"
    assert nums, "geen hoofdstuknummers gevonden"


def test_verdieping_vervolg_label():
    d = _min_retention_data()
    html = render_retention_report_html(d)
    # Bij >1 verdiepingsfactor: eerste = hoofdstukstart, volgende = vervolg.
    if html.count("Verdieping &mdash;") > 1:
        assert "VERDIEPING — VERVOLG" in html.upper() or "vervolg" in html
```

(Tweede test is conditioneel op de fixture; als `_min_retention_data()` maar één verdiepingsfactor oplevert, de fixture in de test verrijken met een tweede factor of de assert op de fixture-realiteit aanpassen — geen productie-code omwijzigen voor de test.)

- [ ] **Step 2: Run tests, verwacht FAIL**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_report_design_sprong.py -v` → FAIL (geen `ch-idx`).

- [ ] **Step 3: CSS**

In `backend/report_css.py`, direct ná het `.slabel::after`-blok (regel ~77):

```python
/* ── Hoofdstuknummering (designsprong §4) ── */
.ch-idx { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 700;
  color: """ + r"""#E8A020; line-height: 1; margin-bottom: 6px; }
.ch-rule { border: none; border-top: 3px solid #0D1B2A; width: 48px;
  margin: 0 0 12px 0; }
```

(Amber hier bewust hardcoded `#E8A020` — zelfde merk-amber voor alle scans, niet het per-scan accent.)

- [ ] **Step 4: `_ChapterCounter`-helper**

In `backend/report_html.py`, direct boven `_bestuurlijke_read` (regel ~379):

```python
class _ChapterCounter:
    """Afgeleide hoofdstuknummering (designsprong §4): elke renderer maakt één
    instantie en roept opener() aan op het moment dat een sectie daadwerkelijk
    wordt geëmit — conditionele secties schuiven zo op zonder gaten.
    vervolg() geeft het compacte label voor doorlooppagina's (verdieping 2+)."""

    def __init__(self) -> None:
        self.n = 0

    def opener(self, eyebrow: str) -> str:
        self.n += 1
        return (f'<div class="ch-idx">{self.n:02d}</div><hr class="ch-rule">'
                f'<span class="slabel">{eyebrow}</span>')

    @staticmethod
    def vervolg(eyebrow: str) -> str:
        return f'<span class="slabel">{eyebrow} &mdash; vervolg</span>'
```

- [ ] **Step 5: Toepassen in de drie renderers**

Per renderer: `ch = _ChapterCounter()` direct na de datavariabelen, vóór de bestuurlijke read. Vervang daarna per **hoofdstukstart** de `<span class="slabel">X</span>` door `{ch.opener("X")}` — in helpers die een sectie openen gaat de opener-HTML als parameter mee. Concreet:

1. `_bestuurlijke_read` krijgt extra param `opener_html: str` en gebruikt die i.p.v. de hardcoded slabel-regel: `{opener_html}` op de plek van `<span class="slabel">Bestuurlijke read</span>`. Call-sites: `opener_html=ch.opener("Bestuurlijke read")`.
2. Context-secties: `_vertrekcontext` / `_behoudscontext` / `_checkpointoverzicht` krijgen dezelfde `opener_html: str`-param (default `""` → dan de bestaande slabel-regel behouden voor backwards-compat in tests): bij default lege string rendert de functie zijn huidige `<span class="slabel">…</span>`, anders de meegegeven opener. Onboarding: `_checkpointoverzicht` is de hoofdstukstart; `_landingskwaliteit` op dezelfde pagina-reeks houdt zijn gewone slabel (geen eigen hoofdstuk).
3. `_overzichtsprofiel`: zelfde `opener_html`-param-patroon; retention/exit/onboarding geven `ch.opener("Overzichtsprofiel")` mee. NB: overzichtsprofiel is een eigen hoofdstuk (de ruggengraat uit de spec noemt 01 Overzicht = openingspagina; overzichtsprofiel telt gewoon mee als volgend nummer — nummers zijn afgeleid, de spec-ruggengraat is illustratief, niet normatief).
4. `_eerste_managementspoor`: zelfde patroon (`opener_html`-param, call-site `ch.opener("Eerste managementspoor")`).
5. Verdieping: in de factor-loops (exit `_factor_detail`, retention `_ret_factor_detail`, onboarding-equivalent) krijgt de **eerste** factor `ch.opener(f"Verdieping — {lbl}")` en elke volgende `_ChapterCounter.vervolg(f"Verdieping — {lbl}")`. Implementatie: de loop geeft een `is_first: bool` of de opener-string door aan de detail-functie.
6. Werkbeleving (SDT-sectie), eNPS (alleen indien beschikbaar — de sectie bestaat anders niet meer sinds `8757b7cb`), Segmentanalyse (in `_segment_block`: `opener_html`-param met default `""`), Open toelichtingen, Appendix (eerste sectie; de appendix is één doorlopende sectie dus geen vervolg-label), Methodiek: allemaal `ch.opener(...)` op de bestaande slabel-plek.

Werkwijze: per renderer top-down door de `s +=`-reeks lopen; elke `<div class="pb sec">`-start is een hoofdstukstart behalve de verdieping-factoren 2+.

- [ ] **Step 6: Tests draaien**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_report_design_sprong.py tests/test_report_html_design.py tests/test_pdf_redesign.py tests/test_segment_report.py -v` → PASS. Bestaande tests die `<span class="slabel">Bestuurlijke read</span>`-achtige strings letterlijk pinnen: in lockstep bijwerken (de slabel-tekst zelf blijft bestaan, er komt alleen ch-idx/ch-rule vóór).

- [ ] **Step 7: Volledige suite + commit**

Run: `../../.venv/Scripts/python.exe -m pytest tests/ -q` → 25 failed = baseline.

```bash
git add backend/report_html.py backend/report_css.py tests/
git commit -m "feat(rapport): genummerde hoofdstukken met afgeleide telling en vervolg-labels"
```

---

### Task 5: Samples + WeasyPrint-validatie + visuele check

**Files:**
- Modify: `docs/examples/*.{html,pdf}`, `frontend/public/examples/*.{html,pdf}`

- [ ] **Step 1: Samples regenereren**

```bash
../../.venv/Scripts/python.exe generate_voorbeeldrapport.py exit
../../.venv/Scripts/python.exe generate_voorbeeldrapport.py retention
../../.venv/Scripts/python.exe generate_voorbeeldrapport.py onboarding
```

- [ ] **Step 2: WeasyPrint-render (PowerShell — Git Bash breekt de volume-mount)**

```powershell
$repo = "<WORKTREE-PAD>"
$files = @("voorbeeldrapport_loep", "voorbeeldrapport_retentiescan", "voorbeeldrapport_onboarding")
foreach ($f in $files) {
  $out = docker run --rm -v "${repo}\docs\examples:/data" ghcr.io/weasyprint/weasyprint "/data/$f.html" "/data/$f.pdf" 2>&1
  $lines = $out | Where-Object { $_ -ne $null -and $_.ToString().Trim() -ne "" }
  Write-Output "$f => exit $LASTEXITCODE, output lines: $($lines.Count)"
}
```

Expected: 3× exit 0, 0 output lines (= 0 warnings).

- [ ] **Step 3: Tekst- en pagineringschecks**

```bash
../../.venv/Scripts/python.exe -c "
import fitz
for name in ['voorbeeldrapport_loep', 'voorbeeldrapport_retentiescan', 'voorbeeldrapport_onboarding']:
    doc = fitz.open(f'docs/examples/{name}.pdf')
    full = '\n'.join(p.get_text() for p in doc)
    assert 'p.03' not in full, f'{name}: p.03-verwijzing over'
    assert '01' in full and '02' in full, f'{name}: hoofdstuknummers missen'
    assert 'Startpunt voor de bespreking' in full or 'Segmentverschillen zijn niet getoond' in full, name
    print(name, len(doc), 'pages OK')
"
```

Expected: retention/exit 14 pages (was 15), onboarding 14 (was 15).

- [ ] **Step 4: Raster-inspectie gewijzigde pagina's**

Render de openingspagina, agendapagina en segmentpagina van de retention-PDF als PNG (≥150 dpi via PyMuPDF `page.get_pixmap(dpi=150)`) en bekijk ze: (a) responsbasis-band past onder de bestuurlijke read zonder overlap; (b) agendablok is één navy vlak, tekst leesbaar, waarom-regels aanwezig; (c) segmentconclusie navy met amber label; (d) hoofdstuknummer + rule netjes boven de kop, geen dubbele slabel.

- [ ] **Step 5: Kopiëren, volledige suite, commit**

```bash
cp docs/examples/voorbeeldrapport_loep.pdf docs/examples/voorbeeldrapport_retentiescan.pdf docs/examples/voorbeeldrapport_onboarding.pdf frontend/public/examples/
../../.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | tail -2
```

Expected: 25 failed = baseline.

```bash
git add generate_voorbeeldrapport.py docs/examples/ frontend/public/examples/
git commit -m "chore(samples): voorbeeldrapporten geregenereerd met designsprong (WeasyPrint 0 warnings)"
```

---

## Na afronding (handmatig, buiten dit plan)

1. Push → Vercel deployt de sample-PDF's; **Railway-redeploy** voor de backend-Python.
2. Geen migratie nodig.

## Zelfreview-notities (verwerkt)

- Spec §1 randgeval (band mag doorbreken): afgedekt — alleen de statregel is `no-break`, de sectie zelf niet.
- Spec §4 "appendix doorloop = vervolg": de appendix is één doorlopende sectie zonder eigen `pb sec` per pagina — er is server-side geen paginagrens om een vervolg-label aan te hangen; alleen de verdieping (aparte sectie per factor) krijgt vervolg-labels. Bewuste afwijking, genoteerd.
- Spec-ruggengraat (01 Overzicht … 09 Methodiek) is illustratief; de telling is afgeleid van de daadwerkelijk geëmitte secties, dus per scan-type/conditie kunnen aantallen verschillen — dat is de bedoeling.
- `_short_mgmt_q`/`_deepening_mgmt_q`-logica blijft onaangeraakt; de why-regels gebruiken uitsluitend `deepening_agg[fk]["answered"]`/`["primary_counts"]` die de renderer al heeft.
