"""
ChromaDB client — persistent vector store for document embeddings.
"""

import logging
from functools import lru_cache

import chromadb
from chromadb import PersistentClient

from app.config import settings

logger = logging.getLogger(__name__)

COLLECTION_NAME = "documents"


@lru_cache(maxsize=1)
def get_chroma_client() -> PersistentClient:
    client = chromadb.PersistentClient(path=settings.chroma_persist_path)
    logger.info("ChromaDB initialised at: %s", settings.chroma_persist_path)
    return client


def get_collection():
    """Return (or create) the documents collection."""
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )