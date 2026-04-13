from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from statistics import mean
from typing import Any

import numpy as np
from sqlalchemy.orm import Session

from analysis.retention.codebook import RETENTION_CODEBOOK, codebook_as_dicts
from backend.models import Campaign, Respondent, SurveyResponse
from backend.products.shared.definitions import ORG_SECTIONS
from backend.products.shared.sdt import scale_to_ten
from backend.scoring_config import SDT_DIMENSION_ITEMS, SDT_REVERSE_ITEMS


MIN_RELIABILITY_N = 25
MIN_FACTOR_N = 40


@dataclass(frozen=True)
class ScaleSpec:
    name: str
    item_ids: tuple[str, ...]
    expected_components: int = 1
    notes: str = ""


SDT_ITEM_IDS = tuple(item.item_id for item in RETENTION_CODEBOOK if item.block == "sdt")
ORG_SCALE_SPECS = [
    ScaleSpec(
        name=section["key"],
        item_ids=tuple(item_id for item_id, _prompt in section["items"]),
        expected_components=1,
        notes=section["title"],
    )
    for section in ORG_SECTIONS
]

SCALE_SPECS = [
    ScaleSpec("autonomy", tuple(SDT_DIMENSION_ITEMS["autonomy"]), notes="SDT-autonomie"),
    ScaleSpec("competence", tuple(SDT_DIMENSION_ITEMS["competence"]), notes="SDT-competentie"),
    ScaleSpec("relatedness", tuple(SDT_DIMENSION_ITEMS["relatedness"]), notes="SDT-verbondenheid"),
    ScaleSpec("sdt_total", SDT_ITEM_IDS, expected_components=3, notes="Volledig SDT-blok"),
    *ORG_SCALE_SPECS,
    ScaleSpec("engagement", ("uwes_1", "uwes_2", "uwes_3"), notes="UWES-3"),
    ScaleSpec("turnover_intention", ("ti_1", "ti_2"), notes="Vertrekintentie"),
]


def reverse_code_if_needed(item_id: str, value: float | int | None) -> float | None:
    if value is None:
        return None
    raw = float(value)
    if item_id in SDT_REVERSE_ITEMS:
        return 6.0 - raw
    return raw


def extract_retention_rows(db: Session) -> list[dict[str, Any]]:
    rows = (
        db.query(SurveyResponse, Respondent, Campaign)
        .join(Respondent, SurveyResponse.respondent_id == Respondent.id)
        .join(Campaign, Respondent.campaign_id == Campaign.id)
        .filter(Campaign.scan_type == "retention")
        .all()
    )

    extracted: list[dict[str, Any]] = []
    for response, respondent, campaign in rows:
        row: dict[str, Any] = {
            "campaign_id": campaign.id,
            "campaign_name": campaign.name,
            "organization_id": campaign.organization_id,
            "respondent_id": respondent.id,
            "department": respondent.department,
            "role_level": respondent.role_level,
            "submitted_at": response.submitted_at.isoformat() if response.submitted_at else None,
            "risk_score": response.risk_score,
            "risk_band": response.risk_band,
            "engagement_score": response.uwes_score,
            "turnover_intention_score": response.turnover_intention_score,
            "stay_intent_score_raw": response.stay_intent_score,
            "stay_intent_score_norm": (
                round(scale_to_ten(float(response.stay_intent_score)), 2)
                if response.stay_intent_score is not None else None
            ),
            "retention_signal_score": (
                ((response.full_result or {}).get("retention_summary") or {}).get("retention_signal_score")
                or response.risk_score
            ),
            "signal_profile": (
                ((response.full_result or {}).get("retention_summary") or {}).get("signal_profile")
            ),
        }
        row.update(response.sdt_raw or {})
        row.update(response.org_raw or {})
        row.update(response.uwes_raw or {})
        row.update(response.turnover_intention_raw or {})
        extracted.append(row)

    return extracted


def _complete_case_matrix(rows: list[dict[str, Any]], item_ids: tuple[str, ...]) -> np.ndarray:
    matrix: list[list[float]] = []
    for row in rows:
        values: list[float] = []
        skip_row = False
        for item_id in item_ids:
            value = reverse_code_if_needed(item_id, row.get(item_id))
            if value is None:
                skip_row = True
                break
            values.append(float(value))
        if not skip_row:
            matrix.append(values)
    if not matrix:
        return np.empty((0, len(item_ids)))
    return np.array(matrix, dtype=float)


