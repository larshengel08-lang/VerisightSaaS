"""
Verisight — PDF-rapportgenerator
========================================
Genereert een professioneel 7-pagina rapport per campaign.

Pagina-indeling
---------------
  1. Voorblad        — campagne, organisatie, datum, KPI-snapshot
  2. Management Summary — sleutelbevindingen, signaalverdeling
  3. SDT Basisbehoeften — autonomie, competentie, verbondenheid
  4. Organisatiefactoren — scoretabel, signaalwaarden, focusvragen
  5. Patronen & vertrekreden (exit) / bevlogenheid (retention)
  6. Werkhypothesen & vervolgstappen

Gebruik
-------
    from backend.report import generate_campaign_report
    pdf_bytes = generate_campaign_report(campaign_id, db)
"""

from __future__ import annotations

import io
import math
from datetime import datetime, timezone
from typing import Any

import matplotlib
matplotlib.use("Agg")  # geen GUI vereist
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    BaseDocTemplate,
    FrameBreak,
    Image,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.frames import Frame
from reportlab.lib.utils import ImageReader

from sqlalchemy.orm import Session

from backend.models import Campaign, SurveyResponse
from backend.scoring import (
    FACTOR_LABELS_NL,
    ORG_FACTOR_KEYS,
    EXIT_REASON_LABELS_NL,
    MIN_SEGMENT_N,
    detect_patterns,
)

# ---------------------------------------------------------------------------
# Brandkleuren
# ---------------------------------------------------------------------------

BRAND       = colors.HexColor("#2563EB")
BRAND_DARK  = colors.HexColor("#1D4ED8")
BRAND_LIGHT = colors.HexColor("#EFF6FF")
RISK_HIGH   = colors.HexColor("#DC2626")
RISK_MED    = colors.HexColor("#F59E0B")
RISK_LOW    = colors.HexColor("#16A34A")
MUTED       = colors.HexColor("#6B7280")
TEXT        = colors.HexColor("#111827")
BORDER      = colors.HexColor("#E5E7EB")
WHITE       = colors.white
BG          = colors.HexColor("#F9FAFB")

# Matplotlib equivalenten
MPL_BRAND = "#2563EB"
MPL_HIGH  = "#DC2626"
MPL_MED   = "#F59E0B"
MPL_LOW   = "#16A34A"
MPL_MUTED = "#9CA3AF"

PAGE_W, PAGE_H = A4  # 595 × 842 pt

# ---------------------------------------------------------------------------
# Stijlen
# ---------------------------------------------------------------------------

_base_styles = getSampleStyleSheet()


def _style(name: str, **kw) -> ParagraphStyle:
    return ParagraphStyle(name, **kw)


STYLES: dict[str, ParagraphStyle] = {
    "cover_title": _style(
        "cover_title",
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=34,
        textColor=WHITE,
        alignment=TA_LEFT,
    ),
    "cover_sub": _style(
        "cover_sub",
        fontName="Helvetica",
        fontSize=14,
        leading=20,
        textColor=colors.HexColor("#BFDBFE"),
        alignment=TA_LEFT,
    ),
    "cover_meta": _style(
        "cover_meta",
        fontName="Helvetica",
        fontSize=11,
        leading=16,
        textColor=WHITE,
        alignment=TA_LEFT,
    ),
    "section_title": _style(
        "section_title",
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=22,
        textColor=BRAND,
        spaceAfter=8,
    ),
    "sub_title": _style(
        "sub_title",
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=18,
        textColor=TEXT,
        spaceBefore=10,
        spaceAfter=4,
    ),
    "body": _style(
        "body",
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        textColor=TEXT,
        spaceAfter=6,
    ),
    "body_bold": _style(
        "body_bold",
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=15,
        textColor=TEXT,
    ),
    "caption": _style(
        "caption",
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=12,
        textColor=MUTED,
        alignment=TA_CENTER,
    ),
    "footer": _style(
        "footer",
        fontName="Helvetica",
        fontSize=8,
        leading=12,
        textColor=MUTED,
        alignment=TA_RIGHT,
    ),
    "badge_high": _style(
        "badge_high",
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=colors.HexColor("#991B1B"),
    ),
    "badge_med": _style(
        "badge_med",
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=colors.HexColor("#92400E"),
    ),
    "badge_low": _style(
        "badge_low",
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=colors.HexColor("#166534"),
    ),
}

# ---------------------------------------------------------------------------
# Matplotlib → ReportLab Image helper
# ---------------------------------------------------------------------------


def _fig_to_image(fig: plt.Figure, width_cm: float = 14.0) -> Image:
    """Converteer een matplotlib figuur naar een ReportLab Image-object."""
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight", facecolor="white")
    buf.seek(0)
    plt.close(fig)
    img = Image(buf)
    aspect = img.imageWidth / img.imageHeight
    w = width_cm * cm
    img._restrictSize(w, w / aspect)
    return img


# ---------------------------------------------------------------------------
# Grafiek: frictiemeter (horizontale meter)
# ---------------------------------------------------------------------------


def _risk_gauge_image(score: float, band: str) -> Image:
    fig, ax = plt.subplots(figsize=(5, 1.1))
    ax.set_xlim(1, 10)
    ax.set_ylim(0, 1.3)
    ax.axis("off")

    # Achtergrond zones — clear demarcation at 4.5 and 7.0
    ax.barh(0.65, 3.5, left=1,   height=0.5, color=MPL_LOW,  alpha=0.30)
    ax.barh(0.65, 2.5, left=4.5, height=0.5, color=MPL_MED,  alpha=0.30)
    ax.barh(0.65, 3.0, left=7.0, height=0.5, color=MPL_HIGH, alpha=0.30)

    # Naald — dikkere lijn, kleur passend bij band
    color = {"HOOG": MPL_HIGH, "MIDDEN": MPL_MED, "LAAG": MPL_LOW}.get(band, MPL_BRAND)
    ax.plot([score, score], [0.25, 1.05], color=color, lw=4, zorder=5, solid_capstyle="round")
    ax.scatter([score], [0.65], color=color, s=100, zorder=6)

    # Zone labels — groter en vetter
    for x, lbl, col in [(2.75, "LAAG", MPL_LOW), (5.75, "MIDDEN", MPL_MED), (8.5, "HOOG", MPL_HIGH)]:
        ax.text(x, 0.65, lbl, ha="center", va="center", fontsize=8, color=col, fontweight="bold")

    # Score label direct onder de naald
    ax.text(score, 0.08, f"{score:.1f}", ha="center", va="bottom", fontsize=10, color=color, fontweight="bold")

    return _fig_to_image(fig, width_cm=10)


# ---------------------------------------------------------------------------
# Grafiek: radar-chart organisatiefactoren
# ---------------------------------------------------------------------------


def _radar_image(factor_avgs: dict[str, float], width_cm: float = 9.0) -> Image:
    factors = [f for f in ORG_FACTOR_KEYS if f in factor_avgs]
    labels  = [FACTOR_LABELS_NL.get(f, f) for f in factors]
    values  = [factor_avgs[f] for f in factors]
    n = len(factors)
    if n < 3:
        return None

    angles = [2 * math.pi / n * i for i in range(n)] + [0]
    values_plot = values + [values[0]]

    fig, ax = plt.subplots(figsize=(4.5, 4.5), subplot_kw=dict(polar=True))
    ax.set_theta_offset(math.pi / 2)
    ax.set_theta_direction(-1)
    ax.set_ylim(0, 10)
    ax.set_yticks([2, 4, 6, 8, 10])
    ax.set_yticklabels(["2", "4", "6", "8", "10"], fontsize=7, color="#9CA3AF")
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(labels, fontsize=8)
    ax.plot(angles, values_plot, color=MPL_BRAND, lw=2)
    ax.fill(angles, values_plot, color=MPL_BRAND, alpha=0.15)
    ax.set_facecolor("white")
    fig.patch.set_facecolor("white")
    return _fig_to_image(fig, width_cm=width_cm)


# ---------------------------------------------------------------------------
# Grafiek: horizontale balk per factor
# ---------------------------------------------------------------------------


def _factor_bar_image(factor_avgs: dict[str, float], width_cm: float = 12.0) -> Image:
    factors = [f for f in ORG_FACTOR_KEYS if f in factor_avgs]
    labels  = [FACTOR_LABELS_NL.get(f, f) for f in factors]
    scores  = [factor_avgs[f] for f in factors]
    risks   = [round(11.0 - s, 1) for f, s in zip(factors, scores)]

    sorted_pairs = sorted(zip(labels, scores, risks), key=lambda x: x[2], reverse=True)
    labels_s  = [p[0] for p in sorted_pairs]
    scores_s  = [p[1] for p in sorted_pairs]
    risks_s   = [p[2] for p in sorted_pairs]

    bar_colors = [
        MPL_HIGH if r >= 7 else MPL_MED if r >= 4.5 else MPL_LOW
        for r in risks_s
    ]

    fig, ax = plt.subplots(figsize=(6, 3.2))
    y = range(len(labels_s))
    bars = ax.barh(list(y), scores_s, color=bar_colors, height=0.55, alpha=0.85)
    ax.set_xlim(0, 10)
    ax.set_yticks(list(y))
    ax.set_yticklabels(labels_s, fontsize=9)
    ax.set_xlabel("Score (1 = laag, 10 = hoog)", fontsize=8)
    ax.axvline(x=5.5, color="#D1D5DB", lw=1, linestyle="--")

    for bar, score in zip(bars, scores_s):
        ax.text(
            score + 0.15, bar.get_y() + bar.get_height() / 2,
            f"{score:.1f}", va="center", fontsize=8, color="#374151",
        )

    patches = [
        mpatches.Patch(color=MPL_HIGH, label="Hoog aandachtssignaal"),
        mpatches.Patch(color=MPL_MED,  label="Gemengd signaal"),
        mpatches.Patch(color=MPL_LOW,  label="Beperkt signaal"),
    ]
    ax.legend(handles=patches, fontsize=7, loc="lower right")
    ax.set_facecolor("white")
    fig.patch.set_facecolor("white")
    fig.tight_layout()
    return _fig_to_image(fig, width_cm=width_cm)


# ---------------------------------------------------------------------------
# Grafiek: preventability donut
# ---------------------------------------------------------------------------


def _preventability_image(counts: dict[str, int], width_cm: float = 7.0) -> Image | None:
    vals   = [
        counts.get("STERK_WERKSIGNAAL", 0),
        counts.get("GEMENGD_WERKSIGNAAL", 0),
        counts.get("BEPERKT_WERKSIGNAAL", 0),
    ]
    labels = ["Sterk\nwerksignaal", "Gemengd\nsignaal", "Beperkt\nsignaal"]
    colors_list = [MPL_LOW, MPL_MED, MPL_MUTED]
    if sum(vals) == 0:
        return None
    fig, ax = plt.subplots(figsize=(3.5, 3.5))
    wedges, texts, autotexts = ax.pie(
        vals, labels=labels, colors=colors_list,
        autopct="%1.0f%%", startangle=90,
        wedgeprops=dict(width=0.55),
        textprops=dict(fontsize=8),
    )
    for at in autotexts:
        at.set_fontsize(8)
        at.set_fontweight("bold")
    ax.set_facecolor("white")
    fig.patch.set_facecolor("white")
    return _fig_to_image(fig, width_cm=width_cm)


