python -m venv ai-appsmith
ai-appsmith\Scripts\activate

# Run server
uvicorn main:app --reload --port 5000