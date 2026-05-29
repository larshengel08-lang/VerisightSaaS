"""
Loep — HTML→PDF rapportgenerator (WeasyPrint)
==============================================
Parallel pad naast report.py (ReportLab). report.py blijft onaangeroerd.

Gebruik
-------
    from backend.report_html import generate_campaign_report_html
    pdf_bytes = generate_campaign_report_html(campaign_id, db)

    from backend.report_html import render_exit_report_html, build_report_data
    html_str = render_exit_report_html(build_report_data(campaign_id, db))
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session, joinedload, selectinload

from backend.models import Campaign, Respondent, SurveyResponse
from backend.products.shared.registry import get_product_module
from backend.scan_definitions import get_scan_definition
from backend.scoring import (
    ORG_FACTOR_KEYS,
    compute_retention_signal_profile,
    detect_patterns,
)
from backend.scoring_config import (
    FACTOR_LABELS_NL,
    RISK_HIGH,
    RISK_MEDIUM,
)


# ─── Risk-band helpers ────────────────────────────────────────────────────────

def _risk_band(risk_value: float) -> str:
    if risk_value >= RISK_HIGH:
        return "HOOG"
    if risk_value >= RISK_MEDIUM:
        return "MIDDEN"
    return "LAAG"


def _band_color(band: str) -> str:
    return {"HOOG": "#EF4444", "MIDDEN": "#F59E0B", "LAAG": "#22C55E"}.get(band, "#94A3B8")


def _band_label_nl(band: str) -> str:
    return {"HOOG": "Hoog risico", "MIDDEN": "Middel risico", "LAAG": "Laag risico"}.get(band, band)


# ─── Shared CSS ───────────────────────────────────────────────────────────────

_CSS = """
@page {
  size: A4;
  margin: 20mm 18mm;
  @bottom-center {
    content: "Vertrouwelijk — Loep";
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8px;
    color: #94A3B8;
  }
  @bottom-right {
    content: counter(page) " / " counter(pages);
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8px;
    color: #94A3B8;
  }
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10.5px;
  line-height: 1.6;
  color: #374151;
  background: #F5F0E8;
}

/* ── Typography ── */
h1 {
  font-size: 22px;
  font-weight: 700;
  color: #243247;
}
h2 {
  font-size: 13px;
  font-weight: 600;
  color: #64748B;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
}
h3 {
  font-size: 12px;
  font-weight: 700;
  color: #243247;
  margin-bottom: 4px;
}
p { margin-bottom: 6px; }

/* ── Layout helpers ── */
.page-break { break-before: page; }

.card {
  background: #FFFFFF;
  border: 1px solid #E8E0D0;
  border-radius: 6px;
  padding: 14px 16px;
  margin-bottom: 12px;
}

.cover-page {
  background: #243247;
  min-height: 260mm;
  padding: 40px 36px;
  display: block;
}

.cover-label {
  display: inline-block;
  background: #D19422;
  color: #FFFFFF;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 3px;
  margin-bottom: 20px;
}

.cover-org {
  font-size: 13px;
  color: #94A3B8;
  margin-bottom: 6px;
}

.cover-title {
  font-size: 26px;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8px;
  line-height: 1.3;
}

.cover-date {
  font-size: 10px;
  color: #64748B;
  margin-top: 16px;
}

.metric-grid {
  display: table;
  width: 100%;
  border-collapse: separate;
  border-spacing: 8px 0;
  margin-bottom: 12px;
}
.metric-grid-row { display: table-row; }
.metric-cell {
  display: table-cell;
  background: #FFFFFF;
  border: 1px solid #E8E0D0;
  border-radius: 6px;
  padding: 10px 12px;
  vertical-align: top;
  width: 25%;
}
.metric-title {
  font-size: 9px;
  font-weight: 600;
  color: #64748B;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.metric-value {
  font-size: 18px;
  font-weight: 700;
  color: #243247;
  margin-bottom: 2px;
}
.metric-body {
  font-size: 9px;
  color: #6B7280;
  line-height: 1.4;
}

/* ── Factor bar ── */
.factor-row {
  margin-bottom: 14px;
}
.factor-name {
  font-size: 10.5px;
  font-weight: 600;
  color: #243247;
  margin-bottom: 4px;
}
.bar-wrap {
  display: table;
  width: 100%;
}
.bar-track-cell {
  display: table-cell;
  vertical-align: middle;
  width: 100%;
  padding-right: 8px;
}
.bar-track {
  height: 8px;
  background: #E8E0D0;
  border-radius: 4px;
  overflow: hidden;
}
.bar-fill {
  height: 8px;
  border-radius: 4px;
}
.bar-score-cell {
  display: table-cell;
  vertical-align: middle;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  padding-right: 6px;
}
.bar-band-cell {
  display: table-cell;
  vertical-align: middle;
  white-space: nowrap;
  font-size: 10px;
  font-weight: 600;
}

