import faiss
import pickle
import numpy as np

index = faiss.read_index("index.faiss")
with open("docs.pkl", "rb") as f:
    all_chunks = pickle.load(f)

def search_context(query_vec, doc_id, k=4):
    # Retrieve more than k to allow for filtering
    D, I = index.search(np.array([query_vec]).astype("float32"), k=20)
    
    filtered_results = []
    for idx in I[0]:
        chunk = all_chunks[idx]
        if chunk["document_id"] == doc_id:
            filtered_results.append(chunk["text"])
        
        if len(filtered_results) >= k:
            break
            
    return filtered_results