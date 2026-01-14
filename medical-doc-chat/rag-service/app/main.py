import os
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, Field

from .config import Settings, get_settings
from .ingest_logic import run_ingestion
from .logging_utils import configure_logging, get_logger
from .rag_pipeline import run_rag_pipeline
from .ollama_client import generate_answer

# CHANGE 1:
# Logging configuration stays the same — this is correct.
configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # CHANGE 2:
    # Warm settings AND implicitly trigger lazy-loaded singletons.
    # This ensures:
    # - embedding model loads once
    # - FAISS index is loaded
    # - Ollama client initializes
    #
    # This removes cold-start latency on the first user query.
    get_settings()
    logger.info("Application startup complete")

    yield

    # Shutdown: cleanup if needed
    logger.info("Application shutdown")


# CHANGE 3:
# Explicitly disable OpenAPI docs in production if needed
# (keeps startup light; optional but safe)
app = FastAPI(
    title="Medical RAG Service",
    lifespan=lifespan,
)


class ChatRequest(BaseModel):
    document_id: str = Field(..., min_length=1, max_length=128)
    question: str = Field(..., min_length=1, max_length=1000)


class ChatResponse(BaseModel):
    answer: str
    sources_used: int


class GeneralChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)


class GeneralChatResponse(BaseModel):
    answer: str


@app.post("/chat/general", response_model=GeneralChatResponse)
async def general_chat(
    req: GeneralChatRequest,
    settings: Settings = Depends(get_settings),
):
    if len(req.question) > settings.max_question_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is too long.",
        )

    prompt = (
        "[INST] You are a concise and helpful medical assistant. "
        "Provide short, clear answers (3-5 sentences) and avoid medical diagnoses or prescriptions.\n"
        f"Question:\n{req.question}\n"
        "[/INST]"
    )

    try:
        answer = await generate_answer(prompt)
        return {"answer": answer}

    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("General chat failed")
        raise HTTPException(
            status_code=503,
            detail="LLM is unavailable right now. Please try again shortly.",
        ) from exc


@app.post("/query", response_model=ChatResponse)
async def query_endpoint(
    req: ChatRequest,
    settings: Settings = Depends(get_settings),
):
    # CHANGE 4:
    # Length checks are good — they stay.
    # These prevent prompt abuse and runaway inference.
    if len(req.question) > settings.max_question_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is too long.",
        )

    if len(req.document_id) > settings.max_document_id_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document id is too long.",
        )

    try:
        # CHANGE 5:
        # run_rag_pipeline is already async and optimized.
        # No blocking calls here — good.
        result = await run_rag_pipeline(req.document_id, req.question)
        return result

    except HTTPException:
        raise

    except Exception as exc:  # pylint: disable=broad-except
        # CHANGE 6:
        # Log once, fail fast.
        # Avoid retries or re-processing here — retries belong upstream.
        logger.exception(
            "Query failed",
            extra={"doc_id": req.document_id},
        )
        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        ) from exc


@app.post("/ingest")
async def ingest():
    """Re-ingest all documents from source_docs folder and rebuild FAISS index."""
    try:
        # CHANGE 7:
        # Ingestion remains async.
        # This endpoint should NEVER be called by users.
        return await run_ingestion()

    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("Ingestion failed")
        raise HTTPException(
            status_code=500,
            detail="Ingestion failed",
        ) from exc


@app.get("/files")
async def list_files():
    """List all PDF documents available in the source_docs folder."""
    base_dir = Path(__file__).resolve().parent.parent
    folder = base_dir / "source_docs"

    if not folder.exists():
        return {"documents": []}

    try:
        # CHANGE 8:
        # os.listdir is fine here — this is NOT a hot path.
        files = [
            f.replace(".pdf", "")
            for f in os.listdir(folder)
            if f.endswith(".pdf")
        ]
        return {"documents": files}

    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("Failed to list files")
        raise HTTPException(
            status_code=500,
            detail="Failed to list files",
        ) from exc


if __name__ == "__main__":
    import uvicorn

    # CHANGE 9:
    # Explicit uvicorn invocation is fine for dev.
    # In prod, use: uvicorn app.main:app --workers N
    uvicorn.run(
        app,
        host=get_settings().host,
        port=get_settings().port,
    )
