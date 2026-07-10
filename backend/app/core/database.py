from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings
from app.utils.file_logger import get_backend_logger

logger = get_backend_logger("startup.database")

try:
    # SQLAlchemy engine with connection pooling
    engine = create_engine(
        settings.database_url,
        echo=False,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
    )
except Exception:
    logger.critical("Failed to create database engine from DATABASE_URL", exc_info=True)
    raise

# Session factory for creating database session instances
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base class for all ORM models
Base = declarative_base()

# Dependency injection function for FastAPI endpoints
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
