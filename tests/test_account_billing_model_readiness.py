from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8").lower()


def test_active_account_billing_plan_tracks_repo_surfaces_and_prompt_closure():
    active_plan = _read("docs/active/account_and_billing_model_readiness_plan.md")

    assert "account_and_billing_model_readiness_plan.md" in active_plan
    assert "docs/reference/architecture.md" in active_plan
    assert "frontend/lib/types.ts" in active_plan
    assert "frontend/app/voorwaarden/page.tsx" in active_plan
    assert "tests/test_account_billing_model_readiness.py" in active_plan
    assert "prompt_checklist.xlsx" in active_plan


def test_account_model_boundaries_stay_explicit_in_plan_and_architecture():
    active_plan = _read("docs/active/account_and_billing_model_readiness_plan.md")
    architecture = _read("docs/reference/architecture.md")

    assert "organization` blijft in v1 zowel tenantgrens als primaire accounteenheid" in active_plan
    assert "geen nieuwe runtime-entiteiten zoals `billing_account`, `subscription`, `seat` of `usage_record`" in active_plan
    assert "rollen `owner` / `member` / `viewer` blijven toegangsrollen en zijn geen seats of licenties" in active_plan
    assert "organizations` is in v1 zowel de tenantgrens als de primaire accounteenheid" in architecture
    assert "org_members` en `org_invites` modelleren toegang, niet facturatie" in architecture
    assert "geen self-serve seat- of usageabonnementen" in architecture


def test_shared_types_keep_access_and_fulfillment_separate_from_billing():
    shared_types = _read("frontend/lib/types.ts")

    assert "access roles only. these are not billable seats or plan licenses." in shared_types
    assert "current tenant boundary and v1 customer account boundary." in shared_types
    assert "a separate billing account abstraction does not exist in runtime yet." in shared_types
    assert "campaigns are operational fulfillment units." in shared_types
    assert "they are not subscriptions, seats, or standalone billing units." in shared_types


def test_legal_terms_keep_manual_billing_and_no_self_serve_claims_explicit():
    voorwaarden = _read("frontend/app/voorwaarden/page.tsx")

    assert "de standaarddienst is organisatiegebonden en assisted van opzet" in voorwaarden
    assert "publiek self-serve checkout-, seat- of usageabonnement" in voorwaarden
    assert "offerte, trajectafspraak en handmatige facturatie" in voorwaarden
    assert "geen standaard self-serve checkout, seatbilling of automatisch recurring abonnement" in voorwaarden
