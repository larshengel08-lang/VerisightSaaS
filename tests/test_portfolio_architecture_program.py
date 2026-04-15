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


def test_portfolio_contract_keeps_two_runtime_products_and_one_route_layer():
    marketing_products = _read("frontend/lib/marketing-products.ts")
    frontend_types = _read("frontend/lib/types.ts")
    backend_schemas = _read("backend/schemas.py")
    schema = _read("supabase/schema.sql")

    assert "core_marketing_products" in marketing_products
    assert "portfolio_route_marketing_products" in marketing_products
    assert "reserved_marketing_products" in marketing_products
    assert "portfoliorole: marketingproductportfoliorole" in marketing_products
    assert "portfoliorole: 'portfolio_route'" in marketing_products
    assert "portfoliorole: 'future_reserved_route'" in marketing_products
    assert "export type scantype = 'exit' | 'retention'" in frontend_types
    assert 'route_interest: literal["exitscan", "retentiescan", "combinatie", "nog-onzeker"]' in backend_schemas
    assert "check (scan_type in ('exit', 'retention'))" in schema


def test_public_surfaces_keep_combination_as_route_and_future_routes_reserved():
    homepage = _read("frontend/app/page.tsx")
    products_page = _read("frontend/app/producten/page.tsx")
    product_detail = _read("frontend/app/producten/[slug]/page.tsx")
    dropdown = _read("frontend/components/marketing/solutions-dropdown.tsx")
    combination_memo = _read("docs/reference/combinatie_portfolio_memo.md")

    assert "2 kernproducten" in homepage
    assert "1 bewuste portfolioroute" in homepage
    assert "twee kernproducten en een bewuste portfolioroute" in products_page
    assert "geen derde hoofdproduct" in products_page
    assert "geen derde kernproduct" in product_detail
    assert "bewust nog niet actief" in product_detail
    assert "kernproducten" in dropdown
    assert "portfolioroute" in dropdown
    assert "niet als derde kernproduct" in combination_memo
