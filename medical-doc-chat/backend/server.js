import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 4000;
const PYTHON_SERVICE_URL = "http://localhost:8000/query";

// Middleware
app.use(cors()); // Critical: Allows React to communicate with Node
app.use(express.json());

// 1. Health Check (Test this in your browser: http://localhost:4000/)
app.get("/", (req, res) => {
    res.json({ status: "Backend is running", documentation: "POST to /api/chat" });
});

// 2. Chat Endpoint
app.post("/api/chat", async (req, res) => {
    const { documentId, question } = req.body;

    // Validation
    if (!documentId || !question) {
        return res.status(400).json({ error: "documentId and question are required" });
    }

    try {
        console.log(`📩 Request received for ${documentId}: "${question}"`);

        // Forward to Python RAG service
        const response = await axios.post(PYTHON_SERVICE_URL, {
            document_id: documentId,
            question: question
        });

        console.log(`✅ Response received from Python Service`);
        
        // Return Python's answer to React
        res.json(response.data);

    } catch (error) {
        console.error("❌ Gateway Error:");
        
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ 
                error: "Python RAG Service is offline. Please start it on port 8000." 
            });
        } else {
            res.status(500).json({ 
                error: "Internal Server Error",
                details: error.message 
            });
        }
    }
});

app.listen(PORT, () => {
    console.log(`-----------------------------------------------`);
    console.log(`🚀 GATEWAY: http://localhost:${PORT}`);
    console.log(`🔗 RAG LINK: ${PYTHON_SERVICE_URL}`);
    console.log(`-----------------------------------------------`);
});