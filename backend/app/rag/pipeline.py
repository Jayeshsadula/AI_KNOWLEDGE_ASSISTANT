import logging
from typing import List, Optional
from app.rag.retriever import retrieve
from app.rag.prompt_builder import build_prompt
from app.services.ollama_service import generate

logger = logging.getLogger(__name__)

def run_rag_pipeline(
    question: str,
    doc_ids: Optional[List[str]] = None,
    history: list = [],
    top_k: int = 5,
) -> dict:
    logger.info("RAG pipeline started for question: %s", question[:80])
    chunks = retrieve(question, doc_ids=doc_ids, top_k=top_k)
    system_prompt, user_prompt = build_prompt(question, chunks, history)
    try:
        answer = generate(user_prompt, system=system_prompt)
    except RuntimeError as exc:
        answer = str(exc)
        chunks = []
    seen = set()
    sources = []
    for chunk in chunks:
        key = (chunk.get("filename"), chunk["text"][:50])
        if key not in seen:
            seen.add(key)
            sources.append({
                "filename": chunk.get("filename", "Unknown"),
                "text": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"],
                "score": chunk.get("score", 0.0),
            })
    return {"answer": answer, "sources": sources}
