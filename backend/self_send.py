"""Self-send mode — pure helpers (geen DB, geen I/O).

- dedup-key hashing voor single-fill bescherming in de open flow
- reminderdatum-resolutie (relatief aan einddatum of absoluut)
- selectie van vandaag-of-eerder-due reminders die nog niet zijn gemeld
"""

from __future__ import annotations

import hashlib
from datetime import date, timedelta
from typing import Any


def hash_dedup_key(raw_key: str) -> str:
    """SHA-256 hex van de client-UUID. Lege sleutel -> lege string (matcht nooit)."""
    if not raw_key:
        return ""
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def _parse_date(value: Any) -> date | None:
    if isinstance(value, date):
        return value
    if isinstance(value, str) and len(value) == 10:
        try:
            return date.fromisoformat(value)
        except ValueError:
            return None
    return None


def resolve_reminder_date(reminder: dict[str, Any], end_date: date | None) -> date | None:
    if reminder.get("kind") == "absolute":
        return _parse_date(reminder.get("date"))
    days = reminder.get("daysBeforeEnd")
    if end_date is None or not isinstance(days, int):
        return None
    return end_date - timedelta(days=days)


def due_reminders(
    reminders: list[dict[str, Any]],
    end_date: date | None,
    today: date,
) -> list[dict[str, Any]]:
    due: list[dict[str, Any]] = []
    for reminder in reminders:
        if reminder.get("notifiedAt"):
            continue
        resolved = resolve_reminder_date(reminder, end_date)
        if resolved is not None and resolved <= today:
            due.append(reminder)
    return due