/* ── Playbook card ── */
.playbook-card {
  background: #FFFFFF;
  border: 1px solid #E8E0D0;
  border-left-width: 4px;
  border-radius: 6px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.playbook-header {
  display: table;
  width: 100%;
  margin-bottom: 8px;
}
.playbook-badge {
  display: table-cell;
  vertical-align: middle;
  padding-right: 8px;
  width: 1%;
  white-space: nowrap;
}
.playbook-badge span {
  display: inline-block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 3px;
  color: #FFFFFF;
}
.playbook-title {
  display: table-cell;
  vertical-align: middle;
  font-size: 11px;
  font-weight: 700;
  color: #243247;
}
.playbook-section-label {
  font-size: 9px;
  font-weight: 600;
  color: #64748B;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-top: 8px;
  margin-bottom: 2px;
}
.action-list {
  margin-left: 14px;
  margin-bottom: 4px;
}
.action-list li {
  margin-bottom: 2px;
}
.caution-box {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 9.5px;
  color: #92400E;
  margin-top: 6px;
}

/* ── Empty state ── */
.empty-state {
  background: #FFFFFF;
  border: 1px solid #E8E0D0;
  border-radius: 6px;
  padding: 20px 16px;
  text-align: center;
  color: #94A3B8;
  font-size: 10px;
}

/* ── Follow-up card ── */
.step-grid {
  display: table;
  width: 100%;
  border-collapse: separate;
  border-spacing: 8px 0;
}
.step-cell {
  display: table-cell;
  background: #FFFFFF;
  border: 1px solid #E8E0D0;
  border-radius: 6px;
  padding: 12px 14px;
  vertical-align: top;
  width: 25%;
}
.step-number {
  font-size: 9px;
  font-weight: 700;
  color: #D19422;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.step-title {
  font-size: 10px;
  font-weight: 700;
  color: #243247;
  margin-bottom: 4px;
}
.step-body {
  font-size: 9.5px;
  color: #374151;
  line-height: 1.5;
}

/* ── Section spacer ── */
.section {
  margin-bottom: 24px;
}
"""


# ─── HTML building blocks ─────────────────────────────────────────────────────

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


def _cover_page(
    scan_label: str,
    org_name: str,
    campaign_name: str,
    generated_at: str,
    n_completed: int,
) -> str:
    return f"""
<div class="cover-page">
  <div class="cover-label">{_h(scan_label)}</div>
  <div class="cover-org">{_h(org_name)}</div>
  <div class="cover-title">{_h(campaign_name)}</div>
  <div style="margin-top:16px;font-size:10px;color:#64748B;">{n_completed} respondenten &bull; Vertrouwelijk</div>
  <div class="cover-date">Gegenereerd op {_h(generated_at)}</div>
</div>"""


def _metric_grid(cards: list[dict[str, str]]) -> str:
    cells = "".join(
        f'<td class="metric-cell">'
        f'<div class="metric-title">{_h(c["title"])}</div>'
        f'<div class="metric-value">{_h(c["value"])}</div>'
        f'<div class="metric-body">{_h(c["body"])}</div>'
        f'</td>'
        for c in cards
    )
    return f'<table class="metric-grid"><tr>{cells}</tr></table>'


def _factor_bar(factor_key: str, score: float | None, factor_avgs: dict) -> str:
    label = FACTOR_LABELS_NL.get(factor_key, factor_key)
    if score is None:
        return (
            f'<div class="factor-row">'
            f'<div class="factor-name">{_h(label)}</div>'
            f'<div class="empty-state" style="text-align:left;padding:6px 10px;font-size:9.5px;">'
            f'Nog onvoldoende respondenten voor dit onderdeel</div>'
            f'</div>'
        )
    risk_val = 11.0 - score
    band = _risk_band(risk_val)
    color = _band_color(band)
    band_lbl = _band_label_nl(band)
    width_pct = min(100.0, max(0.0, score / 10.0 * 100.0))
    return f"""<div class="factor-row">
  <div class="factor-name">{_h(label)}</div>
  <table class="bar-wrap"><tr>
    <td class="bar-track-cell">
      <div class="bar-track">
        <div class="bar-fill" style="width:{width_pct:.1f}%;background:{color};"></div>
      </div>
    </td>
    <td class="bar-score-cell">{score:.1f}</td>
    <td class="bar-band-cell" style="color:{color};">{_h(band_lbl)}</td>
  </tr></table>
</div>"""


def _factor_analysis_section(factor_avgs: dict[str, float], has_pattern: bool) -> str:
    if not has_pattern or not factor_avgs:
        return _empty_state("Nog onvoldoende respondenten voor factoranalyse.")
    bars = "".join(
        _factor_bar(fk, factor_avgs.get(fk), factor_avgs)
        for fk in ORG_FACTOR_KEYS
    )
    return f'<div class="card">{bars}</div>'


def _playbook_card(row: dict[str, Any]) -> str:
    band = row.get("band", "")
    if isinstance(band, str) and band.upper() in ("HOOG", "MIDDEN", "LAAG"):
        band_key = band.upper()
    else:
        band_key = "MIDDEN"
    color = _band_color(band_key)
    label = row.get("label", row.get("factor", ""))
    title = row.get("title", "")
    decision = row.get("decision", "")
    validate = row.get("validate", "")
    owner = row.get("owner") or row.get("owner_basis", "")
    actions: list[str] = row.get("actions", [])
    caution = row.get("caution", "")
    review = row.get("review", "")

    actions_html = "".join(f"<li>{_h(a)}</li>" for a in actions) if actions else ""
    action_block = (
        f'<div class="playbook-section-label">Acties</div>'
        f'<ul class="action-list">{actions_html}</ul>'
        if actions_html else ""
    )
    validate_block = (
        f'<div class="playbook-section-label">Verifieer</div>'
        f'<p>{_h(validate)}</p>'
        if validate else ""
    )
    decision_block = (
        f'<div class="playbook-section-label">Beslispunt</div>'
        f'<p>{_h(decision)}</p>'
        if decision else ""
    )
    owner_block = (
        f'<div class="playbook-section-label">Eigenaar</div>'
        f'<p>{_h(owner)}</p>'
        if owner else ""
    )
    review_block = (
        f'<div class="playbook-section-label">Reviewmoment</div>'
        f'<p>{_h(review)}</p>'
        if review else ""
    )
    caution_block = (
        f'<div class="caution-box">Let op: {_h(caution)}</div>'
        if caution else ""
    )

    return f"""<div class="playbook-card" style="border-left-color:{color};">
  <div class="playbook-header">
    <div class="playbook-badge">
      <span style="background:{color};">{_h(band_key)}</span>
    </div>
    <div class="playbook-title">{_h(label)} &mdash; {_h(title)}</div>
  </div>
  {decision_block}
  {validate_block}
  {action_block}
  {owner_block}
  {review_block}
  {caution_block}
</div>"""


def _follow_up_section(next_steps: dict[str, Any]) -> str:
    cards = next_steps.get("session_cards", [])
    if not cards:
        first_decision = next_steps.get("first_decision", "")
        first_owner = next_steps.get("first_owner", "")
        first_action = next_steps.get("first_action", "")
        review_moment = next_steps.get("review_moment", "")
        cards = [
            {"title": "Beslispunt", "body": first_decision},
            {"title": "Eigenaar", "body": first_owner},
            {"title": "Eerste stap", "body": first_action},
            {"title": "Reviewmoment", "body": review_moment},
        ]
    cells = "".join(
        f'<td class="step-cell">'
        f'<div class="step-number">{_h(c.get("title", ""))}</div>'
        f'<div class="step-body">{_h(c.get("body", ""))}</div>'
        f'</td>'
        for c in cards[:4]
    )
    intro = next_steps.get("intro_text", "")
    intro_html = f'<p style="margin-bottom:12px;">{_h(intro)}</p>' if intro else ""
    return f"""{intro_html}<table class="step-grid"><tr>{cells}</tr></table>"""


def _empty_state(text: str = "Nog onvoldoende respondenten voor dit onderdeel.") -> str:
    return f'<div class="empty-state">{_h(text)}</div>'


def _h(s: Any) -> str:
    """HTML-escape een waarde."""
    if s is None:
        return ""
    from html import escape
    return escape(str(s))


# ─── Data builder ─────────────────────────────────────────────────────────────

def build_report_data(campaign_id: str, db: Session) -> dict[str, Any]:
    """
    Bouwt het data-object op voor alle drie de scantypes.
    Zelfde queries/berekeningen als generate_campaign_report() in report.py,
    maar retourneert een clean dict zonder ReportLab-afhankelijkheden.
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

    now_str = datetime.now(timezone.utc).strftime("%d-%m-%Y %H:%M UTC")

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
        for r in responses
        if r.stay_intent_score is not None
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
        if has_pattern and pattern.get("top_exit_reasons")
        else None
    )
    top_contributing_reason_label = (
        pattern.get("top_contributing_reasons", [{}])[0].get("label")
        if has_pattern and pattern.get("top_contributing_reasons")
        else None
    )

    top_factor_keys = [f for f, _ in top_risks[:2]]
    top_factor_labels = [FACTOR_LABELS_NL.get(f, f) for f in top_factor_keys]

    # ── Signaalzichtbaarheid (exit only) ──────────────────────────────────────
    signal_visibility_average: float | None = None
    if scan_type == "exit":
        vis_scores = [
            summary.get("signal_visibility_score")
            for summary in (
                ((r.full_result or {}).get("exit_context_summary") or {})
                for r in responses
            )
            if isinstance(summary.get("signal_visibility_score"), (int, float))
        ]
        if vis_scores:
            signal_visibility_average = sum(vis_scores) / len(vis_scores)

    # ── Retentie-specifiek ────────────────────────────────────────────────────
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
    from backend.report import (
        _build_exit_playbook_rows,
        _build_retention_playbook_rows,
    )

    exit_playbooks: list[dict] = (
        _build_exit_playbook_rows(top_risks=top_risks)
        if scan_type == "exit" and has_pattern
        else []
    )
    retention_playbooks: list[dict] = (
        _build_retention_playbook_rows(
            top_risks=top_risks,
            playbooks=product_module.get_action_playbooks_payload(),
        )
        if is_retention and has_pattern and hasattr(product_module, "get_action_playbooks_payload")
        else []
    )

    # ── Management summary payload ────────────────────────────────────────────
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

    next_steps_payload: dict[str, Any] = product_module.get_next_steps_payload(
        top_focus_labels=top_factor_labels,
        top_focus_keys=top_factor_keys,
    )

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
        "top_risks": top_risks,
        "top_factor_keys": top_factor_keys,
        "top_factor_labels": top_factor_labels,
        "strong_work_signal_pct": strong_work_signal_pct,
        "top_exit_reason_label": top_exit_reason_label,
        "top_contributing_reason_label": top_contributing_reason_label,
        "signal_visibility_average": signal_visibility_average,
        "retention_signal_profile": retention_signal_profile,
        "exit_playbooks": exit_playbooks,
        "retention_playbooks": retention_playbooks,
        "management_summary_payload": management_summary_payload,
        "next_steps_payload": next_steps_payload,
    }


