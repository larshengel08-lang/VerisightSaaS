"""Elke Postgres-URL draait op psycopg2, de enige driver in het image (25-9, 4-10)."""

from backend.database import normalize_database_url


def test_postgresql_krijgt_expliciet_psycopg2():
    # SQLAlchemy 2.1 kiest anders psycopg 3, dat niet in het image zit.
    assert normalize_database_url("postgresql://u:p@h:5432/db") == "postgresql+psycopg2://u:p@h:5432/db"


def test_psycopg3_vorm_wordt_psycopg2():
    assert normalize_database_url("postgresql+psycopg://u:p@h:5432/db") == "postgresql+psycopg2://u:p@h:5432/db"


def test_postgres_vorm_wordt_psycopg2():
    assert normalize_database_url("postgres://u:p@h:5432/db") == "postgresql+psycopg2://u:p@h:5432/db"


def test_al_expliciete_en_sqlite_vormen_blijven_gelijk():
    for url in ("postgresql+psycopg2://u:p@h:5432/db", "sqlite:///data/Loep.db"):
        assert normalize_database_url(url) == url


def test_sqlalchemy_gepind_onder_21():
    from pathlib import Path
    tekst = Path(__file__).resolve().parent.parent.joinpath("requirements.txt").read_text(encoding="utf-8")
    assert "sqlalchemy>=2.0.0,<2.1" in tekst
