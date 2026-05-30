"""
Loep — HTML→PDF rapportgenerator (WeasyPrint) v4
================================================
Parallel pad naast report.py. report.py blijft onaangeroerd.
"""

from __future__ import annotations

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
MAX_QUOTES   = 4

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
    "culture":      "Is dit beeld vooral over veiligheid, teamdynamiek of cultuurfit?",
    "growth":       "Gaat het groeisignaal over concrete kansen, perspectief of gebrek aan erkenning?",
    "compensation": "Is de kern hier hoogte van salaris, ervaren fairness of uitlegbaarheid?",
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
    "autonomy":    "Mate van ervaren regie over de eigen werkwijze.",
    "competence":  "Mate van ervaren bekwaamheid en effectiviteit.",
    "relatedness": "Mate van verbondenheid met collega's en organisatie.",
}


# ─── Label systeem ────────────────────────────────────────────────────────────

def _friction_label(score: float | None) -> str:
    """Resultaatlabel voor gemiddelde frictiescore (hoog = meer frictie)."""
    if score is None:  return "Geen data"
    if score >= 7.0:   return "Sterk frictiebeeld"
    if score >= 4.5:   return "Gemengd frictiebeeld"
    return "Laag frictiebeeld"


def _friction_color(score: float | None) -> str:
    if score is None:  return "#94A3B8"
    if score >= 7.0:   return "#EF4444"
    if score >= 4.5:   return "#F59E0B"
    return "#22C55E"


def _factor_label(score: float | None) -> str:
    """Resultaatlabel voor factorscore (hoog = minder frictie / beter)."""
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
    """HTML-escape. Gebruik uitsluitend voor user/data-strings, nooit voor HTML-entities."""
    return "" if s is None else _esc(str(s))


def _score_str(v: float | None, decimals: int = 1) -> str:
    return f"{v:.{decimals}f}/10" if v is not None else "—"


def _pct_str(v: float | None) -> str:
    return f"{v:.0f}%" if v is not None else "—"


def _scale_to_10(raw: float, reverse: bool = False) -> float:
    r = (1 + 5) - raw if reverse else raw
    return round((r - 1) / 4 * 9 + 1, 2)


# ─── CSS ──────────────────────────────────────────────────────────────────────

