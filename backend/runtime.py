from __future__ import annotations

import os

from fastapi import HTTPException


def validate_runtime_config(*, is_production: bool) -> None:
    if not is_production:
        return

    missing = [
        name for name in ("DATABASE_URL", "FRONTEND_URL", "BACKEND_URL", "RESEND_API_KEY")
        if not os.getenv(name)
    ]
    if missing:
        raise RuntimeError(
            "Productieconfig onvolledig. Ontbrekende environment variables: "
            + ", ".join(missing)
        )


def require_backend_admin_token(x_admin_token: str | None, *, is_production: bool) -> None:
    if not is_production:
        return

    configured = os.getenv("BACKEND_ADMIN_TOKEN")
    if not configured:
        raise HTTPException(status_code=503, detail="Backend adminactie niet geconfigureerd.")
    if x_admin_token != configured:
        raise HTTPException(status_code=403, detail="Admin-token ontbreekt of is ongeldig.")
