import faiss
import pickle
import numpy as np
from pathlib import Path

# CHANGE 1:
# Paths stay the same — no issue here.
BASE_DIR = Path(__file__).resolve().parent.parent
INDEX_PATH = BASE_DIR / "index.faiss"
PKL_PATH = BASE_DIR / "docs.pkl"


# CHANGE 2:
# Allow live reload after ingestion so new documents are searchable without
# restarting the server.
_INDEX = None
_ALL_CHUNKS = []


def reload_index() -> bool:
    """Reload FAISS index and chunk metadata from disk.

    Returns True on success, False otherwise. Sets module globals.
    """

    global _INDEX, _ALL_CHUNKS  # noqa: PLW0603

    try:
        _INDEX = faiss.read_index(str(INDEX_PATH))
        with open(PKL_PATH, "rb") as f:
            _ALL_CHUNKS = pickle.load(f)
        return True
    except Exception:
        _INDEX = None
        _ALL_CHUNKS = []
        return False


# Initial best-effort load on import.
reload_index()


def search_context(query_vec, doc_id, k=5):
    """
    Perform document-scoped vector search.

    - query_vec: embedding vector of the query
    - doc_id: selected document identifier
    - k: number of chunks to return
    """

    # CHANGE 3:
    # If index is missing (e.g., first request after deploy), try reload once.
    # If reload fails, return empty to avoid raising during request handling.
    global _INDEX, _ALL_CHUNKS  # noqa: PLW0603
    if _INDEX is None or not _ALL_CHUNKS:
        reload_index()
        if _INDEX is None or not _ALL_CHUNKS:
            return []

    # CHANGE 4:
    # Search only top-N candidates instead of entire index.
    # Searching index.ntotal was causing MASSIVE slowdown.
    # We search k * 5 and filter afterward.
    search_k = min(k * 5, _INDEX.ntotal)

    D, I = _INDEX.search(
        np.array([query_vec], dtype="float32"),
        search_k
    )

    filtered = []

    # CHANGE 5:
    # Filter by document_id in-memory (cheap).
    for idx in I[0]:
        if idx == -1:
            continue

        chunk = _ALL_CHUNKS[idx]

        if chunk["document_id"] == doc_id:
            filtered.append(chunk["text"])

        if len(filtered) >= k:
            break

    return filtered
