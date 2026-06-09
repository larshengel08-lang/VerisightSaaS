from backend.products.shared.registry import get_product_module


def test_culture_assessment_module_exposes_definition_and_report_payloads():
    module = get_product_module("culture_assessment")

    assert module.scan_type == "culture_assessment"
    assert module.get_definition()["product_name"] == "Loep Culture Assessment"
    assert "pilot-ready" in module.get_definition()["launch_status"]
    assert "segment summary export" in module.get_definition()["optional_outputs"]
    assert "Loep Culture Index" in module.get_management_summary_payload()["index_label"]
    assert module.get_management_summary_payload()["board_read_delivery"]["always_guided"] is True
    assert module.get_methodology_payload()["benchmark_state"] == "inactive_v1"
    assert module.get_methodology_payload()["named_manager_layer_default"] == "locked"
    assert module.get_methodology_payload()["allows_individual_export"] is False
    assert module.get_methodology_payload()["delivery_readiness"]["target_turnaround_from_close_to_board_output"] == "5 business days"
