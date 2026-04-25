from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from .action_center_core import (
    ActionAssignment,
    ActionDossier,
    ActionFollowUpSignal,
    ActionReviewMoment,
    ActionWorkspaceSummary,
    MemberRole,
    build_permission_envelope,
    summarize_workspace,
)


MtoDesignMode = Literal["active_follow_through"]
MtoCarrierStatus = Literal["active"]
MtoCarrierOwnerModel = Literal["hr_central"]
MtoCarrierManagerScope = Literal["department_only"]
MtoTriageStatus = Literal["nieuw", "bevestigd", "geparkeerd", "uitgevoerd", "verworpen"]

_OPEN_TRIAGE_STATUSES = {"nieuw", "bevestigd"}


@dataclass(frozen=True)
class MtoDesignInput:
    source: Literal["mto"]
    themes: list[str]
    notes: str | None


@dataclass(frozen=True)
class MtoDesignInputSummary:
    source: Literal["mto"]
    mode: MtoDesignMode
    theme_count: int
    notes: str | None
    can_create_assignments: Literal[True]
    can_open_carrier: Literal[True]


@dataclass(frozen=True)
class MtoActionCenterCarrier:
    key: Literal["mto"]
    label: str
    status: MtoCarrierStatus
    workspace_kind: Literal["follow_through"]
    owner_model: MtoCarrierOwnerModel
    manager_scope: MtoCarrierManagerScope
    review_pressure_visible: Literal[True]
    dossier_first: Literal[True]
    can_open_other_product_adapters: Literal[False]


@dataclass(frozen=True)
class MtoDossierInput:
    id: str
    title: str
    triage_status: MtoTriageStatus
    department_label: str | None
    manager_label: str | None
    first_action_taken: str | None
    review_moment: str | None
    management_action_outcome: str | None
    next_route: str | None
    stop_reason: str | None


@dataclass(frozen=True)
class MtoActionCenterWorkspace:
    carrier: MtoActionCenterCarrier
    summary: ActionWorkspaceSummary
    dossiers: list[ActionDossier]
    assignments: list[ActionAssignment]
    review_moments: list[ActionReviewMoment]
    follow_up_signals: list[ActionFollowUpSignal]
    manager_departments: tuple[str, ...]


_MTO_ACTION_CENTER_CARRIER = MtoActionCenterCarrier(
    key="mto",
    label="MTO-carrier",
    status="active",
    workspace_kind="follow_through",
    owner_model="hr_central",
    manager_scope="department_only",
    review_pressure_visible=True,
    dossier_first=True,
    can_open_other_product_adapters=False,
)


def _build_actor_id(prefix: str, value: str | None) -> str | None:
    if not value:
        return None
    normalized = "-".join(value.strip().lower().split())
    return f"{prefix}:{normalized}" if normalized else None


def _is_open(triage_status: MtoTriageStatus) -> bool:
    return triage_status in _OPEN_TRIAGE_STATUSES


def describe_mto_design_input(input_data: MtoDesignInput) -> MtoDesignInputSummary:
    return MtoDesignInputSummary(
        source=input_data.source,
        mode="active_follow_through",
        theme_count=len(input_data.themes),
        notes=input_data.notes,
        can_create_assignments=True,
        can_open_carrier=True,
    )


def get_mto_action_center_carrier() -> MtoActionCenterCarrier:
    return _MTO_ACTION_CENTER_CARRIER


def build_mto_action_center_workspace(
    *,
    role: MemberRole | None,
    dossiers: list[MtoDossierInput],
) -> MtoActionCenterWorkspace:
    shared_dossiers: list[ActionDossier] = []
    assignments: list[ActionAssignment] = []
    review_moments: list[ActionReviewMoment] = []
    follow_up_signals: list[ActionFollowUpSignal] = []
    manager_departments = sorted({dossier.department_label for dossier in dossiers if dossier.department_label})

    for dossier in dossiers:
        permission_envelope = build_permission_envelope(role)
        is_open = _is_open(dossier.triage_status)
        has_follow_through_decision = bool(
            dossier.management_action_outcome or dossier.next_route or dossier.stop_reason
        )
        department_owner_id = _build_actor_id("department", dossier.department_label)
        manager_owner_id = _build_actor_id("manager", dossier.manager_label)

        shared_dossiers.append(
            ActionDossier(
                id=dossier.id,
                title=dossier.title,
                status="open" if is_open else "closed",
                owner_id=manager_owner_id or department_owner_id,
                permission_envelope=permission_envelope,
            )
        )

        assignment_state = (
            "completed"
            if dossier.triage_status == "uitgevoerd"
            else "cancelled"
            if dossier.triage_status == "verworpen"
            else "waiting"
            if dossier.triage_status == "geparkeerd"
            else "active"
            if dossier.first_action_taken
            else "blocked"
        )
        assignment_kind = (
            "handoff"
            if has_follow_through_decision
            else "follow_up"
            if dossier.first_action_taken
            else "review_prep"
        )
        assignments.append(
            ActionAssignment(
                id=f"asg-{dossier.id}",
                dossier_id=dossier.id,
                title=dossier.first_action_taken or "Leg eerste bounded stap vast",
                state=assignment_state,
                kind=assignment_kind,
                owner_id=manager_owner_id or department_owner_id,
            )
        )

        review_state = (
            "completed"
            if dossier.triage_status == "uitgevoerd"
            else "cancelled"
            if dossier.triage_status in {"geparkeerd", "verworpen"}
            else "due"
        )
        review_moments.append(
            ActionReviewMoment(
                id=f"rev-{dossier.id}",
                dossier_id=dossier.id,
                scheduled_for=dossier.review_moment or "Reviewmoment nog vastleggen",
                state=review_state,
            )
        )

        if is_open and not dossier.first_action_taken:
            follow_up_signals.append(
                ActionFollowUpSignal(
                    id=f"sig-step-{dossier.id}",
                    dossier_id=dossier.id,
                    kind="blocked_assignment",
                    severity="critical",
                    state="open",
                )
            )

        if is_open and not dossier.manager_label and dossier.department_label:
            follow_up_signals.append(
                ActionFollowUpSignal(
                    id=f"sig-owner-{dossier.id}",
                    dossier_id=dossier.id,
                    kind="owner_missing",
                    severity="warning",
                    state="open",
                )
            )

        if is_open:
            follow_up_signals.append(
                ActionFollowUpSignal(
                    id=f"sig-review-{dossier.id}",
                    dossier_id=dossier.id,
                    kind="review_due",
                    severity="warning",
                    state="open",
                )
            )

        if is_open and not has_follow_through_decision:
            follow_up_signals.append(
                ActionFollowUpSignal(
                    id=f"sig-decision-{dossier.id}",
                    dossier_id=dossier.id,
                    kind="decision_due",
                    severity="warning",
                    state="open",
                )
            )

    summary = summarize_workspace(
        dossiers=shared_dossiers,
        assignments=assignments,
        review_moments=review_moments,
        follow_up_signals=follow_up_signals,
    )

    return MtoActionCenterWorkspace(
        carrier=_MTO_ACTION_CENTER_CARRIER,
        summary=summary,
        dossiers=shared_dossiers,
        assignments=assignments,
        review_moments=review_moments,
        follow_up_signals=follow_up_signals,
        manager_departments=tuple(manager_departments),
    )
