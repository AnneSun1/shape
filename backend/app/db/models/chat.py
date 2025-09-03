from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Text, Integer, TIMESTAMP, ForeignKey, Boolean, func
from app.db.base import Base

class Chat(Base):
    __tablename__ = "chat"
    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True)
    user_id: Mapped[str | None] = mapped_column(UUID(as_uuid=True), ForeignKey("app_user.id", ondelete="SET NULL"))
    title: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    last_message_at: Mapped[str | None] = mapped_column(TIMESTAMP(timezone=True))
    message_count: Mapped[int] = mapped_column(Integer, default=0)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)

    messages = relationship("Message", back_populates="chat", cascade="all, delete")
