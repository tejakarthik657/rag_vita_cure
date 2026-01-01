from typing import Any, Dict

import anyio
import httpx

from .config import get_settings
from .logging_utils import get_logger

logger = get_logger(__name__)


class OllamaError(Exception):
    """Raised when Ollama returns an invalid or empty response."""


async def generate_answer(prompt: str) -> str:
    settings = get_settings()

    payload: Dict[str, Any] = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": settings.ollama_temperature,
            "num_predict": settings.ollama_max_tokens,
        },
    }

    attempt = 0
    backoff = settings.ollama_retry_backoff_seconds

    async with httpx.AsyncClient(timeout=settings.ollama_timeout_seconds) as client:
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
            except (httpx.HTTPError, OllamaError) as exc:  # network or bad payload
                logger.warning(
                    "Ollama attempt %s/%s failed: %s",
                    attempt,
                    settings.ollama_retry_attempts,
                    exc,
                )
                if attempt >= settings.ollama_retry_attempts:
                    raise
                await anyio.sleep(backoff)