"""
Verisight — Pydantic Schemas
===================================
Request / response models for the FastAPI layer.
Keeps API contract separate from ORM models.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID
from typing import Any, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


# ---------------------------------------------------------------------------
# Shared base
# ---------------------------------------------------------------------------

class OrmBase(BaseModel):
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Organization
# ---------------------------------------------------------------------------

class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=2, max_length=100, pattern=r"^[a-z0-9\-]+$")
    contact_email: EmailStr


class OrganizationRead(OrmBase):
    id: UUID | str
    name: str
    slug: str
    is_active: bool
    created_at: datetime


# ---------------------------------------------------------------------------
# Campaign
# ---------------------------------------------------------------------------

class CampaignCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    scan_type: str = Field(..., pattern=r"^(exit|retention|pulse|team|onboarding|leadership)$")
    delivery_mode: str = Field(default="baseline", pattern=r"^(baseline|live)$")
    enabled_modules: Optional[list[str]] = None

    @field_validator("enabled_modules")
    @classmethod
    def validate_modules(cls, v: list[str] | None) -> list[str] | None:
        valid = {
            "leadership",
            "culture",
            "growth",
            "compensation",
            "workload",
            "role_clarity",
            "segment_deep_dive",
        }
        if v is not None:
            invalid = set(v) - valid
            if invalid:
                raise ValueError(f"Ongeldige modules: {invalid}")
        return v

    @model_validator(mode="after")
    def validate_delivery_mode_for_scan(self) -> "CampaignCreate":
        if self.scan_type in {"pulse", "team", "onboarding", "leadership"} and self.delivery_mode == "live":
            product_name = (
                "Pulse"
                if self.scan_type == "pulse"
                else "TeamScan"
                if self.scan_type == "team"
                else "Onboarding 30-60-90"
                if self.scan_type == "onboarding"
                else "Leadership Scan"
            )
            raise ValueError(f"{product_name} ondersteunt in deze wave alleen baseline campaigns.")
        return self


class CampaignRead(OrmBase):
    id: UUID | str
    organization_id: UUID | str
    name: str
    scan_type: str
    delivery_mode: Optional[str]
    is_active: bool
    enabled_modules: Optional[list[str]]
    created_at: datetime
    closed_at: Optional[datetime]


# ---------------------------------------------------------------------------
# Respondent
# ---------------------------------------------------------------------------

class RespondentCreate(BaseModel):
    department: Optional[str] = Field(None, max_length=100)
    role_level: Optional[str] = Field(None, max_length=50)
    exit_month: Optional[str] = Field(None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$")
    annual_salary_eur: Optional[float] = Field(None, gt=0, lt=1_000_000)
    email: Optional[EmailStr] = None  # voor uitnodigingsmail


class RespondentRead(OrmBase):
    id: UUID | str
    campaign_id: UUID | str
    token: UUID | str
    department: Optional[str]
    role_level: Optional[str]
    exit_month: Optional[str]
    completed: bool
    completed_at: Optional[datetime]
    sent_at: Optional[datetime]


class RespondentBatchCreate(BaseModel):
    """Create multiple respondents in one API call."""
    respondents: list[RespondentCreate] = Field(..., min_length=1, max_length=500)
    send_invites: bool = True  # stuur direct uitnodigingsmail als e-mail opgegeven


class RespondentImportIssue(BaseModel):
    row_number: int
    field: str
    message: str


class RespondentImportPreviewRow(BaseModel):
    row_number: int
    email: EmailStr
    department: Optional[str] = None
    role_level: Optional[str] = None
    exit_month: Optional[str] = None
    annual_salary_eur: Optional[float] = None


class InviteQueueItem(BaseModel):
    token: str
    email: Optional[EmailStr] = None


class RespondentImportResponse(BaseModel):
    dry_run: bool
    total_rows: int
    valid_rows: int
    invalid_rows: int
    duplicate_existing: int = 0
    recognized_columns: list[str] = Field(default_factory=list)
    ignored_columns: list[str] = Field(default_factory=list)
    blocking_messages: list[str] = Field(default_factory=list)
    preview_rows: list[RespondentImportPreviewRow] = Field(default_factory=list)
    errors: list[RespondentImportIssue] = Field(default_factory=list)
    imported: int = 0
    emails_sent: int = 0
    launch_blocked: bool = True
    readiness_label: str = "Importcontrole vereist"
    recovery_hint: str = "Werk het deelnemersbestand bij en controleer daarna opnieuw."
    invite_queue: list[InviteQueueItem] = Field(default_factory=list)


class InviteSendResult(BaseModel):
    sent: int
    failed: int
    skipped: int  # geen e-mailadres


class SendInviteItem(BaseModel):
    """Één token + e-mailadres voor de send-invites route."""
    token: str
    email: Optional[EmailStr] = None


class ContactRequestCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    work_email: EmailStr
    organization: str = Field(..., min_length=2, max_length=255)
    employee_count: str = Field(..., min_length=2, max_length=80)
    route_interest: Literal[
        "exitscan",
        "retentiescan",
        "teamscan",
        "onboarding",
        "leadership",
        "combinatie",
        "nog-onzeker",
    ] = "exitscan"
    cta_source: str = Field(default="website_contact_form", min_length=2, max_length=120)
    desired_timing: Literal["zo-snel-mogelijk", "deze-maand", "dit-kwartaal", "orienterend"] = "orienterend"
    current_question: str = Field(..., min_length=5, max_length=2000)
    website: Optional[str] = Field(default=None, max_length=255)


class ContactRequestResponse(BaseModel):
    message: str
    notification_sent: bool = True
    warning: str | None = None
    lead_id: UUID | str | None = None


class ContactRequestRead(BaseModel):
    id: UUID | str
    name: str
    work_email: EmailStr
    organization: str
    employee_count: str
    route_interest: str | None = None
    cta_source: str | None = None
    desired_timing: str | None = None
    current_question: str
    notification_sent: bool
    notification_error: str | None = None
    ops_stage: str
    ops_exception_status: str
    ops_owner: str | None = None
    ops_next_step: str | None = None
    ops_handoff_note: str | None = None
    qualification_status: str
    qualified_route: str | None = None
    qualification_note: str | None = None
    qualification_reviewed_by: str | None = None
    qualification_reviewed_at: datetime | None = None
    commercial_agreement_status: str
    commercial_pricing_mode: str | None = None
    commercial_start_readiness_status: str
    commercial_start_blocker: str | None = None
    commercial_agreement_confirmed_by: str | None = None
    commercial_agreement_confirmed_at: datetime | None = None
    commercial_readiness_reviewed_by: str | None = None
    commercial_readiness_reviewed_at: datetime | None = None
    last_contacted_at: datetime | None = None
    created_at: datetime


class ContactRequestUpdate(BaseModel):
    ops_stage: Literal[
        "lead_captured",
        "route_qualified",
        "implementation_intake_ready",
        "awaiting_follow_up",
        "closed",
    ] | None = None
    ops_exception_status: Literal[
        "none",
        "blocked",
        "needs_operator_recovery",
        "awaiting_client_input",
        "awaiting_external_delivery",
    ] | None = None
    ops_owner: str | None = Field(default=None, max_length=120)
    ops_next_step: str | None = Field(default=None, max_length=2000)
    ops_handoff_note: str | None = Field(default=None, max_length=4000)
    qualification_status: Literal["not_reviewed", "needs_route_review", "route_confirmed"] | None = None
    qualified_route: Literal[
        "exitscan",
        "retentiescan",
        "teamscan",
        "onboarding",
        "leadership",
        "combinatie",
    ] | None = None
    qualification_note: str | None = Field(default=None, max_length=2000)
    qualification_reviewed_by: str | None = Field(default=None, max_length=120)
    commercial_agreement_status: Literal["not_started", "confirmed", "blocked"] | None = None
    commercial_pricing_mode: Literal["public_anchor", "custom_quote"] | None = None
    commercial_start_readiness_status: Literal["not_ready", "ready", "blocked"] | None = None
    commercial_start_blocker: str | None = Field(default=None, max_length=2000)
    commercial_agreement_confirmed_by: str | None = Field(default=None, max_length=120)
    commercial_readiness_reviewed_by: str | None = Field(default=None, max_length=120)
    last_contacted_at: datetime | None = None


# ---------------------------------------------------------------------------
# Survey submission (from the HTML survey form)
# ---------------------------------------------------------------------------

class SurveySubmit(BaseModel):
    """
    Body POSTed when a respondent submits the survey.
    All Likert values: integers 1-5.
    Open text is optional.
    """
    token: str

    # Module A — exit context (optional for retention surveys)
    tenure_years: Optional[float] = Field(None, ge=0, le=60)
    exit_reason_category: Optional[str] = None
    exit_reason_code: Optional[str] = None
    # Shared request field for a product-specific direction/stay item.
    # Product interpretation must come from scan_type and product definition.
    stay_intent_score: Optional[int] = Field(None, ge=1, le=5)
    signal_visibility_score: Optional[int] = Field(None, ge=1, le=5)

    # Module B — SDT (12 items, required)
    sdt_raw: dict[str, int] = Field(default_factory=dict)

    # Module C — org factors (dict of all answered items)
    org_raw: dict[str, int] = Field(default_factory=dict)

    # Module D — meespelende redenen naast de hoofdreden (optional)
    pull_factors_raw: dict[str, int] = Field(default_factory=dict)

    # Module E — open text
    open_text: Optional[str] = Field(None, max_length=3000)

    # UWES-3 (retention only)
    uwes_raw: dict[str, int] = Field(default_factory=dict)

    # Turnover intention (retention only)
    turnover_intention_raw: dict[str, int] = Field(default_factory=dict)

    @field_validator("sdt_raw")
    @classmethod
    def validate_sdt(cls, v: dict[str, int]) -> dict[str, int]:
        for key, val in v.items():
            if val not in range(1, 6):
                raise ValueError(f"SDT item {key} heeft waarde {val}, verwacht 1-5.")
        return v

    @field_validator("org_raw", "pull_factors_raw", "uwes_raw", "turnover_intention_raw")
    @classmethod
    def validate_likert_dict(cls, v: dict[str, int]) -> dict[str, int]:
        for key, val in v.items():
            if val not in range(1, 6):
                raise ValueError(f"Item {key}: waarde {val} buiten bereik (1-5).")
        return v

    @field_validator("pull_factors_raw")
    @classmethod
    def validate_contributing_reasons(cls, v: dict[str, int]) -> dict[str, int]:
        valid = {
            "leiderschap", "cultuur", "groei", "beloning", "werkdruk", "rolonduidelijkheid",
            "beter_aanbod", "carriere_switch", "ondernemerschap",
            "verhuizing", "partner_verhuisd", "studie", "pensioen", "gezondheid", "persoonlijk",
        }
        invalid = set(v.keys()) - valid
        if invalid:
            raise ValueError(f"Ongeldige aanvullende vertrekreden(en): {invalid}")
        if len(v) > 2:
            raise ValueError("Selecteer maximaal 2 aanvullende vertrekredenen.")
        return v


# ---------------------------------------------------------------------------
# Survey response (API output after submission)
# ---------------------------------------------------------------------------

class SurveyResponseRead(OrmBase):
    id: UUID | str
    respondent_id: UUID | str
    # Shared response field name; management layers must translate this to the
    # product-specific signaallabel.
    risk_score: Optional[float]
    # Shared direction/stay field; product meaning varies by scan_type and
    # must not be read as a universal construct across products.
    stay_intent_score: Optional[int] = None
    # Non-breaking view-model alias for product-specific signal reading.
    signal_score: Optional[float] = None
    # Non-breaking view-model alias for product-specific direction reading.
    direction_signal_score: Optional[int] = None
    risk_band: Optional[str]
    preventability: Optional[str]
    sdt_scores: dict[str, Any]
    org_scores: dict[str, Any]
    submitted_at: datetime

    @model_validator(mode="after")
    def populate_signal_aliases(self) -> "SurveyResponseRead":
        if self.signal_score is None:
            self.signal_score = self.risk_score
        if self.direction_signal_score is None:
            self.direction_signal_score = self.stay_intent_score
        return self


# ---------------------------------------------------------------------------
# Dashboard / analytics
# ---------------------------------------------------------------------------

class CampaignStats(BaseModel):
    campaign_id: UUID | str
    campaign_name: str
    scan_type: str
    total_invited: int
    total_completed: int
    completion_rate_pct: float
    avg_risk_score: Optional[float]
    # Non-breaking view-model alias for product-specific average signal reading.
    avg_signal_score: Optional[float] = None
    risk_band_distribution: dict[str, int]   # {"HOOG": 3, "MIDDEN": 5, "LAAG": 8}
    pattern_report: Optional[dict[str, Any]]

    @model_validator(mode="after")
    def populate_signal_alias(self) -> "CampaignStats":
        if self.avg_signal_score is None:
            self.avg_signal_score = self.avg_risk_score
        return self


# ---------------------------------------------------------------------------
# Operator API token
# ---------------------------------------------------------------------------

class ApiKeyResponse(BaseModel):
    api_key: str
    message: str = "Bewaar deze sleutel veilig — wordt niet opnieuw getoond."
