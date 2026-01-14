from functools import lru_cache
from pathlib import Path
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    app_name: str = Field("Medical RAG Service")
    host: str = Field("0.0.0.0")
    port: int = Field(8000)

    # -----------------------------
    # Ollama configuration
    # -----------------------------
    ollama_url: str = Field("http://localhost:11434/api/generate")
    ollama_model: str = Field("mistral-nemo")

    # Large models on CPU can take 30–60s; keep timeout high to avoid false failures
    # Keep Ollama requests bounded but give enough room for occasional slow generations.
    ollama_timeout_seconds: float = Field(120.0)

    # CHANGE 1:
    # Cap generation length aggressively.
    # Lower values = faster inference.
    ollama_max_tokens: int = Field(100)

    ollama_temperature: float = Field(0.0)
    ollama_retry_attempts: int = Field(2)
    ollama_retry_backoff_seconds: float = Field(1.0)

    # -----------------------------
    # Embedding configuration
    # -----------------------------
    embedding_model: str = Field("all-mpnet-base-v2")

    # CHANGE 2 (CRITICAL FIX):
    # Explicit device selection for embeddings.
    # Required by embeddings.py to avoid AttributeError.
    # Valid values: "cpu", "cuda"
    embedding_device: str = Field("cpu")

    # -----------------------------
    # Vector store paths
    # -----------------------------
    index_path: Path = Field(Path("index.faiss"))
    docs_path: Path = Field(Path("docs.pkl"))

    # -----------------------------
    # Retrieval tuning
    # -----------------------------
    retrieval_top_k: int = Field(3)
    retrieval_fetch_k: int = Field(15)
    retrieval_min_score: float = Field(0.0)

    # -----------------------------
    # Input validation limits
    # -----------------------------
    max_question_length: int = Field(1000)
    max_document_id_length: int = Field(128)

    @field_validator("retrieval_top_k")
    @classmethod
    def validate_top_k(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("retrieval_top_k must be positive")
        return v

    @field_validator("retrieval_fetch_k")
    @classmethod
    def validate_fetch_k(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("retrieval_fetch_k must be positive")
        return v


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    # CHANGE 3:
    # Cache settings once per process.
    # Prevents repeated env parsing and object creation.
    return Settings()
