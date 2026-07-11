"""Afdelingssegmentatie (spec: 2026-07-11-segmentanalyse-afdelingen-design.md).

Pure functies, geen DB. Campaign.segment_departments is een JSON-lijst
[{label, slug}]; NULL/leeg = campagne zonder segmenten (huidige flow).
Fail Loud: een onbekende slug wordt NOOIT als nieuw segment opgeslagen —
resolve_department geeft None en de flow toont het keuzescherm.
"""
from __future__ import annotations

import re
import unicodedata


def _slugify(label: str) -> str:
    s = unicodedata.normalize("NFKD", label).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s


def build_segment_departments(labels: list[str]) -> list[dict]:
    """Labels (HR-invoer) -> [{label, slug}]. ValueError bij lege labels of slug-botsing."""
    out: list[dict] = []
    seen: set[str] = set()
    for raw in labels:
        label = (raw or "").strip()
        if not label:
            raise ValueError("Lege afdelingsnaam is niet toegestaan.")
        slug = _slugify(label)
        if not slug:
            raise ValueError(f"Afdelingsnaam '{label}' levert geen bruikbare slug op.")
        if slug in seen:
            raise ValueError(f"Dubbele afdeling (zelfde slug): '{label}'.")
        seen.add(slug)
        out.append({"label": label, "slug": slug})
    return out


def resolve_department(segment_departments: list[dict] | None, slug: str | None) -> str | None:
    """Slug -> label, alleen als de slug exact in de campagnelijst staat. Anders None."""
    if not segment_departments or not slug:
        return None
    for item in segment_departments:
        if item.get("slug") == slug:
            return item.get("label")
    return None


def has_segments(segment_departments: list[dict] | None) -> bool:
    return bool(segment_departments)
