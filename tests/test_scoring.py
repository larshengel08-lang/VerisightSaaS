"""
Verisight — Scoring Engine Tests
=================================
Run: pytest tests/test_scoring.py -v
     (from Verisight/ project root)

These tests lock down the critical scoring formulas.
A failing test here means something in scoring.py broke a scientific assumption.
"""

import pytest
from types import SimpleNamespace
from backend.scoring import (
    compute_sdt_scores,
    compute_org_scores,
    compute_retention_risk,
    compute_retention_signal_profile,
    compute_retention_supplemental_scores,
    compute_preventability,
    detect_patterns,
    _scale,
    RISK_HIGH,
    RISK_MEDIUM,
    ORG_FACTOR_KEYS,
)
from backend.products.exit.scoring import build_exit_context_summary, compute_exit_friction
from backend.products.exit.report_content import get_methodology_payload, get_signal_page_payload


# ---------------------------------------------------------------------------
# Helper: full inputs
# ---------------------------------------------------------------------------

def _sdt_all(value: int) -> dict:
    """All 12 SDT items set to the same raw Likert value (1-5)."""
    return {f"B{i}": value for i in range(1, 13)}


def _org_all(value: int) -> dict:
    """All 18 org items (6 factors × 3 items) set to the same raw Likert value."""
    items = {}
    for factor in ORG_FACTOR_KEYS:
        for n in range(1, 4):
            items[f"{factor}_{n}"] = value
    return items


# ---------------------------------------------------------------------------
# 1. Scale transform
# ---------------------------------------------------------------------------

class TestScaleTransform:
    def test_min_maps_to_one(self):
        assert _scale(1) == pytest.approx(1.0)

    def test_max_maps_to_ten(self):
        assert _scale(5) == pytest.approx(10.0)

    def test_midpoint_maps_to_5_5(self):
        assert _scale(3) == pytest.approx(5.5)


# ---------------------------------------------------------------------------
# 2. SDT scoring
# ---------------------------------------------------------------------------

class TestComputeSdtScores:
    def test_all_max_gives_high_need_satisfaction(self):
        result = compute_sdt_scores(_sdt_all(5))
        # All positively formulated except B4, B8, B12 (reverse-coded)
        # Reverse: raw 5 → (6-5)=1 → _scale(1)=1.0 (worst)
        # Non-reverse: raw 5 → _scale(5)=10.0 (best)
        # Net per dimension: 3 normals (10.0) + 1 reversed (1.0) → avg 7.75
        assert result["autonomy"]    == pytest.approx(7.75)
        assert result["competence"]  == pytest.approx(7.75)
        assert result["relatedness"] == pytest.approx(7.75)

    def test_all_min_gives_low_need_satisfaction(self):
        result = compute_sdt_scores(_sdt_all(1))
        # Non-reverse: raw 1 → _scale(1)=1.0 (worst)
        # Reverse: raw 1 → (6-1)=5 → _scale(5)=10.0 (best)
        # Net per dimension: 3 normals (1.0) + 1 reversed (10.0) → avg 3.25
        assert result["autonomy"]    == pytest.approx(3.25)
        assert result["competence"]  == pytest.approx(3.25)
        assert result["relatedness"] == pytest.approx(3.25)

    def test_reverse_items_are_inverted(self):
        # B4 is reverse-coded. High score should indicate LOW autonomy.
        high_b4 = {"B1": 3, "B2": 3, "B3": 3, "B4": 5}  # B4 high → bad autonomy
        low_b4  = {"B1": 3, "B2": 3, "B3": 3, "B4": 1}  # B4 low  → good autonomy
        score_high = compute_sdt_scores(high_b4)["autonomy"]
        score_low  = compute_sdt_scores(low_b4)["autonomy"]
        assert score_high < score_low, "High B4 value should produce LOWER autonomy score"

    def test_sdt_risk_is_inverted_total(self):
        """sdt_risk = 11 - sdt_total: high satisfaction → low risk."""
        result = compute_sdt_scores(_sdt_all(5))
        expected_risk = round(11.0 - result["sdt_total"], 2)
        assert result["sdt_risk"] == pytest.approx(expected_risk)

    def test_missing_items_use_neutral_fallback(self):
        """Empty input → all dimensions should fall back to 5.5 (neutral)."""
        result = compute_sdt_scores({})
        assert result["autonomy"]    == pytest.approx(5.5)
        assert result["competence"]  == pytest.approx(5.5)
        assert result["relatedness"] == pytest.approx(5.5)