_CSS = r"""
@page {
  size: A4;
  margin: 17mm 15mm 22mm 15mm;
  @bottom-left {
    content: "Vertrouwelijk - Loep - Groepsoutput";
    font-family: Arial, Helvetica, sans-serif;
    font-size: 7px; color: #94A3B8;
  }
  @bottom-right {
    content: counter(page) " / " counter(pages);
    font-family: Arial, Helvetica, sans-serif;
    font-size: 7px; color: #94A3B8;
  }
}
@page cover-page { margin: 0; }

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px; line-height: 1.6; color: #374151;
  background: #F5F0E8;
}

.pb       { break-before: page; }
.no-break { break-inside: avoid; }

/* ── Type ── */
.slabel { display: block; font-size: 8.5px; font-weight: 700; color: #64748B;
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 9px; }
h3 { font-size: 11px; font-weight: 700; color: #243247; margin-bottom: 4px; }
p  { margin-bottom: 5px; }

/* ── Cover ── */
.cover { page: cover-page; background: #1E293B; min-height: 297mm; padding: 48px 44px 36px; }
.cbadge { display: inline-block; background: #D19422; color: #FFF;
  font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  padding: 4px 12px; border-radius: 3px; margin-bottom: 28px; }
.corg   { font-size: 12px; color: #64748B; margin-bottom: 8px; }
.ctitle { font-size: 28px; font-weight: 700; color: #FFF; line-height: 1.2; margin-bottom: 8px; }
.csub   { font-size: 10px; color: #94A3B8; }
.cmeta  { margin-top: 56px; display: table; width: 100%;
  border-top: 1px solid #334155; padding-top: 18px; }
.cmc    { display: table-cell; width: 25%; padding-right: 10px; }
.cml    { font-size: 8px; font-weight: 700; color: #475569; letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 2px; }
.cmv    { font-size: 13px; font-weight: 700; color: #E2E8F0; }

/* ── Cards ── */
.card  { background: #FFF; border: 1px solid #E8E0D0; border-radius: 6px;
  padding: 13px 15px; margin-bottom: 11px; }
.ca   { border-left: 4px solid #D19422; }  /* amber accent */
.cr   { border-left: 4px solid #EF4444; }  /* red accent */
.cg   { border-left: 4px solid #22C55E; }  /* green accent */
.cwarn { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 5px;
  padding: 8px 12px; margin-bottom: 10px; font-size: 8.5px; color: #92400E; }
.cinfo { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 5px;
  padding: 8px 12px; margin-bottom: 10px; font-size: 8.5px; color: #1E40AF; }

/* ── Score hero ── */
.score-h { font-size: 36px; font-weight: 700; line-height: 1; }
.rbadge  { display: inline-block; font-size: 9.5px; font-weight: 700;
  padding: 3px 9px; border-radius: 3px; color: #FFF; margin-left: 8px; vertical-align: middle; }

/* ── Stat grid ── */
.sg { display: table; width: 100%; border-collapse: separate; border-spacing: 7px 0;
  margin-bottom: 12px; }
.sg tr { display: table-row; }
.sg td { display: table-cell; background: #FFF; border: 1px solid #E8E0D0;
  border-radius: 6px; padding: 9px 11px; vertical-align: top; }
.sc-l { font-size: 7.5px; font-weight: 700; color: #64748B; letter-spacing: 0.07em;
  text-transform: uppercase; margin-bottom: 2px; }
.sc-v { font-size: 17px; font-weight: 700; color: #243247; line-height: 1.15; margin-bottom: 1px; }
.sc-b { font-size: 8px; color: #6B7280; line-height: 1.4; }

/* ── Insight grid ── */
.ig { display: table; width: 100%; border-collapse: separate; border-spacing: 7px 0;
  margin-bottom: 7px; }
.ig tr { display: table-row; }
.ig td { display: table-cell; background: #FFF; border: 1px solid #E8E0D0;
  border-radius: 6px; padding: 9px 11px; vertical-align: top; }
.ig-k  { font-size: 7.5px; font-weight: 700; color: #94A3B8; letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 3px; }
.ig-v  { font-size: 11px; font-weight: 700; color: #243247; margin-bottom: 2px; line-height: 1.3; }
.ig-n  { font-size: 8px; color: #64748B; line-height: 1.4; }

/* ── Why-block ── */
.why-block { background: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #243247;
  border-radius: 5px; padding: 13px 15px; margin-bottom: 11px; }
.why-title  { font-size: 11px; font-weight: 700; color: #243247; margin-bottom: 7px; }
.why-signal { display: table; width: 100%; border-collapse: separate; border-spacing: 7px 0; margin-bottom: 8px; }
.why-sc     { display: table-cell; vertical-align: top; width: 25%; background: #FFF;
  border: 1px solid #E8E0D0; border-radius: 5px; padding: 8px 10px; }
.why-sc-l   { font-size: 7.5px; font-weight: 700; color: #64748B; letter-spacing: 0.07em;
  text-transform: uppercase; margin-bottom: 2px; }
.why-sc-v   { font-size: 14px; font-weight: 700; color: #243247; }
.why-sc-b   { font-size: 8px; color: #6B7280; }
.why-copy   { font-size: 9px; color: #475569; font-style: italic; line-height: 1.5;
  border-top: 1px solid #E8E0D0; padding-top: 8px; margin-top: 4px; }

/* ── Factor row ── */
.frow   { margin-bottom: 10px; }
.fname  { font-size: 10px; font-weight: 600; color: #243247; }
.fdesc  { font-size: 8px; color: #9CA3AF; margin-bottom: 3px; }
.brt    { display: table; width: 100%; }
.brt td.trk { display: table-cell; vertical-align: middle; padding-right: 7px; }
.brt td.sco { display: table-cell; vertical-align: middle; white-space: nowrap;
  font-size: 10.5px; font-weight: 700; color: #374151; padding-right: 5px; width: 30px; }
.brt td.bnd { display: table-cell; vertical-align: middle; white-space: nowrap;
  font-size: 9px; font-weight: 700; width: 110px; }
.bar-track  { height: 7px; background: #E8E0D0; border-radius: 3px; overflow: hidden; }
.bar-fill   { height: 7px; border-radius: 3px; }
.fhi-bot { background: #FEF2F2; border: 1px solid #FCA5A5;
  border-radius: 4px; padding: 8px 10px; margin-bottom: 7px; }
.fhi-top { background: #F0FDF4; border: 1px solid #86EFAC;
  border-radius: 4px; padding: 8px 10px; margin-bottom: 7px; }

/* ── Item table ── */
.item-tbl { width: 100%; border-collapse: collapse; }
.item-tbl td { padding: 4px 6px; vertical-align: middle; font-size: 8.5px;
  color: #374151; border-bottom: 1px solid #F1F5F9; }
.item-tbl .iq { width: 58%; }
.item-tbl .is { width: 12%; font-weight: 700; text-align: right; padding-right: 8px; }
.item-tbl .ib { width: 30%; }

/* ── Mini bar ── */
.mb-track { height: 5px; background: #E8E0D0; border-radius: 2px;
  overflow: hidden; display: inline-block; width: 55px; vertical-align: middle; }
.mb-fill  { height: 5px; border-radius: 2px; display: block; }

/* ── Reason bar ── */
.rrow   { margin-bottom: 7px; }
.rlbl   { font-size: 9px; color: #374151; margin-bottom: 2px; }
.rb-t   { display: table; width: 100%; }
.rb-t td.rt { display: table-cell; vertical-align: middle; padding-right: 6px; }
.rb-t td.rc { display: table-cell; vertical-align: middle; white-space: nowrap;
  font-size: 8px; color: #6B7280; width: 60px; }
.r-track { height: 5px; background: #E8E0D0; border-radius: 2px; overflow: hidden; }
.r-fill  { height: 5px; border-radius: 2px; }

/* ── Composition ── */
.comp-track { display: table; width: 100%; border-radius: 4px;
  overflow: hidden; margin-bottom: 8px; height: 18px; }
.comp-seg   { display: table-cell; vertical-align: middle; text-align: center;
  font-size: 7.5px; font-weight: 700; color: #FFF; }

/* ── Quote / Theme ── */
.theme-card  { background: #FFF; border: 1px solid #E8E0D0; border-radius: 5px;
  padding: 9px 12px; margin-bottom: 8px; }
.theme-badge { display: inline-block; font-size: 7.5px; font-weight: 700;
  background: #F1F5F9; color: #475569; padding: 1px 6px; border-radius: 3px;
  letter-spacing: 0.05em; margin-bottom: 4px; }
.ev-badge    { display: inline-block; font-size: 7.5px; font-weight: 700;
  padding: 1px 6px; border-radius: 3px; margin-left: 5px; }
.quote-card  { background: #FAFAF9; border: 1px solid #E8E0D0;
  border-left: 3px solid #D19422; border-radius: 4px;
  padding: 8px 12px; margin-top: 5px;
  font-size: 9.5px; color: #374151; font-style: italic; line-height: 1.6; }
.quote-anon  { font-size: 7.5px; color: #94A3B8; font-style: normal; margin-top: 3px; }

/* ── Playbook ── */
.play { background: #FFF; border: 1px solid #E8E0D0; border-left: 4px solid #D19422;
  border-radius: 6px; padding: 13px 15px; margin-bottom: 13px; }
.play-hdr  { display: table; width: 100%; margin-bottom: 7px; }
.play-bdg  { display: table-cell; vertical-align: middle; padding-right: 7px;
  width: 1%; white-space: nowrap; }
.play-bdg span { display: inline-block; font-size: 8.5px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px;
  border-radius: 3px; color: #FFF; }
.play-ttl  { display: table-cell; vertical-align: middle; font-size: 10.5px;
  font-weight: 700; color: #243247; }
.sub-l   { font-size: 7.5px; font-weight: 700; color: #64748B; letter-spacing: 0.06em;
  text-transform: uppercase; margin-top: 7px; margin-bottom: 1px; }
.act-lst { margin-left: 13px; margin-bottom: 3px; }
.act-lst li { margin-bottom: 2px; font-size: 9.5px; }
.caution { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 3px;
  padding: 5px 9px; font-size: 8.5px; color: #92400E; margin-top: 5px; }

/* ── Step grid ── */
.steps { display: table; width: 100%; border-collapse: separate; border-spacing: 7px 0; }
.step  { display: table-cell; background: #FFF; border: 1px solid #E8E0D0;
  border-radius: 6px; padding: 11px 13px; vertical-align: top; width: 25%; }
.step-no   { font-size: 7.5px; font-weight: 700; color: #D19422; letter-spacing: 0.08em;
  text-transform: uppercase; margin-bottom: 2px; }
.step-body { font-size: 9px; color: #374151; line-height: 1.5; }

/* ── Trust ── */
.tg   { display: table; width: 100%; border-collapse: separate; border-spacing: 7px 0; }
.tc   { display: table-cell; background: #FFF; border: 1px solid #E8E0D0;
  border-radius: 5px; padding: 11px 13px; vertical-align: top; width: 33%; }
.tt   { font-size: 9px; font-weight: 700; color: #243247; margin-bottom: 3px; }
.tb   { font-size: 8.5px; color: #374151; line-height: 1.5; }

/* ── Two-col ── */
.tcol { display: table; width: 100%; border-collapse: separate; border-spacing: 11px 0; }
.tc-l { display: table-cell; vertical-align: top; width: 55%; }
.tc-r { display: table-cell; vertical-align: top; width: 45%; }

/* ── Appendix ── */
.app-tbl { width: 100%; border-collapse: collapse; font-size: 8.5px; }
.app-tbl th { background: #F1F5F9; color: #475569; font-weight: 700;
  padding: 5px 7px; text-align: left; border-bottom: 1px solid #E2E8F0; }
.app-tbl td { padding: 4px 7px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
.app-tbl td.aq { width: 58%; color: #374151; }
.app-tbl td.as { width: 12%; font-weight: 700; text-align: right; padding-right: 8px; }
.app-tbl td.ab { width: 30%; }

/* ── Misc ── */
.sec         { margin-bottom: 20px; }
.empty-state { background: #FFF; border: 1px dashed #E8E0D0; border-radius: 5px;
  padding: 14px; text-align: center; color: #94A3B8; font-size: 9px; }
.seg-badge   { display: inline-block; font-size: 7.5px; font-weight: 700;
  padding: 1px 6px; border-radius: 3px; margin-right: 4px; }
"""

# ─── Document wrapper ─────────────────────────────────────────────────────────

def _doc(title: str, body: str) -> str:
    return (f'<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8">'
            f'<title>{_h(title)}</title><style>{_CSS}</style></head>'
            f'<body>{body}</body></html>')


# ─── Shared blocks ────────────────────────────────────────────────────────────

def _cover(scan_label: str, org_name: str, campaign_name: str,
           generated_at: str, n: int, mode: str) -> str:
    leessterkte = "Indicatief" if n < 10 else "Opbouwend" if n < 20 else "Stevig"
    return f"""<div class="cover">
  <div class="cbadge">{_h(scan_label)}</div>
  <div class="corg">{_h(org_name)}</div>
  <div class="ctitle">{_h(campaign_name)}</div>
  <div class="csub">Managementrapport &bull; Groepsoutput &bull; Vertrouwelijk</div>
  <div class="cmeta">
    <div class="cmc"><div class="cml">Respondenten</div><div class="cmv">{n}</div></div>
    <div class="cmc"><div class="cml">Type</div><div class="cmv">{_h(mode)}</div></div>
    <div class="cmc"><div class="cml">Datum</div><div class="cmv" style="font-size:10px;">{_h(generated_at)}</div></div>
    <div class="cmc"><div class="cml">Leessterkte</div><div class="cmv" style="font-size:10px;">{leessterkte}</div></div>
  </div>
</div>"""


