from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "UdaanSetu ML"
    VERSION: str = "2.0.0"
    
    DATABASE_URL: str = "postgresql://udaansetu:udaansetu@localhost:5432/udaansetu"
    MODEL_PATH: str = "/models"
    
    class Config:
        env_file = ".env"

settings = Settings()