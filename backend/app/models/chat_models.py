"""Pydantic schemas for the chat module."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    document_ids: Optional[List[str]] = None


class SourceReference(BaseModel):
    filename: str
    text: str
    score: float


class ChatResponse(BaseModel):
    message_id: str
    session_id: str
    answer: str
    sources: List[SourceReference] = []
    timestamp: datetime

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime
    sources: Optional[List[SourceReference]] = []

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class SessionOut(BaseModel):
    id: str
    title: str
    created_at: datetime
    message_count: int = 0

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}