# ---------------------------------------------------------------------------
# 3. Org factor scoring
# ---------------------------------------------------------------------------

class TestComputeOrgScores:
    def test_all_max_gives_score_ten(self):
        result = compute_org_scores(_org_all(5))
        for factor in ORG_FACTOR_KEYS:
            assert result[factor] == pytest.approx(10.0), f"{factor} should be 10.0"

    def test_all_min_gives_score_one(self):
        result = compute_org_scores(_org_all(1))
        for factor in ORG_FACTOR_KEYS:
            assert result[factor] == pytest.approx(1.0), f"{factor} should be 1.0"

    def test_workload_high_input_gives_high_score(self):
        """
        Werkbelasting is positief geformuleerd (hoge score = werkdruk acceptabel).
        Een hoge Likert waarde moet een HOGE satisfaction score opleveren.
        Dit is de correctie voor de bug waarbij workload omgekeerd werd berekend.
        """
        result_high = compute_org_scores({"workload_1": 5, "workload_2": 5, "workload_3": 5})
        result_low  = compute_org_scores({"workload_1": 1, "workload_2": 1, "workload_3": 1})
        assert result_high["workload"] == pytest.approx(10.0), "Hoge werkbelasting input (werkdruk OK) → score 10"
        assert result_low["workload"]  == pytest.approx(1.0),  "Lage werkbelasting input (werkdruk hoog) → score 1"

    def test_missing_factor_returns_neutral(self):
        result = compute_org_scores({})
        for factor in ORG_FACTOR_KEYS:
            assert result[factor] == pytest.approx(5.5)


# ---------------------------------------------------------------------------
# 4. Retention risk — the core formula
# ---------------------------------------------------------------------------

