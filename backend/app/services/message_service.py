from uuid import uuid4
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List, Dict
from app.db.transactions import transaction_scope
from app.services.llm_service import llm_service

def create_message(db: Session, chat_id: str, user_id: str, role: str, content: str) -> str:
    """Create a new message and return its ID"""
    with transaction_scope(db) as session:
        mid = str(uuid4())
        
        # Insert message
        session.execute(
            text("""
              INSERT INTO message (id, chat_id, role, content, user_id)
              VALUES (:mid, :cid, :role, :content, :uid)
            """),
            {"mid": mid, "cid": chat_id, "role": role, "content": content, "uid": user_id}
        )
        
        # Update chat counters
        session.execute(
            text("""
              UPDATE chat SET message_count = message_count + 1,
                              last_message_at = now(),
                              updated_at = now()
              WHERE id = :cid
            """),
            {"cid": chat_id}
        )
        
        return mid

async def create_user_message_and_generate_response(
    db: Session, 
    chat_id: str, 
    user_id: str, 
    user_content: str,
    llm_provider: Optional[str] = None
) -> Dict[str, str]:
    """Create a user message and generate an AI response"""
    
    # Create user message
    user_message_id = create_message(db, chat_id, user_id, "user", user_content)
    
    # Get chat history for context
    chat_history = get_chat_history(db, chat_id)
    
    # Generate AI response
    try:
        print(f"Generating AI response with provider: {llm_provider}")
        if not llm_provider:
            llm_provider = "ollama"  # Default to ollama if none specified
            print(f"Using default provider: {llm_provider}")
        print(f"User message: {user_content}")
        print(f"Chat history length: {len(chat_history)}")
        
        ai_response = await llm_service.generate_chat_response(
            user_message=user_content,
            chat_history=chat_history,
            system_prompt="You are a helpful AI assistant for a study guide application. Provide clear, educational responses.",
            provider=llm_provider,
            max_tokens=1000,
            temperature=0.7
        )
        
        print(f"AI response generated: {ai_response[:100]}...")
        
        # Create AI response message
        ai_message_id = create_message(db, chat_id, user_id, "assistant", ai_response)
        
        return {
            "user_message_id": user_message_id,
            "ai_message_id": ai_message_id,
            "ai_response": ai_response,
            "success": True
        }
        
    except Exception as e:
        # If LLM fails, create an error message
        error_message = f"Sorry, I'm having trouble generating a response right now. Please try again later. Error: {str(e)}"
        ai_message_id = create_message(db, chat_id, user_id, "assistant", error_message)
        
        return {
            "user_message_id": user_message_id,
            "ai_message_id": ai_message_id,
            "ai_response": error_message,
            "error": str(e),
            "success": False
        }

def get_chat_history(db: Session, chat_id: str, limit: int = 10) -> List[Dict[str, str]]:
    """Get recent chat history for context"""
    result = db.execute(
        text("""
          SELECT role, content 
          FROM message 
          WHERE chat_id = :cid 
          ORDER BY created_at DESC 
          LIMIT :limit
        """),
        {"cid": chat_id, "limit": limit}
    )
    
    # Convert to OpenAI format and reverse order (oldest first)
    messages = []
    for row in reversed(result.fetchall()):
        messages.append({
            "role": row.role,
            "content": row.content
        })
    
    return messages

def get_available_llm_providers() -> List[str]:
    """Get list of available LLM providers"""
    return llm_service.get_available_providers()
