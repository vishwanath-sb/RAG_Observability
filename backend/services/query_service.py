"""Query orchestration service for the policy assistant."""

from __future__ import annotations

import time
from dataclasses import dataclass
from functools import lru_cache

import httpx
from ollama import ResponseError

from observability.tracing import (
    end_generation_span,
    end_retrieval_span,
    finish_trace,
    start_generation_span,
    start_query_trace,
    start_retrieval_span,
)
from backend.history.service import get_history_service
from backend.models.history import QueryHistoryCreate
from rag.embeddings import get_embedding_model
from rag.grounding import calculate_grounding_score
from rag.llm import get_llm
from rag.prompts import ENTERPRISE_POLICY_PROMPT
from rag.retrieval import retrieve_documents
from rag.vector_store import get_vector_store

from backend.models.query import QueryResponse, SourceItem


class QueryExecutionError(RuntimeError):
    """Raised when the query pipeline cannot complete."""


@dataclass(slots=True)
class QueryResult:
    """Intermediate result used to keep the service readable."""

    trace_id: str | None
    answer: str
    sources: list[SourceItem]
    retrieval_score: float
    grounding_score: float
    retrieval_time: float
    generation_time: float


class QueryService:
    """Coordinates retrieval, generation, scoring, and tracing."""

    def __init__(self) -> None:
        self._embeddings = get_embedding_model()
        self._vector_store = get_vector_store(self._embeddings)
        self._llm = get_llm()

    def answer(self, question: str) -> QueryResponse:
        """Run the full RAG pipeline for a single question."""

        trace = start_query_trace(question)
        trace_id = self._extract_trace_id(trace)

        retrieval_span = start_retrieval_span(trace)
        results = retrieve_documents(self._vector_store, question)

        if not results["results"]:
            end_retrieval_span(retrieval_span, [], results.get("retrieval_time", 0.0))
            answer = "I could not find this information in the documents."
            finish_trace(trace, answer, 0.0, 0.0, 0.0, 0.0, [])

            return QueryResponse(
                trace_id=trace_id,
                answer=answer,
                sources=[],
                retrieval_score=0.0,
                grounding_score=0.0,
                retrieval_time=results.get("retrieval_time", 0.0),
                generation_time=0.0,
                low_confidence_warning=True,
                hallucination_warning=False,
            )

        context = results["context"]
        retrieval_docs = results["retrieval_docs"]
        retrieval_time = results["retrieval_time"]
        avg_score = results["avg_score"]
        unique_citations = results["citations"]

        end_retrieval_span(retrieval_span, retrieval_docs, retrieval_time)

        final_prompt = ENTERPRISE_POLICY_PROMPT.format(
            context=context,
            question=question,
        )

        generation_span = start_generation_span(trace, final_prompt, "phi3:mini")
        generation_start = time.time()

        try:
            response = self._llm.invoke(final_prompt)
        except (httpx.ConnectError, ResponseError) as exc:
            end_generation_span(generation_span, str(exc))
            raise QueryExecutionError(
                "Could not complete the request with Ollama."
            ) from exc

        generation_time = time.time() - generation_start
        answer = response.content
        grounding_score = calculate_grounding_score(answer, context)

        end_generation_span(generation_span, answer)
        finish_trace(
            trace,
            answer,
            retrieval_time,
            generation_time,
            avg_score,
            grounding_score,
            unique_citations,
        )

        sources = [SourceItem(**citation) for citation in unique_citations]

        get_history_service().log_query(
            QueryHistoryCreate(
                trace_id=trace_id,
                question=question,
                answer=answer,
                retrieval_score=avg_score,
                grounding_score=grounding_score,
                retrieval_time=retrieval_time,
                generation_time=generation_time,
                low_confidence_warning=avg_score < 0.6,
                hallucination_warning=grounding_score < 0.65,
                sources=sources,
            )
        )

        return QueryResponse(
            trace_id=trace_id,
            answer=answer,
            sources=sources,
            retrieval_score=avg_score,
            grounding_score=grounding_score,
            retrieval_time=retrieval_time,
            generation_time=generation_time,
            low_confidence_warning=avg_score < 0.6,
            hallucination_warning=grounding_score < 0.65,
        )

    @staticmethod
    def _extract_trace_id(trace: object) -> str | None:
        """Read the trace identifier defensively across Langfuse versions."""

        for attribute_name in ("id", "trace_id", "span_id"):
            value = getattr(trace, attribute_name, None)
            if value:
                return str(value)
        return None


@lru_cache(maxsize=1)
def get_query_service() -> QueryService:
    """Create a singleton query service for the API layer."""

    return QueryService()
