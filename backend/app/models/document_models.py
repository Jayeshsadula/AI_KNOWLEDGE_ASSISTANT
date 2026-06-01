"""Pydantic schemas for the documents module."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: str
    user_id: str
    filename: str
    upload_date: datetime
    size: Optional[int] = None
    pages: Optional[int] = None
    chunks: Optional[int] = None

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class UploadResponse(BaseModel):
    id: str
    filename: str
    upload_date: datetime
    pages: int
    chunks: int
    message: str = "Document uploaded and indexed successfully."

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}