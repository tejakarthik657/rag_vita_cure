from .embeddings import get_embedding
from .vector_store import search_context
from .ollama_client import generate_answer


async def run_rag_pipeline(doc_id, question):
    # CHANGE 1:
    # Embedding stays async and cached — already optimal.
    q_vec = await get_embedding(question)

    # CHANGE 2:
    # Explicitly limit retrieved chunks to reduce prompt size.
    # More context ≠ better answers. This directly affects latency.
    context_chunks = search_context(q_vec, doc_id, k=3)

    # CHANGE 3:
    # Remove print() debug statements from hot path.
    # print() is slow, blocking, and kills concurrency.
    if not context_chunks:
        return {
            "answer": (
                "I'm sorry, I couldn't find any information in that document "
                "to answer your question."
            ),
            "sources_used": 0,
        }

    # CHANGE 4:
    # Join with single newline to reduce token count.
    # Double newlines waste tokens and slow generation.
    context_str = "\n".join(context_chunks)

    # CHANGE 5:
    # Tight, deterministic instruction.
    # Short prompt = faster inference.
    prompt = (
        "[INST] Answer the question using ONLY the context below. "
        "Be concise and factual.\n\n"
        f"Context:\n{context_str}\n\n"
        f"Question:\n{question}\n"
        "[/INST]"
    )

    try:
        # CHANGE 6:
        # Await Ollama call directly — client is already pooled and warm.
        answer = await generate_answer(prompt)

    except Exception:
        # CHANGE 7:
        # Avoid logging stack traces in hot path.
        # Fail fast with a clean user message.
        return {
            "answer": (
                "The language model is temporarily unavailable. "
                "Please try again shortly."
            ),
            "sources_used": len(context_chunks),
        }

    return {
        "answer": answer,
        "sources_used": len(context_chunks),
    }
