from __future__ import annotations

import json
import shutil
from pathlib import Path

import pytest

import manage_acceptance_environment as acceptance


def test_bootstrap_guided_self_serve_acceptance_local_writes_runtime_contract(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    runtime_dir = Path(acceptance.ROOT) / ".codex-artifacts" / "pytest-acceptance-runtime"
    shutil.rmtree(runtime_dir, ignore_errors=True)
    runtime_dir.mkdir(parents=True, exist_ok=True)
    runtime_file = runtime_dir / "guided-self-serve.json"

    monkeypatch.setattr(acceptance, "ACCEPTANCE_RUNTIME_DIR", runtime_dir)
    monkeypatch.setattr(acceptance, "GUIDED_SELF_SERVE_RUNTIME_PATH", runtime_file)
    monkeypatch.setattr(acceptance, "_ensure_local_prerequisites", lambda: None)
    monkeypatch.setattr(acceptance, "_start_local_supabase", lambda: None)
    monkeypatch.setattr(acceptance, "_is_tcp_port_available", lambda port, host="127.0.0.1": True)
    monkeypatch.setattr(
        acceptance,
        "_read_local_supabase_status_env",
        lambda: {
            "API_URL": "http://127.0.0.1:54321",
            "ANON_KEY": "anon-key",
            "SERVICE_ROLE_KEY": "service-role-key",
            "DB_URL": "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
        },
    )
    applied = []
    monkeypatch.setattr(acceptance, "_apply_schema", lambda database_url: applied.append(database_url))
    monkeypatch.setattr(
        acceptance,
        "_bootstrap_guided_self_serve_fixture",
        lambda env: acceptance.GuidedSelfServeFixture(
            email="guided-self-serve.acceptance@demo.verisight.local",
            password="Verisight!Acceptance123",
            setup_campaign_id="setup-campaign",
            threshold_campaign_id="threshold-campaign",
            user_id="user-1",
        ),
    )
    monkeypatch.setattr(
        acceptance,
        "_canonicalize_guided_self_serve_fixture",
        lambda fixture, database_url: fixture,
    )

    runtime = acceptance.bootstrap_guided_self_serve_acceptance(mode="local")

    assert runtime.mode == "local"
    assert runtime.fixture.setup_campaign_id == "setup-campaign"
    assert runtime.env["NEXT_PUBLIC_SUPABASE_URL"] == "http://127.0.0.1:54321"
    assert runtime.env["NEXT_PUBLIC_API_URL"] == "http://127.0.0.1:8000"
    assert runtime.env["DATABASE_URL"] == "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    assert runtime.env["VERISIGHT_ACCEPTANCE_FAKE_EMAIL"] == "1"
    assert applied == ["postgresql://postgres:postgres@127.0.0.1:54322/postgres"]

    stored = json.loads(runtime_file.read_text(encoding="utf-8"))
    assert stored["fixture"]["threshold_campaign_id"] == "threshold-campaign"
    assert stored["mode"] == "local"
    shutil.rmtree(runtime_dir, ignore_errors=True)


def test_read_local_supabase_status_env_strips_wrapping_quotes(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        acceptance,
        "_run_command",
        lambda *args, **kwargs: type(
            "Completed",
            (),
            {
                "stdout": 'API_URL="http://127.0.0.1:54321"\nANON_KEY="anon-key"\nSERVICE_ROLE_KEY="service-role-key"\nDB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"\n',
            },
        )(),
    )

    status_env = acceptance._read_local_supabase_status_env()

    assert status_env["API_URL"] == "http://127.0.0.1:54321"
    assert status_env["DB_URL"] == "postgresql://postgres:postgres@127.0.0.1:54322/postgres"


def test_load_schema_sql_strips_utf8_bom(monkeypatch: pytest.MonkeyPatch) -> None:
    class FakePath:
        def read_text(self, encoding: str = "utf-8") -> str:
            return "\ufeffcreate table demo ();"

    monkeypatch.setattr(acceptance, "SUPABASE_SCHEMA_PATH", FakePath())

    assert acceptance._load_schema_sql() == "create table demo ();"


def test_load_migration_sql_reads_sorted_sql_files(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    migrations_dir = tmp_path / "migrations"
    migrations_dir.mkdir()
    (migrations_dir / "2026_04_23.sql").write_text("select 23;", encoding="utf-8")
    (migrations_dir / "2026_04_12.sql").write_text("\ufeffselect 12;", encoding="utf-8")

    monkeypatch.setattr(acceptance, "MIGRATIONS_DIR", migrations_dir)

    assert acceptance._load_migration_sql() == ["select 12;", "select 23;"]


def test_canonicalize_guided_self_serve_fixture_uses_postgres_campaign_ids(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        acceptance,
        "_resolve_guided_self_serve_campaign_ids",
        lambda database_url: ("setup-from-db", "threshold-from-db"),
    )

    fixture = acceptance._canonicalize_guided_self_serve_fixture(
        acceptance.GuidedSelfServeFixture(
            email="guided-self-serve.acceptance@demo.verisight.local",
            password="Verisight!Acceptance123",
            setup_campaign_id="setup-from-bootstrap",
            threshold_campaign_id="threshold-from-bootstrap",
            user_id="user-1",
        ),
        database_url="postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    )

    assert fixture.setup_campaign_id == "setup-from-db"
    assert fixture.threshold_campaign_id == "threshold-from-db"
    assert fixture.user_id == "user-1"


def test_build_acceptance_env_remote_requires_all_keys(monkeypatch: pytest.MonkeyPatch) -> None:
    for key in (
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "DATABASE_URL",
    ):
        monkeypatch.delenv(key, raising=False)

    with pytest.raises(acceptance.AcceptanceEnvironmentError) as excinfo:
        acceptance.build_acceptance_env(mode="remote")

    assert "NEXT_PUBLIC_SUPABASE_URL" in str(excinfo.value)
    assert "DATABASE_URL" in str(excinfo.value)


def test_get_acceptance_frontend_runtime_prefers_explicit_override(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("VERISIGHT_ACCEPTANCE_FRONTEND_RUNTIME", "start")

    assert acceptance.get_acceptance_frontend_runtime("local") == "start"


def test_get_acceptance_frontend_runtime_defaults_to_local_dev(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("VERISIGHT_ACCEPTANCE_FRONTEND_RUNTIME", raising=False)

    assert acceptance.get_acceptance_frontend_runtime("local") == "start"
    assert acceptance.get_acceptance_frontend_runtime("remote") == "start"


def test_resolve_local_port_moves_to_next_free_candidate(monkeypatch: pytest.MonkeyPatch) -> None:
    availability = {
        3002: False,
        3003: False,
        3004: True,
    }
    monkeypatch.setattr(
        acceptance,
        "_is_tcp_port_available",
        lambda port, host="127.0.0.1": availability.get(port, False),
    )

    assert acceptance._resolve_local_port(3002) == 3004


def test_bootstrap_guided_self_serve_acceptance_moves_off_busy_local_ports(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    runtime_dir = Path(acceptance.ROOT) / ".codex-artifacts" / "pytest-acceptance-runtime-busy-ports"
    shutil.rmtree(runtime_dir, ignore_errors=True)
    runtime_dir.mkdir(parents=True, exist_ok=True)
    runtime_file = runtime_dir / "guided-self-serve.json"

    monkeypatch.setattr(acceptance, "ACCEPTANCE_RUNTIME_DIR", runtime_dir)
    monkeypatch.setattr(acceptance, "GUIDED_SELF_SERVE_RUNTIME_PATH", runtime_file)
    monkeypatch.setattr(acceptance, "_ensure_local_prerequisites", lambda: None)
    monkeypatch.setattr(acceptance, "_start_local_supabase", lambda: None)
    monkeypatch.setattr(acceptance, "_is_tcp_port_available", lambda port, host="127.0.0.1": True)
    monkeypatch.setattr(
        acceptance,
        "_read_local_supabase_status_env",
        lambda: {
            "API_URL": "http://127.0.0.1:54321",
            "ANON_KEY": "anon-key",
            "SERVICE_ROLE_KEY": "service-role-key",
            "DB_URL": "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
        },
    )
    monkeypatch.setattr(
        acceptance,
        "_is_tcp_port_available",
        lambda port, host="127.0.0.1": {3002: False, 3003: True, 8000: False, 8001: True}.get(port, True),
    )
    monkeypatch.setattr(acceptance, "_apply_schema", lambda database_url: None)
    monkeypatch.setattr(
        acceptance,
        "_bootstrap_guided_self_serve_fixture",
        lambda env: acceptance.GuidedSelfServeFixture(
            email="guided-self-serve.acceptance@demo.verisight.local",
            password="Verisight!Acceptance123",
            setup_campaign_id="setup-campaign",
            threshold_campaign_id="threshold-campaign",
            user_id="user-1",
        ),
    )
    monkeypatch.setattr(
        acceptance,
        "_canonicalize_guided_self_serve_fixture",
        lambda fixture, database_url: fixture,
    )

    runtime = acceptance.bootstrap_guided_self_serve_acceptance(mode="local")

    assert runtime.frontend_port == 3003
    assert runtime.backend_port == 8001
    assert runtime.env["FRONTEND_URL"] == "http://127.0.0.1:3003"
    assert runtime.env["NEXT_PUBLIC_API_URL"] == "http://127.0.0.1:8001"
    shutil.rmtree(runtime_dir, ignore_errors=True)


def test_advance_guided_self_serve_acceptance_uses_runtime_env(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, object] = {}
    monkeypatch.setattr(
        acceptance,
        "build_acceptance_env",
        lambda mode, frontend_port=3002, backend_port=8000: {"DATABASE_URL": "postgresql://db", "MODE": mode},
    )

    def fake_run_manage_demo(args: list[str], env: dict[str, str]) -> dict[str, object]:
        captured["args"] = args
        captured["env"] = env
        return {"phase": "patterns", "total_completed": 10}

    monkeypatch.setattr(acceptance, "_run_manage_demo", fake_run_manage_demo)

    result = acceptance.advance_guided_self_serve_acceptance("patterns", mode="local")

    assert result["phase"] == "patterns"
    assert captured["args"] == [
        "advance",
        "qa_guided_self_serve_acceptance",
        "--org-slug",
        acceptance.GUIDED_SELF_SERVE_ORG_SLUG,
        "--phase",
        "patterns",
    ]
    assert captured["env"] == {"DATABASE_URL": "postgresql://db", "MODE": "local"}


def test_run_guided_self_serve_acceptance_starts_backend_runs_playwright_and_cleans_up(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    runtime = acceptance.GuidedSelfServeAcceptanceRuntime(
        mode="local",
        profile="guided_self_serve",
        frontend_port=3002,
        backend_port=8000,
        env={"NEXT_PUBLIC_API_URL": "http://127.0.0.1:8000"},
        fixture=acceptance.GuidedSelfServeFixture(
            email="guided-self-serve.acceptance@demo.verisight.local",
            password="Verisight!Acceptance123",
            setup_campaign_id="setup-campaign",
            threshold_campaign_id="threshold-campaign",
            user_id="user-1",
        ),
    )
    events: list[str] = []

    class FakeProcess:
        def terminate(self) -> None:
            events.append("terminate")

        def wait(self, timeout: float | None = None) -> None:
            events.append("wait")

        def kill(self) -> None:
            events.append("kill")

    monkeypatch.setattr(acceptance, "bootstrap_guided_self_serve_acceptance", lambda mode="local": runtime)
    monkeypatch.setattr(
        acceptance,
        "_run_frontend_build_check",
        lambda env: events.append("build-frontend"),
    )
    monkeypatch.setattr(
        acceptance,
        "_start_backend_process",
        lambda env, backend_port=8000: events.append("start-backend") or FakeProcess(),
    )
    monkeypatch.setattr(
        acceptance,
        "_wait_for_health",
        lambda url, timeout_seconds=45.0, label="service": events.append(f"health:{label}:{url}"),
    )
    monkeypatch.setattr(
        acceptance,
        "_run_playwright_guided_self_serve",
        lambda env: events.append(f"run-playwright:{env['VERISIGHT_ACCEPTANCE_FRONTEND_PREBUILT']}"),
    )
    monkeypatch.setattr(
        acceptance,
        "teardown_acceptance_environment",
        lambda mode="local", reset_data=False: events.append(f"teardown:{mode}:{reset_data}"),
    )

    acceptance.run_guided_self_serve_acceptance(mode="local", teardown=True)

    assert events == [
        "build-frontend",
        "start-backend",
        "health:backend:http://127.0.0.1:8000/api/health",
        "run-playwright:1",
        "terminate",
        "wait",
        "teardown:local:False",
    ]
