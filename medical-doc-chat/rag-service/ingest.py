import argparse
import json
import os
from pathlib import Path
from typing import Iterable, List, TypedDict

import faiss
import numpy as np
import pickle
from pypdf import PdfReader # Ensure pip install pypdf
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

from app.config import get_settings
from app.logging_utils import configure_logging, get_logger

logger = get_logger(__name__)

class Document(TypedDict):
    id: str
    title: str
    text: str

def load_documents_from_folder(folder_path: Path) -> List[Document]:
    """
    Scans the source folder for PDF files and extracts their text.
    The filename (without extension) is used as the document ID and Title.
    """
    documents: List[Document] = []
    
    if not folder_path.exists():
        logger.warning("Source folder %s does not exist. Creating it.", folder_path)
        folder_path.mkdir(parents=True, exist_ok=True)
        return []

    pdf_files = list(folder_path.glob("*.pdf"))
    
    for pdf_path in pdf_files:
        try:
            logger.info("Extracting text from: %s", pdf_path.name)
            reader = PdfReader(pdf_path)
            full_text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    full_text += page_text + " "
            
            if full_text.strip():
                documents.append({
                    "id": pdf_path.stem, # filename without .pdf
                    "title": pdf_path.stem.replace("_", " ").title(),
                    "text": full_text
                })
            else:
                logger.warning("No text found in %s, skipping.", pdf_path.name)
        except Exception as e:
            logger.error("Failed to process %s: %s", pdf_path.name, str(e))

    return documents

def chunk_documents(docs: Iterable[Document]) -> List[Document]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=100)
    chunks: List[Document] = []
    for doc in docs:
        for chunk in splitter.split_text(doc["text"]):
            chunks.append({"id": doc["id"], "title": doc["title"], "text": chunk})
    return chunks

def ingest(docs: List[Document]) -> dict:
    """
    Ingests documents into FAISS and returns a summary.
    """
    settings = get_settings()
    model = SentenceTransformer(settings.embedding_model)

    chunks = chunk_documents(docs)
    if not chunks:
        logger.error("No chunks to ingest. Ensure PDFs contain extractable text.")
        return {"status": "error", "message": "No text found in documents."}

    raw_texts = [c["text"] for c in chunks]
    vectors = model.encode(raw_texts).astype("float32")
    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(vectors)

    logger.info("Writing index to %s", settings.index_path)
    faiss.write_index(index, str(settings.index_path))

    doc_store = [
        {"document_id": c["id"], "text": c["text"], "title": c["title"]}
        for c in chunks
    ]

    logger.info("Writing document store to %s", settings.docs_path)
    with open(settings.docs_path, "wb") as f:
        pickle.dump(doc_store, f)

    logger.info("Ingested %s chunks from %s documents.", len(chunks), len(docs))
    return {
        "status": "success", 
        "documents_processed": len(docs), 
        "total_chunks": len(chunks)
    }

def main() -> None:
    # configure_logging() should be called first
    configure_logging()
    settings = get_settings()
    
    parser = argparse.ArgumentParser(description="Ingest documents into FAISS index.")
    parser.add_argument(
        "--source",
        type=Path,
        default=Path("./source_docs"),
        help="Path to folder containing PDF documents.",
    )
    args = parser.parse_args()

    docs = load_documents_from_folder(args.source)
    if docs:
        ingest(docs)
    else:
        logger.error("No documents found in %s. Please upload PDFs first.", args.source)

if __name__ == "__main__":
    main()