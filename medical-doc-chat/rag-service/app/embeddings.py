from functools import lru_cache
from typing import List

import anyio
from sentence_transformers import SentenceTransformer

from .config import get_settings
from .logging_utils import get_logger

logger = get_logger(__name__)


@lru_cache()
def _get_model() -> SentenceTransformer:
    settings = get_settings()
    logger.info("Loading embedding model: %s", settings.embedding_model)
    return SentenceTransformer(settings.embedding_model)


async def get_embedding(text: str) -> List[float]:
    model = _get_model()
    # Offload CPU-bound encoding to a worker thread to avoid blocking the event loop.
    return await anyio.to_thread.run_sync(lambda: model.encode(text).tolist())