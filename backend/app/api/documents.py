import logging
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from app.auth.dependencies import get_current_user
from app.database.mongo import documents_col
from app.models.auth_models import FirebaseUserClaims
from app.services.pdf_service import extract_text, save_upload, validate_pdf
from app.services.embedding_service import delete_document_embeddings, embed_document

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    user: FirebaseUserClaims = Depends(get_current_user),
):
    file_bytes = await file.read()
    filename = file.filename or "document.pdf"
    try:
        validate_pdf(filename, file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    try:
        doc_id, pdf_path = save_upload(file_bytes, filename)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Could not save file.")
    try:
        text, page_count = extract_text(pdf_path)
    except Exception as exc:
        raise HTTPException(status_code=422, detail="Could not extract text from PDF.")
    if not text.strip():
        raise HTTPException(status_code=422, detail="No text could be extracted from PDF.")
    try:
        chunk_count = embed_document(doc_id, text, filename)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Could not index document.")
    now = datetime.utcnow()
    doc_record = {
        "_id": doc_id, "id": doc_id, "user_id": user.uid,
        "filename": filename, "upload_date": now,
        "size": len(file_bytes), "pages": page_count, "chunks": chunk_count,
    }
    try:
        documents_col().insert_one(doc_record)
    except Exception as exc:
        logger.warning("MongoDB insert failed: %s", exc)
    return {
        "id": doc_id, "filename": filename,
        "upload_date": now.isoformat(),
        "pages": page_count, "chunks": chunk_count,
        "message": "Document uploaded and indexed successfully."
    }

@router.get("", response_model=List[dict])
async def list_documents(user: FirebaseUserClaims = Depends(get_current_user)):
    try:
        docs = list(documents_col().find({"user_id": user.uid}, {"_id": 0}).sort("upload_date", -1))
        for doc in docs:
            if "upload_date" in doc:
                doc["upload_date"] = doc["upload_date"].isoformat()
        return docs
    except Exception as exc:
        logger.error("MongoDB query failed: %s", exc)
        raise HTTPException(status_code=500, detail="Could not retrieve documents.")

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, user: FirebaseUserClaims = Depends(get_current_user)):
    doc = documents_col().find_one({"id": doc_id, "user_id": user.uid})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    try:
        delete_document_embeddings(doc_id)
    except Exception as exc:
        logger.warning("Could not delete embeddings: %s", exc)
    documents_col().delete_one({"id": doc_id})
    return {"message": "Document deleted successfully.", "id": doc_id}
