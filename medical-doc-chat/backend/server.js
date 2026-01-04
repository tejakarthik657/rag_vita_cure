import express from 'express';
import cors from 'cors';
import axios from 'axios';
import multer from 'multer';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const PYTHON_URL = "http://localhost:8000";

// 1. Admin Auth Middleware (Hardcoded V1)
const adminAuth = (req, res, next) => {
    const { username, password } = req.headers;
    if (username === "admin" && password === "supersecure123") {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};

// 2. Multer Configuration (Save directly to Python's source folder)
const storage = multer.diskStorage({
    destination: "../rag-service/source_docs/",
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// --- ADMIN ROUTES ---

// Upload File and trigger ingestion so the new doc appears in listings
app.post("/api/admin/upload", adminAuth, upload.single("file"), async (req, res) => {
    try {
        const ingestResp = await axios.post(`${PYTHON_URL}/ingest`);
        res.json({ message: "File uploaded and ingested", ingest: ingestResp.data });
    } catch (err) {
        console.error("Ingestion failed after upload", err);
        res.status(502).json({ error: "Upload saved, but ingestion failed", detail: err?.message });
    }
});

// Trigger Re-ingestion
app.post("/api/admin/reingest", adminAuth, async (req, res) => {
    const response = await axios.post(`${PYTHON_URL}/ingest`);
    res.json(response.data);
});

// --- USER ROUTES ---

// Get Dynamic Document List
app.get("/api/documents", async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_URL}/files`);
        res.json(response.data.documents); // Returns array of IDs
    } catch (err) {
        console.error("Failed to fetch documents from RAG service", err);
        res.status(503).json({ error: "RAG service unavailable" });
    }
});

// Chat (Existing)
app.post("/api/chat", async (req, res) => {
    const { documentId, question } = req.body;
    const response = await axios.post(`${PYTHON_URL}/query`, {
        document_id: documentId,
        question: question
    }, { timeout: 120000 }); // 120,000ms = 2 minutes for local LLM
    res.json(response.data);
});

app.listen(4000, () => console.log("Backend running on 4000"));