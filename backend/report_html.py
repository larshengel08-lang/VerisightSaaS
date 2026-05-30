"""
Loep — HTML→PDF rapportgenerator (WeasyPrint) v3
================================================
Parallel pad naast report.py. report.py blijft onaangeroerd.

Gebruik
-------
    from backend.report_html import generate_campaign_report_html
    pdf_bytes = generate_campaign_report_html(campaign_id, db)
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

MIN_QUOTES_N   = 5
MAX_QUOTES     = 4
ORG_RAW_SCALE  = (1, 5)   # raw range for org items

PREVENTABILITY_META = {
    "STERK_WERKSIGNAAL":   ("Werkfactoren spelen een duidelijke rol", "#1E293B", "Groot deel van de antwoorden wijst op beïnvloedbare werkfactoren."),
    "GEMENGD_WERKSIGNAAL": ("Gemengd beeld",                          "#64748B", "Werkfactoren en andere verklaringen wisselen elkaar af."),
    "BEPERKT_WERKSIGNAAL": ("Werkfactoren beperkt zichtbaar",         "#94A3B8", "Beeld wijst overwegend op persoonlijke of externe redenen."),
}

SDT_LABELS = {"autonomy": "Autonomie", "competence": "Competentie", "relatedness": "Verbondenheid"}
SDT_HELP   = {
    "autonomy":    "Mate van ervaren regie over de eigen werkwijze.",
    "competence":  "Mate van ervaren bekwaamheid en effectiviteit.",
    "relatedness": "Mate van verbondenheid met collega's en organisatie.",
}


# ─── Schaalhulp ───────────────────────────────────────────────────────────────

def _scale_to_10(raw: float, reverse: bool = False) -> float:
    lo, hi = ORG_RAW_SCALE
    r = (hi + lo) - raw if reverse else raw
    return round((r - lo) / (hi - lo) * 9 + 1, 2)


def _risk_band(risk_value: float) -> str:
    return "HOOG" if risk_value >= RISK_HIGH else "MIDDEN" if risk_value >= RISK_MEDIUM else "LAAG"


def _score_band(score: float | None) -> str:
    return _risk_band(11.0 - score) if score is not None else "LAAG"


def _band_color(band: str) -> str:
    return {"HOOG": "#EF4444", "MIDDEN": "#F59E0B", "LAAG": "#22C55E"}.get(band, "#94A3B8")


def _band_label(band: str) -> str:
    return {"HOOG": "Vraagt aandacht", "MIDDEN": "Eerst toetsen", "LAAG": "Relatief sterk"}.get(band, band)


def _h(s: Any) -> str:
    return "" if s is None else _esc(str(s))


# ─── CSS ──────────────────────────────────────────────────────────────────────

_CSS = """
@page {
  size: A4;
  margin: 17mm 15mm 22mm 15mm;
  @bottom-left {
    content: "Vertrouwelijk \2014 Loep \2014 Groepsoutput";
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

/* ── Breaks ── */
.pb { break-before: page; }
.no-break { break-inside: avoid; }

/* ── Type ── */
.slabel {
  display: block; font-size: 9px; font-weight: 700;
  color: #64748B; letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 9px;
}
h3 { font-size: 11px; font-weight: 700; color: #243247; margin-bottom: 4px; }
p  { margin-bottom: 5px; }

/* ── Cover ── */
.cover {
  page: cover-page;
  background: #1E293B;
  min-height: 297mm;
  padding: 48px 44px 36px;
}
.cover-badge {
  display: inline-block; background: #D19422; color: #FFF;
  font-size: 9px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; padding: 4px 12px; border-radius: 3px;
  margin-bottom: 28px;
}
.cover-org   { font-size: 12px; color: #64748B; margin-bottom: 8px; }
.cover-title { font-size: 28px; font-weight: 700; color: #FFF; line-height: 1.2; margin-bottom: 8px; }
.cover-sub   { font-size: 10px; color: #94A3B8; }
.cover-meta  { margin-top: 56px; display: table; width: 100%; border-top: 1px solid #334155; padding-top: 18px; }
.cmc  { display: table-cell; width: 25%; padding-right: 10px; }
.cml  { font-size: 8px; font-weight: 700; color: #475569; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
.cmv  { font-size: 13px; font-weight: 700; color: #E2E8F0; }

/* ── Cards ── */
.card { background: #FFF; border: 1px solid #E8E0D0; border-radius: 6px; padding: 13px 15px; margin-bottom: 11px; }
.card-amber { border-left: 4px solid #D19422; }
.card-red   { border-left: 4px solid #EF4444; }
.card-green { border-left: 4px solid #22C55E; }
.card-warn  { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 5px; padding: 8px 12px; margin-bottom: 10px; font-size: 8.5px; color: #92400E; }

/* ── Stat grid (4 col) ── */
.sg4 { display: table; width: 100%; border-collapse: separate; border-spacing: 7px 0; margin-bottom: 13px; }
.sg4 tr { display: table-row; }
.sg4 td { display: table-cell; background: #FFF; border: 1px solid #E8E0D0; border-radius: 6px; padding: 9px 11px; vertical-align: top; width: 25%; }
.sc-lbl { font-size: 8px; font-weight: 700; color: #64748B; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 2px; }
.sc-val { font-size: 18px; font-weight: 700; color: #243247; line-height: 1.15; margin-bottom: 1px; }
.sc-body { font-size: 8px; color: #6B7280; line-height: 1.4; }

/* ── Insight grid ── */
.ig { display: table; width: 100%; border-collapse: separate; border-spacing: 7px 0; margin-bottom: 7px; }
.ig tr { display: table-row; }
.ig td {
  display: table-cell; background: #FFF; border: 1px solid #E8E0D0;
  border-radius: 6px; padding: 9px 11px; vertical-align: top; width: 25%;
}
.ig-kicker { font-size: 7.5px; font-weight: 700; color: #94A3B8; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 3px; }
.ig-value  { font-size: 11px; font-weight: 700; color: #243247; margin-bottom: 3px; line-height: 1.3; }
.ig-note   { font-size: 8px; color: #64748B; line-height: 1.4; }

/* ── Bar ── */
.brt { display: table; width: 100%; }
.brt td.trk { display: table-cell; vertical-align: middle; padding-right: 7px; }
.brt td.sco { display: table-cell; vertical-align: middle; white-space: nowrap; font-size: 10.5px; font-weight: 700; color: #374151; padding-right: 5px; width: 30px; }
.brt td.bnd { display: table-cell; vertical-align: middle; white-space: nowrap; font-size: 9px; font-weight: 700; width: 108px; }
.bar-track { height: 7px; background: #E8E0D0; border-radius: 3px; overflow: hidden; }
.bar-fill  { height: 7px; border-radius: 3px; }

/* Mini bar (for items) */
.mini-bar-track { height: 5px; background: #E8E0D0; border-radius: 2px; overflow: hidden; display: inline-block; width: 60px; vertical-align: middle; }
.mini-bar-fill  { height: 5px; border-radius: 2px; display: block; }

/* ── Factor row ── */
.frow { margin-bottom: 11px; }
.fname { font-size: 10px; font-weight: 600; color: #243247; margin-bottom: 3px; }
.fitems { font-size: 8px; color: #6B7280; margin-bottom: 3px; font-style: italic; }
.fhi-top { background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 4px; padding: 7px 9px; margin-bottom: 7px; }
.fhi-bot { background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 4px; padding: 7px 9px; margin-bottom: 7px; }

/* ── Item detail table ── */
.item-table { width: 100%; border-collapse: collapse; margin-top: 6px; }
.item-table td { padding: 4px 6px; vertical-align: middle; font-size: 8.5px; color: #374151; border-bottom: 1px solid #F1F5F9; }
.item-table td.iq { width: 55%; }
.item-table td.is { width: 15%; font-weight: 700; color: #243247; text-align: right; padding-right: 8px; }
.item-table td.ib { width: 30%; }

/* ── Reason bar ── */
.rrow { margin-bottom: 7px; }
.rlbl { font-size: 9px; color: #374151; margin-bottom: 2px; }
.rb-t { display: table; width: 100%; }
.rb-t td.rt { display: table-cell; vertical-align: middle; padding-right: 6px; }
.rb-t td.rc { display: table-cell; vertical-align: middle; white-space: nowrap; font-size: 8.5px; color: #6B7280; width: 60px; }
.r-track { height: 5px; background: #E8E0D0; border-radius: 2px; overflow: hidden; }
.r-fill  { height: 5px; border-radius: 2px; }

/* ── Composition bands ── */
.comp-band { display: table; width: 100%; border-radius: 4px; overflow: hidden; margin-bottom: 8px; height: 20px; }
.comp-seg  { display: table-cell; vertical-align: middle; text-align: center; font-size: 7.5px; font-weight: 700; color: #FFF; }

/* ── Quote / theme ── */
.quote-card {
  background: #FAFAF9; border: 1px solid #E8E0D0;
  border-left: 3px solid #D19422; border-radius: 4px;
  padding: 9px 13px; margin-bottom: 7px;
  font-size: 9.5px; color: #374151; font-style: italic; line-height: 1.6;
}
.quote-anon { font-size: 7.5px; color: #94A3B8; font-style: normal; margin-top: 3px; }
.theme-card { background: #FFF; border: 1px solid #E8E0D0; border-radius: 5px; padding: 9px 12px; margin-bottom: 8px; }
.theme-badge { display: inline-block; font-size: 7.5px; font-weight: 700; background: #F1F5F9; color: #475569; padding: 1px 6px; border-radius: 3px; letter-spacing: 0.05em; margin-bottom: 4px; }

/* ── Playbook ── */
.play { background: #FFF; border: 1px solid #E8E0D0; border-left: 4px solid #D19422; border-radius: 6px; padding: 13px 15px; margin-bottom: 13px; }
.play-hdr { display: table; width: 100%; margin-bottom: 7px; }
.play-badge { display: table-cell; vertical-align: middle; padding-right: 7px; width: 1%; white-space: nowrap; }
.play-badge span { display: inline-block; font-size: 8.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border-radius: 3px; color: #FFF; }
.play-title { display: table-cell; vertical-align: middle; font-size: 10.5px; font-weight: 700; color: #243247; }
.sub-lbl { font-size: 8px; font-weight: 700; color: #64748B; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 7px; margin-bottom: 1px; }
.act-list { margin-left: 13px; margin-bottom: 3px; }
.act-list li { margin-bottom: 2px; font-size: 9.5px; }
.caution { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 3px; padding: 5px 9px; font-size: 8.5px; color: #92400E; margin-top: 5px; }

/* ── Step grid ── */
.steps { display: table; width: 100%; border-collapse: separate; border-spacing: 7px 0; }
.step  { display: table-cell; background: #FFF; border: 1px solid #E8E0D0; border-radius: 6px; padding: 11px 13px; vertical-align: top; width: 25%; }
.step-no  { font-size: 8px; font-weight: 700; color: #D19422; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 2px; }
.step-body{ font-size: 9px; color: #374151; line-height: 1.5; }

/* ── Trust ── */
.trust-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 7px 0; }
.trust-cell { display: table-cell; background: #FFF; border: 1px solid #E8E0D0; border-radius: 5px; padding: 11px 13px; vertical-align: top; width: 33%; }
.trust-title{ font-size: 9.5px; font-weight: 700; color: #243247; margin-bottom: 3px; }
.trust-body { font-size: 8.5px; color: #374151; line-height: 1.5; }

/* ── Two-col ── */
.tcol  { display: table; width: 100%; border-collapse: separate; border-spacing: 11px 0; }
.tc-l  { display: table-cell; vertical-align: top; width: 55%; }
.tc-r  { display: table-cell; vertical-align: top; width: 45%; }

/* ── Appendix table ── */
.app-table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
.app-table th { background: #F1F5F9; color: #475569; font-weight: 700; padding: 5px 7px; text-align: left; border-bottom: 1px solid #E2E8F0; }
.app-table td { padding: 4px 7px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; color: #374151; }
.app-table td.app-q { width: 60%; }
.app-table td.app-s { width: 12%; font-weight: 700; text-align: right; padding-right: 8px; }
.app-table td.app-b { width: 28%; }

/* ── Score hero ── */
.score-hero { font-size: 38px; font-weight: 700; line-height: 1; }
.band-badge { display: inline-block; font-size: 9.5px; font-weight: 700; padding: 3px 9px; border-radius: 3px; color: #FFF; margin-left: 7px; vertical-align: middle; }

/* ── Misc ── */
.sec  { margin-bottom: 20px; }
.empty-state { background: #FFF; border: 1px dashed #E8E0D0; border-radius: 5px; padding: 14px; text-align: center; color: #94A3B8; font-size: 9px; }
.seg-badge { display: inline-block; font-size: 8px; font-weight: 700; padding: 2px 7px; border-radius: 3px; margin-right: 4px; }
"""


# ─── HTML document ────────────────────────────────────────────────────────────

def _doc(title: str, body: str) -> str:
    return f'<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><title>{title}</title><style>{_CSS}</style></head><body>{body}</body></html>'


# ─── Shared building blocks ───────────────────────────────────────────────────

def _cover(scan_label: str, org_name: str, campaign_name: str,
           generated_at: str, n: int, mode: str) -> str:
    return f"""<div class="cover">
  <div class="cover-badge">{_h(scan_label)}</div>
  <div class="cover-org">{_h(org_name)}</div>
  <div class="cover-title">{_h(campaign_name)}</div>
  <div class="cover-sub">Managementrapport &bull; Groepsoutput &bull; Vertrouwelijk</div>
  <div class="cover-meta">
    <div class="cmc"><div class="cml">Respondenten</div><div class="cmv">{n}</div></div>
    <div class="cmc"><div class="cml">Type</div><div class="cmv">{_h(mode)}</div></div>
    <div class="cmc"><div class="cml">Datum</div><div class="cmv" style="font-size:10px;">{_h(generated_at)}</div></div>
    <div class="cmc"><div class="cml">Leessterkte</div><div class="cmv" style="font-size:10px;">{"Indicatief" if n < 10 else "Opbouwend" if n < 20 else "Stevig"}</div></div>
  </div>
</div>"""


def _stat4(cards: list[dict]) -> str:
    tds = "".join(
        f'<td><div class="sc-lbl">{_h(c["title"])}</div>'
        f'<div class="sc-val">{_h(c["value"])}</div>'
        f'<div class="sc-body">{_h(c["body"])}</div></td>'
        for c in cards
    )
    return f'<table class="sg4"><tr>{tds}</tr></table>'


def _bar(score: float | None, mini: bool = False) -> str:
    if score is None:
        return '<span style="color:#94A3B8;font-size:8.5px;">n.b.</span>'
    band  = _score_band(score)
    color = _band_color(band)
    w     = min(100.0, max(0.0, score / 10.0 * 100.0))
    if mini:
        return (f'<div class="mini-bar-track"><div class="mini-bar-fill" style="width:{w:.0f}%;background:{color};"></div></div>'
                f'&nbsp;<span style="font-size:8.5px;font-weight:700;color:{color};">{score:.1f}</span>')
    return (f'<div class="bar-track"><div class="bar-fill" style="width:{w:.0f}%;background:{color};"></div></div>')


def _factor_row(fk: str, score: float | None, items_short: list[str] | None = None,
                highlight: str | None = None) -> str:
    lbl   = FACTOR_LABELS_NL.get(fk, fk)
    if score is None:
        return f'<div class="frow"><div class="fname">{_h(lbl)}</div><div class="empty-state" style="text-align:left;padding:5px 8px;">Onvoldoende data</div></div>'
    band  = _score_band(score)
    color = _band_color(band)
    bl    = _band_label(band)
    w     = min(100.0, score / 10.0 * 100.0)
    items_html = f'<div class="fitems">{_h(" &middot; ".join(i[:55] + ("&hellip;" if len(i) > 55 else "") for i in items_short))}</div>' if items_short else ""
    wrap = f' class="fhi-{"top" if highlight == "top" else "bot"}"' if highlight else ""
    return f"""<div{wrap}><div class="frow">
  <div class="fname">{_h(lbl)}</div>{items_html}
  <table class="brt"><tr>
    <td class="trk"><div class="bar-track"><div class="bar-fill" style="width:{w:.0f}%;background:{color};"></div></div></td>
    <td class="sco">{score:.1f}</td>
    <td class="bnd" style="color:{color};">{_h(bl)}</td>
  </tr></table>
</div></div>"""


def _reason_bar(label: str, count: int, total: int, color: str = "#475569") -> str:
    pct = count / total * 100 if total else 0
    return f"""<div class="rrow">
  <div class="rlbl">{_h(label)}</div>
  <table class="rb-t"><tr>
    <td class="rt"><div class="r-track"><div class="r-fill" style="width:{pct:.0f}%;background:{color};"></div></div></td>
    <td class="rc">{pct:.0f}% ({count}×)</td>
  </tr></table>
</div>"""


def _playbook(row: dict) -> str:
    rb   = str(row.get("band", "MIDDEN")).upper()
    bk   = rb if rb in ("HOOG", "MIDDEN", "LAAG") else "MIDDEN"
    col  = _band_color(bk)
    bl   = _band_label(bk)
    lbl  = row.get("label", row.get("factor", ""))
    acts = "".join(f"<li>{_h(a)}</li>" for a in row.get("actions", []))
    return f"""<div class="play" style="border-left-color:{col};">
  <div class="play-hdr">
    <div class="play-badge"><span style="background:{col};">{_h(bl)}</span></div>
    <div class="play-title">{_h(lbl)} &mdash; {_h(row.get("title",""))}</div>
  </div>
  {"<div class='sub-lbl'>Eerste verificatiespoor</div><p style='font-size:9.5px;'>" + _h(row.get("decision","")) + "</p>" if row.get("decision") else ""}
  {"<div class='sub-lbl'>Wat toetsen</div><p style='font-size:9.5px;'>" + _h(row.get("validate","")) + "</p>" if row.get("validate") else ""}
  {"<div class='sub-lbl'>Mogelijke stappen</div><ul class='act-list'>" + acts + "</ul>" if acts else ""}
  {"<div class='sub-lbl'>Eigenaar</div><p style='font-size:9.5px;'>" + _h(row.get("owner") or row.get("owner_basis","")) + "</p>" if row.get("owner") or row.get("owner_basis") else ""}
  {"<div class='sub-lbl'>Reviewmoment</div><p style='font-size:9.5px;'>" + _h(row.get("review","")) + "</p>" if row.get("review") else ""}
  {"<div class='caution'>Leesgrens: " + _h(row.get("caution","")) + "</div>" if row.get("caution") else ""}
</div>"""


def _step_cards(nsp: dict) -> str:
    cards = nsp.get("session_cards") or [
        {"title": "Eerste verificatiespoor", "body": nsp.get("first_decision", "")},
        {"title": "Eigenaar",                "body": nsp.get("first_owner", "")},
        {"title": "Eerste stap",             "body": nsp.get("first_action", "")},
        {"title": "Reviewmoment",            "body": nsp.get("review_moment", "")},
    ]
    tds = "".join(
        f'<td class="step"><div class="step-no">{_h(c.get("title",""))}</div>'
        f'<div class="step-body">{_h(c.get("body",""))}</div></td>'
        for c in cards[:4]
    )
    return f'<table class="steps"><tr>{tds}</tr></table>'


def _trust_page() -> str:
    return """<div class="pb">
  <span class="slabel">Methodiek &amp; interpretatiegrenzen</span>
  <div class="card" style="margin-bottom:11px;">
    <p style="font-size:9.5px;">
      Loep-output is een gegroepeerde managementsamenvatting op groepsniveau.
      Het rapport is bedoeld als startpunt voor verificatie, gesprek en prioritering &mdash;
      niet als sluitend bewijs van oorzaak, diagnose of individuele beoordeling.
    </p>
  </div>
  <table class="trust-grid"><tr>
    <td class="trust-cell"><div class="trust-title">Groepsniveau</div><div class="trust-body">Alle uitkomsten zijn groepsgemiddelden. Geen individuele scores, namen of herleidbare gegevens.</div></td>
    <td class="trust-cell"><div class="trust-title">n-grenzen</div><div class="trust-body">Indicatief: 5+<br>Patroonlaag: 10+<br>Segmenten: 5+ per groep<br>Onder drempel: sectie niet getoond.</div></td>
    <td class="trust-cell"><div class="trust-title">Geen diagnose</div><div class="trust-body">Scores zijn indicatief en methodisch verdedigbaar, maar niet extern gevalideerd als diagnostisch instrument.</div></td>
  </tr></table>
  <table class="trust-grid" style="margin-top:7px;"><tr>
    <td class="trust-cell"><div class="trust-title">Open tekst</div><div class="trust-body">Geanonimiseerd (namen, contact, locaties verwijderd). Toon alleen bij n &ge; 5.</div></td>
    <td class="trust-cell"><div class="trust-title">Claimgrens</div><div class="trust-body">Vermeld altijd n en leessterkte bij interne presentatie. Gebruik als eerste toetsingsvraag.</div></td>
    <td class="trust-cell"><div class="trust-title">Privacywaarborg</div><div class="trust-body">Verwerking conform AVG. Rapport is uitsluitend bestemd voor geautoriseerde gebruikers.</div></td>
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

    # ── Scores ────────────────────────────────────────────────────────────────
    risk_sc    = [r.risk_score for r in responses if r.risk_score is not None]
    avg_risk   = round(_mean(risk_sc), 2) if risk_sc else None

    eng_sc     = [r.uwes_score for r in responses if r.uwes_score is not None]
    avg_eng    = round(_mean(eng_sc), 2) if eng_sc else None

    to_sc      = [r.turnover_intention_score for r in responses if r.turnover_intention_score is not None]
    avg_to     = round(_mean(to_sc), 2) if to_sc else None

    si_sc      = [round((float(r.stay_intent_score) - 1) / 4 * 9 + 1, 2) for r in responses if r.stay_intent_score is not None]
    avg_si     = round(_mean(si_sc), 2) if si_sc else None

    band_counts = {"HOOG": 0, "MIDDEN": 0, "LAAG": 0}
    for r in responses:
        if r.risk_band in band_counts:
            band_counts[r.risk_band] += 1

    # ── Patroonanalyse ────────────────────────────────────────────────────────
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
    pattern       = detect_patterns(pattern_input)
    has_pattern   = pattern.get("sufficient_data", False)
    factor_avgs   = pattern.get("factor_averages", {}) if has_pattern else {}
    top_risks     = pattern.get("top_risk_factors", []) if has_pattern else []
    strong_work   = pattern.get("strong_work_signal_pct") if has_pattern else None
    top_exit_lbl  = (pattern.get("top_exit_reasons", [{}])[0].get("label")
                     if has_pattern and pattern.get("top_exit_reasons") else None)
    top_cont_lbl  = (pattern.get("top_contributing_reasons", [{}])[0].get("label")
                     if has_pattern and pattern.get("top_contributing_reasons") else None)
    top_fkeys     = [f for f, _ in top_risks[:2]]
    top_flabels   = [FACTOR_LABELS_NL.get(f, f) for f in top_fkeys]

    # ── Signaalzichtbaarheid ──────────────────────────────────────────────────
    sig_vis: float | None = None
    if scan_type == "exit":
        vis = [s.get("signal_visibility_score")
               for s in (((r.full_result or {}).get("exit_context_summary") or {}) for r in responses)
               if isinstance(s.get("signal_visibility_score"), (int, float))]
        if vis:
            sig_vis = _mean(vis)

    # ── SDT averages ──────────────────────────────────────────────────────────
    sdt_avgs: dict[str, float] = {}
    for dim in ("autonomy", "competence", "relatedness"):
        if dim in factor_avgs:
            sdt_avgs[dim] = factor_avgs[dim]
        else:
            vals = [r.sdt_scores.get(dim) for r in responses if r.sdt_scores and r.sdt_scores.get(dim) is not None]
            if vals:
                sdt_avgs[dim] = round(_mean(vals), 2)

    # ── Item-level scores (berekend uit raw) ──────────────────────────────────
    raw_acc: dict[str, list[float]] = defaultdict(list)
    for r in responses:
        for k, v in (r.sdt_raw or {}).items():
            raw_acc[k].append(float(v))
        for k, v in (r.org_raw or {}).items():
            raw_acc[k].append(float(v))

    sdt_item_avgs: dict[str, float] = {}
    for k, vals in raw_acc.items():
        if k.startswith("B"):
            sdt_item_avgs[k] = _scale_to_10(_mean(vals), reverse=(k in SDT_REVERSE_ITEMS))

    org_item_avgs: dict[str, float] = {}
    for k, vals in raw_acc.items():
        if not k.startswith("B"):
            org_item_avgs[k] = _scale_to_10(_mean(vals))

    # ── Vertrekredenen & preventability ──────────────────────────────────────
    exit_r_cnt  = Counter(r.exit_reason_code for r in responses if r.exit_reason_code)
    exit_r_dist = [{"code": c, "label": EXIT_REASON_LABELS_NL.get(c, c), "count": n_}
                   for c, n_ in exit_r_cnt.most_common(5)]

    cont_cnt  = Counter()
    for r in responses:
        for k in (r.pull_factors_raw or {}).keys():
            cont_cnt[k] += 1
    cont_dist = [{"code": c, "label": EXIT_REASON_LABELS_NL.get(c, c), "count": n_}
                 for c, n_ in cont_cnt.most_common(5)]

    prev_cnt  = Counter(r.preventability for r in responses if r.preventability)
    prev_dist = dict(prev_cnt)

    # ── Open tekst ────────────────────────────────────────────────────────────
    raw_texts  = [r.open_text_raw for r in responses if r.open_text_raw and r.open_text_raw.strip()]
    open_texts = list(dict.fromkeys(anonymize_text(t) for t in raw_texts))  # dedup

    # ── Retentiesignaal ───────────────────────────────────────────────────────
    is_retention        = scan_type == "retention"
    retention_profile   = None
    if is_retention and avg_risk is not None:
        retention_profile = compute_retention_signal_profile(
            risk_score=avg_risk, engagement_score=avg_eng,
            turnover_intention_score=avg_to, stay_intent_score=avg_si)

    # ── Playbooks ─────────────────────────────────────────────────────────────
    from backend.report import _build_exit_playbook_rows, _build_retention_playbook_rows
    exit_pbs = (_build_exit_playbook_rows(top_risks=top_risks)
                if scan_type == "exit" and has_pattern else [])
    ret_pbs  = (_build_retention_playbook_rows(top_risks=top_risks,
                    playbooks=product_module.get_action_playbooks_payload())
                if is_retention and has_pattern and hasattr(product_module, "get_action_playbooks_payload")
                else [])

    # ── Management payloads ───────────────────────────────────────────────────
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

    # ── Org sections (item texts) ─────────────────────────────────────────────
    org_sections: list[dict] = scan_meta.get("org_sections", [])
    factor_items_map: dict[str, list[tuple[str, str]]] = {
        sec["key"]: sec["items"]  # [(item_key, question_text), ...]
        for sec in org_sections if "key" in sec and "items" in sec
    }
    sdt_items: list[tuple[str, str]] = scan_meta.get("sdt_items", [])  # [(B1, text), ...]

    # ── eNPS ─────────────────────────────────────────────────────────────────
    # eNPS stored as enps_score if present; check full_result fallback
    enps_vals = []
    for r in responses:
        fr = r.full_result or {}
        es = fr.get("enps_score")
        if es is not None:
            enps_vals.append(float(es))
    enps_available = len(enps_vals) >= MIN_QUOTES_N
    enps_avg = round(_mean(enps_vals), 1) if enps_available else None
    if enps_available and enps_vals:
        promoters  = sum(1 for v in enps_vals if v >= 9)
        detractors = sum(1 for v in enps_vals if v <= 6)
        enps_score = round((promoters - detractors) / len(enps_vals) * 100)
    else:
        enps_score = None

    return {
        "campaign_id": campaign_id, "scan_type": scan_type, "scan_lbl": scan_lbl,
        "org_name": org.name if org else "", "campaign_name": camp.name,
        "generated_at": now_str, "delivery_mode": mode_lbl,
        "n_invited": n_invited, "n_completed": n_completed, "completion_pct": completion,
        "avg_risk": avg_risk, "avg_eng": avg_eng, "avg_to": avg_to, "avg_si": avg_si,
        "band_counts": band_counts, "has_pattern": has_pattern,
        "factor_avgs": factor_avgs, "top_risks": top_risks,
        "top_fkeys": top_fkeys, "top_flabels": top_flabels,
        "strong_work": strong_work, "top_exit_lbl": top_exit_lbl, "top_cont_lbl": top_cont_lbl,
        "sig_vis": sig_vis, "sdt_avgs": sdt_avgs,
        "sdt_item_avgs": sdt_item_avgs, "org_item_avgs": org_item_avgs,
        "exit_r_dist": exit_r_dist, "cont_dist": cont_dist,
        "prev_dist": prev_dist, "open_texts": open_texts,
        "retention_profile": retention_profile,
        "exit_pbs": exit_pbs, "ret_pbs": ret_pbs, "msp": msp, "nsp": nsp,
        "factor_items_map": factor_items_map, "sdt_items": sdt_items,
        "enps_available": enps_available, "enps_avg": enps_avg, "enps_score": enps_score,
    }


# ─── ExitScan renderer ────────────────────────────────────────────────────────

def render_exit_report_html(data: dict) -> str:
    n        = data["n_completed"]
    avg_risk = data["avg_risk"]
    band     = _score_band(avg_risk) if avg_risk is not None else None
    bcol     = _band_color(band) if band else "#94A3B8"
    blbl     = _band_label(band) if band else "—"
    rdsp     = f"{avg_risk:.1f}/10" if avg_risk is not None else "—"

    fa = data["factor_avgs"]
    sorted_f = sorted([(fk, fa.get(fk)) for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None],
                      key=lambda x: x[1])
    bottom_2 = [fk for fk, _ in sorted_f[:2]]
    top_2    = [fk for fk, _ in sorted_f[-2:]]
    top_flabels = data["top_flabels"]
    top_fkeys   = data["top_fkeys"]
    fim      = data["factor_items_map"]
    oim      = data["org_item_avgs"]
    sim      = data["sdt_item_avgs"]
    sdt_a    = data["sdt_avgs"]
    msp      = data["msp"] or {}

    # ── Cover ─────────────────────────────────────────────────────────────────
    s  = _cover(data["scan_lbl"], data["org_name"], data["campaign_name"],
                data["generated_at"], n, data["delivery_mode"])

    # ── Executive at-a-glance ─────────────────────────────────────────────────
    stat_cards = [
        {"title": "Frictiescore",   "value": rdsp,         "body": "Gem. over alle respondenten (1–10)"},
        {"title": "Signaal",        "value": blbl,         "body": "Indicatieve duiding op groepsniveau"},
        {"title": "Respons",        "value": f"{n}/{data['n_invited']}", "body": f"{data['completion_pct']}% voltooide responses"},
        {"title": "Eerste aandacht","value": top_flabels[0] if top_flabels else "—",
         "body": "Factor met hoogste frictiebijdrage"},
    ]
    s += f"""<div class="pb sec">
  <span class="slabel">Executive at-a-glance</span>
  <div class="card card-amber" style="margin-bottom:11px;">
    <span class="score-hero" style="color:{bcol};">{rdsp}</span>
    <span class="band-badge" style="background:{bcol};">{_h(blbl)}</span>
    {"<p style='font-size:9.5px;margin-top:7px;'>" + _h(msp.get("executive_intro","")) + "</p>" if msp.get("executive_intro") else ""}
    <p style="font-size:8.5px;color:#64748B;margin-top:5px;">
      Scherpste factoren: <strong>{" &middot; ".join(_h(l) for l in top_flabels)}</strong>
      {"&nbsp;&bull;&nbsp;Meest genoemde reden: <strong>" + _h(data["top_exit_lbl"]) + "</strong>" if data.get("top_exit_lbl") else ""}
    </p>
  </div>
  {_stat4(stat_cards)}
</div>"""

    # ── Wat valt op? ──────────────────────────────────────────────────────────
    low_f  = sorted_f[0]  if sorted_f else None
    high_f = sorted_f[-1] if sorted_f else None
    low_sdt_key  = min(sdt_a, key=sdt_a.get) if sdt_a else None
    first_quote  = data["open_texts"][0][:80] + "…" if data["open_texts"] else None
    verif_vraag  = (msp.get("management_question") or
                    f"Waar kleurt {top_flabels[0].lower() if top_flabels else 'de topfactor'} het vertrekbeeld het meest?")

    def _ig_card(kicker: str, value: str, note: str) -> str:
        return (f'<td><div class="ig-kicker">{_h(kicker)}</div>'
                f'<div class="ig-value">{_h(value)}</div>'
                f'<div class="ig-note">{_h(note)}</div></td>')

    row1 = "".join([
        _ig_card("Laagste factor",
                 FACTOR_LABELS_NL.get(low_f[0], low_f[0]) if low_f else "—",
                 f"Score {low_f[1]:.1f}/10 — vraagt eerst aandacht" if low_f else ""),
        _ig_card("Relatief sterk",
                 FACTOR_LABELS_NL.get(high_f[0], high_f[0]) if high_f else "—",
                 f"Score {high_f[1]:.1f}/10 — minder leidend in dit beeld" if high_f else ""),
        _ig_card("Meest genoemde reden",
                 data["exit_r_dist"][0]["label"] if data["exit_r_dist"] else "—",
                 f"{data['exit_r_dist'][0]['count']}× genoemd — eerste vertrekhaakje" if data["exit_r_dist"] else ""),
        _ig_card("Meest meespelende factor",
                 data["cont_dist"][0]["label"] if data["cont_dist"] else "—",
                 f"{data['cont_dist'][0]['count']}× — geeft breedte van het beeld" if data["cont_dist"] else ""),
    ])
    low_sdt_lbl  = SDT_LABELS.get(low_sdt_key, "—") if low_sdt_key else "—"
    low_sdt_sc   = f"{sdt_a[low_sdt_key]:.1f}/10" if low_sdt_key else "—"
    row2 = "".join([
        _ig_card("Laagste SDT-dimensie", low_sdt_lbl,
                 f"Score {low_sdt_sc} — {SDT_HELP.get(low_sdt_key, '')}"),
        _ig_card("Open-answer thema",
                 f"&lsquo;{first_quote}&rsquo;" if first_quote else "Niet getoond",
                 "Kwalitatieve verificatielaag — geen numerieke metric" if first_quote else f"Min. {MIN_QUOTES_N} antwoorden vereist"),
        _ig_card("Eerste verificatievraag", "Zie duiding &#x2193;", verif_vraag),
        _ig_card("Leessterkte",
                 "Indicatief" if n < 10 else "Opbouwend" if n < 20 else "Stevig",
                 f"{n} responses — {'patroonlaag actief' if n >= 10 else 'patroonlaag nog niet actief'}"),
    ])
    s += f"""<div class="sec">
  <span class="slabel">Wat valt op?</span>
  <p style="font-size:8.5px;color:#64748B;margin-bottom:8px;">Indicatief patroonbeeld &mdash; geen causale verdeling. Gebruik als eerste toetsingsvraag.</p>
  <table class="ig" style="margin-bottom:7px;"><tr>{row1}</tr></table>
  <table class="ig"><tr>{row2}</tr></table>
</div>"""

    # ── Responsbasis & segmentstatus ──────────────────────────────────────────
    bc = data["band_counts"]
    s += f"""<div class="sec">
  <span class="slabel">Responsbasis &amp; leessterkte</span>
  <div class="tcol">
    <div class="tc-l">
      <div class="card">
        <div style="margin-bottom:7px;font-size:10px;">
          <strong>Uitgenodigd:</strong> {data['n_invited']}&nbsp;&nbsp;
          <strong>Ingevuld:</strong> {n}&nbsp;&nbsp;
          <strong>Respons:</strong> {data['completion_pct']}%
        </div>
        <div style="font-size:8.5px;color:#64748B;">
          Leessterkte: <strong>{"Indicatief" if n < 10 else "Opbouwend" if n < 20 else "Stevig"}</strong>
          &bull; Patroonlaag: <strong>{"actief" if n >= 10 else "niet actief (min. 10)"}</strong>
        </div>
        <div style="margin-top:8px;font-size:8.5px;">
          <span class="seg-badge" style="background:#FEF2F2;color:#EF4444;">Vraagt aandacht</span>{bc.get("HOOG",0)}×&nbsp;&nbsp;
          <span class="seg-badge" style="background:#FFFBEB;color:#D97706;">Eerst toetsen</span>{bc.get("MIDDEN",0)}×&nbsp;&nbsp;
          <span class="seg-badge" style="background:#F0FDF4;color:#16A34A;">Relatief sterk</span>{bc.get("LAAG",0)}×
        </div>
      </div>
    </div>
    <div class="tc-r">
      <div class="card">
        <div class="sub-lbl" style="margin-bottom:5px;">Segmentstatus</div>
        <div class="empty-state" style="font-size:8px;padding:8px;">
          Segmenten worden onderdrukt &mdash; minimale n (5 per groep) niet bereikt.<br>
          Analyse beschikbaar bij voldoende responsbasis per segment.
        </div>
      </div>
    </div>
  </div>
</div>"""

    # ── Vertrekcontext ────────────────────────────────────────────────────────
    exit_bars  = "".join(_reason_bar(r["label"], r["count"], n, "#1E293B") for r in data["exit_r_dist"])  or '<div class="empty-state">Geen vertrekredenen geregistreerd</div>'
    cont_bars  = "".join(_reason_bar(r["label"], r["count"], n, "#475569") for r in data["cont_dist"]) or '<div class="empty-state">Geen meespelende redenen geregistreerd</div>'

    sv = data["sig_vis"]
    if sv is not None:
        sv_lbl = "Signalen waren zichtbaar" if sv >= 4 else "Deels zichtbaar" if sv >= 3 else "Bleven onder de radar"
        sv_col = "#22C55E" if sv >= 4 else "#F59E0B" if sv >= 3 else "#EF4444"
        sv_block = f'<div class="card" style="margin-top:8px;border-left:3px solid {sv_col};"><div style="font-size:9.5px;font-weight:700;color:{sv_col};margin-bottom:3px;">{_h(sv_lbl)}</div><div style="font-size:8.5px;color:#64748B;">Eerdere signalering: {sv:.1f}/5 &mdash; in hoeverre was twijfel of vertrek vooraf zichtbaar of bespreekbaar.</div></div>'
    else:
        sv_block = ""

    s += f"""<div class="pb sec">
  <span class="slabel">Vertrekcontext</span>
  <div class="tcol">
    <div class="tc-l">
      <div class="card">
        <h3 style="margin-bottom:7px;">Hoofdredenen van vertrek</h3>
        <p style="font-size:8px;color:#64748B;margin-bottom:7px;">Wat respondenten als primaire reden noemden. Lees als vertrekcontext, niet als causale verklaring.</p>
        {exit_bars}
      </div>
    </div>
    <div class="tc-r">
      <div class="card">
        <h3 style="margin-bottom:7px;">Meespelende factoren</h3>
        <p style="font-size:8px;color:#64748B;margin-bottom:7px;">Factoren naast de hoofdreden &mdash; geeft breedte van het vertrekverhaal.</p>
        {cont_bars}
      </div>
      {sv_block}
    </div>
  </div>
</div>"""

    # ── Signaalopbouw ─────────────────────────────────────────────────────────
    total_prev = sum(data["prev_dist"].values()) or 1
    sterk  = data["prev_dist"].get("STERK_WERKSIGNAAL", 0)
    gemeng = data["prev_dist"].get("GEMENGD_WERKSIGNAAL", 0)
    beperkt = data["prev_dist"].get("BEPERKT_WERKSIGNAAL", 0)
    pct_s  = round(sterk  / total_prev * 100)
    pct_g  = round(gemeng / total_prev * 100)
    pct_b  = round(beperkt / total_prev * 100)

    comp_segs = ""
    if pct_s:  comp_segs += f'<td class="comp-seg" style="background:#1E293B;width:{pct_s}%;">{pct_s}%</td>'
    if pct_g:  comp_segs += f'<td class="comp-seg" style="background:#64748B;width:{pct_g}%;">{pct_g}%</td>'
    if pct_b:  comp_segs += f'<td class="comp-seg" style="background:#94A3B8;width:{pct_b}%;">{pct_b}%</td>'

    s += f"""<div class="sec">
  <span class="slabel">Signaalopbouw &mdash; welke lagen kleuren het vertrekbeeld?</span>
  <p style="font-size:8px;color:#64748B;margin-bottom:8px;">Indicatief patroonbeeld &mdash; geen causale verdeling. Lees als context voor prioritering.</p>
  <div class="card">
    <table class="comp-band" style="margin-bottom:8px;"><tr>{comp_segs}</tr></table>
    <div style="font-size:8.5px;color:#374151;margin-bottom:6px;">
      <span style="display:inline-block;width:10px;height:10px;background:#1E293B;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>
      Werkfactoren spelen een duidelijke rol: {sterk}× ({pct_s}%)&nbsp;&nbsp;&nbsp;
      <span style="display:inline-block;width:10px;height:10px;background:#64748B;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>
      Gemengd beeld: {gemeng}× ({pct_g}%)&nbsp;&nbsp;&nbsp;
      <span style="display:inline-block;width:10px;height:10px;background:#94A3B8;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>
      Werkfactoren beperkt zichtbaar: {beperkt}× ({pct_b}%)
    </div>
    <p style="font-size:8px;color:#64748B;">
      Topfactoren: {" &middot; ".join(_h(l) for l in top_flabels) or "—"} &bull;
      SDT-verdieping: {" &middot; ".join(_h(SDT_LABELS[d]) for d in ("autonomy","competence","relatedness") if d in sdt_a) or "—"} &bull;
      {"Open antwoorden: " + str(len(data["open_texts"])) + " beschikbaar" if data["open_texts"] else "Open antwoorden: onvoldoende voor weergave"}
    </p>
  </div>
</div>"""

    # ── Factoranalyse — landscape ─────────────────────────────────────────────
    sorted_desc = list(reversed(sorted_f))
    factor_bars_html = "".join(
        _factor_row(fk, sc,
                    items_short=[it[1][:52] for it in fim.get(fk, [])],
                    highlight="bot" if fk in bottom_2 else "top" if fk in top_2 else None)
        for fk, sc in sorted_desc
    )
    strengths  = [FACTOR_LABELS_NL.get(fk, fk) for fk in top_2]
    attention  = [FACTOR_LABELS_NL.get(fk, fk) for fk in bottom_2]

    s += f"""<div class="pb sec">
  <span class="slabel">Factoranalyse &mdash; factor landscape</span>
  <div class="tcol" style="margin-bottom:9px;">
    <div class="tc-l">
      <div class="card card-red">
        <div style="font-size:8px;font-weight:700;color:#EF4444;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:3px;">Vraagt eerst aandacht</div>
        <div style="font-size:10px;font-weight:600;color:#243247;">{" &middot; ".join(_h(l) for l in attention) or "—"}</div>
      </div>
    </div>
    <div class="tc-r">
      <div class="card card-green">
        <div style="font-size:8px;font-weight:700;color:#22C55E;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:3px;">Relatief sterk in dit beeld</div>
        <div style="font-size:10px;font-weight:600;color:#243247;">{" &middot; ".join(_h(l) for l in strengths) or "—"}</div>
      </div>
    </div>
  </div>
  <div class="card">
    <p style="font-size:8px;color:#64748B;margin-bottom:9px;">Score 1–10 &mdash; hoger = minder frictie. Gearceerde rijen: sterkste uitschieters. Onderliggende vragen per factor in cursief.</p>
    {factor_bars_html}
  </div>
</div>"""

    # ── Factor detail (top 2 factoren, item-niveau) ───────────────────────────
    def _factor_detail_card(fk: str) -> str:
        lbl   = FACTOR_LABELS_NL.get(fk, fk)
        fsc   = fa.get(fk)
        items = fim.get(fk, [])
        rows  = ""
        for item_key, q_text in items:
            isc = oim.get(item_key)
            if isc is None:
                continue
            iband = _score_band(isc)
            icol  = _band_color(iband)
            iw    = min(100.0, isc / 10.0 * 100.0)
            rows += f"""<tr>
  <td class="iq">{_h(q_text[:72] + ("…" if len(q_text) > 72 else ""))}</td>
  <td class="is" style="color:{icol};">{isc:.1f}</td>
  <td class="ib"><div class="mini-bar-track"><div class="mini-bar-fill" style="width:{iw:.0f}%;background:{icol};"></div></div></td>
</tr>"""
        if not rows:
            rows = f'<tr><td colspan="3" style="color:#94A3B8;font-style:italic;">Itemdata niet beschikbaar</td></tr>'
        return f"""<div class="card no-break" style="margin-bottom:11px;">
  <h3 style="margin-bottom:4px;">{_h(lbl)} <span style="font-size:9px;font-weight:400;color:#64748B;">— gem. {fsc:.1f}/10</span></h3>
  <p style="font-size:8px;color:#64748B;margin-bottom:6px;">Itemniveau &mdash; lees als indicatief patroon binnen dit vertrekbeeld, niet als individuele oorzaak.</p>
  <table class="item-table">{rows}</table>
</div>"""

    detail_cards = "".join(_factor_detail_card(fk) for fk in top_fkeys[:2]) if top_fkeys else '<div class="empty-state">Factordetail beschikbaar na patroonanalyse.</div>'
    s += f"""<div class="pb sec">
  <span class="slabel">Factor detail &mdash; itemniveau topfactoren</span>
  {detail_cards}
</div>"""

    # ── SDT Basisbehoeften ────────────────────────────────────────────────────
    def _sdt_dim_block(dim: str) -> str:
        sc   = sdt_a.get(dim)
        bd   = _score_band(sc) if sc is not None else "LAAG"
        col  = _band_color(bd)
        bl   = _band_label(bd)
        w    = min(100.0, sc / 10.0 * 100.0) if sc is not None else 0
        items_in_dim = SDT_DIMENSION_ITEMS.get(dim, [])
        item_rows = ""
        for ik in items_in_dim:
            isc = sim.get(ik)
            q   = next((t for k, t in data["sdt_items"] if k == ik), ik)
            if isc is None:
                continue
            ib = _score_band(isc); ic = _band_color(ib); iw = min(100.0, isc/10.0*100.0)
            rev = " (omgekeerd)" if ik in SDT_REVERSE_ITEMS else ""
            item_rows += f"""<tr>
  <td class="iq">{_h(q[:72] + ("…" if len(q) > 72 else ""))}<span style="font-size:7px;color:#94A3B8;">{rev}</span></td>
  <td class="is" style="color:{ic};">{isc:.1f}</td>
  <td class="ib"><div class="mini-bar-track"><div class="mini-bar-fill" style="width:{iw:.0f}%;background:{ic};"></div></div></td>
</tr>"""
        return f"""<div class="card no-break" style="margin-bottom:10px;">
  <div style="margin-bottom:5px;">
    <span style="font-size:10.5px;font-weight:700;color:#243247;">{_h(SDT_LABELS.get(dim,dim))}</span>
    <span style="font-size:8.5px;color:#64748B;margin-left:6px;">{_h(SDT_HELP.get(dim,""))}</span>
  </div>
  <table class="brt" style="margin-bottom:6px;"><tr>
    <td class="trk"><div class="bar-track"><div class="bar-fill" style="width:{w:.0f}%;background:{col};"></div></div></td>
    <td class="sco">{f"{sc:.1f}" if sc else "—"}</td>
    <td class="bnd" style="color:{col};">{_h(bl)}</td>
  </tr></table>
  {"<table class='item-table'>" + item_rows + "</table>" if item_rows else ""}
</div>"""

    s += f"""<div class="pb sec">
  <span class="slabel">Werkbeleving &mdash; SDT basisbehoeften</span>
  <p style="font-size:8.5px;color:#64748B;margin-bottom:9px;">
    De drie basisbehoeften (SDT) meten ervaren autonomie, competentiegevoel en verbondenheid.
    Ze geven de onderliggende werkbeleving weer, onafhankelijk van de organisatiefactoren.
  </p>
  {_sdt_dim_block("autonomy")}
  {_sdt_dim_block("competence")}
  {_sdt_dim_block("relatedness")}
</div>"""

    # ── eNPS ─────────────────────────────────────────────────────────────────
    if data["enps_available"] and data["enps_score"] is not None:
        s += f"""<div class="sec">
  <span class="slabel">Werkgeversaanbeveling (eNPS)</span>
  <div class="card">
    <div style="margin-bottom:6px;"><span class="score-hero" style="font-size:28px;color:#243247;">{data['enps_score']:+d}</span><span style="font-size:9px;color:#64748B;margin-left:8px;">eNPS-score (&minus;100 tot +100)</span></div>
    <p style="font-size:8.5px;color:#64748B;">Ondersteunende context &mdash; geen hoofdmetric. Gebruik als aanvullend signaal naast factoranalyse en vertrekredenen.</p>
  </div>
</div>"""
    else:
        s += f"""<div class="sec">
  <span class="slabel">Werkgeversaanbeveling (eNPS)</span>
  <div class="empty-state">eNPS niet beschikbaar in deze meetronde &mdash; niet gemeten of onvoldoende responses.</div>
</div>"""

    # ── Survey-stemmen als themalaag ──────────────────────────────────────────
    texts = data["open_texts"]
    if len(texts) >= MIN_QUOTES_N:
        theme_cards = ""
        for i, t in enumerate(texts[:MAX_QUOTES]):
            # Eenvoudige themabepaling op basis van keywords
            top_f = top_flabels[0].lower() if top_flabels else ""
            if any(kw in t.lower() for kw in ["leiding", "manager", "feedback", "vertrou"]):
                ev_lbl = "Sluit aan bij topfactor"
            elif any(kw in t.lower() for kw in ["groei", "ontwikkel", "perspectief", "loopbaan"]):
                ev_lbl = "Verdiept groeiperspectief"
            elif any(kw in t.lower() for kw in ["werkdruk", "druk", "stress", "overwerk"]):
                ev_lbl = "Verdiept werkbelasting"
            else:
                ev_lbl = "Kwalitatief signaal"
            theme_cards += f"""<div class="theme-card">
  <div class="theme-badge">{_h(ev_lbl)}</div>
  <div class="quote-card" style="margin-top:4px;margin-bottom:0;">{_h(t)}<div class="quote-anon">Geanonimiseerd &mdash; namen, contactgegevens en locaties verwijderd</div></div>
</div>"""
        s += f"""<div class="pb sec">
  <span class="slabel">Survey-stemmen &mdash; {len(texts)} open antwoorden</span>
  <div class="card-warn" style="margin-bottom:10px;">
    Open tekst is een kwalitatieve verificatielaag &mdash; geen numerieke metric.
    Gebruik als aanvullend signaal. Thema-indeling is indicatief.
    Getoond: {min(len(texts), MAX_QUOTES)} van {len(texts)} antwoorden.
  </div>
  {theme_cards}
</div>"""
    else:
        s += f"""<div class="pb sec">
  <span class="slabel">Survey-stemmen</span>
  <div class="empty-state">Open antwoorden worden getoond bij minimaal {MIN_QUOTES_N} ingevulde teksten (anonimiteitsbescherming). Huidig: {len(texts)}.</div>
</div>"""

    # ── Managementduiding ─────────────────────────────────────────────────────
    pbs_html = ("".join(_playbook(r) for r in data["exit_pbs"])
                if data["exit_pbs"]
                else '<div class="empty-state">Duiding beschikbaar bij voldoende responses met patroon.</div>')
    s += f"""<div class="pb sec">
  <span class="slabel">Managementduiding</span>
  <div class="card-warn">
    Onderstaande duiding is afgeleid uit scorepatronen en vertrekredenen.
    Gebruik als eerste verificatiespoor &mdash; niet als definitieve diagnose.
    Toets altijd met betrokken managers en HR.
  </div>
  {pbs_html}
</div>"""

    # ── Bestuurlijke handoff ──────────────────────────────────────────────────
    nsp = data["nsp"]
    s += f"""<div class="pb sec">
  <span class="slabel">Bestuurlijke handoff &amp; vervolgrichting</span>
  <div class="card" style="margin-bottom:10px;"><p style="font-size:9.5px;">{_h(nsp.get("intro_text",""))}</p></div>
  {_step_cards(nsp)}
  <div class="card" style="margin-top:10px;background:#F8FAFC;border-color:#E2E8F0;">
    <p style="font-size:8.5px;color:#475569;">
      <strong>Eerste stap:</strong> Kies binnen 30 dagen &eacute;&eacute;n eerste verificatiestap
      en bepaal daarna of een gerichte verbetering nodig is. Beleg eigenaar, eerste stap en reviewmoment
      voordat bredere interventies worden gestart.
    </p>
  </div>
</div>"""

    # ── Appendix: volledige vraagresultaten ───────────────────────────────────
    def _app_section(title: str, rows: str) -> str:
        return f"""<div class="no-break" style="margin-bottom:14px;">
  <div style="font-size:9px;font-weight:700;color:#243247;margin-bottom:5px;">{_h(title)}</div>
  <table class="app-table">
    <tr><th class="app-q">Vraag</th><th class="app-s">Gem.</th><th class="app-b">Beeld</th></tr>
    {rows}
  </table>
</div>"""

    # Org factor items
    app_org_sections = ""
    for sec in data.get("factor_items_map", {}).items():
        fk, items = sec
        lbl = FACTOR_LABELS_NL.get(fk, fk)
        rows = ""
        for item_key, q in items:
            isc = oim.get(item_key)
            if isc is None:
                rows += f'<tr><td class="app-q">{_h(q)}</td><td class="app-s" style="color:#94A3B8;">n.b.</td><td class="app-b"></td></tr>'
            else:
                ib = _score_band(isc); ic = _band_color(ib); iw = min(100.0, isc/10.0*100.0)
                rows += f'<tr><td class="app-q">{_h(q)}</td><td class="app-s" style="color:{ic};">{isc:.1f}</td><td class="app-b"><div class="mini-bar-track"><div class="mini-bar-fill" style="width:{iw:.0f}%;background:{ic};"></div></div></td></tr>'
        app_org_sections += _app_section(f"{lbl} (gem. factor: {fa.get(fk, 0):.1f}/10)", rows)

    # SDT items
    sdt_rows = ""
    for ik, q in data.get("sdt_items", []):
        isc = sim.get(ik)
        rev = " ↩" if ik in SDT_REVERSE_ITEMS else ""
        if isc is None:
            sdt_rows += f'<tr><td class="app-q">{_h(q)}{_h(rev)}</td><td class="app-s" style="color:#94A3B8;">n.b.</td><td class="app-b"></td></tr>'
        else:
            ib = _score_band(isc); ic = _band_color(ib); iw = min(100.0, isc/10.0*100.0)
            sdt_rows += f'<tr><td class="app-q">{_h(q)}{_h(rev)}</td><td class="app-s" style="color:{ic};">{isc:.1f}</td><td class="app-b"><div class="mini-bar-track"><div class="mini-bar-fill" style="width:{iw:.0f}%;background:{ic};"></div></div></td></tr>'

    s += f"""<div class="pb sec">
  <span class="slabel">Appendix &mdash; volledige vraagresultaten</span>
  <div class="card-warn" style="margin-bottom:10px;">
    Itemscores berekend als groepsgemiddelde (n={n}), geschaald 1–10.
    Gebruik als verificatie- en gespreksonderlaag. ↩ = omgekeerd gecodeerd item.
  </div>
  {app_org_sections}
  {_app_section("SDT basisbehoeften &mdash; B1 t/m B12", sdt_rows)}
  <div class="empty-state" style="margin-top:6px;">eNPS &mdash; {"score beschikbaar, zie hoofdrapport" if data["enps_available"] else "niet gemeten in deze wave"}</div>
</div>"""

    # ── Methodiek & trust ─────────────────────────────────────────────────────
    s += _trust_page()

    return _doc(f"ExitScan — {data['campaign_name']}", s)


# ─── RetentionScan renderer ───────────────────────────────────────────────────

def render_retention_report_html(data: dict) -> str:
    n            = data["n_completed"]
    avg_risk     = data["avg_risk"]
    rp           = data["retention_profile"] or "—"
    rp_col       = _band_color(rp) if rp in ("HOOG", "MIDDEN", "LAAG") else "#94A3B8"
    rp_lbl       = _band_label(rp) if rp in ("HOOG", "MIDDEN", "LAAG") else rp
    rdsp         = f"{avg_risk:.1f}/10" if avg_risk is not None else "—"
    top_flabels  = data["top_flabels"]
    fa           = data["factor_avgs"]
    fim          = data["factor_items_map"]
    oim          = data["org_item_avgs"]
    sim          = data["sdt_item_avgs"]
    sdt_a        = data["sdt_avgs"]
    msp          = data["msp"] or {}
    nsp          = data["nsp"]

    sorted_f  = sorted([(fk, fa.get(fk)) for fk in ORG_FACTOR_KEYS if fa.get(fk) is not None], key=lambda x: x[1])
    bottom_2  = [fk for fk, _ in sorted_f[:2]]
    top_2     = [fk for fk, _ in sorted_f[-2:]]
    sorted_desc = list(reversed(sorted_f))

    stat_cards = [
        {"title": "Retentiesignaal", "value": rp_lbl,  "body": "Indicatief beeld op groepsniveau"},
        {"title": "Gem. score",      "value": rdsp,     "body": "1–10, hoger = meer frictie"},
        {"title": "Bevlogenheid",    "value": f"{data['avg_eng']:.1f}/10" if data['avg_eng'] else "—", "body": "UWES-score"},
        {"title": "Vertrekintentie", "value": f"{data['avg_to']:.1f}/10" if data['avg_to'] else "—",   "body": "Gemiddelde vertrekintentie"},
    ]

    texts = data["open_texts"]
    quotes_html = ("".join(
        f'<div class="quote-card">{_h(t)}<div class="quote-anon">Geanonimiseerd</div></div>'
        for t in texts[:MAX_QUOTES])
        if len(texts) >= MIN_QUOTES_N
        else f'<div class="empty-state">Min. {MIN_QUOTES_N} teksten vereist. Huidig: {len(texts)}.</div>')

    pbs_html = ("".join(_playbook(r) for r in data["ret_pbs"])
                if data["ret_pbs"]
                else '<div class="empty-state">Playbooks beschikbaar bij voldoende patroon.</div>')

    factor_bars = "".join(
        _factor_row(fk, sc, items_short=[it[1][:52] for it in fim.get(fk, [])],
                    highlight="bot" if fk in bottom_2 else "top" if fk in top_2 else None)
        for fk, sc in sorted_desc)

    # SDT summary (without item detail for brevity)
    def _sdt_row(dim: str) -> str:
        sc = sdt_a.get(dim); bl = _band_label(_score_band(sc)) if sc else "—"; col = _band_color(_score_band(sc)) if sc else "#94A3B8"
        w = min(100.0, sc / 10.0 * 100.0) if sc else 0
        return f'<div style="margin-bottom:9px;"><div style="font-size:10px;font-weight:600;color:#243247;margin-bottom:3px;">{_h(SDT_LABELS.get(dim,dim))}</div><table class="brt"><tr><td class="trk"><div class="bar-track"><div class="bar-fill" style="width:{w:.0f}%;background:{col};"></div></div></td><td class="sco">{f"{sc:.1f}" if sc else "—"}</td><td class="bnd" style="color:{col};">{_h(bl)}</td></tr></table></div>'

    body = f"""
{_cover(data["scan_lbl"], data["org_name"], data["campaign_name"], data["generated_at"], n, data["delivery_mode"])}
<div class="pb sec">
  <span class="slabel">Executive at-a-glance</span>
  <div class="card card-amber" style="margin-bottom:11px;">
    <span style="font-size:28px;font-weight:700;color:{rp_col};">{_h(rp_lbl)}</span>
    <span style="font-size:13px;font-weight:700;color:#243247;margin-left:11px;">{rdsp}</span>
    {"<p style='font-size:9.5px;margin-top:7px;'>" + _h(msp.get("executive_intro","")) + "</p>" if msp.get("executive_intro") else ""}
  </div>
  {_stat4(stat_cards)}
</div>
<div class="pb sec">
  <span class="slabel">Factoranalyse</span>
  <div class="card">{factor_bars}</div>
</div>
<div class="pb sec">
  <span class="slabel">SDT Basisbehoeften</span>
  <div class="card">{_sdt_row("autonomy")}{_sdt_row("competence")}{_sdt_row("relatedness")}</div>
</div>
<div class="pb sec">
  <span class="slabel">Survey-stemmen</span>
  {quotes_html}
</div>
<div class="pb sec">
  <span class="slabel">Behoudsplaybooks</span>
  {pbs_html}
</div>
<div class="pb sec">
  <span class="slabel">Bestuurlijke handoff</span>
  <div class="card" style="margin-bottom:10px;"><p style="font-size:9.5px;">{_h(nsp.get("intro_text",""))}</p></div>
  {_step_cards(nsp)}
</div>
{_trust_page()}"""
    return _doc(f"RetentionScan — {data['campaign_name']}", body)


# ─── OnboardingScan renderer ──────────────────────────────────────────────────

def render_onboarding_report_html(data: dict) -> str:
    n           = data["n_completed"]
    avg_risk    = data["avg_risk"]
    band        = _score_band(avg_risk) if avg_risk is not None else None
    bcol        = _band_color(band) if band else "#94A3B8"
    blbl        = _band_label(band) if band else "—"
    rdsp        = f"{avg_risk:.1f}/10" if avg_risk is not None else "—"
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
                   else f'<div class="empty-state">Min. {MIN_QUOTES_N} teksten vereist. Huidig: {len(texts)}.</div>')

    factor_bars = "".join(
        _factor_row(fk, sc, items_short=[it[1][:52] for it in fim.get(fk, [])],
                    highlight="bot" if fk in bottom_2 else "top" if fk in top_2 else None)
        for fk, sc in list(reversed(sorted_f)))

    stat_cards = [
        {"title": "Uitgenodigd",        "value": str(data["n_invited"]), "body": "Medewerkers voor dit checkpoint"},
        {"title": "Ingevuld",           "value": str(n),                 "body": "Responses in dit beeld"},
        {"title": "Respons",            "value": f"{data['completion_pct']}%", "body": "Voltooide responses"},
        {"title": "Onboardingsignaal",  "value": rdsp,                   "body": f"Indicatief: {blbl}"},
    ]

    body = f"""
{_cover(data["scan_lbl"], data["org_name"], data["campaign_name"], data["generated_at"], n, data["delivery_mode"])}
<div class="pb sec">
  <span class="slabel">Executive at-a-glance</span>
  <div class="card card-amber" style="margin-bottom:11px;">
    <span class="score-hero" style="color:{bcol};">{rdsp}</span>
    <span class="band-badge" style="background:{bcol};">{_h(blbl)}</span>
    <p style="font-size:8.5px;color:#64748B;margin-top:7px;">Eerste aandachtspunten: <strong>{" &middot; ".join(_h(l) for l in top_flabels) or "—"}</strong></p>
  </div>
  {_stat4(stat_cards)}
</div>
<div class="pb sec">
  <span class="slabel">Factoranalyse &mdash; onboardingmodules</span>
  <div class="card">{factor_bars}</div>
</div>
<div class="pb sec">
  <span class="slabel">Survey-stemmen</span>
  {open_html}
</div>
<div class="pb sec">
  <span class="slabel">Bestuurlijke handoff</span>
  <div class="card" style="margin-bottom:10px;"><p style="font-size:9.5px;">{_h(nsp.get("intro_text",""))}</p></div>
  {_step_cards(nsp)}
</div>
{_trust_page()}"""
    return _doc(f"Onboarding — {data['campaign_name']}", body)


# ─── Dispatcher ───────────────────────────────────────────────────────────────

def render_report_html(data: dict) -> str:
    st = data.get("scan_type", "exit")
    if st == "retention":  return render_retention_report_html(data)
    if st == "onboarding": return render_onboarding_report_html(data)
    return render_exit_report_html(data)


# ─── PDF generator ────────────────────────────────────────────────────────────

def generate_campaign_report_html(campaign_id: str, db: Session) -> bytes:
    from weasyprint import HTML
    return HTML(string=render_report_html(build_report_data(campaign_id, db))).write_pdf()
