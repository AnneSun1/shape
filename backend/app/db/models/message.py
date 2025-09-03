import enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Text, JSON, TIMESTAMP, ForeignKey, Enum, func
from app.db.base import Base

class MessageRole(str, enum.Enum):
    user="user"; assistant="assistant"; system="system"

class Message(Base):
    __tablename__ = "message"
    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True)
    chat_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("chat.id", ondelete="CASCADE"))
    user_id: Mapped[str | None] = mapped_column(UUID(as_uuid=True), ForeignKey("app_user.id", ondelete="SET NULL"))
    role: Mapped[MessageRole] = mapped_column(Enum(MessageRole, name="message_role"))
    content: Mapped[str] = mapped_column(Text)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    chat = relationship("Chat", back_populates="messages")
