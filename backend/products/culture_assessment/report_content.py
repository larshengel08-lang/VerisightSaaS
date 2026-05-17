from __future__ import annotations

from typing import Any


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
    }


def get_methodology_payload() -> dict[str, Any]:
    return {
        "benchmark_state": "inactive_v1",
        "named_manager_layer_default": "locked",
        "organization_min_n": 30,
        "segment_comparison_min_n": 10,
        "open_text_cluster_min_n": 5,
        "allows_individual_export": False,
    }
