from __future__ import annotations

import generate_voorbeeldrapport as sample_generator


def test_pick_exit_profile_keeps_exit_reason_fields(monkeypatch):
    monkeypatch.setattr(sample_generator.random, "random", lambda: 0.1)

    profile = sample_generator._pick_profile(sample_generator.EXIT_PROFILES)

    assert profile["name"] == "leiderschap_probleem"
    assert profile["reason_category"] == "leiderschap"
    assert profile["reason_code"] == "P1"
    assert "engagement_base" not in profile


def test_pick_retention_profile_keeps_signal_bases(monkeypatch):
    monkeypatch.setattr(sample_generator.random, "random", lambda: 0.1)

    profile = sample_generator._pick_profile(sample_generator.RETENTION_PROFILES)

    assert profile["name"] == "bevlogen_kern"
    assert profile["engagement_base"] == 4.7
    assert profile["turnover_base"] == 1.4
    assert "reason_category" not in profile
