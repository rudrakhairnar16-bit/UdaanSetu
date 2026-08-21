from pydantic_settings import BaseSettings
from typing import List
import secrets

class Settings(BaseSettings):
    PROJECT_NAME: str = "UdaanSetu"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = "postgresql://udaansetu:udaansetu@localhost:5432/udaansetu"
    
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12

    CORS_ORIGINS: List[str] = [
        "http://localhost:3001",
        "http://localhost:3000",
    ]

    # Government API settings
    AADHAAR_API_URL: str = ""
    AADHAAR_API_KEY: str = ""
    DIGILOCKER_API_URL: str = ""
    DIGILOCKER_API_KEY: str = ""
    STARTUP_INDIA_API_URL: str = ""
    STARTUP_INDIA_API_KEY: str = ""
    IP_INDIA_API_URL: str = ""
    IP_INDIA_API_KEY: str = ""
    ONDC_API_URL: str = ""
    ONDC_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()