def _stat4(cards: list[dict]) -> str:
    tds = "".join(
        f'<td><div class="sc-l">{_h(c["title"])}</div>'
        f'<div class="sc-v">{_h(c["value"])}</div>'
        f'<div class="sc-b">{_h(c["body"])}</div></td>'
        for c in cards)
    return f'<table class="sg"><tr>{tds}</tr></table>'


def _mini_bar(score: float | None, color: str) -> str:
    if score is None: return ""
    w = min(100.0, score / 10.0 * 100.0)
    return (f'<div class="mb-track">'
            f'<div class="mb-fill" style="width:{w:.0f}%;background:{color};"></div>'
            f'</div>')


def _factor_row(fk: str, score: float | None, highlight: str | None = None) -> str:
    lbl  = FACTOR_LABELS_NL.get(fk, fk)
    desc = FACTOR_SHORT_DESC.get(fk, "")
    if score is None:
        return (f'<div class="frow"><div class="fname">{_h(lbl)}</div>'
                f'<div class="empty-state" style="text-align:left;padding:4px 8px;">'
                f'Onvoldoende data</div></div>')
    col  = _factor_color(score)
    fl   = _factor_label(score)
    w    = min(100.0, score / 10.0 * 100.0)
    wrap = f' class="fhi-{"top" if highlight=="top" else "bot"}"' if highlight else ""
    return f"""<div{wrap}><div class="frow">
  <div class="fname">{_h(lbl)}</div><div class="fdesc">{_h(desc)}</div>
  <table class="brt"><tr>
    <td class="trk"><div class="bar-track"><div class="bar-fill" style="width:{w:.0f}%;background:{col};"></div></div></td>
    <td class="sco">{score:.1f}</td>
    <td class="bnd" style="color:{col};">{_h(fl)}</td>
  </tr></table>
</div></div>"""


def _reason_bar(label: str, count: int, total: int, color: str = "#475569") -> str:
    pct = count / total * 100 if total else 0
    return f"""<div class="rrow">
  <div class="rlbl">{_h(label)}</div>
  <table class="rb-t"><tr>
    <td class="rt"><div class="r-track"><div class="r-fill" style="width:{pct:.0f}%;background:{color};"></div></div></td>
    <td class="rc">{pct:.0f}% ({count}&times;)</td>
  </tr></table>
</div>"""


def _playbook_card(row: dict) -> str:
    rb  = str(row.get("band", "MIDDEN")).upper()
    bk  = rb if rb in ("HOOG","MIDDEN","LAAG") else "MIDDEN"
    col = _factor_color({"HOOG": 2.0, "MIDDEN": 5.5, "LAAG": 8.0}[bk])
    # Map band to result label
    bl  = {"HOOG": "Kwetsbaar punt", "MIDDEN": "Gemengd beeld", "LAAG": "Relatief sterk"}[bk]
    lbl = row.get("label", row.get("factor",""))
    acts = "".join(f"<li>{_h(a)}</li>" for a in row.get("actions",[]))
    return f"""<div class="play" style="border-left-color:{col};">
  <div class="play-hdr">
    <div class="play-bdg"><span style="background:{col};">{_h(bl)}</span></div>
    <div class="play-ttl">{_h(lbl)} &mdash; {_h(row.get("title",""))}</div>
  </div>
  {"<div class='sub-l'>Eerste managementvraag</div><p style='font-size:9.5px;'>" + _h(row.get("decision","")) + "</p>" if row.get("decision") else ""}
  {"<div class='sub-l'>Eerste spoor om te bespreken</div><p style='font-size:9.5px;'>" + _h(row.get("validate","")) + "</p>" if row.get("validate") else ""}
  {"<div class='sub-l'>Mogelijke stappen</div><ul class='act-lst'>" + acts + "</ul>" if acts else ""}
  {"<div class='sub-l'>Eigenaar</div><p style='font-size:9.5px;'>" + _h(row.get("owner") or row.get("owner_basis","")) + "</p>" if row.get("owner") or row.get("owner_basis") else ""}
  {"<div class='sub-l'>Reviewmoment</div><p style='font-size:9.5px;'>" + _h(row.get("review","")) + "</p>" if row.get("review") else ""}
  {"<div class='caution'>Leesgrens: " + _h(row.get("caution","")) + "</div>" if row.get("caution") else ""}
</div>"""


def _step_cards(nsp: dict) -> str:
    cards = nsp.get("session_cards") or [
        {"title": "Eerste managementgesprek", "body": nsp.get("first_decision","")},
        {"title": "Eigenaar",                 "body": nsp.get("first_owner","")},
        {"title": "Eerste stap",              "body": nsp.get("first_action","")},
        {"title": "Reviewmoment",             "body": nsp.get("review_moment","")},
    ]
    tds = "".join(
        f'<td class="step"><div class="step-no">{_h(c.get("title",""))}</div>'
        f'<div class="step-body">{_h(c.get("body",""))}</div></td>'
        for c in cards[:4])
    return f'<table class="steps"><tr>{tds}</tr></table>'


def _trust_page() -> str:
    return """<div class="pb">
  <span class="slabel">Methodiek &amp; interpretatiegrenzen</span>
  <div class="card" style="margin-bottom:11px;">
    <p style="font-size:9.5px;">
      Loep-output is een gegroepeerde managementsamenvatting op groepsniveau.
      Het rapport is bedoeld als startpunt voor gesprek en prioritering &mdash;
      niet als sluitend bewijs van oorzaak, diagnose of individuele beoordeling.
    </p>
  </div>
  <table class="tg"><tr>
    <td class="tc"><div class="tt">Groepsniveau</div>
      <div class="tb">Alle uitkomsten zijn groepsgemiddelden. Geen individuele scores of herleidbare gegevens.</div></td>
    <td class="tc"><div class="tt">n-grenzen</div>
      <div class="tb">Indicatief: 5+<br>Voldoende basis voor patroonduiding: 10+<br>Segmenten: 5+ per groep</div></td>
    <td class="tc"><div class="tt">Geen diagnose</div>
      <div class="tb">Scores zijn indicatief en methodisch verdedigbaar, maar niet extern gevalideerd als diagnostisch instrument.</div></td>
  </tr></table>
  <table class="tg" style="margin-top:7px;"><tr>
    <td class="tc"><div class="tt">Open tekst</div>
      <div class="tb">Geanonimiseerd (namen, contact, locaties verwijderd). Kwalitatieve verificatielaag, geen numerieke metric.</div></td>
    <td class="tc"><div class="tt">Claimgrens</div>
      <div class="tb">Vermeld altijd n en leessterkte bij interne presentatie. Gebruik als eerste managementvraag.</div></td>
    <td class="tc"><div class="tt">Privacywaarborg</div>
      <div class="tb">Verwerking conform AVG. Uitsluitend bestemd voor geautoriseerde gebruikers.</div></td>
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

    risk_sc   = [r.risk_score for r in responses if r.risk_score is not None]
    avg_risk  = round(_mean(risk_sc), 2) if risk_sc else None
    eng_sc    = [r.uwes_score for r in responses if r.uwes_score is not None]
    avg_eng   = round(_mean(eng_sc), 2) if eng_sc else None
    to_sc     = [r.turnover_intention_score for r in responses if r.turnover_intention_score is not None]
    avg_to    = round(_mean(to_sc), 2) if to_sc else None
    si_sc     = [round((float(r.stay_intent_score) - 1) / 4 * 9 + 1, 2)
                 for r in responses if r.stay_intent_score is not None]
    avg_si    = round(_mean(si_sc), 2) if si_sc else None

    band_counts = {"HOOG": 0, "MIDDEN": 0, "LAAG": 0}
    for r in responses:
        if r.risk_band in band_counts:
            band_counts[r.risk_band] += 1

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
        if dim in factor_avgs:
            sdt_avgs[dim] = factor_avgs[dim]
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

    raw_texts   = [r.open_text_raw for r in responses if r.open_text_raw and r.open_text_raw.strip()]
    open_texts  = list(dict.fromkeys(anonymize_text(t) for t in raw_texts))

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
    factor_items_map: dict[str, list[tuple[str, str]]] = {
        sec["key"]: sec["items"] for sec in org_sections if "key" in sec and "items" in sec}
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
    msp         = data["msp"] or {}
    nsp         = data["nsp"]

    sorted_f = sorted([(fk, fa.get(fk)) for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None],
                      key=lambda x: x[1])
    bottom_2 = [fk for fk, _ in sorted_f[:2]]
    top_2    = [fk for fk, _ in sorted_f[-2:]]
    low_f    = sorted_f[0]  if sorted_f else None
    high_f   = sorted_f[-1] if sorted_f else None

    # ── Cover ────────────────────────────────────────────────────────────────
    s = _cover(data["scan_lbl"], data["org_name"], data["campaign_name"],
               data["generated_at"], n, data["delivery_mode"])

    # ── Executive at-a-glance ────────────────────────────────────────────────
    # Dynamic copy: no internal jargon
    low_lbl  = FACTOR_LABELS_NL.get(low_f[0], "")  if low_f  else ""
    low_sc   = low_f[1]                             if low_f  else None
    high_lbl = FACTOR_LABELS_NL.get(high_f[0], "") if high_f else ""
    er_top   = data["exit_r_dist"][0]["label"] if data["exit_r_dist"] else ""

    copy_parts = []
    if avg_risk:
        copy_parts.append(f"De frictiescore van {rdsp} wijst op een {fl.lower()}.")
    if low_lbl and er_top and low_lbl.lower() in er_top.lower():
        copy_parts.append(f"{low_lbl} valt het meest op: het is de laagst scorende factor en de meest genoemde hoofdreden.")
    elif low_lbl:
        copy_parts.append(f"{low_lbl} is de laagst scorende factor in dit beeld ({_score_str(low_sc)}).")
    if er_top and (not low_lbl or low_lbl.lower() not in er_top.lower()):
        copy_parts.append(f"Meest genoemde hoofdreden: {er_top}.")
    if high_lbl and high_lbl != low_lbl:
        high_sc = high_f[1] if high_f else None
        copy_parts.append(f"{high_lbl} scoort relatief sterk ({_score_str(high_sc)}).")
    exec_copy = " ".join(copy_parts) or (msp.get("executive_intro") or "")

    stat_cards = [
        {"title": "Frictiescore",   "value": rdsp,            "body": fl},
        {"title": "Laagste factor", "value": low_lbl or "—",  "body": _score_str(low_sc)},
        {"title": "Respons",        "value": f"{n}/{data['n_invited']}", "body": f"{data['completion_pct']}%"},
        {"title": "Eerste managementvraag",
         "value": FACTOR_MGMT_QUESTION.get(top_fkeys[0], "Zie duiding")[:40] + "..."
                  if top_fkeys else "—",
         "body": "Zie managementduiding"},
    ]

    s += f"""<div class="pb sec">
  <span class="slabel">Executive at-a-glance</span>
  <div class="card ca" style="margin-bottom:11px;">
    <span class="score-h" style="color:{fcol};">{rdsp}</span>
    <span class="rbadge" style="background:{fcol};">{_h(fl)}</span>
    <p style="font-size:9.5px;color:#374151;margin-top:9px;">{_h(exec_copy)}</p>
  </div>
  {_stat4(stat_cards)}
