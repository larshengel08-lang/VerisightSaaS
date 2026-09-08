"""DirectionResponse + weigering van het oude geneste formaat (spec par. 4.2/4.3)."""
import pytest
from pydantic import ValidationError

from backend.schemas import DeepeningEntry, DirectionResponse, SurveySubmit


def _dr(**over):
    base = dict(factor_key="workload", question_set_version="retention_workload_direction_v2",
                status="answered", choice="wld_peaks")
    base.update(over)
    return base


def test_answered_requires_choice():
    with pytest.raises(ValidationError):
        DirectionResponse(**_dr(choice=None))


def test_skipped_forbids_choice_and_other():
    with pytest.raises(ValidationError):
        DirectionResponse(**_dr(status="skipped"))
    with pytest.raises(ValidationError):
        DirectionResponse(**_dr(status="skipped", choice=None, other_text="x"))
    ok = DirectionResponse(**_dr(status="skipped", choice=None))
    assert ok.choice is None and ok.other_text is None


def test_other_requires_text_and_text_requires_other():
    with pytest.raises(ValidationError):
        DirectionResponse(**_dr(choice="wld_other"))
    with pytest.raises(ValidationError):
        DirectionResponse(**_dr(choice="wld_other", other_text="   "))
    with pytest.raises(ValidationError):
        DirectionResponse(**_dr(other_text="tekst bij een gewone route"))
    assert DirectionResponse(**_dr(choice="wld_other", other_text="Iets anders")).other_text == "Iets anders"


def test_other_text_max_200():
    with pytest.raises(ValidationError):
        DirectionResponse(**_dr(choice="wld_other", other_text="x" * 201))


def test_deepening_entry_has_no_direction_field_and_rejects_legacy():
    assert "direction" not in DeepeningEntry.model_fields
    with pytest.raises(ValidationError) as exc:
        DeepeningEntry(factor_key="workload", question_set_version="retention_workload_v1",
                       status="answered", primary="wl_recovery",
                       direction={"question_set_version": "x", "status": "skipped"})
    assert "Verouderd inzendformaat voor gespreksrichting" in str(exc.value)


def test_survey_submit_accepts_optional_direction_response():
    assert SurveySubmit.model_fields["direction_response"].default is None
