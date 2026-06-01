import logging
from functools import lru_cache
from pymongo import MongoClient
from pymongo.database import Database
from app.config import settings

logger = logging.getLogger(__name__)

@lru_cache(maxsize=1)
def get_mongo_client() -> MongoClient:
    client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=5000)
    try:
        client.admin.command("ping")
        logger.info("MongoDB connected: %s", settings.mongo_uri)
    except Exception as exc:
        logger.warning("MongoDB ping failed: %s", exc)
    return client

def get_db() -> Database:
    return get_mongo_client()[settings.mongo_db_name]

def users_col():
    return get_db()["users"]

def documents_col():
    return get_db()["documents"]

def sessions_col():
    return get_db()["chat_sessions"]

def messages_col():
    return get_db()["messages"]
