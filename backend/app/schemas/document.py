from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DocumentStats(BaseModel):
    total_chunks: int
    total_tokens: int
    avg_tokens_per_chunk: float
    min_tokens: int
    max_tokens: int

class DocumentUploadResponse(BaseModel):
    success: bool
    document_id: Optional[str] = None
    total_chunks: int
    stats: DocumentStats
    title: str
    error: Optional[str] = None

class DocumentStatsResponse(BaseModel):
    success: bool
    total_documents: int
    total_chunks: int
    sources: List[str]
    error: Optional[str] = None

class DocumentDeleteResponse(BaseModel):
    success: bool
    message: str
    error: Optional[str] = None

class RAGResponse(BaseModel):
    success: bool
    user_message_id: str
    ai_message_id: str
    ai_response: str
    retrieved_docs: int
    context_used: bool
    error: Optional[str] = None
