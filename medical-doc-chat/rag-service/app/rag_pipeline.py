from .embeddings import get_embedding
from .vector_store import search_context
from .ollama_client import generate_answer

async def run_rag_pipeline(doc_id, question):
    q_vec = await get_embedding(question)
    context_chunks = search_context(q_vec, doc_id)
    
    # Check if context is empty
    if not context_chunks:
        print(f"DEBUG: No context found for {doc_id}")
        return {"answer": "I'm sorry, I couldn't find any information in that document to answer your question.", "sources_used": 0}

    context_str = "\n\n".join(context_chunks)
    
    # Explicit instruction to be brief (speeds up generation)
    prompt = f"""[INST] Use the context to answer the question. Be concise.
Context: {context_str}
Question: {question} [/INST]"""

    print("DEBUG: Sending to Ollama...")
    try:
        answer = await generate_answer(prompt)
        print("DEBUG: Received from Ollama.")
    except Exception as exc:  # if Ollama is unreachable or times out
        print(f"DEBUG: Ollama error - {exc}")
        return {
            "answer": "The language model is unavailable right now. Please try again after it starts.",
            "sources_used": len(context_chunks),
        }

    return {"answer": answer, "sources_used": len(context_chunks)}