# ─── ExitScan renderer ────────────────────────────────────────────────────────

def render_exit_report_html(data: dict[str, Any]) -> str:
    avg_risk = data["avg_risk"]
    band = _risk_band(11.0 - avg_risk) if avg_risk is not None else None
    band_color = _band_color(band) if band else "#94A3B8"
    risk_display = f"{avg_risk:.1f}/10" if avg_risk is not None else "—"

    # Metric cards
    metric_cards = [
        {"title": "Uitgenodigd", "value": str(data["n_invited"]), "body": "Respondenten in deze meetronde."},
        {"title": "Ingevuld", "value": str(data["n_completed"]), "body": "Responses die meetellen in het managementbeeld."},
        {"title": "Respons", "value": f"{data['completion_pct']}%", "body": "Percentage voltooide responses."},
        {"title": "Gem. frictiescore", "value": risk_display, "body": "Hoger = meer ervaren werkfrictie (1–10)."},
    ]

    # Top factoren voor summary
    top_labels = data["top_factor_labels"]
    top_factors_text = " en ".join(top_labels) if top_labels else "—"

    summary_msp = data["management_summary_payload"] or {}
    executive_intro = summary_msp.get("executive_intro", "")

    # Factoranalyse
    factor_section = _factor_analysis_section(data["factor_avgs"], data["has_pattern"])

    # Playbooks
    playbooks_html = ""
    if data["exit_playbooks"]:
        playbooks_html = "".join(_playbook_card(row) for row in data["exit_playbooks"])
    else:
        playbooks_html = _empty_state("Nog geen managementduiding beschikbaar — onvoldoende respondenten of alle factoren scoren laag risico.")

    # Vervolgrichting
    follow_up_html = _follow_up_section(data["next_steps_payload"])

    body = f"""
{_cover_page(data["scan_lbl"], data["org_name"], data["campaign_name"], data["generated_at"], data["n_completed"])}

<div style="padding-top: 20px;" class="page-break">

  <div class="section">
    <h2>Executive Summary</h2>
    <div class="card">
      <div style="margin-bottom:10px;">
        <span style="font-size:28px;font-weight:700;color:{band_color};">{risk_display}</span>
        <span style="font-size:11px;color:#64748B;margin-left:6px;">gemiddelde frictiescore</span>
        {"" if band is None else f'<span style="display:inline-block;margin-left:8px;font-size:10px;font-weight:700;color:#FFFFFF;background:{band_color};padding:2px 8px;border-radius:3px;">{_h(band)}</span>'}
      </div>
      {"<p>" + _h(executive_intro) + "</p>" if executive_intro else ""}
      <p style="margin-top:6px;font-size:10px;color:#64748B;">
        Scherpste factoren: <strong>{_h(top_factors_text)}</strong>
      </p>
    </div>
    {_metric_grid(metric_cards)}
  </div>

  <div class="section page-break">
    <h2>Factoranalyse</h2>
    {factor_section}
  </div>

  <div class="section page-break">
    <h2>Managementduiding</h2>
    {playbooks_html}
  </div>

  <div class="section page-break">
    <h2>Vervolgrichting</h2>
    <div class="card">
      {follow_up_html}
    </div>
  </div>

</div>
"""
    return _html_doc(f"ExitScan — {data['campaign_name']}", body)


