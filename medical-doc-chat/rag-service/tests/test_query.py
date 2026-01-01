import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app import config, rag_pipeline
from app.main import app


@pytest.fixture(autouse=True)
def clear_settings_cache():
    config.get_settings.cache_clear()
    yield
    config.get_settings.cache_clear()


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


@pytest.mark.asyncio
async def test_query_success(monkeypatch, client):
    async def fake_embed(text: str):
        return [0.1, 0.2, 0.3]

    async def fake_search(query_vec, doc_id, k=None, fetch_k=None):
        return [({"document_id": doc_id, "text": "Blood sugar monitoring is important.", "title": "T"}, 0.9)]

    async def fake_generate(prompt: str):
        return "Mocked answer [1]"

    monkeypatch.setattr(rag_pipeline, "get_embedding", fake_embed)
    monkeypatch.setattr(rag_pipeline, "search_context", fake_search)
    monkeypatch.setattr(rag_pipeline, "generate_answer", fake_generate)

    resp = await client.post(
        "/query",
        json={"document_id": "doc_1", "question": "How to monitor blood sugar?"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "Mocked answer" in data["answer"]
    assert data["sources_used"] == 1


@pytest.mark.asyncio
async def test_query_no_context(monkeypatch, client):
    async def fake_embed(text: str):
        return [0.0, 0.0, 0.0]

    async def fake_search(query_vec, doc_id, k=None, fetch_k=None):
        return []

    monkeypatch.setattr(rag_pipeline, "get_embedding", fake_embed)
    monkeypatch.setattr(rag_pipeline, "search_context", fake_search)

    resp = await client.post(
        "/query",
        json={"document_id": "unknown", "question": "Any info?"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["answer"] == "No relevant information found for this document."
    assert data["sources_used"] == 0
