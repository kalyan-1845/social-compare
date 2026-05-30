import os
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

def get_embeddings():
    """Returns the OpenAI embeddings instance configured for text-embedding-3-small."""
    api_key = os.getenv("OPENAI_API_KEY")
    return OpenAIEmbeddings(
        model="text-embedding-3-small",
        openai_api_key=api_key
    )

def get_vectorstore(persist_directory: str = None) -> Chroma:
    """Returns a Chroma vector store instance initialized with the standard embeddings."""
    if not persist_directory:
        persist_directory = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
        
    # Ensure directory path is resolved properly
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if not os.path.isabs(persist_directory):
        persist_directory = os.path.abspath(os.path.join(backend_dir, persist_directory))
        
    embeddings = get_embeddings()
    return Chroma(
        persist_directory=persist_directory,
        embedding_function=embeddings,
        collection_name="creator_videos"
    )
