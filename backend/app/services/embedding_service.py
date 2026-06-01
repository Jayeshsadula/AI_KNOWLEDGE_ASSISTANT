import logging
from typing import List, Optional
from sentence_transformers import SentenceTransformer
from app.database.chroma import get_collection
from app.utils.text_chunker import chunk_text

logger = logging.getLogger(__name__)
_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def embed_document(doc_id: str, text: str, filename: str) -> int:
    model = get_model()
    collection = get_collection()
    chunks = chunk_text(text)
    if not chunks:
        return 0
    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    embeddings = model.encode(chunks, show_progress_bar=False).tolist()
    metadatas = [{"doc_id": doc_id, "filename": filename, "chunk_index": i} for i in range(len(chunks))]
    collection.upsert(ids=ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)
    logger.info("Stored %d chunks for doc_id=%s", len(chunks), doc_id)
    return len(chunks)

def query_similar(query: str, doc_ids: Optional[List[str]] = None, top_k: int = 5) -> List[dict]:
    model = get_model()
    collection = get_collection()
    query_embedding = model.encode([query], show_progress_bar=False).tolist()[0]
    where = {"doc_id": {"$in": doc_ids}} if doc_ids else None
    results = collection.query(query_embeddings=[query_embedding], n_results=top_k, where=where, include=["documents", "metadatas", "distances"])
    output = []
    for text, meta, dist in zip(results["documents"][0], results["metadatas"][0], results["distances"][0]):
        output.append({"text": text, "doc_id": meta.get("doc_id"), "filename": meta.get("filename"), "score": round(1 - dist, 4)})
    return output

def delete_document_embeddings(doc_id: str) -> None:
    collection = get_collection()
    collection.delete(where={"doc_id": doc_id})
