# Rapport-leesbaarheidsronde Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Het WeasyPrint-rapport legt zichzelf uit en presenteert het bewijs vóór de agenda: agenda naar het slot, ruime zelfuitleg-laag per sectie, factorlabel-fix, full-bleed chalk, "Zo gebruik je dit rapport"-blok en een logische paginatitel-hiërarchie.

**Architecture:** Alle wijzigingen in `backend/report_html.py` (labelmap, `_ChapterCounter`, sectie-helpers, drie renderers, nieuwe intro-tekstconstanten) en `backend/report_css.py`. Geen datalaag-wijzigingen. Spec: `docs/superpowers/specs/2026-07-13-rapport-leesbaarheidsronde-design.md`.

**Tech Stack:** Python 3.14, pytest, WeasyPrint via Docker (`ghcr.io/weasyprint/weasyprint`, PowerShell op Windows), PyMuPDF voor raster-inspectie.

**Baselines (na elke task exact zo):** `../../.venv/Scripts/python.exe -m pytest tests/ -q` → **25 failed** (pre-existent), 5 skipped, passed groeit alleen door nieuwe tests.

**WeasyPrint-kaders:** geen CSS custom properties, geen `gap` op flex, geen `inset`-shorthand; kleuren via directe hex-interpolatie.

**Regelnummers** = stand na commit `ba47dd71`. Verifieer met grep vóór elke edit; de nummers verschuiven per task.

---

## Bestandenkaart

- `backend/report_html.py` — labelmaps (~70-95), `_ChapterCounter` (~379), `_bestuurlijke_read` (~398), `_eerste_managementspoor` (~542), sectie-helpers, drie renderers (exit ~1490, retention ~1855, onboarding ~2280). Nieuw: `SECTION_INTROS`-constanten + `_intro()`-helper.
- `backend/report_css.py` — `@page`-achtergrond, nieuwe `.ch-title`/`.ch-kicker`/`.sec-intro`, `body`-achtergrond weg.
- `tests/test_report_leesbaarheid.py` — NIEUW, alle nieuwe asserts.
- Bestaande design-tests in lockstep (o.a. `test_report_design_sprong.py` pint opener-markup en sectievolgorde).

---

### Task 1: Paginatitel-hiërarchie (spec §6)

