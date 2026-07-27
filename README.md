# Enterprise Policy Assistant with RAG and LLM Observability

Production-style AI application for answering enterprise policy questions with retrieval-augmented generation, citations, observability, feedback collection, and a React dashboard.

## What This Project Demonstrates

- Retrieval-augmented generation over policy PDFs
- FastAPI backend with service-based architecture
- SQLite persistence for feedback and query history
- ChromaDB vector search with sentence-transformers embeddings
- Ollama-powered local LLM generation
- Langfuse tracing for retrieval and generation visibility
- React + Vite + Tailwind frontend for chat, upload, documents, and analytics

## Architecture

- `backend/` contains the FastAPI application, services, models, database helpers, and feature modules.
- `rag/` contains the existing retrieval, prompt, grounding, embeddings, and vector store logic.
- `observability/` contains Langfuse client and tracing helpers.
- `frontend/` contains the React UI.

## Key Endpoints

- `POST /query` - answer a policy question using RAG
- `POST /upload` - upload and ingest a PDF into ChromaDB
- `GET /documents` - list indexed and uploaded documents
- `POST /feedback` - store user feedback in SQLite
- `GET /metrics` - analytics for latency, scores, and usage
- `GET /history` - recent query history

## Local Development

### Backend

1. Activate the virtual environment.
2. Run the FastAPI app with Uvicorn.

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
& .\venv\Scripts\Activate.ps1
uvicorn backend.main:app --reload
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend expects the backend to run on `http://localhost:8000`.

## Environment Notes

- Ollama must be running locally for generation.
- Langfuse environment variables should be set if you want traces to appear in the Langfuse dashboard.
- The backend enables CORS for `http://localhost:5173` and `http://127.0.0.1:5173`.

## Project Structure

```text
enterprise-policy-assistant/
├── backend/
│   ├── api/
│   ├── database/
│   ├── feedback/
│   ├── history/
│   ├── metrics/
│   ├── models/
│   ├── services/
│   ├── uploads/
│   └── main.py
├── frontend/
├── observability/
├── rag/
├── data/
└── chroma_db/
```

## Demo Flow

1. Ask a policy question in the Chat page.
2. Inspect the returned sources, retrieval score, grounding score, and trace ID.
3. Submit Helpful or Not Helpful feedback.
4. Upload a PDF and confirm it appears in Documents.
5. Open Analytics to review query volume, scores, warnings, and recent activity.

## Notes

The original RAG pipeline remains intact. The backend layers added around it are focused on orchestration, persistence, and API design so the project looks like a real production AI application rather than a single-script demo.

