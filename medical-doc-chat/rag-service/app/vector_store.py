import faiss
import pickle
import numpy as np

def search_context(query_vec, doc_id, k=5):
    try:
        index = faiss.read_index("index.faiss")
        with open("docs.pkl", "rb") as f:
            all_chunks = pickle.load(f)
    except:
        return []

    # Search the whole index
    D, I = index.search(np.array([query_vec]).astype("float32"), k=index.ntotal)
    
    filtered = []
    for idx in I[0]:
        if idx == -1: continue
        chunk = all_chunks[idx]
        if chunk["document_id"] == doc_id:
            filtered.append(chunk["text"])
        if len(filtered) >= k:
            break
    return filtered