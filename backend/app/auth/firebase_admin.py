"""
Firebase Admin SDK initialization.

Loads credentials from environment variables and creates a singleton
Firebase app instance used across the backend.
"""

import logging
import os
from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import Client

logger = logging.getLogger(__name__)


def _build_credentials() -> credentials.Certificate:
    """
    Build Firebase credentials from environment variables.

    Supports two modes:
    - Individual env vars: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
    - JSON file path:      FIREBASE_SERVICE_ACCOUNT_PATH

    Raises:
        ValueError: If required environment variables are missing or malformed.
    """
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    if service_account_path:
        logger.info("Loading Firebase credentials from file: %s", service_account_path)
        return credentials.Certificate(service_account_path)

    project_id = os.getenv("FIREBASE_PROJECT_ID")
    private_key = os.getenv("FIREBASE_PRIVATE_KEY")
    client_email = os.getenv("FIREBASE_CLIENT_EMAIL")

    missing = [
        name
        for name, val in [
            ("FIREBASE_PROJECT_ID", project_id),
            ("FIREBASE_PRIVATE_KEY", private_key),
            ("FIREBASE_CLIENT_EMAIL", client_email),
        ]
        if not val
    ]
    if missing:
        raise ValueError(
            f"Missing required Firebase environment variables: {', '.join(missing)}"
        )

    # Newlines in .env files are often escaped as literal \n
    private_key = private_key.replace("\\n", "\n")  # type: ignore[union-attr]

    service_account_info: dict = {
        "type": "service_account",
        "project_id": project_id,
        "private_key": private_key,
        "client_email": client_email,
        "token_uri": "https://oauth2.googleapis.com/token",
    }

    logger.info(
        "Loading Firebase credentials from environment variables (project: %s)",
        project_id,
    )
    return credentials.Certificate(service_account_info)


def initialize_firebase() -> firebase_admin.App:
    """
    Initialize and return the Firebase Admin app singleton.

    Idempotent — safe to call multiple times; returns the existing app if
    already initialized.
    """
    if firebase_admin._apps:  # noqa: SLF001  (accessing private but stable API)
        logger.debug("Firebase Admin already initialized, reusing existing app.")
        return firebase_admin.get_app()

    try:
        creds = _build_credentials()
        app = firebase_admin.initialize_app(creds)
        logger.info("Firebase Admin SDK initialized successfully.")
        return app
    except Exception as exc:
        logger.critical("Failed to initialize Firebase Admin SDK: %s", exc)
        raise


@lru_cache(maxsize=1)
def get_firestore_client() -> Client:
    """
    Return a cached Firestore client.

    The cache ensures a single client instance is reused for the lifetime of
    the process, avoiding repeated authentication round-trips.
    """
    initialize_firebase()
    client: Client = firestore.client()
    logger.debug("Firestore client created.")
    return client
