from typing import Any, Dict

import anyio
import httpx

from .config import get_settings
from .logging_utils import get_logger

logger = get_logger(__name__)


class OllamaError(Exception):
    """Raised when Ollama returns an invalid or empty response."""


# CHANGE 1:
# Create a SINGLE shared AsyncClient.
# Creating a new client per request adds connection + TCP + handshake latency.
# Ollama is local — keep the connection warm.
_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client

    if _client is None:
        settings = get_settings()

        # CHANGE 2:
        # Persistent client with connection pooling and keep-alive.
        _client = httpx.AsyncClient(
            timeout=settings.ollama_timeout_seconds,
            limits=httpx.Limits(
                max_keepalive_connections=5,
                max_connections=10,
            ),
        )

    return _client


async def generate_answer(prompt: str) -> str:
    settings = get_settings()

    payload: Dict[str, Any] = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
        "options": {
            # CHANGE 3:
            # Temperature stays low for determinism and faster convergence.
            "temperature": settings.ollama_temperature,
            # CHANGE 4:
            # Token limit MUST be capped aggressively to reduce inference time.
            "num_predict": settings.ollama_max_tokens,
        },
    }

    attempt = 0
    backoff = settings.ollama_retry_backoff_seconds

    client = _get_client()  # CHANGE 5: reuse persistent client

    while attempt < settings.ollama_retry_attempts:
        attempt += 1
        try:
            response = await client.post(settings.ollama_url, json=payload)
            response.raise_for_status()

            data = response.json()
            answer = data.get("response")

            if not answer:
                raise OllamaError("Empty response from Ollama")

            return answer

        except (httpx.HTTPError, OllamaError) as exc:
            # Log the concrete exception so we can diagnose connectivity/timeout/model issues.
            logger.warning(
                "Ollama attempt %s/%s failed: %r",
                attempt,
                settings.ollama_retry_attempts,
                exc,
                exc_info=True,
            )

            if attempt >= settings.ollama_retry_attempts:
                raise

            # CHANGE 6:
            # Non-blocking backoff to avoid event loop stall.
            await anyio.sleep(backoff)
