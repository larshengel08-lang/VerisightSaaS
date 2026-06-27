from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8").lower()


def test_active_portfolio_plan_tracks_outputs_and_prompt_closure():
    active_plan = _read("docs/active/portfolio_architecture_program_plan.md")

    assert "docs/active/portfolio_architecture_program_plan.md" in active_plan
    assert "frontend/lib/marketing-products.ts" in active_plan
    assert "frontend/app/producten/page.tsx" in active_plan
    assert "frontend/app/producten/[slug]/page.tsx" in active_plan
    assert "frontend/lib/marketing-positioning.test.ts" in active_plan
    assert "tests/test_portfolio_architecture_program.py" in active_plan
    assert "prompt_checklist.xlsx" in active_plan


def test_portfolio_contract_tracks_current_core_first_suite_model():
    marketing_products = _read("frontend/lib/marketing-products.ts")
    frontend_types = _read("frontend/lib/types.ts")
    backend_schemas = _read("backend/schemas.py")
    schema = _read("supabase/schema.sql")

    assert "core_marketing_products" in marketing_products
    assert "portfolio_route_marketing_products" in marketing_products
    assert "follow_on_marketing_products" in marketing_products
    assert "reserved_marketing_products" in marketing_products
    assert "portfoliorole: marketingproductportfoliorole" in marketing_products
    assert "portfoliorole: 'core_product'" in marketing_products
    assert "portfoliorole: 'bounded_peer_route'" in marketing_products
    assert "portfoliorole: 'follow_on_route'" in marketing_products
    assert "portfoliorole: 'future_reserved_route'" in marketing_products
    assert "export type scantype" in frontend_types
    assert "'culture_assessment'" in frontend_types
    assert "slug: 'cultuurbeeld'" in marketing_products
    assert "route_interest: literal[" in backend_schemas
    assert '"teamscan"' in backend_schemas
    assert '"onboarding"' in backend_schemas
    assert '"leadership"' in backend_schemas
    assert '"combinatie"' in backend_schemas
    assert '"nog-onzeker"' in backend_schemas
    assert "scan_type in ('exit', 'retention', 'pulse', 'team', 'onboarding', 'leadership', 'culture_assessment')" in schema


def test_public_surfaces_keep_core_first_hierarchy_with_live_follow_on_routes():
    homepage = _read("frontend/app/page.tsx")
    products_page = _read("frontend/app/producten/page.tsx")
    product_detail = _read("frontend/app/producten/[slug]/page.tsx")
    dropdown = _read("frontend/components/marketing/solutions-dropdown.tsx")
    marketing_products = _read("frontend/lib/marketing-products.ts")
    combination_memo = _read("docs/reference/combinatie_portfolio_memo.md")
    sitemap = _read("frontend/app/sitemap.ts")

    assert "loep cultuurbeeld" in homepage
    assert "cultuur en engagement breed organisatiebreed" in products_page
    assert "product_culture_assessment_form" in product_detail
    assert "core_marketing_products.map" in dropdown
    assert "slug: 'cultuurbeeld'" in marketing_products
    assert "kernproducten" in dropdown
    assert "niet als derde kernproduct" in combination_memo
    assert "https://www.getloep.nl/producten/cultuurbeeld" in sitemap
    assert "https://www.getloep.nl/producten/pulse" in sitemap
    assert "https://www.getloep.nl/producten/teamscan" not in sitemap
    assert "https://www.getloep.nl/producten/onboarding-30-60-90" in sitemap
    assert "https://www.getloep.nl/producten/leadership-scan" in sitemap
