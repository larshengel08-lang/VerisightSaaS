"""Fixronde na de koude leesronde van 24-9 (docs/superpowers/plans/2026-09-24-fixronde-leesronde.md).

Elke sectie hoort bij één taak van het plan; de zinnen die hier gepind worden
komen letterlijk uit het plan. Loep Start valt buiten deze ronde: waar een test
Loep Start noemt, is het om te bewijzen dat daar niets verandert.
"""
import re

import pytest

from backend.report_html import (
    LEIDRAAD_ANKERS,
    WERKVRAGEN_EYEBROW,
    _besluit_page,
    _intentie_duiding,
    _leidraad_block,
    render_exit_report_html,
    render_onboarding_report_html,
    render_retention_report_html,
)
from tests.test_report_degraded_page_two import _body, _fixture, _page_two
from tests.test_report_p02_mtvel import _retention_met_secties

STREEPJES = ("—", "–")


def _plain(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def _rij(html: str, tijd: str) -> str:
    """De HTML van één leidraadrij, vanaf het tijdvak tot het einde van de rij."""
    start = html.index(tijd)
    return html[start:html.index("</tr>", start)]


def _href(anker: str) -> str:
    return 'href="#' + LEIDRAAD_ANKERS[anker] + '"'


# ── Taak 2: verwijzingen naar het werkvragenblok, slot van de vergadering ────

def test_rij_vijf_wijst_naar_het_werkvragenblok_zelf():
    html = _leidraad_block("retention", has_segments=True, has_quotes=True,
                           has_deepening=True, has_werkvragen=True)
    rij = _rij(html, "31-45 min")
    assert _href("werkvragen") in rij
    assert _href("besluit") in rij
    assert _href("agenda") not in rij


PARKEERZIN = ("Het tweede punt alleen als er tijd is, anders parkeren jullie het tot het "
              "vervolgmoment.")
OVERSLAANZIN = "Bij het startpunt sla je Herkennen over, dat deden jullie al; neem wat eronder staat."


def test_rij_vijf_zegt_wat_je_overslaat_en_wat_je_parkeert():
    html = _leidraad_block("exit", has_segments=False, has_quotes=True,
                           has_deepening=True, has_werkvragen=True, has_tweede_punt=True)
    tekst = _plain(_rij(html, "31-45 min"))
    assert OVERSLAANZIN in tekst
    assert PARKEERZIN in tekst


def test_rij_vijf_zonder_tweede_punt_noemt_geen_parkeren():
    """Codereview Taak 2: zonder tweede gesprekspunt gaat de parkeerzin over
    een punt dat niet op tafel ligt."""
    html = _leidraad_block("exit", has_segments=False, has_quotes=True,
                           has_deepening=True, has_werkvragen=True)
    tekst = _plain(_rij(html, "31-45 min"))
    assert OVERSLAANZIN in tekst
    assert "tweede punt" not in tekst.lower()
    assert "parkeren" not in tekst
    assert "Het besluit leg je vast op pagina" in tekst


def _retention_met_tweede_punt() -> dict:
    return _fixture("retention", n=25, profile=True)


@pytest.mark.parametrize("data_fn, tweede", [
    (_retention_met_secties, False),
    (_retention_met_tweede_punt, True),
])
def test_render_noemt_parkeren_alleen_met_een_tweede_punt(data_fn, tweede):
    """De renderer leidt de vlag af uit dezelfde ranglijst als het
    werkvragenblok: parkeerzin op p.02 als en alleen als er een kaart
    "Tweede punt" staat."""
    html = render_retention_report_html(data_fn())
    p02 = _plain(_page_two(html))
    assert OVERSLAANZIN in p02
    assert ("Tweede punt: " in _body(html)) is tweede
    assert (PARKEERZIN in p02) is tweede


def test_tijdvakken_geven_het_slot_veertien_minuten():
    html = _leidraad_block("retention", has_segments=True, has_quotes=True,
                           has_deepening=True, has_werkvragen=True)
    tekst = _plain(html)
    for tijd in ("0-5 min", "5-12 min", "12-25 min", "25-31 min", "31-45 min"):
        assert tijd in tekst
    assert "25-33 min" not in tekst and "33-45 min" not in tekst
    assert html.count("<tr>") == 5


def test_zonder_werkvragen_wijst_rij_vijf_naar_het_eerste_gesprekspunt():
    html = _leidraad_block("onboarding", has_segments=False, has_quotes=False,
                           has_deepening=False)
    rij = _rij(html, "31-45 min")
    assert "Het eerste gesprekspunt (pagina" in _plain(rij)
    assert _href("agenda") in rij
    assert "werkvragen" not in _plain(rij).lower()


def test_leidraadcopy_zonder_streepjes():
    for kwargs in (dict(has_werkvragen=True), dict(has_werkvragen=False)):
        html = _leidraad_block("retention", has_segments=True, has_quotes=True,
                               has_deepening=True, **kwargs)
        for streep in STREEPJES:
            assert streep not in html


def _exit_met_toelichtingen() -> dict:
    data = _fixture("exit", n=25, profile=True)
    data["open_texts"] = ["Toelichting " + str(i) for i in range(6)]
    return data


@pytest.mark.parametrize("render, data_fn", [
    (render_retention_report_html, _retention_met_secties),
    (render_exit_report_html, _exit_met_toelichtingen),
])
def test_render_verwijst_naar_een_werkvragenblok_dat_er_is(render, data_fn):
    html = render(data_fn())
    assert _href("werkvragen") in _page_two(html)
    assert _body(html).count('id="' + LEIDRAAD_ANKERS["werkvragen"] + '"') == 1


@pytest.mark.parametrize("render, data_fn", [
    (render_retention_report_html, _retention_met_secties),
    (render_exit_report_html, _exit_met_toelichtingen),
])
def test_werkvragenanker_staat_op_het_werkvragenblok_zelf(render, data_fn):
    """Codereview Taak 1: de PDF-meting kijkt alleen of het getoonde nummer de
    pagina van het anker is, niet op welk element het anker staat. Deze test
    pint dat het anker op de wrapper van het blok "Zo maak je er een besluit
    van" staat, direct gevolgd door de eigen eyebrow van dat blok, en niet op
    bijvoorbeeld de hoofdstukkop van de gespreksagenda."""
    body = _body(render(data_fn()))
    anker = 'id="' + LEIDRAAD_ANKERS["werkvragen"] + '"'
    i = body.index(anker)
    tag_start = body.rindex("<", 0, i)
    tag = body[tag_start:body.index(">", i) + 1]
    assert tag == '<div class="wq-block" ' + anker + ">"
    volgend = body[tag_start + len(tag):tag_start + len(tag) + 200]
    assert volgend.startswith('<span class="eyebrow">' + WERKVRAGEN_EYEBROW + "</span>")


def test_besluitpagina_verwijst_naar_het_werkvragenblok():
    html = _besluit_page(opener_html="<h2>kop</h2>", scan_type="retention", campaign_name="Wave 1",
                         startpunt_label="Groeiperspectief", tweede_label=None,
                         review_hint="Richtlijn: 45 tot 90 dagen na dit gesprek.",
                         heeft_werkvragen=True)
    assert _href("werkvragen") in html
    assert _href("agenda") not in html


def test_loep_start_verandert_niet():
    """Loep Start valt buiten deze ronde: geen werkvragen, geen verwijzing ernaar."""
    body = _body(render_onboarding_report_html(_fixture("onboarding", n=25, profile=True)))
    assert 'id="' + LEIDRAAD_ANKERS["werkvragen"] + '"' not in body
    assert _href("werkvragen") not in body


# ── Taak 3: blijf- en vertrekintentie duiden (R1) ───────────────────────────
# Tekst na de codereview van taak 3 (controllerbesluit, wijkt af van de plantekst):
# de kern noemt blijf- en vertrekintentie bij naam, "waar het wringt" alleen bij
# een startpunt dat niet relatief sterk scoort, "mogelijk startpunt" bij een
# indicatief beeld, en rij 2 van de leidraad noemt beide intenties.

STAY = [2.0] * 25 + [5.5] * 8 + [8.0] * 6        # n=39
TO_VEEL = [7.0] * 19 + [3.0] * 20                 # 19 van de 39 vanaf 6,5
KERN = ("Blijf- en vertrekintentie zeggen hoe dringend behoud hier is, niet bij welke afdeling "
        "het speelt of waarom: dit rapport splitst ze niet per afdeling uit.")
SLOT = ("Daarom begint het gesprek bij Groeiperspectief: daar zie je waar het wringt, en daar "
        "kan het MT zelf iets besluiten.")
SLOT_STERK = "Daarom begint het gesprek bij Groeiperspectief: daar kan het MT zelf iets besluiten."
SLOT_INDICATIEF = ("Daarom kiest Loep Groeiperspectief als mogelijk startpunt voor het gesprek: daar "
                   "zie je waar het wringt, en daar kan het MT zelf iets besluiten.")
LEIDRAADZIN = ("Gaat het over blijf- of vertrekintentie, lees dan de regel onder de cijfers "
               "hierboven voor.")
DUIDING = "hoe dringend behoud hier is"


def _duiding(avg_si=3.9, stay=STAY, to=TO_VEEL, *, startpunt="Groeiperspectief",
             score=4.5, indicatief=False) -> str:
    return _intentie_duiding(avg_si, stay, to, startpunt_label=startpunt,
                             startpunt_score=score, indicatief=indicatief)


def test_intentie_duiding_noemt_urgentie_grens_en_startpunt():
    html = _duiding()
    assert html.startswith('<p class="p02-duiding">')
    assert _plain(html) == ("19 van de 39 hebben veel vertrekgedachten (vertrekintentie vanaf "
                            "6,5). " + KERN + " " + SLOT)


def test_intentie_duiding_enkelvoud_en_nul():
    een = _plain(_duiding(to=[7.0] + [3.0] * 38))
    assert een.startswith("1 van de 39 heeft veel vertrekgedachten")
    geen = _plain(_duiding(to=[3.0] * 39))
    assert geen.startswith("Geen van de 39 heeft veel vertrekgedachten")


def test_vertrekscore_van_precies_zes_en_een_half_telt_als_veel():
    assert _plain(_duiding(to=[6.5] * 3 + [6.4] * 9)).startswith(
        "3 van de 12 hebben veel vertrekgedachten")


def test_intentie_duiding_zonder_genoeg_vertrekscores_noemt_alleen_de_leesregel():
    assert _plain(_duiding(to=[7.0] * 9)) == KERN + " " + SLOT


def test_intentie_duiding_ook_bij_een_aandachtspunt():
    assert KERN in _plain(_duiding(avg_si=5.8))


@pytest.mark.parametrize("avg_si, startpunt", [(7.0, "Groeiperspectief"), (None, "Groeiperspectief"),
                                               (3.9, None), (3.9, "")])
def test_intentie_duiding_zwijgt_als_er_niets_te_duiden_is(avg_si, startpunt):
    assert _duiding(avg_si=avg_si, startpunt=startpunt) == ""


@pytest.mark.parametrize("score", [6.5, 7.8, None])
def test_zonder_wringend_startpunt_geen_waar_het_wringt(score):
    """Een zwakke blijfintentie kan samengaan met onderwerpen die allemaal
    relatief sterk scoren; dan wringt het bij het startpunt niet aantoonbaar."""
    t = _plain(_duiding(score=score))
    assert t.endswith(SLOT_STERK)
    assert "wringt" not in t


@pytest.mark.parametrize("score", [4.5, 6.4])
def test_bij_een_kwetsbaar_of_wankel_startpunt_wel_waar_het_wringt(score):
    assert _plain(_duiding(score=score)).endswith(SLOT)


def test_indicatief_beeld_noemt_een_mogelijk_startpunt():
    t = _plain(_duiding(indicatief=True))
    assert t.endswith(SLOT_INDICATIEF)
    assert "Daarom begint het gesprek bij" not in t
    sterk = _plain(_duiding(indicatief=True, score=7.0))
    assert sterk.endswith("Daarom kiest Loep Groeiperspectief als mogelijk startpunt voor het "
                          "gesprek: daar kan het MT zelf iets besluiten.")


def test_intentie_duiding_claimt_geen_oorzaak_en_voorspelt_niets():
    for html in (_duiding(), _duiding(indicatief=True), _duiding(score=7.0)):
        t = _plain(html).lower()
        for fout in ("oorzaak", "komt door", "voorspel", "zullen vertrekken", "gaan vertrekken"):
            assert fout not in t
        assert not any(s in t for s in STREEPJES)


def _behoud(avg_si=3.9, stay=STAY, to=TO_VEEL, **over) -> dict:
    return _retention_met_secties(
        avg_si=avg_si, intent_resp={"stay": stay, "turnover": to, "engagement": [6.0] * len(stay)},
        **over)


def _duiding_html(p2: str) -> str:
    start = p2.index('<p class="p02-duiding">')
    return p2[start:p2.index("</p>", start) + 4]


def test_behoud_pagina_twee_draagt_de_duiding_en_de_leidraad_verwijst_ernaar():
    p2 = _page_two(render_retention_report_html(_behoud()))
    assert DUIDING in _plain(p2)
    # Startpunt workload 5.0 (aandachtspunt): de renderer geeft de score door,
    # dus de bijzin blijft staan (zonder score zou hij wegvallen).
    assert _plain(_duiding_html(p2)).endswith(
        ": daar zie je waar het wringt, en daar kan het MT zelf iets besluiten.")
    assert LEIDRAADZIN in _plain(_rij(p2, "5-12 min"))


def test_duiding_staat_tussen_de_cijfers_en_het_waaromblok():
    p2 = _page_two(render_retention_report_html(_behoud()))
    cijfers = p2.index('class="sg p02-cijfers"')
    duiding = p2.index('<p class="p02-duiding">')
    waarom = p2.index('class="why-title"')
    assert cijfers < duiding < waarom


def test_duiding_telt_hetzelfde_als_de_spreidingsstrook():
    """Zelfde getal als "Veel vertrekgedachten N" in de strook van de behoudscontext."""
    html = render_retention_report_html(_behoud())
    strook = re.findall(r"Veel vertrekgedachten (\d+)</span>", _body(html))
    assert strook, "spreidingsstrook vertrekintentie niet gevonden"
    assert set(strook) == {"19"}
    assert _plain(_duiding_html(_page_two(html))).startswith(
        strook[0] + " van de 39 hebben veel vertrekgedachten")


def test_behoud_met_sterke_blijfintentie_heeft_geen_duiding_en_geen_verwijzing():
    p2 = _plain(_page_two(render_retention_report_html(
        _behoud(avg_si=7.5, stay=[8.0] * 39, to=[2.0] * 39))))
    assert DUIDING not in p2
    assert "lees dan de regel onder de cijfers" not in p2


def test_degraded_pagina_twee_heeft_geen_duiding_en_geen_verwijzing():
    data = _fixture("retention", n=6, profile=False)
    data["avg_si"] = 3.9
    data["intent_resp"] = {"stay": [2.0] * 6, "turnover": [7.0] * 6, "engagement": [6.0] * 6}
    p2 = _page_two(render_retention_report_html(data))
    assert "p02-duiding" not in p2
    assert DUIDING not in _plain(p2)
    assert "lees dan de regel onder de cijfers" not in _plain(p2)


def test_renderer_indicatief_noemt_mogelijk_startpunt_in_de_duiding():
    data = _behoud(n_completed=39, n_invited=200)
    t = _plain(_duiding_html(_page_two(render_retention_report_html(data))))
    assert "als mogelijk startpunt voor het gesprek" in t
    assert "Daarom begint het gesprek bij" not in t


def test_renderer_relatief_sterk_startpunt_zonder_waar_het_wringt():
    data = _behoud(factor_avgs={"workload": 7.0}, top_risks=[("workload", 7.0)],
                   org_item_avgs={"W1": 7.0})
    t = _plain(_duiding_html(_page_two(render_retention_report_html(data))))
    assert t.endswith(": daar kan het MT zelf iets besluiten.")
    assert "wringt" not in t


def test_vertrek_krijgt_geen_intentieduiding():
    assert DUIDING not in _plain(render_exit_report_html(_exit_met_toelichtingen()))


# ── Taak 4: frictiescore uitleggen (V2) ─────────────────────────────────────

from backend.report_html import _frictie_duiding  # noqa: E402

FRICTIE = ("Frictiescore: de zes onderwerpen en de werkbeleving van de vertrekkers samen in één "
           "getal. Hier is hoger slechter, anders dan bij de andere scores in dit rapport: vanaf "
           "7,0 is de frictie sterk, onder 4,5 laag. Het getal zegt hoe breed het wringt, niet "
           "waar; dat laten de onderwerpen zien.")
# Zonder factorprofiel (minder dan 10 antwoorden) toont het rapport geen
# onderwerpen; de slotzin belooft dan niets wat niet rendert.
FRICTIE_ZONDER_PROFIEL = ("Frictiescore: de zes onderwerpen en de werkbeleving van de "
                          "vertrekkers samen in één getal. Hier is hoger slechter, anders dan "
                          "bij de andere scores in dit rapport: vanaf 7,0 is de frictie sterk, "
                          "onder 4,5 laag. Het getal zegt hoe breed het wringt, niet waar.")


def test_frictie_duiding_zegt_wat_het_meet_en_welke_kant_op():
    html = _frictie_duiding(5.0)
    assert html.startswith('<p class="p02-duiding">')
    assert _plain(html) == FRICTIE


def test_frictie_duiding_zonder_profiel_belooft_geen_onderwerpen():
    html = _frictie_duiding(5.0, met_onderwerpen=False)
    assert _plain(html) == FRICTIE_ZONDER_PROFIEL
    assert "onderwerpen zien" not in html


def test_frictie_duiding_grenzen_komen_uit_de_scoringconfig():
    from backend.scoring_config import RISK_HIGH, RISK_MEDIUM
    t = _plain(_frictie_duiding(5.0))
    assert "vanaf " + f"{RISK_HIGH:.1f}".replace(".", ",") + " is de frictie sterk" in t
    assert "onder " + f"{RISK_MEDIUM:.1f}".replace(".", ",") + " laag" in t


def test_frictie_duiding_zwijgt_zonder_score():
    assert _frictie_duiding(None) == ""
    assert _frictie_duiding(None, met_onderwerpen=False) == ""


def test_frictie_duiding_zonder_streepjes():
    for html in (_frictie_duiding(8.2), _frictie_duiding(3.0, met_onderwerpen=False)):
        assert not any(s in html for s in STREEPJES)


@pytest.mark.parametrize("profile, n, zin", [(True, 25, FRICTIE), (False, 7, FRICTIE_ZONDER_PROFIEL)])
def test_vertrek_pagina_twee_legt_de_frictiescore_uit(profile, n, zin):
    p2 = _plain(_page_two(render_exit_report_html(_fixture("exit", n=n, profile=profile))))
    assert zin in p2
    assert p2.count("Frictiescore:") == 1
    # De uitleg staat onder de cijfers, dus na de frictiescore-cel.
    assert p2.index("Frictiescore 5.5/10") < p2.index("Frictiescore:")


def test_vertrek_zonder_frictiescore_heeft_geen_frictieuitleg():
    data = _fixture("exit", n=25, profile=True)
    data["avg_risk"] = None
    assert "Frictiescore:" not in _plain(render_exit_report_html(data))


def test_behoud_heeft_geen_frictieuitleg():
    assert "Frictiescore:" not in _plain(render_retention_report_html(_retention_met_secties()))


def test_start_heeft_geen_frictieuitleg():
    assert "Frictiescore:" not in _plain(
        render_onboarding_report_html(_fixture("onboarding", n=25, profile=True)))


# ── Taak 5: namenregel Loep Vertrek (V1, V5) ────────────────────────────────

from backend.report_html import (  # noqa: E402
    NAMENREGEL_VERTREK,
    TOELICHTINGEN_VRAAG_VERTREK,
    _werkvragen_block,
)
from tests.test_report_priority_render import DIRECTION, RANKED  # noqa: E402


def test_namenregel_tekst():
    assert NAMENREGEL_VERTREK == ("Praat over hoe het werkt, niet over wie er vertrok. Valt er een "
                                  "naam, ga dan terug naar de vraag.")
    assert TOELICHTINGEN_VRAAG_VERTREK == ("Lees ze als patroon: wat komt terug in meer dan één "
                                           "antwoord? Raad niet wie wat schreef.")


def test_werkvragen_vertrek_dragen_de_namenregel_behoud_niet():
    assert NAMENREGEL_VERTREK in _plain(_werkvragen_block(RANKED, {}, DIRECTION, "exit"))
    assert NAMENREGEL_VERTREK not in _plain(_werkvragen_block(RANKED, {}, DIRECTION, "retention"))


def test_leidraad_vertrek_draagt_de_namenregel_en_de_vraag_bij_de_toelichtingen():
    tekst = _plain(_leidraad_block("exit", has_segments=False, has_quotes=True,
                                   has_deepening=True, has_werkvragen=True))
    assert NAMENREGEL_VERTREK in tekst
    assert "Vraag: wat komt terug in meer dan één antwoord?" in tekst


def test_leidraad_behoud_heeft_geen_namenregel():
    tekst = _plain(_leidraad_block("retention", has_segments=False, has_quotes=True,
                                   has_deepening=True, has_werkvragen=True))
    assert NAMENREGEL_VERTREK not in tekst
    assert "wat komt terug in meer dan één antwoord" not in tekst


def test_open_antwoorden_vertrek_dragen_vraag_en_namenregel():
    body = _body(render_exit_report_html(_exit_met_toelichtingen()))
    blok = body[body.index('id="' + LEIDRAAD_ANKERS["toelichtingen"] + '"'):]
    blok = _plain(blok[:blok.index("Toelichting 0")])
    assert TOELICHTINGEN_VRAAG_VERTREK + " " + NAMENREGEL_VERTREK in blok


def test_open_antwoorden_behoud_zonder_namenregel():
    assert NAMENREGEL_VERTREK not in _plain(render_retention_report_html(_retention_met_secties()))


# ── Taak 6: uitstroomperiode (V8) ───────────────────────────────────────────

from sqlalchemy.orm import Session  # noqa: E402

from backend.models import Campaign, Organization, Respondent, SurveyResponse  # noqa: E402
from backend.report_html import _responsbasis, _uitstroomperiode, build_report_data  # noqa: E402


def test_uitstroomperiode_zonder_maanden():
    assert _uitstroomperiode([], 12) == (
        None, "de maand van vertrek (niet vastgelegd; de meetperiode hierboven is de periode "
              "waarin de vragenlijst openstond)")
    assert _uitstroomperiode(None, 12)[0] is None


def test_uitstroomperiode_te_weinig_bekend():
    assert _uitstroomperiode(["2025-03", "2025-04", "2025-06"], 12) == (
        None, "de maand van vertrek (bij 3 van de 12 vastgelegd, te weinig om een periode te noemen)")


def test_uitstroomperiode_spreiding_en_deels_bekend():
    maanden = ["2026-02", "2025-03", "2025-07", "2025-11", "2025-09"]
    assert _uitstroomperiode(maanden, 12) == (
        "Uitstroomperiode: vertrokken tussen maart 2025 en februari 2026 (bij 5 van de 12 vastgelegd).",
        None)


def test_uitstroomperiode_een_maand_iedereen_bekend():
    assert _uitstroomperiode(["2026-03"] * 5, 5) == (
        "Uitstroomperiode: vertrokken in maart 2026.", None)


def test_responsbasis_toont_uitstroomregel_en_ontbrekende_maand():
    met = _plain(_responsbasis(invited=20, completed=12, period="Wave 1",
                               population="Uitgestroomde medewerkers", segment_available=True,
                               uitstroom_regel="Uitstroomperiode: vertrokken in maart 2026."))
    assert "Uitstroomperiode: vertrokken in maart 2026." in met
    zonder = _plain(_responsbasis(invited=20, completed=12, period="Wave 1",
                                  population="Uitgestroomde medewerkers", segment_available=True,
                                  extra_ontbreekt=["de maand van vertrek (niet vastgelegd)"]))
    assert "Niet in dit rapport: de maand van vertrek (niet vastgelegd)." in zonder


def test_vertrek_zonder_maanden_zegt_het_op_pagina_twee():
    p2 = _plain(_page_two(render_exit_report_html(_fixture("exit", n=25, profile=True))))
    assert "de maand van vertrek (niet vastgelegd" in p2


def test_vertrek_met_maanden_noemt_de_periode_op_pagina_twee():
    data = _fixture("exit", n=25, profile=True)
    data["exit_months"] = ["2025-03"] * 10 + ["2026-02"] * 10
    p2 = _plain(_page_two(render_exit_report_html(data)))
    assert "Uitstroomperiode: vertrokken tussen maart 2025 en februari 2026 (bij 20 van de 25 vastgelegd)." in p2


def _exit_met_maanden(db: Session, maanden: list[str | None], scan_type: str = "exit") -> str:
    org = Organization(name="TestOrg", slug="testorg-v8", contact_email="hr@test.nl")
    db.add(org)
    db.flush()
    camp = Campaign(organization=org, name="Wave 1", scan_type=scan_type, delivery_mode="baseline")
    db.add(camp)
    db.flush()
    for maand in maanden:
        r = Respondent(campaign=camp, department="Zorg", role_level="medewerker",
                       completed=True, exit_month=maand)
        db.add(r)
        db.add(SurveyResponse(respondent=r, sdt_raw={}, sdt_scores={}, org_raw={}, org_scores={},
                              pull_factors_raw={}, uwes_raw={}, turnover_intention_raw={},
                              risk_score=5.5, risk_band="MIDDEN", exit_reason_code="P1"))
    db.commit()
    return camp.id


def test_build_report_data_levert_geldige_vertrekmaanden(db_session: Session, caplog):
    cid = _exit_met_maanden(db_session, ["2025-03", "2025-13", None, "2026-02", "maart"])
    with caplog.at_level("WARNING", logger="backend.report_html"):
        assert sorted(build_report_data(cid, db_session)["exit_months"]) == ["2025-03", "2026-02"]
    # De twee ongeldige waarden verdwijnen niet stil (Fail Loud).
    assert any("2 exit_month-waarde(n) met onbekende vorm genegeerd" in r.getMessage()
               for r in caplog.records)


def test_build_report_data_behoud_heeft_geen_vertrekmaanden(db_session: Session):
    cid = _exit_met_maanden(db_session, ["2025-03"], scan_type="retention")
    assert build_report_data(cid, db_session)["exit_months"] == []


def test_uitstroomperiode_zonder_meetperiode_verwijst_niet_naar_een_leeg_vakje():
    assert _uitstroomperiode([], 12, heeft_meetperiode=False) == (
        None, "de maand van vertrek (niet vastgelegd)")
    # Met een meetperiode blijft de verwijzing staan.
    assert "de meetperiode hierboven" in _uitstroomperiode([], 12, heeft_meetperiode=True)[1]


@pytest.mark.parametrize("start, eind, conflict, verwijst", [
    ("9 maart 2026", "30 maart 2026", False, True),
    ("9 maart 2026", None, False, True),        # cel toont "vanaf 9 maart 2026, ..."
    (None, None, False, False),                 # cel toont "niet vastgelegd"
    (None, None, True, False),                  # cel toont "niet betrouwbaar vastgelegd"
])
def test_vertrek_verwijst_alleen_naar_een_getoonde_meetperiode(start, eind, conflict, verwijst):
    data = _fixture("exit", n=25, profile=True)
    data["period_start"], data["period_end"] = start, eind
    data["period_dates_conflict"] = conflict
    p2 = _plain(_page_two(render_exit_report_html(data)))
    assert "de maand van vertrek (niet vastgelegd" in p2
    assert ("de meetperiode hierboven is de periode waarin de vragenlijst openstond" in p2) is verwijst
    if not verwijst:
        assert "de maand van vertrek (niet vastgelegd)." in p2


@pytest.mark.parametrize("render, data", [
    (render_retention_report_html, lambda: _retention_met_secties()),
    (render_retention_report_html, lambda: _fixture("retention", n=25, profile=True)),
    (render_onboarding_report_html, lambda: _fixture("onboarding", n=25, profile=True)),
])
def test_behoud_en_start_noemen_geen_vertrekmaand(render, data):
    d = data()
    d["exit_months"] = ["2025-03"] * 10   # ook als de data ze toevallig draagt
    tekst = _plain(render(d))
    assert "maand van vertrek" not in tekst
    assert "Uitstroomperiode" not in tekst


# ── Taak 7, hefboom D1: lange of gedeelde hoofdreden van vertrek kleiner op p.02 ──

def test_hoofdredentegel_krijgt_kleinere_letter_bij_gelijkstand():
    from backend.report_html import _vertrekreden_cell
    er = [{"code": "PL1", "label": "Beter aanbod elders", "count": 4},
          {"code": "P1", "label": "Leiderschap / management", "count": 4}]
    cel = _vertrekreden_cell(er, 12)
    assert 'class="sc-v sc-reden sc-reden-lang"' in cel
    # De waarde blijft volledig zichtbaar: beide redenen staan er ongekort in.
    assert "Beter aanbod elders en Leiderschap / management" in cel


def test_hoofdredentegel_krijgt_kleinere_letter_bij_een_lange_losse_reden():
    from backend.report_html import VERTREKREDEN_LANG, _vertrekreden_cell
    label = "x" * (VERTREKREDEN_LANG + 1)
    cel = _vertrekreden_cell([{"code": "P1", "label": label, "count": 5}], 12)
    assert 'class="sc-v sc-reden sc-reden-lang"' in cel
    assert label in cel


def test_hoofdredentegel_houdt_gewone_letter_bij_een_korte_reden():
    from backend.report_html import VERTREKREDEN_LANG, _vertrekreden_cell
    from backend.scoring_config import EXIT_REASON_LABELS_NL
    # Elke bestaande losse reden past binnen de grens, dus geen kleinere letter.
    assert max(len(v) for v in EXIT_REASON_LABELS_NL.values()) <= VERTREKREDEN_LANG
    for label in EXIT_REASON_LABELS_NL.values():
        cel = _vertrekreden_cell([{"code": "P1", "label": label, "count": 5}], 12)
        assert 'class="sc-v sc-reden"' in cel
        assert "sc-reden-lang" not in cel


def test_hoofdredentegel_kleine_letter_niet_kleiner_dan_de_subregel():
    import re
    from backend.report_css import build_css
    css = build_css("exit")
    lang = re.search(r"#p02 \.sc-v\.sc-reden-lang \{[^}]*font-size: ([\d.]+)px", css)
    sub = re.search(r"\.sc-b \{[^}]*font-size: ([\d.]+)px", css)
    assert lang and sub
    assert float(sub.group(1)) <= float(lang.group(1)) < 14


# ── Taak 8: brugzin bij het tweede punt, afdelingsafspraak (R5) ─────────────

from backend.report_html import (  # noqa: E402
    BESLUIT_AFDELING_HINT,
    BESLUIT_AFDELING_LABEL,
    BESLUIT_AFDELING_SAMEN,
    BESLUIT_AFDELING_VRAAG,
    _besluit_afdeling,
    _brugzin,
    _fl,
)

SEG_OPS = {"department": "Operations", "score": 6.0, "n": 17, "invited": 21,
           "low_fk": "workload", "low_avg": 4.9, "rest_lager": False}


def test_brugzin_noemt_het_tweede_punt_als_het_hetzelfde_onderwerp_is():
    zin = _brugzin("growth", "Groeiperspectief", SEG_OPS, "retention", tweede_key="workload")
    assert zin == ("Organisatiebreed begint het gesprek bij Groeiperspectief. Bij Operations springt "
                   + _fl("workload", "retention") + " eruit (4.9/10); dat is ook het tweede punt, dus "
                   "neem Operations daarin mee.")


def test_brugzin_zonder_samenval_blijft_zoals_hij_was():
    zonder = _brugzin("growth", "Groeiperspectief", SEG_OPS, "retention", tweede_key="leadership")
    assert zonder.endswith("bespreek dat voor die afdeling na het startpunt.")
    assert _brugzin("growth", "Groeiperspectief", SEG_OPS, "retention") == zonder


def test_brugzin_bij_een_relatief_sterk_onderwerp_blijft_neutraal():
    sterk = dict(SEG_OPS, low_avg=6.8)
    zin = _brugzin("growth", "Groeiperspectief", sterk, "retention", tweede_key="workload")
    assert "tweede punt" not in zin
    assert zin.endswith("relatief sterk.")


# Doorgeschoven uit de review van taak 3: in de indicatieve staat (respons
# onder 30%) zegt elke zin die het startpunt noemt "mogelijk startpunt"
# (ronde 2, spec par. 6.1). Alle vijf varianten, ook "na het startpunt".
_BRUG_VARIANTEN = {
    "anders": dict(SEG_OPS),
    "samen": dict(SEG_OPS),
    "zelfde": dict(SEG_OPS),
    "sterk": dict(SEG_OPS, low_avg=6.8),
    "zonder_thema": dict(SEG_OPS, low_fk=None, low_avg=None, rest_lager=True),
}


def _brug_variant(naam: str, indicatief: bool) -> str:
    start = "workload" if naam == "zelfde" else "growth"
    label = _fl(start, "retention")
    return _brugzin(start, label, _BRUG_VARIANTEN[naam], "retention",
                    tweede_key="workload" if naam == "samen" else "leadership",
                    indicatief=indicatief)


@pytest.mark.parametrize("naam", sorted(_BRUG_VARIANTEN))
def test_brugzin_indicatief_noemt_een_mogelijk_startpunt(naam):
    vast = _brug_variant(naam, False)
    zin = _brug_variant(naam, True)
    assert zin and zin != vast
    assert "als mogelijk startpunt" in zin
    assert "begint het gesprek" not in zin
    assert "na het startpunt" not in zin
    assert not any(s in zin for s in STREEPJES)
    # De niet-indicatieve vorm is ongewijzigd en stellig.
    assert "mogelijk" not in vast


def test_brugzin_indicatief_letterlijk():
    assert _brug_variant("anders", True) == (
        "Organisatiebreed kiest Loep Groeiperspectief als mogelijk startpunt. Bij Operations "
        "springt " + _fl("workload", "retention") + " eruit (4.9/10); bespreek dat voor die "
        "afdeling daarna.")
    assert _brug_variant("zelfde", True) == (
        "Bij Operations weegt " + _fl("workload", "retention") + " het zwaarst (4.9/10); dat "
        "kiest Loep organisatiebreed ook als mogelijk startpunt.")
    assert _brug_variant("samen", True).endswith(
        "dat is ook het tweede punt, dus neem Operations daarin mee.")


def test_besluit_afdeling():
    assert _besluit_afdeling(None, "retention", "workload") is None
    assert _besluit_afdeling(SEG_OPS, "retention", "workload") == {
        "department": "Operations", "topic": _fl("workload", "retention"), "zwaar": True,
        "samen_met_tweede": True}
    zonder_onderwerp = _besluit_afdeling(dict(SEG_OPS, low_fk=None, low_avg=None), "retention", None)
    assert zonder_onderwerp == {"department": "Operations", "topic": None, "zwaar": False,
                                "samen_met_tweede": False}
    # Geen tweede punt: nooit "samen".
    assert _besluit_afdeling(SEG_OPS, "retention", None)["samen_met_tweede"] is False


def _besluit(**kw) -> str:
    basis = dict(opener_html="<h2>kop</h2>", scan_type="retention", campaign_name="Wave 1",
                 startpunt_label="Groeiperspectief", tweede_label="Werkdruk en herstelruimte",
                 review_hint="Richtlijn: 45 tot 90 dagen na dit gesprek.", heeft_werkvragen=True)
    basis.update(kw)
    return _besluit_page(**basis)


def test_besluitpagina_heeft_een_regel_voor_de_afdelingsafspraak():
    t = _plain(_besluit(afdeling={"department": "Operations", "topic": "Werkdruk en herstelruimte",
                                  "samen_met_tweede": True}))
    assert BESLUIT_AFDELING_LABEL in t
    assert "Operations: Werkdruk en herstelruimte" in t
    assert BESLUIT_AFDELING_SAMEN + " " + BESLUIT_AFDELING_HINT in t


def test_besluitpagina_zonder_aangewezen_afdeling_heeft_geen_afdelingsblok():
    assert BESLUIT_AFDELING_LABEL not in _plain(_besluit())


def test_afdelingsblok_staat_voor_de_terugkoppeling():
    t = _plain(_besluit(afdeling={"department": "Operations", "topic": None, "samen_met_tweede": False}))
    assert t.index(BESLUIT_AFDELING_LABEL) < t.index("Terugkoppeling aan medewerkers")
    assert "Operations" in t and "Operations:" not in t
    assert BESLUIT_AFDELING_SAMEN not in t


def test_afdelingshint_belooft_geen_toelichtingen_die_het_rapport_niet_toont():
    """Zelfde gate als de H7-regel op de afdelingspagina (_toont_toelichtingen):
    zonder toelichtingverdeling in het rapport zegt de hint niet dat het rapport
    ze 'alleen voor de hele organisatie' toont."""
    afd = {"department": "Operations", "topic": None, "samen_met_tweede": False}
    t = _plain(_besluit(afdeling=afd, afdeling_toelichtingen=False))
    assert BESLUIT_AFDELING_VRAAG in t
    assert "toelichtingen" not in t
    assert BESLUIT_AFDELING_HINT.endswith(BESLUIT_AFDELING_VRAAG)


def test_afdelingshint_volgt_het_tweede_punt_dat_het_mt_vastlegde():
    """Het MT kan in het dashboard een ander tweede punt vastleggen; dat wordt
    voorgedrukt. De samenval-regel mag dan niet naar het tweede punt van het
    rapport wijzen, alleen naar wat er op het vel staat."""
    afd = {"department": "Operations", "topic": "Werkdruk en herstelruimte", "zwaar": True,
           "samen_met_tweede": True}
    anders = _plain(_besluit(afdeling=afd, decision={"secondary_topic": "Leiderschap"}))
    assert BESLUIT_AFDELING_SAMEN not in anders
    zelf = dict(afd, samen_met_tweede=False)
    gekozen = _plain(_besluit(afdeling=zelf, decision={"secondary_topic": "werkdruk en herstelruimte "}))
    assert BESLUIT_AFDELING_SAMEN in gekozen


def test_nieuwe_besluitcopy_zonder_streepjes_en_zonder_wij():
    for tekst in (BESLUIT_AFDELING_LABEL, BESLUIT_AFDELING_HINT, BESLUIT_AFDELING_SAMEN):
        assert not any(s in tekst for s in STREEPJES)
        assert not re.search(r"\b(ik|wij|we)\b", tekst.lower())


def _retention_met_afdeling(low_fk: str, **over) -> dict:
    from tests.test_report_distribution import _min_retention_data
    d = _min_retention_data()
    d["factor_avgs"] = {"workload": 5.0, "leadership": 5.6}
    d["factor_items_map"] = {"workload": [("W1", "Testvraag werkdruk")],
                             "leadership": [("L1", "Testvraag leiding")]}
    d["org_item_avgs"] = {"W1": 5.0, "L1": 5.6}
    d["factor_resp_scores"] = {"workload": [2.0] * 6 + [8.0] * 6, "leadership": [5.6] * 12}
    d["segment_rows"] = [
        {"department": "Operations", "n": 12, "avg": 5.0, "scores": [5.0] * 12, "is_pooled": False},
        {"department": "Finance", "n": 12, "avg": 6.5, "scores": [6.5] * 12, "is_pooled": False},
    ]
    d["segment_factor_rows"] = {"Operations": {"factors": [(low_fk, 4.2, 12)], "omitted": 0}}
    d.update(over)
    return d


def _besluitdeel(html: str) -> str:
    start = html.index('class="pb sec besluit"')
    return html[start:html.index("Terugkoppeling aan medewerkers", start)]


def test_renderer_behoud_koppelt_afdeling_aan_het_tweede_punt():
    from backend.report_html import render_retention_report_html
    html = render_retention_report_html(_retention_met_afdeling("leadership"))
    t = _plain(html)
    assert t.count("dat is ook het tweede punt, dus neem Operations daarin mee.") == 2
    besluit = _plain(_besluitdeel(html))
    assert "Operations: " + _fl("leadership", "retention") in besluit
    assert BESLUIT_AFDELING_SAMEN in besluit


def test_renderer_behoud_zonder_aangewezen_afdeling_heeft_geen_afdelingsblok():
    from backend.report_html import render_retention_report_html
    d = _retention_met_afdeling("leadership")
    d["segment_rows"][1]["avg"] = 5.1   # verschil onder de grens: geen afdeling aangewezen
    html = render_retention_report_html(d)
    assert BESLUIT_AFDELING_LABEL not in html
    assert "dat is ook het tweede punt" not in html


def test_renderer_behoud_indicatief_zegt_mogelijk_startpunt_in_de_brugzin():
    from backend.report_html import render_retention_report_html
    d = _retention_met_afdeling("leadership", n_invited=100)   # 12 van 100: indicatief
    brug = re.findall(r'<p class="mq-brug[^"]*"[^>]*>(.*?)</p>', render_retention_report_html(d), re.S)
    assert len(brug) == 2
    assert all("als mogelijk startpunt" in _plain(b) and "begint het gesprek" not in _plain(b)
               for b in brug)


def test_renderer_vertrek_geeft_tweede_punt_en_afdeling_door():
    from backend.report_html import render_exit_report_html
    from tests.conftest import exit_report_data
    fa = {"role_clarity": 4.2, "leadership": 4.6, "culture": 6.1,
          "growth": 6.2, "compensation": 6.3, "workload": 6.4}
    d = exit_report_data(factor_avgs=fa,
                         factor_items_map={fk: [(f"{fk}_1", f"Stelling {fk}")] for fk in fa})
    d["segment_rows"] = [
        {"department": "Operations", "n": 12, "avg": 5.0, "scores": [5.0] * 12, "is_pooled": False},
        {"department": "Finance", "n": 12, "avg": 6.5, "scores": [6.5] * 12, "is_pooled": False},
    ]
    html = render_exit_report_html(d)
    tweede = re.search(r'Tweede punt</div><div class="bl-vast">([^<]+)<', html)
    assert tweede, "fixture moet een tweede punt hebben"
    # Kies als laagste onderwerp van Operations het tweede punt van de organisatie.
    tweede_key = next(k for k in d["factor_avgs"] if _fl(k, "exit") == tweede.group(1).strip())
    d["segment_factor_rows"] = {"Operations": {"factors": [(tweede_key, 4.2, 12)], "omitted": 0}}
    html = render_exit_report_html(d)
    assert "dat is ook het tweede punt, dus neem Operations daarin mee." in html
    besluit = _plain(_besluitdeel(html))
    assert BESLUIT_AFDELING_LABEL in besluit and BESLUIT_AFDELING_SAMEN in besluit


def test_besluitpagina_bij_een_relatief_sterk_onderwerp_zegt_geen_samenval():
    """Codereview taak 8: pagina twee blijft neutraal bij een relatief sterk
    onderwerp van de afdeling (_brugzin), dus de besluitpagina ook. Beide
    takken: het tweede punt van het rapport en een tweede punt uit het
    dashboard met dezelfde tekst."""
    sterk = dict(SEG_OPS, low_avg=6.8)
    afd = _besluit_afdeling(sterk, "retention", "workload")
    assert afd == {"department": "Operations", "topic": _fl("workload", "retention"),
                   "zwaar": False, "samen_met_tweede": False}
    rapport = _plain(_besluit(afdeling=afd, tweede_label=_fl("workload", "retention")))
    assert "Operations: " + _fl("workload", "retention") in rapport
    assert BESLUIT_AFDELING_SAMEN not in rapport
    dashboard = _plain(_besluit(afdeling=afd,
                                decision={"secondary_topic": _fl("workload", "retention")}))
    assert BESLUIT_AFDELING_SAMEN not in dashboard
    # Zelfde brugzin-regel: ook pagina twee noemt het tweede punt dan niet.
    assert "tweede punt" not in _brugzin("growth", "Groeiperspectief", sterk, "retention",
                                         tweede_key="workload")
    # Aandachtspunt (onder de grens) telt wel als zwaar.
    assert _besluit_afdeling(dict(SEG_OPS, low_avg=6.2), "retention", "workload")["samen_met_tweede"]


def test_renderer_behoud_relatief_sterk_onderwerp_geen_samenval_op_de_besluitpagina():
    from backend.report_html import render_retention_report_html
    d = _retention_met_afdeling("leadership")
    d["segment_factor_rows"] = {"Operations": {"factors": [("leadership", 6.8, 12)], "omitted": 0}}
    html = render_retention_report_html(d)
    besluit = _plain(_besluitdeel(html))
    assert BESLUIT_AFDELING_LABEL in besluit
    assert BESLUIT_AFDELING_SAMEN not in besluit
    assert "dat is ook het tweede punt" not in html
