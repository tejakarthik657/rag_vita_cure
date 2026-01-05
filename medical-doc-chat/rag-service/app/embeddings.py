from functools import lru_cache
from typing import List

import anyio
from sentence_transformers import SentenceTransformer

from .config import get_settings
from .logging_utils import get_logger

logger = get_logger(__name__)


# CHANGE 1:
# Explicitly limit cache size to 1.
# This guarantees only ONE model instance exists in memory.
# Prevents accidental re-loading and reduces startup latency.
@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    settings = get_settings()
    logger.info("Loading embedding model: %s", settings.embedding_model)

    # CHANGE 2:
    # Explicitly pass device (cpu / cuda) to avoid silent device switching
    # and unnecessary overhead during encode calls.
    return SentenceTransformer(
        settings.embedding_model,
        device=settings.embedding_device
    )


async def get_embedding(text: str) -> List[float]:
    model = _get_model()

    # CHANGE 3:
    # Move encode logic into a named function instead of lambda.
    # This avoids lambda recreation overhead and is easier to profile.
    def _encode():
        return model.encode(
            text,
            # CHANGE 4:
            # Normalize embeddings to improve FAISS similarity
            # and reduce retrieval noise.
            normalize_embeddings=True,
            # CHANGE 5:
            # Force numpy output to avoid Torch tensor conversion costs
            # and ensure FAISS compatibility.
            convert_to_numpy=True
        ).tolist()

    # CHANGE 6:
    # Offload CPU-bound embedding computation to a worker thread.
    # Prevents blocking FastAPI's async event loop and improves concurrency.
    return await anyio.to_thread.run_sync(_encode)
