"""Taak 11 (polijstronde): de tussenmeting in het productie-image.

De render na taak 10 had 13 van de 34 bestanden met bevindingen (nulmeting: 3).
Deze tests pinnen de ingrepen die de paginering terugbrachten. Het echte bewijs
is de render in het productie-image (scripts/render_in_image.py); deze tests
bewaken alleen tegen per ongeluk terugdraaien.

- R10-zin in twee kolommen onder de rechterkolom (Vertrek "06 Per afdeling" op
  een eigen vel van 11%).
- V16-zin als slotzin van de intro-alinea (getest in test_polijstronde_vertrek).
- Geen lege kaart in een overzichtsprofiel zonder balken (07: "04 Verdieping"
  op een eigen vel van 12%).
- Afdelingskaart en uitsplitsing krapper (04: uitsplitsing op een vel van 21%).
- Eerste verdiepingsblok 6px dichter onder het overzichtsprofiel (18).
- p.02: meetgegevensblok 4px hoger, R21-zin korter (Vertrek p.02 liep over).
- Richtingblok: uitleg en totaalregel over de volle breedte, R19 in de korte
  vorm (19: werkvragen alleen op een vel).
"""
import re

import pytest

from backend.report_css import build_css
from backend.report_html import _overzichtsprofiel, _werkbeleving_section
from scripts import stresstest_report as st


pytestmark = pytest.mark.usefixtures("stresstest_naar_tmp")

_CACHE: dict[str, str] = {}


def _html(key: str) -> str:
    if key not in _CACHE:
        sc = {s.key: s for s in st.SCENARIOS}[key]
        with open(st.run_scenario(sc)["html"], encoding="utf-8") as fh:
            _CACHE[key] = fh.read()
    return _CACHE[key]


def _css() -> str:
    return re.sub(r"\s+", " ", build_css("retention"))


# ── R10-zin in twee kolommen ─────────────────────────────────────────────────

def _volle_sdt(scores):
    from backend.report_html import SDT_DIMENSION_ITEMS
    sim = {ik: scores[dim] for dim, items in SDT_DIMENSION_ITEMS.items() for ik in items}
    items = [(ik, "Stelling " + ik) for ik in sim]
    return sim, items


ONDER_DRUK = "Hier staat de werkbeleving zelf ook onder druk: geen van de drie scoort relatief sterk."


def test_r10_zin_in_twee_kolommen_onder_de_rechterkolom():
    scores = {"autonomy": 5.9, "competence": 5.8, "relatedness": 6.0}
    sim, items = _volle_sdt(scores)
    html = _werkbeleving_section(scores, sim, items, "<span>kop</span>",
                                 factor_avgs={"growth": 4.5})
    assert 'class="tcol wb-cols"' in html
    # Niet tussen de balken en de kolommen, wel als laatste in de rechterkolom.
    assert html.index('class="tcol wb-cols"') < html.index(ONDER_DRUK)
    rechts = html[html.index('class="tc-r"'):]
    assert f'<p class="wb-duiding">{ONDER_DRUK}</p></div></div>' in rechts
    # De kaartverdeling verandert niet: links twee kaarten, rechts een.
    links = html[html.index('class="tc-l"'):html.index('class="tc-r"')]
    assert links.count('class="card no-break"') == 2
    assert rechts.count('class="card no-break"') == 1


def test_r10_zin_in_een_kolom_blijft_onder_de_balken():
    """Loep Start (een stelling per dimensie): geen kolommen, dus de zin blijft
    direct onder de balkenkaart."""
    from backend.report_html import SDT_DIMENSION_ITEMS
    scores = {"autonomy": 5.9, "competence": 5.8, "relatedness": 6.0}
    sim = {items[0]: scores[dim] for dim, items in SDT_DIMENSION_ITEMS.items()}
    items = [(ik, "Stelling " + ik) for ik in sim]
    html = _werkbeleving_section(scores, sim, items, "<span>kop</span>",
                                 factor_avgs={"growth": 4.5})
    assert 'class="tcol wb-cols"' not in html
    assert "wb-duiding" not in html
    assert ONDER_DRUK in html
    assert html.index(ONDER_DRUK) < html.index('class="card no-break"')


def test_r10_css_ingesprongen_tot_de_kaarttekst():
    assert re.search(r"\.wb-cols \.wb-duiding \{[^}]*font-size: 11px[^}]*margin: 6px 0 0 14px", _css())


def test_vertrek_08_r10_zin_in_de_rechterkolom():
    html = _html("08_exit_n12")
    wb = html[html.index('id="sec-werkbeleving"'):]
    rechts = wb[wb.index('class="tc-r"'):]
    assert '<p class="wb-duiding">Hier staat de werkbeleving' in rechts


# ── Overzichtsprofiel zonder balken: geen lege kaart ─────────────────────────

def test_overzichtsprofiel_zonder_balken_heeft_geen_lege_kaart():
    html = _overzichtsprofiel([], summary="Geen profiel.", scan_type="exit")
    assert '<div class="card">' not in html
    assert "Geen profiel." in html
    met = _overzichtsprofiel([("Groei", 4.5)], summary="x", scan_type="exit")
    assert '<div class="card">' in met


def test_vertrek_07_zonder_lege_kaart():
    html = _html("07_exit_n8")
    assert '<div class="card"></div>' not in html


# ── Afdelingen: krappere kaart en uitsplitsing ───────────────────────────────

def test_afdelingskaart_krappere_onderpadding():
    assert re.search(r"\.card\.seg-card \{ padding-bottom: 6px; \}", _css())


def test_scenario_04_uitsplitsing_krapper():
    html = _html("04_alles_hoog")
    assert '<div class="card seg-card">' in html
    assert '<p style="font-size:10px;color:#64748B;margin:6px 0 0;">Alle onderwerpen per afdeling:' in html
    assert '<div class="no-break" style="margin-top:6px;">' in html


# ── Eerste verdiepingsblok ───────────────────────────────────────────────────

def test_eerste_verdiepingsblok_dichter_onder_het_profiel():
    assert ".sec.flow.verd.verd-eerste { margin-top: -26px; }" in _css()


# ── Richtingblok ─────────────────────────────────────────────────────────────

def test_richtingblok_uitleg_en_totaalregel_volle_breedte():
    css = _css()
    assert ".dir-block .dir-intro, .dir-block .dir-totals { max-width: none; }" in css
    # Alleen binnen .dir-block: de algemene .dir-intro (ook in het
    # werkvragenblok) houdt zijn 70ch.
    assert re.search(r"(?<![\w-])\.dir-intro \{[^}]*max-width: 70ch", css)


def test_scenario_19_korte_niet_gekozen_regel():
    html = _html("19_vlak_niets_nodig")
    regels = re.findall(r'<div class="dir-unchosen">(.*?)</div>', html)
    assert regels, "geen niet-gekozen-regel in 19"
    for regel in regels:
        assert re.fullmatch(r"Niet gekozen: \d+ andere richtingen?\.", regel), regel


# ── p.02 ─────────────────────────────────────────────────────────────────────

def test_p02_leidraad_korte_terugkoppelingszin_in_vertrek():
    html = _html("22_exit_uitstroom_rand")
    rij = re.search(r'<tr><td class="lt">31-45 min</td>.*?</tr>', html, re.S).group(0)
    assert "vervolgmoment. Vul de terugkoppeling dan toch in. Het besluit leg je vast op pagina" in rij
    assert "als je het tweede punt parkeert" not in rij
