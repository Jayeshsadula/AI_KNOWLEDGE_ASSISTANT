"""
FastAPI dependencies for authentication.

Usage
-----
Inject `get_current_user` into any route that requires a logged-in user:

    @router.get("/protected")
    async def protected_route(user: FirebaseUserClaims = Depends(get_current_user)):
        return {"uid": user.uid}

For admin-only routes, chain with `require_admin`:

    @router.delete("/admin/user/{uid}")
    async def delete_user(
        uid: str,
        user: FirebaseUserClaims = Depends(require_admin),
    ):
        ...
"""

import logging
from typing import Optional

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from firebase_admin import auth as firebase_auth

from app.auth.firebase_admin import initialize_firebase
from app.models.auth_models import FirebaseUserClaims

logger = logging.getLogger(__name__)

# Bearer-token extractor — auto_error=False so we can return a cleaner message
_bearer = HTTPBearer(auto_error=False)


def _extract_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(_bearer),
) -> str:
    """
    Pull the raw JWT string from the Authorization header.

    Raises 401 if the header is absent or malformed.
    """
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or malformed. Expected: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials


async def get_current_user(
    token: str = Depends(_extract_token),
) -> FirebaseUserClaims:
    """
    Verify a Firebase ID token and return the decoded user claims.

    Steps
    -----
    1. Ensure the Firebase Admin SDK is initialised.
    2. Call ``firebase_auth.verify_id_token`` (checks signature, expiry, audience).
    3. Map the decoded dict to a ``FirebaseUserClaims`` Pydantic model.

    Raises
    ------
    HTTPException 401  — token expired, revoked, or invalid.
    HTTPException 500  — unexpected verification failure.
    """
    initialize_firebase()

    try:
        decoded: dict = firebase_auth.verify_id_token(token, check_revoked=True)
    except firebase_auth.RevokedIdTokenError:
        logger.warning("Attempted use of revoked ID token.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_auth.ExpiredIdTokenError:
        logger.warning("Expired ID token received.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_auth.InvalidIdTokenError as exc:
        logger.warning("Invalid ID token: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as exc:
        logger.error("Unexpected error during token verification: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error. Please try again later.",
        )

    # Determine the sign-in provider (google, password, etc.)
    identities = decoded.get("firebase", {}).get("identities", {})
    provider: Optional[str] = None
    if "google.com" in identities:
        provider = "google"
    elif "password" in identities:
        provider = "password"

    user_claims = FirebaseUserClaims(
        uid=decoded["uid"],
        email=decoded.get("email"),
        email_verified=decoded.get("email_verified", False),
        display_name=decoded.get("name"),
        photo_url=decoded.get("picture"),
        provider=provider,
    )

    logger.debug("Authenticated user: %s", user_claims.uid)
    return user_claims


async def require_verified_email(
    user: FirebaseUserClaims = Depends(get_current_user),
) -> FirebaseUserClaims:
    """
    Extends ``get_current_user`` — also requires a verified email address.

    Raises HTTPException 403 if the email is unverified.
    """
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email address must be verified before accessing this resource.",
        )
    return user


async def require_admin(
    user: FirebaseUserClaims = Depends(get_current_user),
) -> FirebaseUserClaims:
    """
    Extends ``get_current_user`` — also requires the ``admin`` custom claim.

    Set the claim via the Admin SDK:
        firebase_auth.set_custom_user_claims(uid, {"admin": True})

    Raises HTTPException 403 for non-admin users.
    """
    initialize_firebase()
    try:
        firebase_user = firebase_auth.get_user(user.uid)
        custom_claims: dict = firebase_user.custom_claims or {}
        if not custom_claims.get("admin", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrator privileges required.",
            )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to fetch custom claims for %s: %s", user.uid, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not verify user permissions.",
        )
    return user
