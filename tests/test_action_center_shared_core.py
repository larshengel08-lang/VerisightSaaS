from backend.products.shared.action_center_adapters import get_future_action_center_adapter
from backend.products.shared.action_center_core import (
    ActionAssignment,
    ActionDossier,
    ActionFollowUpSignal,
    ActionReviewMoment,
    build_permission_envelope,
    summarize_workspace,
)
from backend.products.shared.action_center_mto import MtoDesignInput, describe_mto_design_input


def test_action_center_summary_stays_follow_through_bounded():
    summary = summarize_workspace(
        dossiers=[
            ActionDossier(
                id="dos-1",
                title="Pilot learning closure",
                status="open",
                owner_id="owner-1",
                permission_envelope=build_permission_envelope("owner"),
            )
        ],
        assignments=[
            ActionAssignment(
                id="asg-1",
                dossier_id="dos-1",
                title="Bevestig follow-upbesluit",
                state="blocked",
                kind="follow_up",
                owner_id="owner-1",
            )
        ],
        review_moments=[
            ActionReviewMoment(
                id="rev-1",
                dossier_id="dos-1",
                scheduled_for="2026-05-01",
                state="due",
            )
        ],
        follow_up_signals=[
            ActionFollowUpSignal(
                id="sig-1",
                dossier_id="dos-1",
                kind="decision_due",
                severity="critical",
                state="open",
            )
        ],
    )

    assert summary.workspace_kind == "follow_through"
    assert summary.open_dossier_count == 1
    assert summary.blocked_count == 1
    assert summary.review_due_count == 1
    assert summary.escalation_count == 1
    assert summary.project_plan_count == 0
    assert summary.advisory_count == 0


def test_permission_envelope_stays_within_follow_through_surface():
    member_envelope = build_permission_envelope("member")
    owner_envelope = build_permission_envelope("owner")

    assert member_envelope.can_view_workspace is True
    assert member_envelope.can_update_assignments is False
    assert member_envelope.can_manage_permissions is False
    assert member_envelope.can_open_product_adapters is False

    assert owner_envelope.can_update_assignments is True
    assert owner_envelope.can_schedule_review_moments is True
    assert owner_envelope.can_close_dossiers is True
    assert owner_envelope.can_open_product_adapters is False


def test_mto_and_future_adapters_stay_explicitly_separate():
    design_input = describe_mto_design_input(
        MtoDesignInput(
            source="mto",
            themes=["werkdruk", "rolhelderheid"],
            notes="Gebruik alleen als ontwerpinspiratie voor dossiervelden.",
        )
    )
    exit_adapter = get_future_action_center_adapter("exit")

    assert design_input.mode == "design_input_only"
    assert design_input.can_create_assignments is False
    assert design_input.can_open_carrier is False
    assert exit_adapter.status == "inactive"
    assert exit_adapter.live_entry_enabled is False
