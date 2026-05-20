from collections import Counter

from backend.products.culture_assessment.definition import SCAN_DEFINITION
from backend.products.culture_assessment.report_content import (
    get_management_summary_payload,
    get_methodology_payload,
)
from backend.products.culture_assessment.scoring import (
    BOARD_ATTENTION_LOGIC,
    MIN_VALID_RESPONSE_RULES,
    QUESTIONNAIRE_ITEMS,
    QUESTIONNAIRE_SCALE,
    SCORING_LOCK,
    TARGET_COMPLETION,
)


def test_culture_assessment_questionnaire_lock_has_fixed_shape():
    item_ids = [item["id"] for item in QUESTIONNAIRE_ITEMS]
    domain_counts = Counter(item["domain_id"] for item in QUESTIONNAIRE_ITEMS)

    assert len(QUESTIONNAIRE_ITEMS) == 40
    assert len(item_ids) == len(set(item_ids))
    assert len(domain_counts) == 10
    assert set(domain_counts.values()) == {4}
    assert all(item["scale_id"] == QUESTIONNAIRE_SCALE["scale_id"] for item in QUESTIONNAIRE_ITEMS)


def test_culture_assessment_questionnaire_lock_has_quality_and_validity_rules():
    reverse_count = sum(1 for item in QUESTIONNAIRE_ITEMS if item["reverse_scored"])

    assert QUESTIONNAIRE_SCALE["labels_nl"] == [
        "Helemaal oneens",
        "Eerder oneens",
        "Neutraal / gemengd",
        "Eerder eens",
        "Helemaal eens",
    ]
    assert TARGET_COMPLETION["target_minutes"] == 12
    assert TARGET_COMPLETION["max_minutes"] == 14
    assert MIN_VALID_RESPONSE_RULES["minimum_closed_items_answered"] == 32
    assert MIN_VALID_RESPONSE_RULES["minimum_answered_items_per_domain"] == 3
    assert MIN_VALID_RESPONSE_RULES["minimum_valid_domains"] == 8
    assert MIN_VALID_RESPONSE_RULES["open_text_optional"] is True
    assert reverse_count == 10


def test_culture_assessment_scoring_lock_and_board_attention_logic_are_deterministic():
    assert SCORING_LOCK["normalized_output_scale"] == "0_to_10"
    assert SCORING_LOCK["domain_score_method"] == "mean_of_answered_items_after_reverse_scoring"
    assert SCORING_LOCK["culture_index_method"] == "mean_of_valid_domain_scores"
    assert BOARD_ATTENTION_LOGIC["mode"] == "domain_score_based_v1_attention_logic"
    assert BOARD_ATTENTION_LOGIC["implemented_inputs"] == [
        "domain_scores",
        "recurring_theme_pairs",
    ]
    assert BOARD_ATTENTION_LOGIC["output_limit"] == 5
    assert BOARD_ATTENTION_LOGIC["forbidden_outputs"] == [
        "causal_diagnosis",
        "automatic_intervention_advice",
        "manager_blame",
    ]


def test_culture_assessment_definition_and_methodology_expose_wp0_lock():
    questionnaire_lock = SCAN_DEFINITION["questionnaire_lock"]
    methodology = get_methodology_payload()
    management = get_management_summary_payload()

    assert questionnaire_lock["item_count"] == 40
    assert questionnaire_lock["domain_count"] == 10
    assert methodology["questionnaire_lock"]["min_valid_response_rules"]["minimum_closed_items_answered"] == 32
    assert management["board_attention_logic"]["output_limit"] == 5
    assert "vaste 40-item enterprise-vragenlijst" in SCAN_DEFINITION["survey_intro"]
    assert SCAN_DEFINITION["output_readiness"]["board_report_pdf"] == "pilot_delivery_ready"
    assert SCAN_DEFINITION["output_readiness"]["boardroom_deck"] == "pilot_delivery_ready"
    assert SCAN_DEFINITION["governed_export_entitlements"]["admin"]["export_approval"] == "admin_state_only"
    assert SCAN_DEFINITION["text_safety_states"][0] == "not_collected"
