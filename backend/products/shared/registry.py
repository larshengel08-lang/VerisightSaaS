from __future__ import annotations

from importlib import import_module
from types import ModuleType


_PRODUCT_MODULES: dict[str, str] = {
    "exit": "backend.products.exit",
    "leadership": "backend.products.leadership",
    "onboarding": "backend.products.onboarding",
    "retention": "backend.products.retention",
    "pulse": "backend.products.pulse",
    "team": "backend.products.team",
}


def get_product_module(scan_type: str) -> ModuleType:
    module_path = _PRODUCT_MODULES.get(scan_type, _PRODUCT_MODULES["exit"])
    return import_module(module_path)
