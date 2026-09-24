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
