"""SQLite repository for feedback persistence."""

from __future__ import annotations

from backend.database.sqlite import get_connection, initialize_database
from backend.models.feedback import FeedbackCreate, FeedbackRecord


class FeedbackRepository:
    """Encapsulates feedback database access."""

    def __init__(self) -> None:
        initialize_database()

    def create(self, payload: FeedbackCreate) -> FeedbackRecord:
        """Insert a feedback item and return the stored record."""

        with get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO feedback (
                    trace_id,
                    question,
                    answer,
                    feedback,
                    retrieval_score,
                    grounding_score
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    payload.trace_id,
                    payload.question,
                    payload.answer,
                    payload.feedback,
                    payload.retrieval_score,
                    payload.grounding_score,
                ),
            )
            connection.commit()

            row = connection.execute(
                "SELECT * FROM feedback WHERE id = ?",
                (cursor.lastrowid,),
            ).fetchone()

        return FeedbackRecord.model_validate(dict(row))
