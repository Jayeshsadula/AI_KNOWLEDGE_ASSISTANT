"""
Auth service — Firestore user synchronisation and profile management.

All Firestore interactions are centralised here so API routes stay thin.
The service is intentionally stateless; every public function accepts
``FirebaseUserClaims`` and returns ``UserProfile`` or raises descriptive
exceptions.
"""

import logging
from datetime import datetime
from typing import Optional, Tuple

from google.api_core.exceptions import GoogleAPICallError
from google.cloud.firestore import AsyncClient, Client

from app.auth.firebase_admin import get_firestore_client
from app.models.auth_models import FirebaseUserClaims, UserProfile

logger = logging.getLogger(__name__)

USERS_COLLECTION = "users"


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _user_ref(db: Client, uid: str):
    """Return the Firestore DocumentReference for a user."""
    return db.collection(USERS_COLLECTION).document(uid)


def _claims_to_profile(claims: FirebaseUserClaims, now: datetime) -> UserProfile:
    """Convert freshly decoded claims into a new UserProfile."""
    return UserProfile(
        uid=claims.uid,
        email=claims.email,
        display_name=claims.display_name,
        photo_url=claims.photo_url,
        email_verified=claims.email_verified,
        provider=claims.provider,
        created_at=now,
        last_login=now,
        is_active=True,
        role="user",
    )


def _doc_to_profile(data: dict) -> UserProfile:
    """Deserialise a Firestore document dict into a UserProfile."""
    # Firestore timestamps are datetime objects; keep them as-is
    return UserProfile(
        uid=data["uid"],
        email=data.get("email"),
        display_name=data.get("display_name"),
        photo_url=data.get("photo_url"),
        email_verified=data.get("email_verified", False),
        provider=data.get("provider"),
        created_at=data.get("created_at", datetime.utcnow()),
        last_login=data.get("last_login", datetime.utcnow()),
        is_active=data.get("is_active", True),
        role=data.get("role", "user"),
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_or_create_user(
    claims: FirebaseUserClaims,
) -> Tuple[UserProfile, bool]:
    """
    Fetch an existing Firestore user document or create one if absent.

    Parameters
    ----------
    claims:
        Verified claims from ``get_current_user`` dependency.

    Returns
    -------
    (UserProfile, is_new_user)
        ``is_new_user`` is ``True`` when the document was just created.

    Raises
    ------
    GoogleAPICallError
        Propagated as-is so the calling route can return a 503.
    """
    db = get_firestore_client()
    ref = _user_ref(db, claims.uid)
    now = datetime.utcnow()

    try:
        snapshot = ref.get()
    except GoogleAPICallError as exc:
        logger.error("Firestore read failed for uid=%s: %s", claims.uid, exc)
        raise

    if snapshot.exists:
        # Update mutable fields that may have changed since last login
        update_payload = {
            "last_login": now,
            "email_verified": claims.email_verified,
        }
        if claims.display_name:
            update_payload["display_name"] = claims.display_name
        if claims.photo_url:
            update_payload["photo_url"] = claims.photo_url

        try:
            ref.update(update_payload)
        except GoogleAPICallError as exc:
            # Non-fatal — log but still return the stale profile
            logger.warning("Could not update last_login for uid=%s: %s", claims.uid, exc)

        data: dict = snapshot.to_dict()  # type: ignore[assignment]
        data.update(update_payload)
        profile = _doc_to_profile(data)
        logger.debug("Returning existing user profile for uid=%s", claims.uid)
        return profile, False

    # --- New user ---
    profile = _claims_to_profile(claims, now)
    try:
        ref.set(profile.dict())
        logger.info("Created new Firestore user document for uid=%s", claims.uid)
    except GoogleAPICallError as exc:
        logger.error("Failed to create user document for uid=%s: %s", claims.uid, exc)
        raise

    return profile, True


def get_user_by_uid(uid: str) -> Optional[UserProfile]:
    """
    Fetch a user profile from Firestore by UID.

    Returns ``None`` if the document does not exist.
    """
    db = get_firestore_client()
    ref = _user_ref(db, uid)

    try:
        snapshot = ref.get()
    except GoogleAPICallError as exc:
        logger.error("Firestore read failed for uid=%s: %s", uid, exc)
        raise

    if not snapshot.exists:
        return None

    return _doc_to_profile(snapshot.to_dict())  # type: ignore[arg-type]


def update_user_profile(
    uid: str,
    display_name: Optional[str] = None,
    photo_url: Optional[str] = None,
) -> UserProfile:
    """
    Update mutable display fields on a user's Firestore document.

    Parameters
    ----------
    uid:
        Firebase UID of the user to update.
    display_name, photo_url:
        Fields to overwrite. ``None`` values are skipped.

    Returns
    -------
    The updated UserProfile.

    Raises
    ------
    ValueError
        If the user does not exist.
    GoogleAPICallError
        On Firestore failure.
    """
    db = get_firestore_client()
    ref = _user_ref(db, uid)

    payload: dict = {}
    if display_name is not None:
        payload["display_name"] = display_name
    if photo_url is not None:
        payload["photo_url"] = photo_url

    if not payload:
        # Nothing to update — just return the current profile
        profile = get_user_by_uid(uid)
        if profile is None:
            raise ValueError(f"User {uid} not found.")
        return profile

    try:
        ref.update(payload)
    except GoogleAPICallError as exc:
        logger.error("Failed to update profile for uid=%s: %s", uid, exc)
        raise

    updated = get_user_by_uid(uid)
    if updated is None:
        raise ValueError(f"User {uid} not found after update.")

    logger.info("Updated profile fields %s for uid=%s", list(payload.keys()), uid)
    return updated


def deactivate_user(uid: str) -> None:
    """
    Soft-delete a user by setting ``is_active = False`` in Firestore.

    Does not delete the Firestore document or revoke Firebase tokens.
    Call ``firebase_auth.revoke_refresh_tokens(uid)`` separately if needed.
    """
    db = get_firestore_client()
    ref = _user_ref(db, uid)

    try:
        ref.update({"is_active": False})
        logger.info("Deactivated user uid=%s", uid)
    except GoogleAPICallError as exc:
        logger.error("Failed to deactivate uid=%s: %s", uid, exc)
        raise
