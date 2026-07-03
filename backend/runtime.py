from __future__ import annotations

import hmac
import logging
import os

from fastapi import HTTPException

logger = logging.getLogger(__name__)


def validate_runtime_config(*, is_production: bool) -> None:
    if not is_production:
        return

    required = [name for name in ("DATABASE_URL",) if not os.getenv(name)]
    if required:
        raise RuntimeError(
            "Productieconfig onvolledig. Ontbrekende environment variables: "
            + ", ".join(required)
        )

    optional_missing = [
        name for name in ("FRONTEND_URL", "BACKEND_URL", "RESEND_API_KEY")
        if not os.getenv(name)
    ]
    if optional_missing:
        logger.warning(
            "Productieconfig mist optionele environment variables: %s",
            ", ".join(optional_missing),
        )


def require_backend_admin_token(x_admin_token: str | None, *, is_production: bool) -> None:
    configured = os.getenv("BACKEND_ADMIN_TOKEN")
    if not configured:
        # Geen token geconfigureerd: buiten productie toegestaan (dev-gemak),
        # in productie een misconfiguratie die fail-closed moet zijn.
        if is_production:
            raise HTTPException(status_code=503, detail="Backend adminactie niet geconfigureerd.")
        return

    # Token geconfigureerd: altijd afdwingen, ongeacht environment (fail-closed).
    # Zo blijft auth actief zelfs als ENVIRONMENT ontbreekt/verkeerd gespeld is.
    if not x_admin_token or not hmac.compare_digest(x_admin_token, configured):
        raise HTTPException(status_code=403, detail="Admin-token ontbreekt of is ongeldig.")
