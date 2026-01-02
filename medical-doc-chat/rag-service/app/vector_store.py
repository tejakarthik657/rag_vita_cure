import pickle
from functools import lru_cache
from pathlib import Path
from typing import List, Tuple, TypedDict

import anyio
import faiss
import numpy as np

from .config import get_settings
from .logging_utils import get_logger

logger = get_logger(__name__)


class Chunk(TypedDict):
    document_id: str
    text: str
    title: str


@lru_cache()
def _load_index(path: Path) -> faiss.Index:
    if not path.exists():
        raise FileNotFoundError(f"FAISS index not found at {path}")
    logger.info("Loading FAISS index from %s", path)
    return faiss.read_index(str(path))


@lru_cache()
def _load_chunks(path: Path) -> List[Chunk]:
    if not path.exists():
        raise FileNotFoundError(f"Document store not found at {path}")
    logger.info("Loading document chunks from %s", path)
    with open(path, "rb") as f:
        data = pickle.load(f)
    return data


async def search_context(
    query_vec: List[float],
    doc_id: str,
    k: int | None = None,
    fetch_k: int | None = None,
) -> List[Tuple[Chunk, float]]:
    settings = get_settings()
    top_k = k or settings.retrieval_top_k

    index_path = settings.index_path.resolve()
    docs_path = settings.docs_path.resolve()
    index = _load_index(index_path)
    all_chunks = _load_chunks(docs_path)

    query = np.array([query_vec], dtype="float32")
    
    # Search ENTIRE index to ensure we never miss a chunk in small datasets
    def _search():
        return index.search(query, index.ntotal)

    distances, indices = await anyio.to_thread.run_sync(_search)

    results: List[Tuple[Chunk, float]] = []
    for pos, idx in enumerate(indices[0]):
        if idx == -1:  # FAISS empty result
            continue
            
        chunk: Chunk = all_chunks[idx]
        if chunk["document_id"] != doc_id:
            continue

        distance = float(distances[0][pos])
        score = 1.0 / (1.0 + distance)  # Normalize to (0, 1]; higher is better.
        if settings.retrieval_min_score and score < settings.retrieval_min_score:
            continue

        results.append((chunk, score))
        if len(results) >= top_k:
            break

    # SAFETY FALLBACK: If vector search found nothing, return all chunks from this doc
    # This ensures V1 stability for small datasets
    if not results:
        logger.warning("Vector search returned no results for doc_id=%s, using fallback", doc_id)
        for chunk in all_chunks:
            if chunk["document_id"] == doc_id:
                results.append((chunk, 0.5))  # Default score for fallback
                if len(results) >= top_k:
                    break

    return results