from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8").lower()


def test_active_lifecycle_plan_tracks_repo_surfaces_and_prompt_closure():
    active_plan = _read("docs/active/CUSTOMER_LIFECYCLE_AND_EXPANSION_MODEL_PLAN.md")

    assert "customer_lifecycle_and_expansion_model_plan.md" in active_plan
    assert "frontend/components/marketing/site-content.ts" in active_plan
    assert "frontend/app/tarieven/page.tsx" in active_plan
    assert "frontend/app/aanpak/page.tsx" in active_plan
    assert "frontend/app/(dashboard)/campaigns/[id]/page.tsx" in active_plan
    assert "frontend/lib/client-onboarding.ts" in active_plan
    assert "frontend/lib/pilot-learning.ts" in active_plan
    assert "prompt_checklist.xlsx" in active_plan


def test_public_and_in_product_copy_keep_lifecycle_hierarchy_explicit():
    site_content = _read("frontend/components/marketing/site-content.ts")
    tarieven_page = _read("frontend/app/tarieven/page.tsx")
    aanpak_page = _read("frontend/app/aanpak/page.tsx")
    contact_form = _read("frontend/components/marketing/contact-form.tsx")
    campaign_page = _read("frontend/app/(dashboard)/campaigns/[id]/page.tsx")

    assert "customerlifecyclestages" in site_content
    assert "pricinglifecycleladder" in site_content
    assert "expansiontriggercards" in site_content
    assert "exitscan baseline als standaard eerste koop" in site_content
    assert "retentiescan ritme blijft de vaste buyer-facing vervolgvorm" in site_content
    assert "van eerste koop naar logisch vervolg" in tarieven_page
    assert "de route stopt niet bij het rapport" in aanpak_page
    assert "vervolgvorm, combinatieroute of live route wordt pas concreet" in contact_form
    assert "na de eerste managementsessie" in campaign_page
