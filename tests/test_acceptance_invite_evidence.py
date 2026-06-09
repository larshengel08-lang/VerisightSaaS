from __future__ import annotations

from backend.email import EmailSendResult
from backend.models import Respondent

from tests.test_api_flows import _create_campaign, _create_org


def test_send_invites_returns_provider_evidence_for_acceptance_audit(client, db_session, monkeypatch) -> None:
    org = _create_org(db_session, api_key="acceptance-evidence-key")
    campaign = _create_campaign(db_session, org, name="ACPT Invite Evidence")
    respondent = Respondent(
        campaign_id=campaign.id,
        email="acceptance+001@example.com",
        department="Operations",
        role_level="specialist",
        exit_month="2026-05",
    )
    db_session.add(respondent)
    db_session.commit()
    db_session.refresh(respondent)

    monkeypatch.setattr(
        "backend.main.send_survey_invite_result",
        lambda **kwargs: EmailSendResult(
            ok=True,
            provider="resend",
            provider_email_id="email_123",
            provider_message_id="message_123",
        ),
    )

    response = client.post(
        f"/api/campaigns/{campaign.id}/send-invites",
        headers={"x-api-key": "acceptance-evidence-key"},
        json=[{"token": str(respondent.token), "email": respondent.email}],
    )

    assert response.status_code == 200
    body = response.json()
    assert body["sent"] == 1
    assert body["failed"] == 0
    assert body["skipped"] == 0
    assert body["evidence"] == [
        {
            "token": str(respondent.token),
            "email": "acceptance+001@example.com",
            "status": "sent",
            "invite_url": f"http://localhost:8000/survey/{respondent.token}",
            "provider": "resend",
            "provider_email_id": "email_123",
            "provider_message_id": "message_123",
            "failure_reason": None,
        }
    ]


def test_import_respondents_surfaces_invite_evidence_when_send_invites_is_enabled(client, db_session, monkeypatch) -> None:
    org = _create_org(db_session, name="Import Org", slug="import-org", api_key="import-org-key")
    campaign = _create_campaign(db_session, org, name="ACPT Import Evidence")

    monkeypatch.setattr(
        "backend.main.send_survey_invite_result",
        lambda **kwargs: EmailSendResult(
            ok=True,
            provider="resend",
            provider_email_id="email_456",
            provider_message_id="message_456",
        ),
    )

    files = {
        "upload": ("acceptance.csv", b"email,department,role_level,exit_month\nacceptance+002@example.com,People,specialist,2026-05\n", "text/csv"),
    }
    response = client.post(
        f"/api/campaigns/{campaign.id}/respondents/import",
        headers={"x-api-key": "import-org-key"},
        files=files,
        data={"dry_run": "false", "send_invites": "true"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["imported"] == 1
    assert body["emails_sent"] == 1
    assert body["invite_evidence"][0]["provider_email_id"] == "email_456"
    assert body["invite_evidence"][0]["provider_message_id"] == "message_456"