</div>"""

    # ── Wat valt op? ─────────────────────────────────────────────────────────
    low_sdt_key  = min(sdt_a, key=sdt_a.get) if sdt_a else None
    low_sdt_lbl  = SDT_LABELS.get(low_sdt_key, "—") if low_sdt_key else "—"
    low_sdt_sc   = sdt_a.get(low_sdt_key) if low_sdt_key else None

    er0 = data["exit_r_dist"][0] if data["exit_r_dist"] else None
    ct0 = data["cont_dist"][0]   if data["cont_dist"]   else None

    # Detect open theme for top factor
    open_theme = "Niet beschikbaar"
    if data["open_texts"] and top_fkeys:
        kws = THEME_KEYWORDS.get(
            next((k for k, kws in THEME_KEYWORDS.items()
                  if top_fkeys[0] in k.lower() or any(kw in top_fkeys[0] for kw in kws)), ""),
            [])
        for t in data["open_texts"]:
            if any(kw in t.lower() for kw in kws):
                open_theme = t[:55] + ("..." if len(t) > 55 else "")
                break
        if open_theme == "Niet beschikbaar" and data["open_texts"]:
            open_theme = data["open_texts"][0][:55] + ("..." if len(data["open_texts"][0]) > 55 else "")

    def _ig(kicker: str, value: str, note: str) -> str:
        return (f'<td><div class="ig-k">{_h(kicker)}</div>'
                f'<div class="ig-v">{_h(value)}</div>'
                f'<div class="ig-n">{_h(note)}</div></td>')

    row1 = "".join([
        _ig("Laagste factor",
            f"{low_lbl} · {_score_str(low_sc)}" if low_lbl else "—",
            "Meest kwetsbaar in dit vertrekbeeld"),
        _ig("Relatief sterk",
            f"{high_lbl} · {_score_str(high_f[1] if high_f else None)}" if high_lbl else "—",
            "Minder leidend in dit beeld"),
        _ig("Meest genoemde hoofdreden",
            f"{er0['label']} · {er0['count']}×" if er0 else "—",
            "Meest genoemde hoofdreden in deze batch"),
        _ig("Speelt vaak mee",
            f"{ct0['label']} · {ct0['count']}×" if ct0 else "—",
            "Komt vaak als meespelende context terug"),
    ])
    row2 = "".join([
        _ig("Laagste basisbehoefte",
            f"{low_sdt_lbl} · {_score_str(low_sdt_sc)}" if low_sdt_key else "—",
            SDT_HELP.get(low_sdt_key, "") if low_sdt_key else ""),
        _ig("Open thema",
            f"‘{open_theme}’" if open_theme != "Niet beschikbaar" else "Niet beschikbaar",
            "Open toelichting — kwalitatieve aanvulling, geen metric"),
        _ig("Eerste managementvraag",
            FACTOR_MGMT_QUESTION.get(top_fkeys[0], "Zie duiding") if top_fkeys else "Zie duiding",
            "Gebruik als gespreksopener, niet als conclusie"),
        _ig("Leessterkte",
            "Indicatief" if n < 10 else "Opbouwend" if n < 20 else "Stevig",
            f"{n} responses — {'voldoende basis voor patroonduiding' if n >= 10 else 'patroonduiding nog beperkt'}"),
    ])
    s += f"""<div class="sec">
  <span class="slabel">Wat valt op?</span>
  <p style="font-size:8.5px;color:#64748B;margin-bottom:8px;">Indicatief patroonbeeld &mdash; geen causale verdeling. Gebruik als eerste gespreksopener.</p>
  <table class="ig" style="margin-bottom:7px;"><tr>{row1}</tr></table>
  <table class="ig"><tr>{row2}</tr></table>