class TestComputeRetentionRisk:
    def _max_sdt(self):
        return compute_sdt_scores(_sdt_all(5))

    def _min_sdt(self):
        return compute_sdt_scores(_sdt_all(1))

    def test_best_case_gives_low_risk(self):
        """All satisfaction scores max → risk should be LAAG."""
        sdt = self._max_sdt()
        org = compute_org_scores(_org_all(5))
        result = compute_retention_risk(sdt, org)
        assert result["risk_band"] == "LAAG"
        assert result["risk_score"] < RISK_MEDIUM

    def test_worst_case_gives_high_risk(self):
        """All satisfaction scores min → risk should be HOOG."""
        sdt = self._min_sdt()
        org = compute_org_scores(_org_all(1))
        result = compute_retention_risk(sdt, org)
        assert result["risk_band"] == "HOOG"
        assert result["risk_score"] >= RISK_HIGH

    def test_workload_high_score_reduces_risk(self):
        """
        Kritieke regressietest voor de werkbelasting-bug.
        Hoge werkbelasting SATISFACTIE (vragen positief geformuleerd) moet
        het risico VERLAGEN, niet verhogen.
        """
        sdt_neutral = compute_sdt_scores({k: 3 for k in [f"B{i}" for i in range(1, 13)]})
        org_neutral = compute_org_scores(_org_all(3))

        org_good_workload = dict(org_neutral)
        org_bad_workload  = dict(org_neutral)
        org_good_workload["workload"] = 10.0   # werkdruk acceptabel
        org_bad_workload["workload"]  = 1.0    # werkdruk niet acceptabel

        risk_good = compute_retention_risk(sdt_neutral, org_good_workload)["risk_score"]
        risk_bad  = compute_retention_risk(sdt_neutral, org_bad_workload)["risk_score"]

        assert risk_good < risk_bad, (
            f"Hoge werkdruk-satisfactie ({org_good_workload['workload']}) moet LAGER risico geven "
            f"dan lage werkdruk-satisfactie ({org_bad_workload['workload']}). "
            f"Goed: {risk_good:.2f}, Slecht: {risk_bad:.2f}"
        )

    def test_risk_score_clamped_to_1_10(self):
        """risk_score moet altijd binnen [1, 10] vallen."""
        sdt = self._min_sdt()
        org = compute_org_scores(_org_all(1))
        result = compute_retention_risk(sdt, org)
        assert 1.0 <= result["risk_score"] <= 10.0

    def test_risk_bands_match_thresholds(self):
        """Risicobanden sluiten aaneensluitend aan op de drempelwaarden."""
        sdt_neutral = compute_sdt_scores({k: 3 for k in [f"B{i}" for i in range(1, 13)]})
        org_neutral = compute_org_scores(_org_all(3))
        result = compute_retention_risk(sdt_neutral, org_neutral)
        score = result["risk_score"]
        band  = result["risk_band"]

        if score >= RISK_HIGH:
            assert band == "HOOG"
        elif score >= RISK_MEDIUM:
            assert band == "MIDDEN"
        else:
            assert band == "LAAG"

    def test_factor_risks_all_present(self):
        """factor_risks moet een entry bevatten voor alle org-factoren + SDT."""
        sdt = self._max_sdt()
        org = compute_org_scores(_org_all(3))
        result = compute_retention_risk(sdt, org)
        for factor in ORG_FACTOR_KEYS:
            assert factor in result["factor_risks"], f"Factor '{factor}' ontbreekt in factor_risks"
        assert "sdt" in result["factor_risks"]

    def test_leadership_weight_is_highest(self):
        """
        Leiderschap heeft het hoogste gewicht (2.5). Een slechte leiderschap-score
        moet meer impact op het eindrisico hebben dan een slechte beloning-score.
        """
        sdt_neutral = compute_sdt_scores({k: 3 for k in [f"B{i}" for i in range(1, 13)]})
        org_base = compute_org_scores(_org_all(5))  # Start met alles goed

        # Alleen leiderschap slecht
        org_bad_leadership = dict(org_base)
        org_bad_leadership["leadership"] = 1.0

        # Alleen beloning slecht
        org_bad_compensation = dict(org_base)
        org_bad_compensation["compensation"] = 1.0

        risk_leadership   = compute_retention_risk(sdt_neutral, org_bad_leadership)["risk_score"]
        risk_compensation = compute_retention_risk(sdt_neutral, org_bad_compensation)["risk_score"]

        assert risk_leadership > risk_compensation, (
            "Leiderschap-risico moet zwaarder wegen dan beloning-risico"
        )

    def test_retention_scan_uses_equal_weights(self):
        sdt_neutral = compute_sdt_scores({k: 3 for k in [f"B{i}" for i in range(1, 13)]})
        org_base = compute_org_scores(_org_all(5))

        org_bad_leadership = dict(org_base)
        org_bad_leadership["leadership"] = 1.0

        org_bad_compensation = dict(org_base)
        org_bad_compensation["compensation"] = 1.0

        risk_leadership = compute_retention_risk(
            sdt_neutral,
            org_bad_leadership,
            scan_type="retention",
        )["risk_score"]
        risk_compensation = compute_retention_risk(
            sdt_neutral,
            org_bad_compensation,
            scan_type="retention",
        )["risk_score"]

        assert risk_leadership == pytest.approx(risk_compensation)


class TestComputeRetentionSupplementalScores:
    def test_engagement_and_turnover_intention_are_normalized_to_1_10(self):
        result = compute_retention_supplemental_scores(
            {"uwes_1": 5, "uwes_2": 4, "uwes_3": 5},
            {"ti_1": 2, "ti_2": 3},
            4,
        )

        assert result["engagement_score"] == pytest.approx(round(_scale((5 + 4 + 5) / 3), 2))
        assert result["turnover_intention_score"] == pytest.approx(round(_scale((2 + 3) / 2), 2))
        assert result["stay_intent_score"] == pytest.approx(round(_scale(4), 2))

    def test_empty_retention_blocks_return_none(self):
        result = compute_retention_supplemental_scores({}, {}, None)
        assert result["engagement_score"] is None
        assert result["turnover_intention_score"] is None
        assert result["stay_intent_score"] is None


