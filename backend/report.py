"""
Verisight — PDF-rapportgenerator
========================================
Genereert een professioneel 7-pagina rapport per campaign.

Pagina-indeling
---------------
  1. Voorblad        — campagne, organisatie, datum, KPI-snapshot
  2. Management Summary — sleutelbevindingen, risicodistributie
  3. SDT Basisbehoeften — autonomie, competentie, verbondenheid
  4. Organisatiefactoren — radar, scoretabel, top-risico's
  5. Patronen & vertrekreden (exit) / bevlogenheid (retention)
  6. Aanbevelingen   — per factor, per urgentieband

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
    detect_patterns,
    get_recommendations,
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
# Grafiek: risico-balk (horizontale meter)
# ---------------------------------------------------------------------------


def _risk_gauge_image(score: float, band: str, benchmark: float | None = None) -> Image:
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

    # Optionele benchmark lijn
    if benchmark is not None:
        ax.plot([benchmark, benchmark], [0.30, 1.00], color="#9CA3AF", lw=1.5, linestyle="--", zorder=4)
        ax.text(benchmark, 1.10, "benchmark", ha="center", va="bottom", fontsize=7, color="#9CA3AF")

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
        mpatches.Patch(color=MPL_HIGH, label="Hoog risico (score < 3)"),
        mpatches.Patch(color=MPL_MED,  label="Midden risico"),
        mpatches.Patch(color=MPL_LOW,  label="Laag risico (score > 5.5)"),
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
    vals   = [counts.get("REDBAAR", 0), counts.get("MOGELIJK_REDBAAR", 0), counts.get("NIET_REDBAAR", 0)]
    labels = ["Redbaar", "Mogelijk\nredbaar", "Niet redbaar"]
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

    # Replacement cost totaal (exit only)
    total_cost = sum(
        r.replacement_cost_eur for r in responses if r.replacement_cost_eur
    )

    # Avoidable cost (alleen REDBAAR)
    avoidable_n = pattern.get("preventability_counts", {}).get("REDBAAR", 0) if has_pattern else 0
    avg_rep_cost = total_cost / n_completed if n_completed and total_cost else 0
    avoidable_cost = round(avg_rep_cost * avoidable_n)

    avoidable_pct = pattern.get("avoidable_rate_pct") if has_pattern else None

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
        ["Uitgenodigden", "Ingevuld", "Respons", "Gem. risico"],
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
        if avoidable_pct is not None:
            exec_rows.append([f"Mogelijk beinvloedbaar vertrek", f"{avoidable_pct:.0f}%"])

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
        band_str = {"HOOG": "hoog", "MIDDEN": "gemiddeld", "LAAG": "laag"}.get(
            ("HOOG" if avg_risk >= 7 else "MIDDEN" if avg_risk >= 4.5 else "LAAG"), ""
        )
        intro += (
            f"De gemiddelde risicoscore bedraagt <b>{avg_risk:.1f} op 10</b>, "
            f"wat duidt op een <b>{band_str}</b> verlooprisico."
        )
    story.append(Paragraph(intro, STYLES["body"]))
    story.append(Spacer(1, 0.4 * cm))

    # Risico-meter
    BENCHMARK_SCORE = 5.1
    if avg_risk:
        band_label = "HOOG" if avg_risk >= 7 else "MIDDEN" if avg_risk >= 4.5 else "LAAG"
        story.append(Paragraph("Risicometer (gemiddeld)", STYLES["sub_title"]))
        story.append(_risk_gauge_image(avg_risk, band_label, benchmark=BENCHMARK_SCORE))
        story.append(Paragraph(
            "<i>Ter referentie: de indicatieve MKB-benchmark ligt op 5.1/10 (Verisight, intern, 2025).</i>",
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
    story.append(Paragraph("Verdeling risicobanden", STYLES["sub_title"]))
    dist_data = [
        ["Risicoband", "Aantal", "Percentage"],
        ["Hoog (7–10)", str(band_counts["HOOG"]),  f"{band_counts['HOOG']  / max(n_completed,1) * 100:.0f}%"],
        ["Midden (4.5–7)", str(band_counts["MIDDEN"]), f"{band_counts['MIDDEN'] / max(n_completed,1) * 100:.0f}%"],
        ["Laag (1–4.5)", str(band_counts["LAAG"]),  f"{band_counts['LAAG']  / max(n_completed,1) * 100:.0f}%"],
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

    if has_pattern and top_risks:
        top_factor, top_score = top_risks[0]
        findings.append(
            f"<b>{FACTOR_LABELS_NL.get(top_factor, top_factor)}</b> is het grootste risicothema "
            f"(risicowaarde {top_score:.1f}/10)."
        )
    if avoidable_pct is not None:
        findings.append(
            f"<b>{avoidable_pct:.0f}% van het verloop</b> is als mogelijk beinvloedbaar geclassificeerd — "
            "dit wijst op werkfactoren die om nadere analyse vragen."
        )
    if camp.scan_type == "exit" and avoidable_cost > 0:
        findings.append(
            f"De geschatte <b>mogelijk beinvloedbare vervangingskosten</b> bedragen "
            f"<b>€ {avoidable_cost:,.0f}</b> (SHRM/Bersin-multipliers)."
        )
        findings.append(
            "<i><font size='8' color='#6B7280'>Berekening: gemiddelde vervangingskosten per medewerker × aantal reddbare vertrekkers. "
            "Multiplier: 0.5–2.0× jaarsalaris afhankelijk van functieniveau (SHRM, 2022; Bersin, 2013).</font></i>"
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
        "Op basis van de W-BNS schaal (Van den Broeck et al., 2010; Deci et al., 2001). "
        "Scores < 4.5 duiden op een significante behoeftefrustatie; > 7.0 is positief.",
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
                "vergroot het verlooprisico, ook wanneer andere factoren positief zijn.",
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
                    "kwetsbaar — dit verhoogt het verlooprisico ook wanneer andere factoren positief zijn."
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
        "Gebaseerd op LMX-7 (Graen & Uhl-Bien, 1995), Edmondson Psychological Safety (1999), "
        "JD-R model (Bakker & Demerouti, 2007) en JSS (Spector, 1985).",
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
            "<i>Toelichting: De score (1–10) geeft de gemiddelde beleving van medewerkers weer — "
            "hogere score is positiever. De risicowaarde geeft het gewogen verlooprisico aan — "
            "hogere risicowaarde betekent meer urgentie.</i>",
            ParagraphStyle(
                "score_explanation",
                fontName="Helvetica-Oblique",
                fontSize=8,
                leading=11,
                textColor=MUTED,
                spaceAfter=4,
            ),
        ))
        score_rows = [["Factor", "Score (1–10)", "Risicowaarde", "Urgentie"]]
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
            "Gebaseerd op het Push-Pull model (Mitchell & Lee, 2001) en het "
            "Avoidable Turnover Framework (Holtom et al., 2008).",
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
                story.append(Paragraph("Top vertrekreden", STYLES["sub_title"]))
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
                            f"<b>Push-factoren (intern):</b> {push_pct}%  |  "
                            f"<b>Pull-factoren (extern):</b> {pull_pct}%  |  "
                            f"<b>Situationeel:</b> {situ_pct}%",
                            ParagraphStyle(
                                "factor_dist",
                                fontName="Helvetica",
                                fontSize=9,
                                leading=13,
                                textColor=TEXT,
                                spaceAfter=4,
                            ),
                        ))

                story.append(Spacer(1, 0.5 * cm))

                # ── Anonymized quotes (Item 14) ────────────────────────────
                quotes = [
                    r.open_text_raw
                    for r in responses
                    if r.open_text_raw and r.open_text_raw.strip()
                ]
                if len(quotes) >= 3:
                    story.append(Paragraph("Stemmen uit de survey", STYLES["sub_title"]))
                    shown = quotes[:4]
                    for i, q in enumerate(shown):
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
                        if i < len(shown) - 1:
                            story.append(Spacer(1, 0.1 * cm))
                    story.append(Spacer(1, 0.3 * cm))

            # Preventability
            prev_counts = pattern.get("preventability_counts", {})
            prev_img    = _preventability_image(prev_counts)
            if prev_img:
                story.append(Paragraph("Indicatie beinvloedbaarheid vertrek", STYLES["sub_title"]))
                story.append(Paragraph(
                    "Classificatie op basis van het Avoidable Turnover Framework "
                    "(Holtom et al., 2008): combinatie van vertrekreden, blijfbereidheid "
                    "en SDT/org-factorscores. Deze classificatie is indicatief en geen causale vaststelling.",
                    STYLES["body"],
                ))

                prev_table_data = [[prev_img, ""]]
                prev_table_data[0][1] = Table([
                    [Paragraph("<b>Redbaar</b>", STYLES["body"]),
                     Paragraph(f"{prev_counts.get('REDBAAR', 0)} responses", STYLES["body"])],
                    [Paragraph("<b>Mogelijk redbaar</b>", STYLES["body"]),
                     Paragraph(f"{prev_counts.get('MOGELIJK_REDBAAR', 0)} responses", STYLES["body"])],
                    [Paragraph("<b>Niet redbaar</b>", STYLES["body"]),
                     Paragraph(f"{prev_counts.get('NIET_REDBAAR', 0)} responses", STYLES["body"])],
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
            story.append(Paragraph("Risico per afdeling", STYLES["sub_title"]))
            dept_rows = [["Afdeling", "n", "Gem. risicoscore"]]
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
            story.append(Spacer(1, 0.4 * cm))
            story.append(Paragraph("Vertrek naar diensttijd", STYLES["sub_title"]))
            tenure_rows = [["Diensttijd", "n", "Gem. risicoscore"]]
            for label, scores_list in tenure_buckets.items():
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
            for row_idx, (lbl, scores_list) in enumerate(tenure_buckets.items(), start=1):
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

        if role_risks:
            story.append(Spacer(1, 0.4 * cm))
            story.append(Paragraph("Vertrek naar functieniveau", STYLES["sub_title"]))
            role_rows = [["Functieniveau", "n", "Gem. risicoscore"]]
            ordered_roles = sorted(
                role_risks.items(),
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

    else:
        story.append(Paragraph(
            "Onvoldoende responses voor patroonrapportage (minimaal 10 vereist).",
            STYLES["body"],
        ))

    story.append(PageBreak())

    # ==================================================================== #
    # PAGINA 6 — AANBEVELINGEN                                             #
    # ==================================================================== #

    story.append(Paragraph("Aanbevelingen", STYLES["section_title"]))
    story.append(Paragraph(
        "Onderstaande aanbevelingen zijn gegenereerd op basis van de factorscores "
        "en urgentiebanden. Begin met de hoogste risicowaarden.",
        STYLES["body"],
    ))
    story.append(Spacer(1, 0.4 * cm))

    if has_pattern and top_risks:
        factor_risks_dict = {f: score for f, score in top_risks}
        recs = get_recommendations(factor_risks_dict)
        dept_risks_for_recs = pattern.get("department_avg_risk", {})
        top_dept_by_risk = sorted(dept_risks_for_recs.items(), key=lambda x: x[1], reverse=True)

        for idx, (factor, risk_score) in enumerate(top_risks):
            label = FACTOR_LABELS_NL.get(factor, factor)
            factor_recs = recs.get(factor, [])
            if not factor_recs:
                continue

            if risk_score >= 6.0:
                badge_text  = "URGENT"
                badge_color = RISK_HIGH
                badge_bg    = colors.HexColor("#FEE2E2")
            elif risk_score >= 4.5:
                badge_text  = "AANDACHT"
                badge_color = RISK_MED
                badge_bg    = colors.HexColor("#FEF9C3")
            else:
                badge_text  = "OK"
                badge_color = RISK_LOW
                badge_bg    = colors.HexColor("#DCFCE7")

            # Factorkop
            header_data = [[
                Paragraph(f"<b>{label}</b>", STYLES["body_bold"]),
                Paragraph(f"Risico: {risk_score:.1f} / 10", STYLES["body"]),
                Paragraph(f"<b>{badge_text}</b>", ParagraphStyle(
                    "badge_inline",
                    fontName="Helvetica-Bold",
                    fontSize=9,
                    textColor=badge_color,
                    alignment=TA_RIGHT,
                )),
            ]]
            hdr_ts = TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), BRAND_LIGHT),
                ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#BFDBFE")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ])
            hdr_table = Table(
                header_data,
                colWidths=[content_width * 0.45, content_width * 0.30, content_width * 0.25],
            )
            hdr_table.setStyle(hdr_ts)
            story.append(hdr_table)

            # Aanbevelingen
            rec_data = []
            for rec in factor_recs:
                rec_data.append([Paragraph(f"• {rec}", STYLES["body"])])

            rec_ts = TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), WHITE),
                ("GRID",       (0, 0), (-1, -1), 0.5, BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ])
            rec_table = Table(rec_data, colWidths=[content_width])
            rec_table.setStyle(rec_ts)
            story.append(rec_table)

            # Afdeling-link voor de top 2 risicofactoren (Item 10)
            if idx < 2 and top_dept_by_risk:
                high_depts = [d for d, s in top_dept_by_risk if s > 5.0][:2]
                if high_depts:
                    dept_note = "Hoogste risico: " + ", ".join(
                        f"{d} (gem. {dept_risks_for_recs[d]:.1f}/10)"
                        for d in high_depts
                    )
                    story.append(Paragraph(
                        f"<i>{dept_note}</i>",
                        ParagraphStyle(
                            f"dept_link_{idx}",
                            fontName="Helvetica-Oblique",
                            fontSize=8,
                            leading=11,
                            textColor=MUTED,
                            leftIndent=12,
                            spaceAfter=2,
                        ),
                    ))

            story.append(Spacer(1, 0.3 * cm))
    else:
        story.append(Paragraph(
            "Onvoldoende responses voor gepersonaliseerde aanbevelingen "
            "(minimaal 10 vereist).",
            STYLES["body"],
        ))

    # Disclaimer
    story.append(Spacer(1, 0.3 * cm))
    disclaimer = (
        "<i>Methodologische verantwoording: SDT-scores gebaseerd op de Work-related "
        "Basic Need Satisfaction schaal (Van den Broeck et al., 2010). Organisatiefactoren "
        "gebaseerd op LMX-7, Edmondson Psychological Safety Scale, JD-R en JSS. "
        "Vervangingskosten berekend op basis van SHRM/Bersin Institute multipliers. "
        "Alle analyses zijn anoniem en voldoen aan de AVG.</i>"
    )
    story.append(Paragraph(disclaimer, STYLES["caption"]))

    story.append(PageBreak())

    # ==================================================================== #
    # PAGINA 7 — METHODIEK & VERANTWOORDING                                #
    # ==================================================================== #

    story.append(Paragraph("Methodiek & Verantwoording", STYLES["section_title"]))
    story.append(Paragraph(
        "Dit rapport is opgebouwd op basis van gevalideerde wetenschappelijke instrumenten. "
        "De relatieve weging van factoren is gebaseerd op de richting van bevindingen in de literatuur. "
        "Onderstaande toelichting maakt de onderzoekslogica transparant.",
        STYLES["body"],
    ))
    story.append(Spacer(1, 0.4 * cm))

    # ── Hoe werkt de risicoscore? ────────────────────────────────────────
    story.append(Paragraph("Hoe wordt de risicoscore berekend?", STYLES["sub_title"]))
    story.append(Paragraph(
        "Elke respondent krijgt een risicoscore op een schaal van 1 tot 10. "
        "Een hogere score betekent meer signalen van ontevredenheid of frictie in de werkomgeving. "
        "De score is indicatief en bedoeld als gespreksinput, niet als causale voorspelling of objectief oordeel. "
        "De score is een gewogen gemiddelde van zeven factoren:",
        STYLES["body"],
    ))
    story.append(Spacer(1, 0.2 * cm))

    weight_rows = [
        ["Factor", "Gewicht", "Richting in literatuur"],
        ["Leiderschap", "2.5 ×", "Consistent sterkste voorspeller vrijwillig verloop (o.a. LMX-onderzoek)"],
        ["SDT Werkbeleving", "2.0 ×", "Cross-dimensionale impact op motivatie en retentie"],
        ["Cultuur", "1.5 ×", "Psychologische veiligheid gerelateerd aan retentie (Edmondson, 1999)"],
        ["Groei & Ontwikkeling", "1.5 ×", "Belangrijke driver voor ontwikkelingsgerichte medewerkers (JD-R)"],
        ["Beloning", "1.0 ×", "Hygiënefactor — drempelwaarde-effect"],
        ["Werkbelasting", "1.0 ×", "Mediator; minder directe invloed dan leiderschapsfactoren (JD-R)"],
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

    # ── Risicobanden ──────────────────────────────────────────────────────
    story.append(Paragraph("Wat betekenen de risicobanden?", STYLES["sub_title"]))
    band_rows = [
        ["Band", "Score", "Betekenis voor de organisatie"],
        ["LAAG",   "< 4.5",   "Medewerker ervoer de werkomgeving overwegend positief. "
                               "Vertrek hangt minder samen met interne factoren."],
        ["MIDDEN", "4.5–7.0", "Gemengd beeld. Aandachtspunten aanwezig, maar geen acute alarmsignalen. "
                               "Gerichte verbetering kan retentie versterken."],
        ["HOOG",   "≥ 7.0",   "Medewerker ervoer de werkomgeving structureel negatief. "
                               "Dit wijst op meerdere interne aandachtspunten die nader onderzocht moeten worden."],
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
         "Meet de kwaliteit van de relatie tussen medewerker en leidinggevende: feedback, "
         "interesse in ontwikkeling en vertrouwen. Zwak leiderschap is de meest genoemde "
         "vermijdbare vertrekoorzaak."),
        ("Cultuur", "Psychological Safety Scale (Edmondson, 1999)",
         "Meet of medewerkers zich vrij voelden fouten toe te geven, vragen te stellen en "
         "afwijkende meningen te uiten. Lage cultuurscores correleren sterk met verborgen "
         "problemen en hoog verloop."),
        ("Groei & Ontwikkeling", "JD-R Resources-component",
         "Meet of er voldoende leer- en groeimogelijkheden waren en of de organisatie "
         "investeerde in loopbaanontwikkeling. Gebrek aan perspectief is een primaire "
         "oorzaak van verloop bij jonge medewerkers."),
        ("Beloning", "Job Satisfaction Survey (Spector, 1985)",
         "Meet ervaren marktconformiteit, eerlijkheid en aansluiting van de totale "
         "arbeidsvoorwaarden. Beloning werkt als hygiënefactor: te laag veroorzaakt "
         "vertrek, maar 'goed genoeg' leidt niet automatisch tot loyaliteit."),
        ("Werkbelasting", "JD-R Demands-component",
         "Meet of de werkdruk haalbaar was en of er voldoende hersteltijd was. "
         "Vragen zijn positief geformuleerd: hoge score = werkdruk als acceptabel ervaren = lager risico."),
        ("Rolhelderheid", "Role Conflict & Ambiguity Scale (Rizzo et al., 1970)",
         "Meet of taken en verwachtingen duidelijk waren. Lage rolhelderheid leidt tot "
         "stress, lagere prestaties en hogere vertrekintentie."),
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
        "Bij kleinere groepen zijn de uitkomsten te gevoelig voor toeval en herleidbaarheid. "
        "Alle zichtbare uitkomsten blijven indicatief en dienen als gespreksinput — niet als statistische conclusie. "
        "Alle resultaten worden uitsluitend op gegroepeerd niveau gedeeld, conform de AVG.",
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
