from __future__ import annotations

import argparse
import csv
from pathlib import Path


def _write_csv(path: Path, header: list[str], rows: list[list[str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(header)
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="Maak templates voor RetentieScan v1.1-validatie.")
    parser.add_argument(
        "--outdir",
        default="data/templates",
        help="Doelmap voor CSV templates.",
    )
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    outdir = (root / args.outdir).resolve()
    outdir.mkdir(parents=True, exist_ok=True)

    respondent_path = outdir / "retentionscan_respondent_import_template.csv"
    outcomes_path = outdir / "retentionscan_followup_outcomes_template.csv"

    _write_csv(
        respondent_path,
        ["email", "department", "role_level"],
        [
            ["medewerker1@voorbeeld.nl", "Operations", "specialist"],
            ["medewerker2@voorbeeld.nl", "People", "manager"],
        ],
    )

    _write_csv(
        outcomes_path,
        [
            "campaign_id",
            "department",
            "role_level",
            "period_label",
            "team_size",
            "voluntary_attrition_count",
            "voluntary_attrition_pct",
            "sick_leave_pct",
            "followup_engagement_score",
            "measurement_date",
            "notes",
        ],
        [
            ["campagne-id", "Operations", "specialist", "Q3-2026", "42", "3", "7.14", "4.20", "6.80", "2026-10-01", "Voorbeeldregel"],
            ["campagne-id", "People", "manager", "Q3-2026", "12", "0", "0.00", "2.10", "7.10", "2026-10-01", ""],
        ],
    )

    print(f"Gemaakt: {respondent_path}")
    print(f"Gemaakt: {outcomes_path}")


if __name__ == "__main__":
    main()
