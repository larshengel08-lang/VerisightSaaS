"""
Loep — HTML→PDF rapportgenerator (WeasyPrint) v6
================================================
Product-hardened: eigen copy, labels en structuur per scan-type.
  ExitScan    — terugkijkende vertrekduiding
  RetentieScan — actieve-populatie behoudssignaal / vroegsignalering
  Onboarding  — 30/60/90 onboardingervaring en eerste werkperiode
Parallel pad naast report.py. report.py blijft onaangeroerd.
"""

from __future__ import annotations

import logging
import math
from collections import Counter, defaultdict
from datetime import datetime, timezone
from html import escape as _esc
from statistics import mean as _mean
from typing import Any

from sqlalchemy.orm import Session, joinedload, selectinload

from backend.models import Campaign, Respondent, SurveyResponse
from backend.report_css import build_css, RAG_HIGH, RAG_MID, RAG_LOW
from backend.report_distribution import MIN_DISTRIBUTION_N, distribution_block
from backend.products.shared.deepening import (
    DIRECTION_SETS,
    agenda_enrichment,
    aggregate_deepening,
    direction_agenda_scenario,
    get_deepening_sets,
)
from backend.products.shared.registry import get_product_module
from backend.report_priority import (
    CELL_CAP_REACHED, CELL_NO_MAJORITY, CELL_NOT_TRIGGERED, CELL_TOO_FEW,
    rank_factors,
)
from backend.scan_definitions import get_scan_definition
from backend.scoring import (
    ORG_FACTOR_KEYS,
    anonymize_text,
    compute_retention_signal_profile,
    detect_patterns,
)
from backend.scoring_config import (
    EXIT_REASON_LABELS_NL,
    FACTOR_LABELS_NL,
    RISK_HIGH,
    RISK_MEDIUM,
    MIN_SEGMENT_N,
    SDT_DIMENSION_ITEMS,
    SDT_REVERSE_ITEMS,
)

# ─── Constanten ───────────────────────────────────────────────────────────────

logger = logging.getLogger(__name__)

MIN_QUOTES_N = 5
MAX_QUOTES   = 12


def _should_show_quotes(open_texts: list[str]) -> bool:
    """Gate: toon Open toelichtingen alleen als ≥ MIN_QUOTES_N niet-lege teksten."""
    return len([t for t in open_texts if t and t.strip()]) >= MIN_QUOTES_N


def _should_show_appendix(n: int, n_factors: int) -> bool:
    """Gate: toon Appendix alleen bij dataset > 20 respondenten EN > 5 factoren."""
    return n > 20 and n_factors > 5


# ── Product-specifieke factor labels ─────────────────────────────────────────

_FACTOR_EXIT_LABEL: dict[str, str] = {
    "leadership":   "Leiderschap en feedback",
    "culture":      "Cultuur en veiligheid",
    "growth":       "Groeiperspectief",
    "compensation": "Beloning en voorwaarden",
    "workload":     "Werkdruk en balans",
    "role_clarity": "Rolhelderheid",
}
_FACTOR_RETENTION_LABEL: dict[str, str] = {
    "leadership":   "Leiderschap en vertrouwen",
    "culture":      "Cultuur en psychologische veiligheid",
    "growth":       "Groeiperspectief",
    "compensation": "Beloning en eerlijkheid",
    "workload":     "Werkdruk en herstelruimte",
    "role_clarity": "Rolhelderheid en eigenaarschap",
}
_FACTOR_ONBOARDING_LABEL: dict[str, str] = {
    "leadership":   "Begeleiding en bereikbaarheid",
    "culture":      "Sociale landing en cultuurbegrip",
    "growth":       "Ontwikkelruimte en eerste succeservaring",
    "compensation": "Praktische afspraken en startcondities",
    "workload":     "Informatiedichtheid en werktempo",
    "role_clarity": "Rolhelderheid en verwachtingen eerste 90 dagen",
}

def _fl(fk: str, scan_type: str = "exit") -> str:
    """Factor label voor een specifiek product — nooit snake_case naar output."""
    if scan_type == "retention":
        return _FACTOR_RETENTION_LABEL.get(fk, FACTOR_LABELS_NL.get(fk, fk))
    if scan_type == "onboarding":
        return _FACTOR_ONBOARDING_LABEL.get(fk, FACTOR_LABELS_NL.get(fk, fk))
    return _FACTOR_EXIT_LABEL.get(fk, FACTOR_LABELS_NL.get(fk, fk))

# ── Product-specifieke band labels ────────────────────────────────────────────

_EXIT_BANDS = {
    "HOOG":   ("Sterk frictiebeeld",       "#C0392B"),
    "MIDDEN": ("Gemengd vertrekbeeld",      "#C17C00"),
    "LAAG":   ("Laag frictiebeeld",         "#3C8D8A"),
}
_RETENTION_BANDS = {
    "HOOG":   ("Behoud onder druk",          "#C0392B"),
    "MIDDEN": ("Behoud vraagt aandacht",    "#C17C00"),
    "LAAG":   ("Behoudsklimaat stabiel",    "#3C8D8A"),
}
_ONBOARDING_BANDS = {
    "HOOG":   ("Onboardingbasis vraagt aandacht", "#C0392B"),
    "MIDDEN": ("Gemengd onboardingsbeeld",         "#C17C00"),
    "LAAG":   ("Onboardingbasis stabiel",           "#3C8D8A"),
}

def _band(score: float | None, scan_type: str = "exit") -> tuple[str, str]:
    """(label, kleur) voor een totaalscore — product-specifiek, nooit gedeeld."""
    table = (_RETENTION_BANDS if scan_type == "retention"
             else _ONBOARDING_BANDS if scan_type == "onboarding"
             else _EXIT_BANDS)
    if score is None:
        return ("Geen data", "#94A3B8")
    k = "HOOG" if score >= RISK_HIGH else "MIDDEN" if score >= RISK_MEDIUM else "LAAG"
    return table[k]

# ── Managementvragen per product ──────────────────────────────────────────────

_MGMT_Q_EXIT: dict[str, str] = {
    # leadership: "ontwikkelgesprekken" hoort bij groeiperspectief, niet bij
    # aansturing -> vervangen door "zichtbare steun" (matcht ld_support/ld_availability).
    "leadership":   "Gaat het signaal vooral over feedback, zichtbare steun of vertrouwen?",
    "culture":      "Is dit beeld over psychologische veiligheid, teamdynamiek of cultuurfit?",
    # growth: "erkenning" wordt niet gemeten (vandaar eerder al de factorlabel-
    # hernoeming van "Groeiperspectief en erkenning" naar "Groeiperspectief") ->
    # vervangen door thema's die wel in de verdiepingsset zitten (zichtbaarheid,
    # concrete ontwikkelgesprekken, plafond/stagnatie).
    "growth":       "Gaat het over zichtbaar perspectief, concrete ontwikkelgesprekken of stagnatie in doorgroei?",
    "compensation": "Is de kern hier salaris, ervaren fairness of uitlegbaarheid van voorwaarden?",
    "workload":     "Speelt de werkdruk in bepaalde teams, functies of als structureel patroon?",
    "role_clarity": "Gaat de onduidelijkheid over prioriteiten, eigenaarschap of beslisruimte?",
}
_MGMT_Q_RETENTION: dict[str, str] = {
    "leadership":   "Gaat het behoudssignaal over vertrouwen in leiding, feedback of zichtbare steun?",
    "culture":      "Is dit beeld over psychologische veiligheid, teambinding of cultuurmatch?",
    "growth":       "Speelt ontbrekend perspectief, te weinig concrete ontwikkelgesprekken of stagnatie een rol?",
    "compensation": "Is de kern hier ervaren fairness, uitlegbaarheid of beloningshoogte?",
    "workload":     "Speelt structurele werkdruk, gebrek aan herstelruimte of onbalans mee?",
    "role_clarity": "Is onduidelijkheid over eigenaarschap, prioriteiten of beslisruimte een thema?",
}
_MGMT_Q_ONBOARDING: dict[str, str] = {
    "leadership":   "Is de frictie over bereikbaarheid, richting of concrete steun in de eerste periode?",
    "culture":      "Gaat het over inbedding in het team, psychologische veiligheid of culturele codes?",
    "growth":       "Hebben nieuwe medewerkers voldoende zicht op wat succes betekent in hun rol?",
    "compensation": "Schuren praktische afspraken, tools of startcondities in deze vroege fase?",
    "workload":     "Is de informatiedichtheid of het werktempo hoog voor een eerste werkperiode?",
    "role_clarity": "Zijn rolverwachtingen en prioriteiten voor de eerste 90 dagen helder genoeg?",
}

def _mgmt_q(fk: str, scan_type: str = "exit") -> str:
    if scan_type == "retention": return _MGMT_Q_RETENTION.get(fk, "")
    if scan_type == "onboarding": return _MGMT_Q_ONBOARDING.get(fk, "")
    return _MGMT_Q_EXIT.get(fk, "")

# ── Overige constanten ────────────────────────────────────────────────────────

FACTOR_EXIT_CODE: dict[str, str] = {
    "leadership": "P1", "culture": "P2", "growth": "P3",
    "compensation": "P4", "workload": "P5", "role_clarity": "P6",
}


def _select_priority_factors(factor_avgs: dict[str, float],
                             exit_reason_counts: dict[str, int],
                             max_n: int = 3) -> list[str]:
    """Prioriteit = lage score + frequentie als vertrekreden. Niet puur laagste.

    Alleen organisatiefactoren: scoring.py's factor_averages bevat ook de
    SDT-dimensies (autonomy/competence/relatedness), maar die hebben geen
    stellingen in de verdieping-template — een SDT-dimensie als "prioritaire
    factor" rendert een lege verdiepingspagina (bug gevonden 2026-07-13)."""
    def _priority(fk: str) -> float:
        score = factor_avgs.get(fk, 10.0)
        reason = exit_reason_counts.get(fk, 0)
        return (10.0 - score) * 1.0 + reason * 0.4
    keys = [fk for fk in factor_avgs
            if factor_avgs.get(fk) is not None and fk in ORG_FACTOR_KEYS]
    return sorted(keys, key=_priority, reverse=True)[:max_n]


# Behoudsrelevantie per factor (voor retention prioriteitenmatrix)
_RETENTION_RELEVANCE: dict[str, float] = {
    "workload": 0.85, "leadership": 0.82, "growth": 0.78,
    "role_clarity": 0.72, "culture": 0.68, "compensation": 0.62,
}

SDT_LABELS = {"autonomy": "Autonomie", "competence": "Competentie", "relatedness": "Verbondenheid"}
SDT_HELP   = {
    "autonomy":    "Mate van ervaren regie over de eigen werkwijze",
    "competence":  "Mate van ervaren bekwaamheid en effectiviteit",
    "relatedness": "Mate van verbondenheid met collega's en organisatie",
}


# ─── Label systeem ────────────────────────────────────────────────────────────

# Behoud backward-compat aliases (alleen intern gebruikt in exit renderer)
def _friction_label(score: float | None) -> str:
    return _band(score, "exit")[0]

def _friction_color(score: float | None) -> str:
    return _band(score, "exit")[1]

def _factor_label(score: float | None) -> str:
    if score is None:  return "Geen data"
    if score < 5.0:    return "Kwetsbaar punt"
    if score < 6.5:    return "Aandachtspunt"
    return "Relatief sterk"

def _factor_color(score: float | None) -> str:
    # Zelfde gedempte RAG-set als de balken (_rag_color): voorheen gebruikte deze
    # functie felle tailwind-tinten (#EF4444/#F59E0B/#22C55E), waardoor er drie
    # ambers in het rapport zaten (merk #E8A020, fel #F59E0B, RAG #C17C00) en een
    # waarschuwingskleur eerder als huisstijl las. Eén betekenis-set, visueel
    # onderscheiden van het merkaccent.
    if score is None:  return "#94A3B8"
    if score < 5.0:    return RAG_HIGH
    if score < 6.5:    return RAG_MID
    return RAG_LOW

def _h(s: Any) -> str:
    return "" if s is None else _esc(str(s))

def _score_str(v: float | None) -> str:
    return f"{v:.1f}/10" if v is not None else "&#x2014;"

def _scale_to_10(raw: float, reverse: bool = False) -> float:
    r = 6.0 - raw if reverse else raw
    return round((r - 1) / 4 * 9 + 1, 2)


# ─── SVG visualisaties ────────────────────────────────────────────────────────

def _gauge_svg(score: float | None, label: str, color: str, width: int = 240) -> str:
    """SVG halve-cirkel meter. Score 1-10, vult van links naar rechts via de top."""
    s  = score or 1.0
    cx = width // 2
    cy = int(width * 0.42)
    r  = int(width * 0.31)
    sw = 16

    proportion = max(0.01, min(0.99, (s - 1) / 9.0))
    angle      = math.pi * (1.0 - proportion)
    ex = cx + r * math.cos(angle)
    ey = cy - r * math.sin(angle)

    h  = cy + 38
    return (
        f'<svg width="{width}" height="{h}" xmlns="http://www.w3.org/2000/svg">'
        f'<path d="M {cx-r} {cy} A {r} {r} 0 0 1 {cx+r} {cy}" '
        f'fill="none" stroke="#E8E0D0" stroke-width="{sw}" stroke-linecap="round"/>'
        f'<path d="M {cx-r} {cy} A {r} {r} 0 0 1 {ex:.1f} {ey:.1f}" '
        f'fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round"/>'
        f'<text x="{cx}" y="{cy-8}" text-anchor="middle" '
        f'font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="700" fill="#243247">{s:.1f}</text>'
        f'<text x="{cx}" y="{cy+10}" text-anchor="middle" '
        f'font-family="Arial,Helvetica,sans-serif" font-size="10" fill="#94A3B8">/10</text>'
        f'<text x="{cx}" y="{cy+30}" text-anchor="middle" '
        f'font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="700" fill="{color}">{_h(label)}</text>'
        f'<text x="{cx-r-4}" y="{cy+5}" text-anchor="end" '
        f'font-family="Arial,Helvetica,sans-serif" font-size="8" fill="#CBD5E1">1</text>'
        f'<text x="{cx+r+4}" y="{cy+5}" text-anchor="start" '
        f'font-family="Arial,Helvetica,sans-serif" font-size="8" fill="#CBD5E1">10</text>'
        f'</svg>'
    )


def _bar_chart_svg(items: list[tuple[str, float, str]], max_val: float = 10.0,
                   width: int = 380, bar_h: int = 22, gap: int = 10) -> str:
    """Horizontale barchart als SVG. items = [(label, value, color)]"""
    lbl_w  = 160
    val_w  = 40
    bar_w  = width - lbl_w - val_w - 20
    total_h = len(items) * (bar_h + gap) + 4
    rows   = ""
    for i, (lbl, val, col) in enumerate(items):
        y     = i * (bar_h + gap)
        fill_w = round(max(2, val / max_val * bar_w))
        rows += (
            f'<text x="{lbl_w - 8}" y="{y + bar_h*0.68:.0f}" text-anchor="end" '
            f'font-family="Arial,Helvetica,sans-serif" font-size="10" fill="#374151">{_h(lbl[:28])}</text>'
            f'<rect x="{lbl_w}" y="{y}" width="{bar_w}" height="{bar_h}" rx="3" fill="#F1F5F9"/>'
            f'<rect x="{lbl_w}" y="{y}" width="{fill_w}" height="{bar_h}" rx="3" fill="{col}"/>'
            f'<text x="{lbl_w + bar_w + 6}" y="{y + bar_h*0.68:.0f}" '
            f'font-family="Arial,Helvetica,sans-serif" font-size="10" font-weight="700" fill="{col}">{val:.1f}</text>'
        )
    return (f'<svg width="{width}" height="{total_h}" xmlns="http://www.w3.org/2000/svg">'
            f'{rows}</svg>')


def _reason_chart_svg(items: list[tuple[str, int]], total: int,
                      width: int = 400, bar_h: int = 18, gap: int = 8) -> str:
    """Horizontale barchart voor vertrekredenen. items = [(label, count)]"""
    lbl_w  = 170
    pct_w  = 65
    bar_w  = width - lbl_w - pct_w - 10
    total_h = len(items) * (bar_h + gap) + 4
    rows   = ""
    max_n  = max(c for _, c in items) if items else 1
    for i, (lbl, cnt) in enumerate(items):
        y     = i * (bar_h + gap)
        pct   = cnt / total * 100 if total else 0
        fill_w = round(max(2, cnt / max_n * bar_w))
        rows += (
            f'<text x="{lbl_w - 8}" y="{y + bar_h*0.72:.0f}" text-anchor="end" '
            f'font-family="Arial,Helvetica,sans-serif" font-size="10" fill="#374151">{_h(lbl[:30])}</text>'
            f'<rect x="{lbl_w}" y="{y}" width="{bar_w}" height="{bar_h}" rx="3" fill="#F1F5F9"/>'
            f'<rect x="{lbl_w}" y="{y}" width="{fill_w}" height="{bar_h}" rx="3" fill="#1E293B"/>'
            f'<text x="{lbl_w + bar_w + 6}" y="{y + bar_h*0.72:.0f}" '
            f'font-family="Arial,Helvetica,sans-serif" font-size="9" fill="#64748B">{pct:.0f}% ({cnt}x)</text>'
        )
    return (f'<svg width="{width}" height="{total_h}" xmlns="http://www.w3.org/2000/svg">'
            f'{rows}</svg>')


def _stacked_bar_svg(segments: list[tuple[str, int, str]],
                     total: int, width: int = 460, height: int = 26) -> str:
    """Horizontale gestapelde balk. segments = [(label, count, color)]"""
    parts = ""
    x = 0
    for lbl, cnt, col in segments:
        if cnt == 0: continue
        w = round(cnt / total * width)
        pct = round(cnt / total * 100)
        if w > 20:
            parts += (f'<rect x="{x}" y="0" width="{w}" height="{height}" fill="{col}"/>'
                      f'<text x="{x + w//2}" y="{height*0.68:.0f}" text-anchor="middle" '
                      f'font-family="Arial,Helvetica,sans-serif" font-size="9" font-weight="700" fill="#FFF">{pct}%</text>')
        else:
            parts += f'<rect x="{x}" y="0" width="{w}" height="{height}" fill="{col}"/>'
        x += w
    return (f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">'
            f'<rect x="0" y="0" width="{width}" height="{height}" rx="4" fill="#E8E0D0"/>'
            f'{parts}</svg>')


def _mini_bar_svg(score: float | None, color: str, width: int = 70, height: int = 6) -> str:
    if score is None: return ""
    w = round(max(2, score / 10 * width))
    return (f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">'
            f'<rect x="0" y="0" width="{width}" height="{height}" rx="2" fill="#E8E0D0"/>'
            f'<rect x="0" y="0" width="{w}" height="{height}" rx="2" fill="{color}"/>'
            f'</svg>')


# ─── Document wrapper ─────────────────────────────────────────────────────────

def _doc(title: str, body: str, scan_type: str = "exit") -> str:
    return (f'<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8">'
            f'<title>{_h(title)}</title><style>{build_css(scan_type)}</style></head>'
            f'<body>{body}</body></html>')


# ─── Shared blocks ────────────────────────────────────────────────────────────

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
    <div class="cconf">VERTROUWELIJK</div>
  </div>
  <div class="ceyebrow">{_h(scan_label)}</div>
  <div class="cbar"></div>
  <h1 class="ctitle">{_h(opening_question)}</h1>
  <div class="csub">{_h(org_name)} &nbsp;&middot;&nbsp; {_h(period)} &nbsp;&middot;&nbsp; Managementrapport</div>
  <div class="cmeta">{cells}</div>
