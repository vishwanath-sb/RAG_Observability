from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

grounding_model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)


def calculate_grounding_score(
    answer: str,
    context: str
):
    """
    Calculates semantic similarity between
    the generated answer and retrieved context.
    """

    answer_embedding = grounding_model.encode(
        [answer]
    )

    context_embedding = grounding_model.encode(
        [context]
    )

    score = cosine_similarity(
        answer_embedding,
        context_embedding
    )[0][0]

    return float(score)