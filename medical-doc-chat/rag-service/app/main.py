import os
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, Field

from .config import Settings, get_settings
from .ingest_logic import run_ingestion
from .logging_utils import configure_logging, get_logger
from .rag_pipeline import run_rag_pipeline

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: warm settings to fail fast on misconfiguration.
    get_settings()
    logger.info("Application startup complete")
    yield
    # Shutdown: cleanup if needed
    logger.info("Application shutdown")


app = FastAPI(title="Medical RAG Service", lifespan=lifespan)


class ChatRequest(BaseModel):
    document_id: str = Field(..., min_length=1, max_length=128)
    question: str = Field(..., min_length=1, max_length=1000)


class ChatResponse(BaseModel):
    answer: str
    sources_used: int


@app.post("/query", response_model=ChatResponse)
async def query_endpoint(
    req: ChatRequest, settings: Settings = Depends(get_settings)
):
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
        result = await run_rag_pipeline(req.document_id, req.question)
        return result
    except HTTPException:
        raise
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("Query failed", extra={"doc_id": req.document_id})
        raise HTTPException(status_code=500, detail="Internal server error") from exc


@app.post("/ingest")
async def ingest():
    """Re-ingest all documents from source_docs folder and rebuild FAISS index."""
    try:
        result = await run_ingestion()
        return result
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("Ingestion failed")
        raise HTTPException(status_code=500, detail="Ingestion failed") from exc


@app.get("/files")
async def list_files():
    """List all PDF documents available in the source_docs folder."""
    base_dir = Path(__file__).resolve().parent.parent
    folder = base_dir / "source_docs"
    if not folder.exists():
        return {"documents": []}

    try:
        files = [
            f.replace('.pdf', '')
            for f in os.listdir(folder)
            if f.endswith('.pdf')
        ]
        return {"documents": files}
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("Failed to list files")
        raise HTTPException(status_code=500, detail="Failed to list files") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=get_settings().host, port=get_settings().port)