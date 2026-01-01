from typing import Dict, List

from .config import get_settings
from .embeddings import get_embedding
from .logging_utils import get_logger
from .ollama_client import generate_answer
from .vector_store import search_context

logger = get_logger(__name__)

MEDICAL_DISCLAIMER = (
    "\n\nDISCLAIMER: This is an AI-generated summary. Consult a doctor for medical advice."
)


async def run_rag_pipeline(doc_id: str, question: str) -> Dict[str, object]:
    settings = get_settings()

    # 1) Embed query
    query_vec = await get_embedding(question)

    # 2) Retrieve
    retrieved = await search_context(query_vec, doc_id)
    if not retrieved:
        return {"answer": "No relevant information found for this document.", "sources_used": 0}

    context_lines: List[str] = []
    citations: List[str] = []
    for idx, (chunk, score) in enumerate(retrieved, start=1):
        context_lines.append(f"[{idx}] {chunk['text']}")
        citations.append(f"[{idx}]")

    context_block = "\n---\n".join(context_lines)
    citation_list = " ".join(citations)

    # 3) Prompt
    prompt = f"""You are a concise medical document assistant.
Use ONLY the provided context to answer the question.
If the answer is not contained in the context, reply with "I don't know".
Avoid diagnoses or prescriptions.
Include citations from the provided context {citation_list}.

Context:
{context_block}

Question:
{question}
"""

    # 4) Generate
    raw_answer = await generate_answer(prompt)

    return {
        "answer": raw_answer + MEDICAL_DISCLAIMER,
        "sources_used": len(retrieved),
    }