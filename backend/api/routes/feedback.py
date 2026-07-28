"""Feedback API route."""

from fastapi import APIRouter, Depends

from backend.feedback.service import FeedbackService, get_feedback_service
from backend.models.feedback import FeedbackCreate, FeedbackRecord

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackRecord)
def submit_feedback(
    payload: FeedbackCreate,
    feedback_service: FeedbackService = Depends(get_feedback_service),
) -> FeedbackRecord:
    """Persist feedback for a previously generated answer."""

    return feedback_service.submit(payload)
