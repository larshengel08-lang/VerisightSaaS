import pytest

import backend.products.shared.registry as product_registry
from backend.scan_definitions import get_scan_definition
from backend.products.shared.registry import get_product_module
from backend.schemas import CampaignCreate, ContactRequestCreate, ContactRequestUpdate


def test_culture_assessment_is_allowed_in_shared_route_contracts():
    campaign = CampaignCreate(
        name="Culture Baseline",
        scan_type="culture_assessment",
        delivery_mode="baseline",
    )
    lead = ContactRequestCreate(
        name="Board Sponsor",
        work_email="board@example.com",
        organization="Loep Corp",
        employee_count="500-1000",
        route_interest="culture_assessment",
        current_question="We need a broad annual culture and engagement baseline.",
    )
    update = ContactRequestUpdate(qualified_route="culture_assessment")
    module = get_product_module("culture_assessment")
    scan_definition = get_scan_definition("culture_assessment")

    assert campaign.scan_type == "culture_assessment"
    assert lead.route_interest == "culture_assessment"
    assert update.qualified_route == "culture_assessment"
    assert module.scan_type == "culture_assessment"
    assert module.get_definition()["product_name"] == "Loep Culture Assessment"
    assert scan_definition["product_name"] == "Loep Culture Assessment"
    assert scan_definition["signal_label"] == "Loep Culture Index"
    assert scan_definition["route_type"] == "primary_route_placeholder"
    assert "in opbouw" in scan_definition["dashboard_signal_help"].lower()

    with pytest.raises(NotImplementedError, match="culture_assessment backend product module is not implemented yet"):
        module.get_management_summary_payload()


def test_culture_assessment_is_baseline_only_for_now():
    with pytest.raises(ValueError, match="Loep Culture Assessment ondersteunt in deze wave alleen baseline campaigns."):
        CampaignCreate(
            name="Culture Live",
            scan_type="culture_assessment",
            delivery_mode="live",
        )


def test_culture_assessment_placeholder_only_covers_missing_top_level_module(monkeypatch: pytest.MonkeyPatch):
    def fake_import_module(module_path: str):
        raise ModuleNotFoundError("missing dependency", name="backend.products.culture_assessment.definition")

    monkeypatch.setattr(product_registry, "import_module", fake_import_module)

    with pytest.raises(ModuleNotFoundError, match="missing dependency"):
        product_registry.get_product_module("culture_assessment")
