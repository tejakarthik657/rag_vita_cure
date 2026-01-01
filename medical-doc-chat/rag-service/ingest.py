import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Configuration
EMBED_MODEL = "all-mpnet-base-v2"
docs_to_ingest = [
    {"id": "doc_1", "title": "Diabetes Care", "text": "Diabetes requires regular blood sugar monitoring to understand treatment effectiveness, make timely diet/exercise/medication adjustments, and prevent dangerous highs (hyperglycemia) or lows (hypoglycemia), ultimately reducing long-term complications like nerve or kidney damage. This self-monitoring, using fingersticks or continuous glucose monitors (CGM), provides crucial data to keep glucose levels in a target range, guiding daily management for better health outcomes, especially for those on insulin. "},
    {"id": "doc_2", "title": "Heart Health", "text": "smoking and high cholesterol significantly increase heart disease risk by damaging blood vessels, promoting plaque buildup (atherosclerosis), thickening blood, and raising blood pressure, leading to heart attacks and strokes, with smoking worsening lipid profiles (lowering good HDL, raising bad LDL/triglycerides) and combining with high cholesterol to drastically escalate dangers. Quitting smoking dramatically cuts this risk over time, and managing cholesterol with diet, exercise, and medication is crucial. "}
]

model = SentenceTransformer(EMBED_MODEL)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)

processed_chunks = []
raw_texts = []

# 2. Processing
for doc in docs_to_ingest:
    chunks = text_splitter.split_text(doc["text"])
    for chunk in chunks:
        processed_chunks.append({
            "document_id": doc["id"],
            "text": chunk
        })
        raw_texts.append(chunk)

# 3. Vectorization
vectors = model.encode(raw_texts).astype("float32")
index = faiss.IndexFlatL2(vectors.shape[1])
index.add(vectors)

# 4. Persistence
faiss.write_index(index, "index.faiss")
with open("docs.pkl", "wb") as f:
    pickle.dump(processed_chunks, f)

print(f"✅ Ingested {len(processed_chunks)} chunks from {len(docs_to_ingest)} docs.")