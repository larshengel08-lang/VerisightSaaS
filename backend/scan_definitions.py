from __future__ import annotations

from typing import Any

from backend.products.exit.definition import SCAN_DEFINITION as EXIT_SCAN_DEFINITION
from backend.products.leadership.definition import SCAN_DEFINITION as LEADERSHIP_SCAN_DEFINITION
from backend.products.onboarding.definition import SCAN_DEFINITION as ONBOARDING_SCAN_DEFINITION
from backend.products.pulse.definition import SCAN_DEFINITION as PULSE_SCAN_DEFINITION
from backend.products.retention.definition import SCAN_DEFINITION as RETENTION_SCAN_DEFINITION
from backend.products.team.definition import SCAN_DEFINITION as TEAM_SCAN_DEFINITION
from backend.products.shared.definitions import ORG_SECTIONS

CULTURE_ASSESSMENT_PLACEHOLDER_SCAN_DEFINITION: dict[str, Any] = {
    "scan_type": "culture_assessment",
    "product_name": "Loep Culture Assessment",
    "signal_label": "Loep Culture Index",
    "signal_short_label": "loep culture index",
    "route_type": "primary_route_placeholder",
    "dashboard_signal_help": (
        "Loep Culture Assessment is in opbouw. Deze scan-definition placeholder "
        "bestaat alleen om de gedeelde route correct te mappen zonder ExitScan-fallback."
    ),
    "trust_contract": {
        "what_it_is": "Een identity-correcte placeholder voor de culture_assessment route.",
        "what_it_is_not": "Geen finale productdefinitie en geen ExitScan-fallback.",
        "how_to_read": "Gebruik deze mapping alleen als technische routegrens totdat de dedicated module bestaat.",
        "privacy_boundary": "Deze placeholder levert geen inhoudelijke resultaten of drilldown.",
        "evidence_status": "Task 1 scope: gedeelde routecontracten en veilige placeholder mapping.",
    },
    "survey_intro": "Loep Culture Assessment is in opbouw.",
    "survey_privacy_note": "Deze placeholder ondersteunt nog geen runtime survey- of dashboardgedrag.",
    "sdt_intro": "Niet beschikbaar in deze placeholder.",
    "org_intro": "Niet beschikbaar in deze placeholder.",
    "open_text_label": "Niet beschikbaar in deze placeholder.",
    "open_text_placeholder": "Niet beschikbaar in deze placeholder.",
    "open_text_help": "Niet beschikbaar in deze placeholder.",
    "invite_intro": "Loep Culture Assessment is als route geregistreerd en nog in opbouw.",
    "invite_duration": "Nog niet beschikbaar",
    "contact_subject": "Kennismakingsaanvraag Loep Culture Assessment",
    "report_repeat_title": "Loep Culture Assessment is in opbouw",
    "report_repeat_body": "De definitieve rapport- en vervolglogica volgt in een latere taak.",
    "sdt_items": [],
    "org_sections": ORG_SECTIONS,
    "uwes_items": [],
    "turnover_items": [],
}

SCAN_DEFINITIONS: dict[str, dict[str, Any]] = {
    "culture_assessment": CULTURE_ASSESSMENT_PLACEHOLDER_SCAN_DEFINITION,
    "exit": EXIT_SCAN_DEFINITION,
    "leadership": LEADERSHIP_SCAN_DEFINITION,
    "onboarding": ONBOARDING_SCAN_DEFINITION,
    "retention": RETENTION_SCAN_DEFINITION,
    "pulse": PULSE_SCAN_DEFINITION,
    "team": TEAM_SCAN_DEFINITION,
}


def get_scan_definition(scan_type: str) -> dict[str, Any]:
    return SCAN_DEFINITIONS.get(scan_type, SCAN_DEFINITIONS["exit"])
