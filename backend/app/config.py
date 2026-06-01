"""
Application configuration.

All settings are loaded from environment variables (via .env file).
Import the `settings` singleton anywhere in the app:

    from app.config import settings
    print(settings.mongo_uri)
"""

import os
from functools import lru_cache
from typing import List, Optional

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    # ── Firebase ────────────────────────────────────────────────────────────
    firebase_project_id:   Optional[str] = None
    firebase_private_key:  Optional[str] = None
    firebase_client_email: Optional[str] = None
    firebase_service_account_path: Optional[str] = None

    # ── MongoDB ─────────────────────────────────────────────────────────────
    mongo_uri:     str = "mongodb://localhost:27017"
    mongo_db_name: str = "ai_knowledge_assistant"

    # ── ChromaDB ────────────────────────────────────────────────────────────
    chroma_persist_path: str = "./chroma_db"

    # ── Ollama ──────────────────────────────────────────────────────────────
    ollama_base_url: str = "http://localhost:11434"
    ollama_model:    str = "llama3"

    # ── CORS ────────────────────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # ── App ─────────────────────────────────────────────────────────────────
    app_name:    str = "AI Knowledge Assistant"
    app_version: str = "1.0.0"
    debug:       bool = False

    @property
    def allowed_origins_list(self) -> List[str]:
        """Return ALLOWED_ORIGINS as a Python list."""
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the cached Settings singleton."""
    return Settings()


# Convenient module-level alias
settings = get_settings()