from pathlib import Path

from scripts import stresstest_report as st  # noqa: E402


def test_twee_nieuwe_vertrekscenarios_met_maanden():
    per_key = {sc.key: sc for sc in st.SCENARIOS}
    met = per_key["21_exit_uitstroom"]
    rand = per_key["22_exit_uitstroom_rand"]
    assert len(met.exit_months) == met.n == 12 and len(rand.exit_months) == rand.n == 12
    for sc in (met, rand):
        assert sc.scan_type == "exit" and sc.factors == per_key["08_exit_n12"].factors


def test_bestaande_scenarios_zonder_maanden():
    for sc in st.SCENARIOS:
        if not sc.key.startswith(("21_", "22_")):
            assert sc.exit_months == ()


def test_scenario_21_toont_periode_en_22_niet():
    per_key = {sc.key: sc for sc in st.SCENARIOS}
    html21 = Path(st.run_scenario(per_key["21_exit_uitstroom"])["html"]).read_text(encoding="utf-8")
    html22 = Path(st.run_scenario(per_key["22_exit_uitstroom_rand"])["html"]).read_text(encoding="utf-8")
    assert "Uitstroomperiode: vertrek tussen december 2025 en maart 2026" in html21
    assert "Uitstroomperiode" not in html22
    assert "door te weinig mensen gekozen" in html22
