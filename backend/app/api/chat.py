"""
Chat API router.

Endpoints
---------
POST /api/chat                  — send a message, get RAG response
GET  /api/chat/history          — list all sessions for the user
GET  /api/chat/session/{id}     — get messages for a session
DELETE /api/chat/session/{id}   — delete a session
"""

import logging
import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.database.mongo import messages_col, sessions_col
from app.models.auth_models import FirebaseUserClaims
from app.models.chat_models import ChatRequest, ChatResponse, MessageOut, SessionOut
from app.rag.pipeline import run_rag_pipeline

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Chat"])


# ── POST /api/chat ────────────────────────────────────────────────────────────

@router.post("", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    user: FirebaseUserClaims = Depends(get_current_user),
):
    # Get or create session
    session_id = body.session_id
    is_new_session = False

    if not session_id:
        session_id = str(uuid.uuid4())
        is_new_session = True

    # Load conversation history
    history = []
    try:
        raw_messages = list(
            messages_col()
            .find({"session_id": session_id}, {"_id": 0})
            .sort("timestamp", 1)
            .limit(10)
        )
        history = [{"role": m["role"], "content": m["content"]} for m in raw_messages]
    except Exception as exc:
        logger.warning("Could not load history: %s", exc)

    # Run RAG pipeline
    try:
        result = run_rag_pipeline(
            question=body.message,
            doc_ids=body.document_ids,
            history=history,
        )
    except Exception as exc:
        logger.error("RAG pipeline error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate response: {str(exc)}",
        )

    now = datetime.utcnow()

    # Save user message
    user_msg_id = str(uuid.uuid4())
    try:
        messages_col().insert_one({
            "id":         user_msg_id,
            "session_id": session_id,
            "role":       "user",
            "content":    body.message,
            "timestamp":  now,
        })
    except Exception as exc:
        logger.warning("Could not save user message: %s", exc)

    # Save assistant message
    assistant_msg_id = str(uuid.uuid4())
    try:
        messages_col().insert_one({
            "id":         assistant_msg_id,
            "session_id": session_id,
            "role":       "assistant",
            "content":    result["answer"],
            "sources":    result["sources"],
            "timestamp":  now,
        })
    except Exception as exc:
        logger.warning("Could not save assistant message: %s", exc)

    # Create session record if new
    if is_new_session:
        title = body.message[:60] + "..." if len(body.message) > 60 else body.message
        try:
            sessions_col().insert_one({
                "id":         session_id,
                "user_id":    user.uid,
                "title":      title,
                "created_at": now,
            })
        except Exception as exc:
            logger.warning("Could not create session: %s", exc)

    return ChatResponse(
        message_id=assistant_msg_id,
        session_id=session_id,
        answer=result["answer"],
        sources=result["sources"],
        timestamp=now,
    )


# ── GET /api/chat/history ─────────────────────────────────────────────────────

@router.get("/history", response_model=List[SessionOut])
async def get_history(
    user: FirebaseUserClaims = Depends(get_current_user),
    limit: int = 20,
):
    try:
        sessions = list(
            sessions_col()
            .find({"user_id": user.uid}, {"_id": 0})
            .sort("created_at", -1)
            .limit(limit)
        )
        result = []
        for s in sessions:
            count = messages_col().count_documents({"session_id": s["id"]})
            result.append({
                "id":            s["id"],
                "title":         s.get("title", "Untitled"),
                "created_at":    s["created_at"],
                "message_count": count,
            })
        return result
    except Exception as exc:
        logger.error("Could not fetch sessions: %s", exc)
        raise HTTPException(status_code=500, detail="Could not retrieve chat history.")


# ── GET /api/chat/session/{id} ────────────────────────────────────────────────

@router.get("/session/{session_id}")
async def get_session(
    session_id: str,
    user: FirebaseUserClaims = Depends(get_current_user),
):
    # Verify ownership
    session = sessions_col().find_one({"id": session_id, "user_id": user.uid})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    messages = list(
        messages_col()
        .find({"session_id": session_id}, {"_id": 0})
        .sort("timestamp", 1)
    )

    # Convert datetime to isoformat
    for m in messages:
        if "timestamp" in m:
            m["timestamp"] = m["timestamp"].isoformat()

    return {
        "id":       session_id,
        "title":    session.get("title", "Untitled"),
        "messages": messages,
    }


# ── DELETE /api/chat/session/{id} ─────────────────────────────────────────────

@router.delete("/session/{session_id}")
async def delete_session(
    session_id: str,
    user: FirebaseUserClaims = Depends(get_current_user),
):
    session = sessions_col().find_one({"id": session_id, "user_id": user.uid})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    messages_col().delete_many({"session_id": session_id})
    sessions_col().delete_one({"id": session_id})

    return {"message": "Session deleted.", "id": session_id}