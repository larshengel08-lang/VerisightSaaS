from __future__ import annotations

from typing import Any

from backend.products.culture_assessment.scoring import (
    DOMAIN_ITEM_IDS,
    QUESTIONNAIRE_DOMAIN_ORDER,
    QUESTIONNAIRE_ITEMS,
    QUESTIONNAIRE_ITEMS_BY_ID,
    SPLIT_INDEX,
    get_questionnaire_lock_payload,
)


QUESTIONNAIRE_LOCK_PAYLOAD = get_questionnaire_lock_payload()

DOMAIN_LABELS_NL: dict[str, str] = {
    "engagement_involvement": "Engagement en betrokkenheid",
    "trust_psychological_safety": "Vertrouwen en psychologische veiligheid",
    "leadership_direction": "Leiderschap en richting",
    "collaboration_alignment": "Samenwerking en afstemming",
    "workload_capacity": "Werkdruk en draagkracht",
    "autonomy_role_clarity": "Autonomie en rolhelderheid",
    "growth_development": "Groei en ontwikkeling",
    "change_readiness": "Veranderbereidheid",
    "reward_conditions": "Beloning en voorwaarden",
    "organizational_connection_intent": "Verbondenheid en intentie",
}


def _build_culture_sections() -> tuple[list[tuple[str, str]], list[dict[str, Any]]]:
    first_half = [
        (item["id"], item["prompt_nl"])
        for item in QUESTIONNAIRE_ITEMS[:SPLIT_INDEX]
    ]

    second_half_sections: list[dict[str, Any]] = []
    for domain_id in QUESTIONNAIRE_DOMAIN_ORDER[5:]:
        items = [
            (item_id, QUESTIONNAIRE_ITEMS_BY_ID[item_id]["prompt_nl"])
            for item_id in DOMAIN_ITEM_IDS[domain_id]
        ]
        second_half_sections.append(
            {
                "key": domain_id,
                "title": DOMAIN_LABELS_NL[domain_id],
                "items": items,
            }
        )

    return first_half, second_half_sections


