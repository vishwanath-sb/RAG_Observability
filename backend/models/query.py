"""Request and response models for query operations."""

from __future__ import annotations

from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """Payload for answering a policy question."""

    question: str = Field(min_length=1, description="User question to answer.")


class SourceItem(BaseModel):
    """A single cited source chunk returned by retrieval."""

    document: str
    page: int | None = None
    score: float


class QueryResponse(BaseModel):
    """Response payload returned by the query API."""

    trace_id: str | None = None
    answer: str
    sources: list[SourceItem]
    retrieval_score: float
    grounding_score: float
    retrieval_time: float
    generation_time: float
    low_confidence_warning: bool = False
    hallucination_warning: bool = False
