"""SQLite connection and schema helpers."""

from __future__ import annotations

import sqlite3
from pathlib import Path


DATABASE_PATH = Path("backend") / "data" / "enterprise_policy_assistant.db"


def get_connection() -> sqlite3.Connection:
    """Return a SQLite connection with row access enabled."""

    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    """Create the tables required by the backend if they do not exist."""

    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trace_id TEXT,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                feedback TEXT NOT NULL,
                retrieval_score REAL NOT NULL,
                grounding_score REAL NOT NULL,
                timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS query_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trace_id TEXT,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                retrieval_score REAL NOT NULL,
                grounding_score REAL NOT NULL,
                retrieval_time REAL NOT NULL,
                generation_time REAL NOT NULL,
                low_confidence_warning INTEGER NOT NULL,
                hallucination_warning INTEGER NOT NULL,
                sources_json TEXT NOT NULL,
                timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()
