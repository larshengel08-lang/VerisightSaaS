from backend.products.shared.registry import get_product_module


def test_culture_assessment_module_exposes_definition_and_report_payloads():
    module = get_product_module("culture_assessment")

    assert module.scan_type == "culture_assessment"
    assert module.get_definition()["product_name"] == "Loep Culture Assessment"
    assert "Loep Culture Index" in module.get_management_summary_payload()["index_label"]
    assert module.get_methodology_payload()["benchmark_state"] == "inactive_v1"
    assert module.get_methodology_payload()["named_manager_layer_default"] == "locked"
    assert module.get_methodology_payload()["allows_individual_export"] is False