def cronbach_alpha(matrix: np.ndarray) -> float | None:
    if matrix.ndim != 2 or matrix.shape[0] < 2 or matrix.shape[1] < 2:
        return None
    item_variances = matrix.var(axis=0, ddof=1)
    total_scores = matrix.sum(axis=1)
    total_variance = total_scores.var(ddof=1)
    if total_variance <= 0:
        return None
    item_count = matrix.shape[1]
    alpha = (item_count / (item_count - 1)) * (1 - (item_variances.sum() / total_variance))
    return round(float(alpha), 4)


def omega_total(matrix: np.ndarray) -> float | None:
    if matrix.ndim != 2 or matrix.shape[0] < 3 or matrix.shape[1] < 2:
        return None
    corr = np.corrcoef(matrix, rowvar=False)
    if np.isnan(corr).any():
        return None

    eigenvalues, eigenvectors = np.linalg.eigh(corr)
    order = np.argsort(eigenvalues)[::-1]
    first_eigenvalue = float(eigenvalues[order[0]])
    first_vector = eigenvectors[:, order[0]]
    loadings = np.sqrt(max(first_eigenvalue, 0.0)) * first_vector
    uniqueness = 1 - np.square(loadings)
    denominator = (loadings.sum() ** 2) + uniqueness.sum()
    if denominator <= 0:
        return None
    omega = (loadings.sum() ** 2) / denominator
    return round(float(omega), 4)


def corrected_item_total_correlations(matrix: np.ndarray, item_ids: tuple[str, ...]) -> dict[str, float | None]:
    result: dict[str, float | None] = {}
    if matrix.ndim != 2 or matrix.shape[0] < 3 or matrix.shape[1] < 2:
        return {item_id: None for item_id in item_ids}

    for index, item_id in enumerate(item_ids):
        item_scores = matrix[:, index]
        rest = np.delete(matrix, index, axis=1).sum(axis=1)
        if np.std(item_scores) == 0 or np.std(rest) == 0:
            result[item_id] = None
            continue
        corr = np.corrcoef(item_scores, rest)[0, 1]
        result[item_id] = round(float(corr), 4)
    return result


def floor_ceiling_effects(values: list[float], minimum: int = 1, maximum: int = 5) -> dict[str, float | int]:
    if not values:
        return {"n": 0, "floor_pct": 0.0, "ceiling_pct": 0.0}
    n = len(values)
    floor_pct = sum(1 for value in values if value <= minimum) / n * 100
    ceiling_pct = sum(1 for value in values if value >= maximum) / n * 100
    return {
        "n": n,
        "floor_pct": round(floor_pct, 2),
        "ceiling_pct": round(ceiling_pct, 2),
    }


def pearson_correlation(values_a: list[float | None], values_b: list[float | None]) -> dict[str, float | int | None]:
    paired = [
        (float(a), float(b))
        for a, b in zip(values_a, values_b)
        if a is not None and b is not None
    ]
    if len(paired) < 3:
        return {"n": len(paired), "r": None}
    x = np.array([pair[0] for pair in paired], dtype=float)
    y = np.array([pair[1] for pair in paired], dtype=float)
    if np.std(x) == 0 or np.std(y) == 0:
        return {"n": len(paired), "r": None}
    r = np.corrcoef(x, y)[0, 1]
    return {"n": len(paired), "r": round(float(r), 4)}


