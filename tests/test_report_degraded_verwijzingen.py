"""Geen enkele sectie verwijst naar een factorprofiel dat er niet is.

Gevonden bij de eind-tot-eind-lezing van stresstest-scenario 07 (Loep Vertrek,
n=8) die hoorde bij de fix-ronde op B2/B3. Drie sjabloonzinnen bleven daar
staan en beloofden alle drie een profiel per factor dat het document niet
bevat:

1. de intro van het overzichtsprofiel beschrijft "elke factor hieronder" en
   belooft dat je "bij de gespreksagenda verderop per factor ziet welke
   signalen meewogen in de volgorde" -- op een pagina zonder factoren en in
   een rapport zonder volgorde;
2. de intro van de vertrekcontext belooft dat de redenen "samen met de
   factorscores verderop" laten zien of beide hetzelfde verhaal vertellen;
3. de kaart "Relatie met het overzichtsprofiel" op diezelfde pagina verwijst
   naar "de factoren die bovenaan de rangorde staan" en naar "de factordiepte
   hierna".

Zelfde Fail-Loud-defect als B2 en B3: het rapport belooft wat het niet levert.
"""
import pytest

from backend.report_html import SECTION_INTROS
from backend.scoring_config import MIN_AGGREGATE_N

from tests.test_report_degraded_page_two import _RENDERERS, _body, _fixture

_N_DEGRADED = 8
_N_NORMAL = 12
assert _N_DEGRADED < MIN_AGGREGATE_N <= _N_NORMAL

SCANS = ["exit", "retention", "onboarding"]


def _render(scan_type: str, *, profile: bool) -> str:
    return _body(_RENDERERS[scan_type](
        _fixture(scan_type, n=_N_NORMAL if profile else _N_DEGRADED, profile=profile)))


# ── 1. Overzichtsprofiel ────────────────────────────────────────────────────

@pytest.mark.parametrize("scan_type", SCANS)
def test_overzichtsprofiel_beschrijft_geen_factoren_die_er_niet_staan(scan_type):
    body = _render(scan_type, profile=False)
    assert SECTION_INTROS["overzichtsprofiel"] not in body
    assert "Elke factor hieronder is een thema" not in body
    assert "welke signalen meewogen in de volgorde" not in body
    assert "het laagst scoort, is het logische begin" not in body
    # De legenda legt kleuren uit van balken die er niet zijn.
    assert "kwetsbaar punt &nbsp;" not in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_overzichtsprofiel_zegt_eerlijk_wat_er_ontbreekt(scan_type):
    body = _render(scan_type, profile=False)
    assert ("Voor deze meting zijn er geen scores per factor berekend, dus staat "
            "hier nog geen profiel.") in body
    # Het oude bericht schreef het ontbreken onterecht toe aan het aantal: de
    # lege staat hangt aan een leeg factorprofiel, niet aan n.
    assert "Onvoldoende responses (<10)" not in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_overzichtsprofiel_ongewijzigd_met_profiel(scan_type):
    body = _render(scan_type, profile=True)
    assert SECTION_INTROS["overzichtsprofiel"] in body
    assert "kwetsbaar punt &nbsp;" in body
    assert "Voor deze meting zijn er geen scores per factor berekend, dus staat" not in body


# ── 2 en 3. Vertrekcontext (alleen Loep Vertrek) ────────────────────────────

def test_vertrekcontext_belooft_geen_factorscores_verderop():
    body = _render("exit", profile=False)
    assert SECTION_INTROS["vertrekcontext"] not in body
    assert "Samen met de factorscores verderop" not in body
    # De overgebleven zinnen blijven wel staan.
    assert "Deze pagina zet de vertrekredenen op een rij" in body
    assert "niet wie er nog zal vertrekken" in body


def test_vertrekcontext_verwijst_niet_naar_een_rangorde_die_er_niet_is():
    body = _render("exit", profile=False)
    assert "Relatie met het overzichtsprofiel" not in body
    assert "De factoren die bovenaan de rangorde staan" not in body
    assert "komen terug in de factordiepte hierna" not in body


def test_vertrekcontext_ongewijzigd_met_profiel():
    body = _render("exit", profile=True)
    assert SECTION_INTROS["vertrekcontext"] in body
    assert "Relatie met het overzichtsprofiel" in body


