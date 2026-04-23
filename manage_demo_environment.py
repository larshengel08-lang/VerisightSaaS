from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

from backend.database import SessionLocal, init_db
from demo_environment import (
    DEMO_SCENARIOS,
    GUIDED_SELF_SERVE_ACCEPTANCE_CONTACT_EMAIL,
    GUIDED_SELF_SERVE_ACCEPTANCE_ORG_NAME,
    GUIDED_SELF_SERVE_ACCEPTANCE_ORG_SLUG,
    INTERNAL_SALES_DEMO_CONTACT_EMAIL,
    INTERNAL_SALES_DEMO_ORG_NAME,
    INTERNAL_SALES_DEMO_ORG_SLUG,
    QA_EXIT_ORG_NAME,
    QA_EXIT_ORG_SLUG,
    QA_RETENTION_ORG_SLUG,
    VALIDATION_RETENTION_DEFAULT_DB,
    VALIDATION_RETENTION_DEFAULT_OUTDIR,
    advance_guided_self_serve_acceptance,
    get_demo_layer_contracts,
    get_demo_scenarios,
    seed_guided_self_serve_acceptance,
    seed_sales_demo_exit,
    seed_sales_demo_retention,
)


ROOT = Path(__file__).resolve().parent


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Canonieke orchestrator voor Verisight demo- en sample-scenario's.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    list_parser = subparsers.add_parser("list", help="Toon de beschikbare demo-scenario's.")
    list_parser.add_argument("--format", choices=["table", "json"], default="table")

    run_parser = subparsers.add_parser("run", help="Voer een demo-scenario uit.")
    run_parser.add_argument("scenario", choices=sorted(DEMO_SCENARIOS.keys()))
    run_parser.add_argument("--python-executable", default=sys.executable)
    run_parser.add_argument("--org-slug", default=None)
    run_parser.add_argument("--org-name", default=None)
    run_parser.add_argument("--contact-email", default=None)
    run_parser.add_argument("--owner-email", default="lars@verisight.nl")
    run_parser.add_argument("--admin-user-id", default=None)
    run_parser.add_argument("--member-user-id", action="append", default=[])
    run_parser.add_argument("--viewer-user-id", action="append", default=[])
    run_parser.add_argument("--db-path", default=VALIDATION_RETENTION_DEFAULT_DB)
    run_parser.add_argument("--outdir", default=VALIDATION_RETENTION_DEFAULT_OUTDIR)
    run_parser.add_argument("--responses", type=int, default=72)

    advance_parser = subparsers.add_parser("advance", help="Schuif een deterministic QA-scenario door naar de volgende fase.")
    advance_parser.add_argument("scenario", choices=["qa_guided_self_serve_acceptance"])
    advance_parser.add_argument("--phase", choices=["min_display", "patterns"], required=True)
    advance_parser.add_argument("--org-slug", default=None)
    return parser.parse_args()


def _render_table() -> str:
    lines = [
        "Layers:",
    ]
    for layer in get_demo_layer_contracts():
        lines.append(f"- {layer.label}: {layer.intended_use}")

    lines.append("")
    lines.append("Scenarios:")
    for scenario in get_demo_scenarios():
        lines.append(
            f"- {scenario.key}: {scenario.label} | layer={scenario.layer} | org={scenario.org_slug or '-'} | "
            f"states={', '.join(scenario.expected_campaign_states)}"
        )
    return "\n".join(lines)


def _render_json() -> str:
    payload = {
        "layers": [layer.__dict__ for layer in get_demo_layer_contracts()],
        "scenarios": [scenario.__dict__ for scenario in get_demo_scenarios()],
    }
    return json.dumps(payload, ensure_ascii=False, indent=2)


def _run_subprocess(command: list[str]) -> int:
    completed = subprocess.run(command, cwd=ROOT)
    return completed.returncode


def _run_sales_demo_exit(args: argparse.Namespace) -> int:
    init_db()
    db = SessionLocal()
    try:
        result = seed_sales_demo_exit(
            db,
            org_slug=args.org_slug or INTERNAL_SALES_DEMO_ORG_SLUG,
            org_name=args.org_name or INTERNAL_SALES_DEMO_ORG_NAME,
            contact_email=args.contact_email or INTERNAL_SALES_DEMO_CONTACT_EMAIL,
        )
    finally:
        db.close()

    print(json.dumps({"scenario": "sales_demo_exit", **result}, ensure_ascii=False, indent=2))
    return 0


