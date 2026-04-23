from __future__ import annotations

import argparse
import json
import os
import shlex
import shutil
import subprocess
import sys
import time
import urllib.request
from dataclasses import asdict, dataclass
from pathlib import Path

import psycopg2


ROOT = Path(__file__).resolve().parent
FRONTEND_DIR = ROOT / "frontend"
SUPABASE_SCHEMA_PATH = ROOT / "supabase" / "schema.sql"
ACCEPTANCE_RUNTIME_DIR = ROOT / ".acceptance-runtime"
GUIDED_SELF_SERVE_RUNTIME_PATH = ACCEPTANCE_RUNTIME_DIR / "guided-self-serve.json"
GUIDED_SELF_SERVE_BOOTSTRAP_SCRIPT = FRONTEND_DIR / "scripts" / "bootstrap-guided-self-serve-acceptance.mjs"

DEFAULT_FRONTEND_PORT = 3002
DEFAULT_BACKEND_PORT = 8000
GUIDED_SELF_SERVE_ORG_SLUG = "guided-self-serve-acceptance"
GUIDED_SELF_SERVE_EMAIL = "guided-self-serve.acceptance@demo.verisight.local"
GUIDED_SELF_SERVE_PASSWORD = "Verisight!Acceptance123"
LOCAL_FRONTEND_RUNTIME = "dev"
DEFAULT_FRONTEND_RUNTIME = "start"


class AcceptanceEnvironmentError(RuntimeError):
    pass


@dataclass(slots=True)
class GuidedSelfServeFixture:
    email: str
    password: str
    setup_campaign_id: str
    threshold_campaign_id: str
    user_id: str


@dataclass(slots=True)
class GuidedSelfServeAcceptanceRuntime:
    mode: str
    profile: str
    frontend_port: int
    backend_port: int
    env: dict[str, str]
    fixture: GuidedSelfServeFixture


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Autonome acceptance-runner voor guided self-serve.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    bootstrap_parser = subparsers.add_parser("bootstrap", help="Bootstrap guided self-serve acceptance lokaal of remote.")
    bootstrap_parser.add_argument("--profile", choices=["guided_self_serve"], default="guided_self_serve")
    bootstrap_parser.add_argument("--mode", choices=["local", "remote"], default=os.getenv("VERISIGHT_ACCEPTANCE_MODE", "local"))
    bootstrap_parser.add_argument("--frontend-port", type=int, default=DEFAULT_FRONTEND_PORT)
    bootstrap_parser.add_argument("--backend-port", type=int, default=DEFAULT_BACKEND_PORT)

    run_parser = subparsers.add_parser("run-guided-self-serve", help="Bootstrap, start backend en draai de Playwright acceptance-flow.")
    run_parser.add_argument("--mode", choices=["local", "remote"], default=os.getenv("VERISIGHT_ACCEPTANCE_MODE", "local"))
    run_parser.add_argument("--teardown", action="store_true")

    advance_parser = subparsers.add_parser("advance", help="Schuif de guided self-serve threshold-journey door.")
    advance_parser.add_argument("--mode", choices=["local", "remote"], default=os.getenv("VERISIGHT_ACCEPTANCE_MODE", "local"))
    advance_parser.add_argument("--phase", choices=["min_display", "patterns"], required=True)

    teardown_parser = subparsers.add_parser("teardown", help="Stop lokale acceptance-infra en verwijder runtime-contracten.")
    teardown_parser.add_argument("--mode", choices=["local", "remote"], default=os.getenv("VERISIGHT_ACCEPTANCE_MODE", "local"))
    teardown_parser.add_argument("--reset-data", action="store_true")

    return parser.parse_args()


def _command_path(name: str) -> str | None:
    return shutil.which(name)


def _get_supabase_cli_command() -> list[str]:
    configured = os.getenv("SUPABASE_CLI_BIN")
    if configured:
        return shlex.split(configured, posix=os.name != "nt")

    supabase_bin = _command_path("supabase")
    if supabase_bin:
        return [supabase_bin]

    npx_cmd = _command_path("npx.cmd" if os.name == "nt" else "npx")
    if npx_cmd:
        return [npx_cmd, "supabase"]

    raise AcceptanceEnvironmentError(
        "Supabase CLI ontbreekt. Installeer de CLI of zet SUPABASE_CLI_BIN expliciet voor acceptance-bootstrap."
    )


def _get_npm_command() -> str:
    npm_cmd = _command_path("npm.cmd" if os.name == "nt" else "npm")
    if not npm_cmd:
        raise AcceptanceEnvironmentError("npm ontbreekt. Frontend acceptance kan niet worden gestart.")
    return npm_cmd


