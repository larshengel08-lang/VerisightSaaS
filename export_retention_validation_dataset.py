from __future__ import annotations

import argparse
import csv
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
    parser = argparse.ArgumentParser(description="Export RetentieScan-validatiedataset en codeboek.")
    parser.add_argument("--db-path", help="Pad naar SQLite databasebestand. Overschrijft DATABASE_URL voor deze run.")
    parser.add_argument(
        "--dataset-origin",
        choices=["real", "synthetic", "dummy", "unknown"],
        help="Herkomst van de response-dataset. Laat leeg om deze alleen op naam te infereren.",
    )
    parser.add_argument(
        "--outdir",
        default="data/retention_validation_export",
        help="Doelmap voor CSV/JSON exportbestanden.",
    )
    args = parser.parse_args()

    root = _bootstrap_path()
    _configure_database_url(args.db_path)

    from analysis.retention.evidence import assess_validation_evidence, resolve_dataset_origin
    from analysis.retention.validation import aggregate_segments, export_codebook_json, extract_retention_rows
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

    response_path = outdir / "retention_validation_responses.csv"
    segment_path = outdir / "retention_validation_segments.csv"
    codebook_path = outdir / "retention_validation_codebook.json"
    meta_path = outdir / "retention_validation_meta.json"

    fieldnames = sorted({key for row in rows for key in row.keys()}) if rows else []
    with response_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)

    segments = aggregate_segments(rows)
    segment_fields = sorted({key for row in segments for key in row.keys()}) if segments else []
    with segment_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=segment_fields)
        writer.writeheader()
        for row in segments:
            writer.writerow(row)

    export_codebook_json(codebook_path)

    meta = {
        "db_path": str(Path(args.db_path).resolve()) if args.db_path else None,
        "dataset_origin": dataset_origin,
        "evidence": evidence,
        "n_rows": len(rows),
        "n_segments": len(segments),
        "response_export": str(response_path),
        "segment_export": str(segment_path),
        "codebook_export": str(codebook_path),
    }
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps(meta, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
