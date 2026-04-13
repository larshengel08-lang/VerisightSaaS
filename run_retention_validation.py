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


def main() -> None:
    parser = argparse.ArgumentParser(description="Draai de RetentieScan v1.1 validatiesamenvatting.")
    parser.add_argument("--db-path", help="Pad naar SQLite databasebestand. Overschrijft DATABASE_URL voor deze run.")
    parser.add_argument(
        "--outdir",
        default="data/retention_validation_report",
        help="Doelmap voor JSON/Markdown output.",
    )
    args = parser.parse_args()

    root = _bootstrap_path()
    _configure_database_url(args.db_path)

    from analysis.retention.validation import extract_retention_rows, render_markdown_report, run_validation_summary
    from backend.database import SessionLocal

    outdir = (root / args.outdir).resolve()
    outdir.mkdir(parents=True, exist_ok=True)

    db = SessionLocal()
    try:
        rows = extract_retention_rows(db)
    finally:
        db.close()

    summary = run_validation_summary(rows)
    json_path = outdir / "retention_validation_summary.json"
    md_path = outdir / "retention_validation_report.md"

    json_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    md_path.write_text(render_markdown_report(summary), encoding="utf-8")

    print(
        json.dumps(
            {
                "n_responses": summary["meta"]["n_responses"],
                "json": str(json_path),
                "markdown": str(md_path),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
