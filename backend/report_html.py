"""
Loep — HTML→PDF rapportgenerator (WeasyPrint)
==============================================
Parallel pad naast report.py (ReportLab). report.py blijft onaangeroerd.

Gebruik
-------
    from backend.report_html import generate_campaign_report_html
    pdf_bytes = generate_campaign_report_html(campaign_id, db)

    from backend.report_html import render_report_html, build_report_data
    html_str = render_report_html(build_report_data(campaign_id, db))
"""

from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
from html import escape as _escape
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
)

# ─── Constanten ───────────────────────────────────────────────────────────────

MIN_OPEN_TEXT_N = 5   # minimaal aantal teksten voor toon quotes
MAX_QUOTES = 4        # maximaal aantal quotes tonen

SDT_LABELS = {
    "autonomy": "Autonomie",
    "competence": "Competentie",
    "relatedness": "Verbondenheid",
}

SDT_HELP = {
    "autonomy": "Mate waarin medewerkers regie ervoeren over hun eigen werkwijze.",
    "competence": "Mate waarin medewerkers zich bekwaam en effectief voelden.",
    "relatedness": "Mate van verbondenheid met collega's en de organisatie.",
}


# ─── Band helpers ─────────────────────────────────────────────────────────────

def _risk_band(risk_value: float) -> str:
    if risk_value >= RISK_HIGH:
        return "HOOG"
    if risk_value >= RISK_MEDIUM:
        return "MIDDEN"
    return "LAAG"


def _band_color(band: str) -> str:
    return {"HOOG": "#EF4444", "MIDDEN": "#F59E0B", "LAAG": "#22C55E"}.get(band, "#94A3B8")


def _band_bg(band: str) -> str:
    return {"HOOG": "#FEF2F2", "MIDDEN": "#FFFBEB", "LAAG": "#F0FDF4"}.get(band, "#F8FAFC")


def _band_label(band: str) -> str:
    """Canonieke bandlabels — geen 'risico'-taal."""
    return {
        "HOOG": "Vraagt aandacht",
        "MIDDEN": "Eerst toetsen",
        "LAAG": "Relatief sterk",
    }.get(band, band)


def _score_band(score: float | None) -> str:
    """Band op basis van factor-score (hoog score = laag risico)."""
    if score is None:
        return "LAAG"
    return _risk_band(11.0 - score)


def _h(s: Any) -> str:
    if s is None:
        return ""
    return _escape(str(s))


# ─── Gedeelde CSS ─────────────────────────────────────────────────────────────

_CSS = """
@page {
  size: A4;
  margin: 18mm 16mm 22mm 16mm;
  @bottom-left {
    content: "Vertrouwelijk — Loep — Groepsoutput";
    font-family: Arial, Helvetica, sans-serif;
    font-size: 7.5px;
    color: #94A3B8;
  }
  @bottom-right {
    content: counter(page) " / " counter(pages);
    font-family: Arial, Helvetica, sans-serif;
    font-size: 7.5px;
    color: #94A3B8;
  }
}
@page cover { margin: 0; }

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10.5px;
  line-height: 1.6;
  color: #374151;
  background: #F5F0E8;
}

/* ── Page breaks ── */
.page-break  { break-before: page; }
.no-break    { break-inside: avoid; }

/* ── Typography ── */
.report-title  { font-size: 22px; font-weight: 700; color: #243247; }
.section-label {
  font-size: 10px; font-weight: 700; color: #64748B;
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px;
  display: block;
}
h3 { font-size: 11.5px; font-weight: 700; color: #243247; margin-bottom: 4px; }
p  { margin-bottom: 6px; }

/* ── Cover ── */
.cover {
  page: cover;
  background: #1E293B;
  min-height: 297mm;
  padding: 48px 44px 36px;
  display: block;
  position: relative;
}
.cover-badge {
  display: inline-block;
  background: #D19422;
  color: #FFFFFF;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  padding: 4px 12px; border-radius: 3px;
  margin-bottom: 32px;
}
.cover-org   { font-size: 13px; color: #64748B; margin-bottom: 8px; }
.cover-title { font-size: 30px; font-weight: 700; color: #FFFFFF; line-height: 1.2; margin-bottom: 12px; }
.cover-sub   { font-size: 11px; color: #94A3B8; }
.cover-meta {
  margin-top: 60px;
  display: table; width: 100%;
  border-top: 1px solid #334155;
  padding-top: 20px;
}
.cover-meta-cell {
  display: table-cell; width: 25%;
  padding-right: 12px;
}
.cover-meta-label { font-size: 8px; font-weight: 700; color: #475569; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 3px; }
.cover-meta-value { font-size: 13px; font-weight: 700; color: #E2E8F0; }

/* ── Cards ── */
.card {
  background: #FFFFFF;
  border: 1px solid #E8E0D0;
  border-radius: 6px;
  padding: 14px 16px;
  margin-bottom: 12px;
}
.card-accent {
  border-left: 4px solid #D19422;
}

/* ── Stat grid ── */
.stat-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 8px 0; margin-bottom: 14px; }
.stat-row  { display: table-row; }
.stat-cell {
  display: table-cell;
  background: #FFFFFF;
  border: 1px solid #E8E0D0;
  border-radius: 6px;
  padding: 10px 12px;
  vertical-align: top;
}
.stat-label { font-size: 8.5px; font-weight: 700; color: #64748B; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 3px; }
.stat-value { font-size: 20px; font-weight: 700; color: #243247; margin-bottom: 2px; line-height: 1.1; }
.stat-body  { font-size: 8.5px; color: #6B7280; line-height: 1.4; }

/* ── Score large ── */
.score-large { font-size: 40px; font-weight: 700; line-height: 1; }
.score-band-badge {
  display: inline-block;
  font-size: 10px; font-weight: 700;
  padding: 3px 10px; border-radius: 4px;
  color: #FFFFFF; margin-left: 8px; vertical-align: middle;
}

/* ── Factor bar ── */
.factor-row     { margin-bottom: 13px; }
.factor-name    { font-size: 10.5px; font-weight: 600; color: #243247; margin-bottom: 4px; }
.factor-items   { font-size: 8.5px; color: #6B7280; margin-bottom: 4px; font-style: italic; }
.bar-table      { display: table; width: 100%; }
.bar-track-cell { display: table-cell; vertical-align: middle; padding-right: 8px; }
.bar-track      { height: 8px; background: #E8E0D0; border-radius: 4px; overflow: hidden; }
.bar-fill       { height: 8px; border-radius: 4px; }
.bar-score-cell { display: table-cell; vertical-align: middle; white-space: nowrap; font-size: 11px; font-weight: 700; color: #374151; padding-right: 6px; width: 32px; }
.bar-band-cell  { display: table-cell; vertical-align: middle; white-space: nowrap; font-size: 9.5px; font-weight: 700; width: 110px; }

/* ── Top/Bottom highlight ── */
.factor-highlight-top    { background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 5px; padding: 8px 10px; margin-bottom: 8px; }
.factor-highlight-bottom { background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 5px; padding: 8px 10px; margin-bottom: 8px; }

/* ── Exit reason bar ── */
.reason-row    { margin-bottom: 8px; }
.reason-label  { font-size: 9.5px; color: #374151; margin-bottom: 2px; }
.reason-bar-wrap { display: table; width: 100%; }
.reason-bar-cell { display: table-cell; vertical-align: middle; padding-right: 8px; }
.reason-count-cell { display: table-cell; vertical-align: middle; white-space: nowrap; font-size: 9px; font-weight: 600; color: #6B7280; width: 70px; }
.reason-track { height: 6px; background: #E8E0D0; border-radius: 3px; overflow: hidden; }
.reason-fill  { height: 6px; border-radius: 3px; background: #475569; }

/* ── SDT ── */
.sdt-row    { margin-bottom: 10px; }
.sdt-label  { font-size: 10.5px; font-weight: 600; color: #243247; margin-bottom: 2px; }
.sdt-help   { font-size: 8.5px; color: #6B7280; margin-bottom: 3px; }

/* ── Quote ── */
.quote-card {
  background: #FAFAF9;
  border: 1px solid #E8E0D0;
  border-left: 3px solid #D19422;
  border-radius: 4px;
  padding: 10px 14px;
  margin-bottom: 8px;
  font-size: 10px;
  color: #374151;
  font-style: italic;
  line-height: 1.6;
}
.quote-anon { font-size: 8px; color: #94A3B8; font-style: normal; margin-top: 4px; }

/* ── Playbook ── */
.playbook-card {
  background: #FFFFFF;
  border: 1px solid #E8E0D0;
  border-left: 4px solid #D19422;
  border-radius: 6px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.playbook-header    { display: table; width: 100%; margin-bottom: 8px; }
.playbook-badge-cell{ display: table-cell; vertical-align: middle; padding-right: 8px; width: 1%; white-space: nowrap; }
.playbook-badge span{ display: inline-block; font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 8px; border-radius: 3px; color: #FFFFFF; }
.playbook-title     { display: table-cell; vertical-align: middle; font-size: 11px; font-weight: 700; color: #243247; }
.subsection-label   { font-size: 8.5px; font-weight: 700; color: #64748B; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 8px; margin-bottom: 2px; }
.action-list        { margin-left: 14px; margin-bottom: 4px; }
.action-list li     { margin-bottom: 2px; }
.caution-box        { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 4px; padding: 6px 10px; font-size: 9px; color: #92400E; margin-top: 6px; }

/* ── Step grid ── */
.step-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 8px 0; }
.step-cell { display: table-cell; background: #FFFFFF; border: 1px solid #E8E0D0; border-radius: 6px; padding: 12px 14px; vertical-align: top; width: 25%; }
.step-number{ font-size: 8.5px; font-weight: 700; color: #D19422; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 3px; }
.step-body  { font-size: 9.5px; color: #374151; line-height: 1.5; }

/* ── Trust page ── */
.trust-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 8px 0; }
.trust-cell { display: table-cell; background: #FFFFFF; border: 1px solid #E8E0D0; border-radius: 6px; padding: 12px 14px; vertical-align: top; width: 33%; }
.trust-icon { font-size: 16px; margin-bottom: 6px; }
.trust-title{ font-size: 10px; font-weight: 700; color: #243247; margin-bottom: 4px; }
.trust-body { font-size: 9px; color: #374151; line-height: 1.5; }

/* ── Empty state ── */
.empty-state { background: #FFFFFF; border: 1px dashed #E8E0D0; border-radius: 6px; padding: 16px; text-align: center; color: #94A3B8; font-size: 9.5px; }

/* ── Two-column ── */
.two-col { display: table; width: 100%; border-collapse: separate; border-spacing: 12px 0; }
.col-left  { display: table-cell; vertical-align: top; width: 55%; }
.col-right { display: table-cell; vertical-align: top; width: 45%; }

/* ── Section spacing ── */
.section { margin-bottom: 22px; }
"""


