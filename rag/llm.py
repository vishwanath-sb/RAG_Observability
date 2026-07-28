from langchain_ollama import ChatOllama


def get_llm():
    """
    Returns the configured Ollama LLM.
    """

    return ChatOllama(
        model="phi3:mini",
        temperature=0
    )