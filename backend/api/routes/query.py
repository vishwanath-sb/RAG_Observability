"""Query endpoint for the Enterprise Policy Assistant API."""

from fastapi import APIRouter, Depends, HTTPException

from backend.models.query import QueryRequest, QueryResponse
from backend.services.query_service import QueryExecutionError, QueryService, get_query_service

router = APIRouter(prefix="/query", tags=["query"])


@router.post("", response_model=QueryResponse)
def query_question(
    payload: QueryRequest,
    query_service: QueryService = Depends(get_query_service),
) -> QueryResponse:
    """Answer a policy question using the existing RAG pipeline."""

    try:
        return query_service.answer(payload.question)
    except QueryExecutionError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
