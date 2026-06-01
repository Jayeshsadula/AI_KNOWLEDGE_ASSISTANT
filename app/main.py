import logging
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.api.auth      import router as auth_router
from app.api.documents import router as documents_router
from app.api.chat      import router as chat_router
from app.auth.firebase_admin import initialize_firebase

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Knowledge Assistant", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup() -> None:
    logger.info("Starting AI Knowledge Assistant API...")
    initialize_firebase()
    logger.info("Firebase Admin SDK ready.")

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(chat_router)

@app.get("/health", tags=["Meta"])
async def health() -> dict:
    return {"status": "ok"}
