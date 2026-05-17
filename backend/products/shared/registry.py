from __future__ import annotations

from importlib import import_module
from types import ModuleType
from typing import Any


_PRODUCT_MODULES: dict[str, str] = {
    "culture_assessment": "backend.products.culture_assessment",
    "exit": "backend.products.exit",
    "leadership": "backend.products.leadership",
    "onboarding": "backend.products.onboarding",
    "retention": "backend.products.retention",
    "pulse": "backend.products.pulse",
    "team": "backend.products.team",
}


def _build_placeholder_module(scan_type: str) -> ModuleType:
    module = ModuleType(f"backend.products.placeholder.{scan_type}")
    definition: dict[str, Any] = {
        "scan_type": scan_type,
        "product_name": "Loep Culture Assessment",
        "signal_label": "Loep Culture Index",
    }
    message = "culture_assessment backend product module is not implemented yet"

    def _raise_unimplemented(*_args: Any, **_kwargs: Any) -> Any:
        raise NotImplementedError(message)

    module.scan_type = scan_type
    module.SCAN_DEFINITION = definition
    module.get_definition = lambda: definition
    module.get_management_summary_payload = _raise_unimplemented
    module.get_methodology_payload = _raise_unimplemented
    module.score_submission = _raise_unimplemented
    module.validate_submission = _raise_unimplemented
    return module


def get_product_module(scan_type: str) -> ModuleType:
    module_path = _PRODUCT_MODULES.get(scan_type, _PRODUCT_MODULES["exit"])
    try:
        return import_module(module_path)
    except ModuleNotFoundError:
        if scan_type == "culture_assessment":
            return _build_placeholder_module(scan_type)
        raise
