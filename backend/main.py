"""
Verisight — FastAPI Backend
===================================
Entrypoint: uvicorn backend.main:app --reload

Routes
------
  GET  /survey/{token}           → serve HTML survey form
  POST /survey/submit            → process & store submission
  GET  /api/org/{slug}/campaigns → list campaigns
  POST /api/org/{slug}/campaigns → create campaign
  POST /api/org/{slug}/campaigns/{id}/respondents → add respondents
  GET  /api/campaigns/{id}/stats → dashboard stats
  GET  /api/health               → health check
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

_SENTRY_DSN = os.getenv("SENTRY_DSN")
if _SENTRY_DSN:
    sentry_sdk.init(
        dsn=_SENTRY_DSN,
        integrations=[FastApiIntegration(), SqlalchemyIntegration()],
        traces_sample_rate=0.2,   # 20% van requests getraceerd
        environment=os.getenv("ENVIRONMENT", "production"),
        # Zorg dat PII niet in Sentry belandt
        send_default_pii=False,
    )
from datetime import datetime, timezone
from pathlib import Path
from time import time
from typing import Annotated, Any

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.templating import Jinja2Templates
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy.orm import Session

from backend.database import DATABASE_URL, check_db_connection, get_db, init_db
from backend.email import send_contact_request, send_hr_notification, send_survey_invite
from backend.models import Campaign, Organization, Respondent, SurveyResponse
from backend.schemas import (
    CampaignCreate,
    CampaignRead,
    CampaignStats,
    ContactRequestCreate,
    ContactRequestResponse,
    InviteSendResult,
    OrganizationCreate,
    OrganizationRead,
    RespondentBatchCreate,
    RespondentRead,
    SendInviteItem,
    SurveySubmit,
    SurveyResponseRead,
)
from backend.scoring import (
    anonymize_text,
    compute_sdt_scores,
    compute_org_scores,
    compute_retention_risk,
    compute_preventability,
    compute_replacement_cost,
    detect_patterns,
    get_recommendations,
    ORG_FACTOR_KEYS,
    SCORING_VERSION,
)

# ---------------------------------------------------------------------------
# Optional OpenAI enrichment (only used for open text; graceful fallback)
# ---------------------------------------------------------------------------

# OpenAI-integratie tijdelijk uitgeschakeld (AVG — EU-werknemersdata mag niet
# zonder expliciete toestemming naar een Amerikaanse verwerker).
# Herinschakelen vereist: expliciete toestemming in surveyflow + DPA met OpenAI.
_openai_client = None
_openai_available = False


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = BASE_DIR / "templates"

_IS_SQLITE = DATABASE_URL.startswith("sqlite")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Alleen tabellen aanmaken bij SQLite (lokale dev zonder Supabase)
    # Bij PostgreSQL/Supabase beheert schema.sql de tabellen
    if _IS_SQLITE:
        init_db()
    yield


app = FastAPI(
    title="Verisight API",
    version="2.0.0",
    description="HR verloopanalyse platform — ExitScan & RetentieScan",
    lifespan=lifespan,
)

_FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
_ADDITIONAL_CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ADDITIONAL_CORS_ORIGINS", "").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        _FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        *_ADDITIONAL_CORS_ORIGINS,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

EXIT_REASON_CODE_MAP = {
    "leiderschap": "P1",
    "cultuur": "P2",
    "groei": "P3",
    "beloning": "P4",
    "werkdruk": "P5",
    "rolonduidelijkheid": "P6",
    "beter_aanbod": "PL1",
    "carriere_switch": "PL2",
    "ondernemerschap": "PL3",
    "persoonlijk": "S1",
    "gezondheid": "S1",
    "verhuizing": "S2",
    "partner_verhuisd": "S2",
    "studie": "S3",
    "pensioen": "S3",
}

CONTACT_RATE_LIMIT_WINDOW_SECONDS = 15 * 60
CONTACT_RATE_LIMIT_MAX_REQUESTS = 5
_contact_request_buckets: dict[str, dict[str, float | int]] = {}


def _get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else "unknown"


def _is_contact_rate_limited(ip: str) -> bool:
    now = time()
    bucket = _contact_request_buckets.get(ip)

    if not bucket or now > float(bucket["reset_at"]):
        _contact_request_buckets[ip] = {"count": 1, "reset_at": now + CONTACT_RATE_LIMIT_WINDOW_SECONDS}
        return False

    bucket["count"] = int(bucket["count"]) + 1
    return int(bucket["count"]) > CONTACT_RATE_LIMIT_MAX_REQUESTS


def _cleanup_contact_rate_limits() -> None:
    now = time()
    expired = [ip for ip, bucket in _contact_request_buckets.items() if now > float(bucket["reset_at"])]
    for ip in expired:
        _contact_request_buckets.pop(ip, None)


def _render_survey_status(
    request: Request,
    *,
    status_code: int,
    title: str,
    heading: str,
    message: str,
    hint: str | None = None,
    tone: str = "info",
) -> HTMLResponse:
    return templates.TemplateResponse(
        request,
        "survey-status.html",
        context={
            "title": title,
            "heading": heading,
            "message": message,
            "hint": hint,
            "tone": tone,
        },
        status_code=status_code,
    )


# ---------------------------------------------------------------------------
# Global DB error handler — geeft 503 terug bij verbindingsfouten
# (Supabase circuit breaker, network timeout, etc.) in plaats van HTTP 500
# ---------------------------------------------------------------------------

@app.exception_handler(OperationalError)
async def db_operational_error_handler(request: Request, exc: OperationalError):
    return JSONResponse(
        status_code=503,
        content={"detail": "Database tijdelijk niet beschikbaar. Probeer het over enkele seconden opnieuw."},
    )


@app.exception_handler(SQLAlchemyError)
async def db_general_error_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=503,
        content={"detail": "Database-fout opgetreden. Probeer het opnieuw."},
    )


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health() -> dict[str, str]:
    db_ok = check_db_connection()
    return {"status": "ok" if db_ok else "degraded"}


@app.post("/api/contact-request", response_model=ContactRequestResponse)
async def create_contact_request(
    body: ContactRequestCreate,
    request: Request,
) -> ContactRequestResponse:
    if body.website:
        return ContactRequestResponse(message="Bedankt. We nemen snel contact op.")

    _cleanup_contact_rate_limits()
    client_ip = _get_client_ip(request)
    if _is_contact_rate_limited(client_ip):
        raise HTTPException(status_code=429, detail="Te veel aanvragen in korte tijd. Probeer het over 15 minuten opnieuw.")

    sent = send_contact_request(
        name=body.name,
        work_email=body.work_email,
        organization=body.organization,
        employee_count=body.employee_count,
        current_question=body.current_question,
    )

    if not sent:
        raise HTTPException(status_code=503, detail="Je aanvraag kon niet worden verzonden. Probeer het later opnieuw of mail naar hallo@verisight.nl.")

    return ContactRequestResponse(message="Bedankt. We reageren meestal binnen 1 werkdag.")


@app.get("/survey/complete", response_class=HTMLResponse)
async def survey_complete(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(request, "complete.html", context={"already_done": False})


# ---------------------------------------------------------------------------
# Survey — serve HTML form
# ---------------------------------------------------------------------------

@app.get("/survey/{token}", response_class=HTMLResponse)
async def serve_survey(
    request: Request,
    token: str,
    db: Session = Depends(get_db),
) -> HTMLResponse:
    respondent = db.query(Respondent).filter(Respondent.token == token).first()

    if not respondent:
        return _render_survey_status(
            request,
            status_code=404,
            title="Survey-link ongeldig",
            heading="Deze survey-link klopt niet",
            message="De link is ongeldig of niet meer actief. Controleer of je de volledige link hebt geopend.",
            hint="Neem contact op met de HR-afdeling van je organisatie als je een nieuwe uitnodiging nodig hebt.",
            tone="warning",
        )

    # Controleer of token verlopen is (90 dagen geldig)
    if hasattr(respondent, "token_expires_at") and respondent.token_expires_at:
        if respondent.token_expires_at < datetime.now(timezone.utc):
            return _render_survey_status(
                request,
                status_code=410,
                title="Survey-link verlopen",
                heading="Deze survey-link is verlopen",
                message="Om privacy- en beveiligingsredenen is deze persoonlijke link niet meer geldig.",
                hint="Neem contact op met de HR-afdeling van je organisatie als je de survey alsnog wilt invullen.",
                tone="warning",
            )

    if respondent.completed:
        return templates.TemplateResponse(
            request,
            "complete.html",
            context={"already_done": True},
        )

    # Mark opened
    if not respondent.opened_at:
        respondent.opened_at = datetime.now(timezone.utc)
        db.commit()

    campaign = respondent.campaign
    if not campaign.is_active:
        return _render_survey_status(
            request,
            status_code=410,
            title="Survey gesloten",
            heading="Deze survey is gesloten",
            message="Deze campagne accepteert geen nieuwe inzendingen meer. Eerder ingevulde antwoorden blijven wel meegenomen in de rapportage.",
            hint="Heb je vragen over de uitkomsten of verwerking van je gegevens, neem dan contact op met de HR-afdeling van je organisatie.",
            tone="info",
        )

    enabled_modules = campaign.enabled_modules or ORG_FACTOR_KEYS

    return templates.TemplateResponse(
        request,
        "survey.html",
        context={
            "token":           token,
            "scan_type":       campaign.scan_type,
            "campaign_name":   campaign.name,
            "enabled_modules": enabled_modules,
        },
    )


# ---------------------------------------------------------------------------
# Survey — process submission
# ---------------------------------------------------------------------------

@app.post("/survey/submit", response_class=JSONResponse)
async def submit_survey(
    payload: SurveySubmit,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    # Validate token
    respondent = db.query(Respondent).filter(Respondent.token == payload.token).first()
    if not respondent:
        raise HTTPException(status_code=404, detail="Ongeldige token.")
    if respondent.completed:
        raise HTTPException(status_code=409, detail="Survey al ingevuld.")
    if not respondent.campaign.is_active:
        raise HTTPException(status_code=410, detail="Deze survey is gesloten en accepteert geen nieuwe inzendingen meer.")

    exit_reason_code = payload.exit_reason_code
    if not exit_reason_code and payload.exit_reason_category:
        exit_reason_code = EXIT_REASON_CODE_MAP.get(payload.exit_reason_category)

    # --- Scoring ---
    try:
        sdt_scores = compute_sdt_scores(payload.sdt_raw)
        org_scores  = compute_org_scores(payload.org_raw)
        risk_result = compute_retention_risk(sdt_scores, org_scores)
    except Exception as exc:
        sentry_sdk.capture_exception(exc, extras={
            "campaign_id": str(respondent.campaign_id),
            "flow": "survey_scoring",
        })
        raise HTTPException(status_code=500, detail="Scoringsberekening mislukt. De survey is niet opgeslagen.")

    # Preventability (exit only)
    preventability_result: dict[str, Any] = {}
    if respondent.campaign.scan_type == "exit" and payload.exit_reason_category:
        preventability_result = compute_preventability(
            exit_reason_category=payload.exit_reason_category,
            stay_intent_score=payload.stay_intent_score or 3,
            sdt_scores=sdt_scores,
            org_scores=org_scores,
        )

    # Replacement cost (exit only — if salary known)
    replacement_cost_eur: float | None = None
    if respondent.campaign.scan_type == "exit" and respondent.annual_salary_eur:
        rc = compute_replacement_cost(
            annual_salary=respondent.annual_salary_eur,
            role_level=respondent.role_level or "specialist",
        )
        replacement_cost_eur = rc["cost_per_employee"]

    # UWES score (retention only)
    uwes_score: float | None = None
    if payload.uwes_raw:
        vals = [float(v) for v in payload.uwes_raw.values()]
        if vals:
            uwes_score = round(sum(vals) / len(vals), 2)

    # Turnover intention score (retention only)
    ti_score: float | None = None
    if payload.turnover_intention_raw:
        vals = [float(v) for v in payload.turnover_intention_raw.values()]
        if vals:
            ti_score = round(sum(vals) / len(vals), 2)

    # Open text — anonymise then optionally enrich
    open_text_clean: str | None = None
    open_text_analysis: str | None = None
    if payload.open_text:
        open_text_clean = anonymize_text(payload.open_text)
        if _openai_available and open_text_clean:
            open_text_analysis = _enrich_open_text(open_text_clean)

    # Recommendations
    recommendations = get_recommendations(risk_result["factor_risks"])

    # Build full result for storage
    full_result = {
        "sdt_scores":            sdt_scores,
        "org_scores":            org_scores,
        "risk_result":           risk_result,
        "preventability_result": preventability_result,
        "recommendations":       recommendations,
        "uwes_score":            uwes_score,
        "turnover_intention_score": ti_score,
    }

    # --- Persist ---
    response_row = SurveyResponse(
        respondent_id         = respondent.id,
        tenure_years          = payload.tenure_years,
        exit_reason_category  = payload.exit_reason_category,
        exit_reason_code      = exit_reason_code,
        stay_intent_score     = payload.stay_intent_score,
        sdt_raw               = payload.sdt_raw,
        sdt_scores            = sdt_scores,
        org_raw               = payload.org_raw,
        org_scores            = org_scores,
        pull_factors_raw      = payload.pull_factors_raw,
        open_text_raw         = open_text_clean,
        open_text_analysis    = open_text_analysis,
        uwes_raw              = payload.uwes_raw,
        uwes_score            = uwes_score,
        turnover_intention_raw   = payload.turnover_intention_raw,
        turnover_intention_score = ti_score,
        risk_score            = risk_result["risk_score"],
        risk_band             = risk_result["risk_band"],
        preventability        = preventability_result.get("preventability"),
        replacement_cost_eur  = replacement_cost_eur,
        full_result           = full_result,
        scoring_version       = SCORING_VERSION,
    )

    # AVG data minimalisatie: jaarlijks salaris is niet langer nodig na scoring.
    # De replacement_cost_eur is berekend en opgeslagen; het bronsalaris wordt verwijderd.
    if respondent.annual_salary_eur is not None:
        respondent.annual_salary_eur = None

    db.add(response_row)

    respondent.completed    = True
    respondent.completed_at = datetime.now(timezone.utc)
    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        sentry_sdk.capture_exception(exc, extras={
            "campaign_id": str(respondent.campaign_id),
            "flow": "survey_persist",
        })
        raise HTTPException(status_code=500, detail="Opslaan van survey-antwoorden mislukt. Probeer opnieuw.")

    # Stuur notificatie naar HR-beheerder van de organisatie
    try:
        campaign_obj = respondent.campaign
        org = campaign_obj.organization
        total_completed = sum(1 for r in campaign_obj.respondents if r.completed)
        total_invited   = len(campaign_obj.respondents)
        send_hr_notification(
            to_email        = org.contact_email,
            campaign_name   = campaign_obj.name,
            campaign_id     = campaign_obj.id,
            total_completed = total_completed,
            total_invited   = total_invited,
        )
    except Exception as exc:
        # Notificatie-fout mag nooit de survey-response blokkeren,
        # maar moet wel zichtbaar zijn in Sentry.
        import logging
        logging.getLogger(__name__).warning("HR-notificatie mislukt: %s", exc)
        sentry_sdk.capture_message(
            f"HR-notificatie mislukt na survey-submit: {exc}",
            level="warning",
            extras={"campaign_id": str(respondent.campaign_id)},
        )

    return {"status": "ok", "message": "Bedankt voor het invullen van de survey."}


# ---------------------------------------------------------------------------
# Organisation management
# ---------------------------------------------------------------------------

@app.post("/api/organizations", response_model=OrganizationRead, status_code=201)
async def create_organization(
    body: OrganizationCreate,
    db: Session = Depends(get_db),
) -> Organization:
    existing = db.query(Organization).filter(Organization.slug == body.slug).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Slug '{body.slug}' al in gebruik.")

    org = Organization(
        name=body.name,
        slug=body.slug,
        contact_email=body.contact_email,
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@app.get("/api/organizations/{slug}", response_model=OrganizationRead)
async def get_organization(slug: str, db: Session = Depends(get_db)) -> Organization:
    org = db.query(Organization).filter(Organization.slug == slug).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisatie niet gevonden.")
    return org


# ---------------------------------------------------------------------------
# Campaign management
# ---------------------------------------------------------------------------

def _get_org_by_api_key(api_key: str, db: Session) -> Organization:
    org = db.query(Organization).filter(Organization.api_key == api_key).first()
    if not org:
        raise HTTPException(status_code=401, detail="Ongeldige API-sleutel.")
    if not org.is_active:
        raise HTTPException(status_code=403, detail="Organisatie is inactief.")
    return org


@app.post("/api/campaigns", response_model=CampaignRead, status_code=201)
async def create_campaign(
    body: CampaignCreate,
    x_api_key: Annotated[str, Header()],
    db: Session = Depends(get_db),
) -> Campaign:
    org = _get_org_by_api_key(x_api_key, db)
    campaign = Campaign(
        organization_id=org.id,
        name=body.name,
        scan_type=body.scan_type,
        enabled_modules=body.enabled_modules,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@app.get("/api/campaigns", response_model=list[CampaignRead])
async def list_campaigns(
    x_api_key: Annotated[str, Header()],
    db: Session = Depends(get_db),
) -> list[Campaign]:
    org = _get_org_by_api_key(x_api_key, db)
    return db.query(Campaign).filter(Campaign.organization_id == org.id).all()


# ---------------------------------------------------------------------------
# Respondent management
# ---------------------------------------------------------------------------

@app.post("/api/campaigns/{campaign_id}/respondents", response_model=list[RespondentRead], status_code=201)
async def add_respondents(
    campaign_id: str,
    body: RespondentBatchCreate,
    x_api_key: Annotated[str, Header()],
    db: Session = Depends(get_db),
) -> list[Respondent]:
    org = _get_org_by_api_key(x_api_key, db)
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.organization_id == org.id,
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign niet gevonden.")

    from datetime import timezone as _tz
    _expires = datetime.now(timezone.utc).replace(tzinfo=None)

    respondents = [
        Respondent(
            campaign_id       = campaign.id,
            department        = r.department,
            role_level        = r.role_level,
            annual_salary_eur = r.annual_salary_eur,
            email             = r.email,
        )
        for r in body.respondents
    ]
    db.add_all(respondents)
    db.commit()
    for r in respondents:
        db.refresh(r)

    # Stuur uitnodigingsmails indien gewenst
    if body.send_invites:
        for respondent, req in zip(respondents, body.respondents):
            if req.email:
                sent = send_survey_invite(
                    to_email=req.email,
                    campaign_name=campaign.name,
                    token=respondent.token,
                    scan_type=campaign.scan_type,
                )
                if sent:
                    respondent.sent_at = datetime.now(timezone.utc)
        db.commit()

    return respondents


@app.get("/api/campaigns/{campaign_id}/respondents", response_model=list[RespondentRead])
async def list_respondents(
    campaign_id: str,
    x_api_key: Annotated[str, Header()],
    db: Session = Depends(get_db),
) -> list[Respondent]:
    org = _get_org_by_api_key(x_api_key, db)
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.organization_id == org.id,
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign niet gevonden.")
    return campaign.respondents


@app.post("/api/campaigns/{campaign_id}/send-invites", response_model=InviteSendResult)
async def send_invites(
    campaign_id: str,
    body: list[SendInviteItem],
    x_api_key: Annotated[str, Header()],
    db: Session = Depends(get_db),
) -> InviteSendResult:
    """
    Stuur uitnodigingsmails naar een lijst van {token, email} paren.
    Wordt aangeroepen vanuit het dashboard direct na het aanmaken van respondenten.
    Vereist een geldige organisatie-API-key; opgeslagen respondentdata blijft leidend.
    """
    org = _get_org_by_api_key(x_api_key, db)
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.organization_id == org.id,
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign niet gevonden.")

    sent = 0
    failed = 0
    skipped = 0

    for item in body:
        respondent = db.query(Respondent).filter(
            Respondent.token == item.token,
            Respondent.campaign_id == campaign_id,
        ).first()

        if not respondent or not respondent.email:
            failed += 1
            continue

        if item.email and item.email != respondent.email:
            skipped += 1
            continue

        ok = send_survey_invite(
            to_email=respondent.email,
            campaign_name=campaign.name,
            token=item.token,
            scan_type=campaign.scan_type,
        )

        if ok:
            respondent.sent_at = datetime.now(timezone.utc)
            sent += 1
        else:
            failed += 1
            sentry_sdk.capture_message(
                "Survey-uitnodiging kon niet worden verzonden",
                level="warning",
                extras={
                    "campaign_id": campaign_id,
                    "flow": "send_invites",
                },
            )

    if sent > 0:
        db.commit()

    if failed > 0 and sent == 0:
        # Alle mails mislukt — escaleer naar error
        sentry_sdk.capture_message(
            f"Alle {failed} uitnodigingen mislukt voor campaign {campaign_id}",
            level="error",
            extras={"campaign_id": campaign_id, "flow": "send_invites_total_failure"},
        )

    return InviteSendResult(sent=sent, failed=failed, skipped=skipped)


# ---------------------------------------------------------------------------
# Campaign lifecycle management
# ---------------------------------------------------------------------------
# Sluit-actie en herinnerings-actie zijn verplaatst naar Next.js server actions.
# Sluiten gaat direct via Supabase (RLS bewaakt schrijftoegang).
# Heruitzenden gaat via /api/campaigns/{id}/send-invites na auth-check in server action.
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Campaign stats / dashboard data
# ---------------------------------------------------------------------------

@app.get("/api/campaigns/{campaign_id}/stats", response_model=CampaignStats)
async def campaign_stats(
    campaign_id: str,
    x_api_key: Annotated[str, Header()],
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    org = _get_org_by_api_key(x_api_key, db)
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.organization_id == org.id,
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign niet gevonden.")

    respondents = campaign.respondents
    completed   = [r for r in respondents if r.completed]
    total       = len(respondents)
    n_completed = len(completed)

    responses: list[SurveyResponse] = [r.response for r in completed if r.response]

    # Risk distribution
    band_dist: dict[str, int] = {"HOOG": 0, "MIDDEN": 0, "LAAG": 0}
    risk_scores: list[float]  = []
    for resp in responses:
        if resp.risk_band in band_dist:
            band_dist[resp.risk_band] += 1
        if resp.risk_score is not None:
            risk_scores.append(resp.risk_score)

    avg_risk = round(sum(risk_scores) / len(risk_scores), 2) if risk_scores else None

    # Pattern detection input
    pattern_input = [
        {
            "org_scores":         resp.org_scores,
            "sdt_scores":         resp.sdt_scores,
            "risk_score":         resp.risk_score,
            "preventability":     resp.preventability,
            "exit_reason_code":   resp.exit_reason_code,
            "department":         resp.respondent.department,
            "role_level":         resp.respondent.role_level,
        }
        for resp in responses
    ]
    pattern_report = detect_patterns(pattern_input) if pattern_input else None

    return {
        "campaign_id":              campaign.id,
        "campaign_name":            campaign.name,
        "scan_type":                campaign.scan_type,
        "total_invited":            total,
        "total_completed":          n_completed,
        "completion_rate_pct":      round(n_completed / total * 100, 1) if total > 0 else 0.0,
        "avg_risk_score":           avg_risk,
        "risk_band_distribution":   band_dist,
        "pattern_report":           pattern_report,
    }


# ---------------------------------------------------------------------------
# PDF-rapport
# ---------------------------------------------------------------------------

@app.get("/api/campaigns/{campaign_id}/report")
async def download_report(
    campaign_id: str,
    x_api_key: Annotated[str, Header()],
    db: Session = Depends(get_db),
) -> Response:
    """Genereer en download een PDF-rapport voor de campaign."""
    org = _get_org_by_api_key(x_api_key, db)
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.organization_id == org.id,
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign niet gevonden.")

    try:
        from backend.report import generate_campaign_report
        pdf_bytes = generate_campaign_report(campaign_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF-generatie mislukt: {e}")

    filename = f"Verisight_{campaign.name.replace(' ', '_')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------------------------------------------------------------------------
# Open text enrichment (internal helper)
# ---------------------------------------------------------------------------

def _enrich_open_text(text: str) -> str | None:
    """Call OpenAI GPT-4o to extract themes from anonymised open text."""
    if not _openai_available or not _openai_client:
        return None

    prompt = (
        "Je bent een HR-analist. Analyseer de volgende anonieme toelichting van een "
        "medewerker en identificeer maximaal 3 concrete thema's of verbeterpunten. "
        "Geef een beknopte, professionele samenvatting in het Nederlands (max 100 woorden). "
        "Vermeld GEEN namen, persoonlijke gegevens of herleidbare informatie.\n\n"
        f"Toelichting:\n{text}"
    )

    for attempt in range(3):
        try:
            resp = _openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.3,
            )
            return resp.choices[0].message.content.strip()
        except Exception:
            import time
            time.sleep(2 ** attempt)

    return None
