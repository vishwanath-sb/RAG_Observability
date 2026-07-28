from langchain_huggingface import HuggingFaceEmbeddings


def get_embedding_model():
    """
    Returns the embedding model used throughout the application.
    """

    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )