from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


MemberRole = Literal["owner", "member", "viewer"]
ActionCenterWorkspaceKind = Literal["follow_through"]
ActionCenterDossierStatus = Literal["open", "closed"]
ActionCenterAssignmentState = Literal["queued", "active", "blocked", "waiting", "completed", "cancelled"]
ActionCenterAssignmentKind = Literal["follow_up", "review_prep", "closure", "handoff"]
ActionCenterReviewState = Literal["scheduled", "due", "completed", "cancelled"]
ActionCenterFollowUpSignalKind = Literal[
    "decision_due",
    "owner_missing",
    "review_due",
    "blocked_assignment",
    "awaiting_input",
    "closure_ready",
]
ActionCenterSignalSeverity = Literal["info", "warning", "critical"]
ActionCenterSignalState = Literal["open", "resolved"]


@dataclass(frozen=True)
class ActionPermissionEnvelope:
    can_view_workspace: bool
    can_update_assignments: bool
    can_schedule_review_moments: bool
    can_resolve_signals: bool
    can_close_dossiers: bool
    can_manage_permissions: bool
    can_open_product_adapters: Literal[False]


@dataclass(frozen=True)
class ActionDossier:
    id: str
    title: str
    status: ActionCenterDossierStatus
    owner_id: str | None
    permission_envelope: ActionPermissionEnvelope


@dataclass(frozen=True)
class ActionAssignment:
    id: str
    dossier_id: str
    title: str
    state: ActionCenterAssignmentState
    kind: ActionCenterAssignmentKind
    owner_id: str | None


@dataclass(frozen=True)
class ActionReviewMoment:
    id: str
    dossier_id: str
    scheduled_for: str
    state: ActionCenterReviewState


@dataclass(frozen=True)
class ActionFollowUpSignal:
    id: str
    dossier_id: str
    kind: ActionCenterFollowUpSignalKind
    severity: ActionCenterSignalSeverity
    state: ActionCenterSignalState


@dataclass(frozen=True)
class ActionWorkspaceSummary:
    workspace_kind: ActionCenterWorkspaceKind
    open_dossier_count: int
    blocked_count: int
    review_due_count: int
    escalation_count: int
    project_plan_count: Literal[0]
    advisory_count: Literal[0]


def build_permission_envelope(role: MemberRole | None) -> ActionPermissionEnvelope:
    can_view_workspace = role is not None
    can_edit_follow_through = role == "owner"

    return ActionPermissionEnvelope(
        can_view_workspace=can_view_workspace,
        can_update_assignments=can_edit_follow_through,
        can_schedule_review_moments=can_edit_follow_through,
        can_resolve_signals=can_edit_follow_through,
        can_close_dossiers=can_edit_follow_through,
        can_manage_permissions=can_edit_follow_through,
        can_open_product_adapters=False,
    )


def summarize_workspace(
    *,
    dossiers: list[ActionDossier],
    assignments: list[ActionAssignment],
    review_moments: list[ActionReviewMoment],
    follow_up_signals: list[ActionFollowUpSignal],
) -> ActionWorkspaceSummary:
    return ActionWorkspaceSummary(
        workspace_kind="follow_through",
        open_dossier_count=sum(1 for dossier in dossiers if dossier.status == "open"),
        blocked_count=sum(1 for assignment in assignments if assignment.state == "blocked"),
        review_due_count=sum(1 for review_moment in review_moments if review_moment.state == "due"),
        escalation_count=sum(
            1 for signal in follow_up_signals if signal.state == "open" and signal.severity == "critical"
        ),
        project_plan_count=0,
        advisory_count=0,
    )
