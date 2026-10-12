"""Het live rapport van Loep Behoud noemt nergens een MTO (spec 2026-10-11, par. 6.2).

De zinnen "geen brede MTO" in retention/report_content.py en het backend-
trust-contract worden alleen door de oude ReportLab-route gebruikt. Deze test
pint dat het live rapport (report_html.py) er niets van overneemt, en dat de
backendbron zelf de nieuwe formulering gebruikt.
"""
from pathlib import Path

from backend.products.retention import report_content
from backend.products.retention.definition import get_definition
from backend.report_html import render_retention_report_html
from tests.test_report_distribution import _min_retention_data


def test_live_behoud_rapport_bevat_geen_mto():
    html = render_retention_report_html(_min_retention_data())
    assert "MTO" not in html


def test_report_html_bron_noemt_geen_mto():
    bron = (Path(__file__).resolve().parents[1] / "backend" / "report_html.py").read_text(
        encoding="utf-8"
    )
    assert "MTO" not in bron


def test_backendbron_zegt_geen_breed_mto_met_benchmark():
    tekst = get_definition()["trust_contract"]["what_it_is_not"]
    assert "geen brede mto" not in tekst.lower()
    assert tekst.startswith("Geen breed MTO met benchmark")
    bron = Path(report_content.__file__).read_text(encoding="utf-8")
    assert "geen brede MTO" not in bron
