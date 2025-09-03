import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import get_settings
from app.core.security import SupabaseJWTMiddleware
from app.db.base import engine, Base
from app.db.models import User, Chat, Message  # Import models to register them
from app.routers import health, chats, messages, documents

settings = get_settings()

# Security scheme for Swagger UI
security = HTTPBearer()

app = FastAPI(
    title="RAG Study Guide API",
    description="API for RAG Study Guide with Supabase authentication",
    version="1.0.0",
    openapi_tags=[
        {"name": "health", "description": "Health check endpoints"},
        {"name": "chats", "description": "Chat management endpoints"},
        {"name": "messages", "description": "Message management endpoints"},
        {"name": "documents", "description": "Document management and RAG endpoints"},
    ]
)

app.add_middleware(SupabaseJWTMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.on_event("startup")
def create_tables():
    # dev-only; use Alembic in real deployments
    Base.metadata.create_all(bind=engine)

app.include_router(health.router)
app.include_router(chats.router)
app.include_router(messages.router)
app.include_router(documents.router)