</div>"""


# ─── Zelfuitleg-laag (spec 2026-07-13 §2) ────────────────────────────────────
# Elke sectie legt zichzelf uit: wat zie je, waarom meten we dit, hoe lees je
# het. Uitleg is een vertrouwensdrager — ruim en helder, geen disclaimers.

SECTION_INTROS: dict[str, str] = {
    "behoudscontext": (
        "Het behoudssignaal is een samenvattende groepsscore: de werkfactoren uit het "
        "overzichtsprofiel en de werkbeleving samen, teruggebracht tot &eacute;&eacute;n getal "
        "tussen 1 en 10. Onder de 5,0 noemen we een score kwetsbaar, tussen 5,0 en 6,5 een "
        "aandachtspunt, vanaf 6,5 relatief sterk. De drie signalen daaronder geven context: "
        "blijfintentie en vertrekintentie zijn geen spiegelbeeld van elkaar (iemand kan "
        "beide tegelijk voelen), en bevlogenheid staat daar los van: bevlogen medewerkers "
        "vertrekken soms toch. Dit rapport wijst aan waar het gesprek moet beginnen. "
        "Het doet bewust geen uitspraken over individuen."
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
        "aandachtspunt, vanaf 6,5 relatief sterk. Dit is een momentopname van de landing: "
        "een startpunt voor het gesprek over onboarding, geen beoordeling van individuele "
        "starters of hun begeleiders."
    ),
    "overzichtsprofiel": (
        "Elke factor hieronder is een thema, gemeten met drie stellingen over hetzelfde thema; "
        "de score is het groepsgemiddelde daarvan. De kleuren volgen vaste drempels "
        "(kwetsbaar onder 5,0, aandachtspunt 5,0 tot 6,5, relatief sterk vanaf 6,5) "
        "en zijn geen vergelijking met andere organisaties. Belangrijker dan de absolute kleur "
        "is de rangorde: de factor die binnen jullie eigen beeld het laagst scoort, is het "
        "logische begin van het gesprek."
    ),
    "verdieping": (
        "Respondenten die laag scoorden op dit thema kregen automatisch een korte vervolgvraag: "
        "welke toelichting past het best bij hun ervaring, en welke richting zou het gesprek "
        "hierover het meest helpen? De aantallen hieronder zijn tellingen van wat respondenten "
        "zelf kozen, geen interpretatie achteraf. Zo zie je niet alleen d&aacute;t een "
        "thema laag scoort, maar ook wat de groep zelf als reden en als gespreksrichting aandraagt."
    ),
    "werkbeleving": (
        "Naast de werkfactoren meten we drie psychologische basisbehoeften: autonomie (regie "
        "over de eigen werkwijze), competentie (ervaren bekwaamheid) en verbondenheid (de band "
        "met collega's en organisatie). Onderzoek naar werkmotivatie laat consistent zien dat "
        "deze drie bepalen hoe duurzaam iemand op zijn plek zit. Werkfactoren alleen "
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
        "tegenover het aantal uitgenodigden, de gemiddelde score en, bij voldoende "
        "responses, de spreiding. Afdelingen met minder dan vijf responses worden "
        "gebundeld onder &ldquo;Overige afdelingen&rdquo;, zodat antwoorden nooit herleidbaar "
        "zijn tot personen. Verschillen tussen afdelingen zijn gesprekstof: ze vertellen waar "
        "je als eerste gaat kijken, niet welke afdeling het &ldquo;slecht doet&rdquo;. "
        "De kolom met het laagste thema toont per afdeling de werkfactor die daar het laagst "
        "scoort. Bij kleine afdelingen (5 tot 9 responses) tonen we bewust alleen een "
        "duidingslabel, geen cijfer achter de komma; het volledige factorbeeld per afdeling "
        "opent vanaf 10 responses."
    ),
    "open_toelichtingen": (
        "Dit zijn de open antwoorden zoals respondenten ze zelf schreven, alleen ontdaan van "
        "namen en contactgegevens. Ze staan in ontvangstvolgorde: er is niet geselecteerd "
        "op inhoud en er is geen automatische duiding op losgelaten. De stemmen hieronder geven "
        "kleur aan de cijfers; wat ze betekenen en hoe zwaar ze wegen, bepaal je in de bespreking."
    ),
    "appendix": (
        "Hier staat elke stelling met haar groepsgemiddelde: de volledige onderbouwing "
        "van de factorscores eerder in dit rapport. Gebruik deze pagina's om te controleren "
        "waar een factorscore vandaan komt of om een specifieke stelling terug te vinden die "
        "in de bespreking ter sprake komt."
    ),
    "gespreksagenda": (
        "Alles wat je tot hier las is de onderbouwing; hier begint het gesprek. Deze agenda "
        "vat samen wat als eerste op tafel hoort, waarom juist dat, en wanneer je erop "
        "terugkomt. Het is bewust geen kant-en-klaar actieplan: de keuzes (wat pakken "
        "we op, wie is eigenaar) maak je in de begeleide managementbespreking, met dit "
        "rapport als gedeelde basis."
    ),
}


def _intro(key: str) -> str:
    return f'<p class="sec-intro">{SECTION_INTROS[key]}</p>'


def _gebruiksblok(scan_lbl: str) -> str:
    """'Zo gebruik je dit rapport' (spec 2026-07-13 §5) — leesroute + beoogd
    besluit. Geen bespreekscript: de begeleide bespreking blijft het product."""
    return f"""<div style="margin-top:24px;">
  <span class="eyebrow">Zo gebruik je dit rapport</span>
  <p class="sec-intro" style="margin-top:6px;margin-bottom:0;">
    Dit rapport is een groepsbeeld van de organisatie, geen beoordeling van personen
    of afdelingen. Lees het van voor naar achter: eerst het beeld (context en
    overzichtsprofiel), dan de verdieping per thema, en achteraan de gespreksagenda:
    d&aacute;&aacute;r begint het gesprek. De {scan_lbl}-uitkomsten worden besproken in een
    begeleide managementbespreking: het rapport levert de onderbouwing, de bespreking de
    keuzes. Het doel aan het eind van die bespreking is meestal simpel: &eacute;&eacute;n prioriteit,
    &eacute;&eacute;n eigenaar en een vervolgmoment.
  </p>
</div>"""


class _ChapterCounter:
    """Afgeleide hoofdstuknummering (designsprong §4): elke renderer maakt één
    instantie en roept opener() aan op het moment dat een sectie daadwerkelijk
    wordt geëmit — conditionele secties schuiven zo op zonder gaten.
    vervolg() geeft het compacte label voor doorlooppagina's (verdieping 2+)."""

    def __init__(self) -> None:
        self.n = 0

    def opener(self, title: str, *, kicker: str | None = None) -> str:
        # Titel naast het hoofdstuknummer, beide in dezelfde amber (feedback
        # 2026-07-16): de titel is het dominante element van de paginakop, de
        # kicker eronder blijft klein en ondergeschikt.
        self.n += 1
        kicker_html = f'<span class="ch-kicker">{kicker}</span>' if kicker else ""
        return (f'<div class="ch-head"><span class="ch-idx">{self.n:02d}</span>'
                f'<h2 class="ch-title">{title}</h2></div><hr class="ch-rule">'
                f'{kicker_html}')

    @staticmethod
    def vervolg(eyebrow: str) -> str:
        return f'<span class="slabel">{eyebrow} (vervolg)</span>'


def _bestuurlijke_read(*, kernzin: str, totaalbeeld: str,
                       primary_label: str, primary_score: float | None, primary_color: str,
                       why_cells_html: str, strong_label: str, strong_score: float | None,
                       mgmt_q: str, mgmt_q_source: str = "",
                       responsbasis_html: str = "", opener_html: str = "",
                       usage_html: str = "") -> str:
    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Bestuurlijke read</span>'}
  <p class="br-kernzin">{_h(kernzin)}</p>
  <p style="font-size:11px;color:#374151;max-width:62ch;margin-bottom:22px;">{_h(totaalbeeld)}</p>
  <div class="why">
    <div class="why-title">Waarom {_h(primary_label)} bovenaan staat</div>
    <table class="why-grid"><tr>{why_cells_html}</tr></table>
    {("<table class='sg'><tr>"
      f"<td><div class='sc-l'>Relatief sterk</div><div class='sc-v'>{_score_str(strong_score)}</div><div class='sc-b'>{_h(strong_label)}: wat w&eacute;l werkt</div></td>"
      "</tr></table>") if (strong_label and strong_score is not None and strong_score >= 6.5) else ""}
    <div class="mq-line"><span class="mq-label">Eerste managementvraag</span><p>{_h(mgmt_q)}</p>{f'<span class="mq-source">{_h(mgmt_q_source)}</span>' if mgmt_q_source else ''}</div>
  </div>
  {usage_html}
  {responsbasis_html}
</div>"""


def _responsbasis(*, invited: int, completed: int, pct: int, period: str,
                  population: str, segment_available: bool, segment_reason: str = "",
                  enps_available: bool = True, compact: bool = False) -> str:
    seg = ("Beschikbaar: segmentbeeld verderop in dit rapport." if segment_available
           else f"Niet beschikbaar: {_h(segment_reason)}.")

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


def _stat4(cards: list[dict]) -> str:
    tds = "".join(
        f'<td><div class="sc-l">{_h(c["title"])}</div>'
        f'<div class="sc-v">{_h(c["value"])}</div>'
        f'<div class="sc-b">{_h(c["body"])}</div></td>'
        for c in cards)
    return f'<table class="sg"><tr>{tds}</tr></table>'


def _playbook_card(row: dict) -> str:
    rb  = str(row.get("band", "MIDDEN")).upper()
    bk  = rb if rb in ("HOOG","MIDDEN","LAAG") else "MIDDEN"
    col = _factor_color({"HOOG": 2.0, "MIDDEN": 5.5, "LAAG": 8.0}[bk])
    bl  = {"HOOG": "Kwetsbaar punt", "MIDDEN": "Gemengd beeld", "LAAG": "Relatief sterk"}[bk]
    lbl = row.get("label", row.get("factor",""))
    acts = "".join(f"<li>{_h(a)}</li>" for a in row.get("actions",[]))

    # Saniteer oude actietaal
    decision = row.get("decision","").replace("gerichte verbeteractie","managementgesprek of data-check")
    validate = row.get("validate","")
    review   = row.get("review","").replace("gerichte verbeteractie","eerste vervolgstap")
    # Eigenaarschap is bewust geen Loep-suggestie (geen aanname wie dit oppakt) —
    # altijd een invulbare lege regel, ongeacht wat er berekend is in de row-data.

    return f"""<div class="play" style="border-left-color:{col};">
  <div class="play-hdr">
    <div class="play-bdg"><span style="background:{col};">{_h(bl)}</span></div>
    <div class="play-ttl">{_h(lbl)} &middot; {_h(row.get("title",""))}</div>
  </div>
  {"<div class='sub-l'>Eerste managementvraag</div><p style='font-size:10.5px;'>" + _h(decision) + "</p>" if decision else ""}
  {"<div class='sub-l'>Waar te beginnen</div><p style='font-size:10.5px;'>" + _h(validate) + "</p>" if validate else ""}
  {"<div class='sub-l'>Mogelijke stappen</div><ul class='act-lst'>" + acts + "</ul>" if acts else ""}
  <div class='sub-l'>Eigenaar</div><div class="step-fill"></div><div class="step-fill-hint">In te vullen tijdens de bespreking</div>
  {"<div class='sub-l'>Reviewmoment</div><p style='font-size:10.5px;'>" + _h(review) + "</p>" if review else ""}
