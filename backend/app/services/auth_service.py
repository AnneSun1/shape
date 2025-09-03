from sqlalchemy.orm import Session
from sqlalchemy import text
from uuid import uuid4
from app.db.transactions import transaction_scope

def ensure_user(session: Session, external_id: str) -> str:
    """creates app_user if not exists; returns id (uuid)"""
    with transaction_scope(session) as db:
        db.execute(text("""
            INSERT INTO app_user(id, external_id)
            VALUES (:id, :ext)
            ON CONFLICT (external_id) DO NOTHING
        """), {"id": str(uuid4()), "ext": external_id})

        r = db.execute(text("SELECT id FROM app_user WHERE external_id=:ext"), {"ext": external_id})
        return r.scalar_one()
