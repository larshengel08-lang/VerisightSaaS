"""Richtingstaat op de inhoudelijke stemmen (spec 2026-10-07 par. 3, besluit Lars 7-10).

"Niets, dit zit hier goed" telt niet mee bij het bepalen van een eenduidige
richting: de keuze tussen routes maken alleen de mensen die er een kozen. Wie
niets wil, telt al mee in none_needed en split_none.

De kern is de eigenschap dat een staat alleen "omhoog" kan bewegen ten opzichte
van main (91ecfd14): divided -> plurality, divided -> clear, plurality -> clear,
of gelijk. Daarvoor staat de oude functie hieronder letterlijk als referentie.
"""
import random

from backend.products.shared import deepening as dp

FK = "growth"


def _oud(agg, factor_key, factor_score):
    """De staat zoals op main (91ecfd14), letterlijk overgenomen als referentie.

    Alleen de logger-regels zijn weggelaten; constanten via dp.
    """
    n = agg["answered"]
    counts = agg.get("counts") or {}
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    base = {"n": n, "ranked": ranked, "top_key": None, "top_n": 0,
            "second_n": 0, "none_n": 0, "none_key": None}
    if n < dp.DIRECTION_MIN_N:
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
            and top_n / n >= 0.5 and top_n - second_n >= dp.TOP_CHOICE_MIN_LEAD):
        return {**base, "state": "clear"}
    change_ranked = [(k, c) for k, c in ranked if k != none_key]
    if not change_ranked:
        return {**base, "state": "divided"}
    change_key, change_n = change_ranked[0]
    if change_key.endswith("_other"):
        return {**base, "state": "divided"}
    if (factor_score is not None and factor_score < dp.DIRECTION_SPLIT_NONE_MAX_SCORE
            and none_key is not None and none_n >= change_n - 1):
        return {**base, "state": "split_none",
                "top_key": change_key, "top_n": change_n, "second_n": 0}
    rest = [c for k, c in ranked if k != change_key]
    runner_up = max(rest) if rest else 0
    if (change_n / n >= dp.DIRECTION_PLURALITY_MIN_SHARE
            and change_n - runner_up >= dp.TOP_CHOICE_MIN_LEAD):
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
    # change_n = 8-3 = 5; a 4/5 = 0,8 >= 0,5; voorsprong 4-1 = 3 >= 2: clear.
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
    assert st["change_n"] == 4  # 9 - 5


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


def test_rij_zonder_keuze_maakt_de_drempel_alleen_strenger():
    # Een `answered`-rij zonder choice (datadefect) telt mee in n en dus in
    # change_n = n - none_n; nooit in de teller. Zelfde stemmen, oplopend aantal
    # defecte rijen: de staat kan alleen omlaag.
    none_key, _o, (a, *_r) = _opties()
    counts = {a: 3, none_key: 1}
    # answered 4: change_n 3, a 3/3 = 1,0, voorsprong 3: clear
    st = dp.direction_state(_agg(counts, answered=4), FK, 6.0)
    assert st["state"] == "clear" and st["change_n"] == 3
    # answered 8: change_n 7, a 3/7 = 0,43 (>= 0,35), voorsprong 3: plurality
    st = dp.direction_state(_agg(counts, answered=8), FK, 6.0)
    assert st["state"] == "plurality" and st["change_n"] == 7
    # answered 10: change_n 9, a 3/9 = 0,33 < 0,35: divided
    st = dp.direction_state(_agg(counts, answered=10), FK, 6.0)
    assert st["state"] == "divided" and st["change_n"] == 9


def test_change_n_in_elke_staat():
    none_key, other_key, (a, b, c, *_r) = _opties()
    gevallen = {
        "too_few": (_agg({a: 2}), 6.0),
        "none_needed": (_agg({none_key: 3, a: 1}), 6.0),
        "split_none": (_agg({a: 2, none_key: 2}), 4.0),
        "clear": (_agg({a: 3}), 6.0),
        # n 12, change_n 10, a 4/10 = 0,4 (< 0,5, >= 0,35), voorsprong 2 op b, c en anders
        "plurality": (_agg({a: 4, b: 2, c: 2, other_key: 2, none_key: 2}), 6.0),
        "divided": (_agg({a: 2, b: 2}), 6.0),
    }
    for verwacht, (agg, score) in gevallen.items():
        st = dp.direction_state(agg, FK, score)
        assert st["state"] == verwacht, (verwacht, st)
        assert "change_n" in st, verwacht
    # Divided via de vroege uitgangen: alleen niets/anders gekozen.
    st = dp.direction_state(_agg({other_key: 3, none_key: 1}), FK, 6.0)
    assert st["state"] == "divided" and st["change_n"] == 3
    st = dp.direction_state(_agg({none_key: 2, other_key: 2}), FK, 6.0)
    assert st["state"] == "divided" and st["change_n"] == 2
    # too_few rekent change_n niet uit (net als top_n): 0.
    assert dp.direction_state(_agg({a: 2}), FK, 6.0)["change_n"] == 0


_TOEGESTAAN = {("divided", "plurality"), ("divided", "clear"), ("plurality", "clear")}


def test_staten_gaan_alleen_omhoog():
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