</div>"""

    # ── Waarom topfactor bovenaan staat ──────────────────────────────────────
    if top_fkeys and low_f:
        tf        = top_fkeys[0]
        tf_lbl    = FACTOR_LABELS_NL.get(tf, tf)
        tf_sc     = fa.get(tf)
        tf_col    = _factor_color(tf_sc)
        tf_fl     = _factor_label(tf_sc)
        tf_code   = FACTOR_EXIT_CODE.get(tf)
        er_n      = exit_r_cnt.get(tf_code, 0) if tf_code and 'exit_r_cnt' in dir() else (
            next((r["count"] for r in data["exit_r_dist"] if r["code"] == tf_code), 0) if tf_code else 0)
        cont_n    = cont_cnt.get(tf_code, 0) if tf_code and 'cont_cnt' in dir() else (
            next((r["count"] for r in data["cont_dist"] if r["code"] == tf_code), 0) if tf_code else 0)
        items_in  = fim.get(tf, [])
        item_scores = [(q, oim.get(ik)) for ik, q in items_in if oim.get(ik) is not None]
        low_item  = min(item_scores, key=lambda x: x[1]) if item_scores else None
        mgmt_q    = FACTOR_MGMT_QUESTION.get(tf, "")

        why_cards = ""
        if er_n:
            why_cards += f'<td class="why-sc"><div class="why-sc-l">Hoofdreden</div><div class="why-sc-v" style="color:{tf_col};">{er_n}&times;</div><div class="why-sc-b">meest genoemde reden</div></td>'
        if tf_sc:
            why_cards += f'<td class="why-sc"><div class="why-sc-l">Factorscore</div><div class="why-sc-v" style="color:{tf_col};">{tf_sc:.1f}/10</div><div class="why-sc-b">{_h(tf_fl)}</div></td>'
        if low_item:
            why_cards += f'<td class="why-sc"><div class="why-sc-l">Laagste item</div><div class="why-sc-v" style="color:{tf_col};">{low_item[1]:.1f}/10</div><div class="why-sc-b">{_h(low_item[0][:40])}...</div></td>'
        if cont_n:
            why_cards += f'<td class="why-sc"><div class="why-sc-l">Speelt ook mee</div><div class="why-sc-v">{cont_n}&times;</div><div class="why-sc-b">als meespelende context</div></td>'

        s += f"""<div class="sec">
  <span class="slabel">Waarom {_h(tf_lbl)} bovenaan staat</span>
  <div class="why-block">
    <div class="why-title">{_h(tf_lbl)} staat niet bovenaan door &eacute;&eacute;n score, maar omdat het in meerdere lagen terugkomt.</div>
    <table class="why-signal"><tr>{why_cards}</tr></table>
    {"<div class='why-copy'>Eerste managementvraag: <em>" + _h(mgmt_q) + "</em></div>" if mgmt_q else ""}
  </div>
</div>"""

    # ── Responsbasis ─────────────────────────────────────────────────────────
    bc = data["band_counts"]
    s += f"""<div class="sec">
  <span class="slabel">Responsbasis &amp; leessterkte</span>
  <div class="tcol">
    <div class="tc-l"><div class="card">
      <div style="margin-bottom:7px;font-size:10px;">
        <strong>Uitgenodigd:</strong> {data['n_invited']}&nbsp;&nbsp;
        <strong>Ingevuld:</strong> {n}&nbsp;&nbsp;
        <strong>Respons:</strong> {data['completion_pct']}%
      </div>
      <div style="font-size:8.5px;color:#6B7280;">
        {"Voldoende basis voor patroonduiding" if n >= 10 else "Indicatief beeld — patroonduiding nog beperkt (min. 10)"} &bull;
        {"Segmenten beschikbaar bij 5+ per groep" if n >= 15 else "Segmentduiding onderdrukt"}
      </div>
      <div style="margin-top:8px;font-size:8.5px;">
        <span class="seg-badge" style="background:#FEF2F2;color:#EF4444;">Kwetsbaar</span>{bc.get("HOOG",0)}&times;&nbsp;&nbsp;
        <span class="seg-badge" style="background:#FFFBEB;color:#D97706;">Gemengd</span>{bc.get("MIDDEN",0)}&times;&nbsp;&nbsp;
        <span class="seg-badge" style="background:#F0FDF4;color:#16A34A;">Relatief sterk</span>{bc.get("LAAG",0)}&times;
      </div>
    </div></div>
    <div class="tc-r"><div class="card">
      <div style="font-size:8.5px;font-weight:700;color:#475569;margin-bottom:5px;letter-spacing:0.07em;text-transform:uppercase;">Segmentstatus</div>
      <div class="empty-state" style="font-size:8px;padding:8px;">
        Segmentduiding onderdrukt &mdash; minimale n (5 per groep) niet bereikt.
      </div>
    </div></div>
  </div>
</div>"""

    # ── Vertrekcontext ────────────────────────────────────────────────────────
    exit_bars = ("".join(_reason_bar(r["label"], r["count"], n, "#1E293B")
                         for r in data["exit_r_dist"])
                 or '<div class="empty-state">Geen vertrekredenen geregistreerd</div>')
    cont_bars = ("".join(_reason_bar(r["label"], r["count"], n, "#475569")
                         for r in data["cont_dist"])
                 or '<div class="empty-state">Geen meespelende redenen geregistreerd</div>')

    sv = data["sig_vis"]
    if sv is not None:
        sv_lbl = "Signalen waren grotendeels zichtbaar" if sv >= 4 else "Signalen waren deels zichtbaar" if sv >= 3 else "Signalen bleven grotendeels onder de radar"
        sv_col = "#22C55E" if sv >= 4 else "#F59E0B" if sv >= 3 else "#EF4444"
        sv_block = (f'<div class="card" style="margin-top:8px;border-left:3px solid {sv_col};">'
                    f'<div style="font-size:9.5px;font-weight:700;color:{sv_col};margin-bottom:3px;">{_h(sv_lbl)}</div>'
                    f'<div style="font-size:8.5px;color:#64748B;">Eerdere signalering: {sv:.1f}/5 &mdash; '
                    f'in hoeverre was twijfel of vertrek vooraf zichtbaar of bespreekbaar.</div>'
                    f'<div style="font-size:8px;color:#94A3B8;margin-top:4px;">Lees als reflectielaag voor HR en leidinggevenden, '
                    f'niet als bewijs dat vertrek voorkomen had kunnen worden.</div>'
                    f'</div>')
    else:
        sv_block = ('<div class="card" style="margin-top:8px;background:#F8FAFC;border-color:#E2E8F0;">'
                    '<div style="font-size:8.5px;color:#94A3B8;">Eerdere signalering/bespreekbaarheid: '
                    'niet beschikbaar in deze wave.</div></div>')

    s += f"""<div class="pb sec">
  <span class="slabel">Vertrekcontext</span>
  <div class="tcol">
    <div class="tc-l"><div class="card">
      <h3 style="margin-bottom:6px;">Hoofdredenen van vertrek</h3>
      <p style="font-size:8px;color:#64748B;margin-bottom:7px;">Lees als vertrekcontext, niet als causale verklaring.</p>
      {exit_bars}
    </div></div>
    <div class="tc-r">
      <div class="card">
        <h3 style="margin-bottom:6px;">Meespelende context</h3>
        <p style="font-size:8px;color:#64748B;margin-bottom:7px;">Factoren die naast de hoofdreden meespeelden.</p>
        {cont_bars}
      </div>
      {sv_block}
    </div>
  </div>
</div>"""

    # ── Signaalopbouw ─────────────────────────────────────────────────────────
    total_prev = sum(data["prev_dist"].values()) or 1
    sterk   = data["prev_dist"].get("STERK_WERKSIGNAAL", 0)
    gemeng  = data["prev_dist"].get("GEMENGD_WERKSIGNAAL", 0)
    beperkt = data["prev_dist"].get("BEPERKT_WERKSIGNAAL", 0)
    ps = round(sterk  / total_prev * 100)
    pg = round(gemeng / total_prev * 100)
    pb = round(beperkt / total_prev * 100)
    comp_segs = (
        (f'<td class="comp-seg" style="background:#1E293B;width:{ps}%;">{ps}%</td>' if ps else "") +
        (f'<td class="comp-seg" style="background:#64748B;width:{pg}%;">{pg}%</td>' if pg else "") +
        (f'<td class="comp-seg" style="background:#94A3B8;width:{pb}%;">{pb}%</td>' if pb else "")
    )
    s += f"""<div class="sec">
  <span class="slabel">Signaalopbouw</span>
  <div class="card">
    <table class="comp-track"><tr>{comp_segs}</tr></table>
    <div style="font-size:8.5px;margin-bottom:5px;">
      <span style="display:inline-block;width:10px;height:10px;background:#1E293B;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>Werkfactoren spelen een duidelijke rol: {sterk}&times; ({ps}%)&nbsp;&nbsp;&nbsp;
      <span style="display:inline-block;width:10px;height:10px;background:#64748B;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>Gemengd beeld: {gemeng}&times; ({pg}%)&nbsp;&nbsp;&nbsp;
      <span style="display:inline-block;width:10px;height:10px;background:#94A3B8;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>Werkfactoren beperkt zichtbaar: {beperkt}&times; ({pb}%)
    </div>
    <p style="font-size:8px;color:#94A3B8;">Indicatief patroonbeeld &mdash; geen causale verdeling. Gebruik als context voor prioritering.</p>
  </div>
