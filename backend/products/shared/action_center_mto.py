from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class MtoDesignInput:
    source: Literal["mto"]
    themes: list[str]
    notes: str | None


@dataclass(frozen=True)
class MtoDesignInputSummary:
    source: Literal["mto"]
    mode: Literal["design_input_only"]
    theme_count: int
    notes: str | None
    can_create_assignments: Literal[False]
    can_open_carrier: Literal[False]


def describe_mto_design_input(input_data: MtoDesignInput) -> MtoDesignInputSummary:
    return MtoDesignInputSummary(
        source=input_data.source,
        mode="design_input_only",
        theme_count=len(input_data.themes),
        notes=input_data.notes,
        can_create_assignments=False,
        can_open_carrier=False,
    )
