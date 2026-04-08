"""
Verisight — E-mailmodule (Resend)
==================================
Verzendt uitnodigings- en notificatiemails via Resend.
Stel RESEND_API_KEY en EMAIL_FROM in als environment variables.

Zonder RESEND_API_KEY worden mails niet verzonden maar gelogd —
zo werkt lokale development zonder configuratie.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

logger = logging.getLogger(__name__)

_RESEND_API_KEY  = os.getenv("RESEND_API_KEY", "")
_EMAIL_FROM      = os.getenv("EMAIL_FROM", "Verisight <noreply@verisight.nl>")
_FRONTEND_URL    = os.getenv("FRONTEND_URL", "http://localhost:3000")
_BACKEND_URL     = os.getenv("BACKEND_URL", "http://localhost:8000")

try:
    import resend as _resend
    _resend.api_key = _RESEND_API_KEY
    _RESEND_AVAILABLE = bool(_RESEND_API_KEY)
except ImportError:
    _resend = None           # type: ignore
    _RESEND_AVAILABLE = False


# ---------------------------------------------------------------------------
# Interne helper
# ---------------------------------------------------------------------------

def _send(*, to: str, subject: str, html: str) -> bool:
    """Verstuur één e-mail. Retourneert True bij succes."""
    if not _RESEND_AVAILABLE:
        print(f"[EMAIL] NIET verzonden — geen RESEND_API_KEY. Aan: {to} | Onderwerp: {subject}", flush=True)
        logger.info("E-mail NIET verzonden (geen RESEND_API_KEY). Aan: %s | Onderwerp: %s", to, subject)
        return False
    try:
        print(f"[EMAIL] Versturen naar {to} via {_EMAIL_FROM} ...", flush=True)
        result = _resend.Emails.send({
            "from":    _EMAIL_FROM,
            "to":      [to],
            "subject": subject,
            "html":    html,
        })
        print(f"[EMAIL] Succes: {result}", flush=True)
        logger.info("E-mail verzonden naar %s: %s", to, subject)
        return True
    except Exception as exc:
        print(f"[EMAIL] FOUT bij verzenden naar {to}: {exc}", flush=True)
        logger.error("E-mail verzending mislukt naar %s: %s", to, exc)
        return False


# ---------------------------------------------------------------------------
# Survey-uitnodiging
# ---------------------------------------------------------------------------

def send_survey_invite(
    *,
    to_email: str,
    campaign_name: str,
    token: str,
    scan_type: str = "exit",
) -> bool:
    """Stuur een uitnodigingsmail met de survey-link naar een respondent."""
    survey_url = f"{_BACKEND_URL}/survey/{token}"

    intro = (
        "Je leidinggevende of HR-afdeling nodigt je uit om een korte vragenlijst in te vullen "
        "over jouw ervaringen binnen de organisatie. Dit helpt de organisatie concreet te verbeteren."
        if scan_type == "exit" else
        "Je leidinggevende of HR-afdeling nodigt je uit om een korte vragenlijst in te vullen "
        "over jouw werkbeleving. Jouw input is waardevol en wordt vertrouwelijk behandeld."
    )

    duration = "8–12 minuten" if scan_type == "exit" else "6–10 minuten"

    html = f"""
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#1E3A5F;padding:28px 36px;">
            <span style="color:#FFFFFF;font-size:20px;font-weight:700;letter-spacing:-0.5px;">Verisight</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px;">
            <h1 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 16px;">{campaign_name}</h1>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">{intro}</p>

            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="background:#EFF6FF;border-radius:8px;padding:14px 20px;">
                  <span style="font-size:13px;color:#1D4ED8;font-weight:600;">⏱ Duur: {duration}</span>
                  &nbsp;&nbsp;
                  <span style="font-size:13px;color:#1D4ED8;font-weight:600;">🔒 Vertrouwelijk</span>
                  &nbsp;&nbsp;
                  <span style="font-size:13px;color:#1D4ED8;font-weight:600;">📱 Werkt op mobiel</span>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:#2563EB;border-radius:8px;">
                  <a href="{survey_url}"
                     style="display:inline-block;padding:14px 32px;color:#FFFFFF;font-size:15px;
                            font-weight:600;text-decoration:none;">
                    Vragenlijst invullen →
                  </a>
                </td>
              </tr>
            </table>

            <p style="font-size:13px;color:#6B7280;margin:0 0 8px;">
              Werkt de knop niet? Kopieer en plak deze link in je browser:
            </p>
            <p style="font-size:12px;color:#9CA3AF;word-break:break-all;margin:0 0 28px;">
              {survey_url}
            </p>

            <hr style="border:none;border-top:1px solid #F3F4F6;margin:0 0 24px;" />

            <p style="font-size:12px;color:#9CA3AF;line-height:1.6;margin:0;">
              Je antwoorden worden vertrouwelijk behandeld en zijn alleen inzichtelijk voor
              geautoriseerde HR-medewerkers van jouw organisatie, geaggregeerd op groepsniveau.
              Je kunt deelname altijd weigeren door deze e-mail te negeren.
              De link is 90 dagen geldig.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F9FAFB;padding:20px 36px;border-top:1px solid #F3F4F6;">
            <p style="font-size:11px;color:#9CA3AF;margin:0 0 6px;">
              Aangeboden door <strong>Verisight</strong> · HR-verloopanalyse ·
              Gehost in Europa · AVG-conform verwerking
            </p>
            <p style="font-size:11px;color:#D1D5DB;margin:0;">
              Wil je geen uitnodigingen meer ontvangen? Neem contact op met de HR-afdeling
              van je organisatie of stuur een e-mail naar
              <a href="mailto:privacy@verisight.nl" style="color:#D1D5DB;">privacy@verisight.nl</a>.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""

    return _send(
        to=to_email,
        subject=f"Uitnodiging: {campaign_name}",
        html=html,
    )


