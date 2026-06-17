"""
Loep - e-mailmodule (Resend)
=================================
Verzendt uitnodigings- en notificatiemails via Resend.
Stel RESEND_API_KEY en EMAIL_FROM in als environment variables.

Zonder RESEND_API_KEY worden mails niet verzonden maar gelogd.
Zo werkt lokale development zonder configuratie.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from html import escape
from pathlib import Path

from dotenv import load_dotenv
from backend.scan_definitions import get_scan_definition

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

logger = logging.getLogger(__name__)

_ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
_RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
_EMAIL_FROM = os.getenv("EMAIL_FROM", "Loep <noreply@verisight.nl>")
_CONTACT_EMAIL = os.getenv("CONTACT_EMAIL", "hallo@getloep.nl")
_FRONTEND_URL = os.getenv("FRONTEND_URL", "")
_BACKEND_URL = os.getenv("BACKEND_URL", "")
_EMAIL_TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates" / "emails"
_CONTACT_ROUTE_LABELS = {
    "exitscan": "ExitScan",
    "retentiescan": "RetentieScan",
    "culture_assessment": "Loep Culture Assessment",
    "teamscan": "TeamScan",
    "onboarding": "Onboarding 30-60-90",
    "leadership": "Leadership Scan",
    "combinatie": "Combinatie",
    "nog-onzeker": "Nog niet zeker",
}
_CONTACT_TIMING_LABELS = {
    "zo-snel-mogelijk": "Zo snel mogelijk",
    "deze-maand": "Deze maand",
    "dit-kwartaal": "Dit kwartaal",
    "orienterend": "Orienterend",
}

try:
    import resend as _resend

    _resend.api_key = _RESEND_API_KEY
    _RESEND_AVAILABLE = bool(_RESEND_API_KEY)
except ImportError:
    _resend = None  # type: ignore
    _RESEND_AVAILABLE = False


@dataclass(frozen=True)
class EmailSendResult:
    ok: bool
    reason: str | None = None
    provider: str | None = None
    provider_email_id: str | None = None
    provider_message_id: str | None = None


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


def _sanitize_error_reason(reason: str, *, max_length: int = 240) -> str:
    normalized = " ".join(str(reason).strip().split())
    if len(normalized) <= max_length:
        return normalized
    return normalized[: max_length - 3] + "..."


def _send_result(
    *,
    to: str,
    subject: str,
    html: str,
    reply_to: str | None = None,
) -> EmailSendResult:
    """Verstuur een e-mail en geef een diagnostisch resultaat terug."""
    safe_to = _mask_email(to)
    if not to:
        return EmailSendResult(ok=False, reason="missing_recipient")
    if not _EMAIL_FROM.strip():
        logger.warning("E-mail niet verzonden naar %s: EMAIL_FROM ontbreekt.", safe_to)
        return EmailSendResult(ok=False, reason="missing_email_from")
    if not _CONTACT_EMAIL.strip() and subject.startswith("Kennismakingsaanvraag"):
        logger.warning("E-mail niet verzonden naar %s: CONTACT_EMAIL ontbreekt.", safe_to)
        return EmailSendResult(ok=False, reason="missing_contact_email")
    if _resend is None:
        logger.warning("E-mail niet verzonden naar %s: resend package ontbreekt.", safe_to)
        return EmailSendResult(ok=False, reason="resend_import_missing")
    if not _RESEND_AVAILABLE:
        logger.info("E-mail niet verzonden naar %s: RESEND_API_KEY ontbreekt.", safe_to)
        return EmailSendResult(ok=False, reason="missing_resend_api_key")
    try:
        payload = {
            "from": _EMAIL_FROM,
            "to": [to],
            "subject": subject,
            "html": html,
        }
        if reply_to:
            payload["reply_to"] = reply_to

        response = _resend.Emails.send(payload)
        if not response:
            logger.warning("E-mailprovider gaf lege respons terug voor %s.", safe_to)
            return EmailSendResult(ok=False, reason="empty_provider_response", provider="resend")
        response_email_id = response.get("id") if isinstance(response, dict) else getattr(response, "id", None)
        response_message_id = (
            response.get("message_id") if isinstance(response, dict) else getattr(response, "message_id", None)
        )
        logger.info("E-mail verzonden naar %s", safe_to)
        return EmailSendResult(
            ok=True,
            provider="resend",
            provider_email_id=str(response_email_id) if response_email_id else None,
            provider_message_id=str(response_message_id) if response_message_id else None,
        )
    except Exception as exc:
        reason = _sanitize_error_reason(f"{exc.__class__.__name__}: {exc}")
        logger.error("E-mail verzending mislukt naar %s: %s", safe_to, reason)
        return EmailSendResult(ok=False, reason=f"provider_error: {reason}", provider="resend")


def _send(*, to: str, subject: str, html: str) -> bool:
    """Verstuur een e-mail. Retourneert True bij succes."""
    return _send_result(to=to, subject=subject, html=html).ok


def send_survey_invite(
    *,
    to_email: str,
    campaign_name: str,
    token: str,
    scan_type: str = "exit",
) -> bool:
    """Stuur een uitnodigingsmail met de survey-link naar een respondent."""
    return send_survey_invite_result(
        to_email=to_email,
        campaign_name=campaign_name,
        token=token,
        scan_type=scan_type,
    ).ok


def send_survey_invite_result(
    *,
    to_email: str,
    campaign_name: str,
    token: str,
    scan_type: str = "exit",
) -> EmailSendResult:
    survey_url = f"{_require_runtime_url(_BACKEND_URL, 'BACKEND_URL')}/survey/{token}"
    scan = get_scan_definition(scan_type)
    html = _render_email_template(
        "uitnodiging.html",
        campaign_name=campaign_name,
        intro=scan["invite_intro"],
        duration=scan["invite_duration"],
        survey_url=survey_url,
    )

    return _send_result(
        to=to_email,
        subject=f"Uitnodiging {scan['product_name']}: {campaign_name}",
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
    scan = get_scan_definition(scan_type)

    html = _render_email_template(
        "herinnering.html",
        campaign_name=campaign_name,
        duration=scan["invite_duration"],
        survey_url=survey_url,
    )

    return _send(
        to=to_email,
        subject=f"Herinnering {scan['product_name']}: {campaign_name}",
        html=html,
    )


def send_contact_request(
    *,
    name: str,
    work_email: str,
    organization: str,
    employee_count: str,
    route_interest: str,
    cta_source: str,
    desired_timing: str,
    current_question: str,
) -> bool:
    return send_contact_request_result(
        name=name,
        work_email=work_email,
        organization=organization,
        employee_count=employee_count,
        route_interest=route_interest,
        cta_source=cta_source,
        desired_timing=desired_timing,
        current_question=current_question,
    ).ok


def send_contact_request_result(
    *,
    name: str,
    work_email: str,
    organization: str,
    employee_count: str,
    route_interest: str,
    cta_source: str,
    desired_timing: str,
    current_question: str,
) -> EmailSendResult:
    """Stuur een contactaanvraag vanaf de marketing-site naar het interne inboxadres."""
    if not _CONTACT_EMAIL.strip():
        logger.warning("Contactaanvraag-mail niet verzonden: CONTACT_EMAIL ontbreekt.")
        return EmailSendResult(ok=False, reason="missing_contact_email")

    html = _render_email_template(
        "contact_request.html",
        name=name,
        work_email=work_email,
        organization=organization,
        employee_count=employee_count,
        route_interest_label=_CONTACT_ROUTE_LABELS.get(route_interest, route_interest),
        desired_timing_label=_CONTACT_TIMING_LABELS.get(desired_timing, desired_timing),
        cta_source=cta_source,
        current_question=current_question,
    )

    return _send_result(
        to=_CONTACT_EMAIL,
        subject=f"Kennismakingsaanvraag Loep - {organization}",
        html=html,
        reply_to=work_email,
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


def send_reminder_day_notice(
    *,
    to_email: str,
    campaign_name: str,
    campaign_id: str,
    reminder_label: str,
) -> EmailSendResult:
    """Operationele nudge naar de HR-beheerder op de geplande reminderdag.

    Stuurt NOOIT naar respondenten — alleen naar de bekende beheerder.
    """
    dashboard_url = f"{_require_runtime_url(_FRONTEND_URL, 'FRONTEND_URL')}/campaigns/{campaign_id}/beheer"
    html = _render_email_template(
        "reminder_day.html",
        campaign_name=campaign_name,
        reminder_label=reminder_label,
        dashboard_url=dashboard_url,
    )
    return _send_result(
        to=to_email,
        subject=f"Reminderdag vandaag: {campaign_name}",
        html=html,
    )


def send_manager_results_notification(
    *,
    to_email: str | None,
    manager_name: str | None,
    campaign_name: str,
    scope_label: str,
    action_center_url: str | None = None,
    action_center_path: str | None = None,
    response_count: int | None = None,
) -> EmailSendResult:
    """Notificeer een toegewezen manager dat een Action Center-route leesbaar is."""
    resolved_url = action_center_url
    if not resolved_url:
        base_url = _require_runtime_url(_FRONTEND_URL, "FRONTEND_URL")
        normalized_path = action_center_path or "/action-center"
        if not normalized_path.startswith("/"):
            normalized_path = f"/{normalized_path}"
        resolved_url = f"{base_url}{normalized_path}"

    safe_manager_name = (manager_name or "").strip() or "manager"
    safe_scope_label = scope_label.strip() or "jouw scope"
    response_html = (
        f"""
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#42556b;">
          Beschikbare responses in deze read: <strong>{int(response_count)}</strong>
        </p>
        """
        if isinstance(response_count, int) and response_count >= 0
        else ""
    )
    html = f"""
    <div style="font-family:Arial,sans-serif;background:#f7f2ea;padding:32px;color:#132033;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e6ddd2;border-radius:24px;padding:32px;">
        <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8b8174;">
          Action Center
        </p>
        <h1 style="margin:0 0 18px 0;font-size:30px;line-height:1.15;color:#132033;">
          Resultaten beschikbaar voor jouw team
        </h1>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#42556b;">
          Hallo {escape(safe_manager_name)},
        </p>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#42556b;">
          Voor <strong>{escape(campaign_name)}</strong> is er nu een leesbare en opvolgbare route beschikbaar
          voor <strong>{escape(safe_scope_label)}</strong>.
        </p>
        {response_html}
        <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#42556b;">
          Open direct de relevante route in Action Center om de eerste bounded vervolgstap en het reviewmoment
          vast te leggen.
        </p>
        <a
          href="{escape(resolved_url, quote=True)}"
          style="display:inline-block;border-radius:999px;background:#132033;color:#ffffff;text-decoration:none;padding:14px 20px;font-weight:700;"
        >
          Open Action Center
        </a>
      </div>
    </div>
    """

    return _send_result(
        to=to_email or "",
        subject=f"Resultaten beschikbaar voor jouw team - {campaign_name}",
        html=html,
    )