def factor_check(matrix: np.ndarray, item_ids: tuple[str, ...], expected_components: int = 1) -> dict[str, Any]:
    if matrix.shape[0] < max(MIN_FACTOR_N, matrix.shape[1] * 3) or matrix.shape[1] < 2:
        return {
            "n_complete": int(matrix.shape[0]),
            "expected_components": expected_components,
            "status": "insufficient_data",
            "eigenvalues": [],
            "explained_variance_pct": [],
            "component_loadings": {},
        }

    standardized = (matrix - matrix.mean(axis=0)) / matrix.std(axis=0, ddof=1)
    corr = np.corrcoef(standardized, rowvar=False)
    eigenvalues, eigenvectors = np.linalg.eigh(corr)
    order = np.argsort(eigenvalues)[::-1]
    eigenvalues = eigenvalues[order]
    eigenvectors = eigenvectors[:, order]
    total = eigenvalues.sum()
    explained = [(float(value) / float(total)) * 100 for value in eigenvalues[:expected_components]]
    loadings: dict[str, list[float]] = {}

    for item_index, item_id in enumerate(item_ids):
        loadings[item_id] = [
            round(float(eigenvectors[item_index, component_index] * math.sqrt(max(eigenvalues[component_index], 0.0))), 4)
            for component_index in range(expected_components)
        ]

    return {
        "n_complete": int(matrix.shape[0]),
        "expected_components": expected_components,
        "status": "ok",
        "eigenvalues": [round(float(value), 4) for value in eigenvalues[: max(expected_components, 3)]],
        "explained_variance_pct": [round(value, 2) for value in explained],
        "component_loadings": loadings,
    }


def _values(rows: list[dict[str, Any]], key: str) -> list[float | None]:
    return [float(row[key]) if row.get(key) is not None else None for row in rows]


