"""Richtingstaat op de echte veranderkeuzes (spec 2026-10-07 par. 3, besluit Lars 7-10).

"Niets, dit zit hier goed" telt niet mee bij het bepalen van een eenduidige
richting: de keuze tussen routes maken alleen de mensen die er een kozen. Wie
niets wil, telt al mee in none_needed en split_none.

Migratiegeschiedenis (hoort hier, niet in de docstring van direction_state):

- Op main (91ecfd14) rekenden clear en plurality op alle beantwoorders n, en
  werd de voorsprong ook tegen de niets-optie gemeten; split_none stond na
  clear. Nu rekenen ze op change_n, de som van de counts buiten de
  niets-optie (*_other meegerekend), met de vloer DIRECTION_MIN_N ook op
  change_n, en staat split_none vóór clear.
- Voor een aggregaat zonder defecte rijen (answered == som van de counts) kan
  een staat ten opzichte van main daardoor alleen omhoog: divided ->
  plurality, divided -> clear, plurality -> clear, of gelijk. Dat is de kern
  van test_staten_gaan_alleen_omhoog.
- Defecte rijen (answered zonder choice, zie aggregate_direction) tellen mee
  in n en dus in too_few en none_needed, zoals op main, maar niet in
  change_n; direction_state logt ze. Bij dezelfde keuzes verandert een
  defecte rij de staat dus alleen via n: hij kan too_few opheffen (en dan
  blijft change_n onder de vloer als de keuzes dat ook zijn) of none_needed
  opheffen (het niets-aandeel van n daalt), waarna de echte keuzes beslissen.
  Ten opzichte van main kan dat beide kanten op: {a 2} met answered 3 was
  clear en is nu divided (twee echte keuzes halen de vloer niet); {a 3,
  niets 1} met answered 10 was divided (3 van de 10) en is nu clear (3 van 3).
- answered < som van de counts is een kapotte telling: ValueError.
"""
import logging
import random

import pytest

from backend.products.shared import deepening as dp

FK = "growth"


def _oud(agg, factor_key, factor_score):
    """De staat zoals op main (91ecfd14), letterlijk overgenomen.

    Eenmalige migratiebewaking tegen main 91ecfd14: de drempels staan hier als
    letterlijke waarden (3, 2, 0.35, 5.0, 0.5) zodat een latere wijziging van
    de constanten deze referentie niet stil meeneemt. Mag weg bij de volgende
    bewuste wijziging van deze regels. Alleen de logger-regels zijn weggelaten.
    """
    n = agg["answered"]
    counts = agg.get("counts") or {}
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    base = {"n": n, "ranked": ranked, "top_key": None, "top_n": 0,
            "second_n": 0, "none_n": 0, "none_key": None}
    if n < 3:
        return {**base, "state": "too_few"}
    if not counts:
        raise ValueError(
            f"direction_state: answered={n} maar geen counts voor {factor_key!r}")
    none_key = next((k for k in sorted(counts) if k.endswith("_none")), None)
    none_n = counts.get(none_key, 0) if none_key is not None else 0
    base.update(none_key=none_key, none_n=none_n)
    if none_key is not None and none_n / n > 0.5:
        return {**base, "state": "none_needed",
                "top_key": none_key, "top_n": none_n}
    top_key, top_n = ranked[0]
    second_n = ranked[1][1] if len(ranked) > 1 else 0
    base.update(top_key=top_key, top_n=top_n, second_n=second_n)
    if (not top_key.endswith(("_none", "_other"))
            and top_n / n >= 0.5 and top_n - second_n >= 2):
        return {**base, "state": "clear"}
    change_ranked = [(k, c) for k, c in ranked if k != none_key]
    if not change_ranked:
        return {**base, "state": "divided"}
    change_key, change_n = change_ranked[0]
    if change_key.endswith("_other"):
        return {**base, "state": "divided"}
    if (factor_score is not None and factor_score < 5.0
            and none_key is not None and none_n >= change_n - 1):
        return {**base, "state": "split_none",
                "top_key": change_key, "top_n": change_n, "second_n": 0}
    rest = [c for k, c in ranked if k != change_key]
    runner_up = max(rest) if rest else 0
    if (change_n / n >= 0.35
            and change_n - runner_up >= 2):
        return {**base, "state": "plurality",
                "top_key": change_key, "top_n": change_n, "second_n": runner_up}
    return {**base, "state": "divided"}


