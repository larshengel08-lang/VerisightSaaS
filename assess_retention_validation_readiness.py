from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path


def _bootstrap_path() -> Path:
    root = Path(__file__).resolve().parent
    sys.path.insert(0, str(root))
    return root


def _configure_database_url(db_path: str | None) -> None:
    if db_path:
        os.environ["DATABASE_URL"] = f"sqlite:///{Path(db_path).resolve()}"


def _render_markdown(readiness: dict) -> str:
    lines = [
        "# RetentieScan Validation Readiness",
        "",
        "## Evidence Boundary",
        "",
        f"- Dataset origin: {readiness['evidence']['responses_origin']}",
        f"- Counts as market evidence: {'yes' if readiness['evidence']['counts_as_market_evidence'] else 'no'}",
        f"- Counts as statistical validation: {'yes' if readiness['evidence']['counts_as_statistical_validation'] else 'no'}",
        f"- Counts as pragmatic validation: {'yes' if readiness['evidence']['counts_as_pragmatic_validation'] else 'no'}",
        "",
        f"{readiness['evidence']['summary']}",
        "",
    ]
    for warning in readiness["evidence"]["warnings"]:
        lines.append(f"- Warning: {warning}")
    lines.extend(
        [
            "",
        "## Dataset",
        "",
        f"- Responses: {readiness['dataset']['n_responses']}",
        f"- Campagnes: {readiness['dataset']['n_campaigns']}",
        f"- Afdelingen: {readiness['dataset']['n_departments']}",
        f"- Rolverdelingen: {readiness['dataset']['n_role_levels']}",
        "",
        "## Readiness",
        "",
        "| Stap | Status | Uitleg |",
        "|---|---|---|",
        ]
    )
    for item in readiness["checks"]:
        lines.append(f"| {item['step']} | {item['status']} | {item['message']} |")
    lines.extend(
        [
            "",
            "## Eerstvolgende acties",
            "",
        ]
    )
    for action in readiness["next_actions"]:
        lines.append(f"- {action}")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Beoordeel of RetentieScan-data klaar is voor v1.1-validatie.")
    parser.add_argument("--db-path", help="Pad naar SQLite databasebestand. Overschrijft DATABASE_URL voor deze run.")
    parser.add_argument(
        "--dataset-origin",
        choices=["real", "synthetic", "dummy", "unknown"],
        help="Herkomst van de response-dataset. Laat leeg om deze alleen op naam te infereren.",
    )
    parser.add_argument(
        "--outdir",
        default="data/retention_validation_readiness",
        help="Doelmap voor JSON/Markdown output.",
    )
    args = parser.parse_args()

    root = _bootstrap_path()
    _configure_database_url(args.db_path)

    from analysis.retention.evidence import assess_validation_evidence, resolve_dataset_origin
    from analysis.retention.validation import extract_retention_rows
    from backend.database import SessionLocal

    outdir = (root / args.outdir).resolve()
    outdir.mkdir(parents=True, exist_ok=True)
    dataset_origin = resolve_dataset_origin(args.dataset_origin, args.db_path, args.outdir)
    evidence = assess_validation_evidence(responses_origin=dataset_origin)

    db = SessionLocal()
    try:
        rows = extract_retention_rows(db)
    finally:
        db.close()

    n_responses = len(rows)
    n_campaigns = len({row["campaign_id"] for row in rows})
    n_departments = len({row["department"] for row in rows if row.get("department")})
    n_role_levels = len({row["role_level"] for row in rows if row.get("role_level")})

    checks = [
        {
            "step": "Betrouwbaarheid (alpha/omega)",
            "status": "ready" if n_responses >= 25 else "not_ready",
            "message": (
                f"Minimaal 25 complete RetentieScan-responses nodig; huidige dataset heeft {n_responses}."
            ),
        },
        {
            "step": "Factorcontrole",
            "status": "ready" if n_responses >= 40 else "not_ready",
            "message": (
                f"Minimaal 40 complete responses gewenst voor een eerste factorcontrole; huidige dataset heeft {n_responses}."
            ),
        },
        {
            "step": "Segmentvergelijkingen",
            "status": "ready" if n_departments >= 2 and n_role_levels >= 2 else "not_ready",
            "message": (
                f"Voor segmentvalidatie zijn meerdere afdelingen en functieniveaus nodig; nu {n_departments} afdelingen en {n_role_levels} role levels."
            ),
        },
        {
            "step": "Pragmatische validatie",
            "status": "blocked_without_external_outcomes",
            "message": (
                "Nog externe follow-up uitkomsten nodig, zoals uitstroom, verzuim of vervolgmeting op team-/segmentniveau."
            ),
        },
    ]

    next_actions: list[str] = []
    if n_responses < 25:
        next_actions.append("Verzamel minimaal 25 complete RetentieScan-responses voordat alpha/omega inhoudelijk wordt geïnterpreteerd.")
    if n_responses < 40:
        next_actions.append("Verzamel minimaal 40 complete RetentieScan-responses voor een eerste factorcontrole.")
    if n_departments < 2 or n_role_levels < 2:
        next_actions.append("Zorg bij respondentimport voor ingevulde department en role_level om segmentvalidatie mogelijk te maken.")
    next_actions.append("Leg follow-up uitkomsten vast in het outcomes-template voor latere pragmatische validatie.")
    if dataset_origin != "real":
        next_actions.append("Gebruik deze output niet als market evidence; verzamel en label eerst echte RetentieScan-data.")

    readiness = {
        "evidence": evidence,
        "dataset": {
            "n_responses": n_responses,
            "n_campaigns": n_campaigns,
            "n_departments": n_departments,
            "n_role_levels": n_role_levels,
        },
        "checks": checks,
        "next_actions": next_actions,
    }

    json_path = outdir / "retention_validation_readiness.json"
    md_path = outdir / "retention_validation_readiness.md"
    json_path.write_text(json.dumps(readiness, ensure_ascii=False, indent=2), encoding="utf-8")
    md_path.write_text(_render_markdown(readiness), encoding="utf-8")

    print(
        json.dumps(
            {
                "json": str(json_path),
                "markdown": str(md_path),
                "dataset_origin": dataset_origin,
                "dataset": readiness["dataset"],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