class TestComputeExitFriction:
    def test_exit_friction_uses_exit_weighting_and_returns_valid_band(self):
        sdt = compute_sdt_scores(_sdt_all(3))
        org = compute_org_scores(_org_all(3))

        result = compute_exit_friction(sdt, org)

        assert 1.0 <= result["risk_score"] <= 10.0
        assert result["risk_band"] in {"LAAG", "MIDDEN", "HOOG"}
        assert result["factor_weights"]["leadership"] == pytest.approx(2.5)
        assert result["factor_weights"]["sdt"] == pytest.approx(2.0)

    def test_shared_compute_retention_risk_exit_path_matches_exit_module(self):
        sdt = compute_sdt_scores(_sdt_all(2))
        org = compute_org_scores(_org_all(4))

        shared_result = compute_retention_risk(sdt, org)
        exit_result = compute_exit_friction(sdt, org)

        assert shared_result == exit_result


class TestExitContextSummary:
    def test_exit_context_summary_contains_reason_labels_and_signal_visibility(self):
        payload = SimpleNamespace(
            exit_reason_category="groei",
            stay_intent_score=4,
            signal_visibility_score=2,
        )

        summary = build_exit_context_summary(
            payload=payload,
            exit_reason_code="P3",
            contributing_reason_codes=["P1"],
        )

        assert summary["primary_reason_label"] == "Gebrek aan groei"
        assert summary["contributing_reason_labels"] == ["Leiderschap / management"]
        assert summary["signal_visibility_summary"]["label"] == "Signalen bleven grotendeels onder de radar"


class TestExitReportContent:
    def test_exit_methodology_payload_stays_non_causal(self):
        payload = get_methodology_payload()

        intro = payload["intro_text"].lower()
        method = payload["method_text"].lower()

        assert "vertrekduiding" in intro
        assert "diagnostisch instrument" in intro
        assert "niet als causale voorspelling" in method
        assert "benchmark" in method

    def test_exit_signal_page_payload_frames_management_questions_not_causal_proof(self):
        payload = get_signal_page_payload()
        intro = payload["intro"].lower()

        assert "managementvragen" in intro
        assert "niet om één causale vertrekverklaring vast te stellen" in intro


class TestRetentionSignalProfile:
    def test_sharp_attention_profile_when_multiple_negative_signals_align(self):
        profile = compute_retention_signal_profile(
            risk_score=7.4,
            engagement_score=4.8,
            turnover_intention_score=6.4,
            stay_intent_score=4.3,
        )
        assert profile == "scherp_aandachtssignaal"


class TestDetectPatterns:
    def test_detect_patterns_builds_exit_signal_summary(self):
        responses = [
            {
                "org_scores": {"leadership": 3.0, "culture": 4.0, "growth": 3.5, "compensation": 5.0, "workload": 4.0, "role_clarity": 4.5},
                "sdt_scores": {"autonomy": 4.0, "competence": 4.5, "relatedness": 5.0},
                "risk_score": 6.8,
                "preventability": "STERK_WERKSIGNAAL",
                "exit_reason_code": "P1",
                "contributing_reason_codes": ["P3"],
                "department": "Operations",
            }
            for _ in range(5)
        ] + [
            {
                "org_scores": {"leadership": 4.0, "culture": 4.5, "growth": 4.0, "compensation": 5.0, "workload": 4.5, "role_clarity": 4.0},
                "sdt_scores": {"autonomy": 4.5, "competence": 4.5, "relatedness": 4.5},
                "risk_score": 5.9,
                "preventability": "GEMENGD_WERKSIGNAAL",
                "exit_reason_code": "P3",
                "contributing_reason_codes": ["P1"],
                "department": "Operations",
            }
            for _ in range(5)
        ]

        result = detect_patterns(responses)

        assert result["sufficient_data"] is True
        assert result["strong_work_signal_pct"] == pytest.approx(50.0)
        assert result["any_work_signal_pct"] == pytest.approx(100.0)
        assert result["top_exit_reasons"][0]["code"] == "P1"
        assert result["top_contributing_reasons"][0]["code"] == "P3"
        assert result["department_avg_risk"]["Operations"] == pytest.approx(6.35)

    def test_detect_patterns_builds_retention_averages_without_exit_metadata(self):
        responses = [
            {
                "org_scores": {"leadership": 4.0, "culture": 4.5, "growth": 4.5, "compensation": 5.0, "workload": 4.0, "role_clarity": 4.5},
                "sdt_scores": {"autonomy": 4.5, "competence": 5.0, "relatedness": 4.5},
                "risk_score": 5.8,
                "uwes_score": 5.2,
                "turnover_intention_score": 6.1,
                "stay_intent_score": 2,
                "department": "People",
            }
            for _ in range(5)
        ] + [
            {
                "org_scores": {"leadership": 5.0, "culture": 5.0, "growth": 5.0, "compensation": 5.0, "workload": 5.0, "role_clarity": 5.0},
                "sdt_scores": {"autonomy": 5.0, "competence": 5.0, "relatedness": 5.0},
                "risk_score": 4.8,
                "uwes_score": 5.8,
                "turnover_intention_score": 4.8,
                "stay_intent_score": 4,
                "department": "People",
            }
            for _ in range(5)
        ]

        result = detect_patterns(responses)

        assert result["sufficient_data"] is True
        assert result["avg_engagement_score"] == pytest.approx(5.5)
        assert result["avg_turnover_intention_score"] == pytest.approx(5.45)
        assert result["avg_stay_intent_score"] == pytest.approx(5.5)
        assert result["top_exit_reasons"] == []
        assert result["strong_work_signal_pct"] is None