def _agg(counts, answered=None):
    return {"answered": sum(counts.values()) if answered is None else answered,
            "counts": dict(counts)}


def _opties():
    texts = dp.direction_option_texts("retention", FK)
    none_key = next(k for k in texts if k.endswith("_none"))
    other_key = next(k for k in texts if k.endswith("_other"))
    gewoon = [k for k in texts if k not in (none_key, other_key)]
    return none_key, other_key, gewoon


def test_motiverend_geval_vertrek_voorbeeld():
    # 4 van de 5 die iets wilden kozen hetzelfde, 3 kozen niets.
    # n = 4+1+3 = 8; niets 3/8 = 0,375, geen meerderheid.
    # change_n = 4+1 = 5; a 4/5 = 0,8 >= 0,5; voorsprong 4-1 = 3 >= 2: clear.
    # Oud: a 4/8 = 0,5 maar voorsprong op niets 4-3 = 1 < 2: divided.
    none_key, _o, (a, b, *_r) = _opties()
    agg = _agg({a: 4, b: 1, none_key: 3})
    st = dp.direction_state(agg, FK, 6.2)
    assert st["state"] == "clear" and st["top_key"] == a
    assert st["top_n"] == 4 and st["change_n"] == 5 and st["none_n"] == 3 and st["n"] == 8
    # second_n verwijst naar de tweede veranderoptie (b = 1), niet naar niets (3).
    assert st["second_n"] == 1
    assert _oud(agg, FK, 6.2)["state"] == "divided"


def test_meerderheid_niets_blijft_none_needed():
    # n = 9; niets 5/9 = 0,56 > 0,5: none_needed, ongeacht de veranderopties.
    none_key, _o, (a, *_r) = _opties()
    st = dp.direction_state(_agg({none_key: 5, a: 4}), FK, 6.0)
    assert st["state"] == "none_needed"
    assert st["change_n"] == 4


def test_split_none_gaat_voor_clear():
    # n = 8; niets 4/8 = 0,5, geen strikte meerderheid.
    # change_n = 4, a 4/4 = 1,0 met voorsprong 4 zou clear zijn, maar de score
    # 4,5 < 5,0 en niets 4 >= 4-1: split_none gaat voor.
    none_key, _o, (a, *_r) = _opties()
    st = dp.direction_state(_agg({a: 4, none_key: 4}), FK, 4.5)
    assert st["state"] == "split_none"
    assert st["top_key"] == a and st["top_n"] == 4 and st["second_n"] == 0
    # Zelfde stemmen op een niet-kwetsbare score: dan wel clear.
    assert dp.direction_state(_agg({a: 4, none_key: 4}), FK, 6.0)["state"] == "clear"


def test_vloer_op_inhoudelijke_stemmen():
    none_key, _o, (a, *_r) = _opties()
    # n=4, none 2, a 2: change_n 2 < 3, dus geen clear. Ook geen plurality:
    # 2 van de 2 is een meerderheid, en plurality is per definitie de staat
    # zonder meerderheid; de vloer geldt dus voor beide.
    st = dp.direction_state(_agg({a: 2, none_key: 2}), FK, 6.0)
    assert st["state"] == "divided"
    assert st["change_n"] == 2


def test_plurality_op_inhoudelijke_stemmen():
    none_key, _o, (a, b, c, d, *_r) = _opties()
    # n=12, change_n=8, a 4/8 = 0,5 met voorsprong 2 op b: clear (oud: 4/12 = 0,33 -> divided)
    agg = _agg({a: 4, b: 2, c: 2, none_key: 4})
    assert dp.direction_state(agg, FK, 6.5)["state"] == "clear"
    assert _oud(agg, FK, 6.5)["state"] == "divided"
    # n=13, change_n=10, a 4/10 = 0,4 (< 0,5, >= 0,35), voorsprong 2: plurality (oud: 4/13 -> divided)
    agg = _agg({a: 4, b: 2, c: 2, d: 2, none_key: 3})
    st = dp.direction_state(agg, FK, 6.5)
    assert st["state"] == "plurality" and st["second_n"] == 2
    assert st["top_key"] == a and st["top_n"] == 4 and st["change_n"] == 10
    assert _oud(agg, FK, 6.5)["state"] == "divided"
    # n=12, change_n=9, a 4/9 = 0,44, voorsprong 1 op b: divided
    assert dp.direction_state(_agg({a: 4, b: 3, c: 2, none_key: 3}), FK, 6.5)["state"] == "divided"


