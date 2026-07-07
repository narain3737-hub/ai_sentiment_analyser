from pydantic_settings import BaseSettings

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

# Initialize global settings instance
settings = Settings()