# ---------------------------------------------------------------------------
# Survey-herinnering (voor respondenten die nog niet hebben ingevuld)
# ---------------------------------------------------------------------------

def send_survey_reminder(
    *,
    to_email: str,
    campaign_name: str,
    token: str,
    scan_type: str = "exit",
) -> bool:
    """Stuur een herinneringsmail naar een respondent die de survey nog niet heeft ingevuld."""
    survey_url = f"{_BACKEND_URL}/survey/{token}"

    duration = "8–12 minuten" if scan_type == "exit" else "6–10 minuten"

    html = f"""
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#1E3A5F;padding:28px 36px;">
            <span style="color:#FFFFFF;font-size:20px;font-weight:700;letter-spacing:-0.5px;">Verisight</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px;">
            <p style="font-size:12px;color:#6B7280;font-weight:600;text-transform:uppercase;
                       letter-spacing:.05em;margin:0 0 10px;">Herinnering</p>
            <h1 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 16px;">{campaign_name}</h1>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
              Onlangs ontvang je een uitnodiging voor deze vragenlijst. We willen je er vriendelijk
              aan herinneren dat je inbreng nog steeds welkom is — de link is nog actief.
            </p>

            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="background:#EFF6FF;border-radius:8px;padding:14px 20px;">
                  <span style="font-size:13px;color:#1D4ED8;font-weight:600;">⏱ Duur: {duration}</span>
                  &nbsp;&nbsp;
                  <span style="font-size:13px;color:#1D4ED8;font-weight:600;">🔒 Vertrouwelijk</span>
                  &nbsp;&nbsp;
                  <span style="font-size:13px;color:#1D4ED8;font-weight:600;">📱 Werkt op mobiel</span>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:#2563EB;border-radius:8px;">
                  <a href="{survey_url}"
                     style="display:inline-block;padding:14px 32px;color:#FFFFFF;font-size:15px;
                            font-weight:600;text-decoration:none;">
                    Vragenlijst invullen →
                  </a>
                </td>
              </tr>
            </table>

            <p style="font-size:13px;color:#6B7280;margin:0 0 8px;">
              Werkt de knop niet? Kopieer en plak deze link in je browser:
            </p>
            <p style="font-size:12px;color:#9CA3AF;word-break:break-all;margin:0 0 28px;">
              {survey_url}
            </p>

            <hr style="border:none;border-top:1px solid #F3F4F6;margin:0 0 24px;" />

            <p style="font-size:12px;color:#9CA3AF;line-height:1.6;margin:0;">
              Je antwoorden worden vertrouwelijk behandeld en zijn alleen inzichtelijk voor
              geautoriseerde HR-medewerkers van jouw organisatie, geaggregeerd op groepsniveau.
              Je kunt deelname altijd weigeren door deze e-mail te negeren.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F9FAFB;padding:20px 36px;border-top:1px solid #F3F4F6;">
            <p style="font-size:11px;color:#9CA3AF;margin:0 0 6px;">
              Aangeboden door <strong>Verisight</strong> · HR-verloopanalyse ·
              Gehost in Europa · AVG-conform verwerking
            </p>
            <p style="font-size:11px;color:#D1D5DB;margin:0;">
              Wil je geen uitnodigingen meer ontvangen? Neem contact op met de HR-afdeling
              van je organisatie of stuur een e-mail naar
              <a href="mailto:privacy@verisight.nl" style="color:#D1D5DB;">privacy@verisight.nl</a>.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""

    return _send(
        to=to_email,
        subject=f"Herinnering: {campaign_name} — jouw inbreng is nog welkom",
        html=html,
    )


# ---------------------------------------------------------------------------
# HR-notificatie bij ingevulde survey
# ---------------------------------------------------------------------------

def send_hr_notification(
    *,
    to_email: str,
    campaign_name: str,
    campaign_id: str,
    total_completed: int,
    total_invited: int,
) -> bool:
    """Notificeer de HR-beheerder dat een survey is ingevuld."""
    dashboard_url = f"{_FRONTEND_URL}/campaigns/{campaign_id}"
    completion_pct = round(total_completed / total_invited * 100) if total_invited else 0

    html = f"""
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;">
        <tr>
          <td style="background:#1E3A5F;padding:24px 32px;">
            <span style="color:#FFFFFF;font-size:18px;font-weight:700;">Verisight</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="font-size:13px;color:#6B7280;font-weight:600;text-transform:uppercase;
                       letter-spacing:.05em;margin:0 0 8px;">Nieuwe response ontvangen</p>
            <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 20px;">
              {campaign_name}
            </h1>

            <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
              <tr>
                <td style="background:#F0FDF4;border-radius:8px;padding:16px 20px;">
                  <span style="font-size:24px;font-weight:700;color:#16A34A;">{total_completed}</span>
                  <span style="font-size:13px;color:#16A34A;"> van {total_invited} ingevuld ({completion_pct}%)</span>
                </td>
              </tr>
            </table>

            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="background:#2563EB;border-radius:8px;">
                  <a href="{dashboard_url}"
                     style="display:inline-block;padding:12px 28px;color:#FFFFFF;
                            font-size:14px;font-weight:600;text-decoration:none;">
                    Bekijk dashboard →
                  </a>
                </td>
              </tr>
            </table>

            <p style="font-size:12px;color:#9CA3AF;margin:0;">
              Je ontvangt deze notificatie omdat je beheerder bent van deze campaign in Verisight.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#F9FAFB;padding:16px 32px;border-top:1px solid #F3F4F6;">
            <p style="font-size:11px;color:#9CA3AF;margin:0;">Verisight · HR-verloopanalyse</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
"""

    return _send(
        to=to_email,
        subject=f"✓ Nieuwe response: {campaign_name} ({total_completed}/{total_invited})",
        html=html,
    )
