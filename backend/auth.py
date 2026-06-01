"""
FastAPI auth router.

Endpoints
---------
POST /api/auth/verify-token   — verify a Firebase ID token, sync Firestore user
GET  /api/auth/profile        — return the authenticated user's Firestore profile
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from google.api_core.exceptions import GoogleAPICallError

from app.auth.auth_service import get_or_create_user, get_user_by_uid
from app.auth.dependencies import get_current_user, require_verified_email
from app.models.auth_models import (
    FirebaseUserClaims,
    ProfileResponse,
    TokenVerifyRequest,
    TokenVerifyResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Type alias for the injected user — keeps route signatures compact
CurrentUser = Annotated[FirebaseUserClaims, Depends(get_current_user)]


# ---------------------------------------------------------------------------
# POST /api/auth/verify-token
# ---------------------------------------------------------------------------

@router.post(
    "/verify-token",
    response_model=TokenVerifyResponse,
    summary="Verify a Firebase ID token",
    responses={
        200: {"description": "Token verified; user profile returned."},
        401: {"description": "Token invalid, expired, or revoked."},
        503: {"description": "Firestore unavailable."},
    },
)
async def verify_token(
    body: TokenVerifyRequest,
    user: CurrentUser,
) -> TokenVerifyResponse:
    """
    Verify a Firebase ID token and synchronise the user with Firestore.

    The client sends the raw Firebase ID token in the request body **and**
    in the ``Authorization: Bearer <token>`` header.  The header is used
    by the ``get_current_user`` dependency (which handles token validation);
    the body token is accepted for legacy client compatibility but the
    dependency's verified claims always take precedence.

    On success the endpoint guarantees a Firestore user document exists and
    returns ``is_new_user=True`` on first sign-in.
    """
    try:
        profile, is_new_user = get_or_create_user(user)
    except GoogleAPICallError as exc:
        logger.error("Firestore error during verify-token for uid=%s: %s", user.uid, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="User database temporarily unavailable. Please try again.",
        )

    logger.info(
        "verify-token: uid=%s email=%s new=%s",
        user.uid,
        user.email,
        is_new_user,
    )

    return TokenVerifyResponse(
        uid=profile.uid,
        email=profile.email,
        display_name=profile.display_name,
        photo_url=profile.photo_url,
        email_verified=profile.email_verified,
        is_new_user=is_new_user,
    )


# ---------------------------------------------------------------------------
# GET /api/auth/profile
# ---------------------------------------------------------------------------

@router.get(
    "/profile",
    response_model=ProfileResponse,
    summary="Get the authenticated user's profile",
    responses={
        200: {"description": "User profile from Firestore."},
        401: {"description": "Missing or invalid token."},
        404: {"description": "User document not found in Firestore."},
        503: {"description": "Firestore unavailable."},
    },
)
async def get_profile(user: CurrentUser) -> ProfileResponse:
    """
    Return the Firestore profile for the authenticated user.

    Requires a valid ``Authorization: Bearer <token>`` header.
    The profile is created automatically on first call to ``verify-token``;
    if it is somehow absent this endpoint returns 404.
    """
    try:
        profile = get_user_by_uid(user.uid)
    except GoogleAPICallError as exc:
        logger.error("Firestore error fetching profile for uid=%s: %s", user.uid, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="User database temporarily unavailable. Please try again.",
        )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Call /api/auth/verify-token first.",
        )

    logger.debug("Profile fetched for uid=%s", user.uid)
    return ProfileResponse(
        uid=profile.uid,
        email=profile.email,
        display_name=profile.display_name,
        photo_url=profile.photo_url,
        email_verified=profile.email_verified,
        role=profile.role,
        created_at=profile.created_at,
        last_login=profile.last_login,
    )
