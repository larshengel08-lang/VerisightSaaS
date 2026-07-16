# Plan: Hoofdthema's per afdeling in de segmentanalyse

**Spec:** `docs/superpowers/specs/2026-07-16-segment-hoofdthemas-design.md` (status AKKOORD, incl. 2 aanpassingen Lars 16-7)
**Branch:** `feature/segment-hoofdthemas` (worktree `.worktrees/segment-hoofdthemas`)
**Uitvoering:** subagent-driven development, 1 implementatietaak + twee-staps review; regeneratie voorbeeldrapporten + WeasyPrint-validatie door controller.

## Taak 1 — Datalaag + renderlaag + tests (MVP, alles in report_html.py + tests)

### 1a. Pure datalaag-helper

Nieuw in `backend/report_html.py`, naast `_department_segment_rows`:

```python
def _department_factor_rows(respondents: list[dict],
                            factor_items_map: dict[str, list]) -> dict[str, dict]:
    """Per afdeling: factorscores voor de segment-factorlaag (spec 2026-07-16 §3).

    Input per afgeronde respondent: {"department": str|None, "org_raw": dict}.
    Output per afdeling met >= MIN_SEGMENT_N respondenten:
      {dept: {"factors": [(fk, avg, n_factor)], "omitted": int}}
    - factors: alleen fk uit ORG_FACTOR_KEYS die in factor_items_map zitten
      én n_factor >= MIN_SEGMENT_N halen; avg = gemiddelde van de individuele
      factorscores (mean van de beantwoorde items van die factor per
      respondent, geschaald via _scale_to_10); gesorteerd laagste eerst,
      bij gelijke score alfabetisch op factor-key.
    - omitted: aantal factoren (uit factor_items_map ∩ ORG_FACTOR_KEYS) dat
      de n-gate NIET haalt.
    """
```

Individuele factorscore per respondent = zelfde formule als
`_per_respondent_factor_scores` (mean van aanwezige item-raws → `_scale_to_10`);
respondent zonder enig item van een factor telt niet mee voor die factor
(n_factor gate). SDT-dimensies komen er nooit in (filter op `ORG_FACTOR_KEYS`
én op `factor_items_map`).

### 1b. Wiring in build_report_data

Na de bestaande `segment_rows`-bouw:

```python
segment_factor_rows = _department_factor_rows(
    [{"department": r.department, "org_raw": r.response.org_raw or {}} for r in completed],
    factor_items_map)
```

en `segment_factor_rows=segment_factor_rows` toevoegen aan het return-dict.

### 1c. Renderlaag `_segment_block`

Signatuur wordt `_segment_block(segment_rows, factor_rows=None, scan_type="exit", opener_html="")`.
Bestaande aanroepen zonder nieuwe args (tests!) moeten blijven werken:
`factor_rows=None` ⇒ kolom toont per rij het mono-label "n.b." en er komen
geen subblokken (geen crash, geen fake data).

**Kolom "Laagste thema"** (nieuwe cel per rij, vóór de spreidingskolom):
- pooled rij: mono-label `niet getoond: samengestelde restgroep` (zelfde
  stijl als de bestaande strip-labels, 8px mono steel-grijs).
- niet-pooled, factors beschikbaar: laagste = eerste element van `factors`
  (al gesorteerd). Label via `_fl(fk, scan_type)`, kleur `_factor_color(avg)`.
  - rij-`n` 5–9: `{label}<br>{_factor_label(avg)}` — GEEN decimale score
    (aanpassing 1: schijnprecisie + herleidbaarheid).
  - rij-`n` >= 10: `{label}<br>{avg:.1f}/10`.
- `omitted > 0`: meldregel in dezelfde cel, klein mono:
  `{omitted} thema('s) niet beoordeelbaar: te weinig antwoorden`
  (aanpassing 2 — geldt áltijd bij omissie, ook bij n>=10).
- geen factordata voor die afdeling (dept mist in factor_rows of factors
  leeg): mono-label `n.b.`
- Kolombreedtes van de bestaande cellen verhoudingsgewijs aanpassen zodat de
  tabel netjes blijft (bestaand: 21/9/12/16/rest).

