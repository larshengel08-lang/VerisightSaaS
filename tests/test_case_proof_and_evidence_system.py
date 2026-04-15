from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8").lower()


def test_case_proof_reference_docs_define_canonical_evidence_taxonomy():
    system_doc = _read("docs/reference/CASE_PROOF_AND_EVIDENCE_SYSTEM.md")
    checklist = _read("docs/reference/CASE_PROOF_AND_EVIDENCE_ACCEPTANCE_CHECKLIST.md")
    sample_doc = _read("docs/reference/SAMPLE_OUTPUT_AND_SHOWCASE_SYSTEM.md")

    assert "deliverable_proof" in system_doc
    assert "trust_proof" in system_doc
    assert "validation_evidence" in system_doc
    assert "case_candidate" in system_doc
    assert "approved_case_proof" in system_doc
    assert "reference_ready" in system_doc
    assert "sample-output blijft deliverable-proof en trustproof, niet case-proof" in system_doc
    assert "buyer-facing cards en docs maken zichtbaar welke evidence-tier een asset draagt" in checklist
    assert "telt als `deliverable_proof`" in sample_doc


def test_case_proof_capture_and_sales_docs_stay_aligned():
    capture_playbook = _read("docs/ops/CASE_PROOF_CAPTURE_PLAYBOOK.md")
    capture_templates = _read("docs/ops/CASE_PROOF_CAPTURE_TEMPLATES.md")
    learning_playbook = _read("docs/ops/PILOT_LEARNING_PLAYBOOK.md")
    sales_playbook = _read("docs/reference/SALES_ENABLEMENT_SYSTEM_PLAYBOOK.md")

    assert "zonder dossier geen case-candidate" in capture_playbook
    assert "draft" in capture_playbook
    assert "customer_permission" in capture_playbook
    assert "approvalstatus" in capture_templates
    assert "case-proof groeit vanuit learningdossiers" in learning_playbook
    assert "sample-output blijft `deliverable_proof`" in sales_playbook
    assert "reference_ready" in sales_playbook


def test_active_case_proof_plan_tracks_outputs_and_prompt_closure():
    active_plan = _read("docs/active/CASE_PROOF_AND_EVIDENCE_PROGRAM_PLAN.md")

    assert "docs/reference/case_proof_and_evidence_system.md" in active_plan
    assert "frontend/lib/case-proof-evidence.ts" in active_plan
    assert "frontend/components/marketing/sample-showcase-card.tsx" in active_plan
    assert "frontend/components/dashboard/pilot-learning-workbench.tsx" in active_plan
    assert "tests/test_case_proof_and_evidence_system.py" in active_plan
    assert "prompt_checklist.xlsx" in active_plan
