"""De backend accepteert de omvangvakken van het contactformulier (fixronde 24-9, Taak 13).

Het veld is vrije tekst (2 tot 80 tekens); er is geen lijst van toegestane
waarden. Deze test pint dat de nieuwe vakken erdoor komen en dat een oude
waarde ook blijft werken.
"""
import pytest

from backend.schemas import ContactRequestCreate


@pytest.mark.parametrize("omvang", [
    "Minder dan 150 medewerkers", "150 tot 400 medewerkers", "400 tot 1.000 medewerkers",
    "Boven 1.000 medewerkers", "Anders / nog niet zeker", "100 - 200 medewerkers",
])
def test_omvangvak_wordt_geaccepteerd(omvang):
    req = ContactRequestCreate(name="Test Persoon", work_email="hr@voorbeeld.nl",
                               organization="Voorbeeld B.V.", employee_count=omvang,
                               current_question="Wij willen behoud beter begrijpen.")
    assert req.employee_count == omvang