</div>"""


def _step_cards(nsp: dict) -> str:
    import re as _re
    cards = nsp.get("session_cards") or [
        {"title": "Prioriteit",   "body": nsp.get("first_decision","")},
        # Eigenaar: geen Loep-suggestie — bewust altijd een invulbare lege regel (zie _clean/render hieronder).
        {"title": "Eigenaar",     "body": ""},
        {"title": "Eerste stap",  "body": nsp.get("first_action","")},
        {"title": "Reviewmoment", "body": nsp.get("review_moment","")},
    ]

    def _clean(title: str, s: str) -> str:
        # Vervang volledig de "Vertaal X binnen 30 dagen naar..."-formule
        s = _re.sub(
            r'Vertaal .{0,100}binnen \d+ dagen naar [^.]+\.',
            'Kies één managementgesprek of data-check om het beeld te verduidelijken. Bepaal daarna pas of een gerichte stap nodig is.',
            s
        )
        # Prioriteit-kaart: maak hiërarchisch als er twee factoren zijn
        if title in ("Prioriteit nu", "Prioriteit"):
            # "X en Y vormen nu..." → "Start met X. Neem Y mee als tweede aandachtspunt."
            m = _re.match(r'(\w[\w\s&]+?) en ([\w\s&]+?) (vormen|zijn)', s)
            if m:
                s = (f'Start met {m.group(1).strip()}. '
                     f'Neem {m.group(2).strip()} mee als tweede aandachtspunt.')
        # Vervang "vormen nu het eerste vertrekspoor om bestuurlijk te wegen"
        s = s.replace("vormen nu het eerste vertrekspoor om bestuurlijk te wegen",
                      "zijn de eerste factoren om gericht te bespreken")
        # Vervang overige actietaal
        s = (s.replace("gerichte verbeteractie", "managementgesprek of data-check")
               .replace("verbeteractie", "eerste vervolgstap")
               .replace("met duidelijke eigenaar en zichtbare opvolging", ""))
        return s.strip()

    def _card_body_html(title: str, body: str) -> str:
        if title == "Eigenaar":
            return '<div class="step-fill"></div><div class="step-fill-hint">In te vullen tijdens de bespreking</div>'
        return f'<div class="step-body">{_h(_clean(title, body))}</div>'

    tds = "".join(
        f'<td class="step"><div class="step-no">{_h(c.get("title",""))}</div>'
        f'{_card_body_html(c.get("title",""), c.get("body",""))}</td>'
        for c in cards[:4])
    return f'<table class="steps"><tr>{tds}</tr></table>'


def _eerste_managementspoor(*, primary_theme: str, second_point: str, mgmt_q: str,
                            review_when: str,
                            primary_why: str | None = None,
                            second_why: str | None = None,
                            opener_html: str = "") -> str:
    """Gespreksagenda voor eerste managementbespreking — geen actieplan, agenda.

    Navy anker (designsprong §2a): kaarten + gespreksopener vormen één donker
    vlak. primary_why/second_why (designsprong §3) zijn feitelijke
    onderbouwingsregels uit bestaande berekeningen — geen nieuwe duiding.
    "Uit de bespreking" (feedback 2026-07-16): de losse Eigenaarschap-kaart is
    vervangen door één blok met drie invulregels (Prioriteit/Eigenaar/
    Vervolgmoment) — spiegelt de doelzin op de openingspagina ("één
    prioriteit, één eigenaar en een vervolgmoment"). De aparte
    Opnieuw-bespreken-kaart is hierin opgegaan: review_when wordt de hint
    onder Vervolgmoment i.p.v. een vierde, altijd-ingevulde kolom.
    """
    def _why(txt: str | None) -> str:
        return f'<span class="agenda-why">{_h(txt)}</span>' if txt else ""

    def _fill_row(label: str, hint: str) -> str:
        return (f'<div class="step-sublbl">{_h(label)}</div>'
                f'<div class="step-fill"></div>'
                f'<div class="step-fill-hint">{_h(hint)}</div>')

    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Eerste managementspoor</span>'}
  {_intro("gespreksagenda")}
  <div class="agenda-dark">
  <table class="steps"><tr>
    <td class="step"><div class="step-no">Primair thema</div><div class="step-body">{_h(primary_theme)}</div>{_why(primary_why)}</td>
    <td class="step"><div class="step-no">Tweede aandachtspunt</div><div class="step-body">{_h(second_point)}</div>{_why(second_why)}</td>
    <td class="step">
      <div class="step-no">Uit de bespreking</div>
      {_fill_row("Prioriteit", "In te vullen tijdens de bespreking")}
      {_fill_row("Eigenaar", "In te vullen tijdens de bespreking")}
      {_fill_row("Vervolgmoment", review_when)}
    </td>
  </tr></table>
  <div class="agenda-opener">
    <div style="font-family:'JetBrains Mono', monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#E8A020;margin-bottom:7px;">Gespreksopener</div>
    <p style="margin-bottom:0;font-size:12.5px;line-height:1.6;color:#F4F1EA;">{_h(mgmt_q)}</p>
  </div>
  </div>
  <p class="trustline">Nog niet besluiten of een verdieping of kortere vervolgmeting nodig is: dat volgt uit het gesprek.</p>
</div>"""


# ── Prioriteringsraster (spec 2026-07-18) ────────────────────────────────────
# Alle copy hieronder is gepind met contract-tests: inkorten = rode test.

RASTER_INTRO = (
    "Dit overzicht weegt alle zes factoren tegen elkaar af op drie zichtbare "
    "signalen: de gemiddelde score, de spreiding tussen respondenten en wat "
    "respondenten in de verdieping als toelichting kozen. De volgorde is "
    "daarmee navolgbaar: je ziet per factor wat meewoog. De bespreking "
    "beslist; dit raster structureert.")

RASTER_INTRO_GATE = (
    "Dit overzicht weegt alle zes factoren tegen elkaar af op twee zichtbare "
    "signalen: de gemiddelde score en de spreiding tussen respondenten. De "
    "volgorde is daarmee navolgbaar: je ziet per factor wat meewoog. De "
    "bespreking beslist; dit raster structureert.")

RASTER_UITLEG: dict[str, str] = {
    "retention": (
        "Hoe deze volgorde tot stand komt: gesorteerd op score. Bij vrijwel "
        "gelijke scores (verschil kleiner dan 0,3) geven grote spreiding of "
        "een gedeelde toelichting uit de verdieping de doorslag. Spreiding "
        "tonen we vanaf 10 responses; verdiepingsduiding vanaf 8 "
        "beantwoorders per factor."),
    "exit": (
        "Hoe deze volgorde tot stand komt: gesorteerd op score, waarbij ook "
        "meeweegt hoe vaak een factor als vertrekreden is genoemd. Bij "
        "vrijwel gelijke scores (verschil kleiner dan 0,3) geven grote "
        "spreiding of een gedeelde toelichting uit de verdieping de "
        "doorslag. Spreiding tonen we vanaf 10 responses; verdiepingsduiding "
        "vanaf 8 beantwoorders per factor."),
}

RASTER_LEGENDA = (
    "Het blokje in de spreidingsbalk markeert het groepsgemiddelde; de "
    "telling eronder toont hoeveel respondenten deze factor onder de 5 "
    "scoren.")

RASTER_GATE_NOTE = (
    "In deze meting waren geen verdiepingsvragen actief; de volgorde volgt "
    "score en spreiding.")


def _raster_deepening_cell(row: dict, scan_type: str) -> str:
    """Celtekst verdiepingskolom volgens de vijf vaste staten (spec par. 6)."""
    state = row["deepening_state"]
    if state == 1:
        key, cnt, answered = row["deepening_top"]
        opt = _deepening_option_texts(scan_type, row["key"]).get(key, key)
        return f'{cnt} van {answered} kozen: "{_h(opt)}"'
    return _h({2: CELL_NO_MAJORITY, 3: CELL_TOO_FEW,
               4: CELL_CAP_REACHED, 5: CELL_NOT_TRIGGERED}.get(state, ""))


def _prioriteringsraster(*, ranked: list[dict], scan_type: str,
                         factor_resp_scores: dict[str, list[float]],
                         deepening_active: bool,
                         mgmt_q: str, review_when: str,
                         opener_html: str) -> str:
    """Prioriteringsraster + geintegreerde gespreksagenda (spec par. 2).

    Vervangt _eerste_managementspoor voor exit en retention. De tabel toont
    het afwegingswerk (zichtbaarheids-invariant: elke tiebreak-input staat in
    een kolom); het navy slotblok draagt opener + invulregels.

    RASTER_UITLEG wordt PLAIN gerenderd (geen bold-prefix-splitsing): de
    contract-test controleert de letterlijke, volledige string als substring
    van de HTML-output, dus elke opmaak die de string zelf onderbreekt
    (bijv. een <b>-tag halverwege) breekt die test.
    """
    from backend.report_distribution import MIN_DISTRIBUTION_N, distribution_svg

    # Onafhankelijk van de renderlus berekend (code-review Taak 5): een
    # nonlocal-neveneffect binnen _spread_cell zou hier onzichtbaar koppelen
    # aan de looprvolgorde en breken zodra deze closure ooit los hergebruikt
    # wordt. Beide kanten gebruiken dezelfde MIN_DISTRIBUTION_N-staffel als
    # _spread_cell, dus het resultaat is identiek.
    any_full_spread = any(
        len([v for v in (factor_resp_scores.get(row["key"]) or []) if v is not None]) >= MIN_DISTRIBUTION_N
        for row in ranked)

    def _spread_cell(row: dict) -> str:
        scores = [v for v in (factor_resp_scores.get(row["key"]) or []) if v is not None]
        if len(scores) < MIN_DISTRIBUTION_N:
            return '<span class="r-mono">spreiding vanaf 10 responses</span>'
        strip = distribution_svg(scores, width=200, height=22)
        return (f'{strip}<br><span class="r-mono">'
                f'{row["spread_below"]} van {row["spread_n"]} onder de 5</span>')

    def _agenda_cell(row: dict) -> str:
        parts = []
        if row["agenda_role"] == "startpunt":
            parts.append("<b>Startpunt</b>")
        elif row["agenda_role"] == "tweede":
            parts.append("<b>Tweede punt</b>")
        if row["near_tie_with"]:
            tie_lbl = next((r["label"] for r in ranked if r["key"] == row["near_tie_with"]),
                           row["near_tie_with"])
            parts.append(f'<span class="r-mono">vrijwel gelijk aan {_h(tie_lbl)}</span>')
        return "<br>".join(parts)

    deep_th = '<th style="width:29%">Verdieping</th>' if deepening_active else ""
    body = ""
    for row in ranked:
        top_cls = ' class="r-top"' if row["agenda_role"] else ""
        fl_html = (f'<span class="r-fl">{_h(row["label"])}</span>'
                   if row["agenda_role"] else _h(row["label"]))
        deep_td = (f'<td style="font-size:9.5px;">{_raster_deepening_cell(row, scan_type)}</td>'
                   if deepening_active else "")
        body += (f'<tr{top_cls}><td>{fl_html}</td>'
                 f'<td style="color:{_factor_color(row["score"])};">{_score_str(row["score"])}</td>'
                 f'<td>{_spread_cell(row)}</td>'
                 f'{deep_td}'
                 f'<td>{_agenda_cell(row)}</td></tr>')

    intro = RASTER_INTRO if deepening_active else RASTER_INTRO_GATE
    gate = f'<p class="r-gate">{RASTER_GATE_NOTE}</p>' if not deepening_active else ""
    # Legenda legt de spreidingskolom uit ("... onder de 5 scoren"); zonder een
    # enkele rij met volledige spreidingsdata (n >= 10) is die uitleg niet van
    # toepassing en zou de tekst zelf de degraded-staffel-test doorbreken.
    legenda = f'<p class="r-legend">{RASTER_LEGENDA}</p>' if any_full_spread else ""

    def _fill_row(label: str, hint: str) -> str:
        return (f'<div class="step-sublbl">{_h(label)}</div>'
                f'<div class="step-fill"></div>'
                f'<div class="step-fill-hint">{_h(hint)}</div>')

    return f"""<div class="pb sec">
  {opener_html}
  <p class="sec-intro">{intro}</p>
  <table class="raster-tbl"><tr>
    <th style="width:27%">Factor</th><th style="width:12%">Score</th>
    <th style="width:22%">Spreiding</th>{deep_th}<th style="width:14%">Agenda</th>
  </tr>{body}</table>
  {legenda}
  {gate}
  <div class="r-uitleg">{RASTER_UITLEG[scan_type]}</div>
  <div class="agenda-dark" style="margin-top:16px;">
    <div class="agenda-opener">
      <div style="font-family:'JetBrains Mono', monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#E8A020;margin-bottom:7px;">Gespreksopener</div>
      <p style="margin-bottom:0;font-size:12.5px;line-height:1.6;color:#F4F1EA;">{_h(mgmt_q)}</p>
    </div>
    <table class="steps"><tr><td class="step">
      {_fill_row("Prioriteit", "In te vullen tijdens de bespreking")}
      {_fill_row("Eigenaar", "In te vullen tijdens de bespreking")}
      {_fill_row("Vervolgmoment", review_when)}
    </td></tr></table>
  </div>
  <p class="trustline">Nog niet besluiten of een verdieping of kortere vervolgmeting nodig is: dat volgt uit het gesprek.</p>
</div>"""


def _deepening_campaign_active(deepening_agg: dict) -> bool:
    """Campagne-niveau gate: alleen campagnes waar de verdiepingsfeature echt
    draaide (ergens offered > 0) tonen verdiepingsblokken. Historische
    (pre-feature) rapporten blijven zo ongewijzigd; binnen een actieve
    campagne blijft de keten per factor volledig, ook bij offered=0
    (cap-verdrongen) — dat is de 6.1-transparantie."""
    return any(agg.get("offered", 0) > 0 for agg in deepening_agg.values())


def _deepening_option_texts(scan_type: str, factor_key: str) -> dict[str, str]:
    return {o["key"]: o["text"]
            for o in get_deepening_sets(scan_type)[factor_key]["options"]}


def _primary_why_text(low_item_score: float, agg: dict, scan_type: str, factor_key: str) -> str:
    """'Waarom eerst'-onderbouwing bij de Primair-thema-kaart (feedback 2026-07-16
    pt. 1): boven de staffel (answered>=5) wordt de daadwerkelijk meest gekozen
    toelichting genoemd i.p.v. de circulaire "kozen de meest gekozen toelichting"."""
    answered = agg.get("answered", 0)
    top = max((agg.get("primary_counts") or {}).items(), key=lambda kv: (kv[1], kv[0]), default=None)
    if top and answered >= 5:
        opt_text = _deepening_option_texts(scan_type, factor_key).get(top[0], top[0])
        return (f"Laagst scorende stelling in het cijferbeeld ({low_item_score:.1f}/10); "
                f"{top[1]} van de {answered} respondenten met verdieping kozen: '{opt_text}'.")
    return f"Laagst scorende stelling in het cijferbeeld ({low_item_score:.1f}/10)."


def _lc(label: str) -> str:
    """Factorlabel mid-zin: eerste letter lowercase."""
    return label[:1].lower() + label[1:] if label else label


def _deepening_chain(agg: dict, scan_type: str, factor_key: str) -> str:
    """Noemer-keten (spec 6.1): getriggerd -> aangeboden -> beantwoord."""
    return (f"Van de {agg['triggered']} respondenten met een verdieptrigger op "
            f"{_lc(_fl(factor_key, scan_type))} kregen {agg['offered']} de "
            f"verdiepingsvraag; {agg['answered']} beantwoordden die.")


def _deepening_block(agg: dict, scan_type: str, factor_key: str) -> str:
    """Toelichtingsblok onder een factor (spec 6.1 + 6.2), gestaffeld op n=answered."""
    if not agg.get("triggered"):
        return ""
    answered = agg.get("answered", 0)
    opt_text = _deepening_option_texts(scan_type, factor_key)
    chain = _deepening_chain(agg, scan_type, factor_key)

    if answered < 5:
        body = ('<p style="font-size:9px;color:#64748B;margin:6px 0 0;">'
                'Te weinig verdiepingsantwoorden om een verdeling te tonen. '
                'Bespreek dit onderwerp in de managementbespreking.</p>')
    else:
        ranked = sorted((agg.get("primary_counts") or {}).items(),
                        key=lambda kv: (-kv[1], kv[0]))
        rows = "".join(
            f'<tr><td class="iq">{_h(opt_text.get(key, key))}</td>'
            f'<td class="is" style="color:#0D1B2A;">'
            f'{f"{round(cnt / answered * 100)}% ({cnt})" if answered >= 10 else cnt}'
            f'</td></tr>'
            for key, cnt in ranked)
        body = f'<table class="item-tbl" style="margin-top:6px;">{rows}</table>'
        if answered <= 9:
            body += ('<p style="font-size:10px;color:#92400E;margin:4px 0 0;">'
                     'Beperkte antwoordbasis: gebruik dit als gesprekshaakje, '
                     'niet als conclusie.</p>')

    # De "Daarnaast werden vooral X en Y genoemd"-samenvatting is bewust weg
    # (feedback 2026-07-16): de regel dupliceerde de tabel met aantallen die
    # er direct boven staat. secondary_counts blijft in de aggregatie bestaan.
    return (f'<div class="card"><span class="eyebrow">Welke toelichting respondenten kozen</span>'
            f'<p style="font-size:10px;margin:4px 0 0;">{_h(chain)}</p>'
            f'{body}</div>')


def _direction_block(agg: dict, scan_type: str, factor_key: str) -> str:
    """Blok 'Welke gespreksrichting respondenten kozen' (spec 2026-07-05 par. 7.1)."""
    n = agg.get("direction_answered", 0)
    offered = agg.get("direction_offered", 0)
    if offered == 0:
        return ""
    opt_text = {o["key"]: o["text"] for o in DIRECTION_SETS[factor_key]["options"]}
    # Alleen de delta t.o.v. het toelichtingsblok erboven: de volledige keten
    # (getriggerd -> aangeboden -> beantwoord) staat daar al — die hier woordelijk
    # herhalen maakte de pagina onnodig vol.
    chain = f"Van de {agg['answered']} respondenten die de verdieping beantwoordden, gaven {n} ook een gespreksrichting."
    if n < 5:
        body = ('<p style="font-size:10px;color:#64748B;margin:4px 0 0;">'
                'Te weinig antwoorden om een verdeling te tonen. Bespreek dit onderwerp '
                'in de managementbespreking.</p>')
    else:
        ranked = sorted(agg["direction_counts"].items(), key=lambda kv: (-kv[1], kv[0]))
        rows = "".join(
            f'<tr><td class="iq">{_h(opt_text.get(key, key))}</td>'
            f'<td class="is" style="color:#0D1B2A;">'
            f'{f"{round(cnt / n * 100)}% ({cnt})" if n >= 10 else cnt}'
            f'</td></tr>'
            for key, cnt in ranked)
        body = f'<table class="item-tbl" style="margin-top:6px;">{rows}</table>'
        if n <= 9:
            body += ('<p style="font-size:10px;color:#92400E;margin:4px 0 0;">'
                     'Beperkte antwoordbasis: gebruik dit als gesprekshaakje, '
                     'niet als conclusie.</p>')
        # Spec par. 7.2: veel respondenten buiten de vaste opties -> neutrale
        # regel + interne reviewvlag (spiegelt het trede-1-gedrag in _deepening_mgmt_q).
        top_key = max(agg["direction_counts"].items(), key=lambda kv: (kv[1], kv[0]))[0]
        if top_key.endswith("_other"):
            logger.warning(
                "direction: *_other is topoptie voor %s - routeset review nodig",
                factor_key)
            body += ('<p style="font-size:10px;color:#64748B;margin:4px 0 0;">'
                     'Veel antwoorden vielen buiten de vaste opties.</p>')
    # Spec par. 7.3 stopregel: >40% van de aangeboden richtingen overgeslagen
    # -> zichtbaar label; de bijbehorende agenda-suppressie zit in
    # direction_agenda_scenario (deepening.py).
    if agg.get("direction_skipped", 0) / offered > 0.4:
        body += ('<p style="font-size:10px;color:#92400E;margin:4px 0 0;">'
                 'Gespreksrichting-basis beperkt door overslag.</p>')
    # Eén zelfverzekerde zin i.p.v. drie disclaimers (feedbackronde 2026-07-13):
    # de claimgrens (input, geen uitvoeringsadvies) blijft, de verdedigende toon niet.
    footer = ('<p style="font-size:10px;color:#64748B;margin:8px 0 0;">'
              'Dit is wat de groep aandraagt voor het gesprek. De weging '
              '(haalbaarheid, passendheid) gebeurt in de managementbespreking.</p>')
    return (f'<div class="card"><span class="eyebrow">Welke gespreksrichting respondenten kozen</span>'
            f'<p style="font-size:10px;margin:4px 0 0;">{_h(chain)}</p>{body}{footer}</div>')


def _direction_agenda_line(agg: dict, scan_type: str, factor_key: str) -> str | None:
    """Verrijkte agenda-regel per scenario (spec par. 7.2); None -> bestaande regel blijft."""
    s = direction_agenda_scenario(agg, scan_type, factor_key)
    if s["scenario"] not in ("concordant", "discrepant"):
        return None
    cause = s["cause"]
    cause_text = _deepening_option_texts(scan_type, factor_key).get(cause["option_key"], cause["option_key"])
    route_text = {o["key"]: o["text"] for o in DIRECTION_SETS[factor_key]["options"]}[s["route_key"]]
    if s["scenario"] == "concordant":
        return (f"{cause['count']} van de {cause['answered']} kozen '{cause_text}' als belangrijkste "
                f"toelichting; de meest gekozen gespreksrichting sluit daarbij aan "
                f"({s['route_count']} van {s['direction_answered']}). "
                f"Gespreksvraag: {s['agenda_question']}")
    return (f"Toelichting en gespreksrichting lopen uiteen: respondenten kozen vooral "
            f"'{cause_text}' als toelichting, maar '{route_text}' als richting voor het gesprek "
            f"({s['route_count']} van {s['direction_answered']}). "
            f"Bespreek eerst waar dit verschil vandaan komt.")


def _short_mgmt_q(deep_agg: dict, scan_type: str, factor_key: str) -> str | None:
    """Korte, datagedreven managementvraag voor de bestuurlijke read (p.02).

    Gebruikt de agenda_question die hoort bij de meest gekozen verdiepings-
    toelichting — inhoud die respondenten zelf kozen, geen vaste template.
    None -> valt terug op de generieke per-factor vraag.
    """
    agg = deep_agg.get(factor_key)
    if not agg:
        return None
    enr = agenda_enrichment(agg, scan_type, factor_key)
    return enr["agenda_question"] if enr else None


def _deepening_mgmt_q(deep_agg: dict, scan_type: str, factor_key: str) -> str | None:
    """Datagedreven gespreksopener (feedback 2026-07-16 pt. 3): noemt de
    daadwerkelijk meest gekozen toelichting i.p.v. de vaste per-factor
    menuvraag (_mgmt_q). None -> de vaste menuvraag blijft de fallback voor
    de Gespreksopener op de gespreksagenda-pagina."""
    agg = deep_agg.get(factor_key)
    if not agg:
        return None
    enr = agenda_enrichment(agg, scan_type, factor_key)
    if enr is None:
        counts = agg.get("primary_counts") or {}
        if counts and agg.get("answered", 0) >= 8:
            top_key = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
            if top_key.endswith("_other"):
                logger.warning(
                    "deepening: *_other is topoptie voor %s - optieset review nodig",
                    factor_key)
        return None
    opt_text = _deepening_option_texts(scan_type, factor_key).get(enr["option_key"], enr["option_key"])
    return f"De meest gekozen toelichting was '{opt_text}'. Herkennen jullie dat beeld, en wat zit erachter?"


def _trust_page(scan_type: str = "exit", opener_html: str = "") -> str:
    """Product-specifieke methodiekpagina — nooit gedeelde ExitScan-copy buiten ExitScan."""
    if scan_type == "retention":
        intro = ("Dit rapport bundelt patronen uit actieve-medewerkerresponses tot een groepsbeeld van "
                 "behoud, vertrekdenken en werkfactoren. Geen individuele risicoscore, geen voorspelling "
                 "en geen diagnose.")
        cells_r1 = [
            ("Groepsniveau",     "Alle scores zijn groepsgemiddelden van de actieve populatie. Geen individuele gegevens."),
            ("Drempelwaarden",   "5+ responses indicatief · 10+ voor patroonduiding · 5+ per groep voor segmentweergave"),
            ("Geen voorspelling","Scores geven een huidig signaal, geen verlooppredicties en geen individuele risicobeoordeling."),
        ]
        cells_r2 = [
            ("Open toelichtingen","Automatisch geanonimiseerd: herkende namen, contactgegevens en locaties verwijderd. Alleen bij voldoende n getoond."),
            ("Claimgrenzen",     "Loep Behoud is een actieve-populatie groepssignaal. Geen causale claims, geen interventieprescriptie."),
            ("Privacywaarborg",  "Verwerking conform AVG. Uitsluitend bestemd voor geautoriseerde gebruikers."),
        ]
        cells_r3 = [
            ("Hoe de banden werken",
             "Kwetsbaar punt (onder 5,0), aandachtspunt (5,0 tot 6,5) en relatief "
             "sterk (vanaf 6,5) zijn vaste schaaldrempels, geen vergelijking met "
             "andere organisaties. De rangorde tussen de eigen factoren weegt "
             "zwaarder dan de absolute kleur. Doordat de meetlat vast is, zijn "
             "meting en vervolgmeting een-op-een vergelijkbaar."),
        ]
    elif scan_type == "onboarding":
        intro = ("Dit rapport bundelt patronen uit onboarding-checkpoints tot een groepsbeeld van de eerste "
                 "werkperiode. Geen prestatiebeoordeling, geen individuele beoordeling en geen voorspelling van uitval.")
        cells_r1 = [
            ("Groepsniveau",       "Alle scores zijn groepsgemiddelden van de instroomgroep. Geen individuele gegevens."),
            ("Checkpoint-logica",  "Dit is een enkelvoudig meetmoment (30/60/90). Een volgende meting bespreken we los van dit rapport."),
            ("Geen beoordeling",   "Scores duiden onboarding-ervaring op groepsniveau. Geen prestatiebeoordeling van individuen of managers."),
        ]
        cells_r2 = [
            ("Open toelichtingen", "Automatisch geanonimiseerd: herkende namen, contactgegevens en locaties verwijderd. Alleen bij voldoende n getoond."),
            ("Claimgrenzen",       "Onboarding is een groepscheck op de eerste werkperiode. Geen causale claims, geen uitvalpredicties."),
            ("Privacywaarborg",    "Verwerking conform AVG. Uitsluitend bestemd voor geautoriseerde gebruikers."),
        ]
        cells_r3 = [
            ("Hoe de banden werken",
             "Kwetsbaar punt (onder 5,0), aandachtspunt (5,0 tot 6,5) en relatief "
             "sterk (vanaf 6,5) zijn vaste schaaldrempels, geen vergelijking met "
             "andere organisaties. De rangorde tussen de eigen factoren weegt "
             "zwaarder dan de absolute kleur. Doordat de meetlat vast is, zijn "
             "meting en vervolgmeting een-op-een vergelijkbaar."),
        ]
    else:  # exit
        intro = ("Dit rapport bundelt patronen uit exitvragenlijsten tot een groepsbeeld van vertrek. "
                 "Geen diagnose, geen individuele beoordeling, geen causaliteitsclaim en geen voorspelling.")
        cells_r1 = [
            ("Groepsniveau",    "Alle scores zijn groepsgemiddelden. Geen individuele gegevens in dit rapport."),
            ("Drempelwaarden",  "5+ responses indicatief · 10+ voor patroonduiding · 5+ per groep voor segmenten"),
            ("Geen diagnose",   "Scores zijn methodisch verantwoord maar niet extern gevalideerd. Altijd combineren met managementgesprek."),
        ]
        cells_r2 = [
            ("Open toelichtingen","Automatisch geanonimiseerd: herkende namen, contactgegevens en locaties verwijderd. Alleen bij voldoende n getoond."),
            ("Claimgrenzen",     "Loep Vertrek is een terugkijkende groepsmeting op uitstroom. Geen causale claims, geen oordeel over vermijdbaarheid, geen verlooppredicties."),
            ("Privacywaarborg",  "Verwerking conform AVG. Uitsluitend bestemd voor geautoriseerde gebruikers."),
        ]
        cells_r3 = [
            ("Hoe de banden werken",
             "Kwetsbaar punt (onder 5,0), aandachtspunt (5,0 tot 6,5) en relatief "
             "sterk (vanaf 6,5) zijn vaste schaaldrempels, geen vergelijking met "
             "andere organisaties. De rangorde tussen de eigen factoren weegt "
             "zwaarder dan de absolute kleur. Doordat de meetlat vast is, zijn "
             "meting en vervolgmeting een-op-een vergelijkbaar."),
        ]

    def _cells(pairs: list[tuple[str, str]], full: bool = False) -> str:
        cls = "tc-full" if full else "tc"
        return "".join(
            f'<td class="{cls}"><div class="tt">{_h(t)}</div><div class="tb">{_h(b)}</div></td>'
            for t, b in pairs)

    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Methodiek, privacy &amp; interpretatiegrenzen</span>'}
  <div class="card" style="margin-bottom:14px;">
    <p style="font-size:11px;color:#374151;">{_h(intro)}</p>
  </div>
  <table class="tg"><tr>{_cells(cells_r1)}</tr></table>
  <table class="tg" style="margin-top:10px;"><tr>{_cells(cells_r2)}</tr></table>
  <table class="tg" style="margin-top:10px;"><tr>{_cells(cells_r3, full=True)}</tr></table>
</div>"""


def _segment_status_block(n: int, has_segment_data: bool = False,
                           reason: str = "n-grens", opener_html: str = "") -> str:
    """Segmentstatus — altijd zichtbaar, ook als segmenten niet worden getoond."""
    if has_segment_data:
        return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Segmentanalyse</span>'}
  <div class="card" style="border-left:4px solid #3C8D8A;">
    <div style="display:table;width:100%;">
      <div style="display:table-cell;vertical-align:middle;width:1%;white-space:nowrap;padding-right:14px;">
        <span style="font-size:9px;font-weight:700;background:#3C8D8A;color:#FFF;
          padding:3px 9px;border-radius:3px;letter-spacing:0.08em;text-transform:uppercase;">Beschikbaar</span>
      </div>
      <div style="display:table-cell;vertical-align:middle;font-size:10px;color:#374151;">
        Segmentanalyse beschikbaar: zie uitgebreide versie.
      </div>
    </div>
  </div>
</div>"""
    else:
        # Bewust GEEN eigen pagina (.pb): de melding is twee regels en sluit aan
        # onder de vorige sectie — voorheen stonden hier twee bijna-lege pagina's
        # achter elkaar (eNPS "niet gemeten" + deze), elk met één zin.
        return f"""<div class="sec">
  {opener_html or '<span class="slabel">Segmentanalyse</span>'}
  <div class="empty-state">
    <p style="margin-bottom:4px;">Segmentverschillen zijn niet getoond om herleidbaarheid te voorkomen.</p>
    <p style="margin-bottom:0;">Verdieping opent zodra voldoende responses per groep beschikbaar zijn.</p>
  </div>
</div>"""


# Mono-labelstijl voor degraded/duiding-regels in de segmenttabel (identiek
# aan de bestaande striplabels).
_SEG_MONO = ("font-family:'JetBrains Mono', monospace;font-size:8px;"
             "letter-spacing:0.08em;text-transform:uppercase;color:#94A3B8;")


def _segment_theme_cell(row: dict, factor_rows: dict[str, dict] | None,
                        scan_type: str) -> str:
    """Inhoud van de kolom "Laagste thema" (spec 2026-07-16 §3.2).

    Staffel (amendement 1): bij n=5-9 alleen factorlabel + duidingslabel,
    bewust geen decimale score (schijnprecisie + herleidbaarheid in kleine
    teams); vanaf MIN_DISTRIBUTION_N wel de score. Amendement 2: omitted > 0
    wordt altijd gemeld, ook bij n >= 10 (het getoonde thema is dan "onder
    voorbehoud").
    """
    if row.get("is_pooled", False):
        return f'<span style="{_SEG_MONO}">niet getoond: samengestelde restgroep</span>'
    info = (factor_rows or {}).get(row["department"])
    if not info:
        return f'<span style="{_SEG_MONO}">n.b.</span>'
    if not info.get("factors"):
        # Fail-loud: "alles onder de gate" is een andere staat dan "geen
        # factordata aangeleverd" — als er thema's zijn weggelaten, noem de
        # reden; kaal "n.b." alleen bij echt ontbrekende data.
        omitted = info.get("omitted", 0)
        if omitted > 0:
            return (f'<span style="{_SEG_MONO}">{omitted} thema(&#39;s) '
                    f'niet beoordeelbaar: te weinig antwoorden</span>')
        return f'<span style="{_SEG_MONO}">n.b.</span>'
    fk, avg, _nf = info["factors"][0]
    col = _factor_color(avg)
    if row["n"] >= MIN_DISTRIBUTION_N:
        second = (f'<span style="font-family:\'JetBrains Mono\', monospace;'
                  f'font-size:8px;color:{col};">{avg:.1f}/10</span>')
    else:
        second = (f'<span style="font-family:\'JetBrains Mono\', monospace;'
                  f'font-size:8px;color:#4A6070;">{_h(_factor_label(avg))}</span>')
    cell = (f'<span style="font-size:9.5px;color:{col};">'
            f'{_h(_fl(fk, scan_type))}</span><br>{second}')
    omitted = info.get("omitted", 0)
    if omitted > 0:
        cell += (f'<br><span style="{_SEG_MONO}">{omitted} thema(&#39;s) '
                 f'niet beoordeelbaar: te weinig antwoorden</span>')
    return cell


def _segment_factor_subblocks(segment_rows: list[dict],
                              factor_rows: dict[str, dict] | None,
                              scan_type: str) -> str:
    """Factorbeeld per afdeling (spec 2026-07-16 §3.2 punt 2): volledige
    uitsplitsing alleen voor niet-gepoolde afdelingen met n >= MIN_DISTRIBUTION_N
    én factordata; laagste eerst (volgorde komt uit _department_factor_rows)."""
    if not factor_rows:
        return ""
    subs = ""
    for row in segment_rows:
        if row.get("is_pooled", False) or row["n"] < MIN_DISTRIBUTION_N:
            continue
        info = factor_rows.get(row["department"])
        if not info or not info.get("factors"):
            continue
        frows = "".join(
            f'<tr><td class="iq">{_h(_fl(fk, scan_type))}</td>'
            f'<td class="is" style="width:14%;text-align:left;color:{_factor_color(avg)};">{avg:.1f}</td>'
            f'<td style="width:24%;color:{_factor_color(avg)};font-size:9.5px;">{_h(_factor_label(avg))}</td></tr>'
            for fk, avg, _nf in info["factors"])
        omline = ""
        if info.get("omitted", 0) > 0:
            omline = (f'<div style="{_SEG_MONO}margin-top:4px;">'
                      f'{info["omitted"]} thema(&#39;s) niet beoordeelbaar: '
                      f'te weinig antwoorden</div>')
        subs += (f'<div class="no-break" style="margin-top:14px;">'
                 f'<div style="font-family:\'Inter Tight\', sans-serif;font-weight:700;'
                 f'font-size:11px;margin-bottom:4px;">{_h(row["department"])} (n={row["n"]})</div>'
                 f'<table class="item-tbl">{frows}</table>{omline}</div>')
    if not subs:
        return ""
    intro = ('<p style="font-size:10px;color:#64748B;margin:16px 0 0;">'
             'Factorbeeld per afdeling: dezelfde vaste drempels als in het '
             'overzichtsprofiel (kwetsbaar onder 5,0, aandachtspunt 5,0 tot 6,5, '
             'relatief sterk vanaf 6,5).</p>')
    return intro + subs


def _segment_block(segment_rows: list[dict], factor_rows: dict[str, dict] | None = None,
                   scan_type: str = "exit", opener_html: str = "") -> str:
    """Segmentanalyse per afdeling: tabel + spreidingsstrip (spec 2026-07-11)
    + factorlaag met laagste thema en uitsplitsing (spec 2026-07-16).

    Strip-gate n>=10 (MIN_DISTRIBUTION_N): rapportbreed EEN regel — bij 5-9
    responses wel de rij (score/band), geen stippen. "Overige afdelingen"
    krijgt nooit een strip (samengestelde restgroep).

    scan_type is geïntroduceerd voor de product-specifieke factorlabels van
    de themalaag (_fl; spec 2026-07-16) — de rest van de tabel blijft
    scanbreed identiek. Zonder factor_rows (oude aanroepen) toont de
    themakolom "n.b." en verschijnen er geen subblokken: geen crash,
    geen fake data.
    """
    from backend.report_distribution import distribution_svg

    if not segment_rows:
        return _segment_status_block(0, has_segment_data=False, opener_html=opener_html)

    rows_html = ""
    for row in segment_rows:
        dept, n_, avg, scores = row["department"], row["n"], row["avg"], row["scores"]
        col = _factor_color(avg)
        is_rest = row.get("is_pooled", False)
        if is_rest:
            strip = f'<span style="{_SEG_MONO}">spreiding niet getoond: samengestelde restgroep</span>'
        elif len(scores) >= MIN_DISTRIBUTION_N:
            strip = distribution_svg(scores, width=200, height=22)
        else:
            strip = f'<span style="{_SEG_MONO}">spreiding vanaf 10 responses</span>'
        name_html = _h(dept) if is_rest else f"<strong>{_h(dept)}</strong>"
        invited = row.get("invited")
        if invited:  # 0 behandeld als "geen noemer" -- voorkomt 0/0, valt terug op alleen n
            pct = min(100, round(n_ / invited * 100))
            n_cell = (f'{n_}/{invited}<br>'
                      f'<span style="font-family:\'JetBrains Mono\', monospace;font-size:8px;'
                      f'color:#4A6070;">{pct}%</span>')
        else:
            n_cell = str(n_)
        theme_cell = _segment_theme_cell(row, factor_rows, scan_type)
        rows_html += (
            f'<tr><td class="iq" style="width:19%;">{name_html}</td>'
            f'<td style="width:9%;">{n_cell}</td>'
            f'<td class="is" style="width:11%;text-align:left;color:{col};">{avg:.1f}</td>'
            f'<td style="width:14%;color:{col};font-size:9.5px;">{_h(_factor_label(avg))}</td>'
            f'<td class="lt" style="width:20%;">{theme_cell}</td>'
            f'<td style="width:27%;">{strip}</td></tr>'
        )

    subblocks = _segment_factor_subblocks(segment_rows, factor_rows, scan_type)

    lowest = segment_rows[0]
    low_note = ""
    if not lowest.get("is_pooled", False):
        # Noemer in de conclusie zelf (feedbackronde 2026-07-13): een manager
        # met een lage score moet niet zelf hoeven ontdekken dat n klein is —
        # het rapport is de "n=5"-discussie voor, i.p.v. er munitie voor te zijn.
        _low_inv = lowest.get("invited")
        _low_basis = (f'{lowest["n"]} van de {_low_inv} uitgenodigden vulden in'
                      if _low_inv else f'{lowest["n"]} responses')
        # Themazin (spec 2026-07-16 §3.2 punt 3): zelfde staffel als de kolom;
        # geen factordata = geen zin (geen fake). Band-neutrale formulering:
        # "de druk zit op X" overdrijft wanneer het laagste thema zelf nog
        # relatief sterk scoort.
        theme_sentence = ""
        low_info = (factor_rows or {}).get(lowest["department"])
        if low_info and low_info.get("factors"):
            _lfk, _lavg, _lnf = low_info["factors"][0]
            _llbl = _h(_lc(_fl(_lfk, scan_type)))
            if lowest["n"] >= MIN_DISTRIBUTION_N:
                theme_sentence = f' Het laagst scorende thema daar is {_llbl} ({_lavg:.1f}/10).'
            else:
                theme_sentence = (f' Het laagst scorende thema daar is {_llbl} '
                                  f'({_h(_factor_label(_lavg).lower())}).')
        low_note = (
            f'<div class="navy-anchor">'
            f'<div class="navy-anchor-eyebrow">Startpunt voor de bespreking</div>'
            f'<p><strong>{_h(lowest["department"])}</strong> heeft de laagste score '
            f'({lowest["avg"]:.1f}/10; {_low_basis}). Gebruik dit om te toetsen wat hier '
            f'speelt, geen ranking of oordeel.{theme_sentence}</p></div>')

    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Segmentanalyse per afdeling</span>'}
  {_intro("segmentanalyse")}
  <div class="card">
    <table class="item-tbl">{rows_html}</table>
    {subblocks}
    {low_note}
  </div>
</div>"""


def _themed_quotes(texts: list[str], scan_type: str = "exit",
                   top_fkeys: list[str] | None = None, n_total: int = 0) -> str:
    """Open toelichtingen: alles tonen t/m MAX_QUOTES, geen thema-indeling.

    Trefwoord-classificatie is bewust verwijderd (besluit 2026-04-09 + spec
    2026-07-11): trefwoorden onderscheiden geen negatie ("met mijn leidinggevende
    was niets mis" kreeg het label Leiderschap). Duiding gebeurt in de
    begeleide managementbespreking, niet geautomatiseerd in het rapport.

    top_fkeys/n_total: ongebruikt, alleen behouden voor call-site-compatibiliteit
    (bestaande aanroepen geven ze positioneel door). Niet nodig voor nieuwe callers.
    """
    if len(texts) < MIN_QUOTES_N:
        return (f'<div class="empty-state">Open toelichtingen worden getoond bij minimaal '
                f'{MIN_QUOTES_N} antwoorden. Huidig: {len(texts)}.</div>')

    note = ""
    if len(texts) > MAX_QUOTES:
        note = (f'<div class="cbox" style="margin-bottom:12px;font-size:10px;color:#374151;">'
                f'Getoond: de eerste {MAX_QUOTES} van {len(texts)} in ontvangstvolgorde, '
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
            f'<div class="quote-anon">Automatisch geanonimiseerd: herkende namen en contactgegevens verwijderd</div>'
            f'</div></div>'
        )
    return f'{note}{cards}'


# ─── Data builder ─────────────────────────────────────────────────────────────

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


def _enrich_segment_rows_with_invited(segment_rows: list[dict],
                                      segment_departments: list[dict] | None) -> list[dict]:
    """Voegt per rij de noemer (invited) toe via label-match op de campagnelijst
    (spec 2026-07-12 §6). Ontbrekende noemer of pooled rij -> invited=None
    (eerlijke degradatie: alleen n tonen, geen fake percentage)."""
    invited_by_label = {d.get("label"): d.get("invited_count")
                        for d in (segment_departments or [])}
    for row in segment_rows:
        row["invited"] = (None if row.get("is_pooled")
                          else invited_by_label.get(row["department"]))
    return segment_rows


def _department_segment_rows(respondents: list[dict]) -> list[dict]:
    """Segmentrijen voor het rapport (regels geport uit legacy report.py:1680-1795).

    Input: [{"department": str|None, "signal_score": float}] per afgeronde respondent.
    Kwalificatie: n >= MIN_SEGMENT_N per afdeling; minimaal 2 kwalificerende
    afdelingen (anders []); max 8 rijen, kleinere groepen samen als "Overige
    afdelingen" (alleen als die bucket zelf ook n >= MIN_SEGMENT_N haalt).
    Sortering: laagste gemiddelde eerst (grootste aandachtspunt bovenaan);
    "Overige afdelingen" altijd onderaan.
    """
    grouped: dict[str, list[float]] = {}
    for r in respondents:
        dept, score = r.get("department"), r.get("signal_score")
        if not dept or score is None:
            continue
        grouped.setdefault(str(dept), []).append(float(score))

    eligible = {d: v for d, v in grouped.items() if len(v) >= MIN_SEGMENT_N}
    if len(eligible) < 2:
        return []

    rows = [{"department": d, "n": len(v), "avg": round(sum(v) / len(v), 2),
             "scores": sorted(v), "is_pooled": False} for d, v in eligible.items()]
    rows.sort(key=lambda r: (r["avg"], -r["n"], r["department"]))

    visible, overflow = rows[:8], rows[8:]
    rest: list[float] = []
    for d, v in grouped.items():
        if d not in eligible:
            rest.extend(v)
    for row in overflow:
        rest.extend(row["scores"])
    if len(rest) >= MIN_SEGMENT_N:
        visible = visible[:7]
        visible.append({"department": "Overige afdelingen", "n": len(rest),
                        "avg": round(sum(rest) / len(rest), 2), "scores": sorted(rest),
                        "is_pooled": True})
    return visible


def _department_factor_rows(respondents: list[dict],
                            factor_items_map: dict[str, list]) -> dict[str, dict]:
    """Per afdeling: factorscores voor de segment-factorlaag (spec 2026-07-16 §3).

    Input per afgeronde respondent: {"department": str|None, "org_raw": dict}.
    Output per afdeling met >= MIN_SEGMENT_N respondenten:
      {dept: {"factors": [(fk, avg, n_factor)], "omitted": int}}

    Regels:
    - Alleen factoren in ORG_FACTOR_KEYS én factor_items_map doen mee
      (SDT-dimensies nooit; zelfde filter als _select_priority_factors).
    - Individuele factorscore = gemiddelde van de beantwoorde items van die
      respondent, geschaald via _scale_to_10. Geen beantwoorde items =
      respondent telt niet mee voor de n van die factor.
    - Per-factor-gate: factor alleen in "factors" bij n_factor >= MIN_SEGMENT_N;
      wat de gate niet haalt telt als "omitted" (eerlijke meldregel, geen stil gat).
    - "factors" gesorteerd laagste avg eerst; gelijkspel alfabetisch op key.
    """
    participating = [fk for fk in factor_items_map if fk in ORG_FACTOR_KEYS]
    grouped: dict[str, list[dict]] = {}
    for r in respondents:
        dept = r.get("department")
        if not dept:
            continue
        grouped.setdefault(str(dept), []).append(r.get("org_raw") or {})

    out: dict[str, dict] = {}
    for dept, raws in grouped.items():
        if len(raws) < MIN_SEGMENT_N:
            continue
        factors: list[tuple[str, float, int]] = []
        omitted = 0
        for fk in participating:
            keys = [ik for ik, _q in factor_items_map[fk]]
            scores: list[float] = []
            for raw in raws:
                vals = [float(raw[k]) for k in keys if raw.get(k) is not None]
                if vals:
                    scores.append(_scale_to_10(sum(vals) / len(vals)))
            if len(scores) >= MIN_SEGMENT_N:
                factors.append((fk, round(sum(scores) / len(scores), 2), len(scores)))
            else:
                omitted += 1
        factors.sort(key=lambda t: (t[1], t[0]))
        out[dept] = {"factors": factors, "omitted": omitted}
    return out


def build_report_data(campaign_id: str, db: Session) -> dict[str, Any]:
    camp: Campaign = (
        db.query(Campaign)
        .options(joinedload(Campaign.organization),
                 selectinload(Campaign.respondents).selectinload(Respondent.response))
        .filter(Campaign.id == campaign_id).first()
    )
    if not camp:
        raise ValueError(f"Campaign niet gevonden: {campaign_id}")

    org        = camp.organization
    scan_type  = camp.scan_type
    scan_meta  = get_scan_definition(scan_type)
    product_module = get_product_module(scan_type)

    _mode    = (camp.delivery_mode or "baseline").lower()
    mode_lbl = "Live" if _mode == "live" else "Baseline"
    scan_lbl = scan_meta.get("report_title",
        f"Loep Vertrek {mode_lbl}" if scan_type == "exit" else scan_meta["product_name"])
    now_str  = datetime.now(timezone.utc).strftime("%d-%m-%Y")

    respondents = camp.respondents
    completed   = [r for r in respondents if r.completed and r.response]
    responses: list[SurveyResponse] = [r.response for r in completed if r.response]
    n_invited   = len(respondents)
    n_completed = len(responses)
    completion  = round(n_completed / n_invited * 100, 1) if n_invited else 0.0

    risk_sc  = [r.risk_score for r in responses if r.risk_score is not None]
    avg_risk = round(_mean(risk_sc), 2) if risk_sc else None
    eng_sc   = [r.uwes_score for r in responses if r.uwes_score is not None]
    avg_eng  = round(_mean(eng_sc), 2) if eng_sc else None
    to_sc    = [r.turnover_intention_score for r in responses if r.turnover_intention_score is not None]
    avg_to   = round(_mean(to_sc), 2) if to_sc else None
    si_sc    = [round((float(r.stay_intent_score) - 1) / 4 * 9 + 1, 2)
                for r in responses if r.stay_intent_score is not None]
    avg_si   = round(_mean(si_sc), 2) if si_sc else None

    band_counts = {"HOOG": 0, "MIDDEN": 0, "LAAG": 0}
    for r in responses:
        if r.risk_band in band_counts: band_counts[r.risk_band] += 1

    pattern_input = [
        {"org_scores": r.response.org_scores, "sdt_scores": r.response.sdt_scores,
         "risk_score": r.response.risk_score, "signal_score": r.response.risk_score,
         "preventability": r.response.preventability,
         "exit_reason_code": r.response.exit_reason_code,
         "stay_intent_score": r.response.stay_intent_score,
         "direction_signal_score": r.response.stay_intent_score,
         "contributing_reason_codes": list((r.response.pull_factors_raw or {}).keys()),
         "department": r.department, "role_level": r.role_level}
        for r in completed
    ]
    pattern     = detect_patterns(pattern_input)
    has_pattern = pattern.get("sufficient_data", False)
    factor_avgs = pattern.get("factor_averages", {}) if has_pattern else {}
    top_risks   = pattern.get("top_risk_factors", []) if has_pattern else []
    strong_work = pattern.get("strong_work_signal_pct") if has_pattern else None
    top_exit_lbl = (pattern.get("top_exit_reasons", [{}])[0].get("label")
                    if has_pattern and pattern.get("top_exit_reasons") else None)
    top_cont_lbl = (pattern.get("top_contributing_reasons", [{}])[0].get("label")
                    if has_pattern and pattern.get("top_contributing_reasons") else None)
    top_fkeys   = [f for f, _ in top_risks[:2]]
    top_flabels = [FACTOR_LABELS_NL.get(f, f) for f in top_fkeys]

    sig_vis: float | None = None
    if scan_type == "exit":
        vis = [s.get("signal_visibility_score")
               for s in (((r.full_result or {}).get("exit_context_summary") or {}) for r in responses)
               if isinstance(s.get("signal_visibility_score"), (int, float))]
        if vis: sig_vis = _mean(vis)

    sdt_avgs: dict[str, float] = {}
    for dim in ("autonomy", "competence", "relatedness"):
        if dim in factor_avgs: sdt_avgs[dim] = factor_avgs[dim]
        else:
            vals = [r.sdt_scores.get(dim) for r in responses if r.sdt_scores and r.sdt_scores.get(dim) is not None]
            if vals: sdt_avgs[dim] = round(_mean(vals), 2)

    raw_acc: dict[str, list[float]] = defaultdict(list)
    for r in responses:
        for k, v in (r.sdt_raw or {}).items(): raw_acc[k].append(float(v))
        for k, v in (r.org_raw or {}).items(): raw_acc[k].append(float(v))
    sdt_item_avgs = {k: _scale_to_10(_mean(v), reverse=(k in SDT_REVERSE_ITEMS))
                     for k, v in raw_acc.items() if k.startswith("B")}
    org_item_avgs = {k: _scale_to_10(_mean(v))
                     for k, v in raw_acc.items() if not k.startswith("B")}

    exit_r_cnt  = Counter(r.exit_reason_code for r in responses if r.exit_reason_code)
    exit_r_dist = [{"code": c, "label": EXIT_REASON_LABELS_NL.get(c, c), "count": n_}
                   for c, n_ in exit_r_cnt.most_common(5)]
    cont_cnt    = Counter()
    for r in responses:
        for k in (r.pull_factors_raw or {}).keys(): cont_cnt[k] += 1
    cont_dist   = [{"code": c, "label": EXIT_REASON_LABELS_NL.get(c, c), "count": n_}
                   for c, n_ in cont_cnt.most_common(5)]
    prev_cnt    = Counter(r.preventability for r in responses if r.preventability)
    prev_dist   = dict(prev_cnt)

    raw_texts  = [r.open_text_raw for r in responses if r.open_text_raw and r.open_text_raw.strip()]
    open_texts = list(dict.fromkeys(anonymize_text(t) for t in raw_texts))

    # Verdiepingsvragen (spec 6): alleen exit/retention hebben verdiepingsdata.
    deepening_agg: dict[str, Any] = {}
    if scan_type in ("exit", "retention"):
        deepening_agg = aggregate_deepening(
            [(r.org_raw or {}, r.deepening_responses or []) for r in responses],
            scan_type)
        if not _deepening_campaign_active(deepening_agg):
            # Pre-feature campagne: nergens een verdieping aangeboden -> geen blokken.
            deepening_agg = {}

    is_retention      = scan_type == "retention"
    retention_profile = None
    if is_retention and avg_risk is not None:
        retention_profile = compute_retention_signal_profile(
            risk_score=avg_risk, engagement_score=avg_eng,
            turnover_intention_score=avg_to, stay_intent_score=avg_si)

    from backend.report import _build_exit_playbook_rows, _build_retention_playbook_rows
    exit_pbs = _build_exit_playbook_rows(top_risks=top_risks) if scan_type == "exit" and has_pattern else []
    ret_pbs  = (_build_retention_playbook_rows(top_risks=top_risks,
                    playbooks=product_module.get_action_playbooks_payload())
                if is_retention and has_pattern and hasattr(product_module, "get_action_playbooks_payload") else [])

    if is_retention:
        msp = product_module.get_management_summary_payload(
            top_factor_labels=top_flabels, top_factor_keys=top_fkeys,
            retention_signal_profile=retention_profile,
            avg_engagement=avg_eng, avg_turnover_intention=avg_to,
            avg_stay_intent=avg_si, retention_theme_title=None, enps_summary=None)
    elif scan_type == "onboarding":
        msp = product_module.get_management_summary_payload(
            top_factor_labels=top_flabels, top_factor_keys=top_fkeys,
            avg_stay_intent=avg_si, top_exit_reason_label=top_exit_lbl,
            top_contributing_reason_label=top_cont_lbl,
            strong_work_signal_pct=strong_work, signal_visibility_average=sig_vis,
            total_replacement_cost_eur=None)
    else:
        msp = product_module.get_management_summary_payload(
            top_factor_labels=top_flabels, top_factor_keys=top_fkeys,
            top_exit_reason_label=top_exit_lbl, top_contributing_reason_label=top_cont_lbl,
            strong_work_signal_pct=strong_work, signal_visibility_average=sig_vis,
            enps_summary=None, total_replacement_cost_eur=None)

    nsp = product_module.get_next_steps_payload(
        top_focus_labels=top_flabels, top_focus_keys=top_fkeys)

    org_sections: list[dict] = scan_meta.get("org_sections", [])
    factor_items_map = {sec["key"]: sec["items"] for sec in org_sections
                        if "key" in sec and "items" in sec}
    factor_resp_scores = _per_respondent_factor_scores(
        factor_items_map, [r.org_raw or {} for r in responses])
    sdt_items: list[tuple[str, str]] = scan_meta.get("sdt_items", [])

    # Segment op GEZONDHEID (11 - risk), niet op risk zelf: _department_segment_rows
    # + _segment_block behandelen signal_score als health-schaal (laag = rood =
    # aandachtspunt, sortering laagste eerst). Rechtstreeks de risk-score voeden
    # keerde de polariteit om — de gezondste afdeling werd als grootste
    # aandachtspunt/startpunt gemarkeerd, de slechtste als "relatief sterk".
    segment_rows = _department_segment_rows([
        {"department": r.department,
         "signal_score": (11.0 - r.response.risk_score) if r.response.risk_score is not None else None}
        for r in completed
    ])
    segment_rows = _enrich_segment_rows_with_invited(segment_rows, camp.segment_departments)

    # Factorlaag per afdeling (spec 2026-07-16): laagste thema + uitsplitsing.
    segment_factor_rows = _department_factor_rows(
        [{"department": r.department, "org_raw": r.response.org_raw or {}} for r in completed],
        factor_items_map)

    # eNPS staat canoniek in full_result["enps"]["raw_score"] (zoals de submit-flow
    # het wegschrijft, backend/products/*/scoring.py). Voorheen werd hier het
    # topniveau "enps_score" gelezen — een sleutel die de echte flow nooit schrijft,
    # waardoor enps_available voor elke echte campagne False werd en het rapport
    # onterecht "niet gemeten in deze wave" meldde.
    enps_vals = [float(fr["enps"]["raw_score"]) for r in responses
                 if isinstance((fr := (r.full_result or {})).get("enps"), dict)
                 and fr["enps"].get("raw_score") is not None]
    enps_available = len(enps_vals) >= MIN_QUOTES_N
    enps_score: int | None = None
    if enps_available:
        promoters  = sum(1 for v in enps_vals if v >= 9)
        detractors = sum(1 for v in enps_vals if v <= 6)
        enps_score = round((promoters - detractors) / len(enps_vals) * 100)

    return dict(
        campaign_id=campaign_id, scan_type=scan_type, scan_lbl=scan_lbl,
        org_name=org.name if org else "", campaign_name=camp.name,
        generated_at=now_str, delivery_mode=mode_lbl,
        n_invited=n_invited, n_completed=n_completed, completion_pct=completion,
        avg_risk=avg_risk, avg_eng=avg_eng, avg_to=avg_to, avg_si=avg_si,
        band_counts=band_counts, has_pattern=has_pattern,
        factor_avgs=factor_avgs, top_risks=top_risks,
        top_fkeys=top_fkeys, top_flabels=top_flabels,
        strong_work=strong_work, top_exit_lbl=top_exit_lbl, top_cont_lbl=top_cont_lbl,
        sig_vis=sig_vis, sdt_avgs=sdt_avgs,
        sdt_item_avgs=sdt_item_avgs, org_item_avgs=org_item_avgs,
        exit_r_dist=exit_r_dist, cont_dist=cont_dist,
        prev_dist=prev_dist, open_texts=open_texts,
        deepening_agg=deepening_agg,
        retention_profile=retention_profile,
        exit_pbs=exit_pbs, ret_pbs=ret_pbs, msp=msp, nsp=nsp,
        factor_items_map=factor_items_map, sdt_items=sdt_items,
        enps_available=enps_available, enps_score=enps_score,
        factor_resp_scores=factor_resp_scores,
        intent_resp={"stay": si_sc, "turnover": to_sc, "engagement": eng_sc},
        segment_rows=segment_rows,
        segment_factor_rows=segment_factor_rows,
    )


# ─── Overzichtsprofiel (T6) ──────────────────────────────────────────────────

def _rag_color(score: float | None) -> str:
    if score is None: return "#CBD5E1"
    if score < 5.0:  return RAG_HIGH
    if score < 6.5:  return RAG_MID
    return RAG_LOW


def _factor_bar_row(label: str, score: float | None) -> str:
    pct = int((score or 0) / 10 * 100)
    col = _rag_color(score)
    interp = _factor_label(score)
    track = (f'<svg width="100%" height="14" viewBox="0 0 200 14" preserveAspectRatio="none">'
             f'<rect x="0" y="3" width="200" height="8" fill="#EDE6DA"/>'
             f'<rect x="0" y="3" width="{pct*2}" height="8" fill="{col}"/></svg>')
    return (f'<div class="fbar-row"><div class="fbar-name">{_h(label)}</div>'
            f'<div class="fbar-track">{track}</div>'
            f'<div class="fbar-score" style="color:{col};">{_score_str(score)}</div>'
            f'<div class="fbar-label" style="color:{col};">{_h(interp)}</div></div>')


def _overzicht_summary_and_bands(profile_factors: list[tuple[str, float | None]]) -> tuple[str, dict[str, list[str]]]:
    """Bouwt de samenvattingszin + band-indeling voor het overzichtsprofiel.

    Sorteert eerst op score: voorheen werd de eerste factor in kolomvolgorde
    genoemd ("Leiderschap vraagt als eerste aandacht") terwijl de rest van het
    rapport de laagst scorende factor vooropzet — het rapport sprak zichzelf tegen.
    """
    ranked = sorted([(l, s) for l, s in profile_factors if s is not None], key=lambda x: x[1])
    kwetsbaar = [l for l, s in ranked if s < 5.0]
    aandacht  = [l for l, s in ranked if 5.0 <= s < 6.5]
    sterk     = [l for l, s in ranked if s >= 6.5]
    if kwetsbaar and sterk:
        summary = (f"{kwetsbaar[0]} is het {'enige' if len(kwetsbaar) == 1 else 'duidelijkste'} "
                   f"kwetsbare punt. {sterk[-1]} vormt een relatief sterke basis.")
    elif kwetsbaar:
        summary = f"{kwetsbaar[0]} is het duidelijkste kwetsbare punt; geen enkele factor scoort relatief sterk."
    elif aandacht:
        summary = f"Geen factor scoort kritisch. De laagste score zit bij {aandacht[0]}."
    elif sterk:
        summary = "Factorprofiel toont een overwegend relatief sterk beeld."
    else:
        # Geen enkele factorscore beschikbaar (n<10 -> factor_avgs leeg): eerlijk
        # degraderen i.p.v. een positieve claim zonder data (fail-loud).
        summary = "Onvoldoende responses (<10) voor een groepsprofiel op factorniveau."
    return summary, {"kwetsbaar": kwetsbaar, "aandacht": aandacht, "sterk": list(reversed(sterk))}


def _overzichtsprofiel(factors: list[tuple[str, float | None]],
                       summary: str = "", bands: dict[str, list[str]] | None = None,
                       opener_html: str = "") -> str:
    ranked = sorted(factors, key=lambda x: (x[1] is None, x[1]))
    rows = "".join(_factor_bar_row(lbl, sc) for lbl, sc in ranked)
    # Legendatermen = exact dezelfde woorden als _factor_label (rijlabels, p.02,
    # verdieping-titels). Voorheen zei de legenda "aandachtspunt/gemengd" waar de
    # rijen "Kwetsbaar punt/Aandachtspunt" zeiden — drie labelsets voor dezelfde
    # drempels op één pagina.
    legend = (f'<p style="font-size:9px;color:#64748B;margin-top:12px;">'
              f'<span style="color:{RAG_HIGH};">&#9632;</span> kwetsbaar punt &nbsp; '
              f'<span style="color:{RAG_MID};">&#9632;</span> aandachtspunt &nbsp; '
              f'<span style="color:{RAG_LOW};">&#9632;</span> relatief sterk</p>')
    summary_html = (
        f'<p style="font-size:11px;color:#374151;max-width:66ch;margin-bottom:18px;">{_h(summary)}</p>'
        if summary else ""
    )
    # Uitsplitsing per band (dezelfde kwetsbaar/aandacht/sterk-indeling die de
    # summary-zin al gebruikt) als leesbare tekst i.p.v. alleen balkjes.
    # Onder elkaar en groter i.p.v. drie smalle kolommen (feedback 2026-07-16):
    # de pagina was half leeg en de kolommen lazen als voetnoot.
    breakdown_html = ""
    if bands:
        blocks = ""
        band_meta = [
            ("kwetsbaar punt", bands.get("kwetsbaar") or [], RAG_HIGH),
            ("aandachtspunt", bands.get("aandacht") or [], RAG_MID),
            ("relatief sterk", bands.get("sterk") or [], RAG_LOW),
        ]
        for title, labels, color in band_meta:
            if not labels:
                continue
            items = "".join(f"<li>{_h(lbl)}</li>" for lbl in labels)
            blocks += (f'<div style="margin-bottom:18px;">'
                       f'<div style="font-family:\'JetBrains Mono\', monospace;font-size:9.5px;letter-spacing:0.1em;'
                       f'text-transform:uppercase;color:{color};margin-bottom:7px;">{_h(title)} ({len(labels)})</div>'
                       f'<ul style="font-size:11.5px;color:#243247;line-height:1.9;margin:0;padding-left:16px;">{items}</ul>'
                       f'</div>')
        if blocks:
            breakdown_html = f'<div style="margin-top:26px;">{blocks}</div>'
    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Overzichtsprofiel</span>'}
  {_intro("overzichtsprofiel")}
  {summary_html}
  <div class="card">{rows}{legend}{breakdown_html}</div>
</div>"""


# ─── Vertrekcontext (T7) ──────────────────────────────────────────────────────

def _vertrekcontext(*, exit_reasons: list[tuple[str, int]],
                    contributing: list[tuple[str, int]], n: int,
                    primary_factor_label: str, opener_html: str = "") -> str:
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
               f"genoemde vertrekreden als de laagste factor in het overzichtsprofiel. "
               f"Daarom staat het bovenaan.</p>")
    else:
        # Geen substring-match tussen hoofdreden en laagste factor: benoem beide
        # feiten zonder een verbandclaim ("versterken elkaar") die de data niet draagt.
        rel = (f"<p style='margin-bottom:0;'>De meest genoemde reden en de laagst "
               f"scorende factor belichten elk een eigen invalshoek. Beide komen "
               f"terug in de factordiepte hierna.</p>")

    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Vertrekcontext</span>'}
  {_intro("vertrekcontext")}
  <div class="tcol">
    <div class="tc-l"><div class="card accent"><h3>Hoofdredenen van vertrek (top 3)</h3>
      <table class="item-tbl">{_reason_rows(exit_reasons)}</table></div></div>
    <div class="tc-r"><div class="card"><h3>Speelde ook mee</h3>
      <table class="item-tbl">{_reason_rows(contributing)}</table></div></div>
  </div>
  <div class="card navy" style="background:#fff;"><h3>Relatie met het overzichtsprofiel</h3>{rel}</div>
</div>"""


# ─── Behoudscontext (T7-retention) ───────────────────────────────────────────

def _behoudscontext(*, retention_score: float | None, stay_intent: float | None,
                    turnover: float | None, engagement: float | None,
                    primary_factor: str, intent_resp: dict | None = None,
                    opener_html: str = "") -> str:
    """Retention-exclusive section: actuele behoudscontext op groepsniveau.

    Signalen staan bewust onder elkaar (niet naast elkaar in één balk): titel
    eerst, dan de uitleg van wat het meet, dan pas de score — anders valt de
    uitleg weg onder de opvallende cijfers (feedback: Behoudssignaal en
    Blijfintentie waren zo nauwelijks te onderscheiden).
    """
    rows = ""
    if retention_score is not None:
        # retention_score = avg_risk (RISICO-schaal: hoog = slecht). Note + kleur
        # moeten dezelfde polariteit hebben als de cover-band (_band): hoog risk =
        # "onder druk" / rood. Voorheen las de note-ladder hoog = "sterk" / teal,
        # tegengesteld aan de cover binnen hetzelfde rapport.
        col = _band(retention_score, "retention")[1]
        note = ("onder druk" if retention_score >= RISK_HIGH else
                "vraagt aandacht" if retention_score >= RISK_MEDIUM else
                "sterk")
        rows += (f'<div class="sigrow"><div class="sigrow-title">Behoudssignaal</div>'
                 f'<div class="sigrow-body">Werkfactoren en werkbeleving samengebracht op groepsniveau.</div>'
                 f'<div><span class="sigrow-score" style="color:{col};">{retention_score:.1f}/10</span>'
                 f'<span class="sigrow-note">{note}</span></div></div>')
    if stay_intent is not None:
        scol = _rag_color(stay_intent)
        rows += (f'<div class="sigrow"><div class="sigrow-title">Blijfintentie</div>'
                  f'<div class="sigrow-body">&ldquo;Als het aan mij ligt, werk ik over 12 maanden nog steeds hier.&rdquo; '
                  f'Enkelvoudige richtingsvraag, indicatief.</div>'
                  f'<div><span class="sigrow-score" style="color:{scol};">{stay_intent:.1f}/10</span></div></div>')
    if turnover is not None:
        tcol = _rag_color(10 - turnover)
        note = ("laag" if turnover <= 3.0 else
                "beperkt" if turnover <= 5.0 else
                "zichtbaar" if turnover <= 6.5 else
                "hoog: actief vertrekrisico")
        rows += (f'<div class="sigrow"><div class="sigrow-title">Vertrekintentie</div>'
                  f'<div class="sigrow-body">&ldquo;Ik denk er serieus over na te vertrekken&rdquo; + &ldquo;Ik zoek actief.&rdquo; '
                  f'Gemiddelde van 2 stellingen.</div>'
                  f'<div><span class="sigrow-score" style="color:{tcol};">{turnover:.1f}/10</span>'
                  f'<span class="sigrow-note">{note}</span></div></div>')
    if engagement is not None:
        ecol = _factor_color(engagement)
        note = ("hoog" if engagement >= 7.5 else
                "gemiddeld" if engagement >= 6.0 else
                "laag: geen buffer" if engagement >= 4.5 else
                "zorgelijk laag")
        rows += (f'<div class="sigrow"><div class="sigrow-title">Bevlogenheid</div>'
                  f'<div class="sigrow-body">Energie &middot; Inspiratie &middot; Zin om te gaan (UWES). Gemiddelde van 3 stellingen.</div>'
                  f'<div><span class="sigrow-score" style="color:{ecol};">{engagement:.1f}/10</span>'
                  f'<span class="sigrow-note">{note}</span></div></div>')

    stat_rows = f'<div class="card">{rows}</div>' if rows else ""

    strips = ""
    for key, label, invert in (
        ("stay", "Blijfintentie", False),
        # Vertrekintentie is hoog=slecht; distribution_block is health-georiënteerd
        # (rechts/hoog = teal = sterk). Zonder inversie kleurden hoge
        # vertrekgedachten groen "Sterk". Inverteren (11 - v) zet ze links/rood,
        # consistent met de rest van de behoudscontext en de turnover-sigrow.
        ("turnover", "Vertrekintentie (links = meer vertrekgedachten)", True),
        ("engagement", "Bevlogenheid", False),
    ):
        vals = (intent_resp or {}).get(key, [])
        if invert:
            vals = [11.0 - v for v in vals if v is not None]
        blk = distribution_block(vals, width=660, height=52, dot_r=4.5, label_size=9)
        if blk:
            strips += (f'<div style="margin-top:26px;"><div class="spread-title">'
                       f'{label}</div>{blk}</div>')

    page = f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Behoudscontext</span>'}
  {_intro("behoudscontext")}
  {stat_rows}
</div>"""

    # Spreidingsbalken samen op een eigen pagina (feedback 2026-07-16): onder
    # de sigrows braken ze onvoorspelbaar over de paginagrens (derde balk
    # verweesd op een eigen pagina) en waren ze klein. Nu: eigen pagina,
    # groot formaat, met een korte leesuitleg.
    if strips:
        page += f"""<div class="pb sec">
  {_ChapterCounter.vervolg("Behoudscontext")}
  <h3>Spreiding per signaal</h3>
  <p class="sec-intro" style="margin-top:2px;">Elke stip is &eacute;&eacute;n respondent; de donkere lijn markeert het
    groepsgemiddelde. Zo zie je of een gemiddelde &eacute;&eacute;n gedeelde ervaring beschrijft
    of juist twee uiteenlopende groepen.</p>
  {strips}
</div>"""
    return page


# ─── ExitScan renderer ────────────────────────────────────────────────────────

def render_exit_report_html(data: dict) -> str:
    n           = data["n_completed"]
    avg_risk    = data["avg_risk"]
    fl          = _friction_label(avg_risk)
    fcol        = _friction_color(avg_risk)
    rdsp        = _score_str(avg_risk)
    top_fkeys   = data["top_fkeys"]
    top_flabels = data["top_flabels"]
    fa          = data["factor_avgs"]
    fim         = data["factor_items_map"]
    oim         = data["org_item_avgs"]
    sim         = data["sdt_item_avgs"]
    sdt_a       = data["sdt_avgs"]
    nsp         = data["nsp"]
    ch          = _ChapterCounter()

    # ── Prioriteringsraster-rangorde (spec 2026-07-18 par. 4: één ranking per
    # rapport) — vroeg berekend zodat zowel de Bestuurlijke read (p.02) als de
    # verdieping-detailkeuze én de sluitende gespreksagenda dezelfde volgorde
    # gebruiken. ────────────────────────────────────────────────────────────
    _code_to_count = {r["code"]: r["count"] for r in data["exit_r_dist"]}
    exit_code_counts = {fk: _code_to_count.get(FACTOR_EXIT_CODE.get(fk), 0) for fk in fa}
    deep_agg = data.get("deepening_agg") or {}
    _raster_rows = rank_factors(
        "exit", fa, data.get("factor_resp_scores") or {}, deep_agg,
        exit_reason_counts=exit_code_counts,
        labels={fk: _fl(fk, "exit") for fk in ORG_FACTOR_KEYS})

    sorted_f = sorted([(fk, fa.get(fk)) for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None],
                      key=lambda x: x[1])
    bottom_2 = [fk for fk, _ in sorted_f[:2]]
    top_2    = [fk for fk, _ in sorted_f[-2:]]
    low_f    = sorted_f[0]  if sorted_f else None
    high_f   = sorted_f[-1] if sorted_f else None

    # ── Executive summary ─────────────────────────────────────────────────────
    low_lbl  = FACTOR_LABELS_NL.get(low_f[0], "")  if low_f  else ""
    low_sc   = low_f[1]                             if low_f  else None
    high_lbl = FACTOR_LABELS_NL.get(high_f[0], "") if high_f else ""
    high_sc  = high_f[1]                            if high_f else None

    # ── Cover ─────────────────────────────────────────────────────────────────
    opening_q = "Wat speelde mee bij vertrek?"
    primary_signal = low_lbl or high_lbl or "—"
    cover_stats = [
        ("Respondenten", str(n)),
        ("Respons", f"{round(data['completion_pct'])}%"),  # afgerond — p.03 toont hetzelfde getal
        ("Eerste aandachtspunt", primary_signal),
    ]
    s = _cover(scan_label=data["scan_lbl"], scan_type="exit", org_name=data["org_name"],
               period=data["campaign_name"], opening_question=opening_q, stats=cover_stats)
    er_top   = data["exit_r_dist"][0]["label"] if data["exit_r_dist"] else ""

    # Directe executive copy
    if low_lbl and er_top and low_lbl.lower() in er_top.lower():
        exec_line = f"Het vertrekbeeld is {fl.lower().replace(' frictiebeeld','').replace(' vertrekbeeld','')}, maar {low_lbl} springt er duidelijk uit: het is zowel de laagste factor als de meest genoemde vertrekreden."
    elif low_lbl and er_top:
        exec_line = f"Het vertrekbeeld is {fl.lower().replace(' frictiebeeld','').replace(' vertrekbeeld','')}. {low_lbl} scoort het laagst ({_score_str(low_sc)}); {er_top} is de meest genoemde vertrekreden."
    elif avg_risk:
        exec_line = f"De frictiescore van {rdsp} wijst op een {fl.lower()}."
    else:
        exec_line = "Zie factoranalyse en vertrekcontext voor details."
    # Sterke factor bewust NIET in de titel: die staat al in de subtekst
    # (totaalbeeld) — voorheen stond dezelfde observatie 2x binnen 4 regels.

    # ── Bestuurlijke read ─────────────────────────────────────────────────────
    # Build why_cells for the primary (lowest-scoring) factor
    if _raster_rows:
        tf      = _raster_rows[0]["key"]
        # _fl (niet de generieke FACTOR_LABELS_NL), zelfde bron als
        # _raster_rows[0]["label"]: code-review Taak 6 ving anders een
        # zichtbare labelinconsistentie tussen p.02 en het raster voor
        # dezelfde factor (bijv. "Werkbelasting" vs "Werkdruk en balans").
        # retention/onboarding gebruiken hier al _fl (zie tf_lbl_ verderop).
        tf_lbl  = _fl(tf, "exit")
        tf_sc   = fa.get(tf)
        tf_col  = _factor_color(tf_sc)
        tf_fl   = _factor_label(tf_sc)
        tf_code = FACTOR_EXIT_CODE.get(tf)
        er_n    = next((r["count"] for r in data["exit_r_dist"] if r["code"] == tf_code), 0) if tf_code else 0
        cont_n  = next((r["count"] for r in data["cont_dist"]   if r["code"] == tf_code), 0) if tf_code else 0

        items_in   = fim.get(tf, [])
        i_scores   = [(ik, q, oim.get(ik)) for ik, q in items_in if oim.get(ik) is not None]
        low_item   = min(i_scores, key=lambda x: x[2]) if i_scores else None

        _deep_agg_early = data.get("deepening_agg") or {}
        why_cells = ""
        if er_n:
            why_cells += f'<td class="why-cell"><div class="why-l">Hoofdreden</div><div class="why-v" style="color:{tf_col};">{er_n}&times;</div><div class="why-b">van {n} vertrekkers de meest genoemde reden</div></td>'
        if tf_sc:
            why_cells += f'<td class="why-cell"><div class="why-l">Gemiddelde score</div><div class="why-v" style="color:{tf_col};">{tf_sc:.1f}/10</div><div class="why-b">van de {len(i_scores)} stellingen over dit thema ({_h(tf_fl.lower())})</div></td>'
        if low_item:
            why_cells += (f'<td class="why-cell"><div class="why-l">Laagst scorende stelling</div>'
                          f'<div class="why-v" style="color:{_factor_color(low_item[2])};">{low_item[2]:.1f}/10</div>'
                          f'<div class="why-b">{_h(low_item[1])}</div></td>')
        if cont_n:
            why_cells += f'<td class="why-cell"><div class="why-l">Speelt ook mee</div><div class="why-v">{cont_n}&times;</div><div class="why-b">als meespelende context</div></td>'

        primary_fkey  = tf
        primary_label = tf_lbl
        primary_sc    = low_sc
        primary_col   = _factor_color(low_sc)
        # Datagedreven vraag (uit de meest gekozen verdiepings-toelichting)
        # wanneer beschikbaar; anders de generieke per-factor vraag.
        _short_q = _short_mgmt_q(_deep_agg_early, "exit", tf)
        if _short_q:
            br_mgmt_q = _short_q
            br_mgmt_q_source = "Gebaseerd op de meest gekozen toelichting van respondenten in de verdieping."
        else:
            br_mgmt_q = _mgmt_q(tf, "exit")
            br_mgmt_q_source = "Gebaseerd op de laagst scorende factor."
    else:
        why_cells     = ""
        primary_fkey  = low_f[0] if low_f else None
        primary_label = low_lbl
        primary_sc    = low_sc
        primary_col   = _factor_color(low_sc)
        br_mgmt_q     = _mgmt_q(low_f[0], "exit") if low_f else ""
        br_mgmt_q_source = "Gebaseerd op de laagst scorende factor." if low_f else ""

    # Subtekst herhaalt de titel niet meer: alleen wat NIEUW is — de sterke
    # factor mét score. De responsbasis staat nu onderaan dezelfde pagina.
    totaalbeeld = (
        f"{high_lbl} ({_score_str(high_sc)}) laat zien wat wél werkt. "
        f"Hoe stevig dit beeld is, hangt af van de responsbasis onderaan deze pagina."
    ) if high_lbl and low_lbl != high_lbl and high_sc is not None and high_sc >= 6.5 else \
        "Reikwijdte en betrouwbaarheid van dit beeld: zie de responsbasis onderaan deze pagina."

    _responsbasis_band = _responsbasis(
        invited=data["n_invited"],
        completed=data["n_completed"],
        pct=round(data["completion_pct"]),
        period=data["campaign_name"],
        # Exit meet uitgestroomde medewerkers, niet het hele personeelsbestand —
        # "Alle medewerkers" was feitelijk onjuist op het eerlijkheidsanker (C3).
        population="Uitgestroomde medewerkers",
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
        mgmt_q_source=br_mgmt_q_source,
        responsbasis_html=_responsbasis_band,
        opener_html=ch.opener("Bestuurlijke read"),
        usage_html=_gebruiksblok(data["scan_lbl"]),
    )

    # ── Vertrekcontext (p.04 — vóór factorprofiel) ───────────────────────────
    exit_reasons = [(r["label"], r["count"]) for r in data["exit_r_dist"]]
    contributing = [(r["label"], r["count"]) for r in data["cont_dist"]]
    s += _vertrekcontext(exit_reasons=exit_reasons, contributing=contributing,
                         n=n, primary_factor_label=low_lbl,
                         opener_html=ch.opener("Wat speelde mee bij vertrek?", kicker="Vertrekcontext"))

    # ── Overzichtsprofiel (p.05) ──────────────────────────────────────────────
    profile_factors = [(FACTOR_LABELS_NL.get(fk, fk), fa.get(fk))
                       for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    _overzicht_summary, _overzicht_bands = _overzicht_summary_and_bands(profile_factors)
    s += _overzichtsprofiel(profile_factors, summary=_overzicht_summary, bands=_overzicht_bands,
                            opener_html=ch.opener("Overzichtsprofiel"))

    # priority_fkeys volgt nu dezelfde rangorde als het prioriteringsraster
    # (spec 2026-07-18 par. 4: één ranking per rapport) -- _raster_rows is
    # hierboven al berekend, vóór de Bestuurlijke read.
    priority_fkeys = [r["key"] for r in _raster_rows[:3]]

    # ── Factor detail (itemniveau prioritaire factoren) ──────────────────────
    def _factor_detail(fk: str, opener_html: str = "", intro_html: str = "") -> str:
        # ── Data logic (preserved from old helper) ──
        lbl    = FACTOR_LABELS_NL.get(fk, fk)
        fsc    = fa.get(fk)
        col    = _factor_color(fsc)
        fl_    = _factor_label(fsc)
        items  = fim.get(fk, [])
        i_sc   = [(ik, q, oim.get(ik)) for ik, q in items if oim.get(ik) is not None]
        low_i  = min(i_sc, key=lambda x: x[2]) if i_sc else None
        high_i = max(i_sc, key=lambda x: x[2]) if i_sc else None
        # Item table rows; het laagste item wordt vet — dat vervangt de aparte
        # "Laagste item"-kaart die bij 3 items pure herhaling van deze tabel was.
        rows = "".join(
            f'<tr><td class="iq"{" style=\"font-weight:700;\"" if low_i and ik == low_i[0] else ""}>{_h(q)}'
            f'{" <span class=\"low-tag\">laagste score</span>" if low_i and ik == low_i[0] else ""}</td>'
            f'<td class="is" style="color:{_factor_color(isc)};">{isc:.1f}</td></tr>'
            for ik, q, isc in i_sc
        ) or '<tr><td colspan="2" style="color:#94A3B8;font-style:italic;">Itemscores niet beschikbaar in deze wave.</td></tr>'
        # Per-factor quote bewust geschrapt (besluit 2026-07-12): de trefwoord-
        # selectie had dezelfde negatie-blindheid als de classificatie die eerder
        # uit _themed_quotes is verwijderd (besluit 2026-04-09). Alle quotes staan
        # integraal (geanonimiseerd) in de quotes-sectie; duiding in de bespreking.
        # ── Exit reason context block ──
        er_count = exit_code_counts.get(fk, 0)
        if er_count > 0:
            er_context = f'<div class="card accent">{er_count}&times; genoemd als vertrekreden: directe link met vertrekcontext.</div>'
        else:
            er_context = ""
        # ── Lowest / highest item cards — alleen bij >3 items; bij 3 items zijn
        # ze pure herhaling van de itemtabel (2 van de 3 rijen stonden dubbel) ──
        show_cards = len(i_sc) > 3
        low_card  = (f'<div class="card"><span class="eyebrow">Laagst scorende stelling</span>'
                     f'<p>{_h(low_i[1])}</p>'
                     f'<strong style="color:{_factor_color(low_i[2])};">{low_i[2]:.1f}/10</strong></div>'
                     if show_cards and low_i else "")
        high_card = (f'<div class="card"><span class="eyebrow">Hoogste item binnen deze factor</span>'
                     f'<p>{_h(high_i[1])}</p>'
                     f'<strong style="color:{_factor_color(high_i[2])};">{high_i[2]:.1f}/10</strong></div>'
                     if show_cards and high_i else "")
        # ── Toelichtingsblok verdiepingsvragen (spec 6.2) ──
        # NB: het statische "Eerste managementvraag"-navy-blok is hier bewust weg —
        # dezelfde template-vraag stond al op p.02 en 3x op de verdiepingspagina's;
        # de data (items + toelichting + quote) draagt deze pagina zelf.
        deep_block = (_deepening_block(deep_agg[fk], "exit", fk)
                      if fk in deep_agg else "")
        spread = distribution_block(data.get("factor_resp_scores", {}).get(fk, []))
        return f"""<div class="pb sec">
  {opener_html or f'<span class="slabel">Verdieping: {_h(lbl)}</span>'}
  {intro_html}
  <h2>{_h(lbl)} <span style="color:{col};">{_score_str(fsc)}</span> <span style="font-size:13px;color:{col};">&middot; {_h(fl_)}</span></h2>
  {spread}
  {er_context}
  {low_card}
  {high_card}
  <h3 style="margin-top:28px;">Alle stellingen in deze factor</h3>
  <table class="item-tbl">{rows}</table>
  {deep_block}
</div>"""

    if priority_fkeys:
        for _i, _pfk in enumerate(priority_fkeys):
            _lbl = FACTOR_LABELS_NL.get(_pfk, _pfk)
            _opener = ch.opener(f"Verdieping: {_lbl}") if _i == 0 else _ChapterCounter.vervolg(f"Verdieping: {_lbl}")
            s += _factor_detail(_pfk, opener_html=_opener, intro_html=_intro("verdieping") if _i == 0 else "")
    else:
        s += f'<div class="pb sec">{ch.opener("Verdieping: prioritaire factoren")}<div class="card">Factor detail beschikbaar na voldoende patroonduiding.</div></div>'

    # ── SDT basisbehoeften ────────────────────────────────────────────────────
    def _sdt_item_tbl(dim: str) -> str:
        keys = SDT_DIMENSION_ITEMS.get(dim, [])
        REV_LABEL = '<span style="font-size:8px;color:#94A3B8;">&nbsp;(omgekeerd)</span>'
        rows = "".join(
            f'<tr><td class="iq">{_h(q)}'
            f'{REV_LABEL if ik in SDT_REVERSE_ITEMS else ""}'
            f'</td><td class="is" style="color:{_rag_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
            f'<td class="ib">{_mini_bar_svg(sim.get(ik), _rag_color(sim.get(ik)), width=80, height=6)}</td></tr>'
            for ik in keys
            for q in [next((t for k, t in data["sdt_items"] if k == ik), ik)]
            if ik in sim
        )
        return f'<table class="item-tbl">{rows}</table>' if rows else ""

    sdt_overview_rows = "".join(
        _factor_bar_row(SDT_LABELS.get(dim, ""), sdt_a.get(dim))
        for dim in ("autonomy", "competence", "relatedness")
        if sdt_a.get(dim) is not None
    )

    s += f"""<div class="pb sec">
  {ch.opener("Werkbeleving", kicker="Autonomie, competentie &amp; verbondenheid")}
  {_intro("werkbeleving")}
  <div class="card" style="margin-bottom:14px;">{sdt_overview_rows}</div>"""

    for dim in ("autonomy", "competence", "relatedness"):
        sc    = sdt_a.get(dim)
        col   = _rag_color(sc)
        fl_   = _factor_label(sc)
        tbl   = _sdt_item_tbl(dim)
        if not tbl: continue
        s += f"""<div class="card no-break" style="margin-bottom:12px;">
  <div style="margin-bottom:8px;">
    <span style="font-size:12px;font-weight:700;color:#243247;">{_h(SDT_LABELS.get(dim,""))}</span>
    <span style="font-size:11px;font-weight:700;color:{col};margin-left:10px;">{_score_str(sc)}</span>
    <span style="font-size:10px;color:{col};margin-left:6px;">&middot; {_h(fl_)}</span>
  </div>
  <div style="font-size:9.5px;color:#6B7280;margin-bottom:8px;">{_h(SDT_HELP.get(dim,""))}</div>
  {tbl}
</div>"""
    s += "</div>"

    # ── eNPS ─────────────────────────────────────────────────────────────────
    if data["enps_available"] and data["enps_score"] is not None:
        es   = data["enps_score"]
        ecol = _rag_color(10.0 if es >= 20 else 6.0 if es >= 0 else 4.0)
        s += f"""<div class="pb sec">
  {ch.opener("Werkgeversaanbeveling")}
  {_intro("werkgeversaanbeveling")}
  <table class="sg"><tr>
    <td><div class="sc-l">Aanbevelingsscore</div><div class="sc-v" style="color:{ecol};">{es:+d}</div><div class="sc-b">eNPS (&minus;100 tot +100)</div></td>
  </tr></table>
</div>"""
    # Niet gemeten: geen eigen (vrijwel lege) pagina — de Datastatus op de
    # responsbasis-pagina en de appendix-notitie melden dit al (fail-loud blijft).

    # ── Segmentstatus ─────────────────────────────────────────────────────────
    _seg_rows = data.get("segment_rows") or []
    _seg_opener = ch.opener("Segmentanalyse per afdeling") if _seg_rows else ch.opener("Segmentanalyse")
    s += _segment_block(_seg_rows, factor_rows=data.get("segment_factor_rows"),
                        scan_type="exit", opener_html=_seg_opener)

    # ── Open toelichtingen ────────────────────────────────────────────────────
    texts = data["open_texts"]
    if _should_show_quotes(texts):
        s += f"""<div class="pb sec">
  {ch.opener("Open toelichtingen", kicker=f"{len(texts)} respondentstemmen")}
  {_intro("open_toelichtingen")}
  {_themed_quotes(texts, "exit", top_fkeys, n)}
</div>"""

    # ── Prioriteringsraster / gespreksagenda (naar het slot — na het bewijs,
    # vóór de appendix) ────────────────────────────────────────────────────────
    _startpunt_fk = _raster_rows[0]["key"] if _raster_rows else None
    _enriched_q = (_deepening_mgmt_q(deep_agg, "exit", _startpunt_fk)
                   if _startpunt_fk else None)
    s += _prioriteringsraster(
        ranked=_raster_rows,
        scan_type="exit",
        factor_resp_scores=data.get("factor_resp_scores") or {},
        deepening_active=bool(deep_agg),
        mgmt_q=_enriched_q or (_mgmt_q(_startpunt_fk, "exit") if _startpunt_fk else (nsp.get("first_decision") or "")),
        review_when="Plan binnen 45-90 dagen een vervolgmoment: bespreek dan wat er is opgepakt en of dit thema nog voorrang verdient.",
        opener_html=ch.opener("Waar begint het gesprek?", kicker="Prioritering & gespreksagenda"),
    )

    # ── Appendix ─────────────────────────────────────────────────────────────
    n_factors = len([fk for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None])
    if _should_show_appendix(n, n_factors):
        app_sections = ""
        for fk, items in data["factor_items_map"].items():
            lbl_f = FACTOR_LABELS_NL.get(fk, fk)
            fsc_a = fa.get(fk)
            rows  = "".join(
                (f'<tr><td class="aq">{_h(q)}</td>'
                 f'<td class="as" style="color:{_factor_color(oim.get(ik))};">{oim[ik]:.1f}</td>'
                 f'<td class="ab">{_mini_bar_svg(oim.get(ik), _factor_color(oim.get(ik)), width=70, height=5)}</td></tr>')
                if oim.get(ik) is not None else
                f'<tr><td class="aq">{_h(q)}</td><td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
                for ik, q in items
            )
            app_sections += (f'<div class="no-break" style="margin-bottom:14px;">'
                             f'<div style="font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;">'
                             f'{_h(lbl_f)}'
                             f'{"&nbsp;&middot;&nbsp;" + _score_str(fsc_a) if fsc_a else ""}</div>'
                             f'<table class="app-tbl"><tr><th class="aq">Vraag</th>'
                             f'<th class="as">Gem.</th><th class="ab">Beeld</th></tr>{rows}</table></div>')

        sdt_rows = "".join(
            (f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
             f'<td class="as" style="color:{_factor_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
             f'<td class="ab">{_mini_bar_svg(sim.get(ik), _factor_color(sim.get(ik)), width=70, height=5)}</td></tr>')
            if sim.get(ik) is not None else
            f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
            f'<td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
            for ik, q in data["sdt_items"]
        )

        s += f"""<div class="pb sec">
  {ch.opener("Appendix", kicker="Volledige vraagresultaten")}
  {_intro("appendix")}
  <p style="font-size:9px;color:#94A3B8;margin-bottom:14px;">
    n={n}. &#x21a9;&nbsp;= omgekeerd gecodeerde stelling.
  </p>
  {app_sections}
  <div class="no-break" style="margin-bottom:14px;">
    <div style="font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;">Werkbeleving (SDT): B1 t/m B12</div>
    <table class="app-tbl"><tr><th class="aq">Vraag</th><th class="as">Gem.</th><th class="ab">Beeld</th></tr>{sdt_rows}</table>
  </div>
  <div class="empty-state" style="margin-top:8px;">
    Werkgeversaanbeveling (eNPS): {"beschikbaar, zie hoofdrapport" if data["enps_available"] else "niet gemeten in deze wave"}
  </div>
</div>"""

    # ── Methodiek (LAST) ──────────────────────────────────────────────────────
    s += _trust_page("exit", opener_html=ch.opener("Methodiek, privacy &amp; interpretatiegrenzen"))
    return _doc(f"Loep Vertrek · {data['campaign_name']}", s, scan_type="exit")


# ─── RetentieScan renderer ───────────────────────────────────────────────────

def render_retention_report_html(data: dict) -> str:
    ST          = "retention"
    n           = data["n_completed"]
    avg_risk    = data["avg_risk"]
    avg_eng     = data["avg_eng"]
    avg_to      = data["avg_to"]
    avg_si      = data["avg_si"]
    band_lbl, band_col = _band(avg_risk, ST)
    fa          = data["factor_avgs"]
    sdt_a       = data["sdt_avgs"]
    nsp         = data["nsp"]
    top_fkeys   = data["top_fkeys"]
    top_flabels = data["top_flabels"]
    fim         = data["factor_items_map"]
    oim         = data["org_item_avgs"]
    sim         = data["sdt_item_avgs"]
    ch          = _ChapterCounter()

    sorted_f    = sorted([(fk, fa.get(fk)) for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None], key=lambda x: x[1])
    low_f       = sorted_f[0]  if sorted_f else None
    high_f      = sorted_f[-1] if sorted_f else None
    low_lbl     = _fl(low_f[0], ST)  if low_f  else ""
    high_lbl    = _fl(high_f[0], ST) if high_f else ""
    low_sc      = low_f[1]  if low_f  else None
    high_sc     = high_f[1] if high_f else None

    # ── Prioriteringsraster-rangorde (spec 2026-07-18 par. 4: één ranking per
    # rapport) — vroeg berekend zodat zowel de Bestuurlijke read (p.02) als de
    # verdieping-detailkeuze én de sluitende gespreksagenda dezelfde volgorde
    # gebruiken. ────────────────────────────────────────────────────────────
    deep_agg = data.get("deepening_agg") or {}
    _raster_rows = rank_factors(
        "retention", fa, data.get("factor_resp_scores") or {}, deep_agg,
        labels={fk: _fl(fk, ST) for fk in ORG_FACTOR_KEYS})

    # ── Cover ─────────────────────────────────────────────────────────────────
    _ret_primary = low_lbl or "—"   # lowest = primary behoudsdruk
    s = _cover(
        scan_label=data["scan_lbl"], scan_type=ST, org_name=data["org_name"],
        period=data["campaign_name"], opening_question="Waar staat behoud nu onder druk?",
        stats=[
            ("Respondenten", str(n)),
            ("Respons", f"{round(data['completion_pct'])}%"),  # afgerond — p.03 toont hetzelfde getal
            ("Eerste aandachtspunt", _ret_primary),
        ],
    )

    # ── Bestuurlijke read ─────────────────────────────────────────────────────
    if _raster_rows:
        tf       = _raster_rows[0]["key"]
        tf_lbl_  = _fl(tf, ST)
        tf_sc    = fa.get(tf)
        tf_col   = _factor_color(tf_sc)
        items_in = fim.get(tf, [])
        i_scores = [(ik, q, oim.get(ik)) for ik, q in items_in if oim.get(ik) is not None]
        low_item = min(i_scores, key=lambda x: x[2]) if i_scores else None

        _deep_agg_early = data.get("deepening_agg") or {}
        # Alleen cellen die écht verklaren waarom deze factor bovenaan staat.
        # Bevlogenheid en blijfintentie zijn contextsignalen, geen verklaring —
        # die staan volledig uitgelegd op p.04 (behoudscontext); hier stonden ze
        # als vierde/vijfde losse score op een toch al dichte pagina.
        why_cells = ""
        if tf_sc is not None:
            why_cells += f'<td class="why-cell"><div class="why-l">Gemiddelde score</div><div class="why-v" style="color:{tf_col};">{tf_sc:.1f}/10</div><div class="why-b">van de {len(i_scores)} stellingen over dit thema ({_h(_factor_label(tf_sc).lower())})</div></td>'
        if low_item:
            why_cells += (f'<td class="why-cell"><div class="why-l">Laagst scorende stelling</div>'
                          f'<div class="why-v" style="color:{_factor_color(low_item[2])};">{low_item[2]:.1f}/10</div>'
                          f'<div class="why-b">{_h(low_item[1])}</div></td>')

        primary_fkey  = tf
        primary_label = tf_lbl_
        primary_sc    = tf_sc
        primary_col   = tf_col
        _short_q = _short_mgmt_q(_deep_agg_early, ST, tf)
        if _short_q:
            br_mgmt_q = _short_q
            br_mgmt_q_source = "Gebaseerd op de meest gekozen toelichting van respondenten in de verdieping."
        else:
            br_mgmt_q = _mgmt_q(tf, ST)
            br_mgmt_q_source = "Gebaseerd op de laagst scorende factor."
    else:
        why_cells     = ""
        primary_fkey  = low_f[0] if low_f else None
        primary_label = low_lbl
        primary_sc    = low_sc
        primary_col   = _factor_color(low_sc)
        br_mgmt_q     = _mgmt_q(low_f[0], ST) if low_f else ""
        br_mgmt_q_source = "Gebaseerd op de laagst scorende factor." if low_f else ""

    # Kernzin: band + geduid getal + laagste factor. "behoudssignaal" bij het
    # cijfer, zodat de lezer weet WAT er 4.7 scoort (de factorscore ernaast is
    # een ander getal — dat onderscheid was eerder onzichtbaar).
    if avg_risk and band_lbl and low_lbl:
        exec_line = f"{band_lbl} (behoudssignaal {_score_str(avg_risk)}). {low_lbl} is het eerste gesprekspunt."
    else:
        exec_line = "Zie factoranalyse en behoudscontext voor details."

    # Subtekst herhaalt de titel niet meer: alleen wat nieuw is. De
    # responsbasis staat nu onderaan dezelfde pagina.
    totaalbeeld = (
        f"{high_lbl} ({_score_str(high_sc)}) laat zien wat wél werkt. "
        f"Hoe stevig dit beeld is, hangt af van de responsbasis onderaan deze pagina."
    ) if high_lbl and low_lbl != high_lbl and high_sc is not None and high_sc >= 6.5 else \
        "Reikwijdte en betrouwbaarheid van dit beeld: zie de responsbasis onderaan deze pagina."

    _responsbasis_band = _responsbasis(
        invited=data["n_invited"],
        completed=data["n_completed"],
        pct=round(data["completion_pct"]),
        period=data["campaign_name"],
        population="Actieve medewerkers",
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
        mgmt_q_source=br_mgmt_q_source,
        responsbasis_html=_responsbasis_band,
        opener_html=ch.opener("Bestuurlijke read"),
        usage_html=_gebruiksblok(data["scan_lbl"]),
    )

    # ── Behoudscontext (p.04 — vóór factorprofiel) ───────────────────────────
    s += _behoudscontext(
        retention_score=avg_risk,
        stay_intent=avg_si,
        turnover=avg_to,
        engagement=avg_eng,
        primary_factor=low_lbl or primary_label or "—",
        intent_resp=data.get("intent_resp"),
        opener_html=ch.opener("Waar staat behoud onder druk?", kicker="Behoudscontext"),
    )

    # ── Overzichtsprofiel (p.05) ──────────────────────────────────────────────
    profile_factors = [(_fl(fk, ST), fa.get(fk))
                       for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    _overzicht_summary, _overzicht_bands = _overzicht_summary_and_bands(profile_factors)
    s += _overzichtsprofiel(profile_factors, summary=_overzicht_summary, bands=_overzicht_bands,
                            opener_html=ch.opener("Overzichtsprofiel"))

    # priority_fkeys volgt nu dezelfde rangorde als het prioriteringsraster
    # (spec 2026-07-18 par. 4: één ranking per rapport) -- _raster_rows is
    # hierboven al berekend, vóór de Bestuurlijke read.
    priority_fkeys = [r["key"] for r in _raster_rows[:3]]

    def _ret_factor_detail(fk: str, opener_html: str = "", intro_html: str = "") -> str:
        lbl    = _fl(fk, ST)
        fsc    = fa.get(fk)
        col    = _factor_color(fsc)
        fl_    = _factor_label(fsc)
        items  = fim.get(fk, [])
        i_sc   = [(ik, q, oim.get(ik)) for ik, q in items if oim.get(ik) is not None]
        low_i  = min(i_sc, key=lambda x: x[2]) if i_sc else None
        high_i = max(i_sc, key=lambda x: x[2]) if i_sc else None
        # Laagste item vet in de tabel i.p.v. losse laagste/hoogste-kaarten:
        # bij 3 items per factor waren die kaarten pure herhaling van de tabel.
        rows = "".join(
            f'<tr><td class="iq"{" style=\"font-weight:700;\"" if low_i and ik == low_i[0] else ""}>{_h(q)}'
            f'{" <span class=\"low-tag\">laagste score</span>" if low_i and ik == low_i[0] else ""}</td>'
            f'<td class="is" style="color:{_factor_color(isc)};">{isc:.1f}</td></tr>'
            for ik, q, isc in i_sc
        ) or '<tr><td colspan="2" style="color:#94A3B8;font-style:italic;">Itemscores niet beschikbaar in deze wave.</td></tr>'
        # Per-factor quote bewust geschrapt (besluit 2026-07-12): zie de
        # identieke noot bij _factor_detail hierboven.
        show_cards = len(i_sc) > 3
        low_card  = (f'<div class="card"><span class="eyebrow">Laagst scorende stelling</span>'
                     f'<p>{_h(low_i[1])}</p>'
                     f'<strong style="color:{_factor_color(low_i[2])};">{low_i[2]:.1f}/10</strong></div>'
                     if show_cards and low_i else "")
        high_card = (f'<div class="card"><span class="eyebrow">Hoogste item binnen deze factor</span>'
                     f'<p>{_h(high_i[1])}</p>'
                     f'<strong style="color:{_factor_color(high_i[2])};">{high_i[2]:.1f}/10</strong></div>'
                     if show_cards and high_i else "")
        # Statisch "Eerste managementvraag"-blok bewust verwijderd (template-taal;
        # stond ook al op p.02) — de toelichting/richting-blokken dragen de duiding.
        # ── Toelichtingsblok verdiepingsvragen (spec 6.2) ──
        deep_block = (_deepening_block(deep_agg[fk], ST, fk)
                      if fk in deep_agg else "")
        # ── Gespreksrichting-blok (spec 7.1) — direct na de toelichting ──
        dir_block = (_direction_block(deep_agg[fk], ST, fk)
                     if fk in deep_agg else "")
        spread = distribution_block(data.get("factor_resp_scores", {}).get(fk, []))
        return f"""<div class="pb sec">
  {opener_html or f'<span class="slabel">Verdieping: {_h(lbl)}</span>'}
  {intro_html}
  <h2>{_h(lbl)} <span style="color:{col};">{_score_str(fsc)}</span> <span style="font-size:13px;color:{col};">&middot; {_h(fl_)}</span></h2>
  {spread}
  {low_card}
  {high_card}
  <h3 style="margin-top:28px;">Alle stellingen in deze factor</h3>
  <table class="item-tbl">{rows}</table>
  {deep_block}{dir_block}
</div>"""

    if priority_fkeys:
        for _i, _pfk in enumerate(priority_fkeys):
            _lbl = _fl(_pfk, ST)
            _opener = ch.opener(f"Verdieping: {_lbl}") if _i == 0 else _ChapterCounter.vervolg(f"Verdieping: {_lbl}")
            s += _ret_factor_detail(_pfk, opener_html=_opener, intro_html=_intro("verdieping") if _i == 0 else "")
    else:
        s += f'<div class="pb sec">{ch.opener("Verdieping: prioritaire factoren")}<div class="card">Factor detail beschikbaar na voldoende patroonduiding.</div></div>'

    # ── Werkbeleving (SDT) ────────────────────────────────────────────────────
    def _sdt_item_tbl(dim: str) -> str:
        keys = SDT_DIMENSION_ITEMS.get(dim, [])
        REV_LABEL = '<span style="font-size:8px;color:#94A3B8;">&nbsp;(omgekeerd)</span>'
        rows = "".join(
            f'<tr><td class="iq">{_h(q)}'
            f'{REV_LABEL if ik in SDT_REVERSE_ITEMS else ""}'
            f'</td><td class="is" style="color:{_rag_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
            f'<td class="ib">{_mini_bar_svg(sim.get(ik), _rag_color(sim.get(ik)), width=80, height=6)}</td></tr>'
            for ik in keys
            for q in [next((t for k, t in data["sdt_items"] if k == ik), ik)]
            if ik in sim
        )
        return f'<table class="item-tbl">{rows}</table>' if rows else ""

    sdt_overview_rows = "".join(
        _factor_bar_row(SDT_LABELS.get(dim, ""), sdt_a.get(dim))
        for dim in ("autonomy", "competence", "relatedness")
        if sdt_a.get(dim) is not None
    )

    s += f"""<div class="pb sec">
  {ch.opener("Werkbeleving", kicker="Autonomie, competentie &amp; verbondenheid")}
  {_intro("werkbeleving")}
  <div class="card" style="margin-bottom:14px;">{sdt_overview_rows}</div>"""

    for dim in ("autonomy", "competence", "relatedness"):
        sc    = sdt_a.get(dim)
        col   = _rag_color(sc)
        fl_   = _factor_label(sc)
        tbl   = _sdt_item_tbl(dim)
        if not tbl: continue
        s += f"""<div class="card no-break" style="margin-bottom:12px;">
  <div style="margin-bottom:8px;">
    <span style="font-size:12px;font-weight:700;color:#243247;">{_h(SDT_LABELS.get(dim,""))}</span>
    <span style="font-size:11px;font-weight:700;color:{col};margin-left:10px;">{_score_str(sc)}</span>
    <span style="font-size:10px;color:{col};margin-left:6px;">&middot; {_h(fl_)}</span>
  </div>
  <div style="font-size:9.5px;color:#6B7280;margin-bottom:8px;">{_h(SDT_HELP.get(dim,""))}</div>
  {tbl}
</div>"""
    s += "</div>"

    # ── eNPS (if available) ───────────────────────────────────────────────────
    if data["enps_available"] and data["enps_score"] is not None:
        es   = data["enps_score"]
        ecol = _rag_color(10.0 if es >= 20 else 6.0 if es >= 0 else 4.0)
        s += f"""<div class="pb sec">
  {ch.opener("Werkgeversaanbeveling")}
  {_intro("werkgeversaanbeveling")}
  <table class="sg"><tr>
    <td><div class="sc-l">Aanbevelingsscore</div><div class="sc-v" style="color:{ecol};">{es:+d}</div><div class="sc-b">eNPS (&minus;100 tot +100)</div></td>
  </tr></table>
</div>"""
    # Niet gemeten: geen eigen (vrijwel lege) pagina — de Datastatus op de
    # responsbasis-pagina en de appendix-notitie melden dit al (fail-loud blijft).

    # ── Segmentstatus ─────────────────────────────────────────────────────────
    _seg_rows = data.get("segment_rows") or []
    _seg_opener = ch.opener("Segmentanalyse per afdeling") if _seg_rows else ch.opener("Segmentanalyse")
    s += _segment_block(_seg_rows, factor_rows=data.get("segment_factor_rows"),
                        scan_type=ST, opener_html=_seg_opener)

    # ── Open toelichtingen ────────────────────────────────────────────────────
    texts = data["open_texts"]
    if _should_show_quotes(texts):
        s += f"""<div class="pb sec">
  {ch.opener("Open toelichtingen", kicker=f"{len(texts)} medewerkersstemmen")}
  {_intro("open_toelichtingen")}
  {_themed_quotes(texts, ST, top_fkeys, n)}
</div>"""

    # ── Prioriteringsraster / gespreksagenda (naar het slot — na het bewijs,
    # vóór de appendix) ────────────────────────────────────────────────────────
    _startpunt_fk = _raster_rows[0]["key"] if _raster_rows else None
    # Richting-scenario (spec 7.2) eerst; None -> trede-1-verrijking of menuvraag.
    _direction_q = (_direction_agenda_line(deep_agg[_startpunt_fk], ST, _startpunt_fk)
                    if _startpunt_fk and _startpunt_fk in deep_agg else None)
    _enriched_q = _direction_q or (_deepening_mgmt_q(deep_agg, ST, _startpunt_fk)
                                   if _startpunt_fk else None)
    s += _prioriteringsraster(
        ranked=_raster_rows,
        scan_type=ST,
        factor_resp_scores=data.get("factor_resp_scores") or {},
        deepening_active=bool(deep_agg),
        mgmt_q=_enriched_q or (_mgmt_q(_startpunt_fk, ST) if _startpunt_fk else (nsp.get("first_decision") or "")),
        review_when="Plan binnen 45-90 dagen een vervolgmoment: bespreek dan wat er is opgepakt en of dit thema nog voorrang verdient.",
        opener_html=ch.opener("Waar begint het gesprek?", kicker="Prioritering & gespreksagenda"),
    )

    # ── Appendix ─────────────────────────────────────────────────────────────
    n_factors = len([fk for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None])
    if _should_show_appendix(n, n_factors):
        app_sections = ""
        for fk, items in data["factor_items_map"].items():
            lbl_f = _fl(fk, ST)
            fsc_a = fa.get(fk)
            rows  = "".join(
                (f'<tr><td class="aq">{_h(q)}</td>'
                 f'<td class="as" style="color:{_factor_color(oim.get(ik))};">{oim[ik]:.1f}</td>'
                 f'<td class="ab">{_mini_bar_svg(oim.get(ik), _factor_color(oim.get(ik)), width=70, height=5)}</td></tr>')
                if oim.get(ik) is not None else
                f'<tr><td class="aq">{_h(q)}</td><td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
                for ik, q in items
            )
            app_sections += (f'<div class="no-break" style="margin-bottom:14px;">'
                             f'<div style="font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;">'
                             f'{_h(lbl_f)}'
                             f'{"&nbsp;&middot;&nbsp;" + _score_str(fsc_a) if fsc_a else ""}</div>'
                             f'<table class="app-tbl"><tr><th class="aq">Vraag</th>'
                             f'<th class="as">Gem.</th><th class="ab">Beeld</th></tr>{rows}</table></div>')

        sdt_rows = "".join(
            (f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
             f'<td class="as" style="color:{_factor_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
             f'<td class="ab">{_mini_bar_svg(sim.get(ik), _factor_color(sim.get(ik)), width=70, height=5)}</td></tr>')
            if sim.get(ik) is not None else
            f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
            f'<td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
            for ik, q in data["sdt_items"]
        )

        s += f"""<div class="pb sec">
  {ch.opener("Appendix", kicker="Volledige vraagresultaten")}
  {_intro("appendix")}
  <p style="font-size:9px;color:#94A3B8;margin-bottom:14px;">
    n={n}. &#x21a9;&nbsp;= omgekeerd gecodeerde stelling.
  </p>
  {app_sections}
  <div class="no-break" style="margin-bottom:14px;">
    <div style="font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;">Werkbeleving (SDT): B1 t/m B12</div>
    <table class="app-tbl"><tr><th class="aq">Vraag</th><th class="as">Gem.</th><th class="ab">Beeld</th></tr>{sdt_rows}</table>
  </div>
  <div class="empty-state" style="margin-top:8px;">
    Werkgeversaanbeveling (eNPS): {"beschikbaar, zie hoofdrapport" if data["enps_available"] else "niet gemeten in deze wave"}
  </div>
</div>"""

    # ── Methodiek (LAST) ──────────────────────────────────────────────────────
    s += _trust_page(ST, opener_html=ch.opener("Methodiek, privacy &amp; interpretatiegrenzen"))
    return _doc(f"Loep Behoud · {data['campaign_name']}", s, scan_type="retention")


# ─── Onboarding-exclusive helpers ────────────────────────────────────────────

def _checkpointoverzicht(checkpoints: list[tuple[str, float | None]], opener_html: str = "") -> str:
    """Checkpoint-fasevergelijking (30/60/90 dagen) of eerlijke single-measurement degraded view.

    checkpoints — lijst van (fase-label, score | None).
    Als < 2 fasen: render de enkele meting met een .trustline die fasevergelijking benoemt.
    """
    if len(checkpoints) >= 2:
        cells = "".join(
            f'<td><div class="sc-l">{_h(label)}</div>'
            f'<div class="sc-v" style="color:{_rag_color(score)};">{_score_str(score)}</div>'
            f'<div class="sc-b">{_h(_factor_label(score))}</div></td>'
            for label, score in checkpoints
        )
        body = f'<table class="sg"><tr>{cells}</tr></table>'
    else:
        # Single measurement — honest degraded view
        label, score = checkpoints[0] if checkpoints else ("Huidig checkpoint", None)
        body = (
            f'<table class="sg"><tr>'
            f'<td><div class="sc-l">{_h(label)}</div>'
            f'<div class="sc-v" style="color:{_rag_color(score)};">{_score_str(score)}</div>'
            f'<div class="sc-b">Enkelvoudig meetmoment</div></td>'
            f'</tr></table>'
            # Geen belofte over automatische fasevergelijking: geen code-pad aggregeert
            # meerdere checkpoints in één rapport (besluit C2, 2026-07-13 audit).
            f'<p class="trustline">Dit rapport beslaat één meetmoment; een volgende meting bespreken we los.</p>'
        )

    return f"""<div class="pb sec">
  {opener_html or '<span class="slabel">Checkpointoverzicht</span>'}
  {_intro("checkpointoverzicht")}
  {body}
</div>"""


def _landingskwaliteit(domains: list[tuple[str, float | None]]) -> str:
    """Landingskwaliteit per domein — factor bar rows in een card.

    Geen eigen pagina (.pb): sluit aan onder het checkpointoverzicht, dat bij een
    enkelvoudige meting maar één getal bevat — samen vullen ze één pagina i.p.v.
    twee halflege.
    """
    rows = "".join(
        _factor_bar_row(label, score)
        for label, score in domains
        if score is not None
    )
    if not rows:
        rows = '<div class="empty-state">Domeinscores beschikbaar bij voldoende patroonduiding.</div>'
    legend = (f'<p style="font-size:9px;color:#64748B;margin-top:12px;">'
              f'<span style="color:{RAG_HIGH};">&#9632;</span> kwetsbaar punt &nbsp; '
              f'<span style="color:{RAG_MID};">&#9632;</span> aandachtspunt &nbsp; '
              f'<span style="color:{RAG_LOW};">&#9632;</span> goed geland</p>')
    return f"""<div class="sec">
  <span class="slabel">Landingskwaliteit per domein</span>
  <div class="card">{rows}{legend}</div>
</div>"""


# ─── OnboardingScan renderer ──────────────────────────────────────────────────

def render_onboarding_report_html(data: dict) -> str:
    ST          = "onboarding"
    n           = data["n_completed"]
    avg_risk    = data["avg_risk"]
    avg_si      = data["avg_si"]
    band_lbl, band_col = _band(avg_risk, ST)
    fa          = data["factor_avgs"]
    sdt_a       = data["sdt_avgs"]
    nsp         = data["nsp"]
    top_fkeys   = data["top_fkeys"]
    top_flabels = data["top_flabels"]
    fim         = data["factor_items_map"]
    oim         = data["org_item_avgs"]
    sim         = data["sdt_item_avgs"]
    ch          = _ChapterCounter()

    sorted_f = sorted([(fk, fa.get(fk)) for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None],
                      key=lambda x: x[1])
    low_f    = sorted_f[0]  if sorted_f else None
    high_f   = sorted_f[-1] if sorted_f else None
    low_lbl  = _fl(low_f[0], ST)  if low_f  else ""
    high_lbl = _fl(high_f[0], ST) if high_f else ""
    low_sc   = low_f[1]  if low_f  else None
    high_sc  = high_f[1] if high_f else None

    # ── Cover ─────────────────────────────────────────────────────────────────
    _ob_primary = low_lbl or high_lbl or "—"
    s = _cover(
        scan_label=data["scan_lbl"], scan_type=ST, org_name=data["org_name"],
        period=data["campaign_name"], opening_question="Hoe landen nieuwe medewerkers?",
        stats=[
            ("Respondenten", str(n)),
            ("Respons", f"{round(data['completion_pct'])}%"),  # afgerond — p.03 toont hetzelfde getal
            ("Eerste aandachtspunt", _ob_primary),
        ],
    )

    # ── Bestuurlijke read ─────────────────────────────────────────────────────
    if top_fkeys:
        tf       = top_fkeys[0]
        tf_lbl_  = _fl(tf, ST)
        tf_sc    = fa.get(tf)
        tf_col   = _factor_color(tf_sc)
        items_in = fim.get(tf, [])
        i_scores = [(ik, q, oim.get(ik)) for ik, q in items_in if oim.get(ik) is not None]
        low_item = min(i_scores, key=lambda x: x[2]) if i_scores else None

        why_cells = ""
        if tf_sc is not None:
            why_cells += f'<td class="why-cell"><div class="why-l">Gemiddelde score</div><div class="why-v" style="color:{tf_col};">{tf_sc:.1f}/10</div><div class="why-b">van de {len(i_scores)} stellingen over dit thema ({_h(_factor_label(tf_sc).lower())})</div></td>'
        if low_item:
            why_cells += (f'<td class="why-cell"><div class="why-l">Laagst scorende stelling</div>'
                          f'<div class="why-v" style="color:{_factor_color(low_item[2])};">{low_item[2]:.1f}/10</div>'
                          f'<div class="why-b">{_h(low_item[1])}</div></td>')

        primary_label = tf_lbl_
        primary_sc    = tf_sc
        primary_col   = tf_col
        br_mgmt_q     = _mgmt_q(tf, ST)
        br_mgmt_q_source = "Gebaseerd op de laagst scorende factor."
    else:
        why_cells     = ""
        primary_label = low_lbl
        primary_sc    = low_sc
        primary_col   = _factor_color(low_sc)
        br_mgmt_q     = _mgmt_q(low_f[0], ST) if low_f else ""
        br_mgmt_q_source = "Gebaseerd op de laagst scorende factor." if low_f else ""

    # Kernzin: band + geduid getal + laagste factor ("checkpointscore" zodat de
    # lezer weet wat het getal is; de factorscore ernaast is een ander getal).
    if avg_risk and band_lbl and low_lbl:
        exec_line = f"{band_lbl} (checkpointscore {_score_str(avg_risk)}). {low_lbl} is het eerste gesprekspunt."
    else:
        exec_line = "Zie factordiepte en checkpointoverzicht voor details."

    # Subtekst herhaalt de titel niet meer: alleen wat nieuw is. De
    # responsbasis staat nu onderaan dezelfde pagina.
    totaalbeeld = (
        f"{high_lbl} ({_score_str(high_sc)}) laat zien wat wél goed landt. "
        f"Hoe stevig dit beeld is, hangt af van de responsbasis onderaan deze pagina."
    ) if high_lbl and low_lbl != high_lbl and high_sc is not None and high_sc >= 6.5 else \
        "Reikwijdte en betrouwbaarheid van dit beeld: zie de responsbasis onderaan deze pagina."

    _responsbasis_band = _responsbasis(
        invited=data["n_invited"],
        completed=data["n_completed"],
        pct=round(data["completion_pct"]),
        period=data["campaign_name"],
        population="Nieuwe medewerkers in de eerste werkperiode",
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
        mgmt_q_source=br_mgmt_q_source,
        responsbasis_html=_responsbasis_band,
        opener_html=ch.opener("Bestuurlijke read"),
        usage_html=_gebruiksblok(data["scan_lbl"]),
    )

    # ── Overzichtsprofiel (p.04) ──────────────────────────────────────────────
    profile_factors = [(_fl(fk, ST), fa.get(fk))
                       for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    _overzicht_summary, _overzicht_bands = _overzicht_summary_and_bands(profile_factors)
    s += _overzichtsprofiel(profile_factors, summary=_overzicht_summary, bands=_overzicht_bands,
                            opener_html=ch.opener("Overzichtsprofiel"))

    # ── Checkpointoverzicht (p.05 — onboarding-exclusive) ────────────────────
    s += _checkpointoverzicht(checkpoints=[("Huidig checkpoint", avg_risk)],
                              opener_html=ch.opener("Onboardingfases", kicker="Checkpointoverzicht"))

    # ── Landingskwaliteit per domein (onboarding-exclusive) ───────────────────
    domain_scores = [(_fl(fk, ST), fa.get(fk))
                     for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    s += _landingskwaliteit(domain_scores)

    # ── Factordiepte ×≤3 (prioriteit = laagste score, geen vertrekredenen) ────
    priority_fkeys = _select_priority_factors(fa, {}, max_n=3)

    def _ob_factor_detail(fk: str, opener_html: str = "", intro_html: str = "") -> str:
        lbl    = _fl(fk, ST)
        fsc    = fa.get(fk)
        col    = _factor_color(fsc)
        fl_    = _factor_label(fsc)
        items  = fim.get(fk, [])
        i_sc   = [(ik, q, oim.get(ik)) for ik, q in items if oim.get(ik) is not None]
        low_i  = min(i_sc, key=lambda x: x[2]) if i_sc else None
        high_i = max(i_sc, key=lambda x: x[2]) if i_sc else None
        # Laagste item vet in de tabel; losse kaarten alleen bij >3 items
        # (bij 3 items waren ze herhaling van de tabel). Het statische
        # "Eerste managementvraag"-blok is bewust weg — template-taal.
        rows = "".join(
            f'<tr><td class="iq"{" style=\"font-weight:700;\"" if low_i and ik == low_i[0] else ""}>{_h(q)}'
            f'{" <span class=\"low-tag\">laagste score</span>" if low_i and ik == low_i[0] else ""}</td>'
            f'<td class="is" style="color:{_factor_color(isc)};">{isc:.1f}</td></tr>'
            for ik, q, isc in i_sc
        ) or '<tr><td colspan="2" style="color:#94A3B8;font-style:italic;">Itemscores niet beschikbaar in deze wave.</td></tr>'
        # Per-factor quote bewust geschrapt (besluit 2026-07-12): zie de
        # identieke noot bij _factor_detail (exit-renderer).
        show_cards = len(i_sc) > 3
        low_card  = (f'<div class="card"><span class="eyebrow">Kwetsbaarste stelling</span>'
                     f'<p>{_h(low_i[1])}</p>'
                     f'<strong style="color:{_factor_color(low_i[2])};">{low_i[2]:.1f}/10</strong></div>'
                     if show_cards and low_i else "")
        high_card = (f'<div class="card"><span class="eyebrow">Relatief sterkste item</span>'
                     f'<p>{_h(high_i[1])}</p>'
                     f'<strong style="color:{_factor_color(high_i[2])};">{high_i[2]:.1f}/10</strong></div>'
                     if show_cards and high_i else "")
        spread = distribution_block(data.get("factor_resp_scores", {}).get(fk, []))
        return f"""<div class="pb sec">
  {opener_html or f'<span class="slabel">Verdieping: {_h(lbl)}</span>'}
  {intro_html}
  <h2>{_h(lbl)} <span style="color:{col};">{_score_str(fsc)}</span> <span style="font-size:13px;color:{col};">&middot; {_h(fl_)}</span></h2>
  <p style="font-size:10px;color:#64748B;margin-bottom:12px;">Lager op deze factor = meer frictie in de onboardingfase.</p>
  {spread}
  {low_card}
  {high_card}
  <h3 style="margin-top:28px;">Alle stellingen in deze factor</h3>
  <table class="item-tbl">{rows}</table>
</div>"""

    if priority_fkeys:
        for _i, _pfk in enumerate(priority_fkeys):
            _lbl = _fl(_pfk, ST)
            _opener = ch.opener(f"Verdieping: {_lbl}") if _i == 0 else _ChapterCounter.vervolg(f"Verdieping: {_lbl}")
            s += _ob_factor_detail(_pfk, opener_html=_opener, intro_html=_intro("verdieping") if _i == 0 else "")
    else:
        s += f'<div class="pb sec">{ch.opener("Verdieping: prioritaire factoren")}<div class="card">Factor detail beschikbaar na voldoende patroonduiding.</div></div>'

    # ── Werkbeleving (SDT) — if present ──────────────────────────────────────
    def _sdt_item_tbl(dim: str) -> str:
        keys = SDT_DIMENSION_ITEMS.get(dim, [])
        REV_LABEL = '<span style="font-size:8px;color:#94A3B8;">&nbsp;(omgekeerd)</span>'
        rows = "".join(
            f'<tr><td class="iq">{_h(q)}'
            f'{REV_LABEL if ik in SDT_REVERSE_ITEMS else ""}'
            f'</td><td class="is" style="color:{_rag_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
            f'<td class="ib">{_mini_bar_svg(sim.get(ik), _rag_color(sim.get(ik)), width=80, height=6)}</td></tr>'
            for ik in keys
            for q in [next((t for k, t in data["sdt_items"] if k == ik), ik)]
            if ik in sim
        )
        return f'<table class="item-tbl">{rows}</table>' if rows else ""

    sdt_overview_rows = "".join(
        _factor_bar_row(SDT_LABELS.get(dim, ""), sdt_a.get(dim))
        for dim in ("autonomy", "competence", "relatedness")
        if sdt_a.get(dim) is not None
    )

    if sdt_overview_rows:
        s += f"""<div class="pb sec">
  {ch.opener("Werkbeleving", kicker="Autonomie, competentie &amp; verbondenheid")}
  {_intro("werkbeleving")}
  <div class="card" style="margin-bottom:14px;">{sdt_overview_rows}</div>"""

        for dim in ("autonomy", "competence", "relatedness"):
            sc    = sdt_a.get(dim)
            col   = _rag_color(sc)
            fl_   = _factor_label(sc)
            tbl   = _sdt_item_tbl(dim)
            if not tbl: continue
            s += f"""<div class="card no-break" style="margin-bottom:12px;">
  <div style="margin-bottom:8px;">
    <span style="font-size:12px;font-weight:700;color:#243247;">{_h(SDT_LABELS.get(dim,""))}</span>
    <span style="font-size:11px;font-weight:700;color:{col};margin-left:10px;">{_score_str(sc)}</span>
    <span style="font-size:10px;color:{col};margin-left:6px;">&middot; {_h(fl_)}</span>
  </div>
  <div style="font-size:9.5px;color:#6B7280;margin-bottom:8px;">{_h(SDT_HELP.get(dim,""))}</div>
  {tbl}
</div>"""
        s += "</div>"

    # ── eNPS (if present) ────────────────────────────────────────────────────
    if data["enps_available"] and data["enps_score"] is not None:
        es   = data["enps_score"]
        ecol = _rag_color(10.0 if es >= 20 else 6.0 if es >= 0 else 4.0)
        s += f"""<div class="pb sec">
  {ch.opener("Werkgeversaanbeveling")}
  {_intro("werkgeversaanbeveling")}
  <table class="sg"><tr>
    <td><div class="sc-l">Aanbevelingsscore</div><div class="sc-v" style="color:{ecol};">{es:+d}</div><div class="sc-b">eNPS (&minus;100 tot +100)</div></td>
  </tr></table>
</div>"""

    # ── Segmentstatus ─────────────────────────────────────────────────────────
    _seg_rows = data.get("segment_rows") or []
    _seg_opener = ch.opener("Segmentanalyse per afdeling") if _seg_rows else ch.opener("Segmentanalyse")
    s += _segment_block(_seg_rows, factor_rows=data.get("segment_factor_rows"),
                        scan_type=ST, opener_html=_seg_opener)

    # ── Open toelichtingen ────────────────────────────────────────────────────
    texts = data["open_texts"]
    if _should_show_quotes(texts):
        s += f"""<div class="pb sec">
  {ch.opener("Open toelichtingen", kicker=f"{len(texts)} medewerkersstemmen")}
  {_intro("open_toelichtingen")}
  {_themed_quotes(texts, ST, top_fkeys, n)}
</div>"""

    # ── Eerste managementspoor / Gespreksagenda (naar het slot — na het bewijs,
    # vóór de appendix) ────────────────────────────────────────────────────────
    # Primair thema grounded in het laagst scorende item (zelfde aanpak als
    # exit/retention): geen vaste per-factor beslistekst die nooit meebeweegt.
    _ob_priority_fkeys = _select_priority_factors(fa, {}, max_n=3)
    _ob_primary_fk = _ob_priority_fkeys[0] if _ob_priority_fkeys else None
    _ob_primary_items = ([(ik, q, oim.get(ik)) for ik, q in fim.get(_ob_primary_fk, []) if oim.get(ik) is not None]
                          if _ob_primary_fk else [])
    _ob_primary_low = min(_ob_primary_items, key=lambda x: x[2]) if _ob_primary_items else None
    _ob_primary_theme = (
        f"Bespreek eerst ‘{_ob_primary_low[1]}’ binnen {_fl(_ob_primary_fk, ST).lower()} "
        f"({_ob_primary_low[2]:.1f}/10). Op deze stelling scoort de groep het laagst van het hele beeld."
    ) if _ob_primary_low else (low_lbl if low_lbl else "het leidende onboardingthema")

    _primary_why = (_primary_why_text(_ob_primary_low[2], (data.get("deepening_agg") or {}).get(_ob_primary_fk) or {}, ST, _ob_primary_fk)
                    if _ob_primary_low else None)
    _second_why = ("Tweede laagste factorscore in het overzichtsprofiel."
                   if len(sorted_f) > 1 else None)

    s += _eerste_managementspoor(
        primary_theme=_ob_primary_theme,
        second_point=f"{_fl(sorted_f[1][0], ST)} ({_score_str(sorted_f[1][1])})" if len(sorted_f) > 1 else "",
        mgmt_q=_mgmt_q(_ob_priority_fkeys[0], ST) if _ob_priority_fkeys else (nsp.get("first_decision") or ""),
        review_when="Plan een vervolgmoment rond het volgende checkpoint: bespreek dan wat er is opgepakt en of dit thema nog voorrang verdient.",
        primary_why=_primary_why,
        second_why=_second_why,
        opener_html=ch.opener("Gespreksagenda", kicker="Eerste managementspoor"),
    )

    # ── Appendix ─────────────────────────────────────────────────────────────
    n_factors = len([fk for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None])
    if _should_show_appendix(n, n_factors):
        app_sections = ""
        for fk, items in data["factor_items_map"].items():
            lbl_f = _fl(fk, ST)
            fsc_a = fa.get(fk)
            rows  = "".join(
                (f'<tr><td class="aq">{_h(q)}</td>'
                 f'<td class="as" style="color:{_factor_color(oim.get(ik))};">{oim[ik]:.1f}</td>'
                 f'<td class="ab">{_mini_bar_svg(oim.get(ik), _factor_color(oim.get(ik)), width=70, height=5)}</td></tr>')
                if oim.get(ik) is not None else
                f'<tr><td class="aq">{_h(q)}</td><td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
                for ik, q in items
            )
            app_sections += (f'<div class="no-break" style="margin-bottom:14px;">'
                             f'<div style="font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;">'
                             f'{_h(lbl_f)}'
                             f'{"&nbsp;&middot;&nbsp;" + _score_str(fsc_a) if fsc_a else ""}</div>'
                             f'<table class="app-tbl"><tr><th class="aq">Vraag</th>'
                             f'<th class="as">Gem.</th><th class="ab">Beeld</th></tr>{rows}</table></div>')

        sdt_rows = "".join(
            (f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
             f'<td class="as" style="color:{_factor_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
             f'<td class="ab">{_mini_bar_svg(sim.get(ik), _factor_color(sim.get(ik)), width=70, height=5)}</td></tr>')
            if sim.get(ik) is not None else
            f'<tr><td class="aq">{_h(q)}{"&nbsp;&#x21a9;" if ik in SDT_REVERSE_ITEMS else ""}</td>'
            f'<td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
            for ik, q in data["sdt_items"]
        )

        s += f"""<div class="pb sec">
  {ch.opener("Appendix", kicker="Volledige vraagresultaten")}
  {_intro("appendix")}
  <p style="font-size:9px;color:#94A3B8;margin-bottom:14px;">
    n={n}. &#x21a9;&nbsp;= omgekeerd gecodeerde stelling.
  </p>
  {app_sections}
  {"<div class='no-break' style='margin-bottom:14px;'><div style='font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;'>Werkbeleving (SDT): checkpoint-items</div><table class='app-tbl'><tr><th class='aq'>Vraag</th><th class='as'>Gem.</th><th class='ab'>Beeld</th></tr>" + sdt_rows + "</table></div>" if sdt_rows else ""}
</div>"""

    # ── Methodiek (LAST) ──────────────────────────────────────────────────────
    s += _trust_page(ST, opener_html=ch.opener("Methodiek, privacy &amp; interpretatiegrenzen"))
    return _doc(f"Loep Start · {data['campaign_name']}", s, scan_type="onboarding")


# ─── Dispatcher + PDF ────────────────────────────────────────────────────────

def render_report_html(data: dict) -> str:
    st = data.get("scan_type", "exit")
    if st == "retention":  return render_retention_report_html(data)
    if st == "onboarding": return render_onboarding_report_html(data)
    return render_exit_report_html(data)


def generate_campaign_report_html(campaign_id: str, db: Session) -> bytes:
    from weasyprint import HTML
    return HTML(string=render_report_html(build_report_data(campaign_id, db))).write_pdf()
