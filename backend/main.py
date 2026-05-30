import logging
import os
import sys
from os.path import dirname, abspath

# Add parent directory to sys.path to allow absolute imports of the backend package
backend_dir = dirname(abspath(__file__))
parent_dir = dirname(backend_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load local environment settings
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("backend.main")

# Initialize FastAPI app
app = FastAPI(
    title="Creator Video Analysis RAG API",
    description="FastAPI backend featuring Scrapers, Whisper Speech-to-Text, and OpenAI ChromaDB RAG comparison engine.",
    version="1.0.0"
)

# Configure CORS to allow access from local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins; can restrict to localhost:3000 in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and mount the routers
from backend.api.router import router as api_router
app.include_router(api_router)

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": "Creator Video Analysis RAG Chatbot Backend",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting server on http://{host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
