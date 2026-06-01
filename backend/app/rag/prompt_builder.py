from typing import List

def build_prompt(question: str, chunks: List[dict], history: List[dict] = []) -> tuple:
    system_prompt = """You are an AI Knowledge Assistant. Answer questions based on the provided document context.
If the context does not contain the answer, say "I could not find that information in the uploaded documents."
Be concise and accurate."""

    if chunks:
        context = "\n\n".join([f"[Source - {c.get('filename', 'Unknown')}]\n{c['text']}" for i, c in enumerate(chunks, 1)])
    else:
        context = "No relevant documents found."

    history_text = ""
    if history:
        history_text = "\n".join([f"{'User' if m['role']=='user' else 'Assistant'}: {m['content']}" for m in history[-6:]])

    if history_text:
        user_prompt = f"Previous conversation:\n{history_text}\n\nContext:\n{context}\n\nQuestion: {question}\n\nAnswer:"
    else:
        user_prompt = f"Context:\n{context}\n\nQuestion: {question}\n\nAnswer:"

    return system_prompt, user_prompt
