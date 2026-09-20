"""Het vastgelegde besluit van het MT lezen voor het rapport (plan 3b).

Eigen module en geen functie in report_html.py: dit is het enige stuk van de
rapportdata dat een tabel leest die door de frontend wordt geschreven en die
op een omgeving kan ontbreken (migratie nog niet gedraaid).

Let op Railway (Python 3.11): geen PEP 701-f-strings hieronder.
"""
from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.exc import OperationalError, ProgrammingError
from sqlalchemy.orm import Session

from backend.models import CampaignDecision

logger = logging.getLogger(__name__)

_TEKSTVELDEN = ("primary_topic", "primary_action", "owner", "secondary_topic",
                "secondary_action", "feedback_plan", "success_criterion")
_DATUMVELDEN = ("decided_at", "follow_up_date")


def load_decision(db: Session, campaign_id: str) -> tuple[dict[str, Any] | None, bool]:
    """(besluit, unavailable).

    besluit is None als er geen rij is of als de rij niets bevat. unavailable is
    True als de tabel niet te lezen was; de besluitpagina zegt dat dan in een
    regel (zichtbare terugval, geen stille). Alleen een ontbrekende of
    onleesbare tabel wordt zo afgevangen (ProgrammingError op Postgres,
    OperationalError op SQLite); elke andere fout blijft een fout.

    Roep dit aan VOOR de andere query's van het rapport: na een mislukt
    statement is de transactie in Postgres onbruikbaar en volgt een rollback.
    """
    try:
        rij = (db.query(CampaignDecision)
               .filter(CampaignDecision.campaign_id == campaign_id).first())
    except (ProgrammingError, OperationalError) as exc:
        db.rollback()
        logger.error(
            "campaign_decisions niet leesbaar voor campagne %s (%s). Is "
            "migrations/2026_09_19_add_campaign_decisions.sql gedraaid? Het rapport "
            "rendert de besluitpagina leeg, met een regel dat het besluit niet te lezen was.",
            campaign_id, type(exc).__name__)
        return None, True
    if rij is None:
        return None, False
    besluit: dict[str, Any] = {veld: (getattr(rij, veld) or "").strip() for veld in _TEKSTVELDEN}
    for veld in _DATUMVELDEN:
        besluit[veld] = getattr(rij, veld)
    if not any(besluit[veld] for veld in _TEKSTVELDEN + _DATUMVELDEN):
        return None, False
    besluit["updated_at"] = rij.updated_at
    return besluit, False
