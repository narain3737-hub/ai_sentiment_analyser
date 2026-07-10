from __future__ import annotations

import os
import traceback
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

import httpx

from app.utils.file_logger import get_backend_logger


logger = get_backend_logger("incident.reporter")

# Replace this placeholder with your real incident collector URL later.
DEFAULT_INCIDENT_ENDPOINT = "https://kinetic-hardiness-outsource.ngrok-free.dev/api/incidents/collect"
INCIDENT_ENDPOINT = os.getenv("INCIDENT_ENDPOINT", DEFAULT_INCIDENT_ENDPOINT)
INCIDENT_API_KEY = os.getenv("INCIDENT_API_KEY", "36c89c1f-2592-4b19-836a-d26ba8930567")
PROJECT_NAME = os.getenv("PROJECT_NAME", "AI Feedback Sentiment Analyzer")
APP_ENVIRONMENT = os.getenv("APP_ENVIRONMENT", os.getenv("ENVIRONMENT", "development"))

VALID_SEVERITIES = {"CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG", "TRACE"}
SENSITIVE_KEYS = {
    "password",
    "secret",
    "secret_key",
    "token",
    "access_token",
    "refresh_token",
    "authorization",
    "cookie",
    "set-cookie",
    "api_key",
    "x-api-key",
}


def normalize_severity(severity: str | None) -> str:
    normalized = str(severity or "ERROR").upper()
    return normalized if normalized in VALID_SEVERITIES else "ERROR"


def now_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def build_stacktrace(exc: Exception | None) -> str:
    if not exc:
        return ""
    return "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))


def sanitize_metadata(metadata: dict[str, Any] | None) -> dict[str, Any]:
    cleaned: dict[str, Any] = {}

    for key, value in (metadata or {}).items():
        lowered = str(key).lower()
        if any(secret_key in lowered for secret_key in SENSITIVE_KEYS):
            cleaned[key] = "[REDACTED]"
        else:
            cleaned[key] = value

    return cleaned


def build_incident_payload(
    *,
    severity: str,
    title: str,
    error_type: str,
    error_code: str,
    error_message: str,
    url: str = "",
    method: str = "",
    module: str = "backend",
    component: str = "backend",
    function_name: str = "unknown",
    exc: Exception | None = None,
    correlation_id: str | None = None,
    request_id: str | None = None,
    user_id: str | None = None,
    session_id: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    correlation = correlation_id or request_id or str(uuid4())
    request_identifier = request_id or correlation

    return {
        "project_name": PROJECT_NAME,
        "environment": APP_ENVIRONMENT,
        "title": title,
        "service": "backend",
        "severity": normalize_severity(severity),
        "error_type": error_type,
        "error_code": error_code,
        "error_message": error_message,
        "timestamp": now_utc_iso(),
        "correlation_id": correlation,
        "request_id": request_identifier,
        "user_id": user_id or "",
        "session_id": session_id or "",
        "module": module,
        "component": component,
        "function_name": function_name,
        "url": url,
        "stacktrace": build_stacktrace(exc),
        "metadata": sanitize_metadata(
            {
                "source": "backend-monitoring",
                "method": method,
                "git_branch": os.getenv("GIT_BRANCH", "main"),
                "git_commit_sha": os.getenv("GIT_COMMIT_SHA", "unknown"),
                **(metadata or {}),
            }
        ),
    }


async def report_incident_async(payload: dict[str, Any]) -> None:
    try:
        headers = {
            "Content-Type": "application/json",
            "X-Incident-Source": "backend",
        }

        if INCIDENT_API_KEY:
            headers["X-API-Key"] = INCIDENT_API_KEY

        async with httpx.AsyncClient(timeout=httpx.Timeout(2.0, connect=1.0)) as client:
            response = await client.post(
                INCIDENT_ENDPOINT,
                headers=headers,
                json=payload,
            )
            print(f"Incident report sent with status code: {response.status_code}")

            if response.status_code >= 400:
                logger.error(
                    "Incident collector rejected backend payload with status=%s",
                    response.status_code,
                )
    except Exception as error:
        print(f"Failed to send backend incident: {error}")
        logger.error("Failed to send backend incident: %s", error)


def report_incident_sync(payload: dict[str, Any]) -> None:
    print(f"Reporting incident synchronously: {payload}")

    try:
        headers = {
            "Content-Type": "application/json",
            "X-Incident-Source": "backend",
        }

        if INCIDENT_API_KEY:
            headers["X-API-Key"] = INCIDENT_API_KEY

        with httpx.Client(timeout=httpx.Timeout(2.0, connect=1.0)) as client:
            response = client.post(
                INCIDENT_ENDPOINT,
                headers=headers,
                json=payload,
            )

            if response.status_code >= 400:
                logger.error(
                    "Incident collector rejected backend payload with status=%s",
                    response.status_code,
                )
    except Exception as error:
        logger.error("Failed to send backend incident: %s", error)