# ---------------------------------------------------------------------------
# Grafiek: SDT staafdiagram
# ---------------------------------------------------------------------------


def _sdt_bar_image(sdt_avgs: dict[str, float], width_cm: float = 10.0) -> Image:
    dims   = ["autonomy", "competence", "relatedness"]
    labels = [FACTOR_LABELS_NL.get(d, d) for d in dims]
    values = [sdt_avgs.get(d, 5.5) for d in dims]

    bar_colors = [MPL_HIGH if v < 4.5 else MPL_MED if v < 7.0 else MPL_LOW for v in values]

    fig, ax = plt.subplots(figsize=(5, 2.5))
    bars = ax.barh([0, 1, 2], values, color=bar_colors, height=0.5, alpha=0.85)
    ax.set_xlim(0, 10)
    ax.set_yticks([0, 1, 2])
    ax.set_yticklabels(labels, fontsize=9)
    ax.axvline(x=5.5, color="#D1D5DB", lw=1, linestyle="--", label="Middelpunt")
    ax.axvline(x=7.0, color="#FCA5A5", lw=1, linestyle=":", label="Drempel goed")
    ax.set_xlabel("Score (1–10)", fontsize=8)

    for bar, val in zip(bars, values):
        ax.text(
            val + 0.15, bar.get_y() + bar.get_height() / 2,
            f"{val:.1f}", va="center", fontsize=9, fontweight="bold",
        )

    ax.set_facecolor("white")
    fig.patch.set_facecolor("white")
    fig.tight_layout()
    return _fig_to_image(fig, width_cm=width_cm)


# ---------------------------------------------------------------------------
# Hulp: kleur naar band
# ---------------------------------------------------------------------------


def _band_color(band: str) -> colors.Color:
    return {"HOOG": RISK_HIGH, "MIDDEN": RISK_MED, "LAAG": RISK_LOW}.get(band, MUTED)


def _risk_color(score: float) -> colors.Color:
    if score >= 7.0:
        return RISK_HIGH
    elif score >= 4.5:
        return RISK_MED
    return RISK_LOW


def _top_factor_cluster(top_risks: list[tuple[str, float]], delta: float = 0.4) -> list[tuple[str, float]]:
    if not top_risks:
        return []
    lead_score = top_risks[0][1]
    return [(factor, score) for factor, score in top_risks if lead_score - score <= delta]


