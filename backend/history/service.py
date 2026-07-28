"""Query history service layer."""

from __future__ import annotations

from functools import lru_cache

from backend.history.repository import HistoryRepository
from backend.models.history import QueryHistoryCreate, QueryHistoryRecord


class HistoryService:
    """Coordinates query history persistence and retrieval."""

    def __init__(self) -> None:
        self._repository = HistoryRepository()

    def log_query(self, payload: QueryHistoryCreate) -> QueryHistoryRecord:
        """Persist a query execution after a response is generated."""

        return self._repository.create(payload)

    def recent(self, limit: int = 25) -> list[QueryHistoryRecord]:
        """Fetch the most recent answered queries."""

        return self._repository.list_recent(limit=limit)


@lru_cache(maxsize=1)
def get_history_service() -> HistoryService:
    """Return a singleton query history service."""

    return HistoryService()
