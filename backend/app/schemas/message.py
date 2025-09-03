from pydantic import BaseModel
from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

Role = Literal["user","assistant","system"]
LLMProvider = Literal["openai", "anthropic", "ollama", "huggingface"]

class MessageCreate(BaseModel):
    chatId: Optional[UUID] = None  # Optional - if not provided, new chat will be created
    role: Role
    content: str
    llmProvider: Optional[LLMProvider] = None  # Optional LLM provider for user messages
    useRag: Optional[bool] = False  # Whether to use RAG for enhanced responses

class MessageOut(BaseModel):
    id: UUID
    chatId: UUID
    role: Role
    content: str
    createdAt: datetime

class MessageResponse(BaseModel):
    id: UUID
    chatId: UUID
    role: Role
    content: str
    createdAt: datetime
    aiResponse: Optional[str] = None
    aiMessageId: Optional[UUID] = None
    success: Optional[bool] = None

class LLMProvidersResponse(BaseModel):
    providers: list[str]
