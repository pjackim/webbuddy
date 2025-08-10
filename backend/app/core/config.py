from typing import Optional

from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "preref-backend"
    ENV: str = "dev"

    # CORS
    CORS_ORIGINS: list[str] = ["*"]  # Override in prod

    # Base URL used to build public asset URLs (e.g., http://localhost:8000)
    PUBLIC_BASE_URL: Optional[AnyHttpUrl] = None

    # External screen-control service base URL + token
    SCREEN_SERVICE_URL: Optional[AnyHttpUrl] = None
    SCREEN_SERVICE_TOKEN: Optional[str] = None

    # Whether to actually call the external service (False = dry run)
    EXTERNAL_ENABLED: bool = False

    # Poll the external source of truth periodically (seconds). 0 to disable.
    POLL_INTERVAL_SEC: float = 0

    class Config:
        env_file = ".env"


settings = Settings()
