# tests/test_direction_schema.py
import pytest
from pydantic import ValidationError

from backend.schemas import DeepeningDirection, DeepeningEntry


def _entry(**over):
    base = dict(factor_key="workload", question_set_version="retention_workload_v1",
                status="answered", primary="wl_recovery")
    base.update(over)
    return base


def test_direction_answered_requires_choice():
    with pytest.raises(ValidationError):
        DeepeningDirection(question_set_version="retention_workload_direction_v1",
                           status="answered", choice=None)


def test_direction_skipped_forbids_choice_and_other():
    with pytest.raises(ValidationError):
        DeepeningDirection(question_set_version="retention_workload_direction_v1",
                           status="skipped", choice="wld_recovery")
    with pytest.raises(ValidationError):
        DeepeningDirection(question_set_version="retention_workload_direction_v1",
                           status="skipped", other_text="x")


def test_direction_other_requires_other_text():
    with pytest.raises(ValidationError):
        DeepeningDirection(question_set_version="retention_workload_direction_v1",
                           status="answered", choice="wld_other", other_text=None)
    ok = DeepeningDirection(question_set_version="retention_workload_direction_v1",
                            status="answered", choice="wld_other", other_text="minder vergaderdruk")
    assert ok.other_text == "minder vergaderdruk"


def test_direction_other_text_forbidden_without_other_choice():
    with pytest.raises(ValidationError):
        DeepeningDirection(question_set_version="retention_workload_direction_v1",
                           status="answered", choice="wld_recovery", other_text="tekst")


def test_entry_direction_only_when_answered():
    d = dict(question_set_version="retention_workload_direction_v1",
             status="answered", choice="wld_recovery")
    ok = DeepeningEntry(**_entry(direction=d))
    assert ok.direction.choice == "wld_recovery"
    with pytest.raises(ValidationError):
        DeepeningEntry(**_entry(status="skipped", primary=None, direction=d))


def test_entry_without_direction_still_valid():
    ok = DeepeningEntry(**_entry())
    assert ok.direction is None
