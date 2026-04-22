from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8").lower()


FREEZE_DOC = "docs/active/SHARED_GRAMMAR_INDICATOR_EXECUTIVE_FREEZE.md"
DELTA_DOCS = {
    "exitscan": "docs/active/EXITSCAN_SHARED_GRAMMAR_FREEZE_DELTA.md",
    "retentiescan": "docs/active/RETENTIESCAN_SHARED_GRAMMAR_FREEZE_DELTA.md",
    "onboarding": "docs/active/ONBOARDING_30_60_90_SHARED_GRAMMAR_FREEZE_DELTA.md",
    "pulse": "docs/active/PULSE_SHARED_GRAMMAR_FREEZE_DELTA.md",
    "leadership": "docs/active/LEADERSHIP_SCAN_SHARED_GRAMMAR_FREEZE_DELTA.md",
}


def test_shared_grammar_freeze_doc_locks_the_four_canonical_layers():
    freeze_doc = _read(FREEZE_DOC)

    assert "portfolio-brede shared grammar" in freeze_doc
    assert "peer-product shared grammar" in freeze_doc
    assert "bounded-support shared grammar" in freeze_doc
    assert "productspecifieke indicator- en taallagen" in freeze_doc
    assert "een hoofdmetric per product" in freeze_doc
    assert "embedded truth -> shared grammar -> buyer-facing mirror -> interne working labels" in freeze_doc
    assert "managementsamenvatting" in freeze_doc
    assert "bestuurlijke handoff" in freeze_doc
    assert "eerste eigenaar" in freeze_doc
    assert "reviewmoment" in freeze_doc


def test_shared_grammar_freeze_doc_points_to_the_five_required_follow_up_deltas():
    freeze_doc = _read(FREEZE_DOC)

    assert "product_language_canon.md" in freeze_doc
    assert "metric_hierarchy_canon.md" in freeze_doc
    assert "report_structure_canon.md" in freeze_doc
    assert "commercial_architecture_canon.md" in freeze_doc
    assert "source_of_truth_charter.md" in freeze_doc

    for relative_path in DELTA_DOCS.values():
        assert relative_path.lower() in freeze_doc


def test_each_product_freeze_delta_covers_terminology_metric_and_handoff_axes():
    expected_anchors = {
        "exitscan": ("frictiescore", "vertrekduiding", "bestuurlijke handoff"),
        "retentiescan": ("retentiesignaal", "verification-first", "eerste interventie"),
        "onboarding": ("onboardingsignaal", "checkpoint", "checkpoint-handoff"),
        "pulse": ("pulsesignaal", "reviewroute", "bounded hercheck"),
        "leadership": ("leadershipsignaal", "managementcontext", "management-handoff"),
    }

    for key, relative_path in DELTA_DOCS.items():
        delta_doc = _read(relative_path)
        anchor_terms = expected_anchors[key]

        assert "terminologie freeze" in delta_doc
        assert "hoofdmetric en signaallaag freeze" in delta_doc
        assert "executive blokken en handofftaal freeze" in delta_doc
        assert "moet behouden blijven" in delta_doc
        assert "mag niet opschuiven" in delta_doc

        for anchor in anchor_terms:
            assert anchor in delta_doc


def test_source_of_truth_layers_register_the_freeze_as_upstream_for_product_threads():
    source_of_truth = _read("docs/ops/SOURCE_OF_TRUTH_CHARTER.md")
    document_index = _read("docs/DOCUMENT_INDEX.md")

    assert "shared_grammar_indicator_executive_freeze.md" in source_of_truth
    assert "vijf productdraden" in source_of_truth
    assert "freeze-delta" in source_of_truth

    assert "shared_grammar_indicator_executive_freeze.md" in document_index
    assert "exitscan_shared_grammar_freeze_delta.md" in document_index
    assert "retentiescan_shared_grammar_freeze_delta.md" in document_index
