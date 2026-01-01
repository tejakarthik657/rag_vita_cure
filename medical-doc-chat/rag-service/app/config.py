from functools import lru_cache
from pathlib import Path
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = Field("Medical RAG Service")
    host: str = Field("0.0.0.0")
    port: int = Field(8000)

    ollama_url: str = Field("http://localhost:11434/api/generate")
    ollama_model: str = Field("mistral-nemo")
    ollama_timeout_seconds: float = Field(30.0)
    ollama_max_tokens: int = Field(512)
    ollama_temperature: float = Field(0.0)
    ollama_retry_attempts: int = Field(3)
    ollama_retry_backoff_seconds: float = Field(0.5)

    embedding_model: str = Field("all-mpnet-base-v2")

    index_path: Path = Field(Path("index.faiss"))
    docs_path: Path = Field(Path("docs.pkl"))

    retrieval_top_k: int = Field(4)
    retrieval_fetch_k: int = Field(20)
    retrieval_min_score: float = Field(0.0)

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


@lru_cache()
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]
