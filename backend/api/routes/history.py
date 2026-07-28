"""History API route."""

from fastapi import APIRouter, Depends, Query

from backend.history.service import HistoryService, get_history_service
from backend.models.history import QueryHistoryRecord

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=list[QueryHistoryRecord])
def get_history(
    limit: int = Query(default=25, ge=1, le=100),
    history_service: HistoryService = Depends(get_history_service),
) -> list[QueryHistoryRecord]:
    """Return the most recent answered queries."""

    return history_service.recent(limit=limit)
