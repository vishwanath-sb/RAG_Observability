"""Pydantic models for document upload and listing."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class DocumentItem(BaseModel):
    """Document metadata shown in the documents page."""

    filename: str
    path: str
    size_bytes: int
    uploaded_at: datetime
    is_uploaded: bool


class UploadResponse(BaseModel):
    """Response returned after a PDF upload is ingested."""

    filename: str
    path: str
    chunk_count: int

