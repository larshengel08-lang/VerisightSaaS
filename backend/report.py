"""
Verisight — PDF-rapportgenerator
========================================
Genereert productspecifieke managementrapporten per campaign.

Belangrijke boundary
--------------------
Voor `ExitScan` geldt een vaste, expliciet vastgezette hoofdstructuur:
  1. Cover
  2. Respons
  3. Bestuurlijke handoff
  4. Frictiescore & verdeling van het vertrekbeeld
  5. Signalen in samenhang
  6. Drivers & prioriteitenbeeld
  7. SDT Basisbehoeften
  8. Organisatiefactoren
  9. Eerste route & actie
 10. Methodiek / leeswijzer
 11. Appendix — Technische verantwoording

De gedeelde report grammar mag deze ExitScan-opbouw niet reduceren of herordenen.

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
from xml.sax.saxutils import escape

import matplotlib
matplotlib.use("Agg")  # geen GUI vereist
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
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

from sqlalchemy.orm import Session, joinedload, selectinload

from backend.insight_to_action import build_report_insight_to_action
from backend.models import Campaign, Organization, Respondent, SurveyResponse
from backend.products.shared.management_language import (
    build_factor_presentation,
    management_band_label,
    management_context_label,
    management_label_kind,
    management_preventability_label,
)
from backend.products.shared.registry import get_product_module
from backend.report_design import (
    BODY_FRAME_GAP,
    CONTENT_WIDTH,
    COVER_FRAME_INSET,
    HEADER_HEIGHT,
    MPL_TOKENS,
    PAGE_MARGINS,
    REPORT_FONTS,
    TOKENS,
    build_report_styles,
    ensure_report_fonts,
    get_report_theme,
    make_page_callbacks,
)
from backend.report_content import FACTOR_EXPLANATIONS, METHODOLOGY_REFERENCES
from backend.scan_definitions import get_scan_definition
from backend.scoring import (
    FACTOR_LABELS_NL,
    ORG_FACTOR_KEYS,
    EXIT_REASON_LABELS_NL,
    MIN_SEGMENT_N,
    compute_retention_signal_profile,
    detect_patterns,
)

ensure_report_fonts()

RISK_HIGH = TOKENS["danger"]
RISK_MED = TOKENS["warning"]
RISK_LOW = TOKENS["success"]
MUTED = TOKENS["muted"]
TEXT = TOKENS["text"]
BORDER = TOKENS["border"]
WHITE = colors.white
BG = TOKENS["bg"]

MPL_BRAND = MPL_TOKENS["petrol"]
MPL_HIGH = MPL_TOKENS["danger"]
MPL_MED = MPL_TOKENS["warning"]
MPL_LOW = MPL_TOKENS["success"]
MPL_MUTED = MPL_TOKENS["muted"]

PAGE_W, PAGE_H = A4  # 595 × 842 pt


def _report_theme(scan_type: str) -> dict[str, colors.Color]:
    return get_report_theme(scan_type)


STYLES: dict[str, ParagraphStyle] = build_report_styles()

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
    ax.barh(0.65, 3.5, left=1,   height=0.42, color=MPL_LOW,  alpha=0.20)
    ax.barh(0.65, 2.5, left=4.5, height=0.42, color=MPL_MED,  alpha=0.18)
    ax.barh(0.65, 3.0, left=7.0, height=0.42, color=MPL_HIGH, alpha=0.18)

    # Naald — dikkere lijn, kleur passend bij band
    color = {"HOOG": MPL_HIGH, "MIDDEN": MPL_MED, "LAAG": MPL_LOW}.get(band, MPL_BRAND)
    ax.plot([score, score], [0.25, 1.05], color=color, lw=4, zorder=5, solid_capstyle="round")
    ax.scatter([score], [0.65], color=color, s=100, zorder=6)

    # Zone labels — groter en vetter
    for x, lbl, col in [(2.75, "LAAG", MPL_LOW), (5.75, "MIDDEN", MPL_MED), (8.5, "HOOG", MPL_HIGH)]:
        ax.text(x, 0.65, lbl, ha="center", va="center", fontsize=7.5, color=MPL_TOKENS["text"], fontweight="bold")

    # Score label direct onder de naald
    ax.text(score, 0.08, f"{score:.1f}", ha="center", va="bottom", fontsize=9.5, color=MPL_TOKENS["ink"], fontweight="bold")

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
    ax.axvline(x=5.5, color=MPL_TOKENS["border"], lw=1, linestyle="--")
    ax.grid(axis="x", color=MPL_TOKENS["border"], alpha=0.35, linewidth=0.8)
    ax.set_axisbelow(True)
    for spine in ax.spines.values():
        spine.set_visible(False)

    for bar, score in zip(bars, scores_s):
        ax.text(
            score + 0.15, bar.get_y() + bar.get_height() / 2,
            f"{score:.1f}", va="center", fontsize=8, color=MPL_TOKENS["text"],
        )

    patches = [
        mpatches.Patch(color=MPL_HIGH, label=management_band_label(band="HOOG")),
        mpatches.Patch(color=MPL_MED, label=management_band_label(band="MIDDEN")),
        mpatches.Patch(color=MPL_LOW, label=management_band_label(band="LAAG")),
    ]
    ax.legend(handles=patches, fontsize=7, loc="lower right", frameon=False)
    ax.set_facecolor(MPL_TOKENS["surface"])
    fig.patch.set_facecolor(MPL_TOKENS["surface"])
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
    labels = [
        management_band_label(band="HOOG").replace(" ", "\n"),
        management_band_label(band="MIDDEN").replace(" ", "\n"),
        management_band_label(band="LAAG").replace(" ", "\n"),
    ]
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


def _response_donut_image(invited: int, completed: int, width_cm: float = 6.0) -> Image | None:
    if invited <= 0:
        return None

    completed_safe = max(0, min(completed, invited))
    remaining = max(invited - completed_safe, 0)
    values = [completed_safe, remaining]
    labels = ["Ingevuld", "Niet ingevuld"]

    fig, ax = plt.subplots(figsize=(3.2, 3.2))
    _wedges, _texts, autotexts = ax.pie(
        values,
        labels=labels,
        colors=[MPL_BRAND, MPL_MUTED],
        autopct="%1.0f%%",
        startangle=90,
        wedgeprops=dict(width=0.48),
        textprops=dict(fontsize=7.8),
    )
    for autotext in autotexts:
        autotext.set_fontsize(8)
        autotext.set_fontweight("bold")
        autotext.set_color(MPL_TOKENS["ink"])
    ax.text(
        0,
        0,
        f"{completed_safe}/{invited}\nrespons",
        ha="center",
        va="center",
        fontsize=9,
        fontweight="bold",
        color=MPL_TOKENS["ink"],
    )
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


def _color_to_hex(color_value: colors.Color) -> str:
    return "#{:02X}{:02X}{:02X}".format(
        int(round(color_value.red * 255)),
        int(round(color_value.green * 255)),
        int(round(color_value.blue * 255)),
    )


def _truncate_copy(text: str | None, *, limit: int = 160) -> str:
    if not text:
        return ""
    compact = " ".join(str(text).split())
    if len(compact) <= limit:
        return compact
    clipped = compact[: limit - 1].rsplit(" ", 1)[0].rstrip(" ,;:")
    return f"{clipped}…"


def _priority_matrix_image(factor_avgs: dict[str, float], width_cm: float = 12.2) -> Image | None:
    if not factor_avgs:
        return None

    points: list[tuple[str, float, float, float]] = []
    for factor in ORG_FACTOR_KEYS:
        if factor not in factor_avgs:
            continue
        label = FACTOR_LABELS_NL.get(factor, factor)
        score = round(float(factor_avgs[factor]), 1)
        signal = _factor_signal_score(factor, factor_avgs)
        points.append((label, score, signal, 90 + (signal * 28)))

    if not points:
        return None

    fig, ax = plt.subplots(figsize=(7.2, 4.2))
    ax.set_xlim(1, 10)
    ax.set_ylim(1, 10)
    ax.axvspan(1, 4.5, color=MPL_TOKENS["cream"], alpha=0.9, zorder=0)
    ax.axhspan(7.0, 10, color=MPL_TOKENS["teal_light"], alpha=0.55, zorder=0)
    ax.axvline(5.5, color=MPL_TOKENS["border"], linestyle="--", linewidth=1)
    ax.axhline(5.5, color=MPL_TOKENS["border"], linestyle="--", linewidth=1)
    ax.grid(color=MPL_TOKENS["border"], linestyle=":", linewidth=0.6, alpha=0.9)

    for label, score, signal, bubble_size in points:
        point_color = MPL_HIGH if signal >= 7.0 else MPL_MED if signal >= 4.5 else MPL_BRAND
        ax.scatter(
            score,
            signal,
            s=bubble_size,
            color=point_color,
            edgecolor=MPL_TOKENS["navy"],
            linewidth=0.8,
            alpha=0.92,
            zorder=3,
        )
        ax.text(
            score + 0.10,
            signal + 0.10,
            label,
            fontsize=7.4,
            color=MPL_TOKENS["ink"],
            fontweight="medium",
            zorder=4,
        )

    ax.set_xlabel("Beleving / score", fontsize=8)
    ax.set_ylabel("Signaal / aandacht", fontsize=8)
    ax.set_xticks([2, 4, 6, 8, 10])
    ax.set_yticks([2, 4, 6, 8, 10])
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color(MPL_TOKENS["border"])
    ax.spines["bottom"].set_color(MPL_TOKENS["border"])
    ax.set_facecolor(MPL_TOKENS["surface"])
    fig.patch.set_facecolor(MPL_TOKENS["surface"])
    fig.tight_layout()
    return _fig_to_image(fig, width_cm=width_cm)


def _ranked_bar_image(
    items: list[dict[str, Any]],
    *,
    width_cm: float = 8.8,
    color: str = MPL_BRAND,
) -> Image | None:
    if not items:
        return None

    labels = [str(item.get("label", "")) for item in items]
    values = [float(item.get("count", 0) or 0) for item in items]
    if not any(values):
        return None

    positions = np.arange(len(labels))
    max_value = max(values)
    fig_height = max(2.2, 1.15 + (len(labels) * 0.52))
    fig, ax = plt.subplots(figsize=(6.0, fig_height))
    bars = ax.barh(positions, values, color=color, alpha=0.9, height=0.56)
    ax.set_yticks(positions)
    ax.set_yticklabels(labels, fontsize=8)
    ax.invert_yaxis()
    ax.set_xlim(0, max_value * 1.18)
    ax.xaxis.set_visible(False)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_visible(False)
    ax.spines["bottom"].set_visible(False)
    ax.set_facecolor(MPL_TOKENS["surface"])
    fig.patch.set_facecolor(MPL_TOKENS["surface"])

    for bar, value in zip(bars, values):
        ax.text(
            value + (max_value * 0.03),
            bar.get_y() + (bar.get_height() / 2),
            f"{int(value)}",
            va="center",
            fontsize=8.2,
            color=MPL_TOKENS["ink"],
            fontweight="bold",
        )
    fig.tight_layout()
    return _fig_to_image(fig, width_cm=width_cm)


def _segment_small_multiple_image(
    rows: list[dict[str, Any]],
    *,
    org_avg_risk: float | None,
    width_cm: float = 5.4,
) -> Image | None:
    if not rows or org_avg_risk is None:
        return None

    labels = [row["segment_label"] for row in rows[:3]]
    values = [float(row["avg_risk"]) for row in rows[:3]]
    positions = np.arange(len(labels))
    fig_height = max(1.9, 1.0 + (len(labels) * 0.48))
    fig, ax = plt.subplots(figsize=(3.4, fig_height))
    colors_list = [MPL_HIGH if value >= org_avg_risk else MPL_BRAND for value in values]
    bars = ax.barh(positions, values, color=colors_list, alpha=0.92, height=0.52)
    ax.axvline(org_avg_risk, color=MPL_TOKENS["border"], linestyle="--", linewidth=1)
    ax.set_xlim(0, 10)
    ax.set_yticks(positions)
    ax.set_yticklabels(labels, fontsize=7.2)
    ax.invert_yaxis()
    ax.xaxis.set_visible(False)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_visible(False)
    ax.spines["bottom"].set_visible(False)
    ax.set_facecolor(MPL_TOKENS["surface"])
    fig.patch.set_facecolor(MPL_TOKENS["surface"])
    for bar, value in zip(bars, values):
        ax.text(
            value + 0.15,
            bar.get_y() + (bar.get_height() / 2),
            f"{value:.1f}",
            va="center",
            fontsize=7.2,
            color=MPL_TOKENS["ink"],
            fontweight="bold",
        )
    fig.tight_layout()
    return _fig_to_image(fig, width_cm=width_cm)


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


def _has_exit_open_signal_decision_value(quotes: list[str]) -> bool:
    return len(quotes) >= 2


def _cluster_retention_open_signals(quotes: list[str], max_themes: int = 3) -> list[dict[str, Any]]:
    theme_definitions = [
        {
            "key": "leadership",
            "title": "Leiderschap en ondersteuning",
            "keywords": ["leidinggevende", "manager", "feedback", "aansturing", "coach", "sturing"],
            "implication": "Wijst vaak op behoefte aan duidelijker leiderschap, sterkere feedback of meer autonomie-ondersteuning.",
        },
        {
            "key": "culture",
            "title": "Veiligheid en samenwerking",
            "keywords": ["cultuur", "veilig", "vertrouwen", "team", "samenwerking", "uitspreken"],
            "implication": "Wijst vaak op vragen rond psychologische veiligheid, samenwerking of cultuurfit.",
        },
        {
            "key": "growth",
            "title": "Groei en perspectief",
            "keywords": ["groei", "ontwikkeling", "loopbaan", "doorgroei", "perspectief", "leren"],
            "implication": "Wijst vaak op behoefte aan zicht op ontwikkeling, doorgroei of een geloofwaardige volgende stap.",
        },
        {
            "key": "compensation",
            "title": "Beloning en voorwaarden",
            "keywords": ["salaris", "beloning", "arbeidsvoorwaarden", "voorwaarden", "vergoeding", "loon"],
            "implication": "Wijst vaak op ervaren passendheid, uitlegbaarheid of eerlijkheid van beloning en voorwaarden.",
        },
        {
            "key": "workload",
            "title": "Werkdruk en herstel",
            "keywords": ["werkdruk", "druk", "belasting", "hersteltijd", "planning", "teveel"],
            "implication": "Wijst vaak op structurele druk, weinig herstelruimte of onhoudbare pieken in het werk.",
        },
        {
            "key": "role_clarity",
            "title": "Prioriteiten en rolhelderheid",
            "keywords": ["prioriteit", "rol", "verwachting", "duidelijk", "verantwoordelijkheid", "tegenstrijdig"],
            "implication": "Wijst vaak op onduidelijkheid over prioriteiten, verwachtingen of tegenstrijdige opdrachten.",
        },
    ]

    buckets = {
        definition["key"]: {
            "title": definition["title"],
            "implication": definition["implication"],
            "quotes": [],
        }
        for definition in theme_definitions
    }
    overige: list[str] = []

    for quote in _dedupe_quotes(quotes):
        normalized = " ".join(quote.lower().split())
        match_key = next(
            (
                definition["key"]
                for definition in theme_definitions
                if any(keyword in normalized for keyword in definition["keywords"])
            ),
            None,
        )
        if match_key:
            buckets[match_key]["quotes"].append(quote)
        else:
            overige.append(quote)

    themes = [
        {
            "key": key,
            "title": value["title"],
            "count": len(value["quotes"]),
            "implication": value["implication"],
            "sample_quote": value["quotes"][0],
        }
        for key, value in buckets.items()
        if value["quotes"]
    ]

    if overige:
        themes.append({
            "key": "other",
            "title": "Overige verbetersignalen",
            "count": len(overige),
            "implication": "Hier zitten signalen die niet netjes in een hoofdcategorie vallen, maar wel vervolgvragen kunnen sturen.",
            "sample_quote": overige[0],
        })

    themes.sort(key=lambda item: item["count"], reverse=True)
    return themes[:max_themes]


def _select_retention_decision_themes(
    retention_themes: list[dict[str, Any]],
    top_risks: list[tuple[str, float]],
    max_themes: int = 2,
) -> list[dict[str, Any]]:
    top_factor_keys = {factor for factor, _signal_value in top_risks[:2]}
    selected = [
        theme
        for theme in retention_themes
        if theme.get("key") in top_factor_keys and theme.get("count", 0) >= 2
    ]
    return selected[:max_themes]


def _append_report_cards(
    story: list,
    cards: list[dict[str, str]],
    *,
    content_width: float,
) -> None:
    if not cards:
        return

    for card in cards:
        table = Table(
            [
                [Paragraph(f"<b>{card['title']}</b>", STYLES["body_bold"])],
                [Paragraph(card["body"], STYLES["body"])],
            ],
            colWidths=[content_width],
        )
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), TOKENS["teal_light"]),
            ("BACKGROUND", (0, 1), (-1, -1), WHITE),
            ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ]))
        story.append(table)
        story.append(Spacer(1, 0.2 * cm))


def _risk_badge(score: float | None = None, *, label: str | None = None) -> dict[str, colors.Color | str] | None:
    if score is None and not label:
        return None
    if score is not None:
        label = management_band_label(score=score)
    resolved_label = label or management_band_label(band="LAAG")
    kind = management_label_kind(resolved_label)
    if kind == "HOOG":
        return {"label": resolved_label, "bg": TOKENS["risk_high_bg"], "fg": RISK_HIGH}
    if kind == "MIDDEN":
        return {"label": resolved_label, "bg": TOKENS["risk_med_bg"], "fg": RISK_MED}
    if kind == "stabilizing":
        return {"label": resolved_label, "bg": TOKENS["teal_light"], "fg": get_report_theme("exit")["accent"]}
    if kind == "verification":
        return {"label": resolved_label, "bg": TOKENS["surface"], "fg": TEXT}
    return {"label": resolved_label, "bg": TOKENS["risk_low_bg"], "fg": RISK_LOW}


def _build_badge_table(badge: dict[str, colors.Color | str], width: float) -> Table:
    badge_style = ParagraphStyle(
        f"badge_{badge['label']}",
        fontName=REPORT_FONTS["semibold"],
        fontSize=7.2,
        leading=8.8,
        textColor=badge["fg"],
        alignment=TA_CENTER,
    )
    badge_table = Table([[Paragraph(str(badge["label"]).upper(), badge_style)]], colWidths=[width])
    badge_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), badge["bg"]),
        ("BOX", (0, 0), (-1, -1), 0.4, badge["bg"]),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return badge_table


def _append_highlight_cards(
    story: list,
    cards: list[dict[str, str]],
    *,
    content_width: float,
    theme: dict[str, colors.Color],
    columns: int = 3,
) -> None:
    if not cards:
        return

    card_tables: list[Table] = []
    column_count = max(1, min(columns, 3))
    cell_width = content_width / column_count - 12
    for card in cards:
        rows = []
        if card.get("title"):
            rows.append([Paragraph(card["title"], ParagraphStyle(
                f"highlight_title_{card['title']}",
                fontName=REPORT_FONTS["semibold"],
                fontSize=7.2,
                leading=9.4,
                textColor=theme["text"],
                spaceAfter=1,
            ))])
        if card.get("badge"):
            rows.append([_build_badge_table(card["badge"], min(cell_width * 0.55, 40 * mm))])
        if card.get("value"):
            rows.append([Paragraph(card["value"], ParagraphStyle(
                f"highlight_value_{card['title']}",
                fontName=REPORT_FONTS["bold"],
                fontSize=11.4,
                leading=13.5,
                textColor=card.get("value_color", theme["ink"]),
                spaceAfter=2,
            ))])
        rows.append([Paragraph(card["body"], ParagraphStyle(
            f"highlight_body_{card['title']}",
            fontName=REPORT_FONTS["regular"],
            fontSize=7.6,
            leading=10.6,
            textColor=theme["text"],
        ))])
        card_table = Table(rows, colWidths=[cell_width])
        card_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), card.get("background", theme["surface"])),
            ("BOX", (0, 0), (-1, -1), 0.7, theme["border"]),
            ("LINEABOVE", (0, 0), (-1, 0), 2, card.get("accent_color", theme["accent"])),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        card_tables.append(card_table)

    rows = [card_tables[i:i + column_count] for i in range(0, len(card_tables), column_count)]
    for row_cards in rows:
        if len(row_cards) < column_count:
            row_cards = row_cards + [""] * (column_count - len(row_cards))
        table = Table([row_cards], colWidths=[content_width / column_count] * column_count)
        table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        story.append(table)
        story.append(Spacer(1, 0.12 * cm))


def _append_emphasis_note(
    story: list,
    *,
    title: str,
    body: str,
    content_width: float,
    theme: dict[str, colors.Color],
) -> None:
    note_table = Table(
        [[
            Paragraph(
                f"<b>{title}</b><br/>{body}",
                ParagraphStyle(
                    f"emphasis_note_{title}",
                    fontName=REPORT_FONTS["regular"],
                    fontSize=8.0,
                    leading=11.2,
                    textColor=theme["text"],
                ),
            )
        ]],
        colWidths=[content_width],
    )
    note_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), theme["soft"]),
        ("BOX", (0, 0), (-1, -1), 0.7, theme["border"]),
        ("LINEBEFORE", (0, 0), (0, -1), 2.5, theme["accent"]),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(note_table)
    story.append(Spacer(1, 0.14 * cm))


def _append_micro_structure(
    story: list,
    *,
    how_to_read: str,
    why_it_matters: str,
    content_width: float,
    theme: dict[str, colors.Color],
    why_label: str = "Waarom dit ertoe doet",
) -> None:
    explainer = Table(
        [[
            Paragraph(
                f"<b>Hoe lees je dit?</b> {how_to_read}<br/><b>{why_label}</b> {why_it_matters}",
                ParagraphStyle(
                    f"micro_structure_{abs(hash(how_to_read + why_it_matters))}",
                    fontName=REPORT_FONTS["regular"],
                    fontSize=7.6,
                    leading=10.2,
                    textColor=theme["text"],
                ),
            )
        ]],
        colWidths=[content_width],
    )
    explainer.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), theme["surface"]),
        ("BOX", (0, 0), (-1, -1), 0.5, theme["border"]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(explainer)
    story.append(Spacer(1, 0.10 * cm))


def _append_metric_band(
    story: list,
    cards: list[dict[str, str]],
    *,
    content_width: float,
    theme: dict[str, colors.Color],
    columns: int = 3,
) -> None:
    if not cards:
        return

    usable_cards = cards[: max(1, columns * 2)]
    cell_width = content_width / columns - 10
    card_tables: list[Table] = []
    for card in usable_cards:
        rows = []
        if card.get("title"):
            rows.append([Paragraph(card["title"], ParagraphStyle(
                f"metric_title_{card['title']}",
                fontName=REPORT_FONTS["semibold"],
                fontSize=7.0,
                leading=9.2,
                textColor=theme["text"],
            ))])
        if card.get("badge"):
            rows.append([_build_badge_table(card["badge"], min(cell_width * 0.55, 38 * mm))])
        if card.get("value"):
            rows.append([Paragraph(card["value"], ParagraphStyle(
                f"metric_value_{card['title']}",
                fontName=REPORT_FONTS["bold"],
                fontSize=14.0,
                leading=16.2,
                textColor=card.get("value_color", theme["ink"]),
            ))])
        if card.get("body"):
            rows.append([Paragraph(card["body"], ParagraphStyle(
                f"metric_body_{card['title']}",
                fontName=REPORT_FONTS["regular"],
                fontSize=7.2,
                leading=9.8,
                textColor=theme["muted"],
            ))])
        card_table = Table(rows, colWidths=[cell_width])
        card_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), card.get("background", theme["surface"])),
            ("BOX", (0, 0), (-1, -1), 0.7, theme["border"]),
            ("LINEABOVE", (0, 0), (-1, 0), 2, card.get("accent_color", theme["accent"])),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        card_tables.append(card_table)

    rows = [card_tables[i:i + columns] for i in range(0, len(card_tables), columns)]
    for row_cards in rows:
        if len(row_cards) < columns:
            row_cards = row_cards + [""] * (columns - len(row_cards))
        row = Table([row_cards], colWidths=[content_width / columns] * columns)
        row.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        story.append(row)
        story.append(Spacer(1, 0.12 * cm))


def _append_factor_priority_rows(
    story: list,
    *,
    factor_rows: list[dict[str, str]],
    content_width: float,
    theme: dict[str, colors.Color],
) -> None:
    if not factor_rows:
        return

    rows = [["Driver", "Beleving", "Signaal", "Wat dit nu vraagt"]]
    for row in factor_rows:
        rows.append([
            row["label"],
            row["score"],
            row["signal"],
            row["decision"],
        ])

    table = Table(
        rows,
        colWidths=[
            content_width * 0.23,
            content_width * 0.12,
            content_width * 0.12,
            content_width * 0.53,
        ],
    )
    style = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), theme["navy"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), REPORT_FONTS["semibold"]),
        ("FONTSIZE", (0, 0), (-1, -1), 8.2),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [theme["surface"], theme["soft"]]),
        ("GRID", (0, 0), (-1, -1), 0.45, theme["border"]),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (1, 1), (2, -1), "CENTER"),
        ("FONTNAME", (1, 1), (2, -1), REPORT_FONTS["semibold"]),
    ])
    for row_idx, row in enumerate(factor_rows, start=1):
        signal_value = float(row["signal_value"])
        style.add("TEXTCOLOR", (2, row_idx), (2, row_idx), _risk_color(signal_value))
    table.setStyle(style)
    story.append(table)
    story.append(Spacer(1, 0.25 * cm))


def _append_numbered_action_rows(
    story: list,
    *,
    steps: list[dict[str, str]],
    content_width: float,
    theme: dict[str, colors.Color],
) -> None:
    if not steps:
        return
    rows: list[list[Any]] = [["Stap", "Actie", "Wat dit vraagt"]]
    for step in steps:
        rows.append([
            step["number"],
            step["title"],
            step["body"],
        ])
    action_table = _build_data_table_flowable(
        rows=rows,
        col_widths=[content_width * 0.10, content_width * 0.25, content_width * 0.65],
        theme=theme,
        align_columns=[0],
        bold_columns=[0, 1],
    )
    action_table.setStyle(TableStyle([
        ("TEXTCOLOR", (0, 1), (0, -1), theme["accent_dark"]),
        ("FONTNAME", (0, 1), (0, -1), REPORT_FONTS["bold"]),
    ]))
    story.append(action_table)
    story.append(Spacer(1, 0.14 * cm))


def _append_insight_to_action_block(
    story: list,
    *,
    insight_to_action: dict[str, Any],
    content_width: float,
    theme: dict[str, colors.Color],
) -> None:
    if not insight_to_action:
        return

    priorities_text = " ".join(
        f"<b>{item['title']}:</b> {item['body']}"
        for item in insight_to_action.get("management_priorities", [])
    )
    story.append(Paragraph(insight_to_action["title"], STYLES["sub_title"]))
    questions = insight_to_action.get("verification_questions", [])
    actions_text = "<br/>".join(
        f"<b>{index}.</b> {item['body']}"
        for index, item in enumerate(insight_to_action.get("possible_first_actions", []), start=1)
    )
    _append_emphasis_note(
        story,
        title=insight_to_action["title"],
        body=priorities_text,
        content_width=content_width,
        theme=theme,
    )
    if questions:
        question_body = "<br/>".join(
            f"<b>{index}.</b> {question}"
            for index, question in enumerate(questions, start=1)
        )
        _append_emphasis_note(
            story,
            title="5 verificatievragen",
            body=question_body,
            content_width=content_width,
            theme=theme,
        )
    _append_emphasis_note(
        story,
        title="3 mogelijke eerste acties",
        body=actions_text,
        content_width=content_width,
        theme=theme,
    )


def _append_quote_cards(
    story: list,
    *,
    quotes: list[str],
    content_width: float,
    theme: dict[str, colors.Color],
) -> None:
    if not quotes:
        return

    cards = []
    for quote in quotes[:2]:
        cards.append({
            "title": "Stem uit de survey",
            "value": "",
            "body": f'"{quote}"',
        })
    _append_highlight_cards(story, cards, content_width=content_width, theme=theme)


def _append_compact_read_guide(
    story: list,
    *,
    scan_type: str,
    content_width: float,
    has_segment_deep_dive: bool,
    theme: dict[str, colors.Color],
) -> None:
    scan_meta = get_scan_definition(scan_type)
    product_module = get_product_module(scan_type)
    methodology_payload = product_module.get_methodology_payload()

    story.append(Paragraph("Compacte leeswijzer", STYLES["section_title"]))
    story.append(Paragraph(methodology_payload["intro_text"], STYLES["body"]))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph(
        f"Hoe lees je het {scan_meta['signal_short_label']}?",
        STYLES["sub_title"],
    ))
    story.append(Paragraph(methodology_payload["method_text"], STYLES["body"]))
    story.append(Spacer(1, 0.2 * cm))

    band_rows = methodology_payload["band_rows"]
    band_table = Table(
        band_rows,
        colWidths=[content_width * 0.20, content_width * 0.18, content_width * 0.62],
    )
    band_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), theme["navy"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), REPORT_FONTS["semibold"]),
        ("FONTSIZE", (0, 0), (-1, -1), 8.2),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [theme["surface"], theme["soft"]]),
        ("GRID", (0, 0), (-1, -1), 0.45, theme["border"]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (0, 1), (1, -1), "CENTER"),
        ("FONTNAME", (0, 1), (1, -1), REPORT_FONTS["semibold"]),
    ]))
    story.append(band_table)
    story.append(Spacer(1, 0.2 * cm))

    trust_rows = methodology_payload.get("trust_rows", [])[:4]
    if trust_rows:
        trust_table = Table(
            trust_rows,
            colWidths=[content_width * 0.27, content_width * 0.73],
        )
        trust_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), theme["accent_light"]),
            ("BACKGROUND", (1, 0), (1, -1), theme["surface"]),
            ("TEXTCOLOR", (0, 0), (0, -1), theme["accent_dark"]),
            ("FONTNAME", (0, 0), (0, -1), REPORT_FONTS["semibold"]),
            ("FONTSIZE", (0, 0), (-1, -1), 8.2),
            ("GRID", (0, 0), (-1, -1), 0.45, theme["border"]),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        story.append(trust_table)
        story.append(Spacer(1, 0.2 * cm))

    stats_note = (
        f"Resultaten verschijnen pas vanaf voldoende responses. Patroonanalyse vraagt minimaal 10 responses; segmentvergelijkingen tonen we vanaf minimaal {MIN_SEGMENT_N} per groep."
    )
    if has_segment_deep_dive:
        stats_note += " Segment deep dive blijft beschrijvend en is bedoeld om vervolgvragen te richten, niet om oorzaken te bewijzen."
    _append_emphasis_note(
        story,
        title="Methodiek in één zin",
        body=stats_note,
        content_width=content_width,
        theme=theme,
    )


def _append_divider_line(story: list, *, content_width: float, color: colors.Color = BORDER, gap_mm: float = 4.0) -> None:
    divider = Table([[""]], colWidths=[content_width], rowHeights=[0.5])
    divider.setStyle(TableStyle([
        ("LINEABOVE", (0, 0), (-1, 0), 0.5, color),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(divider)
    story.append(Spacer(1, gap_mm * mm))


def _append_section_heading(
    story: list,
    *,
    eyebrow: str,
    title: str,
    intro: str | None = None,
    content_width: float,
    divider: bool = False,
) -> None:
    story.append(Paragraph(escape(eyebrow.upper()), STYLES["eyebrow"]))
    story.append(Paragraph(title, STYLES["section_title"]))
    if intro:
        story.append(Paragraph(intro, STYLES["body"]))
    if divider:
        _append_divider_line(story, content_width=content_width)


def _append_chart_frame(
    story: list,
    *,
    label: str,
    image: Image | None,
    content_width: float,
    theme: dict[str, colors.Color],
    caption: str | None = None,
) -> None:
    if image is None:
        return
    frame = _build_chart_frame_flowable(
        label=label,
        image=image,
        content_width=content_width,
        theme=theme,
        caption=caption,
    )
    story.append(frame)
    story.append(Spacer(1, 0.2 * cm))


def _build_chart_frame_flowable(
    *,
    label: str,
    image: Image | None,
    content_width: float,
    theme: dict[str, colors.Color],
    caption: str | None = None,
) -> Table | None:
    if image is None:
        return None
    rows: list[list[Any]] = [[Paragraph(label, STYLES["label"])]]
    rows.append([image])
    if caption:
        rows.append([Paragraph(caption, STYLES["caption"])])
    frame = Table(rows, colWidths=[content_width])
    frame.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), theme["surface"]),
        ("BOX", (0, 0), (-1, -1), 0.7, theme["border"]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return frame


def _build_stacked_distribution_flowable(
    *,
    title: str,
    counts: dict[str, int],
    width: float,
    theme: dict[str, colors.Color],
    caption: str | None = None,
) -> Table:
    total = max(sum(counts.values()), 1)
    segments = [
        {
            "band": "LAAG",
            "label": management_band_label(band="LAAG"),
            "count": counts.get("LAAG", 0),
            "bg": theme["surface"],
            "fg": theme["text"],
        },
        {
            "band": "MIDDEN",
            "label": management_band_label(band="MIDDEN"),
            "count": counts.get("MIDDEN", 0),
            "bg": TOKENS["cream"],
            "fg": theme["text"],
        },
        {
            "band": "HOOG",
            "label": management_band_label(band="HOOG"),
            "count": counts.get("HOOG", 0),
            "bg": theme["accent"],
            "fg": WHITE,
        },
    ]
    base_widths = [max(width * (segment["count"] / total), 22 * mm) for segment in segments]
    scale = width / sum(base_widths)
    bar_widths = [segment_width * scale for segment_width in base_widths]
    bar_cells = []
    for segment in segments:
        pct = round(segment["count"] / total * 100)
        bar_cells.append(
            Paragraph(
                f"<b>{segment['label']}</b><br/>{pct}% · n={segment['count']}",
                ParagraphStyle(
                    f"stacked_{segment['band']}",
                    fontName=REPORT_FONTS["semibold"],
                    fontSize=7.0,
                    leading=9.0,
                    textColor=segment["fg"],
                    alignment=TA_CENTER,
                ),
            )
        )
    bar = Table([bar_cells], colWidths=bar_widths)
    bar.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), segments[0]["bg"]),
        ("BACKGROUND", (1, 0), (1, 0), segments[1]["bg"]),
        ("BACKGROUND", (2, 0), (2, 0), segments[2]["bg"]),
        ("BOX", (0, 0), (-1, -1), 0.6, theme["border"]),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, theme["border"]),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    rows: list[list[Any]] = [[Paragraph(title, STYLES["label"])], [bar]]
    if caption:
        rows.append([Paragraph(caption, STYLES["caption"])])
    frame = Table(rows, colWidths=[width])
    frame.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), theme["surface"]),
        ("BOX", (0, 0), (-1, -1), 0.7, theme["border"]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return frame


def _append_executive_pathway(
    story: list,
    *,
    steps: list[dict[str, str]],
    content_width: float,
    theme: dict[str, colors.Color],
) -> None:
    if not steps:
        return

    label_tables = []
    for index, step in enumerate(steps, start=1):
        label_tables.append(
            _build_badge_table(
                {
                    "label": f"{index}. {step['title']}",
                    "bg": TOKENS["teal_light"] if index < len(steps) else TOKENS["risk_low_bg"],
                    "fg": theme["accent_dark"],
                },
                max(content_width / max(len(steps), 1) - 8, 24 * mm),
            )
        )
    label_row = Table([label_tables], colWidths=[content_width / len(label_tables)] * len(label_tables))
    label_row.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(label_row)
    story.append(Spacer(1, 0.12 * cm))
    for index, step in enumerate(steps, start=1):
        story.append(_build_metric_band_flowable(
            {
                "title": step["title"],
                "value": str(index),
                "body": step["body"],
                "background": TOKENS["cream"] if index % 2 == 0 else theme["surface"],
                "accent_color": theme["accent"] if index == 3 else theme["border"],
            },
            width=content_width,
            theme=theme,
        ))
        story.append(Spacer(1, 0.10 * cm))


def _append_roadmap_timeline(
    story: list,
    *,
    steps: list[dict[str, str]],
    content_width: float,
    theme: dict[str, colors.Color],
) -> None:
    if not steps:
        return

    compact_cards: list[Table] = []
    columns = len(steps)
    card_width = max((content_width / max(columns, 1)) - 10, 24 * mm)
    for index, step in enumerate(steps, start=1):
        card = Table(
            [[
                Paragraph(
                    f"<b>{index}</b><br/>{_truncate_copy(step['title'], limit=48)}",
                    ParagraphStyle(
                        f"timeline_{index}",
                        fontName=REPORT_FONTS["semibold"],
                        fontSize=7.0,
                        leading=9.0,
                        alignment=TA_CENTER,
                        textColor=theme["ink"],
                    ),
                )
            ]],
            colWidths=[card_width],
        )
        card.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), TOKENS["cream"] if index % 2 else theme["surface"]),
            ("BOX", (0, 0), (-1, -1), 0.6, theme["border"]),
            ("LINEABOVE", (0, 0), (-1, 0), 2.2, theme["accent"] if index == 1 else theme["border"]),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ]))
        compact_cards.append(card)
    roadmap = Table([compact_cards], colWidths=[content_width / columns] * columns)
    roadmap.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(roadmap)
    story.append(Spacer(1, 0.14 * cm))


def _append_theme_chip_band(
    story: list,
    *,
    themes: list[dict[str, Any]],
    content_width: float,
    theme: dict[str, colors.Color],
) -> None:
    if not themes:
        return

    chips = []
    for item in themes[:3]:
        chips.append(
            Table(
                [[Paragraph(
                    f"{item['title']} · n={item['count']}",
                    ParagraphStyle(
                        f"chip_{item['key']}",
                        fontName=REPORT_FONTS["semibold"],
                        fontSize=7.0,
                        leading=9.0,
                        textColor=theme["ink"],
                        alignment=TA_CENTER,
                    ),
                )]],
                colWidths=[max((content_width / min(len(themes[:3]), 3)) - 8, 34 * mm)],
            )
        )
    for chip in chips:
        chip.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), TOKENS["cream"]),
            ("BOX", (0, 0), (-1, -1), 0.6, theme["border"]),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ]))
    band = Table([chips], colWidths=[content_width / len(chips)] * len(chips))
    band.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(band)
    story.append(Spacer(1, 0.10 * cm))


def _append_segment_small_multiples(
    story: list,
    *,
    segment_rows: list[dict[str, Any]],
    org_avg_risk: float | None,
    content_width: float,
    theme: dict[str, colors.Color],
    signal_label_lower: str,
) -> None:
    if not segment_rows or org_avg_risk is None:
        return

    grouped = {
        "department": [row for row in segment_rows if row["segment_type"] == "department"][:3],
        "tenure": [row for row in segment_rows if row["segment_type"] == "tenure"][:3],
        "role_level": [row for row in segment_rows if row["segment_type"] == "role_level"][:3],
    }
    frames: list[Table] = []
    labels = {
        "department": "Afdeling",
        "tenure": "Diensttijd",
        "role_level": "Functieniveau",
    }
    for key, rows in grouped.items():
        image = _segment_small_multiple_image(rows, org_avg_risk=org_avg_risk)
        if not image:
            continue
        frames.append(_build_chart_frame_flowable(
            label=labels[key],
            image=image,
            content_width=(content_width / 3) - 6,
            theme=theme,
            caption=f"Zelfde schaal als organisatiegemiddelde {signal_label_lower}.",
        ))
    if not frames:
        return
    while len(frames) < 3:
        frames.append(Spacer(1, 0.01 * cm))
    row = Table([frames], colWidths=[content_width / 3] * 3)
    row.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(row)
    story.append(Spacer(1, 0.12 * cm))


def _build_columns_flowable(
    *,
    column_items: list[list[Any]],
    col_widths: list[float],
) -> Table:
    columns = [
        _build_stack_table(items, width)
        for items, width in zip(column_items, col_widths)
    ]
    table = Table([columns], colWidths=col_widths)
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return table


def _build_divider_flowable(*, width: float, color: colors.Color = BORDER) -> Table:
    divider = Table([[""]], colWidths=[width], rowHeights=[0.5])
    divider.setStyle(TableStyle([
        ("LINEABOVE", (0, 0), (-1, 0), 0.5, color),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return divider


def _build_data_table_flowable(
    *,
    rows: list[list[Any]],
    col_widths: list[float],
    theme: dict[str, colors.Color],
    highlight_columns: dict[int, list[colors.Color]] | None = None,
    align_columns: list[int] | None = None,
    bold_columns: list[int] | None = None,
) -> Table:
    table = Table(rows, colWidths=col_widths)
    style = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), theme["navy"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), REPORT_FONTS["semibold"]),
        ("FONTSIZE", (0, 0), (-1, -1), 7.6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [theme["surface"], TOKENS["cream"]]),
        ("GRID", (0, 0), (-1, -1), 0.45, theme["border"]),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ])
    for column_idx in align_columns or []:
        style.add("ALIGN", (column_idx, 1), (column_idx, -1), "CENTER")
    for column_idx in bold_columns or []:
        style.add("FONTNAME", (column_idx, 1), (column_idx, -1), REPORT_FONTS["semibold"])
    if highlight_columns:
        for column_idx, color_values in highlight_columns.items():
            for row_idx, text_color in enumerate(color_values, start=1):
                style.add("TEXTCOLOR", (column_idx, row_idx), (column_idx, row_idx), text_color)
                style.add("FONTNAME", (column_idx, row_idx), (column_idx, row_idx), REPORT_FONTS["semibold"])
    table.setStyle(style)
    return table


def _build_metric_band_flowable(
    card: dict[str, Any],
    *,
    width: float,
    theme: dict[str, colors.Color],
) -> Table:
    value_width = width * 0.28
    detail_width = width - value_width
    value = Paragraph(
        card.get("value", ""),
        ParagraphStyle(
            f"metric_band_value_{card.get('title', 'band')}",
            fontName=REPORT_FONTS["bold"],
            fontSize=15,
            leading=17,
            textColor=card.get("value_color", theme["ink"]),
            alignment=TA_LEFT,
        ),
    )
    detail_rows: list[list[Any]] = []
    if card.get("title"):
        detail_rows.append([Paragraph(card["title"], STYLES["body_bold"])])
    if card.get("body"):
        detail_rows.append([Paragraph(card["body"], STYLES["body"])])
    detail = Table(detail_rows or [[Spacer(1, 0.01 * cm)]], colWidths=[detail_width])
    detail.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    band = Table([[value, detail]], colWidths=[value_width, detail_width])
    band.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), card.get("background", theme["surface"])),
        ("BOX", (0, 0), (-1, -1), 0.7, theme["border"]),
        ("LINEBEFORE", (0, 0), (0, -1), 2.5, card.get("accent_color", theme["accent"])),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return band


def _append_data_table(
    story: list,
    *,
    rows: list[list[Any]],
    col_widths: list[float],
    content_width: float,
    theme: dict[str, colors.Color],
    highlight_columns: dict[int, list[colors.Color]] | None = None,
) -> None:
    table = _build_data_table_flowable(
        rows=rows,
        col_widths=col_widths,
        theme=theme,
        highlight_columns=highlight_columns,
    )
    story.append(table)
    story.append(Spacer(1, 0.22 * cm))


def _factor_signal_score(factor: str, factor_avgs: dict[str, float]) -> float:
    return round(11.0 - factor_avgs.get(factor, 5.5), 1)


def _factor_explanation_lookup() -> dict[str, str]:
    lookup: dict[str, str] = {}
    for name, _source, explanation in FACTOR_EXPLANATIONS:
        normalized = name.strip().lower()
        lookup[normalized] = explanation
    return lookup


def _factor_label_to_key(label: str) -> str:
    normalized = label.lower().strip()
    for key, value in FACTOR_LABELS_NL.items():
        if value.lower() == normalized:
            return key
    return normalized


def _factor_decision_text(factor: str, *, is_retention: bool) -> str:
    decision_lookup = {
        "exit": {
            "leadership": "Bepaal of dit vooral een lokaal leidinggevingsspoor of een breder MT-thema is.",
            "culture": "Toets of dit vooral teamveiligheid of breder cultuurgedrag weerspiegelt.",
            "growth": "Kies of perspectief, gesprek of ontwikkelruimte als eerste ingreep telt.",
            "compensation": "Maak zichtbaar of hoogte, fairness of uitlegbaarheid nu het belangrijkste gesprek is.",
            "workload": "Bepaal waar werkdruk direct omlaag moet en waar vooral prioriteiten scherper moeten.",
            "role_clarity": "Toets waar prioriteiten, rolgrenzen of besluitvorming nu het meest schuren.",
        },
        "retention": {
            "leadership": "Gebruik dit als eerste verificatiespoor voor richting, feedback en autonomie-ondersteuning.",
            "culture": "Toets of dit nu een teamspecifiek veiligheidsspoor of een breder cultuurthema is.",
            "growth": "Bepaal of medewerkers vooral zicht op perspectief of feitelijke ontwikkelruimte missen.",
            "compensation": "Toets of dit vooral gaat over hoogte, fairness of uitlegbaarheid van voorwaarden.",
            "workload": "Bepaal in welke teams druk echt onhoudbaar wordt en wat eerst verlichting vraagt.",
            "role_clarity": "Maak zichtbaar waar prioriteiten, verwachtingen of eigenaarschap nu uit elkaar lopen.",
        },
    }
    product_key = "retention" if is_retention else "exit"
    return decision_lookup[product_key].get(
        factor,
        "Gebruik dit als eerste managementspoor voor verificatie en opvolging.",
    )


def _factor_current_state_text(factor: str, *, is_retention: bool) -> str:
    label = FACTOR_LABELS_NL.get(factor, factor)
    explanation = _factor_explanation_lookup().get(label.lower())
    if explanation:
        return explanation
    if is_retention:
        return f"{label} kleurt nu waar behoud onder druk staat en helpt verklaren waarom dit beeld zichtbaar wordt."
    return f"{label} kleurt nu waar het vertrekbeeld bestuurlijk de meeste spanning laat zien."


def _build_card_flowable(
    card: dict[str, Any],
    *,
    width: float,
    theme: dict[str, colors.Color],
    large_value: bool = False,
) -> Table:
    rows: list[list[Any]] = []
    if card.get("title"):
        rows.append([Paragraph(card["title"], ParagraphStyle(
            f"single_card_title_{card['title']}",
            fontName=REPORT_FONTS["semibold"],
            fontSize=7.2,
            leading=9.4,
            textColor=theme["text"],
        ))])
    if card.get("badge"):
        rows.append([_build_badge_table(card["badge"], min(width * 0.48, 42 * mm))])
    if card.get("value"):
        rows.append([Paragraph(card["value"], ParagraphStyle(
            f"single_card_value_{card['title']}",
            fontName=REPORT_FONTS["bold"],
            fontSize=14.4 if large_value else 11.6,
            leading=16.0 if large_value else 13.4,
            textColor=card.get("value_color", theme["ink"]),
        ))])
    if card.get("body"):
        rows.append([Paragraph(card["body"], ParagraphStyle(
            f"single_card_body_{card['title']}",
            fontName=REPORT_FONTS["regular"],
            fontSize=7.6,
            leading=10.6,
            textColor=theme["text"],
        ))])
    table = Table(rows, colWidths=[width])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), card.get("background", theme["surface"])),
        ("BOX", (0, 0), (-1, -1), 0.7, theme["border"]),
        ("LINEABOVE", (0, 0), (-1, 0), 2, card.get("accent_color", theme["accent"])),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return table


def _append_card_grid(
    story: list,
    cards: list[dict[str, Any]],
    *,
    content_width: float,
    theme: dict[str, colors.Color],
    columns: int = 3,
    large_value: bool = False,
) -> None:
    if not cards:
        return
    column_count = max(1, min(columns, 3))
    cell_width = content_width / column_count - 10
    rows = [cards[i:i + column_count] for i in range(0, len(cards), column_count)]
    for row_cards in rows:
        flowables = [
            _build_card_flowable(card, width=cell_width, theme=theme, large_value=large_value)
            for card in row_cards
        ]
        if len(flowables) < column_count:
            flowables += [""] * (column_count - len(flowables))
        row = Table([flowables], colWidths=[content_width / column_count] * column_count)
        row.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        story.append(row)
        story.append(Spacer(1, 0.12 * cm))


def _build_stack_table(items: list[Any], width: float) -> Table:
    if not items:
        items = [Spacer(1, 0.01 * cm)]
    rows = [[item] for item in items]
    table = Table(rows, colWidths=[width])
    table.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return table


def _build_editorial_group(
    *,
    title: str,
    body: str,
    width: float,
    value: str | None = None,
    value_color: colors.Color | None = None,
) -> Table:
    rows: list[Any] = [Paragraph(title, STYLES["label"])]
    if value:
        rows.append(Paragraph(
            value,
            ParagraphStyle(
                f"editorial_value_{title}",
                fontName=REPORT_FONTS["bold"],
                fontSize=11.4,
                leading=13.4,
                textColor=value_color or TEXT,
            ),
        ))
    rows.append(Paragraph(
        body,
        ParagraphStyle(
            f"editorial_body_{title}",
            fontName=REPORT_FONTS["regular"],
            fontSize=8.0,
            leading=10.8,
            textColor=TEXT,
        ),
    ))
    return _build_stack_table(rows, width)


def _append_focus_question_block(
    story: list,
    *,
    label: str,
    score: float,
    signal_value: float,
    decision_text: str,
    explanation: str | None,
    hypothesis: dict[str, str] | None,
    content_width: float,
    theme: dict[str, colors.Color],
    add_divider: bool,
) -> None:
    story.append(Paragraph(label, STYLES["sub_title"]))
    summary_table = _build_data_table_flowable(
        rows=[
            ["Factor", "Score", "Signaal"],
            [label, f"{score:.1f}/10", f"{signal_value:.1f}/10"],
        ],
        col_widths=[content_width * 0.58, content_width * 0.20, content_width * 0.22],
        theme=theme,
        align_columns=[1, 2],
        bold_columns=[1, 2],
        highlight_columns={2: [_risk_color(signal_value)]},
    )
    story.append(summary_table)
    story.append(Spacer(1, 0.10 * cm))
    hypothesis_body = None
    if hypothesis:
        hypothesis_body = hypothesis.get("question", hypothesis["body"])
    right_body_parts = []
    if explanation:
        right_body_parts.append(explanation)
    if hypothesis_body:
        right_body_parts.append(f"<b>Te toetsen vraag:</b> {hypothesis_body}")
    left_card = _build_card_flowable(
        {
            "title": "Wat dit nu vraagt",
            "value": f"{score:.1f}/10",
            "badge": _risk_badge(label=management_band_label(score=signal_value)),
            "body": decision_text,
            "background": theme["soft"],
        },
        width=content_width * 0.49,
        theme=theme,
    )
    right_card = _build_card_flowable(
        {
            "title": "Waar deze factor voor staat" if explanation else "Te toetsen vraag",
            "value": f"{signal_value:.1f}/10 signaal",
            "body": "<br/><br/>".join(right_body_parts) if right_body_parts else "Nog geen aanvullende duiding beschikbaar.",
            "background": TOKENS["surface"],
        },
        width=content_width * 0.49,
        theme=theme,
    )
    story.append(_build_columns_flowable(
        column_items=[[left_card], [right_card]],
        col_widths=[content_width * 0.49, content_width * 0.49],
    ))
    story.append(Spacer(1, 0.10 * cm))
    if add_divider:
        _append_divider_line(story, content_width=content_width, gap_mm=2.5)


def _build_boardroom_story(
    *,
    camp: Campaign,
    org: Organization,
    scan_lbl: str,
    signal_label: str,
    signal_label_lower: str,
    now_str: str,
    content_width: float,
    report_theme: dict[str, colors.Color],
    management_summary_payload: dict[str, Any],
    cover_metric_cards: list[dict[str, str]],
    avg_risk: float | None,
    trend_delta: float | None,
    previous_campaign_label: str | None,
    has_pattern: bool,
    n_completed: int,
    band_counts: dict[str, int],
    signal_page_payload: dict[str, Any],
    signal_page_cards: list[dict[str, str]],
    factor_avgs: dict[str, float],
    top_risks: list[tuple[str, float]],
    top_factor_keys: list[str],
    top_factor_labels: list[str],
    is_retention: bool,
    avg_engagement: float | None,
    avg_turnover_intention: float | None,
    avg_stay_intent: float | None,
    retention_themes: list[dict[str, Any]],
    retention_trend_rows: list[dict[str, Any]],
    strong_work_signal_pct: float | None,
    any_work_signal_pct: float | None,
    top_exit_reason_label: str | None,
    top_contributing_reason_label: str | None,
    signal_visibility_average: float | None,
    pattern: dict[str, Any],
    responses: list[SurveyResponse],
    hypotheses: list[dict[str, str]],
    hypotheses_payload: dict[str, str],
    next_steps_payload: dict[str, Any],
    retention_playbooks: list[dict[str, Any]],
    retention_playbook_calibration_note: str | None,
    retention_segment_playbooks: list[dict[str, Any]],
    scan_meta: dict[str, Any],
    has_segment_deep_dive: bool,
    cover_distribution_note: str,
) -> list:
    story: list = []

    # Cover
    story.append(Spacer(1, 1.6 * cm))
    story.append(Paragraph("VERISIGHT", ParagraphStyle(
        "cover_brand_label",
        parent=STYLES["cover_sub"],
        fontName=REPORT_FONTS["semibold"],
        fontSize=8.2,
        textColor=report_theme["accent"],
    )))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph(camp.name, STYLES["cover_title"]))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(f"{scan_lbl}  ·  {org.name}", STYLES["cover_sub"]))
    story.append(Spacer(1, 0.35 * cm))
    story.append(Paragraph(
        management_summary_payload.get("executive_title", "Executive snapshot"),
        ParagraphStyle(
                "cover_exec_title_v2",
                fontName=REPORT_FONTS["semibold"],
                fontSize=15,
                leading=20,
                textColor=report_theme["ink"],
            ),
        ))
    story.append(Spacer(1, 0.08 * cm))
    story.append(Paragraph(
        management_summary_payload.get("executive_intro", ""),
        ParagraphStyle(
                "cover_exec_intro_v2",
                fontName=REPORT_FONTS["regular"],
                fontSize=9.3,
                leading=14.5,
                textColor=report_theme["text"],
            ),
        ))
    story.append(Spacer(1, 0.3 * cm))
    _append_metric_band(
        story,
        cover_metric_cards[:4],
        content_width=content_width,
        theme=report_theme,
        columns=4,
    )
    if trend_delta is not None:
        comparison_label = previous_campaign_label or "vorige campagne"
        trend_phrase = "verbeterd" if trend_delta < -0.1 else "verslechterd" if trend_delta > 0.1 else "stabiel"
        _append_emphasis_note(
            story,
            title="Trend sinds vorige meting",
            body=(
                f"Ten opzichte van {comparison_label} is het gemiddelde {signal_label_lower} {trend_phrase} "
                f"({'+' if trend_delta > 0 else ''}{trend_delta:.1f}). Lees dit als richting voor gesprek en opvolging."
            ),
            content_width=content_width,
            theme=report_theme,
        )
    _append_highlight_cards(
        story,
        management_summary_payload.get("highlight_cards", [])[:3],
        content_width=content_width,
        theme=report_theme,
    )
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(f"Gegenereerd op {now_str}", STYLES["cover_meta"]))
    story.append(Paragraph(cover_distribution_note, STYLES["cover_meta"]))
    story.append(PageBreak())

    # Executive snapshot
    story.append(Paragraph(
        "Bestuurlijke handoff" if has_pattern else "Executive snapshot",
        STYLES["section_title"],
    ))
    story.append(Paragraph(
        "Lees eerst wat nu speelt, waarom het bestuurlijk telt en welk eerste besluit bij deze meetronde hoort.",
        STYLES["body"],
    ))
    story.append(Spacer(1, 0.2 * cm))
    _append_highlight_cards(
        story,
        management_summary_payload.get("boardroom_cards", [])[:6],
        content_width=content_width,
        theme=report_theme,
    )

    if avg_risk is not None:
        band_label = "HOOG" if avg_risk >= 7 else "MIDDEN" if avg_risk >= 4.5 else "LAAG"
        story.append(Spacer(1, 0.1 * cm))
        story.append(Paragraph(f"Gemiddeld {signal_label_lower}", STYLES["sub_title"]))
        gauge = _risk_gauge_image(avg_risk, band_label)
        distribution_rows = [
            ["Band", "n", "%"],
            ["Hoog", str(band_counts["HOOG"]), f"{band_counts['HOOG'] / max(n_completed, 1) * 100:.0f}%"],
            ["Midden", str(band_counts["MIDDEN"]), f"{band_counts['MIDDEN'] / max(n_completed, 1) * 100:.0f}%"],
            ["Laag", str(band_counts["LAAG"]), f"{band_counts['LAAG'] / max(n_completed, 1) * 100:.0f}%"],
        ]
        dist = Table(
            distribution_rows,
            colWidths=[content_width * 0.14, content_width * 0.10, content_width * 0.10],
        )
        dist.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), report_theme["navy"]),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), REPORT_FONTS["semibold"]),
            ("FONTSIZE", (0, 0), (-1, -1), 8.2),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [report_theme["surface"], report_theme["soft"]]),
            ("GRID", (0, 0), (-1, -1), 0.45, report_theme["border"]),
            ("ALIGN", (1, 1), (-1, -1), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        gauge_block = Table(
            [[gauge, dist]],
            colWidths=[content_width * 0.66, content_width * 0.34],
        )
        gauge_block.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))
        story.append(gauge_block)
        story.append(Spacer(1, 0.2 * cm))

    if signal_page_cards:
        if is_retention:
            _append_metric_band(
                story,
                signal_page_cards[:3],
                content_width=content_width,
                theme=report_theme,
                columns=3,
            )
    if management_summary_payload.get("boardroom_watchout"):
        _append_emphasis_note(
            story,
            title=management_summary_payload.get("boardroom_watchout_title", "Leesgrens"),
            body=management_summary_payload.get("boardroom_watchout", ""),
            content_width=content_width,
            theme=report_theme,
        )
    story.append(PageBreak())

    if not is_retention:
        story.append(Paragraph("Kernsignalen en vertrekbeeld", STYLES["section_title"]))
        story.append(Paragraph(signal_page_payload["intro"], STYLES["body"]))
        story.append(Spacer(1, 0.2 * cm))

        if signal_page_cards:
            _append_metric_band(
                story,
                signal_page_cards[:3],
                content_width=content_width,
                theme=report_theme,
                columns=3,
            )

        top_reasons = pattern.get("top_exit_reasons", [])
        if top_reasons:
            story.append(Paragraph("Hoofdredenen van vertrek", STYLES["sub_title"]))
            reason_rows = [["Code", "Reden", "Aantal"]]
            for item in top_reasons[:4]:
                reason_rows.append([item["code"], item["label"], str(item["count"])])
            reason_table = Table(
                reason_rows,
                colWidths=[content_width * 0.12, content_width * 0.68, content_width * 0.20],
            )
            reason_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), report_theme["navy"]),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), REPORT_FONTS["semibold"]),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [report_theme["surface"], report_theme["soft"]]),
                ("GRID", (0, 0), (-1, -1), 0.45, report_theme["border"]),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("ALIGN", (2, 1), (2, -1), "CENTER"),
                ("FONTNAME", (2, 1), (2, -1), REPORT_FONTS["semibold"]),
            ]))
            story.append(reason_table)
            story.append(Spacer(1, 0.2 * cm))

        evidence_cards = []
        if strong_work_signal_pct is not None:
            evidence_cards.append({
                "title": "Direct prioriteren zichtbaar",
                "value": f"{strong_work_signal_pct:.0f}%",
                "body": "Aandeel van de exitbatch waar beïnvloedbare werkfrictie duidelijk zichtbaar terugkomt.",
            })
        if any_work_signal_pct is not None:
            evidence_cards.append({
                "title": "Eerst toetsen zichtbaar",
                "value": f"{any_work_signal_pct:.0f}%",
                "body": "Aandeel van de exitbatch waar minstens één aandachtspunt zichtbaar is.",
            })
        if signal_visibility_average is not None:
            evidence_cards.append({
                "title": "Eerdere signalering",
                "value": f"{signal_visibility_average:.1f}/5",
                "body": "Laat zien in hoeverre twijfel of vertrek vooraf zichtbaar of bespreekbaar was.",
            })
        if evidence_cards:
            _append_metric_band(
                story,
                evidence_cards,
                content_width=content_width,
                theme=report_theme,
                columns=min(3, len(evidence_cards)),
            )

        quotes = _select_relevant_quotes(
            [
                r.open_text_raw
                for r in responses
                if r.open_text_raw and r.open_text_raw.strip()
            ],
            [factor for factor, _ in top_risks[:3]],
            [item["code"] for item in top_reasons[:3]],
            max_quotes=2,
        )
        if quotes:
            story.append(Paragraph("Open signalen uit de survey", STYLES["sub_title"]))
            _append_quote_cards(story, quotes=quotes, content_width=content_width, theme=report_theme)

        story.append(PageBreak())

    # Drivers
    story.append(Paragraph("Wat drijft dit beeld?", STYLES["section_title"]))
    story.append(Paragraph(signal_page_payload["intro"], STYLES["body"]))
    story.append(Spacer(1, 0.2 * cm))

    summary_cards: list[dict[str, str]] = []

    if factor_avgs:
        story.append(_factor_bar_image(factor_avgs, width_cm=14.5))
        story.append(Spacer(1, 0.2 * cm))
        if top_risks:
            decision_lookup = {
                "exit": {
                    "leadership": "Bepaal of dit vooral een lokaal leidinggevingsspoor of een breder MT-thema is.",
                    "culture": "Toets of dit vooral teamveiligheid of breder cultuurgedrag weerspiegelt.",
                    "growth": "Kies of perspectief, gesprek of ontwikkelruimte als eerste ingreep telt.",
                    "compensation": "Maak zichtbaar of hoogte, fairness of uitlegbaarheid nu het belangrijkste gesprek is.",
                    "workload": "Bepaal waar werkdruk direct omlaag moet en waar vooral prioriteiten scherper moeten.",
                    "role_clarity": "Toets waar prioriteiten, rolgrenzen of besluitvorming nu het meest schuren.",
                },
                "retention": {
                    "leadership": "Gebruik dit als eerste verificatiespoor voor richting, feedback en autonomie-ondersteuning.",
                    "culture": "Toets of dit nu een teamspecifiek veiligheidsspoor of een breder cultuurthema is.",
                    "growth": "Bepaal of medewerkers vooral zicht op perspectief of feitelijke ontwikkelruimte missen.",
                    "compensation": "Toets of dit vooral gaat over hoogte, fairness of uitlegbaarheid van voorwaarden.",
                    "workload": "Bepaal in welke teams druk echt onhoudbaar wordt en wat eerst verlichting vraagt.",
                    "role_clarity": "Maak zichtbaar waar prioriteiten, verwachtingen of eigenaarschap nu uit elkaar lopen.",
                },
            }
            factor_rows = []
            for factor, signal_value in top_risks[:3]:
                score = factor_avgs.get(factor, 5.5)
                factor_rows.append({
                    "label": FACTOR_LABELS_NL.get(factor, factor),
                    "score": f"{score:.1f}/10",
                    "signal": f"{signal_value:.1f}/10",
                    "signal_value": signal_value,
                    "decision": decision_lookup["retention" if is_retention else "exit"].get(
                        factor,
                        "Gebruik dit als eerste managementspoor voor verificatie en opvolging.",
                    ),
                })
            _append_factor_priority_rows(
                story,
                factor_rows=factor_rows,
                content_width=content_width,
                theme=report_theme,
            )

        if is_retention:
            for row in retention_trend_rows[:3]:
                summary_cards.append({
                    "title": row["label"],
                    "value": f"{row['current']:.1f}/10 ({'+' if row['delta'] > 0 else ''}{row['delta']:.1f})",
                    "body": row["explanation"],
                })
        if summary_cards:
            story.append(Paragraph("Ontwikkeling van aanvullende signalen", STYLES["sub_title"]))
            _append_metric_band(
                story,
                summary_cards,
                content_width=content_width,
                theme=report_theme,
                columns=3,
            )
        if retention_themes:
            story.append(Paragraph("Open verbetersignalen", STYLES["sub_title"]))
            theme_cards = [
                {
                    "title": theme_item["title"],
                    "value": f"{theme_item['count']} signalen",
                    "body": theme_item["implication"],
                }
                for theme_item in retention_themes[:3]
            ]
            _append_highlight_cards(story, theme_cards, content_width=content_width, theme=report_theme)
    story.append(PageBreak())

    # Action page
    story.append(Paragraph("Waar eerst op handelen", STYLES["section_title"]))
    story.append(Paragraph(
        "Gebruik deze pagina om prioriteiten te kiezen, eigenaarschap te beleggen en van signaal naar eerste actie te gaan.",
        STYLES["body"],
    ))
    story.append(Spacer(1, 0.2 * cm))

    if hypotheses:
        hypothesis_cards = []
        for item in hypotheses[:3]:
            body = item["body"]
            if item.get("question"):
                body += f" <br/><br/><b>Te toetsen vraag:</b> {item['question']}"
            if item.get("action"):
                body += f" <br/><b>Eerste actie:</b> {item['action']}"
            hypothesis_cards.append({
                "title": item["title"],
                "value": item.get("owner", ""),
                "body": body,
            })
        _append_highlight_cards(
            story,
            hypothesis_cards,
            content_width=content_width,
            theme=report_theme,
        )

    story.append(PageBreak())

    story.append(Paragraph(
        "Eerste managementsessie en 30–90 dagenroute" if is_retention else "30–90 dagenroute en reviewmoment",
        STYLES["section_title"],
    ))
    story.append(Paragraph(next_steps_payload["session_title"], STYLES["sub_title"]))
    story.append(Paragraph(next_steps_payload["session_intro"], STYLES["body"]))
    if next_steps_payload.get("session_cards"):
        _append_highlight_cards(
            story,
            next_steps_payload["session_cards"][:6],
            content_width=content_width,
            theme=report_theme,
        )
    if next_steps_payload.get("insight_to_action"):
        _append_insight_to_action_block(
            story,
            insight_to_action=next_steps_payload["insight_to_action"],
            content_width=content_width,
            theme=report_theme,
        )
        _append_numbered_action_rows(
            story,
            steps=[
                {
                    "number": item["window"].split(" ")[0],
                    "title": item["title"],
                    "body": item["body"],
                }
                for item in next_steps_payload["insight_to_action"].get("follow_up_30_60_90", [])
            ],
            content_width=content_width,
            theme=report_theme,
        )
    else:
        _append_numbered_action_rows(
            story,
            steps=list(next_steps_payload["steps"]) + [{
                "number": "5",
                "title": scan_meta["report_repeat_title"],
                "body": scan_meta["report_repeat_body"],
            }],
            content_width=content_width,
            theme=report_theme,
        )

    if is_retention and retention_playbooks:
        story.append(Spacer(1, 0.15 * cm))
        story.append(Paragraph("Behoudsplaybooks", STYLES["sub_title"]))
        if retention_playbook_calibration_note:
            story.append(Paragraph(retention_playbook_calibration_note, STYLES["body"]))
        playbook_cards = []
        for playbook in retention_playbooks[:2]:
            actions_text = " ".join([f"• {action}" for action in playbook["actions"][:2]])
            playbook_cards.append({
                "title": playbook["label"],
                "value": f"{playbook['signal_value']:.1f}/10",
                "body": (
                    f"<b>{playbook['title']}</b><br/>"
                    f"<b>Eerste besluit:</b> {playbook['decision']}<br/>"
                    f"<b>Eerste eigenaar:</b> {playbook['owner']}<br/>"
                    f"{actions_text}"
                ),
            })
        _append_highlight_cards(story, playbook_cards, content_width=content_width, theme=report_theme)
        if retention_segment_playbooks:
            _append_emphasis_note(
                story,
                title="Segment deep dive",
                body=(
                    f"Voor deze campagne waren {len(retention_segment_playbooks)} segment-specifieke behoudssporen beschikbaar. "
                    "Gebruik die alleen als verdiepingslaag nadat het organisatieniveau is gewogen."
                ),
                content_width=content_width,
                theme=report_theme,
            )

    story.append(PageBreak())

    # Compact read guide
    _append_compact_read_guide(
        story,
        scan_type=camp.scan_type,
        content_width=content_width,
        has_segment_deep_dive=has_segment_deep_dive,
        theme=report_theme,
    )

    contact_table = Table([[
        Paragraph(
            "<b>Vragen over dit rapport?</b><br/>"
            "Neem contact op via <font color='#234B57'>hallo@verisight.nl</font>. "
            "We lopen de bevindingen graag door en helpen bij de vertaling naar een eerstvolgende stap.",
            ParagraphStyle(
                "contact_note_boardroom",
                fontName=REPORT_FONTS["regular"],
                fontSize=8.8,
                leading=13.5,
                textColor=TEXT,
            ),
        )
    ]], colWidths=[content_width])
    contact_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), report_theme["accent_light"]),
        ("BOX", (0, 0), (-1, -1), 0.5, report_theme["border"]),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(Spacer(1, 0.2 * cm))
    story.append(contact_table)
    return story


def _build_retention_action_hypotheses(
    *,
    top_risks: list[tuple[str, float]],
    factor_avgs: dict[str, float],
    retention_signal_profile: str | None,
    retention_themes: list[dict[str, Any]],
    avg_engagement: float | None,
    avg_turnover_intention: float | None,
    avg_stay_intent: float | None,
) -> list[dict[str, str]]:
    validation_questions = {
        "leadership": "Waar missen medewerkers nu vooral richting, feedback of autonomie-ondersteuning van hun leidinggevende?",
        "culture": "Waar wordt veiligheid of samenwerking nu het meest afgeremd, en in welke teams zie je dat het eerst terug?",
        "growth": "Waar ontbreekt vooral een geloofwaardig perspectief op ontwikkeling of doorgroei?",
        "compensation": "Gaat het vooral om hoogte, uitlegbaarheid of de passendheid van voorwaarden voor duurzaam werken?",
        "workload": "Welke teams ervaren vooral structurele druk en waar kan werk of prioriteit concreet worden verlicht?",
        "role_clarity": "Waar zijn prioriteiten, verwachtingen of verantwoordelijkheden nu het minst helder?",
    }
    action_hints = {
        "leadership": "Start gerichte managercheck-ins en leg vast welk leidinggevend gedrag binnen 30 dagen anders moet.",
        "culture": "Plan een teamsessie over veiligheid en samenwerking en spreek concreet gewenst gedrag af.",
        "growth": "Maak groeipaden zichtbaar en voeg een gericht ontwikkelgesprek toe aan de eerstvolgende cyclus.",
        "compensation": "Maak beloningslogica en voorwaarden beter uitlegbaar en bepaal of een gerichte fairnesscheck nodig is.",
        "workload": "Pak de hoogste drukpunten direct aan met een werklastreview en duidelijke prioriteitskeuzes.",
        "role_clarity": "Vertaal prioriteiten en rolafspraken naar een kort, expliciet werkdocument per team of rol.",
    }
    owner_hints = {
        "leadership": "HR business partner met betrokken leidinggevende",
        "culture": "HR lead met MT-sponsor",
        "growth": "HR development-owner met betrokken leidinggevende",
        "compensation": "HR lead met MT of directie",
        "workload": "Betrokken leidinggevende met HR en operations",
        "role_clarity": "Betrokken leidinggevende met HR business partner",
    }

    items: list[dict[str, str]] = []
    decision_themes = _select_retention_decision_themes(retention_themes, top_risks, max_themes=1)

    if top_risks:
        factor, signal_value = top_risks[0]
        label = FACTOR_LABELS_NL.get(factor, factor)
        score = factor_avgs.get(factor, 5.5)
        management_label = management_band_label(score=signal_value)
        matching_theme = next((theme for theme in decision_themes if theme["key"] == factor), None)
        body = (
            f"{label} wordt nu ervaren als {score:.1f}/10 en vraagt daarmee bestuurlijk {management_label.lower()}. "
            "Dat maakt dit het logischste startpunt voor verificatie en eerste managementactie."
        )
        if matching_theme:
            body += f" In open antwoorden komt dit ook terug via het thema '{matching_theme['title'].lower()}'."
        items.append({
            "title": f"Hypothese: {label} zet behoud het sterkst onder druk",
            "body": body,
            "question": validation_questions.get(factor, f"Wat speelt er precies binnen {label.lower()}?"),
            "action": action_hints.get(factor, f"Bepaal voor {label.lower()} een concrete 30-90 dagenactie."),
            "owner": owner_hints.get(factor, "HR met betrokken leidinggevende"),
        })

    if retention_signal_profile == "scherp_aandachtssignaal":
        items.append({
            "title": "Hypothese: retentiesignaal en aanvullende signalen wijzen dezelfde kant op",
            "body": (
                "De combinatie van retentiesignaal, bevlogenheid, stay-intent en vertrekintentie wijst op een scherp groepssignaal. "
                "Dit vraagt snelle verificatie in de teams of segmenten waar de laagste werkfactoren samenkomen."
            ),
            "question": "In welke teams vallen lage stay-intent, hogere vertrekintentie en zwakke werkfactoren nu samen?",
            "action": "Plan binnen twee weken een gerichte verdiepingssessie met HR en betrokken leidinggevenden op de meest afwijkende groepen.",
            "owner": "HR lead met betrokken leidinggevenden",
        })
    elif retention_signal_profile == "vertrekdenken_zichtbaar":
        items.append({
            "title": "Hypothese: expliciet vertrekdenken vraagt snelle verificatie",
            "body": (
                "Vertrekintentie is zichtbaar zonder dat je dit als individuele voorspelling moet lezen. "
                "Dat maakt het belangrijk om snel te toetsen waar het gesprek over behoud nu het meest ontbreekt."
            ),
            "question": "Waar is vertrekdenken het meest expliciet zichtbaar en welke werkfactoren worden daar het vaakst mee genoemd?",
            "action": "Gebruik het volgende gesprek om expliciet te toetsen of dit om acuut vertrekdenken of om corrigeerbare frictie gaat.",
            "owner": "HR business partner met MT-sponsor",
        })
    else:
        items.append({
            "title": "Hypothese: dit is vooral een vroegsignaal dat prioritering vraagt",
            "body": (
                "Het totaalbeeld wijst eerder op behoudsdruk dan op een harde vertrekclaim. "
                "Juist daarom loont het om nu scherp te prioriteren welke factoren eerst aandacht verdienen."
            ),
            "question": "Welke signalen zijn nog te vroeg om hard te duiden, maar sterk genoeg om nu wel gericht te bespreken?",
            "action": "Beperk de eerste ronde tot maximaal drie concrete acties en leg direct vast wanneer je de uitkomst opnieuw toetst.",
            "owner": "HR owner van de meetronde",
        })

    if avg_engagement is not None and avg_turnover_intention is not None and avg_stay_intent is not None:
        items.append({
            "title": "Hypothese: de signaalcombinatie bepaalt hoe acuut opvolging is",
            "body": (
                f"Bevlogenheid ({avg_engagement:.1f}/10), stay-intent ({avg_stay_intent:.1f}/10) en vertrekintentie ({avg_turnover_intention:.1f}/10) "
                "moeten in samenhang worden gelezen. Dat onderscheidt een vroegsignaal van een scherper aandachtspunt."
            ),
            "question": "Welk signaal vraagt nu vooral verdieping: energie, expliciete bereidheid om te blijven of zichtbaar vertrekdenken?",
            "action": "Bespreek deze combinatie expliciet in de MT-duiding en koppel elke uitkomst aan één eigenaar en één vervolgactie.",
            "owner": "HR lead met MT",
        })

    return items[:3]


def _build_retention_playbook_rows(
    top_risks: list[tuple[str, float]],
    playbooks: dict[str, dict[str, dict[str, Any]]],
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for factor, signal_value in top_risks[:2]:
        band = "HOOG" if signal_value >= 7 else "MIDDEN" if signal_value >= 4.5 else "LAAG"
        playbook = playbooks.get(factor, {}).get(band)
        if not playbook:
            continue
        rows.append({
            "factor": factor,
            "label": FACTOR_LABELS_NL.get(factor, factor),
            "signal_value": signal_value,
            "band": band,
            "title": playbook["title"],
            "decision": playbook["decision"],
            "validate": playbook["validate"],
            "owner": playbook["owner"],
            "actions": playbook["actions"],
            "caution": playbook["caution"],
            "review": playbook.get("review") or _retention_review_note(FACTOR_LABELS_NL.get(factor, factor)),
        })
    return rows


def _retention_review_note(factor_label: str) -> str:
    return (
        f"Plan binnen 45-90 dagen een review of vervolgmeting op {factor_label.lower()}: "
        "wat is geverifieerd, welke eerste stap loopt en wat verschuift er in retentiesignaal en aanvullende signalen."
    )


def _compute_retention_signal_averages(responses: list[SurveyResponse]) -> dict[str, float | None]:
    risk_scores = [float(response.risk_score) for response in responses if response.risk_score is not None]
    engagement_scores = [float(response.uwes_score) for response in responses if response.uwes_score is not None]
    turnover_scores = [
        float(response.turnover_intention_score)
        for response in responses
        if response.turnover_intention_score is not None
    ]
    stay_scores = [float(response.stay_intent_score) for response in responses if response.stay_intent_score is not None]

    def _avg(values: list[float]) -> float | None:
        return round(sum(values) / len(values), 2) if values else None

    return {
        "retention_signal": _avg(risk_scores),
        "engagement": _avg(engagement_scores),
        "turnover_intention": _avg(turnover_scores),
        "stay_intent": _avg(stay_scores),
    }


def _build_retention_trend_rows(
    *,
    current: dict[str, float | None],
    previous: dict[str, float | None],
) -> list[dict[str, Any]]:
    definitions = [
        (
            "Bevlogenheid",
            "engagement",
            "Een hogere score wijst op meer energie en positieve betrokkenheid dan in de vorige meting.",
            "De energie ligt lager dan in de vorige meting. Toets vooral of werkdruk, leiderschap of perspectief mee verschuiven.",
            "Bevlogenheid beweegt beperkt. Gebruik dit om te toetsen of acties al effect hebben of nog onvoldoende zichtbaar zijn.",
            "higher_is_better",
        ),
        (
            "Stay-intent",
            "stay_intent",
            "De expliciete bereidheid om te blijven is hoger dan in de vorige meting.",
            "Stay-intent is gedaald. Dat maakt snelle verificatie en vervolgactie belangrijker.",
            "Stay-intent is vrijwel stabiel. Kijk vooral of dit past bij de ontwikkeling van werkfactoren en vertrekintentie.",
            "higher_is_better",
        ),
        (
            "Vertrekintentie",
            "turnover_intention",
            "Vertrekintentie is lager dan in de vorige meting. Dat is positief zolang werkfactoren mee verbeteren.",
            "Vertrekintentie is opgelopen. Toets snel of dit vooral in specifieke teams of rollen zichtbaar is.",
            "Vertrekintentie blijft ongeveer gelijk. Segmentvergelijking helpt hier het snelst bepalen waar aandacht nodig is.",
            "lower_is_better",
        ),
    ]

    rows: list[dict[str, Any]] = []
    for label, key, improved_text, worsened_text, stable_text, direction in definitions:
        current_value = current.get(key)
        previous_value = previous.get(key)
        if current_value is None or previous_value is None:
            continue

        delta = round(float(current_value) - float(previous_value), 1)
        if direction == "higher_is_better":
            improved = delta >= 0.1
            worsened = delta <= -0.1
        else:
            improved = delta <= -0.1
            worsened = delta >= 0.1

        rows.append({
            "label": label,
            "current": current_value,
            "previous": previous_value,
            "delta": delta,
            "direction": "verbeterd" if improved else "verslechterd" if worsened else "stabiel",
            "explanation": improved_text if improved else worsened_text if worsened else stable_text,
        })

    return rows


def _build_prior_signal_rows(
    *,
    previous_campaign_label: str | None,
    previous_avg_risk: float | None,
    previous_responses: list[SurveyResponse],
) -> list[dict[str, Any]]:
    if not previous_campaign_label or previous_avg_risk is None or not previous_responses:
        return []

    previous_pattern_input = [
        {
            "org_scores": response.org_scores,
            "sdt_scores": response.sdt_scores,
            "risk_score": response.risk_score,
            "signal_score": response.risk_score,
            "preventability": response.preventability,
            "exit_reason_code": response.exit_reason_code,
            "stay_intent_score": response.stay_intent_score,
            "direction_signal_score": response.stay_intent_score,
            "contributing_reason_codes": list((response.pull_factors_raw or {}).keys()),
            "department": response.respondent.department,
            "role_level": response.respondent.role_level,
        }
        for response in previous_responses
    ]
    previous_pattern = detect_patterns(previous_pattern_input)
    previous_top = (previous_pattern.get("top_risk_factors") or [])[:3]

    rows: list[dict[str, Any]] = []
    if previous_top:
        for factor, signal_score in previous_top[:3]:
            rows.append({
                "period": previous_campaign_label,
                "top_factor": FACTOR_LABELS_NL.get(factor, factor),
                "score": round(float(signal_score), 1),
            })
    else:
        rows.append({
            "period": previous_campaign_label,
            "top_factor": "Vorige meting",
            "score": round(float(previous_avg_risk), 1),
        })
    return rows


def _build_retention_group_rows(
    responses: list[SurveyResponse],
) -> tuple[list[dict[str, Any]], dict[str, int]]:
    turnover_groups = {"Hoog": 0, "Midden": 0, "Laag": 0}
    engagement_dist = {"hoog": 0, "midden": 0, "laag": 0}

    for response in responses:
        if response.turnover_intention_score is not None:
            value = float(response.turnover_intention_score)
            if value >= 6.5:
                turnover_groups["Hoog"] += 1
            elif value >= 4.5:
                turnover_groups["Midden"] += 1
            else:
                turnover_groups["Laag"] += 1
        if response.uwes_score is not None:
            value = float(response.uwes_score)
            if value >= 6.5:
                engagement_dist["hoog"] += 1
            elif value >= 4.5:
                engagement_dist["midden"] += 1
            else:
                engagement_dist["laag"] += 1

    turnover_rows = [
        {"label": label, "count": count}
        for label, count in turnover_groups.items()
        if count > 0
    ]
    return turnover_rows, engagement_dist


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
    owner_by_factor = {
        "leadership": "HR business partner met betrokken leidinggevende",
        "culture": "HR lead met betrokken MT-lid",
        "growth": "HR development-owner met betrokken leidinggevende",
        "compensation": "HR lead met MT of directie",
        "workload": "Betrokken leidinggevende met HR en operations",
        "role_clarity": "Betrokken leidinggevende met HR business partner",
    }
    action_by_factor = {
        "leadership": "Plan binnen 2 weken een gericht gesprek met HR en de betrokken leidinggevende over feedback, richting en opvolging.",
        "culture": "Plan een MT- of teamsessie waarin veiligheid, samenwerking en bespreekbaarheid expliciet worden getoetst.",
        "growth": "Maak zichtbaar waar perspectief, loopbaangesprek of ontwikkelruimte als eerste moet worden hersteld.",
        "compensation": "Toets of vooral de hoogte, fairness of uitlegbaarheid van voorwaarden corrigeerbaar aandacht vraagt.",
        "workload": "Breng in kaart waar structurele druk of onvoldoende herstelruimte als eerste moet worden verlicht.",
        "role_clarity": "Maak voor de betrokken teams rolgrenzen, prioriteiten en verwachtingen binnen 30 dagen expliciet.",
    }

    for factor, risk_value in top_risks[:3]:
        label = FACTOR_LABELS_NL.get(factor, factor)
        score = factor_avgs.get(factor, 5.5)
        management_label = management_band_label(score=risk_value)
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
                f"{label} wordt nu ervaren als {score:.1f}/10 en vraagt daarmee {management_label.lower()}. "
                + (support_text if support_text else "Dit signaal verdient vooral verificatie in gesprek voordat er actie wordt bepaald.")
            ).strip(),
            "question": (
                f"Toets in gesprek of {label.lower()} structureel meespeelt, bij welke groepen dit vooral speelt, "
                "en welke concrete situaties medewerkers hierbij bedoelen."
            ),
            "owner": owner_by_factor.get(factor, "HR business partner"),
            "action": action_by_factor.get(
                factor,
                f"Vertaal {label.lower()} binnen 30 dagen naar één concrete managementactie met duidelijke eigenaar.",
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
    rows_by_type: dict[str, list[dict[str, Any]]] = {
        "department": [],
        "role_level": [],
        "tenure": [],
    }
    low_n_blocked = False
    if org_avg_risk is None:
        return {
            "coverage": coverage,
            "rows": rows,
            "rows_by_type": rows_by_type,
            "appendix_eligible": False,
            "blocked_by_low_n": False,
        }

    for segment_type, groups in group_store.items():
        for raw_label, items in groups.items():
            if len(items) < MIN_SEGMENT_N:
                low_n_blocked = True
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
            row = {
                "segment_type": segment_type,
                "segment_label": _segment_group_label(segment_type, raw_label),
                "n": len(items),
                "avg_risk": avg_risk,
                "delta_vs_org": round(avg_risk - org_avg_risk, 2),
                "top_factor_labels": top_factor_labels,
            }
            rows.append(row)
            rows_by_type[segment_type].append(row)

    rows.sort(key=lambda item: (abs(item["delta_vs_org"]), item["avg_risk"], item["n"]), reverse=True)
    appendix_eligible = (
        not low_n_blocked
        and all(rows_by_type[key] for key in ("department", "role_level", "tenure"))
    )
    return {
        "coverage": coverage,
        "rows": rows[:6],
        "rows_by_type": rows_by_type,
        "appendix_eligible": appendix_eligible,
        "blocked_by_low_n": low_n_blocked,
    }


def _build_retention_segment_playbook_rows(
    *,
    responses: list[SurveyResponse],
    org_avg_risk: float | None,
    playbooks: dict[str, dict[str, dict[str, Any]]],
) -> list[dict[str, Any]]:
    if org_avg_risk is None:
        return []

    grouped: dict[tuple[str, str], list[SurveyResponse]] = {}
    for response in responses:
        if response.risk_score is None:
            continue

        if response.respondent.department:
            grouped.setdefault(("department", response.respondent.department), []).append(response)
        if response.respondent.role_level:
            grouped.setdefault(("role_level", response.respondent.role_level), []).append(response)

    rows: list[dict[str, Any]] = []
    for (segment_type, raw_label), items in grouped.items():
        if len(items) < MIN_SEGMENT_N:
            continue

        avg_risk = round(sum(float(item.risk_score or 0) for item in items) / len(items), 2)
        factor_signal_scores: list[tuple[str, float]] = []
        for factor in ORG_FACTOR_KEYS:
            values = [
                float(item.org_scores[factor])
                for item in items
                if item.org_scores and item.org_scores.get(factor) is not None
            ]
            if not values:
                continue
            factor_signal_scores.append((factor, round(11.0 - (sum(values) / len(values)), 2)))

        if not factor_signal_scores:
            continue

        factor, signal_value = sorted(factor_signal_scores, key=lambda item: item[1], reverse=True)[0]
        band = "HOOG" if signal_value >= 7 else "MIDDEN" if signal_value >= 4.5 else "LAAG"
        playbook = playbooks.get(factor, {}).get(band)
        if not playbook:
            continue

        delta_vs_org = round(avg_risk - org_avg_risk, 2)
        if avg_risk < 4.5 and delta_vs_org < 0.4:
            continue

        rows.append({
            "segment_type": segment_type,
            "segment_label": _segment_group_label(segment_type, raw_label),
            "n": len(items),
            "avg_risk": avg_risk,
            "delta_vs_org": delta_vs_org,
            "factor": factor,
            "factor_label": FACTOR_LABELS_NL.get(factor, factor),
            "signal_value": signal_value,
            "title": playbook["title"],
            "decision": playbook["decision"],
            "validate": playbook["validate"],
            "owner": playbook["owner"],
            "actions": playbook["actions"],
            "caution": playbook["caution"],
        })

    rows.sort(key=lambda item: (item["delta_vs_org"], item["avg_risk"], item["signal_value"]), reverse=True)
    return rows[:3]


def _append_methodology_section(
    story: list,
    *,
    scan_type: str,
    content_width: float,
    has_segment_deep_dive: bool,
) -> None:
    scan_meta = get_scan_definition(scan_type)
    product_module = get_product_module(scan_type)
    methodology_payload = product_module.get_methodology_payload()
    story.append(Paragraph("Methodiek & Verantwoording", STYLES["section_title"]))
    story.append(Paragraph(methodology_payload["intro_text"], STYLES["body"]))
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph(f"Hoe wordt het {scan_meta['signal_short_label']} berekend?", STYLES["sub_title"]))
    method_text = methodology_payload["method_text"]
    story.append(Paragraph(method_text, STYLES["body"]))
    story.append(Spacer(1, 0.2 * cm))

    weight_rows = methodology_payload["weight_rows"]
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

    story.append(Paragraph("Wat betekenen de signaalbanden?", STYLES["sub_title"]))
    band_rows = methodology_payload["band_rows"]
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

    trust_rows = methodology_payload.get("trust_rows", [])
    if trust_rows:
        story.append(Paragraph("Trust, interpretatie & claimsgrens", STYLES["sub_title"]))
        trust_table = Table(
            trust_rows,
            colWidths=[content_width * 0.24, content_width * 0.76],
        )
        trust_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#E0F2FE")),
            ("BACKGROUND", (1, 0), (1, -1), WHITE),
            ("TEXTCOLOR", (0, 0), (0, -1), BRAND_DARK),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8.5),
            ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(trust_table)
        story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("Wat betekent elke factor?", STYLES["sub_title"]))
    for fname, source, explanation in FACTOR_EXPLANATIONS:
        story.append(Paragraph(
            f"<b>{fname}</b> <font color='#6B7280' size='8'>({source})</font>",
            STYLES["body_bold"],
        ))
        story.append(Paragraph(explanation, STYLES["body"]))
        story.append(Spacer(1, 0.15 * cm))

    story.append(Spacer(1, 0.3 * cm))

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

    story.append(Paragraph("Bronnen", STYLES["sub_title"]))
    for ref in METHODOLOGY_REFERENCES:
        story.append(Paragraph(f"• {ref}", ParagraphStyle(
            "ref",
            fontName="Helvetica",
            fontSize=7.5,
            leading=11,
            textColor=MUTED,
            spaceAfter=3,
            leftIndent=8,
        )))


def _cover_pill_text(*, scan_type: str, scan_lbl: str, is_retention: bool) -> str:
    if "Live" in scan_lbl:
        if is_retention:
            return "RetentieScan Live"
        if scan_type == "exit":
            return "ExitScan Live"
        if scan_type == "team":
            return "TeamScan Lokale Read"
        return scan_lbl
    if is_retention:
        return "RetentieScan Momentopname"
    if scan_type == "exit":
        return "ExitScan Retrospectief"
    if scan_type == "team":
        return "TeamScan Formele Output"
    return scan_lbl


def _build_management_summary_cards(
    *,
    management_summary_payload: dict[str, Any],
    next_steps_payload: dict[str, Any],
    top_factor_labels: list[str],
    report_theme: dict[str, colors.Color],
) -> list[dict[str, Any]]:
    boardroom_cards = management_summary_payload.get("boardroom_cards", [])
    playing_now_card = next(
        (card for card in boardroom_cards if card.get("title") == "Wat speelt nu"),
        boardroom_cards[0] if boardroom_cards else None,
    )
    pressure_card = next(
        (card for card in boardroom_cards if "meeste druk" in card.get("title", "").lower()),
        None,
    )
    first_decision = next_steps_payload.get("first_decision") or next(
        (
            card.get("body")
            for card in boardroom_cards
            if "verificatie" in card.get("title", "").lower() or "waarom" in card.get("title", "").lower()
        ),
        "Kies eerst het bestuurlijke spoor dat nu de meeste verificatiewaarde heeft.",
    )
    playing_now_body = (playing_now_card or {}).get("body", "")
    playing_now_sentence = playing_now_body.split(". ")[0].strip()
    if playing_now_sentence and not playing_now_sentence.endswith("."):
        playing_now_sentence += "."
    sharpest_factor_body = (
        f"{' en '.join(top_factor_labels[:2]) if len(top_factor_labels[:2]) == 2 else (top_factor_labels[0] if top_factor_labels else 'Deze factor')} "
        f"{'kleuren' if len(top_factor_labels[:2]) == 2 else 'kleurt'} nu het beeld het sterkst."
    )
    first_decision_reason = (
        f"Dit is het eerste besluit omdat {top_factor_labels[0].lower() if top_factor_labels else 'dit thema'} "
        "nu bepaalt waar verificatie en eerste managementingreep het meeste opleveren."
    )

    return [
        {
            "title": "Wat speelt nu",
            "value": (playing_now_card or {}).get("value", management_summary_payload.get("executive_title", "Managementbeeld")),
            "body": playing_now_sentence or "Dit is nu de kern van het bestuurlijke beeld.",
            "background": TOKENS["surface"],
        },
        {
            "title": "Scherpste factor(en)",
            "value": " · ".join(top_factor_labels[:2]) if top_factor_labels else (pressure_card or {}).get("value", "Nog geen topfactor"),
            "body": sharpest_factor_body,
            "background": TOKENS["surface"],
        },
        {
            "title": "Eerste besluit",
            "value": "Kies route",
            "body": first_decision_reason,
            "background": TOKENS["teal_light"],
            "accent_color": report_theme["accent"],
        },
    ]


def _append_rebrand_cover(
    story: list,
    *,
    camp: Campaign,
    org: Organization,
    scan_lbl: str,
    cover_distribution_note: str,
    report_theme: dict[str, colors.Color],
    is_retention: bool,
    has_segment_appendix: bool,
) -> None:
    pill = Table(
        [[Paragraph(_cover_pill_text(scan_type=camp.scan_type, scan_lbl=scan_lbl, is_retention=is_retention), ParagraphStyle(
            "cover_pill",
            fontName=REPORT_FONTS["medium"],
            fontSize=8.5,
            leading=11,
            textColor=report_theme["accent"],
            alignment=TA_CENTER,
        ))]],
        colWidths=[64 * mm],
    )
    pill.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), report_theme["accent_light"]),
        ("BOX", (0, 0), (-1, -1), 0.4, report_theme["accent_light"]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    meta_band = Table([[
        Paragraph(
            f"<b>Rapport</b><br/>{scan_lbl}",
            ParagraphStyle(
                "cover_meta_org_band",
                fontName=REPORT_FONTS["regular"],
                fontSize=8.2,
                leading=11.4,
                textColor=TOKENS["cover_muted"],
            ),
        ),
        Paragraph(
            "<b>Door</b><br/>Verisight",
            ParagraphStyle(
                "cover_meta_by_band",
                fontName=REPORT_FONTS["regular"],
                fontSize=8.2,
                leading=11.4,
                textColor=TOKENS["cover_muted"],
            ),
        ),
        Paragraph(
            f"<b>Periode</b><br/>{camp.name}",
            ParagraphStyle(
                "cover_meta_campaign_band",
                fontName=REPORT_FONTS["regular"],
                fontSize=8.2,
                leading=11.4,
                textColor=TOKENS["cover_muted"],
            ),
        ),
        Paragraph(
            f"<b>Segment deep dive</b><br/>{'Opgenomen' if has_segment_appendix else 'Niet opgenomen'}",
            ParagraphStyle(
                "cover_meta_segment_band",
                fontName=REPORT_FONTS["regular"],
                fontSize=8.2,
                leading=11.4,
                textColor=TOKENS["cover_muted"],
            ),
        ),
    ]], colWidths=[CONTENT_WIDTH * 0.22, CONTENT_WIDTH * 0.18, CONTENT_WIDTH * 0.30, CONTENT_WIDTH * 0.30])
    meta_band.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.Color(1, 1, 1, alpha=0.05)),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.Color(1, 1, 1, alpha=0.16)),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.Color(1, 1, 1, alpha=0.08)),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(Spacer(1, 2.2 * cm))
    story.append(pill)
    story.append(Spacer(1, 0.35 * cm))
    story.append(Paragraph(org.name, STYLES["cover_title"]))
    story.append(Spacer(1, 0.15 * cm))
    story.append(Paragraph(scan_lbl, STYLES["cover_sub"]))
    story.append(Spacer(1, 0.18 * cm))
    story.append(Paragraph(
        "Door Verisight",
        ParagraphStyle(
            "cover_byline",
            fontName=REPORT_FONTS["medium"],
            fontSize=10.2,
            leading=13,
            textColor=TOKENS["cover_muted"],
        ),
    ))
    story.append(Spacer(1, 0.28 * cm))
    story.append(meta_band)
    story.append(Spacer(1, 0.14 * cm))
    story.append(Paragraph(
        _truncate_copy(cover_distribution_note, limit=96),
        ParagraphStyle(
            "cover_context_note",
            fontName=REPORT_FONTS["regular"],
            fontSize=7.8,
            leading=10.4,
            textColor=TOKENS["cover_muted"],
        ),
    ))
    story.append(NextPageTemplate("body"))
    story.append(PageBreak())


def _append_rebrand_executive(
    story: list,
    *,
    management_summary_payload: dict[str, Any],
    next_steps_payload: dict[str, Any],
    cover_metric_cards: list[dict[str, str]],
    has_pattern: bool,
    content_width: float,
    report_theme: dict[str, colors.Color],
) -> None:
    _append_section_heading(
        story,
        eyebrow="Bestuurlijke handoff",
        title=management_summary_payload.get("boardroom_title", "Bestuurlijke handoff"),
        intro=management_summary_payload.get("boardroom_intro"),
        content_width=content_width,
    )
    boardroom_cards = management_summary_payload.get("boardroom_cards", [])
    exposure_card = next((card for card in boardroom_cards if "exposure" in card.get("title", "").lower()), None)

    response_cards = [
        {
            **card,
            "body": _truncate_copy(card.get("body"), limit=58),
            "background": TOKENS["surface"],
        }
        for card in cover_metric_cards[:3]
    ]
    _append_metric_band(
        story,
        response_cards,
        content_width=content_width,
        theme=report_theme,
        columns=3,
    )
    invited = 0
    completed = 0
    for card in cover_metric_cards:
        if card.get("title") == "Uitgenodigd":
            try:
                invited = int(str(card.get("value", "0")).replace(".", "").replace(",", ""))
            except ValueError:
                invited = 0
        elif card.get("title") == "Ingevuld":
            try:
                completed = int(str(card.get("value", "0")).replace(".", "").replace(",", ""))
            except ValueError:
                completed = 0

    response_frame = _build_chart_frame_flowable(
        label="Responsbeeld",
        image=_response_donut_image(invited=invited, completed=completed, width_cm=5.4),
        content_width=content_width,
        theme=report_theme,
        caption="Laat zien welk deel van de uitgenodigde groep in dit rapport meetelt.",
    )
    if response_frame:
        story.append(Spacer(1, 0.08 * cm))
        story.append(response_frame)
    story.append(Spacer(1, 0.08 * cm))
    _append_emphasis_note(
        story,
        title="Respons in context",
        body=(
            "De respons laat zien welk deel van de uitgenodigde groep in dit rapport meetelt. "
            "Hogere respons geeft meestal een steviger groepsbeeld; lagere respons kan wijzen op timing, bereik of terughoudendheid "
            "en vraagt daarom een voorzichtiger managementlezing."
        ),
        content_width=content_width,
        theme=report_theme,
    )
    if exposure_card and has_pattern:
        story.append(Spacer(1, 0.10 * cm))
        _append_emphasis_note(
            story,
            title="Optionele context: indicatieve exposure",
            body=f"<b>{exposure_card['value']}</b> · {_truncate_copy(exposure_card['body'], limit=135)}",
            content_width=content_width,
            theme=report_theme,
        )
    story.append(PageBreak())


def _append_rebrand_factor_analysis(
    story: list,
    *,
    factor_avgs: dict[str, float],
    factor_items: list[tuple[str, float]],
    management_summary_payload: dict[str, Any],
    next_steps_payload: dict[str, Any],
    top_factor_labels: list[str],
    content_width: float,
    report_theme: dict[str, colors.Color],
) -> None:
    _append_section_heading(
        story,
        eyebrow="Drivers",
        title="Drivers & prioriteitenbeeld",
        intro="Deze pagina laat zien welke factoren relatief lager worden ervaren en bestuurlijk het meeste vervolg vragen.",
        content_width=content_width,
    )
    _append_metric_band(
        story,
        _build_management_summary_cards(
            management_summary_payload=management_summary_payload,
            next_steps_payload=next_steps_payload,
            top_factor_labels=top_factor_labels,
            report_theme=report_theme,
        ),
        content_width=content_width,
        theme=report_theme,
        columns=3,
    )
    _append_micro_structure(
        story,
        how_to_read="Belevingsscore en signaal lezen dezelfde factor vanuit twee managementperspectieven: ervaren kwaliteit en bestuurlijke aandacht.",
        why_it_matters="Zo zie je sneller welke thema's relatief laag worden ervaren en tegelijk het meeste vervolg vragen.",
        content_width=content_width,
        theme=report_theme,
    )
    if not factor_avgs:
        _append_emphasis_note(
            story,
            title="Onvoldoende patroondata",
            body="De factoranalyse wordt pas zichtbaar zodra voldoende responses beschikbaar zijn voor patroonherkenning.",
            content_width=content_width,
            theme=report_theme,
        )
        story.append(PageBreak())
        return

    matrix_frame = _build_chart_frame_flowable(
        label="Prioriteitenbeeld",
        image=_priority_matrix_image(factor_avgs, width_cm=12.4),
        content_width=content_width,
        theme=report_theme,
        caption="Indicatief prioriteitenbeeld: lager op de x-as betekent lagere beleving; hoger op de y-as betekent meer bestuurlijke aandacht.",
    )
    if matrix_frame:
        story.append(matrix_frame)
        story.append(Spacer(1, 0.14 * cm))
    table_rows = [["Factor", "Score", "Signaal", "Band"]]
    signal_colors: list[colors.Color] = []
    factor_explanations = _factor_explanation_lookup()
    for factor, signal_value in factor_items:
        score = factor_avgs.get(factor, 5.5)
        presentation = build_factor_presentation(score=score, signal_score=signal_value, show_signal=True)
        badge = _risk_badge(label=presentation["management_label"])
        signal_colors.append(badge["fg"] if badge else TEXT)
        table_rows.append([
            FACTOR_LABELS_NL.get(factor, factor),
            presentation["score_display"],
            presentation["signal_display"],
            presentation["management_label"],
        ])
    score_table = _build_data_table_flowable(
        rows=table_rows,
        col_widths=[content_width * 0.42, content_width * 0.16, content_width * 0.16, content_width * 0.26],
        theme=report_theme,
        highlight_columns={3: signal_colors, 2: [TEXT for _ in signal_colors]},
        align_columns=[1, 2, 3],
        bold_columns=[1, 2, 3],
    )
    story.append(score_table)
    story.append(PageBreak())


def _append_rebrand_focus_questions(
    story: list,
    *,
    top_risks: list[tuple[str, float]],
    factor_avgs: dict[str, float],
    hypotheses: list[dict[str, str]],
    retention_trend_rows: list[dict[str, Any]],
    retention_themes: list[dict[str, Any]],
    is_retention: bool,
    content_width: float,
    report_theme: dict[str, colors.Color],
) -> None:
    _append_section_heading(
        story,
        eyebrow="Prioriteiten",
        title="Wat eerst begrijpen en toetsen",
        intro="Gebruik deze pagina om eerst scherp te krijgen wat dit beeld waarschijnlijk verklaart. Nog geen actieplan: alleen de vragen en observaties die eerst bevestigd moeten worden.",
        content_width=content_width,
    )
    factor_explanations = _factor_explanation_lookup()
    if not top_risks:
        _append_emphasis_note(
            story,
            title="Nog geen focusvragen zichtbaar",
            body="Zodra de patroonanalyse voldoende data heeft, verschijnen hier de factoren en hun gesprekshaken in dezelfde managementvolgorde.",
            content_width=content_width,
            theme=report_theme,
        )
    if top_risks:
        priority_cards: list[dict[str, Any]] = []
        for index, (factor, signal_value) in enumerate(top_risks[:2]):
            label = FACTOR_LABELS_NL.get(factor, factor)
            explanation = factor_explanations.get(label.lower())
            matching_hypothesis = next(
                (
                    item for item in hypotheses
                    if _factor_label_to_key(label) in item["title"].lower() or label.lower() in item["title"].lower()
                ),
                None,
            )
            verification_question = matching_hypothesis.get("question") if matching_hypothesis else _factor_decision_text(factor, is_retention=is_retention)
            observation = explanation or (matching_hypothesis.get("body") if matching_hypothesis else None)
            role_label = management_band_label(score=signal_value) if index == 0 else management_band_label(band="MIDDEN")
            score = factor_avgs.get(factor, 5.5)
            presentation = build_factor_presentation(
                score=score,
                signal_score=signal_value,
                management_label=role_label,
            )
            priority_cards.append({
                "title": label,
                "badge": _risk_badge(label=presentation["management_label"]),
                "value": presentation["score_display"],
                "body": (
                    f"<b>Te toetsen vraag:</b> {verification_question}<br/>"
                    f"<b>Wat we eerst moeten begrijpen:</b> {observation or 'Nog geen aanvullende observatie beschikbaar.'}"
                ),
                "background": TOKENS["cream"] if index == 0 else TOKENS["surface"],
            })
        _append_highlight_cards(
            story,
            priority_cards,
            content_width=content_width,
            theme=report_theme,
            columns=min(2, len(priority_cards)),
        )
        story.append(Spacer(1, 0.12 * cm))
    if is_retention and retention_trend_rows:
        story.append(Paragraph("Ontwikkeling aanvullende signalen", STYLES["sub_title"]))
        story.append(_build_data_table_flowable(
            rows=[["Signaal", "Nu", "Delta", "Duiding"]] + [
                [
                    row["label"],
                    f"{row['current']:.1f}/10",
                    f"{'+' if row['delta'] > 0 else ''}{row['delta']:.1f}",
                    row["explanation"],
                ]
                for row in retention_trend_rows[:3]
            ],
            col_widths=[content_width * 0.20, content_width * 0.12, content_width * 0.12, content_width * 0.56],
            theme=report_theme,
            align_columns=[1, 2],
            bold_columns=[1, 2],
        ))
        story.append(Spacer(1, 0.12 * cm))
    if is_retention:
        decision_themes = _select_retention_decision_themes(retention_themes, top_risks)
    else:
        decision_themes = []
    if is_retention and decision_themes:
        story.append(Paragraph("Open verbetersignalen met besliswaarde", STYLES["sub_title"]))
        story.append(_build_data_table_flowable(
            rows=[["Thema", "n", "Implicatie"]] + [
                [theme_item["title"], str(theme_item["count"]), theme_item["implication"]]
                for theme_item in decision_themes
            ],
            col_widths=[content_width * 0.24, content_width * 0.08, content_width * 0.68],
            theme=report_theme,
            align_columns=[1],
            bold_columns=[1],
        ))
    story.append(PageBreak())


def _build_prior_signal_panel(
    *,
    prior_signal_rows: list[dict[str, Any]],
    signal_visibility_average: float | None,
    width: float,
    theme: dict[str, colors.Color],
) -> Table | None:
    if not prior_signal_rows and signal_visibility_average is None:
        return None

    panel_items: list[Any] = [Paragraph("Eerdere signalering", STYLES["sub_title"])]
    if signal_visibility_average is not None:
        if signal_visibility_average >= 4.0:
            signal_visibility_text = "Twijfel of vertrek was vaak al zichtbaar of bespreekbaar."
        elif signal_visibility_average >= 3.0:
            signal_visibility_text = "Twijfel was deels zichtbaar, maar nog niet scherp opgepakt."
        else:
            signal_visibility_text = "Twijfel bleef vaak laat zichtbaar of lastig bespreekbaar."
        panel_items.append(_build_card_flowable(
            {
                "title": "Zichtbaarheid vooraf",
                "value": f"{signal_visibility_average:.1f}/5",
                "body": signal_visibility_text,
                "background": TOKENS["cream"],
                "accent_color": theme["accent"],
            },
            width=width,
            theme=theme,
        ))
    if prior_signal_rows:
        panel_items.append(_build_data_table_flowable(
            rows=[["Periode", "Topfactor", "Score"]] + [
                [row["period"], row["top_factor"], f"{row['score']:.1f}/10"]
                for row in prior_signal_rows[:3]
            ],
            col_widths=[width * 0.30, width * 0.48, width * 0.22],
            theme=theme,
            align_columns=[2],
            bold_columns=[2],
        ))

    panel = Table([[ _build_stack_table(panel_items, width - 16) ]], colWidths=[width])
    panel.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), theme["surface"]),
        ("BOX", (0, 0), (-1, -1), 0.7, theme["border"]),
        ("LINEABOVE", (0, 0), (-1, 0), 2, theme["accent"]),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return panel


def _append_rebrand_risk_and_prevention(
    story: list,
    *,
    avg_risk: float | None,
    signal_label: str,
    signal_label_lower: str,
    band_counts: dict[str, int],
    pattern: dict[str, Any],
    signal_page_payload: dict[str, Any],
    signal_page_cards: list[dict[str, str]],
    prior_signal_rows: list[dict[str, Any]],
    retention_turnover_groups: list[dict[str, Any]],
    retention_engagement_dist: dict[str, int],
    retention_trend_rows: list[dict[str, Any]],
    top_reasons: list[dict[str, Any]],
    top_contributing_reasons: list[dict[str, Any]],
    strong_work_signal_pct: float | None,
    any_work_signal_pct: float | None,
    signal_visibility_average: float | None,
    avg_engagement: float | None,
    avg_turnover_intention: float | None,
    avg_stay_intent: float | None,
    retention_themes: list[dict[str, Any]],
    quotes: list[str],
    is_retention: bool,
    content_width: float,
    report_theme: dict[str, colors.Color],
) -> None:
    has_prior_signaling = bool(prior_signal_rows or signal_visibility_average is not None)
    if is_retention:
        intro_text = (
            "Deze pagina verbindt retentiesignaal, aanvullende signalen en werkfactoren tot één managementlezing."
            if not has_prior_signaling
            else "Deze pagina verbindt retentiesignaal, aanvullende signalen, werkfactoren en eerdere signalering tot één managementlezing."
        )
        how_to_read = "Lees eerst het hoofdpatroon bovenaan, daarna de signaalverdeling en pas daarna de aanvullende context."
        why_it_matters = "Zo blijft zichtbaar waar behoud bestuurlijk onder druk staat zonder dat één datapunt de hoofdlijn overneemt."
    else:
        intro_text = (
            "Deze pagina verbindt hoofdredenen, meespelende factoren en frictiesignaal tot één managementlezing."
            if not has_prior_signaling
            else "Deze pagina verbindt hoofdredenen, meespelende factoren, frictiesignaal en eerdere signalering tot één managementlezing."
        )
        how_to_read = "Lees eerst de hoofdredenen en meespelende factoren, daarna het frictiesignaal en pas daarna de extra context."
        why_it_matters = "Zo zie je sneller wat nu het vertrekbeeld draagt en welke context dat patroon sterker of zwakker maakt."
    _append_section_heading(
        story,
        eyebrow="Verdieping",
        title="Kernsignalen in samenhang",
        intro=intro_text,
        content_width=content_width,
    )
    _append_micro_structure(
        story,
        how_to_read=how_to_read,
        why_it_matters=why_it_matters,
        content_width=content_width,
        theme=report_theme,
    )
    top_width = (content_width - (8 * mm)) / 2
    lower_signal_width = content_width * 0.62
    lower_quotes_width = content_width - lower_signal_width - (8 * mm)

    if not is_retention and top_reasons:
        primary_reason_frame = _build_chart_frame_flowable(
            label="Hoofdredenen van vertrek",
            image=_ranked_bar_image(top_reasons[:5], width_cm=7.0, color=MPL_BRAND),
            content_width=top_width,
            theme=report_theme,
            caption="Hoofdredenen geven het eerste vertrekhaakje.",
        )
        contributing_frame = (
            _build_chart_frame_flowable(
                label="Meespelende factoren",
                image=_ranked_bar_image(top_contributing_reasons[:5], width_cm=7.0, color=MPL_MED),
                content_width=top_width,
                theme=report_theme,
                caption="Meespelende factoren helpen het vervolggesprek richten.",
            )
            if top_contributing_reasons
            else None
        )
        if contributing_frame:
            story.append(_build_columns_flowable(
                column_items=[[primary_reason_frame], [contributing_frame]],
                col_widths=[top_width, top_width],
            ))
        else:
            story.append(primary_reason_frame)
        story.append(Spacer(1, 0.10 * cm))
    elif is_retention:
        turnover_frame = (
            _build_chart_frame_flowable(
                label="Vertrekintentie-groepen",
                image=_ranked_bar_image(retention_turnover_groups[:5], width_cm=7.0, color=MPL_BRAND),
                content_width=top_width,
                theme=report_theme,
                caption="Indicatieve verdeling van expliciet vertrekdenken op groepsniveau.",
            )
            if retention_turnover_groups
            else None
        )
        engagement_frame = _build_stacked_distribution_flowable(
            title="Bevlogenheidsverhouding",
            counts={
                "HOOG": retention_engagement_dist.get("hoog", 0),
                "MIDDEN": retention_engagement_dist.get("midden", 0),
                "LAAG": retention_engagement_dist.get("laag", 0),
            },
            width=top_width,
            theme=report_theme,
            caption="Aanvullende energieverhouding; lees dit samen met het retentiesignaal.",
        )
        story.append(_build_columns_flowable(
            column_items=[[item for item in [turnover_frame] if item], [engagement_frame]],
            col_widths=[top_width, top_width],
        ))
        story.append(Spacer(1, 0.10 * cm))

    if avg_risk is not None:
        band_label = "HOOG" if avg_risk >= 7 else "MIDDEN" if avg_risk >= 4.5 else "LAAG"
        signal_zone = _build_stack_table(
            [
                item for item in [
                    _build_chart_frame_flowable(
                        label=f"Gemiddeld {signal_label_lower}",
                        image=_risk_gauge_image(avg_risk, band_label),
                        content_width=lower_signal_width,
                        theme=report_theme,
                        caption=f"{signal_label} {avg_risk:.1f}/10",
                    ),
                    _build_stacked_distribution_flowable(
                        title=f"Verdeling {signal_label_lower}",
                        counts=band_counts,
                        width=lower_signal_width,
                        theme=report_theme,
                        caption="Snelle verdelingslezing op groepsniveau.",
                    ),
                ] if item
            ],
            lower_signal_width,
        )
        if len(quotes) >= 2:
            quote_cards = [
                {
                    "title": "Surveyquote",
                    "body": _truncate_copy(quote, limit=110),
                    "background": TOKENS["cream"] if index % 2 == 0 else TOKENS["surface"],
                }
                for index, quote in enumerate(quotes[:2])
            ]
            quotes_zone = _build_stack_table(
                [
                    Paragraph("Compacte surveystemmen", STYLES["sub_title"]),
                    _build_card_flowable(quote_cards[0], width=lower_quotes_width, theme=report_theme),
                    _build_card_flowable(quote_cards[1], width=lower_quotes_width, theme=report_theme),
                ],
                lower_quotes_width,
            )
            story.append(_build_columns_flowable(
                column_items=[[signal_zone], [quotes_zone]],
                col_widths=[lower_signal_width, lower_quotes_width],
            ))
        else:
            story.append(signal_zone)
        story.append(Spacer(1, 0.10 * cm))

    prior_signal_panel = _build_prior_signal_panel(
        prior_signal_rows=prior_signal_rows,
        signal_visibility_average=signal_visibility_average,
        width=content_width,
        theme=report_theme,
    )
    if prior_signal_panel is not None:
        story.append(prior_signal_panel)
    story.append(PageBreak())


def _append_rebrand_actions(
    story: list,
    *,
    hypotheses_payload: dict[str, str],
    hypotheses: list[dict[str, str]],
    next_steps_payload: dict[str, Any],
    scan_meta: dict[str, Any],
    signal_label_lower: str,
    avg_risk: float | None,
    segment_deep_dive: dict[str, Any],
    retention_playbooks: list[dict[str, Any]],
    retention_playbook_calibration_note: str | None,
    retention_segment_playbooks: list[dict[str, Any]],
    is_retention: bool,
    content_width: float,
    report_theme: dict[str, colors.Color],
    title: str = "Eerste route & managementactie",
    intro: str | None = None,
) -> None:
    _append_section_heading(
        story,
        eyebrow="Route",
        title=title,
        intro=intro or "Hier komen verificatie, eigenaar, eerste stap en review samen. In v3 staat dit nog maar op één plek: de eerste route, de eerste eigenaar en de eerste 30–90-dagenactie.",
        content_width=content_width,
    )
    left_width = (content_width - (8 * mm)) / 2
    right_width = left_width
    story.append(_build_columns_flowable(
        column_items=[
            [
                _build_editorial_group(
                    title="Eerste route",
                    value="Nu kiezen",
                    body=_truncate_copy(
                        next_steps_payload.get("first_decision", "Kies het eerste managementspoor op basis van de topfactoren."),
                        limit=120,
                    ),
                    width=left_width,
                    value_color=report_theme["accent_dark"],
                ),
                _build_divider_flowable(width=left_width, color=report_theme["border"]),
                _build_editorial_group(
                    title="Route-eigenaar",
                    value=next_steps_payload.get("first_owner", "Nog te bepalen"),
                    body="Beleg verificatie, opvolging en terugkoppeling expliciet bij één eigenaar.",
                    width=left_width,
                ),
            ],
            [
                _build_editorial_group(
                    title="Eerste stap",
                    value="Binnen 30 dagen",
                    body=_truncate_copy(
                        next_steps_payload.get("first_action", "Maak de eerste stap expliciet binnen 30 dagen."),
                        limit=120,
                    ),
                    width=right_width,
                    value_color=report_theme["accent_dark"],
                ),
                _build_divider_flowable(width=right_width, color=report_theme["border"]),
                _build_editorial_group(
                    title="Review",
                    value=next_steps_payload.get("review_moment", "45–90 dagen" if is_retention else "60–90 dagen"),
                    body="Leg nu vast wanneer je route, uitvoering en bewijs opnieuw weegt.",
                    width=right_width,
                ),
            ],
        ],
        col_widths=[left_width, right_width],
    ))
    story.append(Spacer(1, 0.12 * cm))
    if hypotheses and not next_steps_payload.get("insight_to_action"):
        story.append(Paragraph("Actiekaarten", STYLES["sub_title"]))
        action_cards = []
        for item in hypotheses[:2]:
            action_cards.append({
                "title": item.get("title") or item.get("question") or "Actiekaart",
                "value": "Nu toetsen",
                "body": (
                    f"<b>Vraag:</b> {_truncate_copy(item.get('question') or item['title'], limit=105)}<br/><br/>"
                    f"<b>Waarom nu:</b> {_truncate_copy(item['body'], limit=110)}<br/><br/>"
                    f"<b>Eerste actie:</b> {_truncate_copy(item.get('action', next_steps_payload.get('first_action', 'Maak de eerste stap expliciet binnen 30 dagen.')), limit=105)}"
                ),
                "background": TOKENS["cream"] if len(action_cards) % 2 == 0 else TOKENS["surface"],
            })
        _append_highlight_cards(
            story,
            action_cards,
            content_width=content_width,
            theme=report_theme,
            columns=min(2, len(action_cards)),
        )
        story.append(Spacer(1, 0.10 * cm))
    if next_steps_payload.get("insight_to_action"):
        _append_insight_to_action_block(
            story,
            insight_to_action=next_steps_payload["insight_to_action"],
            content_width=content_width,
            theme=report_theme,
        )
        roadmap_steps = [
            {
                "title": f"{item['window']} - {item['title']}",
                "body": item["body"],
            }
            for item in next_steps_payload["insight_to_action"].get("follow_up_30_60_90", [])
        ]
    else:
        roadmap_steps = list(next_steps_payload["steps"]) + [{
            "number": "5",
            "title": scan_meta["report_repeat_title"],
            "body": scan_meta["report_repeat_body"],
        }]
    story.append(_build_data_table_flowable(
        rows=[["Stap", "Duiding"]] + [
            [f"{index}. {step['title']}", step["body"]]
            for index, step in enumerate(roadmap_steps, start=1)
        ],
        col_widths=[content_width * 0.30, content_width * 0.70],
        theme=report_theme,
        bold_columns=[0],
    ))
    story.append(PageBreak())


def _append_rebrand_retention_playbooks(
    story: list,
    *,
    retention_playbooks: list[dict[str, Any]],
    retention_playbook_calibration_note: str | None,
    retention_segment_playbooks: list[dict[str, Any]],
    content_width: float,
    report_theme: dict[str, colors.Color],
) -> None:
    if not retention_playbooks and not retention_segment_playbooks:
        return

    intro = retention_playbook_calibration_note or (
        "Gebruik deze behoudsplaybooks als gecontroleerde vervolglaag na de hoofdprioriteiten uit de actiepagina."
    )
    _append_section_heading(
        story,
        eyebrow="Wat nu",
        title="Behoudsplaybooks",
        intro=intro,
        content_width=content_width,
    )
    if retention_playbooks:
        playbook_cards = []
        for playbook in retention_playbooks[:2]:
            actions_text = " ".join([f"• {action}" for action in playbook["actions"][:2]])
            playbook_cards.append({
                "title": playbook["label"],
                "badge": _risk_badge(playbook["signal_value"]),
                "value": f"{playbook['signal_value']:.1f}/10",
                "body": (
                    f"<b>{playbook['title']}</b><br/>"
                    f"<b>Eerste besluit:</b> {playbook['decision']}<br/>"
                    f"<b>Eerste eigenaar:</b> {playbook['owner']}<br/>"
                    f"{actions_text}"
                ),
                "background": TOKENS["cream"],
            })
        _append_highlight_cards(
            story,
            playbook_cards,
            content_width=content_width,
            theme=report_theme,
            columns=min(2, len(playbook_cards)),
        )
    if retention_segment_playbooks:
        _append_emphasis_note(
            story,
            title="Segment deep dive",
            body=(
                f"Voor deze campagne waren {len(retention_segment_playbooks)} segment-specifieke behoudssporen beschikbaar. "
                "Gebruik die alleen als verdiepingslaag nadat het organisatieniveau is gewogen."
            ),
            content_width=content_width,
            theme=report_theme,
        )
    story.append(PageBreak())


def _append_rebrand_methodology(
    story: list,
    *,
    scan_type: str,
    has_segment_deep_dive: bool,
    content_width: float,
    report_theme: dict[str, colors.Color],
) -> None:
    scan_meta = get_scan_definition(scan_type)
    product_module = get_product_module(scan_type)
    methodology_payload = product_module.get_methodology_payload()
    _append_section_heading(
        story,
        eyebrow="Methodiek",
        title="Compacte methodiek / leeswijzer",
        intro="Compacte leeswijzer voor score, privacy en interpretatie. Alle technische diepte staat in de appendix en niet meer in het hoofdrapport.",
        content_width=content_width,
    )
    _append_micro_structure(
        story,
        how_to_read="Lees de score nooit los, maar altijd samen met factoren, banding en de context van deze campagne.",
        why_it_matters="Drempels begrenzen schijnprecisie en herleidbaarheid; dit rapport is bedoeld voor prioritering en managementgesprek, niet als definitief bewijs.",
        content_width=content_width,
        theme=report_theme,
    )
    trust_rows = methodology_payload.get("trust_rows", [])
    product_is = next((row[1] for row in trust_rows if "wel is" in row[0].lower()), methodology_payload["intro_text"])
    product_not_for = next((row[1] for row in trust_rows if "niet voor" in row[0].lower()), methodology_payload["intro_text"])
    privacy_boundary = next((row[1] for row in trust_rows if "privacy" in row[0].lower()), f"Segmentvergelijkingen tonen we vanaf minimaal {MIN_SEGMENT_N} per groep.")
    score_card = _build_card_flowable(
        {
            "title": f"Hoe lees je het {scan_meta['signal_short_label']}?",
            "body": _truncate_copy(methodology_payload["method_text"], limit=250),
            "background": TOKENS["surface"],
            "accent_color": report_theme["accent"],
        },
        width=content_width * 0.48,
        theme=report_theme,
    )
    boundaries_card = _build_card_flowable(
        {
            "title": "Rapportagegrenzen",
            "body": _truncate_copy(f"Wat dit product wel is: {product_is} Wat het niet is: {product_not_for}", limit=250),
            "background": TOKENS["cream"],
            "accent_color": report_theme["border"],
        },
        width=content_width * 0.48,
        theme=report_theme,
    )
    story.append(_build_columns_flowable(
        column_items=[[score_card], [boundaries_card]],
        col_widths=[content_width * 0.48, content_width * 0.48],
    ))
    story.append(Spacer(1, 0.12 * cm))
    story.append(_build_data_table_flowable(
        rows=[
            ["Leeswijzer", "Duiding"],
            ["Wat dit product wel is", product_is],
            ["Wat het niet is", product_not_for],
            ["Privacy & rapportagegrenzen", privacy_boundary],
            ["Contact", "hallo@verisight.nl"],
        ],
        col_widths=[content_width * 0.30, content_width * 0.70],
        theme=report_theme,
        bold_columns=[0],
    ))
    contact_table = Table([[
        Paragraph(
            "<b>Vragen over dit rapport?</b><br/>"
            f"Neem contact op via <font color='{_color_to_hex(report_theme['accent'])}'>hallo@verisight.nl</font>. "
            "We lopen de bevindingen graag door en helpen bij de vertaling naar een eerstvolgende stap.",
                ParagraphStyle(
                    "contact_note_rebrand",
                    fontName=REPORT_FONTS["regular"],
                    fontSize=8.0,
                    leading=11.2,
                    textColor=TEXT,
                ),
            )
    ]], colWidths=[content_width])
    contact_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), TOKENS["cream"]),
        ("BOX", (0, 0), (-1, -1), 0.5, report_theme["border"]),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(Spacer(1, 0.12 * cm))
    story.append(contact_table)
    story.append(PageBreak())


def _append_rebrand_segment_appendix(
    story: list,
    *,
    segment_deep_dive: dict[str, Any],
    avg_risk: float | None,
    signal_label_lower: str,
    content_width: float,
    report_theme: dict[str, colors.Color],
) -> None:
    rows_by_type = (segment_deep_dive or {}).get("rows_by_type", {})
    if not (segment_deep_dive or {}).get("appendix_eligible") or avg_risk is None:
        return

    _append_section_heading(
        story,
        eyebrow="Appendix A",
        title="Segmentanalyse",
        intro="Deze appendix verschijnt alleen als alle segmentgroepen de n-drempel halen. Gebruik de segmentlezing als verdiepingslaag, niet als nieuwe hoofdlijn.",
        content_width=content_width,
    )
    ordered_rows = []
    for key in ("department", "tenure", "role_level"):
        ordered_rows.extend(rows_by_type.get(key, [])[:3])
    _append_segment_small_multiples(
        story,
        segment_rows=ordered_rows,
        org_avg_risk=avg_risk,
        content_width=content_width,
        theme=report_theme,
        signal_label_lower=signal_label_lower,
    )
    segment_table_rows = [["Segment", "n", "Score", "Delta vs org", "Topfactoren"]]
    for key in ("department", "tenure", "role_level"):
        for row in rows_by_type.get(key, [])[:3]:
            segment_table_rows.append([
                row["segment_label"],
                str(row["n"]),
                f"{row['avg_risk']:.1f}/10",
                f"{row['delta_vs_org']:+.1f}",
                " / ".join(row["top_factor_labels"][:2]),
            ])
    story.append(_build_data_table_flowable(
        rows=segment_table_rows,
        col_widths=[content_width * 0.24, content_width * 0.08, content_width * 0.14, content_width * 0.14, content_width * 0.40],
        theme=report_theme,
        align_columns=[1, 2, 3],
        bold_columns=[1, 2, 3],
    ))
    story.append(PageBreak())


def _append_rebrand_technical_appendix(
    story: list,
    *,
    scan_type: str,
    has_segment_appendix: bool,
    content_width: float,
    report_theme: dict[str, colors.Color],
    show_segment_note: bool = True,
) -> None:
    product_module = get_product_module(scan_type)
    methodology_payload = product_module.get_methodology_payload()
    signal_metric_label = "frictiescore" if scan_type == "exit" else "retentiesignaal"
    sdt_body = (
        "Autonomie, competentie en verbondenheid blijven de onderliggende psychologische laag in deze rapportage. "
        "Die SDT-laag helpt verklaren waarom werkfactoren zwaarder of lichter doorwerken in het groepsbeeld; "
        "ze staat dus niet los van de managementlezing, maar onder de samengestelde score."
    )
    item_factor_body = (
        "De vraagblokken in Verisight zijn verkort en pragmatisch aangepast voor compacte managementrapportage. "
        "Ze leunen inhoudelijk onder meer op LMX, psychologische veiligheid, JD-R en tevredenheidsliteratuur, "
        "zonder te claimen dat hier volledige of onverkorte schalen worden gereproduceerd."
    )
    signal_logic_body = (
        f"Het vroegere signaal van beïnvloedbare werkfactoren staat niet meer als los hoofdblok in het rapport. "
        f"In v3 is die logica opgenomen in de {signal_metric_label}, de banding en de managementduiding: "
        "werkfactoren kleuren dus direct hoe prioriteit, synthese en routekeuze worden gelezen."
    )
    _append_section_heading(
        story,
        eyebrow="Appendix B",
        title="Technische verantwoording",
        intro="Technische verdieping op factorgewichten, de onderliggende SDT-laag en de banddefinities. Deze verantwoording staat bewust buiten het hoofdrapport.",
        content_width=content_width,
    )
    story.append(Paragraph("Onderliggende psychologische laag (SDT)", STYLES["sub_title"]))
    _append_micro_structure(
        story,
        how_to_read="Lees SDT als onderliggende psychologische laag onder de zichtbare werkfactoren, niet als los concurrerend scorespoor.",
        why_it_matters=_truncate_copy(sdt_body, limit=155),
        content_width=content_width,
        theme=report_theme,
        why_label="Uitleg",
    )
    story.append(_build_card_flowable(
        {
            "title": "SDT-laag",
            "body": "Autonomie, competentie en verbondenheid blijven de verklarende basis onder de bredere managementlezing.",
            "background": TOKENS["surface"],
            "accent_color": report_theme["accent"],
        },
        width=content_width,
        theme=report_theme,
    ))
    story.append(Spacer(1, 0.08 * cm))
    story.append(Paragraph("Item- en factorbasis", STYLES["sub_title"]))
    _append_micro_structure(
        story,
        how_to_read="Lees de factoren als compacte, aangepaste vraagblokken voor managementrapportage en niet als volledige academische schalen.",
        why_it_matters=_truncate_copy(item_factor_body, limit=165),
        content_width=content_width,
        theme=report_theme,
        why_label="Uitleg",
    )
    story.append(_build_data_table_flowable(
        rows=methodology_payload["weight_rows"],
        col_widths=[content_width * 0.22, content_width * 0.10, content_width * 0.68],
        theme=report_theme,
        align_columns=[1],
        bold_columns=[1],
    ))
    story.append(Spacer(1, 0.08 * cm))
    story.append(Paragraph("Samengestelde werkfactorsignaal-logica", STYLES["sub_title"]))
    _append_micro_structure(
        story,
        how_to_read=f"Lees banding en managementduiding als compacte vertaling van hoe werkfactoren samenkomen in de {signal_metric_label}.",
        why_it_matters=_truncate_copy(signal_logic_body, limit=170),
        content_width=content_width,
        theme=report_theme,
        why_label="Uitleg",
    )
    story.append(_build_data_table_flowable(
        rows=methodology_payload["band_rows"],
        col_widths=[content_width * 0.24, content_width * 0.14, content_width * 0.62],
        theme=report_theme,
        align_columns=[1],
        bold_columns=[0, 1],
    ))
    if show_segment_note and not has_segment_appendix:
        story.append(Spacer(1, 0.10 * cm))
        _append_emphasis_note(
            story,
            title="Segmentanalyse niet beschikbaar",
            body=f"Segmentanalyse vereist minimaal n={MIN_SEGMENT_N} per groep. Niet beschikbaar in dit rapport.",
            content_width=content_width,
            theme=report_theme,
        )


def _append_exit_response_page(
    story: list,
    *,
    cover_metric_cards: list[dict[str, str]],
    completion: float,
    content_width: float,
    report_theme: dict[str, colors.Color],
    exposure_card: dict[str, Any] | None,
) -> None:
    _append_section_heading(
        story,
        eyebrow="Respons",
        title="Respons",
        intro="Deze pagina laat eerst zien hoe stevig de responsebasis is. Lees de rest van het rapport altijd met deze responskwaliteit in het achterhoofd.",
        content_width=content_width,
    )
    response_cards = [
        {
            **card,
            "body": _truncate_copy(card.get("body"), limit=58),
            "background": TOKENS["surface"],
        }
        for card in cover_metric_cards[:3]
    ]
    _append_metric_band(
        story,
        response_cards,
        content_width=content_width,
        theme=report_theme,
        columns=3,
    )

    invited = 0
    completed = 0
    for card in cover_metric_cards:
        if card.get("title") == "Uitgenodigd":
            try:
                invited = int(str(card.get("value", "0")).replace(".", "").replace(",", ""))
            except ValueError:
                invited = 0
        elif card.get("title") == "Ingevuld":
            try:
                completed = int(str(card.get("value", "0")).replace(".", "").replace(",", ""))
            except ValueError:
                completed = 0

    response_frame = _build_chart_frame_flowable(
        label="Responsverhouding",
        image=_response_donut_image(invited=invited, completed=completed, width_cm=5.2),
        content_width=(content_width * 0.34),
        theme=report_theme,
        caption="De cirkel is ondersteunend: de interpretatie ernaast blijft leidend.",
    )
    explanation_cards = [
        _build_editorial_group(
            title="Wat respons zegt",
            body=(
                "Respons laat zien hoeveel van de uitgenodigde groep in dit managementbeeld meetelt. "
                "Hoe hoger de respons, hoe steviger het groepsbeeld doorgaans gelezen kan worden."
            ),
            width=(content_width * 0.64),
        ),
        _build_divider_flowable(width=(content_width * 0.64), color=report_theme["border"]),
        _build_editorial_group(
            title="Wat lage respons kan betekenen",
            body=(
                "Lagere respons kan wijzen op timing, bereik, surveyvermoeidheid of terughoudendheid. "
                "Lees patronen dan voorzichtiger en voorkom te stellige managementconclusies."
            ),
            width=(content_width * 0.64),
        ),
        _build_divider_flowable(width=(content_width * 0.64), color=report_theme["border"]),
        _build_editorial_group(
            title="Wat hoge respons kan betekenen",
            body=(
                "Hogere respons maakt het groepsbeeld meestal robuuster. "
                "Ook dan blijft dit rapport een managementlezing en geen bewijs van oorzaak of effect."
            ),
            width=(content_width * 0.64),
        ),
    ]
    story.append(_build_columns_flowable(
        column_items=[[item for item in [response_frame] if item], explanation_cards],
        col_widths=[content_width * 0.34, content_width * 0.64],
    ))
    story.append(Spacer(1, 0.08 * cm))
    _append_emphasis_note(
        story,
        title="Respons in context",
        body=(
            f"De respons in deze batch is {completion:.1f}%. Gebruik dit om de leesdiscipline van de rest van het rapport te bepalen: "
            "een compacter patroon kan nog steeds bestuurlijk relevant zijn, maar vraagt dan meer voorzichtigheid in duiding."
        ),
        content_width=content_width,
        theme=report_theme,
    )
    if exposure_card:
        _append_emphasis_note(
            story,
            title="Optionele context",
            body=f"<b>{exposure_card['value']}</b> · {_truncate_copy(exposure_card['body'], limit=120)}",
            content_width=content_width,
            theme=report_theme,
        )
    story.append(PageBreak())


def _append_exit_handoff_page(
    story: list,
    *,
    management_summary_payload: dict[str, Any],
    next_steps_payload: dict[str, Any],
    top_factor_labels: list[str],
    top_exit_reason_label: str | None,
    top_contributing_reason_label: str | None,
    content_width: float,
    report_theme: dict[str, colors.Color],
) -> None:
    boardroom_intro = management_summary_payload.get("boardroom_intro") or management_summary_payload.get("executive_intro") or ""
    strongest_signal = top_exit_reason_label or (top_factor_labels[0] if top_factor_labels else management_summary_payload.get("executive_title", "Managementbeeld"))
    strongest_signal_body = boardroom_intro.split(". ")[0].strip() or "Dit is nu de scherpste managementlezing van het vertrekbeeld."
    if strongest_signal_body and not strongest_signal_body.endswith("."):
        strongest_signal_body += "."
    why_it_counts = (
        f"Dit telt omdat {top_factor_labels[0].lower() if top_factor_labels else 'dit patroon'} nu het meeste vervolg vraagt in gesprek, verificatie en eerste managementweging."
    )
    first_do_body = _truncate_copy(
        next_steps_payload.get("first_action", "Maak de eerste stap expliciet en koppel daar direct een eigenaar en reviewmoment aan."),
        limit=125,
    )
    why_first_counts = _truncate_copy(
        next_steps_payload.get("first_decision")
        or f"Begin hier omdat {top_contributing_reason_label.lower() if top_contributing_reason_label else 'dit spoor'} nu het meeste bestuurlijke verschil maakt.",
        limit=125,
    )
    conclusion = (
        f"Concludeer niet dat vertrek één oorzaak heeft. Concludeer wel dat {strongest_signal.lower()} "
        "nu de beste eerste managementingang biedt voor verificatie en vervolgsturing."
    )
    _append_section_heading(
        story,
        eyebrow="Bestuurlijke handoff",
        title=management_summary_payload.get("boardroom_title", "Bestuurlijke handoff"),
        intro="Lees deze pagina als de bestuurlijke vertaling van het rapport: wat springt eruit, waarom telt het nu en welk eerste besluit verdient prioriteit.",
        content_width=content_width,
    )
    left_width = (content_width - (8 * mm)) / 2
    right_width = left_width
    story.append(_build_columns_flowable(
        column_items=[
            [
                _build_editorial_group(
                    title="Sterkste signaal",
                    value=strongest_signal,
                    body=strongest_signal_body,
                    width=left_width,
                    value_color=report_theme["accent_dark"],
                ),
                _build_divider_flowable(width=left_width, color=report_theme["border"]),
                _build_editorial_group(
                    title="Waarom telt dit",
                    value="Nu wegen",
                    body=why_it_counts,
                    width=left_width,
                ),
            ],
            [
                _build_editorial_group(
                    title="Wat eerst doen",
                    value="Eerste route",
                    body=first_do_body,
                    width=right_width,
                    value_color=report_theme["accent_dark"],
                ),
                _build_divider_flowable(width=right_width, color=report_theme["border"]),
                _build_editorial_group(
                    title="Waarom dat eerst telt",
                    value="Bestuurlijke prioriteit",
                    body=why_first_counts,
                    width=right_width,
                ),
            ],
        ],
        col_widths=[left_width, right_width],
    ))
    story.append(Spacer(1, 0.10 * cm))
    _append_emphasis_note(
        story,
        title="Wat je hieruit moet concluderen",
        body=conclusion,
        content_width=content_width,
        theme=report_theme,
    )
    story.append(PageBreak())


def _build_exit_picture_rows(pattern: dict[str, Any], n_completed: int) -> list[list[str]]:
    exit_reason_counts = pattern.get("exit_reason_counts", {}) or {}
    push_n = sum(v for k, v in exit_reason_counts.items() if k.startswith("P") and not k.startswith("PL"))
    pull_n = sum(v for k, v in exit_reason_counts.items() if k.startswith("PL"))
    situ_n = sum(v for k, v in exit_reason_counts.items() if k.startswith("S"))
    total_n = max(push_n + pull_n + situ_n, 0)
    denominator = total_n or max(n_completed, 1)

    def _pct(value: int) -> str:
        return f"{round((value / max(denominator, 1)) * 100):.0f}%"

    return [
        ["Lijn", "n", "Aandeel", "Leesrichting"],
        ["Werkfrictie zichtbaar", str(push_n), _pct(push_n), "Vertrekredenen die vooral aan het werk of de werkomgeving raken."],
        ["Andere trekfactoren zichtbaar", str(pull_n), _pct(pull_n), "Trek van buitenaf of alternatieven die aan het vertrekverhaal meespelen."],
        ["Situationele context zichtbaar", str(situ_n), _pct(situ_n), "Persoonlijke of situationele context die niet als werkfrictie moet worden gelezen."],
    ]


def _append_exit_friction_page(
    story: list,
    *,
    avg_risk: float | None,
    band_counts: dict[str, int],
    pattern: dict[str, Any],
    n_completed: int,
    content_width: float,
    report_theme: dict[str, colors.Color],
) -> None:
    _append_section_heading(
        story,
        eyebrow="Scoreduiding",
        title="Frictiescore & verdeling van het vertrekbeeld",
        intro="Deze pagina legt eerst uit hoe je de frictiescore moet lezen en zet die daarna naast de verdeling van het vertrekbeeld.",
        content_width=content_width,
    )
    _append_micro_structure(
        story,
        how_to_read="Frictiescore is een interne managementsamenvatting van ervaren werkfrictie rondom vertrek.",
        why_it_matters="Gebruik deze score altijd samen met vertrekredenen, topfactoren en werksignalen, niet als causaliteitsclaim, externe benchmark of voorspelling.",
        content_width=content_width,
        theme=report_theme,
    )
    if avg_risk is None:
        _append_emphasis_note(
            story,
            title="Nog geen frictiescore zichtbaar",
            body="De frictiescore verschijnt zodra voldoende responses beschikbaar zijn voor een verantwoord groepsbeeld.",
            content_width=content_width,
            theme=report_theme,
        )
        story.append(PageBreak())
        return

    band_label = "HOOG" if avg_risk >= 7 else "MIDDEN" if avg_risk >= 4.5 else "LAAG"
    score_frame = _build_chart_frame_flowable(
        label="Frictiescore",
        image=_risk_gauge_image(avg_risk, band_label),
        content_width=(content_width * 0.48),
        theme=report_theme,
        caption="Kleurbanden helpen alleen bij managementlezing; de score is geen zelfstandig bewijs.",
    )
    banding_frame = _build_stacked_distribution_flowable(
        title="Band n / %",
        counts=band_counts,
        width=(content_width * 0.48),
        theme=report_theme,
        caption="De banding laat zien hoe de exitbatch zich over het groepsbeeld verdeelt.",
    )
    story.append(_build_columns_flowable(
        column_items=[[score_frame], [banding_frame]],
        col_widths=[content_width * 0.48, content_width * 0.48],
    ))
    story.append(Spacer(1, 0.10 * cm))
    story.append(_build_data_table_flowable(
        rows=_build_exit_picture_rows(pattern, n_completed),
        col_widths=[content_width * 0.28, content_width * 0.10, content_width * 0.12, content_width * 0.50],
        theme=report_theme,
        align_columns=[1, 2],
        bold_columns=[1, 2],
    ))
    story.append(Spacer(1, 0.06 * cm))
    story.append(Paragraph("Verdeling van het vertrekbeeld", STYLES["sub_title"]))
    story.append(PageBreak())


def _append_exit_signal_synthesis_page(
    story: list,
    *,
    top_reasons: list[dict[str, Any]],
    top_contributing_reasons: list[dict[str, Any]],
    quotes: list[str],
    prior_signal_rows: list[dict[str, Any]],
    signal_visibility_average: float | None,
    content_width: float,
    report_theme: dict[str, colors.Color],
) -> None:
    has_prior_signaling = bool(prior_signal_rows or signal_visibility_average is not None)
    intro = (
        "Deze pagina leest hoofdredenen, meespelende factoren en surveystemmen als één managementverhaal."
        if not has_prior_signaling
        else "Deze pagina leest hoofdredenen, meespelende factoren, surveystemmen en eerdere signalering als één managementverhaal."
    )
    _append_section_heading(
        story,
        eyebrow="Synthese",
        title="Signalen in samenhang",
        intro=intro,
        content_width=content_width,
    )
    _append_micro_structure(
        story,
        how_to_read="Lees eerst de analytische blokken bovenaan en gebruik quotes of eerdere signalering alleen als context eronder.",
        why_it_matters="Zo blijft zichtbaar wat nu het vertrekbeeld draagt, zonder dat losse surveycitaten of één contextblok de hoofdlijn overnemen.",
        content_width=content_width,
        theme=report_theme,
    )
    top_width = (content_width - (8 * mm)) / 2
    primary_reason_frame = _build_chart_frame_flowable(
        label="Hoofdredenen",
        image=_ranked_bar_image(top_reasons[:5], width_cm=7.0, color=MPL_BRAND),
        content_width=top_width,
        theme=report_theme,
        caption="Hoofdredenen geven de eerste managementingang van het vertrekbeeld.",
    )
    contributing_frame = _build_chart_frame_flowable(
        label="Meespelende factoren",
        image=_ranked_bar_image(top_contributing_reasons[:5], width_cm=7.0, color=MPL_MED),
        content_width=top_width,
        theme=report_theme,
        caption="Meespelende factoren helpen bepalen welk gesprek of welke route eerst telt.",
    ) if top_contributing_reasons else None
    story.append(_build_columns_flowable(
        column_items=[
            [item for item in [primary_reason_frame] if item],
            [item for item in [contributing_frame] if item],
        ],
        col_widths=[top_width, top_width],
    ))
    story.append(Spacer(1, 0.10 * cm))

    lower_left: list[Any] = []
    if len(quotes) >= 2:
        lower_left.append(Paragraph("Compacte surveystemmen", STYLES["sub_title"]))
        for index, quote in enumerate(quotes[:2]):
            lower_left.append(Paragraph(
                f'"{_truncate_copy(quote, limit=105)}"',
                ParagraphStyle(
                    f"exit_quote_{index}",
                    fontName=REPORT_FONTS["regular"],
                    fontSize=8.2,
                    leading=11.0,
                    textColor=TEXT,
                    leftIndent=5,
                ),
            ))
            if index == 0:
                lower_left.append(_build_divider_flowable(width=top_width, color=report_theme["border"]))
    else:
        lower_left.append(_build_editorial_group(
            title="Surveycontext",
            body="Open antwoorden worden hier alleen getoond als ze de analytische hoofdlijn versterken.",
            width=top_width,
        ))

    prior_panel = _build_prior_signal_panel(
        prior_signal_rows=prior_signal_rows,
        signal_visibility_average=signal_visibility_average,
        width=top_width,
        theme=report_theme,
    )
    lower_right: list[Any] = [prior_panel] if prior_panel is not None else [
        _build_card_flowable(
            {
                "title": "Context",
                "body": "Eerdere signalering wordt alleen getoond als die data echt beschikbaar is.",
                "background": TOKENS["surface"],
            },
            width=top_width,
            theme=report_theme,
        )
    ]
    story.append(_build_columns_flowable(
        column_items=[lower_left, lower_right],
        col_widths=[top_width, top_width],
    ))
    story.append(PageBreak())


def _append_exit_drivers_page(
    story: list,
    *,
    factor_avgs: dict[str, float],
    factor_items: list[tuple[str, float]],
    top_risks: list[tuple[str, float]],
    content_width: float,
    report_theme: dict[str, colors.Color],
) -> None:
    _append_section_heading(
        story,
        eyebrow="Drivers",
        title="Drivers & prioriteitenbeeld",
        intro="Deze pagina bundelt SDT-gebaseerde en organisatorische factoren in één prioriteitenbeeld.",
        content_width=content_width,
    )
    _append_micro_structure(
        story,
        how_to_read="Deze factorpagina combineert SDT en organisatiefactoren tot één managementlezing van beleving en prioriteit.",
        why_it_matters="Zo zie je welke thema's relatief lager worden ervaren en tegelijk bestuurlijk het meeste vervolg vragen.",
        content_width=content_width,
        theme=report_theme,
    )
    if not factor_avgs:
        _append_emphasis_note(
            story,
            title="Onvoldoende patroondata",
            body="Het prioriteitenbeeld verschijnt zodra voldoende responses beschikbaar zijn voor verantwoord factorlezen.",
            content_width=content_width,
            theme=report_theme,
        )
        story.append(PageBreak())
        return

    matrix_frame = _build_chart_frame_flowable(
        label="Prioriteitenbeeld",
        image=_priority_matrix_image(factor_avgs, width_cm=12.4),
        content_width=content_width,
        theme=report_theme,
        caption="Lager op de x-as betekent lagere beleving; hoger op de y-as betekent meer bestuurlijke aandacht.",
    )
    if matrix_frame:
        story.append(matrix_frame)
        story.append(Spacer(1, 0.12 * cm))
    table_rows = [["Factor", "Belevingsscore", "Signaal", "Managementlezing"]]
    signal_colors: list[colors.Color] = []
    for factor, signal_value in factor_items:
        score = factor_avgs.get(factor, 5.5)
        presentation = build_factor_presentation(score=score, signal_score=signal_value, show_signal=True)
        badge = _risk_badge(label=presentation["management_label"])
        signal_colors.append(badge["fg"] if badge else TEXT)
        table_rows.append([
            FACTOR_LABELS_NL.get(factor, factor),
            presentation["score_display"],
            presentation["signal_display"],
            presentation["management_label"],
        ])
    story.append(_build_data_table_flowable(
        rows=table_rows,
        col_widths=[content_width * 0.38, content_width * 0.18, content_width * 0.16, content_width * 0.28],
        theme=report_theme,
        highlight_columns={3: signal_colors},
        align_columns=[1, 2, 3],
        bold_columns=[1, 2, 3],
    ))
    story.append(Spacer(1, 0.10 * cm))
    factor_cards = []
    for factor, signal_value in top_risks[:2]:
        score = factor_avgs.get(factor, 5.5)
        presentation = build_factor_presentation(score=score, signal_score=signal_value)
        factor_cards.append({
            "title": FACTOR_LABELS_NL.get(factor, factor),
            "badge": _risk_badge(label=presentation["management_label"]),
            "value": presentation["score_display"],
            "body": _factor_current_state_text(factor, is_retention=False),
            "background": TOKENS["cream"] if len(factor_cards) == 0 else TOKENS["surface"],
        })
    if factor_cards:
        _append_highlight_cards(
            story,
            factor_cards,
            content_width=content_width,
            theme=report_theme,
            columns=min(2, len(factor_cards)),
        )
    story.append(PageBreak())


def _append_exit_sdt_page(
    story: list,
    *,
    sdt_avgs: dict[str, float],
    content_width: float,
    report_theme: dict[str, colors.Color],
) -> None:
    _append_section_heading(
        story,
        eyebrow="Onderliggende laag",
        title="SDT Basisbehoeften",
        intro="Deze laag maakt de onderliggende psychologische basis zichtbaar onder het bredere vertrekbeeld.",
        content_width=content_width,
    )
    _append_micro_structure(
        story,
        how_to_read="Lees autonomie, competentie en verbondenheid als onderliggende basisbehoeften die meespelen onder de zichtbare werkfactoren.",
        why_it_matters="Zo blijft duidelijk welke psychologische laag mogelijk meespeelt zonder dat deze pagina de hoofdlezing van het rapport overneemt.",
        content_width=content_width,
        theme=report_theme,
    )
    if not sdt_avgs:
        _append_emphasis_note(
            story,
            title="SDT-laag nog niet zichtbaar",
            body="Zodra voldoende factorinformatie beschikbaar is, verschijnt hier de onderliggende basisbehoeftenlaag.",
            content_width=content_width,
            theme=report_theme,
        )
        story.append(PageBreak())
        return
    chart = _build_chart_frame_flowable(
        label="SDT-basisbehoeften",
        image=_sdt_bar_image(sdt_avgs, width_cm=10.8),
        content_width=content_width,
        theme=report_theme,
        caption="Lagere scores vragen eerder bestuurlijke aandacht; hogere scores duiden op een relatief sterkere basis.",
    )
    if chart:
        story.append(chart)
        story.append(Spacer(1, 0.10 * cm))
    sdt_rows = [["Dimensie", "Score", "Leesrichting"]]
    mapping = {
        "autonomy": ("Autonomie", "Mate van ervaren ruimte, invloed en eigenaarschap."),
        "competence": ("Competentie", "Mate waarin mensen grip, effectiviteit en ontwikkeling ervaren."),
        "relatedness": ("Verbondenheid", "Mate van aansluiting, steun en sociale bedding in het werk."),
    }
    for key in ("autonomy", "competence", "relatedness"):
        sdt_rows.append([mapping[key][0], f"{sdt_avgs.get(key, 5.5):.1f}/10", mapping[key][1]])
    story.append(_build_data_table_flowable(
        rows=sdt_rows,
        col_widths=[content_width * 0.24, content_width * 0.16, content_width * 0.60],
        theme=report_theme,
        align_columns=[1],
        bold_columns=[1],
    ))
    lowest_dim = min(((dim, value) for dim, value in sdt_avgs.items() if dim in mapping), key=lambda item: item[1], default=None)
    if lowest_dim:
        _append_emphasis_note(
            story,
            title="Wat nu opvalt",
            body=f"{mapping[lowest_dim[0]][0]} ligt nu het laagst in de SDT-laag. Gebruik dit als verklarende achtergrondlaag, niet als los interventieprogramma.",
            content_width=content_width,
            theme=report_theme,
        )
    story.append(PageBreak())


def _append_exit_org_factors_page(
    story: list,
    *,
    factor_avgs: dict[str, float],
    factor_items: list[tuple[str, float]],
    content_width: float,
    report_theme: dict[str, colors.Color],
) -> None:
    _append_section_heading(
        story,
        eyebrow="Factorlaag",
        title="Organisatiefactoren",
        intro="Deze pagina laat de organisatorische factorlaag apart zien, los van SDT en los van de bredere synthese.",
        content_width=content_width,
    )
    _append_micro_structure(
        story,
        how_to_read="Belevingsscore laat zien hoe vertrekkers een thema gemiddeld ervoeren; signaal laat zien hoeveel bestuurlijke aandacht datzelfde thema vraagt.",
        why_it_matters="Zo blijft zichtbaar dat score en signaal dezelfde factor vanuit twee managementperspectieven lezen, zonder twee concurrerende hoofdcijfers te maken.",
        content_width=content_width,
        theme=report_theme,
    )
    if not factor_avgs:
        _append_emphasis_note(
            story,
            title="Nog geen organisatiefactoren zichtbaar",
            body="Deze laag verschijnt zodra voldoende factorinformatie beschikbaar is.",
            content_width=content_width,
            theme=report_theme,
        )
        story.append(PageBreak())
        return
    chart = _build_chart_frame_flowable(
        label="Organisatiefactoren",
        image=_factor_bar_image(factor_avgs, width_cm=13.0),
        content_width=content_width,
        theme=report_theme,
        caption="De balken tonen de ervaren score; de kleur helpt de managementlezing van aandacht.",
    )
    if chart:
        story.append(chart)
        story.append(Spacer(1, 0.10 * cm))
    table_rows = [["Factor", "Belevingsscore", "Signaalwaarde", "Managementlezing"]]
    for factor, signal_value in factor_items:
        score = factor_avgs.get(factor, 5.5)
        table_rows.append([
            FACTOR_LABELS_NL.get(factor, factor),
            f"{score:.1f}/10",
            f"{signal_value:.1f}/10",
            management_band_label(score=signal_value),
        ])
    story.append(_build_data_table_flowable(
        rows=table_rows,
        col_widths=[content_width * 0.36, content_width * 0.18, content_width * 0.18, content_width * 0.28],
        theme=report_theme,
        align_columns=[1, 2, 3],
        bold_columns=[1, 2, 3],
    ))
    story.append(PageBreak())


def _append_exit_methodology_page(
    story: list,
    *,
    scan_type: str,
    has_segment_deep_dive: bool,
    content_width: float,
    report_theme: dict[str, colors.Color],
) -> None:
    scan_meta = get_scan_definition(scan_type)
    product_module = get_product_module(scan_type)
    methodology_payload = product_module.get_methodology_payload()
    trust_rows = methodology_payload.get("trust_rows", [])
    product_is = next((row[1] for row in trust_rows if "wel is" in row[0].lower()), methodology_payload["intro_text"])
    product_not_for = next((row[1] for row in trust_rows if "niet voor" in row[0].lower()), methodology_payload["intro_text"])
    privacy_boundary = next((row[1] for row in trust_rows if "privacy" in row[0].lower()), f"Segmentvergelijkingen tonen we vanaf minimaal {MIN_SEGMENT_N} per groep.")
    _append_section_heading(
        story,
        eyebrow="Leeswijzer",
        title="Methodiek / leeswijzer",
        intro="Compacte interpretatiehulp voor product, grenzen en leesdiscipline. De technische diepte blijft in de appendix.",
        content_width=content_width,
    )
    _append_micro_structure(
        story,
        how_to_read="Lees score, factoren en vertrekbeeld altijd samen; geen enkel blok hoort los als zelfstandig oordeel te worden gebruikt.",
        why_it_matters="Drempels begrenzen schijnprecisie en herleidbaarheid, en helpen dit rapport te gebruiken voor prioritering en managementgesprek in plaats van als definitief bewijs.",
        content_width=content_width,
        theme=report_theme,
    )
    story.append(_build_data_table_flowable(
        rows=[
            ["Leeswijzer", "Duiding"],
            ["Wat dit product is", product_is],
            ["Wat dit product niet is", product_not_for],
            ["Privacy & rapportagegrenzen", privacy_boundary],
            ["Hoe scores te gebruiken", f"Gebruik het {scan_meta['signal_short_label']} nooit los en lees het niet als externe benchmark of voorspellend model."],
        ],
        col_widths=[content_width * 0.30, content_width * 0.70],
        theme=report_theme,
        bold_columns=[0],
    ))
    if has_segment_deep_dive:
        _append_emphasis_note(
            story,
            title="Segment deep dive",
            body="De deep dive blijft een verdiepingslaag naast het hoofdrapport. Ook daar blijven vergelijkingen beschrijvend en niet-causaal.",
            content_width=content_width,
            theme=report_theme,
        )
    _append_emphasis_note(
        story,
        title="Vertrouwensregel",
        body="Dit rapport helpt prioriteren, ordenen en het managementgesprek richten. Het is geen definitief bewijsdocument, diagnose of individuele interpretatietool.",
        content_width=content_width,
        theme=report_theme,
    )
    story.append(PageBreak())


def _build_exit_embedded_story(
    *,
    camp: Campaign,
    org: Organization,
    scan_lbl: str,
    content_width: float,
    report_theme: dict[str, colors.Color],
    management_summary_payload: dict[str, Any],
    cover_metric_cards: list[dict[str, str]],
    avg_risk: float | None,
    prior_signal_rows: list[dict[str, Any]],
    factor_avgs: dict[str, float],
    top_risks: list[tuple[str, float]],
    top_factor_labels: list[str],
    band_counts: dict[str, int],
    pattern: dict[str, Any],
    responses: list[SurveyResponse],
    hypotheses_payload: dict[str, str],
    hypotheses: list[dict[str, str]],
    next_steps_payload: dict[str, Any],
    signal_visibility_average: float | None,
    top_exit_reason_label: str | None,
    top_contributing_reason_label: str | None,
    scan_meta: dict[str, Any],
    has_segment_deep_dive: bool,
    cover_distribution_note: str,
) -> list:
    story: list = []
    factor_items = [(factor, _factor_signal_score(factor, factor_avgs)) for factor in ORG_FACTOR_KEYS if factor in factor_avgs]
    factor_items.sort(key=lambda item: item[1], reverse=True)
    sdt_avgs = {d: factor_avgs.get(d, 5.5) for d in ["autonomy", "competence", "relatedness"] if d in factor_avgs}
    top_reasons = pattern.get("top_exit_reasons", [])[:5]
    top_contributing_reasons = pattern.get("top_contributing_reasons", [])[:5]
    quotes = _select_relevant_quotes(
        [response.open_text_raw for response in responses if response.open_text_raw and response.open_text_raw.strip()],
        [factor for factor, _ in top_risks[:3]],
        [item["code"] for item in top_reasons[:3]],
        max_quotes=2,
    ) if responses else []
    exposure_card = next(
        (card for card in management_summary_payload.get("boardroom_cards", []) if "exposure" in card.get("title", "").lower()),
        None,
    )
    completion = 0.0
    if len(cover_metric_cards) > 2:
        try:
            completion = float(str(cover_metric_cards[2]["value"]).replace("%", "").replace(",", "."))
        except ValueError:
            completion = 0.0

    _append_rebrand_cover(
        story,
        camp=camp,
        org=org,
        scan_lbl=scan_lbl,
        cover_distribution_note=cover_distribution_note,
        report_theme=report_theme,
        is_retention=False,
        has_segment_appendix=has_segment_deep_dive,
    )
    _append_exit_response_page(
        story,
        cover_metric_cards=cover_metric_cards,
        completion=completion,
        content_width=content_width,
        report_theme=report_theme,
        exposure_card=exposure_card,
    )
    _append_exit_handoff_page(
        story,
        management_summary_payload=management_summary_payload,
        next_steps_payload=next_steps_payload,
        top_factor_labels=top_factor_labels,
        top_exit_reason_label=top_exit_reason_label,
        top_contributing_reason_label=top_contributing_reason_label,
        content_width=content_width,
        report_theme=report_theme,
    )
    _append_exit_friction_page(
        story,
        avg_risk=avg_risk,
        band_counts=band_counts,
        pattern=pattern,
        n_completed=len(responses),
        content_width=content_width,
        report_theme=report_theme,
    )
    _append_exit_signal_synthesis_page(
        story,
        top_reasons=top_reasons,
        top_contributing_reasons=top_contributing_reasons,
        quotes=quotes,
        prior_signal_rows=prior_signal_rows,
        signal_visibility_average=signal_visibility_average,
        content_width=content_width,
        report_theme=report_theme,
    )
    _append_exit_drivers_page(
        story,
        factor_avgs=factor_avgs,
        factor_items=factor_items,
        top_risks=top_risks,
        content_width=content_width,
        report_theme=report_theme,
    )
    _append_exit_sdt_page(
        story,
        sdt_avgs=sdt_avgs,
        content_width=content_width,
        report_theme=report_theme,
    )
    _append_exit_org_factors_page(
        story,
        factor_avgs=factor_avgs,
        factor_items=factor_items,
        content_width=content_width,
        report_theme=report_theme,
    )
    _append_rebrand_actions(
        story,
        hypotheses_payload=hypotheses_payload,
        hypotheses=hypotheses,
        next_steps_payload=next_steps_payload,
        scan_meta=scan_meta,
        signal_label_lower=scan_meta["signal_short_label"],
        avg_risk=avg_risk,
        segment_deep_dive={},
        retention_playbooks=[],
        retention_playbook_calibration_note=None,
        retention_segment_playbooks=[],
        is_retention=False,
        content_width=content_width,
        report_theme=report_theme,
        title="Eerste route & actie",
        intro="Hier komt de vertaalslag van interpretatie naar managementactie samen: eerste route, eigenaar, eerste stap en reviewmoment.",
    )
    _append_exit_methodology_page(
        story,
        scan_type=camp.scan_type,
        has_segment_deep_dive=has_segment_deep_dive,
        content_width=content_width,
        report_theme=report_theme,
    )
    _append_rebrand_technical_appendix(
        story,
        scan_type=camp.scan_type,
        has_segment_appendix=False,
        content_width=content_width,
        report_theme=report_theme,
        show_segment_note=False,
    )
    return story


def _build_non_exit_runtime_story(**kwargs: Any) -> list:
    """Active runtime path for non-ExitScan reports.

    ExitScan has its own frozen embedded story builder. Retention now has an
    explicit runtime entrypoint within the shared non-exit grammar layer; other
    non-exit products still fall back to the shared runtime builder.
    """

    camp = kwargs.get("camp")
    if getattr(camp, "scan_type", None) == "retention":
        return _build_retention_runtime_story(**kwargs)
    return _build_shared_non_exit_runtime_story(**kwargs)


def _build_retention_runtime_story(**kwargs: Any) -> list:
    """Explicit RetentieScan runtime entrypoint within the shared grammar layer."""

    return _build_shared_non_exit_runtime_story(**kwargs)


# --------------------------------------------------------------------------- #
# Shared non-exit runtime builder                                             #
# --------------------------------------------------------------------------- #
# Important boundary:
# - this builder is not the source of truth for ExitScan
# - ExitScan must stay on `_build_exit_embedded_story`
# - RetentieScan enters through `_build_retention_runtime_story`
# - other non-exit routes may still use this shared grammar builder while their
#   product-specific architecture continues to harden
# --------------------------------------------------------------------------- #
def _build_shared_non_exit_runtime_story(
    *,
    camp: Campaign,
    org: Organization,
    scan_lbl: str,
    signal_label: str,
    signal_label_lower: str,
    now_str: str,
    content_width: float,
    report_theme: dict[str, colors.Color],
    management_summary_payload: dict[str, Any],
    cover_metric_cards: list[dict[str, str]],
    avg_risk: float | None,
    trend_delta: float | None,
    previous_campaign_label: str | None,
    prior_signal_rows: list[dict[str, Any]],
    has_pattern: bool,
    n_completed: int,
    band_counts: dict[str, int],
    signal_page_payload: dict[str, Any],
    signal_page_cards: list[dict[str, str]],
    factor_avgs: dict[str, float],
    top_risks: list[tuple[str, float]],
    top_factor_keys: list[str],
    top_factor_labels: list[str],
    is_retention: bool,
    avg_engagement: float | None,
    avg_turnover_intention: float | None,
    avg_stay_intent: float | None,
    retention_turnover_groups: list[dict[str, Any]],
    retention_engagement_dist: dict[str, int],
    retention_themes: list[dict[str, Any]],
    retention_trend_rows: list[dict[str, Any]],
    strong_work_signal_pct: float | None,
    any_work_signal_pct: float | None,
    top_exit_reason_label: str | None,
    top_contributing_reason_label: str | None,
    top_contributing_reasons: list[dict[str, Any]],
    signal_visibility_average: float | None,
    pattern: dict[str, Any],
    responses: list[SurveyResponse],
    hypotheses: list[dict[str, str]],
    hypotheses_payload: dict[str, str],
    next_steps_payload: dict[str, Any],
    retention_playbooks: list[dict[str, Any]],
    retention_playbook_calibration_note: str | None,
    retention_segment_playbooks: list[dict[str, Any]],
    segment_deep_dive: dict[str, Any],
    scan_meta: dict[str, Any],
    has_segment_deep_dive: bool,
    cover_distribution_note: str,
) -> list:
    story: list = []
    factor_items = [(factor, _factor_signal_score(factor, factor_avgs)) for factor in ORG_FACTOR_KEYS if factor in factor_avgs]
    factor_items.sort(key=lambda item: item[1], reverse=True)
    top_reasons = pattern.get("top_exit_reasons", [])[:4] if not is_retention else []
    quotes = _select_relevant_quotes(
        [response.open_text_raw for response in responses if response.open_text_raw and response.open_text_raw.strip()],
        [factor for factor, _ in top_risks[:3]],
        [item["code"] for item in top_reasons[:3]],
        max_quotes=2,
    ) if responses else []

    _append_rebrand_cover(
        story,
        camp=camp,
        org=org,
        scan_lbl=scan_lbl,
        cover_distribution_note=cover_distribution_note,
        report_theme=report_theme,
        is_retention=is_retention,
        has_segment_appendix=bool((segment_deep_dive or {}).get("appendix_eligible")),
    )
    _append_rebrand_executive(
        story,
        management_summary_payload=management_summary_payload,
        next_steps_payload=next_steps_payload,
        cover_metric_cards=cover_metric_cards,
        has_pattern=has_pattern,
        content_width=content_width,
        report_theme=report_theme,
    )
    _append_rebrand_factor_analysis(
        story,
        factor_avgs=factor_avgs,
        factor_items=factor_items,
        management_summary_payload=management_summary_payload,
        next_steps_payload=next_steps_payload,
        top_factor_labels=top_factor_labels,
        content_width=content_width,
        report_theme=report_theme,
    )
    _append_rebrand_risk_and_prevention(
        story,
        avg_risk=avg_risk,
        signal_label=signal_label,
        signal_label_lower=signal_label_lower,
        band_counts=band_counts,
        pattern=pattern,
        signal_page_payload=signal_page_payload,
        signal_page_cards=signal_page_cards,
        prior_signal_rows=prior_signal_rows,
        retention_turnover_groups=retention_turnover_groups,
        retention_engagement_dist=retention_engagement_dist,
        retention_trend_rows=retention_trend_rows,
        top_reasons=top_reasons,
        top_contributing_reasons=top_contributing_reasons,
        strong_work_signal_pct=strong_work_signal_pct,
        any_work_signal_pct=any_work_signal_pct,
        signal_visibility_average=signal_visibility_average,
        avg_engagement=avg_engagement,
        avg_turnover_intention=avg_turnover_intention,
        avg_stay_intent=avg_stay_intent,
        retention_themes=retention_themes,
        quotes=quotes,
        is_retention=is_retention,
        content_width=content_width,
        report_theme=report_theme,
    )
    _append_rebrand_actions(
        story,
        hypotheses_payload=hypotheses_payload,
        hypotheses=hypotheses,
        next_steps_payload=next_steps_payload,
        scan_meta=scan_meta,
        signal_label_lower=signal_label_lower,
        avg_risk=avg_risk,
        segment_deep_dive=segment_deep_dive,
        retention_playbooks=retention_playbooks,
        retention_playbook_calibration_note=retention_playbook_calibration_note,
        retention_segment_playbooks=retention_segment_playbooks,
        is_retention=is_retention,
        content_width=content_width,
        report_theme=report_theme,
    )
    _append_rebrand_methodology(
        story,
        scan_type=camp.scan_type,
        has_segment_deep_dive=has_segment_deep_dive,
        content_width=content_width,
        report_theme=report_theme,
    )
    _append_rebrand_segment_appendix(
        story,
        segment_deep_dive=segment_deep_dive,
        avg_risk=avg_risk,
        signal_label_lower=signal_label_lower,
        content_width=content_width,
        report_theme=report_theme,
    )
    _append_rebrand_technical_appendix(
        story,
        scan_type=camp.scan_type,
        has_segment_appendix=bool((segment_deep_dive or {}).get("appendix_eligible")),
        content_width=content_width,
        report_theme=report_theme,
    )
    return story


# ---------------------------------------------------------------------------
# Header/Footer callbacks
# ---------------------------------------------------------------------------


def _make_header_footer(
    org_name: str,
    camp_name: str,
    generated: str,
    product_name: str,
    scan_type: str,
    *,
    footer_label: str,
):
    """Geeft branded cover- en bodycallbacks terug voor platypus."""
    return make_page_callbacks(
        org_name=org_name,
        camp_name=camp_name,
        generated=generated,
        product_name=product_name,
        scan_type=scan_type,
        footer_label=footer_label,
    )


# ---------------------------------------------------------------------------
# Hoofd-functie
# ---------------------------------------------------------------------------


def generate_campaign_report(
    campaign_id: str,
    db: Session,
    *,
    sample_output_mode: bool = False,
) -> bytes:
    """
    Genereer een PDF-rapport voor de gegeven campaign-ID.
    Geeft ruwe bytes terug (geschikt voor HTTP-response of opslaan).
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

    org      = camp.organization
    now_str  = datetime.now(timezone.utc).strftime("%d-%m-%Y %H:%M UTC")
    cover_distribution_note = (
        "Illustratief voorbeeld — fictieve data in dezelfde managementstructuur als live output."
        if sample_output_mode
        else "Vertrouwelijk — uitsluitend bestemd voor geautoriseerde gebruikers."
    )
    _mode     = (camp.delivery_mode or "baseline").lower()
    _mode_lbl = "Live" if _mode == "live" else "Baseline"
    scan_lbl  = f"ExitScan {_mode_lbl}" if camp.scan_type == "exit" else "RetentieScan"
    scan_meta = get_scan_definition(camp.scan_type)
    product_module = get_product_module(camp.scan_type)
    signal_label = scan_meta["signal_label"]
    signal_label_lower = scan_meta["signal_short_label"]
    is_retention = camp.scan_type == "retention"
    report_theme = _report_theme(camp.scan_type)

    # ── Data verzamelen ────────────────────────────────────────────────────
    respondents = camp.respondents
    completed = [respondent for respondent in respondents if respondent.completed and respondent.response]
    responses: list[SurveyResponse] = [respondent.response for respondent in completed if respondent.response]

    n_invited   = len(respondents)
    n_completed = len(responses)
    completion  = round(n_completed / n_invited * 100, 1) if n_invited else 0.0

    risk_scores = [r.risk_score for r in responses if r.risk_score]
    avg_risk    = round(sum(risk_scores) / len(risk_scores), 2) if risk_scores else None
    engagement_scores = [r.uwes_score for r in responses if r.uwes_score is not None]
    avg_engagement = round(sum(engagement_scores) / len(engagement_scores), 2) if engagement_scores else None
    turnover_intention_scores = [
        r.turnover_intention_score for r in responses if r.turnover_intention_score is not None
    ]
    avg_turnover_intention = (
        round(sum(turnover_intention_scores) / len(turnover_intention_scores), 2)
        if turnover_intention_scores else None
    )
    stay_intent_scores = [
        round((float(r.stay_intent_score) - 1) / 4 * 9 + 1, 2)
        for r in responses
        if r.stay_intent_score is not None
    ]
    avg_stay_intent = (
        round(sum(stay_intent_scores) / len(stay_intent_scores), 2)
        if stay_intent_scores else None
    )

    band_counts = {"HOOG": 0, "MIDDEN": 0, "LAAG": 0}
    for r in responses:
        if r.risk_band in band_counts:
            band_counts[r.risk_band] += 1

    pattern_input = [
        {
            "org_scores": respondent.response.org_scores,
            "sdt_scores": respondent.response.sdt_scores,
            "risk_score": respondent.response.risk_score,
            "signal_score": respondent.response.risk_score,
            "preventability": respondent.response.preventability,
            "exit_reason_code": respondent.response.exit_reason_code,
            "stay_intent_score": respondent.response.stay_intent_score,
            "direction_signal_score": respondent.response.stay_intent_score,
            "contributing_reason_codes": list((respondent.response.pull_factors_raw or {}).keys()),
            "department": respondent.department,
            "role_level": respondent.role_level,
        }
        for respondent in completed
    ]
    pattern      = detect_patterns(pattern_input)
    has_pattern  = pattern.get("sufficient_data", False)
    factor_avgs  = pattern.get("factor_averages", {}) if has_pattern else {}
    top_risks    = pattern.get("top_risk_factors", []) if has_pattern else []
    sdt_avgs     = {d: factor_avgs.get(d, 5.5) for d in ["autonomy", "competence", "relatedness"]}
    top_cluster  = _top_factor_cluster(top_risks)
    strong_work_signal_pct = pattern.get("strong_work_signal_pct") if has_pattern else None
    any_work_signal_pct = pattern.get("any_work_signal_pct") if has_pattern else None
    retention_signal_profile = (
        compute_retention_signal_profile(
            risk_score=avg_risk or 5.5,
            engagement_score=avg_engagement,
            turnover_intention_score=avg_turnover_intention,
            stay_intent_score=avg_stay_intent,
        )
        if is_retention and avg_risk is not None else None
    )
    retention_themes = _cluster_retention_open_signals(
        [
            response.open_text_raw
            for response in responses
            if response.open_text_raw and response.open_text_raw.strip()
        ]
    ) if is_retention else []
    top_factor_keys = [factor for factor, _ in top_risks[:2]]
    top_factor_labels = [FACTOR_LABELS_NL.get(factor, factor) for factor in top_factor_keys]
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
    signal_visibility_average = None
    if not is_retention:
        signal_visibility_scores = [
            summary.get("signal_visibility_score")
            for summary in (
                ((r.full_result or {}).get("exit_context_summary") or {})
                for r in responses
            )
            if isinstance(summary.get("signal_visibility_score"), (int, float))
        ]
        if signal_visibility_scores:
            signal_visibility_average = sum(signal_visibility_scores) / len(signal_visibility_scores)
    retention_hypotheses = _build_retention_action_hypotheses(
        top_risks=top_risks,
        factor_avgs=factor_avgs,
        retention_signal_profile=retention_signal_profile,
        retention_themes=retention_themes,
        avg_engagement=avg_engagement,
        avg_turnover_intention=avg_turnover_intention,
        avg_stay_intent=avg_stay_intent,
    ) if is_retention and has_pattern else []
    retention_playbooks = _build_retention_playbook_rows(
        top_risks=top_risks,
        playbooks=product_module.get_action_playbooks_payload(),
    ) if is_retention and has_pattern and hasattr(product_module, "get_action_playbooks_payload") else []
    retention_playbook_calibration_note = (
        product_module.get_action_playbook_calibration_note()
        if is_retention and hasattr(product_module, "get_action_playbook_calibration_note")
        else None
    )
    previous_avg_risk: float | None = None
    trend_delta: float | None = None
    trend_label: str | None = None
    previous_campaign_label: str | None = None
    previous_responses: list[SurveyResponse] = []
    if avg_risk is not None:
        try:
            previous_campaign = (
                db.query(Campaign)
                .filter(
                    Campaign.organization_id == org.id,
                    Campaign.scan_type == camp.scan_type,
                    Campaign.id != camp.id,
                    Campaign.created_at < camp.created_at,
                )
                .order_by(Campaign.created_at.desc())
                .first()
            )
            if previous_campaign:
                previous_responses = [
                    respondent.response
                    for respondent in previous_campaign.respondents
                    if respondent.completed and respondent.response and respondent.response.risk_score is not None
                ]
                previous_scores = [response.risk_score for response in previous_responses if response.risk_score is not None]
                if previous_scores:
                    previous_avg_risk = round(sum(previous_scores) / len(previous_scores), 2)
                    trend_delta = round(avg_risk - previous_avg_risk, 1)
                    trend_label = "verbeterd" if trend_delta < -0.1 else "verslechterd" if trend_delta > 0.1 else "stabiel"
                    previous_campaign_label = previous_campaign.name
        except Exception:
            previous_avg_risk = None
            trend_delta = None
            trend_label = None
            previous_campaign_label = None
            previous_responses = []
    retention_trend_rows = (
        _build_retention_trend_rows(
            current=_compute_retention_signal_averages(responses),
            previous=_compute_retention_signal_averages(previous_responses),
        )
        if is_retention and previous_responses
        else []
    )
    prior_signal_rows = _build_prior_signal_rows(
        previous_campaign_label=previous_campaign_label,
        previous_avg_risk=previous_avg_risk,
        previous_responses=previous_responses,
    )
    retention_turnover_groups, retention_engagement_dist = (
        _build_retention_group_rows(responses)
        if is_retention
        else ([], {"hoog": 0, "midden": 0, "laag": 0})
    )
    has_segment_deep_dive = _campaign_has_add_on(camp, SEGMENT_DEEP_DIVE_KEY)
    segment_deep_dive = _build_segment_deep_dive_data(
        responses=responses,
        org_avg_risk=pattern.get("avg_risk_score") if has_pattern else avg_risk,
    ) if has_segment_deep_dive else {"coverage": {}, "rows": []}
    retention_segment_playbooks = (
        _build_retention_segment_playbook_rows(
            responses=responses,
            org_avg_risk=avg_risk,
            playbooks=product_module.get_action_playbooks_payload(),
        )
        if is_retention and has_segment_deep_dive and has_pattern and hasattr(product_module, "get_action_playbooks_payload")
        else []
    )
    total_cost = sum(
        r.replacement_cost_eur for r in responses if r.replacement_cost_eur
    )
    if is_retention:
        management_summary_payload = product_module.get_management_summary_payload(
            top_factor_labels=top_factor_labels,
            top_factor_keys=top_factor_keys,
            retention_signal_profile=retention_signal_profile,
            avg_engagement=avg_engagement,
            avg_turnover_intention=avg_turnover_intention,
            avg_stay_intent=avg_stay_intent,
            retention_theme_title=retention_themes[0]["title"] if retention_themes else None,
        )
    elif camp.scan_type == "team":
        management_summary_payload = product_module.get_management_summary_payload(
            top_factor_labels=top_factor_labels,
            top_factor_keys=top_factor_keys,
            avg_stay_intent=avg_stay_intent,
            responses=responses,
            top_exit_reason_label=top_exit_reason_label,
            top_contributing_reason_label=top_contributing_reason_label,
            strong_work_signal_pct=strong_work_signal_pct,
            signal_visibility_average=signal_visibility_average,
            total_replacement_cost_eur=None,
        )
    elif camp.scan_type == "onboarding":
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
    elif camp.scan_type == "leadership":
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
            total_replacement_cost_eur=total_cost,
        )
    hypotheses_payload = product_module.get_hypotheses_payload()
    next_steps_payload = product_module.get_next_steps_payload(
        top_focus_labels=top_factor_labels,
        top_focus_keys=top_factor_keys,
    )
    action_hypotheses = (
        retention_hypotheses
        if is_retention
        else _build_exit_hypotheses(
            top_risks=top_risks,
            top_exit_reasons=pattern.get("top_exit_reasons", []),
            top_contributing_reasons=pattern.get("top_contributing_reasons", []),
            factor_avgs=factor_avgs,
        )
        if camp.scan_type == "exit" and has_pattern
        else product_module.get_hypothesis_rows(
            top_risks=top_risks,
            factor_avgs=factor_avgs,
            top_factor_labels=top_factor_labels,
            top_factor_keys=top_factor_keys,
        )
        if has_pattern and hasattr(product_module, "get_hypothesis_rows")
        else []
    )
    next_steps_payload["insight_to_action"] = build_report_insight_to_action(
        scan_type=camp.scan_type,
        top_focus_labels=top_factor_labels,
        next_steps_payload=next_steps_payload,
        action_hypotheses=action_hypotheses,
        has_pattern=has_pattern,
    )

    cover_metric_cards = [
        {
            "title": "Uitgenodigd",
            "value": str(n_invited),
            "body": "Respondenten in deze meetronde.",
        },
        {
            "title": "Ingevuld",
            "value": str(n_completed),
            "body": "Responses die meetellen in het huidige managementbeeld.",
        },
        {
            "title": "Respons",
            "value": f"{completion}%",
            "body": "Hoger is beter voor een steviger bestuurlijk patroonbeeld.",
        },
        {
            "title": f"Gem. {signal_label_lower}",
            "value": f"{avg_risk:.1f}/10" if avg_risk is not None else "-",
            "body": scan_meta["dashboard_signal_help"],
        },
    ]
    signal_page_cards: list[dict[str, str]] = []
    if hasattr(product_module, "get_signal_page_cards_payload"):
        signal_page_cards = product_module.get_signal_page_cards_payload(
            responses=responses,
            avg_signal=avg_risk,
            avg_stay_intent=avg_stay_intent,
            avg_turnover_intention=avg_turnover_intention,
            top_factor_labels=top_factor_labels,
            top_factor_keys=top_factor_keys,
        )
    elif camp.scan_type == "exit":
        signal_page_cards = [
            {
                "title": "Hoofdreden",
                "value": top_exit_reason_label or "Nog geen duidelijke hoofdreden",
                "body": "Gebruik dit als eerste vertrekhaak, niet als definitieve oorzaakverklaring.",
            },
            {
                "title": "Meespelende factor",
                "value": top_contributing_reason_label or "Nog geen duidelijke meespelende factor",
                "body": "Meespelende factoren helpen bepalen waar het vertrekverhaal bestuurlijk verder moet worden getoetst.",
            },
        ]
        if signal_visibility_average is not None:
            signal_page_cards.append({
                "title": "Eerdere signalering",
                "value": f"{signal_visibility_average:.1f}/5",
                "body": "Laat zien in hoeverre twijfel of vertrek vooraf zichtbaar of bespreekbaar was.",
            })
    else:
        signal_page_cards = [
            {
                "title": signal_label,
                "value": f"{avg_risk:.1f}/10" if avg_risk is not None else "-",
                "body": "Samenvattend groepssignaal op basis van werkbeleving en beinvloedbare werkfactoren.",
            },
            {
                "title": "Stay-intent",
                "value": f"{avg_stay_intent:.1f}/10" if avg_stay_intent is not None else "-",
                "body": "Lees stay-intent altijd samen met werkfactoren, bevlogenheid en vertrekintentie.",
            },
            {
                "title": "Vertrekintentie",
                "value": f"{avg_turnover_intention:.1f}/10" if avg_turnover_intention is not None else "-",
                "body": "Expliciet vertrekdenken op groepsniveau; bedoeld voor verificatie en prioritering, niet voor individuele voorspelling.",
            },
        ]
    signal_page_payload = product_module.get_signal_page_payload(
        retention_signal_profile=retention_signal_profile,
    )

    # ── PDF opbouwen ───────────────────────────────────────────────────────
    buf = io.BytesIO()

    first_page_cb, later_pages_cb = _make_header_footer(
        org.name,
        camp.name,
        now_str,
        scan_meta["product_name"],
        camp.scan_type,
        footer_label=(
            "Illustratief voorbeeld - Verisight"
            if sample_output_mode
            else "Vertrouwelijk - Verisight"
        ),
    )

    content_x = PAGE_MARGINS["left"]
    content_y = PAGE_MARGINS["bottom"] + BODY_FRAME_GAP
    content_width = CONTENT_WIDTH
    content_height = PAGE_H - content_y - PAGE_MARGINS["top"] - HEADER_HEIGHT - BODY_FRAME_GAP

    # Frame voor voorblad (vrij, geen header/footer)
    cover_frame = Frame(
        content_x,
        PAGE_MARGINS["bottom"] + COVER_FRAME_INSET,
        content_width,
        PAGE_H - (PAGE_MARGINS["bottom"] + PAGE_MARGINS["top"] + (2 * COVER_FRAME_INSET)),
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

    if camp.scan_type == "exit":
        story = _build_exit_embedded_story(
            camp=camp,
            org=org,
            scan_lbl=scan_lbl,
            content_width=content_width,
            report_theme=report_theme,
            management_summary_payload=management_summary_payload,
            cover_metric_cards=cover_metric_cards,
            avg_risk=avg_risk,
            prior_signal_rows=prior_signal_rows,
            factor_avgs=factor_avgs,
            top_risks=top_risks,
            top_factor_labels=top_factor_labels,
            band_counts=band_counts,
            pattern=pattern,
            responses=responses,
            hypotheses_payload=hypotheses_payload,
            hypotheses=action_hypotheses,
            next_steps_payload=next_steps_payload,
            signal_visibility_average=signal_visibility_average,
            top_exit_reason_label=top_exit_reason_label,
            top_contributing_reason_label=top_contributing_reason_label,
            scan_meta=scan_meta,
            has_segment_deep_dive=has_segment_deep_dive,
            cover_distribution_note=cover_distribution_note,
        )
    else:
        story = _build_non_exit_runtime_story(
            camp=camp,
            org=org,
            scan_lbl=scan_lbl,
            signal_label=signal_label,
            signal_label_lower=signal_label_lower,
            now_str=now_str,
            content_width=content_width,
            report_theme=report_theme,
            management_summary_payload=management_summary_payload,
            cover_metric_cards=cover_metric_cards,
            avg_risk=avg_risk,
            trend_delta=trend_delta,
            previous_campaign_label=previous_campaign_label,
            prior_signal_rows=prior_signal_rows,
            has_pattern=has_pattern,
            n_completed=n_completed,
            band_counts=band_counts,
            signal_page_payload=signal_page_payload,
            signal_page_cards=signal_page_cards,
            factor_avgs=factor_avgs,
            top_risks=top_risks,
            top_factor_keys=top_factor_keys,
            top_factor_labels=top_factor_labels,
            is_retention=is_retention,
            avg_engagement=avg_engagement,
            avg_turnover_intention=avg_turnover_intention,
            avg_stay_intent=avg_stay_intent,
            retention_turnover_groups=retention_turnover_groups,
            retention_engagement_dist=retention_engagement_dist,
            retention_themes=retention_themes,
            retention_trend_rows=retention_trend_rows,
            strong_work_signal_pct=strong_work_signal_pct,
            any_work_signal_pct=any_work_signal_pct,
            top_exit_reason_label=top_exit_reason_label,
            top_contributing_reason_label=top_contributing_reason_label,
            top_contributing_reasons=pattern.get("top_contributing_reasons", []) if has_pattern else [],
            signal_visibility_average=signal_visibility_average,
            pattern=pattern,
            responses=responses,
            hypotheses=action_hypotheses,
            hypotheses_payload=hypotheses_payload,
            next_steps_payload=next_steps_payload,
            retention_playbooks=retention_playbooks,
            retention_playbook_calibration_note=retention_playbook_calibration_note,
            retention_segment_playbooks=retention_segment_playbooks,
            segment_deep_dive=segment_deep_dive,
            scan_meta=scan_meta,
            has_segment_deep_dive=has_segment_deep_dive,
            cover_distribution_note=cover_distribution_note,
        )
    doc.build(story)
    return buf.getvalue()

