from __future__ import annotations

from collections import defaultdict
from typing import Any

from backend.models import SurveyResponse
from backend.scoring_config import SDT_DIMENSION_ITEMS, SDT_REVERSE_ITEMS
from backend.schemas import (
    CampaignItemScoresResponse,
    ItemScoreDetail,
    ItemScoreGroup,
    SdtDimensionItemScoreGroup,
    SupplementalItemScoreGroup,
)
from backend.products.shared.registry import get_product_module
from backend.products.shared.sdt import scale_to_ten

ITEM_PRIVACY_FLOOR = 5

SDT_DIMENSION_LABELS = {
    "autonomy": "Autonomie",
    "competence": "Competentie",
    "relatedness": "Verbondenheid",
}

SUPPLEMENTAL_SECTION_LABELS = {
    "uwes": "Bevlogenheid (UWES-3)",
    "turnover_intention": "Vertrekintentie",
}


def _mean(values: list[float]) -> float | None:
    if not values:
        return None
    return round(sum(values) / len(values), 2)


def _normalize_item_score(item_key: str, raw_value: int | float, *, reverse: bool = False) -> float:
    value = float(raw_value)
    if reverse:
        value = 6.0 - value
    return round(scale_to_ten(value), 2)


def _build_definition_maps(scan_type: str) -> dict[str, Any]:
    definition = get_product_module(scan_type).get_definition()
    sdt_items = dict(definition.get("sdt_items", []))
    org_sections = definition.get("org_sections", [])
    org_item_labels = {
        item_key: item_label
        for section in org_sections
        for item_key, item_label in section.get("items", [])
    }
    org_factor_labels = {
        section["key"]: section["title"]
        for section in org_sections
    }
    uwes_items = dict(definition.get("uwes_items", []))
    turnover_items = dict(definition.get("turnover_items", []))
    return {
        "definition": definition,
        "sdt_items": sdt_items,
        "org_item_labels": org_item_labels,
        "org_factor_labels": org_factor_labels,
        "org_sections": org_sections,
        "uwes_items": uwes_items,
        "turnover_items": turnover_items,
    }


def _aggregate_item_values(
    responses: list[SurveyResponse],
    *,
    raw_attr: str,
    item_order: list[str],
    reverse_items: set[str] | None = None,
) -> tuple[dict[str, list[float]], dict[str, int]]:
    values_by_item: dict[str, list[float]] = defaultdict(list)
    counts_by_item: dict[str, int] = {}
    reverse_items = reverse_items or set()

    for item_key in item_order:
        item_values: list[float] = []
        for response in responses:
            raw_map = getattr(response, raw_attr) or {}
            raw_value = raw_map.get(item_key)
            if raw_value is None:
                continue
            item_values.append(
                _normalize_item_score(
                    item_key,
                    raw_value,
                    reverse=item_key in reverse_items,
                )
            )
        values_by_item[item_key] = item_values
        counts_by_item[item_key] = len(item_values)

    return values_by_item, counts_by_item


def _build_item_details(
    *,
    item_keys: list[str],
    labels: dict[str, str],
    values_by_item: dict[str, list[float]],
    counts_by_item: dict[str, int],
    privacy_suppressed_items: list[str],
    suppressed_items: list[ItemScoreDetail],
) -> list[ItemScoreDetail]:
    visible_items: list[ItemScoreDetail] = []

    for item_key in item_keys:
        label = labels.get(item_key)
        if not label:
            continue

        count = counts_by_item.get(item_key, 0)
        if count < ITEM_PRIVACY_FLOOR:
            privacy_suppressed_items.append(item_key)
            suppressed_items.append(ItemScoreDetail(item_key=item_key, label=label, avg=None, n=count))
            continue

        visible_items.append(
            ItemScoreDetail(
                item_key=item_key,
                label=label,
                avg=_mean(values_by_item.get(item_key, [])),
                n=count,
            )
        )

    return visible_items


def _build_factor_groups(
    responses: list[SurveyResponse],
    *,
    org_sections: list[dict[str, Any]],
    org_item_labels: dict[str, str],
    org_factor_labels: dict[str, str],
) -> tuple[list[ItemScoreGroup], list[str], list[ItemScoreDetail]]:
    ordered_org_items = [
        item_key
        for section in org_sections
        for item_key, _item_label in section.get("items", [])
    ]
    values_by_item, counts_by_item = _aggregate_item_values(
        responses,
        raw_attr="org_raw",
        item_order=ordered_org_items,
    )

    privacy_suppressed_items: list[str] = []
    suppressed_items: list[ItemScoreDetail] = []
    groups: list[ItemScoreGroup] = []

    for section in org_sections:
        factor_key = section["key"]
        factor_values = [
            float(response.org_scores[factor_key])
            for response in responses
            if factor_key in (response.org_scores or {})
        ]
        if not factor_values:
            continue

        item_keys = [item_key for item_key, _label in section.get("items", [])]
        items = _build_item_details(
            item_keys=item_keys,
            labels=org_item_labels,
            values_by_item=values_by_item,
            counts_by_item=counts_by_item,
            privacy_suppressed_items=privacy_suppressed_items,
            suppressed_items=suppressed_items,
        )
        groups.append(
            ItemScoreGroup(
                factor_key=factor_key,
                factor_label=org_factor_labels.get(factor_key, factor_key),
                avg_score=_mean(factor_values),
                items=items,
            )
        )

    return groups, privacy_suppressed_items, suppressed_items


