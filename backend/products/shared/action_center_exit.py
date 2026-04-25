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


ExitCarrierStatus = Literal["active"]
ExitCarrierRouteScope = Literal["exit_only"]
ExitCarrierOwnerModel = Literal["explicit_named_owner"]
ExitCarrierReviewDiscipline = Literal["follow_up_review_required"]
ExitTriageStatus = Literal["nieuw", "bevestigd", "geparkeerd", "uitgevoerd", "verworpen"]
ExitDeliveryMode = Literal["baseline", "live"]

_OPEN_TRIAGE_STATUSES = {"nieuw", "bevestigd"}


@dataclass(frozen=True)
class ExitActionCenterCarrier:
    key: Literal["exit"]
    label: str
    status: ExitCarrierStatus
    workspace_kind: Literal["follow_through"]
    route_scope: ExitCarrierRouteScope
    owner_model: ExitCarrierOwnerModel
    review_discipline: ExitCarrierReviewDiscipline
    can_open_other_product_adapters: Literal[False]


@dataclass(frozen=True)
class ExitDossierInput:
    id: str
    title: str
    triage_status: ExitTriageStatus
    delivery_mode: ExitDeliveryMode | None
    management_owner_label: str | None
    review_owner_label: str | None
    first_action_taken: str | None
    review_moment: str | None
    management_action_outcome: str | None
    next_route: str | None
    stop_reason: str | None


@dataclass(frozen=True)
class ExitActionCenterWorkspace:
    carrier: ExitActionCenterCarrier
    summary: ActionWorkspaceSummary
    dossiers: list[ActionDossier]
    assignments: list[ActionAssignment]
    review_moments: list[ActionReviewMoment]
    follow_up_signals: list[ActionFollowUpSignal]
    active_delivery_modes: tuple[ExitDeliveryMode, ...]


_EXIT_ACTION_CENTER_CARRIER = ExitActionCenterCarrier(
    key="exit",
    label="ExitScan-adapter",
    status="active",
    workspace_kind="follow_through",
    route_scope="exit_only",
    owner_model="explicit_named_owner",
    review_discipline="follow_up_review_required",
    can_open_other_product_adapters=False,
)


def _build_actor_id(prefix: str, value: str | None) -> str | None:
    if not value:
        return None
    normalized = "-".join(value.strip().lower().split())
    return f"{prefix}:{normalized}" if normalized else None


def _is_open(triage_status: ExitTriageStatus) -> bool:
    return triage_status in _OPEN_TRIAGE_STATUSES


def _has_bounded_text(value: str | None) -> bool:
    return bool(value and value.strip())


def get_exit_action_center_carrier() -> ExitActionCenterCarrier:
    return _EXIT_ACTION_CENTER_CARRIER


def build_exit_action_center_workspace(
    *,
    role: MemberRole | None,
    dossiers: list[ExitDossierInput],
) -> ExitActionCenterWorkspace:
    shared_dossiers: list[ActionDossier] = []
    assignments: list[ActionAssignment] = []
    review_moments: list[ActionReviewMoment] = []
    follow_up_signals: list[ActionFollowUpSignal] = []
    active_delivery_modes = tuple(
        sorted({dossier.delivery_mode for dossier in dossiers if dossier.delivery_mode in {"baseline", "live"}})
    )

    for dossier in dossiers:
        permission_envelope = build_permission_envelope(role)
        is_open = _is_open(dossier.triage_status)
        has_follow_through_decision = bool(
            dossier.management_action_outcome or dossier.next_route or dossier.stop_reason
        )
        has_review_moment = _has_bounded_text(dossier.review_moment)
        management_owner_id = _build_actor_id("manager", dossier.management_owner_label)
        review_owner_id = _build_actor_id("review", dossier.review_owner_label)
        owner_id = management_owner_id or review_owner_id

        shared_dossiers.append(
            ActionDossier(
                id=dossier.id,
                title=dossier.title,
                status="open" if is_open else "closed",
                owner_id=owner_id,
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
                title=dossier.first_action_taken or "Leg eerste ExitScan follow-up stap vast",
                state=assignment_state,
                kind=assignment_kind,
                owner_id=owner_id,
            )
        )

        review_state = (
            "completed"
            if dossier.triage_status == "uitgevoerd"
            else "cancelled"
            if dossier.triage_status in {"geparkeerd", "verworpen"}
            else "scheduled"
            if has_review_moment
            else "due"
        )
        review_moments.append(
            ActionReviewMoment(
                id=f"rev-{dossier.id}",
                dossier_id=dossier.id,
                scheduled_for=dossier.review_moment or "Exit reviewmoment nog vastleggen",
                state=review_state,
            )
        )

        if is_open and not owner_id:
            follow_up_signals.append(
                ActionFollowUpSignal(
                    id=f"sig-owner-{dossier.id}",
                    dossier_id=dossier.id,
                    kind="owner_missing",
                    severity="warning",
                    state="open",
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

        if is_open and not has_review_moment:
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

    return ExitActionCenterWorkspace(
        carrier=_EXIT_ACTION_CENTER_CARRIER,
        summary=summary,
        dossiers=shared_dossiers,
        assignments=assignments,
        review_moments=review_moments,
        follow_up_signals=follow_up_signals,
        active_delivery_modes=active_delivery_modes,
    )
