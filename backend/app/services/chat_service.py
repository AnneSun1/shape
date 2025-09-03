from uuid import uuid4
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from app.db.transactions import transaction_scope

def create_chat(db: Session, user_id: str, title: str) -> str:
    """Create a new chat and return its ID"""
    with transaction_scope(db) as session:
        cid = str(uuid4())
        session.execute(
            text("""
              INSERT INTO chat (id, user_id, title)
              VALUES (:id, :uid, :title)
            """),
            {"id": cid, "uid": user_id, "title": title},
        )
        return cid

def get_or_create_chat(db: Session, user_id: str, chat_id: Optional[str] = None, title: str = "New Chat") -> str:
    """Get existing chat or create new one"""
    with transaction_scope(db) as session:
        if chat_id:
            # Check if chat exists and belongs to user
            result = session.execute(
                text("SELECT id FROM chat WHERE id = :cid AND user_id = :uid"),
                {"cid": chat_id, "uid": user_id}
            )
            if result.first():
                return chat_id
            else:
                # Chat doesn't exist or doesn't belong to user, create new one
                return create_chat(session, user_id, title)
        else:
            # No chat_id provided, create new chat
            return create_chat(session, user_id, title)

