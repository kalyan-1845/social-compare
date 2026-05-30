import os
import json
import logging
from typing import Dict, Any, List, AsyncGenerator
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI
from backend.db.chroma import get_vectorstore, get_embeddings
from backend.utils.helpers import calculate_engagement_rate

logger = logging.getLogger(__name__)

def ingest_videos_to_vectorstore(youtube_data: Dict[str, Any], instagram_data: Dict[str, Any]) -> None:
    """
    Chunks transcripts of YouTube (Video A) and Instagram (Video B),
    attaches standard metadata, and inserts them into ChromaDB.
    """
    logger.info("Initializing vectorstore ingestion...")
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY is not set. Ingestion to ChromaDB is bypassed. Metrics compare dashboard will function, but RAG chat will require an API key.")
        return
        
    db = get_vectorstore()

    
    # Clear existing documents to avoid cross-contamination in MVP testing
    try:
        # Chroma API for deleting entire collection to start fresh
        db.delete_collection()
        logger.info("Cleared previous database collections.")
        # Re-initialize db client after deletion
        db = get_vectorstore()
    except Exception as e:
        logger.warning(f"Error resetting database collection: {str(e)}")

    documents: List[Document] = []

    # 1. Chunk YouTube Video (Video A)
    yt_creator = youtube_data.get("creator", "YouTube Creator")
    yt_segments = youtube_data.get("transcript_segments", [])
    
    logger.info(f"Chunking YouTube video chunks (Video A)...")
    if yt_segments:
        for seg in yt_segments:
            text = seg.get("text", "")
            timestamp = seg.get("timestamp", "00:00")
            
            documents.append(Document(
                page_content=text,
                metadata={
                    "video_id": "A",
                    "creator": yt_creator,
                    "source_platform": "YouTube",
                    "timestamp": timestamp
                }
            ))
    else:
        # Fallback raw text splitter
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
        chunks = splitter.split_text(youtube_data.get("transcript", ""))
        for chunk in chunks:
            documents.append(Document(
                page_content=chunk,
                metadata={
                    "video_id": "A",
                    "creator": yt_creator,
                    "source_platform": "YouTube",
                    "timestamp": "00:00"
                }
            ))

    # 2. Chunk Instagram Reel (Video B)
    insta_creator = instagram_data.get("creator", "Instagram Creator")
    insta_segments = instagram_data.get("transcript_segments", [])
    
    logger.info(f"Chunking Instagram Reel chunks (Video B)...")
    if insta_segments:
        for seg in insta_segments:
            text = seg.get("text", "")
            timestamp = seg.get("timestamp", "00:00")
            
            documents.append(Document(
                page_content=text,
                metadata={
                    "video_id": "B",
                    "creator": insta_creator,
                    "source_platform": "Instagram",
                    "timestamp": timestamp
                }
            ))
    else:
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
        chunks = splitter.split_text(instagram_data.get("transcript", ""))
        for chunk in chunks:
            documents.append(Document(
                page_content=chunk,
                metadata={
                    "video_id": "B",
                    "creator": insta_creator,
                    "source_platform": "Instagram",
                    "timestamp": "00:00"
                }
            ))

    # 3. Add to ChromaDB vector store
    logger.info(f"Ingesting {len(documents)} document chunks into ChromaDB...")
    db.add_documents(documents)
    logger.info("ChromaDB vector ingestion completed.")


