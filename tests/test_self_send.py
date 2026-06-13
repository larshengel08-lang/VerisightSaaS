from __future__ import annotations

from datetime import date, datetime, timezone

from backend.models import Campaign, Organization, OrganizationSecret, Respondent
from backend.self_send import due_reminders, hash_dedup_key, resolve_reminder_date


def test_hash_dedup_key_is_stable_and_hex_sha256():
    h1 = hash_dedup_key("abc-123")
    h2 = hash_dedup_key("abc-123")
    assert h1 == h2
    assert len(h1) == 64
    assert hash_dedup_key("") == ""  # empty key never matches


def test_resolve_relative_and_absolute_reminders():
    end = date(2026, 6, 20)
    assert resolve_reminder_date(
        {"kind": "relative", "daysBeforeEnd": 3, "date": None}, end
    ) == date(2026, 6, 17)
    assert resolve_reminder_date(
        {"kind": "absolute", "daysBeforeEnd": None, "date": "2026-06-18"}, end
    ) == date(2026, 6, 18)


def test_due_reminders_skips_notified_and_future():
    end = date(2026, 6, 20)
    reminders = [
        {"id": "a", "kind": "relative", "daysBeforeEnd": 3, "date": None, "notifiedAt": None},
        {"id": "b", "kind": "absolute", "daysBeforeEnd": None, "date": "2026-06-25", "notifiedAt": None},
        {"id": "c", "kind": "relative", "daysBeforeEnd": 7, "date": None, "notifiedAt": "2026-06-13T08:00:00Z"},
    ]
    due = due_reminders(reminders, end, date(2026, 6, 17))
    assert [r["id"] for r in due] == ["a"]


def _org_with_campaign(db_session):
    org = Organization(name="Acme BV", slug="acme-bv", contact_email="hr@acme.nl")
    db_session.add(org)
    db_session.flush()
    db_session.add(OrganizationSecret(org_id=org.id, api_key="key-1"))
    campaign = Campaign(
        organization_id=org.id, name="Exit Q2", scan_type="exit",
        delivery_mode="baseline", comms_mode="self_send", is_active=True,
    )
    db_session.add(campaign)
    db_session.commit()
    db_session.refresh(campaign)
    return org, campaign


def test_open_start_creates_one_respondent_then_blocks_completed_dedup_key(client, db_session):
    _, campaign = _org_with_campaign(db_session)
    token = campaign.public_survey_token

    # First start with dedup_key -> creates respondent, 303 to /survey/{token}
    r1 = client.post(
        f"/survey/open/{token}/start",
        data={"dedup_key": "device-uuid-1"},
        follow_redirects=False,
    )
    assert r1.status_code == 303
    respondent_token = r1.headers["location"].rsplit("/", 1)[-1]

    # Mark that respondent completed (simulates a finished survey)
    respondent = db_session.query(Respondent).filter(Respondent.token == respondent_token).one()
    respondent.completed = True
    db_session.commit()

    # Second start with the SAME dedup_key -> blocked (no new respondent), status page
    before = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).count()
    r2 = client.post(
        f"/survey/open/{token}/start",
        data={"dedup_key": "device-uuid-1"},
        follow_redirects=False,
    )
    after = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).count()
    assert after == before  # no new respondent created
    assert r2.status_code == 409


def test_open_start_without_dedup_key_still_works(client, db_session):
    _, campaign = _org_with_campaign(db_session)
    r = client.post(f"/survey/open/{campaign.public_survey_token}/start", follow_redirects=False)
    assert r.status_code == 303
