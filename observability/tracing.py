from observability.langfuse_client import get_langfuse_client

langfuse = get_langfuse_client()


def start_query_trace(question: str):
    """
    Create a new trace for a user query.
    """
    return langfuse.start_observation(
        name="enterprise-policy-query",
        as_type="span",
        input={
            "question": question
        }
    )


def start_retrieval_span(trace):
    """
    Create a retrieval span.
    """
    return trace.start_observation(
        name="vector-search",
        as_type="retriever"
    )


def end_retrieval_span(
    retrieval_span,
    retrieval_docs,
    retrieval_time
):
    """
    Finish retrieval span.
    """

    retrieval_span.update(
        output={
            "documents": retrieval_docs,
            "retrieval_time": retrieval_time
        }
    )

    retrieval_span.end()


def start_generation_span(
    trace,
    prompt,
    model_name
):
    """
    Create generation span.
    """

    return trace.start_observation(
        name="llm-answer",
        as_type="generation",
        model=model_name,
        input=prompt
    )


def end_generation_span(
    generation_span,
    answer
):
    """
    Finish generation span.
    """

    generation_span.update(
        output=answer
    )

    generation_span.end()


def finish_trace(
    trace,
    answer,
    retrieval_time,
    generation_time,
    retrieval_score,
    grounding_score,
    sources
):
    """
    Update final trace metadata.
    """

    trace.update(
        output=answer,
        metadata={
            "retrieval_time_seconds": retrieval_time,
            "generation_time_seconds": generation_time,
            "average_retrieval_score": retrieval_score,
            "grounding_score": grounding_score,
            "sources": sources
        }
    )

    langfuse.flush()