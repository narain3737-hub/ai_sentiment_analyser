from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.database import Base, engine, SessionLocal
from app.routers.auth_router import router as auth_router
from app.routers.user_router import router as user_router
from app.routers.feedback_router import router as feedback_router
from app.routers.ai_router import router as ai_router
from app.routers.dashboard_router import router as dashboard_router
from app.routers.report_router import router as report_router
from app.utils.seed import seed_roles_and_admin


# Initialize FastAPI application with API metadata
app = FastAPI(
    title="AI Customer Feedback Sentiment Analyzer API",
    description="FastAPI backend for feedback sentiment analysis, role-based access, reports, and user management.",
    version="1.0.0",
)

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


# Create all database tables if they don't exist
Base.metadata.create_all(bind=engine)


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
    seed_initial_data()


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