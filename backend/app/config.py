import secrets
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://udaansetu:udaansetu@db:5432/udaansetu"
    secret_key: str = "dev-only-change-me-in-production"
    ollama_enabled: bool = False
    ollama_url: str = "http://host.docker.internal:11434"
    ollama_model: str = "deepseek-r1:8b"
    max_upload_bytes: int = 10 * 1024 * 1024  # 10 MB
    rate_limit_per_minute: int = 120
    cors_origins: str = "http://localhost:3000,http://localhost:3001"
    jwt_expiry_hours: int = 12
    model_config = {"env_file": ".env", "extra": "ignore"}

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return not self.secret_key.startswith("dev-")


settings = Settings()
