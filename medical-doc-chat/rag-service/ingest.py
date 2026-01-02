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
                "id": "doc-1",
                "title": "Hypertension Treatment Guidelines",
                "text": "Hypertension, also known as high blood pressure, is a chronic medical condition where the force of blood against artery walls is consistently too high. Blood pressure is the pressure exerted by circulating blood on the walls of blood vessels. Normal blood pressure is below 120/80 mmHg, while hypertension is diagnosed at 130/80 mmHg or higher. Management includes lifestyle modifications such as reducing sodium intake, maintaining a healthy weight, engaging in regular physical activity, limiting alcohol consumption, and managing stress. Antihypertensive medications may be prescribed when lifestyle changes alone are insufficient. Regular monitoring and medical follow-up are essential for preventing complications such as heart disease, stroke, and kidney damage.",
            },
            {
                "id": "doc-2",
                "title": "Heart Health and Diabetes Care",
                "text": "The heart is a muscular organ that pumps blood throughout the body, delivering oxygen and nutrients to tissues and removing carbon dioxide and waste products. Maintaining heart health is crucial for overall well-being. Cardiovascular health is improved by engaging in at least 30 minutes of cardiovascular exercise daily, such as brisk walking, jogging, cycling, or swimming. Smoking is a primary risk factor that significantly increases the likelihood of heart failure, arterial disease, and atherosclerosis. Diabetes is a chronic condition that affects how your body turns food into energy, requiring regular blood sugar monitoring. Patients with diabetes are advised to eat leafy greens, whole grains, lean proteins, and avoid processed sugars to maintain blood glucose stability. Regular HbA1c testing every 3 months, annual foot examinations, and eye exams are essential components of comprehensive diabetes care.",
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