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

    assert campaign.scan_type == "culture_assessment"
    assert lead.route_interest == "culture_assessment"
    assert update.qualified_route == "culture_assessment"
    assert module.scan_type == "culture_assessment"
