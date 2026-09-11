"""Richtingantwoorden mogen niet verdwijnen onder de tien antwoorden (bug B3).

Bron: docs/rapport-stresstest-2026-09-10.md, scenario 07 (Loep Vertrek, n=8).

Elke respondent krijgt een gespreksrichtingvraag op de eigen laagst scorende
factor. In scenario 07 kregen acht mensen die vraag en beantwoordden zeven
hem. Toch stond het rapportblok "Wat er moet gebeuren" nergens: het rendert
kaarten op basis van `ranked` (de rasterrijen), en onder MIN_AGGREGATE_N zijn
er geen rasterrijen. De methodiekpagina achterin beloofde het blok wel, want
`direction_active` keek naar het BESTAAN van richtingdata in plaats van naar
wat er daadwerkelijk gerenderd was.

Twee dingen tegelijk fout dus: het rapport belooft een sectie die er niet is,
en zeven verzamelde antwoorden verdwijnen zonder één woord. Precies de stille
degradatie die het Fail-Loud-principe verbiedt.

Deze tests pinnen drie dingen:
1. onder de tien antwoorden staat het blok er wél, in degraded vorm, met de
   echte totalen (aangeboden / beantwoord / overgeslagen);
2. vanaf tien antwoorden verandert er niets aan het bestaande gedrag;
3. zonder richtingdata (niemand kreeg de vraag) staat het blok er niet én
   belooft de methodiekpagina het niet.
"""
import pytest

from backend.products.shared.deepening import get_direction_sets
from backend.report_html import AGENDA_OPENER_GEEN_PROFIEL, DIRECTION_BLOCK_EYEBROW
from backend.scoring_config import MIN_AGGREGATE_N
from tests.test_report_degraded_page_two import _RENDERERS, _body, _fixture

SCANS = ["exit", "retention"]

_N_DEGRADED = 8
_N_NORMAL = 12
assert _N_DEGRADED < MIN_AGGREGATE_N <= _N_NORMAL


def _agg(scan_type: str, spread: dict[str, tuple[int, int]]) -> dict:
    """Richting-aggregaat over alle factoren van een scan.

    spread: factor_key -> (answered, skipped). Elke beantwoorde respondent
    krijgt de eerste echte optie van die factor, zodat de optiesleutels uit de
    productiecontentset komen (geen verzonnen keys -- die horen te KeyErroren).
    Factoren die niet in spread staan krijgen een lege keten, net als
    aggregate_direction die aanlevert.
    """
    sets = get_direction_sets(scan_type)
    out = {}
    for fk in sets:
        answered, skipped = spread.get(fk, (0, 0))
        first_key = sets[fk]["options"][0]["key"]
        out[fk] = {
            "lowest_n": answered + skipped,
            "offered": answered + skipped,
            "answered": answered,
            "skipped": skipped,
            "counts": {first_key: answered} if answered else {},
        }
    return out


# Acht respondenten, acht keer aangeboden, zeven beantwoord, één overgeslagen
# -- dezelfde verdeling als stresstest-scenario 07.
_DEGRADED_SPREAD = {"leadership": (2, 1), "growth": (2, 0), "culture": (1, 0),
                    "workload": (1, 0), "role_clarity": (1, 0)}


def _render(scan_type: str, *, n: int, profile: bool, direction: dict | None) -> str:
    data = _fixture(scan_type, n=n, profile=profile)
    data["direction_agg"] = direction or {}
    return _RENDERERS[scan_type](data)


def _degraded(scan_type: str) -> str:
    return _body(_render(scan_type, n=_N_DEGRADED, profile=False,
                         direction=_agg(scan_type, _DEGRADED_SPREAD)))


# ── 1. Onder de tien antwoorden staat het blok er, met de echte totalen ──────

_EYEBROW_TAG = f'<span class="eyebrow">{DIRECTION_BLOCK_EYEBROW}</span>'


@pytest.mark.parametrize("scan_type", SCANS)
def test_blok_staat_er_ook_zonder_factorprofiel(scan_type):
    # Op de eyebrow-tag, niet op de kale string: de methodiekpagina citeert de
    # bloknaam ook, dus een losse substring-assertie zou altijd slagen.
    assert _EYEBROW_TAG in _degraded(scan_type)


