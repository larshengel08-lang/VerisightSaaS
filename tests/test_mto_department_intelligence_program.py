from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8").lower()


def test_mto_department_intelligence_active_docs_define_safe_phase_sequence():
    phase_plan = _read("docs/active/mto_department_intelligence_and_action_contracts_plan.md")
    system_boundaries = _read("docs/active/mto_department_intelligence_and_action_contracts_system_boundaries_plan.md")
    wave_stack = _read("docs/active/mto_department_intelligence_and_action_contracts_wave_stack_plan.md")

    assert "aparte bestaande mto-worktree" in phase_plan
    assert "mto-specifieke inzichtdiepte" in phase_plan
    assert "shared action contracts only" in phase_plan
    assert "closed improvement loop" in phase_plan
    assert "future suite integration gate" in phase_plan

    assert "bestaande scans blijven methodisch onaangetast" in system_boundaries
    assert "department blijft de eerste segmentas" in system_boundaries
    assert "conservatieve suppressiedrempel" in system_boundaries
    assert "geen volledige shared engine implementeren" in system_boundaries

    assert "wave_01_mto_department_intelligence.md" in wave_stack
    assert "wave_02_shared_action_contracts.md" in wave_stack
    assert "wave_03_mto_closed_improvement_loop.md" in wave_stack
    assert "wave_04_future_suite_integration_gate.md" in wave_stack


def test_mto_department_intelligence_stays_mto_specific_and_updates_only_mto_surfaces():
    page = _read("frontend/app/(dashboard)/campaigns/[id]/page.tsx")
    frontend_definition = _read("frontend/lib/products/mto/definition.ts")
    backend_definition = _read("backend/products/mto/definition.py")

    assert "veilige afdelingsread" in page
    assert "suitebrede action engine" in page
    assert "buildmtodepartmentreadmodel" in page
    assert "bounded department intelligence" in frontend_definition
    assert "veilige afdelingsread" in backend_definition


def test_shared_action_contracts_open_new_tables_without_touching_existing_scan_contracts():
    schema = _read("supabase/schema.sql")

    assert "create table if not exists public.management_action_department_owners" in schema
    assert "create table if not exists public.management_actions" in schema
    assert "create table if not exists public.management_action_updates" in schema
    assert "check (source_product in ('exit', 'retention', 'pulse', 'team', 'onboarding', 'leadership', 'mto'))" in schema
    assert "check (status in ('open', 'assigned', 'in_progress', 'in_review', 'closed', 'follow_up_needed'))" in schema
    assert "check (source_scope_type in ('organization', 'department'))" in schema
    assert "check (scan_type in ('exit', 'retention', 'pulse', 'team', 'onboarding', 'leadership', 'mto'))" in schema


def test_closed_improvement_loop_stays_bounded_to_mto():
    page = _read("frontend/app/(dashboard)/campaigns/[id]/page.tsx")
    wave_three = _read("docs/active/wave_03_mto_closed_improvement_loop.md")
    gate_doc = _read("docs/active/wave_04_future_suite_integration_gate.md")

    assert "mtoactiontracker" in page
    assert "scan_type === 'mto'" in page
    assert "management_actions" in page
    assert "bounded action log voor hr en afdelingeigenaars" in page

    assert "wave status: completed_green" in wave_three
    assert "closed improvement loop hangt alleen achter `scan_type = mto`" in wave_three
    assert "gate blijft in deze fase bewust dicht" in gate_doc
    assert "geen live koppeling van andere producten in deze track" in gate_doc


def test_action_center_docs_open_new_mto_only_track():
    plan = _read("docs/active/action_center_manager_cockpit_plan.md")
    stack = _read("docs/active/action_center_manager_cockpit_wave_stack_plan.md")

    assert "mto blijft de eerste en enige actieve drager" in plan
    assert "geen wijziging aan exitscan, retentiescan of andere scanmethodiek" in plan
    assert "wave_01_action_center_contract_hardening.md" in stack
    assert "wave_02_action_center_mto_cockpit.md" in stack
    assert "wave_03_action_center_review_discipline.md" in stack


def test_action_center_stays_mto_only_in_dashboard_page():
    page = _read("frontend/app/(dashboard)/campaigns/[id]/page.tsx")

    assert "mtomanagercockpit" in page
    assert "stats.scan_type === 'mto'" in page
    assert "bounded action center" in page
