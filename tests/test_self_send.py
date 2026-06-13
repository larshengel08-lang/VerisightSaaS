from __future__ import annotations

from datetime import date, datetime, timezone

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
