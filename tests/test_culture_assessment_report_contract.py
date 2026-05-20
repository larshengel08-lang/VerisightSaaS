from backend.products.shared.registry import get_product_module


def test_culture_assessment_module_exposes_definition_and_report_payloads():
    module = get_product_module("culture_assessment")

    assert module.scan_type == "culture_assessment"
    assert module.get_definition()["product_name"] == "Loep Culture Assessment"
    assert "pilot-ready" in module.get_definition()["launch_status"]
    assert "segment summary export" in module.get_definition()["optional_outputs"]
    assert "boardroom pdf deck" in module.get_definition()["standard_outputs"]
    assert module.get_definition()["output_readiness"]["boardroom_deck"] == "pilot_delivery_ready"
    assert "compacte executive read" in module.get_definition()["output_sequence_note"]
    assert module.get_definition()["follow_on_outcomes"] == [
        "no immediate next route",
        "deeper governed work",
        "Pulse follow-on",
        "another Loep route",
    ]
    assert "opent geen vervolgrichting automatisch" in module.get_definition()["follow_on_decision_note"]
    assert module.get_definition()["governed_export_entitlements"]["hr_partner"]["segment_summary_export"] == "governed"
    assert module.get_definition()["governed_export_entitlements"]["manager_limited"]["segment_summary_export"] == "denied"
    assert module.get_definition()["text_safety_states"] == [
        "not_collected",
        "collected_not_processed",
        "processed_safe_none_visible",
        "processed_safe_summary_visible",
        "suppressed_below_threshold",
        "suppressed_sensitive_content",
        "suppressed_unapproved",
    ]
    assert "Loep Culture Index" in module.get_management_summary_payload()["index_label"]
    assert "domeinbeeld" in module.get_management_summary_payload()["board_attention_scope_note"]
    assert "compacte executive read" in module.get_management_summary_payload()["output_sequence_note"]
    assert module.get_management_summary_payload()["board_read_delivery"]["always_guided"] is True
    assert module.get_methodology_payload()["benchmark_state"] == "inactive_v1"
    assert module.get_methodology_payload()["named_manager_layer_default"] == "locked"
    assert module.get_methodology_payload()["allows_individual_export"] is False
    assert module.get_methodology_payload()["delivery_readiness"]["target_turnaround_from_close_to_board_output"] == "5 business days"
