"""
Verisight — Database Setup
=================================
SQLAlchemy engine + session factory.

Default: SQLite at data/Verisight.db  (file auto-created on first run)
Production: set DATABASE_URL env var to a PostgreSQL/Supabase connection string.

Pool strategy:
- SQLite  → StaticPool (single thread-safe connection, local dev)
- Postgres → NullPool   (no SQLAlchemy-side pooling; Supabase has pgbouncer)
  Using SQLAlchemy pool + Supabase pooler = double pooling → stale connections
  and circuit-breaker triggers. NullPool opens/closes per request which is
  safe and correct for Supabase Session mode on port 5432.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import NullPool, StaticPool

logger = logging.getLogger(__name__)

# Laad .env vanuit de project root (werkt altijd, ook zonder bat-script)
_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_ROOT / ".env")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

_DEFAULT_DB_PATH = _ROOT / "data" / "Verisight.db"
_DEFAULT_DB_PATH.parent.mkdir(parents=True, exist_ok=True)

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{_DEFAULT_DB_PATH}",
)

_IS_SQLITE = DATABASE_URL.startswith("sqlite")

if _IS_SQLITE:
    # SQLite: single static connection, thread-safe for FastAPI dev
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
else:
    # PostgreSQL / Supabase:
    # - NullPool → geen SQLAlchemy pool; elke request opent/sluit z'n eigen
    #   verbinding via Supabase's pgbouncer (Session mode, port 5432).
    # - pool_pre_ping niet nodig bij NullPool (verbinding is altijd vers).
    # - connect_timeout=10 → snelle fout ipv lang hangen bij netwerkproblemen.
    engine = create_engine(
        DATABASE_URL,
        poolclass=NullPool,
        connect_args={"connect_timeout": 10},
        echo=False,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ---------------------------------------------------------------------------
# Base class for all ORM models
# ---------------------------------------------------------------------------

class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# Dependency for FastAPI routes
# ---------------------------------------------------------------------------

def get_db():
    """FastAPI dependency: yields a DB session, closes it afterwards."""
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Health check helper
# ---------------------------------------------------------------------------

def check_db_connection() -> bool:
    """Probe the database with a lightweight query. Returns True if healthy."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.warning("DB health check failed: %s", exc)
        return False


# ---------------------------------------------------------------------------
# Init helper (called once at startup)
# ---------------------------------------------------------------------------

def init_db() -> None:
    """Create all tables if they don't exist yet. Idempotent."""
    # Import models so SQLAlchemy knows about them before create_all
    from backend import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
