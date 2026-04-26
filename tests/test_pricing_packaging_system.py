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
    tarieven_content = _read("frontend/components/marketing/tarieven-content.tsx")
    aanpak_content = _read("frontend/components/marketing/aanpak-content.tsx")
    homepage_content = _read("frontend/components/marketing/home-page-content.tsx")

    assert "exitscan baseline" in site_content
    assert "retentiescan baseline" in site_content
    assert "pricingfollowonroutes" in site_content
    assert "quote-only vervolg na baseline" in site_content
    assert "retentiescan ritme" in site_content
    assert "compacte retentie vervolgmeting" in site_content
    assert "combinatieroute" in site_content
    assert "de eerste koop blijft helder." in tarieven_content
    assert "vervolg en add-ons" in tarieven_content
    assert "prijs in context" in tarieven_content
    assert "kies de route" in homepage_content
    assert "die past bij uw vraagstuk." in homepage_content
    assert "rapport, bestuurlijke handoff en eerste opvolging" in aanpak_content


def test_sales_docs_keep_same_package_architecture_as_public_site():
    decision_tree = _read("docs/reference/SALES_PRODUCT_DECISION_TREE.md")
    comparison = _read("docs/reference/SALES_COMPARISON_MATRIX.md")
    proposals = _read("docs/reference/SALES_PROPOSAL_SPINES.md")
    exit_one_pager = _read("docs/reference/EXITSCAN_SALES_ONE_PAGER.md")
    retention_one_pager = _read("docs/reference/RETENTIESCAN_SALES_ONE_PAGER.md")
    objection_matrix = _read("docs/reference/SALES_OBJECTION_AND_CLAIMS_MATRIX.md")

    assert "exitscan baseline" in decision_tree
    assert "retentiescan baseline" in decision_tree
    assert "retentiescan ritmeroute" in decision_tree
    assert "volwaardige eerste route" in decision_tree
    assert "compacte retentie vervolgmeting" in decision_tree
    assert "quote-only vervolgroute" in comparison
    assert "volwaardige eerste route voor vroegsignalering op behoud" in comparison
    assert "segment deep dive" in comparison
    assert "retentiescan ritme" in proposals
    assert "vanaf eur 1.250" in proposals
    assert "signalen van werkfrictie" in exit_one_pager
    assert "bestuurlijke read" in exit_one_pager
    assert "bestuurlijke handoff" in exit_one_pager
    assert "volwaardige eerste route" in retention_one_pager
    assert "groepsgerichte managementduiding" in retention_one_pager
    assert "retentiescan ritmeroute vanaf eur 4.950" in retention_one_pager
    assert "wanneer wordt exitscan ritmeroute logisch?" in objection_matrix
    assert "hoe verhoudt retentiescan ritmeroute zich tot compacte vervolgmeting?" in objection_matrix


def test_pricing_claims_stay_inside_trust_and_output_boundaries():
    sales_playbook = _read("docs/reference/SALES_ENABLEMENT_SYSTEM_PLAYBOOK.md")
    site_content = _read("frontend/components/marketing/site-content.ts")
    retention_one_pager = _read("docs/reference/RETENTIESCAN_SALES_ONE_PAGER.md")
    trust_matrix = _read("docs/reference/TRUST_AND_CLAIMS_MATRIX.md")

    assert "claims mogen commercieel scherp zijn, maar nooit harder dan de repo-basis draagt" in sales_playbook
    assert "niet toegestaan" in trust_matrix
    assert "geen individuele signalen naar management" in site_content
    assert "geen brede mto" in retention_one_pager
    assert "geen individuele predictor" in retention_one_pager


def test_action_center_stays_documented_as_embedded_non_priced_follow_through_layer():
    strategy = _read("docs/strategy/STRATEGY.md")
    pricing_plan = _read("docs/active/PRICING_AND_PACKAGING_PROGRAM_PLAN.md")
    route_logic = _read("docs/active/PACKAGING_AND_ROUTE_LOGIC.md")
    language_canon = _read("docs/active/PRODUCT_LANGUAGE_CANON.md")
    signoff = _read("docs/active/COMMERCIAL_AND_ONBOARDING_SIGNOFF.md")
    acceptance = _read("docs/reference/PRICING_AND_PACKAGING_ACCEPTANCE_CHECKLIST.md")

    assert "action center-productlaag" in strategy
    assert "twee live consumers" in strategy
    assert "productadapters blijven op deze laag gesloten" in strategy
    assert "retentiescan-, onboarding-, pulse- en leadership-adapters staan nog inactive" in strategy
    assert "geen buyer-facing route, geen losse pricingmodule" in strategy
    assert "embedded follow-through laag" in pricing_plan
    assert "geen standalone action center pricing" in pricing_plan
    assert "inactive placeholder" in pricing_plan
    assert "embedded follow-through layer" in route_logic
    assert "mto + exitscan live" in route_logic
    assert "geen project-plan/advisory-scope" in route_logic
    assert "action center is de gedeelde bounded follow-through laag" in language_canon
    assert "nooit als zelfstandige route, package of prijsanker" in language_canon
    assert "geen extra routekeuze of prijslaag" in signoff
    assert "geen standalone action center pricing, modulepositionering of adapterverbreding" in signoff
    assert "geen pricingcopy leest action center als derde product" in acceptance
    assert "publiek prijsanker, derde product, buyer-facing module" in route_logic
