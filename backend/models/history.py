"""Pydantic models for query history persistence and APIs."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from backend.models.query import SourceItem


class QueryHistoryCreate(BaseModel):
    """Payload stored after each answered query."""

    trace_id: str | None
    question: str
    answer: str
    retrieval_score: float
    grounding_score: float
    retrieval_time: float
    generation_time: float
    low_confidence_warning: bool
    hallucination_warning: bool
    sources: list[SourceItem]


class QueryHistoryRecord(QueryHistoryCreate):
    """Persisted query history row returned by the API."""

    id: int
    timestamp: datetime
