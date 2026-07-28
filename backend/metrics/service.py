"""Metrics service layer."""

from __future__ import annotations

from functools import lru_cache

from backend.metrics.repository import MetricsRepository
from backend.models.metrics import MetricsResponse


class MetricsService:
    """Builds the analytics payload consumed by the frontend."""

    def __init__(self) -> None:
        self._repository = MetricsRepository()

    def get_metrics(self) -> MetricsResponse:
        """Aggregate dashboard metrics from the database."""

        summary = self._repository.summary()
        most_searched_documents = self._repository.most_searched_documents()
        recent_activity = self._repository.recent_activity()

        return MetricsResponse(
            **summary,
            most_searched_documents=most_searched_documents,
            recent_activity=recent_activity,
        )


@lru_cache(maxsize=1)
def get_metrics_service() -> MetricsService:
    """Return a singleton metrics service instance."""

    return MetricsService()