# ─── RetentionScan renderer ───────────────────────────────────────────────────

def render_retention_report_html(data: dict[str, Any]) -> str:
    avg_risk = data["avg_risk"]
    retention_profile = data["retention_signal_profile"] or "—"
    profile_color = _band_color(retention_profile) if retention_profile in ("HOOG", "MIDDEN", "LAAG") else "#94A3B8"

    avg_engagement = data["avg_engagement"]
    avg_turnover = data["avg_turnover_intention"]

    engagement_display = f"{avg_engagement:.1f}/10" if avg_engagement is not None else "—"
    turnover_display = f"{avg_turnover:.1f}/10" if avg_turnover is not None else "—"
    risk_display = f"{avg_risk:.1f}/10" if avg_risk is not None else "—"

    metric_cards = [
        {"title": "Uitgenodigd", "value": str(data["n_invited"]), "body": "Respondenten in deze meetronde."},
        {"title": "Ingevuld", "value": str(data["n_completed"]), "body": "Responses die meetellen in het beeld."},
        {"title": "Bevlogenheid (UWES)", "value": engagement_display, "body": "Gemiddelde UWES-score (1–10)."},
        {"title": "Vertrekintentie", "value": turnover_display, "body": "Gemiddelde vertrekintentie (1–10)."},
    ]

    top_labels = data["top_factor_labels"]
    top_factors_text = " en ".join(top_labels) if top_labels else "—"

    summary_msp = data["management_summary_payload"] or {}
    executive_intro = summary_msp.get("executive_intro", "")

    factor_section = _factor_analysis_section(data["factor_avgs"], data["has_pattern"])

    playbooks_html = ""
    if data["retention_playbooks"]:
        playbooks_html = "".join(_playbook_card(row) for row in data["retention_playbooks"])
    else:
        playbooks_html = _empty_state("Nog geen behoudsplaybooks beschikbaar — onvoldoende respondenten of alle factoren scoren laag risico.")

    follow_up_html = _follow_up_section(data["next_steps_payload"])

    body = f"""
{_cover_page(data["scan_lbl"], data["org_name"], data["campaign_name"], data["generated_at"], data["n_completed"])}

<div style="padding-top: 20px;" class="page-break">

  <div class="section">
    <h2>Executive Summary</h2>
    <div class="card">
      <div style="margin-bottom:10px;">
        <span style="font-size:22px;font-weight:700;color:{profile_color};">{_h(retention_profile)}</span>
        <span style="font-size:11px;color:#64748B;margin-left:8px;">retentiesignaal</span>
        <span style="font-size:11px;color:#94A3B8;margin-left:12px;">&bull;</span>
        <span style="font-size:13px;font-weight:700;color:#243247;margin-left:12px;">{risk_display}</span>
        <span style="font-size:11px;color:#64748B;margin-left:4px;">gem. retentiescore</span>
      </div>
      {"<p>" + _h(executive_intro) + "</p>" if executive_intro else ""}
      <p style="margin-top:6px;font-size:10px;color:#64748B;">
        Scherpste factoren: <strong>{_h(top_factors_text)}</strong>
      </p>
    </div>
    {_metric_grid(metric_cards)}
  </div>

  <div class="section page-break">
    <h2>Factoranalyse</h2>
    {factor_section}
  </div>

  <div class="section page-break">
    <h2>Behoudsplaybooks</h2>
    {playbooks_html}
  </div>

  <div class="section page-break">
    <h2>Vervolgrichting</h2>
    <div class="card">
      {follow_up_html}
    </div>
  </div>

</div>
"""
    return _html_doc(f"RetentionScan — {data['campaign_name']}", body)