**Subblokken "Factorbeeld per afdeling"** (na de tabel, vóór de navy-anchor):
alleen voor niet-pooled rijen met rij-`n` >= 10 én factordata; per afdeling
een `no-break` blokje met kopregel (afdelingsnaam, n) en een `item-tbl` met
per factor: label (`_fl`), score `{avg:.1f}` in `_factor_color`, bandlabel
`_factor_label` — laagste eerst (volgorde uit de helper). Bij omitted > 0
dezelfde meldregel onder de tabel. Boven het eerste subblok één korte
uitlegregel (sec-intro-stijl) dat dit dezelfde vaste drempels volgt als het
overzichtsprofiel.

**Navy-anchor:** als de laagste (niet-pooled) afdeling factordata heeft,
één zin toevoegen na de bestaande tekst, mét staffel:
- rij-n 5–9: `De druk zit daar vooral op {label} ({bandlabel-lowercase}).`
- rij-n >= 10: `De druk zit daar vooral op {label} ({avg:.1f}/10).`
Geen factordata ⇒ zin weglaten (geen fake).

**Sectie-intro:** `SECTION_INTROS["segmentanalyse"]` uitbreiden met één à twee
zinnen: wat "laagste thema" is + dat kleine afdelingen (5–9) bewust alleen
een duidingslabel krijgen en volledige uitsplitsing vanaf 10 responses opent.
Geen em-dashes (huisregel).

**Call-sites:** in de drie renderers (`render_exit_report_html`,
`render_retention_report_html`, `render_onboarding_report_html`) de
`_segment_block`-aanroep uitbreiden met
`factor_rows=data.get("segment_factor_rows")` en `scan_type=...`
("exit" / ST / ST).

### 1d. Tests (TDD; nieuw bestand `tests/test_segment_factor_themes.py`)

Volg het testplan uit de spec §4, minimaal:
1. helper: staffel-kwalificatie (afdeling n=4 niet in output; n=5 wel).
2. helper: per-factor-gate (factor met n_factor=4 weggelaten, omitted telt).
3. helper: sortering laagste eerst, gelijkspel alfabetisch op key.
4. helper: SDT-keys (autonomy e.d.) nooit in output, ook als org_raw
   B-items zou bevatten (filter op factor_items_map ∩ ORG_FACTOR_KEYS).
5. render: rij-n 5–9 ⇒ laagste-thema-cel bevat factorlabel + bandlabel en
   expliciet GEEN patroon `\d\.\d/10` binnen die cel (regex op het celdeel).
6. render: rij-n >= 10 ⇒ cel bevat score; subblok aanwezig met alle
   factoren + scores, laagste eerst.
7. render: pooled rij ⇒ "niet getoond: samengestelde restgroep" in de
   themakolom en geen subblok voor de pool.
8. render: omitted > 0 ⇒ "niet beoordeelbaar" meldregel aanwezig
   (edge: laagste factor onder gate).
9. render: navy-anchor bevat thema; zonder score bij n=5–9, mét bij n>=10.
10. render: `_segment_block(rows)` zonder factor_rows werkt (geen crash,
    "n.b." zichtbaar) — backward-compat met bestaande call-sites/tests.

### 1e. Verificatie binnen de taak

- Nieuw testbestand groen.
- Bestaande rapporttests groen: `tests/test_segment_report.py`,
  `tests/test_report_leesbaarheid.py`, `tests/test_report_design_sprong.py`,
  `tests/test_report_distribution.py`, `tests/test_pdf_redesign.py`,
  `tests/test_report_html_design.py`.
- Committen op de feature-branch met heldere message.

### Grenzen (niet doen)

- GEEN wijziging aan `_department_segment_rows`, scoring, schema of API.
- GEEN dashboard-werk, geen verdieping-per-afdeling.
- GEEN vergelijkingsclaims tussen afdelingen in copy.
- Geen em-dashes in nieuwe klantzichtbare copy.
- De privacygates (MIN_SEGMENT_N, pooled-regels) nooit versoepelen om een
  test te laten slagen — fixture verrijken in plaats van logica verzwakken.

## Taak 2 (controller, na review): samples + deploy

Voorbeeldrapporten regenereren (3 scans), WeasyPrint-Docker 0-warnings,
visuele check segmentpagina, merge naar main, push; Railway-redeploy door
Lars (samen met de quick-fix-ronde, één deploy-moment).
