from pydantic import ValidationError
from pydantic_settings import BaseSettings

from app.utils.file_logger import get_backend_logger

# Application settings loaded from environment variables
class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    app_name: str = "AI Customer Feedback Sentiment Analyzer"
    app_version: str = "1.0.0"

    # Load configuration from .env file
    class Config:
        env_file = ".env"
        extra = "ignore"

try:
    # Initialize global settings instance
    settings = Settings()
except ValidationError as exc:
    logger = get_backend_logger("startup.config")
    logger.critical("Invalid backend configuration: %s", exc, exc_info=True)
    raise
