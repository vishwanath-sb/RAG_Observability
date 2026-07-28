"""SQLite access for analytics metrics."""

from __future__ import annotations

import json
from collections import Counter

from backend.database.sqlite import get_connection, initialize_database
from backend.models.metrics import DocumentMetric, RecentActivityItem


class MetricsRepository:
    """Read-only data access for analytics and dashboard metrics."""

    def __init__(self) -> None:
        initialize_database()

    def summary(self) -> dict[str, float | int]:
        """Return aggregate metrics from query history and feedback."""

        with get_connection() as connection:
            query_row = connection.execute(
                """
                SELECT
                    COUNT(*) AS total_queries,
                    COALESCE(AVG(retrieval_time + generation_time), 0) AS average_latency,
                    COALESCE(AVG(retrieval_score), 0) AS average_retrieval_score,
                    COALESCE(AVG(grounding_score), 0) AS average_grounding_score,
                    COALESCE(SUM(hallucination_warning), 0) AS hallucination_warnings
                FROM query_history
                """
            ).fetchone()

            feedback_rows = connection.execute(
                """
                SELECT feedback, COUNT(*) AS count
                FROM feedback
                GROUP BY LOWER(feedback)
                """
            ).fetchall()

        helpful_feedback = 0
        not_helpful_feedback = 0

        for row in feedback_rows:
            label = str(row["feedback"]).strip().lower()
            count = int(row["count"])
            if label in {"helpful", "yes", "positive", "thumbs_up"}:
                helpful_feedback += count
            elif label in {"not helpful", "no", "negative", "thumbs_down"}:
                not_helpful_feedback += count

        return {
            "total_queries": int(query_row["total_queries"]),
            "average_latency": float(query_row["average_latency"]),
            "average_retrieval_score": float(query_row["average_retrieval_score"]),
            "average_grounding_score": float(query_row["average_grounding_score"]),
            "hallucination_warnings": int(query_row["hallucination_warnings"]),
            "helpful_feedback": helpful_feedback,
            "not_helpful_feedback": not_helpful_feedback,
        }

    def most_searched_documents(self, limit: int = 5) -> list[DocumentMetric]:
        """Return the most frequently cited documents from history."""

        counter: Counter[str] = Counter()

        with get_connection() as connection:
            rows = connection.execute(
                "SELECT sources_json FROM query_history"
            ).fetchall()

        for row in rows:
            sources = json.loads(row["sources_json"])
            for source in sources:
                counter[str(source.get("document", "Unknown"))] += 1

        return [
            DocumentMetric(document=document, count=count)
            for document, count in counter.most_common(limit)
        ]

    def recent_activity(self, limit: int = 10) -> list[RecentActivityItem]:
        """Return recent query activity for the dashboard."""

        with get_connection() as connection:
            rows = connection.execute(
                """
                SELECT
                    id,
                    trace_id,
                    question,
                    answer,
                    retrieval_score,
                    grounding_score,
                    retrieval_time,
                    generation_time,
                    hallucination_warning,
                    timestamp
                FROM query_history
                ORDER BY id DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()

        return [
            RecentActivityItem(
                id=row["id"],
                trace_id=row["trace_id"],
                question=row["question"],
                answer=row["answer"],
                retrieval_score=row["retrieval_score"],
                grounding_score=row["grounding_score"],
                retrieval_time=row["retrieval_time"],
                generation_time=row["generation_time"],
                hallucination_warning=bool(row["hallucination_warning"]),
                timestamp=row["timestamp"],
            )
            for row in rows
        ]
