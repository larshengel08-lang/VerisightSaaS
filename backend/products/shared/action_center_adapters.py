from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


FutureActionCenterAdapterKey = Literal["exit", "retention", "onboarding", "pulse", "leadership"]
FutureActionCenterAdapterStatus = Literal["inactive"]


@dataclass(frozen=True)
class FutureActionCenterAdapter:
    key: FutureActionCenterAdapterKey
    label: str
    status: FutureActionCenterAdapterStatus
    live_entry_enabled: Literal[False]


_FUTURE_ADAPTERS: dict[FutureActionCenterAdapterKey, FutureActionCenterAdapter] = {
    "exit": FutureActionCenterAdapter(
        key="exit",
        label="ExitScan-adapter",
        status="inactive",
        live_entry_enabled=False,
    ),
    "retention": FutureActionCenterAdapter(
        key="retention",
        label="RetentieScan-adapter",
        status="inactive",
        live_entry_enabled=False,
    ),
    "onboarding": FutureActionCenterAdapter(
        key="onboarding",
        label="Onboarding-adapter",
        status="inactive",
        live_entry_enabled=False,
    ),
    "pulse": FutureActionCenterAdapter(
        key="pulse",
        label="Pulse-adapter",
        status="inactive",
        live_entry_enabled=False,
    ),
    "leadership": FutureActionCenterAdapter(
        key="leadership",
        label="Leadership-adapter",
        status="inactive",
        live_entry_enabled=False,
    ),
}


def get_future_action_center_adapter(key: FutureActionCenterAdapterKey) -> FutureActionCenterAdapter:
    return _FUTURE_ADAPTERS[key]
