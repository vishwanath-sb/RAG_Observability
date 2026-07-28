"""SQLite repository for query history."""

from __future__ import annotations

import json

from backend.database.sqlite import get_connection, initialize_database
from backend.models.history import QueryHistoryCreate, QueryHistoryRecord


class HistoryRepository:
    """Encapsulates query history database access."""

    def __init__(self) -> None:
        initialize_database()

    def create(self, payload: QueryHistoryCreate) -> QueryHistoryRecord:
        """Insert a history event and return the persisted row."""

        with get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO query_history (
                    trace_id,
                    question,
                    answer,
                    retrieval_score,
                    grounding_score,
                    retrieval_time,
                    generation_time,
                    low_confidence_warning,
                    hallucination_warning,
                    sources_json
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    payload.trace_id,
                    payload.question,
                    payload.answer,
                    payload.retrieval_score,
                    payload.grounding_score,
                    payload.retrieval_time,
                    payload.generation_time,
                    int(payload.low_confidence_warning),
                    int(payload.hallucination_warning),
                    json.dumps([source.model_dump() for source in payload.sources]),
                ),
            )
            connection.commit()

            row = connection.execute(
                "SELECT * FROM query_history WHERE id = ?",
                (cursor.lastrowid,),
            ).fetchone()

        record = dict(row)
        record["low_confidence_warning"] = bool(record["low_confidence_warning"])
        record["hallucination_warning"] = bool(record["hallucination_warning"])
        record["sources"] = [
            source for source in json.loads(record.pop("sources_json"))
        ]

        return QueryHistoryRecord.model_validate(record)

    def list_recent(self, limit: int = 25) -> list[QueryHistoryRecord]:
        """Return the most recent query history entries."""

        with get_connection() as connection:
            rows = connection.execute(
                """
                SELECT *
                FROM query_history
                ORDER BY id DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()

        records: list[QueryHistoryRecord] = []

        for row in rows:
            record = dict(row)
            record["low_confidence_warning"] = bool(record["low_confidence_warning"])
            record["hallucination_warning"] = bool(record["hallucination_warning"])
            record["sources"] = [
                source for source in json.loads(record.pop("sources_json"))
            ]
            records.append(QueryHistoryRecord.model_validate(record))

        return records