**Files:**
- Modify: `backend/report_html.py` (`_ChapterCounter.opener`, alle ~30 `ch.opener(...)`-call-sites, interne h2's in `_behoudscontext`/`_eerste_managementspoor`)
- Modify: `backend/report_css.py` (`.ch-title`, `.ch-kicker`)
- Test: `tests/test_report_leesbaarheid.py` (nieuw)

- [ ] **Step 1: Failing tests**

Maak `tests/test_report_leesbaarheid.py`:

```python
"""Leesbaarheidsronde rapport (spec: 2026-07-13-rapport-leesbaarheidsronde-design.md)."""
from tests.test_report_distribution import _min_retention_data
from backend.report_html import render_retention_report_html


def test_opener_heeft_grote_titel_geen_mono_slabel():
    from backend.report_html import _ChapterCounter
    ch = _ChapterCounter()
    html = ch.opener("Overzichtsprofiel")
    assert '<h2 class="ch-title">Overzichtsprofiel</h2>' in html
    assert 'class="slabel"' not in html


def test_opener_met_kicker():
    from backend.report_html import _ChapterCounter
    ch = _ChapterCounter()
    html = ch.opener("Gespreksagenda", kicker="Eerste managementspoor")
    assert '<span class="ch-kicker">Eerste managementspoor</span>' in html
    assert '<h2 class="ch-title">Gespreksagenda</h2>' in html


def test_vervolg_blijft_klein_mono():
    from backend.report_html import _ChapterCounter
    html = _ChapterCounter.vervolg("Verdieping — Werkdruk")
    assert 'class="slabel"' in html and "vervolg" in html
```

- [ ] **Step 2: Run, verwacht FAIL**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_report_leesbaarheid.py -v` → FAIL (geen `ch-title`, geen `kicker`-param).

- [ ] **Step 3: CSS**

In `backend/report_css.py`, direct ná het `.ch-rule`-blok (~regel 83):

```python
.ch-kicker { display: block; font-family: 'JetBrains Mono', monospace; font-size: 9px;
  letter-spacing: 0.14em; text-transform: uppercase; color: """ + STEEL + r"""; margin-bottom: 5px; }
.ch-title { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 21px;
  letter-spacing: -0.03em; color: """ + INK + r"""; line-height: 1.1; margin-bottom: 14px; }
```

- [ ] **Step 4: `_ChapterCounter.opener` herbouwen**

```python
    def opener(self, title: str, kicker: str | None = None) -> str:
        self.n += 1
        kicker_html = f'<span class="ch-kicker">{kicker}</span>' if kicker else ""
        return (f'<div class="ch-idx">{self.n:02d}</div><hr class="ch-rule">'
                f'{kicker_html}<h2 class="ch-title">{title}</h2>')
```

`vervolg()` blijft ongewijzigd (slabel, klein mono — bewust geen hoofdstuk).

- [ ] **Step 5: Call-sites + interne h2's**

Titels krijgen normale kapitalisatie (geen uppercase-transform meer). Mapping per call-site (alle drie renderers, zelfde patroon):

| Huidige opener-string | Nieuw |
|---|---|
| `"Bestuurlijke read"` | `ch.opener("Bestuurlijke read")` (ongewijzigd argument) |
| `"Vertrekcontext"` / `"Behoudscontext"` / `"Checkpointoverzicht"` | de interne h2 van de helper wordt de titel: `ch.opener("Waar staat behoud onder druk?", kicker="Behoudscontext")` (retention); exit/onboarding analoog — lees de helper en gebruik zijn h2-tekst als titel, het oude label als kicker. **Verwijder de interne `<h2>`-regel in de helper** zodat er geen dubbele kop staat. |
| `"Overzichtsprofiel"` | ongewijzigd argument |
| `"Eerste managementspoor"` | `ch.opener("Gespreksagenda", kicker="Eerste managementspoor")`; **verwijder de interne `<h2 ...>Gespreksagenda</h2>`-regel in `_eerste_managementspoor`** |
| `f"Verdieping — {_lbl}"` | ongewijzigd argument (titel = "Verdieping — {label}") |
| `"Werkbeleving — autonomie, competentie &amp; verbondenheid"` | `ch.opener("Werkbeleving", kicker="Autonomie, competentie &amp; verbondenheid")` |
| `"Werkgeversaanbeveling"` | ongewijzigd |
| `"Segmentanalyse &mdash; per afdeling"` / `"Segmentanalyse"` | `ch.opener("Segmentanalyse per afdeling")` resp. `ch.opener("Segmentanalyse")` |
| `f"Open toelichtingen &mdash; {len(texts)} ...stemmen"` | `ch.opener(f"Open toelichtingen", kicker=f"{len(texts)} respondentstemmen")` (exit) / `"medewerkersstemmen"` (retention/onboarding) |
| `"Appendix — volledige vraagresultaten"` | `ch.opener("Appendix", kicker="Volledige vraagresultaten")` |
| `"Methodiek, privacy &amp; interpretatiegrenzen"` | `ch.opener("Methodiek, privacy &amp; interpretatiegrenzen")` |
| `"Verdieping — prioritaire factoren"` (fallback-kaart) | ongewijzigd argument |

Helpers met `opener_html`-param blijven werken (ze krijgen de nieuwe HTML-string aangereikt; hun `opener_html or '<span class="slabel">…'`-fallback blijft voor tests die ze zonder param aanroepen).

- [ ] **Step 6: Tests + lockstep**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_report_leesbaarheid.py tests/test_report_design_sprong.py tests/test_report_html_design.py tests/test_pdf_redesign.py -v`.
`test_report_design_sprong.py::test_hoofdstuknummers_oplopend_zonder_gaten` gebruikt regex `class="ch-idx">(\d{2})<` — blijft werken. Tests die `<span class="slabel">Bestuurlijke read</span>`-markup of de interne h2's pinnen: in lockstep bijwerken naar `ch-title`-markup.

- [ ] **Step 7: Volledige suite + commit**

Run: `../../.venv/Scripts/python.exe -m pytest tests/ -q` → 25 failed = baseline.

```bash
git add backend/report_html.py backend/report_css.py tests/
git commit -m "feat(rapport): paginatitel in kopstijl met optionele kicker (titelhierarchie)"
```

---

### Task 2: Gespreksagenda naar het slot (spec §1)

**Files:**
- Modify: `backend/report_html.py` (drie renderers: agenda-blok verplaatsen)
- Test: `tests/test_report_leesbaarheid.py`

- [ ] **Step 1: Failing test**

```python
def test_agenda_na_bewijs_voor_appendix():
    html = render_retention_report_html(_min_retention_data())
    agenda = html.find("Gespreksagenda")
    appendix = html.find("Appendix")
    werkbeleving = html.find("Werkbeleving")
    assert -1 not in (agenda, appendix, werkbeleving)
    assert werkbeleving < agenda < appendix, "agenda moet na het bewijs en voor de appendix staan"
```

- [ ] **Step 2: Run, verwacht FAIL** (agenda staat nu vóór de verdieping).

- [ ] **Step 3: Blok verplaatsen (per renderer)**

In elke renderer: knip het volledige agenda-blok — vanaf de `# ── Eerste managementspoor`-commentregel t/m de afsluitende `)` van `s += _eerste_managementspoor(...)` (inclusief de opbouw van `_direction_q`/`_enriched_q`/`_primary_theme*`/`_primary_why`/`_second_why` die er direct boven staat) — en plak het ná de Open toelichtingen-sectie en vóór de Appendix-sectie. Alle variabelen die het blok gebruikt (`deep_agg`, `sorted_f`, `fa`, `oim`, `fim`, `nsp`) zijn eerder in de renderer gedefinieerd; verifieer per renderer dat er géén variabele in het blok zit die pas later gedefinieerd wordt (er is er geen — de verdieping-loop gebruikt zijn eigen `priority_fkeys`). De hoofdstuknummering volgt automatisch (afgeleide telling).

Exit: blok bij ~1608-1648. Retention: ~1978-2021. Onboarding: ~2385-2424. Let op de retention-variant gebruikt `_ret_priority_fkeys`, exit `priority_fkeys` (het agenda-blok van exit definieert die vóór de verdieping-loop hem opnieuw definieert — na verplaatsing definieert het agenda-blok hem ná de loop opnieuw; hernoem in het verplaatste exit-blok de lokale variabele naar `_ag_priority_fkeys` om schaduwen/verwarring te voorkomen).

- [ ] **Step 4: Tests**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_report_leesbaarheid.py tests/test_report_design_sprong.py -v`. Bestaande volgorde-tests (bijv. "Vertrekcontext vóór Eerste managementspoor" in `test_report_html_design.py`) blijven waar; tests die agenda-vóór-verdieping pinnen in lockstep bijwerken.

- [ ] **Step 5: Volledige suite + commit**

```bash
git add backend/report_html.py tests/
git commit -m "feat(rapport): gespreksagenda naar het slot - bewijs eerst, agenda als finale"
```

---

### Task 3: Factorlabel → "Groeiperspectief" (spec §3)

**Files:**
- Modify: `backend/report_html.py:82` (`_FACTOR_RETENTION_LABEL`)
- Test: `tests/test_report_leesbaarheid.py`

- [ ] **Step 1: Failing test**

```python
def test_geen_erkenning_label_meer():
    html = render_retention_report_html(_min_retention_data())
    assert "Groeiperspectief en erkenning" not in html
```

NB: `_min_retention_data()` heeft alleen `workload` — verrijk de test met `d["factor_avgs"] = {"workload": 5.0, "growth": 4.5}` + bijbehorende `factor_items_map`/`org_item_avgs`-entries (zelfde patroon als `test_verdieping_vervolg_label`) zodat het growth-label echt rendert, en assert daarna ook `"Groeiperspectief" in html`.

- [ ] **Step 2: Run, verwacht FAIL.**

- [ ] **Step 3: Eén regel wijzigen**

`backend/report_html.py` regel ~82: `"growth": "Groeiperspectief en erkenning",` → `"growth": "Groeiperspectief",`. De exit-map (~74) heeft dit al; de onboarding-map ("Ontwikkelruimte en eerste succeservaring") blijft — dat label past bij de onboarding-stellingen. Grep daarna op `"Groeiperspectief en erkenning"` in `backend/` en `tests/`: resterende treffers in deepening-sets/`report.py` alleen aanpassen als ze klant-zichtbaar in de drie WeasyPrint-rapporten of de survey renderen (verifieer met een render + grep; de survey gebruikt `scoring_config.py` dat al "Groeiperspectief" zegt).

- [ ] **Step 4: Tests + lockstep** (tests die het oude label pinnen bijwerken; o.a. `test_deepening_report.py` en `test_direction_report_html.py` kunnen de factor-naam in verwachte strings hebben).

- [ ] **Step 5: Volledige suite + commit**

```bash
git add backend/report_html.py tests/
git commit -m "fix(rapport): factorlabel Groeiperspectief - erkenning wordt niet gemeten"
```

---

### Task 4: Full-bleed chalk (spec §4)

**Files:**
- Modify: `backend/report_css.py` (`@page`, `body`)
- Test: `tests/test_report_leesbaarheid.py`

- [ ] **Step 1: Failing test**

```python
def test_page_achtergrond_is_chalk():
    from backend.report_css import build_css, CHALK
    css = build_css("retention")
    import re
    page_rule = re.search(r'@page\s*\{[^}]*\}', css, re.S).group(0)
    assert CHALK in page_rule, "@page moet de chalk-achtergrond dragen (full-bleed)"
```

- [ ] **Step 2: Run, verwacht FAIL.**

- [ ] **Step 3: CSS aanpassen**

In `build_css`: voeg `background: """ + CHALK + r""";` toe binnen het `@page { ... }`-blok (na de `margin`-regel), en verwijder de `background: """ + CHALK + r""";`-regel uit `body { ... }` (regel ~57). De cover gebruikt `page: cover-page` (eigen `@page cover-page { margin: 0; }`) mét een navy `.cover`-div van 297mm — geef `@page cover-page` óók expliciet `background: """ + NAVY + r""";` zodat er geen chalk-randje om de cover verschijnt.

- [ ] **Step 4: Tests + render-sanity**

Run de test. Render daarna één sample lokaal (HTML volstaat niet voor `@page` — dit is juist het punt dat alleen in WeasyPrint zichtbaar wordt; de echte visuele check gebeurt in Task 7, noteer dat expliciet in de taakrapportage).

- [ ] **Step 5: Volledige suite + commit**

```bash
git add backend/report_css.py tests/
git commit -m "feat(rapport): full-bleed chalk-achtergrond via @page"
```

---

### Task 5: Zelfuitleg-laag + bronregel managementvraag (spec §2)

**Files:**
- Modify: `backend/report_html.py` (nieuwe `SECTION_INTROS`, `_intro()`, alle sectie-openers, `_bestuurlijke_read` bronregel-param, drie renderers)
- Modify: `backend/report_css.py` (`.sec-intro`)
- Test: `tests/test_report_leesbaarheid.py`

- [ ] **Step 1: Failing tests**

```python
def test_sectie_intros_aanwezig():
    d = _min_retention_data()
    html = render_retention_report_html(d)
    for frase in [
        "samenvattende groepsscore",          # behoudscontext: opbouw behoudssignaal
        "drie stellingen over hetzelfde thema", # overzichtsprofiel: wat is een factor
        "basisbehoeften",                       # werkbeleving/SDT: waarom gemeten
        "ontvangstvolgorde",                    # open toelichtingen: selectie
    ]:
        assert frase in html, f"sectie-intro mist: {frase}"


def test_bronregel_managementvraag():
    from backend.report_html import _bestuurlijke_read
    html = _bestuurlijke_read(
        kernzin="K.", totaalbeeld="T.", primary_label="Groeiperspectief",
        primary_score=5.1, primary_color="#C17C00", why_cells_html="",
        strong_label="Rolhelderheid", strong_score=7.2, mgmt_q="Vraag?",
        mgmt_q_source="Gebaseerd op de meest gekozen toelichting van respondenten in de verdieping.")
    assert "meest gekozen toelichting" in html
```

- [ ] **Step 2: Run, verwacht FAIL.**

- [ ] **Step 3: CSS**

Na `.ch-title` in `report_css.py`:

```python
.sec-intro { font-size: 10.5px; color: #4A5B6E; line-height: 1.7; max-width: 72ch;
  margin: -4px 0 18px; }
.mq-source { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.04em;
  color: """ + STEEL + r"""; margin-top: 5px; display: block; }
```

- [ ] **Step 4: Intro-teksten als constanten**

Boven `_ChapterCounter` in `report_html.py`. Toon: uitleggend en zelfverzekerd, ruim (spec: minimaal 2-4 zinnen, meer mag), geen disclaimers. Teksten integraal:

```python
# ─── Zelfuitleg-laag (spec 2026-07-13 §2) ────────────────────────────────────
# Elke sectie legt zichzelf uit: wat zie je, waarom meten we dit, hoe lees je
# het. Uitleg is een vertrouwensdrager — ruim en helder, geen disclaimers.

SECTION_INTROS: dict[str, str] = {
    "behoudscontext": (
        "Het behoudssignaal is een samenvattende groepsscore: de werkfactoren uit het "
        "overzichtsprofiel en de werkbeleving samen, teruggebracht tot &eacute;&eacute;n getal "
        "tussen 1 en 10. Onder de 5,0 noemen we een score kwetsbaar, tussen 5,0 en 6,5 een "
        "aandachtspunt, vanaf 6,5 relatief sterk. De drie signalen daaronder geven context: "
        "blijfintentie en vertrekintentie zijn geen spiegelbeeld van elkaar &mdash; iemand kan "
        "beide tegelijk voelen &mdash; en bevlogenheid staat daar los van: bevlogen medewerkers "
        "vertrekken soms toch. Lees dit als startpunt voor het gesprek, niet als voorspelling "
        "van wie vertrekt."
    ),
    "vertrekcontext": (
        "Deze pagina zet de vertrekredenen op een rij zoals vertrokken medewerkers ze zelf "
        "opgaven: eerst de hoofdreden, daarna wat er volgens hen meespeelde. Samen met de "
        "factorscores verderop laat dit zien of de opgegeven redenen en het bredere werkbeeld "
        "hetzelfde verhaal vertellen. Lees dit als de context waarin de rest van het rapport "
        "staat: het beschrijft waarom mensen zeggen te vertrekken, niet wie er nog zal vertrekken."
    ),
    "checkpointoverzicht": (
        "De checkpointscore vat samen hoe nieuwe medewerkers hun eerste werkperiode ervaren: "
        "de landingsdomeinen uit dit rapport samengebracht tot &eacute;&eacute;n getal tussen "
        "1 en 10. Onder de 5,0 noemen we een score kwetsbaar, tussen 5,0 en 6,5 een "
        "aandachtspunt, vanaf 6,5 relatief sterk. Dit is een momentopname van de landing &mdash; "
        "een startpunt voor het gesprek over onboarding, geen beoordeling van individuele "
        "starters of hun begeleiders."
    ),
    "overzichtsprofiel": (
        "Elke factor hieronder is een thema, gemeten met drie stellingen over hetzelfde thema; "
        "de score is het groepsgemiddelde daarvan. De kleuren volgen vaste drempels &mdash; "
        "kwetsbaar (onder 5,0), aandachtspunt (5,0 tot 6,5), relatief sterk (vanaf 6,5) &mdash; "
        "en zijn geen vergelijking met andere organisaties. Belangrijker dan de absolute kleur "
        "is de rangorde: de factor die binnen jullie eigen beeld het laagst scoort, is het "
        "logische begin van het gesprek."
    ),
    "verdieping": (
        "Respondenten die laag scoorden op dit thema kregen automatisch een korte vervolgvraag: "
        "welke toelichting past het best bij hun ervaring, en welke richting zou het gesprek "
        "hierover het meest helpen? De aantallen hieronder zijn tellingen van wat respondenten "
        "zelf kozen &mdash; geen interpretatie achteraf. Zo zie je niet alleen d&aacute;t een "
        "thema laag scoort, maar ook wat de groep zelf als reden en als gespreksrichting aandraagt."
    ),
    "werkbeleving": (
        "Naast de werkfactoren meten we drie psychologische basisbehoeften: autonomie (regie "
        "over de eigen werkwijze), competentie (ervaren bekwaamheid) en verbondenheid (de band "
        "met collega's en organisatie). Onderzoek naar werkmotivatie laat consistent zien dat "
        "deze drie bepalen hoe duurzaam iemand op zijn plek zit &mdash; werkfactoren alleen "
        "vertellen niet het hele verhaal. Een lage werkfactor met een gezonde werkbeleving "
        "vraagt een ander gesprek dan wanneer beide onder druk staan."
    ),
    "werkgeversaanbeveling": (
        "De aanbevelingsscore (eNPS) meet &eacute;&eacute;n ding: zouden medewerkers deze "
        "organisatie aanraden als werkgever? De score loopt van &minus;100 tot +100 en is het "
        "verschil tussen het aandeel uitgesproken aanraders en het aandeel criticasters. "
        "Gebruik dit als aanvullende context naast het overzichtsprofiel: het zegt iets over "
        "het totaalgevoel, de factoren zeggen waar dat gevoel vandaan komt."
    ),
    "segmentanalyse": (
        "Deze tabel splitst het beeld uit per afdeling: het aantal ingevulde vragenlijsten "
        "tegenover het aantal uitgenodigden, de gemiddelde score en &mdash; bij voldoende "
        "responses &mdash; de spreiding. Afdelingen met minder dan vijf responses worden "
        "gebundeld onder &ldquo;Overige afdelingen&rdquo;, zodat antwoorden nooit herleidbaar "
        "zijn tot personen. Verschillen tussen afdelingen zijn gesprekstof: ze vertellen waar "
        "je als eerste gaat kijken, niet welke afdeling het &ldquo;slecht doet&rdquo;."
    ),
    "open_toelichtingen": (
        "Dit zijn de open antwoorden zoals respondenten ze zelf schreven, alleen ontdaan van "
        "namen en contactgegevens. Ze staan in ontvangstvolgorde &mdash; er is niet geselecteerd "
        "op inhoud en er is geen automatische duiding op losgelaten. De stemmen hieronder geven "
        "kleur aan de cijfers; wat ze betekenen en hoe zwaar ze wegen, bepaal je in de bespreking."
    ),
    "appendix": (
        "Hier staat elke stelling met haar groepsgemiddelde &mdash; de volledige onderbouwing "
        "van de factorscores eerder in dit rapport. Gebruik deze pagina's om te controleren "
        "waar een factorscore vandaan komt of om een specifieke stelling terug te vinden die "
        "in de bespreking ter sprake komt."
    ),
    "gespreksagenda": (
        "Alles wat je tot hier las is de onderbouwing; hier begint het gesprek. Deze agenda "
        "vat samen wat als eerste op tafel hoort, waarom juist dat, en wanneer je erop "
        "terugkomt. Het is bewust geen kant-en-klaar actieplan: de keuzes &mdash; wat pakken "
        "we op, wie is eigenaar &mdash; maak je in de begeleide managementbespreking, met dit "
        "rapport als gedeelde basis."
    ),
}


def _intro(key: str) -> str:
    return f'<p class="sec-intro">{SECTION_INTROS[key]}</p>'
```

- [ ] **Step 5: Intro's plaatsen + oude subtitels laten opgaan**

Per sectie, in alle drie renderers (of in de gedeelde helper waar de sectie-body vandaan komt): direct ná de opener `{_intro("...")}` renderen, en de bestaande korte subtitel-`<p>` van die sectie verwijderen zodat er geen dubbele intro staat. Concreet te vervangen bestaande regels:

- `_behoudscontext`: de subtitel "Vier signalen op groepsniveau…" én de legenda-`<p>` onderaan ("Behoudssignaal meet condities…") vervallen — beide gaan op in `_intro("behoudscontext")`.
- `_vertrekcontext` (exit): bestaande subtitel vervalt → `_intro("vertrekcontext")`.
- `_checkpointoverzicht` (onboarding): idem → `_intro("checkpointoverzicht")`.
- Overzichtsprofiel: de voetregel "Banden zijn vaste schaaldrempels, geen benchmark…" vervalt (gaat op in de intro); de gegenereerde samenvattingszin ("Geen factor scoort kritisch…") blijft — dat is data, geen uitleg.
- Verdieping: `_intro("verdieping")` alleen op de **eerste** verdiepingspagina (geef een `intro_html`-param door aan de factor-detail-functie, gevuld bij `_i == 0`).
- Werkbeleving/SDT: bestaande subtitel ("Drie basisbehoeften die de onderliggende werkbeleving meten…") vervalt → `_intro("werkbeleving")`.
- eNPS: de bestaande card-tekst ("Aanvullende context naast het overzichtsprofiel…") vervalt → `_intro("werkgeversaanbeveling")`.
- Segmentanalyse: `_intro("segmentanalyse")` bovenaan `_segment_block`; de bestaande trustline onderaan ("Alleen afdelingen met minimaal 5 responses…") vervalt — inhoud zit nu in de intro.
- Open toelichtingen: `_intro("open_toelichtingen")`; de "Getoond: de eerste N…"-conditionele notitie in `_themed_quotes` blijft (dat is een datamelding).
- Appendix: `_intro("appendix")`; de bestaande technische regel ("Technische onderbouwing. Scores zijn groepsgemiddelden…") vervalt behalve het n=… en ↩-legend-deel — behoud dat als aparte kleine regel ná de intro.
- Gespreksagenda: de bestaande subtitel "Geen kant-en-klaar plan…" vervalt → `_intro("gespreksagenda")`.

- [ ] **Step 6: Bronregel managementvraag**

`_bestuurlijke_read` krijgt param `mgmt_q_source: str = ""`; render binnen `.mq-line` ná de vraag: `{f'<span class="mq-source">{_h(mgmt_q_source)}</span>' if mgmt_q_source else ''}`. In de drie renderers bij de aanroep: als de vraag uit `_deepening_mgmt_q`/`_short_mgmt_q`/`_direction_agenda_line` kwam (verdiepingsdata) → `"Gebaseerd op de meest gekozen toelichting van respondenten in de verdieping."`; bij de generieke fallback → `"Gebaseerd op de laagst scorende factor."`. De renderers weten al welke bron gebruikt is (het `or`-patroon: `br_mgmt_q = _short_mgmt_q(...) or _mgmt_q(...)` — splits dat in een expliciete if/else zodat de bron bekend is).

- [ ] **Step 7: Tests + volledige suite**

Run: `../../.venv/Scripts/python.exe -m pytest tests/test_report_leesbaarheid.py tests/test_report_design_sprong.py tests/test_report_html_design.py tests/test_pdf_redesign.py tests/test_segment_report.py tests/test_deepening_report.py -v`. Tests die de geschrapte subtitels/trustlines pinnen (o.a. `test_segmentblok_gerenderd_bij_data` assert "minimaal 5 responses" — nu in de intro; controleer dat de frase behouden blijft of werk de assert bij) in lockstep. Daarna volledige suite → 25 failed.

- [ ] **Step 8: Commit**

```bash
git add backend/report_html.py backend/report_css.py tests/
git commit -m "feat(rapport): zelfuitleg-laag per sectie + bronregel bij de managementvraag"
```

---

### Task 6: "Zo gebruik je dit rapport"-blok (spec §5)

**Files:**
- Modify: `backend/report_html.py` (`_gebruiksblok()`, `_bestuurlijke_read`-integratie, drie renderers)
- Test: `tests/test_report_leesbaarheid.py`

- [ ] **Step 1: Failing test**

```python
def test_gebruiksblok_op_openingspagina():
    html = render_retention_report_html(_min_retention_data())
    blok = html.find("Zo gebruik je dit rapport")
    responsbasis = html.find("Responsbasis")
    assert blok != -1
    assert blok < responsbasis, "gebruiksblok hoort voor de responsbasis"
    assert "achteraan" in html and "eigenaar" in html
```

- [ ] **Step 2: Run, verwacht FAIL.**

- [ ] **Step 3: Helper + integratie**

Nieuwe functie direct onder `_intro()`:

```python
def _gebruiksblok(scan_lbl: str) -> str:
    """'Zo gebruik je dit rapport' (spec 2026-07-13 §5) — leesroute + beoogd
    besluit. Geen bespreekscript: de begeleide bespreking blijft het product."""
    return f"""<div style="margin-top:24px;">
  <span class="eyebrow">Zo gebruik je dit rapport</span>
  <p class="sec-intro" style="margin-top:6px;margin-bottom:0;">
    Dit rapport is een groepsbeeld van de organisatie &mdash; geen beoordeling van personen
    of afdelingen. Lees het van voor naar achter: eerst het beeld (context en
    overzichtsprofiel), dan de verdieping per thema, en achteraan de gespreksagenda &mdash;
    d&aacute;&aacute;r begint het gesprek. De {scan_lbl}-uitkomsten worden besproken in een
    begeleide managementbespreking: het rapport levert de onderbouwing, de bespreking de
    keuzes. Het doel aan het eind van die bespreking: &eacute;&eacute;n prioriteit,
    &eacute;&eacute;n eigenaar en een vervolgmoment.
  </p>
</div>"""
```

`_bestuurlijke_read` krijgt param `usage_html: str = ""`, gerenderd tussen het why-panel en `{responsbasis_html}`. De drie renderers geven `usage_html=_gebruiksblok(data["scan_lbl"])` door (controleer de exacte data-key voor het scanlabel — `scan_lbl` bestaat in de data-dict; anders het hardcoded label per renderer).

- [ ] **Step 4: Tests + paginapassing**

Run de tests. Let op het spec §1-randgeval van de designsprong: de openingspagina mag doorbreken — de responsbasis-band schuift mogelijk deels naar p3; dat is acceptabel (dichtheid > korte lengte), maar noteer het voor de visuele check in Task 7.

- [ ] **Step 5: Volledige suite + commit**

```bash
git add backend/report_html.py tests/
git commit -m "feat(rapport): Zo-gebruik-je-dit-rapport-blok op de openingspagina"
```

---

### Task 7: Samples + WeasyPrint-validatie + volledige visuele check

**Files:**
- Modify: `docs/examples/*.{html,pdf}`, `frontend/public/examples/*.{html,pdf}`

- [ ] **Step 1: Regenereren**

```bash
../../.venv/Scripts/python.exe generate_voorbeeldrapport.py exit
../../.venv/Scripts/python.exe generate_voorbeeldrapport.py retention
../../.venv/Scripts/python.exe generate_voorbeeldrapport.py onboarding
```

- [ ] **Step 2: WeasyPrint-render (PowerShell-tool, niet Bash)**

```powershell
$repo = "<WORKTREE-PAD>"
$files = @("voorbeeldrapport_loep", "voorbeeldrapport_retentiescan", "voorbeeldrapport_onboarding")
foreach ($f in $files) {
  $out = docker run --rm -v "${repo}\docs\examples:/data" ghcr.io/weasyprint/weasyprint "/data/$f.html" "/data/$f.pdf" 2>&1
  $lines = $out | Where-Object { $_ -ne $null -and $_.ToString().Trim() -ne "" }
  Write-Output "$f => exit $LASTEXITCODE, output lines: $($lines.Count)"
}
```

Expected: 3× exit 0, 0 output lines. Bij warnings: STOP en rapporteer (waarschijnlijke boosdoener: de `@page background` uit Task 4 — als WeasyPrint die weigert, val terug op een full-bleed `body { background }` met `html { background: chalk }` en rapporteer de afwijking).

- [ ] **Step 3: Tekst- en structuurchecks**

```bash
../../.venv/Scripts/python.exe -c "
import fitz
for name in ['voorbeeldrapport_loep', 'voorbeeldrapport_retentiescan', 'voorbeeldrapport_onboarding']:
    doc = fitz.open(f'docs/examples/{name}.pdf')
    full = ' '.join(p.get_text() for p in doc).lower().replace('\n', ' ')
    assert 'zo gebruik je dit rapport' in full, name
    assert 'groeiperspectief en erkenning' not in full, name
    assert 'samenvattende groepsscore' in full or name != 'voorbeeldrapport_retentiescan', name
    print(name, len(doc), 'pages OK')
"
```

Verwachting paginatelling: 15-16 per rapport (+0 à 1 door de ruimere intro's — rapporteer de werkelijke telling). Controleer ook dat de agenda-pagina in de PDF ná de open toelichtingen komt (paginavolgorde via per-pagina tekstextractie).

- [ ] **Step 4: Volledige visuele inspectie**

Rasterize álle pagina's van het retention-rapport (PyMuPDF, dpi=110) plus de openingspagina en agendapagina van exit en onboarding, en beoordeel: (a) full-bleed chalk zonder witte kaders, cover zonder chalk-rand; (b) titelhiërarchie — grote titel boven elke hoofdstukstart, kickers waar afgesproken, "— vervolg" klein; (c) intro-alinea's netjes onder de titels, geen dubbele subtitels; (d) gebruiksblok op de openingspagina, eventuele doorbraak van de responsbasis netjes; (e) agenda als voorlaatste inhoudelijke sectie met het navy anker intact.

- [ ] **Step 5: Kopiëren, volledige suite, commit**

```bash
cp docs/examples/voorbeeldrapport_loep.pdf docs/examples/voorbeeldrapport_retentiescan.pdf docs/examples/voorbeeldrapport_onboarding.pdf frontend/public/examples/
../../.venv/Scripts/python.exe -m pytest tests/ -q 2>&1 | tail -2
```

Expected: 25 failed = baseline.

```bash
git add docs/examples/ frontend/public/examples/
git commit -m "chore(samples): voorbeeldrapporten geregenereerd met leesbaarheidsronde (WeasyPrint 0 warnings)"
```

---

## Na afronding (handmatig, buiten dit plan)

1. Push → Vercel deployt samples; **Railway-redeploy** (backend-Python gewijzigd).
2. Geen migratie nodig.

## Zelfreview-notities (verwerkt)

- Task-volgorde bewust: titelhiërarchie eerst (raakt opener-markup die latere tests gebruiken), daarna volgorde, dan de copy-lagen.
- §2-dekking: alle tien spec-secties hebben een intro-tekst in Task 5; de bronregel zit in Task 5 Step 6.
- Exit-agenda-blok: variabele-schaduwing (`priority_fkeys`) expliciet afgedekt in Task 2 Step 3.
- `@page background`-onzekerheid: fallback gedocumenteerd in Task 7 Step 2 i.p.v. stilzwijgend te laten mislukken.
- Type-consistentie: `opener(title, kicker=None)` (Task 1) wordt in Task 5/6 niet gewijzigd; `mgmt_q_source`/`usage_html` zijn nieuwe optionele params met default `""` zodat bestaande tests zonder param blijven werken.
