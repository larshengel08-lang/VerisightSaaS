from __future__ import annotations

from typing import Any


SCAN_DEFINITION: dict[str, Any] = {
    "scan_type": "culture_assessment",
    "product_name": "Loep Culture Assessment",
    "dutch_name": "Loep Cultuurbeeld",
    "signal_label": "Loep Culture Index",
    "signal_short_label": "loep culture index",
    "report_title": "Loep Culture Assessment",
    "route_type": "primary_route",
    "trust_contract": {
        "what_it_is": (
            "Een jaarlijkse brede cultuur- en engagementbaseline voor board, directie en HR, bedoeld om "
            "organisatiebreed zicht te geven op patronen, verschillen tussen onderdelen en eerste bestuurlijke aandachtspunten."
        ),
        "what_it_is_not": (
            "Geen RetentieScan, geen Pulse, geen TeamScan, geen manager ranking tool, geen self-serve survey platform "
            "en geen benchmark-first product."
        ),
        "how_to_read": (
            "Lees de Loep Culture Index als navigatiesignaal. Combineer die altijd met domeinen, segmentpatronen, "
            "responsbasis en governancegrenzen in plaats van als totaaloordeel."
        ),
        "privacy_boundary": (
            "Resultaten verschijnen alleen boven minimum-n, named manager detail blijft standaard locked en open tekst "
            "blijft geclusterd of uitgeschakeld zolang dat nodig is voor veilige weergave."
        ),
        "evidence_status": (
            "De route is descriptief en patroon-gedreven: geen causaliteitsclaims, geen individuele voorspellingen "
            "en geen benchmarkclaims in v1."
        ),
    },
    "dashboard_signal_help": (
        "De Loep Culture Index is een navigatiesignaal voor het organisatiebeeld. De index is geen eindoordeel over cultuur, "
        "geen individuele beoordeling en geen bewijs van oorzaak-gevolg. Lees de index altijd samen met domeinen, "
        "segmentpatronen, responsbasis en governancegrenzen."
    ),
    "survey_intro": (
        "Loep Culture Assessment wordt in deze wave als board-level baseline ingericht. De self-serve surveyafname "
        "en scoringflow zijn nog niet actief."
    ),
    "survey_privacy_note": (
        "Deze route blijft in deze wave begrensd tot route- en contractniveau. Runtime surveyverwerking en respondentoutput "
        "zijn nog niet beschikbaar."
    ),
    "sdt_intro": "Niet actief in deze wave.",
    "org_intro": "Niet actief in deze wave.",
    "open_text_label": "Niet actief in deze wave.",
    "open_text_placeholder": "Niet actief in deze wave.",
    "open_text_help": "Open tekst wordt voor deze route pas later geactiveerd binnen veilige governancegrenzen.",
    "invite_intro": (
        "Loep Culture Assessment is beschikbaar als primaire enterprise route voor een jaarlijkse brede cultuur- en engagementbaseline."
    ),
    "invite_duration": "Jaarlijkse enterprise baseline",
    "contact_subject": "Kennismakingsaanvraag Loep Culture Assessment",
    "report_repeat_title": "Board-read en vervolgpas na baseline",
    "report_repeat_body": (
        "De jaarlijkse baseline eindigt in executive read, board-read en governed vervolgkeuzes. Een eventueel Pulse-ritme "
        "volgt pas daarna als aparte route."
    ),
    "sdt_items": [],
    "org_sections": [],
    "uwes_items": [],
    "turnover_items": [],
}


def get_definition() -> dict[str, Any]:
    return SCAN_DEFINITION
