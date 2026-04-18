from __future__ import annotations

from typing import Any

from backend.products.exit.definition import SCAN_DEFINITION as EXIT_SCAN_DEFINITION
from backend.products.leadership.definition import SCAN_DEFINITION as LEADERSHIP_SCAN_DEFINITION
from backend.products.mto.definition import SCAN_DEFINITION as MTO_SCAN_DEFINITION
from backend.products.onboarding.definition import SCAN_DEFINITION as ONBOARDING_SCAN_DEFINITION
from backend.products.pulse.definition import SCAN_DEFINITION as PULSE_SCAN_DEFINITION
from backend.products.retention.definition import SCAN_DEFINITION as RETENTION_SCAN_DEFINITION
from backend.products.team.definition import SCAN_DEFINITION as TEAM_SCAN_DEFINITION
from backend.products.shared.definitions import ORG_SECTIONS


SCAN_DEFINITIONS: dict[str, dict[str, Any]] = {
    "exit": EXIT_SCAN_DEFINITION,
    "leadership": LEADERSHIP_SCAN_DEFINITION,
    "mto": MTO_SCAN_DEFINITION,
    "onboarding": ONBOARDING_SCAN_DEFINITION,
    "retention": RETENTION_SCAN_DEFINITION,
    "pulse": PULSE_SCAN_DEFINITION,
    "team": TEAM_SCAN_DEFINITION,
}


def get_scan_definition(scan_type: str) -> dict[str, Any]:
    return SCAN_DEFINITIONS.get(scan_type, SCAN_DEFINITIONS["exit"])
