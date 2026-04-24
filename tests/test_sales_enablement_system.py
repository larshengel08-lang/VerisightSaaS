from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8").lower()


def test_sales_enablement_artifacts_exist_and_define_system_contract():
    playbook = _read("docs/reference/SALES_ENABLEMENT_SYSTEM_PLAYBOOK.md")
    decision_tree = _read("docs/reference/SALES_PRODUCT_DECISION_TREE.md")
    comparison = _read("docs/reference/SALES_COMPARISON_MATRIX.md")
    objections = _read("docs/reference/SALES_OBJECTION_AND_CLAIMS_MATRIX.md")
    proposals = _read("docs/reference/SALES_PROPOSAL_SPINES.md")
    checklist = _read("docs/reference/SALES_ENABLEMENT_ACCEPTANCE_CHECKLIST.md")

    assert "overdraagbare sales enablement systeemlaag" in playbook
    assert "founder-led sales playbook" in playbook
    assert "exitscan blijft de default eerste commerciele route" in playbook
    assert "retentiescan blijft een volwaardige eerste route bij expliciete actieve behoudsvraag" in playbook
    assert "route a - vertrek achteraf beter begrijpen" in decision_tree
    assert "route b - behoud eerder signaleren in actieve teams" in decision_tree
    assert "welke concrete managementbeslissing" in decision_tree
    assert "claimsgrens" in comparison
    assert "privacygrens" in comparison
    assert "claimladder" in objections
    assert "geen bewezen predictor" in objections
    assert "vaste voorstelvolgorde" in proposals
    assert "buyer asset parity" in checklist


def test_sales_routing_and_comparison_stay_aligned_with_site_and_preview_language():
    decision_tree = _read("docs/reference/SALES_PRODUCT_DECISION_TREE.md")
    comparison = _read("docs/reference/SALES_COMPARISON_MATRIX.md")
    marketing_products = _read("frontend/lib/marketing-products.ts")
    site_content = _read("frontend/components/marketing/site-content.ts")

    assert "exitscan baseline" in decision_tree
    assert "retentiescan baseline" in decision_tree
    assert "retentiescan ritmeroute" in decision_tree
    assert "combinatie" in decision_tree
    assert "exitscan is de default eerste route" in decision_tree
    assert "retentiescan is een volwaardige eerste route" in decision_tree
    assert "bestuurlijke read" in comparison
    assert "bestuurlijke handoff" in comparison
    assert "vertrekduiding" in comparison
    assert "vroegsignalering op behoud" in comparison
    assert "signalen van werkfrictie" in comparison
    assert "bestuurlijke handoff, eerste managementsessie, vertrekduiding" in marketing_products
    assert "compacte bestuurlijke read, retentiesignaal" in marketing_products
    assert "exitscan baseline" in site_content
    assert "retentiescan baseline" in site_content
    assert "compacte retentie vervolgmeting" in site_content


def test_sales_claims_and_proposal_spines_respect_current_trust_and_price_anchors():
    objections = _read("docs/reference/SALES_OBJECTION_AND_CLAIMS_MATRIX.md")
    proposals = _read("docs/reference/SALES_PROPOSAL_SPINES.md")
    playbook = _read("docs/reference/SALES_ENABLEMENT_SYSTEM_PLAYBOOK.md")
    trust_matrix = _read("docs/reference/TRUST_AND_CLAIMS_MATRIX.md")
    site_content = _read("frontend/components/marketing/site-content.ts")

    assert "geen diagnose" in objections
    assert "geen bewezen predictor" in objections
    assert "geen brede mto" in objections
    assert "geen individuele signalen" in objections
    assert "eur 2.950" in proposals
    assert "eur 3.450" in proposals
    assert "vanaf eur 4.950" in proposals
    assert "op aanvraag" in proposals
    assert "claims mogen commercieel scherp zijn, maar nooit harder dan de repo-basis draagt" in playbook
    assert "niet toegestaan" in trust_matrix
    assert "waarom starten jullie niet met een gratis pilot?" in site_content
    assert "waarom is retentiescan niet goedkoper dan exitscan?" in site_content


def test_buyer_assets_reuse_existing_output_language_without_invented_case_proof():
    exit_one_pager = _read("docs/reference/EXITSCAN_SALES_ONE_PAGER.md")
    retention_one_pager = _read("docs/reference/RETENTIESCAN_SALES_ONE_PAGER.md")
    combination_memo = _read("docs/reference/COMBINATIE_PORTFOLIO_MEMO.md")

    assert "bestuurlijke read" in exit_one_pager
    assert "bestuurlijke handoff" in exit_one_pager
    assert "geen diagnose" in exit_one_pager
    assert "eur 2.950" in exit_one_pager
    assert "retentiesignaal" in retention_one_pager
    assert "geen brede mto" in retention_one_pager
    assert "geen individuele predictor" in retention_one_pager
    assert "eur 3.450" in retention_one_pager
    assert "retentiescan ritmeroute vanaf eur 4.950" in retention_one_pager
    assert "volwaardige eerste route" in retention_one_pager
    assert "bundel" in combination_memo
    assert "op aanvraag" in combination_memo
    assert "testimonial" not in exit_one_pager
    assert "testimonial" not in retention_one_pager
    assert "klantlogo" not in combination_memo


def test_active_sales_enablement_plan_tracks_outputs_and_prompt_closure():
    active_plan = _read("docs/active/SALES_ENABLEMENT_SYSTEM_PLAN.md")

    assert "sales_enablement_system_playbook.md" in active_plan
    assert "sales_product_decision_tree.md" in active_plan
    assert "sales_comparison_matrix.md" in active_plan
    assert "sales_objection_and_claims_matrix.md" in active_plan
    assert "sales_proposal_spines.md" in active_plan
    assert "sales_enablement_acceptance_checklist.md" in active_plan
    assert "tests/test_sales_enablement_system.py" in active_plan
    assert "prompt_checklist.xlsx" in active_plan