def _get_node_command() -> str:
    node_cmd = _command_path("node.exe" if os.name == "nt" else "node")
    if not node_cmd:
        raise AcceptanceEnvironmentError("Node.js ontbreekt. De acceptance-bootstrap kan de Supabase helper niet starten.")
    return node_cmd


def _get_python_command() -> str:
    configured = os.getenv("PLAYWRIGHT_PYTHON_EXECUTABLE")
    if configured:
        return configured

    venv_python = ROOT / ".venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    if venv_python.exists():
        return str(venv_python)

    return sys.executable


def get_acceptance_frontend_runtime(mode: str) -> str:
    configured = os.getenv("VERISIGHT_ACCEPTANCE_FRONTEND_RUNTIME", "").strip().lower()
    if configured in {"dev", "start"}:
        return configured
    if mode == "local":
        return LOCAL_FRONTEND_RUNTIME
    return DEFAULT_FRONTEND_RUNTIME


def _run_command(
    args: list[str],
    *,
    cwd: Path = ROOT,
    env: dict[str, str] | None = None,
    capture_output: bool = True,
) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(
            args,
            cwd=str(cwd),
            env=env,
            check=True,
            capture_output=capture_output,
            text=True,
            errors="replace",
        )
    except subprocess.CalledProcessError as exc:
        output = (exc.stdout or "").strip()
        error = (exc.stderr or "").strip()
        detail = "\n".join(part for part in (output, error) if part)
        message = f"Commando mislukt: {' '.join(args)}"
        if detail:
            message += f"\n{detail}"
        raise AcceptanceEnvironmentError(message) from exc


def _ensure_local_prerequisites() -> None:
    docker_cmd = _command_path("docker.exe" if os.name == "nt" else "docker")
    if not docker_cmd:
        raise AcceptanceEnvironmentError(
            "Docker ontbreekt. Installeer Docker Desktop en probeer daarna opnieuw."
        )
    _run_command([docker_cmd, "--version"])
    _run_command([*_get_supabase_cli_command(), "--version"])


def _start_local_supabase() -> None:
    _run_command([*_get_supabase_cli_command(), "start"], capture_output=True)


def _read_local_supabase_status_env() -> dict[str, str]:
    completed = _run_command([*_get_supabase_cli_command(), "status", "-o", "env"])
    env_map: dict[str, str] = {}
    for raw_line in completed.stdout.splitlines():
        line = raw_line.strip()
        if not line or "=" not in line:
            continue
        key, value = line.split("=", 1)
        cleaned = value.strip()
        if len(cleaned) >= 2 and cleaned[0] == cleaned[-1] and cleaned[0] in {'"', "'"}:
            cleaned = cleaned[1:-1]
        env_map[key.strip()] = cleaned
    return env_map


def _build_local_acceptance_env(*, frontend_port: int, backend_port: int) -> dict[str, str]:
    _ensure_local_prerequisites()
    _start_local_supabase()
    status_env = _read_local_supabase_status_env()
    required = ["API_URL", "ANON_KEY", "SERVICE_ROLE_KEY", "DB_URL"]
    missing = [key for key in required if not status_env.get(key)]
    if missing:
        raise AcceptanceEnvironmentError(
            "Lokale Supabase-stack levert onvolledige status terug. Ontbreekt: " + ", ".join(missing)
        )

    return {
        **os.environ,
        "DATABASE_URL": status_env["DB_URL"],
        "FRONTEND_URL": f"http://127.0.0.1:{frontend_port}",
        "NEXT_PUBLIC_API_URL": f"http://127.0.0.1:{backend_port}",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY": status_env["ANON_KEY"],
        "NEXT_PUBLIC_SUPABASE_URL": status_env["API_URL"],
        "PLAYWRIGHT_GUIDED_SELF_SERVE_EMAIL": os.getenv("PLAYWRIGHT_GUIDED_SELF_SERVE_EMAIL", GUIDED_SELF_SERVE_EMAIL),
        "PLAYWRIGHT_GUIDED_SELF_SERVE_ORG_SLUG": os.getenv("PLAYWRIGHT_GUIDED_SELF_SERVE_ORG_SLUG", GUIDED_SELF_SERVE_ORG_SLUG),
        "PLAYWRIGHT_GUIDED_SELF_SERVE_PASSWORD": os.getenv("PLAYWRIGHT_GUIDED_SELF_SERVE_PASSWORD", GUIDED_SELF_SERVE_PASSWORD),
        "PLAYWRIGHT_PORT": str(frontend_port),
        "SUPABASE_SERVICE_ROLE_KEY": status_env["SERVICE_ROLE_KEY"],
        "SUPABASE_URL": status_env["API_URL"],
        "VERISIGHT_ACCEPTANCE_FAKE_EMAIL": "1",
        "VERISIGHT_ACCEPTANCE_FRONTEND_RUNTIME": get_acceptance_frontend_runtime("local"),
        "VERISIGHT_ACCEPTANCE_MODE": "local",
        "VERISIGHT_ACCEPTANCE_PROFILE": "guided_self_serve",
    }