def _run_sales_demo_retention(args: argparse.Namespace) -> int:
    init_db()
    db = SessionLocal()
    try:
        result = seed_sales_demo_retention(
            db,
            org_slug=args.org_slug or INTERNAL_SALES_DEMO_ORG_SLUG,
            org_name=args.org_name or INTERNAL_SALES_DEMO_ORG_NAME,
            contact_email=args.contact_email or INTERNAL_SALES_DEMO_CONTACT_EMAIL,
        )
    finally:
        db.close()

    print(json.dumps({"scenario": "sales_demo_retention", **result}, ensure_ascii=False, indent=2))
    return 0


def _run_qa_exit_live_test(args: argparse.Namespace) -> int:
    command = [
        args.python_executable,
        "seed_exit_live_test_environment.py",
        "--org-slug",
        args.org_slug or QA_EXIT_ORG_SLUG,
        "--org-name",
        args.org_name or QA_EXIT_ORG_NAME,
        "--contact-email",
        args.contact_email or "qa@verisight.nl",
    ]
    if args.admin_user_id:
        command.extend(["--admin-user-id", args.admin_user_id])
    for user_id in args.member_user_id:
        command.extend(["--member-user-id", user_id])
    for user_id in args.viewer_user_id:
        command.extend(["--viewer-user-id", user_id])
    return _run_subprocess(command)


def _run_qa_retention_demo(args: argparse.Namespace) -> int:
    command = [
        args.python_executable,
        "seed_retention_demo_environment.py",
        "--org-slug",
        args.org_slug or QA_RETENTION_ORG_SLUG,
        "--owner-email",
        args.owner_email,
    ]
    return _run_subprocess(command)


def _run_qa_guided_self_serve_acceptance(args: argparse.Namespace) -> int:
    init_db()
    db = SessionLocal()
    try:
        result = seed_guided_self_serve_acceptance(
            db,
            org_slug=args.org_slug or GUIDED_SELF_SERVE_ACCEPTANCE_ORG_SLUG,
            org_name=args.org_name or GUIDED_SELF_SERVE_ACCEPTANCE_ORG_NAME,
            contact_email=args.contact_email or GUIDED_SELF_SERVE_ACCEPTANCE_CONTACT_EMAIL,
            member_user_id=(args.member_user_id[0] if args.member_user_id else None),
            viewer_user_id=(args.viewer_user_id[0] if args.viewer_user_id else None),
        )
    finally:
        db.close()

    print(json.dumps({"scenario": "qa_guided_self_serve_acceptance", **result}, ensure_ascii=False, indent=2))
    return 0


def _advance_qa_guided_self_serve_acceptance(args: argparse.Namespace) -> int:
    init_db()
    db = SessionLocal()
    try:
        result = advance_guided_self_serve_acceptance(
            db,
            phase=args.phase,
            org_slug=args.org_slug or GUIDED_SELF_SERVE_ACCEPTANCE_ORG_SLUG,
        )
    finally:
        db.close()

    print(json.dumps({"scenario": "qa_guided_self_serve_acceptance", **result}, ensure_ascii=False, indent=2))
    return 0


def _run_validation_retention_pilot(args: argparse.Namespace) -> int:
    command = [
        args.python_executable,
        "simulate_retention_validation_pilot.py",
        "--db-path",
        args.db_path,
        "--outdir",
        args.outdir,
        "--responses",
        str(args.responses),
    ]
    return _run_subprocess(command)


def main() -> None:
    args = _parse_args()

    if args.command == "list":
        print(_render_json() if args.format == "json" else _render_table())
        return

    if args.command == "advance":
        runners = {
            "qa_guided_self_serve_acceptance": _advance_qa_guided_self_serve_acceptance,
        }
        raise SystemExit(runners[args.scenario](args))

    runners = {
        "sales_demo_exit": _run_sales_demo_exit,
        "sales_demo_retention": _run_sales_demo_retention,
        "qa_exit_live_test": _run_qa_exit_live_test,
        "qa_guided_self_serve_acceptance": _run_qa_guided_self_serve_acceptance,
        "qa_retention_demo": _run_qa_retention_demo,
        "validation_retention_pilot": _run_validation_retention_pilot,
    }
    raise_code = runners[args.scenario](args)
    raise SystemExit(raise_code)


if __name__ == "__main__":
    main()
