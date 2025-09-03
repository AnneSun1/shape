# app/schemas/chat.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
class ChatCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)

    model_config = {
        "extra": "forbid",
        "str_strip_whitespace": True
    }

class ChatCreated(BaseModel):
    id: UUID
    title: str

class ChatOut(BaseModel):
    id: UUID
    title: str
    createdAt: datetime
    updatedAt: datetime
    lastMessageAt: Optional[datetime] = None
    messageCount: int
