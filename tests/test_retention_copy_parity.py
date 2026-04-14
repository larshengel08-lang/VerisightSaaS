from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8").lower()


def test_retention_signal_language_stays_aligned_across_layers():
    frontend_definition = _read("frontend/lib/products/retention/definition.ts")
    backend_definition = _read("backend/products/retention/definition.py")
    report_content = _read("backend/products/retention/report_content.py")
    report = _read("backend/report.py")

    assert "samenvattend groepssignaal" in frontend_definition
    assert "samenvattend groepssignaal" in backend_definition
    assert "samenvattend groepssignaal" in report_content
    assert "v1-werkmodel" in frontend_definition
    assert "v1-werkmodel" in backend_definition
    assert "signaalprofiel" in report
    assert "risicoprofiel" not in report


def test_retention_copy_keeps_non_predictive_management_boundary():
    product_page = _read("frontend/app/producten/[slug]/page.tsx")
    marketing = _read("frontend/components/marketing/site-content.ts")
    privacy_page = _read("frontend/app/privacy/page.tsx")
    dpa_page = _read("frontend/app/dpa/page.tsx")
    trust_page = _read("frontend/app/vertrouwen/page.tsx")

    assert "geen brede mto" in product_page
    assert "geen individuele voorspeller" in product_page
    assert "geen individuele signalen naar management" in marketing
    assert "niet als wetenschappelijk gevalideerde voorspeller" in marketing
    assert "individuele signalen, individuele vertrekintentie" in privacy_page
    assert "individuele signalen, individuele vertrekintentie" in dpa_page
    assert "primaire database draait in een eu-regio" in privacy_page
    assert "persoonsgerichte actieroutes" in dpa_page
    assert "geen individuele voorspelling" in trust_page
    assert "geen individuele signalen" in trust_page
    assert "risicovoorspelling" not in product_page


def test_retention_survey_copy_stays_compact_and_actionable():
    backend_definition = _read("backend/products/retention/definition.py")

    assert "compacte behoudsscan" in backend_definition
    assert "welke verandering in je werk, leiding of samenwerking" in backend_definition
    assert "groepssignaal voor verificatie en opvolging" in backend_definition
