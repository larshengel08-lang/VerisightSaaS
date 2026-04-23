from __future__ import annotations

import pytest

from backend import email as email_module


def test_acceptance_email_stub_marks_invite_as_sent(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("VERISIGHT_ACCEPTANCE_FAKE_EMAIL", "1")
    monkeypatch.setattr(email_module, "_EMAIL_FROM", "Verisight <noreply@verisight.nl>")

    assert email_module.send_survey_invite(
        to_email="guided-self-serve.acceptance@demo.verisight.local",
        campaign_name="Guided Self-Serve - Setup Journey",
        token="demo-token",
        scan_type="exit",
    )
