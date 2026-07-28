import time
import httpx

from ollama import ResponseError

from rag.prompts import ENTERPRISE_POLICY_PROMPT
from rag.embeddings import get_embedding_model
from rag.llm import get_llm
from rag.vector_store import get_vector_store
from rag.grounding import calculate_grounding_score
from rag.retrieval import retrieve_documents

from observability.tracing import (
    start_query_trace,
    start_retrieval_span,
    end_retrieval_span,
    start_generation_span,
    end_generation_span,
    finish_trace,
)


# =====================================================
# Embeddings
# =====================================================

embeddings = get_embedding_model()

# =====================================================
# Vector Database
# =====================================================

db = get_vector_store(embeddings)

# =====================================================
# LLM
# =====================================================
llm = get_llm()

# =====================================================
# Main Loop
# =====================================================

print("\nEnterprise Policy Assistant")
print("Type 'exit' to quit.\n")


while True:

    try:
        question = input("Question: ").strip()

    except (EOFError, KeyboardInterrupt):
        print("\nExiting.")
        break

    if question.lower() in {"exit", "quit"}:
        break

    if not question:
        print("Please enter a question.\n")
        continue

    # =================================================
    # Langfuse Trace
    # =================================================

    trace = start_query_trace(question)

    # =================================================
    # Retrieval
    # =================================================

    retrieval_span = start_retrieval_span(trace)

    results = retrieve_documents(
        db,
        question
    )

    if not results["results"]:

        end_retrieval_span(
            retrieval_span,
            [],
            results.get("retrieval_time", 0)
        )

        answer = (
            "I could not find this information "
            "in the documents."
        )

        finish_trace(
            trace,
            answer,
            0,
            0,
            0,
            0,
            []
        )

        print("\nAnswer:")
        print(answer)
        print()

        continue

    context = results["context"]

    retrieval_docs = results["retrieval_docs"]

    retrieval_time = results["retrieval_time"]

    avg_score = results["avg_score"]

    unique_citations = results["citations"]

    end_retrieval_span(
        retrieval_span,
        retrieval_docs,
        retrieval_time
    )

    # =================================================
    # Prompt
    # =================================================

    final_prompt = ENTERPRISE_POLICY_PROMPT.format(
        context=context,
        question=question
    )

    # =================================================
    # Generation
    # =================================================

    generation_span = start_generation_span(
        trace,
        final_prompt,
        "phi3:mini"
    )

    generation_start = time.time()

    try:

        response = llm.invoke(final_prompt)

    except (httpx.ConnectError, ResponseError) as exc:

        end_generation_span(
            generation_span,
            str(exc)
        )
        print("\nCould not complete the request with Ollama.")
        print(f"Details: {exc}")
        print("Run: ollama serve")
        print("Verify model: ollama list")

        continue

    generation_time = (
        time.time() - generation_start
    )

    answer = response.content

    grounding_score = calculate_grounding_score(
        answer,
        context
    )

    end_generation_span(
        generation_span,
        answer
    )

    # Update Trace

    finish_trace(
        trace,
        answer,
        retrieval_time,
        generation_time,
        avg_score,
        grounding_score,
        unique_citations
    )

    # Output

    print("\n" + "=" * 60)
    print("ANSWER")
    print("=" * 60)

    print(answer)

    print("\nSources:")

    for citation in unique_citations:

        print(
            f"- {citation['document']} "
            f"(Page {citation['page']}) "
            f"(Score: {citation['score']:.4f})"
        )

    print("\nMetrics:")
    print(f"- Retrieval Time: {retrieval_time:.3f}s")
    print(f"- Generation Time: {generation_time:.3f}s")
    print(f"- Avg Retrieval Score: {avg_score:.4f}")
    print(f"- Grounding Score: {grounding_score:.4f}")
    if avg_score < 0.6:
        print(
            "⚠️ Low confidence — answer may be unreliable"
        )
    if grounding_score < 0.65:
        print(
            "⚠️ Potential hallucination detected"
         )

    print("=" * 60 + "\n")


# ollama serve 
# Are NIST guidelines legally binding on federal agencies? 
# What law authorizes NIST to develop information security standards and guidelines? 
# Under which act was NIST’s responsibility for information security modernized? 