SDT_ITEMS, ORG_SECTIONS = _build_culture_sections()

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
        "Deze Loep Culture Assessment-baseline laat board, directie en HR organisatiebreed zien welke cultuur- en "
        "engagementpatronen nu bestuurlijke aandacht vragen. Je vult een vaste 40-item enterprise-vragenlijst in. Dit duurt circa 12 minuten."
    ),
    "survey_privacy_note": (
        "Je antwoorden worden vertrouwelijk verwerkt en alleen op geaggregeerd niveau zichtbaar gemaakt. Resultaten openen "
        "pas boven minimum-n, open tekst blijft alleen geclusterd en veilig zichtbaar, en named manager detail blijft standaard locked."
    ),
    "sdt_intro": (
        "Beantwoord de volgende stellingen over betrokkenheid, vertrouwen, richting, samenwerking en werkdruk. "
        "Gebruik 1 = helemaal oneens en 5 = helemaal eens."
    ),
    "org_intro": (
        "Beantwoord daarna de stellingen over rolhelderheid, ontwikkeling, verandervermogen, voorwaarden en verbondenheid. "
        "Dezelfde schaal blijft gelden."
    ),
    "open_text_label": "Welke ene observatie moet board, directie of HR volgens jou na deze baseline als eerste beter begrijpen?",
    "open_text_placeholder": "Beschrijf een patroon, spanning of observatie die op organisatieniveau aandacht verdient.",
    "open_text_help": "Noem bij voorkeur geen namen of direct herleidbare details. Open tekst wordt alleen veilig geclusterd gebruikt.",
    "invite_intro": (
        "Je bent uitgenodigd voor Loep Culture Assessment: een brede jaarlijkse cultuur- en engagementbaseline voor "
        "organisatiebreed inzicht op geaggregeerd niveau."
    ),
    "invite_duration": "10-14 minuten",
    "contact_subject": "Kennismakingsaanvraag Loep Culture Assessment",
    "report_repeat_title": "Board-read en vervolgritme na de baseline",
    "report_repeat_body": (
        "De jaarlijkse baseline eindigt in executive read, board-read en governed vervolgkeuzes. Een eventueel Pulse-ritme "
        "volgt pas daarna als aparte route."
    ),
    "launch_status": [
        "pilot-ready",
        "commercially demoable",
        "operationally executable",
        "not benchmark-ready",
        "not self-service scalable",
        "not fully automated delivery at volume",
    ],
    "deployment_profiles": {
        "enterprise": (
            "Diepere segmentlagen, board deck, HR appendix, governed drilldown en mogelijke latere Pulse-opvolging "
            "op dezelfde kernvragenlijst."
        ),
        "mkb": (
            "Dezelfde kernvragenlijst en board-read, met organisatiebrede read als hoofdwaarde en alleen veilige "
            "segmentatie waar minimum-n dat toelaat."
        ),
    },
    "standard_outputs": [
        "board report pdf",
        "boardroom pdf deck",
        "guided board-read session",
    ],
    "optional_outputs": [
        "executive one-pager",
        "HR appendix pdf",
        "segment summary export",
        "HR deepening handout",
        "manager cascade handout when threshold-safe",
        "Pulse follow-on after baseline",
    ],
    "output_readiness": {
        "board_report_pdf": "pilot_delivery_ready",
        "boardroom_deck": "pilot_delivery_ready",
        "executive_one_pager": "blueprint_ready",
        "hr_appendix_pdf": "blueprint_ready",
        "segment_summary_export": "commercial_delivery_ready",
    },
    "output_sequence_note": (
        "Het board report pdf is in v1 een compacte executive read. Dashboard en board-deck-structuur dragen de volledige "
        "canonieke 11-blokvolgorde; het pdf comprimeert die volgorde zonder benchmark-, ranking- of health-scoreframing."
    ),
    "follow_on_outcomes": [
        "no immediate next route",
        "deeper governed work",
        "Pulse follow-on",
        "another Loep route",
    ],
    "follow_on_decision_note": (
        "Na de baseline opent geen vervolgrichting automatisch. De board-read sluit expliciet af met een keuze tussen geen "
        "onmiddellijke vervolgrichting, deeper governed work, een bounded Pulse-follow-on of een andere Loep-route als de "
        "vervolgvraag echt smaller is."
    ),
    "runtime_role_model": {
        "active_in_v1": ["admin", "hr_partner", "executive"],
        "future_contract_roles_not_active_in_v1": [
            "business_unit_lead",
            "manager_limited",
        ],
        "note": (
            "V1 runtime ondersteunt alleen admin, hr_partner en executive. business_unit_lead en manager_limited blijven "
            "contract-future rollen tot expliciete entitlement- en surface-activatie."
        ),
    },
    "governed_export_entitlements": {
        "executive": {
            "organization_view": "allowed",
            "approved_segment_contrasts": "governed",
            "business_unit_scope": "governed",
            "hr_governed_analysis": "denied",
            "segment_summary_export": "denied",
            "hr_appendix_export": "denied",
            "manager_cascade_output": "governed",
            "hidden_reason_visibility": "governed",
            "release_state_visibility": "governed",
            "export_approval": "denied",
        },
        "hr_partner": {
            "organization_view": "allowed",
            "approved_segment_contrasts": "governed",
            "business_unit_scope": "governed",
            "hr_governed_analysis": "allowed",
            "segment_summary_export": "governed",
            "hr_appendix_export": "governed",
            "manager_cascade_output": "governed",
            "hidden_reason_visibility": "allowed",
            "release_state_visibility": "allowed",
            "export_approval": "denied",
        },
        "business_unit_lead": {
            "organization_view": "allowed",
            "approved_segment_contrasts": "governed",
            "business_unit_scope": "governed",
            "hr_governed_analysis": "denied",
            "segment_summary_export": "denied",
            "hr_appendix_export": "denied",
            "manager_cascade_output": "governed",
            "hidden_reason_visibility": "governed",
            "release_state_visibility": "governed",
            "export_approval": "denied",
        },
        "manager_limited": {
            "organization_view": "denied",
            "approved_segment_contrasts": "denied",
            "business_unit_scope": "denied",
            "hr_governed_analysis": "denied",
            "segment_summary_export": "denied",
            "hr_appendix_export": "denied",
            "manager_cascade_output": "governed",
            "hidden_reason_visibility": "denied",
            "release_state_visibility": "denied",
            "export_approval": "denied",
        },
        "admin": {
            "organization_view": "admin_state_only",
            "approved_segment_contrasts": "admin_state_only",
            "business_unit_scope": "admin_state_only",
            "hr_governed_analysis": "admin_state_only",
            "segment_summary_export": "admin_state_only",
            "hr_appendix_export": "admin_state_only",
            "manager_cascade_output": "admin_state_only",
            "hidden_reason_visibility": "admin_state_only",
            "release_state_visibility": "admin_state_only",
            "export_approval": "admin_state_only",
        },
    },
    "text_safety_states": [
        "not_collected",
        "collected_not_processed",
        "processed_safe_none_visible",
        "processed_safe_summary_visible",
        "suppressed_below_threshold",
        "suppressed_sensitive_content",
        "suppressed_unapproved",
    ],
    "questionnaire_lock": QUESTIONNAIRE_LOCK_PAYLOAD,
    "sdt_items": SDT_ITEMS,
    "org_sections": ORG_SECTIONS,
    "uwes_items": [],
    "turnover_items": [],
}


def get_definition() -> dict[str, Any]:
    return SCAN_DEFINITION