def _dedupe_quotes(quotes: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for quote in quotes:
        normalized = " ".join((quote or "").strip().lower().split())
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        result.append(quote.strip())
    return result


def _select_relevant_quotes(
    quotes: list[str],
    top_factors: list[str],
    top_reason_codes: list[str],
    max_quotes: int = 4,
) -> list[str]:
    keyword_map = {
        "leadership": ["leidinggevende", "manager", "feedback", "beslissing", "transparantie"],
        "culture": ["cultuur", "team", "veilig", "waarden", "samenwerking"],
        "growth": ["groei", "ontwikkeling", "loopbaan", "doorgroe", "perspectief"],
        "compensation": ["salaris", "beloning", "arbeidsvoorwaarden"],
        "workload": ["werkdruk", "belasting", "druk", "hersteltijd"],
        "role_clarity": ["verwachting", "rol", "duidelijk", "verantwoordelijkheid"],
        "P1": ["leidinggevende", "manager", "feedback"],
        "P2": ["cultuur", "team", "veilig"],
        "P3": ["groei", "ontwikkeling", "perspectief"],
        "P4": ["salaris", "beloning"],
        "P5": ["werkdruk", "stress"],
        "P6": ["rol", "verwachting", "duidelijk"],
    }
    selected: list[str] = []
    for quote in _dedupe_quotes(quotes):
        q_lower = quote.lower()
        if any(any(keyword in q_lower for keyword in keyword_map.get(key, [])) for key in top_factors + top_reason_codes):
            selected.append(quote)
        if len(selected) >= max_quotes:
            break
    if len(selected) < max_quotes:
        for quote in _dedupe_quotes(quotes):
            if quote not in selected:
                selected.append(quote)
            if len(selected) >= max_quotes:
                break
    return selected[:max_quotes]


def _build_exit_hypotheses(
    top_risks: list[tuple[str, float]],
    top_exit_reasons: list[dict[str, Any]],
    top_contributing_reasons: list[dict[str, Any]],
    factor_avgs: dict[str, float],
) -> list[dict[str, str]]:
    hypotheses: list[dict[str, str]] = []
    primary_reason_by_factor = {
        "leadership": "P1",
        "culture": "P2",
        "growth": "P3",
        "compensation": "P4",
        "workload": "P5",
        "role_clarity": "P6",
    }
    relevant_contributing_labels = [item["label"] for item in top_contributing_reasons[:3]]

    for factor, risk_value in top_risks[:3]:
        label = FACTOR_LABELS_NL.get(factor, factor)
        matching_primary = next(
            (item for item in top_exit_reasons if item["code"] == primary_reason_by_factor.get(factor)),
            None,
        )
        support = []
        if matching_primary:
            support.append(f"Deze reden komt ook terug als hoofdreden ({matching_primary['count']} responses).")
        if relevant_contributing_labels:
            labels = ", ".join(relevant_contributing_labels[:2])
            support.append(f"Meespelende factoren ({labels}) laten zien dat het patroon waarschijnlijk multicausaal is.")

        support_text = " ".join(support)

        hypotheses.append({
            "title": f"Hypothese: {label} vraagt verdiepende validatie",
            "body": (
                f"De score op {label.lower()} behoort tot de sterkste aandachtssignalen "
                f"(signaalwaarde {risk_value:.1f}). "
                + (support_text if support_text else "Dit signaal verdient vooral verificatie in gesprek voordat er actie wordt bepaald.")
            ).strip(),
            "question": (
                f"Toets in gesprek of {label.lower()} structureel meespeelt, bij welke groepen dit vooral speelt, "
                "en welke concrete situaties medewerkers hierbij bedoelen."
            ),
        })
    return hypotheses


SEGMENT_DEEP_DIVE_KEY = "segment_deep_dive"
ROLE_LEVEL_LABELS_NL = {
    "uitvoerend": "Uitvoerend",
    "specialist": "Specialist",
    "senior": "Senior specialist",
    "manager": "Manager",
    "director": "Director",
    "c_level": "C-level",
}


def _campaign_has_add_on(campaign: Campaign, add_on_key: str) -> bool:
    return add_on_key in (campaign.enabled_modules or [])


def _segment_group_label(segment_type: str, raw_value: str) -> str:
    if segment_type == "role_level":
        return ROLE_LEVEL_LABELS_NL.get(raw_value, raw_value.capitalize())
    return raw_value


def _segment_type_label(segment_type: str) -> str:
    return {
        "department": "Afdeling",
        "role_level": "Functieniveau",
        "tenure": "Diensttijd",
    }.get(segment_type, segment_type)


def _segment_note(delta: float) -> str:
    if delta >= 1.0:
        return "Duidelijk hoger frictiesignaal dan organisatieniveau."
    if delta >= 0.5:
        return "Merkbaar hoger frictiesignaal dan organisatieniveau."
    if delta <= -1.0:
        return "Duidelijk lager frictiesignaal dan organisatieniveau."
    if delta <= -0.5:
        return "Merkbaar lager frictiesignaal dan organisatieniveau."
    return "Ligt dicht bij het organisatieniveau."


def _build_segment_deep_dive_data(
    responses: list[SurveyResponse],
    org_avg_risk: float | None,
) -> dict[str, Any]:
    coverage = {"department": 0, "role_level": 0, "tenure": 0}
    group_store: dict[str, dict[str, list[SurveyResponse]]] = {
        "department": {},
        "role_level": {},
        "tenure": {},
    }

    for response in responses:
        if response.respondent.department:
            coverage["department"] += 1
        if response.respondent.role_level:
            coverage["role_level"] += 1
        if response.tenure_years is not None:
            coverage["tenure"] += 1

        if response.risk_score is None:
            continue

        department = response.respondent.department or None
        if department:
            group_store["department"].setdefault(department, []).append(response)

        role_level = response.respondent.role_level or None
        if role_level:
            group_store["role_level"].setdefault(role_level, []).append(response)

        tenure = response.tenure_years
        if tenure is not None:
            if tenure < 1.0:
                tenure_bucket = "< 1 jaar"
            elif tenure < 3.0:
                tenure_bucket = "1-3 jaar"
            elif tenure < 5.0:
                tenure_bucket = "3-5 jaar"
            else:
                tenure_bucket = "5+ jaar"
            group_store["tenure"].setdefault(tenure_bucket, []).append(response)

    rows: list[dict[str, Any]] = []
    if org_avg_risk is None:
        return {"coverage": coverage, "rows": rows}

    for segment_type, groups in group_store.items():
        for raw_label, items in groups.items():
            if len(items) < MIN_SEGMENT_N:
                continue

            avg_risk = round(sum(float(item.risk_score or 0) for item in items) / len(items), 2)
            factor_signal_scores: list[tuple[str, float]] = []
            for factor in ORG_FACTOR_KEYS:
                factor_values = [
                    float(item.org_scores[factor])
                    for item in items
                    if item.org_scores and item.org_scores.get(factor) is not None
                ]
                if not factor_values:
                    continue
                avg_factor = sum(factor_values) / len(factor_values)
                factor_signal_scores.append((factor, round(11.0 - avg_factor, 2)))

            top_factor_labels = [
                FACTOR_LABELS_NL.get(factor, factor)
                for factor, _score in sorted(factor_signal_scores, key=lambda item: item[1], reverse=True)[:2]
            ]
            rows.append({
                "segment_type": segment_type,
                "segment_label": _segment_group_label(segment_type, raw_label),
                "n": len(items),
                "avg_risk": avg_risk,
                "delta_vs_org": round(avg_risk - org_avg_risk, 2),
                "top_factor_labels": top_factor_labels,
            })

    rows.sort(key=lambda item: (abs(item["delta_vs_org"]), item["avg_risk"], item["n"]), reverse=True)
    return {"coverage": coverage, "rows": rows[:6]}


# ---------------------------------------------------------------------------
# Header/Footer callbacks
# ---------------------------------------------------------------------------


def _make_header_footer(org_name: str, camp_name: str, generated: str):
    """Geeft onFirstPage en onLaterPages callbacks terug voor platypus."""

    def _later_pages(canvas, doc):
        canvas.saveState()
        # Boven-lijn
        canvas.setStrokeColor(BRAND)
        canvas.setLineWidth(2)
        canvas.line(1.5 * cm, PAGE_H - 1.2 * cm, PAGE_W - 1.5 * cm, PAGE_H - 1.2 * cm)

        # Kopnaam links
        canvas.setFont("Helvetica-Bold", 8)
        canvas.setFillColor(BRAND)
        canvas.drawString(1.5 * cm, PAGE_H - 1.8 * cm, "Verisight")

        # Campaign rechts
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(MUTED)
        canvas.drawRightString(PAGE_W - 1.5 * cm, PAGE_H - 1.8 * cm, f"{org_name}  |  {camp_name}")

        # Onderlijn
        canvas.setStrokeColor(BORDER)
        canvas.setLineWidth(0.5)
        canvas.line(1.5 * cm, 1.5 * cm, PAGE_W - 1.5 * cm, 1.5 * cm)

        # Paginanummer + versie
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(1.5 * cm, 1.0 * cm, "ExitScan v1.0  ·  Verisight")
        canvas.drawCentredString(PAGE_W / 2, 1.0 * cm, f"Pagina {doc.page}")
        canvas.drawRightString(PAGE_W - 1.5 * cm, 1.0 * cm, f"Gegenereerd {generated}")

        canvas.restoreState()

    def _first_page(canvas, doc):
        # Voorblad: volledig blauw
        canvas.saveState()
        canvas.setFillColor(BRAND)
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        canvas.restoreState()

    return _first_page, _later_pages


# ---------------------------------------------------------------------------
# Hoofd-functie
# ---------------------------------------------------------------------------


def generate_campaign_report(campaign_id: str, db: Session) -> bytes:
    """
    Genereer een PDF-rapport voor de gegeven campaign-ID.
    Geeft ruwe bytes terug (geschikt voor HTTP-response of opslaan).
    """
    camp: Campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not camp:
        raise ValueError(f"Campaign niet gevonden: {campaign_id}")

    org      = camp.organization
    now_str  = datetime.now(timezone.utc).strftime("%d-%m-%Y %H:%M UTC")
    scan_lbl = "ExitScan" if camp.scan_type == "exit" else "RetentieScan"

    # ── Data verzamelen ────────────────────────────────────────────────────
    respondents = camp.respondents
    completed   = [r for r in respondents if r.completed]
    responses: list[SurveyResponse] = [r.response for r in completed if r.response]

    n_invited   = len(respondents)
    n_completed = len(responses)
    completion  = round(n_completed / n_invited * 100, 1) if n_invited else 0.0

    risk_scores = [r.risk_score for r in responses if r.risk_score]
    avg_risk    = round(sum(risk_scores) / len(risk_scores), 2) if risk_scores else None

    band_counts = {"HOOG": 0, "MIDDEN": 0, "LAAG": 0}
    for r in responses:
        if r.risk_band in band_counts:
            band_counts[r.risk_band] += 1

    pattern_input = [
        {
            "org_scores":       r.org_scores,
            "sdt_scores":       r.sdt_scores,
            "risk_score":       r.risk_score,
            "preventability":   r.preventability,
            "exit_reason_code": r.exit_reason_code,
            "contributing_reason_codes": list((r.pull_factors_raw or {}).keys()),
            "department":       r.respondent.department,
            "role_level":       r.respondent.role_level,
        }
        for r in responses
    ]
    pattern      = detect_patterns(pattern_input)
    has_pattern  = pattern.get("sufficient_data", False)
    factor_avgs  = pattern.get("factor_averages", {}) if has_pattern else {}
    top_risks    = pattern.get("top_risk_factors", []) if has_pattern else []
    sdt_avgs     = {d: factor_avgs.get(d, 5.5) for d in ["autonomy", "competence", "relatedness"]}
    top_cluster  = _top_factor_cluster(top_risks)
    strong_work_signal_pct = pattern.get("strong_work_signal_pct") if has_pattern else None
    any_work_signal_pct = pattern.get("any_work_signal_pct") if has_pattern else None
    has_segment_deep_dive = _campaign_has_add_on(camp, SEGMENT_DEEP_DIVE_KEY)
    segment_deep_dive = _build_segment_deep_dive_data(
        responses=responses,
        org_avg_risk=pattern.get("avg_risk_score") if has_pattern else avg_risk,
    ) if has_segment_deep_dive else {"coverage": {}, "rows": []}

    # Replacement cost totaal (exit only)
    total_cost = sum(
        r.replacement_cost_eur for r in responses if r.replacement_cost_eur
    )

    # ── PDF opbouwen ───────────────────────────────────────────────────────
    buf = io.BytesIO()

    first_page_cb, later_pages_cb = _make_header_footer(org.name, camp.name, now_str)

    content_x      = 1.5 * cm
    content_y      = 2.5 * cm
    content_width  = PAGE_W - 3.0 * cm
    content_height = PAGE_H - 4.5 * cm

    # Frame voor voorblad (vrij, geen header/footer)
    cover_frame = Frame(
        content_x, 3.0 * cm,
        content_width, PAGE_H - 6.0 * cm,
        id="cover",
    )
    # Frame voor reguliere pagina's
    body_frame = Frame(
        content_x, content_y,
        content_width, content_height,
        id="body",
    )

    doc = BaseDocTemplate(
        buf,
        pagesize=A4,
        title=f"Verisight — {camp.name}",
        author="Verisight",
        subject=scan_lbl,
    )

    cover_template = PageTemplate(id="cover", frames=[cover_frame], onPage=first_page_cb)
    body_template  = PageTemplate(id="body",  frames=[body_frame],  onPage=later_pages_cb)
    doc.addPageTemplates([cover_template, body_template])

    story: list = []

    # ==================================================================== #
    # PAGINA 1 — VOORBLAD                                                  #
    # ==================================================================== #

    story.append(Spacer(1, 2.5 * cm))
    story.append(Paragraph("Verisight", STYLES["cover_sub"]))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(camp.name, STYLES["cover_title"]))
    story.append(Spacer(1, 0.6 * cm))
    story.append(Paragraph(f"{scan_lbl}  ·  {org.name}", STYLES["cover_sub"]))
    story.append(Spacer(1, 2.0 * cm))

    # KPI-blokken op voorblad
    kpi_data = [
        ["Uitgenodigden", "Ingevuld", "Respons", "Gem. frictiescore"],
        [
            str(n_invited),
            str(n_completed),
            f"{completion}%",
            f"{avg_risk:.1f}/10" if avg_risk else "–",
        ],
    ]
    kpi_style = TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0), colors.HexColor("#1D4ED8")),
        ("BACKGROUND",   (0, 1), (-1, 1), colors.HexColor("#1E40AF")),
        ("TEXTCOLOR",    (0, 0), (-1, -1), WHITE),
        ("FONTNAME",     (0, 0), (-1, 0), "Helvetica"),
        ("FONTNAME",     (0, 1), (-1, 1), "Helvetica-Bold"),
        ("FONTSIZE",     (0, 0), (-1, 0), 9),
        ("FONTSIZE",     (0, 1), (-1, 1), 20),
        ("ALIGN",        (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.HexColor("#1D4ED8"), colors.HexColor("#1E40AF")]),
        ("TOPPADDING",   (0, 0), (-1, 0), 8),
        ("BOTTOMPADDING",(0, 0), (-1, 0), 6),
        ("TOPPADDING",   (0, 1), (-1, 1), 10),
        ("BOTTOMPADDING",(0, 1), (-1, 1), 12),
        ("GRID",         (0, 0), (-1, -1), 0.5, colors.HexColor("#3B82F6")),
        ("ROUNDEDCORNERS", (0, 0), (-1, -1), [4]),
    ])
    kpi_table = Table(kpi_data, colWidths=[content_width / 4] * 4)
    kpi_table.setStyle(kpi_style)
    story.append(kpi_table)

    # Trend-indicator: vergelijk met vorige campagne van dezelfde organisatie (indien beschikbaar)
    try:
        from backend.models import Respondent as _Respondent
        prev_camp = (
            db.query(Campaign)
            .filter(
                Campaign.organization_id == org.id,
                Campaign.id != camp.id,
                Campaign.is_active == False,  # noqa: E712
            )
            .order_by(Campaign.id.desc())
            .first()
        )
        if prev_camp:
            prev_respondents = prev_camp.respondents
            prev_completed   = [r for r in prev_respondents if r.completed]
            prev_responses   = [r.response for r in prev_completed if r.response]
            prev_scores      = [r.risk_score for r in prev_responses if r.risk_score]
            if prev_scores and avg_risk is not None:
                prev_avg   = round(sum(prev_scores) / len(prev_scores), 2)
                delta      = round(avg_risk - prev_avg, 1)
                arrow      = "↑" if delta > 0 else "↓" if delta < 0 else "→"
                delta_text = f"{arrow} {abs(delta):.1f} vs. vorige campagne"
                delta_color = colors.HexColor("#FCA5A5") if delta > 0 else colors.HexColor("#86EFAC")
                trend_data  = [["Trend", delta_text]]
                trend_style = TableStyle([
                    ("BACKGROUND",   (0, 0), (-1, 0), colors.HexColor("#1D4ED8")),
                    ("BACKGROUND",   (0, 1), (-1, 1), colors.HexColor("#1E40AF")),
                    ("TEXTCOLOR",    (0, 0), (-1, -1), WHITE),
                    ("FONTNAME",     (0, 0), (-1, 0), "Helvetica"),
                    ("FONTNAME",     (0, 1), (-1, 1), "Helvetica-Bold"),
                    ("FONTSIZE",     (0, 0), (-1, 0), 9),
                    ("FONTSIZE",     (0, 1), (-1, 1), 14),
                    ("ALIGN",        (0, 0), (-1, -1), "CENTER"),
                    ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
                    ("TOPPADDING",   (0, 0), (-1, 0), 8),
                    ("BOTTOMPADDING",(0, 0), (-1, 0), 6),
                    ("TOPPADDING",   (0, 1), (-1, 1), 10),
                    ("BOTTOMPADDING",(0, 1), (-1, 1), 12),
                    ("GRID",         (0, 0), (-1, -1), 0.5, colors.HexColor("#3B82F6")),
                ])
                trend_table = Table(trend_data, colWidths=[content_width])
                trend_table.setStyle(trend_style)
                story.append(Spacer(1, 0.3 * cm))
                story.append(trend_table)
    except Exception:
        pass  # Trend-indicator is optioneel — geen foutmelding tonen

    story.append(Spacer(1, 1.5 * cm))

    # Executive summary op voorblad — alleen bij voldoende data (n ≥ 10)
    if has_pattern and factor_avgs:
        # Top 3 sterkste factoren (hoogste score = meest positief)
        all_factors = {**{f: factor_avgs.get(f, 5.5) for f in ORG_FACTOR_KEYS}}
        sorted_factors = sorted(all_factors.items(), key=lambda x: x[1])
        top_risks_cover    = sorted_factors[:3]   # laagste scores = hoogste risico
        top_strengths_cover = sorted_factors[-3:]  # hoogste scores = sterkste punten

        exec_rows = [["Samenvatting (n={})".format(n_completed), ""]]
        for factor, score in reversed(top_strengths_cover):
            label = FACTOR_LABELS_NL.get(factor, factor)
            exec_rows.append([f"✓  {label}", f"{score:.1f}"])
        for factor, score in top_risks_cover:
            label = FACTOR_LABELS_NL.get(factor, factor)
            exec_rows.append([f"⚠  {label}", f"{score:.1f}"])
        if strong_work_signal_pct is not None:
            exec_rows.append(["Werkfactorsignaal", f"{strong_work_signal_pct:.0f}%"])

        exec_style = TableStyle([
            ("SPAN",        (0, 0), (1, 0)),
            ("BACKGROUND",  (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
            ("TEXTCOLOR",   (0, 0), (-1, 0), WHITE),
            ("FONTNAME",    (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",    (0, 0), (-1, 0), 9),
            ("FONTNAME",    (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE",    (0, 1), (-1, -1), 9),
            ("TEXTCOLOR",   (0, 1), (-1, -1), WHITE),
            ("ALIGN",       (1, 0), (1, -1), "RIGHT"),
            ("TOPPADDING",  (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("LINEBELOW",   (0, 0), (-1, 0), 0.5, colors.HexColor("#3B82F6")),
        ])
        exec_table = Table(exec_rows, colWidths=[content_width * 0.78, content_width * 0.22])
        exec_table.setStyle(exec_style)
        story.append(exec_table)
        story.append(Spacer(1, 1.0 * cm))

    story.append(Paragraph(f"Gegenereerd op {now_str}", STYLES["cover_meta"]))
    story.append(Paragraph(
        "Vertrouwelijk — uitsluitend bestemd voor geautoriseerde gebruikers.",
        STYLES["cover_meta"],
    ))

    story.append(NextPageTemplate("body"))
    story.append(PageBreak())

    # ==================================================================== #
    # PAGINA 2 — MANAGEMENT SUMMARY                                        #
    # ==================================================================== #

    story.append(Paragraph("Management Summary", STYLES["section_title"]))
    story.append(Spacer(1, 0.3 * cm))

    # Inleiding
    intro = (
        f"Dit rapport bevat de resultaten van <b>{camp.name}</b> ({scan_lbl}) "
        f"voor <b>{org.name}</b>. In totaal namen <b>{n_completed}</b> van de "
        f"{n_invited} uitgenodigde medewerkers deel (respons: {completion}%). "
    )
    if avg_risk:
        band_str = {"HOOG": "hoog", "MIDDEN": "middelhoog", "LAAG": "laag"}.get(
            ("HOOG" if avg_risk >= 7 else "MIDDEN" if avg_risk >= 4.5 else "LAAG"), ""
        )
        intro += (
            f"De gemiddelde frictiescore bedraagt <b>{avg_risk:.1f} op 10</b>. "
            f"Dat wijst op een <b>{band_str}</b> signaalniveau van ervaren frictie in de werkomgeving rondom vertrek."
        )
    story.append(Paragraph(intro, STYLES["body"]))
    story.append(Spacer(1, 0.4 * cm))

    # Risico-meter
    if avg_risk:
        band_label = "HOOG" if avg_risk >= 7 else "MIDDEN" if avg_risk >= 4.5 else "LAAG"
        story.append(Paragraph("Frictiemeter (gemiddeld)", STYLES["sub_title"]))
        story.append(_risk_gauge_image(avg_risk, band_label))
        story.append(Paragraph(
            "<i>De frictiescore is een interne samenvatting van ervaren werkfrictie rondom vertrek. "
            "Gebruik deze score als gesprekssamenvatting, niet als externe benchmark of voorspelling.</i>",
            ParagraphStyle(
                "benchmark_note",
                fontName="Helvetica-Oblique",
                fontSize=8,
                leading=11,
                textColor=MUTED,
                spaceAfter=4,
            ),
        ))
        story.append(Spacer(1, 0.3 * cm))

    # Risicodistributie tabel
    story.append(Paragraph("Verdeling signaalbanden", STYLES["sub_title"]))
    dist_data = [
        ["Signaalband", "Aantal", "Percentage"],
        ["Hoog signaal (7–10)", str(band_counts["HOOG"]),  f"{band_counts['HOOG']  / max(n_completed,1) * 100:.0f}%"],
        ["Middensignaal (4.5–7)", str(band_counts["MIDDEN"]), f"{band_counts['MIDDEN'] / max(n_completed,1) * 100:.0f}%"],
        ["Laag signaal (1–4.5)", str(band_counts["LAAG"]),  f"{band_counts['LAAG']  / max(n_completed,1) * 100:.0f}%"],
    ]
    dist_style = TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0), BRAND),
        ("TEXTCOLOR",    (0, 0), (-1, 0), WHITE),
        ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",     (0, 0), (-1, -1), 10),
        ("ALIGN",        (1, 0), (-1, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F0F9FF"), WHITE]),
        ("GRID",         (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING",   (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
        # Kleur risico-cel
        ("TEXTCOLOR",    (0, 1), (0, 1), RISK_HIGH),
        ("TEXTCOLOR",    (0, 2), (0, 2), RISK_MED),
        ("TEXTCOLOR",    (0, 3), (0, 3), RISK_LOW),
        ("FONTNAME",     (0, 1), (0, -1), "Helvetica-Bold"),
    ])
    dist_col = [content_width * 0.5, content_width * 0.25, content_width * 0.25]
    dist_table = Table(dist_data, colWidths=dist_col)
    dist_table.setStyle(dist_style)
    story.append(dist_table)
    story.append(Spacer(1, 0.5 * cm))

    # Sleutelbevindingen
    story.append(Paragraph("Sleutelbevindingen", STYLES["sub_title"]))
    findings = []

    if has_pattern and top_cluster:
        if len(top_cluster) == 1:
            top_factor, top_score = top_cluster[0]
            findings.append(
                f"<b>{FACTOR_LABELS_NL.get(top_factor, top_factor)}</b> geeft het sterkste aandachtssignaal "
                f"(signaalwaarde {top_score:.1f}/10)."
            )
        else:
            labels = ", ".join(FACTOR_LABELS_NL.get(factor, factor) for factor, _ in top_cluster)
            findings.append(
                f"<b>{labels}</b> liggen dicht bij elkaar en vormen samen de sterkste aandachtssignalen. "
                "Behandel deze volgorde niet als harde rangorde."
            )
    if strong_work_signal_pct is not None:
        findings.append(
            f"Bij <b>{strong_work_signal_pct:.0f}% van het vertrek</b> is sprake van een sterk signaal van beïnvloedbare werkfactoren. "
            "Dit is een hypothese-indicatie, geen causale vaststelling."
        )
    if any_work_signal_pct is not None:
        findings.append(
            f"Bij <b>{any_work_signal_pct:.0f}% van het vertrek</b> is ten minste een gemengd signaal van werkinvloed zichtbaar. "
            "Gebruik dit vooral om vervolgvragen te prioriteren."
        )
    if not findings:
        findings.append("Onvoldoende data voor patroonanalyse (minimaal 10 responses vereist).")

    for f in findings:
        story.append(Paragraph(f"• {f}", STYLES["body"]))

    story.append(PageBreak())

    # ==================================================================== #
    # PAGINA 3 — SDT BASISBEHOEFTEN                                        #
    # ==================================================================== #

    story.append(Paragraph("SDT Basisbehoeften", STYLES["section_title"]))
    story.append(Paragraph(
        "Dit vraagblok is geïnspireerd op de Basic Psychological Need Satisfaction at Work-literatuur "
        "(Van den Broeck et al., 2010; Deci et al., 2001) en gebruikt verkorte, aangepaste items. "
        "Scores < 4.5 wijzen op duidelijke frictie; > 7.0 is overwegend positief.",
        STYLES["body"],
    ))
    story.append(Spacer(1, 0.3 * cm))

    if has_pattern:
        story.append(_sdt_bar_image(sdt_avgs, width_cm=13))
        story.append(Spacer(1, 0.4 * cm))

        # SDT interpretatie-tabel
        sdt_desc = {
            "autonomy":    (
                "Autonomie",
                "De mate waarin medewerkers ervaren dat zij zelf keuzes kunnen maken en "
                "initiatieven kunnen nemen in hun werk.",
            ),
            "competence":  (
                "Competentie",
                "Het gevoel effectief te zijn en de eigen vaardigheden optimaal te benutten. "
                "Lage scores hangen samen met lage zelfeffectiviteit.",
            ),
            "relatedness": (
                "Verbondenheid",
                    "De kwaliteit van de sociale relaties op het werk. Lage verbondenheid "
                    "gaat vaak samen met meer werkfrictie, ook wanneer andere factoren positiever zijn.",
            ),
        }

        sdt_rows = [["Dimensie", "Score", "Interpretatie"]]
        for dim, (label, desc) in sdt_desc.items():
            score = sdt_avgs.get(dim, 5.5)
            if score > 7.0:
                interpret = "Goed — basisbehoeften overwegend vervuld."
            elif score >= 5.5:
                interpret = "Voldoende — geen acute zorgen."
            elif score >= 4.0:
                interpret = "Matig — aandacht gewenst."
            else:
                interpret = "Laag — behoeftefrustatie aanwezig. Directe aandacht vereist."
            sdt_rows.append([label, f"{score:.1f} / 10", interpret])

        sdt_ts = TableStyle([
            ("BACKGROUND",   (0, 0), (-1, 0), BRAND),
            ("TEXTCOLOR",    (0, 0), (-1, 0), WHITE),
            ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",     (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F0F9FF"), WHITE]),
            ("GRID",         (0, 0), (-1, -1), 0.5, BORDER),
            ("TOPPADDING",   (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
            ("ALIGN",        (1, 1), (1, -1), "CENTER"),
            ("FONTNAME",     (1, 1), (1, -1), "Helvetica-Bold"),
        ])
        # Kleur score-cel per waarde inline in stijl
        for row_idx, dim in enumerate(sdt_desc.keys(), start=1):
            score = sdt_avgs.get(dim, 5.5)
            c = RISK_HIGH if score < 4.5 else RISK_MED if score < 7 else RISK_LOW
            sdt_ts.add("TEXTCOLOR", (1, row_idx), (1, row_idx), c)

        sdt_table = Table(sdt_rows, colWidths=[content_width * 0.22, content_width * 0.15, content_width * 0.63])
        sdt_table.setStyle(sdt_ts)
        story.append(sdt_table)

        # Dynamische interpretatie op basis van laagst scorende dimensie
        lowest_dim = min(sdt_avgs.items(), key=lambda x: x[1]) if sdt_avgs else None
        if lowest_dim:
            dim_name, dim_score = lowest_dim
            dim_interp_map = {
                "autonomy":    (
                    "Autonomie scoort het laagst. Dit wijst op beperkte regelruimte en "
                    "beïnvloedt motivatie en betrokkenheid direct."
                ),
                "competence":  (
                    "Competentie scoort het laagst. Medewerkers ervaren onvoldoende ruimte om "
                    "hun vaardigheden effectief in te zetten, wat het zelfvertrouwen ondermijnt."
                ),
                "relatedness": (
                    "Verbondenheid scoort het laagst. De sociale basis op het werk voelt "
                    "kwetsbaar — dit vergroot de kans dat andere fricties harder doorwerken."
                ),
            }
            interp_text = dim_interp_map.get(dim_name, "")
            if interp_text:
                story.append(Spacer(1, 0.25 * cm))
                story.append(Paragraph(interp_text, STYLES["body"]))
    else:
        story.append(Paragraph(
            "Onvoldoende responses voor SDT-rapportage (minimaal 10 vereist).",
            STYLES["body"],
        ))

    story.append(PageBreak())

    # ==================================================================== #
    # PAGINA 4 — ORGANISATIEFACTOREN                                       #
    # ==================================================================== #

    story.append(Paragraph("Organisatiefactoren", STYLES["section_title"]))
    story.append(Paragraph(
        "Deze vraagblokken zijn gebaseerd op verkorte, aangepaste items uit o.a. LMX-, "
        "psychologische veiligheid-, JD-R- en tevredenheidsliteratuur. De uitkomsten zijn bedoeld als "
        "praktische signalen, niet als volledige schaalafname of diagnostisch oordeel.",
        STYLES["body"],
    ))
    story.append(Spacer(1, 0.3 * cm))

    if has_pattern and factor_avgs:
        # Staafdiagram op volledige breedte (radar verwijderd — minder leesbaar)
        bar_img = _factor_bar_image(factor_avgs, width_cm=15.0)
        story.append(bar_img)
        story.append(Spacer(1, 0.4 * cm))

        # Scoretabel
        story.append(Paragraph("Scoretabel per factor", STYLES["sub_title"]))
        story.append(Paragraph(
            "<i>Toelichting: De belevingsscore (1–10) geeft de gemiddelde beleving van medewerkers weer — "
            "hogere belevingsscore is positiever. De signaalwaarde laat zien waar relatief de meeste werkfrictie zit — "
            "hogere signaalwaarde betekent meer aandacht, niet automatisch meer bewijs.</i>",
            ParagraphStyle(
                "score_explanation",
                fontName="Helvetica-Oblique",
                fontSize=8,
                leading=11,
                textColor=MUTED,
                spaceAfter=4,
            ),
        ))
        score_rows = [["Factor", "Belevingsscore", "Signaalwaarde", "Band"]]
        for factor in ORG_FACTOR_KEYS:
            if factor not in factor_avgs:
                continue
            score    = factor_avgs[factor]
            risk_val = round(11 - score, 1)
            if risk_val >= 6.0:
                urgency = "URGENT"
            elif risk_val >= 4.5:
                urgency = "AANDACHT"
            else:
                urgency = "OK"
            score_rows.append([
                FACTOR_LABELS_NL.get(factor, factor),
                f"{score:.1f}",
                f"{risk_val:.1f}",
                urgency,
            ])

        score_ts = TableStyle([
            ("BACKGROUND",   (0, 0), (-1, 0), BRAND),
            ("TEXTCOLOR",    (0, 0), (-1, 0), WHITE),
            ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",     (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F0F9FF"), WHITE]),
            ("GRID",         (0, 0), (-1, -1), 0.5, BORDER),
            ("TOPPADDING",   (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
            ("ALIGN",        (1, 1), (-1, -1), "CENTER"),
            ("FONTNAME",     (3, 1), (3, -1), "Helvetica-Bold"),
        ])
        # Kleur urgentie-cel per rij
        for row_idx, factor in enumerate(
            [f for f in ORG_FACTOR_KEYS if f in factor_avgs], start=1
        ):
            sc       = factor_avgs[factor]
            risk_val = round(11 - sc, 1)
            c = RISK_HIGH if risk_val >= 6.0 else RISK_MED if risk_val >= 4.5 else RISK_LOW
            score_ts.add("TEXTCOLOR", (3, row_idx), (3, row_idx), c)

        score_table = Table(
            score_rows,
            colWidths=[content_width * 0.40, content_width * 0.20, content_width * 0.20, content_width * 0.20],
        )
        score_table.setStyle(score_ts)
        story.append(score_table)

        if len(top_cluster) > 1:
            cluster_labels = ", ".join(FACTOR_LABELS_NL.get(factor, factor) for factor, _ in top_cluster)
            story.append(Spacer(1, 0.2 * cm))
            story.append(Paragraph(
                f"<i>Nuance bij de rangorde: {cluster_labels} liggen qua signaalwaarde dicht bij elkaar. "
                "Lees dit daarom als een cluster van aandachtspunten, niet als een harde eerste-tweede-derde plek.</i>",
                ParagraphStyle(
                    "ranking_note",
                    fontName="Helvetica-Oblique",
                    fontSize=8,
                    leading=11,
                    textColor=MUTED,
                    spaceAfter=4,
                ),
            ))

        # ── Focusvragen per factor (alleen URGENT / AANDACHT) ─────────────
        FOCUS_QUESTIONS: dict[str, str] = {
            "leadership":   "Wat vertellen vertrekkers over de relatie met hun leidinggevende? "
                            "Herkennen leidinggevenden dit beeld, en in welke teams speelt dit het sterkst?",
            "culture":      "Voelden medewerkers zich vrij om problemen te benoemen zonder gevolgen? "
                            "Waar zit het verschil tussen afdelingen of teams?",
            "growth":       "Zijn er concrete groeipaden zichtbaar en bespreekbaar? "
                            "Weten medewerkers wat hun volgende stap kan zijn binnen de organisatie?",
            "compensation": "Hoe verhouden de arbeidsvoorwaarden zich tot de markt? "
                            "Communiceert de organisatie hier actief over, of blijft dit impliciet?",
            "workload":     "Is de werkdruk structureel of piekgebonden? "
                            "Zijn er afdelingen of rollen waar dit significant zwaarder weegt?",
            "role_clarity": "Zijn taken, verwachtingen en verantwoordelijkheden voor iedereen helder? "
                            "Hoe worden nieuwe medewerkers hierin begeleid?",
        }

        urgent_factors = [
            (f, factor_avgs[f])
            for f in ORG_FACTOR_KEYS
            if f in factor_avgs and round(11 - factor_avgs[f], 1) >= 4.5
        ]
        urgent_factors.sort(key=lambda x: x[1])  # laagste score eerst

        if urgent_factors:
            story.append(Spacer(1, 0.5 * cm))
            story.append(Paragraph("Focusvragen per aandachtspunt", STYLES["sub_title"]))
            story.append(Paragraph(
                "<i>Onderstaande vragen zijn afgeleid van de factorscores. "
                "Ze zijn bedoeld als gespreksaanzet voor MT of leidinggevenden — "
                "niet als conclusie.</i>",
                ParagraphStyle(
                    "focus_note",
                    fontName="Helvetica-Oblique",
                    fontSize=8,
                    leading=11,
                    textColor=MUTED,
                    spaceAfter=4,
                ),
            ))
            for factor, score in urgent_factors:
                risk_val = round(11 - score, 1)
                label = FACTOR_LABELS_NL.get(factor, factor)
                question = FOCUS_QUESTIONS.get(factor, "")
                if not question:
                    continue
                urgency_color = RISK_HIGH if risk_val >= 6.0 else RISK_MED
                fq_data = [[
                    Paragraph(
                        f"<b>{label}</b>  <font color='#6B7280' size='8'>"
                        f"score {score:.1f} · signaalwaarde {risk_val:.1f}</font>",
                        STYLES["body_bold"],
                    ),
                ], [
                    Paragraph(question, STYLES["body"]),
                ]]
                fq_ts = TableStyle([
                    ("BACKGROUND",    (0, 0), (-1, 0), BRAND_LIGHT),
                    ("BACKGROUND",    (0, 1), (-1, 1), WHITE),
                    ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#BFDBFE")),
                    ("TOPPADDING",    (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("LEFTPADDING",   (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
                    ("LINEAFTER",     (0, 0), (0, -1), 2.5, urgency_color),
                ])
                fq_table = Table(fq_data, colWidths=[content_width])
                fq_table.setStyle(fq_ts)
                story.append(fq_table)
                story.append(Spacer(1, 0.2 * cm))
    else:
        story.append(Paragraph(
            "Onvoldoende responses voor organisatierapportage (minimaal 10 vereist).",
            STYLES["body"],
        ))

    story.append(PageBreak())

    # ==================================================================== #
    # PAGINA 5 — PATRONEN & VERTREKREDEN / BEVLOGENHEID                   #
    # ==================================================================== #

    if camp.scan_type == "exit":
        story.append(Paragraph("Patronen & Vertrekreden", STYLES["section_title"]))
        story.append(Paragraph(
            "Deze pagina combineert hoofdredenen, meespelende factoren en een indicatieve duiding van werkinvloed. "
            "De uitkomsten helpen om patronen te verkennen, niet om één causale vertrekverklaring vast te stellen.",
            STYLES["body"],
        ))
    else:
        story.append(Paragraph("Bevlogenheid & Vertrekintentie", STYLES["section_title"]))

    story.append(Spacer(1, 0.3 * cm))

    if has_pattern:
        if camp.scan_type == "exit":
            # Vertrekreden tabel
            top_reasons = pattern.get("top_exit_reasons", [])
            if top_reasons:
                story.append(Paragraph("Hoofdredenen van vertrek", STYLES["sub_title"]))
                reason_rows = [["Code", "Reden", "Aantal"]]
                for item in top_reasons:
                    reason_rows.append([item["code"], item["label"], str(item["count"])])
                reason_ts = TableStyle([
                    ("BACKGROUND",   (0, 0), (-1, 0), BRAND),
                    ("TEXTCOLOR",    (0, 0), (-1, 0), WHITE),
                    ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE",     (0, 0), (-1, -1), 9),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F0F9FF"), WHITE]),
                    ("GRID",         (0, 0), (-1, -1), 0.5, BORDER),
                    ("TOPPADDING",   (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
                    ("ALIGN",        (2, 1), (2, -1), "CENTER"),
                    ("FONTNAME",     (2, 1), (2, -1), "Helvetica-Bold"),
                ])
                reason_table = Table(
                    reason_rows,
                    colWidths=[content_width * 0.12, content_width * 0.70, content_width * 0.18],
                )
                reason_table.setStyle(reason_ts)
                story.append(reason_table)

                # ── Push/Pull/Situationeel verdeling (Item 13) ────────────
                exit_reason_counts = pattern.get("exit_reason_counts", {})
                total_n = 0
                if exit_reason_counts:
                    push_n  = sum(v for k, v in exit_reason_counts.items() if k.startswith("P") and not k.startswith("PL"))
                    pull_n  = sum(v for k, v in exit_reason_counts.items() if k.startswith("PL"))
                    situ_n  = sum(v for k, v in exit_reason_counts.items() if k.startswith("S"))
                    total_n = push_n + pull_n + situ_n
                if total_n > 0:
                    push_pct = round(push_n / total_n * 100)
                    pull_pct = round(pull_n / total_n * 100)
                    situ_pct = round(situ_n / total_n * 100)
                    story.append(Spacer(1, 0.3 * cm))
                    story.append(Paragraph(
                        f"<b>Interne werkgerelateerde redenen:</b> {push_pct}%  |  "
                        f"<b>Externe alternatieven:</b> {pull_pct}%  |  "
                        f"<b>Persoonlijk / situationeel:</b> {situ_pct}%",
                        ParagraphStyle(
                            "factor_dist",
                            fontName="Helvetica",
                            fontSize=9,
                            leading=13,
                            textColor=TEXT,
                            spaceAfter=4,
                        ),
                    ))

                contributing_reasons = pattern.get("top_contributing_reasons", [])
                if contributing_reasons:
                    story.append(Spacer(1, 0.3 * cm))
                    story.append(Paragraph("Meespelende factoren", STYLES["sub_title"]))
                    contrib_rows = [["Reden", "Aantal"]]
                    for item in contributing_reasons[:4]:
                        contrib_rows.append([item["label"], str(item["count"])])
                    contrib_table = Table(
                        contrib_rows,
                        colWidths=[content_width * 0.78, content_width * 0.22],
                    )
                    contrib_table.setStyle(TableStyle([
                        ("BACKGROUND", (0, 0), (-1, 0), BRAND),
                        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F0F9FF"), WHITE]),
                        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
                        ("ALIGN", (1, 1), (1, -1), "CENTER"),
                        ("TOPPADDING", (0, 0), (-1, -1), 5),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ]))
                    story.append(contrib_table)
                    story.append(Spacer(1, 0.3 * cm))

                story.append(Spacer(1, 0.5 * cm))

                # ── Anonymized quotes (Item 14) ────────────────────────────
                quotes = _select_relevant_quotes(
                    [
                        r.open_text_raw
                        for r in responses
                        if r.open_text_raw and r.open_text_raw.strip()
                    ],
                    [factor for factor, _ in top_risks[:3]],
                    [item["code"] for item in top_reasons],
                    max_quotes=4,
                )
                if len(quotes) >= 3:
                    story.append(Paragraph("Stemmen uit de survey", STYLES["sub_title"]))
                    for i, q in enumerate(quotes):
                        q_trimmed = q[:120] + ("…" if len(q) > 120 else "")
                        story.append(Paragraph(
                            f"<i>— {q_trimmed}</i>",
                            ParagraphStyle(
                                f"quote_{i}",
                                fontName="Helvetica-Oblique",
                                fontSize=9,
                                leading=13,
                                textColor=MUTED,
                                leftIndent=12,
                                spaceAfter=4,
                            ),
                        ))
                        if i < len(quotes) - 1:
                            story.append(Spacer(1, 0.1 * cm))
                    story.append(Spacer(1, 0.3 * cm))

            # Preventability
            prev_counts = pattern.get("preventability_counts", {})
            prev_img    = _preventability_image(prev_counts)
            if prev_img:
                story.append(Paragraph("Signaal van beïnvloedbare werkfactoren", STYLES["sub_title"]))
                story.append(Paragraph(
                    "Deze classificatie combineert hoofdreden, aanvullende redenen, ervaren invloed van organisatiegedrag "
                    "en werkgerelateerde scores. De uitkomst is indicatief en benoemt alleen hoe sterk de antwoorden wijzen "
                    "op beïnvloedbare werkfactoren rondom vertrek.",
                    STYLES["body"],
                ))

                prev_table_data = [[prev_img, ""]]
                prev_table_data[0][1] = Table([
                    [Paragraph("<b>Sterk werkfactorsignaal</b>", STYLES["body"]),
                     Paragraph(f"{prev_counts.get('STERK_WERKSIGNAAL', 0)} responses", STYLES["body"])],
                    [Paragraph("<b>Gemengd signaal</b>", STYLES["body"]),
                     Paragraph(f"{prev_counts.get('GEMENGD_WERKSIGNAAL', 0)} responses", STYLES["body"])],
                    [Paragraph("<b>Beperkt signaal</b>", STYLES["body"]),
                     Paragraph(f"{prev_counts.get('BEPERKT_WERKSIGNAAL', 0)} responses", STYLES["body"])],
                ], colWidths=[content_width * 0.30, content_width * 0.22])

                side_table = Table(
                    prev_table_data,
                    colWidths=[content_width * 0.42, content_width * 0.58],
                )
                side_table.setStyle(TableStyle([
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ]))
                story.append(side_table)

        # Afdeling-risico
        dept_risks = pattern.get("department_avg_risk", {})
        # Bouw een n-telling per afdeling
        dept_n_counts: dict[str, int] = {}
        for r in responses:
            dept_key = r.respondent.department or "Onbekend"
            dept_n_counts[dept_key] = dept_n_counts.get(dept_key, 0) + 1

        if dept_risks:
            story.append(Spacer(1, 0.4 * cm))
            story.append(Paragraph("Frictiescore per afdeling", STYLES["sub_title"]))
            story.append(Paragraph(
                f"<i>Alleen afdelingen met minimaal {MIN_SEGMENT_N} responses worden getoond om ruis en schijnprecisie te beperken.</i>",
                ParagraphStyle(
                    "segment_note_dept",
                    fontName="Helvetica-Oblique",
                    fontSize=8,
                    leading=11,
                    textColor=MUTED,
                    spaceAfter=4,
                ),
            ))
            dept_rows = [["Afdeling", "n", "Gem. frictiescore"]]
            for dept, score in sorted(dept_risks.items(), key=lambda x: x[1], reverse=True):
                n_dept = dept_n_counts.get(dept, 0)
                dept_rows.append([dept, str(n_dept), f"{score:.1f} / 10"])
            dept_ts = TableStyle([
                ("BACKGROUND",   (0, 0), (-1, 0), BRAND),
                ("TEXTCOLOR",    (0, 0), (-1, 0), WHITE),
                ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE",     (0, 0), (-1, -1), 9),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F0F9FF"), WHITE]),
                ("GRID",         (0, 0), (-1, -1), 0.5, BORDER),
                ("TOPPADDING",   (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
                ("ALIGN",        (1, 1), (2, -1), "CENTER"),
                ("FONTNAME",     (2, 1), (2, -1), "Helvetica-Bold"),
            ])
            for row_idx, (dept, score) in enumerate(
                sorted(dept_risks.items(), key=lambda x: x[1], reverse=True), start=1
            ):
                c = RISK_HIGH if score >= 7 else RISK_MED if score >= 4.5 else RISK_LOW
                dept_ts.add("TEXTCOLOR", (2, row_idx), (2, row_idx), c)

            dept_table = Table(dept_rows, colWidths=[content_width * 0.55, content_width * 0.10, content_width * 0.35])
            dept_table.setStyle(dept_ts)
            story.append(dept_table)

        # ── Diensttijd segmentatie (Item 11) ──────────────────────────────
        tenure_buckets: dict[str, list[float]] = {
            "< 1 jaar": [], "1–3 jaar": [], "3–5 jaar": [], "5+ jaar": [],
        }
        for r in responses:
            tenure = r.tenure_years
            if tenure is None:
                continue
            risk = r.risk_score
            if risk is None:
                continue
            if tenure < 1.0:
                tenure_buckets["< 1 jaar"].append(risk)
            elif tenure < 3.0:
                tenure_buckets["1–3 jaar"].append(risk)
            elif tenure < 5.0:
                tenure_buckets["3–5 jaar"].append(risk)
            else:
                tenure_buckets["5+ jaar"].append(risk)

        has_tenure_data = any(len(v) > 0 for v in tenure_buckets.values())
        if has_tenure_data:
            filtered_tenure = {label: vals for label, vals in tenure_buckets.items() if len(vals) >= MIN_SEGMENT_N}
        else:
            filtered_tenure = {}
        if filtered_tenure:
            story.append(Spacer(1, 0.4 * cm))
            story.append(Paragraph("Vertrek naar diensttijd", STYLES["sub_title"]))
            story.append(Paragraph(
                f"<i>Alleen groepen met minimaal {MIN_SEGMENT_N} responses worden getoond.</i>",
                ParagraphStyle(
                    "segment_note_tenure",
                    fontName="Helvetica-Oblique",
                    fontSize=8,
                    leading=11,
                    textColor=MUTED,
                    spaceAfter=4,
                ),
            ))
            tenure_rows = [["Diensttijd", "n", "Gem. frictiescore"]]
            for label, scores_list in filtered_tenure.items():
                n_t = len(scores_list)
                avg_t = round(sum(scores_list) / n_t, 1) if n_t > 0 else None
                tenure_rows.append([
                    label,
                    str(n_t),
                    f"{avg_t:.1f} / 10" if avg_t is not None else "–",
                ])
            tenure_ts = TableStyle([
                ("BACKGROUND",   (0, 0), (-1, 0), BRAND),
                ("TEXTCOLOR",    (0, 0), (-1, 0), WHITE),
                ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE",     (0, 0), (-1, -1), 9),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F0F9FF"), WHITE]),
                ("GRID",         (0, 0), (-1, -1), 0.5, BORDER),
                ("TOPPADDING",   (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
                ("ALIGN",        (1, 1), (2, -1), "CENTER"),
                ("FONTNAME",     (2, 1), (2, -1), "Helvetica-Bold"),
            ])
            for row_idx, (lbl, scores_list) in enumerate(filtered_tenure.items(), start=1):
                if scores_list:
                    avg_t = sum(scores_list) / len(scores_list)
                    c = RISK_HIGH if avg_t >= 7 else RISK_MED if avg_t >= 4.5 else RISK_LOW
                    tenure_ts.add("TEXTCOLOR", (2, row_idx), (2, row_idx), c)
            tenure_table = Table(tenure_rows, colWidths=[content_width * 0.55, content_width * 0.10, content_width * 0.35])
            tenure_table.setStyle(tenure_ts)
            story.append(tenure_table)

        # ── Functieniveau segmentatie (Item 12) ───────────────────────────
        ROLE_LEVEL_ORDER = ["uitvoerend", "specialist", "senior", "manager"]
        role_risks: dict[str, list[float]] = {}
        for r in responses:
            rl = r.respondent.role_level
            if not rl:
                continue
            risk = r.risk_score
            if risk is None:
                continue
            role_risks.setdefault(rl, []).append(risk)

        filtered_role_risks = {
            role: vals for role, vals in role_risks.items() if len(vals) >= MIN_SEGMENT_N
        }

        if filtered_role_risks:
            story.append(Spacer(1, 0.4 * cm))
            story.append(Paragraph("Vertrek naar functieniveau", STYLES["sub_title"]))
            story.append(Paragraph(
                f"<i>Alleen groepen met minimaal {MIN_SEGMENT_N} responses worden getoond.</i>",
                ParagraphStyle(
                    "segment_note_role",
                    fontName="Helvetica-Oblique",
                    fontSize=8,
                    leading=11,
                    textColor=MUTED,
                    spaceAfter=4,
                ),
            ))
            role_rows = [["Functieniveau", "n", "Gem. frictiescore"]]
            ordered_roles = sorted(
                filtered_role_risks.items(),
                key=lambda x: ROLE_LEVEL_ORDER.index(x[0]) if x[0] in ROLE_LEVEL_ORDER else 99,
            )
            for rl, scores_list in ordered_roles:
                n_r   = len(scores_list)
                avg_r = round(sum(scores_list) / n_r, 1) if n_r > 0 else None
                role_rows.append([rl.capitalize(), str(n_r), f"{avg_r:.1f} / 10" if avg_r is not None else "–"])
            role_ts = TableStyle([
                ("BACKGROUND",   (0, 0), (-1, 0), BRAND),
                ("TEXTCOLOR",    (0, 0), (-1, 0), WHITE),
                ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE",     (0, 0), (-1, -1), 9),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F0F9FF"), WHITE]),
                ("GRID",         (0, 0), (-1, -1), 0.5, BORDER),
                ("TOPPADDING",   (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
                ("ALIGN",        (1, 1), (2, -1), "CENTER"),
                ("FONTNAME",     (2, 1), (2, -1), "Helvetica-Bold"),
            ])
            for row_idx, (rl, scores_list) in enumerate(ordered_roles, start=1):
                if scores_list:
                    avg_r = sum(scores_list) / len(scores_list)
                    c = RISK_HIGH if avg_r >= 7 else RISK_MED if avg_r >= 4.5 else RISK_LOW
                    role_ts.add("TEXTCOLOR", (2, row_idx), (2, row_idx), c)
            role_table = Table(role_rows, colWidths=[content_width * 0.55, content_width * 0.10, content_width * 0.35])
            role_table.setStyle(role_ts)
            story.append(role_table)

        if has_segment_deep_dive:
            story.append(Spacer(1, 0.5 * cm))
            story.append(Paragraph("Segment deep dive", STYLES["sub_title"]))
            story.append(Paragraph(
                "Deze add-on vergelijkt subgroepen expliciet met het organisatieniveau. "
                "Zo zie je scherper waar frictie zich concentreert en welke thema's daar relatief het meest opvallen.",
                STYLES["body"],
            ))

            coverage = segment_deep_dive.get("coverage", {})
            coverage_rows = [[
                "Metadata",
                "Bekend in responses",
            ]]
            coverage_specs = [
                ("Afdeling", coverage.get("department", 0)),
                ("Functieniveau", coverage.get("role_level", 0)),
                ("Diensttijd", coverage.get("tenure", 0)),
            ]
            for label, count in coverage_specs:
                coverage_rows.append([label, f"{count} van {n_completed}"])

            coverage_table = Table(
                coverage_rows,
                colWidths=[content_width * 0.45, content_width * 0.55],
            )
            coverage_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#DBEAFE")),
                ("TEXTCOLOR", (0, 0), (-1, 0), BRAND_DARK),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F8FBFF"), WHITE]),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BFDBFE")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]))
            story.append(coverage_table)

            deep_dive_rows = segment_deep_dive.get("rows", [])
            if deep_dive_rows:
                story.append(Spacer(1, 0.25 * cm))
                story.append(Paragraph(
                    "Onderstaande groepen wijken het meest af van de gemiddelde frictiescore van de organisatie.",
                    STYLES["body"],
                ))
                table_rows = [[
                    "Segment",
                    "Groep",
                    "n",
                    "Gem. frictiescore",
                    "Vs. org",
                    "Relatief opvallende thema's",
                ]]
                for row in deep_dive_rows:
                    delta = row["delta_vs_org"]
                    delta_prefix = "+" if delta > 0 else ""
                    highlights = ", ".join(row["top_factor_labels"]) if row["top_factor_labels"] else None
                    table_rows.append([
                        _segment_type_label(row["segment_type"]),
                        row["segment_label"],
                        str(row["n"]),
                        f"{row['avg_risk']:.1f} / 10",
                        f"{delta_prefix}{delta:.1f}",
                        (
                            f"{highlights}. {_segment_note(delta)}"
                            if highlights else
                            _segment_note(delta)
                        ),
                    ])

                deep_dive_table = Table(
                    table_rows,
                    colWidths=[
                        content_width * 0.13,
                        content_width * 0.18,
                        content_width * 0.07,
                        content_width * 0.14,
                        content_width * 0.10,
                        content_width * 0.38,
                    ],
                )
                deep_dive_style = TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), BRAND),
                    ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F8FBFF"), WHITE]),
                    ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("ALIGN", (2, 1), (4, -1), "CENTER"),
                    ("FONTNAME", (3, 1), (4, -1), "Helvetica-Bold"),
                ])
                for row_idx, row in enumerate(deep_dive_rows, start=1):
                    risk_color = RISK_HIGH if row["avg_risk"] >= 7 else RISK_MED if row["avg_risk"] >= 4.5 else RISK_LOW
                    delta_color = RISK_HIGH if row["delta_vs_org"] >= 0.5 else RISK_LOW if row["delta_vs_org"] <= -0.5 else MUTED
                    deep_dive_style.add("TEXTCOLOR", (3, row_idx), (3, row_idx), risk_color)
                    deep_dive_style.add("TEXTCOLOR", (4, row_idx), (4, row_idx), delta_color)
                deep_dive_table.setStyle(deep_dive_style)
                story.append(deep_dive_table)
            else:
                story.append(Spacer(1, 0.25 * cm))
                story.append(Paragraph(
                    "Voor deze campagne waren nog te weinig consistente subgroepen beschikbaar om contrasten betrouwbaar uit te lichten. "
                    "De add-on is wel geactiveerd, maar vraagt in de praktijk voldoende responses en nette metadata per respondent.",
                    STYLES["body"],
                ))

    else:
        story.append(Paragraph(
            "Onvoldoende responses voor patroonrapportage (minimaal 10 vereist).",
            STYLES["body"],
        ))

    story.append(PageBreak())

    # ==================================================================== #
    # PAGINA 6 — WAT NU?                                                   #
    # ==================================================================== #

    story.append(Paragraph("Werkhypothesen & Vervolgstappen", STYLES["section_title"]))
    story.append(Paragraph(
        "De scores laten zien <i>waar</i> aandacht nodig is. Ze bewijzen nog niet <i>waarom</i> iets speelt. "
        "Gebruik de hypothesen hieronder om gericht te toetsen wat achter deze signalen zit, voordat je acties bepaalt.",
        STYLES["body"],
    ))
    story.append(Spacer(1, 0.5 * cm))

    if has_pattern and camp.scan_type == "exit":
        hypotheses = _build_exit_hypotheses(
            top_risks=top_risks,
            top_exit_reasons=pattern.get("top_exit_reasons", []),
            top_contributing_reasons=pattern.get("top_contributing_reasons", []),
            factor_avgs=factor_avgs,
        )
        if hypotheses:
            story.append(Paragraph("Werkhypothesen", STYLES["sub_title"]))
            story.append(Paragraph(
                "Onderstaande hypothesen zijn afgeleid van scorepatronen, vertrekredenen en meespelende factoren. "
                "Ze zijn bedoeld om te valideren in gesprek met HR, leidinggevenden of aanvullende data.",
                STYLES["body"],
            ))
            for item in hypotheses:
                hyp_rows = [
                    [Paragraph(f"<b>{item['title']}</b>", STYLES["body_bold"])],
                    [Paragraph(item["body"], STYLES["body"])],
                    [Paragraph(f"<i>Te toetsen vraag:</i> {item['question']}", STYLES["body"])],
                ]
                hyp_table = Table(hyp_rows, colWidths=[content_width])
                hyp_table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EFF6FF")),
                    ("BACKGROUND", (0, 1), (-1, -1), WHITE),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BFDBFE")),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ]))
                story.append(hyp_table)
                story.append(Spacer(1, 0.2 * cm))

            story.append(Spacer(1, 0.2 * cm))

    # ── Gespreksagenda op basis van top risicofactoren ────────────────────
    AGENDA_QUESTIONS: dict[str, list[str]] = {
        "leadership": [
            "Herkennen leidinggevenden het beeld dat uit de scores naar voren komt?",
            "In welke teams of afdelingen speelt dit het sterkst, en wat maakt dat zo?",
            "Wat hebben medewerkers nodig van hun leidinggevende dat nu ontbreekt?",
        ],
        "culture": [
            "Voelen medewerkers zich vrij om problemen te benoemen zonder gevolgen?",
            "Zijn er situaties geweest waarbij dat gevoel van veiligheid onder druk stond?",
            "Wat zou de organisatie concreet anders kunnen doen om dit te versterken?",
        ],
        "growth": [
            "Weten medewerkers wat hun volgende stap binnen de organisatie kan zijn?",
            "Hoe bespreekbaar zijn loopbaanontwikkeling en groei in de dagelijkse praktijk?",
            "Waar zit het verschil tussen wat de organisatie biedt en wat medewerkers verwachten?",
        ],
        "compensation": [
            "Hoe verhouden de arbeidsvoorwaarden zich tot vergelijkbare functies in de markt?",
            "Is er transparantie over hoe beloning wordt bepaald en wat er mogelijk is?",
            "Spelen non-financiële factoren (flexibiliteit, erkenning) ook een rol?",
        ],
        "workload": [
            "Is de werkdruk structureel of piekgebonden — en weet de organisatie dat onderscheid te maken?",
            "Zijn er afdelingen of rollen waar dit significant zwaarder weegt dan elders?",
            "Wat zou een medewerker helpen om de werkdruk beter hanteerbaar te maken?",
        ],
        "role_clarity": [
            "Zijn taken, verwachtingen en verantwoordelijkheden voor iedereen helder?",
            "Hoe worden nieuwe medewerkers ingewerkt en begeleid in hun rol?",
            "Waar ontstaan de meeste misverstanden over wie waarvoor verantwoordelijk is?",
        ],
    }

    top2_factors = top_risks[:2] if has_pattern and top_risks else []
    top2_labels  = [FACTOR_LABELS_NL.get(f, f) for f, _ in top2_factors]

    if top2_factors:
        story.append(Paragraph("Gespreksagenda", STYLES["sub_title"]))
        story.append(Paragraph(
            "Bespreek deze vragen in een MT-sessie of met de betrokken leidinggevenden. "
            "De agenda is gebaseerd op de twee factoren met de hoogste signaalwaarde in dit rapport.",
            STYLES["body"],
        ))
        story.append(Spacer(1, 0.3 * cm))

        for factor, risk_score in top2_factors:
            label     = FACTOR_LABELS_NL.get(factor, factor)
            questions = AGENDA_QUESTIONS.get(factor, [])
            risk_val  = round(11 - factor_avgs.get(factor, 5.5), 1)

            agenda_rows = [[
                Paragraph(
                    f"<b>{label}</b>  "
                        f"<font color='#6B7280' size='8'>signaalwaarde {risk_val:.1f} / 10</font>",
                    STYLES["body_bold"],
                ),
            ]]
            for q in questions:
                agenda_rows.append([Paragraph(f"· {q}", STYLES["body"])])

            ag_ts = TableStyle([
                ("BACKGROUND",    (0, 0), (-1, 0), BRAND_LIGHT),
                ("BACKGROUND",    (0, 1), (-1, -1), WHITE),
                ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#BFDBFE")),
                ("TOPPADDING",    (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING",   (0, 0), (-1, -1), 10),
                ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
                ("LINEAFTER",     (0, 0), (0, -1), 3, RISK_MED if risk_val < 6 else RISK_HIGH),
            ])
            ag_table = Table(agenda_rows, colWidths=[content_width])
            ag_table.setStyle(ag_ts)
            story.append(ag_table)
            story.append(Spacer(1, 0.3 * cm))

    story.append(Spacer(1, 0.3 * cm))

    # ── Vervolgstappen ────────────────────────────────────────────────────
    story.append(Paragraph("Vervolgstappen", STYLES["sub_title"]))

    action_steps = [
        (
            "1",
            "Bespreek dit rapport intern — binnen 2 weken",
            "Deel de bevindingen met het MT en de direct betrokken leidinggevenden. "
            + (
                f"Focus het gesprek op <b>{' en '.join(top2_labels)}</b> — "
                "de gespreksagenda hierboven helpt structuur te geven."
                if top2_labels else
                "Gebruik de focusvragen uit dit rapport als gespreksaanzet."
            ),
        ),
        (
            "2",
            "Stel per aandachtspunt een eigenaar aan",
            "Koppel elk thema aan één verantwoordelijke — leidinggevende of HR-adviseur. "
            "Zonder eigenaar blijft een bevinding een bevinding.",
        ),
        (
            "3",
            "Bepaal samen wat je gaat doen — maximaal 3 acties",
            "Wat concreet te doen weet het team zelf het best. "
            "Beperk je tot maximaal 3 acties tegelijk om focus te houden.",
        ),
        (
            "4",
            "Stel een evaluatiemoment in — binnen 90 dagen",
            "Plan nu al wanneer je terugkijkt: zijn de acties uitgevoerd? Zijn er nieuwe signalen? "
            "Zet het in de agenda voordat dit rapport in de la verdwijnt.",
        ),
        (
            "5",
            "Herhaal de ExitScan — elk kwartaal of halfjaarlijks",
            "Eenmalige data is een momentopname. Patroonherkenning ontstaat pas bij meerdere metingen. "
            "Continuïteit maakt de investering rendabel.",
        ),
    ]

    for step_num, step_title, step_body in action_steps:
        step_data = [[
            Paragraph(f"<b>{step_num}</b>", ParagraphStyle(
                f"step_num_{step_num}",
                fontName="Helvetica-Bold",
                fontSize=14,
                textColor=BRAND,
                alignment=TA_CENTER,
            )),
            Table(
                [
                    [Paragraph(f"<b>{step_title}</b>", STYLES["body_bold"])],
                    [Paragraph(step_body, STYLES["body"])],
                ],
                colWidths=[content_width * 0.83],
            ),
        ]]
        step_ts = TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#F0F9FF")),
            ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#BFDBFE")),
            ("VALIGN",        (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING",    (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING",   (0, 0), (-1, -1), 10),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ])
        step_table = Table(step_data, colWidths=[content_width * 0.10, content_width * 0.90])
        step_table.setStyle(step_ts)
        story.append(step_table)
        story.append(Spacer(1, 0.2 * cm))

    story.append(Spacer(1, 0.4 * cm))

    # Contact-blok
    contact_data = [[
        Paragraph(
            "<b>Vragen over dit rapport?</b><br/>"
            "Neem contact op via <font color='#2563EB'>hallo@verisight.nl</font>. "
            "We lopen graag de bevindingen met je door en denken mee over vervolgstappen.",
            ParagraphStyle(
                "contact_note",
                fontName="Helvetica",
                fontSize=9,
                leading=14,
                textColor=TEXT,
            ),
        )
    ]]
    contact_ts = TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BRAND_LIGHT),
        ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#BFDBFE")),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 12),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
    ])
    contact_table = Table(contact_data, colWidths=[content_width])
    contact_table.setStyle(contact_ts)
    story.append(contact_table)

    story.append(PageBreak())

    # ==================================================================== #
    # PAGINA 8 — METHODIEK & VERANTWOORDING                                #
    # ==================================================================== #

    story.append(Paragraph("Methodiek & Verantwoording", STYLES["section_title"]))
    story.append(Paragraph(
        "Dit rapport is opgebouwd uit verkorte vraagblokken die inhoudelijk zijn geïnspireerd door bestaande wetenschappelijke literatuur. "
        "Het gaat nadrukkelijk niet om volledige schaalafnames of een diagnostisch instrument. "
        "De relatieve weging van factoren is expertgedreven en bedoeld voor prioritering in gesprek.",
        STYLES["body"],
    ))
    story.append(Spacer(1, 0.4 * cm))

    # ── Hoe werkt de frictiescore? ───────────────────────────────────────
    story.append(Paragraph("Hoe wordt de frictiescore berekend?", STYLES["sub_title"]))
    story.append(Paragraph(
        "Elke respondent krijgt een frictiescore op een schaal van 1 tot 10. "
        "Een hogere score betekent meer signalen van ontevredenheid of frictie in de werkomgeving. "
        "De score is indicatief en bedoeld als gespreksinput, niet als causale voorspelling, benchmark of objectief oordeel. "
        "De score is een gewogen gemiddelde van zeven factoren:",
        STYLES["body"],
    ))
    story.append(Spacer(1, 0.2 * cm))

    weight_rows = [
        ["Factor", "Gewicht", "Richting in literatuur"],
        ["Leiderschap", "2.5 ×", "In de literatuur sterk geassocieerd met vrijwillig verloop (o.a. LMX-onderzoek)"],
        ["SDT Werkbeleving", "2.0 ×", "Breed signaal voor motivatie, betrokkenheid en retentie"],
        ["Psychologische veiligheid & cultuurmatch", "1.5 ×", "Psychologische veiligheid en waardenfit hangen samen met retentie"],
        ["Groeiperspectief", "1.5 ×", "Ontwikkel- en perspectiefsignaal in de literatuur (JD-R)"],
        ["Beloning & voorwaarden", "1.0 ×", "Hygiënefactor — drempelwaarde-effect"],
        ["Werkbelasting", "1.0 ×", "Werkbelasting werkt vaak als versterkende contextfactor (JD-R)"],
        ["Rolhelderheid", "1.0 ×", "Basale verwachting (Rizzo, House & Lirtzman, 1970)"],
    ]
    w_ts = TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), BRAND),
        ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [colors.HexColor("#F0F9FF"), WHITE]),
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ALIGN",         (1, 1), (1, -1), "CENTER"),
        ("FONTNAME",      (1, 1), (1, -1), "Helvetica-Bold"),
    ])
    w_table = Table(
        weight_rows,
        colWidths=[content_width * 0.28, content_width * 0.12, content_width * 0.60],
    )
    w_table.setStyle(w_ts)
    story.append(w_table)
    story.append(Spacer(1, 0.4 * cm))

    # ── Signaalbanden ─────────────────────────────────────────────────────
    story.append(Paragraph("Wat betekenen de signaalbanden?", STYLES["sub_title"]))
    band_rows = [
        ["Band", "Score", "Betekenis voor de organisatie"],
        ["LAAG",   "< 4.5",   "Overwegend positief beeld. Er zijn relatief weinig signalen van werkfrictie in de antwoorden."],
        ["MIDDEN", "4.5–7.0", "Gemengd beeld. Er zijn meerdere aandachtspunten, maar de uitkomst vraagt vooral nadere verificatie."],
        ["HOOG",   "≥ 7.0",   "Sterk signaal van ervaren werkfrictie. Dit vraagt om nadere analyse, niet automatisch om een harde conclusie."],
    ]
    band_ts = TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), BRAND),
        ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [colors.HexColor("#F0F9FF"), WHITE]),
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ALIGN",         (0, 1), (1, -1), "CENTER"),
        ("FONTNAME",      (0, 1), (1, -1), "Helvetica-Bold"),
        ("TEXTCOLOR",     (0, 1), (1, 1), RISK_LOW),
        ("TEXTCOLOR",     (0, 2), (1, 2), RISK_MED),
        ("TEXTCOLOR",     (0, 3), (1, 3), RISK_HIGH),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ])
    band_table = Table(
        band_rows,
        colWidths=[content_width * 0.14, content_width * 0.13, content_width * 0.73],
    )
    band_table.setStyle(band_ts)
    story.append(band_table)
    story.append(Spacer(1, 0.4 * cm))

    # ── Wat betekent elke factor? ─────────────────────────────────────────
    story.append(Paragraph("Wat betekent elke factor?", STYLES["sub_title"]))
    factor_explanations = [
        ("Leiderschap", "LMX-7 (Graen & Uhl-Bien, 1995)",
         "Meet in verkorte vorm de ervaren relatiekwaliteit met de leidinggevende: feedback, "
         "interesse in ontwikkeling en vertrouwen."),
        ("Psychologische veiligheid & cultuurmatch", "Psychological Safety / waardenfit",
         "Meet in verkorte vorm psychologische veiligheid en of de werkomgeving als passend werd ervaren."),
        ("Groeiperspectief", "JD-R Resources-component",
         "Meet ervaren ontwikkelruimte, investering in ontwikkeling en loopbaanperspectief."),
        ("Beloning & voorwaarden", "Job Satisfaction Survey (Spector, 1985)",
         "Meet ervaren marktconformiteit, eerlijkheid en aansluiting van de totale arbeidsvoorwaarden."),
        ("Werkbelasting", "JD-R Demands-component",
         "Meet of de werkdruk haalbaar was en of er voldoende hersteltijd was. "
         "Vragen zijn positief geformuleerd: hoge score = werkdruk als acceptabel ervaren = lager aandachtssignaal."),
        ("Rolhelderheid", "Role Conflict & Ambiguity Scale (Rizzo et al., 1970)",
         "Meet of taken en verwachtingen duidelijk waren en of tegenstrijdige aansturing beperkt bleef."),
    ]

    for fname, source, explanation in factor_explanations:
        story.append(Paragraph(
            f"<b>{fname}</b> <font color='#6B7280' size='8'>({source})</font>",
            STYLES["body_bold"],
        ))
        story.append(Paragraph(explanation, STYLES["body"]))
        story.append(Spacer(1, 0.15 * cm))

    story.append(Spacer(1, 0.3 * cm))

    # ── Statistische betrouwbaarheid ──────────────────────────────────────
    story.append(Paragraph("Statistische betrouwbaarheid", STYLES["sub_title"]))
    story.append(Paragraph(
        "Scores, patroonanalyse en grafieken worden alleen getoond bij minimaal 10 responses. "
        f"Subgroepvergelijkingen worden alleen getoond vanaf minimaal {MIN_SEGMENT_N} responses per subgroep. "
        "Bij kleinere groepen zijn de uitkomsten te gevoelig voor toeval, interpretatiefouten en herleidbaarheid. "
        "Alle zichtbare uitkomsten blijven indicatief en dienen als gespreksinput — niet als statistische conclusie. "
        "Alle resultaten worden uitsluitend op gegroepeerd niveau gedeeld, conform de AVG.",
        STYLES["body"],
    ))

    if has_segment_deep_dive:
        story.append(Paragraph(
            "Bij de add-on Segment deep dive worden subgroepen expliciet afgezet tegen het organisatieniveau. "
            "Die vergelijking blijft beschrijvend: de verdieping laat zien waar frictie relatief sterker of zwakker terugkomt, "
            "maar bewijst geen oorzaak.",
            STYLES["body"],
        ))

    story.append(Spacer(1, 0.5 * cm))

    # Bronnenlijst
    story.append(Paragraph("Bronnen", STYLES["sub_title"]))
    refs = [
        "Bakker, A. B., & Demerouti, E. (2007). The Job Demands-Resources model. <i>Journal of Managerial Psychology, 22</i>(3), 309–328.",
        "Deci, E. L., & Ryan, R. M. (2000). The 'what' and 'why' of goal pursuits. <i>Psychological Inquiry, 11</i>(4), 227–268.",
        "Edmondson, A. C. (1999). Psychological safety and learning behavior in work teams. <i>Administrative Science Quarterly, 44</i>(2), 350–383.",
        "Gallup (2023). <i>State of the Global Workplace Report.</i> Washington D.C.: Gallup Press. (Aangehaald voor richting in factorweging; geen peer-reviewed bron.)",
        "Graen, G. B., & Uhl-Bien, M. (1995). Relationship-based approach to leadership. <i>The Leadership Quarterly, 6</i>(2), 219–247.",
        "Holtom, B. C., et al. (2008). Turnover and retention research. <i>Academy of Management Annals, 2</i>(1), 231–274.",
        "Rizzo, J. R., House, R. J., & Lirtzman, S. I. (1970). Role conflict and ambiguity in complex organizations. <i>Administrative Science Quarterly, 15</i>(2), 150–163.",
        "Spector, P. E. (1985). Measurement of human service staff satisfaction. <i>American Journal of Community Psychology, 13</i>(6), 693–713.",
        "Van den Broeck, A., et al. (2010). Capturing autonomy, competence, and relatedness at work. <i>Journal of Occupational and Organizational Psychology, 83</i>(4), 981–1002.",
    ]
    for ref in refs:
        story.append(Paragraph(f"• {ref}", ParagraphStyle(
            "ref",
            fontName="Helvetica",
            fontSize=7.5,
            leading=11,
            textColor=MUTED,
            spaceAfter=3,
            leftIndent=8,
        )))

    # ── Build ──────────────────────────────────────────────────────────────
    doc.build(story)
    return buf.getvalue()