# ── Tweede ronde: vier beloftes die de degraded staat niet waarmaakt ─────────
#
# Gevonden bij de herlezing van scenario 07 na de eerste fix-ronde. Vier
# sjabloonteksten bleven staan en verwijzen elk naar iets wat op diezelfde
# pagina of even verderop ontkend wordt:
#
# 4. de intro van de behoudscontext noemt "de werkfactoren uit het
#    overzichtsprofiel", terwijl dat hoofdstuk zegt dat er geen factorscores
#    berekend zijn;
# 5. de intro van het checkpointoverzicht noemt "de landingsdomeinen uit dit
#    rapport", direct boven "Voor deze meting zijn er geen scores per domein
#    berekend";
# 6. het lege verdiepingshoofdstuk hield zijn oude bewoording ("beschikbaar na
#    voldoende patroonduiding") terwijl pagina twee zegt dat een verdieping per
#    thema er nog niet in staat;
# 7. de methodiekcel "Hoe de banden werken" belooft een rangorde tussen de
#    eigen factoren in een rapport waarvan de rasterpagina zegt dat er geen
#    volgorde is.


# ── 4. Behoudscontext (alleen Loep Behoud) ──────────────────────────────────

def test_behoudscontext_intro_verwijst_niet_naar_het_overzichtsprofiel():
    # De samenstelling van het signaal blijft waar; alleen de verwijzing naar
    # een hoofdstuk dat in deze staat leeg is, verdwijnt.
    assert "uit het overzichtsprofiel" not in SECTION_INTROS["behoudscontext"]
    body = _render("retention", profile=False)
    assert "de werkfactoren en de werkbeleving samen" in body
    assert "uit het overzichtsprofiel" not in body


def test_behoudscontext_intro_blijft_verder_intact():
    body = _render("retention", profile=True)
    assert SECTION_INTROS["behoudscontext"] in body
    assert "Hoe hoger, hoe beter" in body
    assert "Het doet bewust geen uitspraken over individuen." in body


# ── 5. Checkpointoverzicht (alleen Loep Start) ──────────────────────────────

def test_checkpointoverzicht_intro_verwijst_niet_naar_dit_rapport():
    assert "uit dit rapport samengebracht" not in SECTION_INTROS["checkpointoverzicht"]
    body = _render("onboarding", profile=False)
    assert "de landingsdomeinen samengebracht tot" in body
    # De ontkenning staat op dezelfde pagina; de intro mag er niet naar wijzen.
    assert "Voor deze meting zijn er geen scores per domein berekend." in body


def test_checkpointoverzicht_intro_blijft_verder_intact():
    body = _render("onboarding", profile=True)
    assert SECTION_INTROS["checkpointoverzicht"] in body
    assert "Hoe hoger, hoe beter" in body


# ── 6. Leeg verdiepingshoofdstuk ────────────────────────────────────────────

@pytest.mark.parametrize("scan_type", SCANS)
def test_lege_verdieping_gebruikt_dezelfde_bewoording_als_de_rest(scan_type):
    body = _render(scan_type, profile=False)
    assert "Factor detail beschikbaar na voldoende patroonduiding" not in body
    assert ("Voor deze meting zijn er geen scores per factor berekend. Zonder "
            "die scores is er geen rangorde om een verdieping aan op te "
            "hangen.") in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_verdiepingshoofdstuk_blijft_bestaan_zodat_de_leesroute_klopt(scan_type):
    # Bewust niet onderdrukt: het hoofdstuk bestaat in elke staat, net als de
    # rasterpagina, die bij lege data ook blijft staan en zelf benoemt dat er
    # geen rangorde is. Onderdrukken zou het hoofdstuk laten verdwijnen in de
    # staat waarin pagina twee nog wél de normale leesroute toont (factoren
    # zonder prioritaire selectie).
    body = _render(scan_type, profile=False)
    assert "Verdieping: prioritaire factoren" in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_verdieping_ongewijzigd_met_profiel(scan_type):
    body = _render(scan_type, profile=True)
    assert "Verdieping: prioritaire factoren" not in body
    assert "geen rangorde om een verdieping aan op te hangen" not in body


# ── 7. Methodiekcel "Hoe de banden werken" ──────────────────────────────────

@pytest.mark.parametrize("scan_type", SCANS)
def test_banden_beloven_geen_rangorde_zonder_factorprofiel(scan_type):
    body = _render(scan_type, profile=False)
    assert "De rangorde tussen de eigen factoren weegt zwaarder" not in body
    assert ("In dit rapport staat nog geen rangorde tussen de eigen factoren: "
            "daarvoor zijn er geen factorscores berekend.") in body
    # De rest van de cel blijft staan: de drempels zijn een eigenschap van de
    # schaal, niet van deze meting.
    assert "zijn vaste schaaldrempels, geen vergelijking met" in body
    assert "meting en vervolgmeting een-op-een vergelijkbaar" in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_banden_ongewijzigd_met_factorprofiel(scan_type):
    body = _render(scan_type, profile=True)
    assert "De rangorde tussen de eigen factoren weegt zwaarder dan de absolute kleur." in body
    assert "In dit rapport staat nog geen rangorde" not in body
