"""Loep Start zegt wat het wel en niet levert (spec ronde 2 par. 7, B18).

Loep Vertrek en Loep Behoud hebben een verdiepingslaag (waarom scoort dit laag,
volgens de respondenten zelf) en een richtingvraag (wat zou hier het meest
helpen). Die twee voeden samen het blok "Wat er moet gebeuren". Loep Start heeft
geen van beide, maar zei dat nergens: de factorpagina's heetten wel "Verdieping:
X" terwijl ze alleen de score en de stellingen tonen, en waar de andere twee
scans een blok "Wat er moet gebeuren" hebben, stond bij Loep Start niets.

Daarnaast stonden op de gespreksagenda twee keer dezelfde constatering onder
elkaar (de zin over de laagst scorende stelling en de why-regel eronder), en
was de claim "het laagst van het hele beeld" niet waar: de min() keek alleen
binnen de eerste factor, terwijl een stelling in een andere factor dezelfde
score kan halen.
"""
import pytest

from backend.report_html import (
    ONBOARDING_GEEN_RANGORDE,
    ONBOARDING_GEEN_VERDIEPING_NOTE,
    _laagste_stelling_zin,
)

from tests.test_report_degraded_page_two import (
    _RENDERERS,
    _body,
    _fixture,
    _page_two,
)

_N_NORMAL = 12


def _ob_fixture(*, tie: str | None = None) -> dict:
    """Loep Start met een volledig factorprofiel.

    tie kiest het gelijkspel dat de claim over de laagste stelling moet breken:

    * "zelfde_factor": een tweede stelling in dezelfde factor met dezelfde score;
    * "andere_factor": een stelling in een andere factor met dezelfde score
      (precies de situatie die de oude min() over één factor niet zag);
    * "afronding": twee stellingen met een verschillende ruwe score die allebei
      als 5.1 op de pagina staan.
    """
    data = _fixture("onboarding", n=_N_NORMAL, profile=True)
    laagste = data["org_item_avgs"]["WL1"]
    if tie == "zelfde_factor":
        data["factor_items_map"]["workload"] = [
            ("WL1", "Mijn werkdruk is behapbaar"),
            ("WL2", "Ik heb genoeg tijd om nieuw werk eigen te maken"),
        ]
        data["org_item_avgs"]["WL2"] = laagste
    elif tie == "andere_factor":
        data["org_item_avgs"]["GR1"] = laagste
    elif tie == "afronding":
        data["org_item_avgs"]["WL1"] = laagste + 0.04
        data["org_item_avgs"]["GR1"] = laagste - 0.01
    elif tie is not None:
        raise AssertionError(f"onbekende tie-variant: {tie}")
    return data


def _ob_html(*, tie: str | None = None) -> str:
    return _body(_RENDERERS["onboarding"](_ob_fixture(tie=tie)))


def _agenda(html: str) -> str:
    """De gespreksagenda: het .pb-blok met de Gespreksopener erin."""
    i = html.rfind("Gespreksopener")
    assert i != -1, "gespreksagenda niet gevonden"
    start = html.rfind('<div class="pb sec">', 0, i)
    einde = html.find('<div class="pb sec">', i)
    return html[start:einde if einde != -1 else len(html)]


# ── De note zegt wat er ontbreekt en wat er wel is ───────────────────────────

def test_de_note_zegt_wat_er_ontbreekt_en_wat_er_wel_is():
    note = ONBOARDING_GEEN_VERDIEPING_NOTE
    assert "geen verdiepingsvragen" in note
    assert "geen richtingvraag" in note
    assert "waar het wringt bij nieuwe medewerkers" in note
    assert "volgende versie" in note
    assert "—" not in note and "&#x2014;" not in note
    assert " ik " not in note.lower()


def test_de_note_staat_op_pagina_twee_van_loep_start():
    assert ONBOARDING_GEEN_VERDIEPING_NOTE in _page_two(
        _RENDERERS["onboarding"](_ob_fixture()))


