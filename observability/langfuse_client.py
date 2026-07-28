from dotenv import load_dotenv
from langfuse import Langfuse

# Load environment variables
load_dotenv()

# Create a single Langfuse client instance
langfuse = Langfuse()


def get_langfuse_client():
    """
    Returns the singleton Langfuse client.
    """
    return langfuse