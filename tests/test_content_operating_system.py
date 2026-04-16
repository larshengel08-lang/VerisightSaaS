from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8").lower()


def test_content_operating_system_docs_define_canonical_layers_and_growth_gates():
    system_doc = _read("docs/reference/CONTENT_OPERATING_SYSTEM.md")
    checklist = _read("docs/reference/CONTENT_OPERATING_SYSTEM_ACCEPTANCE_CHECKLIST.md")

    assert "route content" in system_doc
    assert "proof content" in system_doc
    assert "trust content" in system_doc
    assert "conversion content" in system_doc
    assert "sales enablement content" in system_doc
    assert "reserved growth content" in system_doc
    assert "bouwt voort op portfolio-architectuur als expliciete upstream laag" in system_doc
    assert "thought leadership blijft later-fase reservecontent" in system_doc
    assert "oplossingspagina's blijven compacte productingangen" in checklist
    assert "brede blog, kennisbank en topical seo-clusters blijven bewust buiten scope" in checklist


def test_content_operating_system_docs_keep_review_chain_and_source_of_truth_explicit():
    system_doc = _read("docs/reference/CONTENT_OPERATING_SYSTEM.md")

    assert "docs/strategy/strategy.md" in system_doc
    assert "docs/reference/product_terminology_and_taxonomy.md" in system_doc
    assert "docs/reference/trust_and_claims_matrix.md" in system_doc
    assert "frontend/lib/content-operating-system.ts" in system_doc
    assert "strategy and portfolio fit" in system_doc
    assert "terminology fit" in system_doc
    assert "trust and claims fit" in system_doc
    assert "proof and evidence fit" in system_doc
    assert "surface fit" in system_doc
    assert "parity and tests" in system_doc


def test_active_content_operating_system_plan_tracks_outputs_and_prompt_closure():
    active_plan = _read("docs/active/CONTENT_OPERATING_SYSTEM_PLAN.md")

    assert "docs/reference/content_operating_system.md" in active_plan
    assert "docs/reference/content_operating_system_acceptance_checklist.md" in active_plan
    assert "frontend/lib/content-operating-system.ts" in active_plan
    assert "frontend/lib/content-operating-system.test.ts" in active_plan
    assert "tests/test_content_operating_system.py" in active_plan
    assert "prompt_checklist.xlsx" in active_plan
    assert "roadmap.md" in active_plan
