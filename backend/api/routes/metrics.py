"""Metrics API route."""

from fastapi import APIRouter, Depends

from backend.metrics.service import MetricsService, get_metrics_service
from backend.models.metrics import MetricsResponse

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("", response_model=MetricsResponse)
def get_metrics(
    metrics_service: MetricsService = Depends(get_metrics_service),
) -> MetricsResponse:
    """Return dashboard analytics derived from stored queries and feedback."""

    return metrics_service.get_metrics()
