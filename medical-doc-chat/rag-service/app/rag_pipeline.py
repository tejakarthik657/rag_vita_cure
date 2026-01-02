from .embeddings import get_embedding
from .vector_store import search_context
from .ollama_client import generate_answer

def run_rag_pipeline(doc_id, question):
    q_vec = get_embedding(question)
    context_chunks = search_context(q_vec, doc_id)
    
    if not context_chunks:
        return {"answer": "I don't have enough information in the selected document to answer this safely."}

    context_str = "\n\n".join(context_chunks)
    prompt = f"""[INST] You are a medical assistant. Use ONLY the provided context to answer. 
Context:
{context_str}

Question:
{question} [/INST]"""

    answer = generate_answer(prompt)
    return {"answer": answer}