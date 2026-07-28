import os
import time


def retrieve_documents(db, question: str, k: int = 4):
    """
    Retrieves relevant documents from ChromaDB and prepares
    context, citations and observability metadata.
    """

    retrieval_start = time.time()

    results = db.similarity_search_with_score(
        question,
        k=k
    )

    retrieval_time = time.time() - retrieval_start

    if not results:
        return {
            "results": [],
            "context": "",
            "citations": [],
            "retrieval_docs": [],
            "retrieval_time": retrieval_time,
            "avg_score": 0.0
        }

    context_blocks = []
    citations = []
    retrieval_docs = []

    print("\n--- Retrieval Results ---")

    for i, (doc, score) in enumerate(results):

        source = os.path.basename(
            doc.metadata.get("source", "Unknown")
        )

        page = doc.metadata.get("page")

        if page is not None:
            page += 1

        print(
            f"[{i+1}] {source} "
            f"(Page {page}) "
            f"- Score: {score:.4f}"
        )

        retrieval_docs.append(
            {
                "document": source,
                "page": page,
                "score": float(score)
            }
        )

        citations.append(
            {
                "document": source,
                "page": page,
                "score": float(score)
            }
        )

        context_blocks.append(
            f"""
Source: {source}
Page: {page}
Score: {score:.4f}

{doc.page_content}
"""
        )

    # Remove duplicate citations

    unique_citations = []
    seen = set()

    for citation in citations:

        key = (
            citation["document"],
            citation["page"]
        )

        if key not in seen:
            seen.add(key)
            unique_citations.append(citation)

    avg_score = (
        sum(c["score"] for c in citations)
        / len(citations)
    )

    return {
        "results": results,
        "context": "\n\n".join(context_blocks),
        "citations": unique_citations,
        "retrieval_docs": retrieval_docs,
        "retrieval_time": retrieval_time,
        "avg_score": avg_score
    }