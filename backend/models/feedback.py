"""Pydantic models for feedback persistence and APIs."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class FeedbackCreate(BaseModel):
    """Request payload for storing user feedback."""

    trace_id: str | None = None
    question: str = Field(min_length=1)
    answer: str = Field(min_length=1)
    feedback: str = Field(min_length=1, description="User sentiment or label.")
    retrieval_score: float = Field(ge=0)
    grounding_score: float = Field(ge=0)


class FeedbackRecord(FeedbackCreate):
    """Persisted feedback record returned by the API."""

    id: int
    timestamp: datetime
