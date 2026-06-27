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

import math
from collections import Counter, defaultdict
from datetime import datetime, timezone
from html import escape as _esc
from statistics import mean as _mean
from typing import Any

from sqlalchemy.orm import Session, joinedload, selectinload

from backend.models import Campaign, Respondent, SurveyResponse
from backend.report_css import build_css, RAG_HIGH, RAG_MID, RAG_LOW
from backend.products.shared.registry import get_product_module
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
    SDT_DIMENSION_ITEMS,
    SDT_REVERSE_ITEMS,
)

# ─── Constanten ───────────────────────────────────────────────────────────────

MIN_QUOTES_N = 5
MAX_QUOTES   = 5


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
    "growth":       "Groeiperspectief en erkenning",
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
    "HOOG":   ("Sterk frictiebeeld",       "#EF4444"),
    "MIDDEN": ("Gemengd vertrekbeeld",      "#F59E0B"),
    "LAAG":   ("Laag frictiebeeld",         "#22C55E"),
}
_RETENTION_BANDS = {
    "HOOG":   ("Behoud onder druk",          "#EF4444"),
    "MIDDEN": ("Behoud vraagt aandacht",    "#F59E0B"),
    "LAAG":   ("Behoudsklimaat stabiel",    "#22C55E"),
}
_ONBOARDING_BANDS = {
    "HOOG":   ("Onboardingbasis vraagt aandacht", "#EF4444"),
    "MIDDEN": ("Gemengd onboardingsbeeld",         "#F59E0B"),
    "LAAG":   ("Onboardingbasis stabiel",           "#22C55E"),
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
    "leadership":   "Gaat het signaal vooral over feedback, ontwikkelgesprekken of vertrouwen?",
    "culture":      "Is dit beeld over psychologische veiligheid, teamdynamiek of cultuurfit?",
    "growth":       "Gaat het over concrete kansen, zichtbaar perspectief of gebrek aan erkenning?",
    "compensation": "Is de kern hier salaris, ervaren fairness of uitlegbaarheid van voorwaarden?",
    "workload":     "Speelt de werkdruk in bepaalde teams, functies of als structureel patroon?",
    "role_clarity": "Gaat de onduidelijkheid over prioriteiten, eigenaarschap of beslisruimte?",
}
_MGMT_Q_RETENTION: dict[str, str] = {
    "leadership":   "Gaat het behoudssignaal over vertrouwen in leiding, feedback of zichtbare steun?",
    "culture":      "Is dit beeld over psychologische veiligheid, teambinding of cultuurmatch?",
    "growth":       "Speelt ontbrekend perspectief, gebrek aan erkenning of stagnatie een rol?",
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
    """Prioriteit = lage score + frequentie als vertrekreden. Niet puur laagste."""
    def _priority(fk: str) -> float:
        score = factor_avgs.get(fk, 10.0)
        reason = exit_reason_counts.get(fk, 0)
        return (10.0 - score) * 1.0 + reason * 0.4
    keys = [fk for fk in factor_avgs if factor_avgs.get(fk) is not None]
    return sorted(keys, key=_priority, reverse=True)[:max_n]


# Behoudsrelevantie per factor (voor retention prioriteitenmatrix)
_RETENTION_RELEVANCE: dict[str, float] = {
    "workload": 0.85, "leadership": 0.82, "growth": 0.78,
    "role_clarity": 0.72, "culture": 0.68, "compensation": 0.62,
}

THEME_KEYWORDS: dict[str, list[str]] = {
    "Leiderschap en feedback":   ["leiding", "manager", "feedback", "coacht", "vertrouw", "leidinggevende"],
    "Groeiperspectief":          ["groei", "ontwikkel", "perspectief", "loopbaan", "doorgroei", "promotie"],
    "Werkdruk en balans":        ["werkdruk", "druk", "stress", "overwerk", "balans", "hersteltijd"],
    "Erkenning en beloning":     ["erkenning", "waardering", "salaris", "beloning", "beloond"],
    "Psychologische veiligheid": ["veilig", "fouten", "vragen", "cultuur", "sfeer"],
    "Rolhelderheid":             ["onduidelijk", "verwachting", "rol", "verantwoordelijkheid", "prioriteit"],
}
_ONBOARDING_THEME_KEYWORDS: dict[str, list[str]] = {
    "Rolhelderheid en verwachtingen": ["verwachting", "rol", "doel", "prioriteit", "onduidelijk"],
    "Begeleiding en steun":           ["manager", "begeleiding", "buddy", "steun", "bereikbaar", "feedback"],
    "Werkdruk en tempo":              ["druk", "tempo", "informatie", "snel", "overweldigend", "werkdruk"],
    "Sociale landing":                ["team", "welkom", "collega", "cultuur", "plek", "erbij"],
    "Praktische start":               ["tools", "toegang", "systeem", "inwerken", "regelen"],
    "Eerste succeservaring":          ["bijdragen", "succes", "resultaat", "zichtbaar", "bereikt", "groei"],
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
    if score is None:  return "#94A3B8"
    if score < 5.0:    return "#EF4444"
    if score < 6.5:    return "#F59E0B"
    return "#22C55E"

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


def _bestuurlijke_read(*, kernzin: str, totaalbeeld: str,
                       primary_label: str, primary_score: float | None, primary_color: str,
                       why_cells_html: str, strong_label: str, strong_score: float | None,
                       mgmt_q: str) -> str:
    return f"""<div class="pb sec">
  <span class="slabel">Bestuurlijke read</span>
  <p class="br-kernzin">{_h(kernzin)}</p>
  <p style="font-size:11px;color:#374151;max-width:62ch;margin-bottom:22px;">{_h(totaalbeeld)}</p>
  <div class="why" style="padding:18px 22px 14px;">
    <div class="why-title" style="font-size:13px;margin-bottom:14px;">Waarom {_h(primary_label)} bovenaan staat</div>
    <table class="why-grid"><tr>{why_cells_html}</tr></table>
  </div>
  <table class="sg" style="margin-top:16px;"><tr>
    <td><div class="sc-l">Primaire factor</div><div class="sc-v" style="color:{primary_color};">{_score_str(primary_score)}</div><div class="sc-b">{_h(primary_label)}</div></td>
    <td><div class="sc-l">Relatief sterk</div><div class="sc-v">{_score_str(strong_score)}</div><div class="sc-b">{_h(strong_label)} — wat w&eacute;l werkt</div></td>
    <td><div class="sc-l">Responsbasis</div><div class="sc-v">Zie p.03</div><div class="sc-b">reikwijdte &amp; betrouwbaarheid</div></td>
  </tr></table>
  <div class="card accent" style="margin-top:0;"><h3>Eerste managementvraag</h3><p style="margin-bottom:0;">{_h(mgmt_q)}</p></div>
</div>"""


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
    owner    = row.get("owner") or row.get("owner_basis","")

    return f"""<div class="play" style="border-left-color:{col};">
  <div class="play-hdr">
    <div class="play-bdg"><span style="background:{col};">{_h(bl)}</span></div>
    <div class="play-ttl">{_h(lbl)} — {_h(row.get("title",""))}</div>
  </div>
  {"<div class='sub-l'>Eerste managementvraag</div><p style='font-size:10.5px;'>" + _h(decision) + "</p>" if decision else ""}
  {"<div class='sub-l'>Waar te beginnen</div><p style='font-size:10.5px;'>" + _h(validate) + "</p>" if validate else ""}
  {"<div class='sub-l'>Mogelijke stappen</div><ul class='act-lst'>" + acts + "</ul>" if acts else ""}
  {"<div class='sub-l'>Eigenaar</div><p style='font-size:10.5px;'>" + _h(owner) + "</p>" if owner else ""}
  {"<div class='sub-l'>Reviewmoment</div><p style='font-size:10.5px;'>" + _h(review) + "</p>" if review else ""}
</div>"""


def _step_cards(nsp: dict) -> str:
    import re as _re
    cards = nsp.get("session_cards") or [
        {"title": "Prioriteit",   "body": nsp.get("first_decision","")},
        {"title": "Eigenaar",     "body": nsp.get("first_owner","")},
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

    tds = "".join(
        f'<td class="step"><div class="step-no">{_h(c.get("title",""))}</div>'
        f'<div class="step-body">{_h(_clean(c.get("title",""), c.get("body","")))}</div></td>'
        for c in cards[:4])
    return f'<table class="steps"><tr>{tds}</tr></table>'


def _eerste_managementspoor(*, primary_theme: str, second_point: str, mgmt_q: str,
                            owner: str, review_when: str) -> str:
    """Gespreksagenda voor eerste managementbespreking — geen actieplan, agenda."""
    return f"""<div class="pb sec">
  <span class="slabel">Eerste managementspoor</span>
  <h2 style="margin-bottom:6px;">Gespreksagenda</h2>
  <p style="font-size:10.5px;color:#64748B;max-width:60ch;margin-bottom:16px;">
    Geen kant-en-klaar plan &mdash; een agenda voor de begeleide managementbespreking.</p>
  <table class="steps"><tr>
    <td class="step"><div class="step-no">Primair thema</div><div class="step-body">{_h(primary_theme)}</div></td>
    <td class="step"><div class="step-no">Tweede aandachtspunt</div><div class="step-body">{_h(second_point)}</div></td>
    <td class="step"><div class="step-no">Eigenaarschap</div><div class="step-body">{_h(owner)}</div></td>
    <td class="step"><div class="step-no">Opnieuw bespreken</div><div class="step-body">{_h(review_when)}</div></td>
  </tr></table>
  <div class="card accent"><h3>Gespreksopener</h3><p style="margin-bottom:0;">{_h(mgmt_q)}</p></div>
  <p class="trustline">Nog niet besluiten: of een verdieping of kortere vervolgmeting nodig is &mdash; dat volgt uit het gesprek.</p>
</div>"""


def _trust_page(scan_type: str = "exit") -> str:
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
            ("Open toelichtingen","Geanonimiseerd. Namen, contactgegevens en locaties verwijderd. Alleen bij voldoende n getoond."),
            ("Claimgrenzen",     "RetentieScan is een actieve-populatie groepssignaal. Geen causale claims, geen interventieprescriptie."),
            ("Privacywaarborg",  "Verwerking conform AVG. Uitsluitend bestemd voor geautoriseerde gebruikers."),
        ]
    elif scan_type == "onboarding":
        intro = ("Dit rapport bundelt patronen uit onboarding-checkpoints tot een groepsbeeld van de eerste "
                 "werkperiode. Geen prestatiebeoordeling, geen individuele beoordeling en geen voorspelling van uitval.")
        cells_r1 = [
            ("Groepsniveau",       "Alle scores zijn groepsgemiddelden van de instroomgroep. Geen individuele gegevens."),
            ("Checkpoint-logica",  "Dit is een enkelvoudig meetmoment (30/60/90). Trends zijn zichtbaar bij herhaalde meting."),
            ("Geen beoordeling",   "Scores duiden onboarding-ervaring op groepsniveau. Geen prestatiebeoordeling van individuen of managers."),
        ]
        cells_r2 = [
            ("Open toelichtingen", "Geanonimiseerd. Namen, contactgegevens en locaties verwijderd. Alleen bij voldoende n getoond."),
            ("Claimgrenzen",       "Onboarding is een groepscheck op de eerste werkperiode. Geen causale claims, geen uitvalpredicties."),
            ("Privacywaarborg",    "Verwerking conform AVG. Uitsluitend bestemd voor geautoriseerde gebruikers."),
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
            ("Open toelichtingen","Geanonimiseerd. Namen, contactgegevens en locaties verwijderd. Alleen bij voldoende n getoond."),
            ("Claimgrenzen",     "ExitScan is een terugkijkende groepsmeting op uitstroom. Geen causale claims, geen oordeel over vermijdbaarheid, geen verlooppredicties."),
            ("Privacywaarborg",  "Verwerking conform AVG. Uitsluitend bestemd voor geautoriseerde gebruikers."),
        ]

    def _cells(pairs: list[tuple[str, str]]) -> str:
        return "".join(
            f'<td class="tc"><div class="tt">{_h(t)}</div><div class="tb">{_h(b)}</div></td>'
            for t, b in pairs)

    return f"""<div class="pb sec">
  <span class="slabel">Methodiek, privacy &amp; interpretatiegrenzen</span>
  <div class="card" style="margin-bottom:14px;">
    <p style="font-size:11px;color:#374151;">{_h(intro)}</p>
  </div>
  <table class="tg"><tr>{_cells(cells_r1)}</tr></table>
  <table class="tg" style="margin-top:10px;"><tr>{_cells(cells_r2)}</tr></table>
</div>"""


def _segment_status_block(n: int, has_segment_data: bool = False,
                           reason: str = "n-grens") -> str:
    """Segmentstatus — altijd zichtbaar, ook als segmenten niet worden getoond."""
    if has_segment_data:
        return f"""<div class="pb sec">
  <span class="slabel">Segmentanalyse</span>
  <div class="card" style="border-left:4px solid #22C55E;">
    <div style="display:table;width:100%;">
      <div style="display:table-cell;vertical-align:middle;width:1%;white-space:nowrap;padding-right:14px;">
        <span style="font-size:9px;font-weight:700;background:#22C55E;color:#FFF;
          padding:3px 9px;border-radius:3px;letter-spacing:0.08em;text-transform:uppercase;">Beschikbaar</span>
      </div>
      <div style="display:table-cell;vertical-align:middle;font-size:10px;color:#374151;">
        Segmentanalyse beschikbaar &mdash; zie uitgebreide versie.
      </div>
    </div>
  </div>
</div>"""
    else:
        return f"""<div class="pb sec">
  <span class="slabel">Segmentanalyse</span>
  <div class="empty-state">
    <p style="margin-bottom:4px;">Segmentverschillen zijn niet getoond om herleidbaarheid te voorkomen.</p>
    <p style="margin-bottom:0;">Verdieping opent zodra voldoende responses per groep beschikbaar zijn.</p>
  </div>
</div>"""


def _themed_quotes(texts: list[str], scan_type: str = "exit",
                   top_fkeys: list[str] | None = None, n_total: int = 0) -> str:
    """Thematische open toelichtingen — geen quote dump, altijd met thema + evidence label."""
    top_fkeys = top_fkeys or []
    keywords = _ONBOARDING_THEME_KEYWORDS if scan_type == "onboarding" else THEME_KEYWORDS

    def _classify(t: str) -> str:
        tl = t.lower()
        for theme, kws in keywords.items():
            if any(kw in tl for kw in kws):
                return theme
        if any(kw in tl for kw in ["persoonlijk","omstandigh","verhuis","studie","gezin"]):
            return "Persoonlijke omstandigheid"
        if any(kw in tl for kw in ["aanbod","andere baan","extern","concurrent"]):
            return "Beter aanbod elders"
        return "Overige toelichting"

    if len(texts) < MIN_QUOTES_N:
        return (f'<div class="empty-state">Open toelichtingen worden getoond bij minimaal '
                f'{MIN_QUOTES_N} antwoorden. Huidig: {len(texts)}.</div>')

    theme_counts: dict[str, int] = {}
    for t in texts:
        th = _classify(t)
        theme_counts[th] = theme_counts.get(th, 0) + 1

    tc_sorted = sorted(theme_counts.items(), key=lambda x: -x[1])
    summary = (
        '<div style="font-size:10px;color:#374151;margin-bottom:12px;">'
        '<strong>Thema\'s:</strong>&nbsp;&nbsp;' +
        " &middot; ".join(f"<strong>{_h(k)}</strong>&nbsp;({v}&times;)" for k, v in tc_sorted) +
        '</div>'
    )

    # Top factor keywords voor evidence label
    tf_kws: list[str] = []
    for tfk in top_fkeys[:1]:
        for kws in keywords.values():
            for kw in kws:
                if tfk in kw.lower():
                    tf_kws.extend(kws)
                    break

    used: set[str] = set()
    cards = ""
    for t in texts[:MAX_QUOTES]:
        if t in used: continue
        used.add(t)
        tl   = t.lower()
        theme = _classify(t)
        n_th  = theme_counts.get(theme, 1)

        if tf_kws and any(kw in tl for kw in tf_kws):
            ev, ev_bg, ev_tc = "bevestigt topfactor", "#FEF2F2", "#DC2626"
        elif any(kw in tl for kw in ["niet","maar","hoewel","toch","echter","juist"]):
            ev, ev_bg, ev_tc = "nuanceert beeld", "#EFF6FF", "#1D4ED8"
        else:
            ev, ev_bg, ev_tc = "verdiept signaal", "#F0FDF4", "#15803D"

        cards += (
            f'<div class="theme-card">'
            f'<span class="theme-badge">{_h(theme)}</span>'
            f'<span style="font-size:8px;color:#94A3B8;margin-left:5px;">{n_th}&times;</span>'
            f'<span class="ev-badge" style="background:{ev_bg};color:{ev_tc};">{_h(ev)}</span>'
            f'<div class="quote-txt">{_h(t)}'
            f'<div class="quote-anon">Geanonimiseerd &mdash; namen en contactgegevens verwijderd</div>'
            f'</div></div>'
        )

    note = (f'Getoond: {min(len(texts),MAX_QUOTES)} van {len(texts)} toelichtingen. '
            f'Thema-indeling op trefwoorden &mdash; indicatief.')
    return f'{summary}<div class="cbox" style="margin-bottom:12px;font-size:10px;color:#374151;">{note}</div>{cards}'


# ─── Data builder ─────────────────────────────────────────────────────────────

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
        f"ExitScan {mode_lbl}" if scan_type == "exit" else scan_meta["product_name"])
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
    sdt_items: list[tuple[str, str]] = scan_meta.get("sdt_items", [])

    enps_vals = [float(fr.get("enps_score")) for r in responses
                 if (fr := (r.full_result or {})) and fr.get("enps_score") is not None]
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
        retention_profile=retention_profile,
        exit_pbs=exit_pbs, ret_pbs=ret_pbs, msp=msp, nsp=nsp,
        factor_items_map=factor_items_map, sdt_items=sdt_items,
        enps_available=enps_available, enps_score=enps_score,
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


# ─── Vertrekcontext (T7) ──────────────────────────────────────────────────────

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


# ─── Behoudscontext (T7-retention) ───────────────────────────────────────────

def _behoudscontext(*, retention_score: float | None, stay_intent: float | None,
                    turnover: float | None, engagement: float | None,
                    primary_factor: str) -> str:
    """Retention-exclusive section: actuele behoudscontext op groepsniveau."""
    def _stat_cell(label: str, value: str, note: str = "") -> str:
        return (f'<td><div class="sc-l">{_h(label)}</div>'
                f'<div class="sc-v">{_h(value)}</div>'
                f'{"<div class=\'sc-b\'>" + _h(note) + "</div>" if note else ""}</td>')

    def _ret_note(label: str, score: float | None, interpretation: str) -> str:
        """Interpretief label onder een score: toont wat de score betekent, niet wat het is."""
        return interpretation

    cells = ""
    if retention_score is not None:
        col = _factor_color(retention_score)
        note = ("sterk" if retention_score >= 7.5 else
                "voldoende" if retention_score >= 6.0 else
                "vraagt aandacht" if retention_score >= 4.5 else
                "onder druk")
        cells += f'<td><div class="sc-l">Behoudssignaal</div><div class="sc-v" style="color:{col};">{retention_score:.1f}/10</div><div class="sc-b">werkfactoren &amp; werkbeleving samengebracht &mdash; {note}</div></td>'
    if stay_intent is not None:
        scol = _rag_color(stay_intent)
        cells += (f'<td><div class="sc-l">Blijfintentie</div>'
                  f'<div class="sc-v" style="color:{scol};">{stay_intent:.1f}/10</div>'
                  f'<div class="sc-b">&ldquo;Als het aan mij ligt, werk ik over 12 maanden nog steeds hier.&rdquo;'
                  f'<br><span style="font-size:8px;color:#94A3B8;">enkelvoudige richtingsvraag &mdash; indicatief</span></div></td>')
    if turnover is not None:
        tcol = _rag_color(10 - turnover)
        note = ("laag" if turnover <= 3.0 else
                "beperkt" if turnover <= 5.0 else
                "zichtbaar" if turnover <= 6.5 else
                "hoog &mdash; actief vertrekrisico")
        cells += (f'<td><div class="sc-l">Vertrekintentie</div>'
                  f'<div class="sc-v" style="color:{tcol};">{turnover:.1f}/10</div>'
                  f'<div class="sc-b">&ldquo;Ik denk er serieus over na te vertrekken&rdquo; + &ldquo;Ik zoek actief.&rdquo;'
                  f'<br><span style="font-size:8px;color:#94A3B8;">gemiddelde van 2 stellingen &mdash; {note}</span></div></td>')
    if engagement is not None:
        ecol = _factor_color(engagement)
        note = ("hoog" if engagement >= 7.5 else
                "gemiddeld" if engagement >= 6.0 else
                "laag &mdash; geen buffer" if engagement >= 4.5 else
                "zorgelijk laag")
        cells += (f'<td><div class="sc-l">Bevlogenheid</div>'
                  f'<div class="sc-v" style="color:{ecol};">{engagement:.1f}/10</div>'
                  f'<div class="sc-b">Energie &middot; Inspiratie &middot; Zin om te gaan &mdash; UWES'
                  f'<br><span style="font-size:8px;color:#94A3B8;">gemiddelde van 3 stellingen &mdash; {note}</span></div></td>')

    stat_grid = f'<table class="sg"><tr>{cells}</tr></table>' if cells else ""
    legend = (
        '<p style="font-size:9px;color:#94A3B8;margin-top:10px;margin-bottom:0;">'
        'Behoudssignaal meet condities (factorscores). '
        'Blijf&shy;intentie en vertrekintentie zijn geen inverse van elkaar &mdash; '
        'iemand kan beide tegelijk voelen. '
        'Bevlogenheid is onafhankelijk: betrokken medewerkers vertrekken soms toch.</p>'
    )

    return f"""<div class="pb sec">
  <span class="slabel">Behoudscontext</span>
  <h2 style="margin-bottom:6px;">Waar staat behoud onder druk?</h2>
  <p style="font-size:10.5px;color:#64748B;max-width:60ch;margin-bottom:18px;">
    Vier signalen op groepsniveau &mdash; condities, intentie en werkbeleving samengebracht.
    Geen individuele risicobeoordeling &mdash; patronen zijn leidend.
  </p>
  {stat_grid}
  {legend}
  <div class="card accent" style="margin-top:14px;">
    <h3>Primaire behoudsfactor</h3>
    <p style="margin-bottom:0;">{_h(primary_factor)} vraagt als eerste aandacht in het behoudsklimaat.</p>
  </div>
</div>"""


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
    primary_signal = high_lbl or low_lbl or "—"
    cover_stats = [
        ("Respondenten", str(n)),
        ("Respons", f"{data['completion_pct']}%"),
        ("Primair signaal", primary_signal),
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
    if high_lbl and high_lbl != low_lbl:
        exec_line += f" {high_lbl} scoort relatief sterk ({_score_str(high_sc)})."

    # ── Bestuurlijke read ─────────────────────────────────────────────────────
    # Build why_cells for the primary (lowest-scoring) factor
    if top_fkeys:
        tf      = top_fkeys[0]
        tf_lbl  = FACTOR_LABELS_NL.get(tf, tf)
        tf_sc   = fa.get(tf)
        tf_col  = _factor_color(tf_sc)
        tf_fl   = _factor_label(tf_sc)
        tf_code = FACTOR_EXIT_CODE.get(tf)
        er_n    = next((r["count"] for r in data["exit_r_dist"] if r["code"] == tf_code), 0) if tf_code else 0
        cont_n  = next((r["count"] for r in data["cont_dist"]   if r["code"] == tf_code), 0) if tf_code else 0

        items_in   = fim.get(tf, [])
        i_scores   = [(ik, q, oim.get(ik)) for ik, q in items_in if oim.get(ik) is not None]
        low_item   = min(i_scores, key=lambda x: x[2]) if i_scores else None

        why_cells = ""
        if er_n:
            why_cells += f'<td class="why-cell"><div class="why-l">Hoofdreden</div><div class="why-v" style="color:{tf_col};">{er_n}&times;</div><div class="why-b">meest genoemde vertrekreden</div></td>'
        if tf_sc:
            why_cells += f'<td class="why-cell"><div class="why-l">Factorscore</div><div class="why-v" style="color:{tf_col};">{tf_sc:.1f}/10</div><div class="why-b">{_h(tf_fl)}</div></td>'
        if low_item:
            why_cells += (f'<td class="why-cell"><div class="why-l">Laagste item</div>'
                          f'<div class="why-v" style="color:{_factor_color(low_item[2])};">{low_item[2]:.1f}/10</div>'
                          f'<div class="why-b">{_h(low_item[1])}</div></td>')
        if cont_n:
            why_cells += f'<td class="why-cell"><div class="why-l">Speelt ook mee</div><div class="why-v">{cont_n}&times;</div><div class="why-b">als meespelende context</div></td>'

        primary_fkey  = tf
        primary_label = tf_lbl
        primary_sc    = low_sc
        primary_col   = _factor_color(low_sc)
        br_mgmt_q     = _mgmt_q(tf, "exit")
    else:
        why_cells     = ""
        primary_fkey  = low_f[0] if low_f else None
        primary_label = low_lbl
        primary_sc    = low_sc
        primary_col   = _factor_color(low_sc)
        br_mgmt_q     = _mgmt_q(low_f[0], "exit") if low_f else ""

    totaalbeeld = (
        f"{low_lbl} vraagt als eerste aandacht. "
        f"{high_lbl} laat zien wat wél werkt. "
        f"De responsbasis bepaalt hoe stevig dit beeld is — zie p.03."
    ) if low_lbl and high_lbl and low_lbl != high_lbl else (
        f"{low_lbl} vraagt als eerste aandacht. De responsbasis bepaalt hoe stevig dit beeld is — zie p.03."
    ) if low_lbl else "Zie factoranalyse voor details — zie p.03 voor de responsbasis."

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
    )

    # ── Responsbasis & reikwijdte (p.03) ──────────────────────────────────────
    s += _responsbasis(
        invited=data["n_invited"],
        completed=data["n_completed"],
        pct=int(data["completion_pct"]),
        period=data["campaign_name"],
        population="Alle medewerkers",
        segment_available=False,
        segment_reason="te weinig responses per groep voor herleidbaarheid",
    )

    # ── Overzichtsprofiel ─────────────────────────────────────────────────────
    profile_factors = [(FACTOR_LABELS_NL.get(fk, fk), fa.get(fk))
                       for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    s += _overzichtsprofiel(profile_factors)

    # ── Vertrekcontext (T7) ───────────────────────────────────────────────────
    exit_reasons = [(r["label"], r["count"]) for r in data["exit_r_dist"]]
    contributing = [(r["label"], r["count"]) for r in data["cont_dist"]]
    s += _vertrekcontext(exit_reasons=exit_reasons, contributing=contributing,
                         n=n, primary_factor_label=low_lbl)

    # ── Factor detail (itemniveau prioritaire factoren) ──────────────────────
    _code_to_count = {r["code"]: r["count"] for r in data["exit_r_dist"]}
    exit_code_counts = {fk: _code_to_count.get(FACTOR_EXIT_CODE.get(fk), 0) for fk in fa}
    priority_fkeys = _select_priority_factors(fa, exit_code_counts, max_n=3)

    def _factor_detail(fk: str) -> str:
        # ── Data logic (preserved from old helper) ──
        lbl    = FACTOR_LABELS_NL.get(fk, fk)
        fsc    = fa.get(fk)
        col    = _factor_color(fsc)
        fl_    = _factor_label(fsc)
        items  = fim.get(fk, [])
        i_sc   = [(ik, q, oim.get(ik)) for ik, q in items if oim.get(ik) is not None]
        low_i  = min(i_sc, key=lambda x: x[2]) if i_sc else None
        high_i = max(i_sc, key=lambda x: x[2]) if i_sc else None
        mgmt_q = _mgmt_q(fk, "exit")
        # Item table rows (keep .iq/.is/.ib classes — those are in new CSS)
        rows = "".join(
            f'<tr><td class="iq">{_h(q)}</td>'
            f'<td class="is" style="color:{_factor_color(isc)};">{isc:.1f}</td></tr>'
            for _, q, isc in i_sc
        ) or '<tr><td colspan="2" style="color:#94A3B8;font-style:italic;">Itemscores niet beschikbaar in deze wave.</td></tr>'
        # Optional quote: pick first open text that mentions a keyword of this factor
        fk_keywords = THEME_KEYWORDS.get(lbl, [])
        quote_txt: str | None = None
        for t in data["open_texts"]:
            t_low = t.lower()
            if any(kw in t_low for kw in fk_keywords):
                quote_txt = t
                break
        # ── Exit reason context block ──
        er_count = exit_code_counts.get(fk, 0)
        if er_count > 0:
            er_context = f'<div class="card accent">{er_count}&times; genoemd als vertrekreden &mdash; directe link met vertrekcontext.</div>'
        else:
            er_context = ""
        # ── Lowest / highest item cards ──
        low_card  = (f'<div class="card"><span class="eyebrow">Laagste item</span>'
                     f'<p>{_h(low_i[1])}</p>'
                     f'<strong style="color:{_factor_color(low_i[2])};">{low_i[2]:.1f}/10</strong></div>'
                     if low_i else "")
        high_card = (f'<div class="card"><span class="eyebrow">Hoogste item binnen deze factor</span>'
                     f'<p>{_h(high_i[1])}</p>'
                     f'<strong style="color:{_factor_color(high_i[2])};">{high_i[2]:.1f}/10</strong></div>'
                     if high_i else "")
        # ── Quote block ──
        quote_block = (f'<div class="quote-txt">{_h(quote_txt)}'
                       f'<div class="quote-anon">Geanonimiseerd &mdash; namen en contactgegevens verwijderd</div>'
                       f'</div>'
                       if quote_txt else "")
        # ── Management question ──
        mgmt_block = (f'<div class="card accent"><span class="eyebrow">Eerste managementvraag</span>'
                      f'<p>{_h(mgmt_q)}</p></div>'
                      if mgmt_q else "")
        return f"""<div class="pb sec">
  <span class="slabel">Verdieping &mdash; {_h(lbl)}</span>
  <h2>{_h(lbl)} <span style="color:{col};">{_score_str(fsc)}</span> <span style="font-size:13px;color:{col};">&mdash; {_h(fl_)}</span></h2>
  {er_context}
  {low_card}
  {high_card}
  <h3>Alle items in deze factor</h3>
  <table class="item-tbl">{rows}</table>
  {quote_block}
  {mgmt_block}
</div>"""

    if priority_fkeys:
        for _pfk in priority_fkeys:
            s += _factor_detail(_pfk)
    else:
        s += '<div class="pb sec"><span class="slabel">Verdieping &mdash; prioritaire factoren</span><div class="card">Factor detail beschikbaar na voldoende patroonduiding.</div></div>'

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
  <span class="slabel">Werkbeleving — autonomie, competentie &amp; verbondenheid</span>
  <p>Drie basisbehoeften die de onderliggende werkbeleving meten, onafhankelijk van de organisatiefactoren.</p>
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
    <span style="font-size:10px;color:{col};margin-left:6px;">— {_h(fl_)}</span>
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
  <span class="slabel">Werkgeversaanbeveling</span>
  <table class="sg"><tr>
    <td><div class="sc-l">Aanbevelingsscore</div><div class="sc-v" style="color:{ecol};">{es:+d}</div><div class="sc-b">eNPS (&minus;100 tot +100)</div></td>
  </tr></table>
  <div class="card"><p style="margin-bottom:0;">Aanvullende context naast het overzichtsprofiel. Een positieve score betekent meer promotors dan criticasters.</p></div>
</div>"""
    else:
        s += """<div class="pb sec">
  <span class="slabel">Werkgeversaanbeveling</span>
  <div class="card"><p style="margin-bottom:0;color:#64748B;">Niet gemeten in deze wave.</p></div>
</div>"""

    # ── Segmentstatus ─────────────────────────────────────────────────────────
    s += _segment_status_block(n, has_segment_data=False, reason="n-grens")

    # ── Open toelichtingen ────────────────────────────────────────────────────
    texts = data["open_texts"]
    if _should_show_quotes(texts):
        s += f"""<div class="pb sec">
  <span class="slabel">Open toelichtingen &mdash; {len(texts)} respondentstemmen</span>
  {_themed_quotes(texts, "exit", top_fkeys, n)}
</div>"""

    # ── Eerste managementspoor (gespreksagenda) ───────────────────────────────
    s += _eerste_managementspoor(
        primary_theme=nsp.get("first_decision") or (top_flabels[0] if top_flabels else "het leidende thema"),
        second_point=top_flabels[1] if len(top_flabels) > 1 else "",
        mgmt_q=_mgmt_q(priority_fkeys[0], "exit") if priority_fkeys else (nsp.get("first_decision") or ""),
        owner=nsp.get("first_owner") or "HR + verantwoordelijk management",
        review_when=nsp.get("review_moment") or "bij de volgende meting",
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
                             f'{"&nbsp;&mdash;&nbsp;" + _score_str(fsc_a) if fsc_a else ""}</div>'
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
  <span class="slabel">Appendix — volledige vraagresultaten</span>
  <p style="font-size:9.5px;color:#64748B;margin-bottom:14px;">
    Technische onderbouwing. Scores zijn groepsgemiddelden (n={n}), geschaald 1&ndash;10.
    &#x21a9;&nbsp;= omgekeerd gecodeerd item.
  </p>
  {app_sections}
  <div class="no-break" style="margin-bottom:14px;">
    <div style="font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;">Werkbeleving (SDT) — B1 t/m B12</div>
    <table class="app-tbl"><tr><th class="aq">Vraag</th><th class="as">Gem.</th><th class="ab">Beeld</th></tr>{sdt_rows}</table>
  </div>
  <div class="empty-state" style="margin-top:8px;">
    Werkgeversaanbeveling (eNPS): {"beschikbaar, zie hoofdrapport" if data["enps_available"] else "niet gemeten in deze wave"}
  </div>
</div>"""

    # ── Methodiek (LAST) ──────────────────────────────────────────────────────
    s += _trust_page("exit")
    return _doc(f"ExitScan — {data['campaign_name']}", s, scan_type="exit")


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

    sorted_f    = sorted([(fk, fa.get(fk)) for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None], key=lambda x: x[1])
    low_f       = sorted_f[0]  if sorted_f else None
    high_f      = sorted_f[-1] if sorted_f else None
    low_lbl     = _fl(low_f[0], ST)  if low_f  else ""
    high_lbl    = _fl(high_f[0], ST) if high_f else ""
    low_sc      = low_f[1]  if low_f  else None
    high_sc     = high_f[1] if high_f else None

    # ── Cover ─────────────────────────────────────────────────────────────────
    _ret_primary = low_lbl or "—"   # lowest = primary behoudsdruk
    s = _cover(
        scan_label=data["scan_lbl"], scan_type=ST, org_name=data["org_name"],
        period=data["campaign_name"], opening_question="Waar staat behoud nu onder druk?",
        stats=[
            ("Respondenten", str(n)),
            ("Respons", f"{data['completion_pct']}%"),
            ("Primair signaal", _ret_primary),
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
            why_cells += f'<td class="why-cell"><div class="why-l">Factorscore</div><div class="why-v" style="color:{tf_col};">{tf_sc:.1f}/10</div><div class="why-b">{_h(_factor_label(tf_sc))}</div></td>'
        if low_item:
            why_cells += (f'<td class="why-cell"><div class="why-l">Laagste item</div>'
                          f'<div class="why-v" style="color:{_factor_color(low_item[2])};">{low_item[2]:.1f}/10</div>'
                          f'<div class="why-b">{_h(low_item[1])}</div></td>')
        if avg_eng is not None:
            ecol = _factor_color(avg_eng)
            eng_note = ("hoog" if avg_eng >= 7.5 else "gemiddeld" if avg_eng >= 6.0 else "laag — geen buffer" if avg_eng >= 4.5 else "zorgelijk laag")
            why_cells += f'<td class="why-cell"><div class="why-l">Bevlogenheid</div><div class="why-v" style="color:{ecol};">{avg_eng:.1f}/10</div><div class="why-b">werkbetrokkenheid — {eng_note}</div></td>'
        if avg_si is not None:
            si_col = _factor_color(avg_si)
            si_note = ("sterk" if avg_si >= 7.5 else "gemiddeld" if avg_si >= 6.0 else "laag voor actieve groep" if avg_si >= 4.5 else "zorgelijk laag")
            why_cells += f'<td class="why-cell"><div class="why-l">Blijfintentie</div><div class="why-v" style="color:{si_col};">{avg_si:.1f}/10</div><div class="why-b">intentie om te blijven — {si_note}</div></td>'

        primary_fkey  = tf
        primary_label = tf_lbl_
        primary_sc    = tf_sc
        primary_col   = tf_col
        br_mgmt_q     = _mgmt_q(tf, ST)
    else:
        why_cells     = ""
        primary_fkey  = low_f[0] if low_f else None
        primary_label = low_lbl
        primary_sc    = low_sc
        primary_col   = _factor_color(low_sc)
        br_mgmt_q     = _mgmt_q(low_f[0], ST) if low_f else ""

    if avg_risk and band_lbl and low_lbl and high_lbl and low_lbl != high_lbl:
        exec_line = (f"{band_lbl} ({_score_str(avg_risk)}). "
                     f"{low_lbl} vraagt als eerste aandacht; {high_lbl} staat relatief sterk.")
    elif avg_risk and band_lbl and low_lbl:
        exec_line = f"{band_lbl} ({_score_str(avg_risk)}). {low_lbl} vraagt als eerste aandacht."
    else:
        exec_line = "Zie factoranalyse en behoudscontext voor details."

    totaalbeeld = (
        f"{low_lbl} vraagt als eerste aandacht voor behoud. "
        f"{high_lbl} laat zien wat wél werkt. "
        f"De responsbasis bepaalt hoe stevig dit beeld is — zie p.03."
    ) if low_lbl and high_lbl and low_lbl != high_lbl else (
        f"{low_lbl} vraagt als eerste aandacht. De responsbasis bepaalt hoe stevig dit beeld is — zie p.03."
    ) if low_lbl else "Zie factoranalyse voor details — zie p.03 voor de responsbasis."

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
    )

    # ── Responsbasis & reikwijdte (p.03) ──────────────────────────────────────
    s += _responsbasis(
        invited=data["n_invited"],
        completed=data["n_completed"],
        pct=int(data["completion_pct"]),
        period=data["campaign_name"],
        population="Actieve medewerkers",
        segment_available=False,
        segment_reason="te weinig responses per groep voor herleidbaarheid",
    )

    # ── Overzichtsprofiel ─────────────────────────────────────────────────────
    profile_factors = [(_fl(fk, ST), fa.get(fk))
                       for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    s += _overzichtsprofiel(profile_factors)

    # ── Behoudscontext (retention-exclusive) ──────────────────────────────────
    # Toon de directe groepsscores (1-10): blijfintentie (avg_si) en
    # vertrekintentie (avg_to) i.p.v. uit band-counts afgeleide percentages.
    s += _behoudscontext(
        retention_score=avg_risk,
        stay_intent=avg_si,
        turnover=avg_to,
        engagement=avg_eng,
        primary_factor=low_lbl or primary_label or "—",
    )

    # ── Factor detail (itemniveau prioritaire factoren) ──────────────────────
    # Priority = (10-score) — no exit-reason counts exist for retention, pass {}
    priority_fkeys = _select_priority_factors(fa, {}, max_n=3)

    def _ret_factor_detail(fk: str) -> str:
        lbl    = _fl(fk, ST)
        fsc    = fa.get(fk)
        col    = _factor_color(fsc)
        fl_    = _factor_label(fsc)
        items  = fim.get(fk, [])
        i_sc   = [(ik, q, oim.get(ik)) for ik, q in items if oim.get(ik) is not None]
        low_i  = min(i_sc, key=lambda x: x[2]) if i_sc else None
        high_i = max(i_sc, key=lambda x: x[2]) if i_sc else None
        mq_    = _mgmt_q(fk, ST)
        rows = "".join(
            f'<tr><td class="iq">{_h(q)}</td>'
            f'<td class="is" style="color:{_factor_color(isc)};">{isc:.1f}</td></tr>'
            for _, q, isc in i_sc
        ) or '<tr><td colspan="2" style="color:#94A3B8;font-style:italic;">Itemscores niet beschikbaar in deze wave.</td></tr>'
        fk_keywords = THEME_KEYWORDS.get(FACTOR_LABELS_NL.get(fk, ""), [])
        quote_txt: str | None = None
        for t in data["open_texts"]:
            if any(kw in t.lower() for kw in fk_keywords):
                quote_txt = t
                break
        low_card  = (f'<div class="card"><span class="eyebrow">Laagste item</span>'
                     f'<p>{_h(low_i[1])}</p>'
                     f'<strong style="color:{_factor_color(low_i[2])};">{low_i[2]:.1f}/10</strong></div>'
                     if low_i else "")
        high_card = (f'<div class="card"><span class="eyebrow">Hoogste item binnen deze factor</span>'
                     f'<p>{_h(high_i[1])}</p>'
                     f'<strong style="color:{_factor_color(high_i[2])};">{high_i[2]:.1f}/10</strong></div>'
                     if high_i else "")
        quote_block = (f'<div class="quote-txt">{_h(quote_txt)}'
                       f'<div class="quote-anon">Geanonimiseerd &mdash; namen en contactgegevens verwijderd</div>'
                       f'</div>' if quote_txt else "")
        mgmt_block  = (f'<div class="card accent"><span class="eyebrow">Eerste managementvraag</span>'
                       f'<p>{_h(mq_)}</p></div>' if mq_ else "")
        return f"""<div class="pb sec">
  <span class="slabel">Verdieping &mdash; {_h(lbl)}</span>
  <h2>{_h(lbl)} <span style="color:{col};">{_score_str(fsc)}</span> <span style="font-size:13px;color:{col};">&mdash; {_h(fl_)}</span></h2>
  {low_card}
  {high_card}
  <h3>Alle items in deze factor</h3>
  <table class="item-tbl">{rows}</table>
  {quote_block}
  {mgmt_block}
</div>"""

    if priority_fkeys:
        for _pfk in priority_fkeys:
            s += _ret_factor_detail(_pfk)
    else:
        s += '<div class="pb sec"><span class="slabel">Verdieping &mdash; prioritaire factoren</span><div class="card">Factor detail beschikbaar na voldoende patroonduiding.</div></div>'

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
  <span class="slabel">Werkbeleving — autonomie, competentie &amp; verbondenheid</span>
  <p>Drie basisbehoeften die de onderliggende werkbeleving meten, onafhankelijk van de organisatiefactoren.</p>
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
    <span style="font-size:10px;color:{col};margin-left:6px;">— {_h(fl_)}</span>
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
  <span class="slabel">Werkgeversaanbeveling</span>
  <table class="sg"><tr>
    <td><div class="sc-l">Aanbevelingsscore</div><div class="sc-v" style="color:{ecol};">{es:+d}</div><div class="sc-b">eNPS (&minus;100 tot +100)</div></td>
  </tr></table>
  <div class="card"><p style="margin-bottom:0;">Aanvullende context naast het overzichtsprofiel. Een positieve score betekent meer promotors dan criticasters.</p></div>
</div>"""
    else:
        s += """<div class="pb sec">
  <span class="slabel">Werkgeversaanbeveling</span>
  <div class="card"><p style="margin-bottom:0;color:#64748B;">Niet gemeten in deze wave.</p></div>
</div>"""

    # ── Segmentstatus ─────────────────────────────────────────────────────────
    s += _segment_status_block(n, has_segment_data=False, reason="n-grens")

    # ── Open toelichtingen ────────────────────────────────────────────────────
    texts = data["open_texts"]
    if _should_show_quotes(texts):
        s += f"""<div class="pb sec">
  <span class="slabel">Open toelichtingen &mdash; {len(texts)} medewerkersstemmen</span>
  {_themed_quotes(texts, ST, top_fkeys, n)}
</div>"""

    # ── Eerste managementspoor ────────────────────────────────────────────────
    s += _eerste_managementspoor(
        primary_theme=nsp.get("first_decision") or (low_lbl if low_lbl else "het leidende behoudsthema"),
        second_point=_fl(sorted_f[1][0], ST) if len(sorted_f) > 1 else "",
        mgmt_q=_mgmt_q(priority_fkeys[0], ST) if priority_fkeys else (nsp.get("first_decision") or ""),
        owner=nsp.get("first_owner") or "HR + verantwoordelijk management",
        review_when=nsp.get("review_moment") or "bij de volgende meting",
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
                             f'{"&nbsp;&mdash;&nbsp;" + _score_str(fsc_a) if fsc_a else ""}</div>'
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
  <span class="slabel">Appendix — volledige vraagresultaten</span>
  <p style="font-size:9.5px;color:#64748B;margin-bottom:14px;">
    Technische onderbouwing. Scores zijn groepsgemiddelden (n={n}), geschaald 1&ndash;10.
    &#x21a9;&nbsp;= omgekeerd gecodeerd item.
  </p>
  {app_sections}
  <div class="no-break" style="margin-bottom:14px;">
    <div style="font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;">Werkbeleving (SDT) — B1 t/m B12</div>
    <table class="app-tbl"><tr><th class="aq">Vraag</th><th class="as">Gem.</th><th class="ab">Beeld</th></tr>{sdt_rows}</table>
  </div>
  <div class="empty-state" style="margin-top:8px;">
    Werkgeversaanbeveling (eNPS): {"beschikbaar, zie hoofdrapport" if data["enps_available"] else "niet gemeten in deze wave"}
  </div>
</div>"""

    # ── Methodiek (LAST) ──────────────────────────────────────────────────────
    s += _trust_page(ST)
    return _doc(f"RetentieScan — {data['campaign_name']}", s, scan_type="retention")


# ─── Onboarding-exclusive helpers ────────────────────────────────────────────

def _checkpointoverzicht(checkpoints: list[tuple[str, float | None]]) -> str:
    """Checkpoint-fasevergelijking (30/60/90 dagen) of eerlijke single-measurement degraded view.

    checkpoints — lijst van (fase-label, score | None).
    Als < 2 fasen: render de enkele meting met een .trustline die fasevergelijking benoemt.
    """
    if len(checkpoints) >= 2:
        cells = "".join(
            f'<td><div class="sc-l">{_h(label)}</div>'
            f'<div class="sc-v" style="color:{_rag_color(score)};">{_score_str(score)}</div>'
            f'<div class="sc-b">{_h("Aandachtspunt" if score is not None and score < 5.0 else "Gemengd" if score is not None and score < 6.5 else "Stabiel")}</div></td>'
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
            f'<p class="trustline">Eén meetmoment — fasevergelijking opent bij herhaalde meting.</p>'
        )

    return f"""<div class="pb sec">
  <span class="slabel">Checkpointoverzicht</span>
  <h2 style="margin-bottom:14px;">Onboardingfases</h2>
  {body}
</div>"""


def _landingskwaliteit(domains: list[tuple[str, float | None]]) -> str:
    """Landingskwaliteit per domein — factor bar rows in een card, analoog aan _overzichtsprofiel."""
    rows = "".join(
        _factor_bar_row(label, score)
        for label, score in domains
        if score is not None
    )
    if not rows:
        rows = '<div class="empty-state">Domeinscores beschikbaar bij voldoende patroonduiding.</div>'
    legend = (f'<p style="font-size:9px;color:#64748B;margin-top:12px;">'
              f'<span style="color:{RAG_HIGH};">&#9632;</span> aandachtspunt &nbsp; '
              f'<span style="color:{RAG_MID};">&#9632;</span> gemengd &nbsp; '
              f'<span style="color:{RAG_LOW};">&#9632;</span> goed geland</p>')
    return f"""<div class="pb sec">
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
        period=data["campaign_name"], opening_question="Hoe landen uw nieuwe medewerkers?",
        stats=[
            ("Respondenten", str(n)),
            ("Respons", f"{data['completion_pct']}%"),
            ("Primair signaal", _ob_primary),
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
            why_cells += f'<td class="why-cell"><div class="why-l">Factorscore</div><div class="why-v" style="color:{tf_col};">{tf_sc:.1f}/10</div><div class="why-b">{_h(_factor_label(tf_sc))}</div></td>'
        if low_item:
            why_cells += (f'<td class="why-cell"><div class="why-l">Laagste item</div>'
                          f'<div class="why-v" style="color:{_factor_color(low_item[2])};">{low_item[2]:.1f}/10</div>'
                          f'<div class="why-b">{_h(low_item[1])}</div></td>')
        if avg_si is not None:
            si_col = _factor_color(avg_si)
            why_cells += f'<td class="why-cell"><div class="why-l">Stay-intent</div><div class="why-v" style="color:{si_col};">{avg_si:.1f}/10</div><div class="why-b">verblijfsintentie vroege fase</div></td>'

        primary_label = tf_lbl_
        primary_sc    = tf_sc
        primary_col   = tf_col
        br_mgmt_q     = _mgmt_q(tf, ST)
    else:
        why_cells     = ""
        primary_label = low_lbl
        primary_sc    = low_sc
        primary_col   = _factor_color(low_sc)
        br_mgmt_q     = _mgmt_q(low_f[0], ST) if low_f else ""

    if avg_risk and band_lbl and low_lbl and high_lbl and low_lbl != high_lbl:
        exec_line = (f"{band_lbl} ({_score_str(avg_risk)}). "
                     f"{low_lbl} vraagt als eerste aandacht; {high_lbl} staat relatief sterk.")
    elif avg_risk and band_lbl and low_lbl:
        exec_line = f"{band_lbl} ({_score_str(avg_risk)}). {low_lbl} vraagt als eerste aandacht."
    else:
        exec_line = "Zie factordiepte en checkpointoverzicht voor details."

    totaalbeeld = (
        f"{low_lbl} vraagt als eerste aandacht in de onboardingfase. "
        f"{high_lbl} laat zien wat wél goed landt. "
        f"De responsbasis bepaalt hoe stevig dit beeld is — zie p.03."
    ) if low_lbl and high_lbl and low_lbl != high_lbl else (
        f"{low_lbl} vraagt als eerste aandacht. De responsbasis bepaalt hoe stevig dit beeld is — zie p.03."
    ) if low_lbl else "Zie factordiepte voor details — zie p.03 voor de responsbasis."

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
    )

    # ── Responsbasis & reikwijdte (p.03) ──────────────────────────────────────
    s += _responsbasis(
        invited=data["n_invited"],
        completed=data["n_completed"],
        pct=int(data["completion_pct"]),
        period=data["campaign_name"],
        population="Nieuwe medewerkers — eerste werkperiode",
        segment_available=False,
        segment_reason="te weinig responses per groep voor herleidbaarheid",
    )

    # ── Overzichtsprofiel ─────────────────────────────────────────────────────
    profile_factors = [(_fl(fk, ST), fa.get(fk))
                       for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    s += _overzichtsprofiel(profile_factors)

    # ── Checkpointoverzicht (onboarding-exclusive) ────────────────────────────
    # Product is single_checkpoint per campaign — no real 30/60/90 phase scores.
    # Render honest single-measurement degraded view.
    s += _checkpointoverzicht(checkpoints=[("Huidig checkpoint", avg_risk)])

    # ── Landingskwaliteit per domein (onboarding-exclusive) ───────────────────
    # Domain scores = factor_avgs with onboarding-specific labels.
    domain_scores = [(_fl(fk, ST), fa.get(fk))
                     for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None]
    s += _landingskwaliteit(domain_scores)

    # ── Factordiepte ×≤3 (prioriteit = laagste score, geen vertrekredenen) ────
    priority_fkeys = _select_priority_factors(fa, {}, max_n=3)

    def _ob_factor_detail(fk: str) -> str:
        lbl    = _fl(fk, ST)
        fsc    = fa.get(fk)
        col    = _factor_color(fsc)
        fl_    = _factor_label(fsc)
        items  = fim.get(fk, [])
        i_sc   = [(ik, q, oim.get(ik)) for ik, q in items if oim.get(ik) is not None]
        low_i  = min(i_sc, key=lambda x: x[2]) if i_sc else None
        high_i = max(i_sc, key=lambda x: x[2]) if i_sc else None
        mq     = _mgmt_q(fk, ST)
        rows = "".join(
            f'<tr><td class="iq">{_h(q)}</td>'
            f'<td class="is" style="color:{_factor_color(isc)};">{isc:.1f}</td></tr>'
            for _, q, isc in i_sc
        ) or '<tr><td colspan="2" style="color:#94A3B8;font-style:italic;">Itemscores niet beschikbaar in deze wave.</td></tr>'
        fk_keywords = _ONBOARDING_THEME_KEYWORDS.get(lbl, [])
        quote_txt: str | None = None
        for t in data["open_texts"]:
            if any(kw in t.lower() for kw in fk_keywords):
                quote_txt = t
                break
        low_card  = (f'<div class="card"><span class="eyebrow">Kwetsbaarste item</span>'
                     f'<p>{_h(low_i[1])}</p>'
                     f'<strong style="color:{_factor_color(low_i[2])};">{low_i[2]:.1f}/10</strong></div>'
                     if low_i else "")
        high_card = (f'<div class="card"><span class="eyebrow">Relatief sterkste item</span>'
                     f'<p>{_h(high_i[1])}</p>'
                     f'<strong style="color:{_factor_color(high_i[2])};">{high_i[2]:.1f}/10</strong></div>'
                     if high_i else "")
        quote_block = (f'<div class="quote-txt">{_h(quote_txt)}'
                       f'<div class="quote-anon">Geanonimiseerd &mdash; namen en contactgegevens verwijderd</div>'
                       f'</div>' if quote_txt else "")
        mgmt_block = (f'<div class="card accent"><span class="eyebrow">Eerste onboardingvraag</span>'
                      f'<p>{_h(mq)}</p></div>' if mq else "")
        return f"""<div class="pb sec">
  <span class="slabel">Verdieping &mdash; {_h(lbl)}</span>
  <h2>{_h(lbl)} <span style="color:{col};">{_score_str(fsc)}</span> <span style="font-size:13px;color:{col};">&mdash; {_h(fl_)}</span></h2>
  <p style="font-size:10px;color:#64748B;margin-bottom:12px;">Lager op deze factor = meer frictie in de onboardingfase.</p>
  {low_card}
  {high_card}
  <h3>Alle items in deze factor</h3>
  <table class="item-tbl">{rows}</table>
  {quote_block}
  {mgmt_block}
</div>"""

    if priority_fkeys:
        for _pfk in priority_fkeys:
            s += _ob_factor_detail(_pfk)
    else:
        s += '<div class="pb sec"><span class="slabel">Verdieping &mdash; prioritaire factoren</span><div class="card">Factor detail beschikbaar na voldoende patroonduiding.</div></div>'

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
  <span class="slabel">Werkbeleving — autonomie, competentie &amp; verbondenheid</span>
  <p>Drie basisbehoeften die de onderliggende werkbeleving meten, onafhankelijk van de organisatiefactoren.</p>
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
    <span style="font-size:10px;color:{col};margin-left:6px;">— {_h(fl_)}</span>
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
  <span class="slabel">Werkgeversaanbeveling</span>
  <table class="sg"><tr>
    <td><div class="sc-l">Aanbevelingsscore</div><div class="sc-v" style="color:{ecol};">{es:+d}</div><div class="sc-b">eNPS (&minus;100 tot +100)</div></td>
  </tr></table>
  <div class="card"><p style="margin-bottom:0;">Aanvullende context naast het overzichtsprofiel. Een positieve score betekent meer promotors dan criticasters.</p></div>
</div>"""

    # ── Segmentstatus ─────────────────────────────────────────────────────────
    s += _segment_status_block(n, has_segment_data=False, reason="n-grens")

    # ── Open toelichtingen ────────────────────────────────────────────────────
    texts = data["open_texts"]
    if _should_show_quotes(texts):
        s += f"""<div class="pb sec">
  <span class="slabel">Open toelichtingen &mdash; {len(texts)} medewerkersstemmen</span>
  {_themed_quotes(texts, ST, top_fkeys, n)}
</div>"""

    # ── Eerste managementspoor ────────────────────────────────────────────────
    s += _eerste_managementspoor(
        primary_theme=nsp.get("first_decision") or (low_lbl if low_lbl else "het leidende onboardingthema"),
        second_point=_fl(sorted_f[1][0], ST) if len(sorted_f) > 1 else "",
        mgmt_q=_mgmt_q(priority_fkeys[0], ST) if priority_fkeys else (nsp.get("first_decision") or ""),
        owner=nsp.get("first_owner") or "HR + verantwoordelijk leidinggevende",
        review_when=nsp.get("review_moment") or "bij het volgende checkpoint",
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
                             f'{"&nbsp;&mdash;&nbsp;" + _score_str(fsc_a) if fsc_a else ""}</div>'
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
  <span class="slabel">Appendix — volledige vraagresultaten</span>
  <p style="font-size:9.5px;color:#64748B;margin-bottom:14px;">
    Technische onderbouwing. Scores zijn groepsgemiddelden (n={n}), geschaald 1&ndash;10.
    &#x21a9;&nbsp;= omgekeerd gecodeerd item.
  </p>
  {app_sections}
  {"<div class='no-break' style='margin-bottom:14px;'><div style='font-size:9.5px;font-weight:700;color:#243247;margin-bottom:5px;'>Werkbeleving (SDT) — checkpoint-items</div><table class='app-tbl'><tr><th class='aq'>Vraag</th><th class='as'>Gem.</th><th class='ab'>Beeld</th></tr>" + sdt_rows + "</table></div>" if sdt_rows else ""}
</div>"""

    # ── Methodiek (LAST) ──────────────────────────────────────────────────────
    s += _trust_page(ST)
    return _doc(f"Onboarding — {data['campaign_name']}", s, scan_type="onboarding")


# ─── Dispatcher + PDF ────────────────────────────────────────────────────────

def render_report_html(data: dict) -> str:
    st = data.get("scan_type", "exit")
    if st == "retention":  return render_retention_report_html(data)
    if st == "onboarding": return render_onboarding_report_html(data)
    return render_exit_report_html(data)


def generate_campaign_report_html(campaign_id: str, db: Session) -> bytes:
    from weasyprint import HTML
    return HTML(string=render_report_html(build_report_data(campaign_id, db))).write_pdf()
