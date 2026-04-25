from backend.products.shared.action_center_adapters import get_future_action_center_adapter
from backend.products.shared.action_center_exit import (
    ExitDossierInput,
    build_exit_action_center_workspace,
    get_exit_action_center_carrier,
)
from backend.products.shared.action_center_core import (
    ActionAssignment,
    ActionDossier,
    ActionFollowUpSignal,
    ActionReviewMoment,
    build_permission_envelope,
    summarize_workspace,
)
from backend.products.shared.action_center_mto import (
    MtoDesignInput,
    describe_mto_design_input,
    get_mto_action_center_carrier,
)


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


def test_mto_stays_design_only_while_future_product_adapters_stay_inactive():
    design_input = describe_mto_design_input(
        MtoDesignInput(
            source="mto",
            themes=["werkdruk", "rolhelderheid"],
            notes="Gebruik alleen als ontwerpinspiratie voor dossiervelden.",
        )
    )
    mto_carrier = get_mto_action_center_carrier()
    retention_adapter = get_future_action_center_adapter("retention")

    assert design_input.mode == "design_input_only"
    assert design_input.can_create_assignments is False
    assert design_input.can_open_carrier is False
    assert mto_carrier.label == "MTO-design-input"
    assert mto_carrier.status == "inactive"
    assert retention_adapter.status == "inactive"
    assert retention_adapter.live_entry_enabled is False


def test_exit_becomes_the_only_live_action_center_consumer_in_this_slice():
    carrier = get_exit_action_center_carrier()
    retention_adapter = get_future_action_center_adapter("retention")

    assert carrier.label == "ExitScan-adapter"
    assert carrier.status == "active"
    assert carrier.workspace_kind == "follow_through"
    assert carrier.route_scope == "exit_only"
    assert carrier.owner_model == "explicit_named_owner"
    assert carrier.review_discipline == "follow_up_review_required"
    assert carrier.can_open_other_product_adapters is False
    assert retention_adapter.status == "inactive"
    assert retention_adapter.live_entry_enabled is False


def test_exit_workspace_keeps_admin_surface_read_only_while_owner_ids_stay_explicit():
    workspace = build_exit_action_center_workspace(
        role="member",
        dossiers=[
            ExitDossierInput(
                id="dos-1",
                title="ExitScan - Support closeout",
                triage_status="bevestigd",
                delivery_mode="live",
                management_owner_label="Sanne",
                review_owner_label="Verisight",
                first_action_taken="Plan exit-closeout met HR en teamlead",
                review_moment=None,
                management_action_outcome=None,
                next_route=None,
                stop_reason=None,
            ),
        ],
    )

    assert workspace.dossiers[0].owner_id == "manager:sanne"
    assert workspace.assignments[0].owner_id == "manager:sanne"
    assert workspace.dossiers[0].permission_envelope.can_update_assignments is False
    assert workspace.dossiers[0].permission_envelope.can_manage_permissions is False
    assert workspace.review_moments[0].scheduled_for == "Exit reviewmoment nog vastleggen"
