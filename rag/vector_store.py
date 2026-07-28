from langchain_chroma import Chroma


def get_vector_store(embeddings):
    """
    Loads the persistent Chroma database.
    """

    return Chroma(
        persist_directory="./chroma_db",
        embedding_function=embeddings
    )