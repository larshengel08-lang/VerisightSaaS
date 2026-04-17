from __future__ import annotations

from typing import Literal


ManagementBand = Literal["LAAG", "MIDDEN", "HOOG"]
ManagementContext = Literal["verification", "stabilizing"]

MANAGEMENT_BAND_LABELS: dict[ManagementBand, str] = {
    "LAAG": "Voorlopig stabiel",
    "MIDDEN": "Aandacht nodig",
    "HOOG": "Direct aandachtspunt",
}

MANAGEMENT_CONTEXT_LABELS: dict[ManagementContext, str] = {
    "verification": "Meenemen in verificatie",
    "stabilizing": "Stabiliserende factor",
}

_LEGACY_BAND_ALIASES: dict[str, str] = {
    "laag": "LAAG",
    "beperkt": "LAAG",
    "stabiel": "LAAG",
    "midden": "MIDDEN",
    "gemengd": "MIDDEN",
    "verhoogd": "MIDDEN",
    "aandacht": "MIDDEN",
    "hoog": "HOOG",
    "sterk": "HOOG",
    "urgent": "HOOG",
    "direct": "HOOG",
}


def management_band_from_score(score: float) -> ManagementBand:
    if score >= 7:
        return "HOOG"
    if score >= 4.5:
        return "MIDDEN"
    return "LAAG"


def management_band_label(*, band: ManagementBand | None = None, score: float | None = None) -> str:
    resolved_band = band or (management_band_from_score(score) if score is not None else None)
    if resolved_band is None:
        raise ValueError("management_band_label vraagt om een band of score.")
    return MANAGEMENT_BAND_LABELS[resolved_band]


def management_context_label(kind: ManagementContext) -> str:
    return MANAGEMENT_CONTEXT_LABELS[kind]


def normalize_management_label(label: str | None) -> str | None:
    if not label:
        return None

    normalized = label.strip().lower()
    if "stabilis" in normalized:
        return MANAGEMENT_CONTEXT_LABELS["stabilizing"]
    if "verificatie" in normalized:
        return MANAGEMENT_CONTEXT_LABELS["verification"]

    for needle, band in _LEGACY_BAND_ALIASES.items():
        if needle in normalized:
            return MANAGEMENT_BAND_LABELS[band]  # type: ignore[index]
    return label


def management_label_kind(label: str | None) -> str | None:
    normalized = normalize_management_label(label)
    if not normalized:
        return None
    if normalized == MANAGEMENT_CONTEXT_LABELS["stabilizing"]:
        return "stabilizing"
    if normalized == MANAGEMENT_CONTEXT_LABELS["verification"]:
        return "verification"
    for band, band_label in MANAGEMENT_BAND_LABELS.items():
        if normalized == band_label:
            return band
    return None


def management_preventability_label(value: str | None) -> str | None:
    if not value:
        return None
    return {
        "STERK_WERKSIGNAAL": MANAGEMENT_BAND_LABELS["HOOG"],
        "GEMENGD_WERKSIGNAAL": MANAGEMENT_BAND_LABELS["MIDDEN"],
        "BEPERKT_WERKSIGNAAL": MANAGEMENT_BAND_LABELS["LAAG"],
    }.get(value, normalize_management_label(value))
