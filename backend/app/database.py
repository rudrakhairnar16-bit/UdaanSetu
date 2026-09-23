import os
import tempfile
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

db_url = settings.database_url
if os.environ.get("VERCEL") and db_url.startswith("sqlite:///./"):
    tmp_db = os.path.join(tempfile.gettempdir(), "udaansetu.db")
    db_url = f"sqlite:///{tmp_db}"

if db_url.startswith("sqlite"):
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(db_url, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    pass
