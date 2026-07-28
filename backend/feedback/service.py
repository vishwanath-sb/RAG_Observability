"""Feedback service layer."""

from __future__ import annotations

from functools import lru_cache

from backend.feedback.repository import FeedbackRepository
from backend.models.feedback import FeedbackCreate, FeedbackRecord


class FeedbackService:
    """Coordinates validation and persistence for feedback."""

    def __init__(self) -> None:
        self._repository = FeedbackRepository()

    def submit(self, payload: FeedbackCreate) -> FeedbackRecord:
        """Store feedback and return the persisted row."""

        return self._repository.create(payload)


@lru_cache(maxsize=1)
def get_feedback_service() -> FeedbackService:
    """Return a singleton feedback service instance."""

    return FeedbackService()