def _build_remote_acceptance_env(*, frontend_port: int, backend_port: int) -> dict[str, str]:
    env = {
        **os.environ,
        "FRONTEND_URL": os.getenv("FRONTEND_URL", f"http://127.0.0.1:{frontend_port}"),
        "NEXT_PUBLIC_API_URL": os.getenv("NEXT_PUBLIC_API_URL", f"http://127.0.0.1:{backend_port}"),
        "PLAYWRIGHT_GUIDED_SELF_SERVE_EMAIL": os.getenv("PLAYWRIGHT_GUIDED_SELF_SERVE_EMAIL", GUIDED_SELF_SERVE_EMAIL),
        "PLAYWRIGHT_GUIDED_SELF_SERVE_ORG_SLUG": os.getenv("PLAYWRIGHT_GUIDED_SELF_SERVE_ORG_SLUG", GUIDED_SELF_SERVE_ORG_SLUG),
        "PLAYWRIGHT_GUIDED_SELF_SERVE_PASSWORD": os.getenv("PLAYWRIGHT_GUIDED_SELF_SERVE_PASSWORD", GUIDED_SELF_SERVE_PASSWORD),
        "PLAYWRIGHT_PORT": str(frontend_port),
        "SUPABASE_URL": os.getenv("SUPABASE_URL", os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")),
        "VERISIGHT_ACCEPTANCE_FRONTEND_RUNTIME": get_acceptance_frontend_runtime("remote"),
        "VERISIGHT_ACCEPTANCE_MODE": "remote",
        "VERISIGHT_ACCEPTANCE_PROFILE": "guided_self_serve",
    }
    required = [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "DATABASE_URL",
    ]
    missing = [key for key in required if not env.get(key)]
    if missing:
        raise AcceptanceEnvironmentError(
            "Remote acceptance-env mist verplichte variabelen: " + ", ".join(missing)
        )
    return env


def build_acceptance_env(
    mode: str,
    *,
    frontend_port: int = DEFAULT_FRONTEND_PORT,
    backend_port: int = DEFAULT_BACKEND_PORT,
) -> dict[str, str]:
    if mode == "remote":
        return _build_remote_acceptance_env(frontend_port=frontend_port, backend_port=backend_port)
    return _build_local_acceptance_env(frontend_port=frontend_port, backend_port=backend_port)


def _load_schema_sql() -> str:
    return SUPABASE_SCHEMA_PATH.read_text(encoding="utf-8").lstrip("\ufeff")


def _apply_schema(database_url: str) -> None:
    schema_sql = _load_schema_sql()
    connection = psycopg2.connect(database_url)
    try:
        connection.autocommit = True
        with connection.cursor() as cursor:
            cursor.execute(schema_sql)
    finally:
        connection.close()


def _bootstrap_guided_self_serve_fixture(env: dict[str, str]) -> GuidedSelfServeFixture:
    completed = _run_command(
        [_get_node_command(), str(GUIDED_SELF_SERVE_BOOTSTRAP_SCRIPT)],
        cwd=FRONTEND_DIR,
        env=env,
    )
    payload = json.loads(completed.stdout)
    return GuidedSelfServeFixture(
        email=payload["email"],
        password=payload["password"],
        setup_campaign_id=payload["setupCampaignId"],
        threshold_campaign_id=payload["thresholdCampaignId"],
        user_id=payload["userId"],
    )


def _write_runtime_contract(runtime: GuidedSelfServeAcceptanceRuntime) -> None:
    ACCEPTANCE_RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    GUIDED_SELF_SERVE_RUNTIME_PATH.write_text(
        json.dumps(asdict(runtime), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def bootstrap_guided_self_serve_acceptance(
    *,
    mode: str = "local",
    frontend_port: int = DEFAULT_FRONTEND_PORT,
    backend_port: int = DEFAULT_BACKEND_PORT,
) -> GuidedSelfServeAcceptanceRuntime:
    env = build_acceptance_env(mode, frontend_port=frontend_port, backend_port=backend_port)
    if mode == "local":
        _apply_schema(env["DATABASE_URL"])
    fixture = _bootstrap_guided_self_serve_fixture(env)
    runtime = GuidedSelfServeAcceptanceRuntime(
        mode=mode,
        profile="guided_self_serve",
        frontend_port=frontend_port,
        backend_port=backend_port,
        env=env,
        fixture=fixture,
    )
    _write_runtime_contract(runtime)
    return runtime


def _run_manage_demo(args: list[str], env: dict[str, str]) -> dict[str, object]:
    completed = _run_command(
        [_get_python_command(), "manage_demo_environment.py", *args],
        cwd=ROOT,
        env=env,
    )
    output = completed.stdout.strip() or completed.stderr.strip()
    if not output:
        raise AcceptanceEnvironmentError("manage_demo_environment.py gaf geen output terug.")
    return json.loads(output)


def advance_guided_self_serve_acceptance(phase: str, *, mode: str = "local") -> dict[str, object]:
    env = build_acceptance_env(mode)
    return _run_manage_demo(
        [
            "advance",
            "qa_guided_self_serve_acceptance",
            "--org-slug",
            GUIDED_SELF_SERVE_ORG_SLUG,
            "--phase",
            phase,
        ],
        env,
    )


def _wait_for_health(url: str, *, timeout_seconds: float = 45.0, label: str = "service") -> None:
    deadline = time.time() + timeout_seconds
    last_error: str | None = None
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=5) as response:
                if 200 <= response.status < 500:
                    return
        except Exception as exc:  # pragma: no cover - network timing path
            last_error = str(exc)
            time.sleep(1.0)
    raise AcceptanceEnvironmentError(
        f"{label} werd niet gezond binnen {timeout_seconds:.0f}s."
        + (f" Laatste fout: {last_error}" if last_error else "")
    )


def _start_backend_process(env: dict[str, str], *, backend_port: int = DEFAULT_BACKEND_PORT) -> subprocess.Popen[str]:
    return subprocess.Popen(
        [
            _get_python_command(),
            "-m",
            "uvicorn",
            "backend.main:app",
            "--host",
            "127.0.0.1",
            "--port",
            str(backend_port),
        ],
        cwd=str(ROOT),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )


def _stop_backend_process(process: subprocess.Popen[str]) -> None:
    process.terminate()
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:  # pragma: no cover - defensive path
        process.kill()
        process.wait(timeout=5)


def _run_playwright_guided_self_serve(env: dict[str, str]) -> None:
    _run_command(
        [_get_npm_command(), "run", "test:e2e", "--", "tests/e2e/guided-self-serve-acceptance.spec.ts"],
        cwd=FRONTEND_DIR,
        env=env,
        capture_output=False,
    )


def _run_frontend_build_check(env: dict[str, str]) -> None:
    _run_command(
        [_get_npm_command(), "run", "build"],
        cwd=FRONTEND_DIR,
        env=env,
        capture_output=False,
    )


def teardown_acceptance_environment(*, mode: str = "local", reset_data: bool = False) -> None:
    if GUIDED_SELF_SERVE_RUNTIME_PATH.exists():
        GUIDED_SELF_SERVE_RUNTIME_PATH.unlink()

    if mode == "local":
        command = [*_get_supabase_cli_command(), "stop"]
        if reset_data:
            command.append("--no-backup")
        _run_command(command, capture_output=True)


def run_guided_self_serve_acceptance(*, mode: str = "local", teardown: bool = False) -> GuidedSelfServeAcceptanceRuntime:
    runtime = bootstrap_guided_self_serve_acceptance(mode=mode)
    _run_frontend_build_check(runtime.env)
    backend_process = _start_backend_process(runtime.env, backend_port=runtime.backend_port)
    try:
        _wait_for_health(f"http://127.0.0.1:{runtime.backend_port}/api/health", label="backend")
        _run_playwright_guided_self_serve(runtime.env)
        return runtime
    finally:
        _stop_backend_process(backend_process)
        if teardown:
            teardown_acceptance_environment(mode=mode)


def main() -> None:
    args = _parse_args()

    try:
        if args.command == "bootstrap":
            runtime = bootstrap_guided_self_serve_acceptance(
                mode=args.mode,
                frontend_port=args.frontend_port,
                backend_port=args.backend_port,
            )
            print(json.dumps(asdict(runtime), ensure_ascii=False, indent=2))
            return

        if args.command == "run-guided-self-serve":
            runtime = run_guided_self_serve_acceptance(mode=args.mode, teardown=args.teardown)
            print(json.dumps(asdict(runtime), ensure_ascii=False, indent=2))
            return

        if args.command == "advance":
            print(json.dumps(advance_guided_self_serve_acceptance(args.phase, mode=args.mode), ensure_ascii=False, indent=2))
            return

        teardown_acceptance_environment(mode=args.mode, reset_data=args.reset_data)
        print(json.dumps({"status": "stopped", "mode": args.mode, "reset_data": args.reset_data}, ensure_ascii=False, indent=2))
    except AcceptanceEnvironmentError as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
