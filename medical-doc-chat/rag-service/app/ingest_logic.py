import os
import faiss
import pickle
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Pathing (assumes uvicorn runs from the rag-service root)
SOURCE_DIR = "./source_docs"
INDEX_PATH = "index.faiss"
PKL_PATH = "docs.pkl"

def run_ingestion():
    if not os.path.exists(SOURCE_DIR):
        os.makedirs(SOURCE_DIR)

    model = SentenceTransformer("all-mpnet-base-v2")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=100)

    all_chunks = []
    raw_texts = []

    files = [f for f in os.listdir(SOURCE_DIR) if f.endswith('.pdf')]
    if not files:
        return {"error": "No files in source_docs"}

    for filename in files:
        doc_id = filename.replace(".pdf", "")
        reader = PdfReader(os.path.join(SOURCE_DIR, filename))
        
        full_text = ""
        for page in reader.pages:
            full_text += (page.extract_text() or "") + " "
            
        chunks = text_splitter.split_text(full_text)
        for chunk in chunks:
            all_chunks.append({"document_id": doc_id, "text": chunk})
            raw_texts.append(chunk)

    # Build Index
    vectors = model.encode(raw_texts).astype("float32")
    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(vectors)
    
    # Save files
    faiss.write_index(index, INDEX_PATH)
    with open(PKL_PATH, "wb") as f:
        pickle.dump(all_chunks, f)

    return {"status": "success", "docs": len(files), "chunks": len(all_chunks)}