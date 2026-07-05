"""Content-guard voor gespreksrichting-sets (spec 2026-07-05 par. 4)."""
import re

import pytest

from backend.products.shared.deepening import (
    DEEPENING_CAP,
    DEEPENING_FACTOR_KEYS,
    DEEPENING_SETS,
    DIRECTION_SETS,
    get_direction_sets,
)

# Verboden in respondent- en rapportcopy (trede-1-lijst + spec-v2-aanvullingen).
FORBIDDEN = [
    "laag gescoord", "niet goed", "risico", "probleem", "oorzaak",
    "anoniem", "betrouwbaar", "verschilmaker", "aanbeveling", "actieplan",
    "management moet",
]


def test_cap_retention_is_3():
    assert DEEPENING_CAP == {"exit": 3, "retention": 3}


def test_direction_sets_complete():
    assert set(DIRECTION_SETS.keys()) == set(DEEPENING_FACTOR_KEYS)
    for fk, s in DIRECTION_SETS.items():
        keys = [o["key"] for o in s["options"]]
        assert len(keys) == 7, fk                      # 6 routes + other
        assert keys[-1].endswith("_other"), fk
        assert len(set(keys)) == 7, fk                 # geen dubbele keys
        assert s["question"], fk


def test_every_route_maps_to_existing_cause_keys():
    for fk, s in DIRECTION_SETS.items():
        cause_keys = {o["key"] for o in DEEPENING_SETS[fk]["options"]}
        for o in s["options"]:
            if o["key"].endswith("_other"):
                assert o["related"] == []
                continue
            assert o["related"], f"{fk}/{o['key']} mist verwantschaps-mapping"
            for rk in o["related"]:
                assert rk in cause_keys, f"{fk}/{o['key']} verwijst naar onbekende {rk}"


def test_every_route_has_agenda_question():
    for fk, s in DIRECTION_SETS.items():
        for o in s["options"]:
            if o["key"].endswith("_other"):
                assert o["agenda"] is None
            else:
                assert o["agenda"] and o["agenda"].endswith("?"), \
                    f"{fk}/{o['key']}: agenda-template ontbreekt of eindigt niet op een vraag"


def test_no_forbidden_words_in_direction_copy():
    for fk, s in DIRECTION_SETS.items():
        blobs = [s["question"]] + [o["text"] for o in s["options"]] + \
                [o["agenda"] or "" for o in s["options"]]
        for blob in blobs:
            low = blob.lower()
            for word in FORBIDDEN:
                assert word not in low, f"{fk}: verboden woord {word!r} in {blob!r}"


def test_get_direction_sets_retention_only():
    sets = get_direction_sets("retention")
    assert set(sets.keys()) == set(DEEPENING_FACTOR_KEYS)
    for fk, s in sets.items():
        assert s["question_set_version"] == f"retention_{fk}_direction_v1"
        assert len(s["options"]) == 7
        assert all("text" in o and "key" in o for o in s["options"])
    assert get_direction_sets("exit") == {}          # exit: eigen ronde, geen sets


def test_get_direction_sets_unknown_scan_raises():
    with pytest.raises(ValueError):
        get_direction_sets("pulse")