# ─── OnboardingScan renderer ──────────────────────────────────────────────────

def render_onboarding_report_html(data: dict[str, Any]) -> str:
    avg_risk = data["avg_risk"]
    risk_display = f"{avg_risk:.1f}/10" if avg_risk is not None else "—"
    band = _risk_band(11.0 - avg_risk) if avg_risk is not None else None
    band_color = _band_color(band) if band else "#94A3B8"

    metric_cards = [
        {"title": "Uitgenodigd", "value": str(data["n_invited"]), "body": "Medewerkers uitgenodigd voor dit checkpoint."},
        {"title": "Ingevuld", "value": str(data["n_completed"]), "body": "Responses die meetellen in het beeld."},
        {"title": "Respons", "value": f"{data['completion_pct']}%", "body": "Percentage voltooide responses."},
        {"title": "Onboardingsignaal", "value": risk_display, "body": "Gemiddeld signaal (1–10, hoger = meer frictie)."},
    ]

    top_labels = data["top_factor_labels"]
    top_factors_text = " en ".join(top_labels) if top_labels else "—"

    summary_msp = data["management_summary_payload"] or {}
    executive_intro = summary_msp.get("executive_intro", "")

    factor_section = _factor_analysis_section(data["factor_avgs"], data["has_pattern"])
    follow_up_html = _follow_up_section(data["next_steps_payload"])

    body = f"""
{_cover_page(data["scan_lbl"], data["org_name"], data["campaign_name"], data["generated_at"], data["n_completed"])}

<div style="padding-top: 20px;" class="page-break">

  <div class="section">
    <h2>Executive Summary</h2>
    <div class="card">
      <div style="margin-bottom:10px;">
        <span style="font-size:28px;font-weight:700;color:{band_color};">{risk_display}</span>
        <span style="font-size:11px;color:#64748B;margin-left:6px;">onboardingsignaal</span>
        {"" if band is None else f'<span style="display:inline-block;margin-left:8px;font-size:10px;font-weight:700;color:#FFFFFF;background:{band_color};padding:2px 8px;border-radius:3px;">{_h(band)}</span>'}
      </div>
      {"<p>" + _h(executive_intro) + "</p>" if executive_intro else ""}
      <p style="margin-top:6px;font-size:10px;color:#64748B;">
        Scherpste factoren: <strong>{_h(top_factors_text)}</strong>
      </p>
    </div>
    {_metric_grid(metric_cards)}
  </div>

  <div class="section page-break">
    <h2>Factoranalyse</h2>
    {factor_section}
  </div>

  <div class="section page-break">
    <h2>Vervolgrichting</h2>
    <div class="card">
      {follow_up_html}
    </div>
  </div>

</div>
"""
    return _html_doc(f"Onboarding 30-60-90 — {data['campaign_name']}", body)


# ─── Dispatcher ───────────────────────────────────────────────────────────────

def render_report_html(data: dict[str, Any]) -> str:
    """Kies de juiste renderer op basis van scan_type."""
    scan_type = data.get("scan_type", "exit")
    if scan_type == "retention":
        return render_retention_report_html(data)
    if scan_type == "onboarding":
        return render_onboarding_report_html(data)
    return render_exit_report_html(data)


# ─── PDF generator ────────────────────────────────────────────────────────────

def generate_campaign_report_html(campaign_id: str, db: Session) -> bytes:
    """
    Bouw data-dict → render HTML → WeasyPrint → PDF bytes.
    Alternatief voor generate_campaign_report() in report.py.
    """
    from weasyprint import HTML  # lazy import — crasht niet bij import als WeasyPrint ontbreekt

    data = build_report_data(campaign_id, db)
    html_str = render_report_html(data)
    return HTML(string=html_str).write_pdf()