def test_rij_zonder_keuze_telt_niet_in_change_n():
    # Een `answered`-rij zonder choice (datadefect) telt mee in n maar niet in
    # change_n. Zelfde keuzes {a 3, niets 1}, oplopend aantal defecte rijen:
    # change_n blijft 3 en a 3 van 3 met voorsprong 3 blijft clear.
    none_key, _o, (a, *_r) = _opties()
    counts = {a: 3, none_key: 1}
    for answered in (4, 8, 10):
        st = dp.direction_state(_agg(counts, answered=answered), FK, 6.0)
        assert st["state"] == "clear" and st["change_n"] == 3 and st["n"] == answered
    # Op main zakte dezelfde verdeling met defecte rijen weg: 3 van de 10 is
    # onder de 0,35 van plurality.
    assert _oud(_agg(counts, answered=10), FK, 6.0)["state"] == "divided"


def test_rij_zonder_keuze_wordt_gelogd(caplog):
    none_key, _o, (a, *_r) = _opties()
    with caplog.at_level(logging.WARNING):
        dp.direction_state(_agg({a: 3, none_key: 1}, answered=6), FK, 6.0)
    assert any("zonder keuze" in r.message and FK in r.message for r in caplog.records)
    caplog.clear()
    with caplog.at_level(logging.WARNING):
        dp.direction_state(_agg({a: 3, none_key: 1}), FK, 6.0)
    assert not any("zonder keuze" in r.message for r in caplog.records)


def test_kapotte_telling_valt_luid_om():
    # answered kleiner dan de som van de counts kan niet uit aggregate_direction
    # komen: een kapot aggregaat, ook onder de vloer.
    none_key, _o, (a, *_r) = _opties()
    with pytest.raises(ValueError, match="kapotte telling"):
        dp.direction_state(_agg({a: 3, none_key: 2}, answered=4), FK, 6.0)
    with pytest.raises(ValueError, match="kapotte telling"):
        dp.direction_state(_agg({a: 3}, answered=2), FK, 6.0)


def test_vloer_telt_alleen_echte_veranderkeuzes():
    # Twee echte veranderkeuzes: nooit clear of plurality, hoeveel defecte rijen
    # n ook ophogen. {a 2, niets 1}: answered 3 -> change_n 2; answered 4 en 5
    # -> change_n nog steeds 2.
    none_key, other_key, (a, b, *_r) = _opties()
    for counts in ({a: 2, none_key: 1}, {a: 2}, {a: 1, b: 1, none_key: 1},
                   {a: 1, other_key: 1}):
        for answered in (3, 4, 5):
            st = dp.direction_state(_agg(counts, answered=answered), FK, 6.0)
            assert st["state"] == "divided", (counts, answered, st)
            assert st["change_n"] == sum(c for k, c in counts.items() if k != none_key)
    # Met precies drie echte veranderkeuzes mag het wel: {a 3, niets 1},
    # answered 5 -> change_n 3, a 3/3, voorsprong 3: clear.
    assert dp.direction_state(_agg({a: 3, none_key: 1}, answered=5), FK, 6.0)["state"] == "clear"


