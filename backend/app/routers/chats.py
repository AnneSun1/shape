from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.base import get_db
from app.schemas.chat import ChatCreate, ChatOut, ChatCreated
from app.services.auth_service import ensure_user
from app.services.chat_service import create_chat

router = APIRouter(prefix="/chats", tags=["chats"])
security = HTTPBearer()

@router.post("", response_model=ChatCreated, status_code=201, dependencies=[Depends(security)])
def create_chat_route(body: ChatCreate, req: Request, resp: Response, db: Session = Depends(get_db)):
    try:
        user_ext = getattr(req.state, "user_ext", None)
        if not user_ext:
            raise HTTPException(status_code=401, detail="Auth required")

        uid = ensure_user(db, user_ext)
        
        # Backend generates the ID
        cid = create_chat(db, uid, body.title)

        resp.headers["Location"] = f"/chats/{cid}"
        return {"id": cid, "title": body.title}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create chat: {str(e)}")

@router.get("", response_model=list[ChatOut], dependencies=[Depends(security)])
def list_chats(req: Request, db: Session = Depends(get_db)):
    if not req.state.user_ext: raise HTTPException(401, "Auth required")
    rows = db.execute(text("""
      SELECT c.id, c.title, c.created_at AS "createdAt", c.updated_at AS "updatedAt",
             c.last_message_at AS "lastMessageAt", c.message_count AS "messageCount"
      FROM chat c JOIN app_user u ON u.id=c.user_id
      WHERE u.external_id=:ext
      ORDER BY c.updated_at DESC
    """), {"ext": req.state.user_ext})
    return [dict(r._mapping) for r in rows]