def summarize_reliability(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    summary: list[dict[str, Any]] = []

    for spec in SCALE_SPECS:
        matrix = _complete_case_matrix(rows, spec.item_ids)
        item_values = {
            item_id: [
                reverse_code_if_needed(item_id, row.get(item_id))
                for row in rows
                if row.get(item_id) is not None
            ]
            for item_id in spec.item_ids
        }
        summary.append(
            {
                "scale": spec.name,
                "notes": spec.notes,
                "n_complete": int(matrix.shape[0]),
                "item_count": len(spec.item_ids),
                "alpha": cronbach_alpha(matrix),
                "omega": omega_total(matrix),
                "item_total_correlations": corrected_item_total_correlations(matrix, spec.item_ids),
                "floor_ceiling": {
                    item_id: floor_ceiling_effects([float(v) for v in values if v is not None])
                    for item_id, values in item_values.items()
                },
                "status": "ok" if matrix.shape[0] >= MIN_RELIABILITY_N else "insufficient_data",
            }
        )

    return summary


def summarize_construct_validity(rows: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "sdt_vs_engagement": pearson_correlation(
            _values(rows, "sdt_total_score"),
            _values(rows, "engagement_score"),
        ),
        "sdt_vs_turnover_intention": pearson_correlation(
            _values(rows, "sdt_total_score"),
            _values(rows, "turnover_intention_score"),
        ),
        "sdt_vs_stay_intent": pearson_correlation(
            _values(rows, "sdt_total_score"),
            _values(rows, "stay_intent_score_norm"),
        ),
        "engagement_vs_turnover_intention": pearson_correlation(
            _values(rows, "engagement_score"),
            _values(rows, "turnover_intention_score"),
        ),
        "stay_intent_vs_turnover_intention": pearson_correlation(
            _values(rows, "stay_intent_score_norm"),
            _values(rows, "turnover_intention_score"),
        ),
        "retention_signal_vs_turnover_intention": pearson_correlation(
            _values(rows, "retention_signal_score"),
            _values(rows, "turnover_intention_score"),
        ),
        "retention_signal_vs_stay_intent": pearson_correlation(
            _values(rows, "retention_signal_score"),
            _values(rows, "stay_intent_score_norm"),
        ),
    }


def add_derived_scores(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    enriched: list[dict[str, Any]] = []
    for row in rows:
        updated = dict(row)

        sdt_values = [
            reverse_code_if_needed(item_id, row.get(item_id))
            for item_id in SDT_ITEM_IDS
        ]
        sdt_values = [value for value in sdt_values if value is not None]
        updated["sdt_total_score"] = round(scale_to_ten(mean(sdt_values)), 2) if sdt_values else None
        enriched.append(updated)
    return enriched


def factor_checks(rows: list[dict[str, Any]]) -> dict[str, Any]:
    results: dict[str, Any] = {}
    for spec in SCALE_SPECS:
        matrix = _complete_case_matrix(rows, spec.item_ids)
        results[spec.name] = factor_check(matrix, spec.item_ids, expected_components=spec.expected_components)
    return results


def aggregate_segments(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[tuple[str | None, str | None, str], list[dict[str, Any]]] = {}
    for row in rows:
        key = (row.get("campaign_id"), row.get("department"), row.get("role_level") or "onbekend")
        grouped.setdefault(key, []).append(row)

    aggregates: list[dict[str, Any]] = []
    for (campaign_id, department, role_level), group in grouped.items():
        def avg(key: str) -> float | None:
            values = [float(item[key]) for item in group if item.get(key) is not None]
            return round(sum(values) / len(values), 4) if values else None

        aggregates.append(
            {
                "campaign_id": campaign_id,
                "department": department,
                "role_level": role_level,
                "n": len(group),
                "avg_retention_signal": avg("retention_signal_score"),
                "avg_engagement": avg("engagement_score"),
                "avg_turnover_intention": avg("turnover_intention_score"),
                "avg_stay_intent": avg("stay_intent_score_norm"),
            }
        )
    return sorted(aggregates, key=lambda row: (row["campaign_id"] or "", -(row["n"] or 0), row["department"] or ""))


def run_validation_summary(rows: list[dict[str, Any]]) -> dict[str, Any]:
    enriched_rows = add_derived_scores(rows)
    return {
        "meta": {
            "n_responses": len(enriched_rows),
            "n_campaigns": len({row["campaign_id"] for row in enriched_rows}),
            "n_departments": len({row["department"] for row in enriched_rows if row.get("department")}),
            "codebook_items": len(RETENTION_CODEBOOK),
        },
        "reliability": summarize_reliability(enriched_rows),
        "construct_validity": summarize_construct_validity(enriched_rows),
        "factor_checks": factor_checks(enriched_rows),
        "segment_aggregates": aggregate_segments(enriched_rows),
    }


def export_codebook_json(target: Path) -> None:
    target.write_text(json.dumps(codebook_as_dicts(), ensure_ascii=False, indent=2), encoding="utf-8")


def _format_reliability_row(item: dict[str, Any]) -> str:
    return (
        f"| {item['scale']} | {item['n_complete']} | {item['item_count']} | "
        f"{item['alpha'] if item['alpha'] is not None else '-'} | "
        f"{item['omega'] if item['omega'] is not None else '-'} | "
        f"{item['status']} |"
    )


def render_markdown_report(summary: dict[str, Any]) -> str:
    lines: list[str] = []
    meta = summary["meta"]
    lines.append("# RetentieScan v1.1 Validatiesamenvatting")
    lines.append("")
    lines.append("## Meta")
    lines.append("")
    lines.append(f"- Responses: {meta['n_responses']}")
    lines.append(f"- Campagnes: {meta['n_campaigns']}")
    lines.append(f"- Afdelingen: {meta['n_departments']}")
    lines.append("")
    lines.append("## Betrouwbaarheid")
    lines.append("")
    lines.append("| Schaal | n compleet | Items | Alpha | Omega | Status |")
    lines.append("|---|---:|---:|---:|---:|---|")
    for item in summary["reliability"]:
        lines.append(_format_reliability_row(item))
    lines.append("")
    lines.append("## Constructvaliditeit")
    lines.append("")
    lines.append("| Relatie | n | r |")
    lines.append("|---|---:|---:|")
    for key, value in summary["construct_validity"].items():
        lines.append(f"| {key} | {value['n']} | {value['r'] if value['r'] is not None else '-'} |")
    lines.append("")
    lines.append("## Factorcontrole")
    lines.append("")
    for scale_name, result in summary["factor_checks"].items():
        lines.append(f"### {scale_name}")
        if result["status"] != "ok":
            lines.append("")
            lines.append(f"Onvoldoende complete cases voor factorcontrole (`n={result['n_complete']}`).")
            lines.append("")
            continue
        lines.append("")
        lines.append(f"- Complete cases: {result['n_complete']}")
        lines.append(f"- Verwachte componenten: {result['expected_components']}")
        lines.append(f"- Eigenvalues: {', '.join(str(value) for value in result['eigenvalues'])}")
        lines.append(
            f"- Verklaarde variantie (%): {', '.join(str(value) for value in result['explained_variance_pct'])}"
        )
        lines.append("")
    lines.append("## Pragmatische validatie")
    lines.append("")
    lines.append(
        "Deze run levert segmentaggregaties op voor latere koppeling aan uitstroom-, verzuim- of herhaalmeetdata. "
        "Er is in deze automatische run nog geen externe uitkomstvariabele gekoppeld."
    )
    lines.append("")
    return "\n".join(lines)
