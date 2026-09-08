"""Content-guard voor de richtingsets (spec 2026-09-07 par. 3.2 en 8)."""
import pytest

from backend.products.shared.deepening import (
    DEEPENING_FACTOR_KEYS,
    DIRECTION_SETS,
    DIRECTION_VERSION,
    direction_imperative,
    direction_option_texts,
    get_direction_sets,
)

# Verboden in respondent- en rapportcopy.
FORBIDDEN = [
    "laag gescoord", "niet goed", "risico", "probleem", "oorzaak", "interventie",
    "anoniem", "betrouwbaar", "verschilmaker", "aanbeveling", "actieplan",
    "management moet", "loep adviseert",
]


def test_sets_complete_with_none_first_and_other_last():
    assert set(DIRECTION_SETS) == set(DEEPENING_FACTOR_KEYS)
    for fk, s in DIRECTION_SETS.items():
        keys = [o["key"] for o in s["options"]]
        assert len(keys) == 8, fk                       # none + 6 routes + other
        assert keys[0].endswith("_none"), fk
        assert keys[-1].endswith("_other"), fk
        assert len(set(keys)) == 8, fk


@pytest.mark.parametrize("scan_type", ["exit", "retention"])
def test_get_direction_sets_shape_per_scan(scan_type):
    sets = get_direction_sets(scan_type)
    assert set(sets) == set(DEEPENING_FACTOR_KEYS)
    for fk, s in sets.items():
        assert s["question_set_version"] == f"{scan_type}_{fk}_direction_{DIRECTION_VERSION[scan_type]}"
        assert "scoorde" in s["question"] and "het laagst" in s["question"]
        assert s["options"][0]["text"].startswith("Niets, dit z")
        for o in s["options"]:
            assert set(o) == {"key", "text"}, "imperative mag niet naar de client"
            assert isinstance(o["text"], str) and o["text"]


def test_tense_per_scan():
    ret = get_direction_sets("retention")["workload"]
    ex = get_direction_sets("exit")["workload"]
    assert "zou hier volgens jou het meest helpen" in ret["question"]
    assert "had hier volgens jou het meest geholpen" in ex["question"]
    assert ret["options"][0]["text"] == "Niets, dit zit hier goed"
    assert ex["options"][0]["text"] == "Niets, dit zat hier goed"
    # Eerste-persoonsroutes staan bij exit in de verleden tijd.
    assert "mocht beslissen" in direction_option_texts("exit", "leadership")["ldd_mandate"]
    assert "mag beslissen" in direction_option_texts("retention", "leadership")["ldd_mandate"]


def test_versions():
    assert DIRECTION_VERSION == {"retention": "v2", "exit": "v1"}


def test_unknown_scan_type_raises():
    with pytest.raises(ValueError):
        get_direction_sets("onboarding")


def test_every_route_has_imperative_except_none_and_other():
    for fk, s in DIRECTION_SETS.items():
        for o in s["options"]:
            imp = direction_imperative(fk, o["key"])
            if o["key"].endswith(("_none", "_other")):
                assert imp is None, f"{fk}/{o['key']}"
            else:
                assert imp and imp[0].isupper() and imp.endswith("."), f"{fk}/{o['key']}"
                assert "—" not in imp


def test_no_forbidden_words_and_no_em_dashes():
    for scan_type in ("exit", "retention"):
        for fk, s in get_direction_sets(scan_type).items():
            blob = (s["question"] + " " + " ".join(o["text"] for o in s["options"])).lower()
            for w in FORBIDDEN:
                assert w not in blob, f"{scan_type}/{fk}: {w}"
            assert "—" not in blob
    for fk, s in DIRECTION_SETS.items():
        for o in s["options"]:
            imp = (o.get("imperative") or "").lower()
            for w in FORBIDDEN:
                assert w not in imp, f"{fk}/{o['key']}: {w}"


def test_direction_imperative_unknown_key_raises():
    with pytest.raises(KeyError):
        direction_imperative("workload", "wld_bestaat_niet")
