from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from pathlib import Path
from typing import Any


def _bootstrap_path() -> Path:
    root = Path(__file__).resolve().parent
    sys.path.insert(0, str(root))
    return root


def _configure_database_url(db_path: str | None) -> None:
    if db_path:
        os.environ["DATABASE_URL"] = f"sqlite:///{Path(db_path).resolve()}"


def _read_outcomes(path: Path) -> list[dict[str, Any]]:
    with path.open("r", newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        return [dict(row) for row in reader]


def _to_float(value: str | None) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(str(value).replace(",", "."))
    except ValueError:
        return None


def _render_markdown(summary: dict[str, Any]) -> str:
    lines = [
        "# RetentieScan pragmatische validatie",
        "",
        "## Evidence Boundary",
        "",
        f"- Responses origin: {summary['evidence']['responses_origin']}",
        f"- Outcomes origin: {summary['evidence']['outcomes_origin']}",
        f"- Counts as market evidence: {'yes' if summary['evidence']['counts_as_market_evidence'] else 'no'}",
        f"- Counts as statistical validation: {'yes' if summary['evidence']['counts_as_statistical_validation'] else 'no'}",
        f"- Counts as pragmatic validation: {'yes' if summary['evidence']['counts_as_pragmatic_validation'] else 'no'}",
        "",
        f"{summary['evidence']['summary']}",
        "",
    ]
    for warning in summary["evidence"]["warnings"]:
        lines.append(f"- Warning: {warning}")
    lines.extend(
        [
            "",
        "## Coverage",
        "",
        f"- Segmentaggregaties: {summary['coverage']['n_segments']}",
        f"- Follow-up rows: {summary['coverage']['n_outcomes_rows']}",
        f"- Gekoppelde rows: {summary['coverage']['n_joined_rows']}",
        "",
        "## Correlaties",
        "",
        "| Relatie | n | r |",
        "|---|---:|---:|",
        ]
    )
    for key, value in summary["correlations"].items():
        lines.append(f"| {key} | {value['n']} | {value['r'] if value['r'] is not None else '-'} |")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Koppel RetentieScan-segmenten aan follow-up uitkomsten.")
    parser.add_argument("--db-path", help="Pad naar SQLite databasebestand.")
    parser.add_argument("--outcomes-csv", required=True, help="Pad naar ingevuld follow-up outcomes CSV-bestand.")
    parser.add_argument(
        "--responses-origin",
        choices=["real", "synthetic", "dummy", "unknown"],
        help="Herkomst van de response-dataset. Laat leeg om deze alleen op naam te infereren.",
    )
    parser.add_argument(
        "--outcomes-origin",
        choices=["real", "synthetic", "dummy", "unknown"],
        help="Herkomst van de follow-up outcomes. Laat leeg om deze alleen op naam te infereren.",
    )
    parser.add_argument(
        "--outdir",
        default="data/retention_pragmatic_validation",
        help="Doelmap voor JSON/Markdown/CSV output.",
    )
    args = parser.parse_args()

    root = _bootstrap_path()
    _configure_database_url(args.db_path)

    from analysis.retention.evidence import assess_validation_evidence, resolve_dataset_origin
    from analysis.retention.validation import (
        add_derived_scores,
        aggregate_segments,
        extract_retention_rows,
        pearson_correlation,
    )
    from backend.database import SessionLocal

    outdir = (root / args.outdir).resolve()
    outdir.mkdir(parents=True, exist_ok=True)
    responses_origin = resolve_dataset_origin(args.responses_origin, args.db_path, args.outdir)
    outcomes_origin = resolve_dataset_origin(args.outcomes_origin, args.outcomes_csv)
    evidence = assess_validation_evidence(
        responses_origin=responses_origin,
        outcomes_origin=outcomes_origin,
    )

    db = SessionLocal()
    try:
        rows = extract_retention_rows(db)
    finally:
        db.close()

    segment_rows = aggregate_segments(add_derived_scores(rows))
    outcomes_rows = _read_outcomes(Path(args.outcomes_csv).resolve())

    outcome_lookup = {
        (
            row.get("campaign_id"),
            row.get("department"),
            row.get("role_level"),
        ): row
        for row in outcomes_rows
    }

    joined: list[dict[str, Any]] = []
    for segment in segment_rows:
        key = (segment.get("campaign_id"), segment.get("department"), segment.get("role_level"))
        outcome = outcome_lookup.get(key)
        if not outcome:
            continue
        joined.append(
            {
                **segment,
                "period_label": outcome.get("period_label"),
                "team_size": _to_float(outcome.get("team_size")),
                "voluntary_attrition_pct": _to_float(outcome.get("voluntary_attrition_pct")),
                "sick_leave_pct": _to_float(outcome.get("sick_leave_pct")),
                "followup_engagement_score": _to_float(outcome.get("followup_engagement_score")),
                "measurement_date": outcome.get("measurement_date"),
                "notes": outcome.get("notes"),
            }
        )

    correlations = {
        "retention_signal_vs_attrition_pct": pearson_correlation(
            [row.get("avg_retention_signal") for row in joined],
            [row.get("voluntary_attrition_pct") for row in joined],
        ),
        "retention_signal_vs_sick_leave_pct": pearson_correlation(
            [row.get("avg_retention_signal") for row in joined],
            [row.get("sick_leave_pct") for row in joined],
        ),
        "retention_signal_vs_followup_engagement": pearson_correlation(
            [row.get("avg_retention_signal") for row in joined],
            [row.get("followup_engagement_score") for row in joined],
        ),
        "stay_intent_vs_attrition_pct": pearson_correlation(
            [row.get("avg_stay_intent") for row in joined],
            [row.get("voluntary_attrition_pct") for row in joined],
        ),
    }

    summary = {
        "evidence": evidence,
        "coverage": {
            "n_segments": len(segment_rows),
            "n_outcomes_rows": len(outcomes_rows),
            "n_joined_rows": len(joined),
        },
        "correlations": correlations,
    }

    joined_csv = outdir / "retention_pragmatic_joined.csv"
    if joined:
        fieldnames = sorted({key for row in joined for key in row.keys()})
        with joined_csv.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=fieldnames)
            writer.writeheader()
            for row in joined:
                writer.writerow(row)

    json_path = outdir / "retention_pragmatic_validation.json"
    md_path = outdir / "retention_pragmatic_validation.md"
    json_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    md_path.write_text(_render_markdown(summary), encoding="utf-8")

    print(
        json.dumps(
            {
                "json": str(json_path),
                "markdown": str(md_path),
                "joined_csv": str(joined_csv),
                "responses_origin": responses_origin,
                "outcomes_origin": outcomes_origin,
                "coverage": summary["coverage"],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