</div>"""

    # ── Factoranalyse ─────────────────────────────────────────────────────────
    sorted_desc = list(reversed(sorted_f))
    factor_bars = "".join(_factor_row(fk, sc,
        highlight="bot" if fk in bottom_2 else "top" if fk in top_2 else None)
        for fk, sc in sorted_desc)
    attention = [FACTOR_LABELS_NL.get(fk, fk) for fk in bottom_2]
    strengths = [FACTOR_LABELS_NL.get(fk, fk) for fk in top_2]

    s += f"""<div class="pb sec">
  <span class="slabel">Factoranalyse</span>
  <div class="tcol" style="margin-bottom:9px;">
    <div class="tc-l"><div class="card cr">
      <div style="font-size:7.5px;font-weight:700;color:#EF4444;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:2px;">Kwetsbaar punt</div>
      <div style="font-size:10px;font-weight:600;color:#243247;">{" &middot; ".join(_h(l) for l in attention) or "&#x2014;"}</div>
    </div></div>
    <div class="tc-r"><div class="card cg">
      <div style="font-size:7.5px;font-weight:700;color:#22C55E;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:2px;">Relatief sterk</div>
      <div style="font-size:10px;font-weight:600;color:#243247;">{" &middot; ".join(_h(l) for l in strengths) or "&#x2014;"}</div>
    </div></div>
  </div>
  <div class="card">{factor_bars}</div>
</div>"""

    # ── Factor detail (itemniveau topfactoren) ────────────────────────────────
    def _factor_detail(fk: str) -> str:
        lbl   = FACTOR_LABELS_NL.get(fk, fk)
        fsc   = fa.get(fk)
        col   = _factor_color(fsc)
        fl_   = _factor_label(fsc)
        items = fim.get(fk, [])
        i_scores = [(ik, q, oim.get(ik)) for ik, q in items if oim.get(ik) is not None]
        low_i  = min(i_scores, key=lambda x: x[2]) if i_scores else None
        high_i = max(i_scores, key=lambda x: x[2]) if i_scores else None
        mgmt_q = FACTOR_MGMT_QUESTION.get(fk, "")
        rows = "".join(
            f'<tr><td class="iq">{_h(q[:70] + ("..." if len(q)>70 else ""))}</td>'
            f'<td class="is" style="color:{_factor_color(isc)};">{isc:.1f}</td>'
            f'<td class="ib"><div class="mb-track"><div class="mb-fill" style="width:{min(100.0,isc/10*100):.0f}%;background:{_factor_color(isc)};"></div></div></td></tr>'
            for _, q, isc in i_scores
        ) or f'<tr><td colspan="3" style="color:#94A3B8;font-style:italic;">Itemdata niet beschikbaar in deze wave</td></tr>'

        return f"""<div class="card no-break" style="margin-bottom:11px;">
  <div style="margin-bottom:6px;">
    <span style="font-size:11px;font-weight:700;color:#243247;">{_h(lbl)}</span>
    <span style="font-size:10px;font-weight:700;color:{col};margin-left:8px;">{_score_str(fsc)}</span>
    <span style="font-size:9px;color:{col};margin-left:6px;">&mdash; {_h(fl_)}</span>
  </div>
  {"<div style='font-size:8.5px;background:#FEF2F2;padding:5px 8px;border-radius:3px;margin-bottom:6px;'>" + "<strong>Laagste item:</strong> " + _h(low_i[1][:60]) + "... &mdash; " + f"<strong style='color:#EF4444;'>{low_i[2]:.1f}/10</strong>" + "</div>" if low_i else ""}
  <table class="item-tbl" style="margin-bottom:7px;">{rows}</table>
  {"<div class='cinfo' style='margin-top:5px;'><strong>Eerste managementvraag:</strong> " + _h(mgmt_q) + "</div>" if mgmt_q else ""}
</div>"""

    detail_html = "".join(_factor_detail(fk) for fk in top_fkeys[:2]) if top_fkeys else \
        '<div class="empty-state">Factor detail beschikbaar na patroonduiding.</div>'

    s += f"""<div class="pb sec">
  <span class="slabel">Factor detail &mdash; itemniveau</span>
  <p style="font-size:8.5px;color:#64748B;margin-bottom:9px;">Itemniveau als onderbouwing van de factorscore &mdash; gebruik als verdiepende onderbouwing voor het gesprek.</p>
  {detail_html}
</div>"""

    # ── SDT basisbehoeften ────────────────────────────────────────────────────
    def _sdt_overview_row(dim: str) -> str:
        sc   = sdt_a.get(dim)
        col  = _factor_color(sc)
        fl_  = _factor_label(sc)
        w    = min(100.0, sc / 10.0 * 100.0) if sc else 0
        return f"""<div style="margin-bottom:10px;">
  <div style="margin-bottom:3px;">
    <span style="font-size:10.5px;font-weight:700;color:#243247;">{_h(SDT_LABELS.get(dim,dim))}</span>
    <span style="font-size:9px;font-weight:700;color:{col};margin-left:7px;">{_score_str(sc)}</span>
    <span style="font-size:9px;color:{col};margin-left:5px;">&mdash; {_h(fl_)}</span>
  </div>
  <div style="font-size:8px;color:#6B7280;margin-bottom:3px;">{_h(SDT_HELP.get(dim,""))}</div>
  <div class="bar-track"><div class="bar-fill" style="width:{w:.0f}%;background:{col};"></div></div>
</div>"""

    def _sdt_item_rows(dim: str) -> str:
        keys = SDT_DIMENSION_ITEMS.get(dim, [])
        rows = ""
        for ik in keys:
            isc = sim.get(ik)
            q   = next((t for k, t in data["sdt_items"] if k == ik), ik)
            rev = " ↩" if ik in SDT_REVERSE_ITEMS else ""
            if isc is None: continue
            ic = _factor_color(isc); iw = min(100.0, isc/10*100)
            rows += (f'<tr><td class="iq">{_h(q[:68]+("..." if len(q)>68 else ""))}<span style="font-size:7px;color:#94A3B8;">{rev}</span></td>'
                     f'<td class="is" style="color:{ic};">{isc:.1f}</td>'
                     f'<td class="ib"><div class="mb-track"><div class="mb-fill" style="width:{iw:.0f}%;background:{ic};"></div></div></td></tr>')
        return rows

    sdt_detail = ""
    for dim in ("autonomy", "competence", "relatedness"):
        rows = _sdt_item_rows(dim)
        if rows:
            sdt_detail += f'<div style="margin-top:8px;"><div style="font-size:8px;font-weight:700;color:#475569;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:4px;">{_h(SDT_LABELS.get(dim,""))}</div><table class="item-tbl">{rows}</table></div>'

    s += f"""<div class="pb sec">
  <span class="slabel">Werkbeleving &mdash; SDT basisbehoeften</span>
  <div class="card">
    <p style="font-size:8.5px;color:#64748B;margin-bottom:10px;">Autonomie, competentiegevoel en verbondenheid geven de onderliggende werkbeleving weer, onafhankelijk van de organisatiefactoren.</p>
    {_sdt_overview_row("autonomy")}
    {_sdt_overview_row("competence")}
    {_sdt_overview_row("relatedness")}
    {sdt_detail}
  </div>
</div>"""

    # ── eNPS ─────────────────────────────────────────────────────────────────
    if data["enps_available"] and data["enps_score"] is not None:
        es = data["enps_score"]
        escol = "#22C55E" if es >= 20 else "#F59E0B" if es >= 0 else "#EF4444"
        s += f"""<div class="sec">
  <span class="slabel">Werkgeversaanbeveling (eNPS)</span>
  <div class="card">
    <span style="font-size:28px;font-weight:700;color:{escol};">{es:+d}</span>
    <span style="font-size:9px;color:#64748B;margin-left:8px;">eNPS-score (&minus;100 tot +100)</span>
    <p style="font-size:8.5px;color:#64748B;margin-top:6px;">Ondersteunende context &mdash; geen hoofdmetric. Gebruik als aanvullend signaal.</p>
  </div>
