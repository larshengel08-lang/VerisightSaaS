"""
Loep — HTML→PDF rapportgenerator (WeasyPrint) v5
================================================
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

FACTOR_SHORT_DESC: dict[str, str] = {
    "leadership":   "Feedback, ontwikkeling en vertrouwen",
    "culture":      "Veiligheid, openheid en cultuurmatch",
    "growth":       "Leer- en groeimogelijkheden en perspectief",
    "compensation": "Salaris, voorwaarden en ervaren fairness",
    "workload":     "Werkdruk, tempo en herstelruimte",
    "role_clarity": "Taakverdeling, verwachtingen en beslisruimte",
}

FACTOR_MGMT_QUESTION: dict[str, str] = {
    "leadership":   "Gaat het signaal vooral over feedback, ontwikkelgesprekken of vertrouwen?",
    "culture":      "Is dit beeld vooral over psychologische veiligheid, teamdynamiek of cultuurfit?",
    "growth":       "Gaat het signaal over concrete kansen, zichtbaar perspectief of gebrek aan erkenning?",
    "compensation": "Is de kern hier hoogte van salaris, ervaren fairness of uitlegbaarheid van voorwaarden?",
    "workload":     "Speelt de werkdruk in bepaalde teams, functies of als structureel patroon?",
    "role_clarity": "Gaat de onduidelijkheid over prioriteiten, eigenaarschap of beslisruimte?",
}

FACTOR_EXIT_CODE: dict[str, str] = {
    "leadership": "P1", "culture": "P2", "growth": "P3",
    "compensation": "P4", "workload": "P5", "role_clarity": "P6",
}

THEME_KEYWORDS: dict[str, list[str]] = {
    "Leiderschap en feedback":   ["leiding", "manager", "feedback", "coacht", "vertrouw", "leidinggevende"],
    "Groeiperspectief":          ["groei", "ontwikkel", "perspectief", "loopbaan", "doorgroei", "promotie"],
    "Werkdruk en balans":        ["werkdruk", "druk", "stress", "overwerk", "balans", "hersteltijd"],
    "Erkenning en beloning":     ["erkenning", "waardering", "salaris", "beloning", "beloond"],
    "Psychologische veiligheid": ["veilig", "fouten", "vragen", "cultuur", "sfeer"],
    "Rolhelderheid":             ["onduidelijk", "verwachting", "rol", "verantwoordelijkheid", "prioriteit"],
}

SDT_LABELS = {"autonomy": "Autonomie", "competence": "Competentie", "relatedness": "Verbondenheid"}
SDT_HELP   = {
    "autonomy":    "Mate van ervaren regie over de eigen werkwijze",
    "competence":  "Mate van ervaren bekwaamheid en effectiviteit",
    "relatedness": "Mate van verbondenheid met collega's en organisatie",
}


# ─── Label systeem ────────────────────────────────────────────────────────────

def _friction_label(score: float | None) -> str:
    if score is None:  return "Geen data"
    if score >= 7.0:   return "Sterk frictiebeeld"
    if score >= 4.5:   return "Gemengd vertrekbeeld"
    return "Laag frictiebeeld"

def _friction_color(score: float | None) -> str:
    if score is None:  return "#94A3B8"
    if score >= 7.0:   return "#EF4444"
    if score >= 4.5:   return "#F59E0B"
    return "#22C55E"

def _factor_label(score: float | None) -> str:
    if score is None:  return "Geen data"
    if score < 5.0:    return "Kwetsbaar punt"
    if score < 6.5:    return "Gemengd beeld"
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


# ─── CSS ──────────────────────────────────────────────────────────────────────

_CSS = r"""
@page {
  size: A4;
  margin: 18mm 16mm 22mm 16mm;
  @bottom-left {
    content: "Vertrouwelijk - Loep - Groepsoutput";
    font-family: Arial, Helvetica, sans-serif;
    font-size: 7.5px; color: #94A3B8;
  }
  @bottom-right {
    content: counter(page) " / " counter(pages);
    font-family: Arial, Helvetica, sans-serif;
    font-size: 7.5px; color: #94A3B8;
  }
}
@page cover-page { margin: 0; }

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px; line-height: 1.65; color: #374151;
  background: #F5F0E8;
}

.pb       { break-before: page; }
.no-break { break-inside: avoid; }

