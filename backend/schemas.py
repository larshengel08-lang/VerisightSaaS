"""
Verisight — Pydantic Schemas
===================================
Request / response models for the FastAPI layer.
Keeps API contract separate from ORM models.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


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
    id: str
    name: str
    slug: str
    is_active: bool
    created_at: datetime


# ---------------------------------------------------------------------------
# Campaign
# ---------------------------------------------------------------------------

class CampaignCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    scan_type: str = Field(..., pattern=r"^(exit|retention)$")
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


class CampaignRead(OrmBase):
    id: str
    organization_id: str
    name: str
    scan_type: str
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
    annual_salary_eur: Optional[float] = Field(None, gt=0, lt=1_000_000)
    email: Optional[EmailStr] = None  # voor uitnodigingsmail


class RespondentRead(OrmBase):
    id: str
    campaign_id: str
    token: str
    department: Optional[str]
    role_level: Optional[str]
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
    annual_salary_eur: Optional[float] = None


class RespondentImportResponse(BaseModel):
    dry_run: bool
    total_rows: int
    valid_rows: int
    invalid_rows: int
    duplicate_existing: int = 0
    preview_rows: list[RespondentImportPreviewRow] = Field(default_factory=list)
    errors: list[RespondentImportIssue] = Field(default_factory=list)
    imported: int = 0
    emails_sent: int = 0


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
    current_question: str = Field(..., min_length=5, max_length=2000)
    website: Optional[str] = Field(default=None, max_length=255)


class ContactRequestResponse(BaseModel):
    message: str


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
    stay_intent_score: Optional[int] = Field(None, ge=1, le=5)

    # Module B — SDT (12 items, required)
    sdt_raw: dict[str, int] = Field(..., min_length=12, max_length=12)

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
        expected = {f"B{i}" for i in range(1, 13)}
        missing = expected - set(v.keys())
        if missing:
            raise ValueError(f"Ontbrekende SDT-items: {missing}")
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
    id: str
    respondent_id: str
    risk_score: Optional[float]
    risk_band: Optional[str]
    preventability: Optional[str]
    sdt_scores: dict[str, Any]
    org_scores: dict[str, Any]
    submitted_at: datetime


# ---------------------------------------------------------------------------
# Dashboard / analytics
# ---------------------------------------------------------------------------

class CampaignStats(BaseModel):
    campaign_id: str
    campaign_name: str
    scan_type: str
    total_invited: int
    total_completed: int
    completion_rate_pct: float
    avg_risk_score: Optional[float]
    risk_band_distribution: dict[str, int]   # {"HOOG": 3, "MIDDEN": 5, "LAAG": 8}
    pattern_report: Optional[dict[str, Any]]


# ---------------------------------------------------------------------------
# Operator API token
# ---------------------------------------------------------------------------

class ApiKeyResponse(BaseModel):
    api_key: str
    message: str = "Bewaar deze sleutel veilig — wordt niet opnieuw getoond."
