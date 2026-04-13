"""
Verisight - e-mailmodule (Resend)
=================================
Verzendt uitnodigings- en notificatiemails via Resend.
Stel RESEND_API_KEY en EMAIL_FROM in als environment variables.

Zonder RESEND_API_KEY worden mails niet verzonden maar gelogd.
Zo werkt lokale development zonder configuratie.
"""

from __future__ import annotations

import logging
import os
from html import escape
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

logger = logging.getLogger(__name__)

_ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
_RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
_EMAIL_FROM = os.getenv("EMAIL_FROM", "Verisight <noreply@verisight.nl>")
_CONTACT_EMAIL = os.getenv("CONTACT_EMAIL", "hallo@verisight.nl")
_FRONTEND_URL = os.getenv("FRONTEND_URL", "")
_BACKEND_URL = os.getenv("BACKEND_URL", "")
_EMAIL_TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates" / "emails"

try:
    import resend as _resend

    _resend.api_key = _RESEND_API_KEY
    _RESEND_AVAILABLE = bool(_RESEND_API_KEY)
except ImportError:
    _resend = None  # type: ignore
    _RESEND_AVAILABLE = False


def _mask_email(address: str) -> str:
    if "@" not in address:
        return "[redacted]"
    local, domain = address.split("@", 1)
    if len(local) <= 2:
        masked_local = "*" * len(local)
    else:
        masked_local = f"{local[0]}***{local[-1]}"
    return f"{masked_local}@{domain}"


def _require_runtime_url(value: str, env_name: str) -> str:
    if value:
        return value.rstrip("/")
    if _ENVIRONMENT == "production":
        raise RuntimeError(f"{env_name} ontbreekt in productie.")
    return "http://localhost:3000" if env_name == "FRONTEND_URL" else "http://localhost:8000"


def _render_email_template(template_name: str, **context: str | int) -> str:
    template = (_EMAIL_TEMPLATE_DIR / template_name).read_text(encoding="utf-8")
    safe_context = {
        key: escape(str(value), quote=True)
        for key, value in context.items()
    }
    return template.format_map(safe_context)


def _send(*, to: str, subject: str, html: str) -> bool:
    """Verstuur een e-mail. Retourneert True bij succes."""
    safe_to = _mask_email(to)
    if not _RESEND_AVAILABLE:
        logger.info("E-mail niet verzonden (geen RESEND_API_KEY). Aan: %s", safe_to)
        return False
    try:
        _resend.Emails.send({
            "from": _EMAIL_FROM,
            "to": [to],
            "subject": subject,
            "html": html,
        })
        logger.info("E-mail verzonden naar %s", safe_to)
        return True
    except Exception as exc:
        logger.error("E-mail verzending mislukt naar %s: %s", safe_to, exc)
        return False


def send_survey_invite(
    *,
    to_email: str,
    campaign_name: str,
    token: str,
    scan_type: str = "exit",
) -> bool:
    """Stuur een uitnodigingsmail met de survey-link naar een respondent."""
    survey_url = f"{_require_runtime_url(_BACKEND_URL, 'BACKEND_URL')}/survey/{token}"

    intro = (
        "Je leidinggevende of HR-afdeling nodigt je uit om een korte vragenlijst in te vullen "
        "over jouw ervaringen binnen de organisatie. Dit helpt de organisatie concreet te verbeteren."
        if scan_type == "exit"
        else "Je leidinggevende of HR-afdeling nodigt je uit om een korte vragenlijst in te vullen "
        "over jouw werkbeleving. Jouw input is waardevol en wordt vertrouwelijk behandeld."
    )

    duration = "8-12 minuten" if scan_type == "exit" else "6-10 minuten"
    html = _render_email_template(
        "uitnodiging.html",
        campaign_name=campaign_name,
        intro=intro,
        duration=duration,
        survey_url=survey_url,
    )

    return _send(
        to=to_email,
        subject=f"Uitnodiging: {campaign_name}",
        html=html,
    )


def send_survey_reminder(
    *,
    to_email: str,
    campaign_name: str,
    token: str,
    scan_type: str = "exit",
) -> bool:
    """Stuur een herinneringsmail naar een respondent die de survey nog niet heeft ingevuld."""
    survey_url = f"{_require_runtime_url(_BACKEND_URL, 'BACKEND_URL')}/survey/{token}"
    duration = "8-12 minuten" if scan_type == "exit" else "6-10 minuten"

    html = _render_email_template(
        "herinnering.html",
        campaign_name=campaign_name,
        duration=duration,
        survey_url=survey_url,
    )

    return _send(
        to=to_email,
        subject=f"Herinnering: {campaign_name} - jouw inbreng is nog welkom",
        html=html,
    )


def send_contact_request(
    *,
    name: str,
    work_email: str,
    organization: str,
    employee_count: str,
    current_question: str,
) -> bool:
    """Stuur een contactaanvraag vanaf de marketing-site naar het interne inboxadres."""
    html = _render_email_template(
        "contact_request.html",
        name=name,
        work_email=work_email,
        organization=organization,
        employee_count=employee_count,
        current_question=current_question,
    )

    return _send(
        to=_CONTACT_EMAIL,
        subject=f"Kennismakingsaanvraag ExitScan - {organization}",
        html=html,
    )


def send_hr_notification(
    *,
    to_email: str,
    campaign_name: str,
    campaign_id: str,
    total_completed: int,
    total_invited: int,
) -> bool:
    """Notificeer de HR-beheerder dat een survey is ingevuld."""
    dashboard_url = f"{_require_runtime_url(_FRONTEND_URL, 'FRONTEND_URL')}/campaigns/{campaign_id}"
    completion_pct = round(total_completed / total_invited * 100) if total_invited else 0

    html = _render_email_template(
        "hr_notification.html",
        campaign_name=campaign_name,
        dashboard_url=dashboard_url,
        total_completed=total_completed,
        total_invited=total_invited,
        completion_pct=completion_pct,
    )

    return _send(
        to=to_email,
        subject=f"Nieuwe response: {campaign_name} ({total_completed}/{total_invited})",
        html=html,
    )
