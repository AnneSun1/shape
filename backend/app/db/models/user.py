from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import String
from app.db.base import Base

class User(Base):
    __tablename__ = "app_user"
    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True)
    external_id: Mapped[str | None] = mapped_column(String, unique=True)
    email: Mapped[str | None] = mapped_column(String, unique=True)
