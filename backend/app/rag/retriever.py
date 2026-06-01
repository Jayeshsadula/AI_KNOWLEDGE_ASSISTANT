import logging
from typing import List, Optional
from app.services.embedding_service import query_similar

logger = logging.getLogger(__name__)

def retrieve(query: str, doc_ids: Optional[List[str]] = None, top_k: int = 5) -> List[dict]:
    try:
        results = query_similar(query, doc_ids=doc_ids, top_k=top_k)
        return [r for r in results if r["score"] > 0.2]
    except Exception as exc:
        logger.error("Retrieval failed: %s", exc)
        return []
