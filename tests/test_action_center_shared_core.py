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
    MtoDossierInput,
    build_mto_action_center_workspace,
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


def test_mto_stays_available_while_future_product_adapters_exclude_live_exit():
    design_input = describe_mto_design_input(
        MtoDesignInput(
            source="mto",
            themes=["werkdruk", "rolhelderheid"],
            notes="Gebruik alleen als ontwerpinspiratie voor dossiervelden.",
        )
    )
    carrier = get_mto_action_center_carrier()
    retention_adapter = get_future_action_center_adapter("retention")

    assert carrier.status == "active"
    assert carrier.workspace_kind == "follow_through"
    assert carrier.owner_model == "hr_central"
    assert carrier.manager_scope == "department_only"
    assert carrier.review_pressure_visible is True
    assert carrier.dossier_first is True
    assert carrier.can_open_other_product_adapters is False
    assert design_input.mode == "active_follow_through"
    assert design_input.can_create_assignments is True
    assert design_input.can_open_carrier is True
    assert retention_adapter.status == "inactive"
    assert retention_adapter.live_entry_enabled is False


def test_mto_workspace_projects_dossiers_reviews_and_hr_central_guardrails_onto_shared_core():
    workspace = build_mto_action_center_workspace(
        role="owner",
        dossiers=[
            MtoDossierInput(
                id="dos-1",
                title="Werkdruk - Support",
                triage_status="bevestigd",
                department_label="Support",
                manager_label="Sanne",
                first_action_taken="Roosterdruk binnen 2 weken herverdelen",
                review_moment="Herlees over 30 dagen",
                management_action_outcome=None,
                next_route=None,
                stop_reason=None,
            ),
            MtoDossierInput(
                id="dos-2",
                title="Rolhelderheid - Sales",
                triage_status="nieuw",
                department_label="Sales",
                manager_label=None,
                first_action_taken=None,
                review_moment=None,
                management_action_outcome=None,
                next_route=None,
                stop_reason=None,
            ),
        ],
    )

    assert workspace.carrier.owner_model == "hr_central"
    assert workspace.carrier.manager_scope == "department_only"
    assert workspace.summary.workspace_kind == "follow_through"
    assert workspace.summary.open_dossier_count == 2
    assert workspace.summary.blocked_count == 1
    assert workspace.summary.review_due_count == 2
    assert workspace.summary.escalation_count == 1
    assert workspace.manager_departments == ("Sales", "Support")
    assert workspace.assignments[0].state == "active"
    assert workspace.assignments[1].state == "blocked"
    assert any(signal.kind == "owner_missing" for signal in workspace.follow_up_signals)
    assert any(signal.kind == "decision_due" for signal in workspace.follow_up_signals)


def test_exit_becomes_the_first_live_product_consumer_without_opening_other_adapters():
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


def test_exit_workspace_projects_dossiers_with_explicit_owner_and_bounded_review_logic():
    workspace = build_exit_action_center_workspace(
        role="owner",
        dossiers=[
            ExitDossierInput(
                id="dos-1",
                title="ExitScan - Support closeout",
                triage_status="bevestigd",
                delivery_mode="live",
                management_owner_label="Sanne",
                review_owner_label="Verisight",
                first_action_taken="Plan exit-closeout met HR en teamlead",
                review_moment="Herlees over 30 dagen",
                management_action_outcome=None,
                next_route=None,
                stop_reason=None,
            ),
            ExitDossierInput(
                id="dos-2",
                title="ExitScan - Sales closeout",
                triage_status="nieuw",
                delivery_mode="baseline",
                management_owner_label=None,
                review_owner_label=None,
                first_action_taken=None,
                review_moment=None,
                management_action_outcome=None,
                next_route=None,
                stop_reason=None,
            ),
        ],
    )

    assert workspace.carrier.route_scope == "exit_only"
    assert workspace.summary.workspace_kind == "follow_through"
    assert workspace.summary.open_dossier_count == 2
    assert workspace.summary.blocked_count == 1
    assert workspace.summary.review_due_count == 2
    assert workspace.summary.escalation_count == 1
    assert workspace.active_delivery_modes == ("baseline", "live")
    assert workspace.assignments[0].state == "active"
    assert workspace.assignments[1].state == "blocked"
    assert any(signal.kind == "owner_missing" for signal in workspace.follow_up_signals)
    assert any(signal.kind == "decision_due" for signal in workspace.follow_up_signals)