@pytest.mark.parametrize("scan_type", ["exit", "retention"])
def test_de_note_lekt_niet_naar_de_scans_die_de_laag_wel_hebben(scan_type):
    html = _body(_RENDERERS[scan_type](_fixture(scan_type, n=_N_NORMAL, profile=True)))
    assert ONBOARDING_GEEN_VERDIEPING_NOTE not in html


# ── Geen pagina heet "Verdieping" in een rapport zonder verdieping ───────────

def test_start_paginas_heten_geen_verdieping():
    assert "Verdieping:" not in _ob_html()


def test_de_lege_staat_belooft_geen_verdieping_die_er_niet_is():
    """Zonder factorprofiel blijft het hoofdstuk staan met een lege staat. Die
    zei "geen rangorde om een verdieping aan op te hangen", terwijl Loep Start
    geen verdieping heeft."""
    html = _body(_RENDERERS["onboarding"](_fixture("onboarding", n=8, profile=False)))
    assert ONBOARDING_GEEN_RANGORDE in html
    assert "om een verdieping aan op te hangen" not in html


def test_de_leesroute_noemt_de_hoofdstukken_zoals_ze_heten():
    """De leesroute op pagina twee stuurde naar "de verdieping per thema", een
    hoofdstuk dat in dit rapport niet meer zo heet."""
    html = _ob_html()
    assert "dan de thema&#x27;s met de meeste aandacht" in html
    assert "dan de verdieping per thema" not in html


def test_exit_en_retention_houden_hun_verdiepingspaginas():
    for scan_type in ("exit", "retention"):
        html = _body(_RENDERERS[scan_type](_fixture(scan_type, n=_N_NORMAL, profile=True)))
        assert "Verdieping:" in html, scan_type


# ── De agenda constateert niet twee keer hetzelfde ──────────────────────────

def test_de_agenda_constateert_niet_twee_keer_hetzelfde():
    agenda = _agenda(_ob_html())
    assert "Laagst scorende stelling in het cijferbeeld" not in agenda
    assert "scoort de groep het laagst van het hele beeld" not in agenda


# ── De claim over de laagst scorende stelling klopt ─────────────────────────

def test_strikt_laagste_claimt_exclusief():
    zin = _laagste_stelling_zin("Rolhelderheid", "Ik weet wat er van mij wordt verwacht",
                                5.1, strikt_laagste=True)
    assert "Dat is de laagst scorende stelling in het cijferbeeld." in zin
    assert "een van de laagst scorende stellingen" not in zin
    assert "5.1/10" in zin
    assert "binnen rolhelderheid" in zin


def test_bij_gelijkspel_geen_strikt_laagste_claim():
    zin = _laagste_stelling_zin("Rolhelderheid", "Ik weet wat er van mij wordt verwacht",
                                5.1, strikt_laagste=False)
    assert "Dat is een van de laagst scorende stellingen in het cijferbeeld." in zin


def test_het_rapport_claimt_exclusief_als_de_stelling_echt_alleen_laagst_staat():
    agenda = _agenda(_ob_html())
    assert "Dat is de laagst scorende stelling in het cijferbeeld." in agenda
    assert "een van de laagst scorende stellingen" not in agenda


@pytest.mark.parametrize("tie", ["zelfde_factor", "andere_factor", "afronding"])
def test_het_rapport_claimt_niet_exclusief_bij_een_gedeelde_laagste_score(tie):
    agenda = _agenda(_ob_html(tie=tie))
    assert "Dat is een van de laagst scorende stellingen in het cijferbeeld." in agenda
    assert "Dat is de laagst scorende stelling in het cijferbeeld." not in agenda


def test_de_slotpagina_van_loep_start_is_vrij_van_em_dashes():
    agenda = _agenda(_ob_html())
    assert "—" not in agenda and "&#x2014;" not in agenda