/* ── Type ── */
.slabel {
  display: block; font-size: 9.5px; font-weight: 700; color: #64748B;
  letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px;
  border-bottom: 1px solid #E8E0D0; padding-bottom: 6px;
}
h3 { font-size: 12px; font-weight: 700; color: #243247; margin-bottom: 5px; }
p  { margin-bottom: 6px; font-size: 11px; }

/* ── Cover ── */
.cover { page: cover-page; background: #1E293B; min-height: 297mm; padding: 52px 48px 40px; }
.cbadge { display: inline-block; background: #D19422; color: #FFF; font-size: 9px;
  font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  padding: 5px 14px; border-radius: 3px; margin-bottom: 30px; }
.corg   { font-size: 13px; color: #64748B; margin-bottom: 10px; }
.ctitle { font-size: 32px; font-weight: 700; color: #FFF; line-height: 1.2; margin-bottom: 10px; }
.csub   { font-size: 11px; color: #94A3B8; }
.cmeta  { margin-top: 60px; display: table; width: 100%;
  border-top: 1px solid #334155; padding-top: 22px; }
.cmc    { display: table-cell; width: 25%; padding-right: 12px; }
.cml    { font-size: 8.5px; font-weight: 700; color: #475569; letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 3px; }
.cmv    { font-size: 14px; font-weight: 700; color: #E2E8F0; }

/* ── Cards ── */
.card  { background: #FFF; border: 1px solid #E8E0D0; border-radius: 8px;
  padding: 18px 20px; margin-bottom: 14px; }
.ca    { border-left: 5px solid #D19422; }
.cr    { border-left: 5px solid #EF4444; }
.cg    { border-left: 5px solid #22C55E; }
.cn    { border-left: 5px solid #1E293B; }
.cbox  { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;
  padding: 14px 16px; margin-bottom: 12px; }

/* ── Score hero ── */
.score-hero { font-size: 44px; font-weight: 700; line-height: 1; }
.rbadge { display: inline-block; font-size: 11px; font-weight: 700;
  padding: 4px 12px; border-radius: 4px; color: #FFF;
  margin-left: 10px; vertical-align: middle; }

/* ── Stat grid ── */
.sg { display: table; width: 100%; border-collapse: separate;
  border-spacing: 9px 0; margin-bottom: 14px; }
.sg tr { display: table-row; }
.sg td { display: table-cell; background: #FFF; border: 1px solid #E8E0D0;
  border-radius: 7px; padding: 12px 14px; vertical-align: top; }
.sc-l { font-size: 8.5px; font-weight: 700; color: #64748B; letter-spacing: 0.07em;
  text-transform: uppercase; margin-bottom: 3px; }
.sc-v { font-size: 20px; font-weight: 700; color: #243247; line-height: 1.15; margin-bottom: 2px; }
.sc-b { font-size: 9px; color: #6B7280; line-height: 1.45; }

/* ── Insight grid ── */
.ig    { display: table; width: 100%; border-collapse: separate;
  border-spacing: 9px 0; margin-bottom: 9px; }
.ig tr { display: table-row; }
.ig td { display: table-cell; background: #FFF; border: 1px solid #E8E0D0;
  border-radius: 7px; padding: 12px 14px; vertical-align: top; }
.ig-k  { font-size: 8px; font-weight: 700; color: #94A3B8; letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 4px; }
.ig-v  { font-size: 12px; font-weight: 700; color: #243247; margin-bottom: 3px; line-height: 1.3; }
.ig-n  { font-size: 9px; color: #64748B; line-height: 1.45; }

/* ── Why-block ── */
.why { background: #FFF; border: 1px solid #E8E0D0; border-left: 5px solid #1E293B;
  border-radius: 8px; padding: 18px 20px; margin-bottom: 14px; }
.why-title { font-size: 13px; font-weight: 700; color: #243247; margin-bottom: 14px; }
.why-grid  { display: table; width: 100%; border-collapse: separate; border-spacing: 9px 0; margin-bottom: 12px; }
.why-cell  { display: table-cell; vertical-align: top; background: #F8FAFC;
  border: 1px solid #E2E8F0; border-radius: 6px; padding: 11px 13px; width: 25%; }
.why-l     { font-size: 8px; font-weight: 700; color: #94A3B8; letter-spacing: 0.08em;
  text-transform: uppercase; margin-bottom: 3px; }
.why-v     { font-size: 18px; font-weight: 700; line-height: 1.1; margin-bottom: 1px; }
.why-b     { font-size: 9px; color: #6B7280; line-height: 1.4; }
.why-quote { font-size: 10px; color: #475569; font-style: italic; line-height: 1.55;
  border-top: 1px solid #E2E8F0; padding-top: 11px; margin-top: 2px; }

/* ── Factor row ── */
.frow  { margin-bottom: 14px; }
.fname { font-size: 11px; font-weight: 700; color: #243247; }
.fdesc { font-size: 9px; color: #9CA3AF; margin-bottom: 4px; }
.flabel-row { display: table; width: 100%; margin-top: 4px; }
.flabel-score { display: table-cell; vertical-align: middle; font-size: 13px;
  font-weight: 700; color: #243247; width: 50px; }
.flabel-txt   { display: table-cell; vertical-align: middle; font-size: 10px; font-weight: 700; }
.fhi-bot { background: #FEF2F2; border: 1px solid #FECACA;
  border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; }
.fhi-top { background: #F0FDF4; border: 1px solid #A7F3D0;
  border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; }

/* ── Item table ── */
.item-tbl { width: 100%; border-collapse: collapse; }
.item-tbl td { padding: 6px 8px; vertical-align: middle; font-size: 10px;
  color: #374151; border-bottom: 1px solid #F1F5F9; }
.item-tbl .iq { width: 55%; }
.item-tbl .is { width: 10%; font-weight: 700; text-align: right; padding-right: 10px; }
.item-tbl .ib { width: 35%; }

/* ── Theme / Quote ── */
.theme-card { background: #FFF; border: 1px solid #E8E0D0;
  border-radius: 7px; padding: 14px 16px; margin-bottom: 10px; }
.theme-badge { display: inline-block; font-size: 8.5px; font-weight: 700;
  background: #F1F5F9; color: #475569; padding: 2px 8px; border-radius: 3px;
  letter-spacing: 0.05em; }
.ev-badge { display: inline-block; font-size: 8.5px; font-weight: 700;
  padding: 2px 8px; border-radius: 3px; margin-left: 6px; }
.quote-txt { font-size: 11px; color: #374151; font-style: italic; line-height: 1.65;
  margin-top: 8px; padding-left: 10px; border-left: 3px solid #D19422; }
.quote-anon { font-size: 8.5px; color: #94A3B8; font-style: normal; margin-top: 4px; }

/* ── Playbook ── */
.play { background: #FFF; border: 1px solid #E8E0D0; border-left: 5px solid #D19422;
  border-radius: 8px; padding: 16px 18px; margin-bottom: 16px; }
.play-hdr { display: table; width: 100%; margin-bottom: 10px; }
.play-bdg { display: table-cell; vertical-align: middle; padding-right: 10px;
  width: 1%; white-space: nowrap; }
.play-bdg span { display: inline-block; font-size: 9px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 9px;
  border-radius: 3px; color: #FFF; }
.play-ttl { display: table-cell; vertical-align: middle; font-size: 12px;
  font-weight: 700; color: #243247; }
.sub-l    { font-size: 8.5px; font-weight: 700; color: #64748B; letter-spacing: 0.06em;
  text-transform: uppercase; margin-top: 9px; margin-bottom: 2px; }
.act-lst  { margin-left: 16px; margin-bottom: 4px; }
.act-lst li { margin-bottom: 3px; font-size: 10.5px; }

/* ── Steps ── */
.steps { display: table; width: 100%; border-collapse: separate; border-spacing: 9px 0; }
.step  { display: table-cell; background: #FFF; border: 1px solid #E8E0D0;
  border-radius: 7px; padding: 13px 15px; vertical-align: top; width: 25%; }
.step-no   { font-size: 8.5px; font-weight: 700; color: #D19422; letter-spacing: 0.08em;
  text-transform: uppercase; margin-bottom: 3px; }
.step-body { font-size: 10px; color: #374151; line-height: 1.55; }

/* ── Trust ── */
.tg  { display: table; width: 100%; border-collapse: separate; border-spacing: 9px 0; }
.tc  { display: table-cell; background: #FFF; border: 1px solid #E8E0D0;
  border-radius: 6px; padding: 13px 15px; vertical-align: top; width: 33%; }
.tt  { font-size: 10px; font-weight: 700; color: #243247; margin-bottom: 4px; }
.tb  { font-size: 9px; color: #374151; line-height: 1.55; }

/* ── Two-col ── */
.tcol { display: table; width: 100%; border-collapse: separate; border-spacing: 14px 0; }
.tc-l { display: table-cell; vertical-align: top; width: 55%; }
.tc-r { display: table-cell; vertical-align: top; width: 45%; }

/* ── Appendix ── */
.app-tbl { width: 100%; border-collapse: collapse; font-size: 9px; }
.app-tbl th { background: #F1F5F9; color: #475569; font-weight: 700;
  padding: 5px 8px; text-align: left; border-bottom: 1px solid #E2E8F0; }
.app-tbl td { padding: 4px 8px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.app-tbl .aq { width: 58%; color: #374151; }
.app-tbl .as { width: 10%; font-weight: 700; text-align: right; padding-right: 10px; }
.app-tbl .ab { width: 32%; }

/* ── Misc ── */
.sec { margin-bottom: 24px; }
.empty-state { background: #FFF; border: 1px dashed #E8E0D0; border-radius: 6px;
  padding: 18px; text-align: center; color: #94A3B8; font-size: 10px; }
.seg-badge { display: inline-block; font-size: 8.5px; font-weight: 700;
  padding: 2px 8px; border-radius: 3px; margin-right: 5px; }
.legend-dot { display: inline-block; width: 10px; height: 10px;
  border-radius: 2px; margin-right: 5px; vertical-align: middle; }
"""


# ─── Document wrapper ─────────────────────────────────────────────────────────

def _doc(title: str, body: str) -> str:
    return (f'<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8">'
            f'<title>{_h(title)}</title><style>{_CSS}</style></head>'
            f'<body>{body}</body></html>')


# ─── Shared blocks ────────────────────────────────────────────────────────────

def _cover(scan_label: str, org_name: str, campaign_name: str,
           generated_at: str, n: int, mode: str) -> str:
    r_basis = "Stevig" if n >= 20 else "Opbouwend" if n >= 10 else "Indicatief"
    return f"""<div class="cover">
  <div class="cbadge">{_h(scan_label)}</div>
  <div class="corg">{_h(org_name)}</div>
  <div class="ctitle">{_h(campaign_name)}</div>
  <div class="csub">Managementrapport &bull; Groepsoutput &bull; Vertrouwelijk</div>
  <div class="cmeta">
    <div class="cmc"><div class="cml">Respondenten</div><div class="cmv">{n}</div></div>
    <div class="cmc"><div class="cml">Type scan</div><div class="cmv">{_h(mode)}</div></div>
    <div class="cmc"><div class="cml">Datum</div><div class="cmv" style="font-size:11px;">{_h(generated_at)}</div></div>
    <div class="cmc"><div class="cml">Responsbasis</div><div class="cmv" style="font-size:11px;">{r_basis}</div></div>
  </div>
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


def _trust_page() -> str:
    return """<div class="pb">
  <span class="slabel">Hoe dit rapport te lezen</span>
  <div class="card" style="margin-bottom:14px;">
    <p style="font-size:11px;color:#374151;">
      Dit rapport bundelt patronen uit exitsurveys tot een bestuurlijk leesbaar beeld.
      Het is geen diagnose, geen voorspelling en geen individuele beoordeling.
      Gebruik het als startpunt voor gerichte gesprekken en prioritering.
    </p>
  </div>
  <table class="tg"><tr>
    <td class="tc"><div class="tt">Groepsniveau</div>
      <div class="tb">Alle scores zijn groepsgemiddelden. Geen individuele gegevens in dit rapport.</div></td>
    <td class="tc"><div class="tt">Drempelwaarden</div>
      <div class="tb">Hoe stevig is dit beeld: 5+ responses indicatief &bull; 10+ voor patroonduiding &bull; 5+ per groep voor segmenten</div></td>
    <td class="tc"><div class="tt">Geen diagnose</div>
      <div class="tb">Scores zijn methodisch verantwoord maar niet extern gevalideerd als diagnostisch instrument. Altijd combineren met managementgesprek.</div></td>
  </tr></table>
  <table class="tg" style="margin-top:10px;"><tr>
    <td class="tc"><div class="tt">Open toelichtingen</div>
      <div class="tb">Geanonimiseerd. Namen, contactgegevens en locaties zijn verwijderd. Alleen bij voldoende n getoond.</div></td>
    <td class="tc"><div class="tt">Claimgrenzen</div>
      <div class="tb">ExitScan is terugkijkende vertrekduiding. Geen causale claims, geen preventability-oordeel, geen verlooppredicties.</div></td>
    <td class="tc"><div class="tt">Privacywaarborg</div>
      <div class="tb">Verwerking conform AVG. Uitsluitend bestemd voor geautoriseerde gebruikers binnen de betreffende organisatie.</div></td>
  </tr></table>
</div>"""


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

    # ── Cover ─────────────────────────────────────────────────────────────────
    s = _cover(data["scan_lbl"], data["org_name"], data["campaign_name"],
               data["generated_at"], n, data["delivery_mode"])

    # ── Executive summary ─────────────────────────────────────────────────────
    low_lbl  = FACTOR_LABELS_NL.get(low_f[0], "")  if low_f  else ""
    low_sc   = low_f[1]                             if low_f  else None
    high_lbl = FACTOR_LABELS_NL.get(high_f[0], "") if high_f else ""
    high_sc  = high_f[1]                            if high_f else None
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

    gauge_html = _gauge_svg(avg_risk, fl, fcol, width=200)
    bc = data["band_counts"]
    # Respondentverdeling: gebruik frictielabels, niet factorlabels
    stacked = _stacked_bar_svg([
        ("Sterk frictiebeeld",   bc.get("HOOG",0),   "#EF4444"),
        ("Gemengd vertrekbeeld", bc.get("MIDDEN",0), "#F59E0B"),
        ("Laag frictiebeeld",    bc.get("LAAG",0),   "#22C55E"),
    ], total=n, width=320, height=22)

    stat_cards = [
        {"title": "Laagste factor",   "value": low_lbl or "&#x2014;",  "body": _score_str(low_sc) + " — " + _factor_label(low_sc)},
        {"title": "Relatief sterk",   "value": high_lbl or "&#x2014;", "body": _score_str(high_sc) + " — " + _factor_label(high_sc)},
        {"title": "Meest genoemde reden", "value": er_top or "&#x2014;",
         "body": f"{data['exit_r_dist'][0]['count']}x genoemd" if data["exit_r_dist"] else ""},
        {"title": "Respons",          "value": f"{n}/{data['n_invited']}", "body": f"{data['completion_pct']}%"},
    ]

    s += f"""<div class="pb sec">
  <span class="slabel">Samenvatting</span>
  <div class="card ca" style="margin-bottom:14px;">
    <div class="tcol">
      <div class="tc-l" style="padding-right:10px;">
        <p style="font-size:12px;font-weight:700;color:#243247;line-height:1.5;margin-bottom:10px;">{_h(exec_line)}</p>
        <div style="margin-bottom:10px;">{stacked}</div>
        <div style="font-size:9px;color:#64748B;margin-top:5px;">
          <span class="legend-dot" style="background:#EF4444;"></span>Sterk frictiebeeld: {bc.get("HOOG",0)}&times;&nbsp;&nbsp;
          <span class="legend-dot" style="background:#F59E0B;"></span>Gemengd vertrekbeeld: {bc.get("MIDDEN",0)}&times;&nbsp;&nbsp;
          <span class="legend-dot" style="background:#22C55E;"></span>Laag frictiebeeld: {bc.get("LAAG",0)}&times;
        </div>
      </div>
      <div class="tc-r" style="text-align:center;">{gauge_html}</div>
    </div>
  </div>
  {_stat4(stat_cards)}
</div>"""

    # ── Waarom topfactor bovenaan staat ───────────────────────────────────────
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
        mgmt_q     = FACTOR_MGMT_QUESTION.get(tf, "")

        open_match = next((t for t in data["open_texts"]
                           if any(kw in t.lower() for kw in
                                  THEME_KEYWORDS.get(next((k for k in THEME_KEYWORDS
                                                           if tf in k.lower()), ""), []))), None)

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

        s += f"""<div class="sec">
  <span class="slabel">Waarom {_h(tf_lbl)} bovenaan staat</span>
  <div class="why">
    <div class="why-title">{_h(tf_lbl)} komt in meerdere lagen terug: als vertrekreden, als factorscore, op itemniveau en in open toelichtingen.</div>
    <table class="why-grid"><tr>{why_cells}</tr></table>
    {"<div class='why-quote'>\"" + _h(open_match) + "\"<div class='quote-anon'>Geanonimiseerde toelichting</div></div>" if open_match else ""}
    {"<div style='font-size:10px;color:#475569;border-top:1px solid #E2E8F0;padding-top:10px;margin-top:4px;'><strong>Eerste managementvraag:</strong> " + _h(mgmt_q) + "</div>" if mgmt_q else ""}
  </div>
</div>"""

    # ── Wat valt op? ──────────────────────────────────────────────────────────
    low_sdt_key = min(sdt_a, key=sdt_a.get) if sdt_a else None
    er0         = data["exit_r_dist"][0] if data["exit_r_dist"] else None
    ct0         = data["cont_dist"][0]   if data["cont_dist"]   else None

    def _ig(kicker: str, value: str, note: str) -> str:
        return (f'<td><div class="ig-k">{_h(kicker)}</div>'
                f'<div class="ig-v">{_h(value)}</div>'
                f'<div class="ig-n">{_h(note)}</div></td>')

    row1 = "".join([
        _ig("Laagste factor", f"{low_lbl}" if low_lbl else "&#x2014;",
            f"{_score_str(low_sc)} — {_factor_label(low_sc)}"),
        _ig("Relatief sterk",  f"{high_lbl}" if high_lbl else "&#x2014;",
            f"{_score_str(high_sc)} — minder leidend in dit beeld"),
        _ig("Meest genoemde vertrekreden",
            f"{er0['label']}" if er0 else "&#x2014;",
            f"{er0['count']}x in deze batch" if er0 else ""),
        _ig("Wat speelde daarnaast mee",
            f"{ct0['label']}" if ct0 else "&#x2014;",
            f"{ct0['count']}x als meespelende context" if ct0 else ""),
    ])
    row2 = "".join([
        _ig("Laagste basisbehoefte",
            SDT_LABELS.get(low_sdt_key, "&#x2014;") if low_sdt_key else "&#x2014;",
            f"{_score_str(sdt_a.get(low_sdt_key))} — {SDT_HELP.get(low_sdt_key,'')}" if low_sdt_key else ""),
        _ig("Open toelichting",
            f'"{data["open_texts"][0][:60]}"' if data["open_texts"] else "Geen open antwoorden",
            "Zie open toelichtingen verderop"),
        _ig("Eerste managementvraag",
            FACTOR_MGMT_QUESTION.get(top_fkeys[0], "Zie managementduiding") if top_fkeys else "Zie managementduiding",
            "Startpunt voor het managementgesprek"),
        _ig("Hoe stevig is dit beeld?",
            "Stevig" if n >= 20 else "Opbouwend" if n >= 10 else "Indicatief",
            f"{n} responses — {'voldoende voor patroonduiding' if n >= 10 else 'patroonduiding beperkt'}"),
    ])
    s += f"""<div class="sec">
  <span class="slabel">Wat valt op?</span>
  <table class="ig" style="margin-bottom:9px;"><tr>{row1}</tr></table>
  <table class="ig"><tr>{row2}</tr></table>
</div>"""

    # ── Vertrekcontext ────────────────────────────────────────────────────────
    exit_chart = _reason_chart_svg([(r["label"], r["count"]) for r in data["exit_r_dist"]], n, width=340) \
        if data["exit_r_dist"] else '<div class="empty-state">Geen vertrekredenen geregistreerd</div>'
    cont_chart = _reason_chart_svg([(r["label"], r["count"]) for r in data["cont_dist"]], n, width=300) \
        if data["cont_dist"] else '<div class="empty-state">Geen meespelende redenen</div>'

    sv = data["sig_vis"]
    if sv is not None:
        sv_lbl = "Signalen waren grotendeels zichtbaar" if sv >= 4 else "Signalen waren deels zichtbaar" if sv >= 3 else "Signalen bleven grotendeels onder de radar"
        sv_col = "#22C55E" if sv >= 4 else "#F59E0B" if sv >= 3 else "#EF4444"
        sv_block = (f'<div class="card" style="margin-top:12px;border-left:4px solid {sv_col};">'
                    f'<div style="font-size:12px;font-weight:700;color:{sv_col};margin-bottom:4px;">{_h(sv_lbl)}</div>'
                    f'<div style="font-size:10px;color:#374151;">Eerdere signalering: {sv:.1f}/5. '
                    f'In hoeverre was twijfel of vertrek vooraf zichtbaar of bespreekbaar geweest.'
                    f'</div></div>')
    else:
        sv_block = ('<div class="cbox" style="margin-top:12px;">'
                    '<div style="font-size:10px;color:#94A3B8;">Eerdere signalering: niet beschikbaar in deze wave.</div></div>')

    # Signaalopbouw visual
    total_prev = sum(data["prev_dist"].values()) or 1
    sterk   = data["prev_dist"].get("STERK_WERKSIGNAAL", 0)
    gemeng  = data["prev_dist"].get("GEMENGD_WERKSIGNAAL", 0)
    beperkt = data["prev_dist"].get("BEPERKT_WERKSIGNAAL", 0)
    comp_svg = _stacked_bar_svg([
        ("Werkfactoren duidelijk", sterk,   "#1E293B"),
        ("Gemengd beeld",          gemeng,  "#64748B"),
        ("Beperkt werkfactor",     beperkt, "#94A3B8"),
    ], total=total_prev, width=420, height=24)

    s += f"""<div class="pb sec">
  <span class="slabel">Vertrekcontext</span>
  <div class="tcol">
    <div class="tc-l">
      <div class="card">
        <h3 style="margin-bottom:10px;">Hoofdredenen van vertrek</h3>
        {exit_chart}
      </div>
    </div>
    <div class="tc-r">
      <div class="card">
        <h3 style="margin-bottom:10px;">Wat speelde daarnaast mee</h3>
        {cont_chart}
      </div>
      {sv_block}
    </div>
  </div>
  <div class="card" style="margin-top:0;">
    <h3 style="margin-bottom:10px;">Waaruit bestaat het vertrekbeeld?</h3>
    <div style="margin-bottom:10px;">{comp_svg}</div>
    <div style="font-size:9.5px;color:#374151;">
      <span class="legend-dot" style="background:#1E293B;"></span>Werkfactoren spelen een duidelijke rol: {sterk}&times; ({round(sterk/total_prev*100) if total_prev else 0}%)&nbsp;&nbsp;&nbsp;
      <span class="legend-dot" style="background:#64748B;"></span>Gemengd beeld: {gemeng}&times; ({round(gemeng/total_prev*100) if total_prev else 0}%)&nbsp;&nbsp;&nbsp;
      <span class="legend-dot" style="background:#94A3B8;"></span>Werkfactoren beperkt zichtbaar: {beperkt}&times; ({round(beperkt/total_prev*100) if total_prev else 0}%)
    </div>
  </div>
</div>"""

    # ── Factoranalyse ─────────────────────────────────────────────────────────
    sorted_desc = list(reversed(sorted_f))
    factor_chart_items = [
        (FACTOR_LABELS_NL.get(fk, fk), sc, _factor_color(sc))
        for fk, sc in sorted_desc
    ]
    factor_chart = _bar_chart_svg(factor_chart_items, max_val=10.0, width=420, bar_h=26, gap=10)

    # Splits factoren op werkelijk label — niet als groep behandelen
    kwetsbaar_f = [FACTOR_LABELS_NL.get(fk, fk) for fk, sc in sorted_f if sc is not None and sc < 5.0]
    aandacht_f  = [FACTOR_LABELS_NL.get(fk, fk) for fk, sc in sorted_f if sc is not None and 5.0 <= sc < 6.5]
    sterk_f     = [FACTOR_LABELS_NL.get(fk, fk) for fk, sc in sorted_f if sc is not None and sc >= 6.5]

    def _factor_summary_card(title: str, color: str, css_cls: str, labels: list[str]) -> str:
        if not labels:
            return ""
        return (f'<div class="card {css_cls}" style="margin-bottom:9px;">'
                f'<div style="font-size:8.5px;font-weight:700;color:{color};letter-spacing:0.07em;text-transform:uppercase;margin-bottom:3px;">{_h(title)}</div>'
                f'<div style="font-size:11px;font-weight:700;color:#243247;">{" &middot; ".join(_h(l) for l in labels)}</div>'
                f'</div>')

    factor_summary_html = (
        _factor_summary_card("Kwetsbaar punt",  "#EF4444", "cr", kwetsbaar_f) +
        _factor_summary_card("Aandachtspunt",   "#F59E0B", "",   aandacht_f) +
        _factor_summary_card("Relatief sterk",  "#22C55E", "cg", sterk_f)
    )

    s += f"""<div class="pb sec">
  <span class="slabel">Factoranalyse</span>
  <div style="margin-bottom:12px;">{factor_summary_html}</div>
  <div class="card">
    <p style="font-size:9.5px;color:#64748B;margin-bottom:14px;">Score 1&ndash;10 — hoger is beter. Kleur geeft het beeld per factor: rood = kwetsbaar punt, geel = gemengd beeld, groen = relatief sterk.</p>
    {factor_chart}
  </div>
</div>"""

    # ── Factor detail (itemniveau topfactoren) ────────────────────────────────
    def _factor_detail(fk: str) -> str:
        lbl     = FACTOR_LABELS_NL.get(fk, fk)
        fsc     = fa.get(fk)
        col     = _factor_color(fsc)
        fl_     = _factor_label(fsc)
        items   = fim.get(fk, [])
        i_sc    = [(ik, q, oim.get(ik)) for ik, q in items if oim.get(ik) is not None]
        low_i   = min(i_sc, key=lambda x: x[2]) if i_sc else None
        high_i  = max(i_sc, key=lambda x: x[2]) if i_sc else None
        mgmt_q  = FACTOR_MGMT_QUESTION.get(fk, "")
        def _item_bar(isc: float, col: str) -> str:
            w = max(2, round(isc / 10.0 * 90))
            return (f'<div style="display:inline-block;width:90px;height:7px;'
                    f'background:#E8E0D0;border-radius:3px;vertical-align:middle;">'
                    f'<div style="width:{w}px;height:7px;background:{col};border-radius:3px;"></div>'
                    f'</div>')
        rows = "".join(
            f'<tr><td class="iq">{_h(q)}</td>'
            f'<td class="is" style="color:{_factor_color(isc)};">{isc:.1f}</td>'
            f'<td class="ib">{_item_bar(isc, _factor_color(isc))}</td></tr>'
            for _, q, isc in i_sc
        ) or '<tr><td colspan="3" style="color:#94A3B8;font-style:italic;">Itemscores niet beschikbaar in deze wave.</td></tr>'
        return f"""<div class="card no-break" style="margin-bottom:14px;">
  <div style="margin-bottom:10px;">
    <span style="font-size:13px;font-weight:700;color:#243247;">{_h(lbl)}</span>
    <span style="font-size:12px;font-weight:700;color:{col};margin-left:10px;">{_score_str(fsc)}</span>
    <span style="font-size:10px;color:{col};margin-left:6px;">— {_h(fl_)}</span>
  </div>
  {f'<div style="background:#FEF2F2;border-radius:4px;padding:8px 12px;margin-bottom:10px;font-size:10px;"><strong>Laagste item:</strong> {_h(low_i[1])} — <strong style="color:#EF4444;">{low_i[2]:.1f}/10</strong></div>' if low_i else ""}
  {f'<div style="background:#F0FDF4;border-radius:4px;padding:8px 12px;margin-bottom:10px;font-size:10px;"><strong>Sterkste item:</strong> {_h(high_i[1])} — <strong style="color:#22C55E;">{high_i[2]:.1f}/10</strong></div>' if high_i else ""}
  <table class="item-tbl" style="margin-bottom:10px;">{rows}</table>
  {f'<div class="cbox"><strong style="font-size:10px;">Eerste managementvraag:</strong> <span style="font-size:10px;">{_h(mgmt_q)}</span></div>' if mgmt_q else ""}
</div>"""

    detail_html = "".join(_factor_detail(fk) for fk in top_fkeys[:2]) if top_fkeys else \
        '<div class="empty-state">Factor detail beschikbaar na voldoende patroonduiding.</div>'
    s += f"""<div class="pb sec">
  <span class="slabel">Factor detail — itemniveau</span>
  {detail_html}
</div>"""

    # ── SDT basisbehoeften ────────────────────────────────────────────────────
    sdt_chart = _bar_chart_svg([
        (SDT_LABELS.get(dim,""), sdt_a.get(dim,0), _factor_color(sdt_a.get(dim)))
        for dim in ("autonomy","competence","relatedness") if dim in sdt_a
    ], max_val=10.0, width=380, bar_h=24, gap=12)

    def _sdt_item_tbl(dim: str) -> str:
        keys = SDT_DIMENSION_ITEMS.get(dim, [])
        REV_LABEL = '<span style="font-size:8px;color:#94A3B8;">&nbsp;(omgekeerd)</span>'
        rows = "".join(
            f'<tr><td class="iq">{_h(q)}'
            f'{REV_LABEL if ik in SDT_REVERSE_ITEMS else ""}'
            f'</td><td class="is" style="color:{_factor_color(sim.get(ik))};">{sim[ik]:.1f}</td>'
            f'<td class="ib">{_mini_bar_svg(sim.get(ik), _factor_color(sim.get(ik)), width=80, height=6)}</td></tr>'
            for ik in keys
            for q in [next((t for k, t in data["sdt_items"] if k == ik), ik)]
            if ik in sim
        )
        return f'<table class="item-tbl">{rows}</table>' if rows else ""

    s += f"""<div class="pb sec">
  <span class="slabel">Werkbeleving — autonomie, competentie en verbondenheid</span>
  <div class="card" style="margin-bottom:14px;">
    <p style="font-size:11px;color:#374151;margin-bottom:14px;">Drie basisbehoeften die de onderliggende werkbeleving meten, onafhankelijk van de organisatiefactoren.</p>
    {sdt_chart}
  </div>"""

    for dim in ("autonomy", "competence", "relatedness"):
        sc    = sdt_a.get(dim)
        col   = _factor_color(sc)
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
        ecol = "#22C55E" if es >= 20 else "#F59E0B" if es >= 0 else "#EF4444"
        s += f"""<div class="sec">
  <span class="slabel">Werkgeversaanbeveling</span>
  <div class="card">
    <span style="font-size:40px;font-weight:700;color:{ecol};">{es:+d}</span>
    <span style="font-size:10px;color:#64748B;margin-left:10px;">eNPS-score (&minus;100 tot +100)</span>
    <p style="font-size:10px;color:#64748B;margin-top:8px;">Aanvullende context naast de factoranalyse.</p>
  </div>
</div>"""
    else:
        s += """<div class="sec">
  <span class="slabel">Werkgeversaanbeveling</span>
  <div class="empty-state">Niet gemeten in deze wave.</div>
</div>"""

    # ── Open toelichtingen ────────────────────────────────────────────────────
    texts = data["open_texts"]
    if len(texts) >= MIN_QUOTES_N:
        # Tel n per thema over alle teksten
        theme_counts: dict[str, int] = {}
        for t in texts:
            tl = t.lower()
            matched = next((k for k, kws in THEME_KEYWORDS.items()
                            if any(kw in tl for kw in kws)), None)
            if matched is None:
                if any(kw in tl for kw in ["persoonlijk","omstandigh","verhuis","studie","gezin"]):
                    matched = "Persoonlijke omstandigheid"
                elif any(kw in tl for kw in ["aanbod","andere baan","concurrent","extern"]):
                    matched = "Beter aanbod elders"
                else:
                    matched = "Overige toelichting"
            theme_counts[matched] = theme_counts.get(matched, 0) + 1

        # Themaverdeling bovenaan
        tc_sorted = sorted(theme_counts.items(), key=lambda x: -x[1])
        theme_summary = (
            '<div style="font-size:10px;color:#374151;margin-bottom:12px;">'
            '<strong>Thema\'s in open toelichtingen:</strong>&nbsp;&nbsp;' +
            " &middot; ".join(f"<strong>{_h(k)}</strong> ({v}&times;)" for k, v in tc_sorted) +
            '</div>'
        )

        used: set[str] = set()
        theme_html = ""
        for t in texts[:MAX_QUOTES]:
            if t in used: continue
            used.add(t)
            tl = t.lower()
            theme_name = next((k for k, kws in THEME_KEYWORDS.items()
                               if any(kw in tl for kw in kws)), None)
            if theme_name is None:
                if any(kw in tl for kw in ["persoonlijk","omstandigh","verhuis","studie","gezin"]):
                    theme_name = "Persoonlijke omstandigheid"
                elif any(kw in tl for kw in ["aanbod","andere baan","concurrent","extern"]):
                    theme_name = "Beter aanbod elders"
                else:
                    theme_name = "Overige toelichting"
            theme_n = theme_counts.get(theme_name, 1)

            # Evidence label
            tf_kws = THEME_KEYWORDS.get(
                next((k for k in THEME_KEYWORDS
                      if top_fkeys and top_fkeys[0] in k.lower()), ""), [])
            if tf_kws and any(kw in tl for kw in tf_kws):
                ev = "bevestigt topfactor"; ev_bg = "#FEF2F2"; ev_tc = "#DC2626"
            elif any(kw in tl for kw in ["niet","maar","hoewel","toch","echter"]):
                ev = "nuanceert beeld"; ev_bg = "#EFF6FF"; ev_tc = "#1D4ED8"
            else:
                ev = "verdiept signaal"; ev_bg = "#F0FDF4"; ev_tc = "#15803D"

            theme_html += (
                f'<div class="theme-card">'
                f'<span class="theme-badge">{_h(theme_name)}</span>'
                f'<span style="font-size:8px;color:#94A3B8;margin-left:5px;">{theme_n}&times;</span>'
                f'<span class="ev-badge" style="background:{ev_bg};color:{ev_tc};">{_h(ev)}</span>'
                f'<div class="quote-txt">{_h(t)}'
                f'<div class="quote-anon">Geanonimiseerd &mdash; namen en contactgegevens verwijderd</div></div>'
                f'</div>'
            )

        s += f"""<div class="pb sec">
  <span class="slabel">Open toelichtingen &mdash; {len(texts)} respondentstemmen</span>
  {theme_summary}
  <div class="cbox" style="margin-bottom:12px;font-size:10px;color:#374151;">
    Getoond: {min(len(texts),MAX_QUOTES)} van {len(texts)} toelichtingen.
    Thema-indeling op basis van trefwoorden &mdash; indicatief. Aanvulling op de factoranalyse.
  </div>
  {theme_html}
</div>"""
    else:
        s += f"""<div class="pb sec">
  <span class="slabel">Open toelichtingen</span>
  <div class="empty-state">Open toelichtingen worden getoond bij minimaal {MIN_QUOTES_N} antwoorden. Huidig: {len(texts)}.</div>
</div>"""

    # ── Wat betekent dit voor management? ─────────────────────────────────────
    pbs_html = ("".join(_playbook_card(r) for r in data["exit_pbs"])
                if data["exit_pbs"]
                else '<div class="empty-state">Managementduiding beschikbaar bij voldoende responses met patroon.</div>')
    s += f"""<div class="pb sec">
  <span class="slabel">Wat betekent dit voor management?</span>
  {pbs_html}
</div>"""

    # ── Eerste managementspoor ────────────────────────────────────────────────
    tf_lbl = top_flabels[0] if top_flabels else "het leidende thema"
    s += f"""<div class="pb sec">
  <span class="slabel">Eerste managementspoor</span>
  {_step_cards(nsp)}
  <div class="cbox" style="margin-top:14px;">
    <p style="font-size:10.5px;color:#243247;font-weight:700;margin-bottom:4px;">Eerste stap</p>
    <p style="font-size:10px;color:#374151;">
      Kies binnen 30 dagen &eacute;&eacute;n managementgesprek of data-check
      om het beeld rond {_h(tf_lbl)} te verduidelijken.
      Bepaal daarna pas of een gerichte verbetering nodig is.
      Beleg eigenaar en reviewmoment voordat bredere stappen worden gezet.
    </p>
  </div>
</div>"""

    # ── Segmentstatus ─────────────────────────────────────────────────────────
    s += """<div class="sec">
  <span class="slabel">Segmentanalyse</span>
  <div class="empty-state">
    Segmentverschillen zijn niet getoond om herleidbaarheid te voorkomen.<br>
    Analyse verschijnt automatisch zodra voldoende responses per groep beschikbaar zijn.
  </div>
</div>"""

    # ── Appendix ─────────────────────────────────────────────────────────────
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

    # ── Methodiek ─────────────────────────────────────────────────────────────
    s += _trust_page()
    return _doc(f"ExitScan — {data['campaign_name']}", s)


# ─── RetentionScan renderer ───────────────────────────────────────────────────

def render_retention_report_html(data: dict) -> str:
    n           = data["n_completed"]
    avg_risk    = data["avg_risk"]
    rp          = data["retention_profile"] or "&#x2014;"
    rp_col      = _factor_color({"HOOG": 2.0, "MIDDEN": 5.5, "LAAG": 8.0}.get(rp, 5.5))
    rp_lbl      = {"HOOG": "Kwetsbaar retentiebeeld", "MIDDEN": "Gemengd retentiebeeld",
                   "LAAG": "Stabiel retentiebeeld"}.get(rp, rp)
    rdsp        = _score_str(avg_risk)
    top_flabels = data["top_flabels"]
    fa          = data["factor_avgs"]
    sdt_a       = data["sdt_avgs"]
    nsp         = data["nsp"]
    msp         = data["msp"] or {}

    sorted_f    = sorted([(fk, fa.get(fk)) for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None], key=lambda x: x[1])
    bottom_2    = [fk for fk, _ in sorted_f[:2]]
    top_2       = [fk for fk, _ in sorted_f[-2:]]
    sorted_desc = list(reversed(sorted_f))
    gauge       = _gauge_svg(avg_risk, rp_lbl, rp_col, width=200)

    exec_copy = msp.get("executive_intro") or f"Retentiesignaal: {rp_lbl}. Scherpste factoren: {', '.join(top_flabels)}."
    stat_cards = [
        {"title": "Retentiesignaal", "value": rp_lbl,   "body": "Indicatief beeld op groepsniveau"},
        {"title": "Gem. score",      "value": rdsp,      "body": "1-10, hoger = meer frictie"},
        {"title": "Bevlogenheid",    "value": _score_str(data["avg_eng"]), "body": "UWES-score"},
        {"title": "Vertrekintentie", "value": _score_str(data["avg_to"]),  "body": "Gem. vertrekintentie"},
    ]
    factor_chart = _bar_chart_svg(
        [(FACTOR_LABELS_NL.get(fk, fk), sc, _factor_color(sc)) for fk, sc in sorted_desc],
        max_val=10.0, width=420, bar_h=26, gap=10)
    sdt_chart = _bar_chart_svg(
        [(SDT_LABELS.get(d,""), sdt_a.get(d,0), _factor_color(sdt_a.get(d)))
         for d in ("autonomy","competence","relatedness") if d in sdt_a],
        max_val=10.0, width=380, bar_h=24, gap=12)

    texts   = data["open_texts"]
    open_h  = ("".join(f'<div class="theme-card"><div class="quote-txt">{_h(t)}'
                       f'<div class="quote-anon">Geanonimiseerd</div></div></div>'
                       for t in texts[:MAX_QUOTES])
               if len(texts) >= MIN_QUOTES_N
               else f'<div class="empty-state">Min. {MIN_QUOTES_N} antwoorden vereist. Huidig: {len(texts)}.</div>')
    pbs_html = ("".join(_playbook_card(r) for r in data["ret_pbs"])
                if data["ret_pbs"] else '<div class="empty-state">Duiding beschikbaar bij voldoende patroon.</div>')
    tf_lbl  = top_flabels[0] if top_flabels else "het leidende thema"

    body = f"""
{_cover(data["scan_lbl"], data["org_name"], data["campaign_name"], data["generated_at"], n, data["delivery_mode"])}
<div class="pb sec">
  <span class="slabel">Samenvatting</span>
  <div class="card ca" style="margin-bottom:14px;">
    <div class="tcol">
      <div class="tc-l"><p style="font-size:12px;font-weight:700;color:#243247;line-height:1.5;">{_h(exec_copy)}</p></div>
      <div class="tc-r" style="text-align:center;">{gauge}</div>
    </div>
  </div>
  {_stat4(stat_cards)}
</div>
<div class="pb sec">
  <span class="slabel">Factoranalyse</span>
  <div class="card">{factor_chart}</div>
</div>
<div class="pb sec">
  <span class="slabel">Werkbeleving — autonomie, competentie en verbondenheid</span>
  <div class="card">{sdt_chart}</div>
</div>
<div class="pb sec">
  <span class="slabel">Open toelichtingen</span>
  {open_h}
</div>
<div class="pb sec">
  <span class="slabel">Wat betekent dit voor management?</span>
  {pbs_html}
</div>
<div class="pb sec">
  <span class="slabel">Eerste managementspoor</span>
  <div class="card" style="margin-bottom:14px;"><p style="font-size:11px;">Gebruik dit rapport om het vertrekbeeld gericht te bespreken: wat valt op, waar zit de eerste managementvraag en welke vervolgstap past daarbij?</p></div>
  {_step_cards(nsp)}
  <div class="cbox" style="margin-top:14px;font-size:10px;color:#374151;">
    Kies binnen 30 dagen &eacute;&eacute;n managementgesprek om het beeld rond {_h(tf_lbl)} te verduidelijken.
  </div>
</div>
{_trust_page()}"""
    return _doc(f"RetentionScan — {data['campaign_name']}", body)


# ─── OnboardingScan renderer ──────────────────────────────────────────────────

def render_onboarding_report_html(data: dict) -> str:
    n           = data["n_completed"]
    avg_risk    = data["avg_risk"]
    fl          = _friction_label(avg_risk)
    fcol        = _friction_color(avg_risk)
    rdsp        = _score_str(avg_risk)
    top_flabels = data["top_flabels"]
    fa          = data["factor_avgs"]
    nsp         = data["nsp"]

    sorted_f    = sorted([(fk, fa.get(fk)) for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None], key=lambda x: x[1])
    bottom_2    = [fk for fk, _ in sorted_f[:2]]
    top_2       = [fk for fk, _ in sorted_f[-2:]]
    gauge       = _gauge_svg(avg_risk, fl, fcol, width=200)
    factor_chart = _bar_chart_svg(
        [(FACTOR_LABELS_NL.get(fk, fk), sc, _factor_color(sc)) for fk, sc in reversed(sorted_f)],
        max_val=10.0, width=420, bar_h=26, gap=10)
    texts  = data["open_texts"]
    open_h = ("".join(f'<div class="theme-card"><div class="quote-txt">{_h(t)}'
                      f'<div class="quote-anon">Geanonimiseerd</div></div></div>' for t in texts[:MAX_QUOTES])
              if len(texts) >= MIN_QUOTES_N
              else f'<div class="empty-state">Min. {MIN_QUOTES_N} antwoorden. Huidig: {len(texts)}.</div>')
    stat_cards = [
        {"title": "Uitgenodigd",       "value": str(data["n_invited"]),          "body": "Medewerkers voor dit checkpoint"},
        {"title": "Ingevuld",          "value": str(n),                          "body": "Responses in dit beeld"},
        {"title": "Respons",           "value": f"{data['completion_pct']}%",    "body": "Voltooide responses"},
        {"title": "Onboardingsignaal", "value": rdsp,                            "body": fl},
    ]
    tf_lbl = top_flabels[0] if top_flabels else "het eerste aandachtspunt"
    body = f"""
{_cover(data["scan_lbl"], data["org_name"], data["campaign_name"], data["generated_at"], n, data["delivery_mode"])}
<div class="pb sec">
  <span class="slabel">Samenvatting</span>
  <div class="card ca" style="margin-bottom:14px;">
    <div class="tcol">
      <div class="tc-l">
        <p style="font-size:12px;font-weight:700;color:#243247;">Onboardingsignaal voor {_h(data["campaign_name"])}: <span style="color:{fcol};">{fl}</span></p>
        <p style="font-size:10.5px;color:#374151;margin-top:6px;">Eerste aandachtspunten: <strong>{" &middot; ".join(_h(l) for l in top_flabels) or "&#x2014;"}</strong></p>
      </div>
      <div class="tc-r" style="text-align:center;">{gauge}</div>
    </div>
  </div>
  {_stat4(stat_cards)}
</div>
<div class="pb sec">
  <span class="slabel">Factoranalyse — onboardingmodules</span>
  <div class="card">{factor_chart}</div>
</div>
<div class="pb sec">
  <span class="slabel">Open toelichtingen</span>
  {open_h}
</div>
<div class="pb sec">
  <span class="slabel">Eerste managementspoor</span>
  <div class="card" style="margin-bottom:14px;"><p style="font-size:11px;">Gebruik dit rapport om het vertrekbeeld gericht te bespreken: wat valt op, waar zit de eerste managementvraag en welke vervolgstap past daarbij?</p></div>
  {_step_cards(nsp)}
  <div class="cbox" style="margin-top:14px;font-size:10px;">
    Kies binnen 30 dagen &eacute;&eacute;n managementgesprek om het beeld rond {_h(tf_lbl)} te verduidelijken.
  </div>
</div>
{_trust_page()}"""
    return _doc(f"Onboarding — {data['campaign_name']}", body)


# ─── Dispatcher + PDF ────────────────────────────────────────────────────────

def render_report_html(data: dict) -> str:
    st = data.get("scan_type", "exit")
    if st == "retention":  return render_retention_report_html(data)
    if st == "onboarding": return render_onboarding_report_html(data)
    return render_exit_report_html(data)


def generate_campaign_report_html(campaign_id: str, db: Session) -> bytes:
    from weasyprint import HTML
    return HTML(string=render_report_html(build_report_data(campaign_id, db))).write_pdf()
