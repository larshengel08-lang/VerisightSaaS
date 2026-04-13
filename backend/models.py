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
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Organization (tenant)
# ---------------------------------------------------------------------------

class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    campaigns: Mapped[list["Campaign"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
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

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    scan_type: Mapped[str] = mapped_column(String(20), nullable=False)  # "exit" | "retention"
    delivery_mode: Mapped[str | None] = mapped_column(String(20), nullable=True)  # "baseline" | "live" — null behandeld als baseline
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Optional: which Module C blocks to include (JSON list of factor keys)
    # e.g. ["leadership", "culture", "growth"]  — null means all
    enabled_modules: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    organization: Mapped["Organization"] = relationship(back_populates="campaigns")
    respondents: Mapped[list["Respondent"]] = relationship(back_populates="campaign", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Campaign {self.name!r} ({self.scan_type})>"


# ---------------------------------------------------------------------------
# OrganizationSecret (server-only tenant secret)
# ---------------------------------------------------------------------------

class OrganizationSecret(Base):
    __tablename__ = "organization_secrets"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), primary_key=True)
    api_key: Mapped[str] = mapped_column(String(64), unique=True, default=_uuid)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    organization: Mapped["Organization"] = relationship(back_populates="secret")

    def __repr__(self) -> str:
        return f"<OrganizationSecret org_id={self.org_id!r}>"


# ---------------------------------------------------------------------------
# Respondent (one token per invited person)
# ---------------------------------------------------------------------------

class Respondent(Base):
    __tablename__ = "respondents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    campaign_id: Mapped[str] = mapped_column(String(36), ForeignKey("campaigns.id"), nullable=False)

    # UUID token embedded in survey URL — no PII in token itself
    token: Mapped[str] = mapped_column(String(36), unique=True, default=_uuid, index=True)

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

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    respondent_id: Mapped[str] = mapped_column(String(36), ForeignKey("respondents.id"), unique=True, nullable=False)

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

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    work_email: Mapped[str] = mapped_column(String(255), nullable=False)
    organization: Mapped[str] = mapped_column(String(255), nullable=False)
    employee_count: Mapped[str] = mapped_column(String(80), nullable=False)
    current_question: Mapped[str] = mapped_column(Text, nullable=False)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notification_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notification_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    def __repr__(self) -> str:
        return f"<ContactRequest {self.work_email!r} org={self.organization!r}>"
