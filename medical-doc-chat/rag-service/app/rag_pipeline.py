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
    
    # DEBUG: Print retrieval info
    print(f"--- DEBUG ---")
    print(f"Searching for Doc ID: {doc_id}")
    print(f"Chunks found: {len(retrieved)}")
    for chunk, score in retrieved:
        print(f"Score: {score:.4f} | Chunk: {chunk['text'][:100]}...")
    print(f"-------------")
    
    if not retrieved:
        return {
            "answer": "The selected document does not contain information regarding that specific query.",
            "sources_used": 0
        }

    # Build context from retrieved chunks
    context_text = "\n".join([chunk["text"] for chunk, _ in retrieved])

    # Simplified, high-instruction prompt for Mistral-Nemo
    prompt = f"""[INST] You are a medical assistant. Use the following CONTEXT to answer the QUESTION.
If the answer is not in the context, say you don't know.

CONTEXT:
{context_text}

QUESTION:
{question} [/INST]"""

    # 4) Generate
    raw_answer = await generate_answer(prompt)

    return {
        "answer": f"{raw_answer}\n\n⚠️ DISCLAIMER: This is an AI-generated summary based on the selected document. Consult a medical professional.",
        "sources_used": len(retrieved),
    }