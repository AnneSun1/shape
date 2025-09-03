from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.base import get_db
from app.schemas.message import MessageCreate, MessageOut, MessageResponse, LLMProvidersResponse
from app.services.auth_service import ensure_user
from app.services.chat_service import get_or_create_chat
from app.services.message_service import (
    create_message as create_message_service,
    create_user_message_and_generate_response,
    get_available_llm_providers
)
from app.services.rag_service import rag_service

router = APIRouter(prefix="/messages", tags=["messages"])
security = HTTPBearer()

@router.get("/by-chat/{chat_id}", response_model=list[MessageOut], dependencies=[Depends(security)])
def list_messages(chat_id: str, req: Request, db: Session = Depends(get_db)):
    if not req.state.user_ext: raise HTTPException(401, "Auth required")
    # authorize
    own = db.execute(text("""
      SELECT 1 FROM chat c JOIN app_user u ON u.id=c.user_id
      WHERE c.id=:cid AND u.external_id=:ext
    """), {"cid": chat_id, "ext": req.state.user_ext})
    if own.first() is None: raise HTTPException(403, "No access")
    res = db.execute(text("""
      SELECT id, chat_id AS "chatId", role::text AS role, content, created_at AS "createdAt"
      FROM message WHERE chat_id=:cid ORDER BY created_at ASC
    """), {"cid": chat_id})
    return [dict(r._mapping) for r in res]

@router.post("", response_model=MessageResponse, dependencies=[Depends(security)])
async def create_message(body: MessageCreate, req: Request, db: Session = Depends(get_db)):
    try:
        if not req.state.user_ext: raise HTTPException(401, "Auth required")
        
        user_ext = req.state.user_ext
        uid = ensure_user(db, user_ext)
        
        # Backend decides whether to create new chat or use existing one
        chat_id = get_or_create_chat(db, uid, body.chatId, "New Chat")
        
        # If this is a user message, generate AI response
        if body.role == "user":
            try:
                # Check if RAG should be used (you can add a flag in the request body)
                use_rag = getattr(body, 'useRag', False)
                
                if use_rag:
                    # Use RAG service for enhanced responses
                    result = await rag_service.generate_rag_response(
                        db, chat_id, uid, body.content, body.llmProvider
                    )
                else:
                    # Use the regular function that creates user message and generates AI response
                    result = await create_user_message_and_generate_response(
                        db, chat_id, uid, body.content, body.llmProvider
                    )
                
                # Return the user message with AI response info
                user_message_id = result["user_message_id"]
                
                # Get the created user message
                db_result = db.execute(text("""
                  SELECT id, chat_id AS "chatId", role::text AS role, content, created_at AS "createdAt"
                  FROM message WHERE id = :mid
                """), {"mid": user_message_id})
                
                message_data = db_result.first()
                return {
                    "id": message_data.id,
                    "chatId": message_data.chatId,
                    "role": message_data.role,
                    "content": message_data.content,
                    "createdAt": message_data.createdAt,
                    "aiResponse": result["ai_response"],
                    "aiMessageId": result["ai_message_id"],
                    "success": result.get("success", True)
                }
            except Exception as e:
                # If LLM generation fails, still return the user message
                print(f"LLM generation error: {str(e)}")
                
                # Get the user message that was created
                user_message_id = create_message_service(db, chat_id, uid, "user", body.content)
                
                db_result = db.execute(text("""
                  SELECT id, chat_id AS "chatId", role::text AS role, content, created_at AS "createdAt"
                  FROM message WHERE id = :mid
                """), {"mid": user_message_id})
                
                message_data = db_result.first()
                return {
                    "id": message_data.id,
                    "chatId": message_data.chatId,
                    "role": message_data.role,
                    "content": message_data.content,
                    "createdAt": message_data.createdAt,
                    "aiResponse": "Sorry, I'm having trouble generating a response right now.",
                    "aiMessageId": None,
                    "success": False
                }
        else:
            # For non-user messages (like system messages), just create the message
            message_id = create_message_service(db, chat_id, uid, body.role, body.content)
            
            # Get the created message
            result = db.execute(text("""
              SELECT id, chat_id AS "chatId", role::text AS role, content, created_at AS "createdAt"
              FROM message WHERE id = :mid
            """), {"mid": message_id})
            
            message_data = result.first()
            return {
                "id": message_data.id,
                "chatId": message_data.chatId,
                "role": message_data.role,
                "content": message_data.content,
                "createdAt": message_data.createdAt
            }
            
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create message: {str(e)}")

@router.get("/providers", response_model=LLMProvidersResponse)
def get_llm_providers():
    """Get available LLM providers - no authentication required"""
    return {"providers": get_available_llm_providers()}