# ---------------------------------------------------------------------------
# 5. Preventability classification
# ---------------------------------------------------------------------------

class TestComputePreventability:
    """
    Werkfactorsignaal-logica:
    - persoonlijke exitreden → beperkt signaal van beïnvloedbare werkfactoren
    - combinatie van hoofdreden, stay-intent en lage scores → oplopend werkfactorsignaal
    - output is bewust zachter dan een klassieke redbaar/niet-redbaar classificatie
    """
    def _neutral_sdt(self):
        return compute_sdt_scores({k: 3 for k in [f"B{i}" for i in range(1, 13)]})

    def _neutral_org(self):
        return compute_org_scores(_org_all(3))

    def test_personal_reason_is_beperkt_werksignaal(self):
        """Persoonlijke exitreden → beperkt werkfactorsignaal."""
        result = compute_preventability(
            exit_reason_category="pensioen",
            stay_intent_score=5,
            sdt_scores=self._neutral_sdt(),
            org_scores=self._neutral_org(),
        )
        assert result["preventability"] == "BEPERKT_WERKSIGNAAL"

    def test_low_stay_intent_with_push_reason_stays_beperkt(self):
        """Alleen push-hoofdreden zonder extra werkfrictie blijft beperkt signaal."""
        result = compute_preventability(
            exit_reason_category="push",
            stay_intent_score=1,
            sdt_scores=self._neutral_sdt(),
            org_scores=self._neutral_org(),
        )
        assert result["preventability"] == "BEPERKT_WERKSIGNAAL"

    def test_push_high_intent_low_sdt_is_gemengd_werksignaal(self):
        """Push + hoge intent + slechte SDT-scores → minimaal gemengd werkfactorsignaal."""
        # Slechte SDT: alle items op 1 → lage dimensiescores (ruim onder 4.0)
        bad_sdt = compute_sdt_scores({k: 1 for k in [f"B{i}" for i in range(1, 13)]})
        result = compute_preventability(
            exit_reason_category="push",
            stay_intent_score=5,
            sdt_scores=bad_sdt,
            org_scores=self._neutral_org(),
        )
        assert result["preventability"] == "GEMENGD_WERKSIGNAAL"

    def test_neutral_scenario_is_beperkt_werksignaal(self):
        """Neutrale scores zonder extra negatieve signalen blijven beperkt werkfactorsignaal."""
        result = compute_preventability(
            exit_reason_category="push",
            stay_intent_score=5,
            sdt_scores=self._neutral_sdt(),
            org_scores=self._neutral_org(),
        )
        assert result["preventability"] == "BEPERKT_WERKSIGNAAL"

    def test_result_has_required_keys(self):
        """Output bevat altijd preventability, label en reasoning."""
        result = compute_preventability(
            exit_reason_category="push",
            stay_intent_score=3,
            sdt_scores=self._neutral_sdt(),
            org_scores=self._neutral_org(),
        )
        assert "preventability" in result
        assert "preventability_label" in result
        assert "reasoning" in result