def _build_sdt_groups(
    responses: list[SurveyResponse],
    *,
    sdt_item_labels: dict[str, str],
) -> tuple[list[SdtDimensionItemScoreGroup], list[str], list[ItemScoreDetail]]:
    ordered_sdt_items = [
        item_key
        for dimension in SDT_DIMENSION_ITEMS.values()
        for item_key in dimension
        if item_key in sdt_item_labels
    ]
    values_by_item, counts_by_item = _aggregate_item_values(
        responses,
        raw_attr="sdt_raw",
        item_order=ordered_sdt_items,
        reverse_items=SDT_REVERSE_ITEMS,
    )

    privacy_suppressed_items: list[str] = []
    suppressed_items: list[ItemScoreDetail] = []
    groups: list[SdtDimensionItemScoreGroup] = []

    for dimension_key, item_keys in SDT_DIMENSION_ITEMS.items():
        scoped_item_keys = [item_key for item_key in item_keys if item_key in sdt_item_labels]
        if not scoped_item_keys:
            continue

        dimension_values = [
            float(response.sdt_scores[dimension_key])
            for response in responses
            if dimension_key in (response.sdt_scores or {})
        ]
        if not dimension_values:
            continue

        items = _build_item_details(
            item_keys=scoped_item_keys,
            labels=sdt_item_labels,
            values_by_item=values_by_item,
            counts_by_item=counts_by_item,
            privacy_suppressed_items=privacy_suppressed_items,
            suppressed_items=suppressed_items,
        )
        groups.append(
            SdtDimensionItemScoreGroup(
                dimension_key=dimension_key,
                dimension_label=SDT_DIMENSION_LABELS[dimension_key],
                avg_score=_mean(dimension_values),
                items=items,
            )
        )

    return groups, privacy_suppressed_items, suppressed_items


def _build_retention_supplemental_sections(
    responses: list[SurveyResponse],
    *,
    uwes_item_labels: dict[str, str],
    turnover_item_labels: dict[str, str],
) -> tuple[list[SupplementalItemScoreGroup], list[str], list[ItemScoreDetail]]:
    sections: list[SupplementalItemScoreGroup] = []
    privacy_suppressed_items: list[str] = []
    suppressed_items: list[ItemScoreDetail] = []

    section_specs = [
        ("uwes", "uwes_raw", uwes_item_labels, "uwes_score"),
        ("turnover_intention", "turnover_intention_raw", turnover_item_labels, "turnover_intention_score"),
    ]

    for section_key, raw_attr, labels, aggregate_attr in section_specs:
        if not labels:
            continue

        item_order = list(labels.keys())
        values_by_item, counts_by_item = _aggregate_item_values(
            responses,
            raw_attr=raw_attr,
            item_order=item_order,
        )
        aggregate_values = [
            float(getattr(response, aggregate_attr))
            for response in responses
            if getattr(response, aggregate_attr) is not None
        ]
        if not aggregate_values:
            continue

        items = _build_item_details(
            item_keys=item_order,
            labels=labels,
            values_by_item=values_by_item,
            counts_by_item=counts_by_item,
            privacy_suppressed_items=privacy_suppressed_items,
            suppressed_items=suppressed_items,
        )
        sections.append(
            SupplementalItemScoreGroup(
                section_key=section_key,
                section_label=SUPPLEMENTAL_SECTION_LABELS[section_key],
                avg_score=_mean(aggregate_values),
                items=items,
            )
        )

    return sections, privacy_suppressed_items, suppressed_items


def build_campaign_item_scores_payload(
    *,
    scan_type: str,
    responses: list[SurveyResponse],
) -> CampaignItemScoresResponse:
    maps = _build_definition_maps(scan_type)

    factor_groups, factor_suppressed_keys, factor_suppressed_items = _build_factor_groups(
        responses,
        org_sections=maps["org_sections"],
        org_item_labels=maps["org_item_labels"],
        org_factor_labels=maps["org_factor_labels"],
    )
    sdt_groups, sdt_suppressed_keys, sdt_suppressed_items = _build_sdt_groups(
        responses,
        sdt_item_labels=maps["sdt_items"],
    )

    supplemental_sections: list[SupplementalItemScoreGroup] = []
    supplemental_suppressed_keys: list[str] = []
    supplemental_suppressed_items: list[ItemScoreDetail] = []
    if scan_type == "retention":
        (
            supplemental_sections,
            supplemental_suppressed_keys,
            supplemental_suppressed_items,
        ) = _build_retention_supplemental_sections(
            responses,
            uwes_item_labels=maps["uwes_items"],
            turnover_item_labels=maps["turnover_items"],
        )

    all_suppressed_items = (
        factor_suppressed_items + sdt_suppressed_items + supplemental_suppressed_items
    )
    return CampaignItemScoresResponse(
        factors=factor_groups,
        sdt_dimensions=[
            SdtDimensionItemScoreGroup(
                dimension_key=group.dimension_key,
                dimension_label=group.dimension_label,
                avg_score=group.avg_score,
                items=group.items,
            )
            for group in sdt_groups
        ],
        supplemental_sections=supplemental_sections,
        privacy_suppressed_items=(
            factor_suppressed_keys + sdt_suppressed_keys + supplemental_suppressed_keys
        ),
        suppressed_items=all_suppressed_items,
    )