async def generate_chat_stream(
    question: str, 
    chat_history: List[Dict[str, str]],
    video_a_meta: Dict[str, Any],
    video_b_meta: Dict[str, Any]
) -> AsyncGenerator[str, None]:
    """
    Performs context retrieval and yields SSE responses for dynamic streaming:
    1. Sends retrieved metadata citations first.
    2. Streams token responses from gpt-4o-mini.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        yield f"data: {json.dumps({'error': 'OPENAI_API_KEY environment variable is not configured. Please supply an OpenAI API Key in the backend config.'})}\n\n"
        yield "data: [DONE]\n\n"
        return

    try:
        # Retrieve context from ChromaDB
        db = get_vectorstore()
        retrieved_docs = db.similarity_search(question, k=5)
        
        # Structure citations to return to frontend
        citations = []
        unique_citations = set()
        for doc in retrieved_docs:
            meta = doc.metadata
            cit_key = f"{meta.get('video_id')}_{meta.get('timestamp')}"
            if cit_key not in unique_citations:
                unique_citations.add(cit_key)
                citations.append({
                    "video_id": meta.get("video_id"),
                    "source_platform": meta.get("source_platform"),
                    "creator": meta.get("creator"),
                    "timestamp": meta.get("timestamp"),
                    "content": doc.page_content[:150] + "..." if len(doc.page_content) > 150 else doc.page_content
                })
        
        # Send citations first in SSE stream
        yield f"data: {json.dumps({'type': 'citations', 'data': citations})}\n\n"
        
        # Build context prompt
        context_str = ""
        for i, doc in enumerate(retrieved_docs):
            m = doc.metadata
            context_str += f"[{i+1}] Video {m.get('video_id')} ({m.get('source_platform')}) by {m.get('creator')} at {m.get('timestamp')}:\n{doc.page_content}\n\n"
            
        # Format metrics overview context for the LLM
        metrics_ctx = (
            f"Comparison Data:\n"
            f"- Video A (YouTube) by {video_a_meta.get('creator')}:\n"
            f"  Title: {video_a_meta.get('title')}\n"
            f"  Views: {video_a_meta.get('views'):,}, Likes: {video_a_meta.get('likes'):,}, Comments: {video_a_meta.get('comments'):,}\n"
            f"  Subscriber Count: {video_a_meta.get('follower_count', 0):,}\n"
            f"  Engagement Rate: {video_a_meta.get('engagement_rate')}%\n"
            f"  Upload Date: {video_a_meta.get('upload_date')}, Duration: {video_a_meta.get('duration')}s, Tags: {video_a_meta.get('hashtags')}\n\n"
            f"- Video B (Instagram) by {video_b_meta.get('creator')}:\n"
            f"  Title: {video_b_meta.get('title')}\n"
            f"  Views: {video_b_meta.get('views'):,}, Likes: {video_b_meta.get('likes'):,}, Comments: {video_b_meta.get('comments'):,}\n"
            f"  Follower Count: {video_b_meta.get('follower_count', 0):,}\n"
            f"  Engagement Rate: {video_b_meta.get('engagement_rate')}%\n"
            f"  Duration: {video_b_meta.get('duration')}s, Tags: {video_b_meta.get('hashtags')}\n"
        )
        
        # System instructions
        system_prompt = (
            "You are a premium AI Creator Strategist. Your goal is to analyze, compare, and break down performance strategies of two videos:\n"
            "Video A is a YouTube Video.\n"
            "Video B is an Instagram Reel.\n\n"
            "Use the provided Metrics Data and retrieved Transcript Context to deliver incredibly precise, analytical, and actionable answers.\n"
            "Whenever referring to the transcripts, try to cite the timestamps (e.g. at 00:15 in Video A...).\n"
            "Address conversational queries using memory from previous chat turns. Keep a professional, encouraging, and sharp strategic tone.\n"
            "Make direct, objective comparisons of their hooks, engagement metrics, formatting, and structural retention value."
        )
        
        # Build messages
        messages = [
            {"role": "system", "content": system_prompt},
        ]
        
        # Map conversation history
        for msg in chat_history:
            role = "user" if msg.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": msg.get("content", "")})
            
        # Append user query with dynamic context
        user_content = (
            f"{metrics_ctx}\n"
            f"Retrieved Transcript Segments:\n{context_str}\n"
            f"User Question: {question}"
        )
        messages.append({"role": "user", "content": user_content})
        
        # Trigger streaming with ChatOpenAI
        chat_model = ChatOpenAI(
            model="gpt-4o-mini",
            openai_api_key=api_key,
            streaming=True,
            temperature=0.3
        )
        
        logger.info("Initiating OpenAI Chat stream...")
        async for chunk in chat_model.astream(messages):
            if chunk.content:
                yield f"data: {json.dumps({'type': 'token', 'data': chunk.content})}\n\n"
                
    except Exception as e:
        logger.error(f"Error in chat streaming engine: {str(e)}")
        yield f"data: {json.dumps({'type': 'error', 'data': f'Streaming error: {str(e)}'})}\n\n"
        
    yield "data: [DONE]\n\n"