def test_defecte_rij_verandert_de_staat_alleen_via_n():
    """Bij dezelfde keuzes kan een defecte rij de staat alleen veranderen door
    too_few of none_needed op te heffen (beide rekenen op n); clear, plurality,
    split_none en divided rekenen op de keuzes zelf en blijven gelijk."""
    none_key, other_key, gewoon = _opties()
    sleutels = gewoon[:3] + [none_key, other_key]
    rng = random.Random(20261008)
    opgeheven = set()
    for _ in range(20000):
        counts = {k: rng.randint(0, 5) for k in sleutels}
        counts = {k: v for k, v in counts.items() if v}
        if not counts:
            continue
        score = rng.choice([None, 3.9, 4.9, 6.4])
        schoon = dp.direction_state(_agg(counts), FK, score)
        defect = dp.direction_state(
            _agg(counts, answered=sum(counts.values()) + rng.randint(1, 4)), FK, score)
        if defect["state"] != "too_few":
            assert defect["change_n"] == sum(c for k, c in counts.items() if k != none_key)
        if schoon["state"] != defect["state"]:
            assert schoon["state"] in ("too_few", "none_needed"), (
                counts, score, schoon["state"], defect["state"])
            opgeheven.add((schoon["state"], defect["state"]))
    # De none_needed-uitzondering bestaat echt: {niets 4, a 3} is none_needed
    # (4/7); met 2 defecte rijen niet meer (4/9), en a 3 van change_n 3: clear.
    assert ("none_needed", "clear") in opgeheven
    assert dp.direction_state(_agg({none_key: 4, gewoon[0]: 3}), FK, 6.0)["state"] == "none_needed"
    assert dp.direction_state(_agg({none_key: 4, gewoon[0]: 3}, answered=9), FK, 6.0)["state"] == "clear"


def test_defecte_rijen_kunnen_oud_clear_naar_divided_laten_zakken():
    # Op main was {a 2} met answered 3 clear (2/3, voorsprong 2) op twee echte
    # keuzes; de vloer op change_n maakt dat divided. Een neerwaartse beweging
    # ten opzichte van main is alleen met defecte rijen mogelijk.
    _n, _o, (a, *_r) = _opties()
    agg = _agg({a: 2}, answered=3)
    assert _oud(agg, FK, 6.0)["state"] == "clear"
    assert dp.direction_state(agg, FK, 6.0)["state"] == "divided"


def test_change_n_in_elke_staat():
    none_key, other_key, (a, b, c, *_r) = _opties()
    gevallen = [
        ("too_few", _agg({a: 2}), 6.0),
        ("none_needed", _agg({none_key: 3, a: 1}), 6.0),
        ("split_none", _agg({a: 2, none_key: 2}), 4.0),
        ("clear", _agg({a: 3}), 6.0),
        # n 12, change_n 10, a 4/10 = 0,4 (< 0,5, >= 0,35), voorsprong 2 op b, c en anders
        ("plurality", _agg({a: 4, b: 2, c: 2, other_key: 2, none_key: 2}), 6.0),
        ("divided", _agg({a: 2, b: 2}), 6.0),
        # Vroege uitgangen naar divided: anders bovenaan, of alleen niets en anders.
        ("divided", _agg({other_key: 3, none_key: 1}), 6.0),
        ("divided", _agg({none_key: 2, other_key: 2}), 6.0),
        # Met defecte rijen: change_n blijft de som van de echte keuzes.
        ("clear", _agg({a: 3, none_key: 1}, answered=7), 6.0),
    ]
    for verwacht, agg, score in gevallen:
        st = dp.direction_state(agg, FK, score)
        assert st["state"] == verwacht, (verwacht, agg, st)
        if verwacht == "too_few":
            assert st["change_n"] == 0, agg
        else:
            echt = sum(cnt for k, cnt in agg["counts"].items() if k != none_key)
            assert st["change_n"] == echt, (verwacht, agg, st)


_TOEGESTAAN = {("divided", "plurality"), ("divided", "clear"), ("plurality", "clear")}


def test_staten_gaan_alleen_omhoog():
    # Zonder defecte rijen (answered == som van de counts); zie de moduledocstring.
    none_key, other_key, gewoon = _opties()
    sleutels = gewoon[:3] + [none_key, other_key]
    rng = random.Random(20261007)
    gezien = set()
    for _ in range(20000):
        counts = {k: rng.randint(0, 6) for k in sleutels}
        counts = {k: v for k, v in counts.items() if v}
        if not counts:
            continue
        score = rng.choice([None, 3.9, 4.9, 5.0, 6.4, 8.1])
        oud = _oud(_agg(counts), FK, score)["state"]
        nieuw = dp.direction_state(_agg(counts), FK, score)["state"]
        if oud != nieuw:
            assert (oud, nieuw) in _TOEGESTAAN, (counts, score, oud, nieuw)
            gezien.add((oud, nieuw))
    assert ("divided", "clear") in gezien
