"""Afdelingssegmentatie: slugs + validatie (spec: 2026-07-11-segmentanalyse-afdelingen-design.md)."""
from backend.segments import build_segment_departments, resolve_department, has_segments


def test_build_genereert_slugs_uit_labels():
    out = build_segment_departments(["Sales", "Customer Success", "  Operations  "])
    assert out == [
        {"label": "Sales", "slug": "sales"},
        {"label": "Customer Success", "slug": "customer-success"},
        {"label": "Operations", "slug": "operations"},
    ]


def test_build_weigert_duplicaten_en_lege_labels():
    import pytest
    with pytest.raises(ValueError):
        build_segment_departments(["Sales", "sales"])  # zelfde slug
    with pytest.raises(ValueError):
        build_segment_departments(["Sales", "   "])


def test_resolve_geldige_slug_geeft_label():
    deps = build_segment_departments(["Sales", "Operations"])
    assert resolve_department(deps, "sales") == "Sales"


def test_resolve_ongeldige_of_lege_slug_geeft_none():
    deps = build_segment_departments(["Sales"])
    assert resolve_department(deps, "marketing") is None   # gemanipuleerd/onbekend
    assert resolve_department(deps, "") is None
    assert resolve_department(deps, None) is None


def test_has_segments():
    assert has_segments(None) is False
    assert has_segments([]) is False
    assert has_segments([{"label": "Sales", "slug": "sales"}]) is True
