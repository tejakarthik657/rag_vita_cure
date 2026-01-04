"""
Debug script to check what document IDs are available in the FAISS index.
Run this in the rag-service directory to verify your documents are properly indexed.
"""

import pickle

try:
    with open("docs.pkl", "rb") as f:
        data = pickle.load(f)
        available_ids = set([d['document_id'] for d in data])
        print("\n✓ Successfully loaded docs.pkl")
        print(f"\nAvailable Document IDs in Index: {available_ids}")
        print(f"Total documents indexed: {len(data)}")
        
        # Show details for each document
        print("\n--- Document Details ---")
        for i, doc in enumerate(data):
            print(f"\n[{i+1}] Document ID: {doc.get('document_id', 'N/A')}")
            if 'content' in doc:
                content_preview = doc['content'][:100] if len(doc['content']) > 100 else doc['content']
                print(f"    Content Preview: {content_preview}...")
except FileNotFoundError:
    print("✗ docs.pkl not found. Please run ingestion first:")
    print("  1. Make sure a PDF is in source_docs/")
    print("  2. Call POST /ingest from the frontend")
except Exception as e:
    print(f"✗ Error reading docs.pkl: {e}")
