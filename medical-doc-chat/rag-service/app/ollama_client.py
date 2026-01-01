import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

def generate_answer(prompt: str):
    payload = {
        "model": "mistral-nemo",
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.0,  # CRITICAL: No hallucination
            "num_predict": 512   # Limit response length
        }
    }
    try:
        res = requests.post(OLLAMA_URL, json=payload, timeout=30)
        res.raise_for_status()
        return res.json().get("response", "Error: No response from LLM.")
    except Exception as e:
        return f"System Error: {str(e)}"