# ─── HTML document wrapper ────────────────────────────────────────────────────

def _html_doc(title: str, body: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<title>{title}</title>
<style>{_CSS}</style>
</head>
<body>
{body}
</body>
</html>"""


# ─── Building blocks ──────────────────────────────────────────────────────────

def _cover(scan_label: str, org_name: str, campaign_name: str,
           generated_at: str, n_completed: int, delivery_mode: str) -> str:
    return f"""
<div class="cover">
  <div class="cover-badge">{_h(scan_label)}</div>
  <div class="cover-org">{_h(org_name)}</div>
  <div class="cover-title">{_h(campaign_name)}</div>
  <div class="cover-sub">Managementrapport &bull; Groepsoutput &bull; Vertrouwelijk</div>
  <div class="cover-meta">
    <div class="cover-meta-cell">
      <div class="cover-meta-label">Respondenten</div>
      <div class="cover-meta-value">{n_completed}</div>
    </div>
    <div class="cover-meta-cell">
      <div class="cover-meta-label">Type</div>
      <div class="cover-meta-value">{_h(delivery_mode)}</div>
    </div>
    <div class="cover-meta-cell">
      <div class="cover-meta-label">Datum</div>
      <div class="cover-meta-value" style="font-size:10px;">{_h(generated_at)}</div>
    </div>
    <div class="cover-meta-cell">
      <div class="cover-meta-label">Status</div>
      <div class="cover-meta-value" style="font-size:10px;">Vertrouwelijk</div>
    </div>
  </div>
</div>"""


def _stat_grid(cards: list[dict]) -> str:
    cells = "".join(
        f'<td class="stat-cell">'
        f'<div class="stat-label">{_h(c["title"])}</div>'
        f'<div class="stat-value">{_h(c["value"])}</div>'
        f'<div class="stat-body">{_h(c["body"])}</div>'
        f'</td>'
        for c in cards
    )
    return f'<table class="stat-grid"><tr>{cells}</tr></table>'


def _factor_bar_row(factor_key: str, score: float | None,
                    items: list[str] | None = None, highlight: str | None = None) -> str:
    label = FACTOR_LABELS_NL.get(factor_key, factor_key)
    if score is None:
        return (
            f'<div class="factor-row">'
            f'<div class="factor-name">{_h(label)}</div>'
            f'<div class="empty-state" style="text-align:left;padding:5px 8px;font-size:9px;">'
            f'Onvoldoende responses voor weergave</div></div>'
        )
    band = _score_band(score)
    color = _band_color(band)
    bl = _band_label(band)
    w = min(100.0, max(0.0, score / 10.0 * 100.0))
    items_html = ""
    if items:
        short = [i[:60] + ("…" if len(i) > 60 else "") for i in items]
        items_html = f'<div class="factor-items">{_h(" · ".join(short))}</div>'
    wrap_class = ""
    if highlight == "top":
        wrap_class = ' class="factor-highlight-top"'
    elif highlight == "bottom":
        wrap_class = ' class="factor-highlight-bottom"'
    return f"""<div{wrap_class}>
  <div class="factor-row">
    <div class="factor-name">{_h(label)}</div>
    {items_html}
    <table class="bar-table"><tr>
      <td class="bar-track-cell">
        <div class="bar-track">
          <div class="bar-fill" style="width:{w:.1f}%;background:{color};"></div>
        </div>
      </td>
      <td class="bar-score-cell">{score:.1f}</td>
      <td class="bar-band-cell" style="color:{color};">{_h(bl)}</td>
    </tr></table>
  </div>
</div>"""


def _reason_bar(label: str, count: int, total: int, color: str = "#475569") -> str:
    pct = count / total * 100 if total else 0
    pct_label = f"{pct:.0f}% ({count}×)"
    return f"""<div class="reason-row">
  <div class="reason-label">{_h(label)}</div>
  <table class="reason-bar-wrap"><tr>
    <td class="reason-bar-cell">
      <div class="reason-track">
        <div class="reason-fill" style="width:{pct:.1f}%;background:{color};"></div>
      </div>
    </td>
    <td class="reason-count-cell">{_h(pct_label)}</td>
  </tr></table>
</div>"""


def _sdt_bar(dim: str, score: float | None) -> str:
    label = SDT_LABELS.get(dim, dim)
    help_text = SDT_HELP.get(dim, "")
    if score is None:
        return f'<div class="sdt-row"><div class="sdt-label">{_h(label)}</div><div class="empty-state">Onvoldoende data</div></div>'
    band = _score_band(score)
    color = _band_color(band)
    bl = _band_label(band)
    w = min(100.0, max(0.0, score / 10.0 * 100.0))
    return f"""<div class="sdt-row">
  <div class="sdt-label">{_h(label)}</div>
  <div class="sdt-help">{_h(help_text)}</div>
  <table class="bar-table"><tr>
    <td class="bar-track-cell">
      <div class="bar-track">
        <div class="bar-fill" style="width:{w:.1f}%;background:{color};"></div>
      </div>
    </td>
    <td class="bar-score-cell">{score:.1f}</td>
    <td class="bar-band-cell" style="color:{color};">{_h(bl)}</td>
  </tr></table>
</div>"""


def _playbook_card(row: dict) -> str:
    raw_band = str(row.get("band", "MIDDEN")).upper()
    band_key = raw_band if raw_band in ("HOOG", "MIDDEN", "LAAG") else "MIDDEN"
    color = _band_color(band_key)
    band_display = _band_label(band_key)
    label = row.get("label", row.get("factor", ""))
    title = row.get("title", "")
    decision = row.get("decision", "")
    validate = row.get("validate", "")
    owner = row.get("owner") or row.get("owner_basis", "")
    actions: list[str] = row.get("actions", [])
    caution = row.get("caution", "")
    review = row.get("review", "")

    actions_html = "".join(f"<li>{_h(a)}</li>" for a in actions)
    return f"""<div class="playbook-card" style="border-left-color:{color};">
  <div class="playbook-header">
    <div class="playbook-badge-cell"><div class="playbook-badge"><span style="background:{color};">{_h(band_display)}</span></div></div>
    <div class="playbook-title">{_h(label)} &mdash; {_h(title)}</div>
  </div>
  {"<div class='subsection-label'>Eerste verificatiespoor</div><p>" + _h(decision) + "</p>" if decision else ""}
  {"<div class='subsection-label'>Wat toetsen</div><p>" + _h(validate) + "</p>" if validate else ""}
  {"<div class='subsection-label'>Mogelijke stappen</div><ul class='action-list'>" + actions_html + "</ul>" if actions_html else ""}
  {"<div class='subsection-label'>Eigenaar</div><p>" + _h(owner) + "</p>" if owner else ""}
  {"<div class='subsection-label'>Reviewmoment</div><p>" + _h(review) + "</p>" if review else ""}
  {"<div class='caution-box'>Leesgrens: " + _h(caution) + "</div>" if caution else ""}
</div>"""


def _follow_up_cards(next_steps: dict) -> str:
    cards = next_steps.get("session_cards", [])
    if not cards:
        cards = [
            {"title": "Eerste verificatiespoor", "body": next_steps.get("first_decision", "")},
            {"title": "Eigenaar", "body": next_steps.get("first_owner", "")},
            {"title": "Eerste stap", "body": next_steps.get("first_action", "")},
            {"title": "Reviewmoment", "body": next_steps.get("review_moment", "")},
        ]
    cells = "".join(
        f'<td class="step-cell">'
        f'<div class="step-number">{_h(c.get("title",""))}</div>'
        f'<div class="step-body">{_h(c.get("body",""))}</div>'
        f'</td>'
        for c in cards[:4]
    )
    return f'<table class="step-grid"><tr>{cells}</tr></table>'


def _trust_page() -> str:
    return """
<div class="page-break">
  <span class="section-label">Methodiek &amp; interpretatiegrenzen</span>
  <div class="card" style="margin-bottom:14px;">
    <p style="font-size:10px;color:#374151;">
      Loep-output is een gegroepeerde managementsamenvatting op groepsniveau.
      Het rapport is bedoeld als startpunt voor verificatie, gesprek en prioritering —
      niet als sluitend bewijs van oorzaak, diagnose of individuele beoordeling.
    </p>
  </div>
  <table class="trust-grid"><tr>
    <td class="trust-cell">
      <div class="trust-title">Groepsniveau</div>
      <div class="trust-body">
        Alle uitkomsten zijn groepsgemiddelden. Er zijn geen individuele scores,
        namen of herleidbare gegevens opgenomen.
      </div>
    </td>
    <td class="trust-cell">
      <div class="trust-title">n-grenzen</div>
      <div class="trust-body">
        Indicatief beeld: 5+ responses.<br>
        Patroonlaag actief: 10+ responses.<br>
        Segmenten zichtbaar: 5+ per segment.<br>
        Onder drempel: sectie niet getoond.
      </div>
    </td>
    <td class="trust-cell">
      <div class="trust-title">Geen diagnose</div>
      <div class="trust-body">
        Loep stelt geen diagnose, doet geen causale claims en produceert
        geen voorspellingen. Scores zijn indicatief en methodisch
        verdedigbaar, maar niet extern gevalideerd.
      </div>
    </td>
  </tr></table>
  <table class="trust-grid" style="margin-top:8px;"><tr>
    <td class="trust-cell">
      <div class="trust-title">Open tekst</div>
      <div class="trust-body">
        Open antwoorden zijn geanonimiseerd (namen, e-mail, telefoon, postcodes
        verwijderd). Thema&rsquo;s en quotes worden alleen getoond bij voldoende n.
      </div>
    </td>
    <td class="trust-cell">
      <div class="trust-title">Claimgrens</div>
      <div class="trust-body">
        Vermeld altijd n en leessterkte bij interne presentatie.
        Gebruik output als eerste toetsingsvraag, niet als definitieve uitkomst.
      </div>
    </td>
    <td class="trust-cell">
      <div class="trust-title">Privacywaarborg</div>
      <div class="trust-body">
        Verwerking conform AVG. Individuele antwoorden zijn niet
        herleidbaar. Rapport is uitsluitend voor geautoriseerde gebruikers.
      </div>
    </td>
  </tr></table>
</div>"""


def _segment_fallback() -> str:
    return """
<div class="page-break section">
  <span class="section-label">Segmentanalyse</span>
  <div class="empty-state" style="padding:24px;">
    <strong style="font-size:10px;color:#64748B;">Segmentduiding niet beschikbaar</strong><br><br>
    Segmentresultaten worden alleen getoond bij minimaal 5 responses per segment
    (functieniveau, afdeling). Voor deze meetronde is de grens nog niet bereikt.
  </div>
</div>"""


# ─── Data builder ─────────────────────────────────────────────────────────────

def build_report_data(campaign_id: str, db: Session) -> dict[str, Any]:
    """
    Bouwt het data-object voor alle scantypes.
    Retourneert een clean dict zonder ReportLab-afhankelijkheden.
    """
    camp: Campaign = (
        db.query(Campaign)
        .options(
            joinedload(Campaign.organization),
            selectinload(Campaign.respondents).selectinload(Respondent.response),
        )
        .filter(Campaign.id == campaign_id)
        .first()
    )
    if not camp:
        raise ValueError(f"Campaign niet gevonden: {campaign_id}")

    org = camp.organization
    scan_type = camp.scan_type
    scan_meta = get_scan_definition(scan_type)
    product_module = get_product_module(scan_type)

    _mode = (camp.delivery_mode or "baseline").lower()
    _mode_lbl = "Live" if _mode == "live" else "Baseline"
    scan_lbl = scan_meta.get(
        "report_title",
        f"ExitScan {_mode_lbl}" if scan_type == "exit" else scan_meta["product_name"],
    )
    now_str = datetime.now(timezone.utc).strftime("%d-%m-%Y")

    # ── Respondenten ──────────────────────────────────────────────────────────
    respondents = camp.respondents
    completed = [r for r in respondents if r.completed and r.response]
    responses: list[SurveyResponse] = [r.response for r in completed if r.response]

    n_invited = len(respondents)
    n_completed = len(responses)
    completion = round(n_completed / n_invited * 100, 1) if n_invited else 0.0

    # ── Scores ────────────────────────────────────────────────────────────────
    risk_scores = [r.risk_score for r in responses if r.risk_score is not None]
    avg_risk = round(sum(risk_scores) / len(risk_scores), 2) if risk_scores else None

    engagement_scores = [r.uwes_score for r in responses if r.uwes_score is not None]
    avg_engagement = round(sum(engagement_scores) / len(engagement_scores), 2) if engagement_scores else None

    turnover_scores = [r.turnover_intention_score for r in responses if r.turnover_intention_score is not None]
    avg_turnover_intention = round(sum(turnover_scores) / len(turnover_scores), 2) if turnover_scores else None

    stay_raw = [
        round((float(r.stay_intent_score) - 1) / 4 * 9 + 1, 2)
        for r in responses if r.stay_intent_score is not None
    ]
    avg_stay_intent = round(sum(stay_raw) / len(stay_raw), 2) if stay_raw else None

    band_counts: dict[str, int] = {"HOOG": 0, "MIDDEN": 0, "LAAG": 0}
    for r in responses:
        if r.risk_band in band_counts:
            band_counts[r.risk_band] += 1

    # ── Patroonanalyse ────────────────────────────────────────────────────────
    pattern_input = [
        {
            "org_scores": r.response.org_scores,
            "sdt_scores": r.response.sdt_scores,
            "risk_score": r.response.risk_score,
            "signal_score": r.response.risk_score,
            "preventability": r.response.preventability,
            "exit_reason_code": r.response.exit_reason_code,
            "stay_intent_score": r.response.stay_intent_score,
            "direction_signal_score": r.response.stay_intent_score,
            "contributing_reason_codes": list((r.response.pull_factors_raw or {}).keys()),
            "department": r.department,
            "role_level": r.role_level,
        }
        for r in completed
    ]
    pattern = detect_patterns(pattern_input)
    has_pattern = pattern.get("sufficient_data", False)
    factor_avgs: dict[str, float] = pattern.get("factor_averages", {}) if has_pattern else {}
    top_risks: list[tuple[str, float]] = pattern.get("top_risk_factors", []) if has_pattern else []
    strong_work_signal_pct = pattern.get("strong_work_signal_pct") if has_pattern else None
    top_exit_reason_label = (
        pattern.get("top_exit_reasons", [{}])[0].get("label")
        if has_pattern and pattern.get("top_exit_reasons") else None
    )
    top_contributing_reason_label = (
        pattern.get("top_contributing_reasons", [{}])[0].get("label")
        if has_pattern and pattern.get("top_contributing_reasons") else None
    )
    top_factor_keys = [f for f, _ in top_risks[:2]]
    top_factor_labels = [FACTOR_LABELS_NL.get(f, f) for f in top_factor_keys]

    # ── Signaalzichtbaarheid (exit) ───────────────────────────────────────────
    signal_visibility_average: float | None = None
    if scan_type == "exit":
        vis_scores = [
            s.get("signal_visibility_score")
            for s in (
                ((r.full_result or {}).get("exit_context_summary") or {})
                for r in responses
            )
            if isinstance(s.get("signal_visibility_score"), (int, float))
        ]
        if vis_scores:
            signal_visibility_average = sum(vis_scores) / len(vis_scores)

    # ── SDT ──────────────────────────────────────────────────────────────────
    sdt_avgs: dict[str, float] = {}
    for dim in ("autonomy", "competence", "relatedness"):
        if dim in factor_avgs:
            sdt_avgs[dim] = factor_avgs[dim]
        else:
            vals = [
                r.sdt_scores.get(dim) for r in responses
                if r.sdt_scores and r.sdt_scores.get(dim) is not None
            ]
            if vals:
                sdt_avgs[dim] = round(sum(vals) / len(vals), 2)

    # ── Vertrekredenen ────────────────────────────────────────────────────────
    exit_reason_counts = Counter(r.exit_reason_code for r in responses if r.exit_reason_code)
    exit_reason_dist = [
        {"code": code, "label": EXIT_REASON_LABELS_NL.get(code, code), "count": count}
        for code, count in exit_reason_counts.most_common(5)
    ]

    contrib_counts: Counter = Counter()
    for r in responses:
        for k in (r.pull_factors_raw or {}).keys():
            contrib_counts[k] += 1
    contributing_reason_dist = [
        {"code": code, "label": EXIT_REASON_LABELS_NL.get(code, code), "count": count}
        for code, count in contrib_counts.most_common(5)
    ]

    # ── Open tekst (geanonimiseerd) ───────────────────────────────────────────
    raw_texts = [r.open_text_raw for r in responses if r.open_text_raw and r.open_text_raw.strip()]
    open_texts = [anonymize_text(t) for t in raw_texts] if raw_texts else []

    # ── Retentiesignaal ───────────────────────────────────────────────────────
    is_retention = scan_type == "retention"
    retention_signal_profile: str | None = None
    if is_retention and avg_risk is not None:
        retention_signal_profile = compute_retention_signal_profile(
            risk_score=avg_risk,
            engagement_score=avg_engagement,
            turnover_intention_score=avg_turnover_intention,
            stay_intent_score=avg_stay_intent,
        )

    # ── Playbooks ─────────────────────────────────────────────────────────────
    from backend.report import _build_exit_playbook_rows, _build_retention_playbook_rows

    exit_playbooks: list[dict] = (
        _build_exit_playbook_rows(top_risks=top_risks)
        if scan_type == "exit" and has_pattern else []
    )
    retention_playbooks: list[dict] = (
        _build_retention_playbook_rows(
            top_risks=top_risks,
            playbooks=product_module.get_action_playbooks_payload(),
        )
        if is_retention and has_pattern and hasattr(product_module, "get_action_playbooks_payload")
        else []
    )

    # ── Management summary + next steps ───────────────────────────────────────
    if is_retention:
        management_summary_payload = product_module.get_management_summary_payload(
            top_factor_labels=top_factor_labels,
            top_factor_keys=top_factor_keys,
            retention_signal_profile=retention_signal_profile,
            avg_engagement=avg_engagement,
            avg_turnover_intention=avg_turnover_intention,
            avg_stay_intent=avg_stay_intent,
            retention_theme_title=None,
            enps_summary=None,
        )
    elif scan_type == "onboarding":
        management_summary_payload = product_module.get_management_summary_payload(
            top_factor_labels=top_factor_labels,
            top_factor_keys=top_factor_keys,
            avg_stay_intent=avg_stay_intent,
            top_exit_reason_label=top_exit_reason_label,
            top_contributing_reason_label=top_contributing_reason_label,
            strong_work_signal_pct=strong_work_signal_pct,
            signal_visibility_average=signal_visibility_average,
            total_replacement_cost_eur=None,
        )
    else:
        management_summary_payload = product_module.get_management_summary_payload(
            top_factor_labels=top_factor_labels,
            top_factor_keys=top_factor_keys,
            top_exit_reason_label=top_exit_reason_label,
            top_contributing_reason_label=top_contributing_reason_label,
            strong_work_signal_pct=strong_work_signal_pct,
            signal_visibility_average=signal_visibility_average,
            enps_summary=None,
            total_replacement_cost_eur=None,
        )

    next_steps_payload = product_module.get_next_steps_payload(
        top_focus_labels=top_factor_labels,
        top_focus_keys=top_factor_keys,
    )

    # ── Factor items (uit scan definitie) ─────────────────────────────────────
    org_sections: list[dict] = scan_meta.get("org_sections", [])
    factor_items_map: dict[str, list[str]] = {
        sec["key"]: [item[1] for item in sec["items"]]
        for sec in org_sections
        if "key" in sec and "items" in sec
    }

    return {
        "campaign_id": campaign_id,
        "scan_type": scan_type,
        "scan_lbl": scan_lbl,
        "org_name": org.name if org else "",
        "campaign_name": camp.name,
        "generated_at": now_str,
        "delivery_mode": _mode_lbl,
        "n_invited": n_invited,
        "n_completed": n_completed,
        "completion_pct": completion,
        "avg_risk": avg_risk,
        "avg_engagement": avg_engagement,
        "avg_turnover_intention": avg_turnover_intention,
        "avg_stay_intent": avg_stay_intent,
        "band_counts": band_counts,
        "has_pattern": has_pattern,
        "factor_avgs": factor_avgs,
        "factor_items_map": factor_items_map,
        "top_risks": top_risks,
        "top_factor_keys": top_factor_keys,
        "top_factor_labels": top_factor_labels,
        "strong_work_signal_pct": strong_work_signal_pct,
        "top_exit_reason_label": top_exit_reason_label,
        "top_contributing_reason_label": top_contributing_reason_label,
        "signal_visibility_average": signal_visibility_average,
        "sdt_avgs": sdt_avgs,
        "exit_reason_dist": exit_reason_dist,
        "contributing_reason_dist": contributing_reason_dist,
        "open_texts": open_texts,
        "retention_signal_profile": retention_signal_profile,
        "exit_playbooks": exit_playbooks,
        "retention_playbooks": retention_playbooks,
        "management_summary_payload": management_summary_payload,
        "next_steps_payload": next_steps_payload,
    }


# ─── ExitScan renderer ────────────────────────────────────────────────────────

def render_exit_report_html(data: dict[str, Any]) -> str:
    avg_risk = data["avg_risk"]
    band = _score_band(avg_risk) if avg_risk is not None else None
    band_color = _band_color(band) if band else "#94A3B8"
    band_lbl = _band_label(band) if band else "—"
    risk_display = f"{avg_risk:.1f}/10" if avg_risk is not None else "—"
    n = data["n_completed"]
    top_labels = data["top_factor_labels"]

    # Sorted factors: top = highest risk (lowest score), bottom = lowest risk
    factor_avgs = data["factor_avgs"]
    sorted_factors = sorted(
        [(fk, factor_avgs.get(fk)) for fk in ORG_FACTOR_KEYS if factor_avgs.get(fk) is not None],
        key=lambda x: x[1],  # ascending score = descending risk
    )
    bottom_2 = [fk for fk, _ in sorted_factors[:2]]   # lowest scores = highest risk
    top_2    = [fk for fk, _ in sorted_factors[-2:]]  # highest scores = lowest risk
    factor_items_map = data["factor_items_map"]

    msp = data["management_summary_payload"] or {}
    executive_intro = msp.get("executive_intro", "")

    # ── 1. Cover ──────────────────────────────────────────────────────────────
    cover_html = _cover(data["scan_lbl"], data["org_name"], data["campaign_name"],
                        data["generated_at"], n, data["delivery_mode"])

    # ── 2. Executive at-a-glance ──────────────────────────────────────────────
    stat_cards = [
        {"title": "Frictiescore", "value": risk_display,
         "body": "Gemiddelde over alle respondenten (1–10)."},
        {"title": "Signaal", "value": band_lbl,
         "body": "Indicatieve duiding op groepsniveau."},
        {"title": "Respons", "value": f"{n} / {data['n_invited']}",
         "body": f"{data['completion_pct']}% ingevuld."},
        {"title": "Eerste aandachtspunt",
         "value": top_labels[0] if top_labels else "—",
         "body": "Factor met hoogste frictiebijdrage."},
    ]
    atglance_html = f"""
<div class="page-break section">
  <span class="section-label">Executive at-a-glance</span>
  <div class="card card-accent" style="margin-bottom:12px;">
    <div style="margin-bottom:8px;">
      <span class="score-large" style="color:{band_color};">{risk_display}</span>
      <span class="score-band-badge" style="background:{band_color};">{_h(band_lbl)}</span>
    </div>
    {"<p style='font-size:10px;color:#374151;'>" + _h(executive_intro) + "</p>" if executive_intro else ""}
    <p style="margin-top:6px;font-size:9.5px;color:#64748B;">
      Scherpste factoren: <strong>{_h(" &amp; ".join(top_labels) if top_labels else "—")}</strong>
      {"&nbsp;&bull;&nbsp;Meest genoemde reden: <strong>" + _h(data["top_exit_reason_label"]) + "</strong>" if data.get("top_exit_reason_label") else ""}
    </p>
  </div>
  {_stat_grid(stat_cards)}
</div>"""

    # ── 3. Responsbasis & leessterkte ─────────────────────────────────────────
    bc = data["band_counts"]
    leessterkte = "Indicatief" if n < 10 else "Stevig" if n >= 20 else "Opbouwend"
    respons_html = f"""
<div class="section">
  <span class="section-label">Responsbasis &amp; leessterkte</span>
  <div class="two-col">
    <div class="col-left">
      <div class="card">
        <div style="margin-bottom:8px;">
          <strong style="font-size:11px;">Uitgenodigd:</strong> {data['n_invited']}&nbsp;&nbsp;
          <strong style="font-size:11px;">Ingevuld:</strong> {n}&nbsp;&nbsp;
          <strong style="font-size:11px;">Respons:</strong> {data['completion_pct']}%
        </div>
        <div style="font-size:9px;color:#64748B;">
          Leessterkte: <strong>{leessterkte}</strong> &bull;
          Patroonlaag {"actief" if n >= 10 else "nog niet actief (min. 10)"} &bull;
          Segmenten {"zichtbaar bij 5+ per groep" if n >= 10 else "niet beschikbaar"}
        </div>
      </div>
    </div>
    <div class="col-right">
      <div class="card">
        <div class="stat-label" style="margin-bottom:6px;">Verdeling frictieband</div>
        {_reason_bar("Vraagt aandacht (hoog)", bc.get("HOOG",0), n, "#EF4444")}
        {_reason_bar("Eerst toetsen (midden)", bc.get("MIDDEN",0), n, "#F59E0B")}
        {_reason_bar("Relatief sterk (laag)", bc.get("LAAG",0), n, "#22C55E")}
      </div>
    </div>
  </div>
</div>"""

    # ── 4. Vertrekcontext ─────────────────────────────────────────────────────
    exit_reasons = data.get("exit_reason_dist", [])
    contrib_reasons = data.get("contributing_reason_dist", [])
    sv = data.get("signal_visibility_average")

    if sv is not None:
        if sv >= 4:
            sv_label = "Signalen waren zichtbaar"
            sv_color = "#22C55E"
        elif sv >= 3:
            sv_label = "Signalen waren deels zichtbaar"
            sv_color = "#F59E0B"
        else:
            sv_label = "Signalen bleven onder de radar"
            sv_color = "#EF4444"
    else:
        sv_label = sv_color = None

    exit_bars = "".join(
        _reason_bar(r["label"], r["count"], n, "#1E293B")
        for r in exit_reasons
    ) if exit_reasons else '<div class="empty-state">Geen vertrekredenen geregistreerd</div>'

    contrib_bars = "".join(
        _reason_bar(r["label"], r["count"], n, "#475569")
        for r in contrib_reasons
    ) if contrib_reasons else '<div class="empty-state">Geen meespelende redenen geregistreerd</div>'

    vertrekcontext_html = f"""
<div class="section page-break">
  <span class="section-label">Vertrekcontext</span>
  <div class="two-col">
    <div class="col-left">
      <div class="card">
        <h3 style="margin-bottom:8px;">Hoofdredenen van vertrek</h3>
        <p style="font-size:9px;color:#64748B;margin-bottom:8px;">
          Wat respondenten als primaire reden noemden. Lees als vertrekcontext, niet als causale verklaring.
        </p>
        {exit_bars}
      </div>
    </div>
    <div class="col-right">
      <div class="card">
        <h3 style="margin-bottom:8px;">Meespelende factoren</h3>
        <p style="font-size:9px;color:#64748B;margin-bottom:8px;">
          Factoren die naast de hoofdreden meespeelden. Geeft breedte van het vertrekverhaalt.
        </p>
        {contrib_bars}
      </div>
      {f"""<div class="card" style="margin-top:8px;">
        <div style="font-size:10px;font-weight:700;color:{sv_color};margin-bottom:4px;">{_h(sv_label)}</div>
        <div style="font-size:9px;color:#64748B;">Eerdere signalering: {sv:.1f}/5 &mdash; geeft aan of twijfel of vertrek al zichtbaar of bespreekbaar was.</div>
      </div>""" if sv_label else ""}
    </div>
  </div>
</div>"""

    # ── 5. Factor landscape ───────────────────────────────────────────────────
    factors_sorted_desc = list(reversed(sorted_factors))  # hoog risico eerst
    factor_bars_html = ""
    for fk, score in factors_sorted_desc:
        highlight = "bottom" if fk in bottom_2 else "top" if fk in top_2 else None
        items = factor_items_map.get(fk, [])
        factor_bars_html += _factor_bar_row(fk, score, items=items, highlight=highlight)

    strengths = [FACTOR_LABELS_NL.get(fk, fk) for fk in top_2]
    attention = [FACTOR_LABELS_NL.get(fk, fk) for fk in bottom_2]

    factor_html = f"""
<div class="section page-break">
  <span class="section-label">Factoranalyse</span>
  <div class="two-col" style="margin-bottom:10px;">
    <div class="col-left">
      <div class="card" style="border-left:3px solid #EF4444;">
        <div style="font-size:9px;font-weight:700;color:#EF4444;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:4px;">Vraagt eerst aandacht</div>
        <div style="font-size:10.5px;font-weight:600;color:#243247;">{_h(" · ".join(attention)) if attention else "—"}</div>
      </div>
    </div>
    <div class="col-right">
      <div class="card" style="border-left:3px solid #22C55E;">
        <div style="font-size:9px;font-weight:700;color:#22C55E;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:4px;">Relatief sterk</div>
        <div style="font-size:10.5px;font-weight:600;color:#243247;">{_h(" · ".join(strengths)) if strengths else "—"}</div>
      </div>
    </div>
  </div>
  <div class="card">
    <p style="font-size:9px;color:#64748B;margin-bottom:10px;">
      Score 1–10 (hoger = minder frictie). Kleur geeft indicatieve band: rood = eerst toetsen, geel = gemengd beeld, groen = relatief sterk.
      Gearceerde rijen: meest opvallende uitschieters in dit beeld.
    </p>
    {factor_bars_html}
  </div>
</div>"""

    # ── 6. SDT Basisbehoeften ─────────────────────────────────────────────────
    sdt_avgs = data.get("sdt_avgs", {})
    sdt_html = f"""
<div class="section page-break">
  <span class="section-label">Werkbeleving — SDT Basisbehoeften</span>
  <div class="card">
    <p style="font-size:9px;color:#64748B;margin-bottom:10px;">
      De drie basisbehoeften (SDT: Self-Determination Theory) meten ervaren autonomie,
      competentiegevoel en verbondenheid. Ze geven de onderliggende werkbeleving weer,
      los van de organisatiefactoren.
    </p>
    {_sdt_bar("autonomy", sdt_avgs.get("autonomy"))}
    {_sdt_bar("competence", sdt_avgs.get("competence"))}
    {_sdt_bar("relatedness", sdt_avgs.get("relatedness"))}
  </div>
</div>"""

    # ── 7. Survey-stemmen / open tekst ────────────────────────────────────────
    open_texts = data.get("open_texts", [])
    n_texts = len(open_texts)
    if n_texts >= MIN_OPEN_TEXT_N:
        quotes_html = "".join(
            f'<div class="quote-card">{_h(t)}<div class="quote-anon">Geanonimiseerd — namen, contactgegevens en locaties verwijderd</div></div>'
            for t in open_texts[:MAX_QUOTES]
        )
        open_html = f"""
<div class="section page-break">
  <span class="section-label">Survey-stemmen ({n_texts} open antwoorden)</span>
  <div class="card" style="margin-bottom:10px;">
    <p style="font-size:9px;color:#64748B;">
      Geanonimiseerde uitspraken. Gebruik als kwalitatieve verificatielaag —
      niet als representatief bewijs. Getoond: {min(n_texts, MAX_QUOTES)} van {n_texts} antwoorden.
    </p>
  </div>
  {quotes_html}
</div>"""
    else:
        open_html = f"""
<div class="section page-break">
  <span class="section-label">Survey-stemmen</span>
  <div class="empty-state">
    Open antwoorden worden getoond bij minimaal {MIN_OPEN_TEXT_N} ingevulde teksten
    (ter bescherming van anonimiteit). Huidig aantal: {n_texts}.
  </div>
</div>"""

    # ── 8. Managementduiding ──────────────────────────────────────────────────
    playbooks_html = (
        "".join(_playbook_card(row) for row in data["exit_playbooks"])
        if data["exit_playbooks"]
        else '<div class="empty-state">Managementduiding beschikbaar bij voldoende responses met risicopatroon.</div>'
    )
    duiding_html = f"""
<div class="section page-break">
  <span class="section-label">Managementduiding</span>
  <div class="card" style="margin-bottom:12px;background:#FFFBEB;border-color:#FDE68A;">
    <p style="font-size:9px;color:#92400E;">
      <strong>Leesgrens:</strong> Onderstaande duiding is afgeleid uit scorepatronen en vertrekredenen.
      Gebruik het als eerste verificatiespoor — niet als definitieve diagnose.
      Toets altijd met direct betrokken managers en HR voordat conclusies worden getrokken.
    </p>
  </div>
  {playbooks_html}
</div>"""

    # ── 9. Bestuurlijke handoff ───────────────────────────────────────────────
    nsp = data["next_steps_payload"]
    handoff_html = f"""
<div class="section page-break">
  <span class="section-label">Bestuurlijke handoff &amp; vervolgrichting</span>
  <div class="card" style="margin-bottom:12px;">
    <p style="font-size:10px;color:#374151;">
      {_h(nsp.get("intro_text", ""))}
    </p>
  </div>
  {_follow_up_cards(nsp)}
  <div class="card" style="margin-top:12px;background:#F8FAFC;border-color:#E2E8F0;">
    <p style="font-size:9px;color:#475569;">
      <strong>Eerste stap:</strong> Kies één verificatiespoor en bleg eigenaar,
      eerste stap en reviewmoment vast — vóórdat bredere interventies worden gestart.
    </p>
  </div>
</div>"""

    # ── 10. Segment fallback ──────────────────────────────────────────────────
    segment_html = _segment_fallback()

    # ── 11. Trust/methodiek ───────────────────────────────────────────────────
    trust_html = _trust_page()

    body = f"""
{cover_html}
{atglance_html}
{respons_html}
{vertrekcontext_html}
{factor_html}
{sdt_html}
{open_html}
{duiding_html}
{handoff_html}
{segment_html}
{trust_html}
"""
    return _html_doc(f"ExitScan — {data['campaign_name']}", body)


# ─── RetentionScan renderer ───────────────────────────────────────────────────

def render_retention_report_html(data: dict[str, Any]) -> str:
    avg_risk = data["avg_risk"]
    retention_profile = data["retention_signal_profile"] or "—"
    profile_color = _band_color(retention_profile) if retention_profile in ("HOOG", "MIDDEN", "LAAG") else "#94A3B8"
    profile_lbl = _band_label(retention_profile) if retention_profile in ("HOOG", "MIDDEN", "LAAG") else retention_profile
    risk_display = f"{avg_risk:.1f}/10" if avg_risk is not None else "—"
    avg_engagement = data["avg_engagement"]
    avg_turnover = data["avg_turnover_intention"]
    n = data["n_completed"]
    top_labels = data["top_factor_labels"]

    factor_avgs = data["factor_avgs"]
    sorted_factors = sorted(
        [(fk, factor_avgs.get(fk)) for fk in ORG_FACTOR_KEYS if factor_avgs.get(fk) is not None],
        key=lambda x: x[1],
    )
    bottom_2 = [fk for fk, _ in sorted_factors[:2]]
    top_2    = [fk for fk, _ in sorted_factors[-2:]]
    factor_items_map = data["factor_items_map"]

    msp = data["management_summary_payload"] or {}
    executive_intro = msp.get("executive_intro", "")

    cover_html = _cover(data["scan_lbl"], data["org_name"], data["campaign_name"],
                        data["generated_at"], n, data["delivery_mode"])

    stat_cards = [
        {"title": "Retentiesignaal", "value": profile_lbl, "body": "Indicatieve signaalduiding."},
        {"title": "Gem. retentiescore", "value": risk_display, "body": "1–10, hoger = meer frictie."},
        {"title": "Bevlogenheid (UWES)", "value": f"{avg_engagement:.1f}/10" if avg_engagement else "—", "body": "Gemiddelde UWES-score."},
        {"title": "Vertrekintentie", "value": f"{avg_turnover:.1f}/10" if avg_turnover else "—", "body": "Gemiddelde vertrekintentie."},
    ]

    factors_sorted_desc = list(reversed(sorted_factors))
    factor_bars_html = "".join(
        _factor_bar_row(fk, score, items=factor_items_map.get(fk, []),
                        highlight="bottom" if fk in bottom_2 else "top" if fk in top_2 else None)
        for fk, score in factors_sorted_desc
    )
    sdt_avgs = data.get("sdt_avgs", {})

    open_texts = data.get("open_texts", [])
    n_texts = len(open_texts)
    if n_texts >= MIN_OPEN_TEXT_N:
        quotes_html = "".join(
            f'<div class="quote-card">{_h(t)}<div class="quote-anon">Geanonimiseerd</div></div>'
            for t in open_texts[:MAX_QUOTES]
        )
        open_html = f'<div class="section page-break"><span class="section-label">Survey-stemmen ({n_texts})</span>{quotes_html}</div>'
    else:
        open_html = f'<div class="section page-break"><span class="section-label">Survey-stemmen</span><div class="empty-state">Minimaal {MIN_OPEN_TEXT_N} teksten vereist. Huidig: {n_texts}.</div></div>'

    playbooks_html = (
        "".join(_playbook_card(row) for row in data["retention_playbooks"])
        if data["retention_playbooks"]
        else '<div class="empty-state">Behoudsplaybooks beschikbaar bij voldoende risicopatroon.</div>'
    )

    body = f"""
{cover_html}
<div class="page-break section">
  <span class="section-label">Executive at-a-glance</span>
  <div class="card card-accent" style="margin-bottom:12px;">
    <div style="margin-bottom:8px;">
      <span style="font-size:24px;font-weight:700;color:{profile_color};">{_h(profile_lbl)}</span>
      <span style="font-size:13px;font-weight:700;color:#243247;margin-left:12px;">{risk_display}</span>
      <span style="font-size:10px;color:#64748B;margin-left:4px;">retentiescore</span>
    </div>
    {"<p style='font-size:10px;'>" + _h(executive_intro) + "</p>" if executive_intro else ""}
    <p style="font-size:9.5px;color:#64748B;margin-top:6px;">Scherpste factoren: <strong>{_h(" &amp; ".join(top_labels))}</strong></p>
  </div>
  {_stat_grid(stat_cards)}
</div>

<div class="section page-break">
  <span class="section-label">Factoranalyse</span>
  <div class="card">{factor_bars_html}</div>
</div>

<div class="section page-break">
  <span class="section-label">Werkbeleving — SDT</span>
  <div class="card">
    {_sdt_bar("autonomy", sdt_avgs.get("autonomy"))}
    {_sdt_bar("competence", sdt_avgs.get("competence"))}
    {_sdt_bar("relatedness", sdt_avgs.get("relatedness"))}
  </div>
</div>

{open_html}

<div class="section page-break">
  <span class="section-label">Behoudsplaybooks</span>
  {playbooks_html}
</div>

<div class="section page-break">
  <span class="section-label">Bestuurlijke handoff</span>
  <div class="card" style="margin-bottom:10px;"><p style="font-size:10px;">{_h(data["next_steps_payload"].get("intro_text",""))}</p></div>
  {_follow_up_cards(data["next_steps_payload"])}
</div>

{_segment_fallback()}
{_trust_page()}
"""
    return _html_doc(f"RetentionScan — {data['campaign_name']}", body)


# ─── OnboardingScan renderer ──────────────────────────────────────────────────

def render_onboarding_report_html(data: dict[str, Any]) -> str:
    avg_risk = data["avg_risk"]
    risk_display = f"{avg_risk:.1f}/10" if avg_risk is not None else "—"
    band = _score_band(avg_risk) if avg_risk is not None else None
    band_color = _band_color(band) if band else "#94A3B8"
    band_lbl = _band_label(band) if band else "—"
    n = data["n_completed"]
    top_labels = data["top_factor_labels"]

    factor_avgs = data["factor_avgs"]
    sorted_factors = sorted(
        [(fk, factor_avgs.get(fk)) for fk in ORG_FACTOR_KEYS if factor_avgs.get(fk) is not None],
        key=lambda x: x[1],
    )
    factor_items_map = data["factor_items_map"]
    bottom_2 = [fk for fk, _ in sorted_factors[:2]]
    top_2    = [fk for fk, _ in sorted_factors[-2:]]
    factors_sorted_desc = list(reversed(sorted_factors))

    stat_cards = [
        {"title": "Uitgenodigd", "value": str(data["n_invited"]), "body": "Medewerkers voor dit checkpoint."},
        {"title": "Ingevuld", "value": str(n), "body": "Responses in dit beeld."},
        {"title": "Respons", "value": f"{data['completion_pct']}%", "body": "Aandeel voltooide responses."},
        {"title": "Onboardingsignaal", "value": risk_display, "body": f"Indicatief beeld: {band_lbl}"},
    ]

    open_texts = data.get("open_texts", [])
    n_texts = len(open_texts)
    open_html = (
        "".join(f'<div class="quote-card">{_h(t)}<div class="quote-anon">Geanonimiseerd</div></div>' for t in open_texts[:MAX_QUOTES])
        if n_texts >= MIN_OPEN_TEXT_N
        else f'<div class="empty-state">Minimaal {MIN_OPEN_TEXT_N} teksten vereist. Huidig: {n_texts}.</div>'
    )

    body = f"""
{_cover(data["scan_lbl"], data["org_name"], data["campaign_name"],
        data["generated_at"], n, data["delivery_mode"])}

<div class="page-break section">
  <span class="section-label">Executive at-a-glance</span>
  <div class="card card-accent" style="margin-bottom:12px;">
    <span class="score-large" style="color:{band_color};">{risk_display}</span>
    <span class="score-band-badge" style="background:{band_color};">{_h(band_lbl)}</span>
    <p style="font-size:9.5px;color:#64748B;margin-top:8px;">Eerste aandachtspunten: <strong>{_h(" &amp; ".join(top_labels) if top_labels else "—")}</strong></p>
  </div>
  {_stat_grid(stat_cards)}
</div>

<div class="section page-break">
  <span class="section-label">Factoranalyse — Onboardingmodules</span>
  <div class="card">
    {"".join(_factor_bar_row(fk, score, items=factor_items_map.get(fk,[]),
       highlight="bottom" if fk in bottom_2 else "top" if fk in top_2 else None)
       for fk, score in factors_sorted_desc)}
  </div>
</div>

<div class="section page-break">
  <span class="section-label">Survey-stemmen</span>
  {open_html}
</div>

<div class="section page-break">
  <span class="section-label">Bestuurlijke handoff</span>
  <div class="card" style="margin-bottom:10px;"><p style="font-size:10px;">{_h(data["next_steps_payload"].get("intro_text",""))}</p></div>
  {_follow_up_cards(data["next_steps_payload"])}
</div>

{_segment_fallback()}
{_trust_page()}
"""
    return _html_doc(f"Onboarding — {data['campaign_name']}", body)


# ─── Dispatcher ───────────────────────────────────────────────────────────────

def render_report_html(data: dict[str, Any]) -> str:
    scan_type = data.get("scan_type", "exit")
    if scan_type == "retention":
        return render_retention_report_html(data)
    if scan_type == "onboarding":
        return render_onboarding_report_html(data)
    return render_exit_report_html(data)


# ─── PDF generator ────────────────────────────────────────────────────────────

def generate_campaign_report_html(campaign_id: str, db: Session) -> bytes:
    from weasyprint import HTML
    data = build_report_data(campaign_id, db)
    html_str = render_report_html(data)
    return HTML(string=html_str).write_pdf()