</div>"""
    else:
        s += """<div class="sec">
  <span class="slabel">Werkgeversaanbeveling (eNPS)</span>
  <div class="empty-state">Niet beschikbaar in deze meetronde &mdash; niet gemeten of onvoldoende responses.</div>
</div>"""

    # ── Survey-stemmen ────────────────────────────────────────────────────────
    texts = data["open_texts"]
    if len(texts) >= MIN_QUOTES_N:
        theme_html = ""
        used = set()
        for t in texts[:MAX_QUOTES]:
            if t in used: continue
            used.add(t)
            tl = t.lower()
            theme_name = next(
                (k for k, kws in THEME_KEYWORDS.items() if any(kw in tl for kw in kws)),
                "Open thema")
            # evidence label: check against top factor
            tf_kws = THEME_KEYWORDS.get(
                next((k for k in THEME_KEYWORDS if top_fkeys and any(fk in k.lower() or k.lower() in FACTOR_SHORT_DESC.get(top_fkeys[0],"").lower() for fk in [top_fkeys[0]])), ""),
                [])
            if tf_kws and any(kw in tl for kw in tf_kws):
                ev = "bevestigt topfactor"; ev_col = "#FEF2F2"; ev_tc = "#DC2626"
            elif any(kw in tl for kw in ["niet", "maar", "hoewel", "toch", "echter"]):
                ev = "nuanceert beeld"; ev_col = "#EFF6FF"; ev_tc = "#1D4ED8"
            else:
                ev = "verdiept signaal"; ev_col = "#F0FDF4"; ev_tc = "#15803D"
            theme_html += (f'<div class="theme-card">'
                           f'<div><span class="theme-badge">{_h(theme_name)}</span>'
                           f'<span class="ev-badge" style="background:{ev_col};color:{ev_tc};">{_h(ev)}</span></div>'
                           f'<div class="quote-card">{_h(t)}'
                           f'<div class="quote-anon">Geanonimiseerd &mdash; namen en contactgegevens verwijderd</div></div>'
                           f'</div>')
        s += f"""<div class="pb sec">
  <span class="slabel">Open toelichting &mdash; {len(texts)} antwoorden</span>
  <div class="cwarn" style="margin-bottom:9px;">
    Kwalitatieve aanvulling op de factoranalyse &mdash; geen numerieke metric.
    Thema-indeling is indicatief. n per thema nog niet beschikbaar &mdash; quotes geselecteerd als geanonimiseerde voorbeelden.
    Getoond: {min(len(texts),MAX_QUOTES)} van {len(texts)} antwoorden.
  </div>
  {theme_html}
</div>"""
    else:
        s += f"""<div class="pb sec">
  <span class="slabel">Open toelichting</span>
  <div class="empty-state">Minimaal {MIN_QUOTES_N} antwoorden vereist voor weergave (anonimiteitsbescherming). Huidig: {len(texts)}.</div>
</div>"""

    # ── Managementduiding ─────────────────────────────────────────────────────
    pbs_html = ("".join(_playbook_card(r) for r in data["exit_pbs"])
                if data["exit_pbs"]
                else '<div class="empty-state">Duiding beschikbaar bij voldoende responses met patroon.</div>')
    s += f"""<div class="pb sec">
  <span class="slabel">Managementduiding</span>
  <div class="cwarn">
    Onderstaande duiding is afgeleid uit scorepatronen en vertrekredenen.
    Gebruik als eerste spoor om te bespreken &mdash; niet als definitieve conclusie.
    Bespreek altijd met betrokken managers en HR voordat stappen worden gezet.
  </div>
  {pbs_html}
</div>"""

    # ── Bestuurlijke handoff ──────────────────────────────────────────────────
    tf_lbl_h = top_flabels[0] if top_flabels else "het leidende thema"
    s += f"""<div class="pb sec">
  <span class="slabel">Bestuurlijke handoff &amp; vervolgrichting</span>
  <div class="card" style="margin-bottom:10px;"><p style="font-size:9.5px;">{_h(nsp.get("intro_text",""))}</p></div>
  {_step_cards(nsp)}
  <div class="card" style="margin-top:10px;background:#F8FAFC;border-color:#E2E8F0;">
    <p style="font-size:8.5px;color:#475569;">
      <strong>Eerste stap:</strong> Kies binnen 30 dagen &eacute;&eacute;n managementgesprek of data-check
      om het signaal rond {_h(tf_lbl_h)} te verduidelijken.
      Bepaal daarna pas of een gerichte verbetering nodig is.
      Beleg eigenaar en reviewmoment voordat bredere stappen worden gezet.
    </p>
  </div>
</div>"""

    # ── Appendix ─────────────────────────────────────────────────────────────
    app_sections = ""
    for fk, items in data["factor_items_map"].items():
        lbl_f = FACTOR_LABELS_NL.get(fk, fk)
        fsc_a = fa.get(fk)
        rows  = ""
        for ik, q in items:
            isc = oim.get(ik)
            if isc is None:
                rows += f'<tr><td class="aq">{_h(q)}</td><td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
            else:
                ic = _factor_color(isc); iw = min(100.0,isc/10*100)
                rows += (f'<tr><td class="aq">{_h(q)}</td><td class="as" style="color:{ic};">{isc:.1f}</td>'
                         f'<td class="ab"><div class="mb-track"><div class="mb-fill" style="width:{iw:.0f}%;background:{ic};"></div></div></td></tr>')
        app_sections += f'<div class="no-break" style="margin-bottom:13px;"><div style="font-size:8.5px;font-weight:700;color:#243247;margin-bottom:4px;">{_h(lbl_f)} {("&mdash; gem. " + _score_str(fsc_a)) if fsc_a else ""}</div><table class="app-tbl"><tr><th class="aq">Vraag</th><th class="as">Gem.</th><th class="ab">Beeld</th></tr>{rows}</table></div>'

    sdt_rows = ""
    for ik, q in data["sdt_items"]:
        isc = sim.get(ik); rev = " ↩" if ik in SDT_REVERSE_ITEMS else ""
        if isc is None:
            sdt_rows += f'<tr><td class="aq">{_h(q)}{rev}</td><td class="as" style="color:#94A3B8;">n.b.</td><td class="ab"></td></tr>'
        else:
            ic = _factor_color(isc); iw = min(100.0,isc/10*100)
            sdt_rows += (f'<tr><td class="aq">{_h(q)}{rev}</td><td class="as" style="color:{ic};">{isc:.1f}</td>'
                         f'<td class="ab"><div class="mb-track"><div class="mb-fill" style="width:{iw:.0f}%;background:{ic};"></div></div></td></tr>')

    s += f"""<div class="pb sec">
  <span class="slabel">Appendix &mdash; volledige vraagresultaten</span>
  <div class="cwarn" style="margin-bottom:10px;">
    Verdiepende onderbouwing &mdash; itemscores berekend als groepsgemiddelde (n={n}), geschaald 1&ndash;10.
    &#x21a9; = omgekeerd gecodeerd item. Gebruik als gespreksonderlaag, niet als zelfstandige metric.
  </div>
  {app_sections}
  <div class="no-break"><div style="font-size:8.5px;font-weight:700;color:#243247;margin-bottom:4px;">SDT basisbehoeften &mdash; B1 t/m B12</div>
  <table class="app-tbl"><tr><th class="aq">Vraag</th><th class="as">Gem.</th><th class="ab">Beeld</th></tr>{sdt_rows}</table></div>
  <div class="empty-state" style="margin-top:8px;">eNPS &mdash; {"beschikbaar, zie hoofdrapport" if data["enps_available"] else "niet gemeten in deze wave"}</div>
