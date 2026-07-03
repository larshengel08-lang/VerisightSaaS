import pytest
from backend.products.shared.deepening import (
    DEEPENING_SETS,
    DEEPENING_FACTOR_KEYS,
    get_deepening_sets,
    get_agenda_question,
)

SCAN_TYPES = ["exit", "retention"]
FORBIDDEN_RESPONDENT_WORDS = ["laag gescoord", "niet goed", "risico", "probleem", "oorzaak", "anoniem"]


def test_all_factors_have_sets_for_both_scans():
    for scan in SCAN_TYPES:
        sets = get_deepening_sets(scan)
        assert set(sets.keys()) == set(DEEPENING_FACTOR_KEYS)


def test_every_set_has_version_question_and_other():
    for scan in SCAN_TYPES:
        for fk, s in get_deepening_sets(scan).items():
            assert s["question_set_version"] == f"{scan}_{fk}_v1"
            assert s["question"].startswith("Welke omschrijving past het best")
            option_keys = [o["key"] for o in s["options"]]
            assert option_keys[-1].endswith("_other")
            assert 5 <= len(option_keys) - 1 <= 6
            assert len(option_keys) == len(set(option_keys))


def test_respondent_copy_has_no_forbidden_words():
    for scan in SCAN_TYPES:
        for s in get_deepening_sets(scan).values():
            blob = (s["question"] + " " + " ".join(o["text"] for o in s["options"])).lower()
            for word in FORBIDDEN_RESPONDENT_WORDS:
                assert word not in blob, f"verboden woord '{word}' in {s['question_set_version']}"


def test_agenda_question_exists_for_every_non_other_option():
    for scan in SCAN_TYPES:
        for fk, s in get_deepening_sets(scan).items():
            for o in s["options"]:
                if o["key"].endswith("_other"):
                    continue
                q = get_agenda_question(scan, fk, o["key"])
                assert isinstance(q, str) and q.endswith("?")


def test_exit_uses_past_tense_sample():
    exit_wl = get_deepening_sets("exit")["workload"]
    texts = " ".join(o["text"] for o in exit_wl["options"])
    assert "lag" in texts or "was" in texts or "maakten" in texts or "kostten" in texts


def test_unknown_option_key_raises():
    with pytest.raises(KeyError):
        get_agenda_question("retention", "workload", "wl_bestaat_niet")


def test_unknown_scan_type_raises():
    with pytest.raises(ValueError):
        get_deepening_sets("bogus")
    with pytest.raises(ValueError):
        get_agenda_question("bogus", "workload", "wl_volume")


def test_other_option_agenda_is_none():
    assert get_agenda_question("retention", "workload", "wl_other") is None