@pytest.mark.parametrize("scan_type", SCANS)
def test_degraded_blok_noemt_de_echte_totalen(scan_type):
    body = _degraded(scan_type)
    assert ("Van de 8 respondenten kregen 8 deze vraag; 7 beantwoordden die, "
            "1 sloeg over.") in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_degraded_blok_zegt_waarom_er_geen_richting_hangt(scan_type):
    body = _degraded(scan_type)
    assert ("Zonder profiel per factor is er nog geen startpunt om die "
            "antwoorden aan te koppelen, en per onderwerp zijn het er te "
            "weinig om te tonen.") in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_degraded_blok_belooft_geen_kaarten_die_er_niet_zijn(scan_type):
    body = _degraded(scan_type)
    assert "Startpunt:" not in body
    assert "Tweede punt:" not in body
    assert "voor het startpunt en het tweede punt" not in body
    assert 'class="dir-card' not in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_methodiek_belooft_de_richtingvraag_als_het_blok_er_staat(scan_type):
    body = _degraded(scan_type)
    assert "Richtingvraag" in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_methodiekcel_belooft_geen_richting_die_er_niet_hangt(scan_type):
    """De cel pinde alleen het wóórd "Richtingvraag", niet de claim eronder.

    Daardoor bleef de volledige feature-copy staan zodra er richtingdata was:
    een opdrachtvorm in "Wat er moet gebeuren", een richting vanaf 3
    antwoorden en een beperkte-basis-regel. Geen van drieën bestaat in het
    degraded blok, dat alleen tellingen toont.
    """
    body = _degraded(scan_type)
    for claim in ("De opdrachtvorm in",
                  "Dit blok toont een richting vanaf 3 antwoorden",
                  "beperkte-basis-regel"):
        assert claim not in body, f"methodiekpagina belooft nog: {claim!r}"
    assert ("In dit rapport hangt er geen richting aan die antwoorden: zonder "
            "profiel per factor is er geen startpunt om ze aan te koppelen, en "
            "per onderwerp zijn het er te weinig om te tonen. Het blok "
            "‘Wat er moet gebeuren’ toont daarom alleen hoeveel "
            "respondenten de vraag kregen, beantwoordden en oversloegen.") in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_methodiekcel_houdt_de_volledige_copy_als_het_blok_kaarten_heeft(scan_type):
    body = _body(_render(scan_type, n=_N_NORMAL, profile=True,
                         direction=_agg(scan_type, {"workload": (6, 1), "growth": (4, 1)})))
    assert "De opdrachtvorm in" in body
    assert "Dit blok toont een richting vanaf 3 antwoorden" in body
    assert "beperkte-basis-regel" in body
    assert "In dit rapport hangt er geen richting aan die antwoorden" not in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_degraded_blok_is_vrij_van_em_dashes_en_ik_vorm(scan_type):
    body = _degraded(scan_type)
    i = body.find(_EYEBROW_TAG)
    blok = body[i:i + 1200]
    assert "—" not in blok and "&#x2014;" not in blok
    assert " ik " not in blok.lower()


@pytest.mark.parametrize("count,zin", [
    ((1, 0), "Van de 8 respondenten kreeg 1 deze vraag; 1 beantwoordde die."),
    ((0, 1), "Van de 8 respondenten kreeg 1 deze vraag; 1 sloeg over."),
    ((2, 2), "Van de 8 respondenten kregen 4 deze vraag; 2 beantwoordden die, 2 sloegen over."),
])
def test_enkelvoud_en_meervoud_per_telling(count, zin):
    body = _body(_render("retention", n=_N_DEGRADED, profile=False,
                         direction=_agg("retention", {"workload": count})))
    assert zin in body


# ── 2. Vanaf tien antwoorden verandert er niets ─────────────────────────────

@pytest.mark.parametrize("scan_type", SCANS)
def test_met_profiel_blijven_de_kaarten_zoals_ze_waren(scan_type):
    body = _body(_render(scan_type, n=_N_NORMAL, profile=True,
                         direction=_agg(scan_type, {"workload": (6, 1), "growth": (4, 1)})))
    assert _EYEBROW_TAG in body
    assert "Startpunt:" in body
    assert "Tweede punt:" in body
    assert "voor het startpunt en het tweede punt" in body
    assert "Richtingvraag" in body
    # De degraded variant mag hier niet meeliften.
    assert "Zonder profiel per factor is er nog geen startpunt" not in body


# ── 3. Zonder richtingdata belooft het rapport niets ────────────────────────

@pytest.mark.parametrize("scan_type", SCANS)
@pytest.mark.parametrize("n,profile", [(_N_DEGRADED, False), (_N_NORMAL, True)])
def test_zonder_richtingdata_geen_blok_en_geen_belofte(scan_type, n, profile):
    body = _body(_render(scan_type, n=n, profile=profile, direction={}))
    assert _EYEBROW_TAG not in body
    assert "Richtingvraag" not in body
    assert "Zonder profiel per factor is er nog geen startpunt" not in body


