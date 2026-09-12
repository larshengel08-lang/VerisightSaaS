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
binnen de eerste factor, terwijl een stelling in een andere factor dezelfde of
een lagere score kan halen. Het startthema is de laagste factor op het
GEMIDDELDE, en een gemiddelde verbergt zijn spreiding.
"""
import pytest

from backend.report_html import (
    ONBOARDING_GEEN_RANGORDE,
    ONBOARDING_GEEN_VERDIEPING_NOTE,
    ONBOARDING_GEEN_VERDIEPING_NOTE_DEGRADED,
    _laagste_stelling_reikwijdte,
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

    tie kiest de situatie die de claim over de laagste stelling moet begrenzen:

    * "zelfde_factor": een tweede stelling in dezelfde factor met dezelfde score;
    * "andere_factor": een stelling in een andere factor met dezelfde score
      (precies de situatie die de oude min() over één factor niet zag);
    * "afronding": twee stellingen met een verschillende ruwe score die allebei
      als 5.1 op de pagina staan;
    * "lager_elders": zelfconsistente data waarin een andere factor een LAGERE
      losse stelling heeft dan het startthema. Werkdruk 5,1 is het gemiddelde
      van 5,6 en 4,6 en dus de laagste factor; groei 5,9 is het gemiddelde van
      8,0 en 3,8. Het startpunt is dan 4,6 terwijl 3,8 verderop in het rapport
      staat: niet de laagste van alles, dus ook niet "een van de laagste".
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
    elif tie == "lager_elders":
        data["factor_items_map"]["workload"] = [
            ("WL1", "Mijn werkdruk is behapbaar"),
            ("WL2", "Ik heb genoeg tijd om nieuw werk eigen te maken"),
        ]
        data["factor_items_map"]["growth"] = [
            ("GR1", "Ik zie voldoende ontwikkelmogelijkheden"),
            ("GR2", "Ik krijg de ruimte om te leren"),
        ]
        # Gemiddelden blijven kloppen: workload 5.1 = (5.6 + 4.6) / 2 en
        # growth 5.9 = (8.0 + 3.8) / 2.
        data["org_item_avgs"].update({"WL1": 5.6, "WL2": 4.6, "GR1": 8.0, "GR2": 3.8})
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
    assert ONBOARDING_GEEN_VERDIEPING_NOTE_DEGRADED not in html


def test_de_note_belooft_zonder_profiel_niet_dat_dit_rapport_laat_zien_waar_het_wringt():
    """Zonder factorprofiel weerlegde de note zichzelf binnen drie zinnen: het
    degraded blok eronder zegt juist dat Loep bij dit aantal antwoorden nog geen
    profiel per factor toont."""
    pagina = _page_two(_RENDERERS["onboarding"](_fixture("onboarding", n=8, profile=False)))
    assert ONBOARDING_GEEN_VERDIEPING_NOTE_DEGRADED in pagina
    assert "laat zien waar het wringt bij nieuwe medewerkers" not in pagina
    # De helft die over het product gaat en dus waar blijft, staat er nog.
    assert "Deze scan bevat nog geen verdiepingsvragen en geen richtingvraag." in pagina


def test_de_degraded_note_is_vrij_van_em_dashes_en_spreekt_niet_in_de_ik_vorm():
    for note in (ONBOARDING_GEEN_VERDIEPING_NOTE, ONBOARDING_GEEN_VERDIEPING_NOTE_DEGRADED):
        assert "—" not in note and "&#x2014;" not in note
        assert " ik " not in note.lower()


def test_de_datastatusregel_belooft_bij_loep_start_geen_verdieping():
    """Een paar centimeter onder de note stond "Verdieping opent zodra ...";
    die regel is gedeelde copy, dus exit en retention houden hun eigen tekst."""
    ob = _body(_RENDERERS["onboarding"](_ob_fixture()))
    assert "Deze onderdelen openen zodra er voldoende responses beschikbaar zijn." in ob
    assert ("Dit onderdeel opent zodra er per groep voldoende responses "
            "beschikbaar zijn.") in ob
    assert "Verdieping opent zodra" not in ob
    for scan_type in ("exit", "retention"):
        andere = _body(_RENDERERS[scan_type](_fixture(scan_type, n=_N_NORMAL, profile=True)))
        assert "Verdieping opent zodra voldoende responses beschikbaar zijn." in andere
        assert ("Verdieping opent zodra voldoende responses per groep beschikbaar "
                "zijn.") in andere


def test_de_rangordezin_verwijst_naar_het_hernoemde_hoofdstuk():
    ob = _body(_RENDERERS["onboarding"](_ob_fixture()))
    assert "vooraan bij de thema&#x27;s met de meeste aandacht" in ob
    assert "als eerste in de verdieping" not in ob


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
#
# Twee onafhankelijke vragen, vier uitkomsten. "Uniek" alleen is niet genoeg:
# de gekozen stelling is de laagste van het STARTTHEMA, en dat thema is de
# laagste factor op het gemiddelde. Een gemiddelde verbergt zijn spreiding, dus
# een andere factor kan een lagere losse stelling hebben.

@pytest.mark.parametrize("laagste_van_alles,uniek,verwacht", [
    (True,  True,  "Dat is de laagst scorende stelling in het cijferbeeld."),
    (True,  False, "Dat is een van de laagst scorende stellingen in het cijferbeeld."),
    (False, True,  "Dat is de laagst scorende stelling van dit thema."),
    (False, False, "Dat is een van de laagst scorende stellingen van dit thema."),
])
def test_de_zin_dekt_alle_vier_de_uitkomsten(laagste_van_alles, uniek, verwacht):
    zin = _laagste_stelling_zin("Rolhelderheid", "Ik weet wat er van mij wordt verwacht",
                                5.1, laagste_van_alles=laagste_van_alles, uniek=uniek)
    assert zin == ("Bespreek eerst ‘Ik weet wat er van mij wordt verwacht’ "
                   "binnen rolhelderheid (5.1/10). " + verwacht)


@pytest.mark.parametrize("score,alle,verwacht", [
    (4.6, [5.6, 4.6, 8.0, 3.8], (False, True)),   # lager elders: niet de laagste
    (3.8, [5.6, 4.6, 8.0, 3.8], (True, True)),    # wel de laagste, en uniek
    (5.1, [5.1, 5.1, 6.2], (True, False)),        # laagste maar gedeeld
    (5.14, [5.14, 5.09, 6.2], (True, False)),     # allebei 5.1 op de pagina
    (5.1, [5.1, None, 6.2], (True, True)),        # ontbrekende scores tellen niet mee
    (None, [5.1], (False, False)),                # geen score: geen claim
    (5.1, [], (False, False)),                    # niets om mee te vergelijken
])
def test_de_reikwijdte_eist_laagste_en_uniek(score, alle, verwacht):
    assert _laagste_stelling_reikwijdte(score, alle) == verwacht


def test_het_rapport_claimt_exclusief_als_de_stelling_echt_alleen_laagst_staat():
    agenda = _agenda(_ob_html())
    assert "Dat is de laagst scorende stelling in het cijferbeeld." in agenda
    assert "een van de laagst scorende stellingen" not in agenda


@pytest.mark.parametrize("tie", ["zelfde_factor", "andere_factor", "afronding"])
def test_het_rapport_claimt_niet_exclusief_bij_een_gedeelde_laagste_score(tie):
    agenda = _agenda(_ob_html(tie=tie))
    assert "Dat is een van de laagst scorende stellingen in het cijferbeeld." in agenda
    assert "Dat is de laagst scorende stelling in het cijferbeeld." not in agenda


def test_het_rapport_beperkt_zich_tot_het_thema_als_een_stelling_elders_lager_scoort():
    """De reviewbevinding: werkdruk 5,1 uit 5,6 en 4,6 is de laagste factor,
    groei 5,9 uit 8,0 en 3,8. Het startpunt 4,6 is dan niet de laagste van het
    rapport, en 3,8 staat twee pagina's verderop."""
    body = _ob_html(tie="lager_elders")
    agenda = _agenda(body)
    assert "Dat is de laagst scorende stelling van dit thema." in agenda
    assert "in het cijferbeeld" not in agenda
    # De lagere stelling staat er echt, anders test dit niets.
    assert "3.8" in body


def test_de_slotpagina_van_loep_start_is_vrij_van_em_dashes():
    agenda = _agenda(_ob_html())
    assert "—" not in agenda and "&#x2014;" not in agenda
