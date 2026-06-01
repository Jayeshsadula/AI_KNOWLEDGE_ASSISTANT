import logging
import os
import uuid
from pathlib import Path
from typing import Tuple

from pypdf import PdfReader

logger = logging.getLogger(__name__)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def save_upload(file_bytes: bytes, filename: str) -> Tuple[str, Path]:
    doc_id = str(uuid.uuid4())
    safe_name = f"{doc_id}_{filename}"
    dest = UPLOAD_DIR / safe_name
    dest.write_bytes(file_bytes)
    return doc_id, dest


def extract_text(pdf_path: Path) -> Tuple[str, int]:
    reader = PdfReader(str(pdf_path))
    pages = reader.pages
    texts = []

    for page in pages:
        try:
            text = page.extract_text()
            if text and text.strip():
                texts.append(text)
        except Exception:
            pass

    full_text = "\n".join(texts)

    if not full_text.strip():
        logger.info("No text found — attempting OCR...")
        full_text = _ocr_pdf(pdf_path)

    logger.info("Extracted %d chars from %d pages", len(full_text), len(pages))
    return full_text, len(pages)


def _ocr_pdf(pdf_path: Path) -> str:
    try:
        import pytesseract
        from pdf2image import convert_from_path

        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

        # Find poppler path
        poppler_path = None
        for p in ["C:\\poppler\\poppler-24.08.0\\Library\\bin",
                  "C:\\poppler\\Library\\bin"]:
            if os.path.exists(p):
                poppler_path = p
                break

        images = convert_from_path(str(pdf_path), poppler_path=poppler_path)
        texts = []
        for img in images:
            text = pytesseract.image_to_string(img)
            if text.strip():
                texts.append(text)

        result = "\n".join(texts)
        logger.info("OCR extracted %d chars", len(result))
        return result

    except Exception as exc:
        logger.error("OCR failed: %s", exc, exc_info=True)
    return ""

def validate_pdf(filename: str, file_bytes: bytes) -> None:
    if not filename.lower().endswith(".pdf"):
        raise ValueError("Only PDF files are supported.")
    if len(file_bytes) > 50 * 1024 * 1024:
        raise ValueError("File size must be under 50 MB.")
    if not file_bytes.startswith(b"%PDF"):
        raise ValueError("File does not appear to be a valid PDF.")