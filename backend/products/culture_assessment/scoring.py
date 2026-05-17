from __future__ import annotations

from typing import Any


RUNTIME_DISABLED_MESSAGE = (
    "Loep Culture Assessment ondersteunt in deze wave nog geen runtime survey scoring of respondentverwerking."
)


def validate_submission(*_args: Any, **_kwargs: Any) -> None:
    raise NotImplementedError(RUNTIME_DISABLED_MESSAGE)


def score_submission(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
    raise NotImplementedError(RUNTIME_DISABLED_MESSAGE)
