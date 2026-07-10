import logging
import time
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.database import Base, SessionLocal, engine
from app.routers.auth_router import router as auth_router
from app.routers.user_router import router as user_router
from app.routers.feedback_router import router as feedback_router
from app.routers.ai_router import router as ai_router
from app.routers.dashboard_router import router as dashboard_router
from app.routers.report_router import router as report_router
from app.utils.incident_reporter import build_incident_payload, report_incident_async, report_incident_sync
from app.utils.file_logger import get_backend_logger
from app.utils.seed import seed_roles_and_admin


# Initialize FastAPI application with API metadata
app = FastAPI(
    title="AI Customer Feedback Sentiment Analyzer API",
    description="FastAPI backend for feedback sentiment analysis, role-based access, reports, and user management.",
    version="1.0.0",
)

request_logger = get_backend_logger("request")
startup_logger = get_backend_logger("startup")
exception_logger = get_backend_logger("exceptions")

# Configure CORS middleware to allow requests from frontend on localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.perf_counter()
    request_id = request.headers.get("x-request-id") or str(uuid4())
    correlation_id = request.headers.get("x-correlation-id") or request_id

    request.state.request_id = request_id
    request.state.correlation_id = correlation_id

    request_logger.info("%s %s received", request.method, request.url.path)

    response = await call_next(request)

    duration_ms = (time.perf_counter() - start_time) * 1000
    request_logger.info(
        "%s %s completed with status=%s in %.2fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


# Initialize database with default roles and admin user
def seed_initial_data():
    db: Session = SessionLocal()

    try:
        seed_roles_and_admin(db)
    finally:
        db.close()


# Run seeding on application startup
@app.on_event("startup")
def on_startup():
    startup_logger.info("Application startup initiated")

    try:
        Base.metadata.create_all(bind=engine)
        startup_logger.info("Database tables verified or created successfully")

        seed_initial_data()
        startup_logger.info("Initial seed data completed successfully")

        startup_logger.info("Application startup completed successfully")
    except Exception as exc:
        startup_logger.critical("Critical startup failure", exc_info=True)
        payload = build_incident_payload(
            severity="CRITICAL",
            title="Backend startup failure",
            error_type=type(exc).__name__,
            error_code="BACKEND_STARTUP_FAILURE",
            error_message=str(exc),
            url="startup://backend",
            method="STARTUP",
            module="backend",
            component="startup",
            function_name="on_startup",
            exc=exc,
        )
        report_incident_sync(payload)
        raise


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    level = logging.WARNING if exc.status_code < 500 else logging.ERROR
    exception_logger.log(
        level,
        "%s %s failed with status=%s detail=%s",
        request.method,
        request.url.path,
        exc.status_code,
        exc.detail,
    )

    print(f"HTTPException occurred: {exc.status_code} - {exc.detail}")
    if exc.status_code >= 500:
        payload = build_incident_payload(
            severity="ERROR",
            title="Backend HTTP exception",
            error_type=type(exc).__name__,
            error_code=f"HTTP_{exc.status_code}",
            error_message=str(exc.detail),
            url=str(request.url),
            method=request.method,
            module="backend",
            component=request.url.path,
            function_name="http_exception_handler",
            exc=exc,
            correlation_id=getattr(request.state, "correlation_id", None),
            request_id=getattr(request.state, "request_id", None),
        )
        await report_incident_async(payload)

    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    exception_logger.warning(
        "%s %s request validation failed: %s",
        request.method,
        request.url.path,
        exc.errors(),
    )

    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    exception_logger.exception(
        "%s %s crashed with an unhandled exception",
        request.method,
        request.url.path,
    )
    print(f"Unhandled exception occurred: {exc}")
    exception_logger.error("Unhandled exception occurred: %s", exc)
    payload = build_incident_payload(
        severity="CRITICAL",
        title="Unhandled backend exception",
        error_type=type(exc).__name__,
        error_code="UNHANDLED_EXCEPTION",
        error_message=str(exc),
        url=str(request.url),
        method=request.method,
        module="backend",
        component=request.url.path,
        function_name="unhandled_exception_handler",
        exc=exc,
        correlation_id=getattr(request.state, "correlation_id", None),
        request_id=getattr(request.state, "request_id", None),
    )
    await report_incident_async(payload)

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Root endpoint showing API status
@app.get("/")
def root():
    return {
        "message": "AI Customer Feedback Sentiment Analyzer API is running",
        "docs": "/docs",
        "status": "healthy",
    }


# Health check endpoint for monitoring service availability
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Customer Feedback Sentiment Analyzer API",
    }


# Register all API route modules
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(feedback_router)
app.include_router(ai_router)
app.include_router(dashboard_router)
app.include_router(report_router)
