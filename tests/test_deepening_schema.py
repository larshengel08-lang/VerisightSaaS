import pytest
from pydantic import ValidationError
from backend.schemas import DeepeningEntry, SurveySubmit


def test_valid_answered_entry():
    e = DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="answered", primary="wl_recovery", secondary="wl_peaks_adhoc")
    assert e.other_text is None


def test_skipped_entry_needs_no_choices():
    e = DeepeningEntry(factor_key="growth", question_set_version="retention_growth_v1",
                       status="skipped")
    assert e.primary is None


def test_answered_requires_primary():
    with pytest.raises(ValidationError):
        DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="answered", primary=None)


def test_skipped_must_not_carry_choices():
    with pytest.raises(ValidationError):
        DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="skipped", primary="wl_volume")


def test_secondary_must_differ_from_primary():
    with pytest.raises(ValidationError):
        DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="answered", primary="wl_volume", secondary="wl_volume")


def test_other_text_max_200():
    with pytest.raises(ValidationError):
        DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="answered", primary="wl_other", other_text="x" * 201)


def test_other_text_at_200_is_valid():
    e = DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="answered", primary="wl_other", other_text="x" * 200)
    assert len(e.other_text) == 200


def test_other_text_only_with_other_option():
    with pytest.raises(ValidationError):
        DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="answered", primary="wl_volume", other_text="tekst zonder other")


def test_other_text_allowed_with_secondary_other():
    e = DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="answered", primary="wl_volume", secondary="wl_other",
                       other_text="korte toelichting")
    assert e.other_text == "korte toelichting"


def test_invalid_status_rejected():
    with pytest.raises(ValidationError):
        DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="maybe")


def test_survey_submit_accepts_deepening_list():
    s = SurveySubmit(token="t", deepening_responses=[
        {"factor_key": "workload", "question_set_version": "retention_workload_v1",
         "status": "answered", "primary": "wl_recovery"}])
    assert len(s.deepening_responses) == 1


def test_survey_submit_defaults_empty():
    assert SurveySubmit(token="t").deepening_responses == []
