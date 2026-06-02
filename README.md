# AI_KNOWLEDGE_ASSISTANT
# AI Knowledge Assistant

An AI-powered PDF chatbot that lets users upload documents and ask questions, 
answered by Llama 3 using RAG (Retrieval Augmented Generation) architecture.

## Features

- 📄 Upload multiple PDF documents
- 💬 Ask questions about your documents
- 🤖 AI answers using Llama 3 (local) or Groq API
- 🔍 Source citations with every answer
- 🔐 Firebase Authentication (Email + Google)
- 💾 Conversation history with MongoDB
- 📊 ChromaDB vector storage
- 🖼️ OCR support for scanned PDFs
- 🌙 Dark mode UI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Material UI |
| Backend | FastAPI + Python |
| Authentication | Firebase |
| Database | MongoDB |
| Vector Store | ChromaDB |
| Embeddings | Sentence Transformers |
| LLM | Llama 3 via Ollama / Groq |
| PDF Processing | PyPDF + Tesseract OCR |
| Architecture | RAG |

## Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB
- Ollama (for local LLM)
- Firebase project

## Installation

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file in `backend/`: