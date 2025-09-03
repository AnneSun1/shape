import os
from functools import lru_cache
from dotenv import load_dotenv

# load environment variables from .env file (only in dev)
load_dotenv()

class Settings:
    database_url: str
    jwt_secret: str
    supabase_project_ref: str | None
    supabase_anon_key: str | None
    allowed_origins: list[str]

    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./test.db")
        self.jwt_secret = os.getenv("JWT_SECRET", "dev-secret-key-change-in-production")
        self.supabase_project_ref = os.getenv("SUPABASE_PROJECT_REF")
        self.supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
        self.allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
        
        # For development, use SQLite if no DATABASE_URL is set
        if not self.database_url or self.database_url == "":
            self.database_url = "sqlite:///./test.db"

@lru_cache
def get_settings() -> Settings:
    return Settings()
