"""
Pydantic schemas shared across the auth module.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class FirebaseUserClaims(BaseModel):
    """Decoded claims extracted from a verified Firebase ID token."""

    uid: str
    email: Optional[EmailStr] = None
    email_verified: bool = False
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    provider: Optional[str] = None


class UserProfile(BaseModel):
    """User document stored in Firestore and returned by API endpoints."""

    uid: str
    email: Optional[EmailStr] = None
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    email_verified: bool = False
    provider: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    role: str = "user"

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class TokenVerifyRequest(BaseModel):
    """Request body for POST /api/auth/verify-token."""

    id_token: str = Field(..., description="Firebase ID token from the client SDK.")


class TokenVerifyResponse(BaseModel):
    """Response body for POST /api/auth/verify-token."""

    uid: str
    email: Optional[EmailStr] = None
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    email_verified: bool
    is_new_user: bool = Field(
        ..., description="True when the Firestore document was just created."
    )


class ProfileResponse(BaseModel):
    """Response body for GET /api/auth/profile."""

    uid: str
    email: Optional[EmailStr] = None
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    email_verified: bool
    role: str
    created_at: datetime
    last_login: datetime

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}
