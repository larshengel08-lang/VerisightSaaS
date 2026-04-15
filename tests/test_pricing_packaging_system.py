from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8").lower()


def test_active_pricing_plan_tracks_outputs_and_prompt_closure():
    active_plan = _read("docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md")

    assert "pricing_and_packaging_program_plan.md" in active_plan
    assert "frontend/components/marketing/site-content.ts" in active_plan
    assert "frontend/app/tarieven/page.tsx" in active_plan
    assert "tests/test_pricing_packaging_system.py" in active_plan
    assert "pricing_and_packaging_acceptance_checklist.md" in active_plan
    assert "prompt_checklist.xlsx" in active_plan


def test_public_pricing_copy_keeps_package_hierarchy_explicit():
    site_content = _read("frontend/components/marketing/site-content.ts")
    tarieven_page = _read("frontend/app/tarieven/page.tsx")
    aanpak_page = _read("frontend/app/aanpak/page.tsx")
    homepage = _read("frontend/app/page.tsx")

    assert "exitscan baseline" in site_content
    assert "retentiescan baseline" in site_content
    assert "pricingfollowonroutes" in site_content
    assert "quote-only vervolg na baseline" in site_content
    assert "retentiescan ritme" in site_content
    assert "compacte retentie vervolgmeting" in site_content
    assert "combinatieroute" in site_content
    assert "wat is je eerste route?" in tarieven_page
    assert "vervolgvormen" in tarieven_page
    assert "route-uitbreiding" in tarieven_page
    assert "eerste traject" in homepage
    assert "eerste traject" in aanpak_page


def test_sales_docs_keep_same_package_architecture_as_public_site():
    decision_tree = _read("docs/reference/SALES_PRODUCT_DECISION_TREE.md")
    comparison = _read("docs/reference/SALES_COMPARISON_MATRIX.md")
    proposals = _read("docs/reference/SALES_PROPOSAL_SPINES.md")
    exit_one_pager = _read("docs/reference/EXITSCAN_SALES_ONE_PAGER.md")
    retention_one_pager = _read("docs/reference/RETENTIESCAN_SALES_ONE_PAGER.md")
    objection_matrix = _read("docs/reference/SALES_OBJECTION_AND_CLAIMS_MATRIX.md")

    assert "exitscan baseline" in decision_tree
    assert "retentiescan baseline" in decision_tree
    assert "retentiescan ritme (retention loop)" in decision_tree
    assert "compacte retentie vervolgmeting" in decision_tree
    assert "quote-only vervolgroute" in comparison
    assert "geen parallel hoofdpackage" in comparison
    assert "segment deep dive" in comparison
    assert "retentiescan ritme" in proposals
    assert "vanaf eur 1.250" in proposals
    assert "signalen van werkfrictie" in exit_one_pager
    assert "retentiescan ritme vanaf eur 4.950" in retention_one_pager
    assert "wanneer wordt exitscan live logisch?" in objection_matrix
    assert "hoe verhoudt retentiescan ritme zich tot compacte vervolgmeting?" in objection_matrix


def test_pricing_claims_stay_inside_trust_and_output_boundaries():
    active_plan = _read("docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md")
    methodology = _read("docs/reference/METHODOLOGY.md")
    trust_matrix = _read("docs/reference/TRUST_AND_CLAIMS_MATRIX.md")
    preview_copy = _read("frontend/lib/report-preview-copy.ts")
    report = _read("backend/report.py")

    assert "assisted/productized" in active_plan
    assert "niet self-serve" in active_plan
    assert "claims mogen commercieel scherp zijn, maar niet onwaar" in methodology
    assert "niet toegestaan" in trust_matrix
    assert "managementsamenvatting" in preview_copy
    assert "bestuurlijke handoff" in preview_copy
    assert "delivery_mode" in report
