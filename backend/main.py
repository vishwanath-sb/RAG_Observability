"""FastAPI application entrypoint for the backend."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes.feedback import router as feedback_router
from backend.api.routes.history import router as history_router
from backend.api.routes.metrics import router as metrics_router
from backend.api.routes.query import router as query_router
from backend.api.routes.upload import router as upload_router
from backend.database.sqlite import initialize_database

app = FastAPI(
    title="Enterprise Policy Assistant API",
    version="0.1.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query_router)
app.include_router(feedback_router)
app.include_router(history_router)
app.include_router(metrics_router)
app.include_router(upload_router)


@app.on_event("startup")
def startup_event() -> None:
    """Prepare local storage before handling requests."""

    initialize_database()


@app.get("/health")
def health_check() -> dict[str, str]:
    """Simple liveness probe for deployment checks."""

    return {"status": "ok"}
