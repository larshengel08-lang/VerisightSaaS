from __future__ import annotations

import argparse
import csv
import json
import os
import random
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path


def _bootstrap_path() -> Path:
    root = Path(__file__).resolve().parent
    sys.path.insert(0, str(root))
    return root


def _configure_database_url(db_path: Path) -> None:
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path.resolve()}"


def _write_csv(path: Path, header: list[str], rows: list[list[str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(header)
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="Doorloop de RetentieScan v1.1 workflow op dummydata.")
    parser.add_argument("--db-path", default="data/retention_pilot_dummy.db", help="Doel SQLite database.")
    parser.add_argument("--responses", type=int, default=72, help="Aantal dummy respondenten.")
    parser.add_argument(
        "--outdir",
        default="data/retention_pilot_dummy_run",
        help="Doelmap voor import, follow-up en validatie-output.",
    )
    parser.add_argument("--seed", type=int, default=42, help="Random seed.")
    args = parser.parse_args()

    random.seed(args.seed)
    root = _bootstrap_path()
    db_path = (root / args.db_path).resolve()
    outdir = (root / args.outdir).resolve()
    outdir.mkdir(parents=True, exist_ok=True)
    _configure_database_url(db_path)

    from analysis.retention.validation import add_derived_scores, aggregate_segments
    from backend.database import SessionLocal, init_db
    from backend.main import _build_import_preview, _create_campaign_respondents
    from backend.models import Campaign, Organization, OrganizationSecret, Respondent, SurveyResponse
    from backend.products.retention.scoring import score_submission
    from backend.report import generate_campaign_report
    from run_retention_validation import main as run_validation_main
    from assess_retention_validation_readiness import main as run_readiness_main
    from run_retention_pragmatic_validation import main as run_pragmatic_main

    class Payload:
        def __init__(self, sdt_raw, org_raw, uwes_raw, turnover_intention_raw, stay_intent_score):
            self.sdt_raw = sdt_raw
            self.org_raw = org_raw
            self.uwes_raw = uwes_raw
            self.turnover_intention_raw = turnover_intention_raw
            self.stay_intent_score = stay_intent_score
            self.tenure_years = None
            self.exit_reason_category = None
            self.exit_reason_code = None
            self.pull_factors_raw = {}
            self.open_text = None

    departments = ["Operations", "Sales", "People", "Finance"]
    role_levels = ["specialist", "senior", "manager"]

    def likert(base: float, bias: float = 0.0, reverse: bool = False) -> int:
        raw = max(1.0, min(5.0, base + bias + random.gauss(0, 0.5)))
        if reverse:
            raw = 6.0 - raw
        return int(round(raw))

    def sdt_items(base: float) -> dict[str, int]:
        return {
            "B1": likert(base),
            "B2": likert(base),
            "B3": likert(base),
            "B4": likert(base, reverse=True),
            "B5": likert(base + 0.1),
            "B6": likert(base + 0.1),
            "B7": likert(base + 0.1),
            "B8": likert(base + 0.1, reverse=True),
            "B9": likert(base + 0.05),
            "B10": likert(base + 0.05),
            "B11": likert(base + 0.05),
            "B12": likert(base + 0.05, reverse=True),
        }

    def org_items(signal_bias: float, work_bias: float) -> dict[str, int]:
        base = 3.2
        return {
            "leadership_1": likert(base + signal_bias),
            "leadership_2": likert(base + signal_bias),
            "leadership_3": likert(base + signal_bias),
            "culture_1": likert(base + signal_bias / 2),
            "culture_2": likert(base + signal_bias / 2),
            "culture_3": likert(base + signal_bias / 2),
            "growth_1": likert(base + signal_bias / 1.5),
            "growth_2": likert(base + signal_bias / 1.5),
            "growth_3": likert(base + signal_bias / 1.5),
            "compensation_1": likert(base + 0.05),
            "compensation_2": likert(base + 0.05),
            "compensation_3": likert(base),
            "workload_1": likert(base + work_bias),
            "workload_2": likert(base + work_bias),
            "workload_3": likert(base + work_bias),
            "role_clarity_1": likert(base + 0.1),
            "role_clarity_2": likert(base + 0.1),
            "role_clarity_3": likert(base + 0.1),
        }

    def uwes_items(base: float) -> dict[str, int]:
        return {
            "uwes_1": likert(base),
            "uwes_2": likert(base),
            "uwes_3": likert(base),
        }

    def turnover_items(base: float) -> dict[str, int]:
        return {
            "ti_1": likert(base),
            "ti_2": likert(base),
        }

    init_db()
    db = SessionLocal()
    try:
        org = Organization(
            name="RetentieScan Dummy Pilot",
            slug=f"retentie-pilot-{uuid.uuid4().hex[:8]}",
            contact_email="pilot@example.com",
        )
        db.add(org)
        db.flush()
        db.add(OrganizationSecret(org_id=org.id, api_key=f"pilot-{uuid.uuid4().hex[:12]}"))

        campaign = Campaign(
            organization_id=org.id,
            name="RetentieScan Dummy Baseline",
            scan_type="retention",
            delivery_mode="baseline",
            is_active=False,
            enabled_modules=["segment_deep_dive"],
        )
        db.add(campaign)
        db.commit()
        db.refresh(campaign)

        import_csv = outdir / "retention_dummy_respondents.csv"
        respondent_rows: list[list[str]] = []
        for index in range(args.responses):
            respondent_rows.append(
                [
                    f"dummy{index + 1}@voorbeeld.nl",
                    departments[index % len(departments)],
                    role_levels[index % len(role_levels)],
                ]
            )
        _write_csv(import_csv, ["email", "department", "role_level"], respondent_rows)

        with import_csv.open("r", newline="", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            raw_rows = [(row_number, dict(row)) for row_number, row in enumerate(reader, start=2)]

        normalized_rows, issues, preview_rows, duplicate_existing = _build_import_preview(
            raw_rows=raw_rows,
            existing_emails=set(),
        )
        if issues:
            raise RuntimeError(f"Import bevat onverwachte issues: {issues[:3]}")

        respondents, _ = _create_campaign_respondents(
            campaign=campaign,
            respondent_inputs=normalized_rows,
            db=db,
            send_invites=False,
        )

        for index, respondent in enumerate(respondents):
            signal_bias = 0.7 if index % 4 == 0 else (-0.4 if index % 4 == 1 else 0.1)
            work_bias = -0.7 if index % 5 == 0 else 0.2
            engagement_bias = 3.7 + signal_bias
            turnover_bias = 2.4 - signal_bias
            stay_raw = max(1, min(5, int(round(3.0 + signal_bias + random.gauss(0, 0.4)))))

            payload = Payload(
                sdt_raw=sdt_items(3.2 + signal_bias / 2),
                org_raw=org_items(signal_bias, work_bias),
                uwes_raw=uwes_items(engagement_bias),
                turnover_intention_raw=turnover_items(turnover_bias),
                stay_intent_score=stay_raw,
            )
            scored = score_submission(
                payload=payload,
                campaign=campaign,
                respondent=respondent,
                contributing_reason_codes=[],
            )

            respondent.completed = True
            respondent.completed_at = datetime.now(timezone.utc)
            db.add(
                SurveyResponse(
                    respondent_id=respondent.id,
                    stay_intent_score=payload.stay_intent_score,
                    sdt_raw=payload.sdt_raw,
                    sdt_scores=scored["sdt_scores"],
                    org_raw=payload.org_raw,
                    org_scores=scored["org_scores"],
                    pull_factors_raw={},
                    open_text_raw=None,
                    open_text_analysis=None,
                    uwes_raw=payload.uwes_raw,
                    uwes_score=scored["uwes_score"],
                    turnover_intention_raw=payload.turnover_intention_raw,
                    turnover_intention_score=scored["turnover_intention_score"],
                    risk_score=scored["risk_result"]["risk_score"],
                    risk_band=scored["risk_result"]["risk_band"],
                    preventability=None,
                    replacement_cost_eur=None,
                    full_result=scored["full_result"],
                    submitted_at=datetime.now(timezone.utc),
                    scoring_version=scored["scoring_version"],
                )
            )
        db.commit()

        pdf_path = outdir / "retention_dummy_baseline_report.pdf"
        pdf_path.write_bytes(generate_campaign_report(campaign.id, db))

        from analysis.retention.validation import extract_retention_rows

        rows = extract_retention_rows(db)
        segment_rows = aggregate_segments(add_derived_scores(rows))

        outcomes_csv = outdir / "retention_dummy_followup_outcomes.csv"
        outcome_rows: list[list[str]] = []
        for segment in segment_rows:
            retention_signal = float(segment["avg_retention_signal"] or 5.5)
            stay = float(segment["avg_stay_intent"] or 5.5)
            engagement = float(segment["avg_engagement"] or 5.5)
            attrition_pct = round(max(0.0, min(18.0, 1.2 + (retention_signal - 4.5) * 1.8 + random.uniform(-0.8, 0.8))), 2)
            sick_leave_pct = round(max(1.0, min(8.0, 2.0 + (retention_signal - 4.5) * 0.8 + random.uniform(-0.4, 0.4))), 2)
            followup_engagement = round(max(3.5, min(8.5, engagement - 0.6 + random.uniform(-0.3, 0.3))), 2)
            outcome_rows.append(
                [
                    str(segment["campaign_id"]),
                    str(segment["department"] or ""),
                    str(segment["role_level"] or ""),
                    "Q3-2026",
                    str(int(segment["n"])),
                    str(max(0, round((attrition_pct / 100) * int(segment["n"])))),
                    f"{attrition_pct:.2f}",
                    f"{sick_leave_pct:.2f}",
                    f"{followup_engagement:.2f}",
                    "2026-10-01",
                    f"Dummy follow-up voor stay-intent {stay:.2f}",
                ]
            )

        _write_csv(
            outcomes_csv,
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
            outcome_rows,
        )
    finally:
        db.close()

    previous_argv = sys.argv[:]
    try:
        sys.argv = [
            "run_retention_validation.py",
            "--db-path",
            str(db_path),
            "--dataset-origin",
            "dummy",
            "--outdir",
            str(outdir / "validation_report"),
        ]
        run_validation_main()

        sys.argv = [
            "assess_retention_validation_readiness.py",
            "--db-path",
            str(db_path),
            "--dataset-origin",
            "dummy",
            "--outdir",
            str(outdir / "readiness"),
        ]
        run_readiness_main()

        sys.argv = [
            "run_retention_pragmatic_validation.py",
            "--db-path",
            str(db_path),
            "--outcomes-csv",
            str(outcomes_csv),
            "--responses-origin",
            "dummy",
            "--outcomes-origin",
            "dummy",
            "--outdir",
            str(outdir / "pragmatic_validation"),
        ]
        run_pragmatic_main()
    finally:
        sys.argv = previous_argv

    summary = {
        "db_path": str(db_path),
        "respondent_import_csv": str(import_csv),
        "responses_created": args.responses,
        "preview_rows": len(preview_rows),
        "duplicate_existing": duplicate_existing,
        "baseline_report_pdf": str(pdf_path),
        "followup_outcomes_csv": str(outcomes_csv),
        "validation_report_dir": str(outdir / "validation_report"),
        "readiness_dir": str(outdir / "readiness"),
        "pragmatic_validation_dir": str(outdir / "pragmatic_validation"),
    }

    summary_path = outdir / "retention_dummy_pilot_summary.json"
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
