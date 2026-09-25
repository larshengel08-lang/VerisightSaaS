"""DATABASE_URL-vormen uit een dashboard mogen de service niet laten crashen (25-9)."""

from backend.database import normalize_database_url


def test_psycopg3_vorm_wordt_psycopg2():
    assert normalize_database_url("postgresql+psycopg://u:p@h:5432/db") == "postgresql://u:p@h:5432/db"


def test_postgres_vorm_wordt_postgresql():
    assert normalize_database_url("postgres://u:p@h:5432/db") == "postgresql://u:p@h:5432/db"


def test_gangbare_vormen_blijven_gelijk():
    for url in (
        "postgresql://u:p@h:5432/db",
        "postgresql+psycopg2://u:p@h:5432/db",
        "sqlite:///data/Loep.db",
    ):
        assert normalize_database_url(url) == url
