from __future__ import annotations

import pytest

from backend.email import EmailSendResult, send_manager_results_notification


def test_send_manager_results_notification_skips_when_manager_email_missing() -> None:
    result = send_manager_results_notification(
        to_email=None,
        manager_name="Sanne",
        campaign_name="Retentie voorjaar",
        scope_label="Operations",
        action_center_url="https://app.verisight.nl/action-center?focus=route-1",
        response_count=12,
    )

    assert result.ok is False
    assert result.reason == "missing_recipient"


def test_send_manager_results_notification_uses_expected_subject_and_body(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    captured: dict[str, str] = {}

    def _fake_send_result(*, to: str, subject: str, html: str, reply_to: str | None = None) -> EmailSendResult:
        captured["to"] = to
        captured["subject"] = subject
        captured["html"] = html
        return EmailSendResult(ok=True)

    monkeypatch.setattr("backend.email._send_result", _fake_send_result)

    result = send_manager_results_notification(
        to_email="manager@example.com",
        manager_name="Sanne",
        campaign_name="Retentie voorjaar",
        scope_label="Operations",
        action_center_url="https://app.verisight.nl/action-center?focus=route-1",
        response_count=12,
    )

    assert result.ok is True
    assert captured["to"] == "manager@example.com"
    assert captured["subject"] == "Resultaten beschikbaar voor jouw team - Retentie voorjaar"
    assert "Sanne" in captured["html"]
    assert "Retentie voorjaar" in captured["html"]
    assert "Operations" in captured["html"]
    assert "12" in captured["html"]
    assert "https://app.verisight.nl/action-center?focus=route-1" in captured["html"]
