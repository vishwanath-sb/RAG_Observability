"""Pydantic models for analytics metrics."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class DocumentMetric(BaseModel):
    """Aggregated document search frequency."""

    document: str
    count: int


class RecentActivityItem(BaseModel):
    """A recent answered query shown in analytics."""

    id: int
    trace_id: str | None
    question: str
    answer: str
    retrieval_score: float
    grounding_score: float
    retrieval_time: float
    generation_time: float
    hallucination_warning: bool
    timestamp: datetime


class MetricsResponse(BaseModel):
    """Analytics summary for the dashboard."""

    total_queries: int
    average_latency: float
    average_retrieval_score: float
    average_grounding_score: float
    hallucination_warnings: int
    helpful_feedback: int
    not_helpful_feedback: int
    most_searched_documents: list[DocumentMetric]
    recent_activity: list[RecentActivityItem]
