from sentence_transformers import SentenceTransformer

# MPNet is significantly more accurate than MiniLM for medical nuances
model = SentenceTransformer("all-mpnet-base-v2")

def get_embedding(text: str):
    return model.encode(text).tolist()