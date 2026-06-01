"""
Ollama service — sends prompts to Llama 3 running locally via Ollama.
"""

import logging
import requests
import os
from app.config import settings
from groq import Groq
logger = logging.getLogger(__name__)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate(prompt: str, system: str = "") -> str:
    """
    Send a prompt to Ollama and return the generated text.

    Parameters
    ----------
    prompt : str
        The user prompt / full RAG prompt.
    system : str
        Optional system message.

    Returns
    -------
    str
        The model's response text.
    """
    url = f"{settings.ollama_base_url}/api/generate"

    payload = {
        "model":  settings.ollama_model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "top_p": 0.9,
            "num_predict": 512,
        },
    }

    if system:
        payload["system"] = system

    try:
        response = requests.post(url, json=payload, timeout=300)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "").strip()

    except requests.exceptions.ConnectionError:
        logger.error("Cannot connect to Ollama at %s", settings.ollama_base_url)
        raise RuntimeError(
            "Ollama is not running. Please start it with: ollama serve"
        )
    except requests.exceptions.Timeout:
        logger.error("Ollama request timed out")
        raise RuntimeError("The model took too long to respond. Please try again.")
    except Exception as exc:
        logger.error("Ollama error: %s", exc)
        raise RuntimeError(f"Model error: {str(exc)}")


def check_ollama_health() -> bool:
    """Return True if Ollama is reachable."""
    try:
        response = requests.get(
            f"{settings.ollama_base_url}/api/tags", timeout=5
        )
        return response.status_code == 200
    except Exception:
        return False
    import os


def generate(prompt: str, system: str = "") -> str:
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    
    response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=messages,
    max_tokens=512,
    temperature=0.1,
)
    
    return response.choices[0].message.content