</div>"""

    # ── Methodiek ────────────────────────────────────────────────────────────
    s += _trust_page()
    return _doc(f"ExitScan — {data['campaign_name']}", s)


# ─── RetentionScan renderer ───────────────────────────────────────────────────

def render_retention_report_html(data: dict) -> str:
    n           = data["n_completed"]
    avg_risk    = data["avg_risk"]
    rp          = data["retention_profile"] or "—"
    rp_col      = _factor_color({"HOOG": 2.0, "MIDDEN": 5.5, "LAAG": 8.0}.get(rp, 5.5))
    rp_lbl      = {"HOOG": "Kwetsbaar retentiebeeld", "MIDDEN": "Gemengd retentiebeeld",
                   "LAAG": "Relatief sterk retentiebeeld"}.get(rp, rp)
    rdsp        = _score_str(avg_risk)
    top_flabels = data["top_flabels"]
    top_fkeys   = data["top_fkeys"]
    fa          = data["factor_avgs"]
    fim         = data["factor_items_map"]
    oim         = data["org_item_avgs"]
    sdt_a       = data["sdt_avgs"]
    msp         = data["msp"] or {}
    nsp         = data["nsp"]

    sorted_f    = sorted([(fk, fa.get(fk)) for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None], key=lambda x: x[1])
    bottom_2    = [fk for fk, _ in sorted_f[:2]]
    top_2       = [fk for fk, _ in sorted_f[-2:]]
    sorted_desc = list(reversed(sorted_f))

    exec_copy   = msp.get("executive_intro") or f"Retentiesignaal: {rp_lbl}. Scherpste factoren: {', '.join(top_flabels)}."
    stat_cards  = [
        {"title": "Retentiesignaal", "value": rp_lbl,   "body": "Indicatief beeld"},
        {"title": "Gem. score",      "value": rdsp,      "body": "1-10, hoger = meer frictie"},
        {"title": "Bevlogenheid",    "value": _score_str(data["avg_eng"]),  "body": "UWES-score"},
        {"title": "Vertrekintentie", "value": _score_str(data["avg_to"]),   "body": "Gem. vertrekintentie"},
    ]

    factor_bars = "".join(_factor_row(fk, sc,
        highlight="bot" if fk in bottom_2 else "top" if fk in top_2 else None)
        for fk, sc in sorted_desc)

    def _sdt_row(dim: str) -> str:
        sc = sdt_a.get(dim); col = _factor_color(sc); fl_ = _factor_label(sc); w = min(100.0, sc/10*100) if sc else 0
        return (f'<div style="margin-bottom:9px;"><div style="margin-bottom:2px;"><span style="font-size:10px;font-weight:600;color:#243247;">{_h(SDT_LABELS.get(dim,""))}</span>'
                f'<span style="font-size:9px;color:{col};margin-left:7px;">{_score_str(sc)} &mdash; {_h(fl_)}</span></div>'
                f'<div class="bar-track"><div class="bar-fill" style="width:{w:.0f}%;background:{col};"></div></div></div>')

    texts = data["open_texts"]
    open_html = ("".join(f'<div class="quote-card">{_h(t)}<div class="quote-anon">Geanonimiseerd</div></div>' for t in texts[:MAX_QUOTES])
                 if len(texts) >= MIN_QUOTES_N
                 else f'<div class="empty-state">Min. {MIN_QUOTES_N} antwoorden vereist. Huidig: {len(texts)}.</div>')

    pbs_html = ("".join(_playbook_card(r) for r in data["ret_pbs"])
                if data["ret_pbs"] else '<div class="empty-state">Playbooks beschikbaar bij voldoende patroon.</div>')

    tf_lbl = top_flabels[0] if top_flabels else "het leidende thema"
    body = f"""
{_cover(data["scan_lbl"], data["org_name"], data["campaign_name"], data["generated_at"], n, data["delivery_mode"])}
<div class="pb sec">
  <span class="slabel">Executive at-a-glance</span>
  <div class="card ca" style="margin-bottom:11px;">
    <span style="font-size:24px;font-weight:700;color:{rp_col};">{_h(rp_lbl)}</span>
    <p style="font-size:9.5px;margin-top:7px;">{_h(exec_copy)}</p>
  </div>
  {_stat4(stat_cards)}
</div>
<div class="pb sec">
  <span class="slabel">Factoranalyse</span>
  <div class="card">{factor_bars}</div>
</div>
<div class="pb sec">
  <span class="slabel">Werkbeleving &mdash; SDT basisbehoeften</span>
  <div class="card">{_sdt_row("autonomy")}{_sdt_row("competence")}{_sdt_row("relatedness")}</div>
</div>
<div class="pb sec">
  <span class="slabel">Open toelichting</span>
  {open_html}
</div>
<div class="pb sec">
  <span class="slabel">Behoudsduiding</span>
  {pbs_html}
</div>
<div class="pb sec">
  <span class="slabel">Bestuurlijke handoff</span>
  <div class="card" style="margin-bottom:10px;"><p style="font-size:9.5px;">{_h(nsp.get("intro_text",""))}</p></div>
  {_step_cards(nsp)}
  <div class="card" style="margin-top:10px;background:#F8FAFC;border-color:#E2E8F0;">
    <p style="font-size:8.5px;color:#475569;">
      Kies binnen 30 dagen &eacute;&eacute;n eerste managementgesprek of data-check
      om het signaal rond {_h(tf_lbl)} te verduidelijken.
    </p>
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
    fim         = data["factor_items_map"]
    oim         = data["org_item_avgs"]
    nsp         = data["nsp"]

    sorted_f    = sorted([(fk, fa.get(fk)) for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None], key=lambda x: x[1])
    bottom_2    = [fk for fk, _ in sorted_f[:2]]
    top_2       = [fk for fk, _ in sorted_f[-2:]]
    texts       = data["open_texts"]
    open_html   = ("".join(f'<div class="quote-card">{_h(t)}<div class="quote-anon">Geanonimiseerd</div></div>' for t in texts[:MAX_QUOTES])
                   if len(texts) >= MIN_QUOTES_N
                   else f'<div class="empty-state">Min. {MIN_QUOTES_N} antwoorden vereist. Huidig: {len(texts)}.</div>')

    factor_bars = "".join(_factor_row(fk, sc,
        highlight="bot" if fk in bottom_2 else "top" if fk in top_2 else None)
        for fk, sc in list(reversed(sorted_f)))

    stat_cards = [
        {"title": "Uitgenodigd",       "value": str(data["n_invited"]),   "body": "Medewerkers voor dit checkpoint"},
        {"title": "Ingevuld",          "value": str(n),                   "body": "Responses in dit beeld"},
        {"title": "Respons",           "value": _pct_str(data["completion_pct"]), "body": "Voltooide responses"},
        {"title": "Onboardingsignaal", "value": rdsp,                     "body": fl},
    ]

    tf_lbl = top_flabels[0] if top_flabels else "het eerste aandachtspunt"
    body = f"""
{_cover(data["scan_lbl"], data["org_name"], data["campaign_name"], data["generated_at"], n, data["delivery_mode"])}
<div class="pb sec">
  <span class="slabel">Executive at-a-glance</span>
  <div class="card ca" style="margin-bottom:11px;">
    <span class="score-h" style="color:{fcol};">{rdsp}</span>
    <span class="rbadge" style="background:{fcol};">{_h(fl)}</span>
    <p style="font-size:8.5px;color:#64748B;margin-top:7px;">Eerste aandachtspunten: <strong>{" &middot; ".join(_h(l) for l in top_flabels) or "&#x2014;"}</strong></p>
  </div>
  {_stat4(stat_cards)}
</div>
<div class="pb sec">
  <span class="slabel">Factoranalyse &mdash; onboardingmodules</span>
  <div class="card">{factor_bars}</div>
</div>
<div class="pb sec">
  <span class="slabel">Open toelichting</span>
  {open_html}
</div>
<div class="pb sec">
  <span class="slabel">Bestuurlijke handoff</span>
  <div class="card" style="margin-bottom:10px;"><p style="font-size:9.5px;">{_h(nsp.get("intro_text",""))}</p></div>
  {_step_cards(nsp)}
  <div class="card" style="margin-top:10px;background:#F8FAFC;border-color:#E2E8F0;">
    <p style="font-size:8.5px;color:#475569;">
      Kies binnen 30 dagen &eacute;&eacute;n eerste managementgesprek om het signaal rond {_h(tf_lbl)} te verduidelijken.
    </p>
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
