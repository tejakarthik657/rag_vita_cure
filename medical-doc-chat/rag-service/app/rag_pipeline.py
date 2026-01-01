from .embeddings import get_embedding
from .vector_store import search_context
from .ollama_client import generate_answer

MEDICAL_DISCLAIMER = "\n\n⚠️ DISCLAIMER: This is an AI-generated summary. Consult a doctor for medical advice."

def run_rag_pipeline(doc_id: str, question: str):
    # 1. Embed & Search
    query_vec = get_embedding(question)
    context_chunks = search_context(query_vec, doc_id)
    
    if not context_chunks:
        return {"answer": "I could not find any relevant information in the selected document."}

    context_str = "\n---\n".join(context_chunks)

    # 2. Strict Prompting
    prompt = f"""[INST] You are a medical document assistant. 
Use the provided context to answer the question.
If the answer is not in the context, say you don't know. 
Do not provide medical diagnoses or prescriptions.

CONTEXT:
{context_str}

QUESTION:
{question}
[/INST]"""

    # 3. Generate
    raw_answer = generate_answer(prompt)
    
    return {
        "answer": raw_answer + MEDICAL_DISCLAIMER,
        "sources_used": len(context_chunks)
    }