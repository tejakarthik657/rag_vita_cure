import argparse
import json
from pathlib import Path
from typing import Iterable, List, TypedDict

import faiss
import numpy as np
import pickle
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

from app.config import get_settings
from app.logging_utils import configure_logging, get_logger

logger = get_logger(__name__)


class Document(TypedDict):
    id: str
    title: str
    text: str


def load_documents(path: Path | None) -> List[Document]:
    if not path:
        return [
            {
                "id": "doc_1",
                "title": "Diabetes Care",
                "text": "Diabetes requires regular blood sugar monitoring to understand treatment effectiveness, make timely diet/exercise/medication adjustments, and prevent dangerous highs (hyperglycemia) or lows (hypoglycemia).",
            },
            {
                "id": "doc_2",
                "title": "Heart Health",
                "text": "Smoking and high cholesterol significantly increase heart disease risk by damaging blood vessels and promoting plaque buildup (atherosclerosis).",
            },
        ]

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("Documents file must contain a list of objects.")
    return data  # type: ignore[return-value]


def chunk_documents(docs: Iterable[Document]) -> List[Document]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks: List[Document] = []
    for doc in docs:
        for chunk in splitter.split_text(doc["text"]):
            chunks.append({"id": doc["id"], "title": doc["title"], "text": chunk})
    return chunks


def ingest(docs: List[Document]) -> None:
    settings = get_settings()
    model = SentenceTransformer(settings.embedding_model)

    chunks = chunk_documents(docs)
    if not chunks:
        raise ValueError("No chunks to ingest.")

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


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest documents into FAISS index.")
    parser.add_argument(
        "--docs",
        type=Path,
        help="Path to JSON list of documents (objects with id, title, text).",
    )
    args = parser.parse_args()

    configure_logging()
    docs = load_documents(args.docs)
    ingest(docs)


if __name__ == "__main__":
    main()