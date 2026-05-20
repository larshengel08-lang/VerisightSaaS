from __future__ import annotations

from typing import Any

from backend.products.culture_assessment.scoring import get_questionnaire_lock_payload


def get_management_summary_payload() -> dict[str, Any]:
    return {
        "index_label": "Loep Culture Index",
        "management_question": (
            "Welke brede cultuur- en engagementpatronen vragen op organisatieniveau bestuurlijke aandacht, "
            "en waar zitten de belangrijkste verschillen tussen onderdelen van de organisatie?"
        ),
        "allowed_claims": [
            "board-level organisatiebeeld",
            "descriptieve prioritering",
            "patroonlezing over domeinen en segmenten",
        ],
        "forbidden_claims": [
            "cultuur is goed/slecht",
            "manager X functioneert slecht",
            "dit verklaart oorzaak-gevolg",
            "individuele voorspellingen",
            "benchmarkclaims in v1",
        ],
        "board_attention_frame": (
            "Gebruik de executive read om eerste bestuurlijke aandachtspunten te ordenen op basis van patroonlogica, "
            "niet op basis van ranking, causaliteit of een totaaloordeel."
        ),
        "board_attention_scope_note": (
            "V1 gebruikt board attention points primair op basis van domeinbeeld en terugkerende thematische samenhang. "
            "Segmentcontrasten en open signalen blijven aparte governed vervolglagen en tellen niet automatisch als directe attention-input mee."
        ),
        "board_attention_logic": get_questionnaire_lock_payload()["board_attention_logic"],
        "board_read_delivery": {
            "facilitator_owner": "Loep / Verisight consultant of founder-led board facilitator",
            "session_length_minutes": "60-90",
            "always_guided": True,
            "first_pilot_deck_format": "PDF deck",
            "manual_rewrite_forbidden": [
                "board attention points",
                "culture index explanation",
                "segment summary export rows",
                "privacy and governance statements",
            ],
        },
        "output_sequence_note": (
            "Het board report pdf is in v1 een compacte executive read. Dashboard en board-deck-structuur dragen de "
            "volledige canonieke 11-blokvolgorde; het pdf comprimeert die volgorde zonder benchmark-, ranking- of "
            "health-scoreframing."
        ),
    }


def get_methodology_payload() -> dict[str, Any]:
    return {
        "benchmark_state": "inactive_v1",
        "named_manager_layer_default": "locked",
        "organization_min_n": 30,
        "segment_comparison_min_n": 10,
        "open_text_cluster_min_n": 5,
        "allows_individual_export": False,
        "local_threshold_invention_forbidden": True,
        "local_text_threshold_invention_forbidden": True,
        "text_safety_states": [
            "not_collected",
            "collected_not_processed",
            "processed_safe_none_visible",
            "processed_safe_summary_visible",
            "suppressed_below_threshold",
            "suppressed_sensitive_content",
            "suppressed_unapproved",
        ],
        "governed_export_entitlements": {
            "executive": {
                "segment_summary_export": "denied",
                "hr_appendix_export": "denied",
            },
            "hr_partner": {
                "segment_summary_export": "governed",
                "hr_appendix_export": "governed",
            },
            "business_unit_lead": {
                "segment_summary_export": "denied",
                "hr_appendix_export": "denied",
            },
            "manager_limited": {
                "segment_summary_export": "denied",
                "hr_appendix_export": "denied",
            },
            "admin": {
                "segment_summary_export": "admin_state_only",
                "hr_appendix_export": "admin_state_only",
            },
        },
        "launch_status": [
            "pilot-ready",
            "commercially demoable",
            "operationally executable",
            "not benchmark-ready",
            "not self-service scalable",
            "not fully automated delivery at volume",
        ],
        "deployment_profiles": {
            "enterprise": {
                "segment_depth": "deeper segment layers with governed drilldown",
                "board_read": "included",
                "hr_appendix": "included in governed or enterprise delivery",
            },
            "mkb": {
                "segment_depth": "organization-wide first, safe segmentation only where minimum-n allows",
                "board_read": "included",
                "named_manager_layer": "off by default",
            },
        },
        "delivery_readiness": {
            "board_read_facilitator": "Loep / Verisight guided facilitation",
            "expected_preparation_time_per_client": "4-6 hours",
            "target_turnaround_from_close_to_board_output": "5 business days",
            "output_automation": {
                "board_report_pdf": "semi-automated",
                "segment_summary_export": "automated",
                "boardroom_powerpoint_deck": "manual",
                "executive_one_pager": "manual",
                "hr_appendix_pdf": "semi-automated",
            },
        },
        "questionnaire_lock": get_questionnaire_lock_payload(),
    }
