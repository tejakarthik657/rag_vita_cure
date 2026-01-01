from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .rag_pipeline import run_rag_pipeline

app = FastAPI(title="Medical RAG Service V1")

class ChatRequest(BaseModel):
    document_id: str
    question: str

@app.post("/query")
async def query_endpoint(req: ChatRequest):
    try:
        result = run_rag_pipeline(req.document_id, req.question)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

    while True:
        try:
            uvicorn.run(app, host="0.0.0.0", port=8000)
        except Exception as e:
            print(f"Server crashed: {e}. Restarting...")    