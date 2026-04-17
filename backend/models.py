"""
Verisight — ORM Models
=============================
SQLAlchemy ORM definitions for all database tables.

Tables
------
  organizations   — operator accounts / tenants
  campaigns       — survey campaigns per organisation
  respondents     — individual survey tokens (one per invite)
  survey_responses — completed survey data + computed scores
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    CHAR,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import TypeDecorator

from backend.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


class GUID(TypeDecorator):
    """Dialect-aware UUID type that stays string-based in Python."""

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        parsed = value if isinstance(value, uuid.UUID) else uuid.UUID(str(value))
        if dialect.name == "postgresql":
            return parsed
        return str(parsed)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return str(value)


# ---------------------------------------------------------------------------
# Organization (tenant)
# ---------------------------------------------------------------------------

class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(GUID(), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    campaigns: Mapped[list["Campaign"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
    learning_dossiers: Mapped[list["PilotLearningDossier"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    secret: Mapped["OrganizationSecret | None"] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
        uselist=False,
    )

    def __repr__(self) -> str:
        return f"<Organization {self.slug!r}>"


# ---------------------------------------------------------------------------
# Campaign
# ---------------------------------------------------------------------------

class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[str] = mapped_column(GUID(), primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(GUID(), ForeignKey("organizations.id"), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    scan_type: Mapped[str] = mapped_column(String(20), nullable=False)  # "exit" | "retention" | "pulse" | "team" | "onboarding" | "leadership"
    delivery_mode: Mapped[str | None] = mapped_column(String(20), nullable=True)  # "baseline" | "live" — null behandeld als baseline
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Optional: which Module C blocks to include (JSON list of factor keys)
    # e.g. ["leadership", "culture", "growth"]  — null means all
    enabled_modules: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    organization: Mapped["Organization"] = relationship(back_populates="campaigns")
    respondents: Mapped[list["Respondent"]] = relationship(back_populates="campaign", cascade="all, delete-orphan")
    learning_dossiers: Mapped[list["PilotLearningDossier"]] = relationship(
        back_populates="campaign",
        cascade="all, delete-orphan",
    )
    delivery_record: Mapped["CampaignDeliveryRecord | None"] = relationship(
        back_populates="campaign",
        cascade="all, delete-orphan",
        uselist=False,
    )

    def __repr__(self) -> str:
        return f"<Campaign {self.name!r} ({self.scan_type})>"


# ---------------------------------------------------------------------------
# OrganizationSecret (server-only tenant secret)
# ---------------------------------------------------------------------------

class OrganizationSecret(Base):
    __tablename__ = "organization_secrets"

    org_id: Mapped[str] = mapped_column(GUID(), ForeignKey("organizations.id"), primary_key=True)
    api_key: Mapped[str] = mapped_column(String(120), unique=True, default=_uuid)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    organization: Mapped["Organization"] = relationship(back_populates="secret")

    def __repr__(self) -> str:
        return f"<OrganizationSecret org_id={self.org_id!r}>"


# ---------------------------------------------------------------------------
# Respondent (one token per invited person)
# ---------------------------------------------------------------------------

class Respondent(Base):
    __tablename__ = "respondents"

    id: Mapped[str] = mapped_column(GUID(), primary_key=True, default=_uuid)
    campaign_id: Mapped[str] = mapped_column(GUID(), ForeignKey("campaigns.id"), nullable=False)

    # UUID token embedded in survey URL — no PII in token itself
    token: Mapped[str] = mapped_column(GUID(), unique=True, default=_uuid, index=True)

    # Minimal metadata for segmentation (operator-supplied, optional)
    department: Mapped[str | None] = mapped_column(String(100), nullable=True)
    role_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    exit_month: Mapped[str | None] = mapped_column(String(7), nullable=True)  # YYYY-MM, vooral voor retrospectieve batches
    annual_salary_eur: Mapped[float | None] = mapped_column(Float, nullable=True)

    # E-mailadres voor uitnodiging (optioneel — nooit getoond in dashboard)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Tracking
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    opened_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    token_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    campaign: Mapped["Campaign"] = relationship(back_populates="respondents")
    response: Mapped["SurveyResponse | None"] = relationship(back_populates="respondent", uselist=False)

    def __repr__(self) -> str:
        return f"<Respondent token={self.token[:8]}… completed={self.completed}>"


# ---------------------------------------------------------------------------
# SurveyResponse — all answers + computed scores
# ---------------------------------------------------------------------------

class SurveyResponse(Base):
    __tablename__ = "survey_responses"

    id: Mapped[str] = mapped_column(GUID(), primary_key=True, default=_uuid)
    respondent_id: Mapped[str] = mapped_column(GUID(), ForeignKey("respondents.id"), unique=True, nullable=False)

    # ------------------------------------------------------------------
    # Module A — Exit context (exit surveys only)
    # ------------------------------------------------------------------
    tenure_years: Mapped[float | None] = mapped_column(Float, nullable=True)
    exit_reason_category: Mapped[str | None] = mapped_column(String(50), nullable=True)   # push/pull/situational key
    exit_reason_code: Mapped[str | None] = mapped_column(String(10), nullable=True)       # e.g. "P1", "PL2"
    stay_intent_score: Mapped[int | None] = mapped_column(Integer, nullable=True)         # 1-5

    # ------------------------------------------------------------------
    # Module B — SDT raw items (JSON: {"B1": 4, "B2": 3, ...})
    # ------------------------------------------------------------------
    sdt_raw: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # Computed SDT scores (JSON: {"autonomy": 7.2, ...})
    sdt_scores: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # ------------------------------------------------------------------
    # Module C — Org factor raw items (JSON: {"leadership_1": 4, ...})
    # ------------------------------------------------------------------
    org_raw: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # Computed org scores (JSON: {"leadership": 6.8, ...})
    org_scores: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # ------------------------------------------------------------------
    # Module D — Pull factors (exit only)
    # ------------------------------------------------------------------
    pull_factors_raw: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # ------------------------------------------------------------------
    # Module E — Open text (anonymised before storage)
    # ------------------------------------------------------------------
    open_text_raw: Mapped[str | None] = mapped_column(Text, nullable=True)
    open_text_analysis: Mapped[str | None] = mapped_column(Text, nullable=True)   # LLM output

    # ------------------------------------------------------------------
    # UWES-3 (retention surveys only)
    # ------------------------------------------------------------------
    uwes_raw: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    uwes_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Turnover intention items (retention only)
    turnover_intention_raw: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    turnover_intention_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    # ------------------------------------------------------------------
    # Computed aggregates
    # ------------------------------------------------------------------
    risk_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    risk_band: Mapped[str | None] = mapped_column(String(10), nullable=True)          # HOOG/MIDDEN/LAAG
    preventability: Mapped[str | None] = mapped_column(String(20), nullable=True)     # exit only
    replacement_cost_eur: Mapped[float | None] = mapped_column(Float, nullable=True)  # exit only

    # Full scoring output stored for report generation
    full_result: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    # Scoring model version — allows comparison when weights/formulas change
    scoring_version: Mapped[str] = mapped_column(String(10), nullable=False, default="v1.0")

    respondent: Mapped["Respondent"] = relationship(back_populates="response")

    def __repr__(self) -> str:
        return f"<SurveyResponse risk={self.risk_score} band={self.risk_band}>"


# ---------------------------------------------------------------------------
# ContactRequest — website lead capture
# ---------------------------------------------------------------------------

class ContactRequest(Base):
    __tablename__ = "contact_requests"

    id: Mapped[str] = mapped_column(GUID(), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    work_email: Mapped[str] = mapped_column(String(255), nullable=False)
    organization: Mapped[str] = mapped_column(String(255), nullable=False)
    employee_count: Mapped[str] = mapped_column(String(80), nullable=False)
    route_interest: Mapped[str] = mapped_column(String(32), nullable=False, default="exitscan")
    cta_source: Mapped[str] = mapped_column(String(120), nullable=False, default="website_contact_form")
    desired_timing: Mapped[str] = mapped_column(String(32), nullable=False, default="orienterend")
    current_question: Mapped[str] = mapped_column(Text, nullable=False)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notification_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notification_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    ops_stage: Mapped[str] = mapped_column(String(40), nullable=False, default="lead_captured")
    ops_exception_status: Mapped[str] = mapped_column(String(32), nullable=False, default="none")
    ops_owner: Mapped[str | None] = mapped_column(String(120), nullable=True)
    ops_next_step: Mapped[str | None] = mapped_column(Text, nullable=True)
    ops_handoff_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    qualification_status: Mapped[str] = mapped_column(String(24), nullable=False, default="not_reviewed")
    qualified_route: Mapped[str | None] = mapped_column(String(32), nullable=True)
    qualification_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    qualification_reviewed_by: Mapped[str | None] = mapped_column(String(120), nullable=True)
    qualification_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    commercial_agreement_status: Mapped[str] = mapped_column(String(24), nullable=False, default="not_started")
    commercial_pricing_mode: Mapped[str | None] = mapped_column(String(24), nullable=True)
    commercial_start_readiness_status: Mapped[str] = mapped_column(String(24), nullable=False, default="not_ready")
    commercial_start_blocker: Mapped[str | None] = mapped_column(Text, nullable=True)
    commercial_agreement_confirmed_by: Mapped[str | None] = mapped_column(String(120), nullable=True)
    commercial_agreement_confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    commercial_readiness_reviewed_by: Mapped[str | None] = mapped_column(String(120), nullable=True)
    commercial_readiness_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_contacted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    learning_dossiers: Mapped[list["PilotLearningDossier"]] = relationship(
        back_populates="contact_request",
    )
    delivery_records: Mapped[list["CampaignDeliveryRecord"]] = relationship(
        back_populates="contact_request",
    )

    def __repr__(self) -> str:
        return f"<ContactRequest {self.work_email!r} org={self.organization!r}>"


# ---------------------------------------------------------------------------
# CampaignDeliveryRecord / CampaignDeliveryCheckpoint — persistent ops control
# ---------------------------------------------------------------------------

class CampaignDeliveryRecord(Base):
    __tablename__ = "campaign_delivery_records"

    id: Mapped[str] = mapped_column(GUID(), primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(
        GUID(),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    campaign_id: Mapped[str] = mapped_column(
        GUID(),
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    contact_request_id: Mapped[str | None] = mapped_column(
        GUID(),
        ForeignKey("contact_requests.id", ondelete="SET NULL"),
        nullable=True,
    )
    lifecycle_stage: Mapped[str] = mapped_column(String(40), nullable=False, default="setup_in_progress")
    exception_status: Mapped[str] = mapped_column(String(32), nullable=False, default="none")
    operator_owner: Mapped[str | None] = mapped_column(String(120), nullable=True)
    next_step: Mapped[str | None] = mapped_column(Text, nullable=True)
    operator_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    customer_handoff_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    first_management_use_confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    follow_up_decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    learning_closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    organization: Mapped["Organization"] = relationship()
    campaign: Mapped["Campaign"] = relationship(back_populates="delivery_record")
    contact_request: Mapped["ContactRequest | None"] = relationship(back_populates="delivery_records")
    checkpoints: Mapped[list["CampaignDeliveryCheckpoint"]] = relationship(
        back_populates="delivery_record",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<CampaignDeliveryRecord campaign_id={self.campaign_id!r} stage={self.lifecycle_stage!r}>"


class CampaignDeliveryCheckpoint(Base):
    __tablename__ = "campaign_delivery_checkpoints"

    id: Mapped[str] = mapped_column(GUID(), primary_key=True, default=_uuid)
    delivery_record_id: Mapped[str] = mapped_column(
        GUID(),
        ForeignKey("campaign_delivery_records.id", ondelete="CASCADE"),
        nullable=False,
    )
    checkpoint_key: Mapped[str] = mapped_column(String(40), nullable=False)
    auto_state: Mapped[str] = mapped_column(String(20), nullable=False, default="unknown")
    manual_state: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    exception_status: Mapped[str] = mapped_column(String(32), nullable=False, default="none")
    last_auto_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    operator_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    delivery_record: Mapped["CampaignDeliveryRecord"] = relationship(back_populates="checkpoints")

    def __repr__(self) -> str:
        return f"<CampaignDeliveryCheckpoint key={self.checkpoint_key!r} manual={self.manual_state!r}>"


# ---------------------------------------------------------------------------
# PilotLearningDossier / PilotLearningCheckpoint — internal learning system
# ---------------------------------------------------------------------------

class PilotLearningDossier(Base):
    __tablename__ = "pilot_learning_dossiers"

    id: Mapped[str] = mapped_column(GUID(), primary_key=True, default=_uuid)
    organization_id: Mapped[str | None] = mapped_column(
        GUID(),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=True,
    )
    campaign_id: Mapped[str | None] = mapped_column(
        GUID(),
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=True,
    )
    contact_request_id: Mapped[str | None] = mapped_column(
        GUID(),
        ForeignKey("contact_requests.id", ondelete="SET NULL"),
        nullable=True,
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    route_interest: Mapped[str] = mapped_column(String(32), nullable=False, default="exitscan")
    scan_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    delivery_mode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    triage_status: Mapped[str] = mapped_column(String(20), nullable=False, default="nieuw")

    lead_contact_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    lead_organization_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    lead_work_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    lead_employee_count: Mapped[str | None] = mapped_column(String(80), nullable=True)

    buyer_question: Mapped[str | None] = mapped_column(Text, nullable=True)
    expected_first_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    buying_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    trust_friction: Mapped[str | None] = mapped_column(Text, nullable=True)
    implementation_risk: Mapped[str | None] = mapped_column(Text, nullable=True)
    first_management_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    first_action_taken: Mapped[str | None] = mapped_column(Text, nullable=True)
    review_moment: Mapped[str | None] = mapped_column(Text, nullable=True)
    adoption_outcome: Mapped[str | None] = mapped_column(Text, nullable=True)
    management_action_outcome: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_route: Mapped[str | None] = mapped_column(Text, nullable=True)
    stop_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    case_evidence_closure_status: Mapped[str] = mapped_column(String(32), nullable=False, default="lesson_only")
    case_approval_status: Mapped[str] = mapped_column(String(32), nullable=False, default="draft")
    case_permission_status: Mapped[str] = mapped_column(String(32), nullable=False, default="not_requested")
    case_quote_potential: Mapped[str] = mapped_column(String(16), nullable=False, default="laag")
    case_reference_potential: Mapped[str] = mapped_column(String(16), nullable=False, default="laag")
    case_outcome_quality: Mapped[str] = mapped_column(String(24), nullable=False, default="nog_onvoldoende")
    case_outcome_classes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    claimable_observations: Mapped[str | None] = mapped_column(Text, nullable=True)
    supporting_artifacts: Mapped[str | None] = mapped_column(Text, nullable=True)
    case_public_summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_by: Mapped[str | None] = mapped_column(GUID(), nullable=True)
    updated_by: Mapped[str | None] = mapped_column(GUID(), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    organization: Mapped["Organization | None"] = relationship(back_populates="learning_dossiers")
    campaign: Mapped["Campaign | None"] = relationship(back_populates="learning_dossiers")
    contact_request: Mapped["ContactRequest | None"] = relationship(back_populates="learning_dossiers")
    checkpoints: Mapped[list["PilotLearningCheckpoint"]] = relationship(
        back_populates="dossier",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<PilotLearningDossier title={self.title!r} status={self.triage_status!r}>"


class PilotLearningCheckpoint(Base):
    __tablename__ = "pilot_learning_checkpoints"

    id: Mapped[str] = mapped_column(GUID(), primary_key=True, default=_uuid)
    dossier_id: Mapped[str] = mapped_column(
        GUID(),
        ForeignKey("pilot_learning_dossiers.id", ondelete="CASCADE"),
        nullable=False,
    )
    checkpoint_key: Mapped[str] = mapped_column(String(40), nullable=False)
    owner_label: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="nieuw")
    objective_signal_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    qualitative_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    interpreted_observation: Mapped[str | None] = mapped_column(Text, nullable=True)
    confirmed_lesson: Mapped[str | None] = mapped_column(Text, nullable=True)
    lesson_strength: Mapped[str] = mapped_column(String(40), nullable=False, default="incidentele_observatie")
    destination_areas: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    dossier: Mapped["PilotLearningDossier"] = relationship(back_populates="checkpoints")

    def __repr__(self) -> str:
        return f"<PilotLearningCheckpoint key={self.checkpoint_key!r} status={self.status!r}>"
