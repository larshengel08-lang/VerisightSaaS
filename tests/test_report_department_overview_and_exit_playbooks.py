from __future__ import annotations

from types import SimpleNamespace

from backend.report import (
    _build_department_overview_payload,
    _build_exit_playbook_rows,
)
from backend.products.exit.report_content import get_action_playbooks_payload


def _fake_response(
    *,
    department: str | None,
    risk_score: float,
    org_scores: dict[str, float],
):
    respondent = SimpleNamespace(department=department, role_level=None)
    return SimpleNamespace(
        risk_score=risk_score,
        org_scores=org_scores,
        respondent=respondent,
    )


def test_department_overview_payload_groups_small_departments_and_sorts_by_highest_score():
    responses = []
    responses.extend([
        _fake_response(
            department="Operations",
            risk_score=7.8,
            org_scores={
                "leadership": 3.2,
                "culture": 4.1,
                "growth": 4.4,
                "compensation": 5.0,
                "workload": 4.2,
                "role_clarity": 4.7,
            },
        )
        for _ in range(6)
    ])
    responses.extend([
        _fake_response(
            department="Sales",
            risk_score=6.4,
            org_scores={
                "leadership": 4.8,
                "culture": 4.9,
                "growth": 4.2,
                "compensation": 5.1,
                "workload": 5.0,
                "role_clarity": 4.6,
            },
        )
        for _ in range(5)
    ])
    responses.extend([
        _fake_response(
            department="HR",
            risk_score=5.1,
            org_scores={
                "leadership": 5.3,
                "culture": 4.8,
                "growth": 5.2,
                "compensation": 4.1,
                "workload": 5.0,
                "role_clarity": 5.4,
            },
        )
        for _ in range(5)
    ])
    responses.extend([
        _fake_response(
            department="Legal",
            risk_score=6.8,
            org_scores={
                "leadership": 4.7,
                "culture": 4.6,
                "growth": 4.9,
                "compensation": 4.8,
                "workload": 3.5,
                "role_clarity": 4.5,
            },
        )
        for _ in range(3)
    ])
    responses.extend([
        _fake_response(
            department="Finance",
            risk_score=5.9,
            org_scores={
                "leadership": 4.9,
                "culture": 4.7,
                "growth": 4.8,
                "compensation": 5.1,
                "workload": 4.4,
                "role_clarity": 4.9,
            },
        )
        for _ in range(2)
    ])

    payload = _build_department_overview_payload(
        responses=responses,
        score_label="frictiescore",
    )

    assert payload is not None
    assert payload["sections"][0]["department"] == "Operations"
    assert payload["sections"][0]["n"] == 6
    assert payload["sections"][0]["band"] == "Direct prioriteren"
    assert payload["sections"][0]["top_factor"] == "Leiderschap"
    assert payload["sections"][1]["department"] == "Sales"
    assert payload["sections"][2]["department"] == "HR"
    assert payload["sections"][3]["department"] == "Overige afdelingen"
    assert payload["sections"][3]["n"] == 5
    assert payload["sections"][3]["top_factor"] == "Werkbelasting"
    assert all(section["n"] >= 5 for section in payload["sections"])
    assert "Legal" not in [section["department"] for section in payload["sections"]]
    assert "Finance" not in [section["department"] for section in payload["sections"]]


def test_department_overview_payload_returns_none_when_too_few_departments_clear_privacy_floor():
    responses = []
    responses.extend([
        _fake_response(
            department="Operations",
            risk_score=7.2,
            org_scores={
                "leadership": 3.5,
                "culture": 4.2,
                "growth": 4.6,
                "compensation": 5.0,
                "workload": 4.3,
                "role_clarity": 4.9,
            },
        )
        for _ in range(6)
    ])
    responses.extend([
        _fake_response(
            department="HR",
            risk_score=5.6,
            org_scores={
                "leadership": 4.8,
                "culture": 4.7,
                "growth": 5.0,
                "compensation": 4.5,
                "workload": 4.9,
                "role_clarity": 5.1,
            },
        )
        for _ in range(4)
    ])

    payload = _build_department_overview_payload(
        responses=responses,
        score_label="retentiesignaal",
    )

    assert payload is None


def test_exit_playbooks_use_retrospective_tone_and_hr_manager_joint_owner():
    rows = _build_exit_playbook_rows(
        top_risks=[("leadership", 7.6), ("workload", 6.3)],
    )

    assert len(rows) == 2
    assert rows[0]["factor"] == "leadership"
    assert rows[0]["label"] == "Leiderschap"
    assert rows[0]["signal_value"] == 7.6
    assert rows[0]["decision"]
    assert rows[0]["decision"].startswith("Beslis eerst")
    assert rows[0]["owner"] == "HR en betrokken manager samen"
    assert "onderzoek" in rows[0]["validate"].lower()
    assert "60-90 dagen" in rows[0]["validate"]
    assert any("volgende persoon" in action.lower() for action in rows[0]["actions"])
    assert any("onderzoek" in action.lower() for action in rows[0]["actions"])
    assert "oorzaak" not in rows[0]["caution"].lower()


def test_exit_playbook_payload_only_returns_scored_high_and_middle_factors_in_priority_order():
    payload = get_action_playbooks_payload(
        factor_avgs={
            "leadership": 3.6,
            "workload": 4.9,
            "culture": 6.2,
            "compensation": 8.1,
            "unknown_factor": 2.8,
        },
        top_risks=[],
    )

    assert [entry["factor_key"] for entry in payload] == ["leadership", "workload", "culture"]
    assert [entry["band"] for entry in payload] == ["HOOG", "MIDDEN", "MIDDEN"]
    assert payload[0]["title"] == "Leiderschap als vertrekdriver: directe managementvraag"
    assert payload[0]["score"] == 3.6
    assert payload[-1]["score"] == 6.2