# ── De twee eerlijkheidsrestanten op diezelfde pagina (B3, punt 3) ───────────

@pytest.mark.parametrize("scan_type", SCANS)
def test_rasterintro_belooft_geen_rangorde_zonder_rasterrijen(scan_type):
    body = _degraded(scan_type)
    assert "Dit overzicht weegt alle zes factoren tegen elkaar af" not in body
    assert "Hoe deze volgorde tot stand komt" not in body
    assert "de volgorde volgt score en spreiding" not in body
    assert ("Voor deze meting is er nog geen profiel per factor, dus ook geen "
            "volgorde en geen startpunt.") in body
    # De lege tabelkop is een rangordebelofte zonder inhoud.
    assert 'class="raster-tbl"' not in body


@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_gebruiksblok_belooft_geen_lege_secties(scan_type):
    body = _body(_render(scan_type, n=_N_DEGRADED, profile=False, direction={}))
    assert "dan de verdieping per thema, en achteraan de gespreksagenda" not in body
    assert ("Een verdieping per thema en een volgorde van thema&#x27;s staan er "
            "nog niet in; achteraan lees je waar het gesprek kan beginnen.") in body


@pytest.mark.parametrize("scan_type", ["exit", "retention", "onboarding"])
def test_gebruiksblok_ongewijzigd_met_profiel(scan_type):
    body = _body(_render(scan_type, n=_N_NORMAL, profile=True, direction={}))
    assert "dan de verdieping per thema, en achteraan de gespreksagenda" in body
    assert "staan er nog niet in" not in body


# ── De sluitende gespreksagenda belooft niets wat er niet is (review ronde 2) ─
# Twee regels beneden RASTER_INTRO_EMPTY ("geen volgorde en geen startpunt")
# drukte het navy Gespreksopener-blok nog de generieke per-product
# nsp["first_decision"] af -- bij Loep Vertrek "Kies eerst of de scherpste
# werkfactoren vooral een lokaal managementspoor of een breder
# organisatievraagstuk vormen". Dat beweert "de scherpste werkfactoren" op
# precies de pagina die zojuist zei dat die er niet zijn, en het is het
# corporate jargon dat de copy-ronde van 6 september verbood.

_JARGON = [
    "de scherpste werkfactoren",
    "lokaal managementspoor",
    "breder organisatievraagstuk",
    "30-90 dagenopvolging",
    "snelle verificatie",
]


@pytest.mark.parametrize("scan_type", SCANS)
@pytest.mark.parametrize("met_richtingdata", [True, False])
def test_gespreksopener_herhaalt_geen_startpunt_dat_er_niet_is(scan_type, met_richtingdata):
    body = _body(_render(scan_type, n=_N_DEGRADED, profile=False,
                         direction=_agg(scan_type, _DEGRADED_SPREAD) if met_richtingdata else {}))
    for zin in _JARGON:
        assert zin not in body, f"gespreksagenda draagt nog jargon: {zin!r}"
    assert AGENDA_OPENER_GEEN_PROFIEL in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_de_gespreksopener_is_de_beloofde_plek_waar_het_gesprek_begint(scan_type):
    """Het gebruiksblok op p.02 stuurt in deze staat naar "achteraan lees je
    waar het gesprek kan beginnen". Dan moet daar ook echt een vraag staan."""
    body = _body(_render(scan_type, n=_N_DEGRADED, profile=False, direction={}))
    i = body.rfind("Gespreksopener")
    assert i != -1
    blok = body[i:i + 600]
    assert AGENDA_OPENER_GEEN_PROFIEL in blok
    assert "<p" in blok and "></p>" not in blok
    assert "&#x2014;" not in blok and "\u2014" not in blok


@pytest.mark.parametrize("scan_type", SCANS)
def test_met_profiel_blijft_de_echte_gespreksopener_staan(scan_type):
    body = _body(_render(scan_type, n=_N_NORMAL, profile=True, direction={}))
    assert AGENDA_OPENER_GEEN_PROFIEL not in body


@pytest.mark.parametrize("scan_type", SCANS)
def test_rasterintro_wijst_niet_naar_het_responsaantal(scan_type):
    """Dezelfde onjuiste toeschrijving als de drempelzin op p.02: de lege staat
    hangt aan een leeg factorprofiel, niet aan het aantal antwoorden."""
    assert "Met dit aantal antwoorden" not in _degraded